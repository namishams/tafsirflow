import { BUNDLED_VERSE_QUOTES, verseQuote } from "../verseQuotes";
import TRANSLATIONS from "./verse-translations.json";

// Quran text on "Secrets of the Quran" (/secrets) is never typed by hand (BLUEPRINT §4). The texts in content.ts and
// pagecontent/<lang>/secrets.ts hold tokens that secretsContent() resolves when it loads a language, so everything
// that reads the content (the page, the app screen, the feed stories, the structured data) gets the finished text:
//   {{q:15:9}}  {{q:5:3:40-43}}  the Arabic words of the verse – all of them, or words 40–43 as lib/verseQuotes counts
//                                 them – in the modern spelling (imlaei), cut out of data/verse-quotes.json (a snapshot
//                                 of Quran.com, scripts/gen-verse-quotes.mjs)
//   {{t:15:9}}                   the whole verse in this language's translation, the one the reader shows
//                                 (pickTranslation), from verse-translations.json (a snapshot of Quran.com,
//                                 scripts/gen-secrets-translations.mjs); an item that quotes it names the translation in
//                                 its source line
// Where a translated text means only part of a verse, it says it in its own words, without quotation marks, and the
// reference opens the verse in the reader. The promises ("wealth") are shown as whole verses: Arabic and translation
// from Quran.com, these snapshots when it cannot be reached (bundledVerses).
// Hadith: lib/secrets/hadith.ts. Shared by the website and the app (mobile/scripts/sync-web.mjs copies this folder).

type Snapshot = Record<string, { id: number; name: string; verses: Record<string, string> }>;
const SNAPSHOT: Snapshot = TRANSLATIONS;
/** the translation of a language in the snapshot (English, like pickTranslation, where a language has none) */
const snapshotOf = (locale: string) => SNAPSHOT[locale] ?? SNAPSHOT.en;

/** the name of the translation the snapshot holds for this language ("Frank Bubenheim and Nadeem") */
export const translationName = (locale: string): string => snapshotOf(locale)?.name ?? "";

/** one verse in the language's translation from the snapshot; "" when it is not in it */
export const verseTranslation = (locale: string, key: string): string => snapshotOf(locale)?.verses[key] ?? "";

const TOKEN = /\{\{([qt]):(\d{1,3}:\d{1,3})(?::(\d{1,3})-(\d{1,3}))?\}\}/g;

/** whether a text quotes a verse in translation (its item then names the translation) */
export const quotesTranslation = (text: string | undefined): boolean => !!text && /\{\{t:/.test(text);

/** the text with its verse tokens replaced by the verse words (see above) */
export function resolveScripture(text: string, locale: string): string {
  if (!text.includes("{{")) return text;
  return text.replace(TOKEN, (_all, kind: string, key: string, from?: string, to?: string) => {
    if (kind === "q") return verseQuote("imlaei", key, from ? Number(from) : 1, to ? Number(to) : undefined);
    const t = verseTranslation(locale, key);
    if (!t) throw new Error(`verse ${key} (${locale}) is missing in secrets/verse-translations.json: node scripts/gen-secrets-translations.mjs`);
    // the quote goes on in the sentence: a comma or dash that ends the translated verse is left out
    return t.replace(/[\s,;:\-–—]+$/, "");
  });
}

/** every string of a value with its tokens resolved (arrays and plain objects are copied) */
export function resolveDeep<T>(value: T, locale: string): T {
  if (typeof value === "string") return resolveScripture(value, locale) as T;
  if (Array.isArray(value)) return value.map((v) => resolveDeep(v, locale)) as T;
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveDeep(v, locale)])) as T;
  return value;
}

/** the keys of a reference like "71:10-12" */
export function keysOf(ref: string): string[] {
  const [s, range = ""] = ref.split(":");
  const [a, b = a] = range.split("-").map(Number);
  return a > 0 && b >= a ? Array.from({ length: b - a + 1 }, (_, i) => `${s}:${a + i}`) : [];
}

/** a promise's verses from the snapshots, for when Quran.com cannot be reached: the Uthmani text (as the reader shows
 *  it, verses joined by ۝), the translation (none in Arabic) and its name; empty parts where a verse is missing */
export function bundledVerses(ref: string, locale: string): { ar: string; tr: string; name: string } {
  const keys = keysOf(ref);
  const has = keys.length > 0 && keys.every((k) => BUNDLED_VERSE_QUOTES.uthmani[k]);
  const ar = has ? keys.map((k) => verseQuote("uthmani", k)).join(" ۝ ") : "";
  if (locale === "ar") return { ar, tr: "", name: "" };
  const parts = keys.map((k) => verseTranslation(locale, k));
  return { ar, tr: parts.length && parts.every(Boolean) ? parts.join(" ") : "", name: translationName(locale) };
}
