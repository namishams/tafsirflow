import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { MIN_POST_AGE, NO_STORE, ageOf, birthYearOf, line, talentGate, visibleMember } from "@/lib/talents";
import { notify } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// POST { note? }: ask to connect (16+ on both sides). PATCH { action: accept | decline }: answer a request.
// DELETE: withdraw an own request or end a connection. A declined request can be asked again after 30 days.
async function target(req: NextRequest, params: Promise<{ username: string }>, max: number) {
  const g = await talentGate(req, "connect", max, { windowMs: 60 * 60_000, write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return { res: g.res };
  const other = await visibleMember(g.me.id, (await params).username);
  if (!other) return { res: json({ error: "not_found" }, 404) };
  return { me: g.me, id: Number(other.user_id) };
}
const PAIR = "LEAST(requester_id, addressee_id) = LEAST($1::bigint, $2::bigint) AND GREATEST(requester_id, addressee_id) = GREATEST($1::bigint, $2::bigint)";

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const t = await target(req, params, 30);
  if (t.res) return t.res;
  if ((ageOf(await birthYearOf(t.id)) ?? 0) < MIN_POST_AGE) return json({ error: "not_available" }, 403);
  const b = (await req.json().catch(() => ({}))) as { note?: unknown };
  const note = line(b.note, 200);
  const bad = await badText(note);
  if (bad) return json({ error: bad }, 400);
  const p = pool()!;
  const cur = (await p.query(`SELECT id, requester_id, status, responded_at FROM community_connections WHERE ${PAIR}`, [t.me.id, t.id])).rows[0];
  if (cur?.status === "accepted") return json({ connection: "connected" }, 200, NO_STORE);
  if (cur?.status === "pending") {
    // they asked first: asking back accepts
    if (Number(cur.requester_id) === t.id) {
      await p.query("UPDATE community_connections SET status = 'accepted', responded_at = now() WHERE id = $1", [cur.id]);
      void notify(t.id, "connect_accepted", t.me.id);
      return json({ connection: "connected" }, 200, NO_STORE);
    }
    return json({ connection: "outgoing" }, 200, NO_STORE);
  }
  if (cur?.status === "declined") {
    const wait = cur.responded_at && Date.now() - new Date(cur.responded_at).getTime() < 30 * 86400_000;
    if (wait && Number(cur.requester_id) === t.me.id) return json({ error: "declined_recently" }, 429);
    await p.query("UPDATE community_connections SET requester_id = $2, addressee_id = $3, status = 'pending', note = $4, created_at = now(), responded_at = NULL WHERE id = $1", [cur.id, t.me.id, t.id, note]);
  } else {
    await p.query("INSERT INTO community_connections (requester_id, addressee_id, note) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [t.me.id, t.id, note]);
  }
  void notify(t.id, "connect_request", t.me.id);
  return json({ connection: "outgoing" }, 200, NO_STORE);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const t = await target(req, params, 120);
  if (t.res) return t.res;
  const b = (await req.json().catch(() => ({}))) as { action?: unknown };
  if (b.action !== "accept" && b.action !== "decline") return json({ error: "action" }, 400);
  const r = await pool()!.query(
    `UPDATE community_connections SET status = $3, responded_at = now()
      WHERE requester_id = $2 AND addressee_id = $1 AND status = 'pending' RETURNING id`,
    [t.me.id, t.id, b.action === "accept" ? "accepted" : "declined"],
  );
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  if (b.action === "accept") void notify(t.id, "connect_accepted", t.me.id);
  return json({ connection: b.action === "accept" ? "connected" : "none" }, 200, NO_STORE);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const t = await target(req, params, 120);
  if (t.res) return t.res;
  // an own open request is removed; an accepted connection ends (the conversation stays readable but closed)
  await pool()!.query(
    `DELETE FROM community_connections WHERE ${PAIR} AND (status = 'accepted' OR (status = 'pending' AND requester_id = $1))`,
    [t.me.id, t.id],
  );
  return json({ connection: "none" }, 200, NO_STORE);
}
