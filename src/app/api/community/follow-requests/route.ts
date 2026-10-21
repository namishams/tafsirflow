import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NOT_BLOCKED, NO_STORE, PROFILE_COLS, card, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// follow requests to a private account (newest first)
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "follow-reqs", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS} FROM community_follow_requests q JOIN community_profiles c ON c.user_id = q.requester_id
      WHERE q.target_id = $1 AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")} ORDER BY q.created_at DESC LIMIT 200`,
    [g.me.id],
  );
  return json({ requests: r.rows.map((x) => card(x)) }, 200, NO_STORE);
}
