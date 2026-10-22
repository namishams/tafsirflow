import type { ReciterBio, ReciterBioText } from "./types";
import { GROUP1 } from "./group1";
import { GROUP2 } from "./group2";
import AR_BIOS from "./ar";
export type { ReciterBio, ReciterBioText };
export const RECITER_BIOS: ReciterBio[] = [...GROUP1, ...GROUP2];
export const reciterBio = (slug: string) => RECITER_BIOS.find((r) => r.slug === slug);
// Arabic bios live in ./ar.ts (keyed by slug); a missing one falls back to English.
// Every other language lives in ./i18n/<locale>.ts (keyed by slug), read on demand with loadBioTexts() and passed to
// bioText as `more`; a missing language or slug falls back to English.
export type BioTexts = Record<string, ReciterBioText>;
const OTHER = ["bn", "es", "fa", "fr", "id", "ms", "ps", "ru", "tr", "ur", "zh"];
export async function loadBioTexts(locale: string): Promise<BioTexts | null> {
  if (!OTHER.includes(locale)) return null;
  try { return (await import(`./i18n/${locale}`)).default as BioTexts; } catch { return null; }
}
export const bioText = (r: ReciterBio, locale: string, more?: BioTexts | null): ReciterBioText => (locale === "de" ? r.de : locale === "ar" ? AR_BIOS[r.slug] ?? r.en : more?.[r.slug] ?? r.en);
export const COUNTRIES_AR: Record<string, string> = { Egypt: "مصر", "Saudi Arabia": "المملكة العربية السعودية", Kuwait: "الكويت", "United Arab Emirates": "الإمارات العربية المتحدة", Yemen: "اليمن", Sudan: "السودان", Somalia: "الصومال", Iraq: "العراق", Libya: "ليبيا", Morocco: "المغرب", Qatar: "قطر", Bahrain: "البحرين", Oman: "سلطنة عُمان", Jordan: "الأردن", Syria: "سوريا", Pakistan: "باكستان", Indonesia: "إندونيسيا" };
export const COUNTRIES_DE: Record<string, string> = { Egypt: "Ägypten", "Saudi Arabia": "Saudi-Arabien", Kuwait: "Kuwait", "United Arab Emirates": "Vereinigte Arabische Emirate", Yemen: "Jemen", Sudan: "Sudan", Somalia: "Somalia", Iraq: "Irak", Libya: "Libyen", Morocco: "Marokko", Qatar: "Katar", Bahrain: "Bahrain", Oman: "Oman", Jordan: "Jordanien", Syria: "Syrien", Pakistan: "Pakistan", Indonesia: "Indonesien" };
export const STYLE: Record<string, { de: string; en: string; ar: string }> = {
  murattal: { de: "Murattal", en: "Murattal", ar: "مرتّل" },
  mujawwad: { de: "Mujawwad", en: "Mujawwad", ar: "مجوّد" },
  imam: { de: "Imam", en: "Imam", ar: "إمام" },
  teacher: { de: "Lehrer", en: "Teacher", ar: "معلّم" },
};
