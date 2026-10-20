import type { Dict } from "./en";
import en from "./en";
import de from "./de";
import { appBundle } from "./app";

// The app's own dictionary per language: English and German here, every other language from src/i18n/app/<lang>.json
// (useT falls back to English for each key a language does not have)
const OWN: Partial<Record<string, Dict>> = { en, de };
export const dictFor = (lang: string): Dict | undefined => OWN[lang] ?? (appBundle(lang)?.dict as Dict | undefined);
