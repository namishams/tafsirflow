// The "Islam" section: chapter order = reading order of /islam
import type { IslamChapter, IslamDoc } from "./types";
import { islam } from "./islam";
import { quran } from "./quran";
import { prophet } from "./prophet";
import { cities } from "./cities";
import { sunniShia } from "./sunni-shia";
import { prayerSunni } from "./prayer-sunni";
import { prayerShia } from "./prayer-shia";
import { future } from "./future";

export type { IslamChapter, IslamDoc };
export const ISLAM: IslamDoc[] = [islam, quran, prophet, cities, sunniShia, prayerSunni, prayerShia, future];
export const islamDoc = (slug: string) => ISLAM.find((d) => d.slug === slug);
export const chapterOf = (d: IslamDoc, locale: string): IslamChapter => (locale === "de" ? d.de : d.en);

// texts of the hub page and the article frame
const UI = {
  de: {
    kicker: "Islam verstehen", title: "Der Islam – klar, warm und ehrlich erklärt",
    lead: "Was glauben Muslime? Was ist der Koran, wer war der Prophet Muhammad ﷺ, welche Städte sind uns heilig, was unterscheidet Sunniten und Schiiten – und wie betet man? Acht Kapitel, geschrieben im Geist der Emirate: mit Respekt vor jeder Schule, mit Mäßigung und mit der Gastfreundschaft, mit der man bei uns jeden Fragenden empfängt.",
    start: "Mit Kapitel 1 beginnen", chapters: "Acht Kapitel", read: "Lesen", min: "Min. Lesezeit",
    uaeTitle: "Im Geist der Emirate", uae: "Die Vereinigten Arabischen Emirate stehen für einen Islam der Mitte: tief im Glauben verwurzelt, offen gegenüber den Menschen, respektvoll gegenüber jeder Rechtsschule und jeder Religion. In Abu Dhabi wurde 2019 das Dokument über die Brüderlichkeit aller Menschen unterzeichnet, 2023 öffnete das Abrahamic Family House. Diesem Geist folgen auch diese Seiten.",
    note: "Diese Seiten geben einen Überblick. Für religiöse Fragen deines Alltags wende dich an einen qualifizierten Gelehrten deiner Rechtsschule.",
    faq: "Häufige Fragen", sources: "Quellen", back: "Islam verstehen", prev: "Vorheriges Kapitel", next: "Nächstes Kapitel", chapter: "Kapitel",
    ctaTitle: "Vom Verstehen zum Lernen", ctaBody: "Der schönste Weg, den Islam kennenzulernen, ist der Koran selbst. Beginne mit Al-Fatiha – Vers für Vers, mit der Shams-Methode.", cta: "Al-Fatiha lernen",
  },
  en: {
    kicker: "Understanding Islam", title: "Islam – explained clearly, warmly and honestly",
    lead: "What do Muslims believe? What is the Quran, who was the Prophet Muhammad ﷺ, which cities are holy to us, what distinguishes Sunnis and Shia – and how does one pray? Eight chapters written in the spirit of the Emirates: with respect for every school, with moderation, and with the hospitality with which we welcome everyone who asks.",
    start: "Start with chapter 1", chapters: "Eight chapters", read: "Read", min: "min read",
    uaeTitle: "In the spirit of the Emirates", uae: "The United Arab Emirates stand for an Islam of the middle way: deeply rooted in faith, open towards people, respectful of every school of law and every religion. In 2019 the Document on Human Fraternity was signed in Abu Dhabi; in 2023 the Abrahamic Family House opened. These pages follow that spirit.",
    note: "These pages give an overview. For religious questions in your daily life, please ask a qualified scholar of your school.",
    faq: "Frequently asked questions", sources: "Sources", back: "Understanding Islam", prev: "Previous chapter", next: "Next chapter", chapter: "Chapter",
    ctaTitle: "From understanding to learning", ctaBody: "The most beautiful way to get to know Islam is the Quran itself. Start with Al-Fatiha – verse by verse, with the Shams Method.", cta: "Learn Al-Fatiha",
  },
};
export const islamUi = (locale: string) => (locale === "de" ? UI.de : UI.en);
export const readingMinutes = (text: string) => Math.max(3, Math.round(text.split(/\s+/).length / 200));
