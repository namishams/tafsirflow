import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { currentSessionHash, currentUser, hasPassword, recentlyConfirmed } from "@/lib/auth";
import { cleanName, createHandoff } from "@/lib/passkeys";

export const dynamic = "force-dynamic";

// Security screen (website /account/security and the app's Account → Settings → Security):
//   GET  -> { hasPassword, confirmed, passkeys[], sessions[] }
//   POST { action: "passkey-rename", id, name } | { action: "passkey-delete", id } | { action: "logout-others" }
//        | { action: "logout-session", id } | { action: "passkey-link" } (app: a one-time link to add a passkey in the
//          system sign-in sheet; needs a sign-in or confirmation of the last 15 minutes)
// Session ids are the first 16 characters of the stored hash (the token itself is never shown or stored).
const device = (ua: string | null) => {
  const s = ua ?? "";
  const os = /iPhone/.test(s) ? "iPhone" : /iPad/.test(s) ? "iPad" : /Android/.test(s) ? "Android" : /Mac OS X|Macintosh/.test(s) ? "Mac" : /Windows/.test(s) ? "Windows" : /Linux/.test(s) ? "Linux" : "";
  const br = /Edg\//.test(s) ? "Edge" : /OPR\//.test(s) ? "Opera" : /Firefox\//.test(s) ? "Firefox" : /CriOS|Chrome\//.test(s) ? "Chrome" : /Safari\//.test(s) ? "Safari" : "";
  return [br, os].filter(Boolean).join(" · ");
};

export async function GET() {
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const p = pool()!;
  const mine = await currentSessionHash();
  const [u, keys, sess] = await Promise.all([
    p.query("SELECT password_hash FROM users WHERE id = $1", [me.id]),
    p.query("SELECT id, name, created_at, last_used_at, backed_up, device_type FROM passkeys WHERE user_id = $1 ORDER BY created_at", [me.id]).catch(() => ({ rows: [] })),
    p.query("SELECT token_hash, created_at, method, client, user_agent FROM sessions WHERE user_id = $1 AND expires_at > now() ORDER BY created_at DESC NULLS LAST LIMIT 50", [me.id])
      .catch(() => p.query("SELECT token_hash FROM sessions WHERE user_id = $1 AND expires_at > now() LIMIT 50", [me.id])),
  ]);
  return json({
    email: me.email,
    hasPassword: hasPassword(u.rows[0]?.password_hash),
    confirmed: await recentlyConfirmed(),
    passkeys: keys.rows.map((k) => ({ id: Number(k.id), name: k.name || "Passkey", createdAt: k.created_at, lastUsedAt: k.last_used_at, synced: !!k.backed_up || k.device_type === "multiDevice" })),
    sessions: sess.rows.map((s: Record<string, string | null>) => ({
      id: String(s.token_hash).slice(0, 16), current: s.token_hash === mine, createdAt: s.created_at ?? null, method: s.method ?? null,
      client: s.client ?? null, device: device(s.user_agent ?? null),
    })),
  });
}

export async function POST(req: NextRequest) {
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  if (rateLimited(`security:${me.id}:${clientIp(req)}`, 40, 10 * 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { action?: string; id?: unknown; name?: unknown };
  const p = pool()!;
  const mine = (await currentSessionHash()) ?? "";

  if (b.action === "passkey-rename") {
    const name = cleanName(b.name);
    if (!name) return json({ error: "name" }, 400);
    const r = await p.query("UPDATE passkeys SET name = $3 WHERE id = $1 AND user_id = $2", [Number(b.id), me.id, name]);
    return r.rowCount ? json({ ok: true }) : json({ error: "not found" }, 404);
  }
  if (b.action === "passkey-delete") {
    const r = await p.query("DELETE FROM passkeys WHERE id = $1 AND user_id = $2", [Number(b.id), me.id]);
    return r.rowCount ? json({ ok: true }) : json({ error: "not found" }, 404);
  }
  if (b.action === "logout-others") {
    const r = await p.query("DELETE FROM sessions WHERE user_id = $1 AND token_hash <> $2", [me.id, mine]);
    return json({ ok: true, ended: r.rowCount ?? 0 });
  }
  if (b.action === "logout-session") {
    const id = String(b.id ?? "");
    if (!/^[0-9a-f]{16}$/.test(id)) return json({ error: "bad request" }, 400);
    const r = await p.query("DELETE FROM sessions WHERE user_id = $1 AND left(token_hash, 16) = $2 AND token_hash <> $3", [me.id, id, mine]);
    return r.rowCount ? json({ ok: true }) : json({ error: "not found" }, 404);
  }
  if (b.action === "passkey-link") {
    if (!(await recentlyConfirmed())) return json({ error: "reauth" }, 403);
    return json(await createHandoff("register", me.id));
  }
  return json({ error: "bad request" }, 400);
}
