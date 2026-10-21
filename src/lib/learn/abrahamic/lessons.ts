// mirrors mobile/src/features/abrahamic/lessons.ts (copied for the website; keep both in step)
// Abrahamic course: 21 lessons. Verse keys only (text from the app's verse data); explanations in our own words,
// neutral and tradition-aware (where Muslim schools or Jewish/Christian sources differ, the note says so, without ranking).
import { L14, L3, vv, type CourseDef, type Lesson, type Q } from "@/lib/learn/abrahamic/core";

const q = (q: [string, string, string], options: [string, string, string][], answer: number, why?: [string, string, string]): Q =>
  ({ q: L3(...q), options: options.map((o) => L3(...o)), answer, why: why ? L3(...why) : undefined });

export const ABRAHAMIC_LESSONS: Lesson[] = [
  {
    id: "ibrahim-idols", arabic: "إبراهيم", verses: vv("6:75-79", "21:57-58", "21:68-69"), tags: ["quran", "tafsir", "bible"],
    title: L3("Ibrahim's search and the idols", "Ibrahims Suche und die Götzen", "بحث إبراهيم والأصنام"),
    text: L3(
      "The Quran shows the young Ibrahim looking at a star, the moon and the sun, and turning away from each as it sets: what disappears cannot be his Lord. He then turns his face to the Creator of the heavens and the earth as a hanif, one inclined to pure monotheism.\nHe breaks the idols of his people, leaving the largest, and asks them to question it. They throw him into a fire, and God says: \"O fire, be coolness and safety for Ibrahim.\"",
      "Der Koran zeigt den jungen Ibrahim, der einen Stern, den Mond und die Sonne betrachtet und sich von jedem abwendet, als er untergeht: Was verschwindet, kann nicht sein Herr sein. Dann wendet er sein Gesicht dem Schöpfer der Himmel und der Erde zu, als Hanif, als einer, der dem reinen Eingottglauben zuneigt.\nEr zerschlägt die Götzen seines Volkes, lässt den größten stehen und fordert sie auf, ihn zu befragen. Sie werfen ihn ins Feuer, und Gott spricht: „O Feuer, sei Kühle und Unversehrtheit für Ibrahim.“",
      "يصوّر القرآن إبراهيم الفتى وهو ينظر إلى الكوكب ثم القمر ثم الشمس، فيعرض عن كلٍّ منها حين يأفل: فما يغيب لا يكون ربًّا. ثم يوجّه وجهه لفاطر السماوات والأرض حنيفًا.\nويكسر أصنام قومه إلا كبيرًا لهم ويدعوهم إلى سؤاله، فيلقونه في النار، فيقول الله: «يا نار كوني بردًا وسلامًا على إبراهيم».",
    ),
    note: L3("Commentators differ on whether the star scene was Ibrahim's own search or an argument addressed to his people. The breaking of the idols also appears in later Jewish tradition (Midrash), not in the Bible itself.",
      "Die Kommentatoren sind sich uneinig, ob die Sternszene Ibrahims eigene Suche oder ein Argument an sein Volk war. Das Zerschlagen der Götzen findet sich auch in späterer jüdischer Überlieferung (Midrasch), nicht in der Bibel selbst.",
      "اختلف المفسرون: هل كان مشهد الكوكب بحثًا من إبراهيم أم حجةً على قومه؟ وقصة تكسير الأصنام موجودة أيضًا في التراث اليهودي اللاحق (المدراش) لا في نص التوراة."),
    quiz: [
      q(["Why does Ibrahim turn away from the star, moon and sun?", "Warum wendet sich Ibrahim von Stern, Mond und Sonne ab?", "لماذا أعرض إبراهيم عن الكوكب والقمر والشمس؟"],
        [["Because they set and disappear", "Weil sie untergehen und verschwinden", "لأنها تأفل وتغيب"], ["Because his father forbade it", "Weil sein Vater es verbot", "لأن أباه نهاه"], ["Because they were too small", "Weil sie zu klein waren", "لأنها صغيرة"]], 0),
      q(["What did God say to the fire?", "Was sprach Gott zum Feuer?", "ماذا قال الله للنار؟"],
        [["Burn brighter", "Brenne heller", "اشتعلي"], ["Be coolness and safety for Ibrahim", "Sei Kühle und Unversehrtheit für Ibrahim", "كوني بردًا وسلامًا على إبراهيم"], ["Go out at night", "Erlösche in der Nacht", "انطفئي ليلًا"]], 1, ["Surah al-Anbiya 21:69.", "Sure al-Anbiya 21:69.", "سورة الأنبياء 21:69."]),
    ],
  },
  {
    id: "ibrahim-trials", arabic: "الابتلاء", verses: vv("2:124", "37:99-111"), tags: ["quran", "tafsir", "sunni", "shia", "bible"],
    title: L3("Ibrahim's trials and the sacrifice", "Ibrahims Prüfungen und das Opfer", "ابتلاءات إبراهيم والذبح"),
    text: L3(
      "\"When his Lord tried Ibrahim with words and he fulfilled them\" (2:124), God made him an imam for people. The greatest trial in Surah as-Saffat: Ibrahim sees in a dream that he sacrifices his son. The son answers: \"Father, do what you are commanded.\" Both submit, and God ransoms the son \"with a great sacrifice\".\nEid al-Adha and the sacrifice during Hajj commemorate this moment.",
      "„Als sein Herr Ibrahim mit Worten prüfte und er sie erfüllte“ (2:124), machte Gott ihn zu einem Imam für die Menschen. Die größte Prüfung in Sure as-Saffat: Ibrahim sieht im Traum, dass er seinen Sohn opfert. Der Sohn antwortet: „Vater, tu, was dir befohlen wird.“ Beide ergeben sich, und Gott löst den Sohn „mit einem gewaltigen Opfer“ aus.\nDas Opferfest und das Opfer während der Hadsch erinnern an diesen Moment.",
      "«وإذ ابتلى إبراهيمَ ربُّه بكلمات فأتمّهن» (2:124) فجعله الله للناس إمامًا. وأعظم الابتلاء في سورة الصافات: يرى إبراهيم في المنام أنه يذبح ابنه، فيقول الابن: «يا أبتِ افعل ما تؤمر». فلما أسلما فداه الله «بذبح عظيم».\nوعيد الأضحى والهدي في الحج يذكّران بهذه اللحظة.",
    ),
    note: L3("The Quran does not name the son here. Most Muslim scholars, Sunni and Shia, hold it was Ismail, since the glad tidings of Ishaq follow afterwards (37:112); some early authorities named Ishaq. In Genesis 22 the son is Isaac. Shia tafsir also reads 2:124 as the root of the imamate.",
      "Der Koran nennt den Sohn hier nicht. Die meisten muslimischen Gelehrten, sunnitisch wie schiitisch, sehen in ihm Ismail, da die frohe Botschaft von Ishaq erst danach folgt (37:112); einige frühe Autoritäten nannten Ishaq. In Genesis 22 ist es Isaak. Schiitischer Tafsir liest 2:124 zudem als Grundlage des Imamats.",
      "لم يسمِّ القرآن الابن هنا. وجمهور العلماء من السنة والشيعة على أنه إسماعيل لأن البشارة بإسحاق جاءت بعدها (37:112)، وذهب بعض المتقدمين إلى أنه إسحاق. وفي سفر التكوين 22 هو إسحاق. ويرى التفسير الشيعي في 2:124 أصلًا للإمامة."),
    quiz: [
      q(["What did the son answer his father?", "Was antwortete der Sohn seinem Vater?", "بماذا أجاب الابن أباه؟"],
        [["Let me flee", "Lass mich fliehen", "دعني أهرب"], ["Father, do what you are commanded", "Vater, tu, was dir befohlen wird", "يا أبتِ افعل ما تؤمر"], ["Ask again tomorrow", "Frag morgen noch einmal", "اسأل غدًا"]], 1),
      q(["Which festival commemorates this event?", "Welches Fest erinnert an dieses Ereignis?", "أي عيد يذكّر بهذا الحدث؟"],
        [["Eid al-Fitr", "Ramadanfest", "عيد الفطر"], ["Eid al-Adha", "Opferfest", "عيد الأضحى"], ["Mawlid", "Maulid", "المولد"]], 1),
    ],
  },
  {
    id: "hajar-ismail", arabic: "هاجر وإسماعيل", verses: vv("14:35-37", "2:158"), tags: ["quran", "tafsir", "bible", "history"],
    title: L3("Hajar and Ismail in the valley", "Hadschar und Ismail im Tal", "هاجر وإسماعيل في الوادي"),
    text: L3(
      "Ibrahim prays: \"I have settled some of my offspring in an uncultivated valley near Your sacred House\" (14:37). The hadith in al-Bukhari tells how Hajar asked, \"Has God commanded you this?\" and, on hearing yes, said: \"Then He will not abandon us.\"\nSearching for water she ran seven times between the hills of Safa and Marwa, until the spring of Zamzam appeared. Every pilgrim repeats her walk in the sa'i.",
      "Ibrahim betet: „Ich habe einige meiner Nachkommen in einem Tal ohne Ackerbau bei Deinem geschützten Haus angesiedelt“ (14:37). Der Hadith bei al-Buchari erzählt, wie Hadschar fragte: „Hat Gott dir das befohlen?“ und auf das Ja hin sagte: „Dann wird Er uns nicht im Stich lassen.“\nAuf der Suche nach Wasser lief sie siebenmal zwischen den Hügeln Safa und Marwa, bis die Quelle Zamzam hervortrat. Jede Pilgerin und jeder Pilger wiederholt ihren Weg im Sa'i.",
      "يدعو إبراهيم: «ربنا إني أسكنت من ذريتي بوادٍ غير ذي زرع عند بيتك المحرم» (14:37). وفي صحيح البخاري أن هاجر سألته: «آللهُ أمرك بهذا؟» فلما قال نعم قالت: «إذن لا يضيّعنا».\nوسعت بين الصفا والمروة سبع مرات تطلب الماء حتى نبع زمزم، ويكرر كل حاج ومعتمر سعيها.",
    ),
    note: L3("Genesis 16 and 21 also tell of Hagar and Ishmael in the wilderness and of a well, set in the desert of Beersheba and Paran.", "Genesis 16 und 21 erzählen ebenfalls von Hagar und Ismael in der Wüste und von einem Brunnen, verortet in der Wüste von Beerscheba und Paran.", "يذكر سفر التكوين 16 و21 أيضًا هاجر وإسماعيل في البرية وبئرًا، في برية بئر سبع وفاران."),
    quiz: [
      q(["How many times did Hajar run between Safa and Marwa?", "Wie oft lief Hadschar zwischen Safa und Marwa?", "كم مرة سعت هاجر بين الصفا والمروة؟"],
        [["Three", "Dreimal", "ثلاثًا"], ["Seven", "Siebenmal", "سبعًا"], ["Forty", "Vierzigmal", "أربعين"]], 1),
      q(["Which spring appeared for Hajar and Ismail?", "Welche Quelle trat für Hadschar und Ismail hervor?", "أي نبع ظهر لهاجر وإسماعيل؟"],
        [["Zamzam", "Zamzam", "زمزم"], ["Salsabil", "Salsabil", "سلسبيل"], ["Jordan", "Jordan", "الأردن"]], 0),
    ],
  },
  {
    id: "kaaba-building", arabic: "رفع القواعد", verses: vv("2:125-129", "22:26-27"), tags: ["quran", "tafsir", "history"],
    title: L3("Ibrahim and Ismail build the Kaaba", "Ibrahim und Ismail errichten die Kaaba", "إبراهيم وإسماعيل يرفعان القواعد"),
    text: L3(
      "\"And when Ibrahim was raising the foundations of the House, and Ismail\" (2:127), they prayed for acceptance, for a community devoted to God and for a messenger from among their descendants. Muslims read 2:129 as a prayer answered in the Prophet Muhammad.\nGod tells Ibrahim to purify the House for those who circle it, stand, bow and prostrate, and to call people to pilgrimage: \"they will come to you on foot and on every lean camel\" (22:27). The Maqam Ibrahim marks the stone on which, by tradition, he stood.",
      "„Und als Ibrahim die Grundmauern des Hauses errichtete, und Ismail“ (2:127), beteten sie um Annahme, um eine Gemeinschaft, die sich Gott hingibt, und um einen Gesandten aus ihren Nachkommen. Muslime lesen 2:129 als ein im Propheten Muhammad erhörtes Gebet.\nGott trägt Ibrahim auf, das Haus für die Umkreisenden, Stehenden, sich Verneigenden und Niederwerfenden zu reinigen und die Menschen zur Pilgerfahrt zu rufen: „Sie werden zu Fuß und auf jedem mageren Kamel zu dir kommen“ (22:27). Der Maqam Ibrahim bezeichnet den Stein, auf dem er der Überlieferung nach stand.",
      "«وإذ يرفع إبراهيم القواعد من البيت وإسماعيل» (2:127) دعَوا بالقبول وبأمة مسلمة وبرسول من ذريتهما، ويقرأ المسلمون 2:129 دعاءً استُجيب في النبي محمد ﷺ.\nوأمر الله إبراهيم أن يطهّر البيت للطائفين والقائمين والركع السجود وأن يؤذّن في الناس بالحج: «يأتوك رجالًا وعلى كل ضامر» (22:27). ومقام إبراهيم هو الحجر الذي قام عليه بحسب الرواية.",
    ),
    quiz: [
      q(["Who raised the foundations of the House with Ibrahim?", "Wer errichtete mit Ibrahim die Grundmauern des Hauses?", "من رفع القواعد مع إبراهيم؟"],
        [["Ishaq", "Ishaq", "إسحاق"], ["Ismail", "Ismail", "إسماعيل"], ["Lut", "Lut", "لوط"]], 1),
      q(["What does the Maqam Ibrahim mark?", "Was bezeichnet der Maqam Ibrahim?", "ما هو مقام إبراهيم؟"],
        [["His grave", "Sein Grab", "قبره"], ["The stone he stood on while building", "Den Stein, auf dem er beim Bau stand", "الحجر الذي قام عليه عند البناء"], ["A well", "Einen Brunnen", "بئر"]], 1),
    ],
  },
  {
    id: "lut", arabic: "لوط", verses: vv("11:77-83", "29:26"), tags: ["quran", "tafsir", "bible"],
    title: L3("Lut and his people", "Lut und sein Volk", "لوط وقومه"),
    text: L3(
      "Lut, Ibrahim's nephew in the tradition, believed with him and emigrated (29:26). He was sent to a people who openly committed grave wrongs and assaulted guests. When messengers came as guests, Lut tried to protect them. They told him to leave by night with his family, and the towns were overturned.\nThe Quran presents Lut as a prophet of integrity who stood alone for hospitality and decency.",
      "Lut, der Überlieferung nach Ibrahims Neffe, glaubte mit ihm und wanderte aus (29:26). Er wurde zu einem Volk gesandt, das offen schweres Unrecht beging und Gäste bedrängte. Als Gesandte als Gäste kamen, versuchte Lut sie zu schützen. Sie sagten ihm, er solle nachts mit seiner Familie fortgehen, und die Städte wurden umgestürzt.\nDer Koran zeigt Lut als aufrichtigen Propheten, der allein für Gastfreundschaft und Anstand eintrat.",
      "لوط، ابن أخي إبراهيم في الرواية، آمن له وهاجر (29:26). أُرسل إلى قوم يجاهرون بالفاحشة ويعتدون على الضيف. فلما جاءته الرسل ضيوفًا حاول أن يحميهم، فأمروه أن يسري بأهله ليلًا، وجُعل عالي القرى سافلها.\nويقدّم القرآن لوطًا نبيًّا مستقيمًا وقف وحده للضيافة والفضيلة.",
    ),
    note: L3("In the Quran, unlike Genesis 19, Lut is a prophet, and no wrongdoing is attributed to him.", "Im Koran ist Lut, anders als in Genesis 19, ein Prophet, und ihm wird kein Fehlverhalten zugeschrieben.", "لوط في القرآن نبي، ولا يُنسب إليه سوء، بخلاف ما ورد في سفر التكوين 19."),
    quiz: [
      q(["What did Lut try to protect?", "Wen versuchte Lut zu schützen?", "من حاول لوط أن يحمي؟"],
        [["His guests", "Seine Gäste", "ضيوفه"], ["His herds", "Seine Herden", "أنعامه"], ["The city gate", "Das Stadttor", "باب المدينة"]], 0),
      q(["How is Lut described in the Quran?", "Wie beschreibt der Koran Lut?", "كيف يصف القرآن لوطًا؟"],
        [["As a king", "Als König", "ملكًا"], ["As a prophet", "Als Propheten", "نبيًّا"], ["As a merchant", "Als Händler", "تاجرًا"]], 1),
    ],
  },
  {
    id: "yusuf-dream", arabic: "رؤيا يوسف", verses: vv("12:3-6", "12:15-18"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yusuf 1: the dream and the well", "Yusuf 1: der Traum und der Brunnen", "يوسف 1: الرؤيا والجب"),
    text: L3(
      "Surah Yusuf calls itself \"the best of stories\" (12:3) and tells one arc from start to end. The boy Yusuf sees eleven stars, the sun and the moon prostrating to him. Yaqub tells him not to share it with his brothers.\nOut of jealousy the brothers throw him into a well and bring back his shirt with false blood. Yaqub answers with \"beautiful patience\" (sabrun jamil).",
      "Sure Yusuf nennt sich selbst „die schönste der Erzählungen“ (12:3) und erzählt einen Bogen vom Anfang bis zum Ende. Der Junge Yusuf sieht elf Sterne, die Sonne und den Mond, die sich vor ihm niederwerfen. Yaqub rät ihm, es seinen Brüdern nicht zu erzählen.\nAus Eifersucht werfen ihn die Brüder in einen Brunnen und bringen sein Hemd mit falschem Blut zurück. Yaqub antwortet mit „schöner Geduld“ (sabrun dschamil).",
      "تصف سورة يوسف نفسها بأنها «أحسن القصص» (12:3) وتروي قصة واحدة من أولها إلى آخرها. يرى يوسف الصغير أحد عشر كوكبًا والشمس والقمر له ساجدين، فينهاه يعقوب أن يقصّها على إخوته.\nويلقيه إخوته حسدًا في غيابة الجب ويأتون بقميصه بدم كذب، فيقول يعقوب: «فصبرٌ جميل».",
    ),
    quiz: [
      q(["What did Yusuf see in his dream?", "Was sah Yusuf in seinem Traum?", "ماذا رأى يوسف في منامه؟"],
        [["Seven cows", "Sieben Kühe", "سبع بقرات"], ["Eleven stars, the sun and the moon", "Elf Sterne, Sonne und Mond", "أحد عشر كوكبًا والشمس والقمر"], ["A ship", "Ein Schiff", "سفينة"]], 1),
      q(["How did Yaqub respond to the loss?", "Wie antwortete Yaqub auf den Verlust?", "بماذا قابل يعقوب الفقد؟"],
        [["With beautiful patience", "Mit schöner Geduld", "بالصبر الجميل"], ["With revenge", "Mit Rache", "بالانتقام"], ["By leaving", "Mit Fortgehen", "بالرحيل"]], 0),
    ],
  },
  {
    id: "yusuf-egypt", arabic: "يوسف في مصر", verses: vv("12:23-24", "12:36-41"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yusuf 2: temptation and prison", "Yusuf 2: Versuchung und Gefängnis", "يوسف 2: المراودة والسجن"),
    text: L3(
      "Sold in Egypt, Yusuf grows up in the house of the 'Aziz. The 'Aziz's wife tries to seduce him; he refuses: \"I seek refuge in God.\" Though innocent, he is imprisoned and says he prefers prison to wrongdoing.\nIn prison he interprets the dreams of two fellow inmates, but first speaks of the one God: \"The judgement belongs only to God\" (12:40).",
      "In Ägypten verkauft, wächst Yusuf im Haus des 'Aziz auf. Dessen Frau versucht ihn zu verführen; er weigert sich: „Ich suche Zuflucht bei Gott.“ Obwohl unschuldig, kommt er ins Gefängnis und sagt, das Gefängnis sei ihm lieber als Unrecht.\nIm Gefängnis deutet er die Träume zweier Mitgefangener, spricht aber zuerst vom einen Gott: „Das Urteil gehört allein Gott“ (12:40).",
      "بيع يوسف في مصر ونشأ في بيت العزيز، فراودته امرأة العزيز فأبى وقال: «معاذ الله». وسُجن وهو بريء وقال: «ربِّ السجن أحبّ إليّ مما يدعونني إليه».\nوفي السجن عبّر رؤيا صاحبيه بعد أن دعاهما إلى التوحيد: «إن الحكم إلا لله» (12:40).",
    ),
    quiz: [
      q(["What did Yusuf say when he was tempted?", "Was sagte Yusuf, als er versucht wurde?", "ماذا قال يوسف حين رُوود؟"],
        [["I seek refuge in God", "Ich suche Zuflucht bei Gott", "معاذ الله"], ["Later", "Später", "فيما بعد"], ["Ask my master", "Frag meinen Herrn", "اسألي سيدي"]], 0),
      q(["What did Yusuf speak about before interpreting the dreams?", "Worüber sprach Yusuf, bevor er die Träume deutete?", "عمّ تحدّث يوسف قبل تعبير الرؤيا؟"],
        [["About Egypt's kings", "Über die Könige Ägyptens", "عن ملوك مصر"], ["About the one God", "Über den einen Gott", "عن التوحيد"], ["About his brothers", "Über seine Brüder", "عن إخوته"]], 1),
    ],
  },
  {
    id: "yusuf-reunion", arabic: "لا تثريب", verses: vv("12:90-93", "12:99-100"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yusuf 3: forgiveness and reunion", "Yusuf 3: Vergebung und Wiedersehen", "يوسف 3: العفو واللقاء"),
    text: L3(
      "Yusuf interprets the king's dream of seven fat and seven lean cows, is cleared and put in charge of the storehouses. In the famine his brothers come to buy grain. When he reveals himself they fear the worst, but he says: \"No blame upon you today\" (12:92).\nHis shirt restores Yaqub's sight, the family comes to Egypt, and the childhood dream is fulfilled.",
      "Yusuf deutet den Traum des Königs von sieben fetten und sieben mageren Kühen, wird rehabilitiert und über die Vorratskammern gesetzt. In der Hungersnot kommen seine Brüder, um Getreide zu kaufen. Als er sich zu erkennen gibt, fürchten sie das Schlimmste, doch er sagt: „Kein Tadel trifft euch heute“ (12:92).\nSein Hemd gibt Yaqub das Augenlicht zurück, die Familie kommt nach Ägypten, und der Kindheitstraum erfüllt sich.",
      "عبّر يوسف رؤيا الملك في السبع البقرات السمان والعجاف، فظهرت براءته وجُعل على خزائن الأرض. وفي المجاعة جاءه إخوته يمتارون، فلما عرّفهم بنفسه خافوا، فقال: «لا تثريب عليكم اليوم» (12:92).\nوارتدّ يعقوب بصيرًا بقميصه، وجاءت الأسرة إلى مصر وتحققت الرؤيا.",
    ),
    quiz: [
      q(["What did Yusuf say to his brothers?", "Was sagte Yusuf zu seinen Brüdern?", "ماذا قال يوسف لإخوته؟"],
        [["No blame upon you today", "Kein Tadel trifft euch heute", "لا تثريب عليكم اليوم"], ["Leave Egypt", "Verlasst Ägypten", "اخرجوا من مصر"], ["Pay me double", "Zahlt doppelt", "ادفعوا ضعفين"]], 0),
      q(["What restored Yaqub's sight?", "Was gab Yaqub das Augenlicht zurück?", "ما الذي ردّ إلى يعقوب بصره؟"],
        [["Zamzam water", "Zamzam-Wasser", "ماء زمزم"], ["Yusuf's shirt", "Yusufs Hemd", "قميص يوسف"], ["A staff", "Ein Stab", "عصا"]], 1),
    ],
  },
  {
    id: "musa-birth", arabic: "موسى", verses: vv("28:7-13"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 1: the river and the palace", "Musa 1: der Fluss und der Palast", "موسى 1: اليمّ والقصر"),
    text: L3(
      "Pharaoh oppresses the Children of Israel. God inspires Musa's mother to place the baby in the river and promises to return him. Pharaoh's wife takes him in: \"a comfort of the eye for me and you\" (28:9). Musa refuses every wet nurse until his sister leads them to his own mother.\nThe Quran honours Pharaoh's wife, named Asiya in tradition, as an example of faith (66:11).",
      "Pharao unterdrückt die Kinder Israels. Gott gibt Musas Mutter ein, das Kind dem Fluss anzuvertrauen, und verspricht, es zurückzubringen. Pharaos Frau nimmt ihn auf: „ein Augentrost für mich und dich“ (28:9). Musa nimmt keine Amme an, bis seine Schwester sie zu seiner eigenen Mutter führt.\nDer Koran ehrt Pharaos Frau, in der Überlieferung Asiya genannt, als Vorbild des Glaubens (66:11).",
      "كان فرعون يستضعف بني إسرائيل، فأوحى الله إلى أم موسى أن تلقيه في اليم ووعدها بردّه. فالتقطته امرأة فرعون وقالت: «قرّة عينٍ لي ولك» (28:9)، وحرّم الله عليه المراضع حتى دلّتهم أخته على أمه.\nويكرّم القرآن امرأة فرعون، آسية في الرواية، مثلًا للمؤمنين (66:11).",
    ),
    note: L3("In Exodus 2 it is Pharaoh's daughter who adopts Moses; in the Quran it is Pharaoh's wife.", "In Exodus 2 adoptiert Pharaos Tochter Mose, im Koran ist es Pharaos Frau.", "في سفر الخروج 2 ابنة فرعون هي التي تتبنّى موسى، وفي القرآن امرأة فرعون."),
    quiz: [
      q(["Who took the baby Musa into the palace?", "Wer nahm das Kind Musa in den Palast auf?", "من التقط موسى إلى القصر؟"],
        [["Pharaoh's wife", "Pharaos Frau", "امرأة فرعون"], ["Pharaoh's vizier", "Pharaos Wesir", "وزير فرعون"], ["A merchant", "Ein Händler", "تاجر"]], 0),
      q(["How was Musa returned to his mother?", "Wie kam Musa zu seiner Mutter zurück?", "كيف رُدّ موسى إلى أمه؟"],
        [["He refused all other wet nurses", "Er nahm keine andere Amme an", "حُرّمت عليه المراضع"], ["She bought him", "Sie kaufte ihn", "اشترته"], ["Pharaoh sent him away", "Pharao schickte ihn fort", "طرده فرعون"]], 0),
    ],
  },
  {
    id: "musa-call", arabic: "الوادي المقدس", verses: vv("28:22-25", "20:9-14"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 2: Madyan and the call", "Musa 2: Madyan und die Berufung", "موسى 2: مدين والنداء"),
    text: L3(
      "After killing an Egyptian unintentionally, Musa flees to Madyan. At a well he waters the flock of two women and prays: \"My Lord, I am in need of whatever good You send down to me\" (28:24). He marries one of them and works for her father for years.\nOn the way back he sees a fire. In the sacred valley of Tuwa he hears: \"I am God, there is no god but Me, so worship Me and establish prayer for My remembrance\" (20:14).",
      "Nachdem er unbeabsichtigt einen Ägypter getötet hat, flieht Musa nach Madyan. An einem Brunnen tränkt er die Herde zweier Frauen und betet: „Mein Herr, ich bin bedürftig nach allem Guten, das Du mir herabsendest“ (28:24). Er heiratet eine von ihnen und arbeitet jahrelang für ihren Vater.\nAuf dem Rückweg sieht er ein Feuer. Im heiligen Tal Tuwa hört er: „Ich bin Gott, es gibt keinen Gott außer Mir, so diene Mir und verrichte das Gebet zu Meinem Gedenken“ (20:14).",
      "بعد أن قتل موسى مصريًّا خطأً فرّ إلى مدين، فسقى للمرأتين ثم قال: «ربِّ إني لما أنزلت إليّ من خير فقير» (28:24)، وتزوج إحداهما وعمل عند أبيها سنين.\nوفي طريق العودة آنس نارًا، فنودي في الوادي المقدس طوى: «إنني أنا الله لا إله إلا أنا فاعبدني وأقم الصلاة لذكري» (20:14).",
    ),
    note: L3("Many classical commentators identified the father in Madyan with the prophet Shu'ayb; others disagreed. The Bible names him Jethro (Reuel).", "Viele klassische Kommentatoren sahen im Vater in Madyan den Propheten Schu'aib, andere widersprachen. Die Bibel nennt ihn Jitro (Reguel).", "عدّ كثير من المفسرين الأب في مدين النبي شعيبًا وخالفهم آخرون، وتسمّيه التوراة يثرون (رعوئيل)."),
    quiz: [
      q(["Where did Musa hear God's call?", "Wo hörte Musa den Ruf Gottes?", "أين نودي موسى؟"],
        [["In the valley of Tuwa", "Im Tal Tuwa", "بالوادي المقدس طوى"], ["In Egypt's palace", "Im Palast Ägyptens", "في قصر فرعون"], ["At sea", "Auf dem Meer", "في البحر"]], 0),
      q(["What did Musa pray at the well in Madyan?", "Was betete Musa am Brunnen in Madyan?", "بماذا دعا موسى عند ماء مدين؟"],
        [["For victory", "Um Sieg", "بالنصر"], ["That he is in need of any good God sends", "Dass er jedes Gute braucht, das Gott sendet", "إني لما أنزلت إليّ من خير فقير"], ["For wealth", "Um Reichtum", "بالمال"]], 1),
    ],
  },
  {
    id: "musa-exodus", arabic: "فرعون", verses: vv("20:24-36", "26:61-67"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 3: before Pharaoh and the sea", "Musa 3: vor Pharao und am Meer", "موسى 3: أمام فرعون والبحر"),
    text: L3(
      "Sent to Pharaoh, Musa asks: \"My Lord, expand my breast, ease my task\" and asks for his brother Harun as a helper (20:25-32). He is told to speak \"a gentle word\" (20:44). The magicians, once they see the signs, believe.\nPharaoh pursues the Israelites to the sea. \"We are overtaken\", they cry; Musa answers: \"No, my Lord is with me, He will guide me\" (26:62). The sea parts and Pharaoh's army drowns.",
      "Zu Pharao gesandt, bittet Musa: „Mein Herr, weite mir die Brust und erleichtere mir meine Aufgabe“ und bittet um seinen Bruder Harun als Helfer (20:25-32). Er soll „ein mildes Wort“ sprechen (20:44). Die Zauberer glauben, als sie die Zeichen sehen.\nPharao verfolgt die Israeliten bis ans Meer. „Wir werden eingeholt“, rufen sie; Musa antwortet: „Nein, mein Herr ist mit mir, Er wird mich leiten“ (26:62). Das Meer teilt sich, und Pharaos Heer ertrinkt.",
      "أُرسل موسى إلى فرعون فقال: «ربِّ اشرح لي صدري ويسّر لي أمري» وسأل أن يكون أخوه هارون وزيرًا (20:25-32)، وأُمر أن يقول له «قولًا ليّنًا» (20:44)، وآمن السحرة لما رأوا الآيات.\nوتبعهم فرعون إلى البحر، فقال أصحاب موسى: «إنا لمدركون»، قال: «كلا إن معي ربي سيهدين» (26:62)، فانفلق البحر وأُغرق جند فرعون.",
    ),
    quiz: [
      q(["Whom did Musa ask for as a helper?", "Wen erbat Musa als Helfer?", "من سأل موسى أن يكون وزيرًا له؟"],
        [["Yusha'", "Yuscha'", "يوشع"], ["His brother Harun", "Seinen Bruder Harun", "أخاه هارون"], ["The magicians", "Die Zauberer", "السحرة"]], 1),
      q(["How was Musa told to speak to Pharaoh?", "Wie sollte Musa zu Pharao sprechen?", "كيف أُمر موسى أن يخاطب فرعون؟"],
        [["With a gentle word", "Mit einem milden Wort", "قولًا ليّنًا"], ["With threats", "Mit Drohungen", "بالتهديد"], ["Not at all", "Gar nicht", "لا يكلّمه"]], 0),
    ],
  },
  {
    id: "musa-sinai", arabic: "الطور والخضر", verses: vv("7:143-145", "18:65-70"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 4: Sinai and al-Khidr", "Musa 4: Sinai und al-Chidr", "موسى 4: الطور والخضر"),
    text: L3(
      "At the mountain Musa asks to see God; the mountain crumbles and he falls unconscious. He receives the Tablets \"with instruction and explanation of all things\" (7:145). In his absence the people worship the calf.\nSurah al-Kahf tells of Musa travelling with a servant of God, known as al-Khidr, who does three puzzling things. The lesson: human knowledge is limited, and patience is needed with what one cannot yet understand.",
      "Am Berg bittet Musa darum, Gott zu sehen; der Berg zerfällt, und er sinkt bewusstlos nieder. Er erhält die Tafeln „mit Ermahnung und Erklärung aller Dinge“ (7:145). In seiner Abwesenheit verehrt das Volk das Kalb.\nSure al-Kahf erzählt, wie Musa mit einem Diener Gottes reist, bekannt als al-Chidr, der drei rätselhafte Dinge tut. Die Lehre: Menschliches Wissen ist begrenzt, und es braucht Geduld mit dem, was man noch nicht versteht.",
      "سأل موسى ربه الرؤية عند الجبل فجعله دكًّا وخرّ موسى صعقًا، وأُوتي الألواح «موعظةً وتفصيلًا لكل شيء» (7:145)، وعبد قومه العجل في غيبته.\nوتروي سورة الكهف رحلة موسى مع عبدٍ من عباد الله يُعرف بالخضر فعل ثلاثة أمور محيّرة، والعبرة أن علم الإنسان محدود وأن الصبر لازم لما لم يُحط به خُبرًا.",
    ),
    quiz: [
      q(["What happened when Musa asked to see God?", "Was geschah, als Musa darum bat, Gott zu sehen?", "ماذا حدث حين سأل موسى الرؤية؟"],
        [["The mountain crumbled", "Der Berg zerfiel", "جُعل الجبل دكًّا"], ["The sea parted", "Das Meer teilte sich", "انفلق البحر"], ["It rained", "Es regnete", "نزل المطر"]], 0),
      q(["What is the main lesson of Musa and al-Khidr?", "Was ist die Hauptlehre von Musa und al-Chidr?", "ما العبرة من قصة موسى والخضر؟"],
        [["Travel is dangerous", "Reisen ist gefährlich", "السفر خطر"], ["Human knowledge is limited; be patient", "Menschliches Wissen ist begrenzt; Geduld", "علم الإنسان محدود فاصبر"], ["Ships must be sold", "Schiffe müssen verkauft werden", "تُباع السفن"]], 1),
    ],
  },
  {
    id: "dawud-sulayman", arabic: "داود وسليمان", verses: vv("34:10-13", "27:16-19"), tags: ["quran", "tafsir", "bible"],
    title: L3("Dawud and Sulayman", "Dawud und Sulaiman", "داود وسليمان"),
    text: L3(
      "Dawud receives the Zabur (4:163), the mountains and birds praise God with him, and iron is made soft for him to make armour. Sulayman inherits from him and is taught the speech of birds.\nWhen an ant warns its colony of Sulayman's army, he smiles and prays: \"My Lord, enable me to be grateful for Your favour\" (27:19). The Quran presents both as just, grateful kings, not as rulers seeking power.",
      "Dawud erhält den Zabur (4:163), Berge und Vögel lobpreisen Gott mit ihm, und das Eisen wird für ihn weich, um Panzer zu fertigen. Sulaiman beerbt ihn und lernt die Sprache der Vögel.\nAls eine Ameise ihr Volk vor Sulaimans Heer warnt, lächelt er und betet: „Mein Herr, lass mich dankbar sein für Deine Gnade“ (27:19). Der Koran zeigt beide als gerechte, dankbare Könige, nicht als Machtmenschen.",
      "أوتي داود الزبور (4:163)، وأوّبت معه الجبال والطير، وأُلين له الحديد يصنع الدروع. وورثه سليمان وعُلّم منطق الطير.\nولما حذّرت النملة قومها من جند سليمان تبسّم ضاحكًا وقال: «ربِّ أوزعني أن أشكر نعمتك» (27:19). ويقدّمهما القرآن ملكين عادلين شاكرين.",
    ),
    quiz: [
      q(["Which book was given to Dawud?", "Welches Buch erhielt Dawud?", "أي كتاب أوتي داود؟"],
        [["Tawrat", "Tora", "التوراة"], ["Zabur", "Zabur (Psalmen)", "الزبور"], ["Injil", "Indschil", "الإنجيل"]], 1),
      q(["What did Sulayman do when he heard the ant?", "Was tat Sulaiman, als er die Ameise hörte?", "ماذا فعل سليمان حين سمع النملة؟"],
        [["He smiled and thanked God", "Er lächelte und dankte Gott", "تبسّم وشكر الله"], ["He ordered an attack", "Er befahl einen Angriff", "أمر بالهجوم"], ["He ignored it", "Er beachtete sie nicht", "لم يلتفت"]], 0),
    ],
  },
  {
    id: "yunus", arabic: "ذو النون", verses: vv("21:87-88", "37:139-148"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yunus in the whale", "Yunus im Wal", "يونس في بطن الحوت"),
    text: L3(
      "Yunus leaves his people in anger before God permits it, boards a ship and is swallowed by a large fish. In the darkness he calls: \"There is no god but You, glory be to You, I was among the wrongdoers\" (21:87).\nHe is cast ashore, a gourd plant shades him, and he returns to a people of more than a hundred thousand who believe. Uniquely, the Quran says his whole people were spared (10:98).",
      "Yunus verlässt sein Volk im Zorn, bevor Gott es erlaubt, besteigt ein Schiff und wird von einem großen Fisch verschluckt. In der Dunkelheit ruft er: „Es gibt keinen Gott außer Dir, gepriesen seist Du, ich gehörte zu den Unrechttuenden“ (21:87).\nEr wird an Land geworfen, eine Kürbispflanze spendet ihm Schatten, und er kehrt zu einem Volk von über hunderttausend zurück, das glaubt. Einzigartig: Laut Koran wurde sein ganzes Volk verschont (10:98).",
      "ذهب يونس مغاضبًا قبل أن يؤذن له، فركب الفلك فالتقمه الحوت، فنادى في الظلمات: «لا إله إلا أنت سبحانك إني كنت من الظالمين» (21:87).\nفنُبذ بالعراء وأُنبتت عليه شجرة من يقطين، وأُرسل إلى مئة ألف أو يزيدون فآمنوا، وقومه وحدهم من نفعهم إيمانهم فكُشف عنهم العذاب (10:98).",
    ),
    quiz: [
      q(["What did Yunus call in the darkness?", "Was rief Yunus in der Dunkelheit?", "بماذا نادى يونس في الظلمات؟"],
        [["There is no god but You, glory be to You…", "Es gibt keinen Gott außer Dir, gepriesen seist Du …", "لا إله إلا أنت سبحانك…"], ["Save the ship", "Rette das Schiff", "نجِّ السفينة"], ["Send a storm", "Sende einen Sturm", "أرسل عاصفة"]], 0),
      q(["What happened to his people?", "Was geschah mit seinem Volk?", "ماذا حدث لقومه؟"],
        [["They were destroyed", "Sie wurden vernichtet", "أُهلكوا"], ["They believed and were spared", "Sie glaubten und wurden verschont", "آمنوا فكُشف عنهم العذاب"], ["They emigrated", "Sie wanderten aus", "هاجروا"]], 1),
    ],
  },
  {
    id: "ayyub", arabic: "أيوب", verses: vv("21:83-84", "38:41-44"), tags: ["quran", "tafsir", "bible"],
    title: L3("Ayyub and patience", "Ayyub und die Geduld", "أيوب والصبر"),
    text: L3(
      "Ayyub loses health, wealth and family. He does not complain against God but calls: \"Harm has touched me, and You are the Most Merciful of the merciful\" (21:83). He is told to strike the ground with his foot: a spring appears to wash and drink.\nGod restores him and says: \"We found him patient. What an excellent servant!\" (38:44).",
      "Ayyub verliert Gesundheit, Besitz und Familie. Er klagt nicht gegen Gott, sondern ruft: „Mich hat Schaden getroffen, und Du bist der Barmherzigste der Barmherzigen“ (21:83). Er soll mit dem Fuß auf den Boden stampfen: Eine Quelle tritt hervor zum Waschen und Trinken.\nGott stellt ihn wieder her und sagt: „Wir fanden ihn geduldig. Welch vortrefflicher Diener!“ (38:44).",
      "ابتُلي أيوب في بدنه وماله وأهله فلم يشكُ ربه بل نادى: «أني مسّني الضرّ وأنت أرحم الراحمين» (21:83)، فقيل له: «اركض برجلك هذا مغتسل بارد وشراب».\nفكشف الله ضرّه وقال: «إنا وجدناه صابرًا نِعم العبد إنه أوّاب» (38:44).",
    ),
    quiz: [
      q(["How did Ayyub call upon God?", "Wie rief Ayyub Gott an?", "كيف دعا أيوب ربه؟"],
        [["Harm has touched me, and You are the Most Merciful", "Mich hat Schaden getroffen, und Du bist der Barmherzigste", "مسّني الضرّ وأنت أرحم الراحمين"], ["Why me?", "Warum ich?", "لماذا أنا؟"], ["Give me a kingdom", "Gib mir ein Königreich", "هب لي ملكًا"]], 0),
      q(["How does God describe Ayyub?", "Wie beschreibt Gott Ayyub?", "بماذا وصف الله أيوب؟"],
        [["Patient, an excellent servant", "Geduldig, ein vortrefflicher Diener", "صابرًا نِعم العبد"], ["Rich", "Reich", "غنيًّا"], ["A warrior", "Ein Krieger", "محاربًا"]], 0),
    ],
  },
  {
    id: "zakariya-yahya", arabic: "زكريا ويحيى", verses: vv("19:2-15"), tags: ["quran", "tafsir", "bible"],
    title: L3("Zakariya and Yahya", "Zakariya und Yahya", "زكريا ويحيى"),
    text: L3(
      "Surah Maryam opens with Zakariya's quiet prayer in old age: \"My bones have weakened … give me an heir\" (19:4-6). He is given the glad tidings of Yahya, a name \"given to no one before\" (19:7), and as a sign he does not speak to people for three nights.\nYahya is given wisdom as a child, is kind to his parents, and is greeted: \"Peace on him the day he was born, the day he dies and the day he is raised alive\" (19:15).",
      "Sure Maryam beginnt mit Zakariyas leisem Gebet im Alter: „Meine Knochen sind schwach geworden … schenke mir einen Erben“ (19:4-6). Er erhält die frohe Botschaft von Yahya, einem Namen, „den Wir zuvor niemandem gaben“ (19:7), und als Zeichen spricht er drei Nächte nicht zu den Menschen.\nYahya erhält schon als Kind Weisheit, ist gütig zu seinen Eltern und wird gegrüßt: „Friede auf ihm am Tag seiner Geburt, am Tag seines Todes und am Tag, an dem er lebendig auferweckt wird“ (19:15).",
      "تفتتح سورة مريم بنداء زكريا الخفي في كِبَره: «ربِّ إني وهن العظم مني … فهب لي من لدنك وليًّا» (19:4-5)، فبُشّر بيحيى «لم نجعل له من قبل سميًّا» (19:7)، وآيته ألّا يكلّم الناس ثلاث ليال سويًّا.\nوأوتي يحيى الحكم صبيًّا وكان برًّا بوالديه، «وسلامٌ عليه يوم وُلد ويوم يموت ويوم يُبعث حيًّا» (19:15).",
    ),
    note: L3("In Christian tradition Yahya is John the Baptist (Luke 1).", "In der christlichen Tradition ist Yahya Johannes der Täufer (Lukas 1).", "يحيى في التقليد المسيحي هو يوحنا المعمدان (لوقا 1)."),
    quiz: [
      q(["What was Zakariya's sign?", "Was war Zakariyas Zeichen?", "ما آية زكريا؟"],
        [["Not speaking to people for three nights", "Drei Nächte nicht mit Menschen sprechen", "ألّا يكلّم الناس ثلاث ليال"], ["A star", "Ein Stern", "نجم"], ["Rain", "Regen", "مطر"]], 0),
      q(["Who is Yahya in Christian tradition?", "Wer ist Yahya in der christlichen Tradition?", "من هو يحيى في التقليد المسيحي؟"],
        [["Paul", "Paulus", "بولس"], ["John the Baptist", "Johannes der Täufer", "يوحنا المعمدان"], ["Peter", "Petrus", "بطرس"]], 1),
    ],
  },
  {
    id: "maryam-isa", arabic: "مريم وعيسى", verses: vv("19:16-33", "3:45"), tags: ["quran", "tafsir", "bible"],
    title: L3("Maryam and Isa", "Maryam und Isa", "مريم وعيسى"),
    text: L3(
      "Maryam is the only woman named in the Quran, and a surah carries her name. An angel announces a pure son; she asks how, as no man has touched her, and is told: \"It is easy for Me\" (19:21). Under a palm tree she gives birth; the infant Isa speaks in the cradle: \"I am the servant of God; He has given me the Scripture and made me a prophet\" (19:30).\nThe Quran calls Isa the Messiah, a word from God and a spirit from Him (3:45; 4:171), and honours him among the greatest messengers.",
      "Maryam ist die einzige namentlich genannte Frau im Koran, und eine Sure trägt ihren Namen. Ein Engel verkündet ihr einen reinen Sohn; sie fragt, wie das sein könne, da sie kein Mann berührt habe, und hört: „Das ist für Mich ein Leichtes“ (19:21). Unter einer Palme bringt sie ihn zur Welt; das Kind Isa spricht in der Wiege: „Ich bin der Diener Gottes; Er hat mir die Schrift gegeben und mich zum Propheten gemacht“ (19:30).\nDer Koran nennt Isa den Messias, ein Wort von Gott und einen Geist von Ihm (3:45; 4:171), und ehrt ihn unter den größten Gesandten.",
      "مريم هي المرأة الوحيدة المسمّاة في القرآن، وسُمّيت سورة باسمها. بشّرها الملك بغلام زكي فقالت: أنّى يكون لي غلام ولم يمسسني بشر؟ قال: «هو عليّ هيّن» (19:21). ووضعته تحت النخلة، فتكلّم عيسى في المهد: «إني عبد الله آتاني الكتاب وجعلني نبيًّا» (19:30).\nويسمّي القرآن عيسى المسيحَ وكلمةً من الله وروحًا منه (3:45؛ 4:171)، ويجعله من أولي العزم من الرسل.",
    ),
    note: L3("Muslims and Christians share the virgin birth and the title Messiah; they differ on Isa's divinity and on the crucifixion (4:157). This lesson states the Quranic view without comparing or ranking.", "Muslime und Christen teilen die Jungfrauengeburt und den Titel Messias; sie unterscheiden sich in der Frage der Göttlichkeit Isas und der Kreuzigung (4:157). Diese Lektion gibt die koranische Sicht wieder, ohne zu vergleichen oder zu werten.", "يتفق المسلمون والمسيحيون على الولادة العذراوية ولقب المسيح، ويختلفون في ألوهية عيسى والصلب (4:157). يعرض هذا الدرس الرؤية القرآنية دون مقارنة أو مفاضلة."),
    quiz: [
      q(["What did the infant Isa say in the cradle?", "Was sagte das Kind Isa in der Wiege?", "ماذا قال عيسى في المهد؟"],
        [["I am the servant of God", "Ich bin der Diener Gottes", "إني عبد الله"], ["I am a king", "Ich bin ein König", "أنا ملك"], ["Feed me", "Gib mir zu essen", "أطعموني"]], 0),
      q(["Which woman is named in the Quran?", "Welche Frau wird im Koran namentlich genannt?", "أي امرأة سُمّيت في القرآن؟"],
        [["Hajar", "Hadschar", "هاجر"], ["Asiya", "Asiya", "آسية"], ["Maryam", "Maryam", "مريم"]], 2),
    ],
  },
  {
    id: "books", arabic: "الكتب", verses: vv("87:18-19", "4:163", "5:44", "5:46", "5:48"), tags: ["quran", "tafsir", "bible"],
    title: L3("The revealed Books", "Die offenbarten Bücher", "الكتب المنزلة"),
    text: L3(
      "Belief in the revealed books is part of Muslim faith. The Quran names the Suhuf (scrolls) of Ibrahim and Musa (87:19), the Tawrat given to Musa, the Zabur to Dawud and the Injil to Isa. It describes the Tawrat as \"guidance and light\" (5:44) and the Injil likewise (5:46).\nThe Quran calls itself confirming what came before and a muhaymin, a guardian over it (5:48). \"For each of you We made a law and a way … so compete in good deeds\" (5:48).",
      "Der Glaube an die offenbarten Bücher gehört zum muslimischen Glauben. Der Koran nennt die Suhuf (Blätter) Ibrahims und Musas (87:19), die Tora, die Musa gegeben wurde, den Zabur Dawuds und das Indschil Isas. Er beschreibt die Tora als „Rechtleitung und Licht“ (5:44), ebenso das Indschil (5:46).\nDer Koran nennt sich bestätigend für das Vorherige und einen Muhaymin, einen Wächter darüber (5:48). „Für jeden von euch haben Wir ein Gesetz und einen Weg bestimmt … so wetteifert im Guten“ (5:48).",
      "الإيمان بالكتب من أركان الإيمان. يذكر القرآن صحف إبراهيم وموسى (87:19) والتوراة التي أوتيها موسى والزبور الذي أوتيه داود والإنجيل الذي أوتيه عيسى، ويصف التوراة بأن «فيها هدى ونور» (5:44) وكذلك الإنجيل (5:46).\nويصف القرآن نفسه بأنه مصدّق لما بين يديه ومهيمن عليه (5:48): «لكلٍّ جعلنا منكم شرعة ومنهاجًا … فاستبقوا الخيرات».",
    ),
    note: L3("Muslim scholars discuss how the scriptures in use today relate to the original revelations (the question of tahrif), with a range of views from altered wording to altered interpretation.", "Muslimische Gelehrte diskutieren, wie sich die heute gebräuchlichen Schriften zu den ursprünglichen Offenbarungen verhalten (Frage des Tahrif), mit Ansichten von veränderten Worten bis zu veränderter Auslegung.", "يناقش العلماء المسلمون علاقة الكتب المتداولة اليوم بالوحي الأصلي (مسألة التحريف)، وتتراوح الآراء بين تحريف اللفظ وتحريف التأويل."),
    quiz: [
      q(["Which book was given to Isa?", "Welches Buch wurde Isa gegeben?", "أي كتاب أوتيه عيسى؟"],
        [["Injil", "Indschil", "الإنجيل"], ["Zabur", "Zabur", "الزبور"], ["Suhuf", "Suhuf", "الصحف"]], 0),
      q(["What does \"muhaymin\" (5:48) mean?", "Was bedeutet „Muhaymin“ (5:48)?", "ما معنى «مهيمن» (5:48)؟"],
        [["A translator", "Ein Übersetzer", "مترجم"], ["A guardian over the earlier books", "Ein Wächter über die früheren Bücher", "رقيب وشاهد على ما قبله"], ["A summary", "Eine Zusammenfassung", "ملخّص"]], 1),
    ],
  },
  {
    id: "ahl-al-kitab", arabic: "أهل الكتاب", verses: vv("3:64", "29:46", "2:62", "5:82-83"), tags: ["quran", "tafsir", "sunni", "shia"],
    title: L3("The People of the Book in the Quran", "Die Leute der Schrift im Koran", "أهل الكتاب في القرآن"),
    text: L3(
      "\"People of the Book\" (ahl al-kitab) mainly refers to Jews and Christians. The Quran invites them to \"a common word: that we worship none but God\" (3:64), and tells Muslims to argue with them \"only in the best way\" (29:46).\nIt praises some among them for faith and humility (5:82-83) and criticises particular attitudes in other passages. Islamic law allowed marriage with Jewish and Christian women and eating their food (5:5).",
      "„Leute der Schrift“ (ahl al-kitab) meint vor allem Juden und Christen. Der Koran lädt sie ein zu „einem gemeinsamen Wort: dass wir niemandem dienen außer Gott“ (3:64), und sagt den Muslimen, mit ihnen „nur auf die beste Art“ zu streiten (29:46).\nEr lobt einige unter ihnen für Glauben und Demut (5:82-83) und kritisiert an anderen Stellen bestimmte Haltungen. Das islamische Recht erlaubte die Ehe mit jüdischen und christlichen Frauen und das Essen ihrer Speisen (5:5).",
      "يُقصد بأهل الكتاب أساسًا اليهود والنصارى. يدعوهم القرآن إلى «كلمة سواء بيننا وبينكم ألّا نعبد إلا الله» (3:64)، ويأمر المسلمين ألّا يجادلوهم «إلا بالتي هي أحسن» (29:46).\nويثني على بعضهم لإيمانهم وتواضعهم (5:82-83) وينتقد مواقف معيّنة في مواضع أخرى. وأباح الفقه نكاح الكتابيات وطعام أهل الكتاب (5:5).",
    ),
    note: L3("Scholars differ on how to read 2:62 (salvation of earlier believers) and on whether Zoroastrians count as People of the Book. Shia jurisprudence has held a range of positions on marriage with Jewish and Christian women.", "Gelehrte lesen 2:62 (Heil früherer Gläubiger) unterschiedlich und sind uneins, ob Zoroastrier zu den Leuten der Schrift zählen. Die schiitische Rechtslehre vertrat verschiedene Positionen zur Ehe mit jüdischen und christlichen Frauen.", "يختلف العلماء في فهم 2:62 (نجاة المؤمنين السابقين) وفي عدّ المجوس من أهل الكتاب، وتعددت أقوال الفقه الشيعي في نكاح الكتابيات."),
    quiz: [
      q(["What does 3:64 invite the People of the Book to?", "Wozu lädt 3:64 die Leute der Schrift ein?", "إلامَ تدعو الآية 3:64 أهل الكتاب؟"],
        [["A common word: worship none but God", "Ein gemeinsames Wort: niemandem dienen außer Gott", "كلمة سواء: ألّا نعبد إلا الله"], ["A trade agreement", "Ein Handelsabkommen", "اتفاق تجاري"], ["A contest", "Einen Wettstreit", "مبارزة"]], 0),
      q(["How should Muslims argue with them according to 29:46?", "Wie sollen Muslime laut 29:46 mit ihnen streiten?", "كيف يجادلهم المسلمون بحسب 29:46؟"],
        [["Not at all", "Gar nicht", "لا يجادلونهم"], ["Only in the best way", "Nur auf die beste Art", "بالتي هي أحسن"], ["Loudly", "Laut", "بصوت عالٍ"]], 1),
    ],
  },
  {
    id: "medina-charter", arabic: "صحيفة المدينة", verses: vv("60:8", "2:256", "22:40"), tags: ["history", "tafsir"],
    title: L3("Interfaith history 1: Medina", "Interreligiöse Geschichte 1: Medina", "تاريخ التعايش 1: المدينة"),
    text: L3(
      "After the Hijra in 622 the Prophet agreed a written compact in Medina, known as the Constitution or Charter of Medina (Sahifat al-Madina). It names Muslim and Jewish tribes as one community (umma) for defence, each keeping its own religion.\nThe Quran states: \"There is no compulsion in religion\" (2:256), and permits kindness and justice towards those who do not fight Muslims (60:8). The relationship with some Jewish tribes later broke down in conflict; historians weigh the sources differently.",
      "Nach der Hidschra 622 schloss der Prophet in Medina einen schriftlichen Vertrag, bekannt als Verfassung oder Charta von Medina (Sahifat al-Madina). Sie nennt muslimische und jüdische Stämme eine Gemeinschaft (Umma) zur Verteidigung, wobei jede ihre Religion behält.\nDer Koran sagt: „Es gibt keinen Zwang in der Religion“ (2:256), und erlaubt Güte und Gerechtigkeit gegenüber denen, die Muslime nicht bekämpfen (60:8). Das Verhältnis zu einigen jüdischen Stämmen zerbrach später im Konflikt; Historiker gewichten die Quellen unterschiedlich.",
      "بعد الهجرة سنة 622 كتب النبي ﷺ في المدينة عهدًا يُعرف بصحيفة المدينة، جعل فيه قبائل المسلمين واليهود أمةً واحدة في الدفاع مع احتفاظ كلٍّ بدينه.\nويقول القرآن: «لا إكراه في الدين» (2:256)، ويبيح البرّ والقسط لمن لم يقاتل المسلمين (60:8). ثم انتهت العلاقة مع بعض القبائل اليهودية إلى نزاع، ويختلف المؤرخون في قراءة المصادر.",
    ),
    quiz: [
      q(["What did the Charter of Medina establish?", "Was begründete die Charta von Medina?", "ماذا أسّست صحيفة المدينة؟"],
        [["One community for defence, each keeping its religion", "Eine Gemeinschaft zur Verteidigung, jede mit ihrer Religion", "أمة واحدة في الدفاع مع حفظ دين كلٍّ"], ["A single religion", "Eine einzige Religion", "دينًا واحدًا"], ["A trade tax", "Eine Handelssteuer", "ضريبة تجارية"]], 0),
      q(["Which verse says there is no compulsion in religion?", "Welcher Vers sagt, dass es keinen Zwang in der Religion gibt?", "أي آية تقول لا إكراه في الدين؟"],
        [["2:256", "2:256", "2:256"], ["1:1", "1:1", "1:1"], ["112:1", "112:1", "112:1"]], 0),
    ],
  },
  {
    id: "andalus-millet", arabic: "الأندلس والملل", verses: vv("49:13", "5:8"), tags: ["history"],
    title: L3("Interfaith history 2: al-Andalus and the Ottomans", "Interreligiöse Geschichte 2: al-Andalus und die Osmanen", "تاريخ التعايش 2: الأندلس والعثمانيون"),
    text: L3(
      "In al-Andalus (711-1492), Muslims, Jews and Christians lived side by side for centuries. Cordoba and Toledo became centres of learning; scholars such as Ibn Rushd and Maimonides wrote there, and Toledo's translators carried works into Latin. Historians describe this \"convivencia\" with both its achievements and its periods of tension.\nThe Ottoman Empire organised non-Muslim communities as millets: Greek Orthodox, Armenian, Jewish and others had their own religious leaders, courts for family law and schools. After 1492 the Ottomans welcomed many Jews expelled from Spain.",
      "In al-Andalus (711-1492) lebten Muslime, Juden und Christen jahrhundertelang nebeneinander. Córdoba und Toledo wurden Zentren der Gelehrsamkeit; Gelehrte wie Ibn Ruschd und Maimonides schrieben dort, und Toledos Übersetzer übertrugen Werke ins Lateinische. Historiker beschreiben diese „Convivencia“ mit ihren Leistungen und ihren Spannungszeiten.\nDas Osmanische Reich organisierte nichtmuslimische Gemeinschaften als Millets: Griechisch-Orthodoxe, Armenier, Juden und andere hatten eigene geistliche Oberhäupter, Gerichte für Familienrecht und Schulen. Nach 1492 nahmen die Osmanen viele aus Spanien vertriebene Juden auf.",
      "في الأندلس (711-1492) عاش المسلمون واليهود والنصارى جنبًا إلى جنب قرونًا، وصارت قرطبة وطليطلة مراكز علم كتب فيها ابن رشد وموسى بن ميمون، ونقل مترجمو طليطلة كتبًا إلى اللاتينية. ويصف المؤرخون هذا التعايش بإنجازاته وفترات توتره.\nونظّمت الدولة العثمانية الطوائف غير المسلمة في نظام الملل: للروم الأرثوذكس والأرمن واليهود وغيرهم رؤساؤهم الدينيون ومحاكم للأحوال الشخصية ومدارسهم. وبعد 1492 استقبل العثمانيون كثيرًا من اليهود المطرودين من إسبانيا.",
    ),
    quiz: [
      q(["Which Jewish scholar was born in Cordoba?", "Welcher jüdische Gelehrte wurde in Córdoba geboren?", "أي عالم يهودي وُلد في قرطبة؟"],
        [["Maimonides", "Maimonides", "موسى بن ميمون"], ["Rashi", "Raschi", "راشي"], ["Spinoza", "Spinoza", "سبينوزا"]], 0),
      q(["What was the Ottoman millet system?", "Was war das osmanische Millet-System?", "ما نظام الملل العثماني؟"],
        [["A tax on grain", "Eine Getreidesteuer", "ضريبة على الحبوب"], ["Self-administration of religious communities", "Selbstverwaltung der Religionsgemeinschaften", "إدارة ذاتية للطوائف الدينية"], ["An army unit", "Eine Armeeeinheit", "فرقة عسكرية"]], 1),
    ],
  },
  {
    id: "abu-dhabi-today", arabic: "الأخوة الإنسانية", verses: vv("49:13", "5:48"), tags: ["today", "history"],
    title: L3("Today: Human Fraternity and the Abrahamic Family House", "Heute: Menschliche Geschwisterlichkeit und Abrahamic Family House", "اليوم: الأخوة الإنسانية وبيت العائلة الإبراهيمية"),
    text: L3(
      "On 4 February 2019 Pope Francis and the Grand Imam of al-Azhar, Ahmad al-Tayyeb, signed the Document on Human Fraternity for World Peace and Living Together in Abu Dhabi. The UN later declared 4 February the International Day of Human Fraternity.\nIn 2023 the Abrahamic Family House opened on Saadiyat Island in Abu Dhabi: a mosque, a church and a synagogue of equal size on one site, with a shared forum. The Quran: \"We made you peoples and tribes that you may know one another\" (49:13).",
      "Am 4. Februar 2019 unterzeichneten Papst Franziskus und der Großimam von al-Azhar, Ahmad al-Tayyeb, in Abu Dhabi das Dokument über die Brüderlichkeit aller Menschen für ein friedliches Zusammenleben in der Welt. Die UN erklärten den 4. Februar später zum Internationalen Tag der menschlichen Geschwisterlichkeit.\n2023 wurde auf der Insel Saadiyat in Abu Dhabi das Abrahamic Family House eröffnet: eine Moschee, eine Kirche und eine Synagoge gleicher Größe auf einem Gelände, mit gemeinsamem Forum. Der Koran: „Wir haben euch zu Völkern und Stämmen gemacht, damit ihr einander kennenlernt“ (49:13).",
      "في 4 فبراير 2019 وقّع البابا فرنسيس وشيخ الأزهر أحمد الطيب في أبوظبي «وثيقة الأخوة الإنسانية من أجل السلام العالمي والعيش المشترك»، ثم أعلنت الأمم المتحدة 4 فبراير يومًا دوليًا للأخوة الإنسانية.\nوفي 2023 افتُتح بيت العائلة الإبراهيمية في جزيرة السعديات بأبوظبي: مسجد وكنيسة وكنيس بحجم متساوٍ في موقع واحد مع منتدى مشترك. والقرآن يقول: «وجعلناكم شعوبًا وقبائل لتعارفوا» (49:13).",
    ),
    quiz: [
      q(["Who signed the Document on Human Fraternity?", "Wer unterzeichnete das Dokument über die menschliche Brüderlichkeit?", "من وقّع وثيقة الأخوة الإنسانية؟"],
        [["Pope Francis and the Grand Imam of al-Azhar", "Papst Franziskus und der Großimam von al-Azhar", "البابا فرنسيس وشيخ الأزهر"], ["Two kings", "Zwei Könige", "ملكان"], ["The UN Secretary-General alone", "Nur der UN-Generalsekretär", "الأمين العام للأمم المتحدة وحده"]], 0),
      q(["What does the Abrahamic Family House contain?", "Was umfasst das Abrahamic Family House?", "ماذا يضم بيت العائلة الإبراهيمية؟"],
        [["A museum only", "Nur ein Museum", "متحفًا فقط"], ["A mosque, a church and a synagogue", "Eine Moschee, eine Kirche und eine Synagoge", "مسجدًا وكنيسة وكنيسًا"], ["A university", "Eine Universität", "جامعة"]], 1),
    ],
  },
];

export const ABRAHAMIC_COURSE: CourseDef = {
  id: "abrahamic",
  storeKey: "qmc.abrahamic.course.v1",
  route: "/abrahamic",
  title: L14("Abraham and the Abrahamic religions", "Abraham und die abrahamitischen Religionen", "إبراهيم والأديان الإبراهيمية", "Hz. İbrahim ve İbrahimî dinler", "حضرت ابراہیم اور ابراہیمی مذاہب", "ابراهیم و ادیان ابراهیمی", "ابراهیم او ابراهیمي دینونه", "Abraham et les religions abrahamiques", "Abraham y las religiones abrahámicas", "Ibrahim dan agama-agama Abrahamik", "Ibrahim dan agama-agama Abrahamik", "ইব্রাহিম ও আব্রাহামীয় ধর্মসমূহ", "Авраам и авраамические религии", "易卜拉欣与亚伯拉罕诸宗教"),
  lessons: ABRAHAMIC_LESSONS,
};
