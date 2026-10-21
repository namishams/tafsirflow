import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { MASTERS, masterByKey } from "@/lib/learn/mishary/style";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { MasterStudyScreen } from "@/components/learn/mishary/StyleStudy";

// /mishary/masters/<key> – mirrors mobile/src/app/mishary/masters/[id].tsx: one master (phrases, pace and pauses,
// A/B recording, style notes). The masters list is static.
export function generateStaticParams() {
  return MASTERS.map((m) => ({ id: m.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const master = masterByKey(id);
  if (!master) return {};
  const m = misharyMeta(locale, "master", { t: master.name });
  return pageMeta(locale, `/mishary/masters/${id}`, m.title, m.description);
}

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!masterByKey(id)) notFound();
  return <MasterStudyScreen id={id} />;
}
