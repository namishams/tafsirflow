import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import {
  BUNDLE_PRODUCT, EDITION, FOUNDER_MAX, FRAME_SLUGS, REWARD_FRAME, SPECIALS, UNIQUE, allPacks, courseProduct, founderProduct, frameProduct, monthKey, packProduct,
  packStickers, productsOfSpecial, proPackOf, specialSticker, rareProduct, uniqueProduct, type CourseSlug,
} from "./catalog";

// Owned products of an account (iap_entitlements). Pro itself stays in users.plan; Pro does NOT include the packs:
// a Pro member can take the pack of the month (it stays theirs), everything else is bought.
export type Owned = { products: string[]; editions: Record<string, number>; proMonthTaken: boolean };

export async function ownedOf(userId: number): Promise<Owned> {
  const p = pool();
  if (!p) return { products: [], editions: {}, proMonthTaken: false };
  const r = await p.query<{ product_id: string; edition: number | null; source: string; created_at: Date }>(
    "SELECT product_id, edition, source, created_at FROM iap_entitlements WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
  const mk = monthKey();
  return {
    products: r.rows.map((x) => x.product_id),
    editions: Object.fromEntries(r.rows.filter((x) => x.edition).map((x) => [x.product_id, Number(x.edition)])),
    proMonthTaken: r.rows.some((x) => x.source === "pro_month" && monthKey(new Date(x.created_at)) === mk),
  };
}
export const ownsPack = (o: Owned, slug: string) => o.products.includes(packProduct(slug)) || o.products.includes(BUNDLE_PRODUCT);
/** owns a special sticker (any of its products: regular or founder number, one-of-one, earned) */
export function ownsSpecial(o: Owned, slug: string): boolean {
  const x = SPECIALS.find((r) => r.slug === slug);
  return !!x && productsOfSpecial(x).some((id) => o.products.includes(id));
}
export const ownsCourse = (o: Owned, slug: CourseSlug) => o.products.includes(courseProduct(slug));

/** grant one product (idempotent per account; a transaction id counts once). Numbered rare stickers get the next
 *  number of their product (founder series 1-10, regular 11-300); a one-of-one goes to one account only (the reserved
 *  buyer). Returns "conflict" when a one-of-one was already owned by someone else (the purchase is then kept on record,
 *  revoked, for a refund). */
export async function grant(c: PoolClient, userId: number, productId: string, source: string, tx: string | null, env: string | null): Promise<boolean | "conflict"> {
  let edition: number | null = null;
  let revoked = false;
  const rare = SPECIALS.find((r) => r.tier === "rare" && (rareProduct(r.slug) === productId || founderProduct(r.slug) === productId));
  const uniq = UNIQUE.find((r) => uniqueProduct(r.slug) === productId);
  if (rare || uniq) await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [productId]);
  if (rare) {
    const founder = productId === founderProduct(rare.slug);
    const n = Number((await c.query("SELECT COALESCE(max(edition), 0)::int AS n FROM iap_entitlements WHERE product_id = $1", [productId])).rows[0].n);
    const next = founder ? Math.max(1, n + 1) : Math.max(FOUNDER_MAX + 1, n + 1);
    if (next <= (founder ? FOUNDER_MAX : EDITION)) edition = next;
  }
  if (uniq) {
    // never accept a one-of-one owned by someone else, or held right now for someone else's open purchase sheet
    // or pending (Ask to Buy) purchase
    const other = (await c.query("SELECT user_id FROM iap_entitlements WHERE product_id = $1 AND revoked_at IS NULL", [productId])).rows[0];
    const held = (await c.query("SELECT user_id FROM store_reservations WHERE product_id = $1 AND until > now()", [productId])).rows[0];
    if ((other && Number(other.user_id) !== userId) || (!other && held && Number(held.user_id) !== userId)) revoked = true;
    else edition = 1;
  }
  const r = await c.query(
    `INSERT INTO iap_entitlements (user_id, product_id, source, transaction_id, environment, edition, revoked_at) VALUES ($1,$2,$3,$4,$5,$6, CASE WHEN $7 THEN now() END)
     ON CONFLICT DO NOTHING RETURNING product_id`, [userId, productId, source, tx, env, edition, revoked]);
  if (uniq && !revoked) await c.query("DELETE FROM store_reservations WHERE product_id = $1", [productId]);
  // the buyer is never left empty-handed: one month of Pro, once per transaction (lasting Premium stays lasting);
  // the app also says how to ask Apple for a refund (reportaproblem.apple.com)
  if (revoked && r.rowCount) {
    await c.query(
      `UPDATE users SET plan = 'premium', pro_until = CASE WHEN plan = 'premium' AND pro_until IS NULL THEN NULL
         ELSE GREATEST(COALESCE(pro_until, now()), now()) + interval '30 days' END WHERE id = $1`, [userId]);
  }
  return revoked ? "conflict" : !!r.rowCount;
}

