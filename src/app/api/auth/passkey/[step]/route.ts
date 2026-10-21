import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, isHttps, json, rateLimited, sameOrigin } from "@/lib/http";
import { currentUser, recentlyConfirmed, startSession } from "@/lib/auth";
import {
  authenticationOptions, completeLoginHandoff, createHandoff, dropRegisterHandoff, redeemLoginHandoff, registerHandoffUser,
  registrationOptions, verifyAuthentication, verifyRegistration,
} from "@/lib/passkeys";

export const dynamic = "force-dynamic";

// Passkeys (src/lib/passkeys.ts):
//   POST login-options                         -> { options, challengeId }
//   POST login-verify { challengeId, response, handoff? } -> { user } (web session) | { ok, handoff } (app handoff)
//   POST register-options { handoff? }          -> { options, challengeId } (signed in and confirmed in the last 15 min, or app handoff)
//   POST register-verify { challengeId, response, name?, handoff? } -> { ok, passkey }
//   POST app-start  (app)                       -> { id, secret } for the system sign-in sheet
//   POST app-finish (app) { id, secret }        -> { user, token }
const insecure = (req: NextRequest) => process.env.NODE_ENV === "production" && !isHttps(req) && process.env.ALLOW_INSECURE_AUTH !== "1";
const STEPS = ["login-options", "login-verify", "register-options", "register-verify", "app-start", "app-finish"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ step: string }> }) {
  const { step } = await params;
  if (!STEPS.includes(step)) return json({ error: "not found" }, 404);
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const p = pool();
  if (!p) return json({ error: "nodb" }, 503);
  if (insecure(req)) return json({ error: "insecure" }, 403);
  const ip = clientIp(req);
  const app = !!req.headers.get("x-qmc-app");
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (rateLimited(`passkey:${ip}`, 60, 10 * 60_000)) return json({ error: "rate" }, 429);

  if (step === "login-options") return json(await authenticationOptions(req));

  if (step === "login-verify") {
    if (rateLimited(`passkey-verify:${ip}`, 20, 10 * 60_000)) return json({ error: "rate" }, 429);
    const v = await verifyAuthentication(req, String(body.challengeId ?? ""), body.response as never);
    if (!v.ok) return json({ error: v.error }, v.error === "challenge" ? 400 : 401);
    await p.query("UPDATE users SET last_login_at = now() WHERE id = $1", [v.userId]);
    if (typeof body.handoff === "string" && body.handoff) {
      // signing in for the app: no session in this browser sheet, the app redeems the handoff
      return (await completeLoginHandoff(body.handoff, v.userId)) ? json({ ok: true, handoff: true }) : json({ error: "handoff" }, 400);
    }
    const token = await startSession(v.userId, req, "passkey");
    return json({ user: await currentUser(), ...(app ? { token } : {}) });
  }

  if (step === "register-options" || step === "register-verify") {
    const handoff = typeof body.handoff === "string" ? body.handoff : "";
    let userId: number | null = null;
    if (handoff) userId = await registerHandoffUser(handoff);
    else {
      const me = await currentUser();
      if (!me) return json({ error: "login" }, 401);
      // adding a way to sign in is a sensitive step: sign-in or confirmation of the last 15 minutes
      if (step === "register-options" && !(await recentlyConfirmed())) return json({ error: "reauth" }, 403);
      userId = me.id;
    }
    if (!userId) return json({ error: "handoff" }, 400);
    if (step === "register-options") {
      const u = (await p.query("SELECT id, email, name FROM users WHERE id = $1", [userId])).rows[0];
      if (!u) return json({ error: "login" }, 401);
      const count = Number((await p.query("SELECT count(*)::int AS n FROM passkeys WHERE user_id = $1", [userId])).rows[0].n);
      if (count >= 20) return json({ error: "limit" }, 400);
      return json(await registrationOptions(req, { id: Number(u.id), email: u.email, name: u.name }));
    }
    const r = await verifyRegistration(req, userId, String(body.challengeId ?? ""), body.response as never, typeof body.name === "string" ? body.name : undefined);
    if (!r.ok) return json({ error: r.error }, 400);
    if (handoff) await dropRegisterHandoff(handoff);
    return json({ ok: true, passkey: { id: r.id, name: r.name } });
  }

  if (step === "app-start") {
    if (!app) return json({ error: "app" }, 400);
    if (rateLimited(`passkey-app:${ip}`, 20, 10 * 60_000)) return json({ error: "rate" }, 429);
    return json(await createHandoff("login", null));
  }

  // app-finish
  if (!app) return json({ error: "app" }, 400);
  const uid = await redeemLoginHandoff(String(body.id ?? ""), String(body.secret ?? ""));
  if (!uid) return json({ error: "handoff" }, 400);
  const token = await startSession(uid, req, "passkey");
  return json({ user: await currentUser(), token });
}
