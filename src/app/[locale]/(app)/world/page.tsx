import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/locales";
import { pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { ArrowNext } from "@/components/Icons";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IslamArcadeLine, IslamCorners, IslamDome, IslamMosque, IslamNum, IslamRain, saw, starPath } from "@/components/art/IslamArt";

// Rounded estimates for 2010 from the Pew Research Center ("The Future of the Global Muslim Population", 2011);
// projection for 2050 from Pew ("The Future of World Religions", 2015). Shown as orientation, not as exact census data.
const COUNTRIES: { id: string; de: string; en: string; ar: string; m: number; pct: number }[] = [
  { id: "id", de: "Indonesien", en: "Indonesia", ar: "إندونيسيا", m: 205, pct: 88 },
  { id: "pk", de: "Pakistan", en: "Pakistan", ar: "باكستان", m: 178, pct: 96 },
  { id: "in", de: "Indien", en: "India", ar: "الهند", m: 177, pct: 15 },
  { id: "bd", de: "Bangladesch", en: "Bangladesh", ar: "بنغلاديش", m: 149, pct: 90 },
  { id: "eg", de: "Ägypten", en: "Egypt", ar: "مصر", m: 80, pct: 95 },
  { id: "ng", de: "Nigeria", en: "Nigeria", ar: "نيجيريا", m: 76, pct: 48 },
  { id: "ir", de: "Iran", en: "Iran", ar: "إيران", m: 75, pct: 99 },
  { id: "tr", de: "Türkei", en: "Turkey", ar: "تركيا", m: 75, pct: 98 },
  { id: "dz", de: "Algerien", en: "Algeria", ar: "الجزائر", m: 35, pct: 98 },
  { id: "ma", de: "Marokko", en: "Morocco", ar: "المغرب", m: 32, pct: 99 },
  { id: "iq", de: "Irak", en: "Iraq", ar: "العراق", m: 31, pct: 99 },
  { id: "af", de: "Afghanistan", en: "Afghanistan", ar: "أفغانستان", m: 29, pct: 99 },
  { id: "sa", de: "Saudi-Arabien", en: "Saudi Arabia", ar: "السعودية", m: 26, pct: 97 },
  { id: "my", de: "Malaysia", en: "Malaysia", ar: "ماليزيا", m: 17, pct: 61 },
  { id: "ae", de: "Vereinigte Arabische Emirate", en: "United Arab Emirates", ar: "الإمارات العربية المتحدة", m: 3.6, pct: 76 },
];
const REGIONS: { de: string; en: string; ar: string; pct: number; color: string }[] = [
  { de: "Asien und Pazifik", en: "Asia-Pacific", ar: "آسيا والمحيط الهادئ", pct: 62, color: "rgb(var(--accent))" },
  { de: "Naher Osten und Nordafrika", en: "Middle East & North Africa", ar: "الشرق الأوسط وشمال أفريقيا", pct: 20, color: "rgb(var(--gold))" },
  { de: "Afrika südlich der Sahara", en: "Sub-Saharan Africa", ar: "أفريقيا جنوب الصحراء", pct: 15, color: "#5b8c7a" },
  { de: "Europa", en: "Europe", ar: "أوروبا", pct: 2.4, color: "#a3825a" },
  { de: "Amerika", en: "Americas", ar: "الأمريكتان", pct: 0.3, color: "#9aa5a0" },
];

// Region names for the other languages, in the order of REGIONS (Asia-Pacific, Middle East & North Africa, Sub-Saharan Africa, Europe, Americas)
const REGION_NAMES: Partial<Record<AppLocale, string[]>> = {
  tr: ["Asya-Pasifik", "Orta Doğu ve Kuzey Afrika", "Sahra Altı Afrika", "Avrupa", "Amerika"],
  ur: ["ایشیا و بحرالکاہل", "مشرقِ وسطیٰ و شمالی افریقہ", "ذیلی صحارا افریقہ", "یورپ", "امریکہ"],
  fa: ["آسیا و اقیانوسیه", "خاورمیانه و شمال آفریقا", "آفریقای جنوب صحرا", "اروپا", "قاره آمریکا"],
  ps: ["آسیا او پاسفیک", "منځنی ختیځ او شمالي افریقا", "د صحرا سویلي افریقا", "اروپا", "امریکا"],
  fr: ["Asie-Pacifique", "Moyen-Orient et Afrique du Nord", "Afrique subsaharienne", "Europe", "Amériques"],
  es: ["Asia-Pacífico", "Oriente Medio y norte de África", "África subsahariana", "Europa", "América"],
  id: ["Asia-Pasifik", "Timur Tengah dan Afrika Utara", "Afrika Sub-Sahara", "Eropa", "Benua Amerika"],
  ms: ["Asia-Pasifik", "Timur Tengah dan Afrika Utara", "Afrika Sub-Sahara", "Eropah", "Benua Amerika"],
  bn: ["এশিয়া-প্যাসিফিক", "মধ্যপ্রাচ্য ও উত্তর আফ্রিকা", "সাব-সাহারান আফ্রিকা", "ইউরোপ", "আমেরিকা"],
  ru: ["Азиатско-Тихоокеанский регион", "Ближний Восток и Северная Африка", "Африка к югу от Сахары", "Европа", "Америка"],
  zh: ["亚太地区", "中东和北非", "撒哈拉以南非洲", "欧洲", "美洲"],
};

