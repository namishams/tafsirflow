import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate, line, logAdmin } from "@/lib/talents";
import { removeMedia } from "@/lib/media";
import { notify } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// Verification applications (admins only). GET: pending, oldest first. POST { id, action: approve | reject, reason }.
// Approve sets the gold tick; the voice sample is deleted either way.
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT v.id, v.real_name, v.country, v.rewaya, v.teacher, v.ijazah_info, v.created_at, v.sample_path IS NOT NULL AS has_sample,
            c.username, c.display_name, c.level, c.reciter_level, c.ijazah_chain
       FROM community_verifications v LEFT JOIN community_profiles c ON c.user_id = v.user_id
      WHERE v.status = 'pending' ORDER BY v.created_at ASC LIMIT 100`,
  );
  return json({
    applications: r.rows.map((x) => ({
      id: String(x.id), realName: x.real_name, country: x.country, rewaya: x.rewaya, teacher: x.teacher, ijazahInfo: x.ijazah_info, at: x.created_at,
      sample: x.has_sample ? `/api/community/admin/verifications/${x.id}/sample` : null,
      username: x.username, name: x.display_name, level: x.level, reciterLevel: Number(x.reciter_level ?? 0), ijazahChain: x.ijazah_chain ?? "",
    })),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown; reason?: unknown };
  if (typeof b.id !== "string" || !/^\d{1,18}$/.test(b.id) || (b.action !== "approve" && b.action !== "reject")) return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const v = (await p.query(
    "UPDATE community_verifications SET status = $2, reject_reason = $3, reviewed_by = $4, reviewed_at = now() WHERE id = $1 AND status = 'pending' RETURNING user_id, sample_path",
    [b.id, b.action === "approve" ? "approved" : "rejected", b.action === "reject" ? line(b.reason, 300) : "", g.me.id],
  )).rows[0];
  if (!v) return json({ error: "not_found" }, 404);
  if (b.action === "approve") {
    await p.query("UPDATE community_profiles SET verified = true, verified_by = $2, verified_at = now() WHERE user_id = $1", [v.user_id, g.me.id]);
  }
  void notify(v.user_id, b.action === "approve" ? "verified" : "verification_rejected", null);
  await removeMedia(v.sample_path);
  await p.query("UPDATE community_verifications SET sample_path = NULL WHERE id = $1", [b.id]);
  await logAdmin(g.me.id, `verification_${b.action}`, Number(v.user_id), { application: Number(b.id) });
  return json({ ok: true }, 200, NO_STORE);
}
