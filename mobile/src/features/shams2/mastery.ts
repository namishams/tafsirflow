import { NOT_COUNTED } from "@/web/coach";
import { VERSE_COUNTS } from "@/web/counts";
import { JUZ_START, TOTAL_VERSES, indexOf } from "@/web/quranIndex";
import type { Known } from "./qualityModel";
import type { Check, MutStat, Words } from "./store";
import type { Links, Rubric, RubricEntry, RubricField, Understand } from "./store2";

// Mastery (Shams 3.0): six separate dimensions per verse, each from its own source, never mixed into one number.
//   hifz        – memory: recall today, maturity and steadiness from the FSRS reviews (the parts of verseScore without
//                 accuracy and mutashabihat)
//   words       – words heard in word checks (speech recognition on the device and drills): a word check, never a
//                 pronunciation score
//   links       – transitions into the verse (verse v-1 -> v held or stalled)
//   understand  – comprehension answers (which translation belongs to this verse)
//   tajweed     – pronunciation and tajweed: a teacher's rating, otherwise the learner's own rating, otherwise none
//   similar     – mutashabihat answers
// Pure functions of the learner's own data; cells per surah and juz like qualityModel.ts. A dimension without data is
// null ("noch keine Daten"), never guessed.

export const DIMS = ["hifz", "words", "links", "understand", "tajweed", "similar"] as const;
export type Dim = (typeof DIMS)[number];
/** where a value comes from (shown with each bar) */
export type MasterySource = "memory" | "wordCheck" | "links" | "quiz" | "teacher" | "self" | "mut";
/** one dimension of one verse: v 0–1, n = how many observations it rests on */
export type DimValue = { v: number; n: number; src: MasterySource; parts?: { recall: number; maturity: number; steadiness: number } };
export type VerseMastery = { key: string; i: number; known: boolean; d: Record<Dim, DimValue | null> };
export type MasteryInput = {
  known: Map<string, Known>; // knownVerses() from qualityModel.ts
  words: Words; checks: Record<string, Check>; mut: Record<string, MutStat>; // store.ts
  links: Links; understand: Understand; rubric: Rubric; // store2.ts
};

const RUBRIC: readonly RubricField[] = ["makharij", "tajweed", "waqf", "pace"];
const ratio = (ok: number, miss: number) => (ok + miss > 0 ? ok / (ok + miss) : null);
const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);

/** a verse key that counts ("s:v" inside the Quran, not the basmala of al-Fātiḥa) -> its index, else -1 */
function indexOfKey(key: string): number {
  if (NOT_COUNTED.has(key)) return -1;
  const [s, v] = key.split(":").map(Number);
  if (!Number.isInteger(s) || !Number.isInteger(v) || s < 1 || s > 114 || v < 1 || v > VERSE_COUNTS[s - 1]) return -1;
  return indexOf(s, v);
}

/** memory: 0.45 recall + 0.25 maturity + 0.15 steadiness (the weights of verseScore, without accuracy), scaled to 0–1 */
export function hifzOf(k: Known): DimValue {
  const maturity = Math.min(1, Math.log(1 + k.s) / Math.log(1 + 90));
  const steadiness = 1 - Math.min(1, k.lapses / Math.max(1, k.n + 1));
  const v = (0.45 * k.recall + 0.25 * maturity + 0.15 * steadiness) / 0.85;
  return { v: Math.max(0, Math.min(1, v)), n: k.n, src: "memory", parts: { recall: k.recall, maturity, steadiness } };
}

/** words heard: the accuracy of verseScore (checks minus repeated word misses); only correct words without a check = 1 */
export function wordsOf(key: string, words: Words, checks: Record<string, Check>): DimValue | null {
  const ws = Object.values(words[key] ?? {});
  const wordMiss = ws.reduce((a, w) => a + Math.max(0, num(w.miss) - num(w.ok)), 0);
  const seen = ws.reduce((a, w) => a + num(w.miss) + num(w.ok), 0);
  const ch = checks[key];
  if (ch && ch.total) return { v: Math.max(0, ch.ok / ch.total - Math.min(0.3, wordMiss * 0.05)), n: Math.max(1, num(ch.n)), src: "wordCheck" };
  if (wordMiss) return { v: Math.max(0, 1 - wordMiss * 0.1), n: seen, src: "wordCheck" };
  return seen ? { v: 1, n: seen, src: "wordCheck" } : null;
}

