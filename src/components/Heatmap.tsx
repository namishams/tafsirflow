"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { today } from "@/lib/learning";
import { readJSON } from "@/lib/storage";
import "@/styles/art-home.css";

// Last 12 weeks, one square per day – the darker, the more verses practised (like the rings of a tree)
export default function Heatmap() {
  const t = useTranslations("session");
  const locale = useLocale();
  const [days, setDays] = useState<Record<string, number> | null>(null);
  useEffect(() => { setDays(readJSON<Record<string, number>>("tf:days", {})); }, []);
  if (!days) return <div className="h-32 animate-pulse rounded-lg bg-[rgb(var(--hm-gold))]/10" />;
  const end = today();
  // rows are weekdays (Monday on top), columns are weeks; the current week ends today
  const start = end - ((new Date(end * 86400000).getUTCDay() + 6) % 7) - 77;
  const cells = Array.from({ length: end - start + 1 }, (_, i) => { const d = start + i; return { d, n: Number(days[String(d)] ?? 0) }; });
  const max = Math.max(1, ...cells.map((c) => c.n));
  const active = cells.filter((c) => c.n > 0).length;
  const total = cells.reduce((a, c) => a + c.n, 0);
  // emerald deepens with practice; the very best days are gilded
  const tone = (n: number) => (n === 0 ? "bg-[rgb(var(--hm-gold))]/[0.09] shadow-[inset_0_0_0_1px_rgb(201_166_94/.12)]" : n / max < 0.25 ? "bg-accent/30" : n / max < 0.5 ? "bg-accent/55" : n / max < 0.85 ? "bg-accent/85" : "bg-gradient-to-br from-[#e3cb93] to-[#c6a65e]");
  return (
    <div>
      <div className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
        {cells.map((c) => (
          <span key={c.d} title={`${new Date(c.d * 86400000).toLocaleDateString(locale, { day: "numeric", month: "short" })} · ${c.n}`}
            className={`aspect-square rounded-[3px] transition-transform duration-300 hover:scale-125 ${tone(c.n)} ${c.d === end ? "ring-[1.5px] ring-[rgb(var(--hm-gold))] ring-offset-1 ring-offset-surface" : ""}`} />
        ))}
      </div>
      <p className="mt-3 text-[13px] text-muted">{t("heat", { days: active, verses: total })}</p>
    </div>
  );
}
