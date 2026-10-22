import { NextRequest } from "next/server";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { getSettings } from "@/lib/settings";
import { TUTOR_CONSENT_VERSION, personaFor, tutorModel } from "@/lib/tutor/config";
import { openAiChat, QuotaError } from "@/lib/tutor/openai";
import { tailorPath } from "@/lib/tutor/path";
import { logQuestion } from "@/lib/tutor/store";

export const dynamic = "force-dynamic";

// Onboarding, optional last step "Ask Dalil to tailor your plan": the onboarding answers (option ids only, no name, no
// e-mail) → 3–5 steps chosen from the platform's own catalogue (lib/tutor/path.ts). Needs the tutor consent; does not
// count against the daily questions, but is limited to 3 per IP and day.
const seen = new Map<string, { day: string; n: number }>();

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const key = process.env.OPENAI_API_KEY;
  const s = await getSettings();
  if (!key || !s.features.assistant) return json({ error: "off" }, 503);
  const b = (await req.json().catch(() => ({}))) as { answers?: Record<string, unknown>; locale?: string; address?: string; persona?: string; consent?: { v?: number; age?: string } };
  if (!b.consent?.v || Number(b.consent.v) < TUTOR_CONSENT_VERSION || (b.consent.age !== "13plus" && b.consent.age !== "parent")) return json({ error: "consent" }, 428);
  if (rateLimited(`ai:min:${clientIp(req)}`, 6, 60_000)) return json({ error: "rate" }, 429);
  const day = new Date().toISOString().slice(0, 10), ip = clientIp(req);
  const e = seen.get(ip);
  const n = e && e.day === day ? e.n : 0;
  if (n >= 3) return json({ error: "limit" }, 429);
  seen.set(ip, { day, n: n + 1 });
  if (seen.size > 20_000) for (const [k, v] of seen) if (v.day !== day) seen.delete(k);

  const answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(b.answers ?? {})) if (typeof v === "string" || Array.isArray(v)) answers[k] = Array.isArray(v) ? v.map(String).join(",") : v;
  const locale = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";
  const address = b.address === "brother" || b.address === "sister" ? b.address : null;
  const started = Date.now();
  try {
    const r = await tailorPath(answers, { lang: locale, address, persona: personaFor(b.persona, address) }, openAiChat(key));
    void logQuestion({ source: req.headers.get("x-qmc-app") ? "app" : "web", locale, context: "onboarding", category: "path", outcome: r ? "path" : "path_empty", tokensIn: r?.tokensIn, tokensOut: r?.tokensOut, ms: Date.now() - started, model: tutorModel() });
    if (!r) return json({ error: "empty" }, 502);
    return json({ intro: r.intro, steps: r.steps });
  } catch (err) {
    console.error("tutor path", err);
    return json({ error: err instanceof QuotaError ? "busy" : "ai" }, err instanceof QuotaError ? 503 : 502);
  }
}
