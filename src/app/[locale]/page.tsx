import type { Metadata } from "next";
import MadeInDubai from "@/components/MadeInDubai";
import TrustStrip, { TrustLine } from "@/components/TrustStrip";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteMenu from "@/components/SiteMenu";
import AccountLink from "@/components/AccountLink";
import Logo from "@/components/Logo";
import JsonLd from "@/components/JsonLd";
import WhyQuran from "@/components/WhyQuran";
import { getChapters } from "@/lib/quran";
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

const COURSES = [
  { href: "/shams", key: "shams", ar: "شمس", desc: "tool_shamsD", badge: "method", bg: "linear-gradient(160deg,#3a2f12 0%,#14110a 100%)" },
  { href: "/academy", key: "courses", ar: "أكاديمية", desc: "tool_academyD", badge: "course", bg: "linear-gradient(160deg,#0c4a37 0%,#06221a 100%)" },
  { href: "/arabic", key: "arabic", ar: "اقرأ", desc: "arabicD", badge: "course", bg: "linear-gradient(160deg,#1d3b2c 0%,#081a12 100%)" },
  { href: "/islam", key: "islam", ar: "إسلام", desc: "islamD", badge: "library", bg: "linear-gradient(160deg,#0f3b2e 0%,#05170f 100%)" },
  { href: "/tajweed", key: "tajweed", ar: "تجويد", desc: "tool_tajweedD", badge: "course", bg: "linear-gradient(160deg,#3b1f2b 0%,#160b10 100%)" },
  { href: "/plan", key: "plan", ar: "حفظ", desc: "planD", badge: "plan", bg: "linear-gradient(160deg,#1f2b44 0%,#0b101b 100%)" },
  { href: "/vocab", key: "vocab", ar: "كلمات", desc: "tool_vocabD", badge: "course", bg: "linear-gradient(160deg,#2c3a1a 0%,#10160a 100%)" },
  { href: "/radio", key: "radio", ar: "إذاعة", desc: "radioD", badge: "live", bg: "linear-gradient(160deg,#401c14 0%,#170a07 100%)" },
  { href: "/duas", key: "duas", ar: "دعاء", desc: "duasD", badge: "library", bg: "linear-gradient(160deg,#173640 0%,#081418 100%)" },
  { href: "/map", key: "map", ar: "خريطة", desc: "mapD", badge: "progress", bg: "linear-gradient(160deg,#30254a 0%,#100c19 100%)" },
];

