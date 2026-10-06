import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GUIDES, guideText } from "@/lib/guides";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides" });
  return pageMeta(locale, "/guides", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

export default async function GuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guides");
  const de = locale === "de";
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <ul className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
        {GUIDES.map((g) => (
          <li key={g.slug} className="bg-surface">
            <Link href={`/guides/${g.slug}`} className="block p-5 hover:bg-bg">
              <span className="block text-[18px] font-bold leading-snug">{guideText(g, locale).title}</span>
              <span className="mt-1 block text-[15px] text-muted">{guideText(g, locale).desc}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
