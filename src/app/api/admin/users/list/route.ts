import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, clientIp, rateLimited } from "@/lib/http";

export const dynamic = "force-dynamic";
const PAGE = 25;

// Accounts for /admin/users: total, e-mail search (partial), newest first. Never returns hashes or tokens.
export async function GET(req: NextRequest) {
  const me = await requireAdmin();
  if (!me) return json({ error: "forbidden" }, 403);
  if (rateLimited(`adm-users-list:${me.id}:${clientIp(req)}`, 120, 60_000)) return json({ error: "rate limited" }, 429);
  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") ?? "").trim().slice(0, 100);
  const page = Math.max(1, Math.min(100000, parseInt(sp.get("page") ?? "1", 10) || 1));
  const like = q ? `%${q.replace(/[\\%_]/g, "\\$&")}%` : null;
  const p = pool()!;
  const where = like ? "WHERE u.email ILIKE $1" : "";
  const args = like ? [like] : [];
  const total = (await p.query(`SELECT count(*)::int AS n FROM users u ${where}`, args)).rows[0].n as number;
  const all = like ? (await p.query("SELECT count(*)::int AS n FROM users")).rows[0].n as number : total;
  const r = await p.query(
    `SELECT u.id, u.email, u.created_at, u.plan, u.pro_until, u.last_login_at,
            (u.plan = 'premium' AND (u.pro_until IS NULL OR u.pro_until > now())) AS pro_active,
            (SELECT count(*)::int FROM iap_purchases i WHERE i.user_id = u.id) AS purchases,
            u.last_login_at AS last_activity
       FROM users u ${where} ORDER BY u.created_at DESC, u.id DESC LIMIT ${PAGE} OFFSET ${(page - 1) * PAGE}`, args);
  return json({ total, all, page, pages: Math.max(1, Math.ceil(total / PAGE)), users: r.rows.map((x) => ({
    id: Number(x.id), email: x.email, created_at: x.created_at, plan: x.plan, pro_until: x.pro_until, pro_active: !!x.pro_active, purchases: x.purchases, last_activity: x.last_activity,
  })) });
}
