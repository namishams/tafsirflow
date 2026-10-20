import { BOYS } from "./boys";
import { GIRLS } from "./girls";

// Muslim baby names: data model, helpers and the page texts (de, en, ar; other locales fall back to en).

export type Origin = "quran" | "prophet" | "sahabi" | "sahabiyya" | "ahl-al-bayt" | "arabic" | "other";
export const THEMES = ["faith", "light", "peace", "strength", "knowledge", "nature", "beauty", "joy", "honour", "virtue"] as const;
export type Theme = (typeof THEMES)[number];
export type Gender = "b" | "g";

// [id, Arabic, transliterations "A|B", meaning de, meaning en, meaning ar, origins, themes, Quran verse]
export type RawName = readonly [id: string, ar: string, tr: string, de: string, en: string, arM: string, o: readonly Origin[], t: readonly Theme[], q?: string];

export type BabyName = { key: string; id: string; g: Gender; ar: string; tr: string[]; de: string; en: string; arM: string; o: readonly Origin[]; t: readonly Theme[]; q?: string };

const build = (g: Gender) => (r: RawName): BabyName => ({ key: `${g}:${r[0]}`, id: r[0], g, ar: r[1], tr: r[2].split("|"), de: r[3], en: r[4], arM: r[5], o: r[6], t: r[7], q: r[8] });

export const NAMES: BabyName[] = [...BOYS.map(build("b")), ...GIRLS.map(build("g"))];
export const NAME_BY_KEY = new Map(NAMES.map((n) => [n.key, n]));
export const COUNTS = { b: BOYS.length, g: GIRLS.length };

export type Lang = "de" | "en" | "ar";
export const langOf = (locale: string): Lang => (locale === "de" || locale === "ar" ? locale : "en");
export const meaningOf = (n: BabyName, l: Lang) => (l === "de" ? n.de : l === "ar" ? n.arM : n.en);

// ---- text helpers ----
export const stripHarakat = (s: string) => s.replace(/[ً-ٰٟۖ-ۭـ‌]/g, "");
export const normArabic = (s: string) => stripHarakat(s).replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[^ء-ي]/g, "");
export const normLatin = (s: string) => s.toLowerCase().replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, "");
export const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

export const latinOf = (n: BabyName) => n.tr[0];
export const lengthOf = (n: BabyName, l: Lang) => (l === "ar" ? normArabic(n.ar).length : normLatin(n.tr[0]).length);
export const letterOf = (n: BabyName, l: Lang) => (l === "ar" ? normArabic(n.ar).charAt(0) : normLatin(n.tr[0]).charAt(0).toUpperCase());
export const isAbd = (n: BabyName) => n.id.startsWith("abd");

