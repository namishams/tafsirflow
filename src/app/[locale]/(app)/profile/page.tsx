import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import ProfileView from "@/components/ProfileView";
import RequireAccount from "@/components/RequireAccount";
import MeEditView from "@/components/talents/MeEditView";
import TalentProfileWeb from "@/components/talents/TalentProfileWeb";
import { appStoreUrl } from "@/lib/appstore";
import { careerText } from "@/lib/careerWeb";

// /profile – the own profile (owner 22.10.2026, app and website 1:1): the TikTok-style profile of the app's Account tab
// with the tabs Achievements · Sijill · Badges · Statistics (career card, places, progress). The menu leads to the account
// settings (/account) and to "Account and data" (/profile/details, the view this page showed before). Old links keep
// working: /profile?tab=… still opens that view, /talents/me shows the same profile. Without a community profile the
// create form shows, with the link to the account view.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProfilePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  if (sp.tab) {
    const t = await getTranslations("profile");
    return (
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
        <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
        <RequireAccount feature={t("title")}><ProfileView /></RequireAccount>
      </main>
    );
  }
  const details = (
    <p className="mx-auto max-w-2xl px-5 pb-16 text-center">
      <Link href="/profile/details" className="font-semibold text-accent hover:underline">{careerText(locale).menuDetails}</Link>
    </p>
  );
  return (
    <div className="px-0 sm:px-5">
      <TalentProfileWeb locale={locale} initial={null} username={null} own appUrl={appStoreUrl()} fallback={<><MeEditView locale={locale} />{details}</>} />
    </div>
  );
}
