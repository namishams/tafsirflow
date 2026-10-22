// Fixed replies of the tutor that need no model (cheaper, and always the same careful wording), in all 14 languages.
// German in the polite Sie form.

export type TutorMsg = { greeting: string; offTopic: string; political: string; harmful: string; crisis: string; notFound: string; scholar: string; flagged: string };

const M: Record<string, TutorMsg> = {
  en: {
    greeting: "Wa ʿalaykum as-salām wa raḥmatullāh! I am {name}, your guide through the lessons of Quran Masterclass. Ask me about a verse, a lesson, tajweed or the Shams Method – I answer from our reviewed lessons and show you the sources.",
    offTopic: "Forgive me – I can only help with the Quran, Islam and learning in this app. Is there something about a verse or a lesson I can explain for you?",
    political: "I stay away from politics and from disputes between groups – that is not my role. I am happy to explain a verse, a lesson or a question of learning.",
    harmful: "I cannot answer this. Let us speak about the Quran and Islam with respect – I am glad to help with a lesson or a verse.",
    crisis: "I am sorry that you are going through this. Please speak to someone now: call your local emergency number (in the UAE 999, in the EU 112) or a crisis helpline in your country, and tell a person you trust. You are not alone – may Allah grant you ease.",
    notFound: "Allahu aʿlam – I could not find this in our reviewed lessons, and I do not want to tell you anything without a source. Please ask a qualified teacher or scholar. These pages may help:",
    scholar: "This is an overview of documented views, not a ruling (fatwa). For your own situation, please ask a qualified scholar you trust.",
    flagged: "I cannot show this answer. Please ask your question in a different way.",
  },
  de: {
    greeting: "Wa ʿalaykum as-salām wa raḥmatullāh! Ich bin {name}, Ihre Begleitung durch die Lektionen von Quran Masterclass. Fragen Sie mich zu einem Vers, einer Lektion, zum Tajwīd oder zur Shams-Methode – ich antworte aus unseren geprüften Lektionen und zeige Ihnen die Quellen.",
    offTopic: "Verzeihen Sie – ich helfe nur bei Fragen zum Koran, zum Islam und zum Lernen in dieser App. Kann ich Ihnen einen Vers oder eine Lektion erklären?",
    political: "Politik und Streit zwischen Gruppen sind nicht meine Aufgabe. Gern erkläre ich Ihnen einen Vers, eine Lektion oder eine Frage zum Lernen.",
    harmful: "Darauf kann ich nicht antworten. Lassen Sie uns respektvoll über den Koran und den Islam sprechen – ich helfe Ihnen gern bei einer Lektion oder einem Vers.",
    crisis: "Es tut mir leid, dass Sie das gerade durchmachen. Bitte sprechen Sie jetzt mit jemandem: Rufen Sie den Notruf an (in der EU 112, in Deutschland auch die Telefonseelsorge 0800 111 0 111) und erzählen Sie es einem Menschen, dem Sie vertrauen. Sie sind nicht allein – möge Allah es Ihnen leicht machen.",
    notFound: "Allahu aʿlam – das habe ich in unseren geprüften Lektionen nicht gefunden, und ohne Quelle möchte ich Ihnen nichts sagen. Bitte fragen Sie eine qualifizierte Lehrkraft oder einen Gelehrten. Diese Seiten können helfen:",
    scholar: "Dies ist ein Überblick über belegte Ansichten, kein Rechtsurteil (Fatwa). Für Ihre eigene Situation fragen Sie bitte einen qualifizierten Gelehrten Ihres Vertrauens.",
    flagged: "Diese Antwort kann ich nicht anzeigen. Bitte stellen Sie Ihre Frage anders.",
  },
  ar: {
    greeting: "وعليكم السلام ورحمة الله! أنا {nameAr}، مرشدك في دروس Quran Masterclass. اسألني عن آية أو درس أو التجويد أو منهج شمس، وسأجيبك من دروسنا المراجَعة مع ذكر المصادر.",
    offTopic: "اعذرني، أستطيع المساعدة فقط في القرآن والإسلام والتعلّم في هذا التطبيق. هل أشرح لك آية أو درسًا؟",
    political: "أبتعد عن السياسة وعن الخلافات بين الجماعات، فليس هذا دوري. ويسعدني أن أشرح لك آية أو درسًا أو مسألة في التعلّم.",
    harmful: "لا أستطيع الإجابة عن هذا. لنتحدث عن القرآن والإسلام باحترام، ويسعدني أن أساعدك في درس أو آية.",
    crisis: "يؤسفني ما تمر به. أرجوك تحدّث مع أحد الآن: اتصل برقم الطوارئ في بلدك (في الإمارات 999) أو بخط المساندة النفسية، وأخبر شخصًا تثق به. لست وحدك، يسّر الله أمرك.",
    notFound: "الله أعلم، لم أجد هذا في دروسنا المراجَعة، ولا أريد أن أقول لك شيئًا بلا مصدر. يُرجى سؤال معلم أو عالم مؤهل. قد تفيدك هذه الصفحات:",
    scholar: "هذا عرض للأقوال الموثّقة وليس فتوى. وفي حالتك الخاصة يُرجى سؤال عالم مؤهل تثق به.",
    flagged: "لا أستطيع عرض هذه الإجابة. يُرجى طرح سؤالك بصيغة أخرى.",
  },
  tr: {
    greeting: "Ve aleyküm selâm ve rahmetullah! Ben {name}, Quran Masterclass derslerindeki rehberinizim. Bir âyet, bir ders, tecvid veya Shams Metodu hakkında sorun – incelenmiş derslerimizden, kaynaklarıyla yanıtlarım.",
    offTopic: "Kusura bakmayın – yalnızca Kur'an, İslam ve bu uygulamadaki öğrenme konusunda yardımcı olabilirim. Size bir âyet veya ders açıklayayım mı?",
    political: "Siyasetten ve gruplar arası tartışmalardan uzak dururum; bu benim görevim değil. Bir âyeti, dersi veya öğrenmeyle ilgili bir soruyu memnuniyetle açıklarım.",
    harmful: "Buna cevap veremem. Kur'an ve İslam hakkında saygıyla konuşalım – bir ders veya âyet konusunda seve seve yardım ederim.",
    crisis: "Bunu yaşadığınız için üzgünüm. Lütfen şimdi biriyle konuşun: ülkenizdeki acil durum numarasını (Türkiye'de 112) veya bir kriz hattını arayın ve güvendiğiniz birine anlatın. Yalnız değilsiniz – Allah kolaylık versin.",
    notFound: "Allahu a'lem – bunu incelenmiş derslerimizde bulamadım ve kaynaksız bir şey söylemek istemem. Lütfen yetkin bir hocaya veya âlime danışın. Şu sayfalar yardımcı olabilir:",
    scholar: "Bu, belgelenmiş görüşlerin bir özetidir, bir fetva değildir. Kendi durumunuz için lütfen güvendiğiniz yetkin bir âlime danışın.",
    flagged: "Bu cevabı gösteremiyorum. Lütfen sorunuzu farklı bir şekilde sorun.",
  },
  ur: {
    greeting: "وعلیکم السلام ورحمۃ اللہ! میں {nameAr} ہوں، Quran Masterclass کے اسباق میں آپ کا رہنما۔ کسی آیت، سبق، تجوید یا شمس طریقہ کے بارے میں پوچھیں – میں ہمارے جانچے ہوئے اسباق سے، حوالوں کے ساتھ جواب دوں گا۔",
    offTopic: "معذرت – میں صرف قرآن، اسلام اور اس ایپ میں سیکھنے کے بارے میں مدد کر سکتا ہوں۔ کیا میں آپ کو کوئی آیت یا سبق سمجھاؤں؟",
    political: "میں سیاست اور گروہوں کے جھگڑوں سے دور رہتا ہوں – یہ میرا کام نہیں۔ کسی آیت، سبق یا سیکھنے کے سوال کی وضاحت خوشی سے کروں گا۔",
    harmful: "میں اس کا جواب نہیں دے سکتا۔ آئیے قرآن اور اسلام کے بارے میں احترام سے بات کریں – کسی سبق یا آیت میں خوشی سے مدد کروں گا۔",
    crisis: "مجھے افسوس ہے کہ آپ اس سے گزر رہے ہیں۔ براہ کرم ابھی کسی سے بات کریں: اپنے ملک کے ایمرجنسی نمبر (پاکستان میں 1122) یا کسی ہیلپ لائن پر کال کریں اور کسی قابلِ اعتماد شخص کو بتائیں۔ آپ اکیلے نہیں – اللہ آسانی فرمائے۔",
    notFound: "اللہ اعلم – مجھے یہ ہمارے جانچے ہوئے اسباق میں نہیں ملا، اور میں بغیر حوالے کے کچھ نہیں کہنا چاہتا۔ براہ کرم کسی مستند استاد یا عالم سے پوچھیں۔ یہ صفحات مددگار ہو سکتے ہیں:",
    scholar: "یہ ثابت شدہ آراء کا خلاصہ ہے، فتویٰ نہیں۔ اپنی صورتِ حال کے لیے براہ کرم کسی قابلِ اعتماد مستند عالم سے پوچھیں۔",
    flagged: "میں یہ جواب نہیں دکھا سکتا۔ براہ کرم اپنا سوال کسی اور طرح پوچھیں۔",
  },
  fa: {
    greeting: "و علیکم السلام و رحمة الله! من {nameAr} هستم، راهنمای شما در درس‌های Quran Masterclass. درباره یک آیه، یک درس، تجوید یا روش شمس بپرسید – از درس‌های بازبینی‌شده ما و با ذکر منبع پاسخ می‌دهم.",
    offTopic: "پوزش می‌خواهم – فقط در موضوع قرآن، اسلام و یادگیری در این برنامه می‌توانم کمک کنم. آیا آیه یا درسی را برایتان توضیح دهم؟",
    political: "از سیاست و نزاع میان گروه‌ها دوری می‌کنم؛ این نقش من نیست. با کمال میل یک آیه، درس یا پرسش آموزشی را توضیح می‌دهم.",
    harmful: "نمی‌توانم به این پاسخ دهم. بیایید با احترام درباره قرآن و اسلام سخن بگوییم – با کمال میل در یک درس یا آیه کمک می‌کنم.",
    crisis: "متأسفم که این را تجربه می‌کنید. لطفاً همین حالا با کسی صحبت کنید: با شماره اضطراری کشورتان یا یک خط کمک‌رسانی تماس بگیرید و به فردی که به او اعتماد دارید بگویید. تنها نیستید – خداوند کارتان را آسان کند.",
    notFound: "الله اعلم – این را در درس‌های بازبینی‌شده ما نیافتم و نمی‌خواهم بدون منبع چیزی بگویم. لطفاً از یک معلم یا عالم صاحب‌صلاحیت بپرسید. این صفحه‌ها شاید کمک کنند:",
    scholar: "این مروری بر دیدگاه‌های مستند است، نه فتوا. برای وضعیت خودتان لطفاً از عالمی صاحب‌صلاحیت که به او اعتماد دارید بپرسید.",
    flagged: "نمی‌توانم این پاسخ را نشان دهم. لطفاً پرسش خود را به شکل دیگری مطرح کنید.",
  },
  ps: {
    greeting: "وعلیکم السلام ورحمة الله! زه {nameAr} یم، د Quran Masterclass په لوستونو کې ستاسو لارښود. د یوه آیت، لوست، تجوید یا د شمس طریقې په اړه وپوښتئ – زه زموږ له کتل شویو لوستونو څخه، له سرچینو سره ځواب درکوم.",
    offTopic: "بخښنه غواړم – زه یوازې د قرآن، اسلام او په دې اپ کې د زده کړې په اړه مرسته کولای شم. آیا یو آیت یا لوست درته تشریح کړم؟",
    political: "زه له سیاست او د ډلو له شخړو لرې پاتې کېږم؛ دا زما دنده نه ده. په خوښۍ سره یو آیت، لوست یا د زده کړې پوښتنه تشریح کوم.",
    harmful: "زه دې ته ځواب نشم ورکولای. راځئ چې د قرآن او اسلام په اړه په درناوي خبرې وکړو – په لوست یا آیت کې په خوښۍ مرسته کوم.",
    crisis: "خواشینی یم چې له دې حالت سره مخ یاست. مهرباني وکړئ همدا اوس له چا سره خبرې وکړئ: د خپل هېواد بېړني شمېرې یا د مرستې کرښې ته زنګ ووهئ او یو باوري کس ته ووایاست. تاسو یوازې نه یاست – الله دې اسانتیا درکړي.",
    notFound: "الله اعلم – دا مې زموږ په کتل شویو لوستونو کې ونه موند، او نه غواړم بې سرچینې څه ووایم. مهرباني وکړئ له یوه وړ استاد یا عالم څخه وپوښتئ. دا پاڼې ښايي مرسته وکړي:",
    scholar: "دا د ثابتو نظرونو لنډیز دی، فتوا نه ده. د خپل حالت لپاره مهرباني وکړئ له یوه باوري وړ عالم څخه وپوښتئ.",
    flagged: "زه دا ځواب نشم ښودلای. مهرباني وکړئ خپله پوښتنه په بل ډول وکړئ.",
  },
  fr: {
    greeting: "Wa ʿalaykum as-salām wa raḥmatullāh ! Je suis {name}, votre guide dans les leçons de Quran Masterclass. Posez-moi une question sur un verset, une leçon, le tajwīd ou la Méthode Shams – je réponds à partir de nos leçons vérifiées, avec les sources.",
    offTopic: "Pardonnez-moi – je ne peux aider que sur le Coran, l'islam et l'apprentissage dans cette application. Puis-je vous expliquer un verset ou une leçon ?",
    political: "Je me tiens à l'écart de la politique et des querelles entre groupes – ce n'est pas mon rôle. Je vous explique volontiers un verset, une leçon ou une question d'apprentissage.",
    harmful: "Je ne peux pas répondre à cela. Parlons du Coran et de l'islam avec respect – je vous aide volontiers pour une leçon ou un verset.",
    crisis: "Je suis désolé que vous traversiez cela. Parlez à quelqu'un maintenant : appelez le numéro d'urgence de votre pays (112 dans l'UE, 3114 en France) et confiez-vous à une personne de confiance. Vous n'êtes pas seul – qu'Allah vous facilite.",
    notFound: "Allahu aʿlam – je n'ai pas trouvé cela dans nos leçons vérifiées, et je ne veux rien vous dire sans source. Veuillez interroger un enseignant ou un savant qualifié. Ces pages peuvent aider :",
    scholar: "Ceci est un aperçu des avis documentés, pas un avis juridique (fatwa). Pour votre propre situation, consultez un savant qualifié en qui vous avez confiance.",
    flagged: "Je ne peux pas afficher cette réponse. Veuillez reformuler votre question.",
  },
  es: {
    greeting: "¡Wa ʿalaykum as-salām wa raḥmatullāh! Soy {name}, su guía en las lecciones de Quran Masterclass. Pregúnteme sobre un versículo, una lección, el tajwīd o el Método Shams: respondo con nuestras lecciones revisadas y le muestro las fuentes.",
    offTopic: "Disculpe: solo puedo ayudar con el Corán, el islam y el aprendizaje en esta aplicación. ¿Le explico un versículo o una lección?",
    political: "Me mantengo al margen de la política y de las disputas entre grupos; no es mi función. Con gusto le explico un versículo, una lección o una duda de aprendizaje.",
    harmful: "No puedo responder a esto. Hablemos del Corán y del islam con respeto; con gusto le ayudo con una lección o un versículo.",
    crisis: "Siento que esté pasando por esto. Hable con alguien ahora: llame al número de emergencias de su país (112 en la UE, 024 en España) y cuénteselo a una persona de confianza. No está solo; que Allah le facilite.",
    notFound: "Allahu aʿlam: no he encontrado esto en nuestras lecciones revisadas y no quiero decirle nada sin fuente. Consulte a un maestro o sabio cualificado. Estas páginas pueden ayudar:",
    scholar: "Esto es un resumen de opiniones documentadas, no un dictamen (fatwa). Para su situación personal, consulte a un sabio cualificado de su confianza.",
    flagged: "No puedo mostrar esta respuesta. Formule su pregunta de otra manera.",
  },
  id: {
    greeting: "Wa'alaikumussalam warahmatullah! Saya {name}, pemandu Anda dalam pelajaran Quran Masterclass. Tanyakan tentang ayat, pelajaran, tajwid, atau Metode Shams – saya menjawab dari pelajaran kami yang telah ditinjau, beserta sumbernya.",
    offTopic: "Mohon maaf – saya hanya dapat membantu tentang Al-Qur'an, Islam, dan belajar di aplikasi ini. Bolehkah saya menjelaskan sebuah ayat atau pelajaran?",
    political: "Saya menjauhi politik dan perselisihan antarkelompok – itu bukan peran saya. Dengan senang hati saya jelaskan ayat, pelajaran, atau pertanyaan belajar.",
    harmful: "Saya tidak dapat menjawab ini. Mari berbicara tentang Al-Qur'an dan Islam dengan hormat – saya senang membantu dengan pelajaran atau ayat.",
    crisis: "Saya turut prihatin atas apa yang Anda alami. Mohon bicaralah dengan seseorang sekarang: hubungi nomor darurat di negara Anda (di Indonesia 112 atau 119) dan ceritakan kepada orang yang Anda percaya. Anda tidak sendiri – semoga Allah memudahkan.",
    notFound: "Allahu a'lam – saya tidak menemukannya dalam pelajaran kami yang telah ditinjau, dan saya tidak ingin mengatakan apa pun tanpa sumber. Silakan bertanya kepada guru atau ulama yang berkompeten. Halaman berikut mungkin membantu:",
    scholar: "Ini adalah ringkasan pendapat yang terdokumentasi, bukan fatwa. Untuk keadaan Anda sendiri, silakan bertanya kepada ulama berkompeten yang Anda percayai.",
    flagged: "Saya tidak dapat menampilkan jawaban ini. Silakan ajukan pertanyaan dengan cara lain.",
  },
  ms: {
    greeting: "Waalaikumussalam warahmatullah! Saya {name}, pembimbing anda dalam pelajaran Quran Masterclass. Tanyakan tentang ayat, pelajaran, tajwid atau Kaedah Shams – saya menjawab daripada pelajaran kami yang telah disemak, berserta sumbernya.",
    offTopic: "Maaf – saya hanya boleh membantu tentang al-Quran, Islam dan pembelajaran dalam aplikasi ini. Bolehkah saya terangkan satu ayat atau pelajaran?",
    political: "Saya menjauhi politik dan pertelingkahan antara kumpulan – itu bukan peranan saya. Saya gembira menerangkan ayat, pelajaran atau soalan pembelajaran.",
    harmful: "Saya tidak dapat menjawab ini. Marilah kita bercakap tentang al-Quran dan Islam dengan hormat – saya gembira membantu dengan pelajaran atau ayat.",
    crisis: "Saya bersimpati dengan apa yang anda lalui. Sila bercakap dengan seseorang sekarang: hubungi nombor kecemasan di negara anda (di Malaysia 999 atau Talian Kasih 15999) dan beritahu orang yang anda percayai. Anda tidak keseorangan – semoga Allah memudahkan.",
    notFound: "Allahu a'lam – saya tidak menemuinya dalam pelajaran kami yang telah disemak, dan saya tidak mahu berkata apa-apa tanpa sumber. Sila bertanya kepada guru atau ulama yang berkelayakan. Halaman ini mungkin membantu:",
    scholar: "Ini ialah ringkasan pandangan yang didokumenkan, bukan fatwa. Untuk keadaan anda sendiri, sila bertanya kepada ulama berkelayakan yang anda percayai.",
    flagged: "Saya tidak dapat memaparkan jawapan ini. Sila tanya soalan anda dengan cara lain.",
  },
  bn: {
    greeting: "ওয়া আলাইকুমুস সালাম ওয়া রাহমাতুল্লাহ! আমি {name}, Quran Masterclass-এর পাঠে আপনার পথপ্রদর্শক। কোনো আয়াত, পাঠ, তাজবীদ বা শামস পদ্ধতি নিয়ে জিজ্ঞাসা করুন – আমি আমাদের যাচাই করা পাঠ থেকে, সূত্রসহ উত্তর দিই।",
    offTopic: "ক্ষমা করবেন – আমি শুধু কুরআন, ইসলাম ও এই অ্যাপে শেখার বিষয়ে সাহায্য করতে পারি। আমি কি আপনাকে কোনো আয়াত বা পাঠ বুঝিয়ে দেব?",
    political: "আমি রাজনীতি ও দলগুলোর বিবাদ থেকে দূরে থাকি – এটি আমার কাজ নয়। কোনো আয়াত, পাঠ বা শেখার প্রশ্ন আনন্দের সাথে ব্যাখ্যা করব।",
    harmful: "আমি এর উত্তর দিতে পারি না। আসুন সম্মানের সাথে কুরআন ও ইসলাম নিয়ে কথা বলি – কোনো পাঠ বা আয়াতে আনন্দের সাথে সাহায্য করব।",
    crisis: "আপনি এর মধ্য দিয়ে যাচ্ছেন জেনে আমি দুঃখিত। অনুগ্রহ করে এখনই কারো সাথে কথা বলুন: আপনার দেশের জরুরি নম্বরে (বাংলাদেশে 999) বা কোনো হেল্পলাইনে ফোন করুন এবং বিশ্বস্ত কাউকে জানান। আপনি একা নন – আল্লাহ সহজ করুন।",
    notFound: "আল্লাহু আলাম – আমাদের যাচাই করা পাঠে আমি এটি পাইনি, আর সূত্র ছাড়া আমি কিছু বলতে চাই না। অনুগ্রহ করে একজন যোগ্য শিক্ষক বা আলেমকে জিজ্ঞাসা করুন। এই পৃষ্ঠাগুলো সাহায্য করতে পারে:",
    scholar: "এটি প্রমাণিত মতামতের একটি সংক্ষিপ্ত বিবরণ, ফতোয়া নয়। আপনার নিজের অবস্থার জন্য অনুগ্রহ করে বিশ্বস্ত একজন যোগ্য আলেমকে জিজ্ঞাসা করুন।",
    flagged: "আমি এই উত্তরটি দেখাতে পারছি না। অনুগ্রহ করে প্রশ্নটি অন্যভাবে করুন।",
  },
  ru: {
    greeting: "Ва-алейкум ас-салям ва рахматуллах! Я {name}, ваш проводник по урокам Quran Masterclass. Спросите меня об аяте, уроке, таджвиде или Методе Шамса – я отвечаю по нашим проверенным урокам и показываю источники.",
    offTopic: "Простите – я могу помочь только с вопросами о Коране, исламе и учёбе в этом приложении. Объяснить вам аят или урок?",
    political: "Я держусь в стороне от политики и споров между группами – это не моя роль. С радостью объясню аят, урок или вопрос учёбы.",
    harmful: "Я не могу на это ответить. Давайте говорить о Коране и исламе с уважением – с радостью помогу с уроком или аятом.",
    crisis: "Мне жаль, что вам сейчас так тяжело. Пожалуйста, поговорите с кем-нибудь прямо сейчас: позвоните по номеру экстренной помощи вашей страны (112) или на линию психологической помощи и расскажите человеку, которому доверяете. Вы не одни – да облегчит вам Аллах.",
    notFound: "Аллаху аалям – я не нашёл этого в наших проверенных уроках и не хочу говорить ничего без источника. Пожалуйста, спросите квалифицированного учителя или учёного. Эти страницы могут помочь:",
    scholar: "Это обзор задокументированных мнений, а не фетва. По вашей личной ситуации, пожалуйста, обратитесь к квалифицированному учёному, которому вы доверяете.",
    flagged: "Я не могу показать этот ответ. Пожалуйста, сформулируйте вопрос иначе.",
  },
  zh: {
    greeting: "Wa ʿalaykum as-salām wa raḥmatullāh（愿您平安）！我是 {name}，您在 Quran Masterclass 课程中的向导。请问我关于某节经文、某课、塔吉威德或 Shams 方法的问题——我只根据经过审核的课程回答，并为您列出出处。",
    offTopic: "抱歉——我只能帮助解答关于古兰经、伊斯兰教以及本应用中学习的问题。要我为您讲解一节经文或一课吗？",
    political: "我不参与政治和群体之间的争论——这不是我的职责。我很乐意为您讲解经文、课程或学习上的问题。",
    harmful: "我无法回答这个问题。让我们怀着尊重谈论古兰经和伊斯兰教——我很乐意帮助您学习课程或经文。",
    crisis: "很抱歉您正在经历这些。请现在就找人谈谈：拨打您所在国家的紧急电话或心理援助热线，并告诉一位您信任的人。您并不孤单——愿安拉使您的事情容易。",
    notFound: "安拉至知——我在经过审核的课程中没有找到这个内容，没有出处我不愿告诉您任何东西。请向合格的老师或学者请教。以下页面可能有帮助：",
    scholar: "这是对有据可查的观点的概述，不是教法判断（法特瓦）。关于您自己的情况，请向您信任的合格学者请教。",
    flagged: "我无法显示这个回答。请换一种方式提问。",
  },
};

