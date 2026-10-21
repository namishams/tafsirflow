import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE } from "@/lib/talents";
import { mentorGate, seasonJson, type SeasonRow } from "../_lib/mentoring";
import { placements } from "../_lib/seasons";

export const dynamic = "force-dynamic";

// podiums (places 1-3) of the published seasons, newest first
export async function GET(req: NextRequest) {
  const g = await mentorGate(req, "hof", 60);
  if (g.res) return g.res;
  const r = await pool()!.query("SELECT * FROM talent_seasons WHERE published_at IS NOT NULL ORDER BY published_at DESC, id DESC LIMIT 36");
  const podium = await placements(r.rows.map((x) => String(x.id)), 3, g.me.id);
  return json({ seasons: r.rows.map((x: SeasonRow) => ({ season: seasonJson(x), podium: podium.get(String(x.id)) ?? [] })) }, 200, NO_STORE);
}
