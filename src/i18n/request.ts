import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import en from "../../messages/en.json";
import { hideDeep } from "@/lib/protectEmail";

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

// E-mail addresses in the texts become markers once per language (src/lib/protectEmail.ts), so neither the server-rendered
// HTML nor the texts sent to the browser contain an address; the pages show a click-to-reveal control instead.
const protectedMessages = new Map<string, Tree>();

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = routing.locales.includes(requested as never) ? requested! : routing.defaultLocale;
  const own = (await import(`../../messages/${locale}.json`)).default as Tree;
  let messages = protectedMessages.get(locale);
  if (!messages) {
    messages = hideDeep(locale === "en" ? own : merge(en as Tree, own));
    if (process.env.NODE_ENV === "production") protectedMessages.set(locale, messages);
  }
  return { locale, messages };
});
