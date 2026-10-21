"use client";
// Hub card for /haramain, mirrors the app's HaramainCard (Discover tab) plus the course progress.
import { pick, useLang } from "@/lib/learn/i18n";
import { UI } from "@/lib/learn/haramain/content";
import { HARAMAIN_COURSE } from "@/lib/learn/haramain/lessons";
import { useCK } from "@/lib/learn/abrahamic/kit";
import { Bar, CardLink, Kicker } from "@/components/learn/ui";
import { useCourseCount } from "@/components/learn/coursekit/CourseKit";

export function HaramainEntryCard({ className = "" }: { className?: string }) {
  const { lang } = useLang();
  const { c } = useCK();
  const s = (k: string) => pick(UI[k], lang);
  const { n, m } = useCourseCount(HARAMAIN_COURSE);
  return (
    <CardLink href="/haramain" className={className}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Kicker>{s("eyebrow")}</Kicker>
          <h3 className="font-display mt-1.5 text-[20px] leading-snug">{s("title")}</h3>
        </div>
        <span lang="ar" dir="rtl" aria-hidden className="font-arabic shrink-0 text-[22px] text-[rgb(var(--hm-gold-d))]">الحرمان</span>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{s("card")}</p>
      <div className="mt-auto pt-4">
        <p className="text-[12.5px] text-muted">{c("progress", { n, m })}</p>
        <Bar value={n / m} gold className="mt-1.5" />
        <span className="mt-3 inline-flex text-sm font-semibold text-accent group-hover:underline">{s("open")} <span aria-hidden className="ms-1 rtl:-scale-x-100">→</span></span>
      </div>
    </CardLink>
  );
}
