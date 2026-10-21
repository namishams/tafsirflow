// mirrors the pure part of mobile/src/features/abrahamic/courseKit.tsx (text type, helpers, lesson/course types and
// verse ranges). Split from kit.ts so server pages (metadata, notFound) can read the lessons without importing hooks.
export type L = { en: string } & Partial<Record<"de" | "ar" | "tr" | "ur" | "fa" | "ps" | "fr" | "es" | "id" | "ms" | "bn" | "ru" | "zh", string>>;
export const L14 = (en: string, de: string, ar: string, tr: string, ur: string, fa: string, ps: string, fr: string, es: string, id: string, ms: string, bn: string, ru: string, zh: string): L =>
  ({ en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh });
/** content texts: at least en/de/ar */
export const L3 = (en: string, de: string, ar: string): L => ({ en, de, ar });

export type Tag = "quran" | "tafsir" | "sunni" | "shia" | "bible" | "history" | "fiqh" | "today";
export type Q = { q: L; options: L[]; answer: number; why?: L };
/** review: "needs_review" while a rewritten lesson waits for a scholar (shown as a quiet line under the explanation) */
export type Lesson = { id: string; arabic: string; title: L; text: L; note?: L; verses: string[]; tags: Tag[]; quiz: Q[]; review?: "needs_review" };
export type CourseDef = {
  id: "abrahamic" | "haramain";
  storeKey: string;
  route: string; // "/abrahamic"
  title: L;
  lessons: Lesson[];
};

/** "2:125-129" → ["2:125", …, "2:129"] */
export function verseRange(r: string): string[] {
  const [s, v] = r.split(":");
  if (!v) return [];
  const [a, b] = v.split("-").map(Number);
  return Array.from({ length: (b || a) - a + 1 }, (_, i) => `${s}:${a + i}`);
}
export const vv = (...r: string[]) => r.flatMap(verseRange);
