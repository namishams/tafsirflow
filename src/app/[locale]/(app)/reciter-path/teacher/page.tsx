import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { rpMeta } from "@/components/learn/reciter-path/meta";
import { TeacherPage } from "@/components/learn/reciter-path/Screens";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = rpMeta(locale, "teacher");
  return pageMeta(locale, "/reciter-path/teacher", m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TeacherPage />;
}
