import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, REPORT_CATEGORIES, line, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// POST { category, reason }: report a message the member received. The admin sees the message in the queue.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "report-msg", 10, { windowMs: 60 * 60_000, write: true });
  if (g.res) return g.res;
  const raw = (await params).id;
  if (!/^\d{1,18}$/.test(raw)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const m = (await p.query(
    `SELECT m.id, m.sender_id FROM community_messages m JOIN community_conversations v ON v.id = m.conversation_id
      WHERE m.id = $2 AND (v.user_a = $1 OR v.user_b = $1) AND m.sender_id <> $1`,
    [g.me.id, raw],
  )).rows[0];
  if (!m) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { category?: unknown; reason?: unknown };
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "other";
  const dup = await p.query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = 'message' AND target_id = $2 AND status = 'open'", [g.me.id, m.id]);
  if (!dup.rows[0]) {
    await p.query(
      "INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,'message',$5)",
      [g.me.id, m.sender_id, line(b.reason, 300), category, m.id],
    );
  }
  return json({ reported: true }, 200, NO_STORE);
}
