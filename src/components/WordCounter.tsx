"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ALLAH, COUNTS } from "@/lib/secrets/counts";
import CountUp from "./CountUp";
import { IslamStarMark, starPath } from "./art/IslamArt";

// "How often does it appear?" – tap a word, see the verified count inside a slowly turning gilded rosette and every place
// as a gold chip that opens the verse (see lib/secrets/counts.ts)
export default function WordCounter({ words, times, spots, note, locale, initial = "fearNot" }: { words: { key: string; ar: string; label: string }[]; times: string; spots: string; note: string; locale: string; initial?: string }) {
  const [sel, setSel] = useState(initial);
  const w = words.find((x) => x.key === sel) ?? words[0];
  const refs = sel === "allah" ? [] : COUNTS[sel] ?? [];
  const n = sel === "allah" ? ALLAH : refs.length;
  // one chip per verse, with how often the word occurs in it
  const per = refs.reduce<Record<string, number>>((m, r) => ((m[r] = (m[r] ?? 0) + 1), m), {});
  const rays = Array.from({ length: 32 }, (_, i) => { const a = (Math.PI * 2 * i) / 32, r1 = 84, r2 = i % 2 ? 92 : 98; return `M${(100 + r1 * Math.cos(a)).toFixed(1)} ${(100 + r1 * Math.sin(a)).toFixed(1)}L${(100 + r2 * Math.cos(a)).toFixed(1)} ${(100 + r2 * Math.sin(a)).toFixed(1)}`; }).join("");
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {words.map((x) => (
          <button key={x.key} onClick={() => setSel(x.key)} aria-pressed={sel === x.key}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${sel === x.key ? "border-[rgb(233_207_153)] bg-[rgb(233_207_153)]/15 text-white shadow-[0_0_0_3px_rgb(233_207_153/0.08)]" : "border-white/15 text-white/75 hover:border-[rgb(233_207_153)]/50 hover:text-white"}`}>
            <span className="font-arabic text-base leading-none" dir="rtl">{x.ar}</span><span>{x.label}</span>
          </button>
        ))}
      </div>
      <div key={sel} className="step-in mt-8 grid gap-8 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto grid h-[220px] w-[220px] shrink-0 place-items-center text-center">
          <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 h-full w-full text-[rgb(233_207_153)]">
            <circle cx="100" cy="100" r="100" fill="url(#wc-glow)" />
            <defs><radialGradient id="wc-glow"><stop offset="0" stopColor="rgb(233 207 153)" stopOpacity=".18" /><stop offset="1" stopColor="rgb(233 207 153)" stopOpacity="0" /></radialGradient></defs>
            <g className="isl-rosette-turn">
              <path d={rays} stroke="currentColor" strokeOpacity=".55" strokeWidth="1" />
              <path d={starPath(100, 100, 82, 70, 16)} fill="none" stroke="currentColor" strokeOpacity=".5" />
            </g>
            <circle cx="100" cy="100" r="64" fill="rgb(5 28 21)" fillOpacity=".7" stroke="currentColor" strokeOpacity=".7" />
            <circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" strokeOpacity=".3" strokeDasharray="1.5 4" />
          </svg>
          <div className="relative">
            <p className="font-arabic text-[22px] leading-tight text-[rgb(233_207_153)]" dir="rtl">{w.ar}</p>
            <p className="font-display mt-0.5 text-[44px] leading-none text-white"><CountUp to={n} locale={locale} /></p>
            <p className="mt-1 text-[11px] text-white/60">{times}</p>
          </div>
        </div>
        {refs.length > 0 ? (
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white/85">{w.label}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(233_207_153)]/80 rtl:tracking-normal">{Object.keys(per).length} {spots}</p>
            <ul className="mt-3 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pe-1">
              {Object.entries(per).map(([r, c]) => { const [s, v] = r.split(":"); return (
                <li key={r}><Link href={`/surah/${s}?v=${v}`} className="isl-ref !m-0"><IslamStarMark />{r}{c > 1 ? ` ×${c}` : ""}</Link></li>
              ); })}
            </ul>
          </div>
        ) : <p className="text-sm text-white/65">{note}</p>}
      </div>
    </div>
  );
}
