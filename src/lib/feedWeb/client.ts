// Browser side of the website feed: the per-browser seed of the server's shuffle, the saved place in the endless stream,
// the 7-day "seen" window and the page requests. Mirrors mobile/src/features/feed/remote.ts (installSeed, savedCorpusCursor,
// fetchCorpusPage) and seen.ts; keys are the app's keys ("qmc.feed-seed", "qmc.feed-corpus-cursor", "qmc.feed-seen").
import { readJSON, writeJSON } from "@/lib/learn/store";
import type { WebFeedPage, WebTopic } from "./types";

const SEED_KEY = "qmc.feed-seed";
const CURSOR_KEY = "qmc.feed-corpus-cursor";
const SEEN_KEY = "qmc.feed-seen";
const LAST_KEY = "qmc.feed-last-visit";

/** a random id of this browser for the server's shuffle (no account, nothing personal); created once */
export function installSeed(): string {
  const have = readJSON<string>(SEED_KEY, "");
  if (/^[A-Za-z0-9_-]{4,32}$/.test(have)) return have;
  const rnd = typeof crypto !== "undefined" && crypto.getRandomValues ? Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]) : Array.from({ length: 12 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]);
  const seed = rnd.join("");
  writeJSON(SEED_KEY, seed, true);
  return seed;
}

/** where the stream stopped, per language, tradition and topic (the next visit continues there) */
export const savedCursor = (key: string): string | null => readJSON<Record<string, string>>(CURSOR_KEY, {})[key] ?? null;
export function saveCursor(key: string, cursor: string | null) {
  const all = readJSON<Record<string, string>>(CURSOR_KEY, {});
  if (cursor) all[key] = cursor; else delete all[key];
  writeJSON(CURSOR_KEY, all, true);
}

// ---------- the topics → corpus kinds (a topic chip narrows the server stream; "all" is the whole mix) ----------
export type TopicChoice = "all" | WebTopic;
/** the corpus kinds that make up a topic; `topic` is the row topic those kinds are filtered by (the server's feed_items.topic) */
export const TOPIC_QUERY: Record<WebTopic, { kinds: string[]; topic?: string }> = {
  verses: { kinds: ["verse", "word"] },
  tafsir: { kinds: ["tafsir", "word", "lemma", "maqasid", "carousel", "wisdom"], topic: "tafsir" },
  hadith: { kinds: ["hadith", "shia-hadith", "quiz", "carousel", "wisdom"], topic: "hadith" },
  duas: { kinds: ["dua", "wiki", "course", "carousel", "wisdom"], topic: "duas" },
  prayer: { kinds: ["wiki", "course", "quiz", "carousel", "wisdom"], topic: "prayer" },
  seerah: { kinds: ["wiki", "course", "quiz", "carousel", "wisdom"], topic: "seerah" },
  quran: { kinds: ["quiz", "mutashabihat", "wiki", "course", "carousel", "wisdom"], topic: "quran" },
  holy: { kinds: ["wiki", "course", "carousel", "wisdom"], topic: "holy" },
  names: { kinds: ["name"] },
  scholars: { kinds: ["wiki", "carousel", "wisdom"], topic: "scholars" },
  history: { kinds: ["wiki", "quiz", "carousel", "wisdom"], topic: "history" },
  art: { kinds: ["wiki"], topic: "art" },
};

export type PageRequest = { locale: string; tradition?: string; cursor?: string | null; seed?: string | null; limit?: number; topic?: TopicChoice };
export type PageResult = { ok: true; page: WebFeedPage } | { ok: false; badCursor: boolean };

/** one page of the stream (GET /api/feed/web?v=2) */
export async function fetchWebPage(r: PageRequest, signal?: AbortSignal): Promise<PageResult> {
  const q = new URLSearchParams({ v: "2", locale: r.locale, tradition: r.tradition ?? "all", limit: String(r.limit ?? 12) });
  if (r.seed) q.set("seed", r.seed);
  if (r.cursor) q.set("cursor", r.cursor);
  if (r.topic && r.topic !== "all") {
    const t = TOPIC_QUERY[r.topic];
    q.set("kinds", t.kinds.join(","));
    if (t.topic) q.set("topic", t.topic);
  }
  try {
    const res = await fetch(`/api/feed/web?${q}`, { headers: { Accept: "application/json" }, signal });
    if (!res.ok) return { ok: false, badCursor: res.status === 400 };
    const page = (await res.json()) as WebFeedPage;
    return Array.isArray(page?.items) ? { ok: true, page } : { ok: false, badCursor: false };
  } catch {
    return { ok: false, badCursor: false };
  }
}

// ---------- what the feed showed in the last days ----------
const DAYS = 7;
const CAP = 3000;
const day = () => Math.floor(Date.now() / 86400000);
let seen: Record<string, number> | null = null;
let dirty = false;
let timer: ReturnType<typeof setTimeout> | null = null;
function load() {
  if (seen) return seen;
  const raw = readJSON<Record<string, number>>(SEEN_KEY, {});
  const min = day() - DAYS;
  seen = {};
  for (const [k, d] of Object.entries(raw)) if (d >= min) seen[k] = d;
  return seen;
}
function flush() {
  timer = null;
  if (!dirty || !seen) return;
  dirty = false;
  let entries = Object.entries(seen);
  if (entries.length > CAP) { entries = entries.sort((a, b) => b[1] - a[1]).slice(0, CAP); seen = Object.fromEntries(entries); }
  writeJSON(SEEN_KEY, seen, true);
}
export const wasSeen = (id: string) => id in load();
export function markSeen(id: string) {
  const s = load();
  if (s[id] === day()) return;
  s[id] = day();
  dirty = true;
  timer ??= setTimeout(flush, 4000);
}
export const lastVisit = () => readJSON<number>(LAST_KEY, 0);
export const touchVisit = () => writeJSON(LAST_KEY, Date.now(), true);
