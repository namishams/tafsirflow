import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { gEvent, isFrozen } from "./gamify";

// Statistics of the feed (kept on this device; synced with the account when signed in, see feedSync.ts): time in the feed (counted only while a feed
// screen is focused and the app is active), posts seen, verses heard, words learned, what was read per kind, likes,
// saves, shares, the longest session and the daily streak. Days are kept for 120 days, totals forever (bounded maps).
export const STATS2_KEY = "qmc.feed-stats2";
const KEEP_DAYS = 120;
export const dayNum = (t = Date.now()) => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);

export type DayStats = { ms: number; posts: number; verses: number; words: number; likes: number; saves: number; shares: number; kinds: Record<string, number>; xp?: number; listen?: number; quiz?: number };
export type Stats = { days: Record<string, DayStats>; total: DayStats; longestMs: number; firstDay: number };
const emptyDay = (): DayStats => ({ ms: 0, posts: 0, verses: 0, words: 0, likes: 0, saves: 0, shares: 0, kinds: {} });
const empty = (): Stats => ({ days: {}, total: emptyDay(), longestMs: 0, firstDay: dayNum() });

let cache: Stats | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
function load(): Stats { cache ??= { ...empty(), ...readJSON<Stats>(STATS2_KEY, empty()) }; return cache; }
/** forget the in-memory record (after the account sync wrote a merged one) */
export const reloadStats = () => { cache = null; };
function save() {
  timer ??= setTimeout(() => {
    timer = null;
    const s = load();
    const min = dayNum() - KEEP_DAYS;
    for (const d of Object.keys(s.days)) if (Number(d) < min) delete s.days[d];
    writeJSON(STATS2_KEY, s, true);
  }, 3000);
}
function bump(f: (d: DayStats) => void) {
  const s = load();
  const k = String(dayNum());
  s.days[k] ??= emptyDay();
  f(s.days[k]); f(s.total);
  save();
}

/** the kind of a feed item, for the per-kind breakdown */
export function kindOfItem(item: string, libKind?: string): string {
  if (libKind) return libKind;
  const p = item.split(":")[0];
  return ({ v: "verse", w: "word", q: "quiz", c: "carousel", m: "memorise", r: "reciters", t: "transliteration", d: "word", n: "name", s: "story", h: "hadith", p: "prayer", k: "chapters", cal: "calendar" } as Record<string, string>)[p] ?? p;
}
export const statPost = (kind: string, item?: string) => { bump((d) => { d.posts++; d.kinds[kind] = (d.kinds[kind] ?? 0) + 1; }); gEvent({ t: "post", kind, item }); };
export const statVerse = () => { bump((d) => { d.verses++; }); gEvent({ t: "verse" }); };
export const statWords = (n: number) => { bump((d) => { d.words += n; }); gEvent({ t: "words", n }); };
/** a quiz answer (XP and quests only for right ones) */
export const statQuiz = (right: boolean) => { if (right) bump((d) => { d.quiz = (d.quiz ?? 0) + 1; }); gEvent({ t: "quiz", right }); };
/** time with recitation playing on a verse post ("listening" in the time breakdown), at most 2 minutes per post */
export const statListen = (ms: number) => { if (ms > 0) bump((d) => { d.listen = (d.listen ?? 0) + Math.min(ms, 120000); }); };
/** low-level access for gamify.ts */
export const statBump = (f: (d: DayStats) => void) => bump(f);
export const statsNow = (): Stats => load();
export const statLike = () => bump((d) => { d.likes++; });
export const statSave = () => bump((d) => { d.saves++; });
const shareListeners = new Set<(before: number, after: number) => void>();
/** listen to every new share (sharer tiers); returns the unsubscribe */
export const onShare = (f: (before: number, after: number) => void) => { shareListeners.add(f); return () => { shareListeners.delete(f); }; };
export const statShare = () => {
  const before = load().total.shares;
  bump((d) => { d.shares++; });
  gEvent({ t: "share" });
  const after = load().total.shares;
  shareListeners.forEach((f) => { try { f(before, after); } catch { /* ignore */ } });
};
function statTime(ms: number, sessionMs: number) {
  bump((d) => { d.ms += ms; });
  const s = load();
  if (sessionMs > s.longestMs) s.longestMs = sessionMs;
}

