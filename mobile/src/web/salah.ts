// Prayer trainer (/salah): the five daily prayers step by step, in the Sunni form and in the Ja'fari (Shia) form.
// Wording follows the standard texts taught in both traditions; where schools differ, the notes say so.
//
// Languages: German, English and Arabic are written out in every text; the eleven other site languages are the fourth
// argument of L(). The Arabic words and their Latin transliteration (ar, translit) are never translated. The meaning
// lines of the other languages are literal translations of the English line; the source references stay as they are.
// Quran and hadith wording is never typed by hand (BLUEPRINT §4): the Quran recitations (Al-Fatiha, Al-Ikhlas, the
// qunut of 2:201) are cut out of the Quran data (lib/verseQuotes, modern spelling as in the other formulas), and where
// a formula's meaning would be a translation of a hadith or a verse, the meaning line is a short summary in our own
// words with its reference instead (essence: shown under the label ESSENCE, never as the quoted wording).
import { verseQuote } from "./verseQuotes";

export const EXTRA_LANGS = ["tr", "ur", "fa", "ps", "fr", "es", "id", "ms", "bn", "ru", "zh"] as const;
export type ExtraLang = (typeof EXTRA_LANGS)[number];
export type Lang = "de" | "en" | "ar" | ExtraLang;
export const LANGS: readonly Lang[] = ["de", "en", "ar", ...EXTRA_LANGS];
export type Extra = Record<ExtraLang, string>;
const isLang = (l: string): l is Lang => (LANGS as readonly string[]).includes(l);
// the texts to show for a locale: the locale itself if it has texts, otherwise English
export const langOf = (locale: string): Lang => (isLang(locale) ? locale : "en");

export type Posture = "stand" | "takbir" | "folded" | "sides" | "qunut" | "ruku" | "sujud" | "sujudTurbah" | "sit" | "tashahhud" | "salamR" | "salamL";
export type L2 = { de: string; en: string; ar?: string } & Extra;
// translit = Latin transliteration of the Arabic words (not a language of the site)
// essence: the meaning line is a summary in our own words (of a hadith or a verse), not a translation of the wording
export type Step = { posture: Posture; title: L2; ar?: string; translit?: string; meaning?: L2; essence?: boolean; note?: L2; rakah: number; aloud?: boolean };
export type Tradition = "sunni" | "shia";
function L(de: string, en: string, ar: string | undefined, extra: Extra): L2 { return { de, en, ar, ...extra }; }
/** the label of a meaning line that is a summary (Step.essence) instead of "Meaning" */
export const ESSENCE: L2 = L("Sinngemäß", "In essence", "المعنى إجمالًا", { tr: "Özetle", ur: "خلاصہ", fa: "به‌طور خلاصه", ps: "لنډیز", fr: "En substance", es: "En esencia", id: "Intinya", ms: "Ringkasnya", bn: "সারকথা", ru: "По смыслу", zh: "大意" });
export const PRAYERS = [
  { id: "fajr", rakat: 2, name: L("Fadschr", "Fajr", "الفجر", { tr: "Sabah", ur: "فجر", fa: "صبح", ps: "سهار", fr: "Fajr", es: "Fajr", id: "Subuh", ms: "Subuh", bn: "ফজর", ru: "Фаджр", zh: "晨礼" }), ar: "الفجر", aloudAll: true },
  { id: "dhuhr", rakat: 4, name: L("Dhuhr", "Dhuhr", "الظهر", { tr: "Öğle", ur: "ظہر", fa: "ظهر", ps: "ماسپښین", fr: "Dhuhr", es: "Dhuhr", id: "Zuhur", ms: "Zuhur", bn: "যোহর", ru: "Зухр", zh: "晌礼" }), ar: "الظهر", aloudAll: false },
  { id: "asr", rakat: 4, name: L("Asr", "Asr", "العصر", { tr: "İkindi", ur: "عصر", fa: "عصر", ps: "مازدیګر", fr: "Asr", es: "Asr", id: "Asar", ms: "Asar", bn: "আসর", ru: "Аср", zh: "晡礼" }), ar: "العصر", aloudAll: false },
  { id: "maghrib", rakat: 3, name: L("Maghrib", "Maghrib", "المغرب", { tr: "Akşam", ur: "مغرب", fa: "مغرب", ps: "ماښام", fr: "Maghrib", es: "Maghrib", id: "Magrib", ms: "Maghrib", bn: "মাগরিব", ru: "Магриб", zh: "昏礼" }), ar: "المغرب", aloudAll: true },
  { id: "isha", rakat: 4, name: L("Ischa", "Isha", "العشاء", { tr: "Yatsı", ur: "عشاء", fa: "عشا", ps: "ماخستن", fr: "Isha", es: "Isha", id: "Isya", ms: "Isyak", bn: "এশা", ru: "Иша", zh: "宵礼" }), ar: "العشاء", aloudAll: true },
] as const;
// Arabic wording helpers (number agreement / ordinals for the generated sentences)
const RAKAT_AR: Record<number, string> = { 2: "ركعتين", 3: "ثلاث ركعات", 4: "أربع ركعات" };
const ORD_AR = ["", "الأولى", "الثانية", "الثالثة", "الرابعة"];
// ordinals for the generated "stand up for rak'ah n" titles (index = n)
const ORD: Record<ExtraLang, string[]> = {
  tr: ["", "Birinci", "İkinci", "Üçüncü", "Dördüncü"],
  ur: ["", "پہلی", "دوسری", "تیسری", "چوتھی"],
  fa: ["", "اول", "دوم", "سوم", "چهارم"],
  ps: ["", "لومړي", "دویم", "دریم", "څلورم"],
  fr: ["", "première", "deuxième", "troisième", "quatrième"],
  es: ["", "primera", "segunda", "tercera", "cuarta"],
  id: ["", "pertama", "kedua", "ketiga", "keempat"],
  ms: ["", "pertama", "kedua", "ketiga", "keempat"],
  bn: ["", "প্রথম", "দ্বিতীয়", "তৃতীয়", "চতুর্থ"],
  ru: ["", "первому", "второму", "третьему", "четвёртому"],
  zh: ["", "一", "二", "三", "四"],
};

