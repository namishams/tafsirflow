// mirrors mobile/src/features/qbank/engine.ts (copied for the website; keep both in step). Same key (qmc.qbank.v1),
// synced with the account like the app; on the website every mode and stage is free (the free allowance is unused).
import { readJSON, writeJSON } from "@/lib/learn/store";
import { QBANK_MOCK, rng, shuffleWith } from "@/lib/learn/exam/integrity";
import type { SubjectId as SchoolSubject } from "@/lib/learn/school/model";
import { SUBJECTS, allQuestions, questionById, type Q } from "./bank";
import type { QDifficulty, QStage, QSubject } from "./types";

// The examination centre's memory and rules, all on this device (key "qmc.qbank.v1"):
//   - every answer: how often seen and right, the last result, time, and a Leitner box for spaced repetition
//   - a rating per subject (Elo-like): right answers on hard questions raise it more, the next questions are drawn
//     around it, so the questions get harder as accuracy rises
//   - stage gating: the mock exam of a stage must be passed before the next stage's banks open
//   - the scholar tiers 6–7 of a subject open after its tiers 4–5 are mastered
//   - sessions (for trend and analytics), bookmarks, reported questions, the free daily allowance

export const QBANK_KEY = "qmc.qbank.v1";
export type Mode = "practice" | "timed" | "mock" | "drill" | "daily" | "bookmarks" | "srs";
type Ans = { n: number; c: number; last: number; ok: boolean; ms: number; box: number; due: number };
export type Hist = { at: number; mode: Mode; n: number; c: number; ms: number; s?: QSubject; g?: QStage; pass?: boolean; void?: boolean };
type Day = { d: string; n: number; c: number; ms: number };
export type QbankStore = {
  a: Record<string, Ans>;
  r: Partial<Record<QSubject, number>>;
  bm: string[];
  h: Hist[];
  days: Day[];
  mock: Partial<Record<QStage, { best: number; passed: boolean; at: number; tries: number }>>;
  free?: { d: string; n: number };
  daily?: { d: string; done: boolean; c?: number };
  rep: { id: string; at: number; why: string }[];
  qlang?: "auto" | "en" | "de" | "ar";
};
const EMPTY: QbankStore = { a: {}, r: {}, bm: [], h: [], days: [], mock: {}, rep: [] };
export const readQbank = (): QbankStore => ({ ...EMPTY, ...readJSON<Partial<QbankStore>>(QBANK_KEY, {}) });
function write(fn: (s: QbankStore) => QbankStore) { writeJSON(QBANK_KEY, fn(readQbank())); }

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const DAY = 86400_000;

// ---------- free allowance ----------
/** free learners: practice on the first stage's banks, this many questions a day */
export const FREE_PER_DAY = 15;
export function freeLeft(s = readQbank()): number { return s.free?.d === today() ? Math.max(0, FREE_PER_DAY - s.free.n) : FREE_PER_DAY; }
export function consumeFreeQ(n = 1) { write((s) => ({ ...s, free: { d: today(), n: (s.free?.d === today() ? s.free.n : 0) + n } })); }

// ---------- rating ----------
export const START_RATING = 900;
/** the fixed rating of a question tier: tier 1 = 850 … tier 5 = 1450, Mutaqaddim 1600, ʿĀlim 1750 */
export const tierRating = (d: QDifficulty) => 700 + d * 150;
export const ratingOf = (s: QSubject, st = readQbank()) => st.r[s] ?? START_RATING;
const expected = (player: number, q: number) => 1 / (1 + Math.pow(10, (q - player) / 400));
/** the tier a rating corresponds to (for display) */
export const tierOfRating = (r: number): QDifficulty => Math.max(1, Math.min(7, Math.round((r - 700) / 150))) as QDifficulty;

// ---------- spaced repetition (Leitner boxes) ----------
// box -1: not in repetition; a wrong answer puts a question into box 0 (again in 10 minutes); every right answer
// moves it up; after the last box it has been learned and leaves the repetition
const BOX_DAYS = [10 / 1440, 1, 3, 7, 16, 35];

