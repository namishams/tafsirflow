import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { togetherSummary } from "@/lib/together";

export const dynamic = "force-dynamic";

// GET: a small read-only summary of the signed-in member's "Together" (own streak and today, friends who learned today
// as counts and first names, circle goal progress and group streaks, league tier/place/XP to the next place, active
// challenges, sessions in the next 24 hours, change of the own weekly world rank). For the AI tutor's encouraging,
// honest nudges and the app's own screens; server code can call togetherSummary() from src/lib/together.ts directly.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-summary", 30, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  return json({ summary: await togetherSummary(g.me.id) }, 200, NO_STORE);
}
