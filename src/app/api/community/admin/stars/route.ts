import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate, line, logAdmin } from "@/lib/talents";
import { INVITE_DAYS, starByUsername, starInviteToken } from "@/lib/stars";
import { refreshBadges } from "@/lib/talentBadges";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

// Star profiles for admins. GET: open claims (oldest first) and all star profiles with their state.
// POST { id, action: approve | reject, reason }: one click. Approve links the account to the star profile, moves the
// reserved username to it and sets the "star" badge; other open claims for the same star are rejected.
// POST { invite: <username> }: a personal claim link (signed, 30 days) for the owner to send with his message.
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const p = pool()!;
  const claims = await p.query(
    `SELECT s.id, s.star_slug, s.role, s.channel_url, s.message, s.invited, s.created_at, c.username, c.display_name
       FROM star_claims s LEFT JOIN community_profiles c ON c.user_id = s.user_id
      WHERE s.status = 'pending' ORDER BY s.invited DESC, s.created_at ASC LIMIT 100`,
  );
  const stars = await p.query("SELECT sp.slug, sp.display_name, sp.country, sp.verified_at, c.username AS claimed_username FROM star_profiles sp LEFT JOIN community_profiles c ON c.user_id = sp.claimed_by ORDER BY sp.display_name");
  return json({
    claims: claims.rows.map((x) => ({
      id: String(x.id), star: x.star_slug, starName: starByUsername(x.star_slug)?.reciter.name ?? x.star_slug, role: x.role, channel: x.channel_url,
      message: x.message, invited: !!x.invited, at: x.created_at, username: x.username, name: x.display_name,
    })),
    stars: stars.rows.map((x) => ({ username: x.slug, name: x.display_name, country: x.country, claimedBy: x.claimed_username ?? null, verifiedAt: x.verified_at })),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown; reason?: unknown; invite?: unknown; locale?: unknown };
  if (typeof b.invite === "string") {
    const s = starByUsername(b.invite);
    if (!s) return json({ error: "not_found" }, 404);
    const loc = typeof b.locale === "string" && /^[a-z]{2}$/.test(b.locale) ? b.locale : "en";
    const link = `${SITE}/${loc}/talents/${s.username}?invite=${starInviteToken(s.username)}`;
    await logAdmin(g.me.id, "star_invite", null, { star: s.username });
    return json({ link, days: INVITE_DAYS }, 200, NO_STORE);
  }
  if (typeof b.id !== "string" || !/^\d{1,18}$/.test(b.id) || (b.action !== "approve" && b.action !== "reject")) return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const c = await p.connect();
  let userId: number;
  try {
    await c.query("BEGIN");
    const cl = (await c.query("SELECT id, star_slug, user_id FROM star_claims WHERE id = $1 AND status = 'pending' FOR UPDATE", [b.id])).rows[0];
    if (!cl) { await c.query("ROLLBACK"); return json({ error: "not_found" }, 404); }
    userId = Number(cl.user_id);
    if (b.action === "reject") {
      await c.query("UPDATE star_claims SET status = 'rejected', reject_reason = $2, reviewed_by = $3, reviewed_at = now() WHERE id = $1", [b.id, line(b.reason, 300), g.me.id]);
    } else {
      const sp = (await c.query("SELECT claimed_by FROM star_profiles WHERE slug = $1 FOR UPDATE", [cl.star_slug])).rows[0];
      if (!sp || sp.claimed_by) { await c.query("ROLLBACK"); return json({ error: "claimed" }, 409); }
      const holder = (await c.query("SELECT user_id FROM community_profiles WHERE username = $1", [cl.star_slug])).rows[0];
      if (holder && Number(holder.user_id) !== userId) { await c.query("ROLLBACK"); return json({ error: "username_taken" }, 409); }
      if (!(await c.query("SELECT 1 FROM community_profiles WHERE user_id = $1", [userId])).rows[0]) { await c.query("ROLLBACK"); return json({ error: "profile_needed" }, 409); }
      if ((await c.query("SELECT 1 FROM star_profiles WHERE claimed_by = $1", [userId])).rows[0]) { await c.query("ROLLBACK"); return json({ error: "already_star" }, 409); }
      await c.query("UPDATE star_claims SET status = 'approved', reviewed_by = $2, reviewed_at = now() WHERE id = $1", [b.id, g.me.id]);
      await c.query("UPDATE star_claims SET status = 'rejected', reject_reason = 'another request was approved', reviewed_by = $2, reviewed_at = now() WHERE star_slug = $1 AND status = 'pending'", [cl.star_slug, g.me.id]);
      await c.query("UPDATE star_profiles SET claimed_by = $2, verified_at = now() WHERE slug = $1", [cl.star_slug, userId]);
      await c.query("UPDATE community_profiles SET username = $2, badge = 'star' WHERE user_id = $1", [userId, cl.star_slug]);
    }
    await c.query("COMMIT");
  } catch (e) {
    await c.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    c.release();
  }
  if (b.action === "approve") await refreshBadges(userId).catch(() => null);
  await logAdmin(g.me.id, `star_${b.action}`, userId, { claim: Number(b.id) });
  return json({ ok: true }, 200, NO_STORE);
}
