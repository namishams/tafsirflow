import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { CONTENT_VISIBLE, NOT_BLOCKED, NO_STORE, talentGate } from "@/lib/talents";
import { MOMENT_SHOWN, REACTIONS, creditReaction, isReaction, notifyReaction } from "@/lib/sijill";

export const dynamic = "force-dynamic";

// POST { reaction: like | mashallah | barakallah | barik }: one reaction per member and moment (changing it replaces
// the old one); DELETE removes it. Preset reactions only, no free text. 13+, own profile, not on own moments, block and
// privacy respected. The achiever gets one notification per person and moment.
async function visibleMoment(meId: number, id: string) {
  if (!/^\d{1,18}$/.test(id)) return null;
  const r = await pool()!.query(
    `SELECT m.id, m.user_id FROM community_moments m JOIN community_profiles c ON c.user_id = m.user_id
      WHERE m.id = $2 AND m.user_id <> $1 AND c.public AND NOT c.suspended AND ${MOMENT_SHOWN} AND ${NOT_BLOCKED("m.user_id")} AND ${CONTENT_VISIBLE("m.user_id")}`,
    [meId, id],
  );
  return r.rows[0] as { id: string; user_id: string } | undefined;
}
async function counts(id: string) {
  const r = await pool()!.query("SELECT reaction, count(*)::int AS n FROM community_moment_reactions WHERE moment_id = $1 GROUP BY reaction", [id]);
  const c = Object.fromEntries(REACTIONS.map((k) => [k, 0])) as Record<string, number>;
  for (const x of r.rows) c[x.reaction] = Number(x.n);
  return c;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "react", 60, { write: true, needProfile: true });
  if (g.res) return g.res;
  const m = await visibleMoment(g.me.id, (await params).id);
  if (!m) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { reaction?: unknown };
  if (!isReaction(b.reaction)) return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const r = await p.query(
    `INSERT INTO community_moment_reactions (moment_id, user_id, reaction) VALUES ($1,$2,$3)
     ON CONFLICT (moment_id, user_id) DO UPDATE SET reaction = EXCLUDED.reaction RETURNING (xmax = 0) AS inserted`,
    [m.id, g.me.id, b.reaction],
  );
  if (r.rows[0]?.inserted) await p.query("UPDATE community_moments SET reaction_count = reaction_count + 1 WHERE id = $1", [m.id]);
  // reacting is free for everyone (no Pro check, also on Pro members' moments); a counted reaction rewards the receiver.
  // `credited` (added for Swipe & Learn): whether this one was counted within the daily caps (CREDIT_CAPS)
  const credited = await creditReaction(String(m.id), g.me.id, Number(m.user_id));
  void notifyReaction(Number(m.user_id), g.me.id, String(m.id), b.reaction);
  const c = await counts(String(m.id));
  return json({ mine: b.reaction, counts: c, total: Object.values(c).reduce((a, x) => a + x, 0), credited }, 200, NO_STORE);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "react", 60, { write: true });
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const p = pool()!;
  const d = await p.query("DELETE FROM community_moment_reactions WHERE moment_id = $1 AND user_id = $2 RETURNING 1", [id, g.me.id]);
  if (d.rows[0]) {
    await p.query("UPDATE community_moments SET reaction_count = GREATEST(0, reaction_count - 1) WHERE id = $1", [id]);
    await p.query("DELETE FROM community_notifications WHERE kind = 'moment_reaction' AND actor_id = $1 AND moment_id = $2", [g.me.id, id]);
  }
  const c = await counts(id);
  return json({ mine: null, counts: c, total: Object.values(c).reduce((a, x) => a + x, 0) }, 200, NO_STORE);
}
