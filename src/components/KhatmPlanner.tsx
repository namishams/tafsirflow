"use client";
import { IconMoon } from "./Icons";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getChapters, type Chapter } from "@/lib/quran";
import { TOTAL_VERSES, juzOf, keyAt } from "@/lib/quranIndex";
import { readJSON, writeJSON } from "@/lib/storage";
import { today } from "@/lib/learning";

type Plan = { startDay: number; days: number; pos: number; log: Record<string, number>; at: number; round: number };
const KEY = "tf:khatm";
const PRESETS = [7, 15, 30, 60, 90, 180, 365];

// Khatm planner: read the whole Quran in N days – daily portion, progress, catch-up when you fall behind
export default function KhatmPlanner() {
  const t = useTranslations("khatm");
  const locale = useLocale();
  const [plan, setPlan] = useState<Plan | null | undefined>(undefined);
  const [days, setDays] = useState(30);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  useEffect(() => { setPlan(readJSON<Plan | null>(KEY, null)); getChapters(locale).then(setChapters).catch(() => undefined); }, [locale]);
  const save = (p: Plan | null) => { setPlan(p); writeJSON(KEY, p); };
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `Surah ${s}`;
  if (plan === undefined) return null;

  if (!plan) {
    return (
      <section className="mt-6 rounded-lg border border-line bg-surface p-5 sm:p-7">
        <h2 className="text-lg font-bold">{t("newPlan")}</h2>
        <p className="mt-1 text-sm text-muted">{t("newPlanD")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((d) => <button key={d} onClick={() => setDays(d)} className={`h-10 rounded-md border px-3.5 text-sm font-semibold ${days === d ? "border-ink bg-ink text-bg" : "border-line hover:border-ink"}`}>{t("days", { n: d })}</button>)}
          <label className="flex items-center gap-2 text-sm text-muted">{t("custom")}<input type="number" min={1} max={2000} value={days} onChange={(e) => setDays(Math.max(1, Math.min(2000, Number(e.target.value) || 1)))} className="h-10 w-20 rounded-md border border-line bg-bg px-2 text-ink" /></label>
        </div>
        <p className="mt-4 text-[15px]">{t("perDay", { verses: Math.ceil(TOTAL_VERSES / days), pages: Math.round((604 / days) * 10) / 10, minutes: Math.round((604 / days) * 2) })}</p>
        <button onClick={() => save({ startDay: today(), days, pos: 0, log: {}, at: Date.now(), round: 1 })} className="mt-5 h-11 rounded-md bg-accent px-5 text-sm font-bold text-white">{t("start")}</button>
      </section>
    );
  }

  const dayNo = Math.min(plan.days, today() - plan.startDay + 1);
  const target = Math.min(TOTAL_VERSES, Math.round((TOTAL_VERSES / plan.days) * dayNo)); // where you should be by tonight
  const daysLeft = Math.max(1, plan.days - dayNo + 1);
  const portion = Math.max(0, Math.ceil((TOTAL_VERSES - plan.pos) / daysLeft)); // adapts if you are behind or ahead
  const end = Math.min(TOTAL_VERSES, plan.pos + portion);
  const a = keyAt(plan.pos), b = keyAt(end - 1);
  const pct = Math.round((plan.pos / TOTAL_VERSES) * 100);
  const behind = target - plan.pos;
  const finished = plan.pos >= TOTAL_VERSES;
  const markRead = () => save({ ...plan, pos: end, log: { ...plan.log, [today()]: (plan.log[today()] ?? 0) + (end - plan.pos) }, at: Date.now() });

  return (
    <>
      <section className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        <div className="bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("progress")}</p><p className="font-display mt-2 text-3xl tabular-nums">{pct}%</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div></div>
        <div className="bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("day")}</p><p className="font-display mt-2 text-3xl tabular-nums">{dayNo} <span className="text-lg text-muted">/ {plan.days}</span></p><p className="mt-2 text-xs text-muted">{t("juzNow", { n: juzOf(Math.min(plan.pos, TOTAL_VERSES - 1)) })}</p></div>
        <div className="bg-surface p-5"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("status")}</p><p className={`mt-2 text-lg font-bold ${behind > 0 ? "text-gold" : "text-accent"}`}>{finished ? t("done") : behind > 0 ? t("behind", { n: behind }) : t("onTrack")}</p></div>
      </section>

      {finished ? (
        <section className="mt-4 rounded-lg border border-line bg-surface p-6 text-center">
          <p className="flex text-gold"><IconMoon /></p>
          <h2 className="font-display mt-2 text-3xl">{t("khatmDone")}</h2>
          <p className="mt-2 text-muted">{t("khatmDoneD")}</p>
          <button onClick={() => save({ startDay: today(), days: plan.days, pos: 0, log: {}, at: Date.now(), round: plan.round + 1 })} className="mt-5 h-11 rounded-md bg-accent px-5 text-sm font-bold text-white">{t("again")}</button>
        </section>
      ) : (
        <section className="mt-4 rounded-lg border border-line bg-surface p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">{t("today")}</p>
          <h2 className="font-display mt-2 text-2xl leading-tight sm:text-3xl">{name(a.s)} {a.v} – {a.s !== b.s ? `${name(b.s)} ` : ""}{b.v}</h2>
          <p className="mt-1 text-sm text-muted">{t("portion", { n: end - plan.pos })}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/surah/${a.s}?v=${a.v}`} className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("read")}</Link>
            <button onClick={markRead} className="h-11 rounded-md bg-accent px-5 text-sm font-bold text-white">{t("markRead")}</button>
          </div>
          <p className="mt-4 text-xs text-muted">{t("adaptive")}</p>
        </section>
      )}
      <button onClick={() => { if (confirm(t("resetConfirm"))) save(null); }} className="mt-6 text-sm text-muted underline">{t("reset")}</button>
      {plan.pos > 0 && plan.pos < TOTAL_VERSES && <p className="mt-2 text-xs text-muted">{t("position", { key: `${keyAt(plan.pos).s}:${keyAt(plan.pos).v}` })}</p>}
    </>
  );
}

