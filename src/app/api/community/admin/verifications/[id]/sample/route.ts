import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { adminGate } from "@/lib/talents";
import { streamMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

// the voice sample of a pending application (admins only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await adminGate(req);
  if (g.res) return g.res;
  const id = (await params).id;
  if (!/^\d{1,18}$/.test(id)) return json({ error: "not_found" }, 404);
  const r = await pool()!.query("SELECT sample_path, sample_mime FROM community_verifications WHERE id = $1", [id]);
  if (!r.rows[0]?.sample_path) return json({ error: "not_found" }, 404);
  return streamMedia(req, r.rows[0].sample_path, r.rows[0].sample_mime || "audio/mp4");
}
