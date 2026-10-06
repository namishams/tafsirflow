import type { Chapter } from "@/lib/quran";
import { VERSE_COUNTS } from "@/lib/counts";
import { JUZ_START } from "@/lib/quranIndex";

// Place of revelation as Quran.com lists it (used when the chapter data does not carry revelation_place)
const MADANI = new Set([2, 3, 4, 5, 8, 9, 13, 22, 24, 33, 47, 48, 49, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 76, 98, 99, 110]);
export type Place = "makki" | "madani";
export function placeOf(c: Chapter): Place {
  const p = (c as Chapter & { revelation_place?: string }).revelation_place;
  if (p) return /madin|medin/i.test(p) ? "madani" : "makki";
  return MADANI.has(c.id) ? "madani" : "makki";
}

const starts = JUZ_START.map((k) => k.split(":").map(Number) as [number, number]);

// The 30 parts: where each begins and ends, and the part of every surah that lies inside it
export type JuzPart = { s: number; from: number; to: number };
export type Juz = { n: number; from: string; to: string; total: number; parts: JuzPart[] };
export const JUZ: Juz[] = starts.map(([s0, v0], i) => {
  const next = starts[i + 1];
  const [s1, v1] = next ? (next[1] > 1 ? [next[0], next[1] - 1] : [next[0] - 1, VERSE_COUNTS[next[0] - 2]]) : [114, VERSE_COUNTS[113]];
  const parts: JuzPart[] = [];
  for (let s = s0; s <= s1; s++) parts.push({ s, from: s === s0 ? v0 : 1, to: s === s1 ? v1 : VERSE_COUNTS[s - 1] });
  return { n: i + 1, from: `${s0}:${v0}`, to: `${s1}:${v1}`, total: parts.reduce((a, p) => a + p.to - p.from + 1, 0), parts };
});

// part in which a surah begins
export const juzOfSurah = (s: number) => JUZ.find((j) => j.parts.some((p) => p.s === s && p.from === 1))?.n ?? 1;
