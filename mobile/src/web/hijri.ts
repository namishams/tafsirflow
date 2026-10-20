// Hijri (Islamic) calendar helpers on top of Intl (Umm al-Qura calendar; falls back to the tabular calendar in old browsers).
// Days are handled as UTC midnights so that daylight saving never shifts a date.

import { LOCALE_META, type AppLocale } from "./locales";

export type HDate = { y: number; m: number; d: number };
export const DAY = 86_400_000;

export const HIJRI_MONTHS: { ar: string; en: string; de: string }[] = [
  { ar: "مُحَرَّم", en: "Muharram", de: "Muharram" },
  { ar: "صَفَر", en: "Safar", de: "Safar" },
  { ar: "رَبِيع الأَوَّل", en: "Rabi' al-Awwal", de: "Rabiʿ al-Awwal" },
  { ar: "رَبِيع الآخِر", en: "Rabi' al-Akhir", de: "Rabiʿ al-Achir" },
  { ar: "جُمَادَى الأُولَى", en: "Jumada al-Ula", de: "Dschumada al-Ula" },
  { ar: "جُمَادَى الآخِرَة", en: "Jumada al-Akhira", de: "Dschumada al-Achira" },
  { ar: "رَجَب", en: "Rajab", de: "Radschab" },
  { ar: "شَعْبَان", en: "Sha'ban", de: "Schaʿban" },
  { ar: "رَمَضَان", en: "Ramadan", de: "Ramadan" },
  { ar: "شَوَّال", en: "Shawwal", de: "Schawwal" },
  { ar: "ذُو القَعْدَة", en: "Dhul-Qa'dah", de: "Dhul-Qaʿda" },
  { ar: "ذُو الحِجَّة", en: "Dhul-Hijjah", de: "Dhul-Hiddscha" },
];

// The established Hijri month names of each language's Muslim community (German, English and Arabic are in HIJRI_MONTHS)
const MONTHS_OTHER: Partial<Record<AppLocale, string[]>> = {
  tr: ["Muharrem", "Safer", "Rebiülevvel", "Rebiülahir", "Cemaziyelevvel", "Cemaziyelahir", "Recep", "Şaban", "Ramazan", "Şevval", "Zilkade", "Zilhicce"],
  ur: ["محرم", "صفر", "ربیع الاول", "ربیع الثانی", "جمادی الاول", "جمادی الثانی", "رجب", "شعبان", "رمضان", "شوال", "ذوالقعدہ", "ذوالحجہ"],
  fa: ["محرم", "صفر", "ربیع\u200cالاول", "ربیع\u200cالثانی", "جمادی\u200cالاول", "جمادی\u200cالثانی", "رجب", "شعبان", "رمضان", "شوال", "ذی\u200cالقعده", "ذی\u200cالحجه"],
  ps: ["محرم", "صفر", "ربیع الاول", "ربیع الثاني", "جمادی الاول", "جمادی الثاني", "رجب", "شعبان", "رمضان", "شوال", "ذوالقعده", "ذوالحجه"],
  fr: ["Mouharram", "Safar", "Rabi' al-awwal", "Rabi' ath-thani", "Joumada al-oula", "Joumada ath-thania", "Rajab", "Chaâbane", "Ramadan", "Chawwal", "Dhou al-qi'da", "Dhou al-hijja"],
  es: ["Muharram", "Safar", "Rabiʿ al-awwal", "Rabiʿ al-zani", "Yumada al-ula", "Yumada al-zania", "Rayab", "Shaabán", "Ramadán", "Shawwal", "Du-l-Qada", "Du-l-Hiyya"],
  id: ["Muharram", "Safar", "Rabiulawal", "Rabiulakhir", "Jumadilawal", "Jumadilakhir", "Rajab", "Syakban", "Ramadan", "Syawal", "Zulkaidah", "Zulhijah"],
  ms: ["Muharram", "Safar", "Rabiulawal", "Rabiulakhir", "Jamadilawal", "Jamadilakhir", "Rejab", "Syaaban", "Ramadan", "Syawal", "Zulkaedah", "Zulhijjah"],
  bn: ["মুহাররম", "সফর", "রবিউল আউয়াল", "রবিউস সানি", "জমাদিউল আউয়াল", "জমাদিউস সানি", "রজব", "শাবান", "রমজান", "শাওয়াল", "জিলকদ", "জিলহজ"],
  ru: ["Мухаррам", "Сафар", "Рабиъ аль-авваль", "Рабиъ ас-сани", "Джумада аль-уля", "Джумада ас-сания", "Раджаб", "Шаабан", "Рамадан", "Шавваль", "Зуль-каада", "Зуль-хиджа"],
  zh: ["穆哈兰姆月", "色法尔月", "赖比尔·敖外鲁月", "赖比尔·阿色尼月", "主马达·敖外鲁月", "主马达·阿色尼月", "赖哲卜月", "舍尔邦月", "斋月", "绍瓦鲁月", "都尔喀尔德月", "都尔黑哲月"],
};

export function hijriMonthName(m: number, locale: string) {
  const i = (m - 1 + 12) % 12;
  const r = HIJRI_MONTHS[i];
  return locale === "ar" ? r.ar : locale === "de" ? r.de : MONTHS_OTHER[locale as AppLocale]?.[i] ?? r.en;
}

