"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

const ALPHA = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
function norm(raw: string) {
  const s = raw.toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/^QMC/, "");
  return s.length === 8 && [...s].every((c) => ALPHA.includes(c)) ? `QMC-${s.slice(0, 4)}-${s.slice(4)}` : null;
}

export default function VerifyForm({ label, placeholder, button, invalid, initial = "" }: { label: string; placeholder: string; button: string; invalid: string; initial?: string }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [err, setErr] = useState(false);
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={(e) => { e.preventDefault(); const c = norm(v); if (!c) { setErr(true); return; } setErr(false); router.push(`/verify/${c}`); }}
    >
      <label className="flex-1">
        <span className="mb-1.5 block text-[13px] font-semibold text-white/70">{label}</span>
        <input
          value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} autoCapitalize="characters" autoComplete="off" spellCheck={false} dir="ltr"
          aria-invalid={err} aria-describedby={err ? "verify-err" : undefined}
          className="h-12 w-full rounded-lg border border-white/20 bg-white/[0.06] px-4 font-mono text-[17px] tracking-[0.12em] text-white placeholder:text-white/35 focus:border-[rgb(214_180_108)] focus:outline-none"
        />
      </label>
      <button type="submit" className="btn-gold h-12 rounded-full px-7 text-[15px] font-bold">{button}</button>
      {err ? <p id="verify-err" role="alert" className="text-sm text-[rgb(240_170_170)] sm:order-last sm:basis-full">{invalid}</p> : null}
    </form>
  );
}
