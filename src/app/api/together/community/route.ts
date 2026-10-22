import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { MIN_POST_AGE, NO_STORE, talentGate } from "@/lib/talents";
import { community, settingsOf } from "@/lib/together";

export const dynamic = "force-dynamic";

// Community goals: verses memorised this month by members who count for their country (opt-in, sums only), worldwide
// and for one country (?country=XX, default the member's profile country), the next round milestone, the top countries
// and the best learners of the month worldwide and in the country (only members who chose to appear, 16+, public).
// Viewers 16+.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-community", 30, { minAge: MIN_POST_AGE });
  if (g.res) return g.res;
  const q = (req.nextUrl.searchParams.get("country") ?? "").toUpperCase();
  const own = (await pool()!.query("SELECT country FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0]?.country ?? null;
  const country = /^[A-Z]{2}$/.test(q) ? q : own && /^[A-Z]{2}$/.test(own) ? own : null;
  const s = await settingsOf(g.me.id);
  return json({ ...(await community(g.me.id, country)), mine: { community: s.community, bestList: s.bestList } }, 200, NO_STORE);
}
