"use client";
import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { STAGES, dueVerses, readSrs, stats, today, weakestVerses } from "@/lib/learning";
import { readJSON } from "@/lib/storage";
import { fetchMe, type Me } from "@/lib/sync";
import { getChapters, type Chapter } from "@/lib/quran";
import { dailyGoal, levelOf, nextLesson, readProgress, streakOf } from "@/lib/academy";
import { TRACKS, dayOfPlan, newPerDay, portion, ranges, readPlan } from "@/lib/plans";
import { TOTAL_VERSES } from "@/lib/quranIndex";
import { CITIES, dayFor, fmtTime, type Spot } from "@/lib/prayer";
import MemoryMap from "./MemoryMap";

type Last = { chapter: number; verse: number };
type Task = { key: string; title: string; detail: string; href: string; cta: string; done: boolean };

// "Today": the daily hub – one checklist that ticks itself off, plus progress at a glance
export default function TodayDashboard() {
  const t = useTranslations("today");
  const tp = useTranslations("prayer");
  const tm = useTranslations("map");
  const locale = useLocale();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [now, setNow] = useState<Date | null>(null);
  const [v, setV] = useState<ReturnType<typeof collect> | null>(null);

  const load = useCallback(() => { setV(collect()); setNow(new Date()); }, []);
  useEffect(() => {
    load();
    fetchMe().then((r) => setMe(r.user));
    getChapters(locale).then(setChapters).catch(() => undefined);
    window.addEventListener("tf-synced", load);
    window.addEventListener("focus", load); // coming back from a lesson: tick off what was done
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("focus", load); clearInterval(id); };
  }, [load, locale]);

  if (!v || !now) return <main className="mx-auto max-w-3xl px-4 pt-6"><div className="h-64 animate-pulse rounded-lg bg-line/40" /></main>;
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${t("surah")} ${s}`;
  const dateText = now.toLocaleDateString(locale, { calendar: "gregory", numberingSystem: "latn", weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hijri = (() => { try { return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric", numberingSystem: "latn" }).format(now); } catch { return ""; } })();

  // next prayer for the place chosen on the prayer page (default Makkah)
  const cityId = readJSON<string>("tf:city", "makkah");
  const spot: Spot = cityId === "mine" ? readJSON<Spot | null>("tf:myspot", null) ?? CITIES[0] : CITIES.find((c) => c.id === cityId) ?? CITIES[0];
  const pd = dayFor(spot, now);
  const placeName = cityId === "mine" ? tp("yourPlace") : (CITIES.find((c) => c.id === cityId)?.names[locale] ?? CITIES.find((c) => c.id === cityId)?.names.en ?? "");

  // the daily checklist
  const tasks: Task[] = [];
  const first = v.due[0];
  tasks.push(first
    ? { key: "review", title: t("taskReview", { n: v.due.length }), detail: t("taskReviewD"), href: `/surah/${first.split(":")[0]}?v=${first.split(":")[1]}&m=2&r=1`, cta: t("start"), done: false }
    : { key: "review", title: t("taskReviewDone"), detail: v.learned ? t("taskReviewDoneD") : t("taskReviewEmpty"), href: "/surah/1", cta: t("open"), done: v.learned > 0 });
  if (v.plan) {
    const r = ranges(v.plan.portion);
    tasks.push({ key: "plan", title: t("taskPlan", { n: v.plan.perDay }), detail: r.map((x) => `${name(x.s)} ${x.from}${x.to > x.from ? `–${x.to}` : ""}`).join(", "), href: r[0] ? `/surah/${r[0].s}?v=${r[0].from}&shams=1` : "/plan", cta: t("learn"), done: v.plan.doneToday });
  } else {
    tasks.push({ key: "plan", title: t("taskNoPlan"), detail: t("taskNoPlanD"), href: "/plan", cta: t("choose"), done: false });
  }
  tasks.push({ key: "academy", title: t("taskAcademy", { goal: v.goal }), detail: t("taskAcademyD", { xp: v.todayXp, lesson: `${name(v.next.s)} ${v.next.from}–${v.next.to}` }), href: `/academy/${v.next.s}/${v.next.from}`, cta: t("test"), done: v.todayXp >= v.goal });
  if (v.khatm) tasks.push({ key: "khatm", title: t("taskKhatm"), detail: t("taskKhatmD", { pct: v.khatm.pct }), href: "/khatm", cta: t("read"), done: v.khatm.readToday });
  const doneCount = tasks.filter((x) => x.done).length;

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5">
        <div>
          <h1 className="font-display text-[34px] leading-none">{me?.name ? t("hello", { name: me.name.split(" ")[0] }) : t("title")}</h1>
          <p className="mt-2 text-[15px] text-muted">{dateText}{hijri ? ` · ${hijri}` : ""}</p>
        </div>
        <Link href="/prayer" className="rounded-md border border-line bg-surface px-4 py-2.5 text-sm hover:border-ink">
          <span className="text-muted">{t("nextPrayer")} · {placeName}</span><br />
          <span className="font-bold">{tp(pd.next)} {fmtTime(pd.nextAt, spot.tz, locale)}</span>
        </Link>
      </div>

      {/* progress ring + key numbers */}
      <section className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div className="col-span-2 flex items-center gap-4 bg-surface p-5 sm:col-span-1">
          <Ring value={doneCount / tasks.length} />
          <div><p className="text-[13px] font-medium">{t("dayProgress")}</p><p className="font-display text-2xl">{doneCount}/{tasks.length}</p><p className="text-xs text-muted">{doneCount === tasks.length ? t("allDone") : t("tasksLeft", { n: tasks.length - doneCount })}</p></div>
        </div>
        <Tile label={t("tileStreak")} value={`${v.streak} 🔥`} hint={t("tileStreakHint")} />
        <Tile label={t("tileToday")} value={v.todayCount} hint={t("tileTodayHint")} />
        <Tile label={t("level")} value={v.level} hint={t("xpToday", { n: v.todayXp })} />
      </section>

      {/* checklist */}
      <section className="mt-6">
        <h2 className="text-lg font-bold">{t("tasksTitle")}</h2>
        <ol className="mt-3 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
          {tasks.map((task, i) => (
            <li key={task.key} className="flex items-center gap-4 bg-surface p-4 sm:p-5">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${task.done ? "bg-accent text-white" : "border-2 border-line text-muted"}`} aria-label={task.done ? t("done") : t("open")}>{task.done ? "✓" : i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-[16px] font-bold ${task.done ? "text-muted line-through decoration-1" : ""}`}>{task.title}</p>
                <p className="mt-0.5 truncate text-sm text-muted">{task.detail}</p>
              </div>
              <Link href={task.href} className={`inline-flex h-10 shrink-0 items-center rounded-md px-4 text-sm font-bold ${task.done ? "border border-line hover:border-ink" : "bg-ink text-bg hover:opacity-90"}`}>{task.done ? t("again") : task.cta}</Link>
            </li>
          ))}
        </ol>
      </section>

      {/* continue + weakest */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line border-s-4 border-s-accent bg-surface p-5">
          <p className="text-[13px] font-bold text-accent">{v.last ? t("stepContinue") : t("stepStart")}</p>
          <h2 className="font-display mt-1.5 text-2xl leading-tight">{v.last ? t("continueTitle", { surah: name(v.last.chapter), verse: v.last.verse }) : t("startTitle")}</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{v.last ? t("continueBody") : t("startBody")}</p>
          <Link href={v.last ? `/surah/${v.last.chapter}?v=${v.last.verse}` : "/surah/1?shams=1"} className="mt-4 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-bold text-white hover:brightness-110">{v.last ? t("continueCta") : t("startCta")}</Link>
        </section>
        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-[15px] font-bold">{t("weakTitle")}</h2>
          {v.weak.length ? (
            <ul className="mt-3 grid gap-2">
              {v.weak.map((w) => {
                const [s, a] = w.key.split(":");
                return (
                  <li key={w.key}><Link href={`/surah/${s}?v=${a}&shams=1`} className="flex items-center justify-between gap-3 rounded-md border border-line px-3 py-2 hover:border-ink">
                    <span className="text-sm font-semibold">{name(Number(s))} · {a}</span>
                    <span className="flex items-center gap-2 text-xs tabular-nums text-muted"><span className="h-1.5 w-14 overflow-hidden rounded-full bg-line"><span className="block h-full bg-gold" style={{ width: `${Math.round(w.strength * 100)}%` }} /></span>{Math.round(w.strength * 100)}%</span>
                  </Link></li>
                );
              })}
            </ul>
          ) : <p className="mt-2 text-sm text-muted">{t("weakNone")}</p>}
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-line bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">{tm("todayTitle")}</h2><Link href="/map" className="text-sm font-bold text-accent hover:underline">{tm("todayLink")} →</Link></div>
        <MemoryMap compact />
      </section>

      {/* totals */}
      <section className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        <Tile label={t("tileSecure")} value={v.secure} hint={t("tileSecureHint", { n: v.learned })} />
        <Tile label={t("tileMarks")} value={v.marks} />
        <Tile label={t("tileNotes")} value={v.notes} />
        <Tile label={t("tileKhatm")} value={v.khatm ? `${v.khatm.pct}%` : "–"} />
      </section>

      <section className="mt-6 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-[15px] font-bold">{t("scheduleTitle")}</h2>
        <p className="mt-1 text-sm text-muted">{t("scheduleBody")}</p>
        <ol className="mt-4 flex flex-wrap gap-2">
          {STAGES.map((n, i) => <li key={n} className="rounded-md border border-line px-3 py-1.5 text-sm"><span className="font-bold">{i + 1}</span> <span className="text-muted">· {n} {t("days")}</span></li>)}
        </ol>
      </section>

      {me === null && (
        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-surface p-5">
          <p className="max-w-md text-[15px] leading-relaxed">{t("saveHint")}</p>
          <Link href="/account" className="inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm font-bold text-bg">{t("saveCta")}</Link>
        </section>
      )}
    </main>
  );
}

function Tile({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="min-w-0 bg-surface p-4 sm:p-5">
      <p className="text-[13px] font-medium text-ink">{label}</p>
      <p className="mt-1.5 font-display text-[30px] leading-none">{value}</p>
      {hint && <p className="mt-2 text-[13px] leading-snug text-muted">{hint}</p>}
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 22, c = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true" className="shrink-0 -rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="6" />
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgb(var(--accent))" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value))} style={{ transition: "stroke-dashoffset .6s" }} />
    </svg>
  );
}

// everything the dashboard shows, read from the (synced) learning data
function collect() {
  const srs = readSrs();
  const st = stats();
  const ac = readProgress();
  const plan = readPlan();
  const tr = plan ? TRACKS.find((x) => x.id === plan.track) : null;
  const khatm = readJSON<{ pos: number; log: Record<string, number> } | null>("tf:khatm", null);
  const d = today();
  return {
    due: dueVerses(srs),
    streak: Math.max(st.streak, streakOf(ac)), todayCount: st.todayCount,
    learned: Object.keys(srs).length, secure: Object.values(srs).filter((x) => x.stage >= 3).length,
    marks: readJSON<string[]>("tf:bookmarks", []).length, notes: Object.keys(readJSON<Record<string, unknown>>("tf:notes", {})).length,
    last: readJSON<Last | null>("tf:last", null),
    todayXp: ac.days[d] ?? 0, goal: dailyGoal(ac), level: levelOf(ac.xp), next: nextLesson(ac),
    plan: plan && tr ? (() => {
      const part = portion(tr, dayOfPlan(plan));
      // done when marked on the plan page, or when every verse of today's portion was practised (rated) today
      const practised = part.length > 0 && part.every((x) => srs[`${x.s}:${x.v}`]?.last === d);
      return { perDay: newPerDay(tr, dayOfPlan(plan)), portion: part, doneToday: (plan.done[d] ?? 0) > 0 || practised };
    })() : null,
    khatm: khatm ? { pct: Math.round((khatm.pos / TOTAL_VERSES) * 100), readToday: (khatm.log?.[d] ?? 0) > 0 } : null,
    weak: weakestVerses(4, srs).filter((w) => w.strength < 0.9),
  };
}

