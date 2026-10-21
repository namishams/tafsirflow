import { readJSON, writeJSON } from "@/lib/store";
import { surahProgress } from "@/web/coach";
import { TAJWEED_LESSONS } from "@/web/tajweed";
import { COURSES, courseById, tx, type CourseId } from "@/features/courses";
import { readCP } from "@/features/courses/progress";
import { LEVELS as RP_LEVELS } from "@/features/reciter-path/curriculum";
import { LEVELS as AR_LEVELS, UNITS as AR_UNITS } from "@/features/arabic-lang/curriculum";
import { isDone as arDone, readProgress as readLang } from "@/features/arabic-lang/progress";
import { PASS as QAIDA_PASS, STAGES as QAIDA_STAGES } from "@/features/qaida/curriculum";
import { readQaida } from "@/features/qaida/progress";
import { readTests } from "@/features/srs/testgen";
import { ABRAHAMIC_COURSE } from "@/features/abrahamic/lessons";
import { HARAMAIN_COURSE } from "@/features/haramain/lessons";
import type { CourseDef } from "@/features/abrahamic/courseKit";
import { QUIZ_KEY, type QuizAnswers } from "@/features/plan/plan";
import { readExamLog } from "@/features/exam/integrity";
import { deviceLang } from "@/i18n";
import { readTradition, showsNahj } from "@/lib/tradition";
import { nahjEdition } from "@/features/hadith/nahj";
import { courseState as nahjCourseState } from "@/features/nahj-course/data";
import { nahjCourseText } from "@/features/nahj-course/text";

// The Madrasa: the app's existing courses arranged like a classical Islamic school. Nothing is copied or changed:
// every course of the school points at an existing course and reads its progress from that course's own store.
// Four stages (Ibtidāʾī, Mutawassiṭ, Thānawī, ʿĀlī), eight subjects with the Quran as the main subject, required
// and elective courses, a weekly timetable from the learner's daily minutes, semesters with a report card, and a
// rank measured only against the learner's own earlier semesters.

export type StageId = "ibtidai" | "idadi" | "thanawi" | "ali"; // same keys as the website's /masterclass (src/lib/masterclass.ts)
export type SubjectId = "quran" | "arabic" | "aqidah" | "fiqh" | "seerah" | "hadith" | "akhlaq" | "tafsir";
export const STAGES: { id: StageId; n: number; ar: string; tr: string }[] = [
  { id: "ibtidai", n: 1, ar: "المرحلة الابتدائية", tr: "al-Marḥala al-Ibtidāʾiyya" },
  { id: "idadi", n: 2, ar: "المرحلة الإعدادية", tr: "al-Marḥala al-Iʿdādiyya" },
  { id: "thanawi", n: 3, ar: "المرحلة الثانوية", tr: "al-Marḥala ath-Thānawiyya" },
  { id: "ali", n: 4, ar: "المرحلة العالية (الجامعية)", tr: "al-Marḥala al-ʿĀliya (al-Jāmiʿiyya)" },
];

