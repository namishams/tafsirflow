import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import ArabicHome from "@/components/ArabicHome";
import { LESSONS, UNITS } from "@/lib/arabic";
import { PracticeStar, PracticeStarNum, PracticeWindow } from "@/components/art/PracticeArt";
import { PracticeAlphabetRing, PracticeLetterSheet } from "@/components/art/PracticeAlphabet";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";

const C = {
  de: {
    kicker: "Arabisch lesen lernen · für Anfänger", title: "Lies den Koran – auch wenn du heute noch keinen Buchstaben kennst",
    lead: "Dieser Kurs bringt dir das Lesen der Koranschrift bei, so wie es Koranschulen seit Generationen tun: erst die Buchstaben, dann ihre Formen, dann die Vokalzeichen – bis du Al-Fatiha und die kurzen Suren selbst liest. In kleinen Lektionen von fünf Minuten, mit Übungen, Paaren und Tests.",
    stats: [`${LESSONS.length} Lektionen`, `${UNITS.length} Einheiten`, "28 Buchstaben", "5 Min. pro Lektion"],
    pathTitle: "Dein Lernpfad", alphaTitle: "Das arabische Alphabet",
    howTitle: "So lernst du hier", how: [
      ["Kurze Lektionen", "Jede Lektion dauert etwa fünf Minuten: erst Lernkarten, dann abwechslungsreiche Übungen."],
      ["Fehler kommen zurück", "Was du falsch beantwortest, kommt am Ende der Lektion noch einmal – so lange, bis es sitzt."],
      ["Laut mitsprechen", "Lesen lernt man mit dem Mund. Sprich jeden Laut mit – wo dein Gerät eine arabische Stimme hat, kannst du ihn anhören."],
      ["Vom Buchstaben zum Koran", "In Einheit 6 liest du echte Koranwörter aus Al-Fatiha, Al-Ikhlas, Al-Falaq und An-Nas – mit Bedeutung. Danach hörst du sie Wort für Wort in echter Rezitation und liest ganze Verse. Wer schon etwas lesen kann, startet mit dem Einstufungstest."],
    ],
    teacher: "Die Aussprache mancher Laute (ح ع ق ص ض ط ظ) lernt man am besten durch Zuhören und mit einem Lehrer. Hör im Player einem Rezitator zu und sprich nach – das ist der Weg, den auch Koranschulen gehen.",
    after: "Nach dem Kurs", afterBody: "Wenn du lesen kannst, beginnt das eigentliche Abenteuer: Mit der Shams-Methode lernst du Vers für Vers auswendig, im Tajwid-Kurs lernst du die Regeln der schönen Rezitation.",
    ctaPath: "Zum Lernpfad", ctaPlace: "Einstufungstest",
    signsTitle: "Die Zeichen der Koranschrift", signsLead: "Vokale, Dehnung, Verdopplung und die Besonderheiten des Mushaf – jedes Zeichen mit einem Beispiel. In den Einheiten 3 bis 5 übst du sie alle.",
    sheetTitle: "Alle Buchstaben auf einen Blick", sheetLead: "Name, Laut und die drei verbundenen Formen. Arabisch liest man von rechts nach links – die Form am Wortanfang steht rechts.",
    makhTitle: "Woher die Laute kommen", makhLead: "In der Tajwid-Lehre hat jeder Buchstabe seinen Austrittsort (Machradsch). Diese vier Gruppen helfen dir am Anfang besonders:",
    makh: [
      ["Aus der Kehle", "ء ه ع ح غ خ", "Sechs Buchstaben kommen aus der Kehle: ء und ه ganz aus der Tiefe, ع und ح aus der Mitte, غ und خ aus dem oberen Teil."],
      ["Mit den Lippen", "ف ب م و", "Vier Buchstaben bilden die Lippen: ف mit der Unterlippe und den oberen Schneidezähnen, ب und م mit geschlossenen Lippen, و mit gerundeten Lippen."],
      ["Die schweren Buchstaben", "خ ص ض غ ط ق ظ", "Sieben Buchstaben werden immer „schwer“ und voll gesprochen (Tafchim), weil sich der hintere Teil der Zunge hebt. Merksatz: «خُصَّ ضَغْطٍ قِظْ»."],
      ["Die Dehnungsbuchstaben", "ا و ي", "ا, و und ي verlängern den Vokal davor, wenn sie selbst keinen Vokal tragen: das lange ā, ū und ī. Ihr Austrittsort ist der Hohlraum von Mund und Kehle (al-Dschauf)."],
    ] as [string, string, string][],
    faqTitle: "Häufige Fragen", faq: [
      ["Wie lange dauert der Kurs?", `${LESSONS.length} kurze Lektionen von etwa fünf Minuten in ${UNITS.length} Einheiten. Mit einer Lektion am Tag liest du nach wenigen Wochen ganze Verse – wer mehr Zeit hat, kommt schneller voran.`],
      ["Muss ich Arabisch verstehen?", "Nein. Der Kurs bringt dir das Lesen der Schrift bei. Die Bedeutung vieler Koranwörter lernst du nebenbei – für mehr Wortschatz gibt es den Vokabeltrainer."],
      ["Welche Schrift lerne ich?", "Die Schrift des Korans mit allen Vokal- und Lesezeichen, wie im Mushaf – mit ihren Besonderheiten wie dem kleinen Alif und dem Wasla-Zeichen. Ab Einheit 6 liest du echte Wörter und Verse aus dem Koran."],
      ["Brauche ich ein Konto?", "Ja, ein kostenloses. Darin wird dein Fortschritt gespeichert – Lektionen, Sterne und die Wörter, die du wiederholen solltest – und auf allen deinen Geräten synchronisiert."],
      ["Ist der Kurs für Kinder geeignet?", "Ja. Die Lektionen sind kurz und spielerisch. Am schönsten ist es, wenn Eltern sie gemeinsam mit ihren Kindern machen und jeden Laut zusammen aussprechen."],
    ] as [string, string][],
    ctaShams: "Zur Shams-Methode", ctaTajweed: "Zum Tajwid-Kurs",
  },
  en: {
    kicker: "Learn to read Arabic · for beginners", title: "Read the Quran – even if you don't know a single letter today",
    lead: "This course teaches you to read the Quranic script the way Quran schools have done for generations: first the letters, then their shapes, then the vowel signs – until you read Al-Fatiha and the short surahs yourself. In small five-minute lessons, with exercises, pairs and tests.",
    stats: [`${LESSONS.length} lessons`, `${UNITS.length} units`, "28 letters", "5 min per lesson"],
    pathTitle: "Your learning path", alphaTitle: "The Arabic alphabet",
    howTitle: "How you learn here", how: [
      ["Short lessons", "Each lesson takes about five minutes: first learning cards, then varied exercises."],
      ["Mistakes come back", "Whatever you get wrong comes back at the end of the lesson – until it sticks."],
      ["Say it out loud", "You learn to read with your mouth. Say every sound – where your device has an Arabic voice you can listen to it."],
      ["From letters to the Quran", "In unit 6 you read real Quran words from Al-Fatiha, Al-Ikhlas, Al-Falaq and An-Nas – with their meaning. Then you hear them word by word in real recitation and read whole verses. If you can already read a little, start with the placement test."],
    ],
    teacher: "Some sounds (ح ع ق ص ض ط ظ) are best learned by listening and with a teacher. Listen to a reciter in the player and repeat – the same way Quran schools teach.",
    after: "After the course", afterBody: "Once you can read, the real adventure begins: with the Shams Method you memorise verse by verse, and the tajweed course teaches the rules of beautiful recitation.",
    ctaPath: "See the learning path", ctaPlace: "Placement test",
    signsTitle: "The signs of the Quranic script", signsLead: "Vowels, lengthening, doubling and the particular signs of the mushaf – every sign with an example. You practise all of them in units 3 to 5.",
    sheetTitle: "Every letter at a glance", sheetLead: "Name, sound and the three joined forms. Arabic is read from right to left – the form at the start of a word stands on the right.",
    makhTitle: "Where the sounds come from", makhLead: "In tajweed every letter has its point of articulation (makhraj). These four groups help you most at the start:",
    makh: [
      ["From the throat", "ء ه ع ح غ خ", "Six letters come from the throat: ء and ه from its deepest part, ع and ح from the middle, غ and خ from the upper part."],
      ["With the lips", "ف ب م و", "Four letters are formed by the lips: ف with the lower lip and the upper front teeth, ب and م with closed lips, و with rounded lips."],
      ["The heavy letters", "خ ص ض غ ط ق ظ", "Seven letters are always pronounced “heavy” and full (tafkhim), because the back of the tongue rises. Memory aid: «خُصَّ ضَغْطٍ قِظْ»."],
      ["The letters of lengthening", "ا و ي", "ا, و and ي lengthen the vowel before them when they carry no vowel themselves: the long ā, ū and ī. They come from the open space of the mouth and throat (al-jawf)."],
    ] as [string, string, string][],
    faqTitle: "Frequently asked questions", faq: [
      ["How long does the course take?", `${LESSONS.length} short lessons of about five minutes in ${UNITS.length} units. With one lesson a day you read whole verses within a few weeks – with more time you progress faster.`],
      ["Do I need to understand Arabic?", "No. The course teaches you to read the script. You pick up the meaning of many Quran words along the way – for more vocabulary there is the vocabulary trainer."],
      ["Which script do I learn?", "The script of the Quran with all its vowel and reading signs, as in the mushaf – including its particular signs such as the small alif and the wasla. From unit 6 you read real words and verses from the Quran."],
      ["Do I need an account?", "Yes, a free one. It keeps your progress – lessons, stars and the words you should review – and syncs it to all your devices."],
      ["Is the course suitable for children?", "Yes. The lessons are short and playful. It is most beautiful when parents do them together with their children and say every sound together."],
    ] as [string, string][],
    ctaShams: "Discover the Shams Method", ctaTajweed: "Tajweed course",
  },
  ar: {
    kicker: "تعلّم القراءة العربية · للمبتدئين", title: "اقرأ القرآن – ولو لم تكن تعرف اليوم حرفًا واحدًا",
    lead: "تعلّمك هذه الدورة قراءة الرسم القرآني كما دأبت مدارس تحفيظ القرآن جيلًا بعد جيل: الحروف أولًا، ثم أشكالها، ثم الحركات – حتى تقرأ الفاتحة والسور القصيرة بنفسك. في دروس صغيرة مدة كلٍّ منها خمس دقائق، مع تمارين وأزواج واختبارات.",
    stats: [`${LESSONS.length} درسًا`, `${UNITS.length} وحدات`, "28 حرفًا", "5 دقائق لكل درس"],
    pathTitle: "مسار تعلّمك", alphaTitle: "الأبجدية العربية",
    howTitle: "كيف تتعلّم هنا", how: [
      ["دروس قصيرة", "يستغرق كل درس نحو خمس دقائق: بطاقات تعليمية أولًا، ثم تمارين متنوعة."],
      ["الأخطاء تعود إليك", "كل ما أخطأت فيه يعود في آخر الدرس – حتى يثبت في ذهنك."],
      ["انطق بصوتك", "القراءة تُتعلَّم بالفم. انطق كل حرف بصوتك، وإن كان في جهازك صوت عربي فيمكنك الاستماع إليه."],
      ["من الحرف إلى القرآن", "في الوحدة السادسة تقرأ كلمات قرآنية حقيقية من الفاتحة والإخلاص والفلق والناس – مع معانيها. ثم تسمعها كلمةً كلمة بتلاوةٍ حقيقية، وتقرأ الآيات كاملة. ومن كان يقرأ شيئًا من قبل فليبدأ باختبار تحديد المستوى."],
    ],
    teacher: "إن مخارج بعض الحروف (ح ع ق ص ض ط ظ) تُتقَن بالسماع والتلقّي عن معلّم. استمع إلى قارئ في المشغّل ورَدِّد خلفه – فهذا هو الطريق الذي تسلكه مدارس القرآن.",
    after: "بعد الدورة", afterBody: "إذا صرت تقرأ فقد بدأت الرحلة الحقيقية: بمنهج شمس تحفظ آيةً آيةً، وفي دورة التجويد تتعلّم أحكام التلاوة الحسنة.",
    ctaPath: "إلى مسار التعلّم", ctaPlace: "اختبار تحديد المستوى",
    signsTitle: "علامات الضبط في المصحف", signsLead: "الحركات والمدود والتشديد وما يختصّ به رسم المصحف – كل علامةٍ بمثال، وتتدرّب عليها جميعًا في الوحدات من الثالثة إلى الخامسة.",
    sheetTitle: "الحروف كلها في لمحة", sheetLead: "اسم الحرف وصوته وأشكاله الثلاثة عند الوصل. تُقرأ العربية من اليمين إلى اليسار، فشكل الحرف في أول الكلمة يقع على اليمين.",
    makhTitle: "مخارج الحروف", makhLead: "لكل حرفٍ في علم التجويد مخرجٌ يخرج منه، وتعينك هذه المجموعات الأربع في البداية خاصة:",
    makh: [
      ["حروف الحلق", "ء ه ع ح غ خ", "ستة أحرف تخرج من الحلق: الهمزة والهاء من أقصاه، والعين والحاء من وسطه، والغين والخاء من أدناه."],
      ["الحروف الشفوية", "ف ب م و", "أربعة أحرف تخرج من الشفتين: الفاء من باطن الشفة السفلى مع أطراف الثنايا العليا، والباء والميم بانطباق الشفتين، والواو بانضمامهما."],
      ["حروف الاستعلاء", "خ ص ض غ ط ق ظ", "سبعة أحرف تُفخَّم دائمًا لاستعلاء أقصى اللسان عند النطق بها، ويجمعها قولهم: «خُصَّ ضَغْطٍ قِظْ»."],
      ["حروف المدّ", "ا و ي", "الألف والواو والياء حروف مدٍّ إذا سكنت وجانسها ما قبلها، فتمدّ الصوت: «ـَا» و«ـُو» و«ـِي». ومخرجها الجوف: الخلاء الممتد في الحلق والفم."],
    ] as [string, string, string][],
    faqTitle: "أسئلة شائعة", faq: [
      ["كم تستغرق الدورة؟", `${LESSONS.length} درسًا قصيرًا، مدة كلٍّ منها نحو خمس دقائق، في ${UNITS.length} وحدات. بدرسٍ واحد كل يوم تقرأ آياتٍ كاملة في غضون أسابيع قليلة، ومن كان لديه وقتٌ أكثر تقدّم أسرع.`],
      ["هل يجب أن أفهم العربية؟", "لا. تعلّمك الدورة قراءة الحروف والكلمات، وتتعرّف في أثناء ذلك على معاني كثيرٍ من كلمات القرآن، ولمزيدٍ من المفردات استعمل مدرّب المفردات."],
      ["بأيّ رسمٍ أتعلّم؟", "برسم المصحف مع جميع علامات الضبط، بما فيه ما يختصّ به كالألف الخنجرية وهمزة الوصل. ومن الوحدة السادسة تقرأ كلماتٍ وآياتٍ حقيقية من القرآن الكريم."],
      ["هل أحتاج إلى حساب؟", "نعم، حسابٌ مجاني يُحفظ فيه تقدّمك – الدروس والنجوم والكلمات التي تحتاج إلى مراجعتها – ويُزامَن على جميع أجهزتك."],
      ["هل تناسب الدورة الأطفال؟", "نعم، فالدروس قصيرة وممتعة، وأجمل ما تكون حين يؤدّيها الوالدان مع أبنائهم وينطقون كل حرفٍ معًا."],
    ] as [string, string][],
    ctaShams: "تعرّف على منهج شمس", ctaTajweed: "دورة التجويد",
  },
};
const content = (l: string) => (l === "de" ? C.de : l === "ar" ? C.ar : C.en);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/arabic", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

