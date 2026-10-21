import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText, gate } from "@/lib/communityProfiles";
import { NO_STORE } from "@/lib/talents";
import { AUDIENCES, PROFILE_GOALS, cleanPlace, isAudience, privacyOf, type ExtrasPrivacy } from "@/lib/profileExtras";

export const dynamic = "force-dynamic";

// The own profile extras (app Edit profile, website /talents/me/edit): GET returns them with the audience of each;
// PUT changes only what is sent. Goals are ids of the onboarding goals; city and travel destination are coarse place
// names (no digits); each audience is everyone, followers or me.
async function read(userId: number) {
  const r = await pool()!.query("SELECT learning_goals, city, travel_on, travel_city, extras_privacy FROM community_profiles WHERE user_id = $1", [userId]);
  const x = r.rows[0];
  if (!x) return null;
  return { goals: (x.learning_goals ?? []) as string[], city: x.city ?? "", travel: { on: !!x.travel_on, city: x.travel_city ?? "" }, privacy: privacyOf(x) };
}

export async function GET(req: NextRequest) {
  const g = await gate(req, "extras", 60);
  if (g.res) return g.res;
  const d = await read(g.me.id);
  if (!d) return json({ error: "profile_required" }, 404);
  return json({ extras: d, goals: PROFILE_GOALS, audiences: AUDIENCES }, 200, NO_STORE);
}

export async function PUT(req: NextRequest) {
  const g = await gate(req, "extras-save", 30, 10 * 60_000, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { goals?: unknown; city?: unknown; travel?: { on?: unknown; city?: unknown }; privacy?: Partial<Record<keyof ExtrasPrivacy, unknown>> };
  const cur = await read(g.me.id);
  if (!cur) return json({ error: "profile_required" }, 404);
  const goals = Array.isArray(b.goals) ? [...new Set(b.goals.filter((x): x is string => typeof x === "string" && (PROFILE_GOALS as readonly string[]).includes(x)))].slice(0, PROFILE_GOALS.length) : cur.goals;
  const city = b.city === undefined ? cur.city : cleanPlace(b.city);
  const travelOn = typeof b.travel?.on === "boolean" ? b.travel.on : cur.travel.on;
  const travelCity = b.travel?.city === undefined ? cur.travel.city : cleanPlace(b.travel.city);
  for (const t of [city, travelCity]) {
    const bad = t ? await badText(t) : null;
    if (bad) return json({ error: bad }, 400);
  }
  const privacy: ExtrasPrivacy = { ...cur.privacy };
  for (const k of ["goals", "city", "travel"] as const) if (isAudience(b.privacy?.[k])) privacy[k] = b.privacy![k] as ExtrasPrivacy[typeof k];
  await pool()!.query(
    "UPDATE community_profiles SET learning_goals = $2, city = $3, travel_on = $4, travel_city = $5, extras_privacy = $6 WHERE user_id = $1",
    [g.me.id, goals, city, travelOn, travelCity, JSON.stringify(privacy)],
  );
  return json({ extras: await read(g.me.id) }, 200, NO_STORE);
}
