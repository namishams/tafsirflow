import { useLang, pick } from "@/i18n";

// Texts of the sticker store, the profile frames and the course upsell card, in all 14 languages (formal address).
export type CosmeticsText = {
  levelTitle: string; levelText: string;
  storeTitle: string; storeLead: string; stickersTab: string; framesTab: string; framesLead: string;
  buy: string; owned: string; inPro: string; restore: string; restored: string; restoreNone: string;
  failed: string; pending: string; unavailable: string; waiting: string; count: string;
  useFrame: string; inUse: string; noFrame: string; proNote: string; signIn: string; myStickers: string; open: string;
  buyCourse: string; withPro: string; courseNames: Record<"arabic" | "islam" | "prophet-stories" | "halal-haram" | "exams", string>; unlockNote: string;
  packs: Record<"ramadan-nights" | "haramain" | "calligraphy-gold" | "garden-blossoms" | "eid-lanterns", [string, string]>;
  frames: Record<"emerald" | "gold-arabesque" | "night-sky" | "haramain-arch", string>;
};

const en: CosmeticsText = {
  buyCourse: "Buy this course", withPro: "Unlock with Pro", unlockNote: "Pro unlocks every course. You can also buy this course on its own; it stays yours.",
  courseNames: { arabic: "Arabic language", islam: "Islam courses", "prophet-stories": "Prophet stories", "halal-haram": "Halal and Haram", exams: "Exam centre" },
  levelTitle: "Continue with Pro",
  levelText: "The first {n} levels of this course are free. Every further level is part of Quran Masterclass Pro.",
  storeTitle: "Sticker", storeLead: "Sticker packs in the style of your garden. Bought once, yours on every device.",
  stickersTab: "Sticker packs", framesTab: "Profile frames",
  framesLead: "A frame around your profile picture, visible on your profile, in chats and under comments.",
  buy: "Buy", owned: "Owned", inPro: "Included in Pro", restore: "Restore purchases", restored: "Your purchases have been restored.",
  restoreNone: "No purchases were found for this Apple ID.", failed: "The purchase could not be completed. Please try again.",
  pending: "The purchase is waiting for approval. It will be added automatically.", unavailable: "The App Store cannot be reached right now. Please try again later.",
  waiting: "Waiting for the App Store", count: "{n} stickers", useFrame: "Use frame", inUse: "In use", noFrame: "No frame",
  proNote: "Pro includes every sticker pack. Profile frames are separate purchases. The verified tick cannot be bought.",
  signIn: "Please sign in first, so that your purchase is available on all your devices.", myStickers: "Your premium stickers", open: "Open the sticker store",
  packs: {
    "ramadan-nights": ["Ramadan Nights", "Crescents, lanterns and the quiet of suhoor."],
    haramain: ["Haramain", "The Kaaba, the Green Dome and the minarets of Makkah and Madinah."],
    "calligraphy-gold": ["Calligraphy Gold", "Words of remembrance in gold calligraphy."],
    "garden-blossoms": ["Garden Blossoms", "Blossoms, palms and fruits from the garden of your learning."],
    "eid-lanterns": ["Eid Lanterns", "Lanterns, stars and greetings for the two Eids."],
  },
  frames: { emerald: "Emerald", "gold-arabesque": "Gold Arabesque", "night-sky": "Night Sky", "haramain-arch": "Haramain Arch" },
};

const de: CosmeticsText = {
  buyCourse: "Diesen Kurs kaufen", withPro: "Mit Pro freischalten", unlockNote: "Pro schaltet alle Kurse frei. Sie können diesen Kurs auch einzeln kaufen; er bleibt Ihnen.",
  courseNames: { arabic: "Arabische Sprache", islam: "Islam-Kurse", "prophet-stories": "Prophetengeschichten", "halal-haram": "Halal und Haram", exams: "Prüfungszentrum" },
  levelTitle: "Weiter mit Pro",
  levelText: "Die ersten {n} Stufen dieses Kurses sind kostenlos. Alle weiteren Stufen sind Teil von Quran Masterclass Pro.",
  storeTitle: "Sticker", storeLead: "Sticker-Pakete im Stil Ihres Gartens. Einmal gekauft, auf allen Ihren Geräten.",
  stickersTab: "Sticker-Pakete", framesTab: "Profilrahmen",
  framesLead: "Ein Rahmen um Ihr Profilbild, sichtbar im Profil, in Chats und unter Kommentaren.",
  buy: "Kaufen", owned: "Gekauft", inPro: "In Pro enthalten", restore: "Käufe wiederherstellen", restored: "Ihre Käufe wurden wiederhergestellt.",
  restoreNone: "Für diese Apple-ID wurden keine Käufe gefunden.", failed: "Der Kauf konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.",
  pending: "Der Kauf wartet auf Freigabe. Er wird automatisch hinzugefügt.", unavailable: "Der App Store ist gerade nicht erreichbar. Bitte versuchen Sie es später erneut.",
  waiting: "Warten auf den App Store", count: "{n} Sticker", useFrame: "Rahmen verwenden", inUse: "Aktiv", noFrame: "Kein Rahmen",
  proNote: "Pro enthält alle Sticker-Pakete. Profilrahmen sind eigene Käufe. Das Verifiziert-Häkchen ist nicht käuflich.",
  signIn: "Bitte melden Sie sich zuerst an, damit Ihr Kauf auf allen Ihren Geräten verfügbar ist.", myStickers: "Ihre Premium-Sticker", open: "Zum Sticker-Shop",
  packs: {
    "ramadan-nights": ["Ramadan-Nächte", "Mondsicheln, Laternen und die Stille des Suhur."],
    haramain: ["Haramain", "Die Kaaba, die Grüne Kuppel und die Minarette von Mekka und Medina."],
    "calligraphy-gold": ["Kalligrafie Gold", "Worte des Gedenkens in goldener Kalligrafie."],
    "garden-blossoms": ["Gartenblüten", "Blüten, Palmen und Früchte aus dem Garten Ihres Lernens."],
    "eid-lanterns": ["Eid-Laternen", "Laternen, Sterne und Grüße für die beiden Feste."],
  },
  frames: { emerald: "Smaragd", "gold-arabesque": "Gold-Arabeske", "night-sky": "Nachthimmel", "haramain-arch": "Haramain-Bogen" },
};

