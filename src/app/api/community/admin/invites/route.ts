import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate, hashCode, line, logAdmin, newInviteCode } from "@/lib/talents";

export const dynamic = "force-dynamic";

// Master invite codes (admins only). The plain code is returned once, at creation; only its hash is stored.
// GET: list. POST { level?, maxUses?, days?, note? }: create. DELETE ?id=: revoke.
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const r = await pool()!.query(
    `SELECT i.id, i.hint, i.note, i.level, i.max_uses, i.uses, i.created_at, i.expires_at, i.revoked_at,
            (SELECT array_agg(c.username ORDER BY u.used_at) FROM community_master_invite_uses u JOIN community_profiles c ON c.user_id = u.user_id WHERE u.invite_id = i.id) AS used_by
       FROM community_master_invites i ORDER BY i.created_at DESC LIMIT 100`,
  );
  return json({
    invites: r.rows.map((x) => ({
      id: String(x.id), hint: x.hint, note: x.note, level: x.level, maxUses: x.max_uses, uses: x.uses, createdAt: x.created_at, expiresAt: x.expires_at,
      revoked: !!x.revoked_at, usedBy: x.used_by ?? [],
    })),
  }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { level?: unknown; maxUses?: unknown; days?: unknown; note?: unknown };
  const level = b.level === "rising" || b.level === "sheikh" ? b.level : "master";
  const maxUses = typeof b.maxUses === "number" ? Math.max(1, Math.min(100, Math.floor(b.maxUses))) : 1;
  const days = typeof b.days === "number" ? Math.max(1, Math.min(365, Math.floor(b.days))) : 30;
  const code = newInviteCode();
  const r = await pool()!.query(
    `INSERT INTO community_master_invites (code_hash, hint, note, level, max_uses, created_by, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6, now() + $7::int * interval '1 day') RETURNING id`,
    [hashCode(code), code.slice(-4), line(b.note, 120), level, maxUses, g.me.id, days],
  );
  await logAdmin(g.me.id, "invite_create", null, { invite: Number(r.rows[0].id), level, maxUses, days });
  return json({ id: String(r.rows[0].id), code, level, maxUses, days }, 200, NO_STORE);
}

export async function DELETE(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const id = req.nextUrl.searchParams.get("id") ?? "";
  if (!/^\d{1,18}$/.test(id)) return json({ error: "bad_request" }, 400);
  await pool()!.query("UPDATE community_master_invites SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL", [id]);
  await logAdmin(g.me.id, "invite_revoke", null, { invite: Number(id) });
  return json({ ok: true }, 200, NO_STORE);
}
