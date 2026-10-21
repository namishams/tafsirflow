import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchView from "@/components/SearchView";
import { pageMeta } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import { tpText } from "@/lib/talentsProfileWeb";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { ...pageMeta(locale, "/search", t("title"), t("title")), robots: { index: false, follow: true } };
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const nav = await getTranslations({ locale, namespace: "nav" });
  const t = tpText(locale);
  // owner 21.10.2026 (app and website 1:1): the Quran search sits next to the account search (Accounts · Top)
  const pill = "inline-flex h-9 items-center rounded-full px-4 text-[14px] font-semibold";
  return (
    <>
      <nav aria-label={t.searchLabel} className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 pt-4 sm:px-6">
        <span aria-current="page" className={`${pill} bg-ink text-bg`}>{nav("quran")}</span>
        <Link href="/talents/search" className={`${pill} border border-line hover:bg-surface`}>{t.tabAccounts}</Link>
        <Link href="/talents/search?tab=top" className={`${pill} border border-line hover:bg-surface`}>{t.tabTop}</Link>
      </nav>
      <SearchView />
    </>
  );
}
