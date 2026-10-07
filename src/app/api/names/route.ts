import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { NAME_BY_KEY } from "@/lib/names";
import { NAME_VERSES } from "@/lib/names/verses";
import { getResources, getVerseByKey, pickTranslation } from "@/lib/quran";

export const dynamic = "force-dynamic";

// Without a database (local dev) the counts live in memory
const g = globalThis as unknown as { __nameFavs?: Map<string, number> };
const mem = () => (g.__nameFavs ??= new Map());

// GET            → the 20 names families saved most often ("most loved by families")
// GET ?verses=…  → the verses linked to names: exact Arabic + translation in the reader's language
export async function GET(req: NextRequest) {
  const verses = req.nextUrl.searchParams.get("verses");
  if (verses !== null) {
    const keys = verses.split(",").filter((k) => /^\d{1,3}:\d{1,3}$/.test(k) && NAME_VERSES[k]).slice(0, 8);
    const locale = /^[a-z]{2}$/.test(req.nextUrl.searchParams.get("locale") ?? "") ? req.nextUrl.searchParams.get("locale")! : "en";
    let tid = 20;
    if (locale !== "ar") { try { tid = pickTranslation(locale, (await getResources()).translations); } catch { /* default */ } }
    const out = await Promise.all(keys.map(async (key) => {
      let tr = "";
      if (locale !== "ar") { try { tr = (await getVerseByKey(key, locale, tid)).translation.replace(/<[^>]+>/g, "").trim(); } catch { /* Arabic only */ } }
      return { key, ar: NAME_VERSES[key], tr };
    }));
    return json({ verses: out }, 200, { "Cache-Control": "public, s-maxage=86400" });
  }
  const p = pool();
  let top: { id: string; n: number }[] = [];
  if (p) {
    try {
      const r = await p.query("SELECT name_id, n FROM name_favs WHERE n > 0 ORDER BY n DESC, name_id LIMIT 20");
      top = r.rows.map((x: { name_id: string; n: string }) => ({ id: x.name_id, n: Number(x.n) }));
    } catch { /* table missing: empty list */ }
  } else {
    top = [...mem()].sort((a, b) => b[1] - a[1]).slice(0, 20).map(([id, n]) => ({ id, n }));
  }
  return json({ top: top.filter((x) => NAME_BY_KEY.has(x.id)) }, 200, { "Cache-Control": "public, s-maxage=300" });
}

// POST {id} → a family saved this name (each name counts once per visitor address and day)
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  const ip = clientIp(req);
  if (rateLimited(`names:ip:${ip}`, 40, 60 * 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { id?: unknown };
  const id = typeof b.id === "string" ? b.id.slice(0, 40) : "";
  if (!NAME_BY_KEY.has(id)) return json({ error: "unknown" }, 400);
  if (rateLimited(`names:fav:${ip}:${id}`, 1, 24 * 60 * 60_000)) return json({ ok: true, counted: false });
  const p = pool();
  if (!p) { mem().set(id, (mem().get(id) ?? 0) + 1); return json({ ok: true, counted: true }); }
  try {
    await p.query("INSERT INTO name_favs (name_id, n) VALUES ($1, 1) ON CONFLICT (name_id) DO UPDATE SET n = name_favs.n + 1", [id]);
    return json({ ok: true, counted: true });
  } catch {
    return json({ error: "db" }, 503);
  }
}
