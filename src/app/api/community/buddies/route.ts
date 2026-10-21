import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NOT_BLOCKED, NO_STORE, PROFILE_COLS, card, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// "Study buddies": members aged 16+ with a similar stage, level, focus and daily time, active in the last 30 days, who
// show their level section (sijill_privacy.level) and are not followed yet. Viewers 16+ only. Same country and rewaya
// count a little. Nothing about the learning data itself is sent, only the profile card and what matched.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "buddies", 30, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const p = pool()!;
  const me = (await p.query("SELECT study_stage, study_focus, study_level, study_minutes, country, rewaya, achievements_updated_at FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0];
  if (!me?.achievements_updated_at) return json({ buddies: [], needSync: true }, 200, NO_STORE);
  const r = await p.query(
    `SELECT ${PROFILE_COLS}, c.study_stage, c.study_focus, c.current_surah,
            ((c.study_stage = $2)::int * 3 + (c.study_focus = $3)::int * 2 + (abs(c.study_level - $4) <= 3)::int * 2
              + (abs(c.study_minutes - $5) <= 10)::int + (c.country IS NOT DISTINCT FROM $6)::int + (lower(c.rewaya) = lower($7) AND $7 <> '')::int) AS score
       FROM community_profiles c JOIN users u ON u.id = c.user_id
      WHERE c.public AND NOT c.suspended AND c.user_id <> $1 AND ${NOT_BLOCKED("c.user_id")}
        AND COALESCE((c.sijill_privacy ->> 'level')::boolean, false)
        AND c.achievements_updated_at > now() - interval '30 days'
        AND u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= ${MIN_POST_AGE}
        AND NOT EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = c.user_id)
      ORDER BY score DESC, c.achievements_updated_at DESC
      LIMIT 12`,
    [g.me.id, me.study_stage, me.study_focus, Number(me.study_level), Number(me.study_minutes), me.country, me.rewaya ?? ""],
  );
  return json({
    buddies: r.rows.filter((x) => Number(x.score) >= 3).map((x) => ({
      ...card(x),
      match: { stage: x.study_stage === me.study_stage, focus: x.study_focus === me.study_focus, stageId: x.study_stage, focusId: x.study_focus },
    })),
  }, 200, NO_STORE);
}
