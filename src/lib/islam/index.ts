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
import { prayersSpecialShia } from "./prayers-special-shia";
import { prayersSpecialSunni } from "./prayers-special-sunni";
import { ziyarat } from "./ziyarat";
import { reciterPathShia } from "./reciter-path-shia";
import { halalHaram } from "./halal-haram";
import { hubOrderOf } from "./hub";

export type { IslamChapter, IslamDoc };
export const ISLAM: IslamDoc[] = [islam, iman, quran, prophet, sahaba, prophets, names, prayerSunni, prayerShia, prayersSpecialSunni, prayersSpecialShia, daily, halalHaram, zakat, ramadan, eid, hajj, reciterPath, reciterPathShia, competition, cities, ziyarat, emirates, mosques, art, madhahib, hanafi, maliki, shafii, hanbali, jafari, zaydi, ibadi, zahiri, sunniShia, future, history];
export const islamDoc = (slug: string) => ISLAM.find((d) => d.slug === slug);

// ---- the one tradition setting (src/lib/identity.ts) orders the hub: a Shia learner sees the Ja'fari chapters as the
// main path and the Sunni school chapters behind "Andere Rechtsschulen"; a Sunni learner the other way round; "both" or
// not chosen shows every chapter in reading order. Nothing is hidden, only collapsed.
export { CHAPTER_TRADITION, orderSchools } from "./hub";
/** indexes into ISLAM: `main` in reading order (the own tradition's chapters first), `other` for the expander */
export const hubOrder = (trad: "sunni" | "shia" | "both" | null | undefined) => hubOrderOf(ISLAM.map((d) => d.slug), trad);
/** small texts of the tradition order and the review note (German, English; other languages English) */
const TRAD_UI = {
  de: { other: "Andere Rechtsschulen", otherLead: "Die Kapitel der anderen Schulen – zum Vergleichen und Verstehen.", review: "Inhalt wird von Gelehrten geprüft.", enOnly: "" },
  en: { other: "Other schools of law", otherLead: "The chapters of the other schools – to compare and understand.", review: "Content is being reviewed by scholars.", enOnly: "This guide is available in English for now; a translation into your language will follow." },
};
export const tradUi = (locale: string) => (locale === "de" ? TRAD_UI.de : TRAD_UI.en);
// German and English live in the chapter files; every other language in src/lib/islam/i18n/<locale>/<slug>.ts (falls back to English)
const OTHER = ["ar", "bn", "es", "fa", "fr", "id", "ms", "ps", "ru", "tr", "ur", "zh"];
export async function loadChapter(d: IslamDoc, locale: string): Promise<IslamChapter> {
  if (locale === "de") return d.de;
  if (locale === "en" || !OTHER.includes(locale)) return d.en;
  try { return (await import(`./i18n/${locale}/${d.slug}`)).default as IslamChapter; } catch { return d.en; }
}
export const loadChapters = (locale: string) => Promise.all(ISLAM.map((d) => loadChapter(d, locale)));

// texts of the hub page and the article frame
const UI = {
  de: {
    kicker: "Islam verstehen", title: "Der Islam – klar, warm und ehrlich erklärt",
    lead: "Was glauben Muslime? Was ist der Koran, wer war der Prophet Muhammad ﷺ, welche Städte sind uns heilig, was unterscheidet Sunniten und Schiiten – und wie betet man? Kapitel für Kapitel, geschrieben im Geist der Emirate: mit Respekt vor jeder Schule, mit Mäßigung und mit der Gastfreundschaft, mit der man bei uns jeden Fragenden empfängt.",
    start: "Mit Kapitel 1 beginnen", chapters: "Alle Kapitel", read: "Lesen", min: "Min. Lesezeit",
    uaeTitle: "Im Geist der Emirate", uae: "Die Vereinigten Arabischen Emirate stehen für einen Islam der Mitte: tief im Glauben verwurzelt, offen gegenüber den Menschen, respektvoll gegenüber jeder Rechtsschule und jeder Religion. In Abu Dhabi wurde 2019 das Dokument über die Brüderlichkeit aller Menschen unterzeichnet, 2023 öffnete das Abrahamic Family House. Diesem Geist folgen auch diese Seiten.",
    note: "Diese Seiten geben einen Überblick. Für religiöse Fragen Ihres Alltags wenden Sie sich an einen qualifizierten Gelehrten Ihrer Rechtsschule.",
    faq: "Häufige Fragen", sources: "Quellen", back: "Islam verstehen", prev: "Vorheriges Kapitel", next: "Nächstes Kapitel", chapter: "Kapitel",
    ctaTitle: "Vom Verstehen zum Lernen", ctaBody: "Der schönste Weg, den Islam kennenzulernen, ist der Koran selbst. Beginnen Sie mit Al-Fatiha – Vers für Vers, mit der Shams-Methode.", cta: "Al-Fatiha lernen",
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
  try { return (await import(`./i18n/${locale}/ui`)).default as IslamUi; } catch { return UI.en; }
}
export const readingMinutes = (text: string) => Math.max(3, Math.round(text.split(/\s+/).length / 200));
