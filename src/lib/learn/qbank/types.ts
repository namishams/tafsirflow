// mirrors mobile/src/features/qbank/types.ts (copied for the website; keep both in step)
// Markaz al-Imtihanat (examination centre): the shape of one bank question.
// Rules for the content (see BLUEPRINT.md §4):
//   - written in our own words from established scholarship, with a source reference
//   - Quran text is never typed by hand: a question points at a verse key (and optionally a word position), and
//     the app renders the verse from the Quran.com data
//   - where the schools differ, a question asks about the difference (tagged with the tradition), never a single ruling
//   - every question carries a review status; the whole bank starts as "needs scholarly review"

/** subjects of the examination centre (each maps onto a school subject, see SUBJECT_TO_SCHOOL) */
export type QSubject =
  | "tajweed" | "qiraat" | "ulum" | "tafsir" | "seerah" | "prophets"
  | "hadith" | "aqidah" | "fiqh" | "nahw" | "vocab" | "history";

/** stage 1..4 = ibtidai, idadi, thanawi, ali (same order as the school) */
export type QStage = 1 | 2 | 3 | 4;
/** 1–5 regular tiers; 6 "Mutaqaddim" and 7 "ʿĀlim" are the scholar tiers (open after mastering 4–5) */
export type QDifficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** tradition tags: schools of fiqh, creedal schools, or consensus/majority labels */
export type QTradition =
  | "ijma" | "jumhur" | "comparative"
  | "hanafi" | "maliki" | "shafii" | "hanbali"
  | "sunni" | "athari" | "ashari" | "maturidi";

/** one language version: [stem, [correct, wrong, wrong, wrong], explanation]; option 0 is always the correct one
 *  (the runner shuffles the options with the attempt's seed) */
export type QLoc = [stem: string, options: [string, string, string, string], explanation: string];

export type QReview = "needs_review" | "reviewed" | "flagged";

export type RawQ = {
  id: string;
  s: QSubject;
  g: QStage;
  d: QDifficulty;
  /** topic tags (kebab-case, english), e.g. "nun-sakinah", "idgham" */
  t: string[];
  /** source reference (work and chapter, no invented page numbers) */
  src: string;
  /** tradition tags (fiqh schools, creed), only where relevant */
  tr?: QTradition[];
  /** verse key shown with the question ("2:255"); the app renders the verse */
  v?: string;
  /** 1-based word position inside the verse that the app highlights */
  w?: number;
  /** review status of this question (default: the bank's status) */
  rv?: QReview;
  en: QLoc;
  de: QLoc;
  ar: QLoc;
};
