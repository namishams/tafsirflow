"use client";
// mirrors mobile/src/features/qbank/{Runner,ui}.tsx for the website: the verse with the highlighted word (rendered from
// the Quran data, never typed), question, options, the explanation with source, tradition and review status, the run
// through a list of questions and its results. Everything is free on the website: no allowance, no Pro.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLang } from "@/lib/learn/i18n";
import { useStored } from "@/lib/learn/store";
import { award } from "@/lib/points";
import { shuffleWith } from "@/lib/learn/exam/integrity";
import { loadVerse, type VerseData } from "@/lib/learn/srs/verse";
import { SUBJECTS, bankReady, loadBank, locOf, qLangOf, subjectMeta, type Q, type QLang } from "@/lib/learn/qbank/bank";
import { QBANK_KEY, readQbank, recordAnswer, recordSession, reportQuestion, toggleBookmark, type Hist, type Mode, type QbankStore } from "@/lib/learn/qbank/engine";
import { tagLabel } from "@/lib/learn/qbank/tags";
import { useQbankT } from "@/lib/learn/qbank/text";
import type { QStage, QSubject } from "@/lib/learn/qbank/types";
import { CareNote } from "@/components/learn/shams2/ui";
import { GoldButton, Option, OutlineButton, Pill, Spinner } from "@/components/learn/ui";
import { IconBookmark, IconClock, IconFlag } from "@/components/Icons";
import { HomeCorners } from "@/components/art/HomeOrnaments";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const pctText = (x: number | null | undefined) => (x === null || x === undefined ? "—" : `${Math.round(x * 100)} %`);
export const sessionHref = (p: Record<string, string | number | undefined>) =>
  `/exams/session?${Object.entries(p).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")}`;

/** the store of the centre (re-read on every write) */
export const useQbank = () => { useStored<Partial<QbankStore>>(QBANK_KEY, {}); return readQbank(); };
/** the question language chosen in the centre (or the page language) */
export function useQLang(): QLang {
  const { lang } = useLang();
  const s = useStored<Partial<QbankStore>>(QBANK_KEY, {});
  return qLangOf(lang, s.qlang ?? "auto");
}
/** topic names in the question language (tags stay the keys) */
export const useTagLabel = () => { const lang = useQLang(); return (tag: string) => tagLabel(tag, lang); };

/** the bank in the browser: true once the question language is loaded (the screens show a spinner until then) */
export function useBank(lang: QLang): { ready: boolean; error: boolean } {
  const [, setN] = useState(0);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    setError(false);
    loadBank(lang).then(() => { if (live) setN((n) => n + 1); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [lang]);
  return { ready: bankReady(lang), error };
}

/** shows its children once the question bank of the question language is loaded */
export function BankGate({ children }: { children: React.ReactNode }) {
  const lang = useQLang();
  const qt = useQbankT();
  const { ready, error } = useBank(lang);
  if (error) return <p className="text-[15px] text-muted">{qt("verseError")}</p>;
  if (!ready) return <Spinner label={qt("countsTitle")} />;
  return <>{children}</>;
}

/** a white tile with a gold title */
export function Panel({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <section className="hm-card relative grid gap-3 p-5">
      <HomeCorners />
      {title ? <div className="flex items-center gap-2"><h2 className="hm-k flex-1 text-[rgb(var(--hm-gold-d))]">{title}</h2>{right}</div> : null}
      {children}
    </section>
  );
}

/** a thin bar 0..1 with an optional gold mark (the pass mark) */
export function MarkBar({ value, mark, gold = false }: { value: number; mark?: number; gold?: boolean }) {
  const pct = Math.round(Math.max(0, Math.min(1, value || 0)) * 100);
  return (
    <span role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} className="relative block h-2 overflow-hidden rounded bg-line">
      <i className={cx("block h-2 rounded", gold ? "bg-[rgb(var(--hm-gold))]" : "bg-accent")} style={{ width: `${pct}%` }} />
      {mark !== undefined ? <i aria-hidden className="absolute top-0 bottom-0 w-0.5 bg-[rgb(var(--hm-gold))]" style={{ insetInlineStart: `${Math.round(mark * 100)}%` }} /> : null}
    </span>
  );
}

