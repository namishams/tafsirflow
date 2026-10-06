import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { ISLAM, chapterOf, islamUi, readingMinutes } from "@/lib/islam";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const u = islamUi(locale);
  return pageMeta(locale, "/islam", `${u.kicker} | Quran Masterclass`, u.lead.slice(0, 158));
}

export default async function IslamHub({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const u = islamUi(locale);
  const ld = { "@context": "https://schema.org", "@type": "CollectionPage", name: u.title, description: u.lead, url: abs(`/${locale}/islam`), inLanguage: locale,
    hasPart: ISLAM.map((d) => ({ "@type": "Article", headline: chapterOf(d, locale).title, url: abs(`/${locale}/islam/${d.slug}`) })) };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage relative overflow-hidden text-[#eef0f3]">
        <p aria-hidden className="font-arabic pointer-events-none absolute -end-6 -top-6 select-none text-[180px] leading-none text-[rgb(var(--gold))] opacity-[0.07] sm:text-[280px]">الإسلام</p>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{u.kicker}</p>
          <h1 className="font-display mt-4 max-w-4xl text-[42px] leading-[1.04] sm:text-7xl">{u.title}</h1>
          <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">{u.lead}</p>
          <Link href={`/islam/${ISLAM[0].slug}`} className="btn-gold mt-8 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{u.start}</Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <h2 className="font-display text-4xl leading-tight">{u.chapters}</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ISLAM.map((d, i) => {
            const c = chapterOf(d, locale);
            return (
              <li key={d.slug}>
                <Link href={`/islam/${d.slug}`} className="group flex h-full flex-col rounded-lg border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-[rgb(var(--gold))]">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-3xl text-[rgb(var(--gold))]">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-arabic text-2xl leading-none text-accent" dir="rtl">{d.arabic}</span>
                  </div>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{c.kicker}</p>
                  <h3 className="mt-1 text-lg font-bold leading-snug">{c.title}</h3>
                  <p className="mt-2 line-clamp-4 flex-1 text-sm leading-relaxed text-muted">{c.lead}</p>
                  <p className="mt-4 text-sm font-semibold text-accent">{u.read} · {readingMinutes(c.body)} {u.min} →</p>
                </Link>
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
