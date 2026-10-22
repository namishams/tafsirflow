// Wudu trainer (/wudu): the ablution step by step, in the common Sunni form and in the Ja'fari (Shia) form.
// Only what is well established is stated; where the Sunni schools differ on a point, the note says so.
//
// Languages: German, English and Arabic are written out in every text; the eleven other site languages are the fourth
// argument of L(). The Arabic words and their Latin transliteration are never translated; the meaning lines of the other
// languages are literal translations of the English line, and the source references stay as they are.
import type { Extra, Tradition } from "./salah";

export { langOf } from "./salah";
export type { Extra, Lang, Tradition } from "./salah";
export type L3 = { de: string; en: string; ar: string } & Extra;
// meaning of a dua: the Arabic reader sees the Arabic words only, so there is no Arabic line
export type LM = { de: string; en: string } & Extra;
// which drawing the stage shows for a step
export type Scene = "heart" | "vessel" | "hands" | "mouth" | "nose" | "face" | "arm" | "armL" | "head" | "ears" | "feet" | "end";
// translit = Latin transliteration of the Arabic words (not a language of the site)
export type Dua = { ar: string; translit: string; meaning: LM; src?: L3 };
export type WuduStep = {
  id: string;
  scene: Scene;
  title: L3;
  text: L3;
  // fard/sunnah for Sunni, shown as wajib/mustahabb for Ja'fari
  kind: "fard" | "sunnah";
  times?: number;
  sides?: boolean; // right, then left
  note?: L3;
  duas?: Dua[];
  quiz?: boolean; // part of the order quiz
};

const L = (de: string, en: string, ar: string, extra: Extra): L3 => ({ de, en, ar, ...extra });
const M = (de: string, en: string, extra: Extra): LM => ({ de, en, ...extra });
// a source reference (hadith collection and number) is kept exactly as it is in every language
const same = (s: string): Extra => ({ tr: s, ur: s, fa: s, ps: s, fr: s, es: s, id: s, ms: s, bn: s, ru: s, zh: s });

const BISMILLAH: Dua = {
  ar: "بِسْمِ اللَّهِ", translit: "Bismillāh",
  meaning: M("Im Namen Allahs.", "In the name of Allah.", {
    tr: "Allah'ın adıyla.",
    ur: "اللہ کے نام سے۔",
    fa: "به نام الله.",
    ps: "د الله په نوم.",
    fr: "Au nom d'Allah.",
    es: "En el nombre de Allah.",
    id: "Dengan nama Allah.",
    ms: "Dengan nama Allah.",
    bn: "আল্লাহর নামে।",
    ru: "Во имя Аллаха.",
    zh: "奉安拉之名。",
  }),
};
const END_DUAS: Dua[] = [
  {
    ar: "أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    translit: "Ashhadu an lā ilāha illā llāhu waḥdahū lā sharīka lah, wa ashhadu anna Muḥammadan ʿabduhū wa rasūluh.",
    meaning: M(
      "Ich bezeuge, dass es keinen Gott gibt außer Allah allein, ohne Teilhaber, und ich bezeuge, dass Muhammad Sein Diener und Gesandter ist.",
      "I bear witness that there is no god but Allah alone, without partner, and I bear witness that Muhammad is His servant and messenger.",
      {
        tr: "Şahitlik ederim ki Allah'tan başka ilah yoktur, O tektir, ortağı yoktur; ve şahitlik ederim ki Muhammed O'nun kulu ve resulüdür.",
        ur: "میں گواہی دیتا/دیتی ہوں کہ اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اور میں گواہی دیتا/دیتی ہوں کہ محمد اس کے بندے اور رسول ہیں۔",
        fa: "گواهی می‌دهم که معبودی جز الله نیست، یگانه و بی‌شریک، و گواهی می‌دهم که محمد بنده و فرستادهٔ اوست.",
        ps: "زه ګواهي ورکوم چې له الله پرته بل معبود نشته، یوازې، بې شریکه، او ګواهي ورکوم چې محمد د هغه بنده او رسول دی.",
        fr: "J'atteste qu'il n'y a de dieu qu'Allah, Seul, sans associé, et j'atteste que Muhammad est Son serviteur et Son messager.",
        es: "Atestiguo que no hay más dios que Allah, Único, sin asociado, y atestiguo que Muhammad es Su siervo y Su mensajero.",
        id: "Aku bersaksi bahwa tiada tuhan selain Allah semata, tiada sekutu bagi-Nya, dan aku bersaksi bahwa Muhammad adalah hamba dan utusan-Nya.",
        ms: "Aku bersaksi bahawa tiada tuhan selain Allah semata-mata, tiada sekutu bagi-Nya, dan aku bersaksi bahawa Muhammad ialah hamba dan utusan-Nya.",
        bn: "আমি সাক্ষ্য দিচ্ছি যে এক আল্লাহ ছাড়া কোনো ইলাহ নেই, তাঁর কোনো শরিক নেই, এবং আমি সাক্ষ্য দিচ্ছি যে মুহাম্মাদ তাঁর বান্দা ও রাসুল।",
        ru: "Свидетельствую, что нет божества, кроме Аллаха, Единого, у Которого нет сотоварища, и свидетельствую, что Мухаммад – Его раб и посланник.",
        zh: "我作证：除安拉外绝无应受崇拜的，祂是独一的，没有伙伴；我作证：穆罕默德是祂的仆人和使者。",
      },
    ),
    src: L("Sahih Muslim 234", "Sahih Muslim 234", "صحيح مسلم 234", same("Sahih Muslim 234")),
  },
  {
    ar: "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
    translit: "Allāhumma jʿalnī mina t-tawwābīn, wajʿalnī mina l-mutaṭahhirīn.",
    meaning: M(
      "O Allah, lass mich zu denen gehören, die reumütig zu Dir umkehren, und lass mich zu denen gehören, die sich reinigen.",
      "O Allah, make me one of those who turn to You in repentance, and make me one of those who purify themselves.",
      {
        tr: "Allah'ım, beni sana tövbe ederek dönenlerden ve kendilerini arındıranlardan eyle.",
        ur: "اے اللہ، مجھے ان لوگوں میں شامل کر جو توبہ کے ساتھ تیری طرف رجوع کرتے ہیں، اور مجھے پاکیزگی اختیار کرنے والوں میں شامل کر۔",
        fa: "بار الها، مرا از کسانی قرار ده که با توبه به سوی تو بازمی‌گردند، و مرا از کسانی قرار ده که خود را پاک می‌کنند.",
        ps: "ای الله، ما له هغو کسانو وګرځوه چې په توبه ستا لور ته راګرځي، او ما له هغو کسانو وګرځوه چې ځان پاکوي.",
        fr: "Ô Allah, fais de moi l'un de ceux qui reviennent à Toi par le repentir, et fais de moi l'un de ceux qui se purifient.",
        es: "Oh Allah, hazme de aquellos que se vuelven a Ti con arrepentimiento, y hazme de aquellos que se purifican.",
        id: "Ya Allah, jadikanlah aku termasuk orang-orang yang bertobat kepada-Mu, dan jadikanlah aku termasuk orang-orang yang menyucikan diri.",
        ms: "Ya Allah, jadikanlah aku termasuk dalam kalangan orang yang bertaubat kepada-Mu, dan jadikanlah aku termasuk dalam kalangan orang yang menyucikan diri.",
        bn: "হে আল্লাহ, আমাকে তাদের অন্তর্ভুক্ত করুন যারা তাওবা করে আপনার দিকে ফিরে আসে, এবং আমাকে তাদের অন্তর্ভুক্ত করুন যারা নিজেদের পবিত্র করে।",
        ru: "О Аллах, сделай меня одним из тех, кто с покаянием обращается к Тебе, и сделай меня одним из тех, кто очищается.",
        zh: "安拉啊！求你使我成为忏悔归向你的人，求你使我成为洁净自己的人。",
      },
    ),
    src: L("at-Tirmidhi 55", "at-Tirmidhi 55", "سنن الترمذي 55", same("at-Tirmidhi 55")),
  },
];