type Text = { kicker: string; title: string; lead: string; stats: string[][]; regions: string; top: string; mio: string; share: string; uae: string; schools: string; schoolsBody: string; schoolsLink: string; note: string; learn: string };
const C: Record<AppLocale, Text> = {
  de: { kicker: "Die Umma weltweit", title: "Muslime in der Welt – wo der Koran zu Hause ist", lead: "Mehr als jeder fünfte Mensch auf der Erde ist Muslim. Die meisten leben nicht in der arabischen Welt, sondern in Asien – von Indonesien bis Bangladesch. Diese Seite zeigt, wie vielfältig die Umma ist, für die der Koran in so vielen Sprachen gelernt wird.", stats: [["≈ 1,6 Mrd.", "Muslime im Jahr 2010"], ["≈ 23 %", "der Weltbevölkerung"], ["≈ 2,8 Mrd.", "erwartet für 2050 (Projektion)"]], regions: "Wo Muslime leben (Anteil an allen Muslimen, 2010)", top: "Länder mit den meisten Muslimen", mio: "Mio.", share: "Anteil an der Bevölkerung", uae: "In den Emiraten leben Menschen aus mehr als 200 Nationen zusammen – Muslime aus aller Welt beten hier Seite an Seite.", schools: "Sunniten und Schiiten", schoolsBody: "Nach Schätzungen des Pew Research Center (2009) sind etwa 87–90 % der Muslime Sunniten und etwa 10–13 % Schiiten. Beide teilen den einen Koran, die eine Qibla und den einen Propheten ﷺ.", schoolsLink: "Mehr über Sunniten und Schiiten", note: "Gerundete Schätzungen des Pew Research Center für 2010 („The Future of the Global Muslim Population“, 2011) und die Projektion für 2050 („The Future of World Religions“, 2015). Heutige Zahlen weichen ab; sie dienen der Orientierung.", learn: "Den Koran in deiner Sprache lernen" },
  en: { kicker: "The Ummah worldwide", title: "Muslims around the world – where the Quran is at home", lead: "More than one in five people on earth is Muslim. Most do not live in the Arab world but in Asia – from Indonesia to Bangladesh. This page shows how diverse the Ummah is for whom the Quran is learned in so many languages.", stats: [["≈ 1.6 bn", "Muslims in 2010"], ["≈ 23 %", "of the world population"], ["≈ 2.8 bn", "expected by 2050 (projection)"]], regions: "Where Muslims live (share of all Muslims, 2010)", top: "Countries with the most Muslims", mio: "m", share: "share of the population", uae: "In the Emirates people from more than 200 nations live together – Muslims from all over the world pray here side by side.", schools: "Sunni and Shia", schoolsBody: "According to Pew Research Center estimates (2009), about 87–90 % of Muslims are Sunni and about 10–13 % Shia. Both share the one Quran, the one qibla and the one Prophet ﷺ.", schoolsLink: "More about Sunni and Shia", note: "Rounded estimates by the Pew Research Center for 2010 (“The Future of the Global Muslim Population”, 2011) and the projection for 2050 (“The Future of World Religions”, 2015). Today's figures differ; they are meant for orientation.", learn: "Learn the Quran in your language" },
  ar: { kicker: "الأمة حول العالم", title: "المسلمون في العالم – حيث يسكن القرآن", lead: "أكثر من واحد من كل خمسة أشخاص على الأرض مسلم، وأكثرهم لا يعيشون في العالم العربي بل في آسيا، من إندونيسيا إلى بنغلاديش. تُظهر هذه الصفحة تنوّع الأمة التي يُتعلَّم القرآن فيها بلغات كثيرة.", stats: [["≈ ١٫٦ مليار", "مسلم عام 2010"], ["≈ ٢٣٪", "من سكان العالم"], ["≈ ٢٫٨ مليار", "متوقّع عام 2050 (تقدير)"]], regions: "أين يعيش المسلمون (نسبةً إلى جميع المسلمين، 2010)", top: "الدول الأكثر عددًا من المسلمين", mio: "مليون", share: "النسبة من السكان", uae: "في الإمارات يعيش أناس من أكثر من 200 جنسية، ويصلّي المسلمون من أنحاء العالم جنبًا إلى جنب.", schools: "أهل السنة والشيعة", schoolsBody: "بحسب تقديرات مركز بيو للأبحاث (2009) يشكّل أهل السنة نحو 87–90٪ من المسلمين، والشيعة نحو 10–13٪، ويجمعهم القرآن الواحد والقبلة الواحدة والنبي الواحد ﷺ.", schoolsLink: "المزيد عن أهل السنة والشيعة", note: "تقديرات مقرّبة من مركز بيو للأبحاث لعام 2010 (مستقبل السكان المسلمين في العالم، 2011)، وتقدير عام 2050 (مستقبل أديان العالم، 2015). الأرقام الحالية مختلفة، وهي للاستئناس.", learn: "تعلّم القرآن بلغتك" },
  tr: { kicker: "Dünya çapında ümmet", title: "Dünyada Müslümanlar – Kur'an'ın yurt tuttuğu yerler", lead: "Yeryüzündeki her beş kişiden birinden fazlası Müslümandır. Çoğu Arap dünyasında değil, Endonezya'dan Bangladeş'e uzanan Asya'da yaşıyor. Bu sayfa, Kur'an'ın pek çok dilde öğrenildiği ümmetin ne kadar çeşitli olduğunu gösteriyor.", stats: [["≈ 1,6 milyar", "2010'da Müslüman"], ["≈ %23", "dünya nüfusunun"], ["≈ 2,8 milyar", "2050 için beklenen (projeksiyon)"]], regions: "Müslümanlar nerede yaşıyor? (tüm Müslümanlar içindeki pay, 2010)", top: "En çok Müslümanın yaşadığı ülkeler", mio: "milyon", share: "nüfus içindeki pay", uae: "Emirlikler'de 200'den fazla milletten insan bir arada yaşıyor – dünyanın dört bir yanından Müslümanlar burada omuz omuza namaz kılıyor.", schools: "Sünnîler ve Şiîler", schoolsBody: "Pew Research Center'ın tahminlerine göre (2009) Müslümanların yaklaşık %87–90'ı Sünnî, yaklaşık %10–13'ü Şiîdir. İkisi de tek bir Kur'an'ı, tek bir kıbleyi ve tek bir Peygamber'i ﷺ paylaşır.", schoolsLink: "Sünnîler ve Şiîler hakkında daha fazlası", note: "Pew Research Center'ın 2010 için yuvarlatılmış tahminleri (“The Future of the Global Muslim Population”, 2011) ve 2050 projeksiyonu (“The Future of World Religions”, 2015). Bugünkü rakamlar farklıdır; yalnızca fikir vermek içindir.", learn: "Kur'an'ı kendi dilinizde öğrenin" },
  ur: { kicker: "دنیا بھر کی امت", title: "دنیا کے مسلمان – جہاں قرآن بسا ہوا ہے", lead: "روئے زمین پر ہر پانچ میں سے ایک سے زیادہ انسان مسلمان ہے۔ ان میں سے اکثر عرب دنیا میں نہیں بلکہ ایشیا میں رہتے ہیں – انڈونیشیا سے بنگلہ دیش تک۔ یہ صفحہ دکھاتا ہے کہ وہ امت کتنی متنوع ہے جس کے لیے قرآن اتنی زبانوں میں سیکھا جاتا ہے۔", stats: [["≈ 1.6 ارب", "2010 میں مسلمان"], ["≈ 23%", "عالمی آبادی کا"], ["≈ 2.8 ارب", "2050 تک متوقع (تخمینہ)"]], regions: "مسلمان کہاں رہتے ہیں (تمام مسلمانوں میں حصہ، 2010)", top: "سب سے زیادہ مسلمانوں والے ممالک", mio: "ملین", share: "آبادی میں حصہ", uae: "امارات میں 200 سے زیادہ قوموں کے لوگ مل جل کر رہتے ہیں – دنیا بھر کے مسلمان یہاں کندھے سے کندھا ملا کر نماز پڑھتے ہیں۔", schools: "سنی اور شیعہ", schoolsBody: "پیو ریسرچ سینٹر کے تخمینوں (2009) کے مطابق تقریباً 87–90% مسلمان سنی اور تقریباً 10–13% شیعہ ہیں۔ دونوں کا ایک ہی قرآن، ایک ہی قبلہ اور ایک ہی نبی ﷺ ہے۔", schoolsLink: "سنی اور شیعہ کے بارے میں مزید", note: "پیو ریسرچ سینٹر کے 2010 کے لیے تقریبی تخمینے (“The Future of the Global Muslim Population”، 2011) اور 2050 کا تخمینہ (“The Future of World Religions”، 2015)۔ موجودہ اعداد و شمار مختلف ہیں؛ یہ صرف اندازے کے لیے ہیں۔", learn: "قرآن اپنی زبان میں سیکھیں" },
  fa: { kicker: "امت اسلام در جهان", title: "مسلمانان جهان – جایی که قرآن در آن خانه دارد", lead: "بیش از یک نفر از هر پنج نفر روی زمین مسلمان است. بیشتر آنان نه در جهان عرب، بلکه در آسیا زندگی می‌کنند – از اندونزی تا بنگلادش. این صفحه نشان می‌دهد امتی که قرآن برای آن به این همه زبان آموخته می‌شود چقدر متنوع است.", stats: [["≈ 1.6 میلیارد", "مسلمان در سال 2010"], ["≈ 23%", "جمعیت جهان"], ["≈ 2.8 میلیارد", "پیش‌بینی برای سال 2050 (برآورد)"]], regions: "مسلمانان کجا زندگی می‌کنند (سهم از همه مسلمانان، 2010)", top: "کشورهایی با بیشترین مسلمان", mio: "میلیون", share: "سهم از جمعیت", uae: "در امارات مردمی از بیش از 200 ملت کنار هم زندگی می‌کنند – مسلمانان از سراسر جهان اینجا شانه به شانه نماز می‌گزارند.", schools: "اهل سنت و شیعه", schoolsBody: "بر پایه برآوردهای مرکز پژوهشی پیو (2009)، حدود 87–90% مسلمانان سنی و حدود 10–13% شیعه‌اند. هر دو یک قرآن، یک قبله و یک پیامبر ﷺ دارند.", schoolsLink: "بیشتر درباره اهل سنت و شیعه", note: "برآوردهای گردشده مرکز پژوهشی پیو برای سال 2010 («The Future of the Global Muslim Population»، 2011) و پیش‌بینی سال 2050 («The Future of World Religions»، 2015). ارقام امروز متفاوت است؛ این ارقام فقط برای آشنایی کلی‌اند.", learn: "قرآن را به زبان خودتان یاد بگیرید" },
  ps: { kicker: "په نړۍ کې امت", title: "په نړۍ کې مسلمانان – چېرته چې قرآن کور لري", lead: "پر ځمکه له هرو پنځو کسانو څخه له یو کس ډېر مسلمان دی. ډېری یې په عربي نړۍ کې نه، بلکې په آسیا کې ژوند کوي – له اندونیزیا څخه تر بنګله دېش پورې. دا پاڼه ښيي چې هغه امت څومره ډول ډول دی چې قرآن ورته په ډېرو ژبو زده کېږي.", stats: [["≈ 1.6 ملیارده", "په 2010 کې مسلمانان"], ["≈ 23%", "د نړۍ د نفوس"], ["≈ 2.8 ملیارده", "تر 2050 پورې متوقع (اټکل)"]], regions: "مسلمانان چېرته ژوند کوي (د ټولو مسلمانانو ونډه، 2010)", top: "هغه هېوادونه چې ډېر مسلمانان لري", mio: "ملیونه", share: "د نفوس ونډه", uae: "په اماراتو کې د 200 څخه زیاتو ملتونو خلک یو ځای ژوند کوي – د نړۍ له هر ګوټه مسلمانان دلته اوږه په اوږه لمونځ کوي.", schools: "سنیان او شیعه", schoolsBody: "د پیو څېړنیز مرکز د اټکلونو له مخې (2009) نژدې 87–90% مسلمانان سنیان او نژدې 10–13% شیعه دي. دواړه یو قرآن، یو قبله او یو پیغمبر ﷺ لري.", schoolsLink: "د سنیانو او شیعه ګانو په اړه نور", note: "د پیو څېړنیز مرکز ګردې شوې اټکلونه د 2010 لپاره («The Future of the Global Muslim Population»، 2011) او د 2050 اټکل («The Future of World Religions»، 2015). د نن ورځې شمېرې توپیر لري؛ یوازې د لیدلوري لپاره دي.", learn: "قرآن په خپله ژبه زده کړئ" },
  fr: { kicker: "L'Oumma dans le monde", title: "Les musulmans dans le monde – là où le Coran est chez lui", lead: "Plus d'une personne sur cinq sur terre est musulmane. La plupart ne vivent pas dans le monde arabe, mais en Asie – de l'Indonésie au Bangladesh. Cette page montre la diversité de l'Oumma, pour qui le Coran s'apprend dans tant de langues.", stats: [["≈ 1,6 milliard", "de musulmans en 2010"], ["≈ 23 %", "de la population mondiale"], ["≈ 2,8 milliards", "attendus en 2050 (projection)"]], regions: "Où vivent les musulmans (part de l'ensemble des musulmans, 2010)", top: "Les pays comptant le plus de musulmans", mio: "millions", share: "part de la population", uae: "Aux Émirats, des personnes de plus de 200 nations vivent ensemble – des musulmans du monde entier prient ici côte à côte.", schools: "Sunnites et chiites", schoolsBody: "Selon les estimations du Pew Research Center (2009), environ 87–90 % des musulmans sont sunnites et environ 10–13 % chiites. Tous partagent le même Coran, la même qibla et le même Prophète ﷺ.", schoolsLink: "En savoir plus sur les sunnites et les chiites", note: "Estimations arrondies du Pew Research Center pour 2010 (« The Future of the Global Muslim Population », 2011) et projection pour 2050 (« The Future of World Religions », 2015). Les chiffres actuels diffèrent ; ils servent de repère.", learn: "Apprends le Coran dans ta langue" },
  es: { kicker: "La Umma en el mundo", title: "Musulmanes en el mundo: donde el Corán está en casa", lead: "Más de una de cada cinco personas en la Tierra es musulmana. La mayoría no vive en el mundo árabe, sino en Asia, desde Indonesia hasta Bangladés. Esta página muestra lo diversa que es la Umma, para la cual el Corán se aprende en tantos idiomas.", stats: [["≈ 1600 millones", "de musulmanes en 2010"], ["≈ 23 %", "de la población mundial"], ["≈ 2800 millones", "previstos para 2050 (proyección)"]], regions: "Dónde viven los musulmanes (parte del total de musulmanes, 2010)", top: "Países con más musulmanes", mio: "millones", share: "proporción de la población", uae: "En los Emiratos conviven personas de más de 200 naciones: musulmanes de todo el mundo rezan aquí codo con codo.", schools: "Suníes y chiíes", schoolsBody: "Según estimaciones del Pew Research Center (2009), alrededor del 87–90 % de los musulmanes son suníes y alrededor del 10–13 %, chiíes. Todos comparten un solo Corán, una sola qibla y un solo Profeta ﷺ.", schoolsLink: "Más sobre suníes y chiíes", note: "Estimaciones redondeadas del Pew Research Center para 2010 («The Future of the Global Muslim Population», 2011) y proyección para 2050 («The Future of World Religions», 2015). Las cifras actuales difieren; sirven como orientación.", learn: "Aprende el Corán en tu idioma" },
  id: { kicker: "Umat Islam di seluruh dunia", title: "Muslim di seluruh dunia – tempat Al-Qur'an berada di rumahnya", lead: "Lebih dari satu dari lima orang di bumi adalah Muslim. Sebagian besar tidak tinggal di dunia Arab, melainkan di Asia – dari Indonesia sampai Bangladesh. Halaman ini menunjukkan betapa beragamnya umat yang mempelajari Al-Qur'an dalam begitu banyak bahasa.", stats: [["≈ 1,6 miliar", "Muslim pada 2010"], ["≈ 23%", "dari penduduk dunia"], ["≈ 2,8 miliar", "diperkirakan pada 2050 (proyeksi)"]], regions: "Di mana Muslim tinggal (bagian dari seluruh Muslim, 2010)", top: "Negara dengan Muslim terbanyak", mio: "juta", share: "persentase dari penduduk", uae: "Di Emirat, orang-orang dari lebih dari 200 bangsa hidup bersama – Muslim dari seluruh dunia salat di sini bahu-membahu.", schools: "Sunni dan Syiah", schoolsBody: "Menurut perkiraan Pew Research Center (2009), sekitar 87–90% Muslim adalah Sunni dan sekitar 10–13% Syiah. Keduanya memiliki satu Al-Qur'an, satu kiblat, dan satu Nabi ﷺ.", schoolsLink: "Selengkapnya tentang Sunni dan Syiah", note: "Perkiraan yang dibulatkan dari Pew Research Center untuk 2010 (“The Future of the Global Muslim Population”, 2011) dan proyeksi untuk 2050 (“The Future of World Religions”, 2015). Angka hari ini berbeda; angka ini hanya sebagai gambaran.", learn: "Pelajari Al-Qur'an dalam bahasa Anda" },
  ms: { kicker: "Ummah di seluruh dunia", title: "Umat Islam di seluruh dunia – tempat Quran berada di rumahnya", lead: "Lebih daripada satu dalam lima orang di bumi ialah Muslim. Kebanyakannya tidak tinggal di dunia Arab tetapi di Asia – dari Indonesia hingga Bangladesh. Halaman ini menunjukkan betapa pelbagainya ummah yang mempelajari Quran dalam begitu banyak bahasa.", stats: [["≈ 1.6 bilion", "Muslim pada 2010"], ["≈ 23%", "daripada penduduk dunia"], ["≈ 2.8 bilion", "dijangka pada 2050 (unjuran)"]], regions: "Di mana umat Islam tinggal (bahagian daripada semua Muslim, 2010)", top: "Negara dengan paling ramai Muslim", mio: "juta", share: "peratusan daripada penduduk", uae: "Di Emirat, orang daripada lebih 200 bangsa hidup bersama – umat Islam dari seluruh dunia bersolat di sini bahu ke bahu.", schools: "Sunni dan Syiah", schoolsBody: "Menurut anggaran Pew Research Center (2009), kira-kira 87–90% umat Islam ialah Sunni dan kira-kira 10–13% ialah Syiah. Kedua-duanya berkongsi satu Quran, satu kiblat dan satu Nabi ﷺ.", schoolsLink: "Lebih lanjut tentang Sunni dan Syiah", note: "Anggaran yang dibundarkan oleh Pew Research Center untuk 2010 (“The Future of the Global Muslim Population”, 2011) dan unjuran untuk 2050 (“The Future of World Religions”, 2015). Angka hari ini berbeza; ia hanya sebagai panduan.", learn: "Pelajari Quran dalam bahasa anda" },
  bn: { kicker: "বিশ্বজুড়ে উম্মাহ", title: "বিশ্বের মুসলিম – যেখানে কুরআনের ঘর", lead: "পৃথিবীর প্রতি পাঁচজনে একজনেরও বেশি মানুষ মুসলিম। তাঁদের অধিকাংশ আরব বিশ্বে নয়, এশিয়ায় বাস করেন – ইন্দোনেশিয়া থেকে বাংলাদেশ পর্যন্ত। যে উম্মাহর জন্য এত ভাষায় কুরআন শেখা হয়, সেই উম্মাহ কত বৈচিত্র্যময়, এই পৃষ্ঠা তা দেখায়।", stats: [["≈ 1.6 বিলিয়ন", "2010 সালে মুসলিম"], ["≈ 23%", "বিশ্বের জনসংখ্যার"], ["≈ 2.8 বিলিয়ন", "2050 সালের জন্য প্রত্যাশিত (পূর্বাভাস)"]], regions: "মুসলিমরা কোথায় বাস করেন (সব মুসলিমের মধ্যে অংশ, 2010)", top: "যেসব দেশে মুসলিম সবচেয়ে বেশি", mio: "মিলিয়ন", share: "জনসংখ্যার অংশ", uae: "আমিরাতে 200-র বেশি জাতির মানুষ একসঙ্গে বাস করেন – বিশ্বের নানা প্রান্তের মুসলিম এখানে কাঁধে কাঁধ মিলিয়ে নামাজ পড়েন।", schools: "সুন্নি ও শিয়া", schoolsBody: "পিউ রিসার্চ সেন্টারের অনুমান (2009) অনুযায়ী প্রায় 87–90% মুসলিম সুন্নি এবং প্রায় 10–13% শিয়া। উভয়ের এক কুরআন, এক কিবলা ও এক নবী ﷺ।", schoolsLink: "সুন্নি ও শিয়া সম্পর্কে আরও", note: "পিউ রিসার্চ সেন্টারের 2010 সালের জন্য গোলাকৃত অনুমান (“The Future of the Global Muslim Population”, 2011) এবং 2050 সালের পূর্বাভাস (“The Future of World Religions”, 2015)। আজকের সংখ্যা ভিন্ন; এগুলো কেবল ধারণা দেওয়ার জন্য।", learn: "নিজের ভাষায় কুরআন শিখুন" },
  ru: { kicker: "Умма во всём мире", title: "Мусульмане мира – где у Корана родной дом", lead: "Больше каждого пятого человека на Земле – мусульманин. Большинство живёт не в арабском мире, а в Азии – от Индонезии до Бангладеш. Эта страница показывает, насколько разнообразна умма, для которой Коран изучают на стольких языках.", stats: [["≈ 1,6 млрд", "мусульман в 2010 году"], ["≈ 23 %", "населения мира"], ["≈ 2,8 млрд", "ожидается к 2050 году (прогноз)"]], regions: "Где живут мусульмане (доля от всех мусульман, 2010)", top: "Страны с наибольшим числом мусульман", mio: "млн", share: "доля населения", uae: "В Эмиратах вместе живут люди более чем 200 национальностей – мусульмане со всего мира молятся здесь плечом к плечу.", schools: "Сунниты и шииты", schoolsBody: "По оценкам Pew Research Center (2009), около 87–90 % мусульман – сунниты и около 10–13 % – шииты. У тех и других один Коран, одна кибла и один Пророк ﷺ.", schoolsLink: "Подробнее о суннитах и шиитах", note: "Округлённые оценки Pew Research Center на 2010 год («The Future of the Global Muslim Population», 2011) и прогноз на 2050 год («The Future of World Religions», 2015). Сегодняшние цифры отличаются; они приведены для ориентира.", learn: "Учи Коран на своём языке" },
  zh: { kicker: "全球的乌玛", title: "世界各地的穆斯林——古兰经安家的地方", lead: "地球上每五个人中就有一个以上是穆斯林。他们大多不住在阿拉伯世界，而是生活在亚洲——从印度尼西亚到孟加拉国。本页展示这个社群有多么多元：人们用如此多的语言学习古兰经。", stats: [["≈ 16 亿", "2010 年的穆斯林"], ["≈ 23%", "占世界人口"], ["≈ 28 亿", "预计 2050 年（推算）"]], regions: "穆斯林生活在哪里（占全部穆斯林的比例，2010 年）", top: "穆斯林人数最多的国家", mio: "百万", share: "占人口比例", uae: "在阿联酋，来自 200 多个国家的人们生活在一起——世界各地的穆斯林在这里并肩礼拜。", schools: "逊尼派与什叶派", schoolsBody: "据皮尤研究中心估计（2009 年），约 87–90% 的穆斯林是逊尼派，约 10–13% 是什叶派。两者共享同一部古兰经、同一个礼拜朝向（基卜拉）和同一位先知ﷺ。", schoolsLink: "进一步了解逊尼派与什叶派", note: "皮尤研究中心对 2010 年的四舍五入估计（《The Future of the Global Muslim Population》，2011）以及对 2050 年的推算（《The Future of World Religions》，2015）。如今的数字有所不同；仅供参考。", learn: "用你的语言学习古兰经" },
};
const content = (l: string) => C[(l in C ? l : "en") as AppLocale];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/world", `${c.title} | Quran Masterclass`, c.lead.slice(0, 158));
}

