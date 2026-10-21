"use client";
// Practice tools of the Reciter Path on the website, mirrors mobile/src/features/reciter-path/Practice.tsx:
//   VerseWords    the verse from Quran.com's word data, right to left, words markable and tappable
//   ListenRepeat  one word (from the reciter's word timings) or the whole verse, loop, 0.5× / 0.75× / 1×
//   RecordCompare record yourself (MediaRecorder) and compare A (reciter) and B (you); loudness bars from WebAudio
//   WordCheck     the browser's Arabic recognition (Web Speech API) marks the words it heard; hidden when unsupported
// Nothing is graded automatically and recordings stay in this tab.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Verse } from "@/lib/learn/quran";
import { useRpT } from "@/lib/learn/reciter-path/texts";
import { wordsOf } from "@/lib/learn/reciter-path/useVerse";
import { announceAudio, useWordCheck } from "@/components/learn/media";
import { IconPause, IconPlay, IconRepeat } from "@/components/Icons";

const SPEEDS = [0.5, 0.75, 1] as const;

/** the verse from the word data; `mark` highlights words (examples, answers), `picked` the learner's choice */
export function VerseWords({ verse, mark, picked, onWord, active, size = 26 }: {
  verse: Verse; mark?: number[]; picked?: number[]; onWord?: (pos: number) => void; active?: number | null; size?: number;
}) {
  return (
    <p lang="ar" dir="rtl" className="flex flex-wrap gap-1.5">
      {wordsOf(verse).map((w) => {
        const isMark = mark?.includes(w.position), isPick = picked?.includes(w.position);
        const cls = `font-arabic rounded-md border-[1.5px] px-1.5 transition ${isPick ? "border-accent bg-accent-soft" : isMark ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/[0.18]" : "border-transparent"} ${active === w.position ? "text-accent" : ""}`;
        const style = { fontSize: size, lineHeight: 1.9 };
        return onWord ? (
          <button key={w.position} type="button" onClick={() => onWord(w.position)} aria-pressed={!!isPick} aria-label={w.transliteration?.text ?? w.text_uthmani}
            className={`${cls} px-2 hover:border-[rgb(var(--hm-gold))]/60`} style={style}>{w.text_uthmani}</button>
        ) : <span key={w.position} className={cls} style={style}>{w.text_uthmani}</span>;
      })}
    </p>
  );
}

function Chip({ label, on, onClick, icon }: { label: string; on?: boolean; onClick: () => void; icon?: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on ?? undefined}
      className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition ${on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70"}`}>
      {icon && <span aria-hidden className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}{label}
    </button>
  );
}

/** one verse recording at a time, with the self-hosted file first and Quran.com as fallback */
function useVersePlayer() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const range = useRef<{ start: number; end: number } | null>(null);
  const loop = useRef(false);
  const onEnd = useRef<(() => void) | null>(null);
  const raf = useRef(0);
  const tick = useCallback(() => {
    const a = el.current, r = range.current;
    if (a && r && !a.paused && a.currentTime * 1000 >= r.end) {
      if (loop.current) a.currentTime = r.start / 1000; else { a.pause(); range.current = null; }
    }
    raf.current = requestAnimationFrame(tick);
  }, []);
  useEffect(() => () => { cancelAnimationFrame(raf.current); el.current?.pause(); }, []);
  const play = useCallback((url: string, fallback: string, o: { fromMs?: number; toMs?: number; rate?: number } = {}) => {
    el.current?.pause();
    const a = new Audio(url);
    el.current = a;
    a.playbackRate = o.rate ?? 1;
    range.current = o.toMs !== undefined ? { start: o.fromMs ?? 0, end: o.toMs } : null;
    let triedFallback = false;
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onended = () => { setPlaying(false); if (loop.current && !range.current) { a.currentTime = 0; void a.play(); } else onEnd.current?.(); };
    a.onerror = () => { if (!triedFallback && fallback) { triedFallback = true; a.src = fallback; a.currentTime = (o.fromMs ?? 0) / 1000; void a.play().catch(() => setPlaying(false)); } else setPlaying(false); };
    a.onloadedmetadata = () => { if (o.fromMs) a.currentTime = o.fromMs / 1000; };
    announceAudio();
    void a.play().catch(() => undefined);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  }, [tick]);
  const pause = useCallback(() => { range.current = null; el.current?.pause(); }, []);
  const setRate = useCallback((r: number) => { if (el.current) el.current.playbackRate = r; }, []);
  return { playing, play, pause, setRate, loop, onEnd };
}