/** counts time while `on` (the feed screen is focused) and the app is active; a session ends after 2 minutes away */
let sessionStart = 0;
let lastTick = 0;
export function useFeedTimer(on: boolean) {
  const onRef = useRef(on);
  onRef.current = on;
  useEffect(() => {
    if (!on) return;
    const id = setInterval(() => {
      if (!onRef.current || AppState.currentState !== "active") return;
      const now = Date.now();
      if (!sessionStart || now - lastTick > 120000) sessionStart = now;
      lastTick = now;
      statTime(5000, now - sessionStart);
    }, 5000);
    return () => clearInterval(id);
  }, [on]);
}

export function useFeedStats(): Stats {
  useStored<Stats>(STATS2_KEY, empty());
  return load();
}
export const dayOf = (s: Stats, n: number): DayStats => s.days[String(n)] ?? emptyDay();
/** consecutive days with at least one post seen, up to today (or yesterday, when today has none yet) */
export function streakOf(s: Stats): number {
  let d = dayNum();
  if (!dayOf(s, d).posts) d--;
  let n = 0;
  // a day kept by a streak freeze (gamify.ts) does not break the streak and does not count
  while (dayOf(s, d).posts > 0 || isFrozen(d)) { if (dayOf(s, d).posts > 0) n++; d--; }
  return n;
}
export function longestStreak(s: Stats): number {
  const ds = Object.keys(s.days).map(Number).filter((d) => s.days[String(d)].posts > 0).sort((a, b) => a - b);
  let best = 0, run = 0, prev = -2;
  for (const d of ds) { run = d === prev + 1 || (d === prev + 2 && isFrozen(d - 1)) ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return best;
}

/** in-feed promotion of our own products: impressions and taps, counted locally */
export const statPromo = (id: string, what: "imp" | "tap") => bump((d) => { const k = `promo:${id}:${what}`; d.kinds[k] = (d.kinds[k] ?? 0) + 1; });

/** the funnel of the feed offers per offer and A/B variant: impressions, taps and purchases. Finished days are sent
 * once per day as anonymous aggregates (offer, variant, counts; no ids, no content) to /api/feed/events. */
export type OfferStep = "imp" | "tap" | "buy";
export const statOffer = (offer: string, variant: string, what: OfferStep) => bump((d) => { const k = `offer:${offer}:${variant}:${what}`; d.kinds[k] = (d.kinds[k] ?? 0) + 1; });
/** totals over all days, for the thresholds of the celebration cards */
export const totals = (): DayStats => load().total;
export const currentStreak = (): number => streakOf(load());

// ---------- anonymous daily offer counters to the website (once per day, finished days only) ----------
const SENT_KEY = "qmc.offer-sent-day";
export async function sendOfferStats(post: (body: unknown) => Promise<unknown>) {
  const today = dayNum();
  const sent = readJSON<number>(SENT_KEY, 0);
  if (sent >= today - 1) return;
  const s = load();
  const events: { variant: string; offer: string; imp: number; tap: number; buy: number; date: string }[] = [];
  for (const [d, st] of Object.entries(s.days)) {
    const n = Number(d);
    if (n >= today || n <= sent || n < today - 7) continue;
    const by: Record<string, { imp: number; tap: number; buy: number }> = {};
    for (const [k, v] of Object.entries(st.kinds)) {
      const m = /^offer:([^:]+):([^:]+):(imp|tap|buy)$/.exec(k);
      if (!m) continue;
      const e = (by[`${m[1]}\u0000${m[2]}`] ??= { imp: 0, tap: 0, buy: 0 });
      e[m[3] as OfferStep] += v;
    }
    const date = new Date(n * 86400000).toISOString().slice(0, 10);
    for (const [key, c] of Object.entries(by)) { const [offer, variant] = key.split("\u0000"); events.push({ variant, offer, ...c, date }); }
  }
  try {
    if (events.length) await post({ events: events.slice(0, 200) });
    writeJSON(SENT_KEY, today - 1, true);
  } catch { /* try again next time */ }
}
