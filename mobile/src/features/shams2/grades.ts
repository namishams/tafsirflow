import { readJSON, useStored, writeJSON } from "@/lib/store";
import { today } from "@/web/learning";
import { MUT_GROUPS } from "./mutData";
import type { Known } from "./qualityModel";
import { K } from "./store";

// Darajāt al-Ḥifẓ – the grades of the programme. Like a real madrasa the demands rise with the learner: a larger daily
// wird, fewer prompts (full text → first letters → hidden), stricter word checks, a faster pace target, a shorter
// manzil cycle (a larger share of the memorised Qurʾān every day, classically one seventh), surprise ʿarḍ checks,
// mutashābihāt traps and formal tests (weekly ʿarḍ, monthly juzʾ review) that gate moving on.
// Never punishing: a grade once reached is kept; a failed test only means a calm retake (the next day) with the weak
// verses practised first. Rigorous: promotion needs memorised verses, quality, and passed formal tests.

export type Prompt = "full" | "letters" | "hidden";
export type Grade = {
  n: number; ar: string; tr: string;
  prompt: Prompt; // how much text the learner sees when reciting from memory
  wordPass: number; // share of words a recitation check must hear correctly
  pace: number; // target time as a multiple of the master reciter's time
  manzilDays: number; // the manzil cycle (days) when the learner keeps "by grade"
  newFactor: number; // multiplier on the coach's daily new verses
  minutesMin: number; // the wird is never planned below this
  ardPerDay: number; // surprise ʿarḍ checks a day
  traps: boolean; // mutashābihāt traps inside ʿarḍ checks and tests
  weeklyItems: number; monthlyItems: number; testPass: number;
  // requirements to reach this grade
  req: { verses: number; quality: number; weekly: number; monthly: number };
};

export const GRADES: Grade[] = [
  { n: 1, ar: "المُبْتَدِئ", tr: "al-Mubtadiʾ", prompt: "full", wordPass: 0.7, pace: 2, manzilDays: 14, newFactor: 1, minutesMin: 10, ardPerDay: 0, traps: false, weeklyItems: 5, monthlyItems: 10, testPass: 0.7, req: { verses: 0, quality: 0, weekly: 0, monthly: 0 } },
  { n: 2, ar: "المُتَعَلِّم", tr: "al-Mutaʿallim", prompt: "full", wordPass: 0.8, pace: 1.7, manzilDays: 10, newFactor: 1, minutesMin: 15, ardPerDay: 1, traps: false, weeklyItems: 8, monthlyItems: 12, testPass: 0.75, req: { verses: 20, quality: 50, weekly: 1, monthly: 0 } },
  { n: 3, ar: "المُتَوَسِّط", tr: "al-Mutawassiṭ", prompt: "letters", wordPass: 0.85, pace: 1.5, manzilDays: 7, newFactor: 1.2, minutesMin: 20, ardPerDay: 1, traps: true, weeklyItems: 10, monthlyItems: 15, testPass: 0.8, req: { verses: 100, quality: 60, weekly: 3, monthly: 1 } },
  { n: 4, ar: "المُتَمَكِّن", tr: "al-Mutamakkin", prompt: "letters", wordPass: 0.9, pace: 1.3, manzilDays: 7, newFactor: 1.4, minutesMin: 30, ardPerDay: 2, traps: true, weeklyItems: 12, monthlyItems: 20, testPass: 0.85, req: { verses: 300, quality: 70, weekly: 6, monthly: 2 } },
  { n: 5, ar: "المُتْقِن", tr: "al-Mutqin", prompt: "hidden", wordPass: 0.95, pace: 1.15, manzilDays: 7, newFactor: 1.6, minutesMin: 40, ardPerDay: 2, traps: true, weeklyItems: 15, monthlyItems: 25, testPass: 0.9, req: { verses: 1000, quality: 78, weekly: 12, monthly: 4 } },
  { n: 6, ar: "الحافِظ", tr: "al-Ḥāfiẓ", prompt: "hidden", wordPass: 0.97, pace: 1.05, manzilDays: 5, newFactor: 1.8, minutesMin: 50, ardPerDay: 3, traps: true, weeklyItems: 20, monthlyItems: 30, testPass: 0.92, req: { verses: 3000, quality: 85, weekly: 24, monthly: 8 } },
  { n: 7, ar: "الحافِظ المُتْقِن", tr: "al-Ḥāfiẓ al-Mutqin", prompt: "hidden", wordPass: 0.98, pace: 1, manzilDays: 3, newFactor: 2, minutesMin: 60, ardPerDay: 3, traps: true, weeklyItems: 25, monthlyItems: 40, testPass: 0.95, req: { verses: 6230, quality: 90, weekly: 40, monthly: 12 } },
];

