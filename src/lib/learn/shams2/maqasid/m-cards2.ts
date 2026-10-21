// mirrors mobile/src/features/shams2/maqasid/m-cards2.ts (copied for the website; keep in step with the app)
import type { Maqasid } from "./types";
import type { L, LL, Section } from "./types";
import { DRAFT } from "../sources";

// Surah-level cards for surahs 41–77 (without 55, 56 and 67). Own words, verse numbers only, drafts until reviewed.
const l = (de: string, en: string, ar: string): L => ({ de, en, ar });
const ll = (de: string[], en: string[], ar: string[]): LL => ({ de, en, ar });
const sec = (from: number, to: number, de: string, en: string, ar: string): Section => ({ from, to, title: l(de, en, ar) });

export const M_CARDS2: Maqasid[] = [
  {
    s: 41,
    theme: l(
      "Der Qurʾān ist klar dargelegt; wer sich ihm verschließt, wird am Ende gegen sich selbst Zeugnis ablegen, wer standhaft bleibt, dem kommen die Engel zu Hilfe.",
      "The Qurʾān is set out clearly; whoever closes himself to it will in the end be witnessed against by his own self, while the steadfast are met by the angels.",
      "القرآن مفصَّل بيِّن؛ من أعرض عنه شهدت عليه جوارحه، ومن ثبت على الإيمان بشّرته الملائكة.",
    ),
    context: l(
      "Mekkanisch, aus der mittleren mekkanischen Zeit, als Quraysh versuchten, das Hören des Qurʾān durch Lärm zu verhindern.",
      "Meccan, from the middle Meccan period, when Quraysh tried to drown out the recitation of the Qurʾān with noise.",
      "مكية، من المرحلة المكية الوسطى، حين سعت قريش إلى اللغو عند سماع القرآن.",
    ),
    asbab: l(
      "Zu Vers 22 berichten al-Bukhārī und Muslim von Ibn Masʿūd, dass drei Männer am Haus Allahs darüber stritten, ob Allah ihr Gespräch hört. In der Sīra des Ibn Isḥāq wird erzählt, dass ʿUtba ibn Rabīʿa den Anfang der Sure hörte und beeindruckt zu Quraysh zurückkehrte.",
      "On verse 22, al-Bukhārī and Muslim report from Ibn Masʿūd that three men at the House of Allah disputed whether Allah hears their talk. Ibn Isḥāq's Sīra relates that ʿUtba ibn Rabīʿa heard the opening of the surah and returned to Quraysh deeply moved.",
      "في الآية 22 روى البخاري ومسلم عن ابن مسعود خبر ثلاثة نفر عند البيت تساءلوا: أيسمع الله ما نقول؟ وفي سيرة ابن إسحاق أن عتبة بن ربيعة سمع أول السورة فرجع إلى قريش متأثرًا.",
    ),
    connects: l(
      "Ghāfir endet mit dem Untergang der Leugner, Fuṣṣilat beginnt mit dem Buch, das sie hätte retten können. Beide gehören zu den Ḥā-Mīm-Suren; aš-Šūrā setzt das Thema der Offenbarung fort.",
      "Ghāfir ends with the ruin of the deniers; Fuṣṣilat opens with the Book that could have saved them. Both belong to the Ḥā-Mīm surahs, and al-Shūrā continues the theme of revelation.",
      "خُتمت غافر بهلاك المكذبين، وافتُتحت فصلت بالكتاب الذي كان سبيل نجاتهم، وكلتاهما من الحواميم، وتواصل الشورى حديث الوحي.",
    ),
    lessons: ll(
      ["Ein Herz, das sich verschließt, hört auch die klarste Rede nicht.", "Glieder und Haut werden über die Taten sprechen.", "Standhaftigkeit nach dem Bekenntnis ist der Kern des Glaubens.", "Das Schlechte mit dem Besseren abwehren verwandelt Feindschaft."],
      ["A closed heart does not hear even the clearest speech.", "Limbs and skin will speak about deeds.", "Steadfastness after professing faith is its core.", "Repelling evil with what is better turns enmity around."],
      ["القلب المعرض لا يسمع أوضح البيان.", "الجوارح والجلود تشهد على الأعمال.", "الاستقامة بعد الإقرار لبّ الإيمان.", "الدفع بالتي هي أحسن يحوّل العداوة إلى ولاية."],
    ),
    questions: ll(
      ["Was würden Ihre Hände heute über Sie bezeugen?", "Bei wem könnten Sie diese Woche Schlechtes mit Gutem beantworten?"],
      ["What would your hands testify about you today?", "With whom could you answer harm with good this week?"],
      ["بماذا تشهد عليك يداك اليوم؟", "مع من تستطيع هذا الأسبوع أن تدفع السيئة بالحسنة؟"],
    ),
    sections: [
      sec(1, 12, "Das klar dargelegte Buch und die Schöpfung", "The clearly set out Book and creation", "الكتاب المفصَّل وخلق السماوات والأرض"),
      sec(13, 25, "ʿĀd und Thamūd, die Zeugen der Glieder", "ʿĀd and Thamūd, the witness of the limbs", "عاد وثمود وشهادة الجوارح"),
      sec(26, 36, "Lärm gegen den Qurʾān und die Standhaften", "Noise against the Qurʾān and the steadfast", "اللغو في القرآن وثواب المستقيمين"),
      sec(37, 54, "Zeichen in den Horizonten und in den Seelen", "Signs in the horizons and in the souls", "الآيات في الآفاق والأنفس"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 42,
    theme: l(
      "Alle Gesandten brachten dieselbe Religion; die Offenbarung ist Leben und Licht, und die Gläubigen regeln ihre Angelegenheiten durch Beratung.",
      "All messengers brought one religion; revelation is life and light, and believers conduct their affairs through consultation.",
      "دين الرسل واحد، والوحي روح ونور، والمؤمنون يتشاورون في أمورهم.",
    ),
    context: l(
      "Mekkanisch nach der Mehrheit; einige Gelehrte nehmen einzelne Verse (etwa 23–26 oder 39–41) als medinensisch aus, wie al-Qurṭubī berichtet.",
      "Meccan according to the majority; some scholars consider individual verses (such as 23–26 or 39–41) Medinan, as al-Qurṭubī reports.",
      "مكية عند الجمهور، واستثنى بعضهم آيات منها كالآيات 23–26 أو 39–41 فجعلوها مدنية، كما ذكر القرطبي.",
    ),
    connects: l(
      "Fuṣṣilat betont die Klarheit des Buches, aš-Šūrā seine eine Quelle und Weise der Herabsendung. Az-Zukhruf greift danach erneut das Buch und das blinde Nachahmen der Vorfahren auf.",
      "Fuṣṣilat stresses the clarity of the Book, al-Shūrā its single source and the ways it is sent down. Al-Zukhruf then returns to the Book and the blind following of forefathers.",
      "بيّنت فصلت وضوح الكتاب، وبيّنت الشورى وحدة مصدره وطرق إنزاله، ثم تعود الزخرف إلى الكتاب وذمّ تقليد الآباء.",
    ),
    lessons: ll(
      ["Spaltung kam nach dem Wissen, aus Neid, nicht aus Unklarheit.", "Beratung gehört zu den Kennzeichen der Gläubigen, neben Gebet und Spenden.", "Vergeben ist edel, Gegenwehr gegen Unrecht ist erlaubt, Maß ist Pflicht.", "Versorgung wird nach Weisheit zugeteilt, nicht nach Verdienst."],
      ["Division came after knowledge, from envy, not from unclarity.", "Consultation is a mark of believers, alongside prayer and giving.", "Forgiving is noble, defending against wrong is allowed, measure is required.", "Provision is apportioned by wisdom, not by merit."],
      ["التفرق جاء بعد العلم بغيًا لا عن خفاء.", "الشورى من صفات المؤمنين مع الصلاة والإنفاق.", "العفو فضل، والانتصار من الظلم مباح بالعدل.", "الرزق يُقسم بحكمة لا باستحقاق."],
    ),
    questions: ll(
      ["Welche Entscheidung in Ihrem Leben würde durch echte Beratung besser?", "Wo rechnen Sie Ihr Wohlergehen Ihrem eigenen Verdienst zu?"],
      ["Which decision in your life would be better through real consultation?", "Where do you credit your well-being to your own merit?"],
      ["أي قرار في حياتك يصلح بالشورى الصادقة؟", "أين تنسب نعمتك إلى استحقاقك؟"],
    ),
    sections: [
      sec(1, 12, "Der Allmächtige und die Offenbarung", "The Almighty and revelation", "العزيز الحكيم والوحي"),
      sec(13, 20, "Eine Religion für alle Gesandten", "One religion for all messengers", "دين واحد شرعه الله للرسل"),
      sec(21, 35, "Gerechtigkeit, Reue und Versorgung", "Justice, repentance and provision", "العدل والتوبة وقسمة الرزق"),
      sec(36, 43, "Die Eigenschaften der Gläubigen", "The qualities of the believers", "صفات المؤمنين"),
      sec(44, 53, "Ruf zur Antwort und die Weisen der Offenbarung", "Call to respond and the modes of revelation", "الدعوة إلى الاستجابة وطرق الوحي"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 43,
    theme: l(
      "Glanz und Reichtum dieser Welt sind kein Maßstab für Wahrheit; das blinde Folgen der Vorfahren wird widerlegt, und die Gesandten von Ibrāhīm bis ʿĪsā riefen zur reinen Anbetung.",
      "The glitter and wealth of this world are no measure of truth; blind imitation of forefathers is refuted, and the messengers from Ibrāhīm to ʿĪsā called to pure worship.",
      "زخرف الدنيا ليس ميزانًا للحق، وتقليد الآباء مردود، والرسل من إبراهيم إلى عيسى دعوا إلى التوحيد الخالص.",
    ),
    context: l(
      "Mekkanisch, aus der mittleren bis späten mekkanischen Zeit.",
      "Meccan, from the middle to late Meccan period.",
      "مكية، من المرحلة المكية الوسطى أو المتأخرة.",
    ),
    asbab: l(
      "Zu Vers 57 berichten Ibn Isḥāq und andere, von Ibn Kathīr angeführt, dass Quraysh lärmten, als ʿĪsā als Beispiel erwähnt wurde, und damit streiten wollten.",
      "On verse 57, Ibn Isḥāq and others, cited by Ibn Kathīr, report that Quraysh made an uproar when ʿĪsā was mentioned as an example, seeking to argue with it.",
      "في الآية 57 روى ابن إسحاق وغيره، ونقله ابن كثير، أن قريشًا ضجّوا حين ضُرب عيسى مثلًا يريدون الجدل.",
    ),
    connects: l(
      "Aš-Šūrā endet mit dem Qurʾān als Geist und Licht, az-Zukhruf beginnt mit dem klaren Buch. Ad-Dukhān schließt mit der Drohung an, die am Ende von az-Zukhruf angedeutet wird.",
      "Al-Shūrā ends with the Qurʾān as spirit and light; al-Zukhruf opens with the clear Book. Al-Dukhān follows with the warning hinted at the close of al-Zukhruf.",
      "خُتمت الشورى بالوحي روحًا ونورًا، وافتُتحت الزخرف بالكتاب المبين، وتأتي الدخان بالوعيد الذي أُشير إليه في آخر الزخرف.",
    ),
    lessons: ll(
      ["Wohlstand ist kein Zeichen göttlicher Billigung.", "Tradition ohne Beweis ist kein Argument.", "Wer sich vom Gedenken abwendet, bekommt einen schlechten Begleiter.", "Freundschaften enden am Jüngsten Tag in Feindschaft, außer bei den Gottesfürchtigen."],
      ["Prosperity is no sign of divine approval.", "Tradition without proof is no argument.", "Whoever turns from remembrance is given a bad companion.", "Friendships turn to enmity on the Last Day, except among the God-fearing."],
      ["الغنى ليس علامة رضا الله.", "التقليد بلا برهان ليس حجة.", "من أعرض عن الذكر قُيّض له قرين سوء.", "صداقات الدنيا تنقلب عداوة يوم القيامة إلا صداقة المتقين."],
    ),
    questions: ll(
      ["Welche Gewohnheit übernehmen Sie nur, weil es immer so war?", "Welche Ihrer Freundschaften wird am Jüngsten Tag Bestand haben?"],
      ["Which habit do you keep only because it was always so?", "Which of your friendships will last on the Last Day?"],
      ["أي عادة تتبعها لمجرد أنها موروثة؟", "أي صداقاتك تبقى يوم القيامة؟"],
    ),
    sections: [
      sec(1, 14, "Das klare Buch und die Gaben der Schöpfung", "The clear Book and the gifts of creation", "الكتاب المبين ونعم الخلق"),
      sec(15, 25, "Die Engel als Töchter und das Erbe der Väter", "Angels as daughters and the legacy of fathers", "دعوى البنات وتقليد الآباء"),
      sec(26, 45, "Ibrāhīm, der Glanz der Welt und der schlechte Begleiter", "Ibrāhīm, worldly glitter and the bad companion", "إبراهيم وزخرف الدنيا وقرين السوء"),
      sec(46, 56, "Mūsā und Firʿawn", "Mūsā and Pharaoh", "موسى وفرعون"),
      sec(57, 66, "ʿĪsā als Zeichen", "ʿĪsā as a sign", "عيسى آية"),
      sec(67, 89, "Freunde, Paradies, Hölle und der Herr der Welten", "Friends, Paradise, Hell and the Lord of all", "الأخلاء والجنة والنار ورب العالمين"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 44,
    theme: l(
      "Der Qurʾān kam in einer gesegneten Nacht als Warnung; wer ihn verwirft, steht vor dem Rauch und dem Schicksal Firʿawns.",
      "The Qurʾān came down in a blessed night as a warning; whoever rejects it faces the smoke and the fate of Pharaoh.",
      "أُنزل القرآن في ليلة مباركة نذيرًا، ومن كذّب به فأمامه الدخان ومصير فرعون.",
    ),
    context: l(
      "Mekkanisch, aus der mittleren mekkanischen Zeit.",
      "Meccan, from the middle Meccan period.",
      "مكية، من المرحلة المكية الوسطى.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Ibn Masʿūd, dass der Rauch eine Hungersnot über Quraysh meinte, in der sie den Himmel wie Rauch sahen. Andere Gelehrte verstehen ihn als Zeichen vor der Stunde; Ibn Kathīr stellt beide Ansichten dar.",
      "Al-Bukhārī and Muslim report from Ibn Masʿūd that the smoke referred to a famine that struck Quraysh, in which they saw the sky as smoke. Other scholars take it as a sign before the Hour; Ibn Kathīr presents both views.",
      "روى البخاري ومسلم عن ابن مسعود أن الدخان ما أصاب قريشًا من الجوع حتى رأوا السماء كهيئة الدخان، وحمله آخرون على علامة من علامات الساعة، وذكر ابن كثير القولين.",
    ),
    connects: l(
      "Az-Zukhruf endet mit der Aufforderung, sich abzuwenden und abzuwarten; ad-Dukhān beschreibt, was sie erwartet. Al-Jāthiya setzt mit den Zeichen und dem Gericht fort.",
      "Al-Zukhruf ends with the command to turn away and wait; al-Dukhān describes what awaits them. Al-Jāthiya continues with signs and judgement.",
      "خُتمت الزخرف بالأمر بالصفح والانتظار، وتصف الدخان ما ينتظرهم، وتواصل الجاثية الحديث عن الآيات والحساب.",
    ),
    lessons: ll(
      ["Erleichterung nach Not ist eine Prüfung, kein Freispruch.", "Macht wie die Firʿawns verschwindet, Gärten und Quellen bleiben zurück.", "Himmel und Erde sind nicht im Spiel erschaffen."],
      ["Relief after hardship is a test, not an acquittal.", "Power like Pharaoh's vanishes; gardens and springs are left behind.", "Heaven and earth were not created in play."],
      ["كشف الضر ابتلاء لا براءة.", "يزول ملك فرعون وتبقى الجنات والعيون بعده.", "خلق الكون لحكمة لا عبثًا."],
    ),
    questions: ll(
      ["Welches Versprechen haben Sie in einer Notlage gegeben und danach vergessen?", "Was würden Sie zurücklassen, wenn Sie heute gingen?"],
      ["Which promise did you make in hardship and forget afterwards?", "What would you leave behind if you went today?"],
      ["أي عهد قطعته في الشدة ثم نسيته؟", "ماذا تترك لو رحلت اليوم؟"],
    ),
    sections: [
      sec(1, 8, "Die gesegnete Nacht", "The blessed night", "الليلة المباركة"),
      sec(9, 16, "Der Rauch und die Warnung", "The smoke and the warning", "الدخان والنذارة"),
      sec(17, 33, "Firʿawn und die Rettung der Kinder Israels", "Pharaoh and the rescue of the Children of Israel", "فرعون ونجاة بني إسرائيل"),
      sec(34, 42, "Leugnung der Auferstehung und der Tag der Entscheidung", "Denial of resurrection and the Day of Sorting", "إنكار البعث ويوم الفصل"),
      sec(43, 59, "Zaqqūm und der sichere Ort der Gottesfürchtigen", "Zaqqūm and the secure station of the God-fearing", "شجرة الزقوم ومقام المتقين الأمين"),
    ],
    src: ["ibnKathir", "saadi", "tabari", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 45,
    theme: l(
      "Die Zeichen in der Schöpfung genügen dem Nachdenkenden; wer seine Neigung zum Gott macht, leugnet das Gericht, doch jede Gemeinschaft wird kniend vor ihrem Buch stehen.",
      "The signs in creation suffice for those who reflect; whoever takes his desire as god denies the judgement, yet every community will kneel before its record.",
      "آيات الخلق كافية للمتفكر، ومن اتخذ هواه إلهه أنكر الحساب، وكل أمة جاثية تُدعى إلى كتابها.",
    ),
    context: l(
      "Mekkanisch; einige nehmen Vers 14 als medinensisch aus, wie al-Qurṭubī erwähnt.",
      "Meccan; some consider verse 14 Medinan, as al-Qurṭubī mentions.",
      "مكية، واستثنى بعضهم الآية 14 فجعلها مدنية، كما ذكر القرطبي.",
    ),
    connects: l(
      "Ad-Dukhān endet mit der Warnung abzuwarten, al-Jāthiya beginnt mit den Zeichen, die zur Besinnung rufen. Al-Aḥqāf schließt mit derselben Eröffnung über das Buch an.",
      "Al-Dukhān ends with a warning to wait; al-Jāthiya opens with signs that call to reflection. Al-Aḥqāf follows with the same opening about the Book.",
      "خُتمت الدخان بالأمر بالارتقاب، وافتُتحت الجاثية بآيات تدعو إلى التفكر، وتأتي الأحقاف بالافتتاح نفسه عن الكتاب.",
    ),
    lessons: ll(
      ["Alles in Himmel und Erde ist dem Menschen dienstbar gemacht.", "Neigung kann zum Götzen werden.", "Jede Tat ist aufgezeichnet und wird vorgelegt."],
      ["All in heaven and earth has been made of service to people.", "Desire can become an idol.", "Every deed is recorded and will be presented."],
      ["سُخّر للإنسان ما في السماوات والأرض.", "قد يصير الهوى إلهًا يُعبد.", "كل عمل مكتوب ويُعرض على صاحبه."],
    ),
    questions: ll(
      ["Wo folgen Sie eher Ihrer Neigung als Ihrem Wissen?", "Welches Zeichen der Schöpfung haben Sie heute bewusst betrachtet?"],
      ["Where do you follow your desire rather than your knowledge?", "Which sign of creation did you consciously look at today?"],
      ["أين تتبع هواك لا علمك؟", "أي آية من آيات الخلق تأملتها اليوم؟"],
    ),
    sections: [
      sec(1, 13, "Zeichen und Dienstbarmachung", "Signs and subjection", "الآيات والتسخير"),
      sec(14, 20, "Vergebung, die Kinder Israels und der klare Weg", "Forgiveness, the Children of Israel and the clear path", "الصفح وبنو إسرائيل والشريعة"),
      sec(21, 26, "Die Neigung als Gott und die Leugnung der Auferstehung", "Desire as god and denial of resurrection", "اتخاذ الهوى إلهًا وإنكار البعث"),
      sec(27, 37, "Jede Gemeinschaft kniend vor ihrem Buch", "Every community kneeling before its record", "كل أمة جاثية إلى كتابها"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 46,
    theme: l(
      "Die Botschaft ist nicht neu und der Gesandte ﷺ nicht der erste; Dankbarkeit gegenüber Eltern, die Warnung an ʿĀd und das Hören der Jinn zeigen, wie man auf Wahrheit antworten sollte.",
      "The message is not new and the Messenger ﷺ not the first; gratitude to parents, the warning to ʿĀd and the listening of the jinn show how one should respond to truth.",
      "الرسالة ليست جديدة ولا الرسول ﷺ أول الرسل، وبرّ الوالدين ونذارة عاد واستماع الجن تبين كيف يُستجاب للحق.",
    ),
    context: l(
      "Mekkanisch, aus der späten mekkanischen Zeit, wohl nach der Rückkehr aus aṭ-Ṭāʾif. Einige nehmen Vers 10 und weitere Verse als medinensisch aus.",
      "Meccan, from the late Meccan period, probably after the return from al-Ṭāʾif. Some consider verse 10 and a few others Medinan.",
      "مكية، من المرحلة المكية المتأخرة، والأرجح بعد العودة من الطائف، واستثنى بعضهم الآية 10 وغيرها.",
    ),
    asbab: l(
      "Al-Bukhārī berichtet von Saʿd ibn Abī Waqqāṣ, dass Vers 10 über ʿAbdallāh ibn Salām herabkam. Die Verse 29–32 über die Jinn verbinden Kommentatoren mit der Rezitation des Propheten ﷺ auf dem Rückweg von aṭ-Ṭāʾif.",
      "Al-Bukhārī reports from Saʿd ibn Abī Waqqāṣ that verse 10 came down concerning ʿAbdallāh ibn Salām. Commentators link verses 29–32 on the jinn to the Prophet's ﷺ recitation on the way back from al-Ṭāʾif.",
      "روى البخاري عن سعد بن أبي وقاص أن الآية 10 نزلت في عبد الله بن سلام، ويربط المفسرون الآيات 29–32 في الجن بقراءة النبي ﷺ في رجوعه من الطائف.",
    ),
    connects: l(
      "Al-Aḥqāf ist die letzte der Ḥā-Mīm-Suren und schließt an die Zeichen von al-Jāthiya an. Ihr Aufruf zur Geduld wie die Gesandten mit festem Entschluss leitet zu Muḥammad über, wo der Kampf beginnt.",
      "Al-Aḥqāf is the last of the Ḥā-Mīm surahs and follows the signs of al-Jāthiya. Its call to patience like the resolute messengers leads into Muḥammad, where the struggle begins.",
      "الأحقاف آخر الحواميم وتتصل بآيات الجاثية، وأمرها بالصبر كأولي العزم يمهّد لسورة محمد حيث يبدأ القتال.",
    ),
    lessons: ll(
      ["Dankbarkeit gegenüber den Eltern ist mit Dankbarkeit gegenüber Allah verbunden.", "Mit vierzig Jahren reift der Mensch und bittet um Dank und Rechtleitung für seine Nachkommen.", "Wer kein Wissen hat, sollte nicht urteilen.", "Geduld gehört zum Weg der großen Gesandten."],
      ["Gratitude to parents is tied to gratitude to Allah.", "At forty a person matures and asks for gratitude and guidance for his offspring.", "Whoever lacks knowledge should not judge.", "Patience belongs to the path of the great messengers."],
      ["شكر الوالدين مقرون بشكر الله.", "في الأربعين يبلغ الإنسان أشده فيسأل الشكر وصلاح الذرية.", "من لا علم له فلا يحكم.", "الصبر سبيل أولي العزم من الرسل."],
    ),
    questions: ll(
      ["Wann haben Sie zuletzt für Ihre Eltern gebetet?", "Wie hören Sie zu, wenn der Qurʾān rezitiert wird, verglichen mit den Jinn?"],
      ["When did you last pray for your parents?", "How do you listen when the Qurʾān is recited, compared to the jinn?"],
      ["متى دعوت لوالديك آخر مرة؟", "كيف تستمع إلى القرآن مقارنة باستماع الجن؟"],
    ),
    sections: [
      sec(1, 14, "Das Buch und die Widerlegung der Götzen", "The Book and the refutation of idols", "الكتاب وإبطال الأوثان"),
      sec(15, 20, "Zwei Söhne und ihre Eltern", "Two sons and their parents", "الولد البار والولد العاق"),
      sec(21, 28, "Hūd und ʿĀd bei den Sanddünen", "Hūd and ʿĀd at the sand dunes", "هود وعاد بالأحقاف"),
      sec(29, 35, "Die Jinn hören zu, Geduld der Gesandten", "The jinn listen, patience of the messengers", "استماع الجن وصبر أولي العزم"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 47,
    theme: l(
      "Zwei Lager stehen sich gegenüber: Wer glaubt, dessen Taten werden gefestigt, wer leugnet, dessen Taten gehen verloren; die Heuchler werden durch die Prüfung offenbar.",
      "Two camps stand opposed: whoever believes has his deeds made firm, whoever denies has his deeds lost; the hypocrites are exposed by trial.",
      "معسكران: من آمن ثبّت الله عمله، ومن كفر أضلّ عمله، والابتلاء يكشف المنافقين.",
    ),
    context: l(
      "Medinensisch, aus der frühen medinensischen Zeit, als die Regeln des Kampfes herabkamen; manche datieren sie um die Zeit von Badr.",
      "Medinan, from the early Medinan period, when the rules of fighting came down; some date it around the time of Badr.",
      "مدنية، من أوائل العهد المدني حين نزلت أحكام القتال، ويقرّبها بعضهم من زمن بدر.",
    ),
    asbab: l(
      "Ibn Kathīr führt von Ibn ʿAbbās an, dass Vers 13 herabkam, als der Prophet ﷺ Mekka zur Hijra verließ und auf die Stadt zurückblickte.",
      "Ibn Kathīr cites Ibn ʿAbbās that verse 13 came down when the Prophet ﷺ left Mecca for the hijra and looked back at the city.",
      "نقل ابن كثير عن ابن عباس أن الآية 13 نزلت حين خرج النبي ﷺ من مكة مهاجرًا فالتفت إليها.",
    ),
    connects: l(
      "Al-Aḥqāf endet mit Geduld und der Frage, wer untergeht; Muḥammad zeigt die Leugner, deren Taten verloren gehen, und bereitet auf den Sieg in al-Fatḥ vor.",
      "Al-Aḥqāf ends with patience and the question of who perishes; Muḥammad shows the deniers whose deeds are lost and prepares for the victory in al-Fatḥ.",
      "خُتمت الأحقاف بالصبر وبيان من يهلك، وتبيّن سورة محمد إحباط أعمال الكافرين، وتمهّد للفتح.",
    ),
    lessons: ll(
      ["Wer Allah unterstützt, den unterstützt Er und festigt seine Schritte.", "Über den Qurʾān nachzudenken öffnet verschlossene Herzen.", "Geiz schadet vor allem dem Geizigen selbst."],
      ["Whoever supports Allah's cause, He supports and makes his steps firm.", "Reflecting on the Qurʾān opens locked hearts.", "Stinginess harms above all the stingy one himself."],
      ["من نصر الله نصره وثبّت أقدامه.", "تدبر القرآن يفتح أقفال القلوب.", "من يبخل فإنما يبخل عن نفسه."],
    ),
    questions: ll(
      ["Welches Schloss liegt auf Ihrem Herzen, wenn Sie den Qurʾān lesen?", "Was würden Sie anders geben, wenn Sie wüssten, dass Sie nur sich selbst etwas vorenthalten?"],
      ["Which lock lies on your heart when you read the Qurʾān?", "How would you give differently if you knew you only withhold from yourself?"],
      ["أي قفل على قلبك حين تقرأ القرآن؟", "كيف يتغير عطاؤك إذا علمت أنك إنما تبخل عن نفسك؟"],
    ),
    sections: [
      sec(1, 15, "Zwei Lager, der Kampf und die Ströme des Paradieses", "Two camps, fighting and the rivers of Paradise", "الفريقان والقتال وأنهار الجنة"),
      sec(16, 32, "Die Heuchler und die verschlossenen Herzen", "The hypocrites and locked hearts", "المنافقون وأقفال القلوب"),
      sec(33, 38, "Gehorsam, Standhaftigkeit und Spenden", "Obedience, firmness and spending", "الطاعة والثبات والإنفاق"),
    ],
    src: ["ibnKathir", "saadi", "qurtubi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 48,
    theme: l(
      "Was wie ein Rückschlag aussah, der Vertrag von al-Ḥudaybiya, nennt Allah einen klaren Sieg; Ruhe kommt in die Herzen der Gläubigen, und ihr Treueid wird gewürdigt.",
      "What looked like a setback, the treaty of al-Ḥudaybiya, Allah calls a clear victory; tranquillity enters the hearts of the believers and their pledge is honoured.",
      "ما بدا تراجعًا، صلح الحديبية، سمّاه الله فتحًا مبينًا، وأنزل السكينة في قلوب المؤمنين وأثنى على بيعتهم.",
    ),
    context: l(
      "Medinensisch, im Jahr 6 nach der Hijra auf dem Rückweg von al-Ḥudaybiya herabgesandt.",
      "Medinan, sent down in the year 6 after the hijra on the way back from al-Ḥudaybiya.",
      "مدنية، نزلت في السنة السادسة للهجرة في الرجوع من الحديبية.",
    ),
    asbab: l(
      "Al-Bukhārī berichtet von ʿUmar und Anas, dass die Sure auf dem Rückweg von al-Ḥudaybiya herabkam und der Prophet ﷺ sagte, sie sei ihm lieber als alles, worüber die Sonne aufgeht.",
      "Al-Bukhārī reports from ʿUmar and Anas that the surah came down on the way back from al-Ḥudaybiya, and the Prophet ﷺ said it was dearer to him than all the sun rises upon.",
      "روى البخاري عن عمر وأنس أنها نزلت مرجعه من الحديبية، وأن النبي ﷺ قال: إنها أحب إليه مما طلعت عليه الشمس.",
    ),
    connects: l(
      "Muḥammad endet mit dem Ruf zum Einsatz, al-Fatḥ bringt seine Frucht: den Sieg. Al-Ḥujurāt folgt mit dem Benehmen, das zur Gemeinschaft der Siegreichen gehört.",
      "Muḥammad ends with the call to strive; al-Fatḥ brings its fruit: victory. Al-Ḥujurāt follows with the manners that befit the community of the victorious.",
      "خُتمت سورة محمد بالدعوة إلى البذل، وجاءت الفتح بثمرته، ثم تأتي الحجرات بآداب المجتمع المنتصر.",
    ),
    lessons: ll(
      ["Ein Sieg kann im Gewand eines Kompromisses kommen.", "Innere Ruhe ist ein Geschenk Allahs, keine eigene Leistung.", "Wer zu Hause blieb, sucht Ausreden, doch Allah kennt die Herzen.", "Die Gefährten sind streng gegen das Unrecht und barmherzig untereinander."],
      ["Victory can come dressed as a compromise.", "Inner calm is a gift from Allah, not one's own achievement.", "Those who stayed behind make excuses, but Allah knows the hearts.", "The Companions are firm against wrong and merciful among themselves."],
      ["قد يأتي النصر في صورة صلح.", "السكينة منحة من الله لا كسب ذاتي.", "المخلَّفون يعتذرون والله يعلم ما في القلوب.", "الصحابة حازمون مع الباطل رحماء فيما بينهم."],
    ),
    questions: ll(
      ["Welcher Rückschlag in Ihrem Leben erwies sich später als Öffnung?", "Wie barmherzig sind Sie zu den Menschen, die Ihnen im Glauben nahestehen?"],
      ["Which setback in your life later proved to be an opening?", "How merciful are you to those close to you in faith?"],
      ["أي انتكاسة في حياتك صارت بعد ذلك فتحًا؟", "ما مقدار رحمتك بإخوانك في الإيمان؟"],
    ),
    sections: [
      sec(1, 7, "Der klare Sieg und die Ruhe", "The clear victory and tranquillity", "الفتح المبين والسكينة"),
      sec(8, 17, "Der Treueid und die Zurückgebliebenen", "The pledge and those who stayed behind", "البيعة والمخلَّفون"),
      sec(18, 26, "Der Eid unter dem Baum und die Zurückhaltung", "The pledge under the tree and restraint", "بيعة الرضوان وكف الأيدي"),
      sec(27, 29, "Der wahre Traum und das Bild der Gefährten", "The true dream and the image of the Companions", "الرؤيا الصادقة وصفة الصحابة"),
    ],
    src: ["ibnKathir", "saadi", "tabari", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 49,
    theme: l(
      "Die Gemeinschaft der Gläubigen braucht Benehmen: gegenüber dem Gesandten ﷺ, im Umgang mit Nachrichten und untereinander; Würde misst sich an Gottesfurcht, nicht an Herkunft.",
      "The community of believers needs manners: towards the Messenger ﷺ, in handling news and among each other; honour is measured by God-consciousness, not by lineage.",
      "مجتمع المؤمنين يقوم على الأدب: مع الرسول ﷺ، وفي تلقي الأخبار، وفيما بينهم، والكرامة بالتقوى لا بالنسب.",
    ),
    context: l(
      "Medinensisch, aus der späten medinensischen Zeit um das Jahr 9 nach der Hijra, als die Delegationen kamen.",
      "Medinan, from the late Medinan period around the year 9 after the hijra, when the delegations arrived.",
      "مدنية، من أواخر العهد المدني نحو السنة التاسعة، عام الوفود.",
    ),
    asbab: l(
      "Al-Bukhārī berichtet, dass die Verse 1–2 herabkamen, als Abū Bakr und ʿUmar in Gegenwart des Propheten ﷺ über die Führung einer Delegation der Banū Tamīm ihre Stimmen erhoben.",
      "Al-Bukhārī reports that verses 1–2 came down when Abū Bakr and ʿUmar raised their voices in the Prophet's ﷺ presence over who should lead a delegation of Banū Tamīm.",
      "روى البخاري أن الآيتين 1–2 نزلتا حين ارتفعت أصوات أبي بكر وعمر عند النبي ﷺ في تأمير أحد وفد بني تميم.",
    ),
    connects: l(
      "Al-Fatḥ endet mit dem Bild der Gefährten, al-Ḥujurāt erzieht sie im Benehmen. Qāf wendet sich danach wieder der Auferstehung und den Grundlagen des Glaubens zu.",
      "Al-Fatḥ ends with the portrait of the Companions; al-Ḥujurāt trains them in manners. Qāf then turns back to resurrection and the foundations of faith.",
      "خُتمت الفتح بصفة الصحابة، وجاءت الحجرات بتأديبهم، ثم تعود ق إلى البعث وأصول الإيمان.",
    ),
    lessons: ll(
      ["Nachrichten werden geprüft, bevor man handelt.", "Zwischen streitenden Gläubigen wird gerecht versöhnt.", "Spott, Misstrauen, Spionieren und üble Nachrede zerstören Brüderlichkeit.", "Glaube ist mehr als äußere Zugehörigkeit."],
      ["News is verified before one acts.", "Disputing believers are reconciled with justice.", "Mockery, suspicion, spying and backbiting destroy brotherhood.", "Faith is more than outward belonging."],
      ["يُتثبّت من الخبر قبل العمل.", "يُصلح بين المؤمنين المتنازعين بالعدل.", "السخرية والظن والتجسس والغيبة تهدم الأخوّة.", "الإيمان أعمق من الانتساب الظاهر."],
    ),
    questions: ll(
      ["Welche Nachricht haben Sie zuletzt weitergegeben, ohne sie zu prüfen?", "Über wen haben Sie diese Woche gesprochen, der nicht anwesend war?"],
      ["Which news did you last pass on without verifying it?", "About whom did you speak this week who was not present?"],
      ["أي خبر نقلته آخر مرة دون تثبت؟", "عمن تكلمت هذا الأسبوع وهو غائب؟"],
    ),
    sections: [
      sec(1, 5, "Benehmen gegenüber dem Gesandten ﷺ", "Manners towards the Messenger ﷺ", "الأدب مع الرسول ﷺ"),
      sec(6, 10, "Nachrichten prüfen und versöhnen", "Verifying news and reconciling", "التثبت من الأخبار والإصلاح"),
      sec(11, 13, "Würde, Spott und üble Nachrede", "Dignity, mockery and backbiting", "السخرية والظن والغيبة وميزان التقوى"),
      sec(14, 18, "Islam und Īmān", "Islam and īmān", "الإسلام والإيمان"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 50,
    theme: l(
      "Die Auferstehung ist so gewiss wie die Schöpfung; Allah ist dem Menschen näher als seine Halsschlagader, und jedes Wort wird aufgeschrieben.",
      "Resurrection is as certain as creation; Allah is nearer to a person than his jugular vein, and every word is recorded.",
      "البعث حق كالخلق الأول، والله أقرب إلى الإنسان من حبل الوريد، وكل لفظ مكتوب.",
    ),
    context: l(
      "Mekkanisch, aus der frühen bis mittleren mekkanischen Zeit. Muslim berichtet, dass der Prophet ﷺ sie häufig in der Freitagspredigt rezitierte.",
      "Meccan, from the early to middle Meccan period. Muslim reports that the Prophet ﷺ often recited it in the Friday sermon.",
      "مكية، من المرحلة المكية الأولى أو الوسطى، وروى مسلم أن النبي ﷺ كان يكثر قراءتها في خطبة الجمعة.",
    ),
    connects: l(
      "Al-Ḥujurāt endet damit, dass Allah das Verborgene kennt; Qāf zeigt, wie nah und wie genau Er weiß. Aḏ-Ḏāriyāt setzt mit Schwüren auf die Wahrheit des Versprechens fort.",
      "Al-Ḥujurāt ends with Allah knowing the unseen; Qāf shows how near and precise His knowledge is. Al-Dhāriyāt continues with oaths on the truth of the promise.",
      "خُتمت الحجرات بعلم الله بالغيب، وتبيّن ق قربه وإحاطة علمه، وتأتي الذاريات بالقسم على صدق الوعد.",
    ),
    lessons: ll(
      ["Wer die erste Schöpfung sieht, sollte die zweite nicht bezweifeln.", "Jedes Wort wird von zwei Schreibern festgehalten.", "Der Tod kommt mit Wahrheit, vor der man nicht fliehen kann.", "Die Ermahnung nützt dem, der ein Herz hat oder aufmerksam zuhört."],
      ["Whoever sees the first creation should not doubt the second.", "Every word is kept by two recorders.", "Death comes with truth from which there is no escape.", "Reminder benefits whoever has a heart or listens attentively."],
      ["من رأى الخلق الأول لم يشك في الثاني.", "كل لفظ يحفظه ملكان.", "شدة الموت تأتي بالحق ولا مهرب منها.", "التذكير ينفع صاحب القلب الحي والمستمع الحاضر."],
    ),
    questions: ll(
      ["Welches Ihrer heutigen Worte möchten Sie lieber nicht aufgeschrieben sehen?", "Wie verändert das Wissen um Allahs Nähe Ihr Alleinsein?"],
      ["Which of your words today would you rather not see recorded?", "How does knowing Allah's nearness change your time alone?"],
      ["أي كلماتك اليوم تتمنى ألا تُكتب؟", "كيف يغيّر علمك بقرب الله خلوتك؟"],
    ),
    sections: [
      sec(1, 15, "Zweifel an der Auferstehung und die Zeichen", "Doubt about resurrection and the signs", "إنكار البعث والآيات"),
      sec(16, 29, "Nähe, die zwei Schreiber, Tod und Zeugnis", "Nearness, the two recorders, death and witness", "القرب والرقيبان والموت والشهادة"),
      sec(30, 35, "Die Hölle fragt nach mehr, das Paradies wird nahegebracht", "Hell asks for more, Paradise is brought near", "جهنم تطلب المزيد والجنة تُزلف"),
      sec(36, 45, "Geduld, Lobpreis und Ermahnung durch den Qurʾān", "Patience, glorification and reminding with the Qurʾān", "الصبر والتسبيح والتذكير بالقرآن"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 51,
    theme: l(
      "Das Versprochene ist wahr; die Geschichten der Gesandten bezeugen es, und der Mensch wurde erschaffen, um Allah zu dienen.",
      "What is promised is true; the stories of the messengers bear witness to it, and the human being was created to worship Allah.",
      "الموعود حق، وقصص الرسل شاهدة، والإنسان خُلق لعبادة الله.",
    ),
    context: l(
      "Mekkanisch, aus der frühen bis mittleren mekkanischen Zeit.",
      "Meccan, from the early to middle Meccan period.",
      "مكية، من المرحلة المكية الأولى أو الوسطى.",
    ),
    connects: l(
      "Qāf endet mit der Ermahnung durch den Qurʾān, aḏ-Ḏāriyāt schwört auf die Wahrheit des Versprechens. Aṭ-Ṭūr beginnt ebenso mit Schwüren und der Gewissheit der Strafe.",
      "Qāf ends with reminding by the Qurʾān; al-Dhāriyāt swears to the truth of the promise. Al-Ṭūr likewise opens with oaths and the certainty of punishment.",
      "خُتمت ق بالتذكير بالقرآن، وتقسم الذاريات على صدق الوعد، وتفتتح الطور كذلك بالقسم وتحقق العذاب.",
    ),
    lessons: ll(
      ["Die Gottesfürchtigen schlafen wenig in der Nacht und bitten im Morgengrauen um Vergebung.", "Im Besitz der Wohlhabenden gibt es ein Recht für den Bittenden und den Bedürftigen.", "Gastfreundschaft gehört zum Erbe Ibrāhīms.", "Der Sinn des Lebens ist die Anbetung Allahs."],
      ["The God-fearing sleep little at night and seek forgiveness before dawn.", "In the wealth of the well-off there is a right for the asker and the deprived.", "Hospitality belongs to the legacy of Ibrāhīm.", "The purpose of life is the worship of Allah."],
      ["المتقون يقلّ نومهم بالليل ويستغفرون قبيل الفجر.", "للمحتاج حق في مال الغني.", "إكرام الضيف من ميراث إبراهيم.", "الغاية من الخلق عبادة الله."],
    ),
    questions: ll(
      ["Wohin fliehen Sie, wenn Sie Angst haben, und wohin sollten Sie fliehen?", "Welchen Teil Ihres Tages könnten Sie bewusst zur Anbetung machen?"],
      ["Where do you flee when afraid, and where should you flee?", "Which part of your day could you consciously turn into worship?"],
      ["إلى أين تفرّ حين تخاف، وإلى أين ينبغي أن تفرّ؟", "أي جزء من يومك تستطيع أن تجعله عبادة بنية؟"],
    ),
    sections: [
      sec(1, 23, "Schwüre, das wahre Versprechen und die Gottesfürchtigen", "Oaths, the true promise and the God-fearing", "الأقسام وصدق الوعد وصفات المتقين"),
      sec(24, 37, "Die Gäste Ibrāhīms", "The guests of Ibrāhīm", "ضيف إبراهيم"),
      sec(38, 46, "Mūsā, ʿĀd, Thamūd und Nūḥ", "Mūsā, ʿĀd, Thamūd and Nūḥ", "موسى وعاد وثمود ونوح"),
      sec(47, 60, "Zuflucht bei Allah und der Sinn der Schöpfung", "Refuge in Allah and the purpose of creation", "الفرار إلى الله وغاية الخلق"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "tabari"],
    review: DRAFT,
  },
  {
    s: 52,
    theme: l(
      "Die Strafe tritt gewiss ein; die Gottesfürchtigen werden mit ihren Familien vereint, und eine Kette von Fragen lässt den Leugnern keinen Ausweg.",
      "The punishment will surely come; the God-fearing are united with their families, and a chain of questions leaves the deniers no way out.",
      "العذاب واقع لا محالة، والمتقون يُلحق بهم ذرياتهم، وسلسلة من الأسئلة لا تترك للمكذبين مخرجًا.",
    ),
    context: l(
      "Mekkanisch, aus der mittleren mekkanischen Zeit. Al-Bukhārī berichtet von Jubayr ibn Muṭʿim, dass er sie vom Propheten ﷺ im Abendgebet hörte und der Glaube sich in seinem Herzen festsetzte.",
      "Meccan, from the middle Meccan period. Al-Bukhārī reports from Jubayr ibn Muṭʿim that he heard the Prophet ﷺ recite it in the sunset prayer and faith settled in his heart.",
      "مكية، من المرحلة المكية الوسطى، وروى البخاري عن جبير بن مطعم أنه سمع النبي ﷺ يقرؤها في المغرب فكاد قلبه يطير، وكان ذلك أول ما وقر الإيمان في قلبه.",
    ),
    connects: l(
      "Aḏ-Ḏāriyāt endet mit dem Tag, der den Leugnern angedroht ist; aṭ-Ṭūr beschreibt ihn. An-Najm folgt mit der Bestätigung der Offenbarung selbst.",
      "Al-Dhāriyāt ends with the day threatened to the deniers; al-Ṭūr describes it. Al-Najm follows with the confirmation of revelation itself.",
      "خُتمت الذاريات بيوم الوعيد، وتصفه الطور، وتأتي النجم بتأكيد صدق الوحي.",
    ),
    lessons: ll(
      ["Rechtschaffene Nachkommen werden mit ihren Eltern vereint, ohne dass jemandem etwas genommen wird.", "Furcht in der Familie vor Allah führt zur Sicherheit im Jenseits.", "Ehrliche Fragen entlarven haltlose Ablehnung.", "Geduld steht unter Allahs Augen."],
      ["Righteous offspring are joined with their parents without anyone losing anything.", "Awe of Allah within the family leads to safety in the hereafter.", "Honest questions expose baseless rejection.", "Patience is under Allah's eyes."],
      ["تُلحق الذرية المؤمنة بآبائها دون نقص.", "الإشفاق في الأهل سبيل الأمن في الآخرة.", "الأسئلة الصادقة تكشف الإنكار بلا حجة.", "الصابر في رعاية الله."],
    ),
    questions: ll(
      ["Welche Frage aus dieser Sure würden Sie sich selbst ehrlich stellen?", "Was tun Sie heute dafür, mit Ihrer Familie im Paradies vereint zu sein?"],
      ["Which question from this surah would you honestly ask yourself?", "What are you doing today to be united with your family in Paradise?"],
      ["أي سؤال من أسئلة السورة تطرحه على نفسك بصدق؟", "ماذا تعمل اليوم لتجتمع بأهلك في الجنة؟"],
    ),
    sections: [
      sec(1, 16, "Schwüre und die Gewissheit der Strafe", "Oaths and the certainty of punishment", "الأقسام ووقوع العذاب"),
      sec(17, 28, "Die Gottesfürchtigen und ihre Familien", "The God-fearing and their families", "المتقون وذرياتهم"),
      sec(29, 44, "Fragen an die Leugner", "Questions to the deniers", "أسئلة التحدي للمكذبين"),
      sec(45, 49, "Geduld und Lobpreis", "Patience and glorification", "الصبر والتسبيح"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 53,
    theme: l(
      "Der Gesandte ﷺ spricht nicht aus eigener Neigung, sondern aus Offenbarung; Götzen sind bloße Namen, und jeder Mensch erhält nur, wonach er strebt.",
      "The Messenger ﷺ does not speak from his own desire but from revelation; idols are mere names, and each person receives only what he strives for.",
      "كلام الرسول ﷺ وحي لا رأي شخصي، والأصنام أسماء بلا حقيقة، ولا ينال المرء إلا ثمرة سعيه.",
    ),
    context: l(
      "Mekkanisch, aus der frühen mekkanischen Zeit; eine der ersten Suren, die der Prophet ﷺ öffentlich rezitierte.",
      "Meccan, from the early Meccan period; one of the first surahs the Prophet ﷺ recited publicly.",
      "مكية، من أوائل ما نزل بمكة، ومن أول ما جهر به النبي ﷺ.",
    ),
    asbab: l(
      "Al-Bukhārī berichtet von Ibn Masʿūd und Ibn ʿAbbās, dass der Prophet ﷺ sie rezitierte und am Ende niederfiel und alle Anwesenden mit ihm niederfielen.",
      "Al-Bukhārī reports from Ibn Masʿūd and Ibn ʿAbbās that the Prophet ﷺ recited it and prostrated at its end, and all who were present prostrated with him.",
      "روى البخاري عن ابن مسعود وابن عباس أن النبي ﷺ قرأها فسجد في آخرها وسجد من كان معه.",
    ),
    connects: l(
      "Aṭ-Ṭūr endet mit dem Lobpreis beim Untergang der Sterne, an-Najm beginnt mit einem Schwur beim Stern. Al-Qamar setzt mit dem Nahen der Stunde fort, das am Ende von an-Najm angekündigt wird.",
      "Al-Ṭūr ends with glorification at the setting of the stars; al-Najm opens with an oath by the star. Al-Qamar continues with the nearing of the Hour announced at the end of al-Najm.",
      "خُتمت الطور بالتسبيح إدبار النجوم، وافتُتحت النجم بالقسم بالنجم، وتواصل القمر اقتراب الساعة الذي أُنذر به في آخر النجم.",
    ),
    lessons: ll(
      ["Die Offenbarung ist die Quelle, nicht persönliche Meinung.", "Vermutung ersetzt keine Wahrheit.", "Niemand trägt die Last eines anderen.", "Sich nicht selbst für rein erklären: Allah kennt die Gottesfürchtigen."],
      ["Revelation is the source, not personal opinion.", "Conjecture does not replace truth.", "No one bears another's burden.", "Do not declare yourselves pure: Allah knows the God-fearing."],
      ["الوحي هو المصدر لا الرأي.", "التخمين لا يقوم مقام الحقيقة.", "لا يحمل أحد ذنب غيره.", "لا يمدح المرء نفسه بالطهارة، فالله أعلم بأهل التقوى."],
    ),
    questions: ll(
      ["Wo halten Sie eine Vermutung für Gewissheit?", "Wofür strengen Sie sich am meisten an, und wird es Ihnen bleiben?"],
      ["Where do you take conjecture for certainty?", "What do you strive for most, and will it remain yours?"],
      ["أين تعدّ الظن يقينًا؟", "لأي شيء تسعى أكثر، وهل يبقى لك؟"],
    ),
    sections: [
      sec(1, 18, "Die Offenbarung und die Himmelsreise", "Revelation and the heavenly journey", "الوحي والمعراج"),
      sec(19, 32, "Götzen als leere Namen", "Idols as empty names", "أسماء الأصنام والظن"),
      sec(33, 55, "Was in den Schriften Mūsās und Ibrāhīms steht", "What is in the scriptures of Mūsā and Ibrāhīm", "ما في صحف موسى وإبراهيم"),
      sec(56, 62, "Die Warnung und der Aufruf zur Niederwerfung", "The warning and the call to prostrate", "النذير والأمر بالسجود"),
    ],
    src: ["ibnKathir", "saadi", "tabari", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 54,
    theme: l(
      "Die Stunde ist nahe, und die Geschichten der früheren Völker sind Warnungen; der Qurʾān ist zum Bedenken leicht gemacht.",
      "The Hour is near, and the stories of earlier peoples are warnings; the Qurʾān has been made easy for remembrance.",
      "الساعة قريبة، وأخبار الأمم نُذر، والقرآن ميسَّر للذكر.",
    ),
    context: l(
      "Mekkanisch, aus der frühen bis mittleren mekkanischen Zeit.",
      "Meccan, from the early to middle Meccan period.",
      "مكية، من المرحلة المكية الأولى أو الوسطى.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Ibn Masʿūd und Anas, dass sich der Mond in Mekka spaltete, als Quraysh ein Zeichen verlangten.",
      "Al-Bukhārī and Muslim report from Ibn Masʿūd and Anas that the moon split in Mecca when Quraysh demanded a sign.",
      "روى البخاري ومسلم عن ابن مسعود وأنس انشقاق القمر بمكة حين سألت قريش آية.",
    ),
    connects: l(
      "An-Najm endet mit dem Nahen der Stunde, al-Qamar beginnt damit. Ar-Raḥmān folgt mit der Barmherzigkeit, die sich im leicht gemachten Qurʾān zeigt.",
      "Al-Najm ends with the nearing of the Hour; al-Qamar begins with it. Al-Raḥmān follows with the mercy shown in the Qurʾān made easy.",
      "خُتمت النجم باقتراب الآزفة وافتُتحت القمر باقتراب الساعة، وتأتي الرحمن بالرحمة التي من آثارها تيسير القرآن.",
    ),
    lessons: ll(
      ["Wunder überzeugen nicht den, der nicht glauben will.", "Der Qurʾān ist leicht zu erinnern; die Frage ist, wer sich erinnern lässt.", "Alles ist nach Maß erschaffen."],
      ["Miracles do not convince those unwilling to believe.", "The Qurʾān is easy to remember; the question is who lets himself be reminded.", "Everything is created according to measure."],
      ["الآيات لا تقنع من أبى الإيمان.", "القرآن سهل التذكر، والعبرة بمن يتعظ.", "كل مخلوق بتقدير محكم."],
    ),
    questions: ll(
      ["Wie antworten Sie auf die wiederholte Frage, ob es jemanden gibt, der sich ermahnen lässt?", "Welche Warnung haben Sie gesehen und dennoch übergangen?"],
      ["How do you answer the repeated question whether anyone will take heed?", "Which warning have you seen and still passed over?"],
      ["كيف تجيب عن السؤال المتكرر في السورة عمن يتعظ؟", "أي نذير رأيته ثم أعرضت عنه؟"],
    ),
    sections: [
      sec(1, 8, "Der gespaltene Mond und die nahe Stunde", "The split moon and the near Hour", "انشقاق القمر واقتراب الساعة"),
      sec(9, 22, "Nūḥ und ʿĀd", "Nūḥ and ʿĀd", "قوم نوح وعاد"),
      sec(23, 40, "Thamūd und das Volk Lūṭs", "Thamūd and the people of Lūṭ", "ثمود وقوم لوط"),
      sec(41, 55, "Firʿawn, die Leugner und das Ende der Gottesfürchtigen", "Pharaoh, the deniers and the end of the God-fearing", "آل فرعون والمكذبون ومقعد صدق"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 57,
    theme: l(
      "Glaube zeigt sich im Spenden und in einem demütigen Herzen; die Welt ist ein vergängliches Spiel, und am Tag der Auferstehung leuchtet den Gläubigen ihr Licht voraus.",
      "Faith shows itself in spending and in a humble heart; the world is passing play, and on the Day of Resurrection the believers' light runs before them.",
      "الإيمان يظهر في الإنفاق وخشوع القلب، والدنيا لعب زائل، وللمؤمنين نور يتقدمهم يوم القيامة.",
    ),
    context: l(
      "Medinensisch nach der Mehrheit; einige hielten sie für mekkanisch. Ibn ʿĀshūr ordnet sie der medinensischen Zeit zu.",
      "Medinan according to the majority; some held it to be Meccan. Ibn ʿĀshūr places it in the Medinan period.",
      "مدنية عند الجمهور، وقيل مكية، ورجّح ابن عاشور أنها مدنية.",
    ),
    asbab: l(
      "Muslim berichtet von Ibn Masʿūd, dass zwischen ihrem Islam und der Ermahnung durch Vers 16 nur wenige Jahre lagen.",
      "Muslim reports from Ibn Masʿūd that only a few years passed between their embracing Islam and being admonished by verse 16.",
      "روى مسلم عن ابن مسعود أنه لم يكن بين إسلامهم وبين أن عوتبوا بالآية 16 إلا سنوات يسيرة.",
    ),
    connects: l(
      "Al-Wāqiʿa endet mit dem Lobpreis des gewaltigen Herrn, al-Ḥadīd beginnt mit dem Lobpreis aller Dinge. Al-Mujādila zeigt danach, wie Allah die Klage einer einzelnen Frau hört.",
      "Al-Wāqiʿa ends with glorifying the Mighty Lord; al-Ḥadīd opens with all things glorifying Him. Al-Mujādila then shows how Allah hears the complaint of a single woman.",
      "خُتمت الواقعة بالأمر بالتسبيح، وافتُتحت الحديد بتسبيح ما في السماوات والأرض، ثم تبيّن المجادلة سماع الله شكوى امرأة واحدة.",
    ),
    lessons: ll(
      ["Was Sie besitzen, ist Ihnen nur anvertraut.", "Herzen verhärten, wenn die Zeit lang wird; sie brauchen regelmäßige Erneuerung.", "Die Welt ist Spiel, Schmuck und Prahlerei, das Jenseits ist Vergebung und Wohlgefallen.", "Was geschieht, ist vorherbestimmt, damit man weder verzweifelt noch prahlt."],
      ["What you own is only entrusted to you.", "Hearts harden when time grows long; they need regular renewal.", "The world is play, adornment and boasting; the hereafter is forgiveness and good pleasure.", "What happens is decreed, so that one neither despairs nor boasts."],
      ["ما تملكه مستخلف فيه.", "القلوب تقسو بطول الأمد فتحتاج إلى تجديد.", "الدنيا لعب وزينة وتفاخر، والآخرة مغفرة ورضوان.", "ما يصيب مكتوب لئلا يأسى المرء ولا يفرح فرح بطر."],
    ),
    questions: ll(
      ["Ist für Ihr Herz die Zeit gekommen, demütig zu werden?", "Was würden Sie spenden, wenn Sie es als Darlehen an Allah sähen?"],
      ["Has the time come for your heart to be humbled?", "What would you give if you saw it as a loan to Allah?"],
      ["هل حان لقلبك أن يلين ويخشع؟", "ماذا تنفق لو رأيته قرضًا حسنًا لله؟"],
    ),
    sections: [
      sec(1, 6, "Lobpreis und die Namen Allahs", "Glorification and the names of Allah", "التسبيح وأسماء الله"),
      sec(7, 15, "Spenden und das Licht am Tag der Auferstehung", "Spending and the light on the Day of Resurrection", "الإنفاق ونور المؤمنين"),
      sec(16, 19, "Demut des Herzens", "Humility of the heart", "خشوع القلوب"),
      sec(20, 24, "Die Welt als vergängliches Spiel", "The world as passing play", "حقيقة الدنيا"),
      sec(25, 29, "Gesandte, Waage und Eisen", "Messengers, balance and iron", "الرسل والميزان والحديد"),
    ],
    src: ["ibnKathir", "saadi", "ibnAshur", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 58,
    theme: l(
      "Allah hört die Klage der Schwachen; Er ordnet das Familienleben, die Versammlungen und die Loyalität der Gläubigen.",
      "Allah hears the complaint of the weak; He orders family life, gatherings and the loyalty of believers.",
      "الله يسمع شكوى الضعيف، وينظم شؤون الأسرة والمجالس وولاء المؤمنين.",
    ),
    context: l(
      "Medinensisch, aus der mittleren medinensischen Zeit.",
      "Medinan, from the middle Medinan period.",
      "مدنية، من المرحلة المدنية الوسطى.",
    ),
    asbab: l(
      "Abū Dāwūd und Aḥmad berichten, dass die Verse 1–4 über Khawla bint Thaʿlaba herabkamen, deren Ehemann Aws ibn aṣ-Ṣāmit die Ẓihār-Formel ausgesprochen hatte; ʿĀʾishas Wort darüber, dass Allah ihre Klage hörte, führt al-Bukhārī an.",
      "Abū Dāwūd and Aḥmad report that verses 1–4 came down concerning Khawla bint Thaʿlaba, whose husband Aws ibn al-Ṣāmit had pronounced ẓihār; ʿĀʾisha's remark that Allah heard her complaint is cited by al-Bukhārī.",
      "روى أبو داود وأحمد أن الآيات 1–4 نزلت في خولة بنت ثعلبة حين ظاهر منها زوجها أوس بن الصامت، وذكر البخاري قول عائشة في سماع الله لشكواها.",
    ),
    connects: l(
      "Al-Ḥadīd endet mit Allahs Huld, al-Mujādila zeigt sie im Hören einer einzelnen Frau. Al-Ḥašr folgt mit dem Schicksal derer, die sich gegen Allah und Seinen Gesandten ﷺ stellten.",
      "Al-Ḥadīd ends with Allah's bounty; al-Mujādila shows it in His hearing of a single woman. Al-Ḥashr follows with the fate of those who opposed Allah and His Messenger ﷺ.",
      "خُتمت الحديد بفضل الله، وتظهره المجادلة في سماع شكوى امرأة، وتأتي الحشر بمصير من حادّ الله ورسوله ﷺ.",
    ),
    lessons: ll(
      ["Keine Klage ist zu klein für Allah.", "Ein Wort kann Unrecht in der Ehe schaffen und braucht Sühne.", "Heimliche Gespräche sollen dem Guten dienen.", "Wissen und Glaube erhöhen den Rang."],
      ["No complaint is too small for Allah.", "A word can wrong a marriage and requires expiation.", "Private conversations should serve the good.", "Knowledge and faith raise one's rank."],
      ["لا شكوى تصغر عند الله.", "الكلمة قد تظلم الزوجة وتحتاج إلى كفارة.", "الحديث السري يكون في الخير لا في الإثم.", "الإيمان والعلم سببان لرفعة الدرجة."],
    ),
    questions: ll(
      ["Welche Sorge tragen Sie, die Sie Allah noch nicht geklagt haben?", "Wie machen Sie in Ihren Versammlungen Platz für andere?"],
      ["What worry do you carry that you have not yet complained of to Allah?", "How do you make room for others in your gatherings?"],
      ["أي همّ تحمله لم تشكه إلى الله بعد؟", "كيف تفسح لغيرك في مجالسك؟"],
    ),
    sections: [
      sec(1, 4, "Die Klage der Frau und die Ẓihār-Regel", "The woman's complaint and the ruling on ẓihār", "المجادِلة وحكم الظهار"),
      sec(5, 13, "Heimliche Gespräche und das Benehmen in Versammlungen", "Private talk and manners in gatherings", "النجوى وآداب المجالس"),
      sec(14, 22, "Die Partei Satans und die Partei Allahs", "The party of Satan and the party of Allah", "حزب الشيطان وحزب الله"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 59,
    theme: l(
      "Die Vertreibung der Banū an-Naḍīr zeigt, dass Festungen nicht vor Allah schützen; die Verteilung des Fayʾ und das Vorbild der Anṣār lehren Großzügigkeit, und die Namen Allahs krönen die Sure.",
      "The expulsion of Banū al-Naḍīr shows that fortresses do not protect from Allah; the distribution of fayʾ and the example of the Anṣār teach generosity, and the names of Allah crown the surah.",
      "إجلاء بني النضير يبين أن الحصون لا تمنع من الله، وقسمة الفيء وإيثار الأنصار يعلّمان البذل، وتُختم السورة بأسماء الله الحسنى.",
    ),
    context: l(
      "Medinensisch, nach der Vertreibung der Banū an-Naḍīr im Jahr 4 nach der Hijra. Al-Bukhārī berichtet, dass Ibn ʿAbbās sie die Sure der Banū an-Naḍīr nannte.",
      "Medinan, after the expulsion of Banū al-Naḍīr in the year 4 after the hijra. Al-Bukhārī reports that Ibn ʿAbbās called it the surah of Banū al-Naḍīr.",
      "مدنية، نزلت بعد إجلاء بني النضير في السنة الرابعة، وروى البخاري أن ابن عباس سمّاها سورة بني النضير.",
    ),
    asbab: l(
      "Zu Vers 9 berichten al-Bukhārī und Muslim von Abū Hurayra die Geschichte eines Anṣārī, der seinen Gast bewirtete, während er und seine Familie hungrig blieben.",
      "On verse 9, al-Bukhārī and Muslim report from Abū Hurayra the story of an Anṣārī who fed his guest while he and his family went hungry.",
      "في الآية 9 روى البخاري ومسلم عن أبي هريرة قصة الأنصاري الذي أطعم ضيفه وبات هو وأهله جائعين.",
    ),
    connects: l(
      "Al-Mujādila endet mit der Partei Allahs, al-Ḥašr zeigt sie in der Tat und das Ende ihrer Gegner. Al-Mumtaḥana setzt mit der Frage der Loyalität fort.",
      "Al-Mujādila ends with the party of Allah; al-Ḥashr shows it in action and the end of its opponents. Al-Mumtaḥana continues with the question of loyalty.",
      "خُتمت المجادلة بحزب الله، وتبيّنه الحشر عملًا مع مصير خصومه، وتواصل الممتحنة مسألة الولاء.",
    ),
    lessons: ll(
      ["Wer auf Mauern vertraut, wird von innen überwunden.", "Besitz soll nicht nur unter den Reichen kreisen.", "Selbstlosigkeit trotz eigener Not ist ein Kennzeichen der Erfolgreichen.", "Bitte um ein Herz ohne Groll gegen die früheren Gläubigen."],
      ["Whoever trusts in walls is overcome from within.", "Wealth should not circulate only among the rich.", "Preferring others despite one's own need marks the successful.", "Ask for a heart without rancour towards earlier believers."],
      ["من اعتمد على الحصون أُتي من داخله.", "لا يُحصر تداول المال بين الأغنياء.", "تقديم الغير مع الحاجة سمة المفلحين.", "سؤال سلامة القلب من الحقد على السابقين بالإيمان."],
    ),
    questions: ll(
      ["Was haben Sie für morgen vorausgeschickt?", "Wann haben Sie zuletzt jemand anderen sich selbst vorgezogen?"],
      ["What have you sent ahead for tomorrow?", "When did you last prefer someone else to yourself?"],
      ["ما الذي أعددته للآخرة؟", "متى آثرت غيرك على نفسك آخر مرة؟"],
    ),
    sections: [
      sec(1, 5, "Die Vertreibung der Banū an-Naḍīr", "The expulsion of Banū al-Naḍīr", "إجلاء بني النضير"),
      sec(6, 10, "Der Fayʾ, die Muhājirūn, die Anṣār und die Späteren", "The fayʾ, the Muhājirūn, the Anṣār and those after", "الفيء والمهاجرون والأنصار والتابعون"),
      sec(11, 17, "Die leeren Versprechen der Heuchler", "The empty promises of the hypocrites", "وعود المنافقين"),
      sec(18, 24, "Gottesfurcht, der Qurʾān und die schönsten Namen", "God-consciousness, the Qurʾān and the most beautiful names", "التقوى والقرآن والأسماء الحسنى"),
    ],
    src: ["ibnKathir", "saadi", "tabari", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 60,
    theme: l(
      "Loyalität gehört Allah und den Gläubigen; Ibrāhīm ist das Vorbild, doch Gerechtigkeit und Güte gegenüber Friedlichen bleiben geboten.",
      "Loyalty belongs to Allah and the believers; Ibrāhīm is the example, yet justice and kindness towards the peaceful remain commanded.",
      "الولاء لله وللمؤمنين، وإبراهيم أسوة، والبر والقسط مع المسالمين مشروعان.",
    ),
    context: l(
      "Medinensisch, kurz vor der Einnahme Mekkas im Jahr 8 nach der Hijra; die Verse über die auswandernden Frauen beziehen sich auf die Zeit nach al-Ḥudaybiya.",
      "Medinan, shortly before the conquest of Mecca in the year 8 after the hijra; the verses on emigrating women refer to the time after al-Ḥudaybiya.",
      "مدنية، قبيل فتح مكة في السنة الثامنة، وآيات المهاجرات تتعلق بما بعد الحديبية.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von ʿAlī, dass der Anfang der Sure über Ḥāṭib ibn Abī Baltaʿa herabkam, der Quraysh brieflich vor dem Feldzug warnen wollte.",
      "Al-Bukhārī and Muslim report from ʿAlī that the opening of the surah came down concerning Ḥāṭib ibn Abī Baltaʿa, who tried to warn Quraysh of the campaign by letter.",
      "روى البخاري ومسلم عن علي أن أول السورة نزل في حاطب بن أبي بلتعة حين كتب إلى قريش يخبرهم بمسير النبي ﷺ.",
    ),
    connects: l(
      "Al-Ḥašr endet mit den Heuchlern, die sich mit den Feinden verbünden; al-Mumtaḥana verbietet den Gläubigen dieses Bündnis. Aṣ-Ṣaff ruft danach zur geschlossenen Reihe.",
      "Al-Ḥashr ends with hypocrites allying with enemies; al-Mumtaḥana forbids believers such alliances. Al-Ṣaff then calls to a united rank.",
      "ذكرت الحشر موالاة المنافقين للأعداء، وتنهى الممتحنة المؤمنين عن ذلك، ثم تدعو الصف إلى الاصطفاف.",
    ),
    lessons: ll(
      ["Auch ein verdienter Gefährte kann irren, und ihm wird vergeben.", "Verwandtschaft nützt am Jüngsten Tag nichts ohne Glauben.", "Allah verbietet nicht Güte und Gerechtigkeit gegenüber denen, die nicht bekämpfen.", "Feindschaft von heute kann zu Zuneigung werden."],
      ["Even a distinguished Companion can err, and he is forgiven.", "Kinship avails nothing on the Last Day without faith.", "Allah does not forbid kindness and justice towards those who do not fight.", "Today's enmity may turn into affection."],
      ["قد يخطئ الصحابي الفاضل فيُغفر له.", "القرابة لا تنفع يوم القيامة بلا إيمان.", "لا ينهى الله عن البر والقسط مع غير المحاربين.", "قد تتحول العداوة اليوم إلى مودة."],
    ),
    questions: ll(
      ["Wo könnte Ihre Sorge um Familie oder Besitz Ihre Treue zur Wahrheit schwächen?", "Wem gegenüber könnten Sie heute gerecht und gütig sein, obwohl er anders denkt?"],
      ["Where might concern for family or wealth weaken your loyalty to truth?", "To whom could you be just and kind today though he thinks differently?"],
      ["أين قد يُضعف حرصك على الأهل أو المال ولاءك للحق؟", "مع من تستطيع اليوم البر والقسط وإن خالفك؟"],
    ),
    sections: [
      sec(1, 3, "Ḥāṭibs Brief und die Warnung", "Ḥāṭib's letter and the warning", "كتاب حاطب والتحذير"),
      sec(4, 7, "Das Vorbild Ibrāhīms", "The example of Ibrāhīm", "الأسوة في إبراهيم"),
      sec(8, 9, "Güte und Gerechtigkeit gegenüber Friedlichen", "Kindness and justice to the peaceful", "البر والقسط مع المسالمين"),
      sec(10, 13, "Die auswandernden Frauen und der Treueid", "The emigrating women and the pledge", "المهاجرات والبيعة"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 61,
    theme: l(
      "Die Gläubigen sollen tun, was sie sagen, und wie eine feste Reihe für Allahs Sache einstehen; das beste Geschäft ist Glaube und Einsatz.",
      "Believers should do what they say and stand like a solid rank for Allah's cause; the best trade is faith and striving.",
      "على المؤمنين أن يفعلوا ما يقولون، وأن يكونوا صفًا كالبنيان المرصوص، وخير تجارة الإيمان والجهاد.",
    ),
    context: l(
      "Medinensisch, aus der mittleren medinensischen Zeit.",
      "Medinan, from the middle Medinan period.",
      "مدنية، من المرحلة المدنية الوسطى.",
    ),
    asbab: l(
      "At-Tirmidhī und Aḥmad berichten von ʿAbdallāh ibn Salām, dass einige Gefährten fragen wollten, welche Tat Allah am liebsten ist, und daraufhin die Sure herabkam.",
      "Al-Tirmidhī and Aḥmad report from ʿAbdallāh ibn Salām that some Companions wished to ask which deed Allah loves most, whereupon the surah came down.",
      "روى الترمذي وأحمد عن عبد الله بن سلام أن نفرًا من الصحابة أرادوا أن يسألوا عن أحب الأعمال إلى الله فنزلت السورة.",
    ),
    connects: l(
      "Al-Mumtaḥana trennt die Loyalitäten, aṣ-Ṣaff ordnet die Reihe der Gläubigen. Al-Jumuʿa beginnt ebenso mit dem Lobpreis und spricht vom Gesandten ﷺ unter den Schriftunkundigen.",
      "Al-Mumtaḥana separates loyalties; al-Ṣaff orders the believers' rank. Al-Jumuʿa likewise opens with glorification and speaks of the Messenger ﷺ among the unlettered.",
      "ميّزت الممتحنة الولاء، ونظّمت الصف صفوف المؤمنين، وتفتتح الجمعة بالتسبيح كذلك وتذكر بعثة الرسول ﷺ في الأميين.",
    ),
    lessons: ll(
      ["Zu sagen, was man nicht tut, ist bei Allah sehr verhasst.", "Einheit ist die Stärke der Gläubigen.", "Allah vollendet Sein Licht, auch wenn es manchen missfällt.", "Werden Sie Helfer Allahs wie die Jünger ʿĪsās."],
      ["Saying what one does not do is greatly hateful to Allah.", "Unity is the strength of believers.", "Allah perfects His light even if some dislike it.", "Be helpers of Allah like the disciples of ʿĪsā."],
      ["مخالفة القول للفعل من أبغض الأمور عند الله.", "الوحدة قوة المؤمنين.", "الله يتم نوره مهما كره المعرضون.", "كن من أنصار دين الله كما كان الحواريون."],
    ),
    questions: ll(
      ["Welches Versprechen haben Sie gegeben, das Sie noch nicht eingelöst haben?", "In welcher Reihe stehen Sie, und halten Sie sie geschlossen?"],
      ["Which promise have you made that you have not yet kept?", "In which rank do you stand, and do you keep it closed?"],
      ["أي وعد قطعته ولم تفِ به بعد؟", "في أي صف تقف، وهل تحفظ تماسكه؟"],
    ),
    sections: [
      sec(1, 4, "Wort und Tat, die feste Reihe", "Word and deed, the solid rank", "القول والفعل والصف المرصوص"),
      sec(5, 9, "Mūsā, ʿĪsā und die Ankündigung des Gesandten ﷺ", "Mūsā, ʿĪsā and the announcement of the Messenger ﷺ", "موسى وعيسى والبشارة بالرسول ﷺ"),
      sec(10, 14, "Das rettende Geschäft und die Helfer Allahs", "The saving trade and the helpers of Allah", "التجارة المنجية وأنصار الله"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 62,
    theme: l(
      "Die Sendung des Gesandten ﷺ ist eine Gnade, die läutert und lehrt; Wissen ohne Handeln ist eine Last, und der Freitag ruft vom Handel zum Gedenken.",
      "The sending of the Messenger ﷺ is a grace that purifies and teaches; knowledge without practice is a burden, and Friday calls from trade to remembrance.",
      "بعثة الرسول ﷺ منّة تزكي وتعلّم، والعلم بلا عمل حِمل، والجمعة تدعو من البيع إلى ذكر الله.",
    ),
    context: l(
      "Medinensisch, aus der frühen bis mittleren medinensischen Zeit.",
      "Medinan, from the early to middle Medinan period.",
      "مدنية، من المرحلة المدنية الأولى أو الوسطى.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Jābir, dass Vers 11 herabkam, als während der Freitagspredigt eine Karawane eintraf und die meisten hinausgingen.",
      "Al-Bukhārī and Muslim report from Jābir that verse 11 came down when a caravan arrived during the Friday sermon and most people went out.",
      "روى البخاري ومسلم عن جابر أن الآية 11 نزلت حين قدمت عير يوم الجمعة والنبي ﷺ يخطب فانفتل الناس إليها.",
    ),
    connects: l(
      "Aṣ-Ṣaff endet mit den Helfern Allahs, al-Jumuʿa zeigt die Gemeinschaft, die der Gesandte ﷺ heranbildet. Al-Munāfiqūn folgt mit denen, die nur äußerlich dazugehören.",
      "Al-Ṣaff ends with the helpers of Allah; al-Jumuʿa shows the community the Messenger ﷺ forms. Al-Munāfiqūn follows with those who belong only outwardly.",
      "خُتمت الصف بأنصار الله، وتبيّن الجمعة الأمة التي يربيها الرسول ﷺ، ثم تأتي المنافقون بمن انتسب إليها ظاهرًا.",
    ),
    lessons: ll(
      ["Läuterung und Lehre gehören zusammen.", "Wer die Schrift trägt, ohne nach ihr zu handeln, gleicht einem beladenen Lasttier.", "Vor dem Tod kann man nicht fliehen.", "Arbeit und Handel haben ihre Zeit, das Gebet hat Vorrang."],
      ["Purification and teaching belong together.", "Whoever carries scripture without acting on it is like a laden beast.", "There is no fleeing from death.", "Work and trade have their time; prayer comes first."],
      ["التزكية والتعليم متلازمان.", "من حمل العلم ولم يعمل به كالدابة تحمل الكتب.", "لا فرار من الموت.", "للعمل والتجارة وقت، وللصلاة الأولوية."],
    ),
    questions: ll(
      ["Welches Wissen tragen Sie, das Sie noch nicht umsetzen?", "Was zieht Sie am Freitag vom Gedenken weg?"],
      ["What knowledge do you carry that you do not yet act on?", "What draws you away from remembrance on Friday?"],
      ["أي علم تحمله ولا تعمل به بعد؟", "ما الذي يشغلك عن ذكر الله يوم الجمعة؟"],
    ),
    sections: [
      sec(1, 4, "Der Gesandte ﷺ unter den Schriftunkundigen", "The Messenger ﷺ among the unlettered", "بعثة الرسول ﷺ في الأميين"),
      sec(5, 8, "Wissen ohne Handeln und die Flucht vor dem Tod", "Knowledge without practice and fleeing death", "العلم بلا عمل والفرار من الموت"),
      sec(9, 11, "Der Ruf zum Freitagsgebet", "The call to the Friday prayer", "النداء لصلاة الجمعة"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 63,
    theme: l(
      "Die Heuchler sprechen schön und sind innerlich leer; die Gläubigen sollen sich von Besitz und Kindern nicht vom Gedenken ablenken lassen und spenden, bevor der Tod kommt.",
      "The hypocrites speak well and are hollow inside; believers should not let wealth and children distract them from remembrance, and should give before death comes.",
      "المنافقون حسنو القول خاوو الباطن، والمؤمن لا ينشغل بالمال والولد عن ذكر الله، وينفق قبل أن يأتيه الموت.",
    ),
    context: l(
      "Medinensisch, nach dem Feldzug gegen die Banū al-Muṣṭaliq im Jahr 5 oder 6 nach der Hijra.",
      "Medinan, after the campaign against Banū al-Muṣṭaliq in the year 5 or 6 after the hijra.",
      "مدنية، بعد غزوة بني المصطلق في السنة الخامسة أو السادسة.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Zayd ibn Arqam, dass er die Worte ʿAbdallāh ibn Ubayys gegen die Muhājirūn meldete, man ihm nicht glaubte und dann die Sure seine Aussage bestätigte.",
      "Al-Bukhārī and Muslim report from Zayd ibn Arqam that he reported ʿAbdallāh ibn Ubayy's words against the Muhājirūn, was not believed, and the surah then confirmed his account.",
      "روى البخاري ومسلم عن زيد بن أرقم أنه نقل مقالة عبد الله بن أبي في المهاجرين فكُذّب، ثم نزلت السورة تصديقًا له.",
    ),
    connects: l(
      "Al-Jumuʿa warnt davor, sich vom Gedenken ablenken zu lassen, al-Munāfiqūn wiederholt die Warnung mit Besitz und Kindern. At-Taghābun zeigt danach den Tag, an dem der Verlust offenbar wird.",
      "Al-Jumuʿa warns against being distracted from remembrance; al-Munāfiqūn repeats the warning with wealth and children. Al-Taghābun then shows the day loss becomes manifest.",
      "حذّرت الجمعة من الانشغال عن الذكر، وتكرر المنافقون التحذير بالأموال والأولاد، وتبيّن التغابن يوم ظهور الغبن.",
    ),
    lessons: ll(
      ["Äußere Erscheinung und schöne Rede sagen nichts über das Herz.", "Ehre gehört Allah, Seinem Gesandten ﷺ und den Gläubigen.", "Aufschieben der guten Tat wird in der Todesstunde bereut."],
      ["Outward appearance and fine speech say nothing about the heart.", "Honour belongs to Allah, His Messenger ﷺ and the believers.", "Postponing good deeds is regretted at the hour of death."],
      ["المظهر وحسن القول لا يدلان على القلب.", "العزة لله ولرسوله ﷺ وللمؤمنين.", "تأخير العمل الصالح ندامة عند الموت."],
    ),
    questions: ll(
      ["Was würden Sie tun, wenn Ihnen nur noch eine kurze Frist bliebe?", "Wo unterscheidet sich Ihr Inneres von dem, was andere sehen?"],
      ["What would you do if only a short respite remained?", "Where does your inner self differ from what others see?"],
      ["ماذا تفعل لو بقي لك أجل قريب؟", "أين يختلف باطنك عما يراه الناس؟"],
    ),
    sections: [
      sec(1, 8, "Das Bild der Heuchler", "The portrait of the hypocrites", "صفات المنافقين"),
      sec(9, 11, "Gedenken und Spenden vor dem Tod", "Remembrance and giving before death", "الذكر والإنفاق قبل الموت"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "tabari"],
    review: DRAFT,
  },
  {
    s: 64,
    theme: l(
      "Am Tag der gegenseitigen Übervorteilung zeigt sich, wer wirklich gewonnen und wer verloren hat; Unglück geschieht mit Allahs Erlaubnis, und Familie und Besitz sind Prüfungen.",
      "On the Day of Mutual Loss it becomes clear who truly gained and who lost; misfortune happens by Allah's leave, and family and wealth are trials.",
      "يوم التغابن يظهر الرابح والخاسر حقًا، والمصيبة بإذن الله، والأهل والمال فتنة.",
    ),
    context: l(
      "Medinensisch nach der Mehrheit; einige hielten sie für mekkanisch oder für mekkanisch bis auf die letzten Verse, wie al-Qurṭubī berichtet.",
      "Medinan according to the majority; some held it Meccan, or Meccan except its final verses, as al-Qurṭubī reports.",
      "مدنية عند الأكثر، وقيل مكية، وقيل مكية إلا آياتها الأخيرة، كما ذكر القرطبي.",
    ),
    asbab: l(
      "At-Tirmidhī berichtet von Ibn ʿAbbās, dass Vers 14 über Männer in Mekka herabkam, die auswandern wollten und von Frauen und Kindern zurückgehalten wurden.",
      "Al-Tirmidhī reports from Ibn ʿAbbās that verse 14 came down about men in Mecca who wanted to emigrate and were held back by their wives and children.",
      "روى الترمذي عن ابن عباس أن الآية 14 نزلت في رجال من أهل مكة أرادوا الهجرة فمنعهم أزواجهم وأولادهم.",
    ),
    connects: l(
      "Al-Munāfiqūn endet mit der Warnung vor Ablenkung durch Besitz und Kinder, at-Taghābun vertieft sie als Prüfung. Aṭ-Ṭalāq folgt mit Regeln für die Familie, wenn eine Ehe endet.",
      "Al-Munāfiqūn ends with the warning against distraction by wealth and children; al-Taghābun deepens it as a trial. Al-Ṭalāq follows with rules for the family when a marriage ends.",
      "خُتمت المنافقون بالتحذير من فتنة المال والولد، وتعمّقه التغابن، ثم تأتي الطلاق بأحكام الأسرة عند الفراق.",
    ),
    lessons: ll(
      ["Wer an Allah glaubt, dessen Herz leitet Er im Unglück.", "Fürchten Sie Allah, so gut Sie können.", "Vergeben und Nachsicht in der Familie bringen Allahs Vergebung.", "Wer vor dem eigenen Geiz bewahrt wird, ist erfolgreich."],
      ["Whoever believes in Allah, He guides his heart in misfortune.", "Fear Allah as much as you are able.", "Pardoning and forbearance in the family bring Allah's forgiveness.", "Whoever is saved from his own greed is successful."],
      ["الإيمان يهدي القلب عند المصيبة.", "التقوى بقدر الاستطاعة.", "العفو والصفح في الأسرة سبب لمغفرة الله.", "النجاة من شح النفس طريق الفلاح."],
    ),
    questions: ll(
      ["Woran erkennen Sie, ob Ihre Familie Ihnen auf dem Weg zu Allah hilft oder Sie hindert?", "Welche Ihrer heutigen Gewinne werden am Tag der Übervorteilung noch zählen?"],
      ["How do you know whether your family helps or hinders you on the way to Allah?", "Which of today's gains will still count on the Day of Mutual Loss?"],
      ["كيف تعرف أن أهلك يعينونك على الطريق إلى الله أم يصدونك؟", "أي مكاسبك اليوم تبقى يوم التغابن؟"],
    ),
    sections: [
      sec(1, 10, "Schöpfung, Wissen und der Tag der Übervorteilung", "Creation, knowledge and the Day of Mutual Loss", "الخلق والعلم ويوم التغابن"),
      sec(11, 18, "Unglück, Familie, Besitz und Spenden", "Misfortune, family, wealth and giving", "المصيبة والأهل والمال والإنفاق"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 65,
    theme: l(
      "Auch die Trennung steht unter Allahs Grenzen und verlangt Gerechtigkeit; wer Allah fürchtet, dem schafft Er einen Ausweg und versorgt ihn, woher er es nicht erwartet.",
      "Even separation stands under Allah's limits and demands justice; whoever fears Allah, He makes a way out for him and provides from where he does not expect.",
      "الفراق أيضًا تحكمه حدود الله والعدل، والتقوى تفتح المخارج وتأتي بالرزق من حيث لا يُنتظر.",
    ),
    context: l(
      "Medinensisch, aus der mittleren medinensischen Zeit.",
      "Medinan, from the middle Medinan period.",
      "مدنية، من المرحلة المدنية الوسطى.",
    ),
    asbab: l(
      "Kommentatoren verbinden Vers 1 mit dem Bericht bei al-Bukhārī und Muslim, dass Ibn ʿUmar seine Frau während ihrer Menstruation schied und der Prophet ﷺ ihn anwies, sie zurückzunehmen.",
      "Commentators link verse 1 with the report in al-Bukhārī and Muslim that Ibn ʿUmar divorced his wife during her menses and the Prophet ﷺ told him to take her back.",
      "يربط المفسرون الآية 1 بما رواه البخاري ومسلم أن ابن عمر طلّق امرأته وهي حائض فأمره النبي ﷺ أن يراجعها.",
    ),
    connects: l(
      "At-Taghābun spricht von Familie als Prüfung, aṭ-Ṭalāq regelt die Trennung. At-Taḥrīm folgt mit dem Haus des Propheten ﷺ und der Verantwortung für die Familie.",
      "Al-Taghābun speaks of family as a trial; al-Ṭalāq regulates separation. Al-Taḥrīm follows with the Prophet's ﷺ household and responsibility for one's family.",
      "ذكرت التغابن فتنة الأهل، وتنظم الطلاق الفراق، وتأتي التحريم ببيت النبي ﷺ ومسؤولية الأسرة.",
    ),
    lessons: ll(
      ["Trennung soll geordnet und ohne Vertreibung geschehen.", "Gottesfurcht öffnet Auswege, auch in der Familie.", "Jeder gibt nach seinem Vermögen, Allah verlangt nicht mehr.", "Wer sich auf Allah verlässt, dem genügt Er."],
      ["Separation should be orderly and without expulsion.", "God-consciousness opens ways out, also in the family.", "Each gives according to his means; Allah asks no more.", "Whoever relies on Allah, He suffices him."],
      ["الفراق بنظام ودون إخراج.", "التقوى تفتح المخارج حتى في الأسرة.", "النفقة بقدر الطاقة، والله لا يكلف فوقها.", "المتوكل على الله يكفيه الله."],
    ),
    questions: ll(
      ["Wie behandeln Sie Menschen, von denen Sie sich trennen?", "In welcher ausweglosen Lage könnten Sie bewusst auf Allah vertrauen?"],
      ["How do you treat people you part from?", "In which situation without exit could you consciously rely on Allah?"],
      ["كيف تعامل من تفارقه؟", "في أي ضيق تستطيع أن تتوكل على الله بوعي؟"],
    ),
    sections: [
      sec(1, 7, "Regeln der Scheidung und der Wartezeit", "Rules of divorce and the waiting period", "أحكام الطلاق والعدة"),
      sec(8, 12, "Warnung an die Widerspenstigen und Allahs Wissen", "Warning to the defiant and Allah's knowledge", "عاقبة العتو وإحاطة علم الله"),
    ],
    src: ["ibnKathir", "saadi", "qurtubi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 66,
    theme: l(
      "Selbst im Haus des Propheten ﷺ gelten Allahs Maßstäbe; jeder ist für sich und seine Familie verantwortlich, und weder Verwandtschaft noch Ehe retten ohne eigenen Glauben.",
      "Even in the Prophet's ﷺ household Allah's standards apply; each is responsible for himself and his family, and neither kinship nor marriage saves without one's own faith.",
      "حتى بيت النبي ﷺ تحكمه موازين الله، وكلٌّ مسؤول عن نفسه وأهله، ولا ينجي نسب ولا زواج بلا إيمان.",
    ),
    context: l(
      "Medinensisch, aus der späteren medinensischen Zeit.",
      "Medinan, from the later Medinan period.",
      "مدنية، من أواخر العهد المدني.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von ʿĀʾisha, dass der Anfang über den Honig herabkam, den der Prophet ﷺ sich versagte. Bei an-Nasāʾī wird ein anderer Anlass genannt; Ibn Kathīr stellt beide dar.",
      "Al-Bukhārī and Muslim report from ʿĀʾisha that the opening came down concerning honey the Prophet ﷺ had forbidden himself. Al-Nasāʾī names another occasion; Ibn Kathīr presents both.",
      "روى البخاري ومسلم عن عائشة أن أول السورة نزل في العسل الذي حرّمه النبي ﷺ على نفسه، وذكر النسائي سببًا آخر، وأورد ابن كثير القولين.",
    ),
    connects: l(
      "Aṭ-Ṭalāq regelt die Trennung, at-Taḥrīm das Miteinander im Haus. Al-Mulk folgt mit der Herrschaft Allahs, vor der alle gleich verantwortlich sind.",
      "Al-Ṭalāq regulates separation, al-Taḥrīm life together in the home. Al-Mulk follows with Allah's dominion, before which all are equally accountable.",
      "نظّمت الطلاق الفراق، وتنظم التحريم العشرة في البيت، ثم تأتي الملك بسلطان الله الذي يُسأل أمامه الجميع.",
    ),
    lessons: ll(
      ["Das Erlaubte soll man sich nicht ohne Grund verbieten.", "Schützen Sie sich und Ihre Familie vor dem Feuer.", "Aufrichtige Reue ist ein Neuanfang.", "Frauen wie Āsiya und Maryam sind Vorbilder für alle Gläubigen."],
      ["One should not forbid oneself what is lawful without reason.", "Protect yourselves and your families from the Fire.", "Sincere repentance is a new beginning.", "Women like Āsiya and Maryam are examples for all believers."],
      ["لا يُحرَّم الحلال بلا سبب.", "حماية النفس والأهل من النار مسؤولية.", "التوبة النصوح بداية جديدة.", "آسية ومريم مثل لجميع المؤمنين."],
    ),
    questions: ll(
      ["Was tun Sie konkret, um Ihre Familie zu schützen?", "Welche Reue haben Sie aufgeschoben?"],
      ["What do you concretely do to protect your family?", "Which repentance have you postponed?"],
      ["ماذا تفعل عمليًا لتقي أهلك؟", "أي توبة أخّرتها؟"],
    ),
    sections: [
      sec(1, 5, "Im Haus des Propheten ﷺ", "In the Prophet's ﷺ household", "في بيت النبي ﷺ"),
      sec(6, 9, "Familie schützen und aufrichtig bereuen", "Protecting the family and sincere repentance", "وقاية الأهل والتوبة النصوح"),
      sec(10, 12, "Vier Frauen als Beispiel", "Four women as examples", "أمثال أربع نساء"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "qurtubi"],
    review: DRAFT,
  },
  {
    s: 68,
    theme: l(
      "Der Gesandte ﷺ ist von großartigem Charakter und kein Besessener; Hochmut und Geiz führen in den Verlust wie bei den Besitzern des Gartens, und Geduld ist der Weg.",
      "The Messenger ﷺ is of tremendous character and no madman; arrogance and greed lead to loss as with the owners of the garden, and patience is the way.",
      "الرسول ﷺ على خلق عظيم وليس بمجنون، والكبر والشح يُفضيان إلى الخسران كأصحاب الجنة، والصبر هو السبيل.",
    ),
    context: l(
      "Mekkanisch, aus der sehr frühen mekkanischen Zeit. Einige nehmen einzelne Abschnitte (etwa 17–33 und 48–50) als medinensisch aus, wie al-Qurṭubī berichtet.",
      "Meccan, from the very early Meccan period. Some consider individual passages (such as 17–33 and 48–50) Medinan, as al-Qurṭubī reports.",
      "مكية، من أوائل ما نزل، واستثنى بعضهم مقاطع كالآيات 17–33 و48–50 فجعلها مدنية، كما ذكر القرطبي.",
    ),
    connects: l(
      "Al-Mulk endet mit der Frage nach dem Wasser, al-Qalam mit dem Garten, dessen Ernte verschwindet. Al-Ḥāqqa folgt mit der Wirklichkeit des Gerichts.",
      "Al-Mulk ends with the question of water; al-Qalam with the garden whose harvest vanishes. Al-Ḥāqqa follows with the reality of the judgement.",
      "خُتمت الملك بالسؤال عن الماء، وتذكر القلم الجنة التي ذهب ثمرها، وتأتي الحاقة بحقيقة الجزاء.",
    ),
    lessons: ll(
      ["Der Charakter ist das stärkste Zeugnis einer Botschaft.", "Wer den Armen ausschließen will, verliert selbst.", "Den Lästerern, Hetzern und Hochmütigen nicht gehorchen.", "Geduld ohne Verzweiflung, anders als Yūnus in seiner Eile."],
      ["Character is the strongest witness to a message.", "Whoever means to exclude the poor loses himself.", "Do not obey slanderers, inciters and the arrogant.", "Patience without despair, unlike Yūnus in his haste."],
      ["الخلق أقوى شاهد على الرسالة.", "من أراد حرمان المسكين حُرم.", "لا طاعة لكثير الحلف والطعن والنميمة.", "الصبر وعدم الاستعجال كما وقع لصاحب الحوت."],
    ),
    questions: ll(
      ["Welche Eigenschaft Ihres Charakters spricht am meisten für Ihren Glauben?", "Wo planen Sie, etwas für sich zu behalten, das anderen zusteht?"],
      ["Which trait of your character speaks most for your faith?", "Where do you plan to keep something for yourself that is owed to others?"],
      ["أي خلق فيك يشهد لإيمانك أكثر؟", "أين تدبّر حرمان غيرك من حقه؟"],
    ),
    sections: [
      sec(1, 16, "Der Charakter des Gesandten ﷺ und das Bild des Lästerers", "The Messenger's ﷺ character and the slanderer's portrait", "خلق الرسول ﷺ وصفات الحلّاف المهين"),
      sec(17, 33, "Die Besitzer des Gartens", "The owners of the garden", "أصحاب الجنة"),
      sec(34, 47, "Gottesfürchtige und Verbrecher, der Tag der Entblößung", "The God-fearing and the criminals, the Day of exposure", "المتقون والمجرمون ويوم يُكشف عن ساق"),
      sec(48, 52, "Geduld und das Beispiel Yūnus", "Patience and the example of Yūnus", "الصبر وصاحب الحوت"),
    ],
    src: ["ibnKathir", "saadi", "qurtubi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 69,
    theme: l(
      "Die unausweichliche Wirklichkeit tritt ein; die Völker der Vergangenheit zeigen es, das Buch in der rechten oder linken Hand entscheidet, und der Qurʾān ist die Rede eines edlen Gesandten.",
      "The inevitable reality will come; past peoples show it, the record in the right or left hand decides, and the Qurʾān is the speech of a noble messenger.",
      "الحاقة واقعة لا محالة، تشهد بها الأمم الهالكة، والكتاب باليمين أو بالشمال فاصل، والقرآن كلام الله بلّغه رسول كريم.",
    ),
    context: l(
      "Mekkanisch, aus der frühen mekkanischen Zeit.",
      "Meccan, from the early Meccan period.",
      "مكية، من المرحلة المكية الأولى.",
    ),
    connects: l(
      "Al-Qalam endet mit dem Vorwurf, der Gesandte ﷺ sei besessen, al-Ḥāqqa antwortet darauf, dass der Qurʾān weder Dichtung noch Wahrsagerei ist. Al-Maʿārij setzt mit der Frage nach der Strafe fort.",
      "Al-Qalam ends with the charge that the Messenger ﷺ is mad; al-Ḥāqqa answers that the Qurʾān is neither poetry nor soothsaying. Al-Maʿārij continues with the demand for punishment.",
      "خُتمت القلم بقولهم إنه لمجنون، وتردّ الحاقة بأن القرآن ليس بقول شاعر ولا كاهن، وتواصل المعارج سؤالهم عن العذاب.",
    ),
    lessons: ll(
      ["Macht und Bauten schützen nicht vor dem Gericht.", "Das Buch der Taten wird jedem übergeben.", "Wer die Armen nicht speiste, wird darüber befragt.", "Der Qurʾān ist Wahrheit der Gewissheit."],
      ["Power and buildings do not protect from judgement.", "The record of deeds is handed to everyone.", "Whoever did not feed the poor will be asked about it.", "The Qurʾān is the truth of certainty."],
      ["القوة والبنيان لا يمنعان من الجزاء.", "يُعطى كل امرئ كتابه.", "من أهمل إطعام المسكين يُسأل عنه.", "القرآن حق لا ريب فيه."],
    ),
    questions: ll(
      ["Was möchten Sie in Ihrem Buch lesen, wenn es in Ihre rechte Hand gelegt wird?", "Wen ermutigen Sie, den Bedürftigen zu helfen?"],
      ["What would you like to read in your record when it is placed in your right hand?", "Whom do you encourage to help the needy?"],
      ["ماذا تحب أن تقرأ في كتابك إذا أُعطيته بيمينك؟", "من تحضّه على إطعام المسكين؟"],
    ),
    sections: [
      sec(1, 12, "Die Wirklichkeit und die untergegangenen Völker", "The reality and the destroyed peoples", "الحاقة والأمم المهلكة"),
      sec(13, 37, "Das Buch in der rechten und linken Hand", "The record in the right and left hand", "أصحاب اليمين وأصحاب الشمال"),
      sec(38, 52, "Der Qurʾān ist die Rede eines edlen Gesandten", "The Qurʾān is the speech of a noble messenger", "صدق القرآن ورسوله"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 70,
    theme: l(
      "Die Strafe, die die Leugner herbeiwünschen, kommt an einem langen Tag; der Mensch ist ungeduldig erschaffen, außer denen, die beten, geben und Vertrauen bewahren.",
      "The punishment the deniers demand will come on a long Day; the human is created impatient, except those who pray, give and keep trusts.",
      "العذاب الذي يستعجله المكذبون واقع في يوم طويل، والإنسان جزوع بطبعه إلا المصلين المنفقين الحافظين للأمانة.",
    ),
    context: l(
      "Mekkanisch, aus der frühen bis mittleren mekkanischen Zeit.",
      "Meccan, from the early to middle Meccan period.",
      "مكية، من المرحلة المكية الأولى أو الوسطى.",
    ),
    asbab: l(
      "An-Nasāʾī und andere berichten von Ibn ʿAbbās, dass Vers 1 über an-Naḍr ibn al-Ḥārith herabkam, der höhnisch Strafe verlangte.",
      "Al-Nasāʾī and others report from Ibn ʿAbbās that verse 1 came down concerning al-Naḍr ibn al-Ḥārith, who mockingly demanded punishment.",
      "روى النسائي وغيره عن ابن عباس أن الآية 1 نزلت في النضر بن الحارث حين استعجل العذاب استهزاءً.",
    ),
    connects: l(
      "Al-Ḥāqqa beschreibt das Gericht, al-Maʿārij antwortet denen, die es verlangen. Nūḥ folgt mit einem Gesandten, der sein Volk lange vor einer solchen Strafe warnte.",
      "Al-Ḥāqqa describes the judgement; al-Maʿārij answers those who demand it. Nūḥ follows with a messenger who long warned his people of such a punishment.",
      "وصفت الحاقة الجزاء، وتجيب المعارج من استعجله، وتأتي سورة نوح برسول طال إنذاره قومه.",
    ),
    lessons: ll(
      ["Ungeduld in Not und Geiz im Wohlstand sind menschlich, das Gebet heilt sie.", "Im Besitz gibt es ein bekanntes Recht für Bittende und Bedürftige.", "Treue zu anvertrautem Gut und Versprechen gehört zum Gebet.", "Furcht vor der Strafe Allahs hält wach."],
      ["Impatience in hardship and stinginess in plenty are human; prayer heals them.", "In wealth there is a known right for the asker and the deprived.", "Faithfulness to trusts and promises belongs with prayer.", "Awe of Allah's punishment keeps one awake."],
      ["الجزع عند الشر والمنع عند الخير من طبع الإنسان، والصلاة علاجهما.", "في المال حق ثابت للسائل والمحروم.", "رعاية الأمانة والعهد قرينة الصلاة.", "الإشفاق من عذاب الله يوقظ القلب."],
    ),
    questions: ll(
      ["Wie reagieren Sie, wenn Ihnen etwas Schlechtes geschieht, und wie bei Gutem?", "Welche Eigenschaft aus der Liste der Betenden fehlt Ihnen noch?"],
      ["How do you react when something bad befalls you, and when something good does?", "Which quality from the list of those who pray do you still lack?"],
      ["كيف تتصرف إذا مسك الشر، وكيف إذا مسك الخير؟", "أي صفة من صفات المصلين تنقصك؟"],
    ),
    sections: [
      sec(1, 18, "Die verlangte Strafe und der lange Tag", "The demanded punishment and the long Day", "العذاب المستعجَل واليوم الطويل"),
      sec(19, 35, "Der ungeduldige Mensch und die Betenden", "The impatient human and those who pray", "الإنسان الهلوع والمصلون"),
      sec(36, 44, "Die Leugner und der Tag des Hervorkommens", "The deniers and the Day of emerging", "المكذبون ويوم الخروج"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 71,
    theme: l(
      "Nūḥ rief sein Volk Tag und Nacht, offen und im Stillen, zu Allah; Bitte um Vergebung bringt Segen, doch Starrsinn und Götzen führten in den Untergang.",
      "Nūḥ called his people to Allah day and night, openly and privately; seeking forgiveness brings blessing, but stubbornness and idols led to ruin.",
      "دعا نوح قومه ليلًا ونهارًا، جهارًا وإسرارًا، والاستغفار سبب البركة، لكن العناد والأصنام قادا إلى الهلاك.",
    ),
    context: l(
      "Mekkanisch, aus der mittleren mekkanischen Zeit, als die Ablehnung in Mekka sich verfestigte.",
      "Meccan, from the middle Meccan period, when rejection in Mecca hardened.",
      "مكية، من المرحلة المكية الوسطى حين اشتد إعراض قريش.",
    ),
    connects: l(
      "Al-Maʿārij endet mit der Drohung, die Leugner durch Bessere zu ersetzen; Nūḥ zeigt ein Volk, das tatsächlich ersetzt wurde. Al-Jinn folgt mit Wesen, die beim ersten Hören glaubten.",
      "Al-Maʿārij ends with the threat of replacing the deniers with better ones; Nūḥ shows a people that was indeed replaced. Al-Jinn follows with beings who believed at first hearing.",
      "خُتمت المعارج بالتهديد بالتبديل، وتعرض نوح قومًا أُهلكوا فعلًا، ثم تأتي الجن بمن آمن من أول سماع.",
    ),
    lessons: ll(
      ["Ein Aufrufer braucht Ausdauer und wechselnde Wege.", "Bitte um Vergebung öffnet Regen, Besitz, Kinder und Gärten.", "Verehrung von Menschen kann zu Götzendienst werden.", "Für Eltern und Gläubige um Vergebung bitten."],
      ["A caller needs perseverance and varied approaches.", "Seeking forgiveness opens rain, wealth, children and gardens.", "Veneration of people can turn into idolatry.", "Ask forgiveness for parents and believers."],
      ["الداعية يحتاج إلى صبر وتنوع في الوسائل.", "الاستغفار يفتح المطر والمال والبنين والجنات.", "تعظيم الأشخاص قد يصير وثنية.", "الاستغفار للوالدين والمؤمنين."],
    ),
    questions: ll(
      ["Wie oft bitten Sie um Vergebung, wenn Sie etwas von Allah erhoffen?", "Wie geduldig sind Sie, wenn andere nicht auf Ihren Rat hören?"],
      ["How often do you seek forgiveness when you hope for something from Allah?", "How patient are you when others do not heed your advice?"],
      ["كم تستغفر حين ترجو من الله شيئًا؟", "ما مقدار صبرك إذا لم يُسمع نصحك؟"],
    ),
    sections: [
      sec(1, 4, "Die Sendung Nūḥs", "The mission of Nūḥ", "رسالة نوح"),
      sec(5, 20, "Nūḥs Wege des Aufrufs", "Nūḥ's ways of calling", "أساليب نوح في الدعوة"),
      sec(21, 28, "Starrsinn, Götzen und Nūḥs Bittgebet", "Stubbornness, idols and Nūḥ's supplication", "العناد والأصنام ودعاء نوح"),
    ],
    src: ["ibnKathir", "saadi", "tabari", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 72,
    theme: l(
      "Eine Gruppe der Jinn hörte den Qurʾān und glaubte; Moscheen gehören Allah allein, und auch der Gesandte ﷺ besitzt weder Schaden noch Nutzen, nur die Übermittlung.",
      "A group of jinn heard the Qurʾān and believed; places of prostration belong to Allah alone, and even the Messenger ﷺ owns neither harm nor benefit, only the conveying.",
      "استمع نفر من الجن إلى القرآن فآمنوا، والمساجد لله وحده، والرسول ﷺ لا يملك نفعًا ولا ضرًا، ومهمته التبليغ.",
    ),
    context: l(
      "Mekkanisch, aus der mittleren mekkanischen Zeit.",
      "Meccan, from the middle Meccan period.",
      "مكية، من المرحلة المكية الوسطى.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Ibn ʿAbbās, dass Jinn den Propheten ﷺ im Morgengebet auf dem Weg zum Markt von ʿUkāẓ rezitieren hörten und zu ihrem Volk zurückkehrten.",
      "Al-Bukhārī and Muslim report from Ibn ʿAbbās that jinn heard the Prophet ﷺ reciting in the dawn prayer on the way to the market of ʿUkāẓ and returned to their people.",
      "روى البخاري ومسلم عن ابن عباس أن نفرًا من الجن سمعوا النبي ﷺ يقرأ في صلاة الفجر وهو في طريقه إلى سوق عكاظ فرجعوا إلى قومهم.",
    ),
    connects: l(
      "Nūḥ zeigt Menschen, die trotz langen Aufrufs nicht glaubten, al-Jinn zeigt Wesen, die beim ersten Hören glaubten. Al-Muzzammil folgt mit der Vorbereitung des Gesandten ﷺ auf das schwere Wort.",
      "Nūḥ shows people who did not believe despite long calling; al-Jinn shows beings who believed at first hearing. Al-Muzzammil follows with the Messenger's ﷺ preparation for the weighty word.",
      "عرضت سورة نوح قومًا لم يؤمنوا مع طول الدعوة، وتعرض الجن من آمن من أول سماع، وتأتي المزمل بإعداد الرسول ﷺ للقول الثقيل.",
    ),
    lessons: ll(
      ["Ehrliches Hören führt zum Glauben.", "Zuflucht bei Jinn vermehrt nur Angst und Irrtum.", "Anbetung gehört nur Allah, auch an heiligen Orten.", "Das Verborgene kennt nur Allah, und Er offenbart davon, wem Er will."],
      ["Honest listening leads to faith.", "Seeking refuge with jinn only increases fear and error.", "Worship belongs only to Allah, even in sacred places.", "Only Allah knows the unseen, and He reveals of it to whom He wills."],
      ["الاستماع الصادق يقود إلى الإيمان.", "الالتجاء إلى الجن لا يزيد إلا خوفًا وضلالًا.", "العبادة لله وحده ولو في المساجد.", "الغيب لله وحده، ويُطلع عليه من شاء من رسله."],
    ),
    questions: ll(
      ["Wie haben Sie den Qurʾān zum ersten Mal wirklich gehört?", "Bei wem suchen Sie Schutz, wenn Sie Angst haben?"],
      ["When did you first truly hear the Qurʾān?", "With whom do you seek protection when afraid?"],
      ["متى سمعت القرآن حقًا أول مرة؟", "بمن تستعيذ حين تخاف؟"],
    ),
    sections: [
      sec(1, 15, "Das Zeugnis der Jinn", "The testimony of the jinn", "شهادة الجن"),
      sec(16, 19, "Standhaftigkeit und die Moscheen Allahs", "Steadfastness and the mosques of Allah", "الاستقامة والمساجد لله"),
      sec(20, 28, "Der Gesandte ﷺ, die Übermittlung und das Verborgene", "The Messenger ﷺ, conveying and the unseen", "الرسول ﷺ والبلاغ وعلم الغيب"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 73,
    theme: l(
      "Das Nachtgebet bereitet den Gesandten ﷺ auf das schwere Wort vor; Geduld, Gedenken und Vertrauen tragen die Botschaft, und Allah erleichtert, was zu schwer wird.",
      "The night prayer prepares the Messenger ﷺ for the weighty word; patience, remembrance and reliance carry the message, and Allah eases what becomes too heavy.",
      "قيام الليل يعدّ الرسول ﷺ للقول الثقيل، والصبر والذكر والتوكل زاد الرسالة، والله يخفف ما يشق.",
    ),
    context: l(
      "Mekkanisch, aus der sehr frühen mekkanischen Zeit. Vers 20 halten viele für medinensisch; Muslim berichtet von ʿĀʾisha, dass das Nachtgebet ein Jahr lang Pflicht war, bevor die Erleichterung kam.",
      "Meccan, from the very early Meccan period. Many hold verse 20 to be Medinan; Muslim reports from ʿĀʾisha that the night prayer was obligatory for a year before the easing came.",
      "مكية، من أوائل ما نزل، ويرى كثيرون أن الآية 20 مدنية، وروى مسلم عن عائشة أن قيام الليل فُرض حولًا ثم نزل التخفيف.",
    ),
    connects: l(
      "Al-Jinn endet damit, dass der Gesandte ﷺ die Botschaft übermittelt; al-Muzzammil bereitet ihn innerlich darauf vor. Al-Muddaththir folgt mit dem Befehl, aufzustehen und zu warnen.",
      "Al-Jinn ends with the Messenger ﷺ conveying the message; al-Muzzammil prepares him inwardly for it. Al-Muddaththir follows with the command to rise and warn.",
      "خُتمت الجن بإبلاغ الرسالة، وتعدّ المزمل الرسول ﷺ لها في الباطن، وتأتي المدثر بالأمر بالقيام والإنذار.",
    ),
    lessons: ll(
      ["Die Nacht ist die Zeit, in der Herz und Zunge übereinstimmen.", "Langsame, deutliche Rezitation gehört zum Umgang mit dem Qurʾān.", "Schönes Fernbleiben ohne Kränkung bei Feindseligkeit.", "Allah kennt die Grenzen der Menschen und erleichtert."],
      ["Night is the time when heart and tongue agree.", "Slow, clear recitation belongs to dealing with the Qurʾān.", "Gracious distance without insult in the face of hostility.", "Allah knows people's limits and eases."],
      ["الليل وقت يتوافق فيه القلب واللسان.", "ترتيل القرآن من أدب تلاوته.", "الهجر الجميل عند الأذى.", "الله يعلم ضعف عباده فيخفف عنهم."],
    ),
    questions: ll(
      ["Welcher Teil der Nacht könnte Ihnen gehören, um mit Allah zu sprechen?", "Wie rezitieren Sie, wenn niemand zuhört?"],
      ["Which part of the night could be yours to speak with Allah?", "How do you recite when no one is listening?"],
      ["أي جزء من الليل تجعله لمناجاة الله؟", "كيف تقرأ حين لا يسمعك أحد؟"],
    ),
    sections: [
      sec(1, 10, "Das Nachtgebet und das schwere Wort", "The night prayer and the weighty word", "قيام الليل والقول الثقيل"),
      sec(11, 19, "Warnung an die Leugner", "Warning to the deniers", "إنذار المكذبين"),
      sec(20, 20, "Die Erleichterung", "The easing", "التخفيف"),
    ],
    src: ["ibnKathir", "saadi", "qurtubi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 74,
    theme: l(
      "Der Ruf zum Aufstehen und Warnen beginnt die öffentliche Botschaft; der hochmütige Leugner wird beschrieben, und jede Seele ist Pfand für das, was sie erworben hat.",
      "The call to rise and warn begins the public message; the arrogant denier is portrayed, and every soul is held in pledge for what it has earned.",
      "الأمر بالقيام والإنذار بداية الدعوة الجهرية، ووصف المكذب المتكبر، وكل نفس بما كسبت رهينة.",
    ),
    context: l(
      "Mekkanisch, aus der allerersten Zeit; ihr Anfang gehört zu dem, was nach der Pause der Offenbarung zuerst herabkam.",
      "Meccan, from the very first period; its opening is among the first passages sent down after the pause in revelation.",
      "مكية، من أوائل ما نزل، وصدرها من أول ما نزل بعد فترة الوحي.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Jābir, dass der Prophet ﷺ den Engel nach der Pause wiedersah, sich zuhause zudecken ließ und die Verse 1–5 herabkamen. Die Verse 11–25 beziehen Kommentatoren wie al-Wāḥidī auf al-Walīd ibn al-Mughīra.",
      "Al-Bukhārī and Muslim report from Jābir that the Prophet ﷺ saw the angel again after the pause, asked to be covered at home, and verses 1–5 came down. Commentators such as al-Wāḥidī relate verses 11–25 to al-Walīd ibn al-Mughīra.",
      "روى البخاري ومسلم عن جابر أن النبي ﷺ رأى الملك بعد فترة الوحي فرجع فقال: دثروني، فنزلت الآيات 1–5، وذكر المفسرون كالواحدي أن الآيات 11–25 نزلت في الوليد بن المغيرة.",
    ),
    connects: l(
      "Al-Muzzammil bereitet den Gesandten ﷺ in der Nacht vor, al-Muddaththir schickt ihn hinaus. Al-Qiyāma folgt mit dem Tag, vor dem er warnt.",
      "Al-Muzzammil prepares the Messenger ﷺ at night; al-Muddaththir sends him out. Al-Qiyāma follows with the Day he warns of.",
      "أعدّت المزمل الرسول ﷺ بالليل، وتبعثه المدثر إلى الناس، وتأتي القيامة باليوم الذي يُنذر به.",
    ),
    lessons: ll(
      ["Eine Botschaft beginnt mit Reinheit nach innen und außen.", "Nicht geben, um mehr zurückzubekommen.", "Verstand ohne Demut kann zur Leugnung führen.", "Gebet, Speisen der Armen und Ernst gegenüber dem Gericht schützen."],
      ["A message begins with purity inside and out.", "Do not give in order to receive more.", "Intellect without humility can lead to denial.", "Prayer, feeding the poor and seriousness about judgement protect."],
      ["الدعوة تبدأ بطهارة الظاهر والباطن.", "لا تعطِ لتنال أكثر مما أعطيت.", "الفكر بلا تواضع قد يقود إلى الجحود.", "الصلاة وإطعام المسكين والتصديق بيوم الدين وقاية."],
    ),
    questions: ll(
      ["Wovor fliehen Sie, wenn Sie ermahnt werden?", "Was haben Sie heute getan, das Sie als Pfand für sich selbst einlösen würde?"],
      ["What do you flee from when you are reminded?", "What did you do today that would redeem you as a pledge?"],
      ["مما تفرّ حين تُذكَّر؟", "ماذا عملت اليوم مما يفك رهن نفسك؟"],
    ),
    sections: [
      sec(1, 7, "Der Auftrag zu warnen", "The command to warn", "الأمر بالقيام والإنذار"),
      sec(8, 31, "Der hochmütige Leugner und Saqar", "The arrogant denier and Saqar", "المكذب المتكبر وسقر"),
      sec(32, 48, "Jede Seele ist Pfand", "Every soul is held in pledge", "كل نفس مرهونة بعملها"),
      sec(49, 56, "Abwendung von der Ermahnung", "Turning from the reminder", "الإعراض عن التذكرة"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "tabari"],
    review: DRAFT,
  },
  {
    s: 75,
    theme: l(
      "Die Auferstehung ist gewiss, und die tadelnde Seele weiß es; der Mensch liebt das Schnelle und vernachlässigt das Bleibende, doch der Tod führt zu Allah.",
      "Resurrection is certain, and the self-reproaching soul knows it; the human loves the fleeting and neglects the lasting, yet death leads to Allah.",
      "البعث حق والنفس اللوامة تشهد به، والإنسان يحب العاجلة ويذر الآخرة، والموت مساق إلى الله.",
    ),
    context: l(
      "Mekkanisch, aus der frühen mekkanischen Zeit.",
      "Meccan, from the early Meccan period.",
      "مكية، من المرحلة المكية الأولى.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Ibn ʿAbbās, dass der Prophet ﷺ beim Empfang der Offenbarung Zunge und Lippen bewegte, um sie festzuhalten, und darauf die Verse 16–19 herabkamen.",
      "Al-Bukhārī and Muslim report from Ibn ʿAbbās that the Prophet ﷺ moved his tongue and lips while receiving revelation to retain it, whereupon verses 16–19 came down.",
      "روى البخاري ومسلم عن ابن عباس أن النبي ﷺ كان يحرك لسانه وشفتيه عند نزول الوحي ليحفظه فنزلت الآيات 16–19.",
    ),
    connects: l(
      "Al-Muddaththir endet mit denen, die das Jenseits nicht fürchten; al-Qiyāma beginnt mit dem Schwur beim Tag der Auferstehung. Al-Insān folgt mit dem Ursprung und Weg des Menschen.",
      "Al-Muddaththir ends with those who do not fear the hereafter; al-Qiyāma opens with an oath by the Day of Resurrection. Al-Insān follows with the human's origin and path.",
      "خُتمت المدثر بمن لا يخافون الآخرة، وافتُتحت القيامة بالقسم بيومها، وتأتي الإنسان بأصل الإنسان وطريقه.",
    ),
    lessons: ll(
      ["Das Gewissen, das tadelt, ist ein Zeichen lebendigen Glaubens.", "Der Mensch ist Zeuge gegen sich selbst, auch wenn er Ausreden vorbringt.", "Allah selbst sichert die Bewahrung und Erklärung des Qurʾān.", "Wer aus einem Tropfen erschuf, kann wiedererwecken."],
      ["The conscience that reproaches is a sign of living faith.", "A person is witness against himself, even while making excuses.", "Allah Himself secures the preservation and explanation of the Qurʾān.", "He who created from a drop can raise again."],
      ["النفس اللوامة علامة إيمان حي.", "الإنسان شاهد على نفسه وإن اعتذر.", "تكفّل الله بجمع القرآن وبيانه.", "من خلق من نطفة قادر على الإحياء."],
    ),
    questions: ll(
      ["Wofür hat Ihr Gewissen Sie heute getadelt?", "Wo wählen Sie das Schnelle statt des Bleibenden?"],
      ["For what did your conscience reproach you today?", "Where do you choose the fleeting over the lasting?"],
      ["على أي شيء لامتك نفسك اليوم؟", "أين تختار العاجلة على الباقية؟"],
    ),
    sections: [
      sec(1, 15, "Die Auferstehung und die tadelnde Seele", "Resurrection and the self-reproaching soul", "القيامة والنفس اللوامة"),
      sec(16, 19, "Die Bewahrung des Qurʾān", "The preservation of the Qurʾān", "جمع القرآن وبيانه"),
      sec(20, 40, "Das Schnelle, die Gesichter, der Tod und der Ursprung", "The fleeting, the faces, death and origin", "العاجلة والوجوه والموت والنشأة"),
    ],
    src: ["ibnKathir", "saadi", "wahidi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 76,
    theme: l(
      "Der Mensch wurde aus dem Nichts erschaffen und erhielt den Weg; die Rechtschaffenen erfüllen Gelübde, speisen um Allahs willen ohne Dank zu erwarten und erhalten Paradies und Seide.",
      "The human was created from nothing and given the path; the righteous fulfil vows, feed others for Allah's sake expecting no thanks, and receive Paradise and silk.",
      "خُلق الإنسان بعد أن لم يكن وهُدي السبيل، والأبرار يوفون بالنذر ويطعمون ابتغاء وجه الله دون انتظار شكر، فجزاؤهم جنة وحرير.",
    ),
    context: l(
      "Die Gelehrten sind sich uneins: Viele halten sie für medinensisch, andere für mekkanisch; Ibn ʿĀshūr neigt zur mekkanischen Einordnung. Al-Bukhārī und Muslim berichten, dass der Prophet ﷺ sie im Morgengebet am Freitag rezitierte.",
      "Scholars differ: many hold it Medinan, others Meccan; Ibn ʿĀshūr inclines to the Meccan view. Al-Bukhārī and Muslim report that the Prophet ﷺ recited it in the Friday dawn prayer.",
      "اختُلف فيها: فقيل مدنية وقيل مكية، ومال ابن عاشور إلى أنها مكية، وروى البخاري ومسلم أن النبي ﷺ كان يقرؤها في فجر الجمعة.",
    ),
    connects: l(
      "Al-Qiyāma endet mit der Erschaffung aus einem Tropfen, al-Insān beginnt dort. Al-Mursalāt folgt mit der Warnung an jene, die den Weg ablehnen.",
      "Al-Qiyāma ends with creation from a drop; al-Insān begins there. Al-Mursalāt follows with the warning to those who reject the path.",
      "خُتمت القيامة بالخلق من نطفة، وافتُتحت الإنسان به، وتأتي المرسلات بالوعيد لمن أعرض عن السبيل.",
    ),
    lessons: ll(
      ["Der Mensch hat die Wahl zwischen Dankbarkeit und Undankbarkeit.", "Gutes tun ohne Erwartung von Lohn oder Dank.", "Geduld wird mit Paradies und Seide belohnt.", "Allahs Name morgens und abends gedenken und nachts lange niederfallen."],
      ["The human chooses between gratitude and ingratitude.", "Do good without expecting reward or thanks.", "Patience is rewarded with Paradise and silk.", "Remember Allah's name morning and evening and prostrate long at night."],
      ["الإنسان مخيّر بين الشكر والكفر.", "فعل الخير بلا انتظار جزاء ولا شكر.", "جزاء الصبر جنة وحرير.", "ذكر الله صباحًا ومساءً وإطالة السجود ليلًا."],
    ),
    questions: ll(
      ["Wem haben Sie zuletzt geholfen, ohne Dank zu erwarten?", "Welches Gelübde oder Versprechen sollten Sie noch erfüllen?"],
      ["Whom did you last help without expecting thanks?", "Which vow or promise should you still fulfil?"],
      ["من أعنته آخر مرة دون انتظار شكر؟", "أي نذر أو وعد بقي عليك الوفاء به؟"],
    ),
    sections: [
      sec(1, 3, "Ursprung des Menschen und der Weg", "The human's origin and the path", "نشأة الإنسان وهداية السبيل"),
      sec(4, 22, "Die Rechtschaffenen und ihr Lohn", "The righteous and their reward", "الأبرار وجزاؤهم"),
      sec(23, 31, "Geduld, Gedenken und Allahs Wille", "Patience, remembrance and Allah's will", "الصبر والذكر ومشيئة الله"),
    ],
    src: ["ibnKathir", "saadi", "qurtubi", "ibnAshur"],
    review: DRAFT,
  },
  {
    s: 77,
    theme: l(
      "Das Versprochene trifft gewiss ein; wiederholt wird den Leugnern Weh angekündigt, und die Zeichen der Schöpfung und das Schicksal der Früheren bezeugen den Tag der Entscheidung.",
      "What is promised will surely occur; woe is repeatedly announced to the deniers, and the signs of creation and the fate of earlier peoples testify to the Day of Sorting.",
      "الموعود واقع لا محالة، ويتكرر الوعيد للمكذبين، وآيات الخلق ومصير الأولين شاهدة بيوم الفصل.",
    ),
    context: l(
      "Mekkanisch, aus der frühen mekkanischen Zeit.",
      "Meccan, from the early Meccan period.",
      "مكية، من المرحلة المكية الأولى.",
    ),
    asbab: l(
      "Al-Bukhārī und Muslim berichten von Ibn Masʿūd, dass die Sure herabkam, als sie mit dem Propheten ﷺ in einer Höhle bei Minā waren.",
      "Al-Bukhārī and Muslim report from Ibn Masʿūd that the surah came down while they were with the Prophet ﷺ in a cave at Minā.",
      "روى البخاري ومسلم عن ابن مسعود أنها نزلت وهم مع النبي ﷺ في غار بمنى.",
    ),
    connects: l(
      "Al-Insān endet mit der schmerzhaften Strafe für die Ungerechten, al-Mursalāt schwört auf ihre Gewissheit. An-Nabaʾ eröffnet danach das letzte Dreißigstel mit der Frage nach der großen Nachricht.",
      "Al-Insān ends with painful punishment for the wrongdoers; al-Mursalāt swears to its certainty. Al-Nabaʾ then opens the last thirtieth with the question about the great news.",
      "خُتمت الإنسان بالعذاب الأليم للظالمين، وتقسم المرسلات على وقوعه، ثم تفتتح النبأ الجزء الأخير بالسؤال عن النبأ العظيم.",
    ),
    lessons: ll(
      ["Wiederholung ist ein Mittel der Ermahnung.", "Die Schöpfung aus geringem Wasser zeigt Allahs Macht.", "Wer sich nicht beugt, wenn er zum Gebet gerufen wird, hat die Botschaft nicht angenommen."],
      ["Repetition is a means of reminder.", "Creation from a humble fluid shows Allah's power.", "Whoever does not bow when called to prayer has not accepted the message."],
      ["التكرار وسيلة تذكير.", "الخلق من ماء مهين دليل قدرة الله.", "من أبى الصلاة إذا دُعي إليها لم يقبل الرسالة."],
    ),
    questions: ll(
      ["An welche Rede nach dem Qurʾān werden Sie glauben, wenn nicht an ihn?", "Wann haben Sie zuletzt eine Ermahnung bewusst angenommen?"],
      ["In what speech after the Qurʾān will you believe, if not in it?", "When did you last consciously accept a reminder?"],
      ["بأي كلام تؤمن إن لم تؤمن بالقرآن؟", "متى قبلت تذكيرًا عن وعي آخر مرة؟"],
    ),
    sections: [
      sec(1, 15, "Schwüre und der Tag der Entscheidung", "Oaths and the Day of Sorting", "الأقسام ويوم الفصل"),
      sec(16, 28, "Frühere Völker und die Zeichen der Schöpfung", "Earlier peoples and the signs of creation", "مصارع الأولين وآيات الخلق"),
      sec(29, 40, "Die Strafe der Leugner", "The punishment of the deniers", "عذاب المكذبين"),
      sec(41, 50, "Die Gottesfürchtigen und die letzte Warnung", "The God-fearing and the final warning", "المتقون والإنذار الأخير"),
    ],
    src: ["ibnKathir", "saadi", "biqai", "ibnAshur"],
    review: DRAFT,
  },
];
