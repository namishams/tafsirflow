import { NOT_COUNTED, dayPlan, readGoal, readPace } from "@/web/coach";
import { estimateMinutes, verseWords } from "@/web/verseTime";
import { VERSE_COUNTS } from "@/web/counts";
import { today, type Srs } from "@/web/learning";
import type { Known } from "./qualityModel";
import type { Check, Settings, Words } from "./store";
import type { Grade } from "./grades";
import type { WeakSpot } from "./weakSpots";
import type { WeakLink } from "./mastery";
import type { MutGroup } from "./mutData";

// The daily wird of the classical hifz circle (ḥalaqa), computed from the learner's memorised verses:
//   Sabaq  (new)       – today's new portion, where the coach says new learning continues (web/coach.ts nextNew),
//                         as many verses as the day allows (the coach's dayPlan, or the learner's own number);
//   Sabqi  (recent)    – everything learned in the last `sabqiDays` days, recited every day until it holds;
//   Manzil (long term) – all older verses in Quran order, divided into `manzilDays` daily portions, so the whole
//                         memorised Quran is recited once per cycle (classically a week); overdue verses join today.
//   Tathbīt (Shams 3.0) – at most 15 % of the day for the learner's own weak points: verses with weak words or slipping
//                         recall (weakSpots.ts), weak or due transitions (mastery.ts weakLinks), due mutashābihāt groups.
// Minutes per verse by its length (web/verseTime.ts): new 1.5 min + 0.1 min per word (× the learner's own pace once
// known), recent 0.3 + 0.03 per word, long term 0.15 + 0.02 per word. Today's minutes (store2.ts today.v1) replace the
// daily minutes for one day. When time is short, the weakest verses come first: slipping recall, words missed more often
// than recited right, and failed word checks.

export type Range = { s: number; from: number; to: number };
export type WirdBlock = { kind: "sabaq" | "sabqi" | "manzil"; ranges: Range[]; verses: number; minutes: number };
/** one point of the tathbīt block */
export type TathbitItem =
  | { t: "spot"; key: string; words: number[]; reason: WeakSpot["reason"] }
  | { t: "link"; key: string; from: string; weak: boolean }
  | { t: "mut"; id: string; keys: string[] };
export type Tathbit = { items: TathbitItem[]; minutes: number };
/** the learner's own data for a smarter wird (all optional: without it the wird is planned as before) */
export type WirdOpts = {
  todayMinutes?: number | null; // "Heute habe ich … Min." (only for this day)
  words?: Words; checks?: Record<string, Check>; // error history: word misses and word checks
  spots?: WeakSpot[]; links?: WeakLink[]; mut?: MutGroup[]; // tathbīt candidates (weak spots, weak links, due groups)
};
export const TATHBIT_SHARE = 0.15;
export type Wird = { sabaq: WirdBlock; sabqi: WirdBlock; manzil: WirdBlock; tathbit: Tathbit; minutes: number; goal: number; /** the usual daily goal (settings, grade floor) without today's own minutes */ usual: number; today: boolean; reason: ReturnType<typeof dayPlan>["reason"]; cycleDay: number; cycleOf: number; memorised: number; gated: boolean;
  /** the new portion the coach would plan but which needs Pro (only when every free surah is learned); never in the sabaq */
  locked?: Range | null };

// the free surahs in the order they are usually memorised: al-Fātiḥa, then Juzʾ ʿAmma from the end (as web/coach.ts PATH)
const FREE_ORDER = [1, ...Array.from({ length: 37 }, (_, i) => 114 - i)];

/** the first verse still to learn in a surah the learner may open (free order first), or null when none is left */
export function nextAllowed(known: Map<string, Known>, allow: (surah: number) => boolean): { surah: number; verse: number } | null {
  for (const s of [...FREE_ORDER, ...Array.from({ length: 114 }, (_, i) => i + 1)]) {
    if (!allow(s)) continue;
    for (let v = 1; v <= VERSE_COUNTS[s - 1]; v++) { const k = `${s}:${v}`; if (!NOT_COUNTED.has(k) && !known.has(k)) return { surah: s, verse: v }; }
  }
  return null;
}

/** minutes of one new verse of the sabaq, by its length */
const sabaqMinutes = (s: number, v: number, pace: readonly number[]) => estimateMinutes({ words: verseWords(s, v), kind: "new", pace });
/** minutes of one verse in the sabqi or the manzil, by its length */
const reviewMinutes = (key: string, kind: "sabqi" | "manzil") => { const [s, v] = key.split(":").map(Number); return estimateMinutes({ words: verseWords(s, v), kind }); };
/** minutes of one tathbīt point: a weak verse is recited twice with its weak words marked, a transition once, a group of
 *  similar verses side by side */
