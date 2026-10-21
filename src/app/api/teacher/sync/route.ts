import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE } from "@/lib/talents";
import { bad, cleanSnapshot, inboxFor, teacherGate } from "@/lib/teacherShare";

export const dynamic = "force-dynamic";

// The student's app sends its aggregate snapshot; it is stored for every ACTIVE teacher link of this student only
// (consent given by the student, accepted by the teacher). Answers with the open suggestions. Without snapshot: only the inbox.
export async function POST(req: NextRequest) {
  const g = await teacherGate(req, "sync", 40, true, 10 * 60_000);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => null)) as { snapshot?: unknown } | null;
  const p = pool()!;
  let shares = 0;
  if (b?.snapshot !== undefined) {
    const s = cleanSnapshot(b.snapshot);
    if (!s) return bad("bad_request");
    const u = await p.query("UPDATE teacher_shares SET snapshot = $2::jsonb, synced_at = now() WHERE student_id = $1 AND status = 'active'", [g.me.id, JSON.stringify(s)]);
    shares = u.rowCount ?? 0;
  }
  void p.query("DELETE FROM teacher_suggestions s USING teacher_shares h WHERE h.id = s.share_id AND h.student_id = $1 AND s.status IN ('dismissed','done') AND s.responded_at < now() - interval '90 days'", [g.me.id]).catch(() => undefined);
  return json({ ok: true, shares, suggestions: await inboxFor(g.me.id) }, 200, NO_STORE);
}
