// The "Islam" section: chapter order = reading order of /islam
import type { IslamChapter, IslamDoc } from "./types";
import { islam } from "./islam";
import { quran } from "./quran";
import { prophet } from "./prophet";
import { cities } from "./cities";
import { emirates } from "./emirates";
import { sunniShia } from "./sunni-shia";
import { prayerSunni } from "./prayer-sunni";
import { prayerShia } from "./prayer-shia";
import { future } from "./future";
import { zakat } from "./zakat";
import { ramadan } from "./ramadan";
import { eid } from "./eid";
import { hajj } from "./hajj";
import { prophets } from "./prophets";
import { names } from "./names";
import { competition } from "./competition";
import { reciterPath } from "./reciter-path";
import { mosques } from "./mosques";
import { madhahib } from "./madhahib";
import { hanafi } from "./hanafi";
import { maliki } from "./maliki";
import { shafii } from "./shafii";
import { hanbali } from "./hanbali";
import { jafari } from "./jafari";
import { zaydi } from "./zaydi";
import { ibadi } from "./ibadi";
import { zahiri } from "./zahiri";
import { daily } from "./daily";
import { iman } from "./iman";
import { sahaba } from "./sahaba";
import { art } from "./art";
import { history } from "./history";

export type { IslamChapter, IslamDoc };
export const ISLAM: IslamDoc[] = [islam, iman, quran, prophet, sahaba, prophets, names, prayerSunni, prayerShia, daily, zakat, ramadan, eid, hajj, reciterPath, competition, cities, emirates, mosques, art, madhahib, hanafi, maliki, shafii, hanbali, jafari, zaydi, ibadi, zahiri, sunniShia, future, history];
export const islamDoc = (slug: string) => ISLAM.find((d) => d.slug === slug);
// German and English live in the chapter files; every other language in src/lib/islam/i18n/<locale>/<slug>.ts (falls back to English)
const OTHER = ["ar", "bn", "es", "fa", "fr", "id", "ms", "ps", "ru", "tr", "ur", "zh"];
export async function loadChapter(d: IslamDoc, locale: string): Promise<IslamChapter> {
  if (locale === "de") return d.de;
  if (locale === "en" || !OTHER.includes(locale)) return d.en;
  try { return __lang2(`./i18n/${locale}/${d.slug}`).default as IslamChapter; } catch { return d.en; }
}
export const loadChapters = (locale: string) => Promise.all(ISLAM.map((d) => loadChapter(d, locale)));

