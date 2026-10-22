import { useLang } from "@/i18n";
import ar from "./i18n/ar.json";
import bn from "./i18n/bn.json";
import de from "./i18n/de.json";
import en from "./i18n/en.json";
import es from "./i18n/es.json";
import fa from "./i18n/fa.json";
import fr from "./i18n/fr.json";
import id from "./i18n/id.json";
import ms from "./i18n/ms.json";
import ps from "./i18n/ps.json";
import ru from "./i18n/ru.json";
import tr from "./i18n/tr.json";
import ur from "./i18n/ur.json";
import zh from "./i18n/zh.json";

// Texts of the progress profile ("Statistik" tab), the career card and the global boards in the app. All 14 languages in
// ./i18n/<lang>.json – the same files as the website's src/lib/careerWeb/<locale>.json (copy them over when they change),
// merged over English. Polite address in every language. Placeholders: {n}, {t}, {l}, {u}, {c}, {d}.
export type CKey = keyof typeof en;
const ALL: Record<string, Partial<Record<CKey, string>>> = { ar, bn, de, en, es, fa, fr, id, ms, ps, ru, tr, ur, zh };
const memo = new Map<string, Record<CKey, string>>();
export function careerTable(lang: string): Record<CKey, string> {
  let t = memo.get(lang);
  if (!t) { t = { ...en, ...(ALL[lang] ?? {}) } as Record<CKey, string>; memo.set(lang, t); }
  return t;
}
export function careerT(lang: string, key: CKey, vars?: Record<string, string | number>): string {
  let s = careerTable(lang)[key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v));
  return s;
}
export function useCT() {
  const { lang } = useLang();
  return (key: CKey, vars?: Record<string, string | number>) => careerT(lang, key, vars);
}
