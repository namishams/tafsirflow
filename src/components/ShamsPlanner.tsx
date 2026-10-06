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
  const chip = (on: boolean) => `h-10 rounded-full border px-4 text-sm font-semibold transition ${on ? "border-[rgb(201_166_94)] bg-[rgb(201_166_94)]/15 text-ink shadow-[inset_0_0_0_1px_rgb(201_166_94)]" : "border-line bg-surface/70 hover:border-[rgb(201_166_94)]/70"}`;
  return (
    <div className="rounded-2xl border border-[rgb(201_166_94)]/35 bg-surface/80 p-5 shadow-[0_18px_40px_-30px_rgb(80_60_20/0.45)] sm:p-7">
      <p className="text-sm font-semibold text-muted">{t("planGoal")}</p>
      <div className="mt-2 flex flex-wrap gap-2">{GOALS.map((x) => <button key={x.id} onClick={() => setGoal(x.id)} className={chip(goal === x.id)}>{t(`g_${x.id}`)}</button>)}</div>
      <p className="mt-5 text-sm font-semibold text-muted">{t("planPer")}</p>
      <div className="mt-2 flex flex-wrap gap-2">{PER_DAY.map((n) => <button key={n} onClick={() => setPer(n)} className={chip(per === n)}>{n}</button>)}</div>
      <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-[rgb(201_166_94)]/30 bg-[rgb(201_166_94)]/25 sm:grid-cols-3">
        <div className="bg-[rgb(var(--stage))] p-4 text-[#eef0f3]"><p className="text-xs text-white/55">{t("planVerses")}</p><p className="font-display mt-1 text-2xl text-[rgb(233_207_153)]">{g.verses.toLocaleString(`${locale}-u-nu-latn`)}</p></div>
        <div className="bg-[rgb(var(--stage))] p-4 text-[#eef0f3]"><p className="text-xs text-white/55">{t("planTime")}</p><p className="font-display mt-1 text-2xl text-[rgb(233_207_153)]">{span}</p></div>
        <div className="bg-[rgb(var(--stage))] p-4 text-[#eef0f3]"><p className="text-xs text-white/55">{t("planDaily")}</p><p className="font-display mt-1 text-2xl text-[rgb(233_207_153)]">≈ {minutes} {t("min")}</p></div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted">{t("planNote")}</p>
    </div>
  );
}
