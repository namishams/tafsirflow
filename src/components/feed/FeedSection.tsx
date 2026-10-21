import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { loadWebFeed } from "@/lib/feedWeb/page";
import { loadFeedTexts } from "@/lib/feedWeb/loadTexts";
import { FeedTextsProvider } from "@/lib/feedWeb/useTexts";
import FeedPreview from "./FeedPreview";

/** feed preview on the home page: the newest cards (the same cards as the feed in the app) and a link to /feed */
export default async function FeedSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "feed" });
  const [page, texts] = await Promise.all([loadWebFeed(locale, { limit: 4 }), loadFeedTexts(locale)]);
  if (!page.items.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-5 sm:py-20">
      <div className="mx-auto mb-8 max-w-xl text-center">
        <p className="eyebrow">{t("kicker")}</p>
        <h2 className="font-display mt-3 text-3xl sm:text-4xl">{t("homeTitle")}</h2>
        <p className="mt-3 text-muted">{t("homeLead")}</p>
      </div>
      <FeedTextsProvider texts={texts}><FeedPreview locale={locale} page={{ items: page.items.slice(0, 4), nextCursor: null }} /></FeedTextsProvider>
      <div className="mt-8 text-center">
        <Link href="/feed" className="inline-flex h-12 items-center rounded-md bg-accent px-6 text-[15px] font-bold text-white transition hover:brightness-110">{t("more")}</Link>
      </div>
    </section>
  );
}
