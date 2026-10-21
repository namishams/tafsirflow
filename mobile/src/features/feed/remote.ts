import { useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router, type Href } from "expo-router";
import { SITE } from "@/lib/api";
import { readTradition } from "@/lib/tradition";
import { getVerseByKey } from "@/lib/quran";
import { calText, hijriMonthName } from "@/web/hijri";
import { shiaHadith, sunniHadith } from "@/features/hadith/data";
import type { SourceItem } from "@/content/sources";
import type { LibItem, LibKind } from "./library";

// The server-driven part of the feed (website /api/feed/*, contracts in src/lib/feed/types.ts of the website).
// Every answer is cached with its ETag in AsyncStorage; offline the last good answer is used, without one the local
// defaults (library.ts, Promo.tsx, Rings.tsx) stay in charge. Server items only add to the local pool, never replace it.

// ---- contracts (mirror of the website's src/lib/feed/types.ts) ----
export type FeedTradition = "all" | "sunni" | "shia";
export type FeedConfig = {
  version: number;
  updatedAt: string;
  minAppBuild: number;
  kindWeights: Record<string, number>;
  enabledKinds: string[];
  promo: {
    frequencyCap: { everyNItems: number; maxPerSession: number; maxPerDay: number };
    items: { id: string; title: string; image?: string; deeplink: string }[];
  };
  topicChipGroups: { id: string; label: string; kinds: string[] }[];
  flags: Record<string, boolean>;
  announcements: { id: string; title: string; image?: string; deeplink?: string; startsAt: string; endsAt: string }[];
};
export type FeedItemKind = "editorial" | "announcement" | "verse-of-day" | "hadith-of-day" | "islamic-date" | "featured-surah";
export type FeedItem = {
  id: string;
  kind: FeedItemKind;
  postKind?: string;
  title: string;
  body: string;
  arabic?: string;
  image?: string;
  source: string;
  sourceUrl: string;
  tradition: FeedTradition;
  lang: string;
  publishedAt: string;
  verseKey?: string;
  hadithId?: string;
  surah?: number;
  hijri?: { y: number; m: number; d: number; monthName: string; event?: string; daysToEvent?: number };
  deeplink?: string;
};
export type FeedNewResponse = { items: FeedItem[]; generatedAt: string };
export type FeedPageResponse = { items: FeedItem[]; nextCursor: string | null; day: string };

// ---- HTTP with ETag cache ----
type Cached<T> = { etag: string | null; data: T; at: number };
const CACHE = "qmc.feed-remote:";

async function readCache<T>(key: string): Promise<Cached<T> | null> {
  try { const raw = await AsyncStorage.getItem(CACHE + key); return raw ? (JSON.parse(raw) as Cached<T>) : null; } catch { return null; }
}
async function writeCache<T>(key: string, v: Cached<T>) {
  try { await AsyncStorage.setItem(CACHE + key, JSON.stringify(v)); } catch { /* storage full: next start fetches again */ }
}

