import { NextRequest } from "next/server";
import { currentUser, type User } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { getSettings, type Settings } from "@/lib/settings";
import { TUTOR_CONSENT_VERSION, TUTOR_LIMITS, TUTOR_NAME, tutorModel, type Address, type Tradition, type TutorContext } from "@/lib/tutor/config";
import { corpus } from "@/lib/tutor/corpus";
import { openAiChat, openAiModeration, QuotaError } from "@/lib/tutor/openai";
import { askTutor, type TutorResult } from "@/lib/tutor/pipeline";
import { resolveScripture, verseDocs } from "@/lib/tutor/scripture";
import { logQuestion, refundUserQuestion, takeUserQuestion, usedToday } from "@/lib/tutor/store";

export const dynamic = "force-dynamic";

// Dalil, the tutor (formerly "the assistant"): the same route for the website and the app.
// The OpenAI key lives only in the server environment (OPENAI_API_KEY in /srv/tafsirflow/.env.app) – never in the
// browser, the app or the repository. Answers are grounded in the platform's reviewed content (lib/tutor/*).
//
// Limits per day (cost and abuse protection; cached answers do not reach the model):
//   website  – visitors: settings.limits.assistantAnonPerDay per IP; accounts: settings.limits.assistantPerUserPerDay
//   app      – free: TUTOR_LIMITS.appFreePerDay (account, or per IP without one); Pro (signed in): settings.premium.assistantPerDay
//   all      – TUTOR_LIMITS.perMinute per IP and minute, TUTOR_LIMITS.globalPerDay model questions for the whole platform
// Request (v2): { v: 2, question, history?, locale, context?, address?, tradition?, consent: { v, age: "13plus" | "parent" } }
// Legacy (v1, older app builds and the old website chat): { messages, locale } – answered by the same grounded pipeline.

type Quota = { limit: number; used: number; pro: boolean; scope: "user" | "ip" };
const today = () => new Date().toISOString().slice(0, 10);
const ipDay = new Map<string, { day: string; n: number }>();
let globalDay = { day: today(), n: 0 };

function ipUsed(key: string) { const e = ipDay.get(key); return e && e.day === today() ? e.n : 0; }
function ipTake(key: string, limit: number) {
  const d = today();
  const e = ipDay.get(key);
  const n = e && e.day === d ? e.n : 0;
  if (n >= limit) return false;
  ipDay.set(key, { day: d, n: n + 1 });
  if (ipDay.size > 50_000) for (const [k, v] of ipDay) if (v.day !== d) ipDay.delete(k);
  return true;
}
function ipRefund(key: string) { const e = ipDay.get(key); if (e && e.n > 0) e.n -= 1; }

async function quotaOf(req: NextRequest, me: User | null, s: Settings): Promise<Quota> {
  const app = !!req.headers.get("x-qmc-app");
  const pro = me?.plan === "premium";
  const member = !!me && (me.emailVerified || app);
  if (member && me) {
    const limit = pro ? s.premium.assistantPerDay : app ? Math.min(TUTOR_LIMITS.appFreePerDay, s.limits.assistantPerUserPerDay || TUTOR_LIMITS.appFreePerDay) : s.limits.assistantPerUserPerDay || 20;
    return { limit, used: await usedToday(me.id), pro, scope: "user" };
  }
  const limit = app ? TUTOR_LIMITS.appFreePerDay : s.limits.assistantAnonPerDay;
  return { limit, used: ipUsed(`${app ? "app" : "web"}:${clientIp(req)}`), pro: false, scope: "ip" };
}

export async function GET(req: NextRequest) {
  const s = await getSettings();
  const enabled = !!process.env.OPENAI_API_KEY && s.features.assistant;
  const me = await currentUser().catch(() => null);
  const q = await quotaOf(req, me, s);
  return json({
    enabled, name: TUTOR_NAME, consentVersion: TUTOR_CONSENT_VERSION,
    anon: s.limits.assistantAnonPerDay,
    quota: { limit: q.limit, left: Math.max(0, q.limit - q.used), pro: q.pro, signedIn: !!me },
  });
}

type Msg = { role: "user" | "assistant"; content: string };
type Body = {
  v?: number; question?: string; history?: Msg[]; messages?: Msg[]; locale?: string; context?: Partial<TutorContext>;
  address?: string; tradition?: string; consent?: { v?: number; age?: string };
};

