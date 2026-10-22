import { cosmeticsOf } from "./store/entitlements";
import { pool } from "./db";
import { sharerTier } from "./communityProfiles";
import { displayBadge, proOf, type Badge } from "./talentBadges";
import { postingEnabled } from "./talentPosting";
import { visibleExtras, type ProfileExtras } from "./profileExtras";

// Data for the public talent pages on the website (/talents/<username>). Only public, not suspended members aged 16
// or older appear on the open web (younger members only inside the signed-in community). Private accounts show the
// header only. No ids, e-mail, real name or birth year.
export type PublicPost = { id: string; type: "story" | "post"; verseKey: string | null; durationMs: number | null; hasVideo: boolean; likes: number; comments: number; at: string };
export type PublicProfile = {
  username: string; name: string; bio: string; country: string | null; rewaya: string; maqam: string; level: string; badge: Badge | null;
  officialChannel: string | null; founder?: boolean; /** bought avatar frame and pinned rare stickers (Vitrine) */ frame?: string | null; showcase?: string[]; /** PRO mark: an active Pro subscription */ pro?: boolean; avatar: string | null; private: boolean; sharerTier: number; ijazahChain: string;
  followers: number; following: number; posts: number; likes: number;
  progress: { treeStage: number; certJuz: number[] } | null;
  highlights: { id: string; title: string; count: number }[];
  clips: PublicPost[];
  /** clips and highlights are switched on (posting.enabled in config.json) */
  posting: boolean;
  /** goals, city, travel the member shows to everyone (profileExtras.ts) */
  extras: ProfileExtras;
};

export async function publicProfile(username: string): Promise<PublicProfile | null> {
  const p = pool();
  if (!p || !/^[a-z0-9_.]{3,20}$/.test(username)) return null;
  const r = (await p.query(
    `SELECT c.*, (SELECT count(*)::int FROM community_follows f WHERE f.followee_id = c.user_id) AS followers,
            (SELECT count(*)::int FROM community_follows f WHERE f.follower_id = c.user_id) AS following,
            (SELECT count(*)::int FROM community_posts x WHERE x.author_id = c.user_id AND x.type = 'post' AND x.status = 'approved' AND x.deleted_at IS NULL) AS posts,
            (SELECT COALESCE(sum(x.like_count), 0)::int FROM community_posts x WHERE x.author_id = c.user_id AND x.status = 'approved' AND x.deleted_at IS NULL) AS likes
       FROM community_profiles c JOIN users u ON u.id = c.user_id
      WHERE c.username = $1 AND c.public AND NOT c.suspended
        AND u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= 16`,
    [username],
  ).catch(() => ({ rows: [] }))).rows[0];
  if (!r) return null;
  const priv = !!r.private;
  const posting = postingEnabled();
  const clips = priv || !posting ? [] : (await p.query(
    `SELECT id, type, verse_key, duration_ms, has_video, like_count, comment_count, created_at FROM community_posts
      WHERE author_id = $1 AND type = 'post' AND status = 'approved' AND deleted_at IS NULL AND media_path IS NOT NULL
      ORDER BY created_at DESC LIMIT 60`,
    [r.user_id],
  )).rows;
  const hl = priv || !posting ? [] : (await p.query(
    `SELECT h.id, h.title, count(i.post_id)::int AS n FROM community_highlights h JOIN community_highlight_items i ON i.highlight_id = h.id
       JOIN community_posts x ON x.id = i.post_id AND x.status = 'approved' AND x.deleted_at IS NULL AND x.media_path IS NOT NULL
      WHERE h.owner_id = $1 GROUP BY h.id ORDER BY h.created_at LIMIT 30`,
    [r.user_id],
  )).rows;
  return {
    username: r.username, name: r.display_name, bio: r.bio, country: r.country, rewaya: r.rewaya ?? "", maqam: r.maqam ?? "", level: r.level ?? "talent",
    badge: displayBadge(r), pro: proOf(r), frame: cosmeticsOf(r).frame, showcase: r.showcase ?? [], officialChannel: r.official ? r.official_channel ?? null : null, founder: !!r.founder,
    avatar: r.avatar_path ? `/api/community/avatar/${r.username}?v=${Number(r.avatar_version ?? 0)}` : null,
    posting,
    extras: priv ? {} : visibleExtras(r, "other"),
    private: priv, sharerTier: sharerTier(Number(r.shares_total ?? 0)), ijazahChain: r.ijazah_chain ?? "",
    followers: Number(r.followers), following: Number(r.following), posts: Number(r.posts), likes: Number(r.likes),
    progress: r.show_progress ? { treeStage: Number(r.tree_stage ?? 0), certJuz: (r.cert_juz ?? []).map(Number) } : null,
    highlights: hl.map((h) => ({ id: String(h.id), title: h.title, count: Number(h.n) })),
    clips: clips.map((x) => ({ id: String(x.id), type: x.type, verseKey: x.verse_key, durationMs: x.duration_ms, hasVideo: !!x.has_video, likes: Number(x.like_count), comments: Number(x.comment_count ?? 0), at: x.created_at })),
  };
}

/** usernames of public, badged members aged 16+ for the sitemap */
export async function indexableTalents(limit = 5000): Promise<string[]> {
  const p = pool();
  if (!p) return [];
  const r = await p.query(
    `SELECT c.username FROM community_profiles c JOIN users u ON u.id = c.user_id
      WHERE c.public AND NOT c.suspended AND (c.official OR c.verified OR c.badge <> 'none')
        AND u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= 16
      ORDER BY c.created_at LIMIT $1`,
    [limit],
  ).catch(() => ({ rows: [] as { username: string }[] }));
  return r.rows.map((x) => x.username);
}
