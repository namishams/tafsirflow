import { NextRequest } from "next/server";
import { streamMedia } from "@/lib/media";
import { bad, teacherGate } from "@/lib/teacherShare";
import { loadFor } from "@/lib/teacherRecitations";

export const dynamic = "force-dynamic";

// private stream (Range for iOS): the student and the linked teacher only
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await teacherGate(req, "rec-audio", 240);
  if (g.res) return g.res;
  const hit = await loadFor((await params).id, g.me.id);
  if (!hit) return bad("not_found", 404);
  if (!hit.r.media_path) return bad("gone", 410);
  return streamMedia(req, hit.r.media_path, hit.r.media_mime || "audio/mp4");
}
