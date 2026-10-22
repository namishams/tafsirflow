// mirrors mobile/src/features/abrahamic/courseText.ts (keep both in step): course texts in the languages a course's own
// tables do not carry yet, from the copied language files src/lib/learn/i18n/<lang>.json under the module key (the
// course id, "abrahamic" or "haramain").
// Entry shape: { lessons: { <lessonId>: { title, text, note?, quiz: [{ q, options: [...], why? }] } },
//                units: { <unitId>: { title?, text } } }  (quiz and options in the order of the course table).
// The course's own tables always win; anything a language file lacks stays English (pick falls back).
import { moduleText } from "@/lib/learn/i18n";
import type { CourseDef, L, Lesson } from "./core";

export type LessonTr = { title?: string; text?: string; note?: string; quiz?: { q?: string; options?: string[]; why?: string }[] };
export type CourseTr = { lessons?: Record<string, LessonTr>; units?: Record<string, { title?: string; text?: string }> };

/** the language file's entry for a course (empty for German and English, and while the file is still loading) */
export const courseTr = (module: string, lang: string): CourseTr => moduleText<CourseTr>(module, { en: {} }, lang);

const has = (x: L, lang: string) => !!(x as Record<string, string | undefined>)[lang];
function add(x: L, lang: string, s: string | undefined): L;
function add(x: L | undefined, lang: string, s: string | undefined): L | undefined;
function add(x: L | undefined, lang: string, s: string | undefined): L | undefined {
  return x && s && !has(x, lang) ? { ...x, [lang]: s } : x;
}

export function localizeLesson(l: Lesson, tr: LessonTr | undefined, lang: string): Lesson {
  if (!tr) return l;
  return {
    ...l,
    title: add(l.title, lang, tr.title),
    text: add(l.text, lang, tr.text),
    note: add(l.note, lang, tr.note),
    quiz: l.quiz.map((q, i) => {
      const t = tr.quiz?.[i];
      return t ? { ...q, q: add(q.q, lang, t.q), options: q.options.map((o, k) => add(o, lang, t.options?.[k])), why: add(q.why, lang, t.why) } : q;
    }),
  };
}

const cache = new WeakMap<object, Map<string, CourseDef>>();
/** the course with the language file's lesson texts added for this language (same object when there are none) */
export function localizeCourse(def: CourseDef, lang: string): CourseDef {
  const tr = courseTr(def.id, lang).lessons;
  if (!tr) return def;
  let m = cache.get(tr);
  if (!m) { m = new Map(); cache.set(tr, m); }
  const key = `${def.id}:${lang}`;
  let out = m.get(key);
  if (!out) { out = { ...def, lessons: def.lessons.map((l) => localizeLesson(l, tr[l.id], lang)) }; m.set(key, out); }
  return out;
}

/** a text of a course overview unit (units.<id>.<field>): own table, then the language file, then English */
export function unitText(module: string, id: string, field: "title" | "text", own: L, lang: string): string {
  return (own as Record<string, string | undefined>)[lang] ?? courseTr(module, lang).units?.[id]?.[field] ?? own.en;
}
