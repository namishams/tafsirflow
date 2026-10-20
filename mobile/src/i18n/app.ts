// The app's own texts in the languages beyond German and English: one file per language (src/i18n/app/<lang>.json),
// one entry per module ("dict", "radio", "shams" …), read the first time a language is used. Every key a language
// does not have yet falls back to English, so a screen is never empty.
type Bundle = Record<string, unknown>;
/* eslint-disable @typescript-eslint/no-require-imports */
const LOAD: Record<string, () => unknown> = {
  ar: () => require("./app/ar.json"), tr: () => require("./app/tr.json"), ur: () => require("./app/ur.json"),
  fa: () => require("./app/fa.json"), ps: () => require("./app/ps.json"), fr: () => require("./app/fr.json"),
  es: () => require("./app/es.json"), id: () => require("./app/id.json"), ms: () => require("./app/ms.json"),
  bn: () => require("./app/bn.json"), ru: () => require("./app/ru.json"), zh: () => require("./app/zh.json"),
};
/* eslint-enable @typescript-eslint/no-require-imports */
const cache = new Map<string, Bundle | null>();
export function appBundle(lang: string): Bundle | null {
  if (!cache.has(lang)) {
    let b: Bundle | null = null;
    try { b = (LOAD[lang]?.() as Bundle | undefined) ?? null; } catch { b = null; }
    cache.set(lang, b);
  }
  return cache.get(lang) ?? null;
}

const merged = new Map<string, unknown>();
/** the texts of one module in this language: its own table first (German, English, Arabic …), then the language file */
export function moduleText<T extends object>(module: string, table: { en: T } & { [k: string]: T | undefined }, lang: string): T {
  const own = table[lang];
  if (own) return own;
  const key = `${module}:${lang}`;
  if (!merged.has(key)) {
    const tr = appBundle(lang)?.[module] as Partial<T> | undefined;
    merged.set(key, tr ? { ...table.en, ...tr } : table.en);
  }
  return merged.get(key) as T;
}
