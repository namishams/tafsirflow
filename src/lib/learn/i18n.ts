// mirrors mobile/src/i18n/index.tsx (useLang, pick, isRTL, intlLocale), mobile/src/i18n/app.ts (moduleText) and
// mobile/src/i18n/web.ts (formatWeb) for the learning modules copied from the app. The language is the page's locale
// (next-intl). Module tables carry their own languages (usually en/de/ar and more); the app's per-language files for
// the other languages are copied to src/lib/learn/i18n/<lang>.json (modules learn, coursekit, reciterPath, srs, qaida)
// and loaded the first time a language is used. Every missing key falls back to English.
import { useEffect, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { LOCALE_META, type AppLocale } from "@/i18n/locales";

export type Lang = AppLocale;
export const LANGS = Object.keys(LOCALE_META) as Lang[];
export const isLang = (l: string | null | undefined): l is Lang => !!l && l in LOCALE_META;
export const isRTL = (l: string) => isLang(l) && LOCALE_META[l].dir === "rtl";

const INTL: Record<Lang, string> = {
  de: "de-DE", en: "en-GB", ar: "ar", tr: "tr-TR", ur: "ur-PK", fa: "fa-AF", ps: "ps-AF", fr: "fr-FR", es: "es-ES",
  id: "id-ID", ms: "ms-MY", bn: "bn-BD", ru: "ru-RU", zh: "zh-CN",
};
export const intlLocale = (l: string) => (isLang(l) ? INTL[l] : "en-GB");

/** the entry of a per-language table for this language, English when there is none */
export function pick<T>(table: { en: T } & { [k: string]: T | undefined }, lang: string): T {
  return table[lang] ?? table.en;
}

export function formatWeb(text: string, params?: Record<string, string | number>): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (_, p: string) => (params[p] !== undefined ? String(params[p]) : `{${p}}`));
}

// ---------- the app's language files (other languages) ----------
type Bundle = Record<string, unknown>;
const bundles = new Map<string, Bundle | null>();
const loading = new Set<string>();
const subs = new Set<() => void>();
let bver = 0;
const OWN = new Set(["de", "en"]);

function loadBundle(lang: string) {
  if (OWN.has(lang) || bundles.has(lang) || loading.has(lang) || !isLang(lang)) return;
  loading.add(lang);
  import(`./i18n/${lang}.json`)
    .then((m: { default: Bundle }) => { bundles.set(lang, m.default); })
    .catch(() => { bundles.set(lang, null); })
    .finally(() => { loading.delete(lang); merged.clear(); bver++; subs.forEach((f) => f()); });
}
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

const merged = new Map<string, unknown>();
/** the texts of one module in this language: its own table first, then the language file, English for the rest */
export function moduleText<T extends object>(module: string, table: { en: T } & { [k: string]: T | undefined }, lang: string): T {
  const own = table[lang];
  if (own) return own;
  const key = `${module}:${lang}`;
  if (!merged.has(key)) {
    const tr = bundles.get(lang)?.[module] as Partial<T> | undefined;
    if (!tr) return table.en; // not loaded yet: English now, the language after the file arrived (not cached)
    merged.set(key, { ...table.en, ...tr });
  }
  return merged.get(key) as T;
}

/** the page's language, like the app's useLang(); loads the language file of the app modules when needed */
export function useLang(): { lang: Lang; rtl: boolean } {
  const locale = useLocale();
  const lang: Lang = isLang(locale) ? locale : "en";
  useSyncExternalStore(subscribe, () => bver, () => 0);
  useEffect(() => { loadBundle(lang); }, [lang]);
  return { lang, rtl: isRTL(lang) };
}

/** numbers in the page's language */
export function formatNumber(n: number, lang: string): string {
  try { return new Intl.NumberFormat(intlLocale(lang)).format(n); } catch { return String(n); }
}
