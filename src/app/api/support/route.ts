import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { clientIp, isHttps, json, rateLimited, sameOrigin } from "@/lib/http";
import { MAX_AED, MIN_AED, createPaymentIntent, getPaymentIntent, supportLink, ziinaConfigured } from "@/lib/ziina";

export const dynamic = "force-dynamic";

// Voluntary support via Ziina (UAE). With ZIINA_API_KEY in the server environment a payment intent is created for the
// chosen amount and the visitor goes to Ziina's checkout; without it the page shows the personal Ziina payment link
// (SUPPORT_URL) with a QR code. The key lives only in /srv/tafsirflow/.env.app and never leaves the server.
// Donations unlock nothing and are not stored here – Ziina is the record.
const qrs = new Map<string, Promise<string>>();
const qrOf = (link: string) => {
  if (!qrs.has(link)) qrs.set(link, QRCode.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0e221b", light: "#ffffff" } }).catch(() => ""));
  return qrs.get(link)!;
};
let warned = false;

// GET            → what the support page can offer: { api, link, qr }
// GET ?pi=<id>   → status of a payment after the return from Ziina: { status: "completed" | "pending" | "failed" }
export async function GET(req: NextRequest) {
  const pi = req.nextUrl.searchParams.get("pi");
  if (pi) {
    if (rateLimited(`ziina-check:${clientIp(req)}`, 30, 10 * 60_000)) return json({ error: "rate" }, 429);
    if (!ziinaConfigured()) return json({ error: "not_configured" }, 503);
    const r = await getPaymentIntent(pi);
    if (!r.ok) return json({ status: "unknown" });
    const s = r.value.status;
    return json({ status: s === "completed" ? "completed" : s === "failed" || s === "canceled" ? "failed" : "pending" });
  }
  const api = ziinaConfigured();
  if (!api && !warned) { warned = true; console.warn("Support page: ZIINA_API_KEY is not set – showing the Ziina payment link instead of the amount selection."); }
  const link = supportLink();
  return json({ api, link, qr: link ? await qrOf(link) : "" });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (!ziinaConfigured()) return json({ error: "not_configured", message: "Card payment via Ziina is not set up on this server (ZIINA_API_KEY missing)." }, 503);
  if (rateLimited(`ziina:${clientIp(req)}`, 10, 10 * 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { amount?: number; locale?: string };
  const aed = Math.round(Number(b.amount));
  if (!Number.isFinite(aed) || aed < MIN_AED || aed > MAX_AED) return json({ error: "amount" }, 400);
  const loc = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";
  const origin = (process.env.SITE_URL || `${isHttps(req) ? "https" : "http"}://${req.headers.get("host")}`).replace(/\/$/, "");
  const page = `${origin}/${loc}/support`;
  const r = await createPaymentIntent({
    amountAed: aed,
    message: "Quran Masterclass – voluntary support (sadaqa)",
    successUrl: `${page}?pi={PAYMENT_INTENT_ID}`, // Ziina fills in the id; the page then asks this route for the real status
    cancelUrl: `${page}?payment=cancelled`,
    failureUrl: `${page}?payment=failed`,
  });
  if (!r.ok) { console.error("Support: Ziina payment could not be created –", r.reason); return json({ error: "ziina" }, 502); }
  return json({ url: r.value.redirectUrl });
}
