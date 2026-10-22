import { intlLocale } from "@/i18n";
import type { IntroOffer, ProPlan } from "@/lib/iap";
import { fmt, usePlanT } from "./texts";

// The wording of a Pro plan exactly as the store sells it (App Review 3.1.2): the period, an intro offer only when the
// store reports one for this buyer, and the renewal line. Shared by the Pro sheet (app/pro.tsx) and the day-1 paywall,
// so both always say the same about the same plan. Prices and offers come only from the store, never from here.
type PlanStrings = ReturnType<typeof usePlanT>;

/** "7 days", "1 month" … in the interface language (plain number + unit when Intl has no unit formatting) */
export function offerDuration(o: IntroOffer, lang: string): string {
  try { return new Intl.NumberFormat(intlLocale(lang), { style: "unit", unit: o.unit, unitDisplay: "long" }).format(o.count); }
  catch { return `${o.count} ${o.unit}`; }
}

/** "per month" / "per year" */
export const planPer = (p: PlanStrings, x: ProPlan) => (x.period === "year" ? p.perYear : p.perMonth);

/** "7 days free, then US$9.99 per month" / "0,99 € for 1 month, then …"; null without an intro offer */
export function planIntro(p: PlanStrings, x: ProPlan, lang: string): string | null {
  if (!x.intro) return null;
  return x.intro.mode === "free-trial"
    ? fmt(p.introFree, { duration: offerDuration(x.intro, lang), price: x.price, per: planPer(p, x) })
    : fmt(p.introPaid, { intro: x.intro.price, duration: offerDuration(x.intro, lang), price: x.price, per: planPer(p, x) });
}

/** the auto-renewal terms next to the buy button */
export const planRenew = (p: PlanStrings, x: ProPlan, store: string) => fmt(p.renew, { price: x.price, per: planPer(p, x), store });

/** how much the yearly plan saves against twelve monthly payments, computed only from the store's own amounts
 *  (same currency, same buyer); null when the store did not report both amounts or there is no real saving */
export function yearlySavePct(plans: readonly ProPlan[] | null | undefined): number | null {
  const m = plans?.find((x) => x.period === "month")?.amount;
  const y = plans?.find((x) => x.period === "year")?.amount;
  if (!m || !y || m <= 0 || y <= 0) return null;
  const pct = Math.floor((1 - y / (m * 12)) * 100);
  return pct >= 1 && pct < 100 ? pct : null;
}

const SAVE: Record<string, string> = {
  de: "Spare {pct} %", en: "Save {pct}%", ar: "وفّر {pct}٪", tr: "%{pct} tasarruf", ur: "{pct}% بچت", fa: "{pct}٪ صرفه‌جویی",
  ps: "{pct}٪ سپما", fr: "Économisez {pct} %", es: "Ahorre un {pct} %", id: "Hemat {pct}%", ms: "Jimat {pct}%",
  bn: "{pct}% সাশ্রয়", ru: "Экономия {pct}%", zh: "节省 {pct}%",
};
/** "Save 17%" in the interface language */
export const saveText = (lang: string, pct: number) => (SAVE[lang] ?? SAVE.en).replace("{pct}", String(pct));

const YEARLY_LINE: Record<string, string> = {
  de: "oder {price} pro Jahr", en: "or {price} per year", ar: "أو {price} سنويًا", tr: "veya yıllık {price}", ur: "یا {price} سالانہ",
  fa: "یا {price} در سال", ps: "یا {price} په کال کې", fr: "ou {price} par an", es: "o {price} al año", id: "atau {price} per tahun",
  ms: "atau {price} setahun", bn: "অথবা বছরে {price}", ru: "или {price} в год", zh: "或每年 {price}",
};
/** "or US$99.99 per year" for short offer cards */
export const yearlyLine = (lang: string, price: string) => (YEARLY_LINE[lang] ?? YEARLY_LINE.en).replace("{price}", price);
