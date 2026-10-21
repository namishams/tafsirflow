import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { lessonMeta } from "@/components/learn/qaida/meta";
import QaidaLessonScreen from "@/components/learn/qaida/LessonScreen";

// /arabic/read/[lesson] – one lesson of the reading course, "review", or a surah lesson (juz-<n>, …)
export async function generateMetadata({ params }: { params: Promise<{ locale: string; lesson: string }> }): Promise<Metadata> {
  const { locale, lesson } = await params;
  const m = lessonMeta(locale, lesson);
  if (!m) return {};
  return { ...pageMeta(locale, `/arabic/read/${lesson}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function QaidaLessonPage({ params }: { params: Promise<{ locale: string; lesson: string }> }) {
  const { locale, lesson } = await params;
  setRequestLocale(locale);
  if (!lessonMeta(locale, lesson)) notFound();
  return <QaidaLessonScreen key={lesson} id={lesson} />;
}