/** stores one answer; returns the new subject rating */
export function recordAnswer(q: Q, ok: boolean, ms: number, opts: { rated?: boolean } = {}): number {
  let rating = START_RATING;
  write((s) => {
    const now = Date.now();
    const old = s.a[q.id] ?? { n: 0, c: 0, last: 0, ok: false, ms: 0, box: -1, due: 0 };
    let box = old.box, due = old.due;
    if (!ok) { box = 0; due = now + BOX_DAYS[0] * DAY; }
    else if (old.box >= 0) { box = old.box + 1; if (box >= BOX_DAYS.length) { box = -1; due = 0; } else due = now + BOX_DAYS[box] * DAY; }
    const a: Ans = { n: old.n + 1, c: old.c + (ok ? 1 : 0), last: now, ok, ms: old.ms + Math.max(0, Math.min(ms, 600_000)), box, due };
    const answered = Object.entries(s.a).filter(([id]) => questionById(id)?.s === q.s).length;
    const r0 = s.r[q.s] ?? START_RATING;
    const k = answered < 30 ? 32 : 20;
    rating = opts.rated === false ? r0 : Math.round(r0 + k * ((ok ? 1 : 0) - expected(r0, tierRating(q.d))));
    rating = Math.max(600, Math.min(2000, rating));
    const d = today();
    const days = s.days.length && s.days[s.days.length - 1].d === d
      ? [...s.days.slice(0, -1), { ...s.days[s.days.length - 1], n: s.days[s.days.length - 1].n + 1, c: s.days[s.days.length - 1].c + (ok ? 1 : 0), ms: s.days[s.days.length - 1].ms + a.ms - old.ms }]
      : [...s.days, { d, n: 1, c: ok ? 1 : 0, ms: a.ms - old.ms }].slice(-90);
    return { ...s, a: { ...s.a, [q.id]: a }, r: { ...s.r, [q.s]: rating }, days };
  });
  return rating;
}

export function recordSession(h: Hist) {
  write((s) => {
    let mock = s.mock;
    if (h.mode === "mock" && h.g) {
      const old = mock[h.g];
      const pct = h.n ? h.c / h.n : 0;
      mock = { ...mock, [h.g]: { best: Math.max(old?.best ?? 0, h.void ? 0 : pct), passed: !!old?.passed || !!h.pass, at: h.at, tries: (old?.tries ?? 0) + 1 } };
    }
    const daily = h.mode === "daily" ? { d: today(), done: true, c: h.c } : s.daily;
    return { ...s, h: [h, ...s.h].slice(0, 300), mock, daily };
  });
}

export function toggleBookmark(id: string) { write((s) => ({ ...s, bm: s.bm.includes(id) ? s.bm.filter((x) => x !== id) : [id, ...s.bm].slice(0, 500) })); }
export function reportQuestion(id: string, why: string) { write((s) => ({ ...s, rep: [{ id, at: Date.now(), why }, ...s.rep.filter((r) => r.id !== id)].slice(0, 200) })); }
export function setQuestionLang(l: QbankStore["qlang"]) { write((s) => ({ ...s, qlang: l })); }

// ---------- gating ----------
export const stageOpen = (g: QStage, s = readQbank()) => g === 1 || !!s.mock[(g - 1) as QStage]?.passed;
export const openStages = (s = readQbank()): QStage[] => ([1, 2, 3, 4] as QStage[]).filter((g) => stageOpen(g, s));
/** mastery of tiers 4–5 in a subject: at least MASTER_N answers there and MASTER_ACC accuracy */
export const MASTER_N = 12, MASTER_ACC = 0.8;
export function mastery45(subject: QSubject, s = readQbank()): { n: number; acc: number; done: boolean } {
  let n = 0, c = 0;
  for (const [id, a] of Object.entries(s.a)) { const q = questionById(id); if (q && q.s === subject && (q.d === 4 || q.d === 5)) { n += a.n; c += a.c; } }
  const acc = n ? c / n : 0;
  return { n, acc, done: n >= MASTER_N && acc >= MASTER_ACC };
}
export const scholarOpen = (subject: QSubject, s = readQbank()) => mastery45(subject, s).done;
/** may this question be asked now (stage open; scholar tiers only after mastery) */
export function available(q: Q, s = readQbank()): boolean {
  return stageOpen(q.g, s) && (q.d < 6 || scholarOpen(q.s, s));
}

// ---------- drawing questions ----------
export type Filter = { subject?: QSubject; stage?: QStage; tag?: string; tier?: QDifficulty; free?: boolean };
export function poolOf(f: Filter, s = readQbank()): Q[] {
  return allQuestions().filter((q) => (!f.subject || q.s === f.subject) && (!f.stage || q.g === f.stage) && (!f.tag || q.t.includes(f.tag))
    && (!f.tier || q.d === f.tier) && (f.free ? q.g === 1 && q.d < 6 : available(q, s)));
}