export type EditionState = { left: number; next: number | null; founderLeft: number; founderNext: number | null; owner: string | null; reservedByOther: boolean };
/** per special sticker: numbers left and the next number (shown before purchase), the owner of a one-of-one */
export async function editionsLeft(meId: number | null = null): Promise<Record<string, EditionState>> {
  const p = pool();
  const out: Record<string, EditionState> = {};
  const rows = p ? (await p.query<{ product_id: string; n: number; mx: number | null; owner: string | null }>(
    `SELECT e.product_id, count(*)::int AS n, max(e.edition) AS mx, max(c.username) AS owner
       FROM iap_entitlements e LEFT JOIN community_profiles c ON c.user_id = e.user_id
      WHERE e.revoked_at IS NULL AND (e.product_id LIKE '%.rare.%' OR e.product_id LIKE '%.unique.%') GROUP BY e.product_id`)).rows : [];
  const res = p ? (await p.query<{ product_id: string; user_id: string }>("SELECT product_id, user_id FROM store_reservations WHERE until > now()")).rows : [];
  const row = (id: string) => rows.find((x) => x.product_id === id);
  for (const x of SPECIALS) {
    if (x.tier === "rare") {
      const reg = row(rareProduct(x.slug)), fo = row(founderProduct(x.slug));
      const regNext = Math.max(FOUNDER_MAX + 1, Number(reg?.mx ?? 0) + 1), foNext = Number(fo?.mx ?? 0) + 1;
      out[x.slug] = { left: Math.max(0, EDITION - regNext + 1), next: regNext <= EDITION ? regNext : null, founderLeft: Math.max(0, FOUNDER_MAX - foNext + 1), founderNext: foNext <= FOUNDER_MAX ? foNext : null, owner: null, reservedByOther: false };
    } else if (x.tier === "unique") {
      const u = row(uniqueProduct(x.slug));
      const rv = res.find((r) => r.product_id === uniqueProduct(x.slug));
      out[x.slug] = { left: u ? 0 : 1, next: u ? null : 1, founderLeft: 0, founderNext: null, owner: u?.owner ?? (u ? "" : null), reservedByOther: !!rv && Number(rv.user_id) !== meId };
    }
  }
  return out;
}

/** reserve a one-of-one before the purchase sheet opens: 10 minutes, refreshed by the app while the sheet is open;
 *  72 hours once the store reports the purchase as pending (Ask to Buy, delayed payment) so it stays held until the
 *  transaction is final. "taken" or "reserved" when someone else owns or holds it. */
