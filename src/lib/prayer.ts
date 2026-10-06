import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Qibla, SunnahTimes } from "adhan";

export const PRAYERS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type Prayer = (typeof PRAYERS)[number];

export const METHODS = ["MuslimWorldLeague", "UmmAlQura", "Dubai", "Egyptian", "Karachi", "Tehran", "Turkey", "Qatar", "Kuwait", "Singapore", "NorthAmerica", "MoonsightingCommittee"] as const;
export type MethodKey = (typeof METHODS)[number];

export type City = { id: string; lat: number; lon: number; tz: string; method: MethodKey; hanafi?: boolean; names: Record<string, string> };

// Capitals and holy cities with the calculation method commonly used there (always check with your local mosque)
export const CITIES: City[] = [
  { id: "makkah", lat: 21.4225, lon: 39.8262, tz: "Asia/Riyadh", method: "UmmAlQura", names: { en: "Makkah", de: "Mekka", ar: "مكة المكرمة", tr: "Mekke", ur: "مکہ مکرمہ", fa: "مکه", ps: "مکه", ru: "Мекка", bn: "মক্কা", zh: "麦加", fr: "La Mecque", es: "La Meca", id: "Makkah" } },
  { id: "madinah", lat: 24.4672, lon: 39.6111, tz: "Asia/Riyadh", method: "UmmAlQura", names: { en: "Madinah", de: "Medina", ar: "المدينة المنورة", tr: "Medine", ur: "مدینہ منورہ", fa: "مدینه", ps: "مدینه", ru: "Медина", bn: "মদিনা", zh: "麦地那", fr: "Médine", es: "Medina", id: "Madinah" } },
  { id: "dubai", lat: 25.2048, lon: 55.2708, tz: "Asia/Dubai", method: "Dubai", names: { en: "Dubai", de: "Dubai", ar: "دبي", tr: "Dubai", ur: "دبئی", fa: "دبی", ps: "دوبۍ", ru: "Дубай", bn: "দুবাই", zh: "迪拜" } },
  { id: "tehran", lat: 35.6892, lon: 51.389, tz: "Asia/Tehran", method: "Tehran", names: { en: "Tehran", de: "Teheran", ar: "طهران", tr: "Tahran", ur: "تہران", fa: "تهران", ps: "تهران", ru: "Тегеран", bn: "তেহরান", zh: "德黑兰", fr: "Téhéran", es: "Teherán" } },
  { id: "islamabad", lat: 33.6844, lon: 73.0479, tz: "Asia/Karachi", method: "Karachi", hanafi: true, names: { en: "Islamabad", de: "Islamabad", ar: "إسلام آباد", tr: "İslamabad", ur: "اسلام آباد", fa: "اسلام‌آباد", ps: "اسلام اباد", ru: "Исламабад", bn: "ইসলামাবাদ", zh: "伊斯兰堡" } },
  { id: "kabul", lat: 34.5553, lon: 69.2075, tz: "Asia/Kabul", method: "Karachi", hanafi: true, names: { en: "Kabul", de: "Kabul", ar: "كابل", tr: "Kabil", ur: "کابل", fa: "کابل", ps: "کابل", ru: "Кабул", bn: "কাবুল", zh: "喀布尔" } },
  { id: "istanbul", lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul", method: "Turkey", hanafi: true, names: { en: "Istanbul", de: "Istanbul", ar: "إسطنبول", tr: "İstanbul", ur: "استنبول", fa: "استانبول", ps: "استانبول", ru: "Стамбул", bn: "ইস্তানবুল", zh: "伊斯坦布尔" } },
  { id: "cairo", lat: 30.0444, lon: 31.2357, tz: "Africa/Cairo", method: "Egyptian", names: { en: "Cairo", de: "Kairo", ar: "القاهرة", tr: "Kahire", ur: "قاہرہ", fa: "قاهره", ps: "قاهره", ru: "Каир", bn: "কায়রো", zh: "开罗", fr: "Le Caire", es: "El Cairo" } },
  { id: "riyadh", lat: 24.7136, lon: 46.6753, tz: "Asia/Riyadh", method: "UmmAlQura", names: { en: "Riyadh", de: "Riad", ar: "الرياض", tr: "Riyad", ur: "ریاض", fa: "ریاض", ps: "ریاض", ru: "Эр-Рияд", bn: "রিয়াদ", zh: "利雅得" } },
  { id: "doha", lat: 25.2854, lon: 51.531, tz: "Asia/Qatar", method: "Qatar", names: { en: "Doha", de: "Doha", ar: "الدوحة", tr: "Doha", ur: "دوحہ", fa: "دوحه", ps: "دوحه", ru: "Доха", bn: "দোহা", zh: "多哈" } },
  { id: "kuwait", lat: 29.3759, lon: 47.9774, tz: "Asia/Kuwait", method: "Kuwait", names: { en: "Kuwait City", de: "Kuwait-Stadt", ar: "مدينة الكويت", tr: "Kuveyt", ur: "کویت سٹی", fa: "کویت", ps: "کویټ", ru: "Эль-Кувейт", bn: "কুয়েত সিটি", zh: "科威特城" } },
  { id: "baghdad", lat: 33.3152, lon: 44.3661, tz: "Asia/Baghdad", method: "MuslimWorldLeague", names: { en: "Baghdad", de: "Bagdad", ar: "بغداد", tr: "Bağdat", ur: "بغداد", fa: "بغداد", ps: "بغداد", ru: "Багдад", bn: "বাগদাদ", zh: "巴格达" } },
  { id: "dhaka", lat: 23.8103, lon: 90.4125, tz: "Asia/Dhaka", method: "Karachi", hanafi: true, names: { en: "Dhaka", de: "Dhaka", ar: "دكا", tr: "Dakka", ur: "ڈھاکہ", fa: "داکا", ps: "ډاکه", ru: "Дакка", bn: "ঢাকা", zh: "达卡" } },
  { id: "jakarta", lat: -6.2088, lon: 106.8456, tz: "Asia/Jakarta", method: "Singapore", names: { en: "Jakarta", de: "Jakarta", ar: "جاكرتا", tr: "Cakarta", ur: "جکارتہ", fa: "جاکارتا", ps: "جاکارتا", ru: "Джакарта", bn: "জাকার্তা", zh: "雅加达" } },
  { id: "kualalumpur", lat: 3.139, lon: 101.6869, tz: "Asia/Kuala_Lumpur", method: "Singapore", names: { en: "Kuala Lumpur", de: "Kuala Lumpur", ar: "كوالالمبور", tr: "Kuala Lumpur", ur: "کوالا لمپور", fa: "کوالالامپور", ps: "کوالالمپور", ru: "Куала-Лумпур", bn: "কুয়ালালামপুর", zh: "吉隆坡" } },
  { id: "rabat", lat: 34.0209, lon: -6.8416, tz: "Africa/Casablanca", method: "MuslimWorldLeague", names: { en: "Rabat", de: "Rabat", ar: "الرباط", tr: "Rabat", ur: "رباط", fa: "رباط", ps: "رباط", ru: "Рабат", bn: "রাবাত", zh: "拉巴特" } },
  { id: "algiers", lat: 36.7538, lon: 3.0588, tz: "Africa/Algiers", method: "MuslimWorldLeague", names: { en: "Algiers", de: "Algier", ar: "الجزائر", tr: "Cezayir", ur: "الجزائر", fa: "الجزایر", ps: "الجزایر", ru: "Алжир", bn: "আলজিয়ার্স", zh: "阿尔及尔", fr: "Alger", es: "Argel" } },
  { id: "tunis", lat: 36.8065, lon: 10.1815, tz: "Africa/Tunis", method: "MuslimWorldLeague", names: { en: "Tunis", de: "Tunis", ar: "تونس", tr: "Tunus", ur: "تیونس", fa: "تونس", ps: "تونس", ru: "Тунис", bn: "তিউনিস", zh: "突尼斯" } },
  { id: "berlin", lat: 52.52, lon: 13.405, tz: "Europe/Berlin", method: "MuslimWorldLeague", names: { en: "Berlin", de: "Berlin", ar: "برلين", tr: "Berlin", ur: "برلن", fa: "برلین", ps: "برلین", ru: "Берлин", bn: "বার্লিন", zh: "柏林" } },
  { id: "london", lat: 51.5074, lon: -0.1278, tz: "Europe/London", method: "MuslimWorldLeague", names: { en: "London", de: "London", ar: "لندن", tr: "Londra", ur: "لندن", fa: "لندن", ps: "لندن", ru: "Лондон", bn: "লন্ডন", zh: "伦敦", fr: "Londres", es: "Londres" } },
];

export const cityName = (c: City, locale: string) => c.names[locale] ?? c.names.en;

export type Spot = { id: string; lat: number; lon: number; tz: string; method: MethodKey; hanafi?: boolean };

// Personal settings (prayer page): method, Asr school, high-latitude rule and minute corrections per prayer
export type PrayerSettings = { method: "auto" | MethodKey; madhab: "auto" | "shafi" | "hanafi"; highLat: "auto" | "middle" | "seventh" | "twilight"; adjust: Partial<Record<Prayer, number>> };
export const DEFAULT_SETTINGS: PrayerSettings = { method: "auto", madhab: "auto", highLat: "auto", adjust: {} };

function paramsFor(s: Spot, st: PrayerSettings = DEFAULT_SETTINGS) {
  const p = CalculationMethod[st.method === "auto" ? s.method : st.method]();
  p.madhab = (st.madhab === "auto" ? s.hanafi : st.madhab === "hanafi") ? Madhab.Hanafi : Madhab.Shafi;
  const coords = new Coordinates(s.lat, s.lon);
  p.highLatitudeRule = st.highLat === "middle" ? HighLatitudeRule.MiddleOfTheNight : st.highLat === "seventh" ? HighLatitudeRule.SeventhOfTheNight : st.highLat === "twilight" ? HighLatitudeRule.TwilightAngle : HighLatitudeRule.recommended(coords);
  for (const k of PRAYERS) p.adjustments[k] = Math.max(-30, Math.min(30, Number(st.adjust[k] ?? 0)));
  return p;
}

// Local calendar date at the spot (not the viewer's): prayer times must be computed for that day
function localDate(now: Date, tz: string): Date {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(now).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export type Day = { times: Record<Prayer, Date>; next: Prayer; nextAt: Date };

export function dayFor(s: Spot, now: Date, st?: PrayerSettings): Day {
  const coords = new Coordinates(s.lat, s.lon);
  const params = paramsFor(s, st);
  const today = new PrayerTimes(coords, localDate(now, s.tz), params);
  const times = { fajr: today.fajr, sunrise: today.sunrise, dhuhr: today.dhuhr, asr: today.asr, maghrib: today.maghrib, isha: today.isha } as Record<Prayer, Date>;
  const upcoming = PRAYERS.find((p) => times[p].getTime() > now.getTime());
  if (upcoming) return { times, next: upcoming, nextAt: times[upcoming] };
  const tomorrow = new Date(localDate(now, s.tz).getTime() + 86400000 + 3600000);
  const t2 = new PrayerTimes(coords, new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()), params);
  return { times, next: "fajr", nextAt: t2.fajr };
}

export const fmtTime = (d: Date, tz: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false, numberingSystem: "latn" }).format(d);

