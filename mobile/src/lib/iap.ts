import { Platform } from "react-native";
import {
  deepLinkToSubscriptions, fetchProducts, isEligibleForIntroOfferIOS, finishTransaction, getAvailablePurchases, initConnection, isUserCancelledError,
  purchaseErrorListener, purchaseUpdatedListener, requestPurchase, restorePurchases, type Purchase,
} from "expo-iap";
import { api } from "./api";
import { PRO_PRODUCT } from "./pro";
import { DUA_PACK_PRODUCT, DUA_PRODUCT, DUA_PRODUCTS, NAMES_PRODUCT, PRO_YEARLY_SKU } from "./purchases";
import { writeJSON } from "./store";
import { getToken } from "./storage";

// Store purchases (StoreKit 2 on iOS, Google Play Billing on Android). Every purchase is checked by our server
// (signature against Apple's root certificate) and bound to the signed-in account, so Pro and dua credits work on
// every device; a transaction is only finished after the server confirmed it, so nothing gets lost offline.
/** "unconfirmed": the store took the payment but the server has not confirmed it yet; the transaction stays open and is
 *  credited automatically when settlePending runs again (launch, foreground, sign-in) */
export type BuyResult = "ok" | "cancelled" | "pending" | "failed" | "unavailable" | "unconfirmed";

let connection: Promise<boolean> | null = null;
function connect(): Promise<boolean> {
  connection ??= initConnection().then(() => true).catch(() => { connection = null; return false; });
  return connection;
}

/** every Pro subscription product (monthly, and yearly once PRO_YEARLY_SKU is set) */
export const PRO_SKUS: string[] = PRO_YEARLY_SKU ? [PRO_PRODUCT, PRO_YEARLY_SKU] : [PRO_PRODUCT];
const isPro = (sku: string) => PRO_SKUS.includes(sku);

/** an introductory offer exactly as the store reports it (only shown when the store has one for this buyer) */
export type IntroOffer = { mode: "free-trial" | "pay-as-you-go" | "pay-up-front"; price: string; unit: "day" | "week" | "month" | "year"; count: number };
export type ProPlan = { sku: string; period: "month" | "year"; price: string; amount: number | null; intro: IntroOffer | null };

type SubProduct = {
  id: string; displayPrice: string; price?: number | null; subscriptionGroupIdIOS?: string | null;
  subscriptionOffers?: { type: string; paymentMode?: string | null; displayPrice: string; period?: { unit: string; value: number } | null; periodCount?: number | null;
    pricingPhasesAndroid?: { pricingPhaseList?: { formattedPrice: string; priceAmountMicros: string; billingPeriod: string; billingCycleCount: number }[] } | null }[] | null;
};
const UNITS = ["day", "week", "month", "year"] as const;
function introOf(p: SubProduct): IntroOffer | null {
  const o = (p.subscriptionOffers ?? []).find((x) => x.type === "introductory");
  if (!o) return null;
  const mode = o.paymentMode === "free-trial" || o.paymentMode === "pay-as-you-go" || o.paymentMode === "pay-up-front" ? o.paymentMode : null;
  const unit = UNITS.find((u) => u === o.period?.unit);
  if (!mode || !unit) return null;
  const count = Math.max(1, (o.period?.value ?? 1) * (mode === "pay-as-you-go" ? o.periodCount ?? 1 : 1));
  return { mode, price: o.displayPrice, unit, count };
}

/** the Pro plans the store sells to this buyer, in the buyer's currency; an intro offer only when the store has one
 *  and (iOS) the account is still eligible for it. Empty when the store is not reachable: then no price is shown. */