// Faculties (kulliyyāt) and departments (aqsām) as at an Islamic university; every subject belongs to one
export type FacultyId = "quran" | "arabic" | "usul" | "sharia";
export const FACULTIES: { id: FacultyId; ar: string; tr: string }[] = [
  { id: "quran", ar: "كلية القرآن الكريم وعلومه", tr: "Kulliyyat al-Qurʾān al-Karīm wa ʿUlūmih" },
  { id: "arabic", ar: "كلية اللغة العربية", tr: "Kulliyyat al-Lugha al-ʿArabiyya" },
  { id: "usul", ar: "كلية أصول الدين", tr: "Kulliyyat Uṣūl ad-Dīn" },
  { id: "sharia", ar: "كلية الشريعة", tr: "Kulliyyat ash-Sharīʿa" },
];
export type DeptId = "tajwid" | "tafsir" | "hadith";
export const DEPARTMENTS: { id: DeptId; faculty: FacultyId; ar: string; tr: string }[] = [
  { id: "tajwid", faculty: "quran", ar: "قسم التجويد والقراءات", tr: "Qism at-Tajwīd wa al-Qirāʾāt" },
  { id: "tafsir", faculty: "quran", ar: "قسم التفسير", tr: "Qism at-Tafsīr" },
  { id: "hadith", faculty: "usul", ar: "قسم الحديث", tr: "Qism al-Ḥadīth" },
];
export const SUBJECT_PLACE: Record<SubjectId, { faculty: FacultyId; dept?: DeptId }> = {
  quran: { faculty: "quran", dept: "tajwid" }, tafsir: { faculty: "quran", dept: "tafsir" }, arabic: { faculty: "arabic" },
  aqidah: { faculty: "usul" }, hadith: { faculty: "usul", dept: "hadith" }, seerah: { faculty: "usul" }, akhlaq: { faculty: "usul" }, fiqh: { faculty: "sharia" },
};
/** the school's words: Arabic, transliteration (the translation is in the texts, key w_<id>) */
export const WORDS = {
  madda: { ar: "مادة", tr: "Mādda" }, dars: { ar: "درس", tr: "Dars" }, fasl: { ar: "فصل دراسي", tr: "Faṣl dirāsī" },
  kashf: { ar: "كشف الدرجات", tr: "Kashf ad-darajāt" }, sijill: { ar: "السجل الأكاديمي", tr: "as-Sijill al-akādīmī" }, sanad: { ar: "السند", tr: "as-Sanad" },
} as const;
export type WordId = keyof typeof WORDS;
export const SUBJECTS: { id: SubjectId; ar: string }[] = [
  { id: "quran", ar: "القرآن الكريم" }, { id: "arabic", ar: "اللغة العربية" }, { id: "aqidah", ar: "العقيدة" }, { id: "fiqh", ar: "فقه العبادات" },
  { id: "seerah", ar: "السيرة" }, { id: "hadith", ar: "الحديث" }, { id: "akhlaq", ar: "الأخلاق" }, { id: "tafsir", ar: "التفسير" },
];

type Source =
  | { k: "course"; id: CourseId }
  | { k: "rp"; from: number; to: number }
  | { k: "qaida" } | { k: "tajweed" }
  | { k: "arabic"; level: "A1" | "A2" | "B1" | "B2" | "C1" }
  | { k: "juz"; juz: number[] }
  | { k: "shams"; surahs: number[] }
  | { k: "kit"; def: CourseDef }
  | { k: "nahj" };
export type SchoolCourse = { id: string; stage: StageId; subject: SubjectId; required: boolean; src: Source };
/** the Nahj al-Balagha elective is part of the school only when the learner shows the Nahj al-Balagha (Shia mode by default, opt-in otherwise) */
const visibleCourse = (c: SchoolCourse) => c.src.k !== "nahj" || showsNahj(readTradition());

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const C = (id: string, stage: StageId, subject: SubjectId, required: boolean, src: Source): SchoolCourse => ({ id, stage, subject, required, src });

