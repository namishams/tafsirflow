import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/courses/meta";
import TajweedPractice from "@/components/learn/courses/TajweedPractice";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "tajweed");
  return pageMeta(locale, "/tajweed/practice", m.title, m.description);
}

export default async function TajweedPracticePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TajweedPractice />;
}
