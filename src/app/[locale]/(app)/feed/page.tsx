import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FeedApp from "@/components/feed/FeedApp";
import { loadFeedTexts } from "@/lib/feedWeb/loadTexts";
import { loadWebFeed } from "@/lib/feedWeb/page";
import { FeedTextsProvider } from "@/lib/feedWeb/useTexts";
import { pageMeta } from "@/lib/site";

export const revalidate = 300; // the first page changes daily and with new posts

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "feed" });
  return pageMeta(locale, "/feed", t("metaTitle"), t("metaDesc"));
}

// The Quran Feed like the app's Feed tab: Home, Reels, Explore; an endless stream from the server corpus
export default async function FeedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("feed");
  const [texts, page] = await Promise.all([loadFeedTexts(locale), loadWebFeed(locale)]);
  return (
    <main>
      <h1 className="sr-only">{t("title")}</h1>
      <p className="sr-only">{t("lead")}</p>
      <FeedTextsProvider texts={texts}>
        <FeedApp locale={locale} initial={page.items.length ? page : null} />
      </FeedTextsProvider>
    </main>
  );
}
