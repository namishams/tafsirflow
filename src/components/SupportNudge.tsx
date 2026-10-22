"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useConfig } from "@/lib/config";
import { inIosApp } from "@/lib/premium";

// One friendly note after a finished lesson, course or carousel – at most once per browser session, never in the iOS
// app shell. It invites; it never blocks anything. Voluntary project support, not a charitable donation.
const KEY = "tf:supportNudge";

export default function SupportNudge({ className = "" }: { className?: string }) {
  const t = useTranslations("promo");
  const d = useTranslations("donate");
  const cfg = useConfig();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (inIosApp() || sessionStorage.getItem(KEY) === "1") return;
      sessionStorage.setItem(KEY, "1");
      setShow(true);
    } catch { /* storage blocked: stay quiet */ }
  }, []);
  if (!show || !cfg.features.donateCta) return null;
  return (
    <aside className={`rounded-2xl border border-[rgb(201_166_94)]/40 bg-surface p-4 text-start ${className}`} aria-label={t("stripCta")}>
      <p className="text-[15px] font-bold">{t("nudgeTitle")}</p>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{t("stripText")}</p>
      <p className="mt-2 text-[11.5px] leading-relaxed text-muted">{d("legal")}</p>
      <Link href="/support" className="btn-gold mt-3 inline-flex h-10 items-center rounded-full px-5 text-sm font-bold">{t("stripCta")}</Link>
    </aside>
  );
}
