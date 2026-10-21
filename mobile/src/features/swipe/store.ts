import { readJSON, useStored, writeJSON } from "@/lib/store";

// Swipe & Learn on this device: the 7-day window of cards already shown ("no repeats within 7 days"), the daily counts
// (cards, new words, reviews, garden growth used), the Swipe & Learn streak and the MashaAllah ledger that keeps the
// server's caps visible on the cards (CREDIT_CAPS in the website's src/lib/sijill.ts: 5 from one person to the same
// person and 20 per giver per UTC day). New keys only ("qmc.swipe.*"); nothing here is uploaded. Mirrored on the website
// in src/lib/learn/swipe/store.ts.
export const SEEN_KEY = "qmc.swipe.seen.v1";
export const STATS_KEY = "qmc.swipe.stats.v1";
const DAYS = 7;
const CAP = 4000;
/** a day counts for the streak with at least this many cards */
export const STREAK_MIN = 10;
export const MASHA_CAPS = { perPair: 5, giverDay: 20 } as const;
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365] as const;

/** the local calendar day (same numbering as the feed statistics) */
export const dayNum = (t = Date.now()) => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);
const utcDay = () => new Date().toISOString().slice(0, 10);

// ---------- the 7-day window ----------
let seen: Record<string, number> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
function loadSeen() {
  if (seen) return seen;
  const raw = readJSON<Record<string, number>>(SEEN_KEY, {});
  const min = dayNum() - DAYS;
  seen = {};
  for (const [k, d] of Object.entries(raw)) if (typeof d === "number" && d > min) seen[k] = d;
  return seen;
}
function flush() {
  timer = null;
  if (!seen) return;
  let e = Object.entries(seen);
  if (e.length > CAP) { e = e.sort((a, b) => b[1] - a[1]).slice(0, CAP); seen = Object.fromEntries(e); }
  writeJSON(SEEN_KEY, seen, true);
}
export const wasShown = (id: string) => id in loadSeen();
export function markShown(id: string) {
  const s = loadSeen();
  s[id] = dayNum();
  timer ??= setTimeout(flush, 2500);
}
export function flushShown() { if (timer) { clearTimeout(timer); flush(); } }

// ---------- daily counts and the streak ----------
export type SwipeStats = {
  day: number; today: number; words: number; reviews: number; grown: number; masha: number;
  total: number; totalWords: number;
  /** day number -> cards learned (the last 120 days) */
  days: Record<string, number>;
  /** the last streak length that was celebrated, and when */
  celebrated: number; celebratedDay: number;
  /** MashaAllahs sent per UTC day and member (the server's caps) */
  ledger: { day: string; total: number; by: Record<string, number> };
  mashaTotal: number;
};
const EMPTY: SwipeStats = { day: 0, today: 0, words: 0, reviews: 0, grown: 0, masha: 0, total: 0, totalWords: 0, days: {}, celebrated: 0, celebratedDay: 0, ledger: { day: "", total: 0, by: {} }, mashaTotal: 0 };

export function readSwipeStats(): SwipeStats {
  const s = { ...EMPTY, ...readJSON<Partial<SwipeStats>>(STATS_KEY, {}) };
  const d = dayNum();
  if (s.day !== d) Object.assign(s, { day: d, today: 0, words: 0, reviews: 0, grown: 0, masha: 0 });
  if (s.ledger?.day !== utcDay()) s.ledger = { day: utcDay(), total: 0, by: {} };
  return s;
}
export const useSwipeStats = () => { useStored(STATS_KEY, {}); return readSwipeStats(); };
function save(s: SwipeStats) {
  const keys = Object.keys(s.days).map(Number).sort((a, b) => a - b);
  for (const k of keys.slice(0, Math.max(0, keys.length - 120))) delete s.days[String(k)];
  writeJSON(STATS_KEY, s, true);
}

/** consecutive days with at least STREAK_MIN cards, ending today (or yesterday while today is not counted yet) */
export function swipeStreak(s: SwipeStats = readSwipeStats(), d = dayNum()): number {
  const on = (x: number) => (s.days[String(x)] ?? 0) >= STREAK_MIN;
  let x = on(d) ? d : d - 1, n = 0;
  while (on(x)) { n++; x--; }
  return n;
}

export type Learned = { growth: boolean; streak: number | null; milestone: boolean };
/** one card learned; `growth`: the garden may grow for it (daily cap), `streak`: today just started counting */
export function recordLearned(kind: { newWord?: boolean; review?: boolean }, growthCap: number): Learned {
  const s = readSwipeStats();
  const d = dayNum();
  const before = s.days[String(d)] ?? 0;
  s.today++; s.total++;
  s.days = { ...s.days, [d]: before + 1 };
  if (kind.newWord) { s.words++; s.totalWords++; }
  if (kind.review) s.reviews++;
  const growth = s.grown < growthCap;
  if (growth) s.grown++;
  let streak: number | null = null, milestone = false;
  if (before + 1 === STREAK_MIN) {
    streak = swipeStreak(s, d);
    milestone = (STREAK_MILESTONES as readonly number[]).includes(streak);
    if (s.celebratedDay !== d) { s.celebrated = streak; s.celebratedDay = d; } else streak = null;
  }
  save(s);
  return { growth, streak, milestone };
}

/** XP for the streak: a little every day it grows, more on the milestones */
export const streakXp = (n: number, milestone: boolean) => (milestone ? Math.min(250, 10 + n * 2) : 5);

// ---------- the MashaAllah ledger ----------
export type MashaState = "open" | "already" | "dayFull";
export function mashaState(username: string): MashaState {
  const l = readSwipeStats().ledger;
  if (l.total >= MASHA_CAPS.giverDay) return "dayFull";
  return (l.by[username] ?? 0) >= MASHA_CAPS.perPair ? "already" : "open";
}
/** a MashaAllah was sent; not credited by the server = a cap of that member is reached for today */
export function noteMasha(username: string, credited: boolean) {
  const s = readSwipeStats();
  s.ledger = { ...s.ledger, total: s.ledger.total + 1, by: { ...s.ledger.by, [username]: credited ? (s.ledger.by[username] ?? 0) + 1 : MASHA_CAPS.perPair } };
  s.masha++; s.mashaTotal++;
  save(s);
}
