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
  // limits and insert in one transaction under an advisory lock on the recipient, so parallel requests cannot pass the
  // limits together; the unique index (from, to, UTC day) is the last guard for the pair rule
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(hashtext('together_nudge'), $1::int)", [Number(other.user_id) % 2147483647]);
    const lim = (await client.query(
      `SELECT (SELECT count(*)::int FROM together_nudges WHERE from_id = $1 AND to_id = $2 AND created_at > now() - interval '20 hours') AS pair,
              (SELECT count(*)::int FROM together_nudges WHERE to_id = $2 AND created_at > now() - interval '24 hours') AS got,
              (SELECT count(*)::int FROM together_nudges WHERE from_id = $1 AND created_at > now() - interval '24 hours') AS sent`,
      [g.me.id, other.user_id],
    )).rows[0];
    const fail = lim.pair > 0 ? "nudge_pair" : lim.got >= NUDGE_RECEIVE_PER_DAY ? "nudge_enough" : lim.sent >= NUDGE_SEND_PER_DAY ? "slow_down" : null;
    if (fail) { await client.query("ROLLBACK"); return json({ error: fail }, 429); }
    const ins = await client.query(
      "INSERT INTO together_nudges (from_id, to_id, kind, circle_id) VALUES ($1,$2,$3,$4) ON CONFLICT (from_id, to_id, day) DO NOTHING RETURNING id",
      [g.me.id, other.user_id, kind, circle],
    );
    await client.query("COMMIT");
    if (!ins.rows[0]) return json({ error: "nudge_pair" }, 429);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally { client.release(); }
  return json({ ok: true }, 201, NO_STORE);
}
