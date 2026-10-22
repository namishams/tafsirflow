import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { MIN_POST_AGE, NO_STORE, line, talentGate } from "@/lib/talents";
import { GOAL_KINDS, GOAL_LIMITS, circleCode, circleDetail, circleRow, membership, normCode, type GoalKind } from "@/lib/together";

export const dynamic = "force-dynamic";

const idOf = async (params: Promise<{ id: string }>) => { const n = Number((await params).id); return Number.isSafeInteger(n) && n > 0 ? n : null; };

// One circle. GET: board for members (this week per member, today, streak, group goal and streak, history; the invite
// code; join requests for the leader). Pending members see only the name and that they wait.
// PATCH (leader) { name?, goalKind?, goal?, approval?, newCode? }. DELETE (leader): removes the circle.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "tg-circle", 60, { minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const id = await idOf(params);
  const d = id ? await circleDetail(g.me.id, id) : null;
  if (!d) return json({ error: "not_found" }, 404);
  return json({ circle: d }, 200, NO_STORE);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "tg-circle-w", 20, { minAge: MIN_POST_AGE, needProfile: true, write: true });
  if (g.res) return g.res;
  const id = await idOf(params);
  const ci = id ? await circleRow(id) : undefined;
  const m = id ? await membership(id, g.me.id) : undefined;
  if (!id || !ci || !m) return json({ error: "not_found" }, 404);
  if (m.role !== "leader") return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const p = pool()!;
  if (b.name !== undefined) {
    const name = line(b.name, 40);
    if (name.length < 3) return json({ error: "name_short" }, 400);
    if (await badText(name)) return json({ error: "text_not_allowed" }, 400);
    await p.query("UPDATE together_circles SET name = $2 WHERE id = $1", [id, name]);
  }
  if (b.goalKind !== undefined || b.goal !== undefined) {
    const gk = GOAL_KINDS.includes(b.goalKind as GoalKind) ? (b.goalKind as GoalKind) : ci.goal_kind;
    const [lo, hi] = GOAL_LIMITS[gk];
    const goal = typeof b.goal === "number" && Number.isFinite(b.goal) ? Math.max(lo, Math.min(hi, Math.floor(b.goal))) : Math.max(lo, Math.min(hi, Number(ci.goal)));
    await p.query("UPDATE together_circles SET goal_kind = $2, goal = $3 WHERE id = $1", [id, gk, goal]);
  }
  if (typeof b.approval === "boolean" && ci.kind !== "family" && ci.kind !== "teacher") await p.query("UPDATE together_circles SET approval = $2 WHERE id = $1", [id, b.approval]);
  if (b.newCode === true) {
    for (let i = 0; i < 5; i++) {
      const r = await p.query("UPDATE together_circles SET code = $2 WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM together_circles x WHERE x.code = $2) RETURNING id", [id, normCode(circleCode())]);
      if (r.rowCount) break;
    }
  }
  return json({ circle: await circleDetail(g.me.id, id) }, 200, NO_STORE);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await talentGate(req, "tg-circle-w", 20, { minAge: MIN_POST_AGE, needProfile: true, write: true });
  if (g.res) return g.res;
  const id = await idOf(params);
  const m = id ? await membership(id, g.me.id) : undefined;
  if (!id || !m) return json({ error: "not_found" }, 404);
  if (m.role !== "leader") return json({ error: "forbidden" }, 403);
  await pool()!.query("DELETE FROM together_circles WHERE id = $1", [id]);
  return json({ ok: true }, 200, NO_STORE);
}
