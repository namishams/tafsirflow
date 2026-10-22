"use client";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RULE, WUDU, WUDU_KEY, langOf, type L3, type Lang, type Scene, type Tradition, type WuduDone, type WuduStep } from "@/lib/wudu";
import { readJSON, writeJSON } from "@/lib/storage";
import { award } from "@/lib/points";
import { ArrowNext, IconCheckCircle } from "./Icons";
import { PracticeCelebrate, PracticeStar } from "./art/PracticeArt";
import { Courtyard, Glyph, Motes, TS_CSS, TsDefs, useTsId } from "./art/TrainerScene";
import { BUST, BUST_F, BUST_FIT, TA, star8, trainerDefaults, trainerUi, type FigureKind } from "./art/trainerArt";
import { IDENTITY_KEY } from "@/lib/identity";
import { trainerTradition } from "@/lib/learn/tradition";

type UiKey = "sunni" | "shia" | "fard" | "sunnah" | "wajib" | "mustahabb" | "right" | "left" | "each" | "tapHint" | "again" | "count" | "play" | "pause" | "prev" | "next" | "steps" | "restart" | "toQuiz" | "quiz" | "back" | "meaning" | "passed" | "note" | "quizTitle" | "quizLead" | "wrong" | "hint" | "good" | "doneTitle" | "doneText" | "clean" | "slips1" | "slipsN" | "practise" | "toSalah" | "toVerse";
type Ui = Record<UiKey, string>;
const UI: Record<Lang, Ui> = {
  de: {
    sunni: "Sunnitisch", shia: "Schiitisch (Dscha'fari)", fard: "Fard · Pflicht", sunnah: "Sunna · empfohlen", wajib: "Wadschib · Pflicht", mustahabb: "Mustahabb · empfohlen",
    right: "rechts", left: "links", each: "je Seite", tapHint: "Tippen Sie bei jedem Durchgang einmal – so behalten Sie den Überblick.", again: "Neu zählen", count: "Mitzählen",
    play: "Abspielen", pause: "Pause", prev: "Zurück", next: "Weiter", steps: "Alle Schritte", restart: "Von vorn", toQuiz: "Zum Quiz", quiz: "Reihenfolge-Quiz", back: "Zurück zum Trainer",
    meaning: "Bedeutung", passed: "Quiz bestanden",
    note: "Dieser Trainer zeigt den üblichen Ablauf. Einzelheiten unterscheiden sich zwischen den Rechtsschulen – lernen Sie die Gebetswaschung zusätzlich bei einem Lehrer Ihrer Schule.",
    quizTitle: "In welcher Reihenfolge?", quizLead: "Die Schritte sind durcheinandergeraten. Tippen Sie sie in der richtigen Reihenfolge an.",
    wrong: "Noch nicht – überlegen Sie kurz, was davor kommt.", hint: "Kleiner Tipp: Der leuchtende Schritt kommt als Nächstes.", good: "Richtig.",
    doneTitle: "Sie kennen die Reihenfolge der Gebetswaschung.", doneText: "Jetzt sind Sie bereit für das Gebet.", clean: "Ganz ohne Fehler.", slips1: "Mit einem kleinen Umweg – genau so lernt man.", slipsN: "Mit {n} kleinen Umwegen – genau so lernt man.",
    practise: "Noch einmal üben", toSalah: "Weiter zum Gebetstrainer", toVerse: "Den Wudu-Vers hören (5:6)",
  },
  en: {
    sunni: "Sunni", shia: "Shia (Ja'fari)", fard: "Fard · obligatory", sunnah: "Sunnah · recommended", wajib: "Wajib · obligatory", mustahabb: "Mustahabb · recommended",
    right: "right", left: "left", each: "each side", tapHint: "Tap once for every round – it helps you keep count.", again: "Count again", count: "Count",
    play: "Play", pause: "Pause", prev: "Back", next: "Next", steps: "All steps", restart: "Start again", toQuiz: "To the quiz", quiz: "Order quiz", back: "Back to the trainer",
    meaning: "Meaning", passed: "Quiz passed",
    note: "This trainer shows the common sequence. Details differ between the schools – also learn wudu with a teacher of your school.",
    quizTitle: "In which order?", quizLead: "The steps have been mixed up. Tap them in the right order.",
    wrong: "Not yet – think for a moment about what comes before.", hint: "A small hint: the glowing step comes next.", good: "Correct.",
    doneTitle: "You know the order of wudu.", doneText: "Now you are ready for the prayer.", clean: "Without a single mistake.", slips1: "With one small detour – that is exactly how we learn.", slipsN: "With {n} small detours – that is exactly how we learn.",
    practise: "Practise again", toSalah: "On to the prayer trainer", toVerse: "Listen to the wudu verse (5:6)",
  },
  ar: {
    sunni: "أهل السنة", shia: "الشيعة (المذهب الجعفري)", fard: "فرض", sunnah: "سنّة", wajib: "واجب", mustahabb: "مستحبّ",
    right: "اليمنى", left: "اليسرى", each: "لكلٍّ منهما", tapHint: "اضغط مرّةً مع كل غسلة، ليسهل عليك العدّ.", again: "عُدّ من جديد", count: "عُدّ",
    play: "تشغيل", pause: "إيقاف", prev: "السابق", next: "التالي", steps: "كل الخطوات", restart: "من البداية", toQuiz: "إلى الاختبار", quiz: "اختبار الترتيب", back: "العودة إلى المدرّب",
    meaning: "المعنى", passed: "اجتزتَ الاختبار",
    note: "يعرض هذا المدرّب الترتيب المعتاد للوضوء، وتختلف بعض التفاصيل بين المذاهب، فتعلّم الوضوء أيضًا على يد معلّم من مذهبك.",
    quizTitle: "ما الترتيب الصحيح؟", quizLead: "اختلط ترتيب الخطوات، فاضغط عليها بترتيبها الصحيح.",
    wrong: "ليس بعد – تأمّل قليلًا: ما الذي يأتي قبلها؟", hint: "تلميح: الخطوة المضيئة هي التالية.", good: "أحسنت.",
    doneTitle: "أحسنت، عرفتَ ترتيب الوضوء.", doneText: "أنت الآن مستعدّ للصلاة.", clean: "دون أي خطأ.", slips1: "مع خطأ صغير واحد، وهكذا يكون التعلّم.", slipsN: "مع {n} أخطاء صغيرة، وهكذا يكون التعلّم.",
    practise: "تدرّب مرّةً أخرى", toSalah: "إلى مدرّب الصلاة", toVerse: "استمع إلى آية الوضوء (المائدة: 6)",
  },
  tr: {
    sunni: "Sünni", shia: "Şii (Caferî)", fard: "Farz · zorunlu", sunnah: "Sünnet · tavsiye edilen", wajib: "Vacip · zorunlu", mustahabb: "Müstehap · tavsiye edilen",
    right: "sağ", left: "sol", each: "her taraf için", tapHint: "Her tur için bir kez dokunun – sayıyı takip etmenize yardımcı olur.", again: "Yeniden sayın", count: "Sayaç",
    play: "Oynat", pause: "Duraklat", prev: "Geri", next: "Sonraki", steps: "Tüm adımlar", restart: "Baştan başlayın", toQuiz: "Quize geçin", quiz: "Sıra quizi", back: "Eğitime dönün",
    meaning: "Anlam", passed: "Quiz geçildi",
    note: "Bu eğitim yaygın sırayı gösterir. Ayrıntılar mezhepler arasında farklılık gösterir – abdesti ayrıca kendi mezhebinizden bir hocayla da öğrenin.",
    quizTitle: "Hangi sırayla?", quizLead: "Adımların sırası karıştı. Onlara doğru sırayla dokunun.",
    wrong: "Henüz değil – öncesinde ne geldiğini bir an düşünün.", hint: "Küçük bir ipucu: parlayan adım sırada.", good: "Doğru.",
    doneTitle: "Abdestin sırasını biliyorsunuz.", doneText: "Artık namaza hazırsınız.", clean: "Tek bir hata yapmadan.", slips1: "Küçük bir dolambaçla – tam da böyle öğreniriz.", slipsN: "{n} küçük dolambaçla – tam da böyle öğreniriz.",
    practise: "Yeniden çalışın", toSalah: "Namaz eğitimine geçin", toVerse: "Abdest ayetini dinleyin (5:6)",
  },
  ur: {
    sunni: "سنی", shia: "شیعہ (جعفری)", fard: "فرض · لازم", sunnah: "سنت · پسندیدہ", wajib: "واجب · لازم", mustahabb: "مستحب · پسندیدہ",
    right: "دایاں", left: "بایاں", each: "ہر طرف", tapHint: "ہر مرتبہ کے لیے ایک بار ٹیپ کریں – اس سے گنتی یاد رکھنا آسان ہوتا ہے۔", again: "دوبارہ گنیں", count: "گنیں",
    play: "چلائیں", pause: "روکیں", prev: "پیچھے", next: "اگلا", steps: "تمام مراحل", restart: "دوبارہ شروع کریں", toQuiz: "کوئز کی طرف", quiz: "ترتیب کا کوئز", back: "مشق کی طرف واپس",
    meaning: "معنی", passed: "کوئز پاس ہو گیا",
    note: "یہ مشق عام ترتیب دکھاتی ہے۔ تفصیلات مکاتب کے درمیان مختلف ہوتی ہیں – وضو اپنے مکتب کے کسی استاد سے بھی سیکھیں۔",
    quizTitle: "کس ترتیب سے؟", quizLead: "مراحل کی ترتیب بگڑ گئی ہے۔ انہیں صحیح ترتیب سے ٹیپ کریں۔",
    wrong: "ابھی نہیں – ذرا سوچیں کہ اس سے پہلے کیا آتا ہے۔", hint: "چھوٹا سا اشارہ: چمکتا ہوا مرحلہ اگلا ہے۔", good: "درست۔",
    doneTitle: "آپ وضو کی ترتیب جانتے ہیں۔", doneText: "اب آپ نماز کے لیے تیار ہیں۔", clean: "ایک بھی غلطی کے بغیر۔", slips1: "ایک چھوٹے سے چکر کے ساتھ – سیکھنا ایسے ہی ہوتا ہے۔", slipsN: "{n} چھوٹے چکروں کے ساتھ – سیکھنا ایسے ہی ہوتا ہے۔",
    practise: "دوبارہ مشق کریں", toSalah: "نماز کی مشق کی طرف", toVerse: "آیتِ وضو سنیں (5:6)",
  },
  fa: {
    sunni: "اهل سنت", shia: "شیعه (جعفری)", fard: "فرض · الزامی", sunnah: "سنت · توصیه‌شده", wajib: "واجب · الزامی", mustahabb: "مستحب · توصیه‌شده",
    right: "راست", left: "چپ", each: "برای هر طرف", tapHint: "برای هر دور یک بار بزنید – شمردن را آسان‌تر می‌کند.", again: "دوباره شمارش", count: "شمارش",
    play: "پخش", pause: "توقف", prev: "قبلی", next: "بعدی", steps: "همه گام‌ها", restart: "از نو", toQuiz: "به سوی آزمون", quiz: "آزمون ترتیب", back: "بازگشت به تمرین",
    meaning: "معنا", passed: "آزمون گذرانده شد",
    note: "این تمرین ترتیب رایج را نشان می‌دهد. جزئیات میان مذاهب فرق می‌کند – وضو را علاوه بر این نزد معلمی از مذهب خودتان نیز بیاموزید.",
    quizTitle: "به چه ترتیبی؟", quizLead: "ترتیب گام‌ها به هم ریخته است. آنها را به ترتیب درست لمس کنید.",
    wrong: "هنوز نه – لحظه‌ای فکر کنید که پیش از آن چه می‌آید.", hint: "یک نکتهٔ کوچک: گام درخشان بعدی است.", good: "درست.",
    doneTitle: "شما ترتیب وضو را می‌دانید.", doneText: "اکنون برای نماز آماده‌اید.", clean: "بدون حتی یک اشتباه.", slips1: "با یک انحراف کوچک – یادگیری دقیقاً همین‌گونه است.", slipsN: "با {n} انحراف کوچک – یادگیری دقیقاً همین‌گونه است.",
    practise: "دوباره تمرین کنید", toSalah: "به تمرین نماز", toVerse: "آیهٔ وضو را بشنوید (5:6)",
  },
  ps: {
    sunni: "سني", shia: "شیعه (جعفري)", fard: "فرض · لازم", sunnah: "سنت · سپارښتل شوی", wajib: "واجب · لازم", mustahabb: "مستحب · سپارښتل شوی",
    right: "ښی", left: "کیڼ", each: "د هرې خوا لپاره", tapHint: "د هر دور لپاره یو ځل کېکاږئ – دا د شمېرنې په ساتلو کې مرسته کوي.", again: "بیا وشمېرئ", count: "وشمېرئ",
    play: "غږول", pause: "ودرول", prev: "شاته", next: "بل", steps: "ټول ګامونه", restart: "له سره پیل", toQuiz: "پوښتنو ته", quiz: "د ترتیب پوښتنې", back: "تمرین ته بیرته",
    meaning: "معنا", passed: "پوښتنې بریالۍ شوې",
    note: "دا تمرین عام ترتیب ښیي. جزئیات د مذهبونو ترمنځ توپیر لري – اودس د خپل مذهب له یوه ښوونکي سره هم زده کړئ.",
    quizTitle: "په کوم ترتیب؟", quizLead: "د ګامونو ترتیب ګډوډ شوی. هغوی په سم ترتیب کېکاږئ.",
    wrong: "لا نه – یوه شېبه فکر وکړئ چې له دې مخکې څه راځي.", hint: "یوه وړه اشاره: روښانه ګام بل دی.", good: "سمه ده.",
    doneTitle: "تاسو د اودس ترتیب پېژنئ.", doneText: "اوس تاسو د لمانځه لپاره چمتو یاست.", clean: "پرته له یوې تېروتنې.", slips1: "له یوې وړې ګرځېدنې سره – زده کړه همداسې ده.", slipsN: "له {n} وړو ګرځېدنو سره – زده کړه همداسې ده.",
    practise: "بیا تمرین وکړئ", toSalah: "د لمانځه تمرین ته", toVerse: "د اودس آیت واورئ (5:6)",
  },
  fr: {
    sunni: "Sunnite", shia: "Chiite (ja'farite)", fard: "Fard · obligatoire", sunnah: "Sunna · recommandé", wajib: "Wajib · obligatoire", mustahabb: "Mustahabb · recommandé",
    right: "droite", left: "gauche", each: "par côté", tapHint: "Touchez une fois à chaque passage – cela vous aide à garder le compte.", again: "Recompter", count: "Compter",
    play: "Lecture", pause: "Pause", prev: "Retour", next: "Suivant", steps: "Toutes les étapes", restart: "Recommencer", toQuiz: "Vers le quiz", quiz: "Quiz sur l'ordre", back: "Retour à l'entraînement",
    meaning: "Sens", passed: "Quiz réussi",
    note: "Cet entraînement montre le déroulement courant. Les détails diffèrent d'une école à l'autre – apprenez aussi les ablutions (wudu) auprès d'un enseignant de votre école.",
    quizTitle: "Dans quel ordre ?", quizLead: "Les étapes ont été mélangées. Touchez-les dans le bon ordre.",
    wrong: "Pas encore – réfléchissez un instant à ce qui vient avant.", hint: "Un petit indice : l'étape qui brille vient ensuite.", good: "Correct.",
    doneTitle: "Vous connaissez l'ordre des ablutions (wudu).", doneText: "Vous pouvez maintenant passer à la prière.", clean: "Sans la moindre erreur.", slips1: "Avec un petit détour – c'est exactement ainsi qu'on apprend.", slipsN: "Avec {n} petits détours – c'est exactement ainsi qu'on apprend.",
    practise: "S'exercer à nouveau", toSalah: "Vers l'entraînement à la prière", toVerse: "Écouter le verset des ablutions (5:6)",
  },
  es: {
    sunni: "Suní", shia: "Chií (yafarí)", fard: "Fard · obligatorio", sunnah: "Sunna · recomendado", wajib: "Wajib · obligatorio", mustahabb: "Mustahabb · recomendado",
    right: "derecha", left: "izquierda", each: "por lado", tapHint: "Toque una vez en cada pasada; le ayuda a llevar la cuenta.", again: "Contar de nuevo", count: "Contar",
    play: "Reproducir", pause: "Pausa", prev: "Atrás", next: "Siguiente", steps: "Todos los pasos", restart: "Empezar de nuevo", toQuiz: "Al cuestionario", quiz: "Cuestionario del orden", back: "Volver al entrenador",
    meaning: "Significado", passed: "Cuestionario superado",
    note: "Este entrenador muestra el desarrollo habitual. Los detalles difieren entre las escuelas; aprenda también el wudu con un maestro de su escuela.",
    quizTitle: "¿En qué orden?", quizLead: "Los pasos se han mezclado. Tóquelos en el orden correcto.",
    wrong: "Todavía no: piense un momento qué viene antes.", hint: "Una pequeña pista: el paso que brilla es el siguiente.", good: "Correcto.",
    doneTitle: "Ahora conoce el orden del wudu.", doneText: "Ya puede pasar a la oración.", clean: "Sin un solo error.", slips1: "Con un pequeño rodeo: así es exactamente como se aprende.", slipsN: "Con {n} pequeños rodeos: así es exactamente como se aprende.",
    practise: "Practicar de nuevo", toSalah: "Al entrenador de la oración", toVerse: "Escuchar la aleya del wudu (5:6)",
  },
  id: {
    sunni: "Sunni", shia: "Syiah (Ja'fari)", fard: "Fardu · diwajibkan", sunnah: "Sunnah · dianjurkan", wajib: "Wajib · diwajibkan", mustahabb: "Mustahab · dianjurkan",
    right: "kanan", left: "kiri", each: "tiap sisi", tapHint: "Ketuk sekali setiap putaran – membantu Anda menghitung.", again: "Hitung ulang", count: "Hitung",
    play: "Putar", pause: "Jeda", prev: "Kembali", next: "Berikutnya", steps: "Semua langkah", restart: "Mulai dari awal", toQuiz: "Ke kuis", quiz: "Kuis urutan", back: "Kembali ke latihan",
    meaning: "Arti", passed: "Kuis lulus",
    note: "Latihan ini menunjukkan urutan yang umum. Rinciannya berbeda antarmazhab – pelajari juga wudhu bersama guru dari mazhab Anda.",
    quizTitle: "Dalam urutan apa?", quizLead: "Langkah-langkahnya sudah tercampur. Ketuk sesuai urutan yang benar.",
    wrong: "Belum – pikirkan sejenak apa yang datang sebelumnya.", hint: "Petunjuk kecil: langkah yang menyala adalah berikutnya.", good: "Benar.",
    doneTitle: "Anda sudah tahu urutan wudhu.", doneText: "Sekarang Anda siap untuk shalat.", clean: "Tanpa satu pun kesalahan.", slips1: "Dengan satu jalan memutar kecil – begitulah cara kita belajar.", slipsN: "Dengan {n} jalan memutar kecil – begitulah cara kita belajar.",
    practise: "Berlatih lagi", toSalah: "Lanjut ke latihan shalat", toVerse: "Dengarkan ayat wudhu (5:6)",
  },
  ms: {
    sunni: "Sunni", shia: "Syiah (Ja'fari)", fard: "Fardu · diwajibkan", sunnah: "Sunat · digalakkan", wajib: "Wajib · diwajibkan", mustahabb: "Mustahab · digalakkan",
    right: "kanan", left: "kiri", each: "setiap sisi", tapHint: "Ketik sekali bagi setiap pusingan – ia membantu anda mengira.", again: "Kira semula", count: "Kira",
    play: "Main", pause: "Jeda", prev: "Kembali", next: "Seterusnya", steps: "Semua langkah", restart: "Mulakan semula", toQuiz: "Ke kuiz", quiz: "Kuiz susunan", back: "Kembali ke latihan",
    meaning: "Maksud", passed: "Kuiz lulus",
    note: "Latihan ini menunjukkan urutan yang lazim. Perincian berbeza antara mazhab – pelajari juga wudhu bersama guru daripada mazhab anda.",
    quizTitle: "Dalam susunan yang mana?", quizLead: "Langkah-langkah telah bercampur aduk. Ketik mengikut susunan yang betul.",
    wrong: "Belum lagi – fikirkan seketika apa yang datang sebelumnya.", hint: "Petunjuk kecil: langkah yang bercahaya ialah yang seterusnya.", good: "Betul.",
    doneTitle: "Anda tahu susunan wudhu.", doneText: "Kini anda bersedia untuk solat.", clean: "Tanpa satu pun kesilapan.", slips1: "Dengan satu lencongan kecil – begitulah cara kita belajar.", slipsN: "Dengan {n} lencongan kecil – begitulah cara kita belajar.",
    practise: "Berlatih sekali lagi", toSalah: "Teruskan ke latihan solat", toVerse: "Dengar ayat wudhu (5:6)",
  },
  bn: {
    sunni: "সুন্নি", shia: "শিয়া (জাফরি)", fard: "ফরজ · আবশ্যিক", sunnah: "সুন্নাহ · উৎসাহিত", wajib: "ওয়াজিব · আবশ্যিক", mustahabb: "মুস্তাহাব · উৎসাহিত",
    right: "ডান", left: "বাম", each: "প্রতি পাশে", tapHint: "প্রতিবারের জন্য একবার ট্যাপ করুন – গণনা মনে রাখতে সাহায্য করবে।", again: "আবার গণনা করুন", count: "গণনা করুন",
    play: "চালান", pause: "বিরতি", prev: "পিছনে", next: "পরবর্তী", steps: "সব ধাপ", restart: "আবার শুরু করুন", toQuiz: "কুইজে যান", quiz: "ক্রমের কুইজ", back: "প্রশিক্ষণে ফিরুন",
    meaning: "অর্থ", passed: "কুইজ পাস",
    note: "এই প্রশিক্ষণ প্রচলিত ধারাক্রম দেখায়। মাযহাবভেদে খুঁটিনাটি ভিন্ন হয় – ওযু আপনার মাযহাবের একজন শিক্ষকের কাছ থেকেও শিখুন।",
    quizTitle: "কোন ক্রমে?", quizLead: "ধাপগুলো এলোমেলো হয়ে গেছে। সঠিক ক্রমে সেগুলোতে ট্যাপ করুন।",
    wrong: "এখনও নয় – একটু ভাবুন, এর আগে কী আসে।", hint: "ছোট্ট ইঙ্গিত: জ্বলজ্বলে ধাপটি পরের।", good: "সঠিক।",
    doneTitle: "আপনি ওযুর ক্রম জানেন।", doneText: "এখন আপনি নামাজের জন্য প্রস্তুত।", clean: "একটিও ভুল ছাড়া।", slips1: "একটি ছোট ঘুরপথে – ঠিক এভাবেই আমরা শিখি।", slipsN: "{n}টি ছোট ঘুরপথে – ঠিক এভাবেই আমরা শিখি।",
    practise: "আবার অনুশীলন করুন", toSalah: "নামাজ প্রশিক্ষণে যান", toVerse: "ওযুর আয়াত শুনুন (5:6)",
  },
  ru: {
    sunni: "Сунниты", shia: "Шииты (джафариты)", fard: "Фард · обязательно", sunnah: "Сунна · желательно", wajib: "Ваджиб · обязательно", mustahabb: "Мустахабб · желательно",
    right: "правая", left: "левая", each: "на каждую сторону", tapHint: "Нажимайте один раз за каждый проход – так легче вести счёт.", again: "Считать заново", count: "Считать",
    play: "Воспроизвести", pause: "Пауза", prev: "Назад", next: "Далее", steps: "Все шаги", restart: "Начать заново", toQuiz: "К тесту", quiz: "Тест на порядок", back: "Назад к тренажёру",
    meaning: "Смысл", passed: "Тест пройден",
    note: "Этот тренажёр показывает общепринятую последовательность. Детали различаются между школами – изучайте омовение (вуду) также у наставника своей школы.",
    quizTitle: "В каком порядке?", quizLead: "Шаги перемешались. Нажимайте на них в правильном порядке.",
    wrong: "Пока нет – подумайте, что идёт перед этим.", hint: "Небольшая подсказка: светящийся шаг – следующий.", good: "Верно.",
    doneTitle: "Вы знаете порядок омовения (вуду).", doneText: "Теперь можно переходить к намазу.", clean: "Ни одной ошибки.", slips1: "С одним небольшим обходным путём – именно так и учатся.", slipsN: "Небольших обходных путей: {n} – именно так и учатся.",
    practise: "Потренироваться ещё раз", toSalah: "К тренажёру намаза", toVerse: "Послушать аят об омовении (5:6)",
  },
  zh: {
    sunni: "逊尼派", shia: "什叶派（贾法里）", fard: "主命 · 必须", sunnah: "圣行 · 建议", wajib: "义务 · 必须", mustahabb: "可嘉 · 建议",
    right: "右", left: "左", each: "每侧", tapHint: "每完成一遍就点一下——这样便于计数。", again: "重新计数", count: "计数",
    play: "播放", pause: "暂停", prev: "上一步", next: "下一步", steps: "全部步骤", restart: "重新开始", toQuiz: "去做测验", quiz: "顺序测验", back: "返回训练",
    meaning: "含义", passed: "已通过测验",
    note: "本训练展示通行的顺序。各学派的细节有所不同——请再向您所属学派的老师学习小净。",
    quizTitle: "正确的顺序是？", quizLead: "步骤的顺序被打乱了。请按正确的顺序点击它们。",
    wrong: "还不对——想一想前面应该是什么。", hint: "小提示：发光的那一步是下一步。", good: "正确。",
    doneTitle: "您已经知道小净的顺序了。", doneText: "现在您可以准备礼拜了。", clean: "一个错误也没有。", slips1: "绕了一个小弯——我们正是这样学习的。", slipsN: "绕了{n}个小弯——我们正是这样学习的。",
    practise: "再练一次", toSalah: "前往礼拜训练", toVerse: "收听小净经文（5:6）",
  },
};
const AR_TIMES = ["", "مرّة واحدة", "مرّتين", "ثلاث مرّات"];

