import { useEffect, useState } from "react";

// The root (jidhr) of every Quran word and how many words of the Quran come from that root – for step 2 of the
// classic path ("word by word"). Counted from the Quranic Arabic Corpus morphology (GPL, via quran-morphology) at build
// time by scripts/gen-word-roots.mjs into a compact table (src/lib/data/word-roots.json, ~170 KB): the roots in order of
// frequency, their counts, and per surah "verse;verse" with "word,word" = the index of the word's root in base 36 (empty
// = particle without a root). Loaded as its own chunk the first time step 2 opens; nothing is downloaded or parsed from
// the 6 MB morphology file at run time.
// mirrors mobile/src/features/shams/roots.ts (the app's module; keep both in step).

type Table = { r: string; c: number[]; s: string[] };
export type WordRoot = { root: string; letters: string; count: number };

let table: Promise<Table> | null = null;
function rootTable(): Promise<Table> {
  if (!table) {
    table = import("@/lib/data/word-roots.json").then((m) => (m.default ?? m) as Table);
    table.catch(() => { table = null; });
  }
  return table;
}

const decoded = new Map<number, (WordRoot | null)[][]>();
/** the roots of every word of a surah: [verse - 1][word position - 1], null for a word without a root */
export async function surahRoots(s: number): Promise<(WordRoot | null)[][]> {
  const hit = decoded.get(s);
  if (hit) return hit;
  const t = await rootTable();
  const roots = t.r.split(" ");
  const rows = (t.s[s - 1] ?? "").split(";").map((v) => (v ? v.split(",") : []).map((x) => {
    if (!x) return null;
    const i = parseInt(x, 36);
    const root = roots[i];
    return root ? { root, letters: [...root].join(" "), count: t.c[i] ?? 0 } : null;
  }));
  decoded.set(s, rows);
  return rows;
}

/** the roots of the words of one verse by word position (empty while loading or offline) */
export function useVerseRoots(s: number, v: number, on = true): Record<number, WordRoot> {
  const [out, setOut] = useState<Record<number, WordRoot>>({});
  useEffect(() => {
    if (!on) return;
    let live = true;
    setOut({});
    surahRoots(s)
      .then((rows) => {
        if (!live) return;
        const r: Record<number, WordRoot> = {};
        (rows[v - 1] ?? []).forEach((x, i) => { if (x) r[i + 1] = x; });
        setOut(r);
      })
      .catch(() => undefined);
    return () => { live = false; };
  }, [s, v, on]);
  return out;
}
