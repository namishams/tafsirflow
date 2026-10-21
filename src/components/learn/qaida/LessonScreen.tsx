"use client";
// /arabic/read/[lesson] – one lesson of the reading course, the review ("review") or a surah lesson (kind "juz").
// Web port of QaidaLessonScreen, LessonLoader, LessonRun, Result and JuzSurahScreen (mobile/src/features/qaida/Screens.tsx):
// the exercises are built from the curriculum and the loaded Quran word data; a wrong answer comes back once at the end;
// the score counts first tries; saveLesson stores best score, stars, mistakes, the day, and turns the Quran words into
// cards of the card trainer. Every stage is free on the website.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useLang } from "@/lib/learn/i18n";
import { STAGES, lessonOf, stageOf, type QLesson, type QStage } from "@/lib/learn/qaida/curriculum";
import { buildLesson, buildReview, passFor, reviewSurahs, type Ex } from "@/lib/learn/qaida/lesson";
import { readQaida, saveLesson, starsFor, useQaida, weakKeys } from "@/lib/learn/qaida/progress";
import { useQT } from "@/lib/learn/qaida/texts";
import { realWords, toQWord, useSurahs } from "@/lib/learn/qaida/words";
import type { Verse } from "@/lib/learn/quran";
import { tone, announceAudio } from "@/components/learn/media";
import { Bar, GoldButton, GoldLink, LearnMain, OutlineButton, OutlineLink, Spinner } from "@/components/learn/ui";
import { ArrowBack, IconClose, IconPause, IconPlaySm, IconSpeaker } from "@/components/Icons";
import { BuildCard, ChooseCard, LearnCard, MatchCard, RED_TEXT, ReadCard, SpeedCard, useSay } from "./Exercises";
import { Stars, lessonHref } from "./PathScreen";
import { useQW } from "./strings";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
const MAP = "/arabic/read";

export default function QaidaLessonScreen({ id }: { id: string }) {
  const qt = useQT();
  const s = stageOf(id);
  const l = lessonOf(id);
  const [run, setRun] = useState(0);
  if (id !== "review" && (!s || !l)) return <Centered><OutlineLink href={MAP}>{qt("toMap")}</OutlineLink></Centered>;
  if (l?.kind === "juz") return <JuzSurahScreen key={l.id} surah={l.surah!} id={l.id} />;
  return <LessonLoader key={`${id}:${run}`} stage={s ?? null} lesson={l ?? null} retry={() => setRun((r) => r + 1)} />;
}

function Centered({ children }: { children: React.ReactNode }) {
  return <LearnMain><div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">{children}</div></LearnMain>;
}

function LessonLoader({ stage, lesson, retry }: { stage: QStage | null; lesson: QLesson | null; retry: () => void }) {
  const qt = useQT();
  const { lang } = useLang();
  // the review keys are fixed when the lesson starts (read once from the store, like the app's useMemo)
  const [keys] = useState(() => weakKeys(readQaida()));
  const surahs = useMemo(() => (lesson ? (lesson.kind === "forms" || lesson.kind === "syllables" ? [] : lesson.surahs ?? []) : reviewSurahs(keys).length ? reviewSurahs(keys) : [1]), [lesson, keys]);
  const { verses, error } = useSurahs(surahs);
  const { canSpeak } = useSay();
  // the browser lists its voices a moment after loading: wait briefly so letter and syllable audio is not dropped
  const [voiceWait, setVoiceWait] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVoiceWait(false), 700); return () => clearTimeout(t); }, []);
  const [exs, setExs] = useState<Ex[] | null>(null);
  useEffect(() => {
    if (!verses || exs || (voiceWait && !canSpeak)) return;
    setExs(lesson && stage ? buildLesson(stage, lesson, verses, lang, qt, canSpeak) : buildReview(keys, verses, lang, qt, canSpeak));
  }, [verses, voiceWait, canSpeak]); // eslint-disable-line react-hooks/exhaustive-deps
  if (error || (exs && !exs.length)) {
    return (
      <Centered>
        <p className="max-w-md text-base leading-relaxed text-muted" role="status">{error ? qt("offline") : qt("reviewEmpty")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {error ? <OutlineButton onClick={retry}>{qt("tryAgain")}</OutlineButton> : null}
          <OutlineLink href={MAP}>{qt("toMap")}</OutlineLink>
        </div>
      </Centered>
    );
  }
  if (!exs) return <Centered><Spinner label={qt("loading")} /></Centered>;
  return <LessonRun exs={exs} lesson={lesson} stage={stage} retry={retry} />;
}