/** the curriculum: which existing course belongs to which stage and subject */
export const CURRICULUM: SchoolCourse[] = [
  // Ibtidāʾī – foundation: reading, first tajweed, Juz ʿAmma, basics of belief and worship
  C("qaida", "ibtidai", "quran", true, { k: "qaida" }),
  C("tajweed", "ibtidai", "quran", true, { k: "tajweed" }),
  C("rp-1-3", "ibtidai", "quran", true, { k: "rp", from: 1, to: 3 }),
  C("juz-30", "ibtidai", "quran", true, { k: "juz", juz: [30] }),
  C("shams-short", "ibtidai", "tafsir", true, { k: "shams", surahs: [1, 103, 108, 112, 113, 114] }),
  C("ar-a1", "ibtidai", "arabic", true, { k: "arabic", level: "A1" }),
  C("ar-a2", "ibtidai", "arabic", true, { k: "arabic", level: "A2" }),
  C("aqidah", "ibtidai", "aqidah", true, { k: "course", id: "aqidah" }),
  C("fiqh", "ibtidai", "fiqh", true, { k: "course", id: "fiqh-salah-sawm" }),
  C("prophets", "ibtidai", "seerah", true, { k: "course", id: "prophets" }),
  C("adhkar", "ibtidai", "akhlaq", true, { k: "course", id: "adhkar" }),
  C("names", "ibtidai", "aqidah", false, { k: "course", id: "names" }),
  // Mutawassiṭ – intermediate
  C("rp-4-6", "idadi", "quran", true, { k: "rp", from: 4, to: 6 }),
  C("juz-29", "idadi", "quran", true, { k: "juz", juz: [29] }),
  C("shams-amma", "idadi", "tafsir", true, { k: "shams", surahs: range(78, 102) }),
  C("ar-b1", "idadi", "arabic", true, { k: "arabic", level: "B1" }),
  C("seerah", "idadi", "seerah", true, { k: "course", id: "seerah" }),
  C("akhlaq", "idadi", "akhlaq", true, { k: "course", id: "akhlaq" }),
  C("ramadan", "idadi", "fiqh", true, { k: "course", id: "ramadan" }),
  C("hajj", "idadi", "fiqh", false, { k: "course", id: "hajj" }),
  C("haramain", "idadi", "seerah", false, { k: "kit", def: HARAMAIN_COURSE }),
  // Thānawī – advanced
  C("rp-7-8", "thanawi", "quran", true, { k: "rp", from: 7, to: 8 }),
  C("juz-27-28", "thanawi", "quran", true, { k: "juz", juz: [28, 27] }),
  C("tajweed-deep", "thanawi", "quran", true, { k: "course", id: "tajweed-deep" }),
  C("ar-b2", "thanawi", "arabic", true, { k: "arabic", level: "B2" }),
  C("hadith-sci", "thanawi", "hadith", true, { k: "course", id: "hadith-sci" }),
  C("ulum", "thanawi", "tafsir", true, { k: "course", id: "ulum" }),
  C("shams-mid", "thanawi", "tafsir", true, { k: "shams", surahs: [67, 36, 55, 56, 18, 32] }),
  C("abrahamic", "thanawi", "aqidah", false, { k: "kit", def: ABRAHAMIC_COURSE }),
  C("nahj", "thanawi", "aqidah", false, { k: "nahj" }), // elective in Kulliyyat Uṣūl ad-Dīn
  // ʿĀlī – higher: the reciter's last levels, juz exams, Arabic C1, long surahs
  C("rp-9-10", "ali", "quran", true, { k: "rp", from: 9, to: 10 }),
  C("juz-1-2", "ali", "quran", true, { k: "juz", juz: [1, 2] }),
  C("ar-c1", "ali", "arabic", true, { k: "arabic", level: "C1" }),
  C("shams-long", "ali", "tafsir", true, { k: "shams", surahs: [2, 12, 19, 24, 25, 49] }),
];
/** academy courses not placed in the curriculum yet (shown in the stage view as further electives) */
export const unplacedCourses = () => COURSES.filter((c) => !CURRICULUM.some((x) => x.src.k === "course" && x.src.id === c.id));

export const coursesOf = (stage: StageId) => CURRICULUM.filter((c) => c.stage === stage && visibleCourse(c));

// ---------- progress of one course, read from its own store ----------
export type CourseState = { done: number; grade: number | null; graded: number };
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
type RpStore = { units: Record<string, number>; exams: Record<string, number>; certs: Record<string, string> };

