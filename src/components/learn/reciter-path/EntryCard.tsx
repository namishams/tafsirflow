"use client";
// mirrors ReciterPathCard of mobile/src/features/reciter-path/Screens.tsx: the Reciter Path on a dark card.
import { Link } from "@/i18n/navigation";
import { useRpT } from "@/lib/learn/reciter-path/texts";
import { useRpProgress } from "@/lib/learn/reciter-path/progress";
import { useHydrated } from "@/lib/learn/store";
import { StarGlyph } from "@/components/art/HomeOrnaments";

export function ReciterPathEntryCard({ className = "" }: { className?: string }) {
  const rt = useRpT();
  const p = useRpProgress();
  const started = useHydrated() && Object.keys(p.units).length > 0;
  return (
    <Link href="/reciter-path" className={`stage girih relative grid gap-2.5 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white sm:p-6 ${className}`}>
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={11} />{rt("kicker")}</span>
        <span lang="ar" className="font-arabic text-[22px] text-[rgb(var(--gold))]">ترتيل</span>
      </span>
      <span className="font-display text-[28px] leading-tight">{rt("title")}</span>
      <span className="text-[14.5px] leading-relaxed text-white/70">{rt("lead")}</span>
      <span className="btn-gold mt-2 inline-flex h-10 w-fit items-center rounded-full px-4 text-sm font-bold">{started ? rt("continue") : rt("start")}</span>
    </Link>
  );
}
export default ReciterPathEntryCard;
