"use client";
import { useEffect, useRef } from "react";

// Six boxes for a 6-digit code: typing moves on, Backspace goes back, pasting or the browser's one-time-code autofill
// (iOS/macOS offer codes from Mail) fills all boxes at once. onComplete fires when the sixth digit is in.
// Digits always run left to right, also on Arabic, Persian and Urdu pages.
export default function CodeInput({ value, onChange, onComplete, disabled, label, digitLabel, autoFocus = true, invalid }: {
  value: string; onChange: (v: string) => void; onComplete?: (v: string) => void; disabled?: boolean;
  label: string; digitLabel: (n: number) => string; autoFocus?: boolean; invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  useEffect(() => { if (autoFocus) refs.current[Math.min(value.length, 5)]?.focus(); }, [autoFocus]); // eslint-disable-line react-hooks/exhaustive-deps
  // a cleared code (wrong code, new code) puts the cursor back into the first box
  useEffect(() => { if (!value && !disabled) refs.current[0]?.focus(); }, [value, disabled]);

  const commit = (next: string) => {
    const v = next.replace(/\D/g, "").slice(0, 6);
    onChange(v);
    if (v.length === 6) onComplete?.(v);
    return v;
  };

  const fill = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, "");
    if (!typed) return;
    // one digit replaces this box; several at once (paste, autofill) fill the boxes from here on
    const v = commit(typed.length > 1 ? (value.slice(0, i) + typed).slice(0, 6) : (value.slice(0, i) + typed + value.slice(i + 1)).slice(0, 6));
    refs.current[Math.min(typed.length > 1 ? v.length : Math.min(i + 1, v.length), 5)]?.focus();
  };

  return (
    <div role="group" aria-label={label} dir="ltr" className="flex justify-between gap-2 sm:gap-3">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={digitLabel(i + 1)}
          aria-invalid={invalid || undefined}
          maxLength={i === 0 ? 6 : 1}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw) { commit(value.slice(0, i) + value.slice(i + 1)); return; }
            fill(i, raw.length > 1 && d ? raw.replace(d, "") || raw : raw);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) { e.preventDefault(); commit(value.slice(0, i - 1)); refs.current[i - 1]?.focus(); }
            else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); refs.current[i - 1]?.focus(); }
            else if (e.key === "ArrowRight" && i < 5) { e.preventDefault(); refs.current[i + 1]?.focus(); }
          }}
          onPaste={(e) => { e.preventDefault(); fill(i, e.clipboardData.getData("text")); }}
          className={`h-14 w-full min-w-0 rounded-lg border bg-surface text-center font-display text-2xl tabular-nums text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-60 sm:h-16 sm:text-3xl ${invalid ? "border-red-500" : "border-line"}`}
        />
      ))}
    </div>
  );
}
