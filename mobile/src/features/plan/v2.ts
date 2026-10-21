import { readJSON, useStored, writeJSON } from "@/lib/store";
import { seedInterests } from "@/features/feed/interest";
import type { QuizGoal } from "./plan";

// Onboarding v2: the extra, multi-select answers (goals, interests, challenges) and the optional name. They sit next to
// the v1 answers (qmc.quiz / qmc.plan / tf:goal stay as they are): the first chosen goal still drives the 30-day plan,
// the rest enriches it with courses and seeds the feed's on-device interest.
export type GoalV2 = QuizGoal | "islam" | "children";
export type Interest = "tafsir" | "hadith" | "history" | "prophets" | "duas" | "arabic" | "recitation" | "haramain" | "abrahamic";
export type Challenge = "time" | "consistency" | "pronunciation" | "motivation" | "arabic";
export const GOALS_V2: GoalV2[] = ["read", "understand", "juzamma", "tajweed", "reciter", "daily", "islam", "children"];
export const INTERESTS: Interest[] = ["tafsir", "hadith", "history", "prophets", "duas", "arabic", "recitation", "haramain", "abrahamic"];
export const CHALLENGES: Challenge[] = ["time", "consistency", "pronunciation", "motivation", "arabic"];

/** the plan's single goal (v1) from the chosen goals: the first one, the two new ones map onto "daily" */
export const primaryGoal = (g: GoalV2[] | undefined): QuizGoal => {
  const f = g?.[0];
  return !f || f === "islam" || f === "children" ? "daily" : f;
};

export type CourseId = "arabicRead" | "arabicLang" | "reciter" | "hifz" | "cards" | "haramain" | "abrahamic";
export const COURSES: Record<CourseId, string> = {
  arabicRead: "/arabic/read", arabicLang: "/arabic/lang", reciter: "/reciter-path", hifz: "/cards/hifz", cards: "/cards", haramain: "/haramain", abrahamic: "/abrahamic",
};
/** the courses that belong to this path (in this order) */
export function coursesFor(goals: GoalV2[], interests: Interest[], challenges: Challenge[]): CourseId[] {
  const s = new Set<CourseId>();
  if (goals.includes("read")) s.add("arabicRead");
  if (goals.includes("understand") || interests.includes("arabic") || challenges.includes("arabic")) s.add("arabicLang");
  if (goals.includes("reciter") || goals.includes("tajweed") || interests.includes("recitation")) s.add("reciter");
  if (goals.includes("juzamma")) s.add("hifz");
  if (challenges.includes("consistency") || challenges.includes("time") || goals.includes("juzamma")) s.add("cards");
  if (interests.includes("haramain")) s.add("haramain");
  if (interests.includes("abrahamic")) s.add("abrahamic");
  return (Object.keys(COURSES) as CourseId[]).filter((c) => s.has(c));
}

/** feed post kinds per interest (src/features/feed/library.ts TOPIC_KINDS) */
const FEED_KINDS: Record<Interest, string[]> = {
  tafsir: ["tafsir", "surah-info", "word-root"],
  hadith: ["hadith", "hadith-of-day", "shia-hadith"],
  history: ["history", "golden-age", "spread", "islamic-date"],
  prophets: ["prophets", "seerah", "prophet-family"],
  duas: ["dua", "asma", "akhlaq"],
  arabic: ["word-of-day", "arabic-word", "word-root"],
  recitation: ["reciter-bio", "reciter-fact"],
  haramain: ["holy-places", "mosque", "pillars-hajj"],
  abrahamic: ["prophets", "abrahamic"],
};

export const V2_KEY = "qmc.quiz.v2";
export const NAME_KEY = "qmc.name";
export type V2Answers = { goals: GoalV2[]; interests: Interest[]; challenges: Challenge[]; courses: CourseId[]; at: number };
export const readV2 = () => readJSON<V2Answers | null>(V2_KEY, null);
export const useV2 = () => useStored<V2Answers | null>(V2_KEY, null);
export const readName = () => (readJSON<string>(NAME_KEY, "") || "").trim();
export const useName = () => (useStored<string>(NAME_KEY, "") || "").trim();
export const saveName = (n: string) => writeJSON(NAME_KEY, n.trim().slice(0, 40), true);

/** stores the v2 answers and gives the chosen interests a head start in the feed */
export function saveV2(goals: GoalV2[], interests: Interest[], challenges: Challenge[]): V2Answers {
  const v: V2Answers = { goals, interests, challenges, courses: coursesFor(goals, interests, challenges), at: Date.now() };
  writeJSON(V2_KEY, v, true);
  seedInterests([...new Set(interests.flatMap((i) => FEED_KINDS[i]))]);
  return v;
}
