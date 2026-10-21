import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { NO_STORE, talentGate } from "@/lib/talents";
import { removeMedia, storeAvatar } from "@/lib/media";

export const dynamic = "force-dynamic";

// POST multipart "image": the profile picture (JPEG/PNG, re-encoded without metadata). DELETE: back to the
// calligraphic initials.
export async function POST(req: NextRequest) {
  const g = await talentGate(req, "avatar", 10, { windowMs: 60 * 60_000, write: true, needProfile: true });
  if (g.res) return g.res;
  const form = await req.formData().catch(() => null);
  const file = form?.get("image");
  if (!(file instanceof File) || file.size < 200) return json({ error: "media_required" }, 400);
  const p = pool()!;
  const old = (await p.query("SELECT avatar_path, avatar_version FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0];
  const version = Number(old?.avatar_version ?? 0) + 1;
  const stored = await storeAvatar(Buffer.from(await file.arrayBuffer()), `u${g.me.id}-${version}`);
  if ("error" in stored) return json({ error: stored.error }, stored.error === "media_unavailable" ? 503 : 400);
  await p.query("UPDATE community_profiles SET avatar_path = $2, avatar_version = $3 WHERE user_id = $1", [g.me.id, stored.rel, version]);
  if (old?.avatar_path && old.avatar_path !== stored.rel) await removeMedia(old.avatar_path);
  const u = (await p.query("SELECT username FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0];
  return json({ avatar: `/api/community/avatar/${u.username}?v=${version}` }, 200, NO_STORE);
}

export async function DELETE(req: NextRequest) {
  const g = await talentGate(req, "avatar", 10, { windowMs: 60 * 60_000, write: true, needProfile: true });
  if (g.res) return g.res;
  const p = pool()!;
  const old = (await p.query("SELECT avatar_path FROM community_profiles WHERE user_id = $1", [g.me.id])).rows[0];
  await p.query("UPDATE community_profiles SET avatar_path = NULL, avatar_version = avatar_version + 1 WHERE user_id = $1", [g.me.id]);
  await removeMedia(old?.avatar_path);
  return json({ avatar: null }, 200, NO_STORE);
}