export function stateOf(c: SchoolCourse): CourseState {
  const s = c.src;
  switch (s.k) {
    case "course": {
      const course = courseById(s.id);
      if (!course) return { done: 0, grade: null, graded: 0 };
      const p = readCP();
      const scores = course.lessons.map((l) => p.done[`${s.id}/${l.id}`]?.score).filter((x): x is number => typeof x === "number");
      const passed = scores.filter((x) => x >= 0.7).length;
      return { done: course.lessons.length ? passed / course.lessons.length : 0, grade: avg(scores), graded: scores.length };
    }
    case "rp": {
      const p = { units: {}, exams: {}, certs: {}, ...readJSON<Partial<RpStore>>("qmc.reciterPath", {}) } as RpStore;
      const levels = RP_LEVELS.filter((l) => l.n >= s.from && l.n <= s.to);
      const units = levels.flatMap((l) => l.units);
      const unitsDone = units.filter((u) => (p.units[u.id] ?? 0) >= 0.8).length;
      const certs = levels.filter((l) => p.certs[l.n]).length;
      const exams = levels.map((l) => p.exams[l.n]).filter((x): x is number => typeof x === "number");
      const unitScores = units.map((u) => p.units[u.id]).filter((x): x is number => typeof x === "number");
      const grade = exams.length ? avg(exams) : avg(unitScores);
      return { done: (unitsDone + certs) / Math.max(1, units.length + levels.length), grade, graded: exams.length || unitScores.length };
    }
    case "qaida": {
      const p = readQaida();
      const lessons = QAIDA_STAGES.flatMap((st) => st.lessons);
      const best = lessons.map((l) => p.done[l.id]?.best).filter((x): x is number => typeof x === "number");
      return { done: lessons.length ? best.filter((b) => b >= QAIDA_PASS).length / lessons.length : 0, grade: avg(best.map((b) => b / 100)), graded: best.length };
    }
    case "tajweed": {
      const r = readJSON<Record<string, number>>("tf:tajweed", {});
      const pct = TAJWEED_LESSONS.map((l) => r[l.id]).filter((x): x is number => typeof x === "number");
      return { done: TAJWEED_LESSONS.length ? pct.filter((x) => x >= 70).length / TAJWEED_LESSONS.length : 0, grade: avg(pct.map((x) => x / 100)), graded: pct.length };
    }
    case "arabic": {
      const p = readLang();
      const i = AR_LEVELS.findIndex((l) => l.level === s.level);
      const from = i > 0 ? AR_LEVELS[i - 1].lastUnit + 1 : 1, to = AR_LEVELS[i]?.lastUnit ?? 0;
      const units = AR_UNITS.filter((u) => u.n >= from && u.n <= to);
      const lessons = units.flatMap((u) => u.lessons);
      const tests = units.map((u) => p.done[`u${u.n}-test`]?.score).filter((x): x is number => typeof x === "number");
      return { done: lessons.length ? lessons.filter((l) => arDone(p, l.id)).length / lessons.length : 0, grade: avg(tests), graded: tests.length };
    }
    case "juz": {
      const t = readTests();
      const certs = new Set(t.certs.map((c) => c.juz));
      const best = s.juz.map((j) => Math.max(-1, ...t.results.filter((r) => r.kind === "juz" && Number(r.ref) === j && r.total).map((r) => r.score / r.total))).filter((x) => x >= 0);
      return { done: s.juz.filter((j) => certs.has(j)).length / s.juz.length, grade: avg(best), graded: best.length };
    }
    case "shams": {
      const sp = surahProgress();
      const rows = s.surahs.map((n) => sp[n - 1]).filter(Boolean);
      const total = rows.reduce((a, r) => a + r.total, 0), learned = rows.reduce((a, r) => a + r.learned, 0);
      return { done: total ? learned / total : 0, grade: null, graded: 0 };
    }
    case "nahj": {
      const cs = nahjCourseState(nahjEdition(deviceLang()));
      return { done: cs.done, grade: cs.grade, graded: cs.graded };
    }
    case "kit": {
      const p = readJSON<{ done: Record<string, { score: number; of: number }> }>(s.def.storeKey, { done: {} });
      const rows = s.def.lessons.map((l) => p.done?.[l.id]).filter(Boolean) as { score: number; of: number }[];
      const sc = rows.reduce((a, r) => a + r.score, 0), of = rows.reduce((a, r) => a + r.of, 0);
      return { done: s.def.lessons.length ? rows.length / s.def.lessons.length : 0, grade: of ? sc / of : null, graded: rows.length };
    }
  }
}

