// mirrors useQbankT of mobile/src/features/qbank/text.ts for the website; the tables are in ./textTables.ts (server-safe)
import { moduleText, useLang } from "@/lib/learn/i18n";
import { QBANK_EN, TABLE, type QbankKey, type T } from "./textTables";

export type { QbankKey } from "./textTables";
export { QBANK_EN, qbankTextFor } from "./textTables";

export function useQbankT() {
  const { lang } = useLang();
  const tx = moduleText<T>("qbank", TABLE, lang);
  return (k: QbankKey | string, p?: Record<string, string | number>) => {
    let s = (tx as Record<string, string>)[k] ?? (QBANK_EN as Record<string, string>)[k] ?? k;
    if (p) for (const [a, b] of Object.entries(p)) s = s.split(`{${a}}`).join(String(b));
    return s;
  };
}
export type QbankT = ReturnType<typeof useQbankT>;
