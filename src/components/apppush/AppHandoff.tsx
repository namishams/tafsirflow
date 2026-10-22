"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { inIosApp } from "@/lib/premium";
import { readJSON, writeJSON } from "@/lib/storage";
import { dayNow } from "@/lib/points";

// After a finished lesson or Shams session: a quiet card at the bottom ("your progress is in sync, a sticker waits in the
// app"). Never a modal, at most once per day, waits until the sticker celebration is over, and closes by itself.
const KEY = "tf:handoffDay";
export default function AppHandoff({ url }: { url: string }) {
  const t = useTranslations("promo");
  const tn = useTranslations("nav");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (inIosApp()) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onPts = (e: Event) => {
      const kind = (e as CustomEvent<{ kind: string }>).detail?.kind;
      if (kind !== "lesson" && kind !== "session") return;
      if (readJSON<number>(KEY, -1) === dayNow()) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (readJSON<number>(KEY, -1) === dayNow()) return;
        writeJSON(KEY, dayNow(), true);
        setOpen(true);
      }, 5000);
    };
    window.addEventListener("tf-points", onPts);
    return () => { window.removeEventListener("tf-points", onPts); clearTimeout(timer); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setOpen(false), 30000);
    return () => clearTimeout(id);
  }, [open]);
  if (!open) return null;
  return (
    <aside role="status" aria-label={t("hoTitle")} className="stage girih fixed inset-x-3 bottom-[4.75rem] z-[44] mx-auto max-w-md rounded-2xl border border-[rgb(var(--gold))]/45 p-4 text-[#eef0f3] shadow-[0_16px_40px_-16px_rgba(4,30,22,.6)] lg:bottom-4 lg:start-auto lg:end-4 lg:mx-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-bold text-[rgb(var(--gold))]">{t("hoTitle")}</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-white/80">{t("hoBody")}</p>
          <a href={url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="btn-gold mt-3 inline-flex h-9 items-center rounded-full px-5 text-[13.5px] font-bold">{t("appStore")}</a>
        </div>
        <button type="button" onClick={() => setOpen(false)} aria-label={tn("close")} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </aside>
  );
}