// notes that repeat
const QURAN_56 = L("Pflicht nach dem Quran (5:6).", "Obligatory by the Quran (5:6).", "فرضٌ بنصّ القرآن (المائدة: 6).", {
  tr: "Kur'an'a göre farz (5:6).",
  ur: "قرآن کی رو سے فرض (5:6)۔",
  fa: "بنا بر قرآن واجب است (5:6).",
  ps: "د قرآن له مخې واجب دی (5:6).",
  fr: "Obligatoire d'après le Coran (5:6).",
  es: "Obligatorio según el Corán (5:6).",
  id: "Wajib menurut Al-Qur'an (5:6).",
  ms: "Wajib menurut Quran (5:6).",
  bn: "কুরআন অনুযায়ী ফরজ (5:6)।",
  ru: "Обязательно согласно Корану (5:6).",
  zh: "依古兰经为主命（5:6）。",
});
const HANBALI_MOUTH = L("Bei den Hanbaliten Pflicht – Mund und Nase gehören dort zum Gesicht.", "Obligatory in the Hanbali school, where mouth and nose count as part of the face.", "وهي واجبةٌ عند الحنابلة، لأنّ الفم والأنف عندهم من الوجه.", {
  tr: "Hanbelî mezhebinde farz – orada ağız ve burun yüzün parçası sayılır.",
  ur: "حنبلی مکتب میں فرض، جہاں منہ اور ناک چہرے کا حصہ شمار ہوتے ہیں۔",
  fa: "در مذهب حنبلی واجب است، زیرا دهان و بینی در آنجا جزو صورت شمرده می‌شوند.",
  ps: "په حنبلي مذهب کې واجب دی، چې هلته خوله او پوزه د مخ برخه ګڼل کېږي.",
  fr: "Obligatoire dans l'école hanbalite, où la bouche et le nez comptent comme faisant partie du visage.",
  es: "Obligatorio en la escuela hanbalí, donde la boca y la nariz cuentan como parte del rostro.",
  id: "Wajib dalam mazhab Hanbali, yang menganggap mulut dan hidung sebagai bagian dari wajah.",
  ms: "Wajib dalam mazhab Hanbali, yang menganggap mulut dan hidung sebagai sebahagian daripada muka.",
  bn: "হাম্বলী মাযহাবে ফরজ, যেখানে মুখ ও নাক মুখমণ্ডলের অংশ বলে গণ্য।",
  ru: "Обязательно у ханбалитов, где рот и нос считаются частью лица.",
  zh: "在罕百里学派中为必须，该学派把口和鼻算作脸的一部分。",
});
const HANBALI_NOSE = L("Bei den Hanbaliten Pflicht – Mund und Nase gehören dort zum Gesicht.", "Obligatory in the Hanbali school, where mouth and nose count as part of the face.", "وهو واجبٌ عند الحنابلة، لأنّ الفم والأنف عندهم من الوجه.", {
  tr: HANBALI_MOUTH.tr, ur: HANBALI_MOUTH.ur, fa: HANBALI_MOUTH.fa, ps: HANBALI_MOUTH.ps, fr: HANBALI_MOUTH.fr, es: HANBALI_MOUTH.es, id: HANBALI_MOUTH.id, ms: HANBALI_MOUTH.ms, bn: HANBALI_MOUTH.bn, ru: HANBALI_MOUTH.ru, zh: HANBALI_MOUTH.zh,
});

const intention = (shia: boolean): WuduStep => ({
  id: "niyyah", scene: "heart", kind: "fard",
  title: L("Die Absicht (Niyya)", "Intention (niyyah)", "النيّة", {
    tr: "Niyet", ur: "نیت", fa: "نیت", ps: "نیت", fr: "Intention (niyya)", es: "Intención (niyya)", id: "Niat", ms: "Niat", bn: "নিয়ত", ru: "Намерение (ният)", zh: "意念（尼亚）",
  }),
  text: shia
    ? L("Fassen Sie im Herzen die Absicht, die Gebetswaschung zu verrichten, um Allah näherzukommen (qurbatan ila llah).",
        "Make the intention in your heart to perform wudu in order to draw closer to Allah (qurbatan ilā llāh).",
        "انوِ بقلبك الوضوءَ قربةً إلى الله تعالى.", {
          tr: "Kalbinizle, Allah'a yaklaşmak için abdest almaya niyet edin (qurbatan ilā llāh).",
          ur: "دل میں اللہ کا قرب حاصل کرنے کے لیے وضو کرنے کی نیت کریں (qurbatan ilā llāh)۔",
          fa: "در دل نیت کنید که برای نزدیک شدن به الله وضو می‌گیرید (qurbatan ilā llāh).",
          ps: "په زړه کې د الله ته د نږدېوالي لپاره د اودس کولو نیت وکړئ (qurbatan ilā llāh).",
          fr: "Formulez dans votre cœur l'intention d'accomplir les ablutions (wudu) afin de vous rapprocher d'Allah (qurbatan ilā llāh).",
          es: "Formule en su corazón la intención de realizar el wudu para acercarse a Allah (qurbatan ilā llāh).",
          id: "Niatkan dalam hati untuk berwudhu demi mendekatkan diri kepada Allah (qurbatan ilā llāh).",
          ms: "Niatkan dalam hati untuk berwudhu demi mendekatkan diri kepada Allah (qurbatan ilā llāh).",
          bn: "অন্তরে আল্লাহর নৈকট্য লাভের জন্য ওযু করার নিয়ত করুন (qurbatan ilā llāh)।",
          ru: "Сделайте в сердце намерение совершить омовение (вуду), чтобы приблизиться к Аллаху (qurbatan ilā llāh).",
          zh: "在心中立意做小净，以求接近安拉（qurbatan ilā llāh）。",
        })
    : L("Fassen Sie im Herzen die Absicht, die Gebetswaschung für Allah zu verrichten. Laut aussprechen müssen Sie sie nicht.",
        "Make the intention in your heart to perform wudu for Allah. You do not need to say it aloud.",
        "انوِ بقلبك أنك تتوضّأ لله تعالى، ولا يلزمك أن تتلفّظ بالنيّة.", {
          tr: "Kalbinizle Allah için abdest almaya niyet edin. Bunu yüksek sesle söylemenize gerek yok.",
          ur: "دل میں اللہ کے لیے وضو کرنے کی نیت کریں۔ اسے زبان سے بلند آواز میں کہنا ضروری نہیں۔",
          fa: "در دل نیت کنید که برای الله وضو می‌گیرید. لازم نیست آن را با صدای بلند بگویید.",
          ps: "په زړه کې د الله لپاره د اودس کولو نیت وکړئ. اړینه نه ده چې په لوړ غږ یې ووایاست.",
          fr: "Formulez dans votre cœur l'intention d'accomplir les ablutions (wudu) pour Allah. Vous n'avez pas besoin de la dire à voix haute.",
          es: "Formule en su corazón la intención de realizar el wudu por Allah. No hace falta decirla en voz alta.",
          id: "Niatkan dalam hati untuk berwudhu karena Allah. Anda tidak perlu mengucapkannya dengan keras.",
          ms: "Niatkan dalam hati untuk berwudhu kerana Allah. Anda tidak perlu menyebutnya dengan kuat.",
          bn: "অন্তরে আল্লাহর জন্য ওযু করার নিয়ত করুন। এটি উচ্চস্বরে বলার প্রয়োজন নেই।",
          ru: "Сделайте в сердце намерение совершить омовение (вуду) ради Аллаха. Произносить его вслух не нужно.",
          zh: "在心中立意为安拉做小净。不需要出声说出来。",
        }),
  note: shia ? undefined : L("Pflicht bei den Schafi'iten, Malikiten und Hanbaliten; bei den Hanafiten Sunna.",
    "Obligatory in the Shafi'i, Maliki and Hanbali schools; sunnah in the Hanafi school.",
    "النيّة فرضٌ عند الشافعية والمالكية والحنابلة، وسنّةٌ عند الحنفية.", {
      tr: "Şâfiî, Mâlikî ve Hanbelî mezheplerinde farz; Hanefî mezhebinde sünnet.",
      ur: "شافعی، مالکی اور حنبلی مکاتب میں فرض؛ حنفی مکتب میں سنت۔",
      fa: "در مذاهب شافعی، مالکی و حنبلی واجب؛ در مذهب حنفی سنت.",
      ps: "په شافعي، مالکي او حنبلي مذهبونو کې واجب؛ په حنفي مذهب کې سنت.",
      fr: "Obligatoire dans les écoles chaféite, malékite et hanbalite ; sunna dans l'école hanafite.",
      es: "Obligatoria en las escuelas shafií, malikí y hanbalí; sunna en la escuela hanafí.",
      id: "Wajib dalam mazhab Syafi'i, Maliki, dan Hanbali; sunnah dalam mazhab Hanafi.",
      ms: "Wajib dalam mazhab Syafie, Maliki dan Hanbali; sunat dalam mazhab Hanafi.",
      bn: "শাফেয়ী, মালেকী ও হাম্বলী মাযহাবে ফরজ; হানাফী মাযহাবে সুন্নাহ।",
      ru: "Обязательно у шафиитов, маликитов и ханбалитов; сунна у ханафитов.",
      zh: "在沙斐仪、马立克、罕百里学派中为主命；在哈乃斐学派中为圣行。",
    }),
});

