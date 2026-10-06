import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMeta(locale, "/about", t("seoTitle"), t("seoDesc"));
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const ld = { "@context": "https://schema.org", "@type": "AboutPage", url: abs(`/${locale}/about`), mainEntity: { "@type": "Organization", name: "Quran Masterclass", founder: { "@type": "Person", name: "Nami Shams" }, foundingLocation: "Dubai", url: abs("/") } };
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <JsonLd data={ld} />
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 className="font-display mt-2 text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-5 text-[18px] leading-relaxed text-muted">{t("lead")}</p>
      <article className="mt-4"><Markdown text={t("body")} /></article>
      <section className="mt-14 rounded-lg border border-line border-s-4 border-s-gold bg-surface p-6 sm:p-8">
        <p className="eyebrow text-gold">{t("dubaiEyebrow")}</p>
        <h2 className="font-display mt-2 text-3xl leading-tight">{t("dubaiTitle")}</h2>
        <div className="mt-2"><Markdown text={t("dubaiBody")} /></div>
      </section>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/shams" className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("ctaShams")}</Link>
        <Link href="/feedback" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm font-bold hover:border-ink">{t("ctaFeedback")}</Link>
      </div>
    </main>
  );
}
