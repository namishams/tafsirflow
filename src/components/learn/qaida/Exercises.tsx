"use client";
// The exercise cards of the reading course, web port of mobile/src/features/qaida/Exercises.tsx: learn, choose, match,
// build (tap or drag the tiles into the row), read aloud (Web Speech API, scored with align() from the recite check)
// and the speed drill. Arabic is always right to left. Quran words play their Quran.com word recording; letters and
// syllables use the device's Arabic voice and are hidden without one.
import { useEffect, useMemo, useRef, useState } from "react";
import { useArabicVoice, useClip, useWordCheck } from "@/components/learn/media";
import { IconSpeaker } from "@/components/Icons";
import type { Ex } from "@/lib/learn/qaida/lesson";
import { saveSpeed, useQaida } from "@/lib/learn/qaida/progress";
import { useQT } from "@/lib/learn/qaida/texts";
import { qwordAudio, type QWord } from "@/lib/learn/qaida/words";
import { useQW } from "./strings";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const RED_TEXT = "text-red-700 dark:text-red-400";

/** Arabic in the Quran face, sized in px (line height 1.8 like the app) */
export function ArText({ children, size = 40, className = "" }: { children: string; size?: number; className?: string }) {
  return <span lang="ar" dir="rtl" className={cx("font-arabic block text-center", className)} style={{ fontSize: size, lineHeight: 1.8 }}>{children}</span>;
}

/** play a Quran word recording, or let the device voice say a letter / syllable */
export function useSay() {
  const clip = useClip();
  const { canSpeak, speak } = useArabicVoice();
  return { canSpeak, clip, say: (o: { speak?: string; word?: QWord }) => (o.word ? clip.play(qwordAudio(o.word)) : o.speak ? speak(o.speak) : undefined) };
}

export function ListenButton({ onPress, label, big = false, busy = false }: { onPress: () => void; label: string; big?: boolean; busy?: boolean }) {
  return (
    <button type="button" onClick={onPress} aria-label={label}
      className={cx("mx-auto flex items-center justify-center gap-2 rounded-full bg-accent font-bold text-white transition hover:opacity-90", big ? "h-16 w-16" : "h-11 px-5 text-sm")}>
      {busy ? <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <IconSpeaker className={big ? "h-7 w-7" : "h-4 w-4"} />}
      {big ? null : <span>{label}</span>}
    </button>
  );
}

const heading = "font-display text-center text-[21px] leading-snug sm:text-2xl";

export function LearnCard({ ex }: { ex: Extract<Ex, { t: "learn" }> }) {
  const qt = useQT();
  const { say, canSpeak, clip } = useSay();
  const can = !!ex.word || (canSpeak && !!ex.speak);
  return (
    <div className="flex flex-col gap-4">
      <p className="hm-k text-center text-[rgb(var(--hm-gold-d))]">{qt("learn")}</p>
      <div className="hm-card relative px-3 py-5">
        <ArText size={ex.big.length > 14 ? 30 : ex.big.length > 6 ? 44 : 72}>{ex.big}</ArText>
      </div>
      {ex.title ? <h2 className={heading}>{ex.title}</h2> : null}
      {ex.body ? <p className="whitespace-pre-line text-center text-[15.5px] leading-relaxed text-muted">{ex.body}</p> : null}
      {ex.word && ex.word.ar !== ex.big ? (
        <div className="text-center">
          <p className="text-[13px] text-muted">{qt("asIn")}</p>
          <ArText size={30}>{ex.word.ar}</ArText>
        </div>
      ) : null}
      {can ? <ListenButton label={qt("listen")} onPress={() => say(ex)} busy={clip.state === "loading"} /> : null}
    </div>
  );
}

