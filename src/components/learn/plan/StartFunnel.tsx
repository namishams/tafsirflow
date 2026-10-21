"use client";
// mirrors mobile/src/features/plan/Funnel.tsx and Onboard2.tsx (onboarding v2: the personal path) on the website, route
// /start. The same questions, personal replies, story, the Shams Method in four screens, "Your personal path" with the
// 30-day plan and the planting ceremony (the website's PlantFlow), with the same keys as the app (qmc.quiz, qmc.plan,
// qmc.quiz.v2, qmc.name, tf:goal), so the path follows the account into the app and back.
// Web differences: no language step (the page's locale decides), no profile step (the website has Edit profile), no
// tradition step (the website only reads the app's choice), no day-1 paywall and no Pro marks (the website is free),
// and the Shams Method screens are shown on the journey landscape without the app's illustrations.
// "?personalise=1": the same questions for an existing plan; the plan keeps its start date and the tree stays.
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Goal } from "@/lib/coach";
import { useHydrated, writeJSON } from "@/lib/learn/store";
import { RECITERS } from "@/lib/learn/quran";
import { readTradition } from "@/lib/learn/tradition";
import { readGarden } from "@/lib/learn/garden/garden";
import { journeySky } from "@/lib/learn/garden/sky";
import { GOOD_TREE_KEY, RECITERS_KEY, fillS, useStory } from "@/lib/learn/garden/story";
import { useHadithQuote, useVerseQuote, type SourceQuote } from "@/lib/learn/garden/sources";
import { LEVELS, MINUTES, MOTIVATIONS, readDraft, readPlan, savePlan, writeDraft, type Plan, type QuizAnswers, type QuizDraft } from "@/lib/learn/plan/plan";
import { fmt, usePlanT } from "@/lib/learn/plan/texts";
import { useO2 } from "@/lib/learn/plan/texts2";
import { CHALLENGES, GOALS_V2, INTERESTS, primaryGoal, readName, readV2, saveName, saveV2, type Challenge, type GoalV2, type Interest, type V2Answers } from "@/lib/learn/plan/v2";
import { GoldButton } from "@/components/learn/ui";
import { JourneyStage } from "@/components/learn/garden/Landscape";
import { PlantFlow } from "@/components/learn/garden/PlantFlow";
import { useReducedMotion } from "@/components/learn/garden/Scene";
import { StarGlyph } from "@/components/art/HomeOrnaments";

const Q = ["name", "goals", "interests", "challenges", "level", "minutes", "reciter", "prayer", "motivation"] as const;
type Phase = "quiz" | "story" | "method" | "building" | "plan" | "garden";
type Draft = QuizDraft & { goals?: GoalV2[]; interests?: Interest[]; challenges?: Challenge[]; v?: 2 };
const GOLD = "rgb(214,180,108)";
const kicker = "text-[11.5px] font-semibold uppercase tracking-[0.16em] text-[rgb(214,180,108)] rtl:tracking-normal";
const toggle = <T,>(xs: T[] | undefined, x: T) => ((xs ?? []).includes(x) ? (xs ?? []).filter((y) => y !== x) : [...(xs ?? []), x]);
/** "A, B and C" without language-specific "and": joined with the list separator (as in the app) */
const joinList = (xs: string[]) => xs.join(" · ");

/** the website's goal (tf:goal, synced with the account) from the quiz answers – the same mapping as the app */
function websiteGoal(a: QuizAnswers): Goal {
  const read: Goal["read"] = a.level === "none" ? "no" : a.level === "fluent" ? "fluent" : "some";
  const aim: Goal["aim"] = a.goal === "juzamma" ? "juzamma" : a.goal === "understand" || a.goal === "daily" ? "understand" : "read";
  return { read, aim, minutes: a.minutes, at: Date.now() };
}

/** "Read Arabic" / "Learn about Islam" … for any v2 goal */
function useGoalLabel() {
  const p = usePlanT();
  const o = useO2();
  return (g: GoalV2) => (g === "islam" || g === "children" ? o[`g_${g}`] : p[`g_${g}`]);
}

