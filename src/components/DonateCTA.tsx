"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConfig } from "@/lib/config";
import { readJSON, writeJSON } from "@/lib/storage";

// A quiet invitation to support the project voluntarily: a gilded lantern that holds light, one verified hadith on charity,
// an honest sentence on costs and development. Never a pop-up; "later" hides it for 30 days.
const STORIES = ["s1", "s2", "s3", "s4", "s5"] as const;
const HIDE_KEY = "tf:donateLater";

export default function DonateCTA({ variant = "art", className = "" }: { variant?: "art" | "slim"; className?: string }) {
  const t = useTranslations("donate");
  const locale = useLocale();
  const cfg = useConfig();
  const [hidden, setHidden] = useState(true);
  const [story, setStory] = useState(0);
  useEffect(() => {
    setHidden(readJSON<number>(HIDE_KEY, 0) > Date.now());
    setStory(Math.floor(Date.now() / 86400000) % STORIES.length); // one story per day, the same everywhere
  }, []);
  if (hidden || !cfg.features.donateCta) return null;
  const later = () => { writeJSON(HIDE_KEY, Date.now() + 30 * 86400000, true); setHidden(true); };
  const d = cfg.donation;
  const pct = d && d.goal > 0 ? Math.max(0, Math.min(1, d.raised / d.goal)) : null;
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: 0 }).format(n);
  const s = STORIES[story];

  if (variant === "slim") {
    return (
      <aside className={`relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl border border-[rgb(201_166_94)]/35 bg-surface p-4 sm:p-5 ${className}`} aria-label={t("aria")}>
        <Lantern pct={pct} size={52} />
        <p className="min-w-0 flex-1 text-[14px] leading-relaxed"><b>{t("slimTitle")}</b> <span className="text-muted">{t("slimLead")}</span></p>
        <Link href="/support" className="btn-gold inline-flex h-10 items-center rounded-full px-5 text-sm font-bold">{t("cta")}</Link>
        <button onClick={later} className="text-xs text-muted underline-offset-2 hover:underline">{t("later")}</button>
      </aside>
    );
  }
  return (
    <aside className={`stage relative overflow-hidden rounded-3xl text-[#eef0f3] ${className}`} aria-label={t("aria")}>
      <span aria-hidden className="illum-frame" />
      <div className="relative grid items-center gap-8 px-6 py-10 sm:px-10 md:grid-cols-[auto_1fr]">
        <div className="mx-auto grid place-items-center">
          <Lantern pct={pct} size={150} />
          {d && pct !== null && (
            <p className="mt-3 text-center text-xs text-white/60">{t("meter", { raised: nf(d.raised), goal: nf(d.goal), cur: d.currency })}{d.label ? <span className="block">{d.label}</span> : null}</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("kicker")}</p>
          <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-white/75">{t("lead")}</p>
          <figure className="mt-6 max-w-2xl border-s-0 border-t border-white/10 pt-4">
            <blockquote className="text-[16px] italic leading-relaxed text-[rgb(233_207_153)]">{t(`${s}`)}</blockquote>
            <figcaption className="mt-1 text-xs text-white/50">{t(`${s}Src`)}</figcaption>
          </figure>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/support" className="btn-gold inline-flex h-12 items-center rounded-full px-7 text-[15px] font-bold">{t("cta")}</Link>
            <button onClick={later} className="h-12 rounded-full px-4 text-sm text-white/60 hover:text-white">{t("later")}</button>
          </div>
          <p className="mt-4 text-xs text-white/45">{t("free")}</p>
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
