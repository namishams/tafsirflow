import BUNDLED from "./data/ui-verses.json";
import { getVerseText } from "./quran";

// Quran text the pages show as decoration: the basmala at the opening of a surah (1:1) and the verses around the
// medallion of the /quran page (54:17 and 56:77–80). Never typed by hand (BLUEPRINT §4): the server reads them from the
// same Quran data as the reader (Quran.com text_uthmani); data/ui-verses.json is a snapshot of that answer (the same
// file as the app's mobile/src/features/quran/data/ui-verses.json), used when the data cannot be read and in the player.
// The other verses the website quotes as decoration (hero rings, gold verse lines, side calligraphy), each in the spelling
// its design is set in, come from lib/verseQuotes.ts (data/verse-quotes.json, written by scripts/gen-verse-quotes.mjs).
export const UI_VERSE_KEYS = ["1:1", "54:17", "56:77", "56:78", "56:79", "56:80"] as const;
export type UiVerses = Record<(typeof UI_VERSE_KEYS)[number], string>;
export const BUNDLED_UI_VERSES = BUNDLED as UiVerses;

/** the verses around the medallion, each closed by the rub al-hizb sign */
export const ringOf = (v: UiVerses) => (["54:17", "56:77", "56:78", "56:79", "56:80"] as const).map((k) => `${v[k]} ۞`).join(" ");

// the text of a verse never changes: read once per server process, the snapshot until then or when it fails
let cached: Promise<UiVerses> | null = null;
export function getUiVerses(): Promise<UiVerses> {
  if (!cached) {
    cached = Promise.all(UI_VERSE_KEYS.map((k) => getVerseText(k)))
      .then((list) => Object.fromEntries(UI_VERSE_KEYS.map((k, i) => [k, list[i]])) as UiVerses)
      .catch(() => { cached = null; return BUNDLED_UI_VERSES; });
  }
  return cached;
}