const str = (x: unknown, n: number) => (typeof x === "string" ? x.slice(0, n) : undefined);
function cleanContext(c: Partial<TutorContext> | undefined): TutorContext | null {
  if (!c || typeof c !== "object") return null;
  const kinds = ["lesson", "quiz", "shams", "verse", "carousel", "tajweed", "guide", "onboarding", "general"];
  if (!kinds.includes(String(c.kind))) return null;
  return {
    kind: c.kind as TutorContext["kind"], id: str(c.id, 80), lesson: str(c.lesson, 80), verse: /^\d{1,3}:\d{1,3}$/.test(String(c.verse)) ? String(c.verse) : undefined,
    title: str(c.title, 140), question: str(c.question, 400), chosen: str(c.chosen, 240), correct: str(c.correct, 240), explain: str(c.explain, 700),
  };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const key = process.env.OPENAI_API_KEY;
  const s = await getSettings();
  if (!key || !s.features.assistant) return json({ error: "off" }, 503);
  const b = (await req.json().catch(() => ({}))) as Body;
  const v2 = b.v === 2;
  const locale = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";
  const app = !!req.headers.get("x-qmc-app");
  const me = await currentUser().catch(() => null);

  // consent (Apple 5.1.2(i)): the client showed that questions go to OpenAI and the person agreed; age 13+ or a parent
  if (v2 && (Number(b.consent?.v) < TUTOR_CONSENT_VERSION || !b.consent?.v)) return json({ error: "consent", consentVersion: TUTOR_CONSENT_VERSION }, 428);
  if (v2 && b.consent?.age !== "13plus" && b.consent?.age !== "parent") return json({ error: "consent", consentVersion: TUTOR_CONSENT_VERSION }, 428);
  if (me?.birthYear && new Date().getFullYear() - me.birthYear < 13 && b.consent?.age !== "parent") return json({ error: "age" }, 403);

  // the question: v2 sends it alone with the history, v1 the whole conversation
  const legacy = (Array.isArray(b.messages) ? b.messages : []).filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
  const question = v2 ? String(b.question ?? "") : legacy[legacy.length - 1]?.role === "user" ? legacy[legacy.length - 1].content : "";
  const history = (v2 ? (Array.isArray(b.history) ? b.history : []) : legacy.slice(0, -1)).filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string");
  if (question.trim().length < 2) return json({ error: "empty" }, 400);
  if (question.length > TUTOR_LIMITS.maxInput * 2) return json({ error: "long" }, 413);

  // limits
  if (rateLimited(`ai:min:${clientIp(req)}`, TUTOR_LIMITS.perMinute, 60_000)) return json({ error: "rate" }, 429);
  const q = await quotaOf(req, me, s);
  if (!q.limit) return json({ error: me ? "verify" : "login" }, me ? 403 : 401);
  const ipKey = `${app ? "app" : "web"}:${clientIp(req)}`;
  const took = q.scope === "user" && me ? await takeUserQuestion(me.id, q.limit) : ipTake(ipKey, q.limit);
  if (!took) return json({ error: q.pro ? "limit" : app ? "pro" : me ? "limit" : "login", quota: { limit: q.limit, left: 0, pro: q.pro } }, app && !q.pro ? 402 : me || app ? 429 : 401);
  const refund = () => (q.scope === "user" && me ? refundUserQuestion(me.id) : ipRefund(ipKey));
  if (globalDay.day !== today()) globalDay = { day: today(), n: 0 };
  if (globalDay.n >= TUTOR_LIMITS.globalPerDay) { await refund(); return json({ error: "busy" }, 503); }

  const address: Address = b.address === "brother" || b.address === "sister" ? b.address : null;
  const tradition: Tradition = b.tradition === "sunni" || b.tradition === "shia" ? b.tradition : "all";
  const context = cleanContext(b.context);
  const started = Date.now();
  let r: TutorResult;
  try {
    r = await askTutor(
      { question, history, lang: locale, address, tradition, context, names: [me?.name, me?.email?.split("@")[0]] },
      { chat: openAiChat(key), moderate: openAiModeration(key), corpus, verseDocs },
    );
  } catch (e) {
    await refund();
    const quota = e instanceof QuotaError;
    console.error("tutor", quota ? "provider quota" : e);
    void logQuestion({ source: app ? "app" : "web", locale, context: context?.kind, outcome: quota ? "provider_quota" : "error", ms: Date.now() - started, model: tutorModel() });
    return json({ error: quota ? "busy" : "ai" }, quota ? 503 : 502);
  }
  if (!r.cached && r.tokensIn) globalDay.n += 1;
  void logQuestion({ source: app ? "app" : "web", locale, context: context?.kind, category: r.category, outcome: r.status, cached: r.cached, passages: r.passages, tokensIn: r.tokensIn, tokensOut: r.tokensOut, ms: Date.now() - started, model: tutorModel() });

  const scripture = r.verses.length || r.hadith.length ? await resolveScripture(r.verses, r.hadith, locale).catch(() => ({ verses: [], hadith: [] })) : { verses: [], hadith: [] };
  const left = Math.max(0, q.limit - q.used - 1);
  if (v2) {
    return json({
      id: r.id, status: r.status, answer: r.answer, notice: r.notice ?? null, sources: r.sources, related: r.related, followups: r.followups,
      verses: r.verses, hadith: r.hadith, scripture, cached: !!r.cached, quota: { limit: q.limit, left, pro: q.pro },
    });
  }
  // v1 clients render one Markdown text: sources and the scholar note are written under the answer
  const list = (r.sources.length ? r.sources : r.related).map((x) => `${x.n}. [${x.title}](${x.link})`).join("\n");
  const refs = [...r.verses.map((k) => `Quran ${k}`), ...scripture.hadith.map((h) => h.reference)].join(" · ");
  const answer = [r.answer, refs, list, r.notice].filter(Boolean).join("\n\n");
  return json({ answer });
}
