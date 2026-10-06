import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { json } from "@/lib/http";

export const dynamic = "force-dynamic";

// Approved own-tafsir entries covering a verse
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const lang = String(q.get("lang") ?? "");
  const surah = Number(q.get("surah"));
  const verse = Number(q.get("verse"));
  if (!/^[a-z]{2}$/.test(lang) || !surah || !verse) return json({ error: "bad request" }, 400);
  const r = await pool()?.query(
    "SELECT source, html, verse_from, verse_to, generated_by_ai FROM tafsir_entries WHERE language = $1 AND surah = $2 AND status = 'approved' AND verse_from <= $3 AND verse_to >= $3 ORDER BY verse_to - verse_from LIMIT 1",
    [lang, surah, verse],
  );
  const e = r?.rows[0];
  return json(e ? { entry: e } : { entry: null });
}
