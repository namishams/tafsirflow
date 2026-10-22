import { useCallback, useEffect } from "react";
import { api } from "./api";
import { readJSON, useStored, writeJSON } from "./store";

// The in-app store besides Pro (owner 22.10.2026): single courses, sticker packs (and the "all packs" bundle), rare
// stickers in numbered editions, profile frames. The catalogue and the sticker art come from the server
// (/api/app/store, website src/lib/store/catalog.ts), so new seasonal packs need no app update. What the account
// owns is confirmed by the server only (every purchase is verified there); this file keeps the last answer on the
// device so screens open instantly. Prices only ever come from the App Store (lib/iap.ts).
export const APP_ID = "com.quranmasterclass.app";
export type CourseSlug = "arabic" | "islam" | "prophet-stories" | "halal-haram" | "exams";
/** App Store product ids allow no "-": slugs use "_" there (same rule as the server, src/lib/store/catalog.ts) */
const pid = (slug: string) => slug.replace(/-/g, "_");
export const courseProduct = (slug: CourseSlug) => `${APP_ID}.course.${pid(slug)}`;
export const frameProduct = (slug: string) => `${APP_ID}.frame.${pid(slug)}`;
export const isStoreProduct = (id: string) => /^com\.quranmasterclass\.app\.(course|stickers|frame|rare|unique|gift)\./.test(id);
export const isGiftProduct = (id: string) => id.startsWith(`${APP_ID}.gift.`);

/** which purchasable course a course id of the app belongs to (null: core path or not sold singly) */
export function courseSlugOf(course: string): CourseSlug | null {
  if (course === "arabic-lang" || course === "arabicLanguage") return "arabic";
  if (course === "seerah" || course === "prophets" || course === "prophet-stories") return "prophet-stories";
  if (course === "halal-haram") return "halal-haram";
  if (course === "qbank" || course === "exams") return "exams";
  if (["academy", "ulum", "hadithSci", "aqidah", "fiqh", "akhlaq", "adhkar", "names", "ramadan", "hajj", "tajweedDeep", "abrahamic", "haramain"].includes(course)) return "islam";
  return null;
}

export type ShopSticker = { id: string; ar: string; sacred: boolean; svg: string; glow?: boolean };
export type ShopPack = {
  slug: string; title: Record<string, string>; season: string | null; tradition: "shia" | null; featured?: "sister" | null; rotation: boolean;
  product: string; gift: string; stickers: ShopSticker[];
};
/** special stickers: rare (numbered, founder numbers 1-10 as their own product), unique (one of one), earned (never sold) */
export type ShopRare = { slug: string; tier: "rare" | "unique" | "earned"; title: Record<string, string>; edition: number | null; product: string; founder: string | null; sticker: ShopSticker };
export type EditionState = { left: number; next: number | null; founderLeft: number; founderNext: number | null; owner: string | null; reservedByOther: boolean };
export type Placed = { id: string; x: number; y: number; s: number; spot: "crown" | "arch" | "ground" | "branch" };
export type ShopMe = {
  pro: boolean; owned: string[]; editions: Record<string, number>; proMonthTaken: boolean;
  decor: { items: Placed[]; collected: string[] }; gifts: { id: string; pack: string }[]; frame: string | null; showcase: string[]; showCollection?: boolean;
};
export type Shop = {
  freeLevels: number; proPack: string | null; bundle: string;
  courses: { slug: CourseSlug; product: string }[];
  frames: { slug: string; product: string; reward: boolean }[];
  packs: ShopPack[]; rare: ShopRare[]; editionsLeft: Record<string, EditionState>;
  me: ShopMe | null;
};

const KEY = "qmc.shop.v1";
export const readShop = () => readJSON<Shop | null>(KEY, null);

let loading: Promise<Shop | null> | null = null;
/** load the catalogue and what the account owns (keeps the last answer when offline) */
export function refreshShop(): Promise<Shop | null> {
  loading ??= api<Shop>("/api/app/store")
    .then((s) => { writeJSON(KEY, s, true); return s; })
    .catch(() => readShop())
    .finally(() => { loading = null; });
  return loading;
}

export function useShop(): { shop: Shop | null; refresh: () => Promise<Shop | null> } {
  const shop = useStored<Shop | null>(KEY, null);
  useEffect(() => { void refreshShop(); }, []);
  return { shop, refresh: useCallback(() => refreshShop(), []) };
}

