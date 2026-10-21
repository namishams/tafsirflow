// mirrors mobile/src/features/exam/plans.ts (copied for the website; keep both in step)
import { JUZ_START, TOTAL_VERSES, indexOf, keyAt } from "@/lib/quranIndex";
import { LEVELS } from "@/lib/learn/reciter-path/curriculum";
import type { ExamKind, RecitePlan } from "./integrity";

// Which exam rules a runner uses, and the verse pools of the recitation parts (drawn with the attempt's seed).

/** the card trainer's tests: the placement test has no exam rules */
export function examOfTest(kind: string): ExamKind | null {
  return kind === "juz" ? "juz" : kind === "surah" ? "surah" : kind === "vocab" ? "vocab" : kind === "weekly" ? "weekly" : null;
}

const pick = <T,>(arr: T[], rand: () => number) => arr[Math.floor(rand() * arr.length)];

/** juz exam: one verse of the juz, recited from memory (al-Fatiha's basmala excluded) */
export function juzRecitePlan(juz: number, rand: () => number): RecitePlan {
  const j = Math.min(30, Math.max(1, juz || 30));
  const a = indexOf(...(JUZ_START[j - 1].split(":").map(Number) as [number, number]));
  const b = j < 30 ? indexOf(...(JUZ_START[j].split(":").map(Number) as [number, number])) : TOTAL_VERSES;
  let k = { s: 1, v: 1 };
  for (let tries = 0; tries < 10 && k.s === 1 && k.v === 1; tries++) k = keyAt(a + Math.floor(rand() * (b - a)));
  return { verse: `${k.s}:${k.v}`, mode: "memory" };
}

/** verses of the Reciter Path's applied units up to a level */
function rpVerses(level: number): string[] {
  const out: string[] = [];
  for (const l of LEVELS.filter((x) => x.n <= level && x.n >= Math.min(6, level))) for (const u of l.units) for (const r of u.verses ?? []) for (let v = r.from; v <= r.to; v++) out.push(`${r.surah}:${v}`);
  return out.length ? out : ["1:2", "1:3", "1:4", "1:5", "1:6", "1:7"];
}
/** Reciter Path level exam: a verse of that level's units, read aloud */
export const rpRecitePlan = (level: number, rand: () => number): RecitePlan => {
  const own = LEVELS[level - 1]?.units.flatMap((u) => (u.verses ?? []).flatMap((r) => Array.from({ length: r.to - r.from + 1 }, (_, i) => `${r.surah}:${r.from + i}`))) ?? [];
  return { verse: pick(own.length ? own : rpVerses(level), rand), mode: "reading" };
};
/** Arabic C1: reading a longer verse aloud (verses of the upper Reciter Path levels) */
export const arabicRecitePlan = (rand: () => number): RecitePlan => ({ verse: pick(rpVerses(10).filter((k) => !k.startsWith("1:")), rand), mode: "reading" });
