import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { Poster, TONES } from "@/components/PosterTiles";
import { ISLAM, islamUi, loadChapters, readingMinutes } from "@/lib/islam";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const u = await islamUi(locale);
  return pageMeta(locale, "/islam", `${u.kicker} | Quran Masterclass`, u.lead.slice(0, 158));
}

export default async function IslamHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const u = await islamUi(locale);
  const chs = await loadChapters(locale);
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: u.title, description: u.lead, url: abs(`/${locale}/islam`), inLanguage: locale,
    hasPart: ISLAM.map((d) => ({ "@type": "Article", headline: chs[ISLAM.indexOf(d)].title, url: abs(`/${locale}/islam/${d.slug}`) })) };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <p aria-hidden className="font-callig pointer-events-none absolute -end-6 -top-6 select-none text-[180px] leading-none text-[rgb(var(--gold))] opacity-[0.07] sm:text-[280px]">الإسلام</p>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{u.kicker}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[42px] leading-[1.04] sm:text-7xl">{u.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{u.lead}</p>
          <Link href={`/islam/${ISLAM[0].slug}`} className="btn-gold mt-8 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{u.start}</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="font-display text-4xl leading-tight">{u.chapters}</h2>
        <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {ISLAM.map((d, i) => {
            const c = chs[i];
            return (
              <li key={d.slug} className="min-w-0">
                <Poster it={{ href: `/islam/${d.slug}`, title: c.title, desc: c.lead, badge: `${String(i + 1).padStart(2, "0")} · ${c.kicker}`, ar: d.arabic, bg: TONES[i % TONES.length], cta: `${u.read} · ${readingMinutes(c.body)} ${u.min}` }} />
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-24">
        <div className="rounded-lg border border-line border-s-4 border-s-gold bg-surface p-6 sm:p-8">
          <h2 className="font-display text-3xl">{u.uaeTitle}</h2>
          <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-ink/90">{u.uae}</p>
          <p className="mt-4 text-sm text-muted">{u.note}</p>
        </div>
      </section>
    </div>
  );
}
