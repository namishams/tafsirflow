import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { BADGE_RANK, HAS_BADGE, NOT_BLOCKED, NO_STORE, PROFILE_COLS, card, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// Suggested reciters: verified members and higher levels the member does not follow yet, same country first,
// then those with approved clips and followers.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "suggested", 30);
  if (g.res) return g.res;
  const p = pool()!;
  const mine = (await p.query("SELECT country FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0];
  const r = await p.query(
    `SELECT ${PROFILE_COLS}, EXISTS (SELECT 1 FROM community_follow_requests q WHERE q.requester_id = $1 AND q.target_id = c.user_id) AS requested
       FROM community_profiles c
      WHERE c.public AND NOT c.suspended AND c.user_id <> $1 AND ${NOT_BLOCKED("c.user_id")}
        AND NOT EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = c.user_id)
        AND (${HAS_BADGE} OR c.level <> 'talent' OR EXISTS (SELECT 1 FROM community_posts p WHERE p.author_id = c.user_id AND p.status = 'approved'))
      ORDER BY (c.country IS NOT DISTINCT FROM $2) DESC, ${BADGE_RANK} DESC,
               array_position(ARRAY['sheikh','master','rising','talent'], c.level), followers DESC
      LIMIT 12`,
    [g.me.id, mine?.country ?? null],
  );
  // private and requested (added 22.10.2026): the follow button shows "Requested" for a pending request to a private account
  return json({ talents: r.rows.map((x) => ({ ...card(x), private: !!x.private, requested: !!x.requested })) }, 200, NO_STORE);
}
