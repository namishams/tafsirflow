import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, adminGate, line } from "@/lib/talents";
import { bad, canJudge, ensureMonthlySeason, mentorGate, seasonJson, seasonRewardIds, verseKeyOf, type SeasonRow } from "../_lib/mentoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const g = await mentorGate(req, "seasons", 120);
  if (g.res) return g.res;
  await ensureMonthlySeason();
  const p = pool()!, me = g.me;
  const r = await p.query(
    `SELECT ts.*,
       (SELECT count(*)::int FROM mentoring_submissions s WHERE s.season_id = ts.id AND s.status <> 'withdrawn') AS entries,
       (SELECT s.id FROM mentoring_submissions s WHERE s.season_id = ts.id AND s.student_id = $1 AND s.status <> 'withdrawn') AS mine_id,
       (SELECT s.status FROM mentoring_submissions s WHERE s.season_id = ts.id AND s.student_id = $1 AND s.status <> 'withdrawn') AS mine_status,
       sr.place, sr.score, sr.sticker_id, sr.rarity
     FROM talent_seasons ts LEFT JOIN season_results sr ON sr.season_id = ts.id AND sr.user_id = $1
     ORDER BY ts.starts_on DESC, ts.id DESC LIMIT 50`, [me.id]);
  const seasons = r.rows.map((x: SeasonRow & Record<string, unknown>) => ({
    ...seasonJson(x), entries: Number(x.entries),
    mine: x.mine_id ? { id: String(x.mine_id), status: String(x.mine_status) } : null,
    result: x.place ? { place: Number(x.place), score: Number(x.score), sticker: (x.sticker_id as string) ?? null, rarity: (x.rarity as string) ?? null } : null,
  }));
  return json({ seasons, admin: me.role === "admin", judge: await canJudge(me) }, 200, NO_STORE);
}

const isDay = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)) && new Date(`${v}T00:00:00Z`).toISOString().slice(0, 10) === v;

// admin: { slug, kind: month|ramadan|special, title, verses, startsOn, endsOn, maxSeconds? }
export async function POST(req: NextRequest) {
  const g = await adminGate(req, true);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const slug = line(b.slug, 40).toLowerCase();
  const kind = String(b.kind);
  const verses = verseKeyOf(b.verses);
  const startsOn = line(b.startsOn, 10), endsOn = line(b.endsOn, 10);
  const maxSeconds = b.maxSeconds === undefined || b.maxSeconds === "" ? 180 : Math.round(Number(b.maxSeconds));
  if (!/^[a-z0-9-]{3,40}$/.test(slug) || !["month", "ramadan", "special"].includes(kind) || !verses || !isDay(startsOn) || !isDay(endsOn) || endsOn < startsOn || !(maxSeconds >= 30 && maxSeconds <= 300)) return bad("bad_request");
  const rw = seasonRewardIds(slug);
  const r = await pool()!.query(
    `INSERT INTO talent_seasons (slug, kind, title, verses, starts_on, ends_on, max_seconds, reward_mythic, reward_legendary, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (slug) DO NOTHING RETURNING slug`,
    [slug, kind, line(b.title, 80), verses, startsOn, endsOn, maxSeconds, rw.mythic, rw.legendary, g.me.id]);
  if (!r.rows[0]) return bad("exists", 409);
  return json({ ok: true, slug });
}