// share of all Muslims by region as a gilded rosette: the ring of regions, a turning star in the middle
function Donut({ label, center }: { label: string; center: string }) {
  const r = 70, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="relative grid h-56 w-56 shrink-0 place-items-center">
      <svg viewBox="0 0 180 180" className="absolute inset-0 h-full w-full -rotate-90" role="img" aria-label={label}>
        <circle cx="90" cy="90" r="87" fill="none" stroke="rgb(var(--isl-gold-soft))" strokeOpacity=".5" />
        <circle cx="90" cy="90" r="53" fill="none" stroke="rgb(var(--isl-gold-soft))" strokeOpacity=".5" />
        {REGIONS.map((x) => { const len = (x.pct / 100) * c; const el = <circle key={x.en} cx="90" cy="90" r={r} fill="none" stroke={x.color} strokeWidth="26" strokeDasharray={`${Math.max(0, len - 1.2)} ${c - Math.max(0, len - 1.2)}`} strokeDashoffset={-off} />; off += len; return el; })}
      </svg>
      <svg viewBox="0 0 100 100" aria-hidden className="absolute h-[42%] w-[42%] text-[rgb(var(--isl-gold-soft))]">
        <g className="isl-rosette-turn"><path d={starPath(50, 50, 48, 38, 16)} fill="currentColor" fillOpacity=".1" stroke="currentColor" strokeWidth="1" /></g>
      </svg>
      <span className="font-display relative text-center text-[17px] leading-tight text-[rgb(var(--isl-gold))]">{center}</span>
    </div>
  );
}

