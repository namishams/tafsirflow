import { pool } from "./db";

// Server-side figures for the community page and the social API
const today = () => Math.floor(Date.now() / 86400000);
const display = (u: { first_name: string | null; last_name: string | null; name: string | null }) =>
  [u.first_name, u.last_name ? u.last_name[0] + "." : ""].filter(Boolean).join(" ") || u.name || "Member";

export type Pulse = { listenersToday: number; secondsToday: number; viewersToday: number; versesToday: number; likes: number; likesWeek: number; comments: number; secondsWeek: number };
export async function pulse(): Promise<Pulse | null> {
  const p = pool();
  if (!p) return null;
  const t = today();
  try {
    const [a, b, c, d, e] = await Promise.all([
      p.query("SELECT count(*)::int AS n FROM listen_people WHERE day = $1", [t]),
      p.query("SELECT coalesce(sum(seconds), 0)::bigint AS s, coalesce(sum(CASE WHEN day = $1 THEN seconds ELSE 0 END), 0)::bigint AS st FROM listen_stats WHERE day >= $1 - 6", [t]),
      p.query("SELECT count(DISTINCT subject)::int AS people, count(*)::int AS n FROM verse_views WHERE day = $1", [t]),
      p.query("SELECT count(*)::int AS n, count(*) FILTER (WHERE created_at > now() - interval '7 days')::int AS w FROM verse_likes"),
      p.query("SELECT count(*)::int AS n FROM comments WHERE status = 'approved'"),
    ]);
    return {
      listenersToday: a.rows[0].n, secondsToday: Number(b.rows[0].st), secondsWeek: Number(b.rows[0].s),
      viewersToday: c.rows[0].people, versesToday: c.rows[0].n, likes: d.rows[0].n, likesWeek: d.rows[0].w, comments: e.rows[0].n,
    };
  } catch { return null; }
}

export type TopKind = "loved" | "viewed" | "shared" | "discussed" | "heard";
export type TopRow = { key: string; n: number };
export async function topVerses(kind: TopKind, week: boolean, limit = 12): Promise<TopRow[]> {
  const p = pool();
  if (!p) return [];
  const t = today();
  const q: Record<TopKind, [string, unknown[]]> = {
    loved: week
      ? ["SELECT verse_key AS key, count(*)::int AS n FROM verse_likes WHERE created_at > now() - interval '7 days' GROUP BY verse_key ORDER BY n DESC, verse_key LIMIT $1", [limit]]
      : ["SELECT verse_key AS key, count(*)::int AS n FROM verse_likes GROUP BY verse_key ORDER BY n DESC, verse_key LIMIT $1", [limit]],
    viewed: week
      ? ["SELECT verse_key AS key, count(*)::int AS n FROM verse_views WHERE day >= $2 GROUP BY verse_key ORDER BY n DESC, verse_key LIMIT $1", [limit, t - 6]]
      : ["SELECT verse_key AS key, views::int AS n FROM verse_stats WHERE views > 0 ORDER BY views DESC, verse_key LIMIT $1", [limit]],
    shared: ["SELECT verse_key AS key, shares::int AS n FROM verse_stats WHERE shares > 0 ORDER BY shares DESC, verse_key LIMIT $1", [limit]],
    discussed: ["SELECT verse_key AS key, count(*)::int AS n FROM comments WHERE status = 'approved' GROUP BY verse_key ORDER BY n DESC, verse_key LIMIT $1", [limit]],
    heard: [`SELECT surah::text AS key, sum(seconds)::bigint AS n FROM listen_stats WHERE day >= $2 GROUP BY surah ORDER BY n DESC LIMIT $1`, [limit, week ? t - 6 : 0]],
  };
  try {
    const [sql, args] = q[kind];
    const r = await p.query(sql, args);
    return r.rows.map((x) => ({ key: String(x.key), n: Number(x.n) }));
  } catch { return []; }
}

export type RecentComment = { id: number; key: string; body: string; author: string; country: string | null; at: string };
export async function recentComments(limit = 12): Promise<RecentComment[]> {
  const p = pool();
  if (!p) return [];
  try {
    const r = await p.query(
      `SELECT c.id, c.verse_key, c.body, c.created_at, u.first_name, u.last_name, u.name, u.country
         FROM comments c JOIN users u ON u.id = c.user_id
        WHERE c.status = 'approved' AND c.parent_id IS NULL ORDER BY c.created_at DESC LIMIT $1`, [limit]);
    return r.rows.map((c) => ({ id: Number(c.id), key: c.verse_key, body: c.body, author: display(c), country: c.country, at: new Date(c.created_at).toISOString() }));
  } catch { return []; }
}

// likes, views and comments for every verse of one surah (for small counters in the player)
export async function surahCounts(surah: number, userId?: number) {
  const p = pool();
  if (!p) return { counts: {}, mine: [] as string[] };
  const like = `${surah}:%`;
  const [l, v, c, m] = await Promise.all([
    p.query("SELECT verse_key, count(*)::int AS n FROM verse_likes WHERE verse_key LIKE $1 GROUP BY verse_key", [like]),
    p.query("SELECT verse_key, views::int AS n FROM verse_stats WHERE verse_key LIKE $1", [like]),
    p.query("SELECT verse_key, count(*)::int AS n FROM comments WHERE verse_key LIKE $1 AND status = 'approved' GROUP BY verse_key", [like]),
    userId ? p.query("SELECT verse_key FROM verse_likes WHERE user_id = $1 AND verse_key LIKE $2", [userId, like]) : Promise.resolve({ rows: [] as { verse_key: string }[] }),
  ]);
  const counts: Record<string, { l: number; v: number; c: number }> = {};
  const put = (rows: { verse_key: string; n: number }[], f: "l" | "v" | "c") => { for (const r of rows) (counts[r.verse_key] ??= { l: 0, v: 0, c: 0 })[f] = r.n; };
  put(l.rows, "l"); put(v.rows, "v"); put(c.rows, "c");
  return { counts, mine: m.rows.map((x) => x.verse_key as string) };
}

export async function myLikes(userId: number): Promise<{ key: string; at: string }[]> {
  const p = pool();
  if (!p) return [];
  const r = await p.query("SELECT verse_key, created_at FROM verse_likes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 300", [userId]);
  return r.rows.map((x) => ({ key: x.verse_key, at: new Date(x.created_at).toISOString() }));
}
