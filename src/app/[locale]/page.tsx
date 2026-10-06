import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getChapters } from "@/lib/quran";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const chapters = await getChapters(locale);
  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("app.name")}</h1>
          <p className="text-stone-600">{t("app.tagline")}</p>
        </div>
        <LanguageSwitcher />
      </header>
      <h2 className="mb-2 text-lg font-semibold">{t("home.surahs")}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {chapters.map((c) => (
          <li key={c.id}>
            <Link href={`/surah/${c.id}`} className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2 hover:border-emerald-600">
              <span>
                <span className="mr-2 text-stone-500">{c.id}</span>
                {c.name_simple}
                <span className="block text-xs text-stone-500">{c.translated_name.name} · {c.verses_count} {t("home.verses")}</span>
              </span>
              <span className="font-arabic text-xl" dir="rtl">{c.name_arabic}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
