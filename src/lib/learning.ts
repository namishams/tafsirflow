import { readJSON, writeJSON } from "./storage";

// Spaced repetition: a verse climbs through these review gaps (days). "Again" sends it back to the start.
export const STAGES = [1, 3, 7, 14, 30, 90];

// key "2:255" -> next due day. ease is the personal memory factor of that verse (Shams memory model):
// it drops when you struggle and grows when a verse is easy for you, so every learner gets their own schedule.
export type Srs = Record<string, { stage: number; due: number; at?: number; ease?: number; lapses?: number; last?: number }>;
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
  const cur = prev?.stage ?? -1;
  let ease = prev?.ease ?? 1;
  if (rating === "again") ease = Math.max(0.5, ease * 0.8);
  if (rating === "easy") ease = Math.min(2.5, ease * 1.15);
  const stage = rating === "again" ? 0 : Math.min(STAGES.length - 1, cur + (rating === "easy" ? 2 : 1));
  const gap = rating === "again" ? 0 : Math.max(1, Math.round(STAGES[stage] * ease));
  srs[verseKey] = { stage, due: today() + gap, at: Date.now(), ease, lapses: (prev?.lapses ?? 0) + (rating === "again" ? 1 : 0), last: today() };
  writeJSON(SRS_KEY, srs);
  logDay();
  return gap;
}

// A mistake in a test: the verse becomes weaker and comes back tomorrow
export function noteMistake(verseKey: string) {
  const srs = readSrs();
  const prev = srs[verseKey];
  srs[verseKey] = { stage: Math.max(0, (prev?.stage ?? 0) - 1), due: Math.min(prev?.due ?? Infinity, today() + 1), at: Date.now(), ease: Math.max(0.5, (prev?.ease ?? 1) * 0.9), lapses: (prev?.lapses ?? 0) + 1, last: prev?.last ?? today() };
  writeJSON(SRS_KEY, srs);
}

// Estimated memory strength 0–1: drops as a verse gets overdue relative to its interval
export function strength(e: Srs[string], t = today()): number {
  const interval = Math.max(1, Math.round(STAGES[e.stage] * (e.ease ?? 1)));
  const since = t - (e.last ?? e.due - interval);
  return Math.max(0, Math.min(1, Math.pow(0.5, since / (interval * 1.5))));
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
