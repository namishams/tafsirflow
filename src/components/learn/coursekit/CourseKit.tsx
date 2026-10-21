"use client";
// Web version of the course engine in mobile/src/features/abrahamic/courseKit.tsx, shared by the Abrahamic and the
// Haramain course: lesson list with progress, lesson screen (tradition tags, explanation, note on the traditions, Quran
// passages by verse key via <QuranVerse>, quiz), result with next lesson / certificate, and the device certificate of
// completion. Progress and the certificate use the app's keys and markDone (src/lib/learn/abrahamic/kit.ts), so the
// account sync carries them. On the website everything is free: no Pro locks, no "free" labels. Garden growth and feed
// gamification of the app are left out; website points are awarded like the app awards them.
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { intlLocale, pick } from "@/lib/learn/i18n";
import { useAuth } from "@/lib/learn/auth";
import { award } from "@/lib/points";
import { certHref, lessonHref, markDone, useCK, useCourseProgress, type CourseDef, type Q, type Tag } from "@/lib/learn/abrahamic/kit";
import QuranVerse from "@/components/learn/QuranVerse";
import { getResources, translationFor } from "@/lib/learn/quran";
import { Bar, Card, GoldButton, GoldLink, Kicker, LearnHero, LearnMain, OutlineButton, OutlineLink, Option, Pill } from "@/components/learn/ui";
import { IconCheckCircle, IconShare, IconTrophy } from "@/components/Icons";
import { PracticeStar } from "@/components/art/PracticeArt";
import { WEB } from "./texts";
import { shareOrCopy } from "./share";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** the name of the translation the lesson's verses are shown in (as the app), for the source line; none in Arabic */
function useTranslationName(lang: string): string {
  const [name, setName] = useState("");
  useEffect(() => {
    let live = true;
    setName("");
    if (lang === "ar") return;
    Promise.all([translationFor(lang), getResources()])
      .then(([id, r]) => { const x = r.translations.find((tr) => tr.id === id); if (live && x) setName(x.name); })
      .catch(() => {});
    return () => { live = false; };
  }, [lang]);
  return name;
}

export function TagChips({ tags }: { tags: Tag[] }) {
  const { c } = useCK();
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((g) => <li key={g}><Pill>{c(`tag.${g}`)}</Pill></li>)}
    </ul>
  );
}

/** done lessons of a course (only ids that still exist) */
export function useCourseCount(def: CourseDef) {
  const p = useCourseProgress(def);
  const n = def.lessons.filter((l) => p.done[l.id]).length;
  return { n, m: def.lessons.length, cert: p.cert };
}

