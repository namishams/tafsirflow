import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, isHttps, json, rateLimited, sameOrigin } from "@/lib/http";
import { passwordProblem } from "@/lib/passwords";
import crypto from "node:crypto";
import { confirmVerification, currentUser, endSession, hashPassword, isAdminEmail, issueVerification, startSession, verifyPassword } from "@/lib/auth";
import { mailConfigured, sendMail } from "@/lib/mail";
import { NextResponse } from "next/server";
import { COUNTRY_CODES, GOALS } from "@/lib/countries";

export const dynamic = "force-dynamic";

async function sendVerification(req: NextRequest, userId: number, email: string, locale: string) {
  const token = await issueVerification(userId);
  const origin = process.env.SITE_URL ?? `${isHttps(req) ? "https" : "http"}://${req.headers.get("host")}`;
  await sendMail(email, "Quran Masterclass – confirm your e-mail", `Confirm your e-mail address to unlock everything (valid for 2 days):\n${origin}/api/auth/verify?token=${token}&locale=${locale}\n\nIf you did not create an account, ignore this e-mail.`).catch(() => undefined);
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

// Passwords must not cross the network in clear text: sign-in is refused over plain HTTP in production
// unless the owner explicitly allows it for testing (ALLOW_INSECURE_AUTH=1).
const insecure = (req: NextRequest) => process.env.NODE_ENV === "production" && !isHttps(req) && process.env.ALLOW_INSECURE_AUTH !== "1";

export async function GET(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (action === "verify") {
    const loc = /^[a-z]{2}$/.test(req.nextUrl.searchParams.get("locale") ?? "") ? req.nextUrl.searchParams.get("locale") : "en";
    const ok = pool() ? await confirmVerification(req.nextUrl.searchParams.get("token") ?? "").catch(() => false) : false;
    const origin = process.env.SITE_URL ?? `${isHttps(req) ? "https" : "http"}://${req.headers.get("host")}`;
    return NextResponse.redirect(`${origin}/${loc}/account?${ok ? "verified=1" : "verify=failed"}`);
  }
  if (action !== "me") return json({ error: "not found" }, 404);
  const user = await currentUser();
  return json({ user, available: !!pool(), secure: !insecure(req), mailEnabled: mailConfigured() });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const p = pool();
  if (!p) return json({ error: "nodb" }, 503);

  if (action === "logout") {
    await endSession();
    return json({ ok: true });
  }
  if (!["login", "register", "forgot", "reset", "resend"].includes(action)) return json({ error: "not found" }, 404);
  if (insecure(req)) return json({ error: "insecure" }, 403);

  const ip = clientIp(req);
  if (rateLimited(`${action}:${ip}`, action === "login" ? 10 : 5, action === "login" ? 10 * 60_000 : 60 * 60_000)) return json({ error: "rate" }, 429);
  if (action === "forgot" || action === "reset") { /* shares the strict hourly limit above */ }

  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string; name?: string; firstName?: string; lastName?: string; country?: string; city?: string; goal?: string; marketing?: boolean; acceptTerms?: boolean; token?: string; locale?: string };

  if (action === "resend") {
    const me = await currentUser();
    if (!me) return json({ error: "invalid" }, 401);
    if (!me.emailVerified && mailConfigured()) await sendVerification(req, me.id, me.email, /^[a-z]{2}$/.test(String(body.locale)) ? String(body.locale) : "en");
    return json({ ok: true });
  }

  if (action === "forgot") {
    // Always answers "ok" so nobody can find out which e-mails have an account
    const email = String(body.email ?? "").trim().toLowerCase();
    if (EMAIL.test(email)) {
      const u = (await p.query("SELECT id FROM users WHERE email = $1", [email])).rows[0];
      if (u) {
        const token = crypto.randomBytes(32).toString("base64url");
        await p.query("DELETE FROM password_resets WHERE user_id = $1", [u.id]);
        await p.query("INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '1 hour')", [crypto.createHash("sha256").update(token).digest("hex"), u.id]);
        const loc = /^[a-z]{2}$/.test(String(body.locale)) ? body.locale : "en";
        const origin = process.env.SITE_URL ?? `${isHttps(req) ? "https" : "http"}://${req.headers.get("host")}`;
        await sendMail(email, "Quran Masterclass – password reset", `Reset your password (valid for 1 hour):\n${origin}/${loc}/account/reset?token=${token}\n\nIf you did not ask for this, ignore this e-mail.`).catch(() => undefined);
      }
    }
    return json({ ok: true });
  }

  if (action === "reset") {
    const password = String(body.password ?? "");
    if (password.length < 10 || password.length > 200) return json({ error: "weak" }, 400);
    const h = crypto.createHash("sha256").update(String(body.token ?? "")).digest("hex");
    const r = (await p.query("DELETE FROM password_resets WHERE token_hash = $1 AND expires_at > now() RETURNING user_id", [h])).rows[0];
    if (!r) return json({ error: "token" }, 400);
    await p.query("UPDATE users SET password_hash = $2 WHERE id = $1", [r.user_id, hashPassword(password)]);
    await p.query("DELETE FROM sessions WHERE user_id = $1", [r.user_id]); // sign out everywhere
    return json({ ok: true });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!EMAIL.test(email)) return json({ error: "email" }, 400);
  if (password.length > 200) return json({ error: "invalid" }, 400);

  if (action === "register") {
    if (passwordProblem(password, email)) return json({ error: "weak" }, 400);
    const clean = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
    const firstName = clean(body.firstName, 60), lastName = clean(body.lastName, 60);
    if (!firstName || !lastName) return json({ error: "name" }, 400);
    const country = String(body.country ?? "").toUpperCase();
    if (!COUNTRY_CODES.includes(country)) return json({ error: "country" }, 400);
    if (body.acceptTerms !== true) return json({ error: "terms" }, 400);
    const goal = (GOALS as readonly string[]).includes(String(body.goal)) ? String(body.goal) : null;
    const name = `${firstName} ${lastName}`;
    const city = clean(body.city, 80) || null;
    const loc = /^[a-z]{2}$/.test(String(body.locale)) ? String(body.locale) : null;
    try {
      const r = await p.query("INSERT INTO users (email, password_hash, name, first_name, last_name, country, city, goal, locale, marketing_opt_in, terms_accepted_at, role, email_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), $11, $12) RETURNING id", [email, hashPassword(password), name, firstName, lastName, country, city, goal, loc, body.marketing === true, isAdminEmail(email) ? "admin" : "user", !mailConfigured()]);
      const uid = Number(r.rows[0].id);
      await startSession(uid, req);
      if (mailConfigured()) await sendVerification(req, uid, email, /^[a-z]{2}$/.test(String(body.locale)) ? String(body.locale) : "en");
    } catch (e) {
      if ((e as { code?: string }).code === "23505") return json({ error: "exists" }, 409);
      return json({ error: "generic" }, 500);
    }
    return json({ user: await currentUser() });
  }

  // brute-force protection per account (in addition to the limit per IP address)
  if (rateLimited(`login-acct:${email}`, 8, 15 * 60_000)) return json({ error: "rate" }, 429);
  // login: always run a hash comparison so timing does not reveal whether the account exists
  const r = await p.query("SELECT id, password_hash FROM users WHERE email = $1", [email]);
  const row = r.rows[0];
  const ok = verifyPassword(password, row?.password_hash ?? "scrypt$00$00");
  if (!row || !ok) return json({ error: "invalid" }, 401);
  await p.query("UPDATE users SET last_login_at = now() WHERE id = $1", [row.id]);
  await startSession(Number(row.id), req);
  return json({ user: await currentUser() });
}
