import { readJSON, useStored, writeJSON } from "@/lib/store";
import { FREE } from "@/lib/pro";

// The onboarding answers and the personal 30-day plan built from them. Everything is local (device store); the plan is
// a mapping onto existing content (Shams lessons, Academy, Arabic, tajweed, reader, feed), never new content.
export type QuizGoal = "read" | "understand" | "juzamma" | "tajweed" | "reciter" | "daily";
export type QuizLevel = "none" | "letters" | "slow" | "fluent";
export type QuizMotivation = "closer" | "family" | "prayer" | "confidence" | "knowledge";
export type QuizAnswers = {
  goal: QuizGoal; level: QuizLevel; minutes: number; reciter: string | null; prayer: boolean; motivation: QuizMotivation | null;
};
export const GOALS: QuizGoal[] = ["read", "understand", "juzamma", "tajweed", "reciter", "daily"];
export const LEVELS: QuizLevel[] = ["none", "letters", "slow", "fluent"];
export const MOTIVATIONS: QuizMotivation[] = ["closer", "family", "prayer", "confidence", "knowledge"];
export const MINUTES = [5, 10, 20, 30];

export type StepId =
  | "arabic" | "arabicMore" | "arabicLang" | "placement" | "qaida" | "shams" | "shamsShort" | "shamsLong" | "academy" | "academyMore"
  | "tajweed" | "tajweedMore" | "memo" | "hifz" | "listen" | "recite" | "vocab" | "feed" | "duas" | "prayer";
export type Step = { id: StepId; href: string; minutes: number; pro: boolean };
/** every step: where it opens and whether it lies beyond the free part (first unit of each course is free) */
export const STEPS: Record<StepId, Step> = {
  arabic: { id: "arabic", href: "/arabic", minutes: 10, pro: false },
  arabicMore: { id: "arabicMore", href: "/arabic", minutes: 10, pro: true },
  arabicLang: { id: "arabicLang", href: "/arabic/lang", minutes: 10, pro: false },
  placement: { id: "placement", href: "/arabic/placement", minutes: 10, pro: false },
  qaida: { id: "qaida", href: "/arabic/read", minutes: 10, pro: false },
  shams: { id: "shams", href: "/shams/1", minutes: 10, pro: false },
  shamsShort: { id: "shamsShort", href: "/shams/112", minutes: 10, pro: !FREE.shamsSurah(112) },
  shamsLong: { id: "shamsLong", href: "/shams/67", minutes: 15, pro: !FREE.shamsSurah(67) },
  academy: { id: "academy", href: "/academy", minutes: 10, pro: false },
  academyMore: { id: "academyMore", href: "/academy", minutes: 15, pro: true },
  tajweed: { id: "tajweed", href: "/tajweed", minutes: 10, pro: false },
  tajweedMore: { id: "tajweedMore", href: "/tajweed", minutes: 10, pro: true },
  memo: { id: "memo", href: "/quran/112?m=practice", minutes: 10, pro: false },
  hifz: { id: "hifz", href: "/plan", minutes: 10, pro: false },
  listen: { id: "listen", href: "/quran/1", minutes: 5, pro: false },
  recite: { id: "recite", href: "/quran/1?m=check", minutes: 5, pro: false },
  vocab: { id: "vocab", href: "/vocab", minutes: 5, pro: false },
  feed: { id: "feed", href: "/", minutes: 5, pro: false },
  duas: { id: "duas", href: "/duas", minutes: 5, pro: false },
  prayer: { id: "prayer", href: "/prayer-setup", minutes: 3, pro: false },
};

export type WeekTheme =
  | "letters" | "reading" | "placement" | "fatiha" | "short" | "academy" | "deeper" | "memo1" | "memo2"
  | "tajweed1" | "tajweed2" | "listen" | "recite" | "daily" | "duas";
export type Week = { theme: WeekTheme; steps: StepId[] };
export type Plan = { answers: QuizAnswers; weeks: Week[]; createdAt: number };

