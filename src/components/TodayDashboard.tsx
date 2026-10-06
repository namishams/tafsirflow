"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { dueVerses, readSrs, stats, today, weakestVerses } from "@/lib/learning";
import { readJSON } from "@/lib/storage";
import { fetchMe, type Me } from "@/lib/sync";
import { getChapters, type Chapter } from "@/lib/quran";
import { dailyGoal, levelOf, levelStart, nextLesson, readProgress, streakOf } from "@/lib/academy";
import { PLAN_DAYS, TRACKS, dayOfPlan, newPerDay, portion, ranges, readPlan } from "@/lib/plans";
import { TOTAL_VERSES } from "@/lib/quranIndex";
import { CITIES, dayFor, fmtTime, type Spot } from "@/lib/prayer";
import { LESSONS as ARABIC_LESSONS, arabicPercent, nextArabic, readArabic } from "@/lib/arabic";
import MemoryMap from "./MemoryMap";
import { CoachCard } from "./ProgressPanel";
import { SessionDone, SessionStart } from "./SessionStart";
import Onboarding from "./Onboarding";
import Heatmap from "./Heatmap";
import RewardsCard from "./RewardsCard";
import PosterTiles from "./PosterTiles";
import { IconCheckCircle, IconFlame } from "./Icons";

type Last = { chapter: number; verse: number };
type Task = { key: string; title: string; detail: string; href: string; cta: string; done: boolean };

