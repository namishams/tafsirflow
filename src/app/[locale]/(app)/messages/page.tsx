import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import AppOnly from "@/components/apppush/AppOnly";
import { appStoreUrl } from "@/lib/appstore";
import MessengerWeb from "@/components/messenger/MessengerWeb";

// /messages – the messenger on the website, the same as the app (inbox, requests, chats, groups, study-circle chats).
// Signed in only, never indexed. ?join=<code> joins a group by invite link.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MessagesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { locale } = await params;
  // ?demo=1 fills the inbox and one chat with sample data for screenshots, never in production
  const demo = process.env.NODE_ENV !== "production" && (await searchParams).demo === "1";
  setRequestLocale(locale);
  return <><MessengerWeb locale={locale} demo={demo} /><div className="mx-auto max-w-4xl px-4 pb-16"><AppOnly topics={["messenger", "widgets", "offline"]} url={appStoreUrl()} /></div></>;
}
