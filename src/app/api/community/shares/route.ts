import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { gate, mondayDay, sharerTier } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";
const NO = { "Cache-Control": "private, no-store" };
const MAX_TOTAL = 100_000;
const MAX_WEEK = 1_000;

// Sharer ("Verbreiter") status of community profiles. Status only: it unlocks nothing.
// POST { total, week }: the app sends the shares it counted; the total never goes down, the week resets on Monday.
// GET: top sharers of this week among public profiles (blocked members left out).
export async function POST(req: NextRequest) {
  const g = await gate(req, "shares", 20, 10 * 60_000, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const num = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0);
  const total = num(b.total, MAX_TOTAL);
  const week = Math.min(num(b.week, MAX_WEEK), total);
  const monday = mondayDay();
  const r = await pool()!.query(
    `UPDATE community_profiles SET
        shares_total = GREATEST(shares_total, $2),
        shares_week = CASE WHEN shares_week_day = $4 THEN GREATEST(shares_week, $3) ELSE $3 END,
        shares_week_day = $4
      WHERE user_id = $1 RETURNING shares_total`,
    [g.me.id, total, week, monday],
  );
  if (!r.rows[0]) return json({ error: "profile_required" }, 404, NO);
  const shares = Number(r.rows[0].shares_total);
  return json({ shares, sharerTier: sharerTier(shares) }, 200, NO);
}

export async function GET(req: NextRequest) {
  const g = await gate(req, "shares-top", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT c.username, c.display_name, c.shares_week, c.shares_total FROM community_profiles c
      WHERE c.public AND c.shares_week_day = $2 AND c.shares_week > 0
        AND NOT EXISTS (SELECT 1 FROM community_blocks b WHERE (b.blocker_id = $1 AND b.blocked_id = c.user_id) OR (b.blocker_id = c.user_id AND b.blocked_id = $1))
      ORDER BY c.shares_week DESC, c.username ASC LIMIT 10`,
    [g.me.id, mondayDay()],
  );
  return json({
    list: r.rows.map((x) => ({ username: x.username, name: x.display_name, week: Number(x.shares_week), tier: sharerTier(Number(x.shares_total)) })),
  }, 200, NO);
}
