import crypto from "node:crypto";
import type { NextRequest } from "next/server";
import {
  generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse,
  type AuthenticationResponseJSON, type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { pool } from "./db";

// Passkeys (WebAuthn) for quranmasterclass.com (owner, 21.10.2026). The website runs the ceremonies with
// @simplewebauthn/browser; the iOS/Android app opens the website's /account/passkey page in the system sign-in sheet
// (ASWebAuthenticationSession / Custom Tab) and receives the session through a handoff only the app can redeem.
// Only the public key, the signature counter and a name are stored. Env: WEBAUTHN_RP_ID (default
// quranmasterclass.com), WEBAUTHN_ORIGINS (comma-separated, default https://quranmasterclass.com and www).

const RP_NAME = "Quran Masterclass";
const CHALLENGE_MIN = 5;
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const rnd = (n = 18) => crypto.randomBytes(n).toString("base64url");

/** RP ID and allowed origins; on localhost (development) the RP ID is "localhost" */
export function relyingParty(req: NextRequest): { id: string; origins: string[] } {
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(",")[0].trim();
  const bare = host.replace(/:\d+$/, "");
  if (bare === "localhost" || bare === "127.0.0.1") {
    const proto = (req.headers.get("x-forwarded-proto") ?? req.nextUrl.protocol.replace(":", "")) || "http";
    return { id: "localhost", origins: [`${proto}://${host}`] };
  }
  const id = process.env.WEBAUTHN_RP_ID || "quranmasterclass.com";
  const origins = (process.env.WEBAUTHN_ORIGINS || `https://${id},https://www.${id}`).split(",").map((s) => s.trim()).filter(Boolean);
  return { id, origins };
}

// Names for the common passkey providers (AAGUID), so the list says "iCloud Keychain" instead of a number
const PROVIDERS: Record<string, string> = {
  "fbfc3007-154e-4ecc-8c0b-6e020557d7bd": "iCloud Keychain",
  "dd4ec289-e01d-41c9-bb89-70fa845d4bf2": "iCloud Keychain",
  "ea9b8d66-4d01-1d21-3ce4-b6b48cb575d4": "Google Password Manager",
  "adce0002-35bc-c60a-648b-0b25f1f05503": "Chrome on Mac",
  "08987058-cadc-4b81-b6e1-30de50dcbe96": "Windows Hello",
  "9ddd1817-af5a-4672-a2b9-3e3dd95000a9": "Windows Hello",
  "6028b017-b1d4-4c02-b4b3-afcdafc96bb2": "Windows Hello",
  "bada5566-a7aa-401f-bd96-45619a55120d": "1Password",
  "d548826e-79b4-db40-a3d8-11116f7e8349": "Bitwarden",
  "531126d6-e717-415c-9320-3d9aa6981239": "Dashlane",
  "b84e4048-15dc-4dd0-8640-f4f60813c8af": "NordPass",
  "0ea242b4-43c4-4a1b-8b17-dd6d0b6baec6": "Keeper",
  "53414d53-554e-4700-0000-000000000000": "Samsung Pass",
  "f3809540-7f14-49c1-a8b3-8f813b225541": "Enpass",
  "fdb141b2-5d84-443e-8a35-4698c205a502": "KeePassXC",
};
function defaultName(aaguid: string | undefined, ua: string) {
  if (aaguid && PROVIDERS[aaguid]) return PROVIDERS[aaguid];
  if (/iPhone|iPad/.test(ua)) return "iPhone / iPad";
  if (/Macintosh/.test(ua)) return "Mac";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  return "Passkey";
}
export const cleanName = (v: unknown) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);

async function saveChallenge(challenge: string, purpose: "login" | "register", userId: number | null) {
  const p = pool()!;
  const id = rnd();
  if (Math.random() < 0.1) await p.query("DELETE FROM webauthn_challenges WHERE expires_at < now()").catch(() => undefined);
  await p.query("INSERT INTO webauthn_challenges (id, challenge, purpose, user_id, expires_at) VALUES ($1, $2, $3, $4, now() + $5::int * interval '1 minute')",
    [id, challenge, purpose, userId, CHALLENGE_MIN]);
  return id;
}
async function takeChallenge(id: string, purpose: "login" | "register") {
  const r = await pool()!.query("DELETE FROM webauthn_challenges WHERE id = $1 AND purpose = $2 AND expires_at > now() RETURNING challenge, user_id", [String(id), purpose]);
  return r.rows[0] as { challenge: string; user_id: string | null } | undefined;
}

