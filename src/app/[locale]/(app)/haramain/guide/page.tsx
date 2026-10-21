import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/haramain/meta";
import HajjGuide from "@/components/learn/haramain/HajjGuide";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "guide")!;
  return pageMeta(locale, "/haramain/guide", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HajjGuide />;
}
