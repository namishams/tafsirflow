// mirrors the data part of mobile/src/features/haramain/HajjGuide.tsx (copied for the website; keep both in step)
// Interactive Hajj / Umrah step guide: steps, texts and the progress key. Descriptive only, no rulings; pilgrims follow
// their own school and their group's guidance. The screen is src/components/learn/haramain/HajjGuide.tsx.
import { L14, L3, type L } from "@/lib/learn/abrahamic/core";

export type GuideState = { umrah: number[]; hajj: number[] };
export type Step = { arabic: string; day?: L; title: L; text: L };
export const GUIDE_KEY = "qmc.haramain.guide.v1";

export const UMRAH: Step[] = [
  { arabic: "الإحرام", title: L3("Ihram at the miqat", "Ihram am Miqat", "الإحرام من الميقات"), text: L3("Wash, put on the ihram clothing, make the intention for Umrah and begin the talbiya.", "Waschen, Ihram-Kleidung anlegen, die Absicht zur Umra fassen und mit der Talbiya beginnen.", "الاغتسال ولبس ثياب الإحرام ونية العمرة والبدء بالتلبية.") },
  { arabic: "الطواف", title: L3("Tawaf: seven circuits", "Tawaf: sieben Umrundungen", "الطواف سبعة أشواط"), text: L3("Start at the Black Stone line, keep the Kaaba on your left, circle seven times.", "Am Schwarzen Stein beginnen, die Kaaba zur Linken, siebenmal umrunden.", "ابدأ من محاذاة الحجر الأسود والكعبة عن يسارك وطف سبعة أشواط.") },
  { arabic: "ركعتا الطواف", title: L3("Two rak'as and Zamzam", "Zwei Rak'as und Zamzam", "ركعتا الطواف وزمزم"), text: L3("Pray two rak'as, behind Maqam Ibrahim if possible, then drink Zamzam.", "Zwei Rak'as beten, möglichst hinter dem Maqam Ibrahim, dann Zamzam trinken.", "صلِّ ركعتين خلف المقام إن تيسّر ثم اشرب من زمزم.") },
  { arabic: "السعي", title: L3("Sa'i: Safa to Marwa", "Sa'i: von Safa nach Marwa", "السعي بين الصفا والمروة"), text: L3("Seven lengths, starting at Safa and ending at Marwa, remembering Hajar's search.", "Sieben Strecken, beginnend bei Safa, endend bei Marwa, in Erinnerung an Hadschars Suche.", "سبعة أشواط تبدأ بالصفا وتنتهي بالمروة تذكّرًا لسعي هاجر.") },
  { arabic: "الحلق", title: L3("Shave or shorten the hair", "Haar rasieren oder kürzen", "الحلق أو التقصير"), text: L3("Men shave or shorten, women cut a fingertip's length. The ihram ends.", "Männer rasieren oder kürzen, Frauen schneiden eine Fingerkuppe ab. Der Ihram endet.", "يحلق الرجل أو يقصّر وتقصّر المرأة قدر أنملة، وبه التحلّل.") },
];

