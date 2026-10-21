import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";
import { notify } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// POST { action: accept | decline }: answer a follow request to the own private account
export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await talentGate(req, "follow-answer", 120, { write: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { action?: unknown };
  if (b.action !== "accept" && b.action !== "decline") return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const r = await p.query(
    `DELETE FROM community_follow_requests q USING community_profiles c
      WHERE q.requester_id = c.user_id AND c.username = $2 AND q.target_id = $1 RETURNING q.requester_id`,
    [g.me.id, String((await params).username).toLowerCase().slice(0, 40)],
  );
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  if (b.action === "accept") {
    await p.query("INSERT INTO community_follows (follower_id, followee_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [r.rows[0].requester_id, g.me.id]);
    void notify(r.rows[0].requester_id, "follow", g.me.id);
  }
  return json({ ok: true }, 200, NO_STORE);
}
