// One rule for every course outside the core reciter path: the first FREE_LEVELS levels (units, lessons, sections)
// are free in the app, the rest is Pro. The website stays free for everyone.
// The core reciter path keeps its own, unchanged rules (Shams method: al-Fatiha and Juz 'Amma, qaida and reading:
// FREE.arabicLessons, tajweed basics: FREE.tajweedLessons in lib/pro.tsx) and never goes through this file.
// The same number is enforced on the server for content the app loads by API (src/lib/freeLevels.ts of the website).
export const FREE_LEVELS = 3;

/** courses of the core reciter path: not affected by FREE_LEVELS */
export const CORE_COURSES: ReadonlySet<string> = new Set(["shams", "shams2", "qaida", "arabicReading", "tajweed", "reciterPath"]);

/** per-course exceptions (course id -> free levels); empty: every course follows FREE_LEVELS */
export const FREE_LEVEL_OVERRIDES: Readonly<Record<string, number>> = {};

/** how many levels of a course are free (Infinity for the core path, which has its own rules) */
export function freeLevels(course: string): number {
  if (CORE_COURSES.has(course)) return Infinity;
  return FREE_LEVEL_OVERRIDES[course] ?? FREE_LEVELS;
}

/** is the level at 0-based `index` free in this course */
export const isLevelFree = (course: string, index: number) => index < freeLevels(course);
