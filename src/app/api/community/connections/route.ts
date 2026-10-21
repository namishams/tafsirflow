import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NOT_BLOCKED, NO_STORE, PROFILE_COLS, card, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// The member's connections: incoming requests, own open requests and accepted connections (blocked members left out)
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "connections", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS}, k.status, k.note, (k.requester_id = $1) AS outgoing, k.created_at AS since
       FROM community_connections k
       JOIN community_profiles c ON c.user_id = CASE WHEN k.requester_id = $1 THEN k.addressee_id ELSE k.requester_id END
      WHERE (k.requester_id = $1 OR k.addressee_id = $1) AND k.status IN ('pending','accepted')
        AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}
      ORDER BY k.created_at DESC LIMIT 300`,
    [g.me.id],
  );
  const item = (x: Record<string, unknown>) => ({ ...card(x as never), note: String(x.note ?? ""), since: x.since });
  return json({
    incoming: r.rows.filter((x) => x.status === "pending" && !x.outgoing).map(item),
    outgoing: r.rows.filter((x) => x.status === "pending" && x.outgoing).map(item),
    connected: r.rows.filter((x) => x.status === "accepted").map(item),
  }, 200, NO_STORE);
}
