"use client";
import { ArrowBack } from "./Icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RECITERS, getChapter, getResources, getVerses, pickTranslation, type Chapter, type Verse } from "@/lib/quran";
import { noteMistake } from "@/lib/learning";
import { ageProfile } from "@/lib/age";
import { PASS, PATH, levelOf, questionsFor, readProgress, saveResult, secondsPerQuestion } from "@/lib/academy";
import { IconPlay } from "./Icons";
import { PracticeCelebrate, PracticeMedallion, PracticeStar, PracticeStarNum } from "./art/PracticeArt";

type Q =
  | { kind: "next"; prompt: string[]; options: string[]; answer: number; key: string }
  | { kind: "meaning"; word: string; options: string[]; answer: number; key: string }
  | { kind: "order"; tiles: string[]; solution: string[]; key: string }
  | { kind: "listen"; audio: string; options: string[]; answer: number; key: string };

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const wordsOf = (v: Verse) => v.words.filter((w) => w.char_type_name === "word");

// Builds a varied test from the lesson's verses (and the rest of the surah for distractors)
function buildQuiz(all: Verse[], from: number, to: number, count: number): Q[] {
  const lesson = all.filter((v) => v.verse_number >= from && v.verse_number <= to);
  const pool = all.flatMap((v) => wordsOf(v).map((w) => ({ ar: w.text_uthmani, tr: (w.translation?.text ?? "").trim() })));
  const uniqAr = Array.from(new Set(pool.map((p) => p.ar)));
  const uniqTr = Array.from(new Set(pool.map((p) => p.tr).filter(Boolean)));
  const distract = (correct: string, from: string[], n = 3) => shuffle(from.filter((x) => x !== correct)).slice(0, n);
  const makers: (() => Q | null)[] = [
    () => {
      const v = pick(lesson); const ws = wordsOf(v); if (ws.length < 2) return null;
      const i = 1 + Math.floor(Math.random() * (ws.length - 1));
      const correct = ws[i].text_uthmani; const opts = shuffle([correct, ...distract(correct, uniqAr)]);
      if (opts.length < 3) return null;
      return { kind: "next", prompt: ws.slice(Math.max(0, i - 4), i).map((w) => w.text_uthmani), options: opts, answer: opts.indexOf(correct), key: v.verse_key };
    },
    () => {
      const v = pick(lesson); const ws = wordsOf(v).filter((w) => (w.translation?.text ?? "").trim()); if (!ws.length) return null;
      const w = pick(ws); const correct = (w.translation?.text ?? "").trim(); const opts = shuffle([correct, ...distract(correct, uniqTr)]);
      if (opts.length < 3) return null;
      return { kind: "meaning", word: w.text_uthmani, options: opts, answer: opts.indexOf(correct), key: v.verse_key };
    },
    () => {
      const v = pick(lesson); const ws = wordsOf(v).map((w) => w.text_uthmani); if (ws.length < 3) return null;
      const start = ws.length > 6 ? Math.floor(Math.random() * (ws.length - 5)) : 0;
      const sol = ws.slice(start, start + 6);
      return { kind: "order", tiles: shuffle(sol), solution: sol, key: v.verse_key };
    },
    () => {
      if (all.length < 3) return null;
      const v = pick(lesson); const text = (x: Verse) => wordsOf(x).slice(0, 5).map((w) => w.text_uthmani).join(" ");
      const others = shuffle(all.filter((x) => x.verse_key !== v.verse_key)).slice(0, 3).map(text);
      const opts = shuffle([text(v), ...others]);
      return { kind: "listen", audio: v.audioUrl, options: opts, answer: opts.indexOf(text(v)), key: v.verse_key };
    },
  ];
  const out: Q[] = [];
  for (let tries = 0; out.length < count && tries < count * 8; tries++) {
    const q = makers[out.length % makers.length]();
    if (q) out.push(q);
  }
  return out;
}

