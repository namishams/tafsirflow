"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconClose, IconMenu } from "./Icons";

// Full menu (hamburger) for the pages without the app tab bar: home, account, legal, support
const GROUPS: { title: string; items: { href: string; key: string }[] }[] = [
  { title: "groupLearn", items: [{ href: "/today", key: "today" }, { href: "/academy", key: "courses" }, { href: "/shams", key: "shams" }, { href: "/plan", key: "plan" }, { href: "/map", key: "map" }, { href: "/tajweed", key: "tajweed" }, { href: "/vocab", key: "vocab" }] },
  { title: "groupQuran", items: [{ href: "/quran", key: "quran" }, { href: "/islam", key: "islam" }, { href: "/search", key: "search" }, { href: "/khatm", key: "khatm" }, { href: "/duas", key: "duas" }, { href: "/radio", key: "radio" }, { href: "/prayer", key: "prayer" }] },
  { title: "groupMore", items: [{ href: "/guides", key: "guides" }, { href: "/feedback", key: "feedback" }, { href: "/changelog", key: "changelog" }, { href: "/about", key: "about" }, { href: "/support", key: "support" }, { href: "/profile", key: "profile" }] },
];

export default function SiteMenu() {
  const t = useTranslations("nav");
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", k); };
  }, [open]);
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label={t("menu")} aria-expanded={open} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-surface hover:border-ink"><IconMenu /></button>
      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-bg" role="dialog" aria-modal="true" aria-label={t("menu")}>
          <div className="flex h-14 items-center justify-between border-b border-line bg-surface px-4">
            <p className="text-[17px] font-extrabold tracking-tight">Quran Masterclass</p>
            <button onClick={() => setOpen(false)} aria-label={t("close")} className="grid h-9 w-9 place-items-center rounded-md hover:bg-bg"><IconClose /></button>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
            <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
              {GROUPS.map((g) => (
                <div key={g.title}>
                  <p className="eyebrow">{t(g.title)}</p>
                  <ul className="mt-2 grid grid-cols-2 gap-1 sm:grid-cols-1">
                    {g.items.map((i) => <li key={i.href}><Link href={i.href} className={`block rounded-md px-3 py-2.5 text-[16px] font-semibold hover:bg-surface ${path === i.href ? "bg-surface text-accent" : ""}`}>{t(i.key)}</Link></li>)}
                  </ul>
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
