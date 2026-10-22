"use client";
// mirrors GardenEntry and SeedEntry of mobile/src/features/garden/EntryCard.tsx (redesign 22.10.2026): the learner's real
// tree in an arched niche of light, today's growth as drops, the stage, a ring to the next stage and a clear call to
// enter; the seed card before planting. The tree art (Tree.tsx) is frozen and only shown here. Gentle ambient motion
// (breathing light, rising motes), none under prefers-reduced-motion.
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { useHydrated } from "@/lib/learn/store";
import { dayNum } from "@/lib/learn/feed/statsStore";
import { MAX_STAGE, activeTree, progressOf, resting, seasonNow, useGarden, type Garden } from "@/lib/learn/garden/garden";
import { fillG, useAgeText, useGardenText } from "@/lib/learn/garden/texts";
import { useEntryText } from "@/lib/learn/garden/entryText";
import { useGardenPro, useGardenWebText } from "@/lib/learn/garden/web";
import { TreeArt } from "./Tree";

const GOLD = "#d6b46c", CREAM = "#f3e2b6";

/** growth points the tree received today (all sources) */
export function todayGrowth(s: Garden): number {
  const day = s.log?.[String(dayNum())];
  return day && typeof day === "object" ? Object.values(day).reduce<number>((a, b) => a + (b ?? 0), 0) : 0;
}

function useReduceMotion(): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOn(mq.matches);
    const f = (e: MediaQueryListEvent) => setOn(e.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return on;
}

const CSS = `
.ec-card { background: linear-gradient(160deg, #0f4a37 0%, #082a20 55%, #051b14 100%); }
.ec-card::before { content: ""; position: absolute; top: 0; left: 24px; right: 24px; height: 1px; background: rgb(246 231 191 / .35); }
.ec-sheen { position: absolute; top: -70px; inset-inline-end: -70px; width: 280px; height: 200px; border-radius: 50%; background: radial-gradient(closest-side, rgb(214 180 108 / .16), transparent); pointer-events: none; }
.ec-niche { position: relative; width: 132px; height: 170px; flex-shrink: 0; overflow: hidden; border: 1px solid rgb(214 180 108 / .5); border-radius: 66px 66px 10px 10px; background: linear-gradient(180deg, #174f3d, #0b3427 55%, #06241b); }
.ec-glow { position: absolute; left: -22px; top: 8px; width: 176px; height: 176px; border-radius: 50%; background: radial-gradient(closest-side, rgb(255 233 168 / .42), rgb(255 233 168 / .08) 60%, transparent); animation: ecBreath 5.6s ease-in-out infinite; }
.ec-mote { position: absolute; bottom: 22%; width: 3.5px; height: 3.5px; border-radius: 50%; background: #fff2c4; box-shadow: 0 0 6px #ffd98a; opacity: 0; animation: ecMote 5.2s linear infinite; }
@keyframes ecBreath { 0%, 100% { opacity: .6; transform: scale(.95); } 50% { opacity: 1; transform: scale(1.02); } }
@keyframes ecMote { 0% { opacity: 0; transform: translate(0, 0); } 25% { opacity: .85; transform: translate(4px, -26px); } 50% { opacity: .85; transform: translate(-3px, -52px); } 100% { opacity: 0; transform: translate(2px, -100px); } }
.ec-link:hover .ec-cta { filter: brightness(1.06); }
.ec-link:hover .ec-cta i { transform: translateX(3px); }
[dir="rtl"] .ec-link:hover .ec-cta i { transform: translateX(-3px) scaleX(-1); }
[dir="rtl"] .ec-cta i { transform: scaleX(-1); }
.ec-cta i { display: inline-block; transition: transform .2s ease; font-style: normal; }
@media (prefers-reduced-motion: reduce) { .ec-glow, .ec-mote { animation: none; } .ec-glow { opacity: .75; } .ec-link:hover .ec-cta i { transform: none; } }
`;

function Frame({ href, label, children, className }: { href: string; label: string; children: ReactNode; className: string }) {
  return (
    <Link href={href} aria-label={label} className={`ec-link ec-card relative block overflow-hidden rounded-[18px] border border-[rgb(214,180,108)]/45 p-4 text-white transition active:scale-[.985] sm:p-5 ${className}`}>
      <style>{CSS}</style>
      <span aria-hidden className="ec-sheen" />
      {children}
    </Link>
  );
}

function Kicker({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.17em] rtl:tracking-normal" style={{ color: GOLD }}>
      <svg aria-hidden width="9" height="9" viewBox="0 0 10 10"><path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill={GOLD} /></svg>{text}
    </span>
  );
}

function Niche({ children, motes }: { children: ReactNode; motes: boolean }) {
  return (
    <span aria-hidden className="ec-niche">
      <span className="ec-glow" />
      <svg className="absolute bottom-0 left-0" width="132" height="26" viewBox="0 0 132 26">
        <ellipse cx="66" cy="22" rx="56" ry="9" fill="rgba(2,16,11,0.55)" />
        <path d="M18 22 Q66 11 114 22" stroke="rgba(214,180,108,0.35)" strokeWidth="1" fill="none" />
      </svg>
      <span className="absolute inset-x-0 -bottom-1.5 flex justify-center">{children}</span>
      {motes ? [0.28, 0.66, 0.46].map((x, i) => <span key={i} className="ec-mote" style={{ left: `${x * 100}%`, animationDelay: `${i * 1.7}s` }} />) : null}
    </span>
  );
}

