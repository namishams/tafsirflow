// mirrors mobile/src/features/haramain/lessons.ts (copied for the website; keep both in step)
// Haramain course: 20 lessons. Verse keys only (text from the app's verse data); explanations in our own words,
// factual, and where the schools of law or Sunni and Shia practice differ, the note says so without ruling.
// No Quran or hadith wording is typed here (BLUEPRINT §4): the lesson text describes and points to the verse key or the
// hadith collection, the verses themselves are rendered from the Quran.com data. Lessons rewritten on 22.10.2026 carry
// review: "needs_review" until a scholar has checked them.
import { L14, L3, vv, type CourseDef, type Lesson, type Q } from "@/lib/learn/abrahamic/core";

const q = (q: [string, string, string], options: [string, string, string][], answer: number, why?: [string, string, string]): Q =>
  ({ q: L3(...q), options: options.map((o) => L3(...o)), answer, why: why ? L3(...why) : undefined });

export const HARAMAIN_LESSONS: Lesson[] = [
  {
    id: "kaaba-origin", review: "needs_review", arabic: "البيت العتيق", verses: vv("3:96-97", "2:127"), tags: ["quran", "tafsir", "history"],
    title: L3("The Kaaba from Ibrahim", "Die Kaaba seit Ibrahim", "الكعبة منذ إبراهيم"),
    text: L3(
      "The Quran names the House at Bakka as the first house of worship set up for people, blessed and a guidance for all (3:96). It also calls it al-Bayt al-'Atiq, the Ancient House, and links its foundations to Ibrahim and Ismail (2:127).\nThe Kaaba is a nearly cube-shaped building, about 13 m high. In its eastern corner is the Black Stone; the semicircular wall of Hijr Ismail stands on its northwest side. Muslims everywhere face it in prayer.",
      "Der Koran nennt das Haus in Bakka das erste Gotteshaus, das für die Menschen errichtet wurde, gesegnet und eine Rechtleitung für alle (3:96). Er nennt es auch al-Bait al-'Atiq, das Alte Haus, und verbindet seine Grundmauern mit Ibrahim und Ismail (2:127).\nDie Kaaba ist ein annähernd würfelförmiger Bau von etwa 13 m Höhe. In ihrer Ostecke sitzt der Schwarze Stein; an ihrer Nordwestseite steht die halbrunde Mauer des Hidschr Ismail. Muslime überall wenden sich ihr im Gebet zu.",
      "يذكر القرآن أن البيت الذي ببكة هو أول بيت أُقيم لعبادة الناس، وأنه مبارك وهداية للبشر (3:96). ويسمّيه أيضًا البيت العتيق ويربط قواعده بإبراهيم وإسماعيل (2:127).\nالكعبة بناء شبه مكعب بارتفاع نحو 13 مترًا، في ركنها الشرقي الحجر الأسود، وفي جهتها الشمالية الغربية جدار حِجر إسماعيل نصف الدائري، ويستقبلها المسلمون في صلاتهم.",
    ),
    quiz: [
      q(["What does 3:96 call the place of the first House?", "Wie nennt 3:96 den Ort des ersten Hauses?", "ما اسم موضع أول بيت في 3:96؟"],
        [["Bakka", "Bakka", "بكّة"], ["Yathrib", "Yathrib", "يثرب"], ["Ta'if", "Ta'if", "الطائف"]], 0, ["Bakka is understood as a name for Mecca or its valley.", "Bakka gilt als Name für Mekka oder sein Tal.", "بكّة اسم لمكة أو لبطنها."]),
      q(["Where is the Black Stone set?", "Wo sitzt der Schwarze Stein?", "أين الحجر الأسود؟"],
        [["In the eastern corner", "In der Ostecke", "في الركن الشرقي"], ["On the roof", "Auf dem Dach", "على السطح"], ["Inside Zamzam", "In Zamzam", "في زمزم"]], 0),
    ],
  },
  {
    id: "kaaba-rebuilds", arabic: "بناء الكعبة", verses: vv("5:97", "22:26"), tags: ["history", "tafsir"],
    title: L3("The Kaaba through history", "Die Kaaba durch die Geschichte", "الكعبة عبر التاريخ"),
    text: L3(
      "The Quraysh rebuilt the Kaaba around 605, when Muhammad was about 35; he settled the dispute over who would set the Black Stone by placing it on a cloth carried by all clans. Short of lawful funds, they left Hijr Ismail outside.\nAbd Allah ibn al-Zubayr rebuilt it in 683 including the Hijr; al-Hajjaj restored the Quraysh shape in 693. After floods it was rebuilt under Sultan Murad IV in 1630, and thoroughly restored in 1996. The kiswa, its black cover, is renewed every year.",
      "Die Quraisch bauten die Kaaba um 605 neu auf, als Muhammad etwa 35 war; den Streit, wer den Schwarzen Stein setzen dürfe, löste er, indem er ihn auf ein Tuch legte, das alle Sippen trugen. Mangels rechtmäßiger Mittel ließen sie den Hidschr Ismail außen vor.\nAbd Allah ibn az-Zubair baute sie 683 mit dem Hidschr neu; al-Haddschadsch stellte 693 die Form der Quraisch wieder her. Nach Fluten wurde sie 1630 unter Sultan Murad IV. neu errichtet und 1996 umfassend restauriert. Die Kiswa, ihre schwarze Hülle, wird jedes Jahr erneuert.",
      "أعادت قريش بناء الكعبة نحو سنة 605 والنبي ﷺ في الخامسة والثلاثين، فحسم النزاع على وضع الحجر الأسود بأن وضعه في ثوب حملته القبائل كلها، وقصرت بهم النفقة الطيبة فأخرجوا الحِجر.\nثم بناها عبد الله بن الزبير سنة 683 وأدخل الحِجر، وأعادها الحجاج سنة 693 إلى بناء قريش، وأُعيد بناؤها بعد السيول في عهد السلطان مراد الرابع سنة 1630، ورُمّمت ترميمًا شاملًا سنة 1996. وتُجدَّد الكسوة كل عام.",
    ),
    quiz: [
      q(["How did Muhammad settle the Black Stone dispute?", "Wie löste Muhammad den Streit um den Schwarzen Stein?", "كيف حسم النبي ﷺ نزاع الحجر الأسود؟"],
        [["By drawing lots", "Durch Los", "بالقرعة"], ["On a cloth carried by all clans", "Auf einem Tuch, das alle Sippen trugen", "في ثوب حملته القبائل كلها"], ["He set it alone at night", "Allein in der Nacht", "وضعه وحده ليلًا"]], 1),
      q(["Who rebuilt the Kaaba including Hijr Ismail in 683?", "Wer baute die Kaaba 683 mit dem Hidschr Ismail neu?", "من بنى الكعبة سنة 683 وأدخل الحِجر؟"],
        [["Abd Allah ibn al-Zubayr", "Abd Allah ibn az-Zubair", "عبد الله بن الزبير"], ["Murad IV", "Murad IV.", "مراد الرابع"], ["Qusayy", "Qusai", "قصي"]], 0),
    ],
  },
  {
    id: "pre-islamic-mecca", arabic: "مكة قبل الإسلام", verses: vv("14:35-37", "29:67"), tags: ["history", "quran"],
    title: L3("Mecca before Islam", "Mekka vor dem Islam", "مكة قبل الإسلام"),
    text: L3(
      "According to Arab historians, the tribe of Jurhum settled near Zamzam with Hajar and Ismail, later followed by Khuza'a. In the 5th century Qusayy ibn Kilab brought the Quraysh together in Mecca and set up offices for the pilgrims: water (siqaya), food (rifada) and the keys of the Kaaba (hijaba).\nOver time idols were placed around the Kaaba, while some individuals, the hunafa', held to the faith of Ibrahim. Mecca was a haram, a sanctuary in which fighting was forbidden (29:67).",
      "Nach arabischen Historikern ließ sich der Stamm Dschurhum bei Zamzam mit Hadschar und Ismail nieder, später folgten die Chuza'a. Im 5. Jahrhundert vereinte Qusai ibn Kilab die Quraisch in Mekka und schuf Ämter für die Pilger: Wasser (Siqaya), Speisung (Rifada) und die Schlüssel der Kaaba (Hidschaba).\nMit der Zeit wurden Götzenbilder um die Kaaba aufgestellt, während einzelne, die Hunafa', am Glauben Ibrahims festhielten. Mekka war ein Haram, ein Schutzgebiet, in dem Kämpfen verboten war (29:67).",
      "تذكر كتب الأخبار أن جرهم نزلت عند زمزم مع هاجر وإسماعيل ثم خلفتها خزاعة. وفي القرن الخامس جمع قصي بن كلاب قريشًا في مكة ورتّب مناصب الحجيج: السقاية والرفادة والحجابة.\nومع الزمن نُصبت الأصنام حول الكعبة، وبقي أفراد من الحنفاء على ملة إبراهيم. وكانت مكة حرمًا آمنًا يُحرَّم فيه القتال (29:67).",
    ),
    quiz: [
      q(["Who united the Quraysh in Mecca?", "Wer vereinte die Quraisch in Mekka?", "من جمع قريشًا في مكة؟"],
        [["Qusayy ibn Kilab", "Qusai ibn Kilab", "قصي بن كلاب"], ["Abraha", "Abraha", "أبرهة"], ["Abu Talib", "Abu Talib", "أبو طالب"]], 0),
      q(["Who were the hunafa'?", "Wer waren die Hunafa'?", "من هم الحنفاء؟"],
        [["Traders from Syria", "Händler aus Syrien", "تجار من الشام"], ["People who kept to Ibrahim's monotheism", "Menschen, die am Eingottglauben Ibrahims festhielten", "من بقوا على توحيد إبراهيم"], ["Guards of Zamzam", "Wächter von Zamzam", "حرّاس زمزم"]], 1),
    ],
  },
  {
    id: "quraysh-trade", review: "needs_review", arabic: "إيلاف قريش", verses: vv("106:1-4", "28:57"), tags: ["quran", "history"],
    title: L3("Quraysh and the caravans", "Die Quraisch und die Karawanen", "قريش والقوافل"),
    text: L3(
      "Surah Quraysh speaks of their journeys in winter and summer: caravans to Yemen in winter and to Syria in summer. Hashim, the Prophet's great-grandfather, is credited with agreements (ilaf) that secured these routes.\nThe surah calls Quraysh to worship the Lord of the Kaaba, who protected them from hunger and from fear (106:3-4). Mecca also had seasonal markets such as 'Ukaz, known for its poetry contests.",
      "Sure Quraisch spricht von ihren Reisen im Winter und im Sommer: Karawanen im Winter nach Jemen und im Sommer nach Syrien. Haschim, dem Urgroßvater des Propheten, werden Abkommen (Ilaf) zugeschrieben, die diese Wege sicherten.\nDie Sure ruft die Quraisch dazu auf, dem Herrn der Kaaba zu dienen, der sie vor Hunger und Furcht bewahrte (106:3-4). Zu Mekka gehörten auch saisonale Märkte wie 'Ukaz, bekannt für Dichterwettstreite.",
      "تذكر سورة قريش رحلتيهم في الشتاء والصيف: قوافل إلى اليمن شتاءً وإلى الشام صيفًا. ويُنسب إلى هاشم جدّ النبي ﷺ عقد الإيلاف الذي أمّن هذه الطرق.\nوتدعو السورة قريشًا إلى عبادة ربّ الكعبة الذي كفاهم الجوع وحماهم من الخوف (106:3-4). وكانت لمكة أسواق موسمية كعكاظ المشهور بمساجلات الشعراء.",
    ),
    quiz: [
      q(["Where did the winter caravans go?", "Wohin zogen die Winterkarawanen?", "إلى أين كانت رحلة الشتاء؟"],
        [["Yemen", "Jemen", "اليمن"], ["Syria", "Syrien", "الشام"], ["Egypt", "Ägypten", "مصر"]], 0),
      q(["Which market was famous for poetry?", "Welcher Markt war für Dichtung berühmt?", "أي سوق اشتهر بالشعر؟"],
        [["'Ukaz", "'Ukaz", "عكاظ"], ["Dar al-Nadwa", "Dar an-Nadwa", "دار الندوة"], ["Quba", "Quba", "قباء"]], 0),
    ],
  },
  {
    id: "elephant", review: "needs_review", arabic: "عام الفيل", verses: vv("105:1-5"), tags: ["quran", "tafsir", "history"],
    title: L3("The Year of the Elephant", "Das Jahr des Elefanten", "عام الفيل"),
    text: L3(
      "Abraha, the Aksumite ruler of Yemen, marched on Mecca with an elephant to destroy the Kaaba. The Quraysh withdrew to the hills; Abd al-Muttalib is reported (Ibn Ishaq) to have said that the House had a Lord who would protect it.\nSurah al-Fil tells how birds in flocks (ababil) pelted the army with stones of baked clay. Muslim tradition dates the Prophet's birth to this year, around 570.",
      "Abraha, der aksumitische Herrscher Jemens, zog mit einem Elefanten gegen Mekka, um die Kaaba zu zerstören. Die Quraisch zogen sich in die Berge zurück; von Abd al-Muttalib wird überliefert (Ibn Ishaq), das Haus habe einen Herrn, der es schützen werde.\nSure al-Fil erzählt, wie Vögel in Scharen (Ababil) das Heer mit Steinen aus gebranntem Ton bewarfen. Die muslimische Überlieferung datiert die Geburt des Propheten in dieses Jahr, um 570.",
      "سار أبرهة حاكم اليمن الأكسومي إلى مكة ومعه الفيل ليهدم الكعبة، فاعتصمت قريش بالجبال، ويُروى عند ابن إسحاق أن عبد المطلب قال إن للبيت ربًّا يحميه.\nوتروي سورة الفيل أن الله أرسل على الجيش أسرابًا من الطير (أبابيل) رمتهم بحجارة من طين متحجّر (105:3-4). ويؤرّخ التراث مولد النبي ﷺ بهذا العام نحو 570م.",
    ),
    note: L3("Some modern historians date Abraha's campaign earlier than 570; the traditional dating links it to the Prophet's birth year.", "Einige moderne Historiker datieren Abrahas Feldzug früher als 570; die traditionelle Datierung verbindet ihn mit dem Geburtsjahr des Propheten.", "يؤرّخ بعض المؤرخين المعاصرين حملة أبرهة بما قبل 570، والتأريخ التقليدي يربطها بعام مولد النبي ﷺ."),
    quiz: [
      q(["Who led the army with the elephant?", "Wer führte das Heer mit dem Elefanten?", "من قاد جيش الفيل؟"],
        [["Abraha", "Abraha", "أبرهة"], ["Kisra", "Kisra", "كسرى"], ["Heraclius", "Herakleios", "هرقل"]], 0),
      q(["What does \"ababil\" describe?", "Was beschreibt „Ababil“?", "ماذا تصف «أبابيل»؟"],
        [["Birds in flocks", "Vögel in Scharen", "طيرًا جماعات"], ["Elephants", "Elefanten", "فيلة"], ["Clouds", "Wolken", "سحبًا"]], 0),
    ],
  },
  {
    id: "prophet-mecca", review: "needs_review", arabic: "النبي في مكة", verses: vv("96:1-5", "17:1"), tags: ["quran", "history"],
    title: L3("The Prophet in Mecca", "Der Prophet in Mekka", "النبي ﷺ في مكة"),
    text: L3(
      "In 610, in the cave of Hira on Jabal al-Nur, the first verses were revealed, the opening of Surah al-'Alaq with the command to read (96:1-5). Khadija was the first to believe. Early Muslims met secretly in the house of al-Arqam.\nPersecution grew; in 615 a group emigrated to Abyssinia, where the Christian Negus protected them. After the boycott and the \"year of sorrow\" (the deaths of Khadija and Abu Talib) came the journey to Ta'if and the Night Journey to Jerusalem (17:1).",
      "610 wurden in der Höhle Hira auf dem Dschabal an-Nur die ersten Verse offenbart, der Anfang der Sure al-'Alaq mit dem Auftrag zu lesen (96:1-5). Chadidscha glaubte als Erste. Die frühen Muslime trafen sich heimlich im Haus al-Arqams.\nDie Verfolgung wuchs; 615 wanderte eine Gruppe nach Abessinien aus, wo der christliche Negus sie schützte. Nach dem Boykott und dem „Jahr der Trauer“ (Tod Chadidschas und Abu Talibs) folgten die Reise nach Ta'if und die Nachtreise nach Jerusalem (17:1).",
      "سنة 610 نزلت أولى الآيات في غار حراء بجبل النور، وهي مطلع سورة العلق بالأمر بالقراءة (96:1-5)، وكانت خديجة أول من آمن، واجتمع المسلمون الأوائل سرًّا في دار الأرقم.\nواشتد الأذى فهاجرت جماعة سنة 615 إلى الحبشة فحماهم النجاشي النصراني. وبعد المقاطعة وعام الحزن (وفاة خديجة وأبي طالب) كانت رحلة الطائف والإسراء إلى بيت المقدس (17:1).",
    ),
    quiz: [
      q(["Where were the first verses revealed?", "Wo wurden die ersten Verse offenbart?", "أين نزلت أولى الآيات؟"],
        [["Cave of Hira", "Höhle Hira", "غار حراء"], ["Cave of Thawr", "Höhle Thaur", "غار ثور"], ["Quba", "Quba", "قباء"]], 0),
      q(["Who protected the emigrants in Abyssinia?", "Wer schützte die Auswanderer in Abessinien?", "من حمى المهاجرين في الحبشة؟"],
        [["The Negus", "Der Negus", "النجاشي"], ["Abraha", "Abraha", "أبرهة"], ["Abu Jahl", "Abu Dschahl", "أبو جهل"]], 0),
    ],
  },
  {
    id: "hijra", review: "needs_review", arabic: "الهجرة", verses: vv("9:40", "8:30"), tags: ["quran", "history"],
    title: L3("The Hijra", "Die Hidschra", "الهجرة"),
    text: L3(
      "After pledges with people from Yathrib at 'Aqaba, the Muslims emigrated in 622. The Prophet left with Abu Bakr and hid three nights in the cave of Thawr, where he reassured Abu Bakr that God was with them (9:40).\nThey reached Quba, where the first mosque was built, and then Yathrib, which became al-Madina, \"the city\". The Hijra marks the start of the Islamic calendar, introduced under Umar.",
      "Nach den Gelöbnissen von 'Aqaba mit Leuten aus Yathrib wanderten die Muslime 622 aus. Der Prophet brach mit Abu Bakr auf und verbarg sich drei Nächte in der Höhle Thaur, wo er Abu Bakr versicherte, dass Gott mit ihnen sei (9:40).\nSie erreichten Quba, wo die erste Moschee entstand, und dann Yathrib, das zu al-Madina wurde, „der Stadt“. Die Hidschra markiert den Beginn des islamischen Kalenders, eingeführt unter Umar.",
      "بعد بيعتَي العقبة مع أهل يثرب هاجر المسلمون سنة 622، وخرج النبي ﷺ مع أبي بكر واختبأ ثلاث ليال في غار ثور، وفيه طمأن صاحبه بأن الله معهما (9:40).\nووصلا قباء حيث بُني أول مسجد، ثم يثرب التي صارت المدينة. وبالهجرة يبدأ التقويم الهجري الذي اعتُمد في عهد عمر.",
    ),
    quiz: [
      q(["Where did the Prophet and Abu Bakr hide?", "Wo verbargen sich der Prophet und Abu Bakr?", "أين اختبأ النبي ﷺ وأبو بكر؟"],
        [["Cave of Thawr", "Höhle Thaur", "غار ثور"], ["Cave of Hira", "Höhle Hira", "غار حراء"], ["Ta'if", "Ta'if", "الطائف"]], 0),
      q(["Where was the first mosque built?", "Wo entstand die erste Moschee?", "أين بُني أول مسجد؟"],
        [["Quba", "Quba", "قباء"], ["Mecca", "Mekka", "مكة"], ["Jerusalem", "Jerusalem", "بيت المقدس"]], 0),
    ],
  },
  {
    id: "medina-society", review: "needs_review", arabic: "المهاجرون والأنصار", verses: vv("59:8-9"), tags: ["quran", "history"],
    title: L3("Medina: Muhajirun and Ansar", "Medina: Muhadschirun und Ansar", "المدينة: المهاجرون والأنصار"),
    text: L3(
      "In Medina the Prophet paired each emigrant (muhajir) with a helper from Medina (ansari) in brotherhood (mu'akhat). The Quran praises the Ansar for putting others before themselves, even when they were in need (59:9).\nThe Charter of Medina set rules for the tribes, including Jewish tribes, as one community for defence. Medina became the centre of the young community, and later the capital of the first caliphs.",
      "In Medina verband der Prophet jeden Auswanderer (Muhadschir) mit einem Helfer aus Medina (Ansari) in Brüderschaft (Mu'achat). Der Koran lobt die Ansar dafür, dass sie andere sich selbst vorzogen, auch wenn sie selbst in Not waren (59:9).\nDie Charta von Medina regelte die Stämme, auch jüdische, als eine Gemeinschaft zur Verteidigung. Medina wurde Zentrum der jungen Gemeinschaft und später Hauptstadt der ersten Kalifen.",
      "آخى النبي ﷺ في المدينة بين كل مهاجر وأنصاري، وأثنى القرآن على الأنصار لأنهم قدّموا إخوانهم على أنفسهم مع حاجتهم (59:9).\nونظّمت صحيفة المدينة القبائل ومنها اليهودية أمةً في الدفاع. وصارت المدينة مركز الجماعة الناشئة ثم عاصمة الخلفاء الأوائل.",
    ),
    quiz: [
      q(["What was the mu'akhat?", "Was war die Mu'achat?", "ما المؤاخاة؟"],
        [["Brotherhood between emigrants and helpers", "Brüderschaft zwischen Auswanderern und Helfern", "الأخوّة بين المهاجرين والأنصار"], ["A battle", "Eine Schlacht", "معركة"], ["A tax", "Eine Steuer", "ضريبة"]], 0),
      q(["How does 59:9 describe the Ansar?", "Wie beschreibt 59:9 die Ansar?", "كيف تصف 59:9 الأنصار؟"],
        [["They prefer others over themselves", "Sie ziehen andere sich selbst vor", "يقدّمون غيرهم على أنفسهم"], ["They are rich", "Sie sind reich", "أغنياء"], ["They are traders", "Sie sind Händler", "تجار"]], 0),
    ],
  },
  {
    id: "masjid-nabawi", arabic: "المسجد النبوي", verses: vv("9:108"), tags: ["history", "today"],
    title: L3("Masjid an-Nabawi through history", "Die Prophetenmoschee durch die Geschichte", "المسجد النبوي عبر التاريخ"),
    text: L3(
      "The Prophet's Mosque was built in 622 of mud brick and palm trunks, with the Prophet's house beside it. Umar and Uthman enlarged it; the Umayyad al-Walid rebuilt it around 707 and enclosed the Prophet's grave in the mosque.\nThe Mamluk Sultan Qalawun added the dome over the grave in 1279; it was painted green in 1837. The Ottomans rebuilt much of the mosque in the 1840s-1860s. Saudi expansions since 1951 multiplied its area; the large shade umbrellas in the courtyards date from 2010.",
      "Die Prophetenmoschee wurde 622 aus Lehmziegeln und Palmstämmen gebaut, mit dem Haus des Propheten daneben. Umar und Uthman vergrößerten sie; der Umayyade al-Walid baute sie um 707 neu und schloss das Grab des Propheten in die Moschee ein.\nDer Mamlukensultan Qalawun fügte 1279 die Kuppel über dem Grab hinzu; 1837 wurde sie grün gestrichen. Die Osmanen bauten große Teile der Moschee in den 1840er- bis 1860er-Jahren neu. Saudische Erweiterungen seit 1951 vervielfachten ihre Fläche; die großen Schirme in den Höfen stammen von 2010.",
      "بُني المسجد النبوي سنة 622 من اللبن وجذوع النخل وبجانبه بيت النبي ﷺ، ووسّعه عمر وعثمان، وأعاد الوليد الأموي بناءه نحو 707 وأدخل الحجرة النبوية في المسجد.\nوأضاف السلطان المملوكي قلاوون القبة فوق الحجرة سنة 1279، وطُليت بالأخضر سنة 1837، وأعاد العثمانيون بناء معظمه بين أربعينيات وستينيات القرن التاسع عشر. وضاعفت التوسعات السعودية منذ 1951 مساحته، والمظلات الكبيرة في الساحات من سنة 2010.",
    ),
    quiz: [
      q(["When was the Green Dome painted green?", "Wann wurde die Grüne Kuppel grün gestrichen?", "متى طُليت القبة بالأخضر؟"],
        [["622", "622", "622"], ["1837", "1837", "1837"], ["2010", "2010", "2010"]], 1),
      q(["What were the first walls made of?", "Woraus bestanden die ersten Mauern?", "ممَّ بُنيت الجدران الأولى؟"],
        [["Marble", "Marmor", "الرخام"], ["Mud brick and palm trunks", "Lehmziegel und Palmstämme", "اللبن وجذوع النخل"], ["Steel", "Stahl", "الفولاذ"]], 1),
    ],
  },
  {
    id: "qibla", review: "needs_review", arabic: "القبلة", verses: vv("2:142-144"), tags: ["quran", "tafsir", "history"],
    title: L3("The change of the qibla", "Der Wechsel der Gebetsrichtung", "تحويل القبلة"),
    text: L3(
      "For about 16 or 17 months in Medina, Muslims prayed towards Jerusalem. Then a verse commanded turning towards al-Masjid al-Haram in Mecca (2:144). Tradition places the change during a prayer in the Banu Salima mosque, since known as Masjid al-Qiblatayn, \"the mosque of the two qiblas\".\nIn the same passage the Quran describes the Muslims as a community of the middle way (2:143).",
      "Etwa 16 oder 17 Monate lang beteten die Muslime in Medina in Richtung Jerusalem. Dann gebot ein Vers, sich zur geschützten Gebetsstätte in Mekka zu wenden (2:144). Die Überlieferung verortet den Wechsel während eines Gebets in der Moschee der Banu Salima, seither Masdschid al-Qiblatain, „Moschee der zwei Gebetsrichtungen“.\nIm selben Abschnitt beschreibt der Koran die Muslime als Gemeinschaft der Mitte (2:143).",
      "صلّى المسلمون في المدينة نحو ستة عشر أو سبعة عشر شهرًا إلى بيت المقدس، ثم نزل الأمر بالتوجّه إلى المسجد الحرام (2:144)، ويُروى أن التحويل كان في صلاة بمسجد بني سلمة الذي سُمّي مسجد القبلتين.\nوفي الموضع نفسه يصف القرآن المسلمين بالأمة الوسط (2:143).",
    ),
    quiz: [
      q(["Towards which city did Muslims pray first?", "In Richtung welcher Stadt beteten die Muslime zuerst?", "إلى أي مدينة صلّى المسلمون أولًا؟"],
        [["Jerusalem", "Jerusalem", "بيت المقدس"], ["Damascus", "Damaskus", "دمشق"], ["Medina", "Medina", "المدينة"]], 0),
      q(["What does Masjid al-Qiblatayn mean?", "Was bedeutet Masdschid al-Qiblatain?", "ما معنى مسجد القبلتين؟"],
        [["Mosque of the two qiblas", "Moschee der zwei Gebetsrichtungen", "مسجد القبلتين"], ["Mosque of the two caliphs", "Moschee der zwei Kalifen", "مسجد الخليفتين"], ["Mosque of the two rivers", "Moschee der zwei Flüsse", "مسجد النهرين"]], 0),
    ],
  },
  {
    id: "fath-makka", review: "needs_review", arabic: "فتح مكة", verses: vv("110:1-3", "17:81"), tags: ["quran", "history"],
    title: L3("The return to Mecca (630)", "Die Rückkehr nach Mekka (630)", "فتح مكة (630)"),
    text: L3(
      "After the Treaty of Hudaybiyya (628) was broken, the Prophet entered Mecca in 630 almost without fighting. He removed the idols around the Kaaba while reciting 17:81, the verse on truth arriving and falsehood vanishing.\nHe declared a general amnesty for the people of Mecca. Bilal called the adhan from the Kaaba's roof. Surah an-Nasr speaks of people entering God's religion in great numbers (110:2).",
      "Nachdem der Vertrag von Hudaibiya (628) gebrochen war, zog der Prophet 630 fast kampflos in Mekka ein. Er entfernte die Götzen um die Kaaba und rezitierte dabei 17:81, den Vers vom Kommen der Wahrheit und Vergehen des Falschen.\nEr verkündete eine allgemeine Amnestie für die Mekkaner. Bilal rief den Adhan vom Dach der Kaaba. Sure an-Nasr spricht von Menschen, die in großer Zahl in Gottes Religion eintreten (110:2).",
      "بعد نقض صلح الحديبية (628) دخل النبي ﷺ مكة سنة 630 دون قتال يُذكر، فأزال الأصنام حول الكعبة وهو يتلو الآية 17:81 في مجيء الحق وزوال الباطل.\nوأعلن العفو العام عن أهل مكة، وأذّن بلال على ظهر الكعبة، وتذكر سورة النصر دخول الناس في دين الله جماعاتٍ كثيرة (110:2).",
    ),
    quiz: [
      q(["Which verse did the Prophet recite while removing the idols?", "Welchen Vers rezitierte der Prophet beim Entfernen der Götzen?", "أي آية قرأها النبي ﷺ عند إزالة الأصنام؟"],
        [["17:81, on truth arriving and falsehood vanishing", "17:81, über das Kommen der Wahrheit und das Vergehen des Falschen", "17:81 في مجيء الحق وزوال الباطل"], ["96:1, the command to read", "96:1, der Auftrag zu lesen", "96:1 في الأمر بالقراءة"], ["112:1, God's oneness", "112:1, Gottes Einheit", "112:1 في وحدانية الله"]], 0),
      q(["How did the Prophet treat the people of Mecca?", "Wie behandelte der Prophet die Mekkaner?", "كيف عامل النبي ﷺ أهل مكة؟"],
        [["General amnesty", "Allgemeine Amnestie", "عفو عام"], ["Exile", "Verbannung", "النفي"], ["Heavy tribute", "Hoher Tribut", "جزية ثقيلة"]], 0),
    ],
  },
  {
    id: "hajj-basics", review: "needs_review", arabic: "الحج", verses: vv("3:97", "2:196-197", "22:27"), tags: ["quran", "fiqh", "sunni", "shia"],
    title: L3("Hajj: meaning, types and ihram", "Hadsch: Bedeutung, Arten und Ihram", "الحج: معناه وأنواعه والإحرام"),
    text: L3(
      "Hajj is a pillar of Islam, due once in a lifetime for those able to make the journey (3:97), in the month of Dhu al-Hijja. There are three forms: tamattu' (Umrah first, then Hajj, with an offering), qiran (both together) and ifrad (Hajj alone).\nPilgrims enter ihram at the miqat, a fixed boundary, with an intention and the talbiya, the pilgrims' call answering God. Men wear two unstitched white cloths; women wear modest normal clothing. During ihram certain things are avoided, such as perfume, cutting hair and disputes (2:197).",
      "Der Hadsch ist eine Säule des Islam, einmal im Leben Pflicht für alle, die die Reise vermögen (3:97), im Monat Dhu l-Hiddscha. Es gibt drei Formen: Tamattu' (erst Umra, dann Hadsch, mit Opfer), Qiran (beides zusammen) und Ifrad (nur Hadsch).\nAm Miqat, einer festen Grenze, treten Pilgernde mit Absicht und Talbiya in den Ihram, dem Antwortruf der Pilgernden an Gott. Männer tragen zwei ungenähte weiße Tücher, Frauen schlichte normale Kleidung. Im Ihram meidet man bestimmte Dinge wie Parfüm, Haareschneiden und Streit (2:197).",
      "الحج ركن من أركان الإسلام، يجب مرة في العمر على المستطيع (3:97) في ذي الحجة، وأنواعه ثلاثة: التمتع (عمرة ثم حج مع الهدي)، والقِران (جمعهما)، والإفراد (الحج وحده).\nويُحرم الحاج من الميقات بالنية والتلبية، وهي نداء الحاج استجابةً لربه. ويلبس الرجل إزارًا ورداءً غير مخيطين، وتلبس المرأة ثيابها الساترة المعتادة، ويجتنب المحرم أمورًا كالطيب وأخذ الشعر والجدال (2:197).",
    ),
    note: L3("The four Sunni schools differ in details (for example which acts are pillars versus obligations). In Twelver Shia practice, tamattu' is obligatory for those living far from Mecca, and the order of some rites differs. Pilgrims follow their own school and their group's guidance.",
      "Die vier sunnitischen Rechtsschulen unterscheiden sich in Einzelheiten (etwa was Säule und was Pflicht ist). In der zwölferschiitischen Praxis ist Tamattu' für Fernwohnende verpflichtend, und die Reihenfolge einiger Riten weicht ab. Pilgernde folgen ihrer eigenen Rechtsschule und der Anleitung ihrer Gruppe.",
      "تختلف المذاهب السنية الأربعة في تفاصيل (كالتمييز بين الأركان والواجبات). وفي الفقه الإمامي يتعيّن التمتع على البعيد عن مكة، ويختلف ترتيب بعض المناسك. ويتبع الحاج مذهبه وإرشاد حملته."),
    quiz: [
      q(["Which Hajj form starts with an Umrah, then a pause, then Hajj?", "Welche Hadsch-Form beginnt mit Umra, Pause, dann Hadsch?", "أي أنواع الحج يبدأ بعمرة ثم تحلّل ثم حج؟"],
        [["Tamattu'", "Tamattu'", "التمتع"], ["Ifrad", "Ifrad", "الإفراد"], ["Qiran", "Qiran", "القِران"]], 0),
      q(["Where do pilgrims enter ihram?", "Wo treten Pilgernde in den Ihram?", "من أين يُحرم الحاج؟"],
        [["At the miqat", "Am Miqat", "من الميقات"], ["At Arafah", "In Arafat", "من عرفة"], ["At home only", "Nur zu Hause", "من بيته فقط"]], 0),
    ],
  },
  {
    id: "hajj-8-9", review: "needs_review", arabic: "عرفة", verses: vv("2:198-199"), tags: ["quran", "fiqh"],
    title: L3("Hajj days 8 and 9: Mina, Arafah, Muzdalifah", "Hadsch-Tage 8 und 9: Mina, Arafat, Muzdalifa", "يوما الثامن والتاسع: منى وعرفة ومزدلفة"),
    text: L3(
      "On 8 Dhu al-Hijja (yawm al-tarwiya) pilgrims go to Mina and spend the day and night in prayer. On the 9th they stand at Arafah from noon until sunset in supplication: the wuquf, the heart of Hajj; a hadith (Abu Dawud, al-Tirmidhi) calls the standing at Arafah the core of Hajj.\nAfter sunset they move to Muzdalifah, pray Maghrib and Isha together, remember God at al-Mash'ar al-Haram (2:198), rest under the open sky and gather small pebbles.",
      "Am 8. Dhu l-Hiddscha (Yaum at-Tarwiya) ziehen die Pilgernden nach Mina und verbringen Tag und Nacht im Gebet. Am 9. stehen sie von Mittag bis Sonnenuntergang in Arafat im Bittgebet: der Wuquf, das Herz des Hadsch; ein Hadith (Abu Dawud, at-Tirmidhi) nennt das Stehen in Arafat den Kern des Hadsch.\nNach Sonnenuntergang ziehen sie nach Muzdalifa, beten Maghrib und Ischa zusammen, gedenken Gottes bei al-Masch'ar al-Haram (2:198), ruhen unter freiem Himmel und sammeln kleine Steine.",
      "في الثامن من ذي الحجة (يوم التروية) يتوجّه الحجاج إلى منى ويقضون يومهم وليلتهم في العبادة، وفي التاسع يقفون بعرفة من الزوال إلى الغروب داعين، وهو ركن الحج الأعظم كما في حديث عند أبي داود والترمذي.\nوبعد الغروب يفيضون إلى مزدلفة فيجمعون المغرب والعشاء ويذكرون الله عند المشعر الحرام (2:198) ويبيتون تحت السماء ويلتقطون الحصى.",
    ),
    quiz: [
      q(["What is the heart of Hajj according to the hadith?", "Was ist laut Hadith das Herz des Hadsch?", "ما ركن الحج الأعظم بحسب الحديث؟"],
        [["Standing at Arafah", "Das Stehen in Arafat", "الوقوف بعرفة"], ["Stoning", "Das Steinigen", "الرمي"], ["Shopping", "Einkaufen", "التسوّق"]], 0),
      q(["Where do pilgrims spend the night after Arafah?", "Wo verbringen Pilgernde die Nacht nach Arafat?", "أين يبيت الحجاج بعد عرفة؟"],
        [["Muzdalifah", "Muzdalifa", "مزدلفة"], ["Medina", "Medina", "المدينة"], ["Jeddah", "Dschidda", "جدة"]], 0),
    ],
  },
  {
    id: "hajj-10-13", review: "needs_review", arabic: "أيام التشريق", verses: vv("2:200-203", "22:28-29", "22:36-37"), tags: ["quran", "fiqh"],
    title: L3("Hajj days 10 to 13: Eid, stoning, tawaf", "Hadsch-Tage 10 bis 13: Fest, Steinigung, Tawaf", "أيام العاشر إلى الثالث عشر: العيد والرمي والطواف"),
    text: L3(
      "On the 10th, the day of Eid al-Adha, pilgrims throw seven pebbles at Jamrat al-'Aqaba, offer the sacrifice (hady), shave or shorten the hair and perform Tawaf al-Ifada, followed by sa'i. The Quran reminds pilgrims that it is not the meat or blood of the sacrifice that reaches God, but their piety (22:37).\nOn the days of tashriq (11th to 12th or 13th) they stay in Mina and throw seven pebbles at each of the three jamarat daily. Before leaving Mecca they perform the farewell tawaf (tawaf al-wada').",
      "Am 10., dem Tag des Opferfests, werfen die Pilgernden sieben Steinchen auf die Dschamrat al-'Aqaba, bringen das Opfer (Hady) dar, rasieren oder kürzen das Haar und vollziehen den Tawaf al-Ifada mit anschließendem Sa'i. Der Koran erinnert daran, dass nicht Fleisch und Blut des Opfers Gott erreichen, sondern die Frömmigkeit der Pilgernden (22:37).\nAn den Taschriq-Tagen (11. bis 12. oder 13.) bleiben sie in Mina und werfen täglich je sieben Steinchen auf die drei Dschamarat. Vor dem Verlassen Mekkas folgt der Abschieds-Tawaf (Tawaf al-Wada').",
      "في العاشر، يوم عيد الأضحى، يرمي الحجاج جمرة العقبة بسبع حصيات، وينحرون الهدي، ويحلقون أو يقصّرون، ويطوفون طواف الإفاضة ثم يسعون. ويذكّر القرآن بأن الذي يبلغ الله من الهدي ليس لحمه ولا دمه بل تقوى صاحبه (22:37).\nوفي أيام التشريق (11 و12 أو 13) يبيتون بمنى ويرمون الجمرات الثلاث كل يوم بسبع حصيات، وقبل مغادرة مكة يطوفون طواف الوداع.",
    ),
    note: L3("Schools differ on the exact order of the acts on the 10th and on what is required if the order changes; many scholars allow flexibility, based on hadiths in which the Prophet accepted a changed order from pilgrims who asked (al-Bukhari, Muslim).", "Die Rechtsschulen unterscheiden sich in der genauen Reihenfolge der Handlungen am 10. und in den Folgen einer Abweichung; viele Gelehrte erlauben Flexibilität, gestützt auf Hadithe, in denen der Prophet Pilgernden auf ihre Frage eine abweichende Reihenfolge gelten ließ (al-Buchari, Muslim).", "تختلف المذاهب في ترتيب أعمال يوم النحر وما يلزم عند تقديم بعضها على بعض، وكثير من العلماء يوسّعون في ذلك لأحاديث أجاز فيها النبي ﷺ لمن سأله تقديم بعض الأعمال على بعض (البخاري ومسلم)."),
    quiz: [
      q(["Which jamra is stoned on the 10th?", "Welche Dschamra wird am 10. beworfen?", "أي جمرة تُرمى يوم العاشر؟"],
        [["Jamrat al-'Aqaba", "Dschamrat al-'Aqaba", "جمرة العقبة"], ["All three", "Alle drei", "الثلاث"], ["None", "Keine", "لا شيء"]], 0),
      q(["What reaches God from the sacrifice according to 22:37?", "Was erreicht Gott laut 22:37 vom Opfer?", "ما الذي يناله الله من الهدي بحسب 22:37؟"],
        [["The meat", "Das Fleisch", "اللحم"], ["The piety", "Die Frömmigkeit", "التقوى"], ["The blood", "Das Blut", "الدم"]], 1),
    ],
  },
  {
    id: "umrah", review: "needs_review", arabic: "العمرة", verses: vv("2:158", "2:196", "48:27"), tags: ["quran", "fiqh"],
    title: L3("Umrah step by step", "Umra Schritt für Schritt", "العمرة خطوة بخطوة"),
    text: L3(
      "Umrah, the \"lesser pilgrimage\", can be performed at any time of year. Its steps: enter ihram at the miqat with intention and talbiya; circle the Kaaba seven times anticlockwise, starting at the Black Stone (tawaf); pray two rak'as behind Maqam Ibrahim if possible; drink Zamzam.\nThen walk seven times between Safa and Marwa (sa'i), starting at Safa; the Quran counts Safa and Marwa among the symbols of God (2:158). Finally shave or shorten the hair, and the ihram ends.",
      "Die Umra, die „kleine Pilgerfahrt“, ist das ganze Jahr möglich. Ihre Schritte: am Miqat mit Absicht und Talbiya in den Ihram treten; die Kaaba siebenmal gegen den Uhrzeigersinn umrunden, beginnend am Schwarzen Stein (Tawaf); möglichst hinter dem Maqam Ibrahim zwei Rak'as beten; Zamzam trinken.\nDann siebenmal zwischen Safa und Marwa gehen (Sa'i), beginnend bei Safa; der Koran zählt Safa und Marwa zu den Kultzeichen Gottes (2:158). Zuletzt das Haar rasieren oder kürzen, damit endet der Ihram.",
      "العمرة «الحج الأصغر» تجوز في كل العام. خطواتها: الإحرام من الميقات بالنية والتلبية، ثم الطواف بالكعبة سبعة أشواط عكس عقارب الساعة بدءًا من الحجر الأسود، وصلاة ركعتين خلف المقام إن تيسّر، وشرب ماء زمزم.\nثم السعي بين الصفا والمروة سبعة أشواط بدءًا بالصفا، وقد عدّ القرآن الصفا والمروة من شعائر الله (2:158)، ثم الحلق أو التقصير وبه يتحلّل.",
    ),
    note: L3("In Twelver Shia practice, the Umrah mufrada also includes tawaf al-nisa' with its prayer after the hair is cut.", "In der zwölferschiitischen Praxis gehört zur Umra Mufrada nach dem Haarekürzen zusätzlich der Tawaf an-Nisa' mit seinem Gebet.", "في الفقه الإمامي يُضاف إلى العمرة المفردة طواف النساء وصلاته بعد التقصير."),
    quiz: [
      q(["Where does the tawaf start?", "Wo beginnt der Tawaf?", "من أين يبدأ الطواف؟"],
        [["At the Black Stone", "Am Schwarzen Stein", "من الحجر الأسود"], ["At Marwa", "Bei Marwa", "من المروة"], ["At the gate", "Am Tor", "من الباب"]], 0),
      q(["Where does the sa'i start?", "Wo beginnt der Sa'i?", "من أين يبدأ السعي؟"],
        [["Safa", "Safa", "الصفا"], ["Marwa", "Marwa", "المروة"], ["Zamzam", "Zamzam", "زمزم"]], 0),
    ],
  },
  {
    id: "farewell-hajj", review: "needs_review", arabic: "حجة الوداع", verses: vv("5:3", "49:13"), tags: ["quran", "history"],
    title: L3("The Farewell Pilgrimage (632)", "Die Abschiedspilgerfahrt (632)", "حجة الوداع (632)"),
    text: L3(
      "In 632 the Prophet performed his only Hajj, with a very large number of companions. At Arafah he gave the Farewell Sermon: lives, property and honour are sacred; people do not rank above one another by origin or colour, only by piety; women are to be treated well (reports in Muslim and in the Musnad of Ahmad).\nThe verse on the completion of the religion (5:3) was revealed on the day of Arafah, according to most reports. Most rites of Hajj follow his example from this pilgrimage.",
      "632 vollzog der Prophet seinen einzigen Hadsch, mit sehr vielen Gefährten. In Arafat hielt er die Abschiedspredigt: Leben, Besitz und Ehre sind unantastbar; Menschen stehen nicht durch Herkunft oder Hautfarbe übereinander, sondern nur durch Frömmigkeit; Frauen sind gut zu behandeln (Berichte bei Muslim und im Musnad Ahmads).\nDer Vers über die Vollendung der Religion (5:3) wurde den meisten Berichten zufolge am Tag von Arafat offenbart. Die meisten Hadsch-Riten folgen seinem Vorbild auf dieser Pilgerfahrt.",
      "حجّ النبي ﷺ حجته الوحيدة سنة 632 ومعه جمع كبير من الصحابة، وخطب بعرفة خطبة الوداع: حرمة الدماء والأموال والأعراض، وأن الناس لا يتفاضلون بالأصل أو اللون بل بالتقوى، والوصية بالنساء خيرًا (روايات عند مسلم وفي مسند أحمد).\nونزلت آية إكمال الدين (5:3) يوم عرفة في أكثر الروايات، وأكثر مناسك الحج مأخوذة من هذه الحجة.",
    ),
    note: L3("Shia tradition also connects this journey with Ghadir Khumm on the way back, and many Shia commentators link 5:3 to that event.", "Die schiitische Überlieferung verbindet diese Reise zudem mit Ghadir Chumm auf dem Rückweg, und viele schiitische Kommentatoren beziehen 5:3 auf dieses Ereignis.", "يربط التراث الشيعي هذه الرحلة أيضًا بغدير خم في طريق العودة، ويربط كثير من مفسري الشيعة الآية 5:3 بذلك الحدث."),
    quiz: [
      q(["Where was the Farewell Sermon given?", "Wo wurde die Abschiedspredigt gehalten?", "أين أُلقيت خطبة الوداع؟"],
        [["At Arafah", "In Arafat", "بعرفة"], ["In Medina", "In Medina", "في المدينة"], ["At Badr", "In Badr", "في بدر"]], 0),
      q(["How many times did the Prophet perform Hajj?", "Wie oft vollzog der Prophet den Hadsch?", "كم حجّ النبي ﷺ؟"],
        [["Once", "Einmal", "مرة واحدة"], ["Three times", "Dreimal", "ثلاث مرات"], ["Every year", "Jedes Jahr", "كل عام"]], 0),
    ],
  },
  {
    id: "medina-adab", review: "needs_review", arabic: "آداب الزيارة", verses: vv("49:1-3", "33:56"), tags: ["quran", "fiqh", "sunni", "shia"],
    title: L3("Etiquette of visiting Medina", "Verhalten beim Besuch Medinas", "آداب زيارة المدينة"),
    text: L3(
      "Visiting Medina is not part of Hajj, but many pilgrims travel there. Prayer in the Prophet's Mosque is of great merit. The Rawda, between the Prophet's house and his minbar, is described in a hadith (al-Bukhari, Muslim) as one of the gardens of Paradise; access is now booked by time slot.\nAt the grave, visitors greet the Prophet, Abu Bakr and Umar with peace, quietly, mindful of the Quran's command not to raise voices above the Prophet's (49:2). Send blessings upon him (33:56), be patient in crowds and kind to fellow visitors.",
      "Der Besuch Medinas gehört nicht zum Hadsch, doch viele Pilgernde reisen dorthin. Das Gebet in der Prophetenmoschee hat großen Wert. Die Rauda zwischen dem Haus des Propheten und seiner Kanzel wird in einem Hadith (al-Buchari, Muslim) als einer der Gärten des Paradieses beschrieben; der Zugang wird heute nach Zeitfenster gebucht.\nAm Grab grüßen Besuchende den Propheten, Abu Bakr und Umar mit dem Friedensgruß, leise, eingedenk des koranischen Gebots, die Stimme nicht über die des Propheten zu erheben (49:2). Segenswünsche für ihn sprechen (33:56), geduldig im Gedränge und freundlich zu anderen bleiben.",
      "زيارة المدينة ليست من مناسك الحج لكن كثيرًا من الحجاج يقصدونها، والصلاة في المسجد النبوي عظيمة الفضل. والروضة بين بيته ﷺ ومنبره وُصفت في حديث عند البخاري ومسلم بأنها من رياض الجنة، ويُحجز دخولها اليوم بمواعيد.\nوعند القبر يسلّم الزائر على النبي ﷺ وأبي بكر وعمر بصوت خفيض، امتثالًا لنهي القرآن عن رفع الصوت فوق صوت النبي (49:2)، ويكثر الصلاة عليه (33:56)، ويصبر في الزحام ويرفق بالزائرين.",
    ),
    note: L3("Scholars differ on whether one should travel with the intention of visiting the grave or of the mosque, and on details of supplication there. Shia visitors also visit the graves of the Imams in al-Baqi'.", "Gelehrte sind uneins, ob man mit der Absicht reist, das Grab oder die Moschee zu besuchen, und über Einzelheiten des Bittgebets dort. Schiitische Besuchende suchen zudem die Gräber der Imame in al-Baqi' auf.", "اختلف العلماء في شدّ الرحل بنية زيارة القبر أو المسجد وفي تفاصيل الدعاء عنده، ويزور الشيعة أيضًا قبور الأئمة في البقيع."),
    quiz: [
      q(["Where is the Rawda?", "Wo liegt die Rauda?", "أين الروضة؟"],
        [["Between the Prophet's house and his minbar", "Zwischen dem Haus des Propheten und seiner Kanzel", "بين بيته ﷺ ومنبره"], ["At Quba", "In Quba", "في قباء"], ["On Uhud", "Am Uhud", "على أحد"]], 0),
      q(["Is visiting Medina part of the Hajj rites?", "Gehört der Besuch Medinas zu den Hadsch-Riten?", "هل زيارة المدينة من مناسك الحج؟"],
        [["Yes, a pillar", "Ja, eine Säule", "نعم ركن"], ["No, but many pilgrims visit", "Nein, aber viele besuchen sie", "لا، لكن كثيرين يزورونها"], ["Only for Umrah", "Nur bei der Umra", "للعمرة فقط"]], 1),
    ],
  },
  {
    id: "ziyarah-medina", review: "needs_review", arabic: "قباء وأحد", verses: vv("9:108", "3:121-122"), tags: ["history", "sunni", "shia"],
    title: L3("Sites in Medina: Quba, Uhud, al-Baqi'", "Orte in Medina: Quba, Uhud, al-Baqi'", "معالم المدينة: قباء وأحد والبقيع"),
    text: L3(
      "Masjid Quba, the first mosque, is commonly linked to the mosque founded on piety from its first day (9:108); a hadith (al-Tirmidhi, Ibn Majah) says that praying there carries the reward of an Umrah. Mount Uhud is the site of the battle of 625 (3:121) and of the graves of its martyrs, among them Hamza.\nAl-Baqi' is the main cemetery of Medina, with many companions and members of the Prophet's family. Other sites include Masjid al-Qiblatayn and the Seven Mosques near the trench of 627.",
      "Die Quba-Moschee, die erste Moschee, wird oft mit der Moschee verbunden, die vom ersten Tag an auf Gottesfurcht gegründet wurde (9:108); ein Hadith (at-Tirmidhi, Ibn Madscha) sagt, ein Gebet dort entspreche dem Lohn einer Umra. Der Berg Uhud ist Ort der Schlacht von 625 (3:121) und der Gräber ihrer Märtyrer, darunter Hamza.\nAl-Baqi' ist der Hauptfriedhof Medinas mit vielen Gefährten und Angehörigen der Familie des Propheten. Weitere Orte sind die Masdschid al-Qiblatain und die Sieben Moscheen am Graben von 627.",
      "يُربط مسجد قباء، أول مسجد، كثيرًا بالمسجد الذي أُسّس على التقوى منذ يومه الأول (9:108)، وفي حديث عند الترمذي وابن ماجه أن الصلاة فيه كأجر عمرة. وجبل أحد موضع غزوة سنة 625 (3:121) وفيه قبور شهدائها ومنهم حمزة.\nوالبقيع مقبرة المدينة الكبرى وفيها كثير من الصحابة وآل البيت، ومن المعالم أيضًا مسجد القبلتين والمساجد السبعة عند الخندق (627).",
    ),
    note: L3("Some commentators apply 9:108 to the Prophet's Mosque rather than Quba. Practices at graves (such as which supplications are made) differ between Sunni schools and Shia tradition.", "Einige Kommentatoren beziehen 9:108 auf die Prophetenmoschee statt auf Quba. Die Praxis an Gräbern (etwa welche Bittgebete gesprochen werden) unterscheidet sich zwischen sunnitischen Schulen und schiitischer Tradition.", "يحمل بعض المفسرين 9:108 على المسجد النبوي لا قباء، وتختلف الممارسات عند القبور (كصيغ الدعاء) بين المذاهب السنية والتقليد الشيعي."),
    quiz: [
      q(["Which battle took place at Uhud?", "Welche Schlacht fand am Uhud statt?", "أي غزوة كانت عند أحد؟"],
        [["The battle of 625", "Die Schlacht von 625", "غزوة سنة 625"], ["Badr", "Badr", "بدر"], ["Hunayn", "Hunain", "حنين"]], 0),
      q(["What is al-Baqi'?", "Was ist al-Baqi'?", "ما البقيع؟"],
        [["Medina's main cemetery", "Der Hauptfriedhof Medinas", "مقبرة المدينة الكبرى"], ["A market", "Ein Markt", "سوق"], ["A well", "Ein Brunnen", "بئر"]], 0),
    ],
  },
  {
    id: "ziyarah-mecca", arabic: "حراء وثور", verses: vv("2:198", "9:40"), tags: ["history"],
    title: L3("Sites around Mecca", "Orte rund um Mekka", "معالم حول مكة"),
    text: L3(
      "Jabal al-Nur with the cave of Hira, where revelation began; Jabal Thawr, where the Prophet hid during the Hijra (9:40); Jabal al-Rahma at Arafah, a hill pilgrims often climb, though standing anywhere within Arafah is valid.\nAlso: Masjid Nimra at Arafah, Masjid al-Khayf in Mina, the cemetery of al-Ma'la (Jannat al-Mu'alla) where Khadija is buried, and the place of Dar al-Arqam, now within the mosque area. Many historic buildings have been replaced by expansions.",
      "Der Dschabal an-Nur mit der Höhle Hira, wo die Offenbarung begann; der Dschabal Thaur, wo sich der Prophet während der Hidschra verbarg (9:40); der Dschabal ar-Rahma in Arafat, ein Hügel, den Pilgernde oft besteigen, obwohl das Stehen überall in Arafat gültig ist.\nAußerdem: die Namira-Moschee in Arafat, die Chaif-Moschee in Mina, der Friedhof al-Ma'la (Dschannat al-Mu'alla), wo Chadidscha begraben ist, und der Ort von Dar al-Arqam, heute im Moscheebereich. Viele historische Bauten wurden durch Erweiterungen ersetzt.",
      "جبل النور وفيه غار حراء مبدأ الوحي، وجبل ثور حيث اختبأ النبي ﷺ في الهجرة (9:40)، وجبل الرحمة بعرفة يصعده كثير من الحجاج مع أن عرفة كلها موقف.\nومنها مسجد نمرة بعرفة ومسجد الخيف بمنى ومقبرة المعلاة حيث دُفنت خديجة، وموضع دار الأرقم داخل نطاق المسجد اليوم. وقد حلّت التوسعات محل كثير من المباني التاريخية.",
    ),
    quiz: [
      q(["Where is Khadija buried?", "Wo ist Chadidscha begraben?", "أين دُفنت خديجة؟"],
        [["Jannat al-Mu'alla", "Dschannat al-Mu'alla", "المعلاة"], ["Al-Baqi'", "Al-Baqi'", "البقيع"], ["Uhud", "Uhud", "أحد"]], 0),
      q(["Must one stand on Jabal al-Rahma at Arafah?", "Muss man in Arafat auf dem Dschabal ar-Rahma stehen?", "هل يلزم الوقوف على جبل الرحمة؟"],
        [["Yes", "Ja", "نعم"], ["No, all of Arafah is valid", "Nein, ganz Arafat ist gültig", "لا، عرفة كلها موقف"], ["Only men", "Nur Männer", "للرجال فقط"]], 1),
    ],
  },
  {
    id: "modern", arabic: "التوسعات", verses: vv("22:25"), tags: ["today", "history"],
    title: L3("Modern expansions", "Moderne Erweiterungen", "التوسعات الحديثة"),
    text: L3(
      "The first Saudi expansion of the Masjid al-Haram began in 1955, the second under King Fahd in 1988, the third, the largest, from 2011. The mas'a between Safa and Marwa was enlarged to several levels; the mataf gained extra rings. The Abraj al-Bait towers with the clock opened around 2012.\nTransport: the Mashaaer metro links Mina, Muzdalifah and Arafah (2010); the Haramain high-speed railway links Mecca, Jeddah and Medina (2018). Hajj permits and Rawda visits are booked through official platforms such as Nusuk.",
      "Die erste saudische Erweiterung der Masdschid al-Haram begann 1955, die zweite unter König Fahd 1988, die dritte und größte ab 2011. Der Mas'a zwischen Safa und Marwa wurde auf mehrere Ebenen erweitert, der Mataf um Ringe ergänzt. Die Abradsch-al-Bait-Türme mit der Uhr wurden um 2012 eröffnet.\nVerkehr: Die Maschair-Metro verbindet Mina, Muzdalifa und Arafat (2010), die Haramain-Schnellbahn Mekka, Dschidda und Medina (2018). Hadsch-Genehmigungen und Rauda-Besuche werden über offizielle Plattformen wie Nusuk gebucht.",
      "بدأت التوسعة السعودية الأولى للمسجد الحرام سنة 1955، والثانية في عهد الملك فهد سنة 1988، والثالثة وهي الأكبر منذ 2011. ووُسّع المسعى إلى عدة أدوار وأضيفت للمطاف حلقات، وافتُتحت أبراج البيت والساعة نحو 2012.\nوفي النقل: قطار المشاعر يربط منى ومزدلفة وعرفة (2010)، وقطار الحرمين السريع يربط مكة وجدة والمدينة (2018). وتُحجز تصاريح الحج ومواعيد الروضة عبر منصات رسمية مثل نسك.",
    ),
    quiz: [
      q(["Which railway links Mecca and Medina?", "Welche Bahn verbindet Mekka und Medina?", "أي قطار يربط مكة بالمدينة؟"],
        [["Haramain high-speed railway", "Haramain-Schnellbahn", "قطار الحرمين السريع"], ["Hejaz Railway (still running)", "Hedschasbahn (noch in Betrieb)", "سكة حديد الحجاز (ما زالت تعمل)"], ["None", "Keine", "لا يوجد"]], 0),
      q(["When did the largest (third) Saudi expansion begin?", "Wann begann die größte (dritte) saudische Erweiterung?", "متى بدأت التوسعة السعودية الثالثة؟"],
        [["2011", "2011", "2011"], ["1955", "1955", "1955"], ["1630", "1630", "1630"]], 0),
    ],
  },
];

export const HARAMAIN_COURSE: CourseDef = {
  id: "haramain",
  storeKey: "qmc.haramain.course.v1",
  route: "/haramain",
  title: L14("The Kaaba, Mecca and Medina", "Kaaba, Mekka und Medina", "الكعبة ومكة والمدينة", "Kâbe, Mekke ve Medine", "کعبہ، مکہ اور مدینہ", "کعبه، مکه و مدینه", "کعبه، مکه او مدینه", "La Kaaba, La Mecque et Médine", "La Kaaba, La Meca y Medina", "Ka'bah, Makkah, dan Madinah", "Kaabah, Makkah dan Madinah", "কাবা, মক্কা ও মদিনা", "Кааба, Мекка и Медина", "克尔白、麦加与麦地那"),
  lessons: HARAMAIN_LESSONS,
};
