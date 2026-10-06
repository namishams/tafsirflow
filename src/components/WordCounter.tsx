"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ALLAH, COUNTS } from "@/lib/secrets/counts";
import CountUp from "./CountUp";

// "How often does it appear?" – tap a word, see the verified count and every place (see lib/secrets/counts.ts)
export default function WordCounter({ words, times, spots, note, locale, initial = "fearNot" }: { words: { key: string; ar: string; label: string }[]; times: string; spots: string; note: string; locale: string; initial?: string }) {
  const [sel, setSel] = useState(initial);
  const w = words.find((x) => x.key === sel) ?? words[0];
  const refs = sel === "allah" ? [] : COUNTS[sel] ?? [];
  const n = sel === "allah" ? ALLAH : refs.length;
  // one chip per verse, with how often the word occurs in it
  const per = refs.reduce<Record<string, number>>((m, r) => ((m[r] = (m[r] ?? 0) + 1), m), {});
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {words.map((x) => (
          <button key={x.key} onClick={() => setSel(x.key)} aria-pressed={sel === x.key}
            className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition ${sel === x.key ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15 text-white" : "border-white/15 text-white/75 hover:border-white/40"}`}>
            <span className="font-arabic text-base leading-none" dir="rtl">{x.ar}</span><span>{x.label}</span>
          </button>
        ))}
      </div>
      <div key={sel} className="step-in mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center sm:text-start">
          <p className="font-arabic text-[44px] leading-tight text-[rgb(var(--gold))]" dir="rtl">{w.ar}</p>
          <p className="font-display mt-1 text-6xl leading-none"><CountUp to={n} locale={locale} /></p>
          <p className="mt-1 text-sm text-white/60">{times} · {w.label}</p>
        </div>
        {refs.length > 0 ? (
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">{Object.keys(per).length} {spots}</p>
            <ul className="mt-2 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pe-1">
              {Object.entries(per).map(([r, c]) => { const [s, v] = r.split(":"); return (
                <li key={r}><Link href={`/surah/${s}?v=${v}`} className="inline-flex rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[12px] tabular-nums text-white/80 hover:border-white/40">{r}{c > 1 ? ` ×${c}` : ""}</Link></li>
              ); })}
            </ul>
          </div>
        ) : <p className="text-sm text-white/60">{note}</p>}
      </div>
    </div>
  );
}
