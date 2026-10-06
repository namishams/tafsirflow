import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../../messages/en.json";

type Tree = { [k: string]: string | Tree };

// A language that does not (yet) have every text falls back to English for the missing ones – never shows raw keys
function merge(base: Tree, over: Tree): Tree {
  const out: Tree = { ...base };
  for (const [k, v] of Object.entries(over)) {
    const b = out[k];
    out[k] = typeof v === "object" && v !== null && typeof b === "object" && b !== null ? merge(b, v) : v;
  }
  return out;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as never) ? requested! : routing.defaultLocale;
  const own = (await import(`../../messages/${locale}.json`)).default as Tree;
  return { locale, messages: locale === "en" ? own : merge(en as Tree, own) };
});
