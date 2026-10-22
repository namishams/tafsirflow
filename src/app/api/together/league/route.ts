import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { league, settingsOf } from "@/lib/together";

export const dynamic = "force-dynamic";

// Weekly friend league (opt-in on both sides): this week's XP of the member and the friends who joined the league,
// the own tier (1..6, places of learning), the promotion zone (top third of at least three) and last week's result.
// A step down only follows a week without any learning; nothing is staked.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-league", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const s = await settingsOf(g.me.id);
  if (!s.league) return json({ enabled: false }, 200, NO_STORE);
  return json({ enabled: true, ...(await league(g.me.id)) }, 200, NO_STORE);
}
