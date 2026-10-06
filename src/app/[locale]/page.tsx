import { setRequestLocale, getTranslations } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import SurahBrowser from "@/components/SurahBrowser";
import { getChapters } from "@/lib/quran";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const chapters = await getChapters(locale);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
      <header className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-xl font-bold tracking-tight">{t("app.name")}</span>
          </div>
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{t("app.tagline")}</h1>
        <ul className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
          {["feature1", "feature2", "feature3"].map((k) => (
            <li key={k} className="rounded-full border border-line bg-surface px-3 py-1">✓ {t(`home.${k}`)}</li>
          ))}
        </ul>
      </header>
      <SurahBrowser chapters={chapters} />
    </main>
  );
}
