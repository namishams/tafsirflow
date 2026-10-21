"use client";
// mirrors SrsEntryCard of mobile/src/features/srs/EntryCard.tsx: "Review today: N cards" on a dark card, plus links to
// the Hifz tracker and the tests.
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { useIntl } from "@/lib/learn/srs/format";
import { useDueCount } from "@/lib/learn/srs/store";
import { useSrsT } from "@/lib/learn/srs/texts";
import { StarGlyph } from "@/components/art/HomeOrnaments";

export function SrsEntryCard() {
  const st = useSrsT();
  const nf = useIntl();
  const hydrated = useHydrated();
  const n = useDueCount();
  return (
    <div className="grid gap-2.5">
      <Link href="/cards" className="stage girih group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white">
        <span className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 ${hydrated && n ? "border-[rgb(var(--gold))]" : "border-white/20"}`}>
          <span className="font-display text-[19px] tabular-nums text-[#f4ead2]">{hydrated ? nf(n) : "–"}</span>
        </span>
        <span className="relative min-w-0 flex-1">
          <span className="block text-[17px] font-bold leading-snug">{hydrated && n ? st("reviewToday", { n: nf(n) }) : hydrated ? st("reviewNone") : st("title")}</span>
          <span className="mt-0.5 block text-[13px] text-white/60">{st("title")}</span>
        </span>
        <span aria-hidden className="relative text-lg font-bold text-[rgb(var(--gold))] rtl:-scale-x-100">›</span>
      </Link>
      <div className="grid grid-cols-2 gap-2.5">
        {([["hifz", "/cards/hifz"], ["tests", "/tests"]] as const).map(([k, href]) => (
          <Link key={k} href={href} className="flex items-center gap-2 rounded-xl border border-line bg-surface p-3.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
            <StarGlyph size={13} className="shrink-0 text-[rgb(var(--hm-gold))]" />
            <span className="min-w-0 flex-1 text-[14.5px] font-bold">{st(k)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
