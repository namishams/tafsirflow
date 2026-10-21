// /exams/session – a practice, timed, drill, daily, bookmark or repetition session (mirrors mobile/src/app/exams/session.tsx). Personal page: noindex, follow.
import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { qbankMeta } from "@/components/learn/qbank/meta";
import { QbankSession } from "@/components/learn/qbank/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = qbankMeta(locale, "session");
  return { ...pageMeta(locale, "/exams/session", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Suspense><QbankSession /></Suspense>;
}
