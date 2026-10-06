import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json, rateLimited, sameOrigin, clientIp } from "@/lib/http";

export const dynamic = "force-dynamic";
const today = () => Math.floor(Date.now() / 86400000);
const FROM: Record<string, number> = { week: 6, month: 29, all: 100000 };
type Row = { user_id: string; pts: string; first_name: string | null; last_name: string | null; country: string | null; rank_public: boolean };

// Ranking of members by points (week, month, all time) and of countries. Names only for members who opted in.
export async function GET(req: NextRequest) {
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  const range = req.nextUrl.searchParams.get("range") ?? "week";
  const by = req.nextUrl.searchParams.get("by") === "country" ? "country" : "member";
  if (!(range in FROM)) return json({ error: "bad request" }, 400);
  const from = today() - FROM[range];
  const me = await currentUser();
  try {
    if (by === "country") {
      const r = await p.query(
        `SELECT u.country, sum(p.points)::bigint AS pts, count(DISTINCT p.user_id)::int AS people
           FROM user_points p JOIN users u ON u.id = p.user_id
          WHERE p.day >= $1 AND u.country IS NOT NULL AND u.country <> ''
          GROUP BY u.country ORDER BY pts DESC LIMIT 40`, [from]);
      return json({ countries: r.rows.map((x) => ({ country: x.country, points: Number(x.pts), people: x.people })) }, 200, { "Cache-Control": "public, s-maxage=120" });
    }
    const r = await p.query<Row>(
      `WITH t AS (SELECT user_id, sum(points)::bigint AS pts FROM user_points WHERE day >= $1 GROUP BY user_id HAVING sum(points) > 0)
       SELECT t.user_id, t.pts, u.first_name, u.last_name, u.country, u.rank_public FROM t JOIN users u ON u.id = t.user_id
        ORDER BY t.pts DESC, t.user_id ASC LIMIT 50`, [from]);
    const ids = r.rows.map((x) => Number(x.user_id));
    const tot = ids.length ? await p.query("SELECT user_id, sum(points)::bigint AS pts FROM user_points WHERE user_id = ANY($1) GROUP BY user_id", [ids]) : { rows: [] };
    const total = new Map(tot.rows.map((x) => [Number(x.user_id), Number(x.pts)]));
    const count = await p.query("SELECT count(DISTINCT user_id)::int AS n FROM user_points WHERE day >= $1 AND points > 0", [from]);
    let mine: { rank: number | null; points: number; public: boolean } | null = null;
    if (me) {
      const m = await p.query("SELECT coalesce(sum(points), 0)::bigint AS pts FROM user_points WHERE user_id = $1 AND day >= $2", [me.id, from]);
      const pts = Number(m.rows[0].pts);
      const above = pts > 0 ? await p.query("SELECT count(*)::int AS n FROM (SELECT user_id FROM user_points WHERE day >= $1 GROUP BY user_id HAVING sum(points) > $2) x", [from, pts]) : null;
      const pub = await p.query("SELECT rank_public FROM users WHERE id = $1", [me.id]);
      mine = { rank: above ? above.rows[0].n + 1 : null, points: pts, public: !!pub.rows[0]?.rank_public };
    }
    let place = 0, last = -1;
    return json({
      participants: count.rows[0].n,
      list: r.rows.map((x, i) => {
        const pts = Number(x.pts);
        if (pts !== last) { place = i + 1; last = pts; }
        const id = Number(x.user_id);
        return { place, points: pts, total: total.get(id) ?? pts, country: x.country, me: me?.id === id, name: x.rank_public || me?.id === id ? [x.first_name, x.last_name ? `${x.last_name[0]}.` : ""].filter(Boolean).join(" ") || null : null };
      }),
      me: mine,
    }, 200, { "Cache-Control": "private, no-store" });
  } catch {
    return json({ error: "server" }, 500);
  }
}

// opt in or out of showing the name in the ranking
export async function POST(req: NextRequest) {
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (rateLimited(`rank:${clientIp(req)}`, 20, 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { public?: unknown };
  await p.query("UPDATE users SET rank_public = $1 WHERE id = $2", [b.public === true, me.id]);
  return json({ ok: true, public: b.public === true });
}