const W = (theme: WeekTheme, ...steps: StepId[]): Week => ({ theme, steps });
/** four weekly milestones from the answers */
export function buildWeeks(a: QuizAnswers): Week[] {
  const beginner = a.level === "none" || a.level === "letters";
  const start = a.level === "none" ? W("letters", "arabic", "feed") : a.level === "letters" ? W("reading", "arabic", "vocab") : null;
  let weeks: Week[];
  switch (a.goal) {
    case "read":
      weeks = a.level === "fluent" || a.level === "slow"
        ? [W("placement", "placement", "qaida"), W("reading", "qaida", "vocab"), W("tajweed1", "tajweed", "listen"), W("fatiha", "shams", "recite")]
        : [W("letters", "qaida", "arabic"), W("reading", "qaida", "vocab"), W("tajweed1", "tajweed", "listen"), W("fatiha", "shams", "arabicLang")];
      break;
    case "understand":
      weeks = [W("fatiha", "shams", "arabicLang"), W("short", "shamsShort", "arabicLang"), W("academy", "academy", "vocab"), W("deeper", "shamsLong", "academyMore")];
      break;
    case "juzamma":
      weeks = [W("memo1", "memo", "listen"), W("memo2", "hifz", "memo"), W("tajweed1", "tajweed", "listen"), W("recite", "recite", "tajweedMore")];
      break;
    case "tajweed":
      weeks = [W("tajweed1", "tajweed", "listen"), W("listen", "listen", "tajweed"), W("tajweed2", "tajweedMore", "recite"), W("recite", "recite", "tajweedMore")];
      break;
    case "reciter":
      weeks = [W("listen", "listen", "tajweed"), W("tajweed1", "tajweed", "memo"), W("tajweed2", "tajweedMore", "listen"), W("recite", "recite", "shamsShort")];
      break;
    default:
      weeks = [W("daily", "feed", "shams"), W("fatiha", "shams", "duas"), W("duas", "duas", "vocab"), W("academy", "academy", "academyMore")];
  }
  if (beginner && a.goal !== "read" && start) weeks = [start, ...weeks.slice(0, 3)];
  if (a.prayer) weeks[0] = { ...weeks[0], steps: [...weeks[0].steps, "prayer"] };
  return weeks;
}

export const QUIZ_KEY = "qmc.quiz"; // the finished answers
export const DRAFT_KEY = "qmc.quiz.draft"; // answers so far (survives the reload a right-to-left language needs)
export const PLAN_KEY = "qmc.plan";
export const PLAN_DONE_KEY = "qmc.plan.done"; // { "YYYY-MM-DD": StepId[] }

export type QuizDraft = Partial<QuizAnswers> & { step?: number };
export const readDraft = () => readJSON<QuizDraft | null>(DRAFT_KEY, null);
export const writeDraft = (d: QuizDraft | null) => writeJSON(DRAFT_KEY, d, true);

export function savePlan(a: QuizAnswers): Plan {
  const plan: Plan = { answers: a, weeks: buildWeeks(a), createdAt: Date.now() };
  writeJSON(QUIZ_KEY, a, true);
  writeJSON(PLAN_KEY, plan, true);
  writeDraft(null);
  return plan;
}
export const readPlan = () => readJSON<Plan | null>(PLAN_KEY, null);
export const usePlan = () => useStored<Plan | null>(PLAN_KEY, null);

const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** day 1..30 of the plan (stays at 30 afterwards) */
export function planDay(p: Plan, now = Date.now()): number {
  const a = new Date(p.createdAt); a.setHours(0, 0, 0, 0);
  const b = new Date(now); b.setHours(0, 0, 0, 0);
  return Math.min(30, Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000) + 1));
}
export const weekOf = (p: Plan, now = Date.now()) => Math.min(3, Math.floor((planDay(p, now) - 1) / 7));

/** today's steps: the current week's steps, as many as fit the daily minutes (at least one) */
export function todaysSteps(p: Plan, now = Date.now()): Step[] {
  const steps = p.weeks[weekOf(p, now)]?.steps.map((id) => STEPS[id]) ?? [];
  const out: Step[] = [];
  let used = 0;
  for (const s of steps) {
    if (out.length && used + s.minutes > p.answers.minutes) continue;
    out.push(s); used += s.minutes;
  }
  return out;
}

type Done = Record<string, StepId[]>;
export const useDone = () => useStored<Done>(PLAN_DONE_KEY, {});
export function toggleStep(id: StepId, on: boolean) {
  const all = { ...readJSON<Done>(PLAN_DONE_KEY, {}) };
  const k = dayKey();
  const set = new Set(all[k] ?? []);
  if (on) set.add(id); else set.delete(id);
  all[k] = [...set];
  // keep the last 60 days
  for (const key of Object.keys(all).sort().slice(0, -60)) delete all[key];
  writeJSON(PLAN_DONE_KEY, all, true);
}
export const doneToday = (done: Done) => new Set(done[dayKey()] ?? []);
/** days in a row with at least one step done (today counts once something is done; yesterday keeps the streak alive) */
export function streakOf(done: Done, now = new Date()): number {
  const d = new Date(now);
  if (!(done[dayKey(d)]?.length)) d.setDate(d.getDate() - 1);
  let n = 0;
  while (done[dayKey(d)]?.length) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
