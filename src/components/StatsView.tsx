"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RULES, levelOf, readPoints, streakOf, totalPoints, dayNow, type PointKind, type Points } from "@/lib/points";
import { firstListenDay, readListen, summarize, type Listen } from "@/lib/listen";
import { BADGES, HOUR_STICKERS, buildCtx, hoursOf, nextHourSticker, type Ctx, type StickerDef } from "@/lib/stickers";
import { readSrs, strength } from "@/lib/learning";
import { NOT_COUNTED } from "@/lib/coach";
import { getChapters, type Chapter } from "@/lib/quran";
import { LESSONS as ARABIC_LESSONS } from "@/lib/arabic";
import { readJSON } from "@/lib/storage";
import Sticker from "./Sticker";
import { LevelSeal } from "./Rewards";

const RANGES = [7, 30, 365, 0] as const; // 0 = all time

export type StatsSection = "level" | "stickers" | "badges" | "listen" | "points" | "learn";
// on its own page (/stats) or embedded in the profile dashboard (only some sections, as rounded cards)
export default function StatsView({ only, embedded = false }: { only?: StatsSection[]; embedded?: boolean } = {}) {
  const show = (x: StatsSection) => !only || only.includes(x);
  const t = useTranslations("rewards");
  const locale = useLocale();
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: 0 }).format(n);
  const [ready, setReady] = useState(false);
  const [pts, setPts] = useState<Points | null>(null);
  const [listen, setListen] = useState<Listen>({});
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [range, setRange] = useState<(typeof RANGES)[number]>(30);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [open, setOpen] = useState<{ def: StickerDef; have: boolean; note: string } | null>(null);
  const [mem, setMem] = useState({ strong: 0, mid: 0, weak: 0 });
  const [extra, setExtra] = useState({ tajweed: 0, vocab: 0, duas: 0 });

  useEffect(() => {
    const load = () => {
      setPts(readPoints()); setListen(readListen()); setCtx(buildCtx(ARABIC_LESSONS.length));
      const srs = readSrs(); const m = { strong: 0, mid: 0, weak: 0 };
      for (const [k, e] of Object.entries(srs)) { if (NOT_COUNTED.has(k)) continue; const s = strength(e); if (s >= 0.8) m.strong++; else if (s >= 0.5) m.mid++; else m.weak++; }
      setMem(m);
      setExtra({ tajweed: Object.keys(readJSON<Record<string, number>>("tf:tajweed", {})).length, vocab: Object.keys(readJSON<Record<string, unknown>>("tf:vocab", {})).length, duas: readJSON<string[]>("tf:duafav", []).length });
      setReady(true);
    };
    load();
    getChapters(locale).then(setChapters).catch(() => undefined);
    window.addEventListener("tf-synced", load); window.addEventListener("tf-points", load); window.addEventListener("tf-listen", load);
    return () => { window.removeEventListener("tf-synced", load); window.removeEventListener("tf-points", load); window.removeEventListener("tf-listen", load); };
  }, [locale]);

  const today = dayNow();
  const sum = useMemo(() => summarize(listen, range ? today - range + 1 : firstListenDay(listen), today, range === 0), [listen, range, today]);
  if (!ready || !pts || !ctx) return <div className="mx-auto max-w-6xl px-5 py-16"><div className="h-64 animate-pulse rounded-lg bg-line/40" /></div>;

  const total = totalPoints(pts);
  const lvl = levelOf(total);
  const st = streakOf(pts.d);
  const hours = hoursOf(ctx);
  const next = nextHourSticker(ctx);
  const dur = (sec: number) => { const m = Math.round(sec / 60); return m < 60 ? t("min", { m }) : t("hm", { h: Math.floor(m / 60), m: m % 60 }); };
  const name = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? `${s}`;
  const series = sum.series.slice(-30);
  const maxS = Math.max(60, ...series.map((x) => x.seconds));
  const maxH = Math.max(1, ...sum.byHour);
  const favHour = sum.byHour.indexOf(Math.max(...sum.byHour));
  const ptsSeries = Array.from({ length: 30 }, (_, i) => ({ day: today - 29 + i, p: pts.d[String(today - 29 + i)] ?? 0 }));
  const maxP = Math.max(10, ...ptsSeries.map((x) => x.p));
  const dayLabel = (d: number) => new Date(d * 86400000).toLocaleDateString(locale, { numberingSystem: "latn", day: "numeric", month: "short", timeZone: "UTC" });
  const todayKinds = pts.k.day === today ? pts.k.v : {};
  const card = "rounded-lg border border-line bg-surface p-5";

  return (
    <div className={embedded ? "grid gap-6 [&>section>div]:!px-4 sm:[&>section>div]:!px-6 [&>section>div]:!py-8" : ""}>
      {/* level */}
      {show("level") && (
        <section className={`stage girih relative overflow-hidden text-[#eef0f3] ${embedded ? "rounded-2xl" : ""}`}>
          <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:py-16 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="sticker-pop mx-auto"><LevelSeal n={lvl.n} size={156} /></div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--gold))]">{t("kicker")}</p>
              <p className="font-callig mt-3 text-5xl text-[rgb(var(--gold))]" dir="rtl" lang="ar">{lvl.ar}{lvl.stars > 0 && <span className="ms-3 font-display text-2xl">{"★".repeat(Math.min(lvl.stars, 5))}</span>}</p>
              {locale !== "ar" && <h1 className="font-display mt-1 text-4xl sm:text-5xl">{t("levelN", { n: lvl.n })} · {t(`l${lvl.n}`)}</h1>}
              {locale === "ar" && <h1 className="font-display mt-1 text-4xl sm:text-5xl">{t("levelN", { n: lvl.n })}</h1>}
              <div className="mt-5 max-w-xl">
                <div className="flex justify-between text-sm text-white/70"><span>{t("points", { n: nf(total) })}</span><span>{t("toNext", { n: nf(Math.max(0, lvl.to - total)) })}</span></div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[rgb(var(--gold))] transition-[width] duration-1000" style={{ width: `${Math.round(lvl.pct * 100)}%` }} /></div>
              </div>
              <dl className="mt-6 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-4">
                {[[nf(pts.d[String(today)] ?? 0), t("today")], [String(st.current), t("streak")], [new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: hours < 10 ? 1 : 0 }).format(hours), t("hours")], [nf(ctx.versesHeard), t("versesHeard")]].map(([n, l]) => (
                  <div key={l} className="border-s border-white/15 ps-3"><dt className="font-display text-3xl text-[rgb(var(--gold))]">{n}</dt><dd className="mt-1 text-xs leading-snug text-white/60">{l}</dd></div>
                ))}
              </dl>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/ranking" className="inline-flex h-11 items-center rounded-md btn-gold px-5 text-sm font-bold">{t("toRanking")}</Link>
                <Link href="/today" className="inline-flex h-11 items-center rounded-md border border-white/25 px-5 text-sm font-bold hover:border-white">{t("toToday")}</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* hour stickers */}
      {show("stickers") && (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-3xl sm:text-4xl">{t("stickersTitle")}</h2>
          <p className="mt-3 max-w-3xl text-[16px] leading-relaxed text-muted">{t("stickersLead")}</p>
          {next && <p className="mt-3 text-sm font-semibold text-accent">{t("nextSticker", { name: t(`s_${next.id}`), left: dur(Math.max(0, next.h * 3600 - ctx.minutes * 60)) })}</p>}
          <ul className="mt-8 grid grid-cols-3 gap-x-3 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">
            {HOUR_STICKERS.map((s, i) => {
              const have = hours >= s.h, prevH = i ? HOUR_STICKERS[i - 1].h : 0;
              const pct = have ? 1 : Math.max(0, (hours - prevH) / (s.h - prevH));
              return (
                <li key={s.id}>
                  <button onClick={() => setOpen({ def: s, have, note: t("hoursN", { n: nf(s.h) }) })} className="group grid w-full justify-items-center gap-2 text-center">
                    <Sticker def={s} size={92} locked={!have} pct={pct} className={`transition group-hover:-translate-y-1 ${have ? "sticker-shine rounded-full" : ""}`} />
                    <span className="font-callig text-xl leading-none text-gold" dir="rtl" lang="ar">{s.ar}</span>
                    <span className="text-[13px] font-semibold leading-tight">{locale !== "ar" ? t(`s_${s.id}`) : ""} <span className="block text-xs font-normal text-muted">{t("hoursN", { n: nf(s.h) })}</span></span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* achievements */}
      {show("badges") && (
        <section className={embedded ? "rounded-2xl border border-line bg-surface" : "border-y border-line bg-surface"}>
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 className="font-display text-3xl sm:text-4xl">{t("badgesTitle")}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {BADGES.map((b) => {
                const [have, goal] = b.need(ctx), done = have >= goal;
                return (
                  <li key={b.id}>
                    <button onClick={() => setOpen({ def: b, have: done, note: t(`d_${b.id}`) })} className={`flex h-full w-full flex-col items-center gap-2 rounded-lg border p-3 text-center transition hover:border-gold/60 sm:flex-row sm:gap-3 sm:text-start ${done ? "border-gold/40 bg-bg" : "border-line"}`}>
                      <Sticker def={b} size={56} locked={!done} pct={Number.isFinite(goal) ? have / goal : 0} />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-bold leading-tight [hyphens:auto]">{t(`s_${b.id}`)}</span>
                        <span className="mt-0.5 block text-xs text-muted">{done ? t("earned") : Number.isFinite(goal) ? `${nf(Math.min(have, goal))} / ${nf(goal)}` : "–"}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* listening */}
      {show("listen") && (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-3xl sm:text-4xl">{t("listenTitle")}</h2>
            <div className="inline-flex rounded-md border border-line bg-surface p-1 text-sm font-semibold">
              {RANGES.map((r) => <button key={r} onClick={() => setRange(r)} className={`rounded px-3 py-1.5 ${range === r ? "bg-ink text-bg" : "text-muted hover:text-ink"}`}>{r ? t("lastDays", { n: r }) : t("allTime")}</button>)}
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
            {[[dur(sum.seconds), t("listened")], [nf(sum.verses), t("versesHeard")], [nf(sum.days), t("daysListened")], [sum.seconds ? `${String(favHour).padStart(2, "0")}:00` : "–", t("favHour")]].map(([n, l]) => (
              <div key={l} className="bg-surface p-4"><dt className="font-display text-2xl sm:text-3xl">{n}</dt><dd className="mt-1 text-xs text-muted">{l}</dd></div>
            ))}
          </dl>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className={card}>
              <p className="text-sm font-bold">{t("perDay")}</p>
              <div className="mt-4 flex h-36 items-end gap-[3px]" role="img" aria-label={t("perDay")}>
                {series.map((x) => <div key={x.day} title={`${dayLabel(x.day)} · ${dur(x.seconds)} · ${x.verses}`} className={`min-w-0 flex-1 rounded-t-[3px] ${x.day === today ? "bg-gold" : "bg-accent/70"}`} style={{ height: `${Math.max(x.seconds ? 4 : 1, (x.seconds / maxS) * 100)}%`, opacity: x.seconds ? 1 : 0.25 }} />)}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted"><span>{series[0] && dayLabel(series[0].day)}</span><span>{t("today")}</span></div>
            </div>
            <div className={card}>
              <p className="text-sm font-bold">{t("perHour")}</p>
              <div className="mt-4 flex h-36 items-end gap-[2px]">
                {sum.byHour.map((s, h) => <div key={h} title={`${String(h).padStart(2, "0")}:00 · ${dur(s)}`} className={`min-w-0 flex-1 rounded-t-[2px] ${h >= 4 && h <= 6 ? "bg-gold" : "bg-accent/60"}`} style={{ height: `${Math.max(1, (s / maxH) * 100)}%`, opacity: s ? 1 : 0.25 }} />)}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-muted"><span>00</span><span>06</span><span>12</span><span>18</span><span>23</span></div>
            </div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className={card}>
              <p className="text-sm font-bold">{t("bySurah")}</p>
              {sum.bySurah.length === 0 ? <p className="mt-3 text-sm text-muted">{t("noListen")}</p> : (
                <ol className="mt-4 grid gap-2.5">
                  {sum.bySurah.slice(0, 12).map((x) => (
                    <li key={x.surah}>
                      <Link href={`/surah/${x.surah}`} className="group block">
                        <span className="flex items-baseline justify-between gap-3 text-[14px]"><span className="truncate font-semibold group-hover:text-accent">{x.surah}. {name(x.surah)}</span><span className="shrink-0 text-xs text-muted">{dur(x.seconds)} · {t("versesN", { n: x.verses })}</span></span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(3, (x.seconds / sum.bySurah[0].seconds) * 100)}%` }} /></span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
              {sum.bySurah.length > 0 && <p className="mt-4 text-xs text-muted">{t("surahsHeard", { n: sum.bySurah.length })}</p>}
            </div>
            <div className={card}>
              <p className="text-sm font-bold">{t("byReciter")}</p>
              {sum.byReciter.length === 0 ? <p className="mt-3 text-sm text-muted">{t("noListen")}</p> : (
                <ul className="mt-4 grid gap-2.5">
                  {sum.byReciter.slice(0, 8).map((x) => (
                    <li key={x.reciter}>
                      <span className="flex items-baseline justify-between gap-3 text-[14px]"><span className="truncate font-semibold">{x.reciter}</span><span className="shrink-0 text-xs text-muted">{dur(x.seconds)}</span></span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-gold" style={{ width: `${Math.max(3, (x.seconds / sum.byReciter[0].seconds) * 100)}%` }} /></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {/* points */}
      {show("points") && (
        <section className={`stage text-[#eef0f3] ${embedded ? "overflow-hidden rounded-2xl" : ""}`}>
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">{t("pointsTitle")}</h2>
              <div className="mt-6 flex h-40 items-end gap-[3px]">
                {ptsSeries.map((x) => <div key={x.day} title={`${dayLabel(x.day)} · ${x.p}`} className={`min-w-0 flex-1 rounded-t-[3px] ${x.day === today ? "bg-[rgb(var(--gold))]" : "bg-white/35"}`} style={{ height: `${Math.max(1, (x.p / maxP) * 100)}%`, opacity: x.p ? 1 : 0.3 }} />)}
              </div>
              <p className="mt-2 text-xs text-white/50">{t("last30")}</p>
              {Object.keys(todayKinds).length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2 text-xs">
                  {Object.entries(todayKinds).map(([k, v]) => <li key={k} className="rounded-full border border-white/15 px-3 py-1">{t(`k_${k}`)} <b className="text-[rgb(var(--gold))]">+{v}</b></li>)}
                </ul>
              )}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm font-bold">{t("howTitle")}</p>
              <ul className="mt-3 divide-y divide-white/10 text-[14px]">
                {(Object.keys(RULES) as PointKind[]).filter((k) => k !== "streak").map((k) => (
                  <li key={k} className="flex items-baseline justify-between gap-3 py-2"><span className="text-white/80">{t(`r_${k}`)}</span><span className="shrink-0 font-bold text-[rgb(var(--gold))]">+{RULES[k].pts}{RULES[k].cap ? <span className="ms-1 text-[11px] font-normal text-white/45">{t("cap", { n: RULES[k].cap! })}</span> : null}</span></li>
                ))}
                <li className="flex items-baseline justify-between gap-3 py-2"><span className="text-white/80">{t("r_streak")}</span><span className="shrink-0 font-bold text-[rgb(var(--gold))]">+5 … 50</span></li>
              </ul>
              <p className="mt-3 text-xs leading-relaxed text-white/50">{t("intention")}</p>
            </div>
          </div>
        </section>
      )}

      {/* learning */}
      {show("learn") && (
        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-3xl sm:text-4xl">{t("learnTitle")}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: nf(ctx.learned), l: t("learned"), href: "/map", sub: `${t("strong")} ${mem.strong} · ${t("mid")} ${mem.mid} · ${t("weak")} ${mem.weak}` },
              { n: `${ctx.arabicDone}/${ARABIC_LESSONS.length}`, l: t("arabicLessons"), href: "/arabic" },
              { n: nf(ctx.reviews), l: t("reviews"), href: "/today" },
              { n: nf(ctx.sessions), l: t("sessions"), href: "/today" },
              { n: nf(ctx.fullSurahs), l: t("fullSurahs"), href: "/map" },
              { n: nf(extra.tajweed), l: t("tajweed"), href: "/tajweed" },
              { n: nf(extra.vocab), l: t("vocab"), href: "/vocab" },
              { n: String(st.best), l: t("bestStreak"), href: "/today" },
            ].map((x) => (
              <Link key={x.l} href={x.href} className="rounded-lg border border-line bg-surface p-4 transition hover:border-gold/50">
                <p className="font-display text-3xl">{x.n}</p>
                <p className="mt-1 text-sm font-semibold">{x.l}</p>
                {x.sub && <p className="mt-1 text-xs text-muted">{x.sub}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setOpen(null)}>
          <div className="stage girih relative w-full max-w-sm overflow-hidden rounded-2xl border border-[rgb(var(--gold))]/30 p-7 text-center text-[#eef0f3]" onClick={(e) => e.stopPropagation()}>
            {open.have && <div className="sticker-rays pointer-events-none absolute left-1/2 top-[100px] h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2" aria-hidden />}
            <div className="sticker-pop relative mx-auto grid place-items-center"><Sticker def={open.def} size={140} locked={!open.have} /></div>
            <p className="font-callig relative mt-4 text-4xl text-[rgb(var(--gold))]" dir="rtl" lang="ar">{open.def.ar}</p>
            {locale !== "ar" && <h3 className="relative mt-1 text-2xl font-bold">{t(`s_${open.def.id}`)}</h3>}
            <p className="relative mt-2 text-sm leading-relaxed text-white/70">{open.note}{open.def.id.startsWith("h") && /^h\d/.test(open.def.id) ? ` · ${t(`d_${open.def.id}`)}` : ""}</p>
            {open.def.verse && <p className="relative mt-4 font-arabic text-xl leading-loose text-white/90" dir="rtl" lang="ar">{open.def.verse} <span className="text-xs text-white/50">({open.def.ref})</span></p>}
            <p className="relative mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[rgb(var(--gold))]">{open.have ? t("earned") : t("notYet")}</p>
            <button onClick={() => setOpen(null)} className="relative mt-5 h-11 rounded-md border border-white/25 px-5 text-sm font-bold hover:border-white">{t("close")}</button>
          </div>
        </div>
      )}
    </div>
  );
}
