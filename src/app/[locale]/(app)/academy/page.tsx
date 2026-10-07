import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AcademyHome from "@/components/AcademyHome";
import RequireAccount from "@/components/RequireAccount";
import { pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { CalligraphyDraw } from "@/components/Ornaments";
import { HomeCorners, HomeGlowLayer, HomeRain, HomeVerse, StarGlyph } from "@/components/art/HomeOrnaments";
import HomeGlow from "@/components/art/HomeGlow";
import { tileFor } from "@/lib/tiles";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academy" });
  return pageMeta(locale, "/academy", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

const MODULES = [
  { href: "/plan", key: "mPlan" },
  { href: "/shams", key: "mShams" },
  { href: "/tajweed", key: "mTajweed" },
  { href: "/vocab", key: "mVocab" },
  { href: "/khatm", key: "mKhatm" },
  { href: "/guides", key: "mGuides" },
  { href: "/duas", key: "mDuas" },
];

export default async function AcademyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("academy");
  const th = await getTranslations("home2");
  return (
    <>
      {/* the school of the Quran: knowledge written in gold over the dark binding */}
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <HomeRain className="opacity-70" />
        <CalligraphyDraw text="علم" className="absolute -end-4 top-2 h-[130px] w-[380px] max-w-none opacity-90 sm:h-[230px] sm:w-[700px]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-12 pt-10 sm:pb-16 sm:pt-14">
          <p className="rise hm-k text-[rgb(var(--gold))]">{t("eyebrow")}</p>
          <h1 className="rise font-display mt-3 text-[40px] leading-[1.05] sm:text-6xl" style={{ animationDelay: "120ms" }}>{t("title")}</h1>
          <p className="rise mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70" style={{ animationDelay: "240ms" }}>{t("lead")}</p>
          <HomeVerse text="وَقُل رَّبِّ زِدۡنِي عِلۡمٗا" cite="20:114" className="rise mt-4 text-[24px] sm:text-[28px]" />
        </div>
      </section>
      <main className="mx-auto max-w-4xl px-4 pb-24 pt-2">
        <RequireAccount feature={t("title")}><AcademyHome /></RequireAccount>
        <section className="mt-14">
          <h2 className="font-display flex items-center gap-2.5 text-2xl"><StarGlyph size={16} className="text-[rgb(var(--hm-gold))]" />{t("modules")}</h2>
          <HomeGlow />
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {MODULES.map((m) => (
              <li key={m.href} className="min-w-0">
                <Link href={m.href} className="hm-card hm-lift hm-glow group flex h-full flex-col overflow-hidden p-5">
                  <HomeGlowLayer />
                  <HomeCorners />
                  <span aria-hidden className="font-callig pointer-events-none absolute -bottom-3 end-2 text-[60px] leading-none text-[rgb(var(--hm-gold))]/[0.14] transition duration-700 group-hover:text-[rgb(var(--hm-gold))]/25">{tileFor(m.href)?.ar}</span>
                  <span className="relative block text-[16px] font-bold">{t(`${m.key}`)}</span>
                  <span className="relative mt-1 block flex-1 text-sm leading-relaxed text-muted">{t(`${m.key}D`)}</span>
                  <span className="hm-k relative mt-3 inline-flex items-center gap-1.5 text-accent">{th("open")} <span aria-hidden className="inline-block transition group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">→</span></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <MoreTiles keys={["shams", "arabic", "salah", "tajweed"]} />
    </>
  );
}
