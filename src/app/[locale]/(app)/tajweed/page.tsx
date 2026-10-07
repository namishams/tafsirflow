import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { tajweedFor } from "@/lib/tajweed";
import { pageMeta } from "@/lib/site";
import { MoreTiles } from "@/components/PosterTiles";
import { PracticeHero, PracticeStar, PracticeStarNum } from "@/components/art/PracticeArt";

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
  const LS = tajweedFor(locale);
  return (
    <>
    <PracticeHero uid="taj-h" word="تجويد" title={t("title")} lead={t("lead")} />
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-12 sm:px-5">
      <ol className="relative grid gap-4">
        <span aria-hidden className="pa-rail start-[27px] !top-8 !bottom-8" />
        {LS.map((l, i) => (
          <li key={l.id} className="relative">
            <Link href={`/tajweed/${l.id}`} className="pa-card pa-plain pa-card-hover group flex items-start gap-4 p-4 sm:p-5">
              <PracticeStarNum n={i + 1} size={56} className="text-[18px]" />
              <span className="min-w-0 flex-1">
                <span className="block text-[17px] font-bold leading-snug group-hover:text-accent">{de ? l.title_de : l.title_en}</span>
                <span className="mt-1 block text-[15px] leading-relaxed text-muted">{de ? l.summary_de : l.summary_en}</span>
                <span className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gold">
                  <span className="inline-flex items-center gap-1">{Array.from({ length: 3 }, (_, k) => <PracticeStar key={k} size={9} className={k < l.level ? "" : "opacity-25"} />)}</span>
                  {t("levelN", { n: l.level })} · {t("quizN", { n: l.quiz.length })}
                </span>
              </span>
              {l.examples[0] && <span className="font-arabic hidden shrink-0 self-center text-[30px] leading-[1.6] text-gold/80 sm:block" dir="rtl" lang="ar">{l.examples[0].ar.split(" ").slice(0, 2).join(" ")}</span>}
            </Link>
          </li>
        ))}
      </ol>
    </main>
    <MoreTiles keys={["arabic", "vocab", "salah", "shams"]} />
    </>
  );
}