// "Today": the daily hub – greeting stage, the checklist that ticks itself off, the week, the learning paths and the map
export default function TodayDashboard() {
  const t = useTranslations("today");
  const tp = useTranslations("prayer");
  const tm = useTranslations("map");
  const th = useTranslations("home2");
  const locale = useLocale();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [v, setV] = useState<ReturnType<typeof collect> | null>(null);

  const load = useCallback(() => { setV(collect(locale)); setNow(new Date()); }, [locale]);
  useEffect(() => {
    load();
    fetchMe().then((r) => setMe(r.user));
    getChapters(locale).then(setChapters).catch(() => undefined);
    window.addEventListener("tf-synced", load);
    window.addEventListener("focus", load);
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("focus", load); clearInterval(id); };
  }, [load, locale]);

  if (!v || !now) return <main className="mx-auto max-w-4xl px-4 pt-6"><div className="h-64 animate-pulse rounded-lg bg-line/40" /></main>;
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${t("surah")} ${s}`;
  const dateText = now.toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", weekday: "long", day: "numeric", month: "long" });
  const hijri = (() => { try { return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric", numberingSystem: "latn" }).format(now); } catch { return ""; } })();
  const cityId = readJSON<string>("tf:city", "makkah");
  const spot: Spot = cityId === "mine" ? readJSON<Spot | null>("tf:myspot", null) ?? CITIES[0] : CITIES.find((c) => c.id === cityId) ?? CITIES[0];
  const pd = dayFor(spot, now);
  const placeName = cityId === "mine" ? tp("yourPlace") : (CITIES.find((c) => c.id === cityId)?.names[locale] ?? CITIES.find((c) => c.id === cityId)?.names.en ?? "");

  // the daily checklist
  const tasks: Task[] = [];
  const first = v.due[0];
  tasks.push(first
    ? { key: "review", title: t("taskReview", { n: v.due.length }), detail: t("taskReviewD"), href: `/surah/${first.split(":")[0]}?v=${first.split(":")[1]}&m=2&r=1`, cta: t("start"), done: false }
    : v.learned
      ? { key: "review", title: t("taskReviewDone"), detail: t("taskReviewDoneD"), href: "/map", cta: t("open"), done: true }
      : { key: "start", title: t("startTitle"), detail: t("startBody"), href: "/surah/1?shams=1", cta: t("startCta"), done: false });
  if (v.plan) {
    const r = ranges(v.plan.portion);
    tasks.push({ key: "plan", title: t("taskPlan", { n: v.plan.perDay }), detail: r.map((x) => `${name(x.s)} ${x.from}${x.to > x.from ? `–${x.to}` : ""}`).join(", "), href: r[0] ? `/surah/${r[0].s}?v=${r[0].from}&shams=1` : "/plan", cta: t("learn"), done: v.plan.doneToday });
  } else tasks.push({ key: "plan", title: t("taskNoPlan"), detail: t("taskNoPlanD"), href: "/plan", cta: t("choose"), done: false });
  if (v.arabicNext) tasks.push({ key: "arabic", title: t("taskArabic"), detail: v.arabicNext.title[locale === "de" ? "de" : locale === "ar" ? "ar" : "en"] ?? v.arabicNext.title.en, href: `/arabic/${v.arabicNext.id}`, cta: t("learn"), done: v.arabicDoneToday });
  tasks.push({ key: "academy", title: t("taskAcademy", { goal: v.goal }), detail: t("taskAcademyD", { xp: v.todayXp, lesson: `${name(v.next.s)} ${v.next.from}–${v.next.to}` }), href: `/academy/${v.next.s}/${v.next.from}`, cta: t("test"), done: v.todayXp >= v.goal });
  if (v.khatm) tasks.push({ key: "khatm", title: t("taskKhatm"), detail: t("taskKhatmD", { pct: v.khatm.pct }), href: "/khatm", cta: t("read"), done: v.khatm.readToday });
  const doneCount = tasks.filter((x) => x.done).length;
  const nextTask = tasks.find((x) => !x.done);
  const continueHref = v.last ? `/surah/${v.last.chapter}?v=${v.last.verse}` : "/surah/1?shams=1";
  const weekMax = Math.max(1, ...v.week.map((d) => d.n));
  const lvl = v.level, lvlFrom = levelStart(lvl), lvlTo = levelStart(lvl + 1);
  const lvlPct = Math.min(100, Math.round(((v.xp - lvlFrom) / Math.max(1, lvlTo - lvlFrom)) * 100));

  return (
    <main className="pb-16">
      {/* stage */}
      <section className="stage girih text-[#eef0f3]">
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-7 sm:pt-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gold))]">{dateText}{hijri ? ` · ${hijri}` : ""}</p>
              <h1 className="font-display mt-2 text-[34px] leading-none sm:text-5xl">{me?.name ? t("hello", { name: me.name.split(" ")[0] }) : t("title")}</h1>
              <p className="mt-3 max-w-md text-[15px] text-white/70">{doneCount >= tasks.length ? t("allDone") : t("tasksLeft", { n: tasks.length - doneCount })}</p>
            </div>
            <Link href="/prayer" className="rounded-lg border border-white/15 bg-white/[0.04] px-4 py-3 text-sm hover:border-white/40">
              <span className="block text-xs text-white/55">{t("nextPrayer")} · {placeName}</span>
              <span className="mt-0.5 block font-bold">{tp(pd.next)} · {fmtTime(pd.nextAt, spot.tz, locale)}</span>
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-[auto_1fr] items-center gap-5 sm:gap-8">
            <Ring value={tasks.length ? doneCount / tasks.length : 0} label={`${doneCount}/${tasks.length}`} />
            <dl className="grid grid-cols-3 gap-3 text-center sm:text-start">
              <Stat n={<>{v.streak} <IconFlame className="inline h-5 w-5 align-[-0.15em] text-[rgb(var(--gold))]" /></>} l={t("tileStreak")} />
              <Stat n={v.todayCount} l={t("tileToday")} />
              <Stat n={lvl} l={t("level")} sub={`${lvlPct} %`} />
            </dl>
          </div>
          <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <SessionStart />
            {v.last && <Link href={continueHref} className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-5 text-[14px] font-semibold hover:border-white">{t("continueTitle", { surah: name(v.last.chapter), verse: v.last.verse })}</Link>}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4">
        <SessionDone />
        <Onboarding />
        <RewardsCard />
        {/* checklist */}
        <section className="mt-8">
          <h2 className="font-display text-2xl">{t("tasksTitle")}</h2>
          <ol className="mt-4 grid gap-2">
            {tasks.map((task, i) => (
              <li key={task.key} className={`flex min-w-0 items-center gap-3 rounded-xl border p-3.5 transition ${task.done ? "border-line/60 bg-surface/60" : nextTask?.key === task.key ? "border-gold/50 bg-gold/5" : "border-line bg-surface"}`}>
                <span className={task.done ? "text-accent" : "text-line"}><IconCheckCircle className="h-7 w-7" /></span>
                <span className="min-w-0 flex-1">
                  <span className={`block break-words text-[15px] font-bold ${task.done ? "text-muted line-through decoration-line" : ""}`}>{i + 1}. {task.title}</span>
                  <span className="block truncate text-[13px] text-muted">{task.detail}</span>
                </span>
                {!task.done && <Link href={task.href} className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-bold ${nextTask?.key === task.key ? "btn-gold" : "border border-line hover:border-ink"}`}>{task.cta}</Link>}
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8"><CoachCard /></div>

        {/* week + paths */}
        <div className="mt-8 grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-[15px] font-bold">{t("weekTitle")}</h2>
            <p className="mb-3 text-xs text-muted">{t("weekHint", { n: v.week.reduce((a, d) => a + d.n, 0) })}</p>
            <Heatmap />
          </section>
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-[15px] font-bold">{t("pathsTitle")}</h2>
            <ul className="mt-3 grid gap-3">
              <Path href="/arabic" label={t("pathArabic")} pct={v.arabicPct} hint={v.arabicNext ? (v.arabicNext.title[locale === "de" ? "de" : locale === "ar" ? "ar" : "en"] ?? v.arabicNext.title.en) : t("done")} />
              <Path href="/academy" label={t("pathAcademy", { lvl })} pct={lvlPct} hint={t("xpToNext", { n: Math.max(0, lvlTo - v.xp) })} />
              <Path href="/plan" label={t("pathPlan")} pct={v.plan ? Math.round((v.plan.day / PLAN_DAYS) * 100) : 0} hint={v.plan ? t("planDay", { d: v.plan.day, total: PLAN_DAYS }) : t("taskNoPlan")} />
              <Path href="/khatm" label={t("pathKhatm")} pct={v.khatm?.pct ?? 0} hint={v.khatm ? `${v.khatm.pct} %` : t("tileKhatm")} />
            </ul>
          </section>
        </div>

        {/* map + weak */}
        <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between"><h2 className="text-[15px] font-bold">{tm("todayTitle")}</h2><Link href="/map" className="text-[13px] font-semibold text-accent hover:underline">{tm("todayLink")} →</Link></div>
            <div className="mt-3"><MemoryMap compact /></div>
          </section>
          <section className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-[15px] font-bold">{t("weakTitle")}</h2>
            {v.weak.length === 0 ? <p className="mt-2 text-sm text-muted">{t("weakNone")}</p> : (
              <ul className="mt-3 grid gap-2">
                {v.weak.map((w) => { const [s, vn] = w.key.split(":").map(Number); return (
                  <li key={w.key}><Link href={`/surah/${s}?v=${vn}&m=2`} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm hover:border-ink">
                    <span className="font-semibold">{name(s)} · {vn}</span>
                    <span className="h-1.5 w-20 overflow-hidden rounded-full bg-line"><span className={`block h-full ${w.strength < 0.5 ? "bg-red-500/80" : "bg-gold/70"}`} style={{ width: `${Math.round(w.strength * 100)}%` }} /></span>
                  </Link></li>); })}
              </ul>
            )}
            <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs text-muted">
              <Tile v={v.learned} l={t("tileToday")} /><Tile v={v.secure} l={t("tileSecure")} /><Tile v={v.marks} l={t("tileMarks")} /><Tile v={v.notes} l={t("tileNotes")} />
            </div>
          </section>
        </div>

        <div className="mt-10"><PosterTiles keys={["shams", "arabic", "salah", "tajweed", "vocab", "duas", "reciters", "islam"]} title={th("coursesTitle")} more={{ href: "/academy", label: th("coursesAll") }} /></div>

        {/* how the masterclass is built */}
        <section className="mt-8 rounded-xl callout p-5">
          <h2 className="font-display text-xl">{t("howTitle")}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{t("howBody")}</p>
          <Link href="/how" className="mt-3 inline-block text-[14px] font-bold text-accent hover:underline">{t("howCta")} →</Link>
        </section>

        {me === null && (
          <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5">
            <p className="text-sm text-muted">{t("saveHint")}</p>
            <Link href="/account" className="btn-gold rounded-full px-5 py-2.5 text-sm font-bold">{t("saveCta")}</Link>
          </section>
        )}
      </div>
    </main>
  );
}

