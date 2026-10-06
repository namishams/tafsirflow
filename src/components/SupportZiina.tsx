"use client";
import { IconLock } from "./Icons";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

const T = {
  de: { title: "Unterstützen mit Ziina", lead: "Sicher bezahlen mit Apple Pay, Google Pay oder Karte – über Ziina, die Zahlungs-App aus den Emiraten.", custom: "Eigener Betrag", pay: "Mit Ziina unterstützen", link: "Zur Ziina-Zahlungsseite", soon: "Die Unterstützung über Ziina wird gerade eingerichtet.", thanks: "Jazāk Allāhu khayran – vielen Dank für deine Unterstützung! Möge Allah es als fortlaufende gute Tat annehmen.", err: "Das hat nicht geklappt. Bitte versuche es gleich noch einmal.", safe: "Deine Kartendaten gibst du nur bei Ziina ein – sie erreichen unseren Server nie." },
  en: { title: "Support with Ziina", lead: "Pay securely with Apple Pay, Google Pay or card – through Ziina, the payment app from the Emirates.", custom: "Other amount", pay: "Support with Ziina", link: "Go to the Ziina payment page", soon: "Support via Ziina is being set up.", thanks: "Jazāk Allāhu khayran – thank you so much for your support! May Allah accept it as an ongoing good deed.", err: "That did not work. Please try again in a moment.", safe: "You enter your card details only at Ziina – they never reach our server." },
  ar: { title: "ادعمنا عبر زينة", lead: "ادفع بأمان عبر Apple Pay أو Google Pay أو البطاقة – من خلال تطبيق زينة الإماراتي للمدفوعات.", custom: "مبلغ آخر", pay: "ادعم عبر زينة", link: "الانتقال إلى صفحة الدفع في زينة", soon: "يجري الآن إعداد الدعم عبر زينة.", thanks: "جزاك الله خيرًا على دعمك! نسأل الله أن يتقبّله صدقةً جارية.", err: "لم تنجح العملية، يرجى المحاولة بعد قليل.", safe: "تُدخل بيانات بطاقتك في زينة فقط، ولا تصل إلى خوادمنا أبدًا." },
};
const AMOUNTS = [25, 50, 100, 250];

export default function SupportZiina() {
  const locale = useLocale();
  const t = T[locale === "de" ? "de" : locale === "ar" ? "ar" : "en"];
  const qs = useSearchParams();
  const [cfg, setCfg] = useState<{ api: boolean; link: string } | null>(null);
  const [amount, setAmount] = useState(50);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(false);
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
  return (
    <section className="stage overflow-hidden rounded-2xl p-6 text-[#eef0f3] sm:p-8">
      {qs.get("thanks") && <p role="status" className="mb-6 rounded-lg bg-white/10 p-4 text-[15px] font-semibold">{t.thanks}</p>}
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-lg font-black text-[#7b2cf5]">Z</span>
        <h2 className="font-display text-2xl sm:text-3xl">{t.title}</h2>
      </div>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/75">{t.lead}</p>
      {!cfg ? <div className="mt-6 h-24 animate-pulse rounded-lg bg-white/5" /> : cfg.api ? (
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {AMOUNTS.map((a) => <button key={a} onClick={() => { setAmount(a); setCustom(""); }} className={`h-14 rounded-xl border-2 text-lg font-bold transition ${!custom && amount === a ? "border-[rgb(var(--gold))] bg-[rgb(var(--gold))]/15" : "border-white/15 hover:border-white/40"}`}>{a} AED</button>)}
          </div>
          <label className="mt-3 flex items-center gap-3 rounded-xl border-2 border-white/15 px-4"><span className="text-sm text-white/60">{t.custom}</span><input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, "").slice(0, 5))} className="h-12 min-w-0 flex-1 bg-transparent text-end text-lg font-bold outline-none" placeholder="AED" /></label>
          <button onClick={pay} disabled={busy || !value || value < 5} className="btn-gold mt-5 h-14 w-full rounded-xl text-[16px] font-bold disabled:opacity-50">{busy ? "…" : `${t.pay} · ${value || 0} AED`}</button>
          {err && <p role="alert" className="mt-3 text-sm text-red-300">{t.err}</p>}
        </div>
      ) : cfg.link ? (
        <a href={cfg.link} target="_blank" rel="noopener noreferrer" className="btn-gold mt-6 inline-flex h-14 w-full items-center justify-center rounded-xl text-[16px] font-bold sm:w-auto sm:px-8">{t.link} →</a>
      ) : <p className="mt-6 rounded-lg bg-white/[0.06] p-4 text-sm text-white/70">{t.soon}</p>}
      <p className="mt-5 text-xs text-white/50"><IconLock /> {t.safe}</p>
    </section>
  );
}
