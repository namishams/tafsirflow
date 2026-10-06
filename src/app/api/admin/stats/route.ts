import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  const p = pool()!;
  const one = async (sql: string) => Number((await p.query(sql)).rows[0].n);
  return json({
    users: await one("SELECT count(*) AS n FROM users"),
    usersWeek: await one("SELECT count(*) AS n FROM users WHERE created_at > now() - interval '7 days'"),
    sessions: await one("SELECT count(*) AS n FROM sessions WHERE expires_at > now()"),
    cached: await one("SELECT count(*) AS n FROM api_cache"),
    entries: await one("SELECT count(*) AS n FROM tafsir_entries"),
    drafts: await one("SELECT count(*) AS n FROM tafsir_entries WHERE status = 'draft'"),
  });
}
