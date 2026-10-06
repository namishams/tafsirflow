import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { anonCookie } from "@/lib/gate";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { MAX_STRIKES, aiReview, moderate } from "@/lib/moderation";
import { getSettings } from "@/lib/settings";
import { checkCaptcha } from "@/lib/captcha";

export const dynamic = "force-dynamic";

const validKey = (k: unknown): k is string => {
  if (typeof k !== "string" || !/^\d{1,3}:\d{1,3}$/.test(k)) return false;
  const [c, v] = k.split(":").map(Number);
  return c >= 1 && c <= 114 && v >= 1 && v <= 286;
};

const display = (u: { first_name: string | null; last_name: string | null; name: string | null }) =>
  [u.first_name, u.last_name ? u.last_name[0] + "." : ""].filter(Boolean).join(" ") || u.name || "Member";

function anonSubject(req: NextRequest) {
  const had = req.cookies.get("tf_anon")?.value;
  const anon = had ?? crypto.randomBytes(12).toString("hex");
  return { subject: crypto.createHash("sha256").update(clientIp(req) + anon).digest("hex"), setAnon: had ? undefined : anon };
}

function reply(data: unknown, status = 200, setAnon?: string) {
  const res = NextResponse.json(data, { status, headers: { "Cache-Control": "private, no-store" } });
  if (setAnon) res.cookies.set("tf_anon", setAnon, anonCookie);
  return res;
}

