import type { Maqasid } from "./types";
import { DRAFT } from "../sources";

// Maqāṣid and tadabbur cards for al-Fātiḥa and Juzʾ ʿAmma (part 1: surahs 78–95). Own words, verse numbers only.
export const M_AMMA1: Maqasid[] = [
  {
    s: 1,
    theme: {
      de: "Die Fātiḥa fasst den ganzen Qurʾān zusammen: Lob Allahs, Seine Herrschaft und Barmherzigkeit, das Gericht, aufrichtige Anbetung und die Bitte um den geraden Weg.",
      en: "Al-Fātiḥa summarises the whole Qurʾān: praise of Allah, His lordship and mercy, the Judgement, sincere worship and the plea for the straight path.",
      ar: "الفاتحة خلاصة القرآن كله: حمد الله وربوبيته ورحمته، ويوم الدين، وإخلاص العبادة، وطلب الهداية إلى الصراط المستقيم.",
    },
    context: {
      de: "Nach der Mehrheit der Gelehrten mekkanisch und früh offenbart; einige hielten sie für medinensisch oder zweimal offenbart. Sie wird in jeder Gebetseinheit rezitiert.",
      en: "According to most scholars Meccan and revealed early; some held it to be Medinan or revealed twice. It is recited in every unit of prayer.",
      ar: "مكية عند الجمهور ومن أوائل ما نزل، وقيل مدنية، وقيل نزلت مرتين. تُقرأ في كل ركعة من الصلاة.",
    },
    connects: {
      de: "Als Eröffnung steht sie vor allem; ihre Bitte um Rechtleitung wird von al-Baqara beantwortet, die mit dem Hinweis auf das Buch als Rechtleitung beginnt.",
      en: "As the opening it precedes everything; its plea for guidance is answered by al-Baqara, which begins by presenting the Book as guidance.",
      ar: "هي فاتحة الكتاب فلا شيء قبلها، وسؤال الهداية فيها يجيبه مطلع البقرة الذي يقدّم الكتاب هدى للمتقين.",
    },
    lessons: {
      de: [
        "Jedes Gespräch mit Allah beginnt mit Lob und Erkenntnis, erst dann mit der Bitte.",
        "Barmherzigkeit und Gericht stehen nebeneinander: Hoffnung und Ehrfurcht gehören zusammen.",
        "Anbetung und Hilfesuche gelten allein Allah (v. 5).",
        "Rechtleitung braucht man täglich neu; sie ist das wichtigste Gebet überhaupt.",
      ],
      en: [
        "Every conversation with Allah begins with praise and recognition, and only then with a request.",
        "Mercy and Judgement stand side by side: hope and awe belong together.",
        "Worship and seeking help are for Allah alone (v. 5).",
        "Guidance is needed anew every day; it is the most important prayer of all.",
      ],
      ar: [
        "مناجاة الله تبدأ بالثناء والمعرفة ثم بالسؤال.",
        "الرحمة والجزاء متجاوران، فالرجاء والخوف متلازمان.",
        "العبادة والاستعانة لله وحده (آية 5).",
        "الهداية حاجة متجددة كل يوم، وهي أعظم الدعاء.",
      ],
    },
    questions: {
      de: [
        "Wie würde sich Ihr Gebet verändern, wenn Sie die Fātiḥa als persönliches Gespräch verstünden?",
        "Wo suchen Sie im Alltag Hilfe, bevor Sie Allah darum bitten?",
      ],
      en: [
        "How would your prayer change if you understood al-Fātiḥa as a personal conversation?",
        "Where do you seek help in daily life before asking Allah?",
      ],
      ar: [
        "كيف تتغير صلاتك لو قرأت الفاتحة مناجاةً شخصية؟",
        "إلى من تلجأ في يومك قبل أن تسأل الله؟",
      ],
    },
    sections: [
      {
        from: 1, to: 4,
        title: { de: "Lob, Barmherzigkeit und Gericht", en: "Praise, mercy and Judgement", ar: "الحمد والرحمة ويوم الدين" },
        lessons: {
          de: ["Alles Lob gebührt Allah, weil Er alle Welten erzieht und versorgt.", "Seine Barmherzigkeit wird vor dem Gericht genannt; sie geht Seinem Zorn voraus.", "Der Tag des Gerichts gibt dem Leben Ernst und Richtung."],
          en: ["All praise belongs to Allah because He nurtures and sustains all worlds.", "His mercy is mentioned before the Judgement; it precedes His wrath.", "The Day of Judgement gives life seriousness and direction."],
          ar: ["الحمد كله لله لأنه رب العالمين المربي لهم.", "ذُكرت الرحمة قبل يوم الدين، فرحمته سبقت غضبه.", "يوم الدين يمنح الحياة جدية ووجهة."],
        },
        takeaway: { de: "Beginnen Sie Ihre Bitten heute bewusst mit Lob und Dank.", en: "Today, consciously begin your requests with praise and thanks.", ar: "ابدأ دعاءك اليوم بالحمد والشكر عن وعي." },
        questions: { de: ["Wofür können Sie Allah heute konkret loben?"], en: ["For what can you concretely praise Allah today?"], ar: ["على أي نعمة محددة تحمد الله اليوم؟"] },
      },
      {
        from: 5, to: 5,
        title: { de: "Der Bund der Anbetung", en: "The covenant of worship", ar: "عهد العبادة والاستعانة" },
        lessons: {
          de: ["Die Voranstellung des Objekts zeigt Ausschließlichkeit: nur Allah.", "Anbetung kommt vor der Hilfesuche, denn Hilfe dient der Anbetung.", "Die Wir-Form verbindet den Einzelnen mit der Gemeinschaft."],
          en: ["The object placed first expresses exclusivity: Allah alone.", "Worship comes before seeking help, because help serves worship.", "The plural form connects the individual with the community."],
          ar: ["تقديم المعمول يفيد الحصر: لله وحده.", "قُدمت العبادة على الاستعانة لأن العون وسيلة إليها.", "صيغة الجمع تربط الفرد بالجماعة."],
        },
        takeaway: { de: "Bitten Sie vor einer schwierigen Aufgabe ausdrücklich um Allahs Hilfe.", en: "Before a difficult task, explicitly ask for Allah's help.", ar: "قبل كل مهمة صعبة اطلب عون الله صراحة." },
        questions: { de: ["Welche Ihrer Handlungen könnten Sie in Anbetung verwandeln?"], en: ["Which of your actions could you turn into worship?"], ar: ["أي أعمالك اليومية يمكن أن تجعلها عبادة؟"] },
      },
      {
        from: 6, to: 7,
        title: { de: "Die Bitte um den geraden Weg", en: "The plea for the straight path", ar: "سؤال الصراط المستقيم" },
        lessons: {
          de: ["Rechtleitung umfasst Wissen und Handeln zugleich.", "Der Weg ist durch Menschen erkennbar, denen Allah Gnade erwies.", "Die Gelehrten nennen zwei Abwege: Wissen ohne Handeln und Handeln ohne Wissen."],
          en: ["Guidance includes both knowledge and action.", "The path is recognisable through people whom Allah has favoured.", "Scholars name two deviations: knowledge without action and action without knowledge."],
          ar: ["الهداية تشمل العلم والعمل معًا.", "الطريق يُعرف بمن أنعم الله عليهم.", "ذكر العلماء انحرافين: علم بلا عمل، وعمل بلا علم."],
        },
        takeaway: { de: "Verbinden Sie heute ein erlerntes Wissen mit einer konkreten Tat.", en: "Today, connect one thing you have learned with a concrete deed.", ar: "اربط اليوم علمًا تعلمته بعمل محدد." },
        questions: { de: ["Wo fehlt Ihnen eher Wissen, wo eher Umsetzung?"], en: ["Where do you lack knowledge more, and where implementation?"], ar: ["أين ينقصك العلم، وأين ينقصك العمل؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur", "tabari"],
    review: DRAFT,
  },
  {
    s: 78,
    theme: {
      de: "Die große Nachricht der Auferstehung: Die Ordnung der Schöpfung beweist, dass ein Tag der Entscheidung kommt, an dem Unrecht bestraft und Gottesfurcht belohnt wird.",
      en: "The great news of resurrection: the order of creation proves that a Day of Decision will come, when wrongdoing is punished and God-consciousness rewarded.",
      ar: "النبأ العظيم وهو البعث: نظام الخلق دليل على يوم الفصل الذي يُجازى فيه الطاغي ويُكرم المتقي.",
    },
    context: {
      de: "Mekkanisch, aus der Zeit, als die Quraisch über die Botschaft und besonders über die Auferstehung stritten.",
      en: "Meccan, from the time when Quraysh disputed about the message and especially about resurrection.",
      ar: "مكية، نزلت حين كانت قريش تتجادل في الرسالة ولا سيما في البعث.",
    },
    asbab: {
      de: "al-Ṭabarī berichtet von frühen Exegeten wie al-Ḥasan al-Baṣrī und Qatāda, dass die Quraisch nach der Sendung des Propheten ﷺ untereinander über die Auferstehung stritten.",
      en: "al-Ṭabarī reports from early exegetes such as al-Ḥasan al-Baṣrī and Qatāda that Quraysh argued among themselves about resurrection after the Prophet ﷺ was sent.",
      ar: "روى الطبري عن الحسن البصري وقتادة وغيرهما أن قريشًا تساءلوا فيما بينهم عن البعث لما بُعث النبي ﷺ.",
    },
    connects: {
      de: "al-Mursalāt endet mit der Frage, an welche Rede sie noch glauben wollen; al-Nabaʾ beginnt mit ihrem Streit über genau diese Nachricht. Al-Nāziʿāt setzt das Thema mit der Stunde fort.",
      en: "al-Mursalāt ends asking what speech they will believe after this; al-Nabaʾ opens with their dispute about exactly this news. Al-Nāziʿāt continues the theme of the Hour.",
      ar: "ختمت المرسلات بالسؤال عن أي حديث يؤمنون به بعده، وافتتحت النبأ بتساؤلهم عنه، وتكمل النازعات الحديث عن الساعة.",
    },
    lessons: {
      de: [
        "Die geordnete Schöpfung ist ein Argument für die Wiedererweckung.",
        "Allahs Gericht ist gerecht: Strafe entspricht der Tat, Lohn übersteigt sie.",
        "Alles wird verzeichnet; nichts geht verloren (v. 29).",
        "Wer heute keinen Weg zu seinem Herrn wählt, wird es bereuen.",
      ],
      en: [
        "The orderly creation is an argument for resurrection.",
        "Allah's judgement is just: punishment matches the deed, reward exceeds it.",
        "Everything is recorded; nothing is lost (v. 29).",
        "Whoever does not choose a way to his Lord today will regret it.",
      ],
      ar: [
        "نظام الخلق حجة على البعث.",
        "جزاء الله عدل: العقاب وفاق والثواب عطاء يزيد.",
        "كل شيء محصى مكتوب (آية 29).",
        "من لم يتخذ اليوم إلى ربه مآبًا ندم.",
      ],
    },
    questions: {
      de: [
        "Welche Zeichen in Ihrem Alltag erinnern Sie an Allahs Ordnung?",
        "Was würden Sie heute anders tun, wenn Sie wüssten, dass alles verzeichnet wird?",
      ],
      en: [
        "Which signs in your daily life remind you of Allah's order?",
        "What would you do differently today knowing that everything is recorded?",
      ],
      ar: [
        "ما الآيات في يومك التي تذكرك بتدبير الله؟",
        "ماذا تغيّر اليوم لو استحضرت أن كل شيء مكتوب؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Der Streit über die große Nachricht", en: "The dispute about the great news", ar: "التساؤل عن النبأ العظيم" },
        lessons: {
          de: ["Gleichgültigkeit gegenüber dem Jenseits ist selbst eine Art Leugnung.", "Die doppelte Warnung (v. 4–5) zeigt Gewissheit des Kommenden."],
          en: ["Indifference towards the Hereafter is itself a kind of denial.", "The repeated warning (v. 4–5) shows the certainty of what is coming."],
          ar: ["الغفلة عن الآخرة نوع من التكذيب.", "تكرار الوعيد (آية 4–5) يؤكد تحقق الأمر."],
        },
        takeaway: { de: "Prüfen Sie, worüber Sie viel reden, und ob es Ihrem Jenseits nützt.", en: "Check what you talk about most, and whether it benefits your Hereafter.", ar: "راجع ما تكثر الحديث فيه: هل ينفعك في آخرتك؟" },
        questions: { de: ["Worüber streiten Menschen heute, statt nachzudenken?"], en: ["What do people argue about today instead of reflecting?"], ar: ["فيمَ يتجادل الناس اليوم بدل أن يتفكروا؟"] },
      },
      {
        from: 6, to: 16,
        title: { de: "Zeichen der Schöpfung", en: "Signs of creation", ar: "آيات الخلق" },
        lessons: {
          de: ["Erde, Berge, Paare, Schlaf, Nacht und Tag sind bewusst geordnete Gaben.", "Wer all dies erschuf, kann auch neu erschaffen.", "Ruhe und Arbeit sind beide Gnade."],
          en: ["Earth, mountains, pairs, sleep, night and day are deliberately ordered gifts.", "He who created all this can create anew.", "Rest and work are both a mercy."],
          ar: ["الأرض والجبال والأزواج والنوم والليل والنهار نعم مدبرة.", "من خلق هذا قادر على الإعادة.", "الراحة والسعي كلاهما نعمة."],
        },
        takeaway: { de: "Danken Sie heute bewusst für Schlaf und Ruhe.", en: "Today, consciously give thanks for sleep and rest.", ar: "اشكر الله اليوم على نعمة النوم والسكن." },
        questions: { de: ["Welche dieser Gaben nehmen Sie als selbstverständlich hin?"], en: ["Which of these gifts do you take for granted?"], ar: ["أي هذه النعم تعدّها أمرًا عاديًا؟"] },
      },
      {
        from: 17, to: 30,
        title: { de: "Der Tag der Entscheidung und die Strafe", en: "The Day of Decision and the punishment", ar: "يوم الفصل وجزاء الطاغين" },
        lessons: {
          de: ["Der Tag hat einen festgesetzten Termin, den nur Allah kennt.", "Die Strafe ist eine angemessene Vergeltung (v. 26).", "Leugnung beginnt oft damit, nicht mit Rechenschaft zu rechnen (v. 27)."],
          en: ["The Day has a fixed appointment known only to Allah.", "The punishment is a fitting recompense (v. 26).", "Denial often begins with not expecting any reckoning (v. 27)."],
          ar: ["ليوم الفصل ميقات لا يعلمه إلا الله.", "العقاب جزاء موافق للعمل (آية 26).", "يبدأ التكذيب بعدم رجاء الحساب (آية 27)."],
        },
        takeaway: { de: "Rechnen Sie heute Abend kurz mit sich selbst ab.", en: "Hold yourself to account briefly this evening.", ar: "حاسب نفسك هذا المساء قليلًا." },
        questions: { de: ["Wie verändert der Gedanke der Rechenschaft Ihr Verhalten?"], en: ["How does the thought of accountability change your behaviour?"], ar: ["كيف يغيّر استحضار الحساب سلوكك؟"] },
      },
      {
        from: 31, to: 37,
        title: { de: "Der Lohn der Gottesfürchtigen", en: "The reward of the God-conscious", ar: "جزاء المتقين" },
        lessons: {
          de: ["Der Lohn ist reichlich und zugleich frei von leerem Gerede.", "Er ist Gabe des Herrn, nicht bloß Verrechnung (v. 36)."],
          en: ["The reward is abundant and free of idle talk.", "It is a gift from the Lord, not mere settlement (v. 36)."],
          ar: ["الثواب وافر خالٍ من اللغو.", "هو عطاء من الرب لا مجرد مقابلة (آية 36)."],
        },
        takeaway: { de: "Meiden Sie heute bewusst eine Form leeren Geredes.", en: "Today, deliberately avoid one form of idle talk.", ar: "اجتنب اليوم صورة من صور اللغو." },
        questions: { de: ["Was bedeutet es Ihnen, dass der Lohn eine Gabe ist?"], en: ["What does it mean to you that the reward is a gift?"], ar: ["ماذا يعني لك أن الجزاء عطاء؟"] },
      },
      {
        from: 38, to: 40,
        title: { de: "Der wahre Tag und die Reue", en: "The true Day and regret", ar: "اليوم الحق والندم" },
        lessons: {
          de: ["An jenem Tag spricht niemand ohne Erlaubnis.", "Die Wahl eines Weges zu Allah steht jetzt offen.", "Die Reue des Leugners zeigt, wie nah die Strafe ist."],
          en: ["On that Day no one speaks without permission.", "Choosing a way to Allah is open now.", "The denier's regret shows how near the punishment is."],
          ar: ["لا يتكلم أحد يومئذ إلا بإذن.", "اتخاذ المآب إلى الله متاح الآن.", "ندم الكافر يبين قرب العذاب."],
        },
        takeaway: { de: "Setzen Sie heute einen konkreten Schritt auf Ihrem Weg zu Allah.", en: "Take one concrete step on your way to Allah today.", ar: "خطُ اليوم خطوة محددة في طريقك إلى الله." },
        questions: { de: ["Welchen Schritt schieben Sie auf, obwohl die Tür noch offen ist?"], en: ["Which step are you postponing although the door is still open?"], ar: ["أي خطوة تؤجلها والباب ما زال مفتوحًا؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "tabari", "biqai", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 79,
    theme: {
      de: "Die Gewissheit der Stunde und die Furcht vor dem Herrn: Wer sich über Allah erhebt wie Pharao, scheitert; wer seine Neigungen zügelt, gewinnt.",
      en: "The certainty of the Hour and awe of the Lord: whoever exalts himself over Allah like Pharaoh fails; whoever restrains his desires succeeds.",
      ar: "تحقق الساعة وخشية الرب: من طغى كفرعون خسر، ومن نهى النفس عن الهوى فاز.",
    },
    context: {
      de: "Mekkanisch, in einer Phase, in der die Leugner die Wiedererweckung als unmöglich verspotteten und nach dem Zeitpunkt der Stunde fragten.",
      en: "Meccan, at a stage when deniers mocked resurrection as impossible and asked about the time of the Hour.",
      ar: "مكية، في مرحلة استهزاء المكذبين بالبعث وسؤالهم عن وقت الساعة.",
    },
    connects: {
      de: "al-Nabaʾ beschreibt den Tag der Entscheidung, al-Nāziʿāt seinen Beginn und die Frage nach seinem Zeitpunkt. ʿAbasa folgt mit dem Umgang des Gesandten ﷺ mit dem, der Furcht hat.",
      en: "al-Nabaʾ describes the Day of Decision, al-Nāziʿāt its onset and the question of its timing. ʿAbasa follows with how the Messenger ﷺ should treat the one who fears.",
      ar: "وصفت النبأ يوم الفصل، وتصف النازعات مقدماته والسؤال عن وقته، وتليها عبس في معاملة من يخشى.",
    },
    lessons: {
      de: [
        "Die Engel führen Allahs Befehle genau aus; die Welt ist nicht sich selbst überlassen.",
        "Die Geschichte von Mūsā und Pharao zeigt das Ende der Überheblichkeit.",
        "Die Erschaffung des Himmels ist größer als die des Menschen; die Auferstehung ist daher leicht.",
        "Erfolg liegt in Gottesfurcht und Selbstbeherrschung (v. 40–41).",
        "Der Zeitpunkt der Stunde ist allein bei Allah.",
      ],
      en: [
        "The angels carry out Allah's commands exactly; the world is not left to itself.",
        "The story of Mūsā and Pharaoh shows the end of arrogance.",
        "Creating the heavens is greater than creating man; resurrection is therefore easy.",
        "Success lies in awe of God and self-restraint (v. 40–41).",
        "The timing of the Hour is with Allah alone.",
      ],
      ar: [
        "الملائكة تنفذ أمر الله بدقة، فالكون مدبَّر.",
        "قصة موسى وفرعون تبين عاقبة الطغيان.",
        "خلق السماء أكبر من خلق الإنسان، فالإعادة أهون.",
        "الفلاح في الخوف من مقام الرب ونهي النفس عن الهوى (آية 40–41).",
        "علم الساعة عند الله وحده.",
      ],
    },
    questions: {
      de: [
        "Welche Neigung sollten Sie heute zügeln?",
        "Wo zeigt sich in Ihnen ein kleiner Pharao?",
        "Bereiten Sie sich auf die Stunde vor, statt nach ihrem Zeitpunkt zu fragen?",
      ],
      en: [
        "Which desire should you restrain today?",
        "Where does a small Pharaoh show itself in you?",
        "Are you preparing for the Hour instead of asking about its time?",
      ],
      ar: [
        "أي هوى ينبغي أن تنهى نفسك عنه اليوم؟",
        "أين يظهر فيك فرعون صغير؟",
        "هل تستعد للساعة بدل السؤال عن وقتها؟",
      ],
    },
    sections: [
      {
        from: 1, to: 14,
        title: { de: "Schwüre und der Schrecken des Tages", en: "Oaths and the terror of the Day", ar: "الأقسام وهول اليوم" },
        lessons: {
          de: ["Die meisten Exegeten deuten die Schwüre auf Engel; andere auf Sterne oder Pferde.", "Herzen, die heute spotten, werden dann zittern.", "Die Wiedererweckung geschieht durch einen einzigen Ruf."],
          en: ["Most exegetes interpret the oaths as angels; others as stars or horses.", "Hearts that mock today will tremble then.", "Resurrection happens through a single call."],
          ar: ["حمل أكثر المفسرين الأقسام على الملائكة، وقيل النجوم أو الخيل.", "القلوب الساخرة اليوم واجفة غدًا.", "البعث يكون بزجرة واحدة."],
        },
        takeaway: { de: "Nehmen Sie eine Ermahnung heute ernst, statt sie abzutun.", en: "Take one reminder seriously today instead of dismissing it.", ar: "خذ تذكرة اليوم بجدية ولا تستخف بها." },
        questions: { de: ["Wie leicht nehmen Sie das Jenseits im Alltag?"], en: ["How lightly do you take the Hereafter in daily life?"], ar: ["كم تستخف بالآخرة في يومك؟"] },
      },
      {
        from: 15, to: 26,
        title: { de: "Mūsā und Pharao", en: "Mūsā and Pharaoh", ar: "موسى وفرعون" },
        lessons: {
          de: ["Selbst zum größten Tyrannen wird Mūsā mit milder Einladung gesandt.", "Läuterung ist das Ziel der Botschaft (v. 18).", "Wer Gottesfurcht hat, zieht die Lehre aus der Geschichte (v. 26)."],
          en: ["Even to the greatest tyrant Mūsā is sent with a gentle invitation.", "Purification is the aim of the message (v. 18).", "Whoever fears God draws the lesson from history (v. 26)."],
          ar: ["أُرسل موسى إلى أطغى الطغاة بدعوة لينة.", "التزكية غاية الرسالة (آية 18).", "العبرة لمن يخشى (آية 26)."],
        },
        takeaway: { de: "Laden Sie heute jemanden mit freundlichen Worten zum Guten ein.", en: "Invite someone to good with gentle words today.", ar: "ادعُ اليوم أحدًا إلى الخير بلين." },
        questions: { de: ["Wie reagieren Sie, wenn man Sie auf einen Fehler hinweist?"], en: ["How do you react when someone points out your mistake?"], ar: ["كيف تستقبل من ينبهك على خطئك؟"] },
      },
      {
        from: 27, to: 33,
        title: { de: "Die Schöpfung als Beweis", en: "Creation as proof", ar: "الخلق دليلًا" },
        lessons: {
          de: ["Himmel, Nacht, Tag, Erde und Berge sind wohlgeordnet.", "Die Gaben der Erde dienen Mensch und Tier: Verantwortung statt Verschwendung."],
          en: ["Heaven, night, day, earth and mountains are well ordered.", "The earth's provisions serve humans and animals: responsibility instead of waste."],
          ar: ["السماء والليل والنهار والأرض والجبال محكمة التدبير.", "خيرات الأرض متاع للإنسان والأنعام: مسؤولية لا إسراف."],
        },
        takeaway: { de: "Vermeiden Sie heute eine Verschwendung von Nahrung oder Wasser.", en: "Avoid wasting food or water today.", ar: "تجنب اليوم إسراف الطعام أو الماء." },
        questions: { de: ["Was lehrt Sie die Größe des Himmels über Ihre eigene Größe?"], en: ["What does the vastness of the sky teach you about your own size?"], ar: ["ماذا تعلمك عظمة السماء عن حجمك؟"] },
      },
      {
        from: 34, to: 41,
        title: { de: "Zwei Wege zur Wohnstätte", en: "Two paths to the final abode", ar: "طريقان إلى المأوى" },
        lessons: {
          de: ["Am Tag der großen Katastrophe erinnert sich der Mensch an sein Streben.", "Überheblichkeit plus Vorliebe fürs Diesseits führt ins Verderben.", "Ehrfurcht vor Allah und Zügelung der Neigung führen zum Paradies."],
          en: ["On the Day of the great calamity man remembers his striving.", "Arrogance plus preferring this world leads to ruin.", "Awe of Allah and restraining desire lead to Paradise."],
          ar: ["يوم الطامة يتذكر الإنسان سعيه.", "الطغيان وإيثار الدنيا طريق الجحيم.", "الخوف من مقام الرب ونهي النفس طريق الجنة."],
        },
        takeaway: { de: "Sagen Sie heute einmal bewusst Nein zu einer Neigung.", en: "Today, consciously say no to one desire.", ar: "قل لا لهوى واحد اليوم عن وعي." },
        questions: { de: ["Was bevorzugen Sie, wenn Diesseits und Jenseits kollidieren?"], en: ["What do you prefer when this world and the next collide?"], ar: ["ماذا تؤثر إذا تعارضت الدنيا والآخرة؟"] },
      },
      {
        from: 42, to: 46,
        title: { de: "Die Frage nach der Stunde", en: "The question about the Hour", ar: "السؤال عن الساعة" },
        lessons: {
          de: ["Der Gesandte ﷺ ist Warner, nicht Kenner des Zeitpunkts.", "Rückblickend wird das Leben kurz wie ein Abend oder Morgen erscheinen."],
          en: ["The Messenger ﷺ is a warner, not one who knows the timing.", "In retrospect life will seem as short as an evening or a morning."],
          ar: ["الرسول ﷺ منذر لا يعلم وقتها.", "ستبدو الحياة عند البعث كعشية أو ضحاها."],
        },
        takeaway: { de: "Nutzen Sie den heutigen Tag, als sei er kurz.", en: "Use today as if it were short.", ar: "اغتنم يومك كأنه قصير." },
        questions: { de: ["Wie würden Sie leben, wenn Ihnen das Leben wie ein Nachmittag vorkäme?"], en: ["How would you live if life felt like an afternoon?"], ar: ["كيف تعيش لو شعرت أن عمرك عشية؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "tabari", "ibnAshur", "biqai"],
    review: DRAFT,
  },
  {
    s: 80,
    theme: {
      de: "Der Wert eines Menschen liegt in seiner Bereitschaft zur Läuterung, nicht in Rang oder Reichtum; dazu die Undankbarkeit des Menschen gegenüber seinem Schöpfer.",
      en: "A person's worth lies in his readiness for purification, not in rank or wealth; together with man's ingratitude towards his Creator.",
      ar: "قيمة الإنسان في استعداده للتزكي لا في جاهه وماله، مع بيان جحود الإنسان لخالقه.",
    },
    context: {
      de: "Mekkanisch, als der Prophet ﷺ sich um führende Quraisch bemühte und ein blinder Gläubiger zu ihm kam.",
      en: "Meccan, when the Prophet ﷺ was engaged with leading Quraysh and a blind believer came to him.",
      ar: "مكية، نزلت حين كان النبي ﷺ يدعو بعض سادة قريش فجاءه رجل أعمى مؤمن.",
    },
    asbab: {
      de: "Nach al-Tirmidhī (von ʿĀʾisha) und Mālik im Muwaṭṭaʾ kam ʿAbdullāh ibn Umm Maktūm zum Propheten ﷺ, während dieser mit Würdenträgern der Quraisch sprach.",
      en: "According to al-Tirmidhī (from ʿĀʾisha) and Mālik in the Muwaṭṭaʾ, ʿAbdullāh ibn Umm Maktūm came to the Prophet ﷺ while he was speaking with Quraysh notables.",
      ar: "روى الترمذي عن عائشة، ومالك في الموطأ، أن عبد الله بن أم مكتوم جاء النبي ﷺ وعنده عظماء من قريش.",
    },
    connects: {
      de: "al-Nāziʿāt nennt den Gesandten ﷺ Warner für den, der Furcht hat; ʿAbasa zeigt, wie dieser Fürchtende zu behandeln ist. al-Takwīr setzt den Schrecken der letzten Szene fort.",
      en: "al-Nāziʿāt calls the Messenger ﷺ a warner for the one who fears; ʿAbasa shows how that person is to be treated. al-Takwīr continues the terror of the final scene.",
      ar: "ختمت النازعات بأن الرسول ﷺ منذر من يخشاها، وبيّنت عبس كيف يُعامل الخاشي، وتكمل التكوير أهوال الختام.",
    },
    lessons: {
      de: [
        "Aufrichtiges Suchen verdient Vorrang vor Ansehen.",
        "Der Qurʾān korrigiert selbst den Propheten ﷺ offen; das zeigt seine Wahrhaftigkeit.",
        "Der Mensch vergisst seinen schwachen Ursprung und Allahs Versorgung.",
        "Am Ende flieht jeder vor seinen Liebsten; nur die eigenen Taten zählen.",
      ],
      en: [
        "Sincere seeking deserves priority over prestige.",
        "The Qurʾān openly corrects even the Prophet ﷺ; this shows its truthfulness.",
        "Man forgets his weak origin and Allah's provision.",
        "In the end everyone flees from his loved ones; only one's own deeds count.",
      ],
      ar: [
        "طالب الهداية الصادق أولى من صاحب الجاه.",
        "عاتب القرآن النبي ﷺ علنًا، وفي ذلك دليل صدقه.",
        "ينسى الإنسان ضعف أصله ورزق ربه.",
        "يوم القيامة يفر المرء من أحبته ولا ينفعه إلا عمله.",
      ],
    },
    questions: {
      de: [
        "Wem schenken Sie Aufmerksamkeit, und nach welchem Maßstab?",
        "Wann haben Sie zuletzt über Ihre Nahrung als Gabe nachgedacht?",
      ],
      en: [
        "To whom do you give attention, and by what standard?",
        "When did you last reflect on your food as a gift?",
      ],
      ar: [
        "لمن تمنح اهتمامك وبأي معيار؟",
        "متى تأملت طعامك آخر مرة بوصفه نعمة؟",
      ],
    },
    sections: [
      {
        from: 1, to: 10,
        title: { de: "Der blinde Suchende", en: "The blind seeker", ar: "الأعمى الساعي" },
        lessons: {
          de: ["Die Ermahnung beginnt in der dritten Person, aus Rücksicht auf den Propheten ﷺ.", "Wer kommt, um sich zu läutern, darf nicht übergangen werden.", "Man ist nicht verantwortlich für den, der sich abwendet."],
          en: ["The admonition begins in the third person, out of consideration for the Prophet ﷺ.", "Whoever comes to be purified must not be overlooked.", "One is not responsible for the one who turns away."],
          ar: ["بدأ العتاب بصيغة الغائب تلطفًا بالنبي ﷺ.", "لا يُهمل من جاء يتزكى.", "لست مسؤولًا عمن استغنى."],
        },
        takeaway: { de: "Schenken Sie heute einem unscheinbaren Menschen volle Aufmerksamkeit.", en: "Give your full attention today to someone who seems unimportant.", ar: "امنح اليوم اهتمامك الكامل لمن لا يلتفت إليه الناس." },
        questions: { de: ["Wen übersehen Sie, weil er Ihnen nichts zu bieten scheint?"], en: ["Whom do you overlook because he seems to offer you nothing?"], ar: ["من تتجاهله لأنه لا يملك ما تريد؟"] },
      },
      {
        from: 11, to: 16,
        title: { de: "Eine edle Ermahnung", en: "A noble reminder", ar: "تذكرة كريمة" },
        lessons: {
          de: ["Der Qurʾān ist Ermahnung für den, der will; Zwang hat keinen Platz.", "Seine Bewahrung durch edle Schreiber zeigt seinen Rang."],
          en: ["The Qurʾān is a reminder for whoever wills; compulsion has no place.", "Its preservation by noble scribes shows its rank."],
          ar: ["القرآن تذكرة لمن شاء بلا إكراه.", "حفظه بأيدي سفرة كرام دليل منزلته."],
        },
        takeaway: { de: "Behandeln Sie Ihren Muṣḥaf heute mit bewusster Ehrerbietung.", en: "Treat your muṣḥaf today with conscious reverence.", ar: "عامل مصحفك اليوم بتوقير واعٍ." },
        questions: { de: ["Wie würdig ist der Platz, den der Qurʾān in Ihrem Tag hat?"], en: ["How worthy is the place the Qurʾān has in your day?"], ar: ["ما مكانة القرآن في يومك؟"] },
      },
      {
        from: 17, to: 32,
        title: { de: "Undankbarkeit und Versorgung", en: "Ingratitude and provision", ar: "جحود الإنسان ورزق الله" },
        lessons: {
          de: ["Ein unscheinbarer Ursprung soll Demut lehren.", "Leben, Tod und Auferstehung sind in Allahs Hand.", "Der Weg der Nahrung vom Regen bis zur Speise ist eine Kette von Gaben."],
          en: ["A humble origin should teach humility.", "Life, death and resurrection are in Allah's hand.", "The path of food from rain to meal is a chain of gifts."],
          ar: ["أصل الإنسان الضعيف يعلمه التواضع.", "الحياة والموت والنشور بيد الله.", "رحلة الطعام من المطر إلى المائدة سلسلة نعم."],
        },
        takeaway: { de: "Betrachten Sie heute vor einer Mahlzeit, woher sie kommt.", en: "Before one meal today, consider where it comes from.", ar: "تأمل قبل وجبة اليوم من أين جاءت." },
        questions: { de: ["Was hat der Mensch von dem erfüllt, was ihm aufgetragen wurde (v. 23)?"], en: ["What has man fulfilled of what he was commanded (v. 23)?"], ar: ["ماذا قضى الإنسان مما أُمر به (آية 23)؟"] },
      },
      {
        from: 33, to: 42,
        title: { de: "Der ohrenbetäubende Schall", en: "The deafening blast", ar: "الصاخة" },
        lessons: {
          de: ["Familienbande lösen sich vor der eigenen Sorge.", "Gesichter verraten das Ergebnis: strahlend oder verdunkelt."],
          en: ["Family ties dissolve before one's own concern.", "Faces reveal the outcome: radiant or darkened."],
          ar: ["تنقطع روابط القرابة أمام هم النفس.", "الوجوه تكشف المصير: مسفرة أو مغبرة."],
        },
        takeaway: { de: "Tun Sie heute eine Tat, die nur Ihnen selbst zugerechnet wird.", en: "Do one deed today that is credited to you alone.", ar: "اعمل اليوم عملًا يُكتب لك وحدك." },
        questions: { de: ["Worauf verlassen Sie sich, das Ihnen an jenem Tag nicht helfen wird?"], en: ["What do you rely on that will not help you on that Day?"], ar: ["على ماذا تعتمد مما لا ينفعك يومئذ؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 81,
    theme: {
      de: "Die Erschütterung des Kosmos am Ende und die Wahrhaftigkeit der Offenbarung: Jede Seele wird erfahren, was sie vorausgeschickt hat.",
      en: "The upheaval of the cosmos at the end and the truthfulness of revelation: every soul will know what it has sent ahead.",
      ar: "انقلاب الكون عند القيامة وصدق الوحي: تعلم كل نفس ما أحضرت.",
    },
    context: {
      de: "Frühmekkanisch, als die Quraisch den Propheten ﷺ als besessen bezeichneten und die Herkunft des Qurʾān bestritten.",
      en: "Early Meccan, when Quraysh called the Prophet ﷺ possessed and disputed the origin of the Qurʾān.",
      ar: "مكية مبكرة، حين رمت قريش النبي ﷺ بالجنون وجادلت في مصدر القرآن.",
    },
    connects: {
      de: "ʿAbasa endet mit dem Schall des Tages; al-Takwīr malt seine kosmischen Zeichen aus. al-Infiṭār setzt dieselben Bilder fort und beginnt ähnlich.",
      en: "ʿAbasa ends with the blast of the Day; al-Takwīr paints its cosmic signs. al-Infiṭār continues the same images and opens similarly.",
      ar: "ختمت عبس بالصاخة، وفصلت التكوير مشاهدها الكونية، وتواصل الانفطار الصور نفسها بمطلع مشابه.",
    },
    lessons: {
      de: [
        "Was heute fest erscheint, wird vergehen; nur Allah bleibt.",
        "Die Frage an das lebendig begrabene Mädchen zeigt: Kein Unrecht wird vergessen.",
        "Der Qurʾān kommt durch einen vertrauenswürdigen Engel zu einem vertrauenswürdigen Propheten ﷺ.",
        "Der Mensch hat einen Willen, doch er bleibt unter Allahs Willen (v. 28–29).",
      ],
      en: [
        "What seems firm today will pass; only Allah remains.",
        "The question to the girl buried alive shows: no injustice is forgotten.",
        "The Qurʾān comes through a trustworthy angel to a trustworthy Prophet ﷺ.",
        "Man has a will, yet it remains under Allah's will (v. 28–29).",
      ],
      ar: [
        "ما يبدو ثابتًا اليوم زائل، والباقي هو الله.",
        "سؤال الموءودة دليل أن لا ظلم يُنسى.",
        "القرآن نزل به ملك أمين على نبي أمين ﷺ.",
        "للإنسان مشيئة تابعة لمشيئة الله (آية 28–29).",
      ],
    },
    questions: {
      de: [
        "Welches Unrecht an Schwachen sehen Sie heute, das gefragt werden wird?",
        "Was haben Sie für den Tag vorausgeschickt, an dem jede Seele es erfährt?",
      ],
      en: [
        "What injustice against the weak do you see today that will be asked about?",
        "What have you sent ahead for the Day when every soul will know it?",
      ],
      ar: [
        "أي ظلم للضعفاء تراه اليوم سيُسأل عنه؟",
        "ماذا قدّمت ليوم تعلم فيه كل نفس ما أحضرت؟",
      ],
    },
    sections: [
      {
        from: 1, to: 14,
        title: { de: "Der Zusammenbruch der Ordnung", en: "The collapse of order", ar: "انقلاب النظام الكوني" },
        lessons: {
          de: ["Sonne, Sterne, Berge und Meere verlieren ihren gewohnten Zustand.", "Kostbarster Besitz wird an jenem Tag vernachlässigt.", "Die Seelen werden mit ihresgleichen gepaart; so deuten es viele Exegeten."],
          en: ["Sun, stars, mountains and seas lose their familiar state.", "The most precious possessions are neglected on that Day.", "Souls are paired with their likes; so many exegetes explain it."],
          ar: ["تفقد الشمس والنجوم والجبال والبحار حالها المعهود.", "أنفس الأموال تُهمل يومئذ.", "تُقرن النفوس بأشكالها في تفسير كثيرين."],
        },
        takeaway: { de: "Prüfen Sie, an welchem Besitz Ihr Herz zu sehr hängt.", en: "Check which possession your heart clings to too much.", ar: "انظر أي متاع تعلق به قلبك أكثر مما ينبغي." },
        questions: { de: ["Mit wem möchten Sie an jenem Tag gepaart sein?"], en: ["With whom would you like to be paired on that Day?"], ar: ["مع من تحب أن تُقرن يومئذ؟"] },
      },
      {
        from: 15, to: 21,
        title: { de: "Schwüre und der edle Gesandte", en: "Oaths and the noble messenger", ar: "الأقسام والرسول الكريم" },
        lessons: {
          de: ["Die Schwüre auf Sterne, Nacht und Morgen bereiten das Zeugnis über die Offenbarung vor.", "Jibrīl ist stark, angesehen und vertrauenswürdig: Die Quelle ist sicher."],
          en: ["The oaths by stars, night and dawn prepare the testimony about revelation.", "Jibrīl is strong, honoured and trustworthy: the source is secure."],
          ar: ["الأقسام بالنجوم والليل والصبح تمهيد للشهادة على الوحي.", "جبريل قوي مكين أمين، فالمصدر موثوق."],
        },
        takeaway: { de: "Lesen Sie heute eine Seite Qurʾān im Bewusstsein ihrer Herkunft.", en: "Read one page of Qurʾān today aware of its origin.", ar: "اقرأ اليوم صفحة من القرآن مستحضرًا مصدره." },
        questions: { de: ["Wie stärkt die Kette der Überlieferung Ihr Vertrauen?"], en: ["How does the chain of transmission strengthen your trust?"], ar: ["كيف تقوي سلسلة النزول ثقتك؟"] },
      },
      {
        from: 22, to: 29,
        title: { de: "Kein Besessener, sondern eine Ermahnung", en: "Not possessed, but a reminder", ar: "ليس بمجنون بل ذكر للعالمين" },
        lessons: {
          de: ["Der Prophet ﷺ ist den Quraisch bekannt und kein Besessener.", "Der Qurʾān ist Ermahnung für alle Welten.", "Rechtschaffenheit ist gewollt, doch auf Allahs Hilfe angewiesen."],
          en: ["The Prophet ﷺ is known to Quraysh and not possessed.", "The Qurʾān is a reminder for all worlds.", "Uprightness is chosen, yet depends on Allah's help."],
          ar: ["النبي ﷺ صاحبهم المعروف وليس بمجنون.", "القرآن ذكر للعالمين.", "الاستقامة اختيار يحتاج إلى توفيق الله."],
        },
        takeaway: { de: "Fassen Sie heute einen Vorsatz und bitten Sie Allah um Gelingen.", en: "Make a resolution today and ask Allah for success.", ar: "اعزم اليوم على أمر واسأل الله التوفيق." },
        questions: { de: ["Wohin gehen Sie, wenn Sie sich vom Qurʾān abwenden (v. 26)?"], en: ["Where are you going when you turn from the Qurʾān (v. 26)?"], ar: ["إلى أين تذهب إذا أعرضت عن القرآن (آية 26)؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "tabari", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 82,
    theme: {
      de: "Die Frage an den Menschen, was ihn über seinen großzügigen Herrn getäuscht hat, obwohl Er ihn formte und Wächter seine Taten aufzeichnen.",
      en: "The question to man: what deceived him about his generous Lord, though He shaped him and guardians record his deeds.",
      ar: "سؤال الإنسان عما غره بربه الكريم مع أنه سواه وعليه حافظون يكتبون.",
    },
    context: {
      de: "Mekkanisch, aus der Zeit der Warnung vor dem Jenseits und der Gleichgültigkeit der Quraisch.",
      en: "Meccan, from the period of warning about the Hereafter and Quraysh's indifference.",
      ar: "مكية، من مرحلة الإنذار بالآخرة وغفلة قريش.",
    },
    connects: {
      de: "al-Takwīr endet damit, dass jede Seele weiß, was sie vorausgeschickt hat; al-Infiṭār wiederholt dies (v. 5). al-Muṭaffifīn konkretisiert die verzeichneten Taten am Beispiel des Betrugs.",
      en: "al-Takwīr ends with every soul knowing what it sent ahead; al-Infiṭār repeats this (v. 5). al-Muṭaffifīn makes the recorded deeds concrete with the example of fraud.",
      ar: "ختمت التكوير بعلم النفس بما أحضرت، وكررته الانفطار (آية 5)، وتفصل المطففين نموذجًا من الأعمال المكتوبة.",
    },
    lessons: {
      de: [
        "Allahs Großzügigkeit ist kein Grund zur Nachlässigkeit, sondern zur Dankbarkeit.",
        "Die Gestaltung des Körpers ist ein persönliches Zeichen.",
        "Edle Schreiber verzeichnen alles; das lehrt Achtsamkeit.",
        "An jenem Tag besitzt niemand etwas für einen anderen; die Herrschaft gehört Allah.",
      ],
      en: [
        "Allah's generosity is no reason for negligence but for gratitude.",
        "The shaping of the body is a personal sign.",
        "Noble scribes record everything; this teaches mindfulness.",
        "On that Day no one has power over anything for another; the command is Allah's.",
      ],
      ar: [
        "كرم الله داعٍ إلى الشكر لا إلى الغفلة.",
        "تسوية الجسد آية شخصية.",
        "الكرام الكاتبون يحصون كل شيء، فليحذر المرء.",
        "لا تملك نفس لنفس شيئًا يومئذ، والأمر لله.",
      ],
    },
    questions: {
      de: [
        "Was verleitet Sie dazu, Allahs Großzügigkeit als Freibrief zu sehen?",
        "Wie würden Sie handeln, wenn Sie die Schreiber neben sich bewusst spürten?",
      ],
      en: [
        "What tempts you to see Allah's generosity as a free pass?",
        "How would you act if you consciously sensed the scribes beside you?",
      ],
      ar: [
        "ما الذي يغريك بأن تتخذ كرم الله ذريعة؟",
        "كيف تتصرف لو استحضرت الكاتبين بجانبك؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Der Himmel spaltet sich", en: "The sky splits", ar: "انفطار السماء" },
        lessons: {
          de: ["Die Ordnung des Himmels ist nicht ewig.", "Gräber geben ihren Inhalt frei; die Rechnung beginnt."],
          en: ["The order of the sky is not eternal.", "Graves release their contents; the reckoning begins."],
          ar: ["نظام السماء ليس أبديًا.", "تُبعثر القبور ويبدأ الحساب."],
        },
        takeaway: { de: "Denken Sie heute an eine Tat, die Sie vorausschicken möchten.", en: "Think today of one deed you want to send ahead.", ar: "فكر اليوم في عمل تحب أن تقدمه." },
        questions: { de: ["Was haben Sie zurückgestellt, das Sie hätten vorausschicken sollen?"], en: ["What have you held back that you should have sent ahead?"], ar: ["ماذا أخّرت مما كان ينبغي أن تقدمه؟"] },
      },
      {
        from: 6, to: 12,
        title: { de: "Was hat dich getäuscht?", en: "What deceived you?", ar: "ما غرك بربك الكريم" },
        lessons: {
          de: ["Die Frage ist Tadel und Weckruf zugleich.", "Allah hat den Menschen geformt, ausgewogen und gestaltet, wie Er wollte.", "Die Wächter kennen die Taten; nichts bleibt verborgen."],
          en: ["The question is both reproach and wake-up call.", "Allah shaped man, balanced him and formed him as He willed.", "The guardians know the deeds; nothing stays hidden."],
          ar: ["السؤال عتاب وتنبيه معًا.", "خلق الله الإنسان فسواه فعدله في أي صورة شاء.", "الحافظون يعلمون ما يُفعل فلا يخفى شيء."],
        },
        takeaway: { de: "Danken Sie heute für einen Teil Ihres Körpers, den Sie sonst übersehen.", en: "Give thanks today for one part of your body you usually overlook.", ar: "اشكر الله اليوم على عضو من جسدك تغفل عنه." },
        questions: { de: ["Welche Gabe hat Sie eher nachlässig als dankbar gemacht?"], en: ["Which gift has made you careless rather than grateful?"], ar: ["أي نعمة جعلتك غافلًا بدل أن تكون شاكرًا؟"] },
      },
      {
        from: 13, to: 19,
        title: { de: "Zwei Gruppen und der Tag des Gerichts", en: "Two groups and the Day of Judgement", ar: "الفريقان ويوم الدين" },
        lessons: {
          de: ["Die Rechtschaffenen sind in Wonne, die Frevler im Feuer.", "Die Wiederholung der Frage nach dem Tag zeigt seine Größe.", "Niemand kann einem anderen helfen; alles liegt bei Allah."],
          en: ["The righteous are in bliss, the wicked in the Fire.", "The repeated question about the Day shows its greatness.", "No one can help another; everything is with Allah."],
          ar: ["الأبرار في نعيم والفجار في جحيم.", "تكرار السؤال عن يوم الدين تعظيم له.", "لا تملك نفس لنفس شيئًا والأمر لله."],
        },
        takeaway: { de: "Verlassen Sie sich heute in einer Sorge bewusst auf Allah statt auf Menschen.", en: "In one worry today, rely consciously on Allah instead of people.", ar: "توكل اليوم على الله في همٍّ واحد بدل الناس." },
        questions: { de: ["Zu welcher Gruppe führen Ihre heutigen Gewohnheiten?"], en: ["To which group do your current habits lead?"], ar: ["إلى أي الفريقين تقودك عاداتك؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "biqai"],
    review: DRAFT,
  },
  {
    s: 83,
    theme: {
      de: "Unehrlichkeit im Kleinen wurzelt im Vergessen des Gerichts; die Register der Frevler und der Rechtschaffenen und die Umkehrung des Spotts.",
      en: "Dishonesty in small things is rooted in forgetting the Judgement; the registers of the wicked and the righteous and the reversal of mockery.",
      ar: "التطفيف في الصغير منشؤه نسيان البعث، مع ذكر كتاب الفجار وكتاب الأبرار وانقلاب السخرية.",
    },
    context: {
      de: "Die Gelehrten sind uneins: mekkanisch, medinensisch oder auf dem Übergang zwischen beiden offenbart. Viele halten sie für eine der letzten mekkanischen oder ersten medinensischen Suren.",
      en: "Scholars differ: Meccan, Medinan or revealed during the transition. Many consider it among the last Meccan or first Medinan surahs.",
      ar: "اختلف العلماء: مكية أو مدنية أو نزلت بين الهجرتين، وعدّها كثيرون من آخر المكي أو أول المدني.",
    },
    asbab: {
      de: "al-Nasāʾī und Ibn Māja berichten von Ibn ʿAbbās, dass die Leute Medinas beim Messen besonders unehrlich waren, als der Prophet ﷺ ankam, und sie sich nach dieser Offenbarung besserten.",
      en: "al-Nasāʾī and Ibn Māja report from Ibn ʿAbbās that the people of Medina were among the worst in measuring when the Prophet ﷺ arrived, and they improved after this revelation.",
      ar: "روى النسائي وابن ماجه عن ابن عباس أن أهل المدينة كانوا من أخبث الناس كيلًا لما قدم النبي ﷺ، فلما نزلت أحسنوا الكيل.",
    },
    connects: {
      de: "al-Infiṭār nennt die edlen Schreiber; al-Muṭaffifīn beschreibt die Register, in denen sie schreiben. al-Inshiqāq setzt fort mit dem Empfang dieser Bücher.",
      en: "al-Infiṭār mentions the noble scribes; al-Muṭaffifīn describes the registers in which they write. al-Inshiqāq continues with receiving these books.",
      ar: "ذكرت الانفطار الكاتبين، وتصف المطففين الكتاب المرقوم، وتليها الانشقاق بإيتاء الكتب.",
    },
    lessons: {
      de: [
        "Ehrlichkeit in Maß und Gewicht ist Glaubenssache, nicht nur Handelsrecht.",
        "Wer für sich voll nimmt und anderen weniger gibt, misst mit zweierlei Maß.",
        "Sünden legen sich wie Rost auf das Herz (v. 14).",
        "Spott über Gläubige kehrt sich am Ende um.",
        "Im Guten soll man wetteifern (v. 26).",
      ],
      en: [
        "Honesty in measure and weight is a matter of faith, not only of commercial law.",
        "Taking in full and giving less is measuring with double standards.",
        "Sins settle like rust on the heart (v. 14).",
        "Mockery of believers is reversed in the end.",
        "One should compete in good (v. 26).",
      ],
      ar: [
        "الأمانة في الكيل والوزن من الإيمان لا من التجارة فحسب.",
        "من استوفى لنفسه وأخسر لغيره كال بمكيالين.",
        "الذنوب ران على القلب (آية 14).",
        "سخرية المجرمين بالمؤمنين تنقلب عليهم.",
        "التنافس الحق في الخير (آية 26).",
      ],
    },
    questions: {
      de: [
        "Wo messen Sie im Beruf oder in Beziehungen mit zweierlei Maß?",
        "Was setzt sich als Rost auf Ihr Herz, und wie polieren Sie es?",
        "Worin wetteifern Sie tatsächlich?",
      ],
      en: [
        "Where do you measure with double standards at work or in relationships?",
        "What settles as rust on your heart, and how do you polish it?",
        "In what do you actually compete?",
      ],
      ar: [
        "أين تكيل بمكيالين في عملك أو علاقاتك؟",
        "ما الران على قلبك، وكيف تجلوه؟",
        "فيمَ تتنافس حقًا؟",
      ],
    },
    sections: [
      {
        from: 1, to: 6,
        title: { de: "Wehe den Betrügern", en: "Woe to the defrauders", ar: "ويل للمطففين" },
        lessons: {
          de: ["Kleiner Betrug wird mit einer großen Warnung bedacht.", "Die Ursache ist fehlende Gewissheit über die Auferstehung (v. 4).", "Viele Gelehrte übertragen das Prinzip auf jedes Recht, auch Arbeit und Zeit."],
          en: ["Small fraud receives a great warning.", "The cause is lack of certainty about resurrection (v. 4).", "Many scholars extend the principle to every right, including work and time."],
          ar: ["تطفيف يسير قوبل بوعيد شديد.", "سببه ضعف اليقين بالبعث (آية 4).", "عمّم كثير من العلماء المعنى على كل حق، كالعمل والوقت."],
        },
        takeaway: { de: "Geben Sie heute bei der Arbeit vollen Einsatz für die vereinbarte Zeit.", en: "Give full effort at work today for the agreed time.", ar: "أدِّ عملك اليوم كاملًا في الوقت المتفق عليه." },
        questions: { de: ["Wem schulden Sie noch ein volles Maß?"], en: ["To whom do you still owe a full measure?"], ar: ["لمن ما زلت مدينًا بالوفاء؟"] },
      },
      {
        from: 7, to: 17,
        title: { de: "Das Register der Frevler", en: "The register of the wicked", ar: "كتاب الفجار في سجين" },
        lessons: {
          de: ["Taten werden in einem festen Register verzeichnet.", "Wiederholte Sünde verhärtet das Herz, bis es die Wahrheit für Märchen hält.", "Die schwerste Folge ist, vom Herrn verhüllt zu sein (v. 15)."],
          en: ["Deeds are recorded in a fixed register.", "Repeated sin hardens the heart until it takes truth for legends.", "The gravest consequence is being veiled from the Lord (v. 15)."],
          ar: ["الأعمال مكتوبة في كتاب مرقوم.", "تكرار الذنب يقسي القلب حتى يرى الحق أساطير.", "أشد العقوبة الحجب عن الرب (آية 15)."],
        },
        takeaway: { de: "Bitten Sie heute nach einem Fehler sofort um Vergebung.", en: "After a mistake today, ask for forgiveness at once.", ar: "استغفر فور الخطأ اليوم." },
        questions: { de: ["Welche Gewohnheit verhärtet Ihr Herz schleichend?"], en: ["Which habit gradually hardens your heart?"], ar: ["أي عادة تقسي قلبك شيئًا فشيئًا؟"] },
      },
      {
        from: 18, to: 28,
        title: { de: "Das Register der Rechtschaffenen", en: "The register of the righteous", ar: "كتاب الأبرار في عليين" },
        lessons: {
          de: ["Die Nahestehenden bezeugen das Register der Rechtschaffenen.", "Freude zeigt sich auf ihren Gesichtern.", "Wettstreit ist gut, wenn er dem Jenseits gilt."],
          en: ["Those brought near witness the register of the righteous.", "Joy shows on their faces.", "Competition is good when it aims at the Hereafter."],
          ar: ["يشهد المقربون كتاب الأبرار.", "تُعرف في وجوههم نضرة النعيم.", "المنافسة محمودة إذا كانت للآخرة."],
        },
        takeaway: { de: "Wählen Sie heute eine gute Tat, in der Sie mit sich selbst wetteifern.", en: "Choose one good deed today in which you compete with yourself.", ar: "اختر عملًا صالحًا تنافس فيه نفسك اليوم." },
        questions: { de: ["Woran merken Sie, dass Ihr Ehrgeiz dem Diesseits gilt?"], en: ["How do you notice that your ambition is for this world?"], ar: ["كيف تعرف أن طموحك للدنيا؟"] },
      },
      {
        from: 29, to: 36,
        title: { de: "Der Spott kehrt sich um", en: "Mockery reversed", ar: "انقلاب السخرية" },
        lessons: {
          de: ["Frevler lachten, zwinkerten und hielten Gläubige für verirrt.", "Sie waren nicht zu Wächtern über die Gläubigen bestellt.", "Am Ende lachen die Gläubigen, und Gerechtigkeit ist vollzogen."],
          en: ["The wicked laughed, winked and thought believers astray.", "They were not appointed guardians over the believers.", "In the end the believers laugh, and justice is done."],
          ar: ["كان المجرمون يضحكون ويتغامزون ويرمون المؤمنين بالضلال.", "لم يُرسلوا عليهم حافظين.", "في النهاية يضحك المؤمنون ويتم العدل."],
        },
        takeaway: { de: "Bleiben Sie heute gelassen, wenn man Sie wegen Ihres Glaubens belächelt.", en: "Stay calm today if someone smiles at you for your faith.", ar: "اثبت اليوم بهدوء إن سُخر منك لأجل دينك." },
        questions: { de: ["Spotten Sie selbst manchmal über andere, ohne es zu merken?"], en: ["Do you sometimes mock others without noticing?"], ar: ["هل تسخر أحيانًا من غيرك دون أن تشعر؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 84,
    theme: {
      de: "Der Mensch müht sich unaufhörlich zu seinem Herrn hin und wird Ihm begegnen; dann empfängt er sein Buch rechts oder hinter dem Rücken.",
      en: "Man toils relentlessly towards his Lord and will meet Him; then he receives his book in the right hand or behind his back.",
      ar: "الإنسان كادح إلى ربه فملاقيه، ثم يؤتى كتابه بيمينه أو وراء ظهره.",
    },
    context: {
      de: "Mekkanisch, im Rahmen der Warnungen über die Auferstehung an eine Gesellschaft, die sich sicher fühlte.",
      en: "Meccan, part of the warnings about resurrection to a society that felt secure.",
      ar: "مكية، ضمن الإنذار بالبعث لمجتمع آمن مطمئن إلى دنياه.",
    },
    connects: {
      de: "al-Muṭaffifīn beschreibt die Register; al-Inshiqāq ihren Empfang. al-Burūj zeigt dann ein Beispiel standhafter Gläubiger und ihrer Verfolger.",
      en: "al-Muṭaffifīn describes the registers; al-Inshiqāq their receipt. al-Burūj then gives an example of steadfast believers and their persecutors.",
      ar: "وصفت المطففين الكتب، وتذكر الانشقاق إيتاءها، ثم تضرب البروج مثلًا للمؤمنين الثابتين وظالميهم.",
    },
    lessons: {
      de: [
        "Himmel und Erde gehorchen ihrem Herrn; der Mensch soll es ebenso tun.",
        "Jede Mühe führt zur Begegnung mit Allah; das gibt ihr Sinn.",
        "Leichte Abrechnung ist eine Gnade für die Gläubigen.",
        "Sorglose Freude ohne Gedanken an die Rückkehr ist gefährlich (v. 13–14).",
        "Das Leben verläuft in Stufen, die Allah bestimmt (v. 19).",
      ],
      en: [
        "Heaven and earth obey their Lord; man should do likewise.",
        "Every toil leads to meeting Allah; that gives it meaning.",
        "An easy reckoning is a mercy for believers.",
        "Carefree joy without thought of return is dangerous (v. 13–14).",
        "Life passes through stages that Allah decrees (v. 19).",
      ],
      ar: [
        "السماء والأرض أذنتا لربهما، فالإنسان أولى بالطاعة.",
        "كل كدح ينتهي إلى لقاء الله، وبه يكتسب معناه.",
        "الحساب اليسير رحمة بالمؤمنين.",
        "السرور الغافل عن المعاد خطر (آية 13–14).",
        "الحياة أطوار يقدرها الله (آية 19).",
      ],
    },
    questions: {
      de: [
        "Wohin führt Ihre tägliche Mühe?",
        "In welcher Lebensstufe befinden Sie sich, und was verlangt sie von Ihnen?",
      ],
      en: [
        "Where is your daily toil leading?",
        "Which stage of life are you in, and what does it ask of you?",
      ],
      ar: [
        "إلى أين يقودك كدحك اليومي؟",
        "في أي طور أنت الآن، وماذا يطلب منك؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Gehorsam von Himmel und Erde", en: "The obedience of heaven and earth", ar: "إذعان السماء والأرض" },
        lessons: {
          de: ["Die Schöpfung hört auf ihren Herrn und fügt sich, wie es ihr zusteht.", "Die Erde gibt ihren Inhalt preis und wird leer."],
          en: ["Creation listens to its Lord and submits, as is its due.", "The earth casts out its contents and becomes empty."],
          ar: ["الخلق يسمع لربه وينقاد كما يحق له.", "تلقي الأرض ما فيها وتتخلى."],
        },
        takeaway: { de: "Befolgen Sie heute ein Gebot ohne Zögern.", en: "Follow one command today without hesitation.", ar: "امتثل اليوم أمرًا دون تردد." },
        questions: { de: ["Was hält Sie davon ab, so bereitwillig zu gehorchen wie die Schöpfung?"], en: ["What keeps you from obeying as readily as creation?"], ar: ["ما الذي يمنعك من الانقياد كما ينقاد الكون؟"] },
      },
      {
        from: 6, to: 15,
        title: { de: "Mühe, Begegnung und die Bücher", en: "Toil, meeting and the books", ar: "الكدح واللقاء والكتاب" },
        lessons: {
          de: ["Wer sein Buch rechts empfängt, kehrt froh zu seiner Familie zurück.", "Wer es hinter dem Rücken empfängt, ruft nach Vernichtung.", "Die Ursache: Er glaubte nicht an die Rückkehr, obwohl Allah ihn sah."],
          en: ["Whoever receives his book in the right hand returns joyfully to his family.", "Whoever receives it behind his back cries for destruction.", "The cause: he thought he would never return, though Allah saw him."],
          ar: ["من أوتي كتابه بيمينه انقلب إلى أهله مسرورًا.", "ومن أوتيه وراء ظهره دعا ثبورًا.", "سببه ظنه ألا يحور، والله به بصير."],
        },
        takeaway: { de: "Machen Sie heute Ihre Mühe zu einer Mühe für Allah durch eine gute Absicht.", en: "Make your toil today a toil for Allah through a good intention.", ar: "اجعل كدحك اليوم لله بنية صالحة." },
        questions: { de: ["Wie möchten Sie zu Ihrer Familie zurückkehren?"], en: ["How would you like to return to your family?"], ar: ["كيف تحب أن تنقلب إلى أهلك؟"] },
      },
      {
        from: 16, to: 25,
        title: { de: "Stufen des Lebens und die Antwort", en: "Stages of life and the response", ar: "الأطوار والاستجابة" },
        lessons: {
          de: ["Abendröte, Nacht und Mond wandeln sich, so wie der Mensch Stufen durchläuft.", "Wer den Qurʾān hört und sich nicht niederwirft, verweigert die angemessene Antwort.", "Allah kennt, was die Menschen in sich tragen."],
          en: ["Twilight, night and moon change, just as man passes through stages.", "Whoever hears the Qurʾān and does not prostrate refuses the fitting response.", "Allah knows what people hold within."],
          ar: ["الشفق والليل والقمر تتحول كما تتقلب أطوار الإنسان.", "من سمع القرآن ولم يسجد امتنع عن الاستجابة اللائقة.", "الله أعلم بما يوعون."],
        },
        takeaway: { de: "Halten Sie beim Hören des Qurʾān heute bewusst inne.", en: "Pause consciously when hearing the Qurʾān today.", ar: "توقف بخشوع عند سماع القرآن اليوم." },
        questions: { de: ["Was hindert Ihr Herz daran, sich beim Qurʾān zu beugen?"], en: ["What prevents your heart from bowing at the Qurʾān?"], ar: ["ما الذي يمنع قلبك من الخضوع عند القرآن؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "biqai"],
    review: DRAFT,
  },
  {
    s: 85,
    theme: {
      de: "Trost für verfolgte Gläubige: Die Leute des Grabens wurden für ihren Glauben verbrannt, doch Allah ist Zeuge, und Sein Gericht kommt gewiss.",
      en: "Consolation for persecuted believers: the People of the Ditch were burned for their faith, yet Allah is witness and His judgement will surely come.",
      ar: "تسلية المؤمنين المضطهدين: أُحرق أصحاب الأخدود لإيمانهم، والله شهيد وعقابه آتٍ.",
    },
    context: {
      de: "Mekkanisch, als die frühen Muslime gefoltert wurden. Die Geschichte vom Jungen, dem König und dem Mönch überliefert Muslim von Ṣuhayb; die Exegeten verbinden sie mit dieser Sure.",
      en: "Meccan, when the early Muslims were being tortured. The story of the boy, the king and the monk is narrated by Muslim from Ṣuhayb; exegetes connect it to this surah.",
      ar: "مكية، نزلت والمسلمون الأوائل يُعذبون. وقصة الغلام والملك والراهب رواها مسلم عن صهيب، وربطها المفسرون بالسورة.",
    },
    connects: {
      de: "al-Inshiqāq endet mit der Leugnung und dem schmerzlichen Lohn; al-Burūj zeigt Leugner, die Gläubige quälen. al-Ṭāriq beginnt wieder mit einem Schwur beim Himmel.",
      en: "al-Inshiqāq ends with denial and painful punishment; al-Burūj shows deniers torturing believers. al-Ṭāriq again opens with an oath by the sky.",
      ar: "ختمت الانشقاق بالتكذيب والعذاب، وتعرض البروج تعذيب المكذبين للمؤمنين، وتفتتح الطارق بالقسم بالسماء كذلك.",
    },
    lessons: {
      de: [
        "Die Gläubigen wurden nur gehasst, weil sie an Allah glaubten (v. 8).",
        "Wahrer Erfolg ist das Paradies, nicht das Überleben im Diesseits (v. 11).",
        "Allah lässt Reue offen, selbst für Verfolger (v. 10).",
        "Allah ist liebevoll und vergebend, zugleich streng in Seiner Strafe.",
        "Der Qurʾān ist auf einer bewahrten Tafel gesichert.",
      ],
      en: [
        "The believers were hated only for believing in Allah (v. 8).",
        "True success is Paradise, not survival in this world (v. 11).",
        "Allah leaves repentance open, even to persecutors (v. 10).",
        "Allah is loving and forgiving, yet severe in His punishment.",
        "The Qurʾān is secured on a preserved tablet.",
      ],
      ar: [
        "ما نقموا من المؤمنين إلا إيمانهم بالله (آية 8).",
        "الفوز الكبير الجنة لا النجاة الدنيوية (آية 11).",
        "باب التوبة مفتوح حتى للظالمين (آية 10).",
        "الله غفور ودود وبطشه شديد.",
        "القرآن محفوظ في لوح محفوظ.",
      ],
    },
    questions: {
      de: [
        "Wie definieren Sie Erfolg, und stimmt es mit v. 11 überein?",
        "Welche Prüfung für Ihren Glauben ertragen Sie heute?",
      ],
      en: [
        "How do you define success, and does it match v. 11?",
        "Which trial for your faith are you bearing today?",
      ],
      ar: [
        "كيف تعرّف الفوز، وهل يوافق الآية 11؟",
        "ما الابتلاء الذي تصبر عليه في دينك اليوم؟",
      ],
    },
    sections: [
      {
        from: 1, to: 9,
        title: { de: "Die Leute des Grabens", en: "The People of the Ditch", ar: "أصحاب الأخدود" },
        lessons: {
          de: ["Die Schwüre auf Himmel, Tag und Zeugen kündigen ein ernstes Urteil an.", "Die Verfolger sahen ungerührt zu; Grausamkeit stumpft ab.", "Allah ist Zeuge aller Dinge, auch wenn kein Mensch hinsieht."],
          en: ["The oaths by heaven, Day and witnesses announce a serious verdict.", "The persecutors watched unmoved; cruelty numbs.", "Allah witnesses everything, even when no human looks."],
          ar: ["الأقسام بالسماء واليوم والشاهد تمهيد لحكم جليل.", "شهد الظالمون ما فعلوا بلا رحمة، والقسوة تُبلّد.", "الله على كل شيء شهيد ولو لم يرَ أحد."],
        },
        takeaway: { de: "Gedenken Sie heute im Bittgebet verfolgter Gläubiger.", en: "Remember persecuted believers in your supplication today.", ar: "ادعُ اليوم للمؤمنين المستضعفين." },
        questions: { de: ["Wo schauen Sie bei Unrecht zu, ohne zu handeln?"], en: ["Where do you watch injustice without acting?"], ar: ["أين تشهد الظلم ولا تتحرك؟"] },
      },
      {
        from: 10, to: 16,
        title: { de: "Strafe, Lohn und Allahs Eigenschaften", en: "Punishment, reward and Allah's attributes", ar: "الجزاء وصفات الله" },
        lessons: {
          de: ["Die Strafe trifft nur die, die nicht bereuen.", "Allah beginnt und wiederholt die Schöpfung.", "Er tut, was Er will; nichts zwingt Ihn."],
          en: ["The punishment strikes only those who do not repent.", "Allah begins creation and repeats it.", "He does what He wills; nothing compels Him."],
          ar: ["العذاب لمن لم يتب.", "الله يبدئ ويعيد.", "فعال لما يريد لا مكره له."],
        },
        takeaway: { de: "Wenden Sie sich heute mit einer konkreten Sünde in Reue an Allah.", en: "Turn to Allah in repentance today for one specific sin.", ar: "تب اليوم إلى الله من ذنب محدد." },
        questions: { de: ["Was bedeutet es Ihnen, dass Allah liebevoll ist (v. 14)?"], en: ["What does it mean to you that Allah is loving (v. 14)?"], ar: ["ماذا يعني لك أن الله ودود (آية 14)؟"] },
      },
      {
        from: 17, to: 22,
        title: { de: "Pharao, Thamūd und die bewahrte Tafel", en: "Pharaoh, Thamūd and the preserved tablet", ar: "فرعون وثمود واللوح المحفوظ" },
        lessons: {
          de: ["Mächtige Heere wurden vernichtet; die heutigen Verfolger sind nicht stärker.", "Allah umfasst die Leugner von allen Seiten.", "Der Qurʾān ist ruhmvoll und unantastbar."],
          en: ["Mighty armies were destroyed; today's persecutors are no stronger.", "Allah encompasses the deniers from all sides.", "The Qurʾān is glorious and inviolable."],
          ar: ["أُهلكت جنود عظيمة، وظالمو اليوم ليسوا أقوى.", "الله من ورائهم محيط.", "القرآن مجيد محفوظ."],
        },
        takeaway: { de: "Lassen Sie sich heute nicht von scheinbarer Übermacht entmutigen.", en: "Do not let apparent superior power discourage you today.", ar: "لا تحبطك اليوم قوة الباطل الظاهرة." },
        questions: { de: ["Welche Geschichte der Vergangenheit stärkt Ihre Geduld?"], en: ["Which story from the past strengthens your patience?"], ar: ["أي قصة من الماضي تقوي صبرك؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "qurtubi", "ibnAshur", "tabari"],
    review: DRAFT,
  },
  {
    s: 86,
    theme: {
      de: "Jede Seele hat einen Wächter; wer den Menschen aus einem Tropfen erschuf, kann ihn zurückbringen, wenn die Geheimnisse offengelegt werden.",
      en: "Every soul has a guardian; He who created man from a drop can bring him back when secrets are laid bare.",
      ar: "على كل نفس حافظ، والذي خلق الإنسان من ماء دافق قادر على رجعه يوم تُبلى السرائر.",
    },
    context: {
      de: "Mekkanisch, als die Quraisch Pläne gegen den Propheten ﷺ und seine Botschaft schmiedeten.",
      en: "Meccan, when Quraysh were plotting against the Prophet ﷺ and his message.",
      ar: "مكية، حين كانت قريش تكيد للنبي ﷺ ودعوته.",
    },
    connects: {
      de: "al-Burūj nennt Allah Zeugen und Umfasser; al-Ṭāriq zeigt Seine Wächter über jede Seele. al-Aʿlā folgt mit dem Lobpreis des Herrn, der erschafft und formt.",
      en: "al-Burūj names Allah as witness and encompasser; al-Ṭāriq shows His guardians over every soul. al-Aʿlā follows with glorifying the Lord who creates and proportions.",
      ar: "وصفت البروج الله بالشهيد المحيط، وتذكر الطارق الحافظ على كل نفس، وتليها الأعلى بتسبيح الرب الذي خلق فسوّى.",
    },
    lessons: {
      de: [
        "Niemand ist unbeobachtet; das schützt und verpflichtet zugleich.",
        "Der eigene Ursprung ist ein Argument für die Auferstehung.",
        "Am Tag des Gerichts werden innere Absichten sichtbar (v. 9).",
        "Der Qurʾān ist ein entscheidendes Wort, kein Spiel (v. 13–14).",
        "Allahs Plan überragt jede menschliche List.",
      ],
      en: [
        "No one is unobserved; this both protects and obligates.",
        "One's own origin is an argument for resurrection.",
        "On the Day of Judgement inner intentions become visible (v. 9).",
        "The Qurʾān is a decisive word, not amusement (v. 13–14).",
        "Allah's plan surpasses every human scheme.",
      ],
      ar: [
        "لا أحد بلا رقيب، وفي ذلك حفظ وتكليف.",
        "أصل الإنسان دليل على بعثه.",
        "تُكشف السرائر يوم القيامة (آية 9).",
        "القرآن قول فصل وما هو بالهزل (آية 13–14).",
        "تدبير الله فوق كل كيد.",
      ],
    },
    questions: {
      de: [
        "Welche Absicht in Ihrem Herzen möchten Sie vor dem Tag der Offenlegung bereinigen?",
        "Wie ernst nehmen Sie die Worte des Qurʾān im Vergleich zu Unterhaltung?",
      ],
      en: [
        "Which intention in your heart would you like to purify before the Day of disclosure?",
        "How seriously do you take the words of the Qurʾān compared with entertainment?",
      ],
      ar: [
        "أي نية في قلبك تريد إصلاحها قبل يوم تُبلى السرائر؟",
        "ما مدى جديتك مع القرآن مقارنة باللهو؟",
      ],
    },
    sections: [
      {
        from: 1, to: 4,
        title: { de: "Der nächtliche Stern und der Wächter", en: "The night star and the guardian", ar: "الطارق والحافظ" },
        lessons: {
          de: ["Der durchdringende Stern weckt Aufmerksamkeit für das Unsichtbare.", "Über jeder Seele steht ein Wächter; die Exegeten nennen Engel, die Taten aufzeichnen und schützen."],
          en: ["The piercing star draws attention to the unseen.", "Over every soul is a guardian; exegetes mention angels who record deeds and protect."],
          ar: ["النجم الثاقب ينبه إلى الغيب.", "على كل نفس حافظ، وفسره العلماء بالملائكة الحفظة الكاتبين."],
        },
        takeaway: { de: "Handeln Sie heute in einer Situation so, als sähe man Sie.", en: "In one situation today, act as if you were seen.", ar: "تصرف اليوم في موقف كأنك مرئي." },
        questions: { de: ["Wie verändert sich Ihr Verhalten, wenn niemand zusieht?"], en: ["How does your behaviour change when no one is watching?"], ar: ["كيف يتغير سلوكك حين لا يراك أحد؟"] },
      },
      {
        from: 5, to: 10,
        title: { de: "Ursprung und Rückkehr", en: "Origin and return", ar: "النشأة والرجع" },
        lessons: {
          de: ["Der Mensch soll auf seinen Ursprung schauen und Demut lernen.", "Wer aus Geringem erschafft, kann zurückbringen.", "An jenem Tag hat der Mensch weder Kraft noch Helfer."],
          en: ["Man should look at his origin and learn humility.", "He who creates from something small can bring back.", "On that Day man has neither strength nor helper."],
          ar: ["لينظر الإنسان مم خُلق فيتواضع.", "من خلق من ماء دافق قادر على الرجع.", "لا قوة له يومئذ ولا ناصر."],
        },
        takeaway: { de: "Reinigen Sie heute eine verborgene Absicht.", en: "Purify one hidden intention today.", ar: "أصلح اليوم نية خفية." },
        questions: { de: ["Was würde sichtbar, wenn Ihre Geheimnisse offenlägen?"], en: ["What would become visible if your secrets were laid bare?"], ar: ["ماذا يظهر لو بُليت سرائرك؟"] },
      },
      {
        from: 11, to: 17,
        title: { de: "Ein entscheidendes Wort und die List", en: "A decisive word and the scheming", ar: "القول الفصل والكيد" },
        lessons: {
          de: ["Wie Regen die Erde öffnet, so trennt der Qurʾān Wahrheit von Falschheit.", "Die Leugner planen, doch Allah plant ebenfalls.", "Dem Propheten ﷺ wird Geduld geboten: eine kurze Frist."],
          en: ["As rain opens the earth, the Qurʾān separates truth from falsehood.", "The deniers scheme, yet Allah also plans.", "The Prophet ﷺ is told to be patient: a short respite."],
          ar: ["كما يصدع المطر الأرض يفصل القرآن بين الحق والباطل.", "يكيدون والله يدبر.", "أُمر النبي ﷺ بالإمهال قليلًا."],
        },
        takeaway: { de: "Antworten Sie heute auf eine Anfeindung mit Geduld statt mit Gegenlist.", en: "Respond to one hostility today with patience instead of counter-scheming.", ar: "قابل اليوم عداوة بالصبر لا بالكيد." },
        questions: { de: ["Vertrauen Sie darauf, dass Allahs Plan über dem anderer steht?"], en: ["Do you trust that Allah's plan is above that of others?"], ar: ["هل تثق أن تدبير الله فوق كيدهم؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "tabari"],
    review: DRAFT,
  },
  {
    s: 87,
    theme: {
      de: "Lobpreis des Allerhöchsten, der erschafft, formt, bestimmt und leitet; Läuterung führt zum Erfolg, und das Jenseits ist besser und bleibender.",
      en: "Glorifying the Most High, who creates, proportions, decrees and guides; purification leads to success, and the Hereafter is better and more lasting.",
      ar: "تسبيح الرب الأعلى الذي خلق فسوى وقدر فهدى، والفلاح في التزكي، والآخرة خير وأبقى.",
    },
    context: {
      de: "Frühmekkanisch. al-Bukhārī berichtet von al-Barāʾ, dass die Gefährten in Medina sie bereits kannten, als der Prophet ﷺ ankam. Der Prophet ﷺ rezitierte sie oft im Freitags- und Festgebet, wie Muslim überliefert.",
      en: "Early Meccan. al-Bukhārī reports from al-Barāʾ that the Companions in Medina already knew it when the Prophet ﷺ arrived. The Prophet ﷺ often recited it in the Friday and Eid prayers, as Muslim narrates.",
      ar: "مكية مبكرة، روى البخاري عن البراء أن الصحابة في المدينة كانوا يعرفونها قبل قدوم النبي ﷺ، وروى مسلم أنه ﷺ كان يقرأ بها في الجمعة والعيدين.",
    },
    connects: {
      de: "al-Ṭāriq zeigt die Erschaffung des Menschen; al-Aʿlā preist den, der alles erschafft und formt. al-Ghāshiya schildert dann das Feuer und das Paradies, die hier angedeutet werden.",
      en: "al-Ṭāriq shows man's creation; al-Aʿlā glorifies the One who creates and proportions everything. al-Ghāshiya then depicts the Fire and Paradise hinted at here.",
      ar: "بينت الطارق خلق الإنسان، وتسبح الأعلى من خلق كل شيء فسواه، وتفصل الغاشية النار والجنة المذكورتين إجمالًا.",
    },
    lessons: {
      de: [
        "Lobpreis Allahs ist der Ausgangspunkt allen Erinnerns.",
        "Jedes Geschöpf ist für seinen Zweck geformt und geleitet (v. 3).",
        "Allah erleichtert dem Propheten ﷺ den Weg; Erleichterung ist ein Prinzip der Religion.",
        "Erfolg hat, wer sich läutert, Allahs gedenkt und betet (v. 14–15).",
        "Das Diesseits zu bevorzugen ist der Kern menschlichen Irrtums.",
      ],
      en: [
        "Glorifying Allah is the starting point of all remembrance.",
        "Every creature is shaped for its purpose and guided (v. 3).",
        "Allah eases the Prophet's ﷺ way; ease is a principle of the religion.",
        "Successful is the one who purifies himself, remembers Allah and prays (v. 14–15).",
        "Preferring this world is the core of human error.",
      ],
      ar: [
        "التسبيح منطلق كل ذكر.",
        "كل مخلوق مقدَّر لغايته مهدي إليها (آية 3).",
        "يسّر الله نبيه ﷺ لليسرى، واليسر أصل في الدين.",
        "أفلح من تزكى وذكر اسم ربه فصلى (آية 14–15).",
        "إيثار الدنيا أصل خطأ الإنسان.",
      ],
    },
    questions: {
      de: [
        "Wozu wurden Sie geformt und geleitet?",
        "Wo ziehen Sie das Diesseits dem Bleibenden vor?",
      ],
      en: [
        "For what were you shaped and guided?",
        "Where do you prefer this world over what lasts?",
      ],
      ar: [
        "لأي غاية قُدّرت وهُديت؟",
        "أين تؤثر الدنيا على الباقي؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Der Herr, der erschafft und leitet", en: "The Lord who creates and guides", ar: "الرب الذي خلق فهدى" },
        lessons: {
          de: ["Lobpreis bedeutet, Allah über jeden Mangel zu erheben.", "Schöpfung, Formung, Bestimmung und Leitung bilden eine Kette.", "Das Weideland wird grün und dann welk: ein Bild der Vergänglichkeit."],
          en: ["Glorification means exalting Allah above every deficiency.", "Creation, proportion, decree and guidance form a chain.", "Pasture turns green and then withers: an image of transience."],
          ar: ["التسبيح تنزيه الله عن كل نقص.", "الخلق والتسوية والتقدير والهداية سلسلة واحدة.", "المرعى يخضر ثم يصير غثاء: صورة للفناء."],
        },
        takeaway: { de: "Sprechen Sie heute im Niederwerfen den Lobpreis bewusst und langsam.", en: "Today, say the glorification in prostration consciously and slowly.", ar: "سبّح اليوم في سجودك بتمهل وحضور." },
        questions: { de: ["Wofür hat Allah Ihnen eine besondere Begabung gegeben?"], en: ["For what has Allah given you a particular talent?"], ar: ["لأي غاية وهبك الله موهبتك؟"] },
      },
      {
        from: 6, to: 13,
        title: { de: "Rezitation, Erleichterung und Ermahnung", en: "Recitation, ease and reminder", ar: "الإقراء والتيسير والتذكير" },
        lessons: {
          de: ["Allah sicherte dem Propheten ﷺ das Bewahren des Qurʾān zu.", "Ermahnen soll man dort, wo es nützt; die Gelehrten deuten dies unterschiedlich.", "Wer Allah fürchtet, nimmt die Ermahnung an; der Unglückselige meidet sie."],
          en: ["Allah assured the Prophet ﷺ that he would retain the Qurʾān.", "Remind where it benefits; scholars interpret this condition differently.", "Whoever fears Allah accepts the reminder; the wretched avoids it."],
          ar: ["تكفل الله لنبيه ﷺ بحفظ القرآن.", "التذكير حيث تنفع الذكرى، وللعلماء في الشرط أقوال.", "يتذكر من يخشى ويتجنبها الأشقى."],
        },
        takeaway: { de: "Wiederholen Sie heute einen auswendig gelernten Abschnitt.", en: "Review one memorised passage today.", ar: "راجع اليوم مقطعًا من محفوظك." },
        questions: { de: ["Nehmen Sie Ermahnungen an, oder weichen Sie ihnen aus?"], en: ["Do you accept reminders or avoid them?"], ar: ["هل تقبل الذكرى أم تتجنبها؟"] },
      },
      {
        from: 14, to: 19,
        title: { de: "Läuterung und das Bleibende", en: "Purification and what lasts", ar: "التزكية والآخرة الباقية" },
        lessons: {
          de: ["Erfolg beginnt mit innerer Reinigung, dann Gedenken, dann Gebet.", "Das Jenseits ist besser in der Qualität und bleibender in der Dauer.", "Diese Botschaft stand schon in den Schriften Ibrāhīms und Mūsās."],
          en: ["Success begins with inner purification, then remembrance, then prayer.", "The Hereafter is better in quality and more lasting in duration.", "This message was already in the scriptures of Ibrāhīm and Mūsā."],
          ar: ["الفلاح يبدأ بالتزكية ثم الذكر ثم الصلاة.", "الآخرة خير نوعًا وأبقى دوامًا.", "هذا المعنى في صحف إبراهيم وموسى."],
        },
        takeaway: { de: "Bevorzugen Sie heute einmal bewusst das Bleibende vor dem Schnellen.", en: "Today, consciously prefer the lasting over the quick once.", ar: "آثر اليوم الباقي على العاجل مرة عن وعي." },
        questions: { de: ["Was würden Sie aufgeben, wenn Sie das Bleibende wirklich vorzögen?"], en: ["What would you give up if you truly preferred what lasts?"], ar: ["ما الذي تتركه لو آثرت الباقي حقًا؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "biqai", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 88,
    theme: {
      de: "Die überwältigende Stunde teilt die Menschen in Erschöpfte und Glückliche; die Zeichen der Schöpfung laden zum Nachdenken ein, und der Prophet ﷺ ist nur Ermahner.",
      en: "The overwhelming Hour divides people into the exhausted and the joyful; the signs of creation invite reflection, and the Prophet ﷺ is only a reminder.",
      ar: "الغاشية تقسم الناس إلى خاشعين ناصبين وناعمين راضين، وآيات الخلق دعوة إلى النظر، والنبي ﷺ مذكّر فحسب.",
    },
    context: {
      de: "Mekkanisch. Muslim überliefert, dass der Prophet ﷺ sie zusammen mit al-Aʿlā im Freitags- und Festgebet rezitierte.",
      en: "Meccan. Muslim narrates that the Prophet ﷺ recited it together with al-Aʿlā in the Friday and Eid prayers.",
      ar: "مكية، وروى مسلم أن النبي ﷺ كان يقرؤها مع الأعلى في الجمعة والعيدين.",
    },
    connects: {
      de: "al-Aʿlā erwähnt das große Feuer und das bessere Jenseits; al-Ghāshiya schildert beides ausführlich. al-Fajr zeigt dann Völker, die sich der Ermahnung verweigerten.",
      en: "al-Aʿlā mentions the great Fire and the better Hereafter; al-Ghāshiya depicts both in detail. al-Fajr then shows nations that refused the reminder.",
      ar: "ذكرت الأعلى النار الكبرى والآخرة الخير، وفصلتهما الغاشية، وتعرض الفجر أممًا أعرضت عن الذكرى.",
    },
    lessons: {
      de: [
        "Mühe ohne Glauben kann erschöpfen, ohne zu nützen (v. 3).",
        "Zufriedenheit mit dem eigenen Streben ist ein Zeichen des Erfolgs (v. 9).",
        "Kamel, Himmel, Berge und Erde sind ein offenes Lehrbuch.",
        "Der Ermahner zwingt nicht; die Abrechnung liegt bei Allah.",
      ],
      en: [
        "Toil without faith can exhaust without benefiting (v. 3).",
        "Contentment with one's striving is a sign of success (v. 9).",
        "Camel, sky, mountains and earth are an open textbook.",
        "The reminder does not compel; the reckoning is with Allah.",
      ],
      ar: [
        "العمل بلا إيمان نَصَب بلا ثمرة (آية 3).",
        "الرضا بالسعي علامة الفلاح (آية 9).",
        "الإبل والسماء والجبال والأرض كتاب مفتوح.",
        "المذكّر لا يُكره، والحساب على الله.",
      ],
    },
    questions: {
      de: [
        "Ist Ihre tägliche Mühe eine, mit der Sie am Ende zufrieden sein werden?",
        "Wann haben Sie zuletzt bewusst den Himmel betrachtet?",
      ],
      en: [
        "Is your daily toil one you will be content with in the end?",
        "When did you last consciously look at the sky?",
      ],
      ar: [
        "هل سعيك اليومي مما سترضى به في النهاية؟",
        "متى تأملت السماء آخر مرة؟",
      ],
    },
    sections: [
      {
        from: 1, to: 7,
        title: { de: "Erschöpfte Gesichter", en: "Exhausted faces", ar: "وجوه خاشعة ناصبة" },
        lessons: {
          de: ["Manche arbeiteten hart, doch ohne richtigen Glauben; so deuten es mehrere Exegeten.", "Speise ohne Nutzen ist das Gegenbild zu nährender Versorgung."],
          en: ["Some worked hard, yet without right faith; so several exegetes explain it.", "Food without benefit is the opposite of nourishing provision."],
          ar: ["عملوا ونصبوا بلا إيمان صحيح في تفسير جماعة.", "طعام لا يسمن ولا يغني نقيض الرزق النافع."],
        },
        takeaway: { de: "Prüfen Sie heute, ob eine Ihrer Anstrengungen die richtige Absicht hat.", en: "Check today whether one of your efforts has the right intention.", ar: "راجع اليوم نية عمل من أعمالك." },
        questions: { de: ["Wofür arbeiten Sie hart, ohne dass es Ihnen im Jenseits nützt?"], en: ["What do you work hard for that will not benefit you in the Hereafter?"], ar: ["فيمَ تتعب ولا ينفعك في الآخرة؟"] },
      },
      {
        from: 8, to: 16,
        title: { de: "Glückliche Gesichter", en: "Joyful faces", ar: "وجوه ناعمة" },
        lessons: {
          de: ["Die Freude der Gläubigen kommt aus der Zufriedenheit mit ihrem Streben.", "Im Paradies gibt es kein leeres Gerede.", "Die Beschreibung weckt Sehnsucht, nicht bloße Neugier."],
          en: ["The believers' joy comes from contentment with their striving.", "In Paradise there is no idle talk.", "The description awakens longing, not mere curiosity."],
          ar: ["نعيم المؤمنين ثمرة رضاهم بسعيهم.", "لا تُسمع فيها لاغية.", "الوصف يبعث الشوق لا الفضول."],
        },
        takeaway: { de: "Tun Sie heute etwas, mit dem Sie im Jenseits zufrieden sein möchten.", en: "Do something today you would like to be content with in the Hereafter.", ar: "اعمل اليوم ما تحب أن ترضى به في الآخرة." },
        questions: { de: ["Welche Ihrer Taten würde Sie dort froh machen?"], en: ["Which of your deeds would make you glad there?"], ar: ["أي أعمالك يسرك أن تلقاه هناك؟"] },
      },
      {
        from: 17, to: 20,
        title: { de: "Schauen Sie hin", en: "Look closely", ar: "أفلا ينظرون" },
        lessons: {
          de: ["Die genannten Zeichen waren dem arabischen Hörer täglich vor Augen.", "Nachdenken über das Vertraute führt zum Schöpfer."],
          en: ["The signs named were before the Arab listener's eyes daily.", "Reflecting on the familiar leads to the Creator."],
          ar: ["الآيات المذكورة كانت أمام عين العربي كل يوم.", "التفكر في المألوف يوصل إلى الخالق."],
        },
        takeaway: { de: "Betrachten Sie heute fünf Minuten lang ein Stück Natur.", en: "Spend five minutes today contemplating a piece of nature.", ar: "تأمل اليوم خمس دقائق في آية من الطبيعة." },
        questions: { de: ["Welches alltägliche Zeichen haben Sie nie richtig angesehen?"], en: ["Which everyday sign have you never really looked at?"], ar: ["أي آية يومية لم تنظر إليها حقًا؟"] },
      },
      {
        from: 21, to: 26,
        title: { de: "Erinnern ohne Zwang", en: "Reminding without compulsion", ar: "التذكير بلا سيطرة" },
        lessons: {
          de: ["Aufgabe des Propheten ﷺ ist das Erinnern, nicht die Kontrolle.", "Die Rückkehr und die Abrechnung liegen bei Allah allein."],
          en: ["The Prophet's ﷺ task is reminding, not controlling.", "The return and the reckoning are with Allah alone."],
          ar: ["مهمة النبي ﷺ التذكير لا السيطرة.", "الإياب والحساب إلى الله وحده."],
        },
        takeaway: { de: "Erinnern Sie heute jemanden freundlich und lassen Sie ihm die Entscheidung.", en: "Remind someone kindly today and leave the decision to him.", ar: "ذكّر اليوم أحدًا بلطف واترك له القرار." },
        questions: { de: ["Wo versuchen Sie zu kontrollieren, statt zu erinnern?"], en: ["Where do you try to control instead of remind?"], ar: ["أين تحاول السيطرة بدل التذكير؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "biqai"],
    review: DRAFT,
  },
  {
    s: 89,
    theme: {
      de: "Wohlstand und Mangel sind Prüfungen, nicht Zeichen von Ehre oder Erniedrigung; Tyrannen gehen unter, und die ruhige Seele kehrt zufrieden zu ihrem Herrn zurück.",
      en: "Wealth and want are tests, not signs of honour or humiliation; tyrants perish, and the tranquil soul returns content to its Lord.",
      ar: "السعة والضيق ابتلاء لا علامة كرامة أو إهانة، والطغاة يهلكون، والنفس المطمئنة ترجع إلى ربها راضية.",
    },
    context: {
      de: "Mekkanisch, als wohlhabende Quraisch Waisen und Arme vernachlässigten und auf ihre Macht vertrauten.",
      en: "Meccan, when wealthy Quraysh neglected orphans and the poor and trusted in their power.",
      ar: "مكية، حين أهمل أغنياء قريش اليتامى والمساكين واغتروا بقوتهم.",
    },
    connects: {
      de: "al-Ghāshiya endet mit der Abrechnung bei Allah; al-Fajr zeigt Völker, über die abgerechnet wurde. al-Balad setzt mit dem Menschen in Mühsal und dem steilen Weg fort.",
      en: "al-Ghāshiya ends with the reckoning being with Allah; al-Fajr shows nations that were reckoned. al-Balad continues with man in toil and the steep path.",
      ar: "ختمت الغاشية بأن الحساب على الله، وتعرض الفجر أممًا حوسبت، وتليها البلد بالإنسان في كبد والعقبة.",
    },
    lessons: {
      de: [
        "Reichtum und Armut sind beide Prüfungen (v. 15–16).",
        "Achtung vor Waisen und Fürsorge für Arme sind Prüfsteine des Glaubens.",
        "Macht schützt nicht vor dem Untergang.",
        "Spätes Erinnern nützt nichts mehr (v. 23).",
        "Die ruhige Seele ist das Ziel: zufrieden und Allah wohlgefällig.",
      ],
      en: [
        "Wealth and poverty are both tests (v. 15–16).",
        "Honouring orphans and caring for the poor are touchstones of faith.",
        "Power does not protect from downfall.",
        "Remembering too late no longer helps (v. 23).",
        "The tranquil soul is the goal: content and pleasing to Allah.",
      ],
      ar: [
        "الغنى والفقر كلاهما ابتلاء (آية 15–16).",
        "إكرام اليتيم والحض على طعام المسكين محك الإيمان.",
        "القوة لا تمنع الهلاك.",
        "التذكر المتأخر لا ينفع (آية 23).",
        "الغاية النفس المطمئنة الراضية المرضية.",
      ],
    },
    questions: {
      de: [
        "Wie deuten Sie Phasen des Wohlstands und des Mangels in Ihrem Leben?",
        "Was gibt Ihrer Seele echte Ruhe?",
        "Wie oft ermutigen Sie andere, Arme zu speisen?",
      ],
      en: [
        "How do you interpret phases of plenty and want in your life?",
        "What gives your soul real tranquillity?",
        "How often do you encourage others to feed the poor?",
      ],
      ar: [
        "كيف تفهم أوقات السعة والضيق في حياتك؟",
        "ما الذي يمنح نفسك طمأنينة حقيقية؟",
        "كم مرة تحض غيرك على إطعام المسكين؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Schwüre bei Morgendämmerung und Nächten", en: "Oaths by the dawn and nights", ar: "القسم بالفجر والليالي" },
        lessons: {
          de: ["Die meisten Exegeten deuten die zehn Nächte als die ersten zehn Tage des Dhū l-Ḥijja; andere nennen Ramaḍān.", "Die Schwüre richten sich an den Verständigen (v. 5)."],
          en: ["Most exegetes take the ten nights as the first ten days of Dhū l-Ḥijja; others mention Ramaḍān.", "The oaths address the person of understanding (v. 5)."],
          ar: ["الليالي العشر عند أكثر المفسرين عشر ذي الحجة، وقيل العشر الأواخر من رمضان.", "الأقسام لذي حِجر (آية 5)."],
        },
        takeaway: { de: "Nutzen Sie die nächste besondere Zeit bewusst für mehr Gottesdienst.", en: "Use the next special season consciously for more worship.", ar: "اغتنم الموسم الفاضل القادم بمزيد من العبادة." },
        questions: { de: ["Welche Zeiten nutzen Sie bewusst für Allah?"], en: ["Which times do you consciously use for Allah?"], ar: ["أي الأوقات تخصصها لله عن وعي؟"] },
      },
      {
        from: 6, to: 14,
        title: { de: "ʿĀd, Thamūd und Pharao", en: "ʿĀd, Thamūd and Pharaoh", ar: "عاد وثمود وفرعون" },
        lessons: {
          de: ["Hohe Bauten, gehauene Felsen und Pfähle der Macht retteten niemanden.", "Übermaß an Unheil führt zur Strafe.", "Allah ist stets auf der Lauer (v. 14): nichts entgeht Ihm."],
          en: ["Lofty buildings, carved rocks and pillars of power saved no one.", "Excess in corruption leads to punishment.", "Allah is ever watchful (v. 14): nothing escapes Him."],
          ar: ["لم تنفع العماد ولا الصخر المنحوت ولا الأوتاد.", "الإكثار من الفساد يجلب العذاب.", "إن ربك لبالمرصاد (آية 14)."],
        },
        takeaway: { de: "Prüfen Sie heute, ob Sie auf etwas Vergängliches stolz sind.", en: "Check today whether you are proud of something transient.", ar: "انظر اليوم هل تفخر بشيء زائل." },
        questions: { de: ["Worauf baut Ihre Sicherheit?"], en: ["On what is your security built?"], ar: ["على ماذا تبني أمانك؟"] },
      },
      {
        from: 15, to: 20,
        title: { de: "Die falsche Deutung von Wohlstand", en: "The false reading of wealth", ar: "الفهم الخاطئ للنعمة" },
        lessons: {
          de: ["Der Mensch hält Gaben für Ehre und Mangel für Erniedrigung; beides ist falsch.", "Die eigentliche Ursache des Unheils: Waisen nicht ehren, Arme nicht speisen.", "Gieriges Erbe-Verzehren und übermäßige Liebe zum Geld werden getadelt."],
          en: ["Man takes gifts as honour and want as humiliation; both are wrong.", "The real cause of ruin: not honouring orphans, not feeding the poor.", "Greedily consuming inheritance and excessive love of money are rebuked."],
          ar: ["يظن الإنسان النعمة إكرامًا والتضييق إهانة، وكلاهما خطأ.", "أصل الداء: لا يُكرم اليتيم ولا يُحض على طعام المسكين.", "ذُم أكل التراث لمًّا وحب المال جمًّا."],
        },
        takeaway: { de: "Unterstützen Sie heute eine Waise oder einen Bedürftigen.", en: "Support an orphan or a needy person today.", ar: "ادعم اليوم يتيمًا أو محتاجًا." },
        questions: { de: ["Wie reagieren Sie innerlich, wenn Ihnen etwas genommen wird?"], en: ["How do you react inwardly when something is taken from you?"], ar: ["كيف تستقبل في داخلك ما يُقبض عنك؟"] },
      },
      {
        from: 21, to: 30,
        title: { de: "Der Tag und die ruhige Seele", en: "The Day and the tranquil soul", ar: "يوم القيامة والنفس المطمئنة" },
        lessons: {
          de: ["Die Erde wird eingeebnet; Allahs Kommen zeigt die Ernsthaftigkeit des Tages.", "Der Mensch wünscht, er hätte für sein wahres Leben vorgesorgt (v. 24).", "Die ruhige Seele wird eingeladen, unter Allahs Diener und in Sein Paradies einzutreten."],
          en: ["The earth is levelled; Allah's coming shows the gravity of the Day.", "Man wishes he had provided for his true life (v. 24).", "The tranquil soul is invited to enter among Allah's servants and into His Paradise."],
          ar: ["تُدك الأرض، ومجيء الرب يبين جلال اليوم.", "يتمنى الإنسان لو قدم لحياته الحقيقية (آية 24).", "تُدعى النفس المطمئنة إلى الدخول في عباد الله وجنته."],
        },
        takeaway: { de: "Investieren Sie heute bewusst in Ihr eigentliches Leben.", en: "Invest consciously in your real life today.", ar: "قدّم اليوم لحياتك الحقيقية عن وعي." },
        questions: { de: ["Was fehlt Ihrer Seele noch zur Ruhe?"], en: ["What does your soul still lack for tranquillity?"], ar: ["ما الذي ينقص نفسك لتطمئن؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "tabari", "ibnAshur", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 90,
    theme: {
      de: "Der Mensch ist zur Mühe erschaffen und mit Erkenntnis ausgestattet; er soll den steilen Weg wählen: Befreiung, Speisung der Bedürftigen, Glaube und gegenseitiges Ermahnen zu Geduld und Barmherzigkeit.",
      en: "Man is created for toil and endowed with discernment; he should choose the steep path: freeing, feeding the needy, faith and mutual counsel to patience and mercy.",
      ar: "خُلق الإنسان في كبد وأوتي أدوات الهداية، فليقتحم العقبة: فك الرقبة وإطعام المحتاج والإيمان والتواصي بالصبر والمرحمة.",
    },
    context: {
      de: "Mekkanisch, als der Prophet ﷺ in Mekka bedrängt wurde und Wohlhabende mit ihren Ausgaben prahlten.",
      en: "Meccan, when the Prophet ﷺ was oppressed in Mecca and the wealthy boasted of their spending.",
      ar: "مكية، حين كان النبي ﷺ مضيقًا عليه في مكة وكان الأغنياء يتفاخرون بإنفاقهم.",
    },
    connects: {
      de: "al-Fajr tadelt die Vernachlässigung von Waisen und Armen; al-Balad zeigt den Weg, sie zu versorgen. al-Shams folgt mit der Seele und ihren zwei Möglichkeiten.",
      en: "al-Fajr rebukes neglect of orphans and the poor; al-Balad shows the way to provide for them. al-Shams follows with the soul and its two possibilities.",
      ar: "ذمت الفجر إهمال اليتيم والمسكين، وتبين البلد طريق إطعامهم، وتليها الشمس بالنفس وفجورها وتقواها.",
    },
    lessons: {
      de: [
        "Mühsal gehört zum Menschsein; sie ist kein Zeichen von Verlassenheit.",
        "Augen, Zunge und Lippen sind Werkzeuge der Erkenntnis und Verantwortung.",
        "Allah zeigte beide Wege; die Wahl liegt beim Menschen.",
        "Der steile Weg ist konkret: Menschen befreien und Hungrige speisen.",
        "Glaube lebt in Gemeinschaft durch gegenseitiges Ermahnen.",
      ],
      en: [
        "Toil is part of being human; it is no sign of abandonment.",
        "Eyes, tongue and lips are tools of discernment and responsibility.",
        "Allah showed both ways; the choice is man's.",
        "The steep path is concrete: freeing people and feeding the hungry.",
        "Faith lives in community through mutual counsel.",
      ],
      ar: [
        "الكبد جزء من الإنسانية لا علامة خذلان.",
        "العينان واللسان والشفتان أدوات معرفة ومسؤولية.",
        "هدى الله النجدين والاختيار للإنسان.",
        "العقبة عمل محسوس: فك الرقاب وإطعام الجائع.",
        "الإيمان يحيا في الجماعة بالتواصي.",
      ],
    },
    questions: {
      de: [
        "Welcher steile Weg liegt heute vor Ihnen?",
        "Mit wem ermahnen Sie sich gegenseitig zu Geduld und Barmherzigkeit?",
      ],
      en: [
        "Which steep path lies before you today?",
        "With whom do you counsel each other to patience and mercy?",
      ],
      ar: [
        "ما العقبة التي أمامك اليوم؟",
        "مع من تتواصى بالصبر والمرحمة؟",
      ],
    },
    sections: [
      {
        from: 1, to: 4,
        title: { de: "Die Stadt und die Mühsal", en: "The city and the toil", ar: "البلد والكبد" },
        lessons: {
          de: ["Der Schwur bei Mekka ehrt die Stadt, in der der Prophet ﷺ bedrängt wurde.", "Die Exegeten nennen bei Vater und Kind meist Ādam und seine Nachkommen; andere Ibrāhīm und Ismāʿīl.", "Mühsal ist Teil der Schöpfungsordnung."],
          en: ["The oath by Mecca honours the city where the Prophet ﷺ was oppressed.", "For father and child exegetes mostly name Ādam and his descendants; others Ibrāhīm and Ismāʿīl.", "Toil is part of the order of creation."],
          ar: ["القسم بمكة تشريف للبلد الذي ضُيّق فيه على النبي ﷺ.", "الوالد وما ولد عند أكثرهم آدم وذريته، وقيل إبراهيم وإسماعيل.", "الكبد من سنن الخلق."],
        },
        takeaway: { de: "Nehmen Sie eine Mühe heute an, ohne zu klagen.", en: "Accept one hardship today without complaining.", ar: "تقبّل اليوم مشقة دون شكوى." },
        questions: { de: ["Wie verändert es Ihren Blick, dass Mühe zum Leben gehört?"], en: ["How does it change your view that toil belongs to life?"], ar: ["كيف يغير نظرتك أن الكبد من طبيعة الحياة؟"] },
      },
      {
        from: 5, to: 10,
        title: { de: "Werkzeuge und zwei Wege", en: "Tools and two ways", ar: "النعم والنجدان" },
        lessons: {
          de: ["Wer mit Ausgaben prahlt, vergisst, dass Allah ihn sieht.", "Sinne und Sprache sind Gaben mit Rechenschaftspflicht.", "Die beiden Wege sind klar gezeigt."],
          en: ["Whoever boasts of spending forgets that Allah sees him.", "Senses and speech are gifts with accountability.", "The two ways are clearly shown."],
          ar: ["المتفاخر بالإنفاق نسي أن الله يراه.", "الحواس واللسان نعم يُسأل عنها.", "النجدان مبيّنان."],
        },
        takeaway: { de: "Geben Sie heute etwas, ohne darüber zu sprechen.", en: "Give something today without talking about it.", ar: "أنفق اليوم شيئًا دون أن تتحدث عنه." },
        questions: { de: ["Wofür setzen Sie Ihre Zunge heute ein?"], en: ["For what are you using your tongue today?"], ar: ["فيمَ تستعمل لسانك اليوم؟"] },
      },
      {
        from: 11, to: 20,
        title: { de: "Der steile Weg", en: "The steep path", ar: "اقتحام العقبة" },
        lessons: {
          de: ["Der steile Weg verlangt Überwindung des eigenen Geizes.", "Hilfe in Zeiten des Hungers für Waisen und Mittellose hat besonderen Rang.", "Glaube, Geduld und Barmherzigkeit gehören zusammen.", "Wer den Weg verweigert, steht auf der Seite der Linken."],
          en: ["The steep path requires overcoming one's own stinginess.", "Help in times of hunger for orphans and the destitute has special rank.", "Faith, patience and mercy belong together.", "Whoever refuses the path stands among those of the left."],
          ar: ["العقبة تقتضي مجاهدة الشح.", "إطعام اليتيم والمسكين في المسغبة له منزلة خاصة.", "الإيمان والصبر والرحمة متلازمة.", "من أعرض فهو من أصحاب المشأمة."],
        },
        takeaway: { de: "Speisen Sie heute jemanden, der es braucht, direkt oder durch eine Spende.", en: "Feed someone in need today, directly or through a donation.", ar: "أطعم اليوم محتاجًا مباشرة أو بصدقة." },
        questions: { de: ["Welche Barmherzigkeit fällt Ihnen am schwersten?", "Wen ermutigen Sie zum Guten?"], en: ["Which kind of mercy is hardest for you?", "Whom do you encourage to do good?"], ar: ["أي رحمة أصعب عليك؟", "من تحضه على الخير؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "tabari", "biqai"],
    review: DRAFT,
  },
  {
    s: 91,
    theme: {
      de: "Nach elf Schwüren die Kernaussage: Erfolg hat, wer seine Seele läutert, Verlust, wer sie verkümmern lässt; Thamūd ist das warnende Beispiel.",
      en: "After eleven oaths, the core statement: successful is whoever purifies his soul, lost is whoever stunts it; Thamūd is the warning example.",
      ar: "بعد أحد عشر قسمًا يأتي المقصود: أفلح من زكى نفسه وخاب من دساها، وثمود مثال النذارة.",
    },
    context: {
      de: "Frühmekkanisch, in der Phase, in der die Grundlagen der Seelenläuterung und der Verantwortung gelegt wurden.",
      en: "Early Meccan, in the phase that laid the foundations of soul purification and responsibility.",
      ar: "مكية مبكرة، في مرحلة تأسيس معاني التزكية والمسؤولية.",
    },
    connects: {
      de: "al-Balad zeigt zwei Wege; al-Shams verlegt sie in die Seele selbst. al-Layl setzt mit zwei Arten des Strebens fort.",
      en: "al-Balad shows two ways; al-Shams places them within the soul itself. al-Layl continues with two kinds of striving.",
      ar: "بينت البلد النجدين، وتجعلهما الشمس في النفس ذاتها، وتليها الليل بنوعي السعي.",
    },
    lessons: {
      de: [
        "Die Seele kennt Gut und Böse von Natur aus (v. 8).",
        "Läuterung ist die Aufgabe des Lebens; Verwahrlosung der Seele ist der eigentliche Verlust.",
        "Eine Gemeinschaft, die ein Unrecht billigt, trägt mit Verantwortung.",
        "Allah fürchtet keine Folgen Seines Handelns (v. 15).",
      ],
      en: [
        "The soul knows good and evil by nature (v. 8).",
        "Purification is life's task; neglect of the soul is the real loss.",
        "A community that approves of a wrong shares responsibility.",
        "Allah fears no consequences of His action (v. 15).",
      ],
      ar: [
        "النفس ملهمة فجورها وتقواها (آية 8).",
        "التزكية مهمة العمر، وتدسية النفس هي الخسارة الحقيقية.",
        "القوم الراضون بالظلم شركاء في التبعة.",
        "لا يخاف الله عقبى فعله (آية 15).",
      ],
    },
    questions: {
      de: [
        "Was nährt Ihre Seele, und was lässt sie verkümmern?",
        "Welches Unrecht in Ihrem Umfeld billigen Sie stillschweigend?",
      ],
      en: [
        "What nourishes your soul, and what stunts it?",
        "Which wrong in your surroundings do you silently approve?",
      ],
      ar: [
        "ما الذي يزكي نفسك، وما الذي يدسيها؟",
        "أي ظلم حولك ترضاه بسكوتك؟",
      ],
    },
    sections: [
      {
        from: 1, to: 10,
        title: { de: "Schwüre und die Seele", en: "Oaths and the soul", ar: "الأقسام والنفس" },
        lessons: {
          de: ["Gegensatzpaare wie Sonne und Mond, Tag und Nacht spiegeln die zwei Möglichkeiten der Seele.", "Die Seele ist ausgewogen geschaffen und mit moralischem Gespür begabt.", "Das Ergebnis hängt von der eigenen Arbeit an ihr ab."],
          en: ["Pairs of opposites like sun and moon, day and night mirror the soul's two possibilities.", "The soul is created balanced and endowed with moral sense.", "The outcome depends on one's own work on it."],
          ar: ["المتقابلات كالشمس والقمر والليل والنهار تعكس إمكاني النفس.", "النفس مسواة ملهمة بالخير والشر.", "المآل بحسب العمل في تزكيتها."],
        },
        takeaway: { de: "Wählen Sie heute eine schlechte Gewohnheit und ersetzen Sie sie durch eine gute.", en: "Choose one bad habit today and replace it with a good one.", ar: "اختر اليوم عادة سيئة وبدّلها بحسنة." },
        questions: { de: ["Was sagt Ihnen Ihr Gewissen gerade, das Sie überhören?"], en: ["What is your conscience telling you that you ignore?"], ar: ["ماذا يقول لك ضميرك وأنت تتجاهله؟"] },
      },
      {
        from: 11, to: 15,
        title: { de: "Thamūd und die Kamelstute", en: "Thamūd and the she-camel", ar: "ثمود والناقة" },
        lessons: {
          de: ["Überheblichkeit führte zur Leugnung.", "Einer tötete die Kamelstute, doch das Volk billigte es und wurde gemeinsam bestraft.", "Die Warnung des Gesandten wurde missachtet."],
          en: ["Arrogance led to denial.", "One killed the she-camel, yet the people approved and were punished together.", "The messenger's warning was disregarded."],
          ar: ["الطغيان قاد إلى التكذيب.", "انبعث أشقاها فعقرها ورضي القوم فعمهم العذاب.", "استخفوا بتحذير الرسول."],
        },
        takeaway: { de: "Widersprechen Sie heute höflich einem kleinen Unrecht, statt zu schweigen.", en: "Politely object to a small wrong today instead of staying silent.", ar: "اعترض اليوم بأدب على خطأ صغير بدل السكوت." },
        questions: { de: ["Wann ist Schweigen Zustimmung?"], en: ["When is silence consent?"], ar: ["متى يكون السكوت رضًا؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "biqai"],
    review: DRAFT,
  },
  {
    s: 92,
    theme: {
      de: "Das Streben der Menschen ist verschieden: Wer gibt, gottesfürchtig ist und das Gute bestätigt, dem wird das Leichte erleichtert; wer geizt, dem das Schwere.",
      en: "People's striving differs: whoever gives, fears God and affirms the best is eased towards ease; whoever is stingy, towards hardship.",
      ar: "سعي الناس شتى: من أعطى واتقى وصدق بالحسنى يُيسر لليسرى، ومن بخل يُيسر للعسرى.",
    },
    context: {
      de: "Mekkanisch, in der Zeit, als wohlhabende Gläubige ihr Vermögen für verfolgte Muslime einsetzten.",
      en: "Meccan, at the time when wealthy believers spent their wealth for persecuted Muslims.",
      ar: "مكية، في زمن إنفاق المؤمنين الموسرين على المستضعفين.",
    },
    asbab: {
      de: "Viele Exegeten, darunter al-Wāḥidī und Ibn Kathīr, berichten, dass die Verse 17–21 auf Abū Bakr bezogen wurden, der verfolgte Sklaven freikaufte, allein um Allahs Antlitz willen.",
      en: "Many exegetes, including al-Wāḥidī and Ibn Kathīr, report that verses 17–21 were related to Abū Bakr, who bought the freedom of persecuted slaves solely for Allah's sake.",
      ar: "ذكر كثير من المفسرين منهم الواحدي وابن كثير أن الآيات 17–21 نزلت في أبي بكر حين أعتق المستضعفين ابتغاء وجه الله.",
    },
    connects: {
      de: "al-Shams nennt Läuterung und Verkümmerung; al-Layl zeigt sie im Umgang mit Besitz. al-Ḍuḥā folgt mit Trost für den Propheten ﷺ, dem Allah Zufriedenheit verspricht wie dem Gebenden hier (v. 21).",
      en: "al-Shams names purifying and stunting; al-Layl shows them in handling wealth. al-Ḍuḥā follows with consolation for the Prophet ﷺ, promised contentment like the giver here (v. 21).",
      ar: "ذكرت الشمس التزكية والتدسية، وتبينهما الليل في المال، وتليها الضحى بتسلية النبي ﷺ ووعده بالرضا كما وُعد المعطي هنا (آية 21).",
    },
    lessons: {
      de: [
        "Unterschiedliches Streben führt zu unterschiedlichen Zielen.",
        "Geben, Gottesfurcht und Überzeugung öffnen den Weg der Leichtigkeit.",
        "Reichtum nützt nicht, wenn man stürzt (v. 11).",
        "Die beste Gabe ist frei von Gegenleistung und sucht nur Allahs Antlitz.",
      ],
      en: [
        "Different striving leads to different destinations.",
        "Giving, God-consciousness and conviction open the path of ease.",
        "Wealth does not help when one falls (v. 11).",
        "The best gift seeks no return and only Allah's countenance.",
      ],
      ar: [
        "اختلاف السعي يورث اختلاف المصير.",
        "العطاء والتقوى والتصديق تفتح طريق اليسرى.",
        "لا يغني المال إذا تردى صاحبه (آية 11).",
        "أفضل العطاء ما خلا من المقابل وابتُغي به وجه الله.",
      ],
    },
    questions: {
      de: [
        "Wohin führt Ihr Streben dieser Woche?",
        "Geben Sie manchmal in Erwartung einer Gegenleistung?",
      ],
      en: [
        "Where is your striving this week leading?",
        "Do you sometimes give expecting something in return?",
      ],
      ar: [
        "إلى أين يتجه سعيك هذا الأسبوع؟",
        "هل تعطي أحيانًا وأنت تنتظر المقابل؟",
      ],
    },
    sections: [
      {
        from: 1, to: 4,
        title: { de: "Gegensätze und unterschiedliches Streben", en: "Opposites and different striving", ar: "المتقابلات وتنوع السعي" },
        lessons: {
          de: ["Nacht und Tag, männlich und weiblich: Gegensätze gehören zur Ordnung.", "So unterschiedlich sind auch die Wege der Menschen."],
          en: ["Night and day, male and female: opposites belong to the order.", "Equally different are the paths of people."],
          ar: ["الليل والنهار والذكر والأنثى متقابلات في نظام واحد.", "وكذلك سعي الناس متنوع."],
        },
        takeaway: { de: "Schreiben Sie auf, wofür Sie diese Woche die meiste Zeit aufwenden.", en: "Write down what you spend most time on this week.", ar: "اكتب ما تنفق فيه أكثر وقتك هذا الأسبوع." },
        questions: { de: ["Ist Ihr Streben eher zerstreut oder ausgerichtet?"], en: ["Is your striving scattered or focused?"], ar: ["هل سعيك مشتت أم موجّه؟"] },
      },
      {
        from: 5, to: 11,
        title: { de: "Zwei Wege: Leichtigkeit und Härte", en: "Two paths: ease and hardship", ar: "اليسرى والعسرى" },
        lessons: {
          de: ["Wer den ersten Schritt zum Guten geht, dem erleichtert Allah den nächsten.", "Geiz und Selbstgenügsamkeit führen in die Härte.", "Besitz begleitet niemanden über den Tod hinaus."],
          en: ["Whoever takes the first step to good, Allah eases the next.", "Stinginess and self-sufficiency lead to hardship.", "Possessions accompany no one beyond death."],
          ar: ["من خطا نحو الخير يسّر الله له ما بعده.", "البخل والاستغناء طريق العسرى.", "المال لا يصحب صاحبه بعد الموت."],
        },
        takeaway: { de: "Gehen Sie heute einen kleinen ersten Schritt zu einer guten Tat.", en: "Take a small first step towards a good deed today.", ar: "خطُ اليوم خطوة أولى نحو عمل صالح." },
        questions: { de: ["Wo fühlen Sie sich von Allah unabhängig?"], en: ["Where do you feel independent of Allah?"], ar: ["أين تشعر بالاستغناء عن الله؟"] },
      },
      {
        from: 12, to: 21,
        title: { de: "Rechtleitung, Warnung und der Gottesfürchtigste", en: "Guidance, warning and the most God-fearing", ar: "الهدى والنذارة والأتقى" },
        lessons: {
          de: ["Rechtleitung zu zeigen hat Allah sich selbst auferlegt.", "Das lodernde Feuer ist für den, der leugnet und sich abwendet.", "Wer sein Gut gibt, um sich zu läutern, ohne Gegenleistung, wird zufrieden sein."],
          en: ["Allah has taken it upon Himself to show guidance.", "The blazing Fire is for whoever denies and turns away.", "Whoever gives his wealth to be purified, without return, will be content."],
          ar: ["إن على الله بيان الهدى.", "النار التي تلظى لمن كذب وتولى.", "من آتى ماله يتزكى بلا مقابل فسوف يرضى."],
        },
        takeaway: { de: "Geben Sie heute eine Spende, von der niemand erfährt.", en: "Give a donation today that no one learns of.", ar: "تصدق اليوم صدقة لا يعلم بها أحد." },
        questions: { de: ["Was würde Ihr Geben reiner machen?"], en: ["What would make your giving purer?"], ar: ["ما الذي يجعل عطاءك أخلص؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "wahidi", "ibnAshur", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 93,
    theme: {
      de: "Trost für den Propheten ﷺ: Sein Herr hat ihn nicht verlassen; das Spätere ist besser, und erfahrene Gnade verpflichtet zur Güte gegenüber Waisen, Bittenden und zum Erzählen von Allahs Gaben.",
      en: "Consolation for the Prophet ﷺ: his Lord has not forsaken him; what comes later is better, and grace received obliges kindness to orphans and petitioners and speaking of Allah's gifts.",
      ar: "تسلية النبي ﷺ: ما ودعه ربه وما قلى، والآخرة خير له، والنعمة المتلقاة توجب الإحسان إلى اليتيم والسائل والتحديث بنعم الله.",
    },
    context: {
      de: "Frühmekkanisch, nach einer Pause der Offenbarung, die den Propheten ﷺ bedrückte.",
      en: "Early Meccan, after a pause in revelation that weighed on the Prophet ﷺ.",
      ar: "مكية مبكرة، بعد فترة من انقطاع الوحي أحزنت النبي ﷺ.",
    },
    asbab: {
      de: "al-Bukhārī und Muslim berichten von Jundub ibn Sufyān, dass die Offenbarung eine Zeit lang ausblieb und eine Frau spottete, sein Gefährte habe ihn verlassen; daraufhin wurde die Sure offenbart.",
      en: "al-Bukhārī and Muslim report from Jundub ibn Sufyān that revelation paused for a while and a woman mocked that his companion had abandoned him; then the surah was revealed.",
      ar: "روى البخاري ومسلم عن جندب بن سفيان أن الوحي أبطأ فقالت امرأة إن صاحبه قد تركه، فنزلت السورة.",
    },
    connects: {
      de: "al-Layl endet mit der Zufriedenheit des Gebenden; al-Ḍuḥā verspricht dem Propheten ﷺ Gaben, bis er zufrieden ist. al-Sharḥ setzt die Aufzählung der Gnaden fort.",
      en: "al-Layl ends with the giver's contentment; al-Ḍuḥā promises the Prophet ﷺ gifts until he is content. al-Sharḥ continues listing the favours.",
      ar: "ختمت الليل برضا المعطي، وتعد الضحى النبي ﷺ بالعطاء حتى يرضى، وتكمل الشرح تعداد النعم.",
    },
    lessons: {
      de: [
        "Eine Pause bedeutet nicht Verlassenheit; Allahs Fürsorge bleibt.",
        "Das Ende ist besser als der Anfang für den, der Allah vertraut.",
        "Erinnerung an frühere Gnaden heilt gegenwärtige Sorge.",
        "Erfahrene Gnade wird zu Güte an andere: Waisen, Bittende.",
        "Von Allahs Gaben zu sprechen ist eine Form des Dankes.",
      ],
      en: [
        "A pause does not mean abandonment; Allah's care remains.",
        "The end is better than the beginning for one who trusts Allah.",
        "Remembering past favours heals present worry.",
        "Grace received becomes kindness to others: orphans, petitioners.",
        "Speaking of Allah's gifts is a form of gratitude.",
      ],
      ar: [
        "الفتور لا يعني الهجر، فرعاية الله باقية.",
        "العاقبة خير من البداية لمن وثق بالله.",
        "تذكر النعم السابقة يداوي الهم الحاضر.",
        "النعمة المتلقاة تصير إحسانًا إلى اليتيم والسائل.",
        "التحديث بنعمة الله من الشكر.",
      ],
    },
    questions: {
      de: [
        "Wann fühlten Sie sich verlassen, und wie hat Allah Sie doch versorgt?",
        "Welche Gnade in Ihrem Leben können Sie heute weitergeben?",
      ],
      en: [
        "When did you feel abandoned, and how did Allah still provide for you?",
        "Which grace in your life can you pass on today?",
      ],
      ar: [
        "متى شعرت بالوحشة، وكيف رعاك الله مع ذلك؟",
        "أي نعمة في حياتك يمكن أن تمررها لغيرك اليوم؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Nicht verlassen", en: "Not forsaken", ar: "ما ودعك ربك" },
        lessons: {
          de: ["Vormittagslicht und stille Nacht: Auf Dunkelheit folgt Licht.", "Allah versichert Seine Nähe gerade in Zeiten des Schweigens.", "Das Versprechen reicht bis zur vollen Zufriedenheit."],
          en: ["Morning light and still night: light follows darkness.", "Allah affirms His nearness precisely in times of silence.", "The promise reaches to full contentment."],
          ar: ["الضحى بعد الليل الساجي: النور يعقب الظلمة.", "يؤكد الله قربه في أوقات الصمت.", "الوعد ممتد حتى الرضا."],
        },
        takeaway: { de: "Erinnern Sie sich in einer schweren Phase heute bewusst an diese Zusage.", en: "In a difficult phase, consciously remember this promise today.", ar: "استحضر هذا الوعد اليوم إن كنت في ضيق." },
        questions: { de: ["Was bedeutet es für Sie, dass das Spätere besser ist?"], en: ["What does it mean to you that the later is better?"], ar: ["ماذا يعني لك أن الآخرة خير من الأولى؟"] },
      },
      {
        from: 6, to: 8,
        title: { de: "Erinnerung an Gnaden", en: "Remembering favours", ar: "تذكير بالنعم" },
        lessons: {
          de: ["Waise, suchend und bedürftig: Allah gab Obdach, Leitung und Genüge.", "Die Exegeten deuten das Suchen unterschiedlich, doch alle verneinen eine Verirrung im Glauben."],
          en: ["Orphaned, searching and in need: Allah gave shelter, guidance and sufficiency.", "Exegetes interpret the searching differently, yet all deny any deviation in faith."],
          ar: ["كان يتيمًا فآوى، وضالًا فهدى، وعائلًا فأغنى.", "اختلف المفسرون في معنى الضلال مع اتفاقهم على نفي الضلال في العقيدة."],
        },
        takeaway: { de: "Schreiben Sie heute drei Gnaden auf, die Ihnen in schweren Zeiten zuteilwurden.", en: "Write down three favours you received in hard times today.", ar: "اكتب اليوم ثلاث نعم أُعطيتها في أوقات الشدة." },
        questions: { de: ["Wie hat Allah Sie in Ihrer Vergangenheit versorgt?"], en: ["How has Allah provided for you in your past?"], ar: ["كيف رعاك الله في ماضيك؟"] },
      },
      {
        from: 9, to: 11,
        title: { de: "Drei Pflichten aus der Gnade", en: "Three duties from grace", ar: "ثلاثة حقوق للنعمة" },
        lessons: {
          de: ["Wer selbst Waise war, unterdrückt keine Waisen.", "Bittende, auch nach Wissen, werden nicht angefahren.", "Allahs Gaben werden dankbar erwähnt, nicht verborgen."],
          en: ["One who was an orphan does not oppress orphans.", "Petitioners, including those asking for knowledge, are not rebuffed.", "Allah's gifts are mentioned gratefully, not hidden."],
          ar: ["من ذاق اليتم لا يقهر اليتيم.", "لا يُنهر السائل، ومنه سائل العلم.", "تُذكر نعم الله شكرًا لا كتمانًا."],
        },
        takeaway: { de: "Antworten Sie heute einem Bittenden freundlich, auch wenn Sie nichts geben können.", en: "Answer a petitioner kindly today, even if you cannot give anything.", ar: "رد اليوم على سائل بلطف ولو لم تعطه." },
        questions: { de: ["Wie sprechen Sie von Allahs Gaben, ohne zu prahlen?"], en: ["How do you speak of Allah's gifts without boasting?"], ar: ["كيف تحدث بنعمة الله دون تفاخر؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "wahidi", "ibnAshur", "tabari"],
    review: DRAFT,
  },
  {
    s: 94,
    theme: {
      de: "Allah weitete die Brust des Propheten ﷺ, nahm seine Last und erhöhte sein Ansehen; mit der Schwierigkeit kommt Erleichterung, und nach jeder Aufgabe soll man sich dem Herrn zuwenden.",
      en: "Allah expanded the Prophet's ﷺ chest, removed his burden and raised his renown; with hardship comes ease, and after every task one should turn to the Lord.",
      ar: "شرح الله صدر النبي ﷺ ووضع وزره ورفع ذكره، ومع العسر يسر، وبعد الفراغ يُنصب ويُرغب إلى الرب.",
    },
    context: {
      de: "Frühmekkanisch, nahe an al-Ḍuḥā; manche frühen Gelehrten sahen beide als eng zusammengehörig, doch die Mehrheit zählt sie als zwei Suren.",
      en: "Early Meccan, close to al-Ḍuḥā; some early scholars saw both as closely joined, yet the majority count them as two surahs.",
      ar: "مكية مبكرة، قريبة من الضحى، ورأى بعض السلف اتصالهما، والجمهور على أنهما سورتان.",
    },
    connects: {
      de: "al-Ḍuḥā zählt äußere Gnaden auf; al-Sharḥ innere: Weite der Brust und erhöhtes Gedenken. al-Tīn wendet sich dann der Würde des Menschen allgemein zu.",
      en: "al-Ḍuḥā lists outward favours; al-Sharḥ inward ones: an expanded chest and raised remembrance. al-Tīn then turns to human dignity in general.",
      ar: "عددت الضحى نعمًا ظاهرة، وتعدد الشرح نعمًا باطنة كشرح الصدر ورفع الذكر، وتنتقل التين إلى كرامة الإنسان عامة.",
    },
    lessons: {
      de: [
        "Innere Weite ist eine Gabe, um Lasten tragen zu können.",
        "Allah nimmt Lasten, die zu schwer erscheinen.",
        "Die Wiederholung in v. 5–6 bekräftigt: Erleichterung begleitet die Schwierigkeit.",
        "Ruhe bedeutet Wechsel der Mühe, nicht Müßiggang (v. 7–8).",
      ],
      en: [
        "Inner expansiveness is a gift that enables one to carry burdens.",
        "Allah removes burdens that seem too heavy.",
        "The repetition in v. 5–6 confirms: ease accompanies hardship.",
        "Rest means changing effort, not idleness (v. 7–8).",
      ],
      ar: [
        "انشراح الصدر نعمة يُحمل بها العبء.",
        "يضع الله الأوزار التي تبدو ثقيلة.",
        "التكرار في الآيتين 5–6 يؤكد أن اليسر مصاحب للعسر.",
        "الفراغ انتقال من عمل إلى عمل لا بطالة (آية 7–8).",
      ],
    },
    questions: {
      de: [
        "Welche Erleichterung verbirgt sich in Ihrer aktuellen Schwierigkeit?",
        "Wem wenden Sie sich zu, wenn eine Aufgabe erledigt ist?",
      ],
      en: [
        "What ease is hidden in your current difficulty?",
        "To whom do you turn when a task is done?",
      ],
      ar: [
        "أي يسر يختبئ في عسرك الحالي؟",
        "إلى من تتجه إذا فرغت من عمل؟",
      ],
    },
    sections: [
      {
        from: 1, to: 4,
        title: { de: "Weite, Entlastung und Ansehen", en: "Expansion, relief and renown", ar: "الشرح والوضع والرفع" },
        lessons: {
          de: ["Die rhetorische Frage bekräftigt die Gabe.", "Die Last, die den Rücken drückte, wurde genommen.", "Das Gedenken an den Propheten ﷺ ist erhöht, etwa im Gebetsruf und im Glaubensbekenntnis."],
          en: ["The rhetorical question affirms the gift.", "The burden that weighed on his back was removed.", "The remembrance of the Prophet ﷺ is raised, for example in the call to prayer and the testimony of faith."],
          ar: ["الاستفهام للتقرير.", "وُضع الوزر الذي أنقض الظهر.", "رُفع ذكر النبي ﷺ كما في الأذان والشهادة."],
        },
        takeaway: { de: "Sprechen Sie heute bewusst den Segenswunsch für den Propheten ﷺ.", en: "Today, consciously send blessings upon the Prophet ﷺ.", ar: "صلّ اليوم على النبي ﷺ عن حضور." },
        questions: { de: ["Was weitet Ihre Brust, und was engt sie ein?"], en: ["What expands your chest, and what constricts it?"], ar: ["ما الذي يشرح صدرك وما الذي يضيقه؟"] },
      },
      {
        from: 5, to: 6,
        title: { de: "Mit der Schwierigkeit die Erleichterung", en: "With hardship, ease", ar: "مع العسر يسر" },
        lessons: {
          de: ["Es heißt mit der Schwierigkeit, nicht nach ihr: Erleichterung ist schon gegenwärtig.", "Viele Gelehrte folgern aus der Sprachform, dass eine Schwierigkeit von zwei Erleichterungen begleitet wird."],
          en: ["It says with hardship, not after it: ease is already present.", "Many scholars infer from the grammatical form that one hardship is accompanied by two eases."],
          ar: ["قال مع العسر لا بعده، فاليسر حاضر.", "استنبط كثير من العلماء من التعريف والتنكير أن العسر الواحد يصحبه يسران."],
        },
        takeaway: { de: "Suchen Sie heute in einer Schwierigkeit gezielt nach der Erleichterung darin.", en: "In a difficulty today, look deliberately for the ease within it.", ar: "ابحث اليوم عن اليسر داخل عسرك." },
        questions: { de: ["Welche Erleichterung haben Sie in vergangenen Schwierigkeiten übersehen?"], en: ["Which ease did you overlook in past difficulties?"], ar: ["أي يسر غفلت عنه في شدائد ماضية؟"] },
      },
      {
        from: 7, to: 8,
        title: { de: "Nach der Aufgabe zum Herrn", en: "After the task, to the Lord", ar: "فإذا فرغت فانصب" },
        lessons: {
          de: ["Die Exegeten deuten es verschieden: nach dem Gebet zum Bittgebet, nach weltlicher Arbeit zur Anbetung.", "Die Sehnsucht soll allein auf Allah gerichtet sein."],
          en: ["Exegetes interpret it variously: after prayer to supplication, after worldly work to worship.", "Longing should be directed to Allah alone."],
          ar: ["اختلف المفسرون: إذا فرغت من الصلاة فانصب في الدعاء، أو من شغل الدنيا فانصب في العبادة.", "الرغبة إلى الله وحده."],
        },
        takeaway: { de: "Füllen Sie nach dem Feierabend heute einige Minuten mit Gedenken.", en: "After work today, fill a few minutes with remembrance.", ar: "املأ دقائق بعد عملك اليوم بذكر الله." },
        questions: { de: ["Wie verbringen Sie Ihre freie Zeit, und wohin richtet sich Ihre Sehnsucht?"], en: ["How do you spend your free time, and where is your longing directed?"], ar: ["كيف تقضي فراغك، وإلى أين تتجه رغبتك؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "tabari", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 95,
    theme: {
      de: "Der Mensch ist in bester Gestalt erschaffen und kann doch tief sinken, außer wer glaubt und rechtschaffen handelt; Allah ist der gerechteste Richter.",
      en: "Man is created in the best form and yet can sink low, except those who believe and do righteous deeds; Allah is the most just of judges.",
      ar: "خُلق الإنسان في أحسن تقويم ثم قد يُرد أسفل سافلين إلا المؤمنين العاملين، والله أحكم الحاكمين.",
    },
    context: {
      de: "Mekkanisch nach der Mehrheit. Al-Bukhārī und Muslim berichten von al-Barāʾ, dass der Prophet ﷺ sie auf Reisen im Nachtgebet rezitierte.",
      en: "Meccan according to the majority. al-Bukhārī and Muslim report from al-Barāʾ that the Prophet ﷺ recited it in the night prayer while travelling.",
      ar: "مكية عند الجمهور، وروى البخاري ومسلم عن البراء أن النبي ﷺ قرأ بها في العشاء في سفر.",
    },
    connects: {
      de: "al-Sharḥ erhöht das Ansehen des Propheten ﷺ; al-Tīn spricht von der Würde des Menschen überhaupt. al-ʿAlaq zeigt dann den Ursprung des Menschen und das Wissen als Weg zur Würde.",
      en: "al-Sharḥ raises the Prophet's ﷺ renown; al-Tīn speaks of human dignity at large. al-ʿAlaq then shows man's origin and knowledge as the path to dignity.",
      ar: "رفعت الشرح ذكر النبي ﷺ، وتتحدث التين عن كرامة الإنسان عامة، وتبين العلق أصل الإنسان والعلم طريقًا إلى الكرامة.",
    },
    lessons: {
      de: [
        "Die Schwüre verweisen nach vielen Exegeten auf Orte der Propheten: Feigen- und Olivenland, Sinai, Mekka.",
        "Die Würde des Menschen ist angeboren, aber nicht garantiert.",
        "Glaube und rechtes Handeln bewahren vor dem Absturz.",
        "Allahs Gerechtigkeit macht das Gericht notwendig.",
      ],
      en: [
        "According to many exegetes the oaths point to places of prophets: the land of figs and olives, Sinai, Mecca.",
        "Human dignity is innate but not guaranteed.",
        "Faith and righteous action protect from the fall.",
        "Allah's justice makes the Judgement necessary.",
      ],
      ar: [
        "الأقسام عند كثير من المفسرين إشارة إلى مواطن الأنبياء: أرض التين والزيتون وسيناء ومكة.",
        "كرامة الإنسان فطرية لكنها غير مضمونة.",
        "الإيمان والعمل الصالح عصمة من السقوط.",
        "عدل الله يقتضي الجزاء.",
      ],
    },
    questions: {
      de: [
        "Was hält Sie auf der Höhe Ihrer Würde?",
        "Welche Tat könnte Sie heute nach unten ziehen?",
      ],
      en: [
        "What keeps you at the height of your dignity?",
        "Which deed could pull you down today?",
      ],
      ar: [
        "ما الذي يحفظك في مقام كرامتك؟",
        "أي عمل قد يهبط بك اليوم؟",
      ],
    },
    sections: [
      {
        from: 1, to: 3,
        title: { de: "Schwüre bei Orten der Offenbarung", en: "Oaths by places of revelation", ar: "القسم بمواطن الرسالات" },
        lessons: {
          de: ["Die Exegeten deuten Feige und Olive teils als Früchte, teils als Land der Propheten.", "Sinai und die sichere Stadt erinnern an Mūsā und den Propheten ﷺ."],
          en: ["Exegetes take fig and olive partly as fruits, partly as the land of prophets.", "Sinai and the secure city recall Mūsā and the Prophet ﷺ."],
          ar: ["فُسر التين والزيتون بالثمرين، وقيل بأرض الأنبياء.", "طور سينين والبلد الأمين يذكّران بموسى والنبي ﷺ."],
        },
        takeaway: { de: "Lesen Sie heute über einen Propheten, den Sie wenig kennen.", en: "Read today about a prophet you know little about.", ar: "اقرأ اليوم عن نبي لا تعرف عنه الكثير." },
        questions: { de: ["Was verbindet die Botschaften aller Propheten?"], en: ["What unites the messages of all prophets?"], ar: ["ما الذي يجمع رسالات الأنبياء؟"] },
      },
      {
        from: 4, to: 6,
        title: { de: "Beste Gestalt und tiefster Fall", en: "Best form and lowest fall", ar: "أحسن تقويم وأسفل سافلين" },
        lessons: {
          de: ["Körper, Verstand und Natur sind in bester Ausgewogenheit geschaffen.", "Der tiefste Fall wird teils als Altersschwäche, teils als Feuer gedeutet.", "Wer glaubt und Gutes tut, erhält einen ununterbrochenen Lohn."],
          en: ["Body, mind and nature are created in the best balance.", "The lowest fall is interpreted partly as frailty of old age, partly as the Fire.", "Whoever believes and does good receives an unending reward."],
          ar: ["خُلق الجسد والعقل والفطرة في أحسن تقويم.", "فُسر أسفل سافلين بالهرم، وقيل بالنار.", "للمؤمنين العاملين أجر غير ممنون."],
        },
        takeaway: { de: "Pflegen Sie heute Ihren Körper oder Verstand als anvertraute Gabe.", en: "Care for your body or mind today as an entrusted gift.", ar: "اعتنِ اليوم بجسدك أو عقلك بوصفه أمانة." },
        questions: { de: ["Wie nutzen Sie Ihre beste Gestalt für das Gute?"], en: ["How do you use your best form for good?"], ar: ["كيف تستعمل حسن تقويمك في الخير؟"] },
      },
      {
        from: 7, to: 8,
        title: { de: "Der gerechteste Richter", en: "The most just of judges", ar: "أحكم الحاكمين" },
        lessons: {
          de: ["Die Frage fordert den Leugner heraus, das Gericht noch zu bestreiten.", "Allahs Weisheit und Gerechtigkeit verlangen einen Ausgleich."],
          en: ["The question challenges the denier to still dispute the Judgement.", "Allah's wisdom and justice demand a final settlement."],
          ar: ["الاستفهام تحدٍّ للمكذب بالدين بعد هذه الدلائل.", "حكمة الله وعدله يقتضيان الجزاء."],
        },
        takeaway: { de: "Handeln Sie heute in einer Streitfrage so gerecht, wie Sie es sich von Allah wünschen.", en: "In a dispute today, act as justly as you wish Allah to judge you.", ar: "اعدل اليوم في خلاف كما تحب أن يحكم الله فيك." },
        questions: { de: ["Was gibt Ihnen Gewissheit, dass Gerechtigkeit am Ende siegt?"], en: ["What gives you certainty that justice prevails in the end?"], ar: ["ما الذي يمنحك اليقين بأن العدل ينتصر في النهاية؟"] },
      },
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "tabari"],
    review: DRAFT,
  },
];
