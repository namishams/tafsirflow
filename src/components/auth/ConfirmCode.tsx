"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import CodeInput from "./CodeInput";
import { postJSON, useCountdown } from "./shared";

// "Confirm that it is you": a code to the account's own address, used before sensitive steps (add a passkey, delete an
// account without a password) and to confirm an address. onConfirmed runs once the server accepted the code.
export default function ConfirmCode({ email, onConfirmed, compact = false }: { email: string; onConfirmed: () => void; compact?: boolean }) {
  const t = useTranslations("signin");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [left, start] = useCountdown();

  const send = async () => {
    setBusy(true); setErr("");
    try {
      const r = await postJSON<{ error?: string; retryAfter?: number; resendIn?: number }>("/api/auth/code/request", { purpose: "confirm", locale });
      if (r.ok) { setSent(true); setCode(""); start(r.data.resendIn ?? 30); }
      else if (r.data.error === "wait") { setSent(true); start(r.data.retryAfter ?? 30); }
      else setErr(r.data.error === "rate" ? t("errRate") : t("errGeneric"));
    } catch { setErr(t("errGeneric")); } finally { setBusy(false); }
  };

  const verify = async (v: string) => {
    setBusy(true); setErr("");
    try {
      const r = await postJSON<{ error?: string; left?: number }>("/api/auth/code/confirm", { code: v });
      if (r.ok) { onConfirmed(); return; }
      setCode("");
      setErr(r.data.error === "code" ? t("errCode", { n: r.data.left ?? 0 }) : r.data.error === "expired" ? t("errExpired") : r.data.error === "rate" ? t("errRate") : t("errGeneric"));
    } catch { setErr(t("errGeneric")); } finally { setBusy(false); }
  };

  return (
    <div className={`grid gap-3 ${compact ? "" : "rounded-lg border border-line bg-bg p-4"}`}>
      <p className="text-sm font-semibold">{t("confirmTitle")}</p>
      <p className="text-sm text-muted">{t("confirmLead", { email })}</p>
      {!sent ? (
        <button type="button" onClick={send} disabled={busy} className="btn-gold h-11 justify-self-start rounded-lg px-5 text-sm font-bold disabled:opacity-50">{t("confirmSend")}</button>
      ) : (
        <>
          <CodeInput value={code} onChange={setCode} onComplete={verify} disabled={busy} label={t("codeLabel")} digitLabel={(n) => t("digit", { n })} invalid={!!err} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
            <button type="button" onClick={() => verify(code)} disabled={busy || code.length !== 6} className="font-semibold text-accent hover:underline disabled:opacity-50">{t("confirm")}</button>
            <button type="button" onClick={send} disabled={busy || left > 0} className="font-medium text-muted hover:text-ink disabled:opacity-60">{left > 0 ? t("resendIn", { s: left }) : t("resend")}</button>
          </div>
        </>
      )}
      {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
