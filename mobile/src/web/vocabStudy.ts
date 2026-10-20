// Learning logic of the vocabulary trainer, shared by the website (components/VocabTrainer.tsx) and the app
// (mobile/src/features/vocab, synced via mobile/scripts/sync-web.mjs). Pure functions only: no storage, no fetch.
import type { Deck, Word } from "./vocab";

// Leitner boxes: a known word moves up a box and comes back later (1, 2, 4, 8, 16 days); a missed word goes back to box 1.
export type Boxes = Record<string, { box: number; due: number }>;
export const BOX_GAPS = [0, 1, 2, 4, 8, 16];
/** a word counts as known from box 3 on (it came back twice and was known both times) */
export const KNOWN_BOX = 3;

export type VocabMode = "cards" | "quiz" | "reverse" | "listen";
export const ROUND = 15;
export const REVIEW_ROUND = 20;

export const isKnown = (b: Boxes, id: string) => (b[id]?.box ?? 0) >= KNOWN_BOX;
/** a word already practised whose box comes back today (or earlier) */
export const isDueReview = (b: Boxes, id: string, day: number) => !!b[id] && b[id].due <= day;
/** words for a new round: due reviews and words never practised */
export const isOpen = (b: Boxes, id: string, day: number) => !b[id] || b[id].due <= day;

export function nextBox(b: Boxes, id: string, ok: boolean, day: number): Boxes {
  const cur = b[id]?.box ?? 0;
  const box = ok ? Math.min(5, cur + 1) : 1;
  return { ...b, [id]: { box, due: day + BOX_GAPS[box] } };
}

export type DeckStats = { total: number; known: number; due: number; fresh: number };
export function deckStats(d: Deck, b: Boxes, day: number): DeckStats {
  let known = 0, due = 0, fresh = 0;
  for (const w of d.words) {
    if (isKnown(b, w.id)) known++;
    if (isDueReview(b, w.id, day)) due++;
    if (!b[w.id]) fresh++;
  }
  return { total: d.words.length, known, due, fresh };
}

/** every practised word whose box is due today, across all decks (most overdue first) */
export function dueWords(decks: Deck[], b: Boxes, day: number): Word[] {
  return decks.flatMap((d) => d.words).filter((w) => isDueReview(b, w.id, day)).sort((x, y) => b[x.id].due - b[y.id].due);
}

export const shuffle = <T,>(a: T[]): T[] => { const c = [...a]; for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; } return c; };

/** words of a round: the due and new words of the deck (else the whole deck), shuffled; the listening quiz only uses words with a recording */
export function roundWords(words: Word[], b: Boxes, day: number, mode: VocabMode, size = ROUND): Word[] {
  const pool = mode === "listen" ? words.filter(hasAudio) : words;
  const open = pool.filter((w) => isOpen(b, w.id, day));
  return shuffle(open.length ? open : pool).slice(0, size);
}

/** a word can be heard when it has an example verse (Quran.com word-by-word recording of that verse) */
export const hasAudio = (w: Word) => !!w.ex && !w.ar.startsWith("ـ"); // attached pronouns are not a word of their own
/** the listening quiz needs four different words with a recording */
export const canListen = (words: Word[]) => new Set(words.filter(hasAudio).map((w) => w.ar)).size >= 4;

/** four answer options: the right one plus three distinct distractors (from the same deck first, then all words) */
export function options(cur: Word, deckWords: Word[], all: Word[], label: (w: Word) => string, filter: (w: Word) => boolean = () => true): string[] {
  const right = label(cur);
  const seen = new Set([right]);
  const out: string[] = [];
  for (const src of [shuffle(deckWords), shuffle(all)]) {
    for (const w of src) {
      if (out.length >= 3) break;
      if (w.id === cur.id || !filter(w)) continue;
      const l = label(w);
      if (!l || seen.has(l)) continue;
      seen.add(l); out.push(l);
    }
  }
  return shuffle([right, ...out]);
}