const bismillah = (shia: boolean): WuduStep => ({
  id: "bismillah", scene: "vessel", kind: "sunnah",
  title: L("Bismillah sprechen", "Say Bismillah", "التسمية", {
    tr: "Bismillah deyin", ur: "بسم اللہ کہیں", fa: "«بسم الله» بگویید", ps: "«بسم الله» ووایاست", fr: "Dites « Bismillah »", es: "Diga «Bismillah»", id: "Ucapkan Bismillah", ms: "Ucapkan Bismillah", bn: "বিসমিল্লাহ বলুন", ru: "Скажите «Бисмиллях»", zh: "说“Bismillah”",
  }),
  text: L("Beginnen Sie mit dem Namen Allahs.", "Begin with the name of Allah.", "ابدأ وضوءك باسم الله.", {
    tr: "Allah'ın adıyla başlayın.",
    ur: "اللہ کے نام سے آغاز کریں۔",
    fa: "با نام الله آغاز کنید.",
    ps: "د الله په نوم پیل وکړئ.",
    fr: "Commencez par le nom d'Allah.",
    es: "Comience con el nombre de Allah.",
    id: "Mulailah dengan nama Allah.",
    ms: "Mulakan dengan nama Allah.",
    bn: "আল্লাহর নামে শুরু করুন।",
    ru: "Начните с имени Аллаха.",
    zh: "以安拉之名开始。",
  }),
  note: shia ? undefined : L("Bei den Hanbaliten Pflicht, wenn man daran denkt.", "In the Hanbali school it is obligatory if you remember it.", "وهي واجبةٌ عند الحنابلة مع التذكّر.", {
    tr: "Hanbelî mezhebinde hatırlıyorsanız farzdır.",
    ur: "حنبلی مکتب میں یاد ہو تو فرض ہے۔",
    fa: "در مذهب حنبلی در صورت یادآوری واجب است.",
    ps: "په حنبلي مذهب کې، که یادېږي، واجب ده.",
    fr: "Dans l'école hanbalite, elle est obligatoire si on s'en souvient.",
    es: "En la escuela hanbalí es obligatoria si la recuerda.",
    id: "Dalam mazhab Hanbali hukumnya wajib jika Anda ingat.",
    ms: "Dalam mazhab Hanbali ia wajib jika anda ingat.",
    bn: "হাম্বলী মাযহাবে মনে থাকলে এটি ফরজ।",
    ru: "У ханбалитов она обязательна, если вы помните о ней.",
    zh: "在罕百里学派中，若记得则为必须。",
  }),
  duas: [BISMILLAH],
});

const ending = (shia: boolean): WuduStep => ({
  id: "dua", scene: "end", kind: "sunnah",
  title: L("Das Bittgebet danach", "The du'a afterwards", "الدعاء بعد الوضوء", {
    tr: "Ardından dua", ur: "اس کے بعد کی دعا", fa: "دعای پس از وضو", ps: "وروسته دعا", fr: "L'invocation (du'a) qui suit", es: "La súplica (du'a) posterior", id: "Doa setelahnya", ms: "Doa selepasnya", bn: "এরপরের দোয়া", ru: "Мольба (дуа) после омовения", zh: "之后的祈祷（du'a）",
  }),
  text: L("Wenn Sie fertig sind, bezeugen Sie die Einheit Allahs und bitten Sie Ihn, Sie zu den Reinen zu zählen.",
    "When you have finished, bear witness to the oneness of Allah and ask Him to count you among those who purify themselves.",
    "إذا فرغت من وضوئك فاشهد لله بالتوحيد، واسأله أن يجعلك من التوّابين والمتطهّرين.", {
      tr: "Bitirdiğinizde Allah'ın birliğine şahitlik edin ve O'ndan sizi kendilerini arındıranlardan saymasını dileyin.",
      ur: "جب آپ فارغ ہوں تو اللہ کی وحدانیت کی گواہی دیں اور اس سے دعا کریں کہ وہ آپ کو پاکیزگی اختیار کرنے والوں میں شامل کرے۔",
      fa: "وقتی کارتان تمام شد، به یگانگی الله گواهی دهید و از او بخواهید که شما را در شمار کسانی قرار دهد که خود را پاک می‌کنند.",
      ps: "کله چې بشپړ کړئ، د الله په یووالي ګواهي ورکړئ او له هغه وغواړئ چې تاسو د هغو کسانو په ډله کې وشمېري چې ځان پاکوي.",
      fr: "Quand vous avez terminé, attestez l'unicité d'Allah et demandez-Lui de vous compter parmi ceux qui se purifient.",
      es: "Cuando haya terminado, atestigüe la unicidad de Allah y pídale que le cuente entre los que se purifican.",
      id: "Setelah selesai, bersaksilah atas keesaan Allah dan mohonlah kepada-Nya agar menjadikan Anda termasuk orang-orang yang menyucikan diri.",
      ms: "Apabila selesai, bersaksilah tentang keesaan Allah dan mohonlah kepada-Nya agar menjadikan anda antara orang yang menyucikan diri.",
      bn: "শেষ করার পর আল্লাহর একত্বের সাক্ষ্য দিন এবং তাঁর কাছে প্রার্থনা করুন যেন তিনি আপনাকে যারা নিজেদের পবিত্র করে তাদের অন্তর্ভুক্ত করেন।",
      ru: "Закончив, засвидетельствуйте единственность Аллаха и попросите Его причислить вас к тем, кто очищается.",
      zh: "做完之后，作证安拉的独一，并求祂把您列入洁净自己的人之中。",
    }),
  note: shia ? L("Auch in der Dscha'fari-Tradition werden während und nach dem Wudu Bittgebete empfohlen – lernen Sie ihre Formen bei einem Lehrer Ihrer Schule.",
    "In the Ja'fari tradition, too, du'as are recommended during and after wudu – learn their wording with a teacher of your school.",
    "ويُستحبّ الدعاء أثناء الوضوء وبعده في المذهب الجعفري أيضًا، فتعلّم صيغه على يد معلّم من مذهبك.", {
      tr: "Caferî geleneğinde de abdest sırasında ve sonrasında dualar tavsiye edilir – bunların metnini kendi mezhebinizden bir hocadan öğrenin.",
      ur: "جعفری روایت میں بھی وضو کے دوران اور بعد میں دعائیں مستحب ہیں – ان کے الفاظ اپنے مکتب کے کسی استاد سے سیکھیں۔",
      fa: "در سنت جعفری نیز در حین وضو و پس از آن دعاها مستحب است – عبارت آنها را نزد معلمی از مذهب خودتان بیاموزید.",
      ps: "په جعفري دود کې هم د اودس پر مهال او وروسته دعاګانې سپارښتل شوې دي – د هغو الفاظ د خپل مذهب له یوه ښوونکي څخه زده کړئ.",
      fr: "Dans la tradition ja'farite aussi, des invocations sont recommandées pendant et après les ablutions (wudu) – apprenez leur formulation auprès d'un enseignant de votre école.",
      es: "También en la tradición yafarí se recomiendan súplicas durante y después del wudu; aprenda su formulación con un maestro de su escuela.",
      id: "Dalam tradisi Ja'fari pun, doa dianjurkan selama dan setelah wudhu – pelajari lafaznya bersama guru dari mazhab Anda.",
      ms: "Dalam tradisi Ja'fari juga, doa digalakkan semasa dan selepas wudhu – pelajari lafaznya daripada guru mazhab anda.",
      bn: "জাফরি ধারায়ও ওযুর সময় ও পরে দোয়া মুস্তাহাব – সেগুলোর শব্দবিন্যাস আপনার মাযহাবের একজন শিক্ষকের কাছ থেকে শিখুন।",
      ru: "В джафаритской традиции тоже рекомендуются дуа во время омовения и после него – изучите их текст у наставника своей школы.",
      zh: "贾法里传统中同样建议在小净期间和之后作祈祷——请向您所属学派的老师学习其措辞。",
    }) : undefined,
  duas: END_DUAS,
});

// titles that both forms share; nose and head differ slightly in the German / Arabic wording, so they are split by form
const TITLE_HANDS = L("Hände waschen", "Wash the hands", "غسل الكفّين", {
  tr: "Elleri yıkayın", ur: "ہاتھ دھوئیں", fa: "کف دست‌ها را بشویید", ps: "لاسونه ووینځئ", fr: "Lavez les mains", es: "Lávese las manos", id: "Basuh kedua tangan", ms: "Basuh kedua-dua tangan", bn: "হাত ধুয়ে নিন", ru: "Вымойте руки", zh: "洗手",
});
const TITLE_MOUTH = L("Mund ausspülen", "Rinse the mouth", "المضمضة", {
  tr: "Ağzı çalkalayın", ur: "کلی کریں", fa: "دهان را آب بگردانید", ps: "خوله ومینځئ", fr: "Rincez la bouche", es: "Enjuáguese la boca", id: "Berkumur", ms: "Berkumur", bn: "কুলি করুন", ru: "Прополощите рот", zh: "漱口",
});
const NOSE_X: Extra = {
  tr: "Burna su verin", ur: "ناک میں پانی ڈالیں", fa: "بینی را آب بدهید", ps: "پوزه ومینځئ", fr: "Rincez le nez", es: "Enjuáguese la nariz", id: "Bilas hidung", ms: "Bilas hidung", bn: "নাকে পানি দিন", ru: "Промойте нос", zh: "清洗鼻腔",
};
const TITLE_NOSE_SUNNI = L("Nase spülen", "Rinse the nose", "الاستنشاق والاستنثار", NOSE_X);
const TITLE_NOSE_SHIA = L("Nase spülen", "Rinse the nose", "الاستنشاق", NOSE_X);
const TITLE_FACE = L("Gesicht waschen", "Wash the face", "غسل الوجه", {
  tr: "Yüzü yıkayın", ur: "چہرہ دھوئیں", fa: "صورت را بشویید", ps: "مخ ووینځئ", fr: "Lavez le visage", es: "Lávese el rostro", id: "Basuh wajah", ms: "Basuh muka", bn: "মুখমণ্ডল ধুয়ে নিন", ru: "Умойте лицо", zh: "洗脸",
});
const HEAD_X: Extra = {
  tr: "Başı meshedin", ur: "سر کا مسح کریں", fa: "بر سر مسح کنید", ps: "پر سر مسح وکړئ", fr: "Passez les mains sur la tête", es: "Pase las manos por la cabeza", id: "Usap kepala", ms: "Sapu kepala", bn: "মাথা মাসেহ করুন", ru: "Протрите голову", zh: "抹头",
};
const TITLE_HEAD_SUNNI = L("Über den Kopf streichen", "Wipe the head", "مسح الرأس", HEAD_X);
const TITLE_HEAD_SHIA = L("Über den Kopf wischen", "Wipe the head", "مسح الرأس", HEAD_X);

