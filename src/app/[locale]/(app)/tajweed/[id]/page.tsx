import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import TajweedQuiz from "@/components/TajweedQuiz";
import { TAJWEED_LESSONS, tajweedFor } from "@/lib/tajweed";
import { pageMeta } from "@/lib/site";
import { ArrowNext, ArrowBack } from "@/components/Icons";
import { PracticeStarNum, PracticeWindow } from "@/components/art/PracticeArt";

export function generateStaticParams() {
  return TAJWEED_LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const l = tajweedFor(locale).find((x) => x.id === id);
  if (!l) return {};
  const de = locale === "de";
  return pageMeta(locale, `/tajweed/${id}`, `${de ? l.title_de : l.title_en} – ${locale === "ar" ? "التجويد" : "Tajweed"} | Quran Masterclass`, de ? l.summary_de : l.summary_en);
}

export default async function TajweedLesson({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const i = TAJWEED_LESSONS.findIndex((x) => x.id === id);
  if (i < 0) notFound();
  const LS = tajweedFor(locale);
  const l = LS[i], next = LS[i + 1], prev = LS[i - 1];
  const t = await getTranslations("tajweed");
  const de = locale === "de";
  return (
    <div>
      <section className="stage girih relative overflow-hidden text-[#eef0f3]">
        <PracticeWindow uid="tajl-m" word="تجويد" className="absolute -end-10 top-4 h-[220px] w-auto opacity-25 md:-end-2 md:h-[260px] md:opacity-60" />
        <div className="relative mx-auto max-w-3xl px-5 pb-12 pt-8 sm:pb-14">
          <Link href="/tajweed" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"><ArrowBack /> {t("title")}</Link>
          <div className="mt-4 flex items-center gap-4">
            <PracticeStarNum n={i + 1} size={58} filled className="text-[19px]" />
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("lessonN", { n: i + 1, total: TAJWEED_LESSONS.length })}</p>
          </div>
          <h1 className="font-display mt-4 max-w-2xl text-4xl leading-tight sm:text-5xl">{de ? l.title_de : l.title_en}</h1>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-white/70">{de ? l.summary_de : l.summary_en}</p>
        </div>
        <div className="pa-arcade" />
      </section>
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-5">
        <article className="pa-paper px-5 pb-6 pt-4 sm:px-8"><div className="relative"><Markdown text={de ? l.body_de : l.body_en} /></div></article>
        {l.examples.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-3xl">{t("examples")}</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {l.examples.map((e, n) => (
                <li key={n} className="pa-card flex flex-col p-5 pt-6">
                  <p className="font-arabic text-center text-[30px] leading-[2] text-ink" dir="rtl" lang="ar">{e.ar}</p>
                  <p className="mt-2 flex-1 text-[15px] leading-relaxed text-muted">{de ? e.note_de : e.note_en}</p>
                  {e.key && <Link href={`/surah/${e.key.split(":")[0]}?v=${e.key.split(":")[1]}`} className="pa-chip mt-4 self-start text-accent">{t("listenIn", { key: e.key })} <ArrowNext /></Link>}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="mt-12">
          <h2 className="font-display text-3xl">{t("quiz")}</h2>
          <TajweedQuiz id={l.id} />
        </section>
        <nav className="mt-12 grid gap-3 border-t border-[rgb(var(--gold))]/25 pt-6 text-sm font-bold sm:grid-cols-2">
          {prev ? <Link href={`/tajweed/${prev.id}`} className="pa-card pa-plain pa-card-hover flex items-center gap-2 p-4 text-muted hover:text-ink"><ArrowBack /> <span className="min-w-0">{de ? prev.title_de : prev.title_en}</span></Link> : <span />}
          {next && <Link href={`/tajweed/${next.id}`} className="pa-card pa-plain pa-card-hover flex items-center justify-end gap-2 p-4 text-end text-accent"><span className="min-w-0">{de ? next.title_de : next.title_en}</span> <ArrowNext /></Link>}
        </nav>
      </main>
    </div>
  );
}
