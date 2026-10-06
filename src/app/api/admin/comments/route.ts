import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";
import { filterWords } from "@/lib/moderation";

export const dynamic = "force-dynamic";

// Moderation queue: pending comments, reported comments, recent rejections + the custom word lists
export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  const view = req.nextUrl.searchParams.get("view") ?? "pending";
  const where = view === "reported" ? "c.id IN (SELECT comment_id FROM comment_reports) AND c.status <> 'rejected'" : view === "rejected" ? "c.status = 'rejected'" : view === "approved" ? "c.status = 'approved'" : "c.status = 'pending'";
  const r = await pool()!.query(
    `SELECT c.id, c.verse_key, c.body, c.status, c.flagged, c.reject_reason, c.created_at, u.id AS user_id, u.email, u.first_name, u.last_name, u.country, u.comment_banned, u.comment_strikes,
            (SELECT count(*)::int FROM comment_reports r WHERE r.comment_id = c.id) AS reports
       FROM comments c JOIN users u ON u.id = c.user_id WHERE ${where} ORDER BY c.created_at DESC LIMIT 200`,
  );
  const counts = (await pool()!.query("SELECT (SELECT count(*)::int FROM comments WHERE status='pending') AS pending, (SELECT count(DISTINCT comment_id)::int FROM comment_reports r JOIN comments c ON c.id=r.comment_id WHERE c.status<>'rejected') AS reported")).rows[0];
  return json({ comments: r.rows, counts, words: await filterWords() });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as { op?: string; id?: number; userId?: number; block?: string[]; soft?: string[]; reason?: string };
  const p = pool()!;
  const clean = (a?: string[]) => (Array.isArray(a) ? a.map((w) => String(w).trim().toLowerCase()).filter((w) => w.length >= 2 && w.length <= 60).slice(0, 2000) : []);
  switch (b.op) {
    case "approve":
      await p.query("UPDATE comments SET status = 'approved', reviewed_at = now(), reject_reason = NULL WHERE id = $1", [b.id]);
      await p.query("DELETE FROM comment_reports WHERE comment_id = $1", [b.id]);
      break;
    case "reject":
      await p.query("UPDATE comments SET status = 'rejected', reviewed_at = now(), reject_reason = $2 WHERE id = $1", [b.id, String(b.reason ?? "admin").slice(0, 200)]);
      break;
    case "delete":
      await p.query("DELETE FROM comments WHERE id = $1", [b.id]);
      break;
    case "ban":
      await p.query("UPDATE users SET comment_banned = true WHERE id = $1 AND role <> 'admin'", [b.userId]);
      break;
    case "unban":
      await p.query("UPDATE users SET comment_banned = false, comment_strikes = 0 WHERE id = $1", [b.userId]);
      break;
    case "dismiss":
      await p.query("DELETE FROM comment_reports WHERE comment_id = $1", [b.id]);
      break;
    case "words":
      await p.query("INSERT INTO settings (key, value) VALUES ('filter', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [JSON.stringify({ block: clean(b.block), soft: clean(b.soft) })]);
      break;
    default:
      return json({ error: "bad request" }, 400);
  }
  return json({ ok: true });
}
