import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, hashCode, normalizeCode, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

// POST { code }: redeem a master invite. The member becomes verified with the invite's level (master by default).
// Few attempts per hour against guessing; a code works once per member and up to its max uses.
export async function POST(req: NextRequest) {
  const g = await talentGate(req, "invite", 5, { windowMs: 60 * 60_000, write: true, needProfile: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { code?: unknown };
  const code = typeof b.code === "string" ? normalizeCode(b.code) : "";
  if (code.length !== 12) return json({ error: "invite_invalid" }, 400);
  const client = await pool()!.connect();
  try {
    await client.query("BEGIN");
    const inv = (await client.query(
      `SELECT id, level FROM community_master_invites
        WHERE code_hash = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > now()) AND uses < max_uses FOR UPDATE`,
      [hashCode(code)],
    )).rows[0];
    if (!inv) { await client.query("ROLLBACK"); return json({ error: "invite_invalid" }, 400); }
    const used = await client.query("INSERT INTO community_master_invite_uses (invite_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING invite_id", [inv.id, g.me.id]);
    if (!used.rows[0]) { await client.query("ROLLBACK"); return json({ error: "invite_used" }, 409); }
    await client.query("UPDATE community_master_invites SET uses = uses + 1 WHERE id = $1", [inv.id]);
    await client.query(
      "UPDATE community_profiles SET level = $2, official = true, official_source = 'invite', official_at = now(), verified = true, verified_at = now(), verified_by = (SELECT created_by FROM community_master_invites WHERE id = $3), master_invite_id = $3 WHERE user_id = $1",
      [g.me.id, inv.level, inv.id],
    );
    await client.query("INSERT INTO community_admin_actions (admin_id, action, target_user_id, detail) VALUES (NULL, 'invite_redeemed', $1, $2)", [g.me.id, JSON.stringify({ invite: Number(inv.id), level: inv.level })]);
    await client.query("COMMIT");
    return json({ level: inv.level, verified: true }, 200, NO_STORE);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}
