import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { readJSON, useStored, writeJSON } from "@/lib/store";

// Local statistics of the feed (this device only, never uploaded): time in the feed (counted only while a feed
// screen is focused and the app is active), posts seen, verses heard, words learned, what was read per kind, likes,
// saves, shares, the longest session and the daily streak. Days are kept for 120 days, totals forever (bounded maps).
export const STATS2_KEY = "qmc.feed-stats2";
const KEEP_DAYS = 120;
export const dayNum = (t = Date.now()) => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);

export type DayStats = { ms: number; posts: number; verses: number; words: number; likes: number; saves: number; shares: number; kinds: Record<string, number> };
export type Stats = { days: Record<string, DayStats>; total: DayStats; longestMs: number; firstDay: number };
const emptyDay = (): DayStats => ({ ms: 0, posts: 0, verses: 0, words: 0, likes: 0, saves: 0, shares: 0, kinds: {} });
const empty = (): Stats => ({ days: {}, total: emptyDay(), longestMs: 0, firstDay: dayNum() });

let cache: Stats | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
function load(): Stats { cache ??= { ...empty(), ...readJSON<Stats>(STATS2_KEY, empty()) }; return cache; }
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
export const statPost = (kind: string) => bump((d) => { d.posts++; d.kinds[kind] = (d.kinds[kind] ?? 0) + 1; });
export const statVerse = () => bump((d) => { d.verses++; });
export const statWords = (n: number) => bump((d) => { d.words += n; });
export const statLike = () => bump((d) => { d.likes++; });
export const statSave = () => bump((d) => { d.saves++; });
export const statShare = () => bump((d) => { d.shares++; });
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
  while (dayOf(s, d).posts > 0) { n++; d--; }
  return n;
}
export function longestStreak(s: Stats): number {
  const ds = Object.keys(s.days).map(Number).filter((d) => s.days[String(d)].posts > 0).sort((a, b) => a - b);
  let best = 0, run = 0, prev = -2;
  for (const d of ds) { run = d === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return best;
}

/** in-feed promotion of our own products: impressions and taps, counted locally */
export const statPromo = (id: string, what: "imp" | "tap") => bump((d) => { const k = `promo:${id}:${what}`; d.kinds[k] = (d.kinds[k] ?? 0) + 1; });

/** the funnel of the feed offers per offer and A/B variant: impressions, taps and purchases (this device only).
 * TODO(analytics): the website has no event endpoint yet; once it has one, send these counters as anonymous daily
 * aggregates (offer, variant, counts – no ids, no content) instead of keeping them only here. */
export type OfferStep = "imp" | "tap" | "buy";
export const statOffer = (offer: string, variant: string, what: OfferStep) => bump((d) => { const k = `offer:${offer}:${variant}:${what}`; d.kinds[k] = (d.kinds[k] ?? 0) + 1; });
/** totals over all days, for the thresholds of the celebration cards */
export const totals = (): DayStats => load().total;
export const currentStreak = (): number => streakOf(load());
