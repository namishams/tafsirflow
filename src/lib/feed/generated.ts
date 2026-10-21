import { verseOfDayKey } from "@/lib/votd";
import { surahOfDay } from "@/lib/featured";
import { toHijri, todayUtc, hijriMonthName, countdown } from "@/lib/hijri";
import type { FeedItem, FeedLocale, FeedTradition } from "./types";

// well-known hadith references (ids only; the app loads text from hadith-api / Thaqalayn)
const SUNNI_HADITH = ["bukhari:1", "bukhari:13", "bukhari:6018", "muslim:2564", "muslim:2699", "tirmidhi:1987", "tirmidhi:2516", "nawawi40:2", "nawawi40:13", "nawawi40:18", "riyadussalihin:1", "abudawud:4811"];
const SHIA_HADITH = ["thaqalayn:al-kafi:1:1:1:1", "thaqalayn:al-kafi:1:1:1:2", "thaqalayn:al-amali-saduq:1:1", "thaqalayn:nahj-al-balagha:1"];

const T = {
  de: { votd: "Vers des Tages", hotd: "Hadith des Tages", date: "Heute im islamischen Kalender", surah: "Sure des Tages", kahf: "Freitag: Sure al-Kahf", hb: "Der Text wird aus der Quelle geladen.", until: (n: number) => `Noch ${n} Tage bis zum nächsten besonderen Tag.`, sb: (n: number) => `Heute empfohlen: Sure ${n}.` },
  en: { votd: "Verse of the day", hotd: "Hadith of the day", date: "Today in the Islamic calendar", surah: "Surah of the day", kahf: "Friday: Surah al-Kahf", hb: "The text is loaded from the source.", until: (n: number) => `${n} days until the next special day.`, sb: (n: number) => `Recommended today: Surah ${n}.` },
};

export const dayKey = (d: Date) => d.toISOString().slice(0, 10);
export const dayNumber = (d: Date) => Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000);

/** items for a given day (also used for previous days in the endless page) */
export function generatedForDay(day: Date, locale: FeedLocale, tradition: FeedTradition): FeedItem[] {
  const t = T[locale], key = dayKey(day), n = dayNumber(day), at = `${key}T00:00:00.000Z`;
  const base = { lang: locale, publishedAt: at } as const;
  const items: FeedItem[] = [];
  const vk = verseOfDayKey(day);
  items.push({ ...base, id: `votd:${key}`, kind: "verse-of-day", title: t.votd, body: vk, verseKey: vk, source: "Quran.com", sourceUrl: `https://quran.com/${vk.replace(":", "/")}`, tradition: "all" });
  const shia = tradition === "shia" || (tradition === "all" && n % 3 === 0);
  const list = shia ? SHIA_HADITH : SUNNI_HADITH;
  const hid = list[n % list.length];
  items.push({ ...base, id: `hotd:${key}`, kind: "hadith-of-day", title: t.hotd, body: t.hb, hadithId: hid, source: shia ? "Thaqalayn" : "Sunnah.com", sourceUrl: shia ? "https://thaqalayn.net" : `https://sunnah.com/${hid}`, tradition: shia ? "shia" : "sunni" });
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
