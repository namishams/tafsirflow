import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { PLAN, TOPICS, type Topic } from "@/lib/duaGenerator";
import { getResources, getVerseByKey, pickTranslation } from "@/lib/quran";
import { getSettings } from "@/lib/settings";
import { refundDua, spendDua, type Spent } from "@/lib/aiCredits";
import { DIRECTIONS, LENGTHS, OCCASIONS, WHO_J, directionFor, isDuaLang, topicFor, type Direction, type DuaLength, type Occasion, type WhoJ } from "@/lib/duaJourney";
import { NAMES } from "@/lib/duaGenerator";
import { composePersonal, requestOk, type ComposeOut } from "@/lib/duaAi";

export const dynamic = "force-dynamic";

// Quran duas for a concern (Arabic + translation in the reader's language)
export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic") as Topic;
  const locale = /^[a-z]{2}$/.test(req.nextUrl.searchParams.get("locale") ?? "") ? req.nextUrl.searchParams.get("locale")! : "en";
  if (!TOPICS.includes(topic)) return json({ error: "bad request" }, 400);
  let tr = 20;
  try { tr = pickTranslation(locale, (await getResources()).translations); } catch { /* default */ }
  const verses = await Promise.all(PLAN[topic].quran.map(async (k) => { try { const v = await getVerseByKey(k, locale, tr); return { key: k, ar: v.text_uthmani, tr: v.translation }; } catch { return null; } }));
  return json({ quran: verses.filter(Boolean) }, 200, { "Cache-Control": "public, s-maxage=3600" });
}

/** all visitors together (every IP) per day, so a botnet cannot run up the AI bill; env DUA_AI_ANON_GLOBAL_PER_DAY */
const anonGlobalPerDay = () => { const n = Number(process.env.DUA_AI_ANON_GLOBAL_PER_DAY ?? 300); return Number.isFinite(n) && n >= 0 ? n : 300; };

// A personal dua in the reader's own language (optional; needs the server key). Every request, also the old one of
// earlier app builds ({ text, topic, who, locale, names }), goes through the guided journey with all its safeguards.
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const key = process.env.OPENAI_API_KEY;
  const s = await getSettings();
  if (!key || !s.features.duaAi) return json({ error: "off" }, 503);
  const me = await currentUser();
  // in the app a personal dua is paid (a bought credit or one of the duas Pro includes each month)
  const app = !!req.headers.get("x-qmc-app");
  if (app && !me) return json({ error: "login" }, 401);
  if (!app && !(me && me.emailVerified)) {
    const n = s.limits.duaAiAnonPerDay;
    if (!n || rateLimited(`dua:anon:${clientIp(req)}`, n, 24 * 60 * 60_000)) return json({ error: me ? "verify" : "login" }, me ? 403 : 401);
    if (rateLimited("dua:anon:global", anonGlobalPerDay(), 24 * 60 * 60_000)) return json({ error: "limit" }, 429);
  } else if (!app && rateLimited(`dua:day:${me!.id}`, 30, 24 * 60 * 60_000)) return json({ error: "limit" }, 429); // paid app duas: no daily cap, each one costs a credit
  if (rateLimited(`dua:min:${clientIp(req)}`, 6, 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.v !== 2) {
    // earlier app builds: the concern becomes the direction, the rest keeps its meaning
    const text = String(b.text ?? "").replace(/\s+/g, " ").trim();
    if (text.length < 3 && !TOPICS.includes(b.topic as Topic)) return json({ error: "empty" }, 400);
    const direction = directionFor(String(b.topic ?? "")) ?? "heart";
    return journey(key, { ...b, v: 2, direction, who: b.who, text, length: "medium", lang: b.locale, occasion: "closer" }, app, me);
  }
  return journey(key, b, app, me);
}

type Me = Awaited<ReturnType<typeof currentUser>>;
const pick = <T extends string>(list: readonly T[], v: unknown, fallback: T): T => ((list as readonly string[]).includes(String(v)) ? (v as T) : fallback);

async function journey(key: string, b: Record<string, unknown>, app: boolean, me: Me) {
  const direction = pick<Direction>(DIRECTIONS, b.direction, "heart");
  const who = pick<WhoJ>(WHO_J, b.who, "me");
  const occasion = pick<Occasion>(OCCASIONS, b.occasion, "closer");
  const len = pick<DuaLength>(LENGTHS, b.length, "medium");
  const lang = isDuaLang(String(b.lang)) ? String(b.lang) : isDuaLang(String(b.locale)) ? String(b.locale) : "en";
  const text = String(b.text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  const names = (Array.isArray(b.names) ? b.names : []).map(String).filter((n) => n in NAMES).slice(0, 3);
  const topic = topicFor(direction, who);
  // a request for harm is refused before anything is charged; without an answer from moderation nothing is composed
  const pre = await requestOk(key, text);
  if (pre === "harm") return json({ error: "refused" }, 422);
  if (pre === "unchecked") return json({ error: "moderation" }, 503);
  let spent: Spent = null;
  if (app) {
    spent = await spendDua(me!.id, me!.plan === "premium");
    if (!spent) return json({ error: "credits" }, 402);
  }
  const out = await composePersonal(key, { occasion, who, direction, topic, text, len, lang, arabic: !!b.arabic && lang !== "ar", names, user: me ? `qm-${me.id}` : "qm-visitor" })
    .catch((): ComposeOut => ({ ok: false, error: "ai" }));
  if (!out.ok) {
    // every failure gives the credit back (refused, moderation without an answer, deadline, model error)
    if (app) await refundDua(me!.id, spent);
    const status = out.error === "refused" ? 422 : out.error === "moderation" ? 503 : out.error === "timeout" ? 504 : 502;
    return json({ error: out.error }, status);
  }
  // text: the personal words (the field earlier builds read); arabic: the optional Arabic version; ai: always AI
  return json({ v: 2, text: out.personal, arabic: out.arabic ?? null, ai: true, topic, lang });
}
