import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE } from "@/lib/talents";
import { bad, teacherGate } from "@/lib/teacherShare";
import { removeMedia } from "@/lib/media";
import { cardsOf, loadFor, recJson } from "@/lib/teacherRecitations";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

// one recording for its student or its teacher (active link, not blocked)
export async function GET(req: NextRequest, { params }: Ctx) {
  const g = await teacherGate(req, "rec", 240);
  if (g.res) return g.res;
  const hit = await loadFor((await params).id, g.me.id);
  if (!hit) return bad("not_found", 404);
  return json({ recitation: recJson(hit.r, await cardsOf([hit.r])), role: hit.role }, 200, NO_STORE);
}

// withdraw (the student): the file is deleted at once, the row stays as "withdrawn" (with its review, for reports)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const g = await teacherGate(req, "rec-del", 30, true);
  if (g.res) return g.res;
  const hit = await loadFor((await params).id, g.me.id);
  if (!hit || hit.role !== "student") return bad("not_found", 404);
  await pool()!.query("UPDATE teacher_recitations SET status = 'withdrawn', media_path = NULL, deleted_at = now() WHERE id = $1", [hit.r.id]);
  await removeMedia(hit.r.media_path);
  return json({ ok: true });
}
