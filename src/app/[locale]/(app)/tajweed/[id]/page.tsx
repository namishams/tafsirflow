import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Markdown from "@/components/Markdown";
import TajweedQuiz from "@/components/TajweedQuiz";
import { TAJWEED_LESSONS } from "@/lib/tajweed";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return TAJWEED_LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const l = TAJWEED_LESSONS.find((x) => x.id === id);
  if (!l) return {};
  const de = locale === "de";
  return pageMeta(locale, `/tajweed/${id}`, `${de ? l.title_de : l.title_en} – Tajweed | Quran Masterclass`, de ? l.summary_de : l.summary_en);
}

export default async function TajweedLesson({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const i = TAJWEED_LESSONS.findIndex((x) => x.id === id);
  if (i < 0) notFound();
  const l = TAJWEED_LESSONS[i], next = TAJWEED_LESSONS[i + 1], prev = TAJWEED_LESSONS[i - 1];
  const t = await getTranslations("tajweed");
  const de = locale === "de";
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-8">
      <Link href="/tajweed" className="text-sm font-semibold text-muted hover:text-ink">← {t("title")}</Link>
      <p className="eyebrow mt-4">{t("lessonN", { n: i + 1, total: TAJWEED_LESSONS.length })}</p>
      <h1 className="font-display mt-2 text-4xl leading-tight sm:text-5xl">{de ? l.title_de : l.title_en}</h1>
      <p className="mt-3 text-[17px] text-muted">{de ? l.summary_de : l.summary_en}</p>
      <article className="mt-4"><Markdown text={de ? l.body_de : l.body_en} /></article>
      {l.examples.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">{t("examples")}</h2>
          <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
            {l.examples.map((e, n) => (
              <li key={n} className="bg-surface p-5">
                <p className="font-arabic text-3xl leading-[2]" dir="rtl">{e.ar}</p>
                <p className="mt-1 text-[15px] text-muted">{de ? e.note_de : e.note_en}</p>
                {e.key && <Link href={`/surah/${e.key.split(":")[0]}?v=${e.key.split(":")[1]}`} className="mt-2 inline-block text-sm font-bold text-accent hover:underline">{t("listenIn", { key: e.key })} →</Link>}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="mt-10">
        <h2 className="font-display text-2xl">{t("quiz")}</h2>
        <TajweedQuiz id={l.id} />
      </section>
      <nav className="mt-12 flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-sm font-bold">
        {prev ? <Link href={`/tajweed/${prev.id}`} className="text-muted hover:text-ink">← {de ? prev.title_de : prev.title_en}</Link> : <span />}
        {next && <Link href={`/tajweed/${next.id}`} className="text-accent hover:underline">{de ? next.title_de : next.title_en} →</Link>}
      </nav>
    </main>
  );
}
