// Website addition (no app counterpart): a server-safe view of the academy courses for route checks, metadata and
// JSON-LD. index.ts pulls in names.ts (React hooks), which server components must not import, so this file reads the
// pure content modules directly and repeats only the Names course header (keep in step with index.ts NAMES).
import type { Course, L } from "./types";
import { SEERAH } from "./content/seerah";
import { PROPHETS } from "./content/prophets";
import { ULUM } from "./content/ulum";
import { HADITH_SCI } from "./content/hadithSci";
import { AQIDAH } from "./content/aqidah";
import { FIQH } from "./content/fiqh";
import { AKHLAQ } from "./content/akhlaq";
import { ADHKAR } from "./content/adhkar";
import { RAMADAN } from "./content/ramadan";
import { HAJJ } from "./content/hajj";
import { TAJWEED_DEEP } from "./content/tajweedDeep";

const L3 = (en: string, de: string, ar: string): L => ({ en, de, ar });
export const txs = (l: L, lang: string) => (lang === "de" ? l.de : lang === "ar" ? l.ar : l.en) || l.en;

const NAMES_COUNT = 99;
const nameLessonId = (i: number) => `n${String(i + 1).padStart(2, "0")}`;
const NAMES_HEAD = {
  id: "names", word: "الأسماء الحسنى",
  title: L3("The 99 Names of Allah", "Die 99 Namen Allahs", "أسماء الله الحسنى"),
  lead: L3("One name per lesson: its meaning, where it appears in the Quran, and a short quiz.", "Ein Name pro Lektion: seine Bedeutung, wo er im Koran vorkommt, und ein kurzes Quiz.", "اسم في كل درس: معناه، ومواضعه في القرآن، واختبار قصير."),
};

export type CourseInfo = { id: string; word: string; title: L; lead: L; lessons: { id: string; title: L | null; body: L | null }[] };
const info = (c: Course): CourseInfo => ({ id: c.id, word: c.word, title: c.title, lead: c.lead, lessons: c.lessons.map((l) => ({ id: l.id, title: l.title, body: l.body })) });

/** same order as COURSES in index.ts */
export const CATALOG: CourseInfo[] = [
  ...[SEERAH, PROPHETS, ULUM, HADITH_SCI, AQIDAH, FIQH, AKHLAQ, ADHKAR].map(info),
  { ...NAMES_HEAD, lessons: Array.from({ length: NAMES_COUNT }, (_, i) => ({ id: nameLessonId(i), title: null, body: null })) },
  ...[RAMADAN, HAJJ, TAJWEED_DEEP].map(info),
];
export const catalogCourse = (id: string) => CATALOG.find((c) => c.id === id);
export const catalogLesson = (course: string, lesson: string) => {
  const c = catalogCourse(course);
  const i = c ? c.lessons.findIndex((l) => l.id === lesson) : -1;
  return c && i >= 0 ? { course: c, lesson: c.lessons[i], index: i } : undefined;
};
/** first sentence-ish excerpt of a Markdown body for meta descriptions */
export function excerpt(md: string, max = 158): string {
  const s = md.replace(/^#+\s.*$/gm, "").replace(/\*\*/g, "").replace(/^[-*]\s+/gm, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 1).replace(/\s+\S*$/, "")} …` : s;
}
