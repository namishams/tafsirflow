// Supplications of the Prophet ﷺ from the hadith collections (phase 1).
// Arabic texts of the hadith are classical (public domain); transliteration and translations are our own.
// Every entry names its source. The owner plans a review by a qualified scholar – report errors to info@quranmasterclass.com.
export type SunnahDua = {
  id: string;
  cat: SunnahCat;
  ar: string;
  tr: string; // transliteration
  en: string;
  de: string;
  src: string; // hadith reference
  n?: number; // recommended repetitions
};

export const SUNNAH_CATS = ["morning", "sleep", "prayer", "home", "food", "travel", "forgiveness", "hardship", "knowledge", "daily", "salawat"] as const;
export type SunnahCat = (typeof SUNNAH_CATS)[number];

export const SUNNAH_DUAS: SunnahDua[] = [
  // Morning and evening
  {
    id: "asbahna", cat: "morning",
    ar: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    tr: "Asbahnā wa asbaha l-mulku lillāh, wal-hamdu lillāh, lā ilāha illā llāhu wahdahū lā sharīka lah, lahu l-mulku wa lahu l-hamdu wa huwa ʿalā kulli shayʾin qadīr. Rabbi asʾaluka khayra mā fī hādhā l-yawmi wa khayra mā baʿdah, wa aʿūdhu bika min sharri mā fī hādhā l-yawmi wa sharri mā baʿdah. Rabbi aʿūdhu bika mina l-kasali wa sūʾi l-kibar. Rabbi aʿūdhu bika min ʿadhābin fi n-nāri wa ʿadhābin fi l-qabr.",
    en: "We have reached the morning and the dominion belongs to Allah. Praise be to Allah. There is no god but Allah alone, without partner; His is the dominion and His the praise, and He has power over all things. My Lord, I ask You for the good of this day and the good of what follows it, and I seek refuge in You from the evil of this day and the evil of what follows it. My Lord, I seek refuge in You from laziness and the misery of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.",
    de: "Wir sind in den Morgen eingetreten, und die Herrschaft gehört Allah. Alles Lob gebührt Allah. Es gibt keinen Gott außer Allah allein, ohne Teilhaber; Sein ist die Herrschaft und Sein das Lob, und Er hat Macht über alle Dinge. Mein Herr, ich bitte Dich um das Gute dieses Tages und das Gute dessen, was danach kommt, und ich suche Zuflucht bei Dir vor dem Übel dieses Tages und dem Übel dessen, was danach kommt. Mein Herr, ich suche Zuflucht bei Dir vor Trägheit und den Beschwerden des Alters. Mein Herr, ich suche Zuflucht bei Dir vor der Strafe im Feuer und der Strafe im Grab.",
    src: "Sahih Muslim 2723",
  },
  {
    id: "bika-asbahna", cat: "morning",
    ar: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    tr: "Allāhumma bika asbahnā, wa bika amsaynā, wa bika nahyā, wa bika namūtu, wa ilayka n-nushūr.",
    en: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection. (In the evening: “… and to You is the final return.”)",
    de: "O Allah, durch Dich treten wir in den Morgen ein und durch Dich in den Abend, durch Dich leben wir und durch Dich sterben wir, und zu Dir ist die Auferstehung. (Am Abend: „… und zu Dir ist die Heimkehr.“)",
    src: "Jamiʿ at-Tirmidhi 3391; Sunan Abi Dawud 5068",
  },
  {
    id: "bismillah-la-yadurr", cat: "morning", n: 3,
    ar: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    tr: "Bismi llāhi lladhī lā yadurru maʿa smihī shayʾun fi l-ardi wa lā fi s-samāʾi wa huwa s-samīʿu l-ʿalīm.",
    en: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    de: "Im Namen Allahs, mit dessen Namen nichts auf der Erde und nichts im Himmel schaden kann, und Er ist der Allhörende, der Allwissende.",
    src: "Sunan Abi Dawud 5088; Jamiʿ at-Tirmidhi 3388",
  },
  {
    id: "raditu", cat: "morning", n: 3,
    ar: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    tr: "Radītu billāhi rabbā, wa bil-islāmi dīnā, wa bi-Muhammadin sallā llāhu ʿalayhi wa sallama nabiyyā.",
    en: "I am pleased with Allah as Lord, with Islam as religion and with Muhammad ﷺ as Prophet.",
    de: "Ich bin zufrieden mit Allah als Herrn, mit dem Islam als Religion und mit Muhammad ﷺ als Propheten.",
    src: "Sunan Abi Dawud 5072",
  },
  {
    id: "kalimat-tammat", cat: "morning", n: 3,
    ar: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    tr: "Aʿūdhu bi-kalimāti llāhi t-tāmmāti min sharri mā khalaq.",
    en: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    de: "Ich suche Zuflucht bei den vollkommenen Worten Allahs vor dem Übel dessen, was Er erschaffen hat.",
    src: "Sahih Muslim 2709",
  },
  {
    id: "subhanallah-wa-bihamdihi", cat: "morning", n: 100,
    ar: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    tr: "Subhāna llāhi wa bi-hamdih.",
    en: "Glory be to Allah and praise be to Him.",
    de: "Gepriesen sei Allah, und Lob sei Ihm.",
    src: "Sahih al-Bukhari 6405; Sahih Muslim 2691",
  },

  // Sleep and waking
  {
    id: "bismika-amutu", cat: "sleep",
    ar: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    tr: "Bismika llāhumma amūtu wa ahyā.",
    en: "In Your name, O Allah, I die and I live.",
    de: "In Deinem Namen, o Allah, sterbe ich und lebe ich.",
    src: "Sahih al-Bukhari 6324",
  },
  {
    id: "qini-adhabak", cat: "sleep", n: 3,
    ar: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    tr: "Allāhumma qinī ʿadhābaka yawma tabʿathu ʿibādak.",
    en: "O Allah, protect me from Your punishment on the day You resurrect Your servants.",
    de: "O Allah, schütze mich vor Deiner Strafe am Tag, an dem Du Deine Diener auferweckst.",
    src: "Sunan Abi Dawud 5045; Jamiʿ at-Tirmidhi 3398",
  },
  {
    id: "waking", cat: "sleep",
    ar: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    tr: "Al-hamdu lillāhi lladhī ahyānā baʿda mā amātanā wa ilayhi n-nushūr.",
    en: "Praise be to Allah who gave us life after He had caused us to die, and to Him is the resurrection.",
    de: "Alles Lob gebührt Allah, der uns wieder lebendig gemacht hat, nachdem Er uns sterben ließ, und zu Ihm ist die Auferstehung.",
    src: "Sahih al-Bukhari 6312",
  },

  // Prayer, wudu and adhan
  {
    id: "after-wudu", cat: "prayer",
    ar: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    tr: "Ashhadu an lā ilāha illā llāhu wahdahū lā sharīka lah, wa ashhadu anna Muhammadan ʿabduhū wa rasūluh.",
    en: "I bear witness that there is no god but Allah alone, without partner, and I bear witness that Muhammad is His servant and messenger. (After wudu.)",
    de: "Ich bezeuge, dass es keinen Gott gibt außer Allah allein, ohne Teilhaber, und ich bezeuge, dass Muhammad Sein Diener und Gesandter ist. (Nach der Gebetswaschung.)",
    src: "Sahih Muslim 234",
  },
  {
    id: "after-adhan", cat: "prayer",
    ar: "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ",
    tr: "Allāhumma rabba hādhihi d-daʿwati t-tāmmah, wa s-salāti l-qāʾimah, āti Muhammadani l-wasīlata wal-fadīlah, wabʿathhu maqāman mahmūdani lladhī waʿadtah.",
    en: "O Allah, Lord of this perfect call and of the prayer about to be established, grant Muhammad the intercession and the excellence, and raise him to the praised station You have promised him. (After the adhan.)",
    de: "O Allah, Herr dieses vollkommenen Rufes und des Gebets, das gleich verrichtet wird, gewähre Muhammad die Fürsprache und den Vorzug, und erhebe ihn zu der gepriesenen Stellung, die Du ihm versprochen hast. (Nach dem Gebetsruf.)",
    src: "Sahih al-Bukhari 614",
  },
  {
    id: "after-salah", cat: "prayer",
    ar: "أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، أَسْتَغْفِرُ اللَّهَ، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    tr: "Astaghfiru llāh, astaghfiru llāh, astaghfiru llāh. Allāhumma anta s-salāmu wa minka s-salām, tabārakta yā dha l-jalāli wal-ikrām.",
    en: "I ask Allah for forgiveness (three times). O Allah, You are Peace and from You comes peace. Blessed are You, Owner of majesty and honour. (After the obligatory prayer.)",
    de: "Ich bitte Allah um Vergebung (dreimal). O Allah, Du bist der Friede, und von Dir kommt der Friede. Gesegnet bist Du, Besitzer von Majestät und Ehre. (Nach dem Pflichtgebet.)",
    src: "Sahih Muslim 591",
  },
  {
    id: "tasbih-after-salah", cat: "prayer",
    ar: "سُبْحَانَ اللَّهِ (٣٣)، الْحَمْدُ لِلَّهِ (٣٣)، اللَّهُ أَكْبَرُ (٣٣)، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    tr: "Subhāna llāh (33), al-hamdu lillāh (33), Allāhu akbar (33), lā ilāha illā llāhu wahdahū lā sharīka lah, lahu l-mulku wa lahu l-hamdu wa huwa ʿalā kulli shayʾin qadīr.",
    en: "Glory be to Allah (33 times), praise be to Allah (33 times), Allah is the Greatest (33 times), then: there is no god but Allah alone, without partner; His is the dominion and His the praise, and He has power over all things.",
    de: "Gepriesen sei Allah (33-mal), Lob sei Allah (33-mal), Allah ist der Größte (33-mal), dann: Es gibt keinen Gott außer Allah allein, ohne Teilhaber; Sein ist die Herrschaft und Sein das Lob, und Er hat Macht über alle Dinge.",
    src: "Sahih Muslim 597",
  },
  {
    id: "aini-ala-dhikrik", cat: "prayer",
    ar: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    tr: "Allāhumma aʿinnī ʿalā dhikrika wa shukrika wa husni ʿibādatik.",
    en: "O Allah, help me to remember You, to thank You and to worship You in the best way.",
    de: "O Allah, hilf mir, Deiner zu gedenken, Dir zu danken und Dich auf die schönste Weise anzubeten.",
    src: "Sunan Abi Dawud 1522; Sunan an-Nasaʾi 1303",
  },
  {
    id: "enter-mosque", cat: "prayer",
    ar: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    tr: "Allāhumma ftah lī abwāba rahmatik.",
    en: "O Allah, open for me the gates of Your mercy. (Entering the mosque.)",
    de: "O Allah, öffne mir die Tore Deiner Barmherzigkeit. (Beim Betreten der Moschee.)",
    src: "Sahih Muslim 713",
  },
  {
    id: "leave-mosque", cat: "prayer",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    tr: "Allāhumma innī asʾaluka min fadlik.",
    en: "O Allah, I ask You of Your bounty. (Leaving the mosque.)",
    de: "O Allah, ich bitte Dich um Deine Huld. (Beim Verlassen der Moschee.)",
    src: "Sahih Muslim 713",
  },

  // Home, clothes, toilet
  {
    id: "leave-home", cat: "home",
    ar: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    tr: "Bismi llāh, tawakkaltu ʿala llāh, wa lā hawla wa lā quwwata illā billāh.",
    en: "In the name of Allah, I place my trust in Allah, and there is no might and no power except with Allah. (Leaving the house.)",
    de: "Im Namen Allahs, ich vertraue auf Allah, und es gibt keine Macht und keine Kraft außer bei Allah. (Beim Verlassen des Hauses.)",
    src: "Sunan Abi Dawud 5095; Jamiʿ at-Tirmidhi 3426",
  },
  {
    id: "enter-toilet", cat: "home",
    ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    tr: "Allāhumma innī aʿūdhu bika mina l-khubuthi wal-khabāʾith.",
    en: "O Allah, I seek refuge in You from the male and female evil ones. (Before entering the toilet.)",
    de: "O Allah, ich suche Zuflucht bei Dir vor den männlichen und weiblichen bösen Wesen. (Vor dem Betreten der Toilette.)",
    src: "Sahih al-Bukhari 142; Sahih Muslim 375",
  },
  {
    id: "leave-toilet", cat: "home",
    ar: "غُفْرَانَكَ",
    tr: "Ghufrānak.",
    en: "(I ask) Your forgiveness. (After leaving the toilet.)",
    de: "(Ich bitte um) Deine Vergebung. (Nach dem Verlassen der Toilette.)",
    src: "Sunan Abi Dawud 30; Jamiʿ at-Tirmidhi 7",
  },
  {
    id: "clothes", cat: "home",
    ar: "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    tr: "Al-hamdu lillāhi lladhī kasānī hādhā wa razaqanīhi min ghayri hawlin minnī wa lā quwwah.",
    en: "Praise be to Allah who clothed me with this and provided it for me without any might or power on my part. (Putting on clothes.)",
    de: "Alles Lob gebührt Allah, der mich hiermit bekleidet und es mir gewährt hat, ohne Macht und Kraft von mir. (Beim Anziehen.)",
    src: "Sunan Abi Dawud 4023",
  },

  // Food and fasting
  {
    id: "before-eating", cat: "food",
    ar: "بِسْمِ اللَّهِ",
    tr: "Bismi llāh.",
    en: "In the name of Allah. If you forgot at the beginning: “Bismi llāhi awwalahū wa ākhirah” – in the name of Allah at its beginning and its end.",
    de: "Im Namen Allahs. Wenn du es am Anfang vergessen hast: „Bismi llāhi awwalahū wa ākhirah“ – im Namen Allahs an seinem Anfang und an seinem Ende.",
    src: "Sunan Abi Dawud 3767; Jamiʿ at-Tirmidhi 1858",
  },
  {
    id: "after-eating", cat: "food",
    ar: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
    tr: "Al-hamdu lillāhi lladhī atʿamanī hādhā wa razaqanīhi min ghayri hawlin minnī wa lā quwwah.",
    en: "Praise be to Allah who fed me this and provided it for me without any might or power on my part.",
    de: "Alles Lob gebührt Allah, der mir dies zu essen gab und es mir gewährte, ohne Macht und Kraft von mir.",
    src: "Sunan Abi Dawud 4023; Jamiʿ at-Tirmidhi 3458",
  },
  {
    id: "iftar", cat: "food",
    ar: "ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ",
    tr: "Dhahaba z-zamaʾu wabtallati l-ʿurūqu wa thabata l-ajru in shāʾa llāh.",
    en: "The thirst is gone, the veins are moistened, and the reward is certain, if Allah wills. (When breaking the fast.)",
    de: "Der Durst ist vergangen, die Adern sind befeuchtet, und der Lohn ist sicher, so Allah will. (Beim Fastenbrechen.)",
    src: "Sunan Abi Dawud 2357",
  },

  // Travel
  {
    id: "travel", cat: "travel",
    ar: "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ",
    tr: "Allāhu akbar, Allāhu akbar, Allāhu akbar. Subhāna lladhī sakhkhara lanā hādhā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā la-munqalibūn. Allāhumma innā nasʾaluka fī safarinā hādhā l-birra wat-taqwā, wa mina l-ʿamali mā tardā. Allāhumma hawwin ʿalaynā safaranā hādhā watwi ʿannā buʿdah. Allāhumma anta s-sāhibu fi s-safar, wal-khalīfatu fi l-ahl. Allāhumma innī aʿūdhu bika min waʿthāʾi s-safar, wa kaʾābati l-manzar, wa sūʾi l-munqalabi fi l-māli wal-ahl.",
    en: "Allah is the Greatest (three times). Glory be to Him who has made this subservient to us, for we could not have done it ourselves, and to our Lord we will surely return. O Allah, we ask You on this journey for righteousness and piety, and for deeds that please You. O Allah, make this journey easy for us and shorten its distance. O Allah, You are the Companion on the journey and the One who looks after the family. O Allah, I seek refuge in You from the hardships of travel, from a distressing sight and from an evil return to property and family.",
    de: "Allah ist der Größte (dreimal). Gepriesen sei Der, Der uns dies dienstbar gemacht hat, wir selbst hätten es nicht vermocht, und zu unserem Herrn werden wir gewiss zurückkehren. O Allah, wir bitten Dich auf dieser Reise um Güte und Gottesfurcht und um Taten, die Dir gefallen. O Allah, mache uns diese Reise leicht und verkürze uns ihre Entfernung. O Allah, Du bist der Gefährte auf der Reise und der Hüter der Familie. O Allah, ich suche Zuflucht bei Dir vor den Mühen der Reise, vor einem bedrückenden Anblick und vor einer schlimmen Rückkehr zu Besitz und Familie.",
    src: "Sahih Muslim 1342",
  },

  // Forgiveness
  {
    id: "sayyid-istighfar", cat: "forgiveness",
    ar: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    tr: "Allāhumma anta rabbī lā ilāha illā ant, khalaqtanī wa ana ʿabduk, wa ana ʿalā ʿahdika wa waʿdika mā stataʿt, aʿūdhu bika min sharri mā sanaʿt, abūʾu laka bi-niʿmatika ʿalayy, wa abūʾu laka bi-dhanbī faghfir lī, fa-innahū lā yaghfiru dh-dhunūba illā ant.",
    en: "O Allah, You are my Lord, there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as far as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins but You. (The master of seeking forgiveness.)",
    de: "O Allah, Du bist mein Herr, es gibt keinen Gott außer Dir. Du hast mich erschaffen, und ich bin Dein Diener, und ich halte an Deinem Bund und Deinem Versprechen fest, so gut ich kann. Ich suche Zuflucht bei Dir vor dem Übel dessen, was ich getan habe. Ich bekenne Deine Gnade über mir und ich bekenne meine Sünde, so vergib mir, denn niemand vergibt die Sünden außer Dir. (Das beste Bittgebet um Vergebung.)",
    src: "Sahih al-Bukhari 6306",
  },
  {
    id: "afuwwun", cat: "forgiveness",
    ar: "اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي",
    tr: "Allāhumma innaka ʿafuwwun tuhibbu l-ʿafwa faʿfu ʿannī.",
    en: "O Allah, You are Pardoning and love to pardon, so pardon me. (Especially in the last nights of Ramadan.)",
    de: "O Allah, Du bist der Verzeihende und liebst das Verzeihen, so verzeih mir. (Besonders in den letzten Nächten des Ramadan.)",
    src: "Jamiʿ at-Tirmidhi 3513; Sunan Ibn Majah 3850",
  },
  {
    id: "la-hawla", cat: "forgiveness",
    ar: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    tr: "Lā hawla wa lā quwwata illā billāh.",
    en: "There is no might and no power except with Allah – called by the Prophet ﷺ a treasure of Paradise.",
    de: "Es gibt keine Macht und keine Kraft außer bei Allah – vom Propheten ﷺ ein Schatz des Paradieses genannt.",
    src: "Sahih al-Bukhari 6384; Sahih Muslim 2704",
  },

  // Hardship
  {
    id: "karb", cat: "hardship",
    ar: "لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ",
    tr: "Lā ilāha illā llāhu l-ʿazīmu l-halīm, lā ilāha illā llāhu rabbu l-ʿarshi l-ʿazīm, lā ilāha illā llāhu rabbu s-samāwāti wa rabbu l-ardi wa rabbu l-ʿarshi l-karīm.",
    en: "There is no god but Allah, the Mighty, the Forbearing. There is no god but Allah, Lord of the mighty Throne. There is no god but Allah, Lord of the heavens, Lord of the earth and Lord of the noble Throne. (In distress.)",
    de: "Es gibt keinen Gott außer Allah, dem Gewaltigen, dem Nachsichtigen. Es gibt keinen Gott außer Allah, dem Herrn des gewaltigen Throns. Es gibt keinen Gott außer Allah, dem Herrn der Himmel, dem Herrn der Erde und dem Herrn des edlen Throns. (In Not.)",
    src: "Sahih al-Bukhari 6346; Sahih Muslim 2730",
  },
  {
    id: "hamm-hazan", cat: "hardship",
    ar: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    tr: "Allāhumma innī aʿūdhu bika mina l-hammi wal-hazan, wal-ʿajzi wal-kasal, wal-bukhli wal-jubn, wa dalaʿi d-dayni wa ghalabati r-rijāl.",
    en: "O Allah, I seek refuge in You from worry and grief, from weakness and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by people.",
    de: "O Allah, ich suche Zuflucht bei Dir vor Sorge und Kummer, vor Schwäche und Trägheit, vor Geiz und Feigheit, vor der Last der Schulden und davor, von Menschen überwältigt zu werden.",
    src: "Sahih al-Bukhari 6369",
  },
  {
    id: "musiba", cat: "hardship",
    ar: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا",
    tr: "Innā lillāhi wa innā ilayhi rājiʿūn. Allāhumma ʾjurnī fī musībatī wa akhlif lī khayran minhā.",
    en: "We belong to Allah and to Him we return. O Allah, reward me in my affliction and replace it for me with something better. (When struck by a calamity.)",
    de: "Wir gehören Allah, und zu Ihm kehren wir zurück. O Allah, belohne mich in meinem Unglück und gib mir etwas Besseres dafür. (Bei einem Unglück.)",
    src: "Sahih Muslim 918",
  },
  {
    id: "fear-people", cat: "hardship",
    ar: "اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ",
    tr: "Allāhumma innā najʿaluka fī nuhūrihim, wa naʿūdhu bika min shurūrihim.",
    en: "O Allah, we place You before them and seek refuge in You from their evil. (When fearing people.)",
    de: "O Allah, wir stellen Dich ihnen entgegen und suchen Zuflucht bei Dir vor ihrem Übel. (Wenn man Menschen fürchtet.)",
    src: "Sunan Abi Dawud 1537",
  },
  {
    id: "anger", cat: "hardship",
    ar: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    tr: "Aʿūdhu billāhi mina sh-shaytāni r-rajīm.",
    en: "I seek refuge in Allah from Satan, the accursed. (When angry.)",
    de: "Ich suche Zuflucht bei Allah vor dem verfluchten Satan. (Bei Zorn.)",
    src: "Sahih al-Bukhari 3282; Sahih Muslim 2610",
  },
  {
    id: "sick-visit", cat: "hardship",
    ar: "لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ",
    tr: "Lā baʾs, tahūrun in shāʾa llāh.",
    en: "No harm – it is a purification, if Allah wills. (When visiting someone who is ill.)",
    de: "Kein Grund zur Sorge – es ist eine Reinigung, so Allah will. (Beim Krankenbesuch.)",
    src: "Sahih al-Bukhari 3616",
  },

  // Knowledge and guidance
  {
    id: "nafani", cat: "knowledge",
    ar: "اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا",
    tr: "Allāhumma nfaʿnī bimā ʿallamtanī, wa ʿallimnī mā yanfaʿunī, wa zidnī ʿilmā.",
    en: "O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.",
    de: "O Allah, lass mich Nutzen ziehen aus dem, was Du mich gelehrt hast, lehre mich, was mir nützt, und mehre mein Wissen.",
    src: "Jamiʿ at-Tirmidhi 3599; Sunan Ibn Majah 251",
  },
  {
    id: "huda-tuqa", cat: "knowledge",
    ar: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    tr: "Allāhumma innī asʾaluka l-hudā wat-tuqā wal-ʿafāfa wal-ghinā.",
    en: "O Allah, I ask You for guidance, piety, chastity and self-sufficiency.",
    de: "O Allah, ich bitte Dich um Rechtleitung, Gottesfurcht, Keuschheit und Genügsamkeit.",
    src: "Sahih Muslim 2721",
  },
  {
    id: "muqallib", cat: "knowledge",
    ar: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    tr: "Yā muqalliba l-qulūbi thabbit qalbī ʿalā dīnik.",
    en: "O Turner of hearts, keep my heart firm on Your religion.",
    de: "O Du, der die Herzen wendet, festige mein Herz in Deiner Religion.",
    src: "Jamiʿ at-Tirmidhi 2140",
  },

  // Daily life
  {
    id: "sneeze", cat: "daily",
    ar: "الْحَمْدُ لِلَّهِ — يَرْحَمُكَ اللَّهُ — يَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ",
    tr: "Al-hamdu lillāh — Yarhamuka llāh — Yahdīkumu llāhu wa yuslihu bālakum.",
    en: "The one who sneezes says: “Praise be to Allah.” The listener replies: “May Allah have mercy on you.” The one who sneezed answers: “May Allah guide you and set your affairs right.”",
    de: "Wer niest, sagt: „Alles Lob gebührt Allah.“ Wer es hört, antwortet: „Möge Allah sich deiner erbarmen.“ Der Niesende erwidert: „Möge Allah euch rechtleiten und eure Angelegenheiten in Ordnung bringen.“",
    src: "Sahih al-Bukhari 6224",
  },
  {
    id: "rain", cat: "daily",
    ar: "اللَّهُمَّ صَيِّبًا نَافِعًا",
    tr: "Allāhumma sayyiban nāfiʿā.",
    en: "O Allah, (let it be) a beneficial rain.",
    de: "O Allah, (lass ihn) einen nützlichen Regen (sein).",
    src: "Sahih al-Bukhari 1032",
  },
  {
    id: "new-moon", cat: "daily",
    ar: "اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْيُمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، رَبِّي وَرَبُّكَ اللَّهُ",
    tr: "Allāhumma ahillahū ʿalaynā bil-yumni wal-īmān, was-salāmati wal-islām, rabbī wa rabbuka llāh.",
    en: "O Allah, let this new moon rise over us with blessing and faith, safety and Islam. My Lord and your Lord is Allah. (On seeing the new moon.)",
    de: "O Allah, lass diesen Neumond über uns aufgehen mit Segen und Glauben, Sicherheit und Islam. Mein Herr und dein Herr ist Allah. (Beim Sehen des Neumondes.)",
    src: "Jamiʿ at-Tirmidhi 3451",
  },

  // Blessings on the Prophet ﷺ
  {
    id: "salat-ibrahimiyya", cat: "salawat",
    ar: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    tr: "Allāhumma salli ʿalā Muhammadin wa ʿalā āli Muhammad, kamā sallayta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka hamīdun majīd. Allāhumma bārik ʿalā Muhammadin wa ʿalā āli Muhammad, kamā bārakta ʿalā Ibrāhīma wa ʿalā āli Ibrāhīm, innaka hamīdun majīd.",
    en: "O Allah, send prayers upon Muhammad and the family of Muhammad, as You sent prayers upon Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; You are Praiseworthy, Glorious.",
    de: "O Allah, segne Muhammad und die Familie Muhammads, wie Du Ibrahim und die Familie Ibrahims gesegnet hast; Du bist der Lobenswerte, der Ruhmreiche. O Allah, gib Muhammad und der Familie Muhammads Segen, wie Du Ibrahim und der Familie Ibrahims Segen gegeben hast; Du bist der Lobenswerte, der Ruhmreiche.",
    src: "Sahih al-Bukhari 3370",
  },
];