let fmt: Intl.DateTimeFormat | null = null;
let calendarUsed = "islamic-umalqura";
function formatter() {
  if (fmt) return fmt;
  for (const cal of ["islamic-umalqura", "islamic-civil", "islamic"]) {
    try {
      const f = new Intl.DateTimeFormat("en-US", { calendar: cal, numberingSystem: "latn", day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" });
      if (f.resolvedOptions().calendar === cal) { fmt = f; calendarUsed = cal; return f; }
    } catch { /* calendar not supported */ }
  }
  fmt = new Intl.DateTimeFormat("en-US", { calendar: "islamic", numberingSystem: "latn", day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC" });
  calendarUsed = "islamic";
  return fmt;
}
export const hijriCalendarName = () => (formatter(), calendarUsed);

// UTC midnight of a local calendar day
export const utcDay = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);
export function todayUtc(now = new Date()) {
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

const cache = new Map<number, HDate>();
// Gregorian day (UTC midnight ms) → Hijri date
export function toHijri(t: number): HDate {
  const hit = cache.get(t);
  if (hit) return hit;
  const parts = formatter().formatToParts(new Date(t + DAY / 2));
  const get = (type: string) => parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);
  const h = { y: get("year"), m: get("month"), d: get("day") };
  if (cache.size > 4000) cache.clear();
  cache.set(t, h);
  return h;
}

const EPOCH = Date.UTC(622, 6, 19); // 1 Muharram 1 AH (proleptic Gregorian, approximate)
const ord = (h: HDate) => (h.y - 1) * 354.367 + (h.m - 1) * 29.5306 + h.d;

// Hijri date → Gregorian day (UTC midnight ms), found by estimating and then scanning day by day; null if the day does not exist
export function fromHijri(y: number, m: number, d: number): number | null {
  if (d < 1 || d > 30 || m < 1 || m > 12) return null;
  let t = EPOCH + Math.round(ord({ y, m, d }) - 1) * DAY;
  for (let i = 0; i < 6; i++) {
    const h = toHijri(t);
    if (h.y === y && h.m === m && h.d === d) return t;
    const diff = Math.round(ord({ y, m, d }) - ord(h));
    if (diff === 0) break;
    t += diff * DAY;
  }
  for (let k = -3; k <= 3; k++) {
    const h = toHijri(t + k * DAY);
    if (h.y === y && h.m === m && h.d === d) return t + k * DAY;
  }
  return null;
}

export const addMonths = (y: number, m: number, delta: number) => {
  const i = y * 12 + (m - 1) + delta;
  return { y: Math.floor(i / 12), m: (i % 12) + 1 };
};

export function monthLength(y: number, m: number) {
  const a = fromHijri(y, m, 1);
  const n = addMonths(y, m, 1);
  const b = fromHijri(n.y, n.m, 1);
  return a !== null && b !== null ? Math.round((b - a) / DAY) : 30;
}

export type Cell = { t: number; h: number };
// Weeks of a Hijri month; weekStart 0 = Sunday, 1 = Monday … 6 = Saturday
export function monthGrid(y: number, m: number, weekStart: number) {
  const first = fromHijri(y, m, 1) ?? todayUtc();
  const len = monthLength(y, m);
  const lead = (new Date(first).getUTCDay() - weekStart + 7) % 7;
  const cells: (Cell | null)[] = Array.from({ length: lead }, () => null);
  for (let i = 0; i < len; i++) cells.push({ t: first + i * DAY, h: i + 1 });
  while (cells.length % 7) cells.push(null);
  return { first, len, cells };
}

export const daysBetween = (a: number, b: number) => Math.round((b - a) / DAY);

// Next Gregorian date (UTC ms) of a Hijri day on or after `from`
export function nextOccurrence(m: number, d: number, from: number) {
  const h = toHijri(from);
  for (const y of [h.y, h.y + 1]) {
    const t = fromHijri(y, m, d) ?? fromHijri(y, m, d - 1);
    if (t !== null && t >= from) return { t, y };
  }
  return null;
}

// Gregorian formatting in the reader's language with Latin digits (explicit gregory calendar: "ar" alone may default to Hijri)
export function fmtGregorian(t: number, locale: string, opts: Intl.DateTimeFormatOptions) {
  const loc = locale === "de" ? "de-DE" : locale === "en" || !(locale in LOCALE_META) ? "en-GB" : locale;
  return new Intl.DateTimeFormat(loc, { ...opts, calendar: "gregory", numberingSystem: "latn", timeZone: "UTC" }).format(new Date(t));
}
// Era mark after the year, as written in each language ("AH" = anno Hegirae)
const ERA: Partial<Record<AppLocale, string>> = { ar: "هـ", tr: "H.", ur: "ہجری", fa: "هـ.ق", ps: "هـ.ق", fr: "AH", es: "AH", id: "H", ms: "H", bn: "হিজরি", ru: "г. х." };
export function fmtHijri(h: HDate, locale: string) {
  const name = hijriMonthName(h.m, locale);
  if (locale === "zh") return `回历 ${h.y} 年${name} ${h.d} 日`;
  return `${h.d} ${name} ${h.y} ${ERA[locale as AppLocale] ?? "AH"}`;
}

// ---- important days ----
export type HEvent = { id: string; m: number; d: number; link?: "/islam/ramadan" | "/islam/eid" | "/islam/prophet" };
export const EVENTS: HEvent[] = [
  { id: "newyear", m: 1, d: 1, link: "/islam/prophet" },
  { id: "ashura", m: 1, d: 10, link: "/islam/eid" },
  { id: "mawlid", m: 3, d: 12, link: "/islam/prophet" },
  { id: "isra", m: 7, d: 27, link: "/islam/prophet" },
  { id: "shaban", m: 8, d: 15, link: "/islam/ramadan" },
  { id: "ramadan", m: 9, d: 1, link: "/islam/ramadan" },
  { id: "lastten", m: 9, d: 21, link: "/islam/ramadan" },
  { id: "qadr", m: 9, d: 27, link: "/islam/ramadan" },
  { id: "fitr", m: 10, d: 1, link: "/islam/eid" },
  { id: "arafah", m: 12, d: 9, link: "/islam/eid" },
  { id: "adha", m: 12, d: 10, link: "/islam/eid" },
];

type Ev = { name: string; desc: string; note?: string };
type CalText = { [k: string]: string | Record<string, Ev>; ev: Record<string, Ev> };
const CAL: Record<AppLocale, CalText> = {
  de: {
    metaTitle: "Islamischer Kalender – Hidschri-Datum heute und wichtige Tage",
    metaDesc: "Das heutige islamische Datum, ein Hidschri-Monatskalender mit gregorianischen Daten, Countdown zu Ramadan, Eid und Arafa sowie ein Datumsrechner.",
    kicker: "Hidschri-Kalender",
    title: "Islamischer Kalender",
    lead: "Die Monate des Islam folgen dem Mond. Hier siehst du das heutige islamische Datum, den ganzen Monat mit den gregorianischen Tagen und wie viele Tage es noch bis Ramadan, Eid und Arafa sind.",
    heroRef: "Koran 2:189",
    today: "Heute",
    todayIs: "Heute ist",
    sunset: "Der islamische Tag beginnt mit dem Sonnenuntergang (Maghrib) – ab dann gilt schon das nächste Datum.",
    prev: "Vorheriger Monat",
    next: "Nächster Monat",
    backToday: "Zum heutigen Monat",
    friday: "Freitag – Tag des Freitagsgebets",
    white: "Die weißen Tage (13.–15.): beliebte Tage für freiwilliges Fasten",
    legendToday: "heute",
    legendEvent: "besonderer Tag",
    legendWhite: "weiße Tage",
    thisMonth: "In diesem Monat",
    upcoming: "Die nächsten wichtigen Tage",
    inDays: "in {n} Tagen",
    tomorrow: "morgen",
    todayCount: "heute",
    more: "Mehr dazu",
    noteTitle: "Mondsichtung",
    note: "Die Daten folgen dem Umm-al-Qura-Kalender. Weil viele Länder und Gemeinden den Monatsbeginn nach der Sichtung des Neumonds festlegen, kann das tatsächliche Datum um einen Tag abweichen. Richte dich nach der Ankündigung deiner Moschee oder deines Landes.",
    nightNote: "Die Nacht beginnt am Abend davor, mit dem Sonnenuntergang.",
    conv: "Datumsrechner",
    convG: "Gregorianisch → Hidschri",
    convH: "Hidschri → Gregorianisch",
    day: "Tag",
    month: "Monat",
    year: "Jahr",
    invalid: "Diesen Tag gibt es in diesem Monat nicht.",
    days: "{n} Tage",
    ev: {
      newyear: { name: "Islamisches Neujahr", desc: "1. Muharram – Beginn des Hidschri-Jahres, gezählt ab der Auswanderung des Propheten ﷺ nach Medina." },
      ashura: { name: "ʿAschura", desc: "10. Muharram – der Tag, an dem Allah Musa und sein Volk errettete. Viele fasten an diesem Tag, dazu auch am 9." },
      mawlid: { name: "Geburt des Propheten ﷺ (Mawlid)", desc: "12. Rabiʿ al-Awwal – häufig genanntes Datum der Geburt des Propheten ﷺ.", note: "Nicht alle Muslime begehen diesen Tag, und die Gelehrten nennen verschiedene Daten." },
      isra: { name: "Isra und Miʿradsch", desc: "27. Radschab – die Nachtreise nach Jerusalem und die Himmelfahrt.", note: "Dieses Datum wird oft genannt, ist aber nicht sicher überliefert." },
      shaban: { name: "Mitte Schaʿban", desc: "15. Schaʿban – die Nacht zur Mitte des Monats vor Ramadan.", note: "Über besondere Handlungen in dieser Nacht gibt es unterschiedliche Ansichten." },
      ramadan: { name: "Beginn des Ramadan", desc: "1. Ramadan – der erste Fastentag im Monat, in dem der Koran herabgesandt wurde." },
      lastten: { name: "Die letzten zehn Nächte", desc: "Ab dem 21. Ramadan – die gesegnetsten Nächte des Jahres." },
      qadr: { name: "27. Ramadan", desc: "Eine der ungeraden Nächte: Laylat al-Qadr wird in den ungeraden der letzten zehn Nächte gesucht." },
      fitr: { name: "Eid al-Fitr", desc: "1. Schawwal – das Fest des Fastenbrechens." },
      arafah: { name: "Tag von Arafa", desc: "9. Dhul-Hiddscha – der Höhepunkt der Pilgerfahrt; wer nicht pilgert, fastet gern an diesem Tag." },
      adha: { name: "Eid al-Adha", desc: "10. Dhul-Hiddscha – das Opferfest." },
    },
  },
  en: {
    metaTitle: "Islamic calendar – today's Hijri date and important days",
    metaDesc: "Today's Islamic date, a Hijri month calendar with Gregorian dates, countdowns to Ramadan, Eid and Arafah, and a date converter.",
    kicker: "Hijri calendar",
    title: "Islamic calendar",
    lead: "The months of Islam follow the moon. Here you see today's Islamic date, the whole month with its Gregorian days, and how many days remain until Ramadan, Eid and Arafah.",
    heroRef: "Quran 2:189",
    today: "Today",
    todayIs: "Today is",
    sunset: "The Islamic day begins at sunset (Maghrib) – from then on the next date applies.",
    prev: "Previous month",
    next: "Next month",
    backToday: "Back to this month",
    friday: "Friday – the day of the Friday prayer",
    white: "The white days (13th–15th): favoured days for voluntary fasting",
    legendToday: "today",
    legendEvent: "special day",
    legendWhite: "white days",
    thisMonth: "This month",
    upcoming: "The next important days",
    inDays: "in {n} days",
    tomorrow: "tomorrow",
    todayCount: "today",
    more: "Read more",
    noteTitle: "Moon sighting",
    note: "Dates follow the Umm al-Qura calendar. Because many countries and communities begin the month when the new crescent is sighted, the actual date can differ by a day. Follow the announcement of your mosque or country.",
    nightNote: "The night begins the evening before, at sunset.",
    conv: "Date converter",
    convG: "Gregorian → Hijri",
    convH: "Hijri → Gregorian",
    day: "Day",
    month: "Month",
    year: "Year",
    invalid: "This day does not exist in that month.",
    days: "{n} days",
    ev: {
      newyear: { name: "Islamic New Year", desc: "1 Muharram – the start of the Hijri year, counted from the Prophet's ﷺ emigration to Madinah." },
      ashura: { name: "Ashura", desc: "10 Muharram – the day Allah saved Musa and his people. Many fast on this day, together with the 9th." },
      mawlid: { name: "Birth of the Prophet ﷺ (Mawlid)", desc: "12 Rabi' al-Awwal – the commonly given date of the Prophet's ﷺ birth.", note: "Not all Muslims celebrate this day, and scholars give different dates." },
      isra: { name: "Isra and Mi'raj", desc: "27 Rajab – the night journey to Jerusalem and the ascension.", note: "This date is commonly given but not certain." },
      shaban: { name: "Middle of Sha'ban", desc: "15 Sha'ban – the night in the middle of the month before Ramadan.", note: "Views differ on special acts of worship on this night." },
      ramadan: { name: "Start of Ramadan", desc: "1 Ramadan – the first day of fasting in the month in which the Quran was revealed." },
      lastten: { name: "The last ten nights", desc: "From 21 Ramadan – the most blessed nights of the year." },
      qadr: { name: "27 Ramadan", desc: "One of the odd nights: Laylat al-Qadr is sought in the odd nights of the last ten." },
      fitr: { name: "Eid al-Fitr", desc: "1 Shawwal – the festival of breaking the fast." },
      arafah: { name: "Day of Arafah", desc: "9 Dhul-Hijjah – the high point of the Hajj; those not on Hajj like to fast this day." },
      adha: { name: "Eid al-Adha", desc: "10 Dhul-Hijjah – the festival of sacrifice." },
    },
  },
  ar: {
    metaTitle: "التقويم الهجري – تاريخ اليوم والأيام المهمة",
    metaDesc: "التاريخ الهجري اليوم، وتقويم شهري هجري مع التواريخ الميلادية، وعدّ تنازلي لرمضان والعيد ويوم عرفة، ومحوّل للتاريخ.",
    kicker: "التقويم الهجري",
    title: "التقويم الهجري",
    lead: "شهور الإسلام قمرية. هنا ترى تاريخ اليوم الهجري، والشهر كاملًا مع الأيام الميلادية، وكم بقي من الأيام حتى رمضان والعيد ويوم عرفة.",
    heroRef: "البقرة: 189",
    today: "اليوم",
    todayIs: "اليوم",
    sunset: "يبدأ اليوم في التقويم الهجري بغروب الشمس (المغرب)، ومن حينها يبدأ التاريخ التالي.",
    prev: "الشهر السابق",
    next: "الشهر التالي",
    backToday: "العودة إلى الشهر الحالي",
    friday: "الجمعة، يوم صلاة الجمعة",
    white: "الأيام البيض (13 و14 و15): يُستحب صيامها تطوعًا",
    legendToday: "اليوم",
    legendEvent: "يوم مميز",
    legendWhite: "الأيام البيض",
    thisMonth: "في هذا الشهر",
    upcoming: "الأيام المهمة القادمة",
    inDays: "بعد {n} يومًا",
    tomorrow: "غدًا",
    todayCount: "اليوم",
    more: "اقرأ المزيد",
    noteTitle: "رؤية الهلال",
    note: "التواريخ وفق تقويم أم القرى. ولأن كثيرًا من البلدان والجاليات تبدأ الشهر برؤية الهلال، فقد يختلف التاريخ الفعلي بيوم. اتبع إعلان مسجدك أو بلدك.",
    nightNote: "تبدأ الليلة مساء اليوم السابق عند غروب الشمس.",
    conv: "محوّل التاريخ",
    convG: "ميلادي ← هجري",
    convH: "هجري ← ميلادي",
    day: "اليوم",
    month: "الشهر",
    year: "السنة",
    invalid: "هذا اليوم غير موجود في ذلك الشهر.",
    days: "{n} يومًا",
    ev: {
      newyear: { name: "رأس السنة الهجرية", desc: "1 محرم: بداية العام الهجري، ويُؤرَّخ بهجرة النبي ﷺ إلى المدينة." },
      ashura: { name: "عاشوراء", desc: "10 محرم: اليوم الذي نجّى الله فيه موسى وقومه. يصومه كثيرون ومعه التاسع." },
      mawlid: { name: "المولد النبوي", desc: "12 ربيع الأول: التاريخ الشائع لمولد النبي ﷺ.", note: "لا يحتفل به جميع المسلمين، وللعلماء أقوال مختلفة في تاريخه." },
      isra: { name: "الإسراء والمعراج", desc: "27 رجب: رحلة الإسراء إلى بيت المقدس والمعراج.", note: "هذا التاريخ مشهور لكنه غير مقطوع به." },
      shaban: { name: "منتصف شعبان", desc: "15 شعبان: ليلة النصف من الشهر الذي يسبق رمضان.", note: "للعلماء آراء مختلفة في تخصيص هذه الليلة بعبادات معينة." },
      ramadan: { name: "بداية رمضان", desc: "1 رمضان: أول أيام الصيام في الشهر الذي أُنزل فيه القرآن." },
      lastten: { name: "العشر الأواخر", desc: "من 21 رمضان: أفضل ليالي العام." },
      qadr: { name: "27 رمضان", desc: "من الليالي الوتر، وتُلتمس ليلة القدر في الوتر من العشر الأواخر." },
      fitr: { name: "عيد الفطر", desc: "1 شوال: عيد الفطر المبارك." },
      arafah: { name: "يوم عرفة", desc: "9 ذو الحجة: ركن الحج الأعظم، ويُستحب صيامه لغير الحاج." },
      adha: { name: "عيد الأضحى", desc: "10 ذو الحجة: عيد الأضحى المبارك." },
    },
  },
  tr: {
    metaTitle: "İslamî takvim – bugünün hicrî tarihi ve önemli günler",
    metaDesc: "Bugünün İslamî tarihi, miladî günlerle birlikte hicrî ay takvimi, Ramazan, bayram ve Arefe'ye geri sayım ve tarih dönüştürücü.",
    kicker: "Hicrî takvim",
    title: "İslamî takvim",
    lead: "İslam'ın ayları Ay'a göre ilerler. Burada bugünün İslamî tarihini, tüm ayı miladî günleriyle ve Ramazan, bayram ve Arefe'ye kaç gün kaldığını görürsünüz.",
    heroRef: "Kur'an 2:189",
    today: "Bugün",
    todayIs: "Bugün",
    sunset: "İslamî gün gün batımıyla (akşam namazı vakti) başlar – o andan itibaren bir sonraki tarih geçerlidir.",
    prev: "Önceki ay",
    next: "Sonraki ay",
    backToday: "Bu aya dön",
    friday: "Cuma – cuma namazı günü",
    white: "Beyaz günler (13.–15.): nafile oruç için sevilen günler",
    legendToday: "bugün",
    legendEvent: "özel gün",
    legendWhite: "beyaz günler",
    thisMonth: "Bu ayda",
    upcoming: "Yaklaşan önemli günler",
    inDays: "{n} gün sonra",
    tomorrow: "yarın",
    todayCount: "bugün",
    more: "Daha fazlası",
    noteTitle: "Hilal gözlemi",
    note: "Tarihler Ümmü'l-Kurâ takvimini izler. Pek çok ülke ve cemaat ayın başlangıcını yeni hilalin görülmesine göre belirlediğinden gerçek tarih bir gün farklı olabilir. Camiinizin veya ülkenizin duyurusuna uyun.",
    nightNote: "Gece, bir önceki akşam gün batımıyla başlar.",
    conv: "Tarih dönüştürücü",
    convG: "Miladî → Hicrî",
    convH: "Hicrî → Miladî",
    day: "Gün",
    month: "Ay",
    year: "Yıl",
    invalid: "Bu ayda böyle bir gün yok.",
    days: "{n} gün",
    ev: {
      newyear: { name: "Hicrî yılbaşı", desc: "1 Muharrem – Hicrî yılın başlangıcı; yıllar Peygamber'in ﷺ Medine'ye hicretinden itibaren sayılır." },
      ashura: { name: "Âşûrâ", desc: "10 Muharrem – Allah'ın Musa'yı ve kavmini kurtardığı gün. Birçok kişi bu günde, 9. günle birlikte oruç tutar." },
      mawlid: { name: "Peygamber'in ﷺ doğumu (Mevlid)", desc: "12 Rebiülevvel – Peygamber'in ﷺ doğumu için sık anılan tarih.", note: "Her Müslüman bu günü anmaz ve âlimler farklı tarihler verir." },
      isra: { name: "İsrâ ve Mîrâc", desc: "27 Recep – Kudüs'e gece yolculuğu ve göğe yükseliş.", note: "Bu tarih sık anılır ancak kesin değildir." },
      shaban: { name: "Şaban'ın ortası", desc: "15 Şaban – Ramazan'dan önceki ayın ortasındaki gece.", note: "Bu gecede özel ibadetler konusunda görüşler farklıdır." },
      ramadan: { name: "Ramazan'ın başlangıcı", desc: "1 Ramazan – Kur'an'ın indirildiği ayın ilk oruç günü." },
      lastten: { name: "Son on gece", desc: "21 Ramazan'dan itibaren – yılın en bereketli geceleri." },
      qadr: { name: "27 Ramazan", desc: "Tek gecelerden biri: Kadir Gecesi, son on gecenin tek gecelerinde aranır." },
      fitr: { name: "Ramazan Bayramı (Fıtır)", desc: "1 Şevval – orucun bitişini kutlayan bayram." },
      arafah: { name: "Arefe (Arafat günü)", desc: "9 Zilhicce – haccın zirvesi; hacda olmayanlar bu günde oruç tutmayı sever." },
      adha: { name: "Kurban Bayramı (Adha)", desc: "10 Zilhicce – kurban bayramı." },
    },
  },
  ur: {
    metaTitle: "اسلامی کیلنڈر – آج کی ہجری تاریخ اور اہم دن",
    metaDesc: "آج کی اسلامی تاریخ، عیسوی تاریخوں کے ساتھ ہجری مہینے کا کیلنڈر، رمضان، عید اور یومِ عرفہ تک الٹی گنتی، اور تاریخ بدلنے والا ٹول۔",
    kicker: "ہجری کیلنڈر",
    title: "اسلامی کیلنڈر",
    lead: "اسلام کے مہینے چاند کے مطابق چلتے ہیں۔ یہاں آپ آج کی اسلامی تاریخ، پورا مہینہ عیسوی دنوں کے ساتھ، اور رمضان، عید اور یومِ عرفہ میں باقی دن دیکھتے ہیں۔",
    heroRef: "قرآن 2:189",
    today: "آج",
    todayIs: "آج",
    sunset: "اسلامی دن غروبِ آفتاب (مغرب) سے شروع ہوتا ہے – اس وقت سے اگلی تاریخ شروع ہو جاتی ہے۔",
    prev: "پچھلا مہینہ",
    next: "اگلا مہینہ",
    backToday: "موجودہ مہینے پر واپس",
    friday: "جمعہ – نمازِ جمعہ کا دن",
    white: "ایامِ بیض (13 تا 15): نفلی روزوں کے لیے پسندیدہ دن",
    legendToday: "آج",
    legendEvent: "خاص دن",
    legendWhite: "ایامِ بیض",
    thisMonth: "اس مہینے میں",
    upcoming: "آنے والے اہم دن",
    inDays: "{n} دن بعد",
    tomorrow: "کل",
    todayCount: "آج",
    more: "مزید پڑھیں",
    noteTitle: "چاند کی رویت",
    note: "تاریخیں اُمّ القریٰ کیلنڈر کے مطابق ہیں۔ چونکہ بہت سے ممالک اور برادریاں مہینے کا آغاز نئے چاند کی رویت سے کرتی ہیں، اس لیے اصل تاریخ ایک دن مختلف ہو سکتی ہے۔ اپنی مسجد یا اپنے ملک کے اعلان کی پیروی کریں۔",
    nightNote: "رات پچھلی شام غروبِ آفتاب سے شروع ہوتی ہے۔",
    conv: "تاریخ بدلنے کا ٹول",
    convG: "عیسوی ← ہجری",
    convH: "ہجری ← عیسوی",
    day: "دن",
    month: "مہینہ",
    year: "سال",
    invalid: "اس مہینے میں یہ دن نہیں ہوتا۔",
    days: "{n} دن",
    ev: {
      newyear: { name: "اسلامی نیا سال", desc: "1 محرم – ہجری سال کا آغاز، جو نبی ﷺ کی مدینہ کی طرف ہجرت سے گنا جاتا ہے۔" },
      ashura: { name: "یومِ عاشوراء", desc: "10 محرم – وہ دن جب اللہ نے موسیٰ اور ان کی قوم کو نجات دی۔ بہت سے لوگ اس دن اور اس کے ساتھ 9 محرم کا روزہ رکھتے ہیں۔" },
      mawlid: { name: "ولادتِ نبوی ﷺ (میلاد)", desc: "12 ربیع الاول – نبی ﷺ کی ولادت کی عام طور پر بیان کی جانے والی تاریخ۔", note: "تمام مسلمان اس دن کو نہیں مناتے، اور علماء مختلف تاریخیں بیان کرتے ہیں۔" },
      isra: { name: "اسراء اور معراج", desc: "27 رجب – بیت المقدس کی طرف رات کا سفر اور آسمانوں کی طرف عروج۔", note: "یہ تاریخ عام طور پر بیان کی جاتی ہے لیکن یقینی نہیں۔" },
      shaban: { name: "نصف شعبان", desc: "15 شعبان – رمضان سے پہلے والے مہینے کے وسط کی رات۔", note: "اس رات خاص عبادات کے بارے میں آراء مختلف ہیں۔" },
      ramadan: { name: "رمضان کا آغاز", desc: "1 رمضان – اس مہینے کا پہلا روزہ جس میں قرآن نازل ہوا۔" },
      lastten: { name: "آخری دس راتیں", desc: "21 رمضان سے – سال کی سب سے بابرکت راتیں۔" },
      qadr: { name: "27 رمضان", desc: "طاق راتوں میں سے ایک: لیلۃ القدر آخری دس راتوں کی طاق راتوں میں تلاش کی جاتی ہے۔" },
      fitr: { name: "عید الفطر", desc: "1 شوال – روزے کھولنے کا تہوار۔" },
      arafah: { name: "یومِ عرفہ", desc: "9 ذوالحجہ – حج کا عروج؛ جو حج پر نہیں ہوتے وہ اس دن روزہ رکھنا پسند کرتے ہیں۔" },
      adha: { name: "عید الاضحیٰ", desc: "10 ذوالحجہ – قربانی کا تہوار۔" },
    },
  },
  fa: {
    metaTitle: "تقویم اسلامی – تاریخ هجری امروز و روزهای مهم",
    metaDesc: "تاریخ اسلامی امروز، تقویم ماهانه هجری با تاریخ‌های میلادی، شمارش معکوس تا رمضان، عید و عرفه و مبدل تاریخ.",
    kicker: "تقویم هجری",
    title: "تقویم اسلامی",
    lead: "ماه‌های اسلامی از ماه پیروی می‌کنند. اینجا تاریخ اسلامی امروز، کل ماه را با روزهای میلادی و تعداد روزهای باقی‌مانده تا رمضان، عید و عرفه می‌بینید.",
    heroRef: "قرآن 2:189",
    today: "امروز",
    todayIs: "امروز",
    sunset: "روز اسلامی با غروب خورشید (مغرب) آغاز می‌شود – از آن زمان تاریخ بعدی معتبر است.",
    prev: "ماه قبل",
    next: "ماه بعد",
    backToday: "بازگشت به ماه جاری",
    friday: "جمعه – روز نماز جمعه",
    white: "ایام‌البیض (13 تا 15): روزهای محبوب برای روزه مستحبی",
    legendToday: "امروز",
    legendEvent: "روز ویژه",
    legendWhite: "ایام‌البیض",
    thisMonth: "در این ماه",
    upcoming: "روزهای مهم پیش رو",
    inDays: "{n} روز دیگر",
    tomorrow: "فردا",
    todayCount: "امروز",
    more: "بیشتر بخوانید",
    noteTitle: "رؤیت هلال",
    note: "تاریخ‌ها از تقویم ام‌القری پیروی می‌کنند. چون بسیاری از کشورها و جوامع آغاز ماه را با رؤیت هلال تعیین می‌کنند، تاریخ واقعی ممکن است یک روز تفاوت داشته باشد. از اعلام مسجد یا کشور خود پیروی کنید.",
    nightNote: "شب از عصر روز قبل، هنگام غروب خورشید، آغاز می‌شود.",
    conv: "مبدل تاریخ",
    convG: "میلادی ← هجری",
    convH: "هجری ← میلادی",
    day: "روز",
    month: "ماه",
    year: "سال",
    invalid: "این روز در آن ماه وجود ندارد.",
    days: "{n} روز",
    ev: {
      newyear: { name: "آغاز سال هجری", desc: "1 محرم – آغاز سال هجری که از هجرت پیامبر ﷺ به مدینه شمرده می‌شود." },
      ashura: { name: "عاشورا", desc: "10 محرم – روزی که خداوند موسی و قومش را نجات داد. بسیاری در این روز و همراه با روز نهم روزه می‌گیرند." },
      mawlid: { name: "ولادت پیامبر ﷺ (مولود)", desc: "12 ربیع‌الاول – تاریخ رایج برای ولادت پیامبر ﷺ.", note: "همه مسلمانان این روز را گرامی نمی‌دارند و عالمان تاریخ‌های گوناگونی ذکر کرده‌اند." },
      isra: { name: "اسراء و معراج", desc: "27 رجب – سفر شبانه به بیت‌المقدس و عروج به آسمان‌ها.", note: "این تاریخ رایج است اما قطعی نیست." },
      shaban: { name: "نیمه شعبان", desc: "15 شعبان – شب میانه ماه پیش از رمضان.", note: "درباره عبادت‌های ویژه این شب دیدگاه‌ها متفاوت است." },
      ramadan: { name: "آغاز رمضان", desc: "1 رمضان – نخستین روز روزه در ماهی که قرآن در آن نازل شد." },
      lastten: { name: "ده شب آخر", desc: "از 21 رمضان – پربرکت‌ترین شب‌های سال." },
      qadr: { name: "27 رمضان", desc: "یکی از شب‌های فرد: شب قدر در شب‌های فرد ده شب آخر جست‌وجو می‌شود." },
      fitr: { name: "عید فطر", desc: "1 شوال – جشن پایان روزه." },
      arafah: { name: "روز عرفه", desc: "9 ذی‌الحجه – اوج حج؛ کسانی که در حج نیستند دوست دارند این روز را روزه بگیرند." },
      adha: { name: "عید قربان", desc: "10 ذی‌الحجه – جشن قربانی." },
    },
  },
  ps: {
    metaTitle: "اسلامي کالیزه – د نن ورځې هجري نیټه او مهمې ورځې",
    metaDesc: "د نن ورځې اسلامي نیټه، د میلادي نیټو سره د هجري میاشتې کالیزه، تر رمضان، اختر او د عرفې ورځې پورې معکوس شمېرنه، او د نیټې بدلونکی.",
    kicker: "هجري کالیزه",
    title: "اسلامي کالیزه",
    lead: "د اسلام میاشتې د سپوږمۍ تابعې دي. دلته تاسو د نن ورځې اسلامي نیټه، ټوله میاشت د میلادي ورځو سره، او تر رمضان، اختر او د عرفې ورځې پورې پاتې ورځې وینئ.",
    heroRef: "قرآن 2:189",
    today: "نن",
    todayIs: "نن",
    sunset: "اسلامي ورځ د لمر لویدو (ماښام) سره پیلیږي – له هغه وخته راهیسې راتلونکې نیټه ده.",
    prev: "تېره میاشت",
    next: "راتلونکې میاشت",
    backToday: "اوسنۍ میاشتې ته بیرته",
    friday: "جمعه – د جمعې لمانځه ورځ",
    white: "ایام البیض (13 – 15): د نفلي روژې لپاره خوښې ورځې",
    legendToday: "نن",
    legendEvent: "ځانګړې ورځ",
    legendWhite: "ایام البیض",
    thisMonth: "پدې میاشت کې",
    upcoming: "راتلونکې مهمې ورځې",
    inDays: "{n} ورځې وروسته",
    tomorrow: "سبا",
    todayCount: "نن",
    more: "نور ولولئ",
    noteTitle: "د سپوږمۍ لیدنه",
    note: "نیټې د ام القرى د کالیزې تابعې دي. ځکه چې ډېر هېوادونه او ټولنې د میاشتې پیل د نوې سپوږمۍ په لیدلو ټاکي، ریښتینې نیټه کېدای شي یوه ورځ توپیر ولري. د خپل جومات یا هېواد اعلان تعقیب کړئ.",
    nightNote: "شپه د مخکینۍ ماښام له لمر لویدو سره پیلیږي.",
    conv: "د نیټې بدلونکی",
    convG: "میلادي ← هجري",
    convH: "هجري ← میلادي",
    day: "ورځ",
    month: "میاشت",
    year: "کال",
    invalid: "دا ورځ په هغه میاشت کې نشته.",
    days: "{n} ورځې",
    ev: {
      newyear: { name: "اسلامي نوی کال", desc: "1 محرم – د هجري کال پیل، چې د پیغمبر ﷺ له مدینې ته د هجرت راهیسې شمېرل کېږي." },
      ashura: { name: "عاشورا", desc: "10 محرم – هغه ورځ چې الله موسی او د هغه قوم وژغورل. ډېری خلک پدې ورځ، له نهمې سره، روژه نیسي." },
      mawlid: { name: "د پیغمبر ﷺ زېږدنه (مولود)", desc: "12 ربیع الاول – د پیغمبر ﷺ د زېږېدو په اړه عامه ټاکل شوې نیټه.", note: "ټول مسلمانان دا ورځ نه لمانځي، او عالمان بېلابېلې نیټې وايي." },
      isra: { name: "اسراء او معراج", desc: "27 رجب – بیت المقدس ته شپنی سفر او آسمانونو ته پورته کېدل.", note: "دا نیټه ډېره یادېږي خو یقیني نه ده." },
      shaban: { name: "د شعبان نیمایي", desc: "15 شعبان – د رمضان نه مخکې د میاشتې د نیمایي شپه.", note: "پدې شپه د ځانګړو عبادتونو په اړه نظرونه توپیر لري." },
      ramadan: { name: "د رمضان پیل", desc: "1 رمضان – په هغه میاشت کې د روژې لومړۍ ورځ چې قرآن پکې نازل شو." },
      lastten: { name: "وروستۍ لس شپې", desc: "له 21 رمضان څخه – د کال تر ټولو مبارکې شپې." },
      qadr: { name: "27 رمضان", desc: "له طاقو شپو څخه یوه: شپه قدر د وروستیو لسو شپو په طاقو شپو کې لټول کېږي." },
      fitr: { name: "کوچنی اختر (عید الفطر)", desc: "1 شوال – د روژې ماتولو اختر." },
      arafah: { name: "د عرفې ورځ", desc: "9 ذوالحجه – د حج لوړه څوکه؛ څوک چې په حج نه وي پدې ورځ روژه نیول خوښوي." },
      adha: { name: "لوی اختر (عید الاضحی)", desc: "10 ذوالحجه – د قربانۍ اختر." },
    },
  },
  fr: {
    metaTitle: "Calendrier islamique – date hégirienne du jour et jours importants",
    metaDesc: "La date islamique du jour, un calendrier hégirien mensuel avec les dates grégoriennes, des comptes à rebours jusqu'au Ramadan, à l'Aïd et à Arafat, et un convertisseur de dates.",
    kicker: "Calendrier hégirien",
    title: "Calendrier islamique",
    lead: "Les mois de l'islam suivent la lune. Tu vois ici la date islamique du jour, le mois entier avec ses jours grégoriens et le nombre de jours qui restent jusqu'au Ramadan, à l'Aïd et à Arafat.",
    heroRef: "Coran 2:189",
    today: "Aujourd'hui",
    todayIs: "Aujourd'hui",
    sunset: "Le jour islamique commence au coucher du soleil (Maghrib) – à partir de là, c'est déjà la date suivante.",
    prev: "Mois précédent",
    next: "Mois suivant",
    backToday: "Retour au mois en cours",
    friday: "Vendredi – le jour de la prière du vendredi",
    white: "Les jours blancs (13–15) : jours appréciés pour le jeûne surérogatoire",
    legendToday: "aujourd'hui",
    legendEvent: "jour particulier",
    legendWhite: "jours blancs",
    thisMonth: "Ce mois-ci",
    upcoming: "Les prochains jours importants",
    inDays: "dans {n} jours",
    tomorrow: "demain",
    todayCount: "aujourd'hui",
    more: "En savoir plus",
    noteTitle: "Observation de la lune",
    note: "Les dates suivent le calendrier Umm al-Qura. Comme de nombreux pays et communautés commencent le mois à l'observation du nouveau croissant, la date réelle peut différer d'un jour. Suis l'annonce de ta mosquée ou de ton pays.",
    nightNote: "La nuit commence la veille au soir, au coucher du soleil.",
    conv: "Convertisseur de dates",
    convG: "Grégorien → hégirien",
    convH: "Hégirien → grégorien",
    day: "Jour",
    month: "Mois",
    year: "Année",
    invalid: "Ce jour n'existe pas dans ce mois.",
    days: "{n} jours",
    ev: {
      newyear: { name: "Nouvel An hégirien", desc: "1 Mouharram – début de l'année de l'Hégire, comptée à partir de l'émigration du Prophète ﷺ à Médine." },
      ashura: { name: "Achoura", desc: "10 Mouharram – le jour où Allah a sauvé Moussa et son peuple. Beaucoup jeûnent ce jour-là, avec le 9." },
      mawlid: { name: "Naissance du Prophète ﷺ (Mawlid)", desc: "12 Rabi' al-awwal – date couramment donnée pour la naissance du Prophète ﷺ.", note: "Tous les musulmans ne célèbrent pas ce jour, et les savants donnent des dates différentes." },
      isra: { name: "Al-Isra et al-Mi'raj", desc: "27 Rajab – le voyage nocturne vers Jérusalem et l'ascension.", note: "Cette date est couramment donnée, mais elle n'est pas certaine." },
      shaban: { name: "Mi-Chaâbane", desc: "15 Chaâbane – la nuit du milieu du mois précédant le Ramadan.", note: "Les avis divergent sur les actes d'adoration particuliers de cette nuit." },
      ramadan: { name: "Début du Ramadan", desc: "1 Ramadan – premier jour de jeûne du mois au cours duquel le Coran a été révélé." },
      lastten: { name: "Les dix dernières nuits", desc: "À partir du 21 Ramadan – les nuits les plus bénies de l'année." },
      qadr: { name: "27 Ramadan", desc: "Une des nuits impaires : la Nuit du Destin (Laylat al-Qadr) se cherche dans les nuits impaires des dix dernières." },
      fitr: { name: "Aïd al-Fitr", desc: "1 Chawwal – la fête de la rupture du jeûne." },
      arafah: { name: "Jour d'Arafat", desc: "9 Dhou al-hijja – le point culminant du Hajj ; ceux qui ne sont pas en pèlerinage aiment jeûner ce jour-là." },
      adha: { name: "Aïd al-Adha", desc: "10 Dhou al-hijja – la fête du sacrifice." },
    },
  },
  es: {
    metaTitle: "Calendario islámico: fecha hegiriana de hoy y días importantes",
    metaDesc: "La fecha islámica de hoy, un calendario hegiriano mensual con fechas gregorianas, cuentas atrás hasta el Ramadán, el Eid y el día de Arafat, y un conversor de fechas.",
    kicker: "Calendario hegiriano",
    title: "Calendario islámico",
    lead: "Los meses del islam siguen la luna. Aquí ves la fecha islámica de hoy, el mes entero con sus días gregorianos y cuántos días faltan para el Ramadán, el Eid y Arafat.",
    heroRef: "Corán 2:189",
    today: "Hoy",
    todayIs: "Hoy es",
    sunset: "El día islámico comienza al ponerse el sol (Maghrib); desde ese momento rige ya la fecha siguiente.",
    prev: "Mes anterior",
    next: "Mes siguiente",
    backToday: "Volver a este mes",
    friday: "Viernes: el día de la oración del viernes",
    white: "Los días blancos (13–15): días apreciados para el ayuno voluntario",
    legendToday: "hoy",
    legendEvent: "día especial",
    legendWhite: "días blancos",
    thisMonth: "En este mes",
    upcoming: "Los próximos días importantes",
    inDays: "dentro de {n} días",
    tomorrow: "mañana",
    todayCount: "hoy",
    more: "Leer más",
    noteTitle: "Avistamiento de la luna",
    note: "Las fechas siguen el calendario Umm al-Qura. Como muchos países y comunidades comienzan el mes al avistar la luna nueva, la fecha real puede diferir en un día. Sigue el anuncio de tu mezquita o de tu país.",
    nightNote: "La noche comienza la tarde anterior, al ponerse el sol.",
    conv: "Conversor de fechas",
    convG: "Gregoriano → hegiriano",
    convH: "Hegiriano → gregoriano",
    day: "Día",
    month: "Mes",
    year: "Año",
    invalid: "Ese día no existe en ese mes.",
    days: "{n} días",
    ev: {
      newyear: { name: "Año Nuevo islámico", desc: "1 Muharram: comienzo del año hegiriano, que se cuenta desde la emigración del Profeta ﷺ a Medina." },
      ashura: { name: "Áshura", desc: "10 Muharram: el día en que Allah salvó a Musa y a su pueblo. Muchos ayunan ese día, junto con el 9." },
      mawlid: { name: "Nacimiento del Profeta ﷺ (Mawlid)", desc: "12 Rabiʿ al-awwal: fecha comúnmente señalada para el nacimiento del Profeta ﷺ.", note: "No todos los musulmanes celebran este día, y los sabios dan fechas distintas." },
      isra: { name: "Isra y Miʿray", desc: "27 Rayab: el viaje nocturno a Jerusalén y la ascensión.", note: "Esta fecha se menciona con frecuencia, pero no es segura." },
      shaban: { name: "Mitad de Shaabán", desc: "15 Shaabán: la noche de la mitad del mes anterior al Ramadán.", note: "Hay opiniones distintas sobre actos de adoración especiales en esta noche." },
      ramadan: { name: "Comienzo del Ramadán", desc: "1 Ramadán: primer día de ayuno del mes en que se reveló el Corán." },
      lastten: { name: "Las últimas diez noches", desc: "Desde el 21 de Ramadán: las noches más bendecidas del año." },
      qadr: { name: "27 de Ramadán", desc: "Una de las noches impares: la Noche del Destino (Laylat al-Qadr) se busca en las noches impares de las últimas diez." },
      fitr: { name: "Eid al-Fitr", desc: "1 Shawwal: la fiesta de la ruptura del ayuno." },
      arafah: { name: "Día de Arafat", desc: "9 Du-l-Hiyya: el punto culminante de la peregrinación; quienes no la realizan suelen ayunar ese día." },
      adha: { name: "Eid al-Adha", desc: "10 Du-l-Hiyya: la fiesta del sacrificio." },
    },
  },
  id: {
    metaTitle: "Kalender Hijriah – tanggal Hijriah hari ini dan hari-hari penting",
    metaDesc: "Tanggal Islam hari ini, kalender bulanan Hijriah dengan tanggal Masehi, hitung mundur menuju Ramadan, Idul Fitri dan Arafah, serta pengonversi tanggal.",
    kicker: "Kalender Hijriah",
    title: "Kalender Islam",
    lead: "Bulan-bulan dalam Islam mengikuti peredaran bulan. Di sini Anda melihat tanggal Hijriah hari ini, satu bulan penuh beserta tanggal Masehinya, dan berapa hari lagi menuju Ramadan, Idul Fitri, dan Arafah.",
    heroRef: "Al-Qur'an 2:189",
    today: "Hari ini",
    todayIs: "Hari ini",
    sunset: "Hari dalam Islam dimulai saat matahari terbenam (Magrib) – sejak itu berlaku tanggal berikutnya.",
    prev: "Bulan sebelumnya",
    next: "Bulan berikutnya",
    backToday: "Kembali ke bulan ini",
    friday: "Jumat – hari salat Jumat",
    white: "Ayyamul Bidh (tanggal 13–15): hari-hari yang dianjurkan untuk puasa sunah",
    legendToday: "hari ini",
    legendEvent: "hari istimewa",
    legendWhite: "ayyamul bidh",
    thisMonth: "Bulan ini",
    upcoming: "Hari-hari penting berikutnya",
    inDays: "{n} hari lagi",
    tomorrow: "besok",
    todayCount: "hari ini",
    more: "Baca selengkapnya",
    noteTitle: "Rukyat hilal",
    note: "Tanggal mengikuti kalender Umm al-Qura. Karena banyak negara dan komunitas memulai bulan berdasarkan rukyat hilal, tanggal sebenarnya bisa berbeda satu hari. Ikuti pengumuman masjid atau pemerintah di negara Anda.",
    nightNote: "Malam dimulai pada sore hari sebelumnya, saat matahari terbenam.",
    conv: "Pengonversi tanggal",
    convG: "Masehi → Hijriah",
    convH: "Hijriah → Masehi",
    day: "Tanggal",
    month: "Bulan",
    year: "Tahun",
    invalid: "Tanggal ini tidak ada pada bulan tersebut.",
    days: "{n} hari",
    ev: {
      newyear: { name: "Tahun Baru Hijriah", desc: "1 Muharram – awal tahun Hijriah, dihitung sejak hijrah Nabi ﷺ ke Madinah." },
      ashura: { name: "Asyura", desc: "10 Muharram – hari ketika Allah menyelamatkan Musa dan kaumnya. Banyak orang berpuasa pada hari ini, bersama tanggal 9." },
      mawlid: { name: "Maulid Nabi ﷺ", desc: "12 Rabiulawal – tanggal yang lazim disebut sebagai kelahiran Nabi ﷺ.", note: "Tidak semua Muslim memperingati hari ini, dan para ulama menyebut tanggal yang berbeda-beda." },
      isra: { name: "Isra Mikraj", desc: "27 Rajab – perjalanan malam ke Yerusalem dan kenaikan ke langit.", note: "Tanggal ini lazim disebut, tetapi tidak pasti." },
      shaban: { name: "Nisfu Syakban", desc: "15 Syakban – malam pertengahan bulan sebelum Ramadan.", note: "Pendapat berbeda mengenai amalan khusus pada malam ini." },
      ramadan: { name: "Awal Ramadan", desc: "1 Ramadan – hari pertama puasa di bulan diturunkannya Al-Qur'an." },
      lastten: { name: "Sepuluh malam terakhir", desc: "Mulai 21 Ramadan – malam-malam paling diberkahi dalam setahun." },
      qadr: { name: "27 Ramadan", desc: "Salah satu malam ganjil: Lailatulkadar dicari pada malam-malam ganjil di sepuluh malam terakhir." },
      fitr: { name: "Idul Fitri", desc: "1 Syawal – hari raya berakhirnya puasa." },
      arafah: { name: "Hari Arafah", desc: "9 Zulhijah – puncak ibadah haji; yang tidak berhaji suka berpuasa pada hari ini." },
      adha: { name: "Idul Adha", desc: "10 Zulhijah – hari raya kurban." },
    },
  },
  ms: {
    metaTitle: "Takwim Hijrah – tarikh Hijrah hari ini dan hari penting",
    metaDesc: "Tarikh Islam hari ini, takwim bulanan Hijrah dengan tarikh Masihi, kiraan detik ke Ramadan, Aidilfitri dan Arafah, serta penukar tarikh.",
    kicker: "Takwim Hijrah",
    title: "Takwim Islam",
    lead: "Bulan-bulan dalam Islam mengikut peredaran bulan. Di sini anda melihat tarikh Islam hari ini, seluruh bulan beserta hari Masihinya, dan berapa hari lagi sebelum Ramadan, Aidilfitri dan Arafah.",
    heroRef: "Quran 2:189",
    today: "Hari ini",
    todayIs: "Hari ini",
    sunset: "Hari dalam Islam bermula ketika matahari terbenam (Maghrib) – sejak itu tarikh seterusnya berkuat kuasa.",
    prev: "Bulan sebelumnya",
    next: "Bulan seterusnya",
    backToday: "Kembali ke bulan ini",
    friday: "Jumaat – hari solat Jumaat",
    white: "Ayyamul Bidh (13–15): hari-hari yang digalakkan untuk puasa sunat",
    legendToday: "hari ini",
    legendEvent: "hari istimewa",
    legendWhite: "ayyamul bidh",
    thisMonth: "Bulan ini",
    upcoming: "Hari penting yang akan datang",
    inDays: "dalam {n} hari",
    tomorrow: "esok",
    todayCount: "hari ini",
    more: "Baca lagi",
    noteTitle: "Cerapan anak bulan",
    note: "Tarikh mengikut takwim Umm al-Qura. Kerana banyak negara dan komuniti memulakan bulan dengan cerapan anak bulan, tarikh sebenar mungkin berbeza sehari. Ikuti pengumuman masjid atau negara anda.",
    nightNote: "Malam bermula petang sebelumnya, ketika matahari terbenam.",
    conv: "Penukar tarikh",
    convG: "Masihi → Hijrah",
    convH: "Hijrah → Masihi",
    day: "Tarikh",
    month: "Bulan",
    year: "Tahun",
    invalid: "Hari ini tidak wujud dalam bulan itu.",
    days: "{n} hari",
    ev: {
      newyear: { name: "Awal Muharram (Maal Hijrah)", desc: "1 Muharram – permulaan tahun Hijrah, dikira sejak hijrah Nabi ﷺ ke Madinah." },
      ashura: { name: "Asyura", desc: "10 Muharram – hari Allah menyelamatkan Musa dan kaumnya. Ramai yang berpuasa pada hari ini, bersama hari ke-9." },
      mawlid: { name: "Maulidur Rasul ﷺ", desc: "12 Rabiulawal – tarikh yang lazim disebut bagi kelahiran Nabi ﷺ.", note: "Tidak semua Muslim menyambut hari ini, dan para ulama menyebut tarikh yang berbeza." },
      isra: { name: "Israk dan Mikraj", desc: "27 Rejab – perjalanan malam ke Baitulmaqdis dan kenaikan ke langit.", note: "Tarikh ini lazim disebut tetapi tidak pasti." },
      shaban: { name: "Nisfu Syaaban", desc: "15 Syaaban – malam pertengahan bulan sebelum Ramadan.", note: "Pendapat berbeza tentang amalan khusus pada malam ini." },
      ramadan: { name: "Awal Ramadan", desc: "1 Ramadan – hari pertama berpuasa dalam bulan diturunkannya Quran." },
      lastten: { name: "Sepuluh malam terakhir", desc: "Bermula 21 Ramadan – malam-malam paling diberkati dalam setahun." },
      qadr: { name: "27 Ramadan", desc: "Salah satu malam ganjil: Lailatulqadar dicari pada malam-malam ganjil sepuluh malam terakhir." },
      fitr: { name: "Aidilfitri", desc: "1 Syawal – hari raya berakhirnya puasa." },
      arafah: { name: "Hari Arafah", desc: "9 Zulhijjah – kemuncak haji; mereka yang tidak mengerjakan haji gemar berpuasa pada hari ini." },
      adha: { name: "Aidiladha", desc: "10 Zulhijjah – hari raya korban." },
    },
  },
  bn: {
    metaTitle: "ইসলামি ক্যালেন্ডার – আজকের হিজরি তারিখ ও গুরুত্বপূর্ণ দিন",
    metaDesc: "আজকের ইসলামি তারিখ, খ্রিষ্টীয় তারিখসহ হিজরি মাসের ক্যালেন্ডার, রমজান, ঈদ ও আরাফার দিন পর্যন্ত কাউন্টডাউন এবং তারিখ রূপান্তরকারী।",
    kicker: "হিজরি ক্যালেন্ডার",
    title: "ইসলামি ক্যালেন্ডার",
    lead: "ইসলামের মাসগুলো চাঁদ অনুসরণ করে। এখানে আপনি আজকের ইসলামি তারিখ, খ্রিষ্টীয় দিনসহ পুরো মাস এবং রমজান, ঈদ ও আরাফার দিনের আর কত দিন বাকি তা দেখতে পাবেন।",
    heroRef: "কুরআন 2:189",
    today: "আজ",
    todayIs: "আজ",
    sunset: "ইসলামি দিন সূর্যাস্তের (মাগরিব) সময় শুরু হয় – তখন থেকেই পরের তারিখ গণ্য হয়।",
    prev: "আগের মাস",
    next: "পরের মাস",
    backToday: "এই মাসে ফিরে যান",
    friday: "শুক্রবার – জুমার নামাজের দিন",
    white: "আইয়ামে বীজ (13–15): নফল রোজার জন্য প্রিয় দিন",
    legendToday: "আজ",
    legendEvent: "বিশেষ দিন",
    legendWhite: "আইয়ামে বীজ",
    thisMonth: "এই মাসে",
    upcoming: "পরবর্তী গুরুত্বপূর্ণ দিনগুলো",
    inDays: "{n} দিন পরে",
    tomorrow: "আগামীকাল",
    todayCount: "আজ",
    more: "আরও পড়ুন",
    noteTitle: "চাঁদ দেখা",
    note: "তারিখগুলো উম্মুল কুরা ক্যালেন্ডার অনুসরণ করে। অনেক দেশ ও সম্প্রদায় নতুন চাঁদ দেখার ভিত্তিতে মাসের শুরু নির্ধারণ করে, তাই প্রকৃত তারিখ এক দিন আলাদা হতে পারে। আপনার মসজিদ বা দেশের ঘোষণা অনুসরণ করুন।",
    nightNote: "রাত শুরু হয় আগের দিনের সন্ধ্যায়, সূর্যাস্তের সময়।",
    conv: "তারিখ রূপান্তরকারী",
    convG: "খ্রিষ্টীয় → হিজরি",
    convH: "হিজরি → খ্রিষ্টীয়",
    day: "দিন",
    month: "মাস",
    year: "বছর",
    invalid: "এই মাসে এই দিনটি নেই।",
    days: "{n} দিন",
    ev: {
      newyear: { name: "ইসলামি নববর্ষ", desc: "1 মুহাররম – হিজরি বছরের শুরু, যা নবী ﷺ-এর মদিনায় হিজরত থেকে গণনা করা হয়।" },
      ashura: { name: "আশুরা", desc: "10 মুহাররম – যেদিন আল্লাহ মুসা ও তাঁর কওমকে রক্ষা করেছিলেন। অনেকে এই দিনে এবং তার সঙ্গে 9 তারিখেও রোজা রাখেন।" },
      mawlid: { name: "নবী ﷺ-এর জন্ম (মিলাদ)", desc: "12 রবিউল আউয়াল – নবী ﷺ-এর জন্মের জন্য সাধারণভাবে উল্লিখিত তারিখ।", note: "সব মুসলিম এই দিন পালন করেন না, আর আলেমরা বিভিন্ন তারিখ বলেছেন।" },
      isra: { name: "ইসরা ও মিরাজ", desc: "27 রজব – বায়তুল মুকাদ্দাসে রাতের সফর ও আসমানে আরোহণ।", note: "এই তারিখ প্রচলিত হলেও নিশ্চিত নয়।" },
      shaban: { name: "মধ্য শাবান", desc: "15 শাবান – রমজানের আগের মাসের মাঝের রাত।", note: "এই রাতে বিশেষ ইবাদত নিয়ে মতভেদ আছে।" },
      ramadan: { name: "রমজানের শুরু", desc: "1 রমজান – যে মাসে কুরআন নাজিল হয়েছে সেই মাসের প্রথম রোজার দিন।" },
      lastten: { name: "শেষ দশ রাত", desc: "21 রমজান থেকে – বছরের সবচেয়ে বরকতময় রাতগুলো।" },
      qadr: { name: "27 রমজান", desc: "বিজোড় রাতগুলোর একটি: শেষ দশ রাতের বিজোড় রাতগুলোতে লাইলাতুল কদর খোঁজা হয়।" },
      fitr: { name: "ঈদুল ফিতর", desc: "1 শাওয়াল – রোজা ভাঙার উৎসব।" },
      arafah: { name: "আরাফার দিন", desc: "9 জিলহজ – হজের শীর্ষ মুহূর্ত; যাঁরা হজে নেই, তাঁরা এই দিনে রোজা রাখতে ভালোবাসেন।" },
      adha: { name: "ঈদুল আজহা", desc: "10 জিলহজ – কোরবানির উৎসব।" },
    },
  },
  ru: {
    metaTitle: "Исламский календарь – сегодняшняя дата по хиджре и важные дни",
    metaDesc: "Сегодняшняя исламская дата, календарь месяца по хиджре с григорианскими датами, обратный отсчёт до Рамадана, праздников и дня Арафа, а также конвертер дат.",
    kicker: "Календарь хиджры",
    title: "Исламский календарь",
    lead: "Месяцы в исламе следуют за луной. Здесь ты видишь сегодняшнюю исламскую дату, весь месяц с григорианскими днями и сколько дней осталось до Рамадана, праздников и дня Арафа.",
    heroRef: "Коран 2:189",
    today: "Сегодня",
    todayIs: "Сегодня",
    sunset: "Исламский день начинается с заходом солнца (магриб) – с этого момента действует уже следующая дата.",
    prev: "Предыдущий месяц",
    next: "Следующий месяц",
    backToday: "К текущему месяцу",
    friday: "Пятница – день пятничной молитвы",
    white: "Белые дни (13–15): любимые дни для добровольного поста",
    legendToday: "сегодня",
    legendEvent: "особый день",
    legendWhite: "белые дни",
    thisMonth: "В этом месяце",
    upcoming: "Ближайшие важные дни",
    inDays: "через {n} дн.",
    tomorrow: "завтра",
    todayCount: "сегодня",
    more: "Подробнее",
    noteTitle: "Наблюдение луны",
    note: "Даты следуют календарю Умм аль-Кура. Поскольку многие страны и общины начинают месяц после наблюдения новой луны, фактическая дата может отличаться на один день. Ориентируйся на объявление своей мечети или страны.",
    nightNote: "Ночь начинается накануне вечером, с заходом солнца.",
    conv: "Конвертер дат",
    convG: "Григорианский → хиджры",
    convH: "Хиджры → григорианский",
    day: "День",
    month: "Месяц",
    year: "Год",
    invalid: "Такого дня в этом месяце нет.",
    days: "{n} дн.",
    ev: {
      newyear: { name: "Исламский Новый год", desc: "1 Мухаррам – начало года по хиджре, который отсчитывается от переселения Пророка ﷺ в Медину." },
      ashura: { name: "Ашура", desc: "10 Мухаррам – день, когда Аллах спас Мусу и его народ. Многие постятся в этот день вместе с 9-м." },
      mawlid: { name: "Рождение Пророка ﷺ (Маулид)", desc: "12 Рабиъ аль-авваль – часто называемая дата рождения Пророка ﷺ.", note: "Не все мусульмане отмечают этот день, а учёные называют разные даты." },
      isra: { name: "Исра и Мирадж", desc: "27 Раджаб – ночное путешествие в Иерусалим и вознесение.", note: "Эта дата называется часто, но не является достоверной." },
      shaban: { name: "Середина Шаабана", desc: "15 Шаабан – ночь середины месяца перед Рамаданом.", note: "Мнения об особых богослужениях в эту ночь расходятся." },
      ramadan: { name: "Начало Рамадана", desc: "1 Рамадан – первый день поста в месяце, в котором был ниспослан Коран." },
      lastten: { name: "Последние десять ночей", desc: "С 21 Рамадана – самые благословенные ночи года." },
      qadr: { name: "27 Рамадана", desc: "Одна из нечётных ночей: Ночь предопределения (Лейлят аль-Кадр) ищется среди нечётных ночей последней десятки." },
      fitr: { name: "Ураза-байрам (Ид аль-Фитр)", desc: "1 Шавваль – праздник разговения." },
      arafah: { name: "День Арафа", desc: "9 Зуль-хиджа – вершина хаджа; те, кто не совершает хадж, охотно постятся в этот день." },
      adha: { name: "Курбан-байрам (Ид аль-Адха)", desc: "10 Зуль-хиджа – праздник жертвоприношения." },
    },
  },
  zh: {
    metaTitle: "伊斯兰历 – 今日回历日期与重要日子",
    metaDesc: "今天的伊斯兰历日期、带公历日期的回历月历、距离斋月、开斋节和阿拉法特日的倒计时，以及日期转换器。",
    kicker: "回历",
    title: "伊斯兰历",
    lead: "伊斯兰的月份依月亮而行。在这里你可以看到今天的伊斯兰历日期、带公历日期的整月日历，以及距离斋月、节日和阿拉法特日还有多少天。",
    heroRef: "古兰经 2:189",
    today: "今天",
    todayIs: "今天是",
    sunset: "伊斯兰历的一天从日落（昏礼）开始——从那时起便算下一个日期。",
    prev: "上个月",
    next: "下个月",
    backToday: "回到本月",
    friday: "星期五——主麻日",
    white: "白日（13–15 日）：适宜自愿斋戒的日子",
    legendToday: "今天",
    legendEvent: "特别的日子",
    legendWhite: "白日",
    thisMonth: "本月",
    upcoming: "接下来的重要日子",
    inDays: "{n} 天后",
    tomorrow: "明天",
    todayCount: "今天",
    more: "了解更多",
    noteTitle: "观察新月",
    note: "日期依据乌姆·古拉历。由于许多国家和社群以目击新月来确定月初，实际日期可能相差一天。请以你所在清真寺或国家的公告为准。",
    nightNote: "夜晚从前一天傍晚日落时开始。",
    conv: "日期转换器",
    convG: "公历 → 回历",
    convH: "回历 → 公历",
    day: "日",
    month: "月",
    year: "年",
    invalid: "该月没有这一天。",
    days: "{n} 天",
    ev: {
      newyear: { name: "伊斯兰新年", desc: "穆哈兰姆月 1 日——回历年的开始，从先知ﷺ迁往麦地那（希吉拉）起算。" },
      ashura: { name: "阿舒拉日", desc: "穆哈兰姆月 10 日——安拉拯救穆萨及其族人的日子。许多人在这一天斋戒，并同时斋戒第 9 日。" },
      mawlid: { name: "先知ﷺ诞辰（圣纪节）", desc: "赖比尔·敖外鲁月 12 日——通常认为的先知ﷺ诞辰日期。", note: "并非所有穆斯林都纪念这一天，学者们给出的日期也不尽相同。" },
      isra: { name: "夜行与登霄", desc: "赖哲卜月 27 日——夜行至耶路撒冷并登霄。", note: "这一日期常被提及，但并不确定。" },
      shaban: { name: "舍尔邦月中", desc: "舍尔邦月 15 日——斋月前一个月的月中之夜。", note: "对这一夜的特别功修，看法并不一致。" },
      ramadan: { name: "斋月开始", desc: "斋月 1 日——古兰经降示之月的第一个斋戒日。" },
      lastten: { name: "最后十夜", desc: "自斋月 21 日起——一年中最吉祥的夜晚。" },
      qadr: { name: "斋月 27 日", desc: "单数夜之一：人们在最后十夜的单数夜中寻找盖德尔夜（尊贵之夜）。" },
      fitr: { name: "开斋节", desc: "绍瓦鲁月 1 日——斋戒结束的节日。" },
      arafah: { name: "阿拉法特日", desc: "都尔黑哲月 9 日——朝觐的高潮；未朝觐者喜欢在这一天斋戒。" },
      adha: { name: "宰牲节", desc: "都尔黑哲月 10 日——宰牲的节日。" },
    },
  },
};

export function calText(locale: string) {
  const d = CAL[(locale in CAL ? locale : "en") as AppLocale];
  const t = (key: string, vars?: Record<string, string | number>) => {
    const raw = d[key] ?? CAL.en[key];
    let s = typeof raw === "string" ? raw : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
  return { t, ev: (id: string): Ev => d.ev[id] ?? CAL.en.ev[id] };
}
