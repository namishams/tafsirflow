import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import TalentMe from "@/components/talents/TalentMe";
import SijillMe from "@/components/talents/SijillMe";
import { sortedCountries } from "@/lib/countries";
import { talentsText } from "@/lib/talentsWeb";

// /talents/me – the signed-in member's own talent profile on the website (not indexed)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TalentMePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ official?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tx = talentsText(locale);
  const official = ["ok", "low", "name", "none", "error", "expired", "denied"].includes(sp.official ?? "") ? sp.official : undefined;
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-gold rtl:tracking-normal"><Link href="/talents" className="hover:underline">{tx.network}</Link></p>
      <h1 className="font-display mt-2 text-4xl">{tx.meTitle}</h1>
      <p className="mt-2 text-muted">{tx.meLead}</p>
      <TalentMe locale={locale} tx={tx} countries={sortedCountries(locale)} official={official} />
      <SijillMe locale={locale} />
    </div>
  );
}