const SUNNI: WuduStep[] = [
  intention(false),
  bismillah(false),
  {
    id: "hands", scene: "hands", kind: "sunnah", times: 3, quiz: true,
    title: TITLE_HANDS,
    text: L("Waschen Sie beide Hände bis zu den Handgelenken und lassen Sie das Wasser auch zwischen die Finger laufen.",
      "Wash both hands up to the wrists and let the water run between the fingers too.",
      "اغسل كفّيك إلى الرُّسغين، وخلِّل بين أصابعك.", {
        tr: "İki elinizi bileklere kadar yıkayın ve suyun parmaklarınızın arasından da akmasını sağlayın.",
        ur: "دونوں ہاتھ کلائیوں تک دھوئیں اور پانی کو انگلیوں کے درمیان سے بھی گزاریں۔",
        fa: "هر دو دست را تا مچ بشویید و بگذارید آب از میان انگشتان نیز جاری شود.",
        ps: "دواړه لاسونه تر مړوندونو پورې ووینځئ او اوبه د ګوتو ترمنځ هم تېرې کړئ.",
        fr: "Lavez les deux mains jusqu'aux poignets et laissez aussi l'eau couler entre les doigts.",
        es: "Lávese ambas manos hasta las muñecas y deje que el agua corra también entre los dedos.",
        id: "Basuh kedua tangan hingga pergelangan dan biarkan air mengalir juga di sela-sela jari.",
        ms: "Basuh kedua-dua tangan hingga pergelangan dan biarkan air mengalir juga di celah-celah jari.",
        bn: "দুই হাত কবজি পর্যন্ত ধুয়ে নিন এবং আঙুলের ফাঁকেও পানি বইতে দিন।",
        ru: "Вымойте обе руки до запястий и дайте воде пройти также между пальцами.",
        zh: "把双手洗到手腕，也让水流过手指之间。",
      }),
  },
  {
    id: "mouth", scene: "mouth", kind: "sunnah", times: 3, quiz: true,
    title: TITLE_MOUTH,
    text: L("Nehmen Sie mit der rechten Hand Wasser in den Mund, spülen Sie ihn gut aus und spucken Sie das Wasser wieder aus.",
      "Take water into your mouth with your right hand, rinse it well and spit the water out.",
      "خذ الماء بيدك اليمنى إلى فمك، وأدِره فيه، ثم مُجَّه.", {
        tr: "Sağ elinizle ağzınıza su alın, iyice çalkalayın ve suyu tükürün.",
        ur: "دائیں ہاتھ سے منہ میں پانی لیں، اچھی طرح کلی کریں اور پانی تھوک دیں۔",
        fa: "با دست راست آب به دهان بگیرید، خوب بگردانید و آب را بیرون بریزید.",
        ps: "په ښي لاس خپلې خولې ته اوبه واخلئ، ښه یې وګرځوئ او اوبه وغورځوئ.",
        fr: "Prenez de l'eau dans la bouche avec la main droite, rincez-la bien et crachez l'eau.",
        es: "Tome agua en la boca con la mano derecha, enjuáguela bien y escupa el agua.",
        id: "Ambil air dengan tangan kanan ke dalam mulut, kumur dengan baik, lalu buang airnya.",
        ms: "Ambil air dengan tangan kanan ke dalam mulut, kumur dengan baik, dan buang air itu.",
        bn: "ডান হাতে মুখে পানি নিন, ভালো করে কুলি করুন এবং পানি ফেলে দিন।",
        ru: "Наберите воду в рот правой рукой, хорошо прополощите и выплюньте воду.",
        zh: "用右手把水送入口中，充分漱口，再把水吐出。",
      }),
    note: HANBALI_MOUTH,
  },
  {
    id: "nose", scene: "nose", kind: "sunnah", times: 3, quiz: true,
    title: TITLE_NOSE_SUNNI,
    text: L("Ziehen Sie etwas Wasser in die Nase und schnäuzen Sie es wieder aus.",
      "Draw a little water into your nose and blow it out again.",
      "اجذب الماء بنَفَسك إلى أنفك، ثم انثره.", {
        tr: "Burnunuza biraz su çekin ve tekrar sümkürerek atın.",
        ur: "ناک میں تھوڑا پانی کھینچیں اور پھر صاف کر دیں۔",
        fa: "اندکی آب به بینی بکشید و دوباره بیرون بریزید.",
        ps: "لږ اوبه پوزې ته واخلئ او بیا یې وباسئ.",
        fr: "Aspirez un peu d'eau par le nez et mouchez-vous pour la rejeter.",
        es: "Aspire un poco de agua por la nariz y suénese para expulsarla de nuevo.",
        id: "Hirup sedikit air ke dalam hidung lalu hembuskan keluar lagi.",
        ms: "Sedut sedikit air ke dalam hidung dan hembuskan keluar semula.",
        bn: "নাকে একটু পানি টেনে নিন এবং আবার ঝেড়ে ফেলুন।",
        ru: "Втяните немного воды носом и высморкайте её.",
        zh: "把少量水吸入鼻中，再擤出来。",
      }),
    note: HANBALI_NOSE,
  },
  {
    id: "face", scene: "face", kind: "fard", times: 3, quiz: true,
    title: TITLE_FACE,
    text: L("Waschen Sie das ganze Gesicht – vom Haaransatz bis unter das Kinn und von einem Ohr zum anderen.",
      "Wash the whole face – from the hairline to below the chin and from one ear to the other.",
      "اغسل وجهك كلّه: من منابت شعر الرأس إلى أسفل الذقن، ومن الأذن إلى الأذن.", {
        tr: "Bütün yüzü yıkayın – saç çizgisinden çenenin altına kadar ve bir kulaktan diğerine.",
        ur: "پورا چہرہ دھوئیں – پیشانی کے بالوں کی جڑ سے ٹھوڑی کے نیچے تک اور ایک کان سے دوسرے کان تک۔",
        fa: "تمام صورت را بشویید – از رستنگاه مو تا زیر چانه و از گوش تا گوش.",
        ps: "ټول مخ ووینځئ – د ویښتو له پیل څخه تر زنې لاندې او له یوې غوږې تر بلې.",
        fr: "Lavez tout le visage – de la naissance des cheveux jusque sous le menton et d'une oreille à l'autre.",
        es: "Lávese todo el rostro, desde el nacimiento del cabello hasta debajo de la barbilla y de una oreja a la otra.",
        id: "Basuh seluruh wajah – dari batas tumbuhnya rambut hingga bawah dagu dan dari telinga ke telinga.",
        ms: "Basuh seluruh muka – dari garis rambut hingga bawah dagu dan dari telinga ke telinga.",
        bn: "পুরো মুখমণ্ডল ধুয়ে নিন – চুলের গোড়া থেকে থুতনির নিচ পর্যন্ত এবং এক কান থেকে অন্য কান পর্যন্ত।",
        ru: "Умойте всё лицо – от линии роста волос до низа подбородка и от одного уха до другого.",
        zh: "洗整个脸——从发际到下巴以下，从一只耳朵到另一只耳朵。",
      }),
    note: QURAN_56,
  },
  {
    id: "arms", scene: "arm", kind: "fard", times: 3, sides: true, quiz: true,
    title: L("Arme waschen", "Wash the arms", "غسل اليدين إلى المرفقين", {
      tr: "Kolları yıkayın", ur: "بازو دھوئیں", fa: "دست‌ها را تا آرنج بشویید", ps: "لاسونه تر څنګلو ووینځئ", fr: "Lavez les bras", es: "Lávese los brazos", id: "Basuh kedua lengan", ms: "Basuh kedua-dua lengan", bn: "বাহু ধুয়ে নিন", ru: "Вымойте руки до локтей", zh: "洗手臂",
    }),
    text: L("Waschen Sie den rechten Arm von den Fingerspitzen bis einschließlich des Ellenbogens, danach den linken.",
      "Wash the right arm from the fingertips up to and including the elbow, then the left.",
      "اغسل يدك اليمنى من أطراف الأصابع إلى المرفق مع المرفق، ثم اليسرى كذلك.", {
        tr: "Sağ kolu parmak uçlarından dirsek dahil olacak şekilde yıkayın, sonra solu.",
        ur: "دایاں بازو انگلیوں کے سروں سے کہنی سمیت دھوئیں، پھر بایاں۔",
        fa: "دست راست را از سر انگشتان تا آرنج، همراه با آرنج، بشویید، سپس چپ را.",
        ps: "ښی لاس د ګوتو له څوکو تر څنګلې پورې، د څنګلې په ګډون، ووینځئ، بیا کیڼ.",
        fr: "Lavez le bras droit des bouts des doigts jusqu'au coude inclus, puis le gauche.",
        es: "Lávese el brazo derecho desde las yemas de los dedos hasta el codo inclusive, y luego el izquierdo.",
        id: "Basuh lengan kanan dari ujung jari hingga siku termasuk sikunya, lalu lengan kiri.",
        ms: "Basuh lengan kanan dari hujung jari hingga siku termasuk siku, kemudian lengan kiri.",
        bn: "ডান হাত আঙুলের ডগা থেকে কনুইসহ ধুয়ে নিন, তারপর বাম হাত।",
        ru: "Вымойте правую руку от кончиков пальцев до локтя включительно, затем левую.",
        zh: "把右臂从指尖洗到肘部，并包括肘部，然后洗左臂。",
      }),
    note: QURAN_56,
  },
  {
    id: "head", scene: "head", kind: "fard", times: 1, quiz: true,
    title: TITLE_HEAD_SUNNI,
    text: L("Streichen Sie mit nassen Händen einmal über den Kopf – von der Stirn bis zum Nacken und wieder zurück.",
      "Wipe over your head once with wet hands – from the forehead to the nape of the neck and back again.",
      "امسح رأسك مرّةً واحدةً بيديك المبلولتين: من مقدَّم الرأس إلى القفا، ثم ارجع بهما إلى حيث بدأت.", {
        tr: "Islak ellerinizle başınızın üzerini bir kez silin – alından enseye kadar ve tekrar geri.",
        ur: "گیلے ہاتھوں سے سر پر ایک بار مسح کریں – پیشانی سے گدی تک اور پھر واپس۔",
        fa: "یک بار با دست‌های تر بر سر مسح کنید – از پیشانی تا پشت سر و دوباره برگردید.",
        ps: "یو ځل په لندو لاسونو پر سر مسح وکړئ – له تندي څخه تر شا پورې او بیرته.",
        fr: "Passez une fois les mains mouillées sur la tête – du front jusqu'à la nuque, puis en sens inverse.",
        es: "Pase una vez las manos mojadas por la cabeza: desde la frente hasta la nuca y de vuelta.",
        id: "Usap kepala satu kali dengan tangan yang basah – dari dahi hingga tengkuk lalu kembali lagi.",
        ms: "Sapu kepala sekali dengan tangan yang basah – dari dahi hingga tengkuk dan kembali semula.",
        bn: "ভেজা হাত দিয়ে একবার মাথা মাসেহ করুন – কপাল থেকে ঘাড়ের পেছন পর্যন্ত এবং আবার ফিরিয়ে আনুন।",
        ru: "Один раз проведите мокрыми руками по голове – ото лба до затылка и обратно.",
        zh: "用湿手抹头一次——从前额抹到后颈，再抹回来。",
      }),
    note: L("Wie viel vom Kopf Pflicht ist, sehen die Rechtsschulen unterschiedlich.", "How much of the head must be wiped differs between the schools.", "وتختلف المذاهب في القدر الواجب مسحه من الرأس.", {
      tr: "Başın ne kadarının meshedilmesi gerektiği mezhepler arasında farklıdır.",
      ur: "سر کا کتنا حصہ مسح کرنا ضروری ہے، اس میں مکاتب کا اختلاف ہے۔",
      fa: "اینکه چه مقدار از سر باید مسح شود، میان مذاهب متفاوت است.",
      ps: "د سر څومره برخې ته باید مسح وشي، په مذهبونو کې توپیر لري.",
      fr: "La part de la tête qu'il faut essuyer diffère selon les écoles.",
      es: "La parte de la cabeza que hay que pasar con las manos difiere entre las escuelas.",
      id: "Seberapa banyak bagian kepala yang harus diusap berbeda-beda antarmazhab.",
      ms: "Seberapa banyak bahagian kepala yang perlu disapu berbeza antara mazhab.",
      bn: "মাথার কতটুকু অংশ মাসেহ করতে হবে তা মাযহাবভেদে ভিন্ন।",
      ru: "Сколько именно от головы нужно протереть, школы определяют по-разному.",
      zh: "头部须抹多少，各学派的规定不同。",
    }),
  },
  {
    id: "ears", scene: "ears", kind: "sunnah", times: 1, quiz: true,
    title: L("Ohren abwischen", "Wipe the ears", "مسح الأذنين", {
      tr: "Kulakları meshedin", ur: "کانوں کا مسح کریں", fa: "بر گوش‌ها مسح کنید", ps: "پر غوږونو مسح وکړئ", fr: "Essuyez les oreilles", es: "Pase las manos por las orejas", id: "Usap kedua telinga", ms: "Sapu kedua-dua telinga", bn: "কান মাসেহ করুন", ru: "Протрите уши", zh: "抹耳",
    }),
    text: L("Wischen Sie mit den Zeigefingern das Innere der Ohren und mit den Daumen ihre Rückseite.",
      "Wipe the inside of the ears with your index fingers and the back of them with your thumbs.",
      "امسح باطن أذنيك بالسبّابتين، وظاهرهما بالإبهامين.", {
        tr: "Kulaklarınızın içini işaret parmaklarınızla, arkasını başparmaklarınızla silin.",
        ur: "کانوں کے اندر کا حصہ شہادت کی انگلیوں سے اور ان کی پشت انگوٹھوں سے صاف کریں۔",
        fa: "درون گوش‌ها را با انگشتان اشاره و پشت آنها را با شست‌ها مسح کنید.",
        ps: "د غوږونو دننه په شهادت ګوتو او شا یې په غټو ګوتو مسح کړئ.",
        fr: "Essuyez l'intérieur des oreilles avec les index et l'arrière avec les pouces.",
        es: "Pase los dedos índices por el interior de las orejas y los pulgares por la parte de atrás.",
        id: "Usap bagian dalam telinga dengan jari telunjuk dan bagian belakangnya dengan ibu jari.",
        ms: "Sapu bahagian dalam telinga dengan jari telunjuk dan bahagian belakangnya dengan ibu jari.",
        bn: "তর্জনী দিয়ে কানের ভেতরের দিক এবং বুড়ো আঙুল দিয়ে পেছনের দিক মাসেহ করুন।",
        ru: "Протрите внутреннюю часть ушей указательными пальцами, а заднюю – большими.",
        zh: "用食指抹耳内侧，用拇指抹耳背。",
      }),
  },
  {
    id: "feet", scene: "feet", kind: "fard", times: 3, sides: true, quiz: true,
    title: L("Füße waschen", "Wash the feet", "غسل الرجلين إلى الكعبين", {
      tr: "Ayakları yıkayın", ur: "پاؤں دھوئیں", fa: "پاها را بشویید", ps: "پښې ووینځئ", fr: "Lavez les pieds", es: "Lávese los pies", id: "Basuh kedua kaki", ms: "Basuh kedua-dua kaki", bn: "পা ধুয়ে নিন", ru: "Вымойте ноги", zh: "洗脚",
    }),
    text: L("Waschen Sie den rechten Fuß bis einschließlich des Knöchels, danach den linken. Vergessen Sie die Zwischenräume der Zehen nicht.",
      "Wash the right foot up to and including the ankle, then the left. Don't forget the spaces between the toes.",
      "اغسل رجلك اليمنى إلى الكعبين مع الكعبين، ثم اليسرى، وخلِّل بين أصابع رجليك.", {
        tr: "Sağ ayağı ayak bileği dahil olacak şekilde yıkayın, sonra solu. Ayak parmaklarının arasını unutmayın.",
        ur: "دایاں پاؤں ٹخنے سمیت دھوئیں، پھر بایاں۔ پاؤں کی انگلیوں کے درمیان کی جگہیں نہ بھولیں۔",
        fa: "پای راست را تا مچ، همراه با مچ، بشویید، سپس چپ را. فاصلهٔ میان انگشتان پا را فراموش نکنید.",
        ps: "ښی پښه تر ټخنې پورې، د ټخنې په ګډون، ووینځئ، بیا کیڼه. د پښو د ګوتو ترمنځ ځایونه مه هېروئ.",
        fr: "Lavez le pied droit jusqu'à la cheville incluse, puis le gauche. N'oubliez pas les espaces entre les orteils.",
        es: "Lávese el pie derecho hasta el tobillo inclusive, y luego el izquierdo. No olvide los espacios entre los dedos de los pies.",
        id: "Basuh kaki kanan hingga mata kaki termasuk mata kakinya, lalu kaki kiri. Jangan lupakan sela-sela jari kaki.",
        ms: "Basuh kaki kanan hingga buku lali termasuk buku lali, kemudian kaki kiri. Jangan lupa celah-celah jari kaki.",
        bn: "ডান পা টাখনুসহ ধুয়ে নিন, তারপর বাম পা। পায়ের আঙুলের ফাঁকের কথা ভুলবেন না।",
        ru: "Вымойте правую ногу до щиколотки включительно, затем левую. Не забудьте про промежутки между пальцами ног.",
        zh: "把右脚洗到脚踝，并包括脚踝，然后洗左脚。别忘了脚趾之间的缝隙。",
      }),
    note: QURAN_56,
  },
  ending(false),
];

