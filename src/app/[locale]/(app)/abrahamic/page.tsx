import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import { metaFor } from "@/components/learn/abrahamic/meta";
import { courseJsonLd } from "@/components/learn/coursekit/meta";
import { ABRAHAMIC_COURSE } from "@/lib/learn/abrahamic/lessons";
import AbrahamicScreen from "@/components/learn/abrahamic/AbrahamicScreen";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = metaFor(locale, "home")!;
  return pageMeta(locale, "/abrahamic", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const m = metaFor(locale, "home")!;
  return (
    <>
      <JsonLd data={courseJsonLd(locale, "/abrahamic", m.title.replace(/ \| Quran Masterclass$/, ""), m.description, ABRAHAMIC_COURSE.lessons)} />
      <AbrahamicScreen />
    </>
  );
}