async function userHandle(userId: number): Promise<string> {
  const p = pool()!;
  const r = (await p.query("SELECT webauthn_handle FROM users WHERE id = $1", [userId])).rows[0];
  if (r?.webauthn_handle) return r.webauthn_handle;
  const h = crypto.randomBytes(32).toString("base64url");
  const u = await p.query("UPDATE users SET webauthn_handle = COALESCE(webauthn_handle, $2) WHERE id = $1 RETURNING webauthn_handle", [userId, h]);
  return u.rows[0].webauthn_handle;
}

// ---------- registration (a signed-in account adds a passkey) ----------

export async function registrationOptions(req: NextRequest, user: { id: number; email: string; name: string | null }) {
  const rp = relyingParty(req);
  const existing = (await pool()!.query("SELECT credential_id, transports FROM passkeys WHERE user_id = $1", [user.id])).rows as { credential_id: string; transports: string[] }[];
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: rp.id,
    userName: user.email,
    userDisplayName: user.name || user.email,
    userID: new Uint8Array(Buffer.from(await userHandle(user.id), "base64url")),
    attestationType: "none",
    excludeCredentials: existing.map((c) => ({ id: c.credential_id, transports: c.transports ?? [] })),
    authenticatorSelection: { residentKey: "required", userVerification: "required" },
  });
  return { options, challengeId: await saveChallenge(options.challenge, "register", user.id) };
}

export async function verifyRegistration(req: NextRequest, userId: number, challengeId: string, response: RegistrationResponseJSON, name?: string): Promise<{ ok: true; id: number; name: string } | { ok: false; error: string }> {
  const ch = await takeChallenge(challengeId, "register");
  if (!ch || Number(ch.user_id) !== userId) return { ok: false, error: "challenge" };
  const rp = relyingParty(req);
  let v;
  try {
    v = await verifyRegistrationResponse({ response, expectedChallenge: ch.challenge, expectedOrigin: rp.origins, expectedRPID: rp.id, requireUserVerification: true });
  } catch (e) {
    console.warn("[passkey] registration not verified", (e as Error).message);
    return { ok: false, error: "verify" };
  }
  if (!v.verified) return { ok: false, error: "verify" };
  const info = v.registrationInfo;
  const label = cleanName(name) || defaultName(info.aaguid, req.headers.get("user-agent") ?? "");
  try {
    const r = await pool()!.query(
      "INSERT INTO passkeys (user_id, credential_id, public_key, counter, transports, device_type, backed_up, aaguid, name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
      [userId, info.credential.id, Buffer.from(info.credential.publicKey), info.credential.counter, info.credential.transports ?? [], info.credentialDeviceType, info.credentialBackedUp, info.aaguid, label],
    );
    return { ok: true, id: Number(r.rows[0].id), name: label };
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return { ok: false, error: "exists" };
    throw e;
  }
}

// ---------- sign-in (discoverable credentials: no e-mail needed) ----------

export async function authenticationOptions(req: NextRequest) {
  const options = await generateAuthenticationOptions({ rpID: relyingParty(req).id, userVerification: "required" });
  return { options, challengeId: await saveChallenge(options.challenge, "login", null) };
}

