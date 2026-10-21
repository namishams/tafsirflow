import QUOTES from "./data/verse-quotes.json";

// Verses the website quotes as decoration: the rings around the hero medallions, the gold verse lines in ornate
// brackets, the calligraphy in the side margins. Never typed by hand (BLUEPRINT §4): data/verse-quotes.json is a
// snapshot of the Quran.com answer for each verse, written by scripts/gen-verse-quotes.mjs (a new verse:
// `node scripts/gen-verse-quotes.mjs qpc:2:255`). Each design keeps the spelling it is set in:
//   uthmani = text_uthmani (the reader's text, like lib/uiVerses), qpc = text_qpc_hafs (King Fahd Complex Hafs mushaf),
//   imlaei = text_imlaei (modern spelling, for the calligraphy fonts).
// Pure module without server code, so client components can use it as well.
export type QuoteScript = keyof typeof QUOTES;
export const BUNDLED_VERSE_QUOTES: Record<QuoteScript, Record<string, string>> = QUOTES;

const PAUSE = "ۖ-ۜ۞۩"; // pause signs (waqf, sakta), rub al-hizb, sajda sign
const ONLY_PAUSE = new RegExp(`^[${PAUSE}]+$`);
const ENDS_IN_PAUSE = new RegExp(`^(.*?)([${PAUSE}]+)$`);
const NUMBER = /^[٠-٩۰-۹]+$/; // the verse number that closes the QPC text

type Word = { w: string; pause: string }; // pause: the sign after the word, with the space it is written with

/** the words of a verse; a pause sign belongs to the word before it, the verse number and a rub al-hizb that opens the verse are left out */
function wordsOf(script: QuoteScript, key: string): Word[] {
  const text = BUNDLED_VERSE_QUOTES[script][key];
  if (!text) throw new Error(`verse ${key} (${script}) is missing in data/verse-quotes.json: node scripts/gen-verse-quotes.mjs ${script}:${key}`);
  const words: Word[] = [];
  for (const t of text.trim().split(/\s+/)) {
    if (NUMBER.test(t)) continue;
    if (ONLY_PAUSE.test(t)) {
      if (words.length) words[words.length - 1].pause += ` ${t}`;
      continue;
    }
    const m = ENDS_IN_PAUSE.exec(t);
    words.push(m && m[1] ? { w: m[1], pause: m[2] } : { w: t, pause: "" });
  }
  return words;
}

/**
 * Words `from`..`to` (1-based, inclusive; `to` left out = to the end of the verse) of a verse, in the given spelling.
 * A quote that stops inside the verse ends without the pause sign of its last word; `marks: false` leaves out the
 * pause signs inside the quote as well (large calligraphy).
 */
export function verseQuote(script: QuoteScript, key: string, from = 1, to?: number, { marks = true }: { marks?: boolean } = {}): string {
  const words = wordsOf(script, key);
  const end = Math.min(to ?? words.length, words.length);
  return words
    .slice(Math.max(1, from) - 1, end)
    .map(({ w, pause }, i, part) => (marks && (i < part.length - 1 || end === words.length) ? w + pause : w))
    .join(" ");
}

/** quotes around a medallion, each closed by the rub al-hizb sign (the same form as ringOf in lib/uiVerses) */
export const quoteRing = (parts: string[]) => parts.map((p) => `${p} ۞`).join(" ");
