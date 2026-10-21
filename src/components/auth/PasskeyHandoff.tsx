"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { startSync } from "@/lib/sync";
import { passkeyRegister, passkeySignIn } from "./passkeyClient";
import { usePasskeySupport } from "./shared";

// The page the app opens in the system sign-in sheet (see src/lib/passkeys.ts, handoff):
//   ?h=<id>             sign in with a passkey for the app; the app then redeems the handoff with its secret
//   #r=<id>.<secret>    add a passkey to the account that is signed in in the app
// The sheet closes when the page goes to quranmasterclass://passkey (the app's callback). Without h/r the page signs
// in to the website with a passkey. A tap starts the passkey dialog (Safari asks for a user gesture).
const CALLBACK = "quranmasterclass://passkey";
type Mode = "login" | "register" | "web";

export default function PasskeyHandoff() {
  const t = useTranslations("signin");
  const router = useRouter();
  const supported = usePasskeySupport();
  const [mode, setMode] = useState<Mode | null>(null);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<"" | "login" | "register">("");

  useEffect(() => {
    const h = new URLSearchParams(location.search).get("h") ?? "";
    const r = new URLSearchParams(location.hash.slice(1)).get("r") ?? "";
    if (r) { setMode("register"); setToken(r); history.replaceState(null, "", location.pathname); } // the secret leaves the address bar
    else if (h) { setMode("login"); setToken(h); }
    else setMode("web");
  }, []);

  const back = (status: string) => { location.href = `${CALLBACK}?status=${status}`; };

  const run = async () => {
    setBusy(true); setErr("");
    try {
      if (mode === "register") {
        const r = await passkeyRegister(token);
        if (r.ok) { setDone("register"); back("added"); return; }
        if (r.error === "cancelled") return;
        setErr(r.error === "handoff" ? t("linkExpired") : r.error === "exists" ? t("passkeyExists") : r.error === "unsupported" ? t("notSupported") : t("errPasskey"));
        return;
      }
      const r = await passkeySignIn(mode === "login" ? token : undefined);
      if (r.ok) {
        if (mode === "login") { setDone("login"); back("ok"); return; }
        if (await startSync()) window.dispatchEvent(new Event("tf-synced"));
        window.dispatchEvent(new Event("tf-auth"));
        router.push("/account");
        return;
      }
      if (r.error === "cancelled") return;
      setErr(r.error === "unknown" ? t("errPasskeyUnknown") : r.error === "handoff" ? t("linkExpired") : r.error === "unsupported" ? t("notSupported") : r.error === "rate" ? t("errRate") : t("errPasskey"));
    } catch { setErr(t("errPasskey")); } finally { setBusy(false); }
  };

  if (!mode) return <div className="h-64" />;
  const title = mode === "register" ? t("passkeyRegisterTitle") : t("passkeyLoginTitle");
  const lead = mode === "register" ? t("passkeyRegisterLead") : mode === "login" ? t("passkeyLoginLead") : t("passkeyHint");
  return (
    <div className="grid gap-5">
      <div>
        <h2 className="font-display text-[28px] font-semibold leading-tight">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{lead}</p>
      </div>
      {done ? (
        <>
          <p role="status" className="rounded-lg bg-accent-soft p-3 text-sm">{done === "register" ? t("passkeyAdded") : t("passkeyDone")}</p>
          <button type="button" onClick={() => back(done === "register" ? "added" : "ok")} className="btn-gold h-12 rounded-lg text-[15px] font-bold">{t("backToApp")}</button>
        </>
      ) : (
        <>
          {!supported && <p className="rounded-lg border border-line p-3 text-sm">{t("notSupported")}</p>}
          <button type="button" onClick={run} disabled={busy || !supported} className="btn-gold h-12 rounded-lg text-[15px] font-bold transition disabled:opacity-50">
            {mode === "register" ? t("passkeyAdd") : t("passkeyContinue")}
          </button>
          {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
          {mode !== "web" && <button type="button" onClick={() => back("cancel")} className="text-sm font-medium text-muted hover:text-ink">{t("backToApp")}</button>}
        </>
      )}
    </div>
  );
}
