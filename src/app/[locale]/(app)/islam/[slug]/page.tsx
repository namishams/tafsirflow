import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown from "@/components/Markdown";
import { MoreTiles } from "@/components/PosterTiles";
import { ISLAM, islamDoc, islamUi, loadChapter, loadChapters, readingMinutes } from "@/lib/islam";
import { abs, pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";

export function generateStaticParams() {
  return ISLAM.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const d = islamDoc(slug);
  if (!d) return {};
  const c = await loadChapter(d, locale);
  const m = pageMeta(locale, `/islam/${slug}`, `${c.title} | Quran Masterclass`, c.lead.slice(0, 158));
  return { ...m, openGraph: { ...m.openGraph, type: "article" } };
}

export default async function IslamChapterPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const d = islamDoc(slug);
  if (!d) notFound();
  const c = await loadChapter(d, locale);
  const u = await islamUi(locale);
  const all = await loadChapters(locale);
  const i = ISLAM.indexOf(d);
  const prev = ISLAM[i - 1], next = ISLAM[i + 1];
  const toc = c.body.split("\n").filter((l) => l.startsWith("## ")).map((l) => l.slice(3).replace(/\*\*/g, ""));
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Article", headline: c.title, description: c.lead, inLanguage: locale, author: { "@type": "Organization", name: "Quran Masterclass" }, publisher: { "@type": "Organization", name: "Quran Masterclass", logo: abs("/icon-512.png") }, mainEntityOfPage: abs(`/${locale}/islam/${slug}`) },
      { "@type": "FAQPage", inLanguage: locale, mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: u.back, item: abs(`/${locale}/islam`) },
        { "@type": "ListItem", position: 3, name: c.title, item: abs(`/${locale}/islam/${slug}`) },
      ] },
    ],
  };

  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <p aria-hidden className="font-callig pointer-events-none absolute -end-4 -top-4 select-none text-[140px] leading-none text-[rgb(var(--gold))] opacity-[0.08] sm:text-[220px]" dir="rtl">{d.arabic}</p>
        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:py-20">
          <Link href="/islam" className="text-sm font-semibold text-white/60 hover:text-white"><ArrowBack /> {u.back}</Link>
          <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{u.chapter} {i + 1} · {c.kicker}</p>
          <h1 className="font-display mt-3 max-w-4xl text-[40px] leading-[1.05] sm:text-6xl">{c.title}</h1>
          <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-white/70">{c.lead}</p>
          <p className="mt-4 text-sm text-white/50">{readingMinutes(c.body)} {u.min}</p>
          <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
            {c.facts.map((f) => <div key={f.l} className="border-s border-white/15 ps-4"><dt className="font-display text-2xl text-[rgb(var(--gold))] sm:text-3xl">{f.n}</dt><dd className="mt-1 text-sm leading-snug text-white/60">{f.l}</dd></div>)}
          </dl>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 lg:grid-cols-[1fr_260px] [&>*]:min-w-0">
        <article className="max-w-3xl [&>div>h2:first-child]:mt-0">
          <Markdown text={c.body} />

          <section className="mt-14">
            <h2 className="font-display text-3xl">{u.faq}</h2>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {c.faq.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-bold">{f.q}<span className="mt-1 text-muted transition group-open:rotate-45">+</span></summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-lg font-bold">{u.sources}</h2>
            <ul className="mt-3 grid gap-1 text-sm text-muted">{c.sources.map((s) => <li key={s}>· {s}</li>)}</ul>
            <p className="mt-4 text-sm text-muted">{u.note}</p>
          </section>

          <nav className="mt-12 grid gap-3 sm:grid-cols-2">
            {prev ? <Link href={`/islam/${prev.slug}`} className="rounded-lg border border-line bg-surface p-4 hover:border-ink"><span className="text-xs text-muted"><ArrowBack /> {u.prev}</span><span className="mt-1 block font-bold">{all[i - 1].title}</span></Link> : <span />}
            {next && <Link href={`/islam/${next.slug}`} className="rounded-lg border border-line bg-surface p-4 text-end hover:border-ink"><span className="text-xs text-muted">{u.next} <ArrowNext /></span><span className="mt-1 block font-bold">{all[i + 1].title}</span></Link>}
          </nav>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 grid gap-6">
            {toc.length > 1 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{c.kicker}</p>
                <ol className="mt-3 grid gap-2 text-sm">{toc.map((h) => <li key={h} className="text-ink/80">{h}</li>)}</ol>
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">{u.chapters}</p>
              <ol className="mt-3 grid gap-1.5 text-sm">
                {ISLAM.map((x, k) => <li key={x.slug}><Link href={`/islam/${x.slug}`} className={x.slug === slug ? "font-bold text-accent" : "text-muted hover:text-ink"}>{k + 1}. {all[k].title}</Link></li>)}
              </ol>
            </div>
          </div>
        </aside>
      </div>

      <MoreTiles keys={["salah", "arabic", "shams", "duas"]} />

      <section className="stage girih text-[#eef0f3]">
        <div className="mx-auto max-w-4xl px-5 py-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">{u.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">{u.ctaBody}</p>
          <Link href="/surah/1?shams=1" className="btn-gold mt-7 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{u.cta}</Link>
        </div>
      </section>
    </div>
  );
}