const ONCE = L("Einmal ist Pflicht, ein zweites Mal ist erlaubt, ein drittes Mal nicht.", "Once is obligatory, a second time is permissible, a third time is not.", "الغسلة الأولى واجبة، والثانية جائزة، والثالثة غير مشروعة.", {
  tr: "Bir kez zorunludur, ikinci kez caizdir, üçüncü kez caiz değildir.",
  ur: "ایک بار لازم ہے، دوسری بار جائز ہے، تیسری بار جائز نہیں۔",
  fa: "یک بار واجب است، بار دوم روا است و بار سوم روا نیست.",
  ps: "یو ځل واجب دی، دویم ځل جایز دی، درېیم ځل جایز نه دی.",
  fr: "Une fois est obligatoire, une deuxième fois est permise, une troisième fois ne l'est pas.",
  es: "Una vez es obligatorio, una segunda vez es permitido, una tercera no lo es.",
  id: "Satu kali wajib, kali kedua boleh, kali ketiga tidak boleh.",
  ms: "Sekali wajib, kali kedua dibolehkan, kali ketiga tidak dibolehkan.",
  bn: "একবার আবশ্যিক, দ্বিতীয়বার জায়েজ, তৃতীয়বার জায়েজ নয়।",
  ru: "Один раз обязательно, второй раз допустим, третий – нет.",
  zh: "一次是必须的，第二次是允许的，第三次则不允许。",
});

