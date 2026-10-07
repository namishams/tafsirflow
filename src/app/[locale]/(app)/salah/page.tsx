import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import PrayerTrainer from "@/components/PrayerTrainer";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { ArrowNext } from "@/components/Icons";
import { PracticeHero, PracticeStar } from "@/components/art/PracticeArt";

const C = {
  de: {
    kicker: "Gebet lernen · Schritt für Schritt", title: "So betest du – mit einem Trainer, der jede Bewegung zeigt",
    lead: "Wähle das Gebet und deine Tradition. Die Figur zeigt jede Haltung, dazu siehst du die arabischen Worte, die Umschrift und die Bedeutung. Spiele den Ablauf ab oder geh Schritt für Schritt – so oft du willst.",
    whyTitle: "Das Gebet – das Erste, worüber wir befragt werden", why: "Der Prophet ﷺ sagte, dass das Gebet die erste Tat ist, über die ein Mensch am Tag der Auferstehung Rechenschaft ablegt (at-Tirmidhi, Abu Dawud, an-Nasa'i). Fünfmal am Tag trittst du vor Allah – mit Körper, Zunge und Herz. Wer es einmal richtig gelernt hat, trägt es ein Leben lang.",
    more: "Ausführlich erklärt", links: [["/islam/prayer-sunni", "Wie man betet – sunnitisch"], ["/islam/prayer-shia", "Wie man betet – schiitisch (Dscha'fari)"], ["/prayer", "Gebetszeiten und Adhan"], ["/arabic", "Arabisch lesen lernen"]],
  },
  en: {
    kicker: "Learn the prayer · step by step", title: "How to pray – with a trainer that shows every movement",
    lead: "Choose the prayer and your tradition. The figure shows every posture, with the Arabic words, the transliteration and the meaning. Play the whole sequence or go step by step – as often as you like.",
    whyTitle: "The prayer – the first thing we will be asked about", why: "The Prophet ﷺ said that prayer is the first deed a person will be held to account for on the Day of Resurrection (at-Tirmidhi, Abu Dawud, an-Nasa'i). Five times a day you stand before Allah – with body, tongue and heart. Once you have learned it properly, it stays with you for life.",
    more: "Explained in detail", links: [["/islam/prayer-sunni", "How to pray – Sunni"], ["/islam/prayer-shia", "How to pray – Shia (Ja'fari)"], ["/prayer", "Prayer times and adhan"], ["/arabic", "Learn to read Arabic"]],
  },
  ar: {
    kicker: "تعلّم الصلاة خطوةً خطوة", title: "هكذا تصلّي – مع مدرّبٍ يُريك كل حركة",
    lead: "اختر الصلاة ومذهبك، فيُريك الشكل كل هيئة من هيئات الصلاة، ومعها الأذكار بالعربية. شغّل الصلاة كاملة أو تنقّل بين خطواتها كما تشاء.",
    whyTitle: "الصلاة أول ما يُحاسَب عليه العبد", why: "قال النبي ﷺ: «إنّ أوّل ما يُحاسَب به العبد يوم القيامة من عمله صلاته» (رواه الترمذي وأبو داود والنسائي). خمس مرات في اليوم تقف بين يدي الله بجسدك ولسانك وقلبك، ومن تعلّمها على وجهها الصحيح صحبته طوال عمره.",
    more: "شرح مفصّل", links: [["/islam/prayer-sunni", "صفة الصلاة عند أهل السنة"], ["/islam/prayer-shia", "صفة الصلاة في المذهب الجعفري"], ["/prayer", "مواقيت الصلاة والأذان"], ["/arabic", "تعلّم القراءة العربية"]],
  },
};
const content = (l: string) => (l === "de" ? C.de : l === "ar" ? C.ar : C.en);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = content(locale);
  return pageMeta(locale, "/salah", `${c.kicker} | Quran Masterclass`, c.lead.slice(0, 158));
}

export default async function SalahPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = content(locale);
  const ld = { "@context": "https://schema.org", "@type": "HowTo", name: c.title, description: c.lead, url: abs(`/${locale}/salah`), inLanguage: locale };
  return (
    <>
    <JsonLd data={ld} />
    <PracticeHero uid="salah-h" word="الصلاة" kicker={c.kicker} title={c.title} lead={c.lead} />
    <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-5 sm:pt-12">
      <PrayerTrainer />
      <section className="mt-16 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <figure className="pa-paper px-6 pb-7 pt-8 sm:px-8">
          <h2 className="font-display text-3xl">{c.whyTitle}</h2>
          <p className="relative mt-4 text-[17px] leading-relaxed text-ink/90">{c.why}</p>
        </figure>
        <div className="pa-card p-5 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted rtl:tracking-normal">{c.more}</p>
          <ul className="mt-3 grid gap-1">{c.links.map(([h, l]) => <li key={h}><Link href={h} className="flex min-h-11 items-center gap-2.5 rounded-lg px-2 font-semibold text-accent hover:bg-[rgb(var(--gold))]/10"><PracticeStar size={10} /><span className="min-w-0 flex-1">{l}</span><ArrowNext /></Link></li>)}</ul>
        </div>
      </section>
    </main>
    <MoreTiles keys={["arabic", "duas", "prayer", "islam"]} />
    </>
  );
}
