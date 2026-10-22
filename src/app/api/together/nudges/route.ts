import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { HAS, NUDGE_KINDS, NUDGE_RECEIVE_PER_DAY, NUDGE_SEND_PER_DAY, OTHER_OK, friendByName, shareCircle, type NudgeKind } from "@/lib/together";

export const dynamic = "force-dynamic";

// POST { username, kind, circleId? }: a preset, respectful reminder (no free text) to a friend or a circle member who
// switched nudges on. One per pair in 20 hours, at most 3 received a day and 10 sent a day; blocks end it.
export async function POST(req: NextRequest) {
  const g = await talentGate(req, "tg-nudge", 20, { minAge: MIN_POST_AGE, needProfile: true, write: true, windowMs: 60 * 60_000 });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = NUDGE_KINDS.includes(b.kind as NudgeKind) ? (b.kind as NudgeKind) : null;
  if (!kind || typeof b.username !== "string") return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const other = (await p.query(
    `SELECT c.user_id FROM community_profiles c WHERE c.username = $2 AND NOT c.suspended AND ${OTHER_OK("c.user_id")} AND ${HAS("nudges", "c.user_id")}`,
    [g.me.id, b.username.toLowerCase().slice(0, 40)],
  )).rows[0];
  if (!other) return json({ error: "not_found" }, 404);
  const cid = b.circleId !== undefined ? Number(b.circleId) : null;
  const circle = await shareCircle(g.me.id, Number(other.user_id), cid && Number.isSafeInteger(cid) ? cid : null);
  const friend = circle ? null : await friendByName(g.me.id, b.username);
  if (!circle && !friend) return json({ error: "not_found" }, 404);
  const lim = (await p.query(
    `SELECT (SELECT count(*)::int FROM together_nudges WHERE from_id = $1 AND to_id = $2 AND created_at > now() - interval '20 hours') AS pair,
            (SELECT count(*)::int FROM together_nudges WHERE to_id = $2 AND created_at > now() - interval '24 hours') AS got,
            (SELECT count(*)::int FROM together_nudges WHERE from_id = $1 AND created_at > now() - interval '24 hours') AS sent`,
    [g.me.id, other.user_id],
  )).rows[0];
  if (lim.pair > 0) return json({ error: "nudge_pair" }, 429);
  if (lim.got >= NUDGE_RECEIVE_PER_DAY) return json({ error: "nudge_enough" }, 429);
  if (lim.sent >= NUDGE_SEND_PER_DAY) return json({ error: "slow_down" }, 429);
  await p.query("INSERT INTO together_nudges (from_id, to_id, kind, circle_id) VALUES ($1,$2,$3,$4)", [g.me.id, other.user_id, kind, circle]);
  return json({ ok: true }, 201, NO_STORE);
}
