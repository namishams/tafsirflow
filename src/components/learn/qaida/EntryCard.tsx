"use client";
// Entry card of the reading course for the Masterclass hub and the Arabic pages (mirrors QaidaCard in
// mobile/src/features/qaida/Screens.tsx): links to /arabic/read and shows the progress through the twenty stages.
import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { STAGES } from "@/lib/learn/qaida/curriculum";
import { placedStages, stageState, useArabicCourse, useQaida } from "@/lib/learn/qaida/progress";
import { useQT } from "@/lib/learn/qaida/texts";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { useQW } from "./strings";

export function QaidaEntryCard({ className = "" }: { className?: string }) {
  const qt = useQT();
  const qw = useQW();
  const hydrated = useHydrated();
  const p = useQaida();
  const course = useArabicCourse();
  const placed = useMemo(() => placedStages(course), [course]);
  const started = hydrated && Object.keys(p.done).length > 0;
  const complete = hydrated ? STAGES.filter((s) => stageState(p, s, placed).complete).length : 0;
  return (
    <Link href="/arabic/read" aria-label={qt("title")}
      className={`stage group relative flex flex-col gap-2 overflow-hidden rounded-xl border border-[rgba(201,166,94,0.45)] p-5 text-white transition hover:border-[rgb(var(--gold))] ${className}`}>
      <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.17em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={12} />{qt("kicker")}</span>
      <span className="flex items-center gap-3">
        <span className="font-display flex-1 text-[26px] leading-[1.15]">{qt("title")}</span>
        <span aria-hidden lang="ar" dir="rtl" className="font-arabic text-[34px] leading-[1.8] text-[#f3e2b6]">ا ب ت</span>
      </span>
      <span className="text-[14.5px] leading-relaxed text-white/75">{qt("cardLead")}</span>
      {started ? (
        <span className="mt-1 flex items-center gap-3 text-[12.5px] text-white/70">
          <span className="hm-bar is-gold flex-1" aria-hidden><i style={{ width: `${Math.round((complete / STAGES.length) * 100)}%` }} /></span>
          <span className="tabular-nums">{complete}/{STAGES.length} {qw("stagesDone")}</span>
        </span>
      ) : null}
      <span className="btn-gold mt-2 inline-flex h-10 items-center self-start rounded-full px-4 text-sm font-bold">{started ? qt("continue") : qt("start")}</span>
    </Link>
  );
}

export default QaidaEntryCard;