function Ring({ frac, label }: { frac: number; label: string }) {
  const size = 50, sw = 3.5, r = (size - sw) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac)), pct = Math.round(f * 100);
  return (
    <span role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={sw} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={GOLD} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={`${c * f} ${c}`} />
      </svg>
      <span className="text-[12.5px] font-bold" style={{ color: CREAM }}>{pct}<span className="text-[9px] text-white/60">%</span></span>
    </span>
  );
}

function Drops({ today }: { today: number }) {
  const full = today > 0 ? Math.min(5, Math.ceil(today / 8)) : 0;
  return (
    <span aria-hidden className="flex gap-1">
      {[0, 1, 2, 3, 4].map((k) => (
        <svg key={k} width="10" height="13" viewBox="0 0 10 13">
          <path d="M5 0.6 C5 0.6 0.8 5.6 0.8 8.3 A4.2 4.2 0 0 0 9.2 8.3 C9.2 5.6 5 0.6 5 0.6 Z" fill={k < full ? "#9fe0c8" : "none"} stroke={k < full ? "#c9f1e1" : "rgba(214,180,108,0.45)"} strokeWidth="1" />
        </svg>
      ))}
    </span>
  );
}

function Cta({ title }: { title: string }) {
  return <span className="ec-cta btn-gold inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-bold">{title}<i aria-hidden>→</i></span>;
}

const Hair = () => <span aria-hidden className="my-3.5 block h-px bg-[rgb(214,180,108)]/25" />;

export function GardenEntryCard({ className = "" }: { className?: string }) {
  const tx = useGardenText();
  const wt = useGardenWebText();
  const et = useEntryText();
  const ageTx = useAgeText();
  const hydrated = useHydrated();
  const reduce = useReduceMotion();
  const s = useGarden();
  const pro = useGardenPro();
  const tree = hydrated ? activeTree(s, pro) : null;
  if (!tree) {
    return (
      <Frame href="/garden" label={`${tx.seedTitle}. ${tx.seedLead}. ${tx.plant}`} className={className}>
        <span className="relative flex items-center gap-4">
          <Niche motes={!reduce}><TreeArt id="seed" type="olive" stage={0} size={210} still /></Niche>
          <span className="grid min-w-0 flex-1 gap-1.5">
            <Kicker text={tx.missionKicker} />
            <span className="font-display text-[22px] leading-tight">{tx.seedTitle}</span>
            <span className="text-[14px] leading-relaxed text-white/75">{tx.seedLead}</span>
          </span>
        </span>
        <Hair />
        <span className="relative flex justify-end"><Cta title={tx.plant} /></span>
      </Frame>
    );
  }
  const p = progressOf(tree, pro);
  const today = todayGrowth(s), watered = s.watered === dayNum();
  const name = tree.name || tx[`t_${tree.type}`];
  const stageName = tx[`s${p.stage}` as "s0"];
  const status = p.held ? wt.heldWeb : p.left ? fillG(tx.next, { n: p.left }) : p.wait ? ageTx(p.age, p.wait).wait : tx.maxed;
  const nextName = p.stage >= MAX_STAGE ? et.grown : tx[`s${p.stage + 1}` as "s0"];
  const todayT = today > 0 ? fillG(et.todayGp, { n: today }) : et.todayNone;
  return (
    <Frame href="/garden" label={`${tx.title}: ${name}, ${stageName}, ${fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}. ${todayT}. ${status}. ${et.enter}`} className={className}>
      <span className="relative flex gap-4">
        <Niche motes={!reduce}>
          <TreeArt id={tree.id} type={tree.type} stage={p.stage} traits={s.traits} season={seasonNow()} resting={resting(s)} fruits={tree.fruits} size={124 + Math.max(0, 6 - p.stage) * 12} still={reduce} />
        </Niche>
        <span className="flex min-w-0 flex-1 flex-col justify-center gap-1">
          <Kicker text={tx.title} />
          <span className="font-display mt-0.5 truncate text-[22px] leading-tight">{name}</span>
          <span className="line-clamp-2 text-[13.5px] font-semibold leading-snug" style={{ color: CREAM }}>{stageName}<span className="font-normal text-white/60">{`  ·  ${fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}`}</span></span>
          <span className="mt-2.5 flex items-center gap-2.5">
            <Ring frac={p.frac} label={fillG(et.ring, { p: Math.round(p.frac * 100) })} />
            <span className="grid min-w-0 flex-1">
              <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/60 rtl:tracking-normal">{et.nextT}</span>
              <span className="truncate text-[14.5px] font-bold">{nextName}</span>
              <span className="line-clamp-2 text-[12px] leading-snug text-white/60">{status}</span>
            </span>
          </span>
        </span>
      </span>
      <Hair />
      <span className="relative flex items-center gap-3">
        <span className="grid min-w-0 flex-1 gap-1">
          <span className="flex min-w-0 items-center gap-2"><Drops today={today} />{watered ? <span className="truncate text-[11.5px] text-white/60">{et.watered}</span> : null}</span>
          <span className="text-[12.5px] font-semibold leading-snug" style={{ color: today > 0 ? CREAM : "rgba(255,255,255,0.6)" }}>{todayT}</span>
          {tree.fruits > 0 ? <span className="text-[12px] font-semibold text-[#f3b14a]">{fillG(tx.fruitsReady, { n: tree.fruits })}</span> : null}
        </span>
        <Cta title={et.enter} />
      </span>
    </Frame>
  );
}
export default GardenEntryCard;
