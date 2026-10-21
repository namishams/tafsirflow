"use client";
// mirrors JourneyEntryCard of mobile/src/features/journey/JourneyScreen.tsx: Riḥlat al-ʿIlm on a dark card, with the
// learner's Marḥala, level and progress toward the next Marḥala once the stored progress is read (after hydration).
import { Link } from "@/i18n/navigation";
import { formatNumber, useLang } from "@/lib/learn/i18n";
import { useJourneyData } from "@/lib/learn/journey/hooks";
import { fracOf, marhala, marhalaPoints } from "@/lib/learn/journey/marahil";
import { useJT, type JKey } from "@/lib/learn/journey/texts";
import { Bar } from "@/components/learn/ui";
import { StarGlyph } from "@/components/art/HomeOrnaments";

export function JourneyEntryCard({ className = "" }: { className?: string }) {
  const jt = useJT();
  const { lang } = useLang();
  const { M, current, ready } = useJourneyData();
  const mt = (m: number) => (m <= 7 ? jt(`mh_${m}` as JKey) : jt("mh_n", { n: m }));
  const cur = marhala(current, M);
  const pts = marhalaPoints(cur);
  return (
    <Link href="/journey" aria-label={ready ? `${jt("title")}: ${jt("marhalaN", { n: current })}, ${mt(current)}` : undefined}
      className={`stage girih relative grid gap-2.5 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white sm:p-6 ${className}`}>
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold tracking-[0.08em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={11} />{jt("eyebrow")}</span>
        <span lang="ar" dir="rtl" className="font-arabic text-[22px] text-[rgb(var(--gold))]">رحلة العلم</span>
      </span>
      <span className="font-display text-[28px] leading-tight">{jt("title")}</span>
      <span className="text-[14.5px] leading-relaxed text-white/70">{jt("entryLead")}</span>
      {ready ? (
        <span className="mt-1 grid gap-1.5">
          <span className="text-[13.5px] font-semibold text-[#f3e2b6]">{`${jt("marhalaN", { n: formatNumber(current, lang) })} · ${mt(current)} · ${jt("levelN", { n: formatNumber(M.rank.level, lang) })}`}</span>
          <span className="text-[12.5px] text-white/60">{jt("towardNext", { a: formatNumber(pts[0], lang), b: formatNumber(pts[1], lang), n: current + 1 })}</span>
          <Bar value={fracOf(cur)} gold />
        </span>
      ) : null}
      <span className="mt-2 inline-flex h-10 w-fit items-center rounded-full border border-[rgb(var(--gold))] px-4 text-sm font-bold text-[rgb(var(--gold))]">{jt("openMap")}</span>
    </Link>
  );
}
export default JourneyEntryCard;
