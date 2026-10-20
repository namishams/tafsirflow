// Copied verbatim from the website page src/app/[locale]/(app)/world/page.tsx (scratch script extract.mjs) – keep in sync with the website.
// Do not edit the texts or numbers by hand.
// Rounded estimates for 2010 from the Pew Research Center ("The Future of the Global Muslim Population", 2011);
// projection for 2050 from Pew ("The Future of World Religions", 2015). Shown as orientation, not as exact census data.
export const COUNTRIES: { id: string; de: string; en: string; ar: string; m: number; pct: number }[] = [
  { id: "id", de: "Indonesien", en: "Indonesia", ar: "إندونيسيا", m: 205, pct: 88 },
  { id: "pk", de: "Pakistan", en: "Pakistan", ar: "باكستان", m: 178, pct: 96 },
  { id: "in", de: "Indien", en: "India", ar: "الهند", m: 177, pct: 15 },
  { id: "bd", de: "Bangladesch", en: "Bangladesh", ar: "بنغلاديش", m: 149, pct: 90 },
  { id: "eg", de: "Ägypten", en: "Egypt", ar: "مصر", m: 80, pct: 95 },
  { id: "ng", de: "Nigeria", en: "Nigeria", ar: "نيجيريا", m: 76, pct: 48 },
  { id: "ir", de: "Iran", en: "Iran", ar: "إيران", m: 75, pct: 99 },
  { id: "tr", de: "Türkei", en: "Turkey", ar: "تركيا", m: 75, pct: 98 },
  { id: "dz", de: "Algerien", en: "Algeria", ar: "الجزائر", m: 35, pct: 98 },
  { id: "ma", de: "Marokko", en: "Morocco", ar: "المغرب", m: 32, pct: 99 },
  { id: "iq", de: "Irak", en: "Iraq", ar: "العراق", m: 31, pct: 99 },
  { id: "af", de: "Afghanistan", en: "Afghanistan", ar: "أفغانستان", m: 29, pct: 99 },
  { id: "sa", de: "Saudi-Arabien", en: "Saudi Arabia", ar: "السعودية", m: 26, pct: 97 },
  { id: "my", de: "Malaysia", en: "Malaysia", ar: "ماليزيا", m: 17, pct: 61 },
  { id: "ae", de: "Vereinigte Arabische Emirate", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة", m: 3.6, pct: 76 },
];
export const REGIONS: { de: string; en: string; ar: string; pct: number; color: string }[] = [
  { de: "Asien und Pazifik", en: "Asia-Pacific", ar: "آسيا والمحيط الهادئ", pct: 62, color: "rgb(var(--accent))" },
  { de: "Naher Osten und Nordafrika", en: "Middle East & North Africa", ar: "الشرق الأوسط وشمال أفريقيا", pct: 20, color: "rgb(var(--gold))" },
  { de: "Afrika südlich der Sahara", en: "Sub-Saharan Africa", ar: "أفريقيا جنوب الصحراء", pct: 15, color: "#5b8c7a" },
  { de: "Europa", en: "Europe", ar: "أوروبا", pct: 2.4, color: "#a3825a" },
  { de: "Amerika", en: "Americas", ar: "الأمريكتان", pct: 0.3, color: "#9aa5a0" },
];
export const C = {
  de: { kicker: "Die Umma weltweit", title: "Muslime in der Welt – wo der Koran zu Hause ist", lead: "Mehr als jeder fünfte Mensch auf der Erde ist Muslim. Die meisten leben nicht in der arabischen Welt, sondern in Asien – von Indonesien bis Bangladesch. Diese Seite zeigt, wie vielfältig die Umma ist, für die der Koran in so vielen Sprachen gelernt wird.", stats: [["≈ 1,6 Mrd.", "Muslime im Jahr 2010"], ["≈ 23 %", "der Weltbevölkerung"], ["≈ 2,8 Mrd.", "erwartet für 2050 (Projektion)"]], regions: "Wo Muslime leben (Anteil an allen Muslimen, 2010)", top: "Länder mit den meisten Muslimen", mio: "Mio.", share: "Anteil an der Bevölkerung", uae: "In den Emiraten leben Menschen aus mehr als 200 Nationen zusammen – Muslime aus aller Welt beten hier Seite an Seite.", schools: "Sunniten und Schiiten", schoolsBody: "Nach Schätzungen des Pew Research Center (2009) sind etwa 87–90 % der Muslime Sunniten und etwa 10–13 % Schiiten. Beide teilen den einen Koran, die eine Qibla und den einen Propheten ﷺ.", schoolsLink: "Mehr über Sunniten und Schiiten", note: "Gerundete Schätzungen des Pew Research Center für 2010 („The Future of the Global Muslim Population“, 2011) und die Projektion für 2050 („The Future of World Religions“, 2015). Heutige Zahlen weichen ab; sie dienen der Orientierung.", learn: "Den Koran in deiner Sprache lernen" },
  en: { kicker: "The Ummah worldwide", title: "Muslims around the world – where the Quran is at home", lead: "More than one in five people on earth is Muslim. Most do not live in the Arab world but in Asia – from Indonesia to Bangladesh. This page shows how diverse the Ummah is for whom the Quran is learned in so many languages.", stats: [["≈ 1.6 bn", "Muslims in 2010"], ["≈ 23 %", "of the world population"], ["≈ 2.8 bn", "expected by 2050 (projection)"]], regions: "Where Muslims live (share of all Muslims, 2010)", top: "Countries with the most Muslims", mio: "m", share: "share of the population", uae: "In the Emirates people from more than 200 nations live together – Muslims from all over the world pray here side by side.", schools: "Sunni and Shia", schoolsBody: "According to Pew Research Center estimates (2009), about 87–90 % of Muslims are Sunni and about 10–13 % Shia. Both share the one Quran, the one qibla and the one Prophet ﷺ.", schoolsLink: "More about Sunni and Shia", note: "Rounded estimates by the Pew Research Center for 2010 (“The Future of the Global Muslim Population”, 2011) and the projection for 2050 (“The Future of World Religions”, 2015). Today's figures differ; they are meant for orientation.", learn: "Learn the Quran in your language" },
  ar: { kicker: "الأمة حول العالم", title: "المسلمون في العالم – حيث يسكن القرآن", lead: "أكثر من واحد من كل خمسة أشخاص على الأرض مسلم، وأكثرهم لا يعيشون في العالم العربي بل في آسيا، من إندونيسيا إلى بنغلاديش. تُظهر هذه الصفحة تنوّع الأمة التي يُتعلَّم القرآن فيها بلغات كثيرة.", stats: [["≈ ١٫٦ مليار", "مسلم عام 2010"], ["≈ ٢٣٪", "من سكان العالم"], ["≈ ٢٫٨ مليار", "متوقّع عام 2050 (تقدير)"]], regions: "أين يعيش المسلمون (نسبةً إلى جميع المسلمين، 2010)", top: "الدول الأكثر عددًا من المسلمين", mio: "مليون", share: "النسبة من السكان", uae: "في الإمارات يعيش أناس من أكثر من 200 جنسية، ويصلّي المسلمون من أنحاء العالم جنبًا إلى جنب.", schools: "أهل السنة والشيعة", schoolsBody: "بحسب تقديرات مركز بيو للأبحاث (2009) يشكّل أهل السنة نحو 87–90٪ من المسلمين، والشيعة نحو 10–13٪، ويجمعهم القرآن الواحد والقبلة الواحدة والنبي الواحد ﷺ.", schoolsLink: "المزيد عن أهل السنة والشيعة", note: "تقديرات مقرّبة من مركز بيو للأبحاث لعام 2010 (مستقبل السكان المسلمين في العالم، 2011)، وتقدير عام 2050 (مستقبل أديان العالم، 2015). الأرقام الحالية مختلفة، وهي للاستئناس.", learn: "تعلّم القرآن بلغتك" },
};
export const worldContent = (l: string) => (l === "de" ? C.de : l === "ar" ? C.ar : C.en);
