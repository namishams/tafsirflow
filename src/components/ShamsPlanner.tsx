"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

// How long a goal takes at a given daily amount (new verses per day; reviews come on top)
const GOALS = [
  { id: "fatiha", verses: 7 },
  { id: "juzamma", verses: 564 },
  { id: "mulk", verses: 30 },
  { id: "baqarah", verses: 286 },
  { id: "quran", verses: 6236 },
] as const;
const PER_DAY = [1, 3, 5, 10, 20];

export default function ShamsPlanner() {
  const t = useTranslations("shams");
  const locale = useLocale();
  const [goal, setGoal] = useState<(typeof GOALS)[number]["id"]>("juzamma");
  const [per, setPer] = useState(3);
  const g = GOALS.find((x) => x.id === goal)!;
  const days = Math.ceil(g.verses / per);
  const minutes = per * 4 + 5; // ~4 minutes per new verse in seven steps + ~5 minutes of review
  const span = days < 60 ? t("planDays", { n: days }) : days < 730 ? t("planMonths", { n: Math.round(days / 30.4) }) : t("planYears", { n: (days / 365).toFixed(1) });
  const chip = (on: boolean) => `h-10 rounded-md border px-3.5 text-sm font-semibold ${on ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink"}`;
  return (
    <div className="rounded-lg border border-line bg-surface p-5 sm:p-7">
      <p className="text-sm font-semibold text-muted">{t("planGoal")}</p>
      <div className="mt-2 flex flex-wrap gap-2">{GOALS.map((x) => <button key={x.id} onClick={() => setGoal(x.id)} className={chip(goal === x.id)}>{t(`g_${x.id}`)}</button>)}</div>
      <p className="mt-5 text-sm font-semibold text-muted">{t("planPer")}</p>
      <div className="mt-2 flex flex-wrap gap-2">{PER_DAY.map((n) => <button key={n} onClick={() => setPer(n)} className={chip(per === n)}>{n}</button>)}</div>
      <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
        <div className="bg-bg p-4"><p className="text-xs text-muted">{t("planVerses")}</p><p className="font-display mt-1 text-2xl">{g.verses.toLocaleString(`${locale}-u-nu-latn`)}</p></div>
        <div className="bg-bg p-4"><p className="text-xs text-muted">{t("planTime")}</p><p className="font-display mt-1 text-2xl">{span}</p></div>
        <div className="bg-bg p-4"><p className="text-xs text-muted">{t("planDaily")}</p><p className="font-display mt-1 text-2xl">≈ {minutes} {t("min")}</p></div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">{t("planNote")}</p>
    </div>
  );
}