export function tutorMsg(lang: string, name = "Dalil", nameAr = "دليل"): TutorMsg {
  const m = M[lang] ?? M.en;
  let greeting = m.greeting.replace("{name}", name).replace("{nameAr}", nameAr);
  // Hidaya speaks of herself in the feminine where the language marks it
  if (name === "Hidaya") greeting = greeting.replace("مرشدك", "مرشدتك").replace("جواب دوں گا", "جواب دوں گی").replace("ваш проводник", "ваша наставница");
  return { ...m, greeting };
}
export const TUTOR_LANGS = Object.keys(M);

/** the label under an answer from the model's general knowledge (no app passage found), in all 14 languages */
const GENERAL: Record<string, string> = {
  de: "Allgemeines Wissen der KI – nicht aus unseren geprüften Lektionen. Bitte bei wichtigen Fragen eine Gelehrte oder einen Gelehrten fragen.",
  en: "General knowledge of the AI – not from our reviewed lessons. For important questions, please ask a scholar.",
  ar: "معرفة عامة من الذكاء الاصطناعي – ليست من دروسنا المراجَعة. في المسائل المهمة يُرجى سؤال عالمة أو عالم.",
  tr: "Yapay zekânın genel bilgisi – incelenmiş derslerimizden değil. Önemli sorularda lütfen bir âlime danışın.",
  ur: "AI کی عمومی معلومات – ہمارے جانچے ہوئے اسباق سے نہیں۔ اہم سوالات میں براہِ کرم کسی عالمہ یا عالم سے پوچھیں۔",
  fa: "دانش عمومی هوش مصنوعی – نه از درس‌های بررسی‌شدهٔ ما. در پرسش‌های مهم لطفاً از یک عالم بپرسید.",
  ps: "د AI عمومي پوهه – زموږ له کتل شویو لوستونو نه نه ده. په مهمو پوښتنو کې مهرباني وکړئ له یوې عالمې یا عالم وپوښتئ.",
  fr: "Connaissances générales de l'IA – pas issues de nos leçons vérifiées. Pour les questions importantes, veuillez consulter une savante ou un savant.",
  es: "Conocimiento general de la IA – no procede de nuestras lecciones revisadas. Para preguntas importantes, consulte a una erudita o un erudito.",
  id: "Pengetahuan umum AI – bukan dari pelajaran kami yang telah ditinjau. Untuk pertanyaan penting, mohon tanyakan kepada seorang ulama.",
  ms: "Pengetahuan umum AI – bukan daripada pelajaran kami yang telah disemak. Untuk soalan penting, sila tanya seorang ulama.",
  bn: "AI-এর সাধারণ জ্ঞান – আমাদের যাচাইকৃত পাঠ থেকে নয়। গুরুত্বপূর্ণ প্রশ্নে অনুগ্রহ করে একজন আলেমা বা আলেমকে জিজ্ঞাসা করুন।",
  ru: "Общие знания ИИ – не из наших проверенных уроков. По важным вопросам, пожалуйста, обратитесь к учёной или учёному.",
  zh: "AI 的一般知识——并非来自我们审核过的课程。重要问题请请教学者。",
};
/** a request to compose a personal dua: the tutor points to "Persönliche Dua" (the dua journey) and may name
 *  authentic duas only by reference (owner rule: the personal dua is its own product) */
