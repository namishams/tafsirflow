import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import PeopleSearch, { type SearchCourse, type SearchSurah } from "@/components/talents/PeopleSearch";
import { getChapters } from "@/lib/quran";
import { CATALOG, txs } from "@/lib/learn/courses/catalog";
import { pageMeta } from "@/lib/site";
import { tpText } from "@/lib/talentsProfileWeb";

// /talents/search – account search like Instagram / TikTok, the same screen as the app's /talents/search (owner,
// 21.10.2026: app and website 1:1): tabs Accounts and Top, live results, recent searches, suggested accounts.
// ?q= starts with a query, ?tab=top opens the Top tab. Not indexed.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = tpText(locale);
  return { ...pageMeta(locale, "/talents/search", `${t.searchLabel} | Quran Masterclass Talents`, t.searchLabel), robots: { index: false, follow: true } };
}

export default async function TalentSearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string; tab?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const chapters = await getChapters(locale).catch(() => []);
  const surahs: SearchSurah[] = chapters.map((c) => ({ id: c.id, name: c.name_simple, sub: c.translated_name?.name ?? "", ar: c.name_arabic }));
  const courses: SearchCourse[] = CATALOG.map((c) => ({ id: c.id, title: txs(c.title, locale), lead: txs(c.lead, locale) }));
  return (
    <div className="px-0 sm:px-5">
      <PeopleSearch locale={locale} surahs={surahs} courses={courses} initialQ={typeof sp.q === "string" ? sp.q.slice(0, 40) : ""} initialTab={sp.tab === "top" ? "top" : "accounts"} />
    </div>
  );
}
