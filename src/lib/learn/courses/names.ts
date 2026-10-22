// mirrors mobile/src/features/courses/names.ts (copied for the website; keep both in step)
// The pure part (REFS, nameKey, nameRefs, NAMES_COUNT, NAMES_FREE, nameLessonId) lives in ./namesRefs.ts so that server
// code can import it; it is re-exported here, so every existing import of "./names" keeps working.
import { useEffect, useState } from "react";
import { islamDoc, loadChapter } from "@/lib/islam";
import { allahNames, type AllahName } from "@/lib/learn/prophet/stories";

export { nameKey, nameRefs, NAMES_COUNT, NAMES_FREE, nameLessonId } from "./namesRefs";

const cache = new Map<string, AllahName[]>();
export function useAllahNames(lang: string): AllahName[] | null {
  const [v, setV] = useState<AllahName[] | null>(cache.get(lang) ?? null);
  useEffect(() => {
    let alive = true;
    if (cache.has(lang)) { setV(cache.get(lang)!); return; }
    const d = islamDoc("names");
    if (!d) { setV([]); return; }
    loadChapter(d, lang).then((c) => { const n = allahNames(c); cache.set(lang, n); if (alive) setV(n); }).catch(() => alive && setV([]));
    return () => { alive = false; };
  }, [lang]);
  return v;
}
