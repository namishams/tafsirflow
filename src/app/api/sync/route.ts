import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";
const KEYS = new Set(["tf:last", "tf:bookmarks", "tf:srs", "tf:days"]);

export async function GET() {
  const u = await currentUser();
  if (!u) return json({ error: "auth" }, 401);
  const r = await pool()!.query("SELECT key, value FROM user_data WHERE user_id = $1", [u.id]);
  return json(Object.fromEntries(r.rows.map((x) => [x.key, x.value])));
}

export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const u = await currentUser();
  if (!u) return json({ error: "auth" }, 401);
  const raw = await req.text();
  if (raw.length > 400_000) return json({ error: "too large" }, 413);
  const body = JSON.parse(raw || "{}") as Record<string, unknown>;
  for (const [k, v] of Object.entries(body)) {
    if (!KEYS.has(k) || v === undefined) continue;
    await pool()!.query(
      "INSERT INTO user_data (user_id, key, value) VALUES ($1, $2, $3) ON CONFLICT (user_id, key) DO UPDATE SET value = $3, updated_at = now()",
      [u.id, k, JSON.stringify(v)],
    );
  }
  return json({ ok: true });
}
