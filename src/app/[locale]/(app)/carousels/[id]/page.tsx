import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import CarouselViewer from "@/components/carousel/CarouselViewer";
import AskTutor from "@/components/tutor/AskTutor";
import { CoverTile, TextVersion } from "@/components/carousel/CarouselParts";
import { carouselById, carouselList, seriesKey } from "@/lib/feed/carousels/store";
import { resolveCarousel } from "@/lib/feed/carousels/resolve";
import { carouselText, webText } from "@/lib/feed/carousels/uiText";
import { abs, pageMeta } from "@/lib/site";

// /[locale]/carousels/<id>: one carousel with its slides (drawn in the browser at Instagram's sizes), share and
// download, the text version (with the scripture from its sources) and more carousels of the series.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const c = /^[a-z0-9-]{3,80}$/.test(id) ? await carouselById(id, locale) : null;
  if (!c) return {};
  return pageMeta(locale, `/carousels/${id}`, `${c.cover.title} | ${c.seriesLabel} | Quran Masterclass`, c.cover.sub ?? webText(locale).galleryLead);
}

export default async function CarouselPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^[a-z0-9-]{3,80}$/.test(id)) notFound();
  const c = await carouselById(id, locale);
  if (!c) notFound();
  // scripture from the sources; if a source is unreachable the slide shows its reference only (never invented text)
  const resolved = (await resolveCarousel(c, locale).catch(() => null)) ?? { ...c, texts: {} };
  const tx = carouselText(locale);
  const wt = webText(locale);
  const more = (await carouselList({ locale, series: seriesKey(c.series), limit: 60 })).items.filter((x) => x.id !== c.id);
  const at = Math.max(0, more.findIndex((x) => x.id > c.id));
  const related = [...more.slice(at), ...more.slice(0, at)].slice(0, 8);
  return (
    <main className="px-4 py-8 sm:px-5 sm:py-12">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CreativeWork", name: c.cover.title, description: c.cover.sub, inLanguage: c.lang, url: abs(`/${locale}/carousels/${c.id}`),
        isPartOf: { "@type": "CreativeWorkSeries", name: c.seriesLabel }, publisher: { "@type": "Organization", name: "Quran Masterclass", url: abs("") },
        citation: c.sources.map((s) => s.label) }} />
      <div className="mx-auto max-w-xl">
        <nav className="text-[13px] text-muted"><Link href="/carousels" className="hover:underline">{wt.galleryTitle}</Link> <span aria-hidden>›</span> <Link href={`/carousels?series=${seriesKey(c.series)}`} className="hover:underline">{c.seriesLabel}</Link></nav>
        <p className="eyebrow mt-4">{c.cover.kicker}</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">{c.cover.title}</h1>
        {c.cover.sub ? <p className="mt-3 text-muted">{c.cover.sub}</p> : null}
        <div className="mt-6"><CarouselViewer c={resolved} /></div>
        <div className="mt-4"><AskTutor context={{ kind: "carousel", id: c.id, title: c.cover.title }} /></div>
        <TextVersion c={resolved} />
        <div className="mt-8 text-center"><Link href="/app" className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110">{wt.openApp}</Link></div>
      </div>
      {related.length ? (
        <section className="mx-auto mt-14 max-w-6xl" aria-labelledby="more-carousels">
          <h2 id="more-carousels" className="font-display text-2xl">{wt.inSeries}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {related.map((x) => <li key={x.id}><CoverTile c={x} /><p className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-snug">{x.cover.title}</p></li>)}
          </ul>
          <div className="mt-6 text-sm"><Link href="/carousels" className="font-semibold text-accent hover:underline">{tx.carousels} ›</Link></div>
        </section>
      ) : null}
    </main>
  );
}
