import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
const KEYS = new Set(["tf:last", "tf:bookmarks", "tf:srs", "tf:days", "tf:notes", "tf:academy", "tf:khatm", "tf:plan", "tf:mnemo", "tf:vocab", "tf:tajweed", "tf:duafav", "tf:arabic", "tf:goal", "tf:wudu", "tf:points", "tf:listen", "tf:jv"]);

export async function GET() {
  const u = await currentUser();
  if (!u) return json({ error: "auth" }, 401);
  if (!u.emailVerified) return json({ error: "verify" }, 403);
  const r = await pool()!.query("SELECT key, value FROM user_data WHERE user_id = $1", [u.id]);
  return json(Object.fromEntries(r.rows.map((x) => [x.key, x.value])));
}

export async function PUT(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const u = await currentUser();
  if (!u) return json({ error: "auth" }, 401);
  if (!u.emailVerified) return json({ error: "verify" }, 403);
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
  // points per day for the ranking: only recent days, at most the daily cap set by the admin (1,500 by default), and a day never loses points
  const d = (body["tf:points"] as { d?: Record<string, unknown> } | undefined)?.d;
  if (d && typeof d === "object") {
    const today = Math.floor(Date.now() / 86400000);
    const cap = (await getSettings()).limits.rankingDailyCap;
    const rows = Object.entries(d).map(([k, v]) => [Number(k), Math.min(cap, Math.max(0, Math.round(Number(v) || 0)))] as const).filter(([k, v]) => Number.isInteger(k) && k >= today - 400 && k <= today + 1 && v > 0);
    if (rows.length) await pool()!.query(
      `INSERT INTO user_points (user_id, day, points) SELECT $1, d, p FROM unnest($2::int[], $3::int[]) AS x(d, p)
       ON CONFLICT (user_id, day) DO UPDATE SET points = GREATEST(user_points.points, EXCLUDED.points)`,
      [u.id, rows.map((r) => r[0]), rows.map((r) => r[1])],
    );
  }
  return json({ ok: true });
}
