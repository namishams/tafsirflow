import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { bad, teacherGate } from "@/lib/teacherShare";

export const dynamic = "force-dynamic";

// PATCH { action: "accept" | "decline" } – the teacher answers an invitation (decline deletes it).
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "answer", 60, true);
  if (g.res) return g.res;
  const id = Number((await ctx.params).id);
  const b = (await req.json().catch(() => ({}))) as { action?: string };
  if (!Number.isInteger(id) || (b.action !== "accept" && b.action !== "decline")) return bad("bad_request");
  const p = pool()!;
  if (b.action === "decline") {
    const d = await p.query("DELETE FROM teacher_shares WHERE id = $1 AND teacher_id = $2 AND status = 'pending'", [id, g.me.id]);
    return d.rowCount ? json({ ok: true }) : bad("not_found", 404);
  }
  const n = await p.query("SELECT count(*)::int AS n FROM teacher_shares WHERE teacher_id = $1 AND status = 'active'", [g.me.id]);
  if (Number(n.rows[0].n) >= 200) return bad("too_many_students", 409);
  const u = await p.query("UPDATE teacher_shares SET status = 'active', accepted_at = now() WHERE id = $1 AND teacher_id = $2 AND status = 'pending' RETURNING id", [id, g.me.id]);
  return u.rows[0] ? json({ ok: true, status: "active" }) : bad("not_found", 404);
}

// DELETE – either side ends the link. The row, the snapshot and all suggestions are deleted (revoking = deleting the server copy).
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "end", 60, true);
  if (g.res) return g.res;
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return bad("bad_request");
  const d = await pool()!.query("DELETE FROM teacher_shares WHERE id = $1 AND (student_id = $2 OR teacher_id = $2)", [id, g.me.id]);
  return d.rowCount ? json({ ok: true }) : bad("not_found", 404);
}
