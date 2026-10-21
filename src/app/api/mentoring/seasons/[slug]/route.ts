import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate } from "@/lib/talents";
import { bad, ensureMonthlySeason, mentorGate, seasonJson, type SeasonRow } from "../../_lib/mentoring";
import { placements } from "../../_lib/seasons";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };
const okSlug = (s: string) => /^[a-z0-9-]{3,40}$/.test(s);

export async function GET(req: NextRequest, { params }: Ctx) {
  const g = await mentorGate(req, "season", 120);
  if (g.res) return g.res;
  const slug = (await params).slug;
  if (!okSlug(slug)) return bad("not_found", 404);
  await ensureMonthlySeason();
  const p = pool()!;
  const s = await p.query("SELECT * FROM talent_seasons WHERE slug = $1", [slug]);
  const season = s.rows[0] as SeasonRow | undefined;
  if (!season) return bad("not_found", 404);
  const c = await p.query(
    `SELECT count(*)::int AS entries, count(*) FILTER (WHERE EXISTS (SELECT 1 FROM mentoring_reviews r WHERE r.submission_id = s.id))::int AS judged
       FROM mentoring_submissions s WHERE s.season_id = $1 AND s.status <> 'withdrawn'`, [season.id]);
  const results = season.published_at ? (await placements([String(season.id)], 10, g.me.id)).get(String(season.id)) ?? [] : [];
  return json({ season: seasonJson(season), entries: Number(c.rows[0].entries), judged: Number(c.rows[0].judged), results }, 200, NO_STORE);
}

// admin: { action: "judging" } closes the entries; { action: "publish" } writes the top 10 into season_results
export async function POST(req: NextRequest, { params }: Ctx) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const slug = (await params).slug;
  if (!okSlug(slug)) return bad("not_found", 404);
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  const client = await pool()!.connect();
  try {
    await client.query("BEGIN");
    const s = await client.query("SELECT * FROM talent_seasons WHERE slug = $1 FOR UPDATE", [slug]);
    const season = s.rows[0] as SeasonRow | undefined;
    if (!season) { await client.query("ROLLBACK"); return bad("not_found", 404); }
    if (season.published_at) { await client.query("ROLLBACK"); return bad("published", 409); }
    if (action === "judging") {
      if (season.status !== "open") { await client.query("ROLLBACK"); return bad("not_open", 409); }
      await client.query("UPDATE talent_seasons SET status = 'judging' WHERE id = $1", [season.id]);
    } else if (action === "publish") {
      if (season.status === "open") { await client.query("ROLLBACK"); return bad("still_open", 409); }
      // score = average rubric total (5..25) over all reviews of the entry; ties go to the earlier entry
      const top = await client.query(
        `SELECT s.student_id, round(avg(r.makharij + r.tajweed + r.waqf + r.pace + r.maqam)::numeric, 2) AS score
           FROM mentoring_submissions s JOIN mentoring_reviews r ON r.submission_id = s.id
          WHERE s.season_id = $1 AND s.status <> 'withdrawn'
            AND NOT EXISTS (SELECT 1 FROM community_profiles cp WHERE cp.user_id = s.student_id AND cp.suspended)
          GROUP BY s.id, s.student_id, s.created_at ORDER BY score DESC, s.created_at ASC LIMIT 10`, [season.id]);
      await client.query("DELETE FROM season_results WHERE season_id = $1", [season.id]);
      let place = 0;
      for (const x of top.rows) {
        place++;
        const rarity = place === 1 ? "mythic" : place <= 3 ? "legendary" : null;
        const sticker = rarity === "mythic" ? season.reward_mythic : rarity === "legendary" ? season.reward_legendary : null;
        await client.query("INSERT INTO season_results (season_id, user_id, place, score, sticker_id, rarity) VALUES ($1,$2,$3,$4,$5,$6)", [season.id, x.student_id, place, x.score, sticker, rarity]);
      }
      await client.query("UPDATE talent_seasons SET status = 'closed', published_at = now() WHERE id = $1", [season.id]);
    } else {
      await client.query("ROLLBACK");
      return bad("bad_request");
    }
    await client.query("COMMIT");
    return json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}
