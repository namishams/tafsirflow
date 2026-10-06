"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchMe, startSync, stopSync, type Me } from "@/lib/sync";

const ERR: Record<string, string> = { invalid: "errInvalid", exists: "errExists", weak: "errWeak", email: "errEmail", rate: "errRate", insecure: "errInsecure", nodb: "errNoDb", token: "errToken" };
type Mode = "login" | "register" | "forgot";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-[13px] font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
export const inputCls = "h-12 w-full rounded-lg border border-line bg-surface px-3.5 text-[15px] text-ink outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/15";

export function PasswordInput(props: { value: string; onChange: (v: string) => void; autoComplete: string; label: string; show: string; hide: string }) {
  const [shown, setShown] = useState(false);
  return (
    <Field label={props.label}>
      <span className="relative block">
        <input className={`${inputCls} pe-16`} type={shown ? "text" : "password"} required minLength={8} value={props.value} onChange={(e) => props.onChange(e.target.value)} autoComplete={props.autoComplete} />
        <button type="button" onClick={() => setShown((s) => !s)} className="absolute inset-y-0 end-3 text-[13px] font-medium text-muted hover:text-ink">{shown ? props.hide : props.show}</button>
      </span>
    </Field>
  );
}

export default function AccountForm() {
  const t = useTranslations("account");
  const locale = useLocale();
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [secure, setSecure] = useState(true);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchMe().then((r) => { setMe(r.user); setSecure(r.secure); setReady(true); });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setInfo("");
    try {
      const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, name, city, locale }) });
      const data = await r.json();
      if (!r.ok) { setErr(t(ERR[data.error] ?? "errGeneric")); return; }
      if (mode === "forgot") { setInfo(t("forgotSent")); return; }
      setMe(data.user);
      setPassword("");
      if (await startSync()) window.dispatchEvent(new Event("tf-synced"));
    } catch {
      setErr(t("errGeneric"));
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    stopSync();
    setMe(null);
  };

  const go = (m: Mode) => { setMode(m); setErr(""); setInfo(""); };
  if (!ready) return <div className="h-64" />;

  if (me)
    return (
      <div>
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">{t("title")}</p>
        <h2 className="mt-2 font-display text-2xl font-semibold">{me.name || me.email}</h2>
        <p className="mt-1 text-sm text-muted">{t("signedInAs", { email: me.email })}</p>
        <p className="mt-5 border-t border-line pt-5 text-sm leading-relaxed text-muted">{t("syncOn")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/quran" className="inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-white">{t("home")}</Link>
          {me.role === "admin" && <Link href="/admin" className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-semibold hover:border-ink">Admin</Link>}
          <button onClick={logout} className="inline-flex h-11 items-center rounded-lg border border-line px-5 text-sm font-semibold hover:border-ink">{t("signOut")}</button>
        </div>
      </div>
    );

  const title = mode === "login" ? t("loginTitle") : mode === "register" ? t("registerTitle") : t("forgotTitle");
  return (
    <form onSubmit={submit} className="grid gap-5">
      <div>
        <h2 className="font-display text-[28px] font-semibold leading-tight">{title}</h2>
        {mode === "forgot" ? <p className="mt-2 text-sm leading-relaxed text-muted">{t("forgotHint")}</p> : <p className="mt-2 text-sm text-muted">{t("guestHint")}</p>}
      </div>
      {!secure && <p className="rounded-lg border border-line bg-accent-soft p-3 text-sm">{t("errInsecure")}</p>}
      {mode === "register" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("name")}><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Field>
          <Field label={t("city")}><input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" /></Field>
        </div>
      )}
      <Field label={t("email")}><input className={inputCls} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" /></Field>
      {mode !== "forgot" && (
        <div className="grid gap-2">
          <PasswordInput label={t("password")} value={password} onChange={setPassword} autoComplete={mode === "login" ? "current-password" : "new-password"} show={t("showP")} hide={t("hideP")} />
          {mode === "login" && <button type="button" onClick={() => go("forgot")} className="justify-self-end text-[13px] font-medium text-accent hover:underline">{t("forgot")}</button>}
        </div>
      )}
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      {info && <p role="status" className="rounded-lg bg-accent-soft p-3 text-sm">{info}</p>}
      <button disabled={busy || (!secure && mode !== "forgot")} className="h-12 rounded-lg bg-accent text-[15px] font-semibold text-white transition hover:brightness-110 disabled:opacity-50">
        {mode === "login" ? t("signIn") : mode === "register" ? t("register") : t("sendReset")}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "forgot" ? (
          <button type="button" className="font-medium text-accent hover:underline" onClick={() => go("login")}>{t("backToLogin")}</button>
        ) : (
          <button type="button" className="font-medium text-accent hover:underline" onClick={() => go(mode === "login" ? "register" : "login")}>{mode === "login" ? t("noAccount") : t("haveAccount")}</button>
        )}
      </p>
    </form>
  );
}