const ar: CosmeticsText = {
  buyCourse: "شراء هذه الدورة", withPro: "الفتح مع Pro", unlockNote: "يفتح Pro كل الدورات. ويمكنكم أيضًا شراء هذه الدورة وحدها، وتبقى لكم.",
  courseNames: { arabic: "اللغة العربية", islam: "دورات الإسلام", "prophet-stories": "قصص الأنبياء", "halal-haram": "الحلال والحرام", exams: "مركز الاختبارات" },
  levelTitle: "تابعوا مع Pro",
  levelText: "المستويات الـ {n} الأولى من هذه الدورة مجانية. وكل مستوى بعدها جزء من Quran Masterclass Pro.",
  storeTitle: "الملصقات", storeLead: "حزم ملصقات بأسلوب حديقتكم. تُشترى مرة واحدة وتبقى لكم على كل أجهزتكم.",
  stickersTab: "حزم الملصقات", framesTab: "إطارات الملف الشخصي",
  framesLead: "إطار حول صورة ملفكم الشخصي، يظهر في الملف وفي المحادثات وتحت التعليقات.",
  buy: "شراء", owned: "تم الشراء", inPro: "مشمول في Pro", restore: "استعادة المشتريات", restored: "تمت استعادة مشترياتكم.",
  restoreNone: "لم يُعثر على مشتريات لمعرّف Apple هذا.", failed: "تعذّر إتمام الشراء. يرجى المحاولة مرة أخرى.",
  pending: "الشراء بانتظار الموافقة، وسيُضاف تلقائيًا.", unavailable: "متجر App Store غير متاح الآن. يرجى المحاولة لاحقًا.",
  waiting: "بانتظار App Store", count: "{n} ملصقات", useFrame: "استخدام الإطار", inUse: "مستخدم", noFrame: "بلا إطار",
  proNote: "يشمل Pro كل حزم الملصقات. إطارات الملف الشخصي مشتريات مستقلة. علامة التوثيق لا تُباع.",
  signIn: "يرجى تسجيل الدخول أولًا ليكون الشراء متاحًا على كل أجهزتكم.", myStickers: "ملصقاتكم المميزة", open: "متجر الملصقات",
  packs: {
    "ramadan-nights": ["ليالي رمضان", "أهلّة وفوانيس وسكينة السحور."],
    haramain: ["الحرمان", "الكعبة والقبة الخضراء ومآذن مكة والمدينة."],
    "calligraphy-gold": ["الخط الذهبي", "كلمات الذكر بخط ذهبي."],
    "garden-blossoms": ["أزهار الحديقة", "أزهار ونخيل وثمار من حديقة تعلّمكم."],
    "eid-lanterns": ["فوانيس العيد", "فوانيس ونجوم وتهانٍ للعيدين."],
  },
  frames: { emerald: "زمرد", "gold-arabesque": "أرابيسك ذهبي", "night-sky": "سماء الليل", "haramain-arch": "قوس الحرمين" },
};

