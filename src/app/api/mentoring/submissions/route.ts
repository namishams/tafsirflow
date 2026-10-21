import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NOT_BLOCKED, NO_STORE, line } from "@/lib/talents";
import { MAX_OPEN_PER_LINK, MENTOR_SECONDS, bad, checkText, ensureMonthlySeason, mentorGate, purgeExpired, seasonOpen, verseKeyOf, type SeasonRow } from "../_lib/mentoring";
import { MAX_AUDIO_BYTES, SEASON_MIN_MS, SUB_COLS, SUB_FROM, allowedType, canJudge, cardsFor, isMaster, linkAlive, removeMedia, storeRecording, submissionJson, type SubRow } from "../_lib/submissions";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// GET ?box=mine|inbox|jury (&season=slug): own recordings, a master's inbox, anonymous season entries for the jury.
export async function GET(req: NextRequest) {
  const g = await mentorGate(req, "subs", 120);
  if (g.res) return g.res;
  void purgeExpired();
  const me = g.me, p = pool()!;
  const box = req.nextUrl.searchParams.get("box") ?? "mine";
  const season = line(req.nextUrl.searchParams.get("season"), 40);
  let rows: SubRow[] = [];
  if (box === "mine") {
    const r = await p.query(
      `SELECT ${SUB_COLS} ${SUB_FROM} WHERE s.student_id = $1 AND s.status <> 'withdrawn' AND ($2 = '' OR ts.slug = $2) ORDER BY s.created_at DESC LIMIT 100`, [me.id, season]);
    rows = r.rows;
    const cards = await cardsFor(rows.flatMap((x) => (x.master_id ? [Number(x.master_id)] : [])));
    const mine = (await cardsFor([me.id])).get(me.id) ?? null;
    return json({ submissions: rows.map((x) => submissionJson(x, mine, x.master_id ? cards.get(Number(x.master_id)) ?? null : null)) }, 200, NO_STORE);
  }
  if (box === "inbox") {
    if (!(await isMaster(me.id))) return bad("not_master", 403);
    const r = await p.query(
      `SELECT ${SUB_COLS} ${SUB_FROM}
        WHERE s.master_id = $1 AND s.status <> 'withdrawn' AND ${NOT_BLOCKED("s.student_id")}
          AND EXISTS (SELECT 1 FROM mentoring_links l WHERE l.master_id = s.master_id AND l.student_id = s.student_id AND l.status = 'accepted')
        ORDER BY (s.status = 'pending') DESC, s.created_at DESC LIMIT 100`, [me.id]);
    rows = r.rows;
    const cards = await cardsFor(rows.map((x) => Number(x.student_id)));
    const mentor = (await cardsFor([me.id])).get(me.id) ?? null;
    return json({ submissions: rows.map((x) => submissionJson(x, cards.get(Number(x.student_id)) ?? null, mentor)) }, 200, NO_STORE);
  }
  if (box === "jury") {
    if (!(await canJudge(me))) return bad("not_allowed", 403);
    await ensureMonthlySeason();
    // anonymous: no member, no note, no stats of other reviewers; own entry, blocked members and already judged entries are left out
    const r = await p.query(
      `SELECT ${SUB_COLS} ${SUB_FROM}
        WHERE s.season_id IS NOT NULL AND s.status <> 'withdrawn' AND s.media_path IS NOT NULL AND s.student_id <> $1
          AND ts.status IN ('open','judging') AND ($2 = '' OR ts.slug = $2) AND ${NOT_BLOCKED("s.student_id")}
          AND NOT EXISTS (SELECT 1 FROM mentoring_reviews x WHERE x.submission_id = s.id AND x.reviewer_id = $1)
          AND NOT EXISTS (SELECT 1 FROM community_profiles cp WHERE cp.user_id = s.student_id AND cp.suspended)
        ORDER BY s.id LIMIT 100`, [me.id, season]);
    return json({ submissions: r.rows.map((x: SubRow) => submissionJson(x, null, null, { hideStats: true, hideNote: true })) }, 200, NO_STORE);
  }
  return bad("bad_request");
}

