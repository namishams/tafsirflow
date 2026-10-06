import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AccountLink from "@/components/AccountLink";
import KidsToggle from "@/components/KidsToggle";
import Logo from "@/components/Logo";
import JsonLd from "@/components/JsonLd";
import { LOCALE_META } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { abs, pageMeta } from "@/lib/site";

const FEATURES = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;
const FAQ = [1, 2, 3, 4, 5] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMeta(locale, "", t("homeTitle"), t("homeDesc"), t("keywords"));
}

export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": abs("/#org"), name: "TafsirFlow", url: abs("/"), logo: abs("/icon.svg") },
      { "@type": "WebSite", "@id": abs("/#site"), url: abs(`/${locale}`), name: "TafsirFlow", inLanguage: routing.locales, publisher: { "@id": abs("/#org") } },
      {
        "@type": "SoftwareApplication", name: "TafsirFlow", applicationCategory: "EducationalApplication", operatingSystem: "Web",
        description: t("seo.homeDesc"), inLanguage: locale, offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      },
      {
        "@type": "FAQPage", inLanguage: locale,
        mainEntity: FAQ.map((i) => ({ "@type": "Question", name: t(`landing.q${i}`), acceptedAnswer: { "@type": "Answer", text: t(`landing.a${i}`) } })),
      },
    ],
  };
  return (
    <div>
      <JsonLd data={ld} />
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Logo size={30} />
            <span className="truncate text-[15px] font-semibold tracking-tight">{t("app.name")}</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2"><KidsToggle /><LanguageSwitcher /><AccountLink /></div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-14 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">{t("app.name")}</p>
            <h1 className="font-display mt-4 text-[44px] leading-[1.02] sm:text-7xl">{t("app.tagline")}</h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">{t("seo.homeDesc")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/quran" className="inline-flex h-12 items-center rounded-lg bg-accent px-6 text-[15px] font-semibold text-white transition hover:brightness-110">{t("landing.cta")}</Link>
              <Link href="/account" className="inline-flex h-12 items-center rounded-lg border border-line px-6 text-[15px] font-semibold transition hover:border-ink">{t("landing.cta2")}</Link>
            </div>
          </div>
          <aside aria-hidden className="rounded-2xl border border-line bg-surface p-7">
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

        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("landing.whyTitle")}</h2>
            <div className="space-y-5 text-[17px] leading-relaxed text-muted">
              <p>{t("landing.whyP1")}</p>
              <p>{t("landing.whyP2")}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <p className="eyebrow">{t("landing.featuresTitle")}</p>
          <ul className="mt-8 grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((k, i) => (
              <li key={k} className="border-b border-line py-8 sm:pe-8 lg:[&:nth-child(3n+2)]:px-8 lg:[&:nth-child(3n)]:ps-8">
                <span className="font-display text-3xl text-accent">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{t(`landing.${k}t`)}</h3>
                <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-muted">{t(`landing.${k}d`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <p className="eyebrow">{t("landing.howTitle")}</p>
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

        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("landing.faqTitle")}</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map((i) => (
              <details key={i} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[17px] font-medium">
                  {t(`landing.q${i}`)}
                  <span aria-hidden className="mt-1 text-muted transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{t(`landing.a${i}`)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <p className="eyebrow">{t("landing.langsTitle")}</p>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {Object.entries(LOCALE_META).map(([k, v]) => (
                <li key={k}><Link href="/" locale={k} className="font-display text-3xl text-ink transition hover:text-accent sm:text-4xl">{v.label}</Link></li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>{t("landing.footer")}</p>
          <p>© {new Date().getFullYear()} TafsirFlow</p>
        </div>
      </footer>
    </div>
  );
}