const tr: CosmeticsText = {
  buyCourse: "Bu kursu satın al", withPro: "Pro ile aç", unlockNote: "Pro tüm kursları açar. Bu kursu tek başına da satın alabilirsiniz; sizde kalır.",
  courseNames: { arabic: "Arap dili", islam: "İslam kursları", "prophet-stories": "Peygamber kıssaları", "halal-haram": "Helal ve haram", exams: "Sınav merkezi" },
  levelTitle: "Pro ile devam edin",
  levelText: "Bu kursun ilk {n} seviyesi ücretsizdir. Sonraki tüm seviyeler Quran Masterclass Pro'ya dahildir.",
  storeTitle: "Çıkartmalar", storeLead: "Bahçenizin tarzında çıkartma paketleri. Bir kez satın alın, tüm cihazlarınızda sizin.",
  stickersTab: "Çıkartma paketleri", framesTab: "Profil çerçeveleri",
  framesLead: "Profil fotoğrafınızın etrafında bir çerçeve; profilinizde, sohbetlerde ve yorumlarda görünür.",
  buy: "Satın al", owned: "Satın alındı", inPro: "Pro'ya dahil", restore: "Satın alımları geri yükle", restored: "Satın alımlarınız geri yüklendi.",
  restoreNone: "Bu Apple Kimliği için satın alım bulunamadı.", failed: "Satın alma tamamlanamadı. Lütfen tekrar deneyin.",
  pending: "Satın alma onay bekliyor. Otomatik olarak eklenecek.", unavailable: "App Store şu anda erişilemiyor. Lütfen daha sonra tekrar deneyin.",
  waiting: "App Store bekleniyor", count: "{n} çıkartma", useFrame: "Çerçeveyi kullan", inUse: "Kullanımda", noFrame: "Çerçevesiz",
  proNote: "Pro tüm çıkartma paketlerini içerir. Profil çerçeveleri ayrı satın alımlardır. Doğrulama işareti satın alınamaz.",
  signIn: "Satın alımınızın tüm cihazlarınızda geçerli olması için lütfen önce giriş yapın.", myStickers: "Premium çıkartmalarınız", open: "Çıkartma mağazası",
  packs: {
    "ramadan-nights": ["Ramazan Geceleri", "Hilaller, fenerler ve sahurun sükûneti."],
    haramain: ["Haremeyn", "Kâbe, Yeşil Kubbe ve Mekke ile Medine'nin minareleri."],
    "calligraphy-gold": ["Altın Hat", "Altın hatla zikir sözleri."],
    "garden-blossoms": ["Bahçe Çiçekleri", "Öğrenme bahçenizden çiçekler, hurmalar ve meyveler."],
    "eid-lanterns": ["Bayram Fenerleri", "İki bayram için fenerler, yıldızlar ve tebrikler."],
  },
  frames: { emerald: "Zümrüt", "gold-arabesque": "Altın Arabesk", "night-sky": "Gece Göğü", "haramain-arch": "Haremeyn Kemeri" },
};

const ur: CosmeticsText = {
  buyCourse: "یہ کورس خریدیں", withPro: "Pro سے کھولیں", unlockNote: "Pro تمام کورسز کھولتا ہے۔ آپ یہ کورس الگ سے بھی خرید سکتے ہیں؛ یہ آپ کا رہے گا۔",
  courseNames: { arabic: "عربی زبان", islam: "اسلامی کورسز", "prophet-stories": "انبیاء کے قصے", "halal-haram": "حلال و حرام", exams: "امتحانی مرکز" },
  levelTitle: "Pro کے ساتھ جاری رکھیں",
  levelText: "اس کورس کے پہلے {n} درجے مفت ہیں۔ باقی تمام درجے Quran Masterclass Pro کا حصہ ہیں۔",
  storeTitle: "اسٹیکرز", storeLead: "آپ کے باغ کے انداز میں اسٹیکر پیک۔ ایک بار خریدیں، آپ کے تمام آلات پر آپ کے۔",
  stickersTab: "اسٹیکر پیک", framesTab: "پروفائل فریم",
  framesLead: "آپ کی پروفائل تصویر کے گرد ایک فریم، جو پروفائل، چیٹ اور تبصروں میں نظر آتا ہے۔",
  buy: "خریدیں", owned: "خریدا گیا", inPro: "Pro میں شامل", restore: "خریداریاں بحال کریں", restored: "آپ کی خریداریاں بحال ہو گئیں۔",
  restoreNone: "اس Apple ID کے لیے کوئی خریداری نہیں ملی۔", failed: "خریداری مکمل نہ ہو سکی۔ براہ کرم دوبارہ کوشش کریں۔",
  pending: "خریداری منظوری کی منتظر ہے۔ یہ خود بخود شامل ہو جائے گی۔", unavailable: "App Store اس وقت دستیاب نہیں۔ براہ کرم بعد میں کوشش کریں۔",
  waiting: "App Store کا انتظار", count: "{n} اسٹیکرز", useFrame: "فریم استعمال کریں", inUse: "زیر استعمال", noFrame: "کوئی فریم نہیں",
  proNote: "Pro میں تمام اسٹیکر پیک شامل ہیں۔ پروفائل فریم الگ خریداریاں ہیں۔ تصدیقی نشان خریدا نہیں جا سکتا۔",
  signIn: "براہ کرم پہلے سائن ان کریں تاکہ آپ کی خریداری آپ کے تمام آلات پر دستیاب ہو۔", myStickers: "آپ کے پریمیم اسٹیکرز", open: "اسٹیکر اسٹور",
  packs: {
    "ramadan-nights": ["رمضان کی راتیں", "ہلال، فانوس اور سحری کا سکون۔"],
    haramain: ["حرمین", "کعبہ، گنبدِ خضریٰ اور مکہ و مدینہ کے مینار۔"],
    "calligraphy-gold": ["سنہری خطاطی", "سنہری خطاطی میں ذکر کے کلمات۔"],
    "garden-blossoms": ["باغ کے پھول", "آپ کے سیکھنے کے باغ سے پھول، کھجوریں اور پھل۔"],
    "eid-lanterns": ["عید کے فانوس", "دونوں عیدوں کے لیے فانوس، ستارے اور مبارکباد۔"],
  },
  frames: { emerald: "زمرد", "gold-arabesque": "سنہری عربیسک", "night-sky": "رات کا آسمان", "haramain-arch": "حرمین محراب" },
};

