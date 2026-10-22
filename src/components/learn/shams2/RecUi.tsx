"use client";
// mirrors mobile/src/features/shams2/rec/ui.tsx: building blocks of the recitation trainer (Shams 3.0) – the bottom dock
// that keeps the main action in thumb reach (frosted glass), capsule buttons, status pills, the 1–4 rating chips,
// the coloured verse words and a small stepper.
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

/** sticky dock at the bottom of the viewport for the primary action(s) */
export function Dock({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none sticky bottom-0 z-20 -mx-4 mt-4 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2 sm:-mx-5">
      <div className="pointer-events-auto mx-auto flex max-w-xl items-center gap-2.5 rounded-[30px] border border-line bg-surface/75 p-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.14)] backdrop-blur-xl">
        {children}
      </div>
    </div>
  );
}

export function Capsule({ children, onClick, href, tone = "gold", disabled, grow = true }: { children: ReactNode; onClick?: () => void; href?: string; tone?: "gold" | "emerald" | "red" | "quiet"; disabled?: boolean; grow?: boolean }) {
  const cls = cx("inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-5 text-[15.5px] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45", grow && "flex-1",
    tone === "gold" ? "btn-gold" : tone === "emerald" ? "bg-accent text-white" : tone === "red" ? "bg-[rgb(160,58,52)] text-white" : "border border-line bg-transparent text-ink");
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type="button" onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

export function Pill({ label, tone }: { label: string; tone: "ok" | "warn" | "bad" | "info" }) {
  const c = tone === "ok" ? "bg-accent-soft text-accent" : tone === "warn" ? "bg-[rgb(var(--hm-gold))]/15 text-[rgb(var(--hm-gold-d))]" : tone === "bad" ? "bg-[rgb(160,58,52)]/10 text-[rgb(160,58,52)]" : "bg-line/40 text-muted";
  return <span className={cx("inline-flex h-6 items-center rounded-full px-2.5 text-[11.5px] font-semibold", c)}>{label}</span>;
}

/** 1–4 chips (again, hesitant, good, easy) */
export function RateChips({ value, onChange, labels }: { value: number; onChange: (v: 1 | 2 | 3 | 4) => void; labels: [string, string, string, string] }) {
  return (
    <div role="radiogroup" className="grid grid-cols-4 gap-1.5">
      {([1, 2, 3, 4] as const).map((v) => {
        const on = value === v;
        const c = v === 1 ? "border-[rgb(160,58,52)] bg-[rgb(160,58,52)]/10 text-[rgb(160,58,52)]" : v === 2 ? "border-[rgb(var(--hm-gold))] bg-[rgb(var(--hm-gold))]/15 text-[rgb(var(--hm-gold-d))]" : "border-accent bg-accent-soft text-accent";
        return (
          <button key={v} type="button" role="radio" aria-checked={on} onClick={() => onChange(v)}
            className={cx("h-9 truncate rounded-full border px-2 text-[12.5px] font-semibold", on ? c : "border-line bg-surface")}>{labels[v - 1]}</button>
        );
      })}
    </div>
  );
}

/** a verse's words: heard (ink), possibly missed (gold, underlined); click for playback */
export function MarkedWords({ words, marks, onWord, active, size = 24 }: { words: { position: number; text: string }[]; marks: Map<number, boolean>; onWord?: (position: number) => void; active?: number | null; size?: number }) {
  return (
    <p lang="ar" dir="rtl" className="flex flex-wrap gap-1">
      {words.map((w) => {
        const missed = marks.get(w.position) === false;
        const cls = cx("font-arabic rounded-md px-1.5", missed && "bg-[rgb(var(--hm-gold))]/[0.12] text-[rgb(var(--hm-gold-d))] underline decoration-[rgb(var(--hm-gold))]", active === w.position && "bg-accent-soft");
        return onWord
          ? <button key={w.position} type="button" onClick={() => onWord(w.position)} className={cls} style={{ fontSize: size, lineHeight: 1.85 }}>{w.text}</button>
          : <span key={w.position} className={cls} style={{ fontSize: size, lineHeight: 1.85 }}>{w.text}</span>;
      })}
    </p>
  );
}

export function Stepper({ label, value, min, max, onChange, format }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; format: (n: number) => string }) {
  const b = (d: number, sym: string) => (
    <button type="button" aria-label={`${label} ${sym}`} disabled={value + d < min || value + d > max} onClick={() => onChange(Math.min(max, Math.max(min, value + d)))}
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-[18px] font-bold disabled:opacity-35">{sym}</button>
  );
  return (
    <div className="grid flex-1 gap-1.5">
      <span className="text-[12px] font-semibold text-muted">{label}</span>
      <div className="flex items-center gap-2">{b(-1, "−")}<span className="flex-1 text-center text-[17px] font-bold">{format(value)}</span>{b(1, "+")}</div>
    </div>
  );
}
