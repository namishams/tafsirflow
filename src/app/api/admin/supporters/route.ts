import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin } from "@/lib/http";
import { adminSupporters } from "@/lib/supporters";

export const dynamic = "force-dynamic";

// Supporters list in the admin panel: every paid support payment; hide/show an entry (removal on request)
export async function GET() {
  if (!(await requireAdmin())) return json({ error: "forbidden" }, 403);
  return json({ supporters: await adminSupporters() });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin()) || !sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as { id?: number; hidden?: boolean };
  if (!Number.isInteger(b.id) || typeof b.hidden !== "boolean") return json({ error: "input" }, 400);
  await pool()!.query("UPDATE supporters SET hidden = $2 WHERE id = $1", [b.id, b.hidden]);
  try { revalidatePath("/[locale]", "page"); } catch { /* next refresh picks it up */ }
  return json({ ok: true });
}