/** the dark journey stage that fills the page: the landscape revealing itself from night to dawn behind the content */
function Stage({ progress, horizon = 0.5, veil = 0.55, children }: { progress: number; horizon?: number; veil?: number; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <section ref={box} className="stage relative min-h-[760px] overflow-hidden text-white sm:min-h-[820px]">
      {size.w ? <JourneyStage width={size.w} height={size.h} progress={progress} sky={journeySky(progress)} horizon={horizon} veil={veil} still={reduce} /> : null}
      <div className="relative mx-auto flex min-h-[760px] max-w-md flex-col px-5 pb-10 pt-8 sm:min-h-[820px]">{children}</div>
    </section>
  );
}

/** the dark glass the texts stand on where the landscape is bright (the pavilion and the sky at dawn) */
const glass = "rounded-2xl p-4 backdrop-blur-sm";
const glassBg = { backgroundColor: "rgba(6,30,23,0.72)" };

/** a quiet quotation with its reference (hadith or verse); `text` may be empty when only the Arabic is shown */
function RefQuote({ text, source, arabic }: SourceQuote) {
  return (
    <figure className="grid gap-1 border-s-2 ps-3 py-1" style={{ borderColor: GOLD }}>
      {arabic ? <p lang="ar" dir="rtl" className="font-arabic text-[22px] leading-[44px] text-[#f3e2b6]">{arabic}</p> : null}
      {text ? <blockquote className="text-[15.5px] italic leading-relaxed text-[#f4ecd8]">{text}</blockquote> : null}
      <figcaption className="text-[12px] font-semibold tracking-wide" style={{ color: "rgba(214,180,108,0.9)" }}>{source}</figcaption>
    </figure>
  );
}

/** the short personal reply after an answer */
function ReplyCard({ title, body, cta, onNext }: { title: string; body: string; cta: string; onNext: () => void }) {
  return (
    <div key={body} role="status" aria-live="polite" className="step-in mt-5 grid gap-2 rounded-2xl border p-[18px]" style={{ borderColor: "rgba(214,180,108,0.45)", backgroundColor: "rgba(20,16,10,0.94)" }}>
      <p className="flex items-center gap-2 font-display text-[18px]"><StarGlyph size={14} className="shrink-0 text-[rgb(214,180,108)]" />{title}</p>
      <p className="text-[15px] leading-relaxed text-white/80">{body}</p>
      <GoldButton className="mt-1.5 w-full" onClick={onNext}>{cta}</GoldButton>
    </div>
  );
}

