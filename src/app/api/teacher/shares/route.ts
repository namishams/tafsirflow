import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, line } from "@/lib/talents";
import { CONSENT_VERSION, MAX_TEACHERS, bad, cardsFor, inboxFor, mayTeach, needsParental, teacherGate } from "@/lib/teacherShare";

export const dynamic = "force-dynamic";

// Student side. GET: own teachers (pending / active, when the copy was last synced), open suggestions, consent info.
// POST { username, consent: true, parental? }: invite an accepted connection or mentoring master as teacher. Nothing is
// sent until the teacher accepts; 13–15 year olds need the parental-consent flag.
export async function GET(req: NextRequest) {
  const g = await teacherGate(req, "shares", 120);
  if (g.res) return g.res;
  const r = await pool()!.query("SELECT id, teacher_id, status, parental, synced_at, consent_at, created_at FROM teacher_shares WHERE student_id = $1 ORDER BY created_at DESC LIMIT 20", [g.me.id]);
  const cards = await cardsFor(r.rows.map((x) => Number(x.teacher_id)));
  return json({
    consentVersion: CONSENT_VERSION, parentalNeeded: needsParental(g.me.birthYear), maxTeachers: MAX_TEACHERS,
    teachers: r.rows.map((x) => ({ id: String(x.id), status: x.status, parental: !!x.parental, syncedAt: x.synced_at, since: x.created_at, teacher: cards.get(Number(x.teacher_id)) ?? null })),
    suggestions: await inboxFor(g.me.id),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await teacherGate(req, "invite", 20, true, 10 * 60_000);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const username = line(b.username, 40).toLowerCase();
  if (!username) return bad("bad_request");
  if (b.consent !== true) return bad("consent_required");
  if (needsParental(g.me.birthYear) && b.parental !== true) return bad("parental_required", 403);
  const p = pool()!;
  const t = await p.query("SELECT user_id FROM community_profiles WHERE username = $1 AND user_id <> $2 AND NOT suspended", [username, g.me.id]);
  const teacherId = t.rows[0] ? Number(t.rows[0].user_id) : null;
  if (!teacherId || !(await mayTeach(g.me.id, teacherId))) return bad("not_connected", 403);
  const n = await p.query("SELECT count(*)::int AS n FROM teacher_shares WHERE student_id = $1", [g.me.id]);
  if (Number(n.rows[0].n) >= MAX_TEACHERS) return bad("too_many_teachers", 409);
  const r = await p.query(
    `INSERT INTO teacher_shares (student_id, teacher_id, consent_ver, parental) VALUES ($1,$2,$3,$4)
     ON CONFLICT (student_id, teacher_id) DO NOTHING RETURNING id, status`,
    [g.me.id, teacherId, CONSENT_VERSION, needsParental(g.me.birthYear)],
  );
  if (!r.rows[0]) return bad("exists", 409);
  return json({ ok: true, id: String(r.rows[0].id), status: r.rows[0].status });
}
