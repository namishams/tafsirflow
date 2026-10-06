"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { fetchMe, startSync, stopSync, type Me } from "@/lib/sync";

const ERR: Record<string, string> = { invalid: "errInvalid", exists: "errExists", weak: "errWeak", email: "errEmail", rate: "errRate", insecure: "errInsecure", nodb: "errNoDb" };

export default function AccountForm() {
  const t = useTranslations("account");
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [secure, setSecure] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchMe().then((r) => { setMe(r.user); setSecure(r.secure); setReady(true); });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password, name }) });
      const data = await r.json();
      if (!r.ok) { setErr(t(ERR[data.error] ?? "errGeneric")); return; }
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

  const input = "w-full rounded-xl border border-line bg-surface px-4 py-3 outline-none focus:border-accent";
  if (!ready) return null;

  if (me)
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <p className="font-display text-lg font-semibold">{t("signedInAs", { email: me.email })}</p>
        <p className="mt-2 text-sm text-muted">{t("syncOn")}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {me.role === "admin" && <Link href="/admin" className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white">Admin</Link>}
          <button onClick={logout} className="rounded-full border border-line px-5 py-2.5 font-medium hover:border-accent">{t("signOut")}</button>
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-line bg-surface p-6 shadow-card">
      <p className="text-sm text-muted">{t("guestHint")}</p>
      {!secure && <p className="rounded-lg bg-accent-soft p-3 text-sm">{t("errInsecure")}</p>}
      {mode === "register" && <input className={input} placeholder={t("name")} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />}
      <input className={input} type="email" required placeholder={t("email")} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <input className={input} type="password" required minLength={8} placeholder={t("password")} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button disabled={busy || !secure} className="rounded-full bg-accent px-5 py-3 font-semibold text-white disabled:opacity-50">{mode === "login" ? t("signIn") : t("register")}</button>
      <button type="button" className="text-sm font-medium text-accent" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr(""); }}>
        {mode === "login" ? t("noAccount") : t("haveAccount")}
      </button>
    </form>
  );
}
