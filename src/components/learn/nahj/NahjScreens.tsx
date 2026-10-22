"use client";
// The website's Nahj al-Balagha: the reader (/nahj) and the study course (/nahj-studies …), native pages built like the
// app's screens (mobile/src/app/nahj.tsx, mobile/src/features/nahj-course/Screens.tsx). The text comes from the server
// (src/lib/learn/hadith/nahjContent.ts), never from git; the website is free, so there is no Pro preview here.
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Ar, Bar, Card, CardLink, GoldButton, GoldLink, Kicker, LearnHero, LearnMain, Note, Option, OutlineButton, OutlineLink, Row, RowList, Spinner, TextButton } from "@/components/learn/ui";
import { isRTL, useLang } from "@/lib/learn/i18n";
import { useStored } from "@/lib/learn/store";
import { NAHJ_OPTIN_KEY, readTradition, setNahjOptIn, useNahjVisible } from "@/lib/learn/tradition";
import { useNahjContent, type NahjStatus } from "@/lib/learn/hadith/nahjContent";
import { NAHJ_EDITION_KEY, NAHJ_MACHINE, nahjAt, nahjCount, nahjEdition, nahjPosition, nahjRef, saveNahjPosition, setNahjEdition, type NahjEdition, type NahjPassage } from "@/lib/learn/hadith/nahj";
import {
  PASS_LESSON, PASS_UNIT, courseState, courseUnits, lessonById, lessonQuiz, markLesson, markUnit, nextLesson, sayingOfTheDay, setFont, setLast, studyNote, studyOf, unitById, unitTest,
  useNahjProgress, type Lesson, type Qn, type Unit,
} from "@/lib/learn/nahj-course/data";
import { fill, useNahjText, type NahjCourseText } from "@/lib/learn/nahj-course/text";

// the reader's own words (the app keeps them in features/hadith/texts.ts)
const R = {
  de: { reader: "Nahjul-Balagha", readerLead: "Predigten, Briefe und Aussprüche von Imam Ali (عليه السلام) – ein Abschnitt nach dem anderen.", next: "Nächster Abschnitt", prev: "Vorheriger Abschnitt", loading: "Inhalt wird geladen …", missing: "Der Inhalt ist gerade nicht verfügbar. Bitte versuchen Sie es später noch einmal.", retry: "Erneut versuchen", copied: "Kopiert", course: "Zum Studium", of: "Abschnitt {n} von {m}" },
  en: { reader: "Nahj al-Balagha", readerLead: "Sermons, letters and sayings of Imam Ali (عليه السلام) – one passage at a time.", next: "Next passage", prev: "Previous passage", loading: "Loading the content …", missing: "The content is not available right now. Please try again later.", retry: "Try again", copied: "Copied", course: "Study course", of: "Passage {n} of {m}" },
};
const useR = () => { const { lang } = useLang(); return lang === "de" ? R.de : R.en; };

function useEd(): NahjEdition {
  const { lang } = useLang();
  useStored<string | null>(NAHJ_EDITION_KEY, null);
  return nahjEdition(lang);
}

function ContentState({ status, onRetry }: { status: Exclude<NahjStatus, "ready">; onRetry: () => void }) {
  const r = useR();
  return status === "loading" ? <div className="py-10 text-center"><Spinner label={r.loading} /></div> : (
    <div className="space-y-4 py-10 text-center"><p className="text-muted">{r.missing}</p><OutlineButton onClick={onRetry}>{r.retry}</OutlineButton></div>
  );
}

function EditionSwitch({ ed }: { ed: NahjEdition }) {
  return (
    <div role="tablist" className="inline-flex overflow-hidden rounded-full border border-[rgb(var(--gold))]/40">
      {(["de", "en"] as const).map((e) => (
        <button key={e} type="button" role="tab" aria-selected={ed === e} onClick={() => setNahjEdition(e)}
          className={`h-9 px-4 text-[13px] font-semibold ${ed === e ? "bg-[rgb(var(--gold))]/25 text-white" : "text-white/70"}`}>{e === "de" ? "Deutsch" : "English"}</button>
      ))}
    </div>
  );
}

