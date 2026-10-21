import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";
import { streamMedia } from "@/lib/media";

export const dynamic = "force-dynamic";

// The profile picture of a public, not suspended member aged 16+ (shown on the public website profile, too);
// younger members only to signed-in viewers through the app, so here it is not served for them.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  if (!pool()) return json({ error: "unavailable" }, 503);
  const r = await pool()!.query(
    `SELECT c.avatar_path FROM community_profiles c JOIN users u ON u.id = c.user_id
      WHERE c.username = $1 AND c.public AND NOT c.suspended AND c.avatar_path IS NOT NULL
        AND u.birth_year IS NOT NULL AND extract(year from now())::int - u.birth_year >= 16`,
    [String((await params).username).toLowerCase().slice(0, 40)],
  );
  if (!r.rows[0]) return json({ error: "not_found" }, 404);
  const rel = String(r.rows[0].avatar_path);
  const res = await streamMedia(req, rel, rel.endsWith(".png") ? "image/png" : "image/jpeg");
  if (res.status === 200) res.headers.set("Cache-Control", "public, max-age=604800, immutable"); // the URL carries ?v=
  return res;
}
