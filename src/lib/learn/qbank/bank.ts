// mirrors mobile/src/features/qbank/bank.ts for the website: the subjects, stages and tiers of the examination centre
// and the question bank. The bank is the app's (mobile/src/features/qbank/data, exported by
// `node scripts/sync-qbank-learn.mjs` to public/learn/qbank/bank-<lang>.json) and is fetched in the browser on first
// use, one file per question language, so the pages stay light. Quran text is never typed: a question points at a verse key.
import type { SubjectId as SchoolSubject, StageId } from "@/lib/learn/school/model";
import type { QDifficulty, QLoc, QReview, QStage, QSubject, QTradition } from "./types";
import { BANK_VERSION } from "./bankVersion";

/** the whole bank is draft content: it is shown with this status until scholars have reviewed it */
export const BANK_REVIEW: { status: QReview; note: string } = {
  status: "needs_review",
  note: "Written from established scholarship, not yet reviewed by a scholar. Questions can be reported from the app.",
};

export type SubjectMeta = { id: QSubject; ar: string; tr: string; school: SchoolSubject };
export const SUBJECTS: SubjectMeta[] = [
  { id: "tajweed", ar: "التجويد", tr: "at-Tajwīd", school: "quran" },
  { id: "qiraat", ar: "القراءات", tr: "al-Qirāʾāt", school: "quran" },
  { id: "ulum", ar: "علوم القرآن", tr: "ʿUlūm al-Qurʾān", school: "tafsir" },
  { id: "tafsir", ar: "التفسير", tr: "at-Tafsīr", school: "tafsir" },
  { id: "seerah", ar: "السيرة النبوية", tr: "as-Sīra an-Nabawiyya", school: "seerah" },
  { id: "prophets", ar: "قصص الأنبياء", tr: "Qaṣaṣ al-Anbiyāʾ", school: "seerah" },
  { id: "hadith", ar: "علوم الحديث", tr: "ʿUlūm al-Ḥadīth", school: "hadith" },
  { id: "aqidah", ar: "العقيدة", tr: "al-ʿAqīda", school: "aqidah" },
  { id: "fiqh", ar: "فقه العبادات", tr: "Fiqh al-ʿIbādāt", school: "fiqh" },
  { id: "nahw", ar: "النحو والصرف", tr: "an-Naḥw wa-ṣ-Ṣarf", school: "arabic" },
  { id: "vocab", ar: "مفردات القرآن", tr: "Mufradāt al-Qurʾān", school: "arabic" },
  { id: "history", ar: "التاريخ الإسلامي", tr: "at-Tārīkh al-Islāmī", school: "seerah" },
];
export const subjectMeta = (id: string) => SUBJECTS.find((s) => s.id === id);

export const STAGE_IDS: Record<QStage, StageId> = { 1: "ibtidai", 2: "idadi", 3: "thanawi", 4: "ali" };
export const STAGE_AR: Record<QStage, string> = { 1: "المرحلة الابتدائية", 2: "المرحلة الإعدادية", 3: "المرحلة الثانوية", 4: "المرحلة العالية" };
export const STAGES: QStage[] = [1, 2, 3, 4];
export const TIERS: QDifficulty[] = [1, 2, 3, 4, 5, 6, 7];
export const TIER_AR: Record<QDifficulty, string> = { 1: "مبتدئ", 2: "متوسط", 3: "متمكن", 4: "متقن", 5: "متميز", 6: "متقدم", 7: "عالم" };
export const SCHOLAR_TIERS: QDifficulty[] = [6, 7];

/** question language: German and Arabic have their own text, every other language reads the English one
 *  (unless the learner picked a question language in the settings of the centre) */
export type QLang = "en" | "de" | "ar";
export const qLangOf = (appLang: string, pref: "auto" | QLang = "auto"): QLang => (pref !== "auto" ? pref : appLang === "de" ? "de" : appLang === "ar" ? "ar" : "en");

/** one question: the app's fields, the texts per loaded question language in `loc` */
export type Q = {
  id: string; s: QSubject; g: QStage; d: QDifficulty; t: string[]; src: string; tr?: QTradition[]; v?: string; w?: number; rv?: QReview;
  review: QReview;
  loc: Partial<Record<QLang, QLoc>>;
};
type Row = [string, QSubject, QStage, QDifficulty, string[], string, QTradition[], string, number, string, string, [string, string, string, string], string];

let list: Q[] | null = null;
let byId = new Map<string, Q>();
const loaded = new Set<QLang>();
const pending = new Map<QLang, Promise<void>>();

function addRows(lang: QLang, rows: Row[]) {
  if (!list) {
    list = rows.map(([id, s, g, d, t, src, tr, v, w, rv]) => ({
      id, s, g, d, t, src, ...(tr.length ? { tr } : {}), ...(v ? { v } : {}), ...(w ? { w } : {}), ...(rv ? { rv: rv as QReview } : {}),
      review: (rv as QReview) || BANK_REVIEW.status, loc: {},
    }));
    byId = new Map(list.map((q) => [q.id, q]));
  }
  for (const r of rows) { const q = byId.get(r[0]); if (q) q.loc[lang] = [r[10], r[11], r[12]]; }
  loaded.add(lang);
}

/** loads one question language (once) */
export function loadBank(lang: QLang): Promise<void> {
  if (loaded.has(lang)) return Promise.resolve();
  let p = pending.get(lang);
  if (!p) {
    p = fetch(`/learn/qbank/bank-${lang}.json?v=${BANK_VERSION}`)
      .then((r) => { if (!r.ok) throw new Error(`bank ${r.status}`); return r.json() as Promise<Row[]>; })
      .then((rows) => addRows(lang, rows))
      .finally(() => pending.delete(lang));
    pending.set(lang, p);
  }
  return p;
}
export const bankReady = (lang?: QLang) => (lang ? loaded.has(lang) : loaded.size > 0);

/** every question of every bank (empty until a language is loaded) */
export const allQuestions = (): Q[] => list ?? [];
export const questionById = (id: string): Q | undefined => byId.get(id);
/** the texts of a question in a language (the English, or any loaded one, while that language is not loaded) */
export const locOf = (q: Q, lang: QLang): QLoc => q.loc[lang] ?? q.loc.en ?? q.loc.de ?? q.loc.ar ?? ["", ["", "", "", ""], ""];

export function countsBySubject(): Record<QSubject, { total: number; stages: Record<QStage, number>; tiers: Record<number, number> }> {
  const out = {} as Record<QSubject, { total: number; stages: Record<QStage, number>; tiers: Record<number, number> }>;
  for (const s of SUBJECTS) out[s.id] = { total: 0, stages: { 1: 0, 2: 0, 3: 0, 4: 0 }, tiers: {} };
  for (const q of allQuestions()) {
    const o = out[q.s];
    if (!o) continue;
    o.total++; o.stages[q.g]++; o.tiers[q.d] = (o.tiers[q.d] ?? 0) + 1;
  }
  return out;
}