const fa: CosmeticsText = {
  buyCourse: "خرید این دوره", withPro: "گشودن با Pro", unlockNote: "Pro همهٔ دوره\u200cها را می\u200cگشاید. می\u200cتوانید این دوره را جداگانه هم بخرید؛ از آنِ شما می\u200cماند.",
  courseNames: { arabic: "زبان عربی", islam: "دوره\u200cهای اسلام", "prophet-stories": "داستان پیامبران", "halal-haram": "حلال و حرام", exams: "مرکز آزمون" },
  levelTitle: "ادامه با Pro",
  levelText: "{n} سطح نخست این دوره رایگان است. همهٔ سطح‌های بعدی بخشی از Quran Masterclass Pro هستند.",
  storeTitle: "برچسب‌ها", storeLead: "بسته‌های برچسب به سبک باغ شما. یک بار بخرید، روی همهٔ دستگاه‌هایتان از آنِ شماست.",
  stickersTab: "بسته‌های برچسب", framesTab: "قاب‌های نمایه",
  framesLead: "قابی دور تصویر نمایهٔ شما که در نمایه، گفتگوها و زیر نظرها دیده می‌شود.",
  buy: "خرید", owned: "خریداری شده", inPro: "در Pro موجود است", restore: "بازیابی خریدها", restored: "خریدهای شما بازیابی شد.",
  restoreNone: "برای این Apple ID خریدی یافت نشد.", failed: "خرید انجام نشد. لطفاً دوباره تلاش کنید.",
  pending: "خرید در انتظار تأیید است و خودکار افزوده می‌شود.", unavailable: "App Store اکنون در دسترس نیست. لطفاً بعداً تلاش کنید.",
  waiting: "در انتظار App Store", count: "{n} برچسب", useFrame: "استفاده از قاب", inUse: "در حال استفاده", noFrame: "بدون قاب",
  proNote: "Pro همهٔ بسته‌های برچسب را دارد. قاب‌های نمایه خرید جداگانه‌اند. نشان تأیید فروشی نیست.",
  signIn: "لطفاً ابتدا وارد شوید تا خریدتان روی همهٔ دستگاه‌هایتان در دسترس باشد.", myStickers: "برچسب‌های ویژهٔ شما", open: "فروشگاه برچسب",
  packs: {
    "ramadan-nights": ["شب‌های رمضان", "هلال‌ها، فانوس‌ها و آرامش سحر."],
    haramain: ["حرمین", "کعبه، گنبد خضرا و مناره‌های مکه و مدینه."],
    "calligraphy-gold": ["خوشنویسی طلایی", "کلمات ذکر با خوشنویسی طلایی."],
    "garden-blossoms": ["شکوفه‌های باغ", "شکوفه‌ها، نخل‌ها و میوه‌ها از باغ آموختن شما."],
    "eid-lanterns": ["فانوس‌های عید", "فانوس‌ها، ستاره‌ها و تبریک‌ها برای دو عید."],
  },
  frames: { emerald: "زمرد", "gold-arabesque": "اسلیمی طلایی", "night-sky": "آسمان شب", "haramain-arch": "طاق حرمین" },
};

const ps: CosmeticsText = {
  buyCourse: "دا کورس واخلئ", withPro: "د Pro سره یې پرانیزئ", unlockNote: "Pro ټول کورسونه پرانیزي. تاسو دا کورس جلا هم اخیستلی شئ؛ ستاسو پاتې کېږي.",
  courseNames: { arabic: "عربي ژبه", islam: "د اسلام کورسونه", "prophet-stories": "د پیغمبرانو کیسې", "halal-haram": "حلال او حرام", exams: "د ازموینې مرکز" },
  levelTitle: "د Pro سره دوام ورکړئ",
  levelText: "د دې کورس لومړنۍ {n} کچې وړیا دي. نورې ټولې کچې د Quran Masterclass Pro برخه ده.",
  storeTitle: "سټیکرونه", storeLead: "ستاسو د باغ په بڼه د سټیکرونو بستې. یو ځل یې واخلئ، په ټولو وسیلو کې ستاسو دي.",
  stickersTab: "د سټیکرونو بستې", framesTab: "د پروفایل چوکاټونه",
  framesLead: "ستاسو د پروفایل انځور شاوخوا چوکاټ، چې په پروفایل، چټونو او تبصرو کې ښکاري.",
  buy: "واخلئ", owned: "اخیستل شوی", inPro: "په Pro کې شامل", restore: "پېرودونه بېرته راوړئ", restored: "ستاسو پېرودونه بېرته راوړل شول.",
  restoreNone: "د دې Apple ID لپاره هېڅ پېرود ونه موندل شو.", failed: "پېرود بشپړ نه شو. مهرباني وکړئ بیا هڅه وکړئ.",
  pending: "پېرود د تایید په تمه دی او پخپله به اضافه شي.", unavailable: "App Store اوس د لاسرسي وړ نه دی. مهرباني وکړئ وروسته هڅه وکړئ.",
  waiting: "د App Store په تمه", count: "{n} سټیکرونه", useFrame: "چوکاټ وکاروئ", inUse: "کارېږي", noFrame: "بې چوکاټه",
  proNote: "Pro ټولې د سټیکرونو بستې لري. د پروفایل چوکاټونه جلا پېرودونه دي. د تایید نښه نه پلورل کېږي.",
  signIn: "مهرباني وکړئ لومړی ننوځئ چې ستاسو پېرود په ټولو وسیلو کې شتون ولري.", myStickers: "ستاسو ځانګړي سټیکرونه", open: "د سټیکرونو پلورنځی",
  packs: {
    "ramadan-nights": ["د رمضان شپې", "میاشتې، څراغونه او د پېشمني ارامي."],
    haramain: ["حرمین", "کعبه، شین ګنبد او د مکې او مدینې منارې."],
    "calligraphy-gold": ["طلایي خطاطي", "د ذکر کلمې په طلایي خطاطۍ کې."],
    "garden-blossoms": ["د باغ ګلان", "ستاسو د زده کړې له باغ څخه ګلان، خرما او مېوې."],
    "eid-lanterns": ["د اختر څراغونه", "د دواړو اخترونو لپاره څراغونه، ستوري او مبارکۍ."],
  },
  frames: { emerald: "زمرد", "gold-arabesque": "طلایي نقش", "night-sky": "د شپې اسمان", "haramain-arch": "د حرمین طاق" },
};

