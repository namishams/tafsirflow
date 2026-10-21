import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { removeMedia } from "@/lib/media";
import { bad, isMaster, mentorGate } from "../../_lib/mentoring";

export const dynamic = "force-dynamic";

// { action: "accept" | "decline" } by the master on a pending request; { action: "end" } by either side.
// Ending withdraws the student's unanswered recordings (their files are deleted).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await mentorGate(req, "link-act", 60, true);
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return bad("not_found", 404);
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const p = pool()!;
  const r = await p.query("SELECT master_id, student_id, status FROM mentoring_links WHERE id = $1 AND (master_id = $2 OR student_id = $2)", [id, g.me.id]);
  const l = r.rows[0];
  if (!l) return bad("not_found", 404);
  const isMine = Number(l.master_id) === g.me.id;
  if (body.action === "accept" || body.action === "decline") {
    if (!isMine || l.status !== "pending") return bad("not_allowed", 403);
    if (body.action === "accept" && !(await isMaster(g.me.id))) return bad("not_master", 403);
    await p.query("UPDATE mentoring_links SET status = $2, responded_at = now() WHERE id = $1", [id, body.action === "accept" ? "accepted" : "declined"]);
    return json({ ok: true });
  }
  if (body.action === "end") {
    if (!["pending", "accepted"].includes(l.status)) return bad("not_allowed", 403);
    await p.query("UPDATE mentoring_links SET status = 'ended', responded_at = now() WHERE id = $1", [id]);
    const open = await p.query(
      "UPDATE mentoring_submissions SET status = 'withdrawn', deleted_at = now() WHERE master_id = $1 AND student_id = $2 AND status = 'pending' RETURNING id, media_path",
      [l.master_id, l.student_id],
    );
    for (const x of open.rows) { await removeMedia(x.media_path); await p.query("UPDATE mentoring_submissions SET media_path = NULL WHERE id = $1", [x.id]); }
    return json({ ok: true });
  }
  return bad("bad_request");
}
