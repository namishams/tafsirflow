import { useMemo } from "react";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { readGoal } from "@/web/coach";
import { today } from "@/web/learning";
import { askForReviewAfterSuccess } from "@/lib/review";

// Shams Method 2.0 – its own local keys (the existing Shams keys "tf:srs", "tf:days", "qmc.shams-program.v1" … are
// only read, never replaced). Every key is versioned; new fields are added, never renamed.
export const K = {
  settings: "qmc.shams2.settings.v1",
  log: "qmc.shams2.log.v1", // day -> blocks done
  words: "qmc.shams2.words.v1", // verse key -> word position -> { miss, ok, last }
  checks: "qmc.shams2.checks.v1", // verse key -> recitation checks { ok words, total words, n, last }
  mut: "qmc.shams2.mut.v1", // verse key -> mutashabihat answers { ok, miss, last }
  pages: "qmc.shams2.pages.v1", // surah -> page per verse (from the Quran API, cached)
  teacher: "qmc.shams2.teacher.v1", // linked teachers (student side) and imported students (teacher side)
  grade: "qmc.shams2.grade.v1", // darajāt al-ḥifẓ: grade reached, formal tests, surprise ʿarḍ checks
} as const;

export type Settings = {
  minutes: number; // daily minutes for the whole wird
  newPerDay: number; // 0 = automatic (the coach decides)
  sabqiDays: number; // how long a portion counts as "recent" (sabqi) before it moves to the manzil
  manzilDays: number; // the manzil is completed once in this many days (0 = by grade; classically 7)
  name?: string; // name shown to a teacher (optional, never required)
  level?: "easy" | "medium" | "hard" | "veryHard"; // difficulty (level.ts); absent = medium with the settings as they are
};
export const defaultSettings = (): Settings => ({ minutes: readGoal()?.minutes ?? 20, newPerDay: 0, sabqiDays: 30, manzilDays: 0 });
export const readSettings = (): Settings => ({ ...defaultSettings(), ...readJSON<Partial<Settings>>(K.settings, {}) });
export function useSettings(): Settings {
  const raw = useStored<Partial<Settings>>(K.settings, {});
  return useMemo(() => ({ ...defaultSettings(), ...raw }), [raw]);
}
export const saveSettings = (p: Partial<Settings>) => writeJSON(K.settings, { ...readJSON<Partial<Settings>>(K.settings, {}), ...p });

export type Block = "sabaq" | "sabqi" | "manzil";
// `listen`: a listening and understanding day (listenDays.ts) – the wird was kept by listening, meaning and vocabulary
// instead of reciting. It keeps the streak; the teacher snapshot does not show it (only the three blocks).
export type DayLog = Partial<Record<Block, number>> & { listen?: number; r?: Record<string, "fluent" | "hesitant" | "weak"> };
export type Log = Record<string, DayLog>;
export const readLog = () => readJSON<Log>(K.log, {});
export const useLog = () => useStored<Log>(K.log, {});
const LOG_DAYS = 400;
export function markBlock(b: Block, day = today()) {
  const l = readLog();
  const cur = l[day] ?? {};
  if (cur[b]) return false;
  const next: Log = { ...l, [day]: { ...cur, [b]: Date.now() } };
  for (const d of Object.keys(next).map(Number).sort((a, x) => a - x).slice(0, Math.max(0, Object.keys(next).length - LOG_DAYS))) delete next[d];
  writeJSON(K.log, next);
  askForReviewAfterSuccess(); // a finished Shams block is a positive moment (lib/review.ts decides)
  return true;
}
/** a listening and understanding day is done (listenDays.ts); false when it was already marked today */
export function markListen(day = today()) {
  const l = readLog();
  const cur = l[day] ?? {};
  if (cur.listen) return false;
  writeJSON(K.log, { ...l, [day]: { ...cur, listen: Date.now() } });
  return true;
}
/** per-verse and per-range marks (`r`) are kept for this many days; only today's are read (the wird's chips). The day
 *  totals (blocks, listening days) that streaks, the teacher snapshot and the Sijill read are never trimmed here. */