export type TestKind = "weekly" | "monthly" | "ard";
export type TestResult = { kind: TestKind; day: number; score: number; items: number; pass: boolean; juz?: number };
export type GradeState = { grade: number; since: number; tests: TestResult[]; ard: Record<string, number> }; // ard: day -> checks done
const EMPTY: GradeState = { grade: 1, since: 0, tests: [], ard: {} };
const KEY = K.grade;
export const readGrade = () => readJSON<GradeState>(KEY, EMPTY);
export const useGradeState = () => useStored<GradeState>(KEY, EMPTY);
export const gradeOf = (n: number) => GRADES[Math.max(1, Math.min(GRADES.length, n)) - 1];

const passed = (st: GradeState, kind: TestKind) => st.tests.filter((x) => x.kind === kind && x.pass).length;
const lastPass = (st: GradeState, kind: TestKind) => Math.max(-Infinity, ...st.tests.filter((x) => x.kind === kind && x.pass).map((x) => x.day));
const lastTry = (st: GradeState, kind: TestKind) => Math.max(-Infinity, ...st.tests.filter((x) => x.kind === kind).map((x) => x.day));

/** what the next grade asks for, each with its current value */
export function nextRequirements(st: GradeState, verses: number, quality: number | null) {
  const next = GRADES[st.grade];
  if (!next) return null;
  const q = quality ?? 0;
  const items = [
    { id: "verses", have: verses, need: next.req.verses },
    { id: "quality", have: q, need: next.req.quality },
    { id: "weekly", have: passed(st, "weekly"), need: next.req.weekly },
    { id: "monthly", have: passed(st, "monthly"), need: next.req.monthly },
  ] as const;
  return { grade: next, items, ready: items.every((x) => x.have >= x.need) };
}

/** a grade is reached once all requirements hold; it is never taken away */
export function checkPromotion(verses: number, quality: number | null): Grade | null {
  const st = readGrade();
  const r = nextRequirements(st, verses, quality);
  if (!r?.ready) return null;
  writeJSON(KEY, { ...st, grade: r.grade.n, since: today() });
  return r.grade;
}

/** formal tests due now: the weekly ʿarḍ every 7 days once 10 verses are memorised, the monthly juzʾ review every 30
 *  days once 50 are. A failed test can be retaken from the next day. */
export function testsDue(st: GradeState, verses: number, day = today()) {
  const due = (kind: TestKind, every: number, min: number) => verses >= min && day - lastPass(st, kind) >= every && lastTry(st, kind) < day;
  return { weekly: due("weekly", 7, 10), monthly: due("monthly", 30, 50) };
}
/** the gate: new memorisation (sabaq) waits while a formal test is overdue by more than 2 days */
export function sabaqGated(st: GradeState, verses: number, day = today()): boolean {
  const over = (kind: TestKind, every: number, min: number) => verses >= min && day - lastPass(st, kind) >= every + 2;
  return over("weekly", 7, 10) || over("monthly", 30, 50);
}

export function recordTest(r: TestResult) {
  const st = readGrade();
  writeJSON(KEY, { ...st, tests: [...st.tests, r].slice(-200), ard: r.kind === "ard" ? { ...st.ard, [r.day]: (st.ard[r.day] ?? 0) + 1 } : st.ard });
}

// ---------- choosing verses for checks ----------
const rnd = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

/** verse keys for a test: weakest and random ones from the memorised portion, a juzʾ for the monthly review, and
 *  mutashābihāt traps (a verse whose twin is also memorised) when the grade asks for them */
export function pickItems(known: Map<string, Known>, n: number, grade: Grade, seed: number, juzOf?: (i: number) => number, juz?: number): string[] {
  const r = rnd(seed);
  let pool = [...known.values()];
  if (juz && juzOf) pool = pool.filter((k) => juzOf(k.i) === juz);
  if (!pool.length) return [];
  const out = new Set<string>();
  if (grade.traps) for (const g of MUT_GROUPS) { const ks = g.keys.filter((k) => known.has(k)); if (ks.length >= 2 && out.size < Math.ceil(n / 4)) out.add(ks[Math.floor(r() * ks.length)]); }
  const weak = [...pool].sort((a, b) => a.recall - b.recall).slice(0, Math.ceil(n / 3));
  for (const k of weak) if (out.size < n) out.add(k.key);
  for (let guard = 0; out.size < Math.min(n, pool.length) && guard < 500; guard++) out.add(pool[Math.floor(r() * pool.length)].key);
  return [...out].sort(() => r() - 0.5);
}
