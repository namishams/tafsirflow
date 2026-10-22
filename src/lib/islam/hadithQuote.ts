import type { IslamChapter } from "./types";

// Hadith wording in the Islam chapters is never typed by hand (BLUEPRINT §4). A chapter names the narration and the
// words it quotes, and the page fills them in from the published text:
//   {{hadith ara-bukhari 3443 31-37}} = words 31 to 37 of hadith 3443 in the hadith-api edition ara-bukhari
//   (fawazahmed0/hadith-api, its own numbering: the number the text is fetched by).
// Website: lib/learn/journey/hadith.ts loads the text, app: features/hadith/data.ts (kept on the device). Until the text
// is there, or when it cannot be loaded, an ellipsis stands in place of the words; the reference next to the quote stays.
// Pure module without fetching or framework code, shared by the website and the app (copied to mobile/src/web by sync-web).

const QUOTE = /\{\{hadith ([a-z]{3})-([a-z]+) (\d+) (\d+)-(\d+)\}\}/g;
/** edition prefix of the API → language of its text */
const LANG: Record<string, string> = { ara: "ar", eng: "en", tur: "tr", urd: "ur", ben: "bn", rus: "ru", fra: "fr", ind: "id" };

export type HadithQuoteRef = { edition: string; collection: string; n: number; lang: string };
/** a hadith loader by collection and number (sunniHadith of the website's lib/learn/journey/hadith.ts and of the app's
 *  features/hadith/data.ts): the Arabic text, the translation and the language it is in */
export type HadithTextLoader = (collection: string, n: number, lang: string) => Promise<{ arabic?: string; text: string; textLang: string } | null>;

const keyOf = (edition: string, n: number | string) => `${edition}:${n}`;
/** "ara-bukhari:3443": how loaded texts are keyed */
export const hadithQuoteKey = (r: HadithQuoteRef) => keyOf(r.edition, r.n);
export const hasHadithQuotes = (text: string) => text.includes("{{hadith ");

/** the narrations a text quotes, each once */
export function hadithQuoteRefs(text: string): HadithQuoteRef[] {
  const out = new Map<string, HadithQuoteRef>();
  for (const m of text.matchAll(QUOTE)) {
    const lang = LANG[m[1]];
    if (!lang) continue;
    const edition = `${m[1]}-${m[2]}`;
    out.set(keyOf(edition, m[3]), { edition, collection: m[2], n: Number(m[3]), lang });
  }
  return [...out.values()];
}

/** the words of a hadith as the API writes it: without direction marks, quotation marks and the braces around a quoted
 *  verse; tokens without a letter (a lone dash or full stop) are not words */
export function hadithWords(text: string): string[] {
  return text.replace(/[\u200e\u200f"“”{}]/g, " ").split(/\s+/).filter((w) => /\p{L}/u.test(w.replace(/\u0640/g, "")));
}

/** words `from`..`to` (1-based, inclusive) of a hadith text, without the punctuation after the last one */
export function hadithExcerpt(text: string, from: number, to: number): string {
  const words = hadithWords(text).slice(Math.max(1, from) - 1, to);
  if (!words.length) return "";
  words[words.length - 1] = words[words.length - 1].replace(/\p{P}+$/u, "");
  return words.join(" ");
}

/** the text with every quote filled in from `texts` ("ara-bukhari:3443" → the loaded text); a missing one is "…" */
export function fillHadithQuotes(text: string, texts: Record<string, string | null | undefined>): string {
  if (!hasHadithQuotes(text)) return text;
  return text.replace(QUOTE, (_, pre: string, col: string, n: string, a: string, b: string) => {
    const t = texts[keyOf(`${pre}-${col}`, n)];
    return (t && hadithExcerpt(t, Number(a), Number(b))) || "…";
  });
}

/** loads the narrations `refs` with `load`; a failed one is null */
export async function loadHadithTexts(refs: HadithQuoteRef[], load: HadithTextLoader): Promise<Record<string, string | null>> {
  const texts: Record<string, string | null> = {};
  await Promise.all(refs.map(async (r) => {
    const h = await load(r.collection, r.n, r.lang).catch(() => null);
    // the Arabic original, or the translation only when it is in the edition's language (never a fallback edition)
    texts[keyOf(r.edition, r.n)] = (r.lang === "ar" ? h?.arabic : h && h.textLang === r.lang ? h.text : null) || null;
  }));
  return texts;
}

/** the parts of a chapter that can quote a hadith (the article and the answers), filled in */
export function fillChapterHadith(c: IslamChapter, texts: Record<string, string | null | undefined>): IslamChapter {
  if (!hasHadithQuotes(c.body) && !c.faq.some((f) => hasHadithQuotes(f.a))) return c;
  return { ...c, body: fillHadithQuotes(c.body, texts), faq: c.faq.map((f) => ({ ...f, a: fillHadithQuotes(f.a, texts) })) };
}
export const chapterHadithRefs = (c: IslamChapter): HadithQuoteRef[] => hadithQuoteRefs([c.body, ...c.faq.map((f) => f.a)].join("\n"));

/** a chapter with its hadith quotes loaded and filled in (website pages, rendered on the server) */
export async function withChapterHadith(c: IslamChapter, load: HadithTextLoader): Promise<IslamChapter> {
  const refs = chapterHadithRefs(c);
  return refs.length ? fillChapterHadith(c, await loadHadithTexts(refs, load)) : c;
}
