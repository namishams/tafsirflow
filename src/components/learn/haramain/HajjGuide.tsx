"use client";
// /haramain/guide – web version of the app's HajjGuideScreen (mobile/src/features/haramain/HajjGuide.tsx): Umrah or
// Hajj (tamattu'), one step at a time, tick it off, jump with the step bar, go back or start over. Progress is kept
// under the app's key qmc.haramain.guide.v1. Descriptive only, no rulings. Both guides are open on the website.
import { useEffect, useRef, useState } from "react";
import Segmented from "@/components/ui/Segmented";
import { pick } from "@/lib/learn/i18n";
import { useStored, writeJSON } from "@/lib/learn/store";
import { useCK } from "@/lib/learn/abrahamic/kit";
import { courseTr } from "@/lib/learn/abrahamic/courseText";
import type { L } from "@/lib/learn/abrahamic/core";
import { G, GUIDE_KEY, HAJJ, UMRAH, type GuideState } from "@/lib/learn/haramain/guide";
import { UI } from "@/lib/learn/haramain/content";
import { GoldButton, Kicker, LearnHero, LearnMain, OutlineButton } from "@/components/learn/ui";
import { IconCheckCircle } from "@/components/Icons";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const EMPTY: GuideState = { umrah: [], hajj: [] };

// texts of a step in the languages the tables in guide.ts lack: src/lib/learn/i18n/<lang>.json, module "haramain",
// guide.umrah[i] / guide.hajj[i] ({ day?, title, text }, in the order of UMRAH / HAJJ); the own table wins, English stays
// the fallback (as in the app's HajjGuide.tsx)
type GuideTr = { guide?: Partial<Record<"umrah" | "hajj", { day?: string; title?: string; text?: string }[]>> };
const stepText = (own: L, lang: string, tr: string | undefined) => (own as Record<string, string | undefined>)[lang] || tr || own.en;

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
  const tr = (courseTr("haramain", lang) as GuideTr).guide?.[mode]?.[i];
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
        <Segmented tabs full label={g("title")} value={mode} onChange={(m) => { setMode(m); setI(0); }}
          options={modes.map((m) => ({ id: m, label: <>{g(m)} <span className="text-[12px] font-normal tabular-nums text-muted">{`${(st[m] ?? []).length}/${(m === "umrah" ? UMRAH : HAJJ).length}`}</span></> }))} />
        <div id="hg-panel" role="tabpanel" aria-label={g(mode)} className="space-y-5">
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
            <Kicker>{`${g("step", { n: i + 1, m: steps.length })}${s.day ? ` · ${stepText(s.day, lang, tr?.day)}` : ""}`}</Kicker>
            <p lang="ar" dir="rtl" className="font-arabic text-center text-[30px] leading-[1.8] text-[rgb(var(--hm-gold-d))]">{s.arabic}</p>
            <h2 ref={head} tabIndex={-1} dir={dir} className="font-display text-[23px] leading-snug outline-none">{stepText(s.title, lang, tr?.title)}</h2>
            <p dir={dir} className="text-[16px] leading-[1.75]">{stepText(s.text, lang, tr?.text)}</p>
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
