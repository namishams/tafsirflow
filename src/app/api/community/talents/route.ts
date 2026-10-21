import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { BADGE_RANK, HAS_BADGE, NOT_BLOCKED, NO_STORE, PROFILE_COLS, card, isLevel, talentGate } from "@/lib/talents";

export const dynamic = "force-dynamic";

const PAGE = 30;

// Discover talents: public, not suspended, not blocked. Filters q (name / @username), country (ISO-2), rewaya (prefix),
// level, verified=1, stage, surah (being memorised), focus (Sijill, privacy respected); paged with offset `cursor`. Verified and higher levels first, then followers.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "talents", 60);
  if (g.res) return g.res;
  const sp = req.nextUrl.searchParams;
  const esc = (s: string) => s.replace(/[\\%_]/g, (m) => "\\" + m);
  const q = esc((sp.get("q") ?? "").trim().toLowerCase().replace(/^@/, "").slice(0, 40));
  const country = /^[A-Za-z]{2}$/.test(sp.get("country") ?? "") ? sp.get("country")!.toUpperCase() : null;
  const rewaya = esc((sp.get("rewaya") ?? "").trim().toLowerCase().slice(0, 40));
  const level = isLevel(sp.get("level")) ? sp.get("level") : null;
  const verified = sp.get("verified") === "1";
  // Sijill discovery: madrasa stage (shown only when the member shows the level section), the surah being memorised
  // (only with the memorised section on) and the learning focus
  const STAGES = ["ibtidai", "idadi", "thanawi", "ali"], FOCUS = ["hifz", "reading", "arabic", "knowledge"];
  const stage = STAGES.includes(sp.get("stage") ?? "") ? sp.get("stage") : null;
  const surahN = Math.floor(Number(sp.get("surah")));
  const surah = surahN >= 1 && surahN <= 114 ? surahN : null;
  const focus = FOCUS.includes(sp.get("focus") ?? "") ? sp.get("focus") : null;
  const offset = Math.max(0, Math.min(2000, Math.floor(Number(sp.get("cursor")) || 0)));
  const r = await pool()!.query(
    `SELECT ${PROFILE_COLS}, EXISTS (SELECT 1 FROM community_follows f WHERE f.follower_id = $1 AND f.followee_id = c.user_id) AS followed
       FROM community_profiles c
      WHERE c.public AND NOT c.suspended AND c.user_id <> $1 AND ${NOT_BLOCKED("c.user_id")}
        AND ($2 = '' OR lower(c.username) LIKE $2 || '%' ESCAPE '\\' OR lower(c.display_name) LIKE '%' || $2 || '%' ESCAPE '\\')
        AND ($3::text IS NULL OR c.country = $3)
        AND ($4 = '' OR lower(c.rewaya) LIKE $4 || '%' ESCAPE '\\')
        AND ($5::text IS NULL OR c.level = $5)
        AND (NOT $6 OR ${HAS_BADGE})
        AND ($8::text IS NULL OR (c.study_stage = $8 AND COALESCE((c.sijill_privacy ->> 'level')::boolean, false)))
        AND ($9::int IS NULL OR (c.current_surah = $9 AND COALESCE((c.sijill_privacy ->> 'memorised')::boolean, false)))
        AND ($10::text IS NULL OR (c.study_focus = $10 AND COALESCE((c.sijill_privacy ->> 'level')::boolean, false)))
      ORDER BY ${BADGE_RANK} DESC, array_position(ARRAY['sheikh','master','rising','talent'], c.level), followers DESC, c.created_at DESC
      LIMIT ${PAGE + 1} OFFSET $7`,
    [g.me.id, q, country, rewaya, level, verified, offset, stage, surah, focus],
  );
  const rows = r.rows.slice(0, PAGE);
  return json({
    talents: rows.map((x) => ({ ...card(x), followed: !!x.followed })),
    next: r.rows.length > PAGE ? String(offset + PAGE) : null,
  }, 200, NO_STORE);
}
