"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Chapter } from "@/lib/quran";

// Surah switcher: a quiet pill that opens a searchable sheet with all 114 surahs (bottom sheet on phones, dialog on desktop)
export default function SurahPicker({ current, chapters }: { current: Chapter; chapters: Chapter[] }) {
  const t = useTranslations("player");
  const locale = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const all = chapters.length ? chapters : [current];
    if (!s) return all;
    return all.filter((c) => String(c.id) === s || c.name_simple.toLowerCase().includes(s) || c.name_arabic.includes(s) || (c.translated_name?.name ?? "").toLowerCase().includes(s));
  }, [q, chapters, current]);
  const go = (id: number) => { setOpen(false); setQ(""); router.push(`/surah/${id}`); };
  return (
    <>
      <button onClick={() => setOpen(true)} aria-haspopup="dialog" className="inline-flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-full border border-line bg-surface ps-4 pe-3 text-[14px] font-semibold transition hover:border-ink/40">
        <span className="truncate">{current.id}. {current.name_simple}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={t("goSurah")}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-3xl bg-surface shadow-xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[32rem] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
            <div className="p-4 pb-2 sm:p-5">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" />
              <div className="flex items-center gap-2">
                <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("goSurah")} className="h-11 min-w-0 flex-1 rounded-full border border-line bg-bg px-4 text-[15px] outline-none focus:border-gold" />
                <button onClick={() => setOpen(false)} className="h-11 rounded-full px-3 text-sm font-semibold text-muted hover:text-ink">{t("closeTafsir")}</button>
              </div>
            </div>
            <ol className="flex-1 overflow-y-auto px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-3">
              {list.map((c) => (
                <li key={c.id}>
                  <button onClick={() => go(c.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition hover:bg-bg ${c.id === current.id ? "bg-bg" : ""}`}>
                    <span className="w-8 shrink-0 text-end text-sm tabular-nums text-muted">{c.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{c.name_simple}</span>
                      <span className="block truncate text-xs text-muted">{[c.translated_name?.name, `${c.verses_count} ${t("verse").toLowerCase()}`].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="font-arabic shrink-0 text-xl leading-none text-accent" dir="rtl">{locale === "ar" ? "" : c.name_arabic}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  );
}
