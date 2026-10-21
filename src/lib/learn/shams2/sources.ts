// mirrors mobile/src/features/shams2/sources.ts (copied for the website; keep in step with the app)
// Sources and scholarly review status of every explanatory text in Shams 2.0. Each text names where it comes from;
// "draft" texts are shown with a discreet note until a qualified scholar has reviewed them (then status "reviewed",
// with the reviewer's name and the date). Nothing here is a ruling (fatwa).

export type SourceRef = keyof typeof SOURCES;
export type Review = { status: "draft" } | { status: "reviewed"; by: string; at: string };

export const SOURCES = {
  halaqa: { kind: "classical", label: "Practice of the Qurʾān memorisation circles (ḥalaqāt al-taḥfīẓ) in the madāris of the Arab world and South Asia" },
  nawawi: { kind: "classical", label: "al-Nawawī, al-Tibyān fī Ādāb Ḥamalat al-Qurʾān" },
  jazari: { kind: "classical", label: "Ibn al-Jazarī, al-Nashr fī al-Qirāʾāt al-ʿAshr (introduction: sanad, ʿarḍ and samāʿ)" },
  kirmani: { kind: "classical", label: "al-Kirmānī, al-Burhān fī Tawjīh Mutashābih al-Qurʾān" },
  sakhawi: { kind: "classical", label: "ʿAlam al-Dīn al-Sakhāwī, Hidāyat al-Murtāb fī Mutashābih al-Kitāb" },
  ibnMunadi: { kind: "classical", label: "Ibn al-Munādī, Mutashābih al-Qurʾān" },
  ibnKathir: { kind: "classical", label: "Ibn Kathīr, Tafsīr al-Qurʾān al-ʿAẓīm" },
  saadi: { kind: "classical", label: "ʿAbd al-Raḥmān al-Saʿdī, Taysīr al-Karīm al-Raḥmān" },
  biqai: { kind: "classical", label: "al-Biqāʿī, Naẓm al-Durar fī Tanāsub al-Āyāt wa-l-Suwar" },
  ibnAshur: { kind: "classical", label: "Ibn ʿĀshūr, al-Taḥrīr wa-l-Tanwīr" },
  tabari: { kind: "classical", label: "al-Ṭabarī, Jāmiʿ al-Bayān ʿan Taʾwīl Āy al-Qurʾān" },
  qurtubi: { kind: "classical", label: "al-Qurṭubī, al-Jāmiʿ li-Aḥkām al-Qurʾān" },
  wahidi: { kind: "classical", label: "al-Wāḥidī, Asbāb Nuzūl al-Qurʾān" },
  fsrs: { kind: "science", label: "Ye et al., FSRS – Free Spaced Repetition Scheduler (open-spaced-repetition)" },
  retrieval: { kind: "science", label: "Roediger & Karpicke (2006), Test-enhanced learning, Psychological Science 17(3)" },
  interleave: { kind: "science", label: "Rohrer & Taylor (2007), The shuffling of mathematics problems improves learning, Instructional Science 35" },
  quranApi: { kind: "data", label: "Quran.com API (text, word data, page numbers, recitations)" },
  app: { kind: "data", label: "Quran Masterclass – computed on this device from your own practice" },
} as const;

export const DRAFT: Review = { status: "draft" };

