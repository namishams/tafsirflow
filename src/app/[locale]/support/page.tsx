import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Logo from "@/components/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SiteMenu from "@/components/SiteMenu";
import { pageMeta } from "@/lib/site";
import { Suspense } from "react";
import SupportZiina from "@/components/SupportZiina";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  return pageMeta(locale, "/support", `${t("title")} | Quran Masterclass`, t("lead"));
}

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("support");
  const tf = await getTranslations("free");
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5"><Logo size={28} /><span className="text-[15px] font-extrabold tracking-tight">Quran Masterclass</span></Link>
          <LanguageSwitcher /><SiteMenu />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-12">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">{t("title")}</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-muted">{t("lead")}</p>
        <p className="mt-5 rounded-lg border border-line border-s-4 border-s-gold bg-surface p-4 text-[15px] leading-relaxed"><b>{tf("title")}</b> {tf("body")}</p>
        <section className="mt-10">
          <h2 className="text-lg font-bold">{t("what")}</h2>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
            {["w1", "w2", "w3", "w4"].map((k) => <li key={k} className="bg-surface p-4 text-[15px]">{t(k)}</li>)}
          </ul>
        </section>
        <div className="mt-10"><Suspense><SupportZiina /></Suspense></div>
        <p className="mt-4 text-sm text-muted">{t("free")}</p>
        <p className="mt-12"><Link href="/" className="text-sm font-semibold text-accent">← {t("back")}</Link></p>
      </main>
    </div>
  );
}
