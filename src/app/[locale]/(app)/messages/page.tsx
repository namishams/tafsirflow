import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import MessengerWeb from "@/components/messenger/MessengerWeb";

// /messages – the messenger on the website, the same as the app (inbox, requests, chats, groups, study-circle chats).
// Signed in only, never indexed. ?join=<code> joins a group by invite link.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function MessagesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MessengerWeb locale={locale} />;
}
