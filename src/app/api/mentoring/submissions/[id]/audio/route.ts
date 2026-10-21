import { NextRequest } from "next/server";
import { streamMedia } from "@/lib/media";
import { bad, mentorGate } from "../../../_lib/mentoring";
import { loadSubmission, roleOf } from "../../../_lib/submissions";

export const dynamic = "force-dynamic";

// private stream (Range for iOS): the student, the linked master, and the jury (masters and admins, season entries; admins any)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const g = await mentorGate(req, "audio", 240);
  if (g.res) return g.res;
  const r = await loadSubmission((await params).id);
  if (!r || !(await roleOf(g.me, r))) return bad("not_found", 404);
  if (!r.media_path) return bad("gone", 410);
  return streamMedia(req, r.media_path, r.media_mime || "audio/mp4");
}
