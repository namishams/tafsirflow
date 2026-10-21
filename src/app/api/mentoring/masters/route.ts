import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NOT_BLOCKED, NO_STORE, PROFILE_COLS } from "@/lib/talents";
import { MASTER_SQL, memberCard, mentorGate } from "../_lib/mentoring";

export const dynamic = "force-dynamic";

// Masters the member can ask for mentoring: verified masters among the member's accepted connections
// (mentoring is connection-based), with the state of an existing request.
export async function GET(req: NextRequest) {
  const g = await mentorGate(req, "masters", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS}, l.status AS link_status
       FROM community_connections k
       JOIN community_profiles c ON c.user_id = CASE WHEN k.requester_id = $1 THEN k.addressee_id ELSE k.requester_id END
       LEFT JOIN mentoring_links l ON l.master_id = c.user_id AND l.student_id = $1
      WHERE (k.requester_id = $1 OR k.addressee_id = $1) AND k.status = 'accepted' AND ${MASTER_SQL} AND ${NOT_BLOCKED("c.user_id")}
      ORDER BY c.level DESC, c.username LIMIT 200`,
    [g.me.id],
  );
  return json({ masters: r.rows.map((x) => ({ ...memberCard(x), link: x.link_status ?? "none" })) }, 200, NO_STORE);
}
