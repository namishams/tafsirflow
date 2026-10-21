import { useEffect, useState } from "react";
import { useLang } from "@/i18n";
import { getVerseByKey } from "@/lib/quran";
import { sunniHadith } from "@/features/hadith/data";

// The Quran verses and the hadith the onboarding story quotes, rendered from the app's data (BLUEPRINT §4: no
// hand-typed Quran or hadith text): a verse's translation from the Quran data with its key as the source (Arabic
// readers see the Uthmani text), a hadith's words from the synced hadith sources. The story's own lines (story.ts) are
// only the fallback while offline or when a source has no text in this language, and are then marked as a paraphrase.
export type SourceQuote = { text: string; source: string; arabic?: string };

/** the quoted words of a hadith text: the first passage in quotation marks (the Prophet's words after the chain of
 *  narrators), up to the closing mark or the end; null when the text has none (then the paraphrase is shown) */
export function quotedWords(text: string | undefined): string | null {
  const s = (text ?? "").replace(/[‎‏]/g, "").replace(/[“”„«»]/g, '"').replace(/\s+/g, " ").trim();
  const a = s.indexOf('"');
  if (a < 0) return null;
  const b = s.indexOf('"', a + 1);
  const w = (b < 0 ? s.slice(a + 1) : s.slice(a + 1, b)).trim();
  return w.length >= 8 && w.length <= 240 ? w : null;
}

/** the words of the du'a that closes a verse translation (Quran 20:114 ends with it): the last quoted passage, or what
 *  follows the last colon; null when neither is clear */
export function closingWords(translation: string): string | null {
  const s = translation.replace(/\s+/g, " ").trim().replace(/[\s"“”„«»「」『』]+$/u, "");
  const cut = Math.max(...['"', "“", "„", "«", "「", "『", ": ", "："].map((q) => { const i = s.lastIndexOf(q); return i < 0 ? -1 : i + q.length; }));
  if (cut < 0) return null;
  const w = s.slice(cut).trim();
  return w.length >= 6 && w.length <= 90 ? w : null;
}

/** shows `load`'s quote once it is there; the fallback after `wait` ms or when loading fails or gives nothing */
function useQuote(load: () => Promise<SourceQuote | null>, fallback: SourceQuote, key: string, wait = 3500): SourceQuote | null {
  const [q, setQ] = useState<SourceQuote | null>(null);
  const [late, setLate] = useState(false);
  useEffect(() => {
    let live = true;
    setQ(null); setLate(false);
    const timer = setTimeout(() => { if (live) setLate(true); }, wait);
    load().then((r) => { if (live) { if (r) setQ(r); else setLate(true); } }).catch(() => { if (live) setLate(true); });
    return () => { live = false; clearTimeout(timer); };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return q ?? (late ? fallback : null);
}

/** a verse of the story: translation (or the Uthmani text in Arabic) with the verse reference as the source */
export function useVerseQuote(verseKey: string, source: string, fallback: SourceQuote): SourceQuote | null {
  const { lang } = useLang();
  return useQuote(async () => {
    const v = await getVerseByKey(verseKey, lang);
    if (lang === "ar") return v.text_uthmani ? { text: "", arabic: v.text_uthmani.trim(), source } : null;
    return v.translation ? { text: v.translation.trim(), source } : null;
  }, fallback, `${verseKey}:${lang}`);
}

/** a hadith of the story from the Sunni collections: the quoted words in this language (Arabic: the Arabic words);
 *  a collection without a translation in this language shows the marked paraphrase instead of another language */
export function useHadithQuote(collection: string, n: number, source: string, quote: (w: string) => string, fallback: SourceQuote): SourceQuote | null {
  const { lang } = useLang();
  return useQuote(async () => {
    const h = await sunniHadith(collection, n, lang);
    if (!h) return null;
    if (lang === "ar") { const w = quotedWords(h.arabic); return w ? { text: "", arabic: w, source } : null; }
    if (h.textLang !== lang) return null;
    const w = quotedWords(h.text);
    return w ? { text: quote(w), source } : null;
  }, fallback, `${collection}:${n}:${lang}`);
}
