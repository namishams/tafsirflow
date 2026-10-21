import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import JsonLd from "@/components/JsonLd";
import { abs, pageMeta } from "@/lib/site";
import { withSuffix } from "@/components/learn/courses/meta";
import { CATALOG, catalogCourse, txs } from "@/lib/learn/courses/catalog";
import CourseScreen from "@/components/learn/courses/CourseScreen";

type P = { params: Promise<{ locale: string; course: string }> };

export function generateStaticParams() {
  return CATALOG.map((c) => ({ course: c.id }));
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { locale, course } = await params;
  const c = catalogCourse(course);
  if (!c) return {};
  return pageMeta(locale, `/courses/${c.id}`, withSuffix(txs(c.title, locale)), txs(c.lead, locale));
}

export default async function CoursePage({ params }: P) {
  const { locale, course } = await params;
  setRequestLocale(locale);
  const c = catalogCourse(course);
  if (!c) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: txs(c.title, locale),
    description: txs(c.lead, locale),
    url: abs(`/${locale}/courses/${c.id}`),
    inLanguage: locale,
    isAccessibleForFree: true,
    numberOfLessons: c.lessons.length,
    provider: { "@type": "Organization", name: "Quran Masterclass", sameAs: abs("") },
  };
  return (
    <>
      <JsonLd data={ld} />
      <CourseScreen id={c.id} />
    </>
  );
}
