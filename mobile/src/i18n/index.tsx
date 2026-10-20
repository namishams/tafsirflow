import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { I18nManager } from "react-native";
import { reloadAppAsync } from "expo";
import { getLocales } from "expo-localization";
import { LOCALE_META, type AppLocale } from "@/web/locales";
import en, { type Dict } from "./en";
import { dictFor } from "./dicts";
import { load, save } from "@/lib/storage";
import { setDigitLanguage } from "@/lib/digits";

// Every language the website speaks (src/i18n/locales.ts there). English is the reference and the fallback for
// anything a language does not have yet; the device language is used when the app supports it.
export type Lang = AppLocale;
export type LangSetting = "system" | Lang;
export const LANGS = Object.keys(LOCALE_META) as Lang[];
export const isLang = (l: string | null | undefined): l is Lang => !!l && l in LOCALE_META;
export const isRTL = (l: string) => isLang(l) && LOCALE_META[l].dir === "rtl";
export const langLabel = (l: Lang) => LOCALE_META[l].label;

export const deviceLang = (): Lang => {
  for (const l of getLocales()) if (isLang(l.languageCode)) return l.languageCode;
  return "en";
};

/** the BCP 47 tag for Intl (dates, numbers) */
const INTL: Record<Lang, string> = {
  de: "de-DE", en: "en-GB", ar: "ar", tr: "tr-TR", ur: "ur-PK", fa: "fa-AF", ps: "ps-AF", fr: "fr-FR", es: "es-ES",
  id: "id-ID", ms: "ms-MY", bn: "bn-BD", ru: "ru-RU", zh: "zh-CN",
};
export const intlLocale = (l: string) => (isLang(l) ? INTL[l] : "en-GB");

/** the entry of a per-language table for this language, English when there is none */
export function pick<T>(table: { en: T } & { [k: string]: T | undefined }, lang: string): T {
  return table[lang] ?? table.en;
}

type Ctx = { lang: Lang; setting: LangSetting; setSetting: (s: LangSetting) => void; rtl: boolean };
const LangContext = createContext<Ctx>({ lang: "en", setting: "system", setSetting: () => undefined, rtl: false });

// Right-to-left (Arabic, Persian, Urdu, Pashto) is a native setting that applies after a reload. A guard keeps a
// device that refuses the change from reloading again and again.
async function applyDirection(lang: Lang) {
  const rtl = isRTL(lang);
  if (I18nManager.isRTL === rtl) return;
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  const last = await load<number>("qmc.dirReload", 0);
  if (Date.now() - last < 60_000) return;
  await save("qmc.dirReload", Date.now());
  await reloadAppAsync("language direction").catch(() => undefined);
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [setting, setSettingState] = useState<LangSetting>("system");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    load<string>("qmc.lang", "system").then((s) => { setSettingState(s === "system" || isLang(s) ? s : "system"); setReady(true); });
  }, []);
  const setSetting = useCallback((s: LangSetting) => { setSettingState(s); void save("qmc.lang", s); }, []);
  const lang: Lang = setting === "system" ? deviceLang() : setting;
  setDigitLanguage(lang); // before the screens below render their numbers
  useEffect(() => { if (ready) void applyDirection(lang); }, [ready, lang]);
  const value = useMemo(() => ({ lang, setting, setSetting, rtl: I18nManager.isRTL }), [lang, setting, setSetting]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** t("account.signedInAs", { email }) – dotted keys into the dictionary, {placeholders} replaced, English as fallback */
export function useT() {
  const { lang } = useContext(LangContext);
  return useCallback((key: string, params?: Record<string, string | number>) => {
    let v: unknown = dictFor(lang) ?? en;
    for (const k of key.split(".")) v = (v as Record<string, unknown> | undefined)?.[k];
    if (typeof v !== "string") {
      v = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], en);
      if (typeof v !== "string") return key;
    }
    return params ? (v as string).replace(/\{(\w+)\}/g, (_, p: string) => String(params[p] ?? `{${p}}`)) : (v as string);
  }, [lang]);
}

export type { Dict };
