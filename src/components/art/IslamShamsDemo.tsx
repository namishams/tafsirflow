"use client";
import { useEffect, useRef, useState } from "react";

// "One verse, four stages": the same verse (1:2) as it moves from listening to recalling it from memory.
// Plays through the stages on its own until the visitor picks one; reduced motion shows the first stage still.
export default function IslamShamsDemo({ words, cues, stages, title }: { words: string[]; cues: string[]; stages: string[]; title: string }) {
  const [stage, setStage] = useState(0);
  const [tick, setTick] = useState(0);
  const [auto, setAuto] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, [seen]);

  // auto-advance: each stage gets a few ticks
  useEffect(() => {
    if (!auto || tick === 0) return;
    if (tick % 6 === 0) setStage((s) => (s + 1) % 4);
  }, [tick, auto]);

  const pick = (i: number) => { setAuto(false); setStage(i); setTick(0); };
  const n = words.length;
  const local = tick % 6; // 0..5 within the stage

  return (
    <div ref={box} className="isl-card overflow-hidden p-4 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--isl-gold))]">{title} · 1:2</p>
      <div role="tablist" className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {stages.map((s, i) => (
          <button key={s} role="tab" aria-selected={stage === i} onClick={() => pick(i)}
            className={`relative flex items-center gap-2 overflow-hidden rounded-lg border px-2.5 py-2 text-start text-[12.5px] font-semibold leading-tight transition hyphens-auto [overflow-wrap:anywhere] ${stage === i ? "border-[rgb(var(--isl-gold-soft))] bg-[rgb(var(--isl-gold-soft))]/15 text-ink" : "border-line/80 text-muted hover:border-[rgb(var(--isl-gold-soft))]/60 hover:text-ink"}`}>
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] tabular-nums ${stage === i ? "bg-[rgb(var(--isl-gold-soft))] text-white" : "bg-line/70"}`}>{i + 1}</span>
            <span className="min-w-0">{s}</span>
            {stage === i && auto && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[rgb(var(--isl-gold-soft))] rtl:origin-right" style={{ transform: `scaleX(${(local + 1) / 6})`, transition: "transform .9s linear" }} />}
          </button>
        ))}
      </div>

      <div className="relative mt-4 grid min-h-[168px] place-items-center rounded-xl border border-[rgb(var(--isl-gold-soft))]/25 bg-[rgb(var(--stage))] px-3 py-5 text-[#f3ead6] sm:min-h-[190px]">
        <span aria-hidden className="pointer-events-none absolute inset-[5px] rounded-lg border border-[rgb(233_207_153)]/15" />
        <div key={stage} className="step-in w-full text-center" dir="rtl">
          {stage === 0 && (
            <p className="font-arabic text-[26px] leading-[2] sm:text-[34px]">
              {words.map((w, i) => <span key={i} className={`rounded-md px-1 transition-colors duration-500 ${i === local % n ? "bg-white/10 text-[rgb(233_207_153)]" : ""}`}>{w} </span>)}
            </p>
          )}
          {stage === 1 && (
            <div className="grid gap-1">
              {[1, 2, 3, 4].map((k) => (
                <p key={k} className={`font-arabic text-[19px] leading-[1.75] transition-opacity duration-700 sm:text-[24px] ${k <= Math.min(4, local + 1) ? "opacity-100" : "opacity-0"}`}>
                  {words.map((w, i) => <span key={i} className={i < n - k ? "opacity-[.15]" : k === Math.min(4, local + 1) ? "text-[rgb(233_207_153)]" : ""}>{w} </span>)}
                </p>
              ))}
            </div>
          )}
          {stage === 2 && <p className="font-arabic text-[28px] leading-[2] text-[rgb(233_207_153)] sm:text-[36px]">{cues.map((c, i) => <span key={i} className="mx-2 inline-block">{c}</span>)}</p>}
          {stage === 3 && (
            <p className="flex flex-wrap justify-center gap-2.5 py-3">
              {words.map((w, i) => <span key={i} className={`h-8 rounded-md transition-colors duration-700 ${i <= local - 2 ? "bg-[rgb(233_207_153)]/35" : "bg-white/[0.12]"}`} style={{ width: `${w.length * 10}px` }} />)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
