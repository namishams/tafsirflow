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
