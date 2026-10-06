import { readJSON, writeJSON } from "./storage";

// Spaced repetition: a verse climbs through these review gaps (days). "Again" sends it back to the start.
export const STAGES = [1, 3, 7, 14, 30, 90];

export type Srs = Record<string, { stage: number; due: number }>; // key "2:255" -> next due day
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
  const cur = srs[verseKey]?.stage ?? -1;
  const stage = rating === "again" ? 0 : Math.min(STAGES.length - 1, cur + (rating === "easy" ? 2 : 1));
  const due = rating === "again" ? today() : today() + STAGES[stage];
  srs[verseKey] = { stage, due };
  writeJSON(SRS_KEY, srs);
  logDay();
  return rating === "again" ? 0 : STAGES[stage];
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
