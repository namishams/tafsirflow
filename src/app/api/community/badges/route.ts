import { NextRequest } from "next/server";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";
import { badgeRules, refreshBadges } from "@/lib/talentBadges";

export const dynamic = "force-dynamic";

// the member's badge checklist (emerald, gold, official) – recomputed on every call
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "badges", 60, { needProfile: true });
  if (g.res) return g.res;
  const s = await refreshBadges(g.me.id);
  if (!s) return json({ error: "profile_required" }, 403);
  return json({ ...s, rules: badgeRules() }, 200, NO_STORE);
}
