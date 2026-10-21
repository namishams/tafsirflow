import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import raw from "@/lib/feed/config.json";
import { swipeConfigOf } from "@/lib/learn/swipe/config";
import { swipeMeta } from "@/components/learn/swipe/meta";
import SwipeLearn from "@/components/learn/swipe/SwipeLearn";

// /swipe – Swipe & Learn (mirrors the app's /swipe): a stack of learning cards, read for swipe.minSeconds, then to the left
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = swipeMeta(locale);
  return pageMeta(locale, "/swipe", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const config = swipeConfigOf((raw as { swipe?: Parameters<typeof swipeConfigOf>[0] }).swipe);
  return <main><SwipeLearn config={config} /></main>;
}
