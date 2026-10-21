import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// DELETE: remove an own highlight (expired stories in it are cleaned up afterwards)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "highlight-del", 30, { write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const r = await pool()!.query("DELETE FROM community_highlights WHERE id = $1 AND owner_id = $2 RETURNING id", [id, g.me.id]);
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  return json({ ok: true }, 200, NO_STORE);
}
