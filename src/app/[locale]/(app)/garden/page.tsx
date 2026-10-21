// mirrors the route of mobile/src/features/garden/GardenScreen.tsx (app route /garden): the learner's tree and garden
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { gardenMeta } from "@/components/learn/garden/meta";
import { GardenScreen } from "@/components/learn/garden/GardenScreen";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = gardenMeta(locale, "home");
  return pageMeta(locale, "/garden", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GardenScreen />;
}