const optCls = (on: boolean) => `flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-start transition disabled:cursor-default ${on ? "border-[rgb(214,180,108)] bg-[rgb(214,180,108)]/12" : "border-[rgb(214,180,108)]/25 bg-[rgba(6,30,23,0.62)] hover:border-[rgb(214,180,108)]/60 hover:bg-white/[0.06]"}`;
const Check = ({ on, multi }: { on: boolean; multi?: boolean }) => multi ? (
  <span aria-hidden className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-[1.5px]" style={{ borderColor: on ? GOLD : "rgba(214,180,108,0.45)", backgroundColor: on ? GOLD : "transparent" }}>
    {on ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="#1a140a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null}
  </span>
) : on ? <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg> : null;

/** waits for the browser's stored answers (the server renders only the stage) */
export function StartFunnel() {
  const ready = useHydrated();
  if (!ready) return <section className="stage min-h-[760px] sm:min-h-[820px]" aria-busy />;
  return <Funnel />;
}

function Funnel() {
  const p = usePlanT();
  const o = useO2();
  const goalLabel = useGoalLabel();
  const router = useRouter();
  // read in the browser only (this screen mounts after hydration), so the page needs no search-params boundary
  const [pers] = useState(() => new URLSearchParams(window.location.search).get("personalise") === "1");
  const [draft, setDraft] = useState<Draft>(() => {
    const d = (readDraft() ?? {}) as Draft;
    if (d.v === 2) return d;
    const prev = readV2();
    return { ...d, step: d.v === undefined && d.step ? 0 : d.step, v: 2, goals: prev?.goals ?? (d.goal ? [d.goal] : undefined), interests: prev?.interests, challenges: prev?.challenges };
  });
  // the draft stays in this browser (qmc.quiz.draft is not synced), so its step counts the website's questions
  const [step, setStep] = useState(() => Math.max(0, Math.min(draft.step ?? 0, Q.length - 1)));
  const [phase, setPhase] = useState<Phase>("quiz");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [v2, setV2] = useState<V2Answers | null>(null);
  const [name, setName] = useState(() => readName());
  const [reply, setReply] = useState<string | null>(null);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => { top.current?.scrollIntoView({ block: "nearest" }); }, [step, phase]);

  const save = (patch: Partial<Draft>, nextStep: number) => {
    const d: Draft = { ...draft, ...patch, step: nextStep, v: 2 };
    setDraft(d);
    writeDraft(d as QuizDraft);
    return d;
  };
  const answer = (patch: Partial<Draft>, text: string) => { save(patch, step + 1); setReply(text); };
  const pick = (patch: Partial<Draft>) => { save(patch, step); };
  const go = () => { setReply(null); if (step + 1 < Q.length) setStep(step + 1); else finish(draft); };
  const finish = (d: Draft) => {
    const goals = d.goals?.length ? d.goals : (["daily"] as GoalV2[]);
    const a: QuizAnswers = { goal: primaryGoal(goals), level: d.level ?? "slow", minutes: d.minutes ?? 10, reciter: d.reciter ?? null, prayer: !!d.prayer, motivation: d.motivation ?? null };
    writeJSON("tf:goal", websiteGoal(a));
    const old = pers ? readPlan() : null;
    const made = savePlan(a);
    if (old) { made.createdAt = old.createdAt; writeJSON("qmc.plan", made, true); }
    setPlan(made);
    setV2(saveV2(goals, d.interests ?? [], d.challenges ?? []));
    setPhase("story");
  };
  const back = () => { if (reply) { setReply(null); return; } if (step > 0) setStep(step - 1); else leave(); };
  /** "Skip": no draft left behind and, on the first visit, the 3-question card stays away too */
  const leave = () => { if (!pers) writeJSON("tf:onboardSkip", true); writeDraft(null); router.push("/today"); };
  const done = () => router.push("/today");
  const hi = name ? fmt(o.hiName, { name }) : o.hi;

  if (phase === "story") return <PeopleOfQuran plan={plan} goals={v2?.goals ?? []} name={name} onDone={() => setPhase("method")} />;
  if (phase === "method") return <MethodIntro goals={v2?.goals ?? []} name={name} onDone={() => setPhase("building")} />;
  if (phase === "building") return <Building onDone={() => setPhase("plan")} />;
  const hasTree = readGarden().trees.length > 0;
  if (phase === "plan" && plan && v2) return <PathView plan={plan} v2={v2} name={name} hasTree={hasTree} onNext={() => (hasTree ? done() : setPhase("garden"))} />;
  if (phase === "garden") return <PlantFlow onDone={done} onLater={done} />;

  const q = Q[step];
  const opt = (key: string, on: boolean, label: string, desc: string | null, onClick: () => void, multi?: boolean) => (
    <button key={key} type="button" onClick={onClick} disabled={!!reply} role={multi ? "checkbox" : undefined} aria-checked={multi ? on : undefined} aria-pressed={multi ? undefined : on} className={optCls(on)}>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold text-white">{label}</span>
        {desc ? <span className="mt-0.5 block text-[13px] leading-snug text-white/60">{desc}</span> : null}
      </span>
      <Check on={on} multi={multi} />
    </button>
  );
  const title = (s: string) => <h1 className="font-display mb-4 text-[28px] leading-tight sm:text-[32px]">{s}</h1>;
  const note = (s: string) => <p className="mt-3.5 text-[13px] leading-relaxed text-white/60">{s}</p>;
  const multiNext = (n: number, text: string, allowEmpty = false) => (
    <GoldButton className="mt-[18px] w-full" disabled={!allowEmpty && n === 0} onClick={() => answer({}, text)}>{p.next}</GoldButton>
  );

  return (
    <Stage progress={(step + 1) / Q.length}>
      <div ref={top} className="scroll-mt-20" />
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={back} aria-label={p.back} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.14]">
          <span aria-hidden className="inline-block text-[18px] rtl:-scale-x-100">←</span>
        </button>
        <p className={kicker}>{p.kicker} · {step + 1}/{Q.length}</p>
        <button type="button" onClick={leave} className="py-2 text-[14px] font-medium text-white/60 hover:text-white">{p.skip}</button>
      </div>
      <span role="progressbar" aria-valuemin={0} aria-valuemax={Q.length} aria-valuenow={step + 1} className="mt-3 block h-1 overflow-hidden rounded-full bg-white/[0.12]">
        <i className="block h-1 rounded-full transition-[width] duration-300" style={{ width: `${((step + 1) / Q.length) * 100}%`, backgroundColor: GOLD }} />
      </span>
      <div key={q} className="step-in mt-7">
        {q === "name" ? (
          <>
            {title(o.qName)}
            <form onSubmit={(e) => { e.preventDefault(); if (name.trim() && !reply) { saveName(name); answer({}, o.r_name); } }}>
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder={o.namePh} aria-label={o.qName} autoComplete="given-name" readOnly={!!reply}
                className="w-full rounded-2xl border bg-white/5 px-3.5 py-3 text-[17px] text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[rgb(214,180,108)]/60" style={{ borderColor: "rgba(214,180,108,0.4)" }} />
            </form>
            {note(o.nameD)}
            {!reply ? (
              <>
                <GoldButton className="mt-[18px] w-full" disabled={!name.trim()} onClick={() => { saveName(name); answer({}, o.r_name); }}>{p.next}</GoldButton>
                <button type="button" onClick={() => { setName(""); saveName(""); save({}, step + 1); setStep(step + 1); }} className="w-full py-3.5 text-center text-[14px] font-medium text-white/60 hover:text-white">{o.nameSkip}</button>
              </>
            ) : null}
          </>
        ) : null}
        {q === "goals" ? (
          <>
            {title(o.qGoals)}
            {note(o.chooseMany)}
            <div className="mt-3 grid gap-2">{GOALS_V2.map((g) => opt(g, !!draft.goals?.includes(g), goalLabel(g), g === "islam" || g === "children" ? o[`g_${g}D`] : p[`g_${g}D`], () => pick({ goals: toggle(draft.goals, g) }), true))}</div>
            {!reply ? multiNext(draft.goals?.length ?? 0, o.r_goals) : null}
          </>
        ) : null}
        {q === "interests" ? (
          <>
            {title(o.qInterests)}
            {note(o.chooseMany)}
            <div className="mt-3 flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const on = !!draft.interests?.includes(i);
                return (
                  <button key={i} type="button" role="checkbox" aria-checked={on} disabled={!!reply} onClick={() => pick({ interests: toggle(draft.interests, i) })}
                    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-2.5 text-[15px] font-semibold transition ${on ? "border-[rgb(214,180,108)] bg-[rgb(214,180,108)]/16" : "border-[rgb(214,180,108)]/30 bg-[rgba(6,30,23,0.62)] hover:bg-white/[0.06]"}`}>
                    {on ? <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg> : null}
                    {o[`i_${i}`]}
                  </button>
                );
              })}
            </div>
            {!reply ? multiNext(draft.interests?.length ?? 0, o.r_interests) : null}
          </>
        ) : null}
        {q === "challenges" ? (
          <>
            {title(o.qChallenges)}
            {note(o.challengesD)}
            <div className="mt-3 grid gap-2">{CHALLENGES.map((c) => opt(c, !!draft.challenges?.includes(c), o[`c_${c}`], null, () => pick({ challenges: toggle(draft.challenges, c) }), true))}</div>
            {!reply ? multiNext(draft.challenges?.length ?? 0, draft.challenges?.length ? o.r_challenges : o.r_challengesNone, true) : null}
          </>
        ) : null}
        {q === "level" ? (
          <>
            {title(p.qLevel)}
            <div className="grid gap-2">{LEVELS.map((l) => opt(l, draft.level === l, p[`l_${l}`], p[`l_${l}D`], () => answer({ level: l }, l === "none" ? o.r_level0 : o.r_level)))}</div>
          </>
        ) : null}
        {q === "minutes" ? (
          <>
            {title(p.qMinutes)}
            <div className="grid grid-cols-4 gap-2">
              {MINUTES.map((m) => {
                const on = draft.minutes === m;
                return (
                  <button key={m} type="button" disabled={!!reply} aria-pressed={on} aria-label={`${m} ${p.min}`} onClick={() => answer({ minutes: m }, fmt(o.r_minutes, { n: m }))}
                    className={`flex flex-col items-center rounded-2xl border py-[18px] transition ${on ? "border-[rgb(214,180,108)] bg-[rgb(214,180,108)]/12" : "border-[rgb(214,180,108)]/25 bg-[rgba(6,30,23,0.62)] hover:bg-white/[0.06]"}`}>
                    <span className="font-display text-[26px] leading-none">{m}</span>
                    <span className="mt-1 text-[12px] text-white/60">{p.min}</span>
                  </button>
                );
              })}
            </div>
            {note(p.minutesD)}
          </>
        ) : null}
        {q === "reciter" ? (
          <>
            {title(p.qReciter)}
            <div className="grid gap-2">{RECITERS.map((r) => opt(r.folder, draft.reciter === r.folder, r.name, null, () => {
              writeJSON("tf:reciter", r.folder, true);
              answer({ reciter: r.folder }, o.r_reciter);
            }))}</div>
            {note(p.reciterD)}
          </>
        ) : null}
        {q === "prayer" ? (
          <>
            {title(p.qPrayer)}
            {/* the plan's first step opens the prayer times; nothing is asked of the browser here */}
            <div className="grid gap-2">
              {opt("yes", draft.prayer === true, p.yes, null, () => answer({ prayer: true }, o.r_prayer))}
              {opt("no", draft.prayer === false, p.no, null, () => answer({ prayer: false }, o.r_prayer))}
            </div>
            {note(p.prayerD)}
          </>
        ) : null}
        {q === "motivation" ? (
          <>
            {title(p.qMotivation)}
            <div className="grid gap-2">{MOTIVATIONS.map((m) => opt(m, draft.motivation === m, p[`m_${m}`], null, () => answer({ motivation: m }, o.r_motivation)))}</div>
          </>
        ) : null}
        {reply ? <ReplyCard title={hi} body={reply} cta={p.next} onNext={go} /> : null}
      </div>
    </Stage>
  );
}

/** The story begins: "the people of the Quran" (Sahih al-Bukhari 5027 from the published hadith sources; Quran 35:29
 *  from the Quran data for the Shia tradition), personal with name, goal and reciter */
function PeopleOfQuran({ plan, goals, name, onDone }: { plan: Plan | null; goals: GoalV2[]; name: string; onDone: () => void }) {
  const st = useStory();
  const p = usePlanT();
  const web = useTranslations("shams");
  const label = useGoalLabel();
  const [trad] = useState(() => readTradition());
  const reciter = RECITERS.find((r) => r.folder === plan?.answers.reciter);
  const bukhari = useHadithQuote("bukhari", 5027, web("why1s"), (w) => fillS(st.quote, { t: w }), { text: web("why1"), source: `${web("why1s")} · ${st.para}` });
  const reciters = useVerseQuote(RECITERS_KEY, st.shiaQs.split(" · ")[0], { text: st.shiaQ, source: st.shiaQs });
  const goal = label(goals[0] ?? "daily");
  const quote = trad === "shia" ? reciters : bukhari;
  return (
    <Stage progress={1} horizon={0.37} veil={0.6}>
      <div className="step-in flex flex-1 flex-col gap-4 pt-24">
        <div className={`grid gap-4 ${glass}`} style={glassBg}>
          <p className={kicker}>{st.kicker}</p>
          <h1 className="font-display text-[30px] leading-tight sm:text-[34px]">{name ? fillS(st.peopleT, { name }) : st.peopleT0}</h1>
          <p className="text-[16px] leading-relaxed text-white/75">{st.peopleB}</p>
          <div className="min-h-[5rem]">{quote ? <RefQuote {...quote} /> : null}</div>
          <ul className="grid gap-1.5 text-[15px] font-medium leading-snug">
            <li>{fillS(st.goalLine, { goal })}</li>
            {reciter ? <li>{fillS(st.reciterLine, { reciter: reciter.name })}</li> : null}
          </ul>
        </div>
        <div className="flex-1" />
        <GoldButton className="w-full" onClick={onDone}>{p.next}</GoldButton>
      </div>
    </Stage>
  );
}

const METHOD_STEPS = ["listen", "understand", "repeat", "recite", "review"] as const;

/** The Shams Method in four screens: the five steps, why it works, the tree that grows with it, made for your goals */
function MethodIntro({ goals, name, onDone }: { goals: GoalV2[]; name: string; onDone: () => void }) {
  const o = useO2();
  const st = useStory();
  const p = usePlanT();
  const label = useGoalLabel();
  const [trad] = useState(() => readTradition());
  const goodTree = useVerseQuote(GOOD_TREE_KEY, st.goodTreeS.split(" · ")[0], { text: st.goodTree, source: st.goodTreeS });
  const [i, setI] = useState(0);
  const N = 4;
  const focus = goals.length ? goals : (["daily"] as GoalV2[]);
  const row = (title: string, desc: string, n: number) => (
    <li key={title} className="flex items-center gap-3.5">
      <span aria-hidden className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full border font-display text-[17px]" style={{ borderColor: "rgba(214,180,108,0.5)", backgroundColor: "rgba(214,180,108,0.1)", color: GOLD }}>{n}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold">{title}</span>
        {desc ? <span className="mt-0.5 block text-[13.5px] leading-snug text-white/60">{desc}</span> : null}
      </span>
    </li>
  );
  return (
    <Stage progress={1} horizon={0.37} veil={0.6}>
      <div className="flex items-center justify-between rounded-full px-1.5 py-1.5 backdrop-blur-sm" style={glassBg}>
        <button type="button" onClick={() => i > 0 && setI(i - 1)} aria-label={p.back} disabled={i === 0} className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.08] hover:bg-white/[0.14] ${i === 0 ? "invisible" : ""}`}>
          <span aria-hidden className="inline-block text-[18px] rtl:-scale-x-100">←</span>
        </button>
        <p className={kicker}>{o.m_kicker}</p>
        <span role="progressbar" aria-valuemin={1} aria-valuemax={N} aria-valuenow={i + 1} className="flex gap-1.5">
          {Array.from({ length: N }, (_, k) => <i key={k} className="block h-1.5 rounded-full" style={{ width: k === i ? 16 : 6, backgroundColor: k <= i ? GOLD : "rgba(255,255,255,0.2)" }} />)}
          <i className="block w-1.5" />
        </span>
      </div>
      <div key={i} className="step-in mt-8 flex flex-1 flex-col gap-[18px]">
        <div className={`grid gap-[18px] ${glass}`} style={glassBg}>
        {i === 0 ? (
          <>
            <h1 className="font-display text-[28px] leading-tight sm:text-[32px]">{name ? `${name}, ${o.m1T.charAt(0).toLocaleLowerCase()}${o.m1T.slice(1)}` : o.m1T}</h1>
            <p className="text-[16px] leading-relaxed text-white/75">{o.m1B}</p>
            <ol className="mt-1 grid gap-3.5">{METHOD_STEPS.map((k, n) => row(o[`st_${k}`], o[`st_${k}D`], n + 1))}</ol>
          </>
        ) : null}
        {i === 1 ? (
          <>
            <h1 className="font-display text-[28px] leading-tight sm:text-[32px]">{o.m2T}</h1>
            <p className="text-[16px] leading-relaxed text-white/75">{o.m2B}</p>
            <ul className="grid gap-3">{[o.m2a, o.m2b, o.m2c].map((s) => (
              <li key={s} className="flex items-start gap-3 text-[16px] font-semibold"><StarGlyph size={14} className="mt-1 shrink-0 text-[rgb(214,180,108)]" />{s}</li>
            ))}</ul>
          </>
        ) : null}
        {i === 2 ? (
          <>
            <h1 className="font-display text-[28px] leading-tight sm:text-[32px]">{o.m3T}</h1>
            <p className="text-[16px] leading-relaxed text-white/75">{o.m3B}</p>
            <p className="text-[15.5px] font-semibold leading-relaxed">{st.treeB}</p>
            <div className="grid gap-3">
              {goodTree ? <RefQuote {...goodTree} /> : null}
              {trad !== "shia" ? <RefQuote text={st.hearts} source={st.heartsS} /> : null}
              {trad !== "shia" ? <RefQuote text={st.paradise} source={st.paradiseS} /> : null}
            </div>
            <p className="text-[14.5px] italic leading-relaxed" style={{ color: GOLD }}>{st.sabr}</p>
          </>
        ) : null}
        {i === 3 ? (
          <>
            <h1 className="font-display text-[28px] leading-tight sm:text-[32px]">{o.m4T}</h1>
            <p className="text-[16px] leading-relaxed text-white/75">{fmt(o.m4B, { goals: joinList(focus.map(label)) })}</p>
            <ul className="grid gap-3">{focus.slice(0, 5).map((g, n) => row(label(g), o[`f_${g}`], n + 1))}</ul>
          </>
        ) : null}
        </div>
        <div className="flex-1" />
        <GoldButton className="mt-6 w-full" onClick={() => (i + 1 < N ? setI(i + 1) : onDone())}>{i + 1 < N ? p.next : o.pathKicker}</GoldButton>
      </div>
    </Stage>
  );
}

/** "Building your plan …": three lines that tick off one after another (instant with reduced motion) */
function Building({ onDone }: { onDone: () => void }) {
  const p = usePlanT();
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    const gap = reduce ? 250 : 750;
    const ids = [1, 2, 3].map((k) => setTimeout(() => setN(k), gap * k));
    ids.push(setTimeout(onDone, gap * 3 + 450));
    return () => ids.forEach(clearTimeout);
  }, [reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Stage progress={0.92} veil={0.5}>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-display text-center text-[28px] leading-tight sm:text-[32px]">{p.building}</h1>
        <ul className="mt-6 grid gap-3" aria-live="polite">
          {[p.b1, p.b2, p.b3].map((s, k) => (
            <li key={s} className="flex items-center gap-2.5 text-[15px] font-medium transition-opacity" style={{ opacity: n > k ? 1 : 0.35 }}>
              <Check on={n > k} />
              {n > k ? null : <span aria-hidden className="h-5 w-5 shrink-0 rounded-full border-[1.5px]" style={{ borderColor: "rgba(214,180,108,0.45)" }} />}
              {s}
            </li>
          ))}
        </ul>
      </div>
    </Stage>
  );
}

