import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { leaveCircle, membership } from "@/lib/together";

export const dynamic = "force-dynamic";

// POST { action: approve|decline|remove, username } (leader) or { action: leave } (any member). When the leader leaves,
// the longest-standing member leads; a circle without members is removed (kept while under review).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "tg-members", 30, { minAge: MIN_POST_AGE, needProfile: true, write: true });
  if (g.res) return g.res;
  const id = Number((await params).id);
  const m = Number.isSafeInteger(id) && id > 0 ? await membership(id, g.me.id) : undefined;
  if (!m) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { action?: unknown; username?: unknown };
  const p = pool()!;
  if (b.action === "leave") {
    await leaveCircle(id, g.me.id);
    return json({ ok: true }, 200, NO_STORE);
  }
  if (m.role !== "leader") return json({ error: "forbidden" }, 403);
  const u = (await p.query("SELECT user_id FROM community_profiles WHERE username = $1", [String(b.username ?? "").toLowerCase().slice(0, 40)])).rows[0];
  if (!u || String(u.user_id) === String(g.me.id)) return json({ error: "not_found" }, 404);
  if (b.action === "approve") await p.query("UPDATE together_circle_members SET status = 'member', joined_at = now() WHERE circle_id = $1 AND user_id = $2 AND status = 'pending'", [id, u.user_id]);
  else if (b.action === "decline" || b.action === "remove") await p.query("DELETE FROM together_circle_members WHERE circle_id = $1 AND user_id = $2 AND role = 'member'", [id, u.user_id]);
  else return json({ error: "bad_request" }, 400);
  return json({ ok: true }, 200, NO_STORE);
}
