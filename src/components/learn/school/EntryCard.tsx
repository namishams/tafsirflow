"use client";
// mirrors SchoolEntryCard of mobile/src/features/school/Screens.tsx: the Madrasa on a dark card with the current stage.
import { useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useStoreVersion } from "@/lib/learn/store";
import { useSchoolT } from "@/lib/learn/school/texts";
import { currentStage, stageState } from "@/lib/learn/school/model";
import { Bar } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";

export function SchoolEntryCard() {
  const st = useSchoolT();
  const v = useStoreVersion();
  const s = useMemo(() => (v < 0 ? null : stageState(currentStage())), [v]);
  return (
    <Link href="/school" className="stage girih group relative grid gap-2.5 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white sm:p-6">
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={11} />{st("kicker")}</span>
        <span lang="ar" className="font-arabic text-[22px] text-[rgb(var(--gold))]">المدرسة</span>
      </span>
      <span className="font-display text-[28px] leading-tight">{st("title")}</span>
      <span className="text-[14.5px] leading-relaxed text-white/70">{st("entryLead")}</span>
      {s && (
        <span className="mt-1 grid gap-1.5">
          <span className="text-[13px] font-semibold text-[#f4ead2]">{`${st("yourStage")}: ${st(`stage_${s.id}`)} · ${st("stageProgress", { p: Math.round(s.done * 100) })}`}</span>
          <Bar value={s.done} gold />
        </span>
      )}
      <span className="btn-gold mt-2 inline-flex h-10 w-fit items-center rounded-full px-4 text-sm font-bold">{st("enter")}</span>
    </Link>
  );
}
