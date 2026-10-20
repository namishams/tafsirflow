"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { accountPlan, usePremium } from "@/lib/premium";

// Buy / restore Premium. In the iOS app the purchase runs through Apple (StoreKit); on the web Premium shows as active
// when the account has it, otherwise the panel points to the app.
export default function PremiumPanel({ appStoreUrl }: { appStoreUrl: string }) {
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
  if (!app) {
    return (
      <div className="grid gap-3">
        <p className="text-[15px] text-white/75">{t("webOnly")}</p>
        {appStoreUrl && <a href={appStoreUrl} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex h-12 w-fit items-center rounded-full px-7 text-[15px] font-bold">{t("appStore")}</a>}
      </div>
    );
  }
  return (
    <div className="grid gap-3">
      <button disabled={busy} onClick={() => { setBusy(true); setMsg(""); app.buy(); }} className="btn-gold inline-flex h-14 w-full max-w-sm items-center justify-center rounded-full px-7 text-[16px] font-bold disabled:opacity-60">
        {busy ? "…" : app.price ? t("buy", { price: app.price }) : t("buyNoPrice")}
      </button>
      <p className="text-[13px] text-white/60">{t("once")}</p>
      <button disabled={busy} onClick={() => { setBusy(true); setMsg(""); app.restore(); }} className="w-fit text-sm font-semibold text-white/75 underline-offset-2 hover:underline">{t("restore")}</button>
      {msg && <p role="status" className="text-sm text-[rgb(233_207_153)]">{msg}</p>}
      <p className="max-w-md text-[12px] leading-relaxed text-white/45">{t("terms")}</p>
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
