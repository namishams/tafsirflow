import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { bad, teacherGate } from "@/lib/teacherShare";

export const dynamic = "force-dynamic";

// The student answers: "accept" (an assigned portion becomes a wird item on the device), "dismiss" (also marks a nudge
// as read), "done" (an accepted portion was recited). The teacher withdraws an open suggestion with DELETE.
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "answer-s", 120, true);
  if (g.res) return g.res;
  const id = Number((await ctx.params).id);
  const b = (await req.json().catch(() => ({}))) as { action?: string };
  if (!Number.isInteger(id)) return bad("bad_request");
  const p = pool()!;
  const next = b.action === "accept" ? ["accepted", "open", "assign"] : b.action === "dismiss" ? ["dismissed", "open", null] : b.action === "done" ? ["done", "accepted", "assign"] : null;
  if (!next) return bad("bad_request");
  const u = await p.query(
    `UPDATE teacher_suggestions s SET status = $3, responded_at = now() FROM teacher_shares h
      WHERE s.id = $1 AND h.id = s.share_id AND h.student_id = $2 AND s.status = $4 AND ($5::text IS NULL OR s.kind = $5) RETURNING s.id`,
    [id, g.me.id, next[0], next[1], next[2]],
  );
  return u.rows[0] ? json({ ok: true }) : bad("not_found", 404);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "withdraw", 60, true);
  if (g.res) return g.res;
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return bad("bad_request");
  const d = await pool()!.query("DELETE FROM teacher_suggestions s USING teacher_shares h WHERE s.id = $1 AND h.id = s.share_id AND h.teacher_id = $2 AND s.status = 'open'", [id, g.me.id]);
  return d.rowCount ? json({ ok: true }) : bad("not_found", 404);
}
