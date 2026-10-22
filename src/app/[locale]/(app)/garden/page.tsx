// mirrors the route of mobile/src/features/garden/GardenScreen.tsx (app route /garden): the learner's tree and garden
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { gardenMeta } from "@/components/learn/garden/meta";
import AppOnly from "@/components/apppush/AppOnly";
import { appStoreUrl } from "@/lib/appstore";
import { GardenScreen } from "@/components/learn/garden/GardenScreen";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = gardenMeta(locale, "home");
  return pageMeta(locale, "/garden", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <><GardenScreen /><div className="mx-auto max-w-4xl px-4 pb-16"><AppOnly topics={["tree", "stickers", "celebrations"]} url={appStoreUrl()} /></div></>;
}
