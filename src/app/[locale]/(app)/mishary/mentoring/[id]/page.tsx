import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { SubmissionScreen } from "@/components/learn/mishary/Mentoring";

// /mishary/mentoring/<id> – mirrors mobile/src/app/mishary/mentoring/[id].tsx: one recording with its feedback (also
// season entries for the jury). Private, loaded in the browser with the session cookie.
export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }): Promise<Metadata> {
  const { locale, id } = await params;
  const m = misharyMeta(locale, "submission");
  return { ...pageMeta(locale, `/mishary/mentoring/${id}`, m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (!/^\d{1,18}$/.test(id)) notFound();
  return <SubmissionScreen id={id} />;
}