// ---------- drawing ----------
const GOLD = "rgb(214 180 108)";
const WATER = "rgb(166 214 228)";
const DROP = "M0 -4.5C1.6 -2 3.2 0 3.2 1.8A3.2 3.2 0 0 1 -3.2 1.8C-3.2 0 -1.6 -2 0 -4.5Z";

const CSS = `
.wd-in{animation:wdIn .6s ease both}
@keyframes wdIn{from{opacity:0}to{opacity:1}}
.wd-drop{animation:wdDrop 2.4s cubic-bezier(.55,0,.85,.5) infinite}
@keyframes wdDrop{0%{transform:translateY(0);opacity:0}15%{opacity:.95}75%{opacity:.85}100%{transform:translateY(var(--fall,60px));opacity:0}}
.wd-flow{stroke-dasharray:5 9;animation:wdFlow 1.7s linear infinite}
@keyframes wdFlow{to{stroke-dashoffset:-28}}
.wd-sweep{stroke-dasharray:16 200;animation:wdSweep 3.2s ease-in-out infinite alternate}
@keyframes wdSweep{from{stroke-dashoffset:0}to{stroke-dashoffset:-84}}
.wd-once{stroke-dasharray:20 200;animation:wdOnce 2.8s ease-in-out infinite}
@keyframes wdOnce{0%{stroke-dashoffset:20;opacity:0}15%{opacity:1}85%{opacity:1}100%{stroke-dashoffset:-100;opacity:0}}
.wd-glow{animation:wdGlow 3.4s ease-in-out infinite}
@keyframes wdGlow{0%,100%{opacity:.35}50%{opacity:.9}}
.wd-ripple{transform-box:fill-box;transform-origin:center;animation:wdRipple 2.4s ease-out infinite}
@keyframes wdRipple{from{transform:scale(.4);opacity:.9}to{transform:scale(1.5);opacity:0}}
.wd-turn{transform-box:fill-box;transform-origin:center;animation:wdTurn 5s linear infinite}
@keyframes wdTurn{to{transform:rotate(360deg)}}
.wd-twinkle{transform-box:fill-box;transform-origin:center;animation:wdTwinkle 3.6s ease-in-out infinite}
@keyframes wdTwinkle{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1)}}
.wd-shake{animation:wdShake .45s ease}
@keyframes wdShake{0%,100%{transform:none}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.wd-hint{animation:wdHint 1.6s ease-in-out infinite}
@keyframes wdHint{0%,100%{box-shadow:0 0 0 0 rgb(214 180 108/.0)}50%{box-shadow:0 0 0 4px rgb(214 180 108/.35)}}
@media (prefers-reduced-motion:reduce){
.wd-in,.wd-drop,.wd-flow,.wd-sweep,.wd-once,.wd-glow,.wd-ripple,.wd-turn,.wd-twinkle,.wd-shake,.wd-hint{animation:none!important}
.wd-sweep,.wd-once{stroke-dasharray:none}
.wd-drop{transform:translateY(calc(var(--fall,60px)*.45));opacity:.8}
.wd-ripple{opacity:.5}
}`;

