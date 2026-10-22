import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, REPORT_CATEGORIES, line, talentGate } from "@/lib/talents";
import { report, threadFor } from "@/lib/messenger/core";

export const dynamic = "force-dynamic";

// Older app builds: report a received message. It goes through the messenger report (an encrypted copy of the
// message and the ones before it, which the moderator reads in the queue).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "report-msg", 10, { windowMs: 60 * 60_000, write: true });
  if (g.res) return g.res;
  const raw = (await params).id;
  if (!/^\d{1,18}$/.test(raw)) return json({ error: "not_found" }, 404);
  const m = (await pool()!.query("SELECT thread_id FROM msg_messages WHERE id = $1", [raw])).rows[0];
  const t = m ? await threadFor(g.me.id, String(m.thread_id)) : null;
  if (!t) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { category?: unknown; reason?: unknown };
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "other";
  const r = await report(g.me.id, t, { messageId: raw }, category, line(b.reason, 300));
  return "error" in r ? json({ error: r.error }, r.status) : json({ reported: true }, 200, NO_STORE);
}
