"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useConfig } from "@/lib/config";
import { inIosApp } from "@/lib/premium";

// A calm, inline invitation to voluntary project support (never a modal, never blocks anything). Shown after a passed
// lesson/carousel and on the account dashboard. Wording: voluntary support of the project – no donation, sadaqa,
// charity or reward promise (UAE). Rules: not in the iOS app shell, not on messages/checkout pages, at most once per
// browser session and once per SHOW_EVERY_DAYS; "Not now" is remembered for DISMISS_DAYS.
const SEEN = "tf:supportNudge:seen";
const GONE = "tf:supportNudge:dismissed";
const SHOW_EVERY_DAYS = 7;
const DISMISS_DAYS = 30;
const SESSION = "tf:supportNudge";
const BLOCKED = /\/(messages|inbox|chat|checkout|premium|pay|support)(\/|$)/;
const days = (n: number) => n * 86_400_000;

function allowed(): boolean {
  try {
    if (inIosApp() || sessionStorage.getItem(SESSION) === "1") return false;
    const now = Date.now();
    const gone = Number(localStorage.getItem(GONE) || 0);
    const seen = Number(localStorage.getItem(SEEN) || 0);
    if (now - gone < days(DISMISS_DAYS) || now - seen < days(SHOW_EVERY_DAYS)) return false;
    return true;
  } catch { return false; /* storage blocked: stay quiet */ }
}

function Calm() {
  // sprouting seedling over an open book, soft gold and green – decorative only
  return (
    <svg viewBox="0 0 96 96" width="72" height="72" aria-hidden className="shrink-0">
      <circle cx="48" cy="48" r="44" fill="rgb(201 166 94 / .14)" />
      <path d="M20 66c10-5 20-5 28 0 8-5 18-5 28 0v8c-10-5-20-5-28 0-8-5-18-5-28 0z" fill="rgb(201 166 94 / .85)" />
      <path d="M48 66V42" stroke="rgb(46 125 90)" strokeWidth="3" strokeLinecap="round" />
      <path d="M48 50c-10 0-15-6-15-14 9 0 15 5 15 14z" fill="rgb(46 125 90)" />
      <path d="M48 44c8 0 13-5 13-12-8 0-13 5-13 12z" fill="rgb(70 160 115)" />
    </svg>
  );
}

export default function SupportNudge({ className = "", variant = "inline" }: { className?: string; variant?: "inline" | "dashboard" }) {
  const t = useTranslations("promo");
  const d = useTranslations("donate");
  const n = useTranslations("nav");
  const sup = useTranslations("supporters");
  const cfg = useConfig();
  const path = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (BLOCKED.test(path || "") && variant !== "dashboard") return;
    if (!allowed()) return;
    try { sessionStorage.setItem(SESSION, "1"); localStorage.setItem(SEEN, String(Date.now())); } catch { return; }
    setShow(true);
  }, [path, variant]);
  if (!show || !cfg.features.donateCta) return null;
  const dismiss = () => { try { localStorage.setItem(GONE, String(Date.now())); } catch { /* ignore */ } setShow(false); };
  return (
    <aside className={`rounded-2xl border border-[rgb(201_166_94)]/40 bg-surface p-4 text-start sm:p-5 ${className}`} aria-label={t("supportCardTitle")}>
      <div className="flex items-start gap-4">
        <Calm />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold">{variant === "dashboard" ? t("supportCardTitle") : t("nudgeTitle")}</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">{t("stripText")}</p>
          <p className="mt-2 text-[13px] font-semibold leading-relaxed">{sup("joinInvite")}</p>
          <p className="mt-2 text-[11.5px] leading-relaxed text-muted">{d("legal")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/support" className="btn-gold inline-flex h-10 items-center rounded-full px-5 text-sm font-bold">{t("stripCta")}</Link>
            <Link href="/supporters" className="inline-flex h-10 items-center text-[13px] font-semibold text-accent hover:underline">{n("fSupportList")}</Link>
            <button type="button" onClick={dismiss} className="inline-flex h-10 items-center text-[13px] font-semibold text-muted hover:text-ink">{t("supportDismiss")}</button>
          </div>
        </div>
      </div>
    </aside>
  );
}
