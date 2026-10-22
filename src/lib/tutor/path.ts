import { COURSES } from "../learn/courses";
import { TUTOR_LIMITS } from "./config";
import type { Address } from "./config";
import type { ChatCall } from "./openai";
import { PATH_SCHEMA, pathRules, type ModelPath } from "./prompt";

// Onboarding (optional step "Ask Dalil to tailor your plan"): from the learner's onboarding answers, Dalil picks 3–5
// steps from this fixed catalogue of the platform – never anything that does not exist. Without AI or consent the
// app keeps its own plan; this only adds a personal order and a sentence of why.

type Item = { id: string; link: string; en: string; about: string };
const BASE: Item[] = [
  { id: "arabic", link: "/arabic", en: "Learn to read Arabic from zero", about: "for learners who cannot read the Arabic letters yet" },
  { id: "shams", link: "/shams", en: "The Shams Method", about: "learn and memorise the Quran verse by verse, about 4 minutes per verse, with spaced review" },
  { id: "shams-fatiha", link: "/surah/1?shams=1", en: "Start with al-Fatiha (Shams Method)", about: "the first surah, learned with the seven Shams steps" },
  { id: "juz-amma", link: "/surah/114?shams=1", en: "Short surahs of Juz ʿAmma", about: "short surahs for daily prayer, good first memorisation goal" },
  { id: "tajweed", link: "/tajweed", en: "Tajweed lessons", about: "rules of recitation, from basics to advanced, with quizzes" },
  { id: "salah", link: "/salah", en: "Prayer trainer", about: "learn the prayer step by step (Sunni and Ja'fari)" },
  { id: "plan", link: "/plan", en: "365-day and hifz plans", about: "a daily plan for reading or memorising" },
  { id: "vocab", link: "/vocab", en: "Quran vocabulary", about: "the most frequent words of the Quran to understand while listening" },
  { id: "duas", link: "/duas", en: "Duas", about: "supplications from the Quran and Sunnah for daily life" },
  { id: "names", link: "/names", en: "The 99 Names of Allah", about: "meanings and where they appear in the Quran" },
  { id: "khatm", link: "/khatm", en: "Khatm – read the whole Quran", about: "track reading the complete Quran" },
  { id: "islam", link: "/islam", en: "Articles about Islam", about: "beliefs, worship, history, schools of thought" },
];
export function pathCatalogue(): Item[] {
  return [
    ...BASE,
    ...COURSES.map((c) => ({ id: `course:${c.id}`, link: `/courses/${c.id}`, en: c.title.en, about: c.lead.en })),
  ];
}

export type PathStep = { id: string; link: string; title: string; why: string };
export type PathResult = { intro: string; steps: PathStep[]; tokensIn: number; tokensOut: number };

/** answers: the onboarding choices as short strings (option ids), e.g. { goals: "memorise,understand", level: "beginner" } */
export async function tailorPath(answers: Record<string, string>, o: { lang: string; address: Address }, chat: ChatCall): Promise<PathResult | null> {
  const cat = pathCatalogue();
  const lines = Object.entries(answers).filter(([k, v]) => /^[a-z]{2,16}$/.test(k) && typeof v === "string").slice(0, 14).map(([k, v]) => `${k}: ${v.replace(/[^\p{L}\p{N} ,._-]/gu, "").slice(0, 160)}`);
  const user = `Onboarding answers:\n${lines.join("\n") || "(none)"}\n\nCatalogue (id – title – what it is):\n${cat.map((c) => `${c.id} – ${c.en} – ${c.about}`).join("\n")}`;
  const r = await chat({ system: pathRules(o), messages: [{ role: "user", content: user }], schema: PATH_SCHEMA, maxTokens: TUTOR_LIMITS.answerTokens });
  const j = r.json as Partial<ModelPath> | null;
  if (!j || !Array.isArray(j.steps)) return null;
  const byId = new Map(cat.map((c) => [c.id, c]));
  const seen = new Set<string>();
  const steps = j.steps
    .map((s) => ({ id: String(s?.id ?? ""), title: String(s?.title ?? "").trim().slice(0, 80), why: String(s?.why ?? "").slice(0, 240) }))
    .filter((s) => byId.has(s.id) && !seen.has(s.id) && (seen.add(s.id), true))
    .slice(0, 5)
    .map((s) => { const c = byId.get(s.id)!; return { id: s.id, link: c.link, title: s.title || c.en, why: s.why }; });
  if (steps.length < 2) return null;
  return { intro: String(j.intro ?? "").slice(0, 400), steps, tokensIn: r.tokensIn, tokensOut: r.tokensOut };
}
