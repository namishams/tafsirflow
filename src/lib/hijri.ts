// Hijri (Islamic) calendar helpers on top of Intl (Umm al-Qura calendar; falls back to the tabular calendar in old browsers).
// Days are handled as UTC midnights so that daylight saving never shifts a date.

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

export function hijriMonthName(m: number, locale: string) {
  const r = HIJRI_MONTHS[(m - 1 + 12) % 12];
  return locale === "ar" ? r.ar : locale === "de" ? r.de : r.en;
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
  const loc = locale === "ar" ? "ar" : locale === "de" ? "de-DE" : "en-GB";
  return new Intl.DateTimeFormat(loc, { ...opts, calendar: "gregory", numberingSystem: "latn", timeZone: "UTC" }).format(new Date(t));
}
export function fmtHijri(h: HDate, locale: string) {
  const era = locale === "ar" ? "هـ" : "AH";
  return `${h.d} ${hijriMonthName(h.m, locale)} ${h.y} ${era}`;
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
const CAL: Record<"de" | "en" | "ar", CalText> = {
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
};

export function calText(locale: string) {
  const l = locale === "de" || locale === "ar" ? locale : "en";
  const d = CAL[l];
  const t = (key: string, vars?: Record<string, string | number>) => {
    const raw = d[key] ?? CAL.en[key];
    let s = typeof raw === "string" ? raw : key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
  return { t, ev: (id: string): Ev => d.ev[id] ?? CAL.en.ev[id] };
}
