import { TUTOR_LIMITS, tutorModel, type Address, type Tradition, type TutorContext } from "./config";
import type { Doc } from "./corpus";
import { tutorMsg } from "./messages";
import type { ChatCall, ModerationCall } from "./openai";
import { QuotaError } from "./openai";
import { ANSWER_SCHEMA, PLAN_RULES, PLAN_SCHEMA, answerRules, contextBlock, sourcesBlock, type Plan, type PlanCategory } from "./prompt";
import { scrub } from "./privacy";
import { contextDocs, search } from "./retrieve";
import { fold, isVerseKey, verseRefsIn } from "./text";
import { checkAnswer } from "./validate";
import { answerId } from "./store";

// One question to Dalil, from the raw text to a checked, grounded answer:
//   scrub personal data → moderation → cache → plan (category + search words) → fixed reply for greetings, off-topic,
//   politics, harm, crisis → retrieval (lessons, carousels, guides, handbook, glossary; tafsir of a named verse) →
//   answer from the passages only → server checks (sources, references, no scripture text) → output moderation.
// The model and the moderation are passed in (deps), so the whole pipeline is tested without a key (scripts/test-tutor.mjs).

export type TutorInput = {
  question: string;
  history: { role: "user" | "assistant"; content: string }[];
  lang: string;
  address: Address;
  tradition: Tradition;
  context: TutorContext | null;
  /** the account's own name parts, removed from the text before it leaves the server */
  names?: (string | null | undefined)[];
};
export type TutorSource = { n: number; title: string; link: string; kind: string };
export type TutorStatus = "answered" | "views" | "not_found" | "greeting" | "refused" | "crisis" | "flagged";
export type TutorResult = {
  id: string;
  status: TutorStatus;
  answer: string;
  /** shown under the answer: "not a ruling – ask a scholar" for views */
  notice?: string;
  sources: TutorSource[];
  verses: string[];
  hadith: string[];
  followups: string[];
  /** pages that may help when nothing was found */
  related: TutorSource[];
  // for the log only
  category?: PlanCategory;
  cached?: boolean;
  passages: number;
  tokensIn: number;
  tokensOut: number;
  /** the scrubbed question (for a report) */
  asked: string;
};
export type TutorDeps = {
  chat: ChatCall;
  moderate?: ModerationCall;
  corpus: () => Promise<Doc[]>;
  /** passages for one verse: its translation and classical tafsir from the sources (Quran.com) */
  verseDocs?: (key: string, lang: string) => Promise<Doc[]>;
};

// ---- cache of identical first questions (same words, language, form of address, tradition and place) ----
const cache = new Map<string, { at: number; r: TutorResult }>();
function cacheKey(i: TutorInput, q: string) {
  const c = i.context;
  return [fold(q).replace(/[^\p{L}\p{N}]+/gu, " ").trim(), i.lang, i.address ?? "-", i.tradition, c ? [c.kind, c.id, c.lesson, c.verse, c.chosen].join("|") : ""].join("#");
}
function fromCache(k: string): TutorResult | null {
  const e = cache.get(k);
  if (!e) return null;
  if (Date.now() - e.at > TUTOR_LIMITS.cacheMs) { cache.delete(k); return null; }
  cache.delete(k); cache.set(k, e); // most recently used last
  return { ...e.r, cached: true, tokensIn: 0, tokensOut: 0 };
}
function toCache(k: string, r: TutorResult) {
  cache.set(k, { at: Date.now(), r });
  while (cache.size > TUTOR_LIMITS.cacheEntries) cache.delete(cache.keys().next().value as string);
}
export const clearTutorCache = () => cache.clear();

const fixed = (status: TutorStatus, answer: string, asked: string, extra: Partial<TutorResult> = {}): TutorResult =>
  ({ id: answerId([status, asked, answer]), status, answer, sources: [], verses: [], hadith: [], followups: [], related: [], passages: 0, tokensIn: 0, tokensOut: 0, asked, ...extra });

const MIN_SCORE = 2.2;

