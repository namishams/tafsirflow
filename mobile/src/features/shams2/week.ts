import { readJSON, writeJSON } from "@/lib/store";
import type { Cell, Known } from "./qualityModel";
import type { Log } from "./store";
import type { GradeState } from "./grades";
import type { WeakSpot } from "./weakSpots";

// Murājaʿat al-Usbūʿ – the weekly review: what happened in the last seven days, and what to focus on next.
// Rule-based insights from the learner's own data (no AI). Weekly snapshots of the quality are kept to show the trend.
const WEEKS = "qmc.shams2.weeks.v1";
type Snap = { overall: number | null; count: number };
/** Monday of the week (day numbers since 1970-01-01, a Thursday) */
export const weekStart = (day: number) => day - ((day + 3) % 7);

export function saveWeekSnapshot(day: number, s: Snap) {
  const all = readJSON<Record<string, Snap>>(WEEKS, {});
  const k = String(weekStart(day));
  if (all[k]?.overall === s.overall && all[k]?.count === s.count) return;
  const keys = Object.keys(all).map(Number).sort((a, b) => a - b);
  for (const old of keys.slice(0, Math.max(0, keys.length - 104))) delete all[old];
  writeJSON(WEEKS, { ...all, [k]: s }, true);
}
export const previousWeek = (day: number): Snap | null => readJSON<Record<string, Snap>>(WEEKS, {})[String(weekStart(day) - 7)] ?? null;

export type Insight = { tone: "good" | "focus" | "info"; key: string; p?: Record<string, string | number>; href?: string };
export type WeekReview = {
  days: { day: number; blocks: number; verses: number }[];
  active: number; newVerses: number; reviewed: number; manzilDays: number; tests: { pass: number; total: number };
  delta: number | null; insights: Insight[];
};

export function weekReview(p: { day: number; log: Log; practice: Record<string, number>; known: Map<string, Known>; surahs: Cell[]; overall: number | null; count: number; gs: GradeState; weak: WeakSpot[]; due: { weekly: boolean; monthly: boolean }; manzilVerses: number }): WeekReview {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = p.day - 6 + i;
    const l = p.log[d] ?? {};
    return { day: d, blocks: (l.sabaq ? 1 : 0) + (l.sabqi ? 1 : 0) + (l.manzil ? 1 : 0), verses: p.practice[String(d)] ?? 0 };
  });
  const active = days.filter((d) => d.blocks || d.verses).length;
  const newVerses = [...p.known.values()].filter((k) => k.first !== null && k.first > p.day - 7).length;
  const reviewed = days.reduce((a, d) => a + d.verses, 0);
  const manzilDays = days.filter((d) => p.log[d.day]?.manzil).length;
  const recent = p.gs.tests.filter((x) => x.day > p.day - 7 && x.kind !== "ard");
  const prev = previousWeek(p.day);
  const delta = prev && prev.overall !== null && p.overall !== null ? p.overall - prev.overall : null;
  const ins: Insight[] = [];
  if (active >= 6) ins.push({ tone: "good", key: "in_consistent", p: { n: active } });
  else if (active <= 3) ins.push({ tone: "focus", key: "in_irregular", p: { n: active } });
  else ins.push({ tone: "info", key: "in_active", p: { n: active } });
  if (delta !== null && delta >= 2) ins.push({ tone: "good", key: "in_qualityUp", p: { d: delta } });
  if (delta !== null && delta <= -2) ins.push({ tone: "focus", key: "in_qualityDown", p: { d: -delta }, href: "/shams/weak" });
  if (p.manzilVerses > 0 && manzilDays < 5) ins.push({ tone: "focus", key: "in_manzil", p: { n: manzilDays }, href: "/shams/wird" });
  if (newVerses > 0 && p.weak.length > 10) ins.push({ tone: "focus", key: "in_balance", p: { n: newVerses, w: p.weak.length }, href: "/shams/weak" });
  else if (newVerses > 0) ins.push({ tone: "good", key: "in_new", p: { n: newVerses } });
  const solid = p.surahs.filter((c) => c.known >= 3 && c.score !== null);
  const best = [...solid].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const worst = [...solid].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];
  if (best && best.score !== null && best.score >= 70) ins.push({ tone: "good", key: "in_best", p: { s: best.id, q: best.score } });
  if (worst && worst !== best && worst.score !== null && worst.score < 70) ins.push({ tone: "focus", key: "in_worst", p: { s: worst.id, q: worst.score }, href: `/shams/weak?s=${worst.id}` });
  const mutW = p.weak.filter((w) => w.reason.includes("mutashabih")).length;
  if (mutW) ins.push({ tone: "focus", key: "in_mut", p: { n: mutW }, href: "/shams/mutashabihat" });
  if (recent.length) ins.push({ tone: recent.every((x) => x.pass) ? "good" : "info", key: "in_tests", p: { n: recent.filter((x) => x.pass).length, t: recent.length } });
  if (p.due.weekly || p.due.monthly) ins.push({ tone: "focus", key: "in_due", href: `/shams/ard?kind=${p.due.weekly ? "weekly" : "monthly"}` });
  if (!p.count) ins.push({ tone: "info", key: "in_start", href: "/shams/wird" });
  return { days, active, newVerses, reviewed, manzilDays, tests: { pass: recent.filter((x) => x.pass).length, total: recent.length }, delta, insights: ins };
}
