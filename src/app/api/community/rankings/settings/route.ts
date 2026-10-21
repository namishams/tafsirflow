import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";
import { ensureFresh, nextReset, settingsOf, standing } from "@/lib/rankings";

export const dynamic = "force-dynamic";

// The member's own ranking settings and place. GET: switches, country, and the places by XP this week and in total (for the
// profile line and the ring in the feed). POST { optIn?, countCountry? }:
//   optIn true  – leaderboards on, listed by name worldwide (16+ only; younger members stay in the circle of people they
//                 follow), and the country counted anonymously unless countCountry is sent as false
//   optIn false – leaderboards, worldwide listing and the country count off
//   countCountry – only the anonymous country count (also possible without being listed)
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "rk-settings", 60);
  if (g.res) return g.res;
  await ensureFresh();
  const s = await settingsOf(g.me.id, g.me.birthYear);
  const [week, total] = s.world ? await Promise.all([standing(g.me.id, "xp_week"), standing(g.me.id, "xp_total")]) : [null, null];
  return json({ settings: s, week, total, resetsAt: new Date(nextReset()).toISOString() }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "rk-settings-save", 20, { windowMs: 10 * 60_000, write: true, needProfile: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => null)) as { optIn?: unknown; countCountry?: unknown } | null;
  if (!b || typeof b !== "object") return json({ error: "bad_request" }, 400);
  const p = pool()!;
  const age = g.me.birthYear ? new Date().getFullYear() - g.me.birthYear : null;
  if (typeof b.optIn === "boolean") {
    if (b.optIn) {
      await p.query(
        "UPDATE community_profiles SET leaderboard_opt_in = true, rankings_world = $2, count_country = $3 WHERE user_id = $1",
        [g.me.id, age !== null && age >= 16, typeof b.countCountry === "boolean" ? b.countCountry : true],
      );
    } else {
      await p.query("UPDATE community_profiles SET leaderboard_opt_in = false, rankings_world = false, count_country = false WHERE user_id = $1", [g.me.id]);
    }
  } else if (typeof b.countCountry === "boolean") {
    await p.query("UPDATE community_profiles SET count_country = $2 WHERE user_id = $1", [g.me.id, b.countCountry]);
  } else return json({ error: "bad_request" }, 400);
  return json({ settings: await settingsOf(g.me.id, g.me.birthYear) }, 200, NO_STORE);
}
