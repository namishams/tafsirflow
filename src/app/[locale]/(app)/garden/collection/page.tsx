// mirrors the route of mobile/src/features/garden/Collection.tsx (app route /sticker-collection), read-only on the web
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { gardenMeta } from "@/components/learn/garden/meta";
import { Collection } from "@/components/learn/garden/Collection";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = gardenMeta(locale, "collection");
  return pageMeta(locale, "/garden/collection", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Collection />;
}
