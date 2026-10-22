import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json, rateLimited } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { gate, badText } from "@/lib/communityProfiles";
import { NO_STORE } from "@/lib/talents";
import { cleanChannel, starByUsername, starClaimed, starInviteValid } from "@/lib/stars";

export const dynamic = "force-dynamic";

// GET: public state of a star profile { username, reciter, claimed, invited (when ?invite= is valid), pending (own
// open request) }. POST { role: self | team, channel, message, invite? }: a signed-in member with a Quran Talents
// profile asks to take over the profile; an admin decides in /admin/talents (tab "Stars") or in the app.
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = starByUsername(slug.toLowerCase());
  if (!s) return json({ error: "not_found" }, 404);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "ip";
  if (rateLimited(`star-get:${ip}`, 120, 60_000)) return json({ error: "slow_down" }, 429);
  const me = await currentUser().catch(() => null);
  let pending = false;
  if (me && pool()) {
    try { pending = !!(await pool()!.query("SELECT 1 FROM star_claims WHERE star_slug = $1 AND user_id = $2 AND status = 'pending'", [s.username, me.id])).rows[0]; } catch { /* table missing */ }
  }
  return json({ username: s.username, reciter: s.reciter.slug, claimed: await starClaimed(s.username), invited: starInviteValid(s.username, req.nextUrl.searchParams.get("invite")), pending }, 200, NO_STORE);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = starByUsername(slug.toLowerCase());
  if (!s) return json({ error: "not_found" }, 404);
  const g = await gate(req, "star-claim", 5, 60 * 60_000, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const role = b.role === "self" || b.role === "team" ? b.role : null;
  const channel = cleanChannel(b.channel);
  const message = typeof b.message === "string" ? b.message.replace(/\r/g, "").trim().slice(0, 1000) : "";
  if (!role) return json({ error: "bad_request" }, 400);
  if (!channel) return json({ error: "channel" }, 400);
  if (await badText(message)) return json({ error: "text_not_allowed" }, 400);
  const p = pool()!;
  if (!(await p.query("SELECT 1 FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0]) return json({ error: "profile_needed" }, 409);
  const st = (await p.query("SELECT claimed_by FROM star_profiles WHERE slug = $1", [s.username])).rows[0];
  if (!st) return json({ error: "not_found" }, 404);
  if (st.claimed_by) return json({ error: "claimed" }, 409);
  const invited = starInviteValid(s.username, b.invite);
  await p.query(
    `INSERT INTO star_claims (star_slug, user_id, role, channel_url, message, invited) VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (star_slug, user_id) WHERE status = 'pending' DO UPDATE SET role = EXCLUDED.role, channel_url = EXCLUDED.channel_url, message = EXCLUDED.message, invited = star_claims.invited OR EXCLUDED.invited`,
    [s.username, g.me.id, role, channel, message, invited],
  );
  return json({ ok: true }, 200, NO_STORE);
}
