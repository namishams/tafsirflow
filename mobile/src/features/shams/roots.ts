import { useEffect, useState } from "react";

// The root (jidhr) of every Quran word and how many words of the Quran come from that root – for step 2 of the
// classic path ("word by word"). Counted from the Quranic Arabic Corpus morphology (GPL, via quran-morphology) at build
// time by the website's scripts/gen-word-roots.mjs into a compact table (web/data/word-roots.json, ~170 KB, copied by
// scripts/sync-web.mjs): the roots in order of frequency, their counts, and per surah "verse;verse" with "word,word" =
// the index of the word's root in base 36 (empty = particle without a root). Bundled with the app and read the first
// time step 2 opens; nothing is downloaded or parsed from the 6 MB morphology file on the JS thread.
// The website has the same module as src/lib/learn/wordRoots.ts.

type Table = { r: string; c: number[]; s: string[] };
export type WordRoot = { root: string; letters: string; count: number };

let table: Promise<Table> | null = null;
function rootTable(): Promise<Table> {
  if (!table) {
    // required on first use, so the table is only evaluated when a learner reaches step 2
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    table = new Promise<Table>((ok, fail) => { try { ok(require("@/web/data/word-roots.json") as Table); } catch (e) { fail(e); } });
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
