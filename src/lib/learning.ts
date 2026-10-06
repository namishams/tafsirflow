import { readJSON, writeJSON } from "./storage";
import { award } from "./points";

// Spaced repetition with FSRS (Free Spaced Repetition Scheduler, the memory model behind modern Anki): every verse has a
// stability S (days until recall drops to 90 %) and a difficulty D (1–10). Each rating updates both, and the next review
// is due exactly when the chance of still knowing the verse falls to 90 %. STAGES only label the stability for the UI.
export const STAGES = [1, 3, 7, 14, 30, 90];
const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755]; // FSRS-4.5 default weights
const F = 19 / 81, C = -0.5, RETAIN = 0.9;
const GRADE = { again: 1, good: 3, easy: 4 } as const;
const clampD = (d: number) => Math.min(10, Math.max(1, d));
const d0 = (g: number) => clampD(W[4] - (g - 3) * W[5]);
// probability of recalling a verse t days after the last review
export const recall = (stability: number, t: number) => Math.pow(1 + (F * Math.max(0, t)) / Math.max(0.1, stability), C);
const intervalOf = (stability: number) => Math.max(1, Math.round((stability / F) * (Math.pow(RETAIN, 1 / C) - 1)));
const stageOf = (stability: number) => STAGES.reduce((acc, x, i) => (stability >= x ? i : acc), 0);

// key "2:255" -> next due day. ease is the personal memory factor of that verse (Shams memory model):
// it drops when you struggle and grows when a verse is easy for you, so every learner gets their own schedule.
// n = number of ratings, first = day the verse was first learned (both used by the coach, see lib/coach.ts)
export type Srs = Record<string, { stage: number; due: number; at?: number; ease?: number; lapses?: number; last?: number; n?: number; first?: number; s?: number; d?: number }>;
type Entry = Srs[string];

// entries from before FSRS get a stability and difficulty estimated from their old stage, ease and lapses
function memoryOf(e: Entry): { s: number; d: number } {
  if (e.s !== undefined && e.d !== undefined) return { s: e.s, d: e.d };
  return { s: Math.max(0.5, STAGES[e.stage] * (e.ease ?? 1)), d: clampD(5 + (e.lapses ?? 0) * 0.6 - ((e.ease ?? 1) - 1) * 3) };
}
function fsrs(prev: Entry | undefined, g: number, t: number): { s: number; d: number } {
  if (!prev) return { s: W[g - 1], d: d0(g) };
  const m = memoryOf(prev);
  const r = recall(m.s, t);
  const d = clampD(W[7] * d0(4) + (1 - W[7]) * (m.d - W[6] * (g - 3)));
  const s = g === 1
    ? W[11] * Math.pow(d, -W[12]) * (Math.pow(m.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r))
    : m.s * (Math.exp(W[8]) * (11 - d) * Math.pow(m.s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * (g === 4 ? W[16] : 1) + 1);
  return { s: Math.max(0.1, g === 1 ? Math.min(s, m.s) : s), d };
}
export type Rating = "again" | "good" | "easy";

const SRS_KEY = "tf:srs";
const DAYS_KEY = "tf:days";

export function today(): number {
  const d = new Date();
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}

export const readSrs = () => readJSON<Srs>(SRS_KEY, {});

export function rate(verseKey: string, rating: Rating): number {
  const srs = readSrs();
  const prev = srs[verseKey];
  let ease = prev?.ease ?? 1; // personal memory factor, read by the coach
  if (rating === "again") ease = Math.max(0.5, ease * 0.8);
  if (rating === "easy") ease = Math.min(2.5, ease * 1.15);
  const m = fsrs(prev, GRADE[rating], prev?.last !== undefined ? today() - prev.last : 0);
  const gap = rating === "again" ? 0 : intervalOf(m.s); // "again": practise it once more today
  srs[verseKey] = { stage: stageOf(m.s), due: today() + gap, at: Date.now(), ease, lapses: (prev?.lapses ?? 0) + (rating === "again" ? 1 : 0), last: today(), n: (prev?.n ?? 0) + 1, first: prev?.first ?? today(), s: m.s, d: m.d };
  writeJSON(SRS_KEY, srs);
  logDay();
  award("review");
  if (!prev) award("new");
  return gap;
}

// A mistake in a test: the verse becomes weaker and comes back tomorrow
export function noteMistake(verseKey: string) {
  const srs = readSrs();
  const prev = srs[verseKey];
  const m = fsrs(prev, 1, prev?.last !== undefined ? today() - prev.last : 0);
  srs[verseKey] = { ...prev, stage: stageOf(m.s), due: Math.min(prev?.due ?? Infinity, today() + 1), at: Date.now(), ease: Math.max(0.5, (prev?.ease ?? 1) * 0.9), lapses: (prev?.lapses ?? 0) + 1, last: prev?.last ?? today(), first: prev?.first ?? today(), s: m.s, d: m.d };
  writeJSON(SRS_KEY, srs);
}

// Estimated memory strength 0–1: drops as a verse gets overdue relative to its interval
export function strength(e: Srs[string], t = today()): number {
  const m = memoryOf(e);
  const since = t - (e.last ?? e.due - intervalOf(m.s));
  return Math.max(0, Math.min(1, recall(m.s, since)));
}
export function weakestVerses(n = 5, srs = readSrs()): { key: string; strength: number; lapses: number }[] {
  return Object.entries(srs).map(([key, e]) => ({ key, strength: strength(e), lapses: e.lapses ?? 0 }))
    .sort((a, b) => a.strength - b.strength || b.lapses - a.lapses).slice(0, n);
}

export function dueVerses(srs = readSrs()): string[] {
  const t = today();
  return Object.entries(srs)
    .filter(([, v]) => v.due <= t)
    .sort((a, b) => a[1].due - b[1].due)
    .map(([k]) => k);
}

type Days = Record<string, number>; // day number -> verses practised

export function logDay() {
  const days = readJSON<Days>(DAYS_KEY, {});
  const t = String(today());
  days[t] = (days[t] ?? 0) + 1;
  writeJSON(DAYS_KEY, days);
}

export function stats(): { streak: number; todayCount: number } {
  const days = readJSON<Days>(DAYS_KEY, {});
  const t = today();
  let streak = 0;
  // a streak is still alive if you practised yesterday but not yet today
  for (let d = days[String(t)] ? t : t - 1; days[String(d)]; d--) streak++;
  return { streak, todayCount: days[String(t)] ?? 0 };
}
