// mirrors mobile/src/features/srs/verse.ts (copied for the website; keep both in step). No React here, so server modules
// can import loadVerse; the two hooks (useVerseData, useWordPosition) live in ./verseHooks.ts.
import { api } from "@/lib/learn/api";
import { RECITERS, audioUrl, stripFootnotes, translationFor } from "@/lib/learn/quran";

// Verse text for cards and exams always comes from the Quran API (never typed by hand): the words of a verse with
// their position, transliteration and word meaning, plus the verse translation. Cached in memory per session.
export type VWord = { position: number; text: string; tr: string; meaning: string };
export type VerseData = { key: string; words: VWord[]; translation: string; audio: string };

const cache = new Map<string, Promise<VerseData>>();
export function loadVerse(key: string, lang: string): Promise<VerseData> {
  const ck = `${key}|${lang}`;
  let p = cache.get(ck);
  if (!p) {
    p = (async () => {
      const tid = await translationFor(lang);
      type Raw = { verse: { words?: { position: number; text_uthmani: string; char_type_name: string; translation?: { text?: string }; transliteration?: { text?: string } }[]; translations?: { text: string }[] } };
      const d = await api<Raw>(`/api/q/verses/by_key/${key}?language=${lang}&words=true&word_fields=text_uthmani&translations=${tid}&fields=text_uthmani`);
      return {
        key,
        words: (d.verse.words ?? []).filter((w) => w.char_type_name === "word").map((w) => ({ position: w.position, text: w.text_uthmani, tr: w.transliteration?.text ?? "", meaning: w.translation?.text ?? "" })),
        translation: lang === "ar" ? "" : stripFootnotes(String(d.verse.translations?.[0]?.text ?? "")),
        audio: audioUrl(RECITERS[0], Number(key.split(":")[0]), Number(key.split(":")[1])),
      };
    })();
    p.catch(() => cache.delete(ck));
    cache.set(ck, p);
  }
  return p;
}

/** a few word positions of the verse to hide for a cloze (deterministic per card and review, so it does not jump) */
export function clozePositions(words: VWord[], seed: number, share = 0.35): Set<number> {
  const n = Math.max(1, Math.round(words.length * share));
  const order = words.map((w, i) => ({ p: w.position, r: Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453 % 1 }))
    .sort((a, b) => a.r - b.r).slice(0, n).map((x) => x.p);
  return new Set(order);
}
