import { pool } from "./db";
import { MOMENT_COLS, MOMENT_SHOWN, SIJILL_COLS, momentJson, sijillOf, type MomentRow, type Sijill } from "./sijill";

// The Sijill on the open web (/talents/<username>): the same rules as publicProfile (public, not suspended, 16+), private
// accounts show nothing, and only the sections the member switched on. Recent achievement moments with their reaction
// counts (reacting needs a sign-in, done in the browser against /api/community/moments/<id>/react).
export type PublicMoment = ReturnType<typeof momentJson>;
export async function publicSijill(username: string, locale: string): Promise<{ sijill: Sijill; moments: PublicMoment[] } | null> {
  const p = pool();
  if (!p || !/^[a-z0-9_.]{3,20}$/.test(username)) return null;
  const r = (await p.query(
    `SELECT ${SIJILL_COLS}, c.private FROM community_profiles c JOIN users u ON u.id = c.user_id
      WHERE c.username = $1 AND c.public AND NOT c.suspended AND NOT c.private
        AND u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= 16`,
    [username],
  ).catch(() => ({ rows: [] }))).rows[0];
  if (!r) return null;
  const sijill = await sijillOf(r, false, locale);
  const m = await p.query(
    `SELECT ${MOMENT_COLS} FROM community_moments m JOIN community_profiles c ON c.user_id = m.user_id
      WHERE m.user_id = $2 AND ${MOMENT_SHOWN} ORDER BY m.id DESC LIMIT 12`,
    [0, r.user_id],
  ).catch(() => ({ rows: [] as MomentRow[] }));
  return { sijill, moments: (m.rows as MomentRow[]).map((x) => momentJson(x, locale)) };
}