const gradable = (e: Ex) => e.t === "choose" || e.t === "match" || e.t === "build" || e.t === "read";
const keyOf = (e: Ex) => ("key" in e ? e.key : "");

function LessonRun({ exs, lesson, stage, retry }: { exs: Ex[]; lesson: QLesson | null; stage: QStage | null; retry: () => void }) {
  const qt = useQT();
  const [queue, setQueue] = useState<Ex[]>(exs);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [graded, setGraded] = useState<boolean | null>(null);
  const [readScore, setReadScore] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const first = useRef(new Map<string, boolean>());
  const retried = useRef(new Set<number>());
  const [finished, setFinished] = useState<number | null>(null);
  const top = useRef<HTMLDivElement>(null);
  const ex = queue[i];

  const total = exs.filter(gradable).length;
  const grade = (ok: boolean) => {
    const k = `${i < exs.length ? i : -1}:${keyOf(ex)}`;
    if (i < exs.length && !first.current.has(k)) first.current.set(k, ok);
    setGraded(ok);
    tone(ok);
    if (!ok && i < exs.length && !retried.current.has(i)) { retried.current.add(i); setQueue((q) => [...q, ex]); }
  };

  const advance = () => {
    setPicked(null); setOrder([]); setChecked(false); setGraded(null); setReadScore(null); setReady(false);
    top.current?.scrollIntoView({ block: "start" });
    if (i + 1 < queue.length) { setI(i + 1); return; }
    const results = [...first.current.entries()];
    const right = results.filter(([, ok]) => ok).length;
    const pct = total ? Math.round((right / Math.max(total, results.length)) * 100) : 100;
    const wrongKeys = results.filter(([, ok]) => !ok).map(([k]) => k.split(":").slice(1).join(":"));
    const rightKeys = results.filter(([, ok]) => ok).map(([k]) => k.split(":").slice(1).join(":"));
    saveLesson(lesson?.id ?? "review", lesson ? pct : 100, wrongKeys.filter(Boolean), rightKeys.filter(Boolean));
    setFinished(pct);
  };

  const onCheck = () => {
    if (ex.t === "choose") { setChecked(true); grade(picked === ex.answer); }
    else if (ex.t === "build") { setChecked(true); grade(order.map((x) => ex.tiles[x]).join("|") === ex.tiles.join("|")); }
    else if (ex.t === "read") { if (readScore !== null) { setChecked(true); grade(readScore >= 0.7); } else advance(); }
  };

  if (finished !== null) return <Result pct={finished} lesson={lesson} stage={stage} retry={retry} />;
  if (!ex) return null;

  const canCheck = ex.t === "choose" ? picked !== null : ex.t === "build" ? order.length === ex.tiles.length : ex.t === "read";
  const showCheck = (ex.t === "choose" || ex.t === "build" || ex.t === "read") && !checked;
  const showNext = ex.t === "learn" || checked || ((ex.t === "match" || ex.t === "speed") && ready);
  const progress = (i + (checked ? 1 : 0)) / queue.length;

  return (
    <div ref={top} className="scroll-mt-20">
      <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pt-5">
        <Link href={MAP} aria-label={qt("quit")} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-[rgb(var(--hm-gold))]/10 hover:text-[rgb(var(--ink))]"><IconClose /></Link>
        <Bar value={progress} className="flex-1" label={qt("lesson", { n: i + 1 })} />
      </div>
      <main className="mx-auto max-w-2xl px-4 pb-56 pt-6 sm:px-5">
        <div key={i} className="rise">
          <div className={cx(ex.t === "choose" && graded === false && "pa-shake")}>
          {ex.t === "learn" ? <LearnCard ex={ex} /> : null}
          {ex.t === "choose" ? <ChooseCard ex={ex} picked={picked} checked={checked} onPick={setPicked} /> : null}
          {ex.t === "match" ? <MatchCard ex={ex} onDone={(m) => { grade(m === 0); setReady(true); }} /> : null}
          {ex.t === "build" ? <BuildCard ex={ex} checked={checked} onChange={setOrder} /> : null}
          {ex.t === "read" ? <ReadCard words={ex.words} onResult={setReadScore} /> : null}
          {ex.t === "speed" ? <SpeedCard ex={ex} onDone={() => setReady(true)} /> : null}
          </div>
        </div>
      </main>
      <div className={cx("fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 border-t border-line pb-3.5 pt-3.5 backdrop-blur lg:bottom-0 lg:pb-[calc(env(safe-area-inset-bottom)+14px)]",
        graded === null ? "bg-[rgb(var(--bg))]/95" : graded ? "bg-accent-soft" : "bg-red-50 dark:bg-red-950/60")}>
        <div className="mx-auto flex max-w-2xl flex-col gap-2.5 px-4">
          <p aria-live="polite" className={cx("min-h-0 text-base font-bold", graded ? "text-accent" : RED_TEXT)}>
            {graded !== null && ex.t !== "match" ? (graded ? qt("right") : ex.t === "choose" ? <>{qt("wrong")} {ex.options[ex.answer].text ?? <span lang="ar" dir="rtl" className="font-arabic text-xl">{ex.options[ex.answer].ar}</span>}</> : qt("wrong")) : null}
          </p>
          {showCheck ? (
            ex.t === "read" && readScore === null
              ? <OutlineButton onClick={advance} className="w-full">{qt("skip")}</OutlineButton>
              : <GoldButton disabled={!canCheck} onClick={onCheck} className="w-full">{qt("check")}</GoldButton>
          ) : null}
          {showNext ? <GoldButton onClick={advance} className="w-full">{qt("next")}</GoldButton> : null}
        </div>
      </div>
    </div>
  );
}