const D = (n: number) => L3(`${n} Dhu al-Hijja`, `${n}. Dhu l-Hiddscha`, `${n} ذو الحجة`);
export const HAJJ: Step[] = [
  { arabic: "الإحرام", day: D(8), title: L3("Ihram for Hajj", "Ihram für den Hadsch", "الإحرام بالحج"), text: L3("Pilgrims doing tamattu' enter ihram again, usually from where they stay in Mecca.", "Wer Tamattu' vollzieht, treten Sie erneut in den Ihram, meist an seinem Aufenthaltsort in Mekka.", "يُحرم المتمتع بالحج من مكانه في مكة غالبًا.") },
  { arabic: "منى", day: D(8), title: L3("To Mina", "Nach Mina", "إلى منى"), text: L3("Spend the day and night in Mina in prayer (yawm al-tarwiya).", "Tag und Nacht in Mina im Gebet verbringen (Yaum at-Tarwiya).", "قضاء يوم التروية وليلته في منى.") },
  { arabic: "عرفة", day: D(9), title: L3("Standing at Arafah", "Stehen in Arafat", "الوقوف بعرفة"), text: L3("From noon until sunset in supplication. The heart of Hajj.", "Von Mittag bis Sonnenuntergang im Bittgebet. Das Herz des Hadsch.", "من الزوال إلى الغروب في الدعاء، وهو ركن الحج الأعظم.") },
  { arabic: "مزدلفة", day: D(9), title: L3("Night at Muzdalifah", "Nacht in Muzdalifa", "المبيت بمزدلفة"), text: L3("Pray Maghrib and Isha together, rest, collect pebbles.", "Maghrib und Ischa zusammen beten, ruhen, Steinchen sammeln.", "جمع المغرب والعشاء والمبيت والتقاط الحصى.") },
  { arabic: "جمرة العقبة", day: D(10), title: L3("Stoning Jamrat al-'Aqaba", "Steinigung der Dschamrat al-'Aqaba", "رمي جمرة العقبة"), text: L3("Seven pebbles, one at a time, with takbir.", "Sieben Steinchen, einzeln, mit Takbir.", "سبع حصيات متعاقبات مع التكبير.") },
  { arabic: "الهدي", day: D(10), title: L3("Sacrifice", "Opfer", "الهدي"), text: L3("For tamattu' and qiran; today usually arranged by voucher.", "Bei Tamattu' und Qiran; heute meist über Gutschein organisiert.", "على المتمتع والقارن، ويُرتَّب اليوم غالبًا بصكوك.") },
  { arabic: "الحلق", day: D(10), title: L3("Shave or shorten", "Rasieren oder kürzen", "الحلق أو التقصير"), text: L3("The first release from ihram.", "Die erste Lösung aus dem Ihram.", "التحلّل الأول.") },
  { arabic: "طواف الإفاضة", day: D(10), title: L3("Tawaf al-Ifada and sa'i", "Tawaf al-Ifada und Sa'i", "طواف الإفاضة والسعي"), text: L3("A pillar of Hajj; may also be done in the following days.", "Eine Säule des Hadsch; auch an den Folgetagen möglich.", "ركن من أركان الحج، ويجوز تأخيره إلى الأيام التالية.") },
  { arabic: "أيام التشريق", day: L3("11-13 Dhu al-Hijja", "11.-13. Dhu l-Hiddscha", "11-13 ذو الحجة"), title: L3("Days of tashriq in Mina", "Taschriq-Tage in Mina", "أيام التشريق بمنى"), text: L3("Stone the three jamarat daily, seven pebbles each, small to large.", "Täglich die drei Dschamarat bewerfen, je sieben Steinchen, von klein nach groß.", "رمي الجمرات الثلاث كل يوم بسبع حصيات من الصغرى إلى الكبرى.") },
  { arabic: "طواف الوداع", title: L3("Farewell tawaf", "Abschieds-Tawaf", "طواف الوداع"), text: L3("The last act before leaving Mecca.", "Die letzte Handlung vor dem Verlassen Mekkas.", "آخر العهد بالبيت قبل مغادرة مكة.") },
];

