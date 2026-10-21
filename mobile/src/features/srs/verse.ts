import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { RECITERS, audioUrl, stripFootnotes, translationFor } from "@/lib/quran";
import { readJSON, writeJSON } from "@/lib/store";
import { findWordPosition, hasAudio } from "@/web/vocabStudy";
import type { Word as VocabWord } from "@/web/vocab";

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

export function useVerseData(key: string | null, lang: string) {
  const [st, setSt] = useState<{ key: string; data?: VerseData; error?: boolean } | null>(null);
  useEffect(() => {
    if (!key) { setSt(null); return; }
    let live = true;
    setSt({ key });
    loadVerse(key, lang).then((data) => { if (live) setSt({ key, data }); }).catch(() => { if (live) setSt({ key, error: true }); });
    return () => { live = false; };
  }, [key, lang]);
  return st && st.key === key ? st : null;
}

const POS_KEY = "qmc.vocab.pos"; // shared with the vocabulary trainer: { wordId: position | 0 }
/** the position of a vocabulary word in its example verse (for the word recording) */
export function useWordPosition(word: VocabWord | undefined, lang: string): number | null {
  const [pos, setPos] = useState<number | null>(null);
  useEffect(() => {
    setPos(null);
    if (!word?.ex || !hasAudio(word)) return;
    const cached = readJSON<Record<string, number>>(POS_KEY, {})[word.id];
    if (cached !== undefined) { setPos(cached || null); return; }
    let live = true;
    loadVerse(word.ex.key, lang).then((d) => {
      const p = findWordPosition(word, d.words.map((w) => ({ position: w.position, text: w.text })));
      writeJSON(POS_KEY, { ...readJSON<Record<string, number>>(POS_KEY, {}), [word.id]: p ?? 0 }, true);
      if (live) setPos(p);
    }).catch(() => undefined);
    return () => { live = false; };
  }, [word, lang]);
  return pos;
}

/** a few word positions of the verse to hide for a cloze (deterministic per card and review, so it does not jump) */
export function clozePositions(words: VWord[], seed: number, share = 0.35): Set<number> {
  const n = Math.max(1, Math.round(words.length * share));
  const order = words.map((w, i) => ({ p: w.position, r: Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453 % 1 }))
    .sort((a, b) => a.r - b.r).slice(0, n).map((x) => x.p);
  return new Set(order);
}