const fr: CosmeticsText = {
  buyCourse: "Acheter ce cours", withPro: "Débloquer avec Pro", unlockNote: "Pro débloque tous les cours. Vous pouvez aussi acheter ce cours seul ; il reste à vous.",
  courseNames: { arabic: "Langue arabe", islam: "Cours sur l’islam", "prophet-stories": "Histoires des prophètes", "halal-haram": "Halal et haram", exams: "Centre d’examens" },
  levelTitle: "Continuer avec Pro",
  levelText: "Les {n} premiers niveaux de ce cours sont gratuits. Tous les niveaux suivants font partie de Quran Masterclass Pro.",
  storeTitle: "Stickers", storeLead: "Des packs de stickers dans le style de votre jardin. Achetés une fois, à vous sur tous vos appareils.",
  stickersTab: "Packs de stickers", framesTab: "Cadres de profil",
  framesLead: "Un cadre autour de votre photo de profil, visible sur votre profil, dans les discussions et sous les commentaires.",
  buy: "Acheter", owned: "Acheté", inPro: "Inclus dans Pro", restore: "Restaurer les achats", restored: "Vos achats ont été restaurés.",
  restoreNone: "Aucun achat trouvé pour cet identifiant Apple.", failed: "L'achat n'a pas pu être finalisé. Veuillez réessayer.",
  pending: "L'achat attend une approbation. Il sera ajouté automatiquement.", unavailable: "L'App Store est injoignable pour le moment. Veuillez réessayer plus tard.",
  waiting: "En attente de l'App Store", count: "{n} stickers", useFrame: "Utiliser ce cadre", inUse: "Utilisé", noFrame: "Sans cadre",
  proNote: "Pro inclut tous les packs de stickers. Les cadres de profil sont des achats séparés. Le badge vérifié ne s'achète pas.",
  signIn: "Veuillez d'abord vous connecter, afin que votre achat soit disponible sur tous vos appareils.", myStickers: "Vos stickers premium", open: "Boutique de stickers",
  packs: {
    "ramadan-nights": ["Nuits de Ramadan", "Croissants, lanternes et le calme du suhur."],
    haramain: ["Haramain", "La Kaaba, la Coupole verte et les minarets de La Mecque et de Médine."],
    "calligraphy-gold": ["Calligraphie or", "Des paroles de rappel en calligraphie dorée."],
    "garden-blossoms": ["Fleurs du jardin", "Fleurs, palmiers et fruits du jardin de votre apprentissage."],
    "eid-lanterns": ["Lanternes de l'Aïd", "Lanternes, étoiles et vœux pour les deux Aïds."],
  },
  frames: { emerald: "Émeraude", "gold-arabesque": "Arabesque or", "night-sky": "Ciel nocturne", "haramain-arch": "Arche des Haramain" },
};

const es: CosmeticsText = {
  buyCourse: "Comprar este curso", withPro: "Desbloquear con Pro", unlockNote: "Pro desbloquea todos los cursos. También puede comprar este curso por separado; seguirá siendo suyo.",
  courseNames: { arabic: "Lengua árabe", islam: "Cursos sobre el islam", "prophet-stories": "Historias de los profetas", "halal-haram": "Halal y haram", exams: "Centro de exámenes" },
  levelTitle: "Continuar con Pro",
  levelText: "Los primeros {n} niveles de este curso son gratuitos. Todos los niveles siguientes forman parte de Quran Masterclass Pro.",
  storeTitle: "Stickers", storeLead: "Paquetes de stickers con el estilo de su jardín. Se compran una vez y son suyos en todos sus dispositivos.",
  stickersTab: "Paquetes de stickers", framesTab: "Marcos de perfil",
  framesLead: "Un marco alrededor de su foto de perfil, visible en su perfil, en los chats y bajo los comentarios.",
  buy: "Comprar", owned: "Comprado", inPro: "Incluido en Pro", restore: "Restaurar compras", restored: "Sus compras se han restaurado.",
  restoreNone: "No se encontraron compras para este Apple ID.", failed: "No se pudo completar la compra. Inténtelo de nuevo.",
  pending: "La compra está pendiente de aprobación. Se añadirá automáticamente.", unavailable: "El App Store no está disponible ahora. Inténtelo más tarde.",
  waiting: "Esperando al App Store", count: "{n} stickers", useFrame: "Usar marco", inUse: "En uso", noFrame: "Sin marco",
  proNote: "Pro incluye todos los paquetes de stickers. Los marcos de perfil son compras aparte. La marca de verificación no se vende.",
  signIn: "Inicie sesión primero para que su compra esté disponible en todos sus dispositivos.", myStickers: "Sus stickers premium", open: "Tienda de stickers",
  packs: {
    "ramadan-nights": ["Noches de Ramadán", "Medias lunas, faroles y la calma del suhur."],
    haramain: ["Haramain", "La Kaaba, la Cúpula Verde y los minaretes de La Meca y Medina."],
    "calligraphy-gold": ["Caligrafía dorada", "Palabras de recuerdo en caligrafía dorada."],
    "garden-blossoms": ["Flores del jardín", "Flores, palmeras y frutos del jardín de su aprendizaje."],
    "eid-lanterns": ["Faroles de Eid", "Faroles, estrellas y felicitaciones para los dos Eid."],
  },
  frames: { emerald: "Esmeralda", "gold-arabesque": "Arabesco dorado", "night-sky": "Cielo nocturno", "haramain-arch": "Arco de Haramain" },
};

