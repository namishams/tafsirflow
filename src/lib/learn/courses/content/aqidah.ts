// mirrors mobile/src/features/courses/content/aqidah.ts (copied for the website; keep both in step)
// Course: Aqidah basics. No Quran or hadith text is quoted; references only.
import type { Course, L } from "../types";

const t = (en: string, de: string, ar: string): L => ({ en, de, ar });

export const AQIDAH: Course = {
  id: "aqidah",
  title: t("Aqidah basics", "Grundlagen der Glaubenslehre", "مبادئ العقيدة"),
  lead: t(
    "The articles of faith in Islam, explained clearly and with respect for the schools.",
    "Die Glaubensartikel im Islam, klar erklärt und mit Respekt vor den Schulen.",
    "أركان الإيمان في الإسلام بشرح واضح واحترام للمدارس."
  ),
  word: "العقيدة",
  free: 1,
  note: t(
    "This course describes mainstream positions and names where the schools (Ash'ari, Maturidi, Athari, and Shia theology where relevant) differ. It is an introduction, not a fatwa.",
    "Dieser Kurs beschreibt verbreitete Positionen und nennt, wo sich die Schulen (aschʿaritisch, maturiditisch, atharitisch und, wo relevant, schiitische Theologie) unterscheiden. Er ist eine Einführung, keine Fatwa.",
    "يعرض هذا المقرر الأقوال المشهورة ويبيّن مواضع الخلاف بين المدارس (الأشاعرة والماتريدية وأهل الأثر، والعقيدة الشيعية حيث يلزم). وهو مدخل تعليمي وليس فتوى."
  ),
  lessons: [
    {
      id: "a01-articles",
      title: t("The six articles of faith", "Die sechs Glaubensartikel", "أركان الإيمان الستة"),
      body: t(
        `In the well-known Hadith of Jibril, the Prophet was asked about Islam, iman (faith) and ihsan. In answer to the question about faith he named six things to believe in:

- **God** (Allah), the One
- **His angels**
- **His revealed books**
- **His messengers**
- **The Last Day**
- **Divine decree** (qadar), its good and its bad

The Quran mentions most of these together in several places, for example at the end of Surat al-Baqarah.

## Faith, Islam and ihsan
The same hadith distinguishes Islam (the outward pillars such as prayer and fasting), iman (inner belief) and ihsan (worshipping God as though one sees Him). Scholars discussed how faith relates to deeds and whether it increases and decreases; the schools express this differently.

## Shia framing
Twelver Shia theology usually presents the "roots of religion" (usul al-din) as tawhid, divine justence, prophethood, imamate and the resurrection, while also affirming angels, books and decree.

This course takes each article in turn.`,
        `Im bekannten Hadith Dschibrils wurde der Prophet nach Islam, Iman (Glauben) und Ihsan gefragt. Auf die Frage nach dem Glauben nannte er sechs Glaubensinhalte:

- **Gott** (Allah), der Eine
- **Seine Engel**
- **Seine offenbarten Bücher**
- **Seine Gesandten**
- **Der Jüngste Tag**
- **Die göttliche Bestimmung** (Qadar), das Gute wie das Schlechte

Der Koran nennt die meisten davon an mehreren Stellen zusammen, etwa am Ende der Sure al-Baqara.

## Glaube, Islam und Ihsan
Derselbe Hadith unterscheidet Islam (die äußeren Säulen wie Gebet und Fasten), Iman (inneren Glauben) und Ihsan (Gott so zu dienen, als sähe man Ihn). Gelehrte haben diskutiert, wie Glaube und Taten zusammenhängen und ob der Glaube zu- und abnimmt; die Schulen drücken das unterschiedlich aus.

## Schiitische Darstellung
Die zwölferschiitische Theologie fasst die „Wurzeln der Religion“ (usul ad-din) meist als Tauhid, göttliche Gerechtigkeit, Prophetentum, Imamat und Auferstehung zusammen und bejaht ebenso Engel, Bücher und Bestimmung.

Dieser Kurs behandelt jeden Artikel einzeln.`,
        `في حديث جبريل المشهور سُئل النبي ﷺ عن الإسلام والإيمان والإحسان، فذكر في جواب السؤال عن الإيمان ستة أمور:

- **الإيمان بالله** الواحد
- **وملائكته**
- **وكتبه**
- **ورسله**
- **واليوم الآخر**
- **والقدر** خيره وشره

وقد جمع القرآن أكثرها في مواضع، منها خواتيم سورة البقرة.

## الإيمان والإسلام والإحسان
يفرّق الحديث نفسه بين الإسلام (الأركان الظاهرة كالصلاة والصيام) والإيمان (الاعتقاد الباطن) والإحسان (أن تعبد الله كأنك تراه). وبحث العلماء علاقة الإيمان بالعمل وزيادته ونقصانه، وتعددت عبارات المدارس في ذلك.

## عرض الشيعة
تعرض العقيدة الإمامية غالبًا "أصول الدين" في: التوحيد والعدل والنبوة والإمامة والمعاد، مع الإيمان بالملائكة والكتب والقضاء والقدر.

وسيتناول المقرر كل ركن على حدة.`
      ),
      verses: ["2:285", "4:136"],
      hadith: ["muslim:8"],
      tags: ["consensus", "jafari"],
      quiz: [
        {
          q: t("How many articles of faith are named in the Hadith of Jibril?", "Wie viele Glaubensartikel nennt der Hadith Dschibrils?", "كم ركنًا للإيمان في حديث جبريل؟"),
          options: [t("Four", "Vier", "أربعة"), t("Five", "Fünf", "خمسة"), t("Six", "Sechs", "ستة"), t("Ten", "Zehn", "عشرة")],
          answer: 2,
        },
        {
          q: t("What is ihsan?", "Was ist Ihsan?", "ما الإحسان؟"),
          options: [
            t("Worshipping God as though one sees Him", "Gott dienen, als sähe man Ihn", "أن تعبد الله كأنك تراه"),
            t("Paying zakat", "Zakat zahlen", "إخراج الزكاة"),
            t("Reciting loudly", "Laut rezitieren", "الجهر بالقراءة"),
            t("A type of fasting", "Eine Fastenart", "نوع من الصيام"),
          ],
          answer: 0,
        },
        {
          q: t("Which is among the Twelver Shia 'roots of religion'?", "Was gehört zu den zwölferschiitischen „Wurzeln der Religion“?", "أيّ مما يلي من أصول الدين عند الإمامية؟"),
          options: [t("Pilgrimage", "Pilgerfahrt", "الحج"), t("Imamate", "Imamat", "الإمامة"), t("Fasting", "Fasten", "الصيام"), t("Charity", "Spende", "الصدقة")],
          answer: 1,
        },
      ],
    },
    {
      id: "a02-tawhid",
      title: t("Tawhid: the oneness of God", "Tauhid: die Einheit Gottes", "التوحيد"),
      body: t(
        `**Tawhid** is the heart of Islamic belief: God is One, without partner, equal or rival. Surat al-Ikhlas summarises it, and it is the first part of the testimony of faith.

## Aspects of tawhid
Scholars have explained tawhid in different ways:
- Many, especially in the Athari tradition, speak of three aspects: oneness in **lordship** (God alone creates and sustains), in **worship** (only God is worshipped) and in **names and attributes**.
- Ash'ari and Maturidi theologians often describe it as God being one in His essence, His attributes and His acts.
Both approaches aim to express the same core: God alone is the Creator and alone deserves worship.

## Its opposite
**Shirk** is associating partners with God. The Quran presents it as the gravest wrong. Scholars caution against hastily accusing other Muslims of shirk.

## In daily life
Tawhid shapes trust in God, sincerity in worship and freedom from fearing anything created as if it had independent power.

Shia theology also places tawhid first among the roots of religion.`,
        `**Tauhid** ist das Herz des islamischen Glaubens: Gott ist Einer, ohne Teilhaber, Gleichen oder Rivalen. Die Sure al-Ichlas fasst das zusammen, und es ist der erste Teil des Glaubensbekenntnisses.

## Aspekte des Tauhid
Gelehrte haben Tauhid unterschiedlich erklärt:
- Viele, besonders in der atharitischen Tradition, sprechen von drei Aspekten: Einheit in der **Herrschaft** (Gott allein erschafft und erhält), in der **Anbetung** (nur Gott wird angebetet) und in den **Namen und Eigenschaften**.
- Aschʿaritische und maturiditische Theologen beschreiben ihn oft als Einheit Gottes in Seinem Wesen, Seinen Eigenschaften und Seinen Handlungen.
Beide Zugänge wollen denselben Kern ausdrücken: Gott allein ist Schöpfer und allein der Anbetung würdig.

## Das Gegenteil
**Schirk** heißt, Gott Teilhaber beizugesellen. Der Koran stellt es als schwerstes Unrecht dar. Gelehrte warnen davor, anderen Muslimen vorschnell Schirk vorzuwerfen.

## Im Alltag
Tauhid prägt das Gottvertrauen, die Aufrichtigkeit im Gottesdienst und die Freiheit, nichts Geschaffenes so zu fürchten, als hätte es eigene Macht.

Auch die schiitische Theologie stellt Tauhid an die erste Stelle der Wurzeln der Religion.`,
        `**التوحيد** أصل العقيدة الإسلامية: الله واحد لا شريك له ولا كفء ولا ند. وتلخّصه سورة الإخلاص، وهو الشطر الأول من الشهادة.

## جوانب التوحيد
عبّر العلماء عن التوحيد بطرق مختلفة:
- كثير منهم، ولا سيما أهل الأثر، يذكرون ثلاثة أقسام: توحيد **الربوبية** (الله وحده الخالق المدبر)، وتوحيد **الألوهية** (لا يُعبد إلا الله)، وتوحيد **الأسماء والصفات**.
- ويعبّر كثير من الأشاعرة والماتريدية بأن الله واحد في ذاته وصفاته وأفعاله.
والمقصود في الطريقتين واحد: الله وحده الخالق، ووحده المستحق للعبادة.

## ضده
**الشرك** هو جعل شريك لله، ويصفه القرآن بأنه أعظم الظلم. وقد حذّر العلماء من التسرع في رمي المسلمين بالشرك.

## في الحياة
يثمر التوحيد التوكل على الله والإخلاص في العبادة والتحرر من الخوف من المخلوقات كأن لها قدرة مستقلة.

والعقيدة الشيعية كذلك تجعل التوحيد أول أصول الدين.`
      ),
      verses: ["112:1", "31:13"],
      tags: ["consensus", "athari", "ashari", "maturidi"],
      quiz: [
        {
          q: t("What is shirk?", "Was ist Schirk?", "ما الشرك؟"),
          options: [
            t("Associating partners with God", "Gott Teilhaber beigesellen", "جعل شريك لله"),
            t("Missing a prayer", "Ein Gebet versäumen", "ترك صلاة"),
            t("Travelling", "Reisen", "السفر"),
            t("Giving charity", "Spenden", "الصدقة"),
          ],
          answer: 0,
        },
        {
          q: t("Which surah summarises tawhid?", "Welche Sure fasst Tauhid zusammen?", "أي سورة تلخّص التوحيد؟"),
          options: [t("Al-Fil", "Al-Fil", "الفيل"), t("Al-Kawthar", "Al-Kauthar", "الكوثر"), t("Quraysh", "Quraisch", "قريش"), t("Al-Ikhlas", "Al-Ichlas", "الإخلاص")],
          answer: 3,
        },
        {
          q: t("The threefold division of tawhid is especially associated with…", "Die Dreiteilung des Tauhid wird besonders verbunden mit …", "يشتهر التقسيم الثلاثي للتوحيد عند…"),
          options: [t("Philosophers only", "Nur Philosophen", "الفلاسفة فقط"), t("The Athari tradition", "Der atharitischen Tradition", "أهل الأثر"), t("No one", "Niemandem", "لا أحد"), t("Grammarians", "Grammatikern", "النحاة")],
          answer: 1,
        },
      ],
    },
    {
      id: "a03-names-attributes",
      title: t("God's names and attributes", "Gottes Namen und Eigenschaften", "الأسماء والصفات"),
      body: t(
        `The Quran calls God by many **beautiful names** (al-asma' al-husna), such as the Merciful, the All-Knowing and the Wise, and it states that nothing is like Him. All Sunni schools affirm these names and reject likening God to creation (tashbih) as well as emptying the names of meaning (ta'til).

## Where approaches differ
Some texts mention attributes such as God's "hand", "face" or His rising over the Throne. Schools read them in different ways:
- **Athari**: affirm them as stated, without asking "how" (bila kayf) and without likening them to creation, leaving their true reality to God.
- **Ash'ari** and **Maturidi**: many earlier scholars practised **tafwid** (affirming the wording and entrusting the meaning to God); many later scholars also allowed **ta'wil**, interpreting them in line with Arabic usage and God's transcendence, for example "hand" as power or favour.
- **Shia** theology generally interprets such texts figuratively and stresses God's transcendence.

## Common ground
All of these approaches intend to honour God and to stay faithful to revelation. Classical scholars generally treated these as differences among people of the qibla.`,
        `Der Koran nennt Gott mit vielen **schönsten Namen** (al-asmaʾ al-husna), etwa der Barmherzige, der Allwissende und der Weise, und sagt, dass nichts Ihm gleicht. Alle sunnitischen Schulen bejahen diese Namen und lehnen sowohl die Verähnlichung Gottes mit der Schöpfung (taschbih) als auch die Entleerung der Namen (taʿtil) ab.

## Wo sich Zugänge unterscheiden
Manche Texte nennen Eigenschaften wie Gottes „Hand“, „Gesicht“ oder Sein Sich-Erheben über den Thron. Die Schulen lesen sie unterschiedlich:
- **Atharitisch**: wie überliefert bejahen, ohne nach dem „Wie“ zu fragen (bila kaif) und ohne Vergleich mit der Schöpfung; die eigentliche Wirklichkeit bleibt Gott überlassen.
- **Aschʿaritisch** und **maturiditisch**: viele frühere Gelehrte übten **tafwid** (den Wortlaut bejahen, die Bedeutung Gott überlassen); viele spätere erlaubten auch **taʾwil**, eine Deutung gemäß arabischem Sprachgebrauch und Gottes Erhabenheit, etwa „Hand“ als Macht oder Gunst.
- Die **schiitische** Theologie deutet solche Texte meist bildlich und betont Gottes Erhabenheit.

## Gemeinsame Grundlage
Alle diese Zugänge wollen Gott ehren und der Offenbarung treu bleiben. Klassische Gelehrte behandelten dies meist als Unterschiede unter den Leuten der Qibla.`,
        `يسمّي القرآنُ الله تعالى **بالأسماء الحسنى** كالرحمن والعليم والحكيم، ويقرر أنه ليس كمثله شيء. وتثبت مدارس أهل السنة كلها هذه الأسماء، وترفض **التشبيه** بالمخلوقات و**التعطيل** عن المعاني.

## مواضع الاختلاف
وردت نصوص فيها صفات كاليد والوجه والاستواء على العرش، واختلفت المدارس في قراءتها:
- **أهل الأثر**: يثبتونها كما جاءت بلا تكييف ولا تمثيل، ويفوّضون حقيقة كيفيتها إلى الله.
- **الأشاعرة والماتريدية**: كثير من المتقدمين منهم على **التفويض** (إثبات اللفظ وتفويض المعنى إلى الله)، وأجاز كثير من المتأخرين **التأويل** بما يوافق لغة العرب وتنزيه الله، كتفسير اليد بالقدرة أو النعمة.
- **العقيدة الشيعية**: تميل عمومًا إلى التأويل المجازي مع التأكيد على التنزيه.

## القاسم المشترك
تقصد هذه المناهج كلها تعظيم الله والوفاء للوحي، وقد عدّ جمهور العلماء ذلك خلافًا بين أهل القبلة.`
      ),
      verses: ["42:11", "7:180", "59:22"],
      tags: ["athari", "ashari", "maturidi", "jafari", "varies"],
      quiz: [
        {
          q: t("What does tafwid mean?", "Was bedeutet Tafwid?", "ما التفويض؟"),
          options: [
            t("Rejecting the text", "Den Text ablehnen", "رد النص"),
            t("Affirming the wording and entrusting meaning to God", "Den Wortlaut bejahen und die Bedeutung Gott überlassen", "إثبات اللفظ وتفويض المعنى إلى الله"),
            t("Likening God to creation", "Gott mit der Schöpfung vergleichen", "تشبيه الله بخلقه"),
            t("A type of prayer", "Eine Gebetsart", "نوع من الصلاة"),
          ],
          answer: 1,
        },
        {
          q: t("What do all Sunni schools reject?", "Was lehnen alle sunnitischen Schulen ab?", "ماذا ترفض مدارس أهل السنة كلها؟"),
          options: [
            t("God's beautiful names", "Gottes schönste Namen", "الأسماء الحسنى"),
            t("The Quran", "Den Koran", "القرآن"),
            t("Likening God to creation", "Gott mit der Schöpfung zu verähnlichen", "تشبيه الله بخلقه"),
            t("Prayer", "Das Gebet", "الصلاة"),
          ],
          answer: 2,
        },
        {
          q: t("Bila kayf means affirming…", "Bila kaif bedeutet bejahen …", "معنى بلا كيف: الإثبات…"),
          options: [
            t("With a detailed description", "Mit genauer Beschreibung", "مع وصف الكيفية"),
            t("Only in poetry", "Nur in Dichtung", "في الشعر فقط"),
            t("By denying the text", "Durch Leugnen des Textes", "مع نفي النص"),
            t("Without asking how", "Ohne nach dem Wie zu fragen", "دون السؤال عن الكيفية"),
          ],
          answer: 3,
        },
      ],
    },
    {
      id: "a04-angels",
      title: t("Belief in angels", "Glaube an die Engel", "الإيمان بالملائكة"),
      body: t(
        `Angels are beings created by God. They worship Him, carry out His commands and do not disobey Him. Muslims believe in them as part of the unseen (al-ghayb), known through revelation.

## What the sources describe
- Angels are created from light, according to a report in Sahih Muslim; their number is known only to God.
- The Quran describes them as having wings, two, three or four, and more as God wills.
- They have tasks: conveying revelation, recording deeds, guarding, taking souls at death and praising God.

## Named angels
- **Jibril** (Gabriel), who brought revelation to the prophets.
- **Mika'il** (Michael), associated with provision and rain.
- **Israfil**, associated in tradition with blowing the trumpet.
- The angel of death, often called **'Izra'il** in tradition, though the Quran calls him simply the angel of death.
- **Malik**, the keeper of Hell, and others.

## Why it matters
Belief in angels reminds a person that deeds are recorded and that God's care surrounds creation. Muslims avoid speculating beyond what reliable sources state.`,
        `Engel sind von Gott erschaffene Wesen. Sie dienen Ihm, führen Seine Befehle aus und widersetzen sich Ihm nicht. Muslime glauben an sie als Teil des Verborgenen (al-ghaib), das durch Offenbarung bekannt ist.

## Was die Quellen beschreiben
- Engel sind nach einem Bericht in Sahih Muslim aus Licht erschaffen; ihre Zahl kennt nur Gott.
- Der Koran beschreibt sie mit Flügeln, zwei, drei oder vier, und mehr, wie Gott will.
- Sie haben Aufgaben: Offenbarung überbringen, Taten aufzeichnen, behüten, die Seelen beim Tod nehmen und Gott lobpreisen.

## Namentlich bekannte Engel
- **Dschibril** (Gabriel), der den Propheten die Offenbarung brachte.
- **Mikail** (Michael), verbunden mit Versorgung und Regen.
- **Israfil**, in der Überlieferung mit dem Blasen der Posaune verbunden.
- Der Todesengel, in der Tradition oft **ʿIzraʾil** genannt; der Koran nennt ihn einfach den Engel des Todes.
- **Malik**, der Hüter der Hölle, und weitere.

## Warum das wichtig ist
Der Glaube an Engel erinnert daran, dass Taten aufgezeichnet werden und Gottes Fürsorge die Schöpfung umgibt. Muslime vermeiden Spekulationen über das hinaus, was verlässliche Quellen sagen.`,
        `الملائكة خلق من خلق الله، يعبدونه وينفذون أمره ولا يعصونه، ويؤمن بهم المسلمون من جملة الغيب الذي عُرف بالوحي.

## ما تصفه المصادر
- خُلقت الملائكة من نور كما في رواية في صحيح مسلم، ولا يعلم عددهم إلا الله.
- يصفهم القرآن بأنهم أولو أجنحة مثنى وثلاث ورباع، ويزيد الله في الخلق ما يشاء.
- لهم أعمال: تبليغ الوحي، وكتابة الأعمال، والحفظ، وقبض الأرواح، والتسبيح.

## ملائكة ورد ذكرهم بأسمائهم
- **جبريل** الذي نزل بالوحي على الأنبياء.
- **ميكائيل** الموكل بالقطر والرزق.
- **إسرافيل** الموكل في المأثور بالنفخ في الصور.
- ملك الموت، ويُسمّى في المأثور كثيرًا **عزرائيل**، والقرآن يسميه ملك الموت.
- **مالك** خازن النار، وغيرهم.

## الثمرة
يذكّر الإيمان بالملائكة بأن الأعمال مكتوبة وأن رعاية الله تحيط بالخلق، ويتجنب المسلم الخوض فيما لم يرد به دليل معتبر.`
      ),
      verses: ["35:1", "66:6", "32:11"],
      tags: ["consensus"],
      quiz: [
        {
          q: t("Which angel brought revelation to the prophets?", "Welcher Engel brachte den Propheten die Offenbarung?", "من الملك الذي نزل بالوحي؟"),
          options: [t("Malik", "Malik", "مالك"), t("Jibril", "Dschibril", "جبريل"), t("Israfil", "Israfil", "إسرافيل"), t("Mika'il", "Mikail", "ميكائيل")],
          answer: 1,
        },
        {
          q: t("Do angels disobey God?", "Widersetzen sich Engel Gott?", "هل يعصي الملائكة الله؟"),
          options: [t("Often", "Oft", "كثيرًا"), t("Sometimes", "Manchmal", "أحيانًا"), t("Only on Fridays", "Nur freitags", "يوم الجمعة فقط"), t("No", "Nein", "لا")],
          answer: 3,
        },
        {
          q: t("Belief in angels belongs to…", "Der Glaube an Engel gehört zum …", "الإيمان بالملائكة من…"),
          options: [t("The unseen (al-ghayb)", "Verborgenen (al-ghaib)", "الإيمان بالغيب"), t("Astronomy", "Astronomie", "علم الفلك"), t("Folklore only", "Nur Volksglauben", "الخرافات"), t("Law of trade", "Handelsrecht", "فقه البيوع")],
          answer: 0,
        },
      ],
    },
    {
      id: "a05-books",
      title: t("Belief in the revealed books", "Glaube an die offenbarten Bücher", "الإيمان بالكتب"),
      body: t(
        `Muslims believe that God sent revelation to guide humanity through many messengers. Some scriptures are named in the Quran:

- The **Tawrah** (Torah), given to Musa (Moses)
- The **Zabur** (Psalms), given to Dawud (David)
- The **Injil** (Gospel), given to 'Isa (Jesus)
- The **scrolls** (suhuf) of Ibrahim and Musa
- The **Quran**, revealed to Muhammad

## How Muslims relate to earlier scriptures
- They believe the original revelations were true guidance from God.
- The Quran describes itself as confirming what came before and as a guardian (muhaymin) over it.
- Muslim scholars hold that the earlier texts as they exist today are not preserved in their original form in every part, so Muslims respect them while taking the Quran as the final reference.

## The Quran
- It is God's speech, revealed over about 23 years, recited and preserved.
- Sunni schools agree that the Quran is God's uncreated speech, though Ash'ari and Maturidi theologians distinguish the eternal attribute from the recited letters and sounds; Athari scholars state it without that distinction. Shia theology generally holds that the Quran is created.`,
        `Muslime glauben, dass Gott durch viele Gesandte Offenbarung zur Rechtleitung der Menschen sandte. Einige Schriften nennt der Koran:

- Die **Taura** (Tora), gegeben Musa (Mose)
- Den **Zabur** (Psalmen), gegeben Dawud (David)
- Den **Indschil** (Evangelium), gegeben ʿIsa (Jesus)
- Die **Blätter** (suhuf) Ibrahims und Musas
- Den **Koran**, offenbart Muhammad

## Verhältnis zu früheren Schriften
- Die ursprünglichen Offenbarungen waren wahre Rechtleitung von Gott.
- Der Koran beschreibt sich als Bestätigung des Früheren und als Hüter (muhaimin) darüber.
- Muslimische Gelehrte sind der Ansicht, dass die heutigen früheren Texte nicht in allen Teilen in ursprünglicher Form erhalten sind; Muslime achten sie und nehmen den Koran als letzten Maßstab.

## Der Koran
- Er ist Gottes Rede, über etwa 23 Jahre offenbart, rezitiert und bewahrt.
- Die sunnitischen Schulen stimmen überein, dass der Koran Gottes unerschaffene Rede ist; aschʿaritische und maturiditische Theologen unterscheiden dabei die ewige Eigenschaft von den rezitierten Buchstaben und Lauten, atharitische Gelehrte sagen es ohne diese Unterscheidung. Die schiitische Theologie hält den Koran meist für erschaffen.`,
        `يؤمن المسلمون بأن الله أنزل الوحي لهداية الناس على رسل كثيرين، وسمّى القرآن بعض الكتب:

- **التوراة** المنزلة على موسى
- **الزبور** المنزل على داود
- **الإنجيل** المنزل على عيسى
- **صحف** إبراهيم وموسى
- **القرآن** المنزل على محمد ﷺ

## موقف المسلمين من الكتب السابقة
- يؤمنون بأن أصولها المنزلة هدى من الله.
- ويصف القرآن نفسه بأنه مصدّق لما بين يديه ومهيمن عليه.
- ويرى علماء المسلمين أن النصوص الموجودة اليوم لم تُحفظ كلها على أصلها، فيحترمها المسلم ويجعل القرآن المرجع الأخير.

## القرآن
- هو كلام الله، نزل في نحو ثلاث وعشرين سنة، متلو محفوظ.
- واتفق أهل السنة على أن القرآن كلام الله غير مخلوق، ويفرّق الأشاعرة والماتريدية بين الصفة القديمة والحروف والأصوات المتلوة، ويقرر أهل الأثر ذلك دون هذا التفريق. وتذهب العقيدة الإمامية غالبًا إلى أنه مخلوق.`
      ),
      verses: ["3:3", "5:48", "87:19"],
      tags: ["consensus", "athari", "ashari", "maturidi", "jafari"],
      quiz: [
        {
          q: t("To whom was the Zabur given?", "Wem wurde der Zabur gegeben?", "على من أُنزل الزبور؟"),
          options: [t("Musa", "Musa", "موسى"), t("'Isa", "ʿIsa", "عيسى"), t("Dawud", "Dawud", "داود"), t("Nuh", "Nuh", "نوح")],
          answer: 2,
        },
        {
          q: t("How does the Quran describe itself in relation to earlier books?", "Wie beschreibt sich der Koran gegenüber früheren Büchern?", "كيف يصف القرآن نفسه بالنسبة للكتب السابقة؟"),
          options: [
            t("Confirming and a guardian over them", "Als Bestätigung und Hüter", "مصدّقًا ومهيمنًا"),
            t("Unrelated to them", "Ohne Bezug", "لا علاقة له بها"),
            t("Identical in wording", "Wortgleich", "مطابقًا لها لفظًا"),
            t("Older than all of them", "Älter als alle", "أقدم منها نزولًا"),
          ],
          answer: 0,
        },
        {
          q: t("Over roughly how many years was the Quran revealed?", "Über etwa wie viele Jahre wurde der Koran offenbart?", "في كم سنة تقريبًا نزل القرآن؟"),
          options: [t("3", "3", "3"), t("10", "10", "10"), t("40", "40", "40"), t("23", "23", "23")],
          answer: 3,
        },
      ],
    },
    {
      id: "a06-prophets",
      title: t("Prophets and messengers", "Propheten und Gesandte", "الأنبياء والرسل"),
      body: t(
        `God sent prophets to every people to call them to worship Him alone and to live justly. Muslims believe in all of them without making distinctions in faith between them.

## Prophet and messenger
Many scholars distinguish a **nabi** (prophet), who receives revelation, from a **rasul** (messenger), who is additionally sent with a message or law to a people. Every messenger is a prophet, but not every prophet is a messenger.

## Names in the Quran
The Quran names twenty-five prophets, among them Adam, Nuh, Ibrahim, Musa, 'Isa and Muhammad. Five are often called the "resolute" (ulu al-'azm): Nuh, Ibrahim, Musa, 'Isa and Muhammad.

## Qualities
- Truthfulness, trustworthiness, conveying the message and intelligence.
- Protection from sin (**'ismah**): all agree they were protected in conveying revelation and from major sins; schools differ on details regarding minor slips. Shia theology holds a comprehensive 'ismah for prophets and also for the Imams.

## The final Prophet
Muhammad is the Seal of the Prophets; no prophet comes after him. This is agreed upon by Sunni and Shia Muslims alike.`,
        `Gott sandte Propheten zu jedem Volk, um es zur Anbetung Gottes allein und zu einem gerechten Leben aufzurufen. Muslime glauben an alle, ohne im Glauben zwischen ihnen zu unterscheiden.

## Prophet und Gesandter
Viele Gelehrte unterscheiden den **Nabi** (Propheten), der Offenbarung empfängt, vom **Rasul** (Gesandten), der zusätzlich mit einer Botschaft oder einem Gesetz zu einem Volk gesandt wird. Jeder Gesandte ist Prophet, aber nicht jeder Prophet ist Gesandter.

## Namen im Koran
Der Koran nennt fünfundzwanzig Propheten, darunter Adam, Nuh, Ibrahim, Musa, ʿIsa und Muhammad. Fünf werden oft die „Standhaften“ (ulu l-ʿazm) genannt: Nuh, Ibrahim, Musa, ʿIsa und Muhammad.

## Eigenschaften
- Wahrhaftigkeit, Vertrauenswürdigkeit, Übermittlung der Botschaft und Verstand.
- Schutz vor Sünde (**ʿisma**): Einigkeit besteht über den Schutz bei der Übermittlung der Offenbarung und vor großen Sünden; bei kleineren Versehen unterscheiden sich die Schulen. Die schiitische Theologie vertritt eine umfassende ʿisma der Propheten und auch der Imame.

## Der letzte Prophet
Muhammad ist das Siegel der Propheten; nach ihm kommt kein Prophet. Darin sind sich Sunniten und Schiiten einig.`,
        `أرسل الله إلى كل أمة نبيًا يدعوها إلى عبادته وحده وإقامة العدل، ويؤمن المسلمون بهم جميعًا لا يفرّقون بين أحد منهم في الإيمان.

## النبي والرسول
يفرّق كثير من العلماء بين **النبي** الذي يوحى إليه، و**الرسول** الذي يُرسل فوق ذلك برسالة أو شريعة إلى قوم. فكل رسول نبي، وليس كل نبي رسولًا.

## أسماؤهم في القرآن
ذكر القرآن خمسة وعشرين نبيًا، منهم آدم ونوح وإبراهيم وموسى وعيسى ومحمد ﷺ. ويُسمّى خمسة منهم **أولي العزم**: نوح وإبراهيم وموسى وعيسى ومحمد.

## صفاتهم
- الصدق والأمانة والتبليغ والفطانة.
- **العصمة**: اتفقوا على عصمتهم في التبليغ ومن الكبائر، واختلفت المدارس في تفاصيل الصغائر والهفوات. وترى العقيدة الشيعية عصمة شاملة للأنبياء وللأئمة كذلك.

## خاتم النبيين
محمد ﷺ خاتم النبيين لا نبي بعده، وعلى هذا اتفاق أهل السنة والشيعة.`
      ),
      verses: ["2:285", "33:40", "16:36"],
      tags: ["consensus", "majority", "jafari"],
      quiz: [
        {
          q: t("How many prophets are named in the Quran?", "Wie viele Propheten nennt der Koran namentlich?", "كم نبيًا ذُكر في القرآن باسمه؟"),
          options: [t("Twelve", "Zwölf", "اثنا عشر"), t("Twenty-five", "Fünfundzwanzig", "خمسة وعشرون"), t("Forty", "Vierzig", "أربعون"), t("Seven", "Sieben", "سبعة")],
          answer: 1,
        },
        {
          q: t("Which statement is agreed by Sunni and Shia Muslims?", "Welche Aussage teilen Sunniten und Schiiten?", "ما الذي يتفق عليه السنة والشيعة؟"),
          options: [
            t("Muhammad is the Seal of the Prophets", "Muhammad ist das Siegel der Propheten", "محمد ﷺ خاتم النبيين"),
            t("Prophets came only to Arabs", "Propheten kamen nur zu Arabern", "الأنبياء للعرب فقط"),
            t("There are only five prophets", "Es gibt nur fünf Propheten", "الأنبياء خمسة فقط"),
            t("Prophets did not convey revelation", "Propheten übermittelten keine Offenbarung", "لم يبلّغ الأنبياء الوحي"),
          ],
          answer: 0,
        },
        {
          q: t("What is 'ismah?", "Was ist ʿisma?", "ما العصمة؟"),
          options: [t("A book", "Ein Buch", "كتاب"), t("A prayer time", "Eine Gebetszeit", "وقت صلاة"), t("A city", "Eine Stadt", "مدينة"), t("Protection from sin", "Schutz vor Sünde", "الحفظ من الذنوب")],
          answer: 3,
        },
      ],
    },
    {
      id: "a07-last-day",
      title: t("The Last Day", "Der Jüngste Tag", "اليوم الآخر"),
      body: t(
        `Belief in the Last Day means believing that this life will end, that all people will be resurrected and held accountable, and that God will judge with perfect justice and mercy.

## Stages described in the sources
- **Death and the barzakh**: the period between death and resurrection, including the questioning in the grave, affirmed by Sunni and Shia scholars.
- **Signs of the Hour**: minor and major signs; their details come mainly from hadith, and scholars caution against confidently tying them to current events.
- **The blowing of the trumpet** and **resurrection** of bodies.
- **Gathering and reckoning**: deeds are shown, the record is given and the **scale** (mizan) weighs deeds.
- **The bridge** (sirat) and **intercession** (shafa'ah) by God's permission.
- **Paradise and Hell**: the final abodes. Belief in seeing God in Paradise is affirmed by Sunni schools and interpreted differently in Shia and some other theologies.

## Why it matters
The Quran repeatedly joins belief in God with belief in the Last Day. It gives life moral weight: no good deed is lost and no injustice escapes. Hope in God's mercy and awareness of accountability belong together.`,
        `Der Glaube an den Jüngsten Tag bedeutet: Dieses Leben endet, alle Menschen werden auferweckt und zur Rechenschaft gezogen, und Gott richtet mit vollkommener Gerechtigkeit und Barmherzigkeit.

## Stationen nach den Quellen
- **Tod und Barzach**: die Zeit zwischen Tod und Auferstehung, einschließlich der Befragung im Grab, von sunnitischen wie schiitischen Gelehrten bejaht.
- **Zeichen der Stunde**: kleine und große Zeichen; Einzelheiten stammen vor allem aus Hadithen, und Gelehrte warnen davor, sie vorschnell auf aktuelle Ereignisse zu beziehen.
- **Das Blasen der Posaune** und die **Auferstehung** der Körper.
- **Versammlung und Abrechnung**: Taten werden gezeigt, das Buch wird übergeben, und die **Waage** (mizan) wägt die Taten.
- **Die Brücke** (sirat) und die **Fürsprache** (schafaʿa) mit Gottes Erlaubnis.
- **Paradies und Hölle**: die endgültigen Aufenthaltsorte. Das Schauen Gottes im Paradies bejahen die sunnitischen Schulen; schiitische und einige andere Theologien deuten es anders.

## Warum das wichtig ist
Der Koran verbindet immer wieder den Glauben an Gott mit dem an den Jüngsten Tag. Das gibt dem Leben moralisches Gewicht: Keine gute Tat geht verloren, kein Unrecht bleibt verborgen. Hoffnung auf Gottes Barmherzigkeit und Bewusstsein der Verantwortung gehören zusammen.`,
        `الإيمان باليوم الآخر يعني أن هذه الحياة تنتهي، وأن الناس جميعًا يُبعثون ويُحاسبون، وأن الله يحكم بعدل تام ورحمة واسعة.

## مراحل وردت في المصادر
- **الموت والبرزخ**: ما بين الموت والبعث، ومنه سؤال القبر، ويثبته علماء السنة والشيعة.
- **أشراط الساعة**: صغرى وكبرى، وتفاصيلها في الأحاديث غالبًا، وقد حذّر العلماء من الجزم بتنزيلها على الأحداث الجارية.
- **النفخ في الصور** و**البعث** بالأجساد.
- **الحشر والحساب**: تُعرض الأعمال وتُعطى الكتب ويوزن العمل في **الميزان**.
- **الصراط** و**الشفاعة** بإذن الله.
- **الجنة والنار**: دارا القرار. ويثبت أهل السنة رؤية الله في الجنة، وتؤوّلها العقيدة الشيعية وبعض المدارس الأخرى.

## الثمرة
يقرن القرآن مرارًا الإيمان بالله بالإيمان باليوم الآخر، فيمنح الحياة وزنًا أخلاقيًا: لا يضيع عمل صالح ولا يفلت ظلم. والرجاء في رحمة الله والشعور بالمسؤولية متلازمان.`
      ),
      verses: ["99:7", "99:8", "21:47"],
      tags: ["consensus", "majority", "jafari"],
      quiz: [
        {
          q: t("What is the barzakh?", "Was ist der Barzach?", "ما البرزخ؟"),
          options: [
            t("A mountain in Paradise", "Ein Berg im Paradies", "جبل في الجنة"),
            t("The period between death and resurrection", "Die Zeit zwischen Tod und Auferstehung", "ما بين الموت والبعث"),
            t("A type of angel", "Eine Engelart", "نوع من الملائكة"),
            t("The final sign", "Das letzte Zeichen", "آخر الأشراط"),
          ],
          answer: 1,
        },
        {
          q: t("What does the mizan do?", "Was tut die Mizan?", "ما وظيفة الميزان؟"),
          options: [t("Measures time", "Misst die Zeit", "يقيس الزمن"), t("Counts angels", "Zählt Engel", "يعد الملائكة"), t("Weighs deeds", "Wägt die Taten", "توزن به الأعمال"), t("Opens the gates", "Öffnet die Tore", "يفتح الأبواب")],
          answer: 2,
        },
        {
          q: t("How should signs of the Hour be handled?", "Wie sollte man mit den Zeichen der Stunde umgehen?", "كيف يُتعامل مع أشراط الساعة؟"),
          options: [
            t("Predict exact dates", "Genaue Daten vorhersagen", "تحديد مواعيد دقيقة"),
            t("Ignore them completely", "Völlig ignorieren", "إهمالها تمامًا"),
            t("Link every news item to them", "Jede Nachricht damit verbinden", "ربط كل خبر بها"),
            t("Avoid confidently tying them to current events", "Nicht vorschnell auf aktuelle Ereignisse beziehen", "عدم الجزم بتنزيلها على الأحداث"),
          ],
          answer: 3,
        },
      ],
    },
    {
      id: "a08-qadar",
      title: t("Qadar: divine decree", "Qadar: die göttliche Bestimmung", "القضاء والقدر"),
      body: t(
        `Belief in **qadar** means that nothing happens outside God's knowledge, will and power, while human beings remain responsible for their choices.

## Four aspects often taught
- **Knowledge**: God knows all things before they happen.
- **Writing**: it is recorded with Him.
- **Will**: nothing occurs except by His will.
- **Creation**: He is the Creator of all things.

## Human choice
All mainstream schools affirm that people are accountable and that God is just. They explain the relation differently:
- **Ash'ari**: God creates human acts; the person "acquires" (kasb) them and is responsible.
- **Maturidi**: places more weight on the human choice (ikhtiyar) that God creates the capacity for.
- **Athari**: affirms both God's all-encompassing will and real human will, without philosophical elaboration.
- **Shia** theology, emphasising divine justice, holds a position "between compulsion and full delegation".

## Living with qadar
- It is not an excuse for wrongdoing or for giving up effort; one acts, takes means and then trusts God.
- It brings calm in hardship: what has reached a person was written, and patience is rewarded.

Scholars advised not to dwell on the mystery of qadar beyond what revelation teaches.`,
        `Der Glaube an **Qadar** bedeutet, dass nichts außerhalb von Gottes Wissen, Willen und Macht geschieht, während der Mensch für seine Entscheidungen verantwortlich bleibt.

## Vier oft gelehrte Aspekte
- **Wissen**: Gott weiß alles, bevor es geschieht.
- **Aufzeichnung**: Es ist bei Ihm verzeichnet.
- **Wille**: Nichts geschieht ohne Seinen Willen.
- **Schöpfung**: Er ist der Schöpfer aller Dinge.

## Menschliche Wahl
Alle verbreiteten Schulen bejahen, dass Menschen verantwortlich sind und Gott gerecht ist. Sie erklären das Verhältnis unterschiedlich:
- **Aschʿaritisch**: Gott erschafft die Handlungen; der Mensch „erwirbt“ (kasb) sie und ist verantwortlich.
- **Maturiditisch**: legt mehr Gewicht auf die menschliche Wahl (ichtiyar), zu der Gott die Fähigkeit erschafft.
- **Atharitisch**: bejaht Gottes umfassenden Willen und echten menschlichen Willen, ohne philosophische Ausführung.
- Die **schiitische** Theologie betont die göttliche Gerechtigkeit und vertritt eine Position „zwischen Zwang und völliger Übertragung“.

## Mit Qadar leben
- Er ist keine Ausrede für Unrecht oder für Untätigkeit; man handelt, nutzt die Mittel und vertraut dann auf Gott.
- Er schenkt Ruhe in schweren Zeiten: Was einen getroffen hat, war bestimmt, und Geduld wird belohnt.

Gelehrte rieten, über das Geheimnis des Qadar nicht über das hinaus zu grübeln, was die Offenbarung lehrt.`,
        `الإيمان **بالقدر** يعني أنه لا يقع شيء خارج علم الله ومشيئته وقدرته، مع بقاء الإنسان مسؤولًا عن اختياره.

## مراتب يكثر تعليمها
- **العلم**: يعلم الله الأشياء قبل وقوعها.
- **الكتابة**: هي مكتوبة عنده.
- **المشيئة**: لا يقع شيء إلا بمشيئته.
- **الخلق**: هو خالق كل شيء.

## اختيار الإنسان
تتفق المدارس المعتبرة على أن الإنسان مكلَّف محاسَب وأن الله عدل، واختلفت في تفسير العلاقة:
- **الأشاعرة**: الله خالق أفعال العباد، والعبد **كاسب** لها ومسؤول عنها.
- **الماتريدية**: يعطون وزنًا أكبر **لاختيار** العبد الذي يخلق الله القدرة عليه.
- **أهل الأثر**: يثبتون مشيئة الله الشاملة ومشيئة العبد الحقيقية دون خوض فلسفي.
- **العقيدة الشيعية**: تؤكد العدل الإلهي وتقول بـ"أمر بين أمرين" لا جبر ولا تفويض.

## العيش مع القدر
- ليس القدر عذرًا للمعصية ولا لترك السعي، بل يعمل الإنسان ويأخذ بالأسباب ثم يتوكل على الله.
- ويورث الطمأنينة في الشدائد: فما أصاب المرء كان مكتوبًا، والصبر مأجور.

ونصح العلماء بعدم الخوض في سر القدر بما يتجاوز ما جاء به الوحي.`
      ),
      verses: ["54:49", "57:22", "76:30"],
      hadith: ["muslim:8"],
      tags: ["consensus", "ashari", "maturidi", "athari", "jafari"],
      quiz: [
        {
          q: t("Does belief in qadar remove human responsibility?", "Hebt der Glaube an Qadar die Verantwortung auf?", "هل يسقط الإيمان بالقدر مسؤولية الإنسان؟"),
          options: [
            t("Yes, completely", "Ja, vollständig", "نعم تمامًا"),
            t("Only for scholars", "Nur für Gelehrte", "للعلماء فقط"),
            t("No, people remain accountable", "Nein, Menschen bleiben verantwortlich", "لا، يبقى الإنسان مسؤولًا"),
            t("Only on weekends", "Nur am Wochenende", "في العطل فقط"),
          ],
          answer: 2,
        },
        {
          q: t("The concept of kasb (acquisition) is associated with…", "Der Begriff Kasb (Erwerb) wird verbunden mit …", "يرتبط مفهوم الكسب بـ…"),
          options: [t("The Ash'ari school", "Der aschʿaritischen Schule", "الأشاعرة"), t("Grammarians", "Grammatikern", "النحاة"), t("Astronomers", "Astronomen", "الفلكيين"), t("No one", "Niemandem", "لا أحد")],
          answer: 0,
        },
        {
          q: t("Which is one of the four aspects of qadar?", "Was ist einer der vier Aspekte des Qadar?", "أي مما يلي من مراتب القدر؟"),
          options: [t("Luck", "Glück", "الحظ"), t("Knowledge", "Wissen", "العلم"), t("Fate without God", "Schicksal ohne Gott", "قدر بلا إله"), t("Chance", "Zufall", "الصدفة")],
          answer: 1,
        },
      ],
    },
  ],
};
