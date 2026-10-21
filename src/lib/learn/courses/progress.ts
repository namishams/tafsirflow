// mirrors mobile/src/features/courses/progress.ts (copied for the website; keep both in step)
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";

// Progress of the academy courses on this device (new key; no existing key is read or changed): best score per
// lesson ("course/lesson") and the day each course was completed.
const KEY = "qmc.courses.v1";
export type CourseProgress = { done: Record<string, { score: number; at: number }>; complete: Record<string, number> };
const EMPTY: CourseProgress = { done: {}, complete: {} };
export const PASS = 0.7;
export const readCP = (): CourseProgress => ({ ...EMPTY, ...readJSON<CourseProgress>(KEY, EMPTY) });
export function useCP(): CourseProgress { const p = useStored<CourseProgress>(KEY, EMPTY); return { ...EMPTY, ...p }; }
export const lessonKey = (course: string, lesson: string) => `${course}/${lesson}`;
export const isPassed = (p: CourseProgress, course: string, lesson: string) => (p.done[lessonKey(course, lesson)]?.score ?? 0) >= PASS;
export const doneCount = (p: CourseProgress, course: string, ids: string[]) => ids.filter((id) => isPassed(p, course, id)).length;

/** saves a result; returns whether the lesson was passed for the first time and whether the course just became complete */
export function saveCourseLesson(course: string, lesson: string, score: number, all: string[]): { first: boolean; complete: boolean } {
  const p = readCP();
  const k = lessonKey(course, lesson);
  const before = (p.done[k]?.score ?? 0) >= PASS;
  const next: CourseProgress = { ...p, done: { ...p.done, [k]: { score: Math.max(score, p.done[k]?.score ?? 0), at: Date.now() } } };
  let complete = false;
  if (!next.complete[course] && all.every((id) => isPassed(next, course, id))) { next.complete = { ...next.complete, [course]: Date.now() }; complete = true; }
  writeJSON(KEY, next);
  return { first: !before && score >= PASS, complete };
}
