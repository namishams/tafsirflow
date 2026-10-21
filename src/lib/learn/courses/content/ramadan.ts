// mirrors mobile/src/features/courses/content/ramadan.ts (copied for the website; keep both in step)
import type { Course } from "../types";

// Ramadan. Descriptive; no Quran or hadith text is typed here, verses are loaded by key.

export const RAMADAN: Course = {
  id: "ramadan",
  word: "رمضان",
  free: 1,
  title: { en: "Ramadan", de: "Ramadan", ar: "رمضان" },
  lead: {
    en: "The month of fasting and the Quran: meaning, preparation, nights, zakat al-fitr and Eid.",
    de: "Der Monat des Fastens und des Korans: Bedeutung, Vorbereitung, Nächte, Zakat al-Fitr und Fest.",
    ar: "شهر الصيام والقرآن: معناه والاستعداد له ولياليه وزكاة الفطر والعيد.",
  },
  lessons: [
    {
      id: "r01-meaning",
      title: { en: "The meaning of Ramadan", de: "Die Bedeutung des Ramadan", ar: "معنى رمضان" },
      body: {
        en: "Ramadan is the ninth month of the lunar calendar. Its fast is one of the five pillars of Islam and is prescribed in a short passage of al-Baqarah.\n\n## 2:183-185 in brief\n- **2:183**: fasting was prescribed for the believers as it was for those before them, so that they may attain taqwa, God-consciousness.\n- **2:184**: it is a limited number of days; the sick and travellers make up missed days later, and those who can only fast with great hardship have a ransom of feeding the poor.\n- **2:185**: Ramadan is the month in which the Quran was sent down as guidance; whoever witnesses the month fasts it. Allah wants ease, not hardship, and wants the believers to complete the count and magnify Him.\n\nRight after these verses comes 2:186 on Allah's nearness to the one who calls, which connects fasting with dua.\n\nThe fast runs from true dawn to sunset and means abstaining from food, drink and marital relations, but its goal is broader: guarding the tongue, the eyes and the heart.",
        de: "Ramadan ist der neunte Monat des Mondkalenders. Sein Fasten ist eine der fünf Säulen des Islam und wird in einem kurzen Abschnitt von al-Baqara vorgeschrieben.\n\n## 2:183-185 in Kürze\n- **2:183**: Das Fasten wurde den Gläubigen vorgeschrieben wie denen vor ihnen, damit sie Taqwa, Gottesbewusstsein, erlangen.\n- **2:184**: Es sind gezählte Tage; Kranke und Reisende holen versäumte Tage nach, und wer nur unter großer Härte fasten kann, hat als Ersatz die Speisung eines Armen.\n- **2:185**: Ramadan ist der Monat, in dem der Koran als Rechtleitung herabgesandt wurde; wer den Monat erlebt, fastet ihn. Allah will Erleichterung, nicht Erschwernis, und dass die Gläubigen die Zahl vollenden und Ihn preisen.\n\nDirekt danach folgt 2:186 über Allahs Nähe zum Rufenden, was Fasten und Bittgebet verbindet.\n\nDas Fasten dauert von der wahren Morgendämmerung bis zum Sonnenuntergang und bedeutet Verzicht auf Essen, Trinken und ehelichen Verkehr. Sein Ziel ist jedoch weiter: Zunge, Augen und Herz zu hüten.",
        ar: "رمضان هو الشهر التاسع من التقويم القمري، وصيامه ركن من أركان الإسلام الخمسة، فُرض في مقطع قصير من سورة البقرة.\n\n## 2:183-185 باختصار\n- **2:183**: كُتب الصيام على المؤمنين كما كُتب على من قبلهم لعلهم يتقون.\n- **2:184**: أيام معدودات؛ يقضي المريض والمسافر ما أفطرا، ومن يصوم بمشقة شديدة فعليه فدية طعام مسكين.\n- **2:185**: رمضان الشهر الذي أُنزل فيه القرآن هدى للناس؛ فمن شهده فليصمه. يريد الله اليسر لا العسر، وأن يُكمل المؤمنون العدة ويكبّروه.\n\nوتأتي بعدها مباشرة 2:186 في قرب الله من الداعي، فيرتبط الصيام بالدعاء.\n\nيمتد الصيام من الفجر الصادق إلى غروب الشمس، بالإمساك عن الطعام والشراب والجماع، وغايته أوسع: حفظ اللسان والبصر والقلب.",
      },
      verses: ["2:183", "2:184", "2:185", "2:186"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "What goal of fasting does 2:183 name?", de: "Welches Ziel des Fastens nennt 2:183?", ar: "ما غاية الصيام في 2:183؟" },
          options: [
            { en: "Losing weight", de: "Abnehmen", ar: "إنقاص الوزن" },
            { en: "Taqwa, God-consciousness", de: "Taqwa, Gottesbewusstsein", ar: "التقوى" },
            { en: "Saving money", de: "Geld sparen", ar: "توفير المال" },
            { en: "Sleeping more", de: "Mehr schlafen", ar: "النوم أكثر" },
          ],
          answer: 1,
          explain: { en: "The verse ends with the hope of taqwa.", de: "Der Vers endet mit der Hoffnung auf Taqwa.", ar: "تُختم الآية بقوله لعلكم تتقون." },
        },
        {
          q: { en: "What was sent down in Ramadan according to 2:185?", de: "Was wurde laut 2:185 im Ramadan herabgesandt?", ar: "ماذا أُنزل في رمضان بحسب 2:185؟" },
          options: [
            { en: "The Torah", de: "Die Tora", ar: "التوراة" },
            { en: "Rain", de: "Regen", ar: "المطر" },
            { en: "The Quran", de: "Der Koran", ar: "القرآن" },
            { en: "The Kaaba", de: "Die Kaaba", ar: "الكعبة" },
          ],
          answer: 2,
          explain: { en: "Ramadan is the month of the Quran.", de: "Ramadan ist der Monat des Korans.", ar: "رمضان شهر القرآن." },
        },
        {
          q: { en: "What do the sick and travellers do?", de: "Was tun Kranke und Reisende?", ar: "ماذا يفعل المريض والمسافر؟" },
          options: [
            { en: "Make up the days later", de: "Die Tage später nachholen", ar: "يقضيان الأيام لاحقًا" },
            { en: "Fast twice as long", de: "Doppelt so lange fasten", ar: "يصومان ضعف المدة" },
            { en: "Nothing at all", de: "Gar nichts", ar: "لا شيء" },
            { en: "Perform Hajj instead", de: "Stattdessen Haddsch machen", ar: "يحجان بدلًا من ذلك" },
          ],
          answer: 0,
          explain: { en: "2:184-185 allow making up missed days.", de: "2:184-185 erlauben das Nachholen.", ar: "تبيح 2:184-185 القضاء." },
        },
      ],
    },
    {
      id: "r02-preparing",
      title: { en: "Preparing in Sha'ban", de: "Vorbereitung im Schaban", ar: "الاستعداد في شعبان" },
      body: {
        en: "Sha'ban, the month before Ramadan, is a time of preparation. The Prophet is reported to have fasted more in Sha'ban than in any other month apart from Ramadan, describing it as a month people neglect in which deeds are raised to Allah.\n\n## Practical preparation\n- **Make up missed fasts** from the previous Ramadan before the new one begins.\n- Gradually adjust sleep and eating, for example with occasional voluntary fasts on Mondays and Thursdays.\n- Set a realistic Quran plan for the month.\n- Plan work, family and rest so that the nights are free for prayer.\n- Reconcile with people and settle debts and disputes.\n- Learn the rulings of fasting: what breaks it, who is exempt, how to make up.\n\n## The start of the month\nThe month begins with the sighting of the new moon or the completion of thirty days of Sha'ban. Communities differ on local sighting, global sighting and astronomical calculation; it is common and accepted to follow the decision of one's local community or mosque. Avoid starting a fast on the day of doubt merely out of caution.",
        de: "Schaban, der Monat vor dem Ramadan, ist eine Zeit der Vorbereitung. Vom Propheten ist überliefert, dass er im Schaban mehr fastete als in jedem anderen Monat außer dem Ramadan, und dass er ihn als vernachlässigten Monat beschrieb, in dem die Taten zu Allah erhoben werden.\n\n## Praktische Vorbereitung\n- **Versäumte Fastentage** des letzten Ramadan vor Beginn des neuen nachholen.\n- Schlaf und Essen allmählich umstellen, etwa mit gelegentlichem freiwilligem Fasten am Montag und Donnerstag.\n- Einen realistischen Koran-Plan für den Monat festlegen.\n- Arbeit, Familie und Ruhe so planen, dass die Nächte für das Gebet frei sind.\n- Sich mit Menschen versöhnen, Schulden und Streitigkeiten regeln.\n- Die Regeln des Fastens lernen: was es bricht, wer befreit ist, wie man nachholt.\n\n## Der Monatsbeginn\nDer Monat beginnt mit der Sichtung des Neumonds oder nach dreißig Tagen Schaban. Gemeinden unterscheiden sich zwischen lokaler Sichtung, weltweiter Sichtung und astronomischer Berechnung; üblich und anerkannt ist es, der Entscheidung der eigenen Gemeinde oder Moschee zu folgen.",
        ar: "شعبان، الشهر الذي يسبق رمضان، وقت استعداد. وورد أن النبي كان يصوم في شعبان أكثر مما يصوم في غيره سوى رمضان، ووصفه بأنه شهر يغفل عنه الناس تُرفع فيه الأعمال إلى الله.\n\n## استعداد عملي\n- **قضاء ما فات** من رمضان الماضي قبل دخول الجديد.\n- تعويد النفس تدريجيًا على النوم والأكل، مثل صيام الاثنين والخميس أحيانًا.\n- وضع خطة واقعية لقراءة القرآن في الشهر.\n- تنظيم العمل والأسرة والراحة ليتفرغ الليل للصلاة.\n- إصلاح ذات البين وقضاء الديون والخصومات.\n- تعلم أحكام الصيام: المفطرات وأصحاب الأعذار والقضاء.\n\n## دخول الشهر\nيدخل الشهر برؤية الهلال أو إكمال شعبان ثلاثين يومًا. وتختلف الجماعات بين الرؤية المحلية والرؤية العالمية والحساب الفلكي، والمعتاد المقبول اتباع قرار الجماعة أو المسجد المحلي.",
      },
      tags: ["varies"],
      quiz: [
        {
          q: { en: "What should be done before the new Ramadan?", de: "Was sollte vor dem neuen Ramadan geschehen?", ar: "ما الذي ينبغي قبل رمضان الجديد؟" },
          options: [
            { en: "Stop praying", de: "Mit dem Beten aufhören", ar: "ترك الصلاة" },
            { en: "Buy a new car", de: "Ein neues Auto kaufen", ar: "شراء سيارة" },
            { en: "Make up missed fasts", de: "Versäumte Fastentage nachholen", ar: "قضاء الصيام الفائت" },
            { en: "Travel abroad", de: "Ins Ausland reisen", ar: "السفر للخارج" },
          ],
          answer: 2,
          explain: { en: "Missed fasts are made up before the next Ramadan.", de: "Versäumtes wird vor dem nächsten Ramadan nachgeholt.", ar: "يُقضى الفائت قبل رمضان التالي." },
        },
        {
          q: { en: "How does the month begin?", de: "Wie beginnt der Monat?", ar: "كيف يدخل الشهر؟" },
          options: [
            { en: "Moon sighting or thirty days of Sha'ban", de: "Mondsichtung oder dreißig Tage Schaban", ar: "برؤية الهلال أو إكمال شعبان" },
            { en: "On a fixed solar date", de: "An einem festen Sonnendatum", ar: "بتاريخ شمسي ثابت" },
            { en: "When the weather is cool", de: "Wenn es kühl ist", ar: "عند برودة الجو" },
            { en: "On the first Monday", de: "Am ersten Montag", ar: "أول يوم اثنين" },
          ],
          answer: 0,
          explain: { en: "Methods differ, but the lunar month is the basis.", de: "Die Methoden variieren, Grundlage ist der Mondmonat.", ar: "تختلف الطرق والأصل الشهر القمري." },
        },
        {
          q: { en: "Which month did the Prophet fast most after Ramadan?", de: "In welchem Monat fastete der Prophet nach Ramadan am meisten?", ar: "أي شهر أكثر النبي صيامه بعد رمضان؟" },
          options: [
            { en: "Shawwal", de: "Schawwal", ar: "شوال" },
            { en: "Rajab", de: "Radschab", ar: "رجب" },
            { en: "Dhul-Hijjah", de: "Dhul-Hiddscha", ar: "ذو الحجة" },
            { en: "Sha'ban", de: "Schaban", ar: "شعبان" },
          ],
          answer: 3,
          explain: { en: "Sha'ban is reported as the month of many voluntary fasts.", de: "Schaban ist als Monat vieler freiwilliger Fastentage überliefert.", ar: "ورد الإكثار من الصيام في شعبان." },
        },
      ],
    },
    {
      id: "r03-suhur-iftar",
      title: { en: "Suhur and iftar", de: "Suhur und Iftar", ar: "السحور والإفطار" },
      body: {
        en: "The Quran describes the time of eating and drinking until the white thread of dawn becomes distinct from the black thread, and then completing the fast until the night (2:187).\n\n## Suhur\n- The pre-dawn meal is a sunnah with blessing in it, even if only a sip of water or a few dates.\n- It is recommended to delay it close to dawn, leaving time for wudu and the Fajr prayer.\n- The intention to fast is made the night before or at suhur; schools differ on details for voluntary fasts.\n\n## Iftar\n- Hastening to break the fast once the sun has set is a sunnah.\n- Breaking it with fresh or dry dates, or with water if there are none.\n- The moment of iftar is a time of dua; the wording reported for it is in the duas screen.\n- Feeding a fasting person carries a reward like the fast itself.\n\n## Health\nBalanced meals, enough water at night and avoiding overeating help. People with illness, pregnancy or regular medication should seek medical and scholarly advice; the exemptions of 2:184 exist for them.",
        de: "Der Koran beschreibt die Zeit des Essens und Trinkens, bis sich der weiße Faden der Morgendämmerung vom schwarzen abhebt, und dann das Fasten bis zur Nacht zu vollenden (2:187).\n\n## Suhur\n- Die Mahlzeit vor der Dämmerung ist eine gesegnete Sunna, selbst wenn es nur ein Schluck Wasser oder einige Datteln sind.\n- Es wird empfohlen, sie bis kurz vor die Dämmerung zu verschieben und Zeit für Wudu und das Fadschr-Gebet zu lassen.\n- Die Absicht wird in der Nacht oder beim Suhur gefasst; bei freiwilligem Fasten unterscheiden sich die Rechtsschulen in Einzelheiten.\n\n## Iftar\n- Es ist Sunna, das Fasten nach Sonnenuntergang zügig zu brechen.\n- Man bricht es mit frischen oder getrockneten Datteln, sonst mit Wasser.\n- Der Moment des Iftar ist eine Zeit des Bittgebets; der überlieferte Wortlaut steht im Dua-Bereich.\n- Wer einem Fastenden zu essen gibt, erhält einen Lohn wie für das Fasten selbst.\n\n## Gesundheit\nAusgewogene Mahlzeiten, genug Wasser in der Nacht und Maß halten helfen. Wer krank oder schwanger ist oder regelmäßig Medikamente nimmt, sollte ärztlichen und gelehrten Rat einholen; für sie gibt es die Erleichterungen aus 2:184.",
        ar: "يصف القرآن وقت الأكل والشرب حتى يتبين الخيط الأبيض من الخيط الأسود من الفجر، ثم إتمام الصيام إلى الليل (2:187).\n\n## السحور\n- السحور سنة فيها بركة ولو بجرعة ماء أو تمرات.\n- يُستحب تأخيره إلى قرب الفجر مع ترك وقت للوضوء وصلاة الفجر.\n- تكون النية في الليل أو عند السحور، وللمذاهب تفاصيل في صيام التطوع.\n\n## الإفطار\n- تعجيل الفطر بعد غروب الشمس سنة.\n- يُفطر على رطب أو تمر، فإن لم يجد فعلى ماء.\n- وقت الإفطار وقت دعاء، والصيغة المأثورة في شاشة الأدعية.\n- من فطّر صائمًا كان له مثل أجره.\n\n## الصحة\nتساعد الوجبات المتوازنة وشرب الماء ليلًا وعدم الإفراط. ومن كان مريضًا أو حاملًا أو يتناول دواءً منتظمًا فليستشر الطبيب وأهل العلم، فالرخص في 2:184 لهم.",
      },
      verses: ["2:187", "2:184"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "Which verse describes the white and black thread of dawn?", de: "Welcher Vers beschreibt den weißen und schwarzen Faden der Dämmerung?", ar: "أي آية تذكر الخيط الأبيض والأسود؟" },
          options: [
            { en: "2:183", de: "2:183", ar: "2:183" },
            { en: "2:187", de: "2:187", ar: "2:187" },
            { en: "97:5", de: "97:5", ar: "97:5" },
            { en: "3:97", de: "3:97", ar: "3:97" },
          ],
          answer: 1,
          explain: { en: "2:187 sets the times of the fast.", de: "2:187 legt die Zeiten des Fastens fest.", ar: "تحدد 2:187 وقت الصيام." },
        },
        {
          q: { en: "What is sunnah regarding iftar?", de: "Was ist beim Iftar Sunna?", ar: "ما السنة في الإفطار؟" },
          options: [
            { en: "Delaying it until Isha", de: "Ihn bis zum Ischa verschieben", ar: "تأخيره إلى العشاء" },
            { en: "Skipping it", de: "Ihn auslassen", ar: "تركه" },
            { en: "Eating before sunset", de: "Vor Sonnenuntergang essen", ar: "الأكل قبل الغروب" },
            { en: "Hastening it after sunset", de: "Ihn nach Sonnenuntergang zügig einnehmen", ar: "تعجيله بعد الغروب" },
          ],
          answer: 3,
          explain: { en: "Hastening the iftar is a reported sunnah.", de: "Das zügige Fastenbrechen ist überlieferte Sunna.", ar: "تعجيل الفطر سنة." },
        },
        {
          q: { en: "What is recommended for suhur?", de: "Was wird für das Suhur empfohlen?", ar: "ما المستحب في السحور؟" },
          options: [
            { en: "Delaying it close to dawn", de: "Es bis kurz vor die Dämmerung verschieben", ar: "تأخيره إلى قرب الفجر" },
            { en: "Eating it at midnight only", de: "Nur um Mitternacht essen", ar: "تناوله عند منتصف الليل فقط" },
            { en: "Never eating it", de: "Es nie einnehmen", ar: "تركه دائمًا" },
            { en: "Eating it after Fajr", de: "Nach dem Fadschr essen", ar: "تناوله بعد الفجر" },
          ],
          answer: 0,
          explain: { en: "Delaying suhur is recommended, leaving time for Fajr.", de: "Ein spätes Suhur wird empfohlen, mit Zeit für das Fadschr.", ar: "يُستحب تأخير السحور مع إدراك الفجر." },
        },
      ],
    },
    {
      id: "r04-taraweeh",
      title: { en: "Taraweeh and night prayer", de: "Tarawih und Nachtgebet", ar: "التراويح وقيام الليل" },
      body: {
        en: "Standing in prayer during the nights of Ramadan out of faith and hoping for reward is reported to bring forgiveness of past sins. The Quran praises those who spend part of the night in prostration and standing (25:64) and whose sides leave their beds to call on their Lord (32:16).\n\n## How it is practised\n- The Prophet led the night prayer in congregation on a few nights, then stopped out of concern it might become obligatory.\n- Under Umar the people gathered behind one imam in the mosque; this became the Sunni tradition of **taraweeh**.\n- The number of rak'at varies: eight, twenty, thirty-six and other numbers are practised. Many scholars consider the matter open.\n- Many mosques aim to complete the Quran over the month in taraweeh.\n- Witr closes the night prayer.\n\n## Differences\nIn Shia (Ja'fari) practice there is no congregational taraweeh; the recommended night prayers of Ramadan are performed individually, with specific supplications for the month. Respect for different community practices is part of good manners. Praying at home is also valid and was common among the early generations.",
        de: "Wer in den Nächten des Ramadan aus Glauben und in Hoffnung auf Lohn betet, dem werden nach der Überlieferung vergangene Sünden vergeben. Der Koran lobt jene, die einen Teil der Nacht in Niederwerfung und Stehen verbringen (25:64) und deren Seiten sich von den Lagern lösen, um ihren Herrn anzurufen (32:16).\n\n## Wie es praktiziert wird\n- Der Prophet leitete das Nachtgebet in einigen Nächten gemeinsam und hörte dann auf, aus Sorge, es könnte Pflicht werden.\n- Unter Umar versammelten sich die Menschen hinter einem Imam in der Moschee; daraus wurde die sunnitische Tradition des **Tarawih**.\n- Die Zahl der Rakat variiert: acht, zwanzig, sechsunddreißig und andere werden praktiziert. Viele Gelehrte halten die Frage für offen.\n- Viele Moscheen streben an, im Tarawih den ganzen Koran im Monat zu rezitieren.\n- Das Witr schließt das Nachtgebet ab.\n\n## Unterschiede\nIn der schiitischen (dschafaritischen) Praxis gibt es kein gemeinschaftliches Tarawih; die empfohlenen Nachtgebete des Ramadan werden einzeln verrichtet, mit eigenen Bittgebeten für den Monat. Respekt vor unterschiedlicher Praxis gehört zum guten Umgang. Auch das Gebet zu Hause ist gültig.",
        ar: "ورد أن من قام ليالي رمضان إيمانًا واحتسابًا غُفر له ما تقدم من ذنبه. ويثني القرآن على الذين يبيتون لربهم سجدًا وقيامًا (25:64) والذين تتجافى جنوبهم عن المضاجع يدعون ربهم (32:16).\n\n## كيفية أدائها\n- صلى النبي بالناس جماعةً ليالي ثم ترك خشية أن تُفرض.\n- وفي عهد عمر اجتمع الناس على إمام واحد في المسجد، فصارت **التراويح** سنةً عند أهل السنة.\n- يختلف عدد الركعات: ثمانٍ وعشرون وست وثلاثون وغيرها، ويرى كثير من العلماء الأمر واسعًا.\n- تسعى مساجد كثيرة إلى ختم القرآن في التراويح خلال الشهر.\n- ويُختم قيام الليل بالوتر.\n\n## الاختلاف\nلا تُصلى التراويح جماعةً في الفقه الجعفري، بل تؤدى نوافل ليالي رمضان فرادى مع أدعية خاصة بالشهر. واحترام اختلاف الممارسات من حسن الأدب. والصلاة في البيت صحيحة كذلك.",
      },
      verses: ["25:64", "32:16"],
      tags: ["varies", "jafari"],
      quiz: [
        {
          q: { en: "Why did the Prophet stop leading the night prayer in congregation?", de: "Warum hörte der Prophet auf, das Nachtgebet gemeinsam zu leiten?", ar: "لماذا ترك النبي صلاة الليل جماعة؟" },
          options: [
            { en: "Because it was forbidden", de: "Weil es verboten war", ar: "لأنها محرمة" },
            { en: "Because nobody came", de: "Weil niemand kam", ar: "لأن أحدًا لم يحضر" },
            { en: "Out of concern it might become obligatory", de: "Aus Sorge, es könnte Pflicht werden", ar: "خشية أن تُفرض" },
            { en: "Because of travel", de: "Wegen einer Reise", ar: "بسبب السفر" },
          ],
          answer: 2,
          explain: { en: "He feared it would be made obligatory.", de: "Er fürchtete, es könnte zur Pflicht werden.", ar: "خشي أن تُفرض عليهم." },
        },
        {
          q: { en: "How many rak'at does taraweeh have?", de: "Wie viele Rakat hat das Tarawih?", ar: "كم عدد ركعات التراويح؟" },
          options: [
            { en: "Only exactly four", de: "Genau vier", ar: "أربع فقط" },
            { en: "Practices vary (8, 20 and others)", de: "Die Praxis variiert (8, 20 und andere)", ar: "يختلف العمل (8 و20 وغيرها)" },
            { en: "Exactly one hundred", de: "Genau hundert", ar: "مئة بالضبط" },
            { en: "None", de: "Keine", ar: "لا شيء" },
          ],
          answer: 1,
          explain: { en: "Different numbers are practised and many consider it open.", de: "Unterschiedliche Zahlen sind verbreitet, viele halten es für offen.", ar: "تتعدد الأعداد ويراه كثيرون واسعًا." },
        },
        {
          q: { en: "How is the night prayer of Ramadan performed in Ja'fari practice?", de: "Wie wird das Nachtgebet im Ramadan in der dschafaritischen Praxis verrichtet?", ar: "كيف تُؤدى نوافل ليالي رمضان في الفقه الجعفري؟" },
          options: [
            { en: "Individually, not as congregational taraweeh", de: "Einzeln, nicht als gemeinschaftliches Tarawih", ar: "فرادى لا تراويح جماعة" },
            { en: "Only at the Kaaba", de: "Nur an der Kaaba", ar: "عند الكعبة فقط" },
            { en: "It is not performed at all", de: "Es wird gar nicht verrichtet", ar: "لا تؤدى أصلًا" },
            { en: "Only on Fridays", de: "Nur freitags", ar: "يوم الجمعة فقط" },
          ],
          answer: 0,
          explain: { en: "Recommended night prayers are performed individually.", de: "Die empfohlenen Nachtgebete werden einzeln verrichtet.", ar: "تؤدى النوافل فرادى." },
        },
      ],
    },
    {
      id: "r05-quran",
      title: { en: "The Quran in Ramadan", de: "Der Koran im Ramadan", ar: "القرآن في رمضان" },
      body: {
        en: "Ramadan is called the month of the Quran because the Quran was sent down in it (2:185), on a blessed night (44:3). Each Ramadan, Jibril reviewed the Quran with the Prophet, and in his final year twice.\n\n## Completing the Quran (khatm)\n- The Quran has 30 parts (juz); one juz a day completes it in the month.\n- Splitting a juz across the five prayers makes it easier: about four pages after each prayer.\n- Those who cannot manage a whole khatm can set a smaller, steady goal; quality and consistency matter.\n- Many early scholars increased recitation greatly in Ramadan; reports also warn against reading so fast that nothing is understood.\n\n## Beyond recitation\n- Read a translation or short tafsir alongside, for example of the verses of fasting.\n- Listen attentively during taraweeh.\n- Choose a surah to reflect on more deeply or to memorise.\n- Act on one verse: a habit to change, a dua to keep.\n\nThe Quran itself invites reflection on its verses (38:29). The reading plan in this app can help track the daily portion.",
        de: "Ramadan heißt Monat des Korans, weil der Koran in ihm herabgesandt wurde (2:185), in einer gesegneten Nacht (44:3). In jedem Ramadan ging Dschibril den Koran mit dem Propheten durch, im letzten Lebensjahr zweimal.\n\n## Den Koran vollenden (Khatm)\n- Der Koran hat 30 Teile (Dschuz); ein Dschuz pro Tag vollendet ihn im Monat.\n- Ein Dschuz auf die fünf Gebete zu verteilen erleichtert es: etwa vier Seiten nach jedem Gebet.\n- Wer keinen vollständigen Khatm schafft, kann ein kleineres, beständiges Ziel setzen; Qualität und Beständigkeit zählen.\n- Viele frühe Gelehrte steigerten die Rezitation im Ramadan stark; Überlieferungen warnen aber auch davor, so schnell zu lesen, dass nichts verstanden wird.\n\n## Über die Rezitation hinaus\n- Lesen Sie eine Übersetzung oder einen kurzen Tafsir dazu, etwa zu den Fastenversen.\n- Hören Sie im Tarawih aufmerksam zu.\n- Wählen Sie eine Sure zum tieferen Nachdenken oder Auswendiglernen.\n- Setzen Sie einen Vers um: eine Gewohnheit ändern, ein Bittgebet beibehalten.\n\nDer Koran selbst lädt zum Nachdenken über seine Verse ein (38:29). Der Leseplan der App hilft beim täglichen Abschnitt.",
        ar: "يُسمى رمضان شهر القرآن لأن القرآن أُنزل فيه (2:185) في ليلة مباركة (44:3). وكان جبريل يدارس النبي القرآن كل رمضان، وفي العام الأخير مرتين.\n\n## ختم القرآن\n- القرآن ثلاثون جزءًا، وجزء في اليوم يختمه في الشهر.\n- تقسيم الجزء على الصلوات الخمس ييسّره: نحو أربع صفحات بعد كل صلاة.\n- ومن لم يستطع الختم فليضع هدفًا أصغر ثابتًا؛ فالجودة والمداومة أهم.\n- وكان كثير من السلف يكثرون التلاوة في رمضان، مع التحذير من الهذّ الذي لا فهم معه.\n\n## ما وراء التلاوة\n- قراءة ترجمة أو تفسير مختصر، مثل تفسير آيات الصيام.\n- الإنصات في التراويح.\n- اختيار سورة للتدبر أو الحفظ.\n- العمل بآية: عادة تُغيَّر أو دعاء يُلزم.\n\nويدعو القرآن نفسه إلى تدبر آياته (38:29). وخطة القراءة في التطبيق تعين على الورد اليومي.",
      },
      verses: ["2:185", "44:3", "38:29"],
      tags: ["consensus"],
      quiz: [
        {
          q: { en: "How many juz does the Quran have?", de: "Wie viele Dschuz hat der Koran?", ar: "كم جزءًا في القرآن؟" },
          options: [
            { en: "12", de: "12", ar: "12" },
            { en: "60", de: "60", ar: "60" },
            { en: "114", de: "114", ar: "114" },
            { en: "30", de: "30", ar: "30" },
          ],
          answer: 3,
          explain: { en: "Thirty parts, one per day of the month.", de: "Dreißig Teile, einer pro Tag.", ar: "ثلاثون جزءًا، جزء لكل يوم." },
        },
        {
          q: { en: "Who reviewed the Quran with the Prophet in Ramadan?", de: "Wer ging im Ramadan den Koran mit dem Propheten durch?", ar: "من كان يدارس النبي القرآن في رمضان؟" },
          options: [
            { en: "Abu Bakr", de: "Abu Bakr", ar: "أبو بكر" },
            { en: "Jibril", de: "Dschibril", ar: "جبريل" },
            { en: "Zayd ibn Thabit", de: "Zaid ibn Thabit", ar: "زيد بن ثابت" },
            { en: "Ali", de: "Ali", ar: "علي" },
          ],
          answer: 1,
          explain: { en: "The angel Jibril reviewed it each year.", de: "Der Engel Dschibril tat dies jedes Jahr.", ar: "كان جبريل يدارسه كل عام." },
        },
        {
          q: { en: "Which verse invites reflection on the Quran?", de: "Welcher Vers lädt zum Nachdenken über den Koran ein?", ar: "أي آية تدعو إلى التدبر؟" },
          options: [
            { en: "38:29", de: "38:29", ar: "38:29" },
            { en: "2:196", de: "2:196", ar: "2:196" },
            { en: "22:27", de: "22:27", ar: "22:27" },
            { en: "113:1", de: "113:1", ar: "113:1" },
          ],
          answer: 0,
          explain: { en: "38:29 describes a blessed Book sent down for reflection.", de: "38:29 beschreibt ein gesegnetes Buch zum Nachdenken.", ar: "تصف 38:29 كتابًا مباركًا ليدّبروا آياته." },
        },
      ],
    },
    {
      id: "r06-qadr",
      title: { en: "Laylat al-Qadr and i'tikaf", de: "Laylat al-Qadr und I'tikaf", ar: "ليلة القدر والاعتكاف" },
      body: {
        en: "Surah al-Qadr (97:1-5) describes the night in which the Quran was sent down: it is better than a thousand months, the angels and the Spirit descend in it, and it is peace until the rise of dawn.\n\n## When is it?\n- The Prophet encouraged seeking it in the **last ten nights** of Ramadan, especially the odd nights.\n- The 27th is widely mentioned, but the night is deliberately hidden so that believers strive throughout the ten.\n- In Shia tradition the 19th, 21st and 23rd nights receive special attention, with the 23rd emphasised.\n\n## What to do\n- Night prayer, Quran, dhikr and much dua; Aisha asked the Prophet what to say on this night, and he taught a short dua asking for Allah's pardon, which is in the duas screen.\n- Charity, even small amounts, spread over the nights.\n\n## I'tikaf\nI'tikaf is staying in the mosque with the intention of worship (2:187 mentions it). The Prophet observed it in the last ten days. Its minimum length, conditions and whether women observe it in the mosque differ between schools.",
        de: "Sure al-Qadr (97:1-5) beschreibt die Nacht, in der der Koran herabgesandt wurde: Sie ist besser als tausend Monate, die Engel und der Geist steigen in ihr herab, und sie ist Frieden bis zum Anbruch der Morgendämmerung.\n\n## Wann ist sie?\n- Der Prophet ermutigte, sie in den **letzten zehn Nächten** des Ramadan zu suchen, besonders in den ungeraden.\n- Die 27. Nacht wird häufig genannt, doch die Nacht ist bewusst verborgen, damit die Gläubigen sich in allen zehn bemühen.\n- In der schiitischen Tradition erhalten die 19., 21. und 23. Nacht besondere Aufmerksamkeit, mit Betonung der 23.\n\n## Was man tut\n- Nachtgebet, Koran, Dhikr und viel Bittgebet; Aischa fragte den Propheten, was sie in dieser Nacht sagen solle, und er lehrte eine kurze Bitte um Allahs Verzeihung, die im Dua-Bereich steht.\n- Spenden, auch kleine Beträge, über die Nächte verteilt.\n\n## I'tikaf\nI'tikaf ist das Verweilen in der Moschee mit der Absicht des Gottesdienstes (2:187 erwähnt es). Der Prophet hielt es in den letzten zehn Tagen. Mindestdauer, Bedingungen und die Frage, ob Frauen es in der Moschee halten, unterscheiden sich zwischen den Rechtsschulen.",
        ar: "تصف سورة القدر (97:1-5) الليلة التي أُنزل فيها القرآن: خير من ألف شهر، تتنزل فيها الملائكة والروح، وهي سلام حتى مطلع الفجر.\n\n## متى هي؟\n- حث النبي على التماسها في **العشر الأواخر** من رمضان، ولا سيما الأوتار.\n- وتشتهر ليلة السابع والعشرين، لكنها أُخفيت ليجتهد المؤمنون في العشر كلها.\n- وفي التراث الشيعي تُعظَّم ليالي التاسع عشر والحادي والعشرين والثالث والعشرين، مع التأكيد على الثالثة والعشرين.\n\n## ماذا يُعمل؟\n- القيام والقرآن والذكر والإكثار من الدعاء؛ وقد سألت عائشة النبي عما تقول فيها فعلّمها دعاءً قصيرًا بسؤال العفو، وهو في شاشة الأدعية.\n- الصدقة ولو قليلة موزعة على الليالي.\n\n## الاعتكاف\nالاعتكاف لزوم المسجد بنية العبادة (وذُكر في 2:187). وكان النبي يعتكف العشر الأواخر. وتختلف المذاهب في أقل مدته وشروطه واعتكاف المرأة في المسجد.",
      },
      verses: ["97:1", "97:2", "97:3", "97:4", "97:5", "2:187"],
      tags: ["varies", "jafari"],
      quiz: [
        {
          q: { en: "Laylat al-Qadr is better than ...", de: "Laylat al-Qadr ist besser als ...", ar: "ليلة القدر خير من ..." },
          options: [
            { en: "A hundred days", de: "Hundert Tage", ar: "مئة يوم" },
            { en: "One year", de: "Ein Jahr", ar: "سنة واحدة" },
            { en: "A thousand months", de: "Tausend Monate", ar: "ألف شهر" },
            { en: "Ten nights", de: "Zehn Nächte", ar: "عشر ليال" },
          ],
          answer: 2,
          explain: { en: "97:3.", de: "97:3.", ar: "97:3." },
        },
        {
          q: { en: "In which nights should it be sought?", de: "In welchen Nächten soll man sie suchen?", ar: "في أي ليال تُلتمس؟" },
          options: [
            { en: "The first ten nights", de: "Die ersten zehn Nächte", ar: "العشر الأوائل" },
            { en: "Only in Sha'ban", de: "Nur im Schaban", ar: "في شعبان فقط" },
            { en: "Only on Fridays", de: "Nur freitags", ar: "ليالي الجمعة فقط" },
            { en: "The last ten nights", de: "Die letzten zehn Nächte", ar: "العشر الأواخر" },
          ],
          answer: 3,
          explain: { en: "Especially the odd nights of the last ten.", de: "Besonders die ungeraden der letzten zehn.", ar: "ولا سيما أوتار العشر الأواخر." },
        },
        {
          q: { en: "What is i'tikaf?", de: "Was ist I'tikaf?", ar: "ما الاعتكاف؟" },
          options: [
            { en: "Staying in the mosque for worship", de: "Verweilen in der Moschee zum Gottesdienst", ar: "لزوم المسجد للعبادة" },
            { en: "A charity payment", de: "Eine Spende", ar: "صدقة مالية" },
            { en: "A rite of Hajj", de: "Ein Haddsch-Ritus", ar: "منسك من الحج" },
            { en: "Breaking the fast", de: "Fastenbrechen", ar: "الإفطار" },
          ],
          answer: 0,
          explain: { en: "The Prophet observed it in the last ten days.", de: "Der Prophet hielt es in den letzten zehn Tagen.", ar: "كان النبي يعتكف العشر الأواخر." },
        },
      ],
    },
    {
      id: "r07-zakat-fitr",
      title: { en: "Zakat al-fitr", de: "Zakat al-Fitr", ar: "زكاة الفطر" },
      body: {
        en: "Zakat al-fitr is a small obligatory charity at the end of Ramadan. Reports describe its purpose as purifying the fasting person from idle talk and indecency and providing food for the poor so that they too can celebrate Eid.\n\n## Who pays\n- Every Muslim who has more than his and his dependants' needs for the day of Eid pays for himself and for those he supports, including children.\n- Thresholds and details differ between schools.\n\n## What and how much\n- The reported measure is one **sa'** (a volume measure) of staple food such as dates, barley, raisins, wheat or the local staple.\n- The **Hanafi** school permits and often prefers paying the value in money; the majority of Maliki, Shafi'i and Hanbali scholars hold that food is the default. Many contemporary bodies publish a monetary amount each year.\n- In Ja'fari fiqh it is also obligatory, with a measure of about three kilograms of staple food or its value, and with its own rules for recipients.\n\n## When\nIt should reach the poor before the Eid prayer; many allow paying a day or two earlier, and some schools allow it from the start of Ramadan. Follow the guidance of your community or local scholars.",
        de: "Zakat al-Fitr ist eine kleine Pflichtabgabe am Ende des Ramadan. Überlieferungen beschreiben ihren Zweck darin, den Fastenden von leerem Gerede und Unanständigem zu reinigen und den Armen Nahrung zu geben, damit auch sie das Fest feiern können.\n\n## Wer zahlt\n- Jede Muslimin und jeder Muslim, die mehr als den Bedarf für sich und ihre Angehörigen am Festtag haben, zahlen für sich und für jene, die sie versorgen, auch Kinder.\n- Grenzen und Einzelheiten unterscheiden sich zwischen den Rechtsschulen.\n\n## Was und wie viel\n- Das überlieferte Maß ist ein **Sa'** (ein Hohlmaß) Grundnahrungsmittel wie Datteln, Gerste, Rosinen, Weizen oder das örtliche Grundnahrungsmittel.\n- Die **hanafitische** Schule erlaubt und bevorzugt oft die Zahlung des Gegenwerts in Geld; die Mehrheit der malikitischen, schafiitischen und hanbalitischen Gelehrten sieht Nahrung als Regel. Viele heutige Einrichtungen veröffentlichen jährlich einen Geldbetrag.\n- Im dschafaritischen Fiqh ist sie ebenfalls Pflicht, mit etwa drei Kilogramm Grundnahrungsmittel oder dem Gegenwert und eigenen Regeln zu den Empfängern.\n\n## Wann\nSie soll die Armen vor dem Festgebet erreichen; viele erlauben ein bis zwei Tage früher, manche Schulen ab Ramadanbeginn. Folgen Sie der Anleitung Ihrer Gemeinde.",
        ar: "زكاة الفطر صدقة واجبة يسيرة في آخر رمضان. ووصفت الروايات حكمتها بأنها طهرة للصائم من اللغو والرفث وطعمة للمساكين ليفرحوا بالعيد.\n\n## على من تجب\n- على كل مسلم فضل عن قوته وقوت من يعول يوم العيد، يخرجها عن نفسه وعمن يعول ومنهم الأطفال.\n- وتختلف المذاهب في الحدود والتفاصيل.\n\n## ماذا وكم\n- المقدار المأثور **صاع** (مكيال) من قوت البلد كالتمر والشعير والزبيب والقمح أو غيرها.\n- يجيز **الحنفية** إخراج القيمة نقدًا ويفضلونها أحيانًا، ويرى جمهور المالكية والشافعية والحنابلة أن الأصل الطعام. وتنشر هيئات معاصرة كثيرة مبلغًا نقديًا كل عام.\n- وفي الفقه الجعفري هي واجبة أيضًا، بنحو ثلاثة كيلوغرامات من القوت أو قيمتها، ولها أحكام خاصة في المستحقين.\n\n## متى\nينبغي أن تصل إلى الفقراء قبل صلاة العيد؛ ويجيز كثيرون تقديمها بيوم أو يومين، وبعض المذاهب من أول رمضان. اتبع إرشاد جماعتك أو علماء بلدك.",
      },
      tags: ["varies", "hanafi", "maliki", "shafii", "hanbali", "jafari"],
      quiz: [
        {
          q: { en: "What is one purpose of zakat al-fitr?", de: "Was ist ein Zweck der Zakat al-Fitr?", ar: "ما من حِكَم زكاة الفطر؟" },
          options: [
            { en: "Paying the imam's salary", de: "Das Gehalt des Imams zahlen", ar: "دفع راتب الإمام" },
            { en: "Feeding the poor so they can celebrate Eid", de: "Die Armen speisen, damit sie das Fest feiern können", ar: "إطعام المساكين ليفرحوا بالعيد" },
            { en: "Building mosques", de: "Moscheen bauen", ar: "بناء المساجد" },
            { en: "Replacing the fast", de: "Das Fasten ersetzen", ar: "بدل الصيام" },
          ],
          answer: 1,
          explain: { en: "It purifies the faster and feeds the poor.", de: "Sie reinigt den Fastenden und speist die Armen.", ar: "طهرة للصائم وطعمة للمساكين." },
        },
        {
          q: { en: "Which school permits paying the value in money?", de: "Welche Schule erlaubt die Zahlung des Gegenwerts in Geld?", ar: "أي مذهب يجيز إخراج القيمة؟" },
          options: [
            { en: "No school at all", de: "Keine Schule", ar: "لا مذهب" },
            { en: "Only the Hanbali", de: "Nur die hanbalitische", ar: "الحنبلي فقط" },
            { en: "The Hanafi", de: "Die hanafitische", ar: "الحنفي" },
            { en: "Only the Maliki", de: "Nur die malikitische", ar: "المالكي فقط" },
          ],
          answer: 2,
          explain: { en: "The Hanafi school permits money; the majority hold food as default.", de: "Die Hanafiten erlauben Geld; die Mehrheit sieht Nahrung als Regel.", ar: "يجيز الحنفية القيمة، والجمهور على الطعام." },
        },
        {
          q: { en: "By when should it reach the poor?", de: "Bis wann soll sie die Armen erreichen?", ar: "متى ينبغي أن تصل إلى الفقراء؟" },
          options: [
            { en: "Before the Eid prayer", de: "Vor dem Festgebet", ar: "قبل صلاة العيد" },
            { en: "One month after Eid", de: "Einen Monat nach dem Fest", ar: "بعد العيد بشهر" },
            { en: "During Hajj", de: "Während der Haddsch", ar: "في الحج" },
            { en: "At any time in the year", de: "Irgendwann im Jahr", ar: "أي وقت في السنة" },
          ],
          answer: 0,
          explain: { en: "It is due before the Eid prayer.", de: "Sie ist vor dem Festgebet fällig.", ar: "تُخرج قبل صلاة العيد." },
        },
      ],
    },
    {
      id: "r08-eid-shawwal",
      title: { en: "Eid al-Fitr and keeping the habits", de: "Eid al-Fitr und die Gewohnheiten bewahren", ar: "عيد الفطر والمداومة" },
      body: {
        en: "Ramadan ends with the sighting of the Shawwal moon or the completion of thirty days. 2:185 links the completion of the count with magnifying Allah, and the takbir of Eid is said from the night of Eid until the prayer.\n\n## The day of Eid\n- Fasting on the day of Eid is not permitted.\n- Sunnahs include bathing, wearing one's best clothes, eating a few dates before going to the prayer, and taking a different route back.\n- The Eid prayer is held in the morning with additional takbirs; its legal status (obligatory, strongly recommended or communal duty) differs between schools.\n- Visiting family, reconciling and greeting one another belong to the day.\n\n## After Ramadan\n- **Six days of Shawwal**: a reported sunnah states that fasting Ramadan and following it with six days of Shawwal is like fasting the whole year. They can be consecutive or spread out; the Maliki school is more reserved about them.\n- Keep a small part of each habit: a daily page of Quran, a voluntary fast on Mondays or Thursdays, some night prayer, regular charity.\n\nThe Lord of Ramadan is the Lord of all months.",
        de: "Der Ramadan endet mit der Sichtung des Schawwal-Mondes oder nach dreißig Tagen. 2:185 verbindet das Vollenden der Zahl mit der Preisung Allahs, und der Takbir des Festes wird von der Festnacht bis zum Gebet gesprochen.\n\n## Der Festtag\n- Am Festtag ist das Fasten nicht erlaubt.\n- Zur Sunna gehören das Bad, die besten Kleider, einige Datteln vor dem Gebet und ein anderer Rückweg.\n- Das Festgebet findet am Morgen mit zusätzlichen Takbiren statt; sein Rechtsstatus (Pflicht, stark empfohlen oder Gemeinschaftspflicht) unterscheidet sich zwischen den Rechtsschulen.\n- Verwandtenbesuche, Versöhnung und gegenseitige Glückwünsche gehören zum Tag.\n\n## Nach dem Ramadan\n- **Sechs Tage Schawwal**: Eine überlieferte Sunna besagt, dass wer den Ramadan fastet und sechs Tage des Schawwal folgen lässt, ist wie einer, der das ganze Jahr fastet. Sie können zusammenhängend oder verteilt sein; die malikitische Schule ist zurückhaltender.\n- Bewahren Sie von jeder Gewohnheit einen kleinen Teil: täglich eine Seite Koran, freiwilliges Fasten am Montag oder Donnerstag, etwas Nachtgebet, regelmäßige Spenden.\n\nDer Herr des Ramadan ist der Herr aller Monate.",
        ar: "ينتهي رمضان برؤية هلال شوال أو إكمال ثلاثين يومًا. وتربط 2:185 إكمال العدة بتكبير الله، ويُشرع التكبير من ليلة العيد إلى الصلاة.\n\n## يوم العيد\n- يحرم صوم يوم العيد.\n- ومن السنن الاغتسال ولبس أحسن الثياب وأكل تمرات قبل الخروج إلى الصلاة ومخالفة الطريق في الرجوع.\n- تُصلى صلاة العيد صباحًا بتكبيرات زوائد، ويختلف المذاهب في حكمها بين الوجوب والسنة المؤكدة وفرض الكفاية.\n- ومن آداب اليوم صلة الأرحام والتصالح والتهنئة.\n\n## بعد رمضان\n- **ست من شوال**: ورد أن من صام رمضان وأتبعه ستًا من شوال كان كصيام الدهر. ويجوز تتابعها وتفريقها، وللمالكية تحفظ فيها.\n- احتفظ بجزء صغير من كل عادة: صفحة من القرآن يوميًا، وصيام الاثنين أو الخميس، وشيء من قيام الليل، وصدقة منتظمة.\n\nرب رمضان هو رب الشهور كلها.",
      },
      verses: ["2:185"],
      tags: ["varies", "maliki"],
      quiz: [
        {
          q: { en: "Is fasting permitted on the day of Eid?", de: "Ist Fasten am Festtag erlaubt?", ar: "هل يجوز صوم يوم العيد؟" },
          options: [
            { en: "Yes, it is recommended", de: "Ja, es ist empfohlen", ar: "نعم، مستحب" },
            { en: "Only for men", de: "Nur für Männer", ar: "للرجال فقط" },
            { en: "Only in the afternoon", de: "Nur am Nachmittag", ar: "بعد الظهر فقط" },
            { en: "No", de: "Nein", ar: "لا" },
          ],
          answer: 3,
          explain: { en: "Fasting on Eid is not permitted.", de: "Fasten am Festtag ist nicht erlaubt.", ar: "يحرم صوم يوم العيد." },
        },
        {
          q: { en: "How many voluntary days of Shawwal are reported?", de: "Wie viele freiwillige Tage im Schawwal sind überliefert?", ar: "كم يومًا من شوال ورد صيامها؟" },
          options: [
            { en: "Three", de: "Drei", ar: "ثلاثة" },
            { en: "Six", de: "Sechs", ar: "ستة" },
            { en: "Ten", de: "Zehn", ar: "عشرة" },
            { en: "Thirty", de: "Dreißig", ar: "ثلاثون" },
          ],
          answer: 1,
          explain: { en: "Six days of Shawwal after Ramadan.", de: "Sechs Tage Schawwal nach dem Ramadan.", ar: "ست من شوال بعد رمضان." },
        },
        {
          q: { en: "What is a sunnah before the Eid al-Fitr prayer?", de: "Was ist vor dem Gebet zu Eid al-Fitr Sunna?", ar: "ما السنة قبل صلاة عيد الفطر؟" },
          options: [
            { en: "Eating a few dates", de: "Einige Datteln essen", ar: "أكل تمرات" },
            { en: "Fasting until the evening", de: "Bis zum Abend fasten", ar: "الصيام إلى المساء" },
            { en: "Staying at home", de: "Zu Hause bleiben", ar: "البقاء في البيت" },
            { en: "Wearing old clothes", de: "Alte Kleider tragen", ar: "لبس الثياب البالية" },
          ],
          answer: 0,
          explain: { en: "Eating dates shows the fast has ended.", de: "Datteln zeigen, dass das Fasten vorbei ist.", ar: "أكل التمر إظهار لانتهاء الصيام." },
        },
      ],
    },
  ],
};