/** one passage: reference, Arabic, translation, machine note, attribution (compiler and translator) */
function PassageText({ p, size = 1 }: { p: NahjPassage; size?: number }) {
  const sz = ["text-[16px]", "text-[18px]", "text-[20px]", "text-[23px]"][size] ?? "text-[18px]";
  const arSz = ["text-[22px]", "text-[25px]", "text-[28px]", "text-[32px]"][size] ?? "text-[25px]";
  return (
    <div className="space-y-4">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--hm-gold-d))]">{p.ref}</p>
      {p.arabic && <p className="text-end"><Ar size={arSz}>{p.arabic}</Ar></p>}
      <p lang={p.edition} className={`${sz} leading-relaxed`}>{p.text}</p>
      {p.machine && <p className="text-[13px] font-semibold text-[rgb(var(--hm-gold-d))]">{NAHJ_MACHINE[p.edition]}</p>}
      <p className="text-[12.5px] text-muted">{p.credit}</p>
    </div>
  );
}

function ShareButton({ p, label }: { p: NahjPassage; label: string }) {
  const r = useR();
  const [done, setDone] = useState(false);
  const share = async () => {
    const text = `${p.arabic ? `${p.arabic}\n\n` : ""}${p.text}\n\n${p.ref} · ${p.credit}`;
    try {
      if (navigator.share) await navigator.share({ text });
      else { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); }
    } catch { /* closed */ }
  };
  return <OutlineButton onClick={() => void share()}>{done ? r.copied : label}</OutlineButton>;
}

// ---------- /nahj: the reader ----------
export function NahjReader() {
  const r = useR();
  const x = useNahjText();
  const ed = useEd();
  const content = useNahjContent([ed, "ar"]);
  const ready = useNahjContent([ed]).status === "ready";
  return (
    <>
      <LearnHero kicker={x.kicker} title={r.reader} lead={r.readerLead} word="نهج البلاغة" uid="nahj">
        <EditionSwitch ed={ed} />
        <OutlineLink dark href="/nahj-studies">{r.course}</OutlineLink>
      </LearnHero>
      <LearnMain>
        {ready ? <ReaderBody key={ed} ed={ed} /> : <ContentState status={content.status === "ready" ? "loading" : content.status} onRetry={content.retry} />}
      </LearnMain>
    </>
  );
}

function ReaderBody({ ed }: { ed: NahjEdition }) {
  const r = useR();
  const x = useNahjText();
  const start = useMemo(() => nahjPosition(ed), [ed]);
  const [k, setK] = useState(start.k);
  useNahjContent(["ar"]); // re-render when the Arabic arrives
  const p = nahjAt(ed, start.seed, k);
  useEffect(() => { saveNahjPosition(ed, { seed: start.seed, k }); }, [ed, start.seed, k]);
  const total = nahjCount(ed);
  if (!p) return null;
  return (
    <div className="space-y-5">
      <Card><PassageText p={p} size={2} /></Card>
      <div className="flex flex-wrap items-center gap-3">
        <OutlineButton disabled={k <= 0} onClick={() => setK(k - 1)}>{r.prev}</OutlineButton>
        <GoldButton onClick={() => setK(k + 1)}>{r.next}</GoldButton>
        <ShareButton p={p} label={x.share} />
        <span className="text-[13px] text-muted">{fill(r.of, { n: (k % total) + 1, m: total })}</span>
      </div>
    </div>
  );
}

// ---------- course ----------
function Gated({ children }: { children: React.ReactNode }) {
  const ed = useEd();
  const c = useNahjContent([ed, ed === "de" ? "study-de" : "study-en", "study-course"]);
  useNahjContent(["ar"]);
  if (c.status === "ready") return <>{children}</>;
  return <LearnMain><ContentState status={c.status} onRetry={c.retry} /></LearnMain>;
}

