// mirrors mobile/src/features/shams2/plan.ts (copied for the website; keep in step with the app)
import { dayPlan, readGoal } from "@/lib/coach";
import { VERSE_COUNTS } from "@/lib/counts";
import { today, type Srs } from "@/lib/learning";
import type { Known } from "./qualityModel";
import type { Settings } from "./store";
import type { Grade } from "./grades";

// The daily wird of the classical hifz circle (ḥalaqa), computed from the learner's memorised verses:
//   Sabaq  (new)       – today's new portion, where the coach says new learning continues (web/coach.ts nextNew),
//                         as many verses as the day allows (the coach's dayPlan, or the learner's own number);
//   Sabqi  (recent)    – everything learned in the last `sabqiDays` days, recited every day until it holds;
//   Manzil (long term) – all older verses in Quran order, divided into `manzilDays` daily portions, so the whole
//                         memorised Quran is recited once per cycle (classically a week); overdue verses join today.
// Minutes per verse (from the coach): new ≈ 4, recent ≈ 0.7, long-term recitation ≈ 0.4.

export type Range = { s: number; from: number; to: number };
export type WirdBlock = { kind: "sabaq" | "sabqi" | "manzil"; ranges: Range[]; verses: number; minutes: number };
export type Wird = { sabaq: WirdBlock; sabqi: WirdBlock; manzil: WirdBlock; minutes: number; reason: ReturnType<typeof dayPlan>["reason"]; cycleDay: number; cycleOf: number; memorised: number; gated: boolean };

const MIN = { sabaq: 4, sabqi: 0.7, manzil: 0.4 };

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

export function computeWird(srs: Srs, known: Map<string, Known>, st: Settings, grade: Grade, gated: boolean, day = today()): Wird {
  const dp = dayPlan(srs);
  // the grade raises the floor of the daily wird (a larger wird as the learner advances)
  const goalMin = Math.max(5, grade.minutesMin, Math.min(180, st.minutes || readGoal()?.minutes || 20));
  const list = [...known.values()].sort((a, b) => a.i - b.i);
  const firstOf = (k: Known) => k.first ?? day - 365;
  const recent = list.filter((k) => firstOf(k) > day - st.sabqiDays && firstOf(k) < day);
  const old = list.filter((k) => firstOf(k) <= day - st.sabqiDays);

  // Sabqi: every recent verse, weakest first when time is short (about a third of the day)
  const sabqiCap = Math.max(5, Math.floor((goalMin * 0.4) / MIN.sabqi));
  const sabqiKeys = recent.length <= sabqiCap ? recent.map((k) => k.key) : [...recent].sort((a, b) => (a.due - b.due) || (a.recall - b.recall)).slice(0, sabqiCap).map((k) => k.key);

  // Manzil: the old verses in Quran order, split into the days of the cycle; overdue ones are added
  const cycleOf = Math.max(1, Math.min(30, st.manzilDays || grade.manzilDays));
  const cycleDay = ((day % cycleOf) + cycleOf) % cycleOf;
  const per = Math.ceil(old.length / cycleOf);
  const portion = old.slice(cycleDay * per, (cycleDay + 1) * per);
  const inPortion = new Set(portion.map((k) => k.key));
  const overdue = old.filter((k) => k.due <= day && !inPortion.has(k.key)).sort((a, b) => a.recall - b.recall);
  const manzilCap = Math.max(10, Math.floor((goalMin * 0.35) / MIN.manzil));
  const manzilKeys = [...portion.map((k) => k.key), ...overdue.slice(0, Math.max(0, manzilCap - portion.length)).map((k) => k.key)];

  // Sabaq: what is left of the day, never more than the coach allows; nothing new while too much is slipping
  const used = sabqiKeys.length * MIN.sabqi + manzilKeys.length * MIN.manzil;
  const room = Math.max(0, Math.floor((goalMin - used) / MIN.sabaq));
  const auto = Math.round(dp.newVerses * grade.newFactor);
  let n = st.newPerDay > 0 ? Math.min(st.newPerDay, Math.max(1, room)) : Math.min(auto, Math.max(auto ? 1 : 0, room));
  if (dp.reason === "reviewOnly" && st.newPerDay === 0) n = 0;
  if (gated) n = 0; // a formal test is overdue: the sabaq waits until it is taken (never longer)
  const sabaqKeys: string[] = [];
  const { surah, verse } = dp.next;
  for (let v = verse; v <= VERSE_COUNTS[surah - 1] && sabaqKeys.length < n; v++) if (!known.has(`${surah}:${v}`)) sabaqKeys.push(`${surah}:${v}`);

  const block = (kind: WirdBlock["kind"], keys: string[]): WirdBlock => ({ kind, ranges: toRanges(keys), verses: keys.length, minutes: Math.round(keys.length * MIN[kind]) });
  const b = { sabaq: block("sabaq", sabaqKeys), sabqi: block("sabqi", sabqiKeys), manzil: block("manzil", manzilKeys) };
  return { ...b, minutes: Math.max(5, b.sabaq.minutes + b.sabqi.minutes + b.manzil.minutes), reason: dp.reason, cycleDay: cycleDay + 1, cycleOf, memorised: list.length, gated };
}
