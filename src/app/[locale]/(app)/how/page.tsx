import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMeta } from "@/lib/site";

type Step = { n: string; title: string; body: string; href: string; cta: string; time: string };
type C = { kicker: string; title: string; lead: string; stepsTitle: string; steps: Step[]; toolsTitle: string; tools: [string, string, string][]; dayTitle: string; day: [string, string][]; start: string };

const de: C = {
  kicker: "Der Aufbau", title: "So ist die Quran Masterclass aufgebaut",
  lead: "Ein Weg in sechs Stufen – vom ersten Buchstaben bis zur sicheren Rezitation. Jede Stufe baut auf der vorigen auf, und du kannst dort einsteigen, wo du heute stehst.",
  stepsTitle: "Der Weg in sechs Stufen",
  steps: [
    { n: "1", title: "Arabisch lesen lernen", body: "Buchstaben, Formen, Vokalzeichen, Schadda, Sonnen- und Mondbuchstaben – bis du Al-Fatiha und die kurzen Suren selbst liest. Kurze Lektionen mit Übungen, Fehler kommen gezielt zurück.", href: "/arabic", cta: "Zum Lesekurs", time: "ca. 2–6 Wochen" },
    { n: "2", title: "Beten lernen", body: "Der Gebetstrainer zeigt jede Haltung mit Animation – sunnitisch und schiitisch (Dscha'fari), mit arabischem Text, Umschrift und Bedeutung.", href: "/salah", cta: "Zum Gebetstrainer", time: "ca. 1–2 Wochen" },
    { n: "3", title: "Vers für Vers mit der Shams-Methode", body: "Sieben Schritte pro Vers: hören, rückwärts aufbauen, Wort für Wort, Bedeutung und Eselsbrücken, Tafsir, verblassende Hinweise, Nachdenken. Ein Gedächtnismodell bringt jeden Vers zur richtigen Zeit zurück.", href: "/shams", cta: "Die Methode", time: "4 Min. pro Vers" },
    { n: "4", title: "Dranbleiben: Plan, Academy, Landkarte", body: "Ein 365-Tage-Plan oder ein Hifz-Plan gibt dein Tagespensum vor, die Academy prüft dich mit Tests auf Zeit, die Koran-Landkarte zeigt, was sitzt und was wackelt.", href: "/plan", cta: "Plan wählen", time: "täglich 10–30 Min." },
    { n: "5", title: "Schön rezitieren: Tajwid", body: "Die Regeln der Rezitation Schritt für Schritt mit Beispielen aus dem Koran und Quiz – und die großen Rezitatoren als Vorbild zum Zuhören.", href: "/tajweed", cta: "Zum Tajwid-Kurs", time: "ca. 2–3 Monate" },
    { n: "6", title: "Der Weg zum Rezitator", body: "Juz 'Amma, dann der ganze Koran, Wiederholungssystem nach Sabaq, Sabqi, Manzil – bis zum Vortrag vor einem Lehrer und der Idschaza.", href: "/islam/reciter-path", cta: "Der Rezitator-Weg", time: "Jahre – Schritt für Schritt" },
  ],
  toolsTitle: "Begleiter auf dem Weg",
  tools: [["/today", "Heute", "Dein Tagesplan, Serie und Fortschritt"], ["/map", "Koran-Landkarte", "Was sitzt, was wackelt – Sure für Sure"], ["/khatm", "Khatm-Planer", "Den ganzen Koran lesen, mit Tagespensum"], ["/vocab", "Wortschatz", "Die häufigsten Wörter des Korans"], ["/radio", "Radio", "Rezitation rund um die Uhr"], ["/prayer", "Gebetszeiten", "Mit Adhan und Qibla"], ["/duas", "Bittgebete", "Aus Koran und Sunnah"], ["/islam", "Islam verstehen", "Glaube, Gebet, Feste, Rechtsschulen"], ["/assistant", "Assistent", "Fragen zu Koran und Islam"]],
  dayTitle: "Ein typischer Lerntag (20 Minuten)",
  day: [["5 Min.", "Wiederholen, was heute fällig ist – die roten und goldenen Verse zuerst."], ["10 Min.", "Neue Verse aus deinem Plan mit der Shams-Methode."], ["3 Min.", "Eine Academy-Lektion oder eine Arabisch-Lektion."], ["2 Min.", "Eine Notiz: Was nehme ich aus dem Vers heute mit?"]],
  start: "Jetzt beginnen",
};
const en: C = {
  kicker: "The structure", title: "How the Quran Masterclass is built",
  lead: "One path in six stages – from the first letter to confident recitation. Each stage builds on the one before, and you can start wherever you are today.",
  stepsTitle: "The path in six stages",
  steps: [
    { n: "1", title: "Learn to read Arabic", body: "Letters, shapes, vowel signs, shadda, sun and moon letters – until you read Al-Fatiha and the short surahs yourself. Short lessons with exercises; mistakes come back on purpose.", href: "/arabic", cta: "Reading course", time: "about 2–6 weeks" },
    { n: "2", title: "Learn to pray", body: "The prayer trainer shows every posture with animation – Sunni and Shia (Ja'fari), with Arabic text, transliteration and meaning.", href: "/salah", cta: "Prayer trainer", time: "about 1–2 weeks" },
    { n: "3", title: "Verse by verse with the Shams Method", body: "Seven steps per verse: listen, build it backwards, word by word, meaning and memory hooks, tafsir, fading cues, reflection. A memory model brings every verse back at the right time.", href: "/shams", cta: "The method", time: "4 min per verse" },
    { n: "4", title: "Keep going: plan, academy, map", body: "A 365-day or hifz plan sets your daily portion, the academy tests you against the clock, the Quran map shows what sits and what wobbles.", href: "/plan", cta: "Choose a plan", time: "10–30 min daily" },
    { n: "5", title: "Recite beautifully: tajweed", body: "The rules of recitation step by step with examples from the Quran and quizzes – and the great reciters as role models to listen to.", href: "/tajweed", cta: "Tajweed course", time: "about 2–3 months" },
    { n: "6", title: "The path to becoming a reciter", body: "Juz 'Amma, then the whole Quran, a revision system of sabaq, sabqi, manzil – up to reciting to a teacher and the ijazah.", href: "/islam/reciter-path", cta: "The reciter's path", time: "years – step by step" },
  ],
  toolsTitle: "Companions on the way",
  tools: [["/today", "Today", "Your daily plan, streak and progress"], ["/map", "Quran map", "What sits, what wobbles – surah by surah"], ["/khatm", "Khatm planner", "Read the whole Quran with a daily portion"], ["/vocab", "Vocabulary", "The most frequent words of the Quran"], ["/radio", "Radio", "Recitation around the clock"], ["/prayer", "Prayer times", "With adhan and qibla"], ["/duas", "Supplications", "From the Quran and Sunnah"], ["/islam", "Understanding Islam", "Faith, prayer, feasts, schools of law"], ["/assistant", "Assistant", "Questions about the Quran and Islam"]],
  dayTitle: "A typical learning day (20 minutes)",
  day: [["5 min", "Review what is due today – red and gold verses first."], ["10 min", "New verses from your plan with the Shams Method."], ["3 min", "One academy lesson or one Arabic lesson."], ["2 min", "One note: what do I take from the verse today?"]],
  start: "Start now",
};
const ar: C = {
  kicker: "البناء", title: "هكذا بُنيت ماستركلاس القرآن",
  lead: "طريق واحد في ست مراحل، من الحرف الأول إلى التلاوة المتقنة. كل مرحلة تُبنى على ما قبلها، ويمكنك أن تبدأ من حيث أنت اليوم.",
  stepsTitle: "الطريق في ست مراحل",
  steps: [
    { n: "١", title: "تعلّم القراءة العربية", body: "الحروف وأشكالها، والحركات، والشدّة، والحروف الشمسية والقمرية، حتى تقرأ الفاتحة وقصار السور بنفسك. دروس قصيرة مع تمارين، وتعود إليك الأخطاء لتثبيتها.", href: "/arabic", cta: "دورة القراءة", time: "نحو ٢–٦ أسابيع" },
    { n: "٢", title: "تعلّم الصلاة", body: "يُريك مدرّب الصلاة كل هيئة بالحركة، على مذهب أهل السنة والمذهب الجعفري، مع النص العربي والمعنى.", href: "/salah", cta: "مدرّب الصلاة", time: "نحو ١–٢ أسبوع" },
    { n: "٣", title: "آيةً آية بمنهج شمس", body: "سبع خطوات لكل آية: الاستماع، والبناء من الآخر، والكلمة بكلمة، والمعنى ووسائل التذكّر، والتفسير، والإشارات المتلاشية، والتدبّر. ونموذج للذاكرة يعيد كل آية في وقتها.", href: "/shams", cta: "المنهج", time: "٤ دقائق للآية" },
    { n: "٤", title: "الاستمرار: الخطة والأكاديمية والخريطة", body: "خطة ٣٦٥ يومًا أو خطة حفظ تحدد وردك اليومي، والأكاديمية تختبرك بالوقت، وخريطة القرآن تُريك ما ثبت وما يتزعزع.", href: "/plan", cta: "اختر خطة", time: "١٠–٣٠ دقيقة يوميًا" },
    { n: "٥", title: "التلاوة الحسنة: التجويد", body: "أحكام التلاوة خطوةً خطوة بأمثلة من القرآن واختبارات، وكبار القرّاء قدوةً في الاستماع.", href: "/tajweed", cta: "دورة التجويد", time: "نحو ٢–٣ أشهر" },
    { n: "٦", title: "طريق القارئ", body: "جزء عمّ ثم القرآن كله، ونظام المراجعة بالسبق والسبقي والمنزل، حتى العرض على شيخ ونيل الإجازة.", href: "/islam/reciter-path", cta: "طريق القارئ", time: "سنوات، خطوةً خطوة" },
  ],
  toolsTitle: "رفقاء الطريق",
  tools: [["/today", "اليوم", "خطتك اليومية وتقدّمك"], ["/map", "خريطة القرآن", "ما ثبت وما يتزعزع سورةً سورة"], ["/khatm", "مخطط الختمة", "ختم القرآن بورد يومي"], ["/vocab", "المفردات", "أكثر كلمات القرآن ورودًا"], ["/radio", "الإذاعة", "تلاوة على مدار الساعة"], ["/prayer", "مواقيت الصلاة", "مع الأذان والقبلة"], ["/duas", "الأدعية", "من القرآن والسنة"], ["/islam", "فهم الإسلام", "العقيدة والصلاة والأعياد والمذاهب"], ["/assistant", "المساعد", "أسئلة عن القرآن والإسلام"]],
  dayTitle: "يوم تعلّم نموذجي (٢٠ دقيقة)",
  day: [["٥ دقائق", "راجع ما حان موعده اليوم، الآيات الحمراء والذهبية أولًا."], ["١٠ دقائق", "آيات جديدة من خطتك بمنهج شمس."], ["٣ دقائق", "درس في الأكاديمية أو درس عربي."], ["دقيقتان", "ملاحظة واحدة: ماذا آخذ من الآية اليوم؟"]],
  start: "ابدأ الآن",
};
const content = (l: string) => (l === "de" ? de : l === "ar" ? ar : en);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/how", `${c.title} | Quran Masterclass`, c.lead);
}

