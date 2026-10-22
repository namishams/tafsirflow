"use client";
// /courses/[course]/[lesson] – one lesson: explanation (Markdown), verses by key, hadith references, perspective tags,
// then the quiz, the result (pass from PASS) and the next lesson. Web port of LessonScreen in
// mobile/src/features/courses/Screens.tsx: progress through saveCourseLesson (qmc.courses.v1, synced with the account),
// a first pass awards website points ("lesson"); the app's XP, tree growth, haptics and Pro locks are left out.
import { useEffect, useMemo, useRef, useState } from "react";
import Markdown from "@/components/Markdown";
import SupportNudge from "@/components/SupportNudge";
import QuranVerse from "@/components/learn/QuranVerse";
import { Callout, GoldButton, Kicker, LearnHero, LearnMain, Note, OutlineLink, GoldLink, Pill, Spinner, Ar } from "@/components/learn/ui";
import { HomeRing } from "@/components/art/HomeOrnaments";
import { ArrowNext } from "@/components/Icons";
import { award } from "@/lib/points";
import { formatNumber, useLang } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { courseById, tx } from "@/lib/learn/courses";
import { nameRefs, useAllahNames } from "@/lib/learn/courses/names";
import { PASS, saveCourseLesson, useCP, lessonKey } from "@/lib/learn/courses/progress";
import { useCT } from "@/lib/learn/courses/texts";
import type { CQuestion } from "@/lib/learn/courses/types";
import { CourseBadge, Quiz, TagChips, hadithLabel, shuffle, type RunQ } from "./parts";
import { useWT } from "./strings";
import AskTutor from "@/components/tutor/AskTutor";

