import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ProfileView from "@/components/ProfileView";
import RequireAccount from "@/components/RequireAccount";
import { IdentitySetting } from "@/components/identity/Identity";

// /profile/details – the account view that /profile showed before 22.10.2026 (personal data, complete learning
// statistics, security and privacy controls), unchanged. Reached from the profile menu ("Account and data").
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ProfileDetailsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("profile");
  return (
    <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <RequireAccount feature={t("title")}><ProfileView /></RequireAccount>
      {/* brother/sister and age band of the onboarding (also without an account: stored in this browser, synced with one) */}
      <div className="mt-8"><IdentitySetting /></div>
    </main>
  );
}