const SHIA: WuduStep[] = [
  intention(true),
  bismillah(true),
  {
    id: "hands", scene: "hands", kind: "sunnah", quiz: true,
    title: TITLE_HANDS,
    text: L("Waschen Sie zu Beginn beide Hände bis zu den Handgelenken.", "To begin, wash both hands up to the wrists.", "اغسل كفّيك إلى الزندين قبل أن تبدأ.", {
      tr: "Başlarken iki elinizi bileklere kadar yıkayın.",
      ur: "شروع میں دونوں ہاتھ کلائیوں تک دھوئیں۔",
      fa: "در آغاز هر دو دست را تا مچ بشویید.",
      ps: "په پیل کې دواړه لاسونه تر مړوندونو پورې ووینځئ.",
      fr: "Pour commencer, lavez les deux mains jusqu'aux poignets.",
      es: "Para empezar, lávese ambas manos hasta las muñecas.",
      id: "Untuk memulai, basuh kedua tangan hingga pergelangan.",
      ms: "Untuk bermula, basuh kedua-dua tangan hingga pergelangan.",
      bn: "শুরুতে দুই হাত কবজি পর্যন্ত ধুয়ে নিন।",
      ru: "Для начала вымойте обе руки до запястий.",
      zh: "开始时，把双手洗到手腕。",
    }),
  },
  {
    id: "mouth", scene: "mouth", kind: "sunnah", quiz: true,
    title: TITLE_MOUTH,
    text: L("Spülen Sie den Mund mit Wasser aus.", "Rinse your mouth with water.", "أدِر الماء في فمك ثم مُجَّه.", {
      tr: "Ağzınızı su ile çalkalayın.",
      ur: "منہ میں پانی لے کر کلی کریں۔",
      fa: "دهانتان را با آب بشویید.",
      ps: "خپله خوله په اوبو ومینځئ.",
      fr: "Rincez-vous la bouche avec de l'eau.",
      es: "Enjuáguese la boca con agua.",
      id: "Berkumurlah dengan air.",
      ms: "Berkumurlah dengan air.",
      bn: "পানি দিয়ে কুলি করুন।",
      ru: "Прополощите рот водой.",
      zh: "用水漱口。",
    }),
  },
  {
    id: "nose", scene: "nose", kind: "sunnah", quiz: true,
    title: TITLE_NOSE_SHIA,
    text: L("Ziehen Sie etwas Wasser in die Nase und lassen Sie es wieder heraus.", "Draw a little water into your nose and let it out again.", "اجذب الماء إلى أنفك ثم أخرجه.", {
      tr: "Burnunuza biraz su çekin ve tekrar dışarı bırakın.",
      ur: "ناک میں تھوڑا پانی کھینچیں اور پھر نکال دیں۔",
      fa: "اندکی آب به بینی بکشید و دوباره بیرون بدهید.",
      ps: "لږ اوبه پوزې ته واخلئ او بیا یې وباسئ.",
      fr: "Aspirez un peu d'eau par le nez et laissez-la ressortir.",
      es: "Aspire un poco de agua por la nariz y déjela salir de nuevo.",
      id: "Hirup sedikit air ke dalam hidung lalu keluarkan lagi.",
      ms: "Sedut sedikit air ke dalam hidung dan keluarkan semula.",
      bn: "নাকে একটু পানি টেনে নিন এবং আবার বের করে দিন।",
      ru: "Втяните немного воды носом и выпустите её обратно.",
      zh: "把少量水吸入鼻中，再让它流出来。",
    }),
  },
  {
    id: "face", scene: "face", kind: "fard", times: 1, quiz: true,
    title: TITLE_FACE,
    text: L("Waschen Sie das Gesicht von oben nach unten: vom Haaransatz bis zum Kinn, so breit, wie Mittelfinger und Daumen es umspannen.",
      "Wash the face from top to bottom: from the hairline to the chin, as wide as the span between your middle finger and thumb.",
      "اغسل وجهك من الأعلى إلى الأسفل: من قُصاص شعر الرأس إلى الذقن طولًا، وما دارت عليه الإصبع الوسطى والإبهام عرضًا.", {
        tr: "Yüzü yukarıdan aşağıya yıkayın: saç çizgisinden çeneye kadar, genişlik olarak orta parmak ile başparmağın arasındaki açıklık kadar.",
        ur: "چہرہ اوپر سے نیچے دھوئیں: پیشانی کے بالوں کی جڑ سے ٹھوڑی تک، چوڑائی میں اتنا جتنا درمیانی انگلی اور انگوٹھے کے درمیان کا فاصلہ ہے۔",
        fa: "صورت را از بالا به پایین بشویید: از رستنگاه مو تا چانه، به پهنایی که میان انگشت میانی و شست قرار می‌گیرد.",
        ps: "مخ له پورته څخه ښکته ووینځئ: د ویښتو له پیل څخه تر زنې پورې، په پلنوالي کې د منځنۍ ګوتې او غټې ګوتې ترمنځ د واټن په اندازه.",
        fr: "Lavez le visage de haut en bas : de la naissance des cheveux jusqu'au menton, sur une largeur égale à l'écart entre le majeur et le pouce.",
        es: "Lávese el rostro de arriba abajo: desde el nacimiento del cabello hasta la barbilla, con un ancho igual a la distancia entre el dedo medio y el pulgar.",
        id: "Basuh wajah dari atas ke bawah: dari batas tumbuhnya rambut hingga dagu, selebar jarak antara jari tengah dan ibu jari.",
        ms: "Basuh muka dari atas ke bawah: dari garis rambut hingga dagu, selebar jarak antara jari hantu dan ibu jari.",
        bn: "মুখমণ্ডল উপর থেকে নিচে ধুয়ে নিন: চুলের গোড়া থেকে থুতনি পর্যন্ত, প্রস্থে মধ্যমা ও বুড়ো আঙুলের মাঝের ব্যবধান যতটুকু।",
        ru: "Умойте лицо сверху вниз: от линии роста волос до подбородка, в ширину – на расстояние между средним и большим пальцами.",
        zh: "自上而下洗脸：从发际到下巴，宽度为中指与拇指之间张开的距离。",
      }),
    note: ONCE,
  },
  {
    id: "armR", scene: "arm", kind: "fard", times: 1, quiz: true,
    title: L("Rechten Arm waschen", "Wash the right arm", "غسل اليد اليمنى", {
      tr: "Sağ kolu yıkayın", ur: "دایاں بازو دھوئیں", fa: "دست راست را بشویید", ps: "ښی لاس ووینځئ", fr: "Lavez le bras droit", es: "Lávese el brazo derecho", id: "Basuh lengan kanan", ms: "Basuh lengan kanan", bn: "ডান বাহু ধুয়ে নিন", ru: "Вымойте правую руку", zh: "洗右臂",
    }),
    text: L("Waschen Sie den rechten Arm vom Ellenbogen abwärts bis zu den Fingerspitzen – nicht umgekehrt.",
      "Wash the right arm from the elbow down to the fingertips – not the other way round.",
      "اغسل يدك اليمنى من المرفق إلى أطراف الأصابع، لا بالعكس.", {
        tr: "Sağ kolu dirsekten parmak uçlarına doğru aşağı yıkayın – tersine değil.",
        ur: "دایاں بازو کہنی سے انگلیوں کے سروں تک نیچے کی طرف دھوئیں – اس کے برعکس نہیں۔",
        fa: "دست راست را از آرنج به سمت پایین تا سر انگشتان بشویید – نه برعکس.",
        ps: "ښی لاس له څنګلې څخه ښکته تر ګوتو څوکو پورې ووینځئ – نه برعکس.",
        fr: "Lavez le bras droit du coude vers le bas jusqu'au bout des doigts – et non l'inverse.",
        es: "Lávese el brazo derecho desde el codo hacia abajo hasta las yemas de los dedos, no al revés.",
        id: "Basuh lengan kanan dari siku ke bawah hingga ujung jari – bukan sebaliknya.",
        ms: "Basuh lengan kanan dari siku ke bawah hingga hujung jari – bukan sebaliknya.",
        bn: "ডান হাত কনুই থেকে নিচের দিকে আঙুলের ডগা পর্যন্ত ধুয়ে নিন – উল্টো দিকে নয়।",
        ru: "Вымойте правую руку от локтя вниз до кончиков пальцев – не наоборот.",
        zh: "把右臂从肘部向下洗到指尖——不要反过来。",
      }),
    note: ONCE,
  },
  {
    id: "armL", scene: "armL", kind: "fard", times: 1, quiz: true,
    title: L("Linken Arm waschen", "Wash the left arm", "غسل اليد اليسرى", {
      tr: "Sol kolu yıkayın", ur: "بایاں بازو دھوئیں", fa: "دست چپ را بشویید", ps: "کیڼ لاس ووینځئ", fr: "Lavez le bras gauche", es: "Lávese el brazo izquierdo", id: "Basuh lengan kiri", ms: "Basuh lengan kiri", bn: "বাম বাহু ধুয়ে নিন", ru: "Вымойте левую руку", zh: "洗左臂",
    }),
    text: L("Waschen Sie danach den linken Arm genauso – vom Ellenbogen bis zu den Fingerspitzen.",
      "Then wash the left arm in the same way – from the elbow down to the fingertips.",
      "ثم اغسل يدك اليسرى كذلك، من المرفق إلى أطراف الأصابع.", {
        tr: "Sonra sol kolu aynı şekilde yıkayın – dirsekten parmak uçlarına doğru aşağı.",
        ur: "پھر بایاں بازو اسی طرح دھوئیں – کہنی سے انگلیوں کے سروں تک نیچے کی طرف۔",
        fa: "سپس دست چپ را به همان شیوه بشویید – از آرنج به سمت پایین تا سر انگشتان.",
        ps: "بیا کیڼ لاس په همدې ډول ووینځئ – له څنګلې څخه ښکته تر ګوتو څوکو پورې.",
        fr: "Lavez ensuite le bras gauche de la même manière – du coude vers le bas jusqu'au bout des doigts.",
        es: "Luego lávese el brazo izquierdo del mismo modo: desde el codo hacia abajo hasta las yemas de los dedos.",
        id: "Lalu basuh lengan kiri dengan cara yang sama – dari siku ke bawah hingga ujung jari.",
        ms: "Kemudian basuh lengan kiri dengan cara yang sama – dari siku ke bawah hingga hujung jari.",
        bn: "তারপর বাম হাতও একইভাবে ধুয়ে নিন – কনুই থেকে নিচের দিকে আঙুলের ডগা পর্যন্ত।",
        ru: "Затем так же вымойте левую руку – от локтя вниз до кончиков пальцев.",
        zh: "然后用同样的方式洗左臂——从肘部向下洗到指尖。",
      }),
    note: ONCE,
  },
  {
    id: "head", scene: "head", kind: "fard", times: 1, quiz: true,
    title: TITLE_HEAD_SHIA,
    text: L("Wischen Sie mit der Feuchtigkeit, die noch an der rechten Hand ist, über den vorderen Teil des Kopfes – ohne neues Wasser zu nehmen.",
      "With the wetness still left on your right hand, wipe the front part of your head – without taking new water.",
      "امسح مقدَّم رأسك ببلّة الوضوء الباقية في يدك اليمنى، من غير أن تأخذ ماءً جديدًا.", {
        tr: "Sağ elinizde kalan nemle başınızın ön kısmını meshedin – yeni su almadan.",
        ur: "دائیں ہاتھ میں باقی رہ جانے والی نمی سے سر کے اگلے حصے کا مسح کریں – نیا پانی لیے بغیر۔",
        fa: "با رطوبتی که هنوز بر دست راستتان مانده، جلوی سر را مسح کنید – بدون برداشتن آب تازه.",
        ps: "په هغه لندوالي چې لا هم پر ښي لاس پاتې دی، د سر مخکینۍ برخې ته مسح وکړئ – پرته له دې چې نوې اوبه واخلئ.",
        fr: "Avec l'humidité qui reste sur votre main droite, essuyez la partie avant de la tête – sans reprendre d'eau.",
        es: "Con la humedad que aún queda en su mano derecha, pase la mano por la parte delantera de la cabeza, sin tomar agua nueva.",
        id: "Dengan sisa basah yang masih ada di tangan kanan, usap bagian depan kepala – tanpa mengambil air baru.",
        ms: "Dengan sisa basah yang masih ada pada tangan kanan, sapu bahagian hadapan kepala – tanpa mengambil air baharu.",
        bn: "ডান হাতে যে ভেজা ভাব এখনও আছে তা দিয়ে মাথার সামনের অংশ মাসেহ করুন – নতুন পানি না নিয়ে।",
        ru: "Оставшейся на правой руке влагой протрите переднюю часть головы – не набирая новой воды.",
        zh: "用右手上仍残留的湿润抹头的前部——不要取新水。",
      }),
  },
  {
    id: "feet", scene: "feet", kind: "fard", times: 1, sides: true, quiz: true,
    title: L("Über die Füße wischen", "Wipe the feet", "مسح القدمين", {
      tr: "Ayakları meshedin", ur: "پاؤں کا مسح کریں", fa: "بر پاها مسح کنید", ps: "پر پښو مسح وکړئ", fr: "Essuyez les pieds", es: "Pase las manos por los pies", id: "Usap kedua kaki", ms: "Sapu kedua-dua kaki", bn: "পা মাসেহ করুন", ru: "Протрите ноги", zh: "抹脚",
    }),
    text: L("Wischen Sie mit der verbliebenen Feuchtigkeit über den Fußrücken – von den Zehenspitzen bis zum Knöchel, der Erhebung oben am Fuß. Zuerst den rechten Fuß, dann den linken.",
      "With the remaining wetness, wipe the top of the foot – from the tips of the toes to the ankle, the raised part on top of the foot. First the right foot, then the left.",
      "امسح ظاهر قدمك ببلّة الوضوء الباقية، من أطراف الأصابع إلى الكعب، وهو قُبّة القدم: اليمنى ثم اليسرى.", {
        tr: "Kalan nemle ayağın üst kısmını silin – ayak parmaklarının uçlarından ayak bileğine kadar, yani ayağın üstündeki yüksek kısma kadar. Önce sağ ayak, sonra sol.",
        ur: "باقی ماندہ نمی سے پاؤں کے اوپری حصے کا مسح کریں – انگلیوں کے سروں سے ٹخنے تک، یعنی پاؤں کے اوپر کے ابھرے ہوئے حصے تک۔ پہلے دایاں پاؤں، پھر بایاں۔",
        fa: "با رطوبت باقی‌مانده، روی پا را مسح کنید – از سر انگشتان پا تا مچ، یعنی برآمدگی بالای پا. نخست پای راست، سپس پای چپ.",
        ps: "په پاتې لندوالي د پښې پورتنۍ برخې ته مسح وکړئ – د ګوتو له څوکو تر ټخنې پورې، یعنې د پښې پر سر د پورته شوې برخې پورې. لومړی ښې پښې ته، بیا کیڼې ته.",
        fr: "Avec l'humidité restante, essuyez le dessus du pied – du bout des orteils jusqu'à la cheville, la partie surélevée sur le dessus du pied. D'abord le pied droit, puis le gauche.",
        es: "Con la humedad restante, pase la mano por la parte superior del pie, desde la punta de los dedos hasta el tobillo, la parte elevada sobre el empeine. Primero el pie derecho y después el izquierdo.",
        id: "Dengan sisa basah, usap punggung kaki – dari ujung jari kaki hingga mata kaki, yaitu bagian yang menonjol di atas kaki. Pertama kaki kanan, lalu kaki kiri.",
        ms: "Dengan sisa basah, sapu bahagian atas kaki – dari hujung jari kaki hingga buku lali, iaitu bahagian yang timbul di atas kaki. Mula-mula kaki kanan, kemudian kaki kiri.",
        bn: "অবশিষ্ট ভেজা ভাব দিয়ে পায়ের পাতার উপরের অংশ মাসেহ করুন – পায়ের আঙুলের ডগা থেকে টাখনু পর্যন্ত, অর্থাৎ পায়ের উপরের উঁচু অংশ পর্যন্ত। প্রথমে ডান পা, তারপর বাম পা।",
        ru: "Оставшейся влагой протрите верхнюю часть стопы – от кончиков пальцев ног до щиколотки, возвышения на верхней части стопы. Сначала правая нога, затем левая.",
        zh: "用剩余的湿润抹脚背——从脚趾尖抹到脚踝，即脚背上隆起的部分。先右脚，后左脚。",
      }),
    // checked 22.10.2026: al-Sistani, Islamic Laws ruling 258 (https://www.sistani.org/english/book/48/2153/) – up to the
    // joint; stopping at the raised part is not enough as an obligatory precaution (IMAM-US answers); other maraji'
    // accept the raised part. needs_review: true
    note: L("Nach Ayatollah al-Sistani wischt man bis zum Gelenk zwischen Fuß und Unterschenkel; nur bis zur Erhebung des Fußrückens reicht nach ihm als Pflichtvorsicht nicht. Andere Maradschiʿ lassen die Erhebung genügen. Folgen Sie Ihrem Mardschaʿ.",
      "According to Ayatollah al-Sistani you wipe up to the joint between foot and shin; stopping at the raised part of the foot is not enough for him as an obligatory precaution. Other maraji' accept the raised part. Please follow your marja'.",
      "عند السيد السيستاني يكون المسح إلى المفصل بين القدم والساق، ولا يكفي الاقتصار على قبّة القدم على الأحوط وجوبًا. ويكتفي بعض المراجع بالقبّة. اتّبعوا مرجعكم.", {
        tr: "Ayetullah Sistani'ye göre ayak ile baldır arasındaki eklem yerine kadar meshedilir; ona göre sadece ayağın üstündeki yüksekliğe kadar meshetmek vacip ihtiyat gereği yeterli değildir. Diğer mercilere göre yükseklik yeterlidir. Kendi merciinize uyun.",
        ur: "آیت اللہ سیستانی کے نزدیک پاؤں اور پنڈلی کے جوڑ تک مسح کیا جائے؛ صرف پاؤں کے ابھار تک مسح ان کے نزدیک احتیاطِ واجب کی بنا پر کافی نہیں۔ بعض دوسرے مراجع ابھار تک کافی سمجھتے ہیں۔ اپنے مرجع کی پیروی کریں۔",
        fa: "به نظر آیت‌الله سیستانی مسح تا مفصل میان پا و ساق است و بنا بر احتیاط واجب، تنها تا برآمدگی روی پا کافی نیست. برخی مراجع دیگر برآمدگی را کافی می‌دانند. از مرجع خود پیروی کنید.",
        ps: "د آیت الله سیستاني په نظر مسح د پښې او پنډۍ تر بند پورې کېږي؛ یوازې د پښې تر پورته شوې برخې پورې د واجب احتیاط له مخې بس نه دی. ځینې نور مراجع پورته برخه بس ګڼي. د خپل مرجع پیروي وکړئ.",
        fr: "Selon l'ayatollah al-Sistani, on essuie jusqu'à l'articulation entre le pied et la jambe ; s'arrêter à la partie surélevée du pied ne suffit pas pour lui, par précaution obligatoire. D'autres marja' acceptent la partie surélevée. Suivez votre marja'.",
        es: "Según el ayatolá al-Sistani se pasa la mano hasta la articulación entre el pie y la pierna; detenerse en la parte elevada del empeine no basta para él, por precaución obligatoria. Otros maraji' aceptan la parte elevada. Siga a su marja'.",
        id: "Menurut Ayatullah al-Sistani, usapan sampai sendi antara kaki dan tulang kering; berhenti di bagian kaki yang menonjol tidak cukup menurut beliau sebagai kehati-hatian wajib. Marja' lain menerima bagian yang menonjol. Ikutilah marja' Anda.",
        ms: "Menurut Ayatullah al-Sistani, sapuan hingga sendi antara kaki dan betis; berhenti di bahagian kaki yang timbul tidak memadai menurut beliau sebagai langkah berhati-hati wajib. Marja' lain menerima bahagian yang timbul. Ikutlah marja' anda.",
        bn: "আয়াতুল্লাহ সিস্তানির মতে পা ও পায়ের নলার সংযোগস্থল পর্যন্ত মাসেহ করতে হয়; কেবল পায়ের উঁচু অংশ পর্যন্ত মাসেহ তাঁর মতে ওয়াজিব সতর্কতা হিসেবে যথেষ্ট নয়। অন্য কিছু মারজা উঁচু অংশকেই যথেষ্ট মনে করেন। আপনার মারজার অনুসরণ করুন।",
        ru: "По мнению аятоллы ас-Систани, протирают до сустава между стопой и голенью; остановиться на возвышении стопы, по его мнению, недостаточно в порядке обязательной предосторожности. Другие марджа допускают возвышение. Следуйте своему марджа.",
        zh: "按西斯坦尼阿亚图拉的观点，应抹到脚与小腿之间的关节；按其必要的谨慎，只抹到脚背隆起处并不足够。另一些玛尔吉阿认为抹到隆起处即可。请遵循您的玛尔吉阿。",
      }),
  },
  ending(true),
];

