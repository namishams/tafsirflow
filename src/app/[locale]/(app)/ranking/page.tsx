import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import { careerText } from "@/lib/careerWeb";
import DonateCTA from "@/components/DonateCTA";
import { MoreTiles } from "@/components/PosterTiles";
import WorldRanking, { type InitialRanking } from "@/components/rankings/WorldRanking";
import HallOfFame from "@/components/rankings/HallOfFame";
import { abs, pageMeta } from "@/lib/site";
import { pool } from "@/lib/db";
import { rankingsText } from "@/lib/rankingsWeb";
import { MIN_COUNTRY_MEMBERS, countryList, ensureFresh, hallOfFame, listFor, nextReset, participants, type Hall } from "@/lib/rankings";

// Worldwide rankings (public): the world and the countries are rendered on the server so they can be indexed; signed-in
// members get their own rank, the opt-in, "my country" and friends in the browser. The points ranking of all learners
// (the older page) lives at /ranking/points. Only members who joined appear, by username and display name.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const l = rankingsText(locale);
  return pageMeta(locale, "/ranking", `${l.metaTitle} | Quran Masterclass`, l.metaDesc);
}

export default async function RankingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = rankingsText(locale);
  const empty = { resetsAt: new Date(nextReset()).toISOString(), named: 0, minCountryMembers: MIN_COUNTRY_MEMBERS };
  let initial: InitialRanking = { world: { ...empty, rows: [] }, countries: { ...empty, countries: [] } };
  let hall: Hall[] = [];
  if (pool()) {
    try {
      await ensureFresh();
      const [rows, part, countries, h] = await Promise.all([listFor("world", "xp_week", null), participants(), countryList("week", "xp", "total", null), hallOfFame("year", 10)]);
      initial = { world: { ...empty, named: part.named, rows }, countries: { ...empty, named: part.named, countries: countries.rows } };
      hall = h;
    } catch { /* tables not created yet: the page still renders, empty */ }
  }
  const ld = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": abs(`/${locale}/ranking`),
    url: abs(`/${locale}/ranking`),
    name: l.title,
    description: l.metaDesc,
    inLanguage: locale,
    isPartOf: { "@id": abs("/#site") },
    mainEntity: {
      "@type": "ItemList",
      name: l.metric_xp_week,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: initial.world.rows!.slice(0, 10).map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.name, url: abs(`/${locale}/talents/${r.username}`) })),
    },
  };
  return (
    <div>
      <JsonLd data={ld} />
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <div className="relative mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))] rtl:tracking-normal">{l.kicker}</p>
          <h1 className="font-display mt-3 text-[40px] leading-[1.05] sm:text-6xl">{l.title}</h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/70">{l.lead}</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-5 py-10">
        {/* owner 22.10.2026: the global boards by period and category (week, month, all time; XP, verses, streak, exams) */}
        <p className="mb-6"><Link href="/ranking/global" className="inline-flex min-h-11 items-center rounded-lg border border-[rgb(var(--gold))]/60 px-4 font-semibold hover:bg-[rgb(var(--gold))]/10">{careerText(locale).boardTitle}</Link></p>
        <WorldRanking initial={initial} />
        <HallOfFame hall={hall} locale={locale} />
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-5"><DonateCTA /></div>
      <MoreTiles keys={["shams", "map", "arabic", "radio"]} />
    </div>
  );
}
