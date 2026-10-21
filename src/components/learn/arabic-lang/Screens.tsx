"use client";
// The Arabic language course on the website (A1 → C1), web port of mobile/src/features/arabic-lang/Screens.tsx:
//   LangPathScreen        /arabic/lang              units and lessons by CEFR level, unlock order, daily goal, streak, certificates
//   LangLessonScreen      /arabic/lang/[lesson]     explanation, dialogue, exercises; unit tests under the exam rules
//   LangCertificateScreen /arabic/lang/certificate  device certificates per level + the verifiable one (VerifiedCertLink)
//   RootExplorerScreen    /arabic/lang/roots        a root and its family of words from the Quran vocabulary
// Unit tests use the exam rules (kind "ar-unit", ref = unit number); the final tests of A1/A2/B1/B2/C1 lead to verifiable
// certificates, C1 with a recitation part (arabicRecitePlan). On the website every unit is free, so the Pro card is left out.
// The Quran frequency track (unit 17) loads its word list at run time; when that fails the lesson shows a retry state.
import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { intlLocale, useLang } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { meaning } from "@/lib/vocabI18n";
import { findWordPosition, normalizeArabic } from "@/lib/vocabStudy";
import type { Word } from "@/lib/vocab";
import { addOwnCards } from "@/lib/learn/srs/store";
import { loadVerse, type VWord } from "@/lib/learn/srs/verse";
import { buildLesson, prepareLesson, scored, type Ex } from "@/lib/learn/arabic-lang/build";
import { ALL_WORDS, LESSONS, LEVELS, PASS, UNITS, deckWords, lessonById, unitOfLesson } from "@/lib/learn/arabic-lang/curriculum";
import { isDone, lessonOpen, nextLesson, saveLesson, setGoal, streak, todayCount, useLangProgress, type LangProgress } from "@/lib/learn/arabic-lang/progress";
import { useLT } from "@/lib/learn/arabic-lang/texts";
import { tx, type Lesson, type Level, type Unit } from "@/lib/learn/arabic-lang/types";
import { useExamSession } from "@/lib/learn/exam/integrity";
import { arabicRecitePlan } from "@/lib/learn/exam/plans";
import { ExamBar, ExamBlocked, ExamVerdict, VerifiedCertLink } from "@/components/learn/exam";
import { arabicVoiceWithin, tone, useArabicVoice } from "@/components/learn/media";
import { useAudioT } from "@/components/learn/audioText";
import { shareOrCopy } from "@/components/learn/coursekit/share";
import { Bar, Card, GoldButton, GoldLink, LearnHero, LearnMain, OutlineButton, OutlineLink, Pill, SectionTitle, Spinner, StageStats } from "@/components/learn/ui";
import { IconClose, IconFlame, IconLock, IconRepeat, IconShare, IconTrophy } from "@/components/Icons";
import { HomeCorners, StarGlyph } from "@/components/art/HomeOrnaments";
import { Ar, ChooseCard, DialogueView, IntroCard, SpeakCard, SpotCard, TilesCard, TypeCard } from "./Exercises";
import { cefr } from "./cefr";
import { useLW } from "./strings";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const MAP = "/arabic/lang";
export const langLessonHref = (id: string) => `${MAP}/${id}`;
const RED_TEXT = "text-red-700 dark:text-red-400";
const doneCount = (p: LangProgress) => LESSONS.filter((l) => isDone(p, l.id)).length;

