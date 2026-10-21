// mirrors mobile/src/features/reciter-path/useVerse.ts (copied for the website; keep both in step)
import { useEffect, useState } from "react";
import { useLang } from "@/lib/learn/i18n";
import { getVerses, type Reciter, type Verse } from "@/lib/learn/quran";
import { useReciter } from "@/lib/learn/reciter";

// Verses with their word data and timings from Quran.com (via the app's /api/q), cached per surah and reciter.
// The reciter is the allowed one (useReciter falls back to a free voice without Pro).
const cache = new Map<string, Promise<Verse[]>>();
function surahVerses(surah: number, lang: string, reciter: Reciter) {
  const k = `${surah}:${lang}:${reciter.folder}`;
  let p = cache.get(k);
  if (!p) { p = getVerses(surah, lang, reciter); cache.set(k, p); p.catch(() => cache.delete(k)); }
  return p;
}

export function useSurahVerses(surah: number | null): { verses: Verse[] | null; error: boolean } {
  const { lang } = useLang();
  const [reciter] = useReciter();
  const [state, setState] = useState<{ verses: Verse[] | null; error: boolean }>({ verses: null, error: false });
  useEffect(() => {
    if (!surah) return;
    let alive = true;
    setState({ verses: null, error: false });
    surahVerses(surah, lang, reciter).then((v) => { if (alive) setState({ verses: v, error: false }); }).catch(() => { if (alive) setState({ verses: null, error: true }); });
    return () => { alive = false; };
  }, [surah, lang, reciter]);
  return state;
}

export function useVerse(key: string | null): { verse: Verse | null; error: boolean } {
  const surah = key ? Number(key.split(":")[0]) : null;
  const { verses, error } = useSurahVerses(surah);
  return { verse: verses?.find((v) => v.verse_key === key) ?? null, error };
}

/** the real words of a verse (no end markers), in order */
export const wordsOf = (v: Verse) => v.words.filter((w) => w.char_type_name === "word");
