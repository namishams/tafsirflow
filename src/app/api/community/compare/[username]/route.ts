import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate, visibleMember } from "@/lib/talents";
import { SIJILL_COLS, canCompare, sijillConfig, sijillOf } from "@/lib/sijill";

export const dynamic = "force-dynamic";

// GET ?locale=: "compare with friends" – the own Sijill next to the other member's, only between mutual follows or
// accepted connections. The other side shows only the sections that member switched on.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await talentGate(req, "compare", 60);
  if (g.res) return g.res;
  if (!sijillConfig().compare) return json({ error: "not_available" }, 403);
  const other = await visibleMember(g.me.id, (await params).username);
  if (!other) return json({ error: "not_found" }, 404);
  if (!(await canCompare(g.me.id, Number(other.user_id)))) return json({ error: "compare_friends" }, 403);
  const p = pool()!;
  const [mine, theirs] = await Promise.all([
    p.query(`SELECT ${SIJILL_COLS}, c.username, c.display_name FROM community_profiles c WHERE c.user_id = $1`, [g.me.id]),
    p.query(`SELECT ${SIJILL_COLS}, c.username, c.display_name FROM community_profiles c WHERE c.user_id = $1`, [other.user_id]),
  ]);
  if (!mine.rows[0]) return json({ error: "profile_required" }, 403);
  const locale = (req.nextUrl.searchParams.get("locale") ?? "en").slice(0, 2);
  const side = async (r: (typeof mine.rows)[number], full: boolean) => ({ username: r.username, name: r.display_name, sijill: await sijillOf(r, full, locale) });
  return json({ me: await side(mine.rows[0], true), them: await side(theirs.rows[0], false) }, 200, NO_STORE);
}
