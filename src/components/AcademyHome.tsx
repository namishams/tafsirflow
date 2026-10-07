"use client";
import { IconFlame } from "./Icons";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getChapters, type Chapter } from "@/lib/quran";
import { PASS, UNITS, dailyGoal, levelOf, levelStart, lessonsOf, nextLesson, readProgress, secondsPerQuestion, streakOf, type Progress } from "@/lib/academy";
import { today, weakestVerses } from "@/lib/learning";
import { ageProfile } from "@/lib/age";
import { Rosette } from "./Ornaments";
import { HomeCorners, HomeRing, HomeStar, StarGlyph } from "./art/HomeOrnaments";

// Academy overview: daily goal that grows with the streak, level, and the path through all 114 surahs
export default function AcademyHome() {
  const t = useTranslations("academy");
  const locale = useLocale();
  const [p, setP] = useState<Progress | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [open, setOpen] = useState<string>("u1");
  useEffect(() => {
    const load = () => setP(readProgress());
    load();
    window.addEventListener("tf-synced", load); // the account copy arrives after the first render on a new device
    getChapters(locale).then(setChapters).catch(() => undefined);
    return () => window.removeEventListener("tf-synced", load);
  }, [locale]);
  if (!p) return null;

  const lvl = levelOf(p.xp);
  const into = p.xp - levelStart(lvl), need = levelStart(lvl + 1) - levelStart(lvl);
  const goal = dailyGoal(p), todayXp = p.days[today()] ?? 0;
  const streak = streakOf(p);
  const nl = nextLesson(p);
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${locale === "ar" ? "سورة" : "Surah"} ${s}`;
  const weak = weakestVerses(6).filter((w) => w.strength < 0.9);
  const doneCount = Object.values(p.done).filter((x) => x >= PASS).length;

  const ch = (id: number) => chapters.find((c) => c.id === id);

  return (
    <>
      <section className="mt-8 grid gap-3 sm:grid-cols-3">
        {/* daily goal: a gold ring that fills */}
        <div className="hm-card flex items-center gap-4 p-5 sm:flex-col sm:text-center">
          <HomeCorners />
          <HomeRing id="ac-goal" dark={false} value={todayXp / Math.max(1, goal)} size={92} stroke={6}>
            <span className="leading-none"><span className="font-display block text-[20px] tabular-nums">{Math.min(todayXp, goal)}</span><span className="text-[10px] text-muted">/ {goal} XP</span></span>
          </HomeRing>
          <div className="min-w-0">
            <p className="hm-k text-[rgb(var(--hm-gold-d))]">{t("dailyGoal")}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{todayXp >= goal ? t("goalReached") : t("goalHint")}</p>
          </div>
        </div>
        {/* level: a gilded star */}
        <div className="hm-card flex items-center gap-4 p-5 sm:flex-col sm:text-center">
          <HomeCorners />
          <HomeStar size={92} tone="gold" className="!text-[30px]">{lvl}</HomeStar>
          <div className="w-full min-w-0">
            <p className="hm-k text-[rgb(var(--hm-gold-d))]">{t("level")}</p>
            <span className="hm-bar is-gold mt-2.5"><i style={{ width: `${Math.round((into / Math.max(1, need)) * 100)}%` }} /></span>
            <p className="mt-2 text-xs leading-relaxed text-muted">{t("levelHint", { secs: secondsPerQuestion(lvl, ageProfile().testBonus), xp: need - into })}</p>
          </div>
        </div>
        {/* streak: an emerald star with the flame */}
        <div className="hm-card flex items-center gap-4 p-5 sm:flex-col sm:text-center">
          <HomeCorners />
          <HomeStar size={92} tone="emerald" className="!text-[30px]"><span className="inline-flex items-center gap-0.5">{streak}<IconFlame /></span></HomeStar>
          <div className="min-w-0">
            <p className="hm-k text-[rgb(var(--hm-gold-d))]">{t("streak")}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{t("streakHint", { n: doneCount })}</p>
          </div>
        </div>
      </section>

      {/* continue: the next lesson on an illuminated page */}
      <Link href={`/academy/${nl.s}/${nl.from}`} className="stage group relative mt-4 flex items-center justify-between gap-4 overflow-hidden rounded-2xl px-6 py-6 text-[#eef0f3] sm:px-8">
        <span aria-hidden className="illum-frame" />
        {["start-1.5 top-1.5", "end-1.5 top-1.5", "bottom-1.5 start-1.5", "bottom-1.5 end-1.5"].map((c) => <Rosette key={c} size={20} className={`absolute ${c}`} />)}
        <span className="relative min-w-0">
          <span className="hm-k block text-[rgb(var(--gold))]">{t("continue")}</span>
          {locale !== "ar" && ch(nl.s)?.name_arabic && <span className="font-callig gold-sheen mt-1 block truncate text-[28px] leading-tight sm:text-[34px]" lang="ar">{`سورة ${ch(nl.s)?.name_arabic}`}</span>}
          <span className="mt-0.5 block text-xl font-bold">{name(nl.s)} · {nl.from}–{nl.to}</span>
        </span>
        <span aria-hidden className="btn-gold relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-xl"><span className="inline-block transition group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5">→</span></span>
      </Link>

      {weak.length > 0 && (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Rosette size={20} />{t("weakTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("weakLead")}</p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {weak.map((w) => {
              const [s, v] = w.key.split(":");
              return (
                <li key={w.key} className="min-w-0">
                  <Link href={`/surah/${s}?v=${v}&shams=1`} className="flex items-center justify-between gap-3 rounded-lg border border-[rgb(var(--hm-gold))]/25 bg-surface p-3.5 transition hover:border-[rgb(var(--hm-gold))]/70">
                    <span className="flex min-w-0 items-center gap-3"><HomeStar size={32} className="!text-[11px]">{v}</HomeStar><span className="truncate text-[15px] font-semibold">{name(Number(s))}</span></span>
                    <span className="flex shrink-0 items-center gap-2.5 text-xs tabular-nums text-muted"><span className="hm-bar is-gold w-16"><i style={{ width: `${Math.round(w.strength * 100)}%` }} /></span>{Math.round(w.strength * 100)}%</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* the path through the Quran: units like the chapters of an illuminated book */}
      <section className="mt-12">
        <h2 className="font-display flex items-center gap-2.5 text-2xl"><StarGlyph size={16} className="text-[rgb(var(--hm-gold))]" />{t("path")}</h2>
        <div className="mt-5 grid gap-3">
          {UNITS.map((u, ui) => {
            const lessons = u.surahs.flatMap(lessonsOf);
            const done = lessons.filter((l) => (p.done[l.id] ?? 0) >= PASS).length;
            const isOpen = open === u.id;
            return (
              <div key={u.id} className={`hm-card overflow-hidden transition-colors ${isOpen ? "!border-[rgb(var(--hm-gold))]/55" : ""}`}>
                <button onClick={() => setOpen(isOpen ? "" : u.id)} className="flex w-full items-center gap-4 p-4 text-start sm:p-5" aria-expanded={isOpen}>
                  <HomeStar size={48} tone={done === lessons.length && lessons.length > 0 ? "emerald" : isOpen ? "gold" : "light"} className="!text-[16px]">{ui + 1}</HomeStar>
                  <span className="min-w-0 flex-1">
                    <span className="hm-k block text-[rgb(var(--hm-gold-d))]">{t("unit", { n: ui + 1 })}</span>
                    <span className="mt-1 block text-lg font-bold leading-snug">{t(`${u.id}`)}</span>
                    <span className="mt-0.5 block text-sm text-muted">{t("unitMeta", { surahs: u.surahs.length, lessons: lessons.length, done })}</span>
                    <span className="hm-bar mt-2.5 max-w-xs"><i style={{ width: `${Math.round((done / Math.max(1, lessons.length)) * 100)}%` }} /></span>
                  </span>
                  <svg aria-hidden viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 text-[rgb(var(--hm-gold))] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {isOpen && (
                  <ul className="step-in divide-y divide-[rgb(var(--hm-gold))]/15 border-t border-[rgb(var(--hm-gold))]/20">
                    {u.surahs.map((s) => {
                      const ls = lessonsOf(s);
                      const d = ls.filter((l) => (p.done[l.id] ?? 0) >= PASS).length;
                      return (
                        <li key={s} className="px-4 py-3.5 sm:px-5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-2.5"><HomeStar size={30} className="!text-[10.5px]">{s}</HomeStar><span className="truncate text-[15px] font-semibold">{name(s)}</span></span>
                            <span className="flex shrink-0 items-center gap-2">
                              {locale !== "ar" && ch(s)?.name_arabic && <span className="font-arabic text-lg leading-none text-[rgb(var(--hm-gold-d))]" lang="ar">{ch(s)?.name_arabic}</span>}
                              <span className="text-xs tabular-nums text-muted">{d}/{ls.length}</span>
                            </span>
                          </div>
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {ls.map((l) => {
                              const sc = p.done[l.id];
                              const passed = sc !== undefined && sc >= PASS;
                              return <Link key={l.id} href={`/academy/${l.s}/${l.from}`} title={`${l.from}–${l.to}`} className={`hm-lesson grid h-8 min-w-[2.6rem] place-items-center px-2 text-xs font-bold tabular-nums transition ${passed ? "bg-accent text-white" : sc !== undefined ? "bg-[rgb(var(--hm-gold))]/30 text-[rgb(var(--hm-gold-d))]" : "bg-[rgb(var(--hm-gold))]/[0.12] hover:bg-[rgb(var(--hm-gold))]/30"}`}>{l.from}</Link>;
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
