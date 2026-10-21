import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { countOf } from "@/lib/counts";
import { MAX_OPEN, PRESETS, bad, teacherGate, type Preset } from "@/lib/teacherShare";

export const dynamic = "force-dynamic";

// The teacher sends a gentle nudge (one of four preset encouragements, at most one a day per student) or suggests a
// portion: { shareId, kind: "nudge", preset } | { shareId, kind: "assign", surah, from, to }. No free text.
export async function POST(req: NextRequest) {
  const g = await teacherGate(req, "suggest", 40, true, 10 * 60_000);
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const shareId = Number(b.shareId);
  if (!Number.isInteger(shareId) || (b.kind !== "nudge" && b.kind !== "assign")) return bad("bad_request");
  const p = pool()!;
  const h = await p.query(
    `SELECT h.id FROM teacher_shares h WHERE h.id = $1 AND h.teacher_id = $2 AND h.status = 'active'
        AND NOT EXISTS (SELECT 1 FROM community_blocks k WHERE (k.blocker_id = $2 AND k.blocked_id = h.student_id) OR (k.blocker_id = h.student_id AND k.blocked_id = $2))`,
    [shareId, g.me.id],
  );
  if (!h.rows[0]) return bad("not_found", 404);
  const open = await p.query("SELECT count(*)::int AS n FROM teacher_suggestions WHERE share_id = $1 AND status = 'open'", [shareId]);
  if (Number(open.rows[0].n) >= MAX_OPEN) return bad("too_many_open", 409);
  if (b.kind === "nudge") {
    const preset = PRESETS.find((x) => x === b.preset) as Preset | undefined;
    if (!preset) return bad("bad_request");
    const recent = await p.query("SELECT 1 FROM teacher_suggestions WHERE share_id = $1 AND kind = 'nudge' AND created_at > now() - interval '20 hours'", [shareId]);
    if (recent.rows[0]) return bad("too_soon", 429);
    const r = await p.query("INSERT INTO teacher_suggestions (share_id, kind, preset) VALUES ($1,'nudge',$2) RETURNING id", [shareId, preset]);
    return json({ ok: true, id: String(r.rows[0].id) });
  }
  const surah = Number(b.surah), from = Number(b.from), to = Number(b.to);
  if (!Number.isInteger(surah) || surah < 1 || surah > 114 || !Number.isInteger(from) || !Number.isInteger(to) || from < 1 || to < from || to > countOf(surah)) return bad("bad_range");
  if (to - from + 1 > 30) return bad("range_too_long");
  const r = await p.query("INSERT INTO teacher_suggestions (share_id, kind, surah, from_verse, to_verse) VALUES ($1,'assign',$2,$3,$4) RETURNING id", [shareId, surah, from, to]);
  return json({ ok: true, id: String(r.rows[0].id) });
}
