import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getChapters } from "@/lib/quran";
import { pageMeta } from "@/lib/site";
import { s2Meta } from "@/components/learn/shams2/meta";
import { MutashabihatScreen } from "@/components/learn/shams2/Mutashabihat";
import type { NameRow } from "@/components/learn/shams2/ui";

// /shams/mutashabihat?g= – similar verses trainer (g: a group id or "due") (mirrors mobile/src/app/shams/mutashabihat.tsx); surah names from the server
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = s2Meta(locale, "mutashabihat");
  return pageMeta(locale, "/shams/mutashabihat", m.title, m.description);
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ g?: string | string[] }> }) {
  const { locale } = await params;
  const g = (await searchParams).g;
  setRequestLocale(locale);
  const names: NameRow[] = await getChapters(locale).then((cs) => cs.map((c) => [c.id, c.name_simple, c.name_arabic] as NameRow)).catch(() => []);
  return <MutashabihatScreen names={names} initial={typeof g === "string" && g ? g.slice(0, 40) : undefined} />;
}
