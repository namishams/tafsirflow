"use client";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getChapters, type Chapter } from "@/lib/quran";
import { PASS, UNITS, dailyGoal, levelOf, levelStart, lessonsOf, nextLesson, readProgress, secondsPerQuestion, streakOf, type Progress } from "@/lib/academy";
import { today } from "@/lib/learning";

// Academy overview: daily goal that grows with the streak, level, and the path through all 114 surahs
export default function AcademyHome() {
  const t = useTranslations("academy");
  const locale = useLocale();
  const [p, setP] = useState<Progress | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [open, setOpen] = useState<string>("u1");
  useEffect(() => { setP(readProgress()); getChapters(locale).then(setChapters).catch(() => undefined); }, [locale]);
  if (!p) return null;

  const lvl = levelOf(p.xp);
  const into = p.xp - levelStart(lvl), need = levelStart(lvl + 1) - levelStart(lvl);
  const goal = dailyGoal(p), todayXp = p.days[today()] ?? 0;
  const streak = streakOf(p);
  const nl = nextLesson(p);
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `Surah ${s}`;
  const doneCount = Object.values(p.done).filter((x) => x >= PASS).length;

  return (
    <>
      <section className="mt-6 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        <div className="bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("dailyGoal")}</p>
          <p className="font-display mt-2 text-3xl tabular-nums">{Math.min(todayXp, goal)} <span className="text-lg text-muted">/ {goal} XP</span></p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-accent" style={{ width: `${Math.min(100, (todayXp / goal) * 100)}%` }} /></div>
          <p className="mt-2 text-xs text-muted">{todayXp >= goal ? t("goalReached") : t("goalHint")}</p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("level")}</p>
          <p className="font-display mt-2 text-3xl tabular-nums">{lvl}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-line"><div className="h-full bg-gold" style={{ width: `${(into / need) * 100}%` }} /></div>
          <p className="mt-2 text-xs text-muted">{t("levelHint", { secs: secondsPerQuestion(lvl), xp: need - into })}</p>
        </div>
        <div className="bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{t("streak")}</p>
          <p className="font-display mt-2 text-3xl tabular-nums">{streak} 🔥</p>
          <p className="mt-2 text-xs text-muted">{t("streakHint", { n: doneCount })}</p>
        </div>
      </section>

      <Link href={`/academy/${nl.s}/${nl.from}`} className="mt-4 flex items-center justify-between gap-4 rounded-lg bg-ink p-5 text-bg hover:opacity-95">
        <span><span className="block text-xs font-semibold uppercase tracking-[0.12em] opacity-70">{t("continue")}</span><span className="mt-1 block text-xl font-bold">{name(nl.s)} · {nl.from}–{nl.to}</span></span>
        <span className="text-2xl">→</span>
      </Link>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{t("path")}</h2>
        <div className="mt-4 grid gap-3">
          {UNITS.map((u, ui) => {
            const lessons = u.surahs.flatMap(lessonsOf);
            const done = lessons.filter((l) => (p.done[l.id] ?? 0) >= PASS).length;
            return (
              <div key={u.id} className="overflow-hidden rounded-lg border border-line bg-surface">
                <button onClick={() => setOpen(open === u.id ? "" : u.id)} className="flex w-full items-center justify-between gap-3 p-5 text-start" aria-expanded={open === u.id}>
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-gold">{t("unit", { n: ui + 1 })}</span>
                    <span className="mt-1 block text-lg font-bold">{t(`${u.id}`)}</span>
                    <span className="mt-0.5 block text-sm text-muted">{t("unitMeta", { surahs: u.surahs.length, lessons: lessons.length, done })}</span>
                  </span>
                  <span className="text-muted">{open === u.id ? "−" : "+"}</span>
                </button>
                {open === u.id && (
                  <ul className="divide-y divide-line border-t border-line">
                    {u.surahs.map((s) => {
                      const ls = lessonsOf(s);
                      const d = ls.filter((l) => (p.done[l.id] ?? 0) >= PASS).length;
                      return (
                        <li key={s} className="px-5 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[15px] font-semibold">{s}. {name(s)}</span>
                            <span className="text-xs tabular-nums text-muted">{d}/{ls.length}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {ls.map((l) => {
                              const sc = p.done[l.id];
                              return <Link key={l.id} href={`/academy/${l.s}/${l.from}`} title={`${l.from}–${l.to}`} className={`grid h-8 min-w-[2.5rem] place-items-center rounded px-1.5 text-xs font-bold tabular-nums ${sc !== undefined && sc >= PASS ? "bg-accent text-white" : sc !== undefined ? "bg-gold/20 text-gold" : "border border-line hover:border-ink"}`}>{l.from}</Link>;
                            })}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
