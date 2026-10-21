"use client";
import { useEffect, useState, type ReactNode } from "react";

// Tabs of the public talent profile (Achievements grid · Sijill · Badges), like the app. All panels stay in the HTML
// (indexable); the URL hash (#achievements, #sijill, #badges) selects one, so the badge link in the header still works.
// `icon` (TikTok profile, 21.10.2026): the tab shows only its icon (the label stays for screen readers) with a short gold
// bar under the active one; `flush` lets a panel (the edge-to-edge grid) start right under the tabs.
type Tab = { id: string; label: string; panel: ReactNode; icon?: ReactNode; flush?: boolean };
export default function ProfileTabs({ tabs, sticky }: { tabs: Tab[]; sticky?: boolean }) {
  const ids = tabs.map((t) => t.id).join(",");
  const [cur, setCur] = useState(tabs[0]?.id ?? "");
  useEffect(() => {
    const list = ids.split(",");
    const sync = () => { const h = window.location.hash.slice(1); if (list.includes(h)) setCur(h); };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [ids]);
  const go = (id: string) => { setCur(id); history.replaceState(null, "", `#${id}`); };
  return (
    <div>
      <div role="tablist" className={`flex border-b border-line ${sticky ? "sticky top-0 z-10 bg-surface" : ""}`}>
        {tabs.map((t, i) => (
          <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={cur === t.id} aria-controls={t.id} tabIndex={cur === t.id ? 0 : -1} onClick={() => go(t.id)}
            onKeyDown={(e) => {
              const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (!d) return;
              const n = tabs[(i + (document.dir === "rtl" ? -d : d) + tabs.length) % tabs.length];
              go(n.id); document.getElementById(`tab-${n.id}`)?.focus();
            }}
            aria-label={t.icon ? t.label : undefined} title={t.icon ? t.label : undefined}
            className={t.icon
              ? `relative grid h-12 flex-1 place-items-center ${cur === t.id ? "text-ink" : "text-muted hover:text-ink"}`
              : `h-12 flex-1 border-b-2 text-[15px] ${cur === t.id ? "border-[rgb(var(--hm-gold))] font-bold" : "border-transparent font-semibold text-muted hover:text-current"}`}>
            {t.icon ?? t.label}
            {t.icon && cur === t.id ? <span aria-hidden className="absolute bottom-0 h-0.5 w-11 rounded-full bg-[#c6a65e]" /> : null}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <section key={t.id} id={t.id} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={cur !== t.id} className={`scroll-mt-24 ${t.flush ? "pt-px" : "pt-6"}`}>
          {t.panel}
        </section>
      ))}
    </div>
  );
}
