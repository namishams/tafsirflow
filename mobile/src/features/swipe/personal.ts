import { readPlan, type QuizLevel } from "@/features/plan/plan";
import { readV2, type GoalV2, type Interest } from "@/features/plan/v2";
import { interestOf } from "@/features/feed/interest";

// Which kinds of learning cards come how often, from what the learner told us in onboarding (goals, interests, level)
// and what they engage with in the feed (on-device interest scores). Pure weights, nothing leaves the device.
export type Source = "word" | "verse" | "tajweed" | "name" | "quiz" | "course" | "maqasid" | "grammar" | "hadith" | "tafsir" | "dua" | "corpus";
export const SOURCES: Source[] = ["word", "verse", "tajweed", "name", "quiz", "course", "maqasid", "grammar", "hadith", "tafsir", "dua", "corpus"];

const BASE: Record<Source, number> = { word: 1.3, verse: 1.1, tajweed: 0.8, name: 0.8, quiz: 1, course: 1, maqasid: 0.9, grammar: 0.7, hadith: 1, tafsir: 0.9, dua: 0.9, corpus: 1.2 };
const BY_INTEREST: Partial<Record<Interest, Partial<Record<Source, number>>>> = {
  tafsir: { tafsir: 1.6, maqasid: 1.5, verse: 1.2 },
  hadith: { hadith: 1.8 },
  duas: { dua: 1.8, name: 1.3 },
  arabic: { word: 1.6, grammar: 1.8 },
  recitation: { tajweed: 1.8, verse: 1.2 },
  prophets: { course: 1.5 },
  history: { course: 1.5, quiz: 1.1 },
  haramain: { course: 1.3 },
  abrahamic: { course: 1.3 },
};
const BY_GOAL: Partial<Record<GoalV2, Partial<Record<Source, number>>>> = {
  read: { tajweed: 1.3, word: 1.2 },
  understand: { word: 1.4, grammar: 1.3, tafsir: 1.3, maqasid: 1.2 },
  juzamma: { verse: 1.2, word: 1.2 },
  tajweed: { tajweed: 1.8 },
  reciter: { tajweed: 1.6, verse: 1.2 },
  daily: { dua: 1.3, verse: 1.2 },
  islam: { course: 1.5, quiz: 1.2 },
  children: { name: 1.2, dua: 1.2 },
};
const BY_LEVEL: Record<QuizLevel, Partial<Record<Source, number>>> = {
  none: { grammar: 0.4, quiz: 0.8, tajweed: 1.2 },
  letters: { grammar: 0.5, tajweed: 1.2 },
  slow: {},
  fluent: { grammar: 1.3, quiz: 1.2 },
};
/** the feed kinds whose interest score moves a source */
const FEED_KIND: Partial<Record<Source, string>> = { hadith: "hadith", dua: "dua", tafsir: "tafsir", word: "word", verse: "verse", tajweed: "kn-tajweed", name: "kn-names", quiz: "kn-exam", course: "kn-course", maqasid: "kn-tadabbur", grammar: "kn-grammar" };

export type Profile = { weights: Record<Source, number>; beginner: boolean; juzAmmaFirst: boolean };
export function profile(): Profile {
  const w = { ...BASE };
  const v2 = (() => { try { return readV2(); } catch { return null; } })();
  const plan = (() => { try { return readPlan(); } catch { return null; } })();
  const goals: GoalV2[] = v2?.goals?.length ? v2.goals : plan?.answers.goal ? [plan.answers.goal] : [];
  const mul = (m?: Partial<Record<Source, number>>) => { for (const [k, v] of Object.entries(m ?? {})) w[k as Source] *= v ?? 1; };
  for (const i of v2?.interests ?? []) mul(BY_INTEREST[i]);
  for (const g of goals) mul(BY_GOAL[g]);
  const level = plan?.answers.level;
  if (level) mul(BY_LEVEL[level]);
  for (const s of SOURCES) { const k = FEED_KIND[s]; if (k) w[s] *= Math.min(2, Math.max(0.5, interestOf(k))); }
  return { weights: w, beginner: level === "none" || level === "letters", juzAmmaFirst: goals.includes("juzamma") || level === "none" || level === "letters" };
}
