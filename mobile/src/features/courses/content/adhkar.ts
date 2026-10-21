import type { Course } from "../types";

// Duas and adhkar. No dua, hadith or Quran text is typed here: texts are shown in the app's duas screen,
// verses are loaded by key and hadith by reference.

export const ADHKAR: Course = {
  id: "adhkar",
  word: "الأذكار",
  free: 1,
  title: { en: "Duas and adhkar", de: "Bittgebete und Adhkar", ar: "الأدعية والأذكار" },
  lead: {
    en: "Remembrance of Allah through the day: when, why and how, with the texts in the app's duas screen.",
    de: "Gedenken an Allah im Tagesverlauf: wann, warum und wie, mit den Texten im Dua-Bereich der App.",
    ar: "ذكر الله في اليوم والليلة: متى ولماذا وكيف، والنصوص في شاشة الأدعية في التطبيق.",
  },
  lessons: [
    {
      id: "d01-what-is-dua",
      title: { en: "What dua and dhikr are", de: "Was Dua und Dhikr sind", ar: "ما الدعاء وما الذكر" },
      body: {
        en: "**Dhikr** means remembering Allah: glorifying, praising and declaring His oneness with the tongue and the heart. **Dua** means calling upon Him: asking for good in this world and the next, for forgiveness and for help. The Quran presents both as a direct relationship: Allah describes Himself as near and answering the one who calls (2:186), and He commands His servants to call on Him (40:60).\n\n## Etiquette\n- Begin with praise of Allah and blessings on the Prophet.\n- Be sincere and present, with hope and humility.\n- Ask firmly, without saying \"if You will\" in a doubtful way.\n- Raise the hands where this is reported, face the qiblah when convenient.\n- Halal food and earnings matter for acceptance.\n- Do not rush or give up because the answer seems delayed.\n\nThe texts of the adhkar in this course are found in the app's **duas screen**; this course explains their purpose and occasion.",
        de: "**Dhikr** bedeutet Gedenken an Allah: Ihn mit Zunge und Herz preisen, loben und Seine Einheit bezeugen. **Dua** bedeutet, Ihn anzurufen: um Gutes in dieser und der nächsten Welt, um Vergebung und um Hilfe bitten. Der Koran stellt beides als unmittelbare Beziehung dar: Allah beschreibt Sich als nah und als Den, der dem Rufenden antwortet (2:186), und Er fordert Seine Diener auf, Ihn anzurufen (40:60).\n\n## Etikette\n- Beginnen Sie mit dem Lob Allahs und dem Segensgruß auf den Propheten.\n- Seien Sie aufrichtig und gegenwärtig, mit Hoffnung und Demut.\n- Bitten Sie entschlossen, nicht zweifelnd.\n- Heben Sie die Hände, wo dies überliefert ist, und wenden Sie sich nach Möglichkeit zur Qibla.\n- Erlaubte Nahrung und erlaubter Erwerb sind für die Annahme wichtig.\n- Werden Sie nicht ungeduldig, wenn die Antwort scheinbar ausbleibt.\n\nDie Texte der Adhkar finden Sie im **Dua-Bereich** der App; dieser Kurs erklärt Zweck und Anlass.",
        ar: "**الذكر** هو استحضار الله تعالى بالتسبيح والتحميد والتهليل باللسان والقلب. و**الدعاء** هو سؤال الله ومناجاته: طلب خير الدنيا والآخرة والمغفرة والعون. ويعرض القرآن كليهما علاقةً مباشرة: فالله يصف نفسه بالقرب وإجابة الداعي (2:186)، ويأمر عباده بدعائه (40:60).\n\n## آداب الدعاء\n- البدء بحمد الله والصلاة على النبي.\n- الإخلاص وحضور القلب مع الرجاء والتذلل.\n- العزم في المسألة دون تردد.\n- رفع اليدين حيث ورد، واستقبال القبلة عند التيسر.\n- طيب المطعم والمكسب من أسباب الإجابة.\n- عدم الاستعجال وترك الدعاء إذا تأخرت الإجابة.\n\nتجد نصوص الأذكار في **شاشة الأدعية** في التطبيق؛ وهذه الدورة تشرح مقاصدها ومواضعها.",
      },
      verses: ["2:186", "40:60"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "What does dhikr mean?", de: "Was bedeutet Dhikr?", ar: "ما معنى الذكر؟" },
          options: [
            { en: "Fasting outside Ramadan", de: "Fasten außerhalb des Ramadan", ar: "الصيام في غير رمضان" },
            { en: "Remembering Allah with tongue and heart", de: "Gedenken an Allah mit Zunge und Herz", ar: "استحضار الله باللسان والقلب" },
            { en: "Giving charity", de: "Almosen geben", ar: "إخراج الصدقة" },
            { en: "Reciting only in Arabic grammar class", de: "Nur im Grammatikunterricht rezitieren", ar: "القراءة في درس النحو فقط" },
          ],
          answer: 1,
          explain: { en: "Dhikr is remembrance of Allah, in words and in the heart.", de: "Dhikr ist das Gedenken an Allah in Worten und im Herzen.", ar: "الذكر استحضار الله قولًا وقلبًا." },
        },
        {
          q: { en: "Which verse describes Allah as near and answering the caller?", de: "Welcher Vers beschreibt Allah als nah und antwortend?", ar: "أي آية تصف الله بالقرب وإجابة الداعي؟" },
          options: [
            { en: "1:1", de: "1:1", ar: "1:1" },
            { en: "112:1", de: "112:1", ar: "112:1" },
            { en: "2:186", de: "2:186", ar: "2:186" },
            { en: "108:1", de: "108:1", ar: "108:1" },
          ],
          answer: 2,
          explain: { en: "2:186 comes within the verses on fasting.", de: "2:186 steht inmitten der Verse über das Fasten.", ar: "تقع 2:186 في سياق آيات الصيام." },
        },
        {
          q: { en: "Which is part of the etiquette of dua?", de: "Was gehört zur Etikette der Dua?", ar: "أيها من آداب الدعاء؟" },
          options: [
            { en: "Giving up quickly", de: "Schnell aufgeben", ar: "ترك الدعاء سريعًا" },
            { en: "Asking doubtfully", de: "Zweifelnd bitten", ar: "السؤال بتردد" },
            { en: "Ignoring halal earnings", de: "Erlaubten Erwerb missachten", ar: "إهمال طيب المكسب" },
            { en: "Beginning with praise of Allah", de: "Mit dem Lob Allahs beginnen", ar: "البدء بحمد الله" },
          ],
          answer: 3,
          explain: { en: "Praise of Allah and blessings on the Prophet open the dua.", de: "Lob Allahs und Segensgruß eröffnen die Dua.", ar: "يُفتتح الدعاء بالحمد والصلاة على النبي." },
        },
      ],
    },
    {
      id: "d02-morning-evening",
      title: { en: "Morning and evening adhkar", de: "Morgen- und Abend-Adhkar", ar: "أذكار الصباح والمساء" },
      body: {
        en: "The Quran repeatedly asks believers to glorify Allah at the beginning and the end of the day (for example 33:41-42). The morning adhkar are said after Fajr until sunrise or late morning, the evening adhkar after Asr or after Maghrib; scholars give different time windows.\n\n## Core elements\n- **Ayat al-Kursi** (2:255), the greatest verse, a declaration of Allah's life, knowledge and sovereignty, recited for protection.\n- **The last two verses of al-Baqarah** (2:285-286), about faith in all messengers and asking not to be burdened beyond capacity; reported as sufficient for the one who recites them at night.\n- **The three Quls**: al-Ikhlas (112), al-Falaq (113) and an-Nas (114), each recited three times morning and evening for protection.\n- Sayyid al-Istighfar, the master formula of seeking forgiveness, and short formulas of praise and protection.\n\nThe full set with counts is in the app's **duas screen**. Consistency matters more than quantity: a short set said daily is better than a long one said rarely.",
        de: "Der Koran fordert die Gläubigen wiederholt auf, Allah am Anfang und am Ende des Tages zu preisen (zum Beispiel 33:41-42). Die Morgen-Adhkar werden nach dem Fadschr bis zum Sonnenaufgang oder Vormittag gesprochen, die Abend-Adhkar nach dem Asr oder nach dem Maghrib; die Gelehrten nennen unterschiedliche Zeitfenster.\n\n## Kernelemente\n- **Ayat al-Kursi** (2:255), der gewaltigste Vers, ein Bekenntnis zu Allahs Leben, Wissen und Herrschaft, zum Schutz rezitiert.\n- **Die letzten zwei Verse von al-Baqara** (2:285-286) über den Glauben an alle Gesandten und die Bitte, nicht über die eigene Kraft belastet zu werden; überliefert als genügend für den, der sie nachts rezitiert.\n- **Die drei Quls**: al-Ikhlas (112), al-Falaq (113) und an-Nas (114), morgens und abends je dreimal zum Schutz.\n- Sayyid al-Istighfar, die Hauptformel der Vergebungsbitte, sowie kurze Formeln des Lobes und des Schutzes.\n\nDie vollständige Sammlung mit Anzahl finden Sie im **Dua-Bereich** der App. Beständigkeit zählt mehr als Menge.",
        ar: "يدعو القرآن المؤمنين مرارًا إلى تسبيح الله في أول النهار وآخره (مثل 33:41-42). وتُقال أذكار الصباح بعد الفجر إلى طلوع الشمس أو الضحى، وأذكار المساء بعد العصر أو بعد المغرب، وللعلماء أقوال في وقتها.\n\n## أهم عناصرها\n- **آية الكرسي** (2:255)، أعظم آية، فيها إثبات حياة الله وعلمه وملكه، تُقرأ للحفظ.\n- **خاتمة سورة البقرة** (2:285-286)، في الإيمان بجميع الرسل وسؤال عدم التحميل فوق الطاقة، وورد أنها تكفي من قرأها في ليلة.\n- **المعوذات الثلاث**: الإخلاص (112) والفلق (113) والناس (114)، ثلاث مرات صباحًا ومساءً للتحصن.\n- سيد الاستغفار وصيغ قصيرة للتسبيح والتحصين.\n\nتجد المجموعة كاملة بأعدادها في **شاشة الأدعية**. والمداومة أهم من الكثرة: قليل دائم خير من كثير منقطع.",
      },
      verses: ["33:41", "33:42", "2:255", "2:285", "2:286", "112:1", "113:1", "114:1"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "Which verse is Ayat al-Kursi?", de: "Welcher Vers ist Ayat al-Kursi?", ar: "ما رقم آية الكرسي؟" },
          options: [
            { en: "2:255", de: "2:255", ar: "2:255" },
            { en: "2:286", de: "2:286", ar: "2:286" },
            { en: "3:8", de: "3:8", ar: "3:8" },
            { en: "36:1", de: "36:1", ar: "36:1" },
          ],
          answer: 0,
          explain: { en: "Ayat al-Kursi is verse 255 of al-Baqarah.", de: "Ayat al-Kursi ist Vers 255 von al-Baqara.", ar: "آية الكرسي هي الآية 255 من البقرة." },
        },
        {
          q: { en: "Which surahs are the three Quls?", de: "Welche Suren sind die drei Quls?", ar: "ما السور الثلاث المعروفة بالمعوذات؟" },
          options: [
            { en: "1, 2 and 3", de: "1, 2 und 3", ar: "1 و2 و3" },
            { en: "36, 55 and 67", de: "36, 55 und 67", ar: "36 و55 و67" },
            { en: "112, 113 and 114", de: "112, 113 und 114", ar: "112 و113 و114" },
            { en: "97, 98 and 99", de: "97, 98 und 99", ar: "97 و98 و99" },
          ],
          answer: 2,
          explain: { en: "al-Ikhlas, al-Falaq and an-Nas close the Quran.", de: "al-Ikhlas, al-Falaq und an-Nas schließen den Koran ab.", ar: "الإخلاص والفلق والناس خاتمة المصحف." },
        },
        {
          q: { en: "What matters most in daily adhkar?", de: "Was zählt bei täglichen Adhkar am meisten?", ar: "ما الأهم في الأذكار اليومية؟" },
          options: [
            { en: "Saying them only once a year", de: "Sie nur einmal im Jahr sprechen", ar: "قولها مرة في السنة" },
            { en: "Consistency", de: "Beständigkeit", ar: "المداومة" },
            { en: "Saying them as loudly as possible", de: "Sie möglichst laut sprechen", ar: "رفع الصوت بها قدر الإمكان" },
            { en: "Only reading about them", de: "Nur über sie lesen", ar: "القراءة عنها فقط" },
          ],
          answer: 1,
          explain: { en: "A small, regular practice is preferred.", de: "Eine kleine, regelmäßige Praxis ist vorzuziehen.", ar: "العمل القليل الدائم أحب." },
        },
      ],
    },
    {
      id: "d03-after-prayer",
      title: { en: "Adhkar after prayer", de: "Adhkar nach dem Gebet", ar: "الأذكار بعد الصلاة" },
      body: {
        en: "After the obligatory prayer the Prophet would remain seated for a short time in remembrance. The Quran also links prayer and remembrance: once the prayer is finished, believers remember Allah standing, sitting and lying down (4:103).\n\n## A typical sequence\n- Seeking forgiveness three times.\n- A short formula asking Allah, the Source of peace, for peace.\n- Glorification, praise and magnification of Allah, each said a set number of times, with a completing declaration of oneness; the reported counts are in the duas screen.\n- **Ayat al-Kursi** (2:255) after each prayer.\n- The three Quls (112-114), with some reports specifying repetition after Fajr and Maghrib.\n- A dua for help in remembering, thanking and worshipping Allah well.\n\nWhether these are said aloud or silently, and whether a collective dua follows, differs between communities and schools. Counting on the fingers is widely practised; others use beads. The aim is a calm transition from prayer back into daily life, carrying the presence of the prayer with you.",
        de: "Nach dem Pflichtgebet blieb der Prophet kurz im Gedenken sitzen. Auch der Koran verbindet Gebet und Gedenken: Nach dem Gebet gedenken die Gläubigen Allahs im Stehen, Sitzen und Liegen (4:103).\n\n## Eine übliche Abfolge\n- Dreimal um Vergebung bitten.\n- Eine kurze Formel, mit der man Allah, die Quelle des Friedens, um Frieden bittet.\n- Preisung, Lob und Großpreisung Allahs, jeweils in überlieferter Anzahl, abgeschlossen mit einem Bekenntnis Seiner Einheit; die Anzahl steht im Dua-Bereich.\n- **Ayat al-Kursi** (2:255) nach jedem Gebet.\n- Die drei Quls (112-114), nach manchen Überlieferungen wiederholt nach Fadschr und Maghrib.\n- Eine Bitte um Hilfe, Allahs zu gedenken, Ihm zu danken und Ihn gut anzubeten.\n\nOb dies laut oder leise geschieht und ob ein gemeinsames Bittgebet folgt, unterscheidet sich zwischen Gemeinden und Rechtsschulen. Viele zählen an den Fingern, andere mit einer Gebetskette. Ziel ist ein ruhiger Übergang vom Gebet in den Alltag.",
        ar: "كان النبي يمكث بعد الفريضة قليلًا ذاكرًا لله. ويربط القرآن بين الصلاة والذكر: فإذا قُضيت الصلاة ذكر المؤمنون الله قيامًا وقعودًا وعلى جنوبهم (4:103).\n\n## ترتيب شائع\n- الاستغفار ثلاثًا.\n- صيغة قصيرة يُسأل فيها الله السلام، وهو السلام ومنه السلام.\n- التسبيح والتحميد والتكبير بعدد مأثور، ويُختم بالتهليل؛ والأعداد في شاشة الأدعية.\n- **آية الكرسي** (2:255) دبر كل صلاة.\n- المعوذات (112-114)، وورد تكرارها بعد الفجر والمغرب في بعض الروايات.\n- دعاء بالإعانة على الذكر والشكر وحسن العبادة.\n\nويختلف الناس والمذاهب في الجهر والإسرار وفي الدعاء الجماعي بعد الصلاة. ويعقد كثيرون التسبيح بالأصابع، ويستعمل آخرون السبحة. والمقصود انتقال هادئ من الصلاة إلى الحياة مع بقاء أثرها.",
      },
      verses: ["4:103", "2:255"],
      tags: ["varies"],
      quiz: [
        {
          q: { en: "Which verse is recited after each prayer according to this lesson?", de: "Welcher Vers wird laut dieser Lektion nach jedem Gebet rezitiert?", ar: "أي آية تُقرأ دبر كل صلاة بحسب الدرس؟" },
          options: [
            { en: "2:183", de: "2:183", ar: "2:183" },
            { en: "97:1", de: "97:1", ar: "97:1" },
            { en: "3:97", de: "3:97", ar: "3:97" },
            { en: "2:255", de: "2:255", ar: "2:255" },
          ],
          answer: 3,
          explain: { en: "Ayat al-Kursi (2:255) is reported after the prayers.", de: "Ayat al-Kursi (2:255) ist nach den Gebeten überliefert.", ar: "ورد قراءة آية الكرسي (2:255) دبر الصلوات." },
        },
        {
          q: { en: "What usually comes first after the salam?", de: "Was kommt nach dem Salam meist zuerst?", ar: "ما الذي يأتي عادة أولًا بعد السلام؟" },
          options: [
            { en: "Seeking forgiveness three times", de: "Dreimal um Vergebung bitten", ar: "الاستغفار ثلاثًا" },
            { en: "Leaving immediately", de: "Sofort gehen", ar: "الانصراف فورًا" },
            { en: "Reciting al-Baqarah fully", de: "Al-Baqara vollständig rezitieren", ar: "قراءة البقرة كاملة" },
            { en: "Making the adhan", de: "Den Adhan rufen", ar: "رفع الأذان" },
          ],
          answer: 0,
          explain: { en: "Istighfar three times opens the post-prayer adhkar.", de: "Dreimaliger Istighfar eröffnet die Adhkar nach dem Gebet.", ar: "يُفتتح الذكر بعد الصلاة بالاستغفار ثلاثًا." },
        },
        {
          q: { en: "What differs between communities?", de: "Was unterscheidet sich zwischen Gemeinden?", ar: "ما الذي يختلف بين الجماعات؟" },
          options: [
            { en: "Whether Allah is one", de: "Ob Allah einer ist", ar: "وحدانية الله" },
            { en: "Saying adhkar aloud or silently", de: "Adhkar laut oder leise sprechen", ar: "الجهر بالأذكار أو الإسرار" },
            { en: "The number of daily prayers", de: "Die Zahl der täglichen Gebete", ar: "عدد الصلوات اليومية" },
            { en: "Whether dhikr is good", de: "Ob Dhikr gut ist", ar: "فضل الذكر" },
          ],
          answer: 1,
          explain: { en: "Volume and collective dua vary; the value of dhikr does not.", de: "Lautstärke und gemeinsames Bittgebet variieren, der Wert des Dhikr nicht.", ar: "يختلف الجهر والدعاء الجماعي، لا فضل الذكر." },
        },
      ],
    },
    {
      id: "d04-sleep-waking",
      title: { en: "Before sleep and on waking", de: "Vor dem Schlafen und beim Aufwachen", ar: "عند النوم والاستيقاظ" },
      body: {
        en: "Sleep is described in the Quran as a sign of Allah and a kind of taking of the soul, which He returns to whom He wills (39:42). The adhkar around sleep reflect this: one entrusts oneself to Allah before sleeping and thanks Him for life on waking.\n\n## Before sleep\n- Making wudu and lying on the right side are reported sunnahs.\n- Blowing lightly into the cupped hands, reciting the three Quls (112-114) and wiping over the body, three times.\n- **Ayat al-Kursi** (2:255) for protection through the night.\n- The last two verses of al-Baqarah (2:285-286).\n- Glorification, praise and magnification a set number of times, which the Prophet recommended to Ali and Fatimah instead of a servant.\n- A short dua in which one dies and lives by Allah's name.\n\n## On waking\n- Thanking Allah for returning life after a kind of death.\n- Some read the last verses of Al Imran (3:190-194) when rising for the night prayer.\n\nThe exact wordings are in the duas screen.",
        de: "Der Schlaf wird im Koran als Zeichen Allahs und als eine Art Abberufung der Seele beschrieben, die Er zurückgibt, wem Er will (39:42). Die Adhkar rund um den Schlaf spiegeln dies wider: Vor dem Schlafen vertraut man sich Allah an, beim Aufwachen dankt man Ihm für das Leben.\n\n## Vor dem Schlafen\n- Wudu und das Liegen auf der rechten Seite sind überlieferte Sunna.\n- Leicht in die hohlen Hände hauchen, die drei Quls (112-114) rezitieren und über den Körper streichen, dreimal.\n- **Ayat al-Kursi** (2:255) zum Schutz in der Nacht.\n- Die letzten zwei Verse von al-Baqara (2:285-286).\n- Preisung, Lob und Großpreisung in bestimmter Anzahl, die der Prophet Ali und Fatima anstelle eines Dieners empfahl.\n- Eine kurze Bitte, mit Allahs Namen zu sterben und zu leben.\n\n## Beim Aufwachen\n- Allah danken, dass Er das Leben nach einer Art Tod zurückgab.\n- Manche lesen beim Aufstehen zum Nachtgebet die letzten Verse von Al Imran (3:190-194).\n\nDie genauen Wortlaute finden Sie im Dua-Bereich.",
        ar: "يصف القرآن النوم آيةً من آيات الله ونوعًا من التوفي، يرسل الله بعده الأنفس إلى أجل مسمى (39:42). وتعكس أذكار النوم ذلك: يُسلم العبد نفسه لله قبل النوم، ويشكره على الحياة عند الاستيقاظ.\n\n## قبل النوم\n- الوضوء والاضطجاع على الشق الأيمن من السنن المأثورة.\n- النفث في الكفين وقراءة المعوذات (112-114) والمسح بهما على الجسد ثلاثًا.\n- **آية الكرسي** (2:255) للحفظ في الليل.\n- خاتمة البقرة (2:285-286).\n- التسبيح والتحميد والتكبير بعدد مأثور، أرشد إليه النبي عليًا وفاطمة بدل الخادم.\n- دعاء قصير بالموت والحياة باسم الله.\n\n## عند الاستيقاظ\n- حمد الله على إعادة الحياة بعد الموتة الصغرى.\n- ويقرأ بعضهم أواخر آل عمران (3:190-194) عند القيام لصلاة الليل.\n\nالألفاظ كاملة في شاشة الأدعية.",
      },
      verses: ["39:42", "2:255", "2:285", "2:286", "3:190"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "Which verse describes sleep as a taking of the soul?", de: "Welcher Vers beschreibt den Schlaf als Abberufung der Seele?", ar: "أي آية تصف النوم بالتوفي؟" },
          options: [
            { en: "2:201", de: "2:201", ar: "2:201" },
            { en: "20:114", de: "20:114", ar: "20:114" },
            { en: "39:42", de: "39:42", ar: "39:42" },
            { en: "97:3", de: "97:3", ar: "97:3" },
          ],
          answer: 2,
          explain: { en: "39:42 speaks of souls taken at death and in sleep.", de: "39:42 spricht von Seelen, die im Tod und im Schlaf abberufen werden.", ar: "تتحدث 39:42 عن توفي الأنفس عند الموت وفي المنام." },
        },
        {
          q: { en: "Which side is reported for lying down?", de: "Auf welcher Seite legt man sich laut Überlieferung?", ar: "على أي شق ورد الاضطجاع؟" },
          options: [
            { en: "The left side", de: "Die linke Seite", ar: "الشق الأيسر" },
            { en: "The right side", de: "Die rechte Seite", ar: "الشق الأيمن" },
            { en: "On the stomach", de: "Auf dem Bauch", ar: "على البطن" },
            { en: "Sitting upright", de: "Aufrecht sitzend", ar: "جالسًا" },
          ],
          answer: 1,
          explain: { en: "Lying on the right side is a reported sunnah.", de: "Das Liegen auf der rechten Seite ist überlieferte Sunna.", ar: "الاضطجاع على الأيمن سنة مأثورة." },
        },
        {
          q: { en: "What is the first remembrance on waking?", de: "Was ist das erste Gedenken beim Aufwachen?", ar: "ما أول ذكر عند الاستيقاظ؟" },
          options: [
            { en: "Thanking Allah for returning life", de: "Allah für das zurückgegebene Leben danken", ar: "حمد الله على إعادة الحياة" },
            { en: "Checking the phone", de: "Das Telefon prüfen", ar: "تفقد الهاتف" },
            { en: "The farewell tawaf", de: "Der Abschieds-Tawaf", ar: "طواف الوداع" },
            { en: "Zakat al-fitr", de: "Zakat al-Fitr", ar: "زكاة الفطر" },
          ],
          answer: 0,
          explain: { en: "Waking is met with praise for being given life again.", de: "Beim Aufwachen lobt man Allah für das neue Leben.", ar: "يُستقبل الاستيقاظ بالحمد على الحياة." },
        },
      ],
    },
    {
      id: "d05-daily-life",
      title: { en: "Eating, home and travel", de: "Essen, Zuhause und Reise", ar: "الطعام والبيت والسفر" },
      body: {
        en: "Islam connects ordinary actions with remembrance so that the whole day becomes worship. Short adhkar mark the beginnings and endings of everyday activities.\n\n## Eating and drinking\n- Saying Allah's name before eating; if forgotten, saying it when remembered.\n- Eating with the right hand and from what is nearest.\n- Praising Allah after the meal for the food and drink He provided.\n\n## Leaving and entering home\n- On leaving: relying on Allah and seeking His protection from going astray or wronging anyone.\n- On entering: mentioning Allah's name and greeting the household; the Quran itself instructs greeting when entering houses (24:61).\n- Entering and leaving the mosque and the toilet have their own short supplications.\n\n## Travel\n- The Quran teaches a praise of Allah when mounting a means of transport, recognising that He made it subservient (43:13-14).\n- The travel dua asks for righteousness, ease and protection for family and property, and is said again on returning.\n\nAll wordings are in the duas screen, sorted by occasion.",
        de: "Der Islam verbindet alltägliche Handlungen mit dem Gedenken, sodass der ganze Tag zum Gottesdienst wird. Kurze Adhkar markieren Beginn und Ende alltäglicher Tätigkeiten.\n\n## Essen und Trinken\n- Vor dem Essen den Namen Allahs nennen; wer es vergisst, holt es nach, sobald er sich erinnert.\n- Mit der rechten Hand und vom Nächstliegenden essen.\n- Nach dem Essen Allah für Speise und Trank loben.\n\n## Haus verlassen und betreten\n- Beim Verlassen: auf Allah vertrauen und Schutz davor suchen, in die Irre zu gehen oder jemandem Unrecht zu tun.\n- Beim Betreten: Allahs Namen nennen und die Hausbewohner grüßen; der Koran selbst gebietet den Gruß beim Betreten von Häusern (24:61).\n- Moschee und Toilette haben eigene kurze Bittgebete.\n\n## Reise\n- Der Koran lehrt ein Lob Allahs beim Besteigen eines Verkehrsmittels, das Er dienstbar gemacht hat (43:13-14).\n- Das Reisegebet bittet um Rechtschaffenheit, Erleichterung und Schutz für Familie und Besitz und wird bei der Rückkehr wiederholt.\n\nAlle Wortlaute stehen im Dua-Bereich, nach Anlass sortiert.",
        ar: "يربط الإسلام الأفعال اليومية بالذكر حتى يصير اليوم كله عبادة. وتفتتح أذكار قصيرة الأعمال اليومية وتختمها.\n\n## الطعام والشراب\n- التسمية قبل الأكل، ومن نسي سمّى حين يذكر.\n- الأكل باليمين ومما يليه.\n- حمد الله بعد الطعام على ما رزق من طعام وشراب.\n\n## الخروج من البيت ودخوله\n- عند الخروج: التوكل على الله والاستعاذة من الضلال والظلم.\n- عند الدخول: ذكر اسم الله والسلام على أهل البيت؛ وقد أمر القرآن بالتسليم عند دخول البيوت (24:61).\n- وللمسجد والخلاء أدعية قصيرة خاصة.\n\n## السفر\n- يعلّم القرآن تسبيح الله عند ركوب الدابة أو المركبة اعترافًا بتسخيرها (43:13-14).\n- ودعاء السفر يسأل البر والتقوى والتيسير وحفظ الأهل والمال، ويُعاد عند الرجوع.\n\nجميع الألفاظ في شاشة الأدعية مرتبة بحسب المناسبة.",
      },
      verses: ["24:61", "43:13", "43:14"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "What if you forget Allah's name before eating?", de: "Was tun, wenn man vor dem Essen den Namen Allahs vergisst?", ar: "ماذا يفعل من نسي التسمية قبل الأكل؟" },
          options: [
            { en: "Stop eating entirely", de: "Ganz aufhören zu essen", ar: "يترك الطعام كليًا" },
            { en: "Nothing can be done", de: "Man kann nichts tun", ar: "لا شيء" },
            { en: "Say it when you remember", de: "Es nachholen, sobald man sich erinnert", ar: "يسمي حين يذكر" },
            { en: "Fast the next day", de: "Am nächsten Tag fasten", ar: "يصوم اليوم التالي" },
          ],
          answer: 2,
          explain: { en: "It is made up when remembered.", de: "Man holt es nach, sobald man sich erinnert.", ar: "يُستدرك عند التذكر." },
        },
        {
          q: { en: "Which verses teach praise when mounting transport?", de: "Welche Verse lehren das Lob beim Besteigen eines Verkehrsmittels?", ar: "أي آيات تعلّم الذكر عند الركوب؟" },
          options: [
            { en: "43:13-14", de: "43:13-14", ar: "43:13-14" },
            { en: "2:183-185", de: "2:183-185", ar: "2:183-185" },
            { en: "97:1-5", de: "97:1-5", ar: "97:1-5" },
            { en: "112:1-4", de: "112:1-4", ar: "112:1-4" },
          ],
          answer: 0,
          explain: { en: "az-Zukhruf 13-14 mention the means of travel made subservient.", de: "az-Zukhruf 13-14 nennen die dienstbar gemachten Reisemittel.", ar: "تذكر الزخرف 13-14 تسخير المركب." },
        },
        {
          q: { en: "What does the Quran instruct when entering houses (24:61)?", de: "Was gebietet der Koran beim Betreten von Häusern (24:61)?", ar: "بم يأمر القرآن عند دخول البيوت (24:61)؟" },
          options: [
            { en: "Silence", de: "Schweigen", ar: "السكوت" },
            { en: "Fasting", de: "Fasten", ar: "الصيام" },
            { en: "Giving zakat", de: "Zakat geben", ar: "إخراج الزكاة" },
            { en: "Greeting with peace", de: "Den Friedensgruß", ar: "التسليم" },
          ],
          answer: 3,
          explain: { en: "The verse instructs greeting one another.", de: "Der Vers gebietet, einander zu grüßen.", ar: "تأمر الآية بالتسليم." },
        },
      ],
    },
    {
      id: "d06-quran-duas",
      title: { en: "Duas from the Quran", de: "Bittgebete aus dem Koran", ar: "أدعية من القرآن" },
      body: {
        en: "Many of the most beloved duas are verses of the Quran, often beginning with \"Rabbana\" (our Lord) or \"Rabbi\" (my Lord). Reading them in context shows who made them and why.\n\n## A selection by key\n- **2:201**: asking for good in this world, good in the Hereafter and protection from the Fire; a comprehensive dua the Prophet made often.\n- **2:286**: asking not to be held to account for forgetting and mistakes and not to be burdened beyond capacity.\n- **3:8**: asking that hearts not deviate after guidance and for mercy.\n- **14:40-41**: Ibrahim asking to establish prayer with his descendants, and for forgiveness for himself, his parents and the believers.\n- **20:114**: a short dua for increase in knowledge.\n- **25:74**: asking for spouses and children who are a comfort to the eyes, and to be leaders for the God-fearing.\n- **17:24**: mercy for one's parents.\n\nMany scholars discourage reciting Quranic verses in ruku and sujud of the prayer; outside prayer, and in the sitting before the salam, these duas are widely used. Texts are shown as verse cards and in the duas screen.",
        de: "Viele der beliebtesten Bittgebete sind Koranverse, oft beginnend mit „Rabbana“ (unser Herr) oder „Rabbi“ (mein Herr). Im Zusammenhang gelesen zeigen sie, wer sie sprach und warum.\n\n## Eine Auswahl nach Vers\n- **2:201**: Bitte um Gutes in dieser Welt, Gutes im Jenseits und Schutz vor dem Feuer; ein umfassendes Bittgebet, das der Prophet oft sprach.\n- **2:286**: Bitte, für Vergessen und Fehler nicht zur Rechenschaft gezogen und nicht über die eigene Kraft belastet zu werden.\n- **3:8**: Bitte, dass die Herzen nach der Rechtleitung nicht abweichen, und um Barmherzigkeit.\n- **14:40-41**: Ibrahim bittet, mit seinen Nachkommen das Gebet zu verrichten, und um Vergebung für sich, seine Eltern und die Gläubigen.\n- **20:114**: kurze Bitte um mehr Wissen.\n- **25:74**: Bitte um Ehepartner und Kinder, die Freude der Augen sind.\n- **17:24**: Barmherzigkeit für die Eltern.\n\nViele Gelehrte raten davon ab, Koranverse in Verbeugung und Niederwerfung zu rezitieren; außerhalb des Gebets und im Sitzen vor dem Salam sind sie weit verbreitet. Die Texte erscheinen als Verskarten und im Dua-Bereich.",
        ar: "كثير من أحب الأدعية آيات من القرآن، يبدأ كثير منها بـ«ربنا» أو «رب». وقراءتها في سياقها تبيّن من دعا بها ولماذا.\n\n## مختارات بأرقام الآيات\n- **2:201**: سؤال حسنة الدنيا وحسنة الآخرة والوقاية من النار، دعاء جامع كان النبي يكثر منه.\n- **2:286**: سؤال عدم المؤاخذة بالنسيان والخطأ وعدم التحميل فوق الطاقة.\n- **3:8**: سؤال ألا تزيغ القلوب بعد الهداية وطلب الرحمة.\n- **14:40-41**: دعاء إبراهيم بإقامة الصلاة له ولذريته والمغفرة له ولوالديه وللمؤمنين.\n- **20:114**: دعاء قصير بزيادة العلم.\n- **25:74**: سؤال أزواج وذريات تقر بهم الأعين.\n- **17:24**: الرحمة للوالدين.\n\nويكره كثير من العلماء قراءة القرآن في الركوع والسجود؛ أما خارج الصلاة وفي الجلوس قبل السلام فيكثر الدعاء بها. تظهر النصوص بطاقاتٍ للآيات وفي شاشة الأدعية.",
      },
      verses: ["2:201", "2:286", "3:8", "14:40", "14:41", "20:114", "25:74", "17:24"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "Which verse asks for an increase in knowledge?", de: "Welcher Vers bittet um mehr Wissen?", ar: "أي آية فيها سؤال زيادة العلم؟" },
          options: [
            { en: "2:201", de: "2:201", ar: "2:201" },
            { en: "25:74", de: "25:74", ar: "25:74" },
            { en: "3:8", de: "3:8", ar: "3:8" },
            { en: "20:114", de: "20:114", ar: "20:114" },
          ],
          answer: 3,
          explain: { en: "20:114 is the short dua for knowledge.", de: "20:114 ist die kurze Bitte um Wissen.", ar: "20:114 دعاء زيادة العلم." },
        },
        {
          q: { en: "Whose dua is in 14:40-41?", de: "Wessen Bittgebet steht in 14:40-41?", ar: "دعاء من في 14:40-41؟" },
          options: [
            { en: "Musa", de: "Musa", ar: "موسى" },
            { en: "Ibrahim", de: "Ibrahim", ar: "إبراهيم" },
            { en: "Yunus", de: "Yunus", ar: "يونس" },
            { en: "Isa", de: "Isa", ar: "عيسى" },
          ],
          answer: 1,
          explain: { en: "Surah Ibrahim records his dua for prayer and forgiveness.", de: "Sure Ibrahim überliefert seine Bitte um Gebet und Vergebung.", ar: "تحكي سورة إبراهيم دعاءه بالصلاة والمغفرة." },
        },
        {
          q: { en: "What does 25:74 ask for?", de: "Worum bittet 25:74?", ar: "ماذا تسأل 25:74؟" },
          options: [
            { en: "Spouses and children who are a comfort", de: "Ehepartner und Kinder als Freude der Augen", ar: "أزواج وذريات قرة أعين" },
            { en: "Rain", de: "Regen", ar: "المطر" },
            { en: "Victory in battle", de: "Sieg im Kampf", ar: "النصر في القتال" },
            { en: "Wealth only", de: "Nur Reichtum", ar: "المال فقط" },
          ],
          answer: 0,
          explain: { en: "It is a dua of the servants of the Most Merciful for their families.", de: "Es ist ein Gebet der Diener des Allerbarmers für ihre Familien.", ar: "دعاء عباد الرحمن لأهليهم." },
        },
      ],
    },
    {
      id: "d07-accepted-times",
      title: { en: "Times when duas are accepted", de: "Zeiten, in denen Bittgebete erhört werden", ar: "أوقات الإجابة" },
      body: {
        en: "Allah hears every dua at every time, yet the hadith literature names moments and states in which the response is especially hoped for. Scholars collected these to encourage, not to restrict.\n\n## Commonly mentioned times\n- The last third of the night, when the Prophet described Allah as calling out to those who ask.\n- Between the adhan and the iqamah.\n- In prostration, the closest a servant is to his Lord.\n- An hour on Friday; scholars differ whether it is during the sermon and prayer or in the last hour before Maghrib.\n- While fasting and at the time of breaking the fast.\n- On the day of Arafah, the best dua of the year.\n- Laylat al-Qadr.\n- While travelling, when it rains, and the dua of the oppressed.\n- The dua of parents for their children and of a Muslim for an absent brother or sister.\n\n## States\nNeed, humility, sincerity, repentance and halal earnings are repeatedly linked to acceptance. Acceptance can take the form of the request, of a harm averted or of reward kept for the Hereafter.",
        de: "Allah hört jedes Bittgebet zu jeder Zeit, doch die Hadithliteratur nennt Momente und Zustände, in denen die Erhörung besonders erhofft wird. Die Gelehrten sammelten sie als Ansporn, nicht als Einschränkung.\n\n## Häufig genannte Zeiten\n- Das letzte Drittel der Nacht, in dem Allah nach der Beschreibung des Propheten die Bittenden ruft.\n- Zwischen Adhan und Iqama.\n- In der Niederwerfung, wenn der Diener seinem Herrn am nächsten ist.\n- Eine Stunde am Freitag; ob während Predigt und Gebet oder in der letzten Stunde vor dem Maghrib, ist umstritten.\n- Beim Fasten und beim Fastenbrechen.\n- Der Tag von Arafa, das beste Bittgebet des Jahres.\n- Laylat al-Qadr.\n- Auf Reisen, bei Regen und das Bittgebet des Unterdrückten.\n- Das Bittgebet der Eltern für ihre Kinder und eines Muslims für einen abwesenden Bruder oder eine Schwester.\n\n## Zustände\nBedürftigkeit, Demut, Aufrichtigkeit, Reue und erlaubter Erwerb werden immer wieder mit der Erhörung verbunden. Die Erhörung kann das Erbetene sein, ein abgewendetes Übel oder ein Lohn im Jenseits.",
        ar: "يسمع الله كل دعاء في كل وقت، غير أن السنة ذكرت أوقاتًا وأحوالًا تُرجى فيها الإجابة أكثر. وجمعها العلماء ترغيبًا لا تقييدًا.\n\n## أوقات مشهورة\n- الثلث الأخير من الليل، حين وصف النبي نزول الرب ونداءه للسائلين.\n- بين الأذان والإقامة.\n- في السجود، أقرب ما يكون العبد من ربه.\n- ساعة يوم الجمعة؛ واختلف العلماء أهي وقت الخطبة والصلاة أم آخر ساعة قبل المغرب.\n- حال الصيام وعند الفطر.\n- يوم عرفة، خير الدعاء.\n- ليلة القدر.\n- في السفر وعند نزول المطر ودعوة المظلوم.\n- دعاء الوالد لولده ودعاء المسلم لأخيه بظهر الغيب.\n\n## الأحوال\nيرتبط الاضطرار والخشوع والإخلاص والتوبة وطيب المكسب بالإجابة. وتكون الإجابة بإعطاء المسؤول أو دفع سوء أو ادخار أجر في الآخرة.",
      },
      tags: ["varies"],
      quiz: [
        {
          q: { en: "Which part of the night is especially mentioned?", de: "Welcher Teil der Nacht wird besonders genannt?", ar: "أي جزء من الليل يُذكر خاصة؟" },
          options: [
            { en: "Right after Isha only", de: "Nur direkt nach dem Ischa", ar: "بعد العشاء مباشرة فقط" },
            { en: "Midnight exactly", de: "Genau Mitternacht", ar: "منتصف الليل تمامًا" },
            { en: "The last third", de: "Das letzte Drittel", ar: "الثلث الأخير" },
            { en: "The first hour", de: "Die erste Stunde", ar: "الساعة الأولى" },
          ],
          answer: 2,
          explain: { en: "The last third of the night is the time of descent described in hadith.", de: "Das letzte Drittel ist die in Hadithen beschriebene Zeit.", ar: "الثلث الأخير وقت النزول الوارد في الحديث." },
        },
        {
          q: { en: "Which day has the best dua of the year?", de: "An welchem Tag ist das beste Bittgebet des Jahres?", ar: "أي يوم فيه خير الدعاء؟" },
          options: [
            { en: "The day of Arafah", de: "Der Tag von Arafa", ar: "يوم عرفة" },
            { en: "The first of Muharram", de: "Der 1. Muharram", ar: "أول محرم" },
            { en: "Any Monday", de: "Jeder Montag", ar: "أي يوم اثنين" },
            { en: "The 15th of Sha'ban only", de: "Nur der 15. Schaban", ar: "منتصف شعبان فقط" },
          ],
          answer: 0,
          explain: { en: "The dua of Arafah is described as the best dua.", de: "Das Bittgebet von Arafa gilt als das beste.", ar: "دعاء يوم عرفة خير الدعاء." },
        },
        {
          q: { en: "What can acceptance of a dua look like?", de: "Wie kann die Erhörung aussehen?", ar: "كيف تكون الإجابة؟" },
          options: [
            { en: "Only exactly what was asked", de: "Nur genau das Erbetene", ar: "المسؤول بعينه فقط" },
            { en: "There is never a response", de: "Es gibt nie eine Antwort", ar: "لا إجابة أبدًا" },
            { en: "Only money", de: "Nur Geld", ar: "المال فقط" },
            { en: "The request, a harm averted or reward in the Hereafter", de: "Das Erbetene, ein abgewendetes Übel oder Lohn im Jenseits", ar: "المسؤول أو دفع سوء أو ادخار أجر" },
          ],
          answer: 3,
          explain: { en: "Scholars describe these three forms of response.", de: "Die Gelehrten beschreiben diese drei Formen.", ar: "ذكر العلماء هذه الصور الثلاث." },
        },
      ],
    },
    {
      id: "d08-istighfar-salawat",
      title: { en: "Istighfar and salawat", de: "Istighfar und Salawat", ar: "الاستغفار والصلاة على النبي" },
      body: {
        en: "## Istighfar\nSeeking forgiveness is a constant theme of the Quran. Nuh told his people that asking forgiveness brings rain, wealth and children (71:10-12), and Allah invites those who have wronged themselves not to despair of His mercy (39:53). The Prophet sought forgiveness many times each day although he was forgiven.\n\n**Sayyid al-Istighfar**, the master formula, affirms Allah's lordship, the servant's covenant, gratitude for blessings and admission of sin; it is reported with a great promise for the one who says it with certainty in the morning or evening (bukhari:6306). Its text is in the duas screen.\n\n## Salawat\nAllah and His angels send blessings on the Prophet, and the believers are commanded to do the same (33:56). The most complete form is the Abrahamic salat recited in the tashahhud. Salawat are especially encouraged on Fridays, when his name is mentioned and at the beginning and end of a dua.\n\nBoth practices are simple and possible at any time: walking, waiting, working.",
        de: "## Istighfar\nDie Bitte um Vergebung ist ein durchgängiges Thema des Korans. Nuh sagte seinem Volk, dass die Vergebungsbitte Regen, Besitz und Kinder bringt (71:10-12), und Allah lädt jene, die sich selbst Unrecht getan haben, ein, nicht an Seiner Barmherzigkeit zu verzweifeln (39:53). Der Prophet bat täglich vielfach um Vergebung, obwohl ihm vergeben war.\n\n**Sayyid al-Istighfar**, die Hauptformel, bekennt Allahs Herrschaft, den Bund des Dieners, Dankbarkeit für die Gaben und das Eingeständnis der Sünde; für den, der sie morgens oder abends mit Gewissheit spricht, ist eine große Verheißung überliefert (bukhari:6306). Der Text steht im Dua-Bereich.\n\n## Salawat\nAllah und Seine Engel segnen den Propheten, und den Gläubigen ist geboten, dasselbe zu tun (33:56). Die vollständigste Form ist der abrahamitische Segensgruß im Taschahhud. Salawat werden besonders am Freitag empfohlen, wenn sein Name erwähnt wird, und am Anfang und Ende eines Bittgebets.\n\nBeides ist einfach und jederzeit möglich: beim Gehen, Warten, Arbeiten.",
        ar: "## الاستغفار\nالاستغفار موضوع متكرر في القرآن. فقد أخبر نوح قومه أن الاستغفار سبب للمطر والأموال والبنين (71:10-12)، ويدعو الله الذين أسرفوا على أنفسهم ألا يقنطوا من رحمته (39:53). وكان النبي يستغفر في اليوم مرات كثيرة وقد غُفر له.\n\n**سيد الاستغفار** يتضمن الإقرار بربوبية الله وعهد العبد وشكر النعمة والاعتراف بالذنب، وورد فيه وعد عظيم لمن قاله موقنًا في الصباح أو المساء (bukhari:6306). والنص في شاشة الأدعية.\n\n## الصلاة على النبي\nإن الله وملائكته يصلون على النبي، وأُمر المؤمنون بذلك (33:56). وأكمل صيغها الصلاة الإبراهيمية في التشهد. ويُستحب الإكثار منها يوم الجمعة وعند ذكره وفي أول الدعاء وآخره.\n\nوكلاهما يسير في كل وقت: في المشي والانتظار والعمل.",
      },
      verses: ["71:10", "71:11", "71:12", "39:53", "33:56"],
      hadith: ["bukhari:6306"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "Which verse commands blessings on the Prophet?", de: "Welcher Vers gebietet den Segensgruß auf den Propheten?", ar: "أي آية تأمر بالصلاة على النبي؟" },
          options: [
            { en: "2:255", de: "2:255", ar: "2:255" },
            { en: "33:56", de: "33:56", ar: "33:56" },
            { en: "3:97", de: "3:97", ar: "3:97" },
            { en: "97:1", de: "97:1", ar: "97:1" },
          ],
          answer: 1,
          explain: { en: "33:56 states that Allah and His angels bless the Prophet.", de: "33:56 sagt, dass Allah und Seine Engel den Propheten segnen.", ar: "تذكر 33:56 صلاة الله وملائكته على النبي." },
        },
        {
          q: { en: "Which prophet linked istighfar with rain and provision?", de: "Welcher Prophet verband Istighfar mit Regen und Versorgung?", ar: "أي نبي ربط الاستغفار بالمطر والرزق؟" },
          options: [
            { en: "Yusuf", de: "Yusuf", ar: "يوسف" },
            { en: "Sulayman", de: "Sulayman", ar: "سليمان" },
            { en: "Nuh", de: "Nuh", ar: "نوح" },
            { en: "Dawud", de: "Dawud", ar: "داود" },
          ],
          answer: 2,
          explain: { en: "Surah Nuh 10-12.", de: "Sure Nuh 10-12.", ar: "سورة نوح 10-12." },
        },
        {
          q: { en: "What is Sayyid al-Istighfar?", de: "Was ist Sayyid al-Istighfar?", ar: "ما سيد الاستغفار؟" },
          options: [
            { en: "The master formula of seeking forgiveness", de: "Die Hauptformel der Vergebungsbitte", ar: "أفضل صيغ الاستغفار" },
            { en: "A surah of the Quran", de: "Eine Sure des Korans", ar: "سورة من القرآن" },
            { en: "A rite of Hajj", de: "Ein Ritus der Haddsch", ar: "منسك من مناسك الحج" },
            { en: "The call to prayer", de: "Der Gebetsruf", ar: "الأذان" },
          ],
          answer: 0,
          explain: { en: "It is reported in Sahih al-Bukhari (6306).", de: "Er ist in Sahih al-Bukhari (6306) überliefert.", ar: "رواه البخاري (6306)." },
        },
      ],
    },
  ],
};
