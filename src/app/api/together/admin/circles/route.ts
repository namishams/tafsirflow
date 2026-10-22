import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { adminGate, logAdmin } from "@/lib/talents";

export const dynamic = "force-dynamic";

// Moderation of study circles (admins): GET the circles with open reports or a suspension (name, kind, leader,
// members, open reports). POST { id, action: suspend|restore }; every step goes to community_admin_actions.
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT ci.id, ci.name, ci.kind, ci.created_at, ci.suspended_at, c.username AS leader,
            (SELECT count(*)::int FROM together_circle_members m WHERE m.circle_id = ci.id AND m.status = 'member') AS members,
            (SELECT count(*)::int FROM community_reports r WHERE r.target_type = 'circle' AND r.target_id = ci.id AND r.status = 'open') AS reports
       FROM together_circles ci LEFT JOIN community_profiles c ON c.user_id = ci.owner_id
      WHERE ci.suspended_at IS NOT NULL OR EXISTS (SELECT 1 FROM community_reports r WHERE r.target_type = 'circle' AND r.target_id = ci.id)
      ORDER BY reports DESC, ci.created_at DESC LIMIT 100`,
  );
  return json({ circles: r.rows.map((x) => ({ id: String(x.id), name: x.name, kind: x.kind, leader: x.leader ?? null, members: Number(x.members), reports: Number(x.reports), suspended: !!x.suspended_at, at: x.created_at })) });
}

export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown };
  const id = Number(b.id);
  if (!Number.isSafeInteger(id) || id <= 0 || (b.action !== "suspend" && b.action !== "restore")) return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const r = await p.query(`UPDATE together_circles SET suspended_at = ${b.action === "suspend" ? "now()" : "NULL"} WHERE id = $1 RETURNING owner_id`, [id]);
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  if (b.action === "suspend") await p.query("UPDATE community_reports SET status = 'resolved', handled_by = $2, handled_at = now() WHERE target_type = 'circle' AND target_id = $1 AND status = 'open'", [id, g.me.id]);
  await logAdmin(g.me.id, `circle_${b.action}`, Number(r.rows[0].owner_id), { circle: id });
  return json({ ok: true });
}
