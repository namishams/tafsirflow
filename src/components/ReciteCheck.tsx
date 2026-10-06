"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { align } from "@/lib/recite";

type Rec = { lang: string; continuous: boolean; interimResults: boolean; maxAlternatives: number; start: () => void; stop: () => void; abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null; onend: (() => void) | null; onerror: ((e: { error: string }) => void) | null };
const Recognition = () => (typeof window === "undefined" ? null : ((window as unknown as Record<string, unknown>).SpeechRecognition ?? (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as (new () => Rec) | null);

// Recite a verse from memory: the browser's speech recognition listens and every word is checked; or record yourself
// and compare with the reciter. Nothing is stored – the recording stays in this tab.
export default function ReciteCheck({ words, onResult, onPlayReciter, pauseOthers, dark = false }: { words: string[]; onResult?: (score: number, ok: boolean[]) => void; onPlayReciter?: () => void; pauseOthers?: () => void; dark?: boolean }) {
  const t = useTranslations("recite");
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState<{ ok: boolean[]; score: number } | null>(null);
  const [err, setErr] = useState("");
  const [recState, setRecState] = useState<"idle" | "rec" | "done">("idle");
  const [mine, setMine] = useState<string | null>(null);
  const rec = useRef<Rec | null>(null);
  const finalText = useRef("");
  const media = useRef<MediaRecorder | null>(null);
  const player = useRef<HTMLAudioElement | null>(null);
  useEffect(() => { setSupported(!!Recognition()); }, []);
  useEffect(() => () => { rec.current?.abort(); media.current?.stream.getTracks().forEach((x) => x.stop()); if (mine) URL.revokeObjectURL(mine); }, [mine]);
  useEffect(() => { setResult(null); setHeard(""); }, [words.join(" ")]); // eslint-disable-line react-hooks/exhaustive-deps

  const finish = (text: string) => {
    const r = align(words, text);
    setResult(r);
    onResult?.(r.score, r.ok);
  };
  const listen = () => {
    const R = Recognition();
    if (!R) return;
    pauseOthers?.();
    setErr(""); setResult(null); setHeard(""); finalText.current = "";
    const r = new R();
    r.lang = "ar-SA"; r.continuous = true; r.interimResults = true; r.maxAlternatives = 1;
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) finalText.current += ` ${res[0].transcript}`; else interim += ` ${res[0].transcript}`;
      }
      setHeard(`${finalText.current} ${interim}`.trim());
    };
    r.onerror = (e) => { if (e.error === "not-allowed" || e.error === "service-not-allowed") setErr(t("denied")); else if (e.error !== "no-speech" && e.error !== "aborted") setErr(t("failed")); };
    r.onend = () => { setListening(false); if (finalText.current.trim()) finish(finalText.current); };
    rec.current = r;
    r.start();
    setListening(true);
  };
  const stopListening = () => rec.current?.stop();

  const record = async () => {
    try {
      pauseOthers?.();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const m = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      m.ondataavailable = (e) => chunks.push(e.data);
      m.onstop = () => { stream.getTracks().forEach((x) => x.stop()); if (mine) URL.revokeObjectURL(mine); setMine(URL.createObjectURL(new Blob(chunks, { type: m.mimeType }))); setRecState("done"); };
      media.current = m; m.start(); setRecState("rec"); setErr("");
    } catch { setErr(t("denied")); }
  };
  const playMine = () => { if (!mine) return; pauseOthers?.(); player.current ??= new Audio(); player.current.src = mine; void player.current.play(); };

  const btn = dark ? "border-white/25 hover:border-white" : "border-line hover:border-ink";
  const muted = dark ? "text-white/60" : "text-muted";
  return (
    <div className={`rounded-xl border p-3.5 ${dark ? "border-white/10 bg-white/[0.04]" : "border-line bg-bg"}`}>
      <div className="flex flex-wrap items-center gap-2">
        {supported && (listening
          ? <button onClick={stopListening} className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-[13px] font-bold text-white"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />{t("done")}</button>
          : <button onClick={listen} className="btn-gold inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold"><Mic />{t("check")}</button>)}
        {recState === "rec"
          ? <button onClick={() => media.current?.stop()} className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-[13px] font-bold text-white"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />{t("stopRec")}</button>
          : <button onClick={record} className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold ${btn}`}><span className="h-2.5 w-2.5 rounded-full bg-red-500" />{t("record")}</button>}
        {mine && recState === "done" && <>
          <button onClick={playMine} className={`inline-flex h-10 items-center rounded-full border px-4 text-[13px] font-semibold ${btn}`}>{t("mine")}</button>
          {onPlayReciter && <button onClick={onPlayReciter} className={`inline-flex h-10 items-center rounded-full border px-4 text-[13px] font-semibold ${btn}`}>{t("reciter")}</button>}
        </>}
      </div>
      {listening && <p className={`mt-3 text-[13px] ${muted}`}>{t("listening")}</p>}
      {heard && <p className="font-arabic mt-2 text-xl leading-loose" dir="rtl">{heard}</p>}
      {result && (
        <div className="mt-3">
          <p className="font-arabic text-[22px] leading-loose" dir="rtl">
            {words.map((w, i) => <span key={i} className={`me-1.5 rounded px-0.5 ${result.ok[i] ? (dark ? "text-emerald-300" : "text-accent") : "bg-red-500/15 text-red-500"}`}>{w}</span>)}
          </p>
          <p className="mt-1 text-sm font-semibold">{t("score", { pct: Math.round(result.score * 100) })} · <span className={muted}>{result.score >= 0.95 ? t("great") : result.score >= 0.75 ? t("good") : t("again")}</span></p>
        </div>
      )}
      {err && <p role="alert" className="mt-2 text-[13px] text-red-500">{err}</p>}
      <p className={`mt-2 text-[11px] leading-snug ${muted}`}>{supported ? t("privacy") : t("unsupported")}</p>
    </div>
  );
}
const Mic = () => (<svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>);
