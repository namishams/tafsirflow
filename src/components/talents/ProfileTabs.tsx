"use client";
import { useEffect, useState, type ReactNode } from "react";
import Segmented from "@/components/ui/Segmented";

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
      <div className={sticky ? "sticky top-0 z-10 bg-surface" : undefined}>
        <Segmented tabs full label={tabs.map((t) => t.label).join(" / ")} value={cur} onChange={go}
          options={tabs.map((t) => ({ id: t.id, icon: t.icon, title: t.icon ? t.label : undefined, label: t.icon ? <span className="sr-only">{t.label}</span> : t.label }))} />
      </div>
      {tabs.map((t) => (
        <section key={t.id} id={t.id} role="tabpanel" aria-label={t.label} hidden={cur !== t.id} className={`scroll-mt-24 ${t.flush ? "pt-px" : "pt-6"}`}>
          {t.panel}
        </section>
      ))}
    </div>
  );
}
