import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { TOPICS, friendByName, invites, membership, type Topic } from "@/lib/together";

export const dynamic = "force-dynamic";

// "Learn together" invitations: a topic (surah, review, tafsir, Arabic, tajweed; optional surah) and a time within the
// next 14 days, to one friend or to a circle the member belongs to. No free text. GET: upcoming invitations.
// POST { username? | circleId?, topic, surah?, at }.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-inv", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  return json({ invites: await invites(g.me.id) }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "tg-inv-new", 8, { minAge: MIN_POST_AGE, needProfile: true, write: true, windowMs: 60 * 60_000 });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const topic = TOPICS.includes(b.topic as Topic) ? (b.topic as Topic) : null;
  const at = typeof b.at === "string" ? new Date(b.at) : null;
  if (!topic || !at || Number.isNaN(at.getTime())) return json({ error: "bad_request" }, 400);
  if (at.getTime() < Date.now() + 5 * 60_000 || at.getTime() > Date.now() + 14 * 86_400_000) return json({ error: "bad_time" }, 400);
  const surah = topic === "surah" && typeof b.surah === "number" && Number.isInteger(b.surah) && b.surah >= 1 && b.surah <= 114 ? b.surah : null;
  const p = pool()!;
  let toId: string | null = null, circleId: number | null = null;
  if (typeof b.username === "string") {
    const f = await friendByName(g.me.id, b.username);
    if (!f) return json({ error: "not_found" }, 404);
    toId = String(f.user_id);
  } else if (b.circleId !== undefined) {
    const cid = Number(b.circleId);
    const m = Number.isSafeInteger(cid) && cid > 0 ? await membership(cid, g.me.id) : undefined;
    const ci = m?.status === "member" ? (await p.query("SELECT suspended_at FROM together_circles WHERE id = $1", [cid])).rows[0] : null;
    if (!ci || ci.suspended_at) return json({ error: "not_found" }, 404);
    circleId = cid;
  } else return json({ error: "bad_request" }, 400);
  const r = await p.query("INSERT INTO together_invites (from_id, to_id, circle_id, topic, surah, at) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id", [g.me.id, toId, circleId, topic, surah, at.toISOString()]);
  await p.query("INSERT INTO together_invite_answers (invite_id, user_id, answer) VALUES ($1,$2,'yes')", [r.rows[0].id, g.me.id]);
  return json({ id: String(r.rows[0].id) }, 201, NO_STORE);
}
