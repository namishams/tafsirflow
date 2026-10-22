// Dalil (دليل) – the Quran Masterclass tutor. "Dalīl" means both "guide" and "evidence": the tutor guides the learner
// and never says anything without a source from the platform's own reviewed content. Shared by the website and the app
// (the app reaches the same /api/assistant route).
//
// Owner decision 22.10.2026: AI is allowed, OpenAI "mini" model only. The key lives only on the server
// (OPENAI_API_KEY in /srv/tafsirflow/.env.app, scripts/set-openai.sh) – never in the browser, the app or git.

export const TUTOR_NAME = "Dalil";
export const TUTOR_NAME_AR = "دليل";
/** the two tutors: Dalil (a sheikh) for everyone; Hidaya (هداية, "guidance", a veiled ustadha) can be chosen by sisters
 *  and is their default. Both are AI, not real scholars, with the same grounded rules. */
export type Persona = "dalil" | "hidaya";
export const TUTORS: Record<Persona, { name: string; ar: string; role: string }> = {
  dalil: { name: "Dalil", ar: "دليل", role: "a devout, knowledgeable and warm sheikh who teaches the Quran – its recitation and its meaning" },
  hidaya: { name: "Hidaya", ar: "هداية", role: "a devout, knowledgeable and warm ustadha (a female teacher of the Quran – its recitation and its meaning) who teaches sisters" },
};
/** Hidaya only for sisters; anyone else gets Dalil */
export const personaFor = (want: unknown, address: Address): Persona => (want === "hidaya" && address === "sister" ? "hidaya" : "dalil");

/** the current cost-efficient mini chat model of the key (gpt-5.4-mini, checked 22.10.2026); env overrides */
export const tutorModel = () => process.env.OPENAI_TUTOR_MODEL || "gpt-5.4-mini";
export const MODERATION_MODEL = "omni-moderation-latest";

/** bump when the consent text changes: clients ask again, the server refuses older consents */
export const TUTOR_CONSENT_VERSION = 1;

export const TUTOR_LIMITS = {
  /** characters of one question */
  maxInput: 800,
  /** earlier messages sent along (each cut to maxHistoryChars) */
  maxHistory: 6,
  maxHistoryChars: 600,
  /** retrieved passages given to the model and their total size */
  passages: 6,
  passageChars: 1100,
  /** output tokens of the answer and of the planning step */
  answerTokens: 750,
  planTokens: 160,
  /** free questions per day in the app (signed in or not); Pro uses settings.premium.assistantPerDay */
  appFreePerDay: Number(process.env.TUTOR_APP_FREE_PER_DAY ?? 3),
  /** questions per minute per IP (burst protection) */
  perMinute: 6,
  /** all questions of the platform per day – a hard cost ceiling (cached answers do not count) */
  globalPerDay: Number(process.env.TUTOR_GLOBAL_PER_DAY ?? 4000),
  /** identical grounded first questions are answered from the cache */
  cacheEntries: 800,
  cacheMs: 3 * 24 * 60 * 60_000,
  temperature: 0.2,
} as const;

export type TutorContext = {
  /** where the learner asked from */
  kind: "lesson" | "quiz" | "shams" | "verse" | "carousel" | "tajweed" | "guide" | "onboarding" | "progress" | "general";
  /** course id, tajweed lesson id, carousel id, guide slug … */
  id?: string;
  /** lesson id inside a course */
  lesson?: string;
  /** a verse key "2:255" */
  verse?: string;
  /** a short title the client shows ("Aqidah · Tawhid") – only a label, never used as a source */
  title?: string;
  /** quiz: the question, the chosen (wrong) option, the right option and the explanation as shown in the app */
  question?: string;
  chosen?: string;
  correct?: string;
  explain?: string;
};

export type Address = "brother" | "sister" | null;
export type Tradition = "sunni" | "shia" | "all";

/** the learner's own numbers (from the device and, when signed in, "Together"), the only figures the tutor may use
 *  about the learner. Whitelisted and cut on the server; never stored. */
export type LearnerData = Record<string, number | string | boolean | null>;