/** where a course opens */
export function hrefOf(c: SchoolCourse): string {
  const s = c.src;
  switch (s.k) {
    case "course": return `/courses/${s.id}`;
    case "rp": return "/reciter-path";
    case "qaida": return "/arabic/read";
    case "tajweed": return "/tajweed";
    case "arabic": return "/arabic/lang";
    case "juz": return `/tests/juz?ref=${s.juz[0]}`;
    case "shams": return `/shams/${s.surahs.find((n) => { const r = surahProgress()[n - 1]; return r && r.learned < r.total; }) ?? s.surahs[0]}`;
    case "kit": return s.def.route;
    case "nahj": return "/nahj-studies";
  }
}

/** a course's name; the generic names come from the school texts (st) */
export function titleOf(c: SchoolCourse, lang: string, st: (k: "c_qaida" | "c_tajweed" | "c_rp" | "c_juz" | "c_shams" | "c_ar", p?: Record<string, string | number>) => string): string {
  const s = c.src;
  switch (s.k) {
    case "course": { const course = courseById(s.id); return course ? tx(course.title, lang) : s.id; }
    case "rp": return st("c_rp", { a: s.from, b: s.to });
    case "qaida": return st("c_qaida");
    case "tajweed": return st("c_tajweed");
    case "arabic": return st("c_ar", { level: s.level });
    case "juz": return st("c_juz", { list: s.juz.join(", ") });
    case "shams": return st("c_shams", { n: s.surahs.length });
    case "nahj": return nahjCourseText(lang).short;
    case "kit": return (s.def.title as Record<string, string | undefined>)[lang] ?? s.def.title.en;
  }
}

// ---------- stages and subjects ----------
export type StageState = { id: StageId; required: number; done: number; complete: boolean };
export function stageState(stage: StageId): StageState {
  const req = coursesOf(stage).filter((c) => c.required).map(stateOf);
  const done = req.length ? req.reduce((a, s) => a + Math.min(1, s.done), 0) / req.length : 1;
  return { id: stage, required: req.length, done, complete: req.every((s) => s.done >= 0.999) };
}
/** the learner's stage: the first one whose required courses are not all complete */
export function currentStage(): StageId {
  return STAGES.find((s) => !stageState(s.id).complete)?.id ?? "ali";
}

