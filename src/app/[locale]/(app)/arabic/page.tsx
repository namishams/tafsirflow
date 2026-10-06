import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import ArabicHome from "@/components/ArabicHome";
import { LESSONS, LETTERS, UNITS, arName, forms } from "@/lib/arabic";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";

const C = {
  de: {
    kicker: "Arabisch lesen lernen · für Anfänger", title: "Lies den Koran – auch wenn du heute noch keinen Buchstaben kennst",
    lead: "Dieser Kurs bringt dir das Lesen der Koranschrift bei, so wie es Koranschulen seit Generationen tun: erst die Buchstaben, dann ihre Formen, dann die Vokalzeichen – bis du Al-Fatiha und die kurzen Suren selbst liest. In kleinen Lektionen von fünf Minuten, mit Übungen, Paaren und Tests.",
    stats: [`${LESSONS.length} Lektionen`, `${UNITS.length} Einheiten`, "28 Buchstaben", "5 Min. pro Lektion"],
    pathTitle: "Dein Lernpfad", alphaTitle: "Das arabische Alphabet", alphaLead: "Alle Buchstaben mit Namen, Laut und ihren Formen am Wortanfang, in der Mitte und am Ende. Arabisch liest man von rechts nach links.",
    th: ["Buchstabe", "Name", "Laut", "Anfang · Mitte · Ende"],
    howTitle: "So lernst du hier", how: [
      ["Kurze Lektionen", "Jede Lektion dauert etwa fünf Minuten: erst Lernkarten, dann abwechslungsreiche Übungen."],
      ["Fehler kommen zurück", "Was du falsch beantwortest, kommt am Ende der Lektion noch einmal – so lange, bis es sitzt."],
      ["Laut mitsprechen", "Lesen lernt man mit dem Mund. Sprich jeden Laut mit – wo dein Gerät eine arabische Stimme hat, kannst du ihn anhören."],
      ["Vom Buchstaben zum Koran", "In Einheit 6 liest du echte Koranwörter aus Al-Fatiha, Al-Ikhlas, Al-Falaq und An-Nas – mit Bedeutung. Danach hörst du sie Wort für Wort in echter Rezitation und liest ganze Verse. Wer schon etwas lesen kann, startet mit dem Einstufungstest."],
    ],
    teacher: "Die Aussprache mancher Laute (ح ع ق ص ض ط ظ) lernt man am besten durch Zuhören und mit einem Lehrer. Hör im Player einem Rezitator zu und sprich nach – das ist der Weg, den auch Koranschulen gehen.",
    after: "Nach dem Kurs", afterBody: "Wenn du lesen kannst, beginnt das eigentliche Abenteuer: Mit der Shams-Methode lernst du Vers für Vers auswendig, im Tajwid-Kurs lernst du die Regeln der schönen Rezitation.",
    ctaShams: "Zur Shams-Methode", ctaTajweed: "Zum Tajwid-Kurs",
  },
  en: {
    kicker: "Learn to read Arabic · for beginners", title: "Read the Quran – even if you don't know a single letter today",
    lead: "This course teaches you to read the Quranic script the way Quran schools have done for generations: first the letters, then their shapes, then the vowel signs – until you read Al-Fatiha and the short surahs yourself. In small five-minute lessons, with exercises, pairs and tests.",
    stats: [`${LESSONS.length} lessons`, `${UNITS.length} units`, "28 letters", "5 min per lesson"],
    pathTitle: "Your learning path", alphaTitle: "The Arabic alphabet", alphaLead: "Every letter with its name, sound and its shapes at the start, in the middle and at the end of a word. Arabic is read from right to left.",
    th: ["Letter", "Name", "Sound", "Start · middle · end"],
    howTitle: "How you learn here", how: [
      ["Short lessons", "Each lesson takes about five minutes: first learning cards, then varied exercises."],
      ["Mistakes come back", "Whatever you get wrong comes back at the end of the lesson – until it sticks."],
      ["Say it out loud", "You learn to read with your mouth. Say every sound – where your device has an Arabic voice you can listen to it."],
      ["From letters to the Quran", "In unit 6 you read real Quran words from Al-Fatiha, Al-Ikhlas, Al-Falaq and An-Nas – with their meaning. Then you hear them word by word in real recitation and read whole verses. If you can already read a little, start with the placement test."],
    ],
    teacher: "Some sounds (ح ع ق ص ض ط ظ) are best learned by listening and with a teacher. Listen to a reciter in the player and repeat – the same way Quran schools teach.",
    after: "After the course", afterBody: "Once you can read, the real adventure begins: with the Shams Method you memorise verse by verse, and the tajweed course teaches the rules of beautiful recitation.",
    ctaShams: "Discover the Shams Method", ctaTajweed: "Tajweed course",
  },
  ar: {
    kicker: "تعلّم القراءة العربية · للمبتدئين", title: "اقرأ القرآن – ولو لم تكن تعرف اليوم حرفًا واحدًا",
    lead: "تعلّمك هذه الدورة قراءة الرسم القرآني كما دأبت مدارس تحفيظ القرآن جيلًا بعد جيل: الحروف أولًا، ثم أشكالها، ثم الحركات – حتى تقرأ الفاتحة والسور القصيرة بنفسك. في دروس صغيرة مدة كلٍّ منها خمس دقائق، مع تمارين وأزواج واختبارات.",
    stats: [`${LESSONS.length} درسًا`, `${UNITS.length} وحدات`, "28 حرفًا", "5 دقائق لكل درس"],
    pathTitle: "مسار تعلّمك", alphaTitle: "الأبجدية العربية", alphaLead: "كل حرف باسمه ومخرجه وأشكاله في أول الكلمة ووسطها وآخرها. وتُقرأ العربية من اليمين إلى اليسار.",
    th: ["الحرف", "الاسم", "المخرج", "أول · وسط · آخر"],
    howTitle: "كيف تتعلّم هنا", how: [
      ["دروس قصيرة", "يستغرق كل درس نحو خمس دقائق: بطاقات تعليمية أولًا، ثم تمارين متنوعة."],
      ["الأخطاء تعود إليك", "كل ما أخطأت فيه يعود في آخر الدرس – حتى يثبت في ذهنك."],
      ["انطق بصوتك", "القراءة تُتعلَّم بالفم. انطق كل حرف بصوتك، وإن كان في جهازك صوت عربي فيمكنك الاستماع إليه."],
      ["من الحرف إلى القرآن", "في الوحدة السادسة تقرأ كلمات قرآنية حقيقية من الفاتحة والإخلاص والفلق والناس – مع معانيها. ثم تسمعها كلمةً كلمة بتلاوةٍ حقيقية، وتقرأ الآيات كاملة. ومن كان يقرأ شيئًا من قبل فليبدأ باختبار تحديد المستوى."],
    ],
    teacher: "إن مخارج بعض الحروف (ح ع ق ص ض ط ظ) تُتقَن بالسماع والتلقّي عن معلّم. استمع إلى قارئ في المشغّل ورَدِّد خلفه – فهذا هو الطريق الذي تسلكه مدارس القرآن.",
    after: "بعد الدورة", afterBody: "إذا صرت تقرأ فقد بدأت الرحلة الحقيقية: بمنهج شمس تحفظ آيةً آيةً، وفي دورة التجويد تتعلّم أحكام التلاوة الحسنة.",
    ctaShams: "تعرّف على منهج شمس", ctaTajweed: "دورة التجويد",
  },
};
const content = (l: string) => (l === "de" ? C.de : l === "ar" ? C.ar : C.en);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/arabic", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function ArabicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const ld = { "@context": "https://schema.org", "@type": "Course", name: c.title, description: c.lead, url: abs(`/${locale}/arabic`), inLanguage: locale, isAccessibleForFree: true, provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("/") }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT5M" } };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <p aria-hidden className="font-arabic pointer-events-none absolute -end-4 top-4 select-none text-[160px] leading-none text-[rgb(var(--gold))] opacity-[0.08] sm:text-[240px]" dir="rtl">ا ب ت</p>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.lead}</p>
          <ul className="mt-8 flex flex-wrap gap-2">{c.stats.map((s) => <li key={s} className="rounded-full border border-white/15 px-3 py-1 text-sm text-white/80">{s}</li>)}</ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <h2 className="font-display mb-6 text-3xl">{c.pathTitle}</h2>
        <ArabicHome />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-12">
        <h2 className="font-display text-3xl">{c.howTitle}</h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {c.how.map(([h, d], i) => <div key={h} className="bg-surface p-5"><p className="font-display text-3xl text-gold">0{i + 1}</p><h3 className="mt-2 font-bold">{h}</h3><p className="mt-1 text-sm leading-relaxed text-muted">{d}</p></div>)}
        </div>
        <p className="mt-5 rounded-lg callout p-4 text-[15px] leading-relaxed">{c.teacher}</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="font-display text-3xl">{c.alphaTitle}</h2>
        <p className="mt-2 max-w-3xl text-muted">{c.alphaLead}</p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-surface">
          <table className="w-full min-w-[620px] text-sm">
            <thead className="bg-bg text-start text-xs uppercase tracking-wider text-muted"><tr>{c.th.map((h) => <th key={h} className="px-4 py-3 text-start">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {LETTERS.map((l) => { const f = forms(l); return (
                <tr key={l.ch}>
                  <td className="px-4 py-2"><span className="font-arabic text-4xl leading-[1.6] text-accent">{l.ch}</span></td>
                  <td className="px-4 py-2 font-bold">{lang === "ar" ? arName(l.ch) : l.name}</td>
                  <td className="px-4 py-2 text-muted">{l.sound[lang] ?? l.sound.en}</td>
                  <td className="px-4 py-2"><span className="font-arabic text-2xl leading-[1.8]" dir="rtl">{f.start}  {f.middle}  {f.end}</span></td>
                </tr>); })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="stage girih text-[#eef0f3]">
        <div className="mx-auto max-w-4xl px-5 py-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">{c.after}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">{c.afterBody}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/shams" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{c.ctaShams}</Link>
            <Link href="/tajweed" className="inline-flex h-12 items-center rounded-md border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.ctaTajweed}</Link>
          </div>
        </div>
      </section>
      <MoreTiles keys={["salah", "tajweed", "vocab", "shams"]} />
    </div>
  );
}
