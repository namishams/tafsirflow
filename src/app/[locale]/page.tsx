import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AccountLink from "@/components/AccountLink";
import KidsToggle from "@/components/KidsToggle";
import Logo from "@/components/Logo";
import JsonLd from "@/components/JsonLd";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import { LOCALE_META } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { abs, pageMeta } from "@/lib/site";

export const revalidate = 3600; // the verse of the day changes daily; the page refreshes hourly

const FEATURES = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"] as const;
const FAQ = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const GLOSSARY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const POPULAR: { n: number; href: string }[] = [
  { n: 1, href: "/surah/1" }, { n: 2, href: "/surah/2?v=255" }, { n: 3, href: "/surah/36" }, { n: 4, href: "/surah/55" },
  { n: 5, href: "/surah/18" }, { n: 6, href: "/surah/67" }, { n: 7, href: "/surah/112" }, { n: 8, href: "/surah/78" },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMeta(locale, "", t("homeTitle"), t("homeDesc", { n: routing.locales.length }), t("keywords"));
}

export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const n = routing.locales.length;
  const btnP = "inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110";
  const btnS = "inline-flex h-12 items-center rounded-md border border-ink px-6 text-[15px] font-bold transition hover:bg-ink hover:text-bg";
  const faqText = (i: number, kind: "q" | "a") => (i <= 5 ? t(`landing.${kind}${i}`) : t(`home2.${kind}${i}`));
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": abs("/#org"), name: "Quran Masterclass", url: abs("/"), logo: abs("/icon.svg") },
      { "@type": "WebSite", "@id": abs("/#site"), url: abs(`/${locale}`), name: "Quran Masterclass", inLanguage: routing.locales, publisher: { "@id": abs("/#org") } },
      { "@type": "SoftwareApplication", name: "Quran Masterclass", applicationCategory: "EducationalApplication", operatingSystem: "Web", description: t("seo.homeDesc", { n }), inLanguage: locale, offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" } },
      { "@type": "FAQPage", inLanguage: locale, mainEntity: FAQ.map((i) => ({ "@type": "Question", name: faqText(i, "q"), acceptedAnswer: { "@type": "Answer", text: faqText(i, "a") } })) },
      { "@type": "DefinedTermSet", name: t("home2.glossTitle"), inLanguage: locale, hasDefinedTerm: GLOSSARY.map((i) => ({ "@type": "DefinedTerm", name: t(`home2.gT${i}`), description: t(`home2.gD${i}`) })) },
    ],
  };

  return (
    <div>
      <JsonLd data={ld} />
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo size={30} />
            <span className="truncate text-[15px] font-extrabold tracking-tight">{t("app.name")}</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2"><KidsToggle /><LanguageSwitcher /><AccountLink /></div>
        </div>
      </header>

      <main>
        {/* 1 Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">{t("app.name")}</p>
            <h1 className="font-display mt-4 text-[40px] leading-[1.05] sm:text-7xl">{t("app.tagline")}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t("seo.homeDesc", { n })}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/quran" className={btnP}>{t("landing.cta")}</Link>
              <Link href="/account" className={btnS}>{t("landing.cta2")}</Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
              {["factSurahs", "factVerses", "factLanguages", "factFree"].map((k) => <li key={k} className="flex items-center gap-2"><span className="h-px w-4 bg-accent" />{t(`home2.${k}`, { n })}</li>)}
            </ul>
          </div>
          <aside aria-hidden className="rounded-lg border border-line bg-surface p-7">
            <p className="eyebrow">1:1</p>
            <p className="font-arabic mt-5 text-4xl leading-[1.9] sm:text-5xl" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
            <p className="mt-3 text-[15px] italic text-gold" lang="en">Bismi llāhi r-raḥmāni r-raḥīm</p>
            <div className="mt-7 flex items-center gap-3 border-t border-line pt-5">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-white"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></svg></span>
              <span className="h-1 flex-1 rounded-full bg-line"><span className="block h-1 w-1/3 rounded-full bg-accent" /></span>
              <span className="text-xs tabular-nums text-muted">0:04</span>
            </div>
          </aside>
        </section>

        {/* 2 Verse of the day */}
        <VerseOfTheDay locale={locale} />

        {/* 3 Why */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("landing.whyTitle")}</h2>
          <div className="space-y-5 text-[17px] leading-relaxed text-muted">
            <p>{t("landing.whyP1")}</p>
            <p>{t("landing.whyP2")}</p>
          </div>
        </section>

        {/* 4 Three paths */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display max-w-2xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.pathsTitle")}</h2>
            <p className="mt-4 max-w-2xl text-[17px] text-muted">{t("home2.pathsIntro")}</p>
            <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
              {[["pHifz", "/surah/78?m=2"], ["pFahm", "/surah/1"], ["pTilawa", "/surah/112"]].map(([k, href]) => (
                <article key={k} className="flex flex-col bg-bg p-6 sm:p-8">
                  <h3 className="font-display text-3xl">{t(`home2.${k}T`)}</h3>
                  <p className="mt-3 flex-1 text-[15px] leading-relaxed text-muted">{t(`home2.${k}D`)}</p>
                  <Link href={href} className="mt-6 inline-flex h-11 w-fit items-center rounded-md border border-ink px-5 text-sm font-bold hover:bg-ink hover:text-bg">{t(`home2.${k}Cta`)}</Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5 Method */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="eyebrow">{t("landing.howTitle")}</p>
          <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.methodTitle")}</h2>
          <p className="mt-4 max-w-2xl text-[17px] text-muted">{t("home2.methodIntro")}</p>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3">
            {[["mNew", "01"], ["mRecent", "02"], ["mOld", "03"]].map(([k, num]) => (
              <li key={k} className="border-t border-ink pt-5">
                <span className="eyebrow text-accent">{num}</span>
                <h3 className="font-display mt-2 text-3xl">{t(`home2.${k}T`)}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(`home2.${k}D`)}</p>
              </li>
            ))}
          </ol>
          <p className="mt-10 max-w-3xl border-s-4 border-accent ps-5 text-[17px] leading-relaxed">{t("home2.methodOutro")}</p>
        </section>

        {/* 6 How it works */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("landing.howTitle")}</h2>
            <ol className="mt-10 grid gap-10 sm:grid-cols-3">
              {["s1", "s2", "s3"].map((k, i) => (
                <li key={k} className="border-t border-ink pt-5">
                  <span className="eyebrow text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-2 text-3xl">{t(`landing.${k}t`)}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{t(`landing.${k}d`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 7 Features */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-2xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.featTitle")}</h2>
          <ul className="mt-10 grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((k, i) => (
              <li key={k} className="border-b border-line py-8 sm:pe-8 lg:[&:nth-child(3n+2)]:px-8 lg:[&:nth-child(3n)]:ps-8">
                <span className="font-display text-3xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-bold tracking-tight">{t(`${i < 6 ? "landing" : "home2"}.${k}t`, { n })}</h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{t(`${i < 6 ? "landing" : "home2"}.${k}d`)}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 8 Map teaser */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-2">
            <div>
              <p className="eyebrow text-accent">{t("home2.mapSoon")}</p>
              <h2 className="font-display mt-3 text-4xl leading-[1.1] sm:text-5xl">{t("home2.mapTitle")}</h2>
              <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-muted">{t("home2.mapBody")}</p>
            </div>
            <div aria-hidden className="grid grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
              {Array.from({ length: 120 }, (_, i) => {
                const lvl = i < 30 ? 3 : i < 52 ? 2 : i < 70 ? 1 : 0;
                return <span key={i} className={`aspect-square rounded-[2px] ${["bg-line", "bg-accent/30", "bg-accent/60", "bg-accent"][lvl]}`} />;
              })}
            </div>
          </div>
        </section>

        {/* 9 Popular */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.popTitle")}</h2>
          <p className="mt-4 max-w-2xl text-[17px] text-muted">{t("home2.popIntro")}</p>
          <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {POPULAR.map(({ n: i, href }) => (
              <li key={i} className="bg-surface">
                <Link href={href} className="block h-full p-5 transition hover:bg-bg">
                  <span className="text-[17px] font-bold">{t(`home2.pop${i}`)}</span>
                  <span className="mt-1 block text-[15px] leading-relaxed text-muted">{t(`home2.pop${i}d`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 10 Kids + Tajweed */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-4xl leading-[1.1]">{t("home2.kidsTitle")}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("home2.kidsBody")}</p>
              <Link href="/surah/112" className={`${btnS} mt-6`}>{t("home2.kidsCta")}</Link>
            </div>
            <div>
              <h2 className="font-display text-4xl leading-[1.1]">{t("home2.tajTitle")}</h2>
              <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("home2.tajBody")}</p>
            </div>
          </div>
        </section>

        {/* 11 Languages */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.langsTitle2")}</h2>
          <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-muted">{t("home2.langsBody", { n })}</p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
            {Object.entries(LOCALE_META).map(([k, v]) => (
              <li key={k}><Link href="/" locale={k} hrefLang={k} className="font-display text-3xl text-ink transition hover:text-accent sm:text-4xl">{v.label}</Link></li>
            ))}
          </ul>
        </section>

        {/* 12 Glossary */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("home2.glossTitle")}</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-6 sm:grid-cols-2">
              {GLOSSARY.map((i) => (
                <div key={i} className="border-t border-line pt-4">
                  <dt className="text-[17px] font-bold">{t(`home2.gT${i}`)}</dt>
                  <dd className="mt-1 text-[15px] leading-relaxed text-muted">{t(`home2.gD${i}`)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 13 FAQ */}
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("landing.faqTitle")}</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((i) => (
              <details key={i} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[17px] font-semibold">
                  {faqText(i, "q")}
                  <span aria-hidden className="mt-1 text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{faqText(i, "a")}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 14 Final CTA */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:py-24">
            <h2 className="font-display mx-auto max-w-3xl text-4xl leading-[1.1] sm:text-6xl">{t("home2.finalTitle")}</h2>
            <p className="mx-auto mt-4 max-w-xl text-[17px] text-muted">{t("home2.finalBody")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/quran" className={btnP}>{t("landing.cta")}</Link>
              <Link href="/account" className={btnS}>{t("landing.cta2")}</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-bg">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2.5"><Logo size={28} /><span className="text-[15px] font-extrabold tracking-tight">{t("app.name")}</span></Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{t("app.tagline")}</p>
          </div>
          <nav aria-label={t("home2.fPopular")}>
            <p className="eyebrow">{t("home2.fPopular")}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              {POPULAR.slice(0, 6).map(({ n: i, href }) => <li key={i}><Link href={href} className="text-muted hover:text-ink">{t(`home2.pop${i}`)}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label={t("home2.fLanguages")}>
            <p className="eyebrow">{t("home2.fLanguages")}</p>
            <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(LOCALE_META).map(([k, v]) => <li key={k}><Link href="/" locale={k} hrefLang={k} className="text-muted hover:text-ink">{v.label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label={t("home2.fLegal")}>
            <p className="eyebrow">{t("home2.fLegal")}</p>
            <ul className="mt-3 grid gap-2 text-sm">
              <li><Link href="/support" className="text-muted hover:text-ink">{t("support.nav")}</Link></li>
              <li><Link href="/legal/privacy" className="text-muted hover:text-ink">{t("home2.privacy")}</Link></li>
              <li><Link href="/legal/terms" className="text-muted hover:text-ink">{t("home2.terms")}</Link></li>
              <li><Link href="/legal/imprint" className="text-muted hover:text-ink">{t("home2.imprint")}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-line py-5">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-xs text-muted sm:flex-row sm:justify-between">
            <p>{t("landing.footer")}</p>
            <p>© {new Date().getFullYear()} {t("app.name")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
