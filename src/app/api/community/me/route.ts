import { NextRequest } from "next/server";
import { usernameProblem } from "@/lib/usernameFilter";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { ROLES, USERNAME_RE, adultEnough, badText, gate, reserved, shape, type CRole } from "@/lib/communityProfiles";
import { refreshBadges } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";
const NO = { "Cache-Control": "private, no-store" };

const COUNTS = `(SELECT count(*)::int FROM community_follows f WHERE f.followee_id = c.user_id) AS followers,
                (SELECT count(*)::int FROM community_follows f WHERE f.follower_id = c.user_id) AS following`;

export async function GET(req: NextRequest) {
  const g = await gate(req, "me", 60);
  if (g.res) return g.res;
  const r = await pool()!.query(`SELECT c.*, ${COUNTS} FROM community_profiles c WHERE c.user_id = $1`, [g.me.id]);
  const age = g.me.birthYear ? new Date().getFullYear() - g.me.birthYear : null;
  // Quran Talents: what this member may do (13+ view/follow, 16+ connect/message/post) and whether admin tools show
  return json({ profile: r.rows[0] ? shape(r.rows[0]) : null, canCreate: adultEnough(g.me.birthYear),
    talent: { ageKnown: age !== null, canInteract: age !== null && age >= 16, admin: g.me.role === "admin", guidelines: !!r.rows[0]?.guidelines_accepted_at } }, 200, NO);
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
  {
    // the same word filter as GET /api/community/username; an unchanged existing name stays allowed
    const bad = usernameProblem(username);
    const same = bad ? (await pool()!.query("SELECT 1 FROM community_profiles WHERE user_id = $1 AND username = $2", [me.id, username])).rows[0] : null;
    if (bad && !same) return json({ error: bad === "reserved" ? "username_reserved" : bad === "star" ? "username_star" : "username_inappropriate" }, 400);
    // a verified star account keeps its reserved username (the star profile lives at that name)
    const star = (await pool()!.query("SELECT slug FROM star_profiles WHERE claimed_by = $1", [me.id]).catch(() => ({ rows: [] as { slug: string }[] }))).rows[0];
    if (star && star.slug !== username) return json({ error: "username_star" }, 400);
  }
  if (!name) return json({ error: "name_required" }, 400);
  if (bio.length > 160) return json({ error: "bio_long" }, 400);
  if (!role) return json({ error: "role" }, 400);
  const isPublic = b.public !== false;
  // Quran Talents settings (only changed when sent): private account, who may message, guidelines accepted
  const priv = typeof b.private === "boolean" ? b.private : null;
  const msgPolicy = b.messagePolicy === "nobody" || b.messagePolicy === "connections" ? b.messagePolicy : null;
  const guidelines = b.guidelines === true;
  // Quran Talents fields: only changed when sent (older app versions do not send them)
  const opt = (v: unknown, max: number) => (v === undefined ? null : str(v, max));
  const rewaya = opt(b.rewaya, 60);
  const maqam = opt(b.maqam, 40);
  const chain = b.ijazahChain === undefined ? null : typeof b.ijazahChain === "string" ? b.ijazahChain.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim().slice(0, 500) : "";
  const p = pool()!;
  const existing = await p.query("SELECT 1 FROM community_profiles WHERE user_id = $1", [me.id]);
  // creating a profile (and making it public) needs a birth year that makes the user at least 13
  if (!existing.rows[0] && !adultEnough(me.birthYear)) return json({ error: "age" }, 403);
  // new profiles from the talent app accept the terms and the community guidelines (older clients send nothing)
  if (!existing.rows[0] && b.guidelines !== undefined && !guidelines) return json({ error: "guidelines" }, 400);
  if (isPublic && !adultEnough(me.birthYear)) return json({ error: "age" }, 403);
  for (const t of [username, name, bio, style, rewaya ?? "", maqam ?? "", chain ?? ""]) {
    const bad = await badText(t);
    if (bad) return json({ error: bad }, 400);
  }
  try {
    await p.query(
      `INSERT INTO community_profiles (user_id, username, display_name, bio, country, role, style, has_ijaza, public, rewaya, maqam, ijazah_chain, private, message_policy, guidelines_accepted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,''),COALESCE($11,''),COALESCE($12,''),COALESCE($13::boolean,false),COALESCE($14::text,'connections'),CASE WHEN $15::boolean THEN now() END)
       ON CONFLICT (user_id) DO UPDATE SET username = $2, display_name = $3, bio = $4, country = $5, role = $6, style = $7, has_ijaza = $8, public = $9,
         rewaya = COALESCE($10, community_profiles.rewaya), maqam = COALESCE($11, community_profiles.maqam), ijazah_chain = COALESCE($12, community_profiles.ijazah_chain),
         private = COALESCE($13, community_profiles.private), message_policy = COALESCE($14, community_profiles.message_policy),
         guidelines_accepted_at = CASE WHEN $15 THEN COALESCE(community_profiles.guidelines_accepted_at, now()) ELSE community_profiles.guidelines_accepted_at END`,
      [me.id, username, name, bio, country, role, style, b.ijaza === true, isPublic, rewaya, maqam, chain, priv, msgPolicy, guidelines],
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return json({ error: "username_taken" }, 409);
    throw e;
  }
  await refreshBadges(me.id); // Quran Talents: the emerald check depends on the profile
  const r = await p.query(`SELECT c.*, ${COUNTS} FROM community_profiles c WHERE c.user_id = $1`, [me.id]);
  return json({ profile: shape(r.rows[0]) }, 200, NO);
}
