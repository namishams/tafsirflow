import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { metaFor } from "@/components/learn/abrahamic/meta";
import { ABRAHAMIC_COURSE } from "@/lib/learn/abrahamic/lessons";
import { AbrahamicLesson } from "@/components/learn/abrahamic/Pages";

export function generateStaticParams() {
  return ABRAHAMIC_COURSE.lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const m = metaFor(locale, "lesson", id);
  return m ? pageMeta(locale, `/abrahamic/lesson/${id}`, m.title, m.description) : {};
}

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!ABRAHAMIC_COURSE.lessons.some((l) => l.id === id)) notFound();
  return <AbrahamicLesson id={id} />;
}
