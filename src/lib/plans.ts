import { PATH } from "./academy";
import { readJSON, writeJSON } from "./storage";
import { today } from "./learning";

// Learning plans: the daily amount of NEW verses grows step by step (progressive overload), the order follows the
// Academy path (short surahs first). Reviews of earlier verses come on top through the memory model.
export type Track = { id: "steady" | "standard" | "intensive" | "hafiz"; start: number; every: number; step: number; cap: number };
export const TRACKS: Track[] = [
  { id: "steady", start: 1, every: 14, step: 1, cap: 4 },     // beginners, children
  { id: "standard", start: 2, every: 7, step: 1, cap: 8 },    // most adults
  { id: "intensive", start: 4, every: 7, step: 1, cap: 15 },  // ambitious learners
  { id: "hafiz", start: 7, every: 7, step: 2, cap: 20 },      // full-time hifz programme: about two pages a day, the whole Quran in one year
];
export const PLAN_DAYS = 365;

// every verse of the Quran in learning order
export const ORDER: { s: number; v: number }[] = PATH.flatMap((l) => Array.from({ length: l.to - l.from + 1 }, (_, i) => ({ s: l.s, v: l.from + i })));
export const newPerDay = (t: Track, day: number) => Math.min(t.cap, t.start + Math.floor((day - 1) / t.every) * t.step); // day 1 … 365
export function cumulative(t: Track, day: number) {
  let n = 0;
  for (let d = 1; d <= day; d++) n += newPerDay(t, d);
  return Math.min(n, ORDER.length);
}
export type MyPlan = { track: Track["id"]; startDay: number; done: Record<string, number>; at: number };
const KEY = "tf:plan";
// a deleted plan is stored as a dated marker ({ deleted, at }) so that syncing with the account cannot bring it back
export const readPlan = () => { const p = readJSON<(MyPlan & { deleted?: boolean }) | null>(KEY, null); return p && !p.deleted ? p : null; };
export const savePlan = (p: MyPlan | null) => writeJSON(KEY, p ?? { deleted: true, at: Date.now() });
export const dayOfPlan = (p: MyPlan) => Math.max(1, today() - p.startDay + 1);

// the slice of verses scheduled for a given plan day
export function portion(t: Track, day: number) {
  const from = cumulative(t, day - 1), to = cumulative(t, day);
  return ORDER.slice(from, to);
}
// ranges grouped by surah for display, e.g. [{s:114,from:1,to:6},{s:113,from:1,to:2}]
export function ranges(list: { s: number; v: number }[]) {
  const out: { s: number; from: number; to: number }[] = [];
  for (const x of list) {
    const last = out[out.length - 1];
    if (last && last.s === x.s && last.to + 1 === x.v) last.to = x.v;
    else out.push({ s: x.s, from: x.v, to: x.v });
  }
  return out;
}
