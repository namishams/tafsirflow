"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Me } from "@/lib/sync";
import { GOALS, sortedCountries } from "@/lib/countries";
import { captchaToken } from "@/lib/captchaClient";
import CaptchaBox from "../CaptchaBox";
import CodeInput from "./CodeInput";
import { inputCls, postJSON, useCountdown, usePasskeySupport } from "./shared";
import { passkeySignIn } from "./passkeyClient";

// Sign in or create the account with a 6-digit code by e-mail (main way since 21.10.2026), a passkey, or – as a second
// option – the password (onPassword switches AccountForm to the classic form). New addresses get the short welcome
// form after the code: the account is created confirmed, because the code proved the address.
type Step = "email" | "code" | "welcome";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1.5"><span className="text-[13px] font-medium text-ink">{label}</span>{children}</label>;
}

export default function CodeSignIn({ fresh = false, bare = false, secure = true, onSignedIn, onPassword }: {
  fresh?: boolean; bare?: boolean; secure?: boolean; onSignedIn: (u: Me) => void | Promise<void>; onPassword: () => void;
}) {
  const t = useTranslations("signin");
  const ta = useTranslations("account");
  const locale = useLocale();
  const passkeys = usePasskeySupport();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [ticket, setTicket] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [help, setHelp] = useState(false);
  const [left, start] = useCountdown();
  const [challenge, setChallenge] = useState(false);
  const [captchaV2, setCaptchaV2] = useState("");
  const [tries, setTries] = useState(0);
  const [f, setF] = useState({ firstName: "", lastName: "", country: "", city: "", birthYear: "", goal: "" });
  const [terms, setTerms] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const countries = useMemo(() => sortedCountries(locale), [locale]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((o) => ({ ...o, [k]: e.target.value }));

  const requestCode = async (again = false) => {
    setBusy(true); setErr(""); setInfo("");
    try {
      const captcha = captchaV2 ? "" : await captchaToken("code");
      const r = await postJSON<{ error?: string; retryAfter?: number; resendIn?: number; challenge?: boolean }>("/api/auth/code/request", { email: email.trim(), locale, captcha, captchaV2 });
      if (captchaV2) { setCaptchaV2(""); setTries((n) => n + 1); }
      if (r.ok) {
        setChallenge(false); setStep("code"); setCode(""); start(r.data.resendIn ?? 30);
        if (again) setInfo(t("resent"));
        return;
      }
      const e = r.data.error;
      if (e === "captcha") { setChallenge(!!r.data.challenge); if (!r.data.challenge) setErr(ta("errCaptcha")); return; }
      if (e === "wait") { setStep("code"); start(r.data.retryAfter ?? 30); setErr(t("errWait", { s: r.data.retryAfter ?? 30 })); return; }
      setErr(e === "email" ? t("errEmail") : e === "rate" ? t("errRate") : e === "insecure" ? ta("errInsecure") : e === "nodb" ? ta("errNoDb") : t("errGeneric"));
    } catch { setErr(t("errGeneric")); } finally { setBusy(false); }
  };

  const verify = async (v: string) => {
    setBusy(true); setErr(""); setInfo("");
    try {
      const r = await postJSON<{ user?: Me; registrationRequired?: boolean; ticket?: string; error?: string; left?: number }>("/api/auth/code/verify", { email: email.trim(), code: v });
      if (r.ok && r.data.user) { await onSignedIn(r.data.user); return; }
      if (r.ok && r.data.registrationRequired && r.data.ticket) { setTicket(r.data.ticket); setStep("welcome"); return; }
      setCode("");
      const e = r.data.error;
      setErr(e === "code" ? t("errCode", { n: r.data.left ?? 0 }) : e === "expired" ? t("errExpired") : e === "rate" ? t("errRate") : t("errGeneric"));
    } catch { setErr(t("errGeneric")); } finally { setBusy(false); }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await postJSON<{ user?: Me; error?: string }>("/api/auth/code/register", { ticket, ...f, birthYear: Number(f.birthYear), acceptTerms: terms, marketing, locale });
      if (r.ok && r.data.user) { await onSignedIn(r.data.user); return; }
      const k = r.data.error;
      if (k === "ticket") { setStep("email"); setTicket(""); setErr(t("errTicket")); return; }
      const known: Record<string, string> = { name: "errName", country: "errCountry", terms: "errTerms", age: "errAge", rate: "errRate" };
      setErr(k && known[k] ? ta(known[k]) : t("errGeneric"));
    } catch { setErr(t("errGeneric")); } finally { setBusy(false); }
  };

  const withPasskey = async () => {
    setBusy(true); setErr(""); setInfo("");
    try {
      const r = await passkeySignIn();
      if (r.ok && r.user) { await onSignedIn(r.user); return; }
      if (!r.ok && r.error !== "cancelled") setErr(r.error === "unknown" ? t("errPasskeyUnknown") : r.error === "rate" ? t("errRate") : t("errPasskey"));
    } catch { setErr(t("errPasskey")); } finally { setBusy(false); }
  };

  if (step === "welcome")
    return (
      <form onSubmit={create} className="grid gap-5">
        <div>
          <h2 className="font-display text-[28px] font-semibold leading-tight">{t("welcomeTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("welcomeLead", { email: email.trim() })}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={ta("firstName")}><input className={inputCls} required value={f.firstName} onChange={set("firstName")} autoComplete="given-name" maxLength={60} autoFocus /></Field>
          <Field label={ta("lastName")}><input className={inputCls} required value={f.lastName} onChange={set("lastName")} autoComplete="family-name" maxLength={60} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={ta("country")}>
            <select className={inputCls} required value={f.country} onChange={set("country")} autoComplete="country">
              <option value="">{ta("countryPick")}</option>
              {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </Field>
          <Field label={`${ta("city")} (${ta("optional")})`}><input className={inputCls} value={f.city} onChange={set("city")} autoComplete="address-level2" maxLength={80} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={ta("birthYear")}>
            <select className={inputCls} required value={f.birthYear} onChange={set("birthYear")} autoComplete="bday-year">
              <option value="">{ta("birthYearPick")}</option>
              {Array.from({ length: new Date().getFullYear() - 3 - 1920 + 1 }, (_, i) => new Date().getFullYear() - 3 - i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Field>
          <Field label={`${ta("goal")} (${ta("optional")})`}>
            <select className={inputCls} value={f.goal} onChange={set("goal")}>
              <option value="">–</option>
              {GOALS.map((g) => <option key={g} value={g}>{ta(`goal${g[0].toUpperCase()}${g.slice(1)}`)}</option>)}
            </select>
          </Field>
        </div>
        <p className="-mt-2 text-xs text-muted">{ta("birthYearHint")}</p>
        <div className="grid gap-3 text-[13px] leading-snug text-muted">
          <label className="flex items-start gap-3">
            <input type="checkbox" required checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" />
            <span>{ta.rich("terms", { terms: (c) => <Link href="/legal/terms" target="_blank" className="font-semibold text-accent underline">{c}</Link>, privacy: (c) => <Link href="/legal/privacy" target="_blank" className="font-semibold text-accent underline">{c}</Link> })}</span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]" />
            <span>{ta("marketing")}</span>
          </label>
        </div>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <button disabled={busy} className="btn-gold h-12 rounded-lg text-[15px] font-bold transition disabled:opacity-50">{t("create")}</button>
      </form>
    );

  if (step === "code")
    return (
      <div className="grid gap-5">
        <div>
          <h2 className="font-display text-[28px] font-semibold leading-tight">{t("codeTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t.rich("codeLead", { email: email.trim(), b: (c) => <strong className="font-semibold text-ink" dir="ltr">{c}</strong> })}</p>
        </div>
        <CodeInput value={code} onChange={(v) => { setCode(v); if (err) setErr(""); }} onComplete={verify} disabled={busy} label={t("codeLabel")} digitLabel={(n) => t("digit", { n })} invalid={!!err} />
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        {info && !err && <p role="status" className="text-sm text-accent">{info}</p>}
        <button type="button" onClick={() => verify(code)} disabled={busy || code.length !== 6} className="btn-gold h-12 rounded-lg text-[15px] font-bold transition disabled:opacity-50">{t("confirm")}</button>
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px]">
          <button type="button" onClick={() => requestCode(true)} disabled={busy || left > 0} className="font-semibold text-accent hover:underline disabled:text-muted disabled:no-underline">{left > 0 ? t("resendIn", { s: left }) : t("resend")}</button>
          <button type="button" onClick={() => { setStep("email"); setCode(""); setErr(""); setInfo(""); }} className="font-medium text-muted hover:text-ink">{t("otherEmail")}</button>
        </div>
        <div className="border-t border-line pt-4 text-[13px]">
          <button type="button" onClick={() => setHelp((h) => !h)} aria-expanded={help} className="font-medium text-muted hover:text-ink">{t("noCode")}</button>
          {help && <p className="mt-2 leading-relaxed text-muted">{t("noCodeHelp")}</p>}
        </div>
        <CaptchaBox key={tries} challenge={challenge} onToken={setCaptchaV2} />
      </div>
    );

  return (
    <form onSubmit={(e) => { e.preventDefault(); void requestCode(); }} className="grid gap-5">
      {!bare && (
        <div>
          <h2 className="font-display text-[28px] font-semibold leading-tight">{fresh ? t("titleNew") : t("title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("lead")}</p>
        </div>
      )}
      {bare && <p className="text-sm leading-relaxed text-muted">{t("lead")}</p>}
      {!secure && <p className="rounded-lg border border-line bg-accent-soft p-3 text-sm">{ta("errInsecure")}</p>}
      <Field label={t("email")}><input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" dir="ltr" /></Field>
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <CaptchaBox key={tries} challenge={challenge} onToken={setCaptchaV2} />
      <button disabled={busy || !secure || (challenge && !captchaV2)} className="btn-gold h-12 rounded-lg text-[15px] font-bold transition disabled:opacity-50">{t("continue")}</button>
      <p className="-mt-2 text-xs leading-relaxed text-muted">{t("privacyNote")}</p>
      {passkeys && (
        <>
          <div className="flex items-center gap-3 text-xs text-muted" aria-hidden><span className="h-px flex-1 bg-line" />{t("or")}<span className="h-px flex-1 bg-line" /></div>
          <button type="button" onClick={withPasskey} disabled={busy || !secure} className="grid h-12 place-items-center rounded-lg border border-line text-[15px] font-semibold transition hover:border-ink disabled:opacity-50">
            <span>{t("passkey")}</span>
          </button>
          <p className="-mt-3 text-center text-xs text-muted">{t("passkeyHint")}</p>
        </>
      )}
      <p className="text-center text-sm">
        <button type="button" className="font-medium text-accent hover:underline" onClick={onPassword}>{t("withPassword")}</button>
      </p>
    </form>
  );
}
