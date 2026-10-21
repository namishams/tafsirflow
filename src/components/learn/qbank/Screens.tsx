"use client";
// mirrors mobile/src/features/qbank/Screens.tsx for the website: Markaz al-Imtihanat – the centre's home (/exams), a
// subject, a session (practice, timed, drill, daily, bookmarks, repetition), the mock exam per stage (exam rules of
// src/lib/learn/exam/integrity.ts, same server verdict as the app), statistics and bookmarks. On the website every
// mode, stage and tier the learner has opened is free: no daily allowance, no Pro. Progress uses the app's key
// (qmc.qbank.v1) and follows the account.
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { QBANK_MOCK, rng, shuffleWith, useExamSession } from "@/lib/learn/exam/integrity";
import { BANK_REVIEW, STAGE_AR, STAGES, SUBJECTS, TIERS, TIER_AR, allQuestions, countsBySubject, loadBank, locOf, questionById, subjectMeta, type Q } from "@/lib/learn/qbank/bank";
import { BANK_COUNT } from "@/lib/learn/qbank/bankVersion";
import {
  MASTER_ACC, MASTER_N, dailyChallenge, dailyDone, drawAdaptive, dueQuestions, inRepetition, mastery45, mockQuestions, overall, poolOf,
  qbankKashf, readQbank, readiness, scholarOpen, setQuestionLang, stageOpen, subjectStats, tagStats, tierOfRating, trend, weakestTopics, weaknessDrill,
  type Mode, type QbankStore,
} from "@/lib/learn/qbank/engine";
import { useQbankT } from "@/lib/learn/qbank/text";
import type { QStage, QSubject } from "@/lib/learn/qbank/types";
import { ExamBar, ExamBlocked, ExamVerdict } from "@/components/learn/exam";
import { CareNote } from "@/components/learn/shams2/ui";
import { GoldButton, GoldLink, LearnHero, LearnMain, OutlineButton, OutlineLink, Row, RowList, SectionTitle } from "@/components/learn/ui";
import { BankGate, Explanation, MarkBar, Panel, Results, Runner, StatTile, pctText, saveRun, sessionHref, useQLang, useQbank, useTagLabel, type Answer } from "./parts";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const WORD = "مركز الامتحانات";

// ---------- /exams ----------
export function QbankHome() {
  const qt = useQbankT();
  return (
    <div>
      <LearnHero uid="qb" kicker={qt("titleTr")} title={qt("title")} lead={qt("lead")} word={WORD}>
        <GoldLink href={sessionHref({ mode: "practice", n: 10 })}>{qt("continue")}</GoldLink>
      </LearnHero>
      <LearnMain>
        <BankGate><HomeBody /></BankGate>
      </LearnMain>
    </div>
  );
}

