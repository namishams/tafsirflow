// Tajweed in depth (riwayah Hafs 'an 'Asim, Shatibiyyah path). Pure data, no Quran text: verses by key only.
import type { CLesson, CQuestion, Course, L } from "../types";

const l = (en: string, de: string, ar: string): L => ({ en, de, ar });
const q = (question: L, options: L[], answer: number, explain: L): CQuestion => ({ q: question, options, answer, explain });

const lessons: CLesson[] = [
  {
    id: "t01-sifat",
    title: l("The qualities of the letters (sifat)", "Die Eigenschaften der Buchstaben (Sifat)", "صفات الحروف"),
    body: l(
      `## Why qualities matter
The makhraj tells you *where* a letter is produced, the sifat tell you *how*. Two letters from the same place, such as ت and ط, differ only by their qualities.

## Qualities with an opposite
- **Hams / Jahr**: breath flows (hams: ف ح ث ه ش خ ص س ك ت) or is held back (jahr: all others).
- **Shiddah / Tawassut / Rakhawah**: the sound is blocked (أ ج د ق ط ب ك ت), in between (ل ن ع م ر), or flows freely.
- **Isti'la / Istifal**: the back of the tongue rises (خ ص ض غ ط ق ظ) or stays low.
- **Itbaq / Infitah**: the tongue closes against the palate (ص ض ط ظ) or not.

## Qualities without an opposite
- **Safir** (whistle): ص س ز
- **Qalqalah** (echo): ق ط ب ج د
- **Lin** (softness): و and ي sakinah after a fatha
- **Inhiraf** (deviation): ل ر
- **Takrir** (repetition, to be restrained): ر
- **Tafashshi** (spreading air): ش
- **Istitalah** (lengthening of the makhraj): ض

Learn the groups by ear with a teacher; the lists are only a map.`,
      `## Warum Eigenschaften wichtig sind
Der Makhraj sagt Ihnen, *wo* ein Buchstabe entsteht, die Sifat sagen, *wie*. Zwei Buchstaben aus derselben Stelle, etwa ت und ط, unterscheiden sich nur durch ihre Eigenschaften.

## Eigenschaften mit Gegenteil
- **Hams / Jahr**: Der Atem fließt (Hams: ف ح ث ه ش خ ص س ك ت) oder wird zurückgehalten (Jahr: alle anderen).
- **Shiddah / Tawassut / Rakhawah**: Der Laut wird blockiert (أ ج د ق ط ب ك ت), liegt dazwischen (ل ن ع م ر) oder fließt frei.
- **Isti'la / Istifal**: Der hintere Zungenrücken hebt sich (خ ص ض غ ط ق ظ) oder bleibt unten.
- **Itbaq / Infitah**: Die Zunge schließt sich an den Gaumen (ص ض ط ظ) oder nicht.

## Eigenschaften ohne Gegenteil
- **Safir** (Pfeifen): ص س ز
- **Qalqalah** (Nachhall): ق ط ب ج د
- **Lin** (Weichheit): و und ي mit Sukun nach Fatha
- **Inhiraf** (Abweichung): ل ر
- **Takrir** (Wiederholung, die zurückgehalten wird): ر
- **Tafashshi** (Ausbreiten der Luft): ش
- **Istitalah** (Verlängerung des Makhraj): ض

Lernen Sie die Gruppen mit dem Gehör bei einer Lehrperson; die Listen sind nur eine Landkarte.`,
      `## أهمية الصفات
المخرج يبيّن موضع الحرف، والصفة تبيّن كيفيته. فالتاء والطاء من مخرج واحد ولا يفرّق بينهما إلا الصفات.

## صفات لها ضد
- **الهمس والجهر**: حروف الهمس «فحثه شخص سكت»، والباقي مجهور.
- **الشدة والتوسط والرخاوة**: الشدة «أجد قط بكت»، والتوسط «لن عمر»، والباقي رخو.
- **الاستعلاء والاستفال**: حروف الاستعلاء «خص ضغط قظ».
- **الإطباق والانفتاح**: الإطباق في ص ض ط ظ.

## صفات لا ضد لها
- **الصفير**: ص س ز
- **القلقلة**: «قطب جد»
- **اللين**: الواو والياء الساكنتان بعد فتح
- **الانحراف**: اللام والراء
- **التكرير**: الراء، ويُتجنَّب المبالغة فيه
- **التفشي**: الشين
- **الاستطالة**: الضاد

تُتقن الصفات بالتلقي والمشافهة، والقوائم عون على الفهم فقط.`
    ),
    quiz: [
      q(l("Which letters carry itbaq?", "Welche Buchstaben haben Itbaq?", "ما حروف الإطباق؟"),
        [l("ق غ خ", "ق غ خ", "ق غ خ"), l("ص ض ط ظ", "ص ض ط ظ", "ص ض ط ظ"), l("ل ن ع م ر", "ل ن ع م ر", "ل ن ع م ر"), l("ص س ز", "ص س ز", "ص س ز")], 1,
        l("Itbaq is the closing of the tongue against the palate in the four letters ص ض ط ظ.", "Itbaq ist das Anlegen der Zunge an den Gaumen bei den vier Buchstaben ص ض ط ظ.", "الإطباق في أربعة أحرف: ص ض ط ظ.")),
      q(l("Which quality belongs to the shin (ش) alone?", "Welche Eigenschaft hat allein das Shin (ش)?", "ما الصفة الخاصة بالشين؟"),
        [l("Istitalah", "Istitalah", "الاستطالة"), l("Takrir", "Takrir", "التكرير"), l("Safir", "Safir", "الصفير"), l("Tafashshi", "Tafashshi", "التفشي")], 3,
        l("Tafashshi, the spreading of air in the mouth, is the quality of the shin.", "Tafashshi, das Ausbreiten der Luft im Mund, ist die Eigenschaft des Shin.", "التفشي انتشار الهواء في الفم، وهو صفة الشين.")),
      q(l("What is true of the takrir of the ra?", "Was gilt für das Takrir des Ra?", "ما الصحيح في تكرير الراء؟"),
        [l("It must be avoided, not exaggerated", "Es wird vermieden, nicht übertrieben", "يُعرف ليُجتنب لا ليُبالغ فيه"), l("The ra is rolled three times", "Das Ra wird dreimal gerollt", "تُكرَّر الراء ثلاثًا"), l("It only applies at a stop", "Es gilt nur beim Anhalten", "يكون عند الوقف فقط"), l("It belongs to the lam", "Es gehört zum Lam", "هو صفة اللام")], 0,
        l("The tongue tends to vibrate on the ra; the reciter learns this quality in order to restrain it.", "Die Zunge neigt beim Ra zum Vibrieren; man lernt die Eigenschaft, um sie zu zügeln.", "يُعرف التكرير ليُتحفَّظ منه، فلا تُرعَد الراء.")),
    ],
  },
  {
    id: "t02-ra",
    title: l("The rules of the ra", "Die Regeln des Ra", "أحكام الراء"),
    body: l(
      `## Heavy (tafkhim)
- Ra with **fatha** or **damma**.
- Ra **sakinah** after a fatha or damma.
- Ra sakinah after a **non-original kasra**, e.g. after a hamzat al-wasl at the start of a word.
- Ra sakinah after an original kasra when a **heavy letter** (isti'la) follows in the same word without a kasra on it.

## Light (tarqiq)
- Ra with **kasra**.
- Ra sakinah after an **original kasra** in the same word, with no isti'la letter following.
- At a stop: ra after a **kasra**, or after a **ya sakinah**, is light.

## At a stop
Look at the letter before the ra. If the ra is preceded by a sakin letter, look one further back. A word with a ra at the end may thus be heavy in connected reading and light at the stop, or the other way round.

## Both allowed
In some words both ways are transmitted, e.g. the word for "part" (firq) in 26:63, where the kasra on the following qaf allows tarqiq.

Listen for the ra in Surat al-Fatiha (1:6, 1:7) and practise both kinds.`,
      `## Schwer (Tafkhim)
- Ra mit **Fatha** oder **Damma**.
- Ra mit **Sukun** nach Fatha oder Damma.
- Ra mit Sukun nach einer **nicht ursprünglichen Kasra**, etwa nach einer Hamzat al-Wasl am Wortanfang.
- Ra mit Sukun nach ursprünglicher Kasra, wenn im selben Wort ein **schwerer Buchstabe** (Isti'la) ohne Kasra folgt.

## Leicht (Tarqiq)
- Ra mit **Kasra**.
- Ra mit Sukun nach **ursprünglicher Kasra** im selben Wort, ohne folgenden Isti'la-Buchstaben.
- Beim Anhalten: Ra nach **Kasra** oder nach **Ya mit Sukun** ist leicht.

## Beim Anhalten
Schauen Sie auf den Buchstaben vor dem Ra. Hat dieser Sukun, schauen Sie einen weiter zurück. So kann ein Ra am Wortende im Weiterlesen schwer und beim Anhalten leicht sein oder umgekehrt.

## Beides erlaubt
In manchen Wörtern sind beide Arten überliefert, etwa im Wort „firq“ (Teil) in 26:63; die Kasra auf dem folgenden Qaf erlaubt Tarqiq.

Achten Sie auf das Ra in Surat al-Fatiha (1:6, 1:7) und üben Sie beide Arten.`,
      `## التفخيم
- الراء المفتوحة أو المضمومة.
- الراء الساكنة بعد فتح أو ضم.
- الساكنة بعد كسر عارض، كهمزة الوصل في أول الكلمة.
- الساكنة بعد كسر أصلي إذا تلاها حرف استعلاء غير مكسور في الكلمة نفسها.

## الترقيق
- الراء المكسورة.
- الساكنة بعد كسر أصلي متصل بلا حرف استعلاء بعدها.
- عند الوقف: الراء بعد كسر أو بعد ياء ساكنة.

## عند الوقف
يُنظر إلى ما قبل الراء، فإن كان ساكنًا نُظر إلى ما قبله. وقد تُفخَّم الراء وصلًا وتُرقَّق وقفًا أو العكس.

## جواز الوجهين
مثل كلمة «فرق» في الشعراء ٦٣، والترقيق فيها لكسر القاف بعدها.`
    ),
    verses: ["1:6", "1:7", "26:63"],
    quiz: [
      q(l("A ra with kasra is …", "Ein Ra mit Kasra ist …", "الراء المكسورة …"),
        [l("always heavy", "immer schwer", "مفخمة دائمًا"), l("heavy only at a stop", "nur beim Anhalten schwer", "مفخمة وقفًا فقط"), l("light", "leicht", "مرققة"), l("both allowed", "beides erlaubt", "بالوجهين")], 2,
        l("A ra carrying a kasra is always pronounced light.", "Ein Ra mit Kasra wird immer leicht gesprochen.", "الراء المكسورة مرققة.")),
      q(l("A ra sakinah after a hamzat al-wasl is …", "Ein Ra mit Sukun nach Hamzat al-Wasl ist …", "الراء الساكنة بعد همزة الوصل …"),
        [l("heavy", "schwer", "مفخمة"), l("light", "leicht", "مرققة"), l("silent", "stumm", "لا تُنطق"), l("lengthened", "gedehnt", "ممدودة")], 0,
        l("The kasra of a hamzat al-wasl is not original, so the ra stays heavy.", "Die Kasra einer Hamzat al-Wasl ist nicht ursprünglich, daher bleibt das Ra schwer.", "كسرة همزة الوصل عارضة فتُفخَّم الراء.")),
      q(l("At a stop, a ra after a ya sakinah is …", "Beim Anhalten ist ein Ra nach Ya mit Sukun …", "عند الوقف تكون الراء بعد ياء ساكنة …"),
        [l("heavy", "schwer", "مفخمة"), l("with qalqalah", "mit Qalqalah", "مقلقلة"), l("dropped", "weggelassen", "محذوفة"), l("light", "leicht", "مرققة")], 3,
        l("The ya sakinah before it makes the ra light at the stop.", "Das Ya mit Sukun davor macht das Ra beim Anhalten leicht.", "الياء الساكنة قبلها توجب الترقيق وقفًا.")),
    ],
  },
  {
    id: "t03-lam-allah",
    title: l("The lam in the name Allah", "Das Lam im Namen Allah", "لام لفظ الجلالة"),
    body: l(
      `## The basic rule
The lam in the name Allah is normally light like every other lam. It becomes **heavy** only in the divine name, depending on the vowel before it.

- **Heavy (tafkhim)** after a **fatha** or a **damma**, and when you start reading with the name itself.
- **Light (tarqiq)** after a **kasra**, whether the kasra is original or added to join two words.

## Examples by position
- At the start of a verse or after a pause: heavy.
- After a preposition with kasra, as in the basmala (1:1): light.
- After a word ending in damma, as at the opening of Surat al-Ikhlas (112:1): heavy.

## Also in "Allahumma"
The same rule applies to the word *Allahumma*, since it contains the divine name.

## Practical tips
- Heavy here means rounding the mouth slightly and raising the back of the tongue, without turning the alif into a "o".
- Light means the tip of the tongue is placed as for any normal lam.
- Do not let the heavy lam change the letter after it.`,
      `## Die Grundregel
Das Lam im Namen Allah ist eigentlich leicht wie jedes andere Lam. Nur im Gottesnamen wird es **schwer**, abhängig vom Vokal davor.

- **Schwer (Tafkhim)** nach **Fatha** oder **Damma** sowie wenn Sie mit dem Namen selbst beginnen.
- **Leicht (Tarqiq)** nach **Kasra**, gleich ob die Kasra ursprünglich ist oder zum Verbinden zweier Wörter hinzukommt.

## Beispiele nach Stellung
- Am Versanfang oder nach einer Pause: schwer.
- Nach einer Präposition mit Kasra, wie in der Basmala (1:1): leicht.
- Nach einem Wort, das auf Damma endet, wie am Anfang von Surat al-Ikhlas (112:1): schwer.

## Auch in „Allahumma“
Dieselbe Regel gilt für das Wort *Allahumma*, da es den Gottesnamen enthält.

## Praktische Hinweise
- Schwer bedeutet hier, den Mund leicht zu runden und den hinteren Zungenrücken anzuheben, ohne das Alif zu einem „o“ zu machen.
- Leicht bedeutet, die Zungenspitze wie bei jedem gewöhnlichen Lam anzulegen.
- Lassen Sie das schwere Lam nicht den folgenden Buchstaben verändern.`,
      `## القاعدة
الأصل في اللام الترقيق، ولا تُفخَّم إلا في لفظ الجلالة بحسب ما قبلها.

- **تُفخَّم** بعد فتح أو ضم، وعند الابتداء بلفظ الجلالة.
- **تُرقَّق** بعد كسر، أصليًّا كان أو عارضًا.

## أمثلة
- عند الابتداء: تفخيم.
- بعد حرف جر مكسور كما في البسملة (١:١): ترقيق.
- بعد ضمّ كما في أول سورة الإخلاص (١١٢:١): تفخيم.

## «اللهم»
تنطبق القاعدة نفسها على «اللهم».

## تنبيهات
- لا يُحوَّل الألف بعد اللام المفخمة إلى واو.
- اللام المرققة تُنطق كسائر اللامات.`
    ),
    verses: ["1:1", "112:1", "110:1"],
    quiz: [
      q(l("After a kasra, the lam of Allah is …", "Nach Kasra ist das Lam von Allah …", "بعد الكسر تكون لام الجلالة …"),
        [l("heavy", "schwer", "مفخمة"), l("light", "leicht", "مرققة"), l("doubled", "verdoppelt", "مشددة مرتين"), l("silent", "stumm", "ساكنة")], 1,
        l("Any kasra before the divine name makes its lam light.", "Jede Kasra vor dem Gottesnamen macht sein Lam leicht.", "الكسر قبل لفظ الجلالة يوجب الترقيق.")),
      q(l("How is the lam read when you start with the name Allah?", "Wie wird das Lam gelesen, wenn Sie mit dem Namen Allah beginnen?", "كيف تُقرأ اللام عند الابتداء بلفظ الجلالة؟"),
        [l("Light", "Leicht", "مرققة"), l("With ghunnah", "Mit Ghunnah", "بغنة"), l("Heavy", "Schwer", "مفخمة"), l("With qalqalah", "Mit Qalqalah", "بقلقلة")], 2,
        l("Starting with the name means the opening hamza has a fatha, so the lam is heavy.", "Beim Beginnen trägt die Hamza eine Fatha, daher ist das Lam schwer.", "يُبتدأ بهمزة مفتوحة فتُفخَّم اللام.")),
      q(l("In the basmala (1:1) the lam of Allah is …", "In der Basmala (1:1) ist das Lam von Allah …", "لام الجلالة في البسملة …"),
        [l("light, because of the kasra before it", "leicht wegen der Kasra davor", "مرققة لكسر ما قبلها"), l("heavy, because of the fatha", "schwer wegen der Fatha", "مفخمة للفتح"), l("heavy, because of the damma", "schwer wegen der Damma", "مفخمة للضم"), l("both allowed", "beides erlaubt", "بالوجهين")], 0,
        l("The name follows a word ending in kasra, so it is light.", "Der Name folgt auf ein Wort mit Kasra am Ende, daher leicht.", "ما قبلها مكسور فتُرقَّق.")),
    ],
  },
  {
    id: "t04-hamzah",
    title: l("Hamzat al-wasl and hamzat al-qat'", "Hamzat al-Wasl und Hamzat al-Qat'", "همزة الوصل وهمزة القطع"),
    body: l(
      `## Two kinds of hamza
- **Hamzat al-qat'** (cutting hamza) is always pronounced, whether you start with the word or connect it.
- **Hamzat al-wasl** (connecting hamza) is pronounced only when you **start** with the word. In connected reading it falls away and the previous word joins the next letter.

## Where hamzat al-wasl occurs
- In the definite article *al-*.
- In certain nouns, e.g. *ism*, *ibn*, *imra'ah*, *ithnan*.
- In the imperative of many verbs and in verbal forms VII to X, e.g. *ihdina* (1:6).

## Which vowel when starting
- Article *al-*: fatha.
- Verbs: look at the third letter. If it has an original **damma**, start with damma; if it has fatha or kasra, start with **kasra**.
- Nouns: kasra.

## Two hamzat al-wasl in a row
If a word with hamzat al-wasl follows a word ending in a sakin letter, the sakin letter gets a helping vowel, usually a kasra. Never pronounce the hamza in the middle of connected reading.`,
      `## Zwei Arten der Hamza
- **Hamzat al-Qat'** (trennende Hamza) wird immer gesprochen, ob Sie mit dem Wort beginnen oder es verbinden.
- **Hamzat al-Wasl** (verbindende Hamza) wird nur gesprochen, wenn Sie mit dem Wort **beginnen**. Im Weiterlesen fällt sie weg, und das vorige Wort verbindet sich mit dem nächsten Buchstaben.

## Wo Hamzat al-Wasl vorkommt
- Im bestimmten Artikel *al-*.
- In bestimmten Nomen, etwa *ism*, *ibn*, *imra'ah*, *ithnan*.
- Im Imperativ vieler Verben und in den Verbstämmen VII bis X, etwa *ihdina* (1:6).

## Mit welchem Vokal beginnen
- Artikel *al-*: Fatha.
- Verben: Achten Sie auf den dritten Buchstaben. Trägt er eine ursprüngliche **Damma**, beginnen Sie mit Damma; bei Fatha oder Kasra mit **Kasra**.
- Nomen: Kasra.

## Nach einem Sukun
Folgt ein Wort mit Hamzat al-Wasl auf ein Wort mit Sukun am Ende, erhält der stumme Buchstabe einen Hilfsvokal, meist Kasra. Sprechen Sie die Hamza im Weiterlesen nie aus.`,
      `## نوعا الهمزة
- **همزة القطع** تُنطق ابتداءً ووصلًا.
- **همزة الوصل** تُنطق في الابتداء فقط وتسقط في الدرج.

## مواضع همزة الوصل
- «ال» التعريف.
- أسماء محفوظة كاسم وابن وامرأة واثنين.
- أمر الثلاثي وماضي الخماسي والسداسي وأمرهما ومصدرهما، مثل «اهدنا» (١:٦).

## حركة البدء
- في «ال»: الفتح.
- في الأفعال: يُنظر إلى الثالث، فإن كان مضمومًا ضمًّا لازمًا بُدئ بالضم، وإلا فبالكسر.
- في الأسماء: الكسر.

## التقاء الساكنين
إذا سبقها ساكن حُرِّك غالبًا بالكسر، ولا تُنطق الهمزة في الوصل.`
    ),
    verses: ["1:6", "96:1"],
    quiz: [
      q(l("When is hamzat al-wasl pronounced?", "Wann wird Hamzat al-Wasl gesprochen?", "متى تُنطق همزة الوصل؟"),
        [l("Always", "Immer", "دائمًا"), l("Only in connected reading", "Nur im Weiterlesen", "في الوصل فقط"), l("Only when starting with the word", "Nur beim Beginnen mit dem Wort", "عند الابتداء فقط"), l("Never", "Nie", "لا تُنطق أبدًا")], 2,
        l("It connects: it is dropped in connected reading and pronounced only at the start.", "Sie verbindet: Im Weiterlesen fällt sie weg, nur am Anfang wird sie gesprochen.", "تثبت ابتداءً وتسقط وصلًا.")),
      q(l("With which vowel do you start the article al-?", "Mit welchem Vokal beginnen Sie den Artikel al-?", "بأي حركة يُبدأ بـ«ال»؟"),
        [l("Fatha", "Fatha", "الفتح"), l("Kasra", "Kasra", "الكسر"), l("Damma", "Damma", "الضم"), l("Sukun", "Sukun", "السكون")], 0,
        l("The hamza of the article is started with fatha.", "Die Hamza des Artikels wird mit Fatha begonnen.", "همزة «ال» مفتوحة في الابتداء.")),
      q(l("A verb whose third letter has an original damma starts with …", "Ein Verb, dessen dritter Buchstabe eine ursprüngliche Damma trägt, beginnt mit …", "الفعل المضموم ثالثه ضمًّا لازمًا يُبدأ بـ…"),
        [l("kasra", "Kasra", "الكسر"), l("fatha", "Fatha", "الفتح"), l("no vowel", "keinem Vokal", "بلا حركة"), l("damma", "Damma", "الضم")], 3,
        l("The damma of the third letter carries over to the hamzat al-wasl.", "Die Damma des dritten Buchstabens überträgt sich auf die Hamzat al-Wasl.", "يُبدأ بالضم مراعاة لضم الثالث.")),
    ],
  },
  {
    id: "t05-madd-1",
    title: l("Madd in detail (1): natural, connected, separated", "Madd im Detail (1): natürlich, verbunden, getrennt", "المد تفصيلًا (١): الطبيعي والمتصل والمنفصل"),
    body: l(
      `## Madd tabi'i (natural)
A madd letter (alif after fatha, waw sakinah after damma, ya sakinah after kasra) with no hamza or sukun after it: **2 counts**. It is the base of every other madd.

## Madd muttasil (connected)
A hamza follows the madd letter **in the same word**, as in the verb for "came" in 110:1. In Hafs via the Shatibiyyah: **4 or 5 counts**, obligatory (wajib). If the hamza is at the end and you stop, up to 6 is allowed.

## Madd munfasil (separated)
The madd letter ends one word and the hamza begins the next, as in 2:4 after "bima". In Hafs via the Shatibiyyah: **4 or 5 counts**, permitted (ja'iz) because other readings shorten it. Keep the same length you choose for muttasil.

## Consistency
Choose one length and keep it throughout the recitation. Muttasil must never be shorter than munfasil.

## Badal and 'iwad
- **Badal**: a hamza comes *before* the madd letter: 2 counts in Hafs.
- **'Iwad**: when stopping on a tanwin with fatha, it becomes an alif of 2 counts.`,
      `## Madd tabi'i (natürlich)
Ein Madd-Buchstabe (Alif nach Fatha, Waw mit Sukun nach Damma, Ya mit Sukun nach Kasra) ohne folgende Hamza oder Sukun: **2 Zählzeiten**. Er ist die Grundlage jedes anderen Madd.

## Madd muttasil (verbunden)
Auf den Madd-Buchstaben folgt eine Hamza **im selben Wort**, wie im Verb für „kam“ in 110:1. Bei Hafs über die Shatibiyyah: **4 oder 5 Zählzeiten**, verpflichtend (wajib). Steht die Hamza am Ende und Sie halten an, sind bis zu 6 erlaubt.

## Madd munfasil (getrennt)
Der Madd-Buchstabe beendet ein Wort, die Hamza beginnt das nächste, etwa in 2:4 nach „bima“. Bei Hafs über die Shatibiyyah: **4 oder 5 Zählzeiten**, erlaubt (ja'iz), weil andere Lesarten ihn kürzen. Halten Sie dieselbe Länge wie beim Muttasil.

## Gleichmäßigkeit
Wählen Sie eine Länge und behalten Sie sie während der ganzen Rezitation bei. Muttasil darf nie kürzer als Munfasil sein.

## Badal und 'Iwad
- **Badal**: Die Hamza steht *vor* dem Madd-Buchstaben: bei Hafs 2 Zählzeiten.
- **'Iwad**: Beim Anhalten auf Tanwin mit Fatha wird daraus ein Alif von 2 Zählzeiten.`,
      `## المد الطبيعي
حرف مد لا يليه همز ولا سكون: حركتان، وهو أصل المدود.

## المد المتصل
يلي حرفَ المد همزٌ في كلمة واحدة، كما في «جاء» (١١٠:١). لحفص من الشاطبية أربع أو خمس حركات، وهو واجب، ويجوز ستّ عند الوقف إذا تطرفت الهمزة.

## المد المنفصل
حرف المد آخر كلمة والهمز أول التي بعدها، كما في (٢:٤). لحفص من الشاطبية أربع أو خمس، وهو جائز.

## التسوية
يُلتزم مقدار واحد في التلاوة كلها، ولا يكون المتصل أقصر من المنفصل.

## البدل والعوض
- **البدل**: تقدّم الهمز على حرف المد، حركتان.
- **العوض**: الوقف على تنوين النصب بألف، حركتان.`
    ),
    verses: ["110:1", "2:4"],
    quiz: [
      q(l("How long is madd muttasil in Hafs via the Shatibiyyah?", "Wie lang ist Madd muttasil bei Hafs über die Shatibiyyah?", "كم مقدار المتصل لحفص من الشاطبية؟"),
        [l("2 counts", "2 Zählzeiten", "حركتان"), l("4 or 5 counts", "4 oder 5 Zählzeiten", "أربع أو خمس"), l("Only 6", "Nur 6", "ست فقط"), l("1 count", "1 Zählzeit", "حركة")], 1,
        l("Muttasil is obligatory with 4 or 5 counts; 6 only when stopping on a final hamza.", "Muttasil ist verpflichtend mit 4 oder 5; 6 nur beim Anhalten auf einer End-Hamza.", "المتصل واجب أربعًا أو خمسًا، وستًّا وقفًا على همز متطرف.")),
      q(l("Why is madd munfasil called permitted (ja'iz)?", "Warum heißt Madd munfasil erlaubt (ja'iz)?", "لماذا سُمّي المنفصل جائزًا؟"),
        [l("Because it is never lengthened", "Weil er nie gedehnt wird", "لأنه لا يُمد"), l("Because it only occurs at a stop", "Weil er nur beim Anhalten vorkommt", "لأنه وقفي"), l("Because some readings shorten it", "Weil manche Lesarten ihn kürzen", "لجواز قصره عند بعض القراء"), l("Because it has a ghunnah", "Weil er eine Ghunnah hat", "لأن فيه غنة")], 2,
        l("Other transmissions read it with 2 counts, so its lengthening is not obligatory.", "Andere Überlieferungen lesen ihn mit 2 Zählzeiten, daher ist die Dehnung nicht verpflichtend.", "قصره بعض القراء فكان جائزًا.")),
      q(l("Stopping on a tanwin with fatha produces …", "Anhalten auf Tanwin mit Fatha ergibt …", "الوقف على تنوين النصب يكون …"),
        [l("madd 'iwad of 2 counts", "Madd 'iwad mit 2 Zählzeiten", "مد عوض بحركتين"), l("madd lazim", "Madd lazim", "مدًا لازمًا"), l("a ghunnah", "eine Ghunnah", "غنة"), l("qalqalah", "Qalqalah", "قلقلة")], 0,
        l("The tanwin is replaced by an alif of 2 counts.", "Der Tanwin wird durch ein Alif von 2 Zählzeiten ersetzt.", "يُبدل التنوين ألفًا بمقدار حركتين.")),
    ],
  },
  {
    id: "t06-madd-2",
    title: l("Madd in detail (2): lazim, 'arid, lin, silah", "Madd im Detail (2): lazim, 'arid, Lin, Silah", "المد تفصيلًا (٢): اللازم والعارض واللين والصلة"),
    body: l(
      `## Madd lazim (necessary): 6 counts
A permanent sukun or shaddah follows the madd letter.
- **Kalimi muthaqqal**: in a word, with shaddah, as in the last word of 1:7.
- **Kalimi mukhaffaf**: in a word, with plain sukun (rare; e.g. the question form in 10:51).
- **Harfi muthaqqal**: in an opening letter whose sukun merges into the next, e.g. the lam in "alif lam mim" (2:1).
- **Harfi mukhaffaf**: an opening letter without merging, e.g. the mim at the end of "alif lam mim".

## Madd 'arid lissukun: 2, 4 or 6
The sukun only arises because you stop, as at the end of 1:4 and 1:5.

## Madd lin
Waw or ya sakinah after a fatha, followed by a stop, as in 106:1: 2, 4 or 6. Without a stop it is not lengthened.

## Madd silah
The pronoun "hu/hi" between two voweled letters is lengthened:
- **Sughra**: no hamza follows: 2 counts.
- **Kubra**: a hamza follows: 4 or 5 like munfasil.
It is dropped at a stop.`,
      `## Madd lazim (notwendig): 6 Zählzeiten
Auf den Madd-Buchstaben folgt ein dauerhafter Sukun oder eine Shaddah.
- **Kalimi muthaqqal**: im Wort, mit Shaddah, wie im letzten Wort von 1:7.
- **Kalimi mukhaffaf**: im Wort, mit einfachem Sukun (selten; etwa die Frageform in 10:51).
- **Harfi muthaqqal**: in einem Eröffnungsbuchstaben, dessen Sukun in den nächsten übergeht, etwa das Lam in „alif lam mim“ (2:1).
- **Harfi mukhaffaf**: ein Eröffnungsbuchstabe ohne Verschmelzung, etwa das Mim am Ende von „alif lam mim“.

## Madd 'arid lissukun: 2, 4 oder 6
Der Sukun entsteht nur durch das Anhalten, wie am Ende von 1:4 und 1:5.

## Madd Lin
Waw oder Ya mit Sukun nach Fatha, gefolgt vom Anhalten, wie in 106:1: 2, 4 oder 6. Ohne Anhalten wird nicht gedehnt.

## Madd Silah
Das Pronomen „hu/hi“ zwischen zwei vokalisierten Buchstaben wird gedehnt:
- **Sughra**: keine Hamza folgt: 2 Zählzeiten.
- **Kubra**: eine Hamza folgt: 4 oder 5 wie Munfasil.
Beim Anhalten entfällt sie.`,
      `## المد اللازم: ست حركات
يلي حرفَ المد سكونٌ أصلي أو تشديد.
- **كلمي مثقل**: في كلمة مع تشديد، كآخر كلمة في (١:٧).
- **كلمي مخفف**: في كلمة مع سكون، كموضعي يونس (١٠:٥١).
- **حرفي مثقل**: في فواتح السور مع إدغام، كاللام في «الم» (٢:١).
- **حرفي مخفف**: بلا إدغام، كالميم في «الم».

## العارض للسكون: ٢ أو ٤ أو ٦
سكونه بسبب الوقف، كآخر (١:٤) و(١:٥).

## مد اللين
واو أو ياء ساكنة بعد فتح مع الوقف، كما في (١٠٦:١): ٢ أو ٤ أو ٦، ولا يُمد وصلًا.

## مد الصلة
هاء الضمير بين متحركين:
- **صغرى**: لا يليها همز، حركتان.
- **كبرى**: يليها همز، أربع أو خمس.
وتسقط وقفًا.`
    ),
    verses: ["1:7", "2:1", "1:4", "106:1", "104:3"],
    quiz: [
      q(l("How long is madd lazim?", "Wie lang ist Madd lazim?", "كم مقدار المد اللازم؟"),
        [l("2", "2", "حركتان"), l("4 or 5", "4 oder 5", "أربع أو خمس"), l("2, 4 or 6", "2, 4 oder 6", "٢ أو ٤ أو ٦"), l("6", "6", "ست")], 3,
        l("Madd lazim is always 6 counts.", "Madd lazim hat immer 6 Zählzeiten.", "اللازم ست حركات لزومًا.")),
      q(l("Madd lin is lengthened …", "Madd Lin wird gedehnt …", "يُمد مد اللين …"),
        [l("only when stopping", "nur beim Anhalten", "عند الوقف فقط"), l("always", "immer", "دائمًا"), l("never", "nie", "لا يُمد"), l("only before hamza", "nur vor Hamza", "قبل الهمز فقط")], 0,
        l("Lin is a madd only at a stop; in connected reading the vowel is short.", "Lin ist nur beim Anhalten ein Madd; im Weiterlesen bleibt es kurz.", "اللين لا يُمد إلا وقفًا.")),
      q(l("Silah kubra occurs when the pronoun is followed by …", "Silah kubra liegt vor, wenn auf das Pronomen folgt …", "الصلة الكبرى إذا تلا الهاءَ …"),
        [l("a sukun", "ein Sukun", "ساكن"), l("a hamza", "eine Hamza", "همز"), l("a shaddah", "eine Shaddah", "مشدد"), l("a stop", "ein Anhalten", "وقف")], 1,
        l("With a hamza after it, silah becomes kubra and is lengthened like munfasil (e.g. 104:3).", "Mit folgender Hamza wird die Silah zur Kubra und wie Munfasil gedehnt (z. B. 104:3).", "إذا تلاها همز صارت كبرى وتُمد كالمنفصل.")),
    ],
  },
  {
    id: "t07-idgham-pairs",
    title: l("Two identical, related and close letters", "Gleiche, verwandte und nahe Buchstaben", "المتماثلان والمتجانسان والمتقاربان"),
    body: l(
      `## The idea
When a sakin letter meets a voweled letter, the first may merge into the second. The relationship between the two decides the rule.

## Mutamathilayn (identical)
Same letter twice, the first sakin: merging is **obligatory**, as with the two ta in 2:16 or the two ba in 2:60. Exception: a madd letter is not merged.

## Mutajanisayn (related)
Same makhraj, different qualities. In Hafs merged in fixed cases:
- ت into د and ط, د into ت (e.g. 2:256).
- ذ into ظ, ث into ذ.
- ب into م in 11:42.
- The ط into ت keeps its itbaq (incomplete merging).

## Mutaqaribayn (close)
Close makhraj or qualities. In Hafs:
- ل into ر, as in 17:24 and 4:158.
- ق into ك in 77:20: the most common reading merges fully.
- Lam of the article into the sun letters and nun sakinah into ي ر م ل و ن also belong here.

## Otherwise
Where none of these merges are transmitted, read each letter clearly (izhar).`,
      `## Die Idee
Trifft ein Buchstabe mit Sukun auf einen vokalisierten Buchstaben, kann der erste im zweiten aufgehen. Das Verhältnis der beiden bestimmt die Regel.

## Mutamathilayn (gleich)
Zweimal derselbe Buchstabe, der erste mit Sukun: Die Verschmelzung ist **verpflichtend**, wie bei den zwei Ta in 2:16 oder den zwei Ba in 2:60. Ausnahme: Ein Madd-Buchstabe wird nicht verschmolzen.

## Mutajanisayn (verwandt)
Gleicher Makhraj, verschiedene Eigenschaften. Bei Hafs in festen Fällen:
- ت in د und ط, د in ت (z. B. 2:256).
- ذ in ظ, ث in ذ.
- ب in م in 11:42.
- ط in ت behält sein Itbaq (unvollständige Verschmelzung).

## Mutaqaribayn (nah)
Nahe Makharij oder Eigenschaften. Bei Hafs:
- ل in ر, wie in 17:24 und 4:158.
- ق in ك in 77:20: Die verbreitete Lesart verschmilzt vollständig.
- Auch das Lam des Artikels vor Sonnenbuchstaben und das Nun mit Sukun vor ي ر م ل و ن gehören hierher.

## Sonst
Wo keine Verschmelzung überliefert ist, lesen Sie jeden Buchstaben deutlich (Izhar).`,
      `## الفكرة
إذا التقى ساكن بمتحرك فقد يُدغم الأول في الثاني بحسب العلاقة بينهما.

## المتماثلان
حرفان متحدان مخرجًا وصفة، والأول ساكن: الإدغام واجب، كالتاءين في (٢:١٦) والباءين في (٢:٦٠)، ولا يُدغم حرف المد.

## المتجانسان
اتفقا مخرجًا واختلفا صفة. يُدغم عند حفص في مواضع:
- التاء في الدال والطاء، والدال في التاء (٢:٢٥٦).
- الذال في الظاء، والثاء في الذال.
- الباء في الميم في (١١:٤٢).
- الطاء في التاء إدغامًا ناقصًا مع بقاء الإطباق.

## المتقاربان
تقاربا مخرجًا أو صفة:
- اللام في الراء (١٧:٢٤، ٤:١٥٨).
- القاف في الكاف في (٧٧:٢٠) والمشهور الإدغام الكامل.

وما لم يُروَ فيه الإدغام يُظهر.`
    ),
    verses: ["2:16", "2:256", "11:42", "77:20", "17:24"],
    quiz: [
      q(l("Two identical letters, the first sakin, are …", "Zwei gleiche Buchstaben, der erste mit Sukun, werden …", "المتماثلان والأول ساكن يُ…"),
        [l("always read separately", "immer getrennt gelesen", "يُظهران دائمًا"), l("merged only at a stop", "nur beim Anhalten verschmolzen", "يُدغمان وقفًا فقط"), l("merged (obligatory)", "verschmolzen (verpflichtend)", "يُدغمان وجوبًا"), l("read with qalqalah", "mit Qalqalah gelesen", "يُقلقلان")], 2,
        l("Mutamathilayn sagir requires merging.", "Mutamathilayn mit Sukun verlangen Verschmelzung.", "المثلان الصغير يجب إدغامه.")),
      q(l("Which rule applies in 77:20?", "Welche Regel gilt in 77:20?", "ما الحكم في (٧٧:٢٠)؟"),
        [l("Idgham mutaqaribayn (qaf into kaf)", "Idgham mutaqaribayn (Qaf in Kaf)", "إدغام المتقاربين: القاف في الكاف"), l("Iqlab", "Iqlab", "الإقلاب"), l("Ikhfa shafawi", "Ikhfa shafawi", "الإخفاء الشفوي"), l("Madd lin", "Madd Lin", "مد اللين")], 0,
        l("Qaf and kaf are close letters; Hafs merges the qaf into the kaf.", "Qaf und Kaf sind nahe Buchstaben; Hafs verschmilzt das Qaf in das Kaf.", "القاف والكاف متقاربان.")),
      q(l("Ta and dal (as in 2:256) are …", "Ta und Dal (wie in 2:256) sind …", "التاء والدال …"),
        [l("identical", "gleich", "متماثلان"), l("close", "nah", "متقاربان"), l("unrelated", "fremd", "متباعدان"), l("related (same makhraj)", "verwandt (gleicher Makhraj)", "متجانسان")], 3,
        l("They share the makhraj at the tip of the tongue but differ in qualities.", "Sie teilen den Makhraj an der Zungenspitze, unterscheiden sich aber in den Eigenschaften.", "اتحدا مخرجًا واختلفا صفة.")),
    ],
  },
  {
    id: "t08-muqattaat",
    title: l("The disjointed letters (al-huruf al-muqatta'at)", "Die einzelnen Buchstaben (al-Huruf al-Muqatta'at)", "الحروف المقطعة"),
    body: l(
      `## What they are
Twenty-nine surahs open with single letters read by their names, e.g. 2:1, 19:1 or 50:1. Fourteen different letters occur. Their meaning is known to Allah; the reciter's task is to pronounce them correctly.

## How long?
Each letter is read by its name, and the name decides the madd:
- **Alif**: its name has no madd letter in the middle: not lengthened.
- **Two counts** (natural madd): the letters of the group "hayy tahir": ح ي ط ه ر.
- **Six counts** (madd lazim harfi): letters whose name has three sounds with a madd in the middle: ن ق ص س ل ك م, grouped as "naqas 'asalukum".
- **'Ayn**: 4 or 6 counts (madd lin with a lazim sukun); 6 is preferred.

## Merging inside the letters
When the end of one name meets the start of the next, the rules of idgham and ikhfa apply, e.g. the mim of "lam" merges into "mim" (harfi muthaqqal). In Ta Sin Mim (26:1) the nun of "sin" merges into mim.

## Sakt
In 19:1 and 42:1-2 the nun of 'ayn/sin is hidden (ikhfa) before the next letter; no extra pause.`,
      `## Was sie sind
Neunundzwanzig Suren beginnen mit einzelnen Buchstaben, die mit ihrem Namen gelesen werden, etwa 2:1, 19:1 oder 50:1. Es kommen vierzehn verschiedene Buchstaben vor. Ihre Bedeutung kennt Allah; Aufgabe der Rezitation ist die richtige Aussprache.

## Wie lang?
Jeder Buchstabe wird mit seinem Namen gelesen, und der Name bestimmt den Madd:
- **Alif**: Sein Name hat keinen Madd-Buchstaben in der Mitte: nicht gedehnt.
- **Zwei Zählzeiten** (natürlicher Madd): die Buchstaben der Gruppe „hayy tahir“: ح ي ط ه ر.
- **Sechs Zählzeiten** (Madd lazim harfi): Buchstaben, deren Name aus drei Lauten mit Madd in der Mitte besteht: ن ق ص س ل ك م, zusammengefasst als „naqas 'asalukum“.
- **'Ayn**: 4 oder 6 Zählzeiten; 6 wird bevorzugt.

## Verschmelzung innerhalb der Buchstaben
Trifft das Ende eines Namens auf den Anfang des nächsten, gelten Idgham und Ikhfa, etwa das Mim von „lam“ in „mim“ (harfi muthaqqal). In Ta Sin Mim (26:1) geht das Nun von „sin“ in das Mim über.

## Ikhfa
In 19:1 und 42:1-2 wird das Nun von 'ayn bzw. sin vor dem nächsten Buchstaben verborgen (Ikhfa).`,
      `## ما هي
افتُتحت تسع وعشرون سورة بحروف تُقرأ بأسمائها، كما في (٢:١) و(١٩:١) و(٥٠:١)، وهي أربعة عشر حرفًا، والله أعلم بمرادها.

## مقادير المد
- **الألف**: لا مد فيه.
- **حركتان**: حروف «حي طهر».
- **ست حركات** (لازم حرفي): حروف «نقص عسلكم» عدا العين.
- **العين**: أربع أو ست، والست أفضل.

## الإدغام والإخفاء فيها
تُطبق أحكام النون والميم بين الأسماء، فميم «لام» تُدغم في «ميم» (حرفي مثقل)، ونون «سين» تُدغم في الميم في «طسم» (٢٦:١).

## الإخفاء
تُخفى نون «عين» في (١٩:١) ونون «سين» في (٤٢:٢) عند ما بعدها.`
    ),
    verses: ["2:1", "19:1", "50:1", "26:1"],
    quiz: [
      q(l("How many surahs open with disjointed letters?", "Wie viele Suren beginnen mit einzelnen Buchstaben?", "كم سورة افتُتحت بالحروف المقطعة؟"),
        [l("14", "14", "١٤"), l("19", "19", "١٩"), l("29", "29", "٢٩"), l("114", "114", "١١٤")], 2,
        l("29 surahs; 14 different letters are used.", "29 Suren; 14 verschiedene Buchstaben kommen vor.", "تسع وعشرون سورة بأربعة عشر حرفًا.")),
      q(l("How long is the mim in the opening letters?", "Wie lang ist das Mim in den Eröffnungsbuchstaben?", "كم يُمد الميم في الفواتح؟"),
        [l("6 counts", "6 Zählzeiten", "ست حركات"), l("2 counts", "2 Zählzeiten", "حركتان"), l("Not lengthened", "Nicht gedehnt", "لا يُمد"), l("4 or 5", "4 oder 5", "أربع أو خمس")], 0,
        l("Mim belongs to the group read with madd lazim harfi of 6 counts.", "Mim gehört zur Gruppe mit Madd lazim harfi von 6 Zählzeiten.", "الميم من حروف «نقص عسلكم».")),
      q(l("Which letter is read with 2 counts?", "Welcher Buchstabe wird mit 2 Zählzeiten gelesen?", "أي حرف يُمد حركتين؟"),
        [l("Qaf", "Qaf", "القاف"), l("Ha (ح)", "Ha (ح)", "الحاء"), l("Sad", "Sad", "الصاد"), l("Alif", "Alif", "الألف")], 1,
        l("Ha belongs to the group 'hayy tahir', read with 2 counts.", "Ha gehört zur Gruppe „hayy tahir“ mit 2 Zählzeiten.", "الحاء من «حي طهر».")),
    ],
  },
  {
    id: "t09-sakt",
    title: l("The four places of sakt in Hafs", "Die vier Stellen des Sakt bei Hafs", "مواضع السكت الأربعة عند حفص"),
    body: l(
      `## What is sakt?
Sakt is a short pause **without taking a breath**, about two counts, after which you continue. It is different from waqf (stop with breath) and qat' (ending the recitation).

## The four places (via the Shatibiyyah)
- **18:1-2**: after the word for "crookedness" at the end of verse 1, when connecting to verse 2. The tanwin is read as an alif, then the pause. It prevents the impression that the following word describes it.
- **36:52**: after the word for "our place of sleep", before the following demonstrative. It separates the words of the disbelievers from the answer.
- **75:27**: on the nun of "man", before the word "raq". Without sakt the nun would merge into the ra.
- **83:14**: on the lam of "bal", before "ran". Without sakt the lam would merge into the ra.

## In practice
- The sakt in 18:1 and 36:52 applies only when you connect; if you stop there, it is a normal stop.
- In 75:27 and 83:14 the sakt is obligatory in Hafs via the Shatibiyyah; the merging is not read in this path.
- The mushaf marks these places with a small "sin".`,
      `## Was ist Sakt?
Sakt ist eine kurze Pause **ohne Atemholen**, etwa zwei Zählzeiten, nach der Sie weiterlesen. Sie unterscheidet sich vom Waqf (Anhalten mit Atem) und vom Qat' (Beenden der Rezitation).

## Die vier Stellen (über die Shatibiyyah)
- **18:1-2**: nach dem Wort für „Krümmung“ am Ende von Vers 1, wenn Sie mit Vers 2 verbinden. Der Tanwin wird als Alif gelesen, dann folgt die Pause. Sie verhindert den Eindruck, das folgende Wort beschreibe es.
- **36:52**: nach dem Wort für „unsere Schlafstätte“, vor dem folgenden Demonstrativ. Sie trennt die Worte der Ungläubigen von der Antwort.
- **75:27**: auf dem Nun von „man“ vor dem Wort „raq“. Ohne Sakt würde das Nun im Ra aufgehen.
- **83:14**: auf dem Lam von „bal“ vor „ran“. Ohne Sakt würde das Lam im Ra aufgehen.

## In der Praxis
- In 18:1 und 36:52 gilt der Sakt nur beim Verbinden; halten Sie dort an, ist es ein gewöhnliches Anhalten.
- In 75:27 und 83:14 ist der Sakt bei Hafs über die Shatibiyyah verpflichtend; die Verschmelzung wird auf diesem Weg nicht gelesen.
- Der Mushaf kennzeichnet diese Stellen mit einem kleinen „Sin“.`,
      `## ما السكت
السكت قطع الصوت زمنًا يسيرًا دون تنفس بنية مواصلة القراءة، بمقدار حركتين، وهو غير الوقف والقطع.

## المواضع الأربعة من الشاطبية
- **الكهف (١٨:١-٢)**: على «عوجا» بالألف عند الوصل.
- **يس (٣٦:٥٢)**: على «مرقدنا» قبل اسم الإشارة.
- **القيامة (٧٥:٢٧)**: على نون «من» قبل «راق»، فلا تُدغم.
- **المطففين (٨٣:١٤)**: على لام «بل» قبل «ران»، فلا تُدغم.

## تنبيهات
- السكت في الكهف ويس عند الوصل، فإن وقف القارئ فلا سكت.
- السكت في القيامة والمطففين لازم لحفص من الشاطبية.
- تُعلَّم هذه المواضع في المصحف بسين صغيرة.`
    ),
    verses: ["18:1", "36:52", "75:27", "83:14"],
    quiz: [
      q(l("What distinguishes sakt from waqf?", "Was unterscheidet Sakt vom Waqf?", "بم يفترق السكت عن الوقف؟"),
        [l("Sakt is longer", "Sakt ist länger", "السكت أطول"), l("Sakt only occurs at verse ends", "Sakt gibt es nur am Versende", "السكت على رؤوس الآي فقط"), l("No breath is taken in sakt", "Beim Sakt wird nicht geatmet", "السكت بلا تنفس"), l("Sakt has a ghunnah", "Sakt hat eine Ghunnah", "في السكت غنة")], 2,
        l("Sakt is a brief pause without breath; waqf includes taking a breath.", "Sakt ist eine kurze Pause ohne Atem; beim Waqf atmet man.", "السكت دون تنفس، والوقف معه تنفس.")),
      q(l("In 83:14 the sakt prevents …", "In 83:14 verhindert der Sakt …", "السكت في (٨٣:١٤) يمنع …"),
        [l("merging the lam into the ra", "das Verschmelzen des Lam in das Ra", "إدغام اللام في الراء"), l("a qalqalah", "eine Qalqalah", "القلقلة"), l("madd munfasil", "Madd munfasil", "المد المنفصل"), l("tafkhim", "Tafkhim", "التفخيم")], 0,
        l("Without sakt, the lam of 'bal' would merge into the ra.", "Ohne Sakt würde das Lam von „bal“ in das Ra übergehen.", "لولا السكت لأُدغمت اللام في الراء.")),
      q(l("Which is NOT one of the four sakt places in Hafs?", "Welche ist KEINE der vier Sakt-Stellen bei Hafs?", "أيها ليس من مواضع السكت الأربعة؟"),
        [l("18:1-2", "18:1-2", "الكهف ١-٢"), l("36:52", "36:52", "يس ٥٢"), l("75:27", "75:27", "القيامة ٢٧"), l("1:7", "1:7", "الفاتحة ٧")], 3,
        l("The four places are 18:1-2, 36:52, 75:27 and 83:14.", "Die vier Stellen sind 18:1-2, 36:52, 75:27 und 83:14.", "المواضع: الكهف ويس والقيامة والمطففين.")),
    ],
  },
  {
    id: "t10-special-words",
    title: l("Special words in Hafs", "Besondere Wörter bei Hafs", "كلمات خاصة في رواية حفص"),
    body: l(
      `## Imalah: 11:41
In the word for "its course" the alif after the ra is tilted towards a ya sound, and the ra becomes light. It is the only imalah in Hafs.

## Ishmam: 12:11
In the phrase "you do not trust us" two nuns were merged into one. While pronouncing the merged nun you **round the lips** briefly as a sign of the lost damma, without any sound. An alternative (rawm) is also transmitted; ishmam is the common choice.

## Tas-hil: 41:44
In the word for "foreign" two hamzas meet. The second is **eased**, pronounced between a hamza and an alif, not dropped and not lengthened.

## Sad or sin
- **2:245**: the verb "and He extends" is written with a sad and read with **sin**.
- **7:69**: the word for "stature" is likewise read with **sin**.
- **52:37**: the word for "the controllers" may be read with sad or sin; sad is preferred in the Shatibiyyah path.
- In 88:22 the word is read with sad only.

## Why learn this?
These words are transmitted exactly this way. Learn them by heart with a teacher.`,
      `## Imalah: 11:41
Im Wort für „seine Fahrt“ wird das Alif nach dem Ra zu einem Ya-Klang geneigt, und das Ra wird leicht. Es ist die einzige Imalah bei Hafs.

## Ishmam: 12:11
In der Wendung „du vertraust uns nicht“ wurden zwei Nun zu einem verschmolzen. Beim Sprechen des verschmolzenen Nun **runden Sie kurz die Lippen** als Zeichen der verlorenen Damma, ohne Laut. Auch Rawm ist überliefert; Ishmam ist die übliche Wahl.

## Tas-hil: 41:44
Im Wort für „fremdsprachig“ treffen zwei Hamzas aufeinander. Die zweite wird **erleichtert**, zwischen Hamza und Alif gesprochen, weder weggelassen noch gedehnt.

## Sad oder Sin
- **2:245**: Das Verb „und Er weitet aus“ wird mit Sad geschrieben und mit **Sin** gelesen.
- **7:69**: Das Wort für „Statur“ wird ebenfalls mit **Sin** gelesen.
- **52:37**: Das Wort für „die Beherrscher“ kann mit Sad oder Sin gelesen werden; auf dem Weg der Shatibiyyah wird Sad bevorzugt.
- In 88:22 wird nur mit Sad gelesen.

## Warum lernen?
Diese Wörter sind genau so überliefert. Lernen Sie sie mit einer Lehrperson auswendig.`,
      `## الإمالة: هود ٤١
تُمال الألف بعد الراء نحو الياء وتُرقَّق الراء، وهي الإمالة الوحيدة لحفص.

## الإشمام: يوسف ١١
تُدغم النونان، ويُضم الشفتان عند النطق بالنون المدغمة إشارة إلى الضمة بلا صوت، ويجوز الروم، والإشمام هو المقدَّم.

## التسهيل: فصلت ٤٤
تُسهَّل الهمزة الثانية بين الهمزة والألف، فلا تُحذف ولا تُمد.

## الصاد والسين
- **البقرة ٢٤٥**: تُكتب بالصاد وتُقرأ بالسين.
- **الأعراف ٦٩**: تُقرأ بالسين.
- **الطور ٣٧**: بالوجهين، والصاد مقدّم من الشاطبية.
- **الغاشية ٢٢**: بالصاد فقط.

## الفائدة
هذه الكلمات تُؤخذ بالتلقي، فاحفظها مع معلم.`
    ),
    verses: ["11:41", "12:11", "41:44", "2:245", "7:69", "52:37"],
    quiz: [
      q(l("Where is the only imalah in Hafs?", "Wo steht die einzige Imalah bei Hafs?", "أين الإمالة الوحيدة لحفص؟"),
        [l("12:11", "12:11", "يوسف ١١"), l("11:41", "11:41", "هود ٤١"), l("41:44", "41:44", "فصلت ٤٤"), l("2:245", "2:245", "البقرة ٢٤٥")], 1,
        l("In 11:41, the word for 'its course'.", "In 11:41, im Wort für „seine Fahrt“.", "في هود ٤١.")),
      q(l("What is ishmam in 12:11?", "Was ist Ishmam in 12:11?", "ما الإشمام في يوسف ١١؟"),
        [l("Rounding the lips without sound", "Runden der Lippen ohne Laut", "ضم الشفتين بلا صوت"), l("Easing a hamza", "Erleichtern einer Hamza", "تسهيل همزة"), l("Tilting an alif", "Neigen eines Alif", "إمالة ألف"), l("A pause without breath", "Pause ohne Atem", "سكت")], 0,
        l("The lips are rounded briefly as a sign of the damma, without voicing it.", "Die Lippen werden kurz gerundet als Zeichen der Damma, ohne sie hörbar zu machen.", "إشارة بالشفتين إلى الضمة.")),
      q(l("How is the word in 2:245 written with sad read in Hafs?", "Wie wird das mit Sad geschriebene Wort in 2:245 bei Hafs gelesen?", "كيف تُقرأ الكلمة في البقرة ٢٤٥؟"),
        [l("With sad only", "Nur mit Sad", "بالصاد فقط"), l("With both", "Mit beidem", "بالوجهين"), l("With za", "Mit Za", "بالزاي"), l("With sin", "Mit Sin", "بالسين")], 3,
        l("It is read with sin.", "Es wird mit Sin gelesen.", "تُقرأ بالسين.")),
    ],
  },
  {
    id: "t11-waqf-signs",
    title: l("Stopping signs in the mushaf", "Pausenzeichen im Mushaf", "علامات الوقف في المصحف"),
    body: l(
      `## Why signs?
Stopping in the wrong place can change the meaning. The common Madinah mushaf marks recommendations above the line.

## The signs
- **Small mim (م)**: necessary stop (lazim). Connecting could give a wrong meaning.
- **Lam-alif (لا)**: do not stop here; if you must, go back and repeat.
- **Jim (ج)**: stopping and continuing are equally fine.
- **Sad-lam-ya (صلى)**: continuing is better, stopping is allowed.
- **Qaf-lam-ya (قلى)**: stopping is better, continuing is allowed.
- **Three dots (∴)** in two nearby places (mu'anaqah): stop at **one** of them, not both. An example is in 2:2.

## Verse ends
Stopping at the end of every verse is sunnah, even if the sentence continues.

## How to stop
- Final vowel becomes sukun.
- Tanwin with fatha becomes an alif.
- The round ta becomes a ha.
- The silah of the pronoun is dropped.

## How to restart
Go back to a place where the meaning is sound, not in the middle of a construction.`,
      `## Warum Zeichen?
Ein Anhalten an falscher Stelle kann die Bedeutung verändern. Der verbreitete Madinah-Mushaf setzt Empfehlungen über die Zeile.

## Die Zeichen
- **Kleines Mim (م)**: notwendiges Anhalten (lazim). Verbinden könnte eine falsche Bedeutung ergeben.
- **Lam-Alif (لا)**: hier nicht anhalten; wenn doch, gehen Sie zurück und wiederholen Sie.
- **Jim (ج)**: Anhalten und Weiterlesen sind gleich gut.
- **Sad-Lam-Ya (صلى)**: Weiterlesen ist besser, Anhalten erlaubt.
- **Qaf-Lam-Ya (قلى)**: Anhalten ist besser, Weiterlesen erlaubt.
- **Drei Punkte (∴)** an zwei nahen Stellen (Mu'anaqah): Halten Sie an **einer** davon an, nicht an beiden. Ein Beispiel steht in 2:2.

## Versenden
Am Ende jedes Verses anzuhalten ist Sunnah, auch wenn der Satz weitergeht.

## Wie anhalten
- Der Endvokal wird zu Sukun.
- Tanwin mit Fatha wird zu Alif.
- Das runde Ta wird zu Ha.
- Die Silah des Pronomens entfällt.

## Wie neu beginnen
Gehen Sie zu einer Stelle zurück, an der die Bedeutung stimmt, nicht mitten in eine Wortverbindung.`,
      `## فائدة العلامات
الوقف في غير موضعه قد يغيّر المعنى، ولذلك وُضعت علامات في مصحف المدينة.

## العلامات
- **م**: وقف لازم.
- **لا**: لا تقف، فإن وقفت فأعد.
- **ج**: جائز مستوي الطرفين.
- **صلى**: الوصل أولى.
- **قلى**: الوقف أولى.
- **∴** (المعانقة): يوقف على أحدهما لا كليهما، كما في (٢:٢).

## رؤوس الآي
الوقف على رؤوس الآي سنة.

## كيفية الوقف
- تسكين آخر الكلمة.
- إبدال تنوين النصب ألفًا.
- الوقف على التاء المربوطة هاءً.
- حذف صلة الهاء.

## الابتداء
يُبتدأ بما يستقيم معناه.`
    ),
    verses: ["2:2"],
    quiz: [
      q(l("What does a small mim above the line mean?", "Was bedeutet ein kleines Mim über der Zeile?", "ما معنى الميم الصغيرة؟"),
        [l("Continuing is better", "Weiterlesen ist besser", "الوصل أولى"), l("Do not stop", "Nicht anhalten", "لا تقف"), l("Necessary stop", "Notwendiges Anhalten", "وقف لازم"), l("Pause without breath", "Pause ohne Atem", "سكت")], 2,
        l("Mim marks a necessary stop, because connecting could distort the meaning.", "Mim kennzeichnet ein notwendiges Anhalten, weil Verbinden die Bedeutung verzerren könnte.", "الميم علامة الوقف اللازم.")),
      q(l("What does qaf-lam-ya (قلى) mean?", "Was bedeutet Qaf-Lam-Ya (قلى)?", "ما معنى «قلى»؟"),
        [l("Stopping is better", "Anhalten ist besser", "الوقف أولى"), l("Continuing is better", "Weiterlesen ist besser", "الوصل أولى"), l("Stopping is forbidden", "Anhalten verboten", "الوقف ممنوع"), l("Equal", "Gleichwertig", "مستوي الطرفين")], 0,
        l("Qaf-lam-ya: stopping is preferred, continuing allowed.", "Qaf-Lam-Ya: Anhalten bevorzugt, Weiterlesen erlaubt.", "قلى: الوقف أولى.")),
      q(l("When stopping, a round ta becomes …", "Beim Anhalten wird das runde Ta zu …", "عند الوقف تصير التاء المربوطة …"),
        [l("an alif", "einem Alif", "ألفًا"), l("a ta with qalqalah", "einem Ta mit Qalqalah", "تاءً مقلقلة"), l("a nun", "einem Nun", "نونًا"), l("a ha", "einem Ha", "هاءً")], 3,
        l("The round ta is read as a sakin ha at a stop.", "Das runde Ta wird beim Anhalten als Ha mit Sukun gelesen.", "يوقف عليها بالهاء.")),
    ],
  },
  {
    id: "t12-lahn",
    title: l("Common mistakes: lahn jali and lahn khafi", "Häufige Fehler: Lahn jali und Lahn khafi", "الأخطاء الشائعة: اللحن الجلي والخفي"),
    body: l(
      `## Clear mistakes (lahn jali)
They affect the words themselves and can change the meaning. Avoiding them is an obligation for everyone who recites.
- Replacing a letter: ح with ه, ع with hamza, ض with د or ظ, ق with ك, ص with س, ط with ت.
- Changing a vowel, e.g. damma instead of fatha in 1:7 after "an'am".
- Turning a short vowel into a long one or the reverse.
- Adding or dropping a letter.

## Hidden mistakes (lahn khafi)
They concern the finer rules; a trained ear hears them. Scholars consider them disliked, some even sinful for those who know better.
- Missing ghunnah, idgham or ikhfa.
- Madd too short or uneven.
- Making a light letter heavy or the reverse, especially the alif after light letters.
- Exaggerated qalqalah or a rolled ra.

## How to improve
- Recite to a qualified teacher regularly.
- Record yourself and compare with a reliable reciter.
- Work on one point per week.
- Start with Surat al-Fatiha (1:1-7), since it is read in every prayer.`,
      `## Deutliche Fehler (Lahn jali)
Sie betreffen die Wörter selbst und können die Bedeutung ändern. Sie zu vermeiden ist Pflicht für alle, die rezitieren.
- Einen Buchstaben ersetzen: ح durch ه, ع durch Hamza, ض durch د oder ظ, ق durch ك, ص durch س, ط durch ت.
- Einen Vokal ändern, etwa Damma statt Fatha in 1:7 nach „an'am“.
- Einen kurzen Vokal lang machen oder umgekehrt.
- Einen Buchstaben hinzufügen oder auslassen.

## Verborgene Fehler (Lahn khafi)
Sie betreffen die feineren Regeln; ein geschultes Ohr hört sie. Gelehrte halten sie für verpönt, manche für sündhaft bei Wissenden.
- Fehlende Ghunnah, Idgham oder Ikhfa.
- Zu kurzer oder ungleichmäßiger Madd.
- Leichte Buchstaben schwer machen oder umgekehrt, besonders das Alif nach leichten Buchstaben.
- Übertriebene Qalqalah oder ein gerolltes Ra.

## Wie Sie sich verbessern
- Rezitieren Sie regelmäßig vor einer qualifizierten Lehrperson.
- Nehmen Sie sich auf und vergleichen Sie mit einem verlässlichen Rezitator.
- Arbeiten Sie an einem Punkt pro Woche.
- Beginnen Sie mit Surat al-Fatiha (1:1-7), die in jedem Gebet gelesen wird.`,
      `## اللحن الجلي
خطأ يطرأ على الألفاظ فيُخل بالمبنى وقد يغيّر المعنى، وتركه واجب على كل قارئ.
- إبدال حرف بحرف: الحاء هاءً، والعين همزة، والضاد دالًا أو ظاءً، والقاف كافًا، والصاد سينًا، والطاء تاءً.
- تغيير حركة، كضم التاء في (١:٧).
- مد المقصور أو قصر الممدود.
- زيادة حرف أو نقصه.

## اللحن الخفي
خطأ يخل بالعرف دون المعنى، يعرفه أهل الفن.
- ترك الغنة أو الإدغام أو الإخفاء.
- عدم ضبط مقادير المدود.
- تفخيم المرقق أو العكس.
- المبالغة في القلقلة أو تكرير الراء.

## طريق الإتقان
- العرض على شيخ متقن.
- التسجيل والمقارنة بقارئ موثوق.
- التركيز على مسألة واحدة كل أسبوع.
- البدء بالفاتحة لأنها تُقرأ في كل صلاة.`
    ),
    verses: ["1:7"],
    quiz: [
      q(l("Which is a clear mistake (lahn jali)?", "Welcher ist ein deutlicher Fehler (Lahn jali)?", "أيها لحن جلي؟"),
        [l("A slightly short ghunnah", "Eine etwas kurze Ghunnah", "قصر الغنة قليلًا"), l("Reading ح as ه", "ح als ه lesen", "قراءة الحاء هاءً"), l("Uneven madd 'arid", "Ungleichmäßiger Madd 'arid", "تفاوت العارض"), l("Weak qalqalah", "Schwache Qalqalah", "ضعف القلقلة")], 1,
        l("Replacing one letter with another changes the word.", "Das Ersetzen eines Buchstabens verändert das Wort.", "إبدال حرف بحرف لحن جلي.")),
      q(l("Lahn khafi is …", "Lahn khafi ist …", "اللحن الخفي …"),
        [l("a mistake in the finer rules", "ein Fehler in den feineren Regeln", "خطأ في الأحكام الدقيقة"), l("always a change in meaning", "immer eine Bedeutungsänderung", "يغيّر المعنى دائمًا"), l("a forgotten verse", "ein vergessener Vers", "نسيان آية"), l("a wrong surah order", "falsche Surenfolge", "خطأ في ترتيب السور")], 0,
        l("Hidden mistakes affect the beauty and rules, not the word itself.", "Verborgene Fehler betreffen Schönheit und Regeln, nicht das Wort selbst.", "يخل بالأحكام لا بالمبنى.")),
      q(l("Where should you start working on your recitation?", "Womit sollten Sie Ihre Rezitation zuerst verbessern?", "بم يُبدأ في الإتقان؟"),
        [l("With the longest surah", "Mit der längsten Sure", "بأطول سورة"), l("With the muqatta'at", "Mit den Muqatta'at", "بالحروف المقطعة"), l("With rare words", "Mit seltenen Wörtern", "بالكلمات النادرة"), l("With al-Fatiha", "Mit al-Fatiha", "بالفاتحة")], 3,
        l("Al-Fatiha is read in every prayer; mistakes there matter most.", "Al-Fatiha wird in jedem Gebet gelesen; Fehler dort wiegen am schwersten.", "الفاتحة ركن في كل صلاة.")),
    ],
  },
];

export const TAJWEED_DEEP: Course = {
  id: "tajweed-deep",
  title: l("Tajweed in depth", "Tajweed vertieft", "التجويد المتقدم"),
  lead: l(
    "Qualities of the letters, ra and lam, every kind of madd, merging, the special words of Hafs and the stopping signs.",
    "Eigenschaften der Buchstaben, Ra und Lam, alle Arten des Madd, Verschmelzungen, die besonderen Wörter bei Hafs und die Pausenzeichen.",
    "صفات الحروف، والراء واللام، وأنواع المد، والإدغام، وكلمات حفص الخاصة، وعلامات الوقف."
  ),
  word: "التجويد",
  free: 1,
  note: l("Riwayah Hafs 'an 'Asim, path of the Shatibiyyah.", "Riwayah Hafs 'an 'Asim, Weg der Shatibiyyah.", "رواية حفص عن عاصم من طريق الشاطبية."),
  lessons,
};
