import { promises as fs } from "node:fs";
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json } from "@/lib/http";
import { RECORDINGS_DIR, isReviewer } from "../../lib";

export const dynamic = "force-dynamic";

// GET ?id=<review id> – the recording, for reviewers only (never cached, never public)
export async function GET(req: NextRequest) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  const me = await currentUser();
  if (!(await isReviewer(me))) return json({ error: "forbidden" }, 403);
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isSafeInteger(id)) return json({ error: "invalid" }, 400);
  const q = (await pool()!.query("SELECT recording_path, recording_mime FROM review_queue WHERE id = $1", [id])).rows[0];
  const file = q?.recording_path as string | undefined;
  if (!file || !file.startsWith(RECORDINGS_DIR)) return json({ error: "not_found" }, 404);
  const data = await fs.readFile(file).catch(() => null);
  if (!data) return json({ error: "not_found" }, 404);
  return new Response(new Uint8Array(data), { headers: { "Content-Type": q.recording_mime || "application/octet-stream", "Cache-Control": "private, no-store", "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff" } });
}
