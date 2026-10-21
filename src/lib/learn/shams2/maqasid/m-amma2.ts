// mirrors mobile/src/features/shams2/maqasid/m-amma2.ts (copied for the website; keep in step with the app)
import type { Maqasid } from "./types";
import { DRAFT } from "../sources";

// Maqāṣid for surahs 96–114 (second half of Juzʾ ʿAmma). Own wording, verse numbers only, draft until reviewed.
export const M_AMMA2: Maqasid[] = [
  // 96 al-ʿAlaq (19)
  {
    s: 96,
    theme: {
      de: "Wissen beginnt mit dem Namen des Herrn, der erschafft und lehrt; wer sich selbstgenügsam wähnt, überschreitet die Grenze, wer sich niederwirft, kommt Allah nahe.",
      en: "Knowledge begins in the name of the Lord who creates and teaches; whoever deems himself self-sufficient transgresses, whoever prostrates draws near to Allah.",
      ar: "العلم يبدأ باسم الرب الخالق المعلِّم، ومن رأى نفسه مستغنيًا طغى، ومن سجد اقترب من الله.",
    },
    context: {
      de: "Mekkanisch; die Verse 1–5 gelten nach der Mehrheit als die erste Offenbarung, der Rest kam später, als die Gegnerschaft gegen das Gebet begann.",
      en: "Meccan; verses 1–5 are held by the majority to be the first revelation, the rest came later when opposition to the prayer began.",
      ar: "مكية؛ والآيات ١–٥ أول ما نزل عند الجمهور، ونزل باقيها لاحقًا حين بدأ الصد عن الصلاة.",
    },
    asbab: {
      de: "Der Beginn der Offenbarung in der Höhle Ḥirāʾ wird von ʿĀʾischa berichtet (al-Buchārī); dass Abū Dschahl dem Propheten ﷺ das Gebet an der Kaʿba verwehren wollte (Verse 9–19), berichtet Muslim von Abū Huraira.",
      en: "The beginning of revelation in the cave of Ḥirāʾ is narrated by ʿĀʾisha (reported by al-Bukhari); Abū Jahl's attempt to stop the Prophet ﷺ praying at the Kaʿba (verses 9–19) is reported by Muslim from Abū Hurayra.",
      ar: "بدء الوحي في غار حراء من حديث عائشة (رواه البخاري)، ونهي أبي جهل النبيَّ ﷺ عن الصلاة عند الكعبة (الآيات ٩–١٩) رواه مسلم عن أبي هريرة.",
    },
    connects: {
      de: "At-Tīn endet mit Allah als gerechtestem Richter; al-ʿAlaq zeigt, wie der Mensch durch Wissen und Niederwerfung aufsteigt oder durch Hochmut fällt. Al-Qadr nennt dann die Nacht, in der dieses Lesen begann.",
      en: "At-Tin ends with Allah as the most just of judges; al-ʿAlaq shows how man rises through knowledge and prostration or falls through arrogance. Al-Qadr then names the night in which this reading began.",
      ar: "ختمت التين بأن الله أحكم الحاكمين، وتبين العلق كيف يرتقي الإنسان بالعلم والسجود أو يسقط بالطغيان، ثم تذكر القدر الليلة التي بدأت فيها هذه القراءة.",
    },
    lessons: {
      de: [
        "Lesen und Lernen sind von Anfang an mit dem Namen Allahs verbunden.",
        "Der Mensch stammt aus einfachem Ursprung und verdankt sein Wissen ganz seinem Herrn.",
        "Reichtum und Selbstgenügsamkeit verleiten zur Überheblichkeit.",
        "Wer andere vom Guten abhält, steht unter dem Blick Allahs.",
        "Die Niederwerfung ist der Weg der Nähe.",
      ],
      en: [
        "Reading and learning are tied to Allah's name from the very start.",
        "Man comes from a humble origin and owes all his knowledge to his Lord.",
        "Wealth and self-sufficiency tempt toward arrogance.",
        "Whoever blocks others from good stands under Allah's gaze.",
        "Prostration is the path of nearness.",
      ],
      ar: [
        "القراءة والتعلم مرتبطان باسم الله منذ البداية.",
        "أصل الإنسان متواضع، وكل علمه من ربه.",
        "الغنى ورؤية الاستغناء يدعوان إلى الطغيان.",
        "من صد عن الخير فهو تحت نظر الله.",
        "السجود طريق القرب.",
      ],
    },
    questions: {
      de: [
        "Beginnen Sie Ihr Lernen bewusst im Namen Allahs?",
        "Wo spüren Sie in sich das Gefühl, niemanden zu brauchen?",
        "Was hindert Sie an mehr Niederwerfung?",
      ],
      en: [
        "Do you consciously begin your learning in Allah's name?",
        "Where do you sense in yourself the feeling of needing no one?",
        "What keeps you from more prostration?",
      ],
      ar: [
        "هل تبدأ تعلمك باسم الله عن وعي؟",
        "أين تجد في نفسك شعور الاستغناء؟",
        "ما الذي يمنعك من مزيد من السجود؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Der Befehl zu lesen", en: "The command to read", ar: "الأمر بالقراءة" },
        lessons: {
          de: ["Wissen ist eine Gabe des Schöpfers.", "Der Stift ist ein Werkzeug der Offenbarung und der Bildung.", "Der Mensch wusste zuvor nichts."],
          en: ["Knowledge is a gift of the Creator.", "The pen is a tool of revelation and learning.", "Man knew nothing before he was taught."],
          ar: ["العلم هبة من الخالق.", "القلم أداة للوحي والتعليم.", "لم يكن الإنسان يعلم شيئًا قبل أن يُعلَّم."],
        },
        takeaway: { de: "Beginnen Sie jede Lerneinheit mit der Basmala.", en: "Begin every study session with the basmala.", ar: "ابدأ كل مجلس تعلم بالبسملة." },
        questions: {
          de: ["Wie verändert es Ihr Lernen, wenn Sie es als Geschenk sehen?"],
          en: ["How does your learning change when you see it as a gift?"],
          ar: ["كيف يتغير تعلمك إذا رأيته هبة؟"],
        },
      },
      {
        from: 6, to: 14,
        title: { de: "Überheblichkeit und Rückkehr", en: "Transgression and the return", ar: "الطغيان والرجعى" },
        lessons: {
          de: ["Selbstgenügsamkeit ist der Keim der Überschreitung.", "Alles kehrt zu Allah zurück.", "Allah sieht, auch wenn der Mensch es vergisst."],
          en: ["Self-sufficiency is the seed of transgression.", "Everything returns to Allah.", "Allah sees, even when man forgets it."],
          ar: ["رؤية الاستغناء بذرة الطغيان.", "إلى الله الرجعى.", "الله يرى وإن غفل الإنسان."],
        },
        takeaway: { de: "Erinnern Sie sich in Momenten des Erfolgs ausdrücklich an Ihre Abhängigkeit von Allah.", en: "In moments of success, deliberately recall your dependence on Allah.", ar: "تذكر افتقارك إلى الله عمدًا في لحظات النجاح." },
        questions: {
          de: ["Wie wirkt das Wissen, dass Allah sieht, auf Ihr Verhalten im Verborgenen?"],
          en: ["How does knowing that Allah sees shape your conduct in private?"],
          ar: ["كيف يؤثر علمك بأن الله يرى في سلوكك في الخلوة؟"],
        },
      },
      {
        from: 15, to: 19,
        title: { de: "Warnung und Niederwerfung", en: "Warning and prostration", ar: "الوعيد والسجود" },
        lessons: {
          de: ["Wer sich gegen die Wahrheit stellt, bleibt ohne Beistand.", "Dem Druck nicht nachgeben, sondern sich niederwerfen.", "Die Nähe zu Allah liegt in der Demut."],
          en: ["Whoever stands against the truth is left without support.", "Do not yield to pressure; prostrate instead.", "Nearness to Allah lies in humility."],
          ar: ["من عاند الحق لا ناصر له.", "لا تطع الضاغط، بل اسجد.", "القرب من الله في التذلل له."],
        },
        takeaway: { de: "Verlängern Sie heute in einem Gebet bewusst die Niederwerfung mit Bittgebet.", en: "Today, lengthen the prostration of one prayer with supplication.", ar: "أطل اليوم سجود صلاة واحدة بالدعاء." },
        questions: {
          de: ["Welchem Druck sollten Sie mit Standhaftigkeit statt Nachgeben begegnen?"],
          en: ["Which pressure should you meet with steadfastness rather than compliance?"],
          ar: ["أي ضغط ينبغي أن تقابله بالثبات لا بالطاعة؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "wahidi"],
    review: DRAFT,
  },

  // 97 al-Qadr (5)
  {
    s: 97,
    theme: {
      de: "Die Würde des Qurʾān zeigt sich in der Würde der Nacht, in der er herabgesandt wurde: eine Nacht voller Segen, Engel und Frieden.",
      en: "The dignity of the Qurʾān shows in the dignity of the night it was sent down: a night of blessing, angels and peace.",
      ar: "تظهر عظمة القرآن في عظمة الليلة التي أنزل فيها: ليلة بركة وملائكة وسلام.",
    },
    context: {
      de: "Nach der Mehrheit mekkanisch, einige Gelehrte halten sie für medinensisch.",
      en: "Meccan according to the majority; some scholars consider it Medinan.",
      ar: "مكية عند الجمهور، وقيل مدنية.",
    },
    connects: {
      de: "Al-ʿAlaq bringt den Befehl zu lesen, al-Qadr nennt die Nacht, in der das Gelesene herabkam; al-Bayyina beschreibt dann den Gesandten mit den reinen Blättern.",
      en: "Al-ʿAlaq brings the command to read, al-Qadr names the night in which what is read came down; al-Bayyina then describes the Messenger with the purified pages.",
      ar: "في العلق الأمر بالقراءة، وفي القدر ليلة نزول المقروء، ثم تصف البينة الرسول والصحف المطهرة.",
    },
    lessons: {
      de: [
        "Der Wert einer Zeit hängt an dem, was Allah in ihr gibt.",
        "Eine einzige Nacht kann ein langes Leben an Gutem aufwiegen.",
        "Himmel und Erde begegnen sich in dieser Nacht.",
        "Frieden ist ein Kennzeichen der Offenbarung.",
      ],
      en: [
        "The worth of a time depends on what Allah gives in it.",
        "A single night can outweigh a long life of good.",
        "Heaven and earth meet in this night.",
        "Peace is a mark of revelation.",
      ],
      ar: [
        "قيمة الزمان بما يعطي الله فيه.",
        "قد تعدل ليلة واحدة عمرًا طويلًا من الخير.",
        "تلتقي السماء والأرض في هذه الليلة.",
        "السلام سمة الوحي.",
      ],
    },
    questions: {
      de: ["Wie bereiten Sie sich auf die letzten zehn Nächte des Ramadan vor?", "Welche Rolle spielt der Qurʾān in Ihren besten Stunden?"],
      en: ["How do you prepare for the last ten nights of Ramadan?", "What place does the Qurʾān hold in your best hours?"],
      ar: ["كيف تستعد للعشر الأواخر من رمضان؟", "ما مكان القرآن في أفضل ساعاتك؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Die Nacht der Bestimmung", en: "The Night of Decree", ar: "ليلة القدر" },
        lessons: {
          de: ["Die Herabsendung ehrt die Zeit, in der sie geschah.", "Die Frage in Vers 2 weckt Staunen vor dem Unbekannten.", "Kleine Zeitfenster können großen Lohn tragen."],
          en: ["The sending down honours the time in which it happened.", "The question in verse 2 awakens awe before the unknown.", "Small windows of time can carry great reward."],
          ar: ["الإنزال يشرف زمانه.", "السؤال في الآية ٢ يبعث على التعظيم.", "قد يحمل الوقت القصير أجرًا عظيمًا."],
        },
        takeaway: { de: "Planen Sie feste Qurʾān-Zeiten für die letzten zehn Nächte des Ramadan.", en: "Plan fixed Qurʾān times for the last ten nights of Ramadan.", ar: "خطط لأوقات ثابتة مع القرآن في العشر الأواخر." },
        questions: {
          de: ["Welche Stunde Ihres Tages könnte für Sie eine „kleine Nacht des Wertes“ werden?"],
          en: ["Which hour of your day could become a small \"night of worth\" for you?"],
          ar: ["أي ساعة من يومك يمكن أن تصبح لك ساعة قدر؟"],
        },
      },
      {
        from: 4, to: 5,
        title: { de: "Engel und Frieden", en: "Angels and peace", ar: "الملائكة والسلام" },
        lessons: {
          de: ["Die Engel steigen mit jeder Angelegenheit herab.", "Die Nacht ist Frieden bis zum Morgengrauen."],
          en: ["The angels descend with every matter.", "The night is peace until dawn."],
          ar: ["تتنزل الملائكة بكل أمر.", "الليلة سلام حتى مطلع الفجر."],
        },
        takeaway: { de: "Bitten Sie in diesen Nächten besonders um Vergebung und Wohlergehen.", en: "In these nights, ask especially for forgiveness and well-being.", ar: "أكثر في هذه الليالي من سؤال العفو والعافية." },
        questions: {
          de: ["Wie würde sich eine Nacht anfühlen, die ganz Frieden ist?"],
          en: ["What would a night that is entirely peace feel like?"],
          ar: ["كيف تكون ليلة كلها سلام؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari"],
    review: DRAFT,
  },

  // 98 al-Bayyina (8)
  {
    s: 98,
    theme: {
      de: "Der klare Beweis ist gekommen; die Spaltung danach liegt nicht am Mangel an Licht, sondern an der Abkehr. Reine Hingabe führt zu den besten Geschöpfen.",
      en: "The clear proof has come; the division after it is not due to lack of light but to turning away. Sincere devotion leads to the best of creation.",
      ar: "جاءت البينة، والتفرق بعدها ليس لقلة النور بل للإعراض، والإخلاص يبلغ بصاحبه خير البرية.",
    },
    context: {
      de: "Nach der Mehrheit medinensisch, da sie sich an die Leute der Schrift richtet; einige halten sie für mekkanisch.",
      en: "Medinan according to the majority, as it addresses the People of the Book; some consider it Meccan.",
      ar: "مدنية عند الجمهور لخطابها أهل الكتاب، وقيل مكية.",
    },
    connects: {
      de: "Al-Qadr nennt die Nacht der Herabsendung, al-Bayyina den Gesandten, der sie verkündet; az-Zalzala zeigt den Tag, an dem jede Tat sichtbar wird.",
      en: "Al-Qadr names the night of sending down, al-Bayyina the Messenger who proclaims it; az-Zalzala shows the day on which every deed becomes visible.",
      ar: "القدر ليلة الإنزال، والبينة الرسول المبلِّغ، ثم الزلزلة يوم ظهور كل عمل.",
    },
    lessons: {
      de: [
        "Der Gesandte ﷺ und die reinen Schriften sind der klare Beweis.",
        "Spaltung kam nach dem Wissen, nicht aus Unwissen.",
        "Der Kern der Religion ist aufrichtige Hingabe, Gebet und Zakāt.",
        "Die Menschen teilen sich nach Glauben und Tat in zwei Gruppen.",
        "Das höchste Ziel ist das gegenseitige Wohlgefallen mit Allah aus Ehrfurcht.",
      ],
      en: [
        "The Messenger ﷺ and the pure scriptures are the clear proof.",
        "Division came after knowledge, not out of ignorance.",
        "The core of religion is sincere devotion, prayer and zakat.",
        "People divide into two groups by faith and deeds.",
        "The highest goal is mutual pleasure with Allah, born of reverence.",
      ],
      ar: [
        "الرسول ﷺ والصحف المطهرة هي البينة.",
        "التفرق جاء بعد العلم لا عن جهل.",
        "جوهر الدين إخلاص وصلاة وزكاة.",
        "ينقسم الناس بالإيمان والعمل فريقين.",
        "الغاية العليا الرضا المتبادل مع الله، وسببه الخشية.",
      ],
    },
    questions: {
      de: ["Wo kennen Sie die Wahrheit und zögern dennoch?", "Was macht Ihre Gottesdienste aufrichtiger?"],
      en: ["Where do you know the truth and still hesitate?", "What makes your worship more sincere?"],
      ar: ["أين تعرف الحق ثم تتردد؟", "ما الذي يجعل عبادتك أخلص؟"],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Der klare Beweis und der Kern der Religion", en: "The clear proof and the core of religion", ar: "البينة وجوهر الدين" },
        lessons: {
          de: ["Rechtleitung braucht einen klaren Beweis, und Allah hat ihn gesandt.", "Wissen ohne Hingabe kann zur Spaltung führen.", "Die Religion ist einfach in ihrem Kern: Aufrichtigkeit, Gebet, Zakāt."],
          en: ["Guidance needs a clear proof, and Allah sent it.", "Knowledge without devotion can lead to division.", "Religion is simple at its core: sincerity, prayer, zakat."],
          ar: ["الهداية تحتاج بينة، وقد أرسلها الله.", "العلم بلا إخلاص قد يورث التفرق.", "الدين في جوهره يسير: إخلاص وصلاة وزكاة."],
        },
        takeaway: { de: "Prüfen Sie vor einer guten Tat kurz Ihre Absicht.", en: "Before a good deed, briefly check your intention.", ar: "راجع نيتك قبل كل عمل صالح." },
        questions: {
          de: ["Welche Ihrer Gewohnheiten ist Form ohne Aufrichtigkeit geworden?"],
          en: ["Which of your habits has become form without sincerity?"],
          ar: ["أي عاداتك صار شكلًا بلا إخلاص؟"],
        },
      },
      {
        from: 6, to: 8,
        title: { de: "Die schlechtesten und die besten Geschöpfe", en: "The worst and the best of creation", ar: "شر البرية وخير البرية" },
        lessons: {
          de: ["Der Wert des Menschen bemisst sich an Glauben und Tat.", "Ehrfurcht vor Allah ist der Schlüssel zum Wohlgefallen.", "Das Ende ist bleibend, daher zählt die Wahl jetzt."],
          en: ["A person's worth is measured by faith and deeds.", "Reverence for Allah is the key to His pleasure.", "The end is lasting, so the choice now matters."],
          ar: ["قيمة الإنسان بإيمانه وعمله.", "الخشية مفتاح الرضا.", "العاقبة دائمة، فالاختيار الآن هو المهم."],
        },
        takeaway: { de: "Nehmen Sie sich heute eine Tat vor, die allein aus Ehrfurcht vor Allah geschieht.", en: "Commit today to one deed done purely out of reverence for Allah.", ar: "اعزم اليوم على عمل واحد خالص خشية لله." },
        questions: {
          de: ["Was bedeutet es für Sie, mit Allah zufrieden zu sein?"],
          en: ["What does it mean for you to be pleased with Allah?"],
          ar: ["ماذا يعني لك أن ترضى عن الله؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "qurtubi"],
    review: DRAFT,
  },

  // 99 az-Zalzala (8)
  {
    s: 99,
    theme: {
      de: "Am Tag der Auferstehung gibt die Erde preis, was auf ihr geschah, und jedes noch so kleine Gute und Schlechte wird gesehen.",
      en: "On the Day of Resurrection the earth reveals what happened upon it, and every good and evil, however small, will be seen.",
      ar: "يوم القيامة تحدث الأرض بما جرى عليها، ويرى كل امرئ عمله ولو كان مثقال ذرة.",
    },
    context: {
      de: "Umstritten: Nach vielen medinensisch, nach anderen mekkanisch; Stil und Thema ähneln den frühen mekkanischen Suren.",
      en: "Disputed: many consider it Medinan, others Meccan; its style and theme resemble the early Meccan surahs.",
      ar: "مختلف فيها: مدنية عند كثيرين ومكية عند آخرين، وأسلوبها يشبه السور المكية الأولى.",
    },
    connects: {
      de: "Al-Bayyina nennt den Lohn der Glaubenden und das Ende der Leugner; az-Zalzala zeigt den Tag, an dem dieser Lohn sichtbar wird. Al-ʿĀdiyāt beschreibt dann den undankbaren Menschen, der diesen Tag vergisst.",
      en: "Al-Bayyina names the reward of believers and the end of deniers; az-Zalzala shows the day on which this becomes visible. Al-ʿAdiyat then describes the ungrateful man who forgets this day.",
      ar: "ذكرت البينة جزاء المؤمنين ومآل المكذبين، والزلزلة يوم ظهوره، ثم العاديات تصف الإنسان الكنود الغافل عنه.",
    },
    lessons: {
      de: [
        "Die Erde ist Zeugin unserer Taten.",
        "Nichts Kleines geht verloren, weder im Guten noch im Schlechten.",
        "Die Menschen kommen getrennt hervor, um ihre Taten zu sehen.",
        "Alles geschieht auf Eingebung Allahs.",
      ],
      en: [
        "The earth is a witness to our deeds.",
        "Nothing small is lost, neither good nor evil.",
        "People come forth in separate groups to be shown their deeds.",
        "Everything happens by Allah's inspiration.",
      ],
      ar: [
        "الأرض شاهدة على أعمالنا.",
        "لا يضيع صغير من خير أو شر.",
        "يصدر الناس أشتاتًا ليروا أعمالهم.",
        "كل ذلك بوحي من الله.",
      ],
    },
    questions: {
      de: ["Was würde der Ort, an dem Sie gerade sind, über Sie berichten?", "Welches kleine Gute unterschätzen Sie?"],
      en: ["What would the place you are in right now report about you?", "Which small good do you underestimate?"],
      ar: ["ماذا ستحدث الأرض التي أنت عليها الآن عنك؟", "أي خير صغير تستهين به؟"],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Das Beben und das Zeugnis der Erde", en: "The quake and the earth's testimony", ar: "الزلزلة وشهادة الأرض" },
        lessons: {
          de: ["Was heute fest scheint, wird erschüttert.", "Die Erde spricht über das, was auf ihr getan wurde.", "Der Mensch fragt dann erstaunt, was geschieht."],
          en: ["What seems firm today will be shaken.", "The earth speaks of what was done upon it.", "Man will then ask in astonishment what is happening."],
          ar: ["ما يبدو ثابتًا اليوم سيُزلزل.", "تحدث الأرض بما عُمل عليها.", "ويتساءل الإنسان حينها مذهولًا."],
        },
        takeaway: { de: "Tun Sie heute an einem neuen Ort bewusst etwas Gutes, das die Erde bezeugen kann.", en: "Today, do a deliberate good deed in a new place that the earth can bear witness to.", ar: "اعمل اليوم خيرًا في مكان جديد تشهد لك به الأرض." },
        questions: {
          de: ["Wie verändert der Gedanke an diese Zeugin Ihr Verhalten unterwegs?"],
          en: ["How does the thought of this witness change your behaviour when out and about?"],
          ar: ["كيف تغير هذه الشهادة سلوكك في الطريق؟"],
        },
      },
      {
        from: 6, to: 8,
        title: { de: "Jedes Atom wird gesehen", en: "Every atom will be seen", ar: "مثقال ذرة" },
        lessons: {
          de: ["Gerechtigkeit Allahs ist vollkommen genau.", "Kleine gute Taten haben Gewicht.", "Kleine Sünden sollten nicht gering geschätzt werden."],
          en: ["Allah's justice is perfectly precise.", "Small good deeds carry weight.", "Small sins should not be taken lightly."],
          ar: ["عدل الله دقيق كامل.", "للخير الصغير وزن.", "لا تُحقَر صغائر الذنوب."],
        },
        takeaway: { de: "Tun Sie heute eine kleine gute Tat, die niemand sieht.", en: "Do one small good deed today that no one sees.", ar: "اعمل اليوم خيرًا صغيرًا لا يراه أحد." },
        questions: {
          de: ["Welche kleine Sünde haben Sie sich zur Gewohnheit gemacht?"],
          en: ["Which small sin have you made a habit?"],
          ar: ["أي ذنب صغير صار عادة لك؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },

  // 100 al-ʿĀdiyāt (11)
  {
    s: 100,
    theme: {
      de: "Der Mensch ist seinem Herrn gegenüber undankbar und liebt den Besitz heftig; die Auferstehung wird enthüllen, was in den Herzen verborgen war.",
      en: "Man is ungrateful to his Lord and loves wealth intensely; the resurrection will expose what was hidden in the hearts.",
      ar: "الإنسان لربه كنود ولحب الخير شديد، والبعث يكشف ما في الصدور.",
    },
    context: {
      de: "Nach der Mehrheit mekkanisch; einige halten sie wegen der Schilderung der Reiterei für medinensisch.",
      en: "Meccan according to the majority; some consider it Medinan because of the depiction of cavalry.",
      ar: "مكية عند الجمهور، وقيل مدنية لذكر الخيل المغيرة.",
    },
    connects: {
      de: "Az-Zalzala zeigt, dass jede Tat gesehen wird; al-ʿĀdiyāt benennt die inneren Ursachen schlechter Taten: Undank und Besitzliebe. Al-Qāriʿa folgt mit dem Wiegen der Taten.",
      en: "Az-Zalzala shows that every deed is seen; al-ʿAdiyat names the inner roots of bad deeds: ingratitude and love of wealth. Al-Qariʿa follows with the weighing of deeds.",
      ar: "بينت الزلزلة أن كل عمل يُرى، وتبين العاديات أصوله الباطنة: الكنود وحب المال، ثم القارعة بوزن الأعمال.",
    },
    lessons: {
      de: [
        "Allah schwört bei Tieren, die ihrem Herrn treu dienen, als Gegenbild zum undankbaren Menschen.",
        "Undankbarkeit ist eine Neigung, gegen die man bewusst arbeiten muss.",
        "Die Liebe zum Besitz kann den Blick auf das Jenseits verdecken.",
        "Am Ende zählt das Innere des Herzens.",
      ],
      en: [
        "Allah swears by animals that loyally serve their masters, as a contrast to ungrateful man.",
        "Ingratitude is a tendency one must consciously work against.",
        "Love of wealth can veil the view of the hereafter.",
        "In the end, what is inside the heart counts.",
      ],
      ar: [
        "أقسم الله بالخيل الوفية لصاحبها مقابلةً بالإنسان الكنود.",
        "الكنود طبع يُجاهَد عن وعي.",
        "حب المال قد يحجب النظر إلى الآخرة.",
        "العبرة في النهاية بما في الصدور.",
      ],
    },
    questions: {
      de: ["Wofür haben Sie heute noch nicht gedankt?", "Wie stark bestimmt Besitz Ihre Entscheidungen?"],
      en: ["What have you not yet given thanks for today?", "How strongly does wealth drive your decisions?"],
      ar: ["على أي نعمة لم تشكر اليوم بعد؟", "إلى أي حد يحكم المال قراراتك؟"],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Der Schwur bei den Rennenden", en: "The oath by the chargers", ar: "القسم بالعاديات" },
        lessons: {
          de: ["Ein Tier bringt Opfer für den, der es versorgt.", "Allah lenkt den Blick auf Eifer und Hingabe.", "Bilder aus dem Alltag der Araber machen die Botschaft lebendig."],
          en: ["An animal sacrifices itself for the one who feeds it.", "Allah directs our attention to zeal and devotion.", "Images from the Arabs' daily life bring the message alive."],
          ar: ["الدابة تبذل نفسها لمن يطعمها.", "يلفت الله النظر إلى الجد والبذل.", "صور من حياة العرب تحيي المعنى."],
        },
        takeaway: { de: "Fragen Sie sich, ob Sie Ihrem Herrn so treu sind wie ein Tier seinem Halter.", en: "Ask yourself whether you are as loyal to your Lord as an animal to its keeper.", ar: "اسأل نفسك: هل أنت لربك وفيٌّ كوفاء الدابة لصاحبها؟" },
        questions: {
          de: ["Wofür setzen Sie Ihre ganze Kraft ein?"],
          en: ["What do you spend your full strength on?"],
          ar: ["في أي شيء تبذل كل طاقتك؟"],
        },
      },
      {
        from: 6, to: 8,
        title: { de: "Der undankbare Mensch", en: "Ungrateful man", ar: "الإنسان الكنود" },
        lessons: {
          de: ["Der Mensch zählt das Unglück und vergisst die Gaben.", "Er ist selbst Zeuge seiner Undankbarkeit.", "Besitzliebe ist ein mächtiger Antrieb."],
          en: ["Man counts misfortunes and forgets blessings.", "He himself is witness to his ingratitude.", "Love of wealth is a powerful drive."],
          ar: ["يعد الإنسان المصائب وينسى النعم.", "وهو على كنوده شهيد.", "حب المال دافع قوي."],
        },
        takeaway: { de: "Schreiben Sie heute drei Gaben auf, für die Sie Allah danken.", en: "Write down three blessings today for which you thank Allah.", ar: "اكتب اليوم ثلاث نعم تشكر الله عليها." },
        questions: {
          de: ["Wo bezeugt Ihr eigenes Verhalten Undank?"],
          en: ["Where does your own behaviour testify to ingratitude?"],
          ar: ["أين يشهد سلوكك على كنودك؟"],
        },
      },
      {
        from: 9, to: 11,
        title: { de: "Was in den Herzen ist", en: "What is in the hearts", ar: "ما في الصدور" },
        lessons: {
          de: ["Die Gräber werden geöffnet und die Herzen offengelegt.", "Allah ist über alles vollkommen kundig.", "Innere Reinigung ist wichtiger als äußerer Schein."],
          en: ["Graves will be opened and hearts laid bare.", "Allah is fully aware of everything.", "Inner purification matters more than outward appearance."],
          ar: ["تُبعثر القبور ويُحصَّل ما في الصدور.", "الله خبير بكل شيء.", "تزكية الباطن أهم من حسن الظاهر."],
        },
        takeaway: { de: "Prüfen Sie vor dem Schlafen kurz, welche Absicht Ihren Tag bestimmt hat.", en: "Before sleeping, briefly review which intention guided your day.", ar: "راجع قبل النوم النية التي حكمت يومك." },
        questions: {
          de: ["Was in Ihrem Herzen möchten Sie vor diesem Tag noch ändern?"],
          en: ["What in your heart would you like to change before that day?"],
          ar: ["ما الذي تريد أن تغيره في قلبك قبل ذلك اليوم؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari"],
    review: DRAFT,
  },

  // 101 al-Qāriʿa (11)
  {
    s: 101,
    theme: {
      de: "Der Tag der Erschütterung stellt alles auf den Kopf; entscheidend ist allein, ob die Waagschale der Taten schwer oder leicht ist.",
      en: "The Day of the Striking Calamity overturns everything; all that matters is whether the scale of deeds is heavy or light.",
      ar: "يوم القارعة يقلب كل شيء، والفيصل ثقل الموازين أو خفتها.",
    },
    context: {
      de: "Mekkanisch, aus der frühen Zeit, mit kurzen, eindringlichen Versen.",
      en: "Meccan, from the early period, with short, forceful verses.",
      ar: "مكية من العهد المبكر، بآيات قصيرة قوية الوقع.",
    },
    connects: {
      de: "Al-ʿĀdiyāt endet mit dem Offenlegen der Herzen; al-Qāriʿa zeigt das Wiegen der Taten. At-Takāthur nennt dann, was die Menschen von diesem Tag ablenkt.",
      en: "Al-ʿAdiyat ends with hearts laid bare; al-Qariʿa shows the weighing of deeds. At-Takathur then names what distracts people from that day.",
      ar: "ختمت العاديات بتحصيل ما في الصدور، وتبين القارعة وزن الأعمال، ثم التكاثر ما يلهي عنه.",
    },
    lessons: {
      de: [
        "Der Tag ist so gewaltig, dass die Frage nach ihm wiederholt wird.",
        "Menschen wirken dann schwach und zerstreut wie Motten.",
        "Berge, das Bild der Festigkeit, werden wie zerzauste Wolle.",
        "Das Gewicht der Taten entscheidet über das Leben danach.",
      ],
      en: [
        "The day is so immense that the question about it is repeated.",
        "People will then seem weak and scattered like moths.",
        "Mountains, the image of firmness, become like fluffed wool.",
        "The weight of deeds decides the life after.",
      ],
      ar: [
        "اليوم عظيم حتى كُرر السؤال عنه.",
        "يكون الناس كالفراش المبثوث ضعفًا وتفرقًا.",
        "تصير الجبال، رمز الثبات، كالعهن المنفوش.",
        "ثقل الأعمال يحدد المصير.",
      ],
    },
    questions: {
      de: ["Welche Ihrer Taten hätte Gewicht auf der Waage?", "Worauf verlassen Sie sich, das an jenem Tag zerfällt?"],
      en: ["Which of your deeds would carry weight on the scale?", "What do you rely on that will crumble on that day?"],
      ar: ["أي أعمالك سيكون له وزن في الميزان؟", "على أي شيء تعتمد وهو يتلاشى يومئذ؟"],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Die Erschütterung", en: "The striking calamity", ar: "القارعة" },
        lessons: {
          de: ["Die wiederholte Frage soll aufrütteln.", "Was heute stark erscheint, wird schwach.", "Kein Mensch und kein Berg hat dann eigenen Halt."],
          en: ["The repeated question is meant to shake us awake.", "What seems strong today will become weak.", "No person and no mountain has its own footing then."],
          ar: ["السؤال المكرر للإيقاظ.", "ما يبدو قويًا اليوم يضعف.", "لا ثبات يومئذ لإنسان ولا جبل."],
        },
        takeaway: { de: "Halten Sie bei einer Sorge inne und vergleichen Sie sie mit der Größe jenes Tages.", en: "When a worry arises, pause and measure it against the magnitude of that day.", ar: "إذا أهمك أمر فقِسه بعظمة ذلك اليوم." },
        questions: {
          de: ["Welche Sorge verliert ihr Gewicht, wenn Sie an diesen Tag denken?"],
          en: ["Which worry loses its weight when you think of that day?"],
          ar: ["أي هم يخف إذا تذكرت ذلك اليوم؟"],
        },
      },
      {
        from: 6, to: 11,
        title: { de: "Schwere und leichte Waagschalen", en: "Heavy and light scales", ar: "ثقل الموازين وخفتها" },
        lessons: {
          de: ["Der Wert der Taten liegt in ihrem Gewicht, nicht in ihrer Zahl.", "Ein zufriedenes Leben ist der Lohn schwerer Waagschalen.", "Leichte Waagschalen führen in ein brennendes Feuer."],
          en: ["The value of deeds lies in their weight, not their number.", "A pleasing life is the reward of heavy scales.", "Light scales lead to a blazing fire."],
          ar: ["قيمة الأعمال بوزنها لا بعددها.", "العيشة الراضية جزاء ثقل الموازين.", "خفة الموازين تفضي إلى نار حامية."],
        },
        takeaway: { de: "Wählen Sie heute eine Tat, die Sie besonders aufrichtig und sorgfältig verrichten.", en: "Choose one deed today to perform with special sincerity and care.", ar: "اختر اليوم عملًا تؤديه بإخلاص وإتقان خاص." },
        questions: {
          de: ["Was macht eine Tat schwer: ihr Umfang oder ihre Aufrichtigkeit?"],
          en: ["What makes a deed heavy: its size or its sincerity?"],
          ar: ["ما الذي يثقل العمل: حجمه أم إخلاصه؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },

  // 102 at-Takāthur (8)
  {
    s: 102,
    theme: {
      de: "Das Wetteifern um mehr lenkt bis zum Grab ab; am Ende wird jeder nach den Gaben gefragt, die er genossen hat.",
      en: "Competing for more distracts until the grave; in the end everyone will be asked about the blessings they enjoyed.",
      ar: "التكاثر يلهي حتى القبور، ثم يُسأل كل أحد عن النعيم.",
    },
    context: {
      de: "Nach der Mehrheit mekkanisch; einige Gelehrte halten sie für medinensisch.",
      en: "Meccan according to the majority; some scholars consider it Medinan.",
      ar: "مكية عند الجمهور، وقيل مدنية.",
    },
    connects: {
      de: "Al-Qāriʿa zeigt das Wiegen der Taten; at-Takāthur nennt, was die Waagschale leer lässt. Al-ʿAṣr folgt mit dem Gegenmittel gegen den Verlust.",
      en: "Al-Qariʿa shows the weighing of deeds; at-Takathur names what leaves the scale empty. Al-ʿAsr follows with the remedy against loss.",
      ar: "القارعة وزن الأعمال، والتكاثر ما يُخِف الميزان، ثم العصر علاج الخسران.",
    },
    lessons: {
      de: [
        "Vergleichen und Anhäufen können ein ganzes Leben füllen.",
        "Der Tod beendet dieses Wetteifern abrupt.",
        "Gewissheit des Wissens bewahrt vor Ablenkung.",
        "Jede Gabe bringt eine Frage mit sich.",
      ],
      en: [
        "Comparing and accumulating can fill a whole life.",
        "Death ends this race abruptly.",
        "Certain knowledge protects against distraction.",
        "Every blessing comes with a question.",
      ],
      ar: [
        "المقارنة والتكاثر قد يملآن العمر.",
        "الموت يقطع هذا التسابق فجأة.",
        "علم اليقين يحمي من الغفلة.",
        "كل نعمة يتبعها سؤال.",
      ],
    },
    questions: {
      de: ["Womit vergleichen Sie sich am häufigsten?", "Wie würden Sie heute nach Ihrer Gesundheit und Zeit befragt antworten?"],
      en: ["What do you most often compare yourself with?", "How would you answer today if asked about your health and time?"],
      ar: ["بمن تقارن نفسك أكثر؟", "بماذا تجيب لو سُئلت اليوم عن صحتك ووقتك؟"],
    },
    sections: [
      {
        from: 1, to: 4,
        title: { de: "Abgelenkt bis zum Grab", en: "Distracted until the grave", ar: "الإلهاء حتى القبور" },
        lessons: {
          de: ["Wettstreit um Besitz und Ansehen ist eine starke Ablenkung.", "Der Besuch der Gräber kommt für jeden.", "Die Wiederholung der Warnung verstärkt ihren Ernst."],
          en: ["Competing for wealth and status is a powerful distraction.", "The visit to the graves comes for everyone.", "The repeated warning stresses its seriousness."],
          ar: ["التنافس على المال والجاه إلهاء شديد.", "زيارة القبور آتية لكل أحد.", "تكرار الوعيد يؤكد جديته."],
        },
        takeaway: { de: "Verzichten Sie heute bewusst auf einen Vergleich mit anderen.", en: "Deliberately refrain from comparing yourself with others today.", ar: "امتنع اليوم عمدًا عن مقارنة نفسك بغيرك." },
        questions: {
          de: ["Welcher Wettbewerb raubt Ihnen gerade Zeit für Allah?"],
          en: ["Which competition is currently stealing your time for Allah?"],
          ar: ["أي تنافس يسرق وقتك من الله الآن؟"],
        },
      },
      {
        from: 5, to: 8,
        title: { de: "Gewissheit und Rechenschaft", en: "Certainty and accountability", ar: "اليقين والسؤال" },
        lessons: {
          de: ["Wissen der Gewissheit verändert das Verhalten.", "Was heute geglaubt wird, wird einst gesehen.", "Auch erlaubte Freuden sind Gaben, über die gefragt wird."],
          en: ["Knowledge of certainty changes behaviour.", "What is believed today will one day be seen.", "Even permitted pleasures are blessings one will be asked about."],
          ar: ["علم اليقين يغير السلوك.", "ما يُؤمن به اليوم يُرى عيانًا غدًا.", "حتى المباحات نعم يُسأل عنها."],
        },
        takeaway: { de: "Danken Sie nach jeder Mahlzeit heute bewusst mit Worten und Herz.", en: "After every meal today, give thanks consciously with words and heart.", ar: "اشكر الله بقلبك ولسانك بعد كل وجبة اليوم." },
        questions: {
          de: ["Welche alltägliche Gabe nehmen Sie als selbstverständlich hin?"],
          en: ["Which everyday blessing do you take for granted?"],
          ar: ["أي نعمة يومية تعدها أمرًا مسلَّمًا؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "qurtubi"],
    review: DRAFT,
  },

  // 103 al-ʿAṣr (3)
  {
    s: 103,
    theme: {
      de: "Die Zeit vergeht und der Mensch ist im Verlust, außer wer glaubt, Gutes tut und andere zur Wahrheit und zur Geduld ermahnt.",
      en: "Time passes and man is in loss, except those who believe, do good, and urge one another to truth and patience.",
      ar: "يمضي الزمان والإنسان في خسر، إلا من آمن وعمل صالحًا وتواصى بالحق والصبر.",
    },
    context: {
      de: "Nach der Mehrheit mekkanisch; einige halten sie für medinensisch. Ihre Kürze fasst ein ganzes Lebensprogramm zusammen.",
      en: "Meccan according to the majority; some consider it Medinan. Its brevity sums up a whole programme of life.",
      ar: "مكية عند الجمهور، وقيل مدنية، وهي على قصرها منهج حياة كامل.",
    },
    connects: {
      de: "At-Takāthur zeigt die verlorene Zeit des Anhäufens; al-ʿAṣr nennt den Weg aus dem Verlust. Al-Humaza zeigt dann ein Beispiel der Verlierer.",
      en: "At-Takathur shows time lost to accumulation; al-ʿAsr names the way out of loss. Al-Humaza then shows an example of the losers.",
      ar: "التكاثر ضياع العمر في الجمع، والعصر طريق النجاة من الخسر، ثم الهمزة مثال للخاسرين.",
    },
    lessons: {
      de: [
        "Zeit ist das eigentliche Kapital des Menschen.",
        "Verlust ist der Normalzustand, Rettung erfordert Einsatz.",
        "Glaube und Tat gehören zusammen.",
        "Rettung ist auch gemeinschaftlich: gegenseitige Ermahnung zu Wahrheit und Geduld.",
      ],
      en: [
        "Time is man's real capital.",
        "Loss is the default state; salvation requires effort.",
        "Faith and deeds belong together.",
        "Salvation is also communal: mutual counsel to truth and patience.",
      ],
      ar: [
        "الوقت رأس مال الإنسان.",
        "الخسران هو الأصل، والنجاة تحتاج سعيًا.",
        "الإيمان والعمل متلازمان.",
        "النجاة جماعية أيضًا: تواصٍ بالحق والصبر.",
      ],
    },
    questions: {
      de: ["Wie viel Ihres Tages dient einem der vier Rettungswege?", "Wer ermahnt Sie zur Wahrheit, und wen ermahnen Sie?"],
      en: ["How much of your day serves one of the four paths of salvation?", "Who counsels you to truth, and whom do you counsel?"],
      ar: ["كم من يومك يخدم أحد أسباب النجاة الأربعة؟", "من يوصيك بالحق، ومن توصيه؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Zeit, Verlust und die vier Auswege", en: "Time, loss and the four ways out", ar: "الزمن والخسر والمخارج الأربعة" },
        lessons: {
          de: ["Der Schwur bei der Zeit zeigt ihren Wert.", "Jeder Mensch ist zunächst im Verlust.", "Glaube, gute Tat, Ermahnung zur Wahrheit und zur Geduld bilden den Ausweg.", "Al-Shāfiʿī wird der Gedanke zugeschrieben, diese Sure allein würde den Menschen genügen, hätten sie über sie nachgedacht."],
          en: ["The oath by time shows its worth.", "Every human is in loss at first.", "Faith, good deeds, counsel to truth and to patience form the way out.", "Al-Shafiʿi is credited with the thought that this surah alone would suffice people if they reflected on it."],
          ar: ["القسم بالعصر يبين قيمته.", "كل إنسان في خسر ابتداءً.", "الإيمان والعمل الصالح والتواصي بالحق والصبر هي المخرج.", "يُنسب إلى الشافعي أن الناس لو تدبروا هذه السورة لكفتهم."],
        },
        takeaway: { de: "Ermutigen Sie heute einen Menschen freundlich zu etwas Gutem oder zur Geduld.", en: "Today, kindly encourage one person toward something good or toward patience.", ar: "شجع اليوم شخصًا بلطف على خير أو صبر." },
        questions: {
          de: ["Welcher der vier Wege ist bei Ihnen am schwächsten?", "Wie nutzen Sie die letzte Stunde des Tages?"],
          en: ["Which of the four paths is weakest in you?", "How do you use the last hour of the day?"],
          ar: ["أي الأربعة أضعف عندك؟", "كيف تستثمر آخر ساعة من يومك؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari"],
    review: DRAFT,
  },

  // 104 al-Humaza (9)
  {
    s: 104,
    theme: {
      de: "Wer andere herabsetzt und verleumdet und auf Besitz vertraut, als mache er unsterblich, wird in das zermalmende Feuer geworfen.",
      en: "Whoever belittles and slanders others and trusts in wealth as if it made him immortal will be cast into the crushing fire.",
      ar: "من همز الناس ولمزهم واتكل على ماله كأنه يخلده نُبذ في الحطمة.",
    },
    context: {
      de: "Mekkanisch; sie spiegelt den Spott der wohlhabenden Gegner über die frühen Muslime.",
      en: "Meccan; it reflects the mockery of wealthy opponents toward the early Muslims.",
      ar: "مكية، تعكس سخرية الأغنياء المعاندين من المسلمين الأوائل.",
    },
    connects: {
      de: "Al-ʿAṣr nennt die Geretteten; al-Humaza zeigt das Gegenbild des Verlierers. Al-Fīl folgt mit dem Beispiel der Macht, die Allah zerschlug.",
      en: "Al-ʿAsr names the saved; al-Humaza shows the opposite image of the loser. Al-Fil follows with the example of power that Allah shattered.",
      ar: "ذكرت العصر الناجين، وتصور الهمزة الخاسر، ثم الفيل مثال القوة التي حطمها الله.",
    },
    lessons: {
      de: [
        "Spott und üble Nachrede sind schwere Vergehen.",
        "Besitz zu zählen gibt eine falsche Sicherheit.",
        "Die Strafe entspricht der Tat: wer andere zerbricht, kommt in das Zermalmende.",
        "Das Feuer erreicht die Herzen, den Sitz des Hochmuts.",
      ],
      en: [
        "Mockery and backbiting are grave wrongs.",
        "Counting wealth gives a false sense of security.",
        "The punishment matches the deed: whoever breaks others enters the crusher.",
        "The fire reaches the hearts, the seat of arrogance.",
      ],
      ar: [
        "الهمز واللمز ذنبان عظيمان.",
        "عدّ المال يعطي أمانًا زائفًا.",
        "الجزاء من جنس العمل: من حطم الناس صار إلى الحطمة.",
        "النار تطّلع على الأفئدة موضع الكبر.",
      ],
    },
    questions: {
      de: ["Wann haben Sie zuletzt über jemanden abfällig gesprochen?", "Was gibt Ihnen Sicherheit: Besitz oder Allah?"],
      en: ["When did you last speak disparagingly of someone?", "What gives you security: wealth or Allah?"],
      ar: ["متى تكلمت آخر مرة في أحد بازدراء؟", "ما الذي يمنحك الأمان: المال أم الله؟"],
    },
    sections: [
      {
        from: 1, to: 4,
        title: { de: "Der Spötter und sein Besitz", en: "The mocker and his wealth", ar: "الهمّاز وماله" },
        lessons: {
          de: ["Herabsetzung mit Worten und Gesten wird gleichermaßen getadelt.", "Wer Besitz anhäuft und zählt, hält ihn für ewig.", "Diese Illusion wird plötzlich zerstört."],
          en: ["Belittling with words and with gestures are both condemned.", "Whoever hoards and counts wealth thinks it is eternal.", "This illusion is suddenly shattered."],
          ar: ["يُذم الانتقاص بالقول والإشارة معًا.", "من جمع المال وعدده ظنه مخلدًا.", "يتحطم هذا الوهم فجأة."],
        },
        takeaway: { de: "Verzichten Sie heute auf jede abfällige Bemerkung über andere, auch im Scherz.", en: "Today, refrain from any disparaging remark about others, even in jest.", ar: "اترك اليوم كل كلمة انتقاص في غيرك ولو مزاحًا." },
        questions: {
          de: ["Welche Ihrer Bemerkungen könnte jemanden verletzt haben?"],
          en: ["Which of your remarks might have hurt someone?"],
          ar: ["أي كلماتك ربما جرحت أحدًا؟"],
        },
      },
      {
        from: 5, to: 9,
        title: { de: "Das zermalmende Feuer", en: "The crushing fire", ar: "الحطمة" },
        lessons: {
          de: ["Das Feuer wird Allah zugeschrieben, was seinen Ernst betont.", "Es erreicht das Innere, nicht nur die Haut.", "Es ist verschlossen, ohne Ausweg."],
          en: ["The fire is attributed to Allah, stressing its seriousness.", "It reaches the inner self, not only the skin.", "It is closed in, with no way out."],
          ar: ["أضيفت النار إلى الله تعظيمًا لشأنها.", "تبلغ الباطن لا الجلد فقط.", "مؤصدة لا مخرج منها."],
        },
        takeaway: { de: "Bitten Sie jemanden um Verzeihung, über den Sie schlecht gesprochen haben.", en: "Ask forgiveness of someone you have spoken badly about.", ar: "استسمح من تكلمت فيه بسوء." },
        questions: {
          de: ["Warum trifft die Strafe gerade das Herz?"],
          en: ["Why does the punishment strike the heart in particular?"],
          ar: ["لماذا تبلغ العقوبة الفؤاد خاصة؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "wahidi"],
    review: DRAFT,
  },

  // 105 al-Fīl (5)
  {
    s: 105,
    theme: {
      de: "Allah schützt Sein Haus und macht die Pläne der Mächtigen zunichte, wenn Er will, mit den unscheinbarsten Mitteln.",
      en: "Allah protects His House and brings the schemes of the mighty to nothing when He wills, by the humblest means.",
      ar: "الله يحمي بيته ويبطل كيد الأقوياء متى شاء بأضعف الأسباب.",
    },
    context: {
      de: "Mekkanisch; sie erinnert an das Heer mit dem Elefanten, das im Geburtsjahr des Propheten ﷺ gegen Mekka zog, ein den Zuhörern bekanntes Ereignis.",
      en: "Meccan; it recalls the army with the elephant that marched on Mecca in the year of the Prophet's ﷺ birth, an event well known to its listeners.",
      ar: "مكية، تذكّر بأصحاب الفيل الذين قصدوا مكة عام مولد النبي ﷺ، وهي حادثة يعرفها السامعون.",
    },
    connects: {
      de: "Al-Humaza zeigt den Hochmut des Einzelnen, al-Fīl die Vernichtung eines hochmütigen Heeres. Quraysh folgt eng: Viele Gelehrte sehen beide Suren als zusammengehörig, da der Schutz des Hauses die Sicherheit Qurayschs begründete.",
      en: "Al-Humaza shows individual arrogance, al-Fil the destruction of an arrogant army. Quraysh follows closely: many scholars see the two surahs as a pair, since the protection of the House grounded Quraysh's security.",
      ar: "الهمزة كبر الفرد، والفيل هلاك جيش متكبر، وتليها قريش متصلة بها عند كثيرين، إذ حماية البيت أساس أمن قريش.",
    },
    lessons: {
      de: [
        "Allahs Plan übertrifft jede militärische Überlegenheit.",
        "Geschichte ist eine Quelle der Mahnung.",
        "Schwache Geschöpfe können Werkzeuge göttlicher Macht sein.",
        "Allah bewahrt, was Ihm geweiht ist.",
      ],
      en: [
        "Allah's plan surpasses any military superiority.",
        "History is a source of admonition.",
        "Weak creatures can be instruments of divine power.",
        "Allah preserves what is consecrated to Him.",
      ],
      ar: [
        "تدبير الله فوق كل تفوق عسكري.",
        "التاريخ موعظة.",
        "قد تكون أضعف المخلوقات جندًا لله.",
        "الله يحفظ ما نُسب إليه.",
      ],
    },
    questions: {
      de: ["Welche Bedrohung erscheint Ihnen übermächtig, obwohl Allah größer ist?", "Was lehrt Sie dieses Ereignis über Vertrauen?"],
      en: ["Which threat seems overwhelming to you, though Allah is greater?", "What does this event teach you about trust?"],
      ar: ["أي خطر يبدو لك قاهرًا والله أكبر منه؟", "ماذا تعلمك هذه الحادثة عن التوكل؟"],
    },
    sections: [
      {
        from: 1, to: 2,
        title: { de: "Der vereitelte Plan", en: "The foiled scheme", ar: "الكيد المضلَّل" },
        lessons: {
          de: ["Die Frage lädt zum Nachdenken über ein bekanntes Ereignis ein.", "Ein mächtiger Plan kann völlig in die Irre gehen."],
          en: ["The question invites reflection on a known event.", "A mighty plan can go completely astray."],
          ar: ["السؤال دعوة للتأمل في حدث معروف.", "قد يضل أقوى الكيد تمامًا."],
        },
        takeaway: { de: "Erinnern Sie sich in Angst daran, dass Allah Pläne vereiteln kann.", en: "In times of fear, remember that Allah can foil schemes.", ar: "تذكر عند الخوف أن الله يبطل الكيد." },
        questions: {
          de: ["Wann haben Sie erlebt, dass Allah eine Gefahr abgewendet hat?"],
          en: ["When have you experienced Allah averting a danger?"],
          ar: ["متى رأيت الله يدفع عنك خطرًا؟"],
        },
      },
      {
        from: 3, to: 5,
        title: { de: "Die Vögel und das Ende des Heeres", en: "The birds and the army's end", ar: "الطير وهلاك الجيش" },
        lessons: {
          de: ["Allah sendet Vögel in Scharen.", "Ein großes Heer wird wie abgefressenes Laub.", "Hochmut endet in Bedeutungslosigkeit."],
          en: ["Allah sends birds in flocks.", "A great army becomes like eaten-up straw.", "Arrogance ends in insignificance."],
          ar: ["أرسل الله طيرًا أبابيل.", "صار الجيش العظيم كعصف مأكول.", "عاقبة الكبر الهوان."],
        },
        takeaway: { de: "Vertrauen Sie in einer schweren Lage auf Allah und tun Sie zugleich das Mögliche.", en: "In a difficult situation, trust in Allah while doing what you can.", ar: "توكل على الله في الشدة مع الأخذ بالممكن." },
        questions: {
          de: ["Was bedeutet es, dass Allah das Kleine gegen das Große einsetzt?"],
          en: ["What does it mean that Allah employs the small against the great?"],
          ar: ["ما دلالة أن يسلط الله الصغير على الكبير؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari"],
    review: DRAFT,
  },

  // 106 Quraysh (4)
  {
    s: 106,
    theme: {
      de: "Sicherheit und Versorgung sind Gaben Allahs; der angemessene Dank dafür ist, den Herrn dieses Hauses anzubeten.",
      en: "Security and provision are gifts of Allah; the fitting thanks is to worship the Lord of this House.",
      ar: "الأمن والرزق نعمتان من الله، وشكرهما عبادة رب هذا البيت.",
    },
    context: {
      de: "Mekkanisch; sie spricht die Handelsreisen der Quraysch im Winter und Sommer an.",
      en: "Meccan; it refers to the Quraysh's trading journeys in winter and summer.",
      ar: "مكية، تذكر رحلتي قريش في الشتاء والصيف.",
    },
    connects: {
      de: "Al-Fīl zeigt den Schutz des Hauses, Quraysh die Folge: Sicherheit und Handel. Al-Māʿūn zeigt dann, wie Anbetung ohne Mitgefühl hohl wird.",
      en: "Al-Fil shows the protection of the House, Quraysh its result: security and trade. Al-Maʿun then shows how worship without compassion becomes hollow.",
      ar: "الفيل حماية البيت، وقريش ثمرتها من أمن وتجارة، ثم الماعون يبين أن العبادة بلا رحمة جوفاء.",
    },
    lessons: {
      de: [
        "Vertraute Gewohnheiten sind selbst eine Gabe.",
        "Wirtschaftliche Sicherheit ist ein Geschenk Allahs.",
        "Dankbarkeit zeigt sich in Anbetung.",
        "Nahrung und Frieden gehören zu den Grundbedürfnissen, die Allah gewährt.",
      ],
      en: [
        "Familiar routines are themselves a blessing.",
        "Economic security is a gift of Allah.",
        "Gratitude shows itself in worship.",
        "Food and safety are basic needs that Allah grants.",
      ],
      ar: [
        "الإلف المعتاد نعمة بذاته.",
        "الأمن الاقتصادي هبة من الله.",
        "الشكر يظهر في العبادة.",
        "الطعام والأمن حاجتان أساسيتان يمن الله بهما.",
      ],
    },
    questions: {
      de: ["Welche Routine in Ihrem Leben ist eine unerkannte Gabe?", "Wie danken Sie für Ihre Sicherheit?"],
      en: ["Which routine in your life is an unrecognised blessing?", "How do you give thanks for your security?"],
      ar: ["أي عادة في حياتك نعمة لم تنتبه لها؟", "كيف تشكر نعمة أمنك؟"],
    },
    sections: [
      {
        from: 1, to: 2,
        title: { de: "Die vertrauten Reisen", en: "The familiar journeys", ar: "الإيلاف والرحلتان" },
        lessons: {
          de: ["Allah ermöglichte den Quraysch sichere Handelsreisen.", "Was selbstverständlich wirkt, ist von Allah gefügt."],
          en: ["Allah enabled the Quraysh to make safe trading journeys.", "What seems a matter of course is arranged by Allah."],
          ar: ["يسر الله لقريش رحلات تجارة آمنة.", "ما يبدو معتادًا هو من تدبير الله."],
        },
        takeaway: { de: "Danken Sie heute ausdrücklich für Ihre Arbeit und Ihre Wege.", en: "Today, give explicit thanks for your work and your daily journeys.", ar: "اشكر الله اليوم صراحة على عملك وطرقك." },
        questions: {
          de: ["Welche Ihrer regelmäßigen Wege verdanken Sie der Sicherheit, die Allah gibt?"],
          en: ["Which of your regular journeys do you owe to the safety Allah gives?"],
          ar: ["أي رحلاتك المعتادة تدين فيها بالأمن لله؟"],
        },
      },
      {
        from: 3, to: 4,
        title: { de: "Der Herr dieses Hauses", en: "The Lord of this House", ar: "رب هذا البيت" },
        lessons: {
          de: ["Gaben verpflichten zur Anbetung des Gebenden.", "Speisung vor Hunger und Sicherheit vor Furcht sind Kern des Wohlergehens."],
          en: ["Blessings oblige worship of the Giver.", "Feeding against hunger and safety against fear are the core of well-being."],
          ar: ["النعم توجب عبادة المنعم.", "الإطعام من جوع والأمن من خوف أساس العافية."],
        },
        takeaway: { de: "Verrichten Sie das nächste Gebet als bewussten Dank für Nahrung und Sicherheit.", en: "Perform your next prayer as conscious thanks for food and safety.", ar: "صلِّ صلاتك القادمة شكرًا واعيًا على الطعام والأمن." },
        questions: {
          de: ["Wie würde Ihr Leben ohne Sicherheit aussehen?"],
          en: ["What would your life look like without safety?"],
          ar: ["كيف تكون حياتك بلا أمن؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari"],
    review: DRAFT,
  },

  // 107 al-Māʿūn (7)
  {
    s: 107,
    theme: {
      de: "Wer das Jenseits leugnet, vernachlässigt die Schwachen; und Gebet ohne Aufrichtigkeit und ohne Hilfsbereitschaft verliert seinen Sinn.",
      en: "Whoever denies the hereafter neglects the weak; and prayer without sincerity and without helpfulness loses its meaning.",
      ar: "من كذب بالدين أهمل الضعفاء، والصلاة بلا إخلاص ولا إحسان تفقد معناها.",
    },
    context: {
      de: "Umstritten: Einige halten sie für mekkanisch, andere für medinensisch; manche sehen die Verse 1–3 als mekkanisch und 4–7 als medinensisch, da Heuchelei im Gebet eher in Medina auftrat.",
      en: "Disputed: some consider it Meccan, others Medinan; some see verses 1–3 as Meccan and 4–7 as Medinan, since hypocrisy in prayer arose more in Medina.",
      ar: "مختلف فيها: قيل مكية وقيل مدنية، وقيل الآيات ١–٣ مكية و٤–٧ مدنية لأن الرياء في الصلاة ظهر في المدينة.",
    },
    connects: {
      de: "Quraysh fordert die Anbetung des Herrn, der speist; al-Māʿūn tadelt den, der andere nicht speist. Al-Kawthar folgt mit dem Gegenbild: reichliche Gabe, Gebet und Opfer.",
      en: "Quraysh calls for worship of the Lord who feeds; al-Maʿun censures the one who does not feed others. Al-Kawthar follows with the opposite: abundant gift, prayer and sacrifice.",
      ar: "قريش تدعو لعبادة رب أطعم، والماعون تذم من لا يطعم، ثم الكوثر المقابل: عطاء وصلاة ونحر.",
    },
    lessons: {
      de: [
        "Glaube an das Jenseits zeigt sich im Umgang mit Waisen und Armen.",
        "Wer nicht zur Speisung anregt, ist mitverantwortlich.",
        "Gebet kann äußerlich verrichtet und innerlich vernachlässigt werden.",
        "Auch kleine Alltagshilfe zu verweigern wird getadelt.",
      ],
      en: [
        "Belief in the hereafter shows in how orphans and the poor are treated.",
        "Whoever does not encourage feeding shares responsibility.",
        "Prayer can be performed outwardly and neglected inwardly.",
        "Refusing even small everyday help is censured.",
      ],
      ar: [
        "الإيمان بالجزاء يظهر في معاملة اليتيم والمسكين.",
        "من لا يحض على الإطعام شريك في التقصير.",
        "قد تؤدى الصلاة ظاهرًا ويُسهى عنها باطنًا.",
        "منع العون اليسير مذموم.",
      ],
    },
    questions: {
      de: ["Wie behandeln Sie Menschen, die Ihnen nichts zurückgeben können?", "Ist Ihr Gebet bei Allah oder bei den Blicken der Menschen?"],
      en: ["How do you treat people who cannot repay you?", "Is your prayer with Allah or with people's eyes?"],
      ar: ["كيف تعامل من لا يستطيع أن يردّ لك؟", "هل صلاتك لله أم لأعين الناس؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Der Leugner und die Schwachen", en: "The denier and the weak", ar: "المكذب والضعفاء" },
        lessons: {
          de: ["Leugnung des Gerichts zeigt sich in Härte gegen Waisen.", "Wer selbst nicht gibt, ermutigt auch andere nicht.", "Glaube hat soziale Folgen."],
          en: ["Denial of the judgement shows in harshness toward orphans.", "Whoever does not give also does not encourage others.", "Faith has social consequences."],
          ar: ["التكذيب بالدين يظهر في دعّ اليتيم.", "من لا يعطي لا يحض غيره.", "للإيمان آثار اجتماعية."],
        },
        takeaway: { de: "Unterstützen Sie diese Woche eine Waise oder einen bedürftigen Menschen konkret.", en: "This week, support an orphan or a person in need concretely.", ar: "ادعم هذا الأسبوع يتيمًا أو محتاجًا دعمًا ملموسًا." },
        questions: {
          de: ["Wen in Ihrer Nähe übersehen Sie?"],
          en: ["Whom near you do you overlook?"],
          ar: ["من حولك تغفل عنه؟"],
        },
      },
      {
        from: 4, to: 7,
        title: { de: "Gebet ohne Herz", en: "Prayer without heart", ar: "صلاة بلا قلب" },
        lessons: {
          de: ["Getadelt wird die Nachlässigkeit gegenüber dem Gebet, nicht das Vergessen im Gebet.", "Augendienerei leert die Tat.", "Kleine Gefälligkeiten gehören zur Religion."],
          en: ["What is censured is negligence of prayer, not forgetfulness within it.", "Showing off empties the deed.", "Small favours are part of religion."],
          ar: ["المذموم السهو عن الصلاة لا السهو فيها.", "الرياء يفرغ العمل.", "المعروف اليسير من الدين."],
        },
        takeaway: { de: "Leihen oder schenken Sie heute etwas Alltägliches bereitwillig.", en: "Willingly lend or give something everyday today.", ar: "أعر أو أعط اليوم شيئًا يسيرًا بطيب نفس." },
        questions: {
          de: ["Was lenkt Sie im Gebet am meisten ab?"],
          en: ["What distracts you most in prayer?"],
          ar: ["ما أكثر ما يشغلك في الصلاة؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "qurtubi"],
    review: DRAFT,
  },

  // 108 al-Kawthar (3)
  {
    s: 108,
    theme: {
      de: "Allah hat dem Propheten ﷺ überreiches Gut gegeben; die Antwort darauf ist Gebet und Opfer allein für Ihn, und abgeschnitten ist sein Hasser, nicht er.",
      en: "Allah has given the Prophet ﷺ abundant good; the response is prayer and sacrifice for Him alone, and it is his hater who is cut off, not he.",
      ar: "أعطى الله نبيه ﷺ الخير الكثير، فشكره الصلاة والنحر له وحده، والمبغض هو الأبتر لا هو.",
    },
    context: {
      de: "Nach der Mehrheit mekkanisch; einige halten sie für medinensisch. Sie ist die kürzeste Sure des Qurʾān.",
      en: "Meccan according to the majority; some consider it Medinan. It is the shortest surah of the Qurʾān.",
      ar: "مكية عند الجمهور، وقيل مدنية، وهي أقصر سور القرآن.",
    },
    asbab: {
      de: "Al-Wāḥidī und aṭ-Ṭabarī berichten, ein Gegner habe den Propheten ﷺ nach dem Tod seiner Söhne als „abgeschnitten“ verspottet; dass der Prophet ﷺ al-Kawthar als Fluss im Paradies erklärte, berichtet Muslim von Anas.",
      en: "Al-Wahidi and al-Tabari report that an opponent mocked the Prophet ﷺ as \"cut off\" after his sons died; that the Prophet ﷺ explained al-Kawthar as a river in Paradise is reported by Muslim from Anas.",
      ar: "ذكر الواحدي والطبري أن أحد المشركين عيّر النبي ﷺ بالأبتر بعد موت أبنائه، وتفسيره ﷺ الكوثر بنهر في الجنة رواه مسلم عن أنس.",
    },
    connects: {
      de: "Al-Māʿūn tadelt den Geizigen und den Augendiener; al-Kawthar zeigt den reich Beschenkten, der aufrichtig betet und opfert. Al-Kāfirūn folgt mit der klaren Trennung im Gottesdienst.",
      en: "Al-Maʿun censures the miser and the show-off; al-Kawthar shows the richly gifted one who prays and sacrifices sincerely. Al-Kafirun follows with a clear separation in worship.",
      ar: "الماعون ذم البخيل المرائي، والكوثر صورة المعطى الذي يصلي وينحر مخلصًا، ثم الكافرون البراءة في العبادة.",
    },
    lessons: {
      de: [
        "Allahs Gabe an den Propheten ﷺ ist überreich.",
        "Dank zeigt sich in Gebet und Opfer allein für Allah.",
        "Spott über Verlust trifft am Ende den Spötter selbst.",
        "Bleibender Wert liegt nicht in Nachkommen allein, sondern in der Botschaft.",
      ],
      en: [
        "Allah's gift to the Prophet ﷺ is abundant.",
        "Thanks show in prayer and sacrifice for Allah alone.",
        "Mockery of loss in the end strikes the mocker himself.",
        "Lasting worth lies not in offspring alone but in the message.",
      ],
      ar: [
        "عطاء الله لنبيه ﷺ كثير.",
        "الشكر صلاة ونحر لله وحده.",
        "من عيّر بالمصيبة عادت عليه.",
        "البقاء ليس بالذرية وحدها بل بالرسالة.",
      ],
    },
    questions: {
      de: ["Welche Gaben haben Sie erhalten, die Sie zu wenig sehen?", "Wie gehen Sie mit Spott über Ihre Verluste um?"],
      en: ["Which gifts have you received that you see too little?", "How do you deal with mockery of your losses?"],
      ar: ["أي عطايا نلتها ولا تراها؟", "كيف تتعامل مع من يعيرك بمصيبتك؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Gabe, Dank und der Abgeschnittene", en: "Gift, gratitude and the one cut off", ar: "العطاء والشكر والأبتر" },
        lessons: {
          de: ["Trost für den Propheten ﷺ in einer Zeit der Trauer.", "Auf Gaben folgt Gottesdienst als Antwort.", "Allah verteidigt Seinen Gesandten."],
          en: ["Consolation for the Prophet ﷺ in a time of grief.", "Gifts are answered with worship.", "Allah defends His Messenger."],
          ar: ["تسلية للنبي ﷺ في وقت حزن.", "يُقابَل العطاء بالعبادة.", "الله يدافع عن رسوله."],
        },
        takeaway: { de: "Verrichten Sie heute ein zusätzliches Gebet als Dank für eine bestimmte Gabe.", en: "Pray an extra prayer today in thanks for a specific blessing.", ar: "صلِّ اليوم صلاة نافلة شكرًا على نعمة بعينها." },
        questions: {
          de: ["Was tröstet Sie, wenn andere Ihren Wert bestreiten?", "Was bleibt von Ihnen, wenn Sie gehen?"],
          en: ["What consoles you when others deny your worth?", "What of you will remain when you are gone?"],
          ar: ["ما الذي يسليك إذا انتقص الناس قدرك؟", "ماذا يبقى منك بعد رحيلك؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "wahidi", "tabari"],
    review: DRAFT,
  },

  // 109 al-Kāfirūn (6)
  {
    s: 109,
    theme: {
      de: "Im Gottesdienst gibt es keinen Kompromiss: Der Prophet ﷺ trennt seine Anbetung klar von der der Götzendiener, ohne Zwang auszuüben.",
      en: "In worship there is no compromise: the Prophet ﷺ separates his worship clearly from that of the idolaters, without coercion.",
      ar: "لا مساومة في العبادة: يفاصل النبي ﷺ المشركين في عبادته بوضوح دون إكراه.",
    },
    context: {
      de: "Mekkanisch, nach der Mehrheit; einige halten sie für medinensisch.",
      en: "Meccan according to the majority; some consider it Medinan.",
      ar: "مكية عند الجمهور، وقيل مدنية.",
    },
    asbab: {
      de: "Aṭ-Ṭabarī und al-Wāḥidī berichten, führende Quraysch hätten vorgeschlagen, abwechselnd ein Jahr ihre Götter und ein Jahr Allah anzubeten; die Sure kam als Antwort darauf.",
      en: "Al-Tabari and al-Wahidi report that leading Quraysh proposed worshipping their gods one year and Allah the next; the surah came as the answer.",
      ar: "ذكر الطبري والواحدي أن سادة قريش عرضوا أن يُعبد آلهتهم عامًا والله عامًا، فنزلت السورة جوابًا.",
    },
    connects: {
      de: "Al-Kawthar befiehlt Gebet und Opfer allein für Allah; al-Kāfirūn grenzt diese Anbetung klar ab. An-Naṣr folgt mit dem Sieg, der dieser Standhaftigkeit folgte.",
      en: "Al-Kawthar commands prayer and sacrifice for Allah alone; al-Kafirun clearly delimits this worship. An-Nasr follows with the victory that came after this steadfastness.",
      ar: "الكوثر أمر بإخلاص الصلاة والنحر، والكافرون تحديد لهذه العبادة، ثم النصر ثمرة هذا الثبات.",
    },
    lessons: {
      de: [
        "Tawḥīd duldet keine Vermischung im Gottesdienst.",
        "Wiederholung bekräftigt die Endgültigkeit der Absage.",
        "Klarheit im Glauben ist kein Zwang gegenüber anderen.",
        "Standhaftigkeit unter Druck schützt die Religion.",
      ],
      en: [
        "Tawhid tolerates no mixing in worship.",
        "Repetition affirms the finality of the refusal.",
        "Clarity in faith is not coercion of others.",
        "Steadfastness under pressure protects religion.",
      ],
      ar: [
        "التوحيد لا يقبل خلطًا في العبادة.",
        "التكرار يؤكد قطع المساومة.",
        "الوضوح في العقيدة ليس إكراهًا للآخرين.",
        "الثبات تحت الضغط صيانة للدين.",
      ],
    },
    questions: {
      de: ["Wo werden Sie zu Kompromissen in Grundsätzen gedrängt?", "Wie verbinden Sie Klarheit mit freundlichem Umgang?"],
      en: ["Where are you pushed to compromise on principles?", "How do you combine clarity with kindness?"],
      ar: ["أين تُدفع إلى التنازل عن المبادئ؟", "كيف تجمع بين الوضوح وحسن المعاملة؟"],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Die klare Absage", en: "The clear refusal", ar: "البراءة الواضحة" },
        lessons: {
          de: ["Die Anrede ist direkt und unmissverständlich.", "Gegenwart und Zukunft werden gleichermaßen ausgeschlossen.", "Wahrheit verhandelt nicht über ihren Kern."],
          en: ["The address is direct and unambiguous.", "Present and future are both excluded.", "Truth does not bargain over its core."],
          ar: ["الخطاب مباشر لا لبس فيه.", "نفي في الحال والاستقبال.", "الحق لا يساوم على أصله."],
        },
        takeaway: { de: "Benennen Sie für sich einen Grundsatz, den Sie unter keinem Druck aufgeben.", en: "Name for yourself one principle you will not give up under any pressure.", ar: "حدد لنفسك مبدأً لا تتنازل عنه تحت أي ضغط." },
        questions: {
          de: ["Warum wird die Absage zweimal ausgesprochen?"],
          en: ["Why is the refusal stated twice?"],
          ar: ["لماذا كُررت البراءة؟"],
        },
      },
      {
        from: 6, to: 6,
        title: { de: "Jedem seine Religion", en: "To each their religion", ar: "لكم دينكم ولي دين" },
        lessons: {
          de: ["Klare Trennung im Glauben, ohne Zwang.", "Die Verantwortung für den eigenen Weg liegt bei jedem selbst."],
          en: ["Clear separation in faith, without coercion.", "Responsibility for one's path lies with each person."],
          ar: ["مفاصلة في العقيدة بلا إكراه.", "كل مسؤول عن طريقه."],
        },
        takeaway: { de: "Begegnen Sie Andersgläubigen heute freundlich, ohne Ihren Glauben zu verwischen.", en: "Meet people of other faiths kindly today without blurring your own faith.", ar: "عامل غير المسلمين اليوم بلطف دون تمييع عقيدتك." },
        questions: {
          de: ["Wie unterscheiden Sie Toleranz von Gleichgültigkeit?"],
          en: ["How do you distinguish tolerance from indifference?"],
          ar: ["كيف تفرق بين التسامح والتمييع؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari", "wahidi"],
    review: DRAFT,
  },

  // 110 an-Naṣr (3)
  {
    s: 110,
    theme: {
      de: "Wenn Allahs Hilfe und der Sieg kommen und die Menschen in Scharen eintreten, ist die Antwort Lobpreis und Bitte um Vergebung, nicht Stolz.",
      en: "When Allah's help and victory come and people enter in crowds, the response is praise and seeking forgiveness, not pride.",
      ar: "إذا جاء نصر الله والفتح ودخل الناس أفواجًا فالجواب تسبيح واستغفار لا فخر.",
    },
    context: {
      de: "Medinensisch, eine der letzten Offenbarungen; viele verbinden den Sieg mit der Eroberung Mekkas.",
      en: "Medinan, among the last revelations; many link the victory to the conquest of Mecca.",
      ar: "مدنية، من آخر ما نزل، ويربط كثيرون الفتح بفتح مكة.",
    },
    asbab: {
      de: "Al-Buchārī berichtet, dass Ibn ʿAbbās die Sure vor ʿUmar als Hinweis auf das nahende Lebensende des Propheten ﷺ deutete und ʿUmar dem zustimmte.",
      en: "Al-Bukhari reports that Ibn ʿAbbas interpreted the surah before ʿUmar as a sign of the Prophet's ﷺ approaching end, and ʿUmar agreed.",
      ar: "روى البخاري أن ابن عباس فسرها بحضرة عمر بأنها أجَل رسول الله ﷺ أعلمه إياه، فوافقه عمر.",
    },
    connects: {
      de: "Al-Kāfirūn steht für die Standhaftigkeit in der Zeit der Schwäche, an-Naṣr für den Sieg danach. Al-Masad zeigt das Ende eines der heftigsten Gegner.",
      en: "Al-Kafirun stands for steadfastness in weakness, an-Nasr for the victory after. Al-Masad shows the end of one of the fiercest opponents.",
      ar: "الكافرون ثبات في الضعف، والنصر الفتح بعده، ثم المسد مآل أشد الخصوم.",
    },
    lessons: {
      de: [
        "Sieg ist Hilfe von Allah, nicht eigene Leistung.",
        "Erfolg verlangt mehr Demut, nicht weniger.",
        "Das Erreichen eines Ziels kann ein Hinweis auf das Ende sein.",
        "Allah nimmt die Reue stets an.",
      ],
      en: [
        "Victory is help from Allah, not one's own achievement.",
        "Success demands more humility, not less.",
        "Reaching a goal can be a sign of the end.",
        "Allah ever accepts repentance.",
      ],
      ar: [
        "النصر من الله لا من كسب العبد.",
        "النجاح يستوجب مزيد تواضع.",
        "بلوغ الغاية قد يكون إيذانًا بالنهاية.",
        "الله تواب يقبل التوبة.",
      ],
    },
    questions: {
      de: ["Wie reagieren Sie, wenn Ihnen etwas gelingt?", "Warum wird gerade nach dem Sieg um Vergebung gebeten?"],
      en: ["How do you react when something succeeds for you?", "Why is forgiveness sought precisely after victory?"],
      ar: ["كيف تتصرف إذا نجحت في أمر؟", "لماذا الاستغفار بعد النصر تحديدًا؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Sieg, Lobpreis und Vergebung", en: "Victory, praise and forgiveness", ar: "النصر والتسبيح والاستغفار" },
        lessons: {
          de: ["Hilfe wird Allah zugeschrieben.", "Menschenmengen, die eintreten, sind eine Frucht langer Geduld.", "Lobpreis und Vergebungsbitte krönen die Arbeit."],
          en: ["Help is attributed to Allah.", "Crowds entering are the fruit of long patience.", "Praise and seeking forgiveness crown the work."],
          ar: ["يُنسب النصر إلى الله.", "دخول الناس أفواجًا ثمرة صبر طويل.", "التسبيح والاستغفار ختام العمل."],
        },
        takeaway: { de: "Schließen Sie jede erledigte Aufgabe heute mit Lobpreis und Bitte um Vergebung ab.", en: "Close every completed task today with praise and seeking forgiveness.", ar: "اختم كل عمل تنجزه اليوم بالتسبيح والاستغفار." },
        questions: {
          de: ["Wofür sollten Sie nach einem Erfolg um Vergebung bitten?", "Wie zeigt sich Demut im Sieg?"],
          en: ["For what should you seek forgiveness after a success?", "How does humility show in victory?"],
          ar: ["مِمَّ تستغفر بعد النجاح؟", "كيف يظهر التواضع في النصر؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "qurtubi"],
    review: DRAFT,
  },

  // 111 al-Masad (5)
  {
    s: 111,
    theme: {
      de: "Verwandtschaft und Besitz retten nicht vor dem Verlust, wenn man sich der Wahrheit entgegenstellt; Abū Lahab und seine Frau sind das Beispiel.",
      en: "Kinship and wealth do not save from loss when one opposes the truth; Abu Lahab and his wife are the example.",
      ar: "لا تنجي القرابة ولا المال من الخسران لمن عادى الحق، وأبو لهب وامرأته مثال ذلك.",
    },
    context: {
      de: "Mekkanisch, aus der Zeit der ersten öffentlichen Verkündigung.",
      en: "Meccan, from the time of the first public proclamation.",
      ar: "مكية، من زمن الجهر بالدعوة.",
    },
    asbab: {
      de: "Al-Buchārī und Muslim berichten von Ibn ʿAbbās, dass der Prophet ﷺ seine Sippe auf dem Hügel aṣ-Ṣafā zusammenrief und Abū Lahab ihn daraufhin verwünschte; die Sure kam als Antwort.",
      en: "Al-Bukhari and Muslim report from Ibn ʿAbbas that the Prophet ﷺ gathered his clan on the hill of al-Safa and Abu Lahab cursed him; the surah came as the answer.",
      ar: "روى البخاري ومسلم عن ابن عباس أن النبي ﷺ جمع قومه على الصفا فدعا عليه أبو لهب، فنزلت السورة.",
    },
    connects: {
      de: "An-Naṣr zeigt den Sieg der Wahrheit, al-Masad den Untergang ihres Gegners. Al-Ikhlāṣ folgt mit dem reinen Bekenntnis, das Abū Lahab bekämpfte.",
      en: "An-Nasr shows the victory of the truth, al-Masad the ruin of its opponent. Al-Ikhlas follows with the pure creed that Abu Lahab fought.",
      ar: "النصر غلبة الحق، والمسد هلاك عدوه، ثم الإخلاص العقيدة الخالصة التي حاربها.",
    },
    lessons: {
      de: [
        "Nähe zum Propheten ﷺ durch Blut nützt ohne Glauben nicht.",
        "Besitz und Erwerb schützen nicht vor dem Urteil Allahs.",
        "Wer Feindschaft schürt, trägt selbst die Last.",
        "Die Sure ist ein Zeichen: Abū Lahab starb ohne Glauben, wie sie andeutete.",
      ],
      en: [
        "Blood kinship with the Prophet ﷺ is of no use without faith.",
        "Wealth and earnings do not protect from Allah's judgement.",
        "Whoever stirs up hostility carries the burden himself.",
        "The surah is a sign: Abu Lahab died without faith, as it indicated.",
      ],
      ar: [
        "قرابة النسب من النبي ﷺ لا تنفع بلا إيمان.",
        "المال والكسب لا يدفعان حكم الله.",
        "من أوقد العداوة حمل وزرها.",
        "في السورة آية: مات أبو لهب على كفره كما أشارت.",
      ],
    },
    questions: {
      de: ["Worauf verlassen Sie sich außer auf Ihren Glauben?", "Tragen Sie zu Streit zwischen Menschen bei?"],
      en: ["What do you rely on besides your faith?", "Do you contribute to strife between people?"],
      ar: ["على أي شيء تتكل غير إيمانك؟", "هل تسهم في إيقاد الخصومة بين الناس؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Das Verderben Abū Lahabs", en: "The ruin of Abu Lahab", ar: "تباب أبي لهب" },
        lessons: {
          de: ["Feindschaft gegen die Wahrheit führt zum Verlust.", "Besitz kann den Verlust nicht abwenden.", "Allah antwortet für Seinen Gesandten."],
          en: ["Hostility to the truth leads to loss.", "Wealth cannot avert the loss.", "Allah answers on behalf of His Messenger."],
          ar: ["معاداة الحق تفضي إلى الخسران.", "المال لا يغني شيئًا.", "الله يجيب عن رسوله."],
        },
        takeaway: { de: "Prüfen Sie, ob Sie etwas mehr vertrauen als Allah.", en: "Check whether you trust anything more than Allah.", ar: "انظر هل تثق بشيء أكثر من الله." },
        questions: {
          de: ["Warum genügt Verwandtschaft nicht?"],
          en: ["Why is kinship not enough?"],
          ar: ["لماذا لا تكفي القرابة؟"],
        },
      },
      {
        from: 4, to: 5,
        title: { de: "Die Trägerin des Brennholzes", en: "The carrier of firewood", ar: "حمالة الحطب" },
        lessons: {
          de: ["Viele Gelehrte deuten das Brennholz als Bild für das Schüren von Zwietracht.", "Wer Böses unterstützt, teilt das Ende.", "Mann und Frau werden je für ihr eigenes Tun zur Rechenschaft gezogen."],
          en: ["Many scholars read the firewood as an image for fanning discord.", "Whoever supports evil shares its end.", "Husband and wife are each accountable for their own deeds."],
          ar: ["فسر كثير من العلماء الحطب بالنميمة وإيقاد الفتنة.", "من أعان على الشر شاركه المصير.", "كلٌّ من الزوجين مسؤول عن عمله."],
        },
        takeaway: { de: "Geben Sie heute kein Gerede weiter, das Menschen entzweit.", en: "Today, pass on no talk that divides people.", ar: "لا تنقل اليوم كلامًا يفرق بين الناس." },
        questions: {
          de: ["Wo fachen Sie, vielleicht unbewusst, Konflikte an?"],
          en: ["Where do you, perhaps unknowingly, fan conflicts?"],
          ar: ["أين توقد الخلاف ولو دون قصد؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "wahidi"],
    review: DRAFT,
  },

  // 112 al-Ikhlāṣ (4)
  {
    s: 112,
    theme: {
      de: "Die reinste Beschreibung Allahs: Er ist einzig, auf Ihn ist alles angewiesen, Er zeugt nicht und ist nicht gezeugt, und nichts ist Ihm gleich.",
      en: "The purest description of Allah: He is one, all depend on Him, He neither begets nor is begotten, and nothing is equal to Him.",
      ar: "أنقى وصف لله: أحد، صمد يُقصد في الحوائج، لم يلد ولم يولد، ولا كفء له.",
    },
    context: {
      de: "Nach der Mehrheit mekkanisch; einige halten sie für medinensisch. Nach einem Bericht bei al-Buchārī entspricht sie einem Drittel des Qurʾān.",
      en: "Meccan according to the majority; some consider it Medinan. According to a narration in al-Bukhari it equals a third of the Qurʾān.",
      ar: "مكية عند الجمهور، وقيل مدنية، وفي البخاري أنها تعدل ثلث القرآن.",
    },
    asbab: {
      de: "At-Tirmidhī und Aḥmad berichten von Ubayy ibn Kaʿb, die Götzendiener hätten den Propheten ﷺ gebeten, die Abstammung seines Herrn zu beschreiben; die Sure kam als Antwort.",
      en: "Al-Tirmidhi and Ahmad report from Ubayy ibn Kaʿb that the idolaters asked the Prophet ﷺ to describe his Lord's lineage; the surah came as the answer.",
      ar: "روى الترمذي وأحمد عن أبي بن كعب أن المشركين سألوا النبي ﷺ أن ينسب لهم ربه، فنزلت السورة.",
    },
    connects: {
      de: "Al-Masad zeigt den Gegner des Tawḥīd, al-Ikhlāṣ den Tawḥīd selbst. Al-Falaq und an-Nās folgen mit der Zuflucht bei diesem einzigen Herrn.",
      en: "Al-Masad shows the opponent of tawhid, al-Ikhlas tawhid itself. Al-Falaq and an-Nas follow with refuge in this one Lord.",
      ar: "المسد خصم التوحيد، والإخلاص التوحيد نفسه، ثم المعوذتان الاستعاذة بهذا الرب الواحد.",
    },
    lessons: {
      de: [
        "Allah ist einzig in Seinem Wesen, Seinen Eigenschaften und Seinem Recht auf Anbetung.",
        "Alles ist auf Ihn angewiesen, Er auf nichts.",
        "Er ist frei von Abstammung und Nachkommen.",
        "Nichts in der Schöpfung ist Ihm gleich.",
      ],
      en: [
        "Allah is unique in His essence, His attributes and His right to worship.",
        "Everything depends on Him; He depends on nothing.",
        "He is free of ancestry and offspring.",
        "Nothing in creation is equal to Him.",
      ],
      ar: [
        "الله واحد في ذاته وصفاته واستحقاقه العبادة.",
        "كل شيء مفتقر إليه، وهو غني عن كل شيء.",
        "منزه عن الوالد والولد.",
        "ليس في الخلق له كفء.",
      ],
    },
    questions: {
      de: ["Wenden Sie sich mit Ihren Anliegen zuerst an Allah?", "Wie verändert dieses Bild Allahs Ihr Gebet?"],
      en: ["Do you turn to Allah first with your needs?", "How does this picture of Allah change your prayer?"],
      ar: ["هل تقصد الله أولًا في حوائجك؟", "كيف تغير هذه المعاني صلاتك؟"],
    },
    sections: [
      {
        from: 1, to: 2,
        title: { de: "Der Eine, auf den alles angewiesen ist", en: "The One upon whom all depend", ar: "الأحد الصمد" },
        lessons: {
          de: ["Der Befehl zu sagen macht das Bekenntnis zur Verkündigung.", "Einzigartigkeit schließt jede Teilhabe aus.", "Aṣ-Ṣamad: der, an den man sich in jeder Not wendet."],
          en: ["The command to say makes the creed a proclamation.", "Uniqueness excludes any partnership.", "Al-Samad: the one turned to in every need."],
          ar: ["الأمر بالقول يجعل العقيدة دعوة.", "الأحدية تنفي كل شريك.", "الصمد: المقصود في كل حاجة."],
        },
        takeaway: { de: "Wenden Sie sich mit dem nächsten Anliegen zuerst im Bittgebet an Allah.", en: "Bring your next need to Allah in supplication first.", ar: "اقصد الله بالدعاء أولًا في حاجتك القادمة." },
        questions: {
          de: ["An wen wenden Sie sich zuerst, wenn Sie etwas brauchen?"],
          en: ["Whom do you turn to first when you need something?"],
          ar: ["إلى من تتوجه أولًا إذا احتجت؟"],
        },
      },
      {
        from: 3, to: 4,
        title: { de: "Weder zeugend noch gezeugt", en: "Neither begetting nor begotten", ar: "لم يلد ولم يولد" },
        lessons: {
          de: ["Allah ist erhaben über jede menschliche Vorstellung von Abstammung.", "Diese Klarheit widerlegt sowohl Götzendienst als auch Lehren von einem Sohn Gottes.", "Nichts kann mit Allah verglichen werden."],
          en: ["Allah is exalted above every human notion of lineage.", "This clarity refutes both idolatry and doctrines of a son of God.", "Nothing can be compared with Allah."],
          ar: ["الله منزه عن كل تصور بشري للنسب.", "هذا الوضوح يرد على الوثنية وعلى دعوى الولد.", "لا يقاس الله بشيء."],
        },
        takeaway: { de: "Lesen Sie die Sure heute dreimal mit bewusstem Nachdenken über jede Eigenschaft.", en: "Recite the surah three times today, reflecting consciously on each attribute.", ar: "اقرأ السورة اليوم ثلاثًا متدبرًا كل صفة." },
        questions: {
          de: ["Welche Vorstellungen von Allah müssen Sie vielleicht reinigen?"],
          en: ["Which notions of Allah might you need to purify?"],
          ar: ["أي تصورات عن الله تحتاج إلى تنقية؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari"],
    review: DRAFT,
  },

  // 113 al-Falaq (5)
  {
    s: 113,
    theme: {
      de: "Zuflucht beim Herrn des Morgens vor äußeren Übeln: dem Bösen der Schöpfung, der Finsternis, der Zauberei und dem Neid.",
      en: "Refuge with the Lord of daybreak from outward harms: the evil of creation, darkness, sorcery and envy.",
      ar: "الاستعاذة برب الفلق من الشرور الخارجية: شر الخلق والظلمة والسحر والحسد.",
    },
    context: {
      de: "Umstritten: Nach einigen mekkanisch, nach anderen medinensisch; sie bildet mit an-Nās die beiden Schutzsuren (al-Muʿawwidhatān).",
      en: "Disputed: some consider it Meccan, others Medinan; with an-Nas it forms the two surahs of refuge (al-Muʿawwidhatan).",
      ar: "مختلف فيها: قيل مكية وقيل مدنية، وهي مع الناس المعوذتان.",
    },
    asbab: {
      de: "Die Zauberei gegen den Propheten ﷺ ist bei al-Buchārī und Muslim überliefert; dass die beiden Schutzsuren dabei herabkamen, berichten al-Wāḥidī und andere, wobei die Gelehrten über diese Verbindung uneins sind.",
      en: "The sorcery against the Prophet ﷺ is narrated in al-Bukhari and Muslim; that the two surahs of refuge came down on that occasion is reported by al-Wahidi and others, and scholars differ over this link.",
      ar: "سحر النبي ﷺ ثابت في البخاري ومسلم، وأما نزول المعوذتين فيه فذكره الواحدي وغيره، وللعلماء في ذلك كلام.",
    },
    connects: {
      de: "Al-Ikhlāṣ beschreibt den einen Herrn, al-Falaq sucht bei Ihm Schutz vor äußeren Übeln, an-Nās vor inneren Einflüsterungen.",
      en: "Al-Ikhlas describes the one Lord, al-Falaq seeks His protection from outward harms, an-Nas from inner whisperings.",
      ar: "الإخلاص وصف الرب الواحد، والفلق الاستعاذة به من الشرور الظاهرة، والناس من الوسوسة الباطنة.",
    },
    lessons: {
      de: [
        "Wer das Licht des Morgens bringt, kann auch jede Dunkelheit vertreiben.",
        "Das Übel liegt in der Schöpfung, Schutz nur beim Schöpfer.",
        "Zauberei und Neid sind reale Gefahren, gegen die man Zuflucht sucht.",
        "Zuflucht ist ein täglicher Akt des Vertrauens.",
      ],
      en: [
        "The one who brings the light of morning can dispel every darkness.",
        "Evil lies in creation; protection lies only with the Creator.",
        "Sorcery and envy are real dangers from which one seeks refuge.",
        "Seeking refuge is a daily act of trust.",
      ],
      ar: [
        "من يفلق الصبح قادر على كشف كل ظلمة.",
        "الشر في المخلوق والحماية عند الخالق.",
        "السحر والحسد خطران حقيقيان يُستعاذ منهما.",
        "الاستعاذة عبادة يومية للتوكل.",
      ],
    },
    questions: {
      de: ["Vor welcher Sorge suchen Sie heute Zuflucht bei Allah?", "Wie schützen Sie sich davor, selbst neidisch zu sein?"],
      en: ["From which worry do you seek refuge with Allah today?", "How do you guard yourself against being envious yourself?"],
      ar: ["من أي هم تستعيذ بالله اليوم؟", "كيف تحمي نفسك من أن تكون حاسدًا؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Der Herr des Morgens und die Finsternis", en: "The Lord of daybreak and the darkness", ar: "رب الفلق والغاسق" },
        lessons: {
          de: ["Der Morgen ist ein Bild für Rettung nach Bedrängnis.", "Jedes Geschöpf kann Schaden bringen, nur Allah schützt.", "Die Nacht birgt Gefahren, die man nicht sieht."],
          en: ["Daybreak is an image of rescue after distress.", "Every creature can bring harm; only Allah protects.", "The night hides dangers one does not see."],
          ar: ["الفلق صورة للفرج بعد الشدة.", "قد يضر كل مخلوق، والحافظ هو الله.", "الليل يخفي أخطارًا لا تُرى."],
        },
        takeaway: { de: "Rezitieren Sie die Sure abends vor dem Schlafen.", en: "Recite the surah in the evening before sleeping.", ar: "اقرأ السورة مساءً قبل النوم." },
        questions: {
          de: ["Was bedeutet es für Sie, dass Allah das Licht hervorbringt?"],
          en: ["What does it mean to you that Allah brings forth the light?"],
          ar: ["ماذا يعني لك أن الله فالق الإصباح؟"],
        },
      },
      {
        from: 4, to: 5,
        title: { de: "Zauberei und Neid", en: "Sorcery and envy", ar: "النفاثات والحاسد" },
        lessons: {
          de: ["Verborgene Übel wie Zauberei werden beim Namen genannt.", "Neid schadet, wenn er zur Tat wird.", "Der Schutz gilt dem Übel, nicht der Angst vor jedem Menschen."],
          en: ["Hidden harms such as sorcery are named.", "Envy harms when it turns into action.", "The protection is from the harm, not a fear of every person."],
          ar: ["تُسمّى الشرور الخفية كالسحر.", "الحسد يضر إذا ظهر أثره.", "الاستعاذة من الشر لا خوف من كل أحد."],
        },
        takeaway: { de: "Wünschen Sie heute jemandem, dessen Gaben Sie beneiden, ausdrücklich Segen.", en: "Today, explicitly wish blessing upon someone whose gifts you envy.", ar: "ادعُ اليوم بالبركة لمن تجد في نفسك غبطة لنعمته." },
        questions: {
          de: ["Wann wird ein Gedanke zum schädlichen Neid?"],
          en: ["When does a thought become harmful envy?"],
          ar: ["متى تصير الخاطرة حسدًا مؤذيًا؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "wahidi"],
    review: DRAFT,
  },

  // 114 an-Nās (6)
  {
    s: 114,
    theme: {
      de: "Zuflucht beim Herrn, König und Gott der Menschen vor dem heimlichen Einflüsterer, der sich zurückzieht, wenn Allah gedacht wird.",
      en: "Refuge with the Lord, King and God of mankind from the stealthy whisperer who withdraws when Allah is remembered.",
      ar: "الاستعاذة برب الناس وملكهم وإلههم من الوسواس الخناس الذي يخنس عند ذكر الله.",
    },
    context: {
      de: "Umstritten: Nach einigen mekkanisch, nach anderen medinensisch; sie schließt den Qurʾān als zweite Schutzsure ab.",
      en: "Disputed: some consider it Meccan, others Medinan; it closes the Qurʾān as the second surah of refuge.",
      ar: "مختلف فيها: قيل مكية وقيل مدنية، وهي خاتمة المصحف وثانية المعوذتين.",
    },
    asbab: {
      de: "Wie bei al-Falaq: Die Zauberei gegen den Propheten ﷺ ist bei al-Buchārī und Muslim überliefert; die Verbindung zur Herabsendung beider Suren berichten al-Wāḥidī und andere, mit Meinungsverschiedenheit über ihre Stärke.",
      en: "As with al-Falaq: the sorcery against the Prophet ﷺ is narrated in al-Bukhari and Muslim; the link to the revelation of both surahs is reported by al-Wahidi and others, with differing views on its strength.",
      ar: "كما في الفلق: سحر النبي ﷺ في البخاري ومسلم، وربط نزول السورتين به ذكره الواحدي وغيره مع خلاف في قوته.",
    },
    connects: {
      de: "Al-Falaq sucht Schutz vor äußeren Übeln, an-Nās vor der inneren Einflüsterung. Al-Biqāʿī und andere sehen einen Kreis: Der Qurʾān endet mit Zuflucht und beginnt mit al-Fātiḥa, dem Gebet um Rechtleitung.",
      en: "Al-Falaq seeks protection from outward harms, an-Nas from inner whispering. Al-Biqaʿi and others see a circle: the Qurʾān ends with refuge and begins with al-Fatiha, the prayer for guidance.",
      ar: "الفلق من الشر الظاهر، والناس من الوسوسة الباطنة، ويرى البقاعي وغيره دائرة: يُختم المصحف بالاستعاذة ويُفتتح بالفاتحة دعاءِ الهداية.",
    },
    lessons: {
      de: [
        "Allah ist Herr, König und Gott der Menschen zugleich.",
        "Die größte Gefahr ist die Einflüsterung im eigenen Herzen.",
        "Gedenken Allahs vertreibt den Einflüsterer.",
        "Einflüsterung kommt von Dschinn und Menschen.",
      ],
      en: [
        "Allah is at once Lord, King and God of mankind.",
        "The greatest danger is the whispering in one's own heart.",
        "Remembrance of Allah drives the whisperer away.",
        "Whispering comes from both jinn and humans.",
      ],
      ar: [
        "الله رب الناس وملكهم وإلههم معًا.",
        "أعظم الخطر الوسوسة في القلب.",
        "ذكر الله يطرد الوسواس.",
        "الوسوسة من الجن والناس.",
      ],
    },
    questions: {
      de: ["Welche wiederkehrenden Gedanken ziehen Sie vom Guten ab?", "Welche Menschen flüstern Ihnen Schlechtes ein?"],
      en: ["Which recurring thoughts pull you away from good?", "Which people whisper evil to you?"],
      ar: ["أي خواطر متكررة تصرفك عن الخير؟", "من الناس من يوسوس لك بالشر؟"],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Herr, König und Gott der Menschen", en: "Lord, King and God of mankind", ar: "رب الناس ملك الناس إله الناس" },
        lessons: {
          de: ["Drei Eigenschaften: Fürsorge, Herrschaft und Anbetungswürdigkeit.", "Die Wiederholung von „Menschen“ zeigt Allahs Nähe zu ihnen.", "Wer diese drei anerkennt, hat den stärksten Schutz."],
          en: ["Three attributes: care, sovereignty and worthiness of worship.", "The repetition of \"mankind\" shows Allah's closeness to them.", "Whoever acknowledges these three has the strongest protection."],
          ar: ["ثلاث صفات: الربوبية والملك والألوهية.", "تكرار لفظ الناس يبين قرب الله منهم.", "من أقر بها نال أقوى حماية."],
        },
        takeaway: { de: "Rezitieren Sie al-Ikhlāṣ, al-Falaq und an-Nās morgens und abends.", en: "Recite al-Ikhlas, al-Falaq and an-Nas morning and evening.", ar: "اقرأ الإخلاص والمعوذتين صباحًا ومساءً." },
        questions: {
          de: ["Welche der drei Eigenschaften spüren Sie am wenigsten in Ihrem Alltag?"],
          en: ["Which of the three attributes do you feel least in your daily life?"],
          ar: ["أي الصفات الثلاث أقل حضورًا في يومك؟"],
        },
      },
      {
        from: 4, to: 6,
        title: { de: "Der heimliche Einflüsterer", en: "The stealthy whisperer", ar: "الوسواس الخناس" },
        lessons: {
          de: ["Der Einflüsterer wirkt leise und zieht sich beim Gedenken zurück.", "Das Herz ist der Ort des Kampfes.", "Auch Menschen können zu Einflüsterern werden."],
          en: ["The whisperer works quietly and retreats at remembrance.", "The heart is the place of the struggle.", "Humans too can become whisperers."],
          ar: ["الوسواس يعمل خفية ويخنس عند الذكر.", "القلب ميدان المعركة.", "قد يكون البشر أيضًا وسواسًا."],
        },
        takeaway: { de: "Antworten Sie auf einen schlechten Gedanken sofort mit Gedenken Allahs.", en: "Answer a bad thought immediately with remembrance of Allah.", ar: "قابل الخاطر السيئ فورًا بذكر الله." },
        questions: {
          de: ["Wann sind Sie für Einflüsterungen am empfänglichsten?", "Sind Sie selbst für jemanden eine schlechte Stimme?"],
          en: ["When are you most receptive to whisperings?", "Are you yourself a bad voice for someone?"],
          ar: ["متى تكون أكثر قابلية للوسوسة؟", "هل أنت صوت سوء لأحد؟"],
        },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "wahidi"],
    review: DRAFT,
  },
];
