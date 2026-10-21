import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { rpMeta } from "@/components/learn/reciter-path/meta";
import { ExamPage } from "@/components/learn/reciter-path/Screens";

const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= 10;
export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ level: String(i + 1) }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; level: string }> }): Promise<Metadata> {
  const { locale, level } = await params;
  if (!ok(Number(level))) return {};
  const m = rpMeta(locale, "exam", { n: Number(level) });
  return { ...pageMeta(locale, `/reciter-path/exam/${level}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; level: string }> }) {
  const { locale, level } = await params;
  setRequestLocale(locale);
  if (!ok(Number(level))) notFound();
  return <ExamPage level={Number(level)} />;
}