export const G: Record<string, L> = {
  title: L14("Hajj and Umrah step by step", "Hadsch und Umra Schritt für Schritt", "الحج والعمرة خطوة بخطوة", "Adım adım Hac ve Umre", "حج اور عمرہ قدم بہ قدم", "حج و عمره گام به گام", "حج او عمره ګام په ګام", "Hajj et Omra pas à pas", "Hajj y Umrah paso a paso", "Haji dan Umrah langkah demi langkah", "Haji dan Umrah langkah demi langkah", "ধাপে ধাপে হজ ও উমরাহ", "Хадж и умра шаг за шагом", "朝觐与副朝分步指南"),
  lead: L14("An overview for learning, not a ruling. Follow your own school and your group's guidance.", "Ein Überblick zum Lernen, kein Rechtsgutachten. Folgen Sie Ihrer Rechtsschule und der Anleitung Ihrer Gruppe.", "نظرة تعليمية وليست فتوى. اتبع مذهبك وإرشاد حملتك.", "Öğrenmek için bir özet, fetva değildir. Kendi mezhebinize ve grubunuzun rehberliğine uyun.", "سیکھنے کے لیے خاکہ، فتویٰ نہیں۔ اپنے مسلک اور گروپ کی رہنمائی پر عمل کریں۔", "مروری آموزشی، نه فتوا. از مذهب خود و راهنمایی کاروان پیروی کنید.", "د زده‌کړې لپاره لنډیز، فتوا نه ده. خپل مذهب او د ډلې لارښوونه تعقیب کړئ.", "Un aperçu pour apprendre, pas un avis juridique. Suivez votre école et votre groupe.", "Un resumen para aprender, no un dictamen. Siga su escuela y a su grupo.", "Ringkasan untuk belajar, bukan fatwa. Ikuti mazhab dan pembimbing rombongan Anda.", "Ringkasan untuk belajar, bukan fatwa. Ikuti mazhab dan pembimbing kumpulan anda.", "শেখার জন্য একটি সারসংক্ষেপ, ফতোয়া নয়। নিজের মাযহাব ও দলের নির্দেশনা মানুন।", "Обзор для изучения, а не фетва. Следуйте своему мазхабу и указаниям группы.", "学习概览，并非教法裁决。请遵循您的教法学派和团队指导。"),
  umrah: L14("Umrah", "Umra", "العمرة", "Umre", "عمرہ", "عمره", "عمره", "Omra", "Umrah", "Umrah", "Umrah", "উমরাহ", "Умра", "副朝"),
  hajj: L14("Hajj (tamattu')", "Hadsch (Tamattu')", "الحج (تمتع)", "Hac (temettu)", "حج (تمتع)", "حج (تمتع)", "حج (تمتع)", "Hajj (tamattu')", "Hajj (tamattu')", "Haji (tamattu')", "Haji (tamattu')", "হজ (তামাত্তু)", "Хадж (таматту)", "朝觐（享受朝）"),
  step: L14("Step {n} of {m}", "Schritt {n} von {m}", "الخطوة {n} من {m}", "Adım {n}/{m}", "مرحلہ {n} از {m}", "گام {n} از {m}", "ګام {n} له {m}", "Étape {n} sur {m}", "Paso {n} de {m}", "Langkah {n} dari {m}", "Langkah {n} daripada {m}", "ধাপ {n}/{m}", "Шаг {n} из {m}", "第 {n}/{m} 步"),
  doneStep: L14("Mark as done", "Als erledigt markieren", "تمّ", "Tamamlandı olarak işaretleyin", "مکمل نشان لگائیں", "علامت انجام شد", "بشپړ په نښه کړئ", "Marquer comme fait", "Marcar como hecho", "Tandai selesai", "Tanda selesai", "সম্পন্ন চিহ্নিত করুন", "Отметить", "标记完成"),
  back: L14("Previous", "Zurück", "السابق", "Önceki", "پچھلا", "قبلی", "مخکینی", "Précédent", "Anterior", "Sebelumnya", "Sebelumnya", "আগের", "Назад", "上一步"),
  reset: L14("Start over", "Neu beginnen", "ابدأ من جديد", "Baştan başlayın", "دوبارہ شروع کریں", "از نو شروع کنید", "بیا پیل کړئ", "Recommencer", "Empezar de nuevo", "Mulai lagi", "Mula semula", "আবার শুরু করুন", "Начать заново", "重新开始"),
  open: L14("Interactive guide", "Interaktiver Leitfaden", "دليل تفاعلي", "Etkileşimli rehber", "انٹرایکٹو رہنما", "راهنمای تعاملی", "متقابل لارښود", "Guide interactif", "Guía interactiva", "Panduan interaktif", "Panduan interaktif", "ইন্টারঅ্যাকটিভ গাইড", "Интерактивный гид", "互动指南"),
};

export const GUIDE_LABEL = G.open;
