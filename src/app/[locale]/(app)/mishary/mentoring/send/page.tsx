import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { misharyMeta } from "@/components/learn/mishary/meta";
import { SendScreen } from "@/components/learn/mishary/Mentoring";

// /mishary/mentoring/send?mentor=<username> – mirrors mobile/src/app/mishary/mentoring/send.tsx: record 30–60 s and
// send it for review
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const m = misharyMeta(locale, "send");
  return { ...pageMeta(locale, "/mishary/mentoring/send", m.title, m.description), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ mentor?: string | string[] }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { mentor } = await searchParams;
  const m = (Array.isArray(mentor) ? mentor[0] : mentor ?? "").trim().toLowerCase();
  return <SendScreen mentor={/^[a-z0-9._-]{1,40}$/.test(m) ? m : ""} />;
}
