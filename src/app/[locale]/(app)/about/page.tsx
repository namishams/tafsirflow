import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import JsonLd from "@/components/JsonLd";
import { aboutContent } from "@/lib/aboutContent";
import { abs, pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IslamArcadeLine, IslamBreak, IslamCorners, IslamMosque, IslamNum, IslamRain } from "@/components/art/IslamArt";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMeta(locale, "/about", t("seoTitle"), t("seoDesc"));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const c = await aboutContent(locale);
  const dark = "stage text-[#eef0f3]";
  const ld = { "@context": "https://schema.org", "@type": "AboutPage", url: abs(`/${locale}/about`), mainEntity: { "@type": "Organization", name: "Quran Masterclass", foundingLocation: "Dubai", email: "info@quranmasterclass.com", url: abs("/") } };
  return (
    <div>
      <JsonLd data={ld} />

      {/* Hero */}
      <section className={`${dark} girih isl-arcade relative z-[1] overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 15% 0%, rgb(var(--gold)) 0, transparent 45%)" }} />
        <IslamRain fall={520} className="opacity-70" />
        <CalligraphyDraw text={"قصتنا"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-16 sm:pb-32 sm:pt-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.eyebrow}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[42px] leading-[1.04] sm:text-7xl">{c.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.lead}</p>
          <dl className="mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {c.facts.map((f) => <div key={f.l} className="isl-fact"><dt className="font-display text-3xl text-[rgb(233_207_153)] sm:text-4xl">{f.n}</dt><dd className="mt-1.5 text-sm text-white/65">{f.l}</dd></div>)}
          </dl>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">

      {/* Story */}
      <section className="mx-auto max-w-3xl px-5 pb-12 pt-14 sm:pb-16 sm:pt-20">
        <article><Markdown text={c.story} variant="article" numbered={false} /></article>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
        <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{c.valuesTitle}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.values.map((v, i) => (
            <div key={v.t} className="isl-card isl-card-hover p-6"><IslamNum n={i + 1} className="!h-11 !w-11 !text-[15px]" /><h3 className="mt-3 text-lg font-bold">{v.t}</h3><p className="mt-2 text-[15px] leading-relaxed text-muted">{v.d}</p></div>
          ))}
        </div>
        <div className="isl-card relative mt-12 overflow-hidden px-6 py-9 sm:px-12 sm:py-12">
          <IslamCorners />
          <h2 className="font-display relative text-3xl leading-tight">{c.freeTitle}</h2>
          <div className="relative"><Markdown text={c.free} /></div>
        </div>
      </section>
      </div>

      {/* Dubai and the Quran */}
      <section className={`${dark} girih relative overflow-hidden`}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 90% 30%, rgb(var(--gold)) 0, transparent 40%)" }} />
        <IslamRain fall={700} className="opacity-60" />
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <IslamMosque className="mb-8 w-48 text-[rgb(233_207_153)] opacity-80 sm:w-60" />
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{c.dubaiEyebrow}</p>
          <h2 className="font-display mt-4 max-w-4xl text-4xl leading-[1.08] sm:text-6xl">{c.dubaiTitle}</h2>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.dubaiLead}</p>
          <div className="mt-12 grid gap-12 lg:grid-cols-[1.25fr_0.75fr]">
            <Markdown text={c.dubai} dark />
            <ol className="grid content-start gap-3">
              {c.dubaiMoments.map((m) => (
                <li key={m.t} className="isl-jcard">
                  <p className="font-display text-2xl text-[rgb(var(--gold))]">{m.t}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{m.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="isl-marble">
      {/* Thanks */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
        <p className="eyebrow text-gold">{c.thanksEyebrow}</p>
        <h2 className="font-display mt-2 text-4xl leading-tight">{c.thanksTitle}</h2>
        <Markdown text={c.thanks} />
      </section>

      {/* Honour: rulers and custodians of the holy places */}
      {c.honour && (
        <section className="mx-auto max-w-5xl px-5 pb-16 sm:pb-24">
          <div className="isl-card relative overflow-hidden p-6 sm:p-10">
            <IslamCorners />
            <p className="eyebrow text-gold">{c.honour.eyebrow}</p>
            <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">{c.honour.title}</h2>
            <Markdown text={c.honour.body} />
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {c.honour.cities.map((ct) => (
                <li key={ct.name} className="stage arch relative overflow-hidden p-5 pt-10 text-center text-[#eef0f3]">
                  <span aria-hidden className="niche" />
                  {ct.ar && <p className="font-arabic text-2xl text-[rgb(var(--gold))]" dir="rtl">{ct.ar}</p>}
                  <p className="mt-1 font-bold">{ct.name}</p>
                  <p className="mt-1 text-sm text-white/70">{ct.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Letter */}
      <section className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
        <figure className="isl-card relative overflow-hidden px-6 pb-8 pt-10 sm:px-12 sm:pb-10 sm:pt-12">
          <IslamCorners />
          <h2 className="font-display relative text-3xl leading-tight">{c.letterTitle}</h2>
          <blockquote className="isl-serif relative mt-2 text-[18px] leading-relaxed sm:text-[19px]"><Markdown text={c.letter} /></blockquote>
          <figcaption className="relative mt-8 border-t border-[rgb(var(--isl-gold-soft))]/30 pt-5"><p className="isl-serif text-[26px] italic text-[rgb(var(--isl-head))]">{c.signature}</p><p className="text-sm text-muted">{c.signatureRole}</p></figcaption>
        </figure>
        <h2 className="font-display mt-14 text-3xl">{c.contactTitle}</h2>
        <Markdown text={c.contact} />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shams" className="btn-gold inline-flex h-11 items-center rounded-full px-5 text-sm font-bold">{t("ctaShams")}</Link>
          <Link href="/feedback" className="inline-flex h-11 items-center rounded-full border border-[rgb(var(--isl-gold-soft))]/50 px-5 text-sm font-bold hover:border-[rgb(var(--isl-gold-soft))]">{t("ctaFeedback")}</Link>
        </div>
      </section>
      </div>
      <MoreTiles keys={["how", "shams", "courses", "islam"]} className="pt-14" />
    </div>
  );
}