const T = {
  takbir: { ar: "اللهُ أَكْبَرُ", translit: "Allāhu akbar", meaning: L("Allah ist größer.", "Allah is the Greatest.", "اللهُ أعظمُ وأجلُّ من كلِّ شيء.", {
    tr: "Allah en büyüktür.",
    ur: "اللہ سب سے بڑا ہے۔",
    fa: "الله بزرگ‌ترین است.",
    ps: "الله تر ټولو لوی دی.",
    fr: "Allah est le Plus Grand.",
    es: "Allah es el Más Grande.",
    id: "Allah Mahabesar.",
    ms: "Allah Maha Besar.",
    bn: "আল্লাহ সর্বমহান।",
    ru: "Аллах – Величайший.",
    zh: "安拉至大。",
  }) },
  thana: { ar: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ", translit: "Subḥānaka llāhumma wa biḥamdika, wa tabāraka smuka, wa taʿālā jadduka, wa lā ilāha ghayruk", essence: true, meaning: L("Sie eröffnen das Gebet, indem Sie Allah preisen und loben und bezeugen, dass niemand außer Ihm angebetet wird (Sunan Abi Dawud 775; Jamiʿ at-Tirmidhi 243).", "You open the prayer by glorifying and praising Allah and affirming that none but He is worshipped (Sunan Abi Dawud 775; Jamiʿ at-Tirmidhi 243).", "أُنزِّهُك يا الله تنزيهًا مقرونًا بحمدك، وعظُمت بركةُ اسمك، وعلا جلالُك وعظمتُك، ولا معبودَ بحقٍّ سواك (سنن أبي داود 775، جامع الترمذي 243).", {
    tr: "Namazı Allah'ı tesbih ve hamd ederek açar, O'ndan başka ibadete layık kimse olmadığını ikrar edersiniz (Sünen-i Ebû Dâvûd 775; Câmiu't-Tirmizî 243).",
    ur: "آپ اللہ کی تسبیح و حمد سے نماز کا آغاز کرتے ہیں اور اقرار کرتے ہیں کہ اس کے سوا کوئی عبادت کے لائق نہیں (سنن ابی داود 775؛ جامع ترمذی 243)۔",
    fa: "نماز را با تسبیح و ستایش الله آغاز می‌کنید و اقرار می‌کنید که جز او کسی سزاوار پرستش نیست (سنن ابی‌داود 775؛ جامع ترمذی 243).",
    ps: "تاسو لمونځ د الله په تسبیح او ستاینې پیلوئ او اقرار کوئ چې له هغه پرته بل څوک د عبادت وړ نه دی (سنن ابي داود 775؛ جامع الترمذي 243).",
    fr: "Vous ouvrez la prière en glorifiant et en louant Allah, et en affirmant que nul autre que Lui n'est adoré (Sunan Abi Dawud 775 ; Jamiʿ at-Tirmidhi 243).",
    es: "Usted abre la oración glorificando y alabando a Allah y afirmando que nadie más que Él es adorado (Sunan Abi Dawud 775; Jamiʿ at-Tirmidhi 243).",
    id: "Anda membuka shalat dengan menyucikan dan memuji Allah serta mengikrarkan bahwa tiada yang disembah selain Dia (Sunan Abi Dawud 775; Jami' at-Tirmidzi 243).",
    ms: "Anda membuka solat dengan menyucikan dan memuji Allah serta mengakui bahawa tiada yang disembah selain Dia (Sunan Abi Dawud 775; Jami' at-Tirmizi 243).",
    bn: "আপনি আল্লাহর পবিত্রতা ও প্রশংসা ঘোষণা করে নামাজ শুরু করেন এবং স্বীকার করেন যে তিনি ছাড়া কেউ ইবাদতের যোগ্য নয় (সুনান আবু দাউদ 775; জামে তিরমিজি 243)।",
    ru: "Вы начинаете намаз, прославляя и восхваляя Аллаха и признавая, что никто, кроме Него, не достоин поклонения (Сунан Абу Дауда 775; Джами ат-Тирмизи 243).",
    zh: "您以赞颂和赞美安拉开始礼拜，并承认除祂之外没有应受崇拜的（《艾布·达乌德圣训集》第 775 段；《提尔密济圣训集》第 243 段）。",
  }) },
  taawwudh: { ar: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ", translit: "Aʿūdhu billāhi mina sh-shayṭāni r-rajīm", meaning: L("Ich nehme Zuflucht bei Allah vor dem verfluchten Satan.", "I seek refuge in Allah from the accursed Satan.", "ألتجئُ إلى الله وأعتصمُ به من الشيطان المطرود من رحمته.", {
    tr: "Kovulmuş şeytandan Allah'a sığınırım.",
    ur: "میں شیطانِ مردود سے اللہ کی پناہ مانگتا/مانگتی ہوں۔",
    fa: "به الله از شیطان رانده‌شده پناه می‌برم.",
    ps: "زه له شیطان رجیم څخه په الله پناه غواړم.",
    fr: "Je cherche refuge auprès d'Allah contre Satan le maudit.",
    es: "Me refugio en Allah de Satanás, el maldito.",
    id: "Aku berlindung kepada Allah dari setan yang terkutuk.",
    ms: "Aku berlindung kepada Allah daripada syaitan yang terkutuk.",
    bn: "আমি বিতাড়িত শয়তান থেকে আল্লাহর আশ্রয় চাই।",
    ru: "Прибегаю к Аллаху от проклятого сатаны.",
    zh: "我求安拉护佑，免遭被驱逐的恶魔之害。",
  }) },
  fatiha: { ar: `${verseQuote("imlaei", "1:1")} ۝ ${verseQuote("imlaei", "1:2")} …`, translit: "Bismillāhi r-raḥmāni r-raḥīm. Al-ḥamdu lillāhi rabbi l-ʿālamīn …", meaning: L("Die ganze Al-Fatiha – ohne sie ist kein Gebet gültig. Lernen Sie sie Vers für Vers im Player.", "The whole of Al-Fatiha – no prayer is valid without it. Learn it verse by verse in the player.", "سورةُ الفاتحة كاملةً، ولا تصحُّ صلاةٌ بدونها (صحيح البخاري 756، صحيح مسلم 394). تعلَّمها آيةً آيةً في المشغِّل.", {
    tr: "Fâtiha'nın tamamı – onsuz hiçbir namaz geçerli değildir. Onu oynatıcıda ayet ayet öğrenin.",
    ur: "پوری سورۂ فاتحہ – اس کے بغیر کوئی نماز درست نہیں۔ پلیئر میں اسے آیت بہ آیت سیکھیں۔",
    fa: "تمام سورهٔ فاتحه – بدون آن هیچ نمازی صحیح نیست. آن را آیه به آیه در پخش‌کننده بیاموزید.",
    ps: "ټوله الفاتحه – پرته له دې هېڅ لمونځ سم نه دی. په پلیر کې یې آیت په آیت زده کړئ.",
    fr: "Al-Fatiha en entier – sans elle, aucune prière n'est valide. Apprenez-la verset par verset dans le lecteur.",
    es: "Al-Fatiha completa: sin ella no es válida ninguna oración. Apréndala aleya por aleya en el reproductor.",
    id: "Seluruh Al-Fatihah – tanpanya shalat tidak sah. Pelajari ayat demi ayat di pemutar.",
    ms: "Keseluruhan Al-Fatihah – tanpanya tiada solat yang sah. Pelajarilah ayat demi ayat dalam pemain.",
    bn: "পুরো আল-ফাতিহা – এটি ছাড়া কোনো নামাজ বৈধ নয়। প্লেয়ারে এটি আয়াত ধরে ধরে শিখুন।",
    ru: "Вся Аль-Фатиха – без неё ни один намаз не действителен. Учите её аят за аятом в плеере.",
    zh: "完整的开端章——没有它，任何礼拜都不成立。在播放器中逐节学习。",
  }) },
  ikhlas: { ar: [1, 2, 3, 4].map((a) => verseQuote("imlaei", `112:${a}`)).join(" ۝ "), translit: "Qul huwa llāhu aḥad. Allāhu ṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahū kufuwan aḥad.", meaning: L("Zum Beispiel Al-Ikhlas (Sure 112) – jede andere Sure oder einige Verse sind ebenso möglich.", "For example Al-Ikhlas (Surah 112) – any other surah or a few verses are also fine.", "مثلُ سورة الإخلاص (السورة 112)، ويجوز أن تقرأ غيرها من السور أو آياتٍ منها.", {
    tr: "Örneğin İhlâs (112. sure) – başka herhangi bir sure ya da birkaç ayet de olur.",
    ur: "مثلاً سورۂ اخلاص (سورت 112) – کوئی اور سورت یا چند آیات بھی درست ہیں۔",
    fa: "برای مثال سورهٔ اخلاص (سورهٔ 112) – هر سورهٔ دیگر یا چند آیه نیز رواست.",
    ps: "د بېلګې په توګه الاخلاص (112 سورت) – هر بل سورت یا څو آیتونه هم سم دي.",
    fr: "Par exemple Al-Ikhlas (sourate 112) – toute autre sourate ou quelques versets conviennent aussi.",
    es: "Por ejemplo, Al-Ikhlas (sura 112); cualquier otra sura o algunas aleyas también valen.",
    id: "Misalnya Al-Ikhlas (surah 112) – surah lain atau beberapa ayat juga boleh.",
    ms: "Contohnya Al-Ikhlas (surah 112) – mana-mana surah lain atau beberapa ayat juga boleh.",
    bn: "যেমন আল-ইখলাস (সূরা 112) – অন্য যেকোনো সূরা বা কয়েকটি আয়াতও চলবে।",
    ru: "Например, Аль-Ихлас (сура 112) – подойдёт и любая другая сура или несколько аятов.",
    zh: "例如《忠诚章》（第112章）——其他任何一章或几节经文也可以。",
  }) },
  rukuSunni: { ar: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", translit: "Subḥāna rabbiya l-ʿaẓīm (3×)", meaning: L("Gepriesen sei mein Herr, der Gewaltige.", "Glory be to my Lord, the Magnificent.", "أُنزِّهُ ربِّيَ العظيمَ عن كلِّ نقص.", {
    tr: "Büyük olan Rabbimi tesbih ederim.",
    ur: "پاک ہے میرا رب، جو عظمت والا ہے۔",
    fa: "پاک است پروردگار بزرگ من.",
    ps: "پاک دی زما لوی رب.",
    fr: "Gloire à mon Seigneur, le Très Grand.",
    es: "Gloria a mi Señor, el Grandioso.",
    id: "Mahasuci Tuhanku Yang Mahaagung.",
    ms: "Maha Suci Tuhanku Yang Maha Agung.",
    bn: "আমার মহান রবের পবিত্রতা ঘোষণা করছি।",
    ru: "Пречист мой Господь Великий.",
    zh: "赞颂我伟大的主超绝万物。",
  }) },
  rukuShia: { ar: "سُبْحَانَ رَبِّيَ الْعَظِيمِ وَبِحَمْدِهِ", translit: "Subḥāna rabbiya l-ʿaẓīmi wa biḥamdih", meaning: L("Gepriesen sei mein Herr, der Gewaltige, und Lob gebührt ihm.", "Glory be to my Lord, the Magnificent, and praise be to Him.", "أُنزِّهُ ربِّيَ العظيمَ عن كلِّ نقص، وأحمَدُه.", {
    tr: "Büyük olan Rabbimi tesbih ederim, hamd O'nadır.",
    ur: "پاک ہے میرا رب، جو عظمت والا ہے، اور اسی کی حمد ہے۔",
    fa: "پاک است پروردگار بزرگ من، و ستایش از آنِ اوست.",
    ps: "پاک دی زما لوی رب، او ستاینه د هغه ده.",
    fr: "Gloire à mon Seigneur, le Très Grand, et louange à Lui.",
    es: "Gloria a mi Señor, el Grandioso, y alabanza a Él.",
    id: "Mahasuci Tuhanku Yang Mahaagung, dan segala puji bagi-Nya.",
    ms: "Maha Suci Tuhanku Yang Maha Agung, dan segala puji bagi-Nya.",
    bn: "আমার মহান রবের পবিত্রতা ঘোষণা করছি, এবং প্রশংসা তাঁরই।",
    ru: "Пречист мой Господь Великий, и хвала Ему.",
    zh: "赞颂我伟大的主超绝万物，并赞美祂。",
  }) },
  rise: { ar: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ ۝ رَبَّنَا وَلَكَ الْحَمْدُ", translit: "Samiʿa llāhu liman ḥamidah – Rabbanā wa laka l-ḥamd", meaning: L("Allah hört den, der ihn lobt. – Unser Herr, dir gebührt das Lob.", "Allah hears the one who praises Him. – Our Lord, to You belongs the praise.", "يتقبَّلُ اللهُ حمدَ من حمِده ويُجيبه. – يا ربَّنا، لك الحمدُ كلُّه.", {
    tr: "Allah, kendisine hamdedeni işitir. – Rabbimiz, hamd sanadır.",
    ur: "اللہ نے سن لی اس کی جس نے اس کی حمد کی۔ – اے ہمارے رب، تیرے ہی لیے تمام حمد ہے۔",
    fa: "الله می‌شنود کسی را که او را می‌ستاید. – پروردگارا، ستایش از آنِ توست.",
    ps: "الله اوري هغه چا ته چې ستاینه یې کوي. – ای زموږ رب، ستاینه ستا ده.",
    fr: "Allah entend celui qui Le loue. – Notre Seigneur, à Toi la louange.",
    es: "Allah oye a quien Lo alaba. – Señor nuestro, a Ti pertenece la alabanza.",
    id: "Allah mendengar orang yang memuji-Nya. – Wahai Tuhan kami, bagi-Mu segala puji.",
    ms: "Allah mendengar orang yang memuji-Nya. – Wahai Tuhan kami, bagi-Mu segala puji.",
    bn: "যে আল্লাহর প্রশংসা করে, আল্লাহ তা শোনেন। – হে আমাদের রব, প্রশংসা আপনারই।",
    ru: "Аллах слышит того, кто Его восхваляет. – Господь наш, Тебе хвала.",
    zh: "安拉听见赞颂祂的人。——我们的主啊！赞颂全归于你。",
  }) },
  sujudSunni: { ar: "سُبْحَانَ رَبِّيَ الْأَعْلَى", translit: "Subḥāna rabbiya l-aʿlā (3×)", meaning: L("Gepriesen sei mein Herr, der Allerhöchste.", "Glory be to my Lord, the Most High.", "أُنزِّهُ ربِّيَ الأعلى فوقَ خلقه عن كلِّ نقص.", {
    tr: "En yüce olan Rabbimi tesbih ederim.",
    ur: "پاک ہے میرا رب، جو سب سے بلند ہے۔",
    fa: "پاک است پروردگار بلندمرتبهٔ من.",
    ps: "پاک دی زما تر ټولو لوړ رب.",
    fr: "Gloire à mon Seigneur, le Très-Haut.",
    es: "Gloria a mi Señor, el Altísimo.",
    id: "Mahasuci Tuhanku Yang Mahatinggi.",
    ms: "Maha Suci Tuhanku Yang Maha Tinggi.",
    bn: "আমার সর্বোচ্চ রবের পবিত্রতা ঘোষণা করছি।",
    ru: "Пречист мой Господь Всевышний.",
    zh: "赞颂我至高的主超绝万物。",
  }) },
  sujudShia: { ar: "سُبْحَانَ رَبِّيَ الْأَعْلَى وَبِحَمْدِهِ", translit: "Subḥāna rabbiya l-aʿlā wa biḥamdih", meaning: L("Gepriesen sei mein Herr, der Allerhöchste, und Lob gebührt ihm.", "Glory be to my Lord, the Most High, and praise be to Him.", "أُنزِّهُ ربِّيَ الأعلى عن كلِّ نقص، وأحمَدُه.", {
    tr: "En yüce olan Rabbimi tesbih ederim, hamd O'nadır.",
    ur: "پاک ہے میرا رب، جو سب سے بلند ہے، اور اسی کی حمد ہے۔",
    fa: "پاک است پروردگار بلندمرتبهٔ من، و ستایش از آنِ اوست.",
    ps: "پاک دی زما تر ټولو لوړ رب، او ستاینه د هغه ده.",
    fr: "Gloire à mon Seigneur, le Très-Haut, et louange à Lui.",
    es: "Gloria a mi Señor, el Altísimo, y alabanza a Él.",
    id: "Mahasuci Tuhanku Yang Mahatinggi, dan segala puji bagi-Nya.",
    ms: "Maha Suci Tuhanku Yang Maha Tinggi, dan segala puji bagi-Nya.",
    bn: "আমার সর্বোচ্চ রবের পবিত্রতা ঘোষণা করছি, এবং প্রশংসা তাঁরই।",
    ru: "Пречист мой Господь Всевышний, и хвала Ему.",
    zh: "赞颂我至高的主超绝万物，并赞美祂。",
  }) },
  sitSunni: { ar: "رَبِّ اغْفِرْ لِي", translit: "Rabbi ghfir lī", meaning: L("Mein Herr, vergib mir.", "My Lord, forgive me.", "يا ربِّ، اغفر لي ذنوبي.", {
    tr: "Rabbim, beni bağışla.",
    ur: "اے میرے رب، مجھے بخش دے۔",
    fa: "پروردگارا، مرا بیامرز.",
    ps: "ای زما رب، ما وبښه.",
    fr: "Mon Seigneur, pardonne-moi.",
    es: "Señor mío, perdóname.",
    id: "Ya Tuhanku, ampunilah aku.",
    ms: "Ya Tuhanku, ampunilah aku.",
    bn: "হে আমার রব, আমাকে ক্ষমা করুন।",
    ru: "Господи мой, прости меня.",
    zh: "我的主啊！求你饶恕我。",
  }) },
  sitShia: { ar: "أَسْتَغْفِرُ اللَّهَ رَبِّي وَأَتُوبُ إِلَيْهِ", translit: "Astaghfiru llāha rabbī wa atūbu ilayh", meaning: L("Ich bitte Allah, meinen Herrn, um Vergebung und wende mich ihm reuig zu.", "I ask Allah, my Lord, for forgiveness and turn to Him in repentance.", "أطلبُ المغفرةَ من الله ربِّي، وأرجعُ إليه تائبًا.", {
    tr: "Rabbim Allah'tan bağışlanma dilerim ve O'na tövbe ederek dönerim.",
    ur: "میں اپنے رب اللہ سے بخشش مانگتا/مانگتی ہوں اور توبہ کے ساتھ اس کی طرف رجوع کرتا/کرتی ہوں۔",
    fa: "از الله، پروردگارم، آمرزش می‌خواهم و با توبه به سوی او بازمی‌گردم.",
    ps: "زه له خپل رب الله څخه بخښنه غواړم او په توبه ورته ورګرځم.",
    fr: "Je demande pardon à Allah, mon Seigneur, et je reviens à Lui par le repentir.",
    es: "Pido perdón a Allah, mi Señor, y me vuelvo a Él con arrepentimiento.",
    id: "Aku memohon ampun kepada Allah, Tuhanku, dan bertobat kepada-Nya.",
    ms: "Aku memohon ampun kepada Allah, Tuhanku, dan kembali kepada-Nya dengan bertaubat.",
    bn: "আমি আমার রব আল্লাহর কাছে ক্ষমা চাই এবং তাওবা করে তাঁর দিকে ফিরে আসি।",
    ru: "Прошу прощения у Аллаха, моего Господа, и с покаянием обращаюсь к Нему.",
    zh: "我向安拉——我的主——求恕，并忏悔归向祂。",
  }) },
  tashSunni: { ar: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", translit: "At-taḥiyyātu lillāhi wa ṣ-ṣalawātu wa ṭ-ṭayyibāt. As-salāmu ʿalayka ayyuha n-nabiyyu wa raḥmatu llāhi wa barakātuh. As-salāmu ʿalaynā wa ʿalā ʿibādi llāhi ṣ-ṣāliḥīn. Ash-hadu an lā ilāha illa llāh, wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh.", essence: true, meaning: L("Sie widmen Allah alle Ehrerbietung, erbitten Frieden für den Propheten ﷺ, für sich selbst und alle rechtschaffenen Diener und bezeugen Allahs Einheit sowie Muhammad als Seinen Diener und Gesandten (Sahih al-Bukhari 831; Sahih Muslim 402).", "You dedicate all reverence to Allah, ask for peace upon the Prophet ﷺ, upon yourself and all righteous servants, and bear witness to Allah's oneness and to Muhammad as His servant and Messenger (Sahih al-Bukhari 831; Sahih Muslim 402).", "كلُّ ألفاظ التعظيم والصلوات والكلمات الطيبة لله وحده. ثم نُسلِّم على النبي ﷺ وندعو له بالرحمة والبركة، ثم على أنفسنا وعلى عباد الله الصالحين، ثم نشهد لله بالوحدانية، ولمحمدٍ ﷺ بالعبودية والرسالة (صحيح البخاري 831، صحيح مسلم 402).", {
    tr: "Bütün tazimi Allah'a ayırır, Peygamber ﷺ, kendiniz ve bütün salih kullar için selam diler, Allah'ın birliğine ve Muhammed'in O'nun kulu ve resulü olduğuna şahitlik edersiniz (Sahîh-i Buhârî 831; Sahîh-i Müslim 402).",
    ur: "آپ ہر تعظیم اللہ کے لیے خاص کرتے ہیں، نبی ﷺ، اپنے لیے اور تمام نیک بندوں کے لیے سلامتی مانگتے ہیں، اور اللہ کی وحدانیت اور محمد ﷺ کے اس کے بندے اور رسول ہونے کی گواہی دیتے ہیں (صحیح البخاری 831؛ صحیح مسلم 402)۔",
    fa: "همهٔ بزرگداشت‌ها را از آنِ الله می‌دانید، برای پیامبر ﷺ، خودتان و همهٔ بندگان شایسته سلامتی می‌خواهید و به یگانگی الله و بندگی و رسالت محمد ﷺ گواهی می‌دهید (صحیح بخاری 831؛ صحیح مسلم 402).",
    ps: "تاسو ټول درناوی الله ته ځانګړی کوئ، د پیغمبر ﷺ، خپل ځان او ټولو صالحو بندګانو لپاره سلامتي غواړئ، او د الله پر یووالي او د محمد ﷺ پر بندګۍ او رسالت ګواهي ورکوئ (صحیح البخاري 831؛ صحیح مسلم 402).",
    fr: "Vous consacrez tout hommage à Allah, demandez la paix pour le Prophète ﷺ, pour vous-même et pour tous les serviteurs pieux, et attestez l'unicité d'Allah ainsi que Muhammad comme Son serviteur et Son messager (Sahih al-Bukhari 831 ; Sahih Muslim 402).",
    es: "Usted dedica toda reverencia a Allah, pide la paz para el Profeta ﷺ, para sí mismo y para todos los siervos virtuosos, y atestigua la unicidad de Allah y que Muhammad es Su siervo y mensajero (Sahih al-Bujari 831; Sahih Muslim 402).",
    id: "Anda mempersembahkan segala penghormatan kepada Allah, memohon keselamatan bagi Nabi ﷺ, bagi diri Anda dan semua hamba yang saleh, lalu bersaksi atas keesaan Allah dan bahwa Muhammad adalah hamba dan utusan-Nya (Shahih al-Bukhari 831; Shahih Muslim 402).",
    ms: "Anda mempersembahkan segala penghormatan kepada Allah, memohon kesejahteraan bagi Nabi ﷺ, bagi diri anda dan semua hamba yang soleh, lalu bersaksi atas keesaan Allah dan bahawa Muhammad ialah hamba dan utusan-Nya (Sahih al-Bukhari 831; Sahih Muslim 402).",
    bn: "আপনি সমস্ত সম্মান আল্লাহর জন্য নিবেদন করেন, নবী ﷺ, নিজের ও সকল নেক বান্দার জন্য শান্তি কামনা করেন, এবং আল্লাহর একত্ব ও মুহাম্মাদ ﷺ তাঁর বান্দা ও রাসুল হওয়ার সাক্ষ্য দেন (সহীহ আল-বুখারী 831; সহীহ মুসলিম 402)।",
    ru: "Вы посвящаете всё почитание Аллаху, просите мира для Пророка ﷺ, для себя и для всех праведных рабов и свидетельствуете о единстве Аллаха и о том, что Мухаммад – Его раб и посланник (Сахих аль-Бухари 831; Сахих Муслим 402).",
    zh: "您把一切敬意归于安拉，为先知ﷺ、为自己和一切善良的仆人祈求平安，并作证安拉独一、穆罕默德是祂的仆人和使者（《布哈里圣训实录》第 831 段；《穆斯林圣训实录》第 402 段）。",
  }) },
  salawat: { ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ", translit: "Allāhumma ṣalli ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā ṣallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd. Allāhumma bārik ʿalā Muḥammadin wa ʿalā āli Muḥammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka ḥamīdun majīd.", essence: true, meaning: L("Sie bitten Allah, Muhammad ﷺ und seine Familie zu segnen, wie Er Ibrahim und seine Familie gesegnet hat, und preisen Ihn als lobenswert und ruhmreich (Sahih al-Bukhari 3370).", "You ask Allah to bless Muhammad ﷺ and his family as He blessed Ibrahim and his family, and praise Him as worthy of praise and glory (Sahih al-Bukhari 3370).", "نسألُ اللهَ أن يُثنيَ على نبيِّه محمدٍ ﷺ وعلى آله ويُباركَ عليهم، كما أثنى على إبراهيم عليه السلام وآله وبارك عليهم؛ إنه سبحانه المحمودُ في ذاته وصفاته، العظيمُ في مجده (صحيح البخاري 3370).", {
    tr: "Allah'tan, İbrâhîm'e ve ailesine verdiği gibi Muhammed'e ﷺ ve ailesine de rahmet ve bereket vermesini diler, O'nu övgüye ve şana layık olarak anarsınız (Sahîh-i Buhârî 3370).",
    ur: "آپ اللہ سے دعا کرتے ہیں کہ وہ محمد ﷺ اور ان کی آل پر ویسی ہی رحمت اور برکت نازل فرمائے جیسی ابراہیم اور ان کی آل پر فرمائی، اور اسے حمد و بزرگی کے لائق مانتے ہیں (صحیح البخاری 3370)۔",
    fa: "از الله می‌خواهید که بر محمد ﷺ و خاندانش همان‌گونه درود و برکت فرستد که بر ابراهیم و خاندانش فرستاد، و او را سزاوار ستایش و شکوه می‌خوانید (صحیح بخاری 3370).",
    ps: "تاسو له الله غواړئ چې پر محمد ﷺ او د هغه پر کورنۍ هماغسې درود او برکت ولېږي لکه پر ابراهیم او د هغه پر کورنۍ یې چې لېږلی دی، او هغه د ستاینې او عظمت وړ بولئ (صحیح البخاري 3370).",
    fr: "Vous demandez à Allah de bénir Muhammad ﷺ et sa famille comme Il a béni Ibrahim et sa famille, et Le célébrez comme digne de louange et de gloire (Sahih al-Bukhari 3370).",
    es: "Usted pide a Allah que bendiga a Muhammad ﷺ y a su familia como bendijo a Ibrahim y a su familia, y Lo alaba como digno de alabanza y de gloria (Sahih al-Bujari 3370).",
    id: "Anda memohon kepada Allah agar melimpahkan shalawat dan berkah kepada Muhammad ﷺ dan keluarganya sebagaimana kepada Ibrahim dan keluarganya, serta memuji-Nya sebagai Yang layak dipuji dan dimuliakan (Shahih al-Bukhari 3370).",
    ms: "Anda memohon kepada Allah agar melimpahkan selawat dan keberkatan kepada Muhammad ﷺ dan keluarganya sebagaimana kepada Ibrahim dan keluarganya, serta memuji-Nya sebagai Yang layak dipuji dan dimuliakan (Sahih al-Bukhari 3370).",
    bn: "আপনি আল্লাহর কাছে প্রার্থনা করেন, তিনি যেন মুহাম্মাদ ﷺ ও তাঁর পরিবারকে তেমনই রহমত ও বরকত দেন যেমন ইবরাহিম ও তাঁর পরিবারকে দিয়েছেন, এবং তাঁকে প্রশংসা ও মহিমার যোগ্য বলে স্বীকার করেন (সহীহ আল-বুখারী 3370)।",
    ru: "Вы просите Аллаха благословить Мухаммада ﷺ и его семейство так же, как Он благословил Ибрахима и его семейство, и восхваляете Его как достойного хвалы и славы (Сахих аль-Бухари 3370).",
    zh: "您祈求安拉像赐福易卜拉欣及其家属那样赐福穆罕默德ﷺ及其家属，并赞颂祂配受赞美与尊荣（《布哈里圣训实录》第 3370 段）。",
  }) },
  salam: { ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", translit: "As-salāmu ʿalaykum wa raḥmatu llāh", meaning: L("Friede sei mit euch und die Barmherzigkeit Allahs.", "Peace be upon you and the mercy of Allah.", "دعاءٌ بالسلامة ورحمة الله لمن حولك.", {
    tr: "Üzerinize selam ve Allah'ın rahmeti olsun.",
    ur: "آپ پر سلامتی ہو اور اللہ کی رحمت۔",
    fa: "سلام و رحمت الله بر شما.",
    ps: "پر تاسې دې سلام او د الله رحمت وي.",
    fr: "Que la paix soit sur vous ainsi que la miséricorde d'Allah.",
    es: "La paz sea con vosotros y la misericordia de Allah.",
    id: "Semoga keselamatan dan rahmat Allah tercurah atas kalian.",
    ms: "Keselamatan dan rahmat Allah ke atas kamu.",
    bn: "আপনাদের উপর শান্তি ও আল্লাহর রহমত বর্ষিত হোক।",
    ru: "Мир вам и милость Аллаха.",
    zh: "愿平安与安拉的慈悯降临你们。",
  }) },
  tashShia: { ar: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَآلِ مُحَمَّدٍ", translit: "Ash-hadu an lā ilāha illa llāhu waḥdahū lā sharīka lah, wa ash-hadu anna Muḥammadan ʿabduhū wa rasūluh. Allāhumma ṣalli ʿalā Muḥammadin wa āli Muḥammad.", essence: true, meaning: L("Sie bezeugen, dass Allah allein und ohne Teilhaber angebetet wird und dass Muhammad Sein Diener und Gesandter ist, und bitten um Segen für Muhammad und seine Familie.", "You bear witness that Allah alone, without partner, is worshipped and that Muhammad is His servant and Messenger, and ask for blessings upon Muhammad and his family.", "شهادةٌ لله بالوحدانية وأنه لا شريك له، ولمحمدٍ ﷺ بالعبودية والرسالة، ثم الصلاةُ على محمدٍ وآل محمد.", {
    tr: "Allah'ın tek ve ortaksız olarak ibadete layık olduğuna, Muhammed'in O'nun kulu ve resulü olduğuna şahitlik eder, Muhammed'e ve ailesine salât istersiniz.",
    ur: "آپ گواہی دیتے ہیں کہ صرف اللہ ہی، بغیر کسی شریک کے، عبادت کے لائق ہے اور محمد اس کے بندے اور رسول ہیں، اور محمد و آلِ محمد پر درود کی دعا کرتے ہیں۔",
    fa: "گواهی می‌دهید که تنها الله، بی‌هیچ شریکی، سزاوار پرستش است و محمد بنده و فرستادهٔ اوست، و برای محمد و خاندانش درود می‌خواهید.",
    ps: "تاسو ګواهي ورکوئ چې یوازې الله، بې له کوم شریک، د عبادت وړ دی او محمد د هغه بنده او رسول دی، او پر محمد او د هغه پر کورنۍ درود غواړئ.",
    fr: "Vous attestez qu'Allah seul, sans associé, est adoré et que Muhammad est Son serviteur et Son messager, puis demandez des prières sur Muhammad et sa famille.",
    es: "Usted atestigua que solo Allah, sin asociado, es adorado y que Muhammad es Su siervo y mensajero, y pide bendiciones para Muhammad y su familia.",
    id: "Anda bersaksi bahwa hanya Allah, tanpa sekutu, yang disembah dan bahwa Muhammad adalah hamba dan utusan-Nya, lalu memohon shalawat bagi Muhammad dan keluarganya.",
    ms: "Anda bersaksi bahawa hanya Allah, tanpa sekutu, yang disembah dan bahawa Muhammad ialah hamba dan utusan-Nya, lalu memohon selawat bagi Muhammad dan keluarganya.",
    bn: "আপনি সাক্ষ্য দেন যে শরিকবিহীন এক আল্লাহই ইবাদতের যোগ্য এবং মুহাম্মাদ তাঁর বান্দা ও রাসুল, এবং মুহাম্মাদ ও তাঁর পরিবারের উপর রহমতের দোয়া করেন।",
    ru: "Вы свидетельствуете, что поклоняются лишь Аллаху, у Которого нет сотоварища, и что Мухаммад – Его раб и посланник, и просите благословения для Мухаммада и его семейства.",
    zh: "您作证唯有安拉应受崇拜、祂没有伙伴，穆罕默德是祂的仆人和使者，并为穆罕默德及其家属祈求赐福。",
  }) },
  salamShia: { ar: "السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ", translit: "As-salāmu ʿalayka ayyuha n-nabiyyu wa raḥmatu llāhi wa barakātuh. As-salāmu ʿalaynā wa ʿalā ʿibādi llāhi ṣ-ṣāliḥīn. As-salāmu ʿalaykum wa raḥmatu llāhi wa barakātuh.", essence: true, meaning: L("Sie grüßen den Propheten ﷺ, dann sich selbst und die rechtschaffenen Diener Allahs und schließlich alle Anwesenden und erbitten dabei Allahs Barmherzigkeit und Segen.", "You greet the Prophet ﷺ, then yourself and Allah's righteous servants, and finally everyone present, asking for Allah's mercy and blessings.", "السلامُ على النبي ﷺ، ثم على المصلّي نفسه وعلى عباد الله الصالحين، ثم على الحاضرين جميعًا، مع رحمة الله وبركاته.", {
    tr: "Önce Peygamber'e ﷺ, sonra kendinize ve Allah'ın salih kullarına, en sonunda da orada bulunan herkese selam verir, Allah'ın rahmetini ve bereketini dilersiniz.",
    ur: "آپ پہلے نبی ﷺ کو، پھر اپنے آپ کو اور اللہ کے نیک بندوں کو، اور آخر میں تمام حاضرین کو سلام کہتے ہیں اور اللہ کی رحمت اور برکت کی دعا کرتے ہیں۔",
    fa: "ابتدا بر پیامبر ﷺ، سپس بر خودتان و بندگان شایستهٔ الله و در پایان بر همهٔ حاضران سلام می‌فرستید و رحمت و برکت الله را می‌خواهید.",
    ps: "تاسو لومړی پیغمبر ﷺ ته، بیا خپل ځان او د الله صالحو بندګانو ته، او په پای کې ټولو حاضرینو ته سلام اچوئ او د الله رحمت او برکت غواړئ.",
    fr: "Vous saluez le Prophète ﷺ, puis vous-même et les pieux serviteurs d'Allah, et enfin toutes les personnes présentes, en demandant la miséricorde et les bénédictions d'Allah.",
    es: "Usted saluda al Profeta ﷺ, luego a sí mismo y a los siervos virtuosos de Allah y, por último, a todos los presentes, pidiendo la misericordia y las bendiciones de Allah.",
    id: "Anda memberi salam kepada Nabi ﷺ, lalu kepada diri Anda dan hamba-hamba Allah yang saleh, dan terakhir kepada semua yang hadir, sambil memohon rahmat dan berkah Allah.",
    ms: "Anda memberi salam kepada Nabi ﷺ, kemudian kepada diri anda dan hamba-hamba Allah yang soleh, dan akhirnya kepada semua yang hadir, sambil memohon rahmat dan keberkatan Allah.",
    bn: "আপনি প্রথমে নবী ﷺ-কে, তারপর নিজেকে ও আল্লাহর নেক বান্দাদের, এবং শেষে উপস্থিত সবাইকে সালাম দেন এবং আল্লাহর রহমত ও বরকত কামনা করেন।",
    ru: "Вы приветствуете Пророка ﷺ, затем себя и праведных рабов Аллаха и, наконец, всех присутствующих, прося милости и благословения Аллаха.",
    zh: "您先向先知ﷺ致平安，再向自己和安拉的善良仆人，最后向在场的所有人致平安，并祈求安拉的慈悯与吉庆。",
  }) },
  tasbihat: { ar: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", translit: "Subḥāna llāhi wa l-ḥamdu lillāhi wa lā ilāha illa llāhu wa llāhu akbar (3×)", meaning: L("Gepriesen sei Allah, alles Lob gebührt Allah, es gibt keinen Gott außer Allah, und Allah ist größer.", "Glory be to Allah, praise be to Allah, there is no god but Allah, and Allah is the Greatest.", "تنزيهُ الله، وحمدُه، وتوحيدُه، وتكبيرُه.", {
    tr: "Allah her eksiklikten uzaktır, hamd Allah'a aittir, Allah'tan başka ilah yoktur ve Allah en büyüktür.",
    ur: "اللہ پاک ہے، تمام حمد اللہ کے لیے ہے، اللہ کے سوا کوئی معبود نہیں، اور اللہ سب سے بڑا ہے۔",
    fa: "پاک است الله، ستایش از آنِ الله است، معبودی جز الله نیست و الله بزرگ‌ترین است.",
    ps: "پاک دی الله، ستاینه د الله ده، له الله پرته بل معبود نشته، او الله تر ټولو لوی دی.",
    fr: "Gloire à Allah, louange à Allah, il n'y a de dieu qu'Allah, et Allah est le Plus Grand.",
    es: "Gloria a Allah, alabanza a Allah, no hay más dios que Allah, y Allah es el Más Grande.",
    id: "Mahasuci Allah, segala puji bagi Allah, tiada tuhan selain Allah, dan Allah Mahabesar.",
    ms: "Maha Suci Allah, segala puji bagi Allah, tiada tuhan selain Allah, dan Allah Maha Besar.",
    bn: "আল্লাহ পবিত্র, সমস্ত প্রশংসা আল্লাহর, আল্লাহ ছাড়া কোনো ইলাহ নেই, এবং আল্লাহ সর্বমহান।",
    ru: "Пречист Аллах, хвала Аллаху, нет божества, кроме Аллаха, и Аллах – Величайший.",
    zh: "赞颂安拉超绝万物，一切赞颂全归于安拉，除安拉外绝无应受崇拜的，安拉至大。",
  }) },
  qunut: { ar: verseQuote("imlaei", "2:201", 4), translit: "Rabbanā ātinā fi d-dunyā ḥasanatan wa fi l-ākhirati ḥasanatan wa qinā ʿadhāba n-nār", essence: true, meaning: L("Ein Bittgebet aus dem Koran (2:201) um das Gute im Diesseits und im Jenseits und um Schutz vor dem Feuer – jedes Bittgebet ist möglich.", "A supplication from the Quran (2:201) for good in this world and the Hereafter and for protection from the Fire – any supplication may be said.", "دعاءٌ جامعٌ لخيرَي الدنيا والآخرة والنجاةِ من النار (البقرة: 201)، ويجوز الدعاءُ بأيِّ دعاءٍ آخر.", {
    tr: "Kur'an'dan (2:201) dünya ve âhiretin iyiliği ve ateşten korunmak için bir dua – herhangi bir dua da edilebilir.",
    ur: "قرآن (2:201) کی ایک دعا جس میں دنیا و آخرت کی بھلائی اور آگ سے حفاظت مانگی جاتی ہے – کوئی بھی دعا کی جا سکتی ہے۔",
    fa: "دعایی از قرآن (2:201) برای نیکی دنیا و آخرت و رهایی از آتش – هر دعایی را می‌توان گفت.",
    ps: "د قرآن (2:201) یوه دعا د دنیا او آخرت د نېکۍ او له اوره د ژغورنې لپاره – هره دعا ویل کېدای شي.",
    fr: "Une invocation tirée du Coran (2:201) pour le bien d'ici-bas et de l'au-delà et la protection contre le Feu – toute invocation peut être prononcée.",
    es: "Una súplica del Corán (2:201) por el bien de esta vida y de la Otra y la protección del Fuego – se puede decir cualquier súplica.",
    id: "Doa dari Al-Qur'an (2:201) untuk kebaikan dunia dan akhirat serta perlindungan dari azab neraka – doa apa pun boleh dibaca.",
    ms: "Doa daripada Quran (2:201) untuk kebaikan dunia dan akhirat serta perlindungan daripada azab neraka – mana-mana doa boleh dibaca.",
    bn: "কুরআনের (2:201) একটি দোয়া, দুনিয়া ও আখিরাতের কল্যাণ এবং আগুন থেকে রক্ষা চেয়ে – যেকোনো দোয়া পড়া যায়।",
    ru: "Мольба из Корана (2:201) о благе в этом мире и в Последней жизни и о защите от Огня – можно произнести любую мольбу.",
    zh: "一段出自古兰经（2:201）的祈祷，祈求今世与后世的美好并免受火狱的刑罚——也可以念其他任何祈祷词。",
  }) },
  bihawl: { ar: "بِحَوْلِ اللَّهِ وَقُوَّتِهِ أَقُومُ وَأَقْعُدُ", translit: "Biḥawli llāhi wa quwwatihī aqūmu wa aqʿud", essence: true, meaning: L("Beim Aufstehen bekennen Sie, dass Sie nur durch Allahs Macht und Kraft stehen und sitzen.", "As you rise, you affirm that you stand and sit only through Allah's power and strength.", "أقومُ وأقعدُ بقدرة الله وقوَّته، لا بحولي ولا بقوَّتي.", {
    tr: "Kalkarken, ancak Allah'ın gücü ve kuvvetiyle kalkıp oturduğunuzu ikrar edersiniz.",
    ur: "اٹھتے ہوئے آپ اقرار کرتے ہیں کہ آپ صرف اللہ کی طاقت اور قوت سے اٹھتے اور بیٹھتے ہیں۔",
    fa: "هنگام برخاستن اقرار می‌کنید که تنها با نیرو و توان الله برمی‌خیزید و می‌نشینید.",
    ps: "د پاڅېدو پر وخت اقرار کوئ چې تاسو یوازې د الله په ځواک او قوت پاڅېږئ او کېنئ.",
    fr: "En vous levant, vous reconnaissez que vous ne vous levez et ne vous asseyez que par la puissance et la force d'Allah.",
    es: "Al levantarse, usted reconoce que solo se pone de pie y se sienta por el poder y la fuerza de Allah.",
    id: "Saat bangkit, Anda mengakui bahwa Anda berdiri dan duduk hanya dengan daya dan kekuatan Allah.",
    ms: "Semasa bangun, anda mengakui bahawa anda berdiri dan duduk hanya dengan daya dan kekuatan Allah.",
    bn: "ওঠার সময় আপনি স্বীকার করেন যে কেবল আল্লাহর শক্তি ও ক্ষমতাতেই আপনি ওঠেন ও বসেন।",
    ru: "Вставая, вы признаёте, что встаёте и садитесь лишь благодаря силе и мощи Аллаха.",
    zh: "起身时，您承认自己唯凭安拉的力量和能力才能起立和坐下。",
  }) },
};