export type SubjectGrade = { subject: SubjectId; grade: number | null; done: number };
/** subject grades over the stages up to and including the learner's stage (graded courses only) */
export function subjectGrades(upTo: StageId = currentStage()): SubjectGrade[] {
  const n = STAGES.find((s) => s.id === upTo)!.n;
  const cs = CURRICULUM.filter((c) => STAGES.find((s) => s.id === c.stage)!.n <= n && visibleCourse(c));
  return SUBJECTS.map(({ id }) => {
    const mine = cs.filter((c) => c.subject === id).map((c) => ({ c, st: stateOf(c) }));
    const graded = mine.filter((x) => x.st.grade !== null && x.st.graded > 0);
    const w = graded.reduce((a, x) => a + x.st.graded, 0);
    const grade = w ? graded.reduce((a, x) => a + (x.st.grade as number) * x.st.graded, 0) / w : null;
    const req = mine.filter((x) => x.c.required);
    return { subject: id, grade, done: req.length ? req.reduce((a, x) => a + Math.min(1, x.st.done), 0) / req.length : 0 };
  });
}
/** the Quran counts double in the overall grade: it is the main subject */
export function overallGrade(g: SubjectGrade[]): number | null {
  let s = 0, w = 0;
  for (const x of g) if (x.grade !== null) { const k = x.subject === "quran" ? 2 : 1; s += x.grade * k; w += k; }
  return w ? s / w : null;
}
export type GradeKey = "mumtaz" | "jayyidJiddan" | "jayyid" | "maqbul" | "notYet";
export const GRADE_AR: Record<GradeKey, string> = { mumtaz: "ممتاز", jayyidJiddan: "جيد جدًا", jayyid: "جيد", maqbul: "مقبول", notYet: "—" };
export const GRADE_TR: Record<GradeKey, string> = { mumtaz: "Mumtāz", jayyidJiddan: "Jayyid jiddan", jayyid: "Jayyid", maqbul: "Maqbūl", notYet: "" };
export const gradeKey = (g: number) => (g >= 0.9 ? "mumtaz" : g >= 0.8 ? "jayyidJiddan" : g >= 0.7 ? "jayyid" : g >= 0.6 ? "maqbul" : "notYet") as GradeKey;

// ---------- semesters, report cards, own rank ----------
export type TermId = string; // "2026-2": July–December 2026
export const termOf = (d = new Date()): TermId => `${d.getFullYear()}-${d.getMonth() < 6 ? 1 : 2}`;
export function termBounds(id: TermId) {
  const [y, h] = id.split("-").map(Number);
  return { start: new Date(y, h === 1 ? 0 : 6, 1).getTime(), end: new Date(h === 1 ? y : y + 1, h === 1 ? 6 : 0, 1).getTime() };
}
export const prevTerm = (id: TermId): TermId => { const [y, h] = id.split("-").map(Number); return h === 2 ? `${y}-1` : `${y - 1}-2`; };

const KEY = "qmc.school.v1";
export type Snapshot = { subjects: Partial<Record<SubjectId, number | null>>; overall: number | null; done: number; stage: StageId; at: number };
export type SchoolStore = { minutes?: number; terms: Record<TermId, Snapshot>; baseline: Record<TermId, number> };
const EMPTY: SchoolStore = { terms: {}, baseline: {} };
export const readSchool = (): SchoolStore => ({ ...EMPTY, ...readJSON<Partial<SchoolStore>>(KEY, {}) });
export const SCHOOL_KEY = KEY;

/** overall learning progress 0..1 across all required courses (for the semester's gain) */
export function totalDone(): number {
  const req = CURRICULUM.filter((c) => c.required).map(stateOf);
  return req.length ? req.reduce((a, s) => a + Math.min(1, s.done), 0) / req.length : 0;
}

/** the live report of now */
export function liveSnapshot(): Snapshot {
  const stage = currentStage();
  const g = subjectGrades(stage);
  return { subjects: Object.fromEntries(g.map((x) => [x.subject, x.grade])), overall: overallGrade(g), done: totalDone(), stage, at: Date.now() };
}

/** keeps the semester's report (the last state seen in it) and the progress at its start; called by the screens */
export function recordSnapshot(live = liveSnapshot()) {
  const s = readSchool();
  const term = termOf();
  const old = s.terms[term];
  const baseline = s.baseline[term] ?? (s.terms[prevTerm(term)]?.done ?? live.done);
  const same = old && old.overall === live.overall && Math.abs(old.done - live.done) < 0.0005 && old.stage === live.stage && s.baseline[term] !== undefined;
  if (same) return;
  writeJSON(KEY, { ...s, terms: { ...s.terms, [term]: live }, baseline: { ...s.baseline, [term]: baseline } }, true);
}
export function setMinutes(m: number) { writeJSON(KEY, { ...readSchool(), minutes: m }, true); }