/** listen and repeat: a word (from the timings) or the verse, optionally looped, at three speeds */
export function ListenRepeat({ verse, word }: { verse: Verse; word?: number }) {
  const rt = useRpT();
  const p = useVersePlayer();
  const [rate, setRate] = useState<number>(1);
  const [loop, setLoop] = useState(false);
  p.loop.current = loop;
  const seg = word ? verse.segments.find((s) => s.word === word) : undefined;
  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap gap-2">
        {p.playing ? <Chip label={rt("stop")} icon={<IconPause />} on onClick={p.pause} /> : (
          <>
            {seg && <Chip label={rt("playWord")} icon={<IconPlay />} onClick={() => p.play(verse.audioUrl, verse.remoteAudioUrl, { fromMs: seg.start, toMs: seg.end, rate })} />}
            <Chip label={rt("playVerse")} icon={<IconPlay />} onClick={() => p.play(verse.audioUrl, verse.remoteAudioUrl, { rate })} />
          </>
        )}
        <Chip label={rt("loop")} icon={<IconRepeat />} on={loop} onClick={() => setLoop(!loop)} />
      </div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={rt("speed")}>
        <span className="text-[12.5px] font-semibold text-muted">{rt("speed")}</span>
        {SPEEDS.map((s) => <Chip key={s} label={`${s}×`} on={rate === s} onClick={() => { setRate(s); p.setRate(s); }} />)}
      </div>
    </div>
  );
}

/** loudness bars (0..1) */
function Bars({ values, className }: { values: number[]; className: string }) {
  const n = Math.max(values.length, 1);
  return (
    <svg width="100%" height={44} viewBox={`0 0 ${n * 3} 44`} preserveAspectRatio="none" aria-hidden className={className}>
      {values.map((v, i) => { const h = Math.max(2, v * 44); return <rect key={i} x={i * 3} y={(44 - h) / 2} width={2} height={h} rx={1} fill="currentColor" />; })}
    </svg>
  );
}
/** the reciter's word timings as blocks (from the segments, no audio analysis) */
function Timing({ verse, totalMs }: { verse: Verse; totalMs: number }) {
  const segs = [...verse.segments].sort((a, b) => a.start - b.start);
  const end = Math.max(totalMs, segs.at(-1)?.end ?? 1);
  return (
    <svg width="100%" height={18} viewBox="0 0 1000 18" preserveAspectRatio="none" aria-hidden className="text-[rgb(var(--hm-gold))]">
      {segs.map((s) => <rect key={`${s.word}-${s.start}`} x={(s.start / end) * 1000} y={3} width={Math.max(4, ((s.end - s.start) / end) * 1000 - 3)} height={12} rx={3} fill="currentColor" />)}
    </svg>
  );
}

