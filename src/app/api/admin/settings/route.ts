import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";
import { getSettings, sanitize } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  return json(await getSettings());
}

// partial updates: only the parts sent are changed, everything is validated
export async function PUT(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const next = sanitize(await req.json().catch(() => ({})), await getSettings());
  await pool()!.query("INSERT INTO settings (key, value) VALUES ('app', $1) ON CONFLICT (key) DO UPDATE SET value = $1", [JSON.stringify(next)]);
  return json(await getSettings());
}
