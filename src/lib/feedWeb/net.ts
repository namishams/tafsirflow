// Server-side helpers of the web feed's resolver: a polite JSON fetch (timeout, User-Agent, Next fetch cache), a small
// in-process cache with in-flight de-duplication (so repeated pages are cheap even where Next's data cache is off, e.g.
// under `dynamic = "force-dynamic"`), a per-host gap for Wikimedia, bounded concurrency and plain-text helpers.
// Port of mobile/src/content/sources/net.ts (stripHtml, excerpt, settle) for the server.

/** Wikimedia asks for a descriptive User-Agent with a contact (same string as the app's mobile/src/content/extra/wiki.ts) */
export const UA = "QuranMasterclass/1.0 (https://quranmasterclass.com; contact@namishams.com)";
/** every other source gets the name and site only, not the contact address */
const UA_PLAIN = "QuranMasterclass/1.0 (https://quranmasterclass.com)";
const uaFor = (url: string) => (/^https:\/\/[a-z0-9.-]*(wikipedia|wikimedia|wikidata)\.org\//i.test(url) ? UA : UA_PLAIN);
export const HOUR = 3_600_000;
export const DAY = 24 * HOUR;

// ---------- in-process cache ----------
type Entry = { at: number; ttl: number; v: unknown };
const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const MAX_ENTRIES = 8000;

function put(key: string, v: unknown, ttl: number) {
  store.delete(key);
  store.set(key, { at: Date.now(), ttl, v });
  if (store.size > MAX_ENTRIES) {
    // drop the oldest tenth (Map keeps insertion order)
    let n = Math.ceil(MAX_ENTRIES / 10);
    for (const k of store.keys()) { store.delete(k); if (--n <= 0) break; }
  }
}
/** the cached value (null counts as a value) or undefined when absent / expired */
export function peek<T>(key: string): T | null | undefined {
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() - e.at > e.ttl) { store.delete(key); return undefined; }
  return e.v as T | null;
}
export const poke = (key: string, v: unknown, ttl: number) => put(key, v, ttl);

/**
 * Loads once per `ttl` and key; concurrent callers share one load. A failed or empty (null) load is remembered for
 * `failTtl` only, so a source that is down is not hammered and recovers by itself. Never throws.
 */
export async function memo<T>(key: string, ttl: number, load: () => Promise<T | null>, failTtl = 5 * 60_000): Promise<T | null> {
  const hit = peek<T>(key);
  if (hit !== undefined) return hit;
  const running = inflight.get(key);
  if (running) return running as Promise<T | null>;
  const p = (async () => {
    try {
      const v = await load();
      put(key, v ?? null, v === null || v === undefined ? failTtl : ttl);
      return v ?? null;
    } catch {
      put(key, null, failTtl);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

/** rejects after `ms` (the work itself carries on and may still fill a cache); for calls into lib/quran that have no timeout of their own */
export function withTimeout<T>(p: Promise<T>, ms = 8000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

// ---------- fetch ----------
export type GetOpts = { revalidate?: number; timeoutMs?: number; headers?: Record<string, string>; text?: boolean };

/** GET and parse JSON (or text); null on 404, throws on other errors and on timeouts (6 s) */
export async function getJson<T>(url: string, o: GetOpts = {}): Promise<T | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": uaFor(url), "Api-User-Agent": uaFor(url), Accept: o.text ? "text/plain" : "application/json", ...o.headers },
    signal: AbortSignal.timeout(o.timeoutMs ?? 6000),
    next: { revalidate: o.revalidate ?? 86_400 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  const text = await res.text();
  if (o.text) return text as unknown as T;
  return JSON.parse(text.replace(/^﻿/, "")) as T;
}

// one request at a time per host with a minimum gap: Wikimedia's etiquette (no parallel bursts)
const lanes = new Map<string, { tail: Promise<unknown>; last: number }>();
export async function polite<T>(host: string, gapMs: number, fn: () => Promise<T>): Promise<T> {
  const lane = lanes.get(host) ?? { tail: Promise.resolve(), last: 0 };
  lanes.set(host, lane);
  const run = lane.tail.catch(() => undefined).then(async () => {
    const wait = lane.last + gapMs - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lane.last = Date.now();
    return fn();
  });
  lane.tail = run;
  return run;
}

/** map with at most `limit` tasks at once; order kept; a task that throws gives null */
export async function pool<T, R>(items: readonly T[], limit: number, fn: (item: T, index: number) => Promise<R | null>): Promise<(R | null)[]> {
  const out: (R | null)[] = new Array(items.length).fill(null);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      try { out[i] = await fn(items[i], i); } catch { out[i] = null; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

// ---------- plain text ----------
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

/** Markdown-light to plain text (**bold**, [text](url), leading list or heading marks) for the card text */
export function plain(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}
