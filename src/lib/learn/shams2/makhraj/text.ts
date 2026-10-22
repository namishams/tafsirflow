import { useCallback } from "react";
import { useLang } from "@/lib/learn/i18n";
import { fillMk, makhrajText, type MkKey } from "./tables";

// Makhraj coach (Shams 3.0) – the hook over the text tables in ./tables.ts (mirrors mobile/src/features/shams2/makhraj/text.ts).
export { fillMk, makhrajText, MAKHRAJ_AR, MAKHRAJ_DE, MAKHRAJ_EN, type MkKey } from "./tables";
export function useMk() {
  const { lang } = useLang();
  return useCallback((k: MkKey, p?: Record<string, string | number>) => fillMk(makhrajText(lang)[k], p), [lang]);
}