// ---------- ownership ----------
export const owns = (s: Shop | null, product: string) => !!s?.me?.owned.includes(product);
export const ownsCourse = (s: Shop | null, slug: CourseSlug | null) => !!slug && owns(s, courseProduct(slug));
export const ownsPack = (s: Shop | null, p: Pick<ShopPack, "product">) => owns(s, p.product) || (!!s && owns(s, s.bundle));
export const ownsRare = (s: Shop | null, r: Pick<ShopRare, "product" | "founder">) => owns(s, r.product) || (!!r.founder && owns(s, r.founder));
/** the number the account holds of a numbered sticker (founder or regular), null for none */
export const numberOf = (s: Shop | null, r: Pick<ShopRare, "product" | "founder">) => s?.me?.editions[r.product] ?? (r.founder ? s?.me?.editions[r.founder] : undefined) ?? null;
export const ownsFrame = (s: Shop | null, slug: string) => owns(s, frameProduct(slug));
/** true when the signed-in account owns the course singly (Pro is checked separately) */
export const ownsCourseNow = (course: string) => ownsCourse(readShop(), courseSlugOf(course));

/** every sticker the account may place (owned packs and rare stickers) */
export function ownedStickers(s: Shop | null): (ShopSticker & { pack: string | null; rare: boolean })[] {
  if (!s) return [];
  return [
    ...s.packs.filter((p) => ownsPack(s, p)).flatMap((p) => p.stickers.map((x) => ({ ...x, pack: p.slug, rare: false }))),
    ...s.rare.filter((r) => ownsRare(s, r)).map((r) => ({ ...r.sticker, pack: null, rare: true })),
  ];
}
export function stickerById(s: Shop | null, id: string): (ShopSticker & { rare: boolean }) | null {
  if (!s) return null;
  for (const p of s.packs) { const x = p.stickers.find((y) => y.id === id); if (x) return { ...x, rare: false }; }
  const r = s.rare.find((y) => y.sticker.id === id);
  return r ? { ...r.sticker, rare: true } : null;
}
export const rareBySlug = (s: Shop | null, slug: string) => s?.rare.find((r) => r.slug === slug) ?? null;

/** album progress: how many stickers of each owned pack have been placed at least once */
export function albumProgress(s: Shop | null): { done: number; total: number; albums: number; complete: number } {
  if (!s?.me) return { done: 0, total: 0, albums: 0, complete: 0 };
  const have = new Set(s.me.decor.collected);
  const packs = s.packs.filter((p) => ownsPack(s, p));
  let done = 0, total = 0, complete = 0;
  for (const p of packs) {
    const n = p.stickers.filter((x) => have.has(x.id)).length;
    done += n; total += p.stickers.length; if (n === p.stickers.length) complete++;
  }
  return { done, total, albums: packs.length, complete };
}

// ---------- writes ----------
export async function saveDecor(items: Placed[]): Promise<{ completed: string[]; reward: boolean } | { error: string }> {
  const s = readShop();
  if (s?.me) writeJSON(KEY, { ...s, me: { ...s.me, decor: { items, collected: Array.from(new Set([...s.me.decor.collected, ...items.map((i) => i.id)])) } } }, true);
  try {
    const r = await api<{ completed: string[]; reward: boolean }>("/api/app/store/decor", { method: "PUT", body: { items } });
    void refreshShop();
    return r;
  } catch (e) {
    return { error: (e as { code?: string }).code ?? "failed" };
  }
}
export async function setFrame(frame: string | null) {
  await api("/api/app/store/profile", { body: { frame } });
  await refreshShop();
}
export async function setShowcase(slugs: string[]) {
  await api("/api/app/store/profile", { body: { showcase: slugs.slice(0, 3) } });
  await refreshShop();
}
/** hold a one-of-one before the App Store sheet opens: null when reserved for this account, else the reason */
export async function reserveUnique(product: string): Promise<string | null> {
  try { await api("/api/app/store/reserve", { body: { product } }); return null; } catch (e) { return (e as { code?: string }).code ?? "failed"; }
}
export async function setBoardOptIn(show: boolean) {
  await api("/api/app/store/board", { body: { show } });
  await refreshShop();
}
export async function takeProPack(): Promise<boolean> {
  try { await api("/api/app/store/pro-pack", { method: "POST", body: {} }); await refreshShop(); return true; } catch { return false; }
}
export async function sendGift(gift: string, username: string, note: string): Promise<string | null> {
  try { await api("/api/app/store/gift", { body: { gift, username, note } }); await refreshShop(); return null; } catch (e) { return (e as { code?: string }).code ?? "failed"; }
}

/** the pack title in the app's language (the server has en/de/ar; the app's own texts cover all 14 for built-in packs) */
export const titleOf = (t: Record<string, string>, lang: string) => t[lang] ?? t.en ?? "";
