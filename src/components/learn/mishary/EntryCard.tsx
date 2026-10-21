"use client";
// mirrors MisharyCard of mobile/src/features/mishary/Home.tsx: the Mishary track on a dark stage card (for the Reciter
// Path page, LearnHub and navigation; wired in by the coordinator).
import { Link } from "@/i18n/navigation";
import { useMt } from "@/lib/learn/mishary/texts";
import { StarGlyph } from "@/components/art/HomeOrnaments";

export function MisharyEntryCard({ className = "" }: { className?: string }) {
  const mt = useMt();
  return (
    <Link href="/mishary" className={`stage girih relative grid gap-2.5 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white sm:p-6 ${className}`}>
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={11} />{mt("kicker")}</span>
        <span lang="ar" className="font-arabic text-[22px] text-[rgb(var(--gold))]">مقام</span>
      </span>
      <span className="font-display text-[28px] leading-tight">{mt("cardTitle")}</span>
      <span className="text-[14.5px] leading-relaxed text-white/70">{mt("cardLead")}</span>
      <span className="btn-gold mt-2 inline-flex h-10 w-fit items-center rounded-full px-4 text-sm font-bold">{mt("open")}</span>
    </Link>
  );
}
export default MisharyEntryCard;