export function tathbitMinutes(x: TathbitItem): number {
  return x.t === "spot" ? Math.max(0.5, 2 * reviewMinutes(x.key, "sabqi")) : x.t === "link" ? 0.5 : 1.5;
}

/** how weak a memorised verse is (higher = weaker): slipping recall, words missed more often than recited right, and
 *  the share of words not heard in word checks */
export function weakness(k: Known, words?: Words, checks?: Record<string, Check>): number {
  let wordMiss = 0;
  for (const w of Object.values(words?.[k.key] ?? {})) wordMiss += Math.max(0, (w.miss || 0) - (w.ok || 0));
  const ch = checks?.[k.key];
  const failed = ch && ch.total > 0 ? Math.max(0, 1 - ch.ok / ch.total) : 0;
  return (1 - k.recall) + 0.15 * Math.min(4, wordMiss) + failed;
}

/** the tathbīt block: weak spots, transitions and due groups in turn, as many as fit into `budget` minutes */
export function planTathbit(known: Map<string, Known>, budget: number, o: WirdOpts): Tathbit {
  const spots: TathbitItem[] = (o.spots ?? []).filter((x) => known.has(x.key) && x.reason.some((r) => r !== "transition")).map((x) => ({ t: "spot", key: x.key, words: x.words, reason: x.reason }));
  const links: TathbitItem[] = (o.links ?? []).filter((x) => known.has(x.key) && known.has(x.from)).map((x) => ({ t: "link", key: x.key, from: x.from, weak: x.weak }));
  const muts: TathbitItem[] = (o.mut ?? []).map((g) => ({ t: "mut", id: g.id, keys: g.keys }));
  const lists = [spots, links, muts];
  const items: TathbitItem[] = [];
  let minutes = 0;
  for (let round = 0; lists.some((l) => round < l.length); round++) {
    for (const l of lists) {
      const x = l[round];
      if (!x) continue;
      const m = tathbitMinutes(x);
      if (minutes + m > budget + 1e-9) continue;
      items.push(x); minutes += m;
    }
  }
  return { items, minutes: items.length ? Math.max(1, Math.round(minutes)) : 0 };
}

