// Abrahamic course: 21 lessons. Verse keys only (text from the app's verse data); explanations in our own words,
// neutral and tradition-aware (where Muslim schools or Jewish/Christian sources differ, the note says so, without ranking).
// No Quran or hadith wording is typed here (BLUEPRINT §4): the lesson text describes and points to the verse key, the
// verses themselves are rendered from the Quran.com data under the explanation. Lessons rewritten on 22.10.2026 carry
// review: "needs_review" until a scholar has checked them.
import { L14, L3, vv, type CourseDef, type Lesson, type Q } from "./courseKit";

const q = (q: [string, string, string], options: [string, string, string][], answer: number, why?: [string, string, string]): Q =>
  ({ q: L3(...q), options: options.map((o) => L3(...o)), answer, why: why ? L3(...why) : undefined });

export const ABRAHAMIC_LESSONS: Lesson[] = [
  {
    id: "ibrahim-idols", review: "needs_review", arabic: "إبراهيم", verses: vv("6:75-79", "21:57-58", "21:68-69"), tags: ["quran", "tafsir", "bible"],
    title: L3("Ibrahim's search and the idols", "Ibrahims Suche und die Götzen", "بحث إبراهيم والأصنام"),
    text: L3(
      "The Quran shows the young Ibrahim looking at a star, the moon and the sun, and turning away from each as it sets: what disappears cannot be his Lord. He then turns in worship to the Creator of the heavens and the earth, as a hanif, one inclined to pure monotheism (6:79).\nHe breaks the idols of his people, leaving the largest, and asks them to question it. They throw him into a fire, and God commands the fire to be cool and harmless for him (21:69).",
      "Der Koran zeigt den jungen Ibrahim, der einen Stern, den Mond und die Sonne betrachtet und sich von jedem abwendet, als er untergeht: Was verschwindet, kann nicht sein Herr sein. Dann wendet er sich in Anbetung dem Schöpfer der Himmel und der Erde zu, als Hanif, als einer, der dem reinen Eingottglauben zuneigt (6:79).\nEr zerschlägt die Götzen seines Volkes, lässt den größten stehen und fordert sie auf, ihn zu befragen. Sie werfen ihn ins Feuer, und Gott befiehlt dem Feuer, für ihn kühl und unschädlich zu sein (21:69).",
      "يصوّر القرآن إبراهيم الفتى وهو ينظر إلى الكوكب ثم القمر ثم الشمس، فيعرض عن كلٍّ منها حين يأفل: فما يغيب لا يكون ربًّا. ثم يتوجّه بعبادته إلى خالق السماوات والأرض موحّدًا بعيدًا عن الشرك (6:79).\nويكسر أصنام قومه إلا كبيرًا لهم ويدعوهم إلى سؤاله، فيلقونه في النار، فيأمر الله النار أن تكون عليه باردة لا تؤذيه (21:69).",
    ),
    note: L3("Commentators differ on whether the star scene was Ibrahim's own search or an argument addressed to his people. The breaking of the idols also appears in later Jewish tradition (Midrash), not in the Bible itself.",
      "Die Kommentatoren sind sich uneinig, ob die Sternszene Ibrahims eigene Suche oder ein Argument an sein Volk war. Das Zerschlagen der Götzen findet sich auch in späterer jüdischer Überlieferung (Midrasch), nicht in der Bibel selbst.",
      "اختلف المفسرون: هل كان مشهد الكوكب بحثًا من إبراهيم أم حجةً على قومه؟ وقصة تكسير الأصنام موجودة أيضًا في التراث اليهودي اللاحق (المدراش) لا في نص التوراة."),
    quiz: [
      q(["Why does Ibrahim turn away from the star, moon and sun?", "Warum wendet sich Ibrahim von Stern, Mond und Sonne ab?", "لماذا أعرض إبراهيم عن الكوكب والقمر والشمس؟"],
        [["Because they set and disappear", "Weil sie untergehen und verschwinden", "لأنها تأفل وتغيب"], ["Because his father forbade it", "Weil sein Vater es verbot", "لأن أباه نهاه"], ["Because they were too small", "Weil sie zu klein waren", "لأنها صغيرة"]], 0),
      q(["What did God command the fire to be for Ibrahim?", "Was gebot Gott dem Feuer für Ibrahim?", "بماذا أمر الله النار في شأن إبراهيم؟"],
        [["Hotter than before", "Heißer als zuvor", "أن تشتدّ حرارتها"], ["Cool and harmless", "Kühl und unschädlich", "أن تكون باردة لا تؤذيه"], ["Extinguished by night", "Nachts erloschen", "أن تنطفئ ليلًا"]], 1, ["Surah al-Anbiya 21:69.", "Sure al-Anbiya 21:69.", "سورة الأنبياء 21:69."]),
    ],
  },
  {
    id: "ibrahim-trials", review: "needs_review", arabic: "الابتلاء", verses: vv("2:124", "37:99-111"), tags: ["quran", "tafsir", "sunni", "shia", "bible"],
    title: L3("Ibrahim's trials and the sacrifice", "Ibrahims Prüfungen und das Opfer", "ابتلاءات إبراهيم والذبح"),
    text: L3(
      "God tested Ibrahim with commands, and he carried them out in full; then God made him an imam, a leader for people (2:124). The greatest trial comes in Surah as-Saffat: Ibrahim sees in a dream that he sacrifices his son. The son tells his father to do what he has been commanded and promises to be patient (37:102). Both submit, and God redeems the son with a sacrificial animal (37:107).\nEid al-Adha and the sacrifice during Hajj commemorate this moment.",
      "Gott prüfte Ibrahim mit Geboten, und er erfüllte sie vollständig; daraufhin machte Gott ihn zu einem Imam, einem Vorbild für die Menschen (2:124). Die größte Prüfung erzählt Sure as-Saffat: Ibrahim sieht im Traum, dass er seinen Sohn opfert. Der Sohn sagt seinem Vater, er solle tun, was ihm befohlen wurde, und verspricht Geduld (37:102). Beide ergeben sich, und Gott löst den Sohn durch ein Opfertier aus (37:107).\nDas Opferfest und das Opfer während der Hadsch erinnern an diesen Moment.",
      "امتحن الله إبراهيم بأوامر فقام بها كاملة، فجعله إمامًا يُقتدى به (2:124). وأعظم الابتلاء في سورة الصافات: يرى إبراهيم في المنام أنه يذبح ابنه، فيطلب الابن من أبيه أن يمضي لما أُمر به ويعده بالصبر (37:102). فلما استسلما لأمر الله فدى الله الابن بذبيحة (37:107).\nوعيد الأضحى والهدي في الحج يذكّران بهذه اللحظة.",
    ),
    note: L3("The Quran does not name the son here. Most Muslim scholars, Sunni and Shia, hold it was Ismail, since the glad tidings of Ishaq follow afterwards (37:112); some early authorities named Ishaq. In Genesis 22 the son is Isaac. Shia tafsir also reads 2:124 as the root of the imamate.",
      "Der Koran nennt den Sohn hier nicht. Die meisten muslimischen Gelehrten, sunnitisch wie schiitisch, sehen in ihm Ismail, da die frohe Botschaft von Ishaq erst danach folgt (37:112); einige frühe Autoritäten nannten Ishaq. In Genesis 22 ist es Isaak. Schiitischer Tafsir liest 2:124 zudem als Grundlage des Imamats.",
      "لم يسمِّ القرآن الابن هنا. وجمهور العلماء من السنة والشيعة على أنه إسماعيل لأن البشارة بإسحاق جاءت بعدها (37:112)، وذهب بعض المتقدمين إلى أنه إسحاق. وفي سفر التكوين 22 هو إسحاق. ويرى التفسير الشيعي في 2:124 أصلًا للإمامة."),
    quiz: [
      q(["How did the son answer his father?", "Wie antwortete der Sohn seinem Vater?", "بماذا أجاب الابن أباه؟"],
        [["He wanted to flee", "Er wollte fliehen", "أراد أن يهرب"], ["He told him to do as commanded and promised patience", "Er sagte, er solle tun, was befohlen ist, und versprach Geduld", "طلب منه أن يمضي لأمر الله ووعده بالصبر"], ["He asked to wait until the next day", "Er bat, bis zum nächsten Tag zu warten", "طلب الانتظار إلى الغد"]], 1, ["Surah as-Saffat 37:102.", "Sure as-Saffat 37:102.", "سورة الصافات 37:102."]),
      q(["Which festival commemorates this event?", "Welches Fest erinnert an dieses Ereignis?", "أي عيد يذكّر بهذا الحدث؟"],
        [["Eid al-Fitr", "Ramadanfest", "عيد الفطر"], ["Eid al-Adha", "Opferfest", "عيد الأضحى"], ["Mawlid", "Maulid", "المولد"]], 1),
    ],
  },
  {
    id: "hajar-ismail", review: "needs_review", arabic: "هاجر وإسماعيل", verses: vv("14:35-37", "2:158"), tags: ["quran", "tafsir", "bible", "history"],
    title: L3("Hajar and Ismail in the valley", "Hadschar und Ismail im Tal", "هاجر وإسماعيل في الوادي"),
    text: L3(
      "Ibrahim prays for the family he leaves in a barren valley beside God's sacred House (14:37). A hadith in Sahih al-Bukhari (Book of the Prophets) tells how Hajar asked him whether God had commanded this; when he said yes, she was certain that God would not let them be lost.\nSearching for water she ran seven times between the hills of Safa and Marwa, until the spring of Zamzam appeared. Every pilgrim repeats her walk in the sa'i.",
      "Ibrahim betet für die Familie, die er in einem kargen Tal beim geschützten Haus Gottes zurücklässt (14:37). Ein Hadith im Sahih al-Buchari (Buch der Propheten) erzählt, wie Hadschar ihn fragte, ob Gott ihm das befohlen habe; als er bejahte, war sie gewiss, dass Gott sie nicht im Stich lassen würde.\nAuf der Suche nach Wasser lief sie siebenmal zwischen den Hügeln Safa und Marwa, bis die Quelle Zamzam hervortrat. Jede Pilgerin und jeder Pilger wiederholt ihren Weg im Sa'i.",
      "يدعو إبراهيم لأهله الذين تركهم في وادٍ قاحل عند بيت الله المحرم (14:37). وفي صحيح البخاري (كتاب أحاديث الأنبياء) أن هاجر سألته هل أمره الله بذلك، فلما أجاب بنعم أيقنت أن الله لن يتركهم.\nوسعت بين الصفا والمروة سبع مرات تطلب الماء حتى نبع زمزم، ويكرر كل حاج ومعتمر سعيها.",
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
    id: "kaaba-building", review: "needs_review", arabic: "بناء البيت", verses: vv("2:125-129", "22:26-27"), tags: ["quran", "tafsir", "history"],
    title: L3("Ibrahim and Ismail build the Kaaba", "Ibrahim und Ismail errichten die Kaaba", "إبراهيم وإسماعيل يرفعان القواعد"),
    text: L3(
      "While Ibrahim and Ismail raised the foundations of the House (2:127), they prayed for acceptance, for a community devoted to God and for a messenger from among their descendants. Muslims read 2:129 as a prayer answered in the Prophet Muhammad.\nGod tells Ibrahim to keep the House pure for all who circle it and pray there, and to call people to pilgrimage: they would come on foot and on lean camels from distant paths (22:26-27). The Maqam Ibrahim marks the stone on which, by tradition, he stood.",
      "Während Ibrahim und Ismail die Grundmauern des Hauses errichteten (2:127), beteten sie um Annahme, um eine Gemeinschaft, die sich Gott hingibt, und um einen Gesandten aus ihren Nachkommen. Muslime lesen 2:129 als ein im Propheten Muhammad erhörtes Gebet.\nGott trägt Ibrahim auf, das Haus rein zu halten für alle, die es umkreisen und dort beten, und die Menschen zur Pilgerfahrt zu rufen: Sie würden zu Fuß und auf mageren Kamelen von fernen Wegen kommen (22:26-27). Der Maqam Ibrahim bezeichnet den Stein, auf dem er der Überlieferung nach stand.",
      "وبينما كان إبراهيم وإسماعيل يبنيان أساس البيت (2:127) دعَوا بالقبول وبأمة مسلمة وبرسول من ذريتهما، ويقرأ المسلمون 2:129 دعاءً استُجيب في النبي محمد ﷺ.\nوأمر الله إبراهيم أن يطهّر البيت لمن يطوفون به ويصلّون فيه، وأن ينادي الناس إلى الحج فيأتوا مشاةً وركبانًا من كل طريق بعيد (22:26-27). ومقام إبراهيم هو الحجر الذي قام عليه بحسب الرواية.",
    ),
    quiz: [
      q(["Who raised the foundations of the House with Ibrahim?", "Wer errichtete mit Ibrahim die Grundmauern des Hauses?", "من رفع القواعد مع إبراهيم؟"],
        [["Ishaq", "Ishaq", "إسحاق"], ["Ismail", "Ismail", "إسماعيل"], ["Lut", "Lut", "لوط"]], 1),
      q(["What does the Maqam Ibrahim mark?", "Was bezeichnet der Maqam Ibrahim?", "ما هو مقام إبراهيم؟"],
        [["His grave", "Sein Grab", "قبره"], ["The stone he stood on while building", "Den Stein, auf dem er beim Bau stand", "الحجر الذي قام عليه عند البناء"], ["A well", "Einen Brunnen", "بئر"]], 1),
    ],
  },
  {
    id: "lut", review: "needs_review", arabic: "لوط", verses: vv("11:77-83", "29:26"), tags: ["quran", "tafsir", "bible"],
    title: L3("Lut and his people", "Lut und sein Volk", "لوط وقومه"),
    text: L3(
      "Lut, Ibrahim's nephew in the tradition, believed with him and emigrated (29:26). He was sent to a people who openly committed grave wrongs and assaulted guests. When messengers came as guests, Lut tried to protect them. They told him to leave by night with his family, and the towns were overturned.\nThe Quran presents Lut as a prophet of integrity who stood alone for hospitality and decency.",
      "Lut, der Überlieferung nach Ibrahims Neffe, glaubte mit ihm und wanderte aus (29:26). Er wurde zu einem Volk gesandt, das offen schweres Unrecht beging und Gäste bedrängte. Als Gesandte als Gäste kamen, versuchte Lut sie zu schützen. Sie sagten ihm, er solle nachts mit seiner Familie fortgehen, und die Städte wurden umgestürzt.\nDer Koran zeigt Lut als aufrichtigen Propheten, der allein für Gastfreundschaft und Anstand eintrat.",
      "لوط، ابن أخي إبراهيم في الرواية، آمن له وهاجر (29:26). أُرسل إلى قوم يجاهرون بالفاحشة ويعتدون على الضيف. فلما جاءته الرسل ضيوفًا حاول أن يحميهم، فأمروه أن يخرج بأهله ليلًا، ثم قُلبت المدن على أهلها.\nويقدّم القرآن لوطًا نبيًّا مستقيمًا وقف وحده للضيافة والفضيلة.",
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
    id: "yusuf-dream", review: "needs_review", arabic: "رؤيا يوسف", verses: vv("12:3-6", "12:15-18"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yusuf 1: the dream and the well", "Yusuf 1: der Traum und der Brunnen", "يوسف 1: الرؤيا والجب"),
    text: L3(
      "Surah Yusuf describes its own telling as the finest of stories (12:3) and tells one arc from start to end. The boy Yusuf sees eleven stars, the sun and the moon prostrating to him. Yaqub tells him not to share it with his brothers.\nOut of jealousy the brothers throw him into a well and bring back his shirt with false blood. Yaqub answers with patience free of complaint, the sabr jamil of 12:18.",
      "Sure Yusuf beschreibt ihre eigene Erzählung als die schönste (12:3) und erzählt einen Bogen vom Anfang bis zum Ende. Der Junge Yusuf sieht elf Sterne, die Sonne und den Mond, die sich vor ihm niederwerfen. Yaqub rät ihm, es seinen Brüdern nicht zu erzählen.\nAus Eifersucht werfen ihn die Brüder in einen Brunnen und bringen sein Hemd mit falschem Blut zurück. Yaqub antwortet mit Geduld ohne Klage, dem Sabr dschamil aus 12:18.",
      "تقدّم سورة يوسف قصّتها على أنها أجمل ما يُروى (12:3)، وتروي قصة واحدة من أولها إلى آخرها. يرى يوسف الصغير في منامه أحد عشر كوكبًا ومعها الشمس والقمر تسجد له، فينهاه يعقوب أن يحكيها لإخوته.\nويلقيه إخوته حسدًا في بئر عميقة ويعودون بقميصه ملطّخًا بدم مكذوب، فيقابل يعقوب المصاب بصبر لا شكوى فيه (12:18).",
    ),
    quiz: [
      q(["What did Yusuf see in his dream?", "Was sah Yusuf in seinem Traum?", "ماذا رأى يوسف في منامه؟"],
        [["Seven cows", "Sieben Kühe", "سبع بقرات"], ["Eleven stars, the sun and the moon", "Elf Sterne, Sonne und Mond", "أحد عشر كوكبًا والشمس والقمر"], ["A ship", "Ein Schiff", "سفينة"]], 1),
      q(["How did Yaqub respond to the loss?", "Wie antwortete Yaqub auf den Verlust?", "بماذا قابل يعقوب الفقد؟"],
        [["With beautiful patience", "Mit schöner Geduld", "بالصبر الجميل"], ["With revenge", "Mit Rache", "بالانتقام"], ["By leaving", "Mit Fortgehen", "بالرحيل"]], 0),
    ],
  },
  {
    id: "yusuf-egypt", review: "needs_review", arabic: "يوسف في مصر", verses: vv("12:23-24", "12:36-41"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yusuf 2: temptation and prison", "Yusuf 2: Versuchung und Gefängnis", "يوسف 2: المراودة والسجن"),
    text: L3(
      "Sold in Egypt, Yusuf grows up in the house of the 'Aziz. The 'Aziz's wife tries to seduce him; he refuses and seeks refuge in God (12:23). Though innocent, he is imprisoned and says he prefers prison to wrongdoing.\nIn prison he interprets the dreams of two fellow inmates, but first speaks to them of the one God, to whom alone judgement belongs (12:40).",
      "In Ägypten verkauft, wächst Yusuf im Haus des 'Aziz auf. Dessen Frau versucht ihn zu verführen; er weigert sich und sucht Zuflucht bei Gott (12:23). Obwohl unschuldig, kommt er ins Gefängnis und sagt, das Gefängnis sei ihm lieber als Unrecht.\nIm Gefängnis deutet er die Träume zweier Mitgefangener, spricht aber zuerst vom einen Gott, dem allein das Urteil zusteht (12:40).",
      "بيع يوسف في مصر ونشأ في بيت العزيز، فحاولت امرأة العزيز إغواءه فأبى واستعاذ بالله (12:23). وسُجن وهو بريء، وآثر السجن على المعصية (12:33).\nوفي السجن عبّر رؤيا صاحبيه بعد أن دعاهما إلى توحيد الله الذي له وحده الحكم (12:40).",
    ),
    quiz: [
      q(["How did Yusuf respond when he was tempted?", "Wie reagierte Yusuf, als er versucht wurde?", "كيف تصرّف يوسف حين حاولت إغواءه؟"],
        [["He refused and sought refuge in God", "Er weigerte sich und suchte Zuflucht bei Gott", "أبى واستعاذ بالله"], ["He agreed to meet later", "Er stimmte einem späteren Treffen zu", "وافق على لقاء لاحق"], ["He asked his master for advice", "Er fragte seinen Herrn um Rat", "استشار سيّده"]], 0),
      q(["What did Yusuf speak about before interpreting the dreams?", "Worüber sprach Yusuf, bevor er die Träume deutete?", "عمّ تحدّث يوسف قبل تعبير الرؤيا؟"],
        [["About Egypt's kings", "Über die Könige Ägyptens", "عن ملوك مصر"], ["About the one God", "Über den einen Gott", "عن التوحيد"], ["About his brothers", "Über seine Brüder", "عن إخوته"]], 1),
    ],
  },
  {
    id: "yusuf-reunion", review: "needs_review", arabic: "العفو", verses: vv("12:90-93", "12:99-100"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yusuf 3: forgiveness and reunion", "Yusuf 3: Vergebung und Wiedersehen", "يوسف 3: العفو واللقاء"),
    text: L3(
      "Yusuf interprets the king's dream of seven fat and seven lean cows, is cleared and put in charge of the storehouses. In the famine his brothers come to buy grain. When he reveals himself they fear the worst, but he forgives them at once and does not reproach them (12:92).\nHis shirt restores Yaqub's sight, the family comes to Egypt, and the childhood dream is fulfilled.",
      "Yusuf deutet den Traum des Königs von sieben fetten und sieben mageren Kühen, wird rehabilitiert und über die Vorratskammern gesetzt. In der Hungersnot kommen seine Brüder, um Getreide zu kaufen. Als er sich zu erkennen gibt, fürchten sie das Schlimmste, doch er vergibt ihnen sofort und macht ihnen keinen Vorwurf (12:92).\nSein Hemd gibt Yaqub das Augenlicht zurück, die Familie kommt nach Ägypten, und der Kindheitstraum erfüllt sich.",
      "عبّر يوسف رؤيا الملك في السبع البقرات السمان والعجاف، فظهرت براءته وتولّى خزائن البلاد. وفي المجاعة جاءه إخوته يشترون الطعام، فلما عرّفهم بنفسه خافوا، فعفا عنهم في الحال ولم يعاتبهم (12:92).\nوعاد إلى يعقوب بصره بقميص يوسف، وجاءت الأسرة إلى مصر وتحققت الرؤيا.",
    ),
    quiz: [
      q(["How did Yusuf treat his brothers?", "Wie behandelte Yusuf seine Brüder?", "كيف عامل يوسف إخوته؟"],
        [["He forgave them without reproach", "Er vergab ihnen ohne Vorwurf", "عفا عنهم دون عتاب"], ["He sent them out of Egypt", "Er schickte sie aus Ägypten fort", "أخرجهم من مصر"], ["He made them pay double", "Er ließ sie doppelt zahlen", "ألزمهم بدفع الضعف"]], 0, ["Surah Yusuf 12:92.", "Sure Yusuf 12:92.", "سورة يوسف 12:92."]),
      q(["What restored Yaqub's sight?", "Was gab Yaqub das Augenlicht zurück?", "ما الذي ردّ إلى يعقوب بصره؟"],
        [["Zamzam water", "Zamzam-Wasser", "ماء زمزم"], ["Yusuf's shirt", "Yusufs Hemd", "قميص يوسف"], ["A staff", "Ein Stab", "عصا"]], 1),
    ],
  },
  {
    id: "musa-birth", review: "needs_review", arabic: "موسى", verses: vv("28:7-13"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 1: the river and the palace", "Musa 1: der Fluss und der Palast", "موسى 1: اليمّ والقصر"),
    text: L3(
      "Pharaoh oppresses the Children of Israel. God inspires Musa's mother to place the baby in the river and promises to return him. Pharaoh's wife takes him in and asks Pharaoh to spare the child, a joy for them both (28:9). Musa refuses every wet nurse until his sister leads them to his own mother.\nThe Quran honours Pharaoh's wife, named Asiya in tradition, as an example of faith (66:11).",
      "Pharao unterdrückt die Kinder Israels. Gott gibt Musas Mutter ein, das Kind dem Fluss anzuvertrauen, und verspricht, es zurückzubringen. Pharaos Frau nimmt ihn auf und bittet Pharao, das Kind zu verschonen, eine Freude für sie beide (28:9). Musa nimmt keine Amme an, bis seine Schwester sie zu seiner eigenen Mutter führt.\nDer Koran ehrt Pharaos Frau, in der Überlieferung Asiya genannt, als Vorbild des Glaubens (66:11).",
      "كان فرعون يضطهد بني إسرائيل، فألهم الله أم موسى أن تضعه في النهر ووعدها بردّه. فأخذته امرأة فرعون وطلبت من فرعون أن يُبقي عليه ليكون فرحةً لهما (28:9)، ولم يقبل موسى أي مرضعة حتى دلّتهم أخته على أمه.\nويكرّم القرآن امرأة فرعون، آسية في الرواية، قدوةً في الإيمان (66:11).",
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
    id: "musa-call", review: "needs_review", arabic: "النداء", verses: vv("28:22-25", "20:9-14"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 2: Madyan and the call", "Musa 2: Madyan und die Berufung", "موسى 2: مدين والنداء"),
    text: L3(
      "After killing an Egyptian unintentionally, Musa flees to Madyan. At a well he waters the flock of two women and turns to God in prayer, admitting his need of any good God sends him (28:24). He marries one of them and works for her father for years.\nOn the way back he sees a fire. In the sacred valley of Tuwa God calls him, tells him that there is no god but Him and commands him to worship Him alone and to pray in remembrance of Him (20:14).",
      "Nachdem er unbeabsichtigt einen Ägypter getötet hat, flieht Musa nach Madyan. An einem Brunnen tränkt er die Herde zweier Frauen und wendet sich im Gebet an Gott, bedürftig nach jedem Guten, das Gott ihm schickt (28:24). Er heiratet eine von ihnen und arbeitet jahrelang für ihren Vater.\nAuf dem Rückweg sieht er ein Feuer. Im heiligen Tal Tuwa ruft Gott ihn an, sagt ihm, dass es keinen Gott außer Ihm gibt, und gebietet ihm, Ihm allein zu dienen und zu Seinem Gedenken zu beten (20:14).",
      "بعد أن قتل موسى مصريًّا خطأً فرّ إلى مدين، فسقى للمرأتين ثم توجّه إلى الله بالدعاء معترفًا بحاجته إلى كل خير يسوقه إليه (28:24)، وتزوج إحداهما وعمل عند أبيها سنين.\nوفي طريق العودة رأى نارًا، فناداه الله في الوادي المقدس طوى، وأخبره أنه لا إله غيره، وأمره بعبادته وحده وبالصلاة ذكرًا له (20:14).",
    ),
    note: L3("Many classical commentators identified the father in Madyan with the prophet Shu'ayb; others disagreed. The Bible names him Jethro (Reuel).", "Viele klassische Kommentatoren sahen im Vater in Madyan den Propheten Schu'aib, andere widersprachen. Die Bibel nennt ihn Jitro (Reguel).", "عدّ كثير من المفسرين الأب في مدين النبي شعيبًا وخالفهم آخرون، وتسمّيه التوراة يثرون (رعوئيل)."),
    quiz: [
      q(["Where did Musa hear God's call?", "Wo hörte Musa den Ruf Gottes?", "أين نودي موسى؟"],
        [["In the valley of Tuwa", "Im Tal Tuwa", "بالوادي المقدس طوى"], ["In Egypt's palace", "Im Palast Ägyptens", "في قصر فرعون"], ["At sea", "Auf dem Meer", "في البحر"]], 0),
      q(["What did Musa pray at the well in Madyan?", "Was betete Musa am Brunnen in Madyan?", "بماذا دعا موسى عند ماء مدين؟"],
        [["For victory", "Um Sieg", "بالنصر"], ["That he is in need of any good God sends", "Dass er jedes Gute braucht, das Gott sendet", "أنه محتاج إلى كل خير يسوقه الله إليه"], ["For wealth", "Um Reichtum", "بالمال"]], 1),
    ],
  },
  {
    id: "musa-exodus", review: "needs_review", arabic: "فرعون", verses: vv("20:24-36", "26:61-67"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 3: before Pharaoh and the sea", "Musa 3: vor Pharao und am Meer", "موسى 3: أمام فرعون والبحر"),
    text: L3(
      "Sent to Pharaoh, Musa asks God to open his heart and ease his task, and asks for his brother Harun as a helper (20:25-32). Both are told to speak to Pharaoh gently (20:44). The magicians, once they see the signs, believe.\nPharaoh pursues the Israelites to the sea. They fear they will be caught; Musa answers that his Lord is with him and will guide him (26:61-62). The sea parts and Pharaoh's army drowns.",
      "Zu Pharao gesandt, bittet Musa Gott, ihm das Herz zu öffnen und die Aufgabe zu erleichtern, und erbittet seinen Bruder Harun als Helfer (20:25-32). Beide sollen mild zu Pharao sprechen (20:44). Die Zauberer glauben, als sie die Zeichen sehen.\nPharao verfolgt die Israeliten bis ans Meer. Sie fürchten, eingeholt zu werden; Musa antwortet, sein Herr sei mit ihm und werde ihn leiten (26:61-62). Das Meer teilt sich, und Pharaos Heer ertrinkt.",
      "أُرسل موسى إلى فرعون فدعا الله أن يوسّع صدره ويسهّل مهمّته، وسأل أن يكون أخوه هارون معينًا له (20:25-32)، وأُمرا أن يخاطبا فرعون برفق (20:44)، وآمن السحرة لما رأوا الآيات.\nوتبعهم فرعون إلى البحر، فخاف أصحاب موسى أن يُدرَكوا، فطمأنهم بأن ربه معه وسيهديه (26:61-62)، فانفلق البحر وأُغرق جند فرعون.",
    ),
    quiz: [
      q(["Whom did Musa ask for as a helper?", "Wen erbat Musa als Helfer?", "من سأل موسى أن يكون وزيرًا له؟"],
        [["Yusha'", "Yuscha'", "يوشع"], ["His brother Harun", "Seinen Bruder Harun", "أخاه هارون"], ["The magicians", "Die Zauberer", "السحرة"]], 1),
      q(["How was Musa told to speak to Pharaoh?", "Wie sollte Musa zu Pharao sprechen?", "كيف أُمر موسى أن يخاطب فرعون؟"],
        [["Gently", "Mild und freundlich", "برفق ولين"], ["With threats", "Mit Drohungen", "بالتهديد"], ["Not at all", "Gar nicht", "لا يكلّمه"]], 0),
    ],
  },
  {
    id: "musa-sinai", review: "needs_review", arabic: "الطور والخضر", verses: vv("7:143-145", "18:65-70"), tags: ["quran", "tafsir", "bible"],
    title: L3("Musa 4: Sinai and al-Khidr", "Musa 4: Sinai und al-Chidr", "موسى 4: الطور والخضر"),
    text: L3(
      "At the mountain Musa asks to see God; the mountain crumbles and he falls unconscious. He receives the Tablets, which contain admonition and detailed guidance (7:145). In his absence the people worship the calf.\nSurah al-Kahf tells of Musa travelling with a servant of God, known as al-Khidr, who does three puzzling things. The lesson: human knowledge is limited, and patience is needed with what one cannot yet understand.",
      "Am Berg bittet Musa darum, Gott zu sehen; der Berg zerfällt, und er sinkt bewusstlos nieder. Er erhält die Tafeln mit Ermahnung und ausführlicher Wegweisung (7:145). In seiner Abwesenheit verehrt das Volk das Kalb.\nSure al-Kahf erzählt, wie Musa mit einem Diener Gottes reist, bekannt als al-Chidr, der drei rätselhafte Dinge tut. Die Lehre: Menschliches Wissen ist begrenzt, und es braucht Geduld mit dem, was man noch nicht versteht.",
      "سأل موسى ربه الرؤية عند الجبل فتصدّع الجبل وسقط موسى مغشيًّا عليه، وتلقّى الألواح وفيها الموعظة والبيان المفصّل (7:145)، وعبد قومه العجل في غيبته.\nوتروي سورة الكهف رحلة موسى مع عبدٍ من عباد الله يُعرف بالخضر فعل ثلاثة أمور محيّرة، والعبرة أن علم الإنسان محدود وأن الصبر لازم أمام ما لا يحيط الإنسان بحكمته.",
    ),
    quiz: [
      q(["What happened when Musa asked to see God?", "Was geschah, als Musa darum bat, Gott zu sehen?", "ماذا حدث حين سأل موسى الرؤية؟"],
        [["The mountain crumbled", "Der Berg zerfiel", "تصدّع الجبل"], ["The sea parted", "Das Meer teilte sich", "انفلق البحر"], ["It rained", "Es regnete", "نزل المطر"]], 0),
      q(["What is the main lesson of Musa and al-Khidr?", "Was ist die Hauptlehre von Musa und al-Chidr?", "ما العبرة من قصة موسى والخضر؟"],
        [["Travel is dangerous", "Reisen ist gefährlich", "السفر خطر"], ["Human knowledge is limited; be patient", "Menschliches Wissen ist begrenzt; Geduld", "علم الإنسان محدود فاصبر"], ["Ships must be sold", "Schiffe müssen verkauft werden", "تُباع السفن"]], 1),
    ],
  },
  {
    id: "dawud-sulayman", review: "needs_review", arabic: "داود وسليمان", verses: vv("34:10-13", "27:16-19"), tags: ["quran", "tafsir", "bible"],
    title: L3("Dawud and Sulayman", "Dawud und Sulaiman", "داود وسليمان"),
    text: L3(
      "Dawud receives the Zabur (4:163), the mountains and birds praise God with him, and iron is made soft for him to make armour. Sulayman inherits from him and is taught the speech of birds.\nWhen an ant warns its colony of Sulayman's army, he smiles and asks God to help him be grateful for His favours (27:19). The Quran presents both as just, grateful kings, not as rulers seeking power.",
      "Dawud erhält den Zabur (4:163), Berge und Vögel lobpreisen Gott mit ihm, und das Eisen wird für ihn weich, um Panzer zu fertigen. Sulaiman beerbt ihn und lernt die Sprache der Vögel.\nAls eine Ameise ihr Volk vor Sulaimans Heer warnt, lächelt er und bittet Gott, ihm zu helfen, für Seine Gaben dankbar zu sein (27:19). Der Koran zeigt beide als gerechte, dankbare Könige, nicht als Machtmenschen.",
      "أوتي داود الزبور (4:163)، وسبّحت معه الجبال والطير، وليّن الله له الحديد يصنع منه الدروع. وورثه سليمان وتعلّم لغة الطير.\nولما حذّرت النملة قومها من جند سليمان تبسّم ودعا الله أن يعينه على شكر نعمه (27:19). ويقدّمهما القرآن ملكين عادلين شاكرين.",
    ),
    quiz: [
      q(["Which book was given to Dawud?", "Welches Buch erhielt Dawud?", "أي كتاب أوتي داود؟"],
        [["Tawrat", "Tora", "التوراة"], ["Zabur", "Zabur (Psalmen)", "الزبور"], ["Injil", "Indschil", "الإنجيل"]], 1),
      q(["What did Sulayman do when he heard the ant?", "Was tat Sulaiman, als er die Ameise hörte?", "ماذا فعل سليمان حين سمع النملة؟"],
        [["He smiled and thanked God", "Er lächelte und dankte Gott", "تبسّم وشكر الله"], ["He ordered an attack", "Er befahl einen Angriff", "أمر بالهجوم"], ["He ignored it", "Er beachtete sie nicht", "لم يلتفت"]], 0),
    ],
  },
  {
    id: "yunus", review: "needs_review", arabic: "ذو النون", verses: vv("21:87-88", "37:139-148"), tags: ["quran", "tafsir", "bible"],
    title: L3("Yunus in the whale", "Yunus im Wal", "يونس في بطن الحوت"),
    text: L3(
      "Yunus leaves his people in anger before God permits it, boards a ship and is swallowed by a large fish. In the darkness he calls on God, affirming that there is no god but Him, glorifying Him and admitting his own wrong (21:87).\nHe is cast ashore, a gourd plant shades him, and he returns to a people of more than a hundred thousand who believe. Uniquely, the Quran says his whole people were spared (10:98).",
      "Yunus verlässt sein Volk im Zorn, bevor Gott es erlaubt, besteigt ein Schiff und wird von einem großen Fisch verschluckt. In der Dunkelheit ruft er Gott an: Er bezeugt, dass es keinen Gott außer Ihm gibt, preist Ihn und bekennt sein eigenes Unrecht (21:87).\nEr wird an Land geworfen, eine Kürbispflanze spendet ihm Schatten, und er kehrt zu einem Volk von über hunderttausend zurück, das glaubt. Einzigartig: Laut Koran wurde sein ganzes Volk verschont (10:98).",
      "غادر يونس قومه غاضبًا قبل أن يأذن الله له، فركب السفينة فابتلعه حوت كبير، فدعا الله في الظلمات موحّدًا له ومسبّحًا ومعترفًا بخطئه (21:87).\nثم أُلقي على الشاطئ وأظلّته شجرة من القرع، وأُرسل إلى أكثر من مئة ألف فآمنوا، وقومه وحدهم من نفعهم إيمانهم فكُشف عنهم العذاب (10:98).",
    ),
    quiz: [
      q(["What did Yunus do in the darkness?", "Was tat Yunus in der Dunkelheit?", "ماذا فعل يونس في الظلمات؟"],
        [["He affirmed God's oneness and admitted his wrong", "Er bezeugte Gottes Einheit und bekannte sein Unrecht", "وحّد الله واعترف بخطئه"], ["He asked the sailors to save the ship", "Er bat die Seeleute, das Schiff zu retten", "طلب من البحّارة إنقاذ السفينة"], ["He asked for a storm", "Er bat um einen Sturm", "طلب عاصفة"]], 0, ["Surah al-Anbiya 21:87.", "Sure al-Anbiya 21:87.", "سورة الأنبياء 21:87."]),
      q(["What happened to his people?", "Was geschah mit seinem Volk?", "ماذا حدث لقومه؟"],
        [["They were destroyed", "Sie wurden vernichtet", "أُهلكوا"], ["They believed and were spared", "Sie glaubten und wurden verschont", "آمنوا فكُشف عنهم العذاب"], ["They emigrated", "Sie wanderten aus", "هاجروا"]], 1),
    ],
  },
  {
    id: "ayyub", review: "needs_review", arabic: "أيوب", verses: vv("21:83-84", "38:41-44"), tags: ["quran", "tafsir", "bible"],
    title: L3("Ayyub and patience", "Ayyub und die Geduld", "أيوب والصبر"),
    text: L3(
      "Ayyub loses health, wealth and family. He does not complain against God but calls on Him, naming the harm that has touched him and appealing to Him as the Most Merciful (21:83). He is told to strike the ground with his foot: a spring appears to wash and drink.\nGod restores him and praises him as patient and an excellent servant (38:44).",
      "Ayyub verliert Gesundheit, Besitz und Familie. Er klagt nicht gegen Gott, sondern ruft Ihn an, nennt den Schaden, der ihn getroffen hat, und wendet sich an Ihn als den Barmherzigsten (21:83). Er soll mit dem Fuß auf den Boden stampfen: Eine Quelle tritt hervor zum Waschen und Trinken.\nGott stellt ihn wieder her und lobt ihn als geduldig und als vortrefflichen Diener (38:44).",
      "ابتُلي أيوب في بدنه وماله وأهله فلم يشكُ ربه إلى أحد، بل دعاه وذكر ما أصابه متوسّلًا برحمته (21:83)، فأُمر أن يضرب الأرض برجله فنبعت عين يغتسل منها ويشرب (38:42).\nفكشف الله ما به وأثنى عليه بالصبر وحسن العبودية وكثرة الرجوع إليه (38:44).",
    ),
    quiz: [
      q(["How did Ayyub call upon God?", "Wie rief Ayyub Gott an?", "كيف دعا أيوب ربه؟"],
        [["He named his hardship and appealed to God's mercy", "Er nannte seine Not und rief Gottes Barmherzigkeit an", "ذكر ضرّه وتوسّل برحمة الله"], ["He complained that it was unfair", "Er klagte über Ungerechtigkeit", "اشتكى من الظلم"], ["He asked for a kingdom", "Er bat um ein Königreich", "طلب ملكًا"]], 0, ["Surah al-Anbiya 21:83.", "Sure al-Anbiya 21:83.", "سورة الأنبياء 21:83."]),
      q(["How does God describe Ayyub?", "Wie beschreibt Gott Ayyub?", "بماذا وصف الله أيوب؟"],
        [["Patient, an excellent servant", "Geduldig, ein vortrefflicher Diener", "صابرًا حسن العبودية"], ["Rich", "Reich", "غنيًّا"], ["A warrior", "Ein Krieger", "محاربًا"]], 0),
    ],
  },
  {
    id: "zakariya-yahya", review: "needs_review", arabic: "زكريا ويحيى", verses: vv("19:2-15"), tags: ["quran", "tafsir", "bible"],
    title: L3("Zakariya and Yahya", "Zakariya und Yahya", "زكريا ويحيى"),
    text: L3(
      "Surah Maryam opens with Zakariya's quiet prayer in old age: his body has grown weak, and he asks God for an heir (19:4-6). He is given the glad tidings of Yahya, a name no one had borne before (19:7), and as a sign he does not speak to people for three nights.\nYahya is given wisdom as a child and is kind to his parents; God grants him peace on the day of his birth, of his death and of his resurrection (19:15).",
      "Sure Maryam beginnt mit Zakariyas leisem Gebet im Alter: Sein Körper ist schwach geworden, und er bittet Gott um einen Erben (19:4-6). Er erhält die frohe Botschaft von Yahya, einem Namen, den zuvor niemand trug (19:7), und als Zeichen spricht er drei Nächte nicht zu den Menschen.\nYahya erhält schon als Kind Weisheit und ist gütig zu seinen Eltern; Gott schenkt ihm Frieden am Tag seiner Geburt, seines Todes und seiner Auferweckung (19:15).",
      "تفتتح سورة مريم بدعاء زكريا الخفي في كِبَره: يشكو إلى الله ضعف جسده ويسأله وارثًا (19:4-6)، فبُشّر بيحيى، وهو اسم لم يُسمَّ به أحد قبله (19:7)، وكانت علامته ألّا يكلّم الناس ثلاث ليالٍ وهو سليم (19:10).\nوأوتي يحيى الحكمة صغيرًا وكان بارًّا بوالديه، وكتب الله له الأمان يوم مولده ويوم وفاته ويوم بعثه (19:15).",
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
    id: "maryam-isa", review: "needs_review", arabic: "مريم وعيسى", verses: vv("19:16-33", "3:45"), tags: ["quran", "tafsir", "bible"],
    title: L3("Maryam and Isa", "Maryam und Isa", "مريم وعيسى"),
    text: L3(
      "Maryam is the only woman named in the Quran, and a surah carries her name. An angel announces a pure son; she asks how, as no man has touched her, and is told that this is easy for God (19:21). Under a palm tree she gives birth; the infant Isa speaks in the cradle, declaring that he is God's servant, given the Scripture and made a prophet (19:30).\nThe Quran calls Isa the Messiah, a word from God and a spirit from Him (3:45; 4:171), and honours him among the greatest messengers.",
      "Maryam ist die einzige namentlich genannte Frau im Koran, und eine Sure trägt ihren Namen. Ein Engel verkündet ihr einen reinen Sohn; sie fragt, wie das sein könne, da sie kein Mann berührt habe, und hört, dass dies für Gott ein Leichtes ist (19:21). Unter einer Palme bringt sie ihn zur Welt; das Kind Isa spricht in der Wiege und erklärt, dass er Gottes Diener ist, dem die Schrift gegeben und der zum Propheten gemacht wurde (19:30).\nDer Koran nennt Isa den Messias, ein Wort von Gott und einen Geist von Ihm (3:45; 4:171), und ehrt ihn unter den größten Gesandten.",
      "مريم هي المرأة الوحيدة المسمّاة في القرآن، وسُمّيت سورة باسمها. بشّرها الملك بابنٍ طاهر، فتعجّبت كيف يكون لها ولد ولم يقربها رجل، فأُخبرت أن ذلك يسير على الله (19:20-21). ووضعته عند جذع نخلة، فتكلّم عيسى في المهد معلنًا أنه عبدٌ لله أكرمه بالكتاب والنبوة (19:30).\nويسمّي القرآن عيسى المسيحَ وكلمةً من الله وروحًا منه (3:45؛ 4:171)، ويجعله من أولي العزم من الرسل.",
    ),
    note: L3("Muslims and Christians share the virgin birth and the title Messiah; they differ on Isa's divinity and on the crucifixion (4:157). This lesson states the Quranic view without comparing or ranking.", "Muslime und Christen teilen die Jungfrauengeburt und den Titel Messias; sie unterscheiden sich in der Frage der Göttlichkeit Isas und der Kreuzigung (4:157). Diese Lektion gibt die koranische Sicht wieder, ohne zu vergleichen oder zu werten.", "يتفق المسلمون والمسيحيون على الولادة العذراوية ولقب المسيح، ويختلفون في ألوهية عيسى والصلب (4:157). يعرض هذا الدرس الرؤية القرآنية دون مقارنة أو مفاضلة."),
    quiz: [
      q(["What did the infant Isa declare in the cradle?", "Was erklärte das Kind Isa in der Wiege?", "بماذا أعلن عيسى في المهد؟"],
        [["That he is God's servant and a prophet", "Dass er Gottes Diener und ein Prophet ist", "أنه عبد لله ونبيّ"], ["That he would become a king", "Dass er ein König werde", "أنه سيصبح ملكًا"], ["That he was hungry", "Dass er Hunger habe", "أنه جائع"]], 0, ["Surah Maryam 19:30.", "Sure Maryam 19:30.", "سورة مريم 19:30."]),
      q(["Which woman is named in the Quran?", "Welche Frau wird im Koran namentlich genannt?", "أي امرأة سُمّيت في القرآن؟"],
        [["Hajar", "Hadschar", "هاجر"], ["Asiya", "Asiya", "آسية"], ["Maryam", "Maryam", "مريم"]], 2),
    ],
  },
  {
    id: "books", review: "needs_review", arabic: "الكتب", verses: vv("87:18-19", "4:163", "5:44", "5:46", "5:48"), tags: ["quran", "tafsir", "bible"],
    title: L3("The revealed Books", "Die offenbarten Bücher", "الكتب المنزلة"),
    text: L3(
      "Belief in the revealed books is part of Muslim faith. The Quran names the Suhuf (scrolls) of Ibrahim and Musa (87:19), the Tawrat given to Musa, the Zabur to Dawud and the Injil to Isa. It describes the Tawrat as a source of guidance and light (5:44), and the Injil likewise (5:46).\nThe Quran calls itself confirming what came before and a muhaymin, a guardian over it (5:48). It adds that God gave each community its own law and way, and calls on all to compete in doing good (5:48).",
      "Der Glaube an die offenbarten Bücher gehört zum muslimischen Glauben. Der Koran nennt die Suhuf (Blätter) Ibrahims und Musas (87:19), die Tora, die Musa gegeben wurde, den Zabur Dawuds und das Indschil Isas. Er beschreibt die Tora als Quelle von Rechtleitung und Licht (5:44), ebenso das Indschil (5:46).\nDer Koran nennt sich bestätigend für das Vorherige und einen Muhaymin, einen Wächter darüber (5:48). Weiter heißt es dort, Gott habe jeder Gemeinschaft ein eigenes Gesetz und einen eigenen Weg gegeben, und alle sollen im Guten wetteifern (5:48).",
      "الإيمان بالكتب من أركان الإيمان. يذكر القرآن صحف إبراهيم وموسى (87:19) والتوراة التي أوتيها موسى والزبور الذي أوتيه داود والإنجيل الذي أوتيه عيسى، ويصف التوراة بأنها مصدر هداية ونور (5:44) وكذلك الإنجيل (5:46).\nويصف القرآن نفسه بأنه مصدّق لما سبقه وشاهد رقيب عليه، ويذكر أن الله جعل لكل أمة شريعة وطريقًا ودعا الجميع إلى التسابق في الخير (5:48).",
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
    id: "ahl-al-kitab", review: "needs_review", arabic: "أهل الكتاب", verses: vv("3:64", "29:46", "2:62", "5:82-83"), tags: ["quran", "tafsir", "sunni", "shia"],
    title: L3("The People of the Book in the Quran", "Die Leute der Schrift im Koran", "أهل الكتاب في القرآن"),
    text: L3(
      "\"People of the Book\" (ahl al-kitab) mainly refers to Jews and Christians. The Quran invites them to a shared principle, the worship of God alone (3:64), and tells Muslims to discuss with them only in the best manner (29:46).\nIt praises some among them for faith and humility (5:82-83) and criticises particular attitudes in other passages. Islamic law allowed marriage with Jewish and Christian women and eating their food (5:5).",
      "„Leute der Schrift“ (ahl al-kitab) meint vor allem Juden und Christen. Der Koran lädt sie zu einem gemeinsamen Grundsatz ein, der Anbetung Gottes allein (3:64), und sagt den Muslimen, mit ihnen nur auf die beste Weise zu diskutieren (29:46).\nEr lobt einige unter ihnen für Glauben und Demut (5:82-83) und kritisiert an anderen Stellen bestimmte Haltungen. Das islamische Recht erlaubte die Ehe mit jüdischen und christlichen Frauen und das Essen ihrer Speisen (5:5).",
      "يُقصد بأهل الكتاب أساسًا اليهود والنصارى. يدعوهم القرآن إلى أصل مشترك هو عبادة الله وحده (3:64)، ويأمر المسلمين أن يحاوروهم بأحسن الطرق (29:46).\nويثني على بعضهم لإيمانهم وتواضعهم (5:82-83) وينتقد مواقف معيّنة في مواضع أخرى. وأباح الفقه نكاح الكتابيات وطعام أهل الكتاب (5:5).",
    ),
    note: L3("Scholars differ on how to read 2:62 (salvation of earlier believers) and on whether Zoroastrians count as People of the Book. Shia jurisprudence has held a range of positions on marriage with Jewish and Christian women.", "Gelehrte lesen 2:62 (Heil früherer Gläubiger) unterschiedlich und sind uneins, ob Zoroastrier zu den Leuten der Schrift zählen. Die schiitische Rechtslehre vertrat verschiedene Positionen zur Ehe mit jüdischen und christlichen Frauen.", "يختلف العلماء في فهم 2:62 (نجاة المؤمنين السابقين) وفي عدّ المجوس من أهل الكتاب، وتعددت أقوال الفقه الشيعي في نكاح الكتابيات."),
    quiz: [
      q(["What does 3:64 invite the People of the Book to?", "Wozu lädt 3:64 die Leute der Schrift ein?", "إلامَ تدعو الآية 3:64 أهل الكتاب؟"],
        [["A shared principle: worshipping God alone", "Einen gemeinsamen Grundsatz: Gott allein anzubeten", "أصل مشترك: عبادة الله وحده"], ["A trade agreement", "Ein Handelsabkommen", "اتفاق تجاري"], ["A contest", "Einen Wettstreit", "مبارزة"]], 0),
      q(["How should Muslims argue with them according to 29:46?", "Wie sollen Muslime laut 29:46 mit ihnen streiten?", "كيف يجادلهم المسلمون بحسب 29:46؟"],
        [["Not at all", "Gar nicht", "لا يجادلونهم"], ["Only in the best manner", "Nur auf die beste Weise", "بأحسن الطرق"], ["Loudly", "Laut", "بصوت عالٍ"]], 1),
    ],
  },
  {
    id: "medina-charter", review: "needs_review", arabic: "صحيفة المدينة", verses: vv("60:8", "2:256", "22:40"), tags: ["history", "tafsir"],
    title: L3("Interfaith history 1: Medina", "Interreligiöse Geschichte 1: Medina", "تاريخ التعايش 1: المدينة"),
    text: L3(
      "After the Hijra in 622 the Prophet agreed a written compact in Medina, known as the Constitution or Charter of Medina (Sahifat al-Madina). It names Muslim and Jewish tribes as one community (umma) for defence, each keeping its own religion.\nThe Quran states that there is no compulsion in religion (2:256), and permits kindness and justice towards those who do not fight Muslims (60:8). The relationship with some Jewish tribes later broke down in conflict; historians weigh the sources differently.",
      "Nach der Hidschra 622 schloss der Prophet in Medina einen schriftlichen Vertrag, bekannt als Verfassung oder Charta von Medina (Sahifat al-Madina). Sie nennt muslimische und jüdische Stämme eine Gemeinschaft (Umma) zur Verteidigung, wobei jede ihre Religion behält.\nDer Koran stellt fest, dass es keinen Zwang in der Religion gibt (2:256), und erlaubt Güte und Gerechtigkeit gegenüber denen, die Muslime nicht bekämpfen (60:8). Das Verhältnis zu einigen jüdischen Stämmen zerbrach später im Konflikt; Historiker gewichten die Quellen unterschiedlich.",
      "بعد الهجرة سنة 622 كتب النبي ﷺ في المدينة عهدًا يُعرف بصحيفة المدينة، جعل فيه قبائل المسلمين واليهود أمةً واحدة في الدفاع مع احتفاظ كلٍّ بدينه.\nويقرّر القرآن أنه لا يُكره أحد على الدين (2:256)، ويبيح البرّ والقسط لمن لم يقاتل المسلمين (60:8). ثم انتهت العلاقة مع بعض القبائل اليهودية إلى نزاع، ويختلف المؤرخون في قراءة المصادر.",
    ),
    quiz: [
      q(["What did the Charter of Medina establish?", "Was begründete die Charta von Medina?", "ماذا أسّست صحيفة المدينة؟"],
        [["One community for defence, each keeping its religion", "Eine Gemeinschaft zur Verteidigung, jede mit ihrer Religion", "أمة واحدة في الدفاع مع حفظ دين كلٍّ"], ["A single religion", "Eine einzige Religion", "دينًا واحدًا"], ["A trade tax", "Eine Handelssteuer", "ضريبة تجارية"]], 0),
      q(["Which verse says there is no compulsion in religion?", "Welcher Vers sagt, dass es keinen Zwang in der Religion gibt?", "أي آية تنفي الإكراه في الدين؟"],
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
    id: "abu-dhabi-today", review: "needs_review", arabic: "الأخوة الإنسانية", verses: vv("49:13", "5:48"), tags: ["today", "history"],
    title: L3("Today: Human Fraternity and the Abrahamic Family House", "Heute: Menschliche Geschwisterlichkeit und Abrahamic Family House", "اليوم: الأخوة الإنسانية وبيت العائلة الإبراهيمية"),
    text: L3(
      "On 4 February 2019 Pope Francis and the Grand Imam of al-Azhar, Ahmad al-Tayyeb, signed the Document on Human Fraternity for World Peace and Living Together in Abu Dhabi. The UN later declared 4 February the International Day of Human Fraternity.\nIn 2023 the Abrahamic Family House opened on Saadiyat Island in Abu Dhabi: a mosque, a church and a synagogue of equal size on one site, with a shared forum. The Quran explains that God made people into nations and tribes so that they may come to know one another (49:13).",
      "Am 4. Februar 2019 unterzeichneten Papst Franziskus und der Großimam von al-Azhar, Ahmad al-Tayyeb, in Abu Dhabi das Dokument über die Brüderlichkeit aller Menschen für ein friedliches Zusammenleben in der Welt. Die UN erklärten den 4. Februar später zum Internationalen Tag der menschlichen Geschwisterlichkeit.\n2023 wurde auf der Insel Saadiyat in Abu Dhabi das Abrahamic Family House eröffnet: eine Moschee, eine Kirche und eine Synagoge gleicher Größe auf einem Gelände, mit gemeinsamem Forum. Der Koran erklärt, dass Gott die Menschen zu Völkern und Stämmen gemacht hat, damit sie einander kennenlernen (49:13).",
      "في 4 فبراير 2019 وقّع البابا فرنسيس وشيخ الأزهر أحمد الطيب في أبوظبي «وثيقة الأخوة الإنسانية من أجل السلام العالمي والعيش المشترك»، ثم أعلنت الأمم المتحدة 4 فبراير يومًا دوليًا للأخوة الإنسانية.\nوفي 2023 افتُتح بيت العائلة الإبراهيمية في جزيرة السعديات بأبوظبي: مسجد وكنيسة وكنيس بحجم متساوٍ في موقع واحد مع منتدى مشترك. ويبيّن القرآن أن الله جعل الناس شعوبًا وقبائل ليتعارفوا (49:13).",
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
