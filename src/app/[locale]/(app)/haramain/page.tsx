import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { metaFor } from "@/components/learn/haramain/meta";
import { courseJsonLd } from "@/components/learn/coursekit/meta";
import { HARAMAIN_COURSE } from "@/lib/learn/haramain/lessons";
import HaramainScreen from "@/components/learn/haramain/HaramainScreen";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "home")!;
  return pageMeta(locale, "/haramain", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = metaFor(locale, "home")!;
  return (
    <>
      <JsonLd data={courseJsonLd(locale, "/haramain", m.title.replace(/ \| Quran Masterclass$/, ""), m.description, HARAMAIN_COURSE.lessons)} />
      <HaramainScreen />
    </>
  );
}
