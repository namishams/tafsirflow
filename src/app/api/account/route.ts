import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser, endSession, hashPassword, verifyPassword } from "@/lib/auth";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { COUNTRY_CODES, GOALS } from "@/lib/countries";
import { passwordProblem } from "@/lib/passwords";

export const dynamic = "force-dynamic";

const clean = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

// Own profile: everything the account holds about you
export async function GET(req: NextRequest) {
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const p = pool()!;
  const u = (await p.query("SELECT email, first_name, last_name, country, city, goal, birth_year, locale, marketing_opt_in, email_verified, created_at, last_login_at, plan FROM users WHERE id = $1", [me.id])).rows[0];
  if (req.nextUrl.searchParams.get("export") === "1") {
    // data portability (Art. 20 GDPR): the complete account as JSON
    const [data, comments, likes] = await Promise.all([
      p.query("SELECT key, value FROM user_data WHERE user_id = $1", [me.id]),
      p.query("SELECT verse_key, body, status, created_at FROM comments WHERE user_id = $1 ORDER BY created_at", [me.id]),
      p.query("SELECT verse_key, created_at FROM verse_likes WHERE user_id = $1 ORDER BY created_at", [me.id]),
    ]);
    return new Response(JSON.stringify({ exported_at: new Date().toISOString(), profile: u, learning: Object.fromEntries(data.rows.map((r) => [r.key, r.value])), comments: comments.rows, likes: likes.rows }, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8", "content-disposition": 'attachment; filename="quran-masterclass-data.json"', "cache-control": "no-store" },
    });
  }
  const sessions = Number((await p.query("SELECT count(*)::int AS n FROM sessions WHERE user_id = $1 AND expires_at > now()", [me.id])).rows[0].n);
  const social = (await p.query("SELECT (SELECT count(*)::int FROM comments WHERE user_id = $1 AND status = 'approved') AS comments, (SELECT count(*)::int FROM verse_likes WHERE user_id = $1) AS likes", [me.id])).rows[0];
  return json({ profile: u, sessions, social });
}

export async function PUT(req: NextRequest) {
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const first = clean(b.firstName, 60), last = clean(b.lastName, 60);
  if (!first || !last) return json({ error: "name" }, 400);
  const country = String(b.country ?? "").toUpperCase();
  if (!COUNTRY_CODES.includes(country)) return json({ error: "country" }, 400);
  const goal = (GOALS as readonly string[]).includes(String(b.goal)) ? String(b.goal) : null;
  const loc = /^[a-z]{2}$/.test(String(b.locale)) ? String(b.locale) : null;
  const by = Number(b.birthYear);
  const birthYear = Number.isInteger(by) && by >= 1920 && by <= new Date().getFullYear() - 3 ? by : null;
  await pool()!.query("UPDATE users SET first_name = $2, last_name = $3, name = $4, country = $5, city = $6, goal = $7, locale = $8, marketing_opt_in = $9, birth_year = COALESCE($10, birth_year) WHERE id = $1",
    [me.id, first, last, `${first} ${last}`, country, clean(b.city, 80) || null, goal, loc, b.marketing === true, birthYear]);
  return json({ ok: true });
}

export async function POST(req: NextRequest) {
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (rateLimited(`account:${me.id}:${clientIp(req)}`, 10, 15 * 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { action?: string; current?: string; next?: string };
  const p = pool()!;
  const row = (await p.query("SELECT password_hash FROM users WHERE id = $1", [me.id])).rows[0];
  const checkCurrent = () => verifyPassword(String(b.current ?? ""), row?.password_hash ?? "scrypt$00$00");

  if (b.action === "password") {
    if (!checkCurrent()) return json({ error: "current" }, 403);
    if (passwordProblem(String(b.next ?? ""), me.email)) return json({ error: "weak" }, 400);
    await p.query("UPDATE users SET password_hash = $2 WHERE id = $1", [me.id, hashPassword(String(b.next))]);
    return json({ ok: true });
  }
  if (b.action === "logout-all") {
    await p.query("DELETE FROM sessions WHERE user_id = $1", [me.id]);
    await endSession();
    return json({ ok: true });
  }
  if (b.action === "delete") {
    if (!checkCurrent()) return json({ error: "current" }, 403);
    if (me.role === "admin") return json({ error: "admin" }, 400); // the owner account cannot delete itself by accident
    await p.query("DELETE FROM users WHERE id = $1", [me.id]); // sessions, data, comments, likes are removed with it (ON DELETE CASCADE)
    await endSession();
    return json({ ok: true });
  }
  return json({ error: "bad request" }, 400);
}
