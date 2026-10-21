import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NOT_BLOCKED, connected, line } from "@/lib/talents";
import { MASTER_SQL, MAX_MENTORS, bad, checkText, mentorGate } from "../_lib/mentoring";

export const dynamic = "force-dynamic";

// A student asks a master for mentoring: { username, note }. Only between accepted connections; the master must be
// verified (level master/sheikh or gold/official badge). A declined or ended request can be sent again.
export async function POST(req: NextRequest) {
  const g = await mentorGate(req, "link", 20, true);
  if (g.res) return g.res;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const username = line(body.username, 40).toLowerCase();
  const note = line(body.note, 200);
  if (!username) return bad("bad_request");
  const t = await checkText(note);
  if (!t.ok) return bad("text_not_allowed");
  const p = pool()!;
  const m = await p.query(`SELECT c.user_id FROM community_profiles c WHERE c.username = $2 AND c.user_id <> $1 AND ${MASTER_SQL} AND ${NOT_BLOCKED("c.user_id")}`, [g.me.id, username]);
  const masterId = m.rows[0] ? Number(m.rows[0].user_id) : null;
  if (!masterId) return bad("not_master", 404);
  if (!(await connected(g.me.id, masterId))) return bad("not_connected", 403);
  const n = await p.query("SELECT count(*)::int AS n FROM mentoring_links WHERE student_id = $1 AND status IN ('pending','accepted')", [g.me.id]);
  if (Number(n.rows[0].n) >= MAX_MENTORS) return bad("too_many_mentors", 409);
  const r = await p.query(
    `INSERT INTO mentoring_links (master_id, student_id, note) VALUES ($1,$2,$3)
     ON CONFLICT (master_id, student_id) DO UPDATE SET status = 'pending', note = EXCLUDED.note, created_at = now(), responded_at = NULL
       WHERE mentoring_links.status IN ('declined','ended')
     RETURNING id, status`,
    [masterId, g.me.id, note],
  );
  if (!r.rows[0]) return bad("exists", 409);
  return json({ ok: true, id: String(r.rows[0].id), status: r.rows[0].status });
}
