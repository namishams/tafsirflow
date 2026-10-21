import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText, sharerTier } from "@/lib/communityProfiles";
import { CONTENT_VISIBLE, MIN_POST_AGE, NOT_BLOCKED, NO_STORE, para, talentGate } from "@/lib/talents";
import { POSTING_OFF, postingEnabled, LIVE, notify } from "@/lib/talentPosting";
import { displayBadge } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// Comments on a clip. GET ?before=<id>: a page (oldest first within the page), blocked members left out.
// POST { text }: 16+, own profile, word filter.
const PAGE = 40;
async function livePost(meId: number, id: string) {
  if (!/^\d{1,18}$/.test(id)) return null;
  const r = await pool()!.query(`SELECT p.id, p.author_id FROM community_posts p WHERE p.id = $2 AND (p.author_id = $1 OR (${LIVE} AND ${NOT_BLOCKED("p.author_id")} AND ${CONTENT_VISIBLE("p.author_id")}))`, [meId, id]);
  return r.rows[0] as { id: string; author_id: string } | undefined;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!postingEnabled()) return json({ comments: [], more: null, disabled: true }, 200, NO_STORE); // posting is switched off (config.json)
  const g = await talentGate(req, "comments", 120);
  if (g.res) return g.res;
  const post = await livePost(g.me.id, (await params).id);
  if (!post) return json({ error: "not_found" }, 404);
  const before = req.nextUrl.searchParams.get("before");
  const r = await pool()!.query(
    `SELECT k.id, k.body, k.created_at, k.author_id, c.username, c.display_name, c.verified, c.badge, c.official, c.level, c.shares_total
       FROM community_post_comments k JOIN community_profiles c ON c.user_id = k.author_id
      WHERE k.post_id = $2 AND k.removed_at IS NULL AND NOT c.suspended AND ${NOT_BLOCKED("k.author_id")}
        AND ($3::bigint IS NULL OR k.id < $3)
      ORDER BY k.id DESC LIMIT ${PAGE + 1}`,
    [g.me.id, post.id, before && /^\d{1,18}$/.test(before) ? before : null],
  );
  const rows = r.rows.slice(0, PAGE).reverse();
  return json({
    comments: rows.map((x) => ({
      id: String(x.id), text: x.body, at: x.created_at, mine: Number(x.author_id) === g.me.id,
      canDelete: Number(x.author_id) === g.me.id || Number(post.author_id) === g.me.id,
      author: { username: x.username, name: x.display_name, verified: !!displayBadge(x), badge: displayBadge(x), level: x.level, sharerTier: sharerTier(Number(x.shares_total ?? 0)) },
    })),
    more: r.rows.length > PAGE ? String(rows[0].id) : null,
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!postingEnabled()) return json(POSTING_OFF, 403, NO_STORE); // posting is switched off (config.json)
  const g = await talentGate(req, "comment", 20, { write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const post = await livePost(g.me.id, (await params).id);
  if (!post) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { text?: unknown };
  const text = para(b.text, 501);
  if (!text) return json({ error: "empty" }, 400);
  if (text.length > 500) return json({ error: "too_long" }, 400);
  const bad = await badText(text);
  if (bad) return json({ error: bad }, 400);
  const p = pool()!;
  const r = await p.query("INSERT INTO community_post_comments (post_id, author_id, body) VALUES ($1,$2,$3) RETURNING id, created_at", [post.id, g.me.id, text]);
  await p.query("UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = $1", [post.id]);
  void notify(post.author_id, "comment", g.me.id, post.id);
  return json({ comment: { id: String(r.rows[0].id), text, at: r.rows[0].created_at, mine: true, canDelete: true } }, 200, NO_STORE);
}
