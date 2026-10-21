import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { CoverTile } from "@/components/carousel/CarouselParts";
import { carouselList, seriesList } from "@/lib/feed/carousels/store";
import { carouselText, webText } from "@/lib/feed/carousels/uiText";
import { abs, pageMeta } from "@/lib/site";

// /[locale]/carousels: the gallery of the feed's carousels (src/lib/feed/carousels), filterable by series, 24 per
// page. Each tile opens the carousel with its slides, downloads and the text version.
export const revalidate = 3600;
const PER_PAGE = 24;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const wt = webText(locale);
  return pageMeta(locale, "/carousels", wt.metaTitle, wt.metaDesc);
}

export default async function CarouselsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ series?: string; page?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const wt = webText(locale);
  const tx = carouselText(locale);
  const all = await seriesList(locale);
  const series = all.some((s) => s.id === sp.series) ? sp.series : undefined;
  const page = Math.max(1, Math.min(200, Number(sp.page) || 1));
  const { total, items } = await carouselList({ locale, series, offset: 0, limit: page * PER_PAGE });
  const href = (q: { series?: string; page?: number }) => {
    const s = new URLSearchParams();
    if (q.series) s.set("series", q.series);
    if (q.page && q.page > 1) s.set("page", String(q.page));
    const qs = s.toString();
    return `/carousels${qs ? `?${qs}` : ""}`;
  };
  const chip = "inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-[13.5px] font-semibold transition";
  return (
    <main className="px-4 py-10 sm:px-5 sm:py-14">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: wt.galleryTitle, description: wt.galleryLead, url: abs(`/${locale}/carousels`), inLanguage: locale,
        hasPart: items.slice(0, 24).map((c) => ({ "@type": "CreativeWork", name: c.cover.title, url: abs(`/${locale}/carousels/${c.id}`) })) }} />
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">{tx.carousel}</p>
        <h1 className="font-display mt-2 text-3xl sm:text-5xl">{wt.galleryTitle}</h1>
        <p className="mt-3 max-w-2xl text-muted">{wt.galleryLead}</p>
        <nav aria-label={wt.galleryTitle} className="mt-7 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
          <Link href={href({})} aria-current={!series ? "page" : undefined} className={`${chip} ${!series ? "border-transparent bg-ink text-bg" : "border-line hover:bg-accent-soft"}`}>{tx.all}</Link>
          {all.map((s) => (
            <Link key={s.id} href={href({ series: s.id })} aria-current={series === s.id ? "page" : undefined}
              className={`${chip} ${series === s.id ? "border-transparent bg-ink text-bg" : "border-line hover:bg-accent-soft"}`}>{s.label} <span className="ms-1.5 text-[12px] opacity-60 tabular-nums">{s.count}</span></Link>
          ))}
        </nav>
        {items.length ? (
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map((c) => <li key={c.id}><CoverTile c={c} /><p className="mt-2 line-clamp-2 text-[13.5px] font-semibold leading-snug">{c.cover.title}</p><p className="text-[12px] text-muted">{c.seriesLabel}</p></li>)}
          </ul>
        ) : <p className="mt-8 text-muted">{tx.offline}</p>}
        {items.length < total ? (
          <div className="mt-10 text-center">
            <Link href={href({ series, page: page + 1 })} scroll={false} className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110">{wt.showMore}</Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
