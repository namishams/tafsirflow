import { VERSE_COUNTS } from "./counts";
import { readJSON, writeJSON } from "./storage";
import { today } from "./learning";

// Learning path through all 114 surahs: short surahs first (as reciters teach children), then the beloved
// longer surahs, then the rest in mushaf order. Every surah is split into lessons of up to five verses.
const FIRST = [1, 112, 113, 114, 108, 103, 110, 111, 109, 107, 106, 105, 104, 102, 101, 100, 99, 97, 95, 94, 93, 92, 98, 96, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78];
const BELOVED = [67, 36, 55, 56, 18, 32, 2];
export const UNITS: { id: string; surahs: number[] }[] = [
  { id: "u1", surahs: FIRST.slice(0, 10) },
  { id: "u2", surahs: FIRST.slice(10, 24) },
  { id: "u3", surahs: FIRST.slice(24) },
  { id: "u4", surahs: BELOVED },
  { id: "u5", surahs: Array.from({ length: 114 }, (_, i) => i + 1).filter((s) => !FIRST.includes(s) && !BELOVED.includes(s)) },
];
export const LESSON_SIZE = 5;
export type Lesson = { s: number; from: number; to: number; id: string };
export function lessonsOf(s: number): Lesson[] {
  const n = VERSE_COUNTS[s - 1];
  const out: Lesson[] = [];
  for (let f = 1; f <= n; f += LESSON_SIZE) out.push({ s, from: f, to: Math.min(n, f + LESSON_SIZE - 1), id: `${s}:${f}` });
  return out;
}
export const PATH: Lesson[] = UNITS.flatMap((u) => u.surahs.flatMap(lessonsOf));

export type Progress = { done: Record<string, number>; xp: number; days: Record<string, number>; at: number };
const KEY = "tf:academy";
export const readProgress = (): Progress => ({ done: {}, xp: 0, days: {}, at: 0, ...readJSON<Partial<Progress>>(KEY, {}) });

export function streakOf(p: Progress): number {
  let d = today(), n = 0;
  if (!p.days[d]) d -= 1; // today not started yet: the streak still counts until midnight
  while (p.days[d]) { n++; d--; }
  return n;
}
export const levelOf = (xp: number) => 1 + Math.floor(Math.sqrt(xp / 60)); // 60, 240, 540 … XP: each level needs a little more
export const levelStart = (lvl: number) => 60 * (lvl - 1) ** 2;
// the daily goal grows with your streak – "a little more every day"
export const dailyGoal = (p: Progress) => Math.min(250, 40 + 10 * streakOf(p));
// fewer seconds per question the higher your level
export const secondsPerQuestion = (lvl: number, bonus = 0) => Math.max(8, 26 - 2 * lvl) + bonus; // bonus: extra time for children and seniors
export const questionsFor = (lvl: number) => Math.min(14, 6 + lvl);

export function saveResult(lesson: string, score: number, xp: number): Progress {
  const p = readProgress();
  p.done[lesson] = Math.max(p.done[lesson] ?? 0, score);
  p.xp += xp;
  p.days[today()] = (p.days[today()] ?? 0) + xp;
  p.at = Date.now();
  writeJSON(KEY, p);
  return p;
}
export const PASS = 70; // percent needed to complete a lesson
export function nextLesson(p: Progress): Lesson {
  return PATH.find((l) => (p.done[l.id] ?? 0) < PASS) ?? PATH[0];
}
