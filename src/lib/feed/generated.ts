import { verseOfDayKey } from "@/lib/votd";
import { surahOfDay } from "@/lib/featured";
import { toHijri, todayUtc, hijriMonthName, countdown } from "@/lib/hijri";
import type { FeedItem, FeedLocale, FeedTradition } from "./types";

// well-known hadith references (ids only; the app loads text from hadith-api / Thaqalayn)
// ids the app can resolve: "<collection>:<n>" in fawazahmed0/hadith-api numbering (bukhari, muslim, nawawi), and
// "thaqalayn:<bookId>:<n>" as in thaqalayn-api.net v2. Each id checked against the APIs on 2026-10-21 (non-empty text,
// no book prefaces). Muslim is left out: hadith-api numbers it differently from sunnah.com.
const SUNNI_HADITH = ["bukhari:1", "bukhari:13", "bukhari:52", "bukhari:6018", "bukhari:6114", "bukhari:6136", "nawawi:1", "nawawi:2", "nawawi:13", "nawawi:15", "nawawi:18", "nawawi:40"];
const SHIA_HADITH = ["thaqalayn:Al-Kafi-Volume-1-Kulayni:2", "thaqalayn:Al-Kafi-Volume-2-Kulayni:1", "thaqalayn:Kitab-al-Mumin-Ahwazi:1"];
const sunnahUrl = (id: string) => { const [c, n] = id.split(":"); return `https://sunnah.com/${c === "nawawi" ? "nawawi40" : c}:${n}`; };

const T = {
  de: { votd: "Vers des Tages", hotd: "Hadith des Tages", date: "Heute im islamischen Kalender", surah: "Sure des Tages", kahf: "Freitag: Sure al-Kahf", hb: "Der Text wird aus der Quelle geladen.", until: (n: number) => `Noch ${n} Tage bis zum nächsten besonderen Tag.`, sb: (n: number) => `Heute empfohlen: Sure ${n}.` },
  en: { votd: "Verse of the day", hotd: "Hadith of the day", date: "Today in the Islamic calendar", surah: "Surah of the day", kahf: "Friday: Surah al-Kahf", hb: "The text is loaded from the source.", until: (n: number) => `${n} days until the next special day.`, sb: (n: number) => `Recommended today: Surah ${n}.` },
};

export const dayKey = (d: Date) => d.toISOString().slice(0, 10);
export const dayNumber = (d: Date) => Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000);

/** items for a given day (also used for previous days in the endless page) */
export function generatedForDay(day: Date, locale: FeedLocale, tradition: FeedTradition): FeedItem[] {
  const t = T[locale === "de" ? "de" : "en"], key = dayKey(day), n = dayNumber(day), at = `${key}T00:00:00.000Z`;
  const base = { lang: locale, publishedAt: at } as const;
  const items: FeedItem[] = [];
  const vk = verseOfDayKey(day);
  items.push({ ...base, id: `votd:${key}`, kind: "verse-of-day", title: t.votd, body: vk, verseKey: vk, source: "Quran.com", sourceUrl: `https://quran.com/${vk.replace(":", "/")}`, tradition: "all" });
  const shia = tradition === "shia" || (tradition === "all" && n % 3 === 0);
  const list = shia ? SHIA_HADITH : SUNNI_HADITH;
  const hid = list[n % list.length];
  items.push({ ...base, id: `hotd:${key}`, kind: "hadith-of-day", title: t.hotd, body: t.hb, hadithId: hid, source: shia ? "Thaqalayn" : "Sunnah.com", sourceUrl: shia ? "https://thaqalayn.net" : sunnahUrl(hid), tradition: shia ? "shia" : "sunni" });
  const s = surahOfDay(new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 12)));
  items.push({ ...base, id: `surah:${key}`, kind: "featured-surah", title: s.friday ? t.kahf : t.surah, body: t.sb(s.surah), surah: s.surah, source: "Quran.com", sourceUrl: `https://quran.com/${s.surah}`, tradition: "all" });
  try {
    const from = todayUtc(new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 12)));
    const h = toHijri(from);
    const cd = countdown(tradition === "all" ? "both" : tradition, from, 1);
    items.push({
      ...base, id: `hijri:${key}`, kind: "islamic-date", title: t.date, body: cd ? t.until(cd.days) : "", source: "Quran Masterclass", sourceUrl: "https://tafsirflow.com",
      tradition: "all", hijri: { ...h, monthName: hijriMonthName(h.m, locale), event: cd?.next.e.id, daysToEvent: cd?.days },
    });
  } catch { /* Intl calendar unavailable: skip the date item */ }
  return items;
}
