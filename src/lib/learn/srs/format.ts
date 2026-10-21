// mirrors mobile/src/features/srs/format.ts (copied for the website; keep both in step)
import { useCallback } from "react";
import { intlLocale, useLang } from "@/lib/learn/i18n";

/** numbers in the language's digits */
export function useIntl() {
  const { lang } = useLang();
  return useCallback((n: number) => { try { return new Intl.NumberFormat(intlLocale(lang)).format(n); } catch { return String(n); } }, [lang]);
}
