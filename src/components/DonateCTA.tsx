"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConfig } from "@/lib/config";
import { readJSON, writeJSON } from "@/lib/storage";
import { inIosApp } from "@/lib/premium";

// A quiet invitation to support the project voluntarily: a gilded lantern, one honest sentence on what the money pays
// for, and the legal line (voluntary support payment to ICSL FZE, not a donation). Never a pop-up; "later" hides it for
// 30 days; the admin can switch it off (features.donateCta). Not shown inside the iOS app shell (App Store rule 3.2.2).
const HIDE_KEY = "tf:donateLater";

export default function DonateCTA({ variant = "art", className = "" }: { variant?: "art" | "slim"; className?: string }) {
  const t = useTranslations("donate");
  const locale = useLocale();
  const cfg = useConfig();
  const [hidden, setHidden] = useState(true);
  useEffect(() => { setHidden(readJSON<number>(HIDE_KEY, 0) > Date.now() || inIosApp()); }, []);
  if (hidden || !cfg.features.donateCta) return null;
  const later = () => { writeJSON(HIDE_KEY, Date.now() + 30 * 86400000, true); setHidden(true); };
  const d = cfg.donation;
  const pct = d && d.goal > 0 ? Math.max(0, Math.min(1, d.raised / d.goal)) : null;
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: 0 }).format(n);

  if (variant === "slim") {
    return (
      <aside className={`relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-[rgb(201_166_94)]/35 bg-surface p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5 ${className}`} aria-label={t("aria")}>
        <span className="hidden shrink-0 sm:block"><Lantern pct={pct} size={52} /></span>
        <p className="w-full min-w-0 text-[14px] leading-relaxed sm:flex-1"><b>{t("slimTitle")}</b> <span className="text-muted">{t("slimLead")}</span><span className="mt-1 block text-[11.5px] text-muted">{t("legal")}</span></p>
        <div className="flex w-full flex-col gap-1 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center sm:gap-3">
          <Link href="/support" className="btn-gold inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-full px-5 text-sm font-bold sm:h-10 sm:w-auto">{t("cta")}</Link>
          <button onClick={later} className="h-10 w-full text-xs text-muted underline-offset-2 hover:underline sm:w-auto">{t("later")}</button>
        </div>
      </aside>
    );
  }
  return (
    <aside className={`stage relative overflow-hidden rounded-3xl text-[#eef0f3] ${className}`} aria-label={t("aria")}>
      <span aria-hidden className="illum-frame" />
      <div className="relative grid items-center gap-6 px-5 py-8 sm:gap-8 sm:px-10 sm:py-10 md:grid-cols-[auto_1fr]">
        <div className="mx-auto grid place-items-center">
          <span className="block w-[72px] sm:w-[150px] [&>svg]:h-auto [&>svg]:w-full"><Lantern pct={pct} size={150} /></span>
          {d && pct !== null && (
            <p className="mt-3 text-center text-xs text-white/60">{t("meter", { raised: nf(d.raised), goal: nf(d.goal), cur: d.currency })}{d.label ? <span className="block">{d.label}</span> : null}</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("kicker")}</p>
          <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/75">{t("lead")}</p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <Link href="/support" className="btn-gold inline-flex h-12 w-full items-center justify-center rounded-full px-7 sm:w-auto text-[15px] font-bold">{t("cta")}</Link>
            <button onClick={later} className="h-12 rounded-full px-4 text-sm text-white/60 hover:text-white">{t("later")}</button>
          </div>
          <p className="mt-4 text-xs text-white/55">{t("free")}</p>
          <p className="mt-1 text-xs text-white/45">{t("legal")}</p>
        </div>
      </div>
    </aside>
  );
}

// A gilded Arabic lantern (fanous); its light rises with the month's support when the owner shows a goal
export function Lantern({ pct, size = 120 }: { pct: number | null; size?: number }) {
  const fill = pct === null ? 0.62 : Math.max(0.08, pct);
  const top = 46 + (1 - fill) * 70; // light level inside the body (46 = top of glass, 116 = bottom)
  return (
    <svg viewBox="0 0 100 160" width={size} height={size * 1.6} aria-hidden className="lantern overflow-visible">
      <defs>
        <linearGradient id="lt-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".75" stopColor="#efe2bf" /><stop offset="1" stopColor="#8f7238" /></linearGradient>
        <radialGradient id="lt-light" cx="50%" cy="60%" r="60%"><stop offset="0" stopColor="#fff4d1" /><stop offset=".55" stopColor="#f0c86a" stopOpacity=".85" /><stop offset="1" stopColor="#c9a65e" stopOpacity=".15" /></radialGradient>
        <clipPath id="lt-glass"><path d="M30 46h40l6 70H24z" /></clipPath>
      </defs>
      <circle cx="50" cy="84" r="58" fill="url(#lt-light)" opacity=".18" className="lantern-halo" />
      <g fill="none" stroke="url(#lt-gold)" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M50 2v8" /><circle cx="50" cy="13" r="3.2" />
        <path d="M36 30c2-10 26-10 28 0" /><path d="M32 30h36l-2 8H34z" />
        <path d="M34 38l-4 8h40l-4-8" />
      </g>
      <g clipPath="url(#lt-glass)">
        <rect x="20" y="46" width="60" height="72" fill="#0a2a1f" opacity=".55" />
        <rect className="lantern-light" x="20" y={top} width="60" height={120 - top} fill="url(#lt-light)" />
      </g>
      <g fill="none" stroke="url(#lt-gold)" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M30 46h40l6 70H24z" />
        <path d="M50 46v70M37 46l-4 70M63 46l4 70" strokeWidth=".9" opacity=".8" />
        <path d="M33 70a17 17 0 0 1 34 0M31 96a19 19 0 0 1 38 0" strokeWidth=".9" opacity=".8" />
        <path d="M50 60l3 6 6 3-6 3-3 6-3-6-6-3 6-3z" strokeWidth="1" />
        <path d="M22 116h56l-4 10H26z" /><path d="M30 126l4 8h32l4-8" /><path d="M44 134v6h12v-6" />
      </g>
    </svg>
  );
}
