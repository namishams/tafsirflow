import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { organizationLd } from "@/lib/company";
import { appStoreUrl } from "@/lib/appstore";
import { courseLd, mc, STAGES } from "@/lib/masterclass";
import { HomeCorners, HomeStar, HomeVerse, StarGlyph } from "@/components/art/HomeOrnaments";
import { Ink } from "@/components/Ornaments";
import { MasterclassPillars, McHead, PricingPlans, ReciterLadder, SchoolStages } from "@/components/masterclass/Sections";

// The curriculum of Quran Masterclass: four school stages (Ibtidāʾī → ʿĀlī), the Reciter Path to the Masterclass
// recital, the Arabic courses, tajweed, hifz, the garden and the Academy – with Free vs Pro at the end.
export const dynamic = "force-dynamic"; // APP_STORE_URL is read from the server environment at request time

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = mc(locale).page;
  return pageMeta(locale, "/masterclass", c.metaTitle, c.metaDesc);
}

export default async function MasterclassPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = mc(locale);
  const ar = locale === "ar";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      organizationLd(abs),
      ...courseLd(locale, abs),
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Quran Masterclass", item: abs(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: c.page.title, item: abs(`/${locale}/masterclass`) },
      ] },
    ],
  };
  const trio: [string, string, string, string][] = [[c.tajweedT, c.tajweedD, "/tajweed", "تجويد"], [c.hifzT, c.hifzD, "/plan", "حفظ"], [c.gardenT, c.gardenD, "/app", "حديقة"]];

  return (
    <div>
      <JsonLd data={ld} />
      {/* hero */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 85% 10%, rgb(var(--gold) / .16) 0, transparent 42%), radial-gradient(circle at 5% 95%, rgb(var(--accent) / .2) 0, transparent 45%)" }} />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pb-24 sm:pt-20">
          <p className="rise hm-k flex items-center gap-2 text-[rgb(var(--gold))]"><StarGlyph size={9} />{c.page.kicker}</p>
          <h1 className="rise font-display mt-5 max-w-3xl text-[44px] leading-[1.02] sm:text-7xl" style={{ animationDelay: "120ms" }}>
            {!ar && <span aria-hidden className="font-callig gold-sheen mb-2 block w-fit text-[34px] leading-snug sm:text-[44px]" dir="rtl"><Ink>المدرسة القرآنية</Ink></span>}
            {c.page.title}
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-white/70 sm:text-lg">{c.page.lead}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href={appStoreUrl()} rel="noopener" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{c.page.ctaApp}</a>
            <Link href="/shams" className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{c.page.ctaShams}</Link>
          </div>
          <ol className="hm-band mt-12 grid max-w-3xl grid-cols-2 sm:grid-cols-4">
            {STAGES.map(({ k, ar: word }, i) => (
              <li key={k} className={`px-3 py-4 sm:px-4 ${i % 2 ? "" : "!border-s-0 sm:!border-s"} ${i === 0 ? "sm:!border-s-0" : ""} ${i > 1 ? "border-t border-[rgb(var(--gold))]/15 sm:border-t-0" : ""}`}>
                <a href="#school" className="block transition hover:opacity-90">
                  <p className="flex items-center gap-2 text-xs text-white/55"><StarGlyph size={8} className="text-[rgb(var(--gold))]" />{c.stageWord} {i + 1}</p>
                  <p className="font-display mt-1 text-xl text-white">{c.stages[k].name}</p>
                  {!ar && <p aria-hidden className="font-arabic mt-0.5 text-[15px] text-[rgb(var(--gold))]/80" dir="rtl">{word}</p>}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <MasterclassPillars locale={locale} />
      <SchoolStages locale={locale} detailed />
      <ReciterLadder locale={locale} />

      {/* Arabic: reading course + language course A1–C1 */}
      <section id="arabic" className="relative scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <McHead locale={locale} title={c.arabicTitle} lead={c.arabicLead} word="العربية" />
          <div className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
            <Link href="/arabic" className="hm-card hm-lift group flex flex-col p-6 sm:p-7">
              <HomeCorners />
              <HomeStar size={48} tone="gold">20</HomeStar>
              <h3 className="mt-4 text-xl font-bold">{c.readingT}</h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{c.readingD}</p>
              <span className="hm-k mt-5 inline-flex items-center gap-1.5 text-accent">{c.open} <span aria-hidden className="inline-block transition group-hover:translate-x-1 rtl:-scale-x-100">→</span></span>
            </Link>
            <div className="hm-card p-6 sm:p-7">
              <HomeCorners />
              <h3 className="text-xl font-bold">{c.pillars.arabic.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{c.pillars.arabic.d}</p>
              <ol className="mc-cefr mt-6 grid border-y border-[rgb(var(--hm-gold))]/25 sm:grid-cols-5">
                {c.cefr.map(([lvl, d]) => (
                  <li key={lvl} className="px-3 py-4 sm:text-center">
                    <p className="font-display text-2xl text-[rgb(var(--hm-gold-d))]">{lvl}</p>
                    <p className="mt-1 text-[13px] leading-snug text-muted">{d}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* tajweed, hifz, garden */}
      <section className="hm-warm">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <ul className="grid gap-4 lg:grid-cols-3">
            {trio.map(([t, d, href, word]) => (
              <li key={t} className="min-w-0">
                <Link href={href} className="hm-card hm-lift group flex h-full flex-col overflow-hidden p-6">
                  <span aria-hidden className="font-callig pointer-events-none absolute -bottom-3 -end-1 text-[64px] leading-none text-[rgb(var(--hm-gold))]/[0.13]" dir="rtl">{word}</span>
                  <h3 className="relative text-xl font-bold">{t}</h3>
                  <p className="relative mt-2 flex-1 text-[15px] leading-relaxed text-muted">{d}</p>
                  <span className="hm-k relative mt-5 inline-flex items-center gap-1.5 text-accent">{c.open} <span aria-hidden className="inline-block transition group-hover:translate-x-1 rtl:-scale-x-100">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
          <HomeVerse text="وَرَتِّلِ ٱلۡقُرۡءَانَ تَرۡتِيلًا" cite="73:4" className="mt-12 text-center text-[24px] sm:text-[28px]" />
        </div>
      </section>

      {/* Academy */}
      <section id="academy" className="relative scroll-mt-20">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <McHead locale={locale} title={c.academyTitle} lead={c.academyLead} word="أكاديمية" />
          <ul className="mt-8 flex flex-wrap gap-2.5">
            {c.courses.map((x) => <li key={x} className="inline-flex items-center gap-2 rounded-full border border-[rgb(var(--hm-gold))]/35 bg-surface px-4 py-2 text-[14px] font-semibold"><StarGlyph size={9} className="text-[rgb(var(--hm-gold))]" />{x}</li>)}
          </ul>
          <Link href="/academy" className="mt-8 inline-flex h-11 items-center rounded-md border border-[rgb(var(--hm-gold))]/60 px-5 text-sm font-bold transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10">{c.academyTitle} <span aria-hidden className="ms-2 rtl:-scale-x-100">→</span></Link>
          <p className="callout mt-12 max-w-3xl rounded-lg p-5 text-[15px] leading-relaxed sm:p-6"><strong>{c.certT}.</strong> {c.certD}</p>
        </div>
      </section>

      <div className="hm-warm"><PricingPlans locale={locale} /></div>

      {/* outro */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
          <p className="font-arabic text-[26px] text-[rgb(var(--gold))]" dir="rtl" lang="ar"><Ink>وَقُل رَّبِّ زِدۡنِي عِلۡمًا</Ink></p>
          <h2 className="font-display mt-5 text-4xl leading-[1.1] sm:text-5xl">{c.page.outroT}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-white/70">{c.page.outroD}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/shams" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{c.page.ctaShams}</Link>
            <Link href="/app" className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{c.talents.ctaApp}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
