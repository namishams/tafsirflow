import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE } from "@/lib/talents";
import { cardsFor, ensureMonthlySeason, isMaster, mentorGate, purgeExpired } from "../_lib/mentoring";

export const dynamic = "force-dynamic";

// The member's mentoring overview: own mentors (as student), own students (as master), open reviews and what the
// member may do (mentor, judge seasons, administer seasons).
export async function GET(req: NextRequest) {
  const g = await mentorGate(req, "me", 120);
  if (g.res) return g.res;
  void purgeExpired();
  await ensureMonthlySeason();
  const p = pool()!;
  const me = g.me.id;
  const master = await isMaster(me);
  const links = await p.query(
    `SELECT l.id, l.master_id, l.student_id, l.status, l.note, l.created_at,
            (SELECT count(*)::int FROM mentoring_submissions s WHERE s.master_id = l.master_id AND s.student_id = l.student_id AND s.status = 'pending') AS open
       FROM mentoring_links l
      WHERE (l.master_id = $1 OR l.student_id = $1) AND l.status IN ('pending','accepted')
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = l.master_id AND b.blocked_id = l.student_id) OR (b.blocker_id = l.student_id AND b.blocked_id = l.master_id))
      ORDER BY l.created_at DESC LIMIT 200`,
    [me],
  );
  const cards = await cardsFor(links.rows.flatMap((x) => [Number(x.master_id), Number(x.student_id)]));
  const item = (x: Record<string, unknown>, other: number) => ({ id: String(x.id), status: x.status, note: String(x.note ?? ""), since: x.created_at, open: Number(x.open), member: cards.get(other) ?? null });
  const mentors = links.rows.filter((x) => Number(x.student_id) === me).map((x) => item(x, Number(x.master_id)));
  const students = links.rows.filter((x) => Number(x.master_id) === me).map((x) => item(x, Number(x.student_id)));
  return json({
    canMentor: master, canJudge: master || g.me.role === "admin", admin: g.me.role === "admin",
    mentors, students: master ? students : [],
    inbox: master ? students.reduce((a, s) => a + (s.status === "accepted" ? s.open : 0), 0) : 0,
  }, 200, NO_STORE);
}
