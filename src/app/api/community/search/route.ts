import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { BADGE_RANK, NOT_BLOCKED, NO_STORE, PROFILE_COLS, card, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

const LIMIT = 20;

// Account search as you type (app search screen, Instagram / TikTok style): ?q= matches the @username or the display
// name (prefix of the name or of one of its words first, then anywhere). Public, not suspended, not blocked either
// way. Order: exact @username, official / gold / emerald badges, mutual follows, people the member follows, prefix
// matches, followers. Cards only (never ids, e-mail or birth year), plus followed / followsMe / requested.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "search", 120);
  if (g.res) return g.res;
  const esc = (s: string) => s.replace(/[\\%_]/g, (m) => "\\" + m);
  const raw = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().replace(/^@/, "").slice(0, 40);
  if (!raw) return json({ talents: [] }, 200, NO_STORE);
  const q = esc(raw);
  const r = await pool()!.query(
    `SELECT * FROM (
       SELECT ${PROFILE_COLS},
              ${BADGE_RANK} AS badge_rank,
              lower(c.username) = $3 AS exact,
              (lower(c.username) LIKE $2 || '%' ESCAPE '\\' OR lower(c.display_name) LIKE $2 || '%' ESCAPE '\\'
                OR lower(c.display_name) LIKE '% ' || $2 || '%' ESCAPE '\\') AS prefix,
              EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = c.user_id) AS followed,
              EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = c.user_id AND f.followee_id = $1) AS follows_me,
              EXISTS (SELECT 1 FROM community_follow_requests q WHERE q.requester_id = $1 AND q.target_id = c.user_id) AS requested
         FROM community_profiles c
        WHERE c.public AND NOT c.suspended AND c.user_id <> $1 AND ${NOT_BLOCKED("c.user_id")}
          AND (lower(c.username) LIKE '%' || $2 || '%' ESCAPE '\\' OR lower(c.display_name) LIKE '%' || $2 || '%' ESCAPE '\\')
     ) s
     ORDER BY s.exact DESC, s.badge_rank DESC, (s.followed AND s.follows_me) DESC, s.followed DESC, s.prefix DESC, s.followers DESC, s.username
     LIMIT ${LIMIT}`,
    [g.me.id, q, raw],
  );
  return json({
    talents: r.rows.map((x) => ({ ...card(x), followed: !!x.followed, followsMe: !!x.follows_me, requested: !!x.requested && !x.followed })),
  }, 200, NO_STORE);
}
