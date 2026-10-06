import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { ASSISTANT_LIMITS, ASSISTANT_RULES } from "@/lib/assistant";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

// The OpenAI key lives only in the server environment (OPENAI_API_KEY in /srv/tafsirflow/.env.app) – never in the browser or the repository.
export function GET() {
  return json({ enabled: !!process.env.OPENAI_API_KEY });
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const key = process.env.OPENAI_API_KEY;
  if (!key) return json({ error: "off" }, 503);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (!me.emailVerified) return json({ error: "verify" }, 403);
  // cost and abuse protection: per account per day, per IP per minute
  if (rateLimited(`ai:day:${me.id}`, ASSISTANT_LIMITS.perUserPerDay, 24 * 60 * 60_000)) return json({ error: "limit" }, 429);
  if (rateLimited(`ai:min:${clientIp(req)}`, 8, 60_000)) return json({ error: "rate" }, 429);

  const b = (await req.json().catch(() => ({}))) as { messages?: Msg[]; locale?: string };
  const history = (Array.isArray(b.messages) ? b.messages : [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-ASSISTANT_LIMITS.maxHistory)
    .map((m) => ({ role: m.role, content: m.content.slice(0, ASSISTANT_LIMITS.maxInput) }));
  if (!history.length || history[history.length - 1].role !== "user") return json({ error: "empty" }, 400);
  const locale = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 700,
        user: `qm-${me.id}`,
        messages: [{ role: "system", content: `${ASSISTANT_RULES}\n\nThe website language of this user is "${locale}".` }, ...history],
      }),
      signal: AbortSignal.timeout(45000),
    });
    const d = (await r.json().catch(() => ({}))) as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
    const answer = d.choices?.[0]?.message?.content?.trim();
    if (!r.ok || !answer) { console.error("assistant", r.status, d.error?.message); return json({ error: "ai" }, 502); }
    return json({ answer });
  } catch (e) {
    console.error("assistant", e);
    return json({ error: "ai" }, 502);
  }
}