/** the lesson list for the course overview pages */
export function CourseList({ def }: { def: CourseDef }) {
  const { c, lang, rtl } = useCK();
  const p = useCourseProgress(def);
  const n = def.lessons.filter((l) => p.done[l.id]).length, m = def.lessons.length;
  const nextIdx = def.lessons.findIndex((l) => !p.done[l.id]);
  return (
    <Card>
      <Kicker>{c("course")}</Kicker>
      <p className="mt-2 text-[13.5px] text-muted">{c("progress", { n, m })}</p>
      <Bar value={n / m} gold className="mt-2" label={c("progress", { n, m })} />
      <ol className="mt-3 divide-y divide-line">
        {def.lessons.map((l, i) => {
          const done = !!p.done[l.id], current = i === nextIdx;
          return (
            <li key={l.id}>
              <Link href={lessonHref(def, l.id)} aria-current={current ? "step" : undefined}
                aria-label={`${c("lesson")} ${i + 1}: ${pick(l.title, lang)}${done ? `, ${c("done")}` : ""}`}
                className="group flex min-h-[56px] items-center gap-3 rounded-md py-2.5 transition hover:bg-[rgb(var(--hm-gold))]/[0.06]">
                <span aria-hidden className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[12.5px] font-semibold tabular-nums",
                  done ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))] text-white" : current ? "border-[rgb(var(--hm-gold))] text-[rgb(var(--hm-gold-d))]" : "border-line text-muted")}>
                  {done ? <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 12.5l4 4L18 8" /></svg> : i + 1}
                </span>
                <span dir={rtl ? "rtl" : undefined} className="min-w-0 flex-1 text-[15px] font-semibold leading-snug group-hover:underline">{pick(l.title, lang)}</span>
                <span lang="ar" dir="rtl" className="font-arabic shrink-0 text-[17px] text-[rgb(var(--hm-gold-d))]">{l.arabic}</span>
                <span aria-hidden className="shrink-0 text-muted rtl:-scale-x-100">›</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-4">
        {p.cert
          ? <GoldLink href={certHref(def)} className="h-11 px-5"><IconTrophy className="h-5 w-5" />{c("viewCert")}</GoldLink>
          : <p className="text-[12.5px] text-muted">{c("certLocked", { m })}</p>}
      </div>
    </Card>
  );
}

function Quiz({ quiz, onDone }: { quiz: Q[]; onDone: (score: number) => void }) {
  const { c, lang, rtl } = useCK();
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const head = useRef<HTMLHeadingElement>(null);
  useEffect(() => { head.current?.focus({ preventScroll: true }); }, [i]);
  const q = quiz[i];
  const choose = (k: number) => {
    if (chosen !== null) return;
    setChosen(k);
    if (k === q.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= quiz.length) { onDone(score); return; }
    setI(i + 1); setChosen(null);
  };
  const ok = chosen === q.answer;
  return (
    <section className="space-y-3">
      <Kicker>{c("question", { n: i + 1, m: quiz.length })}</Kicker>
      <Bar value={i / quiz.length} label={c("question", { n: i + 1, m: quiz.length })} />
      <h2 ref={head} tabIndex={-1} dir={rtl ? "rtl" : undefined} className="font-display pt-1 text-[22px] leading-snug outline-none">{pick(q.q, lang)}</h2>
      <div className="grid gap-2.5">
        {q.options.map((o, k) => {
          const state = chosen === null ? "idle" : k === q.answer ? "right" : k === chosen ? "wrong" : "dim";
          return <Option key={`${i}-${k}`} state={state} disabled={chosen !== null} onClick={() => choose(k)} dir={rtl ? "rtl" : undefined}>{pick(o, lang)}</Option>;
        })}
      </div>
      <div aria-live="polite" className="min-h-[1px]">
        {chosen !== null && (
          <div className="space-y-3 pt-1">
            <p className={cx("text-[15px] font-semibold", ok ? "text-accent" : "text-red-700 dark:text-red-400")}>{c(ok ? "right" : "wrong")}</p>
            {q.why && <p dir={rtl ? "rtl" : undefined} className="text-[14.5px] leading-relaxed text-muted">{pick(q.why, lang)}</p>}
            <GoldButton onClick={next} className="w-full sm:w-auto">{c("next")}</GoldButton>
          </div>
        )}
      </div>
    </section>
  );
}

/** one lesson: tags, explanation, note, Quran passages, quiz, result */
export function CourseLessonScreen({ def, id }: { def: CourseDef; id: string }) {
  const { c, lang, rtl } = useCK();
  const idx = def.lessons.findIndex((l) => l.id === id);
  const lesson = def.lessons[idx];
  const p = useCourseProgress(def);
  const [phase, setPhase] = useState<"read" | "quiz" | "result">("read");
  const [res, setRes] = useState<{ score: number; complete: boolean } | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const source = useTranslationName(lang);
  useEffect(() => { setPhase("read"); setRes(null); }, [id]);
  useEffect(() => { if (phase !== "read") top.current?.scrollIntoView({ block: "start", behavior: "smooth" }); }, [phase]);
  if (!lesson) {
    return (
      <div>
        <LearnHero kicker={pick(def.title, lang)} title={c("notFound")} back={{ href: def.route, label: c("overview") }} uid={`ck-${def.id}`} />
      </div>
    );
  }
  const finish = (score: number) => {
    const r = markDone(def, lesson.id, score, lesson.quiz.length);
    if (r.first) award("lesson");
    award("quiz");
    setRes({ score, complete: r.complete });
    setPhase("result");
  };
  const nextL = def.lessons[idx + 1];
  const done = p.done[lesson.id];
  const dir = rtl ? "rtl" : undefined;
  return (
    <div>
      <LearnHero uid={`ck-${def.id}-l`} word={lesson.arabic} back={{ href: def.route, label: c("overview") }}
        kicker={`${pick(def.title, lang)} · ${c("lesson")} ${idx + 1}/${def.lessons.length}`} title={pick(lesson.title, lang)}
        lead={done ? <span className="inline-flex items-center gap-2 text-[15px]"><IconCheckCircle className="h-5 w-5 text-[rgb(var(--gold))]" />{`${c("done")} · ${c("result", { n: done.score, m: done.of })}`}</span> : undefined} />
      <LearnMain>
        <div ref={top} className="scroll-mt-20">
          {phase === "read" ? (
            <article className="space-y-6">
              <TagChips tags={lesson.tags} />
              <section className="space-y-3">
                <Kicker>{c("explain")}</Kicker>
                <div dir={dir} className="space-y-3 text-[16.5px] leading-[1.75]">
                  {pick(lesson.text, lang).split("\n").map((t, k) => <p key={k}>{t}</p>)}
                </div>
                {lesson.review && <p dir={dir} className="text-[13px] leading-relaxed text-muted">{c("review")}</p>}
              </section>
              {lesson.note && (
                <aside className="rounded-xl border border-[rgb(var(--hm-gold))]/70 p-5">
                  <Kicker>{c("note")}</Kicker>
                  <p dir={dir} className="mt-2 text-[15px] leading-relaxed">{pick(lesson.note, lang)}</p>
                </aside>
              )}
              {lesson.verses.length > 0 && (
                <section className="space-y-3">
                  <Kicker>{c("quran")}</Kicker>
                  <div className="grid gap-3">
                    {lesson.verses.map((k) => <QuranVerse key={k} verseKey={k} size="text-[24px] sm:text-[28px]" />)}
                  </div>
                  {source && <p className="text-[13px] text-muted">{c("translationBy", { name: source })}</p>}
                </section>
              )}
              <GoldButton onClick={() => setPhase("quiz")} className="w-full sm:w-auto">{c("startQuiz")}</GoldButton>
            </article>
          ) : phase === "quiz" ? (
            <Quiz key={`${lesson.id}-quiz`} quiz={lesson.quiz} onDone={finish} />
          ) : res ? (
            <section aria-live="polite" className="hm-card relative mx-auto max-w-xl space-y-3 p-6 text-center">
              <PracticeStar size={14} className="mx-auto text-[rgb(var(--hm-gold))]" />
              <h2 className="font-display text-[26px]">{c("result", { n: res.score, m: lesson.quiz.length })}</h2>
              <Bar value={lesson.quiz.length ? res.score / lesson.quiz.length : 1} gold />
              <div className="flex flex-col gap-2.5 pt-3">
                {(res.complete || (!nextL && !!p.cert)) && <GoldLink href={certHref(def)}><IconTrophy className="h-5 w-5" />{c("viewCert")}</GoldLink>}
                {nextL && <GoldLink href={lessonHref(def, nextL.id)}>{c("nextLesson")}</GoldLink>}
                <OutlineButton onClick={() => setPhase("quiz")}>{c("retry")}</OutlineButton>
                <Link href={def.route} className="inline-flex min-h-10 items-center justify-center text-sm font-semibold text-accent hover:underline">{c("overview")}</Link>
              </div>
            </section>
          ) : null}
        </div>
      </LearnMain>
    </div>
  );
}

/** the device certificate of completion */
export function CourseCertificateScreen({ def }: { def: CourseDef }) {
  const { c, lang } = useCK();
  const w = (k: string) => pick(WEB[k], lang);
  const p = useCourseProgress(def);
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { if (!touched && user?.name) setName(user.name); }, [user, touched]);
  const m = def.lessons.length;
  const n = def.lessons.filter((l) => p.done[l.id]).length;
  const title = pick(def.title, lang);
  const share = async () => {
    if (!p.cert) return;
    const text = `${c("certificate")} · ${title}${name.trim() ? ` · ${name.trim()}` : ""} · ${p.cert.pct} %`;
    const r = await shareOrCopy({ title: `${c("certificate")} · ${title}`, text });
    setMsg(r === "copied" ? w("copied") : "");
  };
  return (
    <div>
      <LearnHero uid={`ck-${def.id}-c`} kicker={c("certificate")} title={title} back={{ href: def.route, label: c("overview") }} />
      <LearnMain>
        {!p.cert ? (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-line p-5">
            <p className="flex-1 text-[14.5px] text-muted">{`${c("certLocked", { m })} ${c("progress", { n, m })}`}</p>
            <Bar value={n / m} gold className="w-24 shrink-0" />
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-5">
            <div className="print:hidden">
              <label htmlFor="ck-cert-name" className="block text-[13.5px] font-semibold">{w("name")}</label>
              <input id="ck-cert-name" value={name} maxLength={80} autoComplete="name"
                onChange={(e) => { setTouched(true); setName(e.target.value); }}
                className="mt-1.5 h-11 w-full rounded-md border border-line bg-surface px-3 text-[15px] outline-none focus:border-[rgb(var(--hm-gold))]" />
              <p className="mt-1 text-[12.5px] text-muted">{w("nameHint")}</p>
            </div>
            <figure className="stage girih relative overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/60 text-[#eef0f3]">
              <div className="relative flex flex-col items-center gap-2 px-6 pb-14 pt-9 text-center">
                <PracticeStar size={16} className="text-[rgb(var(--gold))]" />
                <p className="font-display text-[15px] tracking-[0.18em] text-[rgb(var(--gold))] rtl:tracking-normal">Quran Masterclass</p>
                <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.22em] text-white/55 rtl:tracking-normal">{c("certificate")}</p>
                {name.trim() && <p className="font-display mt-3 break-words text-[30px] leading-tight text-white">{name.trim()}</p>}
                <p className="text-[15px] text-white/75">{c("certYou")}</p>
                <h2 className="font-display max-w-md text-[24px] leading-snug text-white">{title}</h2>
                <p className="mt-1 text-[14px] font-semibold text-[#f3e7c9]">{`${p.cert.pct} % · ${new Date(p.cert.at).toLocaleDateString(intlLocale(lang))}`}</p>
                <p className="mt-3 max-w-sm text-[12px] leading-relaxed text-white/55">{c("certNote")}</p>
              </div>
              <div className="pa-arcade" />
            </figure>
            <div className="flex flex-wrap gap-3 print:hidden">
              <GoldButton onClick={() => void share()}><IconShare />{c("share")}</GoldButton>
              <OutlineButton onClick={() => window.print()}>{w("print")}</OutlineButton>
              <OutlineLink href={def.route}>{c("overview")}</OutlineLink>
            </div>
            <p aria-live="polite" className="text-[13px] text-muted">{msg}</p>
          </div>
        )}
      </LearnMain>
    </div>
  );
}
