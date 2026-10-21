import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE } from "@/lib/talents";
import { bad, cardsFor, digest, suggestionJson, teacherGate, type ServerSnapshot } from "@/lib/teacherShare";

export const dynamic = "force-dynamic";

// One student in detail (the whole shared snapshot) and the suggestions sent so far.
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "student", 120);
  if (g.res) return g.res;
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return bad("bad_request");
  const p = pool()!;
  const h = await p.query(
    `SELECT h.id, h.student_id, h.snapshot, h.synced_at FROM teacher_shares h WHERE h.id = $1 AND h.teacher_id = $2 AND h.status = 'active'
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $2 AND b.blocked_id = h.student_id) OR (b.blocker_id = h.student_id AND b.blocked_id = $2))`,
    [id, g.me.id],
  );
  const row = h.rows[0];
  if (!row) return bad("not_found", 404);
  const sug = await p.query("SELECT * FROM teacher_suggestions WHERE share_id = $1 ORDER BY created_at DESC LIMIT 20", [id]);
  const card = (await cardsFor([Number(row.student_id)])).get(Number(row.student_id)) ?? null;
  const snap = row.snapshot as ServerSnapshot | null;
  return json({ id: String(row.id), member: card, snapshot: snap, digest: digest(snap, row.synced_at), syncedAt: row.synced_at, suggestions: sug.rows.map(suggestionJson) }, 200, NO_STORE);
}
