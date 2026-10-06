"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import AccountForm from "./AccountForm";
import Logo from "./Logo";

// Blocking sign-up wall shown when the free tafsir limit is reached (or the e-mail still needs confirming)
export default function AuthGate({ mode, onClose }: { mode: "register" | "verify"; onClose: () => void }) {
  const t = useTranslations("account");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-ink/50 backdrop-blur-sm sm:place-items-center" role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className="max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface p-6 shadow-xl sm:max-w-md sm:rounded-2xl sm:p-8">
        <div className="mb-5 flex items-center gap-2.5"><Logo size={28} /><span className="text-[15px] font-semibold">Quran Masterclass</span></div>
        {mode === "register" ? (
          <>
            <h2 id="gate-title" className="font-display text-[28px] leading-tight">{t("limitTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("limitBody")}</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {["b1", "b2", "b3"].map((k) => <li key={k} className="flex gap-3"><span className="mt-2 h-px w-4 shrink-0 bg-gold" />{t(k)}</li>)}
            </ul>
          </>
        ) : (
          <h2 id="gate-title" className="font-display text-[28px] leading-tight">{t("verifyGateTitle")}</h2>
        )}
        <div className="mt-6 border-t border-line pt-6"><AccountForm defaultMode="register" bare /></div>
        <button onClick={onClose} className="mt-5 w-full text-center text-sm text-muted hover:text-ink">{t("limitLater")}</button>
      </div>
    </div>
  );
}
