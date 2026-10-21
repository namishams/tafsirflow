// mirrors mobile/src/features/arabic-lang/progress.ts (copied for the website; keep both in step)
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { LESSONS, LEVELS, PASS, UNITS } from "./curriculum";
import type { Level } from "./types";

// Progress of the language course, on this device only: finished lessons with their best score, the daily goal,
// lessons per day (for the streak) and earned app certificates.
const KEY = "qmc.arabicLang.v1";
export type LangProgress = {
  done: Record<string, { score: number; at: number }>;
  goal: number;
  days: Record<string, number>;
  certs: Partial<Record<Level, { at: number; pct: number }>>;
};
const EMPTY: LangProgress = { done: {}, goal: 1, days: {}, certs: {} };

export const dayNum = (d = new Date()) => Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 86400000);
export const readProgress = () => ({ ...EMPTY, ...readJSON<LangProgress>(KEY, EMPTY) });
export function useLangProgress(): LangProgress { const p = useStored<LangProgress>(KEY, EMPTY); return { ...EMPTY, ...p }; }

export function saveLesson(id: string, score: number) {
  const p = readProgress();
  const prev = p.done[id];
  const day = String(dayNum());
  const next: LangProgress = {
    ...p,
    done: { ...p.done, [id]: { score: Math.max(score, prev?.score ?? 0), at: Date.now() } },
    days: { ...p.days, [day]: (p.days[day] ?? 0) + 1 },
  };
  // certificates: every unit test up to the level's last unit passed
  for (const { level, lastUnit } of LEVELS) {
    if (next.certs[level]) continue;
    const tests = UNITS.filter((u) => u.n <= lastUnit).map((u) => next.done[`u${u.n}-test`]?.score ?? 0);
    if (tests.every((s) => s >= PASS)) next.certs = { ...next.certs, [level]: { at: Date.now(), pct: Math.round((tests.reduce((a, b) => a + b, 0) / tests.length) * 100) } };
  }
  writeJSON(KEY, next);
  return next;
}
export function setGoal(n: number) { writeJSON(KEY, { ...readProgress(), goal: n }); }

export const isDone = (p: LangProgress, id: string) => {
  const d = p.done[id];
  return !!d && (!id.endsWith("-test") || d.score >= PASS);
};
/** a lesson opens when the one before it on the path is done */
export function lessonOpen(p: LangProgress, id: string): boolean {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i <= 0 || isDone(p, LESSONS[i - 1].id) || !!p.done[id];
}
export const nextLesson = (p: LangProgress) => LESSONS.find((l) => !isDone(p, l.id)) ?? null;
export const todayCount = (p: LangProgress) => p.days[String(dayNum())] ?? 0;
export function streak(p: LangProgress): number {
  let d = dayNum();
  if (!p.days[String(d)]) d--;
  let n = 0;
  while (p.days[String(d)]) { n++; d--; }
  return n;
}
