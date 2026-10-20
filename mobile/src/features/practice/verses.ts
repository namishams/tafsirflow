import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { TRANSLATION } from "@/lib/quran";

// Single verses by key from the website's own Quran store (/api/q/verses/by_key), with the same translation the
// website picks (Bubenheim & Elyas for German, Saheeh International for English) and the same clean-up of the text.
export type SingleVerse = { verse_key: string; text_uthmani: string; translation: string };

const cache = new Map<string, Promise<SingleVerse>>();
export function getVerseByKey(key: string, lang: string): Promise<SingleVerse> {
  const id = `${lang}|${key}`;
  let p = cache.get(id);
  if (!p) {
    p = api<{ verse: { verse_key: string; text_uthmani: string; translations?: { text?: string }[] } }>(
      `/api/q/verses/by_key/${key}?language=${lang}&words=false&translations=${TRANSLATION[lang] ?? 20}&fields=text_uthmani`,
    ).then((d) => ({
      verse_key: d.verse.verse_key,
      text_uthmani: d.verse.text_uthmani,
      translation: String(d.verse.translations?.[0]?.text ?? "").replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, "").trim(),
    }));
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return p;
}

/** verses for a list of keys: undefined while loading, null when one could not be loaded */
export function useVerses(keys: string[], lang: string): Record<string, SingleVerse | null | undefined> {
  const [got, setGot] = useState<Record<string, SingleVerse | null>>({});
  const sig = `${lang}|${keys.join(",")}`;
  useEffect(() => {
    let alive = true;
    setGot({});
    for (const k of keys) {
      getVerseByKey(k, lang)
        .then((v) => { if (alive) setGot((x) => ({ ...x, [k]: v.verse_key === k ? v : null })); })
        .catch(() => { if (alive) setGot((x) => ({ ...x, [k]: null })); });
    }
    return () => { alive = false; };
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  return got;
}

/** verse number as the website's end-of-verse sign ﴿٦﴾ (Arabic-Indic digits) */
export const verseEnd = (n: number) => `﴿${String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)])}﴾`;