export async function reserve(userId: number, productId: string, pending = false): Promise<"ok" | "taken" | "reserved" | "input"> {
  const p = pool();
  if (!p || !UNIQUE.some((u) => uniqueProduct(u.slug) === productId)) return "input";
  const c = await p.connect();
  try {
    await c.query("BEGIN");
    await c.query("SELECT pg_advisory_xact_lock(hashtext($1))", [productId]);
    if ((await c.query("SELECT 1 FROM iap_entitlements WHERE product_id = $1 AND revoked_at IS NULL", [productId])).rowCount) { await c.query("ROLLBACK"); return "taken"; }
    const r = await c.query(
      `INSERT INTO store_reservations (product_id, user_id, until) VALUES ($1, $2, now() + ($3::text)::interval)
       ON CONFLICT (product_id) DO UPDATE SET user_id = EXCLUDED.user_id, until = GREATEST(CASE WHEN store_reservations.user_id = EXCLUDED.user_id THEN store_reservations.until END, EXCLUDED.until)
       WHERE store_reservations.until < now() OR store_reservations.user_id = EXCLUDED.user_id RETURNING product_id`, [productId, userId, pending ? "72 hours" : "10 minutes"]);
    await c.query("COMMIT");
    return r.rowCount ? "ok" : "reserved";
  } catch {
    await c.query("ROLLBACK").catch(() => undefined);
    return "reserved";
  } finally {
    c.release();
  }
}

/** a Pro member takes this month's pack */
export async function takeProPack(userId: number): Promise<{ ok: boolean; pack?: string; error?: string }> {
  const p = pool();
  if (!p) return { ok: false, error: "nodb" };
  const o = await ownedOf(userId);
  if (o.proMonthTaken) return { ok: false, error: "taken" };
  const slug = proPackOf(await allPacks());
  if (!slug) return { ok: false, error: "none" };
  if (ownsPack(o, slug)) return { ok: false, error: "owned" };
  const c = await p.connect();
  try { await grant(c, userId, packProduct(slug), "pro_month", null, null); } finally { c.release(); }
  return { ok: true, pack: slug };
}

// ---------- garden decoration and albums ----------
/** where a sticker sits on the garden: x/y 0..1 of the scene; spot "crown" and "arch" are the high spots */
export type Placed = { id: string; x: number; y: number; s: number; spot: "crown" | "arch" | "ground" | "branch" };
const HIGH = new Set(["crown", "arch"]);
export const MAX_PLACED = 60;

/** every placeable sticker: the store packs that contain it (an art sticker can sit in several), or its special */
export async function stickerIndex(): Promise<Map<string, { packs: string[]; rare: string | null; sacred: boolean }>> {
  const m = new Map<string, { packs: string[]; rare: string | null; sacred: boolean }>();
  for (const p of await allPacks()) for (const s of packStickers(p)) {
    const e = m.get(s.id);
    if (e) e.packs.push(p.slug); else m.set(s.id, { packs: [p.slug], rare: null, sacred: s.sacred });
  }
  for (const r of SPECIALS) { const s = specialSticker(r); m.set(s.id, { packs: [], rare: r.slug, sacred: s.sacred }); }
  return m;
}

/** save the decoration: only owned stickers; sacred ones never on the ground (only crown or arch) */
export async function saveDecor(userId: number, raw: unknown): Promise<{ items: Placed[]; collected: string[]; completed: string[]; reward: boolean } | { error: string }> {
  const p = pool();
  if (!p) return { error: "nodb" };
  if (!Array.isArray(raw)) return { error: "input" };
  const idx = await stickerIndex();
  const o = await ownedOf(userId);
  const items: Placed[] = [];
  for (const x of raw.slice(0, MAX_PLACED) as Partial<Placed>[]) {
    const info = typeof x?.id === "string" ? idx.get(x.id) : undefined;
    if (!info) continue;
    if (!info.rare && !info.packs.some((pk) => ownsPack(o, pk))) continue;
    if (info.rare && !ownsSpecial(o, info.rare)) continue;
    const spot = x.spot === "crown" || x.spot === "arch" || x.spot === "branch" || x.spot === "ground" ? x.spot : "branch";
    if (info.sacred && !HIGH.has(spot)) return { error: "sacred_spot" };
    const n = (v: unknown, lo: number, hi: number, d: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d);
    items.push({ id: x.id!, x: n(x.x, 0, 1, 0.5), y: n(x.y, 0, 1, 0.5), s: n(x.s, 0.5, 1.6, 1), spot });
  }
  const prev = (await p.query<{ collected: string[] }>("SELECT collected FROM garden_decor WHERE user_id = $1", [userId])).rows[0]?.collected ?? [];
  const collected = Array.from(new Set([...prev, ...items.map((i) => i.id)])).filter((id) => idx.has(id));
  await p.query(
    `INSERT INTO garden_decor (user_id, items, collected) VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET items = EXCLUDED.items, collected = EXCLUDED.collected, updated_at = now()`,
    [userId, JSON.stringify(items), JSON.stringify(collected)]);
  const completed = await completedAlbums(collected);
  let reward = false;
  if (completed.length) {
    const c = await p.connect();
    try { reward = (await grant(c, userId, frameProduct(REWARD_FRAME), "reward", null, null)) === true; } finally { c.release(); }
  }
  return { items, collected, completed, reward };
}

