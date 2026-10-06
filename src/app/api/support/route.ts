import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { clientIp, isHttps, json, rateLimited, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

// Voluntary support via Ziina (UAE). With ZIINA_API_KEY set, a payment intent is created for the chosen amount and the
// visitor is sent to Ziina's secure checkout; otherwise the page shows the owner's personal Ziina payment link
// (SUPPORT_URL, default pay.ziina.com/icslfze) with a QR code for paying from the phone.
// Keys live only in /srv/tafsirflow/.env.app. Card data never touches this server.
const LINK = process.env.SUPPORT_URL || "https://pay.ziina.com/icslfze";
let qr: Promise<string> | null = null;

export async function GET() {
  qr ??= QRCode.toString(LINK, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0e221b", light: "#ffffff" } }).catch(() => "");
  return json({ api: !!process.env.ZIINA_API_KEY, link: LINK, qr: await qr });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const key = process.env.ZIINA_API_KEY;
  if (!key) return json({ error: "off" }, 503);
  if (rateLimited(`ziina:${clientIp(req)}`, 10, 10 * 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { amount?: number; locale?: string };
  const aed = Math.round(Number(b.amount));
  if (!Number.isFinite(aed) || aed < 5 || aed > 20000) return json({ error: "amount" }, 400);
  const loc = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";
  const origin = process.env.SITE_URL ?? `${isHttps(req) ? "https" : "http"}://${req.headers.get("host")}`;
  try {
    const r = await fetch("https://api-v2.ziina.com/api/payment_intent", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        amount: aed * 100, // fils
        currency_code: "AED",
        message: "Quran Masterclass – support",
        success_url: `${origin}/${loc}/support?thanks=1`,
        cancel_url: `${origin}/${loc}/support`,
        test: process.env.ZIINA_TEST === "1",
      }),
      signal: AbortSignal.timeout(10000),
    });
    const d = (await r.json().catch(() => ({}))) as { redirect_url?: string };
    if (!r.ok || !d.redirect_url?.startsWith("https://")) { console.error("Ziina", r.status, d); return json({ error: "ziina" }, 502); }
    return json({ url: d.redirect_url });
  } catch (e) {
    console.error("Ziina", e);
    return json({ error: "ziina" }, 502);
  }
}
