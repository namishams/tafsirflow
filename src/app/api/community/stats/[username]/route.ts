import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { clientIp, json, rateLimited } from "@/lib/http";
import { ageOf, MIN_VIEW_AGE } from "@/lib/talents";
import { statsFor } from "@/lib/careerStats";

export const dynamic = "force-dynamic";

// GET ?locale=: the progress profile ("Statistik" tab) of a member: the Sijill sections the member shows, member since,
// country, badge, the career tier, places on the boards (only when listed by name), the milestone timeline and, between
// mutual follows or connections, "you vs. them". Signed-in viewers (13+, confirmed e-mail) see what the Sijill route
// shows them (own: everything; private accounts: approved followers only; blocked either way: not found); everyone else
// sees public profiles of members aged 16+ only.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  if (rateLimited(`stats-ip:${clientIp(req)}`, 90, 60_000)) return json({ error: "slow_down" }, 429);
  const name = String((await params).username).toLowerCase().slice(0, 40);
  const locale = (req.nextUrl.searchParams.get("locale") ?? "en").slice(0, 2);
  const me = await currentUser();
  const age = ageOf(me?.birthYear);
  const viewer = me && me.emailVerified && age !== null && age >= MIN_VIEW_AGE ? me.id : null;
  if (viewer && rateLimited(`stats-user:${viewer}`, 120, 60_000)) return json({ error: "slow_down" }, 429);
  const s = await statsFor(name, viewer, locale);
  if (!s) return json({ error: "not_found" }, 404);
  if (s === "restricted") return json({ stats: null, restricted: true }, 200, { "Cache-Control": "private, no-store" });
  return json({ stats: s }, 200, viewer ? { "Cache-Control": "private, no-store" } : { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" });
}