function HomeBody() {
  const qt = useQbankT();
  const tagLabel = useTagLabel();
  const s = useQbank();
  const o = overall(s);
  const stats = subjectStats(s);
  const counts = useMemo(() => countsBySubject(), []);
  const total = allQuestions().length;
  const due = dueQuestions(s).length;
  const weak = weakestTopics(s, 5);
  const best = SUBJECTS.reduce((m, x) => Math.max(m, stats[x.id].rating), 0);
  return (
    <div className="grid gap-9">
      <div className="flex flex-wrap gap-3">
        <StatTile value={String(o.seen)} label={qt("answered")} />
        <StatTile value={pctText(o.acc)} label={qt("accuracy")} />
        <StatTile value={o.n ? String(tierOfRating(best)) : "—"} label={qt("level")} />
      </div>
      <CareNote />

      <Panel title={qt("m_daily")}>
        <p className="text-[14.5px] leading-relaxed text-muted">{dailyDone(s) ? qt("dailyDone", { c: s.daily?.c ?? 0, n: 10 }) : qt("m_dailySub")}</p>
        {!dailyDone(s) ? <GoldLink href={sessionHref({ mode: "daily" })} className="justify-self-start">{qt("dailyStart")}</GoldLink> : null}
      </Panel>

      <section className="grid gap-4">
        <SectionTitle title={qt("modes")} />
        <RowList>
          <Row href={sessionHref({ mode: "practice", n: 10 })} title={qt("m_practice")} sub={qt("m_practiceSub")} />
          <Row href={sessionHref({ mode: "timed", n: 20 })} title={qt("m_timed")} sub={qt("m_timedSub")} />
          <Row href={sessionHref({ mode: "drill" })} title={qt("m_drill")} sub={qt("m_drillSub")} />
          <Row href={sessionHref({ mode: "srs" })} title={qt("m_srs")} sub={qt("m_srsSub", { n: due, m: inRepetition(s) })} />
          <Row href="/exams/bookmarks" title={qt("m_bookmarks")} sub={qt("m_bookmarksSub", { n: s.bm.length })} />
          <Row href="/exams/stats" title={qt("m_stats")} sub={qt("m_statsSub")} />
        </RowList>
      </section>

      <section className="grid gap-4">
        <SectionTitle title={qt("stages")} />
        <div className="grid gap-3 sm:grid-cols-2">{STAGES.map((g) => <StageCard key={g} g={g} s={s} />)}</div>
      </section>

      <section className="grid gap-4">
        <SectionTitle title={qt("weakest")} />
        {weak.length ? (
          <RowList>
            {weak.map((w) => (
              <Row key={`${w.subject}/${w.tag}`} href={sessionHref({ mode: "drill", subject: w.subject, tag: w.tag })} title={tagLabel(w.tag)}
                sub={`${qt(`s_${w.subject}`)} · ${qt("topicAcc", { p: Math.round((w.acc ?? 0) * 100), n: w.n })}`} />
            ))}
          </RowList>
        ) : <p className="text-[14.5px] text-muted">{qt("weakestEmpty")}</p>}
      </section>

      <section className="grid gap-4">
        <SectionTitle title={qt("subjects")} />
        <RowList>
          {SUBJECTS.map((x) => {
            const st = stats[x.id];
            return (
              <Row key={x.id} href={`/exams/${x.id}`} title={qt(`s_${x.id}`)}
                lead={<span lang="ar" dir="rtl" className="font-arabic text-[17px] text-[rgb(var(--hm-gold-d))]">{x.ar}</span>}
                sub={`${qt("questions", { n: counts[x.id].total })}${st.n ? ` · ${pctText(st.acc)} · ${qt("tier", { n: tierOfRating(st.rating) })}` : ""}`} />
            );
          })}
        </RowList>
      </section>

      <QuestionLangPicker />
      <p className="text-[12.5px] leading-relaxed text-muted">{`${qt("countsTitle")}: ${total} · ${BANK_REVIEW.note}`}</p>
    </div>
  );
}

function StageCard({ g, s }: { g: QStage; s: QbankStore }) {
  const qt = useQbankT();
  const open = stageOpen(g, s);
  const r = readiness(g, s);
  const m = s.mock[g];
  return (
    <div className={cx("hm-card relative grid gap-3 p-5", !open && "opacity-80")}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-bold">{qt(`stage_${g}`)}</p>
          <p lang="ar" dir="rtl" className="font-arabic text-[16px] text-muted">{STAGE_AR[g]}</p>
        </div>
        {m?.passed ? <span className="text-accent" aria-label={qt("mockPassed")}>✓</span> : null}
      </div>
      {open ? (
        <>
          <p className="text-[13px] font-semibold">{qt("readiness", { p: Math.round(r.value * 100) })}</p>
          <MarkBar value={r.value} mark={r.pass} />
          <p className="text-[12.5px] text-muted">{m ? (m.passed ? qt("mockPassed") : qt("mockBest", { p: Math.round(m.best * 100) })) : qt("mockNone")}</p>
          <div className="flex flex-wrap gap-2">
            <OutlineLink href={sessionHref({ mode: "practice", stage: g, n: 10 })} className="!h-10 !px-4 text-[14px]">{qt("practiceStage")}</OutlineLink>
            <OutlineLink href={`/exams/mock?stage=${g}`} className="!h-10 !px-4 text-[14px]">{qt("m_mock")}</OutlineLink>
          </div>
        </>
      ) : <p className="text-[13.5px] leading-relaxed text-muted">{qt("stageLocked", { prev: qt(`stage_${g - 1}`) })}</p>}
    </div>
  );
}

