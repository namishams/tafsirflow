"use client";
// Entry card for the hub (/masterclass) and nav: mirrors CoursesEntry in mobile/src/features/courses/Screens.tsx.
import { Bar, CardLink, Kicker } from "@/components/learn/ui";
import { ArrowNext } from "@/components/Icons";
import { formatNumber, useLang } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { COURSES } from "@/lib/learn/courses";
import { useCP } from "@/lib/learn/courses/progress";
import { useCT } from "@/lib/learn/courses/texts";

export function CoursesEntryCard({ className = "" }: { className?: string }) {
  const c = useCT();
  const { lang } = useLang();
  const p = useCP();
  const ready = useHydrated();
  const n = COURSES.filter((x) => p.complete[x.id]).length;
  return (
    <CardLink href="/courses" className={className}>
      <Kicker>{c("coursesKicker")}</Kicker>
      <span className="mt-1 block text-lg font-bold">{c("coursesTitle")}</span>
      <span className="mt-1 block text-[14.5px] leading-relaxed text-muted">{c("coursesCard")}</span>
      <span className="mt-4 block"><Bar value={ready ? n / COURSES.length : 0} gold label={`${n}/${COURSES.length}`} /></span>
      <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent">
        {formatNumber(ready ? n : 0, lang)}/{formatNumber(COURSES.length, lang)} <ArrowNext />
      </span>
    </CardLink>
  );
}

export default CoursesEntryCard;