export default async function WorldPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  // German, English and Arabic keep their hand-written names; every other language uses its own region and country names
  const own = locale === "de" || locale === "en" || locale === "ar";
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const regionName = (i: number) => REGION_NAMES[locale as AppLocale]?.[i] ?? REGIONS[i][lang];
  const countryName = (x: (typeof COUNTRIES)[number]) => {
    if (own) return x[lang];
    try { return new Intl.DisplayNames(locale, { type: "region" }).of(x.id.toUpperCase()) ?? x.en; } catch { return x.en; }
  };
  const max = Math.max(...COUNTRIES.map((x) => x.m));
  // Latin digits in the markup; LocalDigits turns them into the digits of Arabic, Persian, Urdu, Pashto and Bengali in the browser
  // (Pashto formats numbers like Persian here: ICU's Pashto separators would differ from the "1.6" in the texts above)
  const numLocale = locale === "ps" ? "fa" : locale;
  const nf = new Intl.NumberFormat(numLocale, own ? { maximumFractionDigits: 1 } : { maximumFractionDigits: 1, numberingSystem: "latn" });
  const pf = own ? null : new Intl.NumberFormat(numLocale, { style: "percent", maximumFractionDigits: 1, numberingSystem: "latn" });
  const pct = (n: number) => (pf ? pf.format(n / 100) : `${nf.format(n)} %`);
  return (
    <div>
      <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
        <IslamDome id="dome-world" className="-end-40 -top-44 w-[560px] sm:-end-24 sm:-top-48 sm:w-[780px]" />
        <IslamRain fall={520} className="opacity-70" />
        <CalligraphyDraw text={"الأمة"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-5xl px-5 pb-24 pt-14 sm:pb-32 sm:pt-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[36px] leading-[1.06] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">{c.lead}</p>
          <dl className="mt-10 grid grid-cols-3 gap-2.5 sm:gap-3">
            {c.stats.map(([n, l]) => <div key={l} className="isl-fact"><dt className="font-display text-[20px] leading-tight text-[rgb(233_207_153)] sm:text-4xl">{n}</dt><dd className="mt-1.5 text-[11.5px] leading-snug text-white/65 sm:text-sm">{l}</dd></div>)}
          </dl>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">
        <div className="mx-auto max-w-5xl px-5 pb-16 pt-14 sm:pt-20">
          <section className="isl-card relative overflow-hidden px-5 pb-5 pt-9 sm:p-10">
            <IslamCorners />
            <h2 className="font-display relative px-4 text-center text-2xl sm:px-0 sm:text-start sm:text-3xl">{c.regions}</h2>
            <div className="relative mt-6 flex flex-col items-center gap-8 sm:flex-row">
              <Donut label={REGIONS.map((x, i) => `${regionName(i)} ${pct(x.pct)}`).join(", ")} center={c.stats[0][0]} />
              <ul className="grid w-full gap-2.5">
                {REGIONS.map((x, i) => (
                  <li key={x.en} className="flex items-center justify-between gap-3 border-b border-[rgb(var(--isl-gold-soft))]/15 pb-2 text-[15px] last:border-0">
                    <span className="flex min-w-0 items-center gap-2.5"><span className="h-3.5 w-3.5 shrink-0 rotate-45 rounded-[2px] ring-1 ring-[rgb(var(--isl-gold-soft))]/50" style={{ background: x.color }} />{regionName(i)}</span>
                    <span className="font-bold tabular-nums">{pct(x.pct)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-14">
            <h2 className="font-display text-3xl">{c.top}</h2>
            <ol className="mt-6 flex flex-col gap-2">
              {COUNTRIES.map((x, i) => (
                <li key={x.id} className={`rounded-xl border p-3 sm:p-4 ${x.id === "ae" ? "isl-card border-[rgb(var(--isl-gold-soft))]/70 shadow-[0_0_0_3px_rgb(201_166_94/0.12)]" : "border-[rgb(var(--isl-gold-soft))]/20 bg-surface/60"}`}>
                  <div className="flex items-center justify-between gap-3 text-[15px]">
                    <span className="flex min-w-0 items-center gap-2.5 font-semibold">{x.id === "ae" ? <IslamNum n="" className="!h-8 !w-8" /> : <IslamNum n={i + 1} className="!h-8 !w-8 !text-[11px]" />}<span className="truncate">{countryName(x)}</span></span>
                    <span className="shrink-0 tabular-nums"><b>{nf.format(x.m)}</b> {c.mio} · <span className="text-muted">{pct(x.pct)}</span></span>
                  </div>
                  <div className="mt-2 grid grid-cols-[1fr_5rem] items-center gap-3 ps-[42px]">
                    <span className="h-2 overflow-hidden rounded-full bg-[rgb(var(--isl-gold-soft))]/15"><span className="isl-grow block h-full rounded-full" style={{ width: `${(x.m / max) * 100}%`, background: "linear-gradient(90deg, rgb(var(--accent) / .7), rgb(var(--accent)))" }} /></span>
                    <span className="h-2 overflow-hidden rounded-full bg-[rgb(var(--isl-gold-soft))]/15" title={c.share}><span className="isl-grow block h-full rounded-full" style={{ width: `${x.pct}%`, background: "linear-gradient(90deg, #c9a65e, #ecd6a2)" }} /></span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted"><span className="me-3 inline-flex items-center gap-1"><span className="h-2 w-4 rounded-full bg-accent" />{c.mio}</span><span className="inline-flex items-center gap-1"><span className="h-2 w-4 rounded-full bg-gold" />{c.share}</span></p>
            <div className="isl-card relative mt-8 grid items-center gap-6 overflow-hidden px-6 py-8 sm:grid-cols-[1fr_220px] sm:px-10">
              <IslamCorners />
              <p className="isl-serif relative text-[19px] leading-relaxed text-ink/85 sm:text-[21px]">{c.uae}</p>
              <IslamMosque className="relative mx-auto w-full max-w-[220px] text-[rgb(var(--isl-gold-soft))]" />
            </div>
          </section>

          <section className="mt-14 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl">{c.schools}</h2>
              <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-ink/75">{saw(c.schoolsBody)}</p>
              <Link href="/islam/sunni-shia" className="mt-3 inline-block text-sm font-bold text-accent hover:underline">{c.schoolsLink} <ArrowNext /></Link>
            </div>
            <Link href="/arabic" className="btn-gold inline-flex h-12 items-center justify-center rounded-full px-6 text-[15px] font-bold">{c.learn}</Link>
          </section>
          <p className="mt-12 text-xs leading-relaxed text-muted">{c.note}</p>
        </div>
      </div>
      <MoreTiles keys={["islam", "salah", "arabic", "assistant"]} className="pt-14" />
    </div>
  );
}
