"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PRAYERS, buildPrayer, type Posture, type Tradition } from "@/lib/salah";
import { ArrowBack, ArrowNext } from "./Icons";
import { PracticeStar, PracticeWindow, starPath } from "./art/PracticeArt";

type Lang = "de" | "en" | "ar";
type Tx = { de: string; en: string; ar?: string };
const UI: Record<Lang, Record<string, string>> = {
  de: { sunni: "Sunnitisch", shia: "Schiitisch (Dscha'fari)", rakah: "Raka", of: "von", play: "Abspielen", pause: "Pause", prev: "Zurück", next: "Weiter", steps: "Alle Schritte", aloud: "laut", silent: "leise", qibla: "Qibla", meaning: "Bedeutung", restart: "Von vorn", note: "Dieser Trainer zeigt den üblichen Ablauf. Einzelheiten unterscheiden sich zwischen den Rechtsschulen – lerne das Gebet zusätzlich bei einem Lehrer deiner Schule.", learnFatiha: "Al-Fatiha Vers für Vers lernen" },
  en: { sunni: "Sunni", shia: "Shia (Ja'fari)", rakah: "Rak'ah", of: "of", play: "Play", pause: "Pause", prev: "Back", next: "Next", steps: "All steps", aloud: "aloud", silent: "silent", qibla: "Qibla", meaning: "Meaning", restart: "Start again", note: "This trainer shows the common sequence. Details differ between the schools – also learn the prayer with a teacher of your school.", learnFatiha: "Learn Al-Fatiha verse by verse" },
  ar: { sunni: "أهل السنة", shia: "الشيعة (المذهب الجعفري)", rakah: "الركعة", of: "من", play: "تشغيل", pause: "إيقاف", prev: "السابق", next: "التالي", steps: "كل الخطوات", aloud: "جهرًا", silent: "سرًّا", qibla: "القبلة", meaning: "المعنى", restart: "من البداية", note: "يعرض هذا المدرّب الترتيب المعتاد للصلاة، وتختلف بعض التفاصيل بين المذاهب، فتعلّم الصلاة أيضًا على يد معلّم من مذهبك.", learnFatiha: "تعلّم سورة الفاتحة آيةً آية" },
};

