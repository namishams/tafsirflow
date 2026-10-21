// SEO texts of the Mishary track pages (server-safe). German, English and Arabic; other languages use English.
type M = { title: string; description: string };
export type MisharyPage = "home" | "ear" | "masters" | "master" | "journal" | "mentoring" | "submission" | "send" | "seasons" | "season" | "hof";
const T: Record<"en" | "de" | "ar", Record<MisharyPage, M>> = {
  en: {
    home: { title: "Mishary track – forming the next generation of reciters | Quran Masterclass", description: "After the Reciter Path: maqam ear training, style studies of the masters, a daily recording journal, mentoring by verified masters and talent seasons." },
    ear: { title: "Maqam ear training – Bayati, Saba, Hijaz, Rast and more | Quran Masterclass", description: "Hear the seven main maqamat with their lower jins, quarter tones included, and learn to recognise them in five drill stages." },
    masters: { title: "Style studies of the masters – Alafasy, Abdul Basit, Minshawi | Quran Masterclass", description: "Listen phrase by phrase, see pace and pauses from the word timings and record yourself next to the master." },
    master: { title: "{t} – style study | Quran Masterclass", description: "Phrases, pace and pauses of {t} from the word timings, style notes and your own A/B recording." },
    journal: { title: "Daily recording journal – Mishary track | Quran Masterclass", description: "One recitation a day, private in your browser, with weekly charts for loudness, pace and accuracy." },
    mentoring: { title: "Mentoring by verified masters – Mishary track | Quran Masterclass", description: "A verified master reviews your short recordings with a rubric and text." },
    submission: { title: "Recording and feedback – Mishary track | Quran Masterclass", description: "A mentoring recording with its feedback." },
    send: { title: "Send a recording – Mishary track | Quran Masterclass", description: "Record 30–60 seconds and send it to your mentor." },
    seasons: { title: "Talent seasons – monthly and Ramadan challenges | Quran Masterclass", description: "Monthly and Ramadan recitation challenges judged by masters; winners enter the Hall of Fame." },
    season: { title: "Talent season – Mishary track | Quran Masterclass", description: "One talent season: entry, jury and results." },
    hof: { title: "Hall of Fame of the talent seasons | Quran Masterclass", description: "The podium of every talent season of the Mishary track." },
  },
  de: {
    home: { title: "Mishary-Pfad – die nächste Generation von Rezitatoren | Quran Masterclass", description: "Nach dem Rezitationspfad: Maqam-Gehörbildung, Stilstudien der Meister, tägliches Aufnahme-Tagebuch, Mentoring durch verifizierte Meister und Talent-Saisons." },
    ear: { title: "Maqam-Gehörbildung – Bayati, Saba, Hidschaz, Rast und mehr | Quran Masterclass", description: "Hören Sie die sieben Haupt-Maqamat mit ihrem unteren Dschins, einschließlich Vierteltönen, und lernen Sie, sie in fünf Übungsstufen zu erkennen." },
    masters: { title: "Stilstudien der Meister – Alafasy, Abdul Basit, Minschawi | Quran Masterclass", description: "Hören Sie Phrase für Phrase, sehen Sie Tempo und Pausen aus den Wortzeiten und nehmen Sie sich neben dem Meister auf." },
    master: { title: "{t} – Stilstudie | Quran Masterclass", description: "Phrasen, Tempo und Pausen von {t} aus den Wortzeiten, Stilnotizen und Ihre eigene A/B-Aufnahme." },
    journal: { title: "Tägliches Aufnahme-Tagebuch – Mishary-Pfad | Quran Masterclass", description: "Eine Rezitation am Tag, privat in Ihrem Browser, mit Wochendiagrammen für Lautstärke, Tempo und Genauigkeit." },
    mentoring: { title: "Mentoring durch verifizierte Meister – Mishary-Pfad | Quran Masterclass", description: "Ein verifizierter Meister bewertet Ihre kurzen Aufnahmen mit Bewertungsraster und Text." },
    submission: { title: "Aufnahme und Rückmeldung – Mishary-Pfad | Quran Masterclass", description: "Eine Mentoring-Aufnahme mit ihrer Rückmeldung." },
    send: { title: "Aufnahme senden – Mishary-Pfad | Quran Masterclass", description: "Nehmen Sie 30–60 Sekunden auf und senden Sie sie an Ihren Mentor." },
    seasons: { title: "Talent-Saisons – Monats- und Ramadan-Challenges | Quran Masterclass", description: "Monats- und Ramadan-Challenges der Rezitation, bewertet von Meistern; die Gewinner kommen in die Hall of Fame." },
    season: { title: "Talent-Saison – Mishary-Pfad | Quran Masterclass", description: "Eine Talent-Saison: Teilnahme, Jury und Ergebnisse." },
    hof: { title: "Hall of Fame der Talent-Saisons | Quran Masterclass", description: "Das Podium jeder Talent-Saison des Mishary-Pfads." },
  },
  ar: {
    home: { title: "مسار مشاري – إعداد الجيل القادم من القرّاء | Quran Masterclass", description: "بعد مسار القارئ: تدريب الأذن على المقامات، ودراسة أسلوب المتقنين، وسجل تسجيل يومي، وإرشاد من متقنين موثّقين، ومواسم المواهب." },
    ear: { title: "تدريب الأذن على المقامات – بياتي وصبا وحجاز ورست | Quran Masterclass", description: "استمعوا إلى المقامات السبعة الرئيسة بجنسها الأول مع أرباع الأصوات، وتعلّموا تمييزها في خمس مراحل." },
    masters: { title: "دراسة أسلوب المتقنين – العفاسي وعبد الباسط والمنشاوي | Quran Masterclass", description: "استمعوا جملة بجملة، وشاهدوا السرعة والوقفات من توقيت الكلمات، وسجّلوا تلاوتكم بجانب الشيخ." },
    master: { title: "{t} – دراسة الأسلوب | Quran Masterclass", description: "الجمل والسرعة والوقفات عند {t} من توقيت الكلمات، مع ملاحظات الأسلوب وتسجيلكم للمقارنة." },
    journal: { title: "سجل التسجيل اليومي – مسار مشاري | Quran Masterclass", description: "تلاوة واحدة كل يوم، خاصة في متصفحكم، مع رسوم أسبوعية لمستوى الصوت والسرعة والدقة." },
    mentoring: { title: "الإرشاد من متقنين موثّقين – مسار مشاري | Quran Masterclass", description: "متقن موثّق يقيّم تسجيلاتكم القصيرة بمعايير ونص." },
    submission: { title: "التسجيل والملاحظات – مسار مشاري | Quran Masterclass", description: "تسجيل إرشاد مع ملاحظاته." },
    send: { title: "إرسال تسجيل – مسار مشاري | Quran Masterclass", description: "سجّلوا من 30 إلى 60 ثانية وأرسلوها إلى مرشدكم." },
    seasons: { title: "مواسم المواهب – تحديات شهرية ورمضانية | Quran Masterclass", description: "تحديات تلاوة شهرية ورمضانية يحكّمها المتقنون؛ ويدخل الفائزون لوحة الشرف." },
    season: { title: "موسم المواهب – مسار مشاري | Quran Masterclass", description: "موسم واحد: المشاركة والتحكيم والنتائج." },
    hof: { title: "لوحة الشرف لمواسم المواهب | Quran Masterclass", description: "منصة كل موسم من مواسم مسار مشاري." },
  },
};
export function misharyMeta(locale: string, page: MisharyPage, v: { t?: string } = {}): M {
  const m = T[locale === "de" || locale === "ar" ? locale : "en"][page];
  return { title: m.title.replaceAll("{t}", v.t ?? ""), description: m.description.replaceAll("{t}", v.t ?? "") };
}
