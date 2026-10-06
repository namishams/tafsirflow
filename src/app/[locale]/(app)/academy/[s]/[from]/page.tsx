import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import LessonRunner from "@/components/LessonRunner";
import { countOf } from "@/lib/counts";

export const metadata: Metadata = { robots: { index: false, follow: true } }; // lesson tests are app screens, not search pages

export default async function LessonPage({ params }: { params: Promise<{ locale: string; s: string; from: string }> }) {
  const { locale, s, from } = await params;
  setRequestLocale(locale);
  const n = Number(s), f = Number(from);
  if (!Number.isInteger(n) || n < 1 || n > 114 || !Number.isInteger(f) || f < 1 || f > countOf(n)) notFound();
  return <LessonRunner s={n} from={f} />;
}
