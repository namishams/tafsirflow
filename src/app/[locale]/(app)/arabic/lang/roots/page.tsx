import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { langMeta } from "@/components/learn/arabic-lang/meta";
import { RootExplorerScreen } from "@/components/learn/arabic-lang/Screens";

// /arabic/lang/roots – root explorer: a root and its family of words from the Quran vocabulary (?r= preselects a root)
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = langMeta(locale, "roots");
  return pageMeta(locale, "/arabic/lang/roots", m.title, m.description);
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ r?: string | string[] }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { r } = await searchParams;
  const initial = (Array.isArray(r) ? r[0] : r)?.slice(0, 20);
  return <RootExplorerScreen key={initial ?? ""} initial={initial} />;
}
