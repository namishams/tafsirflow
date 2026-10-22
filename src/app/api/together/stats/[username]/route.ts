import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { togetherStatsOf } from "@/lib/together";

export const dynamic = "force-dynamic";

// GET: "Together" figures for the profile statistics (league tier and best tier, circles, weeks the circle goal was
// reached, challenges completed). Own profile, or a friend (mutual follows or connection, 16+) who takes part; others 404.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await talentGate(req, "tg-stats", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const s = await togetherStatsOf(g.me.id, (await params).username);
  if (!s) return json({ error: "not_found" }, 404);
  return json({ stats: s }, 200, NO_STORE);
}
