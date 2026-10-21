import type { IconName } from "@/components/icons";
import type { SubjectId as SchoolSubject, StageId } from "@/features/school/model";
import { BANK_FILES } from "./data";
import type { QDifficulty, QLoc, QReview, QStage, QSubject, RawQ } from "./types";

// Markaz al-Imtihanat: the question banks, their subjects and stages. The banks are loaded on first use (one module
// per bank file in ./data) so the app's start is not slowed down by two thousand questions.

/** the whole bank is draft content: it is shown with this status until scholars have reviewed it */
export const BANK_REVIEW: { status: QReview; note: string } = {
  status: "needs_review",
  note: "Written from established scholarship, not yet reviewed by a scholar. Questions can be reported from the app.",
};

export type SubjectMeta = { id: QSubject; ar: string; tr: string; school: SchoolSubject; icon: IconName };
export const SUBJECTS: SubjectMeta[] = [
  { id: "tajweed", ar: "التجويد", tr: "at-Tajwīd", school: "quran", icon: "speaker" },
  { id: "qiraat", ar: "القراءات", tr: "al-Qirāʾāt", school: "quran", icon: "radio" },
  { id: "ulum", ar: "علوم القرآن", tr: "ʿUlūm al-Qurʾān", school: "tafsir", icon: "book" },
  { id: "tafsir", ar: "التفسير", tr: "at-Tafsīr", school: "tafsir", icon: "sun" },
  { id: "seerah", ar: "السيرة النبوية", tr: "as-Sīra an-Nabawiyya", school: "seerah", icon: "compass" },
  { id: "prophets", ar: "قصص الأنبياء", tr: "Qaṣaṣ al-Anbiyāʾ", school: "seerah", icon: "moon" },
  { id: "hadith", ar: "علوم الحديث", tr: "ʿUlūm al-Ḥadīth", school: "hadith", icon: "list" },
  { id: "aqidah", ar: "العقيدة", tr: "al-ʿAqīda", school: "aqidah", icon: "shield" },
  { id: "fiqh", ar: "فقه العبادات", tr: "Fiqh al-ʿIbādāt", school: "fiqh", icon: "mosque" },
  { id: "nahw", ar: "النحو والصرف", tr: "an-Naḥw wa-ṣ-Ṣarf", school: "arabic", icon: "pen" },
  { id: "vocab", ar: "مفردات القرآن", tr: "Mufradāt al-Qurʾān", school: "arabic", icon: "cap" },
  { id: "history", ar: "التاريخ الإسلامي", tr: "at-Tārīkh al-Islāmī", school: "seerah", icon: "globe" },
];
export const subjectMeta = (id: string) => SUBJECTS.find((s) => s.id === id);

export const STAGE_IDS: Record<QStage, StageId> = { 1: "ibtidai", 2: "idadi", 3: "thanawi", 4: "ali" };
export const STAGE_AR: Record<QStage, string> = { 1: "المرحلة الابتدائية", 2: "المرحلة الإعدادية", 3: "المرحلة الثانوية", 4: "المرحلة العالية" };
export const STAGES: QStage[] = [1, 2, 3, 4];
/** the tiers: 1–5 regular, 6 Mutaqaddim and 7 ʿĀlim (open after mastering 4–5 of a subject) */
export const TIERS: QDifficulty[] = [1, 2, 3, 4, 5, 6, 7];
export const TIER_AR: Record<QDifficulty, string> = { 1: "مبتدئ", 2: "متوسط", 3: "متمكن", 4: "متقن", 5: "متميز", 6: "متقدم", 7: "عالم" };
export const SCHOLAR_TIERS: QDifficulty[] = [6, 7];

export type Q = RawQ & { /** the review status that applies (own status or the bank's) */ review: QReview };

let cache: Q[] | null = null;
let byId: Map<string, Q> | null = null;
/** every question of every bank (loaded once) */
export function allQuestions(): Q[] {
  if (!cache) {
    const seen = new Set<string>();
    cache = [];
    for (const load of BANK_FILES) {
      let qs: RawQ[] = [];
      try { qs = load().QS ?? []; } catch { qs = []; }
      for (const q of qs) if (!seen.has(q.id)) { seen.add(q.id); cache.push({ ...q, review: q.rv ?? BANK_REVIEW.status }); }
    }
    byId = new Map(cache.map((q) => [q.id, q]));
  }
  return cache;
}
export const questionById = (id: string): Q | undefined => { allQuestions(); return byId!.get(id); };

/** question language: German and Arabic have their own text, every other language reads the English one
 *  (unless the learner picked a question language in the settings of the centre) */
export type QLang = "en" | "de" | "ar";
export const qLangOf = (appLang: string, pref: "auto" | QLang = "auto"): QLang => (pref !== "auto" ? pref : appLang === "de" ? "de" : appLang === "ar" ? "ar" : "en");
export const locOf = (q: RawQ, lang: QLang): QLoc => q[lang] ?? q.en;

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
