import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NOT_BLOCKED, NO_STORE, canSeeContent, talentGate } from "@/lib/talents";
import { SIJILL_COLS, sijillOf } from "@/lib/sijill";

export const dynamic = "force-dynamic";

// GET ?locale=: a member's Sijill (academic record) with only the sections they switched on. Private accounts: only for
// approved followers. Blocked either way, suspended or not public: not found. The owner gets every section.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await talentGate(req, "sijill", 90);
  if (g.res) return g.res;
  const name = String((await params).username).toLowerCase().slice(0, 40);
  const r = (await pool()!.query(
    `SELECT ${SIJILL_COLS}, c.private FROM community_profiles c
      WHERE c.username = $2 AND (c.user_id = $1 OR (c.public AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}))`,
    [g.me.id, name],
  )).rows[0];
  if (!r) return json({ error: "not_found" }, 404);
  const own = Number(r.user_id) === g.me.id;
  if (!own && !(await canSeeContent(g.me.id, Number(r.user_id), !!r.private))) return json({ sijill: null, restricted: true }, 200, NO_STORE);
  const locale = (req.nextUrl.searchParams.get("locale") ?? "en").slice(0, 2);
  return json({ sijill: await sijillOf(r, own, locale) }, 200, NO_STORE);
}
