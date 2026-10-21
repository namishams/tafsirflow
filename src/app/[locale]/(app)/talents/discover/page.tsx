import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TalentDiscoverWeb from "@/components/talents/TalentDiscoverWeb";
import { sortedCountries } from "@/lib/countries";
import { discoverText } from "@/lib/discoverWeb";
import { pageMeta } from "@/lib/site";
import { sijillText } from "@/lib/sijillWeb";
import { talentsText } from "@/lib/talentsWeb";
import { tpText } from "@/lib/talentsProfileWeb";

// /talents/discover – "Discover talents" on the website (22.10.2026), the same list as the app's /talents: search,
// filters (level, verified, madrasa stage, focus, surah, country, rewaya) and the paged list from
// /api/community/talents. "See all" next to the suggested accounts leads here; the landing page /talents stays.
// Signed in only (like the app), not indexed.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const d = discoverText(locale);
  return { ...pageMeta(locale, "/talents/discover", `${d.discoverTitle} | Quran Masterclass Talents`, d.discoverLead), robots: { index: false, follow: true } };
}

export default async function TalentDiscoverPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const d = discoverText(locale);
  const tx = talentsText(locale);
  const sx = sijillText(locale);
  const pick = <T extends Record<string, string>>(src: T, keys: string[]) => Object.fromEntries(keys.filter((k) => k in src).map((k) => [k, src[k]]));
  const texts: Record<string, string> = {
    ...pick(tx, ["level_talent", "level_rising", "level_master", "level_sheikh", "ageTitle", "ageLead", "birthYear", "ageConfirm", "confirm", "under13", "e_verify", "e_age", "e_birth_year"]),
    ...pick(sx, ["filterStage", "filterFocus", "filterSurah", "surahHint", "stage_ibtidai", "stage_idadi", "stage_thanawi", "stage_ali", "focus_hifz", "focus_reading", "focus_arabic", "focus_knowledge"]),
    safetyLine: tpText(locale).safetyLine,
    ...d,
  };
  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal"><Link href="/talents" className="hover:underline">{tx.network}</Link></p>
      <h1 className="font-display mt-2 text-4xl">{d.discoverTitle}</h1>
      <p className="mt-3 text-[16px] leading-relaxed text-muted">{d.discoverLead}</p>
      <TalentDiscoverWeb t={texts} countries={sortedCountries(locale)} />
    </div>
  );
}
