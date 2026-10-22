import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { clientIp, isHttps, json, rateLimited, sameOrigin } from "@/lib/http";
import { MAX_AED, MIN_AED, createPaymentIntent, supportLink, ziinaConfigured } from "@/lib/ziina";
import { cleanName, confirmFromZiina, createPending, nameRejected } from "@/lib/supporters";

export const dynamic = "force-dynamic";

// Voluntary support via Ziina (UAE). With ZIINA_API_KEY in the server environment a payment intent is created for the
// chosen amount and the visitor goes to Ziina's checkout; without it the page shows the personal Ziina payment link
// (SUPPORT_URL) with a QR code. The key lives only in /srv/tafsirflow/.env.app and never leaves the server.
// Support payments unlock nothing. Ziina is the record of the payment; this server keeps only the optional supporters-list
// entry (src/lib/supporters.ts: display name, company, opt-in, amount, status), never card data or an email address.
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
    const s = await confirmFromZiina(pi); // also marks the supporters-list row paid
    return json({ status: s });
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
  const b = (await req.json().catch(() => ({}))) as { amount?: number; locale?: string; name?: string; company?: string; listed?: boolean };
  const displayName = cleanName(b.name, 60);
  const company = cleanName(b.company, 80);
  const listed = b.listed === true;
  if (listed && (nameRejected(displayName) || nameRejected(company))) return json({ error: "name" }, 400);
  const aed = Math.round(Number(b.amount));
  if (!Number.isFinite(aed) || aed < MIN_AED || aed > MAX_AED) return json({ error: "amount" }, 400);
  const loc = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : "en";
  const origin = (process.env.SITE_URL || `${isHttps(req) ? "https" : "http"}://${req.headers.get("host")}`).replace(/\/$/, "");
  const page = `${origin}/${loc}/support`;
  const r = await createPaymentIntent({
    amountAed: aed,
    message: "Quran Masterclass – voluntary support payment to ICSL FZE",
    successUrl: `${page}?pi={PAYMENT_INTENT_ID}`, // Ziina fills in the id; the page then asks this route for the real status
    cancelUrl: `${page}?payment=cancelled`,
    failureUrl: `${page}?payment=failed`,
  });
  if (!r.ok) { console.error("Support: Ziina payment could not be created –", r.reason); return json({ error: "ziina" }, 502); }
  await createPending({ paymentIntentId: r.value.id, displayName: listed ? displayName : "", company: listed ? company : "", listed, amountMinor: r.value.amount || aed * 100, currency: r.value.currencyCode || "AED" });
  return json({ url: r.value.redirectUrl });
}
