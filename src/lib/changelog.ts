// What changed on Quran Masterclass – newest first. Add an entry with every release.
// title_ar / items_ar: Arabic version (optional – a missing one falls back to English)
export type Release = { date: string; title_en: string; title_de: string; items_en: string[]; items_de: string[]; title_ar?: string; items_ar?: string[] };
export const CHANGELOG: Release[] = [
  {
    date: "2026-10-06",
    title_en: "Academy, Shams Method and account-first learning",
    title_de: "Academy, Shams-Methode und Lernen über das Konto",
    title_ar: "الأكاديمية ومنهج شمس والتعلّم عبر الحساب",
    items_ar: [
      "منهج شمس: سبع خطوات موجَّهة لكل آية – الاستماع، والبناء من الآخر بحسب توقيت الكلمات، وكلمة بكلمة، والمعنى مع وسائل التذكّر، والتفسير، وتلاشي الحروف الأولى، والتدبّر.",
      "الأكاديمية: مسار تعلّم عبر السور الـ114 كلها، باختبارات موقوتة ومستويات وسلاسل أيام وهدف يومي ينمو معك.",
      "خطط لـ365 يومًا بمقادير يومية متدرّجة، من الخطة الهادئة حتى مسار الحافظ.",
      "دورة تجويد من 14 درسًا، ومدرّب لمفردات القرآن، ومخطط للختمة، و10 أدلة موسّعة.",
      "109 أدعية للنبي ﷺ مع مصادرها، إضافةً إلى أدعية القرآن الكريم.",
      "صفحة الملف الشخصي مع الإحصاءات وتصدير البيانات وحذف الحساب؛ ويتكيّف المنهج مع عمرك.",
      "تستمر الإذاعة وتشغيل الآيات أثناء تصفّحك، مع مشغّل مصغّر دائم.",
      "التعليقات والإعجابات والمشاركة على الآيات – وكل تعليق يُراجَع قبل ظهوره.",
      "أمان أقوى: ترويسات أمان، وكلمات مرور أشد، وحماية من تخمين كلمات المرور.",
    ],
    items_en: [
      "The Shams Method: seven guided steps per verse – listen, build up backwards using word timings, word by word, meaning and memory hooks, tafsir, fading first-letter cues, reflection.",
      "Academy: a learning path through all 114 surahs with timed tests, levels, streaks and a daily goal that grows.",
      "365-day plans with growing daily portions, from gentle to the hafiz track.",
      "Tajweed course with 14 lessons, Quran vocabulary trainer, khatm planner and 10 in-depth guides.",
      "109 duas of the Prophet ﷺ with sources, plus the duas of the Quran.",
      "Profile page with statistics, data export and account deletion; the method adapts to your age.",
      "Radio and verse playback keep playing while you browse; persistent mini player.",
      "Comments, likes and shares on verses – every comment is reviewed before it appears.",
      "Stronger security: security headers, stricter passwords, login throttling.",
    ],
    items_de: [
      "Die Shams-Methode: sieben geführte Schritte pro Vers – hören, rückwärts aufbauen mit Wortzeiten, Wort für Wort, Bedeutung und Eselsbrücken, Tafsir, verblassende Anfangsbuchstaben, Nachdenken.",
      "Academy: ein Lernpfad durch alle 114 Suren mit Tests auf Zeit, Levels, Serien und einem wachsenden Tagesziel.",
      "365-Tage-Pläne mit wachsender Tagesmenge, von Sanft bis zum Hafiz-Track.",
      "Tajweed-Kurs mit 14 Lektionen, Koran-Vokabeltrainer, Khatm-Planer und 10 ausführliche Ratgeber.",
      "109 Bittgebete des Propheten ﷺ mit Quellen, dazu die Duas aus dem Koran.",
      "Profilseite mit Statistiken, Datenexport und Kontolöschung; die Methode passt sich deinem Alter an.",
      "Radio und Vers-Wiedergabe laufen beim Surfen weiter; dauerhafter Mini-Player.",
      "Kommentare, Likes und Teilen bei Versen – jeder Kommentar wird vor dem Erscheinen geprüft.",
      "Mehr Sicherheit: Sicherheits-Header, strengere Passwörter, Schutz gegen Passwort-Raten.",
    ],
  },
  {
    date: "2026-10-05",
    title_en: "Prayer times, Quran radio and 13 languages",
    title_de: "Gebetszeiten, Koran-Radio und 13 Sprachen",
    title_ar: "أوقات الصلاة وإذاعة القرآن و13 لغة",
    items_ar: ["أوقات الصلاة لموقعك وللمدن الكبرى، مع التاريخ الهجري.", "إذاعة القرآن بمحطاتها ومؤقّت النوم والأذان عند دخول وقت الصلاة.", "واجهة بـ13 لغة، منها العربية والتركية والأردية والفارسية والبشتو والبنغالية."],
    items_en: ["Prayer times for your location and major cities, with Hijri date.", "Quran radio with stations, sleep timer and adhan at prayer time.", "Interface in 13 languages including Arabic, Turkish, Urdu, Persian, Pashto and Bengali."],
    items_de: ["Gebetszeiten für deinen Ort und große Städte, mit Hidschri-Datum.", "Koran-Radio mit Sendern, Einschlaf-Timer und Adhan zur Gebetszeit.", "Oberfläche in 13 Sprachen, darunter Arabisch, Türkisch, Urdu, Persisch, Paschtu und Bengalisch."],
  },
];
