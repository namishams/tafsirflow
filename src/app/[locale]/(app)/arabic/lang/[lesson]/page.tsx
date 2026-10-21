import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { langLessonMeta } from "@/components/learn/arabic-lang/meta";
import { LangLessonScreen } from "@/components/learn/arabic-lang/Screens";

// /arabic/lang/[lesson] – one lesson or unit test of the language course (unit tests under the exam rules)
export async function generateMetadata({ params }: { params: Promise<{ locale: string; lesson: string }> }): Promise<Metadata> {
  const { locale, lesson } = await params;
  const m = langLessonMeta(locale, lesson);
  if (!m) return {};
  return { ...pageMeta(locale, `/arabic/lang/${lesson}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; lesson: string }> }) {
  const { locale, lesson } = await params;
  setRequestLocale(locale);
  if (!langLessonMeta(locale, lesson)) notFound();
  return <LangLessonScreen key={lesson} id={lesson} />;
}
