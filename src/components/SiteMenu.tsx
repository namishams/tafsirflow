"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { GROUPS, isActive } from "@/lib/nav";
import { IconClose, IconMenu } from "./Icons";

// The one menu of the site. variant "panel": "More" button in the desktop header that opens all sections below
// the header; variant "sheet": round menu button for phones that opens the same sections full screen.
export default function SiteMenu({ variant = "sheet" }: { variant?: "sheet" | "panel" }) {
  const t = useTranslations("nav");
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const out = (e: MouseEvent) => { if (variant === "panel" && box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    if (variant === "sheet") document.body.style.overflow = "hidden";
    window.addEventListener("keydown", k);
    document.addEventListener("mousedown", out);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); document.removeEventListener("mousedown", out); };
  }, [open, variant]);

  const list = (cols: string) => (
    <div className={`grid gap-x-8 gap-y-7 ${cols}`}>
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t(g.title)}</p>
          <ul className="mt-2.5 grid gap-0.5">
            {g.items.map((i) => {
              const on = isActive(path, i.href);
              return (
                <li key={i.href}>
                  <Link href={i.href} aria-current={on ? "page" : undefined} className={`-mx-2.5 block rounded-md px-2.5 py-2 text-[15px] transition ${on ? "font-semibold text-accent" : "text-ink/85 hover:bg-bg hover:text-ink"}`}>{t(i.key)}</Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );

  if (variant === "panel")
    return (
      <div ref={box}>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm font-semibold transition ${open ? "text-ink" : "text-muted hover:text-ink"}`}>
          {t("more")}
          <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </button>
        {open && (
          <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-surface shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)]">
            <nav aria-label={t("menu")} className="mx-auto max-w-6xl px-5 py-8">{list("grid-cols-4")}</nav>
          </div>
        )}
      </div>
    );

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label={t("menu")} aria-expanded={open} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-surface hover:border-ink"><IconMenu /></button>
      {open && createPortal(
        <div className="fixed inset-0 z-[90] flex flex-col bg-surface" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
            <p className="text-[15px] font-extrabold tracking-tight">Quran Masterclass</p>
            <button onClick={() => setOpen(false)} aria-label={t("close")} className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg"><IconClose /></button>
          </div>
          <nav className="flex-1 overflow-y-auto px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6">
            <div className="mx-auto max-w-3xl">{list("grid-cols-2 sm:grid-cols-4")}</div>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
