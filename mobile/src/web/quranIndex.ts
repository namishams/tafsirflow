import { VERSE_COUNTS } from "./counts";

// Position of every verse in the Quran (0 … 6235) and back
export const TOTAL_VERSES = 6236;
const START: number[] = [];
{ let n = 0; for (const c of VERSE_COUNTS) { START.push(n); n += c; } }

export const indexOf = (s: number, v: number) => START[s - 1] + v - 1;
export function keyAt(i: number): { s: number; v: number } {
  const n = Math.min(Math.max(i, 0), TOTAL_VERSES - 1);
  let s = 1;
  while (s < 114 && START[s] <= n) s++;
  return { s, v: n - START[s - 1] + 1 };
}
// first verse of each of the 30 parts (juz)
export const JUZ_START = ["1:1", "2:142", "2:253", "3:93", "4:24", "4:148", "5:82", "6:111", "7:88", "8:41", "9:93", "11:6", "12:53", "15:1", "17:1", "18:75", "21:1", "23:1", "25:21", "27:56", "29:46", "33:31", "36:28", "39:32", "41:47", "46:1", "51:31", "58:1", "67:1", "78:1"];
export const juzOf = (i: number) => { let j = 0; while (j < 29 && indexOf(...(JUZ_START[j + 1].split(":").map(Number) as [number, number])) <= i) j++; return j + 1; };