/** the account of a verified passkey assertion, or why not */
export async function verifyAuthentication(req: NextRequest, challengeId: string, response: AuthenticationResponseJSON): Promise<{ ok: true; userId: number } | { ok: false; error: "challenge" | "unknown" | "verify" }> {
  const ch = await takeChallenge(challengeId, "login");
  if (!ch) return { ok: false, error: "challenge" };
  const p = pool()!;
  const row = (await p.query(
    "SELECT k.id, k.user_id, k.credential_id, k.public_key, k.counter, k.transports, u.webauthn_handle FROM passkeys k JOIN users u ON u.id = k.user_id WHERE k.credential_id = $1",
    [String(response?.id ?? "")],
  )).rows[0];
  if (!row) return { ok: false, error: "unknown" };
  // the authenticator names the account it belongs to: it must be the account of this passkey
  const handle = response.response?.userHandle;
  if (handle && row.webauthn_handle && handle !== row.webauthn_handle) return { ok: false, error: "verify" };
  const rp = relyingParty(req);
  let v;
  try {
    v = await verifyAuthenticationResponse({
      response, expectedChallenge: ch.challenge, expectedOrigin: rp.origins, expectedRPID: rp.id, requireUserVerification: true,
      credential: { id: row.credential_id, publicKey: new Uint8Array(row.public_key), counter: Number(row.counter), transports: row.transports ?? [] },
    });
  } catch (e) {
    console.warn("[passkey] sign-in not verified", (e as Error).message);
    return { ok: false, error: "verify" };
  }
  if (!v.verified) return { ok: false, error: "verify" };
  await p.query("UPDATE passkeys SET counter = $2, last_used_at = now(), backed_up = $3 WHERE id = $1", [row.id, v.authenticationInfo.newCounter, v.authenticationInfo.credentialBackedUp]);
  return { ok: true, userId: Number(row.user_id) };
}

// ---------- the app's handoff through the system browser sheet ----------
// login:    the app asks for { id, secret }, opens /<lang>/account/passkey?h=<id>; the page signs in with the passkey and
//           marks the handoff done for that account; the app redeems id + secret for its own session (5 minutes, once).
// register: the signed-in app asks for { id, secret } and opens /<lang>/account/passkey#r=<id>.<secret>; the page adds a
//           passkey to exactly that account (10 minutes, once). The fragment never reaches a server log or referrer.

export async function createHandoff(kind: "login" | "register", userId: number | null) {
  const p = pool()!;
  if (Math.random() < 0.1) await p.query("DELETE FROM app_handoffs WHERE expires_at < now()").catch(() => undefined);
  const id = rnd(), secret = rnd(32);
  await p.query("INSERT INTO app_handoffs (id, secret_hash, kind, user_id, expires_at) VALUES ($1, $2, $3, $4, now() + $5::int * interval '1 minute')",
    [id, sha(secret), kind, userId, kind === "login" ? 5 : 10]);
  return { id, secret };
}

/** the browser finished a passkey sign-in for an app handoff */
export async function completeLoginHandoff(id: string, userId: number): Promise<boolean> {
  const r = await pool()!.query("UPDATE app_handoffs SET done_user_id = $2 WHERE id = $1 AND kind = 'login' AND done_user_id IS NULL AND expires_at > now() RETURNING id", [String(id), userId]);
  return r.rows.length > 0;
}

/** the app redeems a finished login handoff (once) */
export async function redeemLoginHandoff(id: string, secret: string): Promise<number | null> {
  const r = await pool()!.query("DELETE FROM app_handoffs WHERE id = $1 AND secret_hash = $2 AND kind = 'login' AND done_user_id IS NOT NULL AND expires_at > now() RETURNING done_user_id", [String(id), sha(String(secret))]);
  return r.rows[0] ? Number(r.rows[0].done_user_id) : null;
}

/** "id.secret" from the page's fragment -> the account that may add a passkey (not used up yet) */
export async function registerHandoffUser(token: string): Promise<number | null> {
  const parts = String(token ?? "").split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const [id, secret] = parts;
  const r = await pool()!.query("SELECT user_id FROM app_handoffs WHERE id = $1 AND secret_hash = $2 AND kind = 'register' AND expires_at > now()", [id, sha(secret)]);
  return r.rows[0]?.user_id ? Number(r.rows[0].user_id) : null;
}
export async function dropRegisterHandoff(token: string) {
  const [id] = String(token ?? "").split(".");
  if (id) await pool()!.query("DELETE FROM app_handoffs WHERE id = $1 AND kind = 'register'", [id]).catch(() => undefined);
}
