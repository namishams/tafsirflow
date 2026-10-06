"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";


export default function KidsToggle() {
  const t = useTranslations("landing");
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(localStorage.getItem("tf:kids") === "1"); }, []);
  const toggle = () => {
    const next = !on;
    setOn(next);
    try { localStorage.setItem("tf:kids", next ? "1" : "0"); } catch { /* private mode */ }
    if (next) document.documentElement.dataset.kids = "1";
    else delete document.documentElement.dataset.kids;
    window.dispatchEvent(new Event("tf-kids"));
  };
  return (
    <button onClick={toggle} aria-pressed={on} title={on ? t("kidsOff") : t("kidsOn")} className="inline-flex shrink-0 items-center rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium shadow-card hover:border-accent">
      {on ? "🎓" : "🧒"}<span className="ms-1.5 hidden sm:inline">{on ? t("kidsOff") : t("kidsOn")}</span>
    </button>
  );
}
