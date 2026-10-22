"use client";
import "@/styles/segmented.css";
import type { ReactNode } from "react";

export type SegOption<T extends string> = { id: T; label: ReactNode; icon?: ReactNode; title?: string; disabled?: boolean };

/**
 * THE segmented control of the website (first used on the surah list: "Surahs | Juz", "All | Meccan | Medinan").
 * Cream track with a thin gold hairline, active segment a dark-green pill with soft shadow.
 * `tabs` renders role=tablist/tab (aria-selected) instead of a button group (aria-pressed).
 * `scroll` keeps it in one row and lets it scroll sideways with snap and faded edges (never wraps).
 * `full` stretches it over the full width with equal segments.
 */
export default function Segmented<T extends string>({ value, options, onChange, label, className = "", tabs = false, scroll = false, full = false, size = "md" }: {
  value: T; options: SegOption<T>[]; onChange: (v: T) => void; label: string; className?: string; tabs?: boolean; scroll?: boolean; full?: boolean; size?: "sm" | "md";
}) {
  const cls = ["q-seg", scroll && "q-seg-scroll", full && "q-seg-full", size === "sm" && "q-seg-sm", className].filter(Boolean).join(" ");
  return (
    <div role={tabs ? "tablist" : "group"} aria-label={label} className={cls}>
      {options.map((o) => {
        const on = value === o.id;
        return (
          <button key={o.id} type="button" title={o.title} disabled={o.disabled}
            {...(tabs ? { role: "tab", "aria-selected": on, tabIndex: on ? 0 : -1 } : { "aria-pressed": on })}
            data-on={on ? "" : undefined}
            onClick={() => onChange(o.id)}
            onKeyDown={tabs ? (e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
              const step = (e.key === "ArrowRight") !== rtl ? 1 : -1;
              const list = options.filter((x) => !x.disabled), i = list.findIndex((x) => x.id === o.id);
              const next = list[(i + step + list.length) % list.length];
              if (next) { onChange(next.id); const btns = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button"); btns?.[options.indexOf(next)]?.focus(); }
            } : undefined}>
            {o.icon}{o.label}
          </button>
        );
      })}
    </div>
  );
}