// texts of the hub page and the article frame
const UI = {
  de: {
    kicker: "Islam verstehen", title: "Der Islam – klar, warm und ehrlich erklärt",
    lead: "Was glauben Muslime? Was ist der Koran, wer war der Prophet Muhammad ﷺ, welche Städte sind uns heilig, was unterscheidet Sunniten und Schiiten – und wie betet man? Kapitel für Kapitel, geschrieben im Geist der Emirate: mit Respekt vor jeder Schule, mit Mäßigung und mit der Gastfreundschaft, mit der man bei uns jeden Fragenden empfängt.",
    start: "Mit Kapitel 1 beginnen", chapters: "Alle Kapitel", read: "Lesen", min: "Min. Lesezeit",
    uaeTitle: "Im Geist der Emirate", uae: "Die Vereinigten Arabischen Emirate stehen für einen Islam der Mitte: tief im Glauben verwurzelt, offen gegenüber den Menschen, respektvoll gegenüber jeder Rechtsschule und jeder Religion. In Abu Dhabi wurde 2019 das Dokument über die Brüderlichkeit aller Menschen unterzeichnet, 2023 öffnete das Abrahamic Family House. Diesem Geist folgen auch diese Seiten.",
    note: "Diese Seiten geben einen Überblick. Für religiöse Fragen deines Alltags wende dich an einen qualifizierten Gelehrten deiner Rechtsschule.",
    faq: "Häufige Fragen", sources: "Quellen", back: "Islam verstehen", prev: "Vorheriges Kapitel", next: "Nächstes Kapitel", chapter: "Kapitel",
    ctaTitle: "Vom Verstehen zum Lernen", ctaBody: "Der schönste Weg, den Islam kennenzulernen, ist der Koran selbst. Beginne mit Al-Fatiha – Vers für Vers, mit der Shams-Methode.", cta: "Al-Fatiha lernen",
  },
  en: {
    kicker: "Understanding Islam", title: "Islam – explained clearly, warmly and honestly",
    lead: "What do Muslims believe? What is the Quran, who was the Prophet Muhammad ﷺ, which cities are holy to us, what distinguishes Sunnis and Shia – and how does one pray? Chapter by chapter, written in the spirit of the Emirates: with respect for every school, with moderation, and with the hospitality with which we welcome everyone who asks.",
    start: "Start with chapter 1", chapters: "All chapters", read: "Read", min: "min read",
    uaeTitle: "In the spirit of the Emirates", uae: "The United Arab Emirates stand for an Islam of the middle way: deeply rooted in faith, open towards people, respectful of every school of law and every religion. In 2019 the Document on Human Fraternity was signed in Abu Dhabi; in 2023 the Abrahamic Family House opened. These pages follow that spirit.",
    note: "These pages give an overview. For religious questions in your daily life, please ask a qualified scholar of your school.",
    faq: "Frequently asked questions", sources: "Sources", back: "Understanding Islam", prev: "Previous chapter", next: "Next chapter", chapter: "Chapter",
    ctaTitle: "From understanding to learning", ctaBody: "The most beautiful way to get to know Islam is the Quran itself. Start with Al-Fatiha – verse by verse, with the Shams Method.", cta: "Learn Al-Fatiha",
  },
};
export type IslamUi = typeof UI.en;
export async function islamUi(locale: string): Promise<IslamUi> {
  if (locale === "de") return UI.de;
  if (locale === "en" || !OTHER.includes(locale)) return UI.en;
  try { return __lang3(`./i18n/${locale}/ui`).default as IslamUi; } catch { return UI.en; }
}
export const readingMinutes = (text: string) => Math.max(3, Math.round(text.split(/\s+/).length / 200));

