import en from "./i18n/en.json";
import { COMPANY } from "../company";

// Texts of the Blueprint Shams 4.0 pages (/blueprint, /blueprint/studio|live|academy, /partners) and of the links to
// them (footer, /about, /support). English is the base; every other locale is a full translation in i18n/<locale>.json,
// merged over English so a missing key never shows a raw key. Server only (the partner form gets its texts as props).
// Polite address in every language (German "Sie"). Placeholders: {n}, {a}, {b}, {company}, {founder}.

export type BpText = typeof en;

const LOAD: Record<string, () => Promise<{ default: unknown }>> = {
  de: () => import("./i18n/de.json"),
  ar: () => import("./i18n/ar.json"),
  tr: () => import("./i18n/tr.json"),
  ur: () => import("./i18n/ur.json"),
  fa: () => import("./i18n/fa.json"),
  ps: () => import("./i18n/ps.json"),
  fr: () => import("./i18n/fr.json"),
  es: () => import("./i18n/es.json"),
  id: () => import("./i18n/id.json"),
  ms: () => import("./i18n/ms.json"),
  bn: () => import("./i18n/bn.json"),
  ru: () => import("./i18n/ru.json"),
  zh: () => import("./i18n/zh.json"),
};

type Json = unknown;
function merge(base: Json, over: Json): Json {
  if (Array.isArray(base)) return Array.isArray(over) && over.length === base.length ? base.map((b, i) => merge(b, over[i])) : base;
  if (base && typeof base === "object") {
    const o = (over && typeof over === "object" && !Array.isArray(over) ? over : {}) as Record<string, Json>;
    return Object.fromEntries(Object.entries(base as Record<string, Json>).map(([k, v]) => [k, merge(v, o[k])]));
  }
  return typeof over === typeof base && over !== "" ? over : base;
}

const cache = new Map<string, Promise<BpText>>();
/** all Blueprint texts in one language (English where a translation is missing) */
export function bpText(locale: string): Promise<BpText> {
  let p = cache.get(locale);
  if (!p) {
    const load = LOAD[locale];
    p = load ? load().then((m) => merge(en, m.default) as BpText).catch(() => en) : Promise.resolve(en);
    cache.set(locale, p);
  }
  return p;
}

/** "{n}" style placeholders */
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));

/** the operator line, always "ICSL FZE – Islamic Coding & Software Lab, Sharjah (SPC Free Zone …)" */
export const operatorLine = (t: BpText) => fill(t.common.operator, { company: `${COMPANY.legalName} – ${COMPANY.brand}`, founder: COMPANY.founder });

export const BP_PATHS = { overview: "/blueprint", studio: "/blueprint/studio", live: "/blueprint/live", academy: "/blueprint/academy", partners: "/partners" } as const;
export type BpPage = keyof typeof BP_PATHS;