/** rank only against the learner's own semesters (no other learners, no invented numbers) */
export function ownRank(current: Snapshot, terms: Record<TermId, Snapshot>, term = termOf()) {
  const past = Object.entries(terms).filter(([id, s]) => id !== term && s.overall !== null) as [TermId, Snapshot & { overall: number }][];
  if (current.overall === null || !past.length) return null;
  const all = [...past.map(([id, s]) => ({ id, v: s.overall })), { id: term, v: current.overall }].sort((a, b) => b.v - a.v);
  const prev = terms[prevTerm(term)];
  return { rank: all.findIndex((x) => x.id === term) + 1, of: all.length, best: all[0].id, delta: prev?.overall != null ? current.overall - prev.overall : null };
}

/** exam attempts of this device in a semester (also void ones: the report shows honesty, too) */
export function termExams(term: TermId) {
  const { start, end } = termBounds(term);
  const a = readExamLog().attempts.filter((x) => x.at >= start && x.at < end);
  return { taken: a.filter((x) => x.status === "submitted").length, passed: a.filter((x) => x.passed).length, verified: a.filter((x) => x.sig).length };
}

// ---------- weekly timetable ----------
export type Slot = { course: SchoolCourse; minutes: number };
export function dailyMinutes(): number {
  const own = readSchool().minutes;
  if (own) return own;
  const quiz = readJSON<QuizAnswers | null>(QUIZ_KEY, null);
  return quiz?.minutes && quiz.minutes > 0 ? quiz.minutes : 20;
}
/** seven days, Monday first: the Quran every day (about half the time), other subjects in rotation */
export function timetable(minutes = dailyMinutes(), stage = currentStage()): Slot[][] {
  const order = (cs: SchoolCourse[]) => cs.map((c) => ({ c, st: stateOf(c) })).filter((x) => x.st.done < 0.999)
    .sort((a, b) => Number(b.c.required) - Number(a.c.required) || a.st.done - b.st.done).map((x) => x.c);
  const n = STAGES.find((s) => s.id === stage)!.n;
  let pool = coursesOf(stage);
  if (order(pool).length === 0 && n < 4) pool = coursesOf(STAGES[n].id);
  const quran = order(pool.filter((c) => c.subject === "quran"));
  const quranAll = quran.length ? quran : pool.filter((c) => c.subject === "quran");
  const others = order(pool.filter((c) => c.subject !== "quran"));
  const qMin = Math.max(5, Math.round((minutes * 0.5) / 5) * 5);
  const rest = Math.max(0, minutes - qMin);
  const perDay = rest >= 20 ? 2 : rest >= 5 ? 1 : 0;
  let k = 0;
  return Array.from({ length: 7 }, (_, d) => {
    const day: Slot[] = [];
    if (quranAll.length) day.push({ course: quranAll[d % Math.min(2, quranAll.length)], minutes: qMin });
    for (let i = 0; i < perDay && others.length; i++) day.push({ course: others[k++ % others.length], minutes: Math.max(5, Math.round(rest / perDay / 5) * 5) });
    return day;
  });
}

// ---------- honest app ranks ----------
// Ṭālib → Ṭālib mutaqaddim (after the Ibtidāʾiyya) → Ḥāfiẓ of a juz (only for a juz whose certificate a reviewer has
// confirmed). Titles such as Ḥāfiẓ al-Qurʾān, Muqriʾ, Mujāz or Shaykh are never given by the app.
export type AppRank = { key: "talib" | "mutaqaddim"; ar: string; tr: string; hafizJuz: number[] };
export function appRank(verifiedJuz: number[]): AppRank {
  const adv = stageState("ibtidai").complete;
  return { key: adv ? "mutaqaddim" : "talib", ar: adv ? "طالب متقدم" : "طالب", tr: adv ? "Ṭālib mutaqaddim" : "Ṭālib", hafizJuz: [...new Set(verifiedJuz)].sort((a, b) => a - b) };
}
