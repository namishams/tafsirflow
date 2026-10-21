import type { L } from "./maqasid/types";
import type { SourceRef } from "./sources";

// The principles of Shams Method 2.0 and the method handbook. Each principle names its roots: the classical
// pedagogy of Qurʾān transmission and the learning-science findings it agrees with. Drafts until scholarly review.
export type Principle = { id: string; ar: string; title: L; body: L; src: SourceRef[] };

export const PRINCIPLES: Principle[] = [
  {
    id: "niyya", ar: "الإخلاص والأدب",
    title: { de: "Aufrichtigkeit und Adab", en: "Sincerity and adab", ar: "الإخلاص والأدب" },
    body: {
      de: "Der Qurʾān wird um Allahs willen gelernt; Reinheit, Ruhe und Achtung vor dem Muṣḥaf gehören zum Lernen selbst. al-Nawawī widmet diesem Adab der Qurʾān-Träger ein ganzes Werk.",
      en: "The Qurʾān is learned for the sake of Allah; purity, calm and respect for the muṣḥaf are part of the learning itself. al-Nawawī devotes a whole work to this adab of the bearers of the Qurʾān.",
      ar: "يُتعلَّم القرآن ابتغاء وجه الله، والطهارة والسكينة وتعظيم المصحف من صميم التعلّم. وقد أفرد النووي لآداب حملة القرآن كتابًا كاملًا.",
    },
    src: ["nawawi"],
  },
  {
    id: "talaqqi", ar: "التلقي والعرض",
    title: { de: "Talaqqī und ʿArḍ", en: "Talaqqī and ʿarḍ", ar: "التلقي والعرض" },
    body: {
      de: "Die Rezitation wird gehört, bevor sie gesprochen wird, und dann einer kundigen Person vorgetragen. So ist der Qurʾān mit Sanad überliefert; die App übt dieses Hören und Vortragen, ersetzt aber nicht die Lehrkraft.",
      en: "The recitation is heard before it is spoken, then presented to someone qualified. This is how the Qurʾān has been transmitted with a sanad; the app trains this listening and presenting but does not replace the teacher.",
      ar: "تُسمع القراءة قبل أن تُنطق، ثم تُعرض على متقن. هكذا نُقل القرآن بالسند؛ والتطبيق يدرّب على السماع والعرض ولا يغني عن الشيخ.",
    },
    src: ["jazari", "nawawi"],
  },
  {
    id: "wird", ar: "السبق والسبقي والمنزل",
    title: { de: "Sabaq, Sabqī, Manzil", en: "Sabaq, sabqī, manzil", ar: "السبق والسبقي والمنزل" },
    body: {
      de: "Jeder Tag hat drei Teile: Neues, das kürzlich Gelernte und das früher Gelernte in festem Zyklus. Die Ḥalaqāt kennen diese Ordnung seit Generationen; sie verhindert, dass Neues das Alte verdrängt.",
      en: "Every day has three parts: something new, what was learned recently, and everything learned earlier in a fixed cycle. The ḥalaqāt have kept this order for generations; it stops the new from pushing out the old.",
      ar: "لكل يوم ثلاثة أجزاء: جديد، ومراجعة القريب، ومراجعة البعيد في دورة ثابتة. وهذا ترتيب الحلقات عبر الأجيال؛ يمنع الجديد من أن يُذهب القديم.",
    },
    src: ["halaqa"],
  },
  {
    id: "spacing", ar: "التكرار المتباعد",
    title: { de: "Verteilte Wiederholung", en: "Spaced repetition", ar: "التكرار المتباعد" },
    body: {
      de: "Was in wachsenden Abständen wiederholt wird, bleibt länger. Der Planer (FSRS) schätzt für jeden Vers, wann er zu verblassen droht, und legt die Wiederholung genau dorthin.",
      en: "What is repeated at growing intervals lasts longer. The scheduler (FSRS) estimates for every verse when it is about to fade and places the review right there.",
      ar: "ما يُكرَّر على فترات متباعدة متزايدة يبقى أطول. ويقدّر المجدول (FSRS) لكل آية متى توشك أن تُنسى فيضع المراجعة عندها.",
    },
    src: ["fsrs"],
  },
  {
    id: "retrieval", ar: "التسميع من الحفظ",
    title: { de: "Abrufen statt Wiederlesen", en: "Retrieval, not re-reading", ar: "التسميع لا إعادة القراءة" },
    body: {
      de: "Aus dem Gedächtnis zu rezitieren festigt stärker als erneutes Lesen – die Lernforschung nennt das den Testeffekt, die Ḥalaqa nennt es Tasmīʿ. Deshalb werden die Hilfen mit jedem Grad weniger.",
      en: "Reciting from memory strengthens more than reading again – learning science calls it the testing effect, the ḥalaqa calls it tasmīʿ. That is why the prompts fade with every grade.",
      ar: "التسميع من الحفظ أرسخ من إعادة القراءة – تسميه علوم التعلّم أثر الاختبار، وتسميه الحلقة التسميع. ولذلك يقلّ العون مع كل درجة.",
    },
    src: ["retrieval", "halaqa"],
  },
  {
    id: "interleave", ar: "التمييز بين المتشابهات",
    title: { de: "Ähnliches unterscheiden", en: "Telling similar verses apart", ar: "التمييز بين المتشابهات" },
    body: {
      de: "Die Gelehrten des Mutashābih haben ähnliche Verse gesammelt, damit man sie unterscheidet. Gemischtes Üben (Interleaving) zwingt genau zu dieser Unterscheidung.",
      en: "The scholars of mutashābih collected similar verses so that they would be told apart. Mixed practice (interleaving) forces exactly this discrimination.",
      ar: "جمع علماء المتشابه الآيات المتقاربة ليُميَّز بينها، والتدريب المختلط يُلزم بهذا التمييز نفسه.",
    },
    src: ["kirmani", "sakhawi", "interleave"],
  },
  {
    id: "tadabbur", ar: "التدبر قبل الحفظ",
    title: { de: "Verstehen trägt das Gedächtnis", en: "Understanding carries memory", ar: "الفهم يحمل الحفظ" },
    body: {
      de: "Wer weiß, was ein Abschnitt lehrt und wie er aufgebaut ist, kann ihn leichter behalten und richtig ordnen. Vor jedem Sabaq steht deshalb kurz, was der Abschnitt lehrt.",
      en: "Knowing what a section teaches and how it is built makes it easier to keep and to place correctly. So every sabaq starts with a short note on what the section teaches.",
      ar: "من عرف ما يعلّمه المقطع وكيف بُني سهل عليه حفظه وترتيبه. لذلك يسبق كل سبق بيانٌ موجز لما يعلّمه المقطع.",
    },
    src: ["biqai", "ibnAshur", "saadi"],
  },
  {
    id: "darajat", ar: "التدرّج",
    title: { de: "Stufenweiser Anspruch", en: "Gradual rigour", ar: "التدرّج" },
    body: {
      de: "Wie in der Madrasa steigen die Anforderungen mit dem Können: größerer Wird, weniger Hilfen, strengere Prüfungen. Ein erreichter Grad bleibt – Fehler zeigen, wo zu festigen ist, sie bestrafen nicht.",
      en: "As in the madrasa, the demands rise with ability: a larger wird, fewer prompts, stricter tests. A grade once reached is kept – mistakes show where to consolidate; they do not punish.",
      ar: "كما في المدرسة تزداد المتطلبات مع القدرة: ورد أكبر، وعون أقل، واختبارات أدق. والدرجة التي تُبلغ تبقى – والخطأ يدلّ على موضع التثبيت ولا يعاقب.",
    },
    src: ["halaqa"],
  },
];

