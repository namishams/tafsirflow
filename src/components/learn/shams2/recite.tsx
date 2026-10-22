"use client";
// mirrors mobile/src/features/shams2/recite.tsx: recitation from memory, shared by talaqqī, weak-spot drills and ʿarḍ tests.
//   PromptedWords – the verse as the grade allows it: full text, first letters only, or hidden (with "show once");
//   SpeechCheck   – the browser's Arabic recognition (the same useWordCheck and scoring as the Reciter Path's word
//                   check); the result is reported back, compared with the grade's pass mark and, when the reciter's
//                   time is known, with the pace target. It never judges tajwīd. Hidden where the browser has none.
import { useEffect, useRef, useState } from "react";
import { firstLetter } from "@/lib/learn/shams2/memory";
import type { Prompt } from "@/lib/learn/shams2/grades";
import { useS2 } from "@/lib/learn/shams2/text";
import { useRec } from "@/lib/learn/shams2/rec/text";
import { useWordCheck } from "@/components/learn/media";
import { align } from "@/lib/recite";
import { IconEye } from "@/components/Icons";
import { useWebT } from "./ui";

export type W = { position: number; text: string };

export function PromptedWords({ words, prompt, mark, size = 26, revealLabel }: { words: W[]; prompt: Prompt; mark?: Set<number>; size?: number; revealLabel?: string }) {
  const { s } = useS2();
  const [shown, setShown] = useState(false);
  const key = words.map((w) => `${w.position}:${w.text}`).join("|");
  useEffect(() => setShown(false), [key, prompt]);
  const level: Prompt = shown ? "full" : prompt;
  if (level === "hidden") {
    return (
      <button type="button" onClick={() => setShown(true)} className="grid w-full justify-items-center gap-1.5 rounded-xl border border-dashed border-[rgb(var(--hm-gold))]/60 p-5 text-center">
        <span aria-hidden className="text-[rgb(var(--hm-gold))] [&>svg]:h-5 [&>svg]:w-5"><IconEye /></span>
        <span className="text-[14px] font-semibold">{revealLabel ?? s("showText")}</span>
        <span className="text-[12.5px] text-muted">{s("hiddenNote")}</span>
      </button>
    );
  }
  return (
    <div className="grid gap-1.5">
      <p lang="ar" dir="rtl" className="flex flex-wrap gap-1.5">
        {words.map((w) => {
          const m = mark?.has(w.position);
          return (
            <span key={w.position} className={`font-arabic rounded-md px-1.5 ${m ? "border border-[rgb(var(--hm-gold))]/60 bg-[rgb(var(--hm-gold))]/[0.18] text-[rgb(var(--hm-gold-d))]" : ""}`} style={{ fontSize: size, lineHeight: 1.85 }}>
              {level === "letters" ? firstLetter(w.text) : w.text}
            </span>
          );
        })}
      </p>
      {prompt !== "full" && !shown && <button type="button" onClick={() => setShown(true)} className="w-fit min-h-9 text-[13px] font-semibold text-accent hover:underline">{s("showText")}</button>}
    </div>
  );
}

export type CheckResult = { ok: boolean[]; share: number; pass: boolean; ms: number; paceOk: boolean | null };

// strict (Shams 3.0): only the same word after normalisation counts
export function SpeechCheck({ words, pass, targetMs, onResult, compact, strict }: { words: W[]; pass: number; targetMs?: number | null; onResult: (r: CheckResult) => void; compact?: boolean; strict?: boolean }) {
  const { s, nf } = useS2();
  const w = useWebT();
  const c = useWordCheck(words.map((x) => x.text));
  const [ms, setMs] = useState(0);
  const [nothing, setNothing] = useState(false);
  const { r } = useRec();
  const [res, setRes] = useState<boolean[] | null>(null);
  const started = useRef(0);
  const armed = useRef(false);
  const report = useRef(onResult); report.current = onResult;
  const key = words.map((x) => `${x.position}:${x.text}`).join("|");
  useEffect(() => { setRes(null); armed.current = false; }, [key]);
  useEffect(() => {
    if (c.state === "listening") { started.current = Date.now(); armed.current = true; setRes(null); return; }
    if (c.state === "done" && armed.current) {
      armed.current = false;
      // nothing heard: no result, nothing recorded as missed; the learner tries again
      if (!c.heard?.trim()) { setRes(null); setNothing(true); return; }
      setNothing(false);
      const ok = (strict && c.heard ? align(words.map((x) => x.text), c.heard, { strict: true }).ok : c.ok) ?? words.map(() => false);
      const share = ok.length ? ok.filter(Boolean).length / ok.length : 0;
      const took = Date.now() - started.current;
      setMs(took); setRes(ok);
      report.current({ ok, share, pass: share >= pass, ms: took, paceOk: targetMs ? took <= targetMs : null });
    }
  }, [c.state]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!c.supported || c.state === "unsupported" || c.state === "denied" || c.state === "failed") return <p className="text-[13px] text-muted">{s("checkUnavailable")}</p>;
  const listening = c.state === "listening";
  const live = res ?? c.ok;
  const n = live?.filter(Boolean).length ?? 0;
  const passed = live ? n / Math.max(1, live.length) >= pass : false;
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={() => (listening ? c.stop() : c.start())}
          className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold text-white ${listening ? "bg-red-700" : "bg-accent"}`}>
          {listening && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />}{listening ? s("checkStop") : s("checkStart")}
        </button>
        {!compact && <span className="text-[12.5px] text-muted">{s("passMark", { p: nf(Math.round(pass * 100)) })}</span>}
      </div>
      {listening && live && (
        <p lang="ar" dir="rtl" className="flex flex-wrap gap-1" aria-hidden>
          {words.map((x, i) => <span key={x.position} className={`font-arabic rounded px-1 text-[18px] leading-[1.8] ${live[i] ? "bg-accent-soft text-accent" : "text-muted"}`}>{x.text}</span>)}
        </p>
      )}
      {nothing && !listening && <p aria-live="polite" className="text-[13px] font-semibold text-[rgb(var(--hm-gold-d))]">{r("heardNothing")}</p>}
      {res && (
        <div className="grid gap-1" aria-live="polite">
          <p className={`text-[14px] font-semibold ${passed ? "text-accent" : "text-[rgb(var(--hm-gold-d))]"}`}>{`${s("heardOf", { n: nf(n), total: nf(res.length) })} · ${passed ? s("passed") : s("notYetPassed")}`}</p>
          {targetMs ? <p className={`text-[12.5px] ${ms <= targetMs ? "text-accent" : "text-muted"}`}>{s("paceLine", { s: nf(Math.round(ms / 100) / 10), target: nf(Math.round(targetMs / 100) / 10) })}</p> : null}
        </div>
      )}
      {!compact && <p className="text-[11.5px] leading-relaxed text-muted">{w.wordCheckNote}</p>}
    </div>
  );
}
