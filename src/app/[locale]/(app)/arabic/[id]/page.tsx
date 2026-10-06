import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ArabicLesson from "@/components/ArabicLesson";
import RequireAccount from "@/components/RequireAccount";
import { LESSONS } from "@/lib/arabic";
import { pageMeta } from "@/lib/site";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const l = LESSONS.find((x) => x.id === id);
  if (!l) return {};
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const title = l.title[lang] ?? l.title.en;
  return { ...pageMeta(locale, `/arabic/${id}`, `${title} | Quran Masterclass`, l.goal[lang] ?? l.goal.en), robots: { index: false, follow: true } };
}

export default async function ArabicLessonPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const l = LESSONS.find((x) => x.id === id);
  if (!l) notFound();
  const lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-4">
      <RequireAccount feature={l.title[lang] ?? l.title.en}><ArabicLesson id={id} /></RequireAccount>
    </main>
  );
}