/** weighted draw without replacement around the learner's rating in each subject (adaptive difficulty) */
export function drawAdaptive(pool: Q[], n: number, rand: () => number = Math.random, s = readQbank(), stretch = 50): Q[] {
  const now = Date.now();
  const items = pool.map((q) => {
    const a = s.a[q.id];
    const target = ratingOf(q.s, s) + stretch;
    let w = Math.exp(-Math.pow((tierRating(q.d) - target) / 170, 2));
    if (!a) w *= 1.6; else if (!a.ok) w *= 1.4; else if (now - a.last < 2 * DAY) w *= 0.15; else w *= 0.6;
    return { q, w: Math.max(w, 1e-4) };
  });
  const out: Q[] = [];
  while (out.length < n && items.length) {
    const total = items.reduce((x, i) => x + i.w, 0);
    let r = rand() * total, k = 0;
    while (k < items.length - 1 && r > items[k].w) { r -= items[k].w; k++; }
    out.push(items[k].q); items.splice(k, 1);
  }
  return out;
}

/** questions due for repetition (wrong answers, by box), oldest first */
export function dueQuestions(s = readQbank()): Q[] {
  const now = Date.now();
  return Object.entries(s.a).filter(([, a]) => a.box >= 0 && a.due <= now).sort((x, y) => x[1].due - y[1].due)
    .map(([id]) => questionById(id)).filter((q): q is Q => !!q && available(q, s));
}
export const inRepetition = (s = readQbank()) => Object.values(s.a).filter((a) => a.box >= 0).length;

/** weakness drill: missed questions first (worst ratio, then most recent), optionally of one subject or topic */
export function weaknessDrill(n = 15, f: Filter = {}, s = readQbank(), rand: () => number = Math.random): Q[] {
  const pool = poolOf(f, s);
  const missed = pool.filter((q) => { const a = s.a[q.id]; return a && (a.n - a.c > 0) && (!a.ok || a.c / a.n < 0.7); })
    .sort((x, y) => { const a = s.a[x.id], b = s.a[y.id]; return a.c / a.n - b.c / b.n || b.last - a.last; });
  const first = missed.slice(0, n);
  if (first.length >= n || !f.tag) return shuffleWith(first, rand);
  // a topic drill fills up with new questions of that topic around the rating
  const rest = drawAdaptive(pool.filter((q) => !first.includes(q)), n - first.length, rand, s);
  return shuffleWith([...first, ...rest], rand);
}

/** daily challenge: the ten hardest questions that are due, filled up with hard questions just above the rating */
export function dailyChallenge(s = readQbank()): Q[] {
  const seed = rng(`daily-${today()}`);
  const due = dueQuestions(s).sort((a, b) => b.d - a.d).slice(0, 10);
  if (due.length >= 10) return due;
  const pool = allQuestions().filter((q) => available(q, s) && !due.includes(q) && !(s.a[q.id]?.ok && Date.now() - s.a[q.id].last < 7 * DAY));
  const hard = drawAdaptive(pool, 40, seed, s, 220).sort((a, b) => b.d - a.d).slice(0, 10 - due.length);
  return [...due, ...hard];
}
export const dailyDone = (s = readQbank()) => s.daily?.d === today() && s.daily.done;

/** mock exam of a stage: 60 % of the questions from that stage, the rest from the stages below, spread evenly over
 *  the subjects (regular tiers only), drawn with the attempt's seed */
export function mockQuestions(g: QStage, rand: () => number): Q[] {
  const total = QBANK_MOCK[g]?.questions ?? 50;
  const all = allQuestions().filter((q) => q.d <= 5 && q.g <= g);
  const own = all.filter((q) => q.g === g), below = all.filter((q) => q.g < g);
  const nOwn = g === 1 ? total : Math.round(total * 0.6);
  const spread = (pool: Q[], n: number) => {
    const bySub = SUBJECTS.map((x) => shuffleWith(pool.filter((q) => q.s === x.id), rand)).filter((l) => l.length);
    const out: Q[] = [];
    while (out.length < n && bySub.some((l) => l.length)) for (const l of bySub) { const q = l.shift(); if (q && out.length < n) out.push(q); }
    return out;
  };
  const picked = [...spread(own, nOwn), ...spread(below, total - nOwn)];
  if (picked.length < total) picked.push(...spread(all.filter((q) => !picked.includes(q)), total - picked.length));
  return shuffleWith(picked, rand);
}

// ---------- analytics ----------
export type Acc = { n: number; c: number; acc: number | null; ms: number | null };
const accOf = (n: number, c: number, ms = 0): Acc => ({ n, c, acc: n ? c / n : null, ms: n ? ms / n : null });

