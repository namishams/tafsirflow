import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { SCHOOL_STAGE_IDS, schoolMeta } from "@/components/learn/school/meta";
import { StageScreen } from "@/components/learn/school/Screens";
import type { StageId } from "@/lib/learn/school/model";

export function generateStaticParams() {
  return SCHOOL_STAGE_IDS.map((stage) => ({ stage }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; stage: string }> }): Promise<Metadata> {
  const { locale, stage } = await params;
  if (!SCHOOL_STAGE_IDS.includes(stage)) return {};
  const m = schoolMeta(locale, "stage", stage);
  return pageMeta(locale, `/school/${stage}`, m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string; stage: string }> }) {
  const { locale, stage } = await params;
  setRequestLocale(locale);
  if (!SCHOOL_STAGE_IDS.includes(stage)) notFound();
  return <StageScreen id={stage as StageId} />;
}
