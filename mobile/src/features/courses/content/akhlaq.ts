// Islamic ethics (akhlaq). No Quran or hadith text here; references by key only.
import type { Course, CQuestion, L } from "../types";

const t = (en: string, de: string, ar: string): L => ({ en, de, ar });
const q = (question: L, options: [string, string, string][], answer: number, explain: L): CQuestion => ({
  q: question,
  options: options.map(([en, de, ar]) => ({ en, de, ar })),
  answer,
  explain,
});

export const AKHLAQ: Course = {
  id: "akhlaq",
  word: "الأخلاق",
  free: 1,
  title: t("Islamic ethics (akhlaq)", "Islamische Ethik (Achlaq)", "الأخلاق الإسلامية"),
  lead: t(
    "Character as the heart of faith: sincerity, truthfulness, patience, humility and care for others.",
    "Charakter als Herz des Glaubens: Aufrichtigkeit, Wahrhaftigkeit, Geduld, Demut und Fürsorge für andere.",
    "الخلق جوهر الإيمان: الإخلاص والصدق والصبر والتواضع والإحسان إلى الآخرين."
  ),
  lessons: [
    {
      id: "k01-good-character",
      title: t("Good character as the goal", "Guter Charakter als Ziel", "حسن الخلق غاية"),
      body: t(
        "In the Islamic tradition, akhlaq is not an add-on to faith but one of its central aims. The Quran describes the Prophet as being of a great moral character, and classical scholars understood his mission as the perfection of noble character.\n\n## Character and worship\nPrayer, fasting and charity are described in the sources as means that should shape behaviour. A prayer that does not keep a person from wrongdoing, or a fast that does not restrain the tongue, misses part of its purpose.\n\n## Character can be cultivated\nScholars such as al-Ghazali argued that character is not fixed: it can be trained through habit, self-examination and good company, much like a skill. The aim is balance – courage between recklessness and cowardice, generosity between waste and stinginess.\n\nThis course looks at core virtues and the vices that oppose them.",
        "In der islamischen Tradition ist Achlaq kein Zusatz zum Glauben, sondern eines seiner zentralen Ziele. Der Koran beschreibt den Propheten als von großartigem Charakter, und klassische Gelehrte verstanden seine Sendung als Vollendung edler Charakterzüge.\n\n## Charakter und Gottesdienst\nGebet, Fasten und Spenden werden in den Quellen als Mittel beschrieben, die das Verhalten prägen sollen. Ein Gebet, das nicht vom Unrecht abhält, oder ein Fasten, das die Zunge nicht zügelt, verfehlt einen Teil seines Zwecks.\n\n## Charakter lässt sich formen\nGelehrte wie al-Ghazali vertraten, dass Charakter nicht festgelegt ist: Er lässt sich durch Gewohnheit, Selbstprüfung und gute Gesellschaft schulen, ähnlich einer Fertigkeit. Ziel ist das Gleichgewicht – Mut zwischen Tollkühnheit und Feigheit, Großzügigkeit zwischen Verschwendung und Geiz.\n\nDieser Kurs betrachtet zentrale Tugenden und die Laster, die ihnen entgegenstehen.",
        "ليست الأخلاق في التراث الإسلامي إضافة إلى الإيمان، بل هي من أهم غاياته. وقد وصف القرآن النبي ﷺ بأنه على خلق عظيم، وفهم العلماء رسالته بأنها إتمام لمكارم الأخلاق.\n\n## الخلق والعبادة\nتصف النصوص الصلاة والصيام والصدقة بأنها وسائل لتهذيب السلوك؛ فالصلاة التي لا تنهى عن المنكر، والصيام الذي لا يحفظ اللسان، يفوتهما جزء من مقصودهما.\n\n## الخلق قابل للاكتساب\nقرر علماء كالغزالي أن الخلق ليس ثابتًا، بل يُكتسب بالتعود ومحاسبة النفس وصحبة الصالحين، كما تُكتسب المهارات. والغاية هي الاعتدال: فالشجاعة وسط بين التهور والجبن، والكرم وسط بين الإسراف والبخل.\n\nتتناول هذه الدورة الفضائل الأساسية والرذائل المقابلة لها."
      ),
      verses: ["68:4", "29:45"],
      tags: ["consensus"],
      quiz: [
        q(t("How does the Quran describe the Prophet's character in 68:4?", "Wie beschreibt der Koran in 68:4 den Charakter des Propheten?", "كيف وصف القرآن خلق النبي ﷺ في الآية 68:4؟"),
          [["As great", "Als großartig", "عظيم"], ["As strict", "Als streng", "صارم"], ["As average", "Als durchschnittlich", "عادي"], ["It does not", "Gar nicht", "لم يصفه"]], 0,
          t("The verse speaks of a great moral character.", "Der Vers spricht von großartigem Charakter.", "تذكر الآية الخلق العظيم.")),
        q(t("According to al-Ghazali, character is...", "Nach al-Ghazali ist Charakter...", "الخلق عند الغزالي..."),
          [["...fixed from birth", "...von Geburt an festgelegt", "...ثابت منذ الولادة"], ["...irrelevant", "...unwichtig", "...لا أهمية له"], ["...trainable through habit", "...durch Gewohnheit formbar", "...يُكتسب بالتعود"], ["...only for scholars", "...nur für Gelehrte", "...للعلماء فقط"]], 2,
          t("He compared it to acquiring a skill.", "Er verglich es mit dem Erwerb einer Fertigkeit.", "شبّهه باكتساب المهارة.")),
        q(t("Generosity is the balance between...", "Großzügigkeit ist das Gleichgewicht zwischen...", "الكرم وسط بين..."),
          [["...courage and fear", "...Mut und Angst", "...الشجاعة والخوف"], ["...waste and stinginess", "...Verschwendung und Geiz", "...الإسراف والبخل"], ["...speech and silence", "...Reden und Schweigen", "...الكلام والصمت"], ["...work and rest", "...Arbeit und Ruhe", "...العمل والراحة"]], 1,
          t("Virtue lies in the middle between two extremes.", "Die Tugend liegt in der Mitte zwischen zwei Extremen.", "الفضيلة وسط بين طرفين.")),
      ],
    },
    {
      id: "k02-ikhlas",
      title: t("Sincerity (ikhlas)", "Aufrichtigkeit (Ichlas)", "الإخلاص"),
      body: t(
        "Ikhlas means doing good for the sake of God alone, not for praise, status or reward from people. The Quran states that people were commanded to worship God sincerely, devoting religion to Him.\n\n## Intention shapes the deed\nThe famous hadith on intentions, placed by al-Bukhari at the very beginning of his collection, teaches that deeds are judged by their intentions. The same outward act can be worship or mere display, depending on the motive.\n\n## Its opposite: showing off\nScholars warn against riya', doing good to be seen. They also warn of the subtle opposite trap: abandoning good deeds out of fear of insincerity. The remedy is to keep acting while repeatedly correcting the intention.\n\n## Practical signs\n- Doing good in private as in public.\n- Not being shaken when good deeds go unnoticed.\n- Renewing the intention before important acts.",
        "Ichlas bedeutet, Gutes allein um Gottes willen zu tun, nicht für Lob, Ansehen oder Lohn von Menschen. Der Koran sagt, dass den Menschen geboten wurde, Gott aufrichtig zu dienen und Ihm die Religion rein zu widmen.\n\n## Die Absicht prägt die Tat\nDer berühmte Hadith über die Absichten, den al-Buchari an den Anfang seiner Sammlung stellte, lehrt, dass Taten nach ihren Absichten beurteilt werden. Dieselbe äußere Handlung kann Gottesdienst oder bloße Zurschaustellung sein, je nach Beweggrund.\n\n## Das Gegenteil: Augendienerei\nDie Gelehrten warnen vor Riya', dem Gutes-Tun, um gesehen zu werden. Sie warnen auch vor der feinen Gegenfalle: gute Taten aus Angst vor Unaufrichtigkeit aufzugeben. Das Heilmittel ist, weiter zu handeln und die Absicht immer wieder zu berichtigen.\n\n## Praktische Zeichen\n- Gutes im Verborgenen wie in der Öffentlichkeit tun.\n- Gelassen bleiben, wenn gute Taten unbemerkt bleiben.\n- Die Absicht vor wichtigen Handlungen erneuern.",
        "الإخلاص أن يعمل المرء الخير لوجه الله وحده، لا طلبًا لمدح الناس أو منزلة أو جزاء منهم. وقد ذكر القرآن أن الناس أُمروا أن يعبدوا الله مخلصين له الدين.\n\n## النية تصوغ العمل\nحديث النيات المشهور، الذي جعله البخاري فاتحة صحيحه، يعلّم أن الأعمال بالنيات؛ فالعمل الظاهر الواحد قد يكون عبادة أو رياءً بحسب الباعث عليه.\n\n## ضده: الرياء\nيحذر العلماء من الرياء، وهو عمل الخير ليراه الناس. ويحذرون كذلك من الفخ المقابل الخفي: ترك العمل الصالح خوفًا من الرياء. والعلاج الاستمرار في العمل مع تصحيح النية مرة بعد مرة.\n\n## علامات عملية\n- عمل الخير في السر كما في العلن.\n- عدم الاضطراب إذا لم يُلتفت إلى العمل الصالح.\n- تجديد النية قبل الأعمال المهمة."
      ),
      verses: ["98:5"],
      hadith: ["bukhari:1"],
      tags: ["consensus"],
      quiz: [
        q(t("What does ikhlas mean?", "Was bedeutet Ichlas?", "ما معنى الإخلاص؟"),
          [["Doing good for praise", "Gutes tun für Lob", "عمل الخير للمدح"], ["Never doing good publicly", "Nie öffentlich Gutes tun", "عدم عمل الخير علنًا أبدًا"], ["Doing good for God alone", "Gutes allein um Gottes willen tun", "عمل الخير لله وحده"], ["Praying a lot", "Viel beten", "كثرة الصلاة"]], 2,
          t("Sincerity is about the motive, not the setting.", "Aufrichtigkeit betrifft den Beweggrund, nicht den Ort.", "الإخلاص يتعلق بالباعث لا بالمكان.")),
        q(t("Which hadith opens Sahih al-Bukhari?", "Welcher Hadith eröffnet Sahih al-Buchari?", "ما الحديث الذي افتتح به البخاري صحيحه؟"),
          [["The hadith on intentions", "Der Hadith über die Absichten", "حديث النيات"], ["The hadith on neighbours", "Der Hadith über Nachbarn", "حديث الجار"], ["The hadith on patience", "Der Hadith über Geduld", "حديث الصبر"], ["The hadith on travel", "Der Hadith über Reisen", "حديث السفر"]], 0,
          t("It is listed as bukhari:1.", "Er ist als bukhari:1 verzeichnet.", "وهو برقم bukhari:1.")),
        q(t("What is the remedy when fearing insincerity?", "Was ist das Heilmittel bei Angst vor Unaufrichtigkeit?", "ما العلاج عند خوف الرياء؟"),
          [["Stop all good deeds", "Alle guten Taten aufgeben", "ترك كل عمل صالح"], ["Only act in public", "Nur öffentlich handeln", "العمل علنًا فقط"], ["Ignore intentions", "Absichten ignorieren", "إهمال النية"], ["Keep acting and correct the intention", "Weiter handeln und die Absicht berichtigen", "الاستمرار مع تصحيح النية"]], 3,
          t("Abandoning good deeds is itself a trap.", "Gute Taten aufzugeben ist selbst eine Falle.", "ترك العمل الصالح فخ في ذاته.")),
      ],
    },
    {
      id: "k03-truth-trust",
      title: t("Truthfulness and trust", "Wahrhaftigkeit und Vertrauen", "الصدق والأمانة"),
      body: t(
        "Before his prophethood, Muhammad was known in Mecca as al-Amin, the trustworthy. Truthfulness (sidq) and trustworthiness (amanah) belong to the foundations of Muslim character.\n\n## Truthfulness\nThe Quran calls on believers to be conscious of God and to be with the truthful. A well-known hadith teaches that truthfulness leads to righteousness and righteousness to Paradise, while lying leads to wrongdoing. Sidq covers words, but also intentions and deeds: being the same inwardly and outwardly.\n\n## Trust\nThe Quran commands returning trusts to their owners and judging justly. Amanah includes entrusted property, but also secrets, positions of responsibility, working time and the promises one makes. Breaking promises and betraying trust are described in the hadith literature as signs of hypocrisy.\n\n## In daily life\nHonest contracts, keeping appointments, confidentiality at work and fairness in trade are all practical forms of these virtues.",
        "Vor seiner Prophetschaft war Muhammad in Mekka als al-Amin bekannt, der Vertrauenswürdige. Wahrhaftigkeit (Sidq) und Vertrauenswürdigkeit (Amana) gehören zu den Grundlagen muslimischen Charakters.\n\n## Wahrhaftigkeit\nDer Koran ruft die Gläubigen auf, gottesbewusst zu sein und mit den Wahrhaftigen zu sein. Ein bekannter Hadith lehrt, dass Wahrhaftigkeit zur Rechtschaffenheit und diese zum Paradies führt, während Lüge zum Unrecht führt. Sidq umfasst Worte, aber auch Absichten und Taten: innen und außen derselbe zu sein.\n\n## Vertrauen\nDer Koran gebietet, anvertraute Güter ihren Eigentümern zurückzugeben und gerecht zu urteilen. Amana umfasst anvertrautes Eigentum, aber auch Geheimnisse, Verantwortungspositionen, Arbeitszeit und gegebene Versprechen. Gebrochene Versprechen und Vertrauensbruch werden in der Hadithliteratur als Zeichen der Heuchelei beschrieben.\n\n## Im Alltag\nEhrliche Verträge, eingehaltene Termine, Verschwiegenheit im Beruf und Fairness im Handel sind praktische Formen dieser Tugenden.",
        "عُرف محمد ﷺ في مكة قبل البعثة بالأمين. والصدق والأمانة من أسس الخلق الإسلامي.\n\n## الصدق\nيدعو القرآن المؤمنين إلى التقوى وإلى أن يكونوا مع الصادقين. وفي حديث مشهور أن الصدق يهدي إلى البر والبر يهدي إلى الجنة، وأن الكذب يهدي إلى الفجور. والصدق يشمل القول والنية والعمل، أي أن يستوي الباطن والظاهر.\n\n## الأمانة\nأمر القرآن بأداء الأمانات إلى أهلها والحكم بالعدل. والأمانة تشمل المال المؤتمن، والأسرار، والمناصب، ووقت العمل، والوعود. وقد وُصف إخلاف الوعد وخيانة الأمانة في الحديث بأنهما من علامات النفاق.\n\n## في الحياة اليومية\nالعقود الصادقة، والوفاء بالمواعيد، وكتمان أسرار العمل، والعدل في التجارة، كلها صور عملية لهاتين الفضيلتين."
      ),
      verses: ["9:119", "4:58"],
      hadith: ["bukhari:6094"],
      tags: ["consensus"],
      quiz: [
        q(t("What was the Prophet called in Mecca before prophethood?", "Wie wurde der Prophet vor der Prophetschaft in Mekka genannt?", "بم عُرف النبي ﷺ في مكة قبل البعثة؟"),
          [["Al-Faruq", "Al-Faruq", "الفاروق"], ["Al-Amin", "Al-Amin", "الأمين"], ["Al-Siddiq", "As-Siddiq", "الصديق"], ["Al-Hakim", "Al-Hakim", "الحكيم"]], 1,
          t("Al-Amin means the trustworthy.", "Al-Amin bedeutet der Vertrauenswürdige.", "الأمين صاحب الأمانة.")),
        q(t("What does amanah include?", "Was umfasst Amana?", "ماذا تشمل الأمانة؟"),
          [["Only money", "Nur Geld", "المال فقط"], ["Only secrets", "Nur Geheimnisse", "الأسرار فقط"], ["Property, secrets, duties and promises", "Eigentum, Geheimnisse, Pflichten und Versprechen", "المال والأسرار والمسؤوليات والوعود"], ["Nothing in daily life", "Nichts im Alltag", "لا شيء في الحياة اليومية"]], 2,
          t("Trust is a broad concept.", "Vertrauen ist ein weiter Begriff.", "الأمانة مفهوم واسع.")),
        q(t("According to the hadith, truthfulness leads to...", "Nach dem Hadith führt Wahrhaftigkeit zu...", "بحسب الحديث، الصدق يهدي إلى..."),
          [["...righteousness", "...Rechtschaffenheit", "...البر"], ["...wealth", "...Reichtum", "...الغنى"], ["...fame", "...Ruhm", "...الشهرة"], ["...conflict", "...Streit", "...الخصام"]], 0,
          t("And righteousness leads to Paradise.", "Und Rechtschaffenheit führt zum Paradies.", "والبر يهدي إلى الجنة.")),
      ],
    },
    {
      id: "k04-sabr-shukr",
      title: t("Patience and gratitude", "Geduld und Dankbarkeit", "الصبر والشكر"),
      body: t(
        "Patience (sabr) and gratitude (shukr) are often described as two halves of faith: patience in hardship, gratitude in ease.\n\n## Patience\nThe Quran calls believers to seek help through patience and prayer and states that God is with the patient. Scholars distinguish three kinds: patience in obeying God, patience in refraining from wrong, and patience with what befalls a person. Sabr is not passivity; it means steadfastness, self-control and continuing to act well under pressure.\n\n## Gratitude\nThe Quran promises increase to those who are grateful. Gratitude has three levels: recognising a blessing in the heart, acknowledging it with the tongue, and using it in ways that please the Giver.\n\n## Both together\nA hadith in Sahih Muslim describes the believer's affair as wondrous: in good times they are grateful, in hard times patient, and both are good for them.",
        "Geduld (Sabr) und Dankbarkeit (Schukr) werden oft als zwei Hälften des Glaubens beschrieben: Geduld in der Not, Dankbarkeit in guten Zeiten.\n\n## Geduld\nDer Koran ruft die Gläubigen auf, Hilfe in Geduld und Gebet zu suchen, und sagt, dass Gott mit den Geduldigen ist. Die Gelehrten unterscheiden drei Arten: Geduld im Gehorsam gegenüber Gott, Geduld im Unterlassen von Unrecht und Geduld mit dem, was einen trifft. Sabr ist keine Passivität; es bedeutet Standhaftigkeit, Selbstbeherrschung und weiterhin gut zu handeln unter Druck.\n\n## Dankbarkeit\nDer Koran verspricht den Dankbaren Mehrung. Dankbarkeit hat drei Ebenen: eine Gabe im Herzen erkennen, sie mit der Zunge anerkennen und sie so verwenden, wie es dem Geber gefällt.\n\n## Beides zusammen\nEin Hadith in Sahih Muslim beschreibt die Lage des Gläubigen als wunderbar: In guten Zeiten ist er dankbar, in schweren geduldig, und beides ist gut für ihn.",
        "يوصف الصبر والشكر كثيرًا بأنهما نصفا الإيمان: الصبر في الشدة، والشكر في الرخاء.\n\n## الصبر\nيدعو القرآن المؤمنين إلى الاستعانة بالصبر والصلاة، ويخبر أن الله مع الصابرين. ويقسم العلماء الصبر ثلاثة أقسام: صبر على طاعة الله، وصبر عن معصيته، وصبر على أقداره. والصبر ليس سلبية، بل ثبات وضبط للنفس واستمرار في الإحسان تحت الضغط.\n\n## الشكر\nوعد القرآن الشاكرين بالزيادة. وللشكر ثلاث مراتب: الاعتراف بالنعمة في القلب، والتحدث بها باللسان، واستعمالها فيما يرضي المنعم.\n\n## اجتماعهما\nفي حديث في صحيح مسلم أن أمر المؤمن عجب: إن أصابته سراء شكر، وإن أصابته ضراء صبر، وكلاهما خير له."
      ),
      verses: ["2:153", "14:7"],
      hadith: ["muslim:2999"],
      tags: ["consensus"],
      quiz: [
        q(t("Which is NOT one of the three kinds of patience?", "Was gehört NICHT zu den drei Arten der Geduld?", "أيّ مما يلي ليس من أقسام الصبر الثلاثة؟"),
          [["In obeying God", "Im Gehorsam gegenüber Gott", "على الطاعة"], ["In refraining from wrong", "Im Unterlassen von Unrecht", "عن المعصية"], ["With what befalls a person", "Mit dem, was einen trifft", "على الأقدار"], ["Patience in seeking revenge", "Geduld beim Rachesuchen", "الصبر لطلب الانتقام"]], 3,
          t("The three kinds are obedience, abstention and trials.", "Die drei Arten sind Gehorsam, Unterlassen und Prüfungen.", "الأقسام: الطاعة، وترك المعصية، والأقدار.")),
        q(t("What does 14:7 promise the grateful?", "Was verspricht 14:7 den Dankbaren?", "بم تعد الآية 14:7 الشاكرين؟"),
          [["Increase", "Mehrung", "الزيادة"], ["Nothing", "Nichts", "لا شيء"], ["Hardship", "Not", "الشدة"], ["Fame", "Ruhm", "الشهرة"]], 0,
          t("Gratitude brings increase.", "Dankbarkeit bringt Mehrung.", "الشكر سبب للزيادة.")),
        q(t("Sabr in Islamic ethics means...", "Sabr bedeutet in der islamischen Ethik...", "الصبر في الأخلاق الإسلامية..."),
          [["...doing nothing", "...nichts tun", "...ترك العمل"], ["...steadfastness and self-control", "...Standhaftigkeit und Selbstbeherrschung", "...الثبات وضبط النفس"], ["...complaining quietly", "...leise klagen", "...الشكوى بصمت"], ["...avoiding people", "...Menschen meiden", "...اعتزال الناس"]], 1,
          t("Patience is active, not passive.", "Geduld ist aktiv, nicht passiv.", "الصبر إيجابي لا سلبي.")),
      ],
    },
    {
      id: "k05-humility",
      title: t("Humility and arrogance", "Demut und Hochmut", "التواضع والكبر"),
      body: t(
        "Arrogance (kibr) was, according to the Quranic narrative, the first sin: Iblis refused to prostrate to Adam because he considered himself better. Humility (tawadu') is its remedy.\n\n## What arrogance is\nA hadith in Sahih Muslim warns that whoever has an atom's weight of arrogance in the heart will not enter Paradise, and explains arrogance as rejecting the truth and looking down on people. Loving fine clothes or a good appearance is explicitly not arrogance.\n\n## Signs of humility\nThe Quran describes the servants of the Most Merciful as those who walk on the earth gently and answer the ignorant with peace. Luqman advises his son not to turn his cheek away from people in contempt nor walk proudly.\n\n## In practice\n- Accepting the truth, even from someone younger or of lower status.\n- Serving others without expecting recognition.\n- Remembering that every ability is a gift.",
        "Hochmut (Kibr) war nach der koranischen Erzählung die erste Sünde: Iblis weigerte sich, sich vor Adam niederzuwerfen, weil er sich für besser hielt. Demut (Tawadu') ist das Heilmittel dagegen.\n\n## Was Hochmut ist\nEin Hadith in Sahih Muslim warnt, dass niemand mit dem Gewicht eines Stäubchens an Hochmut im Herzen das Paradies betritt, und erklärt Hochmut als Zurückweisung der Wahrheit und Herabsehen auf Menschen. Schöne Kleidung oder ein gepflegtes Äußeres zu lieben, ist ausdrücklich kein Hochmut.\n\n## Zeichen der Demut\nDer Koran beschreibt die Diener des Allerbarmers als jene, die sanft auf der Erde gehen und den Unwissenden mit Frieden antworten. Luqman rät seinem Sohn, sich nicht verächtlich von den Menschen abzuwenden und nicht überheblich zu gehen.\n\n## In der Praxis\n- Die Wahrheit annehmen, auch von Jüngeren oder Rangniederen.\n- Anderen dienen, ohne Anerkennung zu erwarten.\n- Sich erinnern, dass jede Fähigkeit ein Geschenk ist.",
        "كان الكبر بحسب القصص القرآني أول معصية؛ إذ أبى إبليس السجود لآدم لأنه رأى نفسه خيرًا منه. والتواضع علاجه.\n\n## حقيقة الكبر\nفي حديث في صحيح مسلم تحذير من أن من كان في قلبه مثقال ذرة من كبر لا يدخل الجنة، وتفسير الكبر بأنه رد الحق واحتقار الناس، وأن حب الثوب الحسن والهيئة الجميلة ليس من الكبر.\n\n## علامات التواضع\nيصف القرآن عباد الرحمن بأنهم يمشون على الأرض هونًا ويقابلون الجاهلين بالسلام. ويوصي لقمان ابنه ألا يعرض بوجهه عن الناس احتقارًا ولا يمشي في الأرض مختالًا.\n\n## في التطبيق\n- قبول الحق ولو من أصغر سنًا أو أقل منزلة.\n- خدمة الآخرين دون انتظار ثناء.\n- تذكر أن كل قدرة نعمة من الله."
      ),
      verses: ["7:12", "25:63", "31:18"],
      hadith: ["muslim:91"],
      tags: ["consensus"],
      quiz: [
        q(t("Why did Iblis refuse to prostrate according to the Quran?", "Warum weigerte sich Iblis laut Koran, sich niederzuwerfen?", "لماذا أبى إبليس السجود بحسب القرآن؟"),
          [["He considered himself better", "Er hielt sich für besser", "رأى نفسه خيرًا"], ["He was asleep", "Er schlief", "كان نائمًا"], ["He did not hear", "Er hörte es nicht", "لم يسمع"], ["He was ill", "Er war krank", "كان مريضًا"]], 0,
          t("Arrogance was the root of his refusal.", "Hochmut war die Wurzel seiner Weigerung.", "الكبر أصل امتناعه.")),
        q(t("How does the hadith define arrogance?", "Wie definiert der Hadith Hochmut?", "كيف عرّف الحديث الكبر؟"),
          [["Loving fine clothes", "Schöne Kleidung lieben", "حب الثوب الحسن"], ["Being wealthy", "Reich sein", "الغنى"], ["Rejecting truth and looking down on people", "Wahrheit zurückweisen und auf Menschen herabsehen", "رد الحق واحتقار الناس"], ["Speaking loudly", "Laut sprechen", "رفع الصوت"]], 2,
          t("Fine clothes are explicitly excluded.", "Schöne Kleidung ist ausdrücklich ausgenommen.", "الثوب الحسن مستثنى صراحة.")),
        q(t("How do the servants of the Most Merciful walk (25:63)?", "Wie gehen die Diener des Allerbarmers (25:63)?", "كيف يمشي عباد الرحمن (25:63)؟"),
          [["Proudly", "Stolz", "مختالين"], ["Gently", "Sanft", "هونًا"], ["Quickly", "Schnell", "مسرعين"], ["Silently only at night", "Nur nachts schweigend", "صامتين ليلًا فقط"]], 1,
          t("Gentleness is a sign of humility.", "Sanftheit ist ein Zeichen der Demut.", "الهون علامة التواضع.")),
      ],
    },
    {
      id: "k06-tongue",
      title: t("The tongue: backbiting and lying", "Die Zunge: üble Nachrede und Lüge", "اللسان: الغيبة والكذب"),
      body: t(
        "Many hadiths stress that the tongue can raise or ruin a person. A well-known teaching is to speak good or remain silent.\n\n## Backbiting (ghibah)\nThe Quran forbids spying and backbiting, comparing backbiting to eating the flesh of one's dead brother – an image meant to evoke strong aversion. A hadith in Sahih Muslim defines ghibah as mentioning about your brother something he would dislike; if it is true, it is backbiting, and if it is false, it is slander (buhtan). Scholars name limited exceptions, such as seeking justice, asking for a legal opinion or warning someone about real harm.\n\n## Lying\nLying contradicts sidq. Scholars discuss narrow exceptions, such as reconciling people, but the general rule remains clear.\n\n## Other dangers\nMockery, insulting nicknames, spreading rumours and talebearing (namimah) are also condemned. A practical rule: before speaking, ask whether it is true, whether it is necessary and whether it is kind.",
        "Viele Hadithe betonen, dass die Zunge einen Menschen erheben oder zugrunde richten kann. Eine bekannte Lehre lautet, Gutes zu sprechen oder zu schweigen.\n\n## Üble Nachrede (Ghiba)\nDer Koran verbietet das Ausspionieren und die üble Nachrede und vergleicht sie mit dem Essen des Fleisches des toten Bruders – ein Bild, das starke Abscheu wecken soll. Ein Hadith in Sahih Muslim definiert Ghiba als etwas über den Bruder zu sagen, das er nicht mögen würde; ist es wahr, ist es üble Nachrede, ist es falsch, ist es Verleumdung (Buhtan). Die Gelehrten nennen eng begrenzte Ausnahmen, etwa um Recht zu suchen, ein Rechtsgutachten einzuholen oder vor echtem Schaden zu warnen.\n\n## Lüge\nDie Lüge widerspricht dem Sidq. Gelehrte besprechen enge Ausnahmen, etwa zur Versöhnung von Menschen, doch die Grundregel bleibt klar.\n\n## Weitere Gefahren\nSpott, beleidigende Beinamen, das Verbreiten von Gerüchten und Zuträgerei (Namima) werden ebenfalls verurteilt. Eine praktische Regel: Fragen Sie sich vor dem Sprechen, ob es wahr, notwendig und freundlich ist.",
        "تؤكد أحاديث كثيرة أن اللسان قد يرفع صاحبه أو يهلكه، ومن التوجيهات المشهورة: قل خيرًا أو اصمت.\n\n## الغيبة\nنهى القرآن عن التجسس والغيبة، وشبّه الغيبة بأكل لحم الأخ ميتًا، وهي صورة تبعث على النفور الشديد. وعرّف حديث في صحيح مسلم الغيبة بأنها ذكرك أخاك بما يكره؛ فإن كان فيه ما تقول فقد اغتبته، وإن لم يكن فقد بهته. ويذكر العلماء استثناءات محدودة، كالتظلم والاستفتاء والتحذير من ضرر حقيقي.\n\n## الكذب\nالكذب نقيض الصدق. ويناقش العلماء استثناءات ضيقة كالإصلاح بين الناس، لكن الأصل واضح.\n\n## آفات أخرى\nالسخرية، والتنابز بالألقاب، ونشر الشائعات، والنميمة، كلها مذمومة. وقاعدة عملية: قبل الكلام اسأل نفسك: هل هو صدق؟ وهل هو ضروري؟ وهل هو لطيف؟"
      ),
      verses: ["49:11", "49:12"],
      hadith: ["bukhari:6018", "muslim:2589"],
      tags: ["consensus"],
      quiz: [
        q(t("What is ghibah according to the hadith in Muslim?", "Was ist Ghiba nach dem Hadith bei Muslim?", "ما الغيبة بحسب حديث مسلم؟"),
          [["Mentioning what your brother would dislike", "Etwas über den Bruder sagen, das er nicht mögen würde", "ذكرك أخاك بما يكره"], ["Any conversation", "Jedes Gespräch", "أي حديث"], ["Praising someone", "Jemanden loben", "مدح أحد"], ["Speaking to oneself", "Mit sich selbst sprechen", "حديث النفس"]], 0,
          t("If false, it becomes slander (buhtan).", "Ist es falsch, wird es zu Verleumdung (Buhtan).", "وإن لم يكن فيه فهو بهتان.")),
        q(t("To what does 49:12 compare backbiting?", "Womit vergleicht 49:12 die üble Nachrede?", "بم شبّهت الآية 49:12 الغيبة؟"),
          [["A storm", "Einem Sturm", "بالعاصفة"], ["A fire", "Einem Feuer", "بالنار"], ["Eating a dead brother's flesh", "Dem Essen des Fleisches des toten Bruders", "بأكل لحم الأخ ميتًا"], ["A broken vessel", "Einem zerbrochenen Gefäß", "بالإناء المكسور"]], 2,
          t("The image is meant to evoke strong aversion.", "Das Bild soll starke Abscheu wecken.", "الصورة تبعث على النفور.")),
        q(t("Which is a recognised exception to the ban on ghibah?", "Was ist eine anerkannte Ausnahme vom Verbot der Ghiba?", "ما الاستثناء المعتبر من تحريم الغيبة؟"),
          [["Entertainment", "Unterhaltung", "التسلية"], ["Warning about real harm", "Warnung vor echtem Schaden", "التحذير من ضرر حقيقي"], ["Boredom", "Langeweile", "الملل"], ["Revenge", "Rache", "الانتقام"]], 1,
          t("Exceptions are narrow and purpose-bound.", "Ausnahmen sind eng und zweckgebunden.", "الاستثناءات ضيقة ومقيدة بالحاجة.")),
      ],
    },
    {
      id: "k07-family-neighbours",
      title: t("Family and neighbours", "Familie und Nachbarn", "الأسرة والجيران"),
      body: t(
        "## Parents\nThe Quran links kindness to parents directly to the worship of God and asks people not to show even the slightest impatience towards them in old age, but to speak to them gently and pray for mercy for them. Kindness to parents (birr al-walidayn) remains a duty even when they hold a different faith, as long as they do not command wrongdoing.\n\n## Spouses, children and relatives\nThe Quran describes spouses as finding tranquillity in each other, with affection and mercy between them. Maintaining family ties (silat al-rahim) is strongly emphasised, and cutting them is warned against. Children have rights to care, education and fair treatment.\n\n## Neighbours\nVerse 4:36 lists neighbours, near and distant, among those to be treated well. A hadith reports that Jibril kept urging the Prophet about the neighbour until he thought the neighbour would be made an heir. Another hadith connects faith in God and the Last Day with honouring the neighbour. Scholars apply this to every neighbour, Muslim or not.",
        "## Eltern\nDer Koran verbindet die Güte zu den Eltern unmittelbar mit dem Gottesdienst und fordert, ihnen im Alter nicht einmal die geringste Ungeduld zu zeigen, sondern freundlich mit ihnen zu sprechen und für sie um Barmherzigkeit zu bitten. Die Güte zu den Eltern (Birr al-Walidain) bleibt auch dann Pflicht, wenn sie einen anderen Glauben haben, solange sie nicht zu Unrecht auffordern.\n\n## Ehepartner, Kinder und Verwandte\nDer Koran beschreibt, dass Ehepartner beieinander Ruhe finden und zwischen ihnen Zuneigung und Barmherzigkeit ist. Die Pflege der Verwandtschaftsbande (Silat ar-Rahim) wird stark betont, und vor ihrem Abbruch wird gewarnt. Kinder haben Rechte auf Fürsorge, Bildung und gerechte Behandlung.\n\n## Nachbarn\nVers 4:36 nennt Nachbarn, nahe und ferne, unter denen, die gut zu behandeln sind. Ein Hadith berichtet, dass Dschibril den Propheten so lange wegen des Nachbarn ermahnte, bis er dachte, der Nachbar werde zum Erben gemacht. Ein anderer Hadith verbindet den Glauben an Gott und den Jüngsten Tag mit der Ehrung des Nachbarn. Die Gelehrten beziehen dies auf jeden Nachbarn, ob muslimisch oder nicht.",
        "## الوالدان\nيقرن القرآن الإحسان إلى الوالدين بعبادة الله، وينهى عن إظهار أدنى تضجر منهما في الكبر، ويأمر بالقول الكريم لهما والدعاء لهما بالرحمة. ويبقى بر الوالدين واجبًا ولو كانا على غير الإسلام، ما لم يأمرا بمعصية.\n\n## الزوجان والأولاد والأقارب\nيصف القرآن الزوجين بأن كلًا منهما سكن للآخر، وأن بينهما مودة ورحمة. ويؤكد على صلة الرحم ويحذر من قطعها. وللأولاد حق في الرعاية والتعليم والعدل بينهم.\n\n## الجيران\nتذكر الآية 4:36 الجار القريب والجار البعيد فيمن يُحسن إليهم. وفي حديث أن جبريل ما زال يوصي النبي ﷺ بالجار حتى ظن أنه سيورّثه. وفي حديث آخر ربط الإيمان بالله واليوم الآخر بإكرام الجار. ويطبق العلماء ذلك على كل جار، مسلمًا كان أو غير مسلم."
      ),
      verses: ["17:23", "17:24", "30:21", "4:36"],
      hadith: ["bukhari:6014", "bukhari:6018"],
      tags: ["consensus"],
      quiz: [
        q(t("With what does the Quran link kindness to parents?", "Womit verbindet der Koran die Güte zu den Eltern?", "بم يقرن القرآن الإحسان إلى الوالدين؟"),
          [["With trade", "Mit Handel", "بالتجارة"], ["With travel", "Mit Reisen", "بالسفر"], ["With fasting only", "Nur mit Fasten", "بالصيام فقط"], ["With the worship of God", "Mit dem Gottesdienst", "بعبادة الله"]], 3,
          t("See 17:23.", "Siehe 17:23.", "انظر الآية 17:23.")),
        q(t("What does 30:21 place between spouses?", "Was ist laut 30:21 zwischen Ehepartnern?", "ماذا جعل الله بين الزوجين في الآية 30:21؟"),
          [["Competition", "Wettbewerb", "المنافسة"], ["Affection and mercy", "Zuneigung und Barmherzigkeit", "المودة والرحمة"], ["Fear", "Furcht", "الخوف"], ["Silence", "Schweigen", "الصمت"]], 1,
          t("Spouses find tranquillity in each other.", "Ehepartner finden Ruhe beieinander.", "كل منهما سكن للآخر.")),
        q(t("To which neighbours does the teaching apply?", "Für welche Nachbarn gilt die Lehre?", "على أي جار ينطبق هذا التوجيه؟"),
          [["Every neighbour, Muslim or not", "Jeden Nachbarn, ob muslimisch oder nicht", "كل جار مسلمًا كان أو غيره"], ["Only relatives", "Nur Verwandte", "الأقارب فقط"], ["Only Muslims", "Nur Muslime", "المسلمين فقط"], ["Only wealthy ones", "Nur Wohlhabende", "الأغنياء فقط"]], 0,
          t("Verse 4:36 names near and distant neighbours.", "Vers 4:36 nennt nahe und ferne Nachbarn.", "تذكر الآية 4:36 الجار القريب والبعيد.")),
      ],
    },
    {
      id: "k08-justice-mercy",
      title: t("Justice, mercy and care for creation", "Gerechtigkeit, Barmherzigkeit und Fürsorge für die Schöpfung", "العدل والرحمة والإحسان إلى الخلق"),
      body: t(
        "## Justice\nThe Quran states that God commands justice, excellence and giving to relatives, and forbids indecency and oppression. Believers are asked to stand firm for justice even against themselves or their relatives, and not to let hatred of a people lead them to injustice. Justice ('adl) is therefore owed to everyone, including opponents.\n\n## Mercy\nThe Prophet is described in the Quran as sent as a mercy to the worlds. Mercy (rahmah) goes beyond justice: forgiving, overlooking faults and treating the weak gently. Many hadiths connect receiving God's mercy with showing mercy to those on earth.\n\n## Care for creation\nThe human being is described as a steward (khalifah) on earth. Hadiths mention reward for giving water to a thirsty animal and blame for cruelty to animals. Classical jurists discussed the rights of animals, avoiding waste of water even when performing wudu, and not damaging trees. Today many scholars apply these principles to environmental protection.\n\nAkhlaq thus reaches from the heart to the whole of creation.",
        "## Gerechtigkeit\nDer Koran sagt, dass Gott Gerechtigkeit, gutes Handeln und das Geben an Verwandte gebietet und Schändliches und Unterdrückung verbietet. Die Gläubigen sollen für Gerechtigkeit einstehen, auch gegen sich selbst oder ihre Verwandten, und sich nicht durch Hass auf andere zur Ungerechtigkeit verleiten lassen. Gerechtigkeit ('Adl) steht daher jedem zu, auch Gegnern.\n\n## Barmherzigkeit\nDer Prophet wird im Koran als Barmherzigkeit für die Welten beschrieben. Barmherzigkeit (Rahma) geht über Gerechtigkeit hinaus: vergeben, über Fehler hinwegsehen und Schwache sanft behandeln. Viele Hadithe verbinden das Erlangen göttlicher Barmherzigkeit damit, sich derer auf der Erde zu erbarmen.\n\n## Fürsorge für die Schöpfung\nDer Mensch wird als Statthalter (Chalifa) auf der Erde beschrieben. Hadithe erwähnen Lohn für das Tränken eines durstigen Tieres und Tadel für Grausamkeit gegenüber Tieren. Klassische Juristen besprachen die Rechte von Tieren, das Vermeiden von Wasserverschwendung selbst bei der Waschung und den Schutz von Bäumen. Heute wenden viele Gelehrte diese Grundsätze auf den Umweltschutz an.\n\nAchlaq reicht so vom Herzen bis zur ganzen Schöpfung.",
        "## العدل\nيخبر القرآن أن الله يأمر بالعدل والإحسان وإيتاء ذي القربى، وينهى عن الفحشاء والمنكر والبغي. ويُطلب من المؤمنين القيام بالقسط ولو على أنفسهم أو أقربيهم، وألا يحملهم بغض قوم على ترك العدل. فالعدل حق لكل أحد حتى للخصوم.\n\n## الرحمة\nوصف القرآن النبي ﷺ بأنه أُرسل رحمة للعالمين. والرحمة فوق العدل: عفو وتجاوز عن الزلات ورفق بالضعفاء. وتربط أحاديث كثيرة نيل رحمة الله برحمة من في الأرض.\n\n## الإحسان إلى الخلق\nالإنسان مستخلف في الأرض. وفي الأحاديث أجر لمن سقى حيوانًا عطشان، وذم للقسوة على الحيوان. وتناول الفقهاء حقوق الحيوان، والنهي عن الإسراف في الماء ولو في الوضوء، وعدم إفساد الشجر. ويطبق كثير من العلماء اليوم هذه المبادئ على حماية البيئة.\n\nوهكذا تمتد الأخلاق من القلب إلى الخلق كله."
      ),
      verses: ["16:90", "4:135", "5:8", "21:107", "2:30"],
      tags: ["consensus"],
      quiz: [
        q(t("According to 5:8, what should hatred of a people not lead to?", "Wozu soll laut 5:8 Hass auf andere nicht verleiten?", "إلى ماذا لا ينبغي أن يقود بغض قوم بحسب الآية 5:8؟"),
          [["Prayer", "Gebet", "الصلاة"], ["Travel", "Reisen", "السفر"], ["Injustice", "Ungerechtigkeit", "ترك العدل"], ["Silence", "Schweigen", "الصمت"]], 2,
          t("Justice is owed even to opponents.", "Gerechtigkeit steht auch Gegnern zu.", "العدل حق حتى للخصوم.")),
        q(t("How is the Prophet described in 21:107?", "Wie wird der Prophet in 21:107 beschrieben?", "كيف وُصف النبي ﷺ في الآية 21:107؟"),
          [["As a judge of tribes", "Als Richter der Stämme", "قاضيًا للقبائل"], ["As a mercy to the worlds", "Als Barmherzigkeit für die Welten", "رحمة للعالمين"], ["As a king", "Als König", "ملكًا"], ["As a merchant", "Als Händler", "تاجرًا"]], 1,
          t("Mercy is central to his mission.", "Barmherzigkeit ist zentral für seine Sendung.", "الرحمة محور رسالته.")),
        q(t("What did classical jurists say about water in wudu?", "Was sagten klassische Juristen über Wasser bei der Waschung?", "ماذا قال الفقهاء عن الماء في الوضوء؟"),
          [["Avoid wasting it", "Verschwendung vermeiden", "اجتناب الإسراف فيه"], ["Use as much as possible", "So viel wie möglich verwenden", "الإكثار منه"], ["It does not matter", "Es spielt keine Rolle", "لا أهمية لذلك"], ["Only use rainwater", "Nur Regenwasser verwenden", "ماء المطر فقط"]], 0,
          t("Moderation applies even in worship.", "Maß gilt selbst im Gottesdienst.", "الاعتدال مطلوب حتى في العبادة.")),
      ],
    },
  ],
};
