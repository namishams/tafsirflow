import { NextRequest } from "next/server";
import { pool } from "./db";
import { json } from "./http";
import { NOT_BLOCKED, NO_STORE, PROFILE_COLS, canSeeContent, card, talentGate } from "./talents";

const PAGE = 40;

/** followers or following of a member, newest first, paged with offset `cursor`; hidden, suspended and blocked members left out */
export async function followList(req: NextRequest, params: Promise<{ username: string }>, kind: "followers" | "following") {
  const g = await talentGate(req, "follows", 60);
  if (g.res) return g.res;
  const { username } = await params;
  const p = pool()!;
  const t = await p.query(
    `SELECT c.user_id, c.private FROM community_profiles c WHERE c.username = $2 AND (c.user_id = $1 OR (c.public AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}))`,
    [g.me.id, String(username).toLowerCase().slice(0, 40)],
  );
  if (!t.rows[0]) return json({ error: "not_found" }, 404);
  if (!(await canSeeContent(g.me.id, Number(t.rows[0].user_id), !!t.rows[0].private))) return json({ list: [], next: null, restricted: true }, 200, NO_STORE);
  const offset = Math.max(0, Math.min(5000, Math.floor(Number(req.nextUrl.searchParams.get("cursor")) || 0)));
  const [join, other] = kind === "followers" ? ["f.followee_id", "f.follower_id"] : ["f.follower_id", "f.followee_id"];
  const r = await p.query(
    `SELECT ${PROFILE_COLS}, EXISTS (SELECT 1 FROM community_follows x WHERE x.follower_id = $1 AND x.followee_id = c.user_id) AS followed,
            EXISTS (SELECT 1 FROM community_follows y WHERE y.follower_id = c.user_id AND y.followee_id = $1) AS follows_me,
            EXISTS (SELECT 1 FROM community_follow_requests q WHERE q.requester_id = $1 AND q.target_id = c.user_id) AS requested
       FROM community_follows f JOIN community_profiles c ON c.user_id = ${other}
      WHERE ${join} = $2 AND (c.user_id = $1 OR (c.public AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}))
      ORDER BY f.created_at DESC LIMIT ${PAGE + 1} OFFSET $3`,
    [g.me.id, t.rows[0].user_id, offset],
  );
  return json({
    // requested: a follow request to this (private) account is pending – shown as "Requested", never as "Following"
    list: r.rows.slice(0, PAGE).map((x) => ({ ...card(x), followed: !!x.followed, followsMe: !!x.follows_me, mine: Number(x.user_id) === g.me.id, private: !!x.private, requested: !!x.requested && !x.followed })),
    next: r.rows.length > PAGE ? String(offset + PAGE) : null,
  }, 200, NO_STORE);
}
