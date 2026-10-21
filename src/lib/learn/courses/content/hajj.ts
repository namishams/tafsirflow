// mirrors mobile/src/features/courses/content/hajj.ts (copied for the website; keep both in step)
import type { Course } from "../types";

// Hajj and Umrah guide. Descriptive; no Quran or hadith text is typed here, verses are loaded by key.
// Details of the rites differ between the schools; the course points this out and refers to the group's scholar.

export const HAJJ: Course = {
  id: "hajj",
  word: "الحج",
  free: 1,
  title: { en: "Hajj & Umrah guide", de: "Leitfaden für Hadsch und Umra", ar: "دليل الحج والعمرة" },
  lead: {
    en: "From ihram to the farewell tawaf: the rites of Umrah and Hajj day by day, and the visit to Madinah.",
    de: "Vom Ihram bis zum Abschieds-Tawaf: die Riten von Umra und Hadsch Tag für Tag und der Besuch in Medina.",
    ar: "من الإحرام إلى طواف الوداع: مناسك العمرة والحج يومًا بيوم، وزيارة المدينة.",
  },
  note: {
    en: "This is a descriptive guide. Rulings and details differ between the schools; please follow the scholar or guide of your group.",
    de: "Dies ist ein beschreibender Leitfaden. Bestimmungen und Einzelheiten unterscheiden sich zwischen den Rechtsschulen; bitte folgen Sie dem Gelehrten oder Leiter Ihrer Gruppe.",
    ar: "هذا دليل وصفي. تختلف الأحكام والتفاصيل بين المذاهب؛ فاتبعوا عالم مجموعتكم أو مرشدها.",
  },
  lessons: [
    {
      id: "j01-meaning",
      title: { en: "Meaning and obligation of Hajj", de: "Bedeutung und Pflicht des Hadsch", ar: "معنى الحج وفرضيته" },
      body: {
        en: "Hajj literally means to set out for a goal. In Islamic law it is the journey to the Sacred House in Makkah at a fixed time to perform specific rites. It is one of the five pillars of Islam.\n\n## Who must perform it\nAl Imran 3:97 makes Hajj a duty owed to Allah by everyone who is able to find a way to the House. Scholars derive the conditions:\n- Muslim, adult and of sound mind\n- free\n- **able**: healthy enough, with the means for the journey and for the family left behind, and a safe route\n- for women, many schools add travelling with a mahram or, in some views, a safe group\n\nIt is obligatory **once in a lifetime**; further Hajj is voluntary. Schools differ on whether it must be done as soon as one is able.\n\n## Roots in Ibrahim\nThe Quran links the House with Ibrahim and Ismail (2:127) and tells Ibrahim to call people to pilgrimage (22:27). The rites recall their story and the trust of Hajar.\n\n## Umrah\nUmrah, the lesser pilgrimage, can be done at any time of the year. Its ruling differs: some schools see it as obligatory once, others as a strongly recommended sunnah.",
        de: "Hadsch bedeutet wörtlich, sich zu einem Ziel aufzumachen. Im islamischen Recht ist es die Reise zum Heiligen Haus in Mekka zu einer festen Zeit, um bestimmte Riten zu vollziehen. Es ist eine der fünf Säulen des Islam.\n\n## Wer ihn vollziehen muss\nAl Imran 3:97 macht den Hadsch zu einer Pflicht gegenüber Allah für jeden, der einen Weg zum Haus findet. Gelehrte leiten daraus Bedingungen ab:\n- muslimisch, erwachsen und bei Verstand\n- frei\n- **fähig**: gesund genug, mit Mitteln für die Reise und für die zurückbleibende Familie, und mit sicherem Weg\n- für Frauen verlangen viele Schulen die Reise mit einem Mahram oder, nach manchen Ansichten, mit einer sicheren Gruppe\n\nEr ist **einmal im Leben** Pflicht; weitere Pilgerfahrten sind freiwillig. Die Schulen unterscheiden sich darin, ob er sofort zu vollziehen ist, sobald man fähig ist.\n\n## Wurzeln bei Ibrahim\nDer Koran verbindet das Haus mit Ibrahim und Ismail (2:127) und fordert Ibrahim auf, die Menschen zur Pilgerfahrt zu rufen (22:27). Die Riten erinnern an ihre Geschichte und an das Gottvertrauen Hadschars.\n\n## Umra\nDie Umra, die kleine Pilgerfahrt, ist das ganze Jahr möglich. Ihre Bestimmung ist unterschiedlich: Manche Schulen halten sie einmal für Pflicht, andere für eine stark empfohlene Sunna.",
        ar: "الحج في اللغة القصد، وفي الشرع قصد البيت الحرام بمكة في وقت مخصوص لأداء مناسك مخصوصة، وهو ركن من أركان الإسلام الخمسة.\n\n## على من يجب\nتجعل آية آل عمران 3:97 الحج حقًا لله على من استطاع إليه سبيلًا. واستنبط العلماء شروطه:\n- الإسلام والبلوغ والعقل\n- الحرية\n- **الاستطاعة**: صحة البدن، والنفقة للسفر ولمن يعول، وأمن الطريق\n- وللمرأة يشترط كثير من المذاهب المحرم، ويكتفي بعضها بالرفقة المأمونة\n\nوهو واجب **مرة في العمر**، وما زاد فتطوع. واختلفت المذاهب في وجوبه على الفور أو التراخي.\n\n## صلته بإبراهيم\nيربط القرآن البيت بإبراهيم وإسماعيل (2:127)، ويأمر إبراهيم أن يؤذّن في الناس بالحج (22:27)، والمناسك تذكّر بقصتهما وبتوكل هاجر.\n\n## العمرة\nالعمرة هي الحج الأصغر، وتجوز في كل وقت من السنة. واختلف في حكمها: فمن المذاهب من يوجبها مرة، ومنها من يراها سنة مؤكدة.",
      },
      verses: ["3:97", "2:127", "22:27"],
      tags: ["consensus", "varies"],
      quiz: [
        {
          q: { en: "How often is Hajj obligatory for someone who is able?", de: "Wie oft ist der Hadsch für jemanden Pflicht, der fähig ist?", ar: "كم مرة يجب الحج على المستطيع؟" },
          options: [
            { en: "Every year", de: "Jedes Jahr", ar: "كل عام" },
            { en: "Every five years", de: "Alle fünf Jahre", ar: "كل خمس سنين" },
            { en: "Never, it is always voluntary", de: "Nie, er ist immer freiwillig", ar: "لا يجب أبدًا" },
            { en: "Once in a lifetime", de: "Einmal im Leben", ar: "مرة في العمر" },
          ],
          answer: 3,
          explain: { en: "Hajj is obligatory once; further Hajj is voluntary.", de: "Der Hadsch ist einmal Pflicht; weitere sind freiwillig.", ar: "يجب الحج مرة، وما زاد فتطوع." },
        },
        {
          q: { en: "Which verse makes Hajj a duty for those able to find a way?", de: "Welcher Vers macht den Hadsch zur Pflicht für die, die einen Weg finden?", ar: "أي آية تجعل الحج على من استطاع إليه سبيلًا؟" },
          options: [
            { en: "2:255", de: "2:255", ar: "2:255" },
            { en: "3:97", de: "3:97", ar: "3:97" },
            { en: "97:1", de: "97:1", ar: "97:1" },
            { en: "1:5", de: "1:5", ar: "1:5" },
          ],
          answer: 1,
          explain: { en: "Al Imran 3:97 states the obligation with the condition of ability.", de: "Al Imran 3:97 nennt die Pflicht mit der Bedingung der Fähigkeit.", ar: "آل عمران 3:97 تقرر الفريضة بشرط الاستطاعة." },
        },
        {
          q: { en: "What does ability (istita'ah) include?", de: "Was gehört zur Fähigkeit (Istita'a)?", ar: "ماذا تشمل الاستطاعة؟" },
          options: [
            { en: "Health, means for the journey and family, and a safe route", de: "Gesundheit, Mittel für Reise und Familie und ein sicherer Weg", ar: "الصحة والنفقة للسفر والعيال وأمن الطريق" },
            { en: "Knowing Arabic fluently", de: "Fließend Arabisch sprechen", ar: "إتقان العربية" },
            { en: "Having memorised the whole Quran", de: "Den ganzen Koran auswendig können", ar: "حفظ القرآن كاملًا" },
            { en: "Being older than sixty", de: "Älter als sechzig sein", ar: "تجاوز الستين" },
          ],
          answer: 0,
          explain: { en: "Ability is physical, financial and practical.", de: "Fähigkeit ist körperlich, finanziell und praktisch.", ar: "الاستطاعة بدنية ومالية وعملية." },
        },
      ],
    },
    {
      id: "j02-ihram-miqat",
      title: { en: "Ihram and miqat", de: "Ihram und Miqat", ar: "الإحرام والميقات" },
      body: {
        en: "**Ihram** is the state a pilgrim enters with the intention of Umrah or Hajj. The **miqat** is the boundary at which this must happen.\n\n## The places of miqat\n- **Dhul-Hulayfah** (Abyar Ali) for those coming from Madinah\n- **al-Juhfah** (today usually from Rabigh) for those from Syria, Egypt and the west\n- **Qarn al-Manazil** for those from Najd\n- **Yalamlam** for those from Yemen\n- **Dhat Irq** for those from Iraq\nThose living inside these boundaries enter ihram from where they are. Air travellers enter ihram on the plane or before, when passing the line of a miqat.\n\n## Before and at ihram\nMany scholars recommend a bath, trimming nails and hair, and perfume on the body before the intention. Men wear two unstitched white cloths; women wear normal modest clothing without face veil or gloves according to most. Then the intention is made and the **talbiyah** is recited often.\n\n## Restrictions in ihram\nAmong them: no perfume, cutting hair or nails, hunting, marriage contracts or marital relations; for men no stitched clothing or head cover. Hajj months and conduct are mentioned in 2:197. Violations may require compensation, and the details differ between schools.",
        de: "**Ihram** ist der Zustand, in den ein Pilger mit der Absicht der Umra oder des Hadsch eintritt. Der **Miqat** ist die Grenze, an der dies geschehen muss.\n\n## Die Miqat-Orte\n- **Dhul-Hulaifa** (Abyar Ali) für Reisende aus Medina\n- **al-Dschuhfa** (heute meist von Rabigh aus) für Reisende aus Syrien, Ägypten und dem Westen\n- **Qarn al-Manazil** für Reisende aus dem Nadschd\n- **Yalamlam** für Reisende aus dem Jemen\n- **Dhat Irq** für Reisende aus dem Irak\nWer innerhalb dieser Grenzen wohnt, treten Sie dort in den Ihram ein, wo er ist. Flugreisende treten im Flugzeug oder vorher in den Ihram ein, wenn sie die Linie eines Miqat überqueren.\n\n## Vor und beim Ihram\nViele Gelehrte empfehlen vor der Absicht eine Ganzkörperwaschung, das Kürzen von Nägeln und Haaren sowie Duft am Körper. Männer tragen zwei ungenähte weiße Tücher; Frauen tragen gewöhnliche bedeckende Kleidung, nach den meisten ohne Gesichtsschleier und Handschuhe. Dann wird die Absicht gefasst und häufig die **Talbiya** gesprochen.\n\n## Verbote im Ihram\nDazu gehören: kein Parfüm, kein Schneiden von Haaren oder Nägeln, keine Jagd, kein Eheschluss und kein ehelicher Verkehr; für Männer keine genähte Kleidung und keine Kopfbedeckung. Die Hadsch-Monate und das Verhalten werden in 2:197 erwähnt. Verstöße können eine Ausgleichsleistung erfordern; die Einzelheiten unterscheiden sich zwischen den Schulen.",
        ar: "**الإحرام** نية الدخول في النسك من عمرة أو حج، و**الميقات** هو الحد الذي يجب الإحرام عنده.\n\n## المواقيت المكانية\n- **ذو الحليفة** (أبيار علي) لأهل المدينة ومن مرّ بها\n- **الجحفة** (ويُحرم اليوم من رابغ غالبًا) لأهل الشام ومصر والمغرب\n- **قرن المنازل** لأهل نجد\n- **يلملم** لأهل اليمن\n- **ذات عرق** لأهل العراق\nومن كان دون المواقيت فميقاته من حيث أنشأ. ويُحرم المسافر جوًا في الطائرة أو قبلها عند محاذاة الميقات.\n\n## قبل الإحرام وعنده\nيستحب كثير من العلماء الاغتسال، وتقليم الأظفار وأخذ الشعر، والتطيب في البدن قبل النية. ويلبس الرجل إزارًا ورداءً أبيضين غير مخيطين، وتلبس المرأة ثيابها الساترة المعتادة دون نقاب أو قفازين عند الأكثر. ثم ينوي ويُكثر من **التلبية**.\n\n## محظورات الإحرام\nمنها: الطيب، وأخذ الشعر والأظفار، والصيد، وعقد النكاح والجماع، وعلى الرجل لبس المخيط وتغطية الرأس. وتذكر الآية 2:197 أشهر الحج وآدابه. وقد يلزم من وقع في محظور فديةٌ، وتختلف التفاصيل بين المذاهب.",
      },
      verses: ["2:197"],
      tags: ["consensus", "varies"],
      quiz: [
        {
          q: { en: "What is the miqat?", de: "Was ist der Miqat?", ar: "ما الميقات؟" },
          options: [
            { en: "The black cloth of the Kaaba", de: "Das schwarze Tuch der Kaaba", ar: "كسوة الكعبة" },
            { en: "A type of prayer", de: "Eine Gebetsart", ar: "نوع من الصلاة" },
            { en: "The boundary at which ihram must be entered", de: "Die Grenze, an der man in den Ihram eintreten muss", ar: "الحد الذي يجب الإحرام عنده" },
            { en: "The well of Zamzam", de: "Der Zamzam-Brunnen", ar: "بئر زمزم" },
          ],
          answer: 2,
          explain: { en: "Each direction of travel has its miqat.", de: "Jede Reiserichtung hat ihren Miqat.", ar: "لكل جهة ميقاتها." },
        },
        {
          q: { en: "Which miqat is for those coming from Madinah?", de: "Welcher Miqat gilt für Reisende aus Medina?", ar: "ما ميقات أهل المدينة؟" },
          options: [
            { en: "Yalamlam", de: "Yalamlam", ar: "يلملم" },
            { en: "Dhul-Hulayfah", de: "Dhul-Hulaifa", ar: "ذو الحليفة" },
            { en: "Dhat Irq", de: "Dhat Irq", ar: "ذات عرق" },
            { en: "Qarn al-Manazil", de: "Qarn al-Manazil", ar: "قرن المنازل" },
          ],
          answer: 1,
          explain: { en: "Dhul-Hulayfah, today called Abyar Ali, lies near Madinah.", de: "Dhul-Hulaifa, heute Abyar Ali, liegt nahe Medina.", ar: "ذو الحليفة، وتسمى اليوم أبيار علي، قرب المدينة." },
        },
        {
          q: { en: "Which of these is forbidden in ihram?", de: "Was davon ist im Ihram verboten?", ar: "أي هذه من محظورات الإحرام؟" },
          options: [
            { en: "Drinking water", de: "Wasser trinken", ar: "شرب الماء" },
            { en: "Reciting the talbiyah", de: "Die Talbiya sprechen", ar: "التلبية" },
            { en: "Making dua", de: "Bittgebete sprechen", ar: "الدعاء" },
            { en: "Applying perfume", de: "Parfüm auftragen", ar: "التطيب" },
          ],
          answer: 3,
          explain: { en: "Perfume is used before the intention, not after entering ihram.", de: "Duft wird vor der Absicht verwendet, nicht nach dem Eintritt in den Ihram.", ar: "الطيب قبل النية لا بعد الدخول في الإحرام." },
        },
      ],
    },
    {
      id: "j03-umrah",
      title: { en: "Umrah step by step", de: "Umra Schritt für Schritt", ar: "العمرة خطوة خطوة" },
      body: {
        en: "Umrah consists of a few rites that are also part of Hajj, so learning it well is good preparation.\n\n## 1. Ihram\nEnter ihram at the miqat with the intention of Umrah and recite the talbiyah until reaching the Haram.\n\n## 2. Tawaf\n- Seven circuits around the Kaaba, anticlockwise, beginning and ending at the line of the **Black Stone**, kissing, touching or pointing to it as possible.\n- Ritual purity (wudu) is required according to most scholars.\n- Men uncover the right shoulder (idtiba') and walk briskly in the first three circuits (raml), where possible.\n- Free dua and dhikr; between the Yemeni corner and the Black Stone many recite the dua of 2:201.\n\n## 3. Two rak'ahs\nPray two rak'ahs behind the **Station of Ibrahim** if possible, otherwise anywhere in the mosque (2:125). Drink Zamzam.\n\n## 4. Sa'i\nSeven runs between **Safa and Marwa**, starting at Safa (2:158), remembering Hajar's search for water. Men hurry between the green lights.\n\n## 5. Shaving or shortening\nMen shave or shorten the hair, shaving being better; women cut a fingertip's length. Then the restrictions of ihram end.",
        de: "Die Umra besteht aus wenigen Riten, die auch Teil des Hadsch sind; sie gut zu lernen ist daher eine gute Vorbereitung.\n\n## 1. Ihram\nTreten Sie am Miqat mit der Absicht der Umra in den Ihram ein und sprechen Sie die Talbiya bis zur Ankunft im Haram.\n\n## 2. Tawaf\n- Sieben Umrundungen der Kaaba gegen den Uhrzeigersinn, beginnend und endend auf der Linie des **Schwarzen Steins**, den man nach Möglichkeit küsst, berührt oder auf den man zeigt.\n- Rituelle Reinheit (Wudu) ist nach den meisten Gelehrten erforderlich.\n- Männer entblößen die rechte Schulter (Idtiba') und gehen in den ersten drei Runden zügig (Raml), soweit möglich.\n- Freie Bittgebete und Gedenken; zwischen der jemenitischen Ecke und dem Schwarzen Stein sprechen viele das Bittgebet aus 2:201.\n\n## 3. Zwei Rak'a\nBeten Sie zwei Rak'a hinter der **Stätte Ibrahims**, wenn möglich, sonst irgendwo in der Moschee (2:125). Trinken Sie Zamzam.\n\n## 4. Sa'i\nSieben Läufe zwischen **Safa und Marwa**, beginnend bei Safa (2:158), in Erinnerung an Hadschars Suche nach Wasser. Männer eilen zwischen den grünen Lichtern.\n\n## 5. Rasieren oder Kürzen\nMänner rasieren oder kürzen das Haar, wobei Rasieren besser ist; Frauen schneiden eine Fingerspitzenlänge ab. Dann enden die Verbote des Ihram.",
        ar: "تتكون العمرة من مناسك قليلة هي أيضًا جزء من الحج، فإتقانها إعداد حسن له.\n\n## 1. الإحرام\nأحرموا من الميقات بنية العمرة، ورددوا التلبية حتى الوصول إلى الحرم.\n\n## 2. الطواف\n- سبعة أشواط حول الكعبة، والكعبة عن اليسار، تبدأ وتنتهي عند محاذاة **الحجر الأسود** مع تقبيله أو استلامه أو الإشارة إليه بحسب الاستطاعة.\n- الطهارة شرط عند جمهور العلماء.\n- يضطبع الرجل ويرمل في الأشواط الثلاثة الأولى إن أمكن.\n- دعاء وذكر مطلق، ويدعو كثيرون بين الركن اليماني والحجر الأسود بدعاء الآية 2:201.\n\n## 3. ركعتان\nصلّوا ركعتين خلف **مقام إبراهيم** إن تيسر، وإلا ففي أي موضع من المسجد (2:125)، واشربوا من زمزم.\n\n## 4. السعي\nسبعة أشواط بين **الصفا والمروة** تبدأ بالصفا (2:158)، تذكيرًا بسعي هاجر في طلب الماء. ويسرع الرجال بين العلمين الأخضرين.\n\n## 5. الحلق أو التقصير\nيحلق الرجل أو يقصّر، والحلق أفضل، وتقصّر المرأة قدر أنملة. وبذلك يتحلل من محظورات الإحرام.",
      },
      verses: ["2:125", "2:158", "2:201"],
      tags: ["majority", "varies"],
      quiz: [
        {
          q: { en: "Where does each circuit of tawaf begin?", de: "Wo beginnt jede Runde des Tawaf?", ar: "من أين يبدأ كل شوط من الطواف؟" },
          options: [
            { en: "At the line of the Black Stone", de: "Auf der Linie des Schwarzen Steins", ar: "من محاذاة الحجر الأسود" },
            { en: "At the gate of the mosque", de: "Am Tor der Moschee", ar: "من باب المسجد" },
            { en: "At the well of Zamzam", de: "Am Zamzam-Brunnen", ar: "من بئر زمزم" },
            { en: "At Marwa", de: "Bei Marwa", ar: "من المروة" },
          ],
          answer: 0,
          explain: { en: "Tawaf begins and ends at the Black Stone.", de: "Der Tawaf beginnt und endet am Schwarzen Stein.", ar: "يبدأ الطواف وينتهي عند الحجر الأسود." },
        },
        {
          q: { en: "Where does sa'i begin?", de: "Wo beginnt der Sa'i?", ar: "من أين يبدأ السعي؟" },
          options: [
            { en: "At Marwa", de: "Bei Marwa", ar: "من المروة" },
            { en: "At Mina", de: "In Mina", ar: "من منى" },
            { en: "At Safa", de: "Bei Safa", ar: "من الصفا" },
            { en: "At Arafah", de: "In Arafat", ar: "من عرفة" },
          ],
          answer: 2,
          explain: { en: "Sa'i starts at Safa, the hill named first in 2:158.", de: "Der Sa'i beginnt bei Safa, dem in 2:158 zuerst genannten Hügel.", ar: "يبدأ السعي بالصفا المذكورة أولًا في 2:158." },
        },
        {
          q: { en: "How does Umrah end?", de: "Wie endet die Umra?", ar: "بم تنتهي العمرة؟" },
          options: [
            { en: "With a second tawaf", de: "Mit einem zweiten Tawaf", ar: "بطواف ثانٍ" },
            { en: "With stoning the pillars", de: "Mit dem Steinigen der Säulen", ar: "برمي الجمار" },
            { en: "With standing at Arafah", de: "Mit dem Stehen in Arafat", ar: "بالوقوف بعرفة" },
            { en: "With shaving or shortening the hair", de: "Mit dem Rasieren oder Kürzen des Haares", ar: "بالحلق أو التقصير" },
          ],
          answer: 3,
          explain: { en: "After shaving or shortening, the restrictions of ihram end.", de: "Nach dem Rasieren oder Kürzen enden die Verbote des Ihram.", ar: "بالحلق أو التقصير يتحلل المعتمر." },
        },
      ],
    },
    {
      id: "j04-types",
      title: { en: "Types of Hajj: tamattu', qiran, ifrad", de: "Arten des Hadsch: Tamattu', Qiran, Ifrad", ar: "أنساك الحج: التمتع والقران والإفراد" },
      body: {
        en: "There are three ways to perform Hajj. The pilgrim chooses one with the intention at the miqat.\n\n## Tamattu'\nUmrah in the months of Hajj, then leaving ihram, and a new ihram for Hajj on the 8th of Dhul-Hijjah. A sacrificial animal (hady) is required; whoever cannot find one fasts three days during Hajj and seven after returning (2:196). It is the most common choice for pilgrims from abroad.\n\n## Qiran\nUmrah and Hajj combined in one ihram that lasts until the day of sacrifice. A hady is required. Schools differ on whether one or two tawafs and sa'is are needed.\n\n## Ifrad\nHajj alone, with one ihram. No hady is required, although it may be offered voluntarily.\n\n## Which is best?\nThe schools differ. In broad terms: the Hanafis prefer qiran, the Malikis and Shafi'is ifrad, the Hanbalis tamattu'. In the Ja'fari school, tamattu' is required for those living far from Makkah, while qiran and ifrad are for those living near it. Many group organisers choose tamattu' for practical reasons; follow your group's scholar.",
        de: "Es gibt drei Arten, den Hadsch zu vollziehen. Der Pilger wählt eine mit der Absicht am Miqat.\n\n## Tamattu'\nUmra in den Hadsch-Monaten, danach Verlassen des Ihram und ein neuer Ihram für den Hadsch am 8. Dhul-Hiddscha. Ein Opfertier (Hady) ist erforderlich; wer keines findet, fastet drei Tage während des Hadsch und sieben nach der Rückkehr (2:196). Es ist die häufigste Wahl für Pilger aus dem Ausland.\n\n## Qiran\nUmra und Hadsch verbunden in einem Ihram, der bis zum Opfertag dauert. Ein Hady ist erforderlich. Die Schulen unterscheiden sich darin, ob ein oder zwei Tawaf und Sa'i nötig sind.\n\n## Ifrad\nNur Hadsch mit einem Ihram. Ein Hady ist nicht erforderlich, kann aber freiwillig dargebracht werden.\n\n## Welche ist die beste?\nDie Schulen unterscheiden sich. Grob gesagt bevorzugen die Hanafiten Qiran, die Malikiten und Schafiiten Ifrad, die Hanbaliten Tamattu'. In der dscha'faritischen Schule ist Tamattu' für weit von Mekka Wohnende vorgeschrieben, Qiran und Ifrad gelten für die in der Nähe Wohnenden. Viele Reiseveranstalter wählen aus praktischen Gründen Tamattu'; folgen Sie dem Gelehrten Ihrer Gruppe.",
        ar: "للحج ثلاثة أنساك، يختار الحاج أحدها بالنية عند الميقات.\n\n## التمتع\nعمرة في أشهر الحج ثم التحلل، ثم إحرام جديد بالحج في اليوم الثامن من ذي الحجة. ويجب الهدي، فمن لم يجد صام ثلاثة أيام في الحج وسبعة إذا رجع (2:196). وهو الأكثر اختيارًا للقادمين من الخارج.\n\n## القران\nالجمع بين العمرة والحج بإحرام واحد يبقى إلى يوم النحر، ويجب فيه الهدي. واختلفت المذاهب في الاكتفاء بطواف وسعي واحد أو اشتراط اثنين.\n\n## الإفراد\nالإحرام بالحج وحده، ولا يجب فيه هدي، وله أن يهدي تطوعًا.\n\n## أيها أفضل؟\nاختلفت المذاهب: فعلى وجه الإجمال يفضّل الحنفية القران، والمالكية والشافعية الإفراد، والحنابلة التمتع. وفي المذهب الجعفري يتعين التمتع على البعيد عن مكة، والقران والإفراد لأهلها ومن قرب منها. ويختار كثير من منظمي الحملات التمتع لأسباب عملية؛ فاتبعوا عالم مجموعتكم.",
      },
      verses: ["2:196"],
      tags: ["varies", "hanafi", "maliki", "shafii", "hanbali", "jafari"],
      quiz: [
        {
          q: { en: "In which type does the pilgrim leave ihram between Umrah and Hajj?", de: "Bei welcher Art verlässt der Pilger den Ihram zwischen Umra und Hadsch?", ar: "في أي نسك يتحلل الحاج بين العمرة والحج؟" },
          options: [
            { en: "Qiran", de: "Qiran", ar: "القران" },
            { en: "Tamattu'", de: "Tamattu'", ar: "التمتع" },
            { en: "Ifrad", de: "Ifrad", ar: "الإفراد" },
            { en: "None of them", de: "Bei keiner", ar: "لا شيء منها" },
          ],
          answer: 1,
          explain: { en: "Tamattu' means enjoying the time between with the restrictions lifted.", de: "Tamattu' bedeutet, die Zeit dazwischen ohne Verbote zu genießen.", ar: "التمتع هو الانتفاع بالتحلل بين النسكين." },
        },
        {
          q: { en: "Which type does not require a hady?", de: "Welche Art erfordert keinen Hady?", ar: "أي نسك لا يجب فيه الهدي؟" },
          options: [
            { en: "Tamattu'", de: "Tamattu'", ar: "التمتع" },
            { en: "Qiran", de: "Qiran", ar: "القران" },
            { en: "Ifrad", de: "Ifrad", ar: "الإفراد" },
            { en: "All require it", de: "Alle erfordern ihn", ar: "كلها يجب فيها" },
          ],
          answer: 2,
          explain: { en: "In ifrad the hady is voluntary.", de: "Bei Ifrad ist der Hady freiwillig.", ar: "الهدي في الإفراد تطوع." },
        },
        {
          q: { en: "What does 2:196 prescribe for someone who cannot find a hady?", de: "Was schreibt 2:196 für jemanden vor, der keinen Hady findet?", ar: "ماذا تقرر 2:196 لمن لم يجد الهدي؟" },
          options: [
            { en: "Fasting three days in Hajj and seven after returning", de: "Drei Tage Fasten im Hadsch und sieben nach der Rückkehr", ar: "صيام ثلاثة أيام في الحج وسبعة إذا رجع" },
            { en: "Repeating the Hajj next year", de: "Den Hadsch im nächsten Jahr wiederholen", ar: "إعادة الحج من قابل" },
            { en: "Paying double zakat", de: "Doppelte Zakat zahlen", ar: "دفع الزكاة مضاعفة" },
            { en: "Nothing at all", de: "Gar nichts", ar: "لا شيء" },
          ],
          answer: 0,
          explain: { en: "Ten days of fasting in total replace the animal.", de: "Insgesamt zehn Fastentage ersetzen das Tier.", ar: "عشرة أيام صيام تقوم مقام الهدي." },
        },
      ],
    },
    {
      id: "j05-mina-arafah",
      title: { en: "Days 8 and 9: Mina and Arafah", de: "Tag 8 und 9: Mina und Arafat", ar: "اليومان الثامن والتاسع: منى وعرفة" },
      body: {
        en: "## Day 8: the day of Tarwiyah\nPilgrims performing tamattu' enter ihram for Hajj from where they are staying in Makkah; those in qiran or ifrad are still in ihram. Everyone goes to **Mina**, a valley a few kilometres from the Haram, and prays Dhuhr, Asr, Maghrib, Isha and the next Fajr there, shortening the four-unit prayers. Spending the night in Mina is a sunnah according to most schools.\n\n## Day 9: the day of Arafah\nAfter sunrise pilgrims move to the plain of **Arafah**. Standing there (**wuquf**) is the central pillar of Hajj: whoever misses it has missed the Hajj. Its time begins after midday according to most scholars and lasts until dawn of the 10th.\n- Dhuhr and Asr are usually combined and shortened, often after a sermon at Masjid Namirah.\n- The pilgrim stays within the boundaries of Arafah, which are marked by signs.\n- The time is spent in dua, dhikr, recitation and repentance, facing the qiblah.\n\nThe Quran mentions the departure from Arafat in 2:198-199. For those not on Hajj, fasting this day is a recommended sunnah.\n\nAt sunset pilgrims leave calmly for Muzdalifah.",
        de: "## Tag 8: der Tag der Tarwiya\nPilger mit Tamattu' treten von ihrer Unterkunft in Mekka aus in den Ihram für den Hadsch ein; Pilger mit Qiran oder Ifrad sind noch im Ihram. Alle ziehen nach **Mina**, einem Tal wenige Kilometer vom Haram, und beten dort Dhuhr, Asr, Maghrib, Ischa und das folgende Fadschr, wobei die vierteiligen Gebete verkürzt werden. Die Übernachtung in Mina ist nach den meisten Schulen Sunna.\n\n## Tag 9: der Tag von Arafat\nNach Sonnenaufgang ziehen die Pilger in die Ebene von **Arafat**. Das Verweilen dort (**Wuquf**) ist die zentrale Säule des Hadsch: Wer es verpasst, hat den Hadsch verpasst. Seine Zeit beginnt nach den meisten Gelehrten nach dem Mittag und dauert bis zur Morgendämmerung des 10.\n- Dhuhr und Asr werden meist zusammengelegt und verkürzt, oft nach einer Predigt in der Namira-Moschee.\n- Der Pilger bleibt innerhalb der durch Schilder markierten Grenzen von Arafat.\n- Die Zeit wird mit Bittgebeten, Gedenken, Rezitation und Reue verbracht, der Qibla zugewandt.\n\nDer Koran erwähnt den Aufbruch von Arafat in 2:198-199. Für Nicht-Pilger ist das Fasten an diesem Tag eine empfohlene Sunna.\n\nBei Sonnenuntergang brechen die Pilger ruhig nach Muzdalifa auf.",
        ar: "## اليوم الثامن: يوم التروية\nيُحرم المتمتع بالحج من مكانه بمكة، ويبقى القارن والمفرد على إحرامهما. ويتوجه الجميع إلى **منى**، وهي وادٍ على بعد كيلومترات من الحرم، فيصلّون فيها الظهر والعصر والمغرب والعشاء وفجر اليوم التالي، يقصرون الرباعية. والمبيت بمنى ليلة التاسع سنة عند أكثر المذاهب.\n\n## اليوم التاسع: يوم عرفة\nبعد طلوع الشمس يسير الحجاج إلى صعيد **عرفة**. والوقوف بها ركن الحج الأعظم، فمن فاته فاته الحج. ويبدأ وقته عند الأكثر بعد الزوال ويمتد إلى فجر يوم النحر.\n- تُجمع الظهر والعصر وتُقصران غالبًا، بعد خطبة في مسجد نمرة.\n- يتأكد الحاج أنه داخل حدود عرفة المعلَّمة باللوحات.\n- يقضي الوقت في الدعاء والذكر والتلاوة والتوبة مستقبلًا القبلة.\n\nويذكر القرآن الإفاضة من عرفات في 2:198-199. ويُسن لغير الحاج صيام هذا اليوم.\n\nوعند غروب الشمس يدفع الحجاج بسكينة إلى مزدلفة.",
      },
      verses: ["2:198", "2:199"],
      tags: ["consensus", "majority"],
      quiz: [
        {
          q: { en: "Which rite is the central pillar of Hajj?", de: "Welcher Ritus ist die zentrale Säule des Hadsch?", ar: "ما ركن الحج الأعظم؟" },
          options: [
            { en: "Staying in Mina on day 8", de: "Der Aufenthalt in Mina am 8. Tag", ar: "المبيت بمنى يوم الثامن" },
            { en: "Drinking Zamzam", de: "Zamzam trinken", ar: "شرب زمزم" },
            { en: "Visiting Madinah", de: "Der Besuch in Medina", ar: "زيارة المدينة" },
            { en: "Standing at Arafah", de: "Das Verweilen in Arafat", ar: "الوقوف بعرفة" },
          ],
          answer: 3,
          explain: { en: "Whoever misses Arafah has missed the Hajj.", de: "Wer Arafat verpasst, hat den Hadsch verpasst.", ar: "من فاته الوقوف بعرفة فاته الحج." },
        },
        {
          q: { en: "Where do pilgrims go on day 8?", de: "Wohin ziehen die Pilger am 8. Tag?", ar: "إلى أين يتوجه الحجاج في اليوم الثامن؟" },
          options: [
            { en: "To Mina", de: "Nach Mina", ar: "إلى منى" },
            { en: "To Madinah", de: "Nach Medina", ar: "إلى المدينة" },
            { en: "To Jeddah", de: "Nach Dschidda", ar: "إلى جدة" },
            { en: "To Taif", de: "Nach Ta'if", ar: "إلى الطائف" },
          ],
          answer: 0,
          explain: { en: "Day 8, Tarwiyah, is spent in Mina.", de: "Der 8. Tag, Tarwiya, wird in Mina verbracht.", ar: "يُقضى يوم التروية في منى." },
        },
        {
          q: { en: "When do pilgrims leave Arafah?", de: "Wann verlassen die Pilger Arafat?", ar: "متى يدفع الحجاج من عرفة؟" },
          options: [
            { en: "Before midday", de: "Vor dem Mittag", ar: "قبل الزوال" },
            { en: "After sunset", de: "Nach Sonnenuntergang", ar: "بعد غروب الشمس" },
            { en: "At dawn of day 9", de: "Bei der Morgendämmerung des 9. Tages", ar: "فجر اليوم التاسع" },
            { en: "After three days", de: "Nach drei Tagen", ar: "بعد ثلاثة أيام" },
          ],
          answer: 1,
          explain: { en: "After sunset they move calmly to Muzdalifah.", de: "Nach Sonnenuntergang ziehen sie ruhig nach Muzdalifa.", ar: "بعد الغروب يدفعون بسكينة إلى مزدلفة." },
        },
      ],
    },
    {
      id: "j06-muzdalifah-day10",
      title: { en: "Muzdalifah and day 10", de: "Muzdalifa und der 10. Tag", ar: "مزدلفة ويوم النحر" },
      body: {
        en: "## The night in Muzdalifah\nOn arrival pilgrims pray Maghrib and Isha combined, Isha shortened. The Quran calls for remembering Allah at al-Mash'ar al-Haram (2:198). The night is spent there; the weak, elderly and women with them may leave after midnight according to many scholars. Many collect small pebbles here for the stoning. After Fajr, dua is made until it is light, then pilgrims leave for Mina before sunrise.\n\n## Day 10: Yawm al-Nahr\nThe day of sacrifice and Eid al-Adha has four main acts:\n1. **Stoning Jamrat al-Aqabah** with seven pebbles, saying takbir with each; the talbiyah stops here.\n2. **Sacrifice** (hady) for those in tamattu' or qiran; today usually by voucher (22:28, 22:36).\n3. **Shaving or shortening** the hair.\n4. **Tawaf al-ifadah**, a pillar of Hajj, followed by sa'i for those who still owe it.\n\nThe Sunnah order is as listed, but the Prophet allowed changes in order on this day. After stoning and shaving, most restrictions end (first release); after tawaf al-ifadah all end, including marital relations. 22:37 reminds that what reaches Allah is taqwa, not the meat or the blood.",
        de: "## Die Nacht in Muzdalifa\nNach der Ankunft beten die Pilger Maghrib und Ischa zusammengelegt, Ischa verkürzt. Der Koran ruft dazu auf, bei al-Masch'ar al-Haram Allahs zu gedenken (2:198). Die Nacht wird dort verbracht; Schwache, Ältere und Frauen mit ihren Begleitern dürfen nach vielen Gelehrten nach Mitternacht aufbrechen. Viele sammeln hier kleine Kieselsteine für das Steinigen. Nach dem Fadschr wird bis zur Helligkeit Bittgebet gesprochen, dann brechen die Pilger vor Sonnenaufgang nach Mina auf.\n\n## Tag 10: Yaum an-Nahr\nDer Opfertag und Opferfest hat vier Hauptteile:\n1. **Steinigung der Dschamrat al-Aqaba** mit sieben Kieseln, mit Takbir bei jedem; hier endet die Talbiya.\n2. **Opfer** (Hady) für Pilger mit Tamattu' oder Qiran; heute meist per Gutschein (22:28, 22:36).\n3. **Rasieren oder Kürzen** des Haares.\n4. **Tawaf al-Ifada**, eine Säule des Hadsch, danach Sa'i für alle, die ihn noch schulden.\n\nDie Reihenfolge der Sunna ist wie aufgeführt, doch der Prophet erlaubte an diesem Tag Abweichungen. Nach Steinigen und Rasieren enden die meisten Verbote (erste Lösung); nach dem Tawaf al-Ifada enden alle, auch der eheliche Verkehr. 22:37 erinnert daran, dass Allah nicht Fleisch oder Blut erreicht, sondern die Taqwa.",
        ar: "## المبيت بمزدلفة\nعند الوصول يصلي الحجاج المغرب والعشاء جمعًا مع قصر العشاء. ويأمر القرآن بذكر الله عند المشعر الحرام (2:198). ويُبات بها، ويجوز عند كثير من العلماء للضعفة وكبار السن والنساء ومرافقيهم الدفع بعد منتصف الليل. ويلتقط كثيرون منها الحصى للرمي. وبعد الفجر يدعون حتى الإسفار، ثم يدفعون إلى منى قبل طلوع الشمس.\n\n## اليوم العاشر: يوم النحر\nيوم النحر وعيد الأضحى، وأعماله أربعة:\n1. **رمي جمرة العقبة** بسبع حصيات يكبّر مع كل حصاة، وتنقطع التلبية عندها.\n2. **ذبح الهدي** على المتمتع والقارن، ويكون اليوم غالبًا عبر الصكوك (22:28، 22:36).\n3. **الحلق أو التقصير**.\n4. **طواف الإفاضة**، وهو ركن، ثم السعي لمن بقي عليه.\n\nوالترتيب المسنون كما ذُكر، وقد رخّص النبي في التقديم والتأخير في هذا اليوم. وبالرمي والحلق يحصل التحلل الأول، وبطواف الإفاضة يحصل التحلل الثاني فيحل كل شيء حتى النساء. وتذكّر الآية 22:37 بأن الذي ينال الله هو التقوى لا اللحوم ولا الدماء.",
      },
      verses: ["2:198", "22:28", "22:36", "22:37"],
      tags: ["majority", "varies"],
      quiz: [
        {
          q: { en: "Which jamrah is stoned on day 10?", de: "Welche Dschamra wird am 10. Tag gesteinigt?", ar: "أي جمرة تُرمى يوم النحر؟" },
          options: [
            { en: "All three", de: "Alle drei", ar: "الجمرات الثلاث" },
            { en: "The small one only", de: "Nur die kleine", ar: "الصغرى وحدها" },
            { en: "Jamrat al-Aqabah", de: "Dschamrat al-Aqaba", ar: "جمرة العقبة" },
            { en: "None", de: "Keine", ar: "لا شيء" },
          ],
          answer: 2,
          explain: { en: "On day 10 only Jamrat al-Aqabah is stoned, with seven pebbles.", de: "Am 10. Tag wird nur die Dschamrat al-Aqaba mit sieben Kieseln gesteinigt.", ar: "يوم النحر تُرمى جمرة العقبة وحدها بسبع حصيات." },
        },
        {
          q: { en: "Which act of day 10 is a pillar of Hajj?", de: "Welche Handlung des 10. Tages ist eine Säule des Hadsch?", ar: "أي أعمال يوم النحر ركن؟" },
          options: [
            { en: "Collecting pebbles", de: "Kiesel sammeln", ar: "التقاط الحصى" },
            { en: "Eating the sacrifice", de: "Vom Opfer essen", ar: "الأكل من الهدي" },
            { en: "Wearing new clothes", de: "Neue Kleidung tragen", ar: "لبس الجديد" },
            { en: "Tawaf al-ifadah", de: "Tawaf al-Ifada", ar: "طواف الإفاضة" },
          ],
          answer: 3,
          explain: { en: "Tawaf al-ifadah is a pillar; without it the Hajj is incomplete.", de: "Der Tawaf al-Ifada ist eine Säule; ohne ihn ist der Hadsch unvollständig.", ar: "طواف الإفاضة ركن لا يتم الحج إلا به." },
        },
        {
          q: { en: "What does 22:37 say reaches Allah from the sacrifice?", de: "Was erreicht Allah laut 22:37 vom Opfer?", ar: "ما الذي ينال الله من الأضاحي بحسب 22:37؟" },
          options: [
            { en: "Taqwa", de: "Die Taqwa", ar: "التقوى" },
            { en: "The meat", de: "Das Fleisch", ar: "اللحوم" },
            { en: "The blood", de: "Das Blut", ar: "الدماء" },
            { en: "The price", de: "Der Preis", ar: "الثمن" },
          ],
          answer: 0,
          explain: { en: "The verse points to the inner intention.", de: "Der Vers weist auf die innere Absicht hin.", ar: "تشير الآية إلى ما في القلب." },
        },
      ],
    },
    {
      id: "j07-tashriq-farewell",
      title: { en: "Days of tashriq and the farewell tawaf", de: "Tage des Taschriq und Abschieds-Tawaf", ar: "أيام التشريق وطواف الوداع" },
      body: {
        en: "## Days 11 to 13: the days of tashriq\nPilgrims spend the nights in **Mina** and stone the three pillars each day after midday:\n1. the small jamrah (al-Ula), then dua,\n2. the middle jamrah (al-Wusta), then dua,\n3. Jamrat al-Aqabah, without stopping for dua.\nSeven pebbles each, with takbir. Someone weak or ill may appoint a representative.\n\n## Leaving early or staying\nThe Quran allows leaving after two days without sin, and staying for the third as well, for the one who is mindful of Allah (2:203). Those leaving on the 12th should leave Mina before sunset according to many scholars. The same passage calls for remembering Allah as one remembers one's forefathers, or even more (2:200).\n\n## The farewell tawaf\nBefore leaving Makkah, pilgrims perform **tawaf al-wada'** as their last act. It is obligatory according to the majority and a sunnah according to the Malikis. Women who are menstruating or in postnatal bleeding are excused from it. Some scholars allow combining it with a delayed tawaf al-ifadah.\n\nThese days are days of eating, drinking and remembering Allah; fasting is not done in them, except by pilgrims making up the fast of tamattu' according to some views.",
        de: "## Tage 11 bis 13: die Tage des Taschriq\nDie Pilger verbringen die Nächte in **Mina** und steinigen jeden Tag nach dem Mittag die drei Säulen:\n1. die kleine Dschamra (al-Ula), danach Bittgebet,\n2. die mittlere Dschamra (al-Wusta), danach Bittgebet,\n3. die Dschamrat al-Aqaba, ohne Halt zum Bittgebet.\nJe sieben Kiesel mit Takbir. Wer schwach oder krank ist, kann einen Vertreter beauftragen.\n\n## Früh abreisen oder bleiben\nDer Koran erlaubt es, nach zwei Tagen ohne Sünde aufzubrechen oder auch den dritten Tag zu bleiben, für den, der Allah fürchtet (2:203). Wer am 12. abreist, sollte Mina nach vielen Gelehrten vor Sonnenuntergang verlassen. Derselbe Abschnitt ruft dazu auf, Allahs zu gedenken wie man seiner Vorväter gedenkt, oder noch mehr (2:200).\n\n## Der Abschieds-Tawaf\nVor dem Verlassen Mekkas vollziehen die Pilger als letzte Handlung den **Tawaf al-Wada'**. Er ist nach der Mehrheit Pflicht und nach den Malikiten Sunna. Frauen in der Menstruation oder im Wochenfluss sind davon befreit. Manche Gelehrte erlauben, ihn mit einem aufgeschobenen Tawaf al-Ifada zu verbinden.\n\nDiese Tage sind Tage des Essens, Trinkens und Gedenkens Allahs; man fastet nicht an ihnen, außer nach manchen Ansichten Pilger, die das Fasten des Tamattu' nachholen.",
        ar: "## الأيام 11 إلى 13: أيام التشريق\nيبيت الحجاج في **منى** ويرمون الجمرات الثلاث كل يوم بعد الزوال:\n1. الجمرة الصغرى (الأولى) ثم الدعاء،\n2. الجمرة الوسطى ثم الدعاء،\n3. جمرة العقبة دون وقوف للدعاء.\nسبع حصيات لكل جمرة مع التكبير. ويجوز للضعيف أو المريض أن يوكّل من يرمي عنه.\n\n## التعجل أو التأخر\nيبيح القرآن التعجل في يومين بلا إثم، والتأخر إلى الثالث كذلك، لمن اتقى (2:203). ومن تعجل في اليوم الثاني عشر فليخرج من منى قبل الغروب عند كثير من العلماء. ويأمر السياق نفسه بذكر الله كذكر الآباء أو أشد ذكرًا (2:200).\n\n## طواف الوداع\nقبل مغادرة مكة يطوف الحاج **طواف الوداع** ليكون آخر عهده بالبيت. وهو واجب عند الجمهور، وسنة عند المالكية. ويسقط عن الحائض والنفساء. ويجيز بعض العلماء الاكتفاء بطواف الإفاضة إذا أُخّر إلى وقت السفر.\n\nوهذه أيام أكل وشرب وذكر لله، لا يُصام فيها إلا عند بعضهم للمتمتع الذي لم يجد الهدي.",
      },
      verses: ["2:200", "2:203"],
      tags: ["majority", "maliki", "varies"],
      quiz: [
        {
          q: { en: "In which order are the three jamarat stoned on the days of tashriq?", de: "In welcher Reihenfolge werden die drei Dschamarat an den Taschriq-Tagen gesteinigt?", ar: "ما ترتيب رمي الجمرات في أيام التشريق؟" },
          options: [
            { en: "Aqabah, middle, small", de: "Aqaba, mittlere, kleine", ar: "العقبة ثم الوسطى ثم الصغرى" },
            { en: "Any order", de: "Beliebige Reihenfolge", ar: "بأي ترتيب" },
            { en: "Middle first, then the others", de: "Zuerst die mittlere, dann die anderen", ar: "الوسطى أولًا ثم الباقيتان" },
            { en: "Small, middle, Aqabah", de: "Kleine, mittlere, Aqaba", ar: "الصغرى ثم الوسطى ثم العقبة" },
          ],
          answer: 3,
          explain: { en: "The order starts with the small jamrah nearest to Masjid al-Khayf.", de: "Die Reihenfolge beginnt mit der kleinen Dschamra nahe der Chaif-Moschee.", ar: "يبدأ الرمي بالصغرى القريبة من مسجد الخيف." },
        },
        {
          q: { en: "What does 2:203 allow?", de: "Was erlaubt 2:203?", ar: "ماذا تبيح 2:203؟" },
          options: [
            { en: "Skipping Arafah", de: "Arafat auszulassen", ar: "ترك الوقوف بعرفة" },
            { en: "Leaving after two days or staying for the third", de: "Nach zwei Tagen aufzubrechen oder den dritten zu bleiben", ar: "التعجل في يومين أو التأخر" },
            { en: "Stoning before dawn on all days", de: "An allen Tagen vor der Morgendämmerung zu steinigen", ar: "الرمي قبل الفجر في كل الأيام" },
            { en: "Leaving ihram on day 8", de: "Den Ihram am 8. Tag zu verlassen", ar: "التحلل يوم الثامن" },
          ],
          answer: 1,
          explain: { en: "Both are allowed for the one who is mindful of Allah.", de: "Beides ist erlaubt für den, der Allah fürchtet.", ar: "كلاهما جائز لمن اتقى." },
        },
        {
          q: { en: "Who is excused from the farewell tawaf?", de: "Wer ist vom Abschieds-Tawaf befreit?", ar: "من يسقط عنه طواف الوداع؟" },
          options: [
            { en: "Everyone over fifty", de: "Alle über fünfzig", ar: "كل من تجاوز الخمسين" },
            { en: "Those who came by plane", de: "Wer mit dem Flugzeug kam", ar: "القادم بالطائرة" },
            { en: "Women who are menstruating or in postnatal bleeding", de: "Frauen in der Menstruation oder im Wochenfluss", ar: "الحائض والنفساء" },
            { en: "Those in tamattu'", de: "Pilger mit Tamattu'", ar: "المتمتع" },
          ],
          answer: 2,
          explain: { en: "This exemption is generally agreed upon.", de: "Diese Befreiung ist allgemein anerkannt.", ar: "هذا الإسقاط محل اتفاق في الجملة." },
        },
      ],
    },
    {
      id: "j08-madinah-spirit",
      title: { en: "Visiting Madinah and keeping the spirit", de: "Besuch in Medina und den Geist bewahren", ar: "زيارة المدينة والمحافظة على الأثر" },
      body: {
        en: "## Madinah\nVisiting Madinah is not part of Hajj or Umrah, but most pilgrims go there before or after. It is the city of the Prophet, where his mosque and grave are.\n- Prayer in the **Prophet's Mosque** carries great reward; many intend the journey for the mosque.\n- The **Rawdah**, between the Prophet's house and his minbar, is a place many seek to pray in; a permit through the official app is usually required today.\n- Pilgrims greet the Prophet and his two companions, Abu Bakr and Umar, with calm and good manners.\n- Many visit **Masjid Quba**, the first mosque, and the cemetery of al-Baqi'.\nThe form and wording of the visit to the grave differ between schools and traditions; follow your group's scholar.\n\n## Keeping the spirit\nHajj is a beginning, not an end. The Quran describes the best provision as taqwa (2:197) and forbids quarrelling and indecency during Hajj. After returning:\n- keep the prayers and dhikr learned in these days,\n- hold on to the patience and humility of the crowds,\n- ask forgiveness of people you have wronged,\n- avoid pride in the title of hajji.\nScholars mention that a sign of an accepted Hajj is that one returns better than before.",
        de: "## Medina\nDer Besuch Medinas gehört nicht zu Hadsch oder Umra, doch die meisten Pilger reisen davor oder danach dorthin. Es ist die Stadt des Propheten, in der seine Moschee und sein Grab liegen.\n- Das Gebet in der **Prophetenmoschee** hat großen Lohn; viele richten die Reise auf die Moschee aus.\n- Die **Rauda** zwischen dem Haus des Propheten und seinem Minbar ist ein Ort, an dem viele beten möchten; heute ist meist eine Genehmigung über die offizielle App nötig.\n- Pilger grüßen den Propheten und seine beiden Gefährten Abu Bakr und Umar mit Ruhe und gutem Benehmen.\n- Viele besuchen die **Quba-Moschee**, die erste Moschee, und den Friedhof al-Baqi'.\nForm und Wortlaut des Besuchs am Grab unterscheiden sich zwischen Schulen und Traditionen; folgen Sie dem Gelehrten Ihrer Gruppe.\n\n## Den Geist bewahren\nDer Hadsch ist ein Anfang, kein Ende. Der Koran nennt die Taqwa die beste Wegzehrung (2:197) und untersagt Streit und Unanständiges während des Hadsch. Nach der Rückkehr:\n- bewahren Sie die Gebete und das Gedenken dieser Tage,\n- halten Sie an der Geduld und Demut im Gedränge fest,\n- bitten Sie Menschen um Verzeihung, denen Sie Unrecht getan haben,\n- meiden Sie Stolz auf den Titel Hadschi.\nGelehrte nennen als Zeichen eines angenommenen Hadsch, dass man besser zurückkehrt als zuvor.",
        ar: "## المدينة\nزيارة المدينة ليست من مناسك الحج ولا العمرة، لكن أكثر الحجاج يقصدونها قبلهما أو بعدهما، فهي مدينة النبي وفيها مسجده وقبره.\n- للصلاة في **المسجد النبوي** فضل عظيم، وينوي كثيرون شدّ الرحل إلى المسجد.\n- **الروضة** بين بيت النبي ومنبره موضع يحرص كثيرون على الصلاة فيه، ويُشترط اليوم غالبًا تصريح عبر التطبيق الرسمي.\n- يسلّم الزائر على النبي وصاحبيه أبي بكر وعمر بسكينة وأدب.\n- ويزور كثيرون **مسجد قباء**، أول مسجد، ومقبرة البقيع.\nوتختلف صفة الزيارة عند القبر وألفاظها بين المذاهب والتقاليد؛ فاتبعوا عالم مجموعتكم.\n\n## المحافظة على الأثر\nالحج بداية لا نهاية. ويجعل القرآن التقوى خير الزاد (2:197)، وينهى عن الرفث والفسوق والجدال في الحج. وبعد العودة:\n- حافظوا على الصلوات والأذكار التي اعتدتموها في تلك الأيام،\n- تمسّكوا بالصبر والتواضع اللذين تعلمتموهما في الزحام،\n- استحلّوا من ظلمتموه من الناس،\n- اجتنبوا التفاخر بلقب الحاج.\nويذكر العلماء أن من علامات الحج المبرور أن يرجع المرء خيرًا مما كان.",
      },
      verses: ["2:197"],
      tags: ["varies"],
      quiz: [
        {
          q: { en: "Is visiting Madinah a rite of Hajj?", de: "Ist der Besuch Medinas ein Ritus des Hadsch?", ar: "هل زيارة المدينة من مناسك الحج؟" },
          options: [
            { en: "No, but most pilgrims visit it", de: "Nein, aber die meisten Pilger besuchen es", ar: "لا، لكن أكثر الحجاج يزورونها" },
            { en: "Yes, it is a pillar", de: "Ja, es ist eine Säule", ar: "نعم، هي ركن" },
            { en: "Yes, without it Hajj is invalid", de: "Ja, ohne ihn ist der Hadsch ungültig", ar: "نعم، ولا يصح الحج بدونها" },
            { en: "It replaces Arafah", de: "Er ersetzt Arafat", ar: "تُغني عن عرفة" },
          ],
          answer: 0,
          explain: { en: "The visit is separate from the rites of Hajj.", de: "Der Besuch ist von den Riten des Hadsch getrennt.", ar: "الزيارة مستقلة عن المناسك." },
        },
        {
          q: { en: "Which was the first mosque, often visited from Madinah?", de: "Welche war die erste Moschee, die oft von Medina aus besucht wird?", ar: "ما أول مسجد يزوره كثيرون في المدينة؟" },
          options: [
            { en: "Masjid Namirah", de: "Namira-Moschee", ar: "مسجد نمرة" },
            { en: "Masjid al-Khayf", de: "Chaif-Moschee", ar: "مسجد الخيف" },
            { en: "Masjid al-Aqsa", de: "Al-Aqsa-Moschee", ar: "المسجد الأقصى" },
            { en: "Masjid Quba", de: "Quba-Moschee", ar: "مسجد قباء" },
          ],
          answer: 3,
          explain: { en: "Quba was built when the Prophet arrived at Madinah.", de: "Quba wurde bei der Ankunft des Propheten in Medina gebaut.", ar: "بُني مسجد قباء عند قدوم النبي المدينة." },
        },
        {
          q: { en: "What does 2:197 call the best provision?", de: "Was nennt 2:197 die beste Wegzehrung?", ar: "ما خير الزاد بحسب 2:197؟" },
          options: [
            { en: "Gold", de: "Gold", ar: "الذهب" },
            { en: "Food for the journey", de: "Essen für die Reise", ar: "طعام السفر" },
            { en: "Taqwa", de: "Die Taqwa", ar: "التقوى" },
            { en: "Gifts for the family", de: "Geschenke für die Familie", ar: "الهدايا للأهل" },
          ],
          answer: 2,
          explain: { en: "Taqwa is the provision that lasts beyond the journey.", de: "Taqwa ist die Wegzehrung, die über die Reise hinaus bleibt.", ar: "التقوى زاد يبقى بعد الرحلة." },
        },
      ],
    },
  ],
};