// generated by scripts/sync-web.mjs: the other languages, required only when one is opened
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
function __lang2(p: string): any {
  switch (p) {
    case "./i18n/ar/art": return require("./i18n/ar/art");
    case "./i18n/ar/cities": return require("./i18n/ar/cities");
    case "./i18n/ar/competition": return require("./i18n/ar/competition");
    case "./i18n/ar/daily": return require("./i18n/ar/daily");
    case "./i18n/ar/eid": return require("./i18n/ar/eid");
    case "./i18n/ar/emirates": return require("./i18n/ar/emirates");
    case "./i18n/ar/future": return require("./i18n/ar/future");
    case "./i18n/ar/hajj": return require("./i18n/ar/hajj");
    case "./i18n/ar/hanafi": return require("./i18n/ar/hanafi");
    case "./i18n/ar/hanbali": return require("./i18n/ar/hanbali");
    case "./i18n/ar/history": return require("./i18n/ar/history");
    case "./i18n/ar/ibadi": return require("./i18n/ar/ibadi");
    case "./i18n/ar/iman": return require("./i18n/ar/iman");
    case "./i18n/ar/islam": return require("./i18n/ar/islam");
    case "./i18n/ar/jafari": return require("./i18n/ar/jafari");
    case "./i18n/ar/madhahib": return require("./i18n/ar/madhahib");
    case "./i18n/ar/maliki": return require("./i18n/ar/maliki");
    case "./i18n/ar/mosques": return require("./i18n/ar/mosques");
    case "./i18n/ar/names": return require("./i18n/ar/names");
    case "./i18n/ar/prayer-shia": return require("./i18n/ar/prayer-shia");
    case "./i18n/ar/prayer-sunni": return require("./i18n/ar/prayer-sunni");
    case "./i18n/ar/prophet": return require("./i18n/ar/prophet");
    case "./i18n/ar/prophets": return require("./i18n/ar/prophets");
    case "./i18n/ar/quran": return require("./i18n/ar/quran");
    case "./i18n/ar/ramadan": return require("./i18n/ar/ramadan");
    case "./i18n/ar/reciter-path": return require("./i18n/ar/reciter-path");
    case "./i18n/ar/sahaba": return require("./i18n/ar/sahaba");
    case "./i18n/ar/shafii": return require("./i18n/ar/shafii");
    case "./i18n/ar/sunni-shia": return require("./i18n/ar/sunni-shia");
    case "./i18n/ar/ui": return require("./i18n/ar/ui");
    case "./i18n/ar/zahiri": return require("./i18n/ar/zahiri");
    case "./i18n/ar/zakat": return require("./i18n/ar/zakat");
    case "./i18n/ar/zaydi": return require("./i18n/ar/zaydi");
    case "./i18n/bn/cities": return require("./i18n/bn/cities");
    case "./i18n/bn/future": return require("./i18n/bn/future");
    case "./i18n/bn/islam": return require("./i18n/bn/islam");
    case "./i18n/bn/prayer-shia": return require("./i18n/bn/prayer-shia");
    case "./i18n/bn/prayer-sunni": return require("./i18n/bn/prayer-sunni");
    case "./i18n/bn/prophet": return require("./i18n/bn/prophet");
    case "./i18n/bn/quran": return require("./i18n/bn/quran");
    case "./i18n/bn/sunni-shia": return require("./i18n/bn/sunni-shia");
    case "./i18n/bn/ui": return require("./i18n/bn/ui");
    case "./i18n/es/cities": return require("./i18n/es/cities");
    case "./i18n/es/future": return require("./i18n/es/future");
    case "./i18n/es/islam": return require("./i18n/es/islam");
    case "./i18n/es/prayer-shia": return require("./i18n/es/prayer-shia");
    case "./i18n/es/prayer-sunni": return require("./i18n/es/prayer-sunni");
    case "./i18n/es/prophet": return require("./i18n/es/prophet");
    case "./i18n/es/quran": return require("./i18n/es/quran");
    case "./i18n/es/sunni-shia": return require("./i18n/es/sunni-shia");
    case "./i18n/es/ui": return require("./i18n/es/ui");
    case "./i18n/fa/cities": return require("./i18n/fa/cities");
    case "./i18n/fa/future": return require("./i18n/fa/future");
    case "./i18n/fa/islam": return require("./i18n/fa/islam");
    case "./i18n/fa/prayer-shia": return require("./i18n/fa/prayer-shia");
    case "./i18n/fa/prayer-sunni": return require("./i18n/fa/prayer-sunni");
    case "./i18n/fa/prophet": return require("./i18n/fa/prophet");
    case "./i18n/fa/quran": return require("./i18n/fa/quran");
    case "./i18n/fa/sunni-shia": return require("./i18n/fa/sunni-shia");
    case "./i18n/fa/ui": return require("./i18n/fa/ui");
    case "./i18n/fr/cities": return require("./i18n/fr/cities");
    case "./i18n/fr/future": return require("./i18n/fr/future");
    case "./i18n/fr/islam": return require("./i18n/fr/islam");
    case "./i18n/fr/prayer-shia": return require("./i18n/fr/prayer-shia");
    case "./i18n/fr/prayer-sunni": return require("./i18n/fr/prayer-sunni");
    case "./i18n/fr/prophet": return require("./i18n/fr/prophet");
    case "./i18n/fr/quran": return require("./i18n/fr/quran");
    case "./i18n/fr/sunni-shia": return require("./i18n/fr/sunni-shia");
    case "./i18n/fr/ui": return require("./i18n/fr/ui");
    case "./i18n/id/cities": return require("./i18n/id/cities");
    case "./i18n/id/future": return require("./i18n/id/future");
    case "./i18n/id/islam": return require("./i18n/id/islam");
    case "./i18n/id/prayer-shia": return require("./i18n/id/prayer-shia");
    case "./i18n/id/prayer-sunni": return require("./i18n/id/prayer-sunni");
    case "./i18n/id/prophet": return require("./i18n/id/prophet");
    case "./i18n/id/quran": return require("./i18n/id/quran");
    case "./i18n/id/sunni-shia": return require("./i18n/id/sunni-shia");
    case "./i18n/id/ui": return require("./i18n/id/ui");
    case "./i18n/ms/ui": return require("./i18n/ms/ui");
    case "./i18n/ps/cities": return require("./i18n/ps/cities");
    case "./i18n/ps/future": return require("./i18n/ps/future");
    case "./i18n/ps/islam": return require("./i18n/ps/islam");
    case "./i18n/ps/prayer-shia": return require("./i18n/ps/prayer-shia");
    case "./i18n/ps/prayer-sunni": return require("./i18n/ps/prayer-sunni");
    case "./i18n/ps/prophet": return require("./i18n/ps/prophet");
    case "./i18n/ps/quran": return require("./i18n/ps/quran");
    case "./i18n/ps/sunni-shia": return require("./i18n/ps/sunni-shia");
    case "./i18n/ps/ui": return require("./i18n/ps/ui");
    case "./i18n/ru/cities": return require("./i18n/ru/cities");
    case "./i18n/ru/future": return require("./i18n/ru/future");
    case "./i18n/ru/islam": return require("./i18n/ru/islam");
    case "./i18n/ru/prayer-shia": return require("./i18n/ru/prayer-shia");
    case "./i18n/ru/prayer-sunni": return require("./i18n/ru/prayer-sunni");
    case "./i18n/ru/prophet": return require("./i18n/ru/prophet");
    case "./i18n/ru/quran": return require("./i18n/ru/quran");
    case "./i18n/ru/sunni-shia": return require("./i18n/ru/sunni-shia");
    case "./i18n/ru/ui": return require("./i18n/ru/ui");
    case "./i18n/tr/cities": return require("./i18n/tr/cities");
    case "./i18n/tr/future": return require("./i18n/tr/future");
    case "./i18n/tr/islam": return require("./i18n/tr/islam");
    case "./i18n/tr/prayer-shia": return require("./i18n/tr/prayer-shia");
    case "./i18n/tr/prayer-sunni": return require("./i18n/tr/prayer-sunni");
    case "./i18n/tr/prophet": return require("./i18n/tr/prophet");
    case "./i18n/tr/quran": return require("./i18n/tr/quran");
    case "./i18n/tr/sunni-shia": return require("./i18n/tr/sunni-shia");
    case "./i18n/tr/ui": return require("./i18n/tr/ui");
    case "./i18n/ur/cities": return require("./i18n/ur/cities");
    case "./i18n/ur/future": return require("./i18n/ur/future");
    case "./i18n/ur/islam": return require("./i18n/ur/islam");
    case "./i18n/ur/prayer-shia": return require("./i18n/ur/prayer-shia");
    case "./i18n/ur/prayer-sunni": return require("./i18n/ur/prayer-sunni");
    case "./i18n/ur/prophet": return require("./i18n/ur/prophet");
    case "./i18n/ur/quran": return require("./i18n/ur/quran");
    case "./i18n/ur/sunni-shia": return require("./i18n/ur/sunni-shia");
    case "./i18n/ur/ui": return require("./i18n/ur/ui");
    case "./i18n/zh/cities": return require("./i18n/zh/cities");
    case "./i18n/zh/future": return require("./i18n/zh/future");
    case "./i18n/zh/islam": return require("./i18n/zh/islam");
    case "./i18n/zh/prayer-shia": return require("./i18n/zh/prayer-shia");
    case "./i18n/zh/prayer-sunni": return require("./i18n/zh/prayer-sunni");
    case "./i18n/zh/prophet": return require("./i18n/zh/prophet");
    case "./i18n/zh/quran": return require("./i18n/zh/quran");
    case "./i18n/zh/sunni-shia": return require("./i18n/zh/sunni-shia");
    case "./i18n/zh/ui": return require("./i18n/zh/ui");
  }
  throw new Error("language not bundled");
}

// generated by scripts/sync-web.mjs: the other languages, required only when one is opened
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
function __lang3(p: string): any {
  switch (p) {
    case "./i18n/ar/ui": return require("./i18n/ar/ui");
    case "./i18n/bn/ui": return require("./i18n/bn/ui");
    case "./i18n/es/ui": return require("./i18n/es/ui");
    case "./i18n/fa/ui": return require("./i18n/fa/ui");
    case "./i18n/fr/ui": return require("./i18n/fr/ui");
    case "./i18n/id/ui": return require("./i18n/id/ui");
    case "./i18n/ms/ui": return require("./i18n/ms/ui");
    case "./i18n/ps/ui": return require("./i18n/ps/ui");
    case "./i18n/ru/ui": return require("./i18n/ru/ui");
    case "./i18n/tr/ui": return require("./i18n/tr/ui");
    case "./i18n/ur/ui": return require("./i18n/ur/ui");
    case "./i18n/zh/ui": return require("./i18n/zh/ui");
  }
  throw new Error("language not bundled");
}