const id: CosmeticsText = {
  buyCourse: "Beli kursus ini", withPro: "Buka dengan Pro", unlockNote: "Pro membuka semua kursus. Anda juga dapat membeli kursus ini secara terpisah; tetap milik Anda.",
  courseNames: { arabic: "Bahasa Arab", islam: "Kursus Islam", "prophet-stories": "Kisah para nabi", "halal-haram": "Halal dan haram", exams: "Pusat ujian" },
  levelTitle: "Lanjutkan dengan Pro",
  levelText: "{n} level pertama kursus ini gratis. Semua level berikutnya termasuk dalam Quran Masterclass Pro.",
  storeTitle: "Stiker", storeLead: "Paket stiker bergaya taman Anda. Dibeli sekali, milik Anda di semua perangkat.",
  stickersTab: "Paket stiker", framesTab: "Bingkai profil",
  framesLead: "Bingkai di sekitar foto profil Anda, terlihat di profil, obrolan, dan di bawah komentar.",
  buy: "Beli", owned: "Dimiliki", inPro: "Termasuk dalam Pro", restore: "Pulihkan pembelian", restored: "Pembelian Anda telah dipulihkan.",
  restoreNone: "Tidak ada pembelian untuk Apple ID ini.", failed: "Pembelian tidak dapat diselesaikan. Silakan coba lagi.",
  pending: "Pembelian menunggu persetujuan dan akan ditambahkan otomatis.", unavailable: "App Store sedang tidak dapat dijangkau. Silakan coba lagi nanti.",
  waiting: "Menunggu App Store", count: "{n} stiker", useFrame: "Gunakan bingkai", inUse: "Digunakan", noFrame: "Tanpa bingkai",
  proNote: "Pro mencakup semua paket stiker. Bingkai profil adalah pembelian terpisah. Tanda verifikasi tidak dijual.",
  signIn: "Silakan masuk terlebih dahulu agar pembelian Anda tersedia di semua perangkat.", myStickers: "Stiker premium Anda", open: "Toko stiker",
  packs: {
    "ramadan-nights": ["Malam Ramadan", "Bulan sabit, lentera, dan tenangnya sahur."],
    haramain: ["Haramain", "Ka'bah, Kubah Hijau, dan menara Makkah serta Madinah."],
    "calligraphy-gold": ["Kaligrafi Emas", "Kalimat zikir dalam kaligrafi emas."],
    "garden-blossoms": ["Bunga Taman", "Bunga, kurma, dan buah dari taman belajar Anda."],
    "eid-lanterns": ["Lentera Id", "Lentera, bintang, dan ucapan untuk dua hari raya."],
  },
  frames: { emerald: "Zamrud", "gold-arabesque": "Arabesk Emas", "night-sky": "Langit Malam", "haramain-arch": "Lengkung Haramain" },
};

