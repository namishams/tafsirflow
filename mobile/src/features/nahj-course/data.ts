import { readJSON, useStored, writeJSON } from "@/lib/store";
import { nahjEdition, nahjPassageById, nahjAllPassages, type NahjEdition, type NahjPassage } from "@/features/hadith/nahj";
import { nahjContentVersion, nahjFile } from "@/features/hadith/nahjContent";

// "Nahj al-Balagha studies": thematic units and lessons built from passage ids, the prebuilt explanations, reflection
// questions and quizzes (nahj-study-<edition>.json), and the lesson plan (nahj-study-course.json). All three files are
// derived from the owner's editions: never committed or bundled; the server serves them and the app keeps a copy
// (features/hadith/nahjContent.ts). Nothing is generated at runtime; there is no AI.
export type Qn = { q: string; o: string[]; a: number };
export type Study = { e: string; r: string[]; z?: Qn[] };
type StudyBook = { note: string; lang: NahjEdition; items: Record<string, Study> };
type RawLesson = { id: string; title: { en: string; de: string }; aim: { en: string; de: string }; items: string[] };
type RawUnit = { id: string; theme: number; lessons: RawLesson[] };
type RawCourse = { units: RawUnit[] };

const EMPTY_STUDY = (ed: NahjEdition): StudyBook => ({ note: "", lang: ed, items: {} });
const studyBook = (ed: NahjEdition): StudyBook => nahjFile<StudyBook>(ed === "de" ? "study-de" : "study-en") ?? EMPTY_STUDY(ed);
const course = (): RawCourse => nahjFile<RawCourse>("study-course") ?? { units: [] };

/** the prebuilt study content of one passage, or null */
export const studyOf = (ed: NahjEdition, id: string): Study | null => studyBook(ed).items[id] ?? null;
export const studyNote = (ed: NahjEdition) => studyBook(ed).note;
export const studyCount = (ed: NahjEdition) => Object.keys(studyBook(ed).items).length;

export type Lesson = { id: string; unit: string; n: number; title: string; aim: string; items: NahjPassage[] };
export type Unit = { id: string; theme: number; n: number; lessons: Lesson[] };
const built = new Map<NahjEdition, Unit[]>();
/** the units of the course for an edition (passages this edition does not carry are left out; empty lessons vanish) */
let builtAt = -1;
export function courseUnits(ed: NahjEdition): Unit[] {
  if (builtAt !== nahjContentVersion()) { built.clear(); builtAt = nahjContentVersion(); }
  if (!built.has(ed)) {
    let n = 0;
    const units = course().units.map((u, ui): Unit => ({
      id: u.id, theme: u.theme, n: ui + 1,
      lessons: u.lessons.map((l) => ({
        id: l.id, unit: u.id, n: 0, title: l.title[ed] ?? l.title.en, aim: l.aim[ed] ?? l.aim.en,
        items: l.items.map((id) => nahjPassageById(ed, id)).filter((p): p is NahjPassage => !!p && !!studyOf(ed, p.id)),
      })).filter((l) => l.items.length).map((l) => ({ ...l, n: ++n })),
    })).filter((u) => u.lessons.length);
    built.set(ed, units);
  }
  return built.get(ed)!;
}
export const allLessons = (ed: NahjEdition) => courseUnits(ed).flatMap((u) => u.lessons);
export const lessonById = (ed: NahjEdition, id: string) => allLessons(ed).find((l) => l.id === id) ?? null;
export const unitById = (ed: NahjEdition, id: string) => courseUnits(ed).find((u) => u.id === id) ?? null;

// ---------- quizzes (assembled from the prebuilt questions; deterministic) ----------
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const snippet = (t: string) => { const w = t.split(/\s+/).slice(0, 14).join(" "); return w.length < t.length ? `${w} …` : w; };
const firstSentence = (s: string) => { const m = s.match(/^.{20,200}?[.!?](\s|$)/); return (m ? m[0] : s.slice(0, 160)).trim(); };

/** questions for a set of passages: one prebuilt question per sermon or letter (rotating through its three), then
 *  "which passage is summarised here" questions for sayings, so that every lesson has about four to six questions */
export function quizFor(ed: NahjEdition, items: NahjPassage[], pool: NahjPassage[], max: number, salt = 0): Qn[] {
  const out: Qn[] = [];
  items.forEach((p, i) => {
    const z = studyOf(ed, p.id)?.z;
    if (z?.length) out.push(z[(i + salt) % z.length]);
  });
  const sayings = items.filter((p) => !studyOf(ed, p.id)?.z?.length);
  for (const p of sayings) {
    if (out.length >= max) break;
    const others = pool.filter((x) => x.id !== p.id && x.kind === p.kind);
    if (others.length < 2) continue;
    const pick = [0, 1].map((k) => others[(hash(p.id) + k * 7919) % others.length]);
    if (pick[0].id === pick[1].id) continue;
    const at = hash(`${p.id}:${salt}`) % 3;
    const opts = pick.map((x) => snippet(x.text));
    opts.splice(at, 0, snippet(p.text));
    out.push({ q: `matchQ|${firstSentence(studyOf(ed, p.id)!.e)}`, o: opts, a: at });
  }
  // shuffle a little but deterministically, then cut
  return out.map((q, i) => ({ q, k: hash(`${salt}:${i}:${q.q}`) })).sort((a, b) => a.k - b.k).map((x) => x.q).slice(0, max);
}
export const lessonQuiz = (ed: NahjEdition, l: Lesson) => quizFor(ed, l.items, nahjAllPassages(ed), 5);
export function unitTest(ed: NahjEdition, u: Unit): Qn[] {
  const pool = nahjAllPassages(ed);
  return u.lessons.flatMap((l, i) => quizFor(ed, l.items, pool, 2, i + 1)).slice(0, 10);
}
export const PASS_LESSON = 0.6, PASS_UNIT = 0.7;

