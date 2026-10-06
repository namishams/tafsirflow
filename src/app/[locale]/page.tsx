import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AccountLink from "@/components/AccountLink";
import KidsToggle from "@/components/KidsToggle";
import Logo from "@/components/Logo";
import { LOCALE_META } from "@/i18n/locales";

const FEATURES = [
  ["f1", "🎧"], ["f2", "✨"], ["f3", "📖"], ["f4", "🧠"], ["f5", "🧒"], ["f6", "🌍"],
] as const;

export default async function Landing({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();
  return (
    <div>
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="font-display text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </Link>
          <div className="flex items-center gap-2"><KidsToggle /><LanguageSwitcher /><AccountLink /></div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 pt-6">
          <div className="pattern relative overflow-hidden rounded-3xl hero-bg px-6 py-14 text-center text-white shadow-card sm:py-20">
            <p className="font-arabic text-4xl text-[#f3d9a0] sm:text-6xl" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <h1 className="mx-auto mt-6 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">{t("app.tagline")}</h1>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/quran" className="rounded-full bg-white px-7 py-3.5 text-base font-semibold text-[#064e3b] shadow-card transition hover:scale-[1.03]">▶ {t("landing.cta")}</Link>
              <Link href="/account" className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold backdrop-blur transition hover:bg-white/20">{t("landing.cta2")}</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="mb-8 text-center font-display text-3xl font-semibold">{t("landing.featuresTitle")}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([k, icon]) => (
              <li key={k} className="rounded-2xl border border-line bg-surface p-6 shadow-card">
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-2xl" aria-hidden>{icon}</span>
                <h3 className="font-display text-lg font-semibold">{t(`landing.${k}t`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`landing.${k}d`)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-surface py-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center font-display text-3xl font-semibold">{t("landing.howTitle")}</h2>
            <ol className="grid gap-8 sm:grid-cols-3">
              {["s1", "s2", "s3"].map((k, i) => (
                <li key={k} className="text-center">
                  <span className="relative mx-auto mb-4 grid h-14 w-14 place-items-center">
                    <span className="absolute inset-1.5 rotate-45 rounded-lg bg-accent" />
                    <span className="absolute inset-1.5 rounded-lg bg-accent" />
                    <span className="relative font-display text-xl font-semibold text-white">{i + 1}</span>
                  </span>
                  <h3 className="font-display text-xl font-semibold">{t(`landing.${k}t`)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`landing.${k}d`)}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <Link href="/quran" className="rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-card transition hover:opacity-90">{t("landing.openQuran")}</Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 text-center">
          <h2 className="mb-6 font-display text-3xl font-semibold">{t("landing.langsTitle")}</h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {Object.entries(LOCALE_META).map(([k, v]) => (
              <li key={k}><Link href="/" locale={k} className="inline-block rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium shadow-card hover:border-accent">{v.label}</Link></li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="border-t border-line py-8 text-center text-xs text-muted">
        <p className="mx-auto max-w-xl px-4">{t("landing.footer")}</p>
        <p className="mt-2">© {new Date().getFullYear()} TafsirFlow</p>
      </footer>
    </div>
  );
}
