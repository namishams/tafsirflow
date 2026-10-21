import { useCallback } from "react";
import { intlLocale, useLang } from "@/i18n";

/** numbers in the language's digits */
export function useIntl() {
  const { lang } = useLang();
  return useCallback((n: number) => { try { return new Intl.NumberFormat(intlLocale(lang)).format(n); } catch { return String(n); } }, [lang]);
}
