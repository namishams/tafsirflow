import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import MeEditView from "@/components/talents/MeEditView";

// /talents/me/edit – Edit profile (the form that was /talents/me until 21.10.2026; not indexed)
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TalentMeEditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MeEditView locale={locale} />;
}