export function StatTile({ value, label }: { value: string; label: string }) {
  return (
    <div className="hm-card relative min-w-[90px] flex-1 p-3">
      <HomeCorners />
      <p className="font-display text-[22px] tabular-nums">{value}</p>
      <p className="mt-1 text-[12px] leading-snug text-muted">{label}</p>
    </div>
  );
}

/** the verse a question points at, rendered from the Quran data; word `word` highlighted */
export function VerseCard({ verseKey, word, reveal }: { verseKey: string; word?: number; reveal?: boolean }) {
  const qt = useQbankT();
  const { lang } = useLang();
  const [v, setV] = useState<VerseData | null>(null);
  const [error, setError] = useState(false);
  const [showTr, setShowTr] = useState(false);
  useEffect(() => {
    let live = true;
    setV(null); setError(false); setShowTr(false);
    loadVerse(verseKey, lang).then((d) => { if (live) setV(d); }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, [verseKey, lang]);
  return (
    <figure className="rounded-xl border border-[rgb(var(--hm-gold))]/50 bg-surface p-4">
      <figcaption className="text-[12px] font-semibold text-[rgb(var(--hm-gold-d))]">{qt("verseShown", { key: verseKey })}</figcaption>
      {v ? (
        <p lang="ar" dir="rtl" className="mt-2 flex flex-wrap gap-1 font-arabic text-[26px] leading-[2]">
          {v.words.map((w) => (
            <span key={w.position} className={cx("rounded px-1", word === w.position && "border border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/25")}
              aria-label={word === w.position ? `${w.text}, ${qt("highlighted")}` : undefined}>{w.text}</span>
          ))}
        </p>
      ) : error ? <p className="mt-2 text-[13.5px] text-muted">{qt("verseError")}</p> : <Spinner className="mt-2" />}
      {word && v ? <p className="mt-1 text-[12px] text-muted">{qt("highlighted")}</p> : null}
      {reveal && v?.translation ? (
        showTr ? <p className="mt-2 text-[14px] leading-relaxed text-muted">{v.translation.replace(/<[^>]+>/g, "")}</p>
          : <button type="button" onClick={() => setShowTr(true)} className="mt-2 min-h-8 text-[13px] font-semibold text-accent hover:underline">{qt("showTranslation")}</button>
      ) : null}
    </figure>
  );
}

/** subject · tier · tradition labels above a question, with bookmark and report */
export function QuestionMeta({ q, bookmarked }: { q: Q; bookmarked: boolean }) {
  const qt = useQbankT();
  const [reported, setReported] = useState(false);
  const report = () => { if (window.confirm(`${qt("reportTitle")}\n${qt("reportBody")}`)) { reportQuestion(q.id, "user"); setReported(true); } };
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill>{qt(`s_${q.s}`)}</Pill>
      <Pill tone={q.d >= 6 ? "gold" : "line"}>{`${qt("tier", { n: q.d })} · ${qt(`tier_${q.d}`)}`}</Pill>
      {(q.tr ?? []).map((x) => <Pill key={x}>{qt(`tr_${x}`)}</Pill>)}
      <span className="flex-1" />
      <button type="button" onClick={() => toggleBookmark(q.id)} aria-pressed={bookmarked} aria-label={bookmarked ? qt("bookmarked") : qt("bookmark")}
        className={cx("inline-flex h-9 w-9 items-center justify-center rounded-full", bookmarked ? "text-[rgb(var(--hm-gold))]" : "text-muted hover:text-ink")}>
        <IconBookmark filled={bookmarked} />
      </button>
      <button type="button" onClick={report} aria-label={qt("report")} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted hover:text-ink"><IconFlag /></button>
      {reported ? <p role="status" className="basis-full text-[12.5px] text-accent">{qt("reported")}</p> : null}
    </div>
  );
}

/** explanation, source and review status after an answer */
export function Explanation({ q, lang, ok, picked, correctText }: { q: Q; lang: QLang; ok: boolean | null; picked?: string; correctText: string }) {
  const qt = useQbankT();
  const rtl = lang === "ar";
  const loc = locOf(q, lang);
  return (
    <div aria-live="polite" className={cx("grid gap-2 rounded-xl border bg-surface p-4", ok ? "border-accent" : ok === false ? "border-red-600/60" : "border-line")}>
      {ok !== null ? <p className={cx("text-[15.5px] font-bold", ok ? "text-accent" : "text-red-700 dark:text-red-400")}>{ok ? qt("correct") : picked === undefined ? qt("noAnswer") : qt("wrong")}</p> : null}
      {!ok ? <p dir={rtl ? "rtl" : undefined} className={cx("font-semibold", rtl ? "font-arabic text-[17px] leading-[1.8]" : "text-[14.5px]")}>{qt("correctAnswer", { a: correctText })}</p> : null}
      <p className="hm-k text-[rgb(var(--hm-gold-d))]">{qt("explanation")}</p>
      <p dir={rtl ? "rtl" : undefined} className={rtl ? "font-arabic text-[18px] leading-[1.9]" : "text-[15px] leading-relaxed"}>{loc[2]}</p>
      <p className="text-[12.5px] leading-relaxed text-muted">{`${qt("source")}: ${q.src}`}</p>
      {q.review === "needs_review" ? <CareNote /> : <p className="text-[12px] font-semibold text-accent">{qt(`review_${q.review}`)}</p>}
    </div>
  );
}

export type Answer = { q: Q; order: number[]; picked: number | null; ok: boolean; ms: number };

type RunnerProps = {
  questions: Q[]; mode: Mode; deferred?: boolean; questionSec?: number; questionLeft?: number | null; rand?: () => number;
  onIndex?: (i: number, open: boolean) => void; onDone: (answers: Answer[]) => void; timeoutSignal?: number; mirror?: { current: Answer[] };
};

/** one run through a list of questions (feedback modes show the answer at once; timed test and mock exam at the end) */
export function Runner({ questions, mode, deferred, questionSec, questionLeft, rand, onIndex, onDone, timeoutSignal, mirror }: RunnerProps) {
  const qt = useQbankT();
  const lang = useQLang();
  const rtl = lang === "ar";
  const store = useStored<Partial<QbankStore>>(QBANK_KEY, {});
  const orders = useMemo(() => questions.map(() => shuffleWith([0, 1, 2, 3], rand ?? Math.random)), [questions]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const answers = useRef<Answer[]>([]);
  const started = useRef(0);
  const [now, setNow] = useState(0);
  useEffect(() => { started.current = Date.now(); setNow(Date.now()); }, []);
  const q = questions[i];
  const order = orders[i];
  const loc = q ? locOf(q, lang) : null;
  const correctDisplay = order ? order.indexOf(0) : 0;
  const n = questions.length;

  useEffect(() => { onIndex?.(i, !revealed); }, [i, revealed]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!questionSec || revealed) return;
    const tm = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(tm);
  }, [questionSec, revealed, i]);

  const commit = useCallback((display: number | null) => {
    if (!q || !order) return false;
    const ms = Date.now() - started.current;
    const ok = display !== null && order[display] === 0;
    answers.current = [...answers.current.filter((a) => a.q.id !== q.id), { q, order, picked: display, ok, ms }];
    if (mirror) mirror.current = answers.current;
    recordAnswer(q, ok, ms);
    return ok;
  }, [q, order, mirror]);
  const advance = useCallback(() => {
    if (i + 1 >= n) { onDone(answers.current); return; }
    setI(i + 1); setPicked(null); setRevealed(false); started.current = Date.now(); setNow(Date.now());
  }, [i, n, onDone]);

  const left = questionSec && !revealed && started.current ? Math.max(0, Math.ceil((started.current + questionSec * 1000 - now) / 1000)) : null;
  const timedOut = useRef(-1);
  useEffect(() => {
    if (left === 0 && timedOut.current !== i) { timedOut.current = i; commit(picked); advance(); }
  }, [left]); // eslint-disable-line react-hooks/exhaustive-deps
  const lastSignal = useRef(timeoutSignal ?? 0);
  useEffect(() => {
    if (timeoutSignal !== undefined && timeoutSignal !== lastSignal.current) { lastSignal.current = timeoutSignal; commit(picked); advance(); }
  }, [timeoutSignal]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!q || !loc || !order) return null;
  const pick = (d: number) => {
    if (revealed) return;
    if (deferred) { setPicked(d); return; }
    setPicked(d); setRevealed(true); commit(d);
  };
  const stateOf = (d: number): "idle" | "chosen" | "right" | "wrong" | "dim" => {
    if (!revealed) return picked === d ? "chosen" : "idle";
    if (d === correctDisplay) return "right";
    if (d === picked) return "wrong";
    return "dim";
  };
  const shownLeft = left ?? questionLeft ?? null;
  const bm = (store.bm ?? []).includes(q.id);
  const progress = (i + (revealed ? 1 : 0)) / Math.max(1, n);
  const letters = rtl ? ["أ", "ب", "ج", "د"] : ["A", "B", "C", "D"];
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="flex items-center gap-3">
          <p className="flex-1 text-[13px] font-semibold text-muted">{qt("q_of", { i: i + 1, n })}</p>
          {shownLeft !== null ? (
            <span aria-live="polite" className={cx("inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-bold tabular-nums [&>svg]:h-3.5 [&>svg]:w-3.5", shownLeft <= 10 ? "bg-red-600/10 text-red-700 dark:text-red-400" : "bg-accent-soft text-accent")}>
              <IconClock />{qt("seconds", { s: shownLeft })}
            </span>
          ) : null}
        </div>
        <MarkBar value={progress} gold />
      </div>
      <QuestionMeta q={q} bookmarked={bm} />
      {q.v ? <VerseCard key={q.id} verseKey={q.v} word={q.w} reveal={revealed} /> : null}
      <h2 dir={rtl ? "rtl" : undefined} className={rtl ? "font-arabic text-[22px] leading-[1.8]" : "text-[19px] font-bold leading-snug"}>{loc[0]}</h2>
      <div className="grid gap-2.5">
        {order.map((orig, d) => (
          <Option key={`${q.id}-${d}`} state={stateOf(d)} disabled={revealed} onClick={() => pick(d)} dir={rtl ? "rtl" : undefined}>
            <span className="me-2 font-bold text-muted">{letters[d]}.</span>
            <span className={rtl ? "font-arabic text-[18px]" : ""}>{loc[1][orig]}</span>
          </Option>
        ))}
      </div>
      {revealed ? <Explanation q={q} lang={lang} ok={picked !== null && order[picked] === 0} picked={picked === null ? undefined : loc[1][order[picked]]} correctText={loc[1][0]} /> : null}
      {revealed ? <GoldButton onClick={advance}>{i + 1 >= n ? qt("finish") : qt("next")}</GoldButton>
        : deferred ? <GoldButton disabled={picked === null} onClick={() => { commit(picked); advance(); }}>{i + 1 >= n ? qt("finish") : qt("next")}</GoldButton> : null}
      {mode !== "mock" && !revealed && q.review === "needs_review" ? <CareNote /> : null}
    </div>
  );
}

