"use client";
// the hooks of mobile/src/features/srs/verse.ts (useVerseData, useWordPosition), split from ./verse.ts on the website so
// that server modules can import loadVerse without React hooks; keep both in step with the app.
import { useEffect, useState } from "react";
import { readJSON, writeJSON } from "@/lib/learn/store";
import { findWordPosition, hasAudio } from "@/lib/vocabStudy";
import type { Word as VocabWord } from "@/lib/vocab";
import { loadVerse, type VerseData } from "./verse";

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

