import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  return json(await getSettings());
}

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as { anonTafsirLimit?: number; commentsAutoApprove?: boolean };
  const limit = Math.max(0, Math.min(10000, Math.floor(Number(b.anonTafsirLimit))));
  if (!Number.isFinite(limit)) return json({ error: "bad request" }, 400);
  await pool()!.query("INSERT INTO settings (key, value) VALUES ('app', $1) ON CONFLICT (key) DO UPDATE SET value = settings.value || $1", [JSON.stringify({ anonTafsirLimit: limit, commentsAutoApprove: b.commentsAutoApprove === true })]);
  return json(await getSettings());
}