/** the end of a run: score, time, subjects, and every answer with its explanation */
export function Results({ answers, mode, passMark, onAgain, extra }: { answers: Answer[]; mode: Mode; passMark?: number; onAgain?: () => void; extra?: React.ReactNode }) {
  const qt = useQbankT();
  const lang = useQLang();
  const router = useRouter();
  const rtl = lang === "ar";
  const c = answers.filter((a) => a.ok).length, n = answers.length;
  const ms = n ? answers.reduce((x, a) => x + a.ms, 0) / n : 0;
  const bySub = SUBJECTS.map((s) => ({ s: s.id, n: answers.filter((a) => a.q.s === s.id).length, c: answers.filter((a) => a.q.s === s.id && a.ok).length })).filter((x) => x.n);
  const wrong = answers.filter((a) => !a.ok);
  return (
    <div className="grid gap-4">
      <Panel title={qt("result")}>
        <div className="flex flex-wrap gap-3">
          <StatTile value={pctText(n ? c / n : null)} label={qt("score", { c, n })} />
          <StatTile value={qt("seconds", { s: Math.round(ms / 1000) })} label={qt("avgTime", { s: Math.round(ms / 1000) })} />
        </div>
        {passMark !== undefined ? <MarkBar value={n ? c / n : 0} mark={passMark} /> : null}
        {extra}
      </Panel>
      {bySub.length > 1 ? (
        <Panel title={qt("bySubject")}>
          {bySub.map((x) => (
            <div key={x.s} className="grid gap-1.5">
              <div className="flex text-[14px]"><span className="flex-1 font-semibold">{qt(`s_${x.s}`)}</span><span className="text-muted">{qt("score", { c: x.c, n: x.n })}</span></div>
              <MarkBar value={x.c / x.n} />
            </div>
          ))}
        </Panel>
      ) : null}
      <Panel title={qt("reviewAnswers")}>
        <ol className="grid gap-2">
          {answers.map((a, k) => {
            const loc = locOf(a.q, lang);
            return (
              <li key={a.q.id} className={cx(k > 0 && "border-t border-line pt-2")}>
                <details>
                  <summary className="flex cursor-pointer list-none items-start gap-2 [&::-webkit-details-marker]:hidden">
                    <span aria-hidden className={cx("mt-0.5 font-bold", a.ok ? "text-accent" : "text-red-700 dark:text-red-400")}>{a.ok ? "✓" : "×"}</span>
                    <span dir={rtl ? "rtl" : undefined} className={cx("flex-1", rtl ? "font-arabic text-[17px] leading-[1.8]" : "text-[14.5px] leading-snug")}>{`${k + 1}. ${loc[0]}`}</span>
                  </summary>
                  <div className="mt-2 grid gap-2">
                    {a.q.v ? <VerseCard verseKey={a.q.v} word={a.q.w} reveal /> : null}
                    {!a.ok ? <p className="text-[13.5px] text-red-700 dark:text-red-400">{a.picked === null ? qt("noAnswer") : qt("yourAnswer", { a: loc[1][a.order[a.picked]] })}</p> : null}
                    <Explanation q={a.q} lang={lang} ok={null} correctText={loc[1][0]} />
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </Panel>
      <div className="flex flex-wrap gap-3">
        {wrong.length && mode !== "mock" ? <GoldButton onClick={() => router.replace(sessionHref({ mode: "drill", ids: wrong.map((a) => a.q.id).join(",") }))}>{qt("drillMistakes")}</GoldButton> : null}
        {onAgain ? <OutlineButton onClick={onAgain}>{qt("again")}</OutlineButton> : null}
        <OutlineButton onClick={() => router.replace("/exams")}>{qt("backHome")}</OutlineButton>
      </div>
    </div>
  );
}

/** stores a finished run in the history and awards the website's quiz points */
export function saveRun(mode: Mode, answers: Answer[], opts: { s?: QSubject; g?: QStage; pass?: boolean; void?: boolean; n?: number } = {}): Hist {
  const h: Hist = { at: Date.now(), mode, c: answers.filter((a) => a.ok).length, ms: answers.reduce((x, a) => x + a.ms, 0), ...opts, n: Math.max(opts.n ?? 0, answers.length) };
  recordSession(h);
  if (answers.length && !opts.void) award("quiz");
  return h;
}

export { subjectMeta };