/** GET /api/feed/<path>; 304 → cached body; network/server error → last good body (or null) */
async function getFeed<T>(path: string, params: Record<string, string | undefined>, cacheKey: string): Promise<T | null> {
  const q = Object.entries(params).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join("&");
  const cached = await readCache<T>(cacheKey);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${SITE}/api/feed/${path}${q ? `?${q}` : ""}`, {
      headers: { Accept: "application/json", "x-qmc-app": Platform.OS, ...(cached?.etag ? { "If-None-Match": cached.etag } : {}) },
      signal: ctrl.signal,
    }).finally(() => clearTimeout(timer));
    if (res.status === 304 && cached) return cached.data;
    if (!res.ok) return cached?.data ?? null;
    const data = (await res.json()) as T;
    void writeCache(cacheKey, { etag: res.headers.get("etag"), data, at: Date.now() });
    return data;
  } catch {
    return cached?.data ?? null;
  }
}

const tradition = (): FeedTradition => { try { const t = readTradition(); return t === "sunni" || t === "shia" ? t : "all"; } catch { return "all"; } };
const base = (lang: string) => ({ locale: lang, tradition: tradition() });

export const fetchFeedConfig = (lang: string) => getFeed<FeedConfig>("config", base(lang), `config|${lang}|${tradition()}`);
export const fetchFeedNew = (lang: string, since?: string) => getFeed<FeedNewResponse>("new", { ...base(lang), since }, `new|${lang}|${tradition()}`);
export const fetchFeedPage = (lang: string, cursor: string | null) => getFeed<FeedPageResponse>("page", { ...base(lang), cursor: cursor ?? undefined }, `page|${lang}|${tradition()}|${cursor ?? "0"}`);

// ---- the current config (null = offline without cache: local defaults) ----
let config: FeedConfig | null = null;
let configLang = "";
const subs = new Set<() => void>();
export const remoteConfig = () => config;
export const onRemoteConfig = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
export function useRemoteConfig(): FeedConfig | null {
  const [c, set] = useState(config);
  useEffect(() => onRemoteConfig(() => set(config)), []);
  return c;
}
export async function loadRemoteConfig(lang: string): Promise<FeedConfig | null> {
  const c = await fetchFeedConfig(lang);
  if (c && typeof c.version === "number") {
    if (!config || c.version !== config.version || configLang !== lang || JSON.stringify(c) !== JSON.stringify(config)) { config = c; configLang = lang; subs.forEach((f) => f()); }
  }
  return config;
}
/** a flag of the remote config; offline/unknown = on (the local behaviour) */
export const flagOn = (name: string) => config?.flags?.[name] ?? true;

/** this binary's build number (iOS buildNumber / Android versionCode), 0 if unknown */
export function appBuild(): number {
  const n = Platform.OS === "ios" ? Constants.expoConfig?.ios?.buildNumber : Constants.expoConfig?.android?.versionCode;
  const v = Number(n ?? 0);
  return Number.isFinite(v) ? v : 0;
}
export const updateAvailable = (c: FeedConfig | null) => !!c && appBuild() > 0 && appBuild() < c.minAppBuild;

/** opens quranmasterclass://<path> (or a path) inside the app; other URLs are ignored */
export function openDeeplink(url?: string) {
  if (!url) return;
  const m = /^quranmasterclass:\/\/(.*)$/.exec(url) ?? /^(\/.*)$/.exec(url);
  if (!m) return;
  router.push(`/${m[1].replace(/^\/+/, "")}` as Href);
}

// ---- resolving server items into library posts (text always from the sources) ----
const HADITH_ALIAS: Record<string, string> = { nawawi40: "nawawi" };

/** "bukhari:1", "nawawi40:13", "thaqalayn:<bookId>:<n>" → the hadith from the app's sources, or null */
export async function resolveHadith(id: string, lang: string) {
  const parts = id.split(":");
  if (parts[0] === "thaqalayn" && parts.length === 3) { const n = Number(parts[2]); return Number.isInteger(n) ? shiaHadith(parts[1], n, lang).catch(() => null) : null; }
  if (parts.length !== 2) return null;
  const n = Number(parts[1]);
  return Number.isInteger(n) ? sunniHadith(HADITH_ALIAS[parts[0]] ?? parts[0], n, lang).catch(() => null) : null;
}

/** "editorial" items carry the editor's sub-kind; map everything to a library kind the post renderer knows */
function libKind(i: FeedItem): LibKind {
  if (i.kind === "verse-of-day") return "tafsir";
  if (i.kind === "featured-surah") return "surah-info";
  if (i.kind === "hadith-of-day") return i.tradition === "shia" ? "shia-hadith" : "hadith-of-day";
  if (i.kind === "islamic-date") return "islamic-date";
  if (i.hadithId) return i.tradition === "shia" ? "shia-hadith" : "hadith";
  if (i.verseKey) return "tafsir";
  return "history";
}

/** one server item as a library item (null when its scripture could not be loaded: never shown without its text) */
export async function resolveItem(i: FeedItem, lang: string): Promise<(LibItem & { remote: true; deeplink?: string }) | null> {
  const out: SourceItem = { id: `rf-${i.id}`, kind: libKind(i) as SourceItem["kind"], title: i.title, body: i.body, arabic: i.arabic, lang: i.lang, source: i.source, sourceUrl: i.sourceUrl, tradition: i.tradition, date: i.publishedAt.slice(0, 10), tags: ["remote", i.kind] };
  try {
    if (i.verseKey) {
      const v = await getVerseByKey(i.verseKey, lang);
      if (!v?.text_uthmani) return null;
      out.arabic = v.text_uthmani;
      out.body = [v.translation, i.kind === "verse-of-day" ? "" : i.body].filter(Boolean).join("\n\n");
      out.title = `${i.title} · ${i.verseKey}`;
    } else if (i.hadithId) {
      const h = await resolveHadith(i.hadithId, lang);
      if (!h) return null;
      out.arabic = h.arabic;
      out.body = [h.text, i.kind === "hadith-of-day" ? "" : i.body].filter(Boolean).join("\n\n");
      out.source = h.reference || i.source;
      if (h.url) out.sourceUrl = h.url;
    } else if (i.kind === "islamic-date" && i.hijri) {
      const c = calText(lang);
      const ev = i.hijri.event ? c.ev(i.hijri.event)?.name : undefined;
      out.title = `${i.hijri.d} ${hijriMonthName(i.hijri.m, lang)} ${i.hijri.y}`;
      out.body = ev && i.hijri.daysToEvent !== undefined ? `${ev} · ${Intl.NumberFormat(lang).format(i.hijri.daysToEvent)}` : i.body;
    }
  } catch { return null; }
  return { ...out, kind: out.kind, remote: true, deeplink: i.deeplink } as LibItem & { remote: true; deeplink?: string };
}

/** resolves a list, dropping unresolvable items and duplicates (by server id) */
export async function resolveAll(items: FeedItem[], lang: string, known: Set<string>) {
  const fresh = items.filter((i) => !known.has(i.id));
  fresh.forEach((i) => known.add(i.id));
  const got = await Promise.all(fresh.map((i) => resolveItem(i, lang)));
  return got.filter((x): x is NonNullable<typeof x> => !!x);
}
