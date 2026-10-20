import { Platform } from "react-native";
import {
  deepLinkToSubscriptions, fetchProducts, finishTransaction, getAvailablePurchases, initConnection, isUserCancelledError,
  purchaseErrorListener, purchaseUpdatedListener, requestPurchase, restorePurchases, type Purchase,
} from "expo-iap";
import { api } from "./api";
import { PRO_PRODUCT } from "./pro";
import { DUA_PACK_PRODUCT, DUA_PRODUCT, DUA_PRODUCTS, NAMES_PRODUCT } from "./purchases";
import { writeJSON } from "./store";
import { getToken } from "./storage";

// Store purchases (StoreKit 2 on iOS, Google Play Billing on Android). Every purchase is checked by our server
// (signature against Apple's root certificate) and bound to the signed-in account, so Pro and dua credits work on
// every device; a transaction is only finished after the server confirmed it, so nothing gets lost offline.
export type BuyResult = "ok" | "cancelled" | "pending" | "failed" | "unavailable";

let connection: Promise<boolean> | null = null;
function connect(): Promise<boolean> {
  connection ??= initConnection().then(() => true).catch(() => { connection = null; return false; });
  return connection;
}

export type StorePrices = { pro: string | null; dua: string | null; duaPack: string | null; names: string | null };
export async function loadPrices(): Promise<StorePrices> {
  if (!(await connect())) return { pro: null, dua: null, duaPack: null, names: null };
  const out: StorePrices = { pro: null, dua: null, duaPack: null, names: null };
  try {
    const subs = (await fetchProducts({ skus: [PRO_PRODUCT], type: "subs" })) ?? [];
    out.pro = (subs as { id: string; displayPrice: string }[]).find((p) => p.id === PRO_PRODUCT)?.displayPrice ?? null;
  } catch { /* store not reachable */ }
  try {
    const items = ((await fetchProducts({ skus: [DUA_PRODUCT, DUA_PACK_PRODUCT, NAMES_PRODUCT], type: "in-app" })) ?? []) as { id: string; displayPrice: string }[];
    out.dua = items.find((p) => p.id === DUA_PRODUCT)?.displayPrice ?? null;
    out.duaPack = items.find((p) => p.id === DUA_PACK_PRODUCT)?.displayPrice ?? null;
    out.names = items.find((p) => p.id === NAMES_PRODUCT)?.displayPrice ?? null;
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

/** consumables: personal duas and personal name reports */
const isConsumable = (sku: string) => sku in DUA_PRODUCTS || sku === NAMES_PRODUCT;
const isOurs = (sku: string) => isConsumable(sku) || sku === PRO_PRODUCT;
/** verify one store transaction with the server and finish it only then (finishing acknowledges it on Android, so
 *  Google does not refund it after three days; a dua credit is booked once per transaction by the server) */
async function settle(p: Purchase): Promise<boolean> {
  if (!isOurs(p.productId) || p.purchaseState === "pending") return false;
  const v = await verify(p);
  if (!v.ok) return false; // stays unfinished: the store hands it over again (next launch / foreground)
  await finishTransaction({ purchase: p, isConsumable: isConsumable(p.productId) }).catch(() => undefined);
  return true;
}

// products a buy() call is waiting for: its own listener settles them, the app-wide one leaves them alone
const buying = new Set<string>();

/** one purchase: wait for the store's answer, let the server confirm, then finish the transaction */
async function buy(sku: string, type: "subs" | "in-app"): Promise<BuyResult> {
  if (!(await connect())) return "unavailable";
  buying.add(sku);
  return new Promise<BuyResult>((resolve) => {
    let done = false;
    const finish = (r: BuyResult) => { if (done) return; done = true; buying.delete(sku); up.remove(); err.remove(); resolve(r); };
    const up = purchaseUpdatedListener(async (p) => {
      if (p.productId !== sku) return;
      if (p.purchaseState === "pending") { finish("pending"); return; } // approved later: the app-wide listener settles it
      // not confirmed: stays unfinished and is retried by settlePending (launch / foreground)
      finish((await settle(p)) ? "ok" : "failed");
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

/** transactions the store still holds (bought offline, app closed during the purchase, not yet acknowledged):
 *  confirm them with the server and finish them now. Called at app start, on sign-in and when the app returns to
 *  the foreground (ProProvider). */
let settling: Promise<void> | null = null;
export function settlePending(): Promise<void> {
  settling ??= (async () => {
    if (!(await connect())) return;
    try {
      if (!(await getToken())) return; // bound to the account: wait until someone is signed in
      const list = ((await getAvailablePurchases()) ?? []).filter((p) => isOurs(p.productId) && !buying.has(p.productId));
      for (const p of list) if (isConsumable(p.productId)) await settle(p);
      // Pro: the newest transaction carries the latest expiry; older renewals only need finishing once it is confirmed
      const pro = list.filter((p) => p.productId === PRO_PRODUCT).sort((a, b) => (b.transactionDate ?? 0) - (a.transactionDate ?? 0));
      if (pro[0] && (await settle(pro[0]))) for (const p of pro.slice(1)) await finishTransaction({ purchase: p, isConsumable: false }).catch(() => undefined);
    } catch { /* try again next time */ }
  })().finally(() => { settling = null; });
  return settling;
}

/** app-wide listener for transactions that arrive outside a buy() call (Ask to Buy / pending payments approved
 *  later, purchases interrupted by an app restart, promoted purchases, renewals): installed once */
let observing = false;
export async function observePurchases(): Promise<void> {
  if (observing || !(await connect())) return;
  observing = true;
  purchaseUpdatedListener((p) => { if (!buying.has(p.productId)) void settle(p); });
}

export function manageSubscriptions() {
  deepLinkToSubscriptions({ skuAndroid: PRO_PRODUCT, packageNameAndroid: "com.quranmasterclass.app" }).catch(() => undefined);
}