/** record yourself and compare with the reciter; the loudness is a visual aid only */
export function RecordCompare({ verse }: { verse: Verse }) {
  const rt = useRpT();
  const p = useVersePlayer();
  const [recording, setRecording] = useState(false);
  const [mine, setMine] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [durMs, setDurMs] = useState(0);
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState("");
  const media = useRef<MediaRecorder | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const started = useRef(0);
  const meter = useRef<number | null>(null);
  const me = useRef<HTMLAudioElement | null>(null);
  const thenMine = useRef(false);
  useEffect(() => () => {
    media.current?.stream.getTracks().forEach((t) => t.stop());
    if (meter.current) clearInterval(meter.current);
    void ctx.current?.close().catch(() => undefined);
    me.current?.pause();
  }, []);
  useEffect(() => () => { if (mine) URL.revokeObjectURL(mine); }, [mine]);
  p.onEnd.current = () => { if (thenMine.current) { thenMine.current = false; playMine(); } };

  const start = async () => {
    try {
      p.pause(); me.current?.pause();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      m.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (meter.current) { clearInterval(meter.current); meter.current = null; }
        setDurMs(Date.now() - started.current);
        setMine(URL.createObjectURL(new Blob(chunks, { type: m.mimeType || "audio/webm" })));
        setRecording(false);
      };
      // loudness for the bars: RMS of the microphone signal every 100 ms
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AC) {
          ctx.current ??= new AC();
          const an = ctx.current.createAnalyser();
          an.fftSize = 1024;
          ctx.current.createMediaStreamSource(stream).connect(an);
          const buf = new Float32Array(an.fftSize);
          meter.current = window.setInterval(() => {
            an.getFloatTimeDomainData(buf);
            let s = 0; for (const x of buf) s += x * x;
            const db = 20 * Math.log10(Math.sqrt(s / buf.length) || 1e-6);
            setLevels((l) => [...l, Math.min(1, Math.max(0, (db + 60) / 60))].slice(-400));
            setSecs(Math.round((Date.now() - started.current) / 1000));
          }, 100);
        }
      } catch { /* bars are optional */ }
      media.current = m; started.current = Date.now();
      setLevels([]); setErr(""); setSecs(0);
      m.start(); setRecording(true);
    } catch { setErr(rt("micDenied")); }
  };
  const stop = () => { if (media.current?.state === "recording") media.current.stop(); };
  function playMine() {
    if (!mine) return;
    p.pause();
    me.current ??= new Audio();
    me.current.src = mine;
    announceAudio();
    void me.current.play().catch(() => undefined);
  }
  const playReciter = (andThen = false) => { me.current?.pause(); thenMine.current = andThen; p.play(verse.audioUrl, verse.remoteAudioUrl); };

  const btn = "inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition";
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {recording ? (
          <button type="button" onClick={stop} className={`${btn} border-red-700 bg-red-700 text-white`}><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />{`${rt("stopRec")} · ${secs} s`}</button>
        ) : (
          <button type="button" onClick={() => void start()} className={`${btn} border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70`}><span className="h-2.5 w-2.5 rounded-full bg-red-600" />{rt("record")}</button>
        )}
        <button type="button" onClick={() => playReciter()} className={`${btn} border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70`}><span aria-hidden className="text-[rgb(var(--hm-gold))] [&>svg]:h-3.5 [&>svg]:w-3.5"><IconPlay /></span>{rt("reciter")}</button>
        {mine && (
          <>
            <button type="button" onClick={playMine} className={`${btn} border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70`}><span aria-hidden className="text-accent [&>svg]:h-3.5 [&>svg]:w-3.5"><IconPlay /></span>{rt("you")}</button>
            <button type="button" onClick={() => playReciter(true)} className={`${btn} border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70`}><span aria-hidden className="[&>svg]:h-3.5 [&>svg]:w-3.5"><IconRepeat /></span>{rt("ab")}</button>
          </>
        )}
      </div>
      {err && <p className="text-[13px] text-red-700 dark:text-red-400" role="alert">{err}</p>}
      {verse.segments.length > 0 && <div className="grid gap-1"><p className="text-[12px] font-semibold text-muted">{rt("reciterTiming")}</p><Timing verse={verse} totalMs={durMs} /></div>}
      {levels.length > 0 && <div className="grid gap-1"><p className="text-[12px] font-semibold text-muted">{rt("yourVoice")}</p><Bars values={levels} className="text-accent" /></div>}
      <p className="text-[12px] leading-relaxed text-muted">{rt("visualNote")}</p>
    </div>
  );
}

/** word check with the browser's Arabic recognition; it never judges tajweed */
export function WordCheck({ verse }: { verse: Verse }) {
  const rt = useRpT();
  const words = wordsOf(verse);
  const c = useWordCheck(words.map((w) => w.text_uthmani));
  const n = c.ok?.filter(Boolean).length ?? 0;
  const listening = c.state === "listening";
  return (
    <div className="grid gap-2.5">
      <p className="text-[13px] leading-relaxed text-muted">{rt("wordCheckLead")}</p>
      {!c.supported || c.state === "unsupported" || c.state === "denied" ? (
        <p className="text-[13px] font-semibold text-muted">{c.state === "denied" ? rt("micDenied") : rt("wordCheckUnavailable")}</p>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          <button type="button" onClick={() => (listening ? c.stop() : c.start())}
            className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold text-white ${listening ? "bg-red-700" : "bg-accent"}`}>
            {listening && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />}{listening ? rt("wordCheckStop") : rt("wordCheckStart")}
          </button>
          {c.ok && <span aria-live="polite" className="text-[13px] font-semibold">{rt("heard", { n, total: words.length })}</span>}
        </div>
      )}
      {c.ok && (
        <p lang="ar" dir="rtl" className="flex flex-wrap gap-1.5">
          {words.map((w, i) => <span key={w.position} className={`font-arabic rounded-md px-1.5 text-[22px] leading-[1.9] ${c.ok![i] ? "bg-accent-soft text-accent" : "bg-red-600/[0.07] text-red-700 dark:text-red-400"}`}>{w.text_uthmani}</span>)}
        </p>
      )}
    </div>
  );
}
