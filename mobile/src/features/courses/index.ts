import type { Course, CourseId, L } from "./types";
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
import { NAMES_COUNT, NAMES_FREE, nameLessonId } from "./names";

// Registry of the academy courses (app-side extension; the website's academy, tajweed and Shams content in src/web
// is untouched). Each course: lessons with explanation, verse and hadith references, a quiz; the first lesson(s) free,
// the rest Pro (useEntitlement("academy")).
export const L3 = (en: string, de: string, ar: string): L => ({ en, de, ar });
export const tx = (l: L, lang: string) => (lang === "de" ? l.de : lang === "ar" ? l.ar : l.en) || l.en;

// the 99 names: lessons are built at run time from the library's list in the user's language (names.ts)
export const NAMES: Course = {
  id: "names", word: "الأسماء الحسنى", free: NAMES_FREE,
  title: L3("The 99 Names of Allah", "Die 99 Namen Allahs", "أسماء الله الحسنى"),
  lead: L3("One name per lesson: its meaning, where it appears in the Quran, and a short quiz.", "Ein Name pro Lektion: seine Bedeutung, wo er im Koran vorkommt, und ein kurzes Quiz.", "اسم في كل درس: معناه، ومواضعه في القرآن، واختبار قصير."),
  note: L3("The common list follows the narration in at-Tirmidhi (3507); scholars have compiled other lists from the Quran and Sunnah.", "Die verbreitete Liste folgt der Überlieferung bei at-Tirmidhi (3507); Gelehrte haben aus Koran und Sunna auch andere Listen zusammengestellt.", "القائمة المشهورة على رواية الترمذي (3507)، وقد جمع العلماء قوائم أخرى من القرآن والسنة."),
  lessons: Array.from({ length: NAMES_COUNT }, (_, i) => ({ id: nameLessonId(i), title: L3("", "", ""), body: L3("", "", ""), quiz: [] })),
};

export const COURSES: Course[] = [SEERAH, PROPHETS, ULUM, HADITH_SCI, AQIDAH, FIQH, AKHLAQ, ADHKAR, NAMES, RAMADAN, HAJJ, TAJWEED_DEEP];
export const courseById = (id: string): Course | undefined => COURSES.find((c) => c.id === id);
export type { Course, CourseId };
