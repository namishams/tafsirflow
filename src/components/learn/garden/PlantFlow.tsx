"use client";
// mirrors mobile/src/features/garden/PlantFlow.tsx
// DESIGN FROZEN (owner approved, tag garten-design-v1) — do not change visuals; only bug fixes.
// The planting ceremony on the web: Bismillah and the niyyah, the glowing seed, the choice of tree and name, the seed
// going into the soil, the rain with the du'a of Quran 20:114 (the words come from the Quran data via the website's
// API, never typed by hand) and the sprout at sunrise. Web differences: always the free path (one tree, Pro-only tree
// types are not offered), no haptics, no personal ending line from the app's onboarding plan.
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLang } from "@/lib/learn/i18n";
import { getVerseByKey } from "@/lib/learn/quran";
import { TREE_TYPES, firstWater, plantTree, type Tree, type TreeType } from "@/lib/learn/garden/garden";
import { BISMILLAH, DUA_KEY, useStory } from "@/lib/learn/garden/story";
import { useGardenText } from "@/lib/learn/garden/texts";
import { journeySky } from "@/lib/learn/garden/sky";
import { GoldButton, OutlineButton } from "@/components/learn/ui";
import { JourneyStage } from "./Landscape";
import { TreeArt, useUid } from "./Tree";
import { useReducedMotion } from "./Scene";

type Step = "mission" | "choose" | "plant" | "water" | "done";
const GOLD = "rgb(214,180,108)", SOFT = "rgba(255,255,255,0.75)";
const kicker = "text-[11.5px] font-semibold uppercase tracking-[0.16em] rtl:tracking-normal";

export function PlantFlow({ onDone, onLater, onStart }: { onDone: () => void; onLater?: () => void; /** the tree was planted (the ceremony goes on) */ onStart?: () => void }) {
  const tx = useGardenText();
  const story = useStory();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("mission");
  const [type, setType] = useState<TreeType>("olive");
  const [name, setName] = useState("");
  const [tree, setTree] = useState<Tree | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // each step starts at the top of the stage (the steps differ in height)
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el = box.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const plant = () => {
    const t = plantTree(type, name || tx[`t_${type}`], false);
    if (!t) return;
    setTree(t); setStep("plant"); onStart?.();
  };
  const progress = step === "mission" ? 0.72 : step === "choose" ? 0.8 : step === "plant" ? 0.86 : step === "water" ? 0.9 : 1;
  const horizon = step === "choose" ? 0.24 : step === "mission" ? 0.58 : 0.47;
  return (
    <section ref={box} className="stage relative scroll-mt-16 min-h-[760px] overflow-hidden text-white sm:min-h-[820px]">
      {size.w ? <JourneyStage width={size.w} height={size.h} progress={progress} sky={journeySky(progress)} horizon={horizon} veil={step === "choose" ? 0.7 : 0.5} still={reduce} /> : null}
      <div className="relative mx-auto flex min-h-[760px] max-w-md flex-col px-5 pb-10 pt-10 sm:min-h-[820px]">
        {step === "mission" ? (
          <div key="mission" className="gd-fadein flex flex-1 flex-col gap-3.5">
            <p lang="ar" dir="rtl" aria-label="Bismillah" className="font-arabic text-center text-[30px] leading-[56px] text-[#f3e2b6]">{BISMILLAH}</p>
            <p className={kicker} style={{ color: GOLD }}>{tx.missionKicker}</p>
            <h1 className="font-display text-[32px] leading-tight">{tx.missionTitle}</h1>
            <p className="text-[16px] leading-relaxed" style={{ color: SOFT }}>{tx.missionLead}</p>
            <div className="my-2 flex justify-center"><GlowSeed size={200} still={reduce} /></div>
            {/* the seed is the intention (niyyah): the learner confirms it with the button below */}
            <div className="grid gap-2 rounded-2xl border p-4" style={{ borderColor: "rgba(214,180,108,0.45)", backgroundColor: "rgba(6,30,23,0.78)" }}>
              <p className={kicker} style={{ color: GOLD }}>{story.niyyahT}</p>
              <p className="text-[17px] italic leading-relaxed text-[#f3e2b6]">{story.niyyah0}</p>
            </div>
            <div className="flex-1" />
            <GoldButton className="w-full" onClick={() => setStep("choose")}>{tx.pledgeBtn}</GoldButton>
            {onLater ? <OutlineButton dark className="w-full" onClick={onLater}>{tx.later}</OutlineButton> : null}
          </div>
        ) : null}

        {step === "choose" ? (
          <div key="choose" className="gd-fadein grid gap-3.5">
            <p className={kicker} style={{ color: GOLD }}>{tx.plantTitle}</p>
            <h1 className="font-display text-[28px] leading-tight">{tx.chooseType}</h1>
            <div role="radiogroup" aria-label={tx.chooseType} className="grid grid-cols-2 gap-2.5">
              {TREE_TYPES.filter((tt) => !tt.pro).map((tt) => {
                const on = type === tt.id;
                return (
                  <button key={tt.id} type="button" role="radio" aria-checked={on} aria-label={tx[`t_${tt.id}`]} onClick={() => setType(tt.id)}
                    className="flex flex-col items-center rounded-2xl py-2.5 transition"
                    style={{ borderWidth: on ? 2 : 1, borderStyle: "solid", borderColor: on ? GOLD : "rgba(255,255,255,0.18)", backgroundColor: on ? "rgba(58,47,18,0.85)" : "rgba(6,30,23,0.72)" }}>
                    <TreeArt id={`pick-${tt.id}`} type={tt.id} stage={8} size={110} still />
                    <span className="mt-0.5 text-[14px] font-semibold">{tx[`t_${tt.id}`]}</span>
                  </button>
                );
              })}
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder={tx.namePh} aria-label={tx.namePh}
              className="rounded-xl border bg-white/5 px-3.5 py-3 text-[17px] text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[rgb(214,180,108)]/60"
              style={{ borderColor: "rgba(214,180,108,0.4)" }} />
            <GoldButton className="w-full" onClick={plant}>{tx.plantSeed}</GoldButton>
          </div>
        ) : null}

        {(step === "plant" || step === "water" || step === "done") && tree ? (
          <Ceremony tree={tree} step={step} reduce={reduce} onPlanted={() => setStep("water")} onWatered={() => { firstWater(tree.id); setStep("done"); }} onDone={onDone} />
        ) : null}
      </div>
    </section>
  );
}

