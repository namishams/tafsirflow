import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getContent, isAllowed } from "@/lib/upstream";
import { pool } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { clientIp } from "@/lib/http";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const TAFSIR = /^\/tafsirs\/\d+\/by_ayah\/(\d+:\d+)$/;

// Freemium gate: anonymous visitors may open tafsir for a limited number of different verses per day (set in admin).
// Only the verse the reader actually opened counts (header x-tf-primary), not the look-back for grouped entries.
async function gate(req: NextRequest, verseKey: string): Promise<{ blocked: boolean; limit: number; setAnon?: string }> {
  const p = pool();
  if (!p || req.headers.get("x-tf-primary") !== "1") return { blocked: false, limit: 0 };
  if (await currentUser()) return { blocked: false, limit: 0 };
  const { anonTafsirLimit: limit } = await getSettings();
  const anon = req.cookies.get("tf_anon")?.value ?? crypto.randomBytes(12).toString("hex");
  const subject = crypto.createHash("sha256").update(clientIp(req) + anon).digest("hex");
  const day = Math.floor(Date.now() / 86400000);
  try {
    const seen = await p.query("SELECT 1 FROM usage_verses WHERE day = $1 AND subject = $2 AND verse_key = $3", [day, subject, verseKey]);
    if (!seen.rowCount) {
      const n = Number((await p.query("SELECT count(*) AS n FROM usage_verses WHERE day = $1 AND subject = $2", [day, subject])).rows[0].n);
      if (n >= limit) return { blocked: true, limit, setAnon: req.cookies.get("tf_anon") ? undefined : anon };
      await p.query("INSERT INTO usage_verses (day, subject, verse_key) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING", [day, subject, verseKey]);
    }
  } catch {
    return { blocked: false, limit }; // never lock readers out because of a DB hiccup
  }
  return { blocked: false, limit, setAnon: req.cookies.get("tf_anon") ? undefined : anon };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const p = "/" + path.join("/");
  if (!isAllowed(p)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const tafsir = TAFSIR.exec(p);
  let setAnon: string | undefined;
  if (tafsir) {
    const g = await gate(req, tafsir[1]);
    setAnon = g.setAnon;
    if (g.blocked) {
      const res = NextResponse.json({ error: "limit", limit: g.limit }, { status: 402 });
      if (setAnon) res.cookies.set("tf_anon", setAnon, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 86400 * 365 });
      return res;
    }
  }

  try {
    const data = await getContent(p + req.nextUrl.search);
    if ((data as { __missing?: boolean }).__missing) return NextResponse.json({ error: "not found" }, { status: 404 });
    const res = NextResponse.json(data, { headers: { "Cache-Control": tafsir ? "private, max-age=3600" : "public, max-age=3600" } });
    if (setAnon) res.cookies.set("tf_anon", setAnon, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 86400 * 365 });
    return res;
  } catch {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }
}
