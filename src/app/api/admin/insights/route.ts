import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// Everything that happens on the site, for the owner: 30-day series and top lists
export async function GET() {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  const p = pool()!;
  const t = Math.floor(Date.now() / 86400000), from = t - 29;
  const q = async (sql: string, args: unknown[] = []) => (await p.query(sql, args)).rows;
  const [listen, listeners, views, learners, signups, topSurahs, topReciters, totals, social] = await Promise.all([
    q("SELECT day, sum(seconds)::bigint AS s, sum(verses)::bigint AS v FROM listen_stats WHERE day >= $1 GROUP BY day", [from]),
    q("SELECT day, count(*)::int AS n FROM listen_people WHERE day >= $1 GROUP BY day", [from]),
    q("SELECT day, count(*)::int AS n, count(DISTINCT subject)::int AS people FROM verse_views WHERE day >= $1 GROUP BY day", [from]),
    q("SELECT day, count(*)::int AS n, sum(points)::bigint AS pts FROM user_points WHERE day >= $1 GROUP BY day", [from]),
    q("SELECT floor(extract(epoch FROM created_at) / 86400)::int AS day, count(*)::int AS n FROM users WHERE created_at > now() - interval '30 days' GROUP BY 1"),
    q("SELECT surah, sum(seconds)::bigint AS s, sum(verses)::bigint AS v FROM listen_stats WHERE day >= $1 GROUP BY surah ORDER BY s DESC LIMIT 15", [from]),
    q("SELECT reciter, sum(seconds)::bigint AS s FROM listen_stats WHERE day >= $1 GROUP BY reciter ORDER BY s DESC LIMIT 10", [from]),
    q(`SELECT (SELECT coalesce(sum(seconds), 0) FROM listen_stats)::bigint AS listen_all, (SELECT count(*) FROM users)::int AS users,
              (SELECT count(*) FROM users WHERE email_verified)::int AS verified, (SELECT count(DISTINCT user_id) FROM user_points)::int AS rankers,
              (SELECT coalesce(sum(views), 0) FROM verse_stats)::bigint AS views, (SELECT coalesce(sum(shares), 0) FROM verse_stats)::bigint AS shares`),
    q(`SELECT (SELECT count(*) FROM verse_likes)::int AS likes, (SELECT count(*) FROM comments WHERE status = 'approved')::int AS comments,
              (SELECT count(*) FROM comments WHERE status = 'pending')::int AS pending, (SELECT count(*) FROM feedback_posts)::int AS feedback`).catch(() => [{}]),
  ]);
  const by = <T,>(rows: Record<string, unknown>[], f: (r: Record<string, unknown>) => T) => { const m = new Map<number, T>(); for (const r of rows) m.set(Number(r.day), f(r)); return m; };
  const L = by(listen, (r) => ({ s: Number(r.s), v: Number(r.v) })), P = by(listeners, (r) => Number(r.n)), V = by(views, (r) => ({ n: Number(r.n), people: Number(r.people) })), U = by(learners, (r) => ({ n: Number(r.n), pts: Number(r.pts) })), S = by(signups, (r) => Number(r.n));
  const series = Array.from({ length: 30 }, (_, i) => { const d = from + i; return { day: d, listenSec: L.get(d)?.s ?? 0, versesHeard: L.get(d)?.v ?? 0, listeners: P.get(d) ?? 0, views: V.get(d)?.n ?? 0, readers: V.get(d)?.people ?? 0, learners: U.get(d)?.n ?? 0, points: U.get(d)?.pts ?? 0, signups: S.get(d) ?? 0 }; });
  return json({
    series,
    topSurahs: topSurahs.map((r) => ({ surah: Number(r.surah), sec: Number(r.s), verses: Number(r.v) })),
    topReciters: topReciters.map((r) => ({ reciter: String(r.reciter || "–"), sec: Number(r.s) })),
    totals: { ...Object.fromEntries(Object.entries(totals[0] ?? {}).map(([k, v]) => [k, Number(v)])), ...Object.fromEntries(Object.entries(social[0] ?? {}).map(([k, v]) => [k, Number(v)])) },
  });
}
