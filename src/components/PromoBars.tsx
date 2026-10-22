"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useConfig } from "@/lib/config";
import { readJSON, writeJSON } from "@/lib/storage";
import { inIosApp } from "@/lib/premium";

// Two quiet, dismissible strips on every page of the website:
//  - at the top: "Get the app" with the App Store link (the website stays free; this only invites)
//  - at the bottom: voluntary support of the project (not a charitable donation; legal line on /support)
// Neither shows inside the iOS app shell (that page is the app itself, and App Store rule 3.2.2 forbids asking for
// payments there). "Dismiss" hides a strip for a while (app 7 days, support 30 days).
const APP_KEY = "tf:appBarClosed";
const SUPPORT_KEY = "tf:supportBarClosed";
const QUIET = /^\/(support|legal|admin|account|signup|login|reset)(\/|$)/;

function Close({ onClick, label, dark }: { onClick: () => void; label: string; dark?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-muted hover:bg-black/5"}`}>
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
    </button>
  );
}

export default function PromoBars({ appUrl }: { appUrl: string }) {
  const t = useTranslations("promo");
  const tn = useTranslations("nav");
  const path = usePathname();
  const cfg = useConfig();
  const [app, setApp] = useState(false);
  const [support, setSupport] = useState(false);
  useEffect(() => {
    if (inIosApp()) return;
    setApp(readJSON<number>(APP_KEY, 0) < Date.now());
    // the support strip waits a little, so nobody is greeted by a request
    const id = window.setTimeout(() => setSupport(readJSON<number>(SUPPORT_KEY, 0) < Date.now()), 12000);
    return () => window.clearTimeout(id);
  }, []);
  const closeApp = () => { writeJSON(APP_KEY, Date.now() + 7 * 86400000, true); setApp(false); };
  const closeSupport = () => { writeJSON(SUPPORT_KEY, Date.now() + 30 * 86400000, true); setSupport(false); };
  const quiet = QUIET.test(path);
  return (
    <>
      {app && (
        <div role="region" aria-label={t("appCta")} className="relative z-[45] border-b border-[rgb(201_166_94)]/30 bg-[rgb(var(--stage))] text-[#eef0f3]">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
            <svg aria-hidden viewBox="0 0 384 512" className="hidden h-4 w-4 shrink-0 fill-[rgb(201_166_94)] sm:block"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
            <p className="min-w-0 flex-1 text-[13px] font-semibold leading-snug">{t("appText")}</p>
            <a href={appUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex h-8 shrink-0 items-center rounded-full px-4 text-[13px] font-bold">{t("appCta")}</a>
            <Close onClick={closeApp} label={tn("close")} dark />
          </div>
        </div>
      )}
      {support && !quiet && cfg.features.donateCta && (
        <aside aria-label={t("stripCta")} className="fixed inset-x-3 bottom-[4.75rem] z-[44] mx-auto max-w-xl rounded-2xl border border-[rgb(201_166_94)]/45 bg-surface/95 p-3 shadow-[0_16px_40px_-16px_rgba(4,30,22,.55)] backdrop-blur lg:bottom-4 lg:start-4 lg:end-auto lg:mx-0">
          <div className="flex items-start gap-3">
            <p className="min-w-0 flex-1 ps-1 pt-1 text-[13px] leading-relaxed">{t("stripText")}</p>
            <Close onClick={closeSupport} label={tn("close")} />
          </div>
          <div className="mt-2 flex justify-end">
            <Link href="/support" className="btn-gold inline-flex h-9 items-center rounded-full px-5 text-[13px] font-bold">{t("stripCta")}</Link>
          </div>
        </aside>
      )}
    </>
  );
}