export async function loadProPlans(): Promise<ProPlan[]> {
  if (!(await connect())) return [];
  try {
    const subs = ((await fetchProducts({ skus: PRO_SKUS, type: "subs" })) ?? []) as unknown as SubProduct[];
    const out: ProPlan[] = [];
    for (const sku of PRO_SKUS) {
      const p = subs.find((x) => x.id === sku);
      if (!p) continue;
      let intro = introOf(p);
      if (intro && Platform.OS === "ios" && p.subscriptionGroupIdIOS) {
        const ok = await isEligibleForIntroOfferIOS(p.subscriptionGroupIdIOS).catch(() => false);
        if (!ok) intro = null;
      }
      out.push({ sku, period: sku === PRO_YEARLY_SKU ? "year" : "month", price: p.displayPrice, amount: typeof p.price === "number" ? p.price : null, intro });
    }
    return out;
  } catch {
    return [];
  }
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

type Verified = { ok: boolean; pro?: boolean; until?: number | null; dua?: number; guest?: boolean };
/** send the signed transaction to the server; returns what the account has now */
async function verify(p: Purchase): Promise<Verified> {
  const token = p.purchaseToken;
  if (!token) return { ok: false };
  // Pro without an account (iOS, App Review 5.1.1): the server only checks Apple's signature and expiry and Pro is
  // active on this device; after signing in, settlePending binds the same transaction to the account.
  if (Platform.OS === "ios" && isPro(p.productId) && !(await getToken())) {
    try {
      const d = await api<{ premium?: boolean; until?: number | null }>("/api/iap/apple/check", { body: { jws: token } });
      if (d.premium && d.until) writeJSON("qmc.pro", { until: d.until, source: "apple" }, true);
      return { ok: true, pro: !!d.premium, until: d.until ?? null, guest: true };
    } catch {
      return { ok: false };
    }
  }
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
const isOurs = (sku: string) => isConsumable(sku) || isPro(sku);
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
      finish((await settle(p)) ? "ok" : "unconfirmed");
    });
    const err = purchaseErrorListener((e) => finish(isUserCancelledError(e) ? "cancelled" : "failed"));
    const request = type === "subs"
      ? { request: { apple: { sku }, google: { skus: [sku] } }, type: "subs" as const }
      : { request: { apple: { sku }, google: { skus: [sku] } }, type: "in-app" as const };
    requestPurchase(request).catch((e: unknown) => finish(isUserCancelledError(e as never) ? "cancelled" : "failed"));
  });
}

/** buy Pro: the monthly plan, or another Pro plan of PRO_SKUS (yearly) */
export const purchasePro = async (sku: string = PRO_PRODUCT): Promise<BuyResult> => { const r = await buy(isPro(sku) ? sku : PRO_PRODUCT, "subs"); return r === "unconfirmed" ? "failed" : r; };
export async function purchaseConsumable(sku: string): Promise<boolean> {
  return (await buy(sku, "in-app")) === "ok";
}
/** the same purchase with the full result (pending, paid but not yet confirmed, cancelled …) */
export const purchaseConsumableResult = (sku: string): Promise<BuyResult> => buy(sku, "in-app");

/** "Restore purchases": ask the store, let the server confirm each active one */
export async function restore(): Promise<"restored" | "none" | "failed"> {
  if (!(await connect())) return "failed";
  try {
    await restorePurchases().catch(() => undefined);
    const list = (await getAvailablePurchases()) ?? [];
    let any = false;
    for (const p of list) {
      if (!isPro(p.productId)) continue;
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
      if (!(await getToken())) {
        // without an account only Pro on iOS: refresh this device's entitlement from the newest transaction (renewals)
        if (Platform.OS === "ios") {
          const pro = ((await getAvailablePurchases()) ?? []).filter((p) => isPro(p.productId)).sort((a, b) => (b.transactionDate ?? 0) - (a.transactionDate ?? 0));
          if (pro[0]) await verify(pro[0]);
        }
        return; // everything else is bound to the account: wait until someone is signed in
      }
      const list = ((await getAvailablePurchases()) ?? []).filter((p) => isOurs(p.productId) && !buying.has(p.productId));
      for (const p of list) if (isConsumable(p.productId)) await settle(p);
      // Pro: the newest transaction carries the latest expiry; older renewals only need finishing once it is confirmed
      const pro = list.filter((p) => isPro(p.productId)).sort((a, b) => (b.transactionDate ?? 0) - (a.transactionDate ?? 0));
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