const ms: CosmeticsText = {
  ...id,
  buyCourse: "Beli kursus ini", withPro: "Buka dengan Pro", unlockNote: "Pro membuka semua kursus. Anda juga boleh membeli kursus ini secara berasingan; ia kekal milik anda.",
  courseNames: { arabic: "Bahasa Arab", islam: "Kursus Islam", "prophet-stories": "Kisah para nabi", "halal-haram": "Halal dan haram", exams: "Pusat peperiksaan" },
  levelTitle: "Teruskan dengan Pro",
  levelText: "{n} tahap pertama kursus ini percuma. Semua tahap seterusnya adalah sebahagian daripada Quran Masterclass Pro.",
  storeLead: "Pek pelekat dalam gaya taman anda. Dibeli sekali, milik anda pada semua peranti.",
  storeTitle: "Pelekat", stickersTab: "Pek pelekat", framesTab: "Bingkai profil",
  framesLead: "Bingkai di sekeliling gambar profil anda, kelihatan pada profil, sembang dan di bawah komen.",
  buy: "Beli", owned: "Dimiliki", inPro: "Termasuk dalam Pro", restore: "Pulihkan pembelian", restored: "Pembelian anda telah dipulihkan.",
  restoreNone: "Tiada pembelian ditemui untuk Apple ID ini.", failed: "Pembelian tidak dapat diselesaikan. Sila cuba lagi.",
  pending: "Pembelian menunggu kelulusan dan akan ditambah secara automatik.", unavailable: "App Store tidak dapat dicapai sekarang. Sila cuba lagi kemudian.",
  waiting: "Menunggu App Store", count: "{n} pelekat", useFrame: "Guna bingkai", inUse: "Sedang digunakan", noFrame: "Tanpa bingkai",
  proNote: "Pro merangkumi semua pek pelekat. Bingkai profil ialah pembelian berasingan. Tanda pengesahan tidak dijual.",
  signIn: "Sila log masuk dahulu supaya pembelian anda tersedia pada semua peranti anda.", myStickers: "Pelekat premium anda", open: "Kedai pelekat",
  packs: {
    "ramadan-nights": ["Malam Ramadan", "Anak bulan, tanglung dan ketenangan sahur."],
    haramain: ["Haramain", "Kaabah, Kubah Hijau dan menara Makkah serta Madinah."],
    "calligraphy-gold": ["Khat Emas", "Kalimah zikir dalam khat emas."],
    "garden-blossoms": ["Bunga Taman", "Bunga, kurma dan buah dari taman pembelajaran anda."],
    "eid-lanterns": ["Tanglung Raya", "Tanglung, bintang dan ucapan untuk dua hari raya."],
  },
};

const bn: CosmeticsText = {
  buyCourse: "এই কোর্স কিনুন", withPro: "Pro দিয়ে খুলুন", unlockNote: "Pro সব কোর্স খুলে দেয়। আপনি এই কোর্সটি আলাদাভাবেও কিনতে পারেন; এটি আপনারই থাকবে।",
  courseNames: { arabic: "আরবি ভাষা", islam: "ইসলাম কোর্স", "prophet-stories": "নবীদের কাহিনি", "halal-haram": "হালাল ও হারাম", exams: "পরীক্ষা কেন্দ্র" },
  levelTitle: "Pro দিয়ে চালিয়ে যান",
  levelText: "এই কোর্সের প্রথম {n}টি স্তর বিনামূল্যে। পরের সব স্তর Quran Masterclass Pro-এর অংশ।",
  storeTitle: "স্টিকার", storeLead: "আপনার বাগানের ধাঁচে স্টিকার প্যাক। একবার কিনুন, আপনার সব ডিভাইসে আপনার।",
  stickersTab: "স্টিকার প্যাক", framesTab: "প্রোফাইল ফ্রেম",
  framesLead: "আপনার প্রোফাইল ছবির চারপাশে একটি ফ্রেম, যা প্রোফাইলে, চ্যাটে ও মন্তব্যের নিচে দেখা যায়।",
  buy: "কিনুন", owned: "কেনা হয়েছে", inPro: "Pro-তে অন্তর্ভুক্ত", restore: "কেনাকাটা পুনরুদ্ধার করুন", restored: "আপনার কেনাকাটা পুনরুদ্ধার হয়েছে।",
  restoreNone: "এই Apple ID-এর জন্য কোনো কেনাকাটা পাওয়া যায়নি।", failed: "কেনাকাটা সম্পন্ন করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
  pending: "কেনাকাটা অনুমোদনের অপেক্ষায় আছে। এটি স্বয়ংক্রিয়ভাবে যোগ হবে।", unavailable: "App Store এখন পাওয়া যাচ্ছে না। অনুগ্রহ করে পরে চেষ্টা করুন।",
  waiting: "App Store-এর অপেক্ষায়", count: "{n}টি স্টিকার", useFrame: "ফ্রেম ব্যবহার করুন", inUse: "ব্যবহৃত হচ্ছে", noFrame: "ফ্রেম নেই",
  proNote: "Pro-তে সব স্টিকার প্যাক আছে। প্রোফাইল ফ্রেম আলাদা কেনাকাটা। যাচাই চিহ্ন কেনা যায় না।",
  signIn: "আপনার কেনাকাটা সব ডিভাইসে পেতে অনুগ্রহ করে আগে সাইন ইন করুন।", myStickers: "আপনার প্রিমিয়াম স্টিকার", open: "স্টিকার স্টোর",
  packs: {
    "ramadan-nights": ["রমজানের রাত", "নতুন চাঁদ, লণ্ঠন আর সাহরির প্রশান্তি।"],
    haramain: ["হারামাইন", "কাবা, সবুজ গম্বুজ এবং মক্কা ও মদিনার মিনার।"],
    "calligraphy-gold": ["সোনালি ক্যালিগ্রাফি", "সোনালি ক্যালিগ্রাফিতে যিকিরের বাণী।"],
    "garden-blossoms": ["বাগানের ফুল", "আপনার শেখার বাগান থেকে ফুল, খেজুর গাছ ও ফল।"],
    "eid-lanterns": ["ঈদের লণ্ঠন", "দুই ঈদের জন্য লণ্ঠন, তারা ও শুভেচ্ছা।"],
  },
  frames: { emerald: "পান্না", "gold-arabesque": "সোনালি আরাবেস্ক", "night-sky": "রাতের আকাশ", "haramain-arch": "হারামাইন খিলান" },
};

