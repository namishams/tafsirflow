import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { PUBLIC_SITE, SITE } from "@/lib/site";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// Official star via YouTube: POST { target: app | web, locale } returns a one-time URL (10 minutes) that opens Google's
// consent screen in the browser. Needs GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET; otherwise 503.
export async function POST(req: NextRequest) {
  const g = await talentGate(req, "official", 10, { windowMs: 60 * 60_000, write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  if (!process.env.GOOGLE_OAUTH_CLIENT_ID || !process.env.GOOGLE_OAUTH_CLIENT_SECRET) return json({ error: "official_unavailable" }, 503);
  const b = (await req.json().catch(() => ({}))) as { target?: unknown; locale?: unknown };
  const target = b.target === "web" ? "web" : "app";
  const locale = typeof b.locale === "string" && /^[a-z]{2}$/.test(b.locale) ? b.locale : "en";
  const ticket = crypto.randomBytes(24).toString("base64url");
  const hash = crypto.createHash("sha256").update(ticket).digest("hex");
  const p = pool()!;
  await p.query("DELETE FROM community_oauth_tickets WHERE expires_at < now() - interval '1 day'");
  await p.query("INSERT INTO community_oauth_tickets (ticket_hash, user_id, target, locale, expires_at) VALUES ($1,$2,$3,$4, now() + interval '10 minutes')", [hash, g.me.id, target, locale]);
  const base = SITE.startsWith("http://localhost") ? SITE : PUBLIC_SITE;
  return json({ url: `${base}/api/community/official/start?ticket=${ticket}` }, 200, NO_STORE);
}
