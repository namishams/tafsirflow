"use client";
// mirrors Shams2Entry of mobile/src/features/shams2/Hub.tsx: Shams Method 2.0 on a dark stage card (for the Shams page,
// the Masterclass hub and the menu); after hydration it shows today's wird and the grade.
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { useShams2 } from "@/lib/learn/shams2/model";
import { useS2 } from "@/lib/learn/shams2/text";
import { StarGlyph } from "@/components/art/HomeOrnaments";

function Today() {
  const { s, nf } = useS2();
  const { wird, grade } = useShams2();
  return <span className="text-[13px] font-semibold text-[rgb(var(--gold))]">{`${s("entryToday", { a: nf(wird.sabaq.verses), b: nf(wird.sabqi.verses), c: nf(wird.manzil.verses) })} · ${grade.tr}`}</span>;
}

export function Shams2EntryCard({ className = "" }: { className?: string }) {
  const { s } = useS2();
  const hydrated = useHydrated();
  return (
    <Link href="/shams/method" className={`stage girih relative grid gap-2.5 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white sm:p-6 ${className}`}>
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={11} />{s("eyebrow")}</span>
        <span lang="ar" className="font-arabic text-[22px] text-[rgb(var(--gold))]">مَنْهَج شَمْس</span>
      </span>
      <span className="font-display text-[28px] leading-tight">{s("hubTitle")}</span>
      <span className="text-[14.5px] leading-relaxed text-white/70">{s("entryLead")}</span>
      {hydrated && <Today />}
      <span className="btn-gold mt-2 inline-flex h-10 w-fit items-center rounded-full px-4 text-sm font-bold">{s("openWird", { m: "" }).replace(/\s*\(.*\)\s*$/, "") || s("hubTitle")}</span>
    </Link>
  );
}
export default Shams2EntryCard;
