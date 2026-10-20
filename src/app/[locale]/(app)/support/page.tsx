import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import SupportZiina from "@/components/SupportZiina";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";
import { Lantern } from "@/components/DonateCTA";
import { PracticeStar, PracticeStarNum } from "@/components/art/PracticeArt";
import { COMPANY } from "@/lib/company";

// Voluntary support (sadaqa jariya). The website stays free; supporting unlocks nothing. Texts: messages/*.json → "support".
const HADITH_AR = "إذا مات الإنسان انقطع عنه عمله إلا من ثلاثة: إلا من صدقة جارية، أو علم يُنتفع به، أو ولد صالح يدعو له";
const FOR = [1, 2, 3, 4] as const;
const PROMISES = [1, 2, 3, 4] as const;
const FAQ = [1, 2, 3, 4, 5, 6] as const;
const WAYS: { n: number; href: string }[] = [{ n: 1, href: "" }, { n: 2, href: "/how" }, { n: 3, href: "/feedback" }, { n: 4, href: `mailto:${COMPANY.email}` }];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  return pageMeta(locale, "/support", `${t("title")} | Quran Masterclass`, t("seoDesc"));
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", url: abs(`/${locale}/support`), inLanguage: locale, mainEntity: FAQ.map((i) => ({ "@type": "Question", name: t(`q${i}`), acceptedAnswer: { "@type": "Answer", text: t(`a${i}`) } })) };
  return (
    <div>
      <JsonLd data={ld} />

      {/* hero: a lantern hangs in the arch of light; below it the sadaqa card */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 50% 18%, rgb(240 200 106 / .18) 0, transparent 42%)" }} />
        <div className="relative mx-auto max-w-3xl px-5 pb-36 text-center sm:pb-40">
          <div className="mx-auto flex w-max flex-col items-center">
            <span aria-hidden className="h-10 w-px bg-gradient-to-b from-transparent to-[rgb(214_180_108)] sm:h-14" />
            <span className="rise -mt-1"><Lantern pct={null} size={92} /></span>
          </div>
          <p className="rise mt-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("kicker")}</p>
          <h1 className="rise font-display mx-auto mt-3 max-w-2xl text-[34px] leading-[1.08] sm:text-5xl" style={{ animationDelay: "100ms" }}>{t("title")}</h1>
          <p className="rise mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75" style={{ animationDelay: "200ms" }}>{t("lead")}</p>
          <p className="rise mx-auto mt-5 inline-flex max-w-xl items-center gap-2 rounded-full border border-[rgb(214_180_108)]/35 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-[rgb(233_207_153)]" style={{ animationDelay: "280ms" }}><PracticeStar size={10} />{t("free")}</p>
        </div>
        <div className="pa-arcade" />
      </section>

      <div className="relative z-[1] mx-auto -mt-28 max-w-2xl px-4 sm:-mt-32 sm:px-5"><Suspense><SupportZiina /></Suspense></div>

      <main className="mx-auto max-w-5xl px-5 pb-16">
        {/* the hadith of the deed that keeps on giving */}
        <figure className="pa-paper mx-auto mt-14 max-w-3xl px-6 pb-8 pt-10 text-center sm:px-10">
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"><PracticeStarNum n="" size={34} filled /></span>
          <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-gold rtl:tracking-normal">{t("hadithTitle")}</p>
          {locale !== "ar" && <p className="font-arabic relative mx-auto mt-5 max-w-2xl text-[24px] leading-[2] sm:text-[27px]" dir="rtl" lang="ar">{HADITH_AR}</p>}
          <blockquote className={`relative mx-auto mt-4 max-w-2xl leading-relaxed ${locale === "ar" ? "font-arabic text-[24px] leading-[2]" : "text-[18px] text-ink/85 sm:text-[19px]"}`}>{t("hadith")}</blockquote>
          <figcaption className="relative mt-4 text-sm font-semibold text-gold">{t("hadithSrc")}</figcaption>
        </figure>

        <section className="mt-16">
          <h2 className="font-display text-3xl sm:text-4xl">{t("forTitle")}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {FOR.map((i) => (
              <li key={i} className="pa-card flex gap-4 p-5 pt-6">
                <PracticeStarNum n={i} size={44} />
                <span className="min-w-0"><span className="block text-[17px] font-bold">{t(`for${i}t`)}</span><span className="mt-1 block text-[15px] leading-relaxed text-muted">{t(`for${i}d`)}</span></span>
              </li>
            ))}
          </ul>
        </section>

        <section className="callout mt-12 rounded-xl p-6 sm:p-8">
          <h2 className="font-display text-2xl">{t("promiseTitle")}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">{PROMISES.map((i) => <li key={i} className="flex gap-3 text-[15px] leading-relaxed"><PracticeStar size={12} className="mt-1.5" />{t(`p${i}`)}</li>)}</ul>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-3xl sm:text-4xl">{t("waysTitle")}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WAYS.map(({ n, href }) => (
              <li key={n} className="pa-card pa-card-hover flex flex-col p-5 pt-6">
                <h3 className="text-[17px] font-bold">{t(`w${n}t`)}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{t(`w${n}d`)}</p>
                {href && (href.startsWith("mailto:") ? <a href={href} className="mt-4 text-sm font-bold text-accent hover:underline">{t(`w${n}cta`)} <ArrowNext /></a> : <Link href={href} className="mt-4 text-sm font-bold text-accent hover:underline">{t(`w${n}cta`)} <ArrowNext /></Link>)}
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-16 max-w-3xl">
          <h2 className="font-display text-3xl sm:text-4xl">{t("faqTitle")}</h2>
          <div className="mt-6 grid gap-3">
            {FAQ.map((i) => (
              <details key={i} className="pa-card pa-plain group px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-bold">{t(`q${i}`)}<span aria-hidden className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[rgb(var(--gold))]/50 text-gold transition group-open:rotate-45">+</span></summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{t(`a${i}`)}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-12 flex flex-col items-center gap-3 text-sm text-muted">
          <p>{t("contact")}</p>
          <Link href="/" className="font-semibold text-accent"><ArrowBack /> {t("back")}</Link>
        </div>
      </main>
    </div>
  );
}
