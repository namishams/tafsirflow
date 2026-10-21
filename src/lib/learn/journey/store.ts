// mirrors mobile/src/features/journey/store.ts (copied for the website; keep in step with the app)
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { dayNum } from "@/lib/learn/feed/statsStore";

// The record of the long path ("Riḥlat al-ʿIlm"): earned journey stickers, the pointers of the endless daily plans
// (Quran khatm, tafsir, hadith, Quranic lemmas, mutashābihāt, hifz review), and the qirāʾāt steps the learner marked.
// New storage key (BLUEPRINT §8: never reuse or rename keys). Everything only rises: counters are merged with max,
// stickers with the earliest day. The sync merge is mergeJourney below.
export const JOURNEY_KEY = "qmc.journey";

export type EngineId = "khatm" | "tafsir" | "hadith" | "lemma" | "mut" | "review";
export const ENGINES: EngineId[] = ["khatm", "review", "tafsir", "hadith", "lemma", "mut"];
/** a pointer through an endless sequence: position, completed cycles, portion size, last day, units done in total */
export type Engine = { pos: number; cycles: number; per: number; last: number; units: number };
export type Journey = {
  v: 1;
  at: number;
  /** first day the journey was opened */
  start: number;
  stickers: Record<string, number>;
  fresh: string[];
  e: Record<EngineId, Engine>;
  /** hadith plan: the collection index inside the learner's sequence */
  hCol: number;
  /** review: completed cycles over the whole Quran (all 30 juz memorised at the time) */
  full: number;
  /** qirāʾāt steps marked by the learner (self-report, with a teacher) → day */
  q: Record<string, number>;
  /** cycle completions (engine, day), bounded; used by the year in review */
  log: [EngineId, number][];
};
const DEF_PER: Record<EngineId, number> = { khatm: 50, tafsir: 5, hadith: 1, lemma: 10, mut: 1, review: 104 };
export const PER_OPTIONS: Record<EngineId, number[]> = { khatm: [20, 50, 104, 208, 624], tafsir: [3, 5, 10, 20], hadith: [1, 3, 5, 10], lemma: [5, 10, 20, 40], mut: [1, 2, 3], review: [50, 104, 208, 624] };
const eng = (id: EngineId): Engine => ({ pos: 0, cycles: 0, per: DEF_PER[id], last: 0, units: 0 });
const empty = (): Journey => ({ v: 1, at: 0, start: 0, stickers: {}, fresh: [], e: { khatm: eng("khatm"), tafsir: eng("tafsir"), hadith: eng("hadith"), lemma: eng("lemma"), mut: eng("mut"), review: eng("review") }, hCol: 0, full: 0, q: {}, log: [] });

function norm(r: Partial<Journey> | null | undefined): Journey {
  const e = empty();
  if (!r || typeof r !== "object") return e;
  const out: Journey = { ...e, ...r, stickers: { ...(r.stickers ?? {}) }, fresh: Array.isArray(r.fresh) ? r.fresh : [], q: { ...(r.q ?? {}) }, log: Array.isArray(r.log) ? r.log : [], e: { ...e.e } };
  for (const id of ENGINES) out.e[id] = { ...e.e[id], ...(r.e?.[id] ?? {}) };
  return out;
}
export const readJourney = (): Journey => norm(readJSON<Partial<Journey> | null>(JOURNEY_KEY, null));
export function useJourney(): Journey { return norm(useStored<Partial<Journey> | null>(JOURNEY_KEY, null)); }
function save(j: Journey) { j.at = Date.now(); j.fresh = j.fresh.slice(-40); j.log = j.log.slice(-500); writeJSON(JOURNEY_KEY, j); }
export function update(f: (j: Journey) => void) { const j = readJourney(); f(j); save(j); }

/** the first visit starts the journey (only a date, never a deadline) */
export function ensureStarted() { const j = readJourney(); if (!j.start) { j.start = dayNum(); save(j); } }

export function setPer(id: EngineId, per: number) { if (PER_OPTIONS[id].includes(per)) update((j) => { j.e[id].per = per; }); }
/** moves a plan forward; `wrap` = length of one cycle (a new cycle starts at 0 and counts one more) */
export function advance(id: EngineId, to: number, units: number, wrap: number, onCycle?: (j: Journey) => void) {
  update((j) => {
    const x = j.e[id];
    x.units += Math.max(0, units);
    x.last = dayNum();
    if (to >= wrap) { x.pos = 0; x.cycles++; j.log.push([id, dayNum()]); onCycle?.(j); } else x.pos = Math.max(0, to);
  });
}
export function setHadithCol(col: number) { update((j) => { j.hCol = Math.max(0, col); j.e.hadith.pos = 0; }); }
export function toggleQiraat(id: string) { update((j) => { if (j.q[id]) delete j.q[id]; else j.q[id] = dayNum(); }); }
export function markFreshSeen() { const j = readJourney(); if (j.fresh.length) { j.fresh = []; save(j); } }
/** records stickers (never removes one) */
export function grant(ids: string[]): string[] {
  const j = readJourney();
  const add = ids.filter((id) => !j.stickers[id]);
  if (!add.length) return [];
  for (const id of add) { j.stickers[id] = dayNum(); j.fresh.push(id); }
  save(j);
  return add;
}

/** account sync: stickers keep the earliest day, counters the higher value, pointers the newer record */
export function mergeJourney(a0: unknown, b0: unknown): Journey | undefined {
  if (!a0 && !b0) return undefined;
  if (!a0 || !b0) return norm((a0 ?? b0) as Partial<Journey>);
  const a = norm(a0 as Partial<Journey>), b = norm(b0 as Partial<Journey>);
  const [n, o] = a.at >= b.at ? [a, b] : [b, a];
  const stickers: Record<string, number> = { ...o.stickers };
  for (const [k, d] of Object.entries(n.stickers)) stickers[k] = stickers[k] ? Math.min(stickers[k], d) : d;
  const e = { ...n.e };
  for (const id of ENGINES) {
    const x = n.e[id], y = o.e[id];
    // the record further along in cycles (then position) keeps its pointer; totals never drop
    const ahead = x.cycles > y.cycles || (x.cycles === y.cycles && x.pos >= y.pos) ? x : y;
    e[id] = { ...ahead, per: x.per, units: Math.max(x.units, y.units), cycles: Math.max(x.cycles, y.cycles), last: Math.max(x.last, y.last) };
  }
  const q: Record<string, number> = { ...o.q, ...n.q };
  const seen = new Set<string>();
  const log = [...o.log, ...n.log].filter((x) => { const k = `${x[0]}:${x[1]}`; if (seen.has(k)) return false; seen.add(k); return true; }).sort((x, y) => x[1] - y[1]).slice(-500);
  return { ...n, start: Math.min(a.start || Infinity, b.start || Infinity) === Infinity ? 0 : Math.min(a.start || Infinity, b.start || Infinity), stickers, e, q, log, full: Math.max(a.full, b.full), fresh: n.fresh };
}
