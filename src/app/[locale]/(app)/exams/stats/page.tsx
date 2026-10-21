// /exams/stats – statistics of the centre (mirrors mobile/src/app/exams/stats.tsx). Personal page: noindex, follow.
import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { qbankMeta } from "@/components/learn/qbank/meta";
import { QbankStats } from "@/components/learn/qbank/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = qbankMeta(locale, "stats");
  return { ...pageMeta(locale, "/exams/stats", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QbankStats />;
}
