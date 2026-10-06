import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TAJWEED_LESSONS } from "@/lib/tajweed";
import { pageMeta } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tajweed" });
  return pageMeta(locale, "/tajweed", t("seoTitle"), t("seoDesc"), t("seoKeywords"));
}

export default async function TajweedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tajweed");
  const de = locale === "de";
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <h1 className="font-display text-[40px] leading-[1.05] sm:text-5xl">{t("title")}</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-muted">{t("lead")}</p>
      <ol className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
        {TAJWEED_LESSONS.map((l, i) => (
          <li key={l.id} className="bg-surface">
            <Link href={`/tajweed/${l.id}`} className="flex gap-4 p-5 hover:bg-bg">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-ink text-sm font-extrabold text-bg">{i + 1}</span>
              <span>
                <span className="block text-[17px] font-bold">{de ? l.title_de : l.title_en}</span>
                <span className="mt-1 block text-[15px] text-muted">{de ? l.summary_de : l.summary_en}</span>
                <span className="mt-1 block text-xs font-semibold text-gold">{t("levelN", { n: l.level })} · {t("quizN", { n: l.quiz.length })}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