function Result({ pct, lesson, stage, retry }: { pct: number; lesson: QLesson | null; stage: QStage | null; retry: () => void }) {
  const qt = useQT();
  const pass = lesson ? passFor(lesson) : 0;
  const ok = pct >= pass;
  const stars = starsFor(pct);
  const nextL = stage && lesson ? stage.lessons[stage.lessons.indexOf(lesson) + 1] ?? STAGES[stage.n]?.lessons[0] : undefined;
  return (
    <LearnMain>
      <div className="mx-auto flex max-w-md flex-col items-stretch gap-4 pt-10 text-center" aria-live="polite">
        <div className="flex justify-center"><Stars n={lesson ? stars : 3} size={30} /></div>
        <h1 className="font-display text-[30px] leading-tight">{ok || !lesson ? qt("complete") : qt("almost")}</h1>
        {lesson ? <p className="text-base font-semibold text-muted">{qt("score", { p: pct })}</p> : null}
        {lesson && !ok ? <p className="text-[15px] leading-relaxed text-muted">{qt("needPass", { p: pass })}</p> : null}
        {ok && nextL ? <GoldLink href={lessonHref(nextL.id)}>{qt("nextLesson")}</GoldLink> : null}
        {!ok && lesson ? <GoldButton onClick={retry}>{qt("retry")}</GoldButton> : null}
        <OutlineLink href={MAP}>{qt("toMap")}</OutlineLink>
      </div>
    </LearnMain>
  );
}

// ---------- Juz ʿAmma: listen with word-by-word highlighting, then read each verse ----------

