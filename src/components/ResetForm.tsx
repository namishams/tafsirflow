"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PasswordInput } from "./AccountForm";

export default function ResetForm({ token }: { token: string }) {
  const t = useTranslations("account");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/auth/reset", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token, password: pw }) });
      const d = await r.json();
      if (!r.ok) setErr(t(d.error === "token" ? "errToken" : d.error === "weak" ? "errWeak" : "errGeneric"));
      else setDone(true);
    } catch {
      setErr(t("errGeneric"));
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="grid gap-5">
        <h2 className="font-display text-[28px] font-semibold">{t("resetTitle")}</h2>
        <p className="rounded-lg bg-accent-soft p-3 text-sm">{t("resetDone")}</p>
        <Link href="/account" className="inline-flex h-12 items-center justify-center rounded-lg bg-accent text-[15px] font-semibold text-white">{t("signIn")}</Link>
      </div>
    );
  return (
    <form onSubmit={submit} className="grid gap-5">
      <h2 className="font-display text-[28px] font-semibold">{t("resetTitle")}</h2>
      <PasswordInput label={t("newPassword")} value={pw} onChange={setPw} autoComplete="new-password" show={t("showP")} hide={t("hideP")} />
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="h-12 rounded-lg bg-accent text-[15px] font-semibold text-white hover:brightness-110 disabled:opacity-50">{t("resetTitle")}</button>
    </form>
  );
}
