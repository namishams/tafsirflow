import { NextRequest } from "next/server";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { scrub } from "@/lib/tutor/privacy";
import { saveReport } from "@/lib/tutor/store";

export const dynamic = "force-dynamic";

// "Report this answer" (App Review 1.2 / AI content): the learner's device sends the answer it shows and the question it
// asked; both are scrubbed of personal data again and stored WITHOUT the account or IP for the admin to review
// (table tutor_reports, deleted after 90 days).
const REASONS = ["wrong", "source", "offensive", "ruling", "other"];

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`ai:report:${clientIp(req)}`, 12, 60 * 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { id?: string; reason?: string; note?: string; question?: string; answer?: string; sources?: string[]; locale?: string };
  const id = String(b.id ?? "").replace(/[^\w-]/g, "").slice(0, 32);
  if (!id || !REASONS.includes(String(b.reason))) return json({ error: "bad" }, 400);
  const me = await currentUser().catch(() => null);
  const names = [me?.name, me?.email?.split("@")[0]];
  try {
    await saveReport({
      answerId: id, reason: String(b.reason), locale: /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en",
      note: b.note ? scrub(String(b.note).slice(0, 500), names) : undefined,
      question: b.question ? scrub(String(b.question).slice(0, 1000), names) : undefined,
      answer: b.answer ? String(b.answer).slice(0, 5000) : undefined,
      sources: Array.isArray(b.sources) ? b.sources.map(String).join(" | ").slice(0, 1000) : undefined,
    });
  } catch (e) {
    console.error("tutor report", e);
    return json({ error: "save" }, 500);
  }
  return json({ ok: true });
}
