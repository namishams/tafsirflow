import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { useAuth } from "./auth";

// AI features cost money per request, so in the app they are paid: a personal dua written with AI is a single
// purchase (consumable, 0,99 €) that the server turns into one credit on the account; Pro includes a few per month.
// The AI assistant is part of Pro (daily limit set on the server). The purchase flow itself lives in lib/iap.ts.
export const DUA_PRODUCT = "com.quranmasterclass.app.dua";
/** five personal duas at a lower price per dua */
export const DUA_PACK_PRODUCT = "com.quranmasterclass.app.dua5";
export const DUA_PRODUCTS: Record<string, number> = { [DUA_PRODUCT]: 1, [DUA_PACK_PRODUCT]: 5 };
export const PRO_DUAS_PER_MONTH = 5;
/** a personal name report of the baby-name finder (consumable, 0,99 €; not part of Pro) */
export const NAMES_PRODUCT = "com.quranmasterclass.app.names";

/** Pro yearly subscription (same subscription group as the monthly one in App Store Connect).
 *  TODO: create "com.quranmasterclass.app.pro.yearly" in App Store Connect / Google Play, let the server accept it
 *  (website src/lib/appleIap.ts PRO_SUBSCRIPTION, /api/iap/apple + notifications, /api/iap/google), then set it here.
 *  While null the paywalls show the monthly plan only. */
export const PRO_YEARLY_SKU: string | null = null;

export type AiCredits = { dua: number; proDuaLeft: number; assistantLeft: number | null; names?: number };

/** credits of the signed-in account (null while loading or signed out) */
export function useAiCredits(): { credits: AiCredits | null; refresh: () => Promise<void> } {
  const { user } = useAuth();
  const [credits, setCredits] = useState<AiCredits | null>(null);
  const refresh = useCallback(async () => {
    if (!user) { setCredits(null); return; }
    try { setCredits(await api<AiCredits>("/api/app/credits")); } catch { setCredits(null); }
  }, [user]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { credits, refresh };
}

/** buy personal duas (one, or the pack of five); resolves true when the server has added the credits */
export async function buyPersonalDua(pack = false): Promise<boolean> {
  const { purchaseConsumable } = await import("./iap");
  return credited(await purchaseConsumable(pack ? DUA_PACK_PRODUCT : DUA_PRODUCT));
}
/** a completed consumable purchase counts for the last tapped feed offer (30 minutes, see feed/monetize.tsx) */
async function credited(ok: boolean): Promise<boolean> {
  if (ok) await import("@/features/feed/monetize").then((m) => m.creditOfferPurchase()).catch(() => undefined);
  return ok;
}

// Every price shown in the app is Apple's, in the buyer's own currency (Hamburg 4,99 €, Dubai AED 14.99). Until the
// App Store has answered, or without a connection, no price is shown at all – never a fixed euro amount.
let pricesOnce: Promise<import("./iap").StorePrices> | null = null;
function storePrices() {
  pricesOnce ??= import("./iap").then(({ loadPrices }) => loadPrices()).then((p) => { if (!p.pro && !p.dua) pricesOnce = null; return p; });
  return pricesOnce;
}
function useStorePrice(pick: (p: import("./iap").StorePrices) => string | null): string | null {
  const [price, setPrice] = useState<string | null>(null);
  useEffect(() => { storePrices().then((p) => setPrice(pick(p))).catch(() => undefined); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return price;
}
/** "Get Pro · AED 14.99 per month" when the price is known, else only the label */
export const withPrice = (label: string, price: string | null) => (price ? `${label} · ${price}` : label);

export const useProPrice = () => useStorePrice((p) => p.pro);
/** the store price of one personal dua in the buyer's currency (null until the store has answered) */
export const useDuaPrice = () => useStorePrice((p) => p.dua);

/** store prices for the dua products (null when the store is not reachable; then no price is shown) */
export async function duaPrices(): Promise<{ one: string | null; pack: string | null }> {
  const p = await storePrices();
  return { one: p.dua, pack: p.duaPack };
}

/** buy one personal name report; resolves true when the server has added the credit */
export async function buyNameReport(): Promise<boolean> {
  const { purchaseConsumable } = await import("./iap");
  return credited(await purchaseConsumable(NAMES_PRODUCT));
}

/** the store price of one name report in the buyer's currency (null until the store has answered) */
export const useNamesPrice = () => useStorePrice((p) => p.names);
