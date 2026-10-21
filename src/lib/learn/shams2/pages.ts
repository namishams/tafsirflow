// mirrors mobile/src/features/shams2/pages.ts (copied for the website; keep in step with the app)
import { useEffect, useMemo } from "react";
import { api } from "@/lib/learn/api";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { K } from "./store";

// Mushaf pages (Madani mushaf, 604 pages) of each verse, from the Quran API (page_number), never typed by hand.
// Loaded once per surah that holds memorised verses and cached on the device.
type PageMap = Record<string, number[]>;
const inflight = new Map<number, Promise<void>>();

export function loadPages(surah: number): Promise<void> {
  if (readJSON<PageMap>(K.pages, {})[surah]?.length) return Promise.resolve();
  let p = inflight.get(surah);
  if (!p) {
    p = api<{ verses: { verse_number: number; page_number: number }[] }>(`/api/q/verses/by_chapter/${surah}?fields=page_number&per_page=300`)
      .then((d) => {
        const list: number[] = [];
        for (const v of d.verses ?? []) list[v.verse_number - 1] = Number(v.page_number) || 0;
        writeJSON(K.pages, { ...readJSON<PageMap>(K.pages, {}), [surah]: Array.from(list, (x) => x ?? 0) }, true);
      })
      .finally(() => inflight.delete(surah));
    inflight.set(surah, p);
  }
  return p;
}

/** the page map for the given surahs; missing surahs are fetched in the background */
export function usePageMap(surahs: number[]): PageMap {
  const map = useStored<PageMap>(K.pages, {});
  const want = useMemo(() => [...new Set(surahs)].sort((a, b) => a - b).join(","), [surahs]);
  useEffect(() => {
    let alive = true;
    (async () => { for (const s of want ? want.split(",").map(Number) : []) { if (!alive) return; await loadPages(s).catch(() => undefined); } })();
    return () => { alive = false; };
  }, [want]);
  return map;
}
