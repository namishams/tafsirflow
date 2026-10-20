"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { accountPlan, usePremium } from "@/lib/premium";

// Quran Masterclass Pro (monthly subscription in the app, App Store / Google Play). The website stays free.
// - Pro (or an earlier one-time Premium) on the account: shown as active.
// - Inside the old iOS web shell (window.QMCApp): no purchase from here any more – Pro is sold by the new app version;
//   "Restore purchases" stays for people who bought the earlier one-time Premium.
// - On the website: where Pro is available, with links to the stores.
export default function PremiumPanel({ appStoreUrl, playStoreUrl = "" }: { appStoreUrl: string; playStoreUrl?: string }) {
  const t = useTranslations("premium");
  const { premium, app } = usePremium();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => { accountPlan().then((p) => setSignedIn(p !== null)); }, []);
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ type?: string; status?: string }>).detail;
      if (!d?.status) return;
      setBusy(false);
      setMsg(d.status === "cancelled" ? "" : ["purchased", "restored", "pending", "failed", "unavailable", "none"].includes(d.status) ? t(d.status) : "");
    };
    window.addEventListener("qmc-app", on);
    return () => window.removeEventListener("qmc-app", on);
  }, [t]);

  if (premium) {
    return (
      <div className="grid gap-3">
        <p className="inline-flex items-center gap-3 rounded-full border border-[rgb(var(--gold))]/40 bg-white/[0.06] px-5 py-3 text-[15px] font-semibold text-[rgb(233_207_153)]"><Seal size={26} />{t("active")}</p>
        {msg && <p className="text-sm text-white/70">{msg}</p>}
        {app && signedIn === false && <p className="text-sm text-white/65">{t("linkHint")} <Link href="/account" className="font-semibold text-[rgb(var(--gold))] underline-offset-2 hover:underline">{t("signIn")}</Link></p>}
      </div>
    );
  }
  if (app) {
    return (
      <div className="grid gap-3">
        <p className="max-w-md text-[15px] leading-relaxed text-white/80">{t("shellUpdate")}</p>
        <button disabled={busy} onClick={() => { setBusy(true); setMsg(""); app.restore(); }} className="w-fit text-sm font-semibold text-white/75 underline-offset-2 hover:underline">{t("restore")}</button>
        {msg && <p role="status" className="text-sm text-[rgb(233_207_153)]">{msg}</p>}
      </div>
    );
  }
  const store = "inline-flex h-12 w-fit items-center rounded-full px-6 text-[15px] font-bold";
  return (
    <div className="grid gap-3">
      <p className="text-[15px] text-white/80">{t("getApp")}</p>
      <p className="text-[13px] text-white/60">{t("plan")}</p>
      {(appStoreUrl || playStoreUrl) && (
        <div className="mt-1 flex flex-wrap gap-2.5">
          {appStoreUrl && <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className={`btn-gold ${store}`}>{t("appStore")}</a>}
          {playStoreUrl && <a href={playStoreUrl} target="_blank" rel="noopener noreferrer" className={`${store} border border-white/25 text-white/90 hover:border-white/50`}>{t("playStore")}</a>}
        </div>
      )}
    </div>
  );
}

/** gilded eight-point seal used for Premium */
export function Seal({ size = 40 }: { size?: number }) {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (Math.PI / 8) * i - Math.PI / 2, r = i % 2 ? 38 : 48; return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`; });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden>
      <defs><linearGradient id="pm-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".75" stopColor="#efe2bf" /><stop offset="1" stopColor="#8f7238" /></linearGradient></defs>
      <path d={`M${pts.join("L")}Z`} fill="url(#pm-gold)" />
      <circle cx="50" cy="50" r="27" fill="#0f2d20" />
      <path d="M50 33l4.5 9.5 10.5 1.4-7.6 7.3 1.9 10.4L50 56.6l-9.3 5 1.9-10.4-7.6-7.3 10.5-1.4z" fill="url(#pm-gold)" />
    </svg>
  );
}