export function ChooseCard({ ex, picked, checked, onPick }: { ex: Extract<Ex, { t: "choose" }>; picked: number | null; checked: boolean; onPick: (i: number) => void }) {
  const qt = useQT();
  const { say, clip } = useSay();
  const audio = !!ex.word || !!ex.speak;
  useEffect(() => { if (audio && !ex.big) say(ex); }, [ex]); // eslint-disable-line react-hooks/exhaustive-deps
  const wide = ex.options.some((o) => o.text) || ex.options.some((o) => (o.ar?.length ?? 0) > 4);
  return (
    <div className="flex flex-col gap-4">
      <h2 className={heading}>{ex.q}</h2>
      {ex.big ? <ArText size={ex.big.length > 3 ? 52 : 78}>{ex.big}</ArText> : null}
      {audio ? <ListenButton big={!ex.big} label={qt("listen")} onPress={() => say(ex)} busy={clip.state === "loading"} /> : null}
      <div className={cx("grid gap-2.5", wide ? "grid-cols-1" : "grid-cols-2")}>
        {ex.options.map((o, i) => {
          const right = checked && i === ex.answer, wrong = checked && picked === i && i !== ex.answer, sel = !checked && picked === i;
          return (
            <button key={i} type="button" disabled={checked} onClick={() => onPick(i)} aria-pressed={picked === i} aria-label={o.text ?? o.ar}
              className={cx("hm-opt flex items-center justify-center rounded-lg border-[1.5px] bg-surface px-3 transition", wide ? "min-h-14" : "min-h-[92px]",
                right ? "pa-right border-accent bg-accent-soft" : wrong ? "pa-shake border-red-600/60 bg-red-600/[0.06]" : sel ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/10" : "border-line hover:border-[rgb(var(--hm-gold))]/70",
                checked && "cursor-default")}>
              {o.ar ? <ArText size={wide ? 30 : 44}>{o.ar}</ArText> : <span className="text-center text-base font-semibold">{o.text}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** tap one on each side; a wrong pair counts as a mistake */
export function MatchCard({ ex, onDone }: { ex: Extract<Ex, { t: "match" }>; onDone: (mistakes: number) => void }) {
  const right = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5), [ex]);
  const [a, setA] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [bad, setBad] = useState<number | null>(null);
  const mistakes = useRef(0);
  const pick = (j: number) => {
    if (a === null) return;
    const ok = ex.pairs[a].b === right[j].b;
    if (ok) {
      const d = new Set(done); d.add(a); setDone(d); setA(null);
      if (d.size === ex.pairs.length) setTimeout(() => onDone(mistakes.current), 300);
    } else { mistakes.current++; setBad(j); setTimeout(() => setBad(null), 500); }
  };
  const box = (on: boolean, ok: boolean, wrong: boolean) => cx("flex min-h-16 w-full items-center justify-center rounded-lg border-[1.5px] px-2 transition",
    ok ? "border-accent bg-accent-soft opacity-55" : wrong ? "pa-shake border-red-600/60 bg-surface" : on ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/10" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70");
  return (
    <div className="flex flex-col gap-4">
      <h2 className={heading}>{ex.q}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2.5">
          {ex.pairs.map((p, i) => (
            <button key={i} type="button" disabled={done.has(i)} onClick={() => setA(i)} aria-pressed={a === i} aria-label={p.a} className={box(a === i, done.has(i), false)}>
              <ArText size={34}>{p.a}</ArText>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {right.map((p, j) => {
            const ok = [...done].some((i) => ex.pairs[i].b === p.b);
            return (
              <button key={j} type="button" disabled={ok || a === null} onClick={() => pick(j)} aria-label={p.b} className={cx(box(false, ok, bad === j), a === null && !ok && "cursor-default")}>
                {p.bAr ? <ArText size={34}>{p.b}</ArText> : <span className="text-center text-[15px] font-semibold">{p.b}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BuildCard({ ex, checked, onChange }: { ex: Extract<Ex, { t: "build" }>; checked: boolean; onChange: (order: number[]) => void }) {
  const qt = useQT();
  const qw = useQW();
  const { say } = useSay();
  const bank = useMemo(() => ex.tiles.map((x, i) => ({ x, i })).sort(() => Math.random() - 0.5), [ex]);
  const [order, setOrder] = useState<number[]>([]);
  const [over, setOver] = useState(false);
  const set = (o: number[]) => { setOrder(o); onChange(o); };
  const place = (i: number) => { if (!checked && !order.includes(i)) set([...order, i]); };
  const ok = checked && order.map((i) => ex.tiles[i]).join("|") === ex.tiles.join("|");
  return (
    <div className="flex flex-col gap-4">
      <h2 className={heading}>{ex.q}</h2>
      <p className="text-center text-sm leading-relaxed text-muted">{ex.hint}</p>
      {ex.word ? <ListenButton label={qt("listen")} onPress={() => say(ex)} /> : null}
      <div
        onDragOver={(e) => { if (!checked) { e.preventDefault(); setOver(true); } }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); const i = Number(e.dataTransfer.getData("text/plain")); if (Number.isInteger(i)) place(i); }}
        aria-label={qw("dropHere")}
        className={cx("flex min-h-24 flex-col items-center justify-center rounded-lg border-[1.5px] p-2",
          order.length ? "border-solid" : "border-dashed",
          checked ? (ok ? "border-accent bg-accent-soft" : "border-red-600/60 bg-surface") : over ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/10" : "border-line bg-surface")}>
        {order.length ? <ArText size={ex.joiner ? 28 : 44}>{order.map((i) => ex.tiles[i]).join(ex.joiner)}</ArText> : <span className="text-sm text-muted">{qt("emptyRow")}</span>}
        {order.length && !checked ? (
          <div dir="rtl" className="mt-1.5 flex flex-wrap justify-center gap-1.5">
            {order.map((i, k) => (
              <button key={k} type="button" onClick={() => set(order.filter((_, j) => j !== k))} aria-label={ex.tiles[i]} className="rounded-md bg-accent-soft px-2 hover:opacity-80">
                <span lang="ar" className="font-arabic text-lg leading-[1.8]">{ex.tiles[i]}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {checked && !ok ? <ArText size={ex.joiner ? 26 : 40} className="text-accent">{ex.tiles.join(ex.joiner)}</ArText> : null}
      <div dir="rtl" className="flex flex-wrap justify-center gap-2.5">
        {bank.map(({ x, i }) => {
          const used = checked || order.includes(i);
          return (
            <button key={i} type="button" disabled={used} draggable={!used} onDragStart={(e) => { e.dataTransfer.setData("text/plain", String(i)); e.dataTransfer.effectAllowed = "move"; }}
              onClick={() => place(i)} aria-label={x}
              className={cx("flex h-[60px] min-w-[54px] cursor-grab items-center justify-center rounded-md border-[1.5px] border-[rgb(var(--hm-gold))] bg-surface px-2.5 transition active:cursor-grabbing", used && "cursor-default opacity-25")}>
              <span lang="ar" className="font-arabic text-[30px] leading-[1.8]">{x}</span>
            </button>
          );
        })}
      </div>
      {order.length && !checked ? <button type="button" onClick={() => set([])} className="mx-auto p-2 text-sm font-semibold text-accent hover:underline">{qt("reset")}</button> : null}
    </div>
  );
}

/** read aloud: speech recognition in the browser, scored with align() from the recite check (no tajweed judgement) */
export function ReadCard({ words, onResult, highlight }: { words: QWord[]; onResult: (score: number | null) => void; highlight?: boolean }) {
  const qt = useQT();
  const { say } = useSay();
  const check = useWordCheck(words.map((w) => w.ar));
  const report = useRef(onResult); report.current = onResult;
  const unavailable = !check.supported || check.state === "unsupported" || check.state === "denied" || check.state === "failed";
  useEffect(() => { if (check.ok) report.current(check.score); }, [check.ok, check.score]);
  useEffect(() => { if (check.state === "unsupported" || check.state === "denied" || check.state === "failed") report.current(null); }, [check.state]);
  const n = check.ok?.filter(Boolean).length ?? 0;
  const listening = check.state === "listening";
  return (
    <div className="flex flex-col gap-3.5">
      {!highlight ? <h2 className={heading}>{qt("read")}</h2> : null}
      <div dir="rtl" className="flex flex-wrap justify-center gap-1.5">
        {words.map((w, i) => (
          <button key={w.ref} type="button" onClick={() => say({ word: w })} aria-label={w.tr || w.ar}
            className={cx("rounded-md px-1.5 transition hover:bg-[rgb(var(--hm-gold))]/10", check.ok && (check.ok[i] ? "bg-accent-soft text-accent" : `bg-red-600/[0.06] ${RED_TEXT}`))}>
            <span lang="ar" className="font-arabic" style={{ fontSize: words.length > 4 ? 28 : 38, lineHeight: 1.8 }}>{w.ar}</span>
          </button>
        ))}
      </div>
      <p className="text-center text-[13px] leading-relaxed text-muted">{unavailable ? qt("unavailable") : qt("readLead")}</p>
      {!unavailable ? (
        <button type="button" onClick={() => (listening ? check.stop() : check.start())}
          className={cx("mx-auto flex h-12 items-center gap-2 rounded-full px-5 text-sm font-bold text-white transition", listening ? "bg-red-700" : "bg-accent")}>
          {listening ? <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <IconSpeaker className="h-4 w-4" />}
          {listening ? qt("stopCheck") : qt("startCheck")}
        </button>
      ) : null}
      <p aria-live="polite" className="text-center text-sm font-semibold">{check.ok ? qt("heard", { n, total: words.length }) : ""}</p>
    </div>
  );
}

/** read a row against the clock; the best time is kept per lesson */
export function SpeedCard({ ex, onDone }: { ex: Extract<Ex, { t: "speed" }>; onDone: (inTime: boolean) => void }) {
  const qt = useQT();
  const p = useQaida();
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  useEffect(() => {
    if (start === null || result !== null) return;
    const id = setInterval(() => setNow(Date.now() - start), 100);
    return () => clearInterval(id);
  }, [start, result]);
  const s = (ms: number) => (ms / 1000).toFixed(1);
  const best = p.speed[ex.lessonId];
  const finish = () => { const ms = Date.now() - (start ?? Date.now()); setResult(ms); saveSpeed(ex.lessonId, ms); onDone(ms <= ex.targetMs); };
  return (
    <div className="flex flex-col gap-3.5">
      <h2 className={heading}>{qt("speed")}</h2>
      <p className="text-center text-sm leading-relaxed text-muted">{qt("speedLead")}</p>
      <p className="text-center text-[13px] font-semibold text-[rgb(var(--hm-gold-d))]">{qt("target", { s: s(ex.targetMs) })}{best ? ` · ${qt("best", { s: s(best) })}` : ""}</p>
      <div className={cx("hm-card relative p-3 transition", start === null && "opacity-35")} aria-hidden={start === null || undefined}>
        <div dir="rtl" className="flex flex-wrap justify-center gap-x-3.5">
          {ex.items.map((x, i) => <span key={i} lang="ar" className="font-arabic" style={{ fontSize: ex.items.some((y) => y.length > 4) ? 28 : 36, lineHeight: 1.8 }}>{x}</span>)}
        </div>
      </div>
      <p aria-live="polite" className={cx("font-display text-center text-[34px] tabular-nums", result === null ? "" : result <= ex.targetMs ? "text-accent" : RED_TEXT)}>{qt("seconds", { s: s(result ?? now) })}</p>
      {result !== null ? <p className="text-center text-sm font-semibold text-muted">{result <= ex.targetMs ? qt("fast") : qt("slow")}</p> : (
        <button type="button" onClick={() => (start === null ? (setStart(Date.now()), setNow(0)) : finish())}
          className={cx("mx-auto h-[50px] rounded-full px-7 text-[15px] font-bold transition", start === null ? "bg-accent text-white" : "btn-gold")}>
          {start === null ? qt("go") : qt("stop")}
        </button>
      )}
    </div>
  );
}
