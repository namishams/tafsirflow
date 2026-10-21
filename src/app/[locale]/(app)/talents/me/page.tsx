import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import MeEditView from "@/components/talents/MeEditView";
import TalentProfileWeb from "@/components/talents/TalentProfileWeb";
import { appStoreUrl } from "@/lib/appstore";

// /talents/me – the signed-in member's own talent profile (not indexed). Owner 21.10.2026 (app and website 1:1): the
// TikTok-style own profile like the app's Account tab (top bar with the menu to the account settings, Edit profile,
// Share profile, follow requests, highlights, the achievement grid). Without a profile, signed out, or back from the
// YouTube check (?official=) it shows the edit view as before (also at /talents/me/edit).
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TalentMePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ official?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const official = ["ok", "low", "name", "none", "error", "expired", "denied"].includes(sp.official ?? "") ? sp.official : undefined;
  if (official) return <MeEditView locale={locale} official={official} />;
  return (
    <div className="px-0 sm:px-5">
      <TalentProfileWeb locale={locale} initial={null} username={null} own appUrl={appStoreUrl()} fallback={<MeEditView locale={locale} />} />
    </div>
  );
}
