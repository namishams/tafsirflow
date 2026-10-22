import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pageMeta } from "@/lib/site";
import { PosterGrid, type PosterItem } from "@/components/PosterTiles";
import { TILES } from "@/lib/tiles";
import { CalligraphyDraw } from "@/components/Ornaments";
import { IconSearch } from "@/components/Icons";

// Discover: the website's version of the app's fourth tab (mobile/src/app/(tabs)/library): every course, tool and section as
// poster cards in the same themed rows, in the same order. Search is the field at the top (/search). Places the app has
// that the website does not (hadith, qibla, prophet stories) are left out.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  return pageMeta(locale, "/explore", `${t("nav.explore")} | Quran Masterclass`, t("explore.lead"));
}

// places that exist only as app/web pages without a tile in lib/tiles.ts: title nav.<nav>, text explore.<desc>
const gradient = (a: string, b: string) => `linear-gradient(160deg,${a} 0%,${b} 100%)`;
const EXTRA: Record<string, { href: string; nav?: string; title?: string; desc: string; ar: string; badge: string; bg: string }> = {
  reciterPath: { href: "/reciter-path", nav: "reciterPath", desc: "reciterPathD", ar: "تلاوة", badge: "course", bg: gradient("#1d4a3a", "#08140f") },
  cards: { href: "/cards", nav: "cards", desc: "cardsD", ar: "حفظ", badge: "progress", bg: gradient("#3b2f12", "#14110a") },
  tests: { href: "/tests", nav: "tests", desc: "testsD", ar: "امتحان", badge: "progress", bg: gradient("#21483c", "#0d0a18") },
  abrahamic: { href: "/abrahamic", nav: "abrahamic", desc: "abrahamicD", ar: "إبراهيم", badge: "library", bg: gradient("#42301b", "#140e09") },
  haramain: { href: "/haramain", nav: "haramain", desc: "haramainD", ar: "الحرمين", badge: "library", bg: gradient("#1b4035", "#08161a") },
  nahj: { href: "/nahj", nav: "fNahj", desc: "nahjD", ar: "نهج", badge: "library", bg: gradient("#1b4438", "#090d18") },
  feed: { href: "/feed", title: "feed", desc: "feedD", ar: "آية", badge: "live", bg: gradient("#473a1f", "#0e0a18") },
};

// the app's rows (mobile/src/features/library/Discover.tsx), without what the website does not have
const ROWS: { title: string; keys: string[] }[] = [
  { title: "rowLearn", keys: ["shams", "reciterPath", "courses", "arabic", "tajweed", "vocab", "cards", "tests", "plan", "how"] },
  { title: "rowQuran", keys: ["feed", "radio", "reciters", "khatm", "map"] },
  { title: "rowDaily", keys: ["prayer", "salah", "wudu", "duas", "duagen"] },
  { title: "rowHeritage", keys: ["nahj", "abrahamic", "haramain", "islam", "secrets", "guides", "world"] },
  { title: "rowCommunity", keys: ["community", "ranking", "stats", "assistant"] },
];

export default async function ExplorePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const open = t("home2.open");
  const item = (k: string): PosterItem | null => {
    const x = EXTRA[k];
    if (x) return { href: x.href, title: t(x.nav ? `nav.${x.nav}` : `explore.${x.title}`), desc: t(`explore.${x.desc}`), badge: t(`home2.badge_${x.badge}`), ar: x.ar, bg: x.bg, cta: open };
    const c = TILES[k];
    return c ? { href: c.href, title: t(`nav.${c.key}`), desc: t(`home2.${c.desc}`), badge: t(`home2.badge_${c.badge}`), ar: c.ar, bg: c.bg, cta: open } : null;
  };
  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <CalligraphyDraw text={"اكتشف"} className="absolute -end-2 top-0 h-[150px] w-[520px] max-w-none sm:h-[250px] sm:w-[880px]" />
        <div className="relative mx-auto max-w-5xl px-5 pb-14 pt-12 sm:pb-20 sm:pt-20">
          <h1 className="font-display max-w-3xl text-[38px] leading-[1.06] sm:text-6xl">{t("nav.explore")}</h1>
          <p className="mt-4 max-w-2xl text-[16.5px] leading-relaxed text-white/75 sm:text-[18px]">{t("explore.lead")}</p>
          <Link href="/search" aria-label={t("nav.search")} className="mt-7 flex h-14 w-full max-w-2xl items-center gap-3 rounded-full border border-white/25 bg-white/10 px-5 text-[16px] text-white/85 backdrop-blur transition hover:border-[rgb(var(--gold))]/70 hover:bg-white/15">
            <span className="text-[rgb(var(--gold))]"><IconSearch /></span>
            <span className="min-w-0 flex-1 truncate">{t("search.title")}</span>
          </Link>
        </div>
        <span aria-hidden className="q-arcade opacity-70" />
      </section>
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-4 pb-28 pt-12 sm:px-5 lg:pb-16">
        {ROWS.map((r) => {
          const items = r.keys.map(item).filter((x): x is PosterItem => !!x);
          return <PosterGrid key={r.title} items={items} title={t(`explore.${r.title}`)} tall={false} />;
        })}
      </div>
    </div>
  );
}
