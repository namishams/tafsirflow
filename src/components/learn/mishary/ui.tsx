"use client";
// mirrors mobile/src/features/mishary/ui.tsx – shared pieces of the Mishary track on the website: section titles,
// chips, the "needs review" label, error text, an async loader with reload, and the recorder (MediaRecorder with
// loudness bars from WebAudio, auto stop at maxSec, too short below minSec). A take stays in this tab until a screen
// sends or saves it.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useMt } from "@/lib/learn/mishary/texts";
import { announceAudio } from "@/components/learn/media";
import { IconPause, IconPlay } from "@/components/Icons";
import { StarGlyph } from "@/components/art/HomeOrnaments";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function Section({ title, children, right, className = "" }: { title: ReactNode; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <section className={cx("grid gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="font-display flex flex-1 items-center gap-2.5 text-[22px] leading-tight sm:text-[24px]"><StarGlyph size={13} className="shrink-0 text-[rgb(var(--hm-gold))]" />{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Muted({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-[14px] leading-relaxed text-muted", className)}>{children}</p>;
}

export function Chip({ label, on, onClick, icon, disabled, className = "" }: { label: ReactNode; on?: boolean; onClick: () => void; icon?: ReactNode; disabled?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-pressed={on ?? undefined}
      className={cx("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        on ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70", className)}>
      {icon && <span aria-hidden className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}{label}
    </button>
  );
}

/** the "needs review" label on draft content */
export function NeedsReview() {
  const mt = useMt();
  return <span className="inline-flex h-6 items-center rounded-full border border-[rgb(var(--hm-gold))]/60 bg-[rgb(var(--hm-gold))]/10 px-2.5 text-[11.5px] font-bold text-[rgb(var(--hm-gold-d))]">{mt("needsReview")}</span>;
}

export function ErrorText({ text }: { text: string }) {
  return text ? <p role="alert" className="text-[13.5px] font-semibold text-red-700 dark:text-red-400">{text}</p> : null;
}

/** loudness bars from levels in dB (-60..0) */
export function Bars({ values, className = "text-accent" }: { values: number[]; className?: string }) {
  const n = Math.max(values.length, 1);
  return (
    <svg width="100%" height={40} viewBox={`0 0 ${n * 3} 40`} preserveAspectRatio="none" aria-hidden className={className}>
      {values.map((v, i) => { const h = Math.max(2, ((Math.min(0, Math.max(-60, v)) + 60) / 60) * 40); return <rect key={i} x={i * 3} y={(40 - h) / 2} width={2} height={h} rx={1} fill="currentColor" />; })}
    </svg>
  );
}

/** async loader with reload */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | null; error: unknown; loading: boolean }>({ data: null, error: null, loading: true });
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    fn().then((data) => { if (alive.current) setState({ data, error: null, loading: false }); })
      .catch((error) => { if (alive.current) setState({ data: null, error, loading: false }); });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(reload, [reload]);
  return { ...state, reload };
}

export type Take = { url: string; blob: Blob; mime: string; durMs: number; levels: number[] };

/** the best container this browser records: MP4/AAC like the app where supported, otherwise WebM or Ogg Opus */
function pickMime(): string {
  const MR = typeof MediaRecorder === "undefined" ? null : MediaRecorder;
  if (!MR?.isTypeSupported) return "";
  return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"].find((m) => { try { return MR.isTypeSupported(m); } catch { return false; } }) ?? "";
}

