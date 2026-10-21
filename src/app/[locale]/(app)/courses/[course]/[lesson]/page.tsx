import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { lessonWord, nameWord, withSuffix } from "@/components/learn/courses/meta";
import { catalogLesson, excerpt, txs } from "@/lib/learn/courses/catalog";
import LessonScreen from "@/components/learn/courses/LessonScreen";

type P = { params: Promise<{ locale: string; course: string; lesson: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, course, lesson } = await params;
  const f = catalogLesson(course, lesson);
  if (!f) return {};
  const courseTitle = txs(f.course.title, locale);
  const path = `/courses/${f.course.id}/${f.lesson.id}`;
  if (!f.lesson.title || !f.lesson.body) {
    // the Names of Allah lessons are built in the browser from the library list: thin on the server, so not indexed
    const m = pageMeta(locale, path, withSuffix(`${nameWord(locale)} ${f.index + 1} – ${courseTitle}`), txs(f.course.lead, locale));
    return { ...m, robots: { index: false, follow: true } };
  }
  const title = txs(f.lesson.title, locale);
  return pageMeta(locale, path, withSuffix(`${title} – ${courseTitle}`), excerpt(txs(f.lesson.body, locale)) || `${lessonWord(locale)} ${f.index + 1}: ${title}`);
}

export default async function CourseLessonPage({ params }: P) {
  const { locale, course, lesson } = await params;
  setRequestLocale(locale);
  const f = catalogLesson(course, lesson);
  if (!f) notFound();
  return <LessonScreen courseId={f.course.id} lessonId={f.lesson.id} />;
}