const DUA: Record<string, string> = {
  de: "Eine persönliche Dua formuliere ich nicht selbst – dafür gibt es in der App „Persönliche Dua“: Sie wählen Anliegen und Worte, und die Dua wird für Sie gestaltet. Gern nenne ich Ihnen authentische Bittgebete aus dem Koran und der Sunna.",
  en: "I do not compose a personal dua myself – for that the app has “Personal Dua”: you choose your concern and words, and the dua is prepared for you. I am glad to point you to authentic duas from the Quran and the Sunnah.",
  ar: "لا أصوغ دعاءً شخصيًا بنفسي – لذلك يوجد في التطبيق «الدعاء الشخصي»: تختار حاجتك وكلماتك ويُعدّ الدعاء لك. ويسعدني أن أدلّك على أدعية ثابتة من القرآن والسنة.",
  tr: "Kişisel bir dua kendim yazmıyorum – bunun için uygulamada “Kişisel Dua” var: dileğinizi ve kelimelerinizi seçersiniz, dua sizin için hazırlanır. Kur'an ve Sünnet'ten sahih duaları memnuniyetle gösteririm.",
  ur: "میں خود ذاتی دعا نہیں لکھتا – اس کے لیے ایپ میں «ذاتی دعا» ہے: آپ اپنی حاجت اور الفاظ چنیں، دعا آپ کے لیے تیار ہو جاتی ہے۔ قرآن و سنت کی مستند دعائیں بتانے میں مجھے خوشی ہوگی۔",
  fa: "من خودم دعای شخصی نمی‌نویسم – برای این کار در برنامه «دعای شخصی» هست: حاجت و واژه‌هایتان را برمی‌گزینید و دعا برایتان آماده می‌شود. با کمال میل دعاهای معتبر قرآن و سنت را معرفی می‌کنم.",
  ps: "زه پخپله شخصي دعا نه لیکم – د دې لپاره په اپ کې «شخصي دعا» شته: تاسو خپله اړتیا او کلمې غوره کوئ او دعا ستاسو لپاره چمتو کېږي. د قرآن او سنتو مستندې دعاګانې په خوښۍ درښیم.",
  fr: "Je ne compose pas moi-même de dua personnelle – pour cela, l'application propose « Dua personnelle » : vous choisissez votre demande et vos mots, et la dua est préparée pour vous. Je vous indique volontiers des duas authentiques du Coran et de la Sunna.",
  es: "No compongo yo mismo una dua personal – para eso la aplicación ofrece «Dua personal»: usted elige su petición y sus palabras, y la dua se prepara para usted. Con gusto le indico duas auténticas del Corán y la Sunna.",
  id: "Saya tidak menyusun doa pribadi sendiri – untuk itu aplikasi menyediakan “Doa Pribadi”: Anda memilih hajat dan kata-kata, lalu doa disiapkan untuk Anda. Dengan senang hati saya tunjukkan doa-doa sahih dari Al-Qur'an dan Sunnah.",
  ms: "Saya tidak mengarang doa peribadi sendiri – untuk itu aplikasi menyediakan “Doa Peribadi”: anda memilih hajat dan kata-kata, lalu doa disediakan untuk anda. Dengan senang hati saya tunjukkan doa sahih daripada al-Quran dan Sunnah.",
  bn: "আমি নিজে ব্যক্তিগত দোয়া রচনা করি না – এর জন্য অ্যাপে «ব্যক্তিগত দোয়া» আছে: আপনি আপনার প্রয়োজন ও শব্দ বেছে নিন, দোয়া আপনার জন্য প্রস্তুত হবে। কুরআন ও সুন্নাহর বিশুদ্ধ দোয়াগুলো দেখাতে পেরে আমি আনন্দিত।",
  ru: "Я не составляю личную дуа сам – для этого в приложении есть «Личная дуа»: вы выбираете просьбу и слова, и дуа готовится для вас. С радостью укажу вам достоверные дуа из Корана и Сунны.",
  zh: "我不亲自撰写个人祈祷词——为此应用中有“个人杜阿”：您选择所求与措辞，杜阿将为您准备。我很乐意为您指出《古兰经》和圣行中的可靠祈祷。",
};
export const duaMsg = (lang: string) => DUA[lang] ?? DUA.en;
/** "write / make me a dua" in the app's languages (a request to compose, not a question about duas) */
export const DUA_REQUEST = /\b(write|make|compose|create|formulate)\b[^?.!]{0,30}\b(dua|du'a|duaa|supplication|prayer for)\b|\b(schreib\w*|formulier\w*|erstell\w*|mach\w*|verfass\w*)\b[^?.!]{0,30}\b(dua|bittgebet|gebet für)\b|اكتب\s*(لي)?\s*دعاء|ألّف\s*(لي)?\s*دعاء|صغ\s*(لي)?\s*دعاء|\bdua\s+(yaz|oluştur)|دعا\s*لکھ|\bécri\w*\b[^?.!]{0,20}\bdou?a\b|\bescrib\w*\b[^?.!]{0,20}\bdua\b|\b(tulis|buat|karang)\w*\b[^?.!]{0,20}\bdoa\b|\b(напиши|составь)\w*\b[^?.!]{0,20}\bду[аъ]/iu;
export const generalLabel =(lang: string) => GENERAL[lang] ?? GENERAL.en;
export const GENERAL_LANGS = Object.keys(GENERAL);
