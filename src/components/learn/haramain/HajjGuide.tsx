"use client";
// /haramain/guide – web version of the app's HajjGuideScreen (mobile/src/features/haramain/HajjGuide.tsx): Umrah or
// Hajj (tamattu'), one step at a time, tick it off, jump with the step bar, go back or start over. Progress is kept
// under the app's key qmc.haramain.guide.v1. Descriptive only, no rulings. Both guides are open on the website.
import { useEffect, useRef, useState } from "react";
import { pick } from "@/lib/learn/i18n";
import { useStored, writeJSON } from "@/lib/learn/store";
import { useCK } from "@/lib/learn/abrahamic/kit";
import { G, GUIDE_KEY, HAJJ, UMRAH, type GuideState } from "@/lib/learn/haramain/guide";
import { UI } from "@/lib/learn/haramain/content";
import { GoldButton, Kicker, LearnHero, LearnMain, OutlineButton } from "@/components/learn/ui";
import { IconCheckCircle } from "@/components/Icons";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const EMPTY: GuideState = { umrah: [], hajj: [] };

export default function HajjGuide() {
  const { lang, rtl } = useCK();
  const g = (k: string, v?: Record<string, number>) => pick(G[k], lang).replace(/\{(\w+)\}/g, (_, x) => String(v?.[x] ?? ""));
  const st = useStored<GuideState>(GUIDE_KEY, EMPTY);
  const [mode, setMode] = useState<"umrah" | "hajj">("umrah");
  const [i, setI] = useState(0);
  const head = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  useEffect(() => { if (moved.current) head.current?.focus({ preventScroll: true }); moved.current = true; }, [i, mode]);
  const steps = mode === "umrah" ? UMRAH : HAJJ;
  const done = st[mode] ?? [];
  const s = steps[i];
  const tick = () => {
    const next = done.includes(i) ? done : [...done, i];
    writeJSON(GUIDE_KEY, { ...EMPTY, ...st, [mode]: next });
    if (i + 1 < steps.length) setI(i + 1);
  };
  const reset = () => { writeJSON(GUIDE_KEY, { ...EMPTY, ...st, [mode]: [] }); setI(0); };
  const dir = rtl ? "rtl" : undefined;
  const modes = ["umrah", "hajj"] as const;
  return (
    <div>
      <LearnHero uid="hajj" kicker={g("open")} title={g("title")} lead={g("lead")} word="الحج"
        back={{ href: "/haramain", label: pick(UI.title, lang) }} />
      <LearnMain className="space-y-5">
        <div role="tablist" aria-label={g("title")} className="grid grid-cols-2 gap-2">
          {modes.map((m) => {
            const n = (st[m] ?? []).length, total = (m === "umrah" ? UMRAH : HAJJ).length;
            return (
              <button key={m} type="button" role="tab" id={`hg-tab-${m}`} aria-selected={mode === m} aria-controls="hg-panel"
                onClick={() => { setMode(m); setI(0); }}
                onKeyDown={(e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const o = m === "umrah" ? "hajj" : "umrah"; setMode(o); setI(0); document.getElementById(`hg-tab-${o}`)?.focus(); } }}
                tabIndex={mode === m ? 0 : -1}
                className={cx("flex min-h-12 flex-col items-center justify-center rounded-xl border-[1.5px] px-3 py-2 text-[15px] font-semibold transition",
                  mode === m ? "border-[rgb(var(--hm-gold))] text-[rgb(var(--hm-gold-d))]" : "border-line hover:border-[rgb(var(--hm-gold))]/60")}>
                {g(m)}
                <span className="text-[12px] font-normal tabular-nums text-muted">{`${n}/${total}`}</span>
              </button>
            );
          })}
        </div>
        <div id="hg-panel" role="tabpanel" aria-labelledby={`hg-tab-${mode}`} className="space-y-5">
          <ol className="flex gap-1" aria-label={g("step", { n: i + 1, m: steps.length })}>
            {steps.map((_, k) => (
              <li key={k} className="flex-1">
                <button type="button" onClick={() => setI(k)} aria-current={k === i ? "step" : undefined}
                  aria-label={`${g("step", { n: k + 1, m: steps.length })}${done.includes(k) ? ` · ${g("doneStep")}` : ""}`}
                  className="flex h-8 w-full items-center">
                  <span className={cx("block h-2 w-full rounded", done.includes(k) ? "bg-[rgb(var(--hm-gold))]" : k === i ? "bg-muted" : "bg-line")} />
                </button>
              </li>
            ))}
          </ol>
          <article key={`${mode}${i}`} className="hm-card relative space-y-3 p-6">
            <Kicker>{`${g("step", { n: i + 1, m: steps.length })}${s.day ? ` · ${pick(s.day, lang)}` : ""}`}</Kicker>
            <p lang="ar" dir="rtl" className="font-arabic text-center text-[30px] leading-[1.8] text-[rgb(var(--hm-gold-d))]">{s.arabic}</p>
            <h2 ref={head} tabIndex={-1} dir={dir} className="font-display text-[23px] leading-snug outline-none">{pick(s.title, lang)}</h2>
            <p dir={dir} className="text-[16px] leading-[1.75]">{pick(s.text, lang)}</p>
            {done.includes(i) && <IconCheckCircle className="h-6 w-6 text-[rgb(var(--hm-gold))]" />}
          </article>
          <GoldButton onClick={tick} className="w-full">{g("doneStep")}</GoldButton>
          <div className="grid grid-cols-2 gap-2">
            <OutlineButton onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>{g("back")}</OutlineButton>
            <OutlineButton onClick={reset}>{g("reset")}</OutlineButton>
          </div>
        </div>
      </LearnMain>
    </div>
  );
}