export function fmtClock(now: Date, tz: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
}

export function hijriDate(now: Date, locale: string, tz = "Asia/Riyadh"): string {
  try {
    return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, { timeZone: tz, day: "numeric", month: "long", year: "numeric" }).format(now);
  } catch {
    return "";
  }
}

export function countdown(to: Date, now: Date): string {
  const s = Math.max(0, Math.floor((to.getTime() - now.getTime()) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

// Qibla: direction to the Kaaba in degrees from true north
export const qiblaOf = (s: Spot) => Qibla(new Coordinates(s.lat, s.lon));

// Sunnah times of the coming night: Islamic midnight and the beginning of the last third (tahajjud)
export function nightOf(s: Spot, now: Date, st?: PrayerSettings) {
  const pt = new PrayerTimes(new Coordinates(s.lat, s.lon), localDate(now, s.tz), paramsFor(s, st));
  const sn = new SunnahTimes(pt);
  return { midnight: sn.middleOfTheNight, lastThird: sn.lastThirdOfTheNight, duha: new Date(pt.sunrise.getTime() + 20 * 60000) };
}

// Timetable for a whole month at the spot
export function monthOf(s: Spot, year: number, month: number, st?: PrayerSettings) {
  const coords = new Coordinates(s.lat, s.lon), params = paramsFor(s, st);
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(year, month, i + 1);
    const pt = new PrayerTimes(coords, d, params);
    return { date: d, times: { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha } as Record<Prayer, Date> };
  });
}
// the local calendar day at the spot as y/m/d
export function spotToday(now: Date, tz: string) { const d = localDate(now, tz); return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() }; }
