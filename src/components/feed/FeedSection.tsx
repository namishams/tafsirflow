import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AppStoreButton, appShowcaseContent } from "@/components/AppShowcase";
import { feedPage } from "@/lib/feed";
import { resolveFeed, type WebFeedItem } from "@/lib/feed/resolve";
import { FEED_LOCALES, type FeedLocale } from "@/lib/feed/types";
import FeedStream from "./FeedStream";

export async function loadFeed(locale: string): Promise<{ items: WebFeedItem[]; nextCursor: string | null }> {
  const l = ((FEED_LOCALES as readonly string[]).includes(locale) ? locale : "en") as FeedLocale;
  try {
    const page = await feedPage({ locale: l, tradition: "all" }, null);
    return { items: await resolveFeed(page.items, l), nextCursor: page.nextCursor };
  } catch { return { items: [], nextCursor: null }; }
}

export const storeButton = (locale: string) => <AppStoreButton label={appShowcaseContent(locale).cta} />;

/** feed preview on the home page: the newest cards and a link to /feed */
export default async function FeedSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "feed" });
  const { items } = await loadFeed(locale);
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <p className="eyebrow">{t("kicker")}</p>
        <h2 className="font-display mt-3 text-3xl sm:text-4xl">{t("homeTitle")}</h2>
        <p className="mt-3 text-muted">{t("homeLead")}</p>
      </div>
      <FeedStream initial={items.slice(0, 4)} cursor={null} endless={false} storeButton={storeButton(locale)} />
      <div className="mt-8 text-center">
        <Link href="/feed" className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110">{t("more")}</Link>
      </div>
    </section>
  );
}
