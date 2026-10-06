"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { LETTERS, arName, forms, type Letter } from "@/lib/arabic";
import { starPath } from "./PracticeArt";

type Lang = "de" | "en" | "ar";
const T: Record<Lang, { tap: string; hear: string; joins: string; alone: string; formsLbl: string }> = {
  de: { tap: "Tippe auf einen Buchstaben", hear: "Anhören", joins: "verbindet sich nach beiden Seiten", alone: "verbindet sich nur nach rechts", formsLbl: "Anfang · Mitte · Ende" },
  en: { tap: "Tap a letter", hear: "Listen", joins: "joins on both sides", alone: "joins only to the right", formsLbl: "Start · middle · end" },
  ar: { tap: "اضغط على حرفٍ لتتعرّف عليه", hear: "استمع", joins: "يتصل بما قبله وبما بعده", alone: "يتصل بما قبله فقط", formsLbl: "أول · وسط · آخر" },
};
const langOf = (l: string): Lang => (l === "de" ? "de" : l === "ar" ? "ar" : "en");

// the device's Arabic voice (if there is one) says the letter's name – a pronunciation helper, not recitation
function useArabicVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => setVoice(window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("ar")) ?? null);
    pick(); window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);
  const say = (l: Letter) => {
    if (!voice) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(arName(l.ch).replace(/^ال/, "")); u.voice = voice; u.lang = voice.lang; u.rate = 0.7;
    window.speechSynthesis.speak(u);
  };
  return { canSpeak: !!voice, say };
}

