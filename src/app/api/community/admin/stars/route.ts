import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate, line, logAdmin } from "@/lib/talents";
import { INVITE_DAYS, assignStar, createStarInvite, inTx, reservedByUsername, undoStarAssignment } from "@/lib/stars";
import { refreshBadges } from "@/lib/talentBadges";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

// Star profiles for admins. GET: open claims (oldest first) and all star profiles with their state.
// POST { id, action: approve | reject, reason }: one click. Approve links the account to the star profile, moves the
// reserved username to it and sets the "star" badge; other open claims for the same star are rejected.
// POST { invite: <username> }: a personal, pre-approved invite link (single use, 30 days) for the owner to send privately.
// POST { assign: <username>, email }: assigns the name at once to an existing account. POST { undo: <assignment id> }.
// Every assignment is listed in GET (assignments) and can be undone.
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const p = pool()!;
  const claims = await p.query(
    `SELECT s.id, s.star_slug, s.role, s.channel_url, s.message, s.invited, s.created_at, c.username, c.display_name
       FROM star_claims s LEFT JOIN community_profiles c ON c.user_id = s.user_id
      WHERE s.status = 'pending' ORDER BY s.invited DESC, s.created_at ASC LIMIT 100`,
  );
  const stars = await p.query("SELECT sp.slug, sp.display_name, sp.country, sp.verified_at, c.username AS claimed_username FROM star_profiles sp LEFT JOIN community_profiles c ON c.user_id = sp.claimed_by ORDER BY sp.reciter_id IS NULL, sp.display_name");
  return json({
    claims: claims.rows.map((x) => ({
      id: String(x.id), star: x.star_slug, starName: reservedByUsername(x.star_slug)?.name ?? x.star_slug, role: x.role, channel: x.channel_url,
      message: x.message, invited: !!x.invited, at: x.created_at, username: x.username, name: x.display_name,
    })),
    assignments: (await p.query(
      `SELECT a.id, a.star_slug, a.via, a.created_at, a.undone_at, a.previous_username, c.username FROM star_assignments a
         LEFT JOIN community_profiles c ON c.user_id = a.user_id ORDER BY a.created_at DESC LIMIT 100`,
    )).rows.map((x) => ({ id: String(x.id), star: x.star_slug, via: x.via, at: x.created_at, undoneAt: x.undone_at, previous: x.previous_username, username: x.username })),
    stars: stars.rows.map((x) => ({ username: x.slug, name: x.display_name, country: x.country, claimedBy: x.claimed_username ?? null, verifiedAt: x.verified_at })),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown; reason?: unknown; invite?: unknown; locale?: unknown; assign?: unknown; email?: unknown; undo?: unknown };
  if (typeof b.invite === "string") {
    const s = reservedByUsername(b.invite);
    if (!s) return json({ error: "not_found" }, 404);
    const loc = typeof b.locale === "string" && /^[a-z]{2}$/.test(b.locale) ? b.locale : "en";
    const link = `${SITE}/${loc}/talents/${s.username}?invite=${await createStarInvite(s.username, g.me.id)}`;
    await logAdmin(g.me.id, "star_invite", null, { star: s.username });
    return json({ link, days: INVITE_DAYS }, 200, NO_STORE);
  }
  if (typeof b.assign === "string") {
    const s = reservedByUsername(b.assign);
    const email = typeof b.email === "string" ? b.email.trim().toLowerCase().slice(0, 254) : "";
    if (!s || !email) return json({ error: "bad_request" }, 400);
    const u = (await pool()!.query("SELECT id FROM users WHERE lower(email) = $1", [email])).rows[0];
    if (!u) return json({ error: "no_account" }, 404);
    const err = await inTx((c) => assignStar(c, s.username, Number(u.id), "admin", g.me.id));
    if (err) return json({ error: err }, 409);
    await refreshBadges(Number(u.id)).catch(() => null);
    await logAdmin(g.me.id, "star_assign", Number(u.id), { star: s.username });
    return json({ ok: true }, 200, NO_STORE);
  }
  if (typeof b.undo === "string" && /^\d{1,18}$/.test(b.undo)) {
    const r = await inTx((c) => undoStarAssignment(c, Number(b.undo), g.me.id));
    if (r.error) return json({ error: r.error }, 404);
    if (r.userId) await refreshBadges(r.userId).catch(() => null);
    await logAdmin(g.me.id, "star_undo", r.userId, { assignment: Number(b.undo) });
    return json({ ok: true }, 200, NO_STORE);
  }
  if (typeof b.id !== "string" || !/^\d{1,18}$/.test(b.id) || (b.action !== "approve" && b.action !== "reject")) return json({ error: "bad_request" }, 400);
  const res = await inTx(async (c) => {
    const cl = (await c.query("SELECT id, star_slug, user_id FROM star_claims WHERE id = $1 AND status = 'pending' FOR UPDATE", [b.id])).rows[0];
    if (!cl) return { err: "not_found", userId: 0 };
    const userId = Number(cl.user_id);
    if (b.action === "reject") {
      await c.query("UPDATE star_claims SET status = 'rejected', reject_reason = $2, reviewed_by = $3, reviewed_at = now() WHERE id = $1", [b.id, line(b.reason, 300), g.me.id]);
      return { err: null, userId };
    }
    const err = await assignStar(c, String(cl.star_slug), userId, "claim", g.me.id);
    if (err) throw Object.assign(new Error(err), { code: err });
    return { err: null, userId };
  }).catch((e: { code?: string }) => { if (e.code) return { err: e.code, userId: 0 }; throw e; });
  if (res.err) return json({ error: res.err }, res.err === "not_found" ? 404 : 409);
  const userId = res.userId;
  if (b.action === "approve") await refreshBadges(userId).catch(() => null);
  await logAdmin(g.me.id, `star_${b.action}`, userId, { claim: Number(b.id) });
  return json({ ok: true }, 200, NO_STORE);
}
