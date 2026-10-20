"use client";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Seal } from "./PremiumPanel";

// Shown when a Pro part is opened without Pro (Quran Masterclass Pro, the app's monthly subscription): the Shams course
// beyond al-Fatiha and Juz 'Amma, or more offline surahs. Reading, listening and tafsir always stay open behind it.
// On the website this appears only if the owner switches premium.gateWeb on; otherwise only in the old iOS web shell.
export default function PremiumLock({ kind, freeOffline = 3, onClose }: { kind: "shams" | "offline"; freeOffline?: number; onClose: () => void }) {
  const t = useTranslations("premium");
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-end bg-black/55 p-3 backdrop-blur-sm sm:place-items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="premium-lock-title" onClick={onClose}>
      <div className="stage girih relative w-full max-w-md overflow-hidden rounded-3xl border border-[rgb(var(--gold))]/30 p-7 text-[#eef0f3]" onClick={(e) => e.stopPropagation()}>
        <span aria-hidden className="illum-frame" />
        <div className="relative">
          <Seal size={64} />
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[rgb(var(--gold))] rtl:tracking-normal">{t("kicker")}</p>
          <h2 id="premium-lock-title" className="font-display mt-2 text-[26px] leading-tight">{kind === "shams" ? t("lockedTitle") : t("offlineTitle")}</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-white/75">{kind === "shams" ? t("lockedBody") : t("offlineBody", { n: freeOffline })}</p>
          {kind === "shams" && <p className="mt-3 text-[13px] leading-relaxed text-[rgb(233_207_153)]">{t("lockedFree")}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/premium" onClick={onClose} className="btn-gold inline-flex h-12 items-center rounded-full px-6 text-[15px] font-bold">{t("lockedCta")}</Link>
            <button onClick={onClose} className="h-12 rounded-full px-4 text-sm font-semibold text-white/70 hover:text-white">{t("close")}</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
