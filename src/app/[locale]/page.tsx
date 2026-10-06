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
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="font-display text-xl font-semibold tracking-tight">{t("app.name")}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <section className="pattern relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#0a3a30] px-6 pb-14 pt-10 text-center text-white shadow-card">
        <p className="font-arabic text-4xl text-[#f3d9a0] sm:text-5xl" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        <h1 className="mx-auto mt-5 max-w-xl font-display text-3xl font-semibold leading-tight sm:text-4xl">{t("app.tagline")}</h1>
        <ul className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
          {["feature1", "feature2", "feature3"].map((k) => (
            <li key={k} className="rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 backdrop-blur">✓ {t(`home.${k}`)}</li>
          ))}
        </ul>
      </section>

      <div className="relative -mt-6 px-2">
        <SurahBrowser chapters={chapters} />
      </div>
    </main>
  );
}
