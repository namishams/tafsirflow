import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { findByName, gate } from "@/lib/communityProfiles";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const g = await gate(req, "report", 5, 60 * 60_000, true);
  if (g.res) return g.res;
  const c = await findByName((await params).username);
  if (!c) return json({ error: "not_found" }, 404);
  const id = Number(c.user_id);
  if (id === g.me.id) return json({ error: "self" }, 400);
  const b = (await req.json().catch(() => ({}))) as { reason?: unknown };
  const reason = typeof b.reason === "string" ? b.reason.trim().slice(0, 300) : "";
  const p = pool()!;
  const dup = await p.query("SELECT 1 FROM community_reports WHERE reporter_id = $1 AND reported_id = $2 AND status = 'open'", [g.me.id, id]);
  if (!dup.rows[0]) await p.query("INSERT INTO community_reports (reporter_id, reported_id, reason) VALUES ($1,$2,$3)", [g.me.id, id, reason]);
  return json({ reported: true });
}
