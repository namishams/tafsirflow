import TRANSLATIONS from "./data/quran-translations.json";

// The Quran translations the chapters of the Islam section quote in German and English. Never typed by hand
// (BLUEPRINT §4): data/quran-translations.json is a snapshot of the Quran.com translation the reader uses for the
// language (de = 27 Frank Bubenheim and Nadeem Elyas, en = 20 Saheeh International), written by
// scripts/gen-quran-translations.mjs (a new verse: `node scripts/gen-quran-translations.mjs de:2:255 en:2:255`), and a
// chapter cuts the words it quotes out of it: quranQuote("de", "2:285", 16, 25) = words 16 to 25 of the verse.
// (The Arabic wording comes from lib/verseQuotes.ts, hadith from ./hadithQuote.ts.)
// Only the typography is adapted, never a word: footnote markers are left out, the translation's own quotation marks
// become inner ones (so the chapter's quotation marks stay the outer pair), and a quote that starts or stops inside a
// sentence loses the punctuation and the unmatched quotation marks or brackets at its edges; `cap` sets the first letter
// as a capital when the quote opens a sentence. Pure module, shared with the app by mobile/scripts/sync-web.mjs.
export type QuoteLang = keyof typeof TRANSLATIONS;
export type QuoteOptions = { cap?: boolean };
const DATA = TRANSLATIONS as Record<QuoteLang, Record<string, string>>;

function normalise(text: string, lang: QuoteLang): string {
  const t = text.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  // German: „…“ becomes ‚…‘; English: "…" becomes '…'
  return lang === "de" ? t.replace(/„/g, "‚").replace(/[“”]/g, "‘") : t.replace(/["“”]/g, "'");
}

const isLetter = (c: string | undefined) => !!c && /[\p{L}\p{N}]/u.test(c);
// how many of a quotation mark the text holds; a ' or ’ between two letters is an apostrophe, not a quotation mark
function count(s: string, mark: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) if (s[i] === mark && !(isLetter(s[i - 1]) && isLetter(s[i + 1]))) n++;
  return n;
}
const PAIRS: Record<QuoteLang, [string, string][]> = {
  de: [["‚", "‘"], ["(", ")"], ["[", "]"]],
  en: [["'", "'"], ["‘", "’"], ["(", ")"], ["[", "]"]],
};
const balanced = (s: string, a: string, b: string) => (a === b ? count(s, a) % 2 === 0 : count(s, a) === count(s, b));

function tidy(part: string, lang: QuoteLang): string {
  let s = part;
  for (let guard = 0; guard < 20; guard++) {
    const before = s;
    s = s.replace(/^[\s,;:.…–—-]+/u, "").replace(/[\s,;:.…–—-]+$/u, "");
    for (const [a, b] of PAIRS[lang]) {
      if (balanced(s, a, b)) {
        // the whole quote is one quotation inside the verse: the chapter's own quotation marks take its place
        if (s.length > 2 && s.startsWith(a) && s.endsWith(b) && balanced(s.slice(1, -1), a, b) && (a !== "(" && a !== "[")) s = s.slice(1, -1);
        continue;
      }
      if (s.startsWith(a) && (a === b || count(s, a) > count(s, b))) s = s.slice(1);
      else if (s.endsWith(b) && (a === b || count(s, b) > count(s, a))) s = s.slice(0, -1);
    }
    if (s === before) break;
  }
  return s;
}

// "2:285", or verses that follow each other in one surah: "99:7-8" / "99:7–8"
function verseKeys(ref: string): string[] {
  const m = /^(\d{1,3}):(\d{1,3})(?:\s*[–-]\s*(\d{1,3}))?$/.exec(ref.trim());
  if (!m) throw new Error(`not a verse reference: ${ref}`);
  const [s, a, b] = [Number(m[1]), Number(m[2]), Number(m[3] ?? m[2])];
  return Array.from({ length: b - a + 1 }, (_, i) => `${s}:${a + i}`);
}

/** the translation of a verse or of verses that follow each other, as the quotes are cut out of it */
export function quranTranslation(lang: QuoteLang, ref: string): string {
  return verseKeys(ref).map((k) => {
    const t = DATA[lang]?.[k];
    if (!t) throw new Error(`verse ${k} (${lang}) is missing in islam/data/quran-translations.json: node scripts/gen-quran-translations.mjs ${lang}:${k}`);
    return normalise(t, lang);
  }).join(" ");
}

/** words `from`..`to` (1-based, inclusive; `to` left out = to the end) of the translation of `ref` */
export function quranQuote(lang: QuoteLang, ref: string, from = 1, to?: number, o: QuoteOptions = {}): string {
  const words = quranTranslation(lang, ref).split(" ");
  const end = to ?? words.length;
  if (!Number.isInteger(from) || from < 1 || end > words.length || from > end)
    throw new Error(`${lang} ${ref}: words ${from}–${end} are not in the translation (${words.length} words)`);
  const s = tidy(words.slice(from - 1, end).join(" "), lang);
  return o.cap ? s.charAt(0).toLocaleUpperCase(lang) + s.slice(1) : s;
}
