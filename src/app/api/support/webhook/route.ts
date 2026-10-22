import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { json } from "@/lib/http";
import { confirmFromZiina } from "@/lib/supporters";
import { ziinaConfigured } from "@/lib/ziina";

export const dynamic = "force-dynamic";

// Ziina webhook (docs.ziina.com/api-reference/webhook): POST { event, data } with header X-Hmac-Signature = hex
// HMAC-SHA256 of the raw body, keyed with the secret given when the webhook was registered (POST /webhook, one per account).
// Server environment: ZIINA_WEBHOOK_SECRET (required – without it this route refuses everything).
// The body is never trusted for the status: on payment_intent.status.updated the server asks Ziina for the intent again
// (confirmFromZiina), so a forged or replayed call can at most trigger a re-check. Nothing from the body is stored or logged.
export async function POST(req: NextRequest) {
  const secret = process.env.ZIINA_WEBHOOK_SECRET?.trim() || "";
  if (!secret || !ziinaConfigured()) return json({ error: "not_configured" }, 503);
  const raw = await req.text();
  if (raw.length > 64_000) return json({ error: "size" }, 413);
  const sig = (req.headers.get("x-hmac-signature") || "").trim().toLowerCase();
  const want = createHmac("sha256", secret).update(raw).digest("hex");
  if (sig.length !== want.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return json({ error: "signature" }, 401);
  let body: { event?: string; data?: { id?: string } } = {};
  try { body = JSON.parse(raw); } catch { return json({ error: "json" }, 400); }
  if (body.event === "payment_intent.status.updated" && typeof body.data?.id === "string") {
    const s = await confirmFromZiina(body.data.id);
    if (s === "unknown") return json({ error: "retry" }, 502); // Ziina retries up to 3 times
  }
  return json({ ok: true });
}
