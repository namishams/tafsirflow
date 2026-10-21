import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { NOT_BLOCKED, NO_STORE, canSeeContent, line, talentGate } from "@/lib/talents";
import { removeMedia, storeUpload } from "@/lib/media";
import { LIVE, POST_COLS, VIEWER_COLS, postJson, postingRules, postingStatus, verseKey, type PostRow } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// GET ?u=<username>&type=post|story&cursor=: a member's clips for the profile grid (approved and live; the author also sees pending
// and rejected ones). POST multipart: a recitation clip recorded in the app – file, type (story|post), verseKey,
// durationMs, hasVideo, waveform (JSON array 0..100), wordCheck (0..100), caption. Status pending until an admin approves.
const PAGE = 30;
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "posts", 90);
  if (g.res) return g.res;
  const sp = req.nextUrl.searchParams;
  const p = pool()!;
  const prof = (await p.query(
    `SELECT c.user_id, c.private FROM community_profiles c WHERE c.username = $2 AND (c.user_id = $1 OR (c.public AND NOT c.suspended AND ${NOT_BLOCKED("c.user_id")}))`,
    [g.me.id, String(sp.get("u") ?? "").toLowerCase().slice(0, 40)],
  )).rows[0];
  if (!prof) return json({ error: "not_found" }, 404);
  const own = Number(prof.user_id) === g.me.id;
  if (!(await canSeeContent(g.me.id, Number(prof.user_id), !!prof.private))) return json({ posts: [], next: null, restricted: true }, 200, NO_STORE);
  const offset = Math.max(0, Math.min(5000, Math.floor(Number(sp.get("cursor")) || 0)));
  const r = await p.query(
    `SELECT ${POST_COLS}, ${VIEWER_COLS}
       FROM community_posts p JOIN community_profiles c ON c.user_id = p.author_id
      WHERE p.author_id = $2 AND ${own
        ? "((p.deleted_at IS NULL AND p.status IN ('pending','approved') AND (p.expires_at IS NULL OR p.expires_at > now())) OR (p.status = 'rejected' AND p.created_at > now() - interval '14 days'))"
        : LIVE}
        AND ($4::text IS NULL OR p.type = $4)
      ORDER BY p.created_at DESC LIMIT ${PAGE + 1} OFFSET $3`,
    [g.me.id, prof.user_id, offset, sp.get("type") === "story" || sp.get("type") === "post" ? sp.get("type") : null],
  );
  return json({ posts: r.rows.slice(0, PAGE).map((x) => postJson(x as PostRow, own)), next: r.rows.length > PAGE ? String(offset + PAGE) : null }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const rules = postingRules();
  const g = await talentGate(req, "post-upload", rules.postsPerDay, { windowMs: 24 * 60 * 60_000, write: true, minAge: rules.minAge, needProfile: true });
  if (g.res) return g.res;
  const status = await postingStatus(g.me);
  if (!status.ok) return json({ error: "posting_locked", status }, 403);
  const p = pool()!;
  const today = await p.query("SELECT count(*)::int AS n FROM community_posts WHERE author_id = $1 AND created_at > now() - interval '1 day'", [g.me.id]);
  if (Number(today.rows[0].n) >= rules.postsPerDay) return json({ error: "slow_down" }, 429);
  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: "bad_request" }, 400);
  const type = form.get("type") === "story" ? "story" : form.get("type") === "post" ? "post" : null;
  const key = verseKey(form.get("verseKey"));
  const durationMs = Math.floor(Number(form.get("durationMs")));
  const hasVideo = form.get("hasVideo") === "1" || form.get("hasVideo") === "true";
  const wordCheck = Math.max(0, Math.min(100, Math.floor(Number(form.get("wordCheck")) || 0)));
  const caption = line(form.get("caption"), 300);
  let waveform: number[] = [];
  try { const w = JSON.parse(String(form.get("waveform") ?? "[]")); if (Array.isArray(w)) waveform = w.slice(0, 120).map((n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)))); } catch { /* none */ }
  if (!type || !key) return json({ error: "bad_request" }, 400);
  if (!(durationMs >= rules.minSeconds * 1000 - 300 && durationMs <= rules.maxSeconds * 1000 + 700)) return json({ error: "duration" }, 400);
  const bad = await badText(caption);
  if (bad) return json({ error: bad }, 400);
  const file = form.get("file");
  if (!(file instanceof File) || file.size < 1000) return json({ error: "media_required" }, 400);
  if (file.size > 45 * 1024 * 1024) return json({ error: "media_too_large" }, 400);
  const ins = await p.query(
    `INSERT INTO community_posts (author_id, type, verse_key, duration_ms, has_video, waveform, word_check, caption, media_kind, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending') RETURNING id`,
    [g.me.id, type, key, durationMs, hasVideo, waveform, wordCheck, caption, hasVideo ? "video" : "audio"],
  );
  const id = String(ins.rows[0].id);
  const stored = await storeUpload(Buffer.from(await file.arrayBuffer()), "posts", `p${id}`, { wantVideo: hasVideo, maxSeconds: rules.maxSeconds });
  if ("error" in stored) {
    await p.query("DELETE FROM community_posts WHERE id = $1", [id]);
    return json({ error: stored.error }, stored.error === "media_unavailable" ? 503 : 400);
  }
  try {
    await p.query("UPDATE community_posts SET media_path = $2, media_mime = $3, has_video = $4 WHERE id = $1", [id, stored.rel, stored.mime, stored.mime.startsWith("video/")]);
  } catch (e) { await removeMedia(stored.rel); throw e; }
  return json({ id, status: "pending" }, 200, NO_STORE);
}