/** records one take with loudness bars; stops itself at maxSec */
export function Recorder({ maxSec, minSec = 0, onTake, onStart }: { maxSec: number; minSec?: number; onTake: (t: Take | null) => void; onStart?: () => void }) {
  const mt = useMt();
  const [recording, setRecording] = useState(false);
  const [take, setTake] = useState<Take | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState("");
  const [playing, setPlaying] = useState(false);
  const media = useRef<MediaRecorder | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const meter = useRef<number | null>(null);
  const started = useRef(0);
  const lv = useRef<number[]>([]);
  const player = useRef<HTMLAudioElement | null>(null);
  const onTakeRef = useRef(onTake);
  onTakeRef.current = onTake;

  useEffect(() => () => {
    if (media.current?.state === "recording") { media.current.onstop = null; media.current.stop(); }
    media.current?.stream.getTracks().forEach((t) => t.stop());
    if (meter.current) clearInterval(meter.current);
    void ctx.current?.close().catch(() => undefined);
    player.current?.pause();
  }, []);
  useEffect(() => () => { if (take) URL.revokeObjectURL(take.url); }, [take]);

  const stop = useCallback(() => { if (media.current?.state === "recording") media.current.stop(); }, []);

  const start = async () => {
    try {
      player.current?.pause();
      if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) { setErr(mt("micDenied")); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickMime();
      const m = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      const chunks: Blob[] = [];
      m.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      m.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (meter.current) { clearInterval(meter.current); meter.current = null; }
        setRecording(false);
        const d = Date.now() - started.current;
        const type = m.mimeType || mime || "audio/webm";
        const blob = new Blob(chunks, { type });
        const tk: Take = { url: URL.createObjectURL(blob), blob, mime: type, durMs: d, levels: lv.current };
        setTake(tk);
        const okLen = d >= minSec * 1000;
        onTakeRef.current(okLen ? tk : null);
        if (!okLen) setErr(mt("tooShort"));
      };
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
            const db = Math.max(-60, Math.min(0, 20 * Math.log10(Math.sqrt(s / buf.length) || 1e-6)));
            lv.current = [...lv.current, db].slice(-900);
            setLevels(lv.current);
            const sec = (Date.now() - started.current) / 1000;
            setSecs(Math.round(sec));
            if (sec >= maxSec) stop();
          }, 100);
        } else {
          meter.current = window.setInterval(() => { const sec = (Date.now() - started.current) / 1000; setSecs(Math.round(sec)); if (sec >= maxSec) stop(); }, 250);
        }
      } catch { /* bars are optional */ }
      media.current = m;
      lv.current = [];
      setLevels([]); setErr(""); setSecs(0); setTake(null); onTakeRef.current(null); onStart?.();
      started.current = Date.now();
      m.start(250);
      setRecording(true);
    } catch { setErr(mt("micDenied")); }
  };

  const listen = () => {
    if (!take) return;
    const a = (player.current ??= new Audio());
    if (!a.paused) { a.pause(); return; }
    a.src = take.url;
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    a.onended = () => setPlaying(false);
    announceAudio();
    void a.play().catch(() => setPlaying(false));
  };

  const btn = "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold transition";
  return (
    <div className="grid gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {recording ? (
          <button type="button" onClick={stop} className={cx(btn, "border-red-700 bg-red-700 text-white")}>
            <span aria-hidden className="h-2.5 w-2.5 rounded-[2px] bg-white" />{mt("recording", { s: secs })}
          </button>
        ) : (
          <button type="button" onClick={() => void start()} className={cx(btn, "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70")}>
            <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-red-600" />{take ? mt("rerecord") : mt("record")}
          </button>
        )}
        {take && !recording && (
          <button type="button" onClick={listen} className={cx(btn, "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/70")}>
            <span aria-hidden className="text-accent [&>svg]:h-3.5 [&>svg]:w-3.5">{playing ? <IconPause /> : <IconPlay />}</span>{mt("listen")} · {Math.round(take.durMs / 1000)} s
          </button>
        )}
      </div>
      {levels.length > 0 && <Bars values={levels.slice(-300)} />}
      <ErrorText text={err} />
    </div>
  );
}

/** a line chart of weekly values (journal) */
export function LineChart({ points, min, max, unit, className = "text-accent" }: { points: { label: string; v: number }[]; min: number; max: number; unit: string; className?: string }) {
  if (!points.length) return null;
  const W = 300, H = 90, pad = 8;
  const x = (i: number) => (points.length === 1 ? W / 2 : pad + (i / (points.length - 1)) * (W - 2 * pad));
  const y = (v: number) => H - pad - ((Math.min(max, Math.max(min, v)) - min) / Math.max(1e-6, max - min)) * (H - 2 * pad);
  const last = points.at(-1)!;
  return (
    <div className="grid gap-1">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className={className}>
        <line x1={0} x2={W} y1={H - pad} y2={H - pad} stroke="rgb(var(--line))" strokeWidth={1} />
        <polyline points={points.map((p, i) => `${x(i)},${y(p.v)}`).join(" ")} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round" />
        {points.map((p, i) => <circle key={p.label} cx={x(i)} cy={y(p.v)} r={3.5} fill="currentColor" />)}
      </svg>
      <div className="flex justify-between text-[11.5px] text-muted">
        <span>{points[0].label.slice(5)}</span>
        <span className="font-semibold text-ink">{Math.round(last.v)} {unit}</span>
        <span>{last.label.slice(5)}</span>
      </div>
    </div>
  );
}
