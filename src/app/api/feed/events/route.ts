import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { fromApp } from "@/lib/appRequest";

export const dynamic = "force-dynamic";

// anonymous funnel of the app's feed offers: daily aggregates {variant, offer, imp, tap, buy, date} sent once per day.
// No user id, no device id, nothing stored about the sender; counts are added per day, variant and offer.
const ID = /^[a-z0-9][a-z0-9._-]{0,47}$/i;
const count = (v: unknown) => Math.min(10_000, Math.max(0, Math.round(Number(v) || 0)));

export async function POST(req: NextRequest) {
  const p = pool();
  if (!p) return json({ ok: false }, 503);
  if (!fromApp(req) && !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (rateLimited(`feedev:${clientIp(req)}`, 10, 60 * 60_000)) return json({ error: "rate" }, 429);
  const raw = await req.text();
  if (raw.length > 50_000) return json({ error: "too large" }, 413);
  let b: { events?: unknown };
  try { b = JSON.parse(raw || "{}"); } catch { return json({ error: "bad request" }, 400); }
  const now = Date.now();
  const rows = (Array.isArray(b.events) ? b.events : []).slice(0, 200).flatMap((e) => {
    const x = (e ?? {}) as Record<string, unknown>;
    const date = typeof x.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x.date) ? x.date : "";
    const t = date ? Date.parse(`${date}T00:00:00Z`) : NaN;
    if (!(t <= now && t >= now - 8 * 86400000)) return [];
    if (typeof x.variant !== "string" || !ID.test(x.variant) || typeof x.offer !== "string" || !ID.test(x.offer)) return [];
    const r = { date, variant: x.variant, offer: x.offer, imp: count(x.imp), tap: count(x.tap), buy: count(x.buy) };
    return r.imp || r.tap || r.buy ? [r] : [];
  });
  if (!rows.length) return json({ ok: true });
  try {
    for (const r of rows) {
      await p.query(
        `INSERT INTO feed_offer_stats (day, variant, offer, imp, tap, buy) VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (day, variant, offer) DO UPDATE SET imp = feed_offer_stats.imp + $4, tap = feed_offer_stats.tap + $5, buy = feed_offer_stats.buy + $6`,
        [r.date, r.variant, r.offer, r.imp, r.tap, r.buy],
      );
    }
  } catch {
    return json({ ok: false }, 500);
  }
  return json({ ok: true });
}
