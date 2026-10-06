import type { ReciterBio, ReciterBioText } from "./types";
import { GROUP1 } from "./group1";
import { GROUP2 } from "./group2";
export type { ReciterBio, ReciterBioText };
export const RECITER_BIOS: ReciterBio[] = [...GROUP1, ...GROUP2];
export const reciterBio = (slug: string) => RECITER_BIOS.find((r) => r.slug === slug);
export const bioText = (r: ReciterBio, locale: string): ReciterBioText => (locale === "de" ? r.de : r.en);
export const COUNTRIES_DE: Record<string, string> = { Egypt: "Ägypten", "Saudi Arabia": "Saudi-Arabien", Kuwait: "Kuwait", "United Arab Emirates": "Vereinigte Arabische Emirate", Yemen: "Jemen", Sudan: "Sudan", Somalia: "Somalia", Iraq: "Irak", Libya: "Libyen", Morocco: "Marokko", Qatar: "Katar", Bahrain: "Bahrain", Oman: "Oman", Jordan: "Jordanien", Syria: "Syrien", Pakistan: "Pakistan", Indonesia: "Indonesien" };
export const STYLE: Record<string, { de: string; en: string; ar: string }> = {
  murattal: { de: "Murattal", en: "Murattal", ar: "مرتّل" },
  mujawwad: { de: "Mujawwad", en: "Mujawwad", ar: "مجوّد" },
  imam: { de: "Imam", en: "Imam", ar: "إمام" },
  teacher: { de: "Lehrer", en: "Teacher", ar: "معلّم" },
};
