import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";
const FROM: Record<string, number> = { week: 6, month: 29, all: 100000 };

// The full ranking for the owner (with e-mail and the hidden flag)
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  const range = req.nextUrl.searchParams.get("range") ?? "week";
  const from = Math.floor(Date.now() / 86400000) - (FROM[range] ?? 6);
  const r = await pool()!.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.country, u.rank_public, u.rank_hidden, sum(p.points)::bigint AS pts, count(*)::int AS days, max(p.day) AS last
       FROM user_points p JOIN users u ON u.id = p.user_id WHERE p.day >= $1 GROUP BY u.id ORDER BY pts DESC LIMIT 200`, [from]);
  return json({ list: r.rows.map((x) => ({ id: Number(x.id), email: x.email, name: [x.first_name, x.last_name].filter(Boolean).join(" "), country: x.country, public: x.rank_public, hidden: x.rank_hidden, points: Number(x.pts), days: x.days, last: Number(x.last) })) });
}

// hide or show a member in the public ranking
export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as { id?: number; hidden?: boolean };
  if (!Number.isInteger(b.id)) return json({ error: "bad request" }, 400);
  await pool()!.query("UPDATE users SET rank_hidden = $1 WHERE id = $2", [b.hidden === true, b.id]);
  return json({ ok: true });
}
