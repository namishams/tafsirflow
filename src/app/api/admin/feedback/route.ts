import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  const r = await pool()!.query(`SELECT p.*, u.email, (SELECT count(*)::int FROM feedback_votes v WHERE v.post_id = p.id) AS votes FROM feedback_posts p JOIN users u ON u.id = p.user_id ORDER BY p.approved, p.created_at DESC LIMIT 300`);
  return json({ posts: r.rows });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as { id?: number; approved?: boolean; status?: string; delete?: boolean };
  const p = pool()!;
  if (b.delete) await p.query("DELETE FROM feedback_posts WHERE id = $1", [b.id]);
  else {
    if (typeof b.approved === "boolean") await p.query("UPDATE feedback_posts SET approved = $2 WHERE id = $1", [b.id, b.approved]);
    if (b.status && ["review", "planned", "progress", "done", "declined"].includes(b.status)) await p.query("UPDATE feedback_posts SET status = $2 WHERE id = $1", [b.id, b.status]);
  }
  return json({ ok: true });
}
