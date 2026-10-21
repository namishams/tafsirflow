import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, PROFILE_COLS, card } from "@/lib/talents";
import { gate } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";

// the members I blocked (to unblock them again)
export async function GET(req: NextRequest) {
  const g = await gate(req, "blocks", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS} FROM community_blocks b JOIN community_profiles c ON c.user_id = b.blocked_id WHERE b.blocker_id = $1 ORDER BY b.created_at DESC LIMIT 500`,
    [g.me.id],
  );
  return json({ blocked: r.rows.map((x) => card(x)) }, 200, NO_STORE);
}
