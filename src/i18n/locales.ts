// Per-language metadata. Add a language: add it here, in routing.ts and as messages/<code>.json.
export const LOCALE_META = {
  de: { label: "Deutsch", dir: "ltr", resourceLang: "german" },
  en: { label: "English", dir: "ltr", resourceLang: "english" },
  id: { label: "Bahasa Indonesia", dir: "ltr", resourceLang: "indonesian" },
  fa: { label: "فارسی", dir: "rtl", resourceLang: "persian" },
} as const;

export type AppLocale = keyof typeof LOCALE_META;

export function localeMeta(locale: string) {
  return LOCALE_META[(locale in LOCALE_META ? locale : "en") as AppLocale];
}
