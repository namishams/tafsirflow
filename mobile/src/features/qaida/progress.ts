import { readJSON, useStored, writeJSON } from "@/lib/store";
import { readArabic, type ArabicProgress } from "@/web/arabic";
import { addWordCard } from "@/features/srs";
import { PASS, STAGES, UNIT_STAGES, type QStage } from "./curriculum";

// Progress of the reading course, on the device ("qmc.qaida"): best score and stars per lesson, mistakes per item
// (letter "L:ب", syllable "S:بَ", word "W:1:1:2") for the adaptive review, the daily goal and the days practised.
// The placement test of the Arabic course (/arabic/placement, "tf:arabic") is read, not copied: stages it covers count
// as placed.

export type QaidaProgress = {
  done: Record<string, { best: number; stars: number; at: number }>;
  mistakes: Record<string, number>;
  goal: number;                    // lessons per day
  days: Record<string, number>;    // "YYYY-MM-DD" → lessons finished that day
  speed: Record<string, number>;   // best speed-drill time (ms) per lesson
};
export const QAIDA_KEY = "qmc.qaida";
const EMPTY: QaidaProgress = { done: {}, mistakes: {}, goal: 1, days: {}, speed: {} };
export const readQaida = (): QaidaProgress => ({ ...EMPTY, ...readJSON<Partial<QaidaProgress>>(QAIDA_KEY, {}) });
export const useQaida = (): QaidaProgress => ({ ...EMPTY, ...useStored<Partial<QaidaProgress>>(QAIDA_KEY, {}) });
export const useArabicCourse = () => useStored<ArabicProgress>("tf:arabic", { done: {}, xp: 0, mistakes: {} });

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const starsFor = (pct: number) => (pct >= 95 ? 3 : pct >= 85 ? 2 : pct >= PASS ? 1 : 0);

export function saveLesson(id: string, pct: number, wrong: string[], right: string[]) {
  const p = readQaida();
  const prev = p.done[id];
  const done = { ...p.done, [id]: { best: Math.max(prev?.best ?? 0, pct), stars: Math.max(prev?.stars ?? 0, starsFor(pct)), at: Date.now() } };
  const mistakes = { ...p.mistakes };
  for (const k of wrong) mistakes[k] = (mistakes[k] ?? 0) + 1;
  for (const k of right) if (mistakes[k]) { mistakes[k] = Math.max(0, mistakes[k] - 1); if (!mistakes[k]) delete mistakes[k]; }
  const k = dayKey();
  const days = { ...p.days, [k]: (p.days[k] ?? 0) + 1 };
  for (const d of Object.keys(days).sort().slice(0, -90)) delete days[d];
  writeJSON(QAIDA_KEY, { ...p, done, mistakes, days });
  // adaptive review: Quran words read correctly or missed become cards in the card trainer
  for (const key of [...wrong, ...right]) {
    const m = key.match(/^W:(\d+):(\d+):(\d+)$/);
    if (m) addWordCard(`${m[1]}:${m[2]}`, Number(m[3]));
  }
}
export function saveSpeed(id: string, ms: number) {
  const p = readQaida();
  const best = p.speed[id];
  if (!best || ms < best) writeJSON(QAIDA_KEY, { ...p, speed: { ...p.speed, [id]: ms } });
}
export const setGoal = (n: number) => writeJSON(QAIDA_KEY, { ...readQaida(), goal: n });

/** stages covered by the placement test of the Arabic course (passed units in a row) */
export function placedStages(a: ArabicProgress = readArabic()): Set<number> {
  const n = a.placement?.units ?? 0;
  const out = new Set<number>();
  for (let u = 1; u <= n; u++) for (const s of UNIT_STAGES[u] ?? []) out.add(s);
  return out;
}

export const lessonPassed = (p: QaidaProgress, id: string) => (p.done[id]?.best ?? 0) >= PASS;
export function stageState(p: QaidaProgress, s: QStage, placed: Set<number>) {
  const passed = s.lessons.filter((l) => lessonPassed(p, l.id)).length;
  const stars = s.lessons.length ? Math.min(...s.lessons.map((l) => p.done[l.id]?.stars ?? 0)) : 0;
  const complete = s.openAll ? passed >= (s.need ?? s.lessons.length) : passed === s.lessons.length;
  return { passed, total: s.lessons.length, stars: complete ? Math.max(1, stars) : placed.has(s.n) ? 1 : 0, complete: complete || placed.has(s.n), placed: placed.has(s.n) && !complete };
}
/** a stage opens when the stage before it is complete or placed */
export function stageOpen(p: QaidaProgress, n: number, placed: Set<number>) {
  if (n <= 1) return true;
  const prev = STAGES[n - 2];
  return stageState(p, prev, placed).complete;
}
/** inside a stage, lessons open one after the other (Juz ʿAmma: all open) */
export function lessonOpen(p: QaidaProgress, s: QStage, i: number, placed: Set<number>) {
  if (i === 0 || s.openAll || placed.has(s.n)) return true;
  return lessonPassed(p, s.lessons[i - 1].id);
}
export function nextLesson(p: QaidaProgress, placed: Set<number>) {
  for (const s of STAGES) {
    if (stageState(p, s, placed).complete) continue;
    const l = s.lessons.find((x) => !lessonPassed(p, x.id));
    if (l) return { stage: s, lesson: l };
  }
  return null;
}
export const todayCount = (p: QaidaProgress) => p.days[dayKey()] ?? 0;
export function streak(p: QaidaProgress, now = new Date()) {
  const d = new Date(now);
  if (!p.days[dayKey(d)]) d.setDate(d.getDate() - 1);
  let n = 0;
  while (p.days[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
/** the items missed most often (for the review lesson) */
export const weakKeys = (p: QaidaProgress, n = 12) => Object.entries(p.mistakes).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k]) => k);
