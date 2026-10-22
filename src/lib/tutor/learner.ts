import type { Doc } from "./corpus";
import type { LearnerData } from "./config";

// The learner's own progress as one more "source" for the tutor: streak, verses, the weakest mastery dimension, today's
// wird, the next best step (all computed on the device from the learner's own data) and, for signed-in members of
// "Together", counts about friends and circles (togetherSummary – never names, nothing others did not share).
// The tutor may use ONLY these figures about the learner (validate.ts rejects numbers that appear nowhere in the sources).

type Field = { label: string; kind: "int" | "pct" | "bool" | "text" };
export const LEARNER_FIELDS: Record<string, Field> = {
  streak: { label: "Days in a row with learning (streak)", kind: "int" },
  bestStreak: { label: "Longest streak (days)", kind: "int" },
  learnedToday: { label: "Has learned today", kind: "bool" },
  minutesToday: { label: "Minutes learned today", kind: "int" },
  versesMemorised: { label: "Verses memorised", kind: "int" },
  surahsComplete: { label: "Surahs memorised completely", kind: "int" },
  currentSurah: { label: "Surah currently being learned", kind: "text" },
  weekActiveDays: { label: "Active days this week", kind: "int" },
  weekXp: { label: "XP this week", kind: "int" },
  level: { label: "Level", kind: "int" },
  tier: { label: "Career tier", kind: "text" },
  overallPct: { label: "Overall mastery of memorised verses (%)", kind: "pct" },
  weakestDim: { label: "Weakest mastery dimension (hifz, words, links = verse transitions, understand, tajweed, similar = mutashabihat)", kind: "text" },
  weakestPct: { label: "Mastery of the weakest dimension (%)", kind: "pct" },
  todayNew: { label: "New verses in today's plan (sabaq)", kind: "int" },
  todayReview: { label: "Reviews due today", kind: "int" },
  testsDue: { label: "Tests (ʿarḍ) due", kind: "int" },
  nextStep: { label: "Next best step suggested by the Shams Method", kind: "text" },
  coursesStarted: { label: "Academy courses started", kind: "int" },
  courseNext: { label: "Course in progress", kind: "text" },
  courseDone: { label: "Lessons done in that course", kind: "int" },
  courseTotal: { label: "Lessons in that course", kind: "int" },
  khatmPct: { label: "Quran read in the khatm plan (%)", kind: "pct" },
  milestone: { label: "Milestone just reached", kind: "text" },
  // from "Together" (server)
  friendsSharing: { label: "Friends who share their activity", kind: "int" },
  friendsLearnedToday: { label: "Friends who learned today", kind: "int" },
  friendsKeptStreak: { label: "Friends who kept their streak", kind: "int" },
  circles: { label: "Study circles joined", kind: "int" },
  circleProgressPct: { label: "Progress of the study circle's weekly goal (%)", kind: "pct" },
  circleReached: { label: "Study circle reached its weekly goal", kind: "bool" },
  groupStreak: { label: "Study circle's group streak (weeks)", kind: "int" },
  leagueRank: { label: "Place in the weekly league", kind: "int" },
  leagueSize: { label: "Members in the league group", kind: "int" },
  leagueDaysLeft: { label: "Days left in the league week", kind: "int" },
  leagueAheadXp: { label: "XP to the next place in the league", kind: "int" },
  challengesActive: { label: "Active challenges with friends", kind: "int" },
  weeklyRankChange: { label: "Places gained on the weekly world board since last visit (negative = lost)", kind: "int" },
};

/** keeps only known fields with plausible values */
export function cleanLearner(raw: unknown): LearnerData | null {
  if (!raw || typeof raw !== "object") return null;
  const out: LearnerData = {};
  for (const [k, f] of Object.entries(LEARNER_FIELDS)) {
    const v = (raw as Record<string, unknown>)[k];
    if (v === undefined || v === null) continue;
    if (f.kind === "bool" && typeof v === "boolean") out[k] = v;
    else if ((f.kind === "int" || f.kind === "pct") && typeof v === "number" && Number.isFinite(v)) out[k] = Math.round(Math.max(f.kind === "pct" ? 0 : -100000, Math.min(f.kind === "pct" ? 100 : 1e7, v)));
    else if (f.kind === "text" && typeof v === "string" && v.trim()) out[k] = v.replace(/[\n\r]+/g, " ").replace(/[^\p{L}\p{N} '’:,.()/–-]/gu, "").slice(0, 80);
  }
  return Object.keys(out).length ? out : null;
}

/** "Together" summary (src/lib/together.ts togetherSummary) → counts only; null-safe when the module or data is missing */
export function fromTogether(t: unknown): LearnerData {
  const s = (t ?? {}) as {
    streak?: number; learnedToday?: boolean; weekXp?: number; weekActiveDays?: number;
    friends?: { sharing?: number; learnedToday?: number; keptStreak?: number };
    circles?: { goal?: number; progress?: number; reached?: boolean; groupStreak?: number }[];
    league?: { rank?: number | null; size?: number; daysLeft?: number; aheadXp?: number | null } | null;
    challenges?: unknown[]; rankChange?: { change?: number | null } | null;
  };
  const c = s.circles?.[0];
  const raw: Record<string, unknown> = {
    streak: s.streak, learnedToday: s.learnedToday, weekXp: s.weekXp, weekActiveDays: s.weekActiveDays,
    friendsSharing: s.friends?.sharing, friendsLearnedToday: s.friends?.learnedToday, friendsKeptStreak: s.friends?.keptStreak,
    circles: s.circles?.length, circleProgressPct: c && c.goal ? Math.round((100 * (c.progress ?? 0)) / c.goal) : undefined, circleReached: c?.reached, groupStreak: c?.groupStreak,
    leagueRank: s.league?.rank ?? undefined, leagueSize: s.league?.size, leagueDaysLeft: s.league?.daysLeft, leagueAheadXp: s.league?.aheadXp ?? undefined,
    challengesActive: s.challenges?.length, weeklyRankChange: s.rankChange?.change ?? undefined,
  };
  return cleanLearner(raw) ?? {};
}

/** the learner's data as a passage the model can cite */
export function learnerDoc(d: LearnerData): Doc {
  const lines = Object.entries(d).map(([k, v]) => `${LEARNER_FIELDS[k]?.label ?? k}: ${typeof v === "boolean" ? (v ? "yes" : "no") : v}`);
  return { id: "learner@en", base: "learner", kind: "progress", lang: "en", title: "The learner's own progress (from their device and their study circle)", text: lines.join("\n"), link: "/stats", verses: [], hadith: [], tradition: "all" };
}