// ---------- step titles ----------
const TI = {
  niyya: L("Absicht (Niyya)", "Intention (niyyah)", "النيّة", {
    tr: "Niyet", ur: "نیت", fa: "نیت", ps: "نیت", fr: "Intention (niyya)", es: "Intención (niyya)", id: "Niat", ms: "Niat", bn: "নিয়ত", ru: "Намерение (ният)", zh: "意念（尼亚）",
  }),
  takbir: L("Eröffnungs-Takbir", "Opening takbir", "تكبيرة الإحرام", {
    tr: "İftitah tekbiri", ur: "تکبیرِ تحریمہ", fa: "تکبیرة‌الاحرام", ps: "تکبیر تحریمه", fr: "Takbir d'ouverture", es: "Takbir de apertura", id: "Takbiratul ihram", ms: "Takbiratul ihram", bn: "তাকবিরে তাহরিমা", ru: "Открывающий такбир", zh: "起拜大赞词",
  }),
  thana: L("Eröffnungsbittgebet", "Opening supplication", "دعاء الاستفتاح", {
    tr: "Açılış duası", ur: "ابتدائی دعا", fa: "دعای افتتاح", ps: "د پیل دعا", fr: "Invocation d'ouverture", es: "Súplica de apertura", id: "Doa iftitah", ms: "Doa iftitah", bn: "শুরুর দোয়া", ru: "Открывающая мольба", zh: "起拜祈祷词",
  }),
  refuge: L("Zufluchtnahme", "Seeking refuge", "الاستعاذة", {
    tr: "Sığınma", ur: "پناہ مانگنا", fa: "پناه بردن", ps: "پناه غوښتل", fr: "Demande de protection", es: "Búsqueda de refugio", id: "Memohon perlindungan", ms: "Memohon perlindungan", bn: "আশ্রয় প্রার্থনা", ru: "Прибегание к защите", zh: "求护佑",
  }),
  fatiha: L("Al-Fatiha", "Al-Fatiha", "سورة الفاتحة", {
    tr: "Fâtiha", ur: "سورۂ فاتحہ", fa: "الفاتحه", ps: "الفاتحه", fr: "Al-Fatiha", es: "Al-Fatiha", id: "Al-Fatihah", ms: "Al-Fatihah", bn: "আল-ফাতিহা", ru: "Аль-Фатиха", zh: "开端章（法蒂哈）",
  }),
  fourGlorifications: L("Die vier Lobpreisungen", "The four glorifications", "التسبيحات الأربع", {
    tr: "Dört tesbih", ur: "چار تسبیحات", fa: "تسبیحات اربعه", ps: "څلور تسبیحات", fr: "Les quatre glorifications", es: "Las cuatro glorificaciones", id: "Empat tasbih", ms: "Empat tasbih", bn: "চার তাসবিহ", ru: "Четыре славословия", zh: "四项赞颂",
  }),
  surah: L("Eine Sure", "A surah", "قراءة سورة", {
    tr: "Bir sure", ur: "ایک سورت", fa: "یک سوره", ps: "یو سورت", fr: "Une sourate", es: "Una sura", id: "Satu surah", ms: "Satu surah", bn: "একটি সূরা", ru: "Сура", zh: "一章经文",
  }),
  qunut: L("Qunut", "Qunut", "القنوت", {
    tr: "Kunût", ur: "قنوت", fa: "قنوت", ps: "قنوت", fr: "Qounout", es: "Qunut", id: "Qunut", ms: "Qunut", bn: "কুনুত", ru: "Кунут", zh: "古努特",
  }),
  ruku: L("Verbeugung (Ruku')", "Bowing (ruku')", "الركوع", {
    tr: "Eğilme (rükû)", ur: "رکوع", fa: "رکوع", ps: "رکوع", fr: "Inclinaison (roukou')", es: "Inclinación (ruku')", id: "Rukuk", ms: "Rukuk", bn: "রুকু", ru: "Поясной поклон (руку)", zh: "鞠躬（鲁库尔）",
  }),
  itidal: L("Aufrichten (I'tidal)", "Rising (i'tidal)", "الاعتدال من الركوع", {
    tr: "Doğrulma (i'tidal)", ur: "رکوع سے اٹھنا", fa: "برخاستن (اعتدال)", ps: "پورته کېدل (اعتدال)", fr: "Redressement (i'tidal)", es: "Incorporarse (i'tidal)", id: "Bangkit (i'tidal)", ms: "Bangkit (iktidal)", bn: "উঠে দাঁড়ানো (ই'তিদাল)", ru: "Выпрямление (итидаль)", zh: "起身（i'tidal）",
  }),
  sujud1: L("Niederwerfung (Sudschud)", "Prostration (sujud)", "السجود", {
    tr: "Secde", ur: "سجدہ", fa: "سجده", ps: "سجده", fr: "Prosternation (soujoud)", es: "Postración (suyud)", id: "Sujud", ms: "Sujud", bn: "সিজদা", ru: "Земной поклон (суджуд)", zh: "叩头（素术德）",
  }),
  sujud2: L("Zweite Niederwerfung", "Second prostration", "السجدة الثانية", {
    tr: "İkinci secde", ur: "دوسرا سجدہ", fa: "سجدهٔ دوم", ps: "دویمه سجده", fr: "Seconde prosternation", es: "Segunda postración", id: "Sujud kedua", ms: "Sujud kedua", bn: "দ্বিতীয় সিজদা", ru: "Второй земной поклон", zh: "第二次叩头",
  }),
  sitBetween: L("Sitzen zwischen den Niederwerfungen", "Sitting between the prostrations", "الجلسة بين السجدتين", {
    tr: "İki secde arasında oturma", ur: "دو سجدوں کے درمیان بیٹھنا", fa: "نشستن میان دو سجده", ps: "د دوو سجدو ترمنځ ناسته", fr: "Assise entre les prosternations", es: "Sentarse entre las postraciones", id: "Duduk di antara dua sujud", ms: "Duduk antara dua sujud", bn: "দুই সিজদার মাঝে বসা", ru: "Сидение между земными поклонами", zh: "两次叩头之间的坐姿",
  }),
  tashFirst: L("Erster Taschahhud", "First tashahhud", "التشهد الأول", {
    tr: "İlk teşehhüd", ur: "پہلا تشہد", fa: "تشهد اول", ps: "لومړی تشهد", fr: "Premier tachahhud", es: "Primer tashahhud", id: "Tasyahud awal", ms: "Tahiyat awal", bn: "প্রথম তাশাহহুদ", ru: "Первый ташаххуд", zh: "第一次作证词（泰沙胡德）",
  }),
  tashFinal: L("Letzter Taschahhud", "Final tashahhud", "التشهد الأخير", {
    tr: "Son teşehhüd", ur: "آخری تشہد", fa: "تشهد پایانی", ps: "وروستی تشهد", fr: "Dernier tachahhud", es: "Tashahhud final", id: "Tasyahud akhir", ms: "Tahiyat akhir", bn: "শেষ তাশাহহুদ", ru: "Последний ташаххуд", zh: "最后一次作证词（泰沙胡德）",
  }),
  salawat: L("Segensgebet über den Propheten ﷺ", "Prayers upon the Prophet ﷺ", "الصلوات الإبراهيمية", {
    tr: "Peygamber ﷺ'e salât", ur: "نبی ﷺ پر درود", fa: "صلوات بر پیامبر ﷺ", ps: "پر پیغمبر ﷺ درود", fr: "Prière sur le Prophète ﷺ", es: "Bendiciones sobre el Profeta ﷺ", id: "Shalawat atas Nabi ﷺ", ms: "Selawat ke atas Nabi ﷺ", bn: "নবী ﷺ-এর উপর দরুদ", ru: "Благословение Пророка ﷺ", zh: "为先知ﷺ祝福",
  }),
  salamR: L("Friedensgruß nach rechts", "Salam to the right", "التسليم عن اليمين", {
    tr: "Sağa selam", ur: "دائیں طرف سلام", fa: "سلام به راست", ps: "ښي لوري ته سلام", fr: "Salam vers la droite", es: "Salam a la derecha", id: "Salam ke kanan", ms: "Salam ke kanan", bn: "ডান দিকে সালাম", ru: "Салам направо", zh: "向右道平安",
  }),
  salamL: L("Friedensgruß nach links", "Salam to the left", "التسليم عن الشمال", {
    tr: "Sola selam", ur: "بائیں طرف سلام", fa: "سلام به چپ", ps: "کیڼ لوري ته سلام", fr: "Salam vers la gauche", es: "Salam a la izquierda", id: "Salam ke kiri", ms: "Salam ke kiri", bn: "বাম দিকে সালাম", ru: "Салам налево", zh: "向左道平安",
  }),
  salamShia: L("Friedensgruß (Salam)", "Salam", "التسليم", {
    tr: "Selam", ur: "سلام", fa: "سلام", ps: "سلام", fr: "Salam", es: "Salam", id: "Salam", ms: "Salam", bn: "সালাম", ru: "Салам", zh: "道平安",
  }),
  threeTakbirs: L("Drei Takbir zum Abschluss", "Three takbirs to close", "التكبيرات الثلاث في الختام", {
    tr: "Sonda üç tekbir", ur: "آخر میں تین تکبیریں", fa: "سه تکبیر پایانی", ps: "په پای کې درې تکبیرونه", fr: "Trois takbirs à la fin", es: "Tres takbirs al final", id: "Tiga takbir di akhir", ms: "Tiga takbir penutup", bn: "শেষে তিনটি তাকবির", ru: "Три такбира в конце", zh: "结尾的三次大赞词",
  }),
};

