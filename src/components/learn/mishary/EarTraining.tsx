"use client";
// mirrors mobile/src/features/mishary/EarTraining.tsx – maqam ear training (/mishary/ear): lessons (the seven main
// maqamat with their lower jins, played live with WebAudio), five drill stages (10 questions, 80 % unlocks the next
// stage; stage 5 waits for reviewed recording examples) and statistics. Answers and best scores are stored under the
// app's key "qmc.mishary.ear" with the app's scoring.
import { useEffect, useMemo, useState } from "react";
import Segmented from "@/components/ui/Segmented";
import { useMt } from "@/lib/learn/mishary/texts";
import {
  JINS, MAQAMAT, MAQAM_AR, NOTES, PASS, QUESTIONS, STAGES, descKey, nameKey, playJins, recordAnswer, recordStage, reviewedExamples, stageOpen, stopJins, useEarStats,
  type Maqam, type Stage,
} from "@/lib/learn/mishary/maqam";
import { useHydrated } from "@/lib/learn/store";
import { tone } from "@/components/learn/media";
import { Ar, Bar, Card, GoldButton, LearnHero, LearnMain, OutlineButton, Option, Stats as StatTiles } from "@/components/learn/ui";
import { IconClose, IconLock, IconPlay, IconRepeat } from "@/components/Icons";
import { Chip, Muted, NeedsReview, Section } from "./ui";

type Tab = "lessons" | "drills" | "stats";

// ——— /mishary/ear ———
export function EarTrainingScreen() {
  const mt = useMt();
  const [tab, setTab] = useState<Tab>("lessons");
  const [drill, setDrill] = useState<Stage | null>(null);
  useEffect(() => stopJins, []);
  const tabs: [Tab, string][] = [["lessons", mt("tabLessons")], ["drills", mt("tabDrills")], ["stats", mt("tabStats")]];
  return (
    <>
      <LearnHero back={{ href: "/mishary", label: mt("kicker") }} kicker={mt("kicker")} title={mt("earTitle")} lead={mt("earLead")} word="المقامات" uid="me" />
      <LearnMain className="grid gap-6">
        {drill ? <Drill stage={drill} onClose={() => setDrill(null)} /> : (
          <>
            <Segmented tabs full className="max-w-md" label={mt("earTitle")} value={tab} onChange={setTab}
              options={tabs.map(([k, l]) => ({ id: k, label: l }))} />
            <div role="tabpanel">{tab === "lessons" ? <Lessons /> : tab === "drills" ? <Stages onStart={setDrill} /> : <Stats />}</div>
          </>
        )}
      </LearnMain>
    </>
  );
}

/** a tiny step diagram of the jins: each interval as a block, quarter-tone steps in gold, the wide step in red */
function JinsSteps({ m }: { m: Maqam }) {
  const c = JINS[m];
  const steps = c.slice(1).map((x, i) => x - c[i]);
  return (
    <div aria-hidden className="flex items-end gap-1">
      {steps.map((s, i) => <span key={i} style={{ flex: s }} className={`h-3.5 rounded opacity-85 ${s % 100 ? "bg-[rgb(var(--hm-gold))]" : s > 200 ? "bg-red-700" : "bg-accent"}`} />)}
    </div>
  );
}

