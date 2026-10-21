// mirrors mobile/src/features/reciter-path/progress.ts (copied for the website; keep both in step)
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { LEVELS } from "./curriculum";

// Progress of the Reciter Path on this device (synced like other learning data through the store's write hook)
const KEY = "qmc.reciterPath";
export type RpProgress = {
  /** unit id → best test score 0..1 (units without a test: 1 when marked done) */
  units: Record<string, number>;
  /** "unitId:index" → ticked in the self-check */
  checks: Record<string, boolean>;
  /** level → best exam score 0..1 */
  exams: Record<string, number>;
  /** level → date the certificate was earned (YYYY-MM-DD) */
  certs: Record<string, string>;
};
const EMPTY: RpProgress = { units: {}, checks: {}, exams: {}, certs: {} };

export const useRpProgress = () => ({ ...EMPTY, ...useStored<RpProgress>(KEY, EMPTY) });
const read = () => ({ ...EMPTY, ...readJSON<RpProgress>(KEY, EMPTY) });
const save = (p: RpProgress) => writeJSON(KEY, p);

export function setUnitScore(id: string, score: number) {
  const p = read();
  p.units = { ...p.units, [id]: Math.max(score, p.units[id] ?? 0) };
  save(p);
}
export function toggleCheck(id: string, i: number) {
  const p = read();
  const k = `${id}:${i}`;
  p.checks = { ...p.checks, [k]: !p.checks[k] };
  save(p);
}
export function setExamScore(level: number, score: number, passed: boolean) {
  const p = read();
  p.exams = { ...p.exams, [level]: Math.max(score, p.exams[level] ?? 0) };
  if (passed && !p.certs[level]) p.certs = { ...p.certs, [level]: new Date().toISOString().slice(0, 10) };
  save(p);
}
export const PASSED_UNIT = 0.8;
export const unitDone = (p: RpProgress, id: string) => (p.units[id] ?? 0) >= PASSED_UNIT;
export const levelUnitsDone = (p: RpProgress, n: number) => LEVELS[n - 1].units.every((u) => unitDone(p, u.id));
