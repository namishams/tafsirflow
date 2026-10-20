import { Platform } from "react-native";
import {
  deepLinkToSubscriptions, fetchProducts, finishTransaction, getAvailablePurchases, initConnection, isUserCancelledError,
  purchaseErrorListener, purchaseUpdatedListener, requestPurchase, restorePurchases, type Purchase,
} from "expo-iap";
import { api } from "./api";
import { PRO_PRODUCT } from "./pro";
import { DUA_PACK_PRODUCT, DUA_PRODUCT, DUA_PRODUCTS } from "./purchases";
import { writeJSON } from "./store";

// Store purchases (StoreKit 2 on iOS, Google Play Billing on Android). Every purchase is checked by our server
// (signature against Apple's root certificate) and bound to the signed-in account, so Pro and dua credits work on
// every device; a transaction is only finished after the server confirmed it, so nothing gets lost offline.
export type BuyResult = "ok" | "cancelled" | "pending" | "failed" | "unavailable";

let connection: Promise<boolean> | null = null;
function connect(): Promise<boolean> {
  connection ??= initConnection().then(() => true).catch(() => { connection = null; return false; });
  return connection;
}

export type StorePrices = { pro: string | null; dua: string | null; duaPack: string | null };
export async function loadPrices(): Promise<StorePrices> {
  if (!(await connect())) return { pro: null, dua: null, duaPack: null };
  const out: StorePrices = { pro: null, dua: null, duaPack: null };
  try {
    const subs = (await fetchProducts({ skus: [PRO_PRODUCT], type: "subs" })) ?? [];
    out.pro = (subs as { id: string; displayPrice: string }[]).find((p) => p.id === PRO_PRODUCT)?.displayPrice ?? null;
  } catch { /* store not reachable */ }
  try {
    const items = ((await fetchProducts({ skus: [DUA_PRODUCT, DUA_PACK_PRODUCT], type: "in-app" })) ?? []) as { id: string; displayPrice: string }[];
    out.dua = items.find((p) => p.id === DUA_PRODUCT)?.displayPrice ?? null;
    out.duaPack = items.find((p) => p.id === DUA_PACK_PRODUCT)?.displayPrice ?? null;
  } catch { /* store not reachable */ }
  return out;
}

type Verified = { ok: boolean; pro?: boolean; until?: number | null; dua?: number };
/** send the signed transaction to the server; returns what the account has now */
async function verify(p: Purchase): Promise<Verified> {
  const token = p.purchaseToken;
  if (!token) return { ok: false };
  try {
    const path = Platform.OS === "ios" ? "/api/iap/apple" : "/api/iap/google";
    const d = await api<{ premium?: boolean; until?: number | null; dua?: number }>(path, { body: Platform.OS === "ios" ? { jws: token } : { token, productId: p.productId } });
    if (d.premium && d.until) writeJSON("qmc.pro", { until: d.until, source: Platform.OS === "ios" ? "apple" : "google" }, true);
    return { ok: true, pro: !!d.premium, until: d.until ?? null, dua: d.dua };
  } catch {
    return { ok: false };
  }
}

/** one purchase: wait for the store's answer, let the server confirm, then finish the transaction */
async function buy(sku: string, type: "subs" | "in-app"): Promise<BuyResult> {
  if (!(await connect())) return "unavailable";
  return new Promise<BuyResult>((resolve) => {
    let done = false;
    const finish = (r: BuyResult) => { if (done) return; done = true; up.remove(); err.remove(); resolve(r); };
    const up = purchaseUpdatedListener(async (p) => {
      if (p.productId !== sku) return;
      if (p.purchaseState === "pending") { finish("pending"); return; }
      const v = await verify(p);
      if (!v.ok) { finish("failed"); return; } // stays unfinished: retried on the next launch (observeTransactions)
      await finishTransaction({ purchase: p, isConsumable: type === "in-app" }).catch(() => undefined);
      finish("ok");
    });
    const err = purchaseErrorListener((e) => finish(isUserCancelledError(e) ? "cancelled" : "failed"));
    const request = type === "subs"
      ? { request: { apple: { sku }, google: { skus: [sku] } }, type: "subs" as const }
      : { request: { apple: { sku }, google: { skus: [sku] } }, type: "in-app" as const };
    requestPurchase(request).catch((e: unknown) => finish(isUserCancelledError(e as never) ? "cancelled" : "failed"));
  });
}

export const purchasePro = () => buy(PRO_PRODUCT, "subs");
export async function purchaseConsumable(sku: string): Promise<boolean> {
  return (await buy(sku, "in-app")) === "ok";
}

/** "Restore purchases": ask the store, let the server confirm each active one */
export async function restore(): Promise<"restored" | "none" | "failed"> {
  if (!(await connect())) return "failed";
  try {
    await restorePurchases().catch(() => undefined);
    const list = (await getAvailablePurchases()) ?? [];
    let any = false;
    for (const p of list) {
      if (p.productId !== PRO_PRODUCT) continue;
      const v = await verify(p);
      if (v.ok && v.pro) any = true;
    }
    return any ? "restored" : "none";
  } catch {
    return "failed";
  }
}

/** transactions the store still holds (bought offline, app closed during the purchase): confirm them now */
export async function settlePending(): Promise<void> {
  if (!(await connect())) return;
  try {
    const list = (await getAvailablePurchases()) ?? [];
    for (const p of list) {
      if (!(p.productId in DUA_PRODUCTS) && p.productId !== PRO_PRODUCT) continue;
      const v = await verify(p);
      if (v.ok && p.productId in DUA_PRODUCTS) await finishTransaction({ purchase: p, isConsumable: true }).catch(() => undefined);
    }
  } catch { /* try again next launch */ }
}

export function manageSubscriptions() {
  deepLinkToSubscriptions({ skuAndroid: PRO_PRODUCT, packageNameAndroid: "com.quranmasterclass.app" }).catch(() => undefined);
}
