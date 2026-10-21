import QRCode from "qrcode";
import { pool } from "./db";
import { PUBLIC_SITE } from "./site";
import { MOMENT_COLS, MOMENT_SHOWN, momentJson, type MomentRow } from "./sijill";

// The achievement "posts" of a talent profile (Instagram/TikTok structure, owner decision 21.10.2026): the member's
// achievement moments with their reaction counts, plus the MashaAllah total. On the profile the gold heart is the
// MashaAllah: a moment's MashaAllah count is its gold hearts plus the preset "MashaAllah" reactions. Only moments of
// sections the member shows (MOMENT_SHOWN), except on the own profile. The caller checks profile visibility first.
export const MASHAALLAH_REACTIONS = ["like", "mashallah"] as const;
const IN = `(${MASHAALLAH_REACTIONS.map((r) => `'${r}'`).join(",")})`;
const PAGE = 30;

export type ProfileMoment = ReturnType<typeof momentJson> & { mashaallah: number };
export type ProfileMoments = { count: number; mashaallah: number; moments: ProfileMoment[]; more: string | null };
export const NO_MOMENTS: ProfileMoments = { count: 0, mashaallah: 0, moments: [], more: null };

const withMa = (x: MomentRow, locale: string): ProfileMoment => {
  const j = momentJson(x, locale);
  return { ...j, mashaallah: j.counts.like + j.counts.mashallah };
};

/** count, MashaAllah total and the first page of moments of one member (viewerId 0 = signed out) */
export async function profileMoments(viewerId: number, ownerId: number, full: boolean, locale: string): Promise<ProfileMoments> {
  const p = pool();
  if (!p || !ownerId) return NO_MOMENTS;
  const [s, m] = await Promise.all([
    p.query(
      `SELECT (SELECT count(*) FROM community_moments m JOIN community_profiles c ON c.user_id = m.user_id
                WHERE m.user_id = $1 AND ($2 OR ${MOMENT_SHOWN}))::int AS n,
              (SELECT count(*) FROM community_moment_reactions x
                 JOIN community_moments m ON m.id = x.moment_id JOIN community_profiles c ON c.user_id = m.user_id
                WHERE m.user_id = $1 AND ($2 OR ${MOMENT_SHOWN}) AND x.reaction IN ${IN})::int AS ma`,
      [ownerId, full],
    ),
    p.query(
      `SELECT ${MOMENT_COLS} FROM community_moments m JOIN community_profiles c ON c.user_id = m.user_id
        WHERE m.user_id = $2 AND ($3 OR ${MOMENT_SHOWN}) ORDER BY m.id DESC LIMIT ${PAGE + 1}`,
      [viewerId, ownerId, full],
    ),
  ]).catch(() => [null, null] as const);
  if (!s || !m) return NO_MOMENTS;
  const rows = (m.rows as MomentRow[]).slice(0, PAGE);
  return {
    count: Number(s.rows[0]?.n ?? 0),
    mashaallah: Number(s.rows[0]?.ma ?? 0),
    moments: rows.map((x) => withMa(x, locale)),
    more: m.rows.length > PAGE ? String(rows[rows.length - 1].id) : null,
  };
}

/** the same for the open web (/talents/<username>): public, not suspended, not private, 16+ */
export async function publicProfileMoments(username: string, locale: string): Promise<ProfileMoments> {
  const p = pool();
  if (!p || !/^[a-z0-9_.]{3,20}$/.test(username)) return NO_MOMENTS;
  const r = (await p.query(
    `SELECT c.user_id FROM community_profiles c JOIN users u ON u.id = c.user_id
      WHERE c.username = $1 AND c.public AND NOT c.suspended AND NOT c.private
        AND u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= 16`,
    [username],
  ).catch(() => ({ rows: [] as { user_id: string }[] }))).rows[0];
  return r ? profileMoments(0, Number(r.user_id), false, locale) : NO_MOMENTS;
}

/** the public profile link and its QR code as rows of 0/1 (the app draws it with features/exam QrCode) */
export function profileShare(username: string, locale: string) {
  const url = `${PUBLIC_SITE}/${/^[a-z]{2}$/.test(locale) ? locale : "en"}/talents/${username}`;
  const q = QRCode.create(url, { errorCorrectionLevel: "M" });
  const n = q.modules.size, d = q.modules.data;
  return { url, qr: Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => (d[y * n + x] ? "1" : "0")).join("")) };
}

/** "Followed by X and 3 others": people the viewer follows who follow this member (public, not suspended, not blocked) */
export async function followedBy(viewerId: number, ownerId: number) {
  const p = pool();
  if (!p || !viewerId || viewerId === ownerId) return null;
  const r = await p.query(
    `SELECT c.username, c.display_name AS name, c.avatar_path, c.avatar_version, count(*) OVER ()::int AS total
       FROM community_follows a
       JOIN community_follows b ON b.follower_id = a.followee_id AND b.followee_id = $2
       JOIN community_profiles c ON c.user_id = a.followee_id
      WHERE a.follower_id = $1 AND c.public AND NOT c.suspended
        AND NOT EXISTS (SELECT 1 FROM community_blocks x WHERE (x.blocker_id = $1 AND x.blocked_id = c.user_id) OR (x.blocker_id = c.user_id AND x.blocked_id = $1))
      ORDER BY b.created_at DESC LIMIT 3`,
    [viewerId, ownerId],
  ).catch(() => ({ rows: [] as { username: string; name: string; avatar_path: string | null; avatar_version: number; total: number }[] }));
  if (!r.rows.length) return null;
  return {
    total: Number(r.rows[0].total),
    users: r.rows.map((x) => ({ username: x.username, name: x.name, avatar: x.avatar_path ? `/api/community/avatar/${x.username}?v=${Number(x.avatar_version ?? 0)}` : null })),
  };
}
