import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { pageMeta } from "@/lib/site";
import { VERSE_COUNTS } from "@/lib/counts";
import { recMeta } from "@/lib/learn/shams2/rec/strings";
import { DrillScreen, type DrillMode } from "@/components/learn/shams2/Drill";
import { DaysGate } from "@/components/sisters/Sisters";

// /shams/drill?s=&v=&w=1,4&mode=word|phrase|link – word loop, phrase or transition drill (mirrors mobile/src/app/shams/drill.tsx).
// A tool page without own content: not indexed.
type SP = Promise<{ s?: string | string[]; v?: string | string[]; w?: string | string[]; mode?: string | string[] }>;
const one = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = recMeta(locale);
  return { ...pageMeta(locale, "/shams/drill", `${t.drillTitle} | Quran Masterclass`, t.drillLead), robots: { index: false, follow: true } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SP }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const p = await searchParams;
  // whole numbers inside the Quran: surah 1–114, verse 1 to the surah's last verse
  const s = Math.max(1, Math.min(114, Math.round(Number(one(p.s))) || 1));
  const v = Math.max(1, Math.min(VERSE_COUNTS[s - 1], Math.round(Number(one(p.v))) || 1));
  const words = (one(p.w) ?? "").split(",").map(Number).filter((x) => Number.isInteger(x) && x > 0).slice(0, 30);
  const m = one(p.mode);
  const mode: DrillMode = m === "link" || m === "phrase" || m === "word" ? m : words.length ? "word" : "phrase";
  return <DaysGate kind="recite"><DrillScreen key={`${s}:${v}:${mode}:${words.join(",")}`} surah={s} verse={v} words={words} mode={mode} /></DaysGate>;
}