// ---------- step notes ----------
const N = {
  takbir: L("Heben Sie die Hände bis zu den Ohren oder Schultern. Ab jetzt sind Sie im Gebet.", "Raise your hands to your ears or shoulders. From now on you are in prayer.", "ارفع يديك حذوَ أذنيك أو منكبيك. وبها تدخل في الصلاة.", {
    tr: "Ellerinizi kulaklarınıza ya da omuzlarınıza kadar kaldırın. Bu andan itibaren namazdasınız.",
    ur: "اپنے ہاتھ کانوں یا کندھوں تک اٹھائیں۔ اب سے آپ نماز میں ہیں۔",
    fa: "دست‌ها را تا گوش‌ها یا شانه‌ها بلند کنید. از این لحظه در نماز هستید.",
    ps: "خپل لاسونه تر غوږونو یا اوږو پورې پورته کړئ. له دې وروسته تاسو په لمانځه کې یاست.",
    fr: "Levez les mains jusqu'aux oreilles ou aux épaules. À partir de maintenant, vous êtes en prière.",
    es: "Levante las manos hasta las orejas o los hombros. A partir de ahora está en oración.",
    id: "Angkat kedua tangan setinggi telinga atau bahu. Mulai sekarang Anda sedang dalam shalat.",
    ms: "Angkat kedua-dua tangan setinggi telinga atau bahu. Mulai sekarang anda berada dalam solat.",
    bn: "দুই হাত কান বা কাঁধ পর্যন্ত তুলুন। এখন থেকে আপনি নামাজে আছেন।",
    ru: "Поднимите руки до ушей или до плеч. С этого момента вы в намазе.",
    zh: "把双手举到耳边或肩旁。从现在起，您就在礼拜中了。",
  }),
  thana: L("Leise. Hanafiten und Hanbaliten halten die Hände unter dem Nabel bzw. auf der Brust, Schafiiten auf der Brust; viele Malikiten lassen sie seitlich hängen – alles ist überliefert.", "Silently. Hands are held below the navel or on the chest depending on the school; many Malikis let them hang – all of this is transmitted.", "يُقال سرًّا. وتوضع اليدان تحت السُّرّة أو على الصدر بحسب المذهب، وكثيرٌ من المالكية يُرسلونهما (السَّدْل) – وكلُّ ذلك مأثور.", {
    tr: "Sessizce. Eller, mezhebe göre göbeğin altında ya da göğüs üzerinde tutulur; birçok Mâlikî ellerini yanlarına salar – bunların hepsi nakledilmiştir.",
    ur: "آہستہ آواز میں۔ ہاتھ مکتب کے مطابق ناف کے نیچے یا سینے پر رکھے جاتے ہیں؛ بہت سے مالکی انہیں چھوڑ دیتے ہیں – یہ سب منقول ہے۔",
    fa: "آهسته. دست‌ها بسته به مذهب زیر ناف یا بر سینه قرار می‌گیرند؛ بسیاری از مالکیان آنها را رها می‌کنند – همهٔ اینها روایت شده است.",
    ps: "په ټیټ غږ. لاسونه د مذهب پر اساس د نامه لاندې یا پر سینه ایښودل کېږي؛ ډېر مالکیان یې پرېږدي – دا ټول نقل شوي دي.",
    fr: "À voix basse. Les mains se tiennent sous le nombril ou sur la poitrine selon l'école ; beaucoup de malékites les laissent pendre – tout cela est transmis.",
    es: "En voz baja. Las manos se colocan por debajo del ombligo o sobre el pecho según la escuela; muchos malikíes las dejan caídas – todo esto está transmitido.",
    id: "Dengan pelan. Tangan diletakkan di bawah pusar atau di dada, tergantung mazhab; banyak penganut mazhab Maliki membiarkannya terurai di sisi badan – semua ini diriwayatkan.",
    ms: "Secara perlahan. Tangan diletakkan di bawah pusat atau di dada mengikut mazhab; ramai pengikut mazhab Maliki membiarkannya terlepas – semua ini ada riwayatnya.",
    bn: "নিচুস্বরে। মাযহাব অনুযায়ী হাত নাভির নিচে বা বুকে রাখা হয়; অনেক মালেকী হাত ঝুলিয়ে রাখেন – এর সবই বর্ণিত।",
    ru: "Про себя. Руки держат ниже пупка или на груди в зависимости от школы; многие маликиты опускают их – всё это передано.",
    zh: "低声念。依学派不同，双手放在肚脐之下或胸前；许多马立克学派的人让双手垂着——这些都有传述。",
  }),
  fatihaSunniAloud: L("Laut rezitiert (beim Imam/allein), danach „Āmīn“.", "Recited aloud (as imam or alone), then “Āmīn”.", "يُجهَر بها (للإمام والمنفرد)، ثم يُقال: «آمين».", {
    tr: "Yüksek sesle okunur (imam olarak ya da tek başına), ardından “Āmīn” denir.",
    ur: "بلند آواز سے پڑھی جاتی ہے (امام کے طور پر یا اکیلے)، پھر “Āmīn” کہا جاتا ہے۔",
    fa: "با صدای بلند خوانده می‌شود (به‌عنوان امام یا به‌تنهایی)، سپس «Āmīn» گفته می‌شود.",
    ps: "په لوړ غږ لوستل کېږي (د امام په توګه یا یوازې)، بیا «Āmīn» ویل کېږي.",
    fr: "Récitée à voix haute (en tant qu'imam ou seul), puis « Āmīn ».",
    es: "Se recita en voz alta (como imam o a solas), y después “Āmīn”.",
    id: "Dibaca dengan suara keras (sebagai imam atau sendirian), lalu “Āmīn”.",
    ms: "Dibaca dengan kuat (sebagai imam atau bersendirian), kemudian “Āmīn”.",
    bn: "উচ্চস্বরে পড়া হয় (ইমাম হিসেবে বা একা), তারপর “Āmīn” বলা হয়।",
    ru: "Читается вслух (имамом или в одиночку), затем «Āmīn».",
    zh: "出声诵读（作伊玛目或单独礼拜时），然后说“Āmīn”。",
  }),
  fatihaSunniSilent: L("Leise rezitiert, danach „Āmīn“.", "Recited silently, then “Āmīn”.", "تُقرأ سرًّا، ثم يُقال: «آمين».", {
    tr: "Sessizce okunur, ardından “Āmīn” denir.",
    ur: "آہستہ پڑھی جاتی ہے، پھر “Āmīn” کہا جاتا ہے۔",
    fa: "آهسته خوانده می‌شود، سپس «Āmīn» گفته می‌شود.",
    ps: "په ټیټ غږ لوستل کېږي، بیا «Āmīn» ویل کېږي.",
    fr: "Récitée à voix basse, puis « Āmīn ».",
    es: "Se recita en silencio, y después “Āmīn”.",
    id: "Dibaca dengan pelan, lalu “Āmīn”.",
    ms: "Dibaca perlahan, kemudian “Āmīn”.",
    bn: "নিচুস্বরে পড়া হয়, তারপর “Āmīn” বলা হয়।",
    ru: "Читается про себя, затем «Āmīn».",
    zh: "低声诵读，然后说“Āmīn”。",
  }),
  fatihaShiaAloud: L("Laut rezitiert. In der Dscha'fari-Schule wird danach kein „Āmīn“ gesagt.", "Recited aloud. In the Ja'fari school no “Āmīn” is said afterwards.", "يُجهَر بها. وفي المذهب الجعفري لا يُقال بعدها «آمين».", {
    tr: "Yüksek sesle okunur. Caferî mezhebinde ardından “Āmīn” denmez.",
    ur: "بلند آواز سے پڑھی جاتی ہے۔ جعفری مکتب میں اس کے بعد “Āmīn” نہیں کہا جاتا۔",
    fa: "با صدای بلند خوانده می‌شود. در مذهب جعفری پس از آن «Āmīn» گفته نمی‌شود.",
    ps: "په لوړ غږ لوستل کېږي. په جعفري مذهب کې له هغې وروسته «Āmīn» نه ویل کېږي.",
    fr: "Récitée à voix haute. Dans l'école ja'farite, on ne dit pas « Āmīn » ensuite.",
    es: "Se recita en voz alta. En la escuela yafarí no se dice “Āmīn” después.",
    id: "Dibaca dengan suara keras. Dalam mazhab Ja'fari tidak diucapkan “Āmīn” setelahnya.",
    ms: "Dibaca dengan kuat. Dalam mazhab Ja'fari “Āmīn” tidak disebut selepasnya.",
    bn: "উচ্চস্বরে পড়া হয়। জাফরি মাযহাবে এর পরে “Āmīn” বলা হয় না।",
    ru: "Читается вслух. В джафаритском мазхабе после этого «Āmīn» не говорят.",
    zh: "出声诵读。在贾法里学派中，之后不说“Āmīn”。",
  }),
  fatihaShiaSilent: L("Leise rezitiert. Danach kein „Āmīn“.", "Recited silently. No “Āmīn” afterwards.", "تُقرأ سرًّا، ولا يُقال بعدها «آمين».", {
    tr: "Sessizce okunur. Ardından “Āmīn” denmez.",
    ur: "آہستہ پڑھی جاتی ہے۔ اس کے بعد “Āmīn” نہیں کہا جاتا۔",
    fa: "آهسته خوانده می‌شود. پس از آن «Āmīn» گفته نمی‌شود.",
    ps: "په ټیټ غږ لوستل کېږي. وروسته «Āmīn» نه ویل کېږي.",
    fr: "Récitée à voix basse. Pas de « Āmīn » ensuite.",
    es: "Se recita en silencio. Sin “Āmīn” después.",
    id: "Dibaca dengan pelan. Tanpa “Āmīn” setelahnya.",
    ms: "Dibaca perlahan. Tiada “Āmīn” selepasnya.",
    bn: "নিচুস্বরে পড়া হয়। এর পরে “Āmīn” বলা হয় না।",
    ru: "Читается про себя. После этого «Āmīn» не говорят.",
    zh: "低声诵读。之后不说“Āmīn”。",
  }),
  fatihaShiaLater: L("In der 3. und 4. Raka können Sie statt der Fatiha die „vier Lobpreisungen“ sagen (nächster Schritt).", "In the 3rd and 4th rak'ah you may say the “four glorifications” instead of Al-Fatiha (next step).", "في الركعتين الثالثة والرابعة يجوز لك أن تقول «التسبيحات الأربع» بدلًا من الفاتحة (الخطوة التالية).", {
    tr: "3. ve 4. rekâtta Fâtiha yerine “dört tesbih”i söyleyebilirsiniz (sonraki adım).",
    ur: "تیسری اور چوتھی رکعت میں آپ سورۂ فاتحہ کی جگہ “چار تسبیحات” کہہ سکتے ہیں (اگلا مرحلہ)۔",
    fa: "در رکعت سوم و چهارم می‌توانید به‌جای فاتحه «تسبیحات اربعه» را بگویید (گام بعد).",
    ps: "په دریم او څلورم رکعت کې کولای شئ د الفاتحې پر ځای «څلور تسبیحات» ووایاست (بل ګام).",
    fr: "Dans la 3e et la 4e rak'a, vous pouvez dire les « quatre glorifications » à la place d'Al-Fatiha (étape suivante).",
    es: "En la 3.ª y la 4.ª rak'a puede decir las “cuatro glorificaciones” en lugar de Al-Fatiha (siguiente paso).",
    id: "Pada rakaat ke-3 dan ke-4 Anda boleh membaca “empat tasbih” sebagai pengganti Al-Fatihah (langkah berikutnya).",
    ms: "Pada rakaat ke-3 dan ke-4 anda boleh membaca “empat tasbih” sebagai ganti Al-Fatihah (langkah seterusnya).",
    bn: "তৃতীয় ও চতুর্থ রাকাতে আল-ফাতিহার বদলে আপনি “চার তাসবিহ” বলতে পারেন (পরের ধাপ)।",
    ru: "В 3-м и 4-м ракаате можно сказать «четыре славословия» вместо Аль-Фатихи (следующий шаг).",
    zh: "在第3、第4拉克尔提，您可以念“四项赞颂”来代替开端章（见下一步）。",
  }),
  fourGlorifications: L("Leise, dreimal – oder einmal die Fatiha.", "Silently, three times – or Al-Fatiha once.", "تُقال سرًّا ثلاثَ مرات – أو تُقرأ الفاتحة مرةً واحدة.", {
    tr: "Sessizce, üç kez – ya da bir kez Fâtiha.",
    ur: "آہستہ آواز میں، تین بار – یا ایک بار سورۂ فاتحہ۔",
    fa: "آهسته، سه بار – یا یک بار فاتحه.",
    ps: "په ټیټ غږ، درې ځله – یا یو ځل الفاتحه.",
    fr: "À voix basse, trois fois – ou Al-Fatiha une fois.",
    es: "En voz baja, tres veces – o Al-Fatiha una vez.",
    id: "Dengan pelan, tiga kali – atau Al-Fatihah satu kali.",
    ms: "Perlahan, tiga kali – atau Al-Fatihah sekali.",
    bn: "নিচুস্বরে, তিনবার – অথবা একবার আল-ফাতিহা।",
    ru: "Про себя, трижды – или один раз Аль-Фатиха.",
    zh: "低声念三遍——或念一遍开端章。",
  }),
  surahSunni: L("Nur in den ersten beiden Rakaat.", "Only in the first two rak'at.", "في الركعتين الأُولَيين فقط.", {
    tr: "Yalnızca ilk iki rekâtta.",
    ur: "صرف پہلی دو رکعات میں۔",
    fa: "فقط در دو رکعت نخست.",
    ps: "یوازې په لومړیو دوو رکعتونو کې.",
    fr: "Seulement dans les deux premières rak'at.",
    es: "Solo en las dos primeras rak'at.",
    id: "Hanya pada dua rakaat pertama.",
    ms: "Hanya pada dua rakaat pertama.",
    bn: "শুধু প্রথম দুই রাকাতে।",
    ru: "Только в первых двух ракаатах.",
    zh: "仅在前两拉克尔提。",
  }),
  surahShia: L("Nur in den ersten beiden Rakaat; in der Dscha'fari-Schule eine vollständige Sure.", "Only in the first two rak'at; in the Ja'fari school a complete surah.", "في الركعتين الأُولَيين فقط؛ وفي المذهب الجعفري تُقرأ سورةٌ كاملة.", {
    tr: "Yalnızca ilk iki rekâtta; Caferî mezhebinde tam bir sure.",
    ur: "صرف پہلی دو رکعات میں؛ جعفری مکتب میں پوری سورت۔",
    fa: "فقط در دو رکعت نخست؛ در مذهب جعفری یک سورهٔ کامل.",
    ps: "یوازې په لومړیو دوو رکعتونو کې؛ په جعفري مذهب کې بشپړ سورت.",
    fr: "Seulement dans les deux premières rak'at ; dans l'école ja'farite, une sourate complète.",
    es: "Solo en las dos primeras rak'at; en la escuela yafarí, una sura completa.",
    id: "Hanya pada dua rakaat pertama; dalam mazhab Ja'fari satu surah lengkap.",
    ms: "Hanya pada dua rakaat pertama; dalam mazhab Ja'fari satu surah yang lengkap.",
    bn: "শুধু প্রথম দুই রাকাতে; জাফরি মাযহাবে একটি পূর্ণ সূরা।",
    ru: "Только в первых двух ракаатах; в джафаритском мазхабе – полная сура.",
    zh: "仅在前两拉克尔提；在贾法里学派中须念完整的一章。",
  }),
  qunut: L("Empfohlen: Heben Sie die Hände mit den Handflächen nach oben vor das Gesicht und sprechen Sie ein Bittgebet – vor der Verbeugung der zweiten Raka.", "Recommended: raise your hands, palms up, in front of your face and make a supplication – before the bowing of the second rak'ah.", "مستحبّ: ارفع يديك حِيالَ وجهك وباطنُ كفَّيك إلى السماء، وادعُ بما شئت – وذلك قبل ركوع الركعة الثانية.", {
    tr: "Tavsiye edilir: ellerinizi avuçlarınız yukarı bakacak şekilde yüzünüzün önüne kaldırın ve bir dua edin – ikinci rekâtın rükûsundan önce.",
    ur: "مستحب: اپنے ہاتھ ہتھیلیاں اوپر کر کے چہرے کے سامنے اٹھائیں اور دعا کریں – دوسری رکعت کے رکوع سے پہلے۔",
    fa: "مستحب: دست‌ها را با کف‌های رو به بالا مقابل صورت بلند کنید و دعا کنید – پیش از رکوع رکعت دوم.",
    ps: "سپارښتل شوی: لاسونه د مخ مخې ته، ورغوي پورته، پورته کړئ او دعا وکړئ – د دویم رکعت له رکوع مخکې.",
    fr: "Recommandé : levez les mains, paumes vers le haut, devant votre visage et faites une invocation – avant l'inclinaison de la deuxième rak'a.",
    es: "Recomendado: levante las manos, con las palmas hacia arriba, delante del rostro y haga una súplica – antes de la inclinación de la segunda rak'a.",
    id: "Dianjurkan: angkat kedua tangan dengan telapak menghadap ke atas di depan wajah dan panjatkan doa – sebelum rukuk pada rakaat kedua.",
    ms: "Digalakkan: angkat kedua-dua tangan dengan telapak menghadap ke atas di hadapan muka dan berdoalah – sebelum rukuk pada rakaat kedua.",
    bn: "মুস্তাহাব: দুই হাত তালু উপরের দিকে করে মুখের সামনে তুলুন এবং দোয়া করুন – দ্বিতীয় রাকাতের রুকুর আগে।",
    ru: "Рекомендуется: поднимите руки ладонями вверх перед лицом и обратитесь с мольбой – перед поясным поклоном второго ракаата.",
    zh: "建议：双手掌心向上举到面前并作祈祷——在第二拉克尔提鞠躬之前。",
  }),
  ruku: L("Mit „Allāhu akbar“ verbeugen, Hände auf die Knie, Rücken gerade.", "Bow with “Allāhu akbar”, hands on the knees, back straight.", "اركع قائلًا «الله أكبر»، واضعًا يديك على ركبتيك، مستويَ الظهر.", {
    tr: "“Allāhu akbar” diyerek eğilin, elleriniz dizlerinizin üzerinde, sırtınız düz olsun.",
    ur: "“Allāhu akbar” کہہ کر جھکیں، ہاتھ گھٹنوں پر، پیٹھ سیدھی۔",
    fa: "با گفتن «Allāhu akbar» خم شوید، دست‌ها بر زانوها، پشت راست.",
    ps: "«Allāhu akbar» ووایاست او رکوع وکړئ، لاسونه پر زنګنونو، شا مستقیمه.",
    fr: "Inclinez-vous en disant « Allāhu akbar », les mains sur les genoux, le dos droit.",
    es: "Inclínese diciendo “Allāhu akbar”, con las manos sobre las rodillas y la espalda recta.",
    id: "Rukuklah sambil mengucapkan “Allāhu akbar”, kedua tangan di atas lutut, punggung lurus.",
    ms: "Rukuk sambil menyebut “Allāhu akbar”, kedua-dua tangan di atas lutut, belakang lurus.",
    bn: "“Allāhu akbar” বলে রুকুতে যান, হাত হাঁটুর উপর, পিঠ সোজা।",
    ru: "Склонитесь с «Allāhu akbar», руки на коленях, спина прямая.",
    zh: "说着“Allāhu akbar”鞠躬，双手放在膝盖上，背部挺直。",
  }),
  itidalSunni: L("Ganz aufrichten und kurz ruhig stehen.", "Stand fully upright and be still for a moment.", "اعتدل قائمًا تمامًا، واطمئنَّ لحظة.", {
    tr: "Tamamen dik durun ve bir an sakin kalın.",
    ur: "پوری طرح سیدھے کھڑے ہوں اور لمحہ بھر سکون سے رہیں۔",
    fa: "کاملاً راست بایستید و لحظه‌ای آرام باشید.",
    ps: "بشپړ ولاړ شئ او یوه شېبه آرام اوسئ.",
    fr: "Redressez-vous complètement et restez immobile un instant.",
    es: "Incorpórese por completo y permanezca inmóvil un momento.",
    id: "Berdirilah tegak sepenuhnya dan tenang sejenak.",
    ms: "Berdiri tegak sepenuhnya dan tenang seketika.",
    bn: "পুরোপুরি সোজা হয়ে দাঁড়ান এবং এক মুহূর্ত স্থির থাকুন।",
    ru: "Выпрямитесь полностью и на мгновение замрите.",
    zh: "完全站直，静止片刻。",
  }),
  itidalShia: L("Ganz aufrichten; das Sprechen dieser Worte ist empfohlen.", "Stand fully upright; saying these words is recommended.", "اعتدل قائمًا تمامًا؛ ويُستحبّ قولُ هذا الذكر.", {
    tr: "Tamamen dik durun; bu sözleri söylemek tavsiye edilir.",
    ur: "پوری طرح سیدھے کھڑے ہوں؛ یہ کلمات کہنا مستحب ہے۔",
    fa: "کاملاً راست بایستید؛ گفتن این کلمات مستحب است.",
    ps: "بشپړ ولاړ شئ؛ دا کلمې ویل سپارښتل شوي دي.",
    fr: "Redressez-vous complètement ; il est recommandé de dire ces paroles.",
    es: "Incorpórese por completo; se recomienda decir estas palabras.",
    id: "Berdirilah tegak sepenuhnya; mengucapkan kalimat ini dianjurkan.",
    ms: "Berdiri tegak sepenuhnya; menyebut kalimah ini digalakkan.",
    bn: "পুরোপুরি সোজা হয়ে দাঁড়ান; এই কথাগুলো বলা মুস্তাহাব।",
    ru: "Выпрямитесь полностью; рекомендуется произносить эти слова.",
    zh: "完全站直；建议说这些话。",
  }),
  sujudSunni: L("Mit „Allāhu akbar“ nieder auf sieben Körperteile: Stirn mit Nase, beide Hände, beide Knie, beide Fußspitzen.", "With “Allāhu akbar” down onto seven parts: forehead with nose, both hands, both knees, the toes of both feet.", "اسجد قائلًا «الله أكبر» على الأعضاء السبعة: الجبهة مع الأنف، والكفَّين، والركبتين، وأطراف القدمين.", {
    tr: "“Allāhu akbar” diyerek yedi uzvun üzerine secdeye varın: alın ve burun, iki el, iki diz, iki ayağın parmakları.",
    ur: "“Allāhu akbar” کہہ کر سات اعضاء پر سجدہ کریں: پیشانی اور ناک، دونوں ہاتھ، دونوں گھٹنے، دونوں پاؤں کی انگلیاں۔",
    fa: "با گفتن «Allāhu akbar» بر هفت عضو سجده کنید: پیشانی با بینی، هر دو دست، هر دو زانو، انگشتان هر دو پا.",
    ps: "«Allāhu akbar» ووایاست او پر اوو غړو سجده وکړئ: تندی له پوزې سره، دواړه لاسونه، دواړه زنګنونه، د دواړو پښو ګوتې.",
    fr: "En disant « Allāhu akbar », prosternez-vous sur sept parties : le front avec le nez, les deux mains, les deux genoux, les orteils des deux pieds.",
    es: "Diciendo “Allāhu akbar”, descienda sobre siete partes: la frente con la nariz, ambas manos, ambas rodillas y los dedos de ambos pies.",
    id: "Sambil mengucapkan “Allāhu akbar”, turunlah bersujud pada tujuh anggota: dahi bersama hidung, kedua tangan, kedua lutut, dan ujung jari kedua kaki.",
    ms: "Sambil menyebut “Allāhu akbar”, turun bersujud pada tujuh anggota: dahi bersama hidung, kedua-dua tangan, kedua-dua lutut, dan jari kedua-dua kaki.",
    bn: "“Allāhu akbar” বলে সাতটি অঙ্গের উপর সিজদায় যান: কপাল ও নাক, দুই হাত, দুই হাঁটু, দুই পায়ের আঙুল।",
    ru: "С «Allāhu akbar» опуститесь на семь частей тела: лоб с носом, обе руки, оба колена, пальцы обеих ног.",
    zh: "说着“Allāhu akbar”俯下，以七个部位着地：前额连同鼻子、双手、双膝、双脚的脚趾。",
  }),
  sujudShia: L("Auf sieben Körperteile; die Stirn liegt auf Erde oder auf dem, was aus ihr wächst und nicht gegessen oder getragen wird – meist auf einer Turba (Tontafel).", "On seven parts; the forehead rests on earth or on what grows from it and is not eaten or worn – usually on a turbah (clay tablet).", "على الأعضاء السبعة؛ وتوضع الجبهة على الأرض أو على ما أنبتته مما لا يُؤكل ولا يُلبس – وغالبًا على التربة (قرصٌ من الطين).", {
    tr: "Yedi uzuv üzerine; alın toprağın ya da topraktan bitip yenmeyen ve giyilmeyen bir şeyin üzerine konur – genellikle bir turbah (kil tablet) üzerine.",
    ur: "سات اعضاء پر؛ پیشانی مٹی پر یا اس چیز پر رکھی جاتی ہے جو مٹی سے اگتی ہو اور نہ کھائی جاتی ہو نہ پہنی جاتی ہو – عموماً تربت (مٹی کی ٹکیہ) پر۔",
    fa: "بر هفت عضو؛ پیشانی بر خاک یا بر چیزی که از آن می‌روید و خوردنی و پوشیدنی نیست قرار می‌گیرد – معمولاً بر تربت (لوح گِلی).",
    ps: "پر اوو غړو؛ تندی پر ځمکه یا پر هغه څه ایښودل کېږي چې له هغې راټوکېږي او نه خوړل کېږي او نه اغوستل کېږي – معمولاً پر تربت (د خټې تخته).",
    fr: "Sur sept parties ; le front repose sur la terre ou sur ce qui en pousse et ne se mange ni ne se porte – généralement sur une turbah (tablette d'argile).",
    es: "Sobre siete partes; la frente se apoya sobre la tierra o sobre lo que crece de ella y no se come ni se viste, normalmente sobre una turba (tablilla de arcilla).",
    id: "Pada tujuh anggota; dahi diletakkan di atas tanah atau sesuatu yang tumbuh dari tanah yang tidak dimakan dan tidak dipakai – biasanya di atas turbah (lempengan tanah liat).",
    ms: "Pada tujuh anggota; dahi diletakkan di atas tanah atau sesuatu yang tumbuh daripadanya dan tidak dimakan atau dipakai – biasanya di atas turbah (kepingan tanah liat).",
    bn: "সাতটি অঙ্গের উপর; কপাল থাকে মাটির উপর, অথবা মাটি থেকে উৎপন্ন এমন কিছুর উপর যা খাওয়া বা পরা হয় না – সাধারণত তুরবার (মাটির ফলক) উপর।",
    ru: "На семь частей тела; лоб покоится на земле или на том, что произрастает из неё и не употребляется в пищу и не носится в качестве одежды, – обычно на турбе (глиняной табличке).",
    zh: "以七个部位着地；前额放在泥土上，或放在从泥土中生长出来、既不可食用也不可穿戴的东西上——通常是图尔巴（泥板）。",
  }),
  sitBetween: L("Kurz und ruhig sitzen.", "Sit briefly and calmly.", "اجلس جلسةً قصيرةً مطمئنًّا.", {
    tr: "Kısa ve sakin bir şekilde oturun.",
    ur: "مختصر اور سکون سے بیٹھیں۔",
    fa: "کوتاه و آرام بنشینید.",
    ps: "لږ وخت او په آرامۍ کېنئ.",
    fr: "Asseyez-vous brièvement et calmement.",
    es: "Siéntese brevemente y con calma.",
    id: "Duduklah sejenak dengan tenang.",
    ms: "Duduk seketika dengan tenang.",
    bn: "অল্পক্ষণ শান্তভাবে বসুন।",
    ru: "Сядьте ненадолго и спокойно.",
    zh: "短暂而平静地坐一会儿。",
  }),
  tashSunni: L("Viele heben beim Glaubenszeugnis den Zeigefinger. Die Schafiiten und Malikiten überliefern eine leicht abweichende Fassung – beide sind gültig.", "Many raise the index finger at the testimony. The Shafi'is and Malikis transmit a slightly different wording – both are valid.", "يرفع كثيرٌ من المصلّين السبّابة عند الشهادة. ويروي الشافعية والمالكية صيغةً مختلفةً قليلًا – وكلتاهما صحيحة.", {
    tr: "Birçok kişi şahitlik sırasında işaret parmağını kaldırır. Şâfiîler ve Mâlikîler biraz farklı bir metin nakleder – ikisi de geçerlidir.",
    ur: "بہت سے لوگ شہادت کے وقت شہادت کی انگلی اٹھاتے ہیں۔ شافعی اور مالکی قدرے مختلف الفاظ نقل کرتے ہیں – دونوں درست ہیں۔",
    fa: "بسیاری هنگام شهادت انگشت اشاره را بالا می‌برند. شافعیان و مالکیان عبارتی اندکی متفاوت روایت می‌کنند – هر دو معتبرند.",
    ps: "ډېر خلک په ګواهۍ کې شهادت ګوته پورته کوي. شافعیان او مالکیان یو څه توپیر لرونکې عبارت نقلوي – دواړه معتبر دي.",
    fr: "Beaucoup lèvent l'index lors de l'attestation. Les chaféites et les malékites transmettent une formulation légèrement différente – les deux sont valables.",
    es: "Muchos levantan el dedo índice en el testimonio. Los shafiíes y los malikíes transmiten una formulación ligeramente distinta; ambas son válidas.",
    id: "Banyak orang mengangkat jari telunjuk saat bersaksi. Mazhab Syafi'i dan Maliki meriwayatkan lafaz yang sedikit berbeda – keduanya sah.",
    ms: "Ramai mengangkat jari telunjuk ketika bersaksi. Pengikut mazhab Syafie dan Maliki meriwayatkan lafaz yang sedikit berbeza – kedua-duanya sah.",
    bn: "অনেকে সাক্ষ্যের সময় তর্জনী তোলেন। শাফেয়ী ও মালেকীরা কিছুটা ভিন্ন শব্দবিন্যাস বর্ণনা করেন – উভয়ই বৈধ।",
    ru: "Многие поднимают указательный палец при свидетельстве. Шафииты и маликиты передают немного иной текст – оба варианта действительны.",
    zh: "许多人念作证词时抬起食指。沙斐仪学派和马立克学派传述的措辞略有不同——两者都有效。",
  }),
  salawat: L("Danach dürfen Sie ein eigenes Bittgebet sprechen.", "Afterwards you may make your own supplication.", "ثم لك أن تدعو بما أحببت من الدعاء.", {
    tr: "Ardından kendi duanızı edebilirsiniz.",
    ur: "اس کے بعد آپ اپنی دعا کر سکتے ہیں۔",
    fa: "پس از آن می‌توانید دعای خودتان را بخوانید.",
    ps: "وروسته کولای شئ خپله دعا وکړئ.",
    fr: "Ensuite, vous pouvez faire votre propre invocation.",
    es: "Después puede hacer su propia súplica.",
    id: "Setelah itu Anda boleh memanjatkan doa Anda sendiri.",
    ms: "Selepas itu anda boleh berdoa dengan doa sendiri.",
    bn: "এরপর আপনি নিজের দোয়া করতে পারেন।",
    ru: "После этого можно обратиться с собственной мольбой.",
    zh: "之后您可以作自己的祈祷。",
  }),
  salamLeft: L("Das Gebet ist beendet. Danach: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).", "The prayer is complete. Afterwards: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).", "تمَّت الصلاة. ثم تُسبِّح: «سبحان الله» 33 مرة، و«الحمد لله» 33 مرة، و«الله أكبر» 34 مرة (صحيح مسلم).", {
    tr: "Namaz tamamlandı. Ardından: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).",
    ur: "نماز مکمل ہو گئی۔ اس کے بعد: 33× Subḥāna llāh، 33× al-ḥamdu lillāh، 34× Allāhu akbar (Sahih Muslim)۔",
    fa: "نماز کامل شد. پس از آن: 33× Subḥāna llāh، 33× al-ḥamdu lillāh، 34× Allāhu akbar (Sahih Muslim).",
    ps: "لمونځ بشپړ شو. وروسته: 33× Subḥāna llāh، 33× al-ḥamdu lillāh، 34× Allāhu akbar (Sahih Muslim).",
    fr: "La prière est terminée. Ensuite : 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).",
    es: "La oración ha terminado. Después: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).",
    id: "Shalat selesai. Setelah itu: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).",
    ms: "Solat selesai. Selepas itu: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).",
    bn: "নামাজ সম্পূর্ণ হলো। এরপর: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim)।",
    ru: "Намаз завершён. После него: 33× Subḥāna llāh, 33× al-ḥamdu lillāh, 34× Allāhu akbar (Sahih Muslim).",
    zh: "礼拜完成。之后：33× Subḥāna llāh，33× al-ḥamdu lillāh，34× Allāhu akbar（Sahih Muslim）。",
  }),
  salamShia: L("Der letzte Satz ist der verpflichtende Teil, die ersten beiden sind empfohlen.", "The last sentence is the obligatory part, the first two are recommended.", "الصيغة الأخيرة هي الواجبة، والصيغتان الأُولَيان مستحبّتان.", {
    tr: "Son cümle zorunlu kısımdır, ilk ikisi tavsiye edilir.",
    ur: "آخری جملہ لازم حصہ ہے، پہلے دو مستحب ہیں۔",
    fa: "جملهٔ آخر بخش واجب است و دو جملهٔ نخست مستحب‌اند.",
    ps: "وروستۍ جمله واجب برخه ده، لومړۍ دوې سپارښتل شوې دي.",
    fr: "La dernière phrase est la partie obligatoire, les deux premières sont recommandées.",
    es: "La última frase es la parte obligatoria; las dos primeras son recomendadas.",
    id: "Kalimat terakhir adalah bagian yang wajib, dua kalimat pertama dianjurkan.",
    ms: "Ayat terakhir ialah bahagian yang wajib, dua ayat pertama digalakkan.",
    bn: "শেষ বাক্যটি আবশ্যিক অংশ, প্রথম দুটি মুস্তাহাব।",
    ru: "Последнее предложение – обязательная часть, первые два рекомендуются.",
    zh: "最后一句是必须的部分，前两句是建议的。",
  }),
  threeTakbirs: L("Empfohlen: dreimal „Allāhu akbar“ mit erhobenen Händen; danach der Tasbih der Fatima (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).", "Recommended: “Allāhu akbar” three times raising the hands; then the tasbih of Fatimah (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).", "مستحبّ: التكبير ثلاثًا مع رفع اليدين؛ ثم تسبيح فاطمة الزهراء عليها السلام («الله أكبر» 34 مرة، و«الحمد لله» 33 مرة، و«سبحان الله» 33 مرة).", {
    tr: "Tavsiye edilir: ellerinizi kaldırarak üç kez “Allāhu akbar”; ardından Fâtıma tesbihi (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).",
    ur: "مستحب: ہاتھ اٹھا کر تین بار “Allāhu akbar”؛ پھر تسبیحِ فاطمہ (34× Allāhu akbar، 33× al-ḥamdu lillāh، 33× Subḥāna llāh)۔",
    fa: "مستحب: سه بار «Allāhu akbar» با بالا بردن دست‌ها؛ سپس تسبیح فاطمه (34× Allāhu akbar، 33× al-ḥamdu lillāh، 33× Subḥāna llāh).",
    ps: "سپارښتل شوی: لاسونه پورته کړئ او درې ځله «Allāhu akbar» ووایاست؛ بیا د فاطمې تسبیح (34× Allāhu akbar، 33× al-ḥamdu lillāh، 33× Subḥāna llāh).",
    fr: "Recommandé : « Allāhu akbar » trois fois en levant les mains ; puis le tasbih de Fatima (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).",
    es: "Recomendado: “Allāhu akbar” tres veces levantando las manos; después, el tasbih de Fátima (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).",
    id: "Dianjurkan: “Allāhu akbar” tiga kali sambil mengangkat tangan; lalu tasbih Fatimah (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).",
    ms: "Digalakkan: “Allāhu akbar” tiga kali sambil mengangkat tangan; kemudian tasbih Fatimah (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).",
    bn: "মুস্তাহাব: হাত তুলে তিনবার “Allāhu akbar”; তারপর ফাতিমার তাসবিহ (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh)।",
    ru: "Рекомендуется: трижды «Allāhu akbar» с поднятием рук; затем тасбих Фатимы (34× Allāhu akbar, 33× al-ḥamdu lillāh, 33× Subḥāna llāh).",
    zh: "建议：举起双手说三遍“Allāhu akbar”；然后念法蒂玛的赞词（34× Allāhu akbar，33× al-ḥamdu lillāh，33× Subḥāna llāh）。",
  }),
  standSunni: L("Mit „Allāhu akbar“ aufstehen.", "Stand up with “Allāhu akbar”.", "انهض قائلًا «الله أكبر».", {
    tr: "“Allāhu akbar” diyerek ayağa kalkın.",
    ur: "“Allāhu akbar” کہہ کر کھڑے ہوں۔",
    fa: "با گفتن «Allāhu akbar» برخیزید.",
    ps: "«Allāhu akbar» ووایاست او پاڅئ.",
    fr: "Levez-vous en disant « Allāhu akbar ».",
    es: "Levántese diciendo “Allāhu akbar”.",
    id: "Bangkitlah sambil mengucapkan “Allāhu akbar”.",
    ms: "Bangun sambil menyebut “Allāhu akbar”.",
    bn: "“Allāhu akbar” বলে উঠে দাঁড়ান।",
    ru: "Встаньте со словами «Allāhu akbar».",
    zh: "说着“Allāhu akbar”起身。",
  }),
  standShia: L("Beim Aufstehen empfohlen.", "Recommended while standing up.", "يُستحبّ قولُه عند النهوض.", {
    tr: "Ayağa kalkarken söylenmesi tavsiye edilir.",
    ur: "اٹھتے وقت کہنا مستحب ہے۔",
    fa: "هنگام برخاستن گفتن آن مستحب است.",
    ps: "د پورته کېدو پر مهال ویل سپارښتل شوي دي.",
    fr: "Recommandé en se levant.",
    es: "Recomendado al ponerse de pie.",
    id: "Dianjurkan saat bangkit.",
    ms: "Digalakkan semasa bangun.",
    bn: "উঠে দাঁড়ানোর সময় বলা মুস্তাহাব।",
    ru: "Рекомендуется при вставании.",
    zh: "起身时建议说。",
  }),
};

