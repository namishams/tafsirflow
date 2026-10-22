import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { MIN_POST_AGE, NO_STORE, line, talentGate } from "@/lib/talents";
import { CIRCLE_KINDS, GOAL_KINDS, GOAL_LIMITS, MAX_JOINED, MAX_MEMBERS, MAX_OWNED, circleCode, kindAllows, myCircles, normCode, saveSettings, settingsOf, type CircleKind, type GoalKind } from "@/lib/together";

export const dynamic = "force-dynamic";

// Study circles (halaqat). GET: the member's circles with this week's progress and the group streak.
// POST { name, kind: brothers|sisters|family|teacher, goalKind: days|xp|verses, goal, approval?, consent: true, gender? }:
// creates a circle led by the member (name checked with moderate(); brothers and sisters circles need the matching
// self-declared gender; family and teacher-led circles always approve new members). There is no chat in circles.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "tg-circles", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  return json({ circles: await myCircles(g.me.id) }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "tg-circle-new", 5, { minAge: MIN_POST_AGE, needProfile: true, write: true, windowMs: 60 * 60_000 });
  if (g.res) return g.res;
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.consent !== true) return json({ error: "consent_required" }, 400);
  const name = line(b.name, 40);
  if (name.length < 3) return json({ error: "name_short" }, 400);
  if (await badText(name)) return json({ error: "text_not_allowed" }, 400);
  const kind = CIRCLE_KINDS.includes(b.kind as CircleKind) ? (b.kind as CircleKind) : null;
  if (!kind) return json({ error: "bad_request" }, 400);
  const goalKind = GOAL_KINDS.includes(b.goalKind as GoalKind) ? (b.goalKind as GoalKind) : "days";
  const [lo, hi] = GOAL_LIMITS[goalKind];
  const goal = typeof b.goal === "number" && Number.isFinite(b.goal) ? Math.max(lo, Math.min(hi, Math.floor(b.goal))) : lo;
  let s = await settingsOf(g.me.id);
  if (!s.gender && (b.gender === "brother" || b.gender === "sister")) s = await saveSettings(g.me.id, { gender: b.gender });
  if (!kindAllows(kind, s.gender)) return json({ error: "circle_gender" }, 403);
  const p = pool()!;
  const owned = (await p.query("SELECT count(*)::int AS n FROM together_circles WHERE owner_id = $1", [g.me.id])).rows[0].n;
  if (owned >= MAX_OWNED) return json({ error: "circle_limit" }, 403);
  const joined = (await p.query("SELECT count(*)::int AS n FROM together_circle_members WHERE user_id = $1", [g.me.id])).rows[0].n;
  if (joined >= MAX_JOINED) return json({ error: "circle_limit" }, 403);
  const approval = kind === "family" || kind === "teacher" ? true : b.approval !== false;
  let id: string | null = null;
  for (let i = 0; i < 5 && !id; i++) {
    const r = await p.query(
      `INSERT INTO together_circles (name, kind, owner_id, code, approval, goal_kind, goal, max_members) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (code) DO NOTHING RETURNING id`,
      [name, kind, g.me.id, normCode(circleCode()), approval, goalKind, goal, MAX_MEMBERS[kind]],
    );
    id = r.rows[0]?.id ? String(r.rows[0].id) : null;
  }
  if (!id) return json({ error: "server" }, 500);
  await p.query("INSERT INTO together_circle_members (circle_id, user_id, role, status) VALUES ($1,$2,'leader','member')", [id, g.me.id]);
  if (!s.circles) await saveSettings(g.me.id, { circles: true });
  return json({ id }, 201, NO_STORE);
}
