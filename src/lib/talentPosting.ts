import type { User } from "./auth";
import { pool } from "./db";
import { removeMedia } from "./media";
import { ageOf, MIN_POST_AGE } from "./talents";
import { VERSE_COUNTS } from "./counts";
import raw from "./feed/config.json";
import { certifiedReciterLevel, displayBadge, refreshBadges } from "./talentBadges";

// Who may post recitation clips (owner decisions 21.10.2026): ALL of 16+, a learning level (Reciter Path level,
// reported by the app) and a verified profile (application approved by an admin). Pro only when requirePro is
// switched on (default off: all social features are free). The numbers come from `posting` in
// src/lib/feed/config.json, so they can change without an app update.
export type PostingRules = { enabled: boolean; requirePro: boolean; minReciterLevel: number; requireVerified: boolean; minAge: number; minSeconds: number; maxSeconds: number; storyHours: number; postsPerDay: number };
const DEFAULTS: PostingRules = { enabled: false, requirePro: false, minReciterLevel: 3, requireVerified: true, minAge: MIN_POST_AGE, minSeconds: 10, maxSeconds: 30, storyHours: 24, postsPerDay: 5 };

export function postingRules(): PostingRules {
  const p = ((raw as { posting?: Partial<PostingRules> }).posting ?? {}) as Partial<PostingRules>;
  const num = (v: unknown, d: number, min: number, max: number) => (typeof v === "number" && Number.isFinite(v) ? Math.max(min, Math.min(max, Math.floor(v))) : d);
  return {
    // owner decision 21.10.2026: the network shows learning achievements only; posting is off unless switched on
    enabled: p.enabled === true,
    requirePro: typeof p.requirePro === "boolean" ? p.requirePro : DEFAULTS.requirePro,
    requireVerified: typeof p.requireVerified === "boolean" ? p.requireVerified : DEFAULTS.requireVerified,
    minReciterLevel: num(p.minReciterLevel, DEFAULTS.minReciterLevel, 0, 20),
    minAge: num(p.minAge, DEFAULTS.minAge, MIN_POST_AGE, 99), // never below 16
    minSeconds: num(p.minSeconds, DEFAULTS.minSeconds, 3, 60),
    maxSeconds: num(p.maxSeconds, DEFAULTS.maxSeconds, 5, 60),
    storyHours: num(p.storyHours, DEFAULTS.storyHours, 1, 72),
    postsPerDay: num(p.postsPerDay, DEFAULTS.postsPerDay, 1, 50),
  };
}

/** clips, stories, comments and likes on clips are available (posting.enabled in config.json) */
export const postingEnabled = () => postingRules().enabled;
/** the answer of the clip endpoints while posting is switched off */
export const POSTING_OFF = { error: "posting_disabled" } as const;

export type PostingStatus = {
  ok: boolean;
  /** false: posting is switched off for everybody (the checklist is not shown) */
  enabled: boolean;
  rules: PostingRules;
  age: { ok: boolean };
  pro: { ok: boolean; required: boolean };
  level: { ok: boolean; have: number; need: number };
  verified: { ok: boolean; required: boolean; badge: string | null; application: "none" | "pending" | "approved" | "rejected"; reason?: string };
  profile: boolean;
};

export async function postingStatus(me: User): Promise<PostingStatus> {
  const rules = postingRules();
  const p = pool()!;
  await refreshBadges(me.id);
  const prof = (await p.query("SELECT verified, badge, official, founder, reciter_level, suspended FROM community_profiles WHERE user_id = $1", [me.id])).rows[0];
  const app = (await p.query("SELECT status, reject_reason FROM community_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", [me.id])).rows[0];
  const age = { ok: (ageOf(me.birthYear) ?? 0) >= rules.minAge };
  const pro = { ok: !rules.requirePro || me.plan === "premium", required: rules.requirePro };
  // the level counts only from the exam module's signed certificates (server-timed), not from the device
  const have = await certifiedReciterLevel(me.id);
  const level = { ok: have >= rules.minReciterLevel, have, need: rules.minReciterLevel };
  const verified = {
    ok: !rules.requireVerified || (!!prof && !!displayBadge(prof)), required: rules.requireVerified, badge: prof ? displayBadge(prof) : null,
    application: (prof?.verified ? "approved" : app?.status ?? "none") as PostingStatus["verified"]["application"],
    ...(app?.status === "rejected" && app.reject_reason ? { reason: String(app.reject_reason) } : {}),
  };
  const profile = !!prof && !prof.suspended;
  return { ok: rules.enabled && profile && age.ok && pro.ok && level.ok && verified.ok, enabled: rules.enabled, rules, age, pro, level, verified, profile };
}

/** "2:255" or "2:255-257" inside the Quran; returns the normalised key or null */
export function verseKey(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const m = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/.exec(v.trim());
  if (!m) return null;
  const s = Number(m[1]), a = Number(m[2]), b = m[3] ? Number(m[3]) : a;
  if (s < 1 || s > 114 || a < 1 || b < a || b > VERSE_COUNTS[s - 1] || b - a > 10) return null;
  return a === b ? `${s}:${a}` : `${s}:${a}-${b}`;
}

