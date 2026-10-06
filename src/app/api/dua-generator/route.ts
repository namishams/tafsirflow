import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { PLAN, TOPICS, type Topic } from "@/lib/duaGenerator";
import { getResources, getVerseByKey, pickTranslation } from "@/lib/quran";

export const dynamic = "force-dynamic";
const anonPerDay = () => Math.max(0, Number(process.env.ASSISTANT_ANON_PER_DAY ?? 5) || 0);

// Quran duas for a concern (Arabic + translation in the reader's language)
export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic") as Topic;
  const locale = /^[a-z]{2}$/.test(req.nextUrl.searchParams.get("locale") ?? "") ? req.nextUrl.searchParams.get("locale")! : "en";
  if (!TOPICS.includes(topic)) return json({ error: "bad request" }, 400);
  let tr = 20;
  try { tr = pickTranslation(locale, (await getResources()).translations); } catch { /* default */ }
  const verses = await Promise.all(PLAN[topic].quran.map(async (k) => { try { const v = await getVerseByKey(k, locale, tr); return { key: k, ar: v.text_uthmani, tr: v.translation }; } catch { return null; } }));
  return json({ quran: verses.filter(Boolean), ai: !!process.env.OPENAI_API_KEY }, 200, { "Cache-Control": "public, s-maxage=3600" });
}

// A personal dua in the reader's own language, phrased with care (optional; needs the server key)
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return json({ error: "off" }, 503);
  const me = await currentUser();
  if (!(me && me.emailVerified)) {
    const n = anonPerDay();
    if (!n || rateLimited(`dua:anon:${clientIp(req)}`, n, 24 * 60 * 60_000)) return json({ error: me ? "verify" : "login" }, me ? 403 : 401);
  } else if (rateLimited(`dua:day:${me.id}`, 30, 24 * 60 * 60_000)) return json({ error: "limit" }, 429);
  if (rateLimited(`dua:min:${clientIp(req)}`, 6, 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { text?: string; topic?: string; who?: string; locale?: string; names?: string[] };
  const text = String(b.text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);
  const locale = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";
  if (text.length < 3 && !TOPICS.includes(b.topic as Topic)) return json({ error: "empty" }, 400);
  const names = (Array.isArray(b.names) ? b.names : []).slice(0, 3).map((n) => String(n).slice(0, 30)).join(", ");
  const system = `You help a Muslim put a personal supplication (dua) into words, in the language with code "${locale}".
Rules: Write only the personal request part, 3 to 6 short sentences, warm, humble and sincere, addressed to Allah ("O Allah" in that language). You may call on these beautiful names of Allah: ${names || "Ar-Rahman, Ar-Rahim"}.
Never quote or invent Quran verses or hadith, never invent rulings, promises or numbers, no Arabic script unless the language is Arabic, no emojis, no headings, no lists. Do not mention artificial intelligence.
If the request asks for something harmful or for harm to others, write instead a short dua for guidance, patience and good for everyone.
The person is praying for: ${b.who && b.who !== "me" ? b.who : "themselves"}.`;
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.6, max_tokens: 260, user: me ? `qm-${me.id}` : "qm-visitor", messages: [{ role: "system", content: system }, { role: "user", content: text || `My concern: ${b.topic}` }] }),
      signal: AbortSignal.timeout(30000),
    });
    const d = (await r.json().catch(() => ({}))) as { choices?: { message?: { content?: string } }[] };
    const out = d.choices?.[0]?.message?.content?.trim();
    if (!r.ok || !out) return json({ error: "ai" }, 502);
    return json({ text: out.slice(0, 1200) });
  } catch {
    return json({ error: "ai" }, 502);
  }
}
