import type { Course, CQuestion, L } from "../types";

const t = (en: string, de: string, ar: string): L => ({ en, de, ar });
const q = (question: L, options: L[], answer: number, explain: L): CQuestion => ({ q: question, options, answer, explain });

export const SEERAH: Course = {
  id: "seerah",
  title: t(
    "Seerah – the life of the Prophet Muhammad ﷺ",
    "Seerah – das Leben des Propheten Muhammad ﷺ",
    "السيرة النبوية – حياة النبي محمد ﷺ",
  ),
  lead: t(
    "Twenty chronological lessons from Arabia before Islam to the Prophet's passing and legacy.",
    "Zwanzig Lektionen in zeitlicher Reihenfolge, vom vorislamischen Arabien bis zum Tod des Propheten und seinem Vermächtnis.",
    "عشرون درسًا مرتبة زمنيًا من جزيرة العرب قبل الإسلام إلى وفاة النبي وإرثه.",
  ),
  word: "السيرة",
  free: 2,
  note: t(
    "Dates follow the most common view among historians of the Seerah; some are disputed.",
    "Die Daten folgen der verbreitetsten Ansicht der Seerah-Historiker; manche sind umstritten.",
    "التواريخ على القول الأشهر عند أهل السير، وبعضها مختلف فيه.",
  ),
  lessons: [
    {
      id: "s01-arabia",
      title: t("Arabia before Islam", "Arabien vor dem Islam", "جزيرة العرب قبل الإسلام"),
      body: t(
        `## A land of tribes
Before Islam, the Arabian Peninsula had no central state. Life was organised around tribes and clans, and loyalty to one's kin decided protection, honour and revenge. Poetry was the great art, and the Arabic language was admired for its eloquence.

## Makkah and the Kaaba
Makkah lay in a dry valley but was a centre of trade and pilgrimage. The Kaaba, built according to tradition by Ibrahim and Ismail, was surrounded by idols. The tribe of **Quraysh** guarded it and organised trading caravans to Yemen in winter and Syria in summer.

## Faith and society
- Most Arabs worshipped idols, while a few, called **hunafa**, held to the belief in one God.
- Jewish and Christian communities lived in places such as Yathrib, Khaybar and Najran.
- Women, orphans and the poor were often without rights; infant girls were sometimes buried alive.

Shortly before the Prophet's birth, the Abyssinian governor Abraha marched on Makkah with an elephant to destroy the Kaaba, and his army was destroyed. This year became known as the **Year of the Elephant**.`,
        `## Ein Land der Stämme
Vor dem Islam gab es auf der Arabischen Halbinsel keinen zentralen Staat. Das Leben war nach Stämmen und Sippen geordnet; die Treue zur eigenen Verwandtschaft entschied über Schutz, Ehre und Blutrache. Die Dichtung war die große Kunst, und die arabische Sprache wurde für ihre Ausdruckskraft bewundert.

## Mekka und die Kaaba
Mekka lag in einem trockenen Tal, war aber ein Zentrum für Handel und Pilgerfahrt. Die Kaaba, nach der Überlieferung von Ibrahim und Ismail errichtet, war von Götzenbildern umgeben. Der Stamm **Quraisch** hütete sie und organisierte Handelskarawanen, im Winter in den Jemen, im Sommer nach Syrien.

## Glaube und Gesellschaft
- Die meisten Araber verehrten Götzen; einige wenige, die **Hunafa**, hielten am Glauben an den einen Gott fest.
- Jüdische und christliche Gemeinschaften lebten etwa in Yathrib, Khaibar und Nadschran.
- Frauen, Waisen und Arme waren oft rechtlos; neugeborene Mädchen wurden mitunter lebendig begraben.

Kurz vor der Geburt des Propheten zog der abessinische Statthalter Abraha mit einem Elefanten gegen Mekka, um die Kaaba zu zerstören, und sein Heer ging zugrunde. Dieses Jahr wurde als **Jahr des Elefanten** bekannt.`,
        `## أرض القبائل
لم تكن في جزيرة العرب قبل الإسلام دولة مركزية، بل كانت الحياة قائمة على القبيلة والعشيرة، وكان الولاء للقرابة يحدد الحماية والشرف والثأر. وكان الشعر فن العرب الأكبر، وكانت لغتهم موضع إعجاب لفصاحتها.

## مكة والكعبة
كانت مكة في وادٍ غير ذي زرع، لكنها كانت مركزًا للتجارة والحج. وكانت الكعبة التي بناها إبراهيم وإسماعيل عليهما السلام محاطة بالأصنام. وتولت **قريش** سدانتها، ونظمت رحلتي الشتاء إلى اليمن والصيف إلى الشام.

## الدين والمجتمع
- عبد أكثر العرب الأصنام، وتمسك قليل منهم يُسمَّون **الحنفاء** بالتوحيد.
- عاشت جماعات يهودية ونصرانية في يثرب وخيبر ونجران وغيرها.
- كانت المرأة واليتيم والفقير في الغالب بلا حقوق، وكانت بعض البنات تُوأد.

وقبيل مولد النبي سار أبرهة الحبشي بجيش معه فيل لهدم الكعبة، فأهلك الله جيشه، فسُمِّي ذلك العام **عام الفيل**.`,
      ),
      verses: ["105:1", "106:1"],
      quiz: [
        q(t("Which tribe guarded the Kaaba?", "Welcher Stamm hütete die Kaaba?", "أي قبيلة تولت سدانة الكعبة؟"), [
          t("Aws", "Aus", "الأوس"), t("Quraysh", "Quraisch", "قريش"), t("Thaqif", "Thaqif", "ثقيف"), t("Khazraj", "Chazradsch", "الخزرج"),
        ], 1, t("Quraysh were the custodians of the Kaaba and leading merchants.", "Quraisch waren Hüter der Kaaba und führende Händler.", "كانت قريش سدنة الكعبة وكبار التجار.")),
        q(t("What were the hunafa?", "Wer waren die Hunafa?", "من هم الحنفاء؟"), [
          t("Poets of Makkah", "Dichter Mekkas", "شعراء مكة"), t("Christian monks", "Christliche Mönche", "رهبان نصارى"), t("Merchants from Yemen", "Händler aus dem Jemen", "تجار من اليمن"), t("People who held to belief in one God", "Menschen, die am Glauben an den einen Gott festhielten", "من تمسكوا بالتوحيد"),
        ], 3, t("They rejected idol worship before Islam.", "Sie lehnten schon vor dem Islam die Götzenverehrung ab.", "رفضوا عبادة الأصنام قبل الإسلام.")),
        q(t("Why is the 'Year of the Elephant' so named?", "Warum heißt es „Jahr des Elefanten“?", "لماذا سُمِّي عام الفيل بهذا الاسم؟"), [
          t("Abraha marched on Makkah with an elephant", "Abraha zog mit einem Elefanten gegen Mekka", "لأن أبرهة سار إلى مكة ومعه فيل"), t("An elephant was gifted to Quraysh", "Quraisch erhielten einen Elefanten als Geschenk", "لأن قريشًا أُهدي إليها فيل"), t("Caravans used elephants", "Karawanen nutzten Elefanten", "لأن القوافل استخدمت الفيلة"), t("It is a poetic name for drought", "Es ist ein dichterischer Name für Dürre", "اسم شعري للجفاف"),
        ], 0, t("Surah al-Fil refers to this event.", "Sure al-Fil bezieht sich auf dieses Ereignis.", "تشير سورة الفيل إلى هذا الحدث.")),
      ],
    },
    {
      id: "s02-birth",
      title: t("Birth and childhood", "Geburt und Kindheit", "المولد والطفولة"),
      body: t(
        `## An orphan in Makkah
Muhammad ﷺ was born in Makkah in the Year of the Elephant, around 570 CE, according to the most common view in the month of Rabi al-Awwal. He belonged to the clan of **Banu Hashim** of Quraysh. His father Abdullah died before his birth.

## In the desert
As was the custom of Makkan families, he was entrusted to a wet nurse from the desert, **Halimah** of Banu Sa'd. Among the Bedouin he grew up in clean air and learned pure Arabic. Halimah's family reported unusual blessing in their home while he was with them.

## Losses and care
- At about six, his mother **Aminah** died on the way back from Yathrib.
- His grandfather **Abd al-Muttalib** then cared for him, but died two years later.
- His uncle **Abu Talib** took him in and loved him like his own sons.

As a boy he tended sheep and travelled with Abu Talib on a caravan to Syria. The Quran later reminds him that God sheltered him when he was an orphan.`,
        `## Ein Waisenkind in Mekka
Muhammad ﷺ wurde im Jahr des Elefanten, um 570 n. Chr., in Mekka geboren, nach der verbreitetsten Ansicht im Monat Rabi al-Awwal. Er gehörte zur Sippe **Banu Haschim** der Quraisch. Sein Vater Abdullah starb noch vor seiner Geburt.

## In der Wüste
Wie es bei mekkanischen Familien üblich war, wurde er einer Amme aus der Wüste anvertraut, **Halima** vom Stamm Banu Sa'd. Bei den Beduinen wuchs er in reiner Luft auf und lernte ein klares Arabisch. Halimas Familie berichtete von besonderem Segen in ihrem Haus, solange er bei ihnen war.

## Verluste und Fürsorge
- Mit etwa sechs Jahren starb seine Mutter **Amina** auf dem Rückweg aus Yathrib.
- Danach sorgte sein Großvater **Abd al-Muttalib** für ihn, der jedoch zwei Jahre später starb.
- Sein Onkel **Abu Talib** nahm ihn auf und liebte ihn wie seine eigenen Söhne.

Als Junge hütete er Schafe und reiste mit Abu Talib in einer Karawane nach Syrien. Der Koran erinnert später daran, dass Gott ihm als Waise Zuflucht gab.`,
        `## يتيم في مكة
وُلد محمد ﷺ في مكة عام الفيل نحو سنة 570م، في شهر ربيع الأول على القول الأشهر. وكان من **بني هاشم** من قريش. وتوفي أبوه عبد الله قبل ولادته.

## في البادية
وعلى عادة أهل مكة دُفع إلى مرضعة من البادية هي **حليمة السعدية** من بني سعد. فنشأ بين الأعراب في هواء نقي وتعلّم العربية الفصيحة. وذكرت أسرة حليمة بركة ظاهرة في بيتها مدة إقامته عندها.

## فقد ورعاية
- توفيت أمه **آمنة** وهو في نحو السادسة في طريق العودة من يثرب.
- ثم كفله جده **عبد المطلب**، فتوفي بعد سنتين.
- ثم كفله عمه **أبو طالب** وأحبه كأبنائه.

ورعى الغنم في صباه، وسافر مع عمه في قافلة إلى الشام. ويذكّره القرآن بعدُ بأن الله آواه يتيمًا.`,
      ),
      verses: ["93:6"],
      quiz: [
        q(t("Who was the Prophet's wet nurse?", "Wer war die Amme des Propheten?", "من مرضعة النبي؟"), [
          t("Aminah", "Amina", "آمنة"), t("Khadijah", "Chadidscha", "خديجة"), t("Halimah", "Halima", "حليمة"), t("Fatimah", "Fatima", "فاطمة"),
        ], 2, t("Halimah of Banu Sa'd raised him in the desert.", "Halima von den Banu Sa'd zog ihn in der Wüste auf.", "حليمة السعدية أرضعته في البادية.")),
        q(t("Who cared for him after his grandfather died?", "Wer sorgte nach dem Tod des Großvaters für ihn?", "من كفله بعد وفاة جده؟"), [
          t("Abu Lahab", "Abu Lahab", "أبو لهب"), t("Abu Talib", "Abu Talib", "أبو طالب"), t("Hamzah", "Hamza", "حمزة"), t("Abbas", "Abbas", "العباس"),
        ], 1, t("His uncle Abu Talib took him in.", "Sein Onkel Abu Talib nahm ihn auf.", "كفله عمه أبو طالب.")),
        q(t("To which clan did he belong?", "Zu welcher Sippe gehörte er?", "إلى أي بطن ينتمي؟"), [
          t("Banu Umayyah", "Banu Umayya", "بنو أمية"), t("Banu Makhzum", "Banu Machzum", "بنو مخزوم"), t("Banu Sa'd", "Banu Sa'd", "بنو سعد"), t("Banu Hashim", "Banu Haschim", "بنو هاشم"),
        ], 3, t("Banu Hashim was a clan of Quraysh.", "Banu Haschim war eine Sippe der Quraisch.", "بنو هاشم بطن من قريش.")),
      ],
    },
    {
      id: "s03-youth",
      title: t("Youth and marriage to Khadijah", "Jugend und Ehe mit Chadidscha", "الشباب والزواج من خديجة"),
      body: t(
        `## The Trustworthy
As a young man, Muhammad ﷺ became known for honesty and reliability. The people of Makkah called him **al-Amin**, the trustworthy one. He took part in the **Hilf al-Fudul**, an alliance of Makkan clans to protect the wronged, and later spoke of it with approval.

## Khadijah
**Khadijah bint Khuwaylid** was a respected and wealthy merchant. She hired him to lead her caravan to Syria and was impressed by his integrity. She proposed marriage, and according to the most common view he was about 25 and she about 40. Their marriage lasted around 25 years, and while she lived he took no other wife. Their children included Zaynab, Ruqayyah, Umm Kulthum and Fatimah, and sons who died young.

## The Black Stone
When Quraysh rebuilt the Kaaba, the clans quarrelled over who would set the **Black Stone** in place. They agreed to let the next person to enter decide, and it was Muhammad. He placed the stone on a cloak, let a leader of each clan lift it together, and set it in place himself, preventing bloodshed.`,
        `## Der Vertrauenswürdige
Als junger Mann wurde Muhammad ﷺ für seine Ehrlichkeit und Zuverlässigkeit bekannt. Die Mekkaner nannten ihn **al-Amin**, den Vertrauenswürdigen. Er nahm am **Hilf al-Fudul** teil, einem Bündnis mekkanischer Sippen zum Schutz von Unterdrückten, und sprach später anerkennend davon.

## Chadidscha
**Chadidscha bint Chuwailid** war eine angesehene und wohlhabende Händlerin. Sie beauftragte ihn, ihre Karawane nach Syrien zu führen, und war von seiner Redlichkeit beeindruckt. Sie machte ihm einen Heiratsantrag; nach der verbreitetsten Ansicht war er etwa 25 und sie etwa 40 Jahre alt. Die Ehe dauerte rund 25 Jahre, und solange sie lebte, heiratete er keine andere Frau. Zu ihren Kindern gehörten Zainab, Ruqayya, Umm Kulthum und Fatima sowie Söhne, die früh starben.

## Der Schwarze Stein
Als Quraisch die Kaaba neu errichteten, stritten die Sippen darüber, wer den **Schwarzen Stein** einsetzen dürfe. Man einigte sich, den Nächsten, der hereinkäme, entscheiden zu lassen, und das war Muhammad. Er legte den Stein auf einen Mantel, ließ Vertreter aller Sippen ihn gemeinsam anheben und setzte ihn selbst ein. So verhinderte er Blutvergießen.`,
        `## الأمين
عُرف محمد ﷺ في شبابه بالصدق والأمانة حتى سماه أهل مكة **الأمين**. وشهد **حلف الفضول** الذي تعاهدت فيه بطون من قريش على نصرة المظلوم، وأثنى عليه بعد ذلك.

## خديجة
كانت **خديجة بنت خويلد** تاجرة ذات شرف ومال، فاستأجرته ليخرج في تجارتها إلى الشام، فأعجبها صدقه وأمانته. فعرضت عليه الزواج، وكان على القول الأشهر في نحو الخامسة والعشرين وهي في نحو الأربعين. ودام زواجهما نحو خمس وعشرين سنة، ولم يتزوج عليها في حياتها. ومن أولادهما زينب ورقية وأم كلثوم وفاطمة، وأبناء ماتوا صغارًا.

## الحجر الأسود
لما أعادت قريش بناء الكعبة اختلفت البطون فيمن يضع **الحجر الأسود** في مكانه، فاتفقوا على تحكيم أول داخل، فكان محمدًا. فوضع الحجر في ثوب وأمر كل قبيلة أن تأخذ بطرف منه، ثم وضعه بيده، فحقن الدماء.`,
      ),
      quiz: [
        q(t("What title did the Makkans give him?", "Welchen Beinamen gaben ihm die Mekkaner?", "بماذا لقبه أهل مكة؟"), [
          t("al-Amin", "al-Amin", "الأمين"), t("al-Faruq", "al-Faruq", "الفاروق"), t("as-Siddiq", "as-Siddiq", "الصديق"), t("Sayf Allah", "Saif Allah", "سيف الله"),
        ], 0, t("al-Amin means the trustworthy one.", "al-Amin bedeutet der Vertrauenswürdige.", "الأمين صاحب الأمانة.")),
        q(t("What was Hilf al-Fudul?", "Was war der Hilf al-Fudul?", "ما حلف الفضول؟"), [
          t("A trade treaty with Syria", "Ein Handelsvertrag mit Syrien", "معاهدة تجارية مع الشام"), t("A war between clans", "Ein Krieg zwischen Sippen", "حرب بين القبائل"), t("An alliance to protect the wronged", "Ein Bündnis zum Schutz Unterdrückter", "حلف لنصرة المظلوم"), t("A poetry festival", "Ein Dichterfest", "مهرجان للشعر"),
        ], 2, t("Clans pledged to stand with anyone treated unjustly.", "Sippen verpflichteten sich, jedem Unrecht Erleidenden beizustehen.", "تعاهدوا على نصرة كل مظلوم.")),
        q(t("How did he resolve the dispute over the Black Stone?", "Wie löste er den Streit um den Schwarzen Stein?", "كيف حل الخلاف على الحجر الأسود؟"), [
          t("By drawing lots", "Durch Losentscheid", "بالقرعة"), t("All clans lifted it on a cloak together", "Alle Sippen hoben ihn gemeinsam auf einem Mantel", "رفعته القبائل معًا في ثوب"), t("He gave it to his own clan", "Er überließ es seiner Sippe", "أعطاه لقبيلته"), t("He postponed the building", "Er verschob den Bau", "أجّل البناء"),
        ], 1, t("Everyone shared the honour, and conflict was avoided.", "Alle teilten die Ehre, und Streit wurde vermieden.", "اشترك الجميع في الشرف فزال النزاع.")),
      ],
    },
    {
      id: "s04-revelation",
      title: t("The first revelation", "Die erste Offenbarung", "بدء الوحي"),
      body: t(
        `## The cave of Hira
As he approached forty, Muhammad ﷺ increasingly sought solitude. He would retreat to the **cave of Hira** on a mountain near Makkah to reflect and worship for days at a time.

## The angel
According to the most common view, in the month of Ramadan around 610 CE, the angel **Jibril** came to him in the cave and commanded him to read. The first verses revealed were the opening of **Surah al-Alaq**, which speak of reading in the name of the Lord who created humankind and taught by the pen.

## Khadijah's support
He returned home shaken and asked to be wrapped up. Khadijah comforted him, reminding him of his kindness to relatives, the weak and guests, and assured him that God would not disgrace him. She took him to her cousin **Waraqah ibn Nawfal**, a learned Christian, who recognised the experience as the same message that had come to Musa and warned that his people would one day drive him out.

Khadijah became the first person to believe in him. After a pause, revelation resumed with the opening of Surah al-Muddaththir.`,
        `## Die Höhle Hira
Als er sich dem vierzigsten Lebensjahr näherte, suchte Muhammad ﷺ immer mehr die Einsamkeit. Er zog sich in die **Höhle Hira** auf einem Berg bei Mekka zurück, um tagelang nachzudenken und anzubeten.

## Der Engel
Nach der verbreitetsten Ansicht kam im Monat Ramadan um 610 n. Chr. der Engel **Dschibril** zu ihm in die Höhle und forderte ihn auf zu lesen. Die ersten offenbarten Verse waren der Anfang der **Sure al-Alaq**; sie sprechen vom Lesen im Namen des Herrn, der den Menschen erschaffen und durch das Schreibrohr gelehrt hat.

## Chadidschas Beistand
Erschüttert kehrte er heim und bat darum, zugedeckt zu werden. Chadidscha tröstete ihn, erinnerte an seine Güte gegenüber Verwandten, Schwachen und Gästen und versicherte ihm, dass Gott ihn nicht bloßstellen werde. Sie brachte ihn zu ihrem Vetter **Waraqa ibn Naufal**, einem gelehrten Christen, der darin dieselbe Botschaft erkannte, die zu Musa gekommen war, und ankündigte, sein Volk werde ihn eines Tages vertreiben.

Chadidscha glaubte als erster Mensch an ihn. Nach einer Pause setzte die Offenbarung mit dem Anfang der Sure al-Muddaththir wieder ein.`,
        `## غار حراء
لما قارب محمد ﷺ الأربعين حُبّب إليه الخلاء، فكان يخلو في **غار حراء** في جبل قرب مكة يتفكر ويتعبد الليالي ذوات العدد.

## الملَك
وفي رمضان نحو سنة 610م على القول الأشهر جاءه **جبريل** في الغار وأمره بالقراءة. وكانت أول ما نزل صدر **سورة العلق**، وفيه الأمر بالقراءة باسم الرب الذي خلق الإنسان وعلّم بالقلم.

## مؤازرة خديجة
فرجع إلى بيته يرجف فؤاده وطلب أن يُزمَّل. فطمأنته خديجة وذكّرته بصلته للرحم وإعانته للضعيف وإكرامه للضيف، وأكدت أن الله لن يخزيه. ثم انطلقت به إلى ابن عمها **ورقة بن نوفل**، وكان عالمًا نصرانيًا، فعرف أنه الناموس الذي نزل على موسى، وأخبره أن قومه سيخرجونه.

فكانت خديجة أول من آمن به. وبعد فترة عاد الوحي بصدر سورة المدثر.`,
      ),
      verses: ["96:1", "96:2", "96:3", "96:4", "96:5", "74:1", "74:2"],
      hadith: ["bukhari:3"],
      quiz: [
        q(t("Where did the first revelation come?", "Wo kam die erste Offenbarung?", "أين نزل أول الوحي؟"), [
          t("At the Kaaba", "An der Kaaba", "عند الكعبة"), t("In Madinah", "In Medina", "في المدينة"), t("On Mount Uhud", "Am Berg Uhud", "على جبل أحد"), t("In the cave of Hira", "In der Höhle Hira", "في غار حراء"),
        ], 3, t("He used to retreat to Hira near Makkah.", "Er zog sich in die Höhle Hira bei Mekka zurück.", "كان يتحنث في حراء قرب مكة.")),
        q(t("Which surah's opening was revealed first?", "Der Anfang welcher Sure wurde zuerst offenbart?", "صدر أي سورة نزل أولًا؟"), [
          t("al-Fatihah", "al-Fatiha", "الفاتحة"), t("al-Alaq", "al-Alaq", "العلق"), t("al-Ikhlas", "al-Ichlas", "الإخلاص"), t("al-Baqarah", "al-Baqara", "البقرة"),
        ], 1, t("The opening of Surah al-Alaq (96).", "Der Anfang der Sure al-Alaq (96).", "صدر سورة العلق (96).")),
        q(t("Who was the first to believe in him?", "Wer glaubte als Erste an ihn?", "من أول من آمن به؟"), [
          t("Khadijah", "Chadidscha", "خديجة"), t("Abu Bakr", "Abu Bakr", "أبو بكر"), t("Waraqah", "Waraqa", "ورقة"), t("Ali", "Ali", "علي"),
        ], 0, t("Khadijah believed in him first.", "Chadidscha glaubte als Erste an ihn.", "خديجة أول من آمن.")),
      ],
    },
    {
      id: "s05-secret-call",
      title: t("The secret call", "Der geheime Aufruf", "الدعوة السرية"),
      body: t(
        `## Three quiet years
According to the most common view, for about three years the Prophet ﷺ invited people to Islam privately, beginning with those closest to him.

## The first Muslims
- **Khadijah**, his wife.
- **Ali ibn Abi Talib**, his young cousin who lived in his house.
- **Zayd ibn Harithah**, his freed servant and adopted son.
- **Abu Bakr**, his close friend, who in turn brought others such as Uthman ibn Affan, Abd al-Rahman ibn Awf, Sa'd ibn Abi Waqqas, al-Zubayr and Talhah.

Many early believers were young people, the poor and slaves, such as **Bilal** and the family of **Yasir**, but there were also respected merchants.

## Dar al-Arqam
The believers met secretly in the house of **al-Arqam ibn Abi al-Arqam** near the hill of Safa. There they learned the revealed verses and prayed together away from hostile eyes.

The message centred on the oneness of God, the coming Day of Judgement, and care for the poor and orphans. These themes run through the early Makkan surahs.`,
        `## Drei stille Jahre
Nach der verbreitetsten Ansicht lud der Prophet ﷺ etwa drei Jahre lang im Verborgenen zum Islam ein, zuerst die Menschen, die ihm am nächsten standen.

## Die ersten Muslime
- **Chadidscha**, seine Frau.
- **Ali ibn Abi Talib**, sein junger Vetter, der in seinem Haus lebte.
- **Zaid ibn Haritha**, sein freigelassener Diener und Adoptivsohn.
- **Abu Bakr**, sein enger Freund, der wiederum andere gewann, etwa Uthman ibn Affan, Abd ar-Rahman ibn Auf, Sa'd ibn Abi Waqqas, az-Zubair und Talha.

Viele frühe Gläubige waren junge Menschen, Arme und Sklaven wie **Bilal** und die Familie des **Yasir**, aber auch angesehene Händler.

## Dar al-Arqam
Die Gläubigen trafen sich heimlich im Haus von **al-Arqam ibn Abi al-Arqam** nahe dem Hügel Safa. Dort lernten sie die offenbarten Verse und beteten gemeinsam, fern von feindlichen Blicken.

Im Mittelpunkt standen die Einheit Gottes, der kommende Tag des Gerichts und die Fürsorge für Arme und Waisen. Diese Themen prägen die frühen mekkanischen Suren.`,
        `## ثلاث سنين في الخفاء
دعا النبي ﷺ إلى الإسلام سرًا نحو ثلاث سنين على القول الأشهر، وبدأ بأقرب الناس إليه.

## السابقون الأولون
- **خديجة** زوجه.
- **علي بن أبي طالب** ابن عمه الصغير الذي كان يعيش في بيته.
- **زيد بن حارثة** مولاه ومتبنّاه.
- **أبو بكر** صاحبه، وقد أسلم على يديه عثمان بن عفان وعبد الرحمن بن عوف وسعد بن أبي وقاص والزبير وطلحة.

وكان كثير من السابقين شبابًا وفقراء وعبيدًا، مثل **بلال** وآل **ياسر**، وكان فيهم تجار ذوو مكانة.

## دار الأرقم
كان المؤمنون يجتمعون سرًا في دار **الأرقم بن أبي الأرقم** قرب الصفا، يتعلمون ما نزل من القرآن ويصلّون بعيدًا عن أعين الخصوم.

وكان محور الدعوة توحيد الله واليوم الآخر والإحسان إلى الفقير واليتيم، وهي موضوعات تتردد في السور المكية الأولى.`,
      ),
      quiz: [
        q(t("Where did the early Muslims meet secretly?", "Wo trafen sich die frühen Muslime heimlich?", "أين كان المسلمون الأوائل يجتمعون سرًا؟"), [
          t("In the cave of Hira", "In der Höhle Hira", "في غار حراء"), t("In Dar al-Arqam", "Im Dar al-Arqam", "في دار الأرقم"), t("In the Kaaba", "In der Kaaba", "في الكعبة"), t("In Ta'if", "In Ta'if", "في الطائف"),
        ], 1, t("The house of al-Arqam near Safa.", "Das Haus von al-Arqam bei Safa.", "دار الأرقم قرب الصفا.")),
        q(t("How long did the secret phase last, by the common view?", "Wie lange dauerte die geheime Phase nach verbreiteter Ansicht?", "كم دامت المرحلة السرية على المشهور؟"), [
          t("One month", "Einen Monat", "شهرًا"), t("Ten years", "Zehn Jahre", "عشر سنين"), t("About three years", "Etwa drei Jahre", "نحو ثلاث سنين"), t("One week", "Eine Woche", "أسبوعًا"),
        ], 2, t("About three years before the public call.", "Etwa drei Jahre vor dem öffentlichen Aufruf.", "نحو ثلاث سنين قبل الجهر.")),
        q(t("Who brought Uthman and others to Islam?", "Wer gewann Uthman und andere für den Islam?", "على يد من أسلم عثمان وغيره؟"), [
          t("Hamzah", "Hamza", "حمزة"), t("Umar", "Umar", "عمر"), t("Zayd", "Zaid", "زيد"), t("Abu Bakr", "Abu Bakr", "أبو بكر"),
        ], 3, t("Abu Bakr invited many of his friends.", "Abu Bakr lud viele seiner Freunde ein.", "دعا أبو بكر كثيرًا من أصحابه.")),
      ],
    },
    {
      id: "s06-public-call",
      title: t("Public call and persecution", "Öffentlicher Aufruf und Verfolgung", "الجهر بالدعوة والاضطهاد"),
      body: t(
        `## On the hill of Safa
When the command came to warn his closest kin and to proclaim the message openly, the Prophet ﷺ climbed the hill of **Safa** and called the clans of Quraysh. He asked whether they would believe him if he warned of an army behind the hill, and they said they had never known him to lie. He then warned them of a severe punishment. His uncle **Abu Lahab** rejected him harshly.

## Growing hostility
Quraysh feared for their gods, their status and the pilgrimage trade. They mocked him, offered him wealth and kingship to stop, and pressured Abu Talib, who refused to hand him over.

## The persecuted
- **Bilal** was laid on hot sand under a heavy stone, yet kept affirming that God is One.
- **Sumayyah**, the mother of Ammar, became the first martyr of Islam.
- The Muslims and Banu Hashim were later **boycotted** for about three years in a valley, suffering hunger until the boycott collapsed.

Strengthening moments also came: **Hamzah** and **Umar ibn al-Khattab** embraced Islam, and the Muslims began to pray more openly.`,
        `## Auf dem Hügel Safa
Als der Befehl kam, die nächsten Verwandten zu warnen und die Botschaft offen zu verkünden, stieg der Prophet ﷺ auf den Hügel **Safa** und rief die Sippen der Quraisch. Er fragte, ob sie ihm glauben würden, wenn er vor einem Heer hinter dem Hügel warnte, und sie sagten, sie hätten ihn nie lügen erlebt. Dann warnte er sie vor einer schweren Strafe. Sein Onkel **Abu Lahab** wies ihn schroff zurück.

## Wachsende Feindschaft
Quraisch fürchteten um ihre Götter, ihr Ansehen und den Pilgerhandel. Sie verspotteten ihn, boten ihm Reichtum und Herrschaft an, wenn er aufhöre, und setzten Abu Talib unter Druck, der ihn jedoch nicht auslieferte.

## Die Verfolgten
- **Bilal** wurde auf heißen Sand gelegt, mit einem schweren Stein beschwert, und bekannte dennoch weiter, dass Gott einer ist.
- **Sumayya**, die Mutter Ammars, wurde die erste Märtyrerin des Islam.
- Später wurden die Muslime und die Banu Haschim etwa drei Jahre lang in einem Tal **boykottiert** und litten Hunger, bis der Boykott zerbrach.

Es gab auch stärkende Momente: **Hamza** und **Umar ibn al-Chattab** nahmen den Islam an, und die Muslime beteten offener.`,
        `## على الصفا
لما نزل الأمر بإنذار العشيرة الأقربين والصدع بالدعوة صعد النبي ﷺ **الصفا** ونادى بطون قريش، وسألهم: أكانوا يصدقونه لو أخبرهم بخيل خلف الجبل؟ فقالوا: ما جربنا عليك كذبًا. فأنذرهم بين يدي عذاب شديد. فرده عمه **أبو لهب** ردًا قبيحًا.

## اشتداد العداوة
خشيت قريش على آلهتها ومكانتها وتجارة الموسم، فسخروا منه، وعرضوا عليه المال والملك ليكف، وضغطوا على أبي طالب فأبى أن يسلمه.

## المستضعفون
- عُذّب **بلال** على الرمل الحار تحت صخرة ثقيلة وهو يردد كلمة التوحيد.
- وكانت **سمية** أم عمار أول شهيدة في الإسلام.
- ثم **قوطع** المسلمون وبنو هاشم في الشعب نحو ثلاث سنين حتى جاعوا، إلى أن نُقضت الصحيفة.

وجاءت لحظات قوة: فأسلم **حمزة** و**عمر بن الخطاب**، وصار المسلمون يصلّون بجهر أكبر.`,
      ),
      verses: ["26:214", "15:94", "111:1"],
      quiz: [
        q(t("Who was the first martyr of Islam?", "Wer war die erste Märtyrerin des Islam?", "من أول شهيدة في الإسلام؟"), [
          t("Sumayyah", "Sumayya", "سمية"), t("Khadijah", "Chadidscha", "خديجة"), t("Aminah", "Amina", "آمنة"), t("Halimah", "Halima", "حليمة"),
        ], 0, t("Sumayyah, mother of Ammar ibn Yasir.", "Sumayya, die Mutter Ammar ibn Yasirs.", "سمية أم عمار بن ياسر.")),
        q(t("Which uncle opposed him openly at Safa?", "Welcher Onkel stellte sich am Safa offen gegen ihn?", "أي أعمامه عارضه علنًا عند الصفا؟"), [
          t("Abu Talib", "Abu Talib", "أبو طالب"), t("Hamzah", "Hamza", "حمزة"), t("Abu Lahab", "Abu Lahab", "أبو لهب"), t("Abbas", "Abbas", "العباس"),
        ], 2, t("Surah al-Masad names Abu Lahab.", "Sure al-Masad nennt Abu Lahab.", "سورة المسد تذكر أبا لهب.")),
        q(t("How long did the boycott last, roughly?", "Wie lange dauerte der Boykott ungefähr?", "كم دامت المقاطعة تقريبًا؟"), [
          t("Three days", "Drei Tage", "ثلاثة أيام"), t("About three years", "Etwa drei Jahre", "نحو ثلاث سنين"), t("Ten years", "Zehn Jahre", "عشر سنين"), t("Three months", "Drei Monate", "ثلاثة أشهر"),
        ], 1, t("About three years in the valley of Abu Talib.", "Etwa drei Jahre im Tal des Abu Talib.", "نحو ثلاث سنين في شعب أبي طالب.")),
      ],
    },
    {
      id: "s07-abyssinia",
      title: t("Migration to Abyssinia", "Auswanderung nach Abessinien", "الهجرة إلى الحبشة"),
      body: t(
        `## A just king
As persecution grew, the Prophet ﷺ advised a group of Muslims to seek refuge in **Abyssinia** (al-Habashah), whose Christian king, the **Najashi** (Negus), was known for justice. According to the most common view this was in the fifth year of prophethood.

## Two migrations
- A first small group, including **Uthman ibn Affan** and his wife **Ruqayyah**, the Prophet's daughter.
- A larger second group of over eighty men and women, led in speech by **Ja'far ibn Abi Talib**.

## Before the Najashi
Quraysh sent **Amr ibn al-As** with gifts to have the Muslims returned. The Najashi called the Muslims to speak. Ja'far described their former life of idol worship and injustice, and how a prophet had taught them truthfulness, keeping ties of kinship and worshipping God alone. He then recited part of **Surah Maryam**. The king was moved to tears and refused to hand them over.

The Muslims lived safely there for years; many returned only around the time of Khaybar. This was the first migration in Islam.`,
        `## Ein gerechter König
Als die Verfolgung zunahm, riet der Prophet ﷺ einer Gruppe von Muslimen, in **Abessinien** (al-Habascha) Zuflucht zu suchen, dessen christlicher König, der **Nadschaschi** (Negus), für seine Gerechtigkeit bekannt war. Nach der verbreitetsten Ansicht geschah dies im fünften Jahr der Prophetschaft.

## Zwei Auswanderungen
- Eine erste kleine Gruppe, darunter **Uthman ibn Affan** und seine Frau **Ruqayya**, die Tochter des Propheten.
- Eine größere zweite Gruppe von über achtzig Männern und Frauen; ihr Sprecher war **Dscha'far ibn Abi Talib**.

## Vor dem Nadschaschi
Quraisch schickten **Amr ibn al-As** mit Geschenken, um die Rückgabe der Muslime zu erreichen. Der Nadschaschi ließ die Muslime sprechen. Dscha'far schilderte ihr früheres Leben mit Götzendienst und Unrecht und wie ein Prophet sie Wahrhaftigkeit, Verwandtenpflege und die Anbetung des einen Gottes gelehrt habe. Dann trug er einen Teil der **Sure Maryam** vor. Der König weinte und lehnte die Auslieferung ab.

Die Muslime lebten dort jahrelang sicher; viele kehrten erst um die Zeit von Khaibar zurück. Es war die erste Auswanderung im Islam.`,
        `## ملك عادل
لما اشتد الأذى أشار النبي ﷺ على جماعة من المسلمين بالهجرة إلى **الحبشة**، وكان ملكها النصراني **النجاشي** معروفًا بالعدل. وكان ذلك في السنة الخامسة من البعثة على القول الأشهر.

## هجرتان
- الأولى جماعة قليلة، منهم **عثمان بن عفان** وزوجه **رقية** بنت النبي.
- والثانية أكثر من ثمانين رجلًا وامرأة، وكان المتكلم عنهم **جعفر بن أبي طالب**.

## بين يدي النجاشي
بعثت قريش **عمرو بن العاص** بالهدايا ليرد المسلمين. فدعاهم النجاشي، فوصف جعفر ما كانوا عليه من عبادة الأصنام والظلم، وكيف علّمهم نبي الصدق وصلة الرحم وعبادة الله وحده، ثم قرأ صدرًا من **سورة مريم**، فبكى الملك وأبى أن يسلمهم.

فأقام المسلمون آمنين سنين، ورجع كثير منهم زمن خيبر. وكانت هذه أول هجرة في الإسلام.`,
      ),
      verses: ["19:16"],
      quiz: [
        q(t("Who spoke for the Muslims before the Najashi?", "Wer sprach vor dem Nadschaschi für die Muslime?", "من تكلم عن المسلمين عند النجاشي؟"), [
          t("Uthman", "Uthman", "عثمان"), t("Ja'far ibn Abi Talib", "Dscha'far ibn Abi Talib", "جعفر بن أبي طالب"), t("Amr ibn al-As", "Amr ibn al-As", "عمرو بن العاص"), t("Bilal", "Bilal", "بلال"),
        ], 1, t("Ja'far explained Islam to the king.", "Dscha'far erklärte dem König den Islam.", "شرح جعفر الإسلام للملك.")),
        q(t("Which surah did Ja'far recite?", "Welche Sure trug Dscha'far vor?", "أي سورة قرأ جعفر؟"), [
          t("Yusuf", "Yusuf", "يوسف"), t("al-Kahf", "al-Kahf", "الكهف"), t("al-Fatihah", "al-Fatiha", "الفاتحة"), t("Maryam", "Maryam", "مريم"),
        ], 3, t("He recited from Surah Maryam (19).", "Er trug aus Sure Maryam (19) vor.", "قرأ من سورة مريم (19).")),
        q(t("Who did Quraysh send to bring them back?", "Wen schickten Quraisch, um sie zurückzuholen?", "من أرسلت قريش لردهم؟"), [
          t("Amr ibn al-As", "Amr ibn al-As", "عمرو بن العاص"), t("Abu Jahl", "Abu Dschahl", "أبو جهل"), t("Abu Sufyan", "Abu Sufyan", "أبو سفيان"), t("Khalid ibn al-Walid", "Chalid ibn al-Walid", "خالد بن الوليد"),
        ], 0, t("Amr ibn al-As, who later became Muslim.", "Amr ibn al-As, der später Muslim wurde.", "عمرو بن العاص، وقد أسلم بعدُ.")),
      ],
    },
    {
      id: "s08-sorrow-taif",
      title: t("The Year of Sorrow and Ta'if", "Das Jahr der Trauer und Ta'if", "عام الحزن والطائف"),
      body: t(
        `## Two great losses
Shortly after the boycott ended, according to the most common view in the tenth year of prophethood, the Prophet ﷺ lost his uncle **Abu Talib**, who had protected him for decades, and then his beloved wife **Khadijah**. This year became known as the **Year of Sorrow** ('Am al-Huzn).

## The journey to Ta'if
Without Abu Talib's protection, harassment in Makkah increased. The Prophet travelled with **Zayd ibn Harithah** to **Ta'if**, the town of the tribe of Thaqif, hoping they would listen. The leaders rejected him and set children and servants on him, who threw stones until his feet bled.

## Mercy instead of revenge
Resting in a garden, he turned to God in a humble prayer, asking only that God not be displeased with him. A Christian servant named **Addas** brought him grapes and spoke with him. According to the reports, the angel of the mountains offered to crush the people of Ta'if, but the Prophet declined, hoping their descendants would worship God. He re-entered Makkah under the protection of **al-Mut'im ibn Adi**.`,
        `## Zwei große Verluste
Kurz nach dem Ende des Boykotts, nach der verbreitetsten Ansicht im zehnten Jahr der Prophetschaft, verlor der Prophet ﷺ seinen Onkel **Abu Talib**, der ihn jahrzehntelang beschützt hatte, und danach seine geliebte Frau **Chadidscha**. Dieses Jahr wurde als **Jahr der Trauer** ('Am al-Huzn) bekannt.

## Die Reise nach Ta'if
Ohne den Schutz Abu Talibs nahmen die Anfeindungen in Mekka zu. Der Prophet reiste mit **Zaid ibn Haritha** nach **Ta'if**, der Stadt des Stammes Thaqif, in der Hoffnung, man werde ihm zuhören. Die Anführer wiesen ihn ab und hetzten Kinder und Diener auf ihn, die Steine warfen, bis seine Füße bluteten.

## Barmherzigkeit statt Rache
In einem Garten wandte er sich in einem demütigen Gebet an Gott und bat nur darum, dass Gott nicht unzufrieden mit ihm sei. Ein christlicher Diener namens **Addas** brachte ihm Trauben und sprach mit ihm. Den Berichten zufolge bot der Engel der Berge an, die Bewohner von Ta'if zu vernichten, doch der Prophet lehnte ab, in der Hoffnung, ihre Nachkommen würden Gott anbeten. Unter dem Schutz von **al-Mut'im ibn Adi** kehrte er nach Mekka zurück.`,
        `## مصيبتان
بعد انتهاء المقاطعة بقليل، في السنة العاشرة من البعثة على القول الأشهر، فقد النبي ﷺ عمه **أبا طالب** الذي حماه عقودًا، ثم زوجه الحبيبة **خديجة**، فسُمّي ذلك العام **عام الحزن**.

## الرحلة إلى الطائف
لما فقد حماية أبي طالب اشتد عليه أذى قريش، فخرج مع **زيد بن حارثة** إلى **الطائف** بلد ثقيف رجاء أن يستجيبوا. فردّه سادتها وأغروا به سفهاءهم وعبيدهم فرموه بالحجارة حتى دميت قدماه.

## رحمة لا انتقام
فجلس في بستان وتوجه إلى ربه بدعاء خاشع لا يطلب فيه إلا ألا يكون الله غاضبًا عليه. وجاءه غلام نصراني اسمه **عدّاس** بعنب وحادثه. وفي الروايات أن ملك الجبال عرض عليه أن يُطبق على أهل الطائف، فأبى راجيًا أن يخرج من أصلابهم من يعبد الله. ثم دخل مكة في جوار **المطعم بن عدي**.`,
      ),
      quiz: [
        q(t("Whom did the Prophet lose in the Year of Sorrow?", "Wen verlor der Prophet im Jahr der Trauer?", "من فقد النبي في عام الحزن؟"), [
          t("Hamzah and Abbas", "Hamza und Abbas", "حمزة والعباس"), t("Aminah and Abd al-Muttalib", "Amina und Abd al-Muttalib", "آمنة وعبد المطلب"), t("Abu Talib and Khadijah", "Abu Talib und Chadidscha", "أبا طالب وخديجة"), t("Zayd and Ja'far", "Zaid und Dscha'far", "زيدًا وجعفرًا"),
        ], 2, t("His protector and his wife died in the same year.", "Sein Beschützer und seine Frau starben im selben Jahr.", "مات حاميه وزوجه في عام واحد.")),
        q(t("Who accompanied him to Ta'if?", "Wer begleitete ihn nach Ta'if?", "من صحبه إلى الطائف؟"), [
          t("Zayd ibn Harithah", "Zaid ibn Haritha", "زيد بن حارثة"), t("Abu Bakr", "Abu Bakr", "أبو بكر"), t("Ali", "Ali", "علي"), t("Umar", "Umar", "عمر"),
        ], 0, t("Zayd shielded him from the stones.", "Zaid schützte ihn vor den Steinen.", "كان زيد يقيه الحجارة.")),
        q(t("How did he respond to the people of Ta'if?", "Wie reagierte er auf die Leute von Ta'if?", "كيف قابل أهل الطائف؟"), [
          t("He cursed them", "Er verfluchte sie", "دعا عليهم"), t("He hoped their descendants would believe", "Er hoffte, ihre Nachkommen würden glauben", "رجا أن يؤمن من ذريتهم"), t("He fought them", "Er bekämpfte sie", "قاتلهم"), t("He never mentioned them again", "Er erwähnte sie nie wieder", "لم يذكرهم أبدًا"),
        ], 1, t("He chose mercy over revenge.", "Er wählte Barmherzigkeit statt Rache.", "اختار الرحمة على الانتقام.")),
      ],
    },
    {
      id: "s09-isra-miraj",
      title: t("The Night Journey and Ascension", "Nachtreise und Himmelfahrt", "الإسراء والمعراج"),
      body: t(
        `## A comfort after hardship
After the Year of Sorrow, God honoured the Prophet ﷺ with a miraculous journey in one night. The date is disputed; many place it about a year before the Hijra.

## al-Isra
He was taken from the Sacred Mosque in Makkah to **al-Masjid al-Aqsa** in Jerusalem, riding **al-Buraq**. There he led the earlier prophets in prayer. The opening verse of **Surah al-Isra** refers to this journey.

## al-Mi'raj
From Jerusalem he ascended through the heavens with Jibril, meeting prophets such as Adam, Isa, Yahya, Yusuf, Idris, Harun, Musa and Ibrahim. He reached the **Sidrat al-Muntaha**, mentioned in **Surah an-Najm**.

## The gift of prayer
On this night the **five daily prayers** were made obligatory. Reports describe that fifty were first prescribed and, on Musa's advice, reduced to five, while keeping the reward of fifty.

## A test of faith
When he told Quraysh, many mocked him. **Abu Bakr** said that if the Prophet said it, it was true, and so he was called **as-Siddiq**.`,
        `## Trost nach der Not
Nach dem Jahr der Trauer ehrte Gott den Propheten ﷺ mit einer wundersamen Reise in einer einzigen Nacht. Das Datum ist umstritten; viele setzen sie etwa ein Jahr vor der Hidschra an.

## al-Isra
Er wurde von der Heiligen Moschee in Mekka zur **al-Aqsa-Moschee** in Jerusalem gebracht, reitend auf **al-Buraq**. Dort leitete er die früheren Propheten im Gebet. Der erste Vers der **Sure al-Isra** bezieht sich auf diese Reise.

## al-Mi'radsch
Von Jerusalem stieg er mit Dschibril durch die Himmel auf und begegnete Propheten wie Adam, Isa, Yahya, Yusuf, Idris, Harun, Musa und Ibrahim. Er erreichte den **Sidrat al-Muntaha**, der in **Sure an-Nadschm** erwähnt wird.

## Das Geschenk des Gebets
In dieser Nacht wurden die **fünf täglichen Gebete** zur Pflicht. Berichte schildern, dass zunächst fünfzig vorgeschrieben und auf Rat Musas auf fünf verringert wurden, mit dem Lohn von fünfzig.

## Eine Prüfung des Glaubens
Als er Quraisch davon erzählte, spotteten viele. **Abu Bakr** sagte, wenn der Prophet es sage, sei es wahr, und erhielt so den Beinamen **as-Siddiq**.`,
        `## سلوى بعد الشدة
بعد عام الحزن أكرم الله نبيه ﷺ برحلة معجزة في ليلة واحدة، وتاريخها مختلف فيه، وكثيرون يجعلونها قبل الهجرة بنحو سنة.

## الإسراء
أُسري به من المسجد الحرام إلى **المسجد الأقصى** في بيت المقدس على **البراق**، وهناك أمّ الأنبياء في الصلاة. وإلى هذه الرحلة تشير الآية الأولى من **سورة الإسراء**.

## المعراج
ثم عُرج به مع جبريل في السماوات، فلقي من الأنبياء آدم وعيسى ويحيى ويوسف وإدريس وهارون وموسى وإبراهيم، وبلغ **سدرة المنتهى** المذكورة في **سورة النجم**.

## هدية الصلاة
وفي تلك الليلة فُرضت **الصلوات الخمس**، وفي الروايات أنها فُرضت خمسين ثم خُففت بمشورة موسى إلى خمس بأجر خمسين.

## امتحان للإيمان
لما أخبر قريشًا سخر كثير منهم، فقال **أبو بكر**: إن كان قاله فقد صدق، فسُمّي **الصديق**.`,
      ),
      verses: ["17:1", "53:13", "53:14"],
      quiz: [
        q(t("Which obligation was given on this night?", "Welche Pflicht wurde in dieser Nacht gegeben?", "أي فريضة فُرضت في تلك الليلة؟"), [
          t("Fasting Ramadan", "Fasten im Ramadan", "صيام رمضان"), t("Zakah", "Zakat", "الزكاة"), t("The five daily prayers", "Die fünf täglichen Gebete", "الصلوات الخمس"), t("Hajj", "Hadsch", "الحج"),
        ], 2, t("The five prayers were prescribed during the Mi'raj.", "Die fünf Gebete wurden beim Mi'radsch vorgeschrieben.", "فُرضت الصلوات الخمس في المعراج.")),
        q(t("Why was Abu Bakr called as-Siddiq?", "Warum wurde Abu Bakr as-Siddiq genannt?", "لماذا سُمّي أبو بكر الصديق؟"), [
          t("He affirmed the Night Journey at once", "Er bestätigte die Nachtreise sofort", "صدّق بالإسراء فورًا"), t("He was the eldest", "Er war der Älteste", "كان أكبرهم سنًا"), t("He was a merchant", "Er war Händler", "كان تاجرًا"), t("He freed Bilal", "Er befreite Bilal", "أعتق بلالًا"),
        ], 0, t("as-Siddiq means the one who affirms the truth.", "as-Siddiq bedeutet der Wahrhaftige, der bestätigt.", "الصديق كثير التصديق.")),
        q(t("Which surah opens with the Night Journey?", "Welche Sure beginnt mit der Nachtreise?", "أي سورة تبدأ بذكر الإسراء؟"), [
          t("an-Najm", "an-Nadschm", "النجم"), t("al-Kahf", "al-Kahf", "الكهف"), t("Maryam", "Maryam", "مريم"), t("al-Isra", "al-Isra", "الإسراء"),
        ], 3, t("Surah al-Isra (17), verse 1.", "Sure al-Isra (17), Vers 1.", "سورة الإسراء (17) الآية 1.")),
      ],
    },
    {
      id: "s10-aqabah",
      title: t("The pledges of Aqabah", "Die Treueide von Aqaba", "بيعتا العقبة"),
      body: t(
        `## Hope from Yathrib
During the pilgrimage seasons the Prophet ﷺ presented Islam to visiting tribes. A small group from **Yathrib**, of the tribe of **Khazraj**, listened. Having heard from their Jewish neighbours of a coming prophet, they accepted Islam and promised to spread it at home.

## The first pledge
The following year, twelve men from the Aws and Khazraj met him at **al-Aqabah** near Mina. They pledged to worship God alone, not to steal, commit adultery or kill their children, and not to slander. The Prophet sent **Mus'ab ibn Umayr** with them to teach the Quran, and Islam spread quickly in Yathrib.

## The second pledge
A year later, according to the most common view, more than seventy men and two women came secretly at night. They pledged to protect the Prophet as they protected their own families if he came to them. Twelve leaders (**nuqaba**) were chosen.

This pledge opened the way for the Hijra. The tribes of Aws and Khazraj, long weakened by feuds, would become the **Ansar**, the helpers.`,
        `## Hoffnung aus Yathrib
In den Pilgerzeiten stellte der Prophet ﷺ den besuchenden Stämmen den Islam vor. Eine kleine Gruppe aus **Yathrib** vom Stamm **Chazradsch** hörte zu. Da sie von ihren jüdischen Nachbarn von einem kommenden Propheten gehört hatten, nahmen sie den Islam an und versprachen, ihn in der Heimat zu verbreiten.

## Der erste Treueid
Im folgenden Jahr trafen ihn zwölf Männer der Aus und Chazradsch bei **al-Aqaba** nahe Mina. Sie gelobten, Gott allein anzubeten, nicht zu stehlen, keinen Ehebruch zu begehen, ihre Kinder nicht zu töten und nicht zu verleumden. Der Prophet schickte **Mus'ab ibn Umair** mit ihnen, um den Koran zu lehren, und der Islam verbreitete sich rasch in Yathrib.

## Der zweite Treueid
Ein Jahr später kamen nach der verbreitetsten Ansicht über siebzig Männer und zwei Frauen heimlich in der Nacht. Sie gelobten, den Propheten zu schützen wie ihre eigenen Familien, falls er zu ihnen käme. Zwölf Vertreter (**Nuqaba**) wurden bestimmt.

Dieser Eid bahnte den Weg zur Hidschra. Die lange durch Fehden geschwächten Stämme Aus und Chazradsch wurden zu den **Ansar**, den Helfern.`,
        `## أمل من يثرب
كان النبي ﷺ يعرض الإسلام على القبائل في مواسم الحج، فاستمع إليه نفر من **يثرب** من **الخزرج**، وكانوا قد سمعوا من جيرانهم اليهود بنبي سيُبعث، فأسلموا ووعدوا بالدعوة في قومهم.

## البيعة الأولى
وفي العام التالي لقيه اثنا عشر رجلًا من الأوس والخزرج عند **العقبة** قرب منى، فبايعوه على ألا يشركوا بالله شيئًا ولا يسرقوا ولا يزنوا ولا يقتلوا أولادهم ولا يأتوا ببهتان. فبعث معهم **مصعب بن عمير** يعلمهم القرآن، فانتشر الإسلام في يثرب سريعًا.

## البيعة الثانية
وفي العام الذي يليه جاء سرًا ليلًا أكثر من سبعين رجلًا وامرأتان على القول الأشهر، فبايعوه على أن يمنعوه مما يمنعون منه أهليهم إن قدم عليهم، واختير منهم اثنا عشر **نقيبًا**.

ومهّدت هذه البيعة للهجرة، وصار الأوس والخزرج بعد طول عداوة **الأنصار**.`,
      ),
      quiz: [
        q(t("Who was sent to teach Islam in Yathrib?", "Wer wurde nach Yathrib geschickt, um den Islam zu lehren?", "من أُرسل ليعلم الإسلام في يثرب؟"), [
          t("Mus'ab ibn Umayr", "Mus'ab ibn Umair", "مصعب بن عمير"), t("Abu Bakr", "Abu Bakr", "أبو بكر"), t("Bilal", "Bilal", "بلال"), t("Ja'far", "Dscha'far", "جعفر"),
        ], 0, t("Mus'ab was the first teacher sent to Yathrib.", "Mus'ab war der erste nach Yathrib entsandte Lehrer.", "كان مصعب أول معلم بُعث إلى يثرب.")),
        q(t("Which two tribes became the Ansar?", "Welche zwei Stämme wurden zu den Ansar?", "أي قبيلتين صارتا الأنصار؟"), [
          t("Quraysh and Thaqif", "Quraisch und Thaqif", "قريش وثقيف"), t("Hawazin and Ghatafan", "Hawazin und Ghatafan", "هوازن وغطفان"), t("Aws and Khazraj", "Aus und Chazradsch", "الأوس والخزرج"), t("Banu Sa'd and Banu Hashim", "Banu Sa'd und Banu Haschim", "بنو سعد وبنو هاشم"),
        ], 2, t("The Arab tribes of Yathrib.", "Die arabischen Stämme Yathribs.", "قبيلتا يثرب العربيتان.")),
        q(t("What was new in the second pledge?", "Was war neu am zweiten Treueid?", "ما الجديد في البيعة الثانية؟"), [
          t("A promise to pay tribute", "Ein Versprechen von Tribut", "التزام بدفع إتاوة"), t("A promise to protect the Prophet", "Ein Versprechen, den Propheten zu schützen", "التعهد بحماية النبي"), t("A trade agreement", "Ein Handelsabkommen", "اتفاق تجاري"), t("A pilgrimage to Jerusalem", "Eine Pilgerfahrt nach Jerusalem", "حج إلى بيت المقدس"),
        ], 1, t("They pledged to defend him like their families.", "Sie gelobten, ihn wie ihre Familien zu verteidigen.", "تعهدوا بحمايته كأهليهم.")),
      ],
    },
    {
      id: "s11-hijra",
      title: t("The Hijra", "Die Hidschra", "الهجرة"),
      body: t(
        `## Leaving quietly
After the second pledge, the Muslims of Makkah began moving to Yathrib in small groups. Quraysh, alarmed, met and resolved to kill the Prophet ﷺ, with young men from every clan striking together so that no single clan could be held responsible.

## The night of departure
**Ali ibn Abi Talib** slept in the Prophet's bed to mislead the attackers and stayed behind to return the deposits people had entrusted to him. The Prophet left with **Abu Bakr**, and they hid for three nights in the **cave of Thawr**, south of Makkah. When pursuers came close, Abu Bakr was afraid, and the Prophet reassured him that God was with them, as **Surah at-Tawbah** recalls.

## The road to Madinah
Guided by Abdullah ibn Urayqit, they took an unusual coastal route. **Suraqah ibn Malik**, chasing them for a reward, was stopped when his horse repeatedly sank. They stopped at **Quba**, where the first mosque was built, and then entered Yathrib, which became **al-Madinah**, the city of the Prophet.

According to the most common view this was in 622 CE. Under Umar the Hijra became the starting point of the Islamic calendar.`,
        `## Ein stiller Aufbruch
Nach dem zweiten Treueid zogen die Muslime Mekkas in kleinen Gruppen nach Yathrib. Die beunruhigten Quraisch berieten sich und beschlossen, den Propheten ﷺ zu töten: Junge Männer aus jeder Sippe sollten gemeinsam zuschlagen, damit keine einzelne Sippe verantwortlich gemacht werden könnte.

## Die Nacht des Aufbruchs
**Ali ibn Abi Talib** schlief im Bett des Propheten, um die Angreifer zu täuschen, und blieb zurück, um den Menschen die ihm anvertrauten Güter zurückzugeben. Der Prophet brach mit **Abu Bakr** auf; sie versteckten sich drei Nächte in der **Höhle Thaur** südlich von Mekka. Als die Verfolger nahe kamen, fürchtete sich Abu Bakr, und der Prophet beruhigte ihn, dass Gott mit ihnen sei, woran **Sure at-Tauba** erinnert.

## Der Weg nach Medina
Von Abdullah ibn Uraiqit geführt, nahmen sie eine ungewöhnliche Küstenroute. **Suraqa ibn Malik**, der sie wegen einer Belohnung verfolgte, wurde aufgehalten, weil sein Pferd immer wieder einsank. Sie machten Halt in **Quba**, wo die erste Moschee gebaut wurde, und zogen dann in Yathrib ein, das zu **al-Madina**, der Stadt des Propheten, wurde.

Nach der verbreitetsten Ansicht war dies 622 n. Chr. Unter Umar wurde die Hidschra zum Beginn der islamischen Zeitrechnung.`,
        `## خروج في الخفاء
بعد البيعة الثانية أخذ مسلمو مكة يهاجرون إلى يثرب جماعات صغيرة. ففزعت قريش وأجمعت على قتل النبي ﷺ، بأن يضربه شباب من كل قبيلة ضربة رجل واحد فيتفرق دمه في القبائل.

## ليلة الخروج
نام **علي بن أبي طالب** في فراش النبي ليموّه على المتربصين، وتخلّف ليرد الودائع إلى أهلها. وخرج النبي مع **أبي بكر**، فاختبآ في **غار ثور** جنوب مكة ثلاث ليال. ولما اقترب الطلب خاف أبو بكر، فطمأنه النبي بأن الله معهما، كما تذكر **سورة التوبة**.

## الطريق إلى المدينة
سلكا بدلالة عبد الله بن أريقط طريق الساحل على غير المعتاد. وتبعهما **سراقة بن مالك** طمعًا في الجائزة، فساخت قوائم فرسه مرارًا. ونزلا **قباء** حيث بُني أول مسجد، ثم دخلا يثرب فصارت **المدينة**، مدينة النبي.

وكان ذلك سنة 622م على القول الأشهر، وجعل عمر الهجرة مبدأ التقويم الإسلامي.`,
      ),
      verses: ["9:40", "8:30"],
      quiz: [
        q(t("Where did the Prophet and Abu Bakr hide?", "Wo versteckten sich der Prophet und Abu Bakr?", "أين اختبأ النبي وأبو بكر؟"), [
          t("Cave of Hira", "Höhle Hira", "غار حراء"), t("Quba", "Quba", "قباء"), t("Ta'if", "Ta'if", "الطائف"), t("Cave of Thawr", "Höhle Thaur", "غار ثور"),
        ], 3, t("Thawr lies south of Makkah, away from the road north.", "Thaur liegt südlich von Mekka, abseits des Wegs nach Norden.", "ثور جنوب مكة بعيدًا عن طريق الشمال.")),
        q(t("Who slept in the Prophet's bed?", "Wer schlief im Bett des Propheten?", "من نام في فراش النبي؟"), [
          t("Ali ibn Abi Talib", "Ali ibn Abi Talib", "علي بن أبي طالب"), t("Zayd", "Zaid", "زيد"), t("Umar", "Umar", "عمر"), t("Hamzah", "Hamza", "حمزة"),
        ], 0, t("Ali also returned the people's deposits.", "Ali gab auch die anvertrauten Güter zurück.", "ورد علي الودائع إلى أهلها.")),
        q(t("Where was the first mosque built?", "Wo wurde die erste Moschee gebaut?", "أين بُني أول مسجد؟"), [
          t("Makkah", "Mekka", "مكة"), t("Quba", "Quba", "قباء"), t("Jerusalem", "Jerusalem", "بيت المقدس"), t("Khaybar", "Khaibar", "خيبر"),
        ], 1, t("The Quba mosque on the outskirts of Madinah.", "Die Quba-Moschee am Rand Medinas.", "مسجد قباء على أطراف المدينة.")),
      ],
    },
    {
      id: "s12-madinah",
      title: t("Building Madinah", "Der Aufbau Medinas", "بناء المجتمع في المدينة"),
      body: t(
        `## The Prophet's Mosque
The Prophet ﷺ bought the land where his camel knelt and, working with his companions, built **al-Masjid an-Nabawi** from mud bricks and palm trunks. It became the centre of prayer, learning, counsel and help for the poor; the **Ahl as-Suffah** lived in its shade.

## Brotherhood
He paired each emigrant (**Muhajir**) with a helper (**Ansari**) as brothers. The Ansar shared homes, work and property. Abd al-Rahman ibn Awf, offered half of his brother's wealth, asked only to be shown the market.

## The Charter of Madinah
A written document, often called the **Constitution of Madinah**, set out the rights and duties of the Muslims and the Jewish tribes and other groups of the city. It declared them one community in defending Madinah, protected religious freedom and made the Prophet the final arbiter in disputes.

## Further steps
- The **adhan** was introduced, with Bilal as the caller.
- In the second year after the Hijra, the **qiblah** was changed from Jerusalem to the Kaaba.
- Fasting in **Ramadan** and **zakah** were made obligatory around the same period.`,
        `## Die Moschee des Propheten
Der Prophet ﷺ kaufte das Land, auf dem sein Kamel niederkniete, und baute gemeinsam mit seinen Gefährten **al-Masdschid an-Nabawi** aus Lehmziegeln und Palmstämmen. Sie wurde zum Zentrum für Gebet, Lernen, Beratung und Hilfe für Arme; die **Ahl as-Suffa** lebten in ihrem Schatten.

## Verbrüderung
Er verband jeden Auswanderer (**Muhadschir**) mit einem Helfer (**Ansari**) als Brüder. Die Ansar teilten Häuser, Arbeit und Besitz. Abd ar-Rahman ibn Auf, dem die Hälfte des Vermögens seines Bruders angeboten wurde, bat nur darum, ihm den Markt zu zeigen.

## Die Charta von Medina
Ein schriftliches Dokument, oft **Verfassung von Medina** genannt, regelte Rechte und Pflichten der Muslime, der jüdischen Stämme und weiterer Gruppen der Stadt. Es erklärte sie zu einer Gemeinschaft bei der Verteidigung Medinas, schützte die Religionsfreiheit und machte den Propheten zur letzten Instanz bei Streitigkeiten.

## Weitere Schritte
- Der **Adhan** wurde eingeführt, mit Bilal als Rufer.
- Im zweiten Jahr nach der Hidschra wurde die **Qibla** von Jerusalem zur Kaaba geändert.
- Etwa in derselben Zeit wurden das Fasten im **Ramadan** und die **Zakat** zur Pflicht.`,
        `## المسجد النبوي
اشترى النبي ﷺ الأرض التي بركت فيها ناقته، وبنى مع أصحابه **المسجد النبوي** من اللبن وجذوع النخل، فصار مركز الصلاة والتعليم والشورى وإغاثة الفقراء، وأقام **أهل الصُّفّة** في ظله.

## المؤاخاة
آخى بين كل **مهاجر** و**أنصاري**، فتقاسم الأنصار مع إخوانهم البيوت والعمل والمال. وعُرض على عبد الرحمن بن عوف نصف مال أخيه فقال: دلّني على السوق.

## صحيفة المدينة
كتب النبي وثيقة تُعرف بـ**صحيفة المدينة** تبين حقوق المسلمين واليهود وسائر أهل المدينة وواجباتهم، وتجعلهم أمة واحدة في الدفاع عن المدينة، وتحفظ حرية الدين، وتجعل المرجع عند الخلاف إلى النبي.

## خطوات أخرى
- شُرع **الأذان** وكان بلال مؤذنه.
- وفي السنة الثانية من الهجرة تحولت **القبلة** من بيت المقدس إلى الكعبة.
- وفُرض صيام **رمضان** و**الزكاة** في تلك المدة تقريبًا.`,
      ),
      verses: ["2:144", "59:9"],
      quiz: [
        q(t("What did the brotherhood (mu'akhah) do?", "Was bewirkte die Verbrüderung (Mu'acha)?", "ما أثر المؤاخاة؟"), [
          t("Paired emigrants with helpers", "Sie verband Auswanderer mit Helfern", "جمعت المهاجرين والأنصار إخوة"), t("Created a new tribe", "Sie schuf einen neuen Stamm", "أنشأت قبيلة جديدة"), t("Ended the Hijra", "Sie beendete die Hidschra", "أنهت الهجرة"), t("Set up an army", "Sie stellte ein Heer auf", "كوّنت جيشًا"),
        ], 0, t("Each Muhajir was bonded to an Ansari.", "Jeder Muhadschir wurde mit einem Ansari verbunden.", "آخى بين كل مهاجر وأنصاري.")),
        q(t("To where was the qiblah changed?", "Wohin wurde die Qibla geändert?", "إلى أين تحولت القبلة؟"), [
          t("Jerusalem", "Jerusalem", "بيت المقدس"), t("Madinah", "Medina", "المدينة"), t("The Kaaba in Makkah", "Die Kaaba in Mekka", "الكعبة في مكة"), t("Mount Sinai", "Berg Sinai", "طور سيناء"),
        ], 2, t("From Jerusalem to the Kaaba, in year 2 AH.", "Von Jerusalem zur Kaaba, im Jahr 2 n. H.", "من بيت المقدس إلى الكعبة سنة 2هـ.")),
        q(t("What did the Charter of Madinah establish?", "Was legte die Charta von Medina fest?", "ماذا قررت صحيفة المدينة؟"), [
          t("Only rules for prayer", "Nur Gebetsregeln", "أحكام الصلاة فقط"), t("Taxes for traders", "Steuern für Händler", "ضرائب على التجار"), t("A ban on non-Muslims", "Ein Verbot für Nichtmuslime", "منع غير المسلمين"), t("Rights and duties of all groups in the city", "Rechte und Pflichten aller Gruppen der Stadt", "حقوق جميع أهل المدينة وواجباتهم"),
        ], 3, t("It united the city's groups in mutual defence.", "Sie verband die Gruppen der Stadt zur gemeinsamen Verteidigung.", "جمعت أهل المدينة على الدفاع المشترك.")),
      ],
    },
    {
      id: "s13-badr",
      title: t("The Battle of Badr", "Die Schlacht von Badr", "غزوة بدر"),
      body: t(
        `## The background
The Muslims had lost homes and property in Makkah. In Ramadan of the second year after the Hijra, the Prophet ﷺ went out with about **313** men to intercept a large Quraysh caravan led by **Abu Sufyan**. The caravan escaped by another route, but Quraysh had already sent an army of about **1,000** men.

## Consultation
Before the battle the Prophet consulted his companions. The emigrants and then the Ansar, through **Sa'd ibn Mu'adh**, assured him of their full support. On the advice of al-Hubab ibn al-Mundhir, the Muslims camped at the wells of **Badr**.

## The day of the criterion
The Prophet spent the night in prayer. On the 17th of Ramadan, according to the most common view, the armies met. Despite their small numbers, the Muslims won a decisive victory. About seventy of Quraysh were killed, among them **Abu Jahl**, and about seventy captured; fourteen Muslims were martyred.

## Afterwards
Captives were treated well; some were freed for ransom, others for teaching Muslim children to read. The Quran calls this day **Yawm al-Furqan**, the day of distinction, and recalls that God helped the believers when they were few.`,
        `## Der Hintergrund
Die Muslime hatten in Mekka Häuser und Besitz verloren. Im Ramadan des zweiten Jahres nach der Hidschra zog der Prophet ﷺ mit etwa **313** Männern aus, um eine große Karawane der Quraisch unter **Abu Sufyan** abzufangen. Die Karawane entkam über einen anderen Weg, doch Quraisch hatten bereits ein Heer von etwa **1.000** Mann ausgesandt.

## Beratung
Vor der Schlacht beriet sich der Prophet mit seinen Gefährten. Die Auswanderer und dann die Ansar, durch **Sa'd ibn Mu'adh**, sicherten ihm volle Unterstützung zu. Auf Rat von al-Hubab ibn al-Mundhir lagerten die Muslime an den Brunnen von **Badr**.

## Der Tag der Unterscheidung
Der Prophet verbrachte die Nacht im Gebet. Am 17. Ramadan, nach der verbreitetsten Ansicht, trafen die Heere aufeinander. Trotz ihrer geringen Zahl errangen die Muslime einen klaren Sieg. Etwa siebzig Quraisch fielen, darunter **Abu Dschahl**, etwa siebzig wurden gefangen; vierzehn Muslime starben als Märtyrer.

## Danach
Die Gefangenen wurden gut behandelt; manche kamen gegen Lösegeld frei, andere, indem sie muslimischen Kindern das Lesen beibrachten. Der Koran nennt diesen Tag **Yaum al-Furqan**, den Tag der Unterscheidung, und erinnert daran, dass Gott den Gläubigen half, als sie wenige waren.`,
        `## الخلفية
خسر المسلمون ديارهم وأموالهم في مكة. وفي رمضان من السنة الثانية للهجرة خرج النبي ﷺ في نحو **313** رجلًا لاعتراض عير لقريش يقودها **أبو سفيان**، فنجت العير بطريق آخر، وكانت قريش قد أخرجت جيشًا من نحو **ألف** رجل.

## الشورى
استشار النبي أصحابه قبل القتال، فأكد المهاجرون ثم الأنصار على لسان **سعد بن معاذ** نصرتهم التامة. ونزل المسلمون على ماء **بدر** بمشورة الحباب بن المنذر.

## يوم الفرقان
بات النبي ليلته يصلي ويدعو. والتقى الجمعان في السابع عشر من رمضان على القول الأشهر، فانتصر المسلمون على قلتهم نصرًا حاسمًا. وقُتل من قريش نحو سبعين منهم **أبو جهل**، وأُسر نحو سبعين، واستشهد أربعة عشر من المسلمين.

## بعد المعركة
أُحسن إلى الأسرى، ففُدي بعضهم بالمال، وفُدي آخرون بتعليم صبيان المسلمين الكتابة. وسمّى القرآن هذا اليوم **يوم الفرقان**، وذكّر بنصر الله للمؤمنين وهم أذلة.`,
      ),
      verses: ["3:123", "8:41"],
      quiz: [
        q(t("About how many Muslims fought at Badr?", "Wie viele Muslime kämpften etwa bei Badr?", "كم كان عدد المسلمين في بدر تقريبًا؟"), [
          t("About 3,000", "Etwa 3.000", "نحو 3000"), t("About 313", "Etwa 313", "نحو 313"), t("About 10,000", "Etwa 10.000", "نحو 10000"), t("About 700", "Etwa 700", "نحو 700"),
        ], 1, t("About 313 against about 1,000.", "Etwa 313 gegen etwa 1.000.", "نحو 313 أمام نحو ألف.")),
        q(t("How were some captives freed?", "Wie kamen manche Gefangene frei?", "كيف فُدي بعض الأسرى؟"), [
          t("By teaching children to read", "Indem sie Kindern das Lesen beibrachten", "بتعليم الصبيان الكتابة"), t("By fighting for the Muslims", "Indem sie für die Muslime kämpften", "بالقتال مع المسلمين"), t("By building the mosque", "Indem sie die Moschee bauten", "ببناء المسجد"), t("By leaving Arabia", "Indem sie Arabien verließen", "بمغادرة الجزيرة"),
        ], 0, t("Literacy was valued as a ransom.", "Lesen und Schreiben galten als Lösegeld.", "جُعل التعليم فداءً.")),
        q(t("What does the Quran call the day of Badr?", "Wie nennt der Koran den Tag von Badr?", "بماذا سمّى القرآن يوم بدر؟"), [
          t("Day of the Trench", "Tag des Grabens", "يوم الخندق"), t("Day of Conquest", "Tag der Eroberung", "يوم الفتح"), t("Day of Sorrow", "Tag der Trauer", "يوم الحزن"), t("Yawm al-Furqan", "Yaum al-Furqan", "يوم الفرقان"),
        ], 3, t("The day that distinguished truth from falsehood.", "Der Tag, der Wahrheit von Falschem unterschied.", "يوم فرّق الله فيه بين الحق والباطل.")),
      ],
    },
    {
      id: "s14-uhud",
      title: t("The Battle of Uhud", "Die Schlacht von Uhud", "غزوة أحد"),
      body: t(
        `## Revenge for Badr
In Shawwal of the third year after the Hijra, Quraysh marched on Madinah with about **3,000** men to avenge Badr. The Prophet ﷺ consulted his companions; many young men wanted to meet the enemy outside the city, and he went out with about 1,000. **Abdullah ibn Ubayy** then withdrew with about a third of the army, leaving about **700**.

## The archers
The Prophet placed fifty archers under **Abdullah ibn Jubayr** on a small hill (later called Jabal ar-Rumah) and ordered them not to leave their post whatever happened. The Muslims gained the upper hand early on. Seeing the enemy flee, most archers left the hill to gather spoils.

## The turning point
**Khalid ibn al-Walid**, then still on the side of Quraysh, attacked from behind through the opening. The Muslims were thrown into confusion, the Prophet was wounded, and a rumour spread that he had been killed. About seventy Muslims were martyred, among them his uncle **Hamzah**.

## Lessons
Surah Al Imran reflects on Uhud at length: obedience, patience, and the reminder that Muhammad is a messenger and the mission continues beyond any single person.`,
        `## Rache für Badr
Im Schawwal des dritten Jahres nach der Hidschra zogen Quraisch mit etwa **3.000** Mann gegen Medina, um Badr zu rächen. Der Prophet ﷺ beriet sich mit seinen Gefährten; viele junge Männer wollten dem Feind außerhalb der Stadt begegnen, und er zog mit etwa 1.000 aus. **Abdullah ibn Ubayy** zog sich dann mit etwa einem Drittel des Heeres zurück, sodass etwa **700** blieben.

## Die Bogenschützen
Der Prophet stellte fünfzig Bogenschützen unter **Abdullah ibn Dschubair** auf einen kleinen Hügel (später Dschabal ar-Ruma genannt) und befahl ihnen, ihren Posten keinesfalls zu verlassen. Anfangs gewannen die Muslime die Oberhand. Als die meisten Schützen den Feind fliehen sahen, verließen sie den Hügel, um Beute zu sammeln.

## Die Wende
**Chalid ibn al-Walid**, damals noch auf der Seite der Quraisch, griff durch die Lücke von hinten an. Die Muslime gerieten in Verwirrung, der Prophet wurde verwundet, und das Gerücht verbreitete sich, er sei getötet worden. Etwa siebzig Muslime starben als Märtyrer, darunter sein Onkel **Hamza**.

## Lehren
Sure Al Imran geht ausführlich auf Uhud ein: Gehorsam, Geduld und die Erinnerung daran, dass Muhammad ein Gesandter ist und die Botschaft über jeden Einzelnen hinaus weitergeht.`,
        `## ثأر بدر
في شوال من السنة الثالثة للهجرة سارت قريش إلى المدينة في نحو **ثلاثة آلاف** لتثأر لبدر. فاستشار النبي ﷺ أصحابه، فأحب كثير من الشباب الخروج، فخرج في نحو ألف، ثم انخذل **عبد الله بن أُبيّ** بنحو ثلث الجيش، فبقي نحو **سبعمئة**.

## الرماة
جعل النبي خمسين راميًا بقيادة **عبد الله بن جبير** على جبل صغير عُرف بعدُ بجبل الرماة، وأمرهم ألا يبرحوا مكانهم مهما حدث. وكانت الغلبة للمسلمين أول الأمر، فلما رأى أكثر الرماة انهزام العدو نزلوا لجمع الغنائم.

## نقطة التحول
فالتف **خالد بن الوليد**، وكان يومئذ مع قريش، من خلف الجيش عبر الثغرة، فاضطرب المسلمون، وجُرح النبي، وشاع أنه قُتل. واستشهد نحو سبعين من المسلمين منهم عمه **حمزة**.

## الدروس
تناولت سورة آل عمران أحدًا بتفصيل: الطاعة والصبر، والتذكير بأن محمدًا رسول وأن الرسالة باقية لا تتعلق بشخص.`,
      ),
      verses: ["3:121", "3:152", "3:144"],
      quiz: [
        q(t("Why did the battle turn against the Muslims?", "Warum wendete sich die Schlacht gegen die Muslime?", "لماذا انقلبت المعركة على المسلمين؟"), [
          t("They ran out of water", "Ihnen ging das Wasser aus", "نفد ماؤهم"), t("A storm came", "Ein Sturm kam auf", "هبت عاصفة"), t("Most archers left their post", "Die meisten Bogenschützen verließen ihren Posten", "ترك أكثر الرماة مواقعهم"), t("The Prophet ordered a retreat", "Der Prophet befahl den Rückzug", "أمر النبي بالانسحاب"),
        ], 2, t("Khalid attacked through the gap they left.", "Chalid griff durch die entstandene Lücke an.", "هاجم خالد من الثغرة التي تركوها.")),
        q(t("Which uncle of the Prophet was martyred at Uhud?", "Welcher Onkel des Propheten fiel bei Uhud?", "أي أعمام النبي استشهد في أحد؟"), [
          t("Hamzah", "Hamza", "حمزة"), t("Abbas", "Abbas", "العباس"), t("Abu Talib", "Abu Talib", "أبو طالب"), t("Abu Lahab", "Abu Lahab", "أبو لهب"),
        ], 0, t("Hamzah was called the leader of the martyrs.", "Hamza wurde Fürst der Märtyrer genannt.", "سُمّي حمزة سيد الشهداء.")),
        q(t("Who withdrew with a third of the army?", "Wer zog sich mit einem Drittel des Heeres zurück?", "من انخذل بثلث الجيش؟"), [
          t("Khalid ibn al-Walid", "Chalid ibn al-Walid", "خالد بن الوليد"), t("Abdullah ibn Ubayy", "Abdullah ibn Ubayy", "عبد الله بن أبي"), t("Abdullah ibn Jubayr", "Abdullah ibn Dschubair", "عبد الله بن جبير"), t("Abu Sufyan", "Abu Sufyan", "أبو سفيان"),
        ], 1, t("He led the hypocrites back to Madinah.", "Er führte die Heuchler nach Medina zurück.", "رجع بالمنافقين إلى المدينة.")),
      ],
    },
    {
      id: "s15-trench",
      title: t("The Battle of the Trench", "Die Grabenschlacht", "غزوة الخندق"),
      body: t(
        `## The confederates
In the fifth year after the Hijra, according to the most common view, Quraysh, Ghatafan and other tribes formed an alliance (**al-Ahzab**) of about **10,000** men to destroy the Muslims in Madinah once and for all.

## A new strategy
On the advice of **Salman al-Farisi**, who knew Persian warfare, the Muslims dug a **trench** along the open northern side of the city. The Prophet ﷺ dug alongside his companions in cold and hunger. When they struck a hard rock, he broke it and spoke of future openings to Syria, Persia and Yemen.

## The siege
The Arabs had never seen such a defence and laid siege for about a month. The Jewish tribe of **Banu Qurayzah**, bound by treaty to defend Madinah, broke their pact, which put the Muslims in great danger. **Surah al-Ahzab** describes how eyes grew wide and hearts reached the throats.

## Relief
**Nu'aym ibn Mas'ud**, a new Muslim, sowed mistrust among the allies. Then a cold, fierce wind tore down their tents, and the confederates withdrew. The Prophet said that from then on the Muslims would go to them, not they to the Muslims.`,
        `## Die Verbündeten
Im fünften Jahr nach der Hidschra, nach der verbreitetsten Ansicht, schlossen sich Quraisch, Ghatafan und andere Stämme zu einem Bündnis (**al-Ahzab**) von etwa **10.000** Mann zusammen, um die Muslime in Medina endgültig zu vernichten.

## Eine neue Strategie
Auf Rat von **Salman al-Farisi**, der die persische Kriegsführung kannte, hoben die Muslime einen **Graben** an der offenen Nordseite der Stadt aus. Der Prophet ﷺ grub bei Kälte und Hunger an der Seite seiner Gefährten. Als sie auf einen harten Felsen stießen, zerschlug er ihn und sprach von künftigen Öffnungen nach Syrien, Persien und Jemen.

## Die Belagerung
Die Araber hatten eine solche Verteidigung nie gesehen und belagerten die Stadt etwa einen Monat. Der jüdische Stamm **Banu Quraiza**, vertraglich zur Verteidigung Medinas verpflichtet, brach seinen Vertrag und brachte die Muslime in große Gefahr. **Sure al-Ahzab** beschreibt, wie die Blicke starr wurden und die Herzen bis an die Kehlen stiegen.

## Die Rettung
**Nu'aim ibn Mas'ud**, ein neuer Muslim, säte Misstrauen unter den Verbündeten. Dann riss ein kalter, heftiger Wind ihre Zelte nieder, und die Verbündeten zogen ab. Der Prophet sagte, von nun an würden die Muslime zu ihnen ziehen, nicht sie zu den Muslimen.`,
        `## الأحزاب
في السنة الخامسة للهجرة على القول الأشهر تحالفت قريش وغطفان وقبائل أخرى في نحو **عشرة آلاف** مقاتل (**الأحزاب**) ليستأصلوا المسلمين في المدينة.

## خطة جديدة
بمشورة **سلمان الفارسي** العارف بحروب فارس حفر المسلمون **خندقًا** في الجهة الشمالية المكشوفة من المدينة. وحفر النبي ﷺ مع أصحابه في البرد والجوع، ولما اعترضتهم صخرة شديدة كسرها وبشّر بفتح الشام وفارس واليمن.

## الحصار
لم يعرف العرب هذا النوع من الدفاع، فحاصروا المدينة نحو شهر. ونقضت **بنو قريظة** عهدها وكانت ملزمة بالدفاع عن المدينة، فاشتد الخطر على المسلمين. وتصف **سورة الأحزاب** كيف زاغت الأبصار وبلغت القلوب الحناجر.

## الفرج
خذّل **نعيم بن مسعود**، وكان حديث الإسلام، بين الأحزاب، ثم أرسل الله ريحًا باردة شديدة قلعت خيامهم فرحلوا. وقال النبي إن المسلمين يغزونهم بعد اليوم ولا يغزونهم.`,
      ),
      verses: ["33:9", "33:10", "33:22"],
      quiz: [
        q(t("Who suggested digging the trench?", "Wer schlug vor, den Graben auszuheben?", "من أشار بحفر الخندق؟"), [
          t("Abu Bakr", "Abu Bakr", "أبو بكر"), t("Sa'd ibn Mu'adh", "Sa'd ibn Mu'adh", "سعد بن معاذ"), t("Umar", "Umar", "عمر"), t("Salman al-Farisi", "Salman al-Farisi", "سلمان الفارسي"),
        ], 3, t("Salman knew the Persian tactic.", "Salman kannte die persische Taktik.", "كان سلمان يعرف هذه الخطة من فارس.")),
        q(t("How did the siege end?", "Wie endete die Belagerung?", "كيف انتهى الحصار؟"), [
          t("A fierce wind and division among the allies", "Ein heftiger Wind und Zwietracht unter den Verbündeten", "ريح شديدة وتفرق الأحزاب"), t("A great battle in the city", "Eine große Schlacht in der Stadt", "معركة كبيرة في المدينة"), t("A peace treaty", "Ein Friedensvertrag", "صلح"), t("The Muslims surrendered", "Die Muslime ergaben sich", "استسلام المسلمين"),
        ], 0, t("The confederates withdrew without taking the city.", "Die Verbündeten zogen ab, ohne die Stadt einzunehmen.", "رحل الأحزاب دون أن يدخلوا المدينة.")),
        q(t("About how large was the confederate army?", "Wie groß war das Heer der Verbündeten etwa?", "كم بلغ جيش الأحزاب تقريبًا؟"), [
          t("1,000", "1.000", "ألف"), t("3,000", "3.000", "ثلاثة آلاف"), t("10,000", "10.000", "عشرة آلاف"), t("100,000", "100.000", "مئة ألف"),
        ], 2, t("About 10,000 men.", "Etwa 10.000 Mann.", "نحو عشرة آلاف.")),
      ],
    },
    {
      id: "s16-hudaybiyyah",
      title: t("The Treaty of Hudaybiyyah", "Der Vertrag von Hudaibiya", "صلح الحديبية"),
      body: t(
        `## A peaceful pilgrimage
In Dhu al-Qa'dah of the sixth year after the Hijra, the Prophet ﷺ set out with about **1,400** companions to perform **umrah**, dressed as pilgrims and without weapons of war. Quraysh blocked the way, and the Muslims camped at **al-Hudaybiyyah** near Makkah.

## The pledge under the tree
When a rumour spread that **Uthman ibn Affan**, sent as envoy, had been killed, the companions pledged loyalty to the Prophet under a tree. This was the **Bay'at ar-Ridwan**, praised in **Surah al-Fath**.

## The terms
Quraysh sent **Suhayl ibn Amr**, and a treaty was agreed:
- Ten years of peace between the two sides.
- The Muslims return this year and perform umrah the following year.
- Anyone from Quraysh joining the Muslims without permission is returned, but not the reverse.
- Tribes may ally with either side.

## A clear victory
Many companions, including Umar, found the terms hard. Yet on the way back Surah al-Fath was revealed, calling it a **clear victory**. In the years of peace, far more people entered Islam than before.`,
        `## Eine friedliche Pilgerfahrt
Im Dhu al-Qa'da des sechsten Jahres nach der Hidschra brach der Prophet ﷺ mit etwa **1.400** Gefährten zur **Umra** auf, im Pilgergewand und ohne Kriegswaffen. Quraisch versperrten den Weg, und die Muslime lagerten bei **al-Hudaibiya** nahe Mekka.

## Der Eid unter dem Baum
Als das Gerücht aufkam, **Uthman ibn Affan**, der als Gesandter geschickt worden war, sei getötet worden, leisteten die Gefährten dem Propheten unter einem Baum den Treueid. Dies war die **Bai'at ar-Ridwan**, die in **Sure al-Fath** gelobt wird.

## Die Bedingungen
Quraisch schickten **Suhail ibn Amr**, und man einigte sich auf einen Vertrag:
- Zehn Jahre Frieden zwischen beiden Seiten.
- Die Muslime kehren in diesem Jahr um und vollziehen die Umra im folgenden Jahr.
- Wer von Quraisch ohne Erlaubnis zu den Muslimen kommt, wird zurückgeschickt, aber nicht umgekehrt.
- Stämme dürfen sich mit jeder Seite verbünden.

## Ein klarer Sieg
Viele Gefährten, auch Umar, empfanden die Bedingungen als schwer. Doch auf dem Rückweg wurde Sure al-Fath offenbart, die ihn einen **klaren Sieg** nennt. In den Jahren des Friedens nahmen weit mehr Menschen den Islam an als zuvor.`,
        `## عمرة سلمية
في ذي القعدة من السنة السادسة للهجرة خرج النبي ﷺ في نحو **ألف وأربعمئة** من أصحابه يريدون **العمرة** محرمين بلا سلاح حرب. فصدّتهم قريش، فنزلوا **الحديبية** قرب مكة.

## بيعة الرضوان
لما شاع أن **عثمان بن عفان** رسول النبي إلى قريش قد قُتل، بايع الصحابة النبي تحت الشجرة، وهي **بيعة الرضوان** التي أثنت عليها **سورة الفتح**.

## الشروط
أرسلت قريش **سهيل بن عمرو**، فتم الصلح على:
- وضع الحرب عشر سنين.
- أن يرجع المسلمون عامهم ويعتمروا من العام المقبل.
- من جاء من قريش إلى المسلمين بغير إذن رُدّ، ولا يُرد من جاء من المسلمين إلى قريش.
- من شاء من القبائل دخل في حلف أي الفريقين.

## فتح مبين
شق ذلك على كثير من الصحابة ومنهم عمر، لكن نزلت في طريق العودة سورة الفتح وسمّته **فتحًا مبينًا**. ودخل في الإسلام في سنوات الهدنة أكثر ممن دخل قبلها.`,
      ),
      verses: ["48:1", "48:18"],
      quiz: [
        q(t("What was the Bay'at ar-Ridwan?", "Was war die Bai'at ar-Ridwan?", "ما بيعة الرضوان؟"), [
          t("A pledge under a tree at Hudaybiyyah", "Ein Treueid unter einem Baum bei Hudaibiya", "بيعة تحت الشجرة في الحديبية"), t("The pledge at Aqabah", "Der Eid von Aqaba", "بيعة العقبة"), t("A trade alliance", "Ein Handelsbündnis", "حلف تجاري"), t("The farewell pledge", "Der Abschiedseid", "بيعة الوداع"),
        ], 0, t("It followed the rumour of Uthman's death.", "Er folgte dem Gerücht von Uthmans Tod.", "كانت بعد إشاعة مقتل عثمان.")),
        q(t("How long was the agreed truce?", "Wie lange sollte der vereinbarte Frieden dauern?", "كم كانت مدة الهدنة؟"), [
          t("One year", "Ein Jahr", "سنة"), t("Three years", "Drei Jahre", "ثلاث سنين"), t("Forever", "Für immer", "إلى الأبد"), t("Ten years", "Zehn Jahre", "عشر سنين"),
        ], 3, t("Ten years of peace were agreed.", "Zehn Jahre Frieden wurden vereinbart.", "اتفقوا على عشر سنين.")),
        q(t("What does Surah al-Fath call the treaty?", "Wie nennt Sure al-Fath den Vertrag?", "بماذا وصفت سورة الفتح الصلح؟"), [
          t("A defeat", "Eine Niederlage", "هزيمة"), t("A clear victory", "Einen klaren Sieg", "فتحًا مبينًا"), t("A test", "Eine Prüfung", "ابتلاء"), t("A mistake", "Einen Fehler", "خطأ"),
        ], 1, t("The peace led to great growth of Islam.", "Der Frieden führte zu großem Wachstum des Islam.", "أدت الهدنة إلى انتشار واسع للإسلام.")),
      ],
    },
    {
      id: "s17-letters-khaybar",
      title: t("Letters to rulers and Khaybar", "Briefe an Herrscher und Khaibar", "الرسائل إلى الملوك وخيبر"),
      body: t(
        `## A message beyond Arabia
With peace secured by Hudaybiyyah, the Prophet ﷺ sent letters inviting rulers to Islam, sealed with a silver ring engraved "Muhammad Rasul Allah". Recipients included:
- **Heraclius**, the Byzantine emperor, who questioned Abu Sufyan about the Prophet;
- **Khosrow II** of Persia, who tore up the letter;
- **al-Muqawqis** of Egypt, who replied politely and sent gifts;
- the **Najashi** of Abyssinia and rulers in Bahrain, Oman and elsewhere.

The letter to Heraclius drew on a verse of Surah Al Imran inviting the People of the Book to a common word.

## Khaybar
In the seventh year after the Hijra, according to the most common view, the Muslims marched on **Khaybar**, a fortified oasis north of Madinah from which attacks against them had been organised. After a siege of its forts, which **Ali ibn Abi Talib** played a key role in opening, Khaybar surrendered. Its inhabitants were allowed to keep farming the land in return for half of the harvest.

Around this time **Ja'far** and the emigrants returned from Abyssinia, and the Prophet rejoiced greatly.`,
        `## Eine Botschaft über Arabien hinaus
Nachdem der Frieden von Hudaibiya gesichert war, sandte der Prophet ﷺ Briefe, in denen er Herrscher zum Islam einlud, gesiegelt mit einem Silberring mit der Gravur „Muhammad Rasul Allah“. Zu den Empfängern gehörten:
- **Heraklios**, der byzantinische Kaiser, der Abu Sufyan über den Propheten befragte;
- **Chosrau II.** von Persien, der den Brief zerriss;
- **al-Muqauqis** von Ägypten, der höflich antwortete und Geschenke sandte;
- der **Nadschaschi** von Abessinien sowie Herrscher in Bahrain, Oman und anderswo.

Der Brief an Heraklios griff einen Vers der Sure Al Imran auf, der die Leute der Schrift zu einem gemeinsamen Wort einlädt.

## Khaibar
Im siebten Jahr nach der Hidschra, nach der verbreitetsten Ansicht, zogen die Muslime gegen **Khaibar**, eine befestigte Oase nördlich von Medina, von der aus Angriffe gegen sie organisiert worden waren. Nach der Belagerung der Festungen, bei deren Öffnung **Ali ibn Abi Talib** eine Schlüsselrolle spielte, ergab sich Khaibar. Die Bewohner durften das Land weiter bewirtschaften und gaben dafür die Hälfte der Ernte ab.

Um diese Zeit kehrten **Dscha'far** und die Auswanderer aus Abessinien zurück, und der Prophet freute sich sehr.`,
        `## رسالة تتجاوز الجزيرة
لما استقر الأمن بصلح الحديبية كتب النبي ﷺ إلى الملوك يدعوهم إلى الإسلام، وختم كتبه بخاتم من فضة نُقش عليه «محمد رسول الله». ومن هؤلاء:
- **هرقل** عظيم الروم، وقد سأل أبا سفيان عن النبي؛
- **كسرى** ملك فارس، وقد مزّق الكتاب؛
- **المقوقس** عظيم مصر، فردّ ردًا حسنًا وأرسل هدايا؛
- **النجاشي** ملك الحبشة، وملوك البحرين وعُمان وغيرهم.

واستشهد كتاب هرقل بآية من سورة آل عمران تدعو أهل الكتاب إلى كلمة سواء.

## خيبر
وفي السنة السابعة للهجرة على القول الأشهر سار المسلمون إلى **خيبر**، وهي واحة محصنة شمال المدينة كانت تُدبَّر منها المكايد ضدهم. وبعد حصار حصونها، وكان لـ**علي بن أبي طالب** دور بارز في فتحها، استسلمت خيبر، وأُقر أهلها على زراعة الأرض بنصف الثمر.

وفي تلك الأيام قدم **جعفر** ومن معه من الحبشة، ففرح النبي بقدومهم فرحًا شديدًا.`,
      ),
      verses: ["3:64"],
      quiz: [
        q(t("Which ruler tore up the Prophet's letter?", "Welcher Herrscher zerriss den Brief des Propheten?", "أي ملك مزّق كتاب النبي؟"), [
          t("Heraclius", "Heraklios", "هرقل"), t("The Najashi", "Der Nadschaschi", "النجاشي"), t("Khosrow of Persia", "Chosrau von Persien", "كسرى فارس"), t("al-Muqawqis", "al-Muqauqis", "المقوقس"),
        ], 2, t("Khosrow II of Persia tore it up.", "Chosrau II. von Persien zerriss ihn.", "مزّقه كسرى ملك فارس.")),
        q(t("What was engraved on the Prophet's seal?", "Was war auf dem Siegel des Propheten eingraviert?", "ماذا نُقش على خاتم النبي؟"), [
          t("Muhammad Rasul Allah", "Muhammad Rasul Allah", "محمد رسول الله"), t("Allahu Akbar", "Allahu Akbar", "الله أكبر"), t("Bismillah", "Bismillah", "بسم الله"), t("His father's name", "Der Name seines Vaters", "اسم أبيه"),
        ], 0, t("A silver ring used to seal letters.", "Ein Silberring zum Siegeln der Briefe.", "خاتم فضة تُختم به الكتب.")),
        q(t("What were the people of Khaybar allowed after surrender?", "Was durften die Bewohner Khaibars nach der Übergabe?", "ماذا أُقر لأهل خيبر بعد الاستسلام؟"), [
          t("To keep their weapons", "Ihre Waffen behalten", "الاحتفاظ بسلاحهم"), t("To farm the land for half the harvest", "Das Land gegen die Hälfte der Ernte bewirtschaften", "زراعة الأرض بنصف الثمر"), t("To rule Madinah", "Medina regieren", "حكم المدينة"), t("Nothing at all", "Gar nichts", "لا شيء"),
        ], 1, t("They stayed as farmers on agreed terms.", "Sie blieben als Bauern zu vereinbarten Bedingungen.", "بقوا مزارعين بشروط متفق عليها.")),
      ],
    },
    {
      id: "s18-conquest",
      title: t("The conquest of Makkah", "Die Eroberung Mekkas", "فتح مكة"),
      body: t(
        `## The treaty is broken
In the eighth year after the Hijra, Banu Bakr, allies of Quraysh, attacked **Khuza'ah**, allies of the Muslims, with Quraysh's help. This broke the Treaty of Hudaybiyyah. Abu Sufyan travelled to Madinah to renew it, without success.

## The march
In Ramadan, according to the most common view, the Prophet ﷺ marched with about **10,000** men. Near Makkah, Abu Sufyan came out and embraced Islam. The Prophet announced that whoever entered Abu Sufyan's house, stayed in their own home with the door closed, or entered the Sacred Mosque would be safe.

## Entering in humility
The Muslims entered Makkah almost without fighting. The Prophet rode in with his head bowed in humility. He went to the Kaaba, removed the **360 idols** around it, and had Bilal call the adhan from its roof.

## General amnesty
He gathered Quraysh, who had persecuted him for twenty years, and asked what they expected. They hoped for kindness. He told them, in the spirit of Yusuf's words to his brothers, that there was no blame on them that day, and let them go free. Surah an-Nasr speaks of people entering God's religion in crowds.`,
        `## Der Vertrag wird gebrochen
Im achten Jahr nach der Hidschra griffen die Banu Bakr, Verbündete der Quraisch, mit deren Hilfe die **Chuza'a** an, die Verbündeten der Muslime. Damit war der Vertrag von Hudaibiya gebrochen. Abu Sufyan reiste nach Medina, um ihn zu erneuern, ohne Erfolg.

## Der Zug
Im Ramadan, nach der verbreitetsten Ansicht, zog der Prophet ﷺ mit etwa **10.000** Mann aus. Nahe Mekka kam Abu Sufyan heraus und nahm den Islam an. Der Prophet verkündete, wer das Haus Abu Sufyans betrete, in seinem eigenen Haus mit geschlossener Tür bleibe oder die Heilige Moschee betrete, sei sicher.

## Einzug in Demut
Die Muslime zogen fast ohne Kampf in Mekka ein. Der Prophet ritt mit demütig gesenktem Haupt hinein. Er ging zur Kaaba, entfernte die **360 Götzenbilder** um sie herum und ließ Bilal vom Dach aus den Adhan rufen.

## Allgemeine Amnestie
Er versammelte Quraisch, die ihn zwanzig Jahre lang verfolgt hatten, und fragte, was sie erwarteten. Sie hofften auf Güte. Im Geist der Worte Yusufs an seine Brüder sagte er ihnen, an diesem Tag treffe sie kein Tadel, und ließ sie frei. Sure an-Nasr spricht davon, dass die Menschen in Scharen in Gottes Religion eintreten.`,
        `## نقض العهد
في السنة الثامنة للهجرة أغارت بنو بكر حلفاء قريش على **خزاعة** حلفاء المسلمين بمعونة من قريش، فنُقض صلح الحديبية. وقدم أبو سفيان المدينة ليجدد العهد فلم يفلح.

## المسير
وفي رمضان على القول الأشهر خرج النبي ﷺ في نحو **عشرة آلاف**. وقرب مكة خرج أبو سفيان فأسلم، وأعلن النبي أن من دخل دار أبي سفيان فهو آمن، ومن أغلق عليه بابه فهو آمن، ومن دخل المسجد الحرام فهو آمن.

## دخول المتواضع
دخل المسلمون مكة بلا قتال يُذكر، ودخلها النبي مطأطئ الرأس تواضعًا. ثم أتى الكعبة فأزال **ثلاثمئة وستين صنمًا** حولها، وأمر بلالًا فأذّن على ظهرها.

## العفو العام
جمع قريشًا التي آذته عشرين سنة وسألهم: ما تظنون أني فاعل بكم؟ فرجوا خيرًا، فأعلن لهم على نهج يوسف مع إخوته ألا تثريب عليهم اليوم، وأطلقهم. وتذكر سورة النصر دخول الناس في دين الله أفواجًا.`,
      ),
      verses: ["110:1", "110:2", "17:81", "12:92"],
      quiz: [
        q(t("What triggered the march on Makkah?", "Was löste den Zug nach Mekka aus?", "ما سبب المسير إلى مكة؟"), [
          t("Quraysh broke the Hudaybiyyah treaty", "Quraisch brachen den Vertrag von Hudaibiya", "نقضت قريش صلح الحديبية"), t("A famine in Madinah", "Eine Hungersnot in Medina", "مجاعة في المدينة"), t("The death of Abu Talib", "Der Tod Abu Talibs", "وفاة أبي طالب"), t("A Byzantine attack", "Ein byzantinischer Angriff", "هجوم الروم"),
        ], 0, t("Their allies attacked Khuza'ah with their help.", "Ihre Verbündeten griffen mit ihrer Hilfe die Chuza'a an.", "أعانوا حلفاءهم على خزاعة.")),
        q(t("How did the Prophet treat Quraysh after the conquest?", "Wie behandelte der Prophet Quraisch nach der Eroberung?", "كيف عامل النبي قريشًا بعد الفتح؟"), [
          t("He exiled them", "Er verbannte sie", "نفاهم"), t("He enslaved them", "Er versklavte sie", "استرقهم"), t("He fined them", "Er belegte sie mit Strafen", "غرّمهم"), t("He granted a general amnesty", "Er gewährte eine allgemeine Amnestie", "عفا عنهم عفوًا عامًا"),
        ], 3, t("He forgave those who had persecuted him.", "Er vergab denen, die ihn verfolgt hatten.", "عفا عمّن آذوه.")),
        q(t("Who called the adhan from the Kaaba?", "Wer rief den Adhan von der Kaaba?", "من أذّن على الكعبة؟"), [
          t("Abu Sufyan", "Abu Sufyan", "أبو سفيان"), t("Bilal", "Bilal", "بلال"), t("Ali", "Ali", "علي"), t("Abu Bakr", "Abu Bakr", "أبو بكر"),
        ], 1, t("The former slave Bilal stood on its roof.", "Der einstige Sklave Bilal stand auf ihrem Dach.", "صعد بلال الذي كان عبدًا على سطحها.")),
      ],
    },
    {
      id: "s19-farewell",
      title: t("The Farewell Pilgrimage", "Die Abschiedswallfahrt", "حجة الوداع"),
      body: t(
        `## The only Hajj
In the tenth year after the Hijra, the Prophet ﷺ performed his only Hajj, with a very large number of Muslims; reports speak of over one hundred thousand. Companions observed every step closely, and much of what Muslims know about the rites of Hajj comes from this journey.

## The sermon at Arafah
On the day of **Arafah** he addressed the people. Among the themes he stressed, in summary:
- The sanctity of life, property and honour of every person.
- The abolition of blood feuds and usury from the time of ignorance.
- Kind treatment of women and recognition of mutual rights between spouses.
- The equality of all people: no Arab is above a non-Arab, nor the reverse, except by piety.
- Holding fast to the Book of God.

He asked the crowd whether he had conveyed the message, and they affirmed it; he called on God to witness.

## Completion of the religion
On this occasion, according to the well-known reports, the verse of **Surah al-Ma'idah** was revealed stating that the religion had been perfected. Some companions, such as Umar, sensed that the Prophet's mission was nearing its end.`,
        `## Die einzige Hadsch
Im zehnten Jahr nach der Hidschra vollzog der Prophet ﷺ seine einzige Hadsch, zusammen mit einer sehr großen Zahl von Muslimen; Berichte sprechen von über hunderttausend. Die Gefährten beobachteten jeden Schritt genau, und vieles, was Muslime über die Riten der Hadsch wissen, stammt von dieser Reise.

## Die Predigt am Arafat
Am Tag von **Arafa** sprach er zu den Menschen. Zu den Themen, die er betonte, gehörten zusammengefasst:
- Die Unantastbarkeit von Leben, Besitz und Ehre jedes Menschen.
- Die Abschaffung der Blutrache und des Zinses aus der vorislamischen Zeit.
- Gütige Behandlung der Frauen und gegenseitige Rechte der Ehepartner.
- Die Gleichheit aller Menschen: Kein Araber steht über einem Nichtaraber, noch umgekehrt, außer durch Gottesfurcht.
- Das Festhalten am Buch Gottes.

Er fragte die Menge, ob er die Botschaft übermittelt habe, und sie bejahten es; er rief Gott zum Zeugen an.

## Die Vollendung der Religion
Bei dieser Gelegenheit wurde nach den bekannten Berichten der Vers der **Sure al-Ma'ida** offenbart, der die Vollendung der Religion verkündet. Manche Gefährten wie Umar spürten, dass die Sendung des Propheten sich ihrem Ende näherte.`,
        `## الحجة الوحيدة
في السنة العاشرة للهجرة حج النبي ﷺ حجته الوحيدة مع جمع غفير من المسلمين، تذكر الروايات أنهم جاوزوا مئة ألف. وتتبع الصحابة كل خطوة، ومن هذه الحجة عُرف كثير من مناسك الحج.

## خطبة عرفة
وفي يوم **عرفة** خطب الناس، ومن أبرز ما أكّده بإيجاز:
- حرمة دم كل إنسان وماله وعرضه.
- إبطال ثأر الجاهلية وربا الجاهلية.
- الوصية بالنساء خيرًا والحقوق المتبادلة بين الزوجين.
- المساواة بين الناس: لا فضل لعربي على أعجمي ولا لأعجمي على عربي إلا بالتقوى.
- الاعتصام بكتاب الله.

ثم سألهم: هل بلّغ؟ فأقروا، فأشهد الله عليهم.

## إكمال الدين
وفي هذه المناسبة نزلت على المشهور آية **سورة المائدة** التي تعلن إكمال الدين. وأحس بعض الصحابة كعمر أن رسالة النبي قاربت تمامها.`,
      ),
      verses: ["5:3", "49:13"],
      quiz: [
        q(t("Where did the Prophet give his famous sermon?", "Wo hielt der Prophet seine berühmte Predigt?", "أين خطب النبي خطبته الشهيرة؟"), [
          t("At Arafah", "Am Arafat", "في عرفة"), t("In Quba", "In Quba", "في قباء"), t("At Badr", "In Badr", "في بدر"), t("In Ta'if", "In Ta'if", "في الطائف"),
        ], 0, t("On the day of Arafah during Hajj.", "Am Tag von Arafa während der Hadsch.", "يوم عرفة في الحج.")),
        q(t("How many times did the Prophet perform Hajj?", "Wie oft vollzog der Prophet die Hadsch?", "كم مرة حج النبي؟"), [
          t("Every year", "Jedes Jahr", "كل سنة"), t("Three times", "Dreimal", "ثلاث مرات"), t("Never", "Nie", "لم يحج"), t("Once", "Einmal", "مرة واحدة"),
        ], 3, t("The Farewell Pilgrimage was his only Hajj.", "Die Abschiedswallfahrt war seine einzige Hadsch.", "حجة الوداع حجته الوحيدة.")),
        q(t("By what does one person excel another, per the sermon?", "Wodurch steht nach der Predigt ein Mensch über einem anderen?", "بم يتفاضل الناس بحسب الخطبة؟"), [
          t("Wealth", "Reichtum", "المال"), t("Lineage", "Abstammung", "النسب"), t("Piety", "Gottesfurcht", "التقوى"), t("Language", "Sprache", "اللغة"),
        ], 2, t("Only piety, not race or origin.", "Nur Gottesfurcht, nicht Herkunft.", "بالتقوى لا بالعرق أو الأصل.")),
      ],
    },
    {
      id: "s20-passing",
      title: t("Passing and legacy", "Tod und Vermächtnis", "الوفاة والإرث"),
      body: t(
        `## The final illness
A few months after the Farewell Pilgrimage, the Prophet ﷺ fell ill with fever and headache. He stayed in the room of **Aishah**, next to the mosque, and asked **Abu Bakr** to lead the prayers. Even in illness he urged care for the prayer and kindness to those under one's authority.

## His passing
According to the most common view, he passed away on a Monday in Rabi al-Awwal of the eleventh year after the Hijra (632 CE), at the age of about **63**. He was buried in Aishah's room, which today lies within the Prophet's Mosque.

## Abu Bakr's steadfastness
The companions were overwhelmed; Umar at first refused to believe it. Abu Bakr addressed the people, reminding them that whoever worshipped Muhammad should know he had died, and whoever worshipped God should know that God is ever-living. He recited the verse of Al Imran that calls Muhammad a messenger like those before him. Abu Bakr was then chosen as the first caliph.

## Legacy
He left the Quran, his Sunnah, and a community of believers. The Quran describes him as a beautiful example and a mercy to the worlds.`,
        `## Die letzte Krankheit
Einige Monate nach der Abschiedswallfahrt erkrankte der Prophet ﷺ an Fieber und Kopfschmerzen. Er blieb im Zimmer **Aischas** neben der Moschee und bat **Abu Bakr**, das Gebet zu leiten. Selbst in der Krankheit ermahnte er, das Gebet zu wahren und gütig zu denen zu sein, die einem anvertraut sind.

## Sein Tod
Nach der verbreitetsten Ansicht starb er an einem Montag im Rabi al-Awwal des elften Jahres nach der Hidschra (632 n. Chr.) im Alter von etwa **63** Jahren. Er wurde in Aischas Zimmer begraben, das heute in der Prophetenmoschee liegt.

## Abu Bakrs Standhaftigkeit
Die Gefährten waren erschüttert; Umar wollte es zunächst nicht glauben. Abu Bakr sprach zu den Menschen: Wer Muhammad angebetet habe, solle wissen, dass er gestorben sei; wer Gott anbete, solle wissen, dass Gott ewig lebt. Er trug den Vers aus Al Imran vor, der Muhammad einen Gesandten wie die vor ihm nennt. Danach wurde Abu Bakr zum ersten Kalifen gewählt.

## Vermächtnis
Er hinterließ den Koran, seine Sunna und eine Gemeinschaft von Gläubigen. Der Koran beschreibt ihn als schönes Vorbild und als Barmherzigkeit für die Welten.`,
        `## المرض الأخير
بعد حجة الوداع بأشهر مرض النبي ﷺ بالحمى والصداع، فمكث في حجرة **عائشة** بجوار المسجد، وأمر **أبا بكر** أن يصلي بالناس. وكان في مرضه يوصي بالصلاة وبالإحسان إلى من تحت اليد.

## الوفاة
وتوفي على القول الأشهر يوم الاثنين من ربيع الأول سنة إحدى عشرة للهجرة (632م)، وله نحو **ثلاث وستين** سنة، ودُفن في حجرة عائشة التي تقع اليوم داخل المسجد النبوي.

## ثبات أبي بكر
اضطرب الصحابة، وأنكر عمر الخبر أول الأمر. فقام أبو بكر في الناس وذكّرهم بأن من كان يعبد محمدًا فإن محمدًا قد مات، ومن كان يعبد الله فإن الله حي لا يموت، وتلا آية آل عمران التي تصف محمدًا بأنه رسول قد خلت من قبله الرسل. ثم بويع أبو بكر خليفة أول.

## الإرث
ترك القرآن وسنته وأمة مؤمنة. ويصفه القرآن بأنه أسوة حسنة ورحمة للعالمين.`,
      ),
      verses: ["3:144", "33:21", "21:107"],
      quiz: [
        q(t("In whose room did the Prophet spend his final illness?", "In wessen Zimmer verbrachte der Prophet seine letzte Krankheit?", "في حجرة من قضى النبي مرضه الأخير؟"), [
          t("Hafsah", "Hafsa", "حفصة"), t("Fatimah", "Fatima", "فاطمة"), t("Umm Salamah", "Umm Salama", "أم سلمة"), t("Aishah", "Aischa", "عائشة"),
        ], 3, t("He was also buried there.", "Dort wurde er auch begraben.", "ودُفن فيها.")),
        q(t("Who led the prayers during his illness?", "Wer leitete während seiner Krankheit das Gebet?", "من صلى بالناس في مرضه؟"), [
          t("Abu Bakr", "Abu Bakr", "أبو بكر"), t("Umar", "Umar", "عمر"), t("Uthman", "Uthman", "عثمان"), t("Bilal", "Bilal", "بلال"),
        ], 0, t("Abu Bakr later became the first caliph.", "Abu Bakr wurde später der erste Kalif.", "صار أبو بكر بعدُ الخليفة الأول.")),
        q(t("About how old was the Prophet when he passed away?", "Wie alt war der Prophet etwa bei seinem Tod?", "كم كان عمر النبي عند وفاته تقريبًا؟"), [
          t("40", "40", "40"), t("53", "53", "53"), t("63", "63", "63"), t("70", "70", "70"),
        ], 2, t("About 63 years, by the common view.", "Etwa 63 Jahre nach verbreiteter Ansicht.", "نحو ثلاث وستين على المشهور.")),
      ],
    },
  ],
};
