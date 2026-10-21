import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { badText } from "@/lib/communityProfiles";
import { MIN_POST_AGE, NO_STORE, line, para, talentGate } from "@/lib/talents";
import { removeMedia, storeUpload } from "@/lib/media";

export const dynamic = "force-dynamic";

// Verification application. GET: the latest own application (status only). POST multipart: realName, country,
// rewaya, teacher, ijazahInfo, sample (a short recitation recorded in the app). Real name and teacher details are
// seen only by admins; the sample is deleted when the application is decided.
export async function GET(req: NextRequest) {
  const g = await talentGate(req, "verif", 60);
  if (g.res) return g.res;
  const r = await pool()!.query("SELECT status, reject_reason, created_at, reviewed_at FROM community_verifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", [g.me.id]);
  const x = r.rows[0];
  return json({ application: x ? { status: x.status, reason: x.status === "rejected" ? x.reject_reason : "", at: x.created_at, reviewedAt: x.reviewed_at } : null }, 200, NO_STORE);
}

export async function POST(req: NextRequest) {
  const g = await talentGate(req, "verif-apply", 3, { windowMs: 24 * 60 * 60_000, write: true, minAge: MIN_POST_AGE, needProfile: true });
  if (g.res) return g.res;
  const p = pool()!;
  const open = await p.query("SELECT 1 FROM community_verifications WHERE user_id = $1 AND status = 'pending'", [g.me.id]);
  if (open.rows[0]) return json({ error: "application_pending" }, 409);
  const done = await p.query("SELECT verified FROM community_profiles WHERE user_id = $1", [g.me.id]);
  if (done.rows[0]?.verified) return json({ error: "already_verified" }, 409);
  const form = await req.formData().catch(() => null);
  if (!form) return json({ error: "bad_request" }, 400);
  const realName = line(form.get("realName"), 100);
  const country = /^[A-Za-z]{2}$/.test(String(form.get("country") ?? "")) ? String(form.get("country")).toUpperCase() : null;
  const rewaya = line(form.get("rewaya"), 60);
  const teacher = para(form.get("teacher"), 300);
  const ijazahInfo = para(form.get("ijazahInfo"), 1000);
  if (realName.length < 2) return json({ error: "real_name" }, 400);
  for (const t of [rewaya, teacher]) { const bad = await badText(t); if (bad) return json({ error: bad }, 400); }
  const file = form.get("sample");
  if (!(file instanceof File) || file.size < 1000) return json({ error: "sample_required" }, 400);
  if (file.size > 10 * 1024 * 1024) return json({ error: "media_too_large" }, 400);
  const ins = await p.query(
    "INSERT INTO community_verifications (user_id, real_name, country, rewaya, teacher, ijazah_info) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id",
    [g.me.id, realName, country, rewaya, teacher, ijazahInfo],
  );
  const id = String(ins.rows[0].id);
  const stored = await storeUpload(Buffer.from(await file.arrayBuffer()), "samples", `v${id}`, { wantVideo: false, maxSeconds: 60 });
  if ("error" in stored) {
    await p.query("DELETE FROM community_verifications WHERE id = $1", [id]);
    return json({ error: stored.error }, stored.error === "media_unavailable" ? 503 : 400);
  }
  try {
    await p.query("UPDATE community_verifications SET sample_path = $2, sample_mime = $3 WHERE id = $1", [id, stored.rel, stored.mime]);
  } catch (e) { await removeMedia(stored.rel); throw e; }
  return json({ application: { status: "pending" } }, 200, NO_STORE);
}