export default function LessonRunner({ s, from }: { s: number; from: number }) {
  const t = useTranslations("academy");
  const locale = useLocale();
  const lesson = PATH.find((l) => l.s === s && l.from === from) ?? { s, from, to: from, id: `${s}:${from}` };
  const nextL = PATH[PATH.findIndex((l) => l.id === lesson.id) + 1];
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [left, setLeft] = useState(0);
  const [lvl, setLvl] = useState(1);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setLvl(levelOf(readProgress().xp));
    getChapter(s, locale).then(setChapter).catch(() => undefined);
    getResources().then((r) => getVerses(s, locale, RECITERS[0], pickTranslation(locale, r.translations))).then(setVerses).catch(() => setVerses([]));
  }, [s, locale]);

  const secs = secondsPerQuestion(lvl, ageProfile().testBonus);
  const start = () => {
    setQs(buildQuiz(verses, lesson.from, lesson.to, questionsFor(lvl)));
    setI(0); setCorrect(0); setXp(0); setPicked(null); setOrder([]); setLeft(secs); setPhase("quiz");
  };
  const q = qs[i];
  const answered = picked !== null;

  const award = (ok: boolean) => { if (!ok && q) noteMistake(q.key); if (ok) { setCorrect((c) => c + 1); setXp((x) => x + 10 + Math.max(0, left)); } };

  // countdown per question
  useEffect(() => {
    if (phase !== "quiz" || answered) return;
    if (left <= 0) { setPicked(-1); if (q) noteMistake(q.key); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, left, answered]);

  const next = () => {
    if (i + 1 >= qs.length) {
      const score = Math.round(((correct) / qs.length) * 100);
      saveResult(lesson.id, score, xp);
      setPhase("result");
      return;
    }
    setI(i + 1); setPicked(null); setOrder([]); setLeft(secs);
  };

  const choose = (n: number) => { if (q && "answer" in q && !answered) { setPicked(n); award(n === q.answer); } };
  const tapTile = (n: number) => {
    if (!q || q.kind !== "order" || answered || order.includes(n)) return;
    const o = [...order, n]; setOrder(o);
    if (o.length === q.tiles.length) { const ok = o.every((x, k) => q.tiles[x] === q.solution[k]); setPicked(ok ? 1 : 0); award(ok); }
  };

  const score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
  const optBtn = (n: number, ans: number) => {
    const base = "w-full rounded-xl border-2 p-4 text-start transition";
    if (!answered) return `${base} border-line bg-surface hover:border-[rgb(201_166_94)]/60`;
    if (n === ans) return `${base} pa-right border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15`;
    if (n === picked) return `${base} pa-shake border-[rgb(190_84_104)] bg-[rgb(190_84_104)]/10`;
    return `${base} border-line bg-surface opacity-60`;
  };
  const wasRight = useMemo(() => {
    if (!q || !answered) return false;
    if (q.kind === "order") return order.length === q.tiles.length && order.every((x, k) => q.tiles[x] === q.solution[k]);
    return picked === q.answer;
  }, [q, answered, picked, order]);

  if (!verses.length) return <main className="mx-auto max-w-2xl px-4 py-10 text-muted">{t("loading")}</main>;
  const title = `${chapter?.name_simple ?? `${locale === "ar" ? "سورة" : "Surah"} ${s}`} · ${lesson.from}–${lesson.to}`;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-6">
      <Link href="/academy" className="text-sm font-semibold text-muted hover:text-ink"><ArrowBack /> {t("title")}</Link>
      <h1 className="font-display mt-3 text-3xl leading-tight sm:text-4xl">{title}</h1>

      {phase === "intro" && (
        <>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{t("introLead")}</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            <li className="pa-card p-5 pt-6">
              <PracticeStarNum n={1} size={40} />
              <h2 className="mt-1 text-lg font-bold">{t("stepLearn")}</h2>
              <p className="mt-1 text-[15px] text-muted">{t("stepLearnD")}</p>
              <Link href={`/surah/${s}?v=${lesson.from}&shams=1`} className="mt-4 inline-flex h-11 items-center rounded-full border border-line px-5 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("learnShams")}</Link>
            </li>
            <li className="pa-card p-5 pt-6">
              <PracticeStarNum n={2} size={40} />
              <h2 className="mt-1 text-lg font-bold">{t("stepTest")}</h2>
              <p className="mt-1 text-[15px] text-muted">{t("stepTestD", { n: questionsFor(lvl), secs, pass: PASS })}</p>
              <button onClick={start} className="btn-gold mt-4 h-11 rounded-full px-5 text-sm font-bold">{t("startTest")}</button>
            </li>
          </ol>
          <div className="mt-6 grid gap-3">
            {verses.filter((v) => v.verse_number >= lesson.from && v.verse_number <= lesson.to).map((v) => (
              <div key={v.verse_key} className="pa-card pa-plain p-4">
                <p className="font-arabic text-2xl leading-[2]" dir="rtl">{v.text_uthmani}</p>
                <p className="mt-1 text-sm text-muted">{v.translation}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {phase === "quiz" && q && (
        <section className="mt-5">
          <div className="flex items-center justify-between text-sm font-semibold text-muted">
            <span>{t("question", { n: i + 1, total: qs.length })}</span>
            <span className={`rounded-full border px-2.5 py-0.5 tabular-nums ${left <= 5 && !answered ? "border-[rgb(190_84_104)]/50 text-[rgb(190_84_104)]" : "border-line"}`}>{Math.max(0, left)}s</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2] transition-all rtl:bg-gradient-to-l" style={{ width: `${(i / qs.length) * 100}%` }} /></div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent/60 transition-all duration-1000 ease-linear" style={{ width: `${(Math.max(0, left) / secs) * 100}%` }} /></div>

          <div className="pa-card mt-6 p-5">
            {q.kind === "next" && (<>
              <p className="text-sm font-semibold text-muted">{t("qNext")}</p>
              <p className="font-arabic mt-3 text-3xl leading-[2]" dir="rtl">{q.prompt.join(" ")} <span className="text-gold">…</span></p>
              <div className="mt-4 grid gap-2">{q.options.map((o, n) => <button key={n} onClick={() => choose(n)} className={optBtn(n, q.answer)}><span className="font-arabic text-2xl" dir="rtl">{o}</span></button>)}</div>
            </>)}
            {q.kind === "meaning" && (<>
              <p className="text-sm font-semibold text-muted">{t("qMeaning")}</p>
              <p className="font-arabic mt-3 text-4xl" dir="rtl">{q.word}</p>
              <div className="mt-4 grid gap-2">{q.options.map((o, n) => <button key={n} onClick={() => choose(n)} className={optBtn(n, q.answer)}>{o}</button>)}</div>
            </>)}
            {q.kind === "listen" && (<>
              <p className="text-sm font-semibold text-muted">{t("qListen")}</p>
              <button onClick={() => { if (!audio.current) audio.current = new Audio(); audio.current.src = q.audio; window.dispatchEvent(new Event("tf-audio-start")); void audio.current.play(); }} className="stage mt-3 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-[#f3e2b6] ring-1 ring-[rgb(201_166_94)]/60"><IconPlay />{t("play")}</button>
              <div className="mt-4 grid gap-2">{q.options.map((o, n) => <button key={n} onClick={() => choose(n)} className={optBtn(n, q.answer)}><span className="font-arabic text-xl" dir="rtl">{o} …</span></button>)}</div>
            </>)}
            {q.kind === "order" && (<>
              <p className="text-sm font-semibold text-muted">{t("qOrder")}</p>
              <p className="font-arabic mt-3 min-h-[3.5rem] rounded-xl border-2 border-dashed border-[rgb(var(--gold))]/35 p-2 text-2xl leading-[2]" dir="rtl">{order.map((n) => q.tiles[n]).join(" ")}</p>
              <div className="mt-4 flex flex-wrap gap-2" dir="rtl">
                {q.tiles.map((w, n) => <button key={n} disabled={order.includes(n) || answered} onClick={() => tapTile(n)} className="font-arabic rounded-xl border-2 border-line bg-surface px-3 py-1.5 text-2xl transition hover:border-[rgb(201_166_94)]/60 disabled:opacity-30">{w}</button>)}
              </div>
              {!answered && order.length > 0 && <button onClick={() => setOrder([])} className="mt-3 text-sm text-muted underline">{t("reset")}</button>}
              {answered && !wasRight && <p className="font-arabic mt-3 text-xl text-accent" dir="rtl">{q.solution.join(" ")}</p>}
            </>)}
          </div>

          {answered && (
            <div className={`step-in mt-4 flex items-center justify-between gap-3 rounded-xl border p-4 ${wasRight ? "border-[rgb(201_166_94)]/45 bg-[rgb(201_166_94)]/12" : "border-[rgb(190_84_104)]/30 bg-[rgb(190_84_104)]/[0.08]"}`}>
              <p className={`flex flex-wrap items-center gap-2 font-bold ${wasRight ? "text-gold" : "text-[rgb(190_84_104)]"}`}>{wasRight && <PracticeStar size={15} />}{wasRight ? t("right") : picked === -1 ? t("timeUp") : t("wrong")} <span className="text-sm font-normal text-muted">· {q.key}</span></p>
              <button onClick={next} className={`h-11 shrink-0 rounded-full px-5 text-sm font-bold ${wasRight ? "btn-gold" : "bg-ink text-bg"}`}>{i + 1 >= qs.length ? t("finish") : t("next")}</button>
            </div>
          )}
        </section>
      )}

      {phase === "result" && (
        <section className="pa-card relative mt-6 overflow-hidden p-6 pt-8 text-center">
          {score >= PASS && <PracticeCelebrate />}
          <PracticeMedallion pct={score / 100} size={140} uid="lr-m" className="pa-medal-in mx-auto" turn={score >= PASS}><span className="font-display text-[28px] leading-none tabular-nums">{score}%</span></PracticeMedallion>
          <h2 className="font-display mt-4 text-3xl">{score >= PASS ? t("passed") : t("almost")}</h2>
          <p className="mt-2 text-muted">{t("resultLine", { score, xp, pass: PASS })}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={start} className="h-11 rounded-full border border-line px-5 text-sm font-bold hover:border-[rgb(201_166_94)]">{t("again")}</button>
            {score >= PASS && nextL && <Link href={`/academy/${nextL.s}/${nextL.from}`} className="btn-gold inline-flex h-11 items-center rounded-full px-5 text-sm font-bold">{t("nextLesson")}</Link>}
            <Link href="/academy" className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-bold text-bg">{t("overview")}</Link>
          </div>
        </section>
      )}
    </main>
  );
}
