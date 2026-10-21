import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin, clientIp, rateLimited } from "@/lib/http";

export const dynamic = "force-dynamic";

// Plan actions for one account, each one logged in admin_user_actions
export async function POST(req: NextRequest) {
  const me = await requireAdmin();
  if (!me || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (rateLimited(`adm-users-act:${me.id}:${clientIp(req)}`, 30, 60_000)) return json({ error: "rate limited" }, 429);
  const b = (await req.json().catch(() => ({}))) as { id?: unknown; action?: unknown; date?: unknown };
  if (!Number.isInteger(b.id) || typeof b.action !== "string") return json({ error: "bad request" }, 400);
  const id = b.id as number;
  const p = pool()!;
  if (!(await p.query("SELECT 1 FROM users WHERE id = $1", [id])).rowCount) return json({ error: "not found" }, 404);

  let detail: Record<string, unknown> = {};
  if (b.action === "grant_premium") {
    await p.query("UPDATE users SET plan = 'premium', pro_until = NULL WHERE id = $1", [id]);
  } else if (b.action === "grant_pro_until") {
    const m = typeof b.date === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(b.date) : null;
    const end = m ? new Date(`${b.date}T23:59:59Z`) : null;
    if (!end || isNaN(end.getTime()) || end.toISOString().slice(0, 10) !== b.date || end.getTime() <= Date.now() || end.getUTCFullYear() > 2100) return json({ error: "bad date" }, 400);
    await p.query("UPDATE users SET plan = 'premium', pro_until = $2 WHERE id = $1", [id, end.toISOString()]);
    detail = { pro_until: end.toISOString() };
  } else if (b.action === "revoke") {
    await p.query("UPDATE users SET plan = 'free', pro_until = NULL WHERE id = $1", [id]);
  } else return json({ error: "bad request" }, 400);

  await p.query("INSERT INTO admin_user_actions (admin_id, target_user_id, action, detail) VALUES ($1,$2,$3,$4)", [me.id, id, b.action, detail]);
  return json({ ok: true });
}