export type Chapter = { id: string; title: L; body: L; src: SourceRef[] };
export const HANDBOOK: Chapter[] = [
  {
    id: "day", title: { de: "Ein Tag mit der Methode", en: "A day with the method", ar: "يوم مع المنهج" },
    body: {
      de: "Beginnen Sie mit dem Sabaq, solange der Kopf frisch ist: erst hören, dann Wort für Wort aufbauen, dann aus dem Gedächtnis rezitieren. Danach das Sabqī, zuletzt der Manzil – gern in der Nacht- oder Morgenrezitation. Bewerten Sie jeden Abschnitt ehrlich; die Methode passt den nächsten Tag daran an.",
      en: "Start with the sabaq while the mind is fresh: listen first, build it up word by word, then recite from memory. Then the sabqī, and the manzil last – ideally in the night or morning prayer. Rate every portion honestly; the method adjusts the next day to it.",
      ar: "ابدأ بالسبق والذهن صافٍ: استمع أولًا، ثم ابنه كلمة كلمة، ثم سمّعه من حفظك. ثم السبقي، ثم المنزل – ويحسن في قيام الليل أو صلاة الفجر. قيّم كل مقطع بصدق، فالمنهج يضبط اليوم التالي على تقييمك.",
    },
    src: ["halaqa", "retrieval"],
  },
  {
    id: "quality", title: { de: "Qualität lesen", en: "Reading the quality", ar: "قراءة الجودة" },
    body: {
      de: "Die Qualität zeigt, wie sicher Ihr Hifz heute sitzt, nicht wie viel Sie wissen. Eine Seite in Gold ist gemeistert (Itqān); helle Felder brauchen Wiederholung. Tippen Sie auf eine Seite, um ihre schwächsten Verse direkt zu üben.",
      en: "Quality shows how securely your hifz holds today, not how much you know. A page in gold is mastered (itqān); light cells need review. Tap a page to practise its weakest verses directly.",
      ar: "الجودة تبيّن رسوخ حفظك اليوم لا مقداره. الصفحة الذهبية متقنة، والخلايا الفاتحة تحتاج مراجعة. اضغط على صفحة لتراجع أضعف آياتها مباشرة.",
    },
    src: ["app", "fsrs"],
  },
  {
    id: "tests", title: { de: "ʿArḍ und Prüfungen", en: "ʿArḍ and tests", ar: "العرض والاختبارات" },
    body: {
      de: "Die Überraschungs-ʿArḍ fragt wie eine Lehrkraft: Ein Vers wird genannt, Sie fahren fort. Die wöchentliche ʿArḍ und die monatliche Juzʾ-Wiederholung sichern, dass der Hifz trägt, bevor Neues dazukommt. Ist eine Prüfung länger überfällig, wartet der Sabaq – die Wiederholung läuft weiter.",
      en: "The surprise ʿarḍ asks like a teacher: a verse is named, you continue. The weekly ʿarḍ and the monthly juzʾ review make sure the hifz holds before more is added. When a test is overdue, the sabaq waits – review goes on.",
      ar: "العرض المفاجئ يسأل كالشيخ: تُذكر آية فتُكمل. والعرض الأسبوعي ومراجعة الجزء الشهرية تضمنان ثبات الحفظ قبل الزيادة. وإذا تأخر اختبار انتظر السبق، والمراجعة مستمرة.",
    },
    src: ["halaqa", "jazari"],
  },
  {
    id: "teacher", title: { de: "Mit einer Lehrkraft lernen", en: "Learning with a teacher", ar: "التعلّم مع شيخ" },
    body: {
      de: "Die App ersetzt keine Lehrkraft mit Sanad. Teilen Sie Ihren Code mit Ihrer Lehrkraft, tragen Sie ihr den Wochenabschnitt vor und lassen Sie Tajwīd und Aussprache von ihr korrigieren. Die Wortprüfung hört nur Wörter.",
      en: "The app does not replace a teacher with a sanad. Share your code with your teacher, present the week's portion to them and let them correct tajwīd and pronunciation. The word check only hears words.",
      ar: "التطبيق لا يغني عن شيخ ذي سند. شارك رمزك مع شيخك، واعرض عليه مقطع الأسبوع، ودعه يصحّح التجويد والنطق. فحص الكلمات يسمع الكلمات فقط.",
    },
    src: ["jazari", "nawawi"],
  },
  {
    id: "endless", title: { de: "Ohne Ende", en: "Without an end", ar: "بلا نهاية" },
    body: {
      de: "Nach jeder Sure, jedem Juzʾ und jedem Kurs schlägt die Methode den nächsten sinnvollen Schritt vor: die nächste Sure, Festigung, tieferes Verständnis, den nächsten Kurs. Auch wer den ganzen Qurʾān kann, behält den Manzil ein Leben lang.",
      en: "After every surah, juzʾ and course the method proposes the next meaningful step: the next surah, consolidation, deeper understanding, the next course. Even someone who knows the whole Qurʾān keeps the manzil for life.",
      ar: "بعد كل سورة وجزء ودورة يقترح المنهج الخطوة التالية: السورة التالية، أو التثبيت، أو الفهم الأعمق، أو الدورة التالية. وحتى من يحفظ القرآن كله يبقى له المنزل مدى الحياة.",
    },
    src: ["halaqa"],
  },
];
