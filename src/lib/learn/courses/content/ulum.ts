// mirrors mobile/src/features/courses/content/ulum.ts (copied for the website; keep both in step)
import type { Course } from "../types";

// Introduction to tafsir and the sciences of the Quran ('ulum al-Quran). Descriptive and neutral; no Quran or hadith
// text is typed here, verses are loaded by key, hadith by collection and number.

export const ULUM: Course = {
  id: "ulum",
  word: "علوم القرآن",
  free: 1,
  title: {
    en: "Introduction to Tafsir and its sciences",
    de: "Einführung in Tafsir und seine Wissenschaften",
    ar: "مدخل إلى التفسير وعلوم القرآن",
  },
  lead: {
    en: "What tafsir is and the tools behind it: revelation, Makki and Madani, compilation, readings, abrogation, clear and ambiguous verses and the great works.",
    de: "Was Tafsir ist und welche Werkzeuge dahinterstehen: Offenbarung, mekkanisch und medinensisch, Sammlung, Lesarten, Abrogation, eindeutige und mehrdeutige Verse und die großen Werke.",
    ar: "ما التفسير وما أدواته: الوحي، والمكي والمدني، وجمع القرآن، والقراءات، والنسخ، والمحكم والمتشابه، وأمهات كتب التفسير.",
  },
  lessons: [
    {
      id: "u01-what-is-tafsir",
      title: { en: "What is tafsir?", de: "Was ist Tafsir?", ar: "ما التفسير؟" },
      body: {
        en: "The Arabic word tafsir comes from a root meaning to uncover or make clear. As a discipline it is the explanation of the meanings of the Quran: its words, its rulings, its context and its guidance.\n\n## Tafsir and ta'wil\n- Early scholars often used both words for explanation in general.\n- Later many used **ta'wil** for drawing out a deeper or less obvious meaning, while **tafsir** stays closer to the wording and transmitted reports.\n\n## Why it is needed\nThe Quran itself describes the Prophet as the one who explains to people what was sent down to them (16:44), and it invites reflection on its verses (38:29, 4:82). Companions asked about words they did not know, and later generations needed knowledge of language, history and law to understand the text correctly.\n\n## Who may explain?\nClassical scholars listed conditions for a mufassir: sound Arabic, knowledge of the reports, of the sciences in this course and of the principles of law, together with sincerity and caution. Personal reflection is encouraged; issuing new interpretations requires this learning.",
        de: "Das arabische Wort Tafsir stammt von einer Wurzel mit der Bedeutung aufdecken oder klarmachen. Als Disziplin ist es die Erklärung der Bedeutungen des Korans: seiner Wörter, Bestimmungen, Zusammenhänge und Rechtleitung.\n\n## Tafsir und Ta'wil\n- Frühe Gelehrte verwendeten beide Wörter oft allgemein für Erklärung.\n- Später nutzten viele **Ta'wil** für das Herausarbeiten einer tieferen oder weniger offensichtlichen Bedeutung, während **Tafsir** näher am Wortlaut und an überlieferten Berichten bleibt.\n\n## Warum es nötig ist\nDer Koran beschreibt den Propheten als denjenigen, der den Menschen erklärt, was zu ihnen herabgesandt wurde (16:44), und er lädt zum Nachdenken über seine Verse ein (38:29, 4:82). Gefährten fragten nach Wörtern, die sie nicht kannten, und spätere Generationen brauchten Wissen über Sprache, Geschichte und Recht, um den Text richtig zu verstehen.\n\n## Wer darf erklären?\nKlassische Gelehrte nannten Bedingungen für einen Mufassir: gutes Arabisch, Kenntnis der Berichte, der Wissenschaften dieses Kurses und der Rechtsgrundlagen, verbunden mit Aufrichtigkeit und Vorsicht. Persönliches Nachdenken ist erwünscht; neue Auslegungen setzen dieses Wissen voraus.",
        ar: "كلمة التفسير مشتقة من الفَسْر بمعنى الكشف والإيضاح. وهو علمٌ يُعرف به بيان معاني القرآن: ألفاظه وأحكامه وسياقه وهدايته.\n\n## التفسير والتأويل\n- استعمل كثير من المتقدمين اللفظين بمعنى البيان عمومًا.\n- ثم خصّ كثير من المتأخرين **التأويل** باستخراج معنى أعمق أو غير ظاهر، وبقي **التفسير** أقرب إلى اللفظ والمأثور.\n\n## الحاجة إليه\nيصف القرآن النبي بأنه المبيّن للناس ما نُزّل إليهم (16:44)، ويدعو إلى تدبر آياته (38:29، 4:82). وقد سأل الصحابة عن ألفاظ لم يعرفوها، واحتاجت الأجيال اللاحقة إلى علم اللغة والتاريخ والأحكام لفهم النص فهمًا صحيحًا.\n\n## من يفسّر؟\nذكر العلماء شروطًا للمفسّر: إتقان العربية، ومعرفة المأثور، وعلوم القرآن، وأصول الفقه، مع الإخلاص والتحرّي. والتدبر الشخصي مطلوب، أما الإتيان بتفسير جديد فيحتاج إلى هذه الأدوات.",
      },
      verses: ["16:44", "38:29", "4:82"],
      quiz: [
        {
          q: { en: "What does the root of the word tafsir mean?", de: "Was bedeutet die Wurzel des Wortes Tafsir?", ar: "ما معنى أصل كلمة التفسير؟" },
          options: [
            { en: "To recite melodiously", de: "Melodisch rezitieren", ar: "الترتيل" },
            { en: "To memorise", de: "Auswendig lernen", ar: "الحفظ" },
            { en: "To uncover or make clear", de: "Aufdecken, klarmachen", ar: "الكشف والإيضاح" },
            { en: "To translate", de: "Übersetzen", ar: "الترجمة" },
          ],
          answer: 2,
          explain: { en: "Tafsir means uncovering and clarifying the meanings.", de: "Tafsir bedeutet, die Bedeutungen aufzudecken und klarzumachen.", ar: "التفسير هو كشف المعاني وإيضاحها." },
        },
        {
          q: { en: "Which verse describes the Prophet as the one who explains what was sent down?", de: "Welcher Vers beschreibt den Propheten als den, der das Herabgesandte erklärt?", ar: "أي آية تصف النبي بأنه المبيّن لما نُزّل؟" },
          options: [
            { en: "16:44", de: "16:44", ar: "16:44" },
            { en: "2:255", de: "2:255", ar: "2:255" },
            { en: "112:1", de: "112:1", ar: "112:1" },
            { en: "1:1", de: "1:1", ar: "1:1" },
          ],
          answer: 0,
          explain: { en: "16:44 links the revelation with the Prophet's explanation.", de: "16:44 verbindet die Offenbarung mit der Erklärung durch den Propheten.", ar: "تربط 16:44 بين التنزيل وبيان النبي." },
        },
        {
          q: { en: "How did many later scholars use the word ta'wil?", de: "Wie verwendeten viele spätere Gelehrte das Wort Ta'wil?", ar: "كيف استعمل كثير من المتأخرين لفظ التأويل؟" },
          options: [
            { en: "For the rules of recitation", de: "Für die Regeln der Rezitation", ar: "لأحكام التلاوة" },
            { en: "For counting verses", de: "Für das Zählen der Verse", ar: "لعدّ الآيات" },
            { en: "For the history of the Arabs", de: "Für die Geschichte der Araber", ar: "لتاريخ العرب" },
            { en: "For drawing out a deeper, less obvious meaning", de: "Für das Herausarbeiten einer tieferen, weniger offensichtlichen Bedeutung", ar: "لاستخراج معنى أعمق غير ظاهر" },
          ],
          answer: 3,
          explain: { en: "Early usage was general; later ta'wil often meant a deeper meaning.", de: "Früher war der Gebrauch allgemein; später meinte Ta'wil oft eine tiefere Bedeutung.", ar: "كان الاستعمال عامًا عند المتقدمين، ثم خُصّ التأويل بالمعنى الأعمق." },
        },
      ],
    },
    {
      id: "u02-revelation-asbab",
      title: { en: "Revelation and asbab al-nuzul", de: "Offenbarung und Asbab an-Nuzul", ar: "الوحي وأسباب النزول" },
      body: {
        en: "The Quran was revealed over about 23 years. The first verses came in the cave of Hira at the beginning of al-Alaq (96:1-5). The Quran explains that it was sent down in stages so that it could be recited to people slowly and to strengthen the heart of the Prophet (17:106, 25:32). Al-Qadr (97:1) speaks of its sending down on a blessed night.\n\n## Occasions of revelation\nAsbab al-nuzul are the events or questions in connection with which verses were revealed. A well-known example is the beginning of al-Mujadilah (58:1), linked to a woman who brought her complaint about her husband to the Prophet.\n\n## How scholars use them\n- They help to understand the context and avoid misreading.\n- They are known only through transmitted reports, which are checked like hadith.\n- A common principle: the lesson is in the general wording, not limited to the specific cause.\n\nWorks such as those of al-Wahidi and al-Suyuti collected these reports.",
        de: "Der Koran wurde über etwa 23 Jahre offenbart. Die ersten Verse kamen in der Höhle Hira mit dem Anfang von al-Alaq (96:1-5). Der Koran erklärt, dass er schrittweise herabgesandt wurde, damit er den Menschen langsam vorgetragen wird und um das Herz des Propheten zu festigen (17:106, 25:32). Al-Qadr (97:1) spricht von seiner Herabsendung in einer gesegneten Nacht.\n\n## Anlässe der Offenbarung\nAsbab an-Nuzul sind die Ereignisse oder Fragen, in deren Zusammenhang Verse offenbart wurden. Ein bekanntes Beispiel ist der Anfang von al-Mudschadila (58:1), verbunden mit einer Frau, die ihre Klage über ihren Ehemann zum Propheten brachte.\n\n## Wie Gelehrte sie nutzen\n- Sie helfen, den Zusammenhang zu verstehen und Fehldeutungen zu vermeiden.\n- Sie sind nur durch überlieferte Berichte bekannt, die wie Hadithe geprüft werden.\n- Ein verbreiteter Grundsatz: Maßgeblich ist der allgemeine Wortlaut, nicht nur der besondere Anlass.\n\nWerke etwa von al-Wahidi und as-Suyuti haben diese Berichte gesammelt.",
        ar: "نزل القرآن منجّمًا في نحو ثلاث وعشرين سنة. وأول ما نزل في غار حراء صدر سورة العلق (96:1-5). ويبيّن القرآن أنه نزل مفرّقًا ليُقرأ على الناس على مُكث، وتثبيتًا لفؤاد النبي (17:106، 25:32). وتذكر سورة القدر (97:1) إنزاله في ليلة مباركة.\n\n## أسباب النزول\nهي الوقائع أو الأسئلة التي نزلت الآيات بشأنها. ومن الأمثلة المشهورة مطلع سورة المجادلة (58:1)، المرتبط بامرأة جاءت تشتكي زوجها إلى النبي.\n\n## فائدتها عند العلماء\n- تعين على فهم السياق وتمنع الخطأ في الفهم.\n- لا تُعرف إلا بالنقل، وتُمحَّص أسانيدها كما يُمحَّص الحديث.\n- القاعدة المشهورة: العبرة بعموم اللفظ لا بخصوص السبب.\n\nوقد جمعها مصنفون منهم الواحدي والسيوطي.",
      },
      verses: ["96:1", "96:2", "96:3", "96:4", "96:5", "17:106", "25:32", "97:1", "58:1"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "Over roughly how long was the Quran revealed?", de: "Über etwa welchen Zeitraum wurde der Koran offenbart?", ar: "في كم سنة تقريبًا نزل القرآن؟" },
          options: [
            { en: "One night only", de: "Nur eine Nacht", ar: "ليلة واحدة فقط" },
            { en: "About 23 years", de: "Etwa 23 Jahre", ar: "نحو ثلاث وعشرين سنة" },
            { en: "About 5 years", de: "Etwa 5 Jahre", ar: "نحو خمس سنين" },
            { en: "About 40 years", de: "Etwa 40 Jahre", ar: "نحو أربعين سنة" },
          ],
          answer: 1,
          explain: { en: "The revelation came in stages over about 23 years.", de: "Die Offenbarung kam schrittweise über etwa 23 Jahre.", ar: "نزل الوحي منجّمًا في نحو ثلاث وعشرين سنة." },
        },
        {
          q: { en: "What are asbab al-nuzul?", de: "Was sind Asbab an-Nuzul?", ar: "ما أسباب النزول؟" },
          options: [
            { en: "Events or questions connected with the revelation of verses", de: "Ereignisse oder Fragen, die mit der Offenbarung von Versen verbunden sind", ar: "وقائع أو أسئلة نزلت الآيات بشأنها" },
            { en: "Rules of pausing in recitation", de: "Regeln des Pausierens beim Rezitieren", ar: "أحكام الوقف" },
            { en: "Names of the surahs", de: "Namen der Suren", ar: "أسماء السور" },
            { en: "Translations of the Quran", de: "Übersetzungen des Korans", ar: "ترجمات القرآن" },
          ],
          answer: 0,
          explain: { en: "They give the context in which verses came down.", de: "Sie liefern den Zusammenhang, in dem Verse herabkamen.", ar: "تبيّن السياق الذي نزلت فيه الآيات." },
        },
        {
          q: { en: "What principle do many scholars apply to the occasions of revelation?", de: "Welchen Grundsatz wenden viele Gelehrte auf die Offenbarungsanlässe an?", ar: "ما القاعدة التي يطبّقها كثير من العلماء على أسباب النزول؟" },
          options: [
            { en: "A verse only applies to the person concerned", de: "Ein Vers gilt nur für die betroffene Person", ar: "الآية خاصة بصاحب الواقعة فقط" },
            { en: "Occasions need no chain of transmission", de: "Anlässe brauchen keine Überlieferungskette", ar: "لا تحتاج الأسباب إلى إسناد" },
            { en: "The lesson lies in the general wording, not only the specific cause", de: "Maßgeblich ist der allgemeine Wortlaut, nicht nur der besondere Anlass", ar: "العبرة بعموم اللفظ لا بخصوص السبب" },
            { en: "Occasions replace the verse", de: "Anlässe ersetzen den Vers", ar: "السبب يُغني عن الآية" },
          ],
          answer: 2,
          explain: { en: "The specific cause explains the context, the general wording carries the guidance.", de: "Der Anlass erklärt den Zusammenhang, der allgemeine Wortlaut trägt die Rechtleitung.", ar: "السبب يوضح السياق، وعموم اللفظ يحمل الهداية." },
        },
      ],
    },
    {
      id: "u03-makki-madani",
      title: { en: "Makki and Madani", de: "Mekkanisch und medinensisch", ar: "المكي والمدني" },
      body: {
        en: "Scholars classify surahs and verses as Makki or Madani. The most common definition is by time: **Makki** is what was revealed before the Hijrah, **Madani** what was revealed after it, even if it came down in Makkah itself.\n\n## Typical features of Makki passages\n- Belief in the oneness of Allah, the Hereafter and prophethood\n- Stories of earlier prophets and peoples\n- Often short verses with strong rhythm\n\n## Typical features of Madani passages\n- Detailed rulings on worship, family, trade and society\n- Addressing the believers as a community, the People of the Book and the hypocrites\n- Often longer verses\n\n## Why it matters\nKnowing the period helps to see how guidance unfolded step by step, to understand the context of a ruling and to identify which verse came later when scholars discuss abrogation.\n\nThe classification comes from reports of the Companions and their students. Some surahs are disputed, and a mainly Makki surah can contain Madani verses, or the other way round.",
        de: "Gelehrte ordnen Suren und Verse als mekkanisch oder medinensisch ein. Die verbreitetste Definition richtet sich nach der Zeit: **mekkanisch** ist, was vor der Hidschra offenbart wurde, **medinensisch**, was danach kam, auch wenn es in Mekka selbst herabgesandt wurde.\n\n## Typische Merkmale mekkanischer Abschnitte\n- Glaube an die Einheit Allahs, das Jenseits und das Prophetentum\n- Geschichten früherer Propheten und Völker\n- Oft kurze Verse mit starkem Rhythmus\n\n## Typische Merkmale medinensischer Abschnitte\n- Ausführliche Bestimmungen zu Gottesdienst, Familie, Handel und Gesellschaft\n- Ansprache der Gläubigen als Gemeinschaft, der Leute der Schrift und der Heuchler\n- Oft längere Verse\n\n## Warum es wichtig ist\nDie Kenntnis der Zeit zeigt, wie sich die Rechtleitung Schritt für Schritt entfaltete, erklärt den Zusammenhang einer Bestimmung und hilft festzustellen, welcher Vers später kam, wenn Gelehrte die Abrogation erörtern.\n\nDie Einordnung beruht auf Berichten der Gefährten und ihrer Schüler. Manche Suren sind umstritten, und eine überwiegend mekkanische Sure kann medinensische Verse enthalten oder umgekehrt.",
        ar: "يقسّم العلماء السور والآيات إلى مكي ومدني. وأشهر التعريفات زمني: **المكي** ما نزل قبل الهجرة، و**المدني** ما نزل بعدها ولو نزل بمكة.\n\n## من سمات المكي غالبًا\n- تقرير التوحيد والبعث والنبوة\n- قصص الأنبياء والأمم السابقة\n- قِصَر الآيات وقوة الإيقاع\n\n## من سمات المدني غالبًا\n- تفصيل أحكام العبادات والأسرة والمعاملات والمجتمع\n- خطاب المؤمنين بوصفهم جماعة، وأهل الكتاب، والمنافقين\n- طول الآيات في الغالب\n\n## فائدته\nمعرفة زمن النزول تُظهر تدرّج التشريع، وتوضح سياق الحكم، وتعين على معرفة المتأخر من الآيات عند البحث في النسخ.\n\nومرجع هذا التقسيم روايات الصحابة والتابعين. وفي بعض السور خلاف، وقد تشتمل السورة المكية على آيات مدنية أو العكس.",
      },
      tags: ["majority"],
      quiz: [
        {
          q: { en: "By the most common definition, what is Makki?", de: "Was ist nach der verbreitetsten Definition mekkanisch?", ar: "ما المكي في أشهر التعريفات؟" },
          options: [
            { en: "Everything revealed inside the city of Makkah", de: "Alles, was in der Stadt Mekka offenbart wurde", ar: "كل ما نزل داخل مكة" },
            { en: "Only the short surahs", de: "Nur die kurzen Suren", ar: "السور القصار فقط" },
            { en: "Everything addressing the believers", de: "Alles, was die Gläubigen anspricht", ar: "كل ما خوطب به المؤمنون" },
            { en: "What was revealed before the Hijrah", de: "Was vor der Hidschra offenbart wurde", ar: "ما نزل قبل الهجرة" },
          ],
          answer: 3,
          explain: { en: "The time-based definition uses the Hijrah as the dividing line.", de: "Die zeitliche Definition nimmt die Hidschra als Trennlinie.", ar: "التعريف الزمني يجعل الهجرة فاصلًا." },
        },
        {
          q: { en: "Which theme is typical of Madani passages?", de: "Welches Thema ist typisch für medinensische Abschnitte?", ar: "أي موضوع يغلب على المدني؟" },
          options: [
            { en: "Detailed rulings for the community", de: "Ausführliche Bestimmungen für die Gemeinschaft", ar: "تفصيل الأحكام للمجتمع" },
            { en: "Only stories of the prophets", de: "Nur Prophetengeschichten", ar: "قصص الأنبياء وحدها" },
            { en: "Only very short verses", de: "Nur sehr kurze Verse", ar: "الآيات القصيرة جدًا فقط" },
            { en: "Poetry contests", de: "Dichterwettbewerbe", ar: "مساجلات الشعر" },
          ],
          answer: 0,
          explain: { en: "In Madinah a community formed, and rulings were detailed.", de: "In Medina entstand eine Gemeinschaft, und Bestimmungen wurden ausgeführt.", ar: "في المدينة قام المجتمع فُصّلت الأحكام." },
        },
        {
          q: { en: "How is the Makki or Madani status of a passage known?", de: "Woher kennt man die Einordnung eines Abschnitts?", ar: "بم يُعرف المكي والمدني؟" },
          options: [
            { en: "By the length of the surah alone", de: "Allein an der Länge der Sure", ar: "بطول السورة وحده" },
            { en: "By reports of the Companions and their students", de: "Durch Berichte der Gefährten und ihrer Schüler", ar: "بروايات الصحابة والتابعين" },
            { en: "By the position in the mushaf", de: "Durch die Stellung im Mushaf", ar: "بموضعها في المصحف" },
            { en: "It is not known at all", de: "Es ist gar nicht bekannt", ar: "لا يُعرف أصلًا" },
          ],
          answer: 1,
          explain: { en: "Themes give hints, but the basis is transmission.", de: "Themen geben Hinweise, die Grundlage ist die Überlieferung.", ar: "الموضوعات قرائن، والأصل هو النقل." },
        },
      ],
    },
    {
      id: "u04-compilation",
      title: { en: "The compilation of the Quran", de: "Die Sammlung des Korans", ar: "جمع القرآن" },
      body: {
        en: "In the Prophet's lifetime the Quran was preserved in memory and written on materials such as palm stalks, parchment and bones. The order of verses within surahs was taught by the Prophet. The Quran states that Allah guards the reminder (15:9) and that its collection and recitation are upon Him (75:17).\n\n## Under Abu Bakr\nAfter many memorisers fell in the battle of Yamamah, Umar urged Abu Bakr to collect the Quran in one place. Zayd ibn Thabit, a scribe of the revelation, gathered the written pieces and checked them against memory and witnesses. These sheets (suhuf) stayed with Abu Bakr, then Umar, then Hafsah. The report is in al-Bukhari.\n\n## Under Uthman\nAs Islam spread, people differed in how they recited. Uthman had copies (masahif) made from Hafsah's sheets by a committee including Zayd, sent them to the major cities and asked that other private copies be burned. The written form of these copies is called the **Uthmani rasm**.\n\nLater, dots and vowel signs were added to ease reading.",
        de: "Zu Lebzeiten des Propheten wurde der Koran im Gedächtnis bewahrt und auf Materialien wie Palmstängel, Pergament und Knochen geschrieben. Die Reihenfolge der Verse innerhalb der Suren lehrte der Prophet. Der Koran sagt, dass Allah die Ermahnung bewahrt (15:9) und dass Ihm ihre Sammlung und Rezitation obliegen (75:17).\n\n## Unter Abu Bakr\nNachdem in der Schlacht von Yamama viele Hafiz gefallen waren, drängte Umar Abu Bakr, den Koran an einem Ort zu sammeln. Zaid ibn Thabit, ein Schreiber der Offenbarung, trug die geschriebenen Stücke zusammen und prüfte sie an Gedächtnis und Zeugen. Diese Blätter (Suhuf) blieben bei Abu Bakr, dann Umar, dann Hafsa. Der Bericht steht bei al-Buchari.\n\n## Unter Uthman\nMit der Ausbreitung des Islam wichen Menschen in der Rezitation voneinander ab. Uthman ließ von einer Kommission mit Zaid nach Hafsas Blättern Abschriften (Masahif) anfertigen, schickte sie in die großen Städte und ordnete an, andere private Abschriften zu verbrennen. Die Schreibweise dieser Abschriften heißt **uthmanischer Rasm**.\n\nSpäter kamen Punkte und Vokalzeichen hinzu, um das Lesen zu erleichtern.",
        ar: "في حياة النبي حُفظ القرآن في الصدور وكُتب على العُسُب والرقاع والعظام، وكان ترتيب الآيات في السور بتوقيف من النبي. ويقرر القرآن أن الله حافظ للذكر (15:9) وأن عليه جمعه وقرآنه (75:17).\n\n## في عهد أبي بكر\nبعد أن استحرّ القتل بالقراء يوم اليمامة، أشار عمر على أبي بكر بجمع القرآن في موضع واحد. فتتبّع زيد بن ثابت، كاتب الوحي، المكتوب وقابله بالمحفوظ والشهود. وبقيت هذه الصحف عند أبي بكر ثم عمر ثم حفصة. والخبر في صحيح البخاري.\n\n## في عهد عثمان\nلما اتسعت الفتوح اختلف الناس في القراءة، فأمر عثمان لجنة فيها زيد بنسخ المصاحف من صحف حفصة، وأرسلها إلى الأمصار، وأمر بإحراق ما سواها من المصاحف الخاصة. ويسمى رسم هذه المصاحف **الرسم العثماني**.\n\nثم أُضيف النقط والشكل لاحقًا تيسيرًا للقراءة.",
      },
      verses: ["15:9", "75:17"],
      hadith: ["bukhari:4986", "bukhari:4987"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "Which event led to the compilation under Abu Bakr?", de: "Welches Ereignis führte zur Sammlung unter Abu Bakr?", ar: "ما الحدث الذي دعا إلى الجمع في عهد أبي بكر؟" },
          options: [
            { en: "The conquest of Makkah", de: "Die Einnahme Mekkas", ar: "فتح مكة" },
            { en: "The battle of Badr", de: "Die Schlacht von Badr", ar: "غزوة بدر" },
            { en: "The loss of many memorisers at Yamamah", de: "Der Tod vieler Hafiz bei Yamama", ar: "مقتل كثير من القراء يوم اليمامة" },
            { en: "A dispute about the calendar", de: "Ein Streit über den Kalender", ar: "خلاف حول التقويم" },
          ],
          answer: 2,
          explain: { en: "Umar feared that parts could be lost with the memorisers.", de: "Umar fürchtete, dass mit den Hafiz Teile verloren gehen könnten.", ar: "خشي عمر أن يذهب شيء من القرآن بذهاب القراء." },
        },
        {
          q: { en: "Who led the collecting of the written pieces?", de: "Wer leitete das Sammeln der geschriebenen Stücke?", ar: "من تولّى تتبّع المكتوب وجمعه؟" },
          options: [
            { en: "Zayd ibn Thabit", de: "Zaid ibn Thabit", ar: "زيد بن ثابت" },
            { en: "Khalid ibn al-Walid", de: "Chalid ibn al-Walid", ar: "خالد بن الوليد" },
            { en: "Abu Hurayrah", de: "Abu Huraira", ar: "أبو هريرة" },
            { en: "Salman al-Farisi", de: "Salman al-Farisi", ar: "سلمان الفارسي" },
          ],
          answer: 0,
          explain: { en: "Zayd was a scribe of the revelation.", de: "Zaid war ein Schreiber der Offenbarung.", ar: "كان زيد من كتّاب الوحي." },
        },
        {
          q: { en: "What did Uthman do with the copies made from Hafsah's sheets?", de: "Was tat Uthman mit den Abschriften nach Hafsas Blättern?", ar: "ماذا فعل عثمان بالمصاحف المنسوخة من صحف حفصة؟" },
          options: [
            { en: "Kept them hidden in Madinah", de: "Hielt sie in Medina verborgen", ar: "أخفاها في المدينة" },
            { en: "Translated them into Persian", de: "Ließ sie ins Persische übersetzen", ar: "ترجمها إلى الفارسية" },
            { en: "Gave them only to the caliph's family", de: "Gab sie nur der Familie des Kalifen", ar: "خصّ بها أهل الخليفة" },
            { en: "Sent them to the major cities", de: "Schickte sie in die großen Städte", ar: "أرسلها إلى الأمصار" },
          ],
          answer: 3,
          explain: { en: "The copies unified the written text across the regions.", de: "Die Abschriften vereinheitlichten den geschriebenen Text in den Regionen.", ar: "وحّدت المصاحف الرسم في الأمصار." },
        },
      ],
    },
    {
      id: "u05-qiraat-ahruf",
      title: { en: "Qira'at and the seven ahruf", de: "Qira'at und die sieben Ahruf", ar: "القراءات والأحرف السبعة" },
      body: {
        en: "Authentic reports state that the Quran was revealed in seven **ahruf** (modes). In a report in al-Bukhari, Umar heard Hisham ibn Hakim recite al-Furqan differently; the Prophet approved both readings.\n\n## What are the ahruf?\nScholars hold many views: dialects of the Arabs, types of variation in wording, or a figure of ease rather than an exact number. There is no single agreed definition.\n\n## The qira'at\nA qira'ah is a recognised way of reciting, transmitted with a chain back to the Prophet. Ibn Mujahid in the 4th Hijri century selected seven readers; later scholars, notably Ibn al-Jazari, added three, giving **the ten readings**. Each reader has transmitters, for example Hafs and Warsh.\n\n## Conditions of acceptance\nClassical scholars generally require a reading to:\n- be soundly and widely transmitted,\n- fit the Uthmani rasm,\n- agree with Arabic grammar.\n\nThe relation between the ahruf and the qira'at is itself discussed. Many hold that the readings preserve what fits the Uthmani copies.",
        de: "Authentische Berichte besagen, dass der Koran in sieben **Ahruf** (Weisen) offenbart wurde. In einem Bericht bei al-Buchari hörte Umar, wie Hischam ibn Hakim al-Furqan anders rezitierte; der Prophet billigte beide Lesungen.\n\n## Was sind die Ahruf?\nGelehrte vertreten viele Ansichten: Dialekte der Araber, Arten von Abweichungen im Wortlaut oder ein Ausdruck der Erleichterung statt einer genauen Zahl. Eine einzige anerkannte Definition gibt es nicht.\n\n## Die Qira'at\nEine Qira'a ist eine anerkannte Rezitationsweise, die mit einer Kette bis zum Propheten überliefert ist. Ibn Mudschahid wählte im 4. Jahrhundert der Hidschra sieben Leser aus; spätere Gelehrte, vor allem Ibn al-Dschazari, fügten drei hinzu, sodass man von **den zehn Lesarten** spricht. Jeder Leser hat Überlieferer, etwa Hafs und Warsch.\n\n## Bedingungen der Annahme\nKlassische Gelehrte verlangen allgemein, dass eine Lesart:\n- verlässlich und breit überliefert ist,\n- zum uthmanischen Rasm passt,\n- der arabischen Grammatik entspricht.\n\nDas Verhältnis von Ahruf und Qira'at wird selbst diskutiert. Viele meinen, die Lesarten bewahren, was zu den uthmanischen Abschriften passt.",
        ar: "ثبت في الأخبار الصحيحة أن القرآن أُنزل على سبعة **أحرف**. وفي رواية عند البخاري سمع عمر هشام بن حكيم يقرأ سورة الفرقان على غير ما أقرأه، فأقرّ النبي القراءتين.\n\n## ما الأحرف؟\nللعلماء فيها أقوال كثيرة: لغات العرب، أو أوجه التغاير في الألفاظ، أو أن العدد للتيسير لا للحصر. ولا يوجد تعريف واحد متفق عليه.\n\n## القراءات\nالقراءة وجه معتمد من وجوه الأداء منقول بالإسناد إلى النبي. اختار ابن مجاهد في القرن الرابع الهجري سبعة قراء، ثم أضاف العلماء، ومنهم ابن الجزري، ثلاثة فصارت **القراءات العشر**. ولكل قارئ رواة، مثل حفص وورش.\n\n## ضوابط القبول\nيشترط العلماء عمومًا في القراءة:\n- صحة السند وشهرته،\n- موافقة الرسم العثماني،\n- موافقة العربية.\n\nوالعلاقة بين الأحرف والقراءات نفسها محل بحث، ويرى كثيرون أن القراءات تحفظ ما وافق المصاحف العثمانية.",
      },
      hadith: ["bukhari:4992"],
      tags: ["varies"],
      quiz: [
        {
          q: { en: "How many recognised readings are commonly counted today?", de: "Wie viele anerkannte Lesarten zählt man heute gewöhnlich?", ar: "كم عدد القراءات المعتمدة المشهورة اليوم؟" },
          options: [
            { en: "Three", de: "Drei", ar: "ثلاث" },
            { en: "Ten", de: "Zehn", ar: "عشر" },
            { en: "Forty", de: "Vierzig", ar: "أربعون" },
            { en: "One", de: "Eine", ar: "واحدة" },
          ],
          answer: 1,
          explain: { en: "Seven chosen by Ibn Mujahid plus three added later.", de: "Sieben von Ibn Mudschahid ausgewählt, drei später hinzugefügt.", ar: "سبع اختارها ابن مجاهد وثلاث أُضيفت بعد." },
        },
        {
          q: { en: "Which is a classical condition for accepting a reading?", de: "Welche ist eine klassische Bedingung für die Annahme einer Lesart?", ar: "أي مما يلي من ضوابط قبول القراءة؟" },
          options: [
            { en: "That it is the most popular in one city", de: "Dass sie in einer Stadt am beliebtesten ist", ar: "أن تكون الأشهر في مدينة واحدة" },
            { en: "That a ruler approves it", de: "Dass ein Herrscher sie billigt", ar: "أن يقرّها الحاكم" },
            { en: "That it fits the Uthmani rasm", de: "Dass sie zum uthmanischen Rasm passt", ar: "موافقة الرسم العثماني" },
            { en: "That it is easier to pronounce", de: "Dass sie leichter auszusprechen ist", ar: "أن تكون أسهل نطقًا" },
          ],
          answer: 2,
          explain: { en: "Sound transmission, the Uthmani rasm and Arabic grammar are the usual conditions.", de: "Verlässliche Überlieferung, uthmanischer Rasm und arabische Grammatik sind die üblichen Bedingungen.", ar: "صحة السند وموافقة الرسم والعربية هي الضوابط المعروفة." },
        },
        {
          q: { en: "Is there one agreed definition of the seven ahruf?", de: "Gibt es eine einzige anerkannte Definition der sieben Ahruf?", ar: "هل للأحرف السبعة تعريف واحد متفق عليه؟" },
          options: [
            { en: "No, scholars hold many views", de: "Nein, Gelehrte vertreten viele Ansichten", ar: "لا، للعلماء فيها أقوال كثيرة" },
            { en: "Yes, they are the seven readers", de: "Ja, es sind die sieben Leser", ar: "نعم، هي القراء السبعة" },
            { en: "Yes, they are seven languages", de: "Ja, es sind sieben Sprachen", ar: "نعم، هي سبع لغات أعجمية" },
            { en: "Yes, they are seven surahs", de: "Ja, es sind sieben Suren", ar: "نعم، هي سبع سور" },
          ],
          answer: 0,
          explain: { en: "The ahruf are not the same as the seven readers; their meaning is discussed.", de: "Die Ahruf sind nicht dasselbe wie die sieben Leser; ihre Bedeutung wird diskutiert.", ar: "الأحرف غير القراءات السبع، ومعناها محل خلاف." },
        },
      ],
    },
    {
      id: "u06-naskh",
      title: { en: "Naskh (abrogation)", de: "Naskh (Abrogation)", ar: "النسخ" },
      body: {
        en: "Naskh means that a later ruling replaces an earlier one. Scholars who discuss it usually cite 2:106 and 16:101, which speak of a verse being replaced by another.\n\n## How classical scholars describe it\n- It concerns rulings, not reports about Allah, the unseen or past events.\n- It is established by clear evidence about which came later, not by opinion.\n- Gradual legislation is often given as an example, such as the stages concerning intoxicants.\n\n## Types often listed\n- the ruling removed, the wording still recited\n- the wording removed, the ruling remaining\n- both removed\nThe second and third types are debated.\n\n## A field of debate\nThe number of abrogated verses differs greatly between authors. Early works listed many cases, partly because early scholars also called specification or clarification naskh. Later scholars such as al-Suyuti reduced the list to around twenty, Shah Waliullah to five, and some scholars, classical and modern, reject or limit abrogation within the Quran and try to reconcile the verses. Learners should know that this is a field of real scholarly discussion.",
        de: "Naskh bedeutet, dass eine spätere Bestimmung eine frühere ersetzt. Gelehrte, die es erörtern, nennen meist 2:106 und 16:101, die davon sprechen, dass ein Vers durch einen anderen ersetzt wird.\n\n## Wie klassische Gelehrte es beschreiben\n- Es betrifft Bestimmungen, nicht Berichte über Allah, das Verborgene oder vergangene Ereignisse.\n- Es wird durch klare Belege festgestellt, welcher Vers später kam, nicht durch Meinung.\n- Als Beispiel gilt oft die schrittweise Gesetzgebung, etwa die Stufen bei Rauschmitteln.\n\n## Häufig genannte Arten\n- Bestimmung aufgehoben, Wortlaut wird weiter rezitiert\n- Wortlaut aufgehoben, Bestimmung bleibt\n- beides aufgehoben\nDie zweite und dritte Art sind umstritten.\n\n## Ein Feld der Diskussion\nDie Zahl der abrogierten Verse unterscheidet sich stark je nach Autor. Frühe Werke nannten viele Fälle, auch weil frühe Gelehrte Spezifizierung oder Erläuterung ebenfalls Naskh nannten. Spätere wie as-Suyuti verkürzten die Liste auf etwa zwanzig, Schah Waliullah auf fünf, und manche Gelehrte, klassische wie moderne, lehnen Abrogation im Koran ab oder begrenzen sie und versuchen, die Verse zu vereinbaren. Lernende sollten wissen, dass dies ein Feld echter gelehrter Diskussion ist.",
        ar: "النسخ رفع حكم شرعي متقدم بحكم متأخر. ويستدل من يبحثه عادة بالآيتين 2:106 و16:101 اللتين تذكران تبديل آية مكان آية.\n\n## كيف وصفه العلماء\n- يكون في الأحكام، لا في الأخبار عن الله والغيب والوقائع الماضية.\n- يثبت بدليل صريح على التأخر، لا بالرأي.\n- يُمثَّل له كثيرًا بالتدرج في التشريع، كمراحل تحريم الخمر.\n\n## أنواع مشهورة\n- نسخ الحكم وبقاء التلاوة\n- نسخ التلاوة وبقاء الحكم\n- نسخهما معًا\nوفي النوعين الأخيرين خلاف.\n\n## مجال خلاف\nيتفاوت عدد الآيات المنسوخة عند المؤلفين تفاوتًا كبيرًا. فقد أكثر المتقدمون من ذكرها، لأنهم سمّوا التخصيص والبيان نسخًا أيضًا. ثم قلّلها المتأخرون، فذكر السيوطي نحو عشرين، وشاه ولي الله خمسًا، ومن العلماء قديمًا وحديثًا من ينكر النسخ في القرآن أو يضيّقه ويجمع بين الآيات. فليعلم المتعلم أن المسألة محل بحث علمي حقيقي.",
      },
      verses: ["2:106", "16:101"],
      tags: ["varies"],
      quiz: [
        {
          q: { en: "According to classical scholars, what can naskh apply to?", de: "Worauf kann Naskh nach klassischen Gelehrten angewendet werden?", ar: "فيم يقع النسخ عند العلماء؟" },
          options: [
            { en: "Reports about past events", de: "Berichte über vergangene Ereignisse", ar: "الأخبار عن الماضي" },
            { en: "Rulings", de: "Bestimmungen", ar: "الأحكام" },
            { en: "The attributes of Allah", de: "Die Eigenschaften Allahs", ar: "صفات الله" },
            { en: "The unseen", de: "Das Verborgene", ar: "الغيب" },
          ],
          answer: 1,
          explain: { en: "Naskh concerns rulings, not reports.", de: "Naskh betrifft Bestimmungen, nicht Berichte.", ar: "النسخ في الأحكام لا في الأخبار." },
        },
        {
          q: { en: "Why did early works list many more abrogated verses?", de: "Warum nannten frühe Werke viel mehr abrogierte Verse?", ar: "لماذا أكثر المتقدمون من ذكر المنسوخ؟" },
          options: [
            { en: "They had a different Quran", de: "Sie hatten einen anderen Koran", ar: "لأن مصحفهم مختلف" },
            { en: "They counted only Makki verses", de: "Sie zählten nur mekkanische Verse", ar: "لأنهم عدّوا المكي فقط" },
            { en: "They did not know Arabic", de: "Sie konnten kein Arabisch", ar: "لأنهم لم يعرفوا العربية" },
            { en: "They also called specification or clarification naskh", de: "Sie nannten auch Spezifizierung oder Erläuterung Naskh", ar: "لأنهم سمّوا التخصيص والبيان نسخًا" },
          ],
          answer: 3,
          explain: { en: "The term was used more broadly in early times.", de: "Der Begriff wurde früher weiter verwendet.", ar: "كان المصطلح أوسع عند المتقدمين." },
        },
        {
          q: { en: "How do scholars view the number of abrogated verses?", de: "Wie sehen Gelehrte die Zahl der abrogierten Verse?", ar: "ما موقف العلماء من عدد الآيات المنسوخة؟" },
          options: [
            { en: "It is debated; some list many, some few, some none", de: "Sie ist umstritten; manche nennen viele, manche wenige, manche keine", ar: "مختلف فيه: بين مكثر ومقلّ ومنكر" },
            { en: "Exactly one hundred by consensus", de: "Genau hundert nach Konsens", ar: "مئة بالإجماع" },
            { en: "Every Makki verse is abrogated", de: "Jeder mekkanische Vers ist abrogiert", ar: "كل المكي منسوخ" },
            { en: "The question was never discussed", de: "Die Frage wurde nie diskutiert", ar: "لم تُبحث المسألة قط" },
          ],
          answer: 0,
          explain: { en: "Al-Suyuti listed around twenty, Shah Waliullah five; others reconcile the verses.", de: "As-Suyuti nannte etwa zwanzig, Schah Waliullah fünf; andere vereinbaren die Verse.", ar: "ذكر السيوطي نحو عشرين، وشاه ولي الله خمسًا، وجمع آخرون بين الآيات." },
        },
      ],
    },
    {
      id: "u07-muhkam-mutashabih",
      title: { en: "Muhkam and mutashabih", de: "Muhkam und Mutaschabih", ar: "المحكم والمتشابه" },
      body: {
        en: "Al Imran 3:7 describes two kinds of verses in the Book: **muhkam** verses, which are the foundation of the Book, and others that are **mutashabih**. It warns against those with deviation in their hearts who follow the ambiguous seeking discord, and praises those firm in knowledge who say that all is from their Lord.\n\n## Meanings of the terms\n- **Muhkam**: clear, firmly established, with one evident meaning.\n- **Mutashabih**: open to more than one meaning, or whose full reality is known only to Allah.\nIn a wider sense the whole Quran is called muhkam, well made (11:1), and mutashabih, consistent and alike in excellence (39:23).\n\n## A famous difference: the pause\nScholars differ on whether to pause after the mention of Allah in 3:7, meaning only He knows the interpretation, or to continue, meaning the firmly grounded in knowledge also know it. Both views are classical, and many reconcile them by distinguishing kinds of knowledge.\n\n## The method\nThe ambiguous is read in the light of the clear. Theological schools differ in how they treat verses about Allah's attributes.",
        de: "Al Imran 3:7 beschreibt zwei Arten von Versen im Buch: **Muhkam**-Verse, die die Grundlage des Buches sind, und andere, die **mutaschabih** sind. Er warnt vor denen, in deren Herzen Abweichung ist und die dem Mehrdeutigen folgen, um Zwietracht zu suchen, und lobt die im Wissen Gefestigten, die sagen, dass alles von ihrem Herrn ist.\n\n## Bedeutung der Begriffe\n- **Muhkam**: klar, fest begründet, mit einer offensichtlichen Bedeutung.\n- **Mutaschabih**: offen für mehr als eine Bedeutung oder in seiner vollen Wirklichkeit nur Allah bekannt.\nIm weiteren Sinn heißt der ganze Koran muhkam, wohlgefügt (11:1), und mutaschabih, einheitlich und gleich in seiner Vortrefflichkeit (39:23).\n\n## Ein bekannter Unterschied: die Pause\nGelehrte unterscheiden sich, ob man in 3:7 nach der Erwähnung Allahs pausiert, sodass nur Er die Deutung kennt, oder weiterliest, sodass auch die im Wissen Gefestigten sie kennen. Beide Ansichten sind klassisch, und viele vereinbaren sie, indem sie Arten des Wissens unterscheiden.\n\n## Die Methode\nDas Mehrdeutige wird im Licht des Klaren gelesen. Theologische Schulen unterscheiden sich darin, wie sie Verse über Allahs Eigenschaften behandeln.",
        ar: "تصف آية آل عمران 3:7 نوعين من الآيات في الكتاب: آيات **محكمات** هي أصل الكتاب، وأخر **متشابهات**. وتحذّر ممن في قلوبهم زيغ فيتبعون المتشابه ابتغاء الفتنة، وتثني على الراسخين في العلم الذين يقولون كلٌّ من عند ربنا.\n\n## معنى المصطلحين\n- **المحكم**: الواضح الثابت الذي له معنى ظاهر واحد.\n- **المتشابه**: ما احتمل أكثر من معنى، أو ما استأثر الله بعلم حقيقته.\nوبالمعنى العام يوصف القرآن كله بأنه محكم أي متقن (11:1)، ومتشابه أي يشبه بعضه بعضًا في الحسن (39:23).\n\n## خلاف مشهور: الوقف\nاختلف العلماء أيوقف بعد ذكر اسم الله في 3:7 فيكون التأويل لا يعلمه إلا الله، أم يوصل فيعلمه الراسخون في العلم أيضًا. والقولان معروفان عند السلف، وجمع كثيرون بينهما بالتفريق بين أنواع العلم.\n\n## المنهج\nيُرَدّ المتشابه إلى المحكم. وتختلف المدارس العقدية في التعامل مع آيات الصفات.",
      },
      verses: ["3:7", "11:1", "39:23"],
      tags: ["varies", "athari", "ashari", "maturidi"],
      quiz: [
        {
          q: { en: "How does 3:7 describe the muhkam verses?", de: "Wie beschreibt 3:7 die Muhkam-Verse?", ar: "كيف تصف 3:7 الآيات المحكمات؟" },
          options: [
            { en: "As abrogated", de: "Als abrogiert", ar: "منسوخة" },
            { en: "As stories only", de: "Nur als Geschichten", ar: "قصصًا فحسب" },
            { en: "As the foundation of the Book", de: "Als Grundlage des Buches", ar: "أم الكتاب" },
            { en: "As unknown to anyone", de: "Als niemandem bekannt", ar: "لا يعلمها أحد" },
          ],
          answer: 2,
          explain: { en: "The clear verses are the foundation to which the rest is referred.", de: "Die klaren Verse sind die Grundlage, auf die das Übrige bezogen wird.", ar: "المحكمات هي الأصل الذي يُرَدّ إليه غيره." },
        },
        {
          q: { en: "What is the method for ambiguous verses?", de: "Wie geht man mit mehrdeutigen Versen um?", ar: "ما المنهج في المتشابه؟" },
          options: [
            { en: "Ignore them", de: "Sie ignorieren", ar: "إهمالها" },
            { en: "Choose any meaning one likes", de: "Jede gewünschte Bedeutung wählen", ar: "اختيار أي معنى يُستحسن" },
            { en: "Read them only in translation", de: "Sie nur in Übersetzung lesen", ar: "قراءتها مترجمة فقط" },
            { en: "Read them in the light of the clear verses", de: "Sie im Licht der klaren Verse lesen", ar: "ردّها إلى المحكم" },
          ],
          answer: 3,
          explain: { en: "The clear verses guide the understanding of the ambiguous.", de: "Die klaren Verse leiten das Verständnis des Mehrdeutigen.", ar: "المحكم يضبط فهم المتشابه." },
        },
        {
          q: { en: "What is the famous difference about 3:7?", de: "Worin besteht der bekannte Unterschied zu 3:7?", ar: "ما الخلاف المشهور في 3:7؟" },
          options: [
            { en: "Where to pause, and so who knows the interpretation", de: "Wo man pausiert und wer daher die Deutung kennt", ar: "موضع الوقف ومن ثم من يعلم التأويل" },
            { en: "Whether it is Makki or Madani", de: "Ob er mekkanisch oder medinensisch ist", ar: "أمكية هي أم مدنية" },
            { en: "Whether it belongs to al-Baqarah", de: "Ob er zu al-Baqara gehört", ar: "أهي من البقرة" },
            { en: "Whether it was compiled by Uthman", de: "Ob Uthman ihn gesammelt hat", ar: "أجمعها عثمان" },
          ],
          answer: 0,
          explain: { en: "Both readings are classical and are often reconciled.", de: "Beide Lesungen sind klassisch und werden oft vereinbart.", ar: "القولان معروفان، وكثيرًا ما يُجمع بينهما." },
        },
      ],
    },
    {
      id: "u08-types-works",
      title: { en: "Types of tafsir and major works", de: "Arten des Tafsir und große Werke", ar: "أنواع التفسير وأشهر كتبه" },
      body: {
        en: "## Sources of explanation\nClassical scholars describe an order: the Quran explaining itself, then the Sunnah, then the Companions, then their students, then the Arabic language. Tafsir that relies mainly on these reports is called **bil-ma'thur**. Tafsir that also uses reasoned interpretation within these limits is called **bil-ra'y**; scholars praised the disciplined form and criticised opinion without knowledge.\n\n## Other approaches\nLegal (ahkam), linguistic, theological, spiritual (ishari) and thematic tafsir, as well as modern social readings.\n\n## Major works\n- **al-Tabari** (d. 310 AH): Jami' al-Bayan, a vast collection of early reports with his own weighing.\n- **Ibn Kathir** (d. 774 AH): explains the Quran by the Quran and hadith; widely read today.\n- **al-Qurtubi** (d. 671 AH): al-Jami' li-Ahkam al-Quran, focused on legal questions across schools.\n- **Fakhr al-Din al-Razi** (d. 606 AH): Mafatih al-Ghayb, with extensive theological and philosophical discussion.\n- **Tafsir al-Jalalayn**: a concise work by al-Mahalli and al-Suyuti.\n- **al-Mizan** by Tabataba'i (d. 1981): a major Shia work that explains the Quran by the Quran.\n\nEach work reflects its author's school and time; comparing several gives a fuller picture.",
        de: "## Quellen der Erklärung\nKlassische Gelehrte nennen eine Reihenfolge: der Koran erklärt sich selbst, dann die Sunna, dann die Gefährten, dann ihre Schüler, dann die arabische Sprache. Tafsir, der sich vor allem auf diese Berichte stützt, heißt **bil-Ma'thur**. Tafsir, der innerhalb dieser Grenzen auch begründete Auslegung nutzt, heißt **bir-Ra'y**; Gelehrte lobten die disziplinierte Form und kritisierten Meinung ohne Wissen.\n\n## Weitere Zugänge\nRechtlicher (Ahkam), sprachlicher, theologischer, spiritueller (ischari) und thematischer Tafsir sowie moderne gesellschaftliche Lesarten.\n\n## Große Werke\n- **at-Tabari** (gest. 310 n. H.): Dschami' al-Bayan, eine umfangreiche Sammlung früher Berichte mit eigener Abwägung.\n- **Ibn Kathir** (gest. 774 n. H.): erklärt den Koran durch den Koran und Hadith; heute weit verbreitet.\n- **al-Qurtubi** (gest. 671 n. H.): al-Dschami' li-Ahkam al-Qur'an, mit Schwerpunkt auf Rechtsfragen über die Schulen hinweg.\n- **Fachr ad-Din ar-Razi** (gest. 606 n. H.): Mafatih al-Ghaib, mit ausführlichen theologischen und philosophischen Erörterungen.\n- **Tafsir al-Dschalalain**: ein knappes Werk von al-Mahalli und as-Suyuti.\n- **al-Mizan** von Tabataba'i (gest. 1981): ein bedeutendes schiitisches Werk, das den Koran durch den Koran erklärt.\n\nJedes Werk spiegelt Schule und Zeit seines Autors; der Vergleich mehrerer ergibt ein vollständigeres Bild.",
        ar: "## مصادر البيان\nيذكر العلماء ترتيبًا: تفسير القرآن بالقرآن، ثم بالسنة، ثم بأقوال الصحابة، ثم التابعين، ثم باللغة العربية. ويسمى التفسير القائم أساسًا على هذه المرويات **التفسير بالمأثور**. ويسمى ما يُعمل فيه الاجتهاد المنضبط في هذه الحدود **التفسير بالرأي**؛ وقد مدح العلماء المحمود منه وذمّوا القول بغير علم.\n\n## اتجاهات أخرى\nالتفسير الفقهي، واللغوي، والكلامي، والإشاري، والموضوعي، والقراءات الاجتماعية الحديثة.\n\n## أشهر الكتب\n- **الطبري** (ت 310 هـ): جامع البيان، موسوعة لأقوال السلف مع ترجيحه.\n- **ابن كثير** (ت 774 هـ): يفسر القرآن بالقرآن والحديث، وهو واسع الانتشار اليوم.\n- **القرطبي** (ت 671 هـ): الجامع لأحكام القرآن، يُعنى بالمسائل الفقهية عند المذاهب.\n- **فخر الدين الرازي** (ت 606 هـ): مفاتيح الغيب، فيه مباحث كلامية وفلسفية واسعة.\n- **تفسير الجلالين**: مختصر للمحلي والسيوطي.\n- **الميزان** للطباطبائي (ت 1981): عمل شيعي بارز يفسر القرآن بالقرآن.\n\nكل كتاب يعكس مذهب مؤلفه وعصره، والمقارنة بين عدة كتب تعطي صورة أتم.",
      },
      verses: ["16:44"],
      tags: ["varies", "jafari"],
      quiz: [
        {
          q: { en: "What is tafsir bil-ma'thur?", de: "Was ist Tafsir bil-Ma'thur?", ar: "ما التفسير بالمأثور؟" },
          options: [
            { en: "Tafsir based mainly on the Quran, Sunnah and early reports", de: "Tafsir, der vor allem auf Koran, Sunna und frühen Berichten beruht", ar: "تفسير يقوم أساسًا على القرآن والسنة وأقوال السلف" },
            { en: "Tafsir based on dreams", de: "Tafsir, der auf Träumen beruht", ar: "تفسير قائم على المنامات" },
            { en: "A purely scientific tafsir", de: "Ein rein naturwissenschaftlicher Tafsir", ar: "تفسير علمي بحت" },
            { en: "A translation without notes", de: "Eine Übersetzung ohne Anmerkungen", ar: "ترجمة بلا حواشٍ" },
          ],
          answer: 0,
          explain: { en: "Ma'thur means transmitted.", de: "Ma'thur bedeutet überliefert.", ar: "المأثور هو المنقول." },
        },
        {
          q: { en: "Which work focuses on legal questions across the schools?", de: "Welches Werk konzentriert sich auf Rechtsfragen über die Schulen hinweg?", ar: "أي كتاب يُعنى بالأحكام الفقهية عند المذاهب؟" },
          options: [
            { en: "Tafsir al-Jalalayn", de: "Tafsir al-Dschalalain", ar: "تفسير الجلالين" },
            { en: "Mafatih al-Ghayb", de: "Mafatih al-Ghaib", ar: "مفاتيح الغيب" },
            { en: "Al-Jami' li-Ahkam al-Quran by al-Qurtubi", de: "Al-Dschami' li-Ahkam al-Qur'an von al-Qurtubi", ar: "الجامع لأحكام القرآن للقرطبي" },
            { en: "Al-Mizan", de: "Al-Mizan", ar: "الميزان" },
          ],
          answer: 2,
          explain: { en: "Ahkam means rulings; al-Qurtubi discusses them in detail.", de: "Ahkam bedeutet Bestimmungen; al-Qurtubi erörtert sie ausführlich.", ar: "الأحكام هي محور تفسير القرطبي." },
        },
        {
          q: { en: "Which of these is a Shia work of tafsir?", de: "Welches davon ist ein schiitisches Tafsir-Werk?", ar: "أي هذه الكتب تفسير شيعي؟" },
          options: [
            { en: "Jami' al-Bayan by al-Tabari", de: "Dschami' al-Bayan von at-Tabari", ar: "جامع البيان للطبري" },
            { en: "Al-Mizan by Tabataba'i", de: "Al-Mizan von Tabataba'i", ar: "الميزان للطباطبائي" },
            { en: "Tafsir Ibn Kathir", de: "Tafsir Ibn Kathir", ar: "تفسير ابن كثير" },
            { en: "Tafsir al-Jalalayn", de: "Tafsir al-Dschalalain", ar: "تفسير الجلالين" },
          ],
          answer: 1,
          explain: { en: "Al-Mizan is a major 20th-century Shia tafsir.", de: "Al-Mizan ist ein bedeutender schiitischer Tafsir des 20. Jahrhunderts.", ar: "الميزان تفسير شيعي بارز من القرن العشرين." },
        },
      ],
    },
  ],
};
