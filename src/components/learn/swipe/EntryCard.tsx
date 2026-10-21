"use client";
// mirrors SwipeEntryCard of mobile/src/features/swipe/EntryCard.tsx: Swipe & Learn on a dark card with today's count,
// the streak and the due review cards.
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { useIntl } from "@/lib/learn/srs/format";
import { useDueCount } from "@/lib/learn/srs/store";
import { STREAK_MIN, swipeStreak, useSwipeStats } from "@/lib/learn/swipe/store";
import { SWIPE_DEFAULTS } from "@/lib/learn/swipe/config";
import { useSwipeT } from "@/lib/learn/swipe/texts";

export function SwipeEntryCard() {
  const st = useSwipeT();
  const nf = useIntl();
  const hydrated = useHydrated();
  const s = useSwipeStats();
  const due = useDueCount();
  const streak = hydrated ? swipeStreak(s) : 0;
  const chips = [
    { text: st("entryToday", { n: nf(hydrated ? s.today : 0) }), on: hydrated && s.today >= STREAK_MIN },
    { text: st("entryStreak", { n: nf(streak) }), on: streak > 0 },
    ...(hydrated && due ? [{ text: st("entryDue", { n: nf(due) }), on: true }] : []),
  ];
  return (
    <Link href="/swipe" className="stage girih group relative grid gap-3 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white">
      <span className="relative flex items-start gap-4">
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold tracking-[0.12em] text-[rgb(var(--gold))] rtl:tracking-normal">{st("kicker")}</span>
          <span className="font-display mt-1.5 block text-[24px] leading-tight">{st("title")}</span>
        </span>
        <span aria-hidden className="relative block h-[78px] w-[66px] shrink-0">
          {[2, 1, 0].map((i) => (
            <span key={i} className="absolute grid h-[70px] w-[52px] place-items-center rounded-[9px] border border-[rgb(214,180,108)]"
              style={{ top: i * 4, left: i * 5, background: i ? "rgba(8,38,29,0.9)" : "rgb(11,54,40)", transform: `rotate(${i === 0 ? -9 : i === 1 ? -2 : 5}deg)` }}>
              {i === 0 ? <span lang="ar" className="font-arabic text-[22px] text-[#f3e2b6]">عِلْم</span> : null}
            </span>
          ))}
        </span>
      </span>
      <span className="relative block text-[14.5px] leading-relaxed text-white/75">{st("entryLead", { n: nf(SWIPE_DEFAULTS.minSeconds) })}</span>
      <span className="relative flex flex-wrap gap-2">
        {chips.map((c) => <span key={c.text} className={`rounded-full border px-3 py-1 text-[12.5px] font-semibold ${c.on ? "border-[rgb(214,180,108)]/50 text-[#f3e2b6]" : "border-white/15 text-white/60"}`}>{c.text}</span>)}
      </span>
      <span className="relative mt-1 grid h-12 place-items-center rounded-full text-[15px] font-bold" style={{ background: "linear-gradient(180deg,#dcc48c,#c6a65e)", color: "rgb(8,38,29)" }}>{st("start")}</span>
    </Link>
  );
}
