import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { MAX_JOINED, kindAllows, normCode, saveSettings, settingsOf, type CircleKind } from "@/lib/together";

export const dynamic = "force-dynamic";

// POST { code, consent: true, gender? }: joins a circle by its invite code (or asks to join when the leader approves
// members). Not possible when the leader and the member blocked each other, for a suspended or full circle, or for a
// brothers/sisters circle that does not match the self-declared gender. Unknown codes and blocks answer the same.
export async function POST(req: NextRequest) {
  const g = await talentGate(req, "tg-circle-join", 10, { minAge: MIN_POST_AGE, needProfile: true, write: true, windowMs: 10 * 60_000 });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.consent !== true) return json({ error: "consent_required" }, 400);
  const code = normCode(b.code);
  if (code.length !== 8) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const ci = (await p.query(
    `SELECT ci.* FROM together_circles ci WHERE ci.code = $2 AND ci.suspended_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM community_blocks bl WHERE (bl.blocker_id = $1 AND bl.blocked_id = ci.owner_id) OR (bl.blocker_id = ci.owner_id AND bl.blocked_id = $1))`,
    [g.me.id, code],
  )).rows[0];
  if (!ci) return json({ error: "not_found" }, 404);
  const have = (await p.query("SELECT status FROM together_circle_members WHERE circle_id = $1 AND user_id = $2", [ci.id, g.me.id])).rows[0];
  if (have) return json({ id: String(ci.id), status: have.status }, 200, NO_STORE);
  let s = await settingsOf(g.me.id);
  if (!s.gender && (b.gender === "brother" || b.gender === "sister")) s = await saveSettings(g.me.id, { gender: b.gender });
  if (!kindAllows(ci.kind as CircleKind, s.gender)) return json({ error: "circle_gender", kind: ci.kind }, 403);
  const joined = (await p.query("SELECT count(*)::int AS n FROM together_circle_members WHERE user_id = $1", [g.me.id])).rows[0].n;
  if (joined >= MAX_JOINED) return json({ error: "circle_limit" }, 403);
  const members = (await p.query("SELECT count(*)::int AS n FROM together_circle_members WHERE circle_id = $1", [ci.id])).rows[0].n;
  if (members >= Number(ci.max_members)) return json({ error: "circle_full" }, 403);
  const status = ci.approval ? "pending" : "member";
  await p.query("INSERT INTO together_circle_members (circle_id, user_id, role, status) VALUES ($1,$2,'member',$3) ON CONFLICT DO NOTHING", [ci.id, g.me.id, status]);
  if (!s.circles) await saveSettings(g.me.id, { circles: true });
  return json({ id: String(ci.id), status }, 200, NO_STORE);
}
