import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { router, type Href } from "expo-router";
import { useAuth } from "@/lib/auth";
import { refreshShop } from "@/lib/shop";
import { useCosmeticsText } from "./texts";

// Prices only from the store (null until it answered: then no price is shown) and one purchase helper for every
// store product. Purchases are bound to the account, so the person signs in first.
const cache: Record<string, string> = {};
export function useStorePrices(skus: string[]): Record<string, string> {
  const key = skus.slice().sort().join(",");
  const [prices, setPrices] = useState<Record<string, string>>(() => Object.fromEntries(skus.filter((s) => cache[s]).map((s) => [s, cache[s]])));
  useEffect(() => {
    if (Platform.OS === "web" || !skus.length) return;
    let on = true;
    void import("@/lib/iap").then((m) => m.loadStorePrices(skus)).then((p) => { Object.assign(cache, p); if (on) setPrices((x) => ({ ...x, ...p })); }).catch(() => undefined);
    return () => { on = false; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return prices;
}

export function useBuy() {
  const { user } = useAuth();
  const x = useCosmeticsText();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const buy = useCallback(async (sku: string): Promise<boolean> => {
    if (!user) { setMsg(x.signIn); router.push("/sign-in" as Href); return false; }
    if (busy) return false;
    setBusy(sku); setMsg(null);
    try {
      const { purchaseStoreProduct } = await import("@/lib/iap");
      const r = await purchaseStoreProduct(sku);
      if (r === "ok") { await refreshShop(); return true; }
      setMsg(r === "pending" ? x.pending : r === "unavailable" ? x.unavailable : r === "cancelled" ? null : x.failed);
      return false;
    } finally {
      setBusy(null);
    }
  }, [user, busy, x]);
  const restore = useCallback(async () => {
    if (!user) { router.push("/sign-in" as Href); return; }
    setBusy("restore"); setMsg(null);
    try {
      const { restore: run } = await import("@/lib/iap");
      const r = await run();
      await refreshShop();
      setMsg(r === "restored" ? x.restored : r === "none" ? x.restoreNone : x.unavailable);
    } finally { setBusy(null); }
  }, [user, x]);
  return { buy, restore, busy, msg, setMsg };
}
