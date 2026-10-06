import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import Markdown, { mdHeadings } from "@/components/Markdown";
import { MoreTiles } from "@/components/PosterTiles";
import DonateCTA from "@/components/DonateCTA";
import { ISLAM, islamDoc, islamUi, loadChapter, loadChapters, readingMinutes } from "@/lib/islam";
import { abs, pageMeta } from "@/lib/site";
import { ArrowBack } from "@/components/Icons";
import { CalligraphyDraw, Rosette } from "@/components/Ornaments";
import { IslamArcadeLine, IslamBreak, IslamDome, IslamNum, IslamRain, IslamStarMark, saw } from "@/components/art/IslamArt";
import IslamReader, { IslamToc } from "@/components/art/IslamReader";

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
  const toc = mdHeadings(c.body);
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
  const gold = "text-[rgb(233_207_153)]";
  // the doorway at the end leads to the next chapter (or back to the overview after the last one)
  const door = next
    ? { href: `/islam/${next.slug}`, label: u.next, ar: next.arabic, title: all[i + 1].title, lead: all[i + 1].lead, meta: `${u.chapter} ${i + 2} · ${readingMinutes(all[i + 1].body)} ${u.min}` }
    : { href: "/islam", label: u.back, ar: "الإسلام", title: u.title, lead: u.lead, meta: `${ISLAM.length} · ${u.chapters}` };

  return (
    <div>
      <JsonLd data={ld} />
      <IslamReader sections={toc} title={c.title} />

      <section className="stage girih isl-arcade relative z-[1] overflow-hidden text-[#eef0f3]">
        <IslamDome id="dome-ch" className="-end-40 -top-44 w-[560px] sm:-end-24 sm:-top-40 sm:w-[760px]" />
        <IslamRain fall={520} className="opacity-70" />
        <CalligraphyDraw text={d.arabic} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-10 sm:pb-28 sm:pt-16">
          <Link href="/islam" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[13px] font-semibold text-white/70 transition hover:border-[rgb(233_207_153)]/60 hover:text-white"><ArrowBack /> {u.back}</Link>
          <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">
            <span className="inline-flex items-center gap-2"><IslamNum n={i + 1} className={`!h-8 !w-8 !text-[11px] ${gold}`} />{u.chapter} {i + 1}</span>
            <span aria-hidden className="h-px w-6 bg-[rgb(233_207_153)]/50" />
            <span>{c.kicker}</span>
          </p>
          <h1 className="font-display mt-4 max-w-4xl text-[40px] leading-[1.05] sm:text-6xl">{saw(c.title)}</h1>
          <p className="mt-5 max-w-2xl text-[18px] leading-relaxed text-white/75">{saw(c.lead)}</p>
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/60">
            <svg viewBox="0 0 24 24" className={`h-4 w-4 ${gold}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden><path d="M7 3h10M7 21h10M8 3c0 5 8 6 8 9s-8 4-8 9M16 3c0 5-8 6-8 9" /></svg>
            {readingMinutes(c.body)} {u.min}
          </p>
          <dl className="mt-10 grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
            {c.facts.map((f) => <div key={f.l} className="isl-fact"><dt className={`font-display text-[22px] leading-tight sm:text-3xl ${gold}`}>{f.n}</dt><dd className="mt-1.5 text-[12.5px] leading-snug text-white/65 sm:text-sm">{f.l}</dd></div>)}
          </dl>
        </div>
        <IslamArcadeLine />
      </section>

      <div className="isl-marble isl-under">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-12 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article id="chapter" className="min-w-0 max-w-[44rem]">
            <Markdown text={c.body} variant="article" />

            <IslamBreak />
            <section>
              <h2 className="font-display text-3xl">{u.faq}</h2>
              <div className="mt-6 grid gap-3">
                {c.faq.map((f) => (
                  <details key={f.q} className="isl-faq isl-card group p-0">
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

            {/* colophon: the sources, set like the last page of a manuscript */}
            <section className="relative mt-14 rounded-2xl border border-[rgb(var(--isl-gold-soft))]/30 px-5 pb-6 pt-8 text-center sm:px-8">
              <Rosette size={30} className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[rgb(var(--isl-paper))]" />
              <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--isl-gold))] rtl:tracking-normal">{u.sources}</h2>
              <ul className="mx-auto mt-4 grid max-w-xl gap-1.5 text-[14px] leading-relaxed text-ink/75">{c.sources.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="mx-auto mt-5 max-w-xl border-t border-[rgb(var(--isl-gold-soft))]/20 pt-4 text-[13px] leading-relaxed text-muted">{u.note}</p>
            </section>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 grid max-h-[calc(100vh-7rem)] gap-8 overflow-y-auto pb-6 pe-1">
              {toc.length > 1 && <IslamToc sections={toc} label={c.kicker} />}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted rtl:tracking-normal">{u.chapters}</p>
                <ol className="mt-3 flex flex-col gap-1 text-[13px]">
                  {ISLAM.map((x, k) => (
                    <li key={x.slug}>
                      <Link href={`/islam/${x.slug}`} aria-current={x.slug === slug ? "page" : undefined} className={`flex gap-2 rounded-md px-1.5 py-1 -mx-1.5 transition ${x.slug === slug ? "bg-[rgb(var(--isl-gold-soft))]/15 font-bold text-ink" : "text-muted hover:text-ink"}`}>
                        <span className="w-5 shrink-0 text-end tabular-nums text-[rgb(var(--isl-gold))]">{k + 1}</span><span className="min-w-0">{saw(all[k].title)}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        </div>

        <div className="mx-auto max-w-6xl px-5 pb-12"><DonateCTA /></div>

        {/* the doorway to the next chapter */}
        <nav className="mx-auto max-w-3xl px-5 pb-16 sm:pb-24">
          {prev && (
            <Link href={`/islam/${prev.slug}`} className="mb-5 flex items-center justify-center gap-2 text-center text-sm text-muted transition hover:text-ink">
              <ArrowBack /><span>{u.prev}: <b className="font-semibold text-ink/80">{saw(all[i - 1].title)}</b></span>
            </Link>
          )}
          <Link href={door.href} className="isl-door stage girih group text-center text-[#eef0f3]">
            <span aria-hidden className="isl-door-inner" />
            <IslamDome id="dome-door" className="left-1/2 top-[-120px] w-[420px] -translate-x-1/2 opacity-70" />
            <div className="relative px-6 pb-10 pt-20 sm:px-12 sm:pb-12 sm:pt-28">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{door.label} <span className="isl-door-arrow">→</span></p>
              <p className={`font-callig mt-3 text-[46px] leading-[1.3] sm:text-[64px] ${gold}`} dir="rtl" aria-hidden>{door.ar}</p>
              <p className="font-display mt-2 text-[26px] leading-tight sm:text-4xl">{saw(door.title)}</p>
              <p className="mx-auto mt-3 line-clamp-3 max-w-xl text-[15px] leading-relaxed text-white/65">{saw(door.lead)}</p>
              <p className="mt-5 text-[12px] font-semibold text-white/50">{door.meta}</p>
            </div>
          </Link>
        </nav>
      </div>

      <MoreTiles keys={["assistant", "salah", "arabic", "shams"]} className="pt-16" />

      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <IslamRain fall={420} className="opacity-60" />
        <div className="relative mx-auto max-w-4xl px-5 py-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl">{u.ctaTitle}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/70">{u.ctaBody}</p>
          <Link href="/surah/1?shams=1" className="btn-gold mt-7 inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{u.cta}</Link>
        </div>
      </section>
    </div>
  );
}