/** a post as the app sees it (never the author's id or the file path) */
export type PostRow = {
  id: string; type: string; verse_key: string | null; duration_ms: number | null; has_video: boolean; waveform: number[] | null; caption: string;
  status: string; created_at: string; expires_at: string | null; like_count: number; liked?: boolean; reject_reason?: string; comment_count?: number; saved?: boolean;
  username: string; display_name: string; verified: boolean; level: string; shares_total: number; media_path: string | null; badge?: string; official?: boolean;
};
export const POST_COLS = `p.id, p.type, p.verse_key, p.duration_ms, p.has_video, p.waveform, p.caption, p.status, p.created_at, p.expires_at, p.like_count,
  p.reject_reason, p.media_path, p.comment_count, c.username, c.display_name, c.verified, c.level, c.shares_total, c.badge, c.official, c.founder`;
export function postJson(r: PostRow, own = false) {
  return {
    id: String(r.id), type: r.type, verseKey: r.verse_key, durationMs: r.duration_ms, hasVideo: !!r.has_video, waveform: (r.waveform ?? []).map(Number),
    caption: r.caption, at: r.created_at, expiresAt: r.expires_at, likes: Number(r.like_count), liked: !!r.liked, comments: Number(r.comment_count ?? 0), saved: !!r.saved,
    media: r.media_path ? `/api/community/media/${r.id}` : null,
    author: { username: r.username, name: r.display_name, verified: !!displayBadge(r), badge: displayBadge(r), level: r.level, sharerTier: 0 },
    ...(own ? { status: r.status, rejectReason: r.reject_reason || "" } : {}),
  };
}

// stories expire after storyHours; their files go, rejected and removed media too (data minimisation).
// Called lazily (at most every 10 minutes) from the reels and admin endpoints; no cron needed.
let lastCleanup = 0;
export async function cleanupMedia(force = false) {
  if (!force && Date.now() - lastCleanup < 10 * 60_000) return;
  lastCleanup = Date.now();
  const p = pool();
  if (!p) return;
  try {
    const r = await p.query(
      `SELECT id, media_path FROM community_posts
        WHERE media_path IS NOT NULL AND (
              (type = 'story' AND status = 'approved' AND expires_at IS NOT NULL AND expires_at < now()
                AND NOT EXISTS (SELECT 1 FROM community_highlight_items h WHERE h.post_id = community_posts.id))
           OR status IN ('rejected','removed')
           OR deleted_at IS NOT NULL)
        LIMIT 500`,
    );
    for (const x of r.rows) await removeMedia(x.media_path);
    if (r.rows.length) {
      await p.query("UPDATE community_posts SET media_path = NULL, deleted_at = COALESCE(deleted_at, now()) WHERE id = ANY($1::bigint[])", [r.rows.map((x) => x.id)]);
    }
  } catch { /* next time */ }
}

/** removes a post's file and clears the path (author delete, admin reject/remove) */
export async function dropPostMedia(id: string | number) {
  const r = await pool()!.query("SELECT media_path FROM community_posts WHERE id = $1", [id]);
  await removeMedia(r.rows[0]?.media_path);
  await pool()!.query("UPDATE community_posts SET media_path = NULL WHERE id = $1", [id]);
}

/** a notification for `userId` (never to oneself); failures are ignored */
export async function notify(userId: number | string, kind: string, actorId: number | null, postId: number | string | null = null) {
  if (actorId !== null && Number(actorId) === Number(userId)) return;
  try {
    // one "like" or "follow" per actor and post is enough (no spam when toggled)
    if (kind === "like" || kind === "follow") {
      const d = await pool()!.query("SELECT 1 FROM community_notifications WHERE user_id = $1 AND kind = $2 AND actor_id IS NOT DISTINCT FROM $3 AND post_id IS NOT DISTINCT FROM $4", [userId, kind, actorId, postId]);
      if (d.rows[0]) return;
    }
    await pool()!.query("INSERT INTO community_notifications (user_id, kind, actor_id, post_id) VALUES ($1,$2,$3,$4)", [userId, kind, actorId, postId]);
  } catch { /* not essential */ }
}

/** what a post viewer needs to know: liked and saved by me */
export const VIEWER_COLS = `EXISTS (SELECT 1 FROM community_post_likes l WHERE l.post_id = p.id AND l.user_id = $1) AS liked,
  EXISTS (SELECT 1 FROM community_post_saves sv WHERE sv.post_id = p.id AND sv.user_id = $1) AS saved`;
/** approved and live */
export const LIVE = "p.status = 'approved' AND p.deleted_at IS NULL AND p.media_path IS NOT NULL AND (p.expires_at IS NULL OR p.expires_at > now() OR EXISTS (SELECT 1 FROM community_highlight_items h WHERE h.post_id = p.id))";

/** account deletion: every file of the member in MEDIA_DIR (clips, verification samples, avatar); the rows go with
 *  ON DELETE CASCADE when the user is deleted */
export async function deleteUserMedia(userId: number) {
  const p = pool();
  if (!p) return;
  const files = await p.query(
    `SELECT media_path AS f FROM community_posts WHERE author_id = $1 AND media_path IS NOT NULL
     UNION ALL SELECT sample_path FROM community_verifications WHERE user_id = $1 AND sample_path IS NOT NULL
     UNION ALL SELECT avatar_path FROM community_profiles WHERE user_id = $1 AND avatar_path IS NOT NULL`,
    [userId],
  ).catch(() => ({ rows: [] as { f: string }[] }));
  for (const r of files.rows) await removeMedia(r.f);
}
