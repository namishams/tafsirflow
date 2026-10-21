import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, PROFILE_COLS, adminGate, card, isLevel, logAdmin } from "@/lib/talents";

export const dynamic = "force-dynamic";

// Admins only. GET ?q=: find members (also hidden and suspended ones). POST { username, verified?, level?, suspended? }.
export async function GET(req: NextRequest) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().toLowerCase().replace(/^@/, "").slice(0, 40).replace(/[\\%_]/g, (m) => "\\" + m);
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS} FROM community_profiles c
      WHERE ($1 = '' OR lower(c.username) LIKE $1 || '%' ESCAPE '\\' OR lower(c.display_name) LIKE '%' || $1 || '%' ESCAPE '\\')
      ORDER BY c.verified DESC, c.created_at DESC LIMIT 50`,
    [q],
  );
  return json({ members: r.rows.map((x) => ({ ...card(x), suspended: !!x.suspended, public: !!x.public, ijazahChain: x.ijazah_chain ?? "", official: !!x.official, officialChannel: x.official_channel ?? null, adminVerified: !!x.verified })) }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { username?: unknown; verified?: unknown; level?: unknown; suspended?: unknown; official?: unknown; badgeOverride?: unknown };
  if (typeof b.username !== "string") return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const c = (await p.query("SELECT user_id FROM community_profiles WHERE username = $1", [b.username.toLowerCase().slice(0, 40)])).rows[0];
  if (!c) return json({ error: "not_found" }, 404);
  const sets: string[] = [];
  const vals: unknown[] = [c.user_id];
  const detail: Record<string, unknown> = {};
  if (typeof b.verified === "boolean") {
    vals.push(b.verified, g.me.id);
    sets.push(`verified = $${vals.length - 1}`, `verified_by = CASE WHEN $${vals.length - 1} THEN $${vals.length}::bigint ELSE NULL END`, `verified_at = CASE WHEN $${vals.length - 1} THEN now() ELSE NULL END`);
    detail.verified = b.verified;
  }
  if (b.level !== undefined) {
    if (!isLevel(b.level)) return json({ error: "level" }, 400);
    vals.push(b.level); sets.push(`level = $${vals.length}`); detail.level = b.level;
  }
  if (typeof b.official === "boolean") {
    vals.push(b.official);
    sets.push(`official = $${vals.length}`, `official_source = CASE WHEN $${vals.length} THEN 'admin' ELSE NULL END`, `official_at = CASE WHEN $${vals.length} THEN now() ELSE NULL END`);
    detail.official = b.official;
  }
  if (b.badgeOverride === "none" || b.badgeOverride === null) {
    vals.push(b.badgeOverride); sets.push(`badge_override = $${vals.length}::text`, `badge = CASE WHEN $${vals.length}::text = 'none' THEN 'none' ELSE badge END`); detail.badgeOverride = b.badgeOverride;
  }
  if (typeof b.suspended === "boolean") { vals.push(b.suspended); sets.push(`suspended = $${vals.length}`); detail.suspended = b.suspended; }
  if (!sets.length) return json({ error: "bad_request" }, 400);
  await p.query(`UPDATE community_profiles SET ${sets.join(", ")} WHERE user_id = $1`, vals);
  await logAdmin(g.me.id, "member_update", Number(c.user_id), detail);
  return json({ ok: true }, 200, NO_STORE);
}
