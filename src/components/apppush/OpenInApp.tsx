"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { inIosApp } from "@/lib/premium";
import { AppQr } from "./AppQr";

// "Open in the app" on content pages (surah, lesson, profile, carousel). Phones: the app's own scheme
// (quranmasterclass://, same path as the website), and the App Store if the app did not take over within a moment.
// Desktop: a small panel with a QR code of this page's link and the App Store link.
// Owner 22.10.2026: never on iOS Safari. iOS shows its own banner there (Universal Links "OPEN" once the app is installed,
// later the Smart App Banner once APP_STORE_ID is set), so a second button would be a duplicate. Profile pages have no
// strip at all: they carry the small OpenInAppPill inside the header actions row.
const PAGES = /^\/(surah|courses|carousels|abrahamic\/lesson|haramain\/lesson|nahj-studies\/lesson|arabic\/(lang|read))(\/|$)/;
const SITE = "https://quranmasterclass.com";

const isIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));

/** opens the current page in the app via its scheme, falling back to the App Store link */
function openViaScheme(path: string, search: string, appUrl: string) {
  const t0 = Date.now();
  const back = setTimeout(() => { if (document.visibilityState === "visible" && Date.now() - t0 < 2500) window.location.href = appUrl; }, 1400);
  const stop = () => { if (document.visibilityState === "hidden") clearTimeout(back); };
  document.addEventListener("visibilitychange", stop, { once: true });
  window.location.href = `quranmasterclass:/${path}${search}`;
}

/** small secondary pill for a profile header's actions row; only on non-iOS phones (Android), never in the iOS app */
export function OpenInAppPill({ appUrl, label }: { appUrl: string; label: string }) {
  const path = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(!inIosApp() && !isIos() && /Android/i.test(navigator.userAgent)); }, []);
  if (!show) return null;
  return (
    <button type="button" onClick={() => openViaScheme(path, window.location.search, appUrl)} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-[rgb(var(--gold))]/60 px-3.5 text-[13px] font-semibold text-gold hover:bg-[rgb(var(--gold))]/10">
      <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
      {label}
    </button>
  );
}

export default function OpenInApp({ appUrl }: { appUrl: string }) {
  const t = useTranslations("promo");
  const path = usePathname();
  const locale = useLocale();
  const [ok, setOk] = useState(false);
  const [phone, setPhone] = useState(false);
  const [panel, setPanel] = useState(false);
  useEffect(() => {
    setOk(!inIosApp() && !isIos());
    setPhone(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform)));
  }, []);
  useEffect(() => { setPanel(false); }, [path]);
  if (!ok || !PAGES.test(path)) return null;
  const search = typeof window !== "undefined" ? window.location.search : "";
  const web = `${SITE}/${locale}${path}${search}`;
  const go = () => {
    if (!phone) { setPanel((v) => !v); return; }
    openViaScheme(path, search, appUrl);
  };
  return (
    <div className="relative mx-auto flex max-w-6xl justify-end px-5 pt-2">
      <button type="button" onClick={go} aria-expanded={phone ? undefined : panel} className="inline-flex h-8 items-center gap-2 rounded-full border border-[rgb(var(--gold))]/60 bg-[rgb(var(--stage))] px-4 text-[12.5px] font-bold text-[rgb(var(--gold))] transition hover:brightness-125">
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>
        {t("oaOpen")}
      </button>
      {panel && (
        <div role="dialog" aria-label={t("oaOpen")} className="stage girih absolute end-5 top-12 z-30 w-60 rounded-2xl border border-[rgb(var(--gold))]/40 p-4 text-center text-[#eef0f3] shadow-xl">
          <div className="flex justify-center"><AppQr url={web} size={128} alt={t("aoQrAlt")} /></div>
          <p className="mt-2 text-[12.5px] text-white/75">{t("oaScan")}</p>
          <a href={appUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[13px] font-semibold text-[rgb(var(--gold))] underline-offset-4 hover:underline">{t("appStore")}</a>
        </div>
      )}
    </div>
  );
}
