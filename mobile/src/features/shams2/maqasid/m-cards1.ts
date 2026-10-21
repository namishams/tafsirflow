import type { L, LL, Maqasid, Section } from "./types";
import { DRAFT } from "../sources";
import type { SourceRef } from "../sources";

// Surah-level maqāṣid cards for surahs 3–40 (without 18 and 36, which live elsewhere).
// Own words only, verse numbers only, never Qurʾān text. All cards are drafts until reviewed by a scholar.
const t = (de: string, en: string, ar: string): L => ({ de, en, ar });
const ll = (de: string[], en: string[], ar: string[]): LL => ({ de, en, ar });
const sec = (from: number, to: number, de: string, en: string, ar: string): Section => ({ from, to, title: t(de, en, ar) });
const BASE: SourceRef[] = ["ibnKathir", "saadi", "biqai", "ibnAshur"];

export const M_CARDS1: Maqasid[] = [
  {
    s: 3,
    theme: t(
      "Standhaftigkeit auf dem wahren Glauben: Klarheit gegenüber den Zweifeln der Schriftbesitzer und Lehren aus Niederlage und Sieg.",
      "Steadfastness on the true faith: clarity against the doubts of the People of the Book, and lessons from defeat and victory.",
      "الثبات على الدين الحق: بيانه أمام شبهات أهل الكتاب، ودروس النصر والهزيمة."
    ),
    context: t(
      "Medinensisch. Der erste Teil wird mit der Gesandtschaft der Christen aus Naǧrān verbunden, ein großer Teil behandelt die Schlacht von Uḥud (3 n. H.).",
      "Medinan. The first part is linked to the Christian delegation of Najrān, a large part treats the Battle of Uḥud (3 AH).",
      "مدنية. يرتبط صدرها بوفد نصارى نجران، ويتناول جزء كبير منها غزوة أحد سنة ثلاث للهجرة."
    ),
    asbab: t(
      "Ibn Isḥāq berichtet, die Eröffnung bis etwa Vers 80 sei wegen der Gesandtschaft aus Naǧrān herabgesandt worden; Ibn Kaṯīr und al-Wāḥidī führen das an.",
      "Ibn Isḥāq reports that the opening up to about verse 80 came down concerning the delegation of Najrān; Ibn Kathīr and al-Wāḥidī cite this.",
      "روى ابن إسحاق أن صدر السورة إلى نحو ثمانين آية نزل في وفد نجران، وذكره ابن كثير والواحدي."
    ),
    connects: t(
      "Al-Baqara und Āl ʿImrān heißen gemeinsam „die beiden Leuchtenden“: die erste legt die Religion dar, die zweite verteidigt sie. Sie endet mit dem Gebot der Gottesfurcht (Vers 200), mit dem an-Nisāʾ beginnt.",
      "Al-Baqara and Āl ʿImrān are called together the two radiant ones: the first lays out the religion, the second defends it. It ends with the command of God-consciousness (verse 200), with which al-Nisāʾ opens.",
      "البقرة وآل عمران الزهراوان: الأولى تقرر الدين والثانية تدفع الشبه عنه. وختمت بالأمر بالتقوى (200) وبه افتتحت النساء."
    ),
    lessons: ll(
      ["Die eindeutigen Verse sind die Grundlage, an der man die mehrdeutigen misst.", "Niederlagen sind Prüfung und Läuterung, keine Widerlegung des Glaubens.", "Einheit der Gemeinschaft und Aufruf zum Guten gehören zusammen.", "Nachdenken über die Schöpfung führt zu Gedenken und Bittgebet."],
      ["The clear verses are the foundation by which the ambiguous are measured.", "Defeats are trial and purification, not a refutation of faith.", "Unity of the community and calling to good belong together.", "Reflecting on creation leads to remembrance and supplication."],
      ["المحكم أصل يرد إليه المتشابه.", "الهزيمة ابتلاء وتمحيص لا نقض للإيمان.", "وحدة الأمة والدعوة إلى الخير متلازمتان.", "التفكر في الخلق يثمر الذكر والدعاء."]
    ),
    questions: ll(
      ["Woran halten Sie sich fest, wenn Zweifel aufkommen?", "Was lernen Sie aus einem eigenen Misserfolg, wenn Sie ihn so betrachten, wie die Sure Uḥud deutet?"],
      ["What do you hold on to when doubts arise?", "What do you learn from a failure of your own if you look at it the way the surah interprets Uḥud?"],
      ["بم تتمسك حين تعرض لك الشبهات؟", "ماذا تتعلم من إخفاق مررت به لو نظرت إليه كما فسرت السورة أحدًا؟"]
    ),
    sections: [
      sec(1, 32, "Die Offenbarung, das Eindeutige und das Mehrdeutige, die wahre Religion", "Revelation, the clear and the ambiguous, the true religion", "الوحي والمحكم والمتشابه والدين الحق"),
      sec(33, 63, "Die Familie ʿImrāns, Maryam und ʿĪsā", "The family of ʿImrān, Maryam and ʿĪsā", "آل عمران ومريم وعيسى"),
      sec(64, 120, "Aufruf an die Schriftbesitzer und Einheit der Gemeinschaft", "Call to the People of the Book and unity of the community", "دعوة أهل الكتاب ووحدة الأمة"),
      sec(121, 175, "Badr und Uḥud: Lehren aus der Schlacht", "Badr and Uḥud: lessons from the battle", "بدر وأحد: دروس المعركة"),
      sec(176, 200, "Trost, Nachdenken über die Schöpfung und Geduld", "Consolation, reflection on creation and patience", "التسلية والتفكر في الخلق والصبر"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 4,
    theme: t(
      "Gerechtigkeit und Fürsorge für die Schwachen: Frauen, Waisen, Familie und Gesellschaft unter Gottes Recht.",
      "Justice and care for the weak: women, orphans, family and society under God's law.",
      "العدل ورعاية الضعفاء: المرأة واليتيم والأسرة والمجتمع في ظل شرع الله."
    ),
    context: t(
      "Medinensisch, überwiegend nach Uḥud, als viele Familien Väter und Ehemänner verloren hatten.",
      "Medinan, mostly after Uḥud, when many families had lost fathers and husbands.",
      "مدنية، نزل أكثرها بعد أحد حين فقدت أسر كثيرة آباءها وأزواجها."
    ),
    asbab: t(
      "Zu den Erbversen (ab Vers 11) wird die Frau des Saʿd ibn al-Rabīʿ mit ihren beiden Töchtern genannt (Abū Dāwūd, al-Tirmiḏī).",
      "For the inheritance verses (from verse 11) the wife of Saʿd ibn al-Rabīʿ and her two daughters are mentioned (Abū Dāwūd, al-Tirmidhī).",
      "يذكر في آيات المواريث (من الآية 11) امرأة سعد بن الربيع وابنتاها (أبو داود والترمذي)."
    ),
    connects: t(
      "Āl ʿImrān endet mit Gottesfurcht, an-Nisāʾ beginnt damit und baut darauf die Familie. Sie schließt mit Erbrecht, al-Māʾida beginnt mit dem Erfüllen der Verträge.",
      "Āl ʿImrān ends with God-consciousness, al-Nisāʾ begins with it and builds the family on it. It closes with inheritance law, al-Māʾida opens with fulfilling contracts.",
      "ختمت آل عمران بالتقوى وبها بدأت النساء وبنت عليها الأسرة، وختمت بالمواريث فافتتحت المائدة بالوفاء بالعقود."
    ),
    lessons: ll(
      ["Alle Menschen stammen von einer Seele ab; daraus folgt die Pflicht zur Verwandtschaftspflege.", "Das Vermögen der Waisen ist eine Vertrauenssache.", "Gerechtigkeit gilt auch gegen sich selbst und die Nächsten.", "Heuchelei wird an ihrem Verhalten erkannt."],
      ["All people come from one soul; from this follows the duty to maintain kinship.", "The property of orphans is a trust.", "Justice applies even against oneself and one's relatives.", "Hypocrisy is recognised by its conduct."],
      ["أصل الناس نفس واحدة، ومن ثم وجبت صلة الرحم.", "مال اليتيم أمانة.", "العدل واجب ولو على النفس والأقربين.", "النفاق يعرف بسلوكه."]
    ),
    questions: ll(
      ["Wem gegenüber fällt es Ihnen am schwersten, gerecht zu sein?", "Wer in Ihrer Umgebung ist schwach und auf Ihre Fürsorge angewiesen?"],
      ["Towards whom is it hardest for you to be just?", "Who around you is weak and depends on your care?"],
      ["مع من يصعب عليك العدل أكثر؟", "من الضعيف في محيطك الذي يحتاج إلى رعايتك؟"]
    ),
    sections: [
      sec(1, 35, "Waisen, Ehe, Erbrecht und Familie", "Orphans, marriage, inheritance and family", "اليتامى والنكاح والمواريث والأسرة"),
      sec(36, 70, "Rechte Gottes und der Menschen, Gehorsam und Urteil", "Rights of God and of people, obedience and judgment", "حقوق الله والناس والطاعة والتحاكم"),
      sec(71, 104, "Einsatz, Heuchler, Auswanderung und Furchtgebet", "Striving, hypocrites, emigration and the prayer of fear", "القتال والمنافقون والهجرة وصلاة الخوف"),
      sec(105, 152, "Gerechtigkeit, Ehekonflikte und Heuchelei", "Justice, marital disputes and hypocrisy", "العدل وشقاق الزوجين والنفاق"),
      sec(153, 176, "Schriftbesitzer, ʿĪsā und die Erbschaft der Kalāla", "People of the Book, ʿĪsā and the inheritance of kalāla", "أهل الكتاب وعيسى وميراث الكلالة"),
    ],
    src: [...BASE, "tabari", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 5,
    theme: t(
      "Treue zu den Verträgen mit Gott und den Menschen: die vollendete Religion, das Erlaubte und das Verbotene.",
      "Faithfulness to the covenants with God and people: the completed religion, the lawful and the forbidden.",
      "الوفاء بالعقود مع الله والناس: الدين المكتمل والحلال والحرام."
    ),
    context: t(
      "Medinensisch, aus der späten Zeit; Vers 3 kam nach Berichten bei al-Buḫārī und Muslim am Tag von ʿArafa der Abschiedswallfahrt herab.",
      "Medinan, from the late period; according to reports in al-Bukhārī and Muslim, verse 3 came down on the day of ʿArafa during the Farewell Pilgrimage.",
      "مدنية من أواخر ما نزل؛ والآية 3 نزلت يوم عرفة في حجة الوداع كما في البخاري ومسلم."
    ),
    connects: t(
      "Nach den Rechten in an-Nisāʾ ruft al-Māʾida zur Treue. Sie endet mit Gottes Herrschaft über Himmel und Erde, al-Anʿām beginnt mit dem Lob dessen, der sie erschuf.",
      "After the rights in al-Nisāʾ, al-Māʾida calls to faithfulness. It ends with God's dominion over heavens and earth, and al-Anʿām opens by praising the One who created them.",
      "بعد الحقوق في النساء دعت المائدة إلى الوفاء، وختمت بملك الله للسماوات والأرض، فافتتحت الأنعام بحمد خالقهما."
    ),
    lessons: ll(
      ["Ein Vertrag mit Gott verpflichtet auch im Umgang mit Menschen.", "Gerechtigkeit darf nicht an Abneigung gegen andere scheitern.", "Das Leben eines einzigen Menschen hat einen Wert, der alle Menschen berührt.", "Nach Gottes Offenbarung urteilen ist Kern der Treue."],
      ["A covenant with God also binds us in dealing with people.", "Justice must not fail because of dislike for others.", "The life of a single person has a worth that touches all of humanity.", "Judging by God's revelation is the core of faithfulness."],
      ["العهد مع الله يلزم في معاملة الناس.", "لا يمنع بغض قوم من العدل.", "حرمة النفس الواحدة عظيمة كحرمة البشر كلهم.", "الحكم بما أنزل الله لب الوفاء."]
    ),
    questions: ll(
      ["Welches Versprechen haben Sie gegeben, das Sie noch nicht erfüllt haben?", "Wann hat eine Abneigung Ihr Urteil über jemanden verzerrt?"],
      ["Which promise have you made that you have not yet fulfilled?", "When did a dislike distort your judgment of someone?"],
      ["ما الوعد الذي قطعته ولم تف به بعد؟", "متى أفسد بغضك حكمك على أحد؟"]
    ),
    sections: [
      sec(1, 11, "Verträge, erlaubte Speisen, Reinigung", "Contracts, lawful food, purification", "العقود والطيبات والطهارة"),
      sec(12, 50, "Bündnisse der Kinder Israels, die Söhne Adams, Strafen und Urteil", "Covenants of the Children of Israel, the sons of Adam, penalties and judgment", "مواثيق بني إسرائيل وابنا آدم والحدود والحكم"),
      sec(51, 86, "Loyalität und das Verhältnis zu den Schriftbesitzern", "Loyalty and relations with the People of the Book", "الولاء والعلاقة بأهل الكتاب"),
      sec(87, 108, "Erlaubtes und Verbotenes, Wein, Jagd im Weihezustand, Testament", "Lawful and forbidden, wine, hunting in iḥrām, bequest", "الحلال والحرام والخمر وصيد المحرم والوصية"),
      sec(109, 120, "Die Versammlung der Gesandten, ʿĪsā und der Tisch", "The gathering of the messengers, ʿĪsā and the table", "جمع الرسل وعيسى والمائدة"),
    ],
    src: [...BASE, "qurtubi"],
    review: DRAFT,
  },
  {
    s: 6,
    theme: t(
      "Der Einheitsglaube mit Beweisen aus Schöpfung und Vernunft und die Widerlegung der Beigesellung.",
      "Pure monotheism argued from creation and reason, and the refutation of associating partners with God.",
      "تقرير التوحيد بأدلة الخلق والعقل وإبطال الشرك."
    ),
    context: t(
      "Mekkanisch, aus der späten mekkanischen Zeit. Einige Gelehrte nehmen wenige Verse als medinensisch aus; Ibn ʿĀšūr bespricht diese Meinungen.",
      "Meccan, from the late Meccan period. Some scholars except a few verses as Medinan; Ibn ʿĀshūr discusses these views.",
      "مكية من أواخر العهد المكي، واستثنى بعض العلماء آيات قليلة عدوها مدنية، وناقش ذلك ابن عاشور."
    ),
    connects: t(
      "Sie folgt auf al-Māʾida mit dem Lob des Schöpfers. Sie nennt die Propheten knapp in einer Reihe (Verse 83–90), al-Aʿrāf erzählt ihre Geschichten ausführlich.",
      "It follows al-Māʾida with praise of the Creator. It names the prophets briefly in a row (verses 83–90); al-Aʿrāf tells their stories in detail.",
      "جاءت بعد المائدة بحمد الخالق، وذكرت الأنبياء مجملين (83–90) ففصلت الأعراف قصصهم."
    ),
    lessons: ll(
      ["Die Schöpfung selbst ist ein Beweis für den einen Schöpfer.", "Ibrāhīm zeigt, wie man im Gespräch mit Argumenten zur Wahrheit führt.", "Was erlaubt und verboten ist, legt nur Gott fest.", "Der gerade Weg ist einer, die Wege daneben sind viele."],
      ["Creation itself is evidence of the one Creator.", "Ibrāhīm shows how to lead to truth through reasoned dialogue.", "Only God decides what is lawful and forbidden.", "The straight path is one; the paths beside it are many."],
      ["الخلق نفسه دليل على الخالق الواحد.", "إبراهيم مثال للحوار بالحجة إلى الحق.", "التحليل والتحريم لله وحده.", "الطريق المستقيم واحد والطرق حوله كثيرة."]
    ),
    questions: ll(
      ["Welches Zeichen in der Natur hat Sie zuletzt an Gott erinnert?", "Welche Gewohnheit in Ihrem Leben folgt eher der Tradition als dem Wissen?"],
      ["Which sign in nature last reminded you of God?", "Which habit in your life follows custom more than knowledge?"],
      ["ما آخر آية في الكون ذكّرتك بالله؟", "أي عادة في حياتك تتبع الموروث أكثر من العلم؟"]
    ),
    sections: [
      sec(1, 30, "Der Schöpfer und die Ablehnung der Leugner", "The Creator and the rejection of the deniers", "الخالق وإعراض المكذبين"),
      sec(31, 73, "Trost für den Propheten ﷺ, Zeichen und das Verborgene", "Consolation for the Prophet ﷺ, signs and the unseen", "تسلية النبي ﷺ والآيات والغيب"),
      sec(74, 90, "Ibrāhīms Beweisführung und die Reihe der Propheten", "Ibrāhīm's reasoning and the line of prophets", "حجة إبراهيم وموكب الأنبياء"),
      sec(91, 117, "Die Offenbarung und die Zeichen in der Natur", "Revelation and the signs in nature", "الوحي وآيات الكون"),
      sec(118, 150, "Widerlegung selbsterdachter Speiseverbote", "Refutation of self-made food prohibitions", "إبطال تحريمات المشركين"),
      sec(151, 165, "Die zehn Gebote und der gerade Weg", "The ten commandments and the straight path", "الوصايا العشر والصراط المستقيم"),
    ],
    src: [...BASE, "tabari"],
    review: DRAFT,
  },
  {
    s: 7,
    theme: t(
      "Der Kampf zwischen Wahrheit und Irrtum von Adam an durch die Geschichte der Gesandten, mit der Warnung vor dem Schicksal der Leugner.",
      "The struggle between truth and falsehood from Adam on through the history of the messengers, warning of the fate of the deniers.",
      "الصراع بين الحق والباطل من آدم عبر تاريخ الرسل، والإنذار بمصير المكذبين."
    ),
    context: t(
      "Mekkanisch, aus der späten mekkanischen Zeit. Manche Gelehrte halten die Verse über die Stadt am Meer (163–171) für medinensisch.",
      "Meccan, from the late Meccan period. Some scholars consider the verses about the town by the sea (163–171) Medinan.",
      "مكية من أواخر العهد المكي، وعدّ بعضهم آيات القرية التي كانت على البحر (163–171) مدنية."
    ),
    connects: t(
      "Sie entfaltet die Prophetengeschichten, die al-Anʿām knapp nennt. Nach al-Biqāʿī zeigt al-Anfāl, wie die angedrohte Folge der Leugnung bei Badr sichtbar wurde.",
      "It unfolds the prophet stories that al-Anʿām names briefly. According to al-Biqāʿī, al-Anfāl shows how the threatened outcome of denial became visible at Badr.",
      "فصّلت قصص الأنبياء المجملة في الأنعام، ويرى البقاعي أن الأنفال أرت تحقق وعيد المكذبين في بدر."
    ),
    lessons: ll(
      ["Hochmut war die erste Sünde und bleibt die Wurzel der Ablehnung.", "Gottesfurcht ist die schönste Bekleidung des Menschen.", "Wissen ohne Handeln kann zum Verlust führen.", "Wenn der Qurʾān vorgetragen wird, soll man zuhören."],
      ["Arrogance was the first sin and remains the root of rejection.", "God-consciousness is the finest clothing of a person.", "Knowledge without action can lead to loss.", "When the Qurʾān is recited, one should listen."],
      ["الكبر أول معصية وأصل الإعراض.", "التقوى أجمل ما يتزين به العبد وأستر.", "العلم بلا عمل قد يورد الخسران.", "الإنصات عند قراءة القرآن."]
    ),
    questions: ll(
      ["Wo zeigt sich Hochmut in Ihrem Alltag, auch in kleinen Dingen?", "Welches Wissen besitzen Sie, nach dem Sie noch nicht handeln?"],
      ["Where does arrogance appear in your daily life, even in small things?", "What knowledge do you have that you do not yet act upon?"],
      ["أين يظهر الكبر في يومك ولو في الصغائر؟", "ما العلم الذي عندك ولم تعمل به بعد؟"]
    ),
    sections: [
      sec(1, 25, "Das Buch, die Erschaffung Adams und Iblīs", "The Book, the creation of Adam and Iblīs", "الكتاب وخلق آدم وإبليس"),
      sec(26, 58, "Aufrufe an die Kinder Adams und die Leute der Höhen", "Calls to the children of Adam and the people of the Heights", "نداءات بني آدم وأصحاب الأعراف"),
      sec(59, 102, "Nūḥ, Hūd, Ṣāliḥ, Lūṭ und Šuʿaib", "Nūḥ, Hūd, Ṣāliḥ, Lūṭ and Shuʿayb", "نوح وهود وصالح ولوط وشعيب"),
      sec(103, 171, "Mūsā, Pharao und die Kinder Israels", "Mūsā, Pharaoh and the Children of Israel", "موسى وفرعون وبنو إسرائيل"),
      sec(172, 206, "Der Urbund, die Stunde und der Abschluss", "The primordial covenant, the Hour and the conclusion", "الميثاق والساعة والختام"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 8,
    theme: t(
      "Der Sieg kommt von Gott: Erziehung der Gemeinschaft nach Badr zu Gehorsam, Einheit und Aufrichtigkeit.",
      "Victory comes from God: educating the community after Badr in obedience, unity and sincerity.",
      "النصر من عند الله: تربية الجماعة بعد بدر على الطاعة والوحدة والإخلاص."
    ),
    context: t(
      "Medinensisch, nach der Schlacht von Badr (2 n. H.).",
      "Medinan, after the Battle of Badr (2 AH).",
      "مدنية نزلت بعد غزوة بدر سنة اثنتين للهجرة."
    ),
    asbab: t(
      "Die Eröffnung kam wegen der Frage nach der Kriegsbeute von Badr herab; ein Bericht dazu stammt von Saʿd ibn Abī Waqqāṣ (Ṣaḥīḥ Muslim).",
      "The opening came down regarding the question of the spoils of Badr; one report on this is from Saʿd ibn Abī Waqqāṣ (Ṣaḥīḥ Muslim).",
      "نزل صدرها في السؤال عن غنائم بدر، ومن ذلك حديث سعد بن أبي وقاص في صحيح مسلم."
    ),
    connects: t(
      "Sie zeigt die Folge der Leugnung, die al-Aʿrāf androht. Mit at-Tawba ist sie so eng verbunden, dass zwischen beiden keine Basmala steht; ʿUṯmān erklärte das mit ihrer Ähnlichkeit (al-Tirmiḏī, Abū Dāwūd).",
      "It shows the outcome of denial that al-Aʿrāf warns of. It is so closely tied to al-Tawba that no basmala stands between them; ʿUthmān explained this by their similarity (al-Tirmidhī, Abū Dāwūd).",
      "أرت عاقبة التكذيب التي توعدت بها الأعراف، واتصلت بالتوبة حتى لم يفصل بينهما بالبسملة، وعلل ذلك عثمان بتشابه قصتيهما (الترمذي وأبو داود)."
    ),
    lessons: ll(
      ["Streit um Besitz wird durch Gottesfurcht und Versöhnung gelöst.", "Der Sieg hängt an Gottes Hilfe, nicht an Zahlen.", "Uneinigkeit lässt die Kraft schwinden.", "Treue zu Verträgen gilt auch gegenüber Gegnern."],
      ["Disputes over property are resolved by God-consciousness and reconciliation.", "Victory depends on God's help, not on numbers.", "Disunity makes strength vanish.", "Faithfulness to treaties applies even towards opponents."],
      ["النزاع على المال يحل بالتقوى وإصلاح ذات البين.", "النصر بمدد الله لا بالعدد.", "التنازع يذهب القوة.", "الوفاء بالعهد واجب حتى مع الخصوم."]
    ),
    questions: ll(
      ["Wo schreiben Sie Erfolge sich selbst zu statt Gott?", "Welcher Streit in Ihrem Umfeld bräuchte Versöhnung?"],
      ["Where do you attribute success to yourself instead of to God?", "Which dispute around you needs reconciliation?"],
      ["أين تنسب النجاح إلى نفسك لا إلى الله؟", "أي خلاف في محيطك يحتاج إلى إصلاح؟"]
    ),
    sections: [
      sec(1, 19, "Die Beute, Merkmale der Gläubigen und der Tag von Badr", "The spoils, traits of believers and the day of Badr", "الأنفال وصفات المؤمنين ويوم بدر"),
      sec(20, 40, "Aufruf zum Gehorsam und die Pläne der Quraiš", "Call to obedience and the plots of Quraysh", "الدعوة إلى الاستجابة وكيد قريش"),
      sec(41, 54, "Das Fünftel und die Ordnung der Schlacht", "The fifth and the order of battle", "الخمس وتدبير المعركة"),
      sec(55, 75, "Verträge, Gefangene und die Bande der Gläubigen", "Treaties, captives and the bonds of believers", "العهود والأسرى وولاية المؤمنين"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 9,
    theme: t(
      "Klare Trennung von Treue und Verrat: Lossagung von den Vertragsbrechern und Entlarvung der Heuchler.",
      "A clear line between loyalty and betrayal: disavowal of treaty breakers and exposure of the hypocrites.",
      "المفاصلة بين الوفاء والغدر: البراءة من الناكثين وكشف المنافقين."
    ),
    context: t(
      "Medinensisch, im Jahr 9 n. H. um den Feldzug nach Tabūk; sie beginnt als einzige Sure ohne Basmala.",
      "Medinan, in the year 9 AH around the expedition to Tabūk; it is the only surah that begins without the basmala.",
      "مدنية نزلت سنة تسع حول غزوة تبوك، وهي السورة الوحيدة التي لم تبدأ بالبسملة."
    ),
    asbab: t(
      "Zu Vers 118 gehört der lange Bericht des Kaʿb ibn Mālik über die drei Zurückgebliebenen (al-Buḫārī, Muslim).",
      "Verse 118 is connected to the long report of Kaʿb ibn Mālik about the three who stayed behind (al-Bukhārī, Muslim).",
      "في الآية 118 حديث كعب بن مالك الطويل في الثلاثة الذين تخلفوا (البخاري ومسلم)."
    ),
    connects: t(
      "Sie setzt al-Anfāl fort. Sie endet mit der Fürsorge des Propheten ﷺ für seine Gemeinschaft, und Yūnus beginnt mit dem Erstaunen, dass ein Mensch zum Gesandten wurde.",
      "It continues al-Anfāl. It ends with the Prophet's ﷺ care for his community, and Yūnus opens with the astonishment that a human was made messenger.",
      "هي تتمة الأنفال، وختمت بحرص النبي ﷺ على أمته، فافتتحت يونس بتعجب الناس من إرسال رجل منهم."
    ),
    lessons: ll(
      ["Echte Reue wird angenommen, auch nach schwerem Versagen.", "Ausreden zeigen oft, was im Herzen ist.", "Der Gläubige gibt Leben und Besitz für Gott hin und macht dabei den besten Handel.", "Ein Bau, der auf Schaden gegründet ist, hat keinen Bestand."],
      ["Sincere repentance is accepted, even after serious failure.", "Excuses often reveal what is in the heart.", "The believer gives life and wealth for God and makes the best bargain in doing so.", "A building founded on harm does not last."],
      ["التوبة الصادقة مقبولة ولو بعد تقصير كبير.", "الأعذار كثيرًا ما تكشف ما في القلب.", "المؤمن باع نفسه وماله لله في صفقة رابحة.", "البناء على الضرار لا يدوم."]
    ),
    questions: ll(
      ["Welche Ausrede benutzen Sie, um eine Pflicht aufzuschieben?", "Was können Sie aus der Ehrlichkeit des Kaʿb ibn Mālik lernen?"],
      ["Which excuse do you use to postpone a duty?", "What can you learn from the honesty of Kaʿb ibn Mālik?"],
      ["ما العذر الذي تؤجل به واجبًا؟", "ماذا تتعلم من صدق كعب بن مالك؟"]
    ),
    sections: [
      sec(1, 37, "Lossagung, heilige Monate und Vertragstreue", "Disavowal, sacred months and keeping treaties", "البراءة والأشهر الحرم والوفاء بالعهد"),
      sec(38, 72, "Der Aufruf nach Tabūk und die Ausreden der Heuchler", "The call to Tabūk and the excuses of the hypocrites", "النفير إلى تبوك وأعذار المنافقين"),
      sec(73, 110, "Heuchler, Beduinen und die Moschee des Schadens", "Hypocrites, Bedouins and the mosque of harm", "المنافقون والأعراب ومسجد الضرار"),
      sec(111, 129, "Der Handel mit Gott, die Reue der Drei und der Gesandte ﷺ", "The bargain with God, the repentance of the three and the Messenger ﷺ", "الصفقة مع الله وتوبة الثلاثة والرسول ﷺ"),
    ],
    src: [...BASE, "qurtubi"],
    review: DRAFT,
  },
  {
    s: 10,
    theme: t(
      "Die Wahrheit der Offenbarung und Gottes Geduld mit den Menschen, die erst im letzten Augenblick glauben wollen.",
      "The truth of revelation and God's patience with people who only want to believe at the last moment.",
      "صدق الوحي وحلم الله على الناس الذين لا يؤمنون إلا في اللحظة الأخيرة."
    ),
    context: t(
      "Mekkanisch. Einige Gelehrte nehmen einzelne Verse (etwa 40 und 94–96) als medinensisch aus.",
      "Meccan. Some scholars except individual verses (such as 40 and 94–96) as Medinan.",
      "مكية، واستثنى بعضهم آيات منها كالآية 40 والآيات 94–96 وعدوها مدنية."
    ),
    connects: t(
      "At-Tawba endet mit dem Gesandten ﷺ, Yūnus beginnt mit der Verwunderung über seine Sendung. Hūd folgt mit demselben Aufbau und ausführlicheren Geschichten.",
      "Al-Tawba ends with the Messenger ﷺ, Yūnus opens with astonishment at his sending. Hūd follows with the same structure and more detailed stories.",
      "ختمت التوبة بالرسول ﷺ وبدأت يونس بالتعجب من إرساله، وتلتها هود على نسقها بتفصيل أوسع."
    ),
    lessons: ll(
      ["In der Not wenden sich Menschen an Gott, in der Rettung vergessen sie ihn.", "Der Qurʾān heilt die Krankheiten der Herzen.", "Glaube im Augenblick des Untergangs nützt nicht mehr, wie bei Pharao.", "Das Volk des Yūnus zeigt, dass Umkehr rechtzeitig rettet."],
      ["In hardship people turn to God; once rescued they forget him.", "The Qurʾān heals the illnesses of the hearts.", "Faith at the moment of destruction no longer helps, as with Pharaoh.", "The people of Yūnus show that timely return saves."],
      ["يلجأ الناس إلى الله في الشدة وينسونه في الرخاء.", "القرآن دواء لأمراض القلوب.", "إيمان ساعة الغرق لا ينفع كما في فرعون.", "قوم يونس دليل على أن التوبة في وقتها تنجي."]
    ),
    questions: ll(
      ["Erinnern Sie sich an Gott nach einer Rettung genauso wie in der Not?", "Was schieben Sie auf, in der Annahme, später sei noch Zeit?"],
      ["Do you remember God after a rescue as much as in hardship?", "What are you postponing on the assumption that there will be time later?"],
      ["هل تذكر الله بعد النجاة كما تذكره في الشدة؟", "ما الذي تؤجله ظانًا أن في الوقت متسعًا؟"]
    ),
    sections: [
      sec(1, 25, "Die Offenbarung und die Zeichen der Schöpfung", "Revelation and the signs of creation", "الوحي وآيات الخلق"),
      sec(26, 70, "Die Herausforderung des Qurʾān und die Warnung", "The challenge of the Qurʾān and the warning", "التحدي بالقرآن والإنذار"),
      sec(71, 93, "Nūḥ, Mūsā und Pharao", "Nūḥ, Mūsā and Pharaoh", "نوح وموسى وفرعون"),
      sec(94, 109, "Das Volk des Yūnus und der Abschluss", "The people of Yūnus and the conclusion", "قوم يونس والختام"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 11,
    theme: t(
      "Standhaftigkeit auf dem geraden Weg im Licht der Geschichten der Propheten und ihrer Völker.",
      "Steadfastness on the straight path in light of the stories of the prophets and their peoples.",
      "الاستقامة على الطريق في ضوء قصص الأنبياء وأقوامهم."
    ),
    context: t(
      "Mekkanisch, aus einer schweren Zeit vor der Auswanderung. Manche nehmen einzelne Verse (etwa 12, 17, 114) als medinensisch aus.",
      "Meccan, from a hard time before the emigration. Some except individual verses (such as 12, 17, 114) as Medinan.",
      "مكية من فترة شدة قبل الهجرة، واستثنى بعضهم آيات كالآية 12 و17 و114."
    ),
    asbab: t(
      "Zu Vers 114 berichten al-Buḫārī und Muslim von Ibn Masʿūd über einen Mann, der eine Verfehlung bereute und zum Propheten ﷺ kam.",
      "For verse 114, al-Bukhārī and Muslim report from Ibn Masʿūd about a man who regretted a wrong and came to the Prophet ﷺ.",
      "في الآية 114 حديث ابن مسعود في البخاري ومسلم عن رجل ندم على ذنب أصابه فأتى النبي ﷺ."
    ),
    connects: t(
      "Sie führt die Geschichten aus Yūnus weiter aus. Sie endet mit dem Hinweis, dass die Erzählungen das Herz festigen, und Yūsuf folgt als zusammenhängende Erzählung.",
      "It expands the stories of Yūnus. It ends by noting that the narratives strengthen the heart, and Yūsuf follows as one continuous story.",
      "فصّلت ما أجملته يونس، وختمت بأن القصص تثبيت للفؤاد، فجاءت يوسف قصة واحدة متصلة."
    ),
    lessons: ll(
      ["Standhaftigkeit ist der Auftrag, auch wenn die Umgebung anders handelt.", "Blutsverwandtschaft rettet nicht ohne Glauben, wie bei Nūḥs Sohn.", "Gute Taten tilgen die Spuren schlechter Taten.", "Die Geschichten der Propheten festigen das Herz."],
      ["Steadfastness is the task, even when the surroundings act differently.", "Kinship does not save without faith, as with the son of Nūḥ.", "Good deeds erase the traces of bad ones.", "The stories of the prophets strengthen the heart."],
      ["الاستقامة هي المأمور بها وإن خالف الناس.", "القرابة لا تنجي بلا إيمان كما في ابن نوح.", "العمل الصالح يمحو أثر الذنب.", "قصص الأنبياء تثبيت للقلب."]
    ),
    questions: ll(
      ["In welchem Bereich Ihres Lebens fällt Ihnen Beständigkeit am schwersten?", "Welche gute Tat können Sie heute einer Verfehlung folgen lassen?"],
      ["In which area of your life is constancy hardest for you?", "Which good deed can you let follow a wrong today?"],
      ["في أي جانب من حياتك تصعب عليك الاستقامة؟", "أي حسنة تتبع بها سيئة اليوم؟"]
    ),
    sections: [
      sec(1, 24, "Das wohlgefügte Buch und der Ruf zur Umkehr", "The well-ordered Book and the call to return", "الكتاب المحكم والدعوة إلى التوبة"),
      sec(25, 49, "Nūḥ und die Arche", "Nūḥ and the Ark", "نوح والسفينة"),
      sec(50, 68, "Hūd und Ṣāliḥ", "Hūd and Ṣāliḥ", "هود وصالح"),
      sec(69, 83, "Ibrāhīm und Lūṭ", "Ibrāhīm and Lūṭ", "إبراهيم ولوط"),
      sec(84, 95, "Šuʿaib und Madyan", "Shuʿayb and Madyan", "شعيب ومدين"),
      sec(96, 123, "Mūsā, Lehren und der Auftrag zur Standhaftigkeit", "Mūsā, lessons and the command to steadfastness", "موسى والعبر والأمر بالاستقامة"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 12,
    theme: t(
      "Gottes verborgene Fügung: Geduld und Lauterkeit führen durch Prüfungen hindurch zu Ehre und Versöhnung.",
      "God's hidden design: patience and integrity lead through trials to honour and reconciliation.",
      "لطف التدبير الإلهي: الصبر والعفة يقودان عبر المحن إلى التمكين والصلح."
    ),
    context: t(
      "Mekkanisch, aus der Zeit um das Jahr der Trauer, als der Prophet ﷺ selbst Ablehnung und Verlust erfuhr.",
      "Meccan, from around the Year of Sorrow, when the Prophet ﷺ himself experienced rejection and loss.",
      "مكية نزلت قرابة عام الحزن حين لقي النبي ﷺ الصد والفقد."
    ),
    connects: t(
      "Hūd endet mit den Erzählungen zur Festigung, Yūsuf ist eine einzige, vollständige Erzählung. Sie schließt mit den Zeichen, an denen Menschen vorübergehen, und ar-Raʿd beginnt mit diesen Zeichen.",
      "Hūd ends with the narratives that strengthen, Yūsuf is one single, complete narrative. It closes with the signs people pass by, and al-Raʿd begins with these signs.",
      "ختمت هود بالقصص المثبتة، ويوسف قصة واحدة تامة، وختمت بآيات يمر عليها الناس معرضين فافتتحت الرعد بهذه الآيات."
    ),
    lessons: ll(
      ["Hinter scheinbarem Unglück kann Gottes Plan stehen.", "Keuschheit und Lauterkeit haben Vorrang vor Ansehen und Sicherheit.", "Schöne Geduld klagt nur vor Gott.", "Vergebung nach Macht ist der Höhepunkt des Edelmuts."],
      ["God's plan can stand behind apparent misfortune.", "Chastity and integrity take precedence over status and safety.", "Beautiful patience complains only to God.", "Forgiveness when in power is the height of nobility."],
      ["قد يكون وراء البلاء الظاهر تدبير إلهي.", "العفة والأمانة مقدمتان على الجاه والأمن.", "الصبر الجميل لا شكوى فيه إلا إلى الله.", "العفو عند المقدرة غاية الكرم."]
    ),
    questions: ll(
      ["Welche Prüfung in Ihrem Leben hat sich später als gut erwiesen?", "Wem könnten Sie heute vergeben, obwohl Sie im Recht sind?"],
      ["Which trial in your life later turned out to be good?", "Whom could you forgive today, even though you are in the right?"],
      ["أي محنة في حياتك ظهر خيرها لاحقًا؟", "من تستطيع أن تعفو عنه اليوم وأنت صاحب الحق؟"]
    ),
    sections: [
      sec(1, 6, "Einleitung und Yūsufs Traum", "Introduction and Yūsuf's dream", "المقدمة ورؤيا يوسف"),
      sec(7, 20, "Die Brüder und der Brunnen", "The brothers and the well", "الإخوة والجب"),
      sec(21, 35, "In Ägypten: die Versuchung", "In Egypt: the temptation", "في مصر: المراودة"),
      sec(36, 57, "Gefängnis, Traumdeutung und Aufstieg", "Prison, dream interpretation and rise", "السجن والتأويل والتمكين"),
      sec(58, 93, "Die Brüder kommen nach Ägypten", "The brothers come to Egypt", "قدوم الإخوة إلى مصر"),
      sec(94, 111, "Wiedersehen und Lehren der Erzählung", "Reunion and lessons of the story", "اللقاء وعبر القصة"),
    ],
    src: [...BASE, "tabari"],
    review: DRAFT,
  },
  {
    s: 13,
    theme: t(
      "Die Wahrheit der Offenbarung zeigt sich in Gottes Zeichen; Herzen finden Ruhe im Gedenken an Gott.",
      "The truth of revelation shows in God's signs; hearts find rest in the remembrance of God.",
      "حق الوحي يتجلى في آيات الله، وفي ذكر الله سكينة القلوب."
    ),
    context: t(
      "Umstritten: Viele Gelehrte halten sie für mekkanisch, andere für medinensisch; Ibn ʿĀšūr neigt wegen Stil und Inhalt zur mekkanischen Herkunft.",
      "Disputed: many scholars consider it Meccan, others Medinan; Ibn ʿĀshūr leans towards a Meccan origin because of its style and content.",
      "مختلف فيها: عدها كثيرون مكية وآخرون مدنية، ومال ابن عاشور إلى أنها مكية لأسلوبها وموضوعها."
    ),
    connects: t(
      "Yūsuf endet mit Zeichen, an denen man achtlos vorbeigeht; ar-Raʿd beginnt mit ihnen. Sie endet mit dem Zeugnis über das Buch, und Ibrāhīm beginnt mit dem Buch, das aus der Finsternis ins Licht führt.",
      "Yūsuf ends with signs people pass by heedlessly; al-Raʿd begins with them. It ends with testimony about the Book, and Ibrāhīm opens with the Book that leads from darkness into light.",
      "ختمت يوسف بالآيات المعرض عنها فبدأت الرعد بها، وختمت بالشهادة للكتاب فافتتحت إبراهيم بالكتاب المخرج من الظلمات إلى النور."
    ),
    lessons: ll(
      ["Eine Veränderung der Lage beginnt mit einer Veränderung im Inneren der Menschen.", "Wahrheit bleibt wie Wasser, Falschheit vergeht wie Schaum.", "Gedenken an Gott schenkt dem Herzen Ruhe."],
      ["A change of condition begins with a change within people.", "Truth remains like water, falsehood passes like foam.", "Remembrance of God gives the heart rest."],
      ["تغيير حال الأمة مرهون بتغيير ما في نفوس أهلها.", "الحق يبقى كالماء والباطل يذهب كالزبد.", "في ذكر الله سكينة القلب وراحته."]
    ),
    questions: ll(
      ["Was müssten Sie an sich selbst ändern, damit sich Ihre Lage ändert?", "Wann haben Sie zuletzt Ruhe im Gedenken an Gott gefunden?"],
      ["What would you need to change in yourself for your situation to change?", "When did you last find rest in the remembrance of God?"],
      ["ما الذي ينبغي أن تغيره في نفسك ليتغير حالك؟", "متى وجدت آخر مرة سكينة في ذكر الله؟"]
    ),
    sections: [
      sec(1, 18, "Zeichen in Himmel und Erde und das Gleichnis von Wasser und Schaum", "Signs in heaven and earth and the parable of water and foam", "آيات السماء والأرض ومثل الماء والزبد"),
      sec(19, 26, "Die Verständigen und die Bundbrecher", "People of understanding and the covenant breakers", "أولو الألباب وناقضو العهد"),
      sec(27, 43, "Antwort auf die Forderungen und das Zeugnis des Buches", "Answer to the demands and the testimony of the Book", "الرد على المقترحات وشهادة الكتاب"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 14,
    theme: t(
      "Die Offenbarung führt aus der Finsternis ins Licht; Dankbarkeit für Gottes Gaben und Standhaftigkeit des guten Wortes.",
      "Revelation leads from darkness into light; gratitude for God's gifts and the firmness of the good word.",
      "الوحي يخرج من الظلمات إلى النور، وشكر النعم وثبات الكلمة الطيبة."
    ),
    context: t(
      "Mekkanisch. Manche nehmen die Verse 28–29 als medinensisch aus.",
      "Meccan. Some except verses 28–29 as Medinan.",
      "مكية، واستثنى بعضهم الآيتين 28–29."
    ),
    connects: t(
      "Sie knüpft an das Buch am Ende von ar-Raʿd an. Sie endet mit einer Botschaft an die Menschen, al-Ḥiǧr beginnt mit den Versen des klaren Buches.",
      "It picks up the Book at the end of al-Raʿd. It ends with a message to mankind, al-Ḥijr opens with the verses of the clear Book.",
      "تتصل بذكر الكتاب في ختام الرعد، وختمت ببلاغ للناس فافتتحت الحجر بآيات الكتاب المبين."
    ),
    lessons: ll(
      ["Dankbarkeit vermehrt die Gaben, Undank gefährdet sie.", "Das gute Wort gleicht einem fest verwurzelten Baum.", "Am Ende sagt sich Šaiṭān von seinen Folgern los.", "Ibrāhīms Gebet verbindet Ort, Nachkommen und Gottesdienst."],
      ["Gratitude increases the gifts, ingratitude endangers them.", "The good word is like a firmly rooted tree.", "In the end, Shayṭān disowns those who followed him.", "Ibrāhīm's prayer joins place, offspring and worship."],
      ["الشكر يزيد النعم والكفر يعرضها للزوال.", "الكلمة الطيبة كشجرة ثابتة الأصل.", "يتبرأ الشيطان من أتباعه يوم القيامة.", "دعاء إبراهيم يجمع البلد والذرية والعبادة."]
    ),
    questions: ll(
      ["Für welche Gabe haben Sie Gott heute noch nicht gedankt?", "Welche Wurzeln hat Ihr Glaube, die ihn in Stürmen halten?"],
      ["For which gift have you not yet thanked God today?", "What roots does your faith have that hold it in storms?"],
      ["على أي نعمة لم تشكر الله اليوم؟", "ما الجذور التي تثبت إيمانك في العواصف؟"]
    ),
    sections: [
      sec(1, 8, "Das Buch als Licht und die Sendung Mūsās", "The Book as light and the mission of Mūsā", "الكتاب نورًا ورسالة موسى"),
      sec(9, 21, "Die Gesandten und ihre Völker", "The messengers and their peoples", "الرسل وأقوامهم"),
      sec(22, 34, "Die Rede des Šaiṭān, das gute und das schlechte Wort, die Gaben", "Shayṭān's speech, the good and the bad word, the gifts", "خطبة الشيطان والكلمة الطيبة والخبيثة والنعم"),
      sec(35, 41, "Das Gebet Ibrāhīms", "The prayer of Ibrāhīm", "دعاء إبراهيم"),
      sec(42, 52, "Warnung vor dem Tag der Abrechnung", "Warning of the Day of Reckoning", "الإنذار بيوم الحساب"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 15,
    theme: t(
      "Gott bewahrt seine Offenbarung; Trost für den Propheten ﷺ angesichts von Spott und Ablehnung.",
      "God preserves his revelation; consolation for the Prophet ﷺ in the face of mockery and rejection.",
      "حفظ الله لوحيه، وتسلية النبي ﷺ أمام الاستهزاء والتكذيب."
    ),
    context: t(
      "Mekkanisch, aus der mittleren mekkanischen Zeit.",
      "Meccan, from the middle Meccan period.",
      "مكية من أواسط العهد المكي."
    ),
    connects: t(
      "Ibrāhīm endet mit einer Botschaft an die Menschen, al-Ḥiǧr beginnt mit dem klaren Buch. Sie endet mit dem Gebot, bis zum Tod Gott zu dienen, und an-Naḥl beginnt mit dem Kommen von Gottes Befehl.",
      "Ibrāhīm ends with a message to mankind, al-Ḥijr opens with the clear Book. It ends with the command to worship God until death, and al-Naḥl opens with the coming of God's command.",
      "ختمت إبراهيم بالبلاغ وافتتحت الحجر بالكتاب المبين، وختمت بالأمر بالعبادة حتى الموت فافتتحت النحل بإتيان أمر الله."
    ),
    lessons: ll(
      ["Die Bewahrung des Qurʾān ist Gottes Zusage.", "Neid und Hochmut ließen Iblīs scheitern.", "Gegen Spott helfen Lobpreis, Niederwerfung und Geduld."],
      ["The preservation of the Qurʾān is God's promise.", "Envy and arrogance made Iblīs fail.", "Against mockery, praise, prostration and patience help."],
      ["حفظ القرآن وعد من الله.", "الحسد والكبر أهلكا إبليس.", "علاج الاستهزاء التسبيح والسجود والصبر."]
    ),
    questions: ll(
      ["Wie gehen Sie mit Spott über Ihren Glauben um?", "Was bedeutet es für Sie, Gott bis zum Ende zu dienen?"],
      ["How do you deal with mockery of your faith?", "What does it mean for you to worship God until the end?"],
      ["كيف تتعامل مع السخرية من دينك؟", "ماذا يعني لك أن تعبد الله حتى النهاية؟"]
    ),
    sections: [
      sec(1, 25, "Das bewahrte Buch und die Zeichen am Himmel", "The preserved Book and the signs in the sky", "الكتاب المحفوظ وآيات السماء"),
      sec(26, 48, "Die Erschaffung des Menschen und die Weigerung des Iblīs", "The creation of man and the refusal of Iblīs", "خلق الإنسان وإباء إبليس"),
      sec(49, 84, "Ibrāhīms Gäste, Lūṭ, die Leute des Dickichts und von al-Ḥiǧr", "Ibrāhīm's guests, Lūṭ, the people of the thicket and of al-Ḥijr", "ضيف إبراهيم ولوط وأصحاب الأيكة والحجر"),
      sec(85, 99, "Die sieben Wiederholten, Geduld und Gottesdienst", "The seven oft-repeated, patience and worship", "السبع المثاني والصبر والعبادة"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 16,
    theme: t(
      "Die Fülle von Gottes Gaben als Ruf zu Dank und Einheitsglauben.",
      "The abundance of God's gifts as a call to gratitude and pure monotheism.",
      "تعداد نعم الله دعوة إلى الشكر والتوحيد."
    ),
    context: t(
      "Mekkanisch, aus der späten mekkanischen Zeit. Viele halten die letzten Verse (126–128) für medinensisch.",
      "Meccan, from the late Meccan period. Many consider the last verses (126–128) Medinan.",
      "مكية من أواخر العهد المكي، وعدّ كثيرون خواتيمها (126–128) مدنية."
    ),
    asbab: t(
      "Zu Vers 126 überliefert al-Tirmiḏī von Ubayy ibn Kaʿb, dass er nach Uḥud herabkam.",
      "For verse 126, al-Tirmidhī transmits from Ubayy ibn Kaʿb that it came down after Uḥud.",
      "في الآية 126 روى الترمذي عن أبي بن كعب أنها نزلت بعد أحد."
    ),
    connects: t(
      "Al-Ḥiǧr endet mit dem Gottesdienst bis zum Tod, an-Naḥl beginnt mit dem Kommen des Befehls. Sie endet mit Geduld und Ibrāhīm, al-Isrāʾ beginnt mit dem Lobpreis und der Nachtreise.",
      "Al-Ḥijr ends with worship until death, al-Naḥl opens with the coming of the command. It ends with patience and Ibrāhīm, and al-Isrāʾ opens with glorification and the Night Journey.",
      "ختمت الحجر بالعبادة حتى الموت وبدأت النحل بإتيان الأمر، وختمت بالصبر وإبراهيم فافتتحت الإسراء بالتسبيح وذكر الإسراء."
    ),
    lessons: ll(
      ["Die Gaben Gottes sind zu zahlreich, um sie zu zählen.", "Gerechtigkeit, Güte und Fürsorge für Verwandte sind Kern der Ordnung.", "Einladung zu Gott geschieht mit Weisheit und gutem Wort.", "Wer unter Zwang leugnet, dessen Herz aber fest bleibt, wird entschuldigt."],
      ["God's gifts are too many to count.", "Justice, excellence and care for relatives are the core of the order.", "Inviting to God happens with wisdom and good words.", "Whoever denies under coercion while the heart stays firm is excused."],
      ["نعم الله أكثر من أن يحيط بها العد.", "العدل والإحسان وصلة القرابة أساس النظام.", "الدعوة إلى الله بالحكمة والكلمة الحسنة.", "من أكره وقلبه ثابت على الإيمان معذور."]
    ),
    questions: ll(
      ["Welche Gabe nehmen Sie für so selbstverständlich, dass Sie sie nicht mehr sehen?", "Wie laden Sie andere zu Gutem ein: mit Weisheit oder mit Härte?"],
      ["Which gift do you take so much for granted that you no longer see it?", "How do you invite others to good: with wisdom or with harshness?"],
      ["أي نعمة اعتدتها حتى لم تعد تراها؟", "كيف تدعو غيرك إلى الخير: بالحكمة أم بالشدة؟"]
    ),
    sections: [
      sec(1, 21, "Der Befehl kommt, die Gaben der Schöpfung", "The command comes, the gifts of creation", "إتيان الأمر ونعم الخلق"),
      sec(22, 40, "Die Hochmütigen und die Auferstehung", "The arrogant and the resurrection", "المستكبرون والبعث"),
      sec(41, 64, "Auswanderung und falsche Zuschreibungen an Gott", "Emigration and false attributions to God", "الهجرة وافتراءات المشركين"),
      sec(65, 89, "Zeichen: Regen, Milch, Bienen und Häuser", "Signs: rain, milk, bees and dwellings", "آيات المطر واللبن والنحل والبيوت"),
      sec(90, 105, "Gerechtigkeit, Güte und Treue zum Bund", "Justice, excellence and faithfulness to covenants", "العدل والإحسان والوفاء بالعهد"),
      sec(106, 128, "Zwang, Dankbarkeit, Ibrāhīm und weise Einladung", "Coercion, gratitude, Ibrāhīm and wise invitation", "الإكراه والشكر وإبراهيم والدعوة بالحكمة"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 17,
    theme: t(
      "Die Würde des Menschen und die Führung durch den Qurʾān zum geradesten Weg.",
      "The dignity of the human being and the guidance of the Qurʾān to the most upright way.",
      "تكريم الإنسان وهداية القرآن إلى أعدل الطرق وأصوبها."
    ),
    context: t(
      "Mekkanisch, aus der späten Zeit kurz vor der Auswanderung, nach der Nachtreise. Bei einzelnen Versen gibt es Meinungen, sie seien medinensisch.",
      "Meccan, from the late period shortly before the emigration, after the Night Journey. For individual verses there are views that they are Medinan.",
      "مكية من أواخر العهد المكي بعد الإسراء وقبيل الهجرة، وفي آيات منها خلاف."
    ),
    asbab: t(
      "Zu Vers 85 (Frage nach dem Geist) berichten al-Buḫārī und Muslim von Ibn Masʿūd eine Frage in Medina; al-Tirmiḏī überliefert von Ibn ʿAbbās eine Frage der Quraiš.",
      "For verse 85 (the question about the spirit), al-Bukhārī and Muslim report from Ibn Masʿūd a question in Medina; al-Tirmidhī transmits from Ibn ʿAbbās a question by Quraysh.",
      "في الآية 85 عن الروح روى البخاري ومسلم عن ابن مسعود أن السؤال كان بالمدينة، وروى الترمذي عن ابن عباس أن قريشًا سألت."
    ),
    connects: t(
      "An-Naḥl endet mit Geduld, al-Isrāʾ beginnt mit dem Lobpreis der Nachtreise. Sie endet mit dem Lob Gottes, und al-Kahf beginnt mit dem Lob Gottes.",
      "Al-Naḥl ends with patience, al-Isrāʾ opens by glorifying God for the Night Journey. It ends with praise of God, and al-Kahf opens with praise of God.",
      "ختمت النحل بالصبر وبدأت الإسراء بالتسبيح، وختمت بالحمد فافتتحت الكهف بالحمد."
    ),
    lessons: ll(
      ["Jeder trägt die Verantwortung für sein eigenes Handeln.", "Güte gegenüber den Eltern steht direkt nach dem Einheitsglauben.", "Verschwendung und Geiz sind beide zu meiden.", "Das Gebet in der Nacht gibt Kraft für den Auftrag."],
      ["Everyone bears responsibility for their own deeds.", "Kindness to parents comes directly after pure monotheism.", "Both wastefulness and stinginess are to be avoided.", "Prayer at night gives strength for the mission."],
      ["كل امرئ مسؤول عن عمله.", "بر الوالدين يلي التوحيد مباشرة.", "التوسط بين الإسراف والبخل.", "قيام الليل زاد للرسالة."]
    ),
    questions: ll(
      ["Wie behandeln Sie Ihre Eltern, besonders wenn sie alt werden?", "Welcher der Grundsätze in den Versen 23–39 fordert Sie am meisten heraus?"],
      ["How do you treat your parents, especially as they grow old?", "Which of the principles in verses 23–39 challenges you most?"],
      ["كيف تعامل والديك خاصة عند الكبر؟", "أي الوصايا في الآيات 23–39 أشدها عليك؟"]
    ),
    sections: [
      sec(1, 8, "Die Nachtreise und die Geschichte der Kinder Israels", "The Night Journey and the history of the Children of Israel", "الإسراء وتاريخ بني إسرائيل"),
      sec(9, 22, "Führung durch den Qurʾān und persönliche Verantwortung", "Guidance through the Qurʾān and personal responsibility", "هداية القرآن والمسؤولية الفردية"),
      sec(23, 39, "Die Gebote: Eltern, Verwandte, Mäßigung, Leben, Waisen", "The commandments: parents, relatives, moderation, life, orphans", "الوصايا: الوالدان والقرابة والقصد والنفس واليتيم"),
      sec(40, 60, "Widerlegung der Beigesellung und die Auferstehung", "Refutation of associating partners and the resurrection", "إبطال الشرك والبعث"),
      sec(61, 72, "Iblīs und der geehrte Mensch", "Iblīs and the honoured human", "إبليس والإنسان المكرم"),
      sec(73, 100, "Standhaftigkeit, Gebet und der Qurʾān als Heilung", "Steadfastness, prayer and the Qurʾān as healing", "الثبات والصلاة والقرآن شفاء"),
      sec(101, 111, "Mūsā und Pharao, der Qurʾān in Abschnitten, Lob Gottes", "Mūsā and Pharaoh, the Qurʾān in portions, praise of God", "موسى وفرعون وتنزيل القرآن مفرقًا والحمد"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 19,
    theme: t(
      "Gottes Barmherzigkeit mit seinen Propheten und die Bekräftigung seiner Einzigkeit gegen die Behauptung, er habe ein Kind.",
      "God's mercy towards his prophets and the affirmation of his oneness against the claim that he has a child.",
      "رحمة الله بأنبيائه وتقرير وحدانيته وتنزيهه عن الولد."
    ),
    context: t(
      "Mekkanisch, aus der frühen Zeit vor der Auswanderung nach Abessinien; nach einem Bericht von Umm Salama bei Aḥmad trug Ǧaʿfar ibn Abī Ṭālib ihren Anfang vor dem Negus vor.",
      "Meccan, from the early period before the emigration to Abyssinia; according to a report from Umm Salama in Aḥmad, Jaʿfar ibn Abī Ṭālib recited its opening before the Negus.",
      "مكية مبكرة قبل الهجرة إلى الحبشة، وفي حديث أم سلمة عند أحمد أن جعفر بن أبي طالب قرأ صدرها على النجاشي."
    ),
    connects: t(
      "Nach den wundersamen Geschichten in al-Kahf folgen wundersame Geburten: Yaḥyā und ʿĪsā. Sie endet damit, dass der Qurʾān leicht gemacht wurde, Ṭā Hā beginnt damit, dass er nicht zur Mühsal herabgesandt wurde.",
      "After the wondrous stories of al-Kahf come wondrous births: Yaḥyā and ʿĪsā. It ends noting that the Qurʾān was made easy, and Ṭā Hā opens saying it was not sent down to cause hardship.",
      "بعد عجائب الكهف جاءت عجائب الولادة: يحيى وعيسى، وختمت بتيسير القرآن فافتتحت طه بأنه لم ينزل للمشقة."
    ),
    lessons: ll(
      ["Ein leises, demütiges Bittgebet wird erhört, wie bei Zakarīyā.", "Gott schützt die Reinen in schwerer Lage, wie Maryam.", "Ibrāhīm spricht zu seinem Vater mit Liebe und Respekt.", "Wer das Gebet vernachlässigt und den Begierden folgt, verliert."],
      ["A quiet, humble prayer is answered, as with Zakariyyā.", "God protects the pure in hard situations, like Maryam.", "Ibrāhīm speaks to his father with love and respect.", "Whoever neglects prayer and follows desires loses."],
      ["الدعاء الخفي المتضرع مستجاب كما مع زكريا.", "الله يحفظ الطاهرين في الشدائد كمريم.", "خاطب إبراهيم أباه برفق وأدب.", "تضييع الصلاة واتباع الشهوات خسران."]
    ),
    questions: ll(
      ["Worum bitten Sie Gott leise, obwohl es unmöglich scheint?", "Wie sprechen Sie mit Angehörigen, die anders glauben als Sie?"],
      ["What do you quietly ask God for, even though it seems impossible?", "How do you speak with relatives who believe differently from you?"],
      ["ماذا تسأل الله في السر وإن بدا مستحيلًا؟", "كيف تخاطب أقاربك المخالفين لك في الاعتقاد؟"]
    ),
    sections: [
      sec(1, 15, "Zakarīyā und die Geburt Yaḥyās", "Zakariyyā and the birth of Yaḥyā", "زكريا وولادة يحيى"),
      sec(16, 40, "Maryam und die Geburt ʿĪsās", "Maryam and the birth of ʿĪsā", "مريم وولادة عيسى"),
      sec(41, 50, "Ibrāhīm und sein Vater", "Ibrāhīm and his father", "إبراهيم وأبوه"),
      sec(51, 65, "Mūsā, Ismāʿīl, Idrīs und die Nachfolger", "Mūsā, Ismāʿīl, Idrīs and those who came after", "موسى وإسماعيل وإدريس والخلف"),
      sec(66, 98, "Auferstehung und Widerlegung der Behauptung eines Kindes", "Resurrection and refutation of the claim of a child", "البعث وإبطال دعوى الولد"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 20,
    theme: t(
      "Die Offenbarung ist Erleichterung und Erinnerung, keine Last; Gott begleitet seine Gesandten mit Fürsorge.",
      "Revelation is ease and reminder, not a burden; God accompanies his messengers with care.",
      "الوحي تذكرة ورحمة لا مشقة، والله يرعى رسله بعنايته."
    ),
    context: t(
      "Mekkanisch, aus der frühen mekkanischen Zeit; Ibn Masʿūd zählt sie zu den frühesten Suren (al-Buḫārī).",
      "Meccan, from the early Meccan period; Ibn Masʿūd counts it among the earliest surahs (al-Bukhārī).",
      "مكية مبكرة، وعدها ابن مسعود من العتاق الأول (البخاري)."
    ),
    connects: t(
      "Maryam endet mit dem leicht gemachten Qurʾān, Ṭā Hā beginnt mit seinem Zweck. Sie endet mit der Aufforderung zu warten, al-Anbiyāʾ beginnt mit der nahen Abrechnung.",
      "Maryam ends with the Qurʾān made easy, Ṭā Hā opens with its purpose. It ends with the call to wait, and al-Anbiyāʾ opens with the nearness of the reckoning.",
      "ختمت مريم بتيسير القرآن وبدأت طه بغايته، وختمت بالأمر بالانتظار فافتتحت الأنبياء باقتراب الحساب."
    ),
    lessons: ll(
      ["Gott bereitet seine Diener von Kindheit an auf ihren Auftrag vor.", "Auch zum Tyrannen spricht man zuerst mit sanftem Wort.", "Echter Glaube kann einen Menschen in einem Augenblick verwandeln, wie die Zauberer.", "Wer sich von der Erinnerung abwendet, lebt in Enge."],
      ["God prepares his servants for their mission from childhood.", "Even to a tyrant one first speaks gently.", "True faith can transform a person in a moment, like the magicians.", "Whoever turns away from the reminder lives in narrowness."],
      ["يصنع الله عباده لرسالتهم منذ الصغر.", "حتى الطاغية يبدأ معه بالكلام الرفيق.", "الإيمان الصادق يغير الإنسان في لحظة كالسحرة.", "الإعراض عن الذكر ضيق في العيش."]
    ),
    questions: ll(
      ["Wo hat Gott Sie auf etwas vorbereitet, ohne dass Sie es damals bemerkten?", "Wie sprechen Sie mit jemandem, der Ihnen Unrecht tut?"],
      ["Where has God prepared you for something without you noticing at the time?", "How do you speak with someone who wrongs you?"],
      ["أين هيأك الله لأمر دون أن تشعر حينها؟", "كيف تخاطب من يظلمك؟"]
    ),
    sections: [
      sec(1, 8, "Der Zweck der Offenbarung", "The purpose of revelation", "غاية التنزيل"),
      sec(9, 48, "Mūsās Berufung und seine Kindheit", "Mūsā's calling and his childhood", "نداء موسى وطفولته"),
      sec(49, 76, "Mūsā vor Pharao und die Zauberer", "Mūsā before Pharaoh and the magicians", "موسى أمام فرعون والسحرة"),
      sec(77, 98, "Der Auszug und das Kalb", "The exodus and the calf", "الخروج والعجل"),
      sec(99, 114, "Der Tag der Auferstehung und der Umgang mit dem Qurʾān", "The Day of Resurrection and dealing with the Qurʾān", "يوم القيامة وأدب تلقي القرآن"),
      sec(115, 135, "Adam, das Vergessen und der Auftrag zur Geduld", "Adam, forgetting and the command to patience", "آدم والنسيان والأمر بالصبر"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 21,
    theme: t(
      "Die Abrechnung ist nah; alle Propheten brachten dieselbe Botschaft der Einheit Gottes.",
      "The reckoning is near; all prophets brought the same message of God's oneness.",
      "اقتراب الحساب، ووحدة دعوة الأنبياء إلى التوحيد."
    ),
    context: t(
      "Mekkanisch; Ibn Masʿūd zählt sie zu den frühesten Suren (al-Buḫārī).",
      "Meccan; Ibn Masʿūd counts it among the earliest surahs (al-Bukhārī).",
      "مكية، وعدها ابن مسعود من العتاق الأول (البخاري)."
    ),
    connects: t(
      "Ṭā Hā endet mit dem Warten, al-Anbiyāʾ beginnt mit der nahen Abrechnung. Sie endet mit dem Gericht, und al-Ḥaǧǧ beginnt mit dem Beben der Stunde.",
      "Ṭā Hā ends with waiting, al-Anbiyāʾ opens with the near reckoning. It ends with judgment, and al-Ḥajj opens with the quake of the Hour.",
      "ختمت طه بالانتظار وبدأت الأنبياء باقتراب الحساب، وختمت بالحكم فافتتحت الحج بزلزلة الساعة."
    ),
    lessons: ll(
      ["Die Schöpfung ist kein Spiel, sie hat einen Zweck.", "Die Propheten eilten zum Guten und riefen Gott in Hoffnung und Furcht an.", "Die Sendung Muhammads ﷺ ist Barmherzigkeit für die ganze Schöpfung."],
      ["Creation is not play; it has a purpose.", "The prophets hastened to good and called on God in hope and fear.", "The mission of Muhammad ﷺ is mercy for all creation."],
      ["الخلق ليس عبثًا بل له غاية.", "كان الأنبياء سباقين إلى الطاعة، يدعون الله راجين خائفين.", "بعثة محمد ﷺ رحمة شاملة للخلق."]
    ),
    questions: ll(
      ["Was in Ihrem Leben lenkt Sie von der nahenden Abrechnung ab?", "Welcher Prophet aus den Versen 48–91 spricht Sie in Ihrer jetzigen Lage am meisten an?"],
      ["What in your life distracts you from the approaching reckoning?", "Which prophet in verses 48–91 speaks to your present situation most?"],
      ["ما الذي يلهيك عن الحساب القريب؟", "أي نبي في الآيات 48–91 أقرب إلى حالك اليوم؟"]
    ),
    sections: [
      sec(1, 15, "Die nahe Abrechnung und die achtlosen Herzen", "The near reckoning and heedless hearts", "اقتراب الحساب وغفلة القلوب"),
      sec(16, 47, "Schöpfung mit Zweck und Beweise der Einheit", "Creation with purpose and proofs of oneness", "الخلق بالحق وأدلة التوحيد"),
      sec(48, 91, "Die Reihe der Propheten von Mūsā bis ʿĪsā", "The line of prophets from Mūsā to ʿĪsā", "موكب الأنبياء من موسى إلى عيسى"),
      sec(92, 112, "Eine Gemeinschaft, das Ende und die Barmherzigkeit", "One community, the end and mercy", "الأمة الواحدة والنهاية والرحمة"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 22,
    theme: t(
      "Gottesfurcht angesichts der Stunde und die Riten der Pilgerfahrt als Zeichen des Einheitsglaubens.",
      "God-consciousness in view of the Hour, and the rites of pilgrimage as signs of pure monotheism.",
      "التقوى أمام هول الساعة، وشعائر الحج علامة على التوحيد."
    ),
    context: t(
      "Stark umstritten: Manche halten sie für mekkanisch, andere für medinensisch, viele für gemischt; Ibn ʿĀšūr sieht Teile aus beiden Zeiten.",
      "Strongly disputed: some consider it Meccan, others Medinan, many mixed; Ibn ʿĀshūr sees parts from both periods.",
      "مختلف فيها كثيرًا: قيل مكية وقيل مدنية وقيل مختلطة، ورأى ابن عاشور فيها ما نزل في العهدين."
    ),
    asbab: t(
      "Zu Vers 19 berichtet al-Buḫārī von Abū Ḏarr, dass er über die Zweikämpfer am Tag von Badr herabkam.",
      "For verse 19, al-Bukhārī reports from Abū Dharr that it came down about the duellists on the day of Badr.",
      "في الآية 19 روى البخاري عن أبي ذر أنها نزلت في المتبارزين يوم بدر."
    ),
    connects: t(
      "Al-Anbiyāʾ endet mit dem Gericht, al-Ḥaǧǧ beginnt mit dem Beben der Stunde. Sie endet mit dem Aufruf zu Verbeugung, Niederwerfung und gutem Tun, damit man Erfolg hat, und al-Muʾminūn beginnt mit dem Erfolg der Gläubigen.",
      "Al-Anbiyāʾ ends with judgment, al-Ḥajj opens with the quake of the Hour. It ends with the call to bow, prostrate and do good so as to succeed, and al-Muʾminūn opens with the success of the believers.",
      "ختمت الأنبياء بالحكم وبدأت الحج بزلزلة الساعة، وختمت بالأمر بالركوع والسجود وفعل الخير رجاء الفلاح فافتتحت المؤمنون بفلاح المؤمنين."
    ),
    lessons: ll(
      ["Die Riten zu ehren ist ein Zeichen eines gottesfürchtigen Herzens.", "Beim Opfer zählt vor Gott die Aufrichtigkeit, nicht Fleisch und Blut.", "Die Erlaubnis zur Verteidigung schützt alle Gotteshäuser.", "Wer Gott nur am Rand dient, schwankt bei jeder Prüfung."],
      ["Honouring the rites is a sign of a God-conscious heart.", "In sacrifice, what counts before God is sincerity, not flesh and blood.", "The permission to defend protects all houses of worship.", "Whoever worships God only on the edge wavers at every trial."],
      ["تعظيم الشعائر علامة على قلب يخاف الله.", "المقصود من الهدي إخلاص القلب لا اللحم والدم.", "الإذن بالدفاع حماية لدور العبادة كلها.", "من عبد الله على تردد اضطرب عند كل ابتلاء."]
    ),
    questions: ll(
      ["Wird Ihr Glaube schwächer, wenn es Ihnen schlecht geht?", "Welche Absicht steht hinter Ihren gottesdienstlichen Handlungen?"],
      ["Does your faith weaken when things go badly for you?", "What intention stands behind your acts of worship?"],
      ["هل يضعف إيمانك إذا أصابك ما تكره؟", "ما النية وراء عباداتك؟"]
    ),
    sections: [
      sec(1, 24, "Das Beben der Stunde, die Auferstehung und die zwei Streitparteien", "The quake of the Hour, the resurrection and the two disputing parties", "زلزلة الساعة والبعث والخصمان"),
      sec(25, 37, "Das Haus Gottes und die Riten der Pilgerfahrt", "The House of God and the rites of pilgrimage", "البيت الحرام وشعائر الحج"),
      sec(38, 48, "Erlaubnis zur Verteidigung und Lehren früherer Völker", "Permission to defend and lessons of earlier peoples", "الإذن بالقتال وعبر الأمم"),
      sec(49, 57, "Der Gesandte, die Prüfung der Herzen und das Gericht", "The Messenger, the testing of hearts and the judgment", "الرسول وابتلاء القلوب والحكم"),
      sec(58, 78, "Gottes Macht und der Ruf an die Gemeinschaft", "God's power and the call to the community", "قدرة الله ونداء الأمة"),
    ],
    src: [...BASE, "qurtubi"],
    review: DRAFT,
  },
  {
    s: 23,
    theme: t(
      "Der Erfolg der Gläubigen: ihre Eigenschaften, die Beweise für Schöpfung und Auferstehung und das Schicksal der Leugner.",
      "The success of the believers: their qualities, the proofs of creation and resurrection and the fate of the deniers.",
      "فلاح المؤمنين: صفاتهم وأدلة الخلق والبعث ومصير المكذبين."
    ),
    context: t(
      "Mekkanisch, aus der mittleren bis späten mekkanischen Zeit.",
      "Meccan, from the middle to late Meccan period.",
      "مكية من أواسط العهد المكي أو أواخره."
    ),
    connects: t(
      "Al-Ḥaǧǧ endet mit dem Ruf zum Erfolg, al-Muʾminūn beschreibt die Erfolgreichen. Die Wahrung der Keuschheit (Vers 5) wird in an-Nūr gesetzlich entfaltet.",
      "Al-Ḥajj ends with the call to success, al-Muʾminūn describes the successful. Guarding chastity (verse 5) is unfolded into law in al-Nūr.",
      "ختمت الحج بالدعوة إلى الفلاح ووصفت المؤمنون المفلحين، وحفظ العفة (الآية 5) فصّلت أحكامه النور."
    ),
    lessons: ll(
      ["Ehrfurcht im Gebet steht am Anfang der Eigenschaften der Gläubigen.", "Die Stufen der Erschaffung des Menschen weisen auf die Auferstehung.", "Gläubige tun Gutes und fürchten dennoch, ob es angenommen wird.", "Nach dem Tod gibt es keine Rückkehr, um Versäumtes nachzuholen."],
      ["Humility in prayer heads the qualities of the believers.", "The stages of human creation point to the resurrection.", "Believers do good and still fear whether it will be accepted.", "After death there is no return to make up what was missed."],
      ["الخشوع في الصلاة أول صفات المؤمنين.", "أطوار خلق الإنسان دليل على البعث.", "المؤمن يعمل الصالح ويخشى ألا يقبل.", "لا رجعة بعد الموت لتدارك ما فات."]
    ),
    questions: ll(
      ["Welche der Eigenschaften in den Versen 1–11 ist bei Ihnen am schwächsten?", "Was würden Sie tun, wenn Sie nur noch einen Tag hätten?"],
      ["Which of the qualities in verses 1–11 is weakest in you?", "What would you do if you had only one day left?"],
      ["أي الصفات في الآيات 1–11 أضعف فيك؟", "ماذا تفعل لو بقي لك يوم واحد؟"]
    ),
    sections: [
      sec(1, 11, "Die Eigenschaften der erfolgreichen Gläubigen", "The qualities of the successful believers", "صفات المؤمنين المفلحين"),
      sec(12, 22, "Erschaffung des Menschen und Gaben der Natur", "Creation of man and gifts of nature", "خلق الإنسان ونعم الكون"),
      sec(23, 50, "Nūḥ, die Gesandten, Mūsā und ʿĪsā", "Nūḥ, the messengers, Mūsā and ʿĪsā", "نوح والرسل وموسى وعيسى"),
      sec(51, 77, "Eine Gemeinschaft und die Gründe der Ablehnung", "One community and the reasons for rejection", "الأمة الواحدة وأسباب الإعراض"),
      sec(78, 98, "Beweise der Einheit und Zuflucht bei Gott", "Proofs of oneness and seeking refuge in God", "أدلة التوحيد والاستعاذة"),
      sec(99, 118, "Tod, Auferstehung und das Gericht", "Death, resurrection and judgment", "الموت والبعث والحساب"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 24,
    theme: t(
      "Schutz von Ehre und Familie durch Regeln, Anstand und das Licht Gottes in Herz und Gesellschaft.",
      "Protecting honour and family through rules, decency and the light of God in heart and society.",
      "صيانة العرض والأسرة بالأحكام والآداب ونور الله في القلب والمجتمع."
    ),
    context: t(
      "Medinensisch, nach dem Feldzug gegen die Banū l-Muṣṭaliq (5 oder 6 n. H.) und der Verleumdung ʿĀʾišas.",
      "Medinan, after the expedition against Banū al-Muṣṭaliq (5 or 6 AH) and the slander against ʿĀʾisha.",
      "مدنية نزلت بعد غزوة بني المصطلق سنة خمس أو ست وحادثة الإفك."
    ),
    asbab: t(
      "Die Verse 11–26 kamen wegen der Verleumdung ʿĀʾišas herab (ihr eigener Bericht bei al-Buḫārī und Muslim); die Verse zum gegenseitigen Schwur betreffen Hilāl ibn Umayya (al-Buḫārī).",
      "Verses 11–26 came down because of the slander against ʿĀʾisha (her own report in al-Bukhārī and Muslim); the verses on mutual oaths concern Hilāl ibn Umayya (al-Bukhārī).",
      "نزلت الآيات 11–26 في حادثة الإفك (حديث عائشة في البخاري ومسلم)، وآيات اللعان في هلال بن أمية (البخاري)."
    ),
    connects: t(
      "Sie entfaltet die Keuschheit aus al-Muʾminūn. Sie endet mit Gottes Herrschaft über alles, und al-Furqān beginnt mit der Erhabenheit dessen, dem die Herrschaft gehört.",
      "It unfolds the chastity mentioned in al-Muʾminūn. It ends with God's dominion over all things, and al-Furqān opens with the exaltedness of the One to whom dominion belongs.",
      "فصّلت ما أجمل في المؤمنون من حفظ العفة، وختمت بملك الله فافتتحت الفرقان بتعظيم مالك الملك."
    ),
    lessons: ll(
      ["Gerüchte ohne Beweis weiterzugeben ist schwer, auch wenn es leicht erscheint.", "Gute Gedanken übereinander sind die erste Pflicht der Gläubigen.", "Den Blick senken und um Erlaubnis bitten schützt Herz und Haus.", "Vergeben, wie man selbst Vergebung von Gott erhofft."],
      ["Passing on rumours without proof is grave, even if it seems light.", "Thinking well of one another is the first duty of believers.", "Lowering the gaze and asking permission protect heart and home.", "Forgive as you hope God will forgive you."],
      ["نقل الشائعات بلا بينة عظيم وإن بدا هينًا.", "حسن الظن أول واجبات المؤمنين.", "غض البصر والاستئذان حماية للقلب والبيت.", "العفو عن الناس رجاء عفو الله."]
    ),
    questions: ll(
      ["Prüfen Sie Nachrichten, bevor Sie sie weitergeben?", "Wem verweigern Sie Vergebung, obwohl Sie selbst auf Gottes Vergebung hoffen?"],
      ["Do you check news before passing it on?", "To whom do you refuse forgiveness, though you yourself hope for God's forgiveness?"],
      ["هل تتثبت من الأخبار قبل نشرها؟", "من تمنع عنه العفو وأنت ترجو عفو الله؟"]
    ),
    sections: [
      sec(1, 10, "Unzucht, falsche Beschuldigung und gegenseitiger Schwur", "Fornication, false accusation and mutual oaths", "الزنا والقذف واللعان"),
      sec(11, 26, "Die Verleumdung und ihre Lehren", "The slander and its lessons", "الإفك ودروسه"),
      sec(27, 34, "Hausbesuche, Blick und Ehe", "Visiting homes, the gaze and marriage", "الاستئذان وغض البصر والنكاح"),
      sec(35, 46, "Das Gleichnis vom Licht und die Zeichen", "The parable of light and the signs", "مثل النور والآيات"),
      sec(47, 57, "Gehorsam und die Verheißung der Festigung", "Obedience and the promise of establishment", "الطاعة ووعد الاستخلاف"),
      sec(58, 64, "Anstand im Haus und gegenüber dem Gesandten ﷺ", "Decency at home and towards the Messenger ﷺ", "آداب البيت ومع الرسول ﷺ"),
    ],
    src: [...BASE, "qurtubi", "wahidi"],
    review: DRAFT,
  },
  {
    s: 25,
    theme: t(
      "Der Qurʾān als Unterscheidung zwischen Wahrheit und Falschheit; die Diener des Barmherzigen als lebendiges Vorbild.",
      "The Qurʾān as the criterion between truth and falsehood; the servants of the Most Merciful as a living example.",
      "القرآن فرقان بين الحق والباطل، وعباد الرحمن نموذج حي."
    ),
    context: t(
      "Mekkanisch, aus der mittleren mekkanischen Zeit; manche nehmen die Verse 68–70 als medinensisch aus.",
      "Meccan, from the middle Meccan period; some except verses 68–70 as Medinan.",
      "مكية من أواسط العهد المكي، واستثنى بعضهم الآيات 68–70."
    ),
    connects: t(
      "An-Nūr endet mit Gottes Herrschaft, al-Furqān beginnt mit ihr. Sie endet mit der Leugnung der Gegner, und aš-Šuʿarāʾ tröstet den Propheten ﷺ mit den Geschichten früherer Gesandter.",
      "Al-Nūr ends with God's dominion, al-Furqān opens with it. It ends with the denial of the opponents, and al-Shuʿarāʾ consoles the Prophet ﷺ with the stories of earlier messengers.",
      "ختمت النور بالملك وافتتحت به الفرقان، وختمت بتكذيب المعرضين فجاءت الشعراء تسلية بقصص الرسل."
    ),
    lessons: ll(
      ["Einwände gegen den Gesandten wiederholen sich in jeder Zeit.", "Wer der eigenen Neigung folgt, macht sie zu seinem Gott.", "Die Diener des Barmherzigen verbinden Demut, Nachtgebet und Mäßigung.", "Aufrichtige Reue kann eine belastete Vergangenheit in Gutes verwandeln."],
      ["Objections to the Messenger repeat themselves in every age.", "Whoever follows their own whims makes them their god.", "The servants of the Most Merciful combine humility, night prayer and moderation.", "Sincere repentance can turn a burdened past into good."],
      ["الاعتراضات على الرسول تتكرر في كل زمان.", "من اتبع هواه جعله معبودًا.", "عباد الرحمن جمعوا التواضع وقيام الليل والاعتدال.", "التوبة الصادقة تحول ماضي الذنوب إلى رصيد من الخير."]
    ),
    questions: ll(
      ["Welche Eigenschaft der Diener des Barmherzigen (Verse 63–77) möchten Sie diese Woche üben?", "Wo folgen Sie eher Ihrer Neigung als der Wahrheit?"],
      ["Which quality of the servants of the Most Merciful (verses 63–77) would you like to practise this week?", "Where do you follow your inclination rather than the truth?"],
      ["أي صفة من صفات عباد الرحمن (63–77) تريد أن تتمرن عليها هذا الأسبوع؟", "أين تتبع هواك بدل الحق؟"]
    ),
    sections: [
      sec(1, 20, "Die Erhabenheit des Offenbarers und die Einwände der Leugner", "The exaltedness of the Revealer and the objections of the deniers", "تعظيم المنزل واعتراضات المكذبين"),
      sec(21, 34, "Der Tag der Reue", "The Day of regret", "يوم الحسرة"),
      sec(35, 44, "Frühere Völker und die eigene Neigung als Götze", "Earlier peoples and one's own whim as an idol", "الأمم السابقة واتخاذ الهوى معبودًا"),
      sec(45, 62, "Zeichen: Schatten, Wind, Wasser und Gestirne", "Signs: shade, wind, water and stars", "آيات الظل والرياح والماء والنجوم"),
      sec(63, 77, "Die Diener des Barmherzigen", "The servants of the Most Merciful", "عباد الرحمن"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 26,
    theme: t(
      "Trost für den Propheten ﷺ: Alle Gesandten wurden abgelehnt, doch Gott ist der Mächtige und der Barmherzige.",
      "Consolation for the Prophet ﷺ: all messengers were rejected, yet God is the Almighty and the Most Merciful.",
      "تسلية النبي ﷺ: كل الرسل كُذّبوا، والله هو العزيز الرحيم."
    ),
    context: t(
      "Mekkanisch, aus der mittleren mekkanischen Zeit; viele nehmen die letzten Verse über die Dichter (224–227) als medinensisch aus.",
      "Meccan, from the middle Meccan period; many except the last verses on the poets (224–227) as Medinan.",
      "مكية من أواسط العهد المكي، واستثنى كثيرون آيات الشعراء الأخيرة (224–227)."
    ),
    asbab: t(
      "Zu Vers 214 berichten al-Buḫārī und Muslim von Ibn ʿAbbās, dass der Prophet ﷺ daraufhin seine nächsten Verwandten öffentlich warnte.",
      "For verse 214, al-Bukhārī and Muslim report from Ibn ʿAbbās that the Prophet ﷺ then publicly warned his closest relatives.",
      "في الآية 214 روى البخاري ومسلم عن ابن عباس أن النبي ﷺ قام فأنذر أقرب أهله علانية."
    ),
    connects: t(
      "Al-Furqān endet mit der Leugnung, aš-Šuʿarāʾ antwortet mit sieben Prophetengeschichten. An-Naml setzt die Reihe fort und beginnt wie sie mit Ṭā Sīn.",
      "Al-Furqān ends with denial, al-Shuʿarāʾ answers with seven prophet stories. Al-Naml continues the series and, like it, opens with Ṭā Sīn.",
      "ختمت الفرقان بالتكذيب فأجابت الشعراء بسبع قصص، وتابعتها النمل مفتتحة مثلها بطس."
    ),
    lessons: ll(
      ["Kummer über die Ablehnung anderer darf einen nicht zerstören.", "Jeder Gesandte bat nicht um Lohn von den Menschen.", "Am Tag der Auferstehung zählt ein von Krankheiten freies Herz.", "Die Einladung beginnt bei den eigenen Angehörigen."],
      ["Grief over others' rejection must not destroy you.", "Every messenger asked no reward from people.", "On the Day of Resurrection, a heart free of spiritual illness is what counts.", "Invitation begins with one's own relatives."],
      ["لا يهلك المرء نفسه حزنًا على إعراض الناس.", "كل رسول لم يسأل الناس أجرًا.", "النجاة في الآخرة بسلامة القلب.", "الدعوة تبدأ بالأقربين."]
    ),
    questions: ll(
      ["Wie frei ist Ihr Herz von Neid, Groll und Hochmut?", "Wen in Ihrer Familie haben Sie noch nie mit Güte zum Guten eingeladen?"],
      ["How free is your heart from envy, resentment and arrogance?", "Whom in your family have you never kindly invited to good?"],
      ["ما مدى سلامة قلبك من الحسد والحقد والكبر؟", "من في أهلك لم تدعه إلى الخير برفق بعد؟"]
    ),
    sections: [
      sec(1, 9, "Einleitung: Trost für den Gesandten ﷺ", "Introduction: consolation for the Messenger ﷺ", "المقدمة: تسلية الرسول ﷺ"),
      sec(10, 68, "Mūsā und Pharao", "Mūsā and Pharaoh", "موسى وفرعون"),
      sec(69, 104, "Ibrāhīm und das reine Herz", "Ibrāhīm and the pure heart", "إبراهيم وسلامة القلب"),
      sec(105, 191, "Nūḥ, Hūd, Ṣāliḥ, Lūṭ und Šuʿaib", "Nūḥ, Hūd, Ṣāliḥ, Lūṭ and Shuʿayb", "نوح وهود وصالح ولوط وشعيب"),
      sec(192, 227, "Die Herkunft des Qurʾān und die Dichter", "The origin of the Qurʾān and the poets", "مصدر القرآن والشعراء"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 27,
    theme: t(
      "Der Qurʾān als Führung und frohe Botschaft; Gottes Gaben an die Dankbaren und seine Macht über Himmel und Erde.",
      "The Qurʾān as guidance and glad tidings; God's gifts to the grateful and his power over heaven and earth.",
      "القرآن هدى وبشرى، ونعم الله على الشاكرين وقدرته في السماوات والأرض."
    ),
    context: t(
      "Mekkanisch, aus der mittleren mekkanischen Zeit.",
      "Meccan, from the middle Meccan period.",
      "مكية من أواسط العهد المكي."
    ),
    connects: t(
      "Sie folgt aš-Šuʿarāʾ mit weiteren Geschichten und dem Schwerpunkt auf Wissen und Dankbarkeit. Al-Qaṣaṣ erzählt danach die Geschichte Mūsās ausführlich.",
      "It follows al-Shuʿarāʾ with further stories, emphasising knowledge and gratitude. Al-Qaṣaṣ then tells Mūsā's story in detail.",
      "تلت الشعراء بقصص أخرى مع التركيز على العلم والشكر، ثم فصّلت القصص قصة موسى."
    ),
    lessons: ll(
      ["Macht und Wissen sind Gaben, für die Sulaimān dankte.", "Eine kleine Ameise und ein Wiedehopf tragen Verantwortung und Wissen.", "Eine weise Herrscherin prüft, bevor sie entscheidet.", "Nur Gott ist die Zuflucht des Bedrängten, der sich an ihn wendet."],
      ["Power and knowledge are gifts for which Sulaymān gave thanks.", "A small ant and a hoopoe carry responsibility and knowledge.", "A wise queen examines before she decides.", "Only God is the refuge of the distressed who turn to him."],
      ["الملك والعلم نعمتان شكرهما سليمان.", "النملة والهدهد يحملان مسؤولية وعلمًا.", "الملكة الحكيمة تتثبت قبل أن تقرر.", "الله وحده ملجأ المكروب حين يلجأ إليه."]
    ),
    questions: ll(
      ["Wie danken Sie für Ihre Fähigkeiten im täglichen Handeln?", "Wann haben Sie Gott in großer Not gerufen, und wie haben Sie die Antwort erlebt?"],
      ["How do you give thanks for your abilities in daily action?", "When did you call on God in great need, and how did you experience the answer?"],
      ["كيف تشكر الله على قدراتك في عملك اليومي؟", "متى دعوت الله في ضيق شديد وكيف رأيت الإجابة؟"]
    ),
    sections: [
      sec(1, 6, "Der Qurʾān als Führung für die Gläubigen", "The Qurʾān as guidance for the believers", "القرآن هدى للمؤمنين"),
      sec(7, 14, "Mūsā und das Feuer", "Mūsā and the fire", "موسى والنار"),
      sec(15, 44, "Dāwūd, Sulaimān, die Ameise, der Wiedehopf und Sabaʾ", "Dāwūd, Sulaymān, the ant, the hoopoe and Sabaʾ", "داود وسليمان والنملة والهدهد وسبأ"),
      sec(45, 58, "Ṣāliḥ und Lūṭ", "Ṣāliḥ and Lūṭ", "صالح ولوط"),
      sec(59, 93, "Beweise der Einheit, die Stunde und der Auftrag", "Proofs of oneness, the Hour and the mission", "أدلة التوحيد والساعة والمهمة"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 28,
    theme: t(
      "Gott richtet die Schwachen auf und stürzt die Tyrannen; Macht und Reichtum ohne Gottesfurcht vergehen.",
      "God raises the weak and brings down the tyrants; power and wealth without God-consciousness perish.",
      "الله ينصر المستضعفين ويهلك الطغاة، والسلطة والثروة بلا تقوى إلى زوال."
    ),
    context: t(
      "Mekkanisch, aus der späten mekkanischen Zeit. Nach manchen Berichten kam Vers 85 während der Auswanderung herab; einige halten die Verse 52–55 für medinensisch.",
      "Meccan, from the late Meccan period. According to some reports verse 85 came down during the emigration; some consider verses 52–55 Medinan.",
      "مكية من أواخر العهد المكي، وفي بعض الروايات أن الآية 85 نزلت في طريق الهجرة، وعدّ بعضهم الآيات 52–55 مدنية."
    ),
    asbab: t(
      "Zu Vers 56 berichten al-Buḫārī und Muslim, dass er im Zusammenhang mit dem Tod Abū Ṭālibs herabkam.",
      "For verse 56, al-Bukhārī and Muslim report that it came down in connection with the death of Abū Ṭālib.",
      "في الآية 56 روى البخاري ومسلم أنها نزلت عند وفاة أبي طالب."
    ),
    connects: t(
      "An-Naml nennt Mūsā kurz, al-Qaṣaṣ erzählt seine Geschichte von der Geburt an. Sie endet mit dem Versprechen der Rückkehr, al-ʿAnkabūt beginnt mit der Prüfung der Gläubigen auf dem Weg dorthin.",
      "Al-Naml mentions Mūsā briefly, al-Qaṣaṣ tells his story from birth. It ends with the promise of return, and al-ʿAnkabūt opens with the testing of believers on the way there.",
      "ذكرت النمل موسى مجملًا وفصّلت القصص قصته من مولده، وختمت بوعد العودة فافتتحت العنكبوت بابتلاء المؤمنين في الطريق."
    ),
    lessons: ll(
      ["Gottes Plan wirkt gerade dort, wo die Lage am hoffnungslosesten scheint.", "Ein Fehler wird durch Reue und Bitte um Vergebung überwunden, wie bei Mūsā.", "Rechtleitung schenkt allein Gott, auch dem Propheten ﷺ ist sie nicht in die Hand gegeben.", "Reichtum, den man sich selbst zuschreibt, wird zur Falle, wie bei Qārūn."],
      ["God's plan works precisely where the situation seems most hopeless.", "A mistake is overcome through regret and seeking forgiveness, as with Mūsā.", "Guidance is God's gift alone; even the Prophet ﷺ could not grant it.", "Wealth one attributes to oneself becomes a trap, as with Qārūn."],
      ["تدبير الله يعمل حيث يبدو الأمر أشد يأسًا.", "الخطأ يتدارك بالندم والاستغفار كما فعل موسى.", "الهداية بيد الله وحده، ولم تكن حتى بيد النبي ﷺ.", "المال المنسوب إلى النفس فتنة كما مع قارون."]
    ),
    questions: ll(
      ["Wo schreiben Sie Ihren Besitz oder Erfolg allein Ihrem eigenen Können zu?", "Für wen beten Sie um Rechtleitung, weil Sie selbst sie nicht schenken können?"],
      ["Where do you attribute your possessions or success solely to your own ability?", "For whom do you pray for guidance, because you cannot give it yourself?"],
      ["أين تنسب مالك أو نجاحك إلى قدرتك وحدها؟", "لمن تدعو بالهداية لأنك لا تملكها له؟"]
    ),
    sections: [
      sec(1, 13, "Pharaos Tyrannei und die Geburt Mūsās", "Pharaoh's tyranny and the birth of Mūsā", "طغيان فرعون ومولد موسى"),
      sec(14, 28, "Mūsās Jugend, Flucht und Madyan", "Mūsā's youth, flight and Madyan", "شباب موسى وخروجه ومدين"),
      sec(29, 42, "Die Berufung und das Ende Pharaos", "The calling and the end of Pharaoh", "التكليم ونهاية فرعون"),
      sec(43, 75, "Der Qurʾān und die Einwände der Quraiš", "The Qurʾān and the objections of Quraysh", "القرآن واعتراضات قريش"),
      sec(76, 82, "Qārūn und sein Reichtum", "Qārūn and his wealth", "قارون وكنوزه"),
      sec(83, 88, "Das Jenseits für die Demütigen und die Verheißung der Rückkehr", "The Hereafter for the humble and the promise of return", "الآخرة للمتواضعين ووعد العودة"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 29,
    theme: t(
      "Glaube wird geprüft; wer in der Prüfung standhaft bleibt und sich anstrengt, den führt Gott auf seine Wege.",
      "Faith is tested; whoever stays firm in the trial and strives, God guides on his paths.",
      "الإيمان يمتحن، ومن ثبت وجاهد هداه الله سبله."
    ),
    context: t(
      "Überwiegend mekkanisch, aus der späten Zeit der Verfolgung; manche halten die ersten elf Verse wegen der Erwähnung der Heuchler für medinensisch.",
      "Mostly Meccan, from the late period of persecution; some consider the first eleven verses Medinan because they mention hypocrites.",
      "مكية في أكثر الأقوال من فترة الاضطهاد، وعدّ بعضهم الآيات الإحدى عشرة الأولى مدنية لذكر النفاق فيها."
    ),
    asbab: t(
      "Zu Vers 8 berichtet Muslim von Saʿd ibn Abī Waqqāṣ und seiner Mutter, die ihn vom Islam abbringen wollte.",
      "For verse 8, Muslim reports about Saʿd ibn Abī Waqqāṣ and his mother, who wanted to turn him away from Islam.",
      "في الآية 8 روى مسلم قصة سعد بن أبي وقاص مع أمه حين أرادت رده عن الإسلام."
    ),
    connects: t(
      "Al-Qaṣaṣ zeigt die Prüfung Mūsās und den Sieg der Geduldigen; al-ʿAnkabūt macht Prüfung zur allgemeinen Regel. Sie endet mit denen, die sich anstrengen, und ar-Rūm beginnt mit einer Verheißung des Sieges.",
      "Al-Qaṣaṣ shows Mūsā's trial and the victory of the patient; al-ʿAnkabūt makes trial a general rule. It ends with those who strive, and al-Rūm opens with a promise of victory.",
      "أرت القصص ابتلاء موسى ونصر الصابرين، وجعلت العنكبوت الابتلاء سنة عامة، وختمت بالمجاهدين فافتتحت الروم بوعد النصر."
    ),
    lessons: ll(
      ["Prüfungen zeigen, wer aufrichtig glaubt.", "Güte gegenüber den Eltern bleibt, auch wenn man ihnen im Unglauben nicht gehorcht.", "Was man neben Gott sucht, ist so schwach wie ein Spinnennetz.", "Das Gebet hält von Schändlichem und Unrecht ab."],
      ["Trials show who believes sincerely.", "Kindness to parents remains, even when one does not obey them in disbelief.", "What one seeks besides God is as weak as a spider's web.", "Prayer keeps one away from indecency and wrong."],
      ["الابتلاء يكشف الصادق في إيمانه.", "البر بالوالدين باق وإن لم يطاعا في الكفر.", "كل ما يتخذ من دون الله واه كبيت العنكبوت.", "الصلاة تحجز صاحبها عن القبيح والظلم."]
    ),
    questions: ll(
      ["Auf welches Spinnennetz verlassen Sie sich, statt auf Gott?", "Wie hält Ihr Gebet Sie im Alltag von Unrecht ab?"],
      ["Which spider's web do you rely on instead of God?", "How does your prayer keep you from wrong in daily life?"],
      ["على أي بيت عنكبوت تعتمد بدل الله؟", "كيف تحجزك صلاتك عن الظلم في يومك؟"]
    ),
    sections: [
      sec(1, 13, "Die Prüfung der Gläubigen", "The testing of the believers", "فتنة المؤمنين"),
      sec(14, 40, "Nūḥ, Ibrāhīm, Lūṭ, Šuʿaib und andere Völker", "Nūḥ, Ibrāhīm, Lūṭ, Shuʿayb and other peoples", "نوح وإبراهيم ولوط وشعيب والأمم"),
      sec(41, 44, "Das Gleichnis vom Spinnennetz", "The parable of the spider's web", "مثل العنكبوت"),
      sec(45, 55, "Rezitation, Gebet und das Gespräch mit den Schriftbesitzern", "Recitation, prayer and dialogue with the People of the Book", "التلاوة والصلاة ومجادلة أهل الكتاب"),
      sec(56, 69, "Auswanderung, Versorgung und Anstrengung", "Emigration, provision and striving", "الهجرة والرزق والمجاهدة"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 30,
    theme: t(
      "Gottes Verheißung trifft ein: Die Zeichen in Schöpfung und Geschichte führen zur angeborenen Natur des Menschen zurück.",
      "God's promise comes true: the signs in creation and history lead back to the innate nature of the human being.",
      "وعد الله لا يتخلف، وآياته في الخلق والتاريخ ترد الإنسان إلى فطرته."
    ),
    context: t(
      "Mekkanisch, aus der Zeit, als die Byzantiner von den Persern besiegt worden waren; die Sure kündigte ihren späteren Sieg an.",
      "Meccan, from the time when the Byzantines had been defeated by the Persians; the surah foretold their later victory.",
      "مكية نزلت حين هزم الفرس الروم، وأخبرت بانتصارهم بعد ذلك."
    ),
    asbab: t(
      "Al-Tirmiḏī überliefert von Ibn ʿAbbās, wie die Muslime auf den Sieg der Byzantiner hofften und Abū Bakr den Mekkanern diese Ankündigung entgegenhielt.",
      "Al-Tirmidhī transmits from Ibn ʿAbbās how the Muslims hoped for the Byzantine victory and Abū Bakr held this announcement up to the Meccans.",
      "روى الترمذي عن ابن عباس رجاء المسلمين غلبة الروم ومراهنة أبي بكر للمشركين على ذلك."
    ),
    connects: t(
      "Al-ʿAnkabūt endet mit den Strebenden, ar-Rūm beginnt mit dem verheißenen Sieg. Sie endet mit dem Hinweis auf die Gleichnisse des Qurʾān, und Luqmān beginnt mit dem weisen Buch.",
      "Al-ʿAnkabūt ends with those who strive, al-Rūm opens with the promised victory. It ends pointing to the parables of the Qurʾān, and Luqmān opens with the wise Book.",
      "ختمت العنكبوت بالمجاهدين وبدأت الروم بالنصر الموعود، وختمت بضرب الأمثال في القرآن فافتتحت لقمان بالكتاب الحكيم."
    ),
    lessons: ll(
      ["Der Lauf aller Dinge liegt in jeder Lage in Gottes Hand.", "Ehe, Sprachen und Farben gehören zu Gottes Zeichen.", "Der Mensch ist mit einer Natur geschaffen, die zu Gott hinneigt.", "Verderbnis auf Erden folgt aus dem Handeln der Menschen."],
      ["The course of all affairs is in God's hand at every stage.", "Marriage, languages and colours are among God's signs.", "Humans are created with a nature inclined towards God.", "Corruption on earth follows from what people do."],
      ["مقاليد الأمور بيد الله في كل حال.", "الزواج واختلاف الألسنة والألوان من آيات الله.", "خلق الإنسان على فطرة تميل إلى الله.", "الفساد في الأرض أثر لأعمال الناس."]
    ),
    questions: ll(
      ["Welches Zeichen aus den Versen 20–27 sehen Sie heute in Ihrem eigenen Leben?", "Wo trägt Ihr Handeln zu Schaden in Ihrer Umwelt bei?"],
      ["Which sign from verses 20–27 do you see in your own life today?", "Where does your behaviour contribute to harm in your environment?"],
      ["أي آية من الآيات 20–27 تراها في حياتك اليوم؟", "أين يسهم سلوكك في إفساد محيطك؟"]
    ),
    sections: [
      sec(1, 10, "Die Byzantiner und das Ende der Leugner", "The Byzantines and the end of the deniers", "الروم وعاقبة المكذبين"),
      sec(11, 19, "Auferstehung und Lobpreis zu allen Zeiten", "Resurrection and glorification at all times", "البعث والتسبيح في الأوقات"),
      sec(20, 27, "Die Zeichen Gottes in Schöpfung und Leben", "God's signs in creation and life", "آيات الله في الخلق والحياة"),
      sec(28, 40, "Gleichnis gegen die Beigesellung und die angeborene Natur", "Parable against association and the innate nature", "مثل في إبطال الشرك والفطرة"),
      sec(41, 53, "Verderbnis, Winde und Wiederbelebung der Erde", "Corruption, winds and revival of the earth", "الفساد والرياح وإحياء الأرض"),
      sec(54, 60, "Die Stufen des Menschen und der Ruf zur Geduld", "The stages of man and the call to patience", "أطوار الإنسان والأمر بالصبر"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 31,
    theme: t(
      "Weisheit, die zu Dankbarkeit führt: der Rat Luqmāns an seinen Sohn und die Zeichen Gottes.",
      "Wisdom that leads to gratitude: Luqmān's counsel to his son and the signs of God.",
      "الحكمة التي تثمر الشكر: وصايا لقمان لابنه وآيات الله."
    ),
    context: t(
      "Mekkanisch; manche nehmen einzelne Verse (etwa 27–29) als medinensisch aus.",
      "Meccan; some except individual verses (such as 27–29) as Medinan.",
      "مكية، واستثنى بعضهم آيات منها كالآيات 27–29."
    ),
    connects: t(
      "Ar-Rūm endet mit den Gleichnissen des Qurʾān, Luqmān beginnt mit dem weisen Buch. Sie endet mit dem, was nur Gott weiß, und as-Saǧda beginnt damit, dass das Buch vom Herrn der Welten kommt.",
      "Al-Rūm ends with the parables of the Qurʾān, Luqmān opens with the wise Book. It ends with what only God knows, and al-Sajda opens with the Book coming from the Lord of the worlds.",
      "ختمت الروم بأمثال القرآن وبدأت لقمان بالكتاب الحكيم، وختمت بمفاتح الغيب فافتتحت السجدة بأن الكتاب من رب العالمين."
    ),
    lessons: ll(
      ["Weisheit beginnt mit Dankbarkeit gegenüber Gott.", "Erziehung verbindet Glauben, Gebet, Geduld und gute Umgangsformen.", "Beigesellung ist das größte Unrecht.", "Bescheidenheit zeigt sich in Gang und Stimme."],
      ["Wisdom begins with gratitude to God.", "Upbringing joins faith, prayer, patience and good manners.", "Associating partners with God is the greatest wrong.", "Modesty shows in one's walk and voice."],
      ["الحكمة تبدأ بشكر الله.", "التربية تجمع العقيدة والصلاة والصبر وحسن الخلق.", "لا ظلم أشد من الشرك.", "التواضع يظهر في المشي والصوت."]
    ),
    questions: ll(
      ["Welchen Rat Luqmāns möchten Sie an jemanden weitergeben, der Ihnen nahesteht?", "Wie zeigt sich Bescheidenheit in Ihrem Auftreten?"],
      ["Which of Luqmān's counsels would you like to pass on to someone close to you?", "How does modesty show in the way you present yourself?"],
      ["أي وصية من وصايا لقمان تود أن تنقلها إلى من تحب؟", "كيف يظهر التواضع في هيئتك؟"]
    ),
    sections: [
      sec(1, 11, "Das weise Buch, die Rechtschaffenen und die Ablenkung", "The wise Book, the righteous and distraction", "الكتاب الحكيم والمحسنون ولهو الحديث"),
      sec(12, 19, "Der Rat Luqmāns an seinen Sohn", "Luqmān's counsel to his son", "وصايا لقمان لابنه"),
      sec(20, 34, "Gottes Gaben, seine Wahrheit und das Verborgene", "God's gifts, his truth and the unseen", "نعم الله وحقه والغيب"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 32,
    theme: t(
      "Die Gewissheit der Offenbarung, der Schöpfung und der Auferstehung, und die Haltung der Gläubigen in Niederwerfung.",
      "The certainty of revelation, creation and resurrection, and the stance of the believers in prostration.",
      "يقين الوحي والخلق والبعث، وحال المؤمنين الساجدين."
    ),
    context: t(
      "Mekkanisch. Nach al-Buḫārī und Muslim rezitierte der Prophet ﷺ sie im Morgengebet am Freitag.",
      "Meccan. According to al-Bukhārī and Muslim, the Prophet ﷺ recited it in the dawn prayer on Fridays.",
      "مكية، وكان النبي ﷺ يقرؤها في فجر الجمعة كما في البخاري ومسلم."
    ),
    connects: t(
      "Luqmān endet mit dem Verborgenen, das nur Gott kennt; as-Saǧda beginnt mit der Gewissheit des Buches. Sie endet mit der Aufforderung abzuwarten, al-Aḥzāb beginnt mit Gottesfurcht und dem Verbot, den Leugnern zu folgen.",
      "Luqmān ends with the unseen known only to God; al-Sajda opens with the certainty of the Book. It ends with the call to wait, and al-Aḥzāb opens with God-consciousness and the prohibition of following the deniers.",
      "ختمت لقمان بالغيب وبدأت السجدة بيقين الكتاب، وختمت بالأمر بالانتظار فافتتحت الأحزاب بالتقوى والنهي عن طاعة الكافرين."
    ),
    lessons: ll(
      ["Der Mensch ist aus Ton geschaffen und mit Gottes Geist beseelt.", "Die Gläubigen verlassen nachts ihr Lager, um Gott in Hoffnung und Furcht anzurufen.", "Was Gott für die Rechtschaffenen bereithält, kann sich niemand vorstellen.", "Kleine Strafen im Diesseits sollen zur Umkehr führen."],
      ["The human being is created from clay and given life by God's spirit.", "Believers leave their beds at night to call on God in hope and fear.", "No one can imagine what God has prepared for the righteous.", "Lesser hardships in this world are meant to lead to return."],
      ["خلق الإنسان من طين ونفخ فيه من روح الله.", "المؤمنون يتركون مضاجعهم ليلًا داعين ربهم رجاء وخوفًا.", "ما أعده الله للصالحين فوق التصور.", "الشدائد الصغرى في الدنيا دعوة إلى الرجوع."]
    ),
    questions: ll(
      ["Wann sind Sie zuletzt nachts für Gott aufgestanden?", "Welche Schwierigkeit könnte ein Ruf Gottes zur Umkehr an Sie sein?"],
      ["When did you last rise at night for God?", "Which difficulty might be God's call to you to return?"],
      ["متى قمت آخر مرة من الليل لله؟", "أي شدة قد تكون دعوة من الله لك إلى الرجوع؟"]
    ),
    sections: [
      sec(1, 11, "Das Buch, die Schöpfung und der Mensch", "The Book, creation and the human being", "الكتاب والخلق والإنسان"),
      sec(12, 22, "Die Reue der Leugner und die Haltung der Gläubigen", "The regret of the deniers and the stance of the believers", "ندم المجرمين وحال المؤمنين"),
      sec(23, 30, "Mūsā, Lehren der Geschichte und das Warten", "Mūsā, lessons of history and waiting", "موسى وعبر التاريخ والانتظار"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 33,
    theme: t(
      "Gehorsam gegenüber Gott und seinem Gesandten ﷺ im Bündnis, in der Familie und in der Krise; die Würde des Prophetenhauses.",
      "Obedience to God and his Messenger ﷺ in alliance, family and crisis; the dignity of the Prophet's household.",
      "طاعة الله ورسوله ﷺ في الولاء والأسرة والأزمات، ومكانة بيت النبوة."
    ),
    context: t(
      "Medinensisch, um die Grabenschlacht (5 n. H.) und den Feldzug gegen die Banū Quraiẓa.",
      "Medinan, around the Battle of the Trench (5 AH) and the campaign against Banū Qurayẓa.",
      "مدنية نزلت حول غزوة الخندق سنة خمس وغزوة بني قريظة."
    ),
    asbab: t(
      "Zu Vers 23 berichtet al-Buḫārī von Anas über seinen Onkel Anas ibn al-Naḍr; zu Vers 37 berichtet al-Buḫārī von Anas über Zayd und Zaynab.",
      "For verse 23, al-Bukhārī reports from Anas about his uncle Anas ibn al-Naḍr; for verse 37, al-Bukhārī reports from Anas about Zayd and Zaynab.",
      "في الآية 23 روى البخاري عن أنس في عمه أنس بن النضر، وفي الآية 37 روى البخاري عن أنس في زيد وزينب."
    ),
    connects: t(
      "As-Saǧda endet mit Abwarten und Abwenden, al-Aḥzāb beginnt mit Gottesfurcht und Unabhängigkeit von den Leugnern. Sie endet mit dem anvertrauten Gut und dem Lohn, Sabaʾ beginnt mit dem Lob dessen, dem Himmel und Erde gehören.",
      "Al-Sajda ends with waiting and turning away, al-Aḥzāb opens with God-consciousness and independence from the deniers. It ends with the trust and its reward, and Sabaʾ opens with praise of the One to whom heaven and earth belong.",
      "ختمت السجدة بالإعراض والانتظار وبدأت الأحزاب بالتقوى وترك طاعة الكافرين، وختمت بالأمانة والجزاء فافتتحت سبأ بحمد مالك السماوات والأرض."
    ),
    lessons: ll(
      ["Der Prophet ﷺ ist das schönste Vorbild, gerade in der Krise.", "In der Not zeigt sich, wer aufrichtig ist und wer nicht.", "Männer und Frauen werden mit gleichen Eigenschaften gelobt.", "Das anvertraute Gut der Verantwortung ist schwer, und der Mensch hat es übernommen."],
      ["The Prophet ﷺ is the finest example, especially in crisis.", "In hardship it becomes clear who is sincere and who is not.", "Men and women are praised with the same qualities.", "The trust of responsibility is heavy, and the human being took it on."],
      ["النبي ﷺ أحسن قدوة ولا سيما في الأزمات.", "الشدائد تميز الصادق من غيره.", "مدح الرجال والنساء بصفات واحدة.", "أمانة التكليف ثقيلة وقد حملها الإنسان."]
    ),
    questions: ll(
      ["Wie folgen Sie dem Vorbild des Propheten ﷺ, wenn Sie unter Druck stehen?", "Welche anvertraute Verantwortung tragen Sie gerade?"],
      ["How do you follow the example of the Prophet ﷺ when you are under pressure?", "Which entrusted responsibility are you carrying at the moment?"],
      ["كيف تقتدي بالنبي ﷺ حين تشتد عليك الضغوط؟", "ما الأمانة التي تحملها الآن؟"]
    ),
    sections: [
      sec(1, 8, "Gottesfurcht, Adoption und der Rang des Propheten ﷺ", "God-consciousness, adoption and the rank of the Prophet ﷺ", "التقوى والتبني ومكانة النبي ﷺ"),
      sec(9, 27, "Die Grabenschlacht und die Banū Quraiẓa", "The Battle of the Trench and Banū Qurayẓa", "الأحزاب وبنو قريظة"),
      sec(28, 35, "Die Frauen des Propheten ﷺ und die Eigenschaften der Gläubigen", "The wives of the Prophet ﷺ and the qualities of believers", "أزواج النبي ﷺ وصفات المؤمنين والمؤمنات"),
      sec(36, 48, "Zayd, das Siegel der Propheten und der Auftrag", "Zayd, the seal of the prophets and the mission", "زيد وخاتم النبيين والرسالة"),
      sec(49, 62, "Regeln der Ehe, Anstand im Haus des Propheten ﷺ, Bedeckung", "Rules of marriage, decorum in the Prophet's ﷺ house, covering", "أحكام النكاح وآداب بيت النبي ﷺ والحجاب"),
      sec(63, 73, "Die Stunde, rechtes Wort und das anvertraute Gut", "The Hour, upright speech and the trust", "الساعة والقول السديد والأمانة"),
    ],
    src: [...BASE, "qurtubi", "wahidi"],
    review: DRAFT,
  },
  {
    s: 34,
    theme: t(
      "Dank oder Undank für Gottes Gaben: Dāwūd und Sulaimān als Dankbare, Sabaʾ als Volk, das die Gabe verlor.",
      "Gratitude or ingratitude for God's gifts: Dāwūd and Sulaymān as the grateful, Sabaʾ as a people who lost the gift.",
      "الشكر والكفران: داود وسليمان شاكرين، وسبأ قوم زالت عنهم النعمة."
    ),
    context: t(
      "Mekkanisch; manche nehmen Vers 6 als medinensisch aus.",
      "Meccan; some except verse 6 as Medinan.",
      "مكية، واستثنى بعضهم الآية 6."
    ),
    connects: t(
      "Al-Aḥzāb endet mit Lohn und Strafe, Sabaʾ beginnt mit dem Lob Gottes, dem alles gehört. Wie Fāṭir beginnt sie mit dem Lob Gottes; beide bekräftigen Schöpfung und Auferstehung.",
      "Al-Aḥzāb ends with reward and punishment, Sabaʾ opens with praise of God to whom everything belongs. Like Fāṭir it opens with praise of God; both affirm creation and resurrection.",
      "ختمت الأحزاب بالجزاء وبدأت سبأ بحمد مالك كل شيء، وتشترك مع فاطر في الافتتاح بالحمد وتقرير الخلق والبعث."
    ),
    lessons: ll(
      ["Dankbarkeit zeigt sich im Handeln, nicht nur im Wort.", "Wohlstand ohne Dank kann verloren gehen, wie bei Sabaʾ.", "Sulaimāns Tod zeigt, dass niemand außer Gott das Verborgene kennt.", "Besitz und Kinder bringen einen Gott nicht näher, sondern Glaube und gute Taten."],
      ["Gratitude shows in deeds, not only in words.", "Prosperity without thanks can be lost, as with Sabaʾ.", "Sulaymān's death shows that no one but God knows the unseen.", "Wealth and children do not bring one closer to God; faith and good deeds do."],
      ["الشكر يكون بالعمل لا بالقول وحده.", "الرخاء بلا شكر قد يزول كما في سبأ.", "موت سليمان دليل على أن الغيب لله وحده.", "لا يقرب إلى الله مال ولا ولد بل الإيمان والعمل الصالح."]
    ),
    questions: ll(
      ["Wie zeigen Sie Dank für eine Gabe durch Ihr Handeln?", "Worauf verlassen Sie sich, um sich Gott nahe zu fühlen?"],
      ["How do you show thanks for a gift through your actions?", "What do you rely on to feel close to God?"],
      ["كيف تشكر نعمة بعملك؟", "على أي شيء تعتمد لتشعر بالقرب من الله؟"]
    ),
    sections: [
      sec(1, 9, "Lob Gottes, Wissen und die Leugnung der Auferstehung", "Praise of God, knowledge and the denial of resurrection", "الحمد والعلم وإنكار البعث"),
      sec(10, 21, "Dāwūd, Sulaimān und das Volk von Sabaʾ", "Dāwūd, Sulaymān and the people of Sabaʾ", "داود وسليمان وسبأ"),
      sec(22, 42, "Widerlegung der Beigesellung und das Gespräch der Verführten", "Refutation of association and the dialogue of the misled", "إبطال الشرك وحوار الأتباع والمتبوعين"),
      sec(43, 54, "Einwände gegen den Gesandten ﷺ und der Aufruf zum Nachdenken", "Objections to the Messenger ﷺ and the call to reflection", "اعتراضات المكذبين والدعوة إلى التفكر"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 35,
    theme: t(
      "Gott allein ist der Schöpfer und Erhalter; die Menschen sind auf ihn angewiesen, er ist auf niemanden angewiesen.",
      "God alone is Creator and Sustainer; people depend on him, he depends on no one.",
      "الله وحده الخالق المدبر، والناس فقراء إليه وهو الغني."
    ),
    context: t(
      "Mekkanisch, aus der mittleren mekkanischen Zeit.",
      "Meccan, from the middle Meccan period.",
      "مكية من أواسط العهد المكي."
    ),
    connects: t(
      "Wie Sabaʾ beginnt sie mit dem Lob Gottes. Sie endet mit dem Warner, den die Leugner herbeiwünschten, und Yā Sīn beginnt mit der Bestätigung, dass der Prophet ﷺ einer der Gesandten ist.",
      "Like Sabaʾ, it opens with praise of God. It ends with the warner the deniers wished for, and Yā Sīn opens affirming that the Prophet ﷺ is one of the messengers.",
      "تفتتح بالحمد كسبأ، وختمت بالنذير الذي تمناه المكذبون فافتتحت يس بتقرير رسالة النبي ﷺ."
    ),
    lessons: ll(
      ["Alle Menschen sind auf Gott angewiesen, er ist unabhängig.", "Die Vielfalt der Farben in Natur und Menschen ist ein Zeichen.", "Wahre Gelehrte erkennt man an ihrer Ehrfurcht vor Gott.", "Die Erben des Buches haben unterschiedliche Stufen."],
      ["All people depend on God; he is self-sufficient.", "The variety of colours in nature and people is a sign.", "True scholars are recognised by their awe of God.", "The inheritors of the Book have different ranks."],
      ["الناس كلهم محتاجون إلى الله وهو الغني.", "اختلاف الألوان في الطبيعة والناس آية.", "العالم الحق يعرف بخشيته لله.", "ورثة الكتاب على درجات."]
    ),
    questions: ll(
      ["In welchem Bereich vergessen Sie, wie sehr Sie auf Gott angewiesen sind?", "Führt Ihr Wissen Sie zu mehr Ehrfurcht vor Gott?"],
      ["In which area do you forget how much you depend on God?", "Does your knowledge lead you to greater awe of God?"],
      ["في أي جانب تنسى حاجتك إلى الله؟", "هل يزيدك علمك خشية لله؟"]
    ),
    sections: [
      sec(1, 14, "Der Schöpfer, seine Barmherzigkeit und die Zeichen", "The Creator, his mercy and the signs", "الخالق ورحمته وآياته"),
      sec(15, 26, "Die Bedürftigkeit des Menschen und die Gesandten", "Human need and the messengers", "فقر الإنسان والرسل"),
      sec(27, 38, "Farben der Schöpfung, die Gelehrten und die Erben des Buches", "Colours of creation, the scholars and the inheritors of the Book", "ألوان الخلق والعلماء وورثة الكتاب"),
      sec(39, 45, "Nachfolger auf Erden und Gottes Geduld", "Successors on earth and God's forbearance", "الخلائف في الأرض وحلم الله"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 37,
    theme: t(
      "Die Einheit Gottes, seine Erhabenheit über falsche Zuschreibungen und der Sieg seiner Gesandten.",
      "The oneness of God, his exaltedness above false attributions and the victory of his messengers.",
      "توحيد الله وتنزيهه عما يصفه المشركون ونصر رسله."
    ),
    context: t(
      "Mekkanisch, aus der mittleren mekkanischen Zeit.",
      "Meccan, from the middle Meccan period.",
      "مكية من أواسط العهد المكي."
    ),
    connects: t(
      "Yā Sīn endet mit Gottes Macht, die Toten zu erwecken; aṣ-Ṣāffāt bekräftigt die Einheit Gottes und die Auferstehung. Ihre Prophetengeschichten setzt Ṣād fort.",
      "Yā Sīn ends with God's power to raise the dead; al-Ṣāffāt affirms God's oneness and the resurrection. Ṣād continues its prophet stories.",
      "ختمت يس بقدرة الله على الإحياء، وقررت الصافات التوحيد والبعث، وتابعت ص قصص الأنبياء فيها."
    ),
    lessons: ll(
      ["Die Engel stehen in geordneten Reihen; Ordnung ist Teil des Gottesdienstes.", "Ibrāhīm und Ismāʿīl zeigen vollkommene Hingabe an Gottes Befehl.", "Lobpreis Gottes rettete Yūnus aus der Not.", "Am Ende gehört der Sieg den Gesandten."],
      ["The angels stand in ordered ranks; order is part of worship.", "Ibrāhīm and Ismāʿīl show complete surrender to God's command.", "Glorifying God rescued Yūnus from distress.", "In the end, victory belongs to the messengers."],
      ["الملائكة صفوف منتظمة، والنظام من العبادة.", "إبراهيم وإسماعيل مثال الاستسلام الكامل لأمر الله.", "التسبيح نجى يونس من كربه.", "العاقبة والنصر للمرسلين."]
    ),
    questions: ll(
      ["Was wären Sie bereit für Gott hinzugeben?", "Welcher Lobpreis begleitet Sie in schwierigen Zeiten?"],
      ["What would you be ready to give up for God?", "Which glorification of God accompanies you in hard times?"],
      ["ما الذي أنت مستعد لبذله لله؟", "أي تسبيح يصحبك في الشدائد؟"]
    ),
    sections: [
      sec(1, 10, "Die Engel in Reihen und der Schutz des Himmels", "The angels in ranks and the guarding of heaven", "الصافات وحفظ السماء"),
      sec(11, 74, "Auferstehung und das Gespräch der Paradies- und Höllenbewohner", "Resurrection and the dialogue of the people of Paradise and Hell", "البعث وحوار أهل الجنة والنار"),
      sec(75, 148, "Nūḥ, Ibrāhīm, Mūsā, Hārūn, Ilyās, Lūṭ und Yūnus", "Nūḥ, Ibrāhīm, Mūsā, Hārūn, Ilyās, Lūṭ and Yūnus", "نوح وإبراهيم وموسى وهارون وإلياس ولوط ويونس"),
      sec(149, 182, "Widerlegung falscher Zuschreibungen und der Sieg der Gesandten", "Refutation of false attributions and the victory of the messengers", "إبطال افتراءات المشركين ونصر المرسلين"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
  {
    s: 38,
    theme: t(
      "Hochmut versus Umkehr: Die Propheten kehren reuig zu Gott zurück, Iblīs und die Leugner verweigern sich aus Hochmut.",
      "Arrogance versus return: the prophets turn back to God in repentance, Iblīs and the deniers refuse out of arrogance.",
      "الكبر في مقابل الإنابة: الأنبياء أوابون، وإبليس والمكذبون يأبون استكبارًا."
    ),
    context: t(
      "Mekkanisch, aus der frühen bis mittleren mekkanischen Zeit.",
      "Meccan, from the early to middle Meccan period.",
      "مكية من أوائل العهد المكي أو أواسطه."
    ),
    asbab: t(
      "Al-Tirmiḏī überliefert von Ibn ʿAbbās, dass der Anfang der Sure herabkam, als die Quraiš bei Abū Ṭālib über den Propheten ﷺ Klage führten.",
      "Al-Tirmidhī transmits from Ibn ʿAbbās that the opening of the surah came down when Quraysh complained about the Prophet ﷺ to Abū Ṭālib.",
      "روى الترمذي عن ابن عباس أن صدر السورة نزل حين شكت قريش النبي ﷺ إلى أبي طالب."
    ),
    connects: t(
      "Sie setzt die Prophetengeschichten aus aṣ-Ṣāffāt fort, mit Schwerpunkt auf Umkehr. Sie endet damit, dass der Qurʾān eine Ermahnung für die Welten ist, und az-Zumar beginnt mit der Herabsendung des Buches.",
      "It continues the prophet stories of al-Ṣāffāt, with the emphasis on returning to God. It ends noting that the Qurʾān is a reminder for the worlds, and al-Zumar opens with the sending down of the Book.",
      "تتابع قصص الأنبياء من الصافات مع التركيز على الإنابة، وختمت بأن القرآن ذكر للعالمين فافتتحت الزمر بتنزيل الكتاب."
    ),
    lessons: ll(
      ["Auch große Propheten kehrten nach einem Fehler sofort zu Gott zurück.", "Gerechtes Urteil verlangt, beide Seiten zu hören.", "Ayyūb zeigt Geduld ohne Klage gegen Gott.", "Hochmut wegen der Herkunft war die Sünde des Iblīs."],
      ["Even great prophets returned to God at once after a mistake.", "Just judgment requires hearing both sides.", "Ayyūb shows patience without complaint against God.", "Arrogance about origin was the sin of Iblīs."],
      ["كبار الأنبياء رجعوا إلى الله فورًا بعد الزلة.", "العدل في الحكم يقتضي سماع الطرفين.", "أيوب مثال الصبر بلا اعتراض على الله.", "التكبر بالأصل كان ذنب إبليس."]
    ),
    questions: ll(
      ["Wie schnell kehren Sie nach einem Fehler zu Gott zurück?", "Wo urteilen Sie, bevor Sie beide Seiten gehört haben?"],
      ["How quickly do you return to God after a mistake?", "Where do you judge before hearing both sides?"],
      ["ما أسرع رجوعك إلى الله بعد الخطأ؟", "أين تحكم قبل أن تسمع الطرفين؟"]
    ),
    sections: [
      sec(1, 16, "Der Qurʾān und der Hochmut der Quraiš", "The Qurʾān and the arrogance of Quraysh", "القرآن واستكبار قريش"),
      sec(17, 40, "Dāwūd und Sulaimān", "Dāwūd and Sulaymān", "داود وسليمان"),
      sec(41, 48, "Ayyūb und weitere Propheten", "Ayyūb and other prophets", "أيوب وسائر الأنبياء"),
      sec(49, 64, "Der Ausgang der Gottesfürchtigen und der Übertreter", "The outcome of the God-conscious and the transgressors", "مآل المتقين والطاغين"),
      sec(65, 88, "Adam, Iblīs und der Abschluss", "Adam, Iblīs and the conclusion", "آدم وإبليس والختام"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 39,
    theme: t(
      "Aufrichtiger Gottesdienst allein für Gott und die Weite seiner Barmherzigkeit für alle, die umkehren.",
      "Sincere worship for God alone and the vastness of his mercy for all who return.",
      "إخلاص العبادة لله وحده وسعة رحمته لكل تائب."
    ),
    context: t(
      "Mekkanisch, aus der mittleren bis späten mekkanischen Zeit; manche nehmen einzelne Verse, etwa 53, als medinensisch aus.",
      "Meccan, from the middle to late Meccan period; some except individual verses, such as 53, as Medinan.",
      "مكية من أواسط العهد المكي أو أواخره، واستثنى بعضهم آيات منها كالآية 53."
    ),
    asbab: t(
      "Zu Vers 53 berichten al-Buḫārī und Muslim von Ibn ʿAbbās über Götzendiener, die viel Unrecht begangen hatten und fragten, ob für sie Vergebung möglich sei.",
      "For verse 53, al-Bukhārī and Muslim report from Ibn ʿAbbās about idolaters who had done much wrong and asked whether forgiveness was possible for them.",
      "في الآية 53 روى البخاري ومسلم عن ابن عباس أن ناسًا من المشركين أكثروا من الذنوب فسألوا هل لهم توبة."
    ),
    connects: t(
      "Ṣād endet mit dem Qurʾān als Ermahnung, az-Zumar beginnt mit seiner Herabsendung. Sie endet mit den Engeln um den Thron, und Ġāfir beginnt mit den Engeln, die den Thron tragen und für die Gläubigen um Vergebung bitten.",
      "Ṣād ends with the Qurʾān as reminder, al-Zumar opens with its sending down. It ends with the angels around the Throne, and Ghāfir opens with the angels who bear the Throne and ask forgiveness for the believers.",
      "ختمت ص بالقرآن ذكرًا وبدأت الزمر بتنزيله، وختمت بالملائكة حول العرش فافتتحت غافر بحملة العرش يستغفرون للمؤمنين."
    ),
    lessons: ll(
      ["Gottesdienst ist nur wertvoll, wenn er aufrichtig für Gott allein ist.", "Wissende und Unwissende sind nicht gleich.", "Kein Mensch soll an Gottes Barmherzigkeit verzweifeln, wie groß seine Sünden auch seien.", "Am Ende werden die Menschen in Gruppen zu ihrem Ziel geführt."],
      ["Worship is only valuable if it is sincerely for God alone.", "Those who know and those who do not are not equal.", "No one should despair of God's mercy, however great their sins.", "In the end, people are led in groups to their destination."],
      ["العبادة لا قيمة لها إلا بالإخلاص لله.", "لا يستوي العالم والجاهل.", "لا ييأس أحد من رحمة الله مهما عظمت ذنوبه.", "يساق الناس في النهاية جماعات إلى مصيرهم."]
    ),
    questions: ll(
      ["Für wen tun Sie Ihre guten Taten wirklich?", "Welche Sünde lässt Sie zweifeln, ob Gott Ihnen vergibt, und was sagt Vers 53 dazu?"],
      ["For whom do you really do your good deeds?", "Which sin makes you doubt whether God forgives you, and what does verse 53 say to that?"],
      ["لمن تعمل أعمالك الصالحة حقًا؟", "أي ذنب يجعلك تشك في مغفرة الله، وماذا تقول لك الآية 53؟"]
    ),
    sections: [
      sec(1, 10, "Aufrichtiger Gottesdienst und die Schöpfung", "Sincere worship and creation", "إخلاص العبادة والخلق"),
      sec(11, 22, "Der Auftrag des Gesandten ﷺ und die Verlierer", "The Messenger's ﷺ mission and the losers", "مهمة الرسول ﷺ والخاسرون"),
      sec(23, 41, "Der Qurʾān, Gleichnisse und Gottes Genügen", "The Qurʾān, parables and God's sufficiency", "القرآن والأمثال وكفاية الله"),
      sec(42, 52, "Schlaf und Tod, Fürsprache und Undank", "Sleep and death, intercession and ingratitude", "النوم والموت والشفاعة والجحود"),
      sec(53, 63, "Der Ruf zur Umkehr und Gottes Barmherzigkeit", "The call to return and God's mercy", "الدعوة إلى التوبة ورحمة الله"),
      sec(64, 75, "Der Posaunenstoß und die Gruppen", "The trumpet blast and the groups", "النفخ في الصور والزمر"),
    ],
    src: [...BASE, "wahidi"],
    review: DRAFT,
  },
  {
    s: 40,
    theme: t(
      "Gott vergibt und straft hart; die Wahrheit wird gegen den Hochmut der Mächtigen mutig verteidigt.",
      "God forgives and punishes severely; the truth is courageously defended against the arrogance of the powerful.",
      "الله غافر الذنب شديد العقاب، والحق يدافع عنه بشجاعة أمام كبر الطغاة."
    ),
    context: t(
      "Mekkanisch, die erste der sieben Suren, die mit Ḥā Mīm beginnen; manche nehmen die Verse 56–57 als medinensisch aus.",
      "Meccan, the first of the seven surahs that open with Ḥā Mīm; some except verses 56–57 as Medinan.",
      "مكية، أولى الحواميم السبع، واستثنى بعضهم الآيتين 56–57."
    ),
    connects: t(
      "Az-Zumar endet mit den Engeln um den Thron, Ġāfir beginnt mit den Thronträgern, die für die Gläubigen bitten. Fuṣṣilat folgt als zweite der Ḥā-Mīm-Suren mit demselben Thema der Offenbarung.",
      "Al-Zumar ends with the angels around the Throne, Ghāfir opens with the Throne-bearers praying for the believers. Fuṣṣilat follows as the second Ḥā Mīm surah with the same theme of revelation.",
      "ختمت الزمر بالملائكة حول العرش وبدأت غافر بحملة العرش يدعون للمؤمنين، وتلتها فصلت ثانية الحواميم في موضوع الوحي نفسه."
    ),
    lessons: ll(
      ["Die Engel bitten für die Gläubigen und ihre Familien um Vergebung.", "Ein einzelner Gläubiger kann am Hof eines Tyrannen die Wahrheit klug verteidigen.", "Gott hat versprochen, das Bittgebet zu erhören; Gebet ist Gottesdienst.", "Reue im Angesicht der Strafe kommt zu spät."],
      ["The angels ask forgiveness for the believers and their families.", "A single believer can wisely defend the truth at a tyrant's court.", "God has promised to answer supplication; supplication is worship.", "Repentance when facing punishment comes too late."],
      ["الملائكة تستغفر للمؤمنين وأهليهم.", "مؤمن واحد يستطيع أن ينصر الحق بحكمة في بلاط طاغية.", "وعد الله بإجابة الدعاء، والدعاء عبادة.", "التوبة عند معاينة العذاب لا تنفع."]
    ),
    questions: ll(
      ["Wo schweigen Sie, obwohl Sie die Wahrheit klug aussprechen könnten?", "Wie oft wenden Sie sich mit Ihren Anliegen direkt an Gott?"],
      ["Where do you stay silent although you could wisely speak the truth?", "How often do you turn directly to God with your concerns?"],
      ["أين تسكت وأنت قادر على قول الحق بحكمة؟", "كم مرة تتوجه بحاجاتك إلى الله مباشرة؟"]
    ),
    sections: [
      sec(1, 20, "Der Vergebende, die Thronträger und der Tag der Begegnung", "The Forgiver, the Throne-bearers and the Day of Meeting", "غافر الذنب وحملة العرش ويوم التلاق"),
      sec(21, 27, "Mūsā und Pharao", "Mūsā and Pharaoh", "موسى وفرعون"),
      sec(28, 50, "Der gläubige Mann aus der Familie Pharaos", "The believing man from Pharaoh's family", "مؤمن آل فرعون"),
      sec(51, 68, "Gottes Hilfe für die Gesandten und der Ruf zum Gebet", "God's help for the messengers and the call to supplication", "نصر الرسل والأمر بالدعاء"),
      sec(69, 85, "Die Streitenden und das Ende der Hochmütigen", "The disputers and the end of the arrogant", "المجادلون وعاقبة المستكبرين"),
    ],
    src: [...BASE],
    review: DRAFT,
  },
];
