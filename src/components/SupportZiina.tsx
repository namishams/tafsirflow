"use client";
import { IconLock } from "./Icons";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

const AMOUNTS = [25, 50, 100, 250];

// Ziina box on the support page: with an API key the visitor picks an amount and goes to Ziina's checkout;
// otherwise the owner's personal Ziina link with a QR code (scan on a computer, tap on a phone).
export default function SupportZiina() {
  const locale = useLocale();
  const t = useTranslations("ziina");
  const qs = useSearchParams();
  const [cfg, setCfg] = useState<{ api: boolean; link: string; qr?: string } | null>(null);
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { fetch("/api/support").then((r) => r.json()).then(setCfg).catch(() => setCfg({ api: false, link: "" })); }, []);
  const value = custom ? Number(custom) : amount;
  const pay = async () => {
    setBusy(true); setErr(false);
    try {
      const r = await fetch("/api/support", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ amount: value, locale }) });
      const d = await r.json();
      if (d.url) { window.location.href = d.url; return; }
      setErr(true);
    } catch { setErr(true); } finally { setBusy(false); }
  };
  const copy = async () => { try { await navigator.clipboard.writeText(cfg?.link ?? ""); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ } };
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-6 text-[#eef0f3] sm:p-7">
      {qs.get("thanks") && <p role="status" className="mb-6 rounded-lg bg-white/10 p-4 text-[15px] font-semibold">{t("thanks")}</p>}
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-base font-black text-[#7b2cf5]">Z</span>
        <h2 className="font-display text-2xl">{t("title")}</h2>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-white/70">{t("lead")}</p>
      {!cfg ? <div className="mt-6 h-24 animate-pulse rounded-lg bg-white/5" /> : cfg.api ? (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {AMOUNTS.map((a) => <button key={a} onClick={() => { setAmount(a); setCustom(""); }} className={`h-12 rounded-lg border text-[15px] font-bold transition ${!custom && amount === a ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/10 text-[rgb(var(--gold))]" : "border-white/15 hover:border-white/35"}`}>{a} AED</button>)}
          </div>
          <label className="mt-2.5 flex items-center gap-3 rounded-lg border border-white/15 px-4"><span className="text-sm text-white/60">{t("custom")}</span><input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 5))} className="h-12 min-w-0 flex-1 bg-transparent text-end text-[16px] font-bold outline-none" placeholder="AED" /></label>
          <button onClick={pay} disabled={busy || !value || value < 5} className="btn-gold mt-5 h-12 w-full rounded-lg text-[15px] font-bold disabled:opacity-50">{busy ? "…" : `${t("pay")} · ${value || 0} AED`}</button>
          {err && <p role="alert" className="mt-3 text-sm text-red-300">{t("err")}</p>}
        </div>
      ) : cfg.link ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgb(var(--gold))]">{t("how")}</p>
            <ol className="mt-3 grid gap-2.5 text-[14px] leading-snug text-white/75">
              {[t("step1"), t("step2"), t("step3")].map((s, i) => (
                <li key={s} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/20 text-xs font-bold text-white/80">{i + 1}</span><span className="pt-0.5">{s}</span></li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={cfg.link} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex h-12 items-center justify-center rounded-lg px-6 text-[15px] font-bold max-sm:w-full">{t("link")} →</a>
              <button onClick={copy} className="inline-flex h-12 items-center rounded-lg border border-white/20 px-4 text-sm font-semibold text-white/80 hover:border-white/40 max-sm:w-full max-sm:justify-center">{copied ? t("copied") : t("copy")}</button>
            </div>
            <p className="mt-3 text-xs text-white/45" dir="ltr">{cfg.link.replace(/^https:\/\//, "")}</p>
          </div>
          {cfg.qr && (
            <figure className="hidden text-center sm:block">
              <div className="h-36 w-36 overflow-hidden rounded-lg bg-white p-1.5 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: cfg.qr }} />
              <figcaption className="mt-2 text-xs text-white/55">{t("scan")}</figcaption>
            </figure>
          )}
        </div>
      ) : <p className="mt-6 rounded-lg bg-white/[0.06] p-4 text-sm text-white/70">{t("soon")}</p>}
      <p className="mt-5 flex items-center gap-1.5 text-xs text-white/45"><IconLock /> {t("safe")}</p>
    </section>
  );
}
