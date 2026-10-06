import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const lang = String(req.nextUrl.searchParams.get("lang") ?? "");
  if (!/^[a-z]{2}$/.test(lang)) return json({ count: 0 });
  try {
    const r = await pool()?.query("SELECT count(*)::int AS n FROM tafsir_entries WHERE language = $1 AND status = 'approved'", [lang]);
    return json({ count: r?.rows[0]?.n ?? 0 });
  } catch {
    return json({ count: 0 });
  }
}
