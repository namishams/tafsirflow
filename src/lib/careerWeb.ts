// Texts of the progress profile ("Statistik" tab), the career card and the global boards on the website. All 14 locales
// in careerWeb/<locale>.json (the app keeps the same files in mobile/src/features/stats/i18n), merged over English.
// Polite address in every language. Placeholders: {n}, {t}, {l}, {u}, {c}, {d}.
import ar from "./careerWeb/ar.json";
import bn from "./careerWeb/bn.json";
import de from "./careerWeb/de.json";
import en from "./careerWeb/en.json";
import es from "./careerWeb/es.json";
import fa from "./careerWeb/fa.json";
import fr from "./careerWeb/fr.json";
import id from "./careerWeb/id.json";
import ms from "./careerWeb/ms.json";
import ps from "./careerWeb/ps.json";
import ru from "./careerWeb/ru.json";
import tr from "./careerWeb/tr.json";
import ur from "./careerWeb/ur.json";
import zh from "./careerWeb/zh.json";

export type CwKey = keyof typeof en;
const ALL: Record<string, Partial<Record<CwKey, string>>> = { ar, bn, de, en, es, fa, fr, id, ms, ps, ru, tr, ur, zh };
const memo = new Map<string, Record<CwKey, string>>();
export function careerText(locale: string): Record<CwKey, string> {
  let t = memo.get(locale);
  if (!t) { t = { ...en, ...(ALL[locale] ?? {}) } as Record<CwKey, string>; memo.set(locale, t); }
  return t;
}
export const fillCw = (s: string, vars: Record<string, string | number>) => Object.entries(vars).reduce((a, [k, v]) => a.split(`{${k}}`).join(String(v)), s);
