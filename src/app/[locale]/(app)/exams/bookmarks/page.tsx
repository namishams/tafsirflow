// /exams/bookmarks – the bookmarked questions (mirrors mobile/src/app/exams/bookmarks.tsx). Personal page: noindex, follow.
import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { qbankMeta } from "@/components/learn/qbank/meta";
import { QbankBookmarks } from "@/components/learn/qbank/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = qbankMeta(locale, "bookmarks");
  return { ...pageMeta(locale, "/exams/bookmarks", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QbankBookmarks />;
}