// The 28 letters and the hamza on a ring of light (after the calligraphy of the Museum of the Future), written one
// after another from the top towards the left – the way Arabic runs. The centre shows the chosen letter, its name,
// its sound and its three joined forms; until the visitor taps, the ring walks through the alphabet by itself.
export function PracticeAlphabetRing({ className = "" }: { className?: string }) {
  const lang = langOf(useLocale());
  const t = T[lang];
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const { canSpeak, say } = useArabicVoice();
  useEffect(() => {
    if (!auto || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => (n + 1) % LETTERS.length), 2600);
    return () => clearInterval(id);
  }, [auto]);
  const l = LETTERS[i];
  const f = forms(l);
  const choose = (k: number) => { setAuto(false); setI(k); say(LETTERS[k]); };
  const N = LETTERS.length;
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[460px] ${className}`}>
      <svg viewBox="0 0 400 400" aria-hidden className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="abc-m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".72" stopColor="#efe2bf" /><stop offset="1" stopColor="#8f7238" /></linearGradient>
          <radialGradient id="abc-e" cx="40%" cy="32%" r="80%"><stop offset="0" stopColor="#135a43" /><stop offset="1" stopColor="#04241a" /></radialGradient>
          <radialGradient id="abc-l" cx="50%" cy="40%" r="55%"><stop offset="0" stopColor="#fff1cc" stopOpacity=".22" /><stop offset="1" stopColor="#fff1cc" stopOpacity="0" /></radialGradient>
        </defs>
        <circle cx="200" cy="200" r="197" fill="none" stroke="url(#abc-m)" strokeOpacity=".55" />
        <g className="pa-turn" style={{ animationDuration: "140s" }}>
          {Array.from({ length: 48 }, (_, k) => { const a = (Math.PI * 2 * k) / 48; return <path key={k} d={starPath(200 + 189 * Math.cos(a), 200 + 189 * Math.sin(a), 3.2, 1.4)} fill="#d6b46c" fillOpacity={k % 2 ? 0.35 : 0.75} />; })}
        </g>
        <circle cx="200" cy="200" r="181" fill="none" stroke="#d6b46c" strokeOpacity=".35" strokeWidth=".8" />
        <circle cx="200" cy="200" r="125" fill="none" stroke="#d6b46c" strokeOpacity=".45" strokeDasharray="1.5 5" />
        <circle cx="200" cy="200" r="117" fill="url(#abc-e)" stroke="url(#abc-m)" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="117" fill="url(#abc-l)" />
        <path d={starPath(200, 200, 110, 92, 8)} fill="none" stroke="#d6b46c" strokeOpacity=".16" />
        <path d={starPath(200, 200, 110, 92, 8, -Math.PI / 2 + Math.PI / 8)} fill="none" stroke="#d6b46c" strokeOpacity=".12" />
      </svg>
      {LETTERS.map((x, k) => {
        // start at the top and run counter-clockwise (right to left across the top), like Arabic script
        const a = -Math.PI / 2 - (Math.PI * 2 * k) / N;
        return (
          <button key={x.ch} type="button" onClick={() => choose(k)} aria-label={lang === "ar" ? arName(x.ch) : x.name} aria-pressed={k === i}
            className={`pa-ring-letter pa-letter-in font-arabic h-[9.4%] w-[9.4%] text-[clamp(17px,5.2vw,27px)] ${k === i ? "is-on" : "text-[#f3e2b6]"}`}
            style={{ left: `${(50 + 38.6 * Math.cos(a)).toFixed(3)}%`, top: `${(50 + 38.6 * Math.sin(a)).toFixed(3)}%`, animationDelay: `${300 + k * 70}ms` }}>
            <span className="-mt-[0.18em]" dir="rtl" lang="ar">{x.ch}</span>
          </button>
        );
      })}
      <div className="pointer-events-none absolute inset-[22%] grid place-items-center text-center text-[#f3e2b6]">
        <div key={l.ch} className="pa-letter-swap grid justify-items-center">
          <span className="font-arabic text-[clamp(58px,19vw,104px)] leading-[1.15] text-[#f6e7bf] drop-shadow-[0_0_24px_rgba(233,207,153,.35)]" dir="rtl" lang="ar">{l.ch}</span>
          <span className="mt-0.5 text-[clamp(13px,3.6vw,16px)] font-bold text-white">{lang === "ar" ? arName(l.ch) : `${l.name} · ${l.tr}`}</span>
          <span className="font-arabic mt-1 text-[clamp(15px,4.4vw,21px)] leading-[1.6] text-[#d6b46c]" dir="rtl" lang="ar">{f.start}  {f.middle}  {f.end}</span>
        </div>
      </div>
      <p className="absolute inset-x-0 -bottom-7 text-center text-xs text-white/55">{canSpeak ? `${t.tap} · ${t.hear}` : t.tap}</p>
    </div>
  );
}

// Reference sheet: every letter with its name, sound and its forms at the start, in the middle and at the end of a word.
// Tapping a card says the letter's name with the device's Arabic voice, where there is one.
export function PracticeLetterSheet() {
  const lang = langOf(useLocale());
  const t = T[lang];
  const [on, setOn] = useState<string | null>(null);
  const { say } = useArabicVoice();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tap = (l: Letter) => { say(l); setOn(l.ch); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOn(null), 1600); };
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {LETTERS.map((l, k) => {
        const f = forms(l);
        return (
          <li key={l.ch} className="min-w-0">
            <button type="button" onClick={() => tap(l)} className={`pa-card pa-plain pa-card-hover flex h-full w-full flex-col items-center px-3 pb-4 pt-3 text-center ${on === l.ch ? "pa-right !border-[rgb(201_166_94)]" : ""}`}>
              <span className="flex w-full items-center justify-between text-[11px] font-semibold text-muted"><span className="tabular-nums">{k + 1}</span><span>/{l.tr}/</span></span>
              <span className="font-arabic grid h-[84px] place-items-center text-[50px] leading-none text-gold" dir="rtl" lang="ar">{l.ch}</span>
              <span className="text-[15px] font-bold">{lang === "ar" ? arName(l.ch) : l.name}</span>
              <span className="font-arabic mt-1.5 rounded-full border border-[rgb(var(--gold))]/25 bg-[rgb(var(--gold))]/[0.06] px-3 text-[22px] leading-[1.7]" dir="rtl" lang="ar">{f.start}  {f.middle}  {f.end}</span>
              <span className="mt-1 text-[10.5px] text-muted">{l.connects ? t.joins : t.alone}</span>
              <span className="mt-2 text-[12.5px] leading-snug text-ink/75">{l.sound[lang] ?? l.sound.en}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
