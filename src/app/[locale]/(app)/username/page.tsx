import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import UsernameWeb from "@/components/talents/UsernameWeb";

// /username – choose the unique @username (owner 22.10.2026), like the app's /username. Not indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function UsernamePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <UsernameWeb locale={locale} />;
}
