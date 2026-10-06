import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AccountLink from "@/components/AccountLink";
import KidsToggle from "@/components/KidsToggle";
import Logo from "@/components/Logo";
import SurahBrowser from "@/components/SurahBrowser";
import { getChapters } from "@/lib/quran";
import { pageMeta } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return pageMeta(locale, "/quran", t("quranTitle"), t("quranDesc"), t("keywords"));
}

export default async function QuranPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const chapters = await getChapters(locale);
  return (
    <main className="mx-auto w-full max-w-3xl min-w-0 px-4 pb-20 pt-4">
      <header className="mb-4 flex items-center justify-between gap-2">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <Logo size={34} />
          <span className="font-display text-xl font-semibold tracking-tight">{t("app.name")}</span>
        </Link>
        <div className="flex items-center gap-2"><KidsToggle /><LanguageSwitcher /><AccountLink /></div>
      </header>

      <section className="border-b border-line pb-8 pt-10">
        <p className="eyebrow">{t("app.name")}</p>
        <h1 className="font-display mt-3 text-5xl leading-none sm:text-6xl">{t("home.surahs")}</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">{t("seo.quranDesc")}</p>
      </section>

      <div className="pt-8">
        <SurahBrowser chapters={chapters} />
      </div>
    </main>
  );
}
