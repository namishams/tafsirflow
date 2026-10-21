import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/haramain/meta";
import { HARAMAIN_COURSE } from "@/lib/learn/haramain/lessons";
import { HaramainLesson } from "@/components/learn/haramain/Pages";

export function generateStaticParams() {
  return HARAMAIN_COURSE.lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const m = metaFor(locale, "lesson", id);
  return m ? pageMeta(locale, `/haramain/lesson/${id}`, m.title, m.description) : {};
}

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!HARAMAIN_COURSE.lessons.some((l) => l.id === id)) notFound();
  return <HaramainLesson id={id} />;
}
