"use client";
import { useEffect, useState, type ReactNode } from "react";

// Tabs of the public talent profile (Achievements grid · Sijill · Badges), like the app. All panels stay in the HTML
// (indexable); the URL hash (#achievements, #sijill, #badges) selects one, so the badge link in the header still works.
type Tab = { id: string; label: string; panel: ReactNode };
export default function ProfileTabs({ tabs }: { tabs: Tab[] }) {
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
      <div role="tablist" className="flex border-b border-line">
        {tabs.map((t, i) => (
          <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={cur === t.id} aria-controls={t.id} tabIndex={cur === t.id ? 0 : -1} onClick={() => go(t.id)}
            onKeyDown={(e) => {
              const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
              if (!d) return;
              const n = tabs[(i + (document.dir === "rtl" ? -d : d) + tabs.length) % tabs.length];
              go(n.id); document.getElementById(`tab-${n.id}`)?.focus();
            }}
            className={`h-12 flex-1 border-b-2 text-[15px] ${cur === t.id ? "border-[rgb(var(--hm-gold))] font-bold" : "border-transparent font-semibold text-muted hover:text-current"}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <section key={t.id} id={t.id} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={cur !== t.id} className="scroll-mt-24 pt-6">
          {t.panel}
        </section>
      ))}
    </div>
  );
}
