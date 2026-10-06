import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AccountLink from "@/components/AccountLink";
import KidsToggle from "@/components/KidsToggle";
import Logo from "@/components/Logo";
import SurahBrowser from "@/components/SurahBrowser";
import { getChapters } from "@/lib/quran";

export const dynamic = "force-dynamic";

export default async function QuranPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  const chapters = await getChapters(locale);
  return (
    <main className="mx-auto max-w-3xl px-4 pb-20 pt-4">
      <header className="mb-4 flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size={34} />
          <span className="font-display text-xl font-semibold tracking-tight">{t("app.name")}</span>
        </Link>
        <div className="flex items-center gap-2"><KidsToggle /><LanguageSwitcher /><AccountLink /></div>
      </header>

      <section className="pattern relative overflow-hidden rounded-3xl hero-bg px-6 pb-14 pt-8 text-center text-white shadow-card">
        <p className="font-arabic text-4xl text-[#f3d9a0] sm:text-5xl" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        <h1 className="mx-auto mt-4 max-w-xl font-display text-2xl font-semibold leading-tight sm:text-3xl">{t("home.surahs")}</h1>
      </section>

      <div className="relative -mt-6 px-2">
        <SurahBrowser chapters={chapters} />
      </div>
    </main>
  );
}