function OptIn() {
  const x = useNahjText();
  return (
    <>
      <LearnHero kicker={x.kicker} title={x.title} word="نهج البلاغة" uid="nahj-o" />
      <LearnMain className="space-y-4">
        <p className="text-[16px] leading-relaxed">{x.optInIntro}</p>
        <GoldButton onClick={() => setNahjOptIn(true)}>{x.optInTitle}</GoldButton>
        <p className="text-[13px] text-muted">{x.optInNote}</p>
      </LearnMain>
    </>
  );
}

/** the switch for Sunni and "both" (Shia mode shows the Nahj al-Balagha by default) */
export function NahjOptInSetting() {
  const x = useNahjText();
  const on = useStored<boolean>(NAHJ_OPTIN_KEY, false);
  if (readTradition() === "shia") return null;
  return (
    <div className="space-y-2">
      <p className="font-semibold">{x.optInTitle}</p>
      <div className="flex gap-2">
        <OutlineButton onClick={() => setNahjOptIn(true)} className={on ? "!border-[rgb(var(--hm-gold))]" : ""}>{x.optInOn}</OutlineButton>
        <OutlineButton onClick={() => setNahjOptIn(false)} className={!on ? "!border-[rgb(var(--hm-gold))]" : ""}>{x.optInOff}</OutlineButton>
      </div>
      <p className="text-[13px] text-muted">{x.optInNote}</p>
    </div>
  );
}

export function NahjCourseHome() {
  const visible = useNahjVisible();
  if (!visible) return <OptIn />;
  return <Gated><Home /></Gated>;
}

function Home() {
  const x = useNahjText();
  const ed = useEd();
  const p = useNahjProgress();
  const units = courseUnits(ed);
  const st = courseState(ed, p);
  const cont = nextLesson(ed, p);
  const day = useMemo(() => sayingOfTheDay(ed), [ed]);
  return (
    <>
      <LearnHero kicker={x.kicker} title={x.title} lead={x.lead} word="نهج البلاغة" uid="nahj-h">
        {cont && <GoldLink href={`/nahj-studies/lesson/${cont.id}`}>{st.lessonsDone ? x.cont : x.start}</GoldLink>}
        <OutlineLink dark href="/nahj">{useR().reader}</OutlineLink>
      </LearnHero>
      <LearnMain className="space-y-6">
        <Card className="space-y-3">
          <p className="text-[14px] text-muted">{fill(x.progress, { n: st.lessonsDone, m: st.lessons })} · {fill(x.unitsDone, { n: st.unitsPassed, m: st.units })}</p>
          <Bar value={st.done} gold />
          {p.cert ? <GoldLink href="/nahj-studies/certificate">{x.viewCert}</GoldLink> : <p className="text-[13px] text-muted">{x.certLocked}</p>}
        </Card>
        {day && <div className="space-y-2"><Kicker>{x.saying}</Kicker><PassageBlock p={day} ed={ed} /></div>}
        {units.map((u) => {
          const done = u.lessons.filter((l) => p.lessons[l.id]).length;
          return (
            <div key={u.id} className="space-y-2">
              <Kicker>{`${x.unit} ${u.n}`}</Kicker>
              <h2 className="font-display text-2xl">{x.units[u.theme] ?? ""}</h2>
              <p className="text-[13px] text-muted">{fill(x.progress, { n: done, m: u.lessons.length })}</p>
              <RowList>
                {u.lessons.map((l) => <Row key={l.id} href={`/nahj-studies/lesson/${l.id}`} lead={<span className="font-semibold text-muted">{l.n}</span>} title={l.title} done={!!p.lessons[l.id]} />)}
                <Row href={`/nahj-studies/unit/${u.id}`} title={`${x.unitTest}${p.units[u.id] ? ` · ${x.unitPassed}` : ""}`} done={!!p.units[u.id]} />
              </RowList>
            </div>
          );
        })}
        <OutlineLink href="/nahj-studies/library">{x.library}</OutlineLink>
        <Note title={x.aboutT}><p>{x.about}</p><p className="mt-2">{studyNote(ed)}</p></Note>
      </LearnMain>
    </>
  );
}

