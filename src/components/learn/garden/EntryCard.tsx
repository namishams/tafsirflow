"use client";
// mirrors GardenWidget and SeedCard of mobile/src/features/garden/widgets.tsx: the learner's tree on a dark stage card
// (stage, progress, calendar wait), or the seed card before planting.
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { MAX_STAGE, activeTree, progressOf, resting, seasonNow, useGarden } from "@/lib/learn/garden/garden";
import { fillG, useAgeText, useGardenText } from "@/lib/learn/garden/texts";
import { useGardenPro, useGardenWebText } from "@/lib/learn/garden/web";
import { StarGlyph } from "@/components/art/HomeOrnaments";
import { Bar } from "@/components/learn/ui";
import { TreeArt } from "./Tree";

export function GardenEntryCard({ className = "" }: { className?: string }) {
  const tx = useGardenText();
  const wt = useGardenWebText();
  const ageTx = useAgeText();
  const hydrated = useHydrated();
  const s = useGarden();
  const pro = useGardenPro();
  const tree = hydrated ? activeTree(s, pro) : null;
  const p = tree ? progressOf(tree, pro) : null;
  return (
    <Link href="/garden" className={`stage girih relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/45 p-5 text-white sm:p-6 ${className}`}>
      <span className="shrink-0">
        {tree && p ? <TreeArt id={tree.id} type={tree.type} stage={p.stage} traits={s.traits} season={seasonNow()} resting={resting(s)} fruits={tree.fruits} size={96} still />
          : <TreeArt id="seed" type="olive" stage={0} size={80} still />}
      </span>
      <span className="grid min-w-0 flex-1 gap-1.5">
        <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><StarGlyph size={11} />{tree ? tx.title : tx.missionKicker}</span>
        {tree && p ? (
          <>
            <span className="font-display truncate text-[22px] leading-tight">{tree.name || tx[`t_${tree.type}`]}</span>
            <span className="text-[13.5px] text-white/75">{tx[`s${p.stage}` as "s0"]} · {fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}</span>
            <Bar value={p.frac} gold label={tx.growth} />
            <span className="text-[12.5px] text-white/60">{p.held ? wt.heldWeb : p.left ? fillG(tx.next, { n: p.left }) : p.wait ? ageTx(p.age, p.wait).wait : tx.maxed}</span>
            {tree.fruits > 0 ? <span className="text-[12.5px] font-semibold text-[#f3b14a]">{fillG(tx.fruitsReady, { n: tree.fruits })}</span> : null}
          </>
        ) : (
          <>
            <span className="font-display text-[22px] leading-tight">{tx.seedTitle}</span>
            <span className="text-[14px] leading-relaxed text-white/70">{tx.seedLead}</span>
            <span className="btn-gold mt-1 inline-flex h-10 w-fit items-center rounded-full px-4 text-sm font-bold">{tx.plant}</span>
          </>
        )}
      </span>
    </Link>
  );
}
export default GardenEntryCard;