const BASE = 312 * (312 / 360); // the soil line inside the 260 × 312 tree box
function Ceremony({ tree, step, reduce, onPlanted, onWatered, onDone }: { tree: Tree; step: Step; reduce: boolean; onPlanted: () => void; onWatered: () => void; onDone: () => void }) {
  const tx = useGardenText();
  const story = useStory();
  const u = useUid("cb");
  const [raining, setRaining] = useState(false);
  useEffect(() => {
    if (step !== "plant") return;
    if (reduce) { onPlanted(); return; }
    const t = setTimeout(onPlanted, 1300);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const water = () => {
    if (reduce) { onWatered(); return; }
    setRaining(true);
    setTimeout(onWatered, 1100);
  };
  const done = step === "done";
  return (
    <div className="flex flex-1 flex-col items-center gap-3.5" aria-live="polite">
      <p className={kicker} style={{ color: GOLD }}>{tree.name}</p>
      <h1 className="font-display text-center text-[28px] leading-tight">{done ? tx.ceremonyDone : step === "water" ? tx.waterFirst : tx.plantSeed}</h1>
      <div className="relative" style={{ width: 260, height: 312 }} aria-hidden>
        {done ? (
          <div className={reduce ? undefined : "gd-burst"} style={{ position: "absolute", left: -70, top: BASE - 250, width: 400, height: 400, opacity: reduce ? 0.55 : undefined, pointerEvents: "none" }}>
            <svg width={400} height={400}>
              <defs><radialGradient id={u} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff1c4" stopOpacity={0.85} /><stop offset="0.35" stopColor="#ffe2a0" stopOpacity={0.3} /><stop offset="1" stopColor="#ffe2a0" stopOpacity={0} /></radialGradient></defs>
              <circle cx={200} cy={200} r={200} fill={`url(#${u})`} />
              {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6, w = 0.06; return <path key={i} d={`M200 200 L${200 + Math.cos(a - w) * 200} ${200 + Math.sin(a - w) * 200} L${200 + Math.cos(a + w) * 200} ${200 + Math.sin(a + w) * 200} Z`} fill="#fff4d0" opacity={0.18} />; })}
            </svg>
          </div>
        ) : null}
        <div key={done ? "sprout" : "seed"} className={done && !reduce ? "gd-sprout" : undefined} style={{ position: "absolute", left: 0, bottom: 0, transformOrigin: `50% ${BASE}px` }}>
          <TreeArt id={tree.id} type={tree.type} stage={done ? 1 : 0} size={260} still={reduce} />
        </div>
        {/* a ring of light where the seed lands, and again where the rain meets the soil */}
        {!reduce && step === "plant" ? <span className="gd-ring" style={{ position: "absolute", left: 90, top: BASE - 9, width: 80, height: 18, borderRadius: 40, border: "1.5px solid #f3e2b6" }} /> : null}
        {!reduce && raining ? <span className="gd-ring" style={{ position: "absolute", left: 90, top: BASE - 9, width: 80, height: 18, borderRadius: 40, border: "1.5px solid #f3e2b6", "--gd-d": "675ms" } as CSSProperties} /> : null}
        {step === "plant" && !reduce ? (
          <div className="gd-seedfall" style={{ position: "absolute", left: 130 - 42, top: BASE - 42 }}><GlowSeed size={84} still={reduce} /></div>
        ) : null}
        {step === "plant" && !reduce ? Array.from({ length: 6 }, (_, i) => { const a = Math.PI + (i / 5) * Math.PI; return <span key={i} className="gd-soil" style={{ position: "absolute", left: 128, top: BASE - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: i % 2 ? "#8c5f32" : "#e9cf99", "--gd-sx": `${Math.cos(a) * 30}px`, "--gd-sy": `${Math.sin(a) * 26 + 18}px` } as CSSProperties} />; }) : null}
        {raining ? Array.from({ length: 14 }, (_, i) => <span key={i} className="gd-rain" style={{ position: "absolute", left: 130 + ((i * 37) % 120) - 60, top: 0, width: 3, height: 9, borderRadius: 2, backgroundColor: "#dff8ee", "--gd-d": `${(i % 7) * 90}ms`, "--gd-b": `${BASE - 6}px` } as CSSProperties} />) : null}
      </div>
      <p className="text-center text-[15px] leading-relaxed" style={{ color: SOFT }}>{tx.ceremonyLead}</p>
      {step === "water" ? <Dua /> : null}
      {done ? <p className="text-center text-[14px] italic leading-relaxed" style={{ color: GOLD }}>{story.sabr}</p> : null}
      {step === "water" ? <GoldButton className="w-full" onClick={water} disabled={raining}>{tx.waterFirst}</GoldButton> : null}
      {done ? <GoldButton className="w-full" onClick={onDone}>{tx.cont}</GoldButton> : null}
    </div>
  );
}

