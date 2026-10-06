import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { json, sameOrigin, sanitizeHtml } from "@/lib/http";

export const dynamic = "force-dynamic";

async function guard(req?: NextRequest) {
  if (!(await requireAdmin())) return false;
  return !req || req.method === "GET" || sameOrigin(req);
}

export async function GET(req: NextRequest) {
  if (!(await guard(req))) return json({ error: "forbidden" }, 403);
  const q = req.nextUrl.searchParams;
  const lang = q.get("lang");
  const surah = Number(q.get("surah")) || null;
  const r = await pool()!.query(
    "SELECT * FROM tafsir_entries WHERE ($1::text IS NULL OR language = $1) AND ($2::int IS NULL OR surah = $2) ORDER BY surah, verse_from, id LIMIT 500",
    [lang, surah],
  );
  return json({ entries: r.rows });
}

type Body = { id?: number; language?: string; source?: string; surah?: number; verse_from?: number; verse_to?: number; html?: string; status?: string; generated_by_ai?: boolean };

function clean(b: Body) {
  const surah = Number(b.surah), from = Number(b.verse_from), to = Number(b.verse_to ?? b.verse_from);
  if (!/^[a-z]{2}$/.test(String(b.language)) || !(surah >= 1 && surah <= 114) || !(from >= 1) || !(to >= from) || !String(b.html ?? "").trim()) return null;
  return {
    language: String(b.language), source: String(b.source || "Quran Masterclass").slice(0, 120), surah, from, to,
    html: sanitizeHtml(String(b.html)), status: b.status === "approved" ? "approved" : "draft", ai: !!b.generated_by_ai,
  };
}

export async function POST(req: NextRequest) {
  if (!(await guard(req))) return json({ error: "forbidden" }, 403);
  const c = clean((await req.json().catch(() => ({}))) as Body);
  if (!c) return json({ error: "bad request" }, 400);
  const r = await pool()!.query(
    "INSERT INTO tafsir_entries (language, source, surah, verse_from, verse_to, html, status, generated_by_ai) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
    [c.language, c.source, c.surah, c.from, c.to, c.html, c.status, c.ai],
  );
  return json({ id: Number(r.rows[0].id) });
}

export async function PUT(req: NextRequest) {
  if (!(await guard(req))) return json({ error: "forbidden" }, 403);
  const b = (await req.json().catch(() => ({}))) as Body;
  const c = clean(b);
  if (!c || !b.id) return json({ error: "bad request" }, 400);
  await pool()!.query(
    "UPDATE tafsir_entries SET language=$2, source=$3, surah=$4, verse_from=$5, verse_to=$6, html=$7, status=$8, generated_by_ai=$9, updated_at=now() WHERE id=$1",
    [b.id, c.language, c.source, c.surah, c.from, c.to, c.html, c.status, c.ai],
  );
  return json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await guard(req))) return json({ error: "forbidden" }, 403);
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return json({ error: "bad request" }, 400);
  await pool()!.query("DELETE FROM tafsir_entries WHERE id = $1", [id]);
  return json({ ok: true });
}
