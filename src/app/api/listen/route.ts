import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";

export const dynamic = "force-dynamic";
const day = () => Math.floor(Date.now() / 86400000);

// anonymous listening totals from the verse player (sent every minute and when the page is left)
export async function POST(req: NextRequest) {
  const p = pool();
  if (!p) return json({ ok: false }, 503);
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const ip = clientIp(req);
  if (rateLimited(`listen:${ip}`, 30, 60_000)) return json({ error: "rate" }, 429);
  const b = (await req.json().catch(() => ({}))) as { items?: { s?: unknown; r?: unknown; sec?: unknown; v?: unknown }[] };
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 20).flatMap((x) => {
    const s = Number(x.s), sec = Math.min(900, Math.max(0, Math.round(Number(x.sec) || 0))), v = Math.min(300, Math.max(0, Math.round(Number(x.v) || 0)));
    const r = typeof x.r === "string" ? x.r.replace(/[^\p{L}\p{N} .'\-]/gu, "").slice(0, 60) : "";
    return Number.isInteger(s) && s >= 1 && s <= 114 && (sec > 0 || v > 0) ? [{ s, r, sec, v }] : [];
  });
  if (!items.length) return json({ ok: true });
  try {
    const d = day();
    for (const it of items) {
      await p.query(
        "INSERT INTO listen_stats (day, surah, reciter, seconds, verses) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (day, surah, reciter) DO UPDATE SET seconds = listen_stats.seconds + $4, verses = listen_stats.verses + $5",
        [d, it.s, it.r, it.sec, it.v],
      );
    }
    const subject = crypto.createHash("sha256").update(ip + (req.cookies.get("tf_anon")?.value ?? "") + d).digest("hex").slice(0, 32);
    await p.query("INSERT INTO listen_people (day, subject) VALUES ($1,$2) ON CONFLICT DO NOTHING", [d, subject]);
  } catch {
    return json({ ok: false }, 500);
  }
  return json({ ok: true });
}
