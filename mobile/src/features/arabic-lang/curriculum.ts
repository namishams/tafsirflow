import { VOCAB_DECKS, type Word } from "@/web/vocab";
import { meaning } from "@/web/vocabI18n";
import { UNITS_A } from "./content1";
import { UNITS_B } from "./content2";
import { UNITS_C } from "./content3";
import { freqItems } from "./freq";
import { X, type Item, type Lesson, type Level, type Unit } from "./types";

// The whole course: ten units, A1 → B2, each closing with a generated unit test. Unit 1 is free, the rest is Pro.

const withTest = (u: Unit): Unit => ({
  ...u,
  lessons: [...u.lessons, {
    id: `u${u.n}-test`, test: true,
    title: X(`Unit test ${u.n}`, `Einheitentest ${u.n}`, `اختبار الوحدة ${u.n}`, `Ünite testi ${u.n}`, `یونٹ ٹیسٹ ${u.n}`, `Tes unit ${u.n}`, `Test de l'unité ${u.n}`),
    expl: X("Questions from every lesson of this unit. From 80 % the unit counts as passed.", "Fragen aus allen Lektionen dieser Einheit. Ab 80 % gilt die Einheit als bestanden.", "أسئلة من كل دروس الوحدة؛ النجاح من ٨٠٪.", "Ünitenin tüm derslerinden sorular; %80 ile geçilir.", "یونٹ کے تمام اسباق سے سوالات؛ ٨٠٪ پر کامیابی۔", "Soal dari semua pelajaran; lulus mulai 80 %.", "Des questions de toute l'unité ; réussite dès 80 %."),
  }],
});

export const UNITS: Unit[] = [...UNITS_A, ...UNITS_B, ...UNITS_C].map(withTest);
export const LESSONS: Lesson[] = UNITS.flatMap((u) => u.lessons);
export const FREE_UNITS = 1;
export const PASS = 0.8;

export const unitOfLesson = (id: string): Unit | undefined => UNITS.find((u) => u.lessons.some((l) => l.id === id));
export const lessonById = (id: string): Lesson | undefined => LESSONS.find((l) => l.id === id);
export const isFreeUnit = (n: number) => n <= FREE_UNITS;

/** CEFR-style levels: the certificate for a level needs every unit test up to its last unit */
export const LEVELS: { level: Level; lastUnit: number }[] = [
  { level: "A1", lastUnit: 3 }, { level: "A2", lastUnit: 5 }, { level: "B1", lastUnit: 8 }, { level: "B2", lastUnit: 10 }, { level: "C1", lastUnit: 16 },
];

const DECK = new Map(VOCAB_DECKS.map((d) => [d.id, d]));
/** the Quran words of a deck lesson (from the app's frequency vocabulary) */
export function deckWords(l: Lesson): Word[] {
  if (!l.deck) return [];
  return (DECK.get(l.deck.id)?.words ?? []).slice(l.deck.from, l.deck.from + l.deck.n);
}
/** every learnable item of a lesson; deck words become items with the meaning in the learner's language */
export type LItem = Item & { wordId?: string; local: string };
export function lessonItems(l: Lesson, lang: string): LItem[] {
  const own: LItem[] = (l.items ?? []).map((it) => ({ ...it, local: lang === "de" ? it.de : it.en }));
  if (l.freq) return freqItems(l.freq, lang);
  const words: LItem[] = deckWords(l).map((w) => ({ ar: w.ar, tr: w.tr, en: w.en, de: w.de, wordId: w.id, local: meaning(w, lang) }));
  return [...own, ...words];
}
export function unitItems(u: Unit, lang: string): LItem[] {
  return u.lessons.filter((l) => !l.test).flatMap((l) => lessonItems(l, lang));
}
/** all vocabulary words of the course (for the root explorer) */
export const ALL_WORDS: Word[] = VOCAB_DECKS.flatMap((d) => d.words);