function Drop({ x, y, fall = 60, delay = 0, s = 1 }: { x: number; y: number; fall?: number; delay?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="wd-drop" style={{ "--fall": `${fall / s}px`, animationDelay: `-${delay}s` } as CSSProperties}>
        <path d={DROP} fill={TA.water} />
        <circle cx="-1" cy="0.6" r=".9" fill={TA.waterHi} opacity=".9" />
      </g>
    </g>
  );
}
function Route({ d, kind, w = 2.6, delay = 0 }: { d: string; kind: "sweep" | "once"; w?: number; delay?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={TA.water} strokeOpacity=".45" strokeWidth="1.1" strokeDasharray="1 4" strokeLinecap="round" />
      <path d={d} {...water(w)} pathLength={100} className={kind === "sweep" ? "wd-sweep" : "wd-once"} style={delay ? { animationDelay: `-${delay}s` } : undefined} />
    </>
  );
}
// the garden's way of drawing: lit forms with a fine gold rim, no outlines of their own
const rim = { fill: "none", stroke: TA.goldHi, strokeOpacity: 0.5, strokeWidth: 0.9, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const crease = { fill: "none", stroke: TA.skinLo, strokeOpacity: 0.55, strokeWidth: 1.1, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const gold = (o = 1, w = 1.8) => ({ fill: "none", stroke: GOLD, strokeOpacity: o, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;
const water = (w = 2) => ({ fill: "none", stroke: TA.water, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;
/** a stream of water: a soft body and a bright core that flows along it */
function Stream({ d, w = 2 }: { d: string; w?: number }) {
  return (
    <>
      <path d={d} {...water(w + 1.4)} strokeOpacity=".28" />
      <path d={d} {...water(w)} strokeOpacity=".85" />
      <path d={d} fill="none" stroke={TA.waterHi} strokeWidth={Math.max(0.8, w * 0.45)} strokeLinecap="round" className="wd-flow" />
    </>
  );
}


function Bust({ u, hl, tradition, kind }: { u: string; hl: Scene; tradition: Tradition; kind: FigureKind }) {
  if (kind === "f") return <BustF u={u} hl={hl} tradition={tradition} />;
  const B = BUST;
  const bare = hl === "head" || hl === "ears"; // the kufi comes off to wipe the head and the ears
  return (
    <g>
      <defs><clipPath id={`${u}face`}><path d={B.face} /></clipPath></defs>
      <path d={B.garment} fill={`url(#${u}robe)`} />
      <path d={B.garment} {...rim} />
      <path d={B.neckline} {...gold(0.95, 1.8)} />
      <path d={B.neck} fill={`url(#${u}skin)`} />
      <path d={B.head} fill={`url(#${u}skin)`} />
      <path d={B.head} {...rim} />
      <circle cx="108" cy="92" r="14" fill={TA.glint} opacity=".16" />
      {bare && <path d={B.hair} fill={TA.hair} opacity=".92" />}
      {hl === "head" && (tradition === "sunni"
        ? <path d={B.hair} fill={GOLD} fillOpacity=".32" className="wd-glow" />
        : <path d={B.headRouteShia} {...gold(0.4, 10)} />)}
      {hl === "face" && <path d={B.face} fill={GOLD} fillOpacity=".22" stroke={TA.goldHi} strokeOpacity=".7" strokeWidth="1" />}
      {hl === "ears" && <circle cx={B.earGlow[0]} cy={B.earGlow[1]} r="18" fill={`url(#${u}aura)`} className="wd-glow" />}
      <path d={B.ear} fill={TA.skinLo} opacity=".55" />
      {hl === "ears" && <path d={B.ear} {...gold(1, 1.8)} />}
      {!bare && (
        <g>
          <path d={B.kufi} fill={`url(#${u}cap)`} />
          <path d={B.kufiBand} {...gold(1, 1.8)} />
        </g>
      )}
      {hl === "heart" && (
        <g>
          <circle cx={B.heart[0]} cy={B.heart[1]} r="26" fill={`url(#${u}aura)`} className="wd-glow" />
          <path d={star8(B.heart[0], B.heart[1], 9)} fill={TA.gold} stroke={TA.goldInk} strokeWidth=".6" />
        </g>
      )}
      {hl === "mouth" && (
        <g>
          <path d={B.lips} {...gold(1, 2.4)} />
          <circle cx={B.mouth[0]} cy={B.mouth[1]} r="8" fill="none" stroke={TA.water} strokeWidth="1.8" className="wd-ripple" />
          <circle cx={B.mouth[0]} cy={B.mouth[1]} r="12" fill="none" stroke={TA.water} strokeWidth="1.5" strokeDasharray="3 5" className="wd-turn" />
        </g>
      )}
      {hl === "nose" && (
        <g>
          <path d={B.nose} {...gold(1, 2.4)} />
          <Route d={B.noseRoute} kind="sweep" w={3} />
        </g>
      )}
      {hl === "face" && (
        <g clipPath={`url(#${u}face)`}>
          <Stream d={B.faceFlow} w={2.4} />
        </g>
      )}
      {hl === "face" && <><Drop x={B.faceDrops[0][0]} y={B.faceDrops[0][1]} fall={40} s={1.3} /><Drop x={B.faceDrops[1][0]} y={B.faceDrops[1][1]} fall={36} delay={1.2} s={1.1} /></>}
      {hl === "head" && (tradition === "sunni"
        ? <Route d={B.headRoute} kind="sweep" w={3.4} />
        : <Route d={B.headRouteShia} kind="once" w={3.4} />)}
      {hl === "ears" && (
        <g>
          <Route d={B.earRoutes[0]} kind="sweep" w={2.8} />
          <Route d={B.earRoutes[1]} kind="sweep" w={2.8} delay={1.6} />
        </g>
      )}
    </g>
  );
}

// the bust with a headscarf (BUST_F): the face open, the scarf over head, neck and shoulders; for wiping the head its
// front edge is drawn back (the hairline shows), for the ears it is lifted there
function BustF({ u, hl, tradition }: { u: string; hl: Scene; tradition: Tradition }) {
  const B = BUST, F = BUST_F;
  return (
    <g>
      <defs><clipPath id={`${u}faceF`}><path d={F.face} /></clipPath></defs>
      <path d={B.garment} fill={`url(#${u}robe)`} />
      <path d={F.scarf} fill={`url(#${u}robe)`} />
      <path d={F.scarf} {...rim} />
      <path d="M100 178C112 186 128 186 140 176" {...gold(0.9, 1.6)} />
      <circle cx="108" cy="92" r="16" fill={TA.glint} opacity=".18" />
      <path d={F.face} fill={`url(#${u}skin)`} />
      <path d={F.trim} {...gold(1, 1.8)} />
      {hl === "head" && (
        <g>
          <path d={F.hairline} fill={TA.hair} />
          <path d={F.hairline} fill={GOLD} fillOpacity=".35" className="wd-glow" />
          <Route d={F.headRoute} kind={tradition === "sunni" ? "sweep" : "once"} w={3.2} />
        </g>
      )}
      {hl === "ears" && (
        <g>
          <path d={F.lift} fill={`url(#${u}skin)`} />
          <circle cx={B.earGlow[0]} cy={B.earGlow[1]} r="18" fill={`url(#${u}aura)`} className="wd-glow" />
          <path d={B.ear} fill={TA.skinLo} opacity=".6" />
          <path d={B.ear} {...gold(1, 1.8)} />
          <Route d={B.earRoutes[0]} kind="sweep" w={2.8} />
          <Route d={B.earRoutes[1]} kind="sweep" w={2.8} delay={1.6} />
        </g>
      )}
      {hl === "face" && <path d={F.face} fill={GOLD} fillOpacity=".22" stroke={TA.goldHi} strokeOpacity=".7" strokeWidth="1" />}
      {hl === "face" && <g clipPath={`url(#${u}faceF)`}><Stream d={B.faceFlow} w={2.4} /></g>}
      {hl === "face" && <><Drop x={B.faceDrops[0][0]} y={B.faceDrops[0][1]} fall={40} s={1.3} /><Drop x={B.faceDrops[1][0]} y={B.faceDrops[1][1]} fall={36} delay={1.2} s={1.1} /></>}
      {hl === "heart" && (
        <g>
          <circle cx={B.heart[0]} cy={B.heart[1]} r="26" fill={`url(#${u}aura)`} className="wd-glow" />
          <path d={star8(B.heart[0], B.heart[1], 9)} fill={TA.gold} stroke={TA.goldInk} strokeWidth=".6" />
        </g>
      )}
      {hl === "mouth" && (
        <g>
          <path d={B.lips} {...gold(1, 2.4)} />
          <circle cx={B.mouth[0]} cy={B.mouth[1]} r="8" fill="none" stroke={TA.water} strokeWidth="1.8" className="wd-ripple" />
          <circle cx={B.mouth[0]} cy={B.mouth[1]} r="12" fill="none" stroke={TA.water} strokeWidth="1.5" strokeDasharray="3 5" className="wd-turn" />
        </g>
      )}
      {hl === "nose" && (
        <g>
          <path d={B.nose} {...gold(1, 2.4)} />
          <Route d={B.noseRoute} kind="sweep" w={3} />
        </g>
      )}
    </g>
  );
}

// open right hand, palm towards us; the left one is the mirror image
const HAND = "M-17 0C-18 -14 -21 -26 -22 -40L-22 -62C-22 -69 -13 -69 -13 -62L-13 -52L-12 -76C-12 -84 -2 -84 -2 -76L-2 -54L-1 -80C-1 -88 9 -88 9 -80L9 -54L10 -75C10 -82 19 -82 19 -75L19 -44C22 -42 27 -46 31 -52C34 -57 41 -56 40 -50C38 -40 30 -26 22 -14C19 -9 18 -4 18 0";
function Hand({ u, x, mirror }: { u: string; x: number; mirror?: boolean }) {
  return (
    <g transform={`translate(${x} 204)${mirror ? " scale(-1 1)" : ""}`}>
      <path d="M-18 0C-18 12 -16 24 -15 40H17C18 24 18 12 18 0Z" fill={`url(#${u}robe)`} />
      <path d="M-18 1H18" {...gold(0.95, 1.6)} />
      <path d={`${HAND}Z`} fill={`url(#${u}skin)`} />
      <path d={HAND} {...rim} />
      <path d="M-15 -28C-6 -34 6 -36 15 -30M18 -20C11 -26 9 -36 13 -44" {...crease} />
      <path d="M-20 -7L20 -7" {...gold(0.9, 1.3)} strokeDasharray="2 3" />
      <Stream d="M-7 -66C-7 -48 -5 -30 -3 -12M4 -70C4 -50 5 -30 6 -12M14 -62C14 -46 13 -30 12 -16" w={1.6} />
    </g>
  );
}

const ARM = "M0 96C30 93 62 93 84 98C112 103 152 106 180 104C192 102 204 99 214 100C224 101 231 104 236 108C238 111 235 114 230 114C220 114 210 115 202 117C194 119 186 120 179 120C152 123 116 127 94 129C88 134 80 137 72 134C48 136 24 137 0 137";
function Arm({ u, tradition, left }: { u: string; tradition: Tradition; left?: boolean }) {
  const id = `${u}${left ? "arm-l" : "arm"}`;
  return (
    <g transform={left ? "translate(240 0) scale(-1 1)" : undefined}>
      <defs><clipPath id={id}><path d={`${ARM}Z`} /></clipPath></defs>
      <g transform="translate(0 6)">
        <path d={`${ARM}Z`} fill={`url(#${u}skin)`} />
        <rect x="0" y="80" width="56" height="70" fill={`url(#${u}robe)`} clipPath={`url(#${id})`} />
        <path d="M56 92V140" {...gold(0.95, 1.6)} clipPath={`url(#${id})`} />
        <rect x="64" y="80" width="180" height="70" fill={GOLD} fillOpacity=".16" clipPath={`url(#${id})`} />
        <path d={ARM} {...rim} />
        <path d="M214 105C222 106 229 107 235 109M184 114C194 113 204 113 214 112" {...crease} />
        <path d="M64 84V148" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        <circle cx="74" cy="134" r="3" fill={TA.goldPale} />
        {tradition === "shia" ? (
          <>
            <Stream d="M80 112C120 114 160 113 200 109C214 107 226 108 232 110M84 121C124 121 160 119 196 115" w={1.8} />
            <Drop x={233} y={120} fall={72} /><Drop x={226} y={120} fall={66} delay={1.3} s={0.8} />
          </>
        ) : (
          <>
            <Drop x={100} y={44} fall={50} /><Drop x={132} y={40} fall={58} delay={0.8} /><Drop x={164} y={46} fall={50} delay={1.5} /><Drop x={202} y={42} fall={50} delay={0.4} s={0.85} />
            <Drop x={118} y={134} fall={60} delay={1.1} s={0.8} /><Drop x={176} y={128} fall={64} delay={0.2} s={0.8} />
            <Stream d="M84 112C120 116 160 116 200 110" w={1.6} />
          </>
        )}
      </g>
    </g>
  );
}

const FOOT = "M90 30C86 74 88 116 96 146C99 158 96 170 90 184C84 198 86 214 102 214L198 214C212 214 220 210 220 204C220 198 213 194 203 192C179 188 152 176 136 160C129 152 127 140 127 124C127 92 129 60 130 30";
const INSTEP = "M212 196C188 190 158 178 136 162";
function Foot({ u, tradition }: { u: string; tradition: Tradition }) {
  return (
    <g>
      <defs><clipPath id={`${u}foot`}><path d={`${FOOT}Z`} /></clipPath></defs>
      <ellipse cx="150" cy="218" rx="92" ry="7" fill={TA.water} fillOpacity=".22" />
      <ellipse cx="150" cy="218" rx="70" ry="4" fill="none" stroke={TA.waterHi} strokeOpacity=".35" strokeWidth=".8" />
      <path d={`${FOOT}Z`} fill={`url(#${u}skin)`} />
      <rect x="60" y="0" width="100" height="62" fill={`url(#${u}robe)`} clipPath={`url(#${u}foot)`} />
      <path d="M84 62H134" {...gold(0.95, 1.6)} clipPath={`url(#${u}foot)`} />
      {tradition === "sunni" ? (
        <>
          <rect x="60" y="148" width="180" height="70" fill={GOLD} fillOpacity=".16" clipPath={`url(#${u}foot)`} />
          <path d="M84 148H140" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        </>
      ) : (
        <path d={INSTEP} {...gold(0.35, 10)} />
      )}
      <path d={FOOT} {...rim} />
      <path d="M204 193C208 199 209 207 206 214M212 196C215 197 217 199 217 202" {...crease} />
      {tradition === "sunni" ? (
        <>
          <Drop x={152} y={100} fall={66} /><Drop x={176} y={104} fall={74} delay={0.9} /><Drop x={198} y={100} fall={84} delay={1.6} s={0.85} /><Drop x={118} y={92} fall={52} delay={0.5} s={0.85} />
          <circle cx="208" cy="214" r="6" fill="none" stroke={WATER} strokeWidth="1.2" className="wd-ripple" />
        </>
      ) : (
        <Route d={INSTEP} kind="once" w={3} />
      )}
    </g>
  );
}

// ewer of brass: pours into a marble basin for the bismillah, rests at the end
const EWER = "M108 72C108 84 106 92 100 99C80 113 74 146 86 168C94 182 146 182 154 168C166 146 160 113 140 99C134 92 132 84 132 72Z";
function Vessel({ u, pouring }: { u: string; pouring: boolean }) {
  return (
    <g>
      {!pouring && <circle cx="120" cy="140" r="78" fill={`url(#${u}aura)`} className="wd-glow" />}
      <path d="M157 132C172 126 180 110 186 90M155 152C175 146 186 122 195 92M186 90C188 86 193 87 195 92" fill="none" stroke={`url(#${u}metal)`} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M107 80C88 72 64 82 64 104C64 117 71 125 80 129M107 86C92 81 72 88 72 104C72 113 76 118 81 121" fill="none" stroke={`url(#${u}metal)`} strokeWidth="3" strokeLinecap="round" />
      <path d={EWER} fill={`url(#${u}metal)`} />
      <path d="M100 180L96 194H144L140 180Z" fill={`url(#${u}metal)`} />
      <path d="M106 72C108 60 132 60 134 72Z" fill={`url(#${u}metal)`} />
      <path d="M102 72H138" {...gold(1, 2)} />
      <circle cx="120" cy="57" r="3.2" fill={TA.goldPale} />
      <path d="M88 132C104 140 136 140 152 132C150 144 146 152 140 158C126 164 114 164 100 158C94 152 90 144 88 132Z" fill={TA.emerald} fillOpacity=".85" />
      <path d="M86 134C104 142 136 142 154 134" {...gold(0.95, 1.4)} />
      <path d="M120 144l5 5-5 5-5-5z" fill={TA.goldPale} />
      <path d="M96 112C98 100 104 92 110 88" fill="none" stroke={TA.glint} strokeOpacity=".6" strokeWidth="3" strokeLinecap="round" />
      <path d={EWER} {...rim} />
      {pouring ? (
        <>
          <path d="M166 214C166 226 218 226 218 214Z" fill={`url(#${u}face)`} />
          <ellipse cx="192" cy="214" rx="26" ry="5" fill={TA.marble} />
          <ellipse cx="192" cy="214" rx="26" ry="5" fill="none" stroke={TA.gold} strokeWidth="1" />
          <ellipse cx="192" cy="214.4" rx="21" ry="3.4" fill={TA.water} fillOpacity=".7" />
          <ellipse cx="192" cy="214.4" rx="12" ry="2.2" fill="none" stroke={TA.waterHi} strokeWidth="1" className="wd-ripple" />
          <Stream d="M195 93C197 120 194 170 192 212" w={2.2} />
          <Drop x={194} y={100} fall={110} /><Drop x={194} y={100} fall={110} delay={0.8} /><Drop x={194} y={100} fall={110} delay={1.6} />
        </>
      ) : (
        <g fill={TA.goldPale}>
          {[[62, 70, 0], [182, 58, 1.2], [56, 168, 2.1], [190, 176, 0.6], [150, 40, 2.8]].map(([x, y, d]) => (
            <path key={`${x}-${y}`} d={star8(x, y, 5)} className="wd-twinkle" style={{ animationDelay: `-${d}s` }} />
          ))}
        </g>
      )}
    </g>
  );
}

// the scene of a step: the garden courtyard at dawn behind the close-up, motes of light in the air
function Stage({ scene, tradition, label, kind }: { scene: Scene; tradition: Tradition; label: string; kind: FigureKind }) {
  const u = useTsId("wd");
  const bust = scene === "heart" || scene === "mouth" || scene === "nose" || scene === "face" || scene === "head" || scene === "ears";
  return (
    <svg viewBox="0 -36 240 290" className="h-full w-full" role="img" aria-label={label}>
      <TsDefs u={u} />
      <Courtyard u={u} H={254} G={240}>
        <Motes />
        <g key={`${scene}-${tradition}-${kind}`} className="wd-in">
          {bust && <g transform={`translate(${BUST_FIT.cx} ${BUST_FIT.base}) scale(${BUST_FIT.s}) translate(${-BUST_FIT.cx} ${-BUST_FIT.base})`}><Bust u={u} hl={scene} tradition={tradition} kind={kind} /></g>}
          {scene === "hands" && (
            <g>
              <Hand u={u} x={152} /><Hand u={u} x={88} mirror />
              <Drop x={72} y={46} fall={58} /><Drop x={90} y={40} fall={60} delay={1.1} s={0.85} /><Drop x={150} y={42} fall={62} delay={0.5} /><Drop x={168} y={48} fall={56} delay={1.7} s={0.85} />
            </g>
          )}
          {(scene === "arm" || scene === "armL") && <Arm u={u} tradition={tradition} left={scene === "armL"} />}
          {scene === "feet" && <Foot u={u} tradition={tradition} />}
          {(scene === "vessel" || scene === "end") && <Vessel u={u} pouring={scene === "vessel"} />}
        </g>
      </Courtyard>
    </svg>
  );
}

// ---------- tap counter: a ring of segments, one per round ----------
function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => [32 + r * Math.cos(a), 32 + r * Math.sin(a)].map((v) => v.toFixed(2)).join(" ");
  return `M${p(a0)}A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
}
function Counter({ times, sides, u, lang }: { times: number; sides?: boolean; u: Ui; lang: Lang }) {
  const total = times * (sides ? 2 : 1);
  const [n, setN] = useState(0);
  const done = n >= total;
  const onLeft = sides && n >= times;
  const inSide = done ? times : n - (onLeft ? times : 0);
  const gap = total > 1 ? 0.22 : 0;
  const seg = (Math.PI * 2) / total;
  const label = lang === "ar" ? `${AR_TIMES[times] ?? times}${sides ? ` ${u.each}` : ""}` : `${times}×${sides ? ` ${u.each}` : ""}`;
  return (
    <div className="mt-5 flex items-center gap-4">
      <button
        type="button" onClick={() => setN(done ? 0 : n + 1)} aria-label={`${done ? u.again : u.count}: ${n} / ${total}`}
        className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full transition active:scale-95"
      >
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full" aria-hidden>
          {total === 1
            ? <circle cx="32" cy="32" r="28" fill="none" strokeWidth="3" stroke={n >= 1 ? GOLD : "rgb(255 255 255 / .18)"} />
            : Array.from({ length: total }, (_, k) => {
                const a0 = -Math.PI / 2 + k * seg + gap / 2;
                return <path key={k} d={arc(28, a0, a0 + seg - gap)} fill="none" strokeWidth="3" strokeLinecap="round" stroke={k < n ? GOLD : "rgb(255 255 255 / .18)"} />;
              })}
        </svg>
        {done ? <span className="pop text-[rgb(var(--gold))]"><IconCheckCircle className="h-7 w-7" /></span> : (
          <span className="leading-none">
            <span key={n} className="pop block text-xl font-bold tabular-nums">{inSide}</span>
            {sides && <span className="block text-[10px] font-semibold text-white/60">{onLeft ? u.left : u.right}</span>}
          </span>
        )}
      </button>
      <div className="min-w-0">
        <p className="font-display text-2xl leading-none text-[rgb(var(--gold))]">{label}</p>
        <p className="mt-1.5 text-[13px] leading-snug text-white/60">{done ? u.again : u.tapHint}</p>
      </div>
    </div>
  );
}

// Arabic counts need dual and plural forms
function slips(n: number, lang: Lang, u: Ui) {
  if (n === 0) return u.clean;
  if (n === 1) return u.slips1;
  if (lang === "ar") return n === 2 ? "مع خطأين صغيرين، وهكذا يكون التعلّم." : n <= 10 ? u.slipsN.replace("{n}", String(n)) : `مع ${n} خطأً صغيرًا، وهكذا يكون التعلّم.`;
  return u.slipsN.replace("{n}", String(n));
}

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let k = b.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [b[k], b[j]] = [b[j], b[k]]; }
  return b;
}

export default function WuduTrainer() {
  const locale = useLocale();
  const lang = langOf(locale);
  const u = UI[lang];
  const tx = (v?: L3) => (v ? v[lang] : "");
  const [tradition, setTradition] = useState<Tradition>("sunni");
  // the one tradition setting (profile, /start, the app) opens the trainer in that form; the switch here stays a local override
  useEffect(() => { setTradition(trainerTradition()); }, []);
  const steps = WUDU[tradition];
  const order = useMemo(() => steps.filter((s) => s.quiz), [steps]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [list, setList] = useState(false);
  const [mode, setMode] = useState<"learn" | "quiz" | "done">("learn");
  const [pool, setPool] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [miss, setMiss] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<{ id: string; t: number } | null>(null);
  const [passed, setPassed] = useState<WuduDone | null>(null);
  const step: WuduStep = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  useEffect(() => { const r = readJSON<WuduDone | null>(WUDU_KEY, null); if (r?.done) setPassed(r); }, []);
  // the figure follows the learner's identity (a sister sees the headscarf); anyone can switch it
  const tu = trainerUi(lang);
  const [kind, setKind] = useState<FigureKind>("m");
  useEffect(() => { setKind(trainerDefaults(readJSON<unknown>(IDENTITY_KEY, null)).kind); }, []);
  useEffect(() => {
    if (!auto || mode !== "learn") return;
    if (last) { setAuto(false); return; }
    const len = step.text[lang].length + (step.duas?.reduce((n, d) => n + d.ar.length, 0) ?? 0);
    const id = setTimeout(() => setI((n) => n + 1), Math.min(13000, 4500 + len * 32));
    return () => clearTimeout(id);
  }, [auto, i, last, step, lang, mode]);

  const startQuiz = (t: Tradition = tradition) => {
    const ids = WUDU[t].filter((s) => s.quiz).map((s) => s.id);
    let mixed = shuffle(ids);
    while (mixed.join() === ids.join()) mixed = shuffle(ids);
    setPool(mixed); setPicked([]); setMiss(0); setStreak(0); setWrong(null); setAuto(false); setMode("quiz");
  };
  const chooseTradition = (t: Tradition) => {
    if (t === tradition) return;
    setTradition(t); setI(0); setAuto(false);
    if (mode !== "learn") startQuiz(t);
  };
  const pick = (id: string) => {
    if (mode !== "quiz" || picked.includes(id)) return;
    if (id === order[picked.length].id) {
      const next = [...picked, id];
      setPicked(next); setStreak(0); setWrong(null);
      if (next.length === order.length) {
        const rec: WuduDone = { done: true, at: Date.now(), tradition };
        writeJSON(WUDU_KEY, rec); // writeJSON never throws (storage may be blocked)
        award("wudu");
        setPassed(rec);
        setTimeout(() => setMode("done"), 650);
      }
    } else {
      setMiss((m) => m + 1); setStreak((s) => s + 1); setWrong({ id, t: Date.now() });
    }
  };
  const goStep = (k: number) => { setAuto(false); setMode("learn"); setI(k); };
  const kindLabel = (s: WuduStep) => (tradition === "sunni" ? u[s.kind] : u[s.kind === "fard" ? "wajib" : "mustahabb"]);
  const byId = (id: string) => steps.find((s) => s.id === id)!;
  const ghost = "tg-btn tg-glass inline-flex h-12 items-center rounded-full px-5 text-sm font-bold text-white";
  const round = "tg-btn tg-glass grid h-12 w-12 shrink-0 place-items-center rounded-full text-white";
  const seg = (on: boolean) => `tg-btn min-h-9 rounded-full px-3.5 text-[13px] font-semibold sm:px-4 ${on ? "tg-lens" : "text-white/85"}`;

  return (
    <div className="relative overflow-clip rounded-[28px] bg-[#04201a] text-[#eef0f3] shadow-[0_40px_80px_-50px_rgba(4,30,22,.9)] ring-1 ring-[rgb(214_180_108)]/25">
      <style>{CSS + TS_CSS}</style>
      {/* tradition and quiz, as glass over the stage */}
      {mode !== "learn" && (
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(47,125,102,.3),transparent_60%)] p-3 sm:p-4">
          <div role="tablist" className="tg-glass tg-dark flex rounded-full p-1">
            {(["sunni", "shia"] as const).map((t) => <button key={t} role="tab" aria-selected={tradition === t} onClick={() => chooseTradition(t)} className={seg(tradition === t)}>{u[t]}</button>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {passed && <span className="inline-flex h-10 items-center gap-1.5 px-1 text-sm font-semibold text-[rgb(var(--gold))]"><IconCheckCircle className="h-5 w-5" />{u.passed}</span>}
            <button onClick={() => goStep(i)} className="tg-btn tg-glass tg-dark inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold text-white"><Glyph name="prev" className="h-3.5 w-3.5" />{u.back}</button>
          </div>
        </div>
      )}

      {mode === "learn" && (
        <div className="relative grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="relative">
            <div className="relative aspect-[240/290] w-full bg-[#041d16]">
              <div className="absolute inset-0"><Stage scene={step.scene} tradition={tradition} label={tx(step.title)} kind={kind} /></div>
              <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2 sm:inset-x-4 sm:top-4">
                <div role="tablist" className="tg-glass tg-dark flex rounded-full p-1">
                  {(["sunni", "shia"] as const).map((t) => <button key={t} role="tab" aria-selected={tradition === t} onClick={() => chooseTradition(t)} className={seg(tradition === t)}>{u[t]}</button>)}
                </div>
                <button onClick={() => startQuiz()} className="tg-btn tg-glass tg-dark ms-auto inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold text-white">
                  {passed && <IconCheckCircle className="h-4 w-4 text-[rgb(var(--gold))]" />}{u.quiz}
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-3 flex justify-center sm:bottom-4" aria-hidden>
                <div className="tg-glass tg-dark flex flex-wrap justify-center gap-1.5 rounded-full px-3 py-2">
                  {steps.map((s, k) => <span key={s.id} className={`h-1.5 rounded-full transition-all duration-500 ${k < i ? "w-4 bg-[rgb(var(--gold))]" : k === i ? "w-7 bg-gradient-to-r from-[#f2dfaa] to-[#c6a65e]" : "w-4 bg-white/20"}`} />)}
                </div>
              </div>
            </div>
            {/* the controls, part of the card right under the picture: they never cover any text */}
            <div className="px-3 pt-3 sm:px-4">
              <div className="tg-glass tg-dark rounded-[30px] p-2">
                <div className="mx-3 mb-2 mt-1 h-1 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={1} aria-valuemax={steps.length} aria-valuenow={i + 1}>
                  <div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#f2dfaa] transition-all duration-500 rtl:bg-gradient-to-l" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }} disabled={i === 0} aria-label={u.prev} title={u.prev} className={round}><Glyph name="prev" /></button>
                  <button onClick={() => (last ? startQuiz() : setAuto((a) => !a))} className="tg-btn tg-lens inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold">{!last && <Glyph name={auto ? "pause" : "play"} className="h-4 w-4" />}{last ? u.toQuiz : auto ? u.pause : u.play}</button>
                  <button onClick={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }} disabled={last} aria-label={u.next} title={u.next} className={round}><Glyph name="next" /></button>
                </div>
              </div>
            </div>
            <div className="px-3 pb-3 pt-3 sm:px-4 md:pb-4">
              <div className="tg-glass tg-dark inline-flex items-center gap-1 rounded-full p-1" role="tablist" aria-label={tu.figure}>
                <span className="px-2.5 text-[12px] font-semibold text-white/60">{tu.figure}</span>
                {(["m", "f"] as const).map((k) => <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={seg(kind === k)}>{k === "m" ? tu.man : tu.woman}</button>)}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col bg-[radial-gradient(120%_80%_at_0%_0%,rgba(47,125,102,.28),transparent_60%)] p-5 sm:p-7 md:min-h-[460px]">
            <div key={`${tradition}-${i}`} className="step-in">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><PracticeStar size={10} /><span dir="ltr">{i + 1} / {steps.length}</span></p>
                <span className={`tg-glass rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${step.kind === "fard" ? "text-[rgb(var(--gold))]" : "text-white/75"}`}>{kindLabel(step)}</span>
              </div>
              <h3 className="font-display mt-2 text-3xl leading-tight">{tx(step.title)}</h3>
              <p className="mt-3 text-[16px] leading-relaxed text-white/85">{tx(step.text)}</p>
              {step.times && <div className="tg-glass mt-5 rounded-[22px] px-4 pb-4 pt-px"><Counter key={`${tradition}-${step.id}`} times={step.times} sides={step.sides} u={u} lang={lang} /></div>}
              {step.duas?.map((d) => (
                <div key={d.ar} className="tg-glass mt-5 rounded-[22px] px-4 py-3">
                  <p className="font-arabic text-[26px] leading-[2] sm:text-[30px]" dir="rtl" lang="ar">{d.ar}</p>
                  {lang !== "ar" && <p className="mt-2 text-[15px] italic leading-relaxed text-[rgb(var(--gold))]"><span dir="ltr">{d.translit}</span></p>}
                  {lang !== "ar" && <p className="mt-2 text-[15px] leading-relaxed text-white/80"><span className="font-semibold text-white">{u.meaning}: </span>{d.meaning[lang]}</p>}
                  {d.src && <p className="mt-1.5 text-xs font-semibold text-white/50">{tx(d.src)}</p>}
                </div>
              ))}
              {step.note && <p className="tg-glass mt-4 rounded-[18px] p-3.5 text-sm leading-relaxed text-white/80">{tx(step.note)}</p>}
            </div>
          </div>
        </div>
      )}

      {mode === "quiz" && (
        <div className="relative p-5 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal">{u.quiz} · <span dir="ltr">{picked.length} / {order.length}</span></p>
          <h3 className="font-display mt-2 text-3xl leading-tight">{u.quizTitle}</h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/75">{u.quizLead}</p>
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
            {pool.map((id) => {
              const s = byId(id);
              const at = picked.indexOf(id);
              const isWrong = wrong?.id === id;
              const isHint = streak >= 2 && order[picked.length]?.id === id;
              return (
                <li key={`${id}-${isWrong ? wrong!.t : 0}`} className={isWrong ? "wd-shake" : undefined}>
                  <button
                    onClick={() => pick(id)} disabled={at >= 0}
                    className={`tg-btn tg-glass flex min-h-[56px] w-full items-center gap-2.5 rounded-[18px] px-3 py-2 text-start text-[14.5px] font-semibold leading-snug ${at >= 0 ? "!border-[rgb(var(--gold))]/60 bg-[rgb(var(--gold))]/15 text-white !opacity-100" : isHint ? "wd-hint !border-[rgb(var(--gold))]" : isWrong ? "!border-amber-200/50" : ""}`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums ${at >= 0 ? "bg-[rgb(var(--gold))] text-[rgb(var(--stage))]" : "border border-white/20 text-white/40"}`}>{at >= 0 ? at + 1 : "·"}</span>
                    <span className="min-w-0">{tx(s.title)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 min-h-[1.5rem] text-sm text-white/70" aria-live="polite">
            {wrong ? (streak >= 2 ? u.hint : u.wrong) : picked.length > 0 ? u.good : ""}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-white/50">{tx(RULE[tradition])}</p>
        </div>
      )}

      {mode === "done" && (
        <div className="rise relative overflow-hidden px-5 py-12 text-center sm:py-16">
          <PracticeCelebrate />
          <p className="font-callig star-burst mx-auto inline-block text-[52px] leading-tight text-[rgb(var(--gold))] sm:text-[64px]" dir="rtl" lang="ar">ما شاء الله</p>
          <h3 className="font-display mx-auto mt-4 max-w-xl text-2xl leading-tight sm:text-3xl">{u.doneTitle}</h3>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">{u.doneText} {slips(miss, lang, u)}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <Link href="/salah" className="tg-btn tg-lens inline-flex h-12 items-center rounded-full px-5 text-sm font-bold">{u.toSalah} <span className="ms-1.5"><ArrowNext /></span></Link>
            <Link href="/surah/5?v=6" className={ghost}>{u.toVerse}</Link>
            <button onClick={() => startQuiz()} className={ghost}>{u.practise}</button>
          </div>
        </div>
      )}

      <div className="relative border-t border-white/10 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setList((v) => !v)} aria-expanded={list} className="tg-btn tg-glass inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white/85">
            <Glyph name="chevron" className={`h-3.5 w-3.5 transition ${list ? "rotate-90 rtl:-rotate-90" : ""}`} />
            {u.steps}
          </button>
          {(i > 0 || mode !== "learn") && <button onClick={() => goStep(0)} className="tg-btn inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-white/65 hover:text-white"><Glyph name="restart" className="h-3.5 w-3.5" />{u.restart}</button>}
        </div>
        {list && (
          <ol className="tg-glass mt-3 grid gap-1 rounded-[22px] p-2 text-sm sm:grid-cols-2">
            {steps.map((s, k) => (
              <li key={s.id}>
                <button onClick={() => goStep(k)} className={`tg-btn flex min-h-10 w-full items-center gap-2 rounded-[14px] px-3 py-1.5 text-start ${mode === "learn" && k === i ? "bg-[rgb(214_180_108)]/20 font-bold text-white" : "text-white/75 hover:bg-white/5"}`}>
                  <span className="min-w-0 flex-1">{k + 1}. {tx(s.title)}</span>
                  <span className={`shrink-0 text-[11px] ${s.kind === "fard" ? "text-[rgb(var(--gold))]" : "text-white/40"}`}>{kindLabel(s).split(" · ")[0]}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-xs leading-relaxed text-white/60">{tx(RULE[tradition])}</p>
        <p className="mt-2 text-xs leading-relaxed text-white/50">{u.note}</p>
      </div>
    </div>
  );
}
