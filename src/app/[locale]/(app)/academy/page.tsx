import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import AcademyHome from "@/components/AcademyHome";
import RequireAccount from "@/components/RequireAccount";
import { pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "academy" });
  return pageMeta(locale, "/academy", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

const MODULES = [
  { href: "/plan", key: "mPlan" },
  { href: "/shams", key: "mShams" },
  { href: "/tajweed", key: "mTajweed" },
  { href: "/vocab", key: "mVocab" },
  { href: "/khatm", key: "mKhatm" },
  { href: "/guides", key: "mGuides" },
  { href: "/duas", key: "mDuas" },
];

export default async function AcademyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("academy");
  return (
    <>
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 className="font-display mt-2 text-[40px] leading-[1.05] sm:text-6xl">{t("title")}</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <RequireAccount feature={t("title")}><AcademyHome /></RequireAccount>
      <section className="mt-12">
        <h2 className="text-xl font-bold">{t("modules")}</h2>
        <div className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="bg-surface p-5 hover:bg-bg">
              <span className="block text-[16px] font-bold">{t(`${m.key}`)}</span>
              <span className="mt-1 block text-sm text-muted">{t(`${m.key}D`)}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
    <MoreTiles keys={["shams", "arabic", "salah", "tajweed"]} />
    </>
  );
}
