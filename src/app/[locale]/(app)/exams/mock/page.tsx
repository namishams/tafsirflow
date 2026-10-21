// /exams/mock – the mock exam of a stage (exam rules, server verdict when signed in) (mirrors mobile/src/app/exams/mock.tsx). Personal page: noindex, follow.
import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { qbankMeta } from "@/components/learn/qbank/meta";
import { QbankMock } from "@/components/learn/qbank/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = qbankMeta(locale, "mock");
  return { ...pageMeta(locale, "/exams/mock", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Suspense><QbankMock /></Suspense>;
}
