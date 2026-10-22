import { Suspense } from "react";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import SocialWeb, { type Chapters } from "@/components/together/SocialWeb";
import { getChapters } from "@/lib/quran";

// /together/social – "Together, deeper": khatm groups, live halaqa, weekly recap, mutashabihat duels, teacher classes,
// friends' milestones and the network (?v=hub|khatm|halaqa|recap|duel|class|profile&id=, read on the client).
// Signed in, 16+ with a profile; not indexed. Same endpoints and texts as the app (mobile/src/app/together/social.tsx).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const chapters: Chapters = await getChapters(locale).then((cs) => cs.map((c) => [c.id, c.name_simple, c.verses_count] as [number, string, number])).catch(() => []);
  return <Suspense fallback={null}><SocialWeb locale={locale} chapters={chapters} /></Suspense>;
}