// ---------- path ----------
export function LangPathScreen() {
  const lt = useLT();
  const lw = useLW();
  const { lang } = useLang();
  const hydrated = useHydrated();
  const p = useLangProgress();
  const next = nextLesson(p);
  const nextUnit = next ? unitOfLesson(next.id) : undefined;
  const today = todayCount(p);
  const days = streak(p);
  const started = hydrated && Object.keys(p.done).length > 0;
  const certN = LEVELS.filter(({ level }) => p.certs[level]).length;
  // the unit with the next lesson is open; the learner can open or close any other
  const [openUnits, setOpenUnits] = useState<Record<number, boolean>>({});
  const isExpanded = (n: number) => openUnits[n] ?? n === (nextUnit?.n ?? 1);

  const groups = LEVELS.map(({ level, lastUnit }) => ({ level, lastUnit, units: UNITS.filter((u) => u.level === level) }));

  return (
    <>
      <LearnHero uid="arlang" kicker={lt("kicker")} title={lt("title")} lead={cefr(lt("lead"))} word="ع ل م" back={{ href: "/arabic", label: lw("back") }}
        aside={hydrated ? <StageStats items={[{ n: `${doneCount(p)}/${LESSONS.length}`, l: lw("lessonsLbl") }, { n: `${certN}/${LEVELS.length}`, l: lw("certsLbl") }, { n: days, l: lw("daysLbl") }]} /> : undefined}>
        {next && nextUnit ? <GoldLink href={langLessonHref(next.id)}>{started ? lt("continue") : lt("start")} · {tx(next.title, lang)}</GoldLink> : null}
      </LearnHero>
      <LearnMain>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* daily goal and streak */}
          <Card>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[17px] font-bold">{lt("goal")}</h2>
              {days ? <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted"><IconFlame className="h-4 w-4 text-[rgb(var(--hm-gold))]" />{lt("streak", { n: days })}</span> : null}
            </div>
            <Bar value={today / p.goal} className="mt-3" label={lt("goal")} />
            <p className="mt-2 text-sm text-muted" aria-live="polite">{today >= p.goal ? lt("goalMet") : lt("today", { d: today, n: p.goal })}</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={lt("goal")}>
              {[1, 2, 3].map((n) => (
                <button key={n} type="button" onClick={() => setGoal(n)} aria-pressed={p.goal === n}
                  className={cx("h-9 rounded-full border px-3.5 text-[13px] font-semibold transition", p.goal === n ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70")}>
                  {lt("goalN", { n })}
                </button>
              ))}
            </div>
          </Card>

          {/* root explorer and certificates */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-1">
            <Link href={`${MAP}/roots`} className="hm-card hm-lift relative flex flex-col gap-1 p-4">
              <span aria-hidden lang="ar" dir="rtl" className="font-arabic w-fit text-[22px] leading-[1.7] text-[rgb(var(--hm-gold-d))]">ك ت ب</span>
              <span className="text-[15px] font-bold">{lt("roots")}</span>
            </Link>
            <Link href={`${MAP}/certificate`} className="hm-card hm-lift relative flex flex-col gap-1 p-4">
              <span className="flex h-[38px] items-center gap-1.5" aria-hidden>
                {LEVELS.map(({ level }) => <span key={level} data-latin-digits="" className={cx("text-[13px] font-bold", hydrated && p.certs[level] ? "text-[rgb(var(--hm-gold-d))]" : "text-line")}>{level}</span>)}
              </span>
              <span className="text-[15px] font-bold">{lt("certs")}{hydrated && certN ? ` · ${certN}` : ""}</span>
            </Link>
          </div>
        </div>

        <SectionTitle title={lw("levels")} lead={cefr(lw("levelsLead"))} className="mt-12" />

        {groups.map((g) => {
          const first = g.units[0]?.n ?? 0, last = g.units[g.units.length - 1]?.n ?? 0;
          const cert = hydrated ? p.certs[g.level] : undefined;
          return (
            <section key={g.level} aria-labelledby={`lvl-${g.level}`} className="mt-10">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2 border-b border-line pb-3">
                <h3 id={`lvl-${g.level}`} className="flex items-baseline gap-3">
                  <span data-latin-digits="" className="font-display text-[34px] leading-none text-[rgb(var(--hm-gold-d))]">{g.level}</span>
                  <span className="text-[17px] font-bold">{lw(`lvl_${g.level}` as "lvl_A1")}</span>
                </h3>
                <span className="text-[13px] text-muted">{first === last ? lt("unit", { n: first }) : lw("levelUnits", { a: first, b: last })}</span>
                <span className="ms-auto">
                  {cert ? <Pill tone="accent"><StarGlyph size={10} />{cefr(`${lt("certTitle", { level: g.level })} · ${cert.pct} %`)}</Pill>
                    : <Pill tone="gold">{lw("certAfter", { n: g.lastUnit })}</Pill>}
                </span>
              </div>
              <div className="mt-4 grid gap-4">
                {g.units.map((u) => <UnitCard key={u.n} u={u} p={p} hydrated={hydrated} nextId={next?.id} expanded={isExpanded(u.n)} onToggle={() => setOpenUnits((o) => ({ ...o, [u.n]: !isExpanded(u.n) }))} />)}
              </div>
            </section>
          );
        })}
      </LearnMain>
    </>
  );
}

function UnitCard({ u, p, hydrated, nextId, expanded, onToggle }: { u: Unit; p: LangProgress; hydrated: boolean; nextId?: string; expanded: boolean; onToggle: () => void }) {
  const lt = useLT();
  const lw = useLW();
  const { lang } = useLang();
  const done = hydrated ? u.lessons.filter((l) => isDone(p, l.id)).length : 0;
  const complete = done === u.lessons.length;
  return (
    <div className="hm-card relative p-5 sm:p-6">
      <HomeCorners />
      <div className="flex items-start gap-4">
        <span aria-hidden className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg",
          complete ? "stage border-2 border-[#c9a65e] text-[#f3e2b6]" : done ? "bg-accent text-white" : "border-2 border-line bg-surface")}>{u.n}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.13em] text-[rgb(var(--hm-gold-d))] rtl:tracking-normal">{cefr(`${lt("unit", { n: u.n })} · ${u.level}`)}</p>
          <h4 className="font-display mt-0.5 text-[21px] leading-tight">{tx(u.title, lang)}</h4>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{cefr(tx(u.lead, lang))}</p>
          <div className="mt-3 flex items-center gap-3">
            <Bar value={done / u.lessons.length} className="flex-1" label={lt("lessonsDone", { d: done, n: u.lessons.length })} />
            <span className="text-[12.5px] font-semibold tabular-nums text-muted">{lt("lessonsDone", { d: done, n: u.lessons.length })}</span>
          </div>
        </div>
      </div>
      <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={`unit-${u.n}`}
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
        {expanded ? lw("hideLessons") : lw("showLessons")}
      </button>
      {expanded ? (
        <ol id={`unit-${u.n}`} className="rise mt-2 grid gap-2">
          {u.lessons.map((l, i) => {
            const d = hydrated && isDone(p, l.id);
            const can = hydrated && lessonOpen(p, l.id);
            const cur = nextId === l.id;
            const score = hydrated ? p.done[l.id] : undefined;
            const cls = cx("flex min-h-12 items-center gap-3 rounded-full border px-3 py-2", cur ? "border-2 border-[rgb(var(--hm-gold))]" : "border-line", d ? "bg-accent-soft" : "bg-[rgb(var(--bg))]");
            const badge = (
              <span aria-hidden className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-bold [&_svg]:h-4 [&_svg]:w-4",
                d ? "border-accent bg-accent text-white" : l.test ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))] text-white" : "border-line bg-surface")}>
                {d ? "✓" : !can ? <IconLock /> : l.test ? <IconTrophy className="h-4 w-4" /> : i + 1}
              </span>
            );
            const label = <span className={cx("min-w-0 flex-1 text-[14.5px] leading-snug", cur ? "font-bold" : "font-semibold")}>{tx(l.title, lang)}{l.test ? <span className="sr-only"> ({lw("test")})</span> : null}</span>;
            const trail = score ? <span className="text-[12px] font-semibold tabular-nums text-muted">{`${Math.round(score.score * 100)} %`}</span> : can ? <span aria-hidden className="text-muted rtl:-scale-x-100">›</span> : null;
            return (
              <li key={l.id}>
                {can ? (
                  <Link href={langLessonHref(l.id)} aria-current={cur ? "step" : undefined} className={cx(cls, "transition hover:border-[rgb(var(--hm-gold))]/70")}>{badge}{label}{trail}</Link>
                ) : (
                  <div className={cx(cls, "opacity-55")} aria-disabled>
                    {badge}{label}<span className="sr-only">{lt("locked")}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}

// ---------- lesson ----------
function Centered({ children }: { children: React.ReactNode }) {
  return <LearnMain><div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">{children}</div></LearnMain>;
}

type Q = { ex: Ex; first: boolean };
export function LangLessonScreen({ id }: { id: string }) {
  const lt = useLT();
  const lw = useLW();
  const { lang } = useLang();
  const router = useRouter();
  const hydrated = useHydrated();
  const p = useLangProgress();
  const lesson = lessonById(id);
  const unit = unitOfLesson(id);
  const [phase, setPhase] = useState<"explain" | "dialogue" | "loading" | "error" | "ex" | "done">("explain");
  const [queue, setQueue] = useState<Q[]>([]);
  const [idx, setIdx] = useState(0);
  const [fb, setFb] = useState<{ ok: boolean; correct: string } | null>(null);
  const [right, setRight] = useState(0);
  const [result, setResult] = useState<{ score: number; added: number } | null>(null);
  const [shake, setShake] = useState(0);
  // unit tests follow the exam rules (src/lib/learn/exam); the final test of a level leads to a verifiable certificate
  const ex = useExamSession(lesson?.test && unit ? "ar-unit" : null, String(unit?.n ?? ""), { active: phase === "ex", recite: (rand) => arabicRecitePlan(rand) });
  const { canSpeak, ready: voiceReady } = useArabicVoice();
  const at = useAudioT();

  useEffect(() => { setPhase("explain"); setIdx(0); setFb(null); setRight(0); setResult(null); }, [id]);
  useEffect(() => { if (typeof window !== "undefined") window.scrollTo({ top: 0 }); }, [idx, phase]);

  if (!lesson || !unit) return <Centered><p className="text-muted">{lw("notFound")}</p><OutlineLink href={MAP}>{lt("toMap")}</OutlineLink></Centered>;
  if (!hydrated) return <Centered><Spinner label={lw("loading")} /></Centered>;
  const total = queue.filter((q) => q.first && scored(q.ex)).length;

  const begin = () => {
    setPhase("loading");
    // built with the voice lookup's answer (the browser lists its voices a moment after loading), not with a value
    // from an earlier render
    const go = (voice: unknown) => {
      const built = buildLesson(lesson, lang, { canSpeak: !!voice }).map((e) => ({ ex: e, first: true }));
      // the Quran frequency track needs its word list: without it there is nothing to practise
      if (!built.some((q) => scored(q.ex))) { setPhase("error"); return; }
      setQueue(built);
      setIdx(0); setRight(0); setFb(null); setResult(null);
      setPhase("ex");
    };
    const voice = arabicVoiceWithin(1500);
    prepareLesson(lesson, lang).catch(() => undefined).then(() => voice).then(go, () => go(null));
  };
  const onCheck = (ok: boolean, correct: string) => {
    const q = queue[idx];
    setFb({ ok, correct });
    tone(ok);
    if (ok) { if (q.first) setRight((r) => r + 1); }
    else { setShake((s) => s + 1); setQueue((qs) => [...qs, { ex: q.ex, first: false }]); }
  };
  const finish = (rightNow: number) => {
    const score = total ? rightNow / total : 1;
    const passed = !lesson.test || score >= PASS;
    let added = 0;
    if (passed) {
      saveLesson(lesson.id, score);
      const ids = deckWords(lesson).map((w) => `word:${w.id}`);
      if (ids.length) added = addOwnCards(ids);
    }
    setResult({ score, added });
    setPhase("done");
    if (lesson.test) ex.finish(rightNow, total);
  };
  const advance = () => {
    setFb(null);
    if (idx + 1 >= queue.length) finish(right);
    else setIdx(idx + 1);
  };
  const skip = () => { setQueue((qs) => qs.map((q, i) => (i === idx ? { ...q, first: false } : q))); advance(); };

  const cur = queue[idx];
  const nextL = LESSONS[LESSONS.findIndex((l) => l.id === lesson.id) + 1];
  const open = lessonOpen(p, lesson.id);
  const header = (
    <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pt-5">
      <Link href={MAP} aria-label={lt("quit")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-[rgb(var(--hm-gold))]/10 hover:text-[rgb(var(--ink))]"><IconClose /></Link>
      {phase === "ex" ? <Bar value={queue.length ? idx / queue.length : 0} className="flex-1" label={tx(lesson.title, lang)} />
        : <span className="flex-1 truncate text-[13px] font-semibold text-muted">{cefr(`${lt("unit", { n: unit.n })} · ${unit.level} · ${tx(unit.title, lang)}`)}</span>}
    </div>
  );

  let body: React.ReactNode = null;
  if (!open) {
    body = (
      <div className="grid gap-4">
        <h1 className="font-display text-[30px] leading-tight">{tx(lesson.title, lang)}</h1>
        <Card><p className="flex items-center gap-2 text-[15px]"><span className="text-muted" aria-hidden><IconLock /></span>{lt("locked")}</p></Card>
        <OutlineLink href={MAP} className="w-fit">{lt("toMap")}</OutlineLink>
      </div>
    );
  } else if (phase === "explain") {
    body = (
      <div className="rise grid gap-4">
        <h1 className="font-display text-[30px] leading-tight sm:text-4xl">{tx(lesson.title, lang)}</h1>
        <Card>
          <p className="hm-k text-[rgb(var(--hm-gold-d))]">{lt("explain")}</p>
          <p className="mt-2 text-base leading-relaxed">{tx(lesson.expl, lang)}</p>
        </Card>
        {lesson.test && ex.rule ? <p className="text-[13px] leading-relaxed text-muted">{`${lw("examRules")}: ${Math.round(ex.rule.examSec / 60)} min · ${Math.round(ex.rule.pass * 100)} %`}</p> : null}
        {lesson.conj ? <ConjTable lesson={lesson} /> : null}
        {lesson.roots ? <OutlineLink href={`${MAP}/roots?r=${encodeURIComponent(lesson.roots[0])}`} className="w-fit">{lt("openRoots")}</OutlineLink> : null}
        {voiceReady && !canSpeak ? <p className="text-[13.5px] leading-relaxed text-muted">{at("noVoice")}</p> : null}
        <GoldButton onClick={() => (lesson.lines ? setPhase("dialogue") : begin())}>{lt("startEx")}</GoldButton>
      </div>
    );
  } else if (phase === "dialogue" && lesson.lines) {
    body = <div className="rise"><DialogueView lines={lesson.lines} onNext={begin} /></div>;
  } else if (phase === "loading") {
    body = <div className="flex justify-center py-16"><Spinner label={lw("loading")} /></div>;
  } else if (phase === "error") {
    body = (
      <div className="grid justify-items-center gap-4 py-10 text-center">
        <p className="max-w-md text-base leading-relaxed text-muted" role="status">{lw("freqError")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <GoldButton onClick={begin}>{lw("tryAgain")}</GoldButton>
          <OutlineLink href={MAP}>{lt("toMap")}</OutlineLink>
        </div>
      </div>
    );
  } else if (phase === "ex" && lesson.test && ex.phase === "blocked") {
    body = <div className="grid gap-3"><ExamBlocked session={ex} /><OutlineLink href={MAP} className="w-fit">{lt("toMap")}</OutlineLink></div>;
  } else if (phase === "ex" && lesson.test && ex.phase === "void") {
    body = <div className="grid gap-3"><ExamVerdict session={ex} /><OutlineLink href={MAP} className="w-fit">{lt("toMap")}</OutlineLink></div>;
  } else if (phase === "ex" && lesson.test && !ex.ready) {
    body = <div className="flex justify-center py-16"><Spinner /></div>;
  } else if (phase === "ex" && cur) {
    body = (
      <div key={idx} className="rise">
        {lesson.test ? <div className="mb-4"><ExamBar session={ex} showRules={idx === 0} /></div> : null}
        <div key={`s${shake}`} className={cx(fb && "pointer-events-none", fb && !fb.ok && "pa-shake")} aria-disabled={!!fb || undefined}>
          {cur.ex.k === "intro" ? <IntroCard item={cur.ex.item} onNext={advance} />
            : cur.ex.k === "choose" || cur.ex.k === "listen" || cur.ex.k === "conj" ? <ChooseCard ex={cur.ex} onCheck={onCheck} />
            : cur.ex.k === "tiles" ? <TilesCard ex={cur.ex} onCheck={onCheck} />
            : cur.ex.k === "type" ? <TypeCard ex={cur.ex} onCheck={onCheck} />
            : cur.ex.k === "speak" ? <SpeakCard ex={cur.ex} onCheck={onCheck} onSkip={skip} />
            : <SpotCard ex={cur.ex} onCheck={onCheck} />}
        </div>
      </div>
    );
  } else if (phase === "done" && result) {
    const passed = !lesson.test || result.score >= PASS;
    body = (
      <div className="rise mx-auto grid max-w-md gap-4" aria-live="polite">
        <div className="stage relative overflow-hidden rounded-xl p-6 text-center text-white">
          <span className="mx-auto flex justify-center text-[rgb(var(--gold))]">{passed ? <IconTrophy className="h-9 w-9" /> : <span className="[&_svg]:h-9 [&_svg]:w-9"><IconRepeat /></span>}</span>
          <h1 className="font-display mt-2 text-[26px] leading-tight">{lesson.test ? (passed ? lt("testPassed") : lt("almost")) : lt("complete")}</h1>
          <p className="mt-2 text-[15px] text-white/75">{lt("score", { p: Math.round(result.score * 100) })}</p>
          {lesson.test && !passed ? <p className="mt-1 text-sm text-white/70">{lt("needPass", { p: Math.round(PASS * 100) })}</p> : null}
          {result.added ? <p className="mt-1 text-sm font-semibold text-[#f3e2b6]">{lt("wordsAdded", { n: result.added })}</p> : null}
          <div className="pa-arcade" />
        </div>
        {lesson.test ? <ExamVerdict session={ex} /> : null}
        {nextL && passed ? <GoldLink href={langLessonHref(nextL.id)}>{lt("nextLesson")}</GoldLink> : null}
        {ex.phase === "recite" || ex.phase === "submitting" ? null : <OutlineButton onClick={begin}>{lt("retry")}</OutlineButton>}
        <OutlineButton onClick={() => router.push(MAP)}>{lt("toMap")}</OutlineButton>
      </div>
    );
  }

  return (
    <div>
      {header}
      <main className="mx-auto max-w-2xl px-4 pb-56 pt-6 sm:px-5">{body}</main>
      {fb ? (
        <div className={cx("fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 border-t-2 pb-3.5 pt-3.5 backdrop-blur lg:bottom-0 lg:pb-[calc(env(safe-area-inset-bottom)+14px)]",
          fb.ok ? "border-accent bg-accent-soft" : "border-red-600/60 bg-red-50 dark:bg-red-950/60")}>
          <div className="mx-auto flex max-w-2xl flex-col gap-2 px-4">
            <p aria-live="assertive" className={cx("text-base font-bold", fb.ok ? "text-accent" : RED_TEXT)}>{fb.ok ? lt("right") : lt("wrong")}</p>
            {!fb.ok && fb.correct ? <Ar size={24}>{fb.correct}</Ar> : null}
            <GoldButton onClick={advance} className="w-full">{lt("next")}</GoldButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ConjTable({ lesson }: { lesson: Lesson }) {
  const lw = useLW();
  const { lang } = useLang();
  const c = lesson.conj!;
  return (
    <div className="hm-card relative overflow-hidden !p-0">
      <table className="w-full border-collapse text-start">
        <caption className="border-b border-line px-4 py-3 text-start text-[15px] font-bold">{tx(c.title, lang)}</caption>
        <thead className="sr-only"><tr><th scope="col">{lw("conjLabel")}</th><th scope="col">{lw("conjForm")}</th><th scope="col">tr</th></tr></thead>
        <tbody>
          {c.rows.map(([label, form, tr], i) => (
            <tr key={i} className={i ? "border-t border-line" : ""}>
              <th scope="row" className="w-[5.5rem] px-4 font-normal"><Ar size={18} className="text-[rgb(var(--hm-gold-d))]">{label}</Ar></th>
              <td className="px-2"><Ar size={22}>{form}</Ar></td>
              <td className="w-[7rem] px-4 text-[13px] text-muted">{tr}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------- root explorer ----------
const rootKey = (r: string) => normalizeArabic(r.replace(/\s+/g, ""));
let ROOTS_CACHE: { root: string; n: number }[] | null = null;
function roots() {
  if (!ROOTS_CACHE) {
    const m = new Map<string, { root: string; n: number }>();
    for (const w of ALL_WORDS) if (w.root) { const k = rootKey(w.root); const e = m.get(k); if (e) e.n++; else m.set(k, { root: w.root, n: 1 }); }
    ROOTS_CACHE = [...m.values()].sort((a, b) => b.n - a.n);
  }
  return ROOTS_CACHE;
}

export function RootExplorerScreen({ initial }: { initial?: string }) {
  const lt = useLT();
  const lw = useLW();
  const { lang } = useLang();
  const [q, setQ] = useState(initial ?? "");
  const key = rootKey(q);
  const top = useMemo(() => roots().slice(0, 18), []);
  const words = useMemo(() => {
    if (key.length < 2) return [];
    const seen = new Set<string>();
    return ALL_WORDS.filter((w) => w.root && rootKey(w.root) === key && !seen.has(w.ar) && (seen.add(w.ar), true));
  }, [key]);
  return (
    <>
      <LearnHero uid="arroots" title={lt("roots")} lead={lt("rootsLead")} word="ك ت ب" back={{ href: MAP, label: lw("backPath") }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={lt("rootPh")} aria-label={lt("rootPh")} dir="rtl" lang="ar" autoComplete="off" spellCheck={false}
          className="font-arabic h-14 w-full max-w-md rounded-lg border border-[rgba(201,166,94,0.5)] bg-white/[0.06] px-4 text-[24px] text-white outline-none placeholder:text-white/45 focus:border-[rgb(var(--gold))]" />
      </LearnHero>
      <LearnMain>
        <p className="hm-k text-[rgb(var(--hm-gold-d))]">{lt("rootPick")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {top.map((r) => {
            const on = rootKey(r.root) === key;
            return (
              <button key={r.root} type="button" onClick={() => setQ(r.root)} aria-pressed={on}
                className={cx("rounded-full border px-3.5 font-arabic text-[18px] leading-[1.9] transition", on ? "border-accent bg-accent-soft" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70")}>
                <span lang="ar" dir="rtl">{r.root}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 grid gap-3" aria-live="polite">
          {key.length >= 2 && !words.length ? <p className="text-sm text-muted">{lt("rootNone")}</p> : null}
          {words.length ? <p className="text-[13px] font-semibold text-muted">{lw("rootsCount", { n: words.length })}</p> : null}
          {words.map((w, i) => <RootWord key={w.id} w={w} lang={lang} showVerse={i < 4} />)}
        </div>
      </LearnMain>
    </>
  );
}

function RootWord({ w, lang, showVerse }: { w: Word; lang: string; showVerse: boolean }) {
  const lt = useLT();
  const [v, setV] = useState<{ words: VWord[]; pos: number | null } | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!showVerse || !w.ex) return;
    let live = true;
    setLoading(true);
    loadVerse(w.ex.key, lang).then((d) => { if (live) setV({ words: d.words, pos: findWordPosition(w, d.words) }); }).catch(() => undefined).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [w, lang, showVerse]);
  return (
    <div className="hm-card relative p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold">{meaning(w, lang)}</p>
          <p className="text-[13px] text-muted">{w.tr}</p>
        </div>
        <span lang="ar" dir="rtl" className="font-arabic text-[28px] leading-[1.8] text-[rgb(var(--hm-gold-d))]">{w.ar}</span>
      </div>
      {showVerse && w.ex ? (
        <div className="mt-2.5 border-t border-line pt-2">
          <p className="hm-k text-muted">{`${lt("inQuran")} · ${w.ex.key}`}</p>
          {loading ? <Spinner className="mt-2" /> : v ? (
            <p lang="ar" dir="rtl" className="font-arabic mt-1 text-[22px] leading-[1.9]">
              {v.words.map((x, i) => <span key={x.position} className={x.position === v.pos ? "text-accent underline underline-offset-8" : undefined}>{`${i ? " " : ""}${x.text}`}</span>)}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ---------- certificates ----------
export function LangCertificateScreen() {
  const lt = useLT();
  const lw = useLW();
  const { lang } = useLang();
  const hydrated = useHydrated();
  const p = useLangProgress();
  const [shared, setShared] = useState<Level | null>(null);
  return (
    <>
      <LearnHero uid="arcert" kicker={lt("kicker")} title={lt("certs")} lead={lw("certsLead")} word="شهادة" back={{ href: MAP, label: lw("backPath") }} />
      <LearnMain>
        <p className="text-[13.5px] leading-relaxed text-muted">{lt("certNote")}</p>
        <div className="mt-5 grid gap-4">
          {!hydrated ? <Spinner /> : LEVELS.map(({ level, lastUnit }) => {
            const c = p.certs[level];
            if (!c) return (
              <div key={level} className="flex items-center gap-4 rounded-xl border border-dashed border-line p-5">
                <span data-latin-digits="" className="font-display text-[28px] leading-none text-line">{level}</span>
                <span className="flex-1 text-sm text-muted">{lt("certLocked", { n: lastUnit })}</span>
                <span className="text-muted" aria-hidden><IconLock /></span>
              </div>
            );
            const date = new Date(c.at).toLocaleDateString(intlLocale(lang), { day: "numeric", month: "long", year: "numeric" });
            const msg = `${lt("certTitle", { level })} · ${lt("kicker")} · ${c.pct} % · ${date}`;
            return (
              <section key={level} aria-label={lt("certTitle", { level })} className="stage relative overflow-hidden rounded-xl border border-[rgba(201,166,94,0.6)] text-white">
                <div className="relative grid justify-items-center gap-1.5 px-6 pb-8 pt-7 text-center">
                  <StarGlyph size={14} className="text-[rgb(var(--gold))]" />
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">Quran Masterclass</p>
                  <p data-latin-digits="" className="font-display text-[46px] leading-none">{level}</p>
                  <h2 className="font-display text-xl">{cefr(lt("certTitle", { level }))}</h2>
                  <p className="text-[14.5px] leading-relaxed text-white/80">{cefr(`${lt("certYou")} · ${lt("certFor", { level })}`)}</p>
                  <p className="text-[13px] font-semibold text-[#f3e2b6]">{`${c.pct} % · ${date}`}</p>
                  <p className="mt-1 text-[11.5px] text-white/55">{lt("certNote")}</p>
                  <button type="button" onClick={() => { void shareOrCopy({ title: lt("certTitle", { level }), text: msg }).then((r) => setShared(r === "copied" ? level : null)); }}
                    className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-[rgb(var(--gold))]/50 px-4 text-sm font-semibold hover:border-[rgb(var(--gold))] [&_svg]:h-4 [&_svg]:w-4">
                    <IconShare />{lt("share")}
                  </button>
                  {shared === level ? <p role="status" className="text-[12.5px] text-white/70">{lw("copied")}</p> : null}
                  <div className="mt-3 w-full max-w-md text-start text-[rgb(var(--ink))]"><VerifiedCertLink course={`ar-level:${level}`} /></div>
                </div>
                <div className="pa-arcade" />
              </section>
            );
          })}
        </div>
      </LearnMain>
    </>
  );
}
