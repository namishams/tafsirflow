// Recent releases (user-facing, polite wording) in all 14 languages; shown above the older en/de/ar entries.
// Items that are not in the store yet say so ("next app version"). No internal or technical details.
export type LocalRelease = { date: string; tr: Record<string, { title: string; items: string[] }> };
export const RECENT: LocalRelease[] = [
 {
  "date": "2026-10-22",
  "tr": {
   "en": {
    "title": "Carousels, tutors and new ways to learn",
    "items": [
     "New carousel series to swipe, save and share – Hifz, stories and parables of the Quran, the journey of the soul, family, purification of the heart, the Arabic of the Quran, Islamic history, Hadith Qudsi and creation – in all 14 languages.",
     "Your tutors Dalil and Hidaya answer questions about the Quran and guide your learning. Hidaya is available to sisters who choose her. In the app: in the next app version.",
     "Shams Method 3.0 with blind recitation (recite without seeing the text) and makhraj training for the points of articulation. In the app: in the next app version.",
     "Prayer and wudu trainer for Sunni and Shia practice, in all 14 languages.",
     "A dedicated section for sisters, and more Shia content: the Nahj feed, Shia dates in the Islamic days countdown and the holy cities.",
     "Profiles with your learning achievements and full statistics, and Together: learn with friends in circles, a league and a shared community. In the app: in the next app version."
    ]
   },
   "de": {
    "title": "Karussells, Lernbegleiter und neue Wege zu lernen",
    "items": [
     "Neue Karussell-Reihen zum Wischen, Speichern und Teilen – Hifz, Geschichten und Gleichnisse des Korans, Reise der Seele, Familie, Läuterung des Herzens, Arabisch des Korans, islamische Geschichte, Hadith Qudsi und Schöpfung – in allen 14 Sprachen.",
     "Ihre Lernbegleiter Dalil und Hidaya beantworten Fragen zum Koran und führen Sie durch Ihren Lernweg. Hidaya steht Schwestern zur Wahl. In der App: in der nächsten App-Version.",
     "Shams-Methode 3.0 mit Blind-Rezitation (rezitieren, ohne den Text zu sehen) und Makhraj-Training für die Artikulationsorte. In der App: in der nächsten App-Version.",
     "Gebets- und Wudu-Trainer für die sunnitische und schiitische Praxis, in allen 14 Sprachen.",
     "Ein eigener Bereich für Schwestern und mehr schiitische Inhalte: der Nahdsch-Feed, schiitische Termine im Countdown der islamischen Tage und die heiligen Städte.",
     "Profile mit Ihren Lernerfolgen und vollständige Statistiken sowie Together: gemeinsam mit Freunden in Kreisen lernen, mit Liga und gemeinsamer Gemeinschaft. In der App: in der nächsten App-Version."
    ]
   },
   "ar": {
    "title": "دوّارات ومرشدان للتعلّم وطرق جديدة للتعلّم",
    "items": [
     "سلاسل جديدة من الدوّارات للتمرير والحفظ والمشاركة: الحفظ، وقصص القرآن وأمثاله، ورحلة الروح، والأسرة، وتزكية القلب، وعربية القرآن، والتاريخ الإسلامي، والحديث القدسي، والخلق، بـ14 لغة.",
     "مرشداكم دليل وهداية يجيبان عن أسئلتكم حول القرآن ويرافقان مسار تعلّمكم. وتتاح هداية للأخوات اللواتي يخترنها. في التطبيق: في الإصدار القادم من التطبيق.",
     "منهج شمس 3.0 مع التلاوة الغيبية (التلاوة دون رؤية النص) والتدريب على المخارج. في التطبيق: في الإصدار القادم من التطبيق.",
     "مدرّب الصلاة والوضوء على الممارسة السنية والشيعية، بـ14 لغة.",
     "قسم خاص بالأخوات ومزيد من المحتوى الشيعي: موجز نهج البلاغة ومناسبات الشيعة في العدّ التنازلي للأيام الإسلامية والمدن المقدسة.",
     "ملفات شخصية بإنجازاتكم وإحصاءات كاملة، و«معًا»: تعلّموا مع الأصدقاء في حلقات ودوري ومجتمع مشترك. في التطبيق: في الإصدار القادم من التطبيق."
    ]
   },
   "tr": {
    "title": "Karüseller, öğrenme rehberleri ve yeni öğrenme yolları",
    "items": [
     "Kaydırmak, kaydetmek ve paylaşmak için yeni karüsel serileri – hıfz, Kuran'ın hikâyeleri ve temsilleri, ruhun yolculuğu, aile, kalbin arınması, Kuran'ın Arapçası, İslam tarihi, hadis-i kudsi ve yaratılış – 14 dilin tamamında.",
     "Öğrenme rehberleriniz Dalil ve Hidaya, Kuran hakkındaki sorularınızı yanıtlar ve öğrenme yolunuzda size eşlik eder. Hidaya'yı tercih eden kız kardeşler için seçilebilir. Uygulamada: bir sonraki uygulama sürümünde.",
     "Kör tilavet (metni görmeden okuma) ve harf çıkış yerleri için mahreç çalışması içeren Shams Yöntemi 3.0. Uygulamada: bir sonraki uygulama sürümünde.",
     "Sünni ve Şii uygulamaya göre namaz ve abdest eğitmeni, 14 dilin tamamında.",
     "Kız kardeşlere özel bir bölüm ve daha fazla Şii içerik: Nehc akışı, İslami günler geri sayımında Şii tarihleri ve kutsal şehirler.",
     "Öğrenme başarılarınızı gösteren profiller ve tam istatistikler; ayrıca Together: arkadaşlarınızla halkalarda, ligde ve ortak toplulukta birlikte öğrenin. Uygulamada: bir sonraki uygulama sürümünde."
    ]
   },
   "ur": {
    "title": "کیروسل، تعلیمی رہنما اور سیکھنے کے نئے طریقے",
    "items": [
     "سوائپ، محفوظ اور شیئر کرنے کے لیے کیروسل کی نئی سیریز – حفظ، قرآن کے قصے اور مثالیں، روح کا سفر، خاندان، تزکیۂ قلب، قرآن کی عربی، اسلامی تاریخ، حدیثِ قدسی اور تخلیق – تمام 14 زبانوں میں۔",
     "آپ کے تعلیمی رہنما دلیل اور ہدایہ قرآن کے بارے میں سوالات کے جواب دیتے ہیں اور آپ کے سیکھنے کے سفر میں رہنمائی کرتے ہیں۔ ہدایہ ان بہنوں کے لیے ہے جو اسے منتخب کریں۔ ایپ میں: ایپ کے اگلے ورژن میں۔",
     "شمس طریقہ 3.0، جس میں نابینا تلاوت (متن دیکھے بغیر تلاوت) اور مخارج کی مشق شامل ہے۔ ایپ میں: ایپ کے اگلے ورژن میں۔",
     "سنی اور شیعہ طریقے کے مطابق نماز اور وضو کی تربیت، تمام 14 زبانوں میں۔",
     "بہنوں کے لیے علیحدہ حصہ اور مزید شیعہ مواد: نہج فیڈ، اسلامی دنوں کی الٹی گنتی میں شیعہ تاریخیں اور مقدس شہر۔",
     "آپ کی تعلیمی کامیابیوں والی پروفائلز اور مکمل اعداد و شمار، نیز Together: دوستوں کے ساتھ حلقوں، لیگ اور مشترکہ کمیونٹی میں مل کر سیکھیں۔ ایپ میں: ایپ کے اگلے ورژن میں۔"
    ]
   },
   "fa": {
    "title": "کاروسل‌ها، راهنمایان یادگیری و راه‌های تازه برای آموختن",
    "items": [
     "مجموعه‌های تازهٔ کاروسل برای کشیدن، ذخیره و اشتراک‌گذاری – حفظ، داستان‌ها و مثل‌های قرآن، سفر روح، خانواده، تزکیهٔ دل، عربی قرآن، تاریخ اسلام، حدیث قدسی و آفرینش – به هر ۱۴ زبان.",
     "راهنمایان یادگیری شما، دلیل و هدایت، به پرسش‌های شما دربارهٔ قرآن پاسخ می‌دهند و مسیر یادگیری‌تان را همراهی می‌کنند. هدایت برای خواهرانی که او را برگزینند در دسترس است. در برنامه: در نسخهٔ بعدی برنامه.",
     "روش شمس ۳٫۰ با تلاوت نابینا (تلاوت بدون دیدن متن) و تمرین مخارج حروف. در برنامه: در نسخهٔ بعدی برنامه.",
     "مربی نماز و وضو برای عمل اهل سنت و شیعه، به هر ۱۴ زبان.",
     "بخشی ویژهٔ خواهران و محتوای شیعی بیشتر: فید نهج، مناسبت‌های شیعی در شمارش معکوس روزهای اسلامی و شهرهای مقدس.",
     "پروفایل‌هایی با دستاوردهای یادگیری شما و آمار کامل، و Together: همراه دوستان در حلقه‌ها، لیگ و اجتماعی مشترک بیاموزید. در برنامه: در نسخهٔ بعدی برنامه."
    ]
   },
   "ps": {
    "title": "کروسلونه، د زده‌کړې لارښوونکي او د زده‌کړې نوې لارې",
    "items": [
     "د سوایپ، ساتلو او شریکولو لپاره د کروسلونو نوې لړۍ – حفظ، د قرآن کيسې او مثالونه، د روح سفر، کورنۍ، د زړه پاکوالی، د قرآن عربي، اسلامي تاریخ، حدیث قدسي او پیدایښت – په ټولو ۱۴ ژبو کې.",
     "ستاسو د زده‌کړې لارښوونکي دلیل او هدایت د قرآن په اړه پوښتنو ته ځواب ورکوي او ستاسو د زده‌کړې په لاره کې مرسته کوي. هدایت د هغو خویندو لپاره دی چې هغه غوره کړي. په اپ کې: د اپ په راتلونکې نسخه کې.",
     "د شمس طریقه ۳٫۰ د ړندې تلاوت (پرته له متن لیدلو تلاوت) او د مخرجونو تمرین سره. په اپ کې: د اپ په راتلونکې نسخه کې.",
     "د سني او شیعه کړنې مطابق د لمانځه او اودس روزونکی، په ټولو ۱۴ ژبو کې.",
     "د خویندو لپاره ځانګړی برخه او ډېر شیعه منځپانګه: د نهج فید، د اسلامي ورځو په شمېرنه کې شیعه نېټې او سپیڅلي ښارونه.",
     "د زده‌کړې بریالیتوبونو سره پروفایلونه او بشپړ احصایې، او Together: له ملګرو سره په حلقو، لیګ او ګډ ټولنه کې یوځای زده کړئ. په اپ کې: د اپ په راتلونکې نسخه کې."
    ]
   },
   "fr": {
    "title": "Carrousels, tuteurs et nouvelles façons d'apprendre",
    "items": [
     "De nouvelles séries de carrousels à faire défiler, enregistrer et partager – hifz, récits et paraboles du Coran, voyage de l'âme, famille, purification du cœur, arabe du Coran, histoire islamique, hadith qudsi et création – dans les 14 langues.",
     "Vos tuteurs Dalil et Hidaya répondent à vos questions sur le Coran et vous guident dans votre apprentissage. Hidaya est proposée aux sœurs qui la choisissent. Dans l'application : dans la prochaine version de l'application.",
     "Méthode Shams 3.0 avec récitation à l'aveugle (réciter sans voir le texte) et entraînement aux makhraj, les points d'articulation. Dans l'application : dans la prochaine version de l'application.",
     "Entraîneur de prière et d'ablutions pour la pratique sunnite et chiite, dans les 14 langues.",
     "Un espace dédié aux sœurs et davantage de contenus chiites : le fil Nahj, les dates chiites dans le compte à rebours des jours islamiques et les villes saintes.",
     "Des profils avec vos réussites d'apprentissage et des statistiques complètes, ainsi que Together : apprenez avec vos amis en cercles, avec une ligue et une communauté commune. Dans l'application : dans la prochaine version de l'application."
    ]
   },
   "es": {
    "title": "Carruseles, tutores y nuevas formas de aprender",
    "items": [
     "Nuevas series de carruseles para deslizar, guardar y compartir: hifz, relatos y parábolas del Corán, el viaje del alma, la familia, la purificación del corazón, el árabe del Corán, historia islámica, hadiz qudsi y la creación, en los 14 idiomas.",
     "Sus tutores Dalil e Hidaya responden a sus preguntas sobre el Corán y le guían en su aprendizaje. Hidaya está disponible para las hermanas que la elijan. En la aplicación: en la próxima versión de la aplicación.",
     "Método Shams 3.0 con recitación a ciegas (recitar sin ver el texto) y entrenamiento de los makharij, los puntos de articulación. En la aplicación: en la próxima versión de la aplicación.",
     "Entrenador de oración y ablución para la práctica suní y chií, en los 14 idiomas.",
     "Una sección propia para las hermanas y más contenido chií: el feed Nahj, las fechas chiíes en la cuenta atrás de los días islámicos y las ciudades santas.",
     "Perfiles con sus logros de aprendizaje y estadísticas completas, y Together: aprenda con amigos en círculos, con liga y comunidad compartida. En la aplicación: en la próxima versión de la aplicación."
    ]
   },
   "id": {
    "title": "Carousel, pendamping belajar, dan cara baru belajar",
    "items": [
     "Seri carousel baru untuk digeser, disimpan, dan dibagikan – hafalan, kisah dan perumpamaan Al-Quran, perjalanan jiwa, keluarga, penyucian hati, bahasa Arab Al-Quran, sejarah Islam, hadis qudsi, dan penciptaan – dalam 14 bahasa.",
     "Pendamping belajar Anda, Dalil dan Hidaya, menjawab pertanyaan tentang Al-Quran dan memandu proses belajar Anda. Hidaya tersedia bagi saudari yang memilihnya. Di aplikasi: pada versi aplikasi berikutnya.",
     "Metode Shams 3.0 dengan tilawah buta (membaca tanpa melihat teks) dan latihan makhraj untuk tempat keluarnya huruf. Di aplikasi: pada versi aplikasi berikutnya.",
     "Pelatih salat dan wudu untuk praktik Sunni dan Syiah, dalam 14 bahasa.",
     "Bagian khusus untuk saudari dan lebih banyak konten Syiah: umpan Nahj, tanggal-tanggal Syiah dalam hitung mundur hari Islam, dan kota-kota suci.",
     "Profil dengan capaian belajar Anda dan statistik lengkap, serta Together: belajar bersama teman dalam lingkaran, liga, dan komunitas bersama. Di aplikasi: pada versi aplikasi berikutnya."
    ]
   },
   "ms": {
    "title": "Karusel, pembimbing pembelajaran dan cara baharu belajar",
    "items": [
     "Siri karusel baharu untuk dileret, disimpan dan dikongsi – hafazan, kisah dan perumpamaan Al-Quran, perjalanan jiwa, keluarga, penyucian hati, bahasa Arab Al-Quran, sejarah Islam, hadis qudsi dan penciptaan – dalam 14 bahasa.",
     "Pembimbing pembelajaran anda, Dalil dan Hidaya, menjawab soalan tentang Al-Quran dan memandu pembelajaran anda. Hidaya tersedia untuk saudari yang memilihnya. Dalam aplikasi: dalam versi aplikasi yang akan datang.",
     "Kaedah Shams 3.0 dengan tilawah buta (membaca tanpa melihat teks) dan latihan makhraj untuk tempat keluar huruf. Dalam aplikasi: dalam versi aplikasi yang akan datang.",
     "Pelatih solat dan wuduk untuk amalan Sunni dan Syiah, dalam 14 bahasa.",
     "Bahagian khas untuk saudari dan lebih banyak kandungan Syiah: suapan Nahj, tarikh Syiah dalam kiraan detik hari Islam dan kota-kota suci.",
     "Profil dengan pencapaian pembelajaran anda dan statistik penuh, serta Together: belajar bersama rakan dalam bulatan, liga dan komuniti bersama. Dalam aplikasi: dalam versi aplikasi yang akan datang."
    ]
   },
   "bn": {
    "title": "ক্যারাউসেল, শেখার সহায়ক এবং শেখার নতুন পথ",
    "items": [
     "সোয়াইপ, সংরক্ষণ ও শেয়ার করার জন্য নতুন ক্যারাউসেল সিরিজ – হিফজ, কুরআনের কাহিনি ও উপমা, আত্মার যাত্রা, পরিবার, হৃদয়ের পরিশুদ্ধি, কুরআনের আরবি, ইসলামের ইতিহাস, হাদিসে কুদসি ও সৃষ্টি – সব ১৪টি ভাষায়।",
     "আপনার শেখার সহায়ক দালিল ও হিদায়া কুরআন সম্পর্কে প্রশ্নের উত্তর দেন এবং আপনার শেখার পথে সঙ্গ দেন। যে বোনেরা হিদায়াকে বেছে নেন, তাদের জন্য তিনি আছেন। অ্যাপে: অ্যাপের পরবর্তী সংস্করণে।",
     "শামস পদ্ধতি ৩.০, যাতে আছে অন্ধ তিলাওয়াত (লেখা না দেখে তিলাওয়াত) ও মাখরাজ অনুশীলন। অ্যাপে: অ্যাপের পরবর্তী সংস্করণে।",
     "সুন্নি ও শিয়া রীতি অনুযায়ী নামাজ ও অজুর প্রশিক্ষক, সব ১৪টি ভাষায়।",
     "বোনেদের জন্য আলাদা বিভাগ এবং আরও শিয়া বিষয়বস্তু: নাহজ ফিড, ইসলামি দিনের কাউন্টডাউনে শিয়া তারিখ এবং পবিত্র নগরীসমূহ।",
     "আপনার শেখার অর্জনসহ প্রোফাইল ও পূর্ণ পরিসংখ্যান, এবং Together: বন্ধুদের সঙ্গে চক্র, লিগ ও যৌথ কমিউনিটিতে একসঙ্গে শিখুন। অ্যাপে: অ্যাপের পরবর্তী সংস্করণে।"
    ]
   },
   "ru": {
    "title": "Карусели, наставники и новые способы учиться",
    "items": [
     "Новые серии каруселей, которые можно листать, сохранять и пересылать: хифз, рассказы и притчи Корана, путь души, семья, очищение сердца, арабский язык Корана, история ислама, хадис кудси и сотворение – на всех 14 языках.",
     "Ваши наставники Далиль и Хидая отвечают на вопросы о Коране и сопровождают вас на пути обучения. Хидая доступна сёстрам, которые её выберут. В приложении: в следующей версии приложения.",
     "Метод Шамс 3.0 с чтением вслепую (чтение без текста перед глазами) и тренировкой махарибжей – мест артикуляции. В приложении: в следующей версии приложения.",
     "Тренажёр намаза и омовения для суннитской и шиитской практики на всех 14 языках.",
     "Отдельный раздел для сестёр и больше шиитских материалов: лента Нахдж, шиитские даты в обратном отсчёте исламских дней и священные города.",
     "Профили с вашими учебными достижениями и полная статистика, а также Together: учитесь вместе с друзьями в кругах, лиге и общем сообществе. В приложении: в следующей версии приложения."
    ]
   },
   "zh": {
    "title": "轮播卡片、学习向导与新的学习方式",
    "items": [
     "可滑动、收藏和分享的新轮播系列——背诵、古兰经故事与比喻、灵魂之旅、家庭、心灵净化、古兰经阿拉伯语、伊斯兰历史、圣训库德西与创造——提供全部 14 种语言。",
     "您的学习向导 Dalil 与 Hidaya 会解答关于古兰经的问题并陪伴您的学习。女性学习者可选择 Hidaya。应用内：将在下一个应用版本中提供。",
     "Shams 方法 3.0，含盲诵（不看文本诵读）与发音部位（Makhraj）训练。应用内：将在下一个应用版本中提供。",
     "面向逊尼派与什叶派实践的礼拜与小净训练，提供全部 14 种语言。",
     "为女性学习者设立的专区，以及更多什叶派内容：Nahj 信息流、伊斯兰日倒计时中的什叶派日期与圣城。",
     "展示您学习成果的个人资料与完整统计，以及 Together：与朋友在学习圈、联赛和共同社区中一起学习。应用内：将在下一个应用版本中提供。"
    ]
   }
  }
 },
 {
  "date": "2026-10-21",
  "tr": {
   "en": {
    "title": "Madrasa, courses and exams",
    "items": [
     "The Madrasa with faculties, study stages, timetable and certificates, plus many new courses: Seerah, the prophets, tafsir, hadith, creed, fiqh, ethics, duas, the 99 names, Ramadan, Hajj and tajweed.",
     "Shams Method 2.0 with Sabaq, Sabqi and Manzil, memorization quality, similar verses, talaqqi and reflection for all 114 surahs.",
     "Examination centre with more than 2,000 questions, mock exams and certificates that can be verified online.",
     "Worldwide ranking by country, friends and season, and the Mishary path with maqam ear training and mentoring."
    ]
   },
   "de": {
    "title": "Madrasa, Kurse und Prüfungen",
    "items": [
     "Die Madrasa mit Fakultäten, Stufen, Stundenplan und Zeugnissen sowie viele neue Kurse: Seerah, Propheten, Tafsir, Hadith, Glaubenslehre, Fiqh, Ethik, Duas, die 99 Namen, Ramadan, Hadsch und Tadschwid.",
     "Shams-Methode 2.0 mit Sabaq, Sabqi und Manzil, Hifz-Qualität, ähnlichen Versen, Talaqqi und Besinnung für alle 114 Suren.",
     "Prüfungszentrum mit über 2.000 Fragen, Probeprüfungen und online überprüfbaren Zertifikaten.",
     "Weltweites Ranking nach Land, Freunden und Saison sowie der Mishary-Weg mit Maqam-Gehörtraining und Mentoring."
    ]
   },
   "ar": {
    "title": "المدرسة والدورات والاختبارات",
    "items": [
     "المدرسة بكلياتها ومراحلها وجدولها وشهاداتها، مع دورات جديدة كثيرة: السيرة، والأنبياء، والتفسير، والحديث، والعقيدة، والفقه، والأخلاق، والأدعية، وأسماء الله الحسنى، ورمضان، والحج، والتجويد.",
     "منهج شمس 2.0 بالسبق والسبقي والمنزل، وجودة الحفظ، والمتشابهات، والتلقّي، والتدبّر للسور الـ114.",
     "مركز الاختبارات بأكثر من 2000 سؤال، واختبارات تجريبية، وشهادات يمكن التحقق منها عبر الإنترنت.",
     "ترتيب عالمي حسب البلد والأصدقاء والموسم، ومسار مشاري مع تدريب السمع على المقامات والإرشاد."
    ]
   },
   "tr": {
    "title": "Medrese, kurslar ve sınavlar",
    "items": [
     "Fakülteleri, kademeleri, ders programı ve belgeleriyle Medrese; ayrıca yeni kurslar: siyer, peygamberler, tefsir, hadis, akaid, fıkıh, ahlak, dualar, 99 isim, Ramazan, hac ve tecvid.",
     "114 sûrenin tamamı için Sabak, Sabki ve Menzil içeren Shams Yöntemi 2.0; ezber kalitesi, benzer ayetler, telakki ve tefekkür.",
     "2.000'den fazla soru içeren sınav merkezi, deneme sınavları ve çevrimiçi doğrulanabilen sertifikalar.",
     "Ülke, arkadaşlar ve sezona göre dünya sıralaması; makam kulak eğitimi ve mentorluk içeren Mişari yolu."
    ]
   },
   "ur": {
    "title": "مدرسہ، کورسز اور امتحانات",
    "items": [
     "فیکلٹیوں، مراحل، نظام الاوقات اور اسناد کے ساتھ مدرسہ، اور بہت سے نئے کورس: سیرت، انبیاء، تفسیر، حدیث، عقیدہ، فقہ، اخلاق، دعائیں، 99 نام، رمضان، حج اور تجوید۔",
     "تمام 114 سورتوں کے لیے سبق، سبقی اور منزل کے ساتھ شمس طریقہ 2.0، حفظ کا معیار، متشابہات، تلقّی اور تدبر۔",
     "2,000 سے زیادہ سوالات والا امتحانی مرکز، مشقی امتحانات اور آن لائن تصدیق کے قابل اسناد۔",
     "ملک، دوستوں اور موسم کے لحاظ سے عالمی درجہ بندی، اور مقام کی سماعت کی تربیت اور رہنمائی کے ساتھ مشاری کا راستہ۔"
    ]
   },
   "fa": {
    "title": "مدرسه، دوره‌ها و آزمون‌ها",
    "items": [
     "مدرسه با دانشکده‌ها، مرحله‌ها، برنامهٔ هفتگی و گواهی‌ها، و دوره‌های تازهٔ بسیار: سیره، پیامبران، تفسیر، حدیث، عقاید، فقه، اخلاق، دعاها، اسماءالحسنی، رمضان، حج و تجوید.",
     "روش شمس ۲٫۰ با سبق، سبقی و منزل، کیفیت حفظ، آیات مشابه، تلقی و تدبر برای هر ۱۱۴ سوره.",
     "مرکز آزمون با بیش از ۲۰۰۰ پرسش، آزمون‌های آزمایشی و گواهی‌های قابل تأیید آنلاین.",
     "رتبه‌بندی جهانی بر پایهٔ کشور، دوستان و فصل، و مسیر مشاری با تمرین شنیداری مقام و راهنمایی."
    ]
   },
   "ps": {
    "title": "مدرسه، کورسونه او ازموینې",
    "items": [
     "مدرسه د پوهنځیو، پړاوونو، مهالوېش او سندونو سره، او ډېر نوي کورسونه: سیرت، پیغمبران، تفسیر، حدیث، عقیده، فقه، اخلاق، دعاګانې، ۹۹ نومونه، روژه، حج او تجوید.",
     "د ټولو ۱۱۴ سورتونو لپاره د سبق، سبقي او منزل سره د شمس طریقه ۲٫۰، د حفظ کیفیت، متشابهات، تلقي او تدبر.",
     "د ۲۰۰۰ څخه زیاتو پوښتنو سره د ازموینې مرکز، تمرینی ازموینې او آنلاین تایید وړ سندونه.",
     "د هېواد، ملګرو او فصل له مخې نړیوال درجه‌بندي، او د مقام د اوریدلو روزنې او لارښوونې سره د مشاري لاره."
    ]
   },
   "fr": {
    "title": "Madrasa, cours et examens",
    "items": [
     "La Madrasa avec facultés, niveaux, emploi du temps et certificats, et de nombreux nouveaux cours : Sîra, les prophètes, tafsir, hadith, croyance, fiqh, éthique, invocations, les 99 noms, Ramadan, Hajj et tajwid.",
     "Méthode Shams 2.0 avec Sabaq, Sabqi et Manzil, qualité de mémorisation, versets similaires, talaqqi et méditation pour les 114 sourates.",
     "Centre d'examens avec plus de 2 000 questions, examens blancs et certificats vérifiables en ligne.",
     "Classement mondial par pays, amis et saison, et parcours Mishary avec entraînement de l'oreille aux maqams et mentorat."
    ]
   },
   "es": {
    "title": "Madrasa, cursos y exámenes",
    "items": [
     "La Madrasa con facultades, niveles, horario y certificados, y muchos cursos nuevos: Sira, los profetas, tafsir, hadiz, credo, fiqh, ética, súplicas, los 99 nombres, Ramadán, Hach y tayuid.",
     "Método Shams 2.0 con Sabaq, Sabqi y Manzil, calidad de memorización, versículos similares, talaqqi y reflexión para las 114 suras.",
     "Centro de exámenes con más de 2000 preguntas, exámenes de prueba y certificados verificables en línea.",
     "Clasificación mundial por país, amigos y temporada, y el camino Mishary con entrenamiento auditivo de maqams y mentoría."
    ]
   },
   "id": {
    "title": "Madrasah, kursus, dan ujian",
    "items": [
     "Madrasah dengan fakultas, jenjang, jadwal, dan sertifikat, serta banyak kursus baru: sirah, para nabi, tafsir, hadis, akidah, fikih, akhlak, doa, 99 nama, Ramadan, haji, dan tajwid.",
     "Metode Shams 2.0 dengan Sabaq, Sabqi, dan Manzil, kualitas hafalan, ayat-ayat mirip, talaqqi, dan tadabbur untuk 114 surah.",
     "Pusat ujian dengan lebih dari 2.000 soal, ujian percobaan, dan sertifikat yang dapat diverifikasi secara daring.",
     "Peringkat dunia menurut negara, teman, dan musim, serta jalur Mishary dengan latihan pendengaran maqam dan bimbingan."
    ]
   },
   "ms": {
    "title": "Madrasah, kursus dan peperiksaan",
    "items": [
     "Madrasah dengan fakulti, peringkat, jadual dan sijil, serta banyak kursus baharu: sirah, para nabi, tafsir, hadis, akidah, fiqh, akhlak, doa, 99 nama, Ramadan, haji dan tajwid.",
     "Kaedah Shams 2.0 dengan Sabaq, Sabqi dan Manzil, kualiti hafazan, ayat serupa, talaqqi dan tadabbur untuk 114 surah.",
     "Pusat peperiksaan dengan lebih 2,000 soalan, peperiksaan percubaan dan sijil yang boleh disahkan dalam talian.",
     "Kedudukan dunia mengikut negara, rakan dan musim, serta laluan Mishary dengan latihan pendengaran maqam dan bimbingan."
    ]
   },
   "bn": {
    "title": "মাদ্রাসা, কোর্স ও পরীক্ষা",
    "items": [
     "অনুষদ, স্তর, রুটিন ও সনদসহ মাদ্রাসা, এবং অনেক নতুন কোর্স: সিরাত, নবিগণ, তাফসির, হাদিস, আকিদা, ফিকহ, আখলাক, দোয়া, ৯৯ নাম, রমজান, হজ ও তাজবিদ।",
     "সব ১১৪টি সুরার জন্য সাবাক, সাবকি ও মানজিলসহ শামস পদ্ধতি ২.০, হিফজের মান, সদৃশ আয়াত, তালাক্কি ও তাদাব্বুর।",
     "২,০০০-এর বেশি প্রশ্নসহ পরীক্ষা কেন্দ্র, মডেল পরীক্ষা এবং অনলাইনে যাচাইযোগ্য সনদ।",
     "দেশ, বন্ধু ও মৌসুম অনুযায়ী বিশ্ব র‍্যাঙ্কিং, এবং মাকাম শ্রবণ প্রশিক্ষণ ও মেন্টরিংসহ মিশারি পথ।"
    ]
   },
   "ru": {
    "title": "Медресе, курсы и экзамены",
    "items": [
     "Медресе с факультетами, ступенями, расписанием и свидетельствами, а также много новых курсов: сира, пророки, тафсир, хадисы, акыда, фикх, этика, дуа, 99 имён, Рамадан, хадж и таджвид.",
     "Метод Шамс 2.0 с сабаком, сабки и манзилем, качеством хифза, схожими аятами, таляки и размышлением для всех 114 сур.",
     "Экзаменационный центр с более чем 2000 вопросов, пробными экзаменами и сертификатами, которые можно проверить онлайн.",
     "Мировой рейтинг по странам, друзьям и сезонам, а также путь Мишари с тренировкой слуха на макамы и наставничеством."
    ]
   },
   "zh": {
    "title": "学院、课程与考试",
    "items": [
     "设有学部、阶段、课表与证书的学院，以及众多新课程：圣行传记、先知、经注、圣训、信条、教法、品德、祈祷词、真主的 99 个尊名、斋月、朝觐与诵读规则。",
     "Shams 方法 2.0，含 Sabaq、Sabqi 与 Manzil、背诵质量、相似经文、面授与思考，覆盖全部 114 章。",
     "拥有 2000 多道题的考试中心、模拟考试以及可在线验证的证书。",
     "按国家、好友和赛季划分的全球排名，以及含旋律（Maqam）听力训练与指导的 Mishary 学习之路。"
    ]
   }
  }
 }
];