/** pronunciation and tajweed: the teacher's rating, otherwise the own rating (mean of the rated criteria, 1–5 -> 0–1) */
export function rubricOf(e: RubricEntry | undefined): DimValue | null {
  for (const side of ["teacher", "self"] as const) {
    const r = e?.[side];
    if (!r) continue;
    const xs = RUBRIC.map((f) => r[f]).filter((x): x is number => typeof x === "number" && x >= 1 && x <= 5);
    if (xs.length) return { v: (xs.reduce((a, b) => a + b, 0) / xs.length - 1) / 4, n: 1, src: side };
  }
  return null;
}

const stat = (s: { ok: number; miss: number } | undefined, src: MasterySource): DimValue | null => {
  const r = s ? ratio(num(s.ok), num(s.miss)) : null;
  return r === null ? null : { v: r, n: num(s!.ok) + num(s!.miss), src };
};

/** the six dimensions of one verse; null for a key that does not count (outside the Quran, basmala of al-Fātiḥa) */
export function verseMastery(key: string, x: MasteryInput): VerseMastery | null {
  const i = indexOfKey(key);
  if (i < 0) return null;
  const k = x.known.get(key);
  return {
    key, i, known: !!k,
    d: {
      hifz: k ? hifzOf(k) : null,
      words: wordsOf(key, x.words, x.checks),
      links: key.split(":")[1] === "1" ? null : stat(x.links[key], "links"), // the first verse of a surah has no transition into it
      understand: stat(x.understand[key], "quiz"),
      tajweed: rubricOf(x.rubric[key]),
      similar: stat(x.mut[key], "mut"),
    },
  };
}

/** a dimension over many verses: pct = mean 0–100 (null without data), n = verses with data, src = verses per source */
export type Agg = { pct: number | null; n: number; src: Partial<Record<MasterySource, number>>; weakest: { key: string; pct: number }[] };
export type MasteryCell = { id: number; known: number; total: number; dims: Record<Dim, Agg> };
export type MasteryModel = { verses: Map<string, VerseMastery>; overall: MasteryCell; surahs: MasteryCell[]; juz: MasteryCell[] };

/** any set of verses (a page, a wird range, a maqasid section): `total` defaults to the number of counted keys
 *  (valid verse keys only; invalid keys and 1:1, see NOT_COUNTED, are left out) */
export function masteryOf(keys: Iterable<string>, verses: Map<string, VerseMastery>, id = 0, total?: number): MasteryCell {
  const list: VerseMastery[] = [];
  let count = 0;
  for (const k of new Set(keys)) { if (indexOfKey(k) < 0) continue; count++; const vm = verses.get(k); if (vm) list.push(vm); }
  return cellOf(id, list.sort((a, b) => a.i - b.i), total ?? count);
}

/** `list` in Quran order */
function cellOf(id: number, list: VerseMastery[], total: number): MasteryCell {
  const dims = {} as Record<Dim, Agg>;
  for (const dim of DIMS) {
    let n = 0, sum = 0;
    const src: Agg["src"] = {};
    const weakest: Agg["weakest"] = []; // the five weakest, ties in Quran order
    for (const vm of list) {
      const x = vm.d[dim];
      if (!x) continue;
      n++; sum += x.v; src[x.src] = (src[x.src] ?? 0) + 1;
      const pct = Math.round(100 * x.v);
      if (weakest.length === 5 && pct >= weakest[4].pct) continue;
      let at = weakest.length;
      while (at > 0 && weakest[at - 1].pct > pct) at--;
      weakest.splice(at, 0, { key: vm.key, pct });
      if (weakest.length > 5) weakest.pop();
    }
    dims[dim] = { pct: n ? Math.round((100 * sum) / n) : null, n, src, weakest };
  }
  let known = 0;
  for (const vm of list) if (vm.known) known++;
  return { id, known, total, dims };
}

