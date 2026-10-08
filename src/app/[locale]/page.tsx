import type { Metadata } from "next";
import { TrustLine } from "@/components/TrustStrip";
import PosterTiles from "@/components/PosterTiles";
import { CalligraphyRing, Divider, Ink, Rosette } from "@/components/Ornaments";
import CountUp from "@/components/CountUp";
import { HOME_TILES, TILES } from "@/lib/tiles";
import AppHeader from "@/components/AppHeader";
import SiteFooter from "@/components/SiteFooter";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import JsonLd from "@/components/JsonLd";
import WhyQuran from "@/components/WhyQuran";
import { getChapters } from "@/lib/quran";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import Featured from "@/components/Featured";
import Sticker from "@/components/Sticker";
import { LOCALE_META } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { abs, pageMeta } from "@/lib/site";
import { ArrowNext } from "@/components/Icons";
import { HomeArch, HomeCorners, HomeDome, HomeFrieze, HomeGlowLayer, HomeRain, HomeStar, HomeVerse, StarGlyph } from "@/components/art/HomeOrnaments";
import HomeGlow from "@/components/art/HomeGlow";

export const revalidate = 3600; // the verse of the day changes daily; the page refreshes hourly

const FEATURES = ["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9"] as const;
const FAQ = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;
const GLOSSARY = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
// the glossary terms in Arabic (shown as calligraphy next to the term in the other languages)
const GLOSSARY_AR = ["حفظ", "فهم", "تلاوة", "تجويد", "تفسير", "سورة", "آية", "جزء", "حزب", ""];
const POPULAR: { n: number; href: string; s: number; ar: string }[] = [
  { n: 1, href: "/surah/1", s: 1, ar: "الفاتحة" }, { n: 2, href: "/surah/2?v=255", s: 2, ar: "آية الكرسي" }, { n: 3, href: "/surah/36", s: 36, ar: "يس" }, { n: 4, href: "/surah/55", s: 55, ar: "الرحمن" },
  { n: 5, href: "/surah/18", s: 18, ar: "الكهف" }, { n: 6, href: "/surah/67", s: 67, ar: "الملك" }, { n: 7, href: "/surah/112", s: 112, ar: "الإخلاص" }, { n: 8, href: "/surah/78", s: 78, ar: "جزء عمّ" },
];
const PATHS: [string, string, string][] = [["pHifz", "/surah/78?m=2", "حفظ"], ["pFahm", "/surah/1", "فهم"], ["pTilawa", "/surah/112", "تلاوة"]];
const METHOD: [string, string, string][] = [["mNew", "01", "سبق"], ["mRecent", "02", "سبقي"], ["mOld", "03", "منزل"]];

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
  const ar = locale === "ar";
  // numbers in the hero strip follow the visitor's language (6.236 in German, 6,236 in English); Latin digits like the rest of the page
  const free = (0).toLocaleString(`${locale}-u-nu-latn`, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const chapters = await getChapters(locale).catch(() => []);
  const btnP = "inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white shadow-[inset_0_0_0_1px_rgb(233_207_153/.35),0_12px_26px_-16px_rgb(6_108_78/.9)] transition hover:brightness-110";
  const btnS = "inline-flex h-12 items-center rounded-md border border-[rgb(var(--hm-gold))]/60 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--hm-gold))] hover:bg-[rgb(var(--hm-gold))]/10";
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
  const corners = ["start-1.5 top-1.5", "end-1.5 top-1.5", "bottom-1.5 start-1.5", "bottom-1.5 end-1.5"];

  return (
    <div>
      <JsonLd data={ld} />
      <AppHeader />
      <HomeGlow />

      <main>
        {/* 1 Hero – cinematic, with an animated verse player (words light up one after another) */}
        <section className="stage girih relative overflow-hidden text-[#eef0f3]">
          <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 85% 15%, rgb(var(--gold) / .16) 0, transparent 40%), radial-gradient(circle at 10% 90%, rgb(var(--accent) / .22) 0, transparent 45%)" }} />
          <HomeRain className="opacity-80" />
          <CalligraphyRing text="ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ ۞ وَقُل رَّبِّ زِدْنِى عِلْمًا ۞ ٱلرَّحْمَـٰنُ عَلَّمَ ٱلْقُرْءَانَ ۞" className="absolute -end-36 -top-36 w-[320px] opacity-50 sm:-end-16 sm:-top-16 sm:w-[560px] sm:opacity-50 lg:opacity-40 min-[1400px]:hidden" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 sm:pb-24 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="rise font-arabic mb-5 text-[26px] leading-none text-[rgb(var(--gold))] sm:text-[30px]"><Ink>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Ink></p>
              <p className="rise hm-k !text-[12px] text-[rgb(var(--gold))]" style={{ animationDelay: "120ms" }}>{t("home2.heroKicker", { n })}</p>
              <h1 className="rise font-display mt-5 text-[44px] leading-[1.02] sm:text-7xl" style={{ animationDelay: "240ms" }}>{t("home2.heroTitle")}</h1>
              <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-white/70 sm:text-lg">{t("home2.heroLead")}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/academy" className="inline-flex h-12 items-center rounded-md btn-gold px-6 text-[15px] font-bold">{t("home2.heroCta")}</Link>
                <Link href="/shams" className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--gold))]/40 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{t("home2.heroCta2")}</Link>
              </div>
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-[rgb(var(--gold))]/40 bg-[rgb(var(--gold))]/[0.06] px-3 py-1 text-xs font-semibold text-[rgb(var(--gold))]"><StarGlyph size={10} />{t("free.badge")}</p>
              <TrustLine className="mt-3 flex text-white/70" />
              <ul className="hm-band mt-7 grid max-w-lg grid-cols-2 sm:grid-cols-4">
                {([[114, "home2.statSurahs"], [6236, "home2.statVerses"], [n, "home2.statLanguages"], [free, "home2.statFree"]] as [number | string, string][]).map(([v, k], i) => (
                  <li key={k} className={`px-3 py-3.5 sm:px-4 ${i % 2 ? "" : "!border-s-0 sm:!border-s"} ${i === 0 ? "sm:!border-s-0" : ""} ${i > 1 ? "border-t border-[rgb(var(--gold))]/15 sm:border-t-0" : ""}`}>
                    <p className="font-display text-2xl text-white">{typeof v === "number" ? <CountUp to={v} locale={locale} /> : v}</p>
                    <p className="mt-0.5 flex items-start gap-1.5 text-xs leading-snug text-white/60"><StarGlyph size={8} className="mt-[3px] shrink-0 text-[rgb(var(--gold))]" />{t(k)}</p>
                  </li>
                ))}
              </ul>
            </div>
            <figure aria-hidden className="relative overflow-hidden rounded-2xl bg-white/[0.045] p-7 shadow-2xl ring-1 ring-[rgb(var(--gold))]/20 sm:p-10">
              <span className="illum-frame" />
              {corners.map((c) => <Rosette key={c} size={22} className={`absolute ${c}`} />)}
              <div className="relative flex items-center justify-between gap-3 text-xs text-white/55"><span>{ar ? "الفاتحة · ١" : "Al-Fatihah · 1"}</span><span>{ar ? "مشاري العفاسي" : "Mishary Alafasy"}</span></div>
              <p className="hero-words font-arabic relative mt-6 flex flex-row-reverse flex-wrap justify-start gap-x-3 text-[2.4rem] leading-[1.9] sm:text-5xl">
                <span>بِسْمِ</span><span>ٱللَّهِ</span><span>ٱلرَّحْمَـٰنِ</span><span>ٱلرَّحِيمِ</span>
              </p>
              {!ar && <p className="relative mt-2 text-[15px] italic text-[rgb(var(--gold))]">Bismi llāhi r-raḥmāni r-raḥīm</p>}
              <p className={`relative text-sm text-white/60 ${ar ? "mt-3" : "mt-1"}`}>{t("home2.heroVerse")}</p>
              <div className="relative mt-7 flex items-center gap-3 border-t border-[rgb(var(--gold))]/20 pt-5">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center">
                  <svg viewBox="0 0 40 40" className="hm-spin absolute -inset-1.5 h-[calc(100%+12px)] w-[calc(100%+12px)] text-[rgb(var(--gold))]" aria-hidden><path d="M20 1l4.6 8.9 9.8-2.3-2.3 9.8L41 20l-8.9 4.6 2.3 9.8-9.8-2.3L20 39l-4.6-8.9-9.8 2.3 2.3-9.8L-1 20l8.9-4.6-2.3-9.8 9.8 2.3z" fill="none" stroke="currentColor" strokeOpacity=".45" strokeWidth=".8" /></svg>
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[rgb(var(--gold))] text-[rgb(var(--stage))]"><svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor"><rect width="4" height="14" rx="1" /><rect x="8" width="4" height="14" rx="1" /></svg></span>
                </span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/15"><span className="hero-progress block h-1 rounded-full bg-[rgb(var(--gold))]" /></span>
                <span className="text-xs tabular-nums text-white/50">0:06</span>
              </div>
              <div className="relative mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-white/75">
                {["home2.chipWords", "home2.chipTafsir", "home2.chipHide", "home2.chipRepeat"].map((k) => <span key={k} className="rounded-full border border-[rgb(var(--gold))]/25 bg-white/[0.03] px-2.5 py-1">{t(k)}</span>)}
              </div>
            </figure>
          </div>
        </section>

        {/* 1b Courses – poster cards like a class catalogue */}
        <section className="stage girih pb-16 text-[#eef0f3] sm:pb-24">
          <HomeFrieze className="opacity-70" />
          <div className="mx-auto max-w-6xl px-5">
            <div className="flex items-end justify-between gap-4 pt-10">
              <h2 className="font-display text-3xl leading-tight sm:text-4xl">{!ar && <span aria-hidden className="font-callig gold-sheen mb-1 block text-[28px] leading-snug sm:text-[34px]" dir="rtl">دورات وأدوات</span>}{t("home2.coursesTitle")}</h2>
              <Link href="/academy" className="shrink-0 text-sm font-semibold text-[rgb(var(--gold))] hover:underline">{t("home2.coursesAll")} <ArrowNext /></Link>
            </div>
            <PosterTiles keys={HOME_TILES} className="mt-6" />
          </div>
        </section>

        <Divider className="py-10" />

        {/* 1c Surah of the day and of the month, dua of the month */}
        <div className="-mt-8"><Featured locale={locale} /></div>

        {/* 2 Verse of the day */}
        <VerseOfTheDay locale={locale} />

        {/* 2a Why the Quran comes first */}
        <WhyQuran locale={locale} />

        {/* 3 Why */}
        <section className="hm-warm overflow-hidden">
          <span aria-hidden className="hm-wm font-callig -start-4 bottom-0 text-[130px] sm:text-[220px]">هدى</span>
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("landing.whyTitle")}</h2>
              <HomeVerse text="إِنَّ هَٰذَا ٱلۡقُرۡءَانَ يَهۡدِي لِلَّتِي هِيَ أَقۡوَمُ" cite="17:9" className="mt-6 text-[22px] sm:text-[26px]" />
            </div>
            <div className="space-y-5 text-[17px] leading-relaxed text-muted lg:border-s lg:border-[rgb(var(--hm-gold))]/30 lg:ps-10">
              <p>{t("landing.whyP1")}</p>
              <p>{t("landing.whyP2")}</p>
            </div>
          </div>
        </section>

        {/* 4 Three paths – three mihrab arches */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display max-w-2xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.pathsTitle")}</h2>
            <p className="mt-4 max-w-2xl text-[17px] text-muted">{t("home2.pathsIntro")}</p>
            <div className="mt-14 grid gap-12 sm:gap-6 lg:grid-cols-3">
              {PATHS.map(([k, href, word]) => (
                <HomeArch key={k} ratio={0.4} lift={0.19} className="hm-arch-shadow h-full" bodyClass="h-full px-6 pb-8 sm:px-8">
                  <div className="flex h-full flex-col">
                  <span aria-hidden className={`relative mb-2 block text-center ${ar ? "" : "font-callig gold-sheen text-[40px] leading-tight"}`} dir="rtl">{ar ? <StarGlyph size={30} className="mx-auto text-[rgb(var(--hm-gold))]" /> : word}</span>
                  <h3 className="font-display text-center text-[28px] leading-tight">{t(`home2.${k}T`)}</h3>
                  <p className="mt-3 flex-1 text-center text-[15px] leading-relaxed text-muted">{t(`home2.${k}D`)}</p>
                  <Link href={href} className={`${btnS} mx-auto mt-6 h-11 w-fit px-5 text-sm`}>{t(`home2.${k}Cta`)}</Link>
                  </div>
                </HomeArch>
              ))}
            </div>
          </div>
        </section>

        {/* 5 Method */}
        <section className="hm-warm overflow-hidden">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <p className="eyebrow">{t("landing.howTitle")}</p>
            <h2 className="font-display mt-3 max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.methodTitle")}</h2>
            <p className="mt-4 max-w-2xl text-[17px] text-muted">{t("home2.methodIntro")}</p>
            <ol className="relative mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
              <span aria-hidden className="absolute inset-x-[16%] top-7 hidden border-t border-dashed border-[rgb(var(--hm-gold))]/50 sm:block" />
              {METHOD.map(([k, num, word]) => (
                <li key={k} className="relative text-center">
                  <HomeStar size={58} tone="gold" className="mx-auto">{num}</HomeStar>
                  {!ar && <p aria-hidden className="font-callig mt-3 text-[30px] leading-none text-[rgb(var(--hm-gold-d))]" dir="rtl">{word}</p>}
                  <h3 className="font-display mt-3 text-[26px] leading-tight">{t(`home2.${k}T`)}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{t(`home2.${k}D`)}</p>
                </li>
              ))}
            </ol>
            <p className="callout mx-auto mt-12 max-w-3xl rounded-lg p-5 text-[17px] leading-relaxed sm:p-6">{t("home2.methodOutro")}</p>
          </div>
        </section>

        {/* 7 Features */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="font-display max-w-2xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.featTitle")}</h2>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {FEATURES.map((k, i) => (
              <li key={k} className="hm-card hm-lift hm-glow flex gap-4 p-5 sm:p-6">
                <HomeGlowLayer />
                <HomeStar size={44} className="hm-turn">{String(i + 1).padStart(2, "0")}</HomeStar>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold tracking-tight">{t(`${i < 6 ? "landing" : "home2"}.${k}t`, { n })}</h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{t(`${i < 6 ? "landing" : "home2"}.${k}d`)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* 8 Map teaser – a panel of glazed tiles on the dark binding */}
        <section className="stage girih relative overflow-hidden text-[#eef0f3]">
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-2">
            <div>
              <p className="hm-k text-[rgb(var(--gold))]">{t("home2.mapSoon")}</p>
              <h2 className="font-display mt-3 text-4xl leading-[1.1] sm:text-5xl">{t("home2.mapTitle")}</h2>
              <p className="mt-4 max-w-lg text-[17px] leading-relaxed text-white/70">{t("home2.mapBody")}</p>
              <Link href="/map" className="btn-gold mt-7 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{t("home2.mapCta")}</Link>
            </div>
            <div aria-hidden className="relative rounded-2xl bg-black/20 p-5 ring-1 ring-[rgb(var(--gold))]/20 sm:p-7">
              <span className="illum-frame" />
              {corners.map((c) => <Rosette key={c} size={20} className={`absolute ${c}`} />)}
              <div className="hm-cells relative grid grid-cols-[repeat(19,minmax(0,1fr))] gap-[3px] p-2 sm:gap-1">
                {Array.from({ length: 114 }, (_, i) => {
                  // illustration: the short surahs at the end are learned first
                  const lvl = i >= 100 ? 3 : i >= 92 ? (i % 3 ? 3 : 2) : i >= 84 ? (i % 4 === 0 ? 1 : 2) : i < 2 ? 3 : i === 66 || i === 35 ? 2 : 0;
                  const bg = ["rgb(255 255 255 / .08)", "rgb(var(--hm-terra) / .85)", "rgb(214 180 108 / .85)", "rgb(58 190 146 / .85)"][lvl];
                  return <span key={i} className="aspect-square rounded-[3px]" style={{ background: bg, boxShadow: lvl ? "inset 0 1px 0 rgb(255 255 255 / .25)" : "inset 0 0 0 1px rgb(214 180 108 / .1)" }} />;
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 9 Popular */}
        <section className="hm-warm">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.popTitle")}</h2>
            <p className="mt-4 max-w-2xl text-[17px] text-muted">{t("home2.popIntro")}</p>
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {POPULAR.map(({ n: i, href, s, ar: arName }) => (
                <li key={i} className="min-w-0">
                  <Link href={href} className="hm-card hm-lift hm-glow group flex h-full min-w-0 items-center gap-4 p-4 sm:p-5">
                    <HomeGlowLayer />
                    <HomeStar size={46}>{s}</HomeStar>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[17px] font-bold">{t(`home2.pop${i}`)}</span>
                      <span className="mt-1 block text-[15px] leading-relaxed text-muted">{t(`home2.pop${i}d`)}</span>
                    </span>
                    {!ar && <span aria-hidden className="font-callig hidden shrink-0 text-[28px] leading-none text-[rgb(var(--hm-gold))] transition group-hover:text-accent min-[400px]:block" dir="rtl">{arName}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 10 Kids + Tajweed */}
        <section className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:py-24 lg:grid-cols-2">
          <div className="hm-card flex flex-col p-6 sm:p-8">
            <HomeCorners />
            <Sticker def={{ id: "hm-kids", icon: "crescent", tone: "sun", ar: "" }} size={72} />
            <h2 className="font-display mt-5 text-4xl leading-[1.1]">{t("home2.kidsTitle")}</h2>
            <p className="mt-4 flex-1 text-[17px] leading-relaxed text-muted">{t("home2.kidsBody")}</p>
            <Link href="/surah/112" className={`${btnS} mt-6 w-fit`}>{t("home2.kidsCta")}</Link>
          </div>
          <div className="hm-card flex flex-col p-6 sm:p-8">
            <HomeCorners />
            <Sticker def={{ id: "hm-taj", icon: "ear", tone: "sea", ar: "" }} size={72} />
            <h2 className="font-display mt-5 text-4xl leading-[1.1]">{t("home2.tajTitle")}</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("home2.tajBody")}</p>
            <HomeVerse text="وَرَتِّلِ ٱلۡقُرۡءَانَ تَرۡتِيلًا" cite="73:4" className="mt-5 text-[24px] sm:text-[28px]" />
          </div>
        </section>

        {/* 11 Languages */}
        <section className="hm-warm overflow-hidden">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.langsTitle2")}</h2>
            <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-muted">{t("home2.langsBody", { n })}</p>
            <HomeVerse text="وَٱخۡتِلَٰفُ أَلۡسِنَتِكُمۡ وَأَلۡوَٰنِكُمۡ" cite="30:22" className="mt-5 text-[22px] sm:text-[26px]" />
            <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 sm:gap-x-7">
              {Object.entries(LOCALE_META).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2.5 sm:gap-3">
                  <StarGlyph size={10} className="shrink-0 text-[rgb(var(--hm-gold))]/80" />
                  <Link href="/" locale={k} hrefLang={k} className={`font-display text-3xl transition hover:text-accent sm:text-4xl ${k === locale ? "text-[rgb(var(--hm-gold-d))]" : "text-ink"}`}>{v.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 12 Glossary */}
        <section>
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("home2.glossTitle")}</h2>
            <dl className="mt-10 grid gap-x-12 gap-y-1 sm:grid-cols-2">
              {GLOSSARY.map((i) => (
                <div key={i} className="flex gap-4 border-t border-[rgb(var(--hm-gold))]/25 py-4">
                  <div className="min-w-0 flex-1">
                    <dt className="flex items-center gap-2 text-[17px] font-bold"><StarGlyph size={9} className="shrink-0 text-[rgb(var(--hm-gold))]" />{t(`home2.gT${i}`)}</dt>
                    <dd className="mt-1 text-[15px] leading-relaxed text-muted">{t(`home2.gD${i}`)}</dd>
                  </div>
                  {!ar && GLOSSARY_AR[i - 1] && <span aria-hidden className="font-callig shrink-0 text-[30px] leading-none text-[rgb(var(--hm-gold))]/80" dir="rtl">{GLOSSARY_AR[i - 1]}</span>}
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 12b Learning tools */}
        <section className="hm-warm">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.toolsTitle")}</h2>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {["academy", "shams", "tajweed", "vocab", "khatm", "guides"].map((k) => (
                <li key={k} className="min-w-0">
                  <Link href={`/${k}`} className="hm-card hm-lift hm-glow group flex h-full flex-col overflow-hidden p-6">
                    <HomeGlowLayer />
                    <span aria-hidden className="font-callig pointer-events-none absolute -bottom-3 -end-1 text-[68px] leading-none text-[rgb(var(--hm-gold))]/[0.14] transition duration-700 group-hover:text-[rgb(var(--hm-gold))]/25">{TILES[k === "academy" ? "courses" : k]?.ar}</span>
                    <span className="relative block text-lg font-bold">{t(`home2.tool_${k}`)}</span>
                    <span className="relative mt-1 block flex-1 text-[15px] leading-relaxed text-muted">{t(`home2.tool_${k}D`)}</span>
                    <span className="hm-k relative mt-4 inline-flex items-center gap-1.5 text-accent">{t("home2.open")} <span aria-hidden className="inline-block transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 12c All surahs */}
        {chapters.length > 0 && (
          <section>
            <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
              <h2 className="font-display max-w-3xl text-4xl leading-[1.1] sm:text-5xl">{t("home2.allTitle")}</h2>
              <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-muted">{t("home2.allLead")}</p>
              <ul className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                {chapters.map((c) => (
                  <li key={c.id} className="border-b border-[rgb(var(--hm-gold))]/20">
                    <Link href={`/surah/${c.id}`} className="group flex items-center gap-3 py-2.5 transition hover:text-accent">
                      <HomeStar size={34} className="!text-[11px]">{c.id}</HomeStar>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[15px] font-semibold">{c.name_simple}</span><span className="block truncate text-xs text-muted">{[c.translated_name.name, `${c.verses_count} ${t("home.verses")}`].filter(Boolean).join(" · ")}</span></span>
                      <span className="font-arabic shrink-0 text-xl text-[rgb(var(--hm-gold-d))] transition group-hover:text-accent" dir="rtl">{c.name_arabic}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* 13 FAQ */}
        <section className="hm-warm">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="font-display text-4xl leading-[1.1] sm:text-5xl">{t("landing.faqTitle")}</h2>
              <HomeVerse text="فَسۡـَٔلُوٓاْ أَهۡلَ ٱلذِّكۡرِ إِن كُنتُمۡ لَا تَعۡلَمُونَ" cite="16:43" className="mt-6 text-[21px] sm:text-[24px]" />
            </div>
            <div className="grid gap-2">
              {FAQ.map((i) => (
                <details key={i} className="hm-faq group rounded-lg border border-[rgb(var(--hm-gold))]/22 bg-surface/70 px-4 transition-colors open:border-[rgb(var(--hm-gold))]/50 sm:px-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-[17px] font-semibold">
                    {faqText(i, "q")}
                    <span aria-hidden className="hm-plus mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[rgb(var(--hm-gold))]/50 text-[rgb(var(--hm-gold-d))]"><svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg></span>
                  </summary>
                  <p className="max-w-2xl pb-5 text-[15px] leading-relaxed text-muted">{faqText(i, "a")}</p>
                </details>
              ))}
            </div>
          </div>
        </section>


        {/* 14 Final CTA – under the lattice dome, in a mihrab of light */}
        <section className="stage girih relative overflow-hidden text-[#eef0f3]">
          <HomeDome id="home-dome" className="-top-[300px] w-[600px] opacity-50 sm:-top-[520px] sm:w-[1040px]" />
          <HomeRain />
          <div className="relative mx-auto max-w-3xl px-4 py-16 sm:px-5 sm:py-24">
            <HomeArch dark ratio={0.3} lift={0.17}>
              <div className="px-5 pb-10 text-center sm:px-12 sm:pb-14">
                <HomeVerse text="ٱقۡرَأۡ بِٱسۡمِ رَبِّكَ ٱلَّذِي خَلَقَ" cite="96:1" className="relative text-[22px] sm:text-[28px]" />
                <h2 className="font-display mx-auto mt-4 max-w-3xl text-4xl leading-[1.1] sm:text-6xl">{t("home2.finalTitle")}</h2>
                <p className="mx-auto mt-4 max-w-xl text-[17px] text-white/70">{t("home2.finalBody")}</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link href="/quran" className="btn-gold inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{t("landing.cta")}</Link>
                  <Link href="/account" className="inline-flex h-12 items-center rounded-md border border-[rgb(var(--gold))]/45 px-6 text-[15px] font-bold transition hover:border-[rgb(var(--gold))] hover:bg-white/[0.04]">{t("landing.cta2")}</Link>
                </div>
              </div>
            </HomeArch>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