// Easy for German/English speakers: no sounds such as kh, gh, dh, th or q, at most three syllables, short
export function isEasy(n: BabyName) {
  const s = n.tr[0].toLowerCase();
  if (/kh|gh|dh|th|q|'/.test(s) || isAbd(n)) return false;
  const syl = (s.match(/[aeiouy]+/g) ?? []).length;
  return syl <= 3 && normLatin(s).length <= 8;
}

// A typed name (Latin or Arabic) → a known name, if any (gender preferred)
export function findName(typed: string, prefer?: Gender): BabyName | null {
  const t = typed.trim();
  if (!t) return null;
  const ar = hasArabic(t);
  const k = ar ? normArabic(t) : normLatin(t);
  if (!k) return null;
  const hits = NAMES.filter((n) => (ar ? normArabic(n.ar) === k : n.tr.some((x) => normLatin(x) === k) || normLatin(n.id) === k));
  return hits.find((n) => n.g === prefer) ?? hits[0] ?? null;
}

// Arabic alphabetical order for the A–Z list in the Arabic UI
export const AR_ALPHABET = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split("");

export const ORIGIN_FILTERS = ["quran", "prophet", "companion", "ahl-al-bayt", "arabic", "other"] as const;
export type OriginFilter = (typeof ORIGIN_FILTERS)[number];
export function matchesOrigin(n: BabyName, f: OriginFilter) {
  if (f === "companion") return n.o.includes("sahabi") || n.o.includes("sahabiyya");
  return n.o.includes(f);
}
export const primaryOrigin = (n: BabyName): Origin => n.o[0];

type Dict = Record<string, string>;
const T: Record<Lang, Dict> = {
  de: {
    metaTitle: "Muslimische Vornamen mit Bedeutung – Namen-Finder",
    metaDesc: "Über 300 muslimische Jungen- und Mädchennamen mit arabischer Schreibweise, Bedeutung und Koranvers. Der Namen-Finder schlägt passende Namen für euer Kind vor.",
    kicker: "Namen für euer Kind",
    title: "Ein schöner Name",
    lead: "Muslimische Vornamen, die Familien wirklich tragen – mit arabischer Schreibweise, Bedeutung und dem Vers, in dem der Name oder seine Wurzel im Koran vorkommt. Der Namen-Finder hört euch zu und schlägt drei Namen vor.",
    heroRef: "Koran 19:7",
    tabFinder: "Namen-Finder",
    tabAll: "Alle Namen",
    step: "Schritt {n} von {total}",
    s1: "Die Familie",
    s1d: "Damit wir den Namen zu eurer Familie passend vorschlagen und nicht einen Namen wiederholen.",
    s2: "Das Kind",
    s2d: "Geschlecht, Geburtstermin und Geschwister – alles außer dem Geschlecht ist freiwillig.",
    s3: "Eure Wünsche",
    s3d: "Was soll der Name ausdrücken? Wählt so viel oder so wenig, wie ihr möchtet.",
    s4: "Vorschläge",
    father: "Name des Vaters",
    mother: "Name der Mutter",
    family: "Familienname (freiwillig)",
    fatherPh: "z. B. Ibrahim",
    motherPh: "z. B. Maryam",
    familyPh: "z. B. Yilmaz",
    gender: "Für",
    boy: "Junge",
    girl: "Mädchen",
    both: "Schlagt uns beides vor",
    date: "Geburtsdatum oder errechneter Termin (freiwillig)",
    hijriIs: "Im islamischen Kalender: {date}",
    siblings: "Namen der Geschwister (freiwillig, mit Komma getrennt)",
    siblingsPh: "z. B. Yusuf, Aisha",
    letter: "Anfangsbuchstabe im Vergleich zu den Geschwistern",
    letterAny: "egal",
    letterSame: "gleicher Buchstabe",
    letterDiff: "anderer Buchstabe",
    themesQ: "Was soll der Name ausdrücken?",
    originsQ: "Woher darf der Name kommen?",
    o_quran: "aus dem Koran",
    o_prophet: "Propheten und ihre Familien",
    o_companion: "Gefährten des Propheten ﷺ",
    o_arabic: "arabische Tugend",
    maxLen: "Höchstens so viele Buchstaben",
    any: "beliebig",
    easy: "Leicht auszusprechen auf Deutsch",
    next: "Weiter",
    back: "Zurück",
    find: "Namen finden",
    shuffle: "Neu mischen",
    edit: "Angaben ändern",
    save: "Merken",
    saved: "Gemerkt",
    share: "Teilen",
    copied: "Kopiert",
    forBoy: "Für einen Jungen",
    forGirl: "Für ein Mädchen",
    classical: "Klassisch",
    withFamily: "Mit Familienname",
    v_appears: "Der Name im Koran",
    v_about: "Ein Vers über sie",
    v_root: "Ein Vers aus derselben Wurzel",
    v_theme: "Ein Vers zum Thema {theme}",
    listen: "Anhören",
    verseRef: "Koran {ref}",
    noPool: "Mit diesen Wünschen haben wir keinen passenden Namen gefunden. Lockert einen Filter, dann klappt es.",
    resultLead: "Drei Namen aus den am besten passenden – jedes Mischen zeigt andere.",
    monthNote: "Euer Kind kommt im Monat {month} zur Welt.",
    loved: "Bei Familien beliebt",
    lovedD: "Die Namen, die Familien hier am häufigsten gemerkt haben.",
    lovedEmpty: "Noch hat niemand einen Namen gemerkt – tippt auf „Merken“, um den Anfang zu machen.",
    favTitle: "Eure gemerkten Namen",
    favEmpty: "Noch keine Namen gemerkt. Tippt bei einem Namen auf das Herz.",
    favAdd: "Merken",
    favRemove: "Nicht mehr merken",
    copyList: "Liste kopieren",
    shareList: "Liste teilen",
    filterFor: "Für",
    all: "Alle",
    theme: "Thema",
    origin: "Herkunft",
    letterF: "Anfangsbuchstabe",
    lenF: "Länge",
    search: "Name oder Bedeutung suchen …",
    count: "{n} Namen",
    surprise: "Überrasch mich",
    noMatch: "Kein Name passt zu dieser Auswahl.",
    boysN: "{n} Jungennamen",
    girlsN: "{n} Mädchennamen",
    abdTitle: "Namen der Dienerschaft",
    abdText: "Namen, die die Dienerschaft gegenüber Allah ausdrücken – „Abd“ mit einem Seiner schönen Namen – sind besonders geliebt. Der Prophet ﷺ sagte:",
    abdHadith: "„Die liebsten eurer Namen bei Allah sind Abdullah und Abdurrahman.“",
    abdSrc: "Muslim 2132",
    changeTitle: "Gute Namen statt schlechter",
    changeText: "Der Prophet ﷺ änderte Namen mit schlechter Bedeutung in gute: Eine Tochter Umars hieß ʿĀṣiya („die Ungehorsame“, عاصية – nicht zu verwechseln mit Āsiya, der Frau des Pharao), und er nannte sie Jamila („die Schöne“).",
    changeSrc: "Muslim 2139",
    rulesTitle: "Was wir nie vorschlagen",
    rule1: "Namen, die allein Allah gehören, wie ar-Rahman oder al-Khaliq – sie werden nur mit „Abd“ vergeben.",
    rule2: "Namen, die eine Dienerschaft gegenüber jemand anderem als Allah ausdrücken.",
    rule3: "Namen mit schlechter oder unschöner Bedeutung.",
    rule4: "Den Namen des Vaters, der Mutter oder eines Geschwisters.",
    rightTitle: "Ein Recht des Kindes",
    rightText: "Einen guten Namen zu wählen gehört zu den Rechten des Kindes – er begleitet es ein Leben lang. Wenn ihr unsicher seid, fragt eure Familie und einen Gelehrten.",
    meaningNote: "Bedeutungen sind kurz gefasst; viele Namen tragen mehrere Nuancen.",
    g_b: "Junge",
    g_g: "Mädchen",
  },
  en: {
    metaTitle: "Muslim baby names with meanings – name finder",
    metaDesc: "Over 300 Muslim boys' and girls' names with Arabic spelling, meaning and Quran verse. The name finder suggests fitting names for your child.",
    kicker: "Names for your child",
    title: "A beautiful name",
    lead: "Muslim names that families really use – with Arabic spelling, meaning and the verse where the name or its root appears in the Quran. The name finder listens to you and suggests three names.",
    heroRef: "Quran 19:7",
    tabFinder: "Name finder",
    tabAll: "All names",
    step: "Step {n} of {total}",
    s1: "The family",
    s1d: "So that the name suits your family and doesn't repeat a name you already have.",
    s2: "The child",
    s2d: "Gender, due date and siblings – everything except the gender is optional.",
    s3: "Your wishes",
    s3d: "What should the name express? Choose as much or as little as you like.",
    s4: "Suggestions",
    father: "Father's name",
    mother: "Mother's name",
    family: "Family name (optional)",
    fatherPh: "e.g. Ibrahim",
    motherPh: "e.g. Maryam",
    familyPh: "e.g. Khan",
    gender: "For a",
    boy: "Boy",
    girl: "Girl",
    both: "Suggest both",
    date: "Date of birth or due date (optional)",
    hijriIs: "In the Islamic calendar: {date}",
    siblings: "Siblings' names (optional, separated by commas)",
    siblingsPh: "e.g. Yusuf, Aisha",
    letter: "First letter compared to the siblings",
    letterAny: "no preference",
    letterSame: "same letter",
    letterDiff: "different letter",
    themesQ: "What should the name express?",
    originsQ: "Where may the name come from?",
    o_quran: "from the Quran",
    o_prophet: "prophets and their families",
    o_companion: "companions of the Prophet ﷺ",
    o_arabic: "Arabic virtue",
    maxLen: "At most this many letters",
    any: "any",
    easy: "Easy to pronounce in English",
    next: "Next",
    back: "Back",
    find: "Find names",
    shuffle: "Shuffle again",
    edit: "Change answers",
    save: "Save",
    saved: "Saved",
    share: "Share",
    copied: "Copied",
    forBoy: "For a boy",
    forGirl: "For a girl",
    classical: "Classical form",
    withFamily: "With family name",
    v_appears: "The name in the Quran",
    v_about: "A verse about her",
    v_root: "A verse from the same root",
    v_theme: "A verse on {theme}",
    listen: "Listen",
    verseRef: "Quran {ref}",
    noPool: "We found no name for these wishes. Loosen one filter and try again.",
    resultLead: "Three names from the best matches – every shuffle shows others.",
    monthNote: "Your child is born in the month of {month}.",
    loved: "Most loved by families",
    lovedD: "The names families here have saved most often.",
    lovedEmpty: "No one has saved a name yet – tap “Save” to be the first.",
    favTitle: "Your saved names",
    favEmpty: "No saved names yet. Tap the heart on any name.",
    favAdd: "Save",
    favRemove: "Remove from saved",
    copyList: "Copy list",
    shareList: "Share list",
    filterFor: "For",
    all: "All",
    theme: "Theme",
    origin: "Origin",
    letterF: "First letter",
    lenF: "Length",
    search: "Search a name or meaning …",
    count: "{n} names",
    surprise: "Surprise me",
    noMatch: "No name matches this selection.",
    boysN: "{n} boys' names",
    girlsN: "{n} girls' names",
    abdTitle: "Names of servitude",
    abdText: "Names that express servitude to Allah – “Abd” with one of His beautiful names – are especially beloved. The Prophet ﷺ said:",
    abdHadith: "“The most beloved of your names to Allah are Abdullah and Abdurrahman.”",
    abdSrc: "Muslim 2132",
    changeTitle: "Good names instead of bad ones",
    changeText: "The Prophet ﷺ changed names with a bad meaning into good ones: a daughter of Umar was called ʿĀṣiya (“disobedient”, عاصية – not to be confused with Āsiya, the wife of Pharaoh), and he named her Jamila (“beautiful”).",
    changeSrc: "Muslim 2139",
    rulesTitle: "What we never suggest",
    rule1: "Names that belong to Allah alone, such as ar-Rahman or al-Khaliq – they are only given with “Abd”.",
    rule2: "Names that express servitude to anyone other than Allah.",
    rule3: "Names with a bad or unpleasant meaning.",
    rule4: "The name of the father, the mother or a sibling.",
    rightTitle: "A right of the child",
    rightText: "Choosing a good name is one of the rights of the child – it stays with them for life. If you are unsure, ask your family and a scholar.",
    meaningNote: "Meanings are kept short; many names carry several shades of meaning.",
    g_b: "Boy",
    g_g: "Girl",
  },
  ar: {
    metaTitle: "أسماء المواليد المسلمين ومعانيها – مرشد الأسماء",
    metaDesc: "أكثر من 300 اسم للبنين والبنات بالرسم العربي والمعنى والآية القرآنية، ومرشد يقترح لمولودكم أسماء تناسب عائلتكم.",
    kicker: "أسماء لمولودكم",
    title: "اسمٌ حسن",
    lead: "أسماء تحملها العائلات المسلمة حقًّا، بمعانيها والآية التي ورد فيها الاسم أو جذره في القرآن الكريم. أخبرونا عن عائلتكم، ويقترح عليكم المرشد ثلاثة أسماء.",
    heroRef: "مريم: 7",
    tabFinder: "مرشد الأسماء",
    tabAll: "كل الأسماء",
    step: "الخطوة {n} من {total}",
    s1: "العائلة",
    s1d: "لنقترح اسمًا يناسب عائلتكم ولا يكرر اسمًا موجودًا.",
    s2: "المولود",
    s2d: "الجنس وموعد الولادة والإخوة، وكل ذلك اختياري ما عدا الجنس.",
    s3: "رغباتكم",
    s3d: "ماذا تحبون أن يحمل الاسم من معنى؟ اختاروا ما شئتم.",
    s4: "الاقتراحات",
    father: "اسم الأب",
    mother: "اسم الأم",
    family: "اسم العائلة (اختياري)",
    fatherPh: "مثلًا: إبراهيم",
    motherPh: "مثلًا: مريم",
    familyPh: "مثلًا: الهاشمي",
    gender: "المولود",
    boy: "ولد",
    girl: "بنت",
    both: "اقترحوا لنا الاثنين",
    date: "تاريخ الولادة أو الموعد المتوقع (اختياري)",
    hijriIs: "بالتقويم الهجري: {date}",
    siblings: "أسماء الإخوة (اختياري، تُفصل بفاصلة)",
    siblingsPh: "مثلًا: يوسف، عائشة",
    letter: "الحرف الأول مقارنةً بالإخوة",
    letterAny: "لا يهم",
    letterSame: "الحرف نفسه",
    letterDiff: "حرف مختلف",
    themesQ: "ماذا تحبون أن يعبّر عنه الاسم؟",
    originsQ: "من أين يكون الاسم؟",
    o_quran: "من القرآن",
    o_prophet: "الأنبياء وأهلهم",
    o_companion: "الصحابة رضي الله عنهم",
    o_arabic: "فضيلة عربية",
    maxLen: "عدد الحروف على الأكثر",
    any: "أي عدد",
    easy: "سهل النطق بالألمانية والإنجليزية",
    next: "التالي",
    back: "رجوع",
    find: "اقترح الأسماء",
    shuffle: "اقتراحات أخرى",
    edit: "تعديل الإجابات",
    save: "احفظ",
    saved: "محفوظ",
    share: "مشاركة",
    copied: "تم النسخ",
    forBoy: "لولد",
    forGirl: "لبنت",
    classical: "الاسم الكامل",
    withFamily: "مع اسم العائلة",
    v_appears: "الاسم في القرآن",
    v_about: "آية عنها",
    v_root: "آية من الجذر نفسه",
    v_theme: "آية في معنى {theme}",
    listen: "استمع",
    verseRef: "الآية {ref}",
    noPool: "لم نجد اسمًا يوافق هذه الرغبات. خففوا أحد الشروط وحاولوا مرة أخرى.",
    resultLead: "ثلاثة أسماء من أنسب الأسماء، وفي كل مرة تظهر أسماء أخرى.",
    monthNote: "يولد طفلكم في شهر {month}.",
    loved: "الأكثر حبًّا لدى العائلات",
    lovedD: "الأسماء التي حفظتها العائلات هنا أكثر من غيرها.",
    lovedEmpty: "لم يحفظ أحد اسمًا بعد، اضغطوا «احفظ» لتكونوا أول من يفعل.",
    favTitle: "الأسماء المحفوظة",
    favEmpty: "لا توجد أسماء محفوظة بعد. اضغطوا على القلب بجانب أي اسم.",
    favAdd: "احفظ",
    favRemove: "إزالة من المحفوظات",
    copyList: "نسخ القائمة",
    shareList: "مشاركة القائمة",
    filterFor: "المولود",
    all: "الكل",
    theme: "المعنى",
    origin: "الأصل",
    letterF: "الحرف الأول",
    lenF: "الطول",
    search: "ابحث عن اسم أو معنى …",
    count: "{n} اسمًا",
    surprise: "فاجئني",
    noMatch: "لا يوجد اسم يطابق هذا الاختيار.",
    boysN: "{n} اسمًا للبنين",
    girlsN: "{n} اسمًا للبنات",
    abdTitle: "أسماء العبودية",
    abdText: "الأسماء التي تعبّر عن العبودية لله، أي «عبد» مع اسم من أسمائه الحسنى، محبوبة. قال رسول الله ﷺ:",
    abdHadith: "«إِنَّ أَحَبَّ أَسْمَائِكُمْ إِلَى اللَّهِ عَبْدُ اللَّهِ وَعَبْدُ الرَّحْمَنِ»",
    abdSrc: "رواه مسلم 2132",
    changeTitle: "تغيير الاسم القبيح إلى الحسن",
    changeText: "كان النبي ﷺ يغيّر الأسماء القبيحة إلى أسماء حسنة: كانت لعمر ابنة يقال لها «عاصية» (وليست آسية امرأة فرعون)، فسمّاها رسول الله ﷺ «جميلة».",
    changeSrc: "رواه مسلم 2139",
    rulesTitle: "ما لا نقترحه أبدًا",
    rule1: "الأسماء الخاصة بالله تعالى، مثل الرحمن والخالق، فلا يُسمّى بها إلا مع «عبد».",
    rule2: "الأسماء التي فيها تعبيد لغير الله.",
    rule3: "الأسماء ذات المعاني القبيحة أو غير اللائقة.",
    rule4: "اسم الأب أو الأم أو أحد الإخوة.",
    rightTitle: "حق من حقوق الطفل",
    rightText: "اختيار الاسم الحسن من حقوق الطفل، فهو يرافقه طوال حياته. وإن ترددتم فاستشيروا العائلة وأهل العلم.",
    meaningNote: "المعاني مختصرة، ولكثير من الأسماء أكثر من معنى.",
    g_b: "ولد",
    g_g: "بنت",
  },
};

export const THEME_LABEL: Record<Lang, Record<Theme, string>> = {
  de: { faith: "Glaube", light: "Licht", peace: "Frieden", strength: "Stärke", knowledge: "Wissen", nature: "Natur", beauty: "Schönheit", joy: "Freude", honour: "Ehre", virtue: "Tugend" },
  en: { faith: "Faith", light: "Light", peace: "Peace", strength: "Strength", knowledge: "Knowledge", nature: "Nature", beauty: "Beauty", joy: "Joy", honour: "Honour", virtue: "Virtue" },
  ar: { faith: "الإيمان", light: "النور", peace: "السلام", strength: "القوة", knowledge: "العلم", nature: "الطبيعة", beauty: "الجمال", joy: "الفرح", honour: "الشرف", virtue: "الأخلاق" },
};

export const ORIGIN_LABEL: Record<Lang, Record<Origin | OriginFilter, string>> = {
  de: { quran: "Im Koran", prophet: "Prophet", sahabi: "Gefährte", sahabiyya: "Gefährtin", companion: "Gefährten", "ahl-al-bayt": "Ahl al-Bayt", arabic: "Arabisch", other: "Persisch/Türkisch" },
  en: { quran: "In the Quran", prophet: "Prophet", sahabi: "Companion", sahabiyya: "Companion", companion: "Companions", "ahl-al-bayt": "Ahl al-Bayt", arabic: "Arabic", other: "Persian/Turkish" },
  ar: { quran: "في القرآن", prophet: "نبي", sahabi: "صحابي", sahabiyya: "صحابية", companion: "الصحابة", "ahl-al-bayt": "آل البيت", arabic: "عربي", other: "فارسي/تركي" },
};

// Page text in the reader's language with {placeholders}
export function namesText(locale: string) {
  const l = langOf(locale);
  const d = T[l];
  return (key: string, vars?: Record<string, string | number>) => {
    let s = d[key] ?? T.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
}