const ru: CosmeticsText = {
  buyCourse: "Купить этот курс", withPro: "Открыть с Pro", unlockNote: "Pro открывает все курсы. Вы также можете купить этот курс отдельно; он останется Вашим.",
  courseNames: { arabic: "Арабский язык", islam: "Курсы об исламе", "prophet-stories": "Истории пророков", "halal-haram": "Халяль и харам", exams: "Экзаменационный центр" },
  levelTitle: "Продолжить с Pro",
  levelText: "Первые {n} уровня этого курса бесплатны. Все следующие уровни входят в Quran Masterclass Pro.",
  storeTitle: "Стикеры", storeLead: "Наборы стикеров в стиле Вашего сада. Покупаются один раз и доступны на всех Ваших устройствах.",
  stickersTab: "Наборы стикеров", framesTab: "Рамки профиля",
  framesLead: "Рамка вокруг фото профиля: видна в профиле, в чатах и под комментариями.",
  buy: "Купить", owned: "Куплено", inPro: "Входит в Pro", restore: "Восстановить покупки", restored: "Ваши покупки восстановлены.",
  restoreNone: "Для этого Apple ID покупок не найдено.", failed: "Не удалось завершить покупку. Пожалуйста, попробуйте ещё раз.",
  pending: "Покупка ожидает одобрения и будет добавлена автоматически.", unavailable: "App Store сейчас недоступен. Пожалуйста, попробуйте позже.",
  waiting: "Ожидание App Store", count: "Стикеров: {n}", useFrame: "Использовать рамку", inUse: "Используется", noFrame: "Без рамки",
  proNote: "Pro включает все наборы стикеров. Рамки профиля покупаются отдельно. Отметку верификации купить нельзя.",
  signIn: "Пожалуйста, сначала войдите, чтобы покупка была доступна на всех Ваших устройствах.", myStickers: "Ваши премиум-стикеры", open: "Магазин стикеров",
  packs: {
    "ramadan-nights": ["Ночи Рамадана", "Полумесяцы, фонари и тишина сухура."],
    haramain: ["Харамайн", "Кааба, Зелёный купол и минареты Мекки и Медины."],
    "calligraphy-gold": ["Золотая каллиграфия", "Слова поминания в золотой каллиграфии."],
    "garden-blossoms": ["Цветы сада", "Цветы, пальмы и плоды из сада Вашей учёбы."],
    "eid-lanterns": ["Фонари Ида", "Фонари, звёзды и поздравления к двум праздникам."],
  },
  frames: { emerald: "Изумруд", "gold-arabesque": "Золотая арабеска", "night-sky": "Ночное небо", "haramain-arch": "Арка Харамайн" },
};

const zh: CosmeticsText = {
  buyCourse: "购买本课程", withPro: "开通 Pro 解锁", unlockNote: "Pro 可解锁所有课程。您也可以单独购买本课程，永久归您所有。",
  courseNames: { arabic: "阿拉伯语", islam: "伊斯兰课程", "prophet-stories": "先知故事", "halal-haram": "合法与禁戒", exams: "考试中心" },
  levelTitle: "开通 Pro 继续学习",
  levelText: "本课程的前 {n} 个级别免费。之后的所有级别均属于 Quran Masterclass Pro。",
  storeTitle: "贴纸", storeLead: "与您的花园风格一致的贴纸包。一次购买，您的所有设备均可使用。",
  stickersTab: "贴纸包", framesTab: "头像框",
  framesLead: "围绕您头像的边框，在个人主页、聊天和评论中显示。",
  buy: "购买", owned: "已拥有", inPro: "Pro 已包含", restore: "恢复购买", restored: "您的购买已恢复。",
  restoreNone: "未找到此 Apple ID 的购买记录。", failed: "购买未能完成，请重试。",
  pending: "购买正在等待批准，批准后将自动添加。", unavailable: "目前无法连接 App Store，请稍后再试。",
  waiting: "正在等待 App Store", count: "{n} 张贴纸", useFrame: "使用此框", inUse: "使用中", noFrame: "无边框",
  proNote: "Pro 包含所有贴纸包。头像框需单独购买。认证标记不可购买。",
  signIn: "请先登录，以便您的购买在所有设备上可用。", myStickers: "您的高级贴纸", open: "贴纸商店",
  packs: {
    "ramadan-nights": ["斋月之夜", "新月、灯笼与封斋饭的宁静。"],
    haramain: ["两圣寺", "天房、绿色圆顶以及麦加和麦地那的宣礼塔。"],
    "calligraphy-gold": ["金色书法", "以金色书法书写的赞念之词。"],
    "garden-blossoms": ["花园之花", "来自您学习花园的花朵、椰枣树和果实。"],
    "eid-lanterns": ["节日灯笼", "为两个节日准备的灯笼、星星和祝福。"],
  },
  frames: { emerald: "翡翠", "gold-arabesque": "金色阿拉伯花纹", "night-sky": "夜空", "haramain-arch": "两圣寺拱门" },
};

const ALL = { en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh };
export const cosmeticsText = (lang: string): CosmeticsText => pick(ALL, lang);
export function useCosmeticsText(): CosmeticsText {
  const { lang } = useLang();
  return cosmeticsText(lang);
}
export const fillN = (s: string, n: number | string) => s.replace("{n}", String(n));