export default async function HowPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  return (
    <div>
      <section className="stage text-[#eef0f3]">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[38px] leading-[1.06] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.lead}</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <h2 className="font-display text-3xl">{c.stepsTitle}</h2>
        <ol className="relative mt-8 grid gap-4 before:absolute before:bottom-6 before:start-[23px] before:top-6 before:w-px before:bg-line">
          {c.steps.map((s) => (
            <li key={s.n} className="relative flex gap-4">
              <span className="stage relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-lg text-[rgb(var(--gold))]">{s.n}</span>
              <div className="min-w-0 flex-1 rounded-xl border border-line bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-bold">{s.title}</h3><span className="text-xs text-muted">{s.time}</span></div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.body}</p>
                <Link href={s.href} className="mt-3 inline-block text-sm font-bold text-accent hover:underline">{s.cta} →</Link>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-12">
        <h2 className="font-display text-3xl">{c.dayTitle}</h2>
        <ol className="mt-6 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {c.day.map(([m, d]) => <li key={m} className="bg-surface p-4"><p className="font-display text-2xl text-gold">{m}</p><p className="mt-1 text-sm leading-relaxed text-muted">{d}</p></li>)}
        </ol>
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-16">
        <h2 className="font-display text-3xl">{c.toolsTitle}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.tools.map(([h, t, d]) => <li key={h}><Link href={h} className="block h-full rounded-xl border border-line bg-surface p-4 transition hover:border-gold/60"><p className="font-bold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p></Link></li>)}
        </ul>
        <div className="mt-10 text-center"><Link href="/today" className="btn-gold inline-flex h-12 items-center rounded-full px-7 text-[15px] font-bold">{c.start}</Link></div>
      </section>
    </div>
  );
}
