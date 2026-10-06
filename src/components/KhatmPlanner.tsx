"use client";
import { IconMoon } from "./Icons";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getChapters, type Chapter } from "@/lib/quran";
import { TOTAL_VERSES, juzOf, keyAt } from "@/lib/quranIndex";
import { readJSON, writeJSON } from "@/lib/storage";
import { today } from "@/lib/learning";
import { QuranRing } from "./art/QuranArt";

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
  useEffect(() => {
    const load = () => { const p = readJSON<(Plan & { deleted?: boolean }) | null>(KEY, null); setPlan(p && !p.deleted ? p : null); };
    load();
    window.addEventListener("tf-synced", load); // the account copy arrives after the first render on a new device
    getChapters(locale).then(setChapters).catch(() => undefined);
    return () => window.removeEventListener("tf-synced", load);
  }, [locale]);
  const save = (p: Plan | null) => { setPlan(p); writeJSON(KEY, p ?? { deleted: true, at: Date.now() }); }; // marker: see lib/plans.ts
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${locale === "ar" ? "سورة" : "Surah"} ${s}`;
  if (plan === undefined) return null;

  if (!plan) {
    return (
      <section className="callout mt-8 rounded-xl p-5 sm:p-7">
        <h2 className="font-display text-2xl leading-tight">{t("newPlan")}</h2>
        <p className="mt-1 text-sm text-muted">{t("newPlanD")}</p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {PRESETS.map((d) => <button key={d} onClick={() => setDays(d)} aria-pressed={days === d} className="q-opt">{t("days", { n: d })}</button>)}
          <label className="flex items-center gap-2 text-sm text-muted">{t("custom")}<input type="number" min={1} max={2000} value={days} onChange={(e) => setDays(Math.max(1, Math.min(2000, Number(e.target.value) || 1)))} className="h-10 w-20 rounded-full border border-[rgb(201_166_94/0.45)] bg-surface px-3 text-center text-ink outline-none focus:border-[rgb(201_166_94)]" /></label>
        </div>
        <p className="mt-5 flex items-start gap-3 rounded-lg bg-[rgb(201_166_94/0.09)] p-3.5 text-[15px] leading-relaxed"><span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45 bg-[rgb(var(--gold))]" />{t("perDay", { verses: Math.ceil(TOTAL_VERSES / days), pages: Math.round((604 / days) * 10) / 10, minutes: Math.round((604 / days) * 2) })}</p>
        <button onClick={() => save({ startDay: today(), days, pos: 0, log: {}, at: Date.now(), round: 1 })} className="btn-gold mt-6 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{t("start")}</button>
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
      <section className="callout mt-8 grid items-center gap-5 rounded-xl p-5 sm:grid-cols-[auto_1fr_1fr] sm:gap-8 sm:p-7">
        <QuranRing pct={pct} className="mx-auto h-32 w-32 sm:h-36 sm:w-36"><span className="font-display text-3xl tabular-nums">{pct}%</span><span className="q-kicker mt-1 text-[10px] text-muted">{t("progress")}</span></QuranRing>
        <div className="min-w-0 text-center sm:text-start"><p className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("day")}</p><p className="font-display mt-2 text-3xl tabular-nums">{dayNo} <span className="text-lg text-muted">/ {plan.days}</span></p><p className="mt-2 text-xs text-muted">{t("juzNow", { n: juzOf(Math.min(plan.pos, TOTAL_VERSES - 1)) })}</p></div>
        <div className="min-w-0 text-center sm:text-start"><p className="q-kicker text-[rgb(var(--q-ink-gold))]">{t("status")}</p><p className={`mt-2 text-lg font-bold ${behind > 0 ? "text-[rgb(var(--q-ink-gold))]" : "text-accent"}`}>{finished ? t("done") : behind > 0 ? t("behind", { n: behind }) : t("onTrack")}</p></div>
      </section>

      {finished ? (
        <section className="stage girih relative mt-4 overflow-hidden rounded-xl p-8 text-center text-[#eef0f3]">
          <span aria-hidden className="illum-frame" />
          <p className="relative flex justify-center text-[rgb(var(--gold))]"><IconMoon /></p>
          <h2 className="font-display relative mt-3 text-3xl">{t("khatmDone")}</h2>
          <p className="relative mt-2 text-white/70">{t("khatmDoneD")}</p>
          <button onClick={() => save({ startDay: today(), days: plan.days, pos: 0, log: {}, at: Date.now(), round: plan.round + 1 })} className="btn-gold relative mt-6 inline-flex h-12 items-center rounded-md px-6 text-[15px] font-bold">{t("again")}</button>
        </section>
      ) : (
        <section className="q-continue stage mt-4 p-5 text-[#eef0f3] sm:p-7">
          <div className="flex items-start gap-4 sm:gap-5">
            <span className="q-window max-[359px]:!hidden"><span className="font-callig px-1 text-center text-[17px] leading-[1.35] text-[#e9cf99]" dir="rtl" lang="ar">{chapters.find((c) => c.id === a.s)?.name_arabic ?? a.s}</span></span>
            <div className="min-w-0 flex-1">
              <p className="q-kicker text-[rgb(var(--gold))]">{t("today")}</p>
              <h2 className="font-display mt-2 text-2xl leading-tight sm:text-3xl">{name(a.s)} {a.v} – {a.s !== b.s ? `${name(b.s)} ` : ""}{b.v}</h2>
              <p className="mt-1 text-sm text-white/60">{t("portion", { n: end - plan.pos })}</p>
              <div className="q-bar mt-4"><i style={{ width: `${pct}%` }} /></div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/surah/${a.s}?v=${a.v}`} className="btn-gold inline-flex h-11 items-center rounded-md px-5 text-sm font-bold">{t("read")}</Link>
            <button onClick={markRead} className="h-11 rounded-md border border-[rgb(214_180_108/0.6)] px-5 text-sm font-bold text-[#f3e2b6] transition hover:bg-white/5">{t("markRead")}</button>
          </div>
          <p className="mt-4 text-xs text-white/55">{t("adaptive")}</p>
        </section>
      )}
      <button onClick={() => { if (confirm(t("resetConfirm"))) save(null); }} className="mt-6 text-sm text-muted underline decoration-[rgb(201_166_94/0.6)] underline-offset-4 hover:text-ink">{t("reset")}</button>
      {plan.pos > 0 && plan.pos < TOTAL_VERSES && <p className="mt-2 text-xs text-muted">{t("position", { key: `${keyAt(plan.pos).s}:${keyAt(plan.pos).v}` })}</p>}
    </>
  );
}

