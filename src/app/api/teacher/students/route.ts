import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE } from "@/lib/talents";
import { cardsFor, digest, teacherGate, type ServerSnapshot } from "@/lib/teacherShare";

export const dynamic = "force-dynamic";

// Teacher side: all students who invited this member (pending) and who share (active), with the aggregates for the
// dashboard row. Members under 16 are shown only with their first name on the card (the card has no more).
export async function GET(req: NextRequest) {
  const g = await teacherGate(req, "students", 120);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT h.id, h.student_id, h.status, h.parental, h.snapshot, h.synced_at, h.created_at,
            (SELECT count(*)::int FROM teacher_suggestions s WHERE s.share_id = h.id AND s.status = 'open') AS open
       FROM teacher_shares h
      WHERE h.teacher_id = $1
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = h.student_id) OR (b.blocker_id = h.student_id AND b.blocked_id = $1))
      ORDER BY h.created_at DESC LIMIT 300`,
    [g.me.id],
  );
  const cards = await cardsFor(r.rows.map((x) => Number(x.student_id)));
  const students = r.rows.map((x) => ({
    id: String(x.id), status: x.status as "pending" | "active", member: cards.get(Number(x.student_id)) ?? null, since: x.created_at, open: Number(x.open),
    digest: x.status === "active" ? digest(x.snapshot as ServerSnapshot | null, x.synced_at) : null,
  }));
  return json({ students }, 200, NO_STORE);
}