/** contiguous verse ranges (within a surah) from verse keys */
export function toRanges(keys: string[]): Range[] {
  const xs = keys.map((k) => k.split(":").map(Number) as [number, number]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const out: Range[] = [];
  for (const [s, v] of xs) {
    const last = out.at(-1);
    if (last && last.s === s && last.to + 1 >= v) last.to = Math.max(last.to, v);
    else out.push({ s, from: v, to: v });
  }
  return out;
}
export const rangeId = (r: Range) => `${r.s}:${r.from}-${r.to}`;
export const rangeSize = (r: Range) => r.to - r.from + 1;

/** `allow` (app only): the surahs the learner may open; without Pro the sabaq stays in the free surahs (website: all).
 *  `o`: today's minutes, the error history and the tathbīt candidates (see WirdOpts). */
export function computeWird(srs: Srs, known: Map<string, Known>, st: Settings, grade: Grade, gated: boolean, day = today(), allow?: (surah: number) => boolean, o: WirdOpts = {}): Wird {
  const dp = dayPlan(srs);
  // the grade raises the floor of the daily wird (a larger wird as the learner advances); today's own minutes replace it
  const todayMin = o.todayMinutes && o.todayMinutes > 0 ? Math.max(5, Math.min(240, o.todayMinutes)) : null;
  const usualMin = Math.max(5, grade.minutesMin, Math.min(180, st.minutes || readGoal()?.minutes || 20));
  const goalMin = todayMin ?? usualMin;
  const list = [...known.values()].sort((a, b) => a.i - b.i);
  const firstOf = (k: Known) => k.first ?? day - 365;
  const recent = list.filter((k) => firstOf(k) > day - st.sabqiDays && firstOf(k) < day);
  const old = list.filter((k) => firstOf(k) <= day - st.sabqiDays);
  const weak = new Map<string, number>();
  const weakOf = (k: Known) => { let w = weak.get(k.key); if (w === undefined) { w = weakness(k, o.words, o.checks); weak.set(k.key, w); } return w; };

  // Sabqi: every recent verse, weakest first when time is short (about 40 % of the day, at least five verses)
  const sabqiBudget = goalMin * 0.4;
  const sabqiAll = recent.reduce((a, k) => a + reviewMinutes(k.key, "sabqi"), 0);
  const sabqiKeys: string[] = [];
  if (sabqiAll <= sabqiBudget) for (const k of recent) sabqiKeys.push(k.key);
  else {
    let m = 0;
    for (const k of [...recent].sort((a, b) => (weakOf(b) - weakOf(a)) || (a.due - b.due))) {
      const x = reviewMinutes(k.key, "sabqi");
      if (sabqiKeys.length >= 5 && m + x > sabqiBudget) continue;
      sabqiKeys.push(k.key); m += x;
    }
  }

  // Manzil: the old verses in Quran order, split into the days of the cycle; overdue ones are added, weakest first
  const cycleOf = Math.max(1, Math.min(30, st.manzilDays || grade.manzilDays));
  const cycleDay = ((day % cycleOf) + cycleOf) % cycleOf;
  const per = Math.ceil(old.length / cycleOf);
  const portion = old.slice(cycleDay * per, (cycleDay + 1) * per);
  const inPortion = new Set(portion.map((k) => k.key));
  const overdue = old.filter((k) => k.due <= day && !inPortion.has(k.key)).sort((a, b) => (weakOf(b) - weakOf(a)) || (a.recall - b.recall));
  const manzilBudget = goalMin * 0.35;
  const manzilKeys = portion.map((k) => k.key);
  let manzilMin = portion.reduce((a, k) => a + reviewMinutes(k.key, "manzil"), 0);
  for (const k of overdue) {
    const x = reviewMinutes(k.key, "manzil");
    if (manzilKeys.length >= 10 && manzilMin + x > manzilBudget) break;
    manzilKeys.push(k.key); manzilMin += x;
  }

  // Tathbīt: the learner's own weak points, at most 15 % of the day
  const tathbit = planTathbit(known, goalMin * TATHBIT_SHARE, o);

  // Sabaq: what is left of the day, never more than the coach allows; nothing new while too much is slipping
  const used = sabqiKeys.reduce((a, k) => a + reviewMinutes(k, "sabqi"), 0) + manzilMin + tathbit.minutes;
  let { surah, verse } = dp.next;
  // the coach continues in a Pro surah: take the next free surah instead; when none is left, the portion is shown as locked
  const blocked = !!allow && !allow(surah);
  const alt = blocked ? nextAllowed(known, allow!) : null;
  if (alt) ({ surah, verse } = alt);
  // how many of the next new verses fit into the time left, each by its length
  const pace = readPace();
  let room = 0;
  for (let v = verse, left = goalMin - used; v <= VERSE_COUNTS[surah - 1]; v++) {
    if (known.has(`${surah}:${v}`)) continue;
    left -= sabaqMinutes(surah, v, pace);
    if (left < -1e-9) break;
    room++;
  }
  const auto = Math.round(dp.newVerses * grade.newFactor);
  let n = st.newPerDay > 0 ? Math.min(st.newPerDay, Math.max(1, room)) : Math.min(auto, Math.max(auto ? 1 : 0, room));
  if (dp.reason === "reviewOnly" && st.newPerDay === 0) n = 0;
  if (gated) n = 0; // a formal test is overdue: the sabaq waits until it is taken (never longer)
  const sabaqKeys: string[] = [];
  let locked: Range | null = null;
  if (blocked && !alt) {
    // the first n verses not known yet (known ones in between are skipped, as for the sabaq below)
    const todo: number[] = [];
    for (let v = verse; v <= VERSE_COUNTS[surah - 1] && todo.length < n; v++) if (!known.has(`${surah}:${v}`)) todo.push(v);
    if (todo.length) locked = { s: surah, from: todo[0], to: todo[todo.length - 1] };
    n = 0;
  }
  for (let v = verse; v <= VERSE_COUNTS[surah - 1] && sabaqKeys.length < n; v++) if (!known.has(`${surah}:${v}`)) sabaqKeys.push(`${surah}:${v}`);

  const minutesOf = (kind: WirdBlock["kind"], keys: string[]) => kind === "sabaq"
    ? keys.reduce((a, k) => { const [s, v] = k.split(":").map(Number); return a + sabaqMinutes(s, v, pace); }, 0)
    : keys.reduce((a, k) => a + reviewMinutes(k, kind), 0);
  const block = (kind: WirdBlock["kind"], keys: string[]): WirdBlock => ({ kind, ranges: toRanges(keys), verses: keys.length, minutes: Math.round(minutesOf(kind, keys)) });
  const b = { sabaq: block("sabaq", sabaqKeys), sabqi: block("sabqi", sabqiKeys), manzil: block("manzil", manzilKeys) };
  return { ...b, tathbit, minutes: Math.max(5, b.sabaq.minutes + b.sabqi.minutes + b.manzil.minutes + tathbit.minutes), goal: Math.round(goalMin), usual: Math.round(usualMin), today: todayMin !== null, reason: dp.reason, cycleDay: cycleDay + 1, cycleOf, memorised: list.length, gated, locked };
}
