import AsyncStorage from "@react-native-async-storage/async-storage";

// Small bounded cache (memory + AsyncStorage) and a polite fetch: per-host rate limit, timeout, in-flight
// de-duplication, stale fallback when offline.
const PREFIX = "tf:src:";
const INDEX_KEY = PREFIX + "__index";
const MAX_ENTRIES = 300;
const MAX_ENTRY_CHARS = 400_000;

type Entry = { t: number; v: unknown };
const mem = new Map<string, Entry>();
let index: string[] | null = null;

async function loadIndex(): Promise<string[]> {
  if (index) return index;
  try {
    const raw = await AsyncStorage.getItem(INDEX_KEY);
    index = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    index = [];
  }
  return index;
}

export async function cacheGet<T>(key: string): Promise<{ value: T; age: number } | null> {
  const m = mem.get(key);
  if (m) return { value: m.v as T, age: Date.now() - m.t };
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const e = JSON.parse(raw) as Entry;
    mem.set(key, e);
    return { value: e.v as T, age: Date.now() - e.t };
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  const e: Entry = { t: Date.now(), v: value };
  mem.set(key, e);
  if (mem.size > 200) mem.delete(mem.keys().next().value as string);
  try {
    const raw = JSON.stringify(e);
    if (raw.length > MAX_ENTRY_CHARS) return;
    const idx = (await loadIndex()).filter((k) => k !== key);
    idx.push(key);
    const evict = idx.length > MAX_ENTRIES ? idx.splice(0, idx.length - MAX_ENTRIES) : [];
    index = idx;
    await AsyncStorage.setItem(PREFIX + key, raw);
    if (evict.length) await AsyncStorage.multiRemove(evict.map((k) => PREFIX + k));
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(idx));
  } catch {
    // storage full or unavailable: memory cache still works
  }
}

const MIN_GAP_MS = 300;
const lastCall = new Map<string, number>();
const queues = new Map<string, Promise<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

function host(url: string): string {
  const m = /^https?:\/\/([^/]+)/.exec(url);
  return m ? m[1] : url;
}

async function rateLimited<T>(url: string, fn: () => Promise<T>): Promise<T> {
  const h = host(url);
  const prev = queues.get(h) ?? Promise.resolve();
  const run = prev.catch(() => undefined).then(async () => {
    const wait = (lastCall.get(h) ?? 0) + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastCall.set(h, Date.now());
    return fn();
  });
  queues.set(h, run);
  return run;
}

export class HttpError extends Error {
  constructor(public status: number, url: string) {
    super(`HTTP ${status} for ${url}`);
  }
}

async function rawFetch(url: string, asText: boolean, timeoutMs: number): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: asText ? "text/plain" : "application/json" } });
    if (!res.ok) throw new HttpError(res.status, url);
    const text = await res.text();
    if (asText) return text;
    return JSON.parse(text.replace(/^﻿/, ""));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch JSON (or text) with cache. Fresh cache (< ttlMs) is returned without network; on network failure a stale
 * cached value is returned; otherwise the error propagates. `transform` shrinks the payload before caching.
 */
export async function cachedFetch<T>(
  url: string,
  opts: { ttlMs: number; text?: boolean; timeoutMs?: number; transform?: (raw: any) => T; key?: string },
): Promise<T> {
  const key = opts.key ?? url;
  const hit = await cacheGet<T>(key);
  if (hit && hit.age < opts.ttlMs) return hit.value;
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const p = (async () => {
    try {
      const raw = await rateLimited(url, () => rawFetch(url, !!opts.text, opts.timeoutMs ?? 15_000));
      const value = opts.transform ? opts.transform(raw) : (raw as T);
      await cacheSet(key, value);
      return value;
    } catch (e) {
      if (hit) return hit.value;
      throw e;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

export const DAY = 86_400_000;

/** Deterministic PRNG (mulberry32) seeded from a string. */
export function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<(br|\/p|\/h\d|\/li)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();
}

export function excerpt(text: string, max = 600): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("\n"));
  return (end > max * 0.5 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, "")) + " …";
}

/** Run tasks with limited concurrency, dropping failures. */
export async function settle<T>(tasks: (() => Promise<T | null>)[], limit = 3): Promise<T[]> {
  const out: (T | null)[] = new Array(tasks.length).fill(null);
  let i = 0;
  const worker = async () => {
    while (i < tasks.length) {
      const n = i++;
      try {
        out[n] = await tasks[n]();
      } catch {
        out[n] = null;
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return out.filter((x): x is T => x != null);
}
