import { currentUser } from "@/lib/auth";
import { json } from "@/lib/http";
import { publicCatalog } from "@/lib/store/catalog";
import { decorOf, editionsLeft, ownedOf } from "@/lib/store/entitlements";
import { pool } from "@/lib/db";
import { checkEarned } from "@/lib/store/earned";

export const dynamic = "force-dynamic";

// GET /api/app/store – the catalogue of the in-app store (packs with their SVG art, rare stickers with the numbers
// left in each edition, frames, single courses) and, when signed in, what the account owns, its garden decoration,
// gifts waiting to be sent, the chosen frame and showcase. Prices never come from here: only from the App Store.
export async function GET() {
  const me = await currentUser();
  if (me) await checkEarned(me.id).catch(() => undefined); // achievements the server can confirm become earned stickers
  const [catalog, left] = await Promise.all([publicCatalog(), editionsLeft(me?.id ?? null)]);
  if (!me) return json({ ...catalog, editionsLeft: left, me: null }, 200, { "Cache-Control": "private, no-store" });
  const p = pool();
  const [owned, decor, gifts, prof] = await Promise.all([
    ownedOf(me.id), decorOf(me.id),
    p ? p.query("SELECT id, pack FROM sticker_gifts WHERE from_user = $1 AND to_user IS NULL ORDER BY id", [me.id]).then((r) => r.rows.map((g) => ({ id: String(g.id), pack: g.pack }))) : [],
    p ? p.query("SELECT frame, showcase, show_collection FROM community_profiles WHERE user_id = $1", [me.id]).then((r) => r.rows[0]) : null,
  ]);
  return json({
    ...catalog, editionsLeft: left,
    me: { pro: me.plan === "premium", owned: owned.products, editions: owned.editions, proMonthTaken: owned.proMonthTaken, decor, gifts, frame: prof?.frame ?? null, showcase: prof?.showcase ?? [], showCollection: !!prof?.show_collection },
  }, 200, { "Cache-Control": "private, no-store" });
}