/** the seed: a small golden kernel in a soft halo of light, breathing */
function GlowSeed({ size, still }: { size: number; still: boolean }) {
  const u = useUid("gs");
  const c = size / 2, k = size / 60;
  return (
    <div style={{ position: "relative", width: size, height: size }} aria-hidden>
      <div className={still ? undefined : "gd-breathe"} style={{ position: "absolute", inset: 0 }}>
        <svg width={size} height={size}><defs><radialGradient id={`${u}h`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe8a8" stopOpacity={0.9} /><stop offset="0.3" stopColor="#ffd98a" stopOpacity={0.35} /><stop offset="1" stopColor="#ffd98a" stopOpacity={0} /></radialGradient></defs><circle cx={c} cy={c} r={c} fill={`url(#${u}h)`} /></svg>
      </div>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <defs><radialGradient id={`${u}k`} cx="0.38" cy="0.32" r="0.75"><stop offset="0" stopColor="#fff6d8" /><stop offset="0.4" stopColor="#e2b85c" /><stop offset="1" stopColor="#8a5f22" /></radialGradient></defs>
        <path d={`M${c} ${c - 8 * k} C${c + 7 * k} ${c - 7 * k} ${c + 7 * k} ${c + 6 * k} ${c} ${c + 8 * k} C${c - 7 * k} ${c + 6 * k} ${c - 7 * k} ${c - 7 * k} ${c} ${c - 8 * k} Z`} fill={`url(#${u}k)`} transform={`rotate(-25 ${c} ${c})`} />
        <path d={`M${c - 1 * k} ${c - 5 * k} q-2 ${5 * k} 0 ${10 * k}`} stroke="#fff6d8" strokeWidth={0.8 * k} fill="none" opacity={0.7} transform={`rotate(-25 ${c} ${c})`} />
      </svg>
    </div>
  );
}

/** the du'a for beneficial knowledge before the first watering: the words "Rabbi zidni 'ilma" from the Quran data
 *  (Quran 20:114), the meaning and the reference */
function Dua() {
  const story = useStory();
  const { lang } = useLang();
  const [ar, setAr] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    getVerseByKey(DUA_KEY, lang).then((v) => { if (live) setAr(v.text_uthmani.trim().split(/\s+/).slice(-3).join(" ")); }).catch(() => undefined);
    return () => { live = false; };
  }, [lang]);
  return (
    <div className="grid w-full gap-1 rounded-2xl border p-3.5" style={{ borderColor: "rgba(214,180,108,0.4)", backgroundColor: "rgba(6,30,23,0.78)" }}>
      <p className={kicker} style={{ color: GOLD }}>{story.duaT}</p>
      {ar ? <p lang="ar" dir="rtl" className="font-arabic text-center text-[28px] leading-[52px] text-[#f3e2b6]">{ar}</p> : null}
      <p className="text-center text-[15.5px] italic leading-relaxed text-white">{story.duaM}</p>
      <p className="text-center text-[12px] font-semibold" style={{ color: GOLD }}>{story.duaS}</p>
    </div>
  );
}
