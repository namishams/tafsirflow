import { useEffect, useState } from "react";
import { getVerses, type Reciter, type Verse } from "@/lib/quran";

// The text of the surah on air (Arabic, translation, word timings of the reciter if Quran.com has them), straight
// from the server like the website's radio. Cached per surah, language and reciter.
const cache = new Map<string, Promise<Verse[]>>();

function load(s: number, lang: string, reciter: Reciter): Promise<Verse[]> {
  const key = `${s}:${lang}:${reciter.id > 0 ? reciter.id : 0}`;
  let p = cache.get(key);
  if (!p) {
    p = getVerses(s, lang, reciter);
    p.catch(() => cache.delete(key));
    cache.set(key, p);
  }
  return p;
}

export function useSurahText(s: number, lang: string, reciter: Reciter | undefined): { verses: Verse[] | null; failed: boolean; retry: () => void } {
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [n, setN] = useState(0);
  const rid = reciter && reciter.id > 0 ? reciter.id : 0;
  useEffect(() => {
    if (!reciter) return;
    let off = false;
    setFailed(false);
    load(s, lang, reciter).then((v) => { if (!off) setVerses(v); }).catch(() => { if (!off) { setVerses(null); setFailed(true); } });
    return () => { off = true; };
  }, [s, lang, rid, n]); // eslint-disable-line react-hooks/exhaustive-deps
  return { verses: verses && verses[0]?.verse_key.startsWith(`${s}:`) ? verses : null, failed, retry: () => setN((x) => x + 1) };
}
