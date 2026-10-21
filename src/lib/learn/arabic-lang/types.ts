// mirrors mobile/src/features/arabic-lang/types.ts (copied for the website; keep both in step)
// Types of the Arabic language course (Quranic Arabic and Modern Standard Arabic, A1 to B2).
// Content rules: explanations are our own words; Quran examples are only verse keys plus word positions, the words
// themselves always come from the Quran API at runtime (loadVerse). Example sentences in `items` are ordinary MSA,
// fully vowelled.

export type TxLang = "en" | "de" | "ar" | "tr" | "ur" | "id" | "fr";
export type Tx = { en: string; de: string; ar?: string; tr?: string; ur?: string; id?: string; fr?: string };
export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

/** a word or sentence of Modern Standard Arabic, fully vowelled, with transliteration and meaning */
export type Item = { ar: string; tr: string; en: string; de: string };
/** grammar spotting in a real verse: tap the word(s) at these positions (1-based, words only) */
export type Spot = { key: string; pos: number[]; ask: Tx };
/** a conjugation (or pattern) table: label → form */
export type Conj = { title: Tx; rows: [label: string, form: string, tr: string][] };
export type Line = { who: "a" | "b"; ar: string; en: string; de: string };

export type Lesson = {
  id: string;
  title: Tx;
  expl: Tx;
  items?: Item[];
  /** Quran vocabulary from the app's frequency decks (src/web/vocab.ts): deck id, start, count */
  deck?: { id: string; from: number; n: number };
  conj?: Conj;
  spot?: Spot[];
  /** dialogue or short story, read line by line before the exercises */
  lines?: Line[];
  /** opens the root explorer with these roots */
  roots?: string[];
  /** Quran frequency track: words `from`..`from+n` of the lemma frequency list (freq.ts), loaded at run time */
  freq?: { from: number; n: number };
  /** generated unit test */
  test?: boolean;
};
export type Unit = { n: number; level: Level; title: Tx; lead: Tx; lessons: Lesson[] };

export const X = (en: string, de: string, ar?: string, tr?: string, ur?: string, id?: string, fr?: string): Tx => ({ en, de, ar, tr, ur, id, fr });
export const I = (ar: string, tr: string, en: string, de: string): Item => ({ ar, tr, en, de });
export const S = (key: string, pos: number[], ask: Tx): Spot => ({ key, pos, ask });
export const Ln = (who: "a" | "b", ar: string, en: string, de: string): Line => ({ who, ar, en, de });

/** text in the learner's language: own entry, else English */
export function tx(t: Tx, lang: string): string {
  return (t as Record<string, string | undefined>)[lang] || t.en;
}
/** meaning of an item: German or English (other languages read English meanings) */
export const itemMeaning = (it: { en: string; de: string }, lang: string) => (lang === "de" ? it.de : it.en);
