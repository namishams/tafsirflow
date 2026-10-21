import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, isHttps, json, rateLimited, sameOrigin } from "@/lib/http";
import { currentUser, isAdminEmail, markConfirmed, NO_PASSWORD, startSession } from "@/lib/auth";
import { checkCaptcha } from "@/lib/captcha";
import { checkCode, dropTicket, EMAIL_RE, issueCode, issueTicket, normEmail, peekTicket, RESEND_SECONDS, type CodePurpose } from "@/lib/emailCode";
import { readSignupProfile } from "@/lib/signup";

export const dynamic = "force-dynamic";

// E-mail code sign-in (website and app, 21.10.2026):
//   POST /api/auth/code/request  { email, locale, purpose?: "signin" | "confirm", captcha? }  -> always { ok } for any address
//   POST /api/auth/code/verify   { email, code }  -> { user, token? } | { registrationRequired, ticket }
//   POST /api/auth/code/register { ticket, firstName, lastName, country, birthYear, acceptTerms, marketing?, city?, goal?, locale? }
//   POST /api/auth/code/confirm  { code }  (signed in) -> confirms a sensitive step (15 minutes) and the address
// The app (header x-qmc-app) gets the session token in the answer and keeps it in the keychain.
const insecure = (req: NextRequest) => process.env.NODE_ENV === "production" && !isHttps(req) && process.env.ALLOW_INSECURE_AUTH !== "1";
const lang = (v: unknown) => (/^[a-z]{2}$/.test(String(v)) ? String(v) : "en");

export async function POST(req: NextRequest, { params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!["request", "verify", "register", "confirm"].includes(step)) return json({ error: "not found" }, 404);
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const p = pool();
  if (!p) return json({ error: "nodb" }, 503);
  if (insecure(req)) return json({ error: "insecure" }, 403);
  const ip = clientIp(req);
  const app = !!req.headers.get("x-qmc-app");
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (step === "request") {
    const purpose: CodePurpose = body.purpose === "confirm" ? "confirm" : "signin";
    let email = normEmail(body.email);
    if (purpose === "confirm") {
      const me = await currentUser();
      if (!me) return json({ error: "login" }, 401);
      email = me.email;
    } else {
      if (!EMAIL_RE.test(email)) return json({ error: "email" }, 400);
      // per address the limits live in the database (5 an hour, one every 30 s); per IP generous enough for shared
      // mobile-network addresses, tight enough against mail bombing
      if (rateLimited(`code-req:${ip}`, 15, 10 * 60_000) || rateLimited(`code-req-h:${ip}`, 40, 60 * 60_000)) return json({ error: "rate" }, 429);
      // bots like to hammer mail forms: reCAPTCHA on the website (the native app cannot show it; tighter limits above)
      if (!app) {
        const c = await checkCaptcha(body, "code", ip);
        if (c !== "ok") return json({ error: "captcha", challenge: c === "challenge" }, 403);
      }
    }
    const r = await issueCode(email, purpose, lang(body.locale));
    if (r.status === "wait") return json({ error: "wait", retryAfter: r.retryAfter }, 429);
    if (r.status === "rate") return json({ error: "rate" }, 429);
    // the same answer whether the address has an account or not
    return json({ ok: true, resendIn: RESEND_SECONDS });
  }

  if (step === "confirm") {
    const me = await currentUser();
    if (!me) return json({ error: "login" }, 401);
    if (rateLimited(`code-confirm:${me.id}`, 15, 10 * 60_000)) return json({ error: "rate" }, 429);
    const c = await checkCode(me.email, "confirm", String(body.code ?? ""));
    if (!c.ok) return json({ error: c.error, left: c.left }, 400);
    await markConfirmed();
    // the code reached this address, so it is confirmed as well
    await p.query("UPDATE users SET email_verified = true WHERE id = $1", [me.id]);
    return json({ ok: true, user: await currentUser() });
  }

  if (step === "verify") {
    const email = normEmail(body.email);
    if (!EMAIL_RE.test(email)) return json({ error: "email" }, 400);
    if (rateLimited(`code-verify:${ip}`, 30, 10 * 60_000) || rateLimited(`code-verify-mail:${email}`, 20, 10 * 60_000)) return json({ error: "rate" }, 429);
    const c = await checkCode(email, "signin", String(body.code ?? ""));
    if (!c.ok) return json({ error: c.error, left: c.left }, 400);
    const u = (await p.query("SELECT id FROM users WHERE email = $1", [email])).rows[0];
    if (!u) return json({ registrationRequired: true, ticket: await issueTicket(email), email });
    // the code proves the address: an account that was never confirmed is confirmed now
    await p.query("UPDATE users SET email_verified = true, last_login_at = now() WHERE id = $1", [u.id]);
    const token = await startSession(Number(u.id), req, "code");
    return json({ user: await currentUser(), ...(app ? { token } : {}) });
  }

  // register: the welcome form after a correct code for a new address
  if (rateLimited(`code-register:${ip}`, 10, 60 * 60_000)) return json({ error: "rate" }, 429);
  const ticket = String(body.ticket ?? "");
  const email = ticket ? await peekTicket(ticket) : null;
  if (!email) return json({ error: "ticket" }, 400);
  const f = readSignupProfile(body);
  if ("error" in f) return json({ error: f.error }, 400);
  const pr = f.profile;
  let uid: number;
  try {
    const r = await p.query(
      "INSERT INTO users (email, password_hash, name, first_name, last_name, country, city, goal, locale, marketing_opt_in, terms_accepted_at, role, email_verified, birth_year, last_login_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), $11, true, $12, now()) RETURNING id",
      [email, NO_PASSWORD, pr.name, pr.firstName, pr.lastName, pr.country, pr.city, pr.goal, pr.locale, pr.marketing, isAdminEmail(email) ? "admin" : "user", pr.birthYear],
    );
    uid = Number(r.rows[0].id);
  } catch (e) {
    if ((e as { code?: string }).code !== "23505") return json({ error: "generic" }, 500);
    // created in the meantime (second tab): the ticket proves the address, so sign in to that account
    const r = (await p.query("UPDATE users SET email_verified = true, last_login_at = now() WHERE email = $1 RETURNING id", [email])).rows[0];
    if (!r) return json({ error: "generic" }, 500);
    uid = Number(r.id);
  }
  await dropTicket(ticket);
  const token = await startSession(uid, req, "code");
  return json({ user: await currentUser(), created: true, ...(app ? { token } : {}) });
}
