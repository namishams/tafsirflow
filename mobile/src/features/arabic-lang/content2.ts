import { I, Ln, S, X, type Unit } from "./types";

// Units 6–10 (B1–B2). Explanations in our own words; Quran references only as verse key + word positions.

export const UNITS_B: Unit[] = [
  {
    n: 6, level: "B1",
    title: X("Roots and patterns", "Wurzeln und Muster", "الجذر والوزن", "Kök ve kalıp", "مادہ اور وزن", "Akar dan pola", "Racines et schèmes"),
    lead: X("How one root grows into a family of words – the key to Quranic vocabulary.", "Wie aus einer Wurzel eine Wortfamilie wird – der Schlüssel zum Wortschatz des Korans.", "كيف تتفرع من الجذر أسرة كلمات.", "Bir kökten kelime ailesi nasıl doğar.", "ایک مادے سے الفاظ کا خاندان کیسے بنتا ہے۔", "Bagaimana satu akar menjadi keluarga kata.", "Comment une racine donne une famille de mots."),
    lessons: [
      {
        id: "u6-root",
        title: X("One root, many words", "Eine Wurzel, viele Wörter", "جذر واحد وكلمات كثيرة", "Bir kök, çok kelime", "ایک مادہ، کئی الفاظ", "Satu akar, banyak kata", "Une racine, beaucoup de mots"),
        expl: X("Almost every Arabic word rests on a root of three consonants that carries a basic meaning. k-t-b is about writing: kataba (he wrote), kitāb (book), kātib (writer), maktūb (written), maktab (desk, office), maktaba (library). Patterns (awzān) add the rest of the meaning.", "Fast jedes arabische Wort beruht auf einer Wurzel aus drei Konsonanten mit einer Grundbedeutung. k-t-b dreht sich ums Schreiben: kataba (er schrieb), kitāb (Buch), kātib (Schreiber), maktūb (geschrieben), maktab (Schreibtisch, Büro), maktaba (Bibliothek). Die Muster (awzān) ergänzen den Rest der Bedeutung.", "الجذر يحمل المعنى، والوزن يضيف إليه.", "Kök anlamı taşır, kalıp anlamı tamamlar.", "مادہ معنی دیتا ہے، وزن اسے مکمل کرتا ہے۔", "Akar membawa makna, pola melengkapinya.", "La racine porte le sens, le schème le précise."),
        items: [
          I("كَتَبَ", "kataba", "he wrote", "er schrieb"), I("كِتَابٌ", "kitābun", "book", "Buch"),
          I("كَاتِبٌ", "kātibun", "writer", "Schreiber"), I("مَكْتُوبٌ", "maktūbun", "written", "geschrieben"),
          I("مَكْتَبٌ", "maktabun", "desk, office", "Schreibtisch, Büro"), I("مَكْتَبَةٌ", "maktabatun", "library", "Bibliothek"),
        ],
        roots: ["ك ت ب", "ع ل م", "ر ح م"],
      },
      {
        id: "u6-part",
        title: X("Doer and done: fāʿil and mafʿūl", "Täter und Getanes: fāʿil und mafʿūl", "اسم الفاعل واسم المفعول", "Ism-i fail ve ism-i meful", "اسم فاعل اور اسم مفعول", "Isim fa'il dan maf'ul", "Participes actif et passif"),
        expl: X("The pattern fāʿil names the one who does something: ʿālim, one who knows. mafʿūl names what it is done to: maʿlūm, known. With these two patterns you can understand words you have never seen.", "Das Muster fāʿil bezeichnet den, der etwas tut: ʿālim, einer, der weiß. mafʿūl bezeichnet das, woran es getan wird: maʿlūm, bekannt. Mit diesen beiden Mustern verstehen Sie Wörter, die Sie nie gesehen haben.", "فاعل لمن فعل، ومفعول لمن وقع عليه الفعل.", "fāʿil yapan, mafʿūl yapılan içindir.", "فاعل کرنے والا، مفعول جس پر کام ہوا۔", "fā'il pelaku, maf'ūl yang dikenai.", "fāʿil celui qui fait, mafʿūl ce qui est fait."),
        conj: { title: X("Patterns on f-ʿ-l", "Muster auf f-ʿ-l"), rows: [["فَاعِلٌ", "عَالِمٌ", "ʿālim"], ["مَفْعُولٌ", "مَعْلُومٌ", "maʿlūm"], ["فَاعِلٌ", "ظَالِمٌ", "ẓālim"], ["مَفْعُولٌ", "مَظْلُومٌ", "maẓlūm"], ["فَاعِلٌ", "شَاكِرٌ", "shākir"], ["مَفْعُولٌ", "مَشْكُورٌ", "mashkūr"]] },
        items: [
          I("عَالِمٌ", "ʿālimun", "one who knows, scholar", "Wissender, Gelehrter"), I("مَعْلُومٌ", "maʿlūmun", "known", "bekannt"),
          I("نَاصِرٌ", "nāṣirun", "helper", "Helfer"), I("مَنْصُورٌ", "manṣūrun", "helped, victorious", "unterstützt, siegreich"),
          I("ظَالِمٌ", "ẓālimun", "wrongdoer", "Unrechttuender"), I("مَظْلُومٌ", "maẓlūmun", "wronged", "Unrecht erleidend"),
        ],
        spot: [S("1:4", [1], X("Tap the word on the pattern fāʿil (“Master, Owner”).", "Tippen Sie auf das Wort im Muster fāʿil („Herrscher, Besitzer“).", "اضغط على الكلمة على وزن فاعل.", "fāʿil kalıbındaki kelimeye dokunun.", "وزن فاعل والے لفظ پر ٹیپ کریں۔", "Ketuk kata berpola fā'il.", "Touchez le mot au schème fāʿil."))],
      },
      {
        id: "u6-place",
        title: X("Places: mafʿal", "Orte: mafʿal", "اسم المكان", "Mekân ismi", "اسم ظرف", "Isim tempat", "Noms de lieu"),
        expl: X("The pattern mafʿal or mafʿil names the place where something happens. sajada is “to prostrate”, masjid the place of prostration. dakhala “to enter”, madkhal the entrance.", "Das Muster mafʿal oder mafʿil bezeichnet den Ort, an dem etwas geschieht. sajada heißt „sich niederwerfen“, masjid der Ort der Niederwerfung. dakhala „eintreten“, madkhal der Eingang.", "مَفْعَل ومَفْعِل للمكان: مسجد، مدخل.", "mafʿal/mafʿil mekân bildirir: masjid.", "مَفعَل/مَفعِل جگہ کے لیے: مسجد۔", "maf'al/maf'il untuk tempat: masjid.", "mafʿal/mafʿil désigne un lieu : masjid."),
        items: [
          I("مَسْجِدٌ", "masjidun", "mosque (place of prostration)", "Moschee (Ort der Niederwerfung)"),
          I("مَدْخَلٌ", "madkhalun", "entrance", "Eingang"), I("مَخْرَجٌ", "makhrajun", "exit", "Ausgang"),
          I("مَطْبَخٌ", "maṭbakhun", "kitchen", "Küche"), I("مَلْعَبٌ", "malʿabun", "playground, stadium", "Spielplatz, Stadion"),
          I("مَنْزِلٌ", "manzilun", "home, dwelling", "Wohnung, Heim"),
        ],
      },
      {
        id: "u6-adjpat",
        title: X("Qualities: faʿīl, faʿūl, faʿʿāl", "Eigenschaften: faʿīl, faʿūl, faʿʿāl", "الصفة المشبهة وصيغ المبالغة", "Sıfat kalıpları", "صفت مشبہ اور مبالغہ", "Pola sifat", "Schèmes d'adjectifs"),
        expl: X("faʿīl describes a lasting quality: kabīr (big), raḥīm (merciful), ʿalīm (knowing). faʿūl and faʿʿāl intensify: ghafūr and ghaffār, “who forgives much”. Many Names of Allah use these patterns.", "faʿīl beschreibt eine bleibende Eigenschaft: kabīr (groß), raḥīm (barmherzig), ʿalīm (wissend). faʿūl und faʿʿāl verstärken: ghafūr und ghaffār, „der viel vergibt“. Viele Namen Allahs folgen diesen Mustern.", "فعيل للصفة الثابتة، وفعول وفعّال للمبالغة.", "faʿīl kalıcı nitelik, faʿūl/faʿʿāl mübalağa.", "فعیل مستقل صفت، فعول/فعّال مبالغہ۔", "fa'īl sifat tetap, fa'ūl/fa''āl intensif.", "faʿīl qualité durable, faʿūl/faʿʿāl intensif."),
        items: [
          I("كَبِيرٌ", "kabīrun", "big", "groß"), I("رَحِيمٌ", "raḥīmun", "merciful", "barmherzig"),
          I("عَلِيمٌ", "ʿalīmun", "all-knowing", "allwissend"), I("غَفُورٌ", "ghafūrun", "most forgiving", "allvergebend"),
          I("شَكُورٌ", "shakūrun", "most thankful", "sehr dankbar"), I("تَوَّابٌ", "tawwābun", "who accepts repentance again and again", "der die Reue stets annimmt"),
        ],
        spot: [S("1:3", [2], X("Tap the word on the pattern faʿīl.", "Tippen Sie auf das Wort im Muster faʿīl.", "اضغط على الكلمة على وزن فعيل.", "faʿīl kalıbındaki kelimeye dokunun.", "وزن فعیل والے لفظ پر ٹیپ کریں۔", "Ketuk kata berpola fa'īl.", "Touchez le mot au schème faʿīl."))],
      },
      {
        id: "u6-masdar",
        title: X("The verbal noun (maṣdar)", "Das Verbalnomen (maṣdar)", "المصدر", "Mastar", "مصدر", "Mashdar", "Le nom verbal (maṣdar)"),
        expl: X("Every verb has a noun for the action itself: kitāba (writing), qirāʾa (reading), ʿilm (knowledge), ṣabr (patience). For the basic verb the maṣdar must be learned; for the derived forms it is predictable (unit 7).", "Jedes Verb hat ein Nomen für die Handlung selbst: kitāba (das Schreiben), qirāʾa (das Lesen), ʿilm (Wissen), ṣabr (Geduld). Beim Grundverb muss man den maṣdar lernen; bei den abgeleiteten Stämmen ist er vorhersagbar (Einheit 7).", "المصدر اسم الحدث.", "Mastar, eylemin adıdır.", "مصدر کام کا نام ہے۔", "Mashdar adalah nama perbuatan.", "Le maṣdar nomme l'action."),
        items: [
          I("كِتَابَةٌ", "kitābatun", "writing", "das Schreiben"), I("قِرَاءَةٌ", "qirāʾatun", "reading", "das Lesen"),
          I("ذَهَابٌ", "dhahābun", "going", "das Gehen"), I("عِلْمٌ", "ʿilmun", "knowledge", "Wissen"),
          I("صَبْرٌ", "ṣabrun", "patience", "Geduld"), I("شُكْرٌ", "shukrun", "gratitude", "Dank"),
        ],
        spot: [S("1:2", [1], X("Tap the maṣdar “praise”.", "Tippen Sie auf den maṣdar „Lob“.", "اضغط على المصدر «الحمد».", "“Hamd” mastarına dokunun.", "مصدر «الحمد» پر ٹیپ کریں۔", "Ketuk mashdar “pujian”.", "Touchez le maṣdar « louange »."))],
      },
      {
        id: "u6-family",
        title: X("Word family ʿ-l-m", "Wortfamilie ʿ-l-m", "أسرة الجذر ع ل م", "ʿ-l-m kelime ailesi", "مادہ ع ل م کا خاندان", "Keluarga akar ʿ-l-m", "La famille ʿ-l-m"),
        expl: X("Knowledge is one of the most frequent themes of the Quran. Watch how the root ʿ-l-m moves through the patterns you have learned – then explore other roots yourself in the root explorer.", "Wissen ist eines der häufigsten Themen des Korans. Sehen Sie, wie die Wurzel ʿ-l-m durch die gelernten Muster wandert – und erkunden Sie danach selbst weitere Wurzeln im Wurzel-Explorer.", "تتبّع الجذر ع ل م في الأوزان.", "ʿ-l-m kökünü kalıplarda izleyin.", "مادہ ع ل م کو اوزان میں دیکھیں۔", "Ikuti akar ʿ-l-m dalam pola-pola.", "Suivez ʿ-l-m à travers les schèmes."),
        items: [
          I("عَلِمَ", "ʿalima", "he knew", "er wusste"), I("عِلْمٌ", "ʿilmun", "knowledge", "Wissen"),
          I("عَالِمٌ", "ʿālimun", "scholar", "Gelehrter"), I("عَلِيمٌ", "ʿalīmun", "all-knowing", "allwissend"),
          I("مُعَلِّمٌ", "muʿallimun", "teacher", "Lehrer"), I("تَعَلَّمَ", "taʿallama", "he learned", "er lernte"),
        ],
        roots: ["ع ل م", "ق و ل", "ه د ي", "ص ل و"],
      },
      {
        id: "u6-quran",
        title: X("Quran words: people", "Koranwörter: Menschen", "كلمات قرآنية: الناس", "Kur'an kelimeleri: insanlar", "قرآنی الفاظ: لوگ", "Kata Al-Qur'an: manusia", "Mots du Coran : les gens"),
        expl: X("People, messengers, believers and those who turn away: the Quran speaks about and to people constantly.", "Menschen, Gesandte, Gläubige und die sich Abwendenden: Der Koran spricht ständig über Menschen und zu ihnen.", "القرآن يخاطب الناس ويتحدث عنهم.", "Kur'an insanlara hitap eder.", "قرآن لوگوں سے مخاطب ہے۔", "Al-Qur'an berbicara kepada manusia.", "Le Coran s'adresse aux gens."),
        deck: { id: "people", from: 0, n: 12 },
      },
    ],
  },
  {
    n: 7, level: "B1",
    title: X("Verb forms II–X", "Verbstämme II–X", "الأفعال المزيدة", "Mezid fiiller II–X", "ابواب مزید فیہ", "Bentuk kata kerja II–X", "Les formes verbales II–X"),
    lead: X("How added letters change a verb's meaning – with real Quran verbs.", "Wie zusätzliche Buchstaben die Bedeutung eines Verbs verändern – mit echten Koranverben.", "كيف تغيّر الزيادة معنى الفعل.", "Ek harfler fiilin anlamını nasıl değiştirir.", "زائد حروف فعل کا معنی کیسے بدلتے ہیں۔", "Bagaimana tambahan huruf mengubah makna.", "Comment les lettres ajoutées changent le sens."),
    lessons: [
      {
        id: "u7-overview",
        title: X("The ten forms at a glance", "Die zehn Stämme im Überblick", "الأوزان العشرة", "On bab", "دس ابواب", "Sepuluh bentuk", "Les dix formes"),
        expl: X("From one root, up to ten verb forms can be built by adding letters. Grammarians show them on the model root f-ʿ-l. Each form tends to add a shade of meaning: II makes something happen, III involves another person, V and VI are reflexive or mutual, X asks for something.", "Aus einer Wurzel lassen sich durch zusätzliche Buchstaben bis zu zehn Verbstämme bilden. Grammatiker zeigen sie an der Musterwurzel f-ʿ-l. Jeder Stamm fügt meist eine Nuance hinzu: II bewirkt etwas, III bezieht eine andere Person ein, V und VI sind rückbezüglich oder gegenseitig, X erbittet etwas.", "الأوزان تُعرض على فعل، ولكل وزن معنى غالب.", "Bablar f-ʿ-l üzerinde gösterilir.", "ابواب فعل کے وزن پر دکھائے جاتے ہیں۔", "Bentuk-bentuk ditunjukkan dengan pola f-'-l.", "Les formes se montrent sur la racine f-ʿ-l."),
        conj: { title: X("Forms on f-ʿ-l", "Stämme auf f-ʿ-l"), rows: [["I", "فَعَلَ", "faʿala"], ["II", "فَعَّلَ", "faʿʿala"], ["III", "فَاعَلَ", "fāʿala"], ["IV", "أَفْعَلَ", "afʿala"], ["V", "تَفَعَّلَ", "tafaʿʿala"], ["VI", "تَفَاعَلَ", "tafāʿala"], ["VII", "اِنْفَعَلَ", "infaʿala"], ["VIII", "اِفْتَعَلَ", "iftaʿala"], ["X", "اِسْتَفْعَلَ", "istafʿala"]] },
        items: [
          I("عَلِمَ", "ʿalima", "he knew (I)", "er wusste (I)"), I("عَلَّمَ", "ʿallama", "he taught (II)", "er lehrte (II)"),
          I("تَعَلَّمَ", "taʿallama", "he learned (V)", "er lernte (V)"), I("اِسْتَعْلَمَ", "istaʿlama", "he inquired (X)", "er erkundigte sich (X)"),
          I("كَبَّرَ", "kabbara", "he magnified, said Allāhu akbar (II)", "er pries die Größe, sagte Allāhu akbar (II)"),
        ],
      },
      {
        id: "u7-23",
        title: X("Forms II and III", "Stämme II und III", "فعّل وفاعل", "II ve III. bab", "باب تفعیل و مفاعلہ", "Bentuk II dan III", "Formes II et III"),
        expl: X("Form II doubles the middle letter and often means “to make (someone) do”: ʿalima → ʿallama, to teach. Form III lengthens the first vowel and involves another person: sāfara (to travel), jāhada (to strive), sāʿada (to help someone).", "Stamm II verdoppelt den mittleren Buchstaben und heißt oft „(jemanden) etwas tun lassen“: ʿalima → ʿallama, lehren. Stamm III dehnt den ersten Vokal und bezieht eine andere Person ein: sāfara (reisen), jāhada (sich bemühen), sāʿada (jemandem helfen).", "فعّل للتعدية، وفاعل للمشاركة.", "II geçişlilik, III karşılıklılık bildirir.", "تفعیل تعدیہ، مفاعلہ مشارکت کے لیے۔", "II menjadikan, III melibatkan orang lain.", "II factitif, III implique un autre."),
        items: [
          I("عَلَّمَ", "ʿallama", "he taught", "er lehrte"), I("ذَكَّرَ", "dhakkara", "he reminded", "er erinnerte"),
          I("نَزَّلَ", "nazzala", "he sent down (step by step)", "er sandte (nach und nach) herab"), I("سَافَرَ", "sāfara", "he travelled", "er reiste"),
          I("سَاعَدَ", "sāʿada", "he helped", "er half"), I("جَاهَدَ", "jāhada", "he strove", "er bemühte sich"),
        ],
      },
      {
        id: "u7-4",
        title: X("Form IV: afʿala", "Stamm IV: afʿala", "أفعل", "IV. bab: if'al", "باب افعال", "Bentuk IV", "Forme IV"),
        expl: X("Form IV puts a- before the root and makes a verb causative: nazala (to come down) → anzala (to send down); kharaja (to go out) → akhraja (to bring out). Its present begins with yu-: yunzilu.", "Stamm IV setzt a- vor die Wurzel und macht ein Verb veranlassend: nazala (herabkommen) → anzala (herabsenden); kharaja (hinausgehen) → akhraja (hinausbringen). Sein Präsens beginnt mit yu-: yunzilu.", "أفعل للتعدية: نزل ← أنزل.", "IV. bab geçişli yapar: nazala → anzala.", "باب افعال متعدی بناتا ہے: نزل ← أنزل۔", "Bentuk IV kausatif: nazala → anzala.", "La forme IV est causative : nazala → anzala."),
        items: [
          I("أَنْزَلَ", "anzala", "he sent down", "er sandte herab"), I("أَرْسَلَ", "arsala", "he sent", "er sandte"),
          I("أَسْلَمَ", "aslama", "he submitted (to God)", "er ergab sich (Gott)"), I("أَكْرَمَ", "akrama", "he honoured", "er ehrte"),
          I("أَعْطَى", "aʿṭā", "he gave", "er gab"), I("أَخْرَجَ", "akhraja", "he brought out", "er brachte hinaus"),
        ],
        spot: [
          S("97:1", [2], X("Tap the form IV verb “We sent it down”.", "Tippen Sie auf das Verb im Stamm IV „Wir sandten ihn herab“.", "اضغط على «أنزلناه».", "IV. bab fiil “indirdik”e dokunun.", "«أنزلناه» پر ٹیپ کریں۔", "Ketuk “Kami menurunkannya”.", "Touchez « Nous l'avons fait descendre »."),),
          S("1:7", [3], X("Tap the form IV verb “You have blessed”.", "Tippen Sie auf das Verb im Stamm IV „Du hast begnadet“.", "اضغط على «أنعمت».", "“Nimet verdin” fiiline dokunun.", "«أنعمت» پر ٹیپ کریں۔", "Ketuk “Engkau beri nikmat”.", "Touchez « Tu as comblé »."),),
        ],
      },
      {
        id: "u7-56",
        title: X("Forms V and VI", "Stämme V und VI", "تفعّل وتفاعل", "V ve VI. bab", "باب تفعّل و تفاعل", "Bentuk V dan VI", "Formes V et VI"),
        expl: X("Form V is the reflexive of II: ʿallama (to teach) → taʿallama (to learn, to teach oneself). Form VI is the mutual of III: taʿāwana, to help one another. Both begin with ta-.", "Stamm V ist das Rückbezügliche zu II: ʿallama (lehren) → taʿallama (lernen, sich selbst lehren). Stamm VI ist das Gegenseitige zu III: taʿāwana, einander helfen. Beide beginnen mit ta-.", "تفعّل مطاوع فعّل، وتفاعل للمشاركة.", "V dönüşlü, VI karşılıklıdır.", "تفعّل مطاوعت، تفاعل باہمی عمل۔", "V refleksif, VI saling.", "V réfléchi, VI réciproque."),
        items: [
          I("تَعَلَّمَ", "taʿallama", "he learned", "er lernte"), I("تَكَلَّمَ", "takallama", "he spoke", "er sprach"),
          I("تَوَكَّلَ", "tawakkala", "he put his trust (in God)", "er vertraute (auf Gott)"), I("تَعَاوَنَ", "taʿāwana", "he cooperated", "er arbeitete zusammen"),
          I("تَسَاءَلَ", "tasāʾala", "he asked (one another)", "er fragte (einander)"), I("تَبَارَكَ", "tabāraka", "blessed is (He)", "gesegnet ist (Er)"),
        ],
      },
      {
        id: "u7-78",
        title: X("Forms VII and VIII", "Stämme VII und VIII", "انفعل وافتعل", "VII ve VIII. bab", "باب انفعال و افتعال", "Bentuk VII dan VIII", "Formes VII et VIII"),
        expl: X("Form VII (in-) is often passive in sense: inqalaba, to be turned over. Form VIII puts a t after the first root letter: ijtamaʿa (to gather), istamaʿa (to listen). With w-q-y the t assimilates: ittaqā, to be mindful of God – the root of taqwā.", "Stamm VII (in-) ist oft passivisch: inqalaba, umgedreht werden. Stamm VIII setzt ein t nach den ersten Wurzelbuchstaben: ijtamaʿa (sich versammeln), istamaʿa (zuhören). Bei w-q-y gleicht sich das t an: ittaqā, gottesfürchtig sein – die Wurzel von taqwā.", "انفعل للمطاوعة، وافتعل بتاء بعد الفاء.", "VII edilgen anlamlı, VIII'de t eklenir.", "انفعال مطاوعت، افتعال میں ت بڑھتی ہے۔", "VII pasif, VIII menyisipkan t.", "VII sens passif, VIII insère un t."),
        items: [
          I("اِنْقَلَبَ", "inqalaba", "he turned back", "er kehrte um"), I("اِنْطَلَقَ", "inṭalaqa", "he set off", "er brach auf"),
          I("اِجْتَمَعَ", "ijtamaʿa", "he gathered", "er versammelte sich"), I("اِسْتَمَعَ", "istamaʿa", "he listened", "er hörte zu"),
          I("اِتَّقَى", "ittaqā", "he was mindful of God", "er war gottesfürchtig"), I("اِخْتَلَفَ", "ikhtalafa", "he differed", "er war uneins"),
        ],
      },
      {
        id: "u7-10",
        title: X("Form X: asking for", "Stamm X: erbitten", "استفعل", "X. bab: istif'al", "باب استفعال", "Bentuk X", "Forme X"),
        expl: X("Form X adds ista- and often means “to seek” something: ghafara (to forgive) → istaghfara (to ask forgiveness); ʿāna (to help) → istaʿāna (to seek help). Its participle mustaqīm (“upright, straight”) comes from q-w-m.", "Stamm X setzt ista- davor und heißt oft „etwas erbitten“: ghafara (vergeben) → istaghfara (um Vergebung bitten); ʿāna (helfen) → istaʿāna (um Hilfe bitten). Sein Partizip mustaqīm („aufrecht, gerade“) kommt von q-w-m.", "استفعل للطلب: استغفر، استعان.", "X. bab talep bildirir: istaghfara.", "استفعال طلب کے لیے: استغفر۔", "Bentuk X untuk meminta: istaghfara.", "La forme X exprime la demande : istaghfara."),
        items: [
          I("اِسْتَغْفَرَ", "istaghfara", "he asked forgiveness", "er bat um Vergebung"), I("اِسْتَعَانَ", "istaʿāna", "he sought help", "er bat um Hilfe"),
          I("اِسْتَقَامَ", "istaqāma", "he stood firm, was upright", "er blieb standhaft"), I("اِسْتَطَاعَ", "istaṭāʿa", "he was able", "er vermochte"),
          I("اِسْتَخْدَمَ", "istakhdama", "he used", "er benutzte"), I("اِسْتَقْبَلَ", "istaqbala", "he received, welcomed", "er empfing"),
        ],
        spot: [
          S("1:5", [4], X("Tap the form X verb “we seek help”.", "Tippen Sie auf das Verb im Stamm X „wir bitten um Hilfe“.", "اضغط على «نستعين».", "X. bab fiil “yardım dileriz”e dokunun.", "«نستعين» پر ٹیپ کریں۔", "Ketuk “kami memohon pertolongan”.", "Touchez « nous implorons le secours »."),),
          S("1:6", [3], X("Tap the form X participle “straight”.", "Tippen Sie auf das Partizip des Stammes X „gerade“.", "اضغط على «المستقيم».", "“Dosdoğru” kelimesine dokunun.", "«المستقيم» پر ٹیپ کریں۔", "Ketuk “yang lurus”.", "Touchez « droit »."),),
        ],
      },
      {
        id: "u7-quran",
        title: X("Quran words: qualities", "Koranwörter: Eigenschaften", "كلمات قرآنية: الصفات", "Kur'an kelimeleri: sıfatlar", "قرآنی الفاظ: صفات", "Kata Al-Qur'an: sifat", "Mots du Coran : qualités"),
        expl: X("Good, evil, true, great, near: describing words that the Quran uses again and again. Look for the patterns you know.", "Gut, böse, wahr, groß, nah: beschreibende Wörter, die der Koran immer wieder verwendet. Suchen Sie die Muster, die Sie kennen.", "صفات متكررة في القرآن.", "Kur'an'da sık geçen sıfatlar.", "قرآن میں بار بار آنے والی صفات۔", "Sifat yang sering muncul.", "Des adjectifs fréquents."),
        deck: { id: "qualities", from: 0, n: 12 },
      },
    ],
  },
  {
    n: 8, level: "B1",
    title: X("Numbers, particles, relative clauses", "Zahlen, Partikeln, Relativsätze", "الأعداد والحروف والاسم الموصول", "Sayılar, edatlar, ilgi cümleleri", "اعداد، حروف، اسم موصول", "Bilangan, partikel, kalimat relatif", "Nombres, particules, relatives"),
    lead: X("Counting, inna and her sisters, “who” and “which”, linking words.", "Zählen, inna und ihre Schwestern, „der“ und „welche“, Bindewörter.", "العدد وإنّ وأخواتها والموصول.", "Sayma, inna ve kardeşleri, ilgi zamirleri.", "گنتی، إنّ اور اس کے اخوات، موصول۔", "Bilangan, inna, kata sambung.", "Compter, inna et ses sœurs, relatifs."),
    lessons: [
      {
        id: "u8-num1",
        title: X("Numbers 1–10", "Zahlen 1–10", "الأعداد ١–١٠", "1–10 sayıları", "اعداد ١–١٠", "Bilangan 1–10", "Les nombres 1–10"),
        expl: X("wāḥid (one) and ithnān (two) behave like adjectives. From three to ten, the number takes the opposite gender of the counted thing – one of the famous surprises of Arabic.", "wāḥid (eins) und ithnān (zwei) verhalten sich wie Adjektive. Von drei bis zehn steht die Zahl im umgekehrten Geschlecht des Gezählten – eine der bekannten Überraschungen des Arabischen.", "الواحد والاثنان صفتان، ومن ٣ إلى ١٠ يخالف العدد المعدود.", "1 ve 2 sıfat gibidir; 3–10 sayılanın tersi cinsiyettedir.", "ایک اور دو صفت ہیں؛ ٣ سے ١٠ معدود کے مخالف۔", "1 dan 2 seperti sifat; 3–10 berlawanan jenis.", "1 et 2 sont adjectifs ; de 3 à 10 le genre s'inverse."),
        items: [
          I("وَاحِدٌ", "wāḥidun", "one", "eins"), I("اِثْنَانِ", "ithnāni", "two", "zwei"), I("ثَلَاثَةٌ", "thalāthatun", "three", "drei"),
          I("أَرْبَعَةٌ", "arbaʿatun", "four", "vier"), I("خَمْسَةٌ", "khamsatun", "five", "fünf"), I("سِتَّةٌ", "sittatun", "six", "sechs"),
          I("سَبْعَةٌ", "sabʿatun", "seven", "sieben"), I("ثَمَانِيَةٌ", "thamāniyatun", "eight", "acht"), I("تِسْعَةٌ", "tisʿatun", "nine", "neun"), I("عَشَرَةٌ", "ʿasharatun", "ten", "zehn"),
        ],
        spot: [S("112:1", [4], X("Tap the word “One”.", "Tippen Sie auf das Wort „Einer“.", "اضغط على «أحد».", "“Bir” kelimesine dokunun.", "«أحد» پر ٹیپ کریں۔", "Ketuk kata “Esa”.", "Touchez le mot « Unique »."))],
      },
      {
        id: "u8-count",
        title: X("Counting things", "Dinge zählen", "العدد والمعدود", "Saymak", "گنتی اور معدود", "Menghitung benda", "Compter des choses"),
        expl: X("After 3–10 the counted noun is plural and genitive: thalāthatu kutubin, “three books”. Because kitāb is masculine, the number takes -a; with a feminine noun it drops it: thalāthu sayyārātin.", "Nach 3–10 steht das Gezählte im Plural und Genitiv: thalāthatu kutubin, „drei Bücher“. Weil kitāb männlich ist, bekommt die Zahl -a; bei einem weiblichen Nomen fällt es weg: thalāthu sayyārātin.", "المعدود من ٣ إلى ١٠ جمع مجرور.", "3–10'dan sonra sayılan çoğul ve -i'lidir.", "٣ سے ١٠ کے بعد معدود جمع مجرور۔", "Setelah 3–10, benda jamak majrur.", "Après 3–10, le nom est au pluriel génitif."),
        items: [
          I("ثَلَاثَةُ كُتُبٍ", "thalāthatu kutubin", "three books", "drei Bücher"),
          I("ثَلَاثُ سَيَّارَاتٍ", "thalāthu sayyārātin", "three cars", "drei Autos"),
          I("خَمْسَةُ أَيَّامٍ", "khamsatu ayyāmin", "five days", "fünf Tage"),
          I("سَبْعُ سَمَاوَاتٍ", "sabʿu samāwātin", "seven heavens", "sieben Himmel"),
          I("عَشْرُ دَقَائِقَ", "ʿashru daqāʾiqa", "ten minutes", "zehn Minuten"),
        ],
      },
      {
        id: "u8-num2",
        title: X("Larger numbers and ordinals", "Größere Zahlen und Ordnungszahlen", "الأعداد الكبيرة والترتيبية", "Büyük sayılar ve sıra sayıları", "بڑے اعداد اور ترتیبی", "Bilangan besar dan urutan", "Grands nombres et ordinaux"),
        expl: X("The tens end in -ūna: ʿishrūna (20), thalāthūna (30). After 11–99 the counted noun is singular accusative: ʿishrūna yawman. After 100 and 1000 it is singular genitive: alfu shahrin, “a thousand months”. Ordinals follow the pattern fāʿil: thālith, third.", "Die Zehner enden auf -ūna: ʿishrūna (20), thalāthūna (30). Nach 11–99 steht das Gezählte im Singular Akkusativ: ʿishrūna yawman. Nach 100 und 1000 im Singular Genitiv: alfu shahrin, „tausend Monate“. Ordnungszahlen folgen dem Muster fāʿil: thālith, dritter.", "بعد ١١–٩٩ تمييز مفرد منصوب، وبعد المئة والألف مفرد مجرور.", "11–99'dan sonra tekil -a, 100/1000'den sonra tekil -i.", "١١–٩٩ کے بعد مفرد منصوب، سو/ہزار کے بعد مفرد مجرور۔", "11–99: tunggal manshub; 100/1000: tunggal majrur.", "11–99 : singulier accusatif ; 100/1000 : singulier génitif."),
        items: [
          I("أَحَدَ عَشَرَ", "aḥada ʿashara", "eleven", "elf"), I("عِشْرُونَ يَوْمًا", "ʿishrūna yawman", "twenty days", "zwanzig Tage"),
          I("مِئَةُ رَجُلٍ", "miʾatu rajulin", "a hundred men", "hundert Männer"), I("أَلْفُ سَنَةٍ", "alfu sanatin", "a thousand years", "tausend Jahre"),
          I("الْأَوَّلُ", "al-awwalu", "the first", "der Erste"), I("الثَّالِثُ", "ath-thālithu", "the third", "der Dritte"),
        ],
        spot: [S("97:3", [5], X("Tap the number “thousand”.", "Tippen Sie auf die Zahl „tausend“.", "اضغط على «ألف».", "“Bin” sayısına dokunun.", "«ألف» پر ٹیپ کریں۔", "Ketuk bilangan “seribu”.", "Touchez le nombre « mille »."))],
      },
      {
        id: "u8-inna",
        title: X("inna and her sisters", "inna und ihre Schwestern", "إنّ وأخواتها", "İnna ve kardeşleri", "إنّ اور اخوات", "Inna dan saudaranya", "inna et ses sœurs"),
        expl: X("inna (“truly”) puts the subject into the accusative: inna l-ʿilma nūrun, “truly, knowledge is light”. Her sisters work the same way: anna (that), lākinna (but), kaʾanna (as if), laʿalla (perhaps). inna begins countless verses.", "inna („wahrlich“) setzt das Subjekt in den Akkusativ: inna l-ʿilma nūrun, „wahrlich, Wissen ist Licht“. Ihre Schwestern wirken genauso: anna (dass), lākinna (aber), kaʾanna (als ob), laʿalla (vielleicht). Unzählige Verse beginnen mit inna.", "إنّ وأخواتها تنصب الاسم وترفع الخبر.", "inna ismi -a, haberi -u yapar.", "إنّ اسم کو نصب اور خبر کو رفع دیتا ہے۔", "inna: isim manshub, khabar marfu'.", "inna met le sujet à l'accusatif."),
        items: [
          I("إِنَّ الْعِلْمَ نُورٌ", "inna l-ʿilma nūrun", "Truly, knowledge is light", "Wahrlich, Wissen ist Licht"),
          I("أَعْرِفُ أَنَّ الدَّرْسَ صَعْبٌ", "aʿrifu anna d-darsa ṣaʿbun", "I know that the lesson is hard", "Ich weiß, dass die Lektion schwer ist"),
          I("الْبَيْتُ صَغِيرٌ لَكِنَّهُ جَمِيلٌ", "al-baytu ṣaghīrun lākinnahu jamīlun", "The house is small but beautiful", "Das Haus ist klein, aber schön"),
          I("كَأَنَّ الْقَمَرَ مِصْبَاحٌ", "kaʾanna l-qamara miṣbāḥun", "As if the moon were a lamp", "Als wäre der Mond eine Lampe"),
          I("لَعَلَّ الْجَوَّ جَمِيلٌ غَدًا", "laʿalla l-jawwa jamīlun ghadan", "Perhaps the weather will be nice tomorrow", "Vielleicht ist das Wetter morgen schön"),
        ],
        spot: [
          S("103:2", [1], X("Tap inna.", "Tippen Sie auf inna.", "اضغط على «إنّ».", "inna'ya dokunun.", "«إنّ» پر ٹیپ کریں۔", "Ketuk inna.", "Touchez inna."),),
          S("103:2", [2], X("Tap the noun in the accusative after inna.", "Tippen Sie auf das Nomen im Akkusativ nach inna.", "اضغط على اسم إنّ المنصوب.", "inna'dan sonraki -a'lı isme dokunun.", "إنّ کے منصوب اسم پر ٹیپ کریں۔", "Ketuk isim inna yang manshub.", "Touchez le nom à l'accusatif après inna."),),
        ],
      },
      {
        id: "u8-rel",
        title: X("Who, which: relative clauses", "Der, die, welche: Relativsätze", "الاسم الموصول", "İlgi zamirleri", "اسم موصول", "Kata sambung relatif", "Les pronoms relatifs"),
        expl: X("alladhī (m.), allatī (f.) and alladhīna (pl.) join a clause to a definite noun: ar-rajulu lladhī yaskunu hunā, “the man who lives here”. With an indefinite noun no relative word is used. mā (what) and man (who) stand alone.", "alladhī (m.), allatī (f.) und alladhīna (Pl.) verbinden einen Satz mit einem bestimmten Nomen: ar-rajulu lladhī yaskunu hunā, „der Mann, der hier wohnt“. Bei einem unbestimmten Nomen steht kein Relativwort. mā (was) und man (wer) stehen allein.", "الذي والتي والذين بعد المعرفة، ولا موصول بعد النكرة.", "alladhī/allatī/alladhīna belirli isimden sonra gelir.", "الذي، التي، الذين معرفہ کے بعد۔", "alladhī dll. setelah isim definit.", "alladhī etc. après un nom défini."),
        items: [
          I("الرَّجُلُ الَّذِي يَسْكُنُ هُنَا", "ar-rajulu lladhī yaskunu hunā", "the man who lives here", "der Mann, der hier wohnt"),
          I("الْمَرْأَةُ الَّتِي تُدَرِّسُ الْعَرَبِيَّةَ", "al-marʾatu llatī tudarrisu l-ʿarabiyyata", "the woman who teaches Arabic", "die Frau, die Arabisch unterrichtet"),
          I("الطُّلَّابُ الَّذِينَ نَجَحُوا", "aṭ-ṭullābu lladhīna najaḥū", "the students who passed", "die Studenten, die bestanden haben"),
          I("مَنْ يَعْرِفُ؟", "man yaʿrifu?", "Who knows?", "Wer weiß es?"),
          I("فَهِمْتُ مَا قُلْتَ", "fahimtu mā qulta", "I understood what you said", "Ich habe verstanden, was Sie gesagt haben"),
        ],
        spot: [
          S("1:7", [2], X("Tap the relative pronoun “those whom”.", "Tippen Sie auf das Relativpronomen „derer, die“.", "اضغط على «الذين».", "İlgi zamiri “onlar ki”ye dokunun.", "«الذين» پر ٹیپ کریں۔", "Ketuk “orang-orang yang”.", "Touchez « ceux que »."),),
          S("96:1", [4], X("Tap the relative pronoun “who”.", "Tippen Sie auf das Relativpronomen „der“.", "اضغط على «الذي».", "“Ki o” ilgi zamirine dokunun.", "«الذي» پر ٹیپ کریں۔", "Ketuk “yang”.", "Touchez « qui »."),),
          S("109:2", [3], X("Tap mā, “what”.", "Tippen Sie auf mā, „was“.", "اضغط على «ما» الموصولة.", "mā (“şeyi”)ya dokunun.", "«ما» موصولہ پر ٹیپ کریں۔", "Ketuk mā, “apa yang”.", "Touchez mā, « ce que »."),),
        ],
      },
      {
        id: "u8-link",
        title: X("Linking words and questions", "Bindewörter und Fragen", "أدوات الربط والاستفهام", "Bağlaçlar ve soru kelimeleri", "حروف عطف اور استفہام", "Kata hubung dan tanya", "Liaisons et questions"),
        expl: X("wa (and), fa (and so), thumma (then, later), aw (or), bal (rather). And the question words: hal, ayna (where), matā (when), li-mādhā (why), kayfa (how). fa- and wa- are written onto the next word.", "wa (und), fa (und so, da), thumma (dann, später), aw (oder), bal (vielmehr). Dazu die Fragewörter: hal, ayna (wo), matā (wann), li-mādhā (warum), kayfa (wie). fa- und wa- werden an das nächste Wort geschrieben.", "حروف العطف وأدوات الاستفهام.", "Bağlaçlar ve soru kelimeleri.", "حروف عطف اور سوالیہ الفاظ۔", "Kata hubung dan kata tanya.", "Conjonctions et mots interrogatifs."),
        items: [
          I("ثُمَّ", "thumma", "then, afterwards", "dann, danach"), I("أَوْ", "aw", "or", "oder"), I("بَلْ", "bal", "rather, no – but", "vielmehr"),
          I("مَتَى", "matā", "when?", "wann?"), I("لِمَاذَا", "li-mādhā", "why?", "warum?"), I("كَيْفَ", "kayfa", "how?", "wie?"),
          I("أَيْنَ تَسْكُنُ؟", "ayna taskunu?", "Where do you live?", "Wo wohnen Sie?"),
        ],
      },
      {
        id: "u8-quran",
        title: X("Quran words: the Hereafter", "Koranwörter: das Jenseits", "كلمات قرآنية: الآخرة", "Kur'an kelimeleri: ahiret", "قرآنی الفاظ: آخرت", "Kata Al-Qur'an: akhirat", "Mots du Coran : l'au-delà"),
        expl: X("Day, Garden, Fire, reward, reckoning: a large part of the Quran speaks of what comes after this life.", "Tag, Garten, Feuer, Lohn, Abrechnung: Ein großer Teil des Korans spricht von dem, was nach diesem Leben kommt.", "كلمات الآخرة كثيرة في القرآن.", "Ahiret kelimeleri Kur'an'da çoktur.", "آخرت کے الفاظ قرآن میں بہت ہیں۔", "Kata-kata akhirat banyak dalam Al-Qur'an.", "Les mots de l'au-delà sont nombreux."),
        deck: { id: "hereafter", from: 0, n: 12 },
      },
    ],
  },
  {
    n: 9, level: "B2",
    title: X("Iʿrāb: the case endings", "Iʿrāb: die Fallendungen", "الإعراب", "İ'rab: hal ekleri", "اعراب", "I'rab: akhiran kasus", "L'iʿrāb : les cas"),
    lead: X("Why a word ends in -u, -a or -i, and the moods of the verb.", "Warum ein Wort auf -u, -a oder -i endet, und die Modi des Verbs.", "الرفع والنصب والجر وإعراب المضارع.", "Ref, nasb, cer ve fiil kipleri.", "رفع، نصب، جر اور فعل کے اعراب۔", "Rafa', nashab, jarr dan modus.", "Nominatif, accusatif, génitif et modes."),
    lessons: [
      {
        id: "u9-cases",
        title: X("Three cases", "Drei Fälle", "الحالات الثلاث", "Üç hal", "تین حالتیں", "Tiga kasus", "Trois cas"),
        expl: X("The last vowel of a noun shows its role: -u for the subject (rafʿ), -a for the object and some other roles (naṣb), -i after prepositions and in the iḍāfa (jarr). In the Quran these endings are always pronounced – they tell you who does what.", "Der letzte Vokal eines Nomens zeigt seine Rolle: -u für das Subjekt (rafʿ), -a für das Objekt und einige andere Rollen (naṣb), -i nach Präpositionen und in der Iḍāfa (jarr). Im Koran werden diese Endungen immer gesprochen – sie zeigen, wer was tut.", "الرفع والنصب والجر تبيّن وظيفة الكلمة.", "Son hareke kelimenin görevini gösterir.", "آخری حرکت لفظ کا کردار بتاتی ہے۔", "Harakat akhir menunjukkan fungsi kata.", "La voyelle finale indique la fonction."),
        items: [
          I("جَاءَ الْمُعَلِّمُ", "jāʾa l-muʿallimu", "The teacher came", "Der Lehrer kam"),
          I("رَأَيْتُ الْمُعَلِّمَ", "raʾaytu l-muʿallima", "I saw the teacher", "Ich sah den Lehrer"),
          I("سَلَّمْتُ عَلَى الْمُعَلِّمِ", "sallamtu ʿalā l-muʿallimi", "I greeted the teacher", "Ich grüßte den Lehrer"),
        ],
        spot: [S("110:1", [3], X("Tap the noun in the nominative (the doer).", "Tippen Sie auf das Nomen im Nominativ (den Handelnden).", "اضغط على الاسم المرفوع (الفاعل).", "Merfu faile dokunun.", "مرفوع فاعل پر ٹیپ کریں۔", "Ketuk isim marfu' (fa'il).", "Touchez le nom au nominatif."))],
      },
      {
        id: "u9-raf",
        title: X("Rafʿ: the nominative", "Rafʿ: der Nominativ", "الرفع", "Ref", "رفع", "Rafa'", "Le nominatif"),
        expl: X("Nominative: the subject and predicate of a nominal sentence and the doer of a verb. Sound masculine plurals show it with -ūna, duals with -āni.", "Nominativ: Subjekt und Prädikat des Nominalsatzes und der Handelnde eines Verbs. Gesunde männliche Plurale zeigen ihn mit -ūna, Duale mit -āni.", "يُرفع المبتدأ والخبر والفاعل.", "Mübteda, haber ve fail merfudur.", "مبتدا، خبر اور فاعل مرفوع ہوتے ہیں۔", "Mubtada, khabar, fa'il marfu'.", "Sujet, prédicat et agent au nominatif."),
        items: [
          I("الْمُؤْمِنُونَ صَادِقُونَ", "al-muʾminūna ṣādiqūna", "The believers are truthful", "Die Gläubigen sind aufrichtig"),
          I("الطَّالِبَانِ مُجْتَهِدَانِ", "aṭ-ṭālibāni mujtahidāni", "The two students are diligent", "Die beiden Studenten sind fleißig"),
          I("حَضَرَ الضُّيُوفُ", "ḥaḍara ḍ-ḍuyūfu", "The guests arrived", "Die Gäste kamen"),
          I("الصَّبْرُ مِفْتَاحُ الْفَرَجِ", "aṣ-ṣabru miftāḥu l-faraji", "Patience is the key to relief", "Geduld ist der Schlüssel zur Erleichterung"),
        ],
        spot: [S("112:2", [1, 2], X("Tap both nominative words.", "Tippen Sie auf beide Wörter im Nominativ.", "اضغط على المرفوعَين.", "İki merfu kelimeye dokunun.", "دونوں مرفوع الفاظ پر ٹیپ کریں۔", "Ketuk kedua kata marfu'.", "Touchez les deux mots au nominatif."))],
      },
      {
        id: "u9-nasb",
        title: X("Naṣb: the accusative", "Naṣb: der Akkusativ", "النصب", "Nasb", "نصب", "Nashab", "L'accusatif"),
        expl: X("Accusative: the object of a verb, the noun after inna, the predicate of kāna, and adverbs of time and manner. Sound masculine plurals and duals use -īna / -ayni.", "Akkusativ: das Objekt eines Verbs, das Nomen nach inna, das Prädikat von kāna sowie Adverbien der Zeit und Art. Gesunde männliche Plurale und Duale haben -īna / -ayni.", "يُنصب المفعول به واسم إنّ وخبر كان.", "Meful, inna'nın ismi ve kāna'nın haberi mansuptur.", "مفعول، اسمِ إنّ اور خبرِ کان منصوب۔", "Objek, isim inna, khabar kāna manshub.", "Objet, nom de inna, prédicat de kāna."),
        items: [
          I("قَرَأْتُ الْكِتَابَ", "qaraʾtu l-kitāba", "I read the book", "Ich las das Buch"),
          I("إِنَّ الصَّبْرَ جَمِيلٌ", "inna ṣ-ṣabra jamīlun", "Truly, patience is beautiful", "Wahrlich, Geduld ist schön"),
          I("كَانَ الْيَوْمُ طَوِيلًا", "kāna l-yawmu ṭawīlan", "The day was long", "Der Tag war lang"),
          I("رَأَيْتُ الْمُسْلِمِينَ", "raʾaytu l-muslimīna", "I saw the Muslims", "Ich sah die Muslime"),
        ],
        spot: [S("95:4", [3], X("Tap the object of the verb (accusative).", "Tippen Sie auf das Objekt des Verbs (Akkusativ).", "اضغط على المفعول به.", "Fiilin nesnesine dokunun.", "مفعول بہ پر ٹیپ کریں۔", "Ketuk objek kata kerja.", "Touchez le complément d'objet."))],
      },
      {
        id: "u9-jarr",
        title: X("Jarr: the genitive", "Jarr: der Genitiv", "الجر", "Cer", "جر", "Jarr", "Le génitif"),
        expl: X("Genitive: after every preposition and for the second noun of an iḍāfa. An adjective describing a genitive noun is also genitive – so whole chains of words can end in -i.", "Genitiv: nach jeder Präposition und beim zweiten Nomen der Iḍāfa. Ein Adjektiv zu einem Nomen im Genitiv steht ebenfalls im Genitiv – so können ganze Wortketten auf -i enden.", "يُجر الاسم بعد حرف الجر والمضاف إليه.", "Harf-i cerden sonra ve muzafun ileyh mecrurdur.", "حرف جار کے بعد اور مضاف الیہ مجرور۔", "Setelah kata depan dan mudhaf ilaih majrur.", "Après préposition et dans l'annexion."),
        items: [
          I("فِي الْبَيْتِ", "fī l-bayti", "in the house", "im Haus"),
          I("كِتَابُ الطَّالِبِ", "kitābu ṭ-ṭālibi", "the student's book", "das Buch des Studenten"),
          I("مِنَ الْمُسْلِمِينَ", "mina l-muslimīna", "from the Muslims", "von den Muslimen"),
          I("بِسْمِ اللَّهِ", "bismi llāhi", "in the name of God", "im Namen Gottes"),
        ],
        spot: [S("1:4", [1, 2, 3], X("Tap all words in the genitive.", "Tippen Sie auf alle Wörter im Genitiv.", "اضغط على كل الكلمات المجرورة.", "Bütün mecrur kelimelere dokunun.", "تمام مجرور الفاظ پر ٹیپ کریں۔", "Ketuk semua kata majrur.", "Touchez tous les mots au génitif."))],
      },
      {
        id: "u9-moods",
        title: X("Moods of the verb", "Modi des Verbs", "إعراب المضارع", "Muzari'nin i'rabı", "مضارع کا اعراب", "Modus kata kerja", "Les modes du verbe"),
        expl: X("The present verb also has endings: yaktubu (indicative), yaktuba after an, lan, li- (subjunctive), yaktub after lam and in commands (jussive). lam + jussive is the classical “did not”: lam yadhhab, “he did not go”.", "Auch das Präsens hat Endungen: yaktubu (Indikativ), yaktuba nach an, lan, li- (Subjunktiv), yaktub nach lam und im Befehl (Jussiv). lam + Jussiv ist das klassische „nicht (getan)“: lam yadhhab, „er ging nicht“.", "المضارع مرفوع، ومنصوب بعد أن ولن، ومجزوم بعد لم.", "Muzari merfu, an/lan'dan sonra mansup, lam'dan sonra meczum.", "مضارع مرفوع، أن/لن کے بعد منصوب، لم کے بعد مجزوم۔", "Mudhari' marfu', manshub setelah an/lan, majzum setelah lam.", "Indicatif, subjonctif après an/lan, apocopé après lam."),
        items: [
          I("لَمْ يَذْهَبْ", "lam yadhhab", "He did not go", "Er ging nicht"),
          I("لَنْ يَذْهَبَ", "lan yadhhaba", "He will not go", "Er wird nicht gehen"),
          I("أُرِيدُ أَنْ أَتَعَلَّمَ", "urīdu an ataʿallama", "I want to learn", "Ich möchte lernen"),
          I("لَمْ أَفْهَمْ", "lam afham", "I did not understand", "Ich habe nicht verstanden"),
        ],
        spot: [S("112:3", [2, 4], X("Tap the two verbs in the jussive after lam.", "Tippen Sie auf die beiden Verben im Jussiv nach lam.", "اضغط على الفعلين المجزومين.", "lam'dan sonraki iki meczum fiile dokunun.", "دونوں مجزوم افعال پر ٹیپ کریں۔", "Ketuk dua kata kerja majzum.", "Touchez les deux verbes apocopés."))],
      },
      {
        id: "u9-kanasis",
        title: X("kāna and her sisters", "kāna und ihre Schwestern", "كان وأخواتها", "Kāna ve kardeşleri", "کان اور اخوات", "Kāna dan saudaranya", "kāna et ses sœurs"),
        expl: X("Like kāna, a few verbs take a predicate in the accusative: laysa (is not), aṣbaḥa (became, in the morning), ṣāra (became), mā zāla (still is).", "Wie kāna haben einige Verben ein Prädikat im Akkusativ: laysa (ist nicht), aṣbaḥa (wurde, am Morgen), ṣāra (wurde), mā zāla (ist noch).", "كان وأخواتها ترفع الاسم وتنصب الخبر.", "Kāna ve kardeşleri haberi nasbeder.", "کان اور اخوات خبر کو نصب دیتے ہیں۔", "Kāna dan saudaranya me-nashab-kan khabar.", "kāna et ses sœurs : prédicat à l'accusatif."),
        items: [
          I("لَيْسَ الطَّقْسُ بَارِدًا", "laysa ṭ-ṭaqsu bāridan", "The weather is not cold", "Das Wetter ist nicht kalt"),
          I("أَصْبَحَ الْجَوُّ حَارًّا", "aṣbaḥa l-jawwu ḥārran", "The weather became hot", "Das Wetter wurde heiß"),
          I("مَا زَالَ الطِّفْلُ نَائِمًا", "mā zāla ṭ-ṭiflu nāʾiman", "The child is still asleep", "Das Kind schläft noch"),
          I("صَارَ الْمَاءُ ثَلْجًا", "ṣāra l-māʾu thaljan", "The water became ice", "Das Wasser wurde zu Eis"),
        ],
      },
      {
        id: "u9-quran",
        title: X("Quran words: worship", "Koranwörter: Gottesdienst", "كلمات قرآنية: العبادة", "Kur'an kelimeleri: ibadet", "قرآنی الفاظ: عبادت", "Kata Al-Qur'an: ibadah", "Mots du Coran : l'adoration"),
        expl: X("Prayer, charity, fasting, remembrance: the words of worship that you also hear in daily religious life.", "Gebet, Almosen, Fasten, Gedenken: die Wörter des Gottesdienstes, die Sie auch im religiösen Alltag hören.", "كلمات العبادة.", "İbadet kelimeleri.", "عبادت کے الفاظ۔", "Kata-kata ibadah.", "Les mots de l'adoration."),
        deck: { id: "worship", from: 0, n: 12 },
      },
    ],
  },
  {
    n: 10, level: "B2",
    title: X("Reading the Quran with understanding", "Den Koran verstehend lesen", "قراءة القرآن بفهم", "Kur'an'ı anlayarak okumak", "قرآن سمجھ کر پڑھنا", "Membaca Al-Qur'an dengan paham", "Lire le Coran en comprenant"),
    lead: X("Comparison, conditions, the passive, emphasis and address.", "Vergleich, Bedingungen, Passiv, Betonung und Anrede.", "التفضيل والشرط والمبني للمجهول والتوكيد والنداء.", "Karşılaştırma, şart, edilgen, tekit ve nida.", "تفضیل، شرط، مجہول، تاکید اور ندا۔", "Perbandingan, syarat, pasif, penegasan, seruan.", "Comparatif, condition, passif, emphase, vocatif."),
    lessons: [
      {
        id: "u10-comp",
        title: X("Bigger, best: afʿal", "Größer, am besten: afʿal", "اسم التفضيل", "İsm-i tafdil", "اسم تفضیل", "Isim tafdhil", "Le comparatif afʿal"),
        expl: X("The pattern afʿal makes comparatives and superlatives: kabīr → akbar (bigger, greatest), ḥasan → aḥsan (better, best). With min it compares: akbaru min, “bigger than”. In an iḍāfa it is a superlative: aḥsanu taqwīmin, “the best form”.", "Das Muster afʿal bildet Komparativ und Superlativ: kabīr → akbar (größer, am größten), ḥasan → aḥsan (besser, am besten). Mit min vergleicht es: akbaru min, „größer als“. In einer Iḍāfa ist es Superlativ: aḥsanu taqwīmin, „die schönste Gestalt“.", "أفعل للتفضيل، مع «من» للمقارنة.", "afʿal karşılaştırma ve üstünlük bildirir.", "أفعل تفضیل کے لیے، «من» کے ساتھ موازنہ۔", "af'al untuk perbandingan.", "afʿal pour comparer."),
        items: [
          I("أَكْبَرُ", "akbaru", "bigger, greatest", "größer, am größten"), I("أَحْسَنُ", "aḥsanu", "better, best", "besser, am besten"),
          I("أَقْرَبُ", "aqrabu", "nearer", "näher"), I("أَكْثَرُ", "aktharu", "more", "mehr"),
          I("هٰذَا أَكْبَرُ مِنْ ذٰلِكَ", "hādhā akbaru min dhālika", "This is bigger than that", "Dies ist größer als jenes"),
        ],
        spot: [S("95:4", [5], X("Tap the word on the pattern afʿal (“best”).", "Tippen Sie auf das Wort im Muster afʿal („schönste“).", "اضغط على «أحسن».", "afʿal kalıbındaki “en güzel”e dokunun.", "«أحسن» پر ٹیپ کریں۔", "Ketuk kata berpola af'al (“terbaik”).", "Touchez le mot au schème afʿal."))],
      },
      {
        id: "u10-cond",
        title: X("If and when", "Wenn und falls", "الشرط", "Şart cümleleri", "جملہ شرطیہ", "Kalimat syarat", "La condition"),
        expl: X("idhā (when) usually takes a past verb even for the future: idhā jāʾa …, “when … comes”. in (if) is followed by the jussive: in tadrus tanjaḥ, “if you study, you succeed”. law (if only) marks an unreal condition.", "idhā (wenn) steht meist mit einem Verb der Vergangenheit, auch für die Zukunft: idhā jāʾa …, „wenn … kommt“. in (falls) verlangt den Jussiv: in tadrus tanjaḥ, „wenn Sie lernen, haben Sie Erfolg“. law (wenn doch) bezeichnet eine unwirkliche Bedingung.", "إذا للمستقبل المحقق، وإن تجزم، ولو للامتناع.", "idhā, in ve law şart edatlarıdır.", "إذا، إن اور لو شرط کے حروف ہیں۔", "idhā, in, law untuk syarat.", "idhā, in et law introduisent la condition."),
        items: [
          I("إِذَا جَاءَ الشِّتَاءُ بَرَدَ الْجَوُّ", "idhā jāʾa sh-shitāʾu barada l-jawwu", "When winter comes, the weather turns cold", "Wenn der Winter kommt, wird es kalt"),
          I("إِنْ تَدْرُسْ تَنْجَحْ", "in tadrus tanjaḥ", "If you study, you will succeed", "Wenn Sie lernen, haben Sie Erfolg"),
          I("لَوْ كَانَ عِنْدِي وَقْتٌ لَزُرْتُكَ", "law kāna ʿindī waqtun la-zurtuka", "If I had time, I would visit you", "Hätte ich Zeit, würde ich Sie besuchen"),
        ],
        spot: [S("110:1", [1], X("Tap the conditional word “when”.", "Tippen Sie auf das Bedingungswort „wenn“.", "اضغط على «إذا».", "Şart edatı “zaman”a dokunun.", "«إذا» پر ٹیپ کریں۔", "Ketuk kata syarat “apabila”.", "Touchez « quand »."))],
      },
      {
        id: "u10-passive",
        title: X("It was written: the passive", "Es wurde geschrieben: das Passiv", "المبني للمجهول", "Edilgen fiil", "فعل مجہول", "Kata kerja pasif", "Le passif"),
        expl: X("The passive changes only the vowels: kataba → kutiba (it was written), yaktubu → yuktabu (it is written). The doer is not named. You know the pattern from the Quran's “it was said” (qīla) and “was created” (khuliqa).", "Das Passiv ändert nur die Vokale: kataba → kutiba (es wurde geschrieben), yaktubu → yuktabu (es wird geschrieben). Der Handelnde wird nicht genannt. Sie kennen das Muster vom „es wurde gesagt“ (qīla) und „wurde erschaffen“ (khuliqa) des Korans.", "المجهول بتغيير الحركات: كُتِبَ، يُكْتَبُ.", "Edilgen yalnız harekelerle yapılır: kutiba.", "مجہول صرف حرکات بدلنے سے: كُتِبَ۔", "Pasif hanya mengubah harakat: kutiba.", "Le passif change seulement les voyelles."),
        items: [
          I("كُتِبَ الدَّرْسُ", "kutiba d-darsu", "The lesson was written", "Die Lektion wurde geschrieben"),
          I("يُكْتَبُ الِاسْمُ هُنَا", "yuktabu l-ismu hunā", "The name is written here", "Der Name wird hier geschrieben"),
          I("خُلِقَ", "khuliqa", "he was created", "er wurde erschaffen"),
          I("قِيلَ", "qīla", "it was said", "es wurde gesagt"),
          I("فُتِحَ الْبَابُ", "futiḥa l-bābu", "The door was opened", "Die Tür wurde geöffnet"),
        ],
        spot: [S("112:3", [4], X("Tap the passive verb “was (not) born”.", "Tippen Sie auf das Passiv „wurde (nicht) gezeugt“.", "اضغط على الفعل المبني للمجهول.", "Edilgen fiile dokunun.", "فعل مجہول پر ٹیپ کریں۔", "Ketuk kata kerja pasif.", "Touchez le verbe au passif."))],
      },
      {
        id: "u10-emph",
        title: X("Indeed: emphasis", "Wahrlich: Betonung", "التوكيد", "Tekit", "تاکید", "Penegasan", "L'emphase"),
        expl: X("Arabic strengthens a statement with inna, with la- (“surely”), and with qad before a past verb (“has indeed”). laqad combines both. Many verses stack these markers.", "Das Arabische verstärkt eine Aussage mit inna, mit la- („gewiss“) und mit qad vor einem Verb der Vergangenheit („hat tatsächlich“). laqad verbindet beides. Viele Verse häufen diese Zeichen.", "التوكيد بإنّ واللام وقد.", "Tekit inna, la- ve qad ile yapılır.", "تاکید إنّ، لام اور قد سے۔", "Penegasan dengan inna, la-, qad.", "L'emphase avec inna, la- et qad."),
        items: [
          I("قَدْ وَصَلَ الْقِطَارُ", "qad waṣala l-qiṭāru", "The train has arrived", "Der Zug ist angekommen"),
          I("لَقَدْ نَجَحْتُ", "laqad najaḥtu", "I have indeed succeeded", "Ich habe tatsächlich bestanden"),
          I("إِنَّهُ لَصَادِقٌ", "innahu la-ṣādiqun", "He is truly honest", "Er ist wahrhaftig aufrichtig"),
        ],
        spot: [
          S("95:4", [1], X("Tap laqad.", "Tippen Sie auf laqad.", "اضغط على «لقد».", "laqad'a dokunun.", "«لقد» پر ٹیپ کریں۔", "Ketuk laqad.", "Touchez laqad."),),
          S("103:2", [3], X("Tap the word with emphatic la-.", "Tippen Sie auf das Wort mit dem betonenden la-.", "اضغط على الكلمة باللام المؤكدة.", "Tekit lam'lı kelimeye dokunun.", "لامِ تاکید والے لفظ پر ٹیپ کریں۔", "Ketuk kata dengan la- penegas.", "Touchez le mot avec le la- d'emphase."),),
        ],
      },
      {
        id: "u10-voc",
        title: X("O …! Address and wonder", "O …! Anrede und Staunen", "النداء والتعجب", "Nida ve taaccüp", "ندا اور تعجب", "Seruan dan kekaguman", "Le vocatif et l'exclamation"),
        expl: X("yā calls someone: yā akhī, “O my brother”. Before a noun with al- you need ayyuhā (or ayyatuhā for the feminine). mā afʿala expresses wonder: mā ajmala s-samāʾa, “how beautiful the sky is!”", "yā ruft jemanden an: yā akhī, „o mein Bruder“. Vor einem Nomen mit al- braucht es ayyuhā (weiblich ayyatuhā). mā afʿala drückt Staunen aus: mā ajmala s-samāʾa, „wie schön ist der Himmel!“", "النداء بيا، وأيها قبل المعرّف بأل.", "Nida yā ile, el-'li isimden önce ayyuhā.", "ندا یا سے، ال والے اسم سے پہلے أيها۔", "Seruan dengan yā; sebelum al- pakai ayyuhā.", "yā pour appeler ; ayyuhā devant al-."),
        items: [
          I("يَا أَخِي", "yā akhī", "O my brother", "O mein Bruder"),
          I("أَيُّهَا الطُّلَّابُ", "ayyuhā ṭ-ṭullābu", "O students", "Ihr Studenten"),
          I("مَا أَجْمَلَ السَّمَاءَ!", "mā ajmala s-samāʾa!", "How beautiful the sky is!", "Wie schön ist der Himmel!"),
        ],
        spot: [S("89:27", [1], X("Tap the word of address (yā ayyatuhā).", "Tippen Sie auf das Anredewort (yā ayyatuhā).", "اضغط على أداة النداء.", "Nida kelimesine dokunun.", "حرفِ ندا پر ٹیپ کریں۔", "Ketuk kata seruan.", "Touchez le mot d'appel."))],
      },
      {
        id: "u10-quran",
        title: X("Quran words: creation", "Koranwörter: die Schöpfung", "كلمات قرآنية: الخلق", "Kur'an kelimeleri: yaratılış", "قرآنی الفاظ: تخلیق", "Kata Al-Qur'an: ciptaan", "Mots du Coran : la création"),
        expl: X("Heavens, earth, water, night and day: the signs in creation that the Quran asks us to reflect upon.", "Himmel, Erde, Wasser, Nacht und Tag: die Zeichen der Schöpfung, über die der Koran nachzudenken auffordert.", "آيات الخلق.", "Yaratılıştaki ayetler.", "تخلیق کی نشانیاں۔", "Tanda-tanda dalam ciptaan.", "Les signes de la création."),
        deck: { id: "nature", from: 0, n: 12 },
      },
      {
        id: "u10-ramadan",
        title: X("Reading: Ramadan", "Lesetext: Ramadan", "نص: رمضان", "Okuma: Ramazan", "مطالعہ: رمضان", "Bacaan: Ramadan", "Lecture : le Ramadan"),
        expl: X("A connected text in Modern Standard Arabic with present tense, iḍāfa, plurals and prepositions. Read it, listen, and check what you understood.", "Ein zusammenhängender Text in modernem Hocharabisch mit Präsens, Iḍāfa, Pluralen und Präpositionen. Lesen Sie, hören Sie zu und prüfen Sie, was Sie verstanden haben.", "نص متصل بالعربية الفصحى.", "Fasih Arapça bir okuma metni.", "فصیح عربی میں ایک متن۔", "Teks bahasa Arab fusha.", "Un texte suivi en arabe standard."),
        lines: [
          Ln("a", "يَبْدَأُ شَهْرُ رَمَضَانَ بَعْدَ شَعْبَانَ.", "The month of Ramadan begins after Shaʿbān.", "Der Monat Ramadan beginnt nach Schaʿbān."),
          Ln("a", "يَصُومُ الْمُسْلِمُونَ مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ.", "Muslims fast from dawn until sunset.", "Die Muslime fasten von der Morgendämmerung bis zum Sonnenuntergang."),
          Ln("a", "يَجْتَمِعُ النَّاسُ عَلَى الْإِفْطَارِ مَعَ أُسَرِهِمْ.", "People gather for the fast-breaking meal with their families.", "Die Menschen versammeln sich mit ihren Familien zum Fastenbrechen."),
          Ln("a", "يُكْثِرُونَ مِنْ قِرَاءَةِ الْقُرْآنِ وَالدُّعَاءِ.", "They read much Quran and make much supplication.", "Sie lesen viel Koran und sprechen viele Bittgebete."),
          Ln("a", "فِي الْعَشْرِ الْأَوَاخِرِ يَبْحَثُونَ عَنْ لَيْلَةِ الْقَدْرِ.", "In the last ten nights they seek the Night of Decree.", "In den letzten zehn Nächten suchen sie die Nacht der Bestimmung."),
          Ln("a", "وَفِي آخِرِ الشَّهْرِ يَفْرَحُونَ بِالْعِيدِ.", "At the end of the month they rejoice at Eid.", "Am Ende des Monats freuen sie sich über das Fest."),
        ],
        items: [
          I("شَهْرُ رَمَضَانَ", "shahru ramaḍāna", "the month of Ramadan", "der Monat Ramadan"),
          I("يَصُومُ الْمُسْلِمُونَ", "yaṣūmu l-muslimūna", "Muslims fast", "Die Muslime fasten"),
          I("مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ", "mina l-fajri ilā l-maghribi", "from dawn until sunset", "von der Morgendämmerung bis zum Sonnenuntergang"),
          I("قِرَاءَةُ الْقُرْآنِ", "qirāʾatu l-qurʾāni", "reading the Quran", "das Lesen des Korans"),
          I("لَيْلَةُ الْقَدْرِ", "laylatu l-qadri", "the Night of Decree", "die Nacht der Bestimmung"),
          I("يَفْرَحُونَ بِالْعِيدِ", "yafraḥūna bi-l-ʿīdi", "They rejoice at Eid", "Sie freuen sich über das Fest"),
        ],
      },
    ],
  },
];
