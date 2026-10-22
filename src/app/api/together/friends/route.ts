import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { FEATURES, friendsFor, type Feature } from "@/lib/together";

export const dynamic = "force-dynamic";

// GET ?for=challenges|nudges|league|activity: friends (mutual follows or connections, 16+, not blocked) who switched
// that feature on, for the pickers (challenge a friend, learn together, send a reminder).
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-friends", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const f = req.nextUrl.searchParams.get("for") ?? "activity";
  const feature: Feature = (FEATURES as readonly string[]).includes(f) ? (f as Feature) : "activity";
  return json({ friends: await friendsFor(g.me.id, feature === "circles" || feature === "community" || feature === "bestList" ? "activity" : feature) }, 200, NO_STORE);
}