export const WUDU: Record<Tradition, WuduStep[]> = { sunni: SUNNI, shia: SHIA };

// a rule that belongs to the whole sequence, shown under the trainer and in the quiz
export const RULE: Record<Tradition, L3> = {
  sunni: L("Jeden Teil einmal zu waschen ist gültig, dreimal ist Sunna. In der schafi'itischen und hanbalitischen Schule ist die Reihenfolge Pflicht.",
    "Washing each part once is valid; three times is the sunnah. In the Shafi'i and Hanbali schools the order is obligatory.",
    "غسل كل عضو مرّةً واحدةً يُجزئ، والتثليث سنّة. والترتيب فرضٌ عند الشافعية والحنابلة.", {
      tr: "Her uzvu bir kez yıkamak geçerlidir; üç kez yıkamak sünnettir. Şâfiî ve Hanbelî mezheplerinde sıra farzdır.",
      ur: "ہر عضو کو ایک بار دھونا درست ہے؛ تین بار دھونا سنت ہے۔ شافعی اور حنبلی مکاتب میں ترتیب فرض ہے۔",
      fa: "شستن هر عضو یک بار صحیح است؛ سه بار سنت است. در مذاهب شافعی و حنبلی ترتیب واجب است.",
      ps: "هر غړی یو ځل مینځل سم دي؛ درې ځله مینځل سنت دی. په شافعي او حنبلي مذهبونو کې ترتیب واجب دی.",
      fr: "Laver chaque partie une fois est valable ; trois fois est la sunna. Dans les écoles chaféite et hanbalite, l'ordre est obligatoire.",
      es: "Lavar cada parte una vez es válido; tres veces es la sunna. En las escuelas shafií y hanbalí el orden es obligatorio.",
      id: "Membasuh setiap bagian satu kali sudah sah; tiga kali adalah sunnah. Dalam mazhab Syafi'i dan Hanbali urutannya wajib.",
      ms: "Membasuh setiap anggota sekali adalah sah; tiga kali adalah sunat. Dalam mazhab Syafie dan Hanbali, tertib adalah wajib.",
      bn: "প্রতিটি অঙ্গ একবার ধোয়া বৈধ; তিনবার ধোয়া সুন্নাহ। শাফেয়ী ও হাম্বলী মাযহাবে ক্রম ফরজ।",
      ru: "Достаточно вымыть каждую часть один раз; трижды – сунна. У шафиитов и ханбалитов порядок обязателен.",
      zh: "每个部位洗一次即为有效；洗三次是圣行。在沙斐仪和罕百里学派中，顺序是必须的。",
    }),
  shia: L("Reihenfolge (Tartib) und zügige Abfolge (Muwalat) sind Pflicht.", "Order (tartib) and continuity (muwalat) are obligatory.", "الترتيب والموالاة واجبان.", {
    tr: "Sıra (tertip) ve ara vermeden yapmak (muvâlât) zorunludur.",
    ur: "ترتیب اور موالات (تسلسل) لازم ہیں۔",
    fa: "ترتیب و موالات (پیوستگی) واجب است.",
    ps: "ترتیب او موالات (پرله پسې والی) واجب دي.",
    fr: "L'ordre (tartib) et la continuité (muwalat) sont obligatoires.",
    es: "El orden (tartib) y la continuidad (muwalat) son obligatorios.",
    id: "Urutan (tartib) dan kesinambungan (muwalat) adalah wajib.",
    ms: "Tertib (tartib) dan berterusan (muwalat) adalah wajib.",
    bn: "ক্রম (তারতীব) ও ধারাবাহিকতা (মুওয়ালাত) আবশ্যিক।",
    ru: "Порядок (тартиб) и непрерывность (мувалят) обязательны.",
    zh: "顺序（tartib）和连贯（muwalat）是必须的。",
  }),
};

export type WuduDone = { done: true; at: number; tradition: Tradition };
export const WUDU_KEY = "tf:wudu";