// the signs of the script, taken from the learning cards of units 3 to 5 (one place for every text)
const SIGN_LESSONS = ["c1", "c2", "c3", "d1", "d2", "d3", "d4", "e1", "e2"];

export default async function ArabicPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const ld = { "@context": "https://schema.org", "@type": "Course", name: c.title, description: c.lead, url: abs(`/${locale}/arabic`), inLanguage: locale, isAccessibleForFree: true, provider: { "@type": "Organization", name: "Quran Masterclass", url: abs("/") }, hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT5M" } };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  const signs = SIGN_LESSONS.flatMap((id) => LESSONS.find((l) => l.id === id)?.learn ?? []);
  const tx = (v: { de: string; en: string; ar?: string }) => v[lang] ?? v.en;
  return (
    <div>
      <JsonLd data={ld} />
      <JsonLd data={faqLd} />
      {/* hero: the alphabet on a ring of light */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 78% 45%, rgb(233 207 153 / .14) 0, transparent 46%)" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] [&>*]:min-w-0">
          <div>
            <p className="rise text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
            <h1 className="rise font-display mt-4 max-w-3xl text-[38px] leading-[1.06] sm:text-[54px] lg:text-6xl" style={{ animationDelay: "100ms" }}>{c.title}</h1>
            <p className="rise mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70 sm:text-[18px]" style={{ animationDelay: "200ms" }}>{c.lead}</p>
            <ul className="rise mt-7 flex flex-wrap gap-2" style={{ animationDelay: "280ms" }}>{c.stats.map((s) => <li key={s} className="inline-flex items-center gap-2 rounded-full border border-[rgb(214_180_108)]/30 bg-white/[0.04] px-3 py-1 text-sm text-white/85"><PracticeStar size={9} />{s}</li>)}</ul>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "360ms" }}>
              <a href="#path" className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{c.ctaPath}</a>
              <Link href="/arabic/placement" className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.ctaPlace}</Link>
            </div>
          </div>
          <figure className="pb-8" aria-label={c.alphaTitle}><PracticeAlphabetRing /></figure>
        </div>
        <div className="pa-arcade" />
      </section>

      <section id="path" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-14">
        <h2 className="font-display mb-8 text-3xl sm:text-4xl">{c.pathTitle}</h2>
        <ArabicHome />
      </section>

      {/* how it works */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-3xl sm:text-4xl">{c.howTitle}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.how.map(([h, d], i) => (
              <li key={h} className="pa-card p-5 pt-6">
                <PracticeStarNum n={i + 1} size={46} />
                <h3 className="mt-3 text-[17px] font-bold">{h}</h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ul>
          <p className="callout mt-6 rounded-lg p-5 text-[15px] leading-relaxed">{c.teacher}</p>
        </div>
      </section>

      {/* the signs of the script */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl">{c.signsTitle}</h2>
        <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted">{c.signsLead}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {signs.map((x) => (
            <li key={x.ar + tx(x.title)} className="pa-card flex gap-4 p-5">
              <span className="pa-arch-soft grid h-[92px] w-[84px] shrink-0 place-items-center border border-[rgb(var(--gold))]/35 bg-[rgb(var(--gold))]/[0.07] px-1 pt-3">
                <span className={`font-arabic whitespace-nowrap leading-[1.5] text-gold ${x.ar.length > 7 ? "text-[19px]" : x.ar.length > 4 ? "text-[25px]" : "text-[34px]"}`} dir="rtl" lang="ar">{x.ar}</span>
              </span>
              <span className="min-w-0">
                <span className="block text-[16px] font-bold leading-snug">{tx(x.title)}</span>
                <span className="mt-1 block text-[14px] leading-relaxed text-muted">{tx(x.body)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* where the sounds come from */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-16">
          <h2 className="font-display text-3xl sm:text-4xl">{c.makhTitle}</h2>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-white/70">{c.makhLead}</p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.makh.map(([h, letters, d]) => (
              <li key={h} className="pa-arch-soft relative overflow-hidden border border-[rgb(214_180_108)]/30 bg-white/[0.04] px-5 pb-6 pt-8 text-center">
                <span aria-hidden className="niche" />
                <p className="font-arabic relative text-[27px] leading-[1.7] text-[#f3e2b6] sm:text-[30px]" dir="rtl" lang="ar">{letters}</p>
                <h3 className="relative mt-2 text-[17px] font-bold">{h}</h3>
                <p className="relative mt-2 text-[14px] leading-relaxed text-white/70">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="pa-arcade" />
      </section>

      {/* every letter */}
      <section className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-display text-3xl sm:text-4xl">{c.sheetTitle}</h2>
        <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted">{c.sheetLead}</p>
        <div className="mt-8"><PracticeLetterSheet /></div>
      </section>

      {/* questions */}
      <section className="mx-auto max-w-3xl px-5 pb-16">
        <h2 className="font-display text-3xl sm:text-4xl">{c.faqTitle}</h2>
        <div className="mt-6 grid gap-3">
          {c.faq.map(([q, a]) => (
            <details key={q} className="pa-card pa-plain group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-bold">{q}<span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[rgb(var(--gold))]/50 text-gold transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-5 py-14 sm:grid-cols-[auto_minmax(0,1fr)] [&>*]:min-w-0">
          <PracticeWindow word="اقرأ" uid="ar-after" lamp className="mx-auto h-[220px] w-auto" />
          <div className="text-center sm:text-start">
            <h2 className="font-display text-3xl sm:text-4xl">{c.after}</h2>
            <p className="mt-4 max-w-2xl text-white/70">{c.afterBody}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 sm:justify-start">
              <Link href="/shams" className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{c.ctaShams}</Link>
              <Link href="/tajweed" className="inline-flex h-12 items-center rounded-full border border-white/30 px-6 text-[15px] font-bold hover:border-white">{c.ctaTajweed}</Link>
            </div>
          </div>
        </div>
      </section>
      <MoreTiles keys={["salah", "tajweed", "vocab", "shams"]} />
    </div>
  );
}
