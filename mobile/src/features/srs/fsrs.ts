// FSRS-4.5 (Free Spaced Repetition Scheduler, Jarrett Ye et al.), the memory model behind modern Anki, with all four
// grades. Every card has a stability S (days until the chance of recall falls to 90 %) and a difficulty D (1–10).
//   new card:      S0 = w[g-1],  D0 = w4 − (g−3)·w5
//   recall R(t)  = (1 + F·t/S)^C            with F = 19/81, C = −0.5 (power forgetting curve)
//   after a lapse: S' = w11 · D^−w12 · ((S+1)^w13 − 1) · e^(w14·(1−R))
//   after success: S' = S · (e^w8 · (11−D) · S^−w9 · (e^(w10·(1−R)) − 1) · hard/easy + 1)
//   difficulty:    D' = w7·D0(4) + (1−w7)·(D − w6·(g−3))   (mean reversion)
//   interval     = S/F · (0.9^(1/C) − 1)  → due when R reaches the desired retention (90 %)
// Same weights as the verse scheduler in web/learning.ts. Pure functions, no storage.
export type Grade = 1 | 2 | 3 | 4; // again, hard, good, easy
export const GRADES: Grade[] = [1, 2, 3, 4];
export type Memory = { s: number; d: number; last: number; due: number; reps: number; lapses: number };

const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const F = 19 / 81, C = -0.5, RETAIN = 0.9, MAX_DAYS = 3650;
const clampD = (d: number) => Math.min(10, Math.max(1, d));
const d0 = (g: number) => clampD(W[4] - (g - 3) * W[5]);

export const recall = (s: number, t: number) => Math.pow(1 + (F * Math.max(0, t)) / Math.max(0.1, s), C);
export const intervalOf = (s: number) => Math.min(MAX_DAYS, Math.max(1, Math.round((s / F) * (Math.pow(RETAIN, 1 / C) - 1))));

export function nextMemory(prev: Memory | null, g: Grade, day: number): Memory {
  if (!prev) {
    const s = W[g - 1];
    // "again" and "hard" on a new card come back today, so the learning step happens in the same session
    return { s, d: d0(g), last: day, due: g <= 2 ? day : day + intervalOf(s), reps: 1, lapses: 0 };
  }
  const t = Math.max(0, day - prev.last);
  const r = recall(prev.s, t);
  const d = clampD(W[7] * d0(4) + (1 - W[7]) * (prev.d - W[6] * (g - 3)));
  let s: number;
  if (g === 1) s = Math.min(prev.s, W[11] * Math.pow(d, -W[12]) * (Math.pow(prev.s + 1, W[13]) - 1) * Math.exp(W[14] * (1 - r)));
  else s = prev.s * (Math.exp(W[8]) * (11 - d) * Math.pow(prev.s, -W[9]) * (Math.exp(W[10] * (1 - r)) - 1) * (g === 2 ? W[15] : 1) * (g === 4 ? W[16] : 1) + 1);
  s = Math.max(0.1, s);
  return { s, d, last: day, due: g === 1 ? day : day + intervalOf(s), reps: prev.reps + 1, lapses: prev.lapses + (g === 1 ? 1 : 0) };
}

/** the interval in days each grade would give (shown under the buttons) */
export const preview = (prev: Memory | null, day: number): Record<Grade, number> =>
  ({ 1: nextMemory(prev, 1, day).due - day, 2: nextMemory(prev, 2, day).due - day, 3: nextMemory(prev, 3, day).due - day, 4: nextMemory(prev, 4, day).due - day });

/** 0…1, how well the card is known today */
export const strengthOf = (m: Memory | null, day: number) => (m ? recall(m.s, day - m.last) : 0);
