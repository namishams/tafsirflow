import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { shape } from "@/lib/communityProfiles";
import { MIN_POST_AGE, NO_STORE, PROFILE_COLS, ageOf, birthYearOf, talentGate } from "@/lib/talents";
import { refreshBadges } from "@/lib/talentBadges";
import { postingEnabled } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// A talent profile with the relationship to the viewer: follow, connection (none | outgoing | incoming | connected),
// whether a message can be sent, blocked by me. Others' blocks look like "not found". No ids, e-mail or birth year.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await talentGate(req, "profile", 90);
  if (g.res) return g.res;
  const { username } = await params;
  const p = pool()!;
  const r = await p.query(`SELECT ${PROFILE_COLS}, c.reciter_level FROM community_profiles c WHERE c.username = $1`, [String(username).toLowerCase().slice(0, 40)]);
  const c = r.rows[0];
  const id = c ? Number(c.user_id) : 0;
  const mine = id === g.me.id;
  if (!c || ((!c.public || c.suspended) && !mine)) return json({ error: "not_found" }, 404);
  const b = await p.query("SELECT blocker_id FROM community_blocks WHERE (blocker_id = $1 AND blocked_id = $2) OR (blocker_id = $2 AND blocked_id = $1)", [g.me.id, id]);
  const iBlocked = b.rows.some((x) => Number(x.blocker_id) === g.me.id);
  if (b.rows.length && !iBlocked) return json({ error: "not_found" }, 404);
  let connection: "none" | "outgoing" | "incoming" | "connected" = "none";
  let followed = false;
  let canMessage = false;
  let requested = false;
  if (!mine) {
    const [f, cn] = await Promise.all([
      p.query("SELECT 1 FROM community_follows WHERE follower_id = $1 AND followee_id = $2", [g.me.id, id]),
      p.query(
        `SELECT requester_id, status FROM community_connections
          WHERE LEAST(requester_id, addressee_id) = LEAST($1::bigint, $2::bigint) AND GREATEST(requester_id, addressee_id) = GREATEST($1::bigint, $2::bigint)`,
        [g.me.id, id],
      ),
    ]);
    followed = !!f.rows[0];
    requested = !followed && !!(await p.query("SELECT 1 FROM community_follow_requests WHERE requester_id = $1 AND target_id = $2", [g.me.id, id])).rows[0];
    const row = cn.rows[0];
    if (row?.status === "accepted") connection = "connected";
    else if (row?.status === "pending") connection = Number(row.requester_id) === g.me.id ? "outgoing" : "incoming";
    const meOld = (ageOf(g.me.birthYear) ?? 0) >= MIN_POST_AGE;
    const themOld = (ageOf(await birthYearOf(id)) ?? 0) >= MIN_POST_AGE;
    canMessage = connection === "connected" && meOld && themOld && !iBlocked && c.message_policy !== "nobody";
  }
  // Instagram-style stats: clips (posts, not stories) and likes received
  const st = (await p.query(
    `SELECT count(*) FILTER (WHERE type = 'post')::int AS posts, COALESCE(sum(like_count), 0)::int AS likes
       FROM community_posts WHERE author_id = $1 AND status = 'approved' AND deleted_at IS NULL`,
    [id],
  )).rows[0];
  const story = (await p.query(
    "SELECT EXISTS (SELECT 1 FROM community_posts WHERE author_id = $1 AND type = 'story' AND status = 'approved' AND deleted_at IS NULL AND media_path IS NOT NULL AND expires_at > now()) AS live",
    [id],
  )).rows[0];
  const badges = mine ? await refreshBadges(id) : null;
  if (badges) c.badge = (await p.query("SELECT badge FROM community_profiles WHERE user_id = $1", [id])).rows[0]?.badge ?? c.badge;
  const s = shape(c);
  return json({
    profile: {
      ...s, followed, mine, blocked: iBlocked, connection, canMessage,
      ...(badges ? { badges } : {}),
      requested, restricted: !mine && !!c.private && !followed,
      posts: Number(st.posts), likes: Number(st.likes), liveStory: postingEnabled() && !!story.live, postingEnabled: postingEnabled(), reciterLevel: mine ? Number(c.reciter_level ?? 0) : undefined,
      // the member's own view also shows the progress setting when it is off
      progress: s.progress ?? (mine ? { treeStage: 0, treeType: "", certJuz: [], hidden: true } : null),
    },
  }, 200, NO_STORE);
}
