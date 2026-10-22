import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { gate } from "@/lib/communityProfiles";
import { NO_STORE } from "@/lib/talents";
import { refreshBadges } from "@/lib/talentBadges";
import { assignStar, inTx, reservedByUsername, starInviteId } from "@/lib/stars";

export const dynamic = "force-dynamic";

// POST { invite }: one step for the invited person (owner 22.10.2026). The signed-in account with a valid personal
// invite link (single use, 30 days) takes over the reserved name at once: the username moves, the badge is set, the
// token is used up. No admin approval, because the owner sends the link privately to the right person.
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = reservedByUsername(slug.toLowerCase());
  if (!s) return json({ error: "not_found" }, 404);
  const g = await gate(req, "star-accept", 10, 60 * 60_000, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { invite?: unknown };
  const err = await inTx(async (c) => {
    const id = await starInviteId(s.username, b.invite, c);
    if (!id) return "invite_invalid";
    const used = (await c.query("UPDATE star_invites SET used_at = now(), used_by = $2 WHERE id = $1 AND used_at IS NULL RETURNING id", [id, g.me.id])).rows[0];
    if (!used) return "invite_invalid";
    const e = await assignStar(c, s.username, g.me.id, "invite", null);
    if (e) throw Object.assign(new Error(e), { code: e });
    return null;
  }).catch((e: { code?: string }) => { if (e.code) return e.code; throw e; });
  if (err) return json({ error: err }, err === "invite_invalid" ? 410 : 409);
  await refreshBadges(g.me.id).catch(() => null);
  return json({ ok: true, username: s.username }, 200, NO_STORE);
}
