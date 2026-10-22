import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { gate } from "@/lib/communityProfiles";
import { REPORT_CATEGORIES } from "@/lib/talents";
import { circleRow, membership } from "@/lib/together";

export const dynamic = "force-dynamic";

// POST { category, reason? }: reports a circle (name, leader's conduct) into the moderation queue (community_reports,
// target_type 'circle', the leader as the reported member). Members only; the admin can suspend the circle.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate(req, "tg-report", 5, 60 * 60_000, true);
  if (g.res) return g.res;
  const id = Number((await params).id);
  const ci = Number.isSafeInteger(id) && id > 0 ? await circleRow(id) : undefined;
  if (!ci || !(await membership(id, g.me.id))) return json({ error: "not_found" }, 404);
  const b = (await req.json().catch(() => ({}))) as { reason?: unknown; category?: unknown };
  const reason = `[Halaqa "${ci.name}"] ${typeof b.reason === "string" ? b.reason.trim().slice(0, 300) : ""}`.trim();
  const category = typeof b.category === "string" && REPORT_CATEGORIES.includes(b.category) ? b.category : "";
  const p = pool()!;
  const dup = await p.query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND target_type = 'circle' AND target_id = $2 AND status = 'open'", [g.me.id, id]);
  if (!dup.rows[0]) {
    await p.query("INSERT INTO community_reports (reporter_id, reported_id, reason, category, target_type, target_id) VALUES ($1,$2,$3,$4,'circle',$5)", [g.me.id, ci.owner_id, reason, category, id]);
  }
  return json({ reported: true });
}