// ---------- the figure: a simple side view, drawn from joints so it can move smoothly between postures ----------
type P = [number, number];
type Pose = { head: P; neck: P; shoulder: P; hip: P; knee: P; ankle: P; toe: P; elbow: P; hand: P };
const STAND: Pose = { head: [118, 38], neck: [118, 55], shoulder: [118, 62], hip: [118, 124], knee: [119, 166], ankle: [118, 205], toe: [133, 209], elbow: [117, 94], hand: [117, 124] };
const SIT: Pose = { head: [106, 103], neck: [105, 120], shoulder: [104, 127], hip: [96, 187], knee: [148, 206], ankle: [82, 204], toe: [70, 209], elbow: [116, 158], hand: [140, 185] };
const POSES: Record<Posture, Pose> = {
  stand: STAND,
  sides: STAND,
  takbir: { ...STAND, elbow: [105, 74], hand: [113, 40] },
  folded: { ...STAND, elbow: [106, 98], hand: [126, 95] },
  qunut: { ...STAND, elbow: [111, 92], hand: [138, 72] },
  ruku: { head: [189, 125], neck: [174, 121], shoulder: [167, 122], hip: [112, 124], knee: [114, 166], ankle: [113, 205], toe: [128, 209], elbow: [148, 146], hand: [118, 163] },
  sujud: { head: [173, 197], neck: [160, 193], shoulder: [150, 187], hip: [97, 163], knee: [108, 206], ankle: [66, 203], toe: [57, 209], elbow: [150, 205], hand: [167, 207] },
  sujudTurbah: { head: [173, 194], neck: [160, 191], shoulder: [150, 185], hip: [97, 163], knee: [108, 206], ankle: [66, 203], toe: [57, 209], elbow: [150, 205], hand: [158, 207] },
  sit: SIT,
  tashahhud: SIT,
  salamR: SIT,
  salamL: SIT,
};
const KEYS = Object.keys(STAND) as (keyof Pose)[];
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const o = {} as Pose;
  for (const k of KEYS) o[k] = [a[k][0] + (b[k][0] - a[k][0]) * t, a[k][1] + (b[k][1] - a[k][1]) * t];
  return o;
}
function usePoseAnimation(target: Posture) {
  const [pose, setPose] = useState<Pose>(POSES[target]);
  const cur = useRef(pose);
  useEffect(() => {
    const from = cur.current, to = POSES[target];
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { cur.current = to; setPose(to); return; }
    const t0 = performance.now(); let raf = 0;
    const tick = (now: number) => { const t = Math.min(1, (now - t0) / 750); const p = lerpPose(from, to, ease(t)); cur.current = p; setPose(p); if (t < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return pose;
}
const line = (...pts: P[]) => pts.map((p) => p.join(",")).join(" ");

function Figure({ posture, qibla, label }: { posture: Posture; qibla: string; label: string }) {
  const p = usePoseAnimation(posture);
  return (
    <svg viewBox="0 0 240 230" className="h-full w-full" role="img" aria-label={label}>
      <defs><linearGradient id="mat" x1="0" x2="1"><stop offset="0" stopColor="rgb(214 180 108 / 0.35)" /><stop offset="1" stopColor="rgb(214 180 108 / 0.15)" /></linearGradient></defs>
      {/* prayer mat and qibla */}
      <rect x="40" y="209" width="160" height="7" rx="2" fill="url(#mat)" />
      <rect x="44" y="211" width="152" height="3" rx="1" fill="none" stroke="rgb(214 180 108 / 0.5)" strokeWidth="0.6" strokeDasharray="3 2" />
      <g transform="translate(212 178)"><rect width="18" height="20" rx="1.5" fill="#111" /><rect y="5" width="18" height="2.4" fill="rgb(214 180 108)" /><text x="9" y="32" textAnchor="middle" fontSize="8" fill="currentColor" fillOpacity=".6">{qibla}</text></g>
      <path d="M196 188 l9 0 m-3 -3 l3 3 l-3 3" stroke="rgb(214 180 108 / 0.7)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      {posture === "sujudTurbah" && <rect x="166" y="205" width="16" height="4" rx="1" fill="#8a6b45" />}
      {/* body */}
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
        <polyline points={line(p.hip, p.knee, p.ankle, p.toe)} strokeWidth="15" strokeOpacity=".92" />
        <polyline points={line(p.neck, p.hip)} strokeWidth="19" />
        <polyline points={line(p.shoulder, p.elbow, p.hand)} strokeWidth="10" stroke="rgb(214 180 108)" />
      </g>
      <circle cx={p.head[0]} cy={p.head[1]} r="13" fill="currentColor" />
      {posture === "tashahhud" && <line x1={p.hand[0]} y1={p.hand[1]} x2={p.hand[0] + 10} y2={p.hand[1] - 5} stroke="rgb(214 180 108)" strokeWidth="3" strokeLinecap="round" />}
      {(posture === "salamR" || posture === "salamL") && (
        <path d={posture === "salamR" ? `M${p.head[0] - 10} ${p.head[1] - 22} q12 -10 24 0 m-4 -5 l4 5 l-6 2` : `M${p.head[0] + 12} ${p.head[1] - 22} q-12 -10 -24 0 m4 -5 l-4 5 l6 2`} stroke="rgb(214 180 108)" strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

export default function PrayerTrainer() {
  const locale = useLocale();
  const lang: Lang = locale === "de" ? "de" : locale === "ar" ? "ar" : "en";
  const u = UI[lang];
  const tx = (v?: Tx) => (v ? v[lang] ?? v.en : "");
  const [tradition, setTradition] = useState<Tradition>("sunni");
  const [prayer, setPrayer] = useState<(typeof PRAYERS)[number]["id"]>("fajr");
  const steps = useMemo(() => buildPrayer(prayer, tradition), [prayer, tradition]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [list, setList] = useState(false);
  useEffect(() => { setI(0); setAuto(false); }, [prayer, tradition]);
  const step = steps[Math.min(i, steps.length - 1)]; // i still points past the end for one render after switching to a shorter prayer
  const rakat = PRAYERS.find((p) => p.id === prayer)!.rakat;
  useEffect(() => {
    if (!auto) return;
    if (i >= steps.length - 1) { setAuto(false); return; }
    const ms = Math.min(14000, 3500 + (step.tr?.length ?? 0) * 45);
    const id = setTimeout(() => setI((n) => n + 1), ms);
    return () => clearTimeout(id);
  }, [auto, i, steps.length, step]);

  const chip = (on: boolean) => `pa-chip pa-chip-dark ${on ? "is-on" : ""}`;

  return (
    <div className="stage girih relative overflow-hidden rounded-2xl border border-[rgb(214_180_108)]/30 text-[#eef0f3] shadow-[0_40px_80px_-50px_rgba(4,30,22,.9)]">
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-[rgb(214_180_108)]/20 p-4 sm:p-5">
        <div className="flex flex-wrap gap-2" role="tablist">
          {(["sunni", "shia"] as const).map((t) => <button key={t} role="tab" aria-selected={tradition === t} onClick={() => setTradition(t)} className={chip(tradition === t)}>{u[t]}</button>)}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRAYERS.map((p) => <button key={p.id} aria-pressed={prayer === p.id} onClick={() => setPrayer(p.id)} className={chip(prayer === p.id)}>{tx(p.name)} · {p.rakat}</button>)}
        </div>
      </div>

      <div className="relative grid gap-0 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative border-b border-[rgb(214_180_108)]/20 p-4 md:border-b-0 md:border-e">
          <div className="absolute start-4 top-4 z-[1] rounded-full border border-[rgb(214_180_108)]/45 bg-[rgb(5_28_21)]/60 px-3 py-1 text-xs font-bold text-[#f3e2b6]">{u.rakah} {Math.min(step.rakah, rakat)} {u.of} {rakat}</div>
          <div className="relative mx-auto aspect-square max-w-[360px] text-white">
            <PracticeWindow uid="salah-w" lamp className="absolute left-1/2 top-0 h-full w-auto -translate-x-1/2 opacity-45" />
            <div className="relative h-full w-full"><Figure posture={step.posture} qibla={u.qibla} label={tx(step.title)} /></div>
          </div>
          <div className="mt-3 flex justify-center gap-2" aria-hidden>{Array.from({ length: rakat }, (_, k) => (
            <svg key={k} viewBox="0 0 24 24" className="h-5 w-5"><path d={starPath(12, 12, 11, 5.2)} fill={k + 1 < step.rakah ? "#d6b46c" : k + 1 === step.rakah ? "#fff" : "rgb(255 255 255 / .14)"} stroke={k + 1 === step.rakah ? "#d6b46c" : "none"} strokeWidth="1" /></svg>
          ))}</div>
        </div>

        <div className="flex min-h-[420px] flex-col p-5 sm:p-7">
          <div key={`${prayer}-${tradition}-${i}`} className="step-in">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))] rtl:tracking-normal"><PracticeStar size={10} />{i + 1} / {steps.length}{step.aloud !== undefined && step.ar ? ` · ${step.aloud ? u.aloud : u.silent}` : ""}</p>
          <h3 className="font-display mt-2 text-3xl leading-tight">{tx(step.title)}</h3>
          {step.ar && <p className="font-arabic mt-5 border-y border-[rgb(214_180_108)]/25 py-3 text-[26px] leading-[2] text-[#fbf3dc] sm:text-[30px]" dir="rtl">{step.ar}</p>}
          {step.tr && lang !== "ar" && <p className="mt-3 text-[15px] italic leading-relaxed text-[rgb(var(--gold))]">{step.tr}</p>}
          {step.meaning && lang !== "ar" && <p className="mt-3 text-[15px] leading-relaxed text-white/80"><span className="font-semibold text-white">{u.meaning}: </span>{tx(step.meaning)}</p>}
          {step.note && <p className="mt-4 rounded-xl border border-[rgb(214_180_108)]/25 bg-white/[0.05] p-3 text-sm leading-relaxed text-white/75">{tx(step.note)}</p>}
          </div>
          <div className="mt-auto pt-6">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#c6a65e] to-[#ecd7a2] transition-all duration-500 rtl:bg-gradient-to-l" style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }} disabled={i === 0} aria-label={u.prev} title={u.prev} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/25 text-lg transition hover:border-white/60 disabled:opacity-30"><ArrowBack /></button>
              <button onClick={() => (i >= steps.length - 1 ? (setI(0), setAuto(true)) : setAuto((a) => !a))} className="btn-gold h-12 flex-1 rounded-full text-sm font-bold">{i >= steps.length - 1 ? u.restart : auto ? u.pause : u.play}</button>
              <button onClick={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }} disabled={i >= steps.length - 1} aria-label={u.next} title={u.next} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/25 text-lg transition hover:border-white/60 disabled:opacity-30"><ArrowNext /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-[rgb(214_180_108)]/20 p-4 sm:p-5">
        <button onClick={() => setList((v) => !v)} aria-expanded={list} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white"><svg viewBox="0 0 12 12" className={`h-3 w-3 transition rtl:-scale-x-100 ${list ? "rotate-90 rtl:-rotate-90" : ""}`} aria-hidden><path d="M4 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>{u.steps}</button>
        {list && (
          <ol className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {steps.map((s, k) => <li key={k}><button onClick={() => { setAuto(false); setI(k); }} className={`min-h-10 w-full rounded-lg px-2 py-1.5 text-start ${k === i ? "bg-[rgb(214_180_108)]/15 font-bold text-white" : "text-white/70 hover:bg-white/5"}`}>{k + 1}. {tx(s.title)} <span className="text-white/40">· {u.rakah} {Math.min(s.rakah, rakat)}</span></button></li>)}
          </ol>
        )}
        <p className="mt-4 text-xs leading-relaxed text-white/55">{u.note} <Link href="/surah/1?shams=1" className="font-semibold text-[rgb(var(--gold))] underline-offset-2 hover:underline">{u.learnFatiha} <ArrowNext /></Link></p>
      </div>
    </div>
  );
}