function Lessons() {
  const mt = useMt();
  return (
    <div className="grid gap-4">
      <Muted>{mt("earSynthNote")}</Muted>
      <div className="flex flex-wrap items-center gap-2.5"><NeedsReview /><Muted className="text-[13px]">{mt("needsReviewNote")}</Muted></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {MAQAMAT.map((m) => (
          <Card key={m} className="grid gap-3">
            <div className="flex items-center gap-2.5">
              <h3 className="flex-1 text-[18px] font-bold">{mt(nameKey(m))}</h3>
              <Ar size="text-[24px]" className="text-[rgb(var(--hm-gold-d))]">{MAQAM_AR[m]}</Ar>
            </div>
            <p className="text-[14.5px] leading-relaxed">{mt(descKey(m))}</p>
            <div className="grid gap-1.5">
              <p className="text-[12.5px] font-semibold text-muted">{mt("lowerJins")}: <span dir="ltr">{NOTES[m]}</span></p>
              <JinsSteps m={m} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip label={mt("hearJins")} icon={<IconPlay />} onClick={() => playJins(m)} />
              <Chip label={mt("hearScale")} icon={<IconRepeat />} onClick={() => playJins(m, { updown: true })} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stages({ onStart }: { onStart: (s: Stage) => void }) {
  const mt = useMt();
  const stats = useEarStats();
  const hydrated = useHydrated();
  const examples = reviewedExamples();
  return (
    <ol className="grid gap-3">
      {STAGES.map((s) => {
        const open = hydrated && stageOpen(stats, s.n) && (!s.recordings || examples.length >= 4);
        const best = hydrated ? stats.best[s.n] : undefined;
        const passed = (best ?? 0) >= PASS;
        return (
          <li key={s.n}>
            <Card className="grid gap-2.5">
              <div className="flex items-center gap-3">
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold ${passed ? "bg-accent text-white" : "bg-accent-soft text-accent"}`}>{passed ? "✓" : s.n}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-[rgb(var(--hm-gold-d))]">{mt("stage", { n: s.n })}</p>
                  <h3 className="text-[16px] font-bold leading-snug">{mt(s.title)}</h3>
                </div>
                {!open && <span aria-hidden className="text-[rgb(var(--hm-gold))] [&>svg]:h-4 [&>svg]:w-4"><IconLock /></span>}
              </div>
              {s.recordings && examples.length < 4 ? <Muted>{mt("noExamples")}</Muted> : (
                <>
                  <Muted>{s.maqamat.map((m) => mt(nameKey(m))).join(" · ")}</Muted>
                  {best !== undefined && <Muted className="text-[12.5px]">{mt("stageBest", { n: Math.round(best * 100) })}</Muted>}
                  {open ? <OutlineButton onClick={() => onStart(s)} className="!h-10 w-fit !px-4">{mt("startDrill")}</OutlineButton> : <Muted className="text-[12.5px]">{mt("stageLocked")}</Muted>}
                </>
              )}
            </Card>
          </li>
        );
      })}
    </ol>
  );
}

type Q = { m: Maqam; shift: number };
function makeQuestions(s: Stage): Q[] {
  // every maqam of the stage at least once, then random, never the same twice in a row
  const out: Q[] = [];
  const pool = [...s.maqamat].sort(() => Math.random() - 0.5);
  while (out.length < QUESTIONS) {
    const prev = out.at(-1)?.m;
    let m = pool.length ? pool.pop()! : s.maqamat[Math.floor(Math.random() * s.maqamat.length)];
    if (m === prev && s.maqamat.length > 1) m = s.maqamat.find((x) => x !== prev)!;
    out.push({ m, shift: s.transpose ? Math.floor(Math.random() * 7) - 3 : 0 });
  }
  return out;
}

function Drill({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  const mt = useMt();
  const [qs, setQs] = useState(() => makeQuestions(stage));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Maqam | null>(null);
  const [ok, setOk] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = qs[i];
  const play = () => playJins(q.m, { shift: q.shift });
  useEffect(() => { if (!finished) play(); }, [i, qs]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (m: Maqam) => {
    if (picked) return;
    setPicked(m);
    recordAnswer(q.m, m);
    tone(m === q.m);
    if (m === q.m) setOk((n) => n + 1);
  };
  const next = () => {
    if (i + 1 >= qs.length) { recordStage(stage.n, ok / qs.length); setFinished(true); stopJins(); return; }
    setPicked(null); setI(i + 1);
  };
  const restart = () => { setQs(makeQuestions(stage)); setI(0); setOk(0); setPicked(null); setFinished(false); };
  const options = useMemo(() => stage.maqamat, [stage]);

  if (finished) {
    const score = ok / qs.length;
    return (
      <Card className="grid gap-4">
        <p className="font-display text-[28px] leading-tight" aria-live="polite">{mt("result", { ok, total: qs.length })}</p>
        <Bar value={score} gold label={mt("result", { ok, total: qs.length })} />
        {score >= PASS && STAGES.some((s) => s.n === stage.n + 1) && <p className="font-semibold text-accent">{mt("unlocked", { n: stage.n + 1 })}</p>}
        <div className="flex flex-wrap gap-3">
          <GoldButton onClick={restart}>{mt("again")}</GoldButton>
          <OutlineButton onClick={onClose}>{mt("done")}</OutlineButton>
        </div>
      </Card>
    );
  }
  return (
    <Card className="grid gap-4">
      <div className="flex items-center gap-2">
        <p className="flex-1 text-[12.5px] font-semibold text-[rgb(var(--hm-gold-d))]">{mt("stage", { n: stage.n })} · {mt("question", { n: i + 1, total: qs.length })}</p>
        <button type="button" onClick={() => { stopJins(); onClose(); }} aria-label={mt("back")} className="grid h-10 w-10 place-items-center rounded-full text-muted hover:bg-[rgb(var(--hm-gold))]/10 [&>svg]:h-4 [&>svg]:w-4"><IconClose /></button>
      </div>
      <Bar value={i / qs.length} gold />
      <h2 className="text-[19px] font-bold">{mt("whichMaqam")}</h2>
      <OutlineButton onClick={play} className="!h-10 w-fit !px-4"><span aria-hidden className="[&>svg]:h-3.5 [&>svg]:w-3.5"><IconPlay /></span>{mt("playAgain")}</OutlineButton>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((m) => {
          const state = !picked ? "idle" : m === q.m ? "right" : picked === m ? "wrong" : "dim";
          return (
            <Option key={m} state={state} onClick={() => answer(m)} disabled={!!picked}>
              <span className="flex items-center gap-2"><span className="flex-1">{mt(nameKey(m))}</span><Ar size="text-[19px]" className="text-[rgb(var(--hm-gold-d))]">{MAQAM_AR[m]}</Ar></span>
            </Option>
          );
        })}
      </div>
      {picked && (
        <div className="grid gap-2.5" aria-live="polite">
          <p className={`text-[15.5px] font-bold ${picked === q.m ? "text-accent" : "text-red-700 dark:text-red-400"}`}>{picked === q.m ? mt("correct") : mt("wrongWas", { m: mt(nameKey(q.m)) })}</p>
          <Muted>{mt(descKey(q.m))}</Muted>
          <GoldButton onClick={next} className="w-fit">{mt("next")}</GoldButton>
        </div>
      )}
    </Card>
  );
}

function Stats() {
  const mt = useMt();
  const s = useEarStats();
  const hydrated = useHydrated();
  const total = MAQAMAT.reduce((a, m) => a + (s.per[m]?.[0] ?? 0), 0);
  const right = MAQAMAT.reduce((a, m) => a + (s.per[m]?.[1] ?? 0), 0);
  if (!hydrated || !total) return <Muted>{mt("noStats")}</Muted>;
  const top = Object.entries(s.confused).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const highest = STAGES.filter((x) => (s.best[x.n] ?? 0) >= PASS).at(-1)?.n ?? 0;
  return (
    <div className="grid gap-6">
      <StatTiles items={[
        { n: total, l: mt("statAnswers") }, { n: `${Math.round((right / total) * 100)} %`, l: mt("statAccuracy") },
        { n: highest, l: mt("statStage") }, { n: s.days.length, l: mt("statDays") },
      ]} />
      <Section title={mt("statAccuracy")}>
        <Card className="grid gap-3.5">
          {MAQAMAT.map((m) => {
            const [n, ok] = s.per[m] ?? [0, 0];
            return (
              <div key={m} className="grid gap-1.5">
                <div className="flex text-[14px]"><span className="flex-1 font-semibold">{mt(nameKey(m))}</span><span className="text-muted">{mt("statPer", { ok, n })}</span></div>
                <Bar value={n ? ok / n : 0} gold label={mt(nameKey(m))} />
              </div>
            );
          })}
        </Card>
      </Section>
      {top.length > 0 && (
        <Section title={mt("confused")}>
          <Card className="grid gap-1.5">
            {top.map(([k, n]) => { const [a, b] = k.split(">") as Maqam[]; return <p key={k} className="text-[14.5px]">{mt(nameKey(a))} → {mt(nameKey(b))} · {n}×</p>; })}
          </Card>
        </Section>
      )}
    </div>
  );
}
