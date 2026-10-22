"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { inIosApp, nativeApp } from "@/lib/premium";

// Google Tag Manager / Google Analytics 4 – only when the server sets NEXT_PUBLIC_GTM_ID or NEXT_PUBLIC_GA4_ID, never
// inside the iOS app's web view, and only after the visitor accepted (Consent Mode v2, everything denied by default).
// GTM is preferred (GA4 is configured inside the container); with only a GA4 id gtag.js is loaded directly.
// Page views are sent by hand on every route change with the address WITHOUT query string or fragment, and never for
// personal areas (account, profile, messages, admin, together …). No user id, e-mail or name is ever sent.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID?.trim() || "";
const COOKIE = "qmc_consent";
const OPEN_EVENT = "qmc-consent-open";
const PRIVATE = /^\/(?:[a-z]{2}\/)?(?:account|admin|profile|messages|together|auth|login|register|verify|reset)(?:\/|$)/;

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
type Choice = "granted" | "denied";

const enabled = () => !!(GTM_ID || GA4_ID) && !inIosApp() && !nativeApp();
const readChoice = (): Choice | null => {
  const m = document.cookie.match(/(?:^|;\s*)qmc_consent=(granted|denied)/);
  return m ? (m[1] as Choice) : null;
};
const writeChoice = (c: Choice) => {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${c}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax${secure}`;
};

function gtag(...args: unknown[]) {
  const w = window as W;
  w.dataLayer = w.dataLayer || [];
  // gtag.js expects the arguments object itself
  // eslint-disable-next-line prefer-rest-params
  w.dataLayer.push(arguments);
  void args;
}

let started = false;
/** consent defaults always first; the Google scripts load only once consent is granted */
function setDefaults() {
  const w = window as W;
  if (w.gtag) return;
  w.gtag = gtag;
  gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", wait_for_update: 500 });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);
}
function load() {
  if (started) return;
  started = true;
  const w = window as W;
  const s = document.createElement("script");
  s.async = true;
  if (GTM_ID) {
    w.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  } else {
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4_ID)}`;
    gtag("js", new Date());
    gtag("config", GA4_ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  document.head.appendChild(s);
}
function pageView(path: string) {
  if (PRIVATE.test(path)) return;
  const page_location = location.origin + path; // no query string, no fragment
  if (GTM_ID) (window as W).dataLayer!.push({ event: "qmc_page_view", page_location, page_path: path, page_title: document.title });
  else gtag("event", "page_view", { page_location, page_path: path, page_title: document.title });
}

export default function Analytics() {
  const t = useTranslations("consent");
  const path = usePathname();
  const [on, setOn] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!enabled()) return;
    setDefaults();
    const c = readChoice();
    setOn(true);
    setChoice(c);
    setOpen(!c);
    if (c === "granted") { gtag("consent", "update", { analytics_storage: "granted" }); load(); }
    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  // SPA page views (the first one included); a short delay lets the new page set its title
  useEffect(() => {
    if (!on || choice !== "granted") return;
    const id = window.setTimeout(() => pageView(path), 300);
    return () => window.clearTimeout(id);
  }, [on, choice, path]);

  const decide = (c: Choice) => {
    writeChoice(c);
    setChoice(c);
    setOpen(false);
    // only analytics is ever granted; the advertising signals stay denied
    gtag("consent", "update", { analytics_storage: c, ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    if (c === "granted") load();
    else if (started) location.reload(); // withdrawn: unload the Google scripts
  };

  if (!on || !open) return null;
  return (
    <div role="dialog" aria-live="polite" aria-label={t("title")} className="fixed inset-x-0 z-[60] flex justify-center px-4 bottom-[calc(max(calc(env(safe-area-inset-bottom)-6px),12px)+80px)] lg:bottom-6">
      <div className="w-full max-w-md rounded-2xl border border-[rgb(201_166_94)]/50 bg-[#08261d] p-4 text-[13px] leading-relaxed text-white/85 shadow-2xl">
        <p><strong className="text-[rgb(201_166_94)]">{t("title")}</strong> {t("text")}{" "}<Link href="/legal/privacy#analytics" className="underline underline-offset-2 hover:text-white">{t("privacy")}</Link></p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => decide("granted")} className="h-9 flex-1 rounded-full bg-[rgb(201_166_94)] px-4 font-bold text-[#08261d] transition hover:brightness-110">{t("accept")}</button>
          <button type="button" onClick={() => decide("denied")} className="h-9 flex-1 rounded-full border border-white/30 px-4 font-semibold text-white transition hover:bg-white/10">{t("necessary")}</button>
        </div>
      </div>
    </div>
  );
}

/** footer link that opens the banner again; hidden while analytics is not configured or inside the app */
export function CookieSettingsLink({ label }: { label: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(enabled()), []);
  if (!show) return null;
  return <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className="hover:text-ink">{label}</button>;
}
