import { statWords } from "./statsStore";
import { readJSON, writeJSON } from "@/lib/store";

// What the feed showed in the last days, kept compactly ("qmc.feed-seen": item -> day number, capped), so new
// batches avoid repeats of the last ~7 days, and when the feed was last opened ("New for you" / "New posts").
const KEY = "qmc.feed-seen";
const LAST_KEY = "qmc.feed-last-visit";
const DAYS = 7;
const CAP = 3000;
const day = () => Math.floor(Date.now() / 86400000);

let seen: Record<string, number> | null = null;
let dirty = false;
let timer: ReturnType<typeof setTimeout> | null = null;
function load() {
  if (seen) return seen;
  const raw = readJSON<Record<string, number>>(KEY, {});
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
  writeJSON(KEY, seen, true);
}
/** the content key of a feed item (variants of one verse count as the verse) */
export const contentKey = (item: string) => (/^[vwqcmrtd]:/.test(item) ? `v:${item.slice(2)}` : item);
export const wasSeen = (item: string) => contentKey(item) in load();
export function markSeen(item: string) {
  const s = load();
  const k = contentKey(item);
  if (s[k] === day()) return;
  s[k] = day();
  dirty = true;
  timer ??= setTimeout(flush, 4000);
}
/** a per-session, per-day seed (the mix changes every day and every launch) */
export const SESSION_SEED = (day() * 7919 + Math.floor(Math.random() * 1e6)) >>> 0;

export const lastVisit = () => readJSON<number>(LAST_KEY, 0);
export const touchVisit = () => writeJSON(LAST_KEY, Date.now(), true);

// words learned in the feed today (quiz answered right, memorise fully revealed): shown in Account
const STATS_KEY = "qmc.feed-stats";
export type FeedStats = { day: number; words: number };
export function addLearnedWords(n: number) {
  statWords(n);
  const cur = readJSON<FeedStats>(STATS_KEY, { day: day(), words: 0 });
  writeJSON(STATS_KEY, { day: day(), words: (cur.day === day() ? cur.words : 0) + n }, true);
}
export const FEED_STATS_KEY = STATS_KEY;
export const todayWords = (s: FeedStats) => (s.day === day() ? s.words : 0);
