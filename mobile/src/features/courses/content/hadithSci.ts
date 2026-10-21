// Course: Hadith sciences basics. No hadith text is quoted; references only.
import type { Course, L } from "../types";

const t = (en: string, de: string, ar: string): L => ({ en, de, ar });

export const HADITH_SCI: Course = {
  id: "hadith-sci",
  title: t("Hadith sciences basics", "Grundlagen der Hadithwissenschaften", "مبادئ علوم الحديث"),
  lead: t(
    "How Muslim scholars preserved, checked and graded the reports about the Prophet.",
    "Wie muslimische Gelehrte die Berichte über den Propheten bewahrt, geprüft und bewertet haben.",
    "كيف حفظ علماء المسلمين الأخبار المروية عن النبي ﷺ وفحصوها وحكموا عليها."
  ),
  word: "علوم الحديث",
  free: 1,
  lessons: [
    {
      id: "h01-hadith-sunnah",
      title: t("What hadith and sunnah are", "Was Hadith und Sunna sind", "ما الحديث وما السنة"),
      body: t(
        `A **hadith** is a report about what the Prophet Muhammad said, did or approved silently, and sometimes a description of his character or appearance. The word itself means "speech" or "report".

The **sunnah** is the Prophet's way of life as a whole. Hadith reports are the main vehicle through which the sunnah is known, although some scholars also stress the living practice of the early community, for example the practice of Medina in the Maliki school.

## Why it matters
- The Quran commands obedience to the Messenger and describes him as an example, so the sunnah explains and details the Quran.
- Prayer, fasting, zakat and pilgrimage are outlined in the Quran but practised in detail through the sunnah.

## Related terms
- **Athar**: a report from a Companion or a later early authority.
- **Hadith qudsi**: a report in which the Prophet conveys meaning from God in his own words; it is not part of the Quran.

Scholars developed whole disciplines to make sure these reports were transmitted reliably. This course introduces their basic tools.`,
        `Ein **Hadith** ist ein Bericht darüber, was der Prophet Muhammad gesagt, getan oder stillschweigend gebilligt hat, manchmal auch eine Beschreibung seines Charakters oder Aussehens. Das Wort bedeutet „Rede“ oder „Bericht“.

Die **Sunna** ist die Lebensweise des Propheten insgesamt. Hadithe sind der wichtigste Weg, auf dem sie bekannt ist. Manche Gelehrte betonen zusätzlich die gelebte Praxis der frühen Gemeinde, etwa die Praxis Medinas in der malikitischen Schule.

## Warum das wichtig ist
- Der Koran fordert Gehorsam gegenüber dem Gesandten und beschreibt ihn als Vorbild; die Sunna erklärt und konkretisiert den Koran.
- Gebet, Fasten, Zakat und Pilgerfahrt werden im Koran umrissen, ihre Einzelheiten kennt man aus der Sunna.

## Verwandte Begriffe
- **Athar**: ein Bericht von einem Prophetengefährten oder einer späteren frühen Autorität.
- **Hadith qudsi**: ein Bericht, in dem der Prophet einen Sinn von Gott in eigenen Worten wiedergibt; er gehört nicht zum Koran.

Gelehrte haben ganze Disziplinen entwickelt, um eine verlässliche Überlieferung zu sichern. Dieser Kurs stellt Ihnen die Grundwerkzeuge vor.`,
        `**الحديث** هو ما أُضيف إلى النبي محمد ﷺ من قول أو فعل أو تقرير، وقد يشمل وصف خُلُقه أو خَلْقه. ومعنى الكلمة في اللغة: الكلام والخبر.

أما **السنة** فهي هدي النبي ﷺ وطريقته في الحياة عمومًا، والأحاديث هي الوسيلة الأساسية لمعرفتها، ويؤكد بعض العلماء أيضًا على العمل المتوارث في الجيل الأول، كعمل أهل المدينة عند المالكية.

## أهميتها
- أمر القرآن بطاعة الرسول ووصفه بأنه أسوة حسنة، فالسنة تبيّن القرآن وتفصّله.
- الصلاة والصيام والزكاة والحج وردت في القرآن مجملة، وتفاصيلها معروفة من السنة.

## مصطلحات قريبة
- **الأثر**: ما رُوي عن الصحابي أو من بعده من السلف.
- **الحديث القدسي**: ما يرويه النبي ﷺ عن ربه بلفظ من عنده، وليس من القرآن.

وقد وضع العلماء علومًا كاملة لضمان صحة النقل، وهذا المقرر يعرّفك بأدواتها الأساسية.`
      ),
      verses: ["59:7", "33:21"],
      tags: ["consensus"],
      quiz: [
        {
          q: t("What does a hadith report cover?", "Was umfasst ein Hadith?", "ماذا يشمل الحديث؟"),
          options: [
            t("Only the Prophet's sayings", "Nur Aussprüche des Propheten", "أقوال النبي فقط"),
            t("Sayings, actions and tacit approvals of the Prophet", "Aussprüche, Taten und stillschweigende Billigungen des Propheten", "أقوال النبي وأفعاله وتقريراته"),
            t("Only verses of the Quran", "Nur Koranverse", "آيات القرآن فقط"),
            t("Later legal opinions", "Spätere Rechtsgutachten", "الفتاوى المتأخرة"),
          ],
          answer: 1,
          explain: t("A hadith can report words, deeds or silent approval.", "Ein Hadith kann Worte, Taten oder stillschweigende Billigung berichten.", "الحديث يشمل القول والفعل والتقرير."),
        },
        {
          q: t("What is a hadith qudsi?", "Was ist ein Hadith qudsi?", "ما الحديث القدسي؟"),
          options: [
            t("A chapter of the Quran", "Eine Sure des Korans", "سورة من القرآن"),
            t("A fabricated report", "Ein erfundener Bericht", "خبر موضوع"),
            t("A report of a Companion's opinion", "Die Meinung eines Gefährten", "رأي صحابي"),
            t("Meaning from God conveyed in the Prophet's words", "Ein Sinn von Gott in den Worten des Propheten", "معنى من الله بلفظ النبي ﷺ"),
          ],
          answer: 3,
          explain: t("It is distinct from the Quran.", "Er ist vom Koran zu unterscheiden.", "وهو غير القرآن."),
        },
        {
          q: t("Which school emphasises the practice of Medina?", "Welche Schule betont die Praxis Medinas?", "أي مذهب يعتني بعمل أهل المدينة؟"),
          options: [
            t("Maliki", "Malikitisch", "المالكي"),
            t("Hanafi", "Hanafitisch", "الحنفي"),
            t("Shafi'i", "Schafiitisch", "الشافعي"),
            t("None", "Keine", "لا أحد"),
          ],
          answer: 0,
        },
      ],
    },
    {
      id: "h02-isnad-matn",
      title: t("Isnad and matn", "Isnad und Matn", "الإسناد والمتن"),
      body: t(
        `Every hadith has two parts.

## The isnad (chain)
The **isnad** is the list of people who passed the report on, from the compiler back to the Prophet: A heard it from B, who heard it from C, and so on. Early scholars said that the isnad is part of the religion, because without it anyone could claim anything.

## The matn (text)
The **matn** is the content of the report itself. Critics examined it too: does it contradict the Quran, well-established sunnah, or plain historical fact? Is the wording unusual for the Prophet's speech?

## How they work together
- A sound chain is necessary but not always sufficient; a hidden defect (**'illah**) or a contradiction with stronger reports (**shudhudh**) can weaken a narration.
- Comparing many chains of the same report helps reveal mistakes, additions and changes of wording.

Learning to tell isnad and matn apart is the first step to reading hadith literature. When you see a reference, ask: who transmitted this, and what exactly does it say? The Quran itself asks believers to verify news before acting on it.`,
        `Jeder Hadith besteht aus zwei Teilen.

## Der Isnad (Kette)
Der **Isnad** ist die Reihe der Überlieferer vom Sammler bis zum Propheten: A hörte es von B, B von C und so weiter. Frühe Gelehrte sagten, der Isnad gehöre zur Religion, denn ohne ihn könnte jeder alles behaupten.

## Der Matn (Text)
Der **Matn** ist der Inhalt des Berichts. Auch ihn haben die Kritiker geprüft: Widerspricht er dem Koran, gut belegter Sunna oder eindeutigen historischen Tatsachen? Ist die Wortwahl für den Propheten ungewöhnlich?

## Zusammenspiel
- Eine einwandfreie Kette ist notwendig, aber nicht immer ausreichend; ein verborgener Mangel (**ʿilla**) oder ein Widerspruch zu stärkeren Berichten (**schudhudh**) kann eine Überlieferung schwächen.
- Der Vergleich vieler Ketten desselben Berichts deckt Fehler, Zusätze und Wortänderungen auf.

Isnad und Matn zu unterscheiden ist der erste Schritt zum Lesen der Hadithliteratur. Fragen Sie bei jeder Angabe: Wer hat das überliefert, und was genau steht darin? Der Koran selbst fordert, Nachrichten vor dem Handeln zu prüfen.`,
        `لكل حديث جزآن.

## الإسناد
**الإسناد** سلسلة الرواة من المصنِّف إلى النبي ﷺ: سمعه فلان من فلان وهكذا. وقال السلف إن الإسناد من الدين، ولولاه لقال من شاء ما شاء.

## المتن
**المتن** هو نص الخبر نفسه. وقد نقده العلماء أيضًا: هل يخالف القرآن أو السنة الثابتة أو الوقائع التاريخية الواضحة؟ وهل في ألفاظه ما لا يشبه كلام النبوة؟

## العلاقة بينهما
- صحة الإسناد شرط، لكنها لا تكفي دائمًا؛ فقد تُضعف الروايةَ **علةٌ** خفية أو **شذوذٌ** بمخالفة من هو أوثق.
- جمع طرق الحديث الواحد ومقارنتها يكشف الأخطاء والزيادات وتغيّر الألفاظ.

التمييز بين الإسناد والمتن أول خطوة في قراءة كتب الحديث. فاسأل عند كل عزو: من روى هذا، وماذا يقول بالضبط؟ والقرآن نفسه يأمر بالتثبت من الأخبار قبل العمل بها.`
      ),
      verses: ["49:6"],
      tags: ["consensus"],
      quiz: [
        {
          q: t("What is the isnad?", "Was ist der Isnad?", "ما الإسناد؟"),
          options: [
            t("The text of the report", "Der Text des Berichts", "نص الخبر"),
            t("A book title", "Ein Buchtitel", "عنوان كتاب"),
            t("The chain of transmitters", "Die Kette der Überlieferer", "سلسلة الرواة"),
            t("A legal ruling", "Ein Rechtsurteil", "حكم فقهي"),
          ],
          answer: 2,
        },
        {
          q: t("What is an 'illah?", "Was ist eine ʿilla?", "ما العلة؟"),
          options: [
            t("A hidden defect in a narration", "Ein verborgener Mangel einer Überlieferung", "سبب خفي يقدح في صحة الحديث"),
            t("A strong supporting chain", "Eine stützende Kette", "طريق مقوٍّ"),
            t("A type of prayer", "Eine Gebetsart", "نوع من الصلاة"),
            t("The compiler's name", "Der Name des Sammlers", "اسم المصنِّف"),
          ],
          answer: 0,
        },
        {
          q: t("Is a sound chain always enough?", "Reicht eine einwandfreie Kette immer aus?", "هل يكفي صحة الإسناد دائمًا؟"),
          options: [
            t("Yes, always", "Ja, immer", "نعم دائمًا"),
            t("Only for long reports", "Nur bei langen Berichten", "في الأحاديث الطويلة فقط"),
            t("The chain does not matter", "Die Kette ist egal", "الإسناد لا أهمية له"),
            t("No, the text is also examined", "Nein, auch der Text wird geprüft", "لا، يُنظر في المتن أيضًا"),
          ],
          answer: 3,
          explain: t("Hidden defects or contradiction with stronger reports can weaken it.", "Verborgene Mängel oder Widersprüche zu stärkeren Berichten können schwächen.", "قد تضعفه علة أو شذوذ."),
        },
      ],
    },
    {
      id: "h03-grades",
      title: t("The grades of hadith", "Die Bewertungsstufen", "مراتب الحديث"),
      body: t(
        `Scholars of the Sunni tradition classify reports mainly into four grades.

## Sahih (sound)
A continuous chain of upright and precise narrators, free of irregularity (shudhudh) and hidden defect ('illah). Such reports are accepted as evidence.

## Hasan (good)
Meets the same conditions, but one or more narrators are slightly less precise. Hasan reports are also generally accepted as evidence. A report can also become "hasan li-ghayrihi" when several weak chains support each other.

## Da'if (weak)
Fails one or more conditions, for example a break in the chain or a narrator with a poor memory. Weakness has degrees, from mild to severe.

## Mawdu' (fabricated)
A report shown to be invented and falsely attributed to the Prophet. Scholars agree that it may not be narrated as his words except to warn about it.

## Keep in mind
- Gradings are scholarly judgements; experts sometimes disagree on a specific hadith.
- Shia hadith scholarship uses its own, partly different, categories and narrator criteria.`,
        `Die sunnitische Tradition unterscheidet hauptsächlich vier Stufen.

## Sahih (gesund)
Eine lückenlose Kette rechtschaffener und genauer Überlieferer, ohne Unregelmäßigkeit (schudhudh) und verborgenen Mangel (ʿilla). Solche Berichte gelten als Beleg.

## Hasan (gut)
Dieselben Bedingungen, doch ein oder mehrere Überlieferer sind etwas weniger genau. Auch Hasan-Berichte gelten in der Regel als Beleg. Ein Bericht kann außerdem „hasan li-ghairihi“ werden, wenn mehrere schwache Ketten einander stützen.

## Daʿif (schwach)
Eine oder mehrere Bedingungen fehlen, etwa durch eine Lücke in der Kette oder einen Überlieferer mit schwachem Gedächtnis. Schwäche hat Abstufungen, von leicht bis schwer.

## Maudu (erfunden)
Ein nachweislich erfundener, dem Propheten fälschlich zugeschriebener Bericht. Die Gelehrten sind sich einig, dass er nicht als Prophetenwort weitergegeben werden darf, außer um davor zu warnen.

## Bitte beachten Sie
- Bewertungen sind Gelehrtenurteile; bei einzelnen Hadithen sind sich Fachleute manchmal uneinig.
- Die schiitische Hadithwissenschaft verwendet eigene, teils abweichende Kategorien und Kriterien.`,
        `يقسّم علماء أهل السنة الحديث أساسًا إلى أربع مراتب.

## الصحيح
ما اتصل سنده بنقل العدل الضابط عن مثله من غير شذوذ ولا علة، وهو حجة.

## الحسن
تتوافر فيه الشروط نفسها لكن خفّ ضبط بعض رواته، وهو حجة عند الجمهور. وقد يرتقي الضعيف إلى **الحسن لغيره** إذا تعددت طرقه وقوّى بعضها بعضًا.

## الضعيف
ما فقد شرطًا أو أكثر، كانقطاع السند أو سوء حفظ راوٍ، والضعف درجات من الخفيف إلى الشديد.

## الموضوع
المكذوب المختلَق المنسوب إلى النبي ﷺ، وقد اتفق العلماء على تحريم روايته على أنه من كلامه إلا مع بيان وضعه.

## تنبيه
- الأحكام على الأحاديث اجتهاد علمي، وقد يختلف الأئمة في حديث بعينه.
- ولعلم الحديث عند الشيعة تقسيمات ومعايير خاصة تختلف جزئيًا.`
      ),
      tags: ["majority", "varies"],
      quiz: [
        {
          q: t("Which grade has a slightly less precise narrator but is still accepted?", "Welche Stufe hat einen etwas weniger genauen Überlieferer, gilt aber als Beleg?", "أي مرتبة خفّ ضبط رواتها وهي مقبولة؟"),
          options: [
            t("Mawdu'", "Maudu", "الموضوع"),
            t("Hasan", "Hasan", "الحسن"),
            t("Da'if", "Daʿif", "الضعيف"),
            t("None", "Keine", "لا شيء"),
          ],
          answer: 1,
        },
        {
          q: t("What is a mawdu' report?", "Was ist ein Maudu-Bericht?", "ما الحديث الموضوع؟"),
          options: [
            t("A sound report", "Ein gesunder Bericht", "حديث صحيح"),
            t("A report with a short chain", "Ein Bericht mit kurzer Kette", "حديث عالي الإسناد"),
            t("A fabricated report", "Ein erfundener Bericht", "حديث مكذوب"),
            t("A Quran verse", "Ein Koranvers", "آية قرآنية"),
          ],
          answer: 2,
        },
        {
          q: t("Do experts always agree on grades?", "Sind sich Fachleute bei Bewertungen immer einig?", "هل يتفق العلماء دائمًا على الحكم؟"),
          options: [
            t("Yes, always", "Ja, immer", "نعم دائمًا"),
            t("Grades are random", "Bewertungen sind willkürlich", "الأحكام عشوائية"),
            t("Only for the Quran", "Nur beim Koran", "في القرآن فقط"),
            t("No, they sometimes differ on specific hadith", "Nein, bei einzelnen Hadithen gibt es Unterschiede", "لا، قد يختلفون في أحاديث بعينها"),
          ],
          answer: 3,
        },
      ],
    },
    {
      id: "h04-rijal",
      title: t("Narrators and 'ilm al-rijal", "Überlieferer und ʿIlm ar-Ridschal", "الرواة وعلم الرجال"),
      body: t(
        `**'Ilm al-rijal** ("knowledge of the men", though many narrators were women) studies the people in the chains.

## Two key qualities
- **'Adalah** (uprightness): the narrator is honest, practising and of sound character.
- **Dabt** (precision): the narrator memorised or recorded accurately.

## What critics checked
- Birth and death dates, travels and teachers, to see whether two narrators could actually have met.
- How a narrator's reports compare with those of reliable peers.
- Changes over time, for example memory weakening in old age.

## Jarh wa ta'dil
The science of **criticism and praise** produced detailed vocabulary, from "trustworthy and precise" down to "abandoned" or "liar". Large biographical dictionaries record these judgements.

## Women narrators
Aishah and many later women scholars transmitted and taught hadith; biographical works list thousands of female narrators.

Shia scholarship has its own rijal works and criteria. In every tradition, the aim is the same: to know whom one is trusting before relying on a report.`,
        `**ʿIlm ar-Ridschal** („Wissen über die Männer“, obwohl viele Überlieferer Frauen waren) untersucht die Personen in den Ketten.

## Zwei zentrale Eigenschaften
- **ʿAdala** (Rechtschaffenheit): Der Überlieferer ist ehrlich, praktizierend und von gutem Charakter.
- **Dabt** (Genauigkeit): Er hat genau auswendig gelernt oder aufgezeichnet.

## Was geprüft wurde
- Geburts- und Sterbedaten, Reisen und Lehrer, um festzustellen, ob sich zwei Überlieferer begegnen konnten.
- Wie die Berichte eines Überlieferers mit denen zuverlässiger Zeitgenossen übereinstimmen.
- Veränderungen im Lauf der Zeit, etwa nachlassendes Gedächtnis im Alter.

## Dscharh wa Taʿdil
Die Wissenschaft von **Kritik und Bestätigung** entwickelte ein feines Vokabular, von „vertrauenswürdig und genau“ bis „verlassen“ oder „Lügner“. Große biografische Lexika halten diese Urteile fest.

## Überlieferinnen
Aischa und viele spätere Gelehrtinnen haben Hadithe überliefert und gelehrt; biografische Werke verzeichnen Tausende Frauen.

Die schiitische Gelehrsamkeit hat eigene Ridschal-Werke und Kriterien. Überall gilt dasselbe Ziel: zu wissen, wem man vertraut, bevor man sich auf einen Bericht stützt.`,
        `**علم الرجال** يدرس أحوال رواة الأسانيد، رجالًا ونساءً.

## صفتان أساسيتان
- **العدالة**: أن يكون الراوي صادقًا مستقيمًا في دينه وخلقه.
- **الضبط**: أن يحفظ أو يكتب ما سمعه بإتقان.

## ما الذي فحصه النقاد
- تواريخ الولادة والوفاة والرحلات والشيوخ، لمعرفة إمكان اللقاء بين الراويين.
- موافقة مرويات الراوي لمرويات الثقات من أقرانه.
- تغيّر الحال مع الزمن، كالاختلاط في آخر العمر.

## الجرح والتعديل
أنتج هذا العلم ألفاظًا دقيقة تبدأ من "ثقة ثبت" وتنتهي إلى "متروك" أو "كذاب"، ودُوّنت الأحكام في كتب التراجم الكبيرة.

## الراويات
روت عائشة رضي الله عنها وكثير من العالمات بعدها الحديث وعلّمنه، وتذكر كتب التراجم آلاف الراويات.

وللشيعة كتب رجال ومعايير خاصة بهم. والغاية واحدة: أن تعرف من تثق به قبل أن تعتمد على روايته.`
      ),
      tags: ["consensus", "varies"],
      quiz: [
        {
          q: t("What does dabt mean?", "Was bedeutet Dabt?", "ما الضبط؟"),
          options: [
            t("Precision in memory or writing", "Genauigkeit im Gedächtnis oder Aufschreiben", "إتقان الحفظ أو الكتابة"),
            t("Wealth", "Reichtum", "الغنى"),
            t("Long life", "Langes Leben", "طول العمر"),
            t("Political rank", "Politischer Rang", "المنصب السياسي"),
          ],
          answer: 0,
        },
        {
          q: t("Why were death dates studied?", "Warum wurden Sterbedaten untersucht?", "لماذا دُرست تواريخ الوفاة؟"),
          options: [
            t("For inheritance", "Für das Erbrecht", "للمواريث"),
            t("For astrology", "Für Astrologie", "للتنجيم"),
            t("To check whether narrators could have met", "Um zu prüfen, ob sich Überlieferer begegnen konnten", "لمعرفة إمكان اللقاء"),
            t("For no reason", "Ohne Grund", "بلا سبب"),
          ],
          answer: 2,
        },
        {
          q: t("Did women transmit hadith?", "Haben Frauen Hadithe überliefert?", "هل روت النساء الحديث؟"),
          options: [
            t("Never", "Nie", "أبدًا"),
            t("Yes, many did", "Ja, viele", "نعم، كثيرات"),
            t("Only one", "Nur eine", "واحدة فقط"),
            t("Only in modern times", "Nur in der Moderne", "في العصر الحديث فقط"),
          ],
          answer: 1,
        },
      ],
    },
    {
      id: "h05-collections",
      title: t("The six books and other collections", "Die sechs Bücher und weitere Sammlungen", "الكتب الستة وغيرها"),
      body: t(
        `Over the first centuries, scholars compiled reports into books arranged by chains or by topic.

## The six books (Sunni)
- **Sahih al-Bukhari** and **Sahih Muslim**: limited to reports their authors judged sound; widely regarded as the most authentic collections.
- **Sunan Abi Dawud**, **Jami' al-Tirmidhi**, **Sunan al-Nasa'i** and **Sunan Ibn Majah**: arranged mostly by legal topics, containing sound, good and some weak reports.

## Other major works
- **Al-Muwatta'** of Imam Malik: one of the earliest surviving compilations, combining hadith with the practice of Medina and legal opinions.
- **Musnad Ahmad**: a very large collection arranged by Companion rather than topic.

## In Shia tradition
Twelver Shia Muslims rely on their own collections. **Al-Kafi** by al-Kulayni is the main one, alongside three further books that together form the "four books". Its reports are also graded by Shia scholars and are not all considered sound.

Each collection has its own method and purpose, so knowing the book helps you judge what kind of report you are reading.`,
        `In den ersten Jahrhunderten haben Gelehrte Berichte in Büchern gesammelt, geordnet nach Ketten oder Themen.

## Die sechs Bücher (sunnitisch)
- **Sahih al-Buchari** und **Sahih Muslim**: nur Berichte, die ihre Verfasser für gesund hielten; sie gelten weithin als die zuverlässigsten Sammlungen.
- **Sunan Abi Dawud**, **Dschamiʿ at-Tirmidhi**, **Sunan an-Nasai** und **Sunan Ibn Madscha**: meist nach Rechtsthemen geordnet, mit gesunden, guten und auch einigen schwachen Berichten.

## Weitere wichtige Werke
- **Al-Muwatta** von Imam Malik: eine der frühesten erhaltenen Sammlungen, die Hadithe mit der Praxis Medinas und Rechtsmeinungen verbindet.
- **Musnad Ahmad**: eine sehr große Sammlung, geordnet nach Gefährten statt nach Themen.

## In der schiitischen Tradition
Zwölfer-Schiiten stützen sich auf eigene Sammlungen. **Al-Kafi** von al-Kulaini ist die wichtigste, zusammen mit drei weiteren Werken bilden sie die „vier Bücher“. Auch ihre Berichte werden von schiitischen Gelehrten bewertet und gelten nicht alle als gesund.

Jede Sammlung hat ihre eigene Methode. Wenn Sie das Buch kennen, können Sie besser einschätzen, welche Art von Bericht Sie lesen.`,
        `جمع العلماء في القرون الأولى الأحاديث في مصنفات مرتبة على الأسانيد أو الأبواب.

## الكتب الستة عند أهل السنة
- **صحيح البخاري** و**صحيح مسلم**: اقتصر مؤلفاهما على ما صحّ عندهما، وهما أصح كتب الحديث عند الجمهور.
- **سنن أبي داود** و**جامع الترمذي** و**سنن النسائي** و**سنن ابن ماجه**: مرتبة غالبًا على أبواب الفقه، وفيها الصحيح والحسن وبعض الضعيف.

## مصنفات أخرى كبرى
- **الموطأ** للإمام مالك: من أقدم المصنفات الباقية، يجمع الحديث وعمل أهل المدينة والآراء الفقهية.
- **مسند أحمد**: مجموعة ضخمة مرتبة على أسماء الصحابة لا على الأبواب.

## عند الشيعة
يعتمد الشيعة الإمامية على مصنفاتهم الخاصة، وأهمها **الكافي** للكليني، وهو مع ثلاثة كتب أخرى يشكّل "الكتب الأربعة". ويحكم علماؤهم على رواياته، فلا يعدّونها كلها صحيحة.

لكل كتاب منهجه وغايته، ومعرفة الكتاب تعينك على تقدير نوع الرواية التي تقرؤها.`
      ),
      tags: ["majority", "jafari", "varies"],
      quiz: [
        {
          q: t("How is Musnad Ahmad arranged?", "Wie ist Musnad Ahmad geordnet?", "كيف رُتّب مسند أحمد؟"),
          options: [
            t("By legal topic", "Nach Rechtsthemen", "على أبواب الفقه"),
            t("By Companion", "Nach Gefährten", "على أسماء الصحابة"),
            t("Alphabetically by first word", "Alphabetisch nach erstem Wort", "على حروف المعجم"),
            t("By year", "Nach Jahr", "على السنوات"),
          ],
          answer: 1,
        },
        {
          q: t("Who compiled al-Muwatta'?", "Wer hat al-Muwatta zusammengestellt?", "من صنّف الموطأ؟"),
          options: [
            t("Imam al-Bukhari", "Imam al-Buchari", "الإمام البخاري"),
            t("Imam al-Tirmidhi", "Imam at-Tirmidhi", "الإمام الترمذي"),
            t("Imam Malik", "Imam Malik", "الإمام مالك"),
            t("Imam al-Nasa'i", "Imam an-Nasai", "الإمام النسائي"),
          ],
          answer: 2,
        },
        {
          q: t("What is al-Kafi?", "Was ist al-Kafi?", "ما الكافي؟"),
          options: [
            t("A Sunni sunan book", "Ein sunnitisches Sunan-Werk", "كتاب سنن عند أهل السنة"),
            t("A Quran commentary", "Ein Korankommentar", "تفسير للقرآن"),
            t("A biography dictionary", "Ein biografisches Lexikon", "كتاب تراجم"),
            t("The main Twelver Shia hadith collection", "Die wichtigste Hadithsammlung der Zwölfer-Schiiten", "أهم كتب الحديث عند الشيعة الإمامية"),
          ],
          answer: 3,
        },
      ],
    },
    {
      id: "h06-mutawatir-ahad",
      title: t("Mutawatir and ahad", "Mutawatir und Ahad", "المتواتر والآحاد"),
      body: t(
        `Besides grading reliability, scholars classify reports by **how many chains** they have.

## Mutawatir (mass-transmitted)
A report narrated by so many people at every stage that agreement on a lie is practically impossible. It yields certain knowledge. Examples often cited include the general practice of prayer and the report warning against lying about the Prophet. Some things are mutawatir in meaning (tawatur ma'nawi) even if the exact wording varies.

## Ahad (solitary)
Any report that does not reach that level, even if it has two, three or more chains. Most hadith are ahad. Sub-types include:
- **Mashhur**: at least three narrators at each stage.
- **'Aziz**: at least two.
- **Gharib**: only one at some stage.

## Why the distinction matters
- Scholars agree that sound ahad reports are acted upon in practical law.
- They differed on whether ahad reports alone establish matters of creed; many Athari scholars accept them for belief, while many Ash'ari and Maturidi theologians held that they give strong probability rather than certainty.

"Ahad" does not mean "weak"; it describes the number of chains, not their quality.`,
        `Neben der Zuverlässigkeit ordnen Gelehrte Berichte nach der **Zahl ihrer Ketten**.

## Mutawatir (massenhaft überliefert)
Ein Bericht, den auf jeder Stufe so viele Menschen überliefern, dass eine Absprache zur Lüge praktisch unmöglich ist. Er ergibt sicheres Wissen. Häufig genannte Beispiele sind die allgemeine Gebetspraxis und der Bericht, der davor warnt, über den Propheten zu lügen. Manches ist dem Sinn nach mutawatir (tawatur maʿnawi), auch wenn der Wortlaut variiert.

## Ahad (Einzelüberlieferung)
Jeder Bericht, der diese Stufe nicht erreicht, auch mit zwei, drei oder mehr Ketten. Die meisten Hadithe sind Ahad. Untergruppen:
- **Maschhur**: mindestens drei Überlieferer je Stufe.
- **ʿAziz**: mindestens zwei.
- **Gharib**: auf einer Stufe nur einer.

## Warum das wichtig ist
- Gesunde Ahad-Berichte werden nach einhelliger Ansicht im praktischen Recht angewandt.
- Ob sie allein Glaubensinhalte begründen, ist umstritten: Viele atharitische Gelehrte bejahen es, viele aschʿaritische und maturiditische Theologen sahen darin starke Wahrscheinlichkeit statt Gewissheit.

„Ahad“ heißt nicht „schwach“; es beschreibt die Zahl der Ketten, nicht ihre Qualität.`,
        `إلى جانب الحكم على الصحة يقسّم العلماء الأخبار بحسب **عدد طرقها**.

## المتواتر
ما رواه جمع كثير في كل طبقة تحيل العادة تواطؤهم على الكذب، ويفيد العلم اليقيني. ومن أمثلته المشهورة عمليًا هيئة الصلاة عمومًا، وحديث التحذير من الكذب على النبي ﷺ. وقد يكون التواتر **معنويًا** مع اختلاف الألفاظ.

## الآحاد
كل ما لم يبلغ حد التواتر ولو كان له طريقان أو ثلاثة أو أكثر، وأكثر الأحاديث آحاد. ومن أقسامه:
- **المشهور**: ما رواه ثلاثة فأكثر في كل طبقة.
- **العزيز**: ما لا يقل رواته عن اثنين.
- **الغريب**: ما انفرد به راوٍ واحد في طبقة ما.

## ثمرة التقسيم
- اتفق العلماء على العمل بخبر الآحاد الصحيح في الأحكام العملية.
- واختلفوا في الاحتجاج به وحده في العقائد: فكثير من أهل الأثر يقبلونه فيها، وكثير من الأشاعرة والماتريدية يرون أنه يفيد الظن الغالب لا القطع.

و"الآحاد" لا تعني "الضعيف"، فهي وصف لعدد الطرق لا لجودتها.`
      ),
      tags: ["consensus", "athari", "ashari", "maturidi"],
      quiz: [
        {
          q: t("What does 'ahad' describe?", "Was beschreibt „Ahad“?", "ماذا يصف لفظ الآحاد؟"),
          options: [
            t("A weak report", "Einen schwachen Bericht", "الحديث الضعيف"),
            t("The number of chains, below mass transmission", "Die Zahl der Ketten unterhalb des Tawatur", "عدد الطرق دون التواتر"),
            t("A fabricated report", "Einen erfundenen Bericht", "الحديث الموضوع"),
            t("A Quran recitation", "Eine Koranlesart", "قراءة قرآنية"),
          ],
          answer: 1,
        },
        {
          q: t("What does a mutawatir report yield?", "Was ergibt ein Mutawatir-Bericht?", "ماذا يفيد المتواتر؟"),
          options: [
            t("Certain knowledge", "Sicheres Wissen", "العلم اليقيني"),
            t("Only doubt", "Nur Zweifel", "الشك فقط"),
            t("Nothing", "Nichts", "لا شيء"),
            t("A weak opinion", "Eine schwache Meinung", "رأيًا ضعيفًا"),
          ],
          answer: 0,
        },
        {
          q: t("A report with only one narrator at some stage is called…", "Ein Bericht mit nur einem Überlieferer auf einer Stufe heißt …", "ما انفرد به راوٍ في طبقة يسمى…"),
          options: [
            t("Mashhur", "Maschhur", "مشهورًا"),
            t("'Aziz", "ʿAziz", "عزيزًا"),
            t("Mutawatir", "Mutawatir", "متواترًا"),
            t("Gharib", "Gharib", "غريبًا"),
          ],
          answer: 3,
        },
      ],
    },
    {
      id: "h07-weak-hadith",
      title: t("How scholars use weak hadith", "Wie Gelehrte mit schwachen Hadithen umgehen", "العمل بالحديث الضعيف"),
      body: t(
        `Weak hadith are not fabricated, but their attribution is uncertain. Scholars have taken different positions on whether and how to use them.

## The widespread view
Many scholars allowed weak reports for **virtuous deeds** (fada'il al-a'mal), encouragement and warnings, under conditions often summarised as:
- The weakness is not severe.
- The content falls under a principle established by sound evidence.
- One does not believe with certainty that the Prophet said it.

## A stricter view
Other scholars, past and present, held that weak hadith should not be used even for virtues, or should be cited only with a clear note about their weakness.

## In law
Some early jurists preferred a mildly weak hadith over personal analogy (qiyas), while others did not. Schools therefore weigh such reports differently.

## In practice
- Severely weak and fabricated reports are not used for any purpose except to warn about them.
- When you share a hadith, mention its grade if possible and avoid attributing uncertain words to the Prophet with confidence.

These are differences of method among recognised scholars, not grounds for condemning one another.`,
        `Schwache Hadithe sind nicht erfunden, doch ihre Zuschreibung ist unsicher. Gelehrte haben unterschiedliche Positionen dazu, ob und wie man sie verwendet.

## Die verbreitete Ansicht
Viele Gelehrte erlaubten schwache Berichte für **tugendhafte Taten** (fadaʾil al-aʿmal), Ermutigung und Ermahnung, unter Bedingungen wie:
- Die Schwäche ist nicht schwerwiegend.
- Der Inhalt fällt unter einen durch gesunde Belege festgestellten Grundsatz.
- Man glaubt nicht mit Gewissheit, dass der Prophet es gesagt hat.

## Eine strengere Ansicht
Andere Gelehrte, früher wie heute, meinten, schwache Hadithe sollten auch für Tugenden nicht verwendet oder nur mit deutlichem Hinweis auf ihre Schwäche zitiert werden.

## Im Recht
Manche frühen Juristen zogen einen leicht schwachen Hadith dem eigenen Analogieschluss (qiyas) vor, andere nicht. Die Schulen gewichten solche Berichte daher unterschiedlich.

## In der Praxis
- Sehr schwache und erfundene Berichte werden für keinen Zweck verwendet, außer um davor zu warnen.
- Wenn Sie einen Hadith weitergeben, nennen Sie nach Möglichkeit seine Bewertung und schreiben Sie unsichere Worte nicht mit Gewissheit dem Propheten zu.

Es handelt sich um Methodenunterschiede anerkannter Gelehrter, nicht um einen Grund, einander zu verurteilen.`,
        `الحديث الضعيف ليس موضوعًا، لكن نسبته غير ثابتة. وقد اختلف العلماء في العمل به وكيفيته.

## القول المشهور
أجاز كثير من العلماء رواية الضعيف والعمل به في **فضائل الأعمال** والترغيب والترهيب بشروط، منها:
- ألا يكون الضعف شديدًا.
- أن يندرج تحت أصل ثابت بدليل صحيح.
- ألا يُعتقد عند العمل به ثبوته عن النبي ﷺ.

## قول أشد
ورأى علماء آخرون قديمًا وحديثًا ألا يُعمل بالضعيف حتى في الفضائل، أو ألا يُذكر إلا مع بيان ضعفه.

## في الأحكام
قدّم بعض الأئمة المتقدمين الحديث الضعيف ضعفًا يسيرًا على القياس، ولم يفعل ذلك غيرهم، فاختلفت المذاهب في وزنه.

## في التطبيق
- لا يُستعمل شديد الضعف ولا الموضوع في شيء إلا للتحذير منه.
- إذا نقلت حديثًا فاذكر درجته ما أمكن، ولا تنسب إلى النبي ﷺ ما لم يثبت بصيغة الجزم.

وهذه اختلافات منهجية بين علماء معتبرين، لا مسوّغ فيها للتشنيع على المخالف.`
      ),
      tags: ["varies"],
      quiz: [
        {
          q: t("For what did many scholars allow mildly weak hadith?", "Wofür erlaubten viele Gelehrte leicht schwache Hadithe?", "فيمَ أجاز كثير من العلماء الضعيف؟"),
          options: [
            t("Creating new obligations", "Neue Pflichten begründen", "إنشاء فرائض جديدة"),
            t("Changing the Quran", "Den Koran ändern", "تغيير القرآن"),
            t("Virtuous deeds and encouragement", "Tugendhafte Taten und Ermutigung", "فضائل الأعمال والترغيب"),
            t("Nothing at all", "Für gar nichts", "لا شيء"),
          ],
          answer: 2,
        },
        {
          q: t("How are fabricated reports used?", "Wie werden erfundene Berichte verwendet?", "كيف يُستعمل الموضوع؟"),
          options: [
            t("Only to warn about them", "Nur um davor zu warnen", "للتحذير منه فقط"),
            t("For virtues", "Für Tugenden", "في الفضائل"),
            t("For law", "Im Recht", "في الأحكام"),
            t("For creed", "Im Glauben", "في العقائد"),
          ],
          answer: 0,
        },
        {
          q: t("What is good practice when sharing a hadith?", "Was ist gute Praxis beim Weitergeben eines Hadith?", "ما الأدب عند نقل الحديث؟"),
          options: [
            t("Never mention a source", "Nie eine Quelle nennen", "عدم ذكر المصدر"),
            t("Change wording freely", "Wortlaut frei ändern", "تغيير اللفظ بحرية"),
            t("Assume all hadith are sound", "Alle Hadithe für gesund halten", "اعتبار كل حديث صحيحًا"),
            t("Mention its grade where possible", "Nach Möglichkeit die Bewertung nennen", "ذكر درجته ما أمكن"),
          ],
          answer: 3,
        },
      ],
    },
    {
      id: "h08-references",
      title: t("Reading a hadith reference responsibly", "Hadith-Angaben verantwortungsvoll lesen", "قراءة العزو إلى الحديث بمسؤولية"),
      body: t(
        `A reference such as "Muslim 8" points to a place in a collection, but numbers are less fixed than Quran verse keys.

## Numbering differs
- Editions and translations of the same book use different numbering systems. A number in one printed edition may point to another report in a different edition or website.
- Some systems count each chain separately, others group them; some number by book and chapter.

## Check several things
- **Collection**: which book exactly?
- **Edition or system**: which numbering does the source use?
- **Grade**: who graded the report and how? Not every report in a collection has the same standing, except where the compiler limited himself to sound reports.
- **Context**: what is the chapter, and are there other narrations that explain it?

## Ask and learn
- Hadith often need explanation (sharh) and knowledge of related evidence before drawing rulings.
- For practical questions, consult a qualified scholar rather than relying on a single quoted line.

In this app, references are shown with a collection name and number; if your book has different numbers, search by the topic or the narrator instead.`,
        `Eine Angabe wie „Muslim 8“ verweist auf eine Stelle in einer Sammlung, doch die Nummern sind weniger festgelegt als Koranvers-Angaben.

## Nummerierungen unterscheiden sich
- Ausgaben und Übersetzungen desselben Buches verwenden verschiedene Zählweisen. Eine Nummer aus einer Druckausgabe kann in einer anderen Ausgabe oder auf einer Website auf einen anderen Bericht zeigen.
- Manche Systeme zählen jede Kette einzeln, andere fassen sie zusammen; manche zählen nach Buch und Kapitel.

## Prüfen Sie mehrere Punkte
- **Sammlung**: Welches Buch genau?
- **Ausgabe oder System**: Welche Zählweise verwendet die Quelle?
- **Bewertung**: Wer hat den Bericht wie bewertet? Nicht jeder Bericht einer Sammlung hat denselben Rang, außer der Sammler hat sich auf gesunde Berichte beschränkt.
- **Kontext**: In welchem Kapitel steht er, und gibt es andere Überlieferungen, die ihn erklären?

## Fragen und lernen
- Hadithe brauchen oft Erläuterung (Scharh) und Kenntnis weiterer Belege, bevor man Urteile ableitet.
- Bei praktischen Fragen wenden Sie sich bitte an eine qualifizierte Gelehrte oder einen qualifizierten Gelehrten, statt sich auf eine einzelne zitierte Zeile zu verlassen.

In dieser App stehen Angaben mit Sammlung und Nummer; hat Ihr Buch andere Nummern, suchen Sie bitte nach Thema oder Überlieferer.`,
        `العزو مثل "مسلم 8" يدل على موضع في كتاب، لكن الأرقام أقل ثباتًا من أرقام الآيات.

## اختلاف الترقيم
- تستعمل الطبعات والترجمات المختلفة للكتاب الواحد أنظمة ترقيم مختلفة، فقد يدل رقم في طبعة على حديث آخر في طبعة أو موقع آخر.
- بعض الأنظمة يرقّم كل طريق على حدة، وبعضها يجمع الطرق، وبعضها يرقّم بحسب الكتاب والباب.

## تحقق من عدة أمور
- **الكتاب**: أي مصنف بالضبط؟
- **الطبعة أو النظام**: أي ترقيم يعتمد المصدر؟
- **الدرجة**: من حكم على الحديث وبماذا؟ فليست أحاديث الكتاب كلها في مرتبة واحدة إلا إذا التزم مؤلفه الصحيح.
- **السياق**: في أي باب ورد، وهل توجد روايات أخرى تفسّره؟

## اسأل وتعلّم
- كثير من الأحاديث يحتاج إلى شرح ومعرفة بالأدلة الأخرى قبل استنباط الأحكام.
- وفي المسائل العملية ارجع إلى عالم مؤهل بدل الاعتماد على سطر منقول.

يعرض هذا التطبيق العزو باسم الكتاب والرقم، فإن اختلف الترقيم في كتابك فابحث بالموضوع أو باسم الراوي.`
      ),
      hadith: ["muslim:8"],
      tags: ["consensus"],
      quiz: [
        {
          q: t("Why can the same number point to different reports?", "Warum kann dieselbe Nummer auf verschiedene Berichte zeigen?", "لماذا قد يدل الرقم نفسه على أحاديث مختلفة؟"),
          options: [
            t("Editions use different numbering systems", "Ausgaben nutzen unterschiedliche Zählweisen", "لاختلاف أنظمة الترقيم بين الطبعات"),
            t("Hadith change every year", "Hadithe ändern sich jährlich", "لأن الأحاديث تتغير كل عام"),
            t("Numbers are random", "Nummern sind zufällig", "لأن الأرقام عشوائية"),
            t("It never happens", "Das passiert nie", "لا يحدث ذلك"),
          ],
          answer: 0,
        },
        {
          q: t("What is a sharh?", "Was ist ein Scharh?", "ما الشرح؟"),
          options: [
            t("A chain of narrators", "Eine Überliefererkette", "سلسلة رواة"),
            t("A commentary explaining hadith", "Ein erläuternder Kommentar", "كتاب يفسر الأحاديث ويبينها"),
            t("A fabricated report", "Ein erfundener Bericht", "خبر موضوع"),
            t("A numbering system", "Eine Zählweise", "نظام ترقيم"),
          ],
          answer: 1,
        },
        {
          q: t("What should you do for a practical ruling?", "Was sollten Sie bei einer praktischen Frage tun?", "ماذا تفعل في مسألة عملية؟"),
          options: [
            t("Rely on one quoted line", "Sich auf eine zitierte Zeile verlassen", "الاعتماد على سطر منقول"),
            t("Ignore hadith", "Hadithe ignorieren", "ترك الأحاديث"),
            t("Consult a qualified scholar", "Eine qualifizierte Gelehrtenperson fragen", "سؤال عالم مؤهل"),
            t("Pick the first search result", "Das erste Suchergebnis nehmen", "أخذ أول نتيجة بحث"),
          ],
          answer: 2,
        },
      ],
    },
  ],
};