/** "Your personal path": name, goals, interests, daily minutes, courses and the 30-day plan */
function PathView({ plan, v2, name, hasTree, onNext }: { plan: Plan; v2: V2Answers; name: string; hasTree: boolean; onNext: () => void }) {
  const p = usePlanT();
  const st = useStory();
  const o = useO2();
  const label = useGoalLabel();
  const a = plan.answers;
  const interests = v2.interests.map((i) => o[`i_${i}`]);
  const chip = (s: string) => <li key={s} className="rounded-full border px-3 py-1.5 text-[13.5px] font-medium" style={{ borderColor: "rgba(214,180,108,0.45)", backgroundColor: "rgba(214,180,108,0.1)" }}>{s}</li>;
  const section = (title: string, body: React.ReactNode) => (
    <section className="grid gap-2.5 rounded-2xl border p-4" style={{ borderColor: "rgba(214,180,108,0.25)", backgroundColor: "rgba(6,30,23,0.7)" }}>
      <h2 className={kicker}>{title}</h2>
      {body}
    </section>
  );
  const first = label(v2.goals[0] ?? a.goal);
  return (
    <Stage progress={1} horizon={0.27} veil={0.5}>
      <div className="step-in grid gap-3 pt-40">
        {/* the heading stands on the brightest part of the landscape (the pavilion): a dark glass panel keeps it readable */}
        <div className={`grid gap-3 ${glass}`} style={glassBg}>
        <p className={kicker}>{o.pathKicker}</p>
        <h1 className="font-display text-[30px] leading-tight sm:text-[34px]">{name ? fmt(o.pathTName, { name }) : o.pathT}</h1>
        <p className="text-[15.5px] font-semibold leading-relaxed text-[#f3e2b6]">{name ? fillS(st.begins, { name, goal: first }) : fillS(st.begins0, { goal: first })}</p>
        {a.motivation ? <p className="text-[14px] italic" style={{ color: GOLD }}>{p[`m_${a.motivation}`]}</p> : null}
        </div>
        {section(o.pathGoals, <ul className="flex flex-wrap gap-2">{(v2.goals.length ? v2.goals : [a.goal]).map((g) => chip(label(g)))}</ul>)}
        {interests.length ? section(o.pathInterests, (
          <>
            <ul className="flex flex-wrap gap-2">{interests.map(chip)}</ul>
            <p className="text-[13.5px] leading-snug text-white/60">{fmt(o.pathFeed, { list: joinList(interests.slice(0, 3)) })}</p>
          </>
        )) : null}
        {section(o.pathTime, <p className="font-display text-[22px]">{fmt(p.stepMin, { n: a.minutes })}</p>)}
        {v2.courses.length ? section(o.pathCourses, (
          <ul className="grid gap-2">{v2.courses.map((c) => (
            <li key={c} className="flex items-center gap-2.5 text-[15px] font-semibold"><StarGlyph size={12} className="shrink-0 text-[rgb(214,180,108)]" />{o[`co_${c}`]}</li>
          ))}</ul>
        )) : null}
        <h2 className={`${kicker} mt-2.5`}>{o.pathWeeks}</h2>
        <ol className="grid gap-3">
          {plan.weeks.map((w, i) => (
            <li key={i} className="rounded-2xl border p-4" style={{ borderColor: "rgba(214,180,108,0.28)", backgroundColor: "rgba(6,30,23,0.7)" }}>
              <p className={kicker}>{fmt(p.week, { n: i + 1 })}</p>
              <p className="font-display mt-1 text-[18px]">{p[`w_${w.theme}`]}</p>
              <ul className="mt-2.5 grid gap-1.5">
                {w.steps.map((id) => (
                  <li key={id} className="flex items-center gap-2 text-[14px] text-white/80">
                    <svg aria-hidden viewBox="0 0 24 24" className="h-[15px] w-[15px] shrink-0" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg>
                    {p[`s_${id}`]}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <GoldButton className="mt-3 w-full" onClick={onNext}>{hasTree ? o.pathCtaTree : o.pathCta}</GoldButton>
      </div>
    </Stage>
  );
}
