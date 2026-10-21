import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { ROLES, USERNAME_RE, adultEnough, badText, gate, reserved, shape, type CRole } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";
const NO = { "Cache-Control": "private, no-store" };

const COUNTS = `(SELECT count(*)::int FROM community_follows f WHERE f.followee_id = c.user_id) AS followers,
                (SELECT count(*)::int FROM community_follows f WHERE f.follower_id = c.user_id) AS following`;

export async function GET(req: NextRequest) {
  const g = await gate(req, "me", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(`SELECT c.*, ${COUNTS} FROM community_profiles c WHERE c.user_id = $1`, [g.me.id]);
  return json({ profile: r.rows[0] ? shape(r.rows[0]) : null, canCreate: adultEnough(g.me.birthYear) }, 200, NO);
}

export async function PUT(req: NextRequest) {
  const g = await gate(req, "save", 10, 10 * 60_000, true);
  if (g.res) return g.res;
  const me = g.me;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const username = str(b.username, 40).toLowerCase();
  const name = str(b.name, 40);
  const bio = str(b.bio, 400);
  const style = str(b.style, 40);
  const role = ROLES.includes(b.role as CRole) ? (b.role as CRole) : null;
  const country = typeof b.country === "string" && /^[A-Za-z]{2}$/.test(b.country) ? b.country.toUpperCase() : null;
  if (!USERNAME_RE.test(username)) return json({ error: "username_format" }, 400);
  if (reserved(username)) return json({ error: "username_reserved" }, 400);
  if (!name) return json({ error: "name_required" }, 400);
  if (bio.length > 160) return json({ error: "bio_long" }, 400);
  if (!role) return json({ error: "role" }, 400);
  const isPublic = b.public !== false;
  const p = pool()!;
  const existing = await p.query("SELECT 1 FROM community_profiles WHERE user_id = $1", [me.id]);
  // creating a profile (and making it public) needs a birth year that makes the user at least 13
  if (!existing.rows[0] && !adultEnough(me.birthYear)) return json({ error: "age" }, 403);
  if (isPublic && !adultEnough(me.birthYear)) return json({ error: "age" }, 403);
  for (const t of [username, name, bio, style]) {
    const bad = await badText(t);
    if (bad) return json({ error: bad }, 400);
  }
  try {
    await p.query(
      `INSERT INTO community_profiles (user_id, username, display_name, bio, country, role, style, has_ijaza, public)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (user_id) DO UPDATE SET username = $2, display_name = $3, bio = $4, country = $5, role = $6, style = $7, has_ijaza = $8, public = $9`,
      [me.id, username, name, bio, country, role, style, b.ijaza === true, isPublic],
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return json({ error: "username_taken" }, 409);
    throw e;
  }
  const r = await p.query(`SELECT c.*, ${COUNTS} FROM community_profiles c WHERE c.user_id = $1`, [me.id]);
  return json({ profile: shape(r.rows[0]) }, 200, NO);
}