// ---------- progress ----------
export type NahjCourseProgress = {
  lessons: Record<string, { at: number; score: number; of: number }>;
  units: Record<string, { at: number; pct: number }>;
  cert?: { at: number; pct: number };
  font?: number; // 0..3 steps for the reading size
  last?: string; // last lesson opened
};
export const PROGRESS_KEY = "qmc.nahjCourse.v1";
const EMPTY: NahjCourseProgress = { lessons: {}, units: {} };
export const useNahjProgress = () => useStored<NahjCourseProgress>(PROGRESS_KEY, EMPTY);
export const readNahjProgress = () => ({ ...EMPTY, ...readJSON<Partial<NahjCourseProgress>>(PROGRESS_KEY, {}) });
const save = (p: NahjCourseProgress) => writeJSON(PROGRESS_KEY, p);
export const setFont = (font: number) => save({ ...readNahjProgress(), font: Math.max(0, Math.min(3, font)) });
export const setLast = (id: string) => { const p = readNahjProgress(); if (p.last !== id) save({ ...p, last: id }); };

function checkCert(ed: NahjEdition, p: NahjCourseProgress): NahjCourseProgress {
  if (p.cert) return p;
  const us = courseUnits(ed);
  const ok = us.every((u) => u.lessons.every((l) => p.lessons[l.id]) && p.units[u.id]);
  if (!ok) return p;
  const sc = Object.values(p.lessons).reduce((a, x) => a + x.score, 0), of = Object.values(p.lessons).reduce((a, x) => a + x.of, 0);
  return { ...p, cert: { at: Date.now(), pct: of ? Math.round((100 * sc) / of) : 100 } };
}
/** stores a lesson result; first = the first time this lesson was passed (rewards), complete = the course is now complete */
export function markLesson(ed: NahjEdition, id: string, score: number, of: number): { first: boolean; passed: boolean; complete: boolean } {
  const p = readNahjProgress();
  const passed = of === 0 || score / of >= PASS_LESSON;
  const prev = p.lessons[id];
  if (!passed) return { first: false, passed, complete: false };
  const next = checkCert(ed, { ...p, lessons: { ...p.lessons, [id]: { at: prev?.at ?? Date.now(), score: Math.max(prev?.score ?? 0, score), of } } });
  save(next);
  return { first: !prev, passed, complete: !!next.cert && !p.cert };
}
export function markUnit(ed: NahjEdition, id: string, score: number, of: number): { first: boolean; passed: boolean; complete: boolean } {
  const p = readNahjProgress();
  const pct = of ? score / of : 1;
  if (pct < PASS_UNIT) return { first: false, passed: false, complete: false };
  const prev = p.units[id];
  const next = checkCert(ed, { ...p, units: { ...p.units, [id]: { at: prev?.at ?? Date.now(), pct: Math.max(prev?.pct ?? 0, pct) } } });
  save(next);
  return { first: !prev, passed: true, complete: !!next.cert && !p.cert };
}

export type CourseState = { lessonsDone: number; lessons: number; unitsPassed: number; units: number; done: number; grade: number | null; graded: number };
/** progress 0..1 for the school's report card (lessons and unit tests count equally) */
export function courseState(ed: NahjEdition, p = readNahjProgress()): CourseState {
  const us = courseUnits(ed);
  const ls = us.flatMap((u) => u.lessons);
  const lessonsDone = ls.filter((l) => p.lessons[l.id]).length, unitsPassed = us.filter((u) => p.units[u.id]).length;
  const total = ls.length + us.length;
  const scores = [...ls.map((l) => p.lessons[l.id]).filter(Boolean).map((x) => x.score / (x.of || 1)), ...us.map((u) => p.units[u.id]?.pct).filter((x): x is number => typeof x === "number")];
  return { lessonsDone, lessons: ls.length, unitsPassed, units: us.length, done: total ? (lessonsDone + unitsPassed) / total : 0, grade: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null, graded: scores.length };
}
/** the lesson to continue with: the first not yet passed */
export function nextLesson(ed: NahjEdition, p = readNahjProgress()): Lesson | null {
  return allLessons(ed).find((l) => !p.lessons[l.id]) ?? null;
}

/** the saying of the day: a short saying, the same all day, with prebuilt study content */
export function sayingOfTheDay(ed: NahjEdition, now = new Date()): NahjPassage | null {
  const c = nahjAllPassages(ed).filter((p) => p.kind === "saying" && !p.part && p.text.split(" ").length <= 80 && studyOf(ed, p.id));
  if (!c.length) return null;
  const day = Math.floor((now.getTime() - now.getTimezoneOffset() * 60000) / 86400000);
  return c[(hash(String(day)) + day) % c.length];
}
export { nahjEdition };