async function stats(key: string, userId?: number) {
  const p = pool()!;
  const [s, l, c, me] = await Promise.all([
    p.query("SELECT views, shares FROM verse_stats WHERE verse_key = $1", [key]),
    p.query("SELECT count(*)::int AS n FROM verse_likes WHERE verse_key = $1", [key]),
    p.query("SELECT count(*)::int AS n FROM comments WHERE verse_key = $1 AND status = 'approved'", [key]),
    userId ? p.query("SELECT 1 FROM verse_likes WHERE verse_key = $1 AND user_id = $2", [key, userId]) : Promise.resolve(null),
  ]);
  return { views: Number(s.rows[0]?.views ?? 0), shares: Number(s.rows[0]?.shares ?? 0), likes: l.rows[0].n as number, comments: c.rows[0].n as number, liked: !!me?.rowCount };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!pool()) return json({ error: "unavailable" }, 503);
  const key = req.nextUrl.searchParams.get("key");
  if (!validKey(key)) return json({ error: "bad request" }, 400);
  const me = await currentUser();
  try {
    if (action === "stats") return reply({ ...(await stats(key, me?.id)), signedIn: !!me, verified: !!me?.emailVerified });
    if (action === "comments") {
      const r = await pool()!.query(
        `SELECT c.id, c.parent_id, c.body, c.status, c.created_at, c.user_id, u.first_name, u.last_name, u.name, u.country
           FROM comments c JOIN users u ON u.id = c.user_id
          WHERE c.verse_key = $1 AND (c.status = 'approved' OR (c.user_id = $2 AND c.status <> 'rejected'))
          ORDER BY c.created_at ASC LIMIT 200`,
        [key, me?.id ?? 0],
      );
      return reply({
        comments: r.rows.map((c) => ({ id: Number(c.id), parentId: c.parent_id ? Number(c.parent_id) : null, body: c.body, pending: c.status === "pending", mine: me ? Number(c.user_id) === me.id : false, author: display(c), country: c.country, at: c.created_at })),
      });
    }
  } catch {
    return json({ error: "server" }, 500);
  }
  return json({ error: "not found" }, 404);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as { key?: string; body?: string; parentId?: number; id?: number; reason?: string; captcha?: string };
  const me = await currentUser();
  const ip = clientIp(req);

  try {
    // views and shares: anonymous allowed, counted once per visitor, verse and day
    if (action === "view" || action === "share") {
      if (!validKey(b.key)) return json({ error: "bad request" }, 400);
      if (rateLimited(`soc:${action}:${ip}`, 120, 60_000)) return json({ error: "rate" }, 429);
      const { subject, setAnon } = anonSubject(req);
      if (action === "view") {
        const day = Math.floor(Date.now() / 86400000);
        const ins = await p.query("INSERT INTO verse_views (day, subject, verse_key) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [day, subject, b.key]);
        if (ins.rowCount) await p.query("INSERT INTO verse_stats (verse_key, views) VALUES ($1, 1) ON CONFLICT (verse_key) DO UPDATE SET views = verse_stats.views + 1", [b.key]);
      } else {
        await p.query("INSERT INTO verse_stats (verse_key, shares) VALUES ($1, 1) ON CONFLICT (verse_key) DO UPDATE SET shares = verse_stats.shares + 1", [b.key]);
      }
      return reply(await stats(b.key, me?.id), 200, setAnon);
    }

    // everything below needs a signed-in account with a confirmed e-mail
    if (!me) return json({ error: "login" }, 401);
    if (!me.emailVerified) return json({ error: "verify" }, 403);

    if (action === "like") {
      if (!validKey(b.key)) return json({ error: "bad request" }, 400);
      if (rateLimited(`soc:like:${me.id}`, 60, 60_000)) return json({ error: "rate" }, 429);
      const del = await p.query("DELETE FROM verse_likes WHERE user_id = $1 AND verse_key = $2", [me.id, b.key]);
      if (!del.rowCount) await p.query("INSERT INTO verse_likes (user_id, verse_key) VALUES ($1, $2) ON CONFLICT DO NOTHING", [me.id, b.key]);
      return reply(await stats(b.key, me.id));
    }

    if (action === "comment") {
      if (!validKey(b.key) || typeof b.body !== "string") return json({ error: "bad request" }, 400);
      const u = (await p.query("SELECT comment_banned FROM users WHERE id = $1", [me.id])).rows[0];
      if (u?.comment_banned) return json({ error: "banned" }, 403);
      if (rateLimited(`soc:comment:${me.id}`, 5, 10 * 60_000)) return json({ error: "rate" }, 429);
      if ((await checkCaptcha(b, "comment", ip)) !== "ok") return json({ error: "captcha" }, 400);
      let parent: number | null = null;
      if (b.parentId) {
        const pr = await p.query("SELECT id FROM comments WHERE id = $1 AND verse_key = $2 AND status = 'approved' AND parent_id IS NULL", [b.parentId, b.key]);
        if (!pr.rowCount) return json({ error: "bad request" }, 400);
        parent = Number(pr.rows[0].id);
      }
      const v = await moderate(b.body);
      if (!v.ok) {
        if (v.reason === "word" || v.reason === "links" || v.reason === "contact") {
          // rule violations count as strikes; after MAX_STRIKES the account can no longer comment (admin can lift it)
          const s = await p.query("UPDATE users SET comment_strikes = comment_strikes + 1 WHERE id = $1 RETURNING comment_strikes", [me.id]);
          if (Number(s.rows[0]?.comment_strikes) >= MAX_STRIKES) await p.query("UPDATE users SET comment_banned = true WHERE id = $1", [me.id]);
          await p.query("INSERT INTO comments (user_id, verse_key, parent_id, body, status, reject_reason, reviewed_at) VALUES ($1,$2,$3,$4,'rejected',$5,now())", [me.id, b.key, parent, b.body.trim().slice(0, 500), v.reason === "word" ? `filter: ${v.hit}` : v.reason]);
        }
        return json({ error: "rejected", reason: v.reason }, 422);
      }
      const dup = await p.query("SELECT 1 FROM comments WHERE user_id = $1 AND verse_key = $2 AND body = $3 AND status <> 'rejected'", [me.id, b.key, b.body.trim()]);
      if (dup.rowCount) return json({ error: "duplicate" }, 409);
      // second check by the AI moderator: clear violations are rejected, clean comments go live, anything unclear waits for a human
      const ai = v.flagged ? null : await aiReview(b.body.trim());
      if (ai?.decision === "reject") {
        await p.query("INSERT INTO comments (user_id, verse_key, parent_id, body, status, reject_reason, reviewed_at) VALUES ($1,$2,$3,$4,'rejected',$5,now())", [me.id, b.key, parent, b.body.trim().slice(0, 500), `ai: ${ai.reason}`]);
        return json({ error: "rejected", reason: "ai" }, 422);
      }
      const auto = !v.flagged && ((await getSettings()).commentsAutoApprove || ai?.decision === "approve");
      const flag = v.flagged ?? (ai?.decision === "review" ? `ai: ${ai.reason}` : null);
      const ins = await p.query(
        "INSERT INTO comments (user_id, verse_key, parent_id, body, status, flagged, reviewed_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id",
        [me.id, b.key, parent, b.body.trim(), auto ? "approved" : "pending", flag, auto ? new Date() : null],
      );
      return reply({ ok: true, id: Number(ins.rows[0].id), pending: !auto }, 201);
    }

    if (action === "report") {
      if (!b.id || rateLimited(`soc:report:${me.id}`, 20, 10 * 60_000)) return json({ error: "bad request" }, 400);
      await p.query("INSERT INTO comment_reports (comment_id, user_id, reason) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING", [b.id, me.id, String(b.reason ?? "").slice(0, 200)]);
      return reply({ ok: true });
    }

    if (action === "delete") {
      if (!b.id) return json({ error: "bad request" }, 400);
      await p.query("DELETE FROM comments WHERE id = $1 AND user_id = $2", [b.id, me.id]);
      return reply({ ok: true });
    }
  } catch {
    return json({ error: "server" }, 500);
  }
  return json({ error: "not found" }, 404);
}
