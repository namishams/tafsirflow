import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FeedStream from "@/components/feed/FeedStream";
import { loadFeed, storeButton } from "@/components/feed/FeedSection";
import { pageMeta } from "@/lib/site";

export const revalidate = 300; // the first page changes daily and with new posts

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feed" });
  return pageMeta(locale, "/feed", t("metaTitle"), t("metaDesc"));
}

export default async function FeedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feed");
  const { items, nextCursor } = await loadFeed(locale);
  return (
    <main className="px-4 py-10 sm:px-5 sm:py-14">
      <div className="mx-auto mb-8 max-w-xl">
        <p className="eyebrow">{t("kicker")}</p>
        <h1 className="font-display mt-2 text-3xl sm:text-4xl">{t("title")}</h1>
        <p className="mt-3 text-muted">{t("lead")}</p>
      </div>
      {items.length ? <FeedStream initial={items} cursor={nextCursor} endless storeButton={storeButton(locale)} />
        : <p className="mx-auto max-w-xl text-muted">{t("empty")}</p>}
    </main>
  );
}
