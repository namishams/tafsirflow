import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { friendsToday, inbox, myCircles, settingsOf } from "@/lib/together";

export const dynamic = "force-dynamic";

// Together hub: friends who learned today (only friends who share it: mutual follows or connections, 16+, not blocked),
// the own tier in the friend league, the circles and the count of open items in the inbox.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-pulse", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const settings = await settingsOf(g.me.id);
  const [friends, circles, box, lg] = await Promise.all([
    friendsToday(g.me.id),
    myCircles(g.me.id),
    inbox(g.me.id),
    pool()!.query("SELECT tier FROM together_league WHERE user_id = $1", [g.me.id]),
  ]);
  return json({
    settings,
    friends,
    league: settings.league ? { tier: Number(lg.rows[0]?.tier ?? 1) } : null,
    circles,
    inbox: { unread: box.unread },
  }, 200, NO_STORE);
}
