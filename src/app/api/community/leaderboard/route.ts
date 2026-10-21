import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { mondayDay } from "@/lib/communityProfiles";
import { NOT_BLOCKED, NO_STORE, card, PROFILE_COLS, talentGate } from "@/lib/talents";
import { sijillConfig } from "@/lib/sijill";

export const dynamic = "force-dynamic";

// Leaderboards (opt-in, leaderboard_opt_in): GET ?kind=following&metric=xp|streak|memorised – the member and the people
// they follow; GET ?kind=consistent – "most consistent this week" among accepted connections (active days, then streak).
// Only members who switched the leaderboard on appear; the member's own opt-in is returned so the app can ask.
const METRICS: Record<string, string> = {
  xp: "(CASE WHEN c.week_monday >= $2 - 1 THEN c.week_xp ELSE 0 END)",
  streak: "c.streak_days",
  memorised: "c.memorised_verses",
  active: "(CASE WHEN c.week_monday >= $2 - 1 THEN c.week_active ELSE 0 END)",
};
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "leaderboard", 60);
  if (g.res) return g.res;
  if (!sijillConfig().leaderboards) return json({ error: "not_available" }, 403);
  const sp = req.nextUrl.searchParams;
  const kind = sp.get("kind") === "consistent" ? "consistent" : "following";
  const metric = kind === "consistent" ? "active" : METRICS[sp.get("metric") ?? ""] ? (sp.get("metric") as string) : "xp";
  const p = pool()!;
  const me = (await p.query("SELECT leaderboard_opt_in FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0];
  if (!me) return json({ error: "profile_required" }, 403);
  const circle = kind === "consistent"
    ? `EXISTS (SELECT 1 FROM community_connections k WHERE k.status = 'accepted' AND ((k.requester_id = $1 AND k.addressee_id = c.user_id) OR (k.addressee_id = $1 AND k.requester_id = c.user_id)))`
    : "EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = c.user_id)";
  const r = await p.query(
    `SELECT ${PROFILE_COLS}, ${METRICS[metric]} AS score, c.streak_days, (c.user_id = $1) AS me
       FROM community_profiles c
      WHERE $2::int >= 0 AND c.leaderboard_opt_in AND NOT c.suspended AND (c.user_id = $1 OR (c.public AND ${circle} AND ${NOT_BLOCKED("c.user_id")}))
      ORDER BY score DESC, c.streak_days DESC, c.username
      LIMIT 50`,
    [g.me.id, mondayDay()],
  );
  return json({
    kind, metric, optedIn: !!me.leaderboard_opt_in,
    rows: r.rows.map((x, i) => ({ rank: i + 1, ...card(x), score: Number(x.score), streak: Number(x.streak_days), me: !!x.me })),
  }, 200, NO_STORE);
}