/** packs whose every sticker has been placed at least once */
export async function completedAlbums(collected: string[]): Promise<string[]> {
  const have = new Set(collected);
  return (await allPacks()).filter((p) => { const st = packStickers(p); return st.length > 0 && st.every((s) => have.has(s.id)); }).map((p) => p.slug);
}

export async function decorOf(userId: number): Promise<{ items: Placed[]; collected: string[] }> {
  const p = pool();
  const r = p ? (await p.query<{ items: Placed[]; collected: string[] }>("SELECT items, collected FROM garden_decor WHERE user_id = $1", [userId])).rows[0] : undefined;
  return { items: r?.items ?? [], collected: r?.collected ?? [] };
}

// ---------- frame and showcase on the community profile ----------
export const FRAMES_ALL = [...FRAME_SLUGS, REWARD_FRAME];
export async function setFrame(userId: number, frame: unknown): Promise<string | null | { error: string }> {
  const p = pool();
  if (!p) return { error: "nodb" };
  if (frame !== null && (typeof frame !== "string" || !FRAMES_ALL.includes(frame))) return { error: "input" };
  if (frame && !(await ownedOf(userId)).products.includes(frameProduct(frame))) return { error: "not_owned" };
  await p.query("UPDATE community_profiles SET frame = $2 WHERE user_id = $1", [userId, frame]);
  return frame as string | null;
}
/** up to three owned rare stickers in the profile showcase ("Vitrine") */
export async function setShowcase(userId: number, raw: unknown): Promise<string[] | { error: string }> {
  const p = pool();
  if (!p) return { error: "nodb" };
  if (!Array.isArray(raw)) return { error: "input" };
  const o = await ownedOf(userId);
  const ids = Array.from(new Set(raw.filter((x): x is string => typeof x === "string"))).filter((slug) => ownsSpecial(o, slug)).slice(0, 3);
  await p.query("UPDATE community_profiles SET showcase = $2 WHERE user_id = $1", [userId, ids]);
  return ids;
}
/** what other members see next to a name: the frame and the first pinned rare sticker (a small mark) */
export const cosmeticsOf = (r: { frame?: string | null; showcase?: string[] | null }) => ({
  frame: r.frame && FRAMES_ALL.includes(r.frame) ? r.frame : null,
  rare: r.showcase?.[0] ?? null,
});

/** the pinned specials of a profile with their numbers (plate badge in the Vitrine) */
export async function showcaseOf(userId: number, slugs: string[] | null | undefined): Promise<{ slug: string; tier: string; number: number | null }[]> {
  const p = pool();
  const list = (slugs ?? []).slice(0, 3).map((slug) => SPECIALS.find((x) => x.slug === slug)).filter((x) => !!x);
  if (!p || !list.length) return [];
  const rows = (await p.query<{ product_id: string; edition: number | null }>("SELECT product_id, edition FROM iap_entitlements WHERE user_id = $1 AND revoked_at IS NULL AND product_id = ANY($2)",
    [userId, list.flatMap((x) => productsOfSpecial(x))])).rows;
  return list.filter((x) => productsOfSpecial(x).some((id) => rows.some((r) => r.product_id === id)))
    .map((x) => ({ slug: x.slug, tier: x.tier, number: rows.find((r) => productsOfSpecial(x).includes(r.product_id))?.edition ?? null }));
}