/** the classical terms used throughout Shams 2.0 (Arabic, transliteration, meaning) */
export type Term = { id: string; ar: string; tr: string; de: string; en: string; arDef: string; src: SourceRef[]; review: Review };
export const TERMS: Term[] = [
  { id: "wird", ar: "الوِرْد", tr: "al-wird", de: "die tägliche Portion, die man regelmäßig rezitiert", en: "the daily portion one keeps reciting", arDef: "المقدار اليومي الذي يداوم عليه القارئ", src: ["halaqa"], review: DRAFT },
  { id: "sabaq", ar: "السَّبَق", tr: "sabaq", de: "der neue Abschnitt des Tages", en: "the new portion of the day", arDef: "الحفظ الجديد لليوم", src: ["halaqa"], review: DRAFT },
  { id: "sabqi", ar: "السَّبْقي", tr: "sabqī", de: "Wiederholung des kürzlich Gelernten", en: "review of the recently learned portion", arDef: "مراجعة المحفوظ القريب", src: ["halaqa"], review: DRAFT },
  { id: "manzil", ar: "المَنْزِل", tr: "manzil", de: "Wiederholung des gesamten früher Gelernten im festen Zyklus", en: "review of everything learned earlier in a fixed cycle", arDef: "مراجعة المحفوظ البعيد في دورة ثابتة", src: ["halaqa"], review: DRAFT },
  { id: "muraja", ar: "المُراجَعة", tr: "murājaʿa", de: "Wiederholung", en: "review", arDef: "تكرار المحفوظ لئلا يتفلت", src: ["halaqa", "nawawi"], review: DRAFT },
  { id: "tathbit", ar: "التَّثْبِيت", tr: "tathbīt", de: "Festigung des Gelernten", en: "consolidation", arDef: "تقوية الحفظ حتى يرسخ", src: ["halaqa"], review: DRAFT },
  { id: "itqan", ar: "الإتْقان", tr: "itqān", de: "Meisterschaft, sicheres Beherrschen", en: "mastery, secure command", arDef: "ضبط الحفظ وإحكامه", src: ["halaqa"], review: DRAFT },
  { id: "talaqqi", ar: "التَّلَقِّي", tr: "talaqqī", de: "Empfangen der Rezitation durch Hören vom Lehrer", en: "receiving the recitation by listening to a teacher", arDef: "أخذ القراءة سماعًا من الشيخ", src: ["jazari", "nawawi"], review: DRAFT },
  { id: "mushafaha", ar: "المُشافَهة", tr: "mushāfaha", de: "Weitergabe von Mund zu Mund", en: "transmission from mouth to mouth", arDef: "الأخذ من فم الشيخ مباشرة", src: ["jazari"], review: DRAFT },
  { id: "ard", ar: "العَرْض", tr: "ʿarḍ", de: "Vortragen der eigenen Rezitation vor dem Lehrer", en: "presenting one's recitation to the teacher", arDef: "قراءة الطالب على الشيخ", src: ["jazari"], review: DRAFT },
  { id: "sanad", ar: "السَّنَد", tr: "sanad", de: "Überlieferungskette bis zum Propheten ﷺ", en: "chain of transmission back to the Prophet ﷺ", arDef: "سلسلة الرواة المتصلة إلى النبي ﷺ", src: ["jazari"], review: DRAFT },
  { id: "mutashabihat", ar: "مُتَشابِهات الألفاظ", tr: "mutashābihāt al-alfāẓ", de: "Verse mit fast gleichem Wortlaut", en: "verses with nearly identical wording", arDef: "الآيات المتقاربة في ألفاظها", src: ["kirmani", "sakhawi"], review: DRAFT },
  { id: "juz", ar: "الجُزْء", tr: "juzʾ", de: "eines der 30 Teile des Qurʾān", en: "one of the 30 parts of the Qurʾān", arDef: "واحد من ثلاثين جزءًا", src: ["halaqa"], review: DRAFT },
  { id: "hizb", ar: "الحِزْب", tr: "ḥizb", de: "ein halber Juzʾ (60 im Qurʾān)", en: "half a juzʾ (60 in the Qurʾān)", arDef: "نصف الجزء، ستون حزبًا", src: ["halaqa"], review: DRAFT },
  { id: "rub", ar: "الرُّبْع", tr: "rubʿ", de: "ein Viertel eines Ḥizb", en: "a quarter of a ḥizb", arDef: "ربع الحزب", src: ["halaqa"], review: DRAFT },
  { id: "thumn", ar: "الثُّمُن", tr: "thumn", de: "ein Achtel eines Ḥizb (in nordafrikanischen Maṣāḥif)", en: "an eighth of a ḥizb (in North African maṣāḥif)", arDef: "ثمن الحزب في المصاحف المغاربية", src: ["halaqa"], review: DRAFT },
];
export const termOf = (id: string) => TERMS.find((t) => t.id === id)!;