// fixed sizes, computed once: counted verses per surah, start index and counted verses per juz
const SURAH_TOTAL = VERSE_COUNTS.map((n, i) => n - [...NOT_COUNTED].filter((k) => k.startsWith(`${i + 1}:`)).length);
const JUZ_FROM = JUZ_START.map((k) => indexOf(...(k.split(":").map(Number) as [number, number])));
const juzAt = (i: number) => { let j = 0; while (j < 29 && JUZ_FROM[j + 1] <= i) j++; return j + 1; };
const NOT_COUNTED_AT = [...NOT_COUNTED].map((k) => indexOf(...(k.split(":").map(Number) as [number, number])));
const JUZ_TOTAL = JUZ_FROM.map((a, j) => { const b = j < 29 ? JUZ_FROM[j + 1] : TOTAL_VERSES; return b - a - NOT_COUNTED_AT.filter((i) => i >= a && i < b).length; });
const COUNTED = TOTAL_VERSES - NOT_COUNTED.size;

/** every verse with any data, plus cells for all verses, per surah (114) and per juz (30) */
export function masteryModel(x: MasteryInput): MasteryModel {
  const keys = new Set<string>([...x.known.keys(), ...Object.keys(x.words), ...Object.keys(x.checks), ...Object.keys(x.mut), ...Object.keys(x.links), ...Object.keys(x.understand), ...Object.keys(x.rubric)]);
  const all: VerseMastery[] = [];
  for (const k of keys) { const vm = verseMastery(k, x); if (vm) all.push(vm); }
  all.sort((a, b) => a.i - b.i);
  // in Quran order, so the cells need no sorting and ties among the weakest stay in verse order
  const verses = new Map(all.map((vm) => [vm.key, vm] as const));
  const bySurah = new Map<number, VerseMastery[]>(), byJuz = new Map<number, VerseMastery[]>();
  for (const vm of all) {
    const s = Number(vm.key.split(":")[0]), j = juzAt(vm.i);
    (bySurah.get(s) ?? bySurah.set(s, []).get(s)!).push(vm);
    (byJuz.get(j) ?? byJuz.set(j, []).get(j)!).push(vm);
  }
  return {
    verses,
    overall: cellOf(0, all, COUNTED),
    surahs: SURAH_TOTAL.map((total, i) => cellOf(i + 1, bySurah.get(i + 1) ?? [], total)),
    juz: JUZ_TOTAL.map((total, j) => cellOf(j + 1, byJuz.get(j + 1) ?? [], total)),
  };
}

/** Leitner boxes of the transitions: days until a transition is due again (box 0 = today) */
export const LINK_BOX_DAYS = [0, 1, 3, 7, 14, 30] as const;
export type WeakLink = { key: string; from: string; ok: number; miss: number; box: number; last: number; weak: boolean; due: boolean };
/** transitions to practise: weak ones (more stalls than holds) first, then due ones (lowest box, oldest first) */
export function weakLinks(links: Links, now = Date.now(), limit = 20): WeakLink[] {
  const out: WeakLink[] = [];
  for (const [key, l] of Object.entries(links)) {
    const [s, v] = key.split(":").map(Number);
    if (indexOfKey(key) < 0 || v < 2) continue;
    const box = Math.max(0, Math.min(5, Math.round(num(l.box))));
    const ok = num(l.ok), miss = num(l.miss), last = num(l.last);
    const weak = miss > ok;
    const due = now - last >= LINK_BOX_DAYS[box] * 86_400_000;
    if (weak || due) out.push({ key, from: `${s}:${v - 1}`, ok, miss, box, last, weak, due });
  }
  return out.sort((a, b) => Number(b.weak) - Number(a.weak) || (b.miss - b.ok) - (a.miss - a.ok) || a.box - b.box || a.last - b.last).slice(0, limit);
}