export async function askTutor(i: TutorInput, deps: TutorDeps): Promise<TutorResult> {
  const m = tutorMsg(i.lang);
  const asked = scrub(i.question.trim().slice(0, TUTOR_LIMITS.maxInput), i.names);
  const history = i.history.slice(-TUTOR_LIMITS.maxHistory).map((h) => ({ role: h.role, content: scrub(h.content.slice(0, TUTOR_LIMITS.maxHistoryChars), i.names) }));
  let tokensIn = 0, tokensOut = 0;

  // 1. moderation of the question (OpenAI moderation; without an answer from it the pipeline goes on, the model rules still hold)
  const mod = deps.moderate ? await deps.moderate(asked) : null;
  if (mod?.selfHarm) return fixed("crisis", m.crisis, asked, { category: "crisis" });
  if (mod?.flagged) return fixed("refused", m.harmful, asked, { category: "harmful" });

  // 2. cache (first questions only: a follow-up depends on the conversation)
  const key = history.length ? null : cacheKey(i, asked);
  const hit = key ? fromCache(key) : null;
  if (hit) return hit;

  // 3. plan
  let plan: Plan = { category: "islam", query_en: asked, query_local: "" };
  try {
    const recent = history.slice(-2).map((h) => `${h.role}: ${h.content.slice(0, 300)}`).join("\n");
    const ctx = i.context ? `Context: ${i.context.kind}${i.context.title ? ` "${i.context.title.slice(0, 100)}"` : ""}${i.context.question ? ` – quiz: ${i.context.question.slice(0, 200)}` : ""}\n` : "";
    const p = await deps.chat({ system: PLAN_RULES, messages: [{ role: "user", content: `${ctx}${recent ? `Earlier:\n${recent}\n` : ""}Question: ${asked}` }], schema: PLAN_SCHEMA, maxTokens: TUTOR_LIMITS.planTokens });
    tokensIn += p.tokensIn; tokensOut += p.tokensOut;
    const j = p.json as Partial<Plan> | null;
    if (j && typeof j.category === "string") plan = { category: j.category as PlanCategory, query_en: String(j.query_en ?? ""), query_local: String(j.query_local ?? "") };
  } catch (e) {
    if (e instanceof QuotaError) throw e;
  }
  // a question asked from a lesson or a quiz is about that lesson, even when it is short ("why?")
  if (i.context && i.context.kind !== "general" && i.context.kind !== "onboarding" && (plan.category === "greeting" || plan.category === "off_topic") && asked.length < 60) plan.category = "islam";
  const base = { category: plan.category, tokensIn, tokensOut };
  if (plan.category === "crisis") return fixed("crisis", m.crisis, asked, base);
  if (plan.category === "harmful") return fixed("refused", m.harmful, asked, base);
  if (plan.category === "political") return fixed("refused", m.political, asked, base);
  if (plan.category === "off_topic") return fixed("refused", m.offTopic, asked, base);
  if (plan.category === "greeting") return fixed("greeting", m.greeting, asked, base);

  // 4. retrieval
  const docs = await deps.corpus();
  const ctx = i.context;
  const query = [asked, plan.query_en, plan.query_local, ctx?.title, ctx?.question, ctx?.correct, history.filter((h) => h.role === "user").slice(-1)[0]?.content].filter(Boolean).join(" ");
  const hits = search(docs, query, { lang: i.lang, tradition: i.tradition, k: TUTOR_LIMITS.passages, context: ctx });
  const strong = hits.filter((h) => h.score >= MIN_SCORE).map((h) => h.doc);
  const own = contextDocs(docs, ctx, i.lang);
  // a verse the learner looks at or names: its translation and classical tafsir are sources too
  const namedVerse = ctx?.verse && isVerseKey(ctx.verse) ? ctx.verse : verseRefsIn(asked)[0];
  const verseOwn = namedVerse && deps.verseDocs ? await deps.verseDocs(namedVerse, i.lang).catch(() => []) : [];
  const seen = new Set<string>();
  const passages = [...verseOwn, ...own, ...strong].filter((d) => (seen.has(d.base) ? false : (seen.add(d.base), true))).slice(0, TUTOR_LIMITS.passages);
  const related = hits.slice(0, 3).map((h, n) => ({ n: n + 1, title: h.doc.title, link: h.doc.link, kind: h.doc.kind }));
  if (!passages.length) return fixed("not_found", m.notFound, asked, { ...base, related });

  // 5. the answer, from the passages only (one more try when the server rejects the first one)
  const system = answerRules({ lang: i.lang, address: i.address, tradition: i.tradition });
  const userMsg = [contextBlock(ctx), `SOURCES:\n${sourcesBlock(passages, TUTOR_LIMITS.passageChars)}`, `QUESTION: ${asked}`].filter(Boolean).join("\n\n");
  const extra = namedVerse ? [namedVerse] : [];
  let checked = null as ReturnType<typeof checkAnswer> | null;
  let note = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const a = await deps.chat({ system, messages: [...history, { role: "user", content: note ? `${userMsg}\n\n${note}` : userMsg }], schema: ANSWER_SCHEMA, maxTokens: TUTOR_LIMITS.answerTokens });
    tokensIn += a.tokensIn; tokensOut += a.tokensOut;
    checked = checkAnswer(a.json, passages, extra);
    if (checked.ok || checked.reason === "not_found" || checked.reason === "no_sources") break;
    note = `IMPORTANT: your previous answer was rejected (${checked.reason}: ${checked.notes.join("; ").slice(0, 200)}). Use only the passages and only the references listed with them; never quote scripture.`;
  }
  const stats = { ...base, tokensIn, tokensOut, passages: passages.length };
  if (!checked || !checked.ok) return fixed("not_found", m.notFound, asked, { ...stats, related: passages.slice(0, 3).map((d, n) => ({ n: n + 1, title: d.title, link: d.link, kind: d.kind })) });

  // 6. moderation of the answer
  const out = deps.moderate ? await deps.moderate(checked.answer) : null;
  if (out?.flagged) return fixed("flagged", m.flagged, asked, stats);

  // sources numbered 1…n in the order used; markers [S4] become [1]
  const order = checked.used;
  const num = new Map(order.map((d, n) => [`S${passages.indexOf(d) + 1}`, n + 1]));
  const answer = checked.answer.replace(/\[(S\d{1,2})\]/g, (_, k: string) => `[${num.get(k) ?? ""}]`).replace(/\[\]/g, "");
  const status = checked.status === "views" || plan.category === "fiqh_ruling" ? "views" : "answered";
  const r: TutorResult = {
    id: answerId([asked, answer]),
    status, answer,
    notice: status === "views" ? m.scholar : undefined,
    sources: order.map((d, n) => ({ n: n + 1, title: d.title, link: d.link, kind: d.kind })),
    verses: checked.verses, hadith: checked.hadith, followups: checked.followups, related: [],
    ...stats, asked,
  };
  if (key) toCache(key, r);
  return r;
}

export const TUTOR_MODEL_LABEL = () => tutorModel();