export function subjectStats(s = readQbank()): Record<QSubject, Acc & { rating: number; seen: number }> {
  const out = {} as Record<QSubject, Acc & { rating: number; seen: number }>;
  const agg: Record<string, { n: number; c: number; ms: number; seen: number }> = {};
  for (const [id, a] of Object.entries(s.a)) { const q = questionById(id); if (!q) continue; const x = (agg[q.s] ??= { n: 0, c: 0, ms: 0, seen: 0 }); x.n += a.n; x.c += a.c; x.ms += a.ms; x.seen++; }
  for (const sub of SUBJECTS) { const x = agg[sub.id] ?? { n: 0, c: 0, ms: 0, seen: 0 }; out[sub.id] = { ...accOf(x.n, x.c, x.ms), rating: ratingOf(sub.id, s), seen: x.seen }; }
  return out;
}

export type TagStat = Acc & { tag: string; subject: QSubject };
export function tagStats(s = readQbank(), subject?: QSubject): TagStat[] {
  const agg = new Map<string, { n: number; c: number; ms: number; subject: QSubject }>();
  for (const [id, a] of Object.entries(s.a)) {
    const q = questionById(id);
    if (!q || (subject && q.s !== subject)) continue;
    for (const t of q.t) { const k = `${q.s}/${t}`; const x = agg.get(k) ?? { n: 0, c: 0, ms: 0, subject: q.s }; x.n += a.n; x.c += a.c; x.ms += a.ms; agg.set(k, x); }
  }
  return [...agg.entries()].map(([k, x]) => ({ tag: k.split("/")[1], subject: x.subject, ...accOf(x.n, x.c, x.ms) }));
}
/** the weakest topics (at least 3 answers), lowest accuracy first */
export const weakestTopics = (s = readQbank(), n = 5, subject?: QSubject) =>
  tagStats(s, subject).filter((t) => t.n >= 3 && (t.acc ?? 1) < 0.85).sort((a, b) => (a.acc ?? 0) - (b.acc ?? 0) || b.n - a.n).slice(0, n);

/** accuracy per day for the last `days` days with answers */
export const trend = (s = readQbank(), days = 30) => s.days.slice(-days).map((d) => ({ d: d.d, acc: d.n ? d.c / d.n : 0, n: d.n, ms: d.n ? d.ms / d.n : 0 }));

export function overall(s = readQbank()): Acc & { seen: number; sessions: number } {
  let n = 0, c = 0, ms = 0;
  for (const a of Object.values(s.a)) { n += a.n; c += a.c; ms += a.ms; }
  return { ...accOf(n, c, ms), seen: Object.keys(s.a).length, sessions: s.h.length };
}

/** readiness for a stage's mock exam 0..1: accuracy on that stage's regular questions (smoothed towards 50 % while
 *  few are answered) times how much of the exam's breadth has been practised */
export function readiness(g: QStage, s = readQbank()): { value: number; acc: number | null; seen: number; need: number; pass: number } {
  const need = QBANK_MOCK[g]?.questions ?? 50;
  let n = 0, c = 0, seen = 0;
  for (const [id, a] of Object.entries(s.a)) { const q = questionById(id); if (q && q.g === g && q.d <= 5) { n += a.n; c += a.c; seen++; } }
  const smooth = (c + 5) / (n + 10);
  return { value: Math.min(1, smooth * Math.min(1, seen / need)), acc: n ? c / n : null, seen, need, pass: QBANK_MOCK[g]?.pass ?? 0.75 };
}

// ---------- the school's report card (Kashf ad-darajāt) ----------
/** grades of the examination centre per school subject (0..1; null while fewer than 10 answers), for the school's
 *  report card. Accuracy over all answers in the bank subjects that belong to the school subject. */
export function qbankKashf(s = readQbank()): Partial<Record<SchoolSubject, number | null>> {
  const st = subjectStats(s);
  const out: Partial<Record<SchoolSubject, { n: number; c: number }>> = {};
  for (const sub of SUBJECTS) { const x = st[sub.id]; const o = (out[sub.school] ??= { n: 0, c: 0 }); o.n += x.n; o.c += x.c; }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v && v.n >= 10 ? v.c / v.n : null])) as Partial<Record<SchoolSubject, number | null>>;
}
/** mock exams passed (for the school's report and transcript) */
export const qbankMocksPassed = (s = readQbank()): QStage[] => ([1, 2, 3, 4] as QStage[]).filter((g) => s.mock[g]?.passed);
