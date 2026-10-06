import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  const r = await pool()!.query("SELECT id, email, name, city, role, plan, created_at FROM users ORDER BY created_at DESC LIMIT 500");
  return json({ users: r.rows });
}

// change plan (free/premium) or role of a user
export async function PATCH(req: NextRequest) {
  const me = await requireAdmin();
  if (!me || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as { id?: number; plan?: string; role?: string };
  if (!b.id) return json({ error: "bad request" }, 400);
  if (b.plan && ["free", "premium"].includes(b.plan)) await pool()!.query("UPDATE users SET plan = $2 WHERE id = $1", [b.id, b.plan]);
  if (b.role && ["user", "admin"].includes(b.role) && b.id !== me.id) await pool()!.query("UPDATE users SET role = $2 WHERE id = $1", [b.id, b.role]);
  return json({ ok: true });
}
