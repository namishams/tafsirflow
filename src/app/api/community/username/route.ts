import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json, rateLimited } from "@/lib/http";
import { currentUser } from "@/lib/auth";
import { USERNAME_RE, reserved } from "@/lib/communityProfiles";
import { moderate } from "@/lib/moderation";
import { NO_STORE } from "@/lib/talents";
import { usernameProblem } from "@/lib/usernameFilter";

// the founder's own names (namishams, nami.shams, nami_shams, shams) are reserved for everyone else; only the
// single account with users.founder = true may take them
const FOUNDER_NAMES = /^(nami[._]?shams|namishams|shams)$/;
async function founderMayUse(userId: number, u: string) {
  if (!FOUNDER_NAMES.test(u)) return false;
  const r = await pool()?.query("SELECT founder FROM users WHERE id = $1", [userId]).catch(() => null);
  return !!r?.rows[0]?.founder;
}

export const dynamic = "force-dynamic";

// GET ?u=<username>: live availability check for Edit profile (app and /talents/me) while typing.
// { ok: true } or { ok: false, reason: "format" | "reserved" | "star" | "taken" | "inappropriate" }; "mine" counts as ok.
// Signed-in members only, rate limited; the final check stays in PUT /api/community/me (unique index).
export async function GET(req: NextRequest) {
  const me = await currentUser();
  if (!me) return json({ error: "unauthorized" }, 401);
  if (rateLimited(`username:${me.id}`, 60, 60_000)) return json({ error: "rate_limited" }, 429);
  const u = String(req.nextUrl.searchParams.get("u") ?? "").toLowerCase().slice(0, 40);
  if (!USERNAME_RE.test(u)) return json({ ok: false, reason: "format" }, 200, NO_STORE);
  const founderName = await founderMayUse(me.id, u);
  if (reserved(u) && !founderName) return json({ ok: false, reason: "reserved" }, 200, NO_STORE);
  const bad = founderName ? null : usernameProblem(u); // word filter in all app languages (transliterations, leetspeak) and reserved names
  if (bad) return json({ ok: false, reason: bad }, 200, NO_STORE);
  if (!founderName && !(await moderate(u)).ok) return json({ ok: false, reason: "inappropriate" }, 200, NO_STORE);
  const p = pool();
  if (!p) return json({ error: "unavailable" }, 503);
  const r = await p.query("SELECT user_id FROM community_profiles WHERE username = $1", [u]);
  const row = r.rows[0];
  if (row && Number(row.user_id) !== me.id) return json({ ok: false, reason: "taken" }, 200, NO_STORE);
  return json({ ok: true, mine: !!row }, 200, NO_STORE);
}
