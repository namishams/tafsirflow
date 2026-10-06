// Surah of the day, surah of the month and dua of the month – chosen by the Islamic (Hijri) month, so they fit the season:
// al-Qadr in Ramadan, al-Fajr ("by the ten nights", 89:2) in Dhul-Hijjah, al-Isra in Rajab …
export type Featured = { surah: number; ref?: string; reason: { de: string; en: string; ar: string } };
export type FeaturedDua = { quran?: string; sunnah?: string; reason: { de: string; en: string; ar: string } };

// Hijri month 1–12 (Umm al-Qura calendar, as used in the Emirates and Saudi Arabia)
export function hijriMonth(d = new Date()): number {
  try { return Number(new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", { month: "numeric" }).format(d)) || 1; } catch { return 1; }
}
export function hijriMonthName(d: Date, locale: string): string {
  try { return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura-nu-latn`, { month: "long" }).format(d); } catch { return ""; }
}

const R = (de: string, en: string, ar: string) => ({ de, en, ar });
export const SURAH_OF_MONTH: Record<number, Featured> = {
  1: { surah: 28, reason: R("Im Muharram liegt Aschura – der Tag, an dem Allah Musa errettete (al-Bukhari 2004). Al-Qasas erzählt seine Geschichte.", "Muharram holds Ashura, the day Allah saved Musa (al-Bukhari 2004). Al-Qasas tells his story.", "في المحرّم يوم عاشوراء، يوم نجّى الله موسى (البخاري 2004)، وسورة القصص تروي قصته.") },
  2: { surah: 18, reason: R("Ein Monat zum Innehalten: Al-Kahf über Glauben, Wissen, Besitz und Macht – und Vertrauen auf Allah.", "A month to pause: al-Kahf on faith, knowledge, wealth and power – and trust in Allah.", "شهر للتأمل: سورة الكهف عن الإيمان والعلم والمال والسلطان والتوكل على الله.") },
  3: { surah: 47, reason: R("In diesem Monat gedenken viele der Geburt des Propheten ﷺ – die Sure, die seinen Namen trägt.", "Many remember the Prophet's ﷺ birth in this month – the surah that carries his name.", "يتذكّر كثيرون في هذا الشهر مولد النبي ﷺ، وهذه السورة تحمل اسمه.") },
  4: { surah: 67, reason: R("Al-Mulk: dreißig Verse, die viele jeden Abend vor dem Schlafen lesen.", "Al-Mulk: thirty verses many recite every night before sleep.", "سورة الملك: ثلاثون آية يقرؤها كثيرون كل ليلة قبل النوم.") },
  5: { surah: 36, reason: R("Ya-Sin – das Herz vieler Rezitationen: Leben, Tod und Auferstehung in klaren Bildern.", "Ya-Sin – at the heart of many recitations: life, death and resurrection in clear images.", "سورة يس: الحياة والموت والبعث في صور واضحة.") },
  6: { surah: 55, reason: R("Ar-Rahman: „Welche der Wohltaten eures Herrn wollt ihr da leugnen?“ – ein Monat der Dankbarkeit.", "Ar-Rahman: \"Which of the favours of your Lord would you deny?\" – a month of gratitude.", "سورة الرحمن: «فبأيّ آلاء ربكما تكذّبان» – شهر للشكر.") },
  7: { surah: 17, ref: "17:1", reason: R("Im Radschab gedenken viele der Nachtreise und Himmelfahrt; al-Isra beginnt mit ihr (17:1).", "In Rajab many remember the Night Journey and Ascension; al-Isra opens with it (17:1).", "في رجب يتذكّر كثيرون الإسراء والمعراج، وسورة الإسراء تبدأ بذكره (17:1).") },
  8: { surah: 2, ref: "2:183", reason: R("Schaban bereitet auf den Ramadan vor: die Fastenverse in al-Baqara (2:183–187).", "Sha'ban prepares for Ramadan: the verses of fasting in al-Baqarah (2:183–187).", "شعبان استعداد لرمضان: آيات الصيام في سورة البقرة (2:183–187).") },
  9: { surah: 97, reason: R("Ramadan: die Nacht der Bestimmung ist besser als tausend Monate (97:3).", "Ramadan: the Night of Decree is better than a thousand months (97:3).", "رمضان: ليلة القدر خير من ألف شهر (97:3).") },
  10: { surah: 87, reason: R("Schawwal und das Fest: Al-A'la rezitierte der Prophet ﷺ oft im Festgebet (Muslim 878).", "Shawwal and Eid: the Prophet ﷺ often recited al-A'la in the Eid prayer (Muslim 878).", "شوال والعيد: كان النبي ﷺ يقرأ سورة الأعلى في صلاة العيد (مسلم 878).") },
  11: { surah: 22, reason: R("Der Hadsch rückt näher: die Sure, die nach ihm benannt ist.", "Hajj is drawing near: the surah named after it.", "اقترب الحج: السورة التي سُمّيت باسمه.") },
  12: { surah: 89, ref: "89:2", reason: R("„Bei den zehn Nächten“ (89:2) – viele Gelehrte verstehen darunter die ersten zehn Tage des Dhul-Hiddscha.", "\"By the ten nights\" (89:2) – many scholars understand them as the first ten days of Dhul-Hijjah.", "«وليالٍ عشر» (89:2)، وفسّرها كثير من العلماء بعشر ذي الحجة.") },
};

export const DUA_OF_MONTH: Record<number, FeaturedDua> = {
  1: { quran: "3:8", reason: R("Ein neues Jahr: um ein festes Herz bitten.", "A new year: asking for a steadfast heart.", "عام جديد: نسأل الله ثبات القلب.") },
  2: { quran: "21:87", reason: R("Das Bittgebet des Propheten Yunus – für jede Enge.", "The dua of the Prophet Yunus – for every hardship.", "دعاء ذي النون، لكل ضيق.") },
  3: { sunnah: "salat-ibrahimiyya", reason: R("Den Segen auf den Propheten ﷺ sprechen – so, wie er es selbst lehrte.", "Sending blessings on the Prophet ﷺ – as he taught it himself.", "الصلاة على النبي ﷺ كما علّمها.") },
  4: { quran: "20:114", reason: R("„Mein Herr, mehre mich an Wissen.“", "\"My Lord, increase me in knowledge.\"", "«ربِّ زدني علمًا».") },
  5: { quran: "25:74", reason: R("Für die Familie: Freude der Augen.", "For the family: comfort of the eyes.", "للأسرة: قرّة أعين.") },
  6: { quran: "27:19", reason: R("Das Bittgebet Sulaymans um Dankbarkeit.", "Sulayman's dua for gratitude.", "دعاء سليمان أن يوزعه الله شكر نعمته.") },
  7: { quran: "17:80", reason: R("Aus al-Isra: um einen guten Eingang und einen guten Ausgang bitten.", "From al-Isra: asking for a good entrance and a good exit.", "من سورة الإسراء: مُدخل صدق ومُخرج صدق.") },
  8: { quran: "2:201", reason: R("Vor dem Ramadan: um das Gute in beiden Welten bitten.", "Before Ramadan: asking for good in both worlds.", "قبل رمضان: نسأل خيري الدنيا والآخرة.") },
  9: { sunnah: "afuwwun", reason: R("Das Bittgebet, das der Prophet ﷺ Aischa für die Nacht der Bestimmung lehrte.", "The dua the Prophet ﷺ taught Aisha for the Night of Decree.", "الدعاء الذي علّمه النبي ﷺ عائشة لليلة القدر.") },
  10: { quran: "2:127", reason: R("Nach dem Ramadan: „Unser Herr, nimm es von uns an.“", "After Ramadan: \"Our Lord, accept it from us.\"", "بعد رمضان: «ربنا تقبّل منا».") },
  11: { quran: "2:128", reason: R("Das Bittgebet Ibrahims und Ismails am Haus Allahs.", "The dua of Ibrahim and Ismail at the House of Allah.", "دعاء إبراهيم وإسماعيل عند البيت.") },
  12: { quran: "14:40", reason: R("Ibrahims Bittgebet um das Gebet – für sich und seine Nachkommen.", "Ibrahim's dua for prayer – for himself and his descendants.", "دعاء إبراهيم أن يجعله الله مقيم الصلاة ومن ذريته.") },
};

const dayIndex = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
// every day another surah (all 114 in turn); on Fridays al-Kahf, a widely kept practice
export function surahOfDay(d = new Date()): { surah: number; friday: boolean } {
  if (d.getDay() === 5) return { surah: 18, friday: true };
  return { surah: (dayIndex(d) * 37) % 114 + 1, friday: false };
}
export const surahOfMonth = (d = new Date()) => SURAH_OF_MONTH[hijriMonth(d)] ?? SURAH_OF_MONTH[1];
export const duaOfMonth = (d = new Date()) => DUA_OF_MONTH[hijriMonth(d)] ?? DUA_OF_MONTH[1];