function PassageBlock({ p, ed, open: initial = false }: { p: NahjPassage; ed: NahjEdition; open?: boolean }) {
  const x = useNahjText();
  const { lang } = useLang();
  const prog = useNahjProgress();
  const [open, setOpen] = useState(initial);
  const study = studyOf(ed, p.id);
  return (
    <div className="space-y-3">
      <Card><PassageText p={p} size={prog.font ?? 1} /><div className="mt-4"><ShareButton p={p} label={x.share} /></div></Card>
      {study && (
        <div className="rounded-lg border border-line bg-surface">
          <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex w-full items-center justify-between p-4 text-start font-semibold">
            {x.explanation}<span aria-hidden>{open ? "−" : "+"}</span>
          </button>
          {open && (
            <div dir={isRTL(lang) ? "rtl" : "ltr"} className="space-y-3 px-4 pb-4">
              <p lang={ed} className="leading-relaxed">{study.e}</p>
              <Kicker>{x.reflect}</Kicker>
              <ul className="list-disc space-y-1 ps-5">{study.r.map((q, i) => <li key={i} lang={ed}>{q}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const qText = (x: NahjCourseText, q: string) => (q.startsWith("matchQ|") ? fill(x.matchQ, { s: q.slice(7) }) : q);

function Quiz({ quiz, onDone }: { quiz: Qn[]; onDone: (score: number) => void }) {
  const x = useNahjText();
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const q = quiz[i];
  const next = () => {
    const s = score + (chosen === q.a ? 1 : 0);
    if (i + 1 >= quiz.length) onDone(s);
    else { setScore(s); setI(i + 1); setChosen(null); }
  };
  return (
    <div className="space-y-3">
      <Kicker>{fill(x.question, { n: i + 1, m: quiz.length })}</Kicker>
      <h2 className="font-display text-xl leading-snug">{qText(x, q.q)}</h2>
      {q.o.map((o, k) => (
        <Option key={k} disabled={chosen !== null} onClick={() => setChosen(k)}
          state={chosen === null ? "idle" : k === q.a ? "right" : chosen === k ? "wrong" : "dim"}>{o}</Option>
      ))}
      {chosen !== null && (
        <div aria-live="polite" className="space-y-2">
          <p className="font-semibold">{chosen === q.a ? x.right : x.wrong}</p>
          <GoldButton onClick={next}>{x.next}</GoldButton>
        </div>
      )}
    </div>
  );
}

export function NahjLessonScreen({ id }: { id: string }) {
  return <Gated><LessonBody key={id} id={id} /></Gated>;
}

function LessonBody({ id }: { id: string }) {
  const x = useNahjText();
  const ed = useEd();
  const router = useRouter();
  const prog = useNahjProgress();
  const lesson = lessonById(ed, id);
  const unit = lesson ? unitById(ed, lesson.unit) : null;
  const [phase, setPhase] = useState<"read" | "quiz" | "result">("read");
  const [res, setRes] = useState<{ score: number; of: number; passed: boolean; complete: boolean } | null>(null);
  const quiz = useMemo(() => (lesson ? lessonQuiz(ed, lesson) : []), [ed, lesson]);
  useEffect(() => { if (lesson) setLast(lesson.id); }, [lesson]);
  if (!lesson || !unit) return <LearnMain><p>{x.notFound}</p></LearnMain>;
  const all = courseUnits(ed).flatMap((u) => u.lessons);
  const nextL = all[all.findIndex((l) => l.id === lesson.id) + 1];
  const finish = (score: number) => {
    const r = markLesson(ed, lesson.id, score, quiz.length);
    setRes({ score, of: quiz.length, passed: r.passed, complete: r.complete });
    setPhase("result");
  };
  const font = prog.font ?? 1;
  return (
    <>
      <LearnHero back={{ href: "/nahj-studies", label: x.back }} kicker={`${x.units[unit.theme] ?? ""} · ${x.lesson} ${lesson.n}`} title={lesson.title} word="نهج البلاغة" uid="nahj-l" />
      <LearnMain className="space-y-5">
        {phase === "read" ? (
          <>
            <Kicker>{x.aim}</Kicker>
            <p className="text-[16px] leading-relaxed">{lesson.aim}</p>
            <div className="flex items-center gap-2" role="toolbar">
              <span className="flex-1 text-[13px] font-semibold text-muted">{x.textSize}</span>
              <OutlineButton label={x.smaller} disabled={font <= 0} onClick={() => setFont(font - 1)}>A−</OutlineButton>
              <OutlineButton label={x.larger} disabled={font >= 3} onClick={() => setFont(font + 1)}>A+</OutlineButton>
            </div>
            {lesson.items.map((p, i) => <PassageBlock key={p.id} p={p} ed={ed} open={i === 0} />)}
            <GoldButton onClick={() => setPhase("quiz")}>{x.quizStart}</GoldButton>
          </>
        ) : phase === "quiz" ? (
          quiz.length ? <Quiz quiz={quiz} onDone={finish} /> : <GoldButton onClick={() => finish(0)}>{x.next}</GoldButton>
        ) : res ? (
          <div className="space-y-3 text-center">
            <h2 className="font-display text-2xl">{fill(x.result, { n: res.score, m: res.of })}</h2>
            {!res.passed && <p className="text-muted">{`${Math.round(PASS_LESSON * 100)} %`}</p>}
            <div className="flex flex-wrap justify-center gap-3">
              {res.complete && <GoldLink href="/nahj-studies/certificate">{x.viewCert}</GoldLink>}
              {res.passed && nextL && <GoldButton onClick={() => router.push(`/nahj-studies/lesson/${nextL.id}`)}>{x.nextLesson}</GoldButton>}
              <OutlineButton onClick={() => setPhase("quiz")}>{x.retry}</OutlineButton>
            </div>
            <TextButton onClick={() => router.push("/nahj-studies")}>{x.back}</TextButton>
          </div>
        ) : null}
      </LearnMain>
    </>
  );
}

export function NahjUnitScreen({ id }: { id: string }) {
  return <Gated><UnitBody key={id} id={id} /></Gated>;
}

function UnitBody({ id }: { id: string }) {
  const x = useNahjText();
  const ed = useEd();
  const prog = useNahjProgress();
  const unit = unitById(ed, id);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [res, setRes] = useState<{ score: number; of: number; passed: boolean; complete: boolean } | null>(null);
  const quiz = useMemo(() => (unit ? unitTest(ed, unit) : []), [ed, unit]);
  if (!unit) return <LearnMain><p>{x.notFound}</p></LearnMain>;
  const ready = unit.lessons.every((l) => prog.lessons[l.id]);
  const finish = (score: number) => {
    const r = markUnit(ed, unit.id, score, quiz.length);
    setRes({ score, of: quiz.length, passed: r.passed, complete: r.complete });
    setPhase("result");
  };
  return (
    <>
      <LearnHero back={{ href: "/nahj-studies", label: x.back }} kicker={`${x.unit} ${unit.n}`} title={x.unitTest} lead={x.units[unit.theme]} word="نهج البلاغة" uid="nahj-u" />
      <LearnMain className="space-y-4">
        {phase === "intro" ? (
          <>
            <p className="text-[16px] leading-relaxed">{fill(x.unitTestLead, { m: quiz.length, p: Math.round(PASS_UNIT * 100) })}</p>
            {!ready && <p className="text-muted">{x.unitLocked}</p>}
            {prog.units[unit.id] && <p className="font-semibold text-[rgb(var(--hm-gold-d))]">{x.unitPassed}</p>}
            <GoldButton disabled={!ready || !quiz.length} onClick={() => setPhase("quiz")}>{x.quizStart}</GoldButton>
          </>
        ) : phase === "quiz" ? <Quiz quiz={quiz} onDone={finish} /> : res ? (
          <div className="space-y-3 text-center">
            <h2 className="font-display text-2xl">{fill(x.result, { n: res.score, m: res.of })}</h2>
            <p className="font-semibold">{res.passed ? x.unitPassed : x.unitFailed}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {res.complete && <GoldLink href="/nahj-studies/certificate">{x.viewCert}</GoldLink>}
              {!res.passed && <OutlineButton onClick={() => setPhase("quiz")}>{x.retry}</OutlineButton>}
              <OutlineLink href="/nahj-studies">{x.back}</OutlineLink>
            </div>
          </div>
        ) : null}
      </LearnMain>
    </>
  );
}

export function NahjLibraryScreen() {
  return <Gated><Library /></Gated>;
}

function Library() {
  const x = useNahjText();
  const ed = useEd();
  const prog = useNahjProgress();
  const units: Unit[] = courseUnits(ed);
  return (
    <>
      <LearnHero back={{ href: "/nahj-studies", label: x.back }} kicker={x.title} title={x.library} lead={x.libraryLead} word="نهج البلاغة" uid="nahj-b" />
      <LearnMain className="space-y-6">
        {units.map((u) => (
          <div key={u.id} className="space-y-2">
            <Kicker>{`${x.unit} ${u.n}`}</Kicker>
            <h2 className="font-display text-xl">{x.units[u.theme] ?? ""}</h2>
            <RowList>
              {u.lessons.map((l: Lesson) => (
                <Row key={l.id} href={`/nahj-studies/lesson/${l.id}`} title={`${l.n}. ${l.title}`} done={!!prog.lessons[l.id]}
                  sub={`${fill(x.passages, { n: l.items.length })}: ${l.items.map((p) => nahjRef(ed, p)).join(" · ")}`} />
              ))}
            </RowList>
          </div>
        ))}
      </LearnMain>
    </>
  );
}

export function NahjCertificateScreen() {
  return <Gated><Certificate /></Gated>;
}

function Certificate() {
  const x = useNahjText();
  const ed = useEd();
  const p = useNahjProgress();
  const st = courseState(ed, p);
  return (
    <>
      <LearnHero back={{ href: "/nahj-studies", label: x.back }} kicker={x.certificate} title={x.title} word="نهج البلاغة" uid="nahj-c" />
      <LearnMain>
        {p.cert ? (
          <Card className="space-y-2 text-center">
            <h2 className="font-display text-2xl">{x.title}</h2>
            <p className="text-muted">{x.certYou}</p>
            <p className="font-display text-4xl text-[rgb(var(--hm-gold-d))]">{`${p.cert.pct} %`}</p>
            <p className="text-[13px] text-muted">{new Date(p.cert.at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
            <p className="text-[12px] text-muted">{x.certNote}</p>
          </Card>
        ) : <p className="text-muted">{x.certLocked} {fill(x.progress, { n: st.lessonsDone, m: st.lessons })}</p>}
      </LearnMain>
    </>
  );
}


/** hub card (for everyone, like the app's library entry): the reader and the course */
export function NahjEntryCard({ className = "" }: { className?: string }) {
  const x = useNahjText();
  return (
    <CardLink href="/nahj" className={className}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <Kicker>{x.kicker}</Kicker>
          <h3 className="font-display mt-1.5 text-[20px] leading-snug">{useR().reader}</h3>
        </div>
        <span lang="ar" dir="rtl" aria-hidden className="font-arabic shrink-0 text-[22px] text-[rgb(var(--hm-gold-d))]">نهج البلاغة</span>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{useR().readerLead}</p>
    </CardLink>
  );
}