function Stat({ n, l, sub }: { n: React.ReactNode; l: string; sub?: string }) {
  return <div><dt className="font-display text-3xl leading-none sm:text-4xl">{n}</dt><dd className="mt-1 text-xs text-white/60">{l}{sub ? ` · ${sub.replace(" %", "\u00a0%")}` : ""}</dd></div>;
}
function Tile({ v, l }: { v: number; l: string }) {
  return <div className="rounded-lg bg-bg px-2 py-2"><p className="font-display text-xl text-ink">{v}</p><p>{l}</p></div>;
}
function Path({ href, label, pct, hint }: { href: string; label: string; pct: number; hint: string }) {
  return (
    <li><Link href={href} className="block rounded-lg px-1 py-1 hover:bg-bg">
      <span className="flex items-center justify-between text-sm"><span className="font-semibold">{label}</span><span className="tabular-nums text-muted">{pct} %</span></span>
      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} /></span>
      <span className="mt-1 block truncate text-xs text-muted">{hint}</span>
    </Link></li>
  );
}
function Ring({ value, label }: { value: number; label: string }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90"><circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.15)" strokeWidth="7" /><circle cx="40" cy="40" r={r} fill="none" stroke="rgb(var(--gold))" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${value * c} ${c}`} className="transition-all duration-700" /></svg>
      <span className="absolute inset-0 grid place-items-center font-display text-xl">{label}</span>
    </div>
  );
}

function collect(locale: string) {
  const srs = readSrs();
  const st = stats();
  const ac = readProgress();
  const plan = readPlan();
  const tr = plan ? TRACKS.find((x) => x.id === plan.track) : null;
  const k0 = readJSON<{ pos: number; log: Record<string, number>; deleted?: boolean } | null>("tf:khatm", null);
  const khatm = k0 && !k0.deleted ? k0 : null;
  const ar = readArabic();
  const d = today();
  // verses practised per day for the last 7 days ("tf:days" is kept by the learning module)
  const raw = readJSON<Record<string, number> | number[]>("tf:days", {});
  const perDay = (day: number) => Array.isArray(raw) ? raw.filter((x) => x === day).length : Number(raw[String(day)] ?? 0);
  const week = Array.from({ length: 7 }, (_, i) => { const day = d - 6 + i; const dt = new Date(day * 86400000); return { n: perDay(day), label: dt.toLocaleDateString(locale, { weekday: "short" }) }; });
  const arabicNext = nextArabic(ar);
  return {
    due: dueVerses(srs),
    streak: Math.max(st.streak, streakOf(ac)), todayCount: st.todayCount, week,
    learned: Object.keys(srs).length, secure: Object.values(srs).filter((x) => x.stage >= 3).length,
    marks: readJSON<string[]>("tf:bookmarks", []).length, notes: Object.keys(readJSON<Record<string, unknown>>("tf:notes", {})).length,
    last: readJSON<Last | null>("tf:last", null),
    todayXp: ac.days[d] ?? 0, goal: dailyGoal(ac), level: levelOf(ac.xp), xp: ac.xp, next: nextLesson(ac),
    arabicPct: arabicPercent(ar), arabicNext, arabicDoneToday: Object.values(ar.done).some((x) => Math.floor(x.at / 86400000) === d) || (!arabicNext && ARABIC_LESSONS.length > 0),
    plan: plan && tr ? (() => {
      const day = dayOfPlan(plan);
      const part = portion(tr, day);
      const practised = part.length > 0 && part.every((x) => srs[`${x.s}:${x.v}`]?.last === d);
      return { day, perDay: newPerDay(tr, day), portion: part, doneToday: (plan.done[d] ?? 0) > 0 || practised };
    })() : null,
    khatm: khatm ? { pct: Math.round((khatm.pos / TOTAL_VERSES) * 100), readToday: (khatm.log?.[d] ?? 0) > 0 } : null,
    weak: weakestVerses(4, srs).filter((w) => w.strength < 0.9),
  };
}