// POST multipart: file + verseKey, durationMs, note, and mentor (username) or season (slug).
export async function POST(req: NextRequest) {
  const g = await mentorGate(req, "send", 12, true, 10 * 60_000);
  if (g.res) return g.res;
  const me = g.me, p = pool()!;
  const form = await req.formData().catch(() => null);
  if (!form) return bad("bad_request");
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) return bad("media_missing");
  if (file.size > MAX_AUDIO_BYTES) return bad("media_too_large", 413);
  if (file.type && !allowedType(file.type)) return bad("media_format", 415);
  const verseKey = verseKeyOf(form.get("verseKey"));
  if (!verseKey) return bad("bad_verse");
  const durationMs = Math.round(Number(form.get("durationMs")));
  if (!Number.isFinite(durationMs)) return bad("bad_duration");
  const note = line(form.get("note"), 300);
  const mentorName = line(form.get("mentor"), 40).toLowerCase();
  const seasonSlug = line(form.get("season"), 40);
  if (!!mentorName === !!seasonSlug) return bad("bad_request"); // exactly one target
  const t = await checkText(note);
  if (!t.ok) return bad("text_not_allowed");

  let masterId: number | null = null, season: SeasonRow | null = null, maxSeconds: number;
  if (mentorName) {
    if (durationMs < MENTOR_SECONDS.min * 1000 || durationMs > MENTOR_SECONDS.max * 1000) return bad("bad_duration");
    const m = await p.query("SELECT c.user_id FROM community_profiles c WHERE c.username = $2 AND c.user_id <> $1 AND NOT c.suspended", [me.id, mentorName]);
    masterId = m.rows[0] ? Number(m.rows[0].user_id) : null;
    if (!masterId || !(await linkAlive(masterId, me.id)) || !(await isMaster(masterId))) return bad("not_linked", 403);
    const open = await p.query("SELECT count(*)::int AS n FROM mentoring_submissions WHERE master_id = $1 AND student_id = $2 AND status = 'pending'", [masterId, me.id]);
    if (Number(open.rows[0].n) >= MAX_OPEN_PER_LINK) return bad("too_many_open", 409);
    maxSeconds = MENTOR_SECONDS.max;
  } else {
    await ensureMonthlySeason();
    const s = await p.query("SELECT * FROM talent_seasons WHERE slug = $1", [seasonSlug]);
    season = (s.rows[0] as SeasonRow) ?? null;
    if (!season) return bad("not_found", 404);
    if (!seasonOpen(season)) return bad("season_closed", 409);
    if (durationMs < SEASON_MIN_MS || durationMs > Number(season.max_seconds) * 1000) return bad("bad_duration");
    const has = await p.query("SELECT 1 FROM mentoring_submissions WHERE season_id = $1 AND student_id = $2 AND status <> 'withdrawn'", [season.id, me.id]);
    if (has.rows[0]) return bad("already_entered", 409);
    maxSeconds = Number(season.max_seconds);
  }

  const stored = await storeRecording(Buffer.from(await file.arrayBuffer()), maxSeconds);
  if ("error" in stored) return bad(stored.error, stored.error === "media_unavailable" ? 503 : stored.error === "media_too_large" ? 413 : 415);
  try {
    const r = await p.query(
      `INSERT INTO mentoring_submissions (student_id, master_id, season_id, verse_key, duration_ms, note, media_path, media_mime)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [me.id, masterId, season ? season.id : null, verseKey, durationMs, note, stored.rel, stored.mime],
    );
    return json({ ok: true, id: String(r.rows[0].id) });
  } catch (e) {
    await removeMedia(stored.rel);
    if ((e as { code?: string }).code === "23505") return bad("already_entered", 409);
    throw e;
  }
}
