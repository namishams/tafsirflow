import type { L } from "../types";

// Tajweed practice: real places in the Quran (riwayah Hafs 'an 'Asim), by verse key. The verse text comes from the
// Quran API; `word` is only a Latin transliteration of the word(s) the question points at.

export type RuleId =
  | "izhar" | "idgham-ghunnah" | "idgham-no-ghunnah" | "iqlab" | "ikhfa"
  | "ikhfa-shafawi" | "idgham-shafawi" | "izhar-shafawi"
  | "ghunnah" | "qalqalah" | "lam-shamsiyya" | "lam-qamariyya"
  | "madd-muttasil" | "madd-munfasil" | "madd-lazim" | "madd-arid" | "madd-lin" | "madd-silah"
  | "tafkhim-allah" | "tarqiq-allah"
  | "idgham-mutajanisayn" | "idgham-mutaqaribayn" | "idgham-mutamathilayn"
  | "sakt" | "hamzat-wasl";

export const RULES: Record<RuleId, { name: L; hint: L }> = {
  izhar: {
    name: { en: "Izhar (clear pronunciation)", de: "Izhar (deutliche Aussprache)", ar: "الإظهار الحلقي" },
    hint: {
      en: "Nun sakinah or tanwin before a throat letter (ء ه ع ح غ خ) is pronounced clearly, without ghunnah.",
      de: "Sprechen Sie Nun sakinah oder Tanwin vor einem Kehllaut (ء ه ع ح غ خ) deutlich und ohne Nasalierung aus.",
      ar: "تُظهر النون الساكنة أو التنوين قبل حروف الحلق (ء ه ع ح غ خ) دون غنة.",
    },
  },
  "idgham-ghunnah": {
    name: { en: "Idgham with ghunnah", de: "Idgham mit Ghunnah", ar: "الإدغام بغنة" },
    hint: {
      en: "Nun sakinah or tanwin merges into a following ي ن م و with a nasal sound of two counts.",
      de: "Lassen Sie Nun sakinah oder Tanwin vor ي ن م و im folgenden Buchstaben aufgehen, mit zwei Zählzeiten Nasalierung.",
      ar: "تُدغم النون الساكنة أو التنوين في حروف (ينمو) مع غنة بمقدار حركتين.",
    },
  },
  "idgham-no-ghunnah": {
    name: { en: "Idgham without ghunnah", de: "Idgham ohne Ghunnah", ar: "الإدغام بغير غنة" },
    hint: {
      en: "Nun sakinah or tanwin merges completely into a following ل or ر, without any nasal sound.",
      de: "Lassen Sie Nun sakinah oder Tanwin vor ل oder ر vollständig und ohne Nasalierung im folgenden Buchstaben aufgehen.",
      ar: "تُدغم النون الساكنة أو التنوين في اللام والراء إدغامًا كاملًا بلا غنة.",
    },
  },
  iqlab: {
    name: { en: "Iqlab (conversion)", de: "Iqlab (Umwandlung)", ar: "الإقلاب" },
    hint: {
      en: "Before ب, nun sakinah or tanwin turns into a hidden mim with ghunnah.",
      de: "Wandeln Sie Nun sakinah oder Tanwin vor ب in ein verborgenes Mim mit Ghunnah um.",
      ar: "تُقلب النون الساكنة أو التنوين قبل الباء ميمًا مخفاة مع الغنة.",
    },
  },
  ikhfa: {
    name: { en: "Ikhfa (concealment)", de: "Ikhfa (Verbergen)", ar: "الإخفاء الحقيقي" },
    hint: {
      en: "Before the fifteen ikhfa letters, nun sakinah or tanwin is concealed with a ghunnah of two counts.",
      de: "Verbergen Sie Nun sakinah oder Tanwin vor den fünfzehn Ikhfa-Buchstaben mit zwei Zählzeiten Ghunnah.",
      ar: "تُخفى النون الساكنة أو التنوين عند حروف الإخفاء الخمسة عشر مع غنة بمقدار حركتين.",
    },
  },
  "ikhfa-shafawi": {
    name: { en: "Ikhfa shafawi", de: "Ikhfa schafawi (Lippen-Ikhfa)", ar: "الإخفاء الشفوي" },
    hint: {
      en: "Mim sakinah before ب is concealed with ghunnah, the lips touching lightly.",
      de: "Verbergen Sie Mim sakinah vor ب mit Ghunnah, wobei sich die Lippen nur leicht berühren.",
      ar: "تُخفى الميم الساكنة عند الباء مع الغنة.",
    },
  },
  "idgham-shafawi": {
    name: { en: "Idgham shafawi", de: "Idgham schafawi (Lippen-Idgham)", ar: "الإدغام الشفوي" },
    hint: {
      en: "Mim sakinah before another mim merges into it with a ghunnah of two counts.",
      de: "Lassen Sie Mim sakinah vor einem weiteren Mim darin aufgehen, mit zwei Zählzeiten Ghunnah.",
      ar: "تُدغم الميم الساكنة في الميم التي بعدها مع غنة.",
    },
  },
  "izhar-shafawi": {
    name: { en: "Izhar shafawi", de: "Izhar schafawi (Lippen-Izhar)", ar: "الإظهار الشفوي" },
    hint: {
      en: "Mim sakinah before any letter except م and ب is pronounced clearly, especially before و and ف.",
      de: "Sprechen Sie Mim sakinah vor allen Buchstaben außer م und ب deutlich aus, besonders vor و und ف.",
      ar: "تُظهر الميم الساكنة عند جميع الحروف عدا الميم والباء، ويشتد الإظهار عند الواو والفاء.",
    },
  },
  ghunnah: {
    name: { en: "Ghunnah (nasal sound)", de: "Ghunnah (Nasalierung)", ar: "الغنة" },
    hint: {
      en: "A nun or mim with shaddah is held with a nasal sound of two counts.",
      de: "Halten Sie Nun oder Mim mit Schadda zwei Zählzeiten lang nasaliert.",
      ar: "النون والميم المشددتان تُغَنّان بمقدار حركتين.",
    },
  },
  qalqalah: {
    name: { en: "Qalqalah (echo)", de: "Qalqala (Nachschwingen)", ar: "القلقلة" },
    hint: {
      en: "The letters ق ط ب ج د bounce slightly when sakin, most strongly when stopping on them.",
      de: "Lassen Sie ق ط ب ج د im Ruhezustand leicht nachschwingen, am stärksten beim Anhalten.",
      ar: "تُقلقل حروف (قطب جد) إذا سكنت، وتكون أقوى عند الوقف.",
    },
  },
  "lam-shamsiyya": {
    name: { en: "Lam shamsiyya (sun letter)", de: "Lam schamsiyya (Sonnenbuchstabe)", ar: "اللام الشمسية" },
    hint: {
      en: "The lam of the article is not pronounced; the following sun letter is doubled.",
      de: "Sprechen Sie das Lam des Artikels nicht aus; der folgende Sonnenbuchstabe wird verdoppelt.",
      ar: "تُدغم لام التعريف في الحرف الشمسي بعدها فلا تُنطق.",
    },
  },
  "lam-qamariyya": {
    name: { en: "Lam qamariyya (moon letter)", de: "Lam qamariyya (Mondbuchstabe)", ar: "اللام القمرية" },
    hint: {
      en: "The lam of the article is pronounced clearly before a moon letter.",
      de: "Sprechen Sie das Lam des Artikels vor einem Mondbuchstaben deutlich aus.",
      ar: "تُظهر لام التعريف قبل الحروف القمرية.",
    },
  },
  "madd-muttasil": {
    name: { en: "Madd muttasil (connected)", de: "Madd muttasil (verbundene Dehnung)", ar: "المد المتصل" },
    hint: {
      en: "A madd letter followed by hamzah in the same word is lengthened four or five counts.",
      de: "Dehnen Sie einen Madd-Buchstaben, auf den im selben Wort ein Hamza folgt, vier bis fünf Zählzeiten.",
      ar: "حرف المد وبعده همزة في كلمة واحدة، يُمد أربع أو خمس حركات.",
    },
  },
  "madd-munfasil": {
    name: { en: "Madd munfasil (separated)", de: "Madd munfasil (getrennte Dehnung)", ar: "المد المنفصل" },
    hint: {
      en: "A madd letter at the end of a word followed by hamzah at the start of the next is lengthened four or five counts.",
      de: "Dehnen Sie einen Madd-Buchstaben am Wortende vor einem Hamza am Anfang des nächsten Wortes vier bis fünf Zählzeiten.",
      ar: "حرف المد آخر الكلمة والهمزة أول الكلمة التالية، يُمد أربع أو خمس حركات.",
    },
  },
  "madd-lazim": {
    name: { en: "Madd lazim (necessary)", de: "Madd lazim (notwendige Dehnung)", ar: "المد اللازم" },
    hint: {
      en: "A madd letter followed by a permanent sukun or shaddah is always lengthened six counts.",
      de: "Dehnen Sie einen Madd-Buchstaben vor einem festen Sukun oder einer Schadda immer sechs Zählzeiten.",
      ar: "حرف المد وبعده سكون أصلي أو شدة، يُمد ست حركات لزومًا.",
    },
  },
  "madd-arid": {
    name: { en: "Madd 'arid lis-sukun", de: "Madd arid lis-sukun (Dehnung beim Anhalten)", ar: "المد العارض للسكون" },
    hint: {
      en: "When stopping, a madd letter before the last letter may be lengthened two, four or six counts.",
      de: "Beim Anhalten dürfen Sie den Madd-Buchstaben vor dem letzten Buchstaben zwei, vier oder sechs Zählzeiten dehnen.",
      ar: "حرف المد قبل حرف سُكّن للوقف، يجوز مده حركتين أو أربعًا أو ستًا.",
    },
  },
  "madd-lin": {
    name: { en: "Madd lin (soft)", de: "Madd lin (weiche Dehnung)", ar: "مد اللين" },
    hint: {
      en: "A sakin و or ي after a fatha, before a letter stopped on, may be lengthened two, four or six counts.",
      de: "Ein ruhendes و oder ي nach einer Fatha vor dem Buchstaben, auf dem Sie anhalten, darf zwei bis sechs Zählzeiten gedehnt werden.",
      ar: "الواو أو الياء الساكنة بعد فتح قبل حرف موقوف عليه، تُمد حركتين أو أربعًا أو ستًا.",
    },
  },
  "madd-silah": {
    name: { en: "Madd silah (pronoun ha)", de: "Madd sila (Pronomen-Ha)", ar: "مد الصلة" },
    hint: {
      en: "The pronoun ha between two vowelled letters is lengthened by a short madd of two counts.",
      de: "Dehnen Sie das Pronomen-Ha zwischen zwei vokalisierten Buchstaben zwei Zählzeiten.",
      ar: "هاء الضمير بين متحركين توصل بمد بمقدار حركتين.",
    },
  },
  "tafkhim-allah": {
    name: { en: "Heavy lam in Allah", de: "Schweres Lam im Namen Allah", ar: "تفخيم لام لفظ الجلالة" },
    hint: {
      en: "After a fatha or damma, the lam in the name Allah is pronounced heavy.",
      de: "Sprechen Sie das Lam im Namen Allah nach Fatha oder Damma schwer (voll) aus.",
      ar: "تُفخم لام لفظ الجلالة بعد فتح أو ضم.",
    },
  },
  "tarqiq-allah": {
    name: { en: "Light lam in Allah", de: "Leichtes Lam im Namen Allah", ar: "ترقيق لام لفظ الجلالة" },
    hint: {
      en: "After a kasra, the lam in the name Allah is pronounced light.",
      de: "Sprechen Sie das Lam im Namen Allah nach einer Kasra leicht (dünn) aus.",
      ar: "تُرقق لام لفظ الجلالة بعد كسر.",
    },
  },
  "idgham-mutajanisayn": {
    name: { en: "Idgham mutajanisayn", de: "Idgham mutadschanisain (gleiche Artikulationsstelle)", ar: "إدغام المتجانسين" },
    hint: {
      en: "Two letters from the same point of articulation but different qualities: the first, sakin, merges into the second.",
      de: "Zwei Buchstaben mit gleicher Artikulationsstelle, aber verschiedenen Eigenschaften: Der erste, ruhende geht im zweiten auf.",
      ar: "حرفان اتحدا مخرجًا واختلفا صفة، يُدغم الأول الساكن في الثاني.",
    },
  },
  "idgham-mutaqaribayn": {
    name: { en: "Idgham mutaqaribayn", de: "Idgham mutaqaribain (benachbarte Laute)", ar: "إدغام المتقاربين" },
    hint: {
      en: "Two letters close in articulation: the first, sakin, merges into the second.",
      de: "Zwei Buchstaben mit nahe beieinander liegender Artikulation: Der erste, ruhende geht im zweiten auf.",
      ar: "حرفان تقاربا مخرجًا أو صفة، يُدغم الأول الساكن في الثاني.",
    },
  },
  "idgham-mutamathilayn": {
    name: { en: "Idgham mutamathilayn", de: "Idgham mutamathilain (gleiche Buchstaben)", ar: "إدغام المتماثلين" },
    hint: {
      en: "The same letter twice, the first sakin: both are read as one letter with shaddah.",
      de: "Derselbe Buchstabe zweimal, der erste ruhend: Lesen Sie beide als einen Buchstaben mit Schadda.",
      ar: "حرفان متماثلان أولهما ساكن، يُدغم الأول في الثاني فيصيران حرفًا مشددًا.",
    },
  },
  sakt: {
    name: { en: "Sakt (brief pause)", de: "Sakt (kurzes Innehalten)", ar: "السكت" },
    hint: {
      en: "In Hafs, a short pause without taking a breath at four fixed places in the Quran.",
      de: "Halten Sie bei Hafs an vier festen Stellen im Quran kurz inne, ohne Luft zu holen.",
      ar: "سكتة لطيفة دون تنفس في أربعة مواضع عند حفص.",
    },
  },
  "hamzat-wasl": {
    name: { en: "Hamzat al-wasl", de: "Hamzat al-wasl (Verbindungs-Hamza)", ar: "همزة الوصل" },
    hint: {
      en: "This hamzah is pronounced only when starting with the word and dropped when joining it to the previous word.",
      de: "Sprechen Sie diese Hamza nur am Anfang aus; beim Verbinden mit dem vorigen Wort entfällt sie.",
      ar: "همزة تُنطق عند الابتداء وتسقط في الوصل.",
    },
  },
};

