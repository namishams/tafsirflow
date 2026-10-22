import { pick, useLang } from "@/i18n";

// Texts of the luxury tiers: one-of-one "Unikate", founder numbers 1-10, earned stickers and the boards. 14 languages,
// formal address. Never pressure wording: totals are stated, nothing runs out on a timer.
const KEYS = [
  "uniqueTab", "uniqueLead", "oneOfOne", "owner", "reserved", "founder", "youGet", "regular",
  "earnedTab", "earnedLead", "notForSale", "e_hafiz", "e_khatm", "e_qadr", "e_100", "e_365",
  "board", "boardLead", "boardOptIn", "holders", "conflict",
] as const;
type T = Record<(typeof KEYS)[number], string>;

const en: T = {
  uniqueTab: "One of one", uniqueLead: "Each of these exists exactly once worldwide. After the purchase your username is engraved on it, and the store shows the owner for good.",
  oneOfOne: "One of one", owner: "Owned by @{u}", reserved: "Someone is buying this right now", founder: "Founder series No. {n} of 10", youGet: "You receive No. {n}", regular: "No. {n} of 300",
  earnedTab: "Earned", earnedLead: "These cannot be bought. They are earned through real achievement and are the most prestigious stickers of all.", notForSale: "Not for sale",
  e_hafiz: "A juz memorised and confirmed by the certificate exam.", e_khatm: "A completed khatm.", e_qadr: "Learning on every one of the last ten nights of Ramadan.", e_100: "100 days of learning in a row.", e_365: "365 days of learning in a row.",
  board: "Rarest collections", boardLead: "How many members hold each sticker. Owners of one-of-ones and numbers 1-10 appear only if they choose to.", boardOptIn: "Show me on the list", holders: "{n} holders",
  conflict: "This one-of-one was already taken. Your payment will be refunded.",
};
const de: T = {
  uniqueTab: "Unikate", uniqueLead: "Jedes dieser Stücke gibt es weltweit genau einmal. Nach dem Kauf wird Ihr Benutzername eingraviert, und der Shop zeigt den Besitz für immer.",
  oneOfOne: "Eins von Eins", owner: "Besitzt: @{u}", reserved: "Wird gerade von jemandem gekauft", founder: "Gründerserie Nr. {n} von 10", youGet: "Sie erhalten Nr. {n}", regular: "Nr. {n} von 300",
  earnedTab: "Errungen", earnedLead: "Diese Sticker sind nicht käuflich. Man erwirbt sie durch echte Leistung, und sie sind die angesehensten von allen.", notForSale: "Nicht käuflich",
  e_hafiz: "Ein Juz auswendig gelernt und in der Zertifikatsprüfung bestätigt.", e_khatm: "Eine abgeschlossene Khatm.", e_qadr: "In jeder der letzten zehn Nächte des Ramadan gelernt.", e_100: "100 Tage in Folge gelernt.", e_365: "365 Tage in Folge gelernt.",
  board: "Seltenste Sammlungen", boardLead: "Wie viele Mitglieder jeden Sticker besitzen. Besitzer von Unikaten und Nummern 1 bis 10 erscheinen nur, wenn sie es wünschen.", boardOptIn: "Mich in der Liste zeigen", holders: "{n} Besitzer",
  conflict: "Dieses Unikat war bereits vergeben. Ihre Zahlung wird erstattet.",
};
const ar: T = {
  uniqueTab: "قطع فريدة", uniqueLead: "كل قطعة من هذه موجودة مرة واحدة فقط في العالم. بعد الشراء يُنقش اسم المستخدم الخاص بكم عليها، ويعرض المتجر المالك على الدوام.",
  oneOfOne: "واحدة من واحدة", owner: "يملكها: @{u}", reserved: "يشتريها أحدهم الآن", founder: "سلسلة المؤسسين رقم {n} من 10", youGet: "ستحصلون على الرقم {n}", regular: "رقم {n} من 300",
  earnedTab: "مكتسبة", earnedLead: "هذه الملصقات لا تُشترى. تُكتسب بإنجاز حقيقي، وهي أرفع الملصقات مكانة.", notForSale: "ليست للبيع",
  e_hafiz: "حفظ جزء كامل مؤكد باختبار الشهادة.", e_khatm: "ختمة مكتملة.", e_qadr: "التعلم في كل ليلة من العشر الأواخر من رمضان.", e_100: "التعلم مئة يوم متتالية.", e_365: "التعلم ٣٦٥ يومًا متتالية.",
  board: "أندر المجموعات", boardLead: "عدد الأعضاء الذين يملكون كل ملصق. لا يظهر مالكو القطع الفريدة والأرقام من 1 إلى 10 إلا إذا اختاروا ذلك.", boardOptIn: "أظهروني في القائمة", holders: "{n} مالكين",
  conflict: "هذه القطعة الفريدة مأخوذة بالفعل. سيُعاد إليكم المبلغ.",
};
const tr: T = {
  uniqueTab: "Tek parçalar", uniqueLead: "Bunların her biri dünyada yalnızca bir kez vardır. Satın aldıktan sonra kullanıcı adınız üzerine işlenir ve mağaza sahibini kalıcı olarak gösterir.",
  oneOfOne: "Birden bir", owner: "Sahibi: @{u}", reserved: "Şu anda biri satın alıyor", founder: "Kurucu serisi No. {n} / 10", youGet: "No. {n} sizin olur", regular: "No. {n} / 300",
  earnedTab: "Kazanılanlar", earnedLead: "Bunlar satın alınamaz. Gerçek başarıyla kazanılır ve en prestijli çıkartmalardır.", notForSale: "Satılık değil",
  e_hafiz: "Sertifika sınavıyla onaylanmış ezberlenmiş bir cüz.", e_khatm: "Tamamlanmış bir hatim.", e_qadr: "Ramazan'ın son on gecesinin her birinde öğrenmek.", e_100: "Art arda 100 gün öğrenmek.", e_365: "Art arda 365 gün öğrenmek.",
  board: "En nadir koleksiyonlar", boardLead: "Her çıkartmaya kaç üyenin sahip olduğu. Tek parça ve 1-10 numara sahipleri yalnızca isterlerse görünür.", boardOptIn: "Beni listede göster", holders: "{n} sahip",
  conflict: "Bu tek parça zaten alınmıştı. Ödemeniz iade edilecek.",
};
const ur: T = {
  uniqueTab: "یکتا", uniqueLead: "ان میں سے ہر ایک پوری دنیا میں صرف ایک بار ہے۔ خریداری کے بعد آپ کا صارف نام اس پر کندہ ہوتا ہے اور اسٹور ہمیشہ مالک دکھاتا ہے۔",
  oneOfOne: "ایک میں سے ایک", owner: "مالک: @{u}", reserved: "کوئی ابھی خرید رہا ہے", founder: "بانی سلسلہ نمبر {n} از 10", youGet: "آپ کو نمبر {n} ملے گا", regular: "نمبر {n} از 300",
  earnedTab: "کمائے گئے", earnedLead: "یہ خریدے نہیں جا سکتے۔ یہ حقیقی کامیابی سے حاصل ہوتے ہیں اور سب سے معزز اسٹیکرز ہیں۔", notForSale: "فروخت کے لیے نہیں",
  e_hafiz: "ایک پارہ حفظ، سرٹیفکیٹ امتحان سے تصدیق شدہ۔", e_khatm: "ایک مکمل ختم۔", e_qadr: "رمضان کی آخری دس راتوں میں ہر رات سیکھنا۔", e_100: "مسلسل 100 دن سیکھنا۔", e_365: "مسلسل 365 دن سیکھنا۔",
  board: "نایاب ترین مجموعے", boardLead: "ہر اسٹیکر کتنے اراکین کے پاس ہے۔ یکتا اور نمبر 1 تا 10 کے مالکان صرف اپنی مرضی سے دکھائی دیتے ہیں۔", boardOptIn: "مجھے فہرست میں دکھائیں", holders: "{n} مالکان",
  conflict: "یہ یکتا پہلے ہی لیا جا چکا تھا۔ آپ کی رقم واپس کی جائے گی۔",
};
const fa: T = {
  uniqueTab: "یکتاها", uniqueLead: "هر یک از این‌ها در جهان فقط یک بار وجود دارد. پس از خرید نام کاربری شما روی آن حک می‌شود و فروشگاه مالک را برای همیشه نشان می‌دهد.",
  oneOfOne: "یکی از یک", owner: "مالک: @{u}", reserved: "کسی هم‌اکنون در حال خرید است", founder: "سری بنیان‌گذاران شمارهٔ {n} از 10", youGet: "شمارهٔ {n} از آنِ شما می‌شود", regular: "شمارهٔ {n} از 300",
  earnedTab: "به‌دست‌آمده", earnedLead: "این‌ها خریدنی نیستند. با دستاورد واقعی به دست می‌آیند و ارجمندترین برچسب‌ها هستند.", notForSale: "فروشی نیست",
  e_hafiz: "حفظ یک جزء که با آزمون گواهی تأیید شده است.", e_khatm: "یک ختم کامل.", e_qadr: "آموختن در هر یک از ده شب پایانی رمضان.", e_100: "صد روز پیاپی آموختن.", e_365: "۳۶۵ روز پیاپی آموختن.",
  board: "کمیاب‌ترین مجموعه‌ها", boardLead: "چند عضو هر برچسب را دارند. مالکان یکتاها و شماره‌های ۱ تا ۱۰ فقط به خواست خودشان نمایش داده می‌شوند.", boardOptIn: "مرا در فهرست نشان بده", holders: "{n} مالک",
  conflict: "این یکتا پیش‌تر برداشته شده بود. مبلغ شما بازگردانده می‌شود.",
};
const ps: T = {
  uniqueTab: "یوازیني", uniqueLead: "له دې هر یو په ټوله نړۍ کې یوازې یو ځل شته. له پېرود وروسته ستاسو کارن نوم پرې کښل کېږي او پلورنځی تل خاوند ښيي.",
  oneOfOne: "یو له یوه", owner: "خاوند: @{u}", reserved: "یو څوک یې همدا اوس اخلي", founder: "د بنسټګرو لړۍ شمېره {n} له 10", youGet: "تاسو شمېره {n} ترلاسه کوئ", regular: "شمېره {n} له 300",
  earnedTab: "ګټل شوي", earnedLead: "دا نه پلورل کېږي. د رښتینې لاسته راوړنې له لارې ګټل کېږي او تر ټولو ویاړلي سټیکرونه دي.", notForSale: "د پلور لپاره نه",
  e_hafiz: "یو پاره حفظ چې د سند ازموینې تایید کړې.", e_khatm: "یوه بشپړه ختمه.", e_qadr: "د رمضان د وروستیو لسو شپو په هره شپه زده کړه.", e_100: "پرله پسې ۱۰۰ ورځې زده کړه.", e_365: "پرله پسې ۳۶۵ ورځې زده کړه.",
  board: "تر ټولو نادرې ټولګې", boardLead: "څو غړي هر سټیکر لري. د یوازینیو او ۱ تر ۱۰ شمېرو خاوندان یوازې په خپله خوښه ښکاري.", boardOptIn: "ما په لېست کې وښایاست", holders: "{n} خاوندان",
  conflict: "دا یوازینی مخکې اخیستل شوی و. ستاسو پیسې به بېرته درکړل شي.",
};
const fr: T = {
  uniqueTab: "Pièces uniques", uniqueLead: "Chacune n'existe qu'une seule fois au monde. Après l'achat, votre nom d'utilisateur y est gravé et la boutique affiche le propriétaire pour toujours.",
  oneOfOne: "Une sur une", owner: "Propriétaire : @{u}", reserved: "Quelqu'un est en train de l'acheter", founder: "Série fondateurs N° {n} sur 10", youGet: "Vous recevez le N° {n}", regular: "N° {n} sur 300",
  earnedTab: "Mérités", earnedLead: "Ceux-ci ne s'achètent pas. Ils se méritent par une vraie réussite et sont les plus prestigieux de tous.", notForSale: "Pas à vendre",
  e_hafiz: "Un juz mémorisé et confirmé par l'examen de certificat.", e_khatm: "Une khatm achevée.", e_qadr: "Avoir appris chacune des dix dernières nuits du Ramadan.", e_100: "100 jours d'apprentissage d'affilée.", e_365: "365 jours d'apprentissage d'affilée.",
  board: "Collections les plus rares", boardLead: "Combien de membres possèdent chaque sticker. Les propriétaires de pièces uniques et des numéros 1 à 10 n'apparaissent que s'ils le souhaitent.", boardOptIn: "M'afficher dans la liste", holders: "{n} propriétaires",
  conflict: "Cette pièce unique était déjà prise. Votre paiement sera remboursé.",
};
const es: T = {
  uniqueTab: "Piezas únicas", uniqueLead: "Cada una existe una sola vez en el mundo. Tras la compra, su nombre de usuario queda grabado y la tienda muestra al propietario para siempre.",
  oneOfOne: "Una de una", owner: "Propietario: @{u}", reserved: "Alguien la está comprando ahora", founder: "Serie fundadores N.º {n} de 10", youGet: "Usted recibe el N.º {n}", regular: "N.º {n} de 300",
  earnedTab: "Ganados", earnedLead: "Estos no se pueden comprar. Se ganan con logros reales y son los stickers más prestigiosos.", notForSale: "No está a la venta",
  e_hafiz: "Un yuz memorizado y confirmado en el examen de certificado.", e_khatm: "Una jatma completada.", e_qadr: "Haber aprendido cada una de las diez últimas noches de Ramadán.", e_100: "100 días seguidos de aprendizaje.", e_365: "365 días seguidos de aprendizaje.",
  board: "Colecciones más raras", boardLead: "Cuántos miembros tienen cada sticker. Los propietarios de piezas únicas y de los números 1 a 10 solo aparecen si lo desean.", boardOptIn: "Mostrarme en la lista", holders: "{n} propietarios",
  conflict: "Esta pieza única ya estaba adjudicada. Se le reembolsará el pago.",
};
const id: T = {
  uniqueTab: "Satu-satunya", uniqueLead: "Masing-masing hanya ada satu di seluruh dunia. Setelah dibeli, nama pengguna Anda terukir di atasnya dan toko selalu menampilkan pemiliknya.",
  oneOfOne: "Satu dari satu", owner: "Pemilik: @{u}", reserved: "Sedang dibeli seseorang", founder: "Seri pendiri No. {n} dari 10", youGet: "Anda menerima No. {n}", regular: "No. {n} dari 300",
  earnedTab: "Diraih", earnedLead: "Stiker ini tidak dijual. Diraih melalui pencapaian nyata dan merupakan yang paling bergengsi.", notForSale: "Tidak dijual",
  e_hafiz: "Satu juz dihafal dan dikonfirmasi ujian sertifikat.", e_khatm: "Satu khatam selesai.", e_qadr: "Belajar di setiap sepuluh malam terakhir Ramadan.", e_100: "Belajar 100 hari berturut-turut.", e_365: "Belajar 365 hari berturut-turut.",
  board: "Koleksi paling langka", boardLead: "Berapa anggota yang memiliki setiap stiker. Pemilik satu-satunya dan nomor 1-10 hanya tampil jika mereka mau.", boardOptIn: "Tampilkan saya di daftar", holders: "{n} pemilik",
  conflict: "Barang satu-satunya ini sudah dimiliki orang lain. Pembayaran Anda akan dikembalikan.",
};
const ms: T = {
  ...id,
  uniqueTab: "Unik", uniqueLead: "Setiap satu wujud sekali sahaja di seluruh dunia. Selepas dibeli, nama pengguna anda diukir padanya dan kedai sentiasa memaparkan pemiliknya.",
  reserved: "Sedang dibeli oleh seseorang", founder: "Siri pengasas No. {n} daripada 10", youGet: "Anda menerima No. {n}", regular: "No. {n} daripada 300",
  earnedLead: "Pelekat ini tidak dijual. Ia diraih melalui pencapaian sebenar dan paling berprestij.",
  board: "Koleksi paling jarang", boardLead: "Berapa ramai ahli memiliki setiap pelekat. Pemilik item unik dan nombor 1-10 dipaparkan hanya jika mereka mahu.", boardOptIn: "Paparkan saya dalam senarai",
  conflict: "Item unik ini telah dimiliki orang lain. Bayaran anda akan dipulangkan.",
};
const bn: T = {
  uniqueTab: "অনন্য", uniqueLead: "এগুলোর প্রতিটি সারা বিশ্বে মাত্র একবার আছে। কেনার পর আপনার ব্যবহারকারী নাম খোদাই হয় এবং স্টোর চিরকাল মালিক দেখায়।",
  oneOfOne: "একের মধ্যে এক", owner: "মালিক: @{u}", reserved: "কেউ এখন কিনছেন", founder: "প্রতিষ্ঠাতা সিরিজ নং {n} / 10", youGet: "আপনি নং {n} পাবেন", regular: "নং {n} / 300",
  earnedTab: "অর্জিত", earnedLead: "এগুলো কেনা যায় না। সত্যিকারের অর্জনে পাওয়া যায় এবং এগুলোই সবচেয়ে মর্যাদাপূর্ণ।", notForSale: "বিক্রির জন্য নয়",
  e_hafiz: "সার্টিফিকেট পরীক্ষায় নিশ্চিত একটি পারা হিফজ।", e_khatm: "একটি সম্পূর্ণ খতম।", e_qadr: "রমজানের শেষ দশ রাতের প্রতিটিতে শেখা।", e_100: "টানা ১০০ দিন শেখা।", e_365: "টানা ৩৬৫ দিন শেখা।",
  board: "দুর্লভতম সংগ্রহ", boardLead: "প্রতিটি স্টিকার কতজন সদস্যের আছে। অনন্য ও ১-১০ নম্বরের মালিকরা শুধু নিজেরা চাইলে দেখা যান।", boardOptIn: "তালিকায় আমাকে দেখান", holders: "{n} জন মালিক",
  conflict: "এই অনন্যটি আগেই নেওয়া হয়েছিল। আপনার অর্থ ফেরত দেওয়া হবে।",
};
const ru: T = {
  uniqueTab: "Уникаты", uniqueLead: "Каждый из них существует в мире лишь в одном экземпляре. После покупки на нём гравируется Ваше имя пользователя, и магазин всегда показывает владельца.",
  oneOfOne: "Один из одного", owner: "Владелец: @{u}", reserved: "Сейчас кто-то покупает", founder: "Серия основателей № {n} из 10", youGet: "Вы получите № {n}", regular: "№ {n} из 300",
  earnedTab: "Заслуженные", earnedLead: "Их нельзя купить. Они даются за настоящие достижения и ценятся выше всех.", notForSale: "Не продаётся",
  e_hafiz: "Выученный наизусть джуз, подтверждённый экзаменом на сертификат.", e_khatm: "Завершённый хатм.", e_qadr: "Учёба в каждую из последних десяти ночей Рамадана.", e_100: "100 дней учёбы подряд.", e_365: "365 дней учёбы подряд.",
  board: "Редчайшие коллекции", boardLead: "Сколько участников владеют каждым стикером. Владельцы уникатов и номеров 1-10 видны только по их желанию.", boardOptIn: "Показывать меня в списке", holders: "Владельцев: {n}",
  conflict: "Этот уникат уже был занят. Ваш платёж будет возвращён.",
};
const zh: T = {
  uniqueTab: "孤品", uniqueLead: "每件在全世界仅有一件。购买后将刻上您的用户名，商店将永久显示其拥有者。",
  oneOfOne: "唯一孤品", owner: "拥有者：@{u}", reserved: "有人正在购买", founder: "创始系列第 {n} 号（共 10）", youGet: "您将获得第 {n} 号", regular: "第 {n} 号（共 300）",
  earnedTab: "成就", earnedLead: "这些贴纸不可购买，只能凭真实成就获得，是最尊贵的贴纸。", notForSale: "非卖品",
  e_hafiz: "背记一卷并通过证书考试确认。", e_khatm: "完成一次通读。", e_qadr: "在斋月最后十夜的每一夜都学习。", e_100: "连续学习 100 天。", e_365: "连续学习 365 天。",
  board: "最稀有收藏", boardLead: "每张贴纸的拥有人数。孤品与 1-10 号的拥有者仅在本人同意时显示。", boardOptIn: "在列表中显示我", holders: "{n} 位拥有者",
  conflict: "此孤品已被他人获得，您的付款将被退还。",
};

const ALL = { en, de, ar, tr, ur, fa, ps, fr, es, id, ms, bn, ru, zh };
export function useLuxText(): T { const { lang } = useLang(); return pick(ALL, lang); }
