// /exams – the examination centre (mirrors mobile/src/app/exams/index.tsx). Free on the website.
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { qbankMeta } from "@/components/learn/qbank/meta";
import { QbankHome } from "@/components/learn/qbank/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = qbankMeta(locale, "home");
  return pageMeta(locale, "/exams", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <QbankHome />;
}
