import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { ROLES, gate, shape } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";

// Public profiles only; people you blocked (or who blocked you) never show up
export async function GET(req: NextRequest) {
  const g = await gate(req, "list", 60);
  if (g.res) return g.res;
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().slice(0, 40).replace(/[\\%_]/g, (m) => "\\" + m);
  const role = req.nextUrl.searchParams.get("role");
  const r = await pool()!.query(
    `SELECT c.*, (SELECT count(*)::int FROM community_follows f WHERE f.followee_id = c.user_id) AS followers,
            (SELECT count(*)::int FROM community_follows f WHERE f.follower_id = c.user_id) AS following,
            EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = c.user_id) AS followed
       FROM community_profiles c
      WHERE c.public AND c.user_id <> $1
        AND ($2::text IS NULL OR c.role = $2)
        AND ($3 = '' OR lower(c.username) LIKE $3 || '%' ESCAPE '\\' OR lower(c.display_name) LIKE '%' || $3 || '%' ESCAPE '\\')
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = c.user_id) OR (b.blocker_id = c.user_id AND b.blocked_id = $1))
      ORDER BY (c.role <> 'learner') DESC, followers DESC, c.created_at DESC LIMIT 50`,
    [g.me.id, role && (ROLES as readonly string[]).includes(role) ? role : null, q],
  );
  return json({ profiles: r.rows.map((x) => ({ ...shape(x), followed: !!x.followed })) }, 200, { "Cache-Control": "private, no-store" });
}
