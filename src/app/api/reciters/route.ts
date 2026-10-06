import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RECITERS } from "@/lib/quran";

export const dynamic = "force-dynamic";

// Reciters whose complete audio is on this server (registered by scripts/import-reciters.sh)
export async function GET() {
  try {
    const r = await pool()?.query("SELECT folder, slug, name, COALESCE(qc_id, 0) AS id FROM reciters WHERE enabled ORDER BY sort, name");
    if (r?.rows.length) return NextResponse.json({ reciters: r.rows.map((x) => ({ folder: x.folder, slug: x.slug, name: x.name, id: Number(x.id) })) }, { headers: { "Cache-Control": "public, max-age=300" } });
  } catch {
    /* fall through to the built-in list */
  }
  return NextResponse.json({ reciters: RECITERS });
}