export type PracticeItem = { key: string; rule: RuleId; word: string };

export const PRACTICE: PracticeItem[] = [
  // al-Fatiha
  { key: "1:1", rule: "tarqiq-allah", word: "bismillah" },
  { key: "1:1", rule: "lam-shamsiyya", word: "ar-rahman" },
  { key: "1:2", rule: "lam-qamariyya", word: "al-hamdu" },
  { key: "1:2", rule: "tarqiq-allah", word: "lillahi" },
  { key: "1:4", rule: "madd-arid", word: "yawmid-din" },
  { key: "1:5", rule: "madd-arid", word: "nasta'in" },
  { key: "1:6", rule: "hamzat-wasl", word: "ihdina" },
  { key: "1:6", rule: "lam-shamsiyya", word: "as-sirata" },
  { key: "1:7", rule: "izhar", word: "an'amta" },
  { key: "1:7", rule: "izhar-shafawi", word: "'alayhim ghayri" },
  { key: "1:7", rule: "lam-qamariyya", word: "ghayril-maghdubi" },
  { key: "1:7", rule: "madd-lazim", word: "wa lad-dallin" },
  // al-Baqara 1-20
  { key: "2:1", rule: "madd-lazim", word: "alif lam mim" },
  { key: "2:2", rule: "idgham-no-ghunnah", word: "hudan lil-muttaqin" },
  { key: "2:2", rule: "lam-qamariyya", word: "dhalikal-kitabu" },
  { key: "2:3", rule: "lam-shamsiyya", word: "yuqimunas-salata" },
  { key: "2:3", rule: "ghunnah", word: "wa mimma" },
  { key: "2:3", rule: "izhar-shafawi", word: "razaqnahum yunfiqun" },
  { key: "2:3", rule: "ikhfa", word: "yunfiqun" },
  { key: "2:4", rule: "madd-munfasil", word: "bima unzila" },
  { key: "2:4", rule: "ikhfa", word: "min qablika" },
  { key: "2:4", rule: "izhar-shafawi", word: "hum yuqinun" },
  { key: "2:5", rule: "madd-muttasil", word: "ula'ika" },
  { key: "2:5", rule: "idgham-ghunnah", word: "hudan min" },
  { key: "2:5", rule: "idgham-no-ghunnah", word: "min rabbihim" },
  { key: "2:6", rule: "madd-muttasil", word: "sawa'un" },
  { key: "2:6", rule: "izhar-shafawi", word: "am lam" },
  { key: "2:6", rule: "ikhfa", word: "tundhirhum" },
  { key: "2:7", rule: "tafkhim-allah", word: "khatamallahu" },
  { key: "2:7", rule: "izhar", word: "'adhabun 'azim" },
  { key: "2:8", rule: "idgham-ghunnah", word: "man yaqulu" },
  { key: "2:8", rule: "tarqiq-allah", word: "amanna billahi" },
  { key: "2:8", rule: "ikhfa-shafawi", word: "wa ma hum bi-mu'minin" },
  { key: "2:9", rule: "tafkhim-allah", word: "yukhadi'unallaha" },
  { key: "2:10", rule: "idgham-shafawi", word: "qulubihim maradun" },
  { key: "2:10", rule: "idgham-ghunnah", word: "maradan wa lahum" },
  { key: "2:11", rule: "izhar-shafawi", word: "lahum la tufsidu" },
  { key: "2:12", rule: "idgham-no-ghunnah", word: "wa lakin la" },
  { key: "2:13", rule: "madd-muttasil", word: "as-sufaha'u" },
  { key: "2:15", rule: "izhar-shafawi", word: "yamudduhum fi" },
  { key: "2:16", rule: "idgham-mutamathilayn", word: "rabihat tijaratuhum" },
  { key: "2:16", rule: "lam-shamsiyya", word: "ad-dalalata" },
  { key: "2:17", rule: "izhar-shafawi", word: "mathaluhum ka-mathali" },
  { key: "2:17", rule: "idgham-no-ghunnah", word: "zulumatin la yubsirun" },
  { key: "2:18", rule: "iqlab", word: "summun bukmun" },
  { key: "2:18", rule: "izhar", word: "bukmun 'umyun" },
  { key: "2:19", rule: "idgham-ghunnah", word: "ka-sayyibin minas-sama'" },
  { key: "2:19", rule: "madd-muttasil", word: "as-sama'i" },
  { key: "2:19", rule: "iqlab", word: "muhitun bil-kafirin" },
  { key: "2:20", rule: "tafkhim-allah", word: "law sha'allahu" },
  { key: "2:20", rule: "ikhfa", word: "shay'in qadir" },
  // more places for the rarer rules
  { key: "2:27", rule: "iqlab", word: "min ba'di mithaqihi" },
  { key: "2:60", rule: "idgham-mutamathilayn", word: "idrib bi-'asaka" },
  { key: "2:256", rule: "idgham-mutajanisayn", word: "qad tabayyana" },
  { key: "3:72", rule: "idgham-mutajanisayn", word: "wa qalat ta'ifatun" },
  { key: "4:158", rule: "idgham-mutaqaribayn", word: "bal rafa'ahullahu" },
  { key: "7:176", rule: "idgham-mutajanisayn", word: "yalhath dhalik" },
  { key: "17:24", rule: "idgham-mutaqaribayn", word: "wa qul rabbirhamhuma" },
  { key: "18:1", rule: "sakt", word: "'iwaja" },
  { key: "21:87", rule: "idgham-mutamathilayn", word: "idh dhahaba" },
  { key: "36:52", rule: "sakt", word: "min marqadina" },
  { key: "69:1", rule: "madd-lazim", word: "al-haqqah" },
  { key: "75:27", rule: "sakt", word: "man raq" },
  { key: "77:20", rule: "idgham-mutaqaribayn", word: "alam nakhluqkum" },
  { key: "83:14", rule: "sakt", word: "bal ran" },
  { key: "85:13", rule: "madd-silah", word: "innahu huwa" },
  { key: "96:1", rule: "hamzat-wasl", word: "iqra'" },
  { key: "100:11", rule: "ikhfa-shafawi", word: "rabbahum bihim" },
  // al-Qadr
  { key: "97:1", rule: "ghunnah", word: "inna" },
  { key: "97:1", rule: "ikhfa", word: "anzalnahu" },
  { key: "97:1", rule: "qalqalah", word: "laylatil-qadr" },
  { key: "97:2", rule: "madd-munfasil", word: "wa ma adraka" },
  { key: "97:3", rule: "idgham-ghunnah", word: "khayrun min" },
  { key: "97:3", rule: "izhar", word: "min alfi" },
  { key: "97:4", rule: "madd-muttasil", word: "al-mala'ikatu" },
  { key: "97:4", rule: "lam-shamsiyya", word: "war-ruhu" },
  { key: "97:4", rule: "idgham-shafawi", word: "rabbihim min" },
  { key: "97:4", rule: "ikhfa", word: "min kulli" },
  { key: "97:5", rule: "izhar", word: "salamun hiya" },
  { key: "97:5", rule: "lam-qamariyya", word: "matla'il-fajr" },
  // az-Zalzala
  { key: "99:1", rule: "lam-qamariyya", word: "zulzilatil-ardu" },
  { key: "99:3", rule: "lam-qamariyya", word: "al-insanu" },
  { key: "99:4", rule: "ikhfa", word: "yawma'idhin tuhaddithu" },
  { key: "99:6", rule: "idgham-ghunnah", word: "yawma'idhin yasduru" },
  { key: "99:6", rule: "lam-shamsiyya", word: "an-nasu" },
  { key: "99:6", rule: "idgham-no-ghunnah", word: "ashtatan li-yuraw" },
  { key: "99:7", rule: "idgham-ghunnah", word: "fa-man ya'mal" },
  { key: "99:7", rule: "izhar", word: "dharratin khayran" },
  { key: "99:8", rule: "ikhfa", word: "dharratin sharran" },
  // al-'Asr
  { key: "103:1", rule: "lam-qamariyya", word: "wal-'asr" },
  { key: "103:2", rule: "ghunnah", word: "innal-insana" },
  { key: "103:3", rule: "lam-shamsiyya", word: "'amilus-salihati" },
  { key: "103:3", rule: "lam-qamariyya", word: "bil-haqqi" },
  { key: "103:3", rule: "lam-shamsiyya", word: "bis-sabr" },
  // al-Fil
  { key: "105:1", rule: "izhar-shafawi", word: "alam tara" },
  { key: "105:1", rule: "madd-arid", word: "ashabil-fil" },
  { key: "105:2", rule: "qalqalah", word: "yaj'al" },
  { key: "105:2", rule: "izhar-shafawi", word: "kaydahum fi" },
  { key: "105:3", rule: "izhar", word: "tayran ababil" },
  { key: "105:4", rule: "ikhfa-shafawi", word: "tarmihim bi-hijaratin" },
  { key: "105:4", rule: "idgham-ghunnah", word: "hijaratin min" },
  { key: "105:4", rule: "ikhfa", word: "min sijjil" },
  { key: "105:5", rule: "idgham-ghunnah", word: "ka-'asfin ma'kul" },
  { key: "105:5", rule: "madd-arid", word: "ma'kul" },
  // Quraysh
  { key: "106:1", rule: "madd-lin", word: "quraysh" },
  { key: "106:2", rule: "madd-muttasil", word: "ash-shita'i" },
  { key: "106:2", rule: "madd-lin", word: "was-sayf" },
  { key: "106:3", rule: "madd-lin", word: "hadhal-bayt" },
  { key: "106:4", rule: "qalqalah", word: "at'amahum" },
  { key: "106:4", rule: "idgham-shafawi", word: "at'amahum min ju'" },
  { key: "106:4", rule: "ikhfa", word: "min ju'in" },
  { key: "106:4", rule: "izhar", word: "min khawf" },
  // al-Kawthar
  { key: "108:1", rule: "ghunnah", word: "inna a'taynaka" },
  { key: "108:1", rule: "lam-qamariyya", word: "al-kawthar" },
  { key: "108:2", rule: "izhar", word: "wanhar" },
  { key: "108:3", rule: "qalqalah", word: "al-abtar" },
  // an-Nasr
  { key: "110:1", rule: "madd-muttasil", word: "ja'a" },
  { key: "110:1", rule: "tafkhim-allah", word: "nasrullahi" },
  { key: "110:2", rule: "lam-shamsiyya", word: "ra'aytan-nasa" },
  { key: "110:2", rule: "qalqalah", word: "yadkhuluna" },
  { key: "110:2", rule: "tarqiq-allah", word: "dinillahi" },
  { key: "110:3", rule: "hamzat-wasl", word: "wastaghfirh" },
  { key: "110:3", rule: "madd-silah", word: "innahu kana" },
  // al-Masad
  { key: "111:1", rule: "madd-munfasil", word: "yada abi" },
  { key: "111:1", rule: "idgham-ghunnah", word: "lahabin wa tabb" },
  { key: "111:1", rule: "qalqalah", word: "wa tabb" },
  { key: "111:2", rule: "madd-munfasil", word: "ma aghna" },
  { key: "111:2", rule: "izhar", word: "'anhu" },
  { key: "111:2", rule: "madd-silah", word: "maluhu wa ma" },
  { key: "111:3", rule: "ikhfa", word: "naran dhata" },
  { key: "111:4", rule: "madd-silah", word: "wamra'atuhu hammalata" },
  { key: "111:4", rule: "lam-qamariyya", word: "al-hatab" },
  { key: "111:5", rule: "idgham-ghunnah", word: "hablun min" },
  { key: "111:5", rule: "qalqalah", word: "masad" },
  // al-Ikhlas
  { key: "112:1", rule: "tafkhim-allah", word: "huwa allahu" },
  { key: "112:1", rule: "qalqalah", word: "ahad" },
  { key: "112:2", rule: "lam-shamsiyya", word: "allahus-samad" },
  { key: "112:3", rule: "izhar-shafawi", word: "lam yalid" },
  { key: "112:3", rule: "qalqalah", word: "wa lam yulad" },
  { key: "112:4", rule: "idgham-no-ghunnah", word: "yakun lahu" },
  { key: "112:4", rule: "madd-silah", word: "lahu kufuwan" },
  { key: "112:4", rule: "izhar", word: "kufuwan ahad" },
  // al-Falaq
  { key: "113:1", rule: "qalqalah", word: "bi-rabbil-falaq" },
  { key: "113:2", rule: "ikhfa", word: "min sharri" },
  { key: "113:3", rule: "izhar", word: "ghasiqin idha" },
  { key: "113:3", rule: "qalqalah", word: "waqab" },
  { key: "113:4", rule: "lam-shamsiyya", word: "an-naffathati" },
  { key: "113:4", rule: "lam-qamariyya", word: "fil-'uqad" },
  { key: "113:5", rule: "izhar", word: "hasidin idha" },
  // an-Nas
  { key: "114:1", rule: "lam-shamsiyya", word: "an-nas" },
  { key: "114:1", rule: "ghunnah", word: "rabbin-nas" },
  { key: "114:1", rule: "madd-arid", word: "an-nas" },
  { key: "114:4", rule: "ikhfa", word: "min sharril-waswas" },
  { key: "114:4", rule: "lam-qamariyya", word: "al-khannas" },
  { key: "114:4", rule: "ghunnah", word: "al-khannas" },
  { key: "114:6", rule: "lam-qamariyya", word: "minal-jinnati" },
  { key: "114:6", rule: "ghunnah", word: "al-jinnati" },
];