export default function LessonScreen({ courseId, lessonId }: { courseId: string; lessonId: string }) {
  const c = useCT();
  const w = useWT();
  const { lang } = useLang();
  const course = courseById(courseId);
  const names = useAllahNames(lang);
  const p = useCP();
  const ready = useHydrated();
  const [phase, setPhase] = useState<"read" | "quiz" | "result">("read");
  const [res, setRes] = useState<{ score: number; complete: boolean } | null>(null);
  const [round, setRound] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => { setPhase("read"); setRes(null); }, [courseId, lessonId]);
  const idx = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course && idx >= 0 ? course.lessons[idx] : undefined;
  const isNames = courseId === "names";
  const name = isNames && names ? names[idx] : undefined;

  // the questions of this lesson in the page language (names: built from the list); a new round reshuffles
  const qs: RunQ[] = useMemo(() => {
    if (!lesson) return [];
    if (isNames) {
      if (!names?.length || !name) return [];
      const others = shuffle(names.filter((n) => n.meaning !== name.meaning)).slice(0, 3).map((n) => n.meaning);
      const opts = shuffle([name.meaning, ...others]);
      const latins = shuffle([name.latin, ...shuffle(names.filter((n) => n.latin !== name.latin)).slice(0, 3).map((n) => n.latin)]);
      return [
        { q: c("nameQ"), options: opts, answer: opts.indexOf(name.meaning) },
        { q: name.meaning, options: latins, answer: latins.indexOf(name.latin) },
      ];
    }
    return lesson.quiz.map((q: CQuestion) => ({ q: tx(q.q, lang), options: q.options.map((o) => tx(o, lang)), answer: q.answer, explain: q.explain ? tx(q.explain, lang) : undefined }));
  }, [lesson, isNames, names, name, lang, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const go = (ph: typeof phase) => { setPhase(ph); requestAnimationFrame(() => top.current?.scrollIntoView({ block: "start" })); };

  if (!course || !lesson) return <LearnMain><Note tone="red" title={c("notFound")} /></LearnMain>;
  const ids = course.lessons.map((l) => l.id);
  const nextL = course.lessons[idx + 1];
  const title = isNames ? (name?.latin ?? `${c("lesson")} ${formatNumber(idx + 1, lang)}`) : tx(lesson.title, lang);
  const verses = isNames ? (names ? nameRefs(names, idx) : []) : lesson.verses ?? [];
  const best = ready ? p.done[lessonKey(course.id, lesson.id)]?.score : undefined;

  const finish = (right: number) => {
    const score = qs.length ? right / qs.length : 1;
    const r = saveCourseLesson(course.id, lesson.id, score, ids);
    if (r.first) award("lesson");
    setRes({ score, complete: r.complete });
    go("result");
  };

  return (
    <div>
      <LearnHero uid="crsl" back={{ href: `/courses/${course.id}`, label: tx(course.title, lang) }}
        kicker={`${tx(course.title, lang)} · ${w("lessonOf", { n: formatNumber(idx + 1, lang), m: formatNumber(ids.length, lang) })}`}
        title={title} word={isNames ? name?.ar : course.word}
        lead={best !== undefined ? w("best", { p: Math.round(best * 100) }) : undefined} />
      <LearnMain>
        <div ref={top} className="scroll-mt-24" />
        {phase === "read" ? (
          <div className="space-y-8">
            {course.note && idx === 0 && <Callout title={c("note")}>{tx(course.note, lang)}</Callout>}
            <TagChips tags={lesson.tags} />
            {isNames ? (
              name ? (
                <div className="hm-card relative flex flex-col items-center gap-2 px-5 py-8 text-center">
                  <Ar size="text-[48px] sm:text-[56px]" className="text-[rgb(var(--hm-gold-d))]">{name.ar}</Ar>
                  <p className="text-xl font-bold">{name.latin}</p>
                  <Kicker className="mt-2">{c("nameMeaning")}</Kicker>
                  <p className="max-w-xl text-[17px] leading-relaxed">{name.meaning}</p>
                  {!verses.length && <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-muted">{c("nameSunnah")}</p>}
                </div>
              ) : names && !names.length ? <Note tone="red" title={w("loadFailed")} /> : <Spinner label={c("namesLoading")} />
            ) : (
              <article className="pa-paper px-5 pb-6 pt-4 sm:px-8"><div className="relative"><Markdown text={tx(lesson.body, lang)} /></div></article>
            )}
            {verses.length > 0 && (
              <section className="space-y-3" aria-label={isNames ? c("nameInQuran") : c("verses")}>
                <Kicker>{isNames ? c("nameInQuran") : c("verses")}</Kicker>
                {verses.map((k) => <QuranVerse key={k} verseKey={k} size="text-[24px] sm:text-[28px]" />)}
              </section>
            )}
            {lesson.hadith?.length ? (
              <section aria-label={c("hadith")}>
                <Kicker>{c("hadith")}</Kicker>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {lesson.hadith.map((h) => <li key={h}><Pill tone="gold">{hadithLabel(h)}</Pill></li>)}
                </ul>
              </section>
            ) : null}
            <div><AskTutor kind="lesson" context={{ kind: "lesson", id: courseId, lesson: lessonId, title }} /></div>
            {qs.length > 0 && <GoldButton onClick={() => go("quiz")} className="w-full sm:w-auto">{c("startQuiz")} <ArrowNext /></GoldButton>}
          </div>
        ) : phase === "quiz" ? (
          <Quiz key={round} qs={qs} onDone={finish} ctx={{ kind: "quiz", id: courseId, lesson: lessonId, title }} />
        ) : res ? (
          <Result score={res.score} complete={res.complete} word={course.word}
            onRetry={() => { setRound((r) => r + 1); go("quiz"); }}
            nextHref={nextL ? `/courses/${course.id}/${nextL.id}` : undefined}
            overviewHref={`/courses/${course.id}`} />
        ) : null}
      </LearnMain>
    </div>
  );
}

function Result({ score, complete, word, onRetry, nextHref, overviewHref }: {
  score: number; complete: boolean; word: string; onRetry: () => void; nextHref?: string; overviewHref: string;
}) {
  const c = useCT();
  const passed = score >= PASS;
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => { head.current?.focus(); }, []);
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <HomeRing id="crs-res" value={score} size={128} dark={false}>
        <span className="font-display text-[28px]">{Math.round(score * 100)}%</span>
      </HomeRing>
      <h2 ref={head} tabIndex={-1} className="font-display text-[28px] outline-none">{passed ? c("passed") : c("almost")}</h2>
      {!passed && <p className="text-[14.5px] text-muted">{c("needPass", { p: Math.round(PASS * 100) })}</p>}
      {complete && (
        <div className="mt-2 flex flex-col items-center gap-2">
          <CourseBadge word={word} size={104} label={c("sticker")} />
          <p className="font-bold">{c("sticker")}</p>
          <p className="text-[14px] text-muted">{c("stickerLead")}</p>
        </div>
      )}
      <div className="mt-4 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        {passed && nextHref && <GoldLink href={nextHref}>{c("nextLesson")} <ArrowNext /></GoldLink>}
        {!passed && <GoldButton onClick={onRetry}>{c("retry")}</GoldButton>}
        <OutlineLink href={overviewHref}>{c("overview")}</OutlineLink>
      </div>
      {passed && <SupportNudge className="mt-4 w-full max-w-md" />}
    </div>
  );
}