/** one verse recording at a time, with the playback position for the word highlighting (fallback: the remote file) */
function useVerseAudio() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [positionMs, setPos] = useState(0);
  const onEnd = useRef<() => void>(() => {});
  const stop = useCallback(() => { el.current?.pause(); setPlaying(false); }, []);
  const play = useCallback((url: string, fallback?: string) => {
    el.current?.pause();
    const a = new Audio(url);
    el.current = a;
    setPos(0);
    a.ontimeupdate = () => { if (el.current === a) setPos(a.currentTime * 1000); };
    a.onplaying = () => { if (el.current === a) setPlaying(true); };
    a.onpause = () => { if (el.current === a) setPlaying(false); };
    a.onended = () => { if (el.current === a) { setPlaying(false); onEnd.current(); } };
    a.onerror = () => { if (el.current === a) { if (fallback && fallback !== url) play(fallback); else setPlaying(false); } };
    announceAudio();
    a.play().catch(() => { if (el.current === a) setPlaying(false); });
  }, []);
  useEffect(() => {
    // the highlighting needs a finer step than timeupdate (about 4 per second)
    if (!playing) return;
    let raf = 0;
    const tick = () => { const a = el.current; if (a) setPos(a.currentTime * 1000); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
  useEffect(() => () => { el.current?.pause(); el.current = null; }, []);
  return { playing, positionMs, play, stop, onEnd };
}

function JuzSurahScreen({ surah, id }: { surah: number; id: string }) {
  const qt = useQT();
  const qw = useQW();
  const router = useRouter();
  const { verses, error } = useSurahs(useMemo(() => [surah], [surah]));
  const audio = useVerseAudio();
  const [cur, setCur] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  const [checkAt, setCheckAt] = useState<number | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const p = useQaida();
  const done = (p.done[id]?.best ?? 0) >= 70;

  const play = (k: number, vs: Verse[] | null = verses) => { const v = vs?.[k]; if (!v) return; setCur(k); audio.play(v.audioUrl, v.remoteAudioUrl); };
  audio.onEnd.current = () => { if (all && verses && cur !== null && cur + 1 < verses.length) play(cur + 1); else { setAll(false); setCur(null); } };
  const active = cur !== null && verses ? verses[cur].segments.find((s) => audio.positionMs >= s.start && audio.positionMs < s.end)?.word ?? null : null;

  const finish = () => {
    const vals = Object.values(scores);
    const pct = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) : 100;
    saveLesson(id, Math.max(70, pct), [], []);
    router.push(MAP);
  };

  return (
    <LearnMain>
      <Link href={MAP} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-muted hover:text-[rgb(var(--ink))]"><ArrowBack /> {qt("toMap")}</Link>
      <h1 className="font-display mt-3 text-[30px] leading-tight sm:text-4xl">{qt("juzSurah", { n: surah })}</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{qt("juzLead")}</p>
      {error ? <p className="mt-6 text-muted" role="status">{qt("offline")}</p> : !verses ? <div className="mt-8"><Spinner label={qt("loading")} /></div> : (
        <div className="mt-6 flex flex-col gap-4">
          <GoldButton className="self-start" onClick={() => { if (audio.playing && all) { audio.stop(); setAll(false); } else { setAll(true); play(cur ?? 0); } }}>
            {audio.playing && all ? <IconPause /> : <IconPlaySm />}{audio.playing && all ? qt("pause") : qt("playAll")}
          </GoldButton>
          {verses.map((v, k) => (
            <div key={v.verse_key} className="hm-card relative p-4 sm:p-5">
              <p dir="rtl" lang="ar" className="flex flex-wrap gap-1">
                {realWords(v).map((w) => {
                  const on = cur === k && active === w.position;
                  return <span key={w.position} className={cx("font-arabic rounded-md px-1 text-[28px] leading-[1.95] transition-colors", on ? "bg-accent text-white" : "")}>{w.text_uthmani}</span>;
                })}
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => { setAll(false); if (cur === k && audio.playing) audio.stop(); else play(k); }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-[13px] font-semibold hover:border-[rgb(var(--hm-gold))]/70">
                  <span className="text-accent [&_svg]:h-3.5 [&_svg]:w-3.5">{cur === k && audio.playing ? <IconPause /> : <IconPlaySm />}</span>{qt("verseN", { n: v.verse_number })}
                </button>
                <button type="button" onClick={() => setCheckAt(checkAt === k ? null : k)} aria-expanded={checkAt === k}
                  className={cx("inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold", checkAt === k ? "border-accent" : "border-line hover:border-[rgb(var(--hm-gold))]/70")}>
                  <IconSpeaker className="h-3.5 w-3.5 text-accent" />{qt("checkVerse")}
                </button>
                {scores[k] !== undefined ? <span className="inline-flex h-9 items-center text-[13px] font-semibold text-accent">{qw("verseRead", { n: v.verse_number, p: Math.round(scores[k] * 100) })}</span> : null}
              </div>
              {checkAt === k ? (
                <div className="mt-3">
                  <ReadCard highlight words={realWords(v).map((w) => toQWord(v, w))} onResult={(s) => { if (s !== null) setScores((m) => ({ ...m, [k]: s })); }} />
                </div>
              ) : null}
            </div>
          ))}
          <GoldButton onClick={finish}>{done ? qt("surahDone") : qt("markRead")}</GoldButton>
        </div>
      )}
    </LearnMain>
  );
}
