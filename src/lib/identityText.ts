// Texts of the identity step (onboarding) and the identity setting (profile): brother/sister and age band. One table
// for app and website (the app gets it through mobile/scripts/sync-web.mjs as src/web/identityText.ts). Polite address
// in every language; missing keys fall back to English.
import type { AgeBand } from "./identity";

export type IdKey =
  | "kicker" | "title" | "lead" | "brother" | "sister" | "none" | "ageTitle" | "privacy" | "next" | "skip" | "reply" | "replySister"
  | "tradTitle" | "tradLead" | "tradSunni" | "tradShia" | "tradBoth" | "tradPrivacy" | "tradOther" | "tradReview"
  | "settingsTitle" | "settingsLead" | "saved" | "postureTitle" | "postureLead" | "standing" | "sitting" | "chair" | "lying" | "posturePrivacy" | "u13" | "13-15" | "16-17" | "18-24" | "25-39" | "40-59" | "60+";

const BANDS_NUM: Record<Exclude<AgeBand, "u13">, string> = { "13-15": "13–15", "16-17": "16–17", "18-24": "18–24", "25-39": "25–39", "40-59": "40–59", "60+": "60+" };
type Table = Partial<Record<IdKey, string>>;

const T: Record<string, Table> = {
  de: {
    postureTitle: "Können Sie im Stehen beten?", postureLead: "Damit der Gebetstrainer Ihnen die passende Form zeigt. Freiwillig.", standing: "Ja", sitting: "Nur im Sitzen", chair: "Auf einem Stuhl", lying: "Liegend",
    posturePrivacy: "Diese Angabe bleibt nur auf diesem Gerät. Sie wird nicht mit Ihrem Konto abgeglichen und nicht an einen Server oder eine KI gesendet.",
    kicker: "Über Sie", title: "Bruder oder Schwester?", lead: "So können wir Sie passend ansprechen und Ihnen Inhalte zeigen, die für Sie wichtig sind. Beides ist freiwillig.",
    brother: "Bruder", sister: "Schwester", none: "Keine Angabe", ageTitle: "Ihr Alter", u13: "unter 13",
    privacy: "Wir fragen nur eine Altersgruppe, kein Geburtsdatum. Die Angaben dienen nur der Anrede und dem Lerntempo, nie der Werbung oder dem Tracking. Sie können sie jederzeit im Profil ändern.",
    next: "Weiter", skip: "Überspringen", reply: "Danke. Ihr Weg passt sich daran an, und Sie können es jederzeit ändern.",
    replySister: "Danke. Unter Entdecken finden Sie jetzt auch den Bereich „Für Schwestern“: wie Ihr Lernen an allen Tagen weitergeht.",
    settingsTitle: "Anrede und Alter", settingsLead: "Freiwillig. Nur für die Anrede, das Lerntempo und passende Inhalte.", saved: "Gespeichert",
    tradTitle: "Welcher Tradition folgen Sie?", tradSunni: "Sunnitisch", tradShia: "Schiitisch (Dschaʿfari / Zwölfer)", tradBoth: "Beides zeigen",
    tradLead: "Danach richten sich Gebets- und Wudu-Anleitung, Gebetszeiten-Methode, der islamische Kalender mit seinen Gedenk- und Festtagen, die Hadith-Sammlungen und die Reihenfolge der Kapitel. Jede Seite lässt sich trotzdem einzeln umstellen.",
    tradPrivacy: "Diese Angabe bleibt nur auf diesem Gerät. Sie wird nicht mit Ihrem Konto abgeglichen und nicht an einen Server oder eine KI gesendet.",
    tradOther: "Andere Rechtsschulen", tradReview: "Inhalt wird von Gelehrten geprüft.",
  },
  en: {
    postureTitle: "Can you pray standing?", postureLead: "So the prayer trainer shows you the right form. Optional.", standing: "Yes", sitting: "Only sitting", chair: "On a chair", lying: "Lying down",
    posturePrivacy: "This stays on this device only. It is not synced with your account and never sent to a server or an AI.",
    kicker: "About you", title: "Brother or sister?", lead: "So we can address you properly and show you what matters to you. Both answers are optional.",
    brother: "Brother", sister: "Sister", none: "Prefer not to say", ageTitle: "Your age", u13: "under 13",
    privacy: "We only ask for an age group, never a date of birth. It is used only for how we address you and for your learning pace, never for advertising or tracking. You can change it in your profile at any time.",
    next: "Continue", skip: "Skip", reply: "Thank you. Your path adapts to this, and you can change it at any time.",
    replySister: "Thank you. In Discover you will now also find \"For sisters\": how your learning continues on every day.",
    settingsTitle: "Address and age", settingsLead: "Optional. Used only for how we address you, your learning pace and fitting content.", saved: "Saved",
    tradTitle: "Which tradition do you follow?", tradSunni: "Sunni", tradShia: "Shia (Jaʿfari / Twelver)", tradBoth: "Show both",
    tradLead: "This sets the prayer and wudu guides, the prayer-time method, the Islamic calendar with its days of remembrance and celebration, the hadith collections and the order of the chapters. Every page can still be switched on its own.",
    tradPrivacy: "This stays on this device only. It is not synced with your account and never sent to a server or an AI.",
    tradOther: "Other schools of law", tradReview: "Content is being reviewed by scholars.",
  },
  ar: {
    postureTitle: "هل تستطيعون الصلاة قيامًا؟", postureLead: "ليعرض لكم مدرّب الصلاة الهيئة المناسبة. اختياري.", standing: "نعم", sitting: "جلوسًا فقط", chair: "على كرسي", lying: "مستلقيًا",
    posturePrivacy: "تبقى هذه المعلومة على هذا الجهاز فقط، ولا تُزامَن مع حسابكم ولا تُرسَل إلى خادم أو ذكاء اصطناعي.",
    kicker: "عنكم", title: "أخ أم أخت؟", lead: "لنخاطبكم بما يليق ونعرض لكم ما يهمّكم. الإجابتان اختياريتان.",
    brother: "أخ", sister: "أخت", none: "أفضّل عدم الإجابة", ageTitle: "عمركم", u13: "أقل من 13",
    privacy: "نسأل عن الفئة العمرية فقط، لا عن تاريخ الميلاد. تُستخدم هذه المعلومات للمخاطبة وسرعة التعلّم فقط، ولا تُستخدم أبدًا للإعلانات أو التتبّع. يمكنكم تغييرها في الملف الشخصي في أي وقت.",
    next: "متابعة", skip: "تخطٍّ", reply: "شكرًا لكم. يتكيّف مساركم مع ذلك، ويمكنكم تغييره في أي وقت.",
    replySister: "شكرًا لكم. ستجدون الآن في «اكتشف» قسم «للأخوات»: كيف يستمر تعلّمكِ في كل الأيام.",
    settingsTitle: "المخاطبة والعمر", settingsLead: "اختياري. للمخاطبة وسرعة التعلّم والمحتوى المناسب فقط.", saved: "تم الحفظ",
  },
  tr: {
    postureTitle: "Ayakta namaz kılabiliyor musunuz?", postureLead: "Namaz eğitmeninin size uygun şekli göstermesi için. İsteğe bağlı.", standing: "Evet", sitting: "Yalnızca oturarak", chair: "Sandalyede", lying: "Uzanarak",
    posturePrivacy: "Bu bilgi yalnızca bu cihazda kalır. Hesabınızla eşitlenmez, sunucuya veya yapay zekâya gönderilmez.",
    kicker: "Hakkınızda", title: "Erkek kardeş mi, kız kardeş mi?", lead: "Size uygun şekilde hitap edebilmemiz ve sizin için önemli içerikleri gösterebilmemiz için. İki cevap da isteğe bağlıdır.",
    brother: "Erkek kardeş", sister: "Kız kardeş", none: "Belirtmek istemiyorum", ageTitle: "Yaşınız", u13: "13 yaş altı",
    privacy: "Doğum tarihi değil, yalnızca bir yaş grubu soruyoruz. Bilgiler yalnızca hitap ve öğrenme hızınız için kullanılır, asla reklam veya takip için değil. Profilinizden istediğiniz zaman değiştirebilirsiniz.",
    next: "Devam", skip: "Atla", reply: "Teşekkür ederiz. Yolunuz buna göre uyarlanır; istediğiniz zaman değiştirebilirsiniz.",
    replySister: "Teşekkür ederiz. Keşfet bölümünde artık \"Hanım kardeşlerimiz için\" bölümünü de bulabilirsiniz: öğrenmeniz her gün nasıl devam eder.",
    settingsTitle: "Hitap ve yaş", settingsLead: "İsteğe bağlı. Yalnızca hitap, öğrenme hızı ve uygun içerikler için.", saved: "Kaydedildi",
  },
  ur: {
    postureTitle: "کیا آپ کھڑے ہو کر نماز پڑھ سکتے ہیں؟", postureLead: "تاکہ نماز ٹرینر آپ کو مناسب طریقہ دکھائے۔ اختیاری۔", standing: "جی ہاں", sitting: "صرف بیٹھ کر", chair: "کرسی پر", lying: "لیٹ کر",
    posturePrivacy: "یہ معلومات صرف اسی ڈیوائس پر رہتی ہے۔ نہ آپ کے اکاؤنٹ سے ہم آہنگ ہوتی ہے، نہ کسی سرور یا اے آئی کو بھیجی جاتی ہے۔",
    kicker: "آپ کے بارے میں", title: "بھائی یا بہن؟", lead: "تاکہ ہم آپ کو مناسب انداز میں مخاطب کر سکیں اور آپ کے لیے اہم مواد دکھا سکیں۔ دونوں جواب اختیاری ہیں۔",
    brother: "بھائی", sister: "بہن", none: "بتانا نہیں چاہتے", ageTitle: "آپ کی عمر", u13: "13 سے کم",
    privacy: "ہم صرف عمر کا گروپ پوچھتے ہیں، تاریخِ پیدائش نہیں۔ یہ معلومات صرف خطاب اور سیکھنے کی رفتار کے لیے ہیں، کبھی اشتہار یا ٹریکنگ کے لیے نہیں۔ آپ انہیں پروفائل میں کسی بھی وقت بدل سکتے ہیں۔",
    next: "آگے", skip: "چھوڑیں", reply: "شکریہ۔ آپ کا راستہ اسی کے مطابق ڈھل جاتا ہے، اور آپ اسے کسی بھی وقت بدل سکتے ہیں۔",
    replySister: "شکریہ۔ اب «دریافت کریں» میں «بہنوں کے لیے» حصہ بھی ہے: آپ کا سیکھنا ہر دن کیسے جاری رہتا ہے۔",
    settingsTitle: "خطاب اور عمر", settingsLead: "اختیاری۔ صرف خطاب، سیکھنے کی رفتار اور مناسب مواد کے لیے۔", saved: "محفوظ ہو گیا",
  },
  fa: {
    postureTitle: "آیا می‌توانید ایستاده نماز بخوانید؟", postureLead: "تا مربی نماز شکل مناسب را به شما نشان دهد. اختیاری.", standing: "بله", sitting: "فقط نشسته", chair: "روی صندلی", lying: "خوابیده",
    posturePrivacy: "این اطلاعات فقط روی همین دستگاه می‌ماند؛ با حساب شما همگام نمی‌شود و به هیچ سرور یا هوش مصنوعی فرستاده نمی‌شود.",
    kicker: "درباره شما", title: "برادر یا خواهر؟", lead: "تا شما را به‌درستی خطاب کنیم و آنچه برایتان مهم است نشان دهیم. هر دو پاسخ اختیاری است.",
    brother: "برادر", sister: "خواهر", none: "ترجیح می‌دهم نگویم", ageTitle: "سن شما", u13: "زیر ۱۳",
    privacy: "فقط گروه سنی را می‌پرسیم، نه تاریخ تولد. این اطلاعات فقط برای خطاب و سرعت یادگیری است و هرگز برای تبلیغات یا ردیابی به کار نمی‌رود. هر زمان می‌توانید آن را در نمایه تغییر دهید.",
    next: "ادامه", skip: "رد شدن", reply: "سپاس. مسیر شما با این تنظیم می‌شود و هر زمان می‌توانید آن را تغییر دهید.",
    replySister: "سپاس. اکنون در «کاوش» بخش «برای خواهران» را هم می‌یابید: اینکه یادگیری شما در همه روزها چگونه ادامه می‌یابد.",
    settingsTitle: "خطاب و سن", settingsLead: "اختیاری. فقط برای خطاب، سرعت یادگیری و محتوای مناسب.", saved: "ذخیره شد",
  },
  ps: {
    postureTitle: "ایا تاسو ودرېدلي لمونځ کولی شئ؟", postureLead: "څو د لمانځه روزونکی تاسو ته مناسبه بڼه وښيي. اختیاري.", standing: "هو", sitting: "یوازې ناست", chair: "په چوکۍ", lying: "پرېوتي",
    posturePrivacy: "دا معلومات یوازې په همدې وسیله پاتې کېږي؛ ستاسو له حساب سره نه همغږي کېږي او هېڅ سرور یا مصنوعي ځيرکتیا ته نه لېږل کېږي.",
    kicker: "ستاسو په اړه", title: "ورور که خور؟", lead: "څو تاسو ته په مناسب ډول خطاب وکړو او هغه څه درته وښیو چې ستاسو لپاره مهم دي. دواړه ځوابونه اختیاري دي.",
    brother: "ورور", sister: "خور", none: "نه غواړم ووایم", ageTitle: "ستاسو عمر", u13: "له ۱۳ کم",
    privacy: "موږ یوازې د عمر ډله پوښتو، د زیږون نېټه نه. دا معلومات یوازې د خطاب او زده کړې د سرعت لپاره دي، هېڅکله د اعلان یا تعقیب لپاره نه. تاسو یې هر وخت په پروفایل کې بدلولی شئ.",
    next: "مخکې", skip: "پرېښودل", reply: "مننه. ستاسو لاره له دې سره برابرېږي، او تاسو یې هر وخت بدلولی شئ.",
    replySister: "مننه. اوس په «کشف» کې د «خویندو لپاره» برخه هم شته: ستاسو زده کړه په ټولو ورځو کې څنګه دوام کوي.",
    settingsTitle: "خطاب او عمر", settingsLead: "اختیاري. یوازې د خطاب، د زده کړې سرعت او مناسبې منځپانګې لپاره.", saved: "خوندي شو",
  },
  fr: {
    postureTitle: "Pouvez-vous prier debout ?", postureLead: "Pour que l'entraîneur de prière vous montre la forme qui vous convient. Facultatif.", standing: "Oui", sitting: "Seulement assis", chair: "Sur une chaise", lying: "Allongé",
    posturePrivacy: "Cette information reste uniquement sur cet appareil. Elle n'est pas synchronisée avec votre compte et n'est jamais envoyée à un serveur ni à une IA.",
    kicker: "À propos de vous", title: "Frère ou sœur ?", lead: "Pour nous adresser à vous comme il convient et vous montrer ce qui compte pour vous. Les deux réponses sont facultatives.",
    brother: "Frère", sister: "Sœur", none: "Je préfère ne pas répondre", ageTitle: "Votre âge", u13: "moins de 13 ans",
    privacy: "Nous demandons seulement une tranche d'âge, jamais une date de naissance. Elle sert uniquement à la façon de vous adresser et à votre rythme d'apprentissage, jamais à la publicité ni au suivi. Vous pouvez la modifier à tout moment dans votre profil.",
    next: "Continuer", skip: "Passer", reply: "Merci. Votre parcours s'y adapte, et vous pouvez le modifier à tout moment.",
    replySister: "Merci. Dans Découvrir, vous trouverez désormais aussi « Pour les sœurs » : comment votre apprentissage continue chaque jour.",
    settingsTitle: "Adresse et âge", settingsLead: "Facultatif. Uniquement pour la façon de vous adresser, votre rythme et des contenus adaptés.", saved: "Enregistré",
  },
  es: {
    postureTitle: "¿Puede rezar de pie?", postureLead: "Para que el entrenador de oración le muestre la forma adecuada. Opcional.", standing: "Sí", sitting: "Solo sentado", chair: "En una silla", lying: "Acostado",
    posturePrivacy: "Este dato queda solo en este dispositivo. No se sincroniza con su cuenta ni se envía nunca a un servidor ni a una IA.",
    kicker: "Sobre usted", title: "¿Hermano o hermana?", lead: "Para dirigirnos a usted de forma adecuada y mostrarle lo que le importa. Ambas respuestas son opcionales.",
    brother: "Hermano", sister: "Hermana", none: "Prefiero no decirlo", ageTitle: "Su edad", u13: "menos de 13",
    privacy: "Solo preguntamos un grupo de edad, nunca una fecha de nacimiento. Se usa solo para dirigirnos a usted y para su ritmo de aprendizaje, nunca para publicidad ni seguimiento. Puede cambiarlo en su perfil cuando quiera.",
    next: "Continuar", skip: "Omitir", reply: "Gracias. Su camino se adapta a ello y puede cambiarlo cuando quiera.",
    replySister: "Gracias. En Descubrir encontrará ahora también «Para hermanas»: cómo su aprendizaje continúa todos los días.",
    settingsTitle: "Trato y edad", settingsLead: "Opcional. Solo para el trato, su ritmo de aprendizaje y contenidos adecuados.", saved: "Guardado",
  },
  id: {
    postureTitle: "Apakah Anda dapat shalat sambil berdiri?", postureLead: "Agar pelatih shalat menampilkan cara yang sesuai untuk Anda. Opsional.", standing: "Ya", sitting: "Hanya duduk", chair: "Di kursi", lying: "Berbaring",
    posturePrivacy: "Data ini hanya tersimpan di perangkat ini. Tidak disinkronkan dengan akun Anda dan tidak pernah dikirim ke server atau AI.",
    kicker: "Tentang Anda", title: "Saudara atau saudari?", lead: "Agar kami dapat menyapa Anda dengan tepat dan menampilkan hal yang penting bagi Anda. Kedua jawaban bersifat opsional.",
    brother: "Saudara (laki-laki)", sister: "Saudari (perempuan)", none: "Tidak ingin menyebutkan", ageTitle: "Usia Anda", u13: "di bawah 13",
    privacy: "Kami hanya menanyakan kelompok usia, bukan tanggal lahir. Data ini hanya untuk sapaan dan kecepatan belajar Anda, tidak pernah untuk iklan atau pelacakan. Anda dapat mengubahnya kapan saja di profil.",
    next: "Lanjut", skip: "Lewati", reply: "Terima kasih. Jalur Anda menyesuaikan, dan Anda dapat mengubahnya kapan saja.",
    replySister: "Terima kasih. Di Jelajahi kini ada juga bagian \"Untuk Saudari\": bagaimana belajar Anda berlanjut setiap hari.",
    settingsTitle: "Sapaan dan usia", settingsLead: "Opsional. Hanya untuk sapaan, kecepatan belajar, dan konten yang sesuai.", saved: "Tersimpan",
  },
  ms: {
    postureTitle: "Bolehkah anda solat secara berdiri?", postureLead: "Supaya jurulatih solat menunjukkan cara yang sesuai untuk anda. Pilihan.", standing: "Ya", sitting: "Duduk sahaja", chair: "Di atas kerusi", lying: "Berbaring",
    posturePrivacy: "Maklumat ini kekal di peranti ini sahaja. Ia tidak diselaraskan dengan akaun anda dan tidak sekali-kali dihantar ke pelayan atau AI.",
    kicker: "Tentang anda", title: "Saudara atau saudari?", lead: "Supaya kami dapat menyapa anda dengan sewajarnya dan menunjukkan perkara yang penting bagi anda. Kedua-dua jawapan adalah pilihan.",
    brother: "Saudara (lelaki)", sister: "Saudari (perempuan)", none: "Tidak mahu menyatakan", ageTitle: "Umur anda", u13: "bawah 13",
    privacy: "Kami hanya bertanya kumpulan umur, bukan tarikh lahir. Ia hanya digunakan untuk sapaan dan kadar pembelajaran anda, tidak sekali-kali untuk iklan atau penjejakan. Anda boleh mengubahnya bila-bila masa dalam profil.",
    next: "Teruskan", skip: "Langkau", reply: "Terima kasih. Laluan anda menyesuaikan diri, dan anda boleh mengubahnya bila-bila masa.",
    replySister: "Terima kasih. Dalam Teroka kini ada juga bahagian \"Untuk Saudari\": bagaimana pembelajaran anda berterusan setiap hari.",
    settingsTitle: "Sapaan dan umur", settingsLead: "Pilihan. Hanya untuk sapaan, kadar pembelajaran dan kandungan yang sesuai.", saved: "Disimpan",
  },
  bn: {
    postureTitle: "আপনি কি দাঁড়িয়ে নামাজ পড়তে পারেন?", postureLead: "যাতে নামাজ প্রশিক্ষক আপনাকে উপযুক্ত পদ্ধতি দেখায়। ঐচ্ছিক।", standing: "হ্যাঁ", sitting: "শুধু বসে", chair: "চেয়ারে", lying: "শুয়ে",
    posturePrivacy: "এই তথ্য শুধু এই ডিভাইসেই থাকে। এটি আপনার অ্যাকাউন্টের সাথে সিঙ্ক হয় না এবং কখনো কোনো সার্ভার বা এআই-তে পাঠানো হয় না।",
    kicker: "আপনার সম্পর্কে", title: "ভাই না বোন?", lead: "যাতে আমরা আপনাকে যথাযথভাবে সম্বোধন করতে পারি এবং আপনার জন্য গুরুত্বপূর্ণ বিষয় দেখাতে পারি। দুটি উত্তরই ঐচ্ছিক।",
    brother: "ভাই", sister: "বোন", none: "বলতে চাই না", ageTitle: "আপনার বয়স", u13: "১৩-এর কম",
    privacy: "আমরা শুধু বয়সের গোষ্ঠী জিজ্ঞেস করি, জন্মতারিখ নয়। এটি শুধু সম্বোধন ও আপনার শেখার গতির জন্য, কখনো বিজ্ঞাপন বা ট্র্যাকিংয়ের জন্য নয়। আপনি প্রোফাইলে যেকোনো সময় এটি বদলাতে পারেন।",
    next: "এগিয়ে যান", skip: "এড়িয়ে যান", reply: "ধন্যবাদ। আপনার পথ সেই অনুযায়ী মানিয়ে নেয়, এবং আপনি যেকোনো সময় এটি বদলাতে পারেন।",
    replySister: "ধন্যবাদ। «আবিষ্কার» অংশে এখন «বোনদের জন্য» বিভাগও আছে: প্রতিদিন আপনার শেখা কীভাবে চলতে থাকে।",
    settingsTitle: "সম্বোধন ও বয়স", settingsLead: "ঐচ্ছিক। শুধু সম্বোধন, শেখার গতি ও উপযুক্ত বিষয়বস্তুর জন্য।", saved: "সংরক্ষিত",
  },
  ru: {
    postureTitle: "Можете ли вы молиться стоя?", postureLead: "Чтобы тренажёр молитвы показывал подходящую вам форму. Необязательно.", standing: "Да", sitting: "Только сидя", chair: "На стуле", lying: "Лёжа",
    posturePrivacy: "Эти данные остаются только на этом устройстве. Они не синхронизируются с вашим аккаунтом и никогда не отправляются на сервер или ИИ.",
    kicker: "О вас", title: "Брат или сестра?", lead: "Чтобы мы могли правильно к вам обращаться и показывать то, что для вас важно. Оба ответа необязательны.",
    brother: "Брат", sister: "Сестра", none: "Предпочитаю не указывать", ageTitle: "Ваш возраст", u13: "до 13",
    privacy: "Мы спрашиваем только возрастную группу, а не дату рождения. Она нужна лишь для обращения и темпа обучения, никогда для рекламы или отслеживания. Вы можете изменить её в профиле в любое время.",
    next: "Далее", skip: "Пропустить", reply: "Спасибо. Ваш путь подстроится под это, и вы можете изменить это в любое время.",
    replySister: "Спасибо. В разделе «Обзор» теперь есть и раздел «Для сестёр»: как ваше обучение продолжается в любой день.",
    settingsTitle: "Обращение и возраст", settingsLead: "Необязательно. Только для обращения, темпа обучения и подходящих материалов.", saved: "Сохранено",
  },
  zh: {
    postureTitle: "您能站着礼拜吗？", postureLead: "以便礼拜训练为您展示合适的方式。自愿填写。", standing: "能", sitting: "只能坐着", chair: "坐在椅子上", lying: "躺着",
    posturePrivacy: "此信息只保存在本设备上，不会与您的账户同步，也绝不会发送到服务器或人工智能。",
    kicker: "关于您", title: "兄弟还是姐妹？", lead: "以便我们恰当地称呼您，并为您展示重要的内容。两项回答均为自愿。",
    brother: "兄弟", sister: "姐妹", none: "不愿透露", ageTitle: "您的年龄", u13: "13岁以下",
    privacy: "我们只询问年龄段，从不询问出生日期。它只用于称呼和您的学习节奏，绝不用于广告或追踪。您可以随时在个人资料中更改。",
    next: "继续", skip: "跳过", reply: "谢谢您。您的学习路径会随之调整，您可以随时更改。",
    replySister: "谢谢您。在「发现」中您现在还能找到「致姐妹」：您的学习如何在每一天继续。",
    settingsTitle: "称呼与年龄", settingsLead: "自愿填写。仅用于称呼、学习节奏和合适的内容。", saved: "已保存",
  },
};

/** the text of one key in this language (English when missing); the age bands are numbers in every language */
export function idText(lang: string, key: IdKey): string {
  if (key in BANDS_NUM) return BANDS_NUM[key as keyof typeof BANDS_NUM];
  return T[lang]?.[key] ?? T.en[key] ?? key;
}

/** "Onboarding neu starten" (profile settings): reopens the funnel with the current answers, deletes nothing */
const RESTART: Record<string, string> = { de: "Onboarding neu starten", en: "Restart onboarding", ar: "إعادة بدء التعريف", tr: "Tanıtımı yeniden başlat", ur: "آن بورڈنگ دوبارہ شروع کریں", fa: "شروع دوباره معرفی", ps: "پیلامه بیا پیل کړئ", fr: "Recommencer l'accueil", es: "Reiniciar la introducción", id: "Mulai ulang pengenalan", ms: "Mulakan semula pengenalan", bn: "অনবোর্ডিং আবার শুরু করুন", ru: "Пройти знакомство заново", zh: "重新开始引导" };
export const restartLabel = (lang: string) => RESTART[lang] ?? RESTART.en;
