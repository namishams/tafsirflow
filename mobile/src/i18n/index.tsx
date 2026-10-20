import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getLocales } from "expo-localization";
import en, { type Dict } from "./en";
import de from "./de";
import { load, save } from "@/lib/storage";

export type Lang = "de" | "en";
export type LangSetting = "system" | Lang;
const DICTS: Record<Lang, Dict> = { en, de };

export const deviceLang = (): Lang => (getLocales()[0]?.languageCode === "de" ? "de" : "en");

type Ctx = { lang: Lang; setting: LangSetting; setSetting: (s: LangSetting) => void };
const LangContext = createContext<Ctx>({ lang: "en", setting: "system", setSetting: () => undefined });

export function LangProvider({ children }: { children: ReactNode }) {
  const [setting, setSettingState] = useState<LangSetting>("system");
  useEffect(() => { load<LangSetting>("qmc.lang", "system").then(setSettingState); }, []);
  const setSetting = useCallback((s: LangSetting) => { setSettingState(s); void save("qmc.lang", s); }, []);
  const lang: Lang = setting === "system" ? deviceLang() : setting;
  const value = useMemo(() => ({ lang, setting, setSetting }), [lang, setting, setSetting]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** t("account.signedInAs", { email }) – dotted keys into the dictionary, {placeholders} replaced */
export function useT() {
  const { lang } = useContext(LangContext);
  return useCallback((key: string, params?: Record<string, string | number>) => {
    let v: unknown = DICTS[lang];
    for (const k of key.split(".")) v = (v as Record<string, unknown> | undefined)?.[k];
    if (typeof v !== "string") {
      v = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], en);
      if (typeof v !== "string") return key;
    }
    return params ? (v as string).replace(/\{(\w+)\}/g, (_, p: string) => String(params[p] ?? `{${p}}`)) : (v as string);
  }, [lang]);
}
