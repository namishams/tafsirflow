import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";
import { postingStatus } from "@/lib/talentPosting";

export const dynamic = "force-dynamic";

// "Your path to posting": GET the checklist (age, Pro, learning level, verified). POST { reciterLevel } reports the
// Reciter Path level passed in the app (self-reported like the sharer count; the admin verification is the real check).
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "posting", 60);
  if (g.res) return g.res;
  return json(await postingStatus(g.me), 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "posting-level", 30, { windowMs: 10 * 60_000, write: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as { reciterLevel?: unknown };
  const lvl = typeof b.reciterLevel === "number" && Number.isFinite(b.reciterLevel) ? Math.max(0, Math.min(20, Math.floor(b.reciterLevel))) : null;
  if (lvl !== null) await pool()!.query("UPDATE community_profiles SET reciter_level = $2 WHERE user_id = $1", [g.me.id, lvl]);
  return json(await postingStatus(g.me), 200, NO_STORE);
}
