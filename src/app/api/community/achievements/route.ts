import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";
import { badText } from "@/lib/communityProfiles";
import { SIJILL_COLS, SECTIONS, addMoments, cleanSummary, isSection, momentsFromChange, privacyOf, sijillConfig, sijillOf, storeSummary } from "@/lib/sijill";

export const dynamic = "force-dynamic";

// The member's own Sijill (academic record). GET ?locale=: every section plus the privacy settings.
// POST { summary?, privacy?: { <section>: boolean }, leaderboard?: boolean }: the app sends its compact summary of
// aggregates (validated and capped in src/lib/sijill.ts; no raw learning data), the privacy toggles per section and the
// leaderboard opt-in. New achievements become system-generated moments for followers (only sections switched on show).
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "sijill-me", 60);
  if (g.res) return g.res;
  const r = (await pool()!.query(`SELECT ${SIJILL_COLS} FROM community_profiles c WHERE c.user_id = $1`, [g.me.id])).rows[0];
  if (!r) return json({ error: "profile_required" }, 403);
  const locale = (req.nextUrl.searchParams.get("locale") ?? "en").slice(0, 2);
  return json({ sijill: await sijillOf(r, true, locale), sections: SECTIONS, config: sijillConfig() }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "sijill-sync", 20, { windowMs: 10 * 60_000, write: true, needProfile: true });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => null)) as { summary?: unknown; privacy?: unknown; leaderboard?: unknown } | null;
  if (!b || typeof b !== "object") return json({ error: "bad_request" }, 400);
  const p = pool()!;
  if (b.summary !== undefined) {
    const s = cleanSummary(b.summary);
    if (!s) return json({ error: "bad_request" }, 400);
    if (s.tree.name && (await badText(s.tree.name))) s.tree.name = ""; // the tree name is shown on the profile
    const prev = await storeSummary(g.me.id, s);
    await addMoments(g.me.id, momentsFromChange(prev, s));
  }
  if (b.privacy && typeof b.privacy === "object") {
    const cur = privacyOf((await p.query("SELECT sijill_privacy FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0]?.sijill_privacy);
    for (const [k, v] of Object.entries(b.privacy as Record<string, unknown>)) if (isSection(k) && typeof v === "boolean") cur[k] = v;
    await p.query("UPDATE community_profiles SET sijill_privacy = $2 WHERE user_id = $1", [g.me.id, JSON.stringify(cur)]);
  }
  if (typeof b.leaderboard === "boolean") await p.query("UPDATE community_profiles SET leaderboard_opt_in = $2 WHERE user_id = $1", [g.me.id, b.leaderboard]);
  const r = (await p.query(`SELECT ${SIJILL_COLS} FROM community_profiles c WHERE c.user_id = $1`, [g.me.id])).rows[0];
  const locale = (req.nextUrl.searchParams.get("locale") ?? "en").slice(0, 2);
  return json({ sijill: await sijillOf(r, true, locale) }, 200, NO_STORE);
}