const s = (rakah: number, posture: Posture, title: L2, txt?: { ar: string; translit: string; meaning: L2; essence?: boolean }, note?: L2, aloud?: boolean): Step => ({ rakah, posture, title, ...(txt ?? {}), note, aloud });

export function buildPrayer(id: (typeof PRAYERS)[number]["id"], tradition: Tradition): Step[] {
  const p = PRAYERS.find((x) => x.id === id)!;
  const sunni = tradition === "sunni";
  const out: Step[] = [];
  const stand: Posture = sunni ? "folded" : "sides";
  out.push(s(1, "stand", TI.niyya, undefined, L(`Stellen Sie sich in Richtung Qibla und fassen Sie im Herzen die Absicht, das ${p.name.de}-Gebet mit ${p.rakat} Rakaat zu beten. Die Absicht wird nicht laut ausgesprochen.`, `Face the qibla and make the intention in your heart to pray ${p.name.en} with ${p.rakat} rak'at. The intention is not said out loud.`, `استقبلِ القبلة، وانوِ بقلبك أداءَ صلاة ${p.ar} ${RAKAT_AR[p.rakat]}. ومحلُّ النيّة القلب، فلا يُجهَر بها.`, {
    tr: `Kıbleye dönün ve kalbinizle ${p.name.tr.toLocaleLowerCase("tr")} namazını ${p.rakat} rekât olarak kılmaya niyet edin. Niyet yüksek sesle söylenmez.`,
    ur: `قبلہ رخ ہوں اور دل میں ${p.name.ur} کی ${p.rakat} رکعات پڑھنے کی نیت کریں۔ نیت بلند آواز سے نہیں کہی جاتی۔`,
    fa: `رو به قبله بایستید و در دل نیت کنید که نماز ${p.name.fa} را در ${p.rakat} رکعت بخوانید. نیت با صدای بلند گفته نمی‌شود.`,
    ps: `قبلې ته مخ کړئ او په زړه کې د ${p.name.ps} لمونځ په ${p.rakat} رکعته کولو نیت وکړئ. نیت په لوړ غږ نه ویل کېږي.`,
    fr: `Tournez-vous vers la qibla et formulez dans votre cœur l'intention de prier ${p.name.fr} avec ${p.rakat} rak'at. L'intention ne se prononce pas à voix haute.`,
    es: `Oriéntese hacia la qibla y formule en su corazón la intención de rezar ${p.name.es} con ${p.rakat} rak'at. La intención no se dice en voz alta.`,
    id: `Menghadaplah ke kiblat dan niatkan di dalam hati untuk shalat ${p.name.id} sebanyak ${p.rakat} rakaat. Niat tidak diucapkan dengan keras.`,
    ms: `Mengadap kiblat dan niatkan dalam hati untuk menunaikan solat ${p.name.ms} sebanyak ${p.rakat} rakaat. Niat tidak disebut dengan kuat.`,
    bn: `কিবলামুখী হয়ে অন্তরে ${p.name.bn} নামাজ ${p.rakat} রাকাত পড়ার নিয়ত করুন। নিয়ত উচ্চস্বরে বলা হয় না।`,
    ru: `Встаньте лицом к кибле и в сердце сделайте намерение совершить намаз ${p.name.ru} в ${p.rakat} ракаата. Намерение вслух не произносится.`,
    zh: `面向基卜拉，在心中立意礼${p.name.zh}，共${p.rakat}拉克尔提。意念不要出声说出来。`,
  })));
  out.push(s(1, "takbir", TI.takbir, T.takbir, N.takbir));
  for (let r = 1; r <= p.rakat; r++) {
    const aloud = p.aloudAll && r <= 2;
    if (r === 1 && sunni) { out.push(s(r, stand, TI.thana, T.thana, N.thana)); out.push(s(r, stand, TI.refuge, T.taawwudh)); }
    if (r <= 2 || !sunni) out.push(s(r, stand, TI.fatiha, T.fatiha, sunni ? (aloud ? N.fatihaSunniAloud : N.fatihaSunniSilent) : r <= 2 ? (aloud ? N.fatihaShiaAloud : N.fatihaShiaSilent) : N.fatihaShiaLater, aloud));
    if (!sunni && r >= 3) out.push(s(r, stand, TI.fourGlorifications, T.tasbihat, N.fourGlorifications));
    if (r <= 2) out.push(s(r, stand, TI.surah, T.ikhlas, sunni ? N.surahSunni : N.surahShia, aloud));
    if (!sunni && r === 2) out.push(s(r, "qunut", TI.qunut, T.qunut, N.qunut));
    out.push(s(r, "ruku", TI.ruku, sunni ? T.rukuSunni : T.rukuShia, N.ruku));
    out.push(s(r, sunni ? "sides" : "sides", TI.itidal, T.rise, sunni ? N.itidalSunni : N.itidalShia));
    for (const n of [1, 2]) {
      out.push(s(r, sunni ? "sujud" : "sujudTurbah", n === 1 ? TI.sujud1 : TI.sujud2, sunni ? T.sujudSunni : T.sujudShia, n === 1 ? (sunni ? N.sujudSunni : N.sujudShia) : undefined));
      if (n === 1) out.push(s(r, "sit", TI.sitBetween, sunni ? T.sitSunni : T.sitShia, N.sitBetween));
    }
    const last = r === p.rakat;
    if (r === 2 || last) {
      out.push(s(r, "tashahhud", last ? TI.tashFinal : TI.tashFirst, sunni ? T.tashSunni : T.tashShia, sunni ? N.tashSunni : undefined));
      if (last) {
        if (sunni) {
          out.push(s(r, "tashahhud", TI.salawat, T.salawat, N.salawat));
          out.push(s(r, "salamR", TI.salamR, T.salam));
          out.push(s(r, "salamL", TI.salamL, T.salam, N.salamLeft));
        } else {
          out.push(s(r, "sit", TI.salamShia, T.salamShia, N.salamShia));
          out.push(s(r, "takbir", TI.threeTakbirs, T.takbir, N.threeTakbirs));
        }
        break;
      }
    }
    out.push(s(r + 1, stand, L(`Aufstehen zur ${r + 1}. Raka`, `Stand up for rak'ah ${r + 1}`, `القيام إلى الركعة ${ORD_AR[r + 1]}`, {
      tr: `${ORD.tr[r + 1]} rekât için kalkın`,
      ur: `${ORD.ur[r + 1]} رکعت کے لیے اٹھیں`,
      fa: `برای رکعت ${ORD.fa[r + 1]} برخیزید`,
      ps: `د ${ORD.ps[r + 1]} رکعت لپاره پاڅئ`,
      fr: `Levez-vous pour la ${ORD.fr[r + 1]} rak'a`,
      es: `Levántese para la ${ORD.es[r + 1]} rak'a`,
      id: `Bangkit untuk rakaat ${ORD.id[r + 1]}`,
      ms: `Bangun untuk rakaat ${ORD.ms[r + 1]}`,
      bn: `${ORD.bn[r + 1]} রাকাতের জন্য উঠুন`,
      ru: `Встаньте ${r + 1 === 2 ? "ко" : "к"} ${ORD.ru[r + 1]} ракаату`,
      zh: `起身进入第${ORD.zh[r + 1]}拉克尔提`,
    }), sunni ? T.takbir : T.bihawl, sunni ? N.standSunni : N.standShia));
  }
  return out;
}