// ── finding the word in its example verse ───────────────────────────────────────────────────────────────────────
// The verse comes from Quran.com in Uthmani script ("ٱلصَّلَوٰةَ"); the word list is written in plain script ("صَلَاة").
// Both are reduced to a consonant skeleton and compared after the attached particles (wa-, fa-, bi-, li-, ka-, al-)
// are taken off; the root letters are the last resort.

const MARKS = /[ؐ-ًؚ-ٟۖ-ۭـ]/g;
export function normalizeArabic(s: string): string {
  return s.replace(MARKS, "").replace(/[ٱأإآٰ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/ؤ/g, "و").replace(/ئ/g, "ي").replace(/[^ء-ي]/g, "");
}
const skeleton = (s: string) => normalizeArabic(s).replace(/[اويء]/g, "");

function stems(s: string): string[] {
  const out = new Set([s]);
  const add = (x: string) => { if (x.length >= 2) out.add(x); };
  for (const a of [...out]) if (/^[وف]/.test(a)) add(a.slice(1));
  for (const a of [...out]) if (/^[بلك]/.test(a)) add(a.slice(1));
  for (const a of [...out]) { if (a.startsWith("ال")) add(a.slice(2)); if (a.startsWith("لل")) add(a.slice(2)); }
  return [...out];
}

export type VerseWord = { position: number; text: string };

/** the position (1-based, Quran.com word position) of the vocabulary word in the verse, or null */
export function findWordPosition(word: Pick<Word, "ar" | "root">, verseWords: VerseWord[]): number | null {
  const target = normalizeArabic(word.ar);
  const tSkel = skeleton(word.ar);
  if (!target) return null;
  const root = (word.root ?? "").split(/\s+/).map(normalizeArabic).filter(Boolean);
  let best: { pos: number; score: number } | null = null;
  for (const vw of verseWords) {
    const n = normalizeArabic(vw.text);
    if (!n) continue;
    const forms = stems(n);
    const skels = forms.map((f) => f.replace(/[اويء]/g, ""));
    let score = 0;
    if (forms.includes(target)) score = 6;
    else if (target.length >= 3 && forms.some((f) => f.startsWith(target))) score = 5;
    else if (tSkel && skels.includes(tSkel)) score = 4;
    else if (target.length === 2 && forms.some((f) => f.startsWith(target))) score = 3;
    else if (tSkel.length >= 2 && skels.some((f) => f.startsWith(tSkel) || f.endsWith(tSkel))) score = 3;
    else if (target.length >= 3 && forms.some((f) => f.includes(target))) score = 2;
    else if (root.length >= 2 && hasInOrder(n, root)) score = 1;
    // single-letter particles (wa-, fa-) are only recognised as a word of their own
    if (target.length < 2 && n !== target) score = 0;
    if (score && (!best || score > best.score)) best = { pos: vw.position, score };
  }
  return best?.pos ?? null;
}

function hasInOrder(s: string, letters: string[]): boolean {
  let i = 0;
  for (const ch of s) if (ch === letters[i] || (letters[i] === "ا" && ch === "ء")) i++;
  return i >= letters.length || (letters.length >= 3 && i >= letters.length - 1 && letters[letters.length - 1] === letters[letters.length - 2]);
}

/** Quran.com word-by-word recording of word `pos` of verse "s:a" */
export const wordClipUrl = (key: string, pos: number) => {
  const [s, a] = key.split(":");
  const p3 = (x: string | number) => String(x).padStart(3, "0");
  return `https://audio.qurancdn.com/wbw/${p3(s)}_${p3(a)}_${p3(pos)}.mp3`;
};

/** the verse in the reader, website path (the app maps it with websiteHref) */
export const readerPath = (key: string) => { const [s, a] = key.split(":"); return `/surah/${s}?v=${a}`; };
