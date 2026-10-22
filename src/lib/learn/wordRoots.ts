import { useEffect, useState } from "react";
import { cachedFetch, DAY } from "@/lib/learn/content/sources/net";

// The root (jidhr) of every Quran word and how many words of the Quran come from that root – for step 2 of the
// classic path ("word by word"). Counted from the Quranic Arabic Corpus morphology (GPL, via quran-morphology), the
// same file the app already uses for its root table and the frequency track. Downloaded once (~6 MB, 180 days cached),
// reduced on the device to a compact table (~170 KB): the roots in order of frequency, their counts, and per surah
// "verse;verse" with "word,word" = the index of the word's root in base 36 (empty = particle without a root).
// mirrors mobile/src/features/shams/roots.ts (the app's module; keep both in step).
const MORPH = "https://raw.githubusercontent.com/mustafa0x/quran-morphology/master/quran-morphology.txt";

type Table = { r: string; c: number[]; s: string[] };
export type WordRoot = { root: string; letters: string; count: number };

function build(txt: string): Table {
  const count = new Map<string, number>();
  const per: [number, number, number, string][] = [];
  const seen = new Set<string>();
  for (const line of txt.split("\n")) {
    const p = line.split("\t");
    if (p.length < 4) continue;
    const root = /ROOT:([^|]+)/.exec(p[3])?.[1];
    if (!root) continue;
    const [s, a, w] = p[0].split(":").map(Number);
    const k = `${s}:${a}:${w}`;
    if (seen.has(k) || !(s >= 1 && s <= 114 && a >= 1 && w >= 1)) continue; // words, not segments
    seen.add(k);
    count.set(root, (count.get(root) ?? 0) + 1);
    per.push([s, a, w, root]);
  }
  const roots = [...count.keys()].sort((x, y) => count.get(y)! - count.get(x)!);
  const ix = new Map(roots.map((r, i) => [r, i.toString(36)]));
  const sur: string[][][] = Array.from({ length: 114 }, () => []);
  for (const [s, a, w, root] of per) ((sur[s - 1][a - 1] ??= [])[w - 1] = ix.get(root)!);
  return {
    r: roots.join(" "),
    c: roots.map((r) => count.get(r)!),
    s: sur.map((vs) => Array.from(vs, (ws) => Array.from(ws ?? [], (x) => x ?? "").join(",")).join(";")),
  };
}

let table: Promise<Table> | null = null;
function rootTable(): Promise<Table> {
  if (!table) {
    table = cachedFetch<Table>(MORPH, { key: "wordroots:v1", text: true, ttlMs: 180 * DAY, timeoutMs: 60_000, transform: (txt: string) => build(txt) });
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