const MARK_DAYS = 60;
export function rateRange(id: string, r: "fluent" | "hesitant" | "weak", day = today()) {
  const l = readLog();
  const cur = l[day] ?? {};
  const next: Log = { ...l, [day]: { ...cur, r: { ...(cur.r ?? {}), [id]: r } } };
  for (const [d, v] of Object.entries(next)) if (Number(d) < day - MARK_DAYS && v?.r) { const { r: _old, ...rest } = v; next[d] = rest; }
  writeJSON(K.log, next);
}
/** consecutive days with at least one wird block (or a listening day) done, ending today (or yesterday) */
export function wirdStreak(l: Log, day = today()): number {
  const any = (d: number) => !!(l[d] && (l[d].sabaq || l[d].sabqi || l[d].manzil || l[d].listen));
  let d = any(day) ? day : day - 1, n = 0;
  while (any(d)) { n++; d--; }
  return n;
}

// ---------- word errors and recitation checks (talaqqi word check, weak-spot drills, mutashabihat) ----------
export type WordStat = { miss: number; ok: number; last: number };
export type Words = Record<string, Record<string, WordStat>>;
export const readWords = () => readJSON<Words>(K.words, {});
export const useWords = () => useStored<Words>(K.words, {});
const MAX_VERSES = 3000;
function bounded<T extends { last: number }>(o: Record<string, T>, last: (v: T) => number = (v) => v.last): Record<string, T> {
  const ks = Object.keys(o);
  if (ks.length <= MAX_VERSES) return o;
  const keep = ks.sort((a, b) => last(o[b]) - last(o[a])).slice(0, MAX_VERSES);
  return Object.fromEntries(keep.map((k) => [k, o[k]]));
}
/** a word was missed (false) or recited correctly (true) */
export function noteWords(verseKey: string, results: { position: number; ok: boolean }[]) {
  if (!results.length) return;
  const all = readWords();
  const v = { ...(all[verseKey] ?? {}) };
  const now = Date.now();
  for (const r of results) {
    const cur = v[r.position] ?? { miss: 0, ok: 0, last: 0 };
    v[r.position] = r.ok ? { ...cur, ok: cur.ok + 1, last: now } : { ...cur, miss: cur.miss + 1, last: now };
  }
  const lastOf = (x: Record<string, WordStat>) => Math.max(0, ...Object.values(x).map((w) => w.last));
  const next = { ...all, [verseKey]: v };
  const ks = Object.keys(next);
  writeJSON(K.words, ks.length > MAX_VERSES ? Object.fromEntries(ks.sort((a, b) => lastOf(next[b]) - lastOf(next[a])).slice(0, MAX_VERSES).map((k) => [k, next[k]])) : next);
}

export type Check = { ok: number; total: number; n: number; last: number };
export const readChecks = () => readJSON<Record<string, Check>>(K.checks, {});
export const useChecks = () => useStored<Record<string, Check>>(K.checks, {});
export function noteCheck(verseKey: string, ok: number, total: number) {
  if (!total) return;
  const all = readChecks();
  const cur = all[verseKey] ?? { ok: 0, total: 0, n: 0, last: 0 };
  writeJSON(K.checks, bounded({ ...all, [verseKey]: { ok: cur.ok + ok, total: cur.total + total, n: cur.n + 1, last: Date.now() } }));
}

export type MutStat = { ok: number; miss: number; last: number };
export const readMut = () => readJSON<Record<string, MutStat>>(K.mut, {});
export const useMut = () => useStored<Record<string, MutStat>>(K.mut, {});
export function noteMut(verseKey: string, right: boolean) {
  const all = readMut();
  const cur = all[verseKey] ?? { ok: 0, miss: 0, last: 0 };
  writeJSON(K.mut, bounded({ ...all, [verseKey]: { ok: cur.ok + (right ? 1 : 0), miss: cur.miss + (right ? 0 : 1), last: Date.now() } }));
}
