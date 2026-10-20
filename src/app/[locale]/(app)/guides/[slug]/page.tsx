import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown, { mdHeadings } from "@/components/Markdown";
import JsonLd from "@/components/JsonLd";
import { GUIDES, guideText } from "@/lib/guides";
import { abs, pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IslamArcadeLine, IslamBreak, IslamRain, IslamStarMark, saw } from "@/components/art/IslamArt";
import IslamReader, { IslamToc } from "@/components/art/IslamReader";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) return {};
  const gt = guideText(g, locale);
  const m = pageMeta(locale, `/guides/${slug}`, `${gt.title} | Quran Masterclass`, gt.desc, gt.keywords);
  return { ...m, openGraph: { ...m.openGraph, type: "article" } };
}

export default async function GuidePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const g = GUIDES.find((x) => x.slug === slug);
  if (!g) notFound();
  const t = await getTranslations("guides");
  const gt = guideText(g, locale);
  const title = gt.title;
  const toc = mdHeadings(gt.body);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: title, description: gt.desc, datePublished: g.date, dateModified: g.date, inLanguage: locale, author: { "@type": "Person", name: "Nami Shams" }, publisher: { "@type": "Organization", name: "Quran Masterclass", logo: abs("/icon-512.png") }, mainEntityOfPage: abs(`/${locale}/guides/${slug}`) },
      { "@type": "FAQPage", inLanguage: locale, mainEntity: gt.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: t("title"), item: abs(`/${locale}/guides`) },
        { "@type": "ListItem", position: 3, name: title, item: abs(`/${locale}/guides/${slug}`) },
      ] },
    ],
  };
  return (
    <main>
      <JsonLd data={ld} />
      <IslamReader sections={toc} title={title} targetId="guide" />
      <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
        <IslamRain fall={420} className="opacity-70" />
        <CalligraphyDraw text={"دليل"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-24 pt-10 sm:pb-28 sm:pt-16">
          <Link href="/guides" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[13px] font-semibold text-white/70 transition hover:border-[rgb(233_207_153)]/60 hover:text-white"><ArrowBack /> {t("title")}</Link>
          <h1 className="font-display mt-6 max-w-4xl text-[38px] leading-[1.06] sm:text-6xl">{saw(title)}</h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">{saw(gt.desc)}</p>
          <p className="mt-5 flex items-center gap-2 text-sm text-white/60"><IslamStarMark className="h-3.5 w-3.5 text-[rgb(233_207_153)]" />{t("by")} · {new Date(g.date).toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="min-w-0 max-w-[44rem]">
            <article id="guide"><Markdown text={gt.body} variant="article" /></article>

            <IslamBreak />
            <section>
              <h2 className="font-display text-3xl">{t("faq")}</h2>
              <div className="mt-6 grid gap-3">
                {gt.faq.map((f, i) => (
                  <details key={i} className="isl-faq isl-card group p-0">
                    <summary className="flex cursor-pointer list-none items-start gap-3 p-4 text-[16.5px] font-semibold leading-snug sm:p-5">
                      <IslamStarMark className="mt-1 h-4 w-4 shrink-0 text-[rgb(var(--isl-gold-soft))]" />
                      <span className="min-w-0 flex-1">{saw(f.q)}</span>
                      <span aria-hidden className="isl-plus h-7 w-7 shrink-0 rounded-full border border-[rgb(var(--isl-gold-soft))]/50 text-[rgb(var(--isl-gold))]">+</span>
                    </summary>
                    <p className="px-4 pb-5 ps-11 text-[15px] leading-relaxed text-muted sm:px-5 sm:ps-12">{saw(f.a)}</p>
                  </details>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{t("related")}</h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {g.related.map((r) => GUIDES.find((x) => x.slug === r)).filter(Boolean).map((r) => (
                  <li key={r!.slug}><Link href={`/guides/${r!.slug}`} className="isl-card isl-card-hover flex h-full items-center justify-between gap-3 px-4 py-3 text-[15px] font-semibold">{saw(guideText(r!, locale).title)} <span className="shrink-0 text-[rgb(var(--isl-gold))]"><ArrowNext /></span></Link></li>
                ))}
              </ul>
            </section>
          </div>
          {toc.length > 2 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6 pe-1"><IslamToc sections={toc} targetId="guide" label={title} /></div>
            </aside>
          )}
        </div>
      </div>

      <section className="stage girih relative overflow-hidden text-center text-[#eef0f3]">
        <IslamRain fall={360} className="opacity-60" />
        <div className="relative mx-auto max-w-3xl px-5 py-14 sm:py-16">
          <p className="font-display text-2xl leading-snug sm:text-3xl">{t("ctaTitle")}</p>
          <Link href="/academy" className="btn-gold mt-6 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{t("cta")}</Link>
        </div>
      </section>
    </main>
  );
}