export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const n = routing.locales.length;
  const chapters = await getChapters(locale).catch(() => []);
  const btnP = "inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110";
  const btnS = "inline-flex h-12 items-center rounded-md border border-ink px-6 text-[15px] font-bold transition hover:bg-ink hover:text-bg";
  const faqText = (i: number, kind: "q" | "a") => (i <= 5 ? t(`landing.${kind}${i}`) : t(`home2.${kind}${i}`));
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": abs("/#org"), name: "Quran Masterclass", url: abs("/"), logo: abs("/icon-512.png") },
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
          <div className="flex items-center gap-1.5 sm:gap-2"><LanguageSwitcher /><SiteMenu /><AccountLink /></div>
        </div>
      </header>

      <main>
        {/* 1 Hero – cinematic, with an animated verse player (words light up one after another) */}
        <section className="stage relative overflow-hidden text-[#eef0f3]">
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 85% 15%, rgb(var(--gold) / .16) 0, transparent 40%), radial-gradient(circle at 10% 90%, rgb(var(--accent) / .22) 0, transparent 45%)" }} />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("home2.heroKicker", { n })}</p>
              <h1 className="font-display mt-5 text-[44px] leading-[1.02] sm:text-7xl">{t("home2.heroTitle")}</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70 sm:text-lg">{t("home2.heroLead")}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/academy" className="inline-flex h-12 items-center rounded-md btn-gold px-6 text-[15px] font-bold">{t("home2.heroCta")}</Link>
                <Link href="/shams" className="inline-flex h-12 items-center rounded-md border border-white/30 px-6 text-[15px] font-bold hover:border-white">{t("home2.heroCta2")}</Link>
              </div>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--gold))]/40 px-3 py-1 text-xs font-semibold text-[rgb(var(--gold))]">✓ {t("free.badge")}</p>
              <TrustLine className="mt-3 flex text-white/70" />
              <ul className="mt-6 grid max-w-lg grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-4">
                {[["114", "home2.statSurahs"], ["6.236", "home2.statVerses"], [String(n), "home2.statLanguages"], ["0 €", "home2.statFree"]].map(([v, k]) => (
                  <li key={k} className="bg-stage px-4 py-3"><p className="font-display text-2xl">{v}</p><p className="text-xs text-white/55">{t(k)}</p></li>
                ))}
              </ul>
            </div>
            <figure aria-hidden className="rounded-xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl sm:p-8">
              <div className="flex items-center justify-between text-xs text-white/50"><span>{locale === "ar" ? "الفاتحة · ١" : "Al-Fatihah · 1"}</span><span>{locale === "ar" ? "مشاري العفاسي" : "Mishary Alafasy"}</span></div>
              <p className="hero-words font-arabic mt-6 flex flex-row-reverse flex-wrap justify-start gap-x-3 text-[2.6rem] leading-[1.9] sm:text-5xl">
                <span>بِسْمِ</span><span>ٱللَّهِ</span><span>ٱلرَّحْمَـٰنِ</span><span>ٱلرَّحِيمِ</span>
              </p>
              {locale !== "ar" && <p className="mt-2 text-[15px] italic text-[rgb(var(--gold))]">Bismi llāhi r-raḥmāni r-raḥīm</p>}
              <p className="mt-1 text-sm text-white/60">{t("home2.heroVerse")}</p>
              <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(var(--gold))] text-[rgb(var(--stage))]"><svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><rect width="4" height="14" rx="1" /><rect x="8" width="4" height="14" rx="1" /></svg></span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/15"><span className="hero-progress block h-1 rounded-full bg-[rgb(var(--gold))]" /></span>
                <span className="text-xs tabular-nums text-white/50">0:06</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-white/70">
                {["home2.chipWords", "home2.chipTafsir", "home2.chipHide", "home2.chipRepeat"].map((k) => <span key={k} className="rounded-full border border-white/15 px-2.5 py-1">{t(k)}</span>)}
              </div>
            </figure>
          </div>
        </section>

        {/* 1b Courses – poster cards like a class catalogue */}
        <section className="stage pb-16 text-[#eef0f3] sm:pb-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex items-end justify-between gap-4 border-t border-white/10 pt-10">
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">{t("home2.coursesTitle")}</h2>
              <Link href="/academy" className="hidden shrink-0 text-sm font-bold text-[rgb(var(--gold))] hover:underline sm:inline">{t("home2.coursesAll")} →</Link>
            </div>
            <ul className="-mx-5 mt-6 flex snap-x gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
              {COURSES.map((c) => (
                <li key={c.href} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
                  <Link href={c.href} className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-lg p-5" style={{ background: c.bg }}>
                    <span aria-hidden className="font-arabic pointer-events-none absolute -end-2 top-2 text-[7rem] leading-none text-white/[0.09] transition duration-500 group-hover:scale-110" dir="rtl">{c.ar}</span>
                    <span className="absolute start-5 top-5 rounded-sm bg-black/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">{t(`home2.badge_${c.badge}`)}</span>
                    <span className="font-display relative text-[26px] leading-tight text-white">{t(`nav.${c.key}`)}</span>
                    <span className="relative mt-2 line-clamp-3 text-sm leading-relaxed text-white/75">{t(`home2.${c.desc}`)}</span>
                    <span className="relative mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[rgb(var(--gold))]">{t("home2.open")} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2 Verse of the day */}
        <VerseOfTheDay locale={locale} />

        {/* 2a Why the Quran comes first */}
        <WhyQuran locale={locale} />

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
              <Link href="/map" className={`${btnP} mt-6`}>{t("home2.mapCta")}</Link>
            </div>
            <div aria-hidden className="grid grid-cols-[repeat(19,minmax(0,1fr))] gap-1">
              {Array.from({ length: 114 }, (_, i) => {
                // illustration: the short surahs at the end are learned first
                const lvl = i >= 100 ? 3 : i >= 92 ? (i % 3 ? 3 : 2) : i >= 84 ? (i % 4 === 0 ? 1 : 2) : i < 2 ? 3 : i === 66 || i === 35 ? 2 : 0;
                return <span key={i} className={`aspect-square rounded-[2px] ${["bg-line", "bg-red-500/80", "bg-gold/70", "bg-accent"][lvl]}`} />;
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

        {/* 12b Learning tools */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.toolsTitle")}</h2>
          <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {["academy", "shams", "tajweed", "vocab", "khatm", "guides"].map((k) => (
              <Link key={k} href={`/${k}`} className="bg-surface p-6 hover:bg-bg">
                <span className="block text-lg font-bold">{t(`home2.tool_${k}`)}</span>
                <span className="mt-1 block text-[15px] leading-relaxed text-muted">{t(`home2.tool_${k}D`)}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 12c All surahs */}
        {chapters.length > 0 && (
          <section className="border-y border-line bg-surface">
            <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
              <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.allTitle")}</h2>
              <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-muted">{t("home2.allLead")}</p>
              <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.map((c) => (
                  <li key={c.id} className="border-b border-line">
                    <Link href={`/surah/${c.id}`} className="flex items-center gap-3 py-3 hover:text-accent">
                      <span className="w-8 shrink-0 text-sm font-bold tabular-nums text-gold">{c.id}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{c.name_simple}</span><span className="block truncate text-xs text-muted">{[c.translated_name.name, `${c.verses_count} ${t("home.verses")}`].filter(Boolean).join(" · ")}</span></span>
                      <span className="font-arabic shrink-0 text-xl" dir="rtl">{c.name_arabic}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

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
        <div className="mx-auto max-w-6xl px-5 pt-12"><TrustStrip details /></div>
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
              <li><Link href="/about" className="text-muted hover:text-ink">{t("nav.about")}</Link></li>
              <li><Link href="/guides" className="text-muted hover:text-ink">{t("nav.blog")}</Link></li>
              <li><Link href="/feedback" className="text-muted hover:text-ink">{t("nav.feedback")}</Link></li>
              <li><Link href="/changelog" className="text-muted hover:text-ink">{t("nav.changelog")}</Link></li>
              <li><Link href="/support" className="text-muted hover:text-ink">{t("support.nav")}</Link></li>
              <li><Link href="/legal/privacy" className="text-muted hover:text-ink">{t("home2.privacy")}</Link></li>
              <li><Link href="/legal/terms" className="text-muted hover:text-ink">{t("home2.terms")}</Link></li>
              <li><Link href="/legal/imprint" className="text-muted hover:text-ink">{t("home2.imprint")}</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-line py-5">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-xs text-muted sm:flex-row sm:justify-between">
            <p><span className="font-semibold text-ink">{t("free.title")}</span> {t("free.body")}</p>
            <div className="flex flex-wrap items-center gap-x-2"><span>© {new Date().getFullYear()} {t("app.name")} · Nami Shams ·</span><MadeInDubai /></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
