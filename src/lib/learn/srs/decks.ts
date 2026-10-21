// mirrors mobile/src/features/srs/decks.ts (copied for the website; keep both in step)
import { VOCAB_DECKS } from "@/lib/vocab";
import { TAJWEED_LESSONS } from "@/lib/tajweed";
import { DUA_GROUPS } from "@/lib/duas";

// The decks of the card trainer, built only from data the app already has (vocabulary, tajweed course, Quran duas).
// Verse cards never carry Quran text: they store the verse key and the text comes from the Quran API when shown.
export type CardKind = "word" | "qword" | "name" | "verse" | "dua" | "tajweed";
export type DeckId = "juzamma" | "vocab" | "names" | "tajweed" | "duas" | "mine";
export const DECK_IDS: DeckId[] = ["juzamma", "vocab", "names", "tajweed", "duas"];
/** decks free users can study (plus their own cards from the feed and saved verses) */
export const FREE_DECKS: DeckId[] = ["juzamma", "mine"];

const surahOf = (key?: string) => (key ? Number(key.split(":")[0]) : 0);
const uniq = (a: string[]) => [...new Set(a)];

const allWords = VOCAB_DECKS.filter((d) => d.id !== "allah").flatMap((d) => d.words);
const ITEMS: Record<Exclude<DeckId, "mine">, string[]> = {
  juzamma: uniq(allWords.filter((w) => surahOf(w.ex?.key) >= 78).map((w) => `word:${w.id}`)),
  vocab: uniq(allWords.map((w) => `word:${w.id}`)),
  names: uniq((VOCAB_DECKS.find((d) => d.id === "allah")?.words ?? []).map((w) => `name:${w.id}`)),
  tajweed: TAJWEED_LESSONS.flatMap((l) => l.quiz.map((_, i) => `tajweed:${l.id}:${i}`)),
  duas: uniq(DUA_GROUPS.flatMap((g) => g.verses).map((k) => `dua:${k}`)),
};
export const deckItems = (d: DeckId): string[] => (d === "mine" ? [] : ITEMS[d]);
export const deckSize = (d: DeckId) => deckItems(d).length;

export function kindOf(id: string): CardKind { return id.slice(0, id.indexOf(":")) as CardKind; }
export const refOf = (id: string) => id.slice(id.indexOf(":") + 1);
/** which deck a card id belongs to (own cards from the feed land in "mine") */
export function deckOf(id: string): DeckId {
  const k = kindOf(id);
  if (k === "name") return "names";
  if (k === "tajweed") return "tajweed";
  if (k === "dua") return "duas";
  if (k === "word") return ITEMS.juzamma.includes(id) ? "juzamma" : "vocab";
  return "mine";
}