function QuestionLangPicker() {
  const qt = useQbankT();
  const s = useQbank();
  const cur = s.qlang ?? "auto";
  const opts: [QbankStore["qlang"] & string, string][] = [["auto", qt("ql_auto")], ["en", "English"], ["de", "Deutsch"], ["ar", "العربية"]];
  return (
    <section className="grid gap-3">
      <SectionTitle title={qt("questionLang")} />
      <div role="group" aria-label={qt("questionLang")} className="flex flex-wrap gap-2">
        {opts.map(([k, l]) => (
          <button key={k} type="button" aria-pressed={cur === k} onClick={() => setQuestionLang(k)}
            className={cx("inline-flex h-10 items-center rounded-full border px-4 text-[14px] font-semibold", cur === k ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/15" : "border-line text-muted hover:border-[rgb(var(--hm-gold))]/60")}>{l}</button>
        ))}
      </div>
    </section>
  );
}

// ---------- /exams/[subject] ----------
export function QbankSubject({ id }: { id: string }) {
  const qt = useQbankT();
  const meta = subjectMeta(id);
  return (
    <div>
      <LearnHero uid="qb-s" back={{ href: "/exams", label: qt("title") }} kicker={meta ? `${qt("title")} · ${meta.tr}` : qt("title")} title={meta ? qt(`s_${meta.id}`) : qt("empty")} word={meta?.ar ?? WORD}>
        {meta ? <GoldLink href={sessionHref({ mode: "practice", subject: meta.id, n: 10 })}>{qt("m_practice")}</GoldLink> : null}
      </LearnHero>
      <LearnMain>{meta ? <BankGate><SubjectBody sub={meta.id} /></BankGate> : <p className="text-muted">{qt("empty")}</p>}</LearnMain>
    </div>
  );
}

function SubjectBody({ sub }: { sub: QSubject }) {
  const qt = useQbankT();
  const tagLabel = useTagLabel();
  const s = useQbank();
  const counts = useMemo(() => countsBySubject(), []);
  const st = subjectStats(s)[sub];
  const m45 = mastery45(sub, s);
  const sch = scholarOpen(sub, s);
  const tags = tagStats(s, sub).filter((x) => x.n >= 1).sort((a, b) => (a.acc ?? 0) - (b.acc ?? 0));
  const allTags = useMemo(() => [...new Set(allQuestions().filter((q) => q.s === sub).flatMap((q) => q.t))], [sub]);
  return (
    <div className="grid gap-9">
      <div className="flex flex-wrap gap-3">
        <StatTile value={String(counts[sub].total)} label={qt("questions", { n: "" }).trim()} />
        <StatTile value={pctText(st.acc)} label={qt("accuracy")} />
        <StatTile value={st.n ? String(tierOfRating(st.rating)) : "—"} label={qt("level")} />
      </div>
      <section className="grid gap-4">
        <SectionTitle title={qt("stages")} />
        <RowList>
          {STAGES.map((g) => {
            const open = stageOpen(g, s);
            return (
              <Row key={g} href={open ? sessionHref({ mode: "practice", subject: sub, stage: g, n: 10 }) : undefined} locked={!open} title={qt(`stage_${g}`)}
                sub={open ? qt("questions", { n: counts[sub].stages[g] }) : qt("stageLocked", { prev: qt(`stage_${g - 1}`) })}
                trail={open ? <Link href={sessionHref({ mode: "timed", subject: sub, stage: g, n: 15 })} className="text-[13px] font-semibold text-accent hover:underline">{qt("timedStage")}</Link> : undefined} />
            );
          })}
        </RowList>
      </section>
      <Panel title={qt("tiers")}>
        <ul className="grid gap-2.5">
          {TIERS.map((d) => {
            const n = counts[sub].tiers[d] ?? 0;
            const locked = d >= 6 && !sch;
            return (
              <li key={d} className={cx("flex items-center gap-3", locked && "opacity-60")}>
                <span className={cx("inline-flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold", d >= 6 ? "bg-[rgb(var(--hm-gold))]/20 text-[rgb(var(--hm-gold-d))]" : "bg-accent-soft text-accent")}>{d}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{qt(`tier_${d}`)}</span>
                  <span className="block text-[13px] text-muted"><span lang="ar" className="font-arabic">{TIER_AR[d]}</span>{` · ${qt("questions", { n })}`}</span>
                </span>
                {!locked && n ? <Link href={sessionHref({ mode: "practice", subject: sub, tier: d, n: 10 })} className="text-[13px] font-semibold text-accent hover:underline">{qt("m_practice")}</Link> : null}
              </li>
            );
          })}
        </ul>
        <p className={cx("text-[12.5px] leading-relaxed", sch ? "text-accent" : "text-muted")}>
          {sch ? qt("scholarOpen") : qt("scholarLocked", { n: MASTER_N, p: Math.round(MASTER_ACC * 100), have: m45.n, acc: Math.round(m45.acc * 100) })}
        </p>
      </Panel>
      <section className="grid gap-4">
        <SectionTitle title={qt("topics")} />
        <RowList>
          {(tags.length ? tags.map((x) => x.tag) : allTags).slice(0, 40).map((tag) => {
            const x = tags.find((y) => y.tag === tag);
            return <Row key={tag} href={sessionHref({ mode: "drill", subject: sub, tag })} title={tagLabel(tag)} sub={x ? qt("topicAcc", { p: Math.round((x.acc ?? 0) * 100), n: x.n }) : undefined} />;
          })}
        </RowList>
      </section>
    </div>
  );
}

// ---------- /exams/session ----------
const MODES: Mode[] = ["practice", "timed", "drill", "daily", "bookmarks", "srs"];
function buildSession(mode: Mode, p: Record<string, string | undefined>): Q[] {
  const s = readQbank();
  const subject = p.subject as QSubject | undefined;
  const stage = p.stage ? (Number(p.stage) as QStage) : undefined;
  const tier = p.tier ? (Number(p.tier) as Q["d"]) : undefined;
  const n = Math.max(5, Math.min(50, Number(p.n) || (mode === "timed" ? 20 : 10)));
  switch (mode) {
    case "practice": return drawAdaptive(poolOf({ subject, stage, tag: p.tag, tier }, s), n, Math.random, s);
    case "timed": return drawAdaptive(poolOf({ subject, stage, tag: p.tag }, s), n, Math.random, s, 80);
    case "drill": {
      if (p.ids) return p.ids.split(",").map((id) => questionById(id)).filter((q): q is Q => !!q);
      return weaknessDrill(15, { subject, tag: p.tag }, s);
    }
    case "daily": return dailyChallenge(s);
    case "bookmarks": return shuffleWith(s.bm.map((id) => questionById(id)).filter((q): q is Q => !!q), Math.random).slice(0, 30);
    case "srs": return dueQuestions(s).slice(0, 20);
    default: return [];
  }
}

export function QbankSession() {
  const qt = useQbankT();
  const sp = useSearchParams();
  const p = useMemo(() => Object.fromEntries(sp.entries()) as Record<string, string>, [sp]);
  const mode = (MODES.includes(p.mode as Mode) ? p.mode : "practice") as Mode;
  const sub = p.subject ? subjectMeta(p.subject) : undefined;
  return (
    <div>
      <LearnHero uid="qb-r" back={{ href: "/exams", label: qt("title") }} kicker={sub ? qt(`s_${sub.id}`) : qt("title")} title={qt(`m_${mode}`)} word={sub?.ar ?? WORD}
        lead={mode === "timed" ? qt("timedLead", { n: Math.max(5, Math.min(50, Number(p.n) || 20)), s: 60 }) : undefined} />
      <LearnMain><BankGate><SessionBody mode={mode} p={p} /></BankGate></LearnMain>
    </div>
  );
}

function SessionBody({ mode, p }: { mode: Mode; p: Record<string, string> }) {
  const qt = useQbankT();
  const router = useRouter();
  const [round, setRound] = useState(0);
  const questions = useMemo(() => buildSession(mode, p), [round, mode, p]); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState<Answer[] | null>(null);
  const timed = mode === "timed";
  const finish = (a: Answer[]) => {
    saveRun(mode, a, { s: p.subject as QSubject | undefined, g: p.stage ? (Number(p.stage) as QStage) : undefined });
    setDone(a);
  };
  const again = () => { setDone(null); setRound((r) => r + 1); };
  if (done) return <Results answers={done} mode={mode} onAgain={mode === "daily" ? undefined : again} />;
  if (!questions.length) {
    return (
      <Panel>
        <p className="text-[15px] leading-relaxed">{mode === "srs" ? qt("noDue") : mode === "bookmarks" ? qt("noBookmarks") : mode === "drill" ? qt("weakestEmpty") : qt("empty")}</p>
        <OutlineButton onClick={() => router.replace("/exams")} className="justify-self-start">{qt("backHome")}</OutlineButton>
      </Panel>
    );
  }
  return <Runner key={round} questions={questions} mode={mode} deferred={timed} questionSec={timed ? 60 : undefined} onDone={finish} />;
}

// ---------- /exams/mock ----------
export function QbankMock() {
  const qt = useQbankT();
  const sp = useSearchParams();
  const g = (Math.min(4, Math.max(1, Number(sp.get("stage")) || 1))) as QStage;
  const rule = QBANK_MOCK[g];
  return (
    <div>
      <LearnHero uid="qb-m" back={{ href: "/exams", label: qt("title") }} kicker={`${qt("title")} · ${qt(`stage_${g}`)}`} title={qt("mockTitle")} word={STAGE_AR[g]}
        lead={qt("mockLead", { n: rule.questions, min: rule.questions, q: 90, p: Math.round(rule.pass * 100) })} />
      <LearnMain><BankGate><MockBody key={g} g={g} /></BankGate></LearnMain>
    </div>
  );
}

function MockBody({ g }: { g: QStage }) {
  const qt = useQbankT();
  const tagLabel = useTagLabel();
  const s = useQbank();
  const open = stageOpen(g, s);
  const rule = QBANK_MOCK[g];
  const [run, setRun] = useState(false);
  const [idx, setIdx] = useState({ i: 0, open: false });
  const [sig, setSig] = useState(0);
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const mirror = useRef<Answer[]>([]);
  const saved = useRef(false);
  const ex = useExamSession(open ? "qbank" : null, String(g), {
    active: run, questionIndex: idx.i, questionOpen: idx.open, onQuestionTimeout: () => setSig((x) => x + 1),
    onExpire: () => end(mirror.current), leaveText: qt("voidNote"),
  });
  const questions = useMemo(() => (ex.phase === "running" ? mockQuestions(g, rng(`${ex.nonce}|q`)) : []), [ex.nonce, ex.phase === "running"]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalRef = useRef(rule.questions);
  const end = (a: Answer[]) => {
    if (ex.phase !== "running") return;
    totalRef.current = questions.length || rule.questions;
    setAnswers(a);
    ex.finish(a.filter((x) => x.ok).length, totalRef.current);
  };
  useEffect(() => {
    if (saved.current || (!answers && ex.phase !== "void")) return;
    if (ex.phase === "finished") {
      saved.current = true;
      const a = answers ?? [];
      const total = totalRef.current;
      const local = a.filter((x) => x.ok).length / total >= rule.pass;
      saveRun("mock", a, { g, pass: local && (!ex.submitted || ex.submitted.result.passed), n: total });
    } else if (ex.phase === "void") {
      saved.current = true;
      saveRun("mock", mirror.current, { g, pass: false, void: true });
    }
  }, [ex.phase, answers]); // eslint-disable-line react-hooks/exhaustive-deps
  const restart = () => { saved.current = false; mirror.current = []; setAnswers(null); setIdx({ i: 0, open: false }); setRun(false); };
  const total = totalRef.current;
  const c = answers?.filter((x) => x.ok).length ?? 0;
  const passed = answers ? c / total >= rule.pass && (!ex.submitted || ex.submitted.result.passed) : false;
  const weak = weakestTopics(s, 5);
  if (!open) return <Panel><p className="text-[15px] leading-relaxed">{qt("mockLocked")}</p></Panel>;
  return (
    <div className="grid gap-4">
      <ExamBlocked session={ex} />
      {!run && ex.phase !== "blocked" ? (
        <Panel>
          <p className="text-[14px] text-muted">{qt("mockAttempts", { n: s.mock[g]?.tries ?? 0 })}</p>
          <GoldButton onClick={() => { restart(); setRun(true); }} className="justify-self-start">{qt("mockStart")}</GoldButton>
        </Panel>
      ) : null}
      <ExamBar session={ex} />
      {ex.phase === "running" && questions.length && !answers ? (
        <Runner key={ex.nonce} questions={questions} mode="mock" deferred questionLeft={ex.questionLeft} rand={rng(`${ex.nonce}|o`)} mirror={mirror}
          timeoutSignal={sig} onIndex={(i, o) => setIdx({ i, open: o })} onDone={end} />
      ) : null}
      {ex.signedIn || ex.phase === "void" ? <ExamVerdict session={ex} /> : null}
      {ex.phase === "void" ? <p className="text-[13.5px] text-red-700 dark:text-red-400">{qt("voidNote")}</p> : null}
      {answers && (ex.phase === "finished" || ex.phase === "submitting") ? (
        <Results answers={answers} mode="mock" passMark={rule.pass} onAgain={restart}
          extra={<p className={cx("text-[14.5px] font-semibold leading-relaxed", passed ? "text-accent" : "text-red-700 dark:text-red-400")}>{passed ? qt("mockPass") : qt("mockFail", { p: Math.round(rule.pass * 100) })}</p>} />
      ) : null}
      {answers && !passed && weak.length && ex.phase === "finished" ? (
        <RowList>
          {weak.map((w) => <Row key={`${w.subject}/${w.tag}`} href={sessionHref({ mode: "drill", subject: w.subject, tag: w.tag })} title={tagLabel(w.tag)} sub={`${qt(`s_${w.subject}`)} · ${qt("topicAcc", { p: Math.round((w.acc ?? 0) * 100), n: w.n })}`} />)}
        </RowList>
      ) : null}
      {ex.phase === "void" ? <OutlineButton onClick={restart} className="justify-self-start">{qt("again")}</OutlineButton> : null}
    </div>
  );
}

// ---------- /exams/stats ----------
export function QbankStats() {
  const qt = useQbankT();
  return (
    <div>
      <LearnHero uid="qb-st" back={{ href: "/exams", label: qt("title") }} kicker={qt("title")} title={qt("statsTitle")} word={WORD} />
      <LearnMain><BankGate><StatsBody /></BankGate></LearnMain>
    </div>
  );
}

function StatsBody() {
  const qt = useQbankT();
  const tagLabel = useTagLabel();
  const s = useQbank();
  const o = overall(s);
  const stats = subjectStats(s);
  const tr = trend(s, 21);
  const tags = tagStats(s).filter((x) => x.n >= 3);
  const weak = weakestTopics(s, 6);
  const strong = [...tags].sort((a, b) => (b.acc ?? 0) - (a.acc ?? 0) || b.n - a.n).slice(0, 5);
  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap gap-3">
        <StatTile value={String(o.seen)} label={qt("answered")} />
        <StatTile value={pctText(o.acc)} label={qt("accuracy")} />
        <StatTile value={o.ms ? qt("seconds", { s: Math.round(o.ms / 1000) }) : "—"} label={qt("time")} />
        <StatTile value={String(o.sessions)} label={qt("sessions")} />
      </div>
      <Panel title={qt("trendTitle")}>
        {tr.length ? (
          <div className="flex h-[110px] items-end gap-1" aria-label={tr.map((d) => `${d.d}: ${Math.round(d.acc * 100)} %`).join(", ")}>
            {tr.map((d) => (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                <span className={cx("block w-full rounded-sm", d.acc >= 0.8 ? "bg-accent" : d.acc >= 0.6 ? "bg-[rgb(var(--hm-gold))]" : "bg-red-700/70")} style={{ height: Math.max(4, d.acc * 90) }} />
                <span className="text-[9px] text-muted">{d.d.slice(8)}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-[14px] text-muted">{qt("trendEmpty")}</p>}
      </Panel>
      <Panel title={qt("readinessTitle")}>
        {STAGES.map((g) => {
          const r = readiness(g, s);
          const m = s.mock[g];
          return (
            <div key={g} className={cx("grid gap-1.5", !stageOpen(g, s) && "opacity-55")}>
              <div className="flex text-[14px]"><span className="flex-1 font-semibold">{qt(`stage_${g}`)}</span><span className="font-bold">{`${Math.round(r.value * 100)} %`}</span></div>
              <MarkBar value={r.value} mark={r.pass} />
              <p className="text-[12.5px] text-muted">{m ? (m.passed ? qt("mockPassed") : qt("mockBest", { p: Math.round(m.best * 100) })) : qt("mockNone")}</p>
            </div>
          );
        })}
        <p className="text-[12.5px] leading-relaxed text-muted">{qt("readinessLead")}</p>
      </Panel>
      <Panel title={qt("perSubject")}>
        {SUBJECTS.map((x) => {
          const st = stats[x.id];
          return (
            <Link key={x.id} href={`/exams/${x.id}`} className="grid gap-1.5 rounded hover:bg-[rgb(var(--hm-gold))]/[0.05]">
              <span className="flex gap-2 text-[14px]"><span className="flex-1 font-semibold">{qt(`s_${x.id}`)}</span>
                <span className="text-[12.5px] text-muted">{st.n ? `${pctText(st.acc)} · ${qt("seconds", { s: Math.round((st.ms ?? 0) / 1000) })} · ${qt("tier", { n: tierOfRating(st.rating) })}` : qt("noData")}</span></span>
              <MarkBar value={st.acc ?? 0} />
            </Link>
          );
        })}
      </Panel>
      <Panel title={qt("weakest")}>
        {weak.length ? weak.map((w) => (
          <Link key={`${w.subject}/${w.tag}`} href={sessionHref({ mode: "drill", subject: w.subject, tag: w.tag })} className="flex items-center gap-3 rounded hover:bg-[rgb(var(--hm-gold))]/[0.05]">
            <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold">{tagLabel(w.tag)}</span>
              <span className="block text-[12.5px] text-muted">{`${qt(`s_${w.subject}`)} · ${qt("topicAcc", { p: Math.round((w.acc ?? 0) * 100), n: w.n })}`}</span></span>
            <span className="text-[13px] font-semibold text-[rgb(var(--hm-gold-d))]">{qt("drill")}</span>
          </Link>
        )) : <p className="text-[14px] text-muted">{qt("weakestEmpty")}</p>}
      </Panel>
      {strong.length ? (
        <Panel title={qt("strongest")}>
          {strong.map((w) => <p key={`${w.subject}/${w.tag}`} className="text-[14px]">{`${tagLabel(w.tag)} · ${qt(`s_${w.subject}`)} · ${pctText(w.acc)}`}</p>)}
        </Panel>
      ) : null}
      <Panel title={qt("history")}>
        {s.h.length ? s.h.slice(0, 12).map((h) => (
          <div key={h.at} className="flex gap-2 text-[13.5px]">
            <span className={cx("flex-1 font-semibold", h.void && "text-muted")}>{`${qt(`m_${h.mode}`)}${h.g ? ` · ${qt(`stage_${h.g}`)}` : h.s ? ` · ${qt(`s_${h.s}`)}` : ""}`}</span>
            <span className={h.pass ? "text-accent" : "text-muted"}>{h.void ? "—" : qt("score", { c: h.c, n: h.n })}</span>
          </div>
        )) : <p className="text-[14px] text-muted">{qt("noData")}</p>}
      </Panel>
    </div>
  );
}

// ---------- /exams/bookmarks ----------
export function QbankBookmarks() {
  const qt = useQbankT();
  return (
    <div>
      <LearnHero uid="qb-b" back={{ href: "/exams", label: qt("title") }} kicker={qt("title")} title={qt("m_bookmarks")} word={WORD} />
      <LearnMain><BankGate><BookmarksBody /></BankGate></LearnMain>
    </div>
  );
}

function BookmarksBody() {
  const qt = useQbankT();
  const lang = useQLang();
  const s = useQbank();
  const items = s.bm.map((id) => questionById(id)).filter((q): q is Q => !!q);
  if (!items.length) return <p className="text-[15px] leading-relaxed text-muted">{qt("noBookmarks")}</p>;
  return (
    <div className="grid gap-3">
      <GoldLink href={sessionHref({ mode: "bookmarks" })} className="justify-self-start">{qt("start")}</GoldLink>
      {items.map((q) => {
        const loc = locOf(q, lang);
        return (
          <details key={q.id} className="hm-card relative p-4">
            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span dir={lang === "ar" ? "rtl" : undefined} className={cx("block", lang === "ar" ? "font-arabic text-[17px] leading-[1.8]" : "text-[15px] font-semibold leading-snug")}>{loc[0]}</span>
              <span className="mt-1 block text-[12.5px] text-muted">{`${qt(`s_${q.s}`)} · ${qt("tier", { n: q.d })}${q.v ? ` · ${qt("verseShown", { key: q.v })}` : ""}`}</span>
            </summary>
            <div className="mt-3"><Explanation q={q} lang={lang} ok={null} correctText={loc[1][0]} /></div>
          </details>
        );
      })}
    </div>
  );
}

// ---------- entry cards (/masterclass, /school) ----------
/** the centre on a dark stage card */
export function QbankEntryCard({ className = "" }: { className?: string }) {
  const qt = useQbankT();
  return (
    <Link href="/exams" className={cx("stage girih relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/40 p-6 text-[#eef0f3] transition hover:border-[rgb(var(--gold))]", className)}>
      <span className="flex items-center justify-between gap-3">
        <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">{qt("titleTr")}</span>
        <span lang="ar" dir="rtl" className="font-arabic text-[20px] text-[rgb(var(--gold))]">{WORD}</span>
      </span>
      <span className="font-display text-[26px] leading-tight">{qt("title")}</span>
      <span className="text-[14.5px] leading-relaxed text-white/70">{qt("entryLead", { n: BANK_COUNT })}</span>
      <span className="mt-2 inline-flex h-10 items-center self-start rounded-full bg-[rgb(var(--gold))] px-4 text-[14px] font-bold text-[#0e221b]">{qt("enter")}</span>
    </Link>
  );
}

/** for the Madrasa (/school): the centre's grades per school subject (Kashf ad-darajāt) and the way in, as the app */
export function QbankSchoolCard() {
  const qt = useQbankT();
  const s = useQbank();
  const [kashf, setKashf] = useState<[string, number][]>([]);
  // the grades need the subjects of the answered questions: computed once the bank is in the browser (only when the
  // learner has answered anything, so /school stays light for everyone else)
  useEffect(() => {
    if (!Object.keys(s.a).length) { setKashf([]); return; }
    let live = true;
    loadBank("en").then(() => { if (live) setKashf(Object.entries(qbankKashf(readQbank())).filter(([, v]) => v !== null) as [string, number][]); }).catch(() => {});
    return () => { live = false; };
  }, [s.a]);
  const passed = STAGES.filter((g) => s.mock[g]?.passed);
  return (
    <div className="grid gap-3">
      <QbankEntryCard />
      {kashf.length || passed.length ? (
        <Panel title={`${qt("title")} · Kashf ad-darajāt`}>
          {kashf.map(([k, v]) => (
            <div key={k} className="grid gap-1.5">
              <div className="flex text-[14px]"><span className="flex-1 font-semibold">{SUBJECTS.filter((x) => x.school === k).map((x) => qt(`s_${x.id}`)).join(", ")}</span><span className="font-bold">{pctText(v)}</span></div>
              <MarkBar value={v} />
            </div>
          ))}
          {passed.map((g) => <p key={g} className="text-[13px] text-accent">{`${qt("mockPassed")} · ${qt(`stage_${g}`)}`}</p>)}
        </Panel>
      ) : null}
    </div>
  );
}

