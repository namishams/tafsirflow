import type { Maqasid } from "./types";
import { DRAFT } from "../sources";

// Much-loved surahs (al-Kahf, Yā-Sīn, al-Raḥmān, al-Wāqiʿa, al-Mulk), fully detailed. Own words, verse numbers only,
// never Qurʾān text. Drafts until a scholar has reviewed them.
export const M_LOVED: Maqasid[] = [
  // ───────────────────────────── 18 al-Kahf (110) ─────────────────────────────
  {
    s: 18,
    theme: {
      de: "Schutz vor den großen Prüfungen des Glaubens: Prüfung im Glauben (die Leute der Höhle), im Besitz (der Mann mit den zwei Gärten), im Wissen (Mūsā und al-Khiḍr) und in der Macht (Dhū l-Qarnayn). Die Sure zeigt, dass die Pracht der Erde ein Test ist und nur aufrichtiges Handeln für Allah bleibt.",
      en: "Protection against the great trials of faith: the trial of religion (the People of the Cave), of wealth (the owner of the two gardens), of knowledge (Mūsā and al-Khiḍr) and of power (Dhū l-Qarnayn). The surah shows that the adornment of the earth is a test and only sincere deeds done for Allah endure.",
      ar: "العصمة من الفتن الكبرى: فتنة الدين (أصحاب الكهف)، وفتنة المال (صاحب الجنتين)، وفتنة العلم (موسى والخضر)، وفتنة السلطان (ذو القرنين). وتبيّن السورة أن زينة الأرض ابتلاء، وأنه لا يبقى إلا العمل الصالح الخالص لله.",
    },
    context: {
      de: "Mekkanisch, aus der mittleren mekkanischen Zeit, als die Anfeindung der Quraysh wuchs und die Gläubigen Standhaftigkeit und Trost brauchten. Zu ihrem Vorzug überliefert Muslim in seinem Ṣaḥīḥ, wer die ersten zehn Verse auswendig lernt, werde vor dem Dajjāl geschützt (in einer Fassung: die letzten zehn); al-Bukhārī und Muslim berichten, beim Rezitieren der Sure sei die Ruhe (sakīna) wie eine Wolke herabgekommen.",
      en: "Meccan, from the middle Meccan period, when the hostility of Quraysh was growing and the believers needed steadfastness and consolation. On its virtue, Muslim reports in his Ṣaḥīḥ that whoever memorises the first ten verses is protected from the Dajjāl (in one version: the last ten); al-Bukhārī and Muslim report that tranquillity (sakīna) descended like a cloud while the surah was being recited.",
      ar: "مكية، من المرحلة المكية الوسطى، حين اشتد أذى قريش واحتاج المؤمنون إلى التثبيت والتسلية. وفي فضلها روى مسلم في صحيحه أن من حفظ عشر آيات من أولها عُصم من الدجال (وفي رواية: من آخرها)، وروى البخاري ومسلم نزول السكينة كالسحابة عند قراءتها.",
    },
    asbab: {
      de: "Ibn Isḥāq berichtet (in der Sīra, auch bei al-Ṭabarī überliefert), die Quraysh hätten al-Naḍr ibn al-Ḥārith und ʿUqba ibn Abī Muʿayṭ zu jüdischen Gelehrten nach Medina geschickt. Diese rieten, den Propheten ﷺ nach den jungen Männern, die in alter Zeit fortgingen, nach dem Mann, der bis an Ost und West der Erde reiste, und nach dem Geist (al-rūḥ) zu fragen. Die Offenbarung habe sich verzögert, dann sei die Sure gekommen; die Mahnung in den Versen 23–24 wird damit verbunden. Die Kette dieses Berichts enthält einen unbenannten Überlieferer und gilt daher als nicht gesichert.",
      en: "Ibn Isḥāq reports (in the Sīra, also transmitted by al-Ṭabarī) that Quraysh sent al-Naḍr ibn al-Ḥārith and ʿUqba ibn Abī Muʿayṭ to Jewish scholars in Medina, who advised them to ask the Prophet ﷺ about young men who went away in ancient times, about a man who travelled to the east and west of the earth, and about the spirit (al-rūḥ). Revelation was delayed, then the surah came; the reminder in verses 23–24 is linked to this. The chain of this report contains an unnamed narrator and is therefore not considered secure.",
      ar: "روى ابن إسحاق في السيرة، ونقله الطبري، أن قريشًا بعثت النضر بن الحارث وعقبة بن أبي معيط إلى أحبار يهود بالمدينة، فأشاروا بسؤال النبي ﷺ عن فتية ذهبوا في الدهر الأول، وعن رجل طوّاف بلغ مشارق الأرض ومغاربها، وعن الروح. فأبطأ الوحي ثم نزلت السورة، ويُربط بذلك التنبيه في الآيتين 23–24. وفي إسناد الخبر راوٍ مبهم، فلا يُجزم بصحته.",
    },
    connects: {
      de: "al-Isrāʾ endet mit dem Lob Allahs, al-Kahf beginnt damit; die dort gestellte Frage nach dem Geist (17:85) gehört nach Ibn Isḥāq zu denselben drei Fragen. Danach folgt Maryam mit weiteren wunderbaren Geschichten (Yaḥyā, ʿĪsā), die Allahs Macht über das Gewohnte zeigen.",
      en: "al-Isrāʾ ends with praise of Allah and al-Kahf begins with it; the question about the spirit answered there (17:85) belongs, according to Ibn Isḥāq, to the same three questions. Maryam follows with further wondrous accounts (Yaḥyā, ʿĪsā) that show Allah's power over the ordinary course of things.",
      ar: "ختمت الإسراء بالحمد وافتُتحت الكهف به، وسؤال الروح المجاب عنه في الإسراء (17:85) من الأسئلة الثلاثة نفسها على رواية ابن إسحاق. وتليها مريم بقصص عجيبة أخرى (يحيى وعيسى) تُظهر قدرة الله على خرق المعتاد.",
    },
    lessons: {
      de: [
        "Jede Prüfung hat ein Gegenmittel: Gemeinschaft der Guten und Gebet (Höhle), Demut und Dank (Gärten), Bescheidenheit im Wissen (Mūsā), Dienst statt Selbstherrlichkeit (Dhū l-Qarnayn).",
        "Das Diesseits ist Schmuck auf Zeit; was bleibt, sind die guten Werke.",
        "Pläne für morgen stehen unter dem Willen Allahs.",
        "Hinter scheinbar ungerechten Ereignissen kann eine Weisheit liegen, die wir noch nicht sehen.",
        "Annahme der Werke hängt an zwei Bedingungen: richtig getan und allein für Allah (Vers 110).",
      ],
      en: [
        "Every trial has a remedy: good company and prayer (the cave), humility and gratitude (the gardens), modesty in knowledge (Mūsā), service instead of self-glory (Dhū l-Qarnayn).",
        "This world is temporary adornment; what remains are good deeds.",
        "Plans for tomorrow stand under the will of Allah.",
        "Behind seemingly unjust events there may be wisdom we do not yet see.",
        "Acceptance of deeds rests on two conditions: done rightly and for Allah alone (verse 110).",
      ],
      ar: [
        "لكل فتنة علاج: الصحبة الصالحة والدعاء (الكهف)، والتواضع والشكر (الجنتان)، والتواضع في العلم (موسى)، والخدمة بدل الاستعلاء (ذو القرنين).",
        "الدنيا زينة زائلة، والباقي هو العمل الصالح.",
        "خطط الغد مقيدة بمشيئة الله.",
        "قد تكمن وراء الأحداث التي تبدو ظالمة حكمة لا نراها بعد.",
        "قبول العمل بشرطين: موافقة الشرع والإخلاص لله وحده (الآية 110).",
      ],
    },
    questions: {
      de: [
        "Welche der vier Prüfungen (Glaube, Besitz, Wissen, Macht) betrifft Sie gerade am meisten?",
        "Was in Ihrem Leben würden Sie als „bleibendes gutes Werk“ bezeichnen?",
        "Wo verlangen Sie sofort eine Erklärung, wo Geduld angebracht wäre?",
      ],
      en: [
        "Which of the four trials (faith, wealth, knowledge, power) concerns you most right now?",
        "What in your life would you call an \"enduring good deed\"?",
        "Where do you demand an immediate explanation where patience would be fitting?",
      ],
      ar: [
        "أي الفتن الأربع (الدين، المال، العلم، السلطان) تمسّك أكثر الآن؟",
        "ما الذي في حياتك تعدّه من العمل الصالح الباقي؟",
        "أين تطلب تفسيرًا فوريًا حيث يكون الصبر أليق؟",
      ],
    },
    sections: [
      {
        from: 1, to: 8,
        title: { de: "Lob, Warnung und die Erde als Prüfstand", en: "Praise, warning and the earth as a testing ground", ar: "الحمد والإنذار والأرض دار ابتلاء" },
        lessons: {
          de: ["Die Schrift ist gerade und ohne Krümmung; sie warnt und verkündet zugleich.", "Der Kummer des Propheten ﷺ um die Ablehnenden zeigt die Barmherzigkeit des Rufers.", "Der Schmuck der Erde ist da, um zu prüfen, wer am besten handelt (Vers 7)."],
          en: ["The Book is straight without any crookedness; it warns and gives glad tidings at once.", "The Prophet's ﷺ grief over those who reject shows the mercy of the caller.", "The adornment of the earth exists to test who acts best (verse 7)."],
          ar: ["الكتاب مستقيم لا اعوجاج فيه، ينذر ويبشر معًا.", "حزن النبي ﷺ على المعرضين يُظهر رحمة الداعي.", "زينة الأرض للاختبار: من الأفضل عملًا (الآية 7)."],
        },
        takeaway: { de: "Prüfen Sie bei einer Anschaffung heute bewusst: Dient sie meinem besten Handeln?", en: "With a purchase today, consciously ask: does it serve my best conduct?", ar: "اسأل نفسك عند شراء شيء اليوم: هل يخدم أحسن عملي؟" },
        questions: { de: ["Sehen Sie die schönen Dinge um sich eher als Geschenk, als Besitz oder als Prüfung?"], en: ["Do you see the beautiful things around you as gift, possession or test?"], ar: ["هل ترى زينة ما حولك هبةً أم ملكًا أم ابتلاءً؟"] },
      },
      {
        from: 9, to: 26,
        title: { de: "Die Leute der Höhle", en: "The People of the Cave", ar: "أصحاب الكهف" },
        lessons: {
          de: ["Junge Menschen, die ihren Glauben wahren, erhalten von Allah Festigkeit und Führung.", "Wer sich um des Glaubens willen zurückzieht, dem öffnet Allah Barmherzigkeit und Erleichterung.", "Streit über Nebensächliches (die Zahl der Schläfer) lenkt vom Kern ab.", "Zukunftspläne mit dem Willen Allahs verbinden und sich nach dem Vergessen wieder erinnern (Verse 23–24)."],
          en: ["Young people who guard their faith are given firmness and guidance by Allah.", "Whoever withdraws for the sake of faith, Allah opens mercy and ease for them.", "Disputes over side issues (the number of sleepers) distract from the core.", "Linking future plans to the will of Allah, and remembering Him after forgetting (verses 23–24)."],
          ar: ["الفتية الذين يحفظون دينهم يثبّت الله قلوبهم ويزيدهم بصيرة.", "من اعتزل لأجل دينه وسّع الله عليه برحمته ويسّر له أمره.", "الجدال في التفاصيل (عدد الفتية) يصرف عن الجوهر.", "ربط الخطط المستقبلية بمشيئة الله، وذكره عند النسيان (الآيتان 23–24)."],
        },
        takeaway: { de: "Verbinden Sie heute jede Ankündigung für morgen bewusst mit dem Willen Allahs.", en: "Today, consciously tie every announcement about tomorrow to the will of Allah.", ar: "اربط اليوم كل وعد بالغد بمشيئة الله عن وعي." },
        questions: { de: ["Wer ist Ihre „Höhle“, also der Ort oder die Gemeinschaft, die Ihren Glauben schützt?", "Worüber streiten Sie, obwohl es für Ihr Handeln keine Rolle spielt?"], en: ["What is your \"cave\", the place or community that protects your faith?", "What do you argue about although it makes no difference to how you act?"], ar: ["ما كهفك، أي المكان أو الصحبة التي تحمي دينك؟", "فيمَ تجادل مع أنه لا أثر له في عملك؟"] },
      },
      {
        from: 27, to: 31,
        title: { de: "Bei den Aufrichtigen bleiben", en: "Staying with the sincere", ar: "الصبر مع الصادقين" },
        lessons: {
          de: ["Der Prophet ﷺ wird angewiesen, bei denen zu bleiben, die ihren Herrn morgens und abends anrufen, auch wenn sie arm sind (Vers 28).", "Wer dem Schmuck des Diesseits folgt und Allahs Gedenken vergisst, verliert die Richtung.", "Die Wahrheit ist klar; jeder trägt die Verantwortung für seine Wahl."],
          en: ["The Prophet ﷺ is told to stay with those who call on their Lord morning and evening, even if they are poor (verse 28).", "Whoever follows worldly adornment and forgets the remembrance of Allah loses direction.", "The truth is clear; each person bears responsibility for their choice."],
          ar: ["أُمر النبي ﷺ بملازمة الذاكرين لربهم صباحًا ومساءً وإن كانوا فقراء (الآية 28).", "من اتبع زينة الدنيا وغفل عن ذكر الله ضلّ وجهته.", "الحق بيّن، وكل امرئ مسؤول عن اختياره."],
        },
        takeaway: { de: "Suchen Sie diese Woche bewusst die Nähe eines Menschen, der Sie an Allah erinnert.", en: "This week, deliberately seek the company of someone who reminds you of Allah.", ar: "اقصد هذا الأسبوع صحبة من يذكّرك بالله." },
        questions: { de: ["Nach welchen Maßstäben wählen Sie Ihre Freunde?"], en: ["By what standards do you choose your friends?"], ar: ["بأي معيار تختار أصدقاءك؟"] },
      },
      {
        from: 32, to: 44,
        title: { de: "Der Mann mit den zwei Gärten", en: "The owner of the two gardens", ar: "صاحب الجنتين" },
        lessons: {
          de: ["Reichtum verführt zur Überheblichkeit und zum Glauben, er sei ewig.", "Der arme Gefährte mahnt mit Ehrerbietung gegenüber Allah und erinnert an den Ursprung aus Staub.", "Dankbarkeit heißt, Gaben auf Allahs Willen zurückzuführen (Vers 39).", "Die wahre Schutzherrschaft liegt allein bei Allah."],
          en: ["Wealth tempts to arrogance and to believing it will last forever.", "The poorer companion admonishes with reverence for Allah and recalls man's origin from dust.", "Gratitude means attributing blessings to Allah's will (verse 39).", "True protection and authority belong to Allah alone."],
          ar: ["الغنى يغري بالكِبر وبتوهم الخلود.", "الصاحب الفقير يعظ بتعظيم الله ويذكّر بأصل الخلق من تراب.", "الشكر أن تنسب النعمة إلى مشيئة الله (الآية 39).", "النصرة والسلطان الحق لله وحده."],
        },
        takeaway: { de: "Wenn Ihnen heute etwas gefällt, das Sie besitzen, führen Sie es ausdrücklich auf Allahs Willen zurück.", en: "When something you own pleases you today, explicitly attribute it to Allah's will.", ar: "إذا أعجبك اليوم شيء تملكه فانسبه صراحة إلى مشيئة الله." },
        questions: { de: ["Welchen Ihrer Erfolge haben Sie insgeheim allein sich selbst zugeschrieben?"], en: ["Which of your successes have you secretly credited to yourself alone?"], ar: ["أي نجاح لك نسبته في سرّك إلى نفسك وحدها؟"] },
      },
      {
        from: 45, to: 49,
        title: { de: "Das Gleichnis vom Leben und das Buch der Taten", en: "The parable of life and the record of deeds", ar: "مثل الحياة الدنيا وكتاب الأعمال" },
        lessons: {
          de: ["Das Leben gleicht Pflanzen nach dem Regen: kurz grün, dann vom Wind verweht.", "Besitz und Kinder sind Schmuck; das bleibende Gute ist besser in Lohn und Hoffnung (Vers 46).", "Das Buch der Taten lässt weder Kleines noch Großes aus."],
          en: ["Life resembles plants after rain: briefly green, then scattered by the wind.", "Wealth and children are adornment; enduring good deeds are better in reward and hope (verse 46).", "The record of deeds leaves out nothing small or great."],
          ar: ["الحياة كنبات بعد المطر يخضرّ قليلًا ثم يجفّ وتفرّقه الريح.", "المال والأولاد زينة، والأعمال الصالحة الباقية أفضل جزاءً وأصدق رجاءً (الآية 46).", "كتاب الأعمال يحصي الصغير والكبير."],
        },
        takeaway: { de: "Tun Sie heute eine kleine gute Tat, die niemand sieht.", en: "Do a small good deed today that no one sees.", ar: "اعمل اليوم عملًا صالحًا صغيرًا لا يراه أحد." },
        questions: { de: ["Welche kleine Gewohnheit würde in Ihrem Buch am meisten auffallen?"], en: ["Which small habit would stand out most in your record?"], ar: ["أي عادة صغيرة ستبرز أكثر في كتابك؟"] },
      },
      {
        from: 50, to: 59,
        title: { de: "Iblīs, Streitlust und Allahs Geduld", en: "Iblīs, contentiousness and Allah's forbearance", ar: "إبليس والجدل وإمهال الله" },
        lessons: {
          de: ["Iblīs ist ein erklärter Feind; ihn als Vertrauten zu nehmen, ist ein schlechter Tausch.", "Der Mensch ist das streitlustigste Geschöpf; Beispiele allein bekehren nicht, wenn das Herz verschlossen ist.", "Allah gewährt Aufschub aus Barmherzigkeit, doch der Aufschub hat eine Frist."],
          en: ["Iblīs is an open enemy; taking him as an ally is a terrible exchange.", "Man is the most contentious of creatures; examples alone do not convert a closed heart.", "Allah grants respite out of mercy, but the respite has an appointed term."],
          ar: ["إبليس عدو ظاهر العداوة، واتخاذه وليًّا أسوأ مقايضة.", "الإنسان أشد المخلوقات جدالًا، والأمثال لا تنفع قلبًا مغلقًا.", "يمهل الله رحمةً، لكن للإمهال موعدًا."],
        },
        takeaway: { de: "Verzichten Sie heute bewusst auf einen Streit, in dem es nur ums Rechthaben geht.", en: "Today, deliberately give up an argument that is only about being right.", ar: "اترك اليوم جدالًا لا غاية له إلا الغلبة." },
        questions: { de: ["Wo hat Hochmut, wie bei Iblīs, Sie schon von einer Wahrheit abgehalten?"], en: ["Where has pride, as with Iblīs, kept you from a truth?"], ar: ["أين صدّك الكِبر، كما صدّ إبليس، عن حق؟"] },
      },
      {
        from: 60, to: 82,
        title: { de: "Mūsā und al-Khiḍr", en: "Mūsā and al-Khiḍr", ar: "موسى والخضر" },
        lessons: {
          de: ["Auch ein großer Prophet reist, um zu lernen; Wissen verlangt Mühe und Demut.", "Geduld mit dem, was man noch nicht versteht, gehört zum Lernen.", "Das beschädigte Boot, der Junge, die Mauer: Hinter Schaden kann Schutz, hinter Verlust Gnade liegen.", "Die Rechtschaffenheit der Eltern kann den Kindern zugutekommen (Vers 82)."],
          en: ["Even a great prophet travels to learn; knowledge demands effort and humility.", "Patience with what one does not yet understand is part of learning.", "The damaged boat, the boy, the wall: behind harm there may be protection, behind loss there may be mercy.", "The righteousness of parents may benefit their children (verse 82)."],
          ar: ["حتى النبي العظيم يرحل لطلب العلم، فالعلم يحتاج إلى جهد وتواضع.", "الصبر على ما لم يفهمه المرء بعد من أدب التعلم.", "السفينة والغلام والجدار: وراء الضرر حفظ، ووراء الفقد رحمة.", "صلاح الآباء ينفع الأبناء (الآية 82)."],
        },
        takeaway: { de: "Schreiben Sie ein schweres Ereignis auf und notieren Sie eine mögliche verborgene Weisheit darin.", en: "Write down one hard event and note a possible hidden wisdom within it.", ar: "اكتب حدثًا شاقًا وسجّل حكمة خفية محتملة فيه." },
        questions: { de: ["Welches „beschädigte Boot“ in Ihrem Leben hat Sie im Nachhinein vor Größerem bewahrt?", "Wie gehen Sie mit Lehrern um, deren Weg Sie nicht sofort verstehen?"], en: ["Which \"damaged boat\" in your life later protected you from something worse?", "How do you treat teachers whose ways you do not immediately understand?"], ar: ["أي سفينة خُرقت في حياتك حفظتك لاحقًا من شر أكبر؟", "كيف تتعامل مع معلم لا تفهم طريقته فورًا؟"] },
      },
      {
        from: 83, to: 98,
        title: { de: "Dhū l-Qarnayn", en: "Dhū l-Qarnayn", ar: "ذو القرنين" },
        lessons: {
          de: ["Macht und Mittel sind von Allah gegeben und für Gerechtigkeit bestimmt.", "Ein gerechter Herrscher straft den Unrecht Tuenden und ehrt den Guten.", "Er nimmt keinen Lohn, sondern bittet um Mithilfe; der Damm ist Gemeinschaftswerk.", "Nach vollbrachtem Werk schreibt er es der Barmherzigkeit seines Herrn zu (Vers 98)."],
          en: ["Power and means are given by Allah and meant for justice.", "A just ruler punishes the wrongdoer and honours the good.", "He takes no payment but asks for help; the barrier is a shared work.", "After completing the work he ascribes it to the mercy of his Lord (verse 98)."],
          ar: ["التمكين والأسباب من الله، وغايتها العدل.", "الحاكم العادل يعاقب الظالم ويكرم المحسن.", "لم يأخذ أجرًا بل طلب العون، فكان السد عملًا مشتركًا.", "بعد إتمام العمل نسبه إلى رحمة ربه (الآية 98)."],
        },
        takeaway: { de: "Setzen Sie eine Fähigkeit oder Position, die Sie haben, heute zum Nutzen anderer ein.", en: "Use one ability or position you have today for the benefit of others.", ar: "استعمل اليوم قدرة أو مكانة لديك في نفع غيرك." },
        questions: { de: ["Welche „Mittel“ hat Allah Ihnen gegeben, und wem dienen sie?"], en: ["What \"means\" has Allah given you, and whom do they serve?"], ar: ["ما الأسباب التي آتاك الله، ولمن تسخّرها؟"] },
      },
      {
        from: 99, to: 110,
        title: { de: "Die Verlierer der Werke und die Bedingung der Annahme", en: "Those who lose their deeds and the condition of acceptance", ar: "أخسر الناس عملًا وشرط القبول" },
        lessons: {
          de: ["Am meisten verliert, wer meint, Gutes zu tun, während sein Mühen in die Irre geht (Verse 103–104).", "Allahs Worte sind unerschöpflich, auch wenn das Meer Tinte wäre (Vers 109).", "Der Prophet ﷺ ist ein Mensch, dem offenbart wird; wer auf die Begegnung mit Allah hofft, handelt recht und gesellt Ihm niemanden bei (Vers 110)."],
          en: ["The greatest losers are those who think they do good while their effort goes astray (verses 103–104).", "Allah's words are inexhaustible, even if the sea were ink (verse 109).", "The Prophet ﷺ is a human being to whom revelation comes; whoever hopes to meet Allah acts righteously and associates no one with Him (verse 110)."],
          ar: ["أشد الناس خسارة من ضاع جهده وهو يظن أنه يُحسن (الآيتان 103–104).", "كلمات الله لا تنتهي ولو صار البحر حبرًا (الآية 109).", "النبي ﷺ بشر يأتيه الوحي، ومن يرجو لقاء الله يعمل الصالح ولا يشرك به أحدًا في عبادته (الآية 110)."],
        },
        takeaway: { de: "Prüfen Sie vor einer guten Tat heute kurz Ihre Absicht.", en: "Before one good deed today, briefly check your intention.", ar: "راجع نيتك قبل عمل صالح اليوم." },
        questions: { de: ["Welche Ihrer Gewohnheiten halten Sie für gut, ohne sie je am Maßstab der Offenbarung geprüft zu haben?"], en: ["Which of your habits do you consider good without ever having tested them against revelation?"], ar: ["أي عاداتك تحسبها حسنة ولم تعرضها قطّ على الوحي؟"] },
      },
    ],
    src: ["ibnKathir", "tabari", "qurtubi", "saadi", "biqai", "ibnAshur", "wahidi"],
    review: DRAFT,
  },

  // ───────────────────────────── 36 Yā-Sīn (83) ─────────────────────────────
  {
    s: 36,
    theme: {
      de: "Die drei Grundlagen des Glaubens: die Wahrheit der Sendung, die Einheit Allahs, belegt durch Zeichen in Schöpfung und Kosmos, und die sichere Auferstehung. Wer die Ermahnung annimmt und Allah im Verborgenen fürchtet, dem gilt die frohe Botschaft.",
      en: "The three foundations of faith: the truth of the message, the oneness of Allah shown through signs in creation and the cosmos, and the certainty of resurrection. Glad tidings belong to whoever accepts the reminder and fears Allah in the unseen.",
      ar: "أصول الإيمان الثلاثة: صدق الرسالة، والتوحيد بدلائل الخلق والآفاق، وتحقق البعث. والبشارة لمن قبل التذكير وخاف الله في السر.",
    },
    context: {
      de: "Mekkanisch, nach verbreiteter Ansicht aus der mittleren mekkanischen Zeit, in der die Quraysh die Sendung und die Auferstehung offen leugneten.",
      en: "Meccan, by the common view from the middle Meccan period, when Quraysh openly denied the message and the resurrection.",
      ar: "مكية، على المشهور من المرحلة المكية الوسطى، حين جاهرت قريش بتكذيب الرسالة والبعث.",
    },
    asbab: {
      de: "Zu den Versen 77–79 berichten al-Ṭabarī und Ibn Kathīr von Mujāhid, Qatāda und anderen, ein Mann aus den Quraysh sei mit einem zerfallenen Knochen gekommen, habe ihn zerrieben und gefragt, wer diesen wieder lebendig mache. Die Berichte nennen unterschiedliche Namen (Ubayy ibn Khalaf, al-ʿĀṣ ibn Wāʾil); der Kern gilt als bekannt, die Person ist umstritten.",
      en: "On verses 77–79, al-Ṭabarī and Ibn Kathīr report from Mujāhid, Qatāda and others that a man of Quraysh came with a decayed bone, crumbled it and asked who would bring it back to life. The reports name different people (Ubayy ibn Khalaf, al-ʿĀṣ ibn Wāʾil); the core is well known, the person is disputed.",
      ar: "في الآيات 77–79 نقل الطبري وابن كثير عن مجاهد وقتادة وغيرهما أن رجلًا من قريش جاء بعظم بالٍ ففتّه وسأل: من يحيي هذا؟ واختلفت الروايات في تسميته (أبيّ بن خلف، العاص بن وائل)، فأصل الخبر مشهور وتعيين الرجل مختلف فيه.",
    },
    connects: {
      de: "Fāṭir endet damit, dass die Leugner schworen, einem Warner zu folgen, wenn einer käme, und sich dann abwandten; Yā-Sīn beginnt mit der Bestätigung, dass der Prophet ﷺ dieser gesandte Warner ist. Es folgt al-Ṣāffāt, die die Einheit Allahs und die Geschichten der Propheten weiter entfaltet.",
      en: "Fāṭir ends with the deniers swearing they would follow a warner if one came, and then turning away; Yā-Sīn opens by affirming that the Prophet ﷺ is that sent warner. al-Ṣāffāt follows, unfolding the oneness of Allah and the stories of the prophets further.",
      ar: "ختمت فاطر بحلف المكذبين أنهم سيتبعون النذير إن جاءهم ثم إعراضهم، وافتُتحت يس بتقرير أن النبي ﷺ هو النذير المرسل. وتليها الصافات بمزيد بسط للتوحيد وقصص الأنبياء.",
    },
    lessons: {
      de: [
        "Die Ermahnung nützt dem, der bereit ist, ihr zu folgen und Allah im Verborgenen zu fürchten.",
        "Jede Tat und ihre Spuren werden festgehalten, auch was nach uns wirkt (Vers 12).",
        "Ein einzelner aufrichtiger Mensch kann die Wahrheit mutig aussprechen, selbst gegen eine ganze Stadt.",
        "Der Kosmos mit seiner Ordnung ist ein Zeichen, das zum Nachdenken ruft.",
        "Wer das erste Mal erschuf, kann wieder erschaffen; Sein Befehl ist augenblicklich (Vers 82).",
      ],
      en: [
        "The reminder benefits those ready to follow it and to fear Allah in the unseen.",
        "Every deed and its traces are recorded, including what continues after us (verse 12).",
        "A single sincere person can speak the truth bravely, even against an entire town.",
        "The cosmos and its order are a sign calling to reflection.",
        "He who created the first time can create again; His command is instantaneous (verse 82).",
      ],
      ar: [
        "ينتفع بالإنذار من قبل التذكير وخاف الله في غيبته عن الناس.",
        "تُكتب الأعمال وآثارها، حتى ما يبقى بعدنا (الآية 12).",
        "رجل واحد صادق يستطيع أن يصدع بالحق ولو خالفته مدينة كاملة.",
        "الكون بنظامه آية تدعو إلى التفكر.",
        "من أنشأ أول مرة قادر على الإعادة، وأمره نافذ في الحال (الآية 82).",
      ],
    },
    questions: {
      de: [
        "Welche Spuren Ihres Handelns werden nach Ihnen weiterwirken?",
        "Wann haben Sie zuletzt einen Sonnenuntergang oder den Mond als Zeichen betrachtet und nicht nur als Anblick?",
      ],
      en: [
        "Which traces of your actions will continue after you?",
        "When did you last look at a sunset or the moon as a sign rather than merely a sight?",
      ],
      ar: [
        "ما الآثار التي ستبقى من عملك بعدك؟",
        "متى نظرت آخر مرة إلى الغروب أو القمر نظرة اعتبار لا مجرد مشاهدة؟",
      ],
    },
    sections: [
      {
        from: 1, to: 12,
        title: { de: "Die Sendung und wem die Warnung nützt", en: "The message and whom the warning benefits", ar: "الرسالة ومن ينتفع بالإنذار" },
        lessons: {
          de: ["Allah bekräftigt die Sendung des Propheten ﷺ auf geradem Weg.", "Verstockte Herzen bleiben unberührt; das ist ihre Wahl, nicht ein Mangel der Botschaft.", "Taten und ihre Spuren werden in einem klaren Verzeichnis festgehalten."],
          en: ["Allah affirms the Prophet's ﷺ mission on a straight path.", "Hardened hearts remain unmoved; that is their choice, not a flaw in the message.", "Deeds and their traces are recorded in a clear register."],
          ar: ["يؤكد الله رسالة النبي ﷺ واستقامة طريقه.", "القلوب المعاندة لا تتأثر، وذلك باختيارها لا لنقص في البلاغ.", "تُحصى الأعمال وآثارها في سجل واضح."],
        },
        takeaway: { de: "Beginnen Sie heute etwas Gutes, das nach Ihnen weiterwirken kann, etwa Wissen weitergeben.", en: "Start something good today that can continue after you, such as passing on knowledge.", ar: "ابدأ اليوم خيرًا يبقى أثره بعدك، كتعليم علم." },
        questions: { de: ["Welche „Spur“ möchten Sie bewusst hinterlassen?"], en: ["What \"trace\" do you want to leave on purpose?"], ar: ["ما الأثر الذي تريد أن تتركه عن قصد؟"] },
      },
      {
        from: 13, to: 32,
        title: { de: "Die Stadt und der Mann vom anderen Ende", en: "The town and the man from its far end", ar: "أصحاب القرية والرجل الساعي" },
        lessons: {
          de: ["Gesandte werden trotz Bestätigung abgelehnt; Ablehnende suchen Vorwände wie „schlechtes Omen“.", "Der Mann vom entferntesten Teil der Stadt eilt herbei und ruft zu denen, die keinen Lohn verlangen (Verse 20–21).", "Selbst nach seinem Tod wünscht er seinem Volk, es möge wissen, wie Allah ihm vergab: Wohlwollen ohne Groll."],
          en: ["Messengers are rejected despite confirmation; rejecters seek excuses such as \"bad omens\".", "The man from the farthest part of the town hastens and calls to follow those who ask no reward (verses 20–21).", "Even after his death he wishes his people knew how Allah forgave him: goodwill without resentment."],
          ar: ["كُذّب الرسل مع التعزيز، وتعلّل المكذبون بالتطيّر.", "أقبل رجل مسرعًا من أبعد أطراف المدينة يدعو قومه إلى اتباع رسل لا يطلبون أجرًا (الآيتان 20–21).", "حتى بعد موته تمنى أن يعلم قومه بمغفرة ربه له: نصح بلا حقد."],
        },
        takeaway: { de: "Sprechen Sie heute ein wahres, gutes Wort aus, auch wenn es unbequem ist, und bleiben Sie dabei freundlich.", en: "Speak a true, good word today even if it is uncomfortable, and stay kind while doing so.", ar: "قل اليوم كلمة حق نافعة ولو ثقلت، مع الرفق." },
        questions: { de: ["Würden Sie „herbeieilen“, wenn Ihre Umgebung die Wahrheit ablehnt?", "Können Sie denen, die Ihnen Unrecht taten, noch Gutes wünschen?"], en: ["Would you \"hasten forward\" if those around you rejected the truth?", "Can you still wish good for those who wronged you?"], ar: ["هل كنت ستسعى لو أعرض من حولك عن الحق؟", "هل تستطيع أن تتمنى الخير لمن ظلمك؟"] },
      },
      {
        from: 33, to: 44,
        title: { de: "Zeichen in Erde, Himmel und Meer", en: "Signs in earth, sky and sea", ar: "آيات الأرض والسماء والبحر" },
        lessons: {
          de: ["Die tote Erde, die wieder lebt, ist ein Bild der Auferstehung.", "Nacht und Tag, Sonne und Mond laufen in fester Ordnung, keines überholt das andere (Verse 37–40).", "Schiffe auf dem Meer zeigen, dass Sicherheit eine Gnade ist und kein Selbstverständnis."],
          en: ["The dead earth brought back to life is an image of the resurrection.", "Night and day, sun and moon run in fixed order, none overtaking the other (verses 37–40).", "Ships on the sea show that safety is a grace, not something to take for granted."],
          ar: ["الأرض الميتة تحيا، وفي ذلك صورة البعث.", "الليل والنهار والشمس والقمر في نظام محكم، لا يسبق شيء غيره (الآيات 37–40).", "السفن في البحر تُظهر أن السلامة نعمة لا أمر مضمون."],
        },
        takeaway: { de: "Betrachten Sie heute Abend den Himmel eine Minute lang bewusst als Zeichen.", en: "Tonight, look at the sky for one minute deliberately as a sign.", ar: "تأمل السماء الليلة دقيقة بنية الاعتبار." },
        questions: { de: ["Welche alltägliche Ordnung halten Sie für selbstverständlich?"], en: ["Which everyday order do you take for granted?"], ar: ["أي نظام يومي تعدّه من المسلّمات؟"] },
      },
      {
        from: 45, to: 54,
        title: { de: "Abwendung, Spott und der plötzliche Ruf", en: "Turning away, mockery and the sudden call", ar: "الإعراض والاستهزاء والصيحة" },
        lessons: {
          de: ["Wer Warnungen verspottet und Spenden mit Ausreden verweigert, hat sein Herz verschlossen.", "Die Stunde kommt plötzlich, während Menschen streiten.", "Am Tag der Auferstehung wird niemandem Unrecht getan; jeder erhält nur, was er tat (Vers 54)."],
          en: ["Whoever mocks warnings and refuses to give with excuses has closed their heart.", "The Hour comes suddenly while people are arguing.", "On the Day of Resurrection no one is wronged; each receives only what they did (verse 54)."],
          ar: ["من سخر من النذر وتعلّل لمنع الإنفاق أغلق قلبه.", "تأتي الساعة فجأة والناس منشغلون بخصوماتهم.", "يوم القيامة لا يُظلم أحد، ولا يُجازى إلا بعمله (الآية 54)."],
        },
        takeaway: { de: "Geben Sie heute eine kleine Spende, ohne nach einer Ausrede zu suchen.", en: "Give a small charity today without looking for an excuse.", ar: "تصدّق اليوم بشيء يسير دون تعلّل." },
        questions: { de: ["Welche Ausrede benutzen Sie, um Gutes aufzuschieben?"], en: ["What excuse do you use to postpone doing good?"], ar: ["ما العذر الذي تؤجل به الخير؟"] },
      },
      {
        from: 55, to: 68,
        title: { de: "Die Leute des Paradieses und die Zeugen am eigenen Leib", en: "The people of Paradise and witnesses from one's own body", ar: "أهل الجنة وشهادة الجوارح" },
        lessons: {
          de: ["Die Freude der Paradiesbewohner gipfelt im Friedensgruß ihres barmherzigen Herrn (Vers 58).", "Allah hat den Menschen verpflichtet, nicht dem Satan zu dienen; das ist der gerade Weg.", "Hände und Füße werden bezeugen, was der Mund verschweigt (Vers 65)."],
          en: ["The joy of Paradise culminates in the greeting of peace from their merciful Lord (verse 58).", "Allah took a covenant that man should not serve Satan; that is the straight path.", "Hands and feet will testify to what the mouth conceals (verse 65)."],
          ar: ["يُتوَّج نعيم أهل الجنة بتحية السلام من ربهم الرحيم (الآية 58).", "أخذ الله على البشر العهد ألا يطيعوا الشيطان في العبادة، وعبادة الله وحده هي الطريق القويم.", "تشهد الأيدي والأرجل بما تكتمه الأفواه (الآية 65)."],
        },
        takeaway: { de: "Fragen Sie sich heute bei einer Handlung: Wie würde meine Hand darüber Zeugnis ablegen?", en: "Ask yourself about one action today: how would my hand testify about it?", ar: "اسأل نفسك عن عمل اليوم: بماذا ستشهد عليه يدي؟" },
        questions: { de: ["Was würden Ihre Hände und Füße über Ihre letzte Woche sagen?"], en: ["What would your hands and feet say about your past week?"], ar: ["ماذا ستقول يداك ورجلاك عن أسبوعك الماضي؟"] },
      },
      {
        from: 69, to: 83,
        title: { de: "Keine Dichtung, sondern Ermahnung; der zerfallene Knochen", en: "Not poetry but reminder; the decayed bone", ar: "ليس شعرًا بل ذكر؛ والعظم البالي" },
        lessons: {
          de: ["Die Offenbarung ist keine Dichtung, sondern Ermahnung für jeden, dessen Herz lebt.", "Nutztiere und ihre Gaben verlangen Dank, nicht Götzen.", "Wer aus dem Nichts erschuf und aus grünem Holz Feuer hervorbringt, kann Knochen wieder beleben (Verse 78–81).", "Sein Befehl ist: Er will etwas, und es ist (Vers 82)."],
          en: ["Revelation is not poetry but a reminder for everyone whose heart is alive.", "Livestock and their benefits call for gratitude, not idols.", "He who created from nothing and brings fire out of green wood can revive bones (verses 78–81).", "His command is: He wills a thing, and it is (verse 82)."],
          ar: ["الوحي ليس شعرًا بل تذكير لكل قلب حي.", "الأنعام ومنافعها تستوجب الشكر لا اتخاذ الآلهة.", "من خلق من العدم وجعل النار تخرج من الخشب الأخضر قادر على إحياء العظام (الآيات 78–81).", "إذا أراد شيئًا كان في الحال (الآية 82)."],
        },
        takeaway: { de: "Wenn Ihnen etwas unmöglich erscheint, erinnern Sie sich an Vers 82 und bitten Sie Allah.", en: "When something seems impossible to you, recall verse 82 and ask Allah.", ar: "إذا بدا لك أمر مستحيلًا فتذكّر الآية 82 وادعُ الله." },
        questions: { de: ["Welchen Zweifel tragen Sie, der sich mit dem Blick auf Ihre eigene Erschaffung auflösen ließe?"], en: ["Which doubt do you carry that could dissolve by looking at your own creation?"], ar: ["أي شك تحمله يزول بالنظر في خلقك أنت؟"] },
      },
    ],
    src: ["ibnKathir", "tabari", "qurtubi", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },

  // ───────────────────────────── 55 al-Raḥmān (78) ─────────────────────────────
  {
    s: 55,
    theme: {
      de: "Die Gaben des Allerbarmers an Menschen und Dschinn, beginnend mit der Lehre des Qurʾān, und die Frage, welche davon sie leugnen wollen. Aus Gnade folgt Verantwortung: Gericht für die Leugner, abgestufte Gärten für die, die ihren Herrn fürchten.",
      en: "The gifts of the Most Merciful to humans and jinn, beginning with teaching the Qurʾān, and the question which of them they would deny. Grace brings responsibility: judgement for the deniers, graded gardens for those who fear their Lord.",
      ar: "نعم الرحمن على الإنس والجن، وأولها تعليم القرآن، مع السؤال: أيّ هذه النعم ينكران؟ والنعمة تستلزم المسؤولية: حساب للمكذبين، وجنات متفاضلة لمن خشي الوقوف بين يدي ربه.",
    },
    context: {
      de: "Nach Ansicht der Mehrheit mekkanisch; einige Frühe hielten sie für medinensisch. Ibn ʿĀshūr bevorzugt die mekkanische Einordnung.",
      en: "Meccan according to the majority; some early authorities held it to be Medinan. Ibn ʿĀshūr prefers the Meccan view.",
      ar: "مكية عند الجمهور، وقال بعض السلف إنها مدنية، ورجّح ابن عاشور أنها مكية.",
    },
    connects: {
      de: "al-Qamar endet mit dem allmächtigen König, al-Raḥmān beginnt mit dem Namen des Allerbarmers: auf die Macht folgt die Barmherzigkeit. Beide Suren haben einen wiederkehrenden Kehrvers. Es folgt al-Wāqiʿa, die die Gruppen am Tag des Gerichts genauer beschreibt.",
      en: "al-Qamar ends with the all-powerful King, al-Raḥmān begins with the name of the Most Merciful: power is followed by mercy. Both surahs have a recurring refrain. al-Wāqiʿa follows, describing the groups on the Day of Judgement in more detail.",
      ar: "ختمت القمر بذكر الملك القادر، وافتُتحت الرحمن باسم الرحمن، فتلت الرحمةُ القدرةَ. وفي السورتين آية تتكرر. وتليها الواقعة بتفصيل أصناف الناس يوم القيامة.",
    },
    lessons: {
      de: [
        "Die größte Gabe ist der Qurʾān; er wird vor der Erschaffung des Menschen genannt.",
        "Der Kehrvers, 31 Mal wiederholt, ruft immer wieder zur Rechenschaft über die Gnade.",
        "Die Waage im Kosmos verpflichtet zur Gerechtigkeit im eigenen Handeln (Verse 7–9).",
        "Alles vergeht; bestehen bleibt allein das Angesicht Allahs (Verse 26–27).",
        "Gutes Handeln wird mit Gutem vergolten (Vers 60).",
      ],
      en: [
        "The greatest gift is the Qurʾān; it is mentioned before the creation of man.",
        "The refrain, repeated 31 times, calls again and again to account for grace.",
        "The balance in the cosmos obliges justice in one's own conduct (verses 7–9).",
        "Everything perishes; only the Face of Allah remains (verses 26–27).",
        "Excellence is rewarded with excellence (verse 60).",
      ],
      ar: [
        "أعظم النعم القرآن، وقد قُدّم ذكره على خلق الإنسان.",
        "الآية المكررة إحدى وثلاثين مرة تستدعي المحاسبة على النعم مرة بعد مرة.",
        "الميزان في الكون يوجب العدل في سلوك الإنسان (الآيات 7–9).",
        "كل ما على الأرض يفنى ولا يبقى إلا وجه الله (الآيتان 26–27).",
        "الإحسان يُجازى بالإحسان (الآية 60).",
      ],
    },
    questions: {
      de: [
        "Welche Gabe Allahs haben Sie in letzter Zeit in Ihrem Verhalten „geleugnet“, also nicht gedankt?",
        "Wo verletzen Sie im Alltag „die Waage“?",
      ],
      en: [
        "Which gift of Allah have you recently \"denied\" in your conduct, that is, failed to thank Him for?",
        "Where do you upset \"the balance\" in daily life?",
      ],
      ar: [
        "أي نعمة كذّبت بها مؤخرًا بفعلك، أي لم تشكرها؟",
        "أين تخلّ بالميزان في حياتك اليومية؟",
      ],
    },
    sections: [
      {
        from: 1, to: 13,
        title: { de: "Der Allerbarmer lehrt den Qurʾān", en: "The Most Merciful teaches the Qurʾān", ar: "تعليم القرآن رحمةً" },
        lessons: {
          de: ["Barmherzigkeit zeigt sich zuerst im Lehren des Qurʾān und in der Gabe der klaren Rede.", "Sonne und Mond laufen nach Berechnung, Pflanzen und Bäume unterwerfen sich.", "Der Himmel ist mit der Waage errichtet; Maß halten ist Pflicht (Verse 7–9)."],
          en: ["Mercy shows itself first in teaching the Qurʾān and in the gift of clear speech.", "Sun and moon run by calculation, plants and trees submit.", "The sky is raised with the balance; keeping measure is a duty (verses 7–9)."],
          ar: ["أول مظاهر الرحمة تعليم القرآن ونعمة البيان.", "الشمس والقمر يجريان بحساب دقيق، والنبات والشجر خاضعان لله.", "السماء مرفوعة والميزان موضوع، فالعدل في الوزن واجب (الآيات 7–9)."],
        },
        takeaway: { de: "Wiegen und messen Sie heute in einem Geschäft oder Versprechen genau.", en: "Weigh and measure precisely today in one transaction or promise.", ar: "اعدل في الوزن اليوم في معاملة أو وعد." },
        questions: { de: ["Nehmen Sie den Qurʾān als Gabe der Barmherzigkeit wahr oder als Pflicht?"], en: ["Do you experience the Qurʾān as a gift of mercy or as an obligation?"], ar: ["هل تستشعر القرآن نعمة رحمة أم تكليفًا فحسب؟"] },
      },
      {
        from: 14, to: 25,
        title: { de: "Ton und Feuer, zwei Meere, zwei Osten", en: "Clay and fire, two seas, two easts", ar: "الصلصال والنار والبحران والمشرقان" },
        lessons: {
          de: ["Mensch und Dschinn haben unterschiedliche Ursprünge und dieselbe Verantwortung.", "Die beiden Meere mit einer Schranke zeigen Ordnung in der Vielfalt.", "Perlen, Korallen und Schiffe sind Gaben, die zum Dank rufen."],
          en: ["Humans and jinn have different origins and the same responsibility.", "The two seas with a barrier between them show order in diversity.", "Pearls, coral and ships are gifts that call for gratitude."],
          ar: ["للإنس والجن أصلان مختلفان ومسؤولية واحدة.", "بحران بينهما حاجز، نظام في التنوع.", "اللؤلؤ والمرجان والسفن الكبيرة نعم تستدعي الشكر."],
        },
        takeaway: { de: "Danken Sie heute konkret für eine Gabe aus der Natur, die Sie nutzen.", en: "Today, thank Allah specifically for one gift of nature you use.", ar: "اشكر الله اليوم على نعمة من الطبيعة تنتفع بها." },
        questions: { de: ["Welche Unterschiede zwischen Menschen sehen Sie als Ordnung, nicht als Bedrohung?"], en: ["Which differences between people do you see as order, not threat?"], ar: ["أي اختلاف بين الناس تراه نظامًا لا تهديدًا؟"] },
      },
      {
        from: 26, to: 30,
        title: { de: "Alles vergeht, Er bleibt", en: "All perishes, He remains", ar: "الفناء والبقاء" },
        lessons: {
          de: ["Vergänglichkeit ist hier eine Gnade: Sie öffnet den Weg zur Vergeltung und zum Bleibenden.", "Alle Geschöpfe bitten Ihn; Er ist jeden Tag in neuem Wirken (Vers 29)."],
          en: ["Transience is here a grace: it opens the way to recompense and to what endures.", "All creatures ask of Him; every day He is engaged in some work (verse 29)."],
          ar: ["الفناء هنا نعمة، إذ يفتح الطريق إلى الجزاء والبقاء.", "كل الخلائق تسأله، وهو كل يوم في أمر جديد (الآية 29)."],
        },
        takeaway: { de: "Bringen Sie heute ein konkretes Anliegen bewusst im Bittgebet vor Allah.", en: "Bring one concrete need deliberately before Allah in supplication today.", ar: "ارفع اليوم حاجة محددة إلى الله في الدعاء." },
        questions: { de: ["Woran hängen Sie, als würde es ewig bleiben?"], en: ["What are you attached to as if it would last forever?"], ar: ["بماذا تتعلق كأنه باقٍ؟"] },
      },
      {
        from: 31, to: 45,
        title: { de: "Rechenschaft für Menschen und Dschinn", en: "Accountability for humans and jinn", ar: "حساب الثقلين" },
        lessons: {
          de: ["Allah wird sich den beiden „Gewichtigen“ zur Abrechnung zuwenden.", "Niemand kann den Bereichen von Himmel und Erde entkommen außer mit Ermächtigung (Vers 33).", "Die Übeltäter werden an ihren Merkmalen erkannt; die Warnung selbst ist eine Gnade."],
          en: ["Allah will turn to the two \"weighty\" kinds for reckoning.", "No one can escape the regions of the heavens and earth except with authority (verse 33).", "The wrongdoers are known by their marks; the warning itself is a grace."],
          ar: ["سيتوجه الله إلى حساب الإنس والجن.", "لا يستطيع أحد الخروج من نواحي السماوات والأرض إلا بقوة من الله (الآية 33).", "يُعرف المجرمون بعلاماتهم، والإنذار نفسه نعمة."],
        },
        takeaway: { de: "Nehmen Sie sich heute fünf Minuten für eine ehrliche Selbstprüfung.", en: "Take five minutes today for an honest self-review.", ar: "خصص اليوم خمس دقائق لمحاسبة صادقة لنفسك." },
        questions: { de: ["Warum ist eine Warnung vor dem Feuer selbst eine Gabe?"], en: ["Why is a warning about the Fire itself a gift?"], ar: ["لماذا يُعدّ التحذير من النار نعمة؟"] },
      },
      {
        from: 46, to: 61,
        title: { de: "Zwei Gärten für den, der seinen Herrn fürchtet", en: "Two gardens for those who fear their Lord", ar: "جنتان لمن خشي الوقوف بين يدي ربه" },
        lessons: {
          de: ["Wer das Stehen vor seinem Herrn fürchtet, dem gelten zwei Gärten (Vers 46).", "Die Beschreibung weckt Sehnsucht und Hoffnung als Antrieb zum Guten.", "Die Vergeltung für Gutes ist Gutes (Vers 60)."],
          en: ["Whoever fears standing before their Lord shall have two gardens (verse 46).", "The description awakens longing and hope as a motive for good.", "The reward of excellence is excellence (verse 60)."],
          ar: ["من خشي وقوفه بين يدي ربه فله جنتان (الآية 46).", "الوصف يبعث الشوق والرجاء دافعًا إلى الخير.", "لا يُجزى الإحسان إلا بالإحسان (الآية 60)."],
        },
        takeaway: { de: "Lassen Sie heute eine Sünde, bei der niemand Sie sieht, aus Ehrfurcht vor Allah.", en: "Today, leave one sin no one would see, out of reverence for Allah.", ar: "اترك اليوم معصية لا يراك فيها أحد خشيةً لله." },
        questions: { de: ["Wann haben Sie zuletzt an das Stehen vor Allah gedacht?"], en: ["When did you last think of standing before Allah?"], ar: ["متى تذكرت آخر مرة مقامك بين يدي الله؟"] },
      },
      {
        from: 62, to: 78,
        title: { de: "Zwei weitere Gärten und das Lob des Namens", en: "Two further gardens and the praise of the Name", ar: "جنتان أخريان وتعظيم الاسم" },
        lessons: {
          de: ["Unterhalb der ersten liegen zwei weitere Gärten: Die Ränge im Paradies sind abgestuft.", "Al-Wāqiʿa entfaltet diese Stufen später als die Vorausgehenden und die Leute der Rechten.", "Die Sure endet mit dem Segen des Namens Allahs, des Erhabenen und Ehrwürdigen (Vers 78)."],
          en: ["Below the first lie two further gardens: the ranks of Paradise are graded.", "al-Wāqiʿa later unfolds these grades as the foremost and the people of the right.", "The surah ends by blessing the Name of Allah, Lord of majesty and honour (verse 78)."],
          ar: ["وتحت الجنتين الأوليين جنتان أخريان، فدرجات الجنة متفاضلة.", "وتفصّل الواقعة هذه الدرجات بالسابقين وأصحاب اليمين.", "تُختم السورة بتعظيم اسم الله صاحب العظمة والكرم (الآية 78)."],
        },
        takeaway: { de: "Streben Sie heute in einer Ihrer Pflichten nach der höheren Stufe, nicht nur nach dem Minimum.", en: "Today, aim for the higher degree in one of your duties, not just the minimum.", ar: "اطلب اليوم الدرجة الأعلى في واجب من واجباتك لا الحد الأدنى." },
        questions: { de: ["Geben Sie sich mit der unteren Stufe zufrieden, wo Sie die obere erreichen könnten?"], en: ["Are you content with the lower rank where you could reach the higher?"], ar: ["هل ترضى بالدرجة الدنيا وأنت قادر على العليا؟"] },
      },
    ],
    src: ["ibnKathir", "tabari", "qurtubi", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },

  // ───────────────────────────── 56 al-Wāqiʿa (96) ─────────────────────────────
  {
    s: 56,
    theme: {
      de: "Die Gewissheit des Ereignisses, das alles umwälzt, und die Einteilung der Menschen in drei Gruppen: die Vorausgehenden, die Leute der Rechten und die Leute der Linken. Belege aus dem eigenen Leben (Same, Saat, Wasser, Feuer) entkräften die Leugnung; der Tod selbst ist der erste Beweis.",
      en: "The certainty of the event that overturns everything and the division of people into three groups: the foremost, the people of the right and the people of the left. Proofs from one's own life (seed, crops, water, fire) refute denial; death itself is the first proof.",
      ar: "تحقق القيامة التي تقلب المراتب، وانقسام الناس ثلاثة أصناف: السابقون، وأصحاب اليمين، وأصحاب الشمال. وأدلة من حياة الإنسان (النطفة والزرع والماء والنار) تنقض التكذيب، والموت نفسه أول برهان.",
    },
    context: {
      de: "Mekkanisch, aus der Zeit, in der die Quraysh die Auferstehung und die göttliche Herkunft des Qurʾān bestritten.",
      en: "Meccan, from the time when Quraysh disputed the resurrection and the divine origin of the Qurʾān.",
      ar: "مكية، نزلت حين كانت قريش تجادل في البعث وفي مصدر القرآن.",
    },
    asbab: {
      de: "Zu den Versen 75–82 überliefert Muslim in seinem Ṣaḥīḥ von Ibn ʿAbbās: Als es regnete, sagten manche, der Regen komme von diesem oder jenem Stern; daraufhin wurden diese Verse offenbart. Vers 82 tadelt also, den Dank für Versorgung in Leugnung zu verwandeln.",
      en: "On verses 75–82, Muslim reports in his Ṣaḥīḥ from Ibn ʿAbbās: when it rained, some said the rain came from such-and-such a star, whereupon these verses were revealed. Verse 82 thus rebukes turning thanks for provision into denial.",
      ar: "في الآيات 75–82 روى مسلم في صحيحه عن ابن عباس أنهم مُطروا فقال بعضهم: مُطرنا بنوء كذا، فنزلت هذه الآيات. فالآية 82 تذم جعل شكر الرزق تكذيبًا.",
    },
    connects: {
      de: "al-Raḥmān beschreibt zwei Gartenpaare für zwei Ränge; al-Wāqiʿa benennt diese als Vorausgehende und Leute der Rechten und fügt die Leute der Linken hinzu. Sie endet mit dem Gebot, den Namen des Herrn zu preisen, und al-Ḥadīd beginnt mit dem Preis Allahs durch alles in Himmel und Erde.",
      en: "al-Raḥmān describes two pairs of gardens for two ranks; al-Wāqiʿa names them as the foremost and the people of the right and adds the people of the left. It ends with the command to glorify the Lord's name, and al-Ḥadīd opens with everything in heavens and earth glorifying Allah.",
      ar: "وصفت الرحمن جنتين وجنتين لدرجتين، وسمّتهما الواقعة السابقين وأصحاب اليمين وأضافت أصحاب الشمال. وختمت بالأمر بتسبيح اسم الرب، وافتُتحت الحديد بتسبيح ما في السماوات والأرض لله.",
    },
    lessons: {
      de: [
        "Das Ereignis erniedrigt die einen und erhöht die anderen; weltliche Ränge zählen dort nicht.",
        "Die höchste Gruppe sind die Vorausgehenden: die im Guten vorangingen.",
        "Wer Same, Saat, Wasser und Feuer betrachtet, erkennt, dass er nichts davon selbst erschafft.",
        "Versorgung ist Grund zum Dank, nicht zur Zuschreibung an andere als Allah (Vers 82).",
        "Im Sterben zeigt sich die Ohnmacht des Menschen; danach folgt eines von drei Schicksalen.",
      ],
      en: [
        "The event lowers some and raises others; worldly ranks do not count there.",
        "The highest group are the foremost: those who were first in doing good.",
        "Whoever considers seed, crops, water and fire realises they create none of it themselves.",
        "Provision is a reason for thanks, not for attributing it to other than Allah (verse 82).",
        "Dying reveals human powerlessness; one of three destinies follows.",
      ],
      ar: [
        "يوم القيامة يحطّ أقوامًا ويُعلي آخرين، ولا اعتبار هناك لمراتب الدنيا.",
        "أعلى الأصناف السابقون: الذين سبقوا إلى الخيرات.",
        "من تأمل النطفة والزرع والماء والنار علم أنه لا يخلق شيئًا منها.",
        "الرزق موجب للشكر لا لنسبته إلى غير الله (الآية 82).",
        "عند الاحتضار يظهر عجز الإنسان، ثم يكون أحد مصائر ثلاثة.",
      ],
    },
    questions: {
      de: [
        "Zu welcher der drei Gruppen führt Ihr jetziger Alltag?",
        "In welchem Bereich könnten Sie zu den „Vorausgehenden“ gehören?",
      ],
      en: [
        "Toward which of the three groups is your current daily life leading?",
        "In which area could you be among the \"foremost\"?",
      ],
      ar: [
        "إلى أي الأصناف الثلاثة تقودك حياتك اليومية الآن؟",
        "في أي باب يمكن أن تكون من السابقين؟",
      ],
    },
    sections: [
      {
        from: 1, to: 12,
        title: { de: "Das Ereignis und die drei Gruppen", en: "The event and the three groups", ar: "القيامة والأصناف الثلاثة" },
        lessons: {
          de: ["Niemand kann das Ereignis leugnen, wenn es eintritt.", "Es kehrt Ordnungen um: Erhöhte werden erniedrigt und umgekehrt.", "Die Vorausgehenden sind die Nahegebrachten."],
          en: ["No one can deny the event when it occurs.", "It overturns orders: the exalted are lowered and vice versa.", "The foremost are those brought near."],
          ar: ["لا يملك أحد إنكارها حين تقع.", "تقلب الموازين فيُرفع قوم ويُوضع آخرون.", "السابقون هم أهل القرب من الله."],
        },
        takeaway: { de: "Erledigen Sie heute eine gute Tat sofort, statt sie aufzuschieben.", en: "Do one good deed today immediately instead of postponing it.", ar: "بادر اليوم إلى عمل صالح ولا تؤجله." },
        questions: { de: ["Nach welchen Maßstäben bewerten Sie den Rang von Menschen?"], en: ["By what standards do you judge people's rank?"], ar: ["بأي معيار تقيس منازل الناس؟"] },
      },
      {
        from: 13, to: 26,
        title: { de: "Die Vorausgehenden", en: "The foremost", ar: "السابقون" },
        lessons: {
          de: ["Viele von ihnen stammen aus den Früheren, wenige aus den Späteren: Vorangehen ist selten.", "Ihr Lohn ist Nähe, Ruhe und Frieden; dort gibt es kein leeres und kein sündiges Gerede (Verse 25–26)."],
          en: ["Many of them are from the earlier generations, few from the later: being foremost is rare.", "Their reward is nearness, rest and peace; there is no idle or sinful talk there (verses 25–26)."],
          ar: ["أكثرهم من الأمم الأولى وقليل منهم من المتأخرين، فالسبق عزيز.", "جزاؤهم القرب والنعيم والسلام، ولا كلام باطل هناك ولا إثم (الآيتان 25–26)."],
        },
        takeaway: { de: "Verzichten Sie heute einen Tag lang bewusst auf leeres Gerede.", en: "Today, deliberately refrain from idle talk for a whole day.", ar: "اجتنب اللغو اليوم يومًا كاملًا عن قصد." },
        questions: { de: ["Wie viel Ihres Redens ist „leeres Gerede“?"], en: ["How much of your speech is idle talk?"], ar: ["كم من كلامك لغو؟"] },
      },
      {
        from: 27, to: 40,
        title: { de: "Die Leute der Rechten", en: "The people of the right", ar: "أصحاب اليمين" },
        lessons: {
          de: ["Auch die Leute der Rechten erhalten reiche Gnade, wenn auch unter den Vorausgehenden.", "Sie sind zahlreich aus Früheren und Späteren: Die Tür bleibt für jede Generation offen."],
          en: ["The people of the right also receive abundant grace, though below the foremost.", "They are many from the earlier and later generations: the door stays open for every generation."],
          ar: ["أصحاب اليمين في نعيم واسع وإن كانوا دون السابقين.", "كثير منهم من الأولين وكثير من المتأخرين، فالباب مفتوح لكل جيل."],
        },
        takeaway: { de: "Halten Sie heute an einer verlässlichen Pflicht fest, auch wenn sie unscheinbar ist.", en: "Today, hold firmly to one reliable duty, even if it seems unremarkable.", ar: "حافظ اليوم على فريضة ثابتة ولو بدت يسيرة." },
        questions: { de: ["Macht Ihnen die Offenheit dieser Tür Hoffnung oder Bequemlichkeit?"], en: ["Does this open door give you hope or complacency?"], ar: ["هل يبعث فيك انفتاح هذا الباب رجاءً أم تهاونًا؟"] },
      },
      {
        from: 41, to: 56,
        title: { de: "Die Leute der Linken", en: "The people of the left", ar: "أصحاب الشمال" },
        lessons: {
          de: ["Ihr Zustand ist das Gegenbild: Hitze, Rauch und Durst statt Schatten und Wasser.", "Ursache: Sie lebten im Überfluss, beharrten auf schwerer Sünde und leugneten die Auferstehung (Verse 45–47)."],
          en: ["Their state is the opposite image: heat, smoke and thirst instead of shade and water.", "The cause: they lived in luxury, persisted in grave sin and denied the resurrection (verses 45–47)."],
          ar: ["حالهم صورة مقابلة: ريح حارة وماء مغلي ودخان أسود بدل الظل والماء البارد.", "السبب: عاشوا في الترف، وأصرّوا على الذنب العظيم، وأنكروا البعث (الآيات 45–47)."],
        },
        takeaway: { de: "Prüfen Sie, ob ein Luxus in Ihrem Leben Sie von Allah ablenkt.", en: "Examine whether some luxury in your life distracts you from Allah.", ar: "انظر هل في حياتك ترف يشغلك عن الله." },
        questions: { de: ["Auf welcher Gewohnheit beharren Sie, obwohl Sie wissen, dass sie falsch ist?"], en: ["Which habit do you persist in although you know it is wrong?"], ar: ["على أي عادة تُصرّ وأنت تعلم خطأها؟"] },
      },
      {
        from: 57, to: 74,
        title: { de: "Same, Saat, Wasser, Feuer", en: "Seed, crops, water, fire", ar: "النطفة والزرع والماء والنار" },
        lessons: {
          de: ["Vier Fragen aus dem Alltag: Erschaffen Sie das, oder ist Allah der Erschaffer?", "Die erste Erschaffung beweist die zweite (Vers 62).", "Die Fragen münden in den Auftrag, den Namen des gewaltigen Herrn zu preisen (Vers 74)."],
          en: ["Four questions from daily life: do you create this, or is Allah the Creator?", "The first creation proves the second (verse 62).", "The questions lead to the command to glorify the name of the Lord, the Magnificent (verse 74)."],
          ar: ["أربعة أسئلة من الحياة اليومية: هل الإنسان يخلق هذا أم الله هو الخالق؟", "النشأة الأولى دليل على الأخرى (الآية 62).", "تنتهي الأسئلة بالأمر بتسبيح اسم الرب العظيم (الآية 74)."],
        },
        takeaway: { de: "Preisen Sie Allah heute beim Trinken eines Glases Wasser bewusst.", en: "Glorify Allah consciously today when drinking a glass of water.", ar: "سبّح الله اليوم عن وعي حين تشرب كأس ماء." },
        questions: { de: ["Welche Ihrer täglichen Versorgungen halten Sie für Ihr eigenes Werk?"], en: ["Which of your daily provisions do you regard as your own work?"], ar: ["أي رزق يومي تعدّه من صنعك أنت؟"] },
      },
      {
        from: 75, to: 82,
        title: { de: "Der Schwur und der edle Qurʾān", en: "The oath and the noble Qurʾān", ar: "القسم والقرآن الكريم" },
        lessons: {
          de: ["Allah schwört bei den Positionen der Sterne; ein gewaltiger Schwur für einen gewaltigen Inhalt.", "Der Qurʾān ist edel und in einem verwahrten Buch; die Gelehrten deuten die „Gereinigten“ in Vers 79 auf die Engel, viele leiten daraus auch Ehrfurcht im Umgang mit dem Muṣḥaf ab.", "Die Versorgung mit Leugnung zu beantworten, ist Undank (Vers 82)."],
          en: ["Allah swears by the positions of the stars; a mighty oath for a mighty content.", "The Qurʾān is noble and in a guarded book; scholars interpret the \"purified\" of verse 79 as the angels, and many also derive reverence in handling the muṣḥaf from it.", "Answering provision with denial is ingratitude (verse 82)."],
          ar: ["أقسم الله بمواقع النجوم، قسم عظيم لمقسَم عليه عظيم.", "القرآن كريم محفوظ في كتاب مصون، وفسّر كثيرون المطهرين في الآية 79 بالملائكة، واستنبط كثيرون منها تعظيم المصحف.", "مقابلة الرزق بالتكذيب كفران (الآية 82)."],
        },
        takeaway: { de: "Wenn es heute regnet oder Ihnen etwas gelingt, schreiben Sie es ausdrücklich Allahs Gnade zu.", en: "When it rains or something succeeds for you today, explicitly attribute it to Allah's grace.", ar: "إذا نزل المطر أو تيسر لك أمر اليوم فانسبه صراحة إلى فضل الله." },
        questions: { de: ["Mit welcher Haltung berühren und öffnen Sie den Qurʾān?"], en: ["With what attitude do you touch and open the Qurʾān?"], ar: ["بأي حال تمسّ المصحف وتفتحه؟"] },
      },
      {
        from: 83, to: 96,
        title: { de: "Die Stunde des Todes", en: "The hour of death", ar: "ساعة الاحتضار" },
        lessons: {
          de: ["Wenn die Seele die Kehle erreicht, kann niemand sie zurückholen; Allah ist näher als die Anwesenden.", "Die drei Gruppen erscheinen hier im Sterben wieder: Ruhe und Wohlgeruch, Gruß des Friedens oder Glut.", "Die Sure schließt mit der Gewissheit und dem Preis des gewaltigen Herrn (Verse 95–96)."],
          en: ["When the soul reaches the throat no one can bring it back; Allah is nearer than those present.", "The three groups reappear at death: rest and fragrance, a greeting of peace, or blazing fire.", "The surah closes with certainty and the glorification of the Lord, the Magnificent (verses 95–96)."],
          ar: ["إذا بلغت الروح الحلق لم يملك أحد ردّها، والله أقرب من الحاضرين.", "تعود الأصناف الثلاثة عند الموت: راحة وطيب، أو تحية سلام، أو عذاب حار.", "تُختم السورة بتقرير أن هذا هو اليقين، وبالأمر بتسبيح الله العظيم (الآيتان 95–96)."],
        },
        takeaway: { de: "Bringen Sie heute eine offene Sache in Ordnung, die Sie nicht unerledigt hinterlassen möchten.", en: "Today, settle one open matter you would not want to leave unfinished.", ar: "أصلح اليوم أمرًا معلقًا لا تحب أن تتركه وراءك." },
        questions: { de: ["Wenn heute Ihr letzter Tag wäre: Zu welcher Gruppe würden Sie hoffen zu gehören, und was fehlt dafür?"], en: ["If today were your last day: which group would you hope to belong to, and what is missing?"], ar: ["لو كان اليوم آخر أيامك: من أي صنف ترجو أن تكون، وما الذي ينقصك؟"] },
      },
    ],
    src: ["ibnKathir", "tabari", "qurtubi", "saadi", "biqai", "ibnAshur", "wahidi"],
    review: DRAFT,
  },

  // ───────────────────────────── 67 al-Mulk (30) ─────────────────────────────
  {
    s: 67,
    theme: {
      de: "Allahs uneingeschränkte Herrschaft über alles und der Zweck des Lebens: Er schuf Tod und Leben, um zu prüfen, wer am besten handelt. Die vollkommene Schöpfung ruft zum Nachdenken, das Feuer warnt die, die nicht hören und nicht nachdenken wollten.",
      en: "Allah's absolute dominion over everything and the purpose of life: He created death and life to test who acts best. The flawless creation calls to reflection; the Fire warns those who would neither listen nor reason.",
      ar: "ملك الله المطلق وغاية الحياة: خلق الموت والحياة ليختبر الناس أيهم أفضل عملًا. وإتقان الخلق يدعو إلى التفكر، والنار نذير لمن لم يسمع ولم يعقل.",
    },
    context: {
      de: "Mekkanisch. Zu ihrem Vorzug überliefern al-Tirmidhī (als ḥasan eingestuft), Abū Dāwūd, Ibn Māja und Aḥmad von Abū Hurayra, eine Sure von dreißig Versen habe für einen Mann Fürsprache eingelegt, bis ihm vergeben wurde. Al-Tirmidhī berichtet auch, der Prophet ﷺ habe nicht geschlafen, bevor er al-Sajda und al-Mulk rezitierte; die Bewertung dieser Kette ist umstritten.",
      en: "Meccan. On its virtue, al-Tirmidhī (graded ḥasan), Abū Dāwūd, Ibn Māja and Aḥmad report from Abū Hurayra that a surah of thirty verses interceded for a man until he was forgiven. al-Tirmidhī also reports that the Prophet ﷺ would not sleep before reciting al-Sajda and al-Mulk; the grading of that chain is disputed.",
      ar: "مكية. وفي فضلها روى الترمذي (وحسّنه) وأبو داود وابن ماجه وأحمد عن أبي هريرة أن سورة من ثلاثين آية شفعت لرجل حتى غُفر له. وروى الترمذي أن النبي ﷺ كان لا ينام حتى يقرأ السجدة وتبارك، وفي الحكم على إسناده خلاف.",
    },
    connects: {
      de: "al-Taḥrīm endet mit Beispielen von Frauen, deren Ausgang allein von ihrem Glauben und Handeln abhing; al-Mulk nennt den Grundsatz dahinter: Leben ist Prüfung des Handelns. Es folgt al-Qalam, das den Charakter des Propheten ﷺ gegen die Verleumdungen der Leugner verteidigt.",
      en: "al-Taḥrīm ends with examples of women whose fate depended only on their own faith and deeds; al-Mulk states the principle behind it: life is a test of conduct. al-Qalam follows, defending the Prophet's ﷺ character against the slanders of the deniers.",
      ar: "ختمت التحريم بأمثلة نساء كان مصيرهن بإيمانهن وعملهن، وقررت الملك الأصل في ذلك: الحياة ابتلاء للعمل. وتليها القلم في الدفاع عن خُلق النبي ﷺ أمام افتراء المكذبين.",
    },
    lessons: {
      de: [
        "Maßstab ist das beste, nicht das meiste Handeln (Vers 2).",
        "Die fehlerlose Schöpfung lädt ein, immer wieder hinzuschauen.",
        "Hören und Verstehen sind Gaben, die schützen, wenn man sie nutzt (Vers 10).",
        "Die Erde ist dienstbar gemacht; Versorgung suchen und sich der Rückkehr zu Allah bewusst bleiben (Vers 15).",
        "Alles, auch das Wasser, das wir trinken, hängt allein an Allah (Vers 30).",
      ],
      en: [
        "The standard is the best deeds, not the most (verse 2).",
        "The flawless creation invites one to look again and again.",
        "Hearing and understanding are gifts that protect when used (verse 10).",
        "The earth is made subservient; seek provision while staying mindful of the return to Allah (verse 15).",
        "Everything, even the water we drink, depends on Allah alone (verse 30).",
      ],
      ar: [
        "المعيار أحسن العمل لا أكثره (الآية 2).",
        "الخلق المتقن يدعو إلى تكرار النظر.",
        "السمع والعقل نعمتان تنجّيان لمن أعملهما (الآية 10).",
        "الأرض مسخّرة، فاطلب الرزق مع استحضار النشور إلى الله (الآية 15).",
        "كل شيء، حتى الماء الذي نشربه، بيد الله وحده (الآية 30).",
      ],
    },
    questions: {
      de: [
        "Was würde sich ändern, wenn Sie Ihren Tag nach „am besten“ statt nach „am meisten“ planen?",
        "Wann haben Sie zuletzt wirklich zugehört und nachgedacht, bevor Sie geurteilt haben?",
      ],
      en: [
        "What would change if you planned your day by \"best\" rather than \"most\"?",
        "When did you last truly listen and reflect before judging?",
      ],
      ar: [
        "ما الذي سيتغير لو خططت يومك على الأحسن لا الأكثر؟",
        "متى استمعت وتفكرت حقًا قبل أن تحكم؟",
      ],
    },
    sections: [
      {
        from: 1, to: 5,
        title: { de: "Herrschaft, Leben als Prüfung, makelloser Himmel", en: "Dominion, life as a test, a flawless sky", ar: "الملك والابتلاء والسماء المتقنة" },
        lessons: {
          de: ["In Allahs Hand ist die Herrschaft; Er ist zu allem fähig.", "Tod und Leben sind erschaffen, um das beste Handeln zu prüfen (Vers 2).", "Der Blick in den Himmel findet keinen Riss, so oft er sich wiederholt."],
          en: ["In Allah's hand is dominion; He has power over all things.", "Death and life are created to test the best conduct (verse 2).", "Looking at the sky finds no rift, however often it is repeated."],
          ar: ["الملك كله لله، وقدرته شاملة.", "خُلق الموت والحياة للابتلاء بأحسن العمل (الآية 2).", "النظر في السماء لا يجد شقًا ولا خللًا مهما تكرر."],
        },
        takeaway: { de: "Wählen Sie heute eine Aufgabe und machen Sie sie bewusst so gut wie möglich.", en: "Choose one task today and do it consciously as well as you can.", ar: "اختر اليوم عملًا واحدًا وأتقنه قدر استطاعتك." },
        questions: { de: ["Was ist für Sie „das beste Handeln“ in Ihrer jetzigen Lebenslage?"], en: ["What is \"the best conduct\" for you in your present situation?"], ar: ["ما أحسن العمل في حالك الآن؟"] },
      },
      {
        from: 6, to: 11,
        title: { de: "Das Feuer und das späte Eingeständnis", en: "The Fire and the late admission", ar: "النار والاعتراف المتأخر" },
        lessons: {
          de: ["Die Wächter fragen: Kam kein Warner zu euch? Die Warnung war da.", "Das Eingeständnis: Hätten wir gehört oder nachgedacht (Vers 10). Hören und Denken hätten gerettet.", "Ein Bekenntnis, das zu spät kommt, nützt nicht mehr."],
          en: ["The keepers ask: did no warner come to you? The warning was there.", "The admission: had we listened or reasoned (verse 10). Listening and thinking would have saved them.", "A confession that comes too late no longer helps."],
          ar: ["يسأل خزنة النار أهلها: هل جاءكم من ينذركم؟ فقد بلغهم الإنذار.", "يعترفون بأنهم لو استمعوا أو تفكروا لنجوا (الآية 10)، فالسمع والعقل سبيل النجاة.", "الاعتراف بعد فوات الأوان لا ينفع."],
        },
        takeaway: { de: "Hören Sie heute einer Ermahnung ganz zu, bevor Sie innerlich widersprechen.", en: "Today, listen to a reminder fully before inwardly objecting.", ar: "استمع اليوم إلى موعظة كاملة قبل أن تعترض في نفسك." },
        questions: { de: ["Welche Warnung in Ihrem Leben haben Sie gehört, aber nicht durchdacht?"], en: ["Which warning in your life have you heard but not thought through?"], ar: ["أي نذير في حياتك سمعته ولم تتدبره؟"] },
      },
      {
        from: 12, to: 14,
        title: { de: "Ehrfurcht im Verborgenen", en: "Reverence in the unseen", ar: "خشية الغيب" },
        lessons: {
          de: ["Wer seinen Herrn im Verborgenen fürchtet, erhält Vergebung und großen Lohn.", "Ob leise oder laut gesprochen: Wer erschaffen hat, weiß um das Innere (Vers 14)."],
          en: ["Whoever fears their Lord unseen receives forgiveness and great reward.", "Whether spoken quietly or aloud: He who created knows the inner self (verse 14)."],
          ar: ["من خاف ربه في السر فله المغفرة والأجر العظيم.", "سواء أخفى الإنسان كلامه أم أعلنه، فالخالق يعلم ما في القلوب (الآية 14)."],
        },
        takeaway: { de: "Achten Sie heute auf einen Gedanken oder ein Wort, das nur Allah mitbekommt.", en: "Today, pay attention to one thought or word that only Allah perceives.", ar: "راقب اليوم خاطرًا أو كلمة لا يطلع عليها إلا الله." },
        questions: { de: ["Verhalten Sie sich allein anders als vor anderen?"], en: ["Do you behave differently alone than in front of others?"], ar: ["هل يختلف سلوكك في الخلوة عنه أمام الناس؟"] },
      },
      {
        from: 15, to: 19,
        title: { de: "Die dienstbare Erde und die Vögel", en: "The subservient earth and the birds", ar: "الأرض المسخّرة والطير" },
        lessons: {
          de: ["Die Erde trägt uns gefügig; wir sollen auf ihr gehen und Versorgung suchen (Vers 15).", "Sicherheit auf der Erde ist nicht selbstverständlich; Allah könnte sie erschüttern.", "Die Vögel, die mit ausgebreiteten Flügeln schweben, hält allein der Allerbarmer (Vers 19)."],
          en: ["The earth carries us tamely; we are to walk on it and seek provision (verse 15).", "Safety on the earth is not a given; Allah could shake it.", "The birds gliding with outspread wings are held up by none but the Most Merciful (verse 19)."],
          ar: ["الأرض مسخّرة لنا، فنسير فيها ونطلب الرزق (الآية 15).", "الأمن على الأرض ليس مضمونًا، فالله قادر على أن يزلزلها.", "الطيور تبسط أجنحتها وتقبضها، ولا يحفظها في الجو إلا الرحمن (الآية 19)."],
        },
        takeaway: { de: "Gehen Sie heute Ihrer Arbeit nach und sagen Sie sich dabei bewusst: Die Versorgung kommt von Allah.", en: "Go about your work today while consciously telling yourself: provision comes from Allah.", ar: "امضِ إلى عملك اليوم مستحضرًا أن الرزق من الله." },
        questions: { de: ["Was „hält“ Sie in Ihrem Leben, ohne dass Sie es bemerken?"], en: ["What \"holds you up\" in your life without your noticing?"], ar: ["ما الذي يمسكك في حياتك دون أن تشعر؟"] },
      },
      {
        from: 20, to: 24,
        title: { de: "Wer hilft, wer versorgt? Gebeugt oder aufrecht", en: "Who helps, who provides? Bent over or upright", ar: "من ينصر ومن يرزق؟ منكبّ أم مستقيم" },
        lessons: {
          de: ["Kein Heer und kein Versorger außer Allah; Vertrauen auf andere ist Täuschung.", "Wer gebeugt auf dem Gesicht geht, sieht den Weg nicht; wer aufrecht auf geradem Weg geht, ist besser geleitet (Vers 22).", "Gehör, Augen und Herzen sind gegeben, doch wenige danken (Vers 23)."],
          en: ["There is no army and no provider other than Allah; trusting others is delusion.", "One who walks bent over on his face does not see the way; one who walks upright on a straight path is better guided (verse 22).", "Hearing, sight and hearts are given, yet few give thanks (verse 23)."],
          ar: ["لا جند ولا رازق إلا الله، والاعتماد على غيره غرور.", "من يمشي منكبًّا على وجهه لا يرى طريقه، ومن يمشي مستقيمًا على طريق واضح أهدى (الآية 22).", "أعطانا الله السمع والبصر والقلوب، وقليل من يشكر (الآية 23)."],
        },
        takeaway: { de: "Nutzen Sie heute Augen, Ohren oder Verstand für etwas, das Allah gefällt, als Dank.", en: "Use your eyes, ears or mind today for something pleasing to Allah, as thanks.", ar: "استعمل اليوم بصرك أو سمعك أو عقلك فيما يرضي الله شكرًا." },
        questions: { de: ["In welchem Bereich gehen Sie „mit gesenktem Kopf“, ohne den Weg zu sehen?"], en: ["In which area are you walking \"head down\" without seeing the path?"], ar: ["في أي أمر تمشي منكبًّا لا ترى الطريق؟"] },
      },
      {
        from: 25, to: 30,
        title: { de: "Wann ist das Versprechen? Und wenn das Wasser versickert", en: "When is the promise? And if the water sinks away", ar: "موعد الساعة والماء الغائر" },
        lessons: {
          de: ["Das Wissen um die Stunde ist allein bei Allah; der Prophet ﷺ ist nur ein deutlicher Warner.", "Der Gläubige stützt sich auf den Allerbarmer und vertraut auf Ihn (Vers 29).", "Die Schlussfrage nach dem versickerten Wasser lässt jeden seine völlige Abhängigkeit spüren (Vers 30)."],
          en: ["Knowledge of the Hour is with Allah alone; the Prophet ﷺ is only a clear warner.", "The believer relies on the Most Merciful and trusts in Him (verse 29).", "The closing question about the sunken water makes everyone feel their complete dependence (verse 30)."],
          ar: ["علم الساعة عند الله، والنبي ﷺ منذر واضح البلاغ.", "المؤمن يعتمد على الرحمن ويتوكل عليه (الآية 29).", "السؤال الختامي عن الماء الغائر يُشعر كل أحد بافتقاره التام (الآية 30)."],
        },
        takeaway: { de: "Rezitieren Sie al-Mulk heute Abend vor dem Schlafen und denken Sie bei Vers 30 an Ihr eigenes Wasser.", en: "Recite al-Mulk tonight before sleeping and, at verse 30, think of your own water.", ar: "اقرأ الملك الليلة قبل النوم، وتذكّر عند الآية 30 ماءك أنت." },
        questions: { de: ["Worauf verlassen Sie sich, als könne es Ihnen nie genommen werden?"], en: ["What do you rely on as though it could never be taken from you?"], ar: ["على أي شيء تعتمد كأنه لا يُسلب منك أبدًا؟"] },
      },
    ],
    src: ["ibnKathir", "tabari", "qurtubi", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
];
