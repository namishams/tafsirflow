import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { checkCaptcha } from "@/lib/captcha";
import { moderate } from "@/lib/moderation";

export const dynamic = "force-dynamic";
const CATS = ["feature", "tafsir", "translation", "reciter", "bug", "content"];

// Public board: approved posts with vote counts; your own pending posts are shown to you as well
export async function GET(req: NextRequest) {
  if (!pool()) return json({ posts: [] });
  const me = await currentUser();
  const cat = req.nextUrl.searchParams.get("cat");
  const sort = req.nextUrl.searchParams.get("sort") === "new" ? "p.created_at DESC" : "votes DESC, p.created_at DESC";
  const r = await pool()!.query(
    `SELECT p.id, p.category, p.title, p.body, p.status, p.approved, p.created_at, u.first_name, u.country,
            (SELECT count(*)::int FROM feedback_votes v WHERE v.post_id = p.id) AS votes,
            EXISTS (SELECT 1 FROM feedback_votes v WHERE v.post_id = p.id AND v.user_id = $1) AS voted,
            p.user_id = $1 AS mine
       FROM feedback_posts p JOIN users u ON u.id = p.user_id
      WHERE (p.approved OR p.user_id = $1) AND ($2::text IS NULL OR p.category = $2)
      ORDER BY ${sort} LIMIT 300`,
    [me?.id ?? 0, cat && CATS.includes(cat) ? cat : null],
  );
  return json({ posts: r.rows.map((p) => ({ ...p, id: Number(p.id), author: p.first_name || "Member" })) }, 200, { "Cache-Control": "private, no-store" });
}

export async function POST(req: NextRequest) {
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (!me.emailVerified) return json({ error: "verify" }, 403);
  const b = (await req.json().catch(() => ({}))) as { action?: string; id?: number; category?: string; title?: string; body?: string; captcha?: string };
  if (b.action === "vote") {
    if (!b.id || rateLimited(`fbvote:${me.id}`, 60, 60_000)) return json({ error: "bad request" }, 400);
    const del = await p.query("DELETE FROM feedback_votes WHERE post_id = $1 AND user_id = $2", [b.id, me.id]);
    if (!del.rowCount) await p.query("INSERT INTO feedback_votes (post_id, user_id) SELECT id, $2 FROM feedback_posts WHERE id = $1 AND approved ON CONFLICT DO NOTHING", [b.id, me.id]);
    return json({ ok: true });
  }
  // new post
  const title = String(b.title ?? "").trim(), body = String(b.body ?? "").trim();
  if (!CATS.includes(String(b.category)) || title.length < 6 || title.length > 120 || body.length > 1500) return json({ error: "invalid" }, 400);
  if (rateLimited(`fbpost:${me.id}`, 5, 60 * 60_000)) return json({ error: "rate" }, 429);
  if ((await checkCaptcha(b, "feedback", clientIp(req))) !== "ok") return json({ error: "captcha" }, 400);
  const v1 = await moderate(title), v2 = body ? await moderate(body.slice(0, 500)) : ({ ok: true, flagged: null } as const);
  if (!v1.ok || !v2.ok) return json({ error: "rejected" }, 422);
  await p.query("INSERT INTO feedback_posts (user_id, category, title, body, flagged) VALUES ($1, $2, $3, $4, $5)", [me.id, b.category, title, body, v1.flagged ?? (v2.ok ? v2.flagged : null)]);
  return json({ ok: true, pending: true }, 201);
}
