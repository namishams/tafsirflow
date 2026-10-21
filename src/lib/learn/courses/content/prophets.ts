// mirrors mobile/src/features/courses/content/prophets.ts (copied for the website; keep both in step)
import type { CQuestion, CLesson, Course, L } from "../types";

const l = (en: string, de: string, ar: string): L => ({ en, de, ar });
const q = (question: L, options: L[], answer: number, explain: L): CQuestion => ({ q: question, options, answer, explain });

const lessons: CLesson[] = [
  {
    id: "p01-adam",
    title: l("Adam: the first human and prophet", "Adam: der erste Mensch und Prophet", "آدم: أول البشر وأول الأنبياء"),
    body: l(
      "## Who\nAdam is the first human being and, in Islamic belief, the first prophet. God created him from clay and taught him the names of things.\n\n## Where in the Quran\nThe story appears in Surah al-Baqarah, al-A'raf, Taha and other places.\n\n## The story in brief\nGod announced to the angels that He would place a successor (khalifah) on earth. The angels bowed to Adam at God's command, but Iblis refused out of arrogance. Adam and his wife lived in the Garden, were warned about one tree, and were led by Satan to eat from it. They regretted it, turned to God, and God accepted their repentance. They were then sent down to earth.\n\n## Lessons for today\n- Knowledge is an honour given by God.\n- Arrogance, not the mistake itself, was Iblis's downfall.\n- Every person can return to God through sincere repentance.",
      "## Wer\nAdam ist der erste Mensch und nach islamischem Glauben der erste Prophet. Gott erschuf ihn aus Lehm und lehrte ihn die Namen der Dinge.\n\n## Wo im Koran\nDie Geschichte steht unter anderem in Surat al-Baqara, al-A'raf und Taha.\n\n## Die Geschichte in Kürze\nGott kündigte den Engeln an, einen Nachfolger (Chalifa) auf der Erde einzusetzen. Die Engel warfen sich auf Gottes Befehl vor Adam nieder, Iblis weigerte sich aus Hochmut. Adam und seine Frau lebten im Garten, wurden vor einem Baum gewarnt und ließen sich vom Satan verleiten, davon zu essen. Sie bereuten, wandten sich Gott zu, und Gott nahm ihre Reue an. Danach wurden sie auf die Erde gesandt.\n\n## Lehren für heute\n- Wissen ist eine Ehre, die Gott schenkt.\n- Nicht der Fehler, sondern der Hochmut wurde Iblis zum Verhängnis.\n- Jeder Mensch kann durch aufrichtige Reue zu Gott zurückkehren.",
      "## من هو\nآدم عليه السلام أول البشر وأول الأنبياء في العقيدة الإسلامية، خلقه الله من طين وعلّمه الأسماء كلها.\n\n## موضعه في القرآن\nتَرِد قصته في سور البقرة والأعراف وطه وغيرها.\n\n## القصة باختصار\nأخبر الله الملائكة أنه جاعل في الأرض خليفة، فسجدت الملائكة لآدم امتثالًا لأمر الله، وأبى إبليس استكبارًا. سكن آدم وزوجه الجنة ونُهيا عن شجرة، فوسوس لهما الشيطان فأكلا منها. ثم ندما وتابا، فتاب الله عليهما، وأُهبطا إلى الأرض.\n\n## دروس لليوم\n- العلم تكريم من الله.\n- كان هلاك إبليس بالكبر لا بمجرد الخطأ.\n- باب التوبة الصادقة مفتوح لكل إنسان."
    ),
    verses: ["2:30", "2:31", "2:37", "7:11", "20:115"],
    quiz: [
      q(l("Why did Iblis refuse to bow to Adam?", "Warum weigerte sich Iblis, sich vor Adam niederzuwerfen?", "لماذا امتنع إبليس عن السجود لآدم؟"),
        [l("Out of arrogance", "Aus Hochmut", "استكبارًا"), l("Out of fear", "Aus Angst", "خوفًا"), l("He did not hear the command", "Er hörte den Befehl nicht", "لم يسمع الأمر"), l("He was asleep", "Er schlief", "كان نائمًا")],
        0, l("The Quran describes his refusal as arrogance.", "Der Koran beschreibt seine Weigerung als Hochmut.", "وصف القرآن امتناعه بالاستكبار.")),
      q(l("What did God teach Adam?", "Was lehrte Gott Adam?", "ماذا علّم الله آدم؟"),
        [l("Farming", "Ackerbau", "الزراعة"), l("Writing poetry", "Dichtkunst", "الشعر"), l("The names of things", "Die Namen der Dinge", "الأسماء كلها"), l("Shipbuilding", "Schiffbau", "صناعة السفن")],
        2, l("See 2:31.", "Siehe 2:31.", "انظر 2:31.")),
      q(l("How did Adam respond after his mistake?", "Wie reagierte Adam nach seinem Fehler?", "كيف تصرّف آدم بعد خطئه؟"),
        [l("He blamed the angels", "Er gab den Engeln die Schuld", "لام الملائكة"), l("He repented to God", "Er bereute vor Gott", "تاب إلى الله"), l("He left the Garden in anger", "Er verließ zornig den Garten", "خرج غاضبًا"), l("He ignored it", "Er ignorierte ihn", "تجاهله")],
        1, l("God accepted his repentance (2:37).", "Gott nahm seine Reue an (2:37).", "تاب الله عليه (2:37).")),
    ],
  },
  {
    id: "p02-nuh",
    title: l("Nuh: patience over centuries", "Nuh: Geduld über Jahrhunderte", "نوح: صبر عبر القرون"),
    body: l(
      "## Who\nNuh (Noah) is one of the great messengers, sent to a people who had turned to idol worship.\n\n## Where in the Quran\nA whole surah carries his name (Surah Nuh, 71); his story also appears in Hud, al-A'raf and al-Ankabut.\n\n## The story in brief\nNuh called his people to worship God alone, day and night, openly and privately. The Quran mentions that he remained among them for a very long time, nine hundred and fifty years. Only a few believed, while the leaders mocked him. God commanded him to build the ark. When the flood came, the believers and pairs of animals were saved; even one of Nuh's sons refused to board and drowned.\n\n## Lessons for today\n- Steady, patient calling to the good, even without visible success.\n- Faith is not inherited; each person is responsible for themselves.\n- Trust in God when others mock.",
      "## Wer\nNuh (Noah) gehört zu den großen Gesandten. Er wurde zu einem Volk geschickt, das Götzen anbetete.\n\n## Wo im Koran\nEine ganze Sure trägt seinen Namen (Sure 71); die Geschichte steht auch in Hud, al-A'raf und al-Ankabut.\n\n## Die Geschichte in Kürze\nNuh rief sein Volk Tag und Nacht, öffentlich und im Stillen, zur Anbetung des einen Gottes. Der Koran erwähnt, dass er sehr lange unter ihnen lebte, neunhundertfünfzig Jahre. Nur wenige glaubten, die Oberschicht verspottete ihn. Gott befahl ihm, die Arche zu bauen. Als die Flut kam, wurden die Gläubigen und Tierpaare gerettet; selbst einer seiner Söhne weigerte sich einzusteigen und ertrank.\n\n## Lehren für heute\n- Beständig und geduldig zum Guten aufrufen, auch ohne sichtbaren Erfolg.\n- Glaube wird nicht vererbt; jeder Mensch trägt Verantwortung für sich.\n- Auf Gott vertrauen, wenn andere spotten.",
      "## من هو\nنوح عليه السلام من أولي العزم من الرسل، أُرسل إلى قوم عبدوا الأصنام.\n\n## موضعه في القرآن\nسورة كاملة باسمه (سورة نوح 71)، وتَرِد قصته في هود والأعراف والعنكبوت.\n\n## القصة باختصار\nدعا نوح قومه إلى عبادة الله وحده ليلًا ونهارًا، سرًّا وجهارًا. وذكر القرآن أنه لبث فيهم ألف سنة إلا خمسين عامًا. فلم يؤمن معه إلا قليل، وسخر منه الملأ. فأمره الله بصنع الفلك، فلما جاء الطوفان نجا المؤمنون ومن كل زوجين اثنين، وأبى أحد أبنائه الركوب فكان من المغرقين.\n\n## دروس لليوم\n- الدعوة إلى الخير بصبر وثبات وإن لم تظهر الثمرة.\n- الإيمان لا يُورث، وكل نفس مسؤولة عن نفسها.\n- التوكل على الله عند السخرية."
    ),
    verses: ["71:5", "11:37", "11:42", "29:14"],
    quiz: [
      q(l("How long did Nuh stay among his people, according to the Quran?", "Wie lange lebte Nuh laut Koran unter seinem Volk?", "كم لبث نوح في قومه بحسب القرآن؟"),
        [l("40 years", "40 Jahre", "40 سنة"), l("100 years", "100 Jahre", "100 سنة"), l("500 years", "500 Jahre", "500 سنة"), l("950 years", "950 Jahre", "950 سنة")],
        3, l("See 29:14.", "Siehe 29:14.", "انظر 29:14.")),
      q(l("What did God command Nuh to build?", "Was sollte Nuh auf Gottes Befehl bauen?", "ماذا أمر الله نوحًا أن يصنع؟"),
        [l("A tower", "Einen Turm", "برجًا"), l("An ark", "Eine Arche", "فلكًا"), l("A wall", "Eine Mauer", "سدًّا"), l("A temple", "Einen Tempel", "معبدًا")],
        1, l("See 11:37.", "Siehe 11:37.", "انظر 11:37.")),
      q(l("What does the story of Nuh's son teach?", "Was lehrt die Geschichte von Nuhs Sohn?", "ماذا تعلّمنا قصة ابن نوح؟"),
        [l("Faith is not inherited", "Glaube wird nicht vererbt", "الإيمان لا يُورث"), l("Swimming saves", "Schwimmen rettet", "السباحة تنجي"), l("Mountains are safe", "Berge sind sicher", "الجبال آمنة"), l("Family ties replace faith", "Familie ersetzt Glauben", "القرابة تغني عن الإيمان")],
        0, l("Even a prophet's son was responsible for his own choice.", "Selbst der Sohn eines Propheten war für seine Entscheidung verantwortlich.", "حتى ابن النبي مسؤول عن اختياره.")),
    ],
  },
  {
    id: "p03-hud",
    title: l("Hud and the people of 'Ad", "Hud und das Volk der 'Ad", "هود وقوم عاد"),
    body: l(
      "## Who\nHud was sent to 'Ad, a powerful Arab people known for tall buildings and great strength, living in the region of al-Ahqaf in southern Arabia.\n\n## Where in the Quran\nSurah Hud (11) bears his name; the story also appears in al-A'raf, ash-Shu'ara and al-Ahqaf.\n\n## The story in brief\nHud reminded 'Ad of God's blessings: strength, wealth, gardens and springs. He called them to worship God alone and to ask forgiveness. They answered proudly that no one was stronger than they were and accused him of madness. Hud declared that he relied on God alone. In the end a destructive wind came upon them, while Hud and the believers were saved.\n\n## Lessons for today\n- Power and wealth do not protect from God's judgment.\n- Gratitude means using blessings responsibly.\n- Steadfastness does not depend on the approval of the majority.",
      "## Wer\nHud wurde zu 'Ad gesandt, einem mächtigen arabischen Volk mit hohen Bauten und großer Kraft, das im Gebiet al-Ahqaf im Süden Arabiens lebte.\n\n## Wo im Koran\nSure Hud (11) trägt seinen Namen; die Geschichte steht auch in al-A'raf, asch-Schu'ara und al-Ahqaf.\n\n## Die Geschichte in Kürze\nHud erinnerte 'Ad an Gottes Gaben: Kraft, Reichtum, Gärten und Quellen. Er rief sie auf, Gott allein anzubeten und um Vergebung zu bitten. Sie antworteten stolz, niemand sei stärker als sie, und hielten ihn für verrückt. Hud erklärte, er vertraue allein auf Gott. Am Ende kam ein vernichtender Wind über sie, Hud und die Gläubigen wurden gerettet.\n\n## Lehren für heute\n- Macht und Reichtum schützen nicht vor Gottes Gericht.\n- Dankbarkeit heißt, Gaben verantwortungsvoll zu nutzen.\n- Standhaftigkeit hängt nicht vom Beifall der Mehrheit ab.",
      "## من هو\nأُرسل هود عليه السلام إلى قوم عاد، وهم قوم عرب أشداء عُرفوا بالبنيان العالي، سكنوا الأحقاف في جنوب الجزيرة.\n\n## موضعه في القرآن\nسورة هود (11) تحمل اسمه، وتَرِد القصة في الأعراف والشعراء والأحقاف.\n\n## القصة باختصار\nذكّر هود قومه بنعم الله عليهم من قوة ومال وجنات وعيون، ودعاهم إلى عبادة الله وحده والاستغفار. فقالوا مستكبرين: لا أحد أشد منا قوة، ورموه بالسفه. فأعلن أنه متوكل على الله وحده. ثم أرسل الله عليهم ريحًا مهلكة، ونجّى هودًا والذين آمنوا معه.\n\n## دروس لليوم\n- القوة والمال لا يمنعان من أمر الله.\n- الشكر هو حسن استعمال النعم.\n- الثبات لا يتوقف على رضا الأكثرية."
    ),
    verses: ["7:65", "11:50", "41:15", "46:21"],
    quiz: [
      q(l("To which people was Hud sent?", "Zu welchem Volk wurde Hud gesandt?", "إلى أي قوم أُرسل هود؟"),
        [l("Thamud", "Thamud", "ثمود"), l("Madyan", "Madyan", "مدين"), l("'Ad", "'Ad", "عاد"), l("Bani Israil", "Banu Isra'il", "بني إسرائيل")],
        2, l("Hud was sent to 'Ad (7:65).", "Hud wurde zu 'Ad gesandt (7:65).", "أُرسل هود إلى عاد (7:65).")),
      q(l("What were 'Ad especially proud of?", "Worauf war 'Ad besonders stolz?", "بماذا اغترّ قوم عاد؟"),
        [l("Their strength", "Ihre Stärke", "قوتهم"), l("Their poetry", "Ihre Dichtung", "شعرهم"), l("Their ships", "Ihre Schiffe", "سفنهم"), l("Their humility", "Ihre Demut", "تواضعهم")],
        0, l("See 41:15.", "Siehe 41:15.", "انظر 41:15.")),
      q(l("How were 'Ad punished?", "Wie wurde 'Ad bestraft?", "بماذا أُهلك قوم عاد؟"),
        [l("A flood", "Eine Flut", "بالطوفان"), l("A destructive wind", "Ein vernichtender Wind", "بريح مهلكة"), l("An earthquake only", "Nur ein Erdbeben", "بزلزلة فقط"), l("Famine", "Hungersnot", "بالمجاعة")],
        1, l("The Quran mentions a fierce wind.", "Der Koran nennt einen heftigen Wind.", "ذكر القرآن ريحًا عاتية.")),
    ],
  },
  {
    id: "p04-salih",
    title: l("Salih and the she-camel", "Salih und die Kamelstute", "صالح والناقة"),
    body: l(
      "## Who\nSalih was sent to Thamud, who carved houses into rocks in the north-west of Arabia (al-Hijr).\n\n## Where in the Quran\nIn al-A'raf, Hud, ash-Shu'ara, an-Naml and ash-Shams.\n\n## The story in brief\nSalih called Thamud to worship God alone. They asked for a sign, and God sent a she-camel as a clear sign, with a share of water on fixed days. Salih warned them not to harm her. The most wretched among them, supported by others, killed the camel. Salih told them they had three days left. Then a mighty blast seized them, and Salih and the believers were saved.\n\n## Lessons for today\n- A sign brings responsibility, not only proof.\n- Those who approve wrongdoing share in it.\n- Respect for creation, including animals, is part of faith.",
      "## Wer\nSalih wurde zu Thamud gesandt, die im Nordwesten Arabiens (al-Hidschr) Häuser in Felsen hauten.\n\n## Wo im Koran\nIn al-A'raf, Hud, asch-Schu'ara, an-Naml und asch-Schams.\n\n## Die Geschichte in Kürze\nSalih rief Thamud zur Anbetung des einen Gottes. Sie verlangten ein Zeichen, und Gott sandte eine Kamelstute als deutliches Zeichen, mit einem Anteil am Wasser an festen Tagen. Salih warnte sie, ihr zu schaden. Der Unseligste unter ihnen tötete die Stute, unterstützt von anderen. Salih kündigte ihnen drei Tage Frist an. Dann ergriff sie ein gewaltiger Schrei, Salih und die Gläubigen wurden gerettet.\n\n## Lehren für heute\n- Ein Zeichen bringt Verantwortung, nicht nur Beweis.\n- Wer Unrecht billigt, hat Anteil daran.\n- Achtung vor der Schöpfung, auch vor Tieren, gehört zum Glauben.",
      "## من هو\nأُرسل صالح عليه السلام إلى ثمود الذين نحتوا البيوت في الصخر بالحِجر شمال غرب الجزيرة.\n\n## موضعه في القرآن\nفي الأعراف وهود والشعراء والنمل والشمس.\n\n## القصة باختصار\nدعا صالح ثمود إلى عبادة الله وحده، فطلبوا آية، فأرسل الله الناقة آية بيّنة لها شِرب ولهم شرب يوم معلوم، وحذّرهم من أن يمسّوها بسوء. فانبعث أشقاهم فعقرها بتأييد من قومه. فقال لهم صالح: تمتعوا ثلاثة أيام، ثم أخذتهم الصيحة، ونجّى الله صالحًا والمؤمنين.\n\n## دروس لليوم\n- الآية تحمّل المسؤولية، لا مجرد البرهان.\n- الراضي بالظلم شريك فيه.\n- الرفق بالمخلوقات ومنها الحيوان من الإيمان."
    ),
    verses: ["7:73", "11:65", "26:155", "91:11"],
    quiz: [
      q(l("What sign was sent to Thamud?", "Welches Zeichen wurde Thamud gesandt?", "ما الآية التي أُرسلت إلى ثمود؟"),
        [l("A staff", "Ein Stab", "عصا"), l("A she-camel", "Eine Kamelstute", "ناقة"), l("A ship", "Ein Schiff", "سفينة"), l("A cow", "Eine Kuh", "بقرة")],
        1, l("See 7:73.", "Siehe 7:73.", "انظر 7:73.")),
      q(l("Where did Thamud build their homes?", "Wo bauten Thamud ihre Häuser?", "أين بنت ثمود بيوتها؟"),
        [l("On rivers", "An Flüssen", "على الأنهار"), l("In tents", "In Zelten", "في الخيام"), l("Carved in rocks", "In Felsen gehauen", "منحوتة في الصخر"), l("On islands", "Auf Inseln", "في الجزر")],
        2, l("They were known for carving dwellings into mountains.", "Sie hauten Wohnungen in Berge.", "عُرفوا بنحت البيوت في الجبال.")),
      q(l("How many days of respite did Salih announce?", "Wie viele Tage Frist kündigte Salih an?", "كم يومًا أمهلهم صالح؟"),
        [l("Three", "Drei", "ثلاثة"), l("Seven", "Sieben", "سبعة"), l("Forty", "Vierzig", "أربعين"), l("One", "Einen", "يومًا واحدًا")],
        0, l("See 11:65.", "Siehe 11:65.", "انظر 11:65.")),
    ],
  },
  {
    id: "p05-ibrahim",
    title: l("Ibrahim: the friend of God", "Ibrahim: der Freund Gottes", "إبراهيم خليل الله"),
    body: l(
      "## Who\nIbrahim (Abraham) is called the friend of God (khalil) and is the father of many prophets. Muslims, Jews and Christians all honour him.\n\n## Where in the Quran\nAl-Baqarah, al-An'am, Ibrahim, Maryam, al-Anbiya, as-Saffat and more.\n\n## The story in brief\nAs a young man, Ibrahim questioned the idols of his people and his father, reasoning that what sets and disappears cannot be God. He broke the idols and was thrown into a fire, which God made cool and safe. Later he left his wife Hajar and son Ismail in the valley of Makkah by God's command. He was tested with a dream about sacrificing his son; both submitted, and God ransomed the son. With Ismail he raised the foundations of the Ka'bah.\n\n## Lessons for today\n- Use reason to reach faith.\n- Courage to stand alone for the truth.\n- Complete trust in God in hard tests.",
      "## Wer\nIbrahim (Abraham) heißt der Freund Gottes (Chalil) und ist Stammvater vieler Propheten. Muslime, Juden und Christen ehren ihn.\n\n## Wo im Koran\nAl-Baqara, al-An'am, Ibrahim, Maryam, al-Anbiya, as-Saffat und weitere.\n\n## Die Geschichte in Kürze\nAls junger Mann hinterfragte Ibrahim die Götzen seines Volkes und seines Vaters: Was untergeht und verschwindet, kann nicht Gott sein. Er zerbrach die Götzen und wurde ins Feuer geworfen, das Gott kühl und unschädlich machte. Später ließ er auf Gottes Befehl Hadschar und Ismail im Tal von Mekka zurück. Er wurde mit einem Traum geprüft, seinen Sohn zu opfern; beide fügten sich, und Gott löste den Sohn aus. Mit Ismail errichtete er die Grundmauern der Kaaba.\n\n## Lehren für heute\n- Den Verstand nutzen, um zum Glauben zu finden.\n- Mut, allein für die Wahrheit einzustehen.\n- Volles Vertrauen auf Gott in schweren Prüfungen.",
      "## من هو\nإبراهيم عليه السلام خليل الرحمن وأبو الأنبياء، يعظّمه المسلمون واليهود والنصارى.\n\n## موضعه في القرآن\nالبقرة والأنعام وإبراهيم ومريم والأنبياء والصافات وغيرها.\n\n## القصة باختصار\nناقش إبراهيم في شبابه أصنام قومه وأبيه، واستدل بأن ما يأفل ويغيب لا يكون إلهًا. حطّم الأصنام فأُلقي في النار، فجعلها الله بردًا وسلامًا. ثم ترك هاجر وابنه إسماعيل بوادي مكة بأمر الله. وابتُلي برؤيا ذبح ابنه فأسلما، ففداه الله. ورفع مع إسماعيل القواعد من البيت.\n\n## دروس لليوم\n- إعمال العقل طريق إلى الإيمان.\n- الشجاعة في الثبات على الحق ولو كان المرء وحده.\n- التوكل التام على الله في الشدائد."
    ),
    verses: ["6:76", "21:69", "37:102", "2:127", "4:125"],
    quiz: [
      q(l("What happened to the fire Ibrahim was thrown into?", "Was geschah mit dem Feuer, in das Ibrahim geworfen wurde?", "ماذا حدث للنار التي أُلقي فيها إبراهيم؟"),
        [l("It spread to the city", "Es breitete sich aus", "انتشرت في المدينة"), l("Rain put it out", "Regen löschte es", "أطفأها المطر"), l("God made it cool and safe", "Gott machte es kühl und unschädlich", "جعلها الله بردًا وسلامًا"), l("It was never lit", "Es wurde nie entzündet", "لم تُشعل")],
        2, l("See 21:69.", "Siehe 21:69.", "انظر 21:69.")),
      q(l("With whom did Ibrahim raise the foundations of the Ka'bah?", "Mit wem errichtete Ibrahim die Grundmauern der Kaaba?", "مع من رفع إبراهيم القواعد من البيت؟"),
        [l("Ishaq", "Ishaq", "إسحاق"), l("Lut", "Lut", "لوط"), l("Ya'qub", "Ya'qub", "يعقوب"), l("Ismail", "Ismail", "إسماعيل")],
        3, l("See 2:127.", "Siehe 2:127.", "انظر 2:127.")),
      q(l("Which title does the Quran give Ibrahim?", "Welchen Titel gibt der Koran Ibrahim?", "بماذا وصف القرآن إبراهيم؟"),
        [l("Friend of God (khalil)", "Freund Gottes (Chalil)", "خليل الله"), l("Spirit of God", "Geist Gottes", "روح الله"), l("Speaker with God", "Der mit Gott sprach", "كليم الله"), l("Seal of prophets", "Siegel der Propheten", "خاتم النبيين")],
        0, l("See 4:125.", "Siehe 4:125.", "انظر 4:125.")),
    ],
  },
  {
    id: "p06-lut",
    title: l("Lut: standing against corruption", "Lut: gegen den Verfall", "لوط: الوقوف في وجه الفساد"),
    body: l(
      "## Who\nLut (Lot) was a relative of Ibrahim who believed in his message and was sent to the towns of Sodom and the surrounding region.\n\n## Where in the Quran\nIn al-A'raf, Hud, al-Hijr, ash-Shu'ara, an-Naml and al-Ankabut.\n\n## The story in brief\nLut called his people to worship God and to abandon their open immorality, highway robbery and evil in their gatherings. They threatened to expel him and his family. Angels came to Ibrahim with good news, then to Lut as guests, and the people approached to harm them. The angels told Lut to leave at night with his family, except his wife, who stayed with the wrongdoers. The towns were overturned and destroyed.\n\n## Lessons for today\n- Speaking up against public wrongdoing, with wisdom.\n- Protecting guests and the vulnerable.\n- Closeness to a prophet does not save without one's own faith, as his wife shows.",
      "## Wer\nLut war ein Verwandter Ibrahims, der seiner Botschaft glaubte, und wurde zu den Städten um Sodom gesandt.\n\n## Wo im Koran\nIn al-A'raf, Hud, al-Hidschr, asch-Schu'ara, an-Naml und al-Ankabut.\n\n## Die Geschichte in Kürze\nLut rief sein Volk zur Anbetung Gottes und dazu, die offene Sittenlosigkeit, Wegelagerei und das Schlechte in ihren Versammlungen aufzugeben. Sie drohten, ihn und seine Familie zu vertreiben. Engel kamen mit froher Botschaft zu Ibrahim, dann als Gäste zu Lut, und das Volk wollte ihnen schaden. Die Engel forderten Lut auf, nachts mit seiner Familie fortzugehen, außer seiner Frau, die bei den Übeltätern blieb. Die Städte wurden umgestürzt und zerstört.\n\n## Lehren für heute\n- Mit Weisheit gegen öffentliches Unrecht sprechen.\n- Gäste und Schutzlose schützen.\n- Nähe zu einem Propheten rettet nicht ohne eigenen Glauben, wie seine Frau zeigt.",
      "## من هو\nلوط عليه السلام من قرابة إبراهيم، آمن به وأُرسل إلى قرى سدوم وما حولها.\n\n## موضعه في القرآن\nفي الأعراف وهود والحجر والشعراء والنمل والعنكبوت.\n\n## القصة باختصار\nدعا لوط قومه إلى عبادة الله وترك الفاحشة المعلنة وقطع السبيل والمنكر في ناديهم، فهدّدوه بالإخراج هو وأهله. جاءت الملائكة إبراهيم بالبشرى، ثم جاءت لوطًا ضيوفًا، فأقبل قومه يريدون بهم السوء. فأمرته الملائكة أن يسري بأهله ليلًا إلا امرأته فكانت من الغابرين، ثم جُعل عالي القرى سافلها.\n\n## دروس لليوم\n- إنكار المنكر العام بحكمة.\n- حماية الضيف والضعيف.\n- القرب من النبي لا ينفع بلا إيمان، كما في امرأته."
    ),
    verses: ["7:80", "11:81", "29:29", "66:10"],
    quiz: [
      q(l("Who among Lut's family was not saved?", "Wer aus Luts Familie wurde nicht gerettet?", "من لم ينجُ من أهل لوط؟"),
        [l("His daughters", "Seine Töchter", "بناته"), l("His wife", "Seine Frau", "امرأته"), l("His uncle", "Sein Onkel", "عمّه"), l("Everyone was saved", "Alle wurden gerettet", "نجا الجميع")],
        1, l("See 11:81 and 66:10.", "Siehe 11:81 und 66:10.", "انظر 11:81 و66:10.")),
      q(l("How were the angels presented to Lut?", "Wie kamen die Engel zu Lut?", "كيف جاءت الملائكة إلى لوط؟"),
        [l("As guests", "Als Gäste", "ضيوفًا"), l("As merchants' camels", "Als Karawane", "قافلة"), l("In a dream only", "Nur im Traum", "في المنام فقط"), l("As soldiers", "Als Soldaten", "جنودًا")],
        0, l("They came to him as guests.", "Sie kamen als Gäste.", "جاؤوه في صورة ضيوف.")),
      q(l("Lut was related to which prophet?", "Mit welchem Propheten war Lut verwandt?", "لوط من قرابة أي نبي؟"),
        [l("Musa", "Musa", "موسى"), l("Nuh", "Nuh", "نوح"), l("Ibrahim", "Ibrahim", "إبراهيم"), l("Yunus", "Yunus", "يونس")],
        2, l("Lut believed in Ibrahim's message (29:26).", "Lut glaubte Ibrahim (29:26).", "آمن لوط لإبراهيم (29:26).")),
    ],
  },
  {
    id: "p07-ismail-ishaq",
    title: l("Ismail and Ishaq: two sons, two lines", "Ismail und Ishaq: zwei Söhne, zwei Linien", "إسماعيل وإسحاق: ابنان وذريتان"),
    body: l(
      "## Who\nIsmail and Ishaq are both sons of Ibrahim and both prophets. Ismail's mother was Hajar, Ishaq's mother was Sarah.\n\n## Where in the Quran\nIsmail in al-Baqarah, Maryam and as-Saffat; Ishaq in Hud, as-Saffat and adh-Dhariyat.\n\n## The story in brief\nIsmail grew up in the valley of Makkah, where his mother's search for water between Safa and Marwah is remembered in the rites of Hajj and Umrah. The Quran praises him as true to his promise and as one who urged his family to prayer and charity. With his father he built the Ka'bah. Ishaq was announced by angels to Ibrahim and the elderly Sarah, who was amazed. From Ishaq came Ya'qub and the prophets of Bani Israil; from Ismail's line came Prophet Muhammad.\n\n## Lessons for today\n- God's promise reaches beyond what seems possible.\n- Keeping promises is a prophetic quality.\n- Both lines share one message.",
      "## Wer\nIsmail und Ishaq sind beide Söhne Ibrahims und beide Propheten. Ismails Mutter war Hadschar, Ishaqs Mutter Sara.\n\n## Wo im Koran\nIsmail in al-Baqara, Maryam und as-Saffat; Ishaq in Hud, as-Saffat und adh-Dhariyat.\n\n## Die Geschichte in Kürze\nIsmail wuchs im Tal von Mekka auf; die Wassersuche seiner Mutter zwischen Safa und Marwa lebt in den Riten von Hadsch und Umra fort. Der Koran lobt ihn als treu in seinem Versprechen und als jemanden, der seine Familie zu Gebet und Abgabe anhielt. Mit seinem Vater baute er die Kaaba. Ishaq wurde Ibrahim und der betagten Sara von Engeln angekündigt, worüber sie staunte. Von Ishaq stammen Ya'qub und die Propheten der Banu Isra'il, aus Ismails Linie Prophet Muhammad.\n\n## Lehren für heute\n- Gottes Zusage reicht über das scheinbar Mögliche hinaus.\n- Versprechen halten ist eine prophetische Eigenschaft.\n- Beide Linien tragen dieselbe Botschaft.",
      "## من هما\nإسماعيل وإسحاق ابنا إبراهيم، وكلاهما نبي. أم إسماعيل هاجر، وأم إسحاق سارة.\n\n## موضعهما في القرآن\nإسماعيل في البقرة ومريم والصافات، وإسحاق في هود والصافات والذاريات.\n\n## القصة باختصار\nنشأ إسماعيل بوادي مكة، وسعيُ أمه بين الصفا والمروة بحثًا عن الماء باقٍ في مناسك الحج والعمرة. وأثنى عليه القرآن بأنه صادق الوعد يأمر أهله بالصلاة والزكاة، وبنى مع أبيه الكعبة. وبشّرت الملائكة إبراهيم وسارة العجوز بإسحاق فتعجبت. ومن إسحاق جاء يعقوب وأنبياء بني إسرائيل، ومن ذرية إسماعيل جاء النبي محمد.\n\n## دروس لليوم\n- وعد الله فوق ما يبدو ممكنًا.\n- الوفاء بالوعد خُلق نبوي.\n- الذريتان تحملان رسالة واحدة."
    ),
    verses: ["19:54", "19:55", "11:71", "37:112"],
    quiz: [
      q(l("Who was Ismail's mother?", "Wer war Ismails Mutter?", "من أم إسماعيل؟"),
        [l("Sarah", "Sara", "سارة"), l("Maryam", "Maryam", "مريم"), l("Asiya", "Asiya", "آسية"), l("Hajar", "Hadschar", "هاجر")],
        3, l("Hajar, remembered in the sa'y between Safa and Marwah.", "Hadschar, an die der Sa'y erinnert.", "هاجر، ويُذكر سعيها في المناسك.")),
      q(l("Which quality does the Quran praise in Ismail?", "Welche Eigenschaft lobt der Koran an Ismail?", "بماذا أثنى القرآن على إسماعيل؟"),
        [l("Keeping his promise", "Er hielt sein Versprechen", "صدق الوعد"), l("Great wealth", "Großer Reichtum", "كثرة المال"), l("Skill in war", "Kriegskunst", "البراعة في الحرب"), l("Poetry", "Dichtung", "الشعر")],
        0, l("See 19:54.", "Siehe 19:54.", "انظر 19:54.")),
      q(l("Which prophet descended from Ishaq?", "Welcher Prophet stammt von Ishaq ab?", "أي نبي من ذرية إسحاق؟"),
        [l("Hud", "Hud", "هود"), l("Ya'qub", "Ya'qub", "يعقوب"), l("Salih", "Salih", "صالح"), l("Muhammad", "Muhammad", "محمد")],
        1, l("Ya'qub was Ishaq's son (11:71).", "Ya'qub war Ishaqs Sohn (11:71).", "يعقوب ابن إسحاق (11:71).")),
    ],
  },
  {
    id: "p08-yaqub-yusuf",
    title: l("Ya'qub and Yusuf: the best of stories", "Ya'qub und Yusuf: die schönste Geschichte", "يعقوب ويوسف: أحسن القصص"),
    body: l(
      "## Who\nYa'qub (Jacob, also called Israil) was the son of Ishaq; Yusuf (Joseph) was his beloved son.\n\n## Where in the Quran\nSurah Yusuf (12) tells the story in one continuous narrative and calls it the best of stories.\n\n## The story in brief\nYusuf saw in a dream eleven stars, the sun and the moon bowing to him. His jealous brothers threw him into a well; travellers sold him in Egypt. In the house of a high official he resisted temptation and was imprisoned unjustly. In prison he interpreted dreams, and later the king's dream of seven fat and seven lean cows. He became responsible for the stores of Egypt. In the famine his brothers came, and in the end he forgave them and was reunited with his father, who had kept beautiful patience throughout.\n\n## Lessons for today\n- Patience and hope in grief.\n- Integrity when no one is watching.\n- Forgiveness instead of revenge.",
      "## Wer\nYa'qub (Jakob, auch Isra'il genannt) war der Sohn Ishaqs; Yusuf (Josef) war sein geliebter Sohn.\n\n## Wo im Koran\nSure Yusuf (12) erzählt die Geschichte zusammenhängend und nennt sie die schönste Erzählung.\n\n## Die Geschichte in Kürze\nYusuf sah im Traum elf Sterne, Sonne und Mond, die sich vor ihm niederwarfen. Seine neidischen Brüder warfen ihn in einen Brunnen; Reisende verkauften ihn nach Ägypten. Im Haus eines hohen Beamten widerstand er der Verführung und kam unschuldig ins Gefängnis. Dort deutete er Träume, später den Traum des Königs von sieben fetten und sieben mageren Kühen. Er wurde für die Vorräte Ägyptens verantwortlich. In der Hungersnot kamen seine Brüder; am Ende vergab er ihnen und fand seinen Vater wieder, der in schöner Geduld ausgeharrt hatte.\n\n## Lehren für heute\n- Geduld und Hoffnung im Kummer.\n- Rechtschaffenheit, auch wenn niemand zusieht.\n- Vergebung statt Rache.",
      "## من هما\nيعقوب (إسرائيل) ابن إسحاق، ويوسف ابنه الأحب إليه.\n\n## موضعهما في القرآن\nسورة يوسف (12) تروي القصة متصلة وتصفها بأحسن القصص.\n\n## القصة باختصار\nرأى يوسف في منامه أحد عشر كوكبًا والشمس والقمر له ساجدين. فحسده إخوته وألقوه في الجب، وباعه السيارة في مصر. وفي بيت العزيز استعصم أمام الفتنة فسُجن ظلمًا. وفي السجن عبّر الرؤى، ثم رؤيا الملك في سبع بقرات سمان وسبع عجاف، فجُعل على خزائن الأرض. وفي المجاعة جاء إخوته، فعفا عنهم واجتمع بأبيه الذي صبر صبرًا جميلًا.\n\n## دروس لليوم\n- الصبر والرجاء عند الحزن.\n- النزاهة حين لا يراك أحد.\n- العفو بدل الانتقام."
    ),
    verses: ["12:3", "12:4", "12:18", "12:92", "12:100"],
    quiz: [
      q(l("What did Yusuf see in his first dream?", "Was sah Yusuf in seinem ersten Traum?", "ماذا رأى يوسف في رؤياه الأولى؟"),
        [l("Seven cows", "Sieben Kühe", "سبع بقرات"), l("A ship", "Ein Schiff", "سفينة"), l("Eleven stars, the sun and the moon", "Elf Sterne, Sonne und Mond", "أحد عشر كوكبًا والشمس والقمر"), l("A burning bush", "Einen brennenden Busch", "شجرة مشتعلة")],
        2, l("See 12:4.", "Siehe 12:4.", "انظر 12:4.")),
      q(l("How did Yusuf treat his brothers in the end?", "Wie begegnete Yusuf am Ende seinen Brüdern?", "كيف عامل يوسف إخوته في النهاية؟"),
        [l("He forgave them", "Er vergab ihnen", "عفا عنهم"), l("He imprisoned them", "Er sperrte sie ein", "سجنهم"), l("He sent them away", "Er schickte sie fort", "طردهم"), l("He demanded payment", "Er verlangte Bezahlung", "طلب منهم مالًا")],
        0, l("See 12:92.", "Siehe 12:92.", "انظر 12:92.")),
      q(l("What kind of patience did Ya'qub show?", "Welche Geduld zeigte Ya'qub?", "ما صفة صبر يعقوب؟"),
        [l("Angry patience", "Zornige Geduld", "صبر غاضب"), l("Beautiful patience", "Schöne Geduld", "صبر جميل"), l("No patience", "Keine Geduld", "لا صبر"), l("Silent revenge", "Stille Rache", "انتقام صامت")],
        1, l("See 12:18.", "Siehe 12:18.", "انظر 12:18.")),
    ],
  },
  {
    id: "p09-shuayb",
    title: l("Shu'ayb: honesty in trade", "Schu'aib: Ehrlichkeit im Handel", "شعيب: الأمانة في التجارة"),
    body: l(
      "## Who\nShu'ayb was sent to Madyan (and, according to many commentators, the people of al-Aykah), a trading people in north-west Arabia.\n\n## Where in the Quran\nIn al-A'raf, Hud, ash-Shu'ara and al-Ankabut.\n\n## The story in brief\nBesides calling to worship God alone, Shu'ayb addressed a specific social wrong: cheating with measures and weights and diminishing people's goods. He said he only wanted reform as far as he was able. His people mocked him, asking whether his prayer told him to interfere with their wealth, and threatened to expel him. Only respect for his clan held them back. In the end they were seized by punishment, while Shu'ayb and the believers were saved.\n\n## Lessons for today\n- Faith includes fairness in business.\n- Economic honesty is part of worship.\n- Reform starts with what one is able to do.",
      "## Wer\nSchu'aib wurde zu Madyan gesandt (nach vielen Kommentatoren auch zu den Leuten von al-Aika), einem Handelsvolk im Nordwesten Arabiens.\n\n## Wo im Koran\nIn al-A'raf, Hud, asch-Schu'ara und al-Ankabut.\n\n## Die Geschichte in Kürze\nNeben dem Aufruf zur Anbetung des einen Gottes sprach Schu'aib ein konkretes soziales Unrecht an: Betrug bei Maß und Gewicht und das Schmälern der Güter anderer. Er sagte, er wolle nur Besserung, soweit er es vermöge. Sein Volk spottete, ob ihm sein Gebet befehle, sich in ihr Vermögen einzumischen, und drohte, ihn zu vertreiben. Nur die Rücksicht auf seine Sippe hielt sie zurück. Am Ende ereilte sie die Strafe, Schu'aib und die Gläubigen wurden gerettet.\n\n## Lehren für heute\n- Glaube umfasst Fairness im Geschäft.\n- Wirtschaftliche Ehrlichkeit ist Teil des Gottesdienstes.\n- Besserung beginnt mit dem, was man vermag.",
      "## من هو\nأُرسل شعيب عليه السلام إلى مدين (وإلى أصحاب الأيكة عند كثير من المفسرين)، وهم قوم تجارة في شمال غرب الجزيرة.\n\n## موضعه في القرآن\nفي الأعراف وهود والشعراء والعنكبوت.\n\n## القصة باختصار\nمع الدعوة إلى التوحيد عالج شعيب ظلمًا اجتماعيًا محددًا: التطفيف في الكيل والميزان وبخس الناس أشياءهم. وقال إنه لا يريد إلا الإصلاح ما استطاع. فسخر قومه متسائلين: أصلاتك تأمرك أن نترك ما نفعل في أموالنا؟ وهددوه بالإخراج، ولولا رهطه لرجموه. ثم أخذهم العذاب ونجّى الله شعيبًا والمؤمنين.\n\n## دروس لليوم\n- الإيمان يشمل العدل في المعاملات.\n- الأمانة الاقتصادية من العبادة.\n- الإصلاح يبدأ بقدر الاستطاعة."
    ),
    verses: ["7:85", "11:84", "11:87", "11:88"],
    quiz: [
      q(l("Which social wrong did Shu'ayb address?", "Welches soziale Unrecht sprach Schu'aib an?", "ما الظلم الاجتماعي الذي عالجه شعيب؟"),
        [l("Cheating in measures and weights", "Betrug bei Maß und Gewicht", "التطفيف في الكيل والميزان"), l("Idol carving only", "Nur Götzenschnitzerei", "نحت الأصنام فقط"), l("Building towers", "Turmbau", "بناء الأبراج"), l("Sea piracy", "Seeräuberei", "القرصنة البحرية")],
        0, l("See 11:84.", "Siehe 11:84.", "انظر 11:84.")),
      q(l("To which people was Shu'ayb sent?", "Zu welchem Volk wurde Schu'aib gesandt?", "إلى من أُرسل شعيب؟"),
        [l("'Ad", "'Ad", "عاد"), l("Thamud", "Thamud", "ثمود"), l("Pharaoh's people", "Pharaos Volk", "قوم فرعون"), l("Madyan", "Madyan", "مدين")],
        3, l("See 7:85.", "Siehe 7:85.", "انظر 7:85.")),
      q(l("What did Shu'ayb say his aim was?", "Was nannte Schu'aib als sein Ziel?", "ما الذي قال شعيب إنه يريده؟"),
        [l("Power", "Macht", "السلطة"), l("Reform as far as he could", "Besserung, soweit er vermag", "الإصلاح ما استطاع"), l("Wealth", "Reichtum", "المال"), l("Revenge", "Rache", "الانتقام")],
        1, l("See 11:88.", "Siehe 11:88.", "انظر 11:88.")),
    ],
  },
  {
    id: "p10-musa-pharaoh",
    title: l("Musa (1): birth, calling and Pharaoh", "Musa (1): Geburt, Berufung und Pharao", "موسى (1): المولد والبعثة وفرعون"),
    body: l(
      "## Who\nMusa (Moses) is the prophet mentioned most often by name in the Quran. God spoke to him directly.\n\n## Where in the Quran\nEspecially al-Qasas, Taha, ash-Shu'ara, al-A'raf and Yunus.\n\n## The story in brief\nPharaoh oppressed Bani Israil and killed their newborn sons. God inspired Musa's mother to place him in the river; he was taken into Pharaoh's palace and returned to his mother to nurse. As an adult he accidentally killed a man, fled to Madyan, married and worked there. On the way back, at the valley of Tuwa, God called him and sent him with his brother Harun to Pharaoh. Musa showed signs such as the staff and the shining hand. Pharaoh's magicians believed; Pharaoh refused. God parted the sea, Bani Israil crossed, and Pharaoh drowned.\n\n## Lessons for today\n- God's plan works through what seems weak.\n- Speak to even a tyrant with gentle words.\n- Oppression does not last.",
      "## Wer\nMusa (Mose) ist der im Koran am häufigsten namentlich genannte Prophet. Gott sprach direkt zu ihm.\n\n## Wo im Koran\nBesonders al-Qasas, Taha, asch-Schu'ara, al-A'raf und Yunus.\n\n## Die Geschichte in Kürze\nPharao unterdrückte die Banu Isra'il und tötete ihre neugeborenen Söhne. Gott gab Musas Mutter ein, ihn dem Fluss anzuvertrauen; er kam in Pharaos Palast und wurde seiner Mutter zum Stillen zurückgegeben. Als Erwachsener tötete er versehentlich einen Mann, floh nach Madyan, heiratete und arbeitete dort. Auf dem Rückweg rief Gott ihn im Tal Tuwa und sandte ihn mit seinem Bruder Harun zu Pharao. Musa zeigte Zeichen wie den Stab und die leuchtende Hand. Pharaos Zauberer glaubten, Pharao nicht. Gott teilte das Meer, die Banu Isra'il zogen hindurch, Pharao ertrank.\n\n## Lehren für heute\n- Gottes Plan wirkt durch das scheinbar Schwache.\n- Selbst einen Tyrannen mit milden Worten ansprechen.\n- Unterdrückung hat keinen Bestand.",
      "## من هو\nموسى عليه السلام أكثر الأنبياء ذكرًا باسمه في القرآن، وكلّمه الله تكليمًا.\n\n## موضعه في القرآن\nخاصة القصص وطه والشعراء والأعراف ويونس.\n\n## القصة باختصار\nاستضعف فرعون بني إسرائيل وذبّح أبناءهم، فأوحى الله إلى أم موسى أن تلقيه في اليم، فالتقطه آل فرعون ورُدّ إلى أمه لترضعه. ولما كبر قتل رجلًا خطأً ففرّ إلى مدين وتزوج وعمل هناك. وفي طريق العودة ناداه الله بالوادي المقدس طوى، وأرسله مع أخيه هارون إلى فرعون. فأظهر الآيات كالعصا واليد البيضاء، فآمن السحرة وأبى فرعون. ثم فلق الله البحر فعبر بنو إسرائيل وغرق فرعون.\n\n## دروس لليوم\n- تدبير الله يجري عبر ما يبدو ضعيفًا.\n- القول اللين حتى مع الطاغية.\n- الظلم لا يدوم."
    ),
    verses: ["28:7", "20:12", "20:44", "26:63", "4:164"],
    quiz: [
      q(l("What did God inspire Musa's mother to do?", "Was gab Gott Musas Mutter ein?", "بماذا أوحى الله إلى أم موسى؟"),
        [l("Hide him in a cave", "Ihn in einer Höhle verstecken", "أن تخفيه في كهف"), l("Flee to Madyan", "Nach Madyan fliehen", "أن تهرب إلى مدين"), l("Place him in the river", "Ihn dem Fluss anvertrauen", "أن تلقيه في اليم"), l("Give him to the magicians", "Ihn den Zauberern geben", "أن تسلمه للسحرة")],
        2, l("See 28:7.", "Siehe 28:7.", "انظر 28:7.")),
      q(l("How were Musa and Harun told to speak to Pharaoh?", "Wie sollten Musa und Harun zu Pharao sprechen?", "كيف أُمر موسى وهارون أن يخاطبا فرعون؟"),
        [l("With gentle words", "Mit milden Worten", "بالقول اللين"), l("With threats", "Mit Drohungen", "بالتهديد"), l("Not at all", "Gar nicht", "ألا يكلماه"), l("Only in writing", "Nur schriftlich", "كتابةً فقط")],
        0, l("See 20:44.", "Siehe 20:44.", "انظر 20:44.")),
      q(l("Who believed after seeing Musa's sign?", "Wer glaubte, nachdem er Musas Zeichen sah?", "من آمن بعد رؤية آية موسى؟"),
        [l("Pharaoh", "Pharao", "فرعون"), l("Haman", "Haman", "هامان"), l("Qarun", "Qarun", "قارون"), l("The magicians", "Die Zauberer", "السحرة")],
        3, l("The magicians fell down in prostration (20:70).", "Die Zauberer warfen sich nieder (20:70).", "خرّ السحرة سجدًا (20:70).")),
    ],
  },
  {
    id: "p11-musa-desert",
    title: l("Musa (2): Bani Israil in the desert", "Musa (2): Die Banu Isra'il in der Wüste", "موسى (2): بنو إسرائيل في التيه"),
    body: l(
      "## Who\nAfter the rescue from Pharaoh, Musa led Bani Israil through the Sinai.\n\n## Where in the Quran\nAl-Baqarah, al-Ma'idah, al-A'raf, Taha and al-Kahf.\n\n## The story in brief\nGod provided shade by clouds, manna and quails, and twelve springs from a rock. Musa went to the appointed meeting and received the Tablets; meanwhile some worshipped a golden calf made by as-Samiri, and Harun tried to stop them. Musa returned in anger and grief, and the people repented. Later they hesitated to enter the holy land out of fear, and wandered forty years. The Quran also tells of the cow they were told to slaughter and of Musa's journey with a wise servant of God, known as al-Khidr, from whom he learned patience with what he did not understand.\n\n## Lessons for today\n- Gratitude for daily provision.\n- Quick return after a fall.\n- Humility in learning: there is always more knowledge.",
      "## Wer\nNach der Rettung vor Pharao führte Musa die Banu Isra'il durch den Sinai.\n\n## Wo im Koran\nAl-Baqara, al-Ma'ida, al-A'raf, Taha und al-Kahf.\n\n## Die Geschichte in Kürze\nGott gab Schatten durch Wolken, Manna und Wachteln und zwölf Quellen aus einem Felsen. Musa ging zur verabredeten Begegnung und empfing die Tafeln; inzwischen beteten einige ein goldenes Kalb an, das as-Samiri gemacht hatte, und Harun versuchte sie aufzuhalten. Musa kehrte zornig und betrübt zurück, das Volk bereute. Später zögerten sie aus Angst, das heilige Land zu betreten, und irrten vierzig Jahre umher. Der Koran erzählt auch von der Kuh, die sie schlachten sollten, und von Musas Reise mit einem weisen Diener Gottes, bekannt als al-Chidr, bei dem er Geduld mit dem Unverstandenen lernte.\n\n## Lehren für heute\n- Dankbarkeit für die tägliche Versorgung.\n- Nach einem Fehltritt rasch umkehren.\n- Demut beim Lernen: Es gibt immer mehr Wissen.",
      "## الإطار\nبعد النجاة من فرعون قاد موسى بني إسرائيل في سيناء.\n\n## موضعه في القرآن\nالبقرة والمائدة والأعراف وطه والكهف.\n\n## القصة باختصار\nظلّل الله عليهم الغمام وأنزل المن والسلوى وفجّر من الحجر اثنتي عشرة عينًا. وذهب موسى لميقات ربه فتلقّى الألواح، وفي غيابه عبد بعضهم عجلًا صنعه السامري، وحاول هارون نهيهم. فرجع موسى غضبان أسفًا، وتاب القوم. ثم جبنوا عن دخول الأرض المقدسة فتاهوا أربعين سنة. ويذكر القرآن أيضًا قصة البقرة، ورحلة موسى مع عبد صالح عُرف بالخضر تعلّم فيها الصبر على ما لم يُحط به علمًا.\n\n## دروس لليوم\n- شكر الرزق اليومي.\n- سرعة الرجوع بعد الزلة.\n- التواضع في طلب العلم، ففوق كل ذي علم عليم."
    ),
    verses: ["2:57", "2:60", "20:88", "5:26", "18:65"],
    quiz: [
      q(l("How long did Bani Israil wander in the desert?", "Wie lange irrten die Banu Isra'il umher?", "كم سنة تاه بنو إسرائيل؟"),
        [l("Seven years", "Sieben Jahre", "سبع سنين"), l("Forty years", "Vierzig Jahre", "أربعين سنة"), l("Twelve years", "Zwölf Jahre", "اثنتي عشرة سنة"), l("One year", "Ein Jahr", "سنة واحدة")],
        1, l("See 5:26.", "Siehe 5:26.", "انظر 5:26.")),
      q(l("Who made the golden calf?", "Wer machte das goldene Kalb?", "من صنع العجل؟"),
        [l("Harun", "Harun", "هارون"), l("Pharaoh", "Pharao", "فرعون"), l("As-Samiri", "As-Samiri", "السامري"), l("Qarun", "Qarun", "قارون")],
        2, l("See 20:85-88.", "Siehe 20:85-88.", "انظر 20:85-88.")),
      q(l("What did Musa learn on his journey with al-Khidr?", "Was lernte Musa auf der Reise mit al-Chidr?", "ماذا تعلّم موسى في رحلته مع الخضر؟"),
        [l("Patience with what he did not understand", "Geduld mit dem Unverstandenen", "الصبر على ما لم يُحط به علمًا"), l("Navigation", "Navigation", "الملاحة"), l("Magic", "Zauberei", "السحر"), l("Trade", "Handel", "التجارة")],
        0, l("See al-Kahf 18:60-82.", "Siehe al-Kahf 18:60-82.", "انظر الكهف 18:60-82.")),
    ],
  },
  {
    id: "p12-dawud-sulayman",
    title: l("Dawud and Sulayman: kingship and gratitude", "Dawud und Sulaiman: Herrschaft und Dankbarkeit", "داود وسليمان: الملك والشكر"),
    body: l(
      "## Who\nDawud (David) and his son Sulayman (Solomon) were prophets and kings of Bani Israil.\n\n## Where in the Quran\nAl-Baqarah, al-Anbiya, an-Naml, Saba and Sad.\n\n## The story in brief\nAs a young man Dawud defeated Jalut (Goliath). God gave him kingship, wisdom and the Zabur (Psalms); mountains and birds glorified God with him, and iron was made soft for him to make armour. He judged between people and turned quickly to God in repentance. Sulayman inherited knowledge, understood the speech of birds and ants, and was given power over the wind and the jinn. He heard an ant warning its colony and smiled, thanking God. Through the hoopoe he learned of the Queen of Saba, who came to believe in God.\n\n## Lessons for today\n- Power is a trust, not a privilege.\n- Gratitude keeps blessings in their place.\n- Justice in judgment, even for the powerful.",
      "## Wer\nDawud (David) und sein Sohn Sulaiman (Salomo) waren Propheten und Könige der Banu Isra'il.\n\n## Wo im Koran\nAl-Baqara, al-Anbiya, an-Naml, Saba und Sad.\n\n## Die Geschichte in Kürze\nAls junger Mann besiegte Dawud Dschalut (Goliath). Gott gab ihm Herrschaft, Weisheit und den Zabur (Psalmen); Berge und Vögel priesen Gott mit ihm, und Eisen wurde ihm weich gemacht, um Rüstungen zu fertigen. Er richtete zwischen den Menschen und wandte sich schnell reuig an Gott. Sulaiman erbte Wissen, verstand die Sprache der Vögel und Ameisen und erhielt Macht über Wind und Dschinn. Er hörte eine Ameise ihr Volk warnen, lächelte und dankte Gott. Durch den Wiedehopf erfuhr er von der Königin von Saba, die zum Glauben an Gott fand.\n\n## Lehren für heute\n- Macht ist anvertrautes Gut, kein Vorrecht.\n- Dankbarkeit hält Gaben an ihrem Platz.\n- Gerechtigkeit im Urteil, auch für Mächtige.",
      "## من هما\nداود وابنه سليمان عليهما السلام نبيان وملكان في بني إسرائيل.\n\n## موضعهما في القرآن\nالبقرة والأنبياء والنمل وسبأ وص.\n\n## القصة باختصار\nقتل داود جالوت في شبابه، وآتاه الله الملك والحكمة والزبور، وسخّر الجبال والطير يسبّحن معه، وألان له الحديد ليصنع الدروع. وكان يحكم بين الناس ويسارع إلى الإنابة. وورث سليمان العلم، وعُلّم منطق الطير، وسُخّرت له الريح والجن. وسمع نملة تحذّر قومها فتبسّم شاكرًا لله. وعلم بالهدهد خبر ملكة سبأ التي أسلمت لله.\n\n## دروس لليوم\n- السلطة أمانة لا امتياز.\n- الشكر يحفظ النعم.\n- العدل في الحكم ولو على الأقوياء."
    ),
    verses: ["2:251", "34:10", "27:16", "27:19", "27:44"],
    quiz: [
      q(l("Which scripture was given to Dawud?", "Welche Schrift erhielt Dawud?", "ما الكتاب الذي أوتيه داود؟"),
        [l("Tawrah", "Tora", "التوراة"), l("Injil", "Evangelium", "الإنجيل"), l("Suhuf only", "Nur Blätter", "الصحف فقط"), l("Zabur", "Zabur", "الزبور")],
        3, l("See 4:163.", "Siehe 4:163.", "انظر 4:163.")),
      q(l("What did Sulayman do when he heard the ant?", "Was tat Sulaiman, als er die Ameise hörte?", "ماذا فعل سليمان حين سمع النملة؟"),
        [l("He smiled and thanked God", "Er lächelte und dankte Gott", "تبسّم وشكر الله"), l("He ordered his army to stop forever", "Er hielt sein Heer für immer an", "أوقف جيشه للأبد"), l("He ignored it", "Er überhörte sie", "تجاهلها"), l("He punished it", "Er bestrafte sie", "عاقبها")],
        0, l("See 27:19.", "Siehe 27:19.", "انظر 27:19.")),
      q(l("Which bird brought news of the Queen of Saba?", "Welcher Vogel brachte Nachricht von der Königin von Saba?", "أي طائر جاء بخبر ملكة سبأ؟"),
        [l("A crow", "Ein Rabe", "الغراب"), l("The hoopoe", "Der Wiedehopf", "الهدهد"), l("A dove", "Eine Taube", "الحمامة"), l("An eagle", "Ein Adler", "النسر")],
        1, l("See 27:20-22.", "Siehe 27:20-22.", "انظر 27:20-22.")),
    ],
  },
  {
    id: "p13-ayyub-yunus",
    title: l("Ayyub and Yunus: patience and return", "Ayyub und Yunus: Geduld und Umkehr", "أيوب ويونس: الصبر والإنابة"),
    body: l(
      "## Who\nAyyub (Job) is the example of patience in illness and loss. Yunus (Jonah), also called Dhu an-Nun, is the example of turning back to God from darkness.\n\n## Where in the Quran\nAyyub in al-Anbiya and Sad; Yunus in Yunus, al-Anbiya, as-Saffat and al-Qalam.\n\n## The story in brief\nAyyub lost health, wealth and family, yet never complained against God. He called on his Lord, acknowledging that harm had touched him and that God is the Most Merciful. God healed him and restored his family and more. Yunus left his people in frustration before being permitted. He boarded a ship, was cast into the sea and swallowed by a great fish. In the darkness he declared God's oneness, glorified Him and admitted his wrong. God rescued him, and his people, uniquely, believed and were spared.\n\n## Lessons for today\n- Patience is not silence but trust while asking God.\n- No darkness is too deep for sincere supplication.\n- Never give up on people too early.",
      "## Wer\nAyyub (Hiob) ist das Vorbild der Geduld in Krankheit und Verlust. Yunus (Jona), auch Dhu n-Nun genannt, ist das Vorbild der Umkehr aus der Dunkelheit.\n\n## Wo im Koran\nAyyub in al-Anbiya und Sad; Yunus in Yunus, al-Anbiya, as-Saffat und al-Qalam.\n\n## Die Geschichte in Kürze\nAyyub verlor Gesundheit, Vermögen und Familie, klagte aber nie gegen Gott. Er rief seinen Herrn an, bekannte, dass ihn Leid getroffen habe und Gott der Barmherzigste sei. Gott heilte ihn und gab ihm seine Familie und mehr zurück. Yunus verließ sein Volk enttäuscht, bevor es ihm erlaubt war. Er bestieg ein Schiff, wurde ins Meer geworfen und von einem großen Fisch verschluckt. In der Dunkelheit bezeugte er Gottes Einheit, pries Ihn und gestand sein Unrecht. Gott rettete ihn, und sein Volk glaubte als einziges und wurde verschont.\n\n## Lehren für heute\n- Geduld ist kein Schweigen, sondern Vertrauen im Bitten.\n- Keine Dunkelheit ist zu tief für aufrichtiges Bittgebet.\n- Menschen nicht zu früh aufgeben.",
      "## من هما\nأيوب عليه السلام مثال الصبر على المرض والفقد، ويونس (ذو النون) مثال الرجوع إلى الله من الظلمات.\n\n## موضعهما في القرآن\nأيوب في الأنبياء وص، ويونس في يونس والأنبياء والصافات والقلم.\n\n## القصة باختصار\nفقد أيوب الصحة والمال والأهل ولم يشكُ الله، بل نادى ربه معترفًا بأن الضر مسّه وأن الله أرحم الراحمين، فشفاه الله وآتاه أهله ومثلهم معهم. وخرج يونس من قومه مغاضبًا قبل الإذن، فركب الفلك فساهم فأُلقي في البحر والتقمه الحوت. فنادى في الظلمات بالتوحيد والتسبيح والاعتراف بالظلم، فنجّاه الله، وآمن قومه فكُشف عنهم العذاب.\n\n## دروس لليوم\n- الصبر ليس سكوتًا بل ثقة مع الدعاء.\n- لا ظلمة أعمق من أن يبلغها الدعاء الصادق.\n- لا تيأس من الناس مبكرًا."
    ),
    verses: ["21:83", "21:84", "38:44", "21:87", "10:98"],
    quiz: [
      q(l("Which quality is Ayyub especially known for?", "Wofür ist Ayyub besonders bekannt?", "بماذا اشتهر أيوب؟"),
        [l("Wealth", "Reichtum", "الغنى"), l("Kingship", "Königtum", "الملك"), l("Patience", "Geduld", "الصبر"), l("Travel", "Reisen", "السفر")],
        2, l("See 38:44.", "Siehe 38:44.", "انظر 38:44.")),
      q(l("What swallowed Yunus?", "Was verschluckte Yunus?", "ما الذي التقم يونس؟"),
        [l("A whale or great fish", "Ein großer Fisch", "الحوت"), l("The earth", "Die Erde", "الأرض"), l("A storm", "Ein Sturm", "العاصفة"), l("A cave", "Eine Höhle", "كهف")],
        0, l("See 37:142.", "Siehe 37:142.", "انظر 37:142.")),
      q(l("What was special about Yunus's people?", "Was war besonders an Yunus' Volk?", "ما الذي تميّز به قوم يونس؟"),
        [l("They built the ark", "Sie bauten die Arche", "بنوا السفينة"), l("They believed and were spared", "Sie glaubten und wurden verschont", "آمنوا فكُشف عنهم العذاب"), l("They were all prophets", "Alle waren Propheten", "كانوا كلهم أنبياء"), l("They lived in Egypt", "Sie lebten in Ägypten", "سكنوا مصر")],
        1, l("See 10:98.", "Siehe 10:98.", "انظر 10:98.")),
    ],
  },
  {
    id: "p14-zakariyya-yahya",
    title: l("Zakariyya and Yahya: a prayer answered", "Zakariyya und Yahya: ein erhörtes Gebet", "زكريا ويحيى: دعاء مستجاب"),
    body: l(
      "## Who\nZakariyya (Zechariah) was a prophet and guardian of Maryam in the temple. Yahya (John) was his son.\n\n## Where in the Quran\nAl Imran, Maryam and al-Anbiya.\n\n## The story in brief\nZakariyya found provision with the young Maryam in her place of worship and she said it came from God. Moved by this, the elderly Zakariyya, whose wife was barren, called on God quietly for a righteous heir. Angels gave him the news of a son named Yahya, a name given to no one before. As a sign he was unable to speak to people for three days except by gestures. Yahya grew up with wisdom as a child, kindness to his parents, purity and devotion, and confirmed the coming word from God, Isa.\n\n## Lessons for today\n- Never stop asking God, whatever the circumstances.\n- Quiet, humble prayer is beloved.\n- Kindness to parents is a mark of righteousness.",
      "## Wer\nZakariyya (Zacharias) war Prophet und Vormund Maryams im Tempel. Yahya (Johannes) war sein Sohn.\n\n## Wo im Koran\nAl Imran, Maryam und al-Anbiya.\n\n## Die Geschichte in Kürze\nZakariyya fand bei der jungen Maryam in ihrer Gebetsstätte Versorgung, und sie sagte, sie komme von Gott. Davon bewegt rief der betagte Zakariyya, dessen Frau unfruchtbar war, Gott leise um einen rechtschaffenen Erben an. Engel verkündeten ihm einen Sohn namens Yahya, einen Namen, den zuvor niemand trug. Als Zeichen konnte er drei Tage lang nur durch Gesten zu den Menschen sprechen. Yahya erhielt schon als Kind Weisheit, war gütig zu den Eltern, rein und gottergeben und bestätigte das kommende Wort von Gott, Isa.\n\n## Lehren für heute\n- Nie aufhören, Gott zu bitten, gleich unter welchen Umständen.\n- Leises, demütiges Gebet ist geliebt.\n- Güte zu den Eltern ist ein Zeichen der Rechtschaffenheit.",
      "## من هما\nزكريا عليه السلام نبي وكافل مريم في المحراب، ويحيى ابنه.\n\n## موضعهما في القرآن\nآل عمران ومريم والأنبياء.\n\n## القصة باختصار\nوجد زكريا عند مريم الصغيرة رزقًا في المحراب فقالت: هو من عند الله. فتحرّك قلبه، وكان شيخًا وامرأته عاقرًا، فنادى ربه نداءً خفيًّا يسأله وليًّا صالحًا. فبشّرته الملائكة بغلام اسمه يحيى لم يُجعل له من قبل سميًّا. وكانت آيته ألا يكلم الناس ثلاثة أيام إلا رمزًا. ونشأ يحيى وقد أوتي الحكم صبيًّا، برًّا بوالديه، طاهرًا تقيًّا، مصدّقًا بكلمة من الله، أي عيسى.\n\n## دروس لليوم\n- لا تنقطع عن الدعاء مهما كانت الأسباب.\n- الدعاء الخفي المتضرع محبوب.\n- البر بالوالدين علامة الصلاح."
    ),
    verses: ["3:37", "3:39", "19:3", "19:7", "19:12"],
    quiz: [
      q(l("What was special about the name Yahya?", "Was war besonders am Namen Yahya?", "ما الذي تميّز به اسم يحيى؟"),
        [l("It was Hebrew", "Er war hebräisch", "كان عبريًا"), l("It meant king", "Er bedeutete König", "معناه الملك"), l("His father chose it", "Der Vater wählte ihn", "اختاره أبوه"), l("No one had it before", "Niemand trug ihn zuvor", "لم يُسمَّ به أحد قبله")],
        3, l("See 19:7.", "Siehe 19:7.", "انظر 19:7.")),
      q(l("What was Zakariyya's sign?", "Was war Zakariyyas Zeichen?", "ما آية زكريا؟"),
        [l("Not speaking for three days except by gestures", "Drei Tage nur durch Gesten sprechen", "ألا يكلم الناس ثلاثة أيام إلا رمزًا"), l("A shining hand", "Eine leuchtende Hand", "يد بيضاء"), l("A she-camel", "Eine Kamelstute", "ناقة"), l("A staff", "Ein Stab", "عصا")],
        0, l("See 3:41 and 19:10.", "Siehe 3:41 und 19:10.", "انظر 3:41 و19:10.")),
      q(l("Whose guardian was Zakariyya?", "Wessen Vormund war Zakariyya?", "من كفل زكريا؟"),
        [l("Yusuf", "Yusuf", "يوسف"), l("Maryam", "Maryam", "مريم"), l("Musa", "Musa", "موسى"), l("Harun", "Harun", "هارون")],
        1, l("See 3:37.", "Siehe 3:37.", "انظر 3:37.")),
    ],
  },
  {
    id: "p15-isa-maryam",
    title: l("Isa and Maryam", "Isa und Maryam", "عيسى ومريم"),
    body: l(
      "## Who\nMaryam (Mary) is the only woman named in the Quran, and a surah carries her name. Her son Isa (Jesus) is a great messenger, called the Messiah and a word from God.\n\n## Where in the Quran\nAl Imran, an-Nisa, al-Ma'idah and Maryam.\n\n## The story in brief\nAngels told Maryam that God had chosen and purified her. She was given the news of a son without a father; the Quran compares his creation to that of Adam. As a newborn Isa spoke in defence of his mother. He was given the Injil and, by God's permission, miracles such as healing the blind and the leper and bringing the dead to life. Muslims believe he is a human prophet and servant of God, not divine. According to the Quran he was not killed nor crucified, but God raised him to Himself.\n\n## Lessons for today\n- Purity and devotion are honoured by God.\n- Miracles point to God, not to the person.\n- Respect for all prophets is part of Muslim faith.",
      "## Wer\nMaryam (Maria) ist die einzige Frau, die im Koran namentlich genannt wird; eine Sure trägt ihren Namen. Ihr Sohn Isa (Jesus) ist ein großer Gesandter, genannt der Messias und ein Wort von Gott.\n\n## Wo im Koran\nAl Imran, an-Nisa, al-Ma'ida und Maryam.\n\n## Die Geschichte in Kürze\nEngel sagten Maryam, Gott habe sie erwählt und gereinigt. Ihr wurde ein Sohn ohne Vater verkündet; der Koran vergleicht seine Erschaffung mit der Adams. Als Neugeborener sprach Isa zur Verteidigung seiner Mutter. Er erhielt das Evangelium (Indschil) und mit Gottes Erlaubnis Wunder wie die Heilung von Blinden und Aussätzigen und die Erweckung von Toten. Muslime glauben, dass er ein menschlicher Prophet und Diener Gottes ist, nicht göttlich. Nach dem Koran wurde er weder getötet noch gekreuzigt, sondern Gott erhob ihn zu sich.\n\n## Lehren für heute\n- Reinheit und Hingabe ehrt Gott.\n- Wunder weisen auf Gott, nicht auf die Person.\n- Achtung vor allen Propheten gehört zum muslimischen Glauben.",
      "## من هما\nمريم هي المرأة الوحيدة المذكورة باسمها في القرآن، ولها سورة باسمها. وابنها عيسى رسول عظيم، يُسمّى المسيح وكلمة من الله.\n\n## موضعهما في القرآن\nآل عمران والنساء والمائدة ومريم.\n\n## القصة باختصار\nأخبرت الملائكة مريم أن الله اصطفاها وطهّرها، وبُشّرت بغلام من غير أب، وشبّه القرآن خلقه بخلق آدم. وتكلم عيسى في المهد دفاعًا عن أمه، وأوتي الإنجيل، وبإذن الله أبرأ الأكمه والأبرص وأحيا الموتى. ويؤمن المسلمون بأنه نبي بشر وعبد لله لا إله. وبحسب القرآن ما قتلوه وما صلبوه، بل رفعه الله إليه.\n\n## دروس لليوم\n- الطهر والعبادة يرفع الله بهما.\n- المعجزات تدل على الله لا على الشخص.\n- الإيمان بجميع الأنبياء من عقيدة المسلم."
    ),
    verses: ["3:42", "3:59", "19:30", "5:110", "4:157"],
    quiz: [
      q(l("To whom does the Quran compare the creation of Isa?", "Mit wessen Erschaffung vergleicht der Koran die Isas?", "بمن شبّه القرآن خلق عيسى؟"),
        [l("Adam", "Adam", "آدم"), l("Yahya", "Yahya", "يحيى"), l("Ibrahim", "Ibrahim", "إبراهيم"), l("Nuh", "Nuh", "نوح")],
        0, l("See 3:59.", "Siehe 3:59.", "انظر 3:59.")),
      q(l("Which scripture was given to Isa?", "Welche Schrift erhielt Isa?", "ما الكتاب الذي أوتيه عيسى؟"),
        [l("Zabur", "Zabur", "الزبور"), l("Tawrah", "Tora", "التوراة"), l("Injil", "Evangelium (Indschil)", "الإنجيل"), l("Suhuf of Ibrahim", "Blätter Ibrahims", "صحف إبراهيم")],
        2, l("See 5:46.", "Siehe 5:46.", "انظر 5:46.")),
      q(l("What is unique about Maryam in the Quran?", "Was ist an Maryam im Koran einzigartig?", "بماذا تفرّدت مريم في القرآن؟"),
        [l("She was a queen", "Sie war Königin", "كانت ملكة"), l("She wrote a book", "Sie schrieb ein Buch", "ألّفت كتابًا"), l("She lived in Makkah", "Sie lebte in Mekka", "سكنت مكة"), l("The only woman mentioned by name", "Die einzige namentlich genannte Frau", "الوحيدة المذكورة باسمها")],
        3, l("A whole surah carries her name.", "Eine ganze Sure trägt ihren Namen.", "وسورة كاملة باسمها.")),
    ],
  },
  {
    id: "p16-muhammad",
    title: l("Muhammad, the seal of the prophets", "Muhammad, das Siegel der Propheten", "محمد خاتم النبيين"),
    body: l(
      "## Who\nMuhammad, son of Abdullah, of the tribe of Quraysh, was born in Makkah around 570 CE. Muslims believe he is the final prophet and messenger.\n\n## Where in the Quran\nHe is named in Al Imran, al-Ahzab, Muhammad and al-Fath, and addressed throughout the Quran.\n\n## In brief\nAt about forty he received the first revelation in the cave of Hira. He called to the oneness of God in Makkah for about thirteen years, facing persecution, then migrated to Madinah in 622, where a community and state took shape. He died in 632 after the Quran had been revealed over some twenty-three years. The Quran describes him as a mercy to the worlds and as a fine example, and as the seal of the prophets, confirming the message of those before him.\n\n## Lessons for today\n- One message runs from Adam to Muhammad: worship God alone and do good.\n- His character is a model for daily life.\n- Learning his life (the Seerah) helps understand the Quran.",
      "## Wer\nMuhammad, Sohn Abdullahs, vom Stamm Quraisch, wurde um 570 n. Chr. in Mekka geboren. Muslime glauben, dass er der letzte Prophet und Gesandte ist.\n\n## Wo im Koran\nNamentlich in Al Imran, al-Ahzab, Muhammad und al-Fath; angesprochen wird er im ganzen Koran.\n\n## In Kürze\nMit etwa vierzig Jahren empfing er die erste Offenbarung in der Höhle Hira. Etwa dreizehn Jahre rief er in Mekka trotz Verfolgung zur Einheit Gottes, dann wanderte er 622 nach Medina aus, wo eine Gemeinschaft und ein Gemeinwesen entstanden. Er starb 632, nachdem der Koran über etwa dreiundzwanzig Jahre offenbart worden war. Der Koran beschreibt ihn als Barmherzigkeit für die Welten, als schönes Vorbild und als Siegel der Propheten, der die Botschaft der früheren bestätigt.\n\n## Lehren für heute\n- Eine Botschaft reicht von Adam bis Muhammad: Gott allein anbeten und Gutes tun.\n- Sein Charakter ist Vorbild für den Alltag.\n- Sein Leben (die Sira) hilft, den Koran zu verstehen.",
      "## من هو\nمحمد بن عبد الله من قريش، وُلد في مكة نحو سنة 570م، ويؤمن المسلمون بأنه خاتم الأنبياء والمرسلين.\n\n## موضعه في القرآن\nذُكر باسمه في آل عمران والأحزاب ومحمد والفتح، وخوطب في القرآن كله.\n\n## باختصار\nنزل عليه الوحي أول مرة في غار حراء وهو في نحو الأربعين. ودعا إلى التوحيد في مكة نحو ثلاث عشرة سنة رغم الأذى، ثم هاجر إلى المدينة سنة 622 حيث نشأ المجتمع والدولة. وتوفي سنة 632 بعد أن نزل القرآن في نحو ثلاث وعشرين سنة. ويصفه القرآن بأنه رحمة للعالمين وأسوة حسنة وخاتم النبيين المصدّق لمن قبله.\n\n## دروس لليوم\n- رسالة واحدة من آدم إلى محمد: عبادة الله وحده وعمل الصالحات.\n- أخلاقه قدوة في الحياة اليومية.\n- معرفة سيرته تعين على فهم القرآن."
    ),
    verses: ["33:40", "21:107", "33:21", "3:144", "96:1"],
    quiz: [
      q(l("Where did the first revelation come?", "Wo kam die erste Offenbarung?", "أين نزل أول الوحي؟"),
        [l("In Madinah", "In Medina", "في المدينة"), l("In the cave of Hira", "In der Höhle Hira", "في غار حراء"), l("At Mount Sinai", "Am Berg Sinai", "عند طور سيناء"), l("In Jerusalem", "In Jerusalem", "في القدس")],
        1, l("The first verses were revealed in the cave of Hira.", "Die ersten Verse kamen in der Höhle Hira.", "نزلت أوائل الآيات في غار حراء.")),
      q(l("Which title in 33:40 marks him as the final prophet?", "Welcher Titel in 33:40 kennzeichnet ihn als letzten Propheten?", "أي وصف في 33:40 يدل على أنه آخر الأنبياء؟"),
        [l("Friend of God", "Freund Gottes", "خليل الله"), l("Spirit of God", "Geist Gottes", "روح الله"), l("Seal of the prophets", "Siegel der Propheten", "خاتم النبيين"), l("Speaker with God", "Der mit Gott sprach", "كليم الله")],
        2, l("See 33:40.", "Siehe 33:40.", "انظر 33:40.")),
      q(l("In which year did the migration to Madinah take place?", "In welchem Jahr fand die Auswanderung nach Medina statt?", "في أي سنة كانت الهجرة إلى المدينة؟"),
        [l("570", "570", "570"), l("610", "610", "610"), l("632", "632", "632"), l("622", "622", "622")],
        3, l("The Hijrah in 622 begins the Islamic calendar.", "Die Hidschra 622 beginnt den islamischen Kalender.", "الهجرة سنة 622 بداية التقويم الهجري.")),
    ],
  },
];

export const PROPHETS: Course = {
  id: "prophets",
  title: l("Stories of the Prophets in the Quran", "Die Prophetengeschichten im Koran", "قصص الأنبياء في القرآن"),
  lead: l(
    "Sixteen lessons from Adam to Muhammad: who they were, where the Quran tells their stories, and what they teach today.",
    "Sechzehn Lektionen von Adam bis Muhammad: wer sie waren, wo der Koran von ihnen erzählt und was sie heute lehren.",
    "ستة عشر درسًا من آدم إلى محمد: من هم، وأين ذكر القرآن قصصهم، وما دروسها اليوم."
  ),
  word: "قصص الأنبياء",
  free: 2,
  lessons,
};
