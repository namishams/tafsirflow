import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import WuduTrainer from "@/components/WuduTrainer";
import { CalligraphyDraw, Divider } from "@/components/Ornaments";
import { MoreTiles } from "@/components/PosterTiles";
import { ArrowNext } from "@/components/Icons";
import { PracticeStar } from "@/components/art/PracticeArt";
import { getVerseByKey } from "@/lib/quran";
import { WUDU } from "@/lib/wudu";
import { abs, pageMeta } from "@/lib/site";

type Virtue = { ar: string; text: string; src: string; href?: string };
const C = {
  de: {
    kicker: "Gebetswaschung · Schritt für Schritt", title: "Wudu – so wäschst du dich für das Gebet",
    lead: "Bevor du vor Allah trittst, wäschst du dich – mit Wasser und mit Absicht. Der Trainer zeigt dir jeden Schritt, sagt dir, was Pflicht ist und was empfohlen, und am Ende prüfst du dich mit einem kleinen Quiz.",
    verseKicker: "Der Wudu-Vers", verseTitle: "Was Allah über die Waschung sagt",
    verseLead: "Die Gebetswaschung steht im Quran selbst: das Gesicht, die Arme bis zu den Ellenbogen, der Kopf und die Füße bis zu den Knöcheln.",
    verseRef: "Sura al-Ma'ida 5:6", listen: "Vers anhören", trBy: "Übersetzung: Bubenheim & Elyas",
    breaksTitle: "Was das Wudu aufhebt", breaksLead: "Darin sind sich alle Rechtsschulen einig:",
    breaks: ["Wenn Urin, Stuhl oder Winde den Körper verlassen", "Tiefer Schlaf", "Bewusstlosigkeit"],
    breaksNote: "Andere Punkte – etwa Berührungen, Blutungen oder andere Ausscheidungen – beurteilen die Rechtsschulen unterschiedlich. Frag dazu einen Lehrer deiner Schule.",
    tayTitle: "Kein Wasser? Tayammum",
    tay: "Findest du kein Wasser oder würde es dir schaden, erlaubt Allah dir die Reinigung mit reiner Erde (Tayammum) – im selben Vers 5:6 und in 4:43. Du fasst die Absicht, schlägst mit den Handflächen auf reine Erde und streichst damit über das Gesicht und die Hände. Wie oft du aufschlägst und wie weit du über die Hände streichst, beschreiben die Rechtsschulen unterschiedlich. Sobald du wieder Wasser verwenden kannst, machst du für das nächste Gebet wieder Wudu.",
    virtueTitle: "Warum die Waschung so viel wert ist",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah liebt die, die sich reumütig (Ihm) zuwenden, und Er liebt die, die sich reinigen.", src: "Quran 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Die Reinheit ist die Hälfte des Glaubens.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Uthman ibn Affan zeigte, wie der Prophet ﷺ die Waschung verrichtete, und überlieferte seine Worte: Wer die Waschung so verrichtet wie diese und dann zwei Rak'a betet, ohne mit den Gedanken abzuschweifen, dem werden seine früheren Sünden vergeben.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    more: "Weiter lernen", links: [["/salah", "Beten lernen – der Gebetstrainer"], ["/prayer", "Gebetszeiten und Adhan"], ["/islam", "Islam verstehen – alle Kapitel"], ["/islam/prayer-sunni", "Wudu und Gebet ausführlich – sunnitisch"], ["/islam/prayer-shia", "Wudu und Gebet ausführlich – schiitisch"]],
  },
  en: {
    kicker: "Ablution · step by step", title: "Wudu – how to purify yourself for the prayer",
    lead: "Before you stand before Allah, you wash – with water and with intention. The trainer shows you every step, tells you what is obligatory and what is recommended, and at the end you test yourself with a short quiz.",
    verseKicker: "The wudu verse", verseTitle: "What Allah says about the ablution",
    verseLead: "The ablution is laid down in the Quran itself: the face, the arms up to the elbows, the head and the feet up to the ankles.",
    verseRef: "Surah al-Ma'idah 5:6", listen: "Listen to the verse", trBy: "Translation: Saheeh International",
    breaksTitle: "What breaks wudu", breaksLead: "All the schools agree on these:",
    breaks: ["When urine, stool or wind leaves the body", "Deep sleep", "Loss of consciousness"],
    breaksNote: "Other points – such as touching, bleeding or other discharges – are judged differently by the schools. Ask a teacher of your school about them.",
    tayTitle: "No water? Tayammum",
    tay: "If you cannot find water, or it would harm you, Allah allows you to purify yourself with clean earth (tayammum) – in the same verse 5:6 and in 4:43. You make the intention, strike clean earth with your palms and wipe your face and hands with them. How many times you strike and how far you wipe the hands is described differently by the schools. As soon as you can use water again, you make wudu again for the next prayer.",
    virtueTitle: "Why the ablution is worth so much",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "Allah loves those who repent and loves those who purify themselves.", src: "Quran 2:222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "Purity is half of faith.", src: "Sahih Muslim 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "Uthman ibn Affan showed how the Prophet ﷺ performed wudu and passed on his words: whoever performs wudu like this and then prays two rak'ahs without letting his thoughts wander, his previous sins are forgiven.", src: "Sahih al-Bukhari 159, Sahih Muslim 226" },
    ] as Virtue[],
    more: "Keep learning", links: [["/salah", "Learn to pray – the prayer trainer"], ["/prayer", "Prayer times and adhan"], ["/islam", "Understanding Islam – all chapters"], ["/islam/prayer-sunni", "Wudu and prayer in detail – Sunni"], ["/islam/prayer-shia", "Wudu and prayer in detail – Shia"]],
  },
  ar: {
    kicker: "الوضوء خطوةً خطوة", title: "الوضوء – هكذا تتطهّر للصلاة",
    lead: "قبل أن تقف بين يدي الله تتوضّأ: بالماء وبالنيّة. يُريك المدرّب كل خطوة، ويبيّن لك الواجب من المستحبّ، وفي النهاية تختبر نفسك باختبارٍ قصير.",
    verseKicker: "آية الوضوء", verseTitle: "ما قاله الله تعالى في الوضوء",
    verseLead: "جاء الوضوء في القرآن الكريم نفسه: الوجه، واليدان إلى المرفقين، والرأس، والرجلان إلى الكعبين.",
    verseRef: "سورة المائدة، الآية 6", listen: "استمع إلى الآية", trBy: "",
    breaksTitle: "نواقض الوضوء", breaksLead: "وهذه متّفقٌ عليها بين المذاهب:",
    breaks: ["خروج البول أو الغائط أو الريح", "النوم المستغرق", "زوال العقل بالإغماء ونحوه"],
    breaksNote: "وأمّا غيرها – كاللمس وخروج الدم وسائر الخارج – ففيه خلافٌ بين المذاهب، فاسأل عنه معلّمًا من مذهبك.",
    tayTitle: "لا ماء؟ التيمّم",
    tay: "إذا لم تجد الماء أو كان استعماله يضرّك، أباح الله لك التطهّر بالصعيد الطيّب (التيمّم)، في الآية نفسها (المائدة: 6) وفي سورة النساء (43). تنوي، ثم تضرب بكفّيك على الصعيد الطاهر، وتمسح بهما وجهك ويديك. وتختلف المذاهب في عدد الضربات وفي القدر الذي يُمسح من اليدين. فإذا قدرت على استعمال الماء عدت إلى الوضوء للصلاة التالية.",
    virtueTitle: "فضل الوضوء",
    virtues: [
      { ar: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", text: "", src: "سورة البقرة، الآية 222", href: "/surah/2?v=222" },
      { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", text: "", src: "صحيح مسلم 223" },
      { ar: "مَنْ تَوَضَّأَ نَحْوَ وُضُوئِي هَذَا، ثُمَّ صَلَّى رَكْعَتَيْنِ لَا يُحَدِّثُ فِيهِمَا نَفْسَهُ، غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", text: "توضّأ عثمان بن عفّان رضي الله عنه كما رأى النبيَّ ﷺ يتوضّأ، ثم روى عنه ﷺ قوله:", src: "صحيح البخاري 159، صحيح مسلم 226" },
    ] as Virtue[],
    more: "تابع التعلّم", links: [["/salah", "تعلّم الصلاة – مدرّب الصلاة"], ["/prayer", "مواقيت الصلاة والأذان"], ["/islam", "تعرّف على الإسلام – كل الفصول"], ["/islam/prayer-sunni", "الوضوء والصلاة بالتفصيل عند أهل السنة"], ["/islam/prayer-shia", "الوضوء والصلاة بالتفصيل في المذهب الجعفري"]],
  },
};
const content = (l: string) => (l === "de" ? C.de : l === "ar" ? C.ar : C.en);

// Quran 5:6 from Quran.com (through our cache): Arabic plus the German or English translation; nothing if unavailable
async function wuduVerse(locale: string) {
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  try {
    const v = await getVerseByKey("5:6", lang, lang === "de" ? 27 : 20);
    if (v.verse_key !== "5:6") return null;
    return { ar: v.text_uthmani, tr: v.translation.replace(/<[^>]+>/g, "").trim() };
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/wudu", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function WuduPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const verse = await wuduVerse(locale);
  const ld = {
    "@context": "https://schema.org", "@type": "HowTo", name: c.title, description: c.lead, url: abs(`/${locale}/wudu`), inLanguage: locale,
    supply: [{ "@type": "HowToSupply", name: lang === "de" ? "Reines Wasser" : lang === "ar" ? "ماء طهور" : "Clean water" }],
    step: WUDU.sunni.map((s, k) => ({ "@type": "HowToStep", position: k + 1, name: s.title[lang], text: s.text[lang] })),
  };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={"الوضوء"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.kicker}</p>
          <h1 className="font-display mt-4 max-w-3xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/70">{c.lead}</p>
        </div>
        <div className="pa-arcade" />
      </section>

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-5 sm:pt-10">
        <WuduTrainer />

        <section className="mt-14 sm:mt-20">
          <div className="callout rounded-lg p-5 sm:p-8">
            <p className="eyebrow">{c.verseKicker}</p>
            <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">{c.verseTitle}</h2>
            <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{c.verseLead}</p>
            {verse?.ar && <p className="font-arabic mt-6 text-[24px] leading-[2.15] sm:text-[30px]" dir="rtl" lang="ar">{verse.ar} <span className="verse-end">﴿٦﴾</span></p>}
            {verse?.tr && lang !== "ar" && <p className="mt-4 max-w-4xl text-[16px] leading-relaxed text-ink/90">{verse.tr}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="font-semibold text-gold">{c.verseRef}</span>
              {verse?.tr && lang !== "ar" && <span className="text-muted">{c.trBy}</span>}
              <Link href="/surah/5?v=6" className="inline-block py-2 font-semibold text-accent hover:underline">{c.listen} <ArrowNext /></Link>
            </div>
          </div>
        </section>

        <section className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-2">
          <div className="pa-card p-5 pt-6 sm:p-7">
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">{c.breaksTitle}</h2>
            <p className="mt-2 text-[15px] text-muted">{c.breaksLead}</p>
            <ul className="mt-4 grid gap-2.5">
              {c.breaks.map((b) => (
                <li key={b} className="flex items-start gap-3 text-[16px] leading-snug">
                  <PracticeStar size={14} className="mt-1" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-[rgb(var(--gold))]/20 pt-4 text-[14.5px] leading-relaxed text-muted">{c.breaksNote}</p>
          </div>
          <div className="pa-card p-5 pt-6 sm:p-7">
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">{c.tayTitle}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-ink/90">{c.tay}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[["/surah/5?v=6", "5:6"], ["/surah/4?v=43", "4:43"]].map(([h, l]) => (
                <Link key={h} href={h} className="pa-chip tabular-nums">{lang === "ar" ? (l === "5:6" ? "المائدة: 6" : "النساء: 43") : `Quran ${l}`}</Link>
              ))}
            </div>
          </div>
        </section>

        <Divider className="mt-14 sm:mt-16" />

        <section className="mt-10 sm:mt-12">
          <h2 className="font-display text-3xl leading-tight sm:text-4xl">{c.virtueTitle}</h2>
          <ul className="mt-7 grid gap-4 md:grid-cols-2">
            {c.virtues.map((v, k) => (
              <li key={v.src} className={`pa-card flex flex-col p-5 pt-7 sm:p-7 ${k === 2 ? "md:col-span-2" : ""}`}>
                {lang === "ar" && v.text && <p className="text-[15px] leading-relaxed text-muted">{v.text}</p>}
                <p className="font-arabic text-[23px] leading-[2] sm:text-[25px]" dir="rtl" lang="ar">{v.ar}</p>
                {lang !== "ar" && <p className="mt-2 text-[15.5px] leading-relaxed text-ink/90">{v.text}</p>}
                <p className="mt-auto pt-4 text-[13px] font-semibold text-gold">
                  {v.href ? <Link href={v.href} className="hover:underline">{v.src}</Link> : v.src}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pa-card mt-12 p-5 pt-6 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted rtl:tracking-normal">{c.more}</p>
          <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {c.links.map(([h, l]) => <li key={h}><Link href={h} className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 font-semibold leading-snug text-accent hover:bg-[rgb(var(--gold))]/10"><PracticeStar size={10} /><span className="min-w-0 flex-1">{l}</span><ArrowNext /></Link></li>)}
          </ul>
        </section>
      </main>
      <MoreTiles keys={["salah", "prayer", "duas", "islam"]} />
    </div>
  );
}
