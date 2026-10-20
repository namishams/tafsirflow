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

export type AiCredits = { dua: number; proDuaLeft: number; assistantLeft: number | null };

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
  return purchaseConsumable(pack ? DUA_PACK_PRODUCT : DUA_PRODUCT);
}

/** the store price of one personal dua in the buyer's currency, 0,99 € until the store has answered */
export function useDuaPrice(): string {
  const [price, setPrice] = useState<string | null>(null);
  useEffect(() => { duaPrices().then((p) => setPrice(p.one)).catch(() => undefined); }, []);
  return price ?? "0,99 €";
}

/** store prices for the dua products (null when the store is not reachable; then show 0,99 € / 3,99 €) */
export async function duaPrices(): Promise<{ one: string | null; pack: string | null }> {
  const { loadPrices } = await import("./iap");
  const p = await loadPrices();
  return { one: p.dua, pack: p.duaPack };
}
