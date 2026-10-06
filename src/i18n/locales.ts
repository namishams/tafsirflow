// Per-language metadata. Add a language: add it here, in routing.ts and as messages/<code>.json.
// resourceLang = how Quran.com names the language in its translation/tafsir lists.
export const LOCALE_META = {
  de: { label: "Deutsch", dir: "ltr", resourceLang: "german" },
  en: { label: "English", dir: "ltr", resourceLang: "english" },
  ar: { label: "العربية", dir: "rtl", resourceLang: "arabic" },
  tr: { label: "Türkçe", dir: "ltr", resourceLang: "turkish" },
  ur: { label: "اردو", dir: "rtl", resourceLang: "urdu" },
  fa: { label: "فارسی (دری)", dir: "rtl", resourceLang: "persian" },
  ps: { label: "پښتو", dir: "rtl", resourceLang: "pashto" },
  fr: { label: "Français", dir: "ltr", resourceLang: "french" },
  es: { label: "Español", dir: "ltr", resourceLang: "spanish" },
  id: { label: "Bahasa Indonesia", dir: "ltr", resourceLang: "indonesian" },
  ms: { label: "Bahasa Melayu", dir: "ltr", resourceLang: "malay" },
  bn: { label: "বাংলা", dir: "ltr", resourceLang: "bengali" },
  ru: { label: "Русский", dir: "ltr", resourceLang: "russian" },
  zh: { label: "中文", dir: "ltr", resourceLang: "chinese" },
} as const;

export type AppLocale = keyof typeof LOCALE_META;

export function localeMeta(locale: string) {
  return LOCALE_META[(locale in LOCALE_META ? locale : "en") as AppLocale];
}
