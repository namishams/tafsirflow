import { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { pool } from "@/lib/db";
import { clientIp, json, rateLimited, sameOrigin } from "@/lib/http";
import { SPECIALS, earnedProduct, founderProduct, rareProduct, uniqueProduct } from "@/lib/store/catalog";

export const dynamic = "force-dynamic";

// GET /api/app/store/board – "Seltenste Sammlungen" and "Unikate & Nummern": how many members hold each earned and
// rare sticker (counts only), and the owners of one-of-ones and founder numbers 1-10 who chose to be listed.
// POST { show: boolean } – opt in or out of the list.
export async function GET() {
  const p = pool();
  if (!p) return json({ error: "nodb" }, 503);
  const counts = (await p.query<{ product_id: string; n: number }>(
    "SELECT product_id, count(*)::int AS n FROM iap_entitlements WHERE revoked_at IS NULL AND (product_id LIKE '%.earned.%' OR product_id LIKE '%.rare.%' OR product_id LIKE '%.unique.%') GROUP BY product_id")).rows;
  const listed = (await p.query<{ product_id: string; edition: number | null; username: string }>(
    `SELECT e.product_id, e.edition, c.username FROM iap_entitlements e JOIN community_profiles c ON c.user_id = e.user_id
      WHERE e.revoked_at IS NULL AND c.show_collection AND NOT c.suspended AND (e.product_id LIKE '%.unique.%' OR e.product_id LIKE '%.founder')
      ORDER BY e.product_id, e.edition`)).rows;
  const n = (id: string) => counts.find((x) => x.product_id === id)?.n ?? 0;
  return json({
    items: SPECIALS.map((x) => ({
      slug: x.slug, tier: x.tier, holders: x.tier === "rare" ? n(rareProduct(x.slug)) + n(founderProduct(x.slug)) : x.tier === "unique" ? n(uniqueProduct(x.slug)) : n(earnedProduct(x.slug)),
      owners: listed.filter((l) => l.product_id === uniqueProduct(x.slug) || l.product_id === founderProduct(x.slug)).map((l) => ({ username: l.username, number: l.edition })),
    })),
  }, 200, { "Cache-Control": "private, max-age=60" });
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return json({ error: "origin" }, 403);
  if (rateLimited(`board:${clientIp(req)}`, 20, 60 * 60_000)) return json({ error: "rate" }, 429);
  const me = await currentUser();
  if (!me) return json({ error: "login" }, 401);
  const b = (await req.json().catch(() => ({}))) as { show?: unknown };
  await pool()!.query("UPDATE community_profiles SET show_collection = $2 WHERE user_id = $1", [me.id, b.show === true]);
  return json({ ok: true, show: b.show === true });
}
