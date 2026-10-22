"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { BadgeIcon } from "@/components/talents/BadgeIcon";
import { DefaultAvatar } from "@/components/talents/DefaultAvatar";
import CountryBadge from "@/components/rankings/CountryBadge";
import TierEmblem from "./TierEmblem";
import { CARD_PX, drawCareerCard, type CardFormat } from "./careerCard";
import { careerText, fillCw, type CwKey } from "@/lib/careerWeb";
import { talentsText } from "@/lib/talentsWeb";
import { countryName } from "@/lib/countries";
import { readJSON } from "@/lib/storage";
import { TOTAL_VERSES } from "@/lib/quranIndex";
import { DIVISION_MARK, type BoardCat } from "@/lib/career";
import { demoBoard, demoStats } from "@/lib/careerDemo";
import type { BoardRow, CareerStats, RankPos, Side } from "@/lib/careerStats";

// The "Statistik" tab of a profile on the website (owner 22.10.2026; app: mobile/src/features/stats/CareerStats.tsx, 1:1):
// the career card (tier emblem in its progress ring, level and XP, member since, verified badge, country), places
// worldwide and in the country with the percentile, consistency, Shams progress, the Quran read in the khatm plan (own,
// this browser), courses, exams and certificates, garden and stickers, time learned, the milestone timeline, "you vs.
// them" between mutual follows, and the best learners worldwide. Every section shows only what the member shares;
// sections a member hides say so. The career card can be shared as an image (1080 × 1350 or 1080 × 1920).

type Tx = Record<CwKey, string>;
const card = "rounded-2xl border border-line bg-surface p-4 sm:p-5";
const DEV = process.env.NODE_ENV !== "production";

export default function CareerStatsWeb({ locale, username, own }: { locale: string; username: string; own: boolean }) {
  const t = careerText(locale);
  const [s, setS] = useState<CareerStats | null>(null);
  const [state, setState] = useState<"load" | "ok" | "restricted" | "error">("load");
  const [top, setTop] = useState<Record<BoardCat, BoardRow[]> | null>(null);
  const [demo, setDemo] = useState(false);
  const load = () => {
    setState("load");
    if (DEV && new URLSearchParams(window.location.search).get("demo") === "stats") {
      setDemo(true); setS(demoStats(own)); setState("ok");
      setTop({ xp: demoBoard(48_000).slice(0, 3), verses: demoBoard(6_100).slice(0, 3), streak: demoBoard(400).slice(0, 3), exams: demoBoard(60).slice(0, 3) });
      return;
    }
    fetch(`/api/community/stats/${encodeURIComponent(username)}?locale=${locale}`, { cache: "no-store" })
      .then(async (r) => {
        const d = (await r.json().catch(() => ({}))) as { stats?: CareerStats | null; restricted?: boolean };
        if (d.restricted) { setState("restricted"); return; }
        if (!r.ok || !d.stats) { setState("error"); return; }
        setS(d.stats); setState("ok");
      })
      .catch(() => setState("error"));
    fetch("/api/community/rankings/board?top=1").then((r) => r.json()).then((d) => setTop(d.top ?? null)).catch(() => undefined);
  };
  useEffect(load, [username, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === "load") return <Skeleton />;
  if (state === "restricted") return <p className="px-4 py-8 text-center text-muted">{t.restricted}</p>;
  if (state === "error" || !s) return (
    <div className="grid justify-items-center gap-3 px-4 py-8 text-center">
      <p className="text-muted">{t.error}</p>
      <button type="button" onClick={load} className="h-11 rounded-lg border border-line px-5 font-semibold">{t.retry}</button>
    </div>
  );
  return <StatsBody s={s} t={t} locale={locale} own={own || s.mine} top={top} demo={demo} />;
}

function StatsBody({ s, t, locale, own, top, demo }: { s: CareerStats; t: Tx; locale: string; own: boolean; top: Record<BoardCat, BoardRow[]> | null; demo: boolean }) {
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const tx = talentsText(locale) as Record<string, string>;
  const [sharing, setSharing] = useState(false);
  const j = s.sijill;
  const since = s.memberSince ? fillCw(t.memberSince, { d: monthName(s.memberSince, locale) }) : "";
  const verifiedLabel = s.badge ? (tx[`badge_${s.badge}`] ?? t.verified) : "";
  // the khatm plan of this browser (own profile only): how far the current reading has come
  const khatm = own ? readJSON<{ pos?: number; round?: number } | null>("tf:khatm", null) : null;
  const tierName = s.career ? `${t[`tier_${s.career.tier}` as CwKey]}${s.career.division ? ` ${DIVISION_MARK[s.career.division]}` : ""}${(s.career.gm ?? 0) >= 2 ? ` ${nf.format(s.career.gm)}` : ""}` : "";
  const hidden = (x: unknown) => (x === undefined ? <p className="text-[14px] text-muted">{t.hidden}</p> : null);
  const sumWeek = j.activity?.week ?? [];
  const juzDone = (j.memorised?.juz ?? []).filter((x) => x >= 100).length;

  return (
    <div className="grid gap-4 px-4 pb-6 pt-2">
      {/* career card */}
      <section aria-label={t.careerCard} className="stage girih relative overflow-hidden rounded-3xl p-5 text-white sm:p-7">
        <div className="relative grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="grid justify-items-center gap-2">
            {s.career ? <TierEmblem tier={s.career.tier} division={s.career.division} size={148} progress={s.career.into} label={`${t.tierLabel}: ${tierName}`} />
              : <div className="grid h-[148px] w-[148px] place-items-center rounded-full border border-white/15 text-[13px] text-white/60">{t.hidden}</div>}
          </div>
          <div className="grid gap-2 text-center sm:text-start">
            <p className="text-[12px] font-semibold tracking-[0.18em] text-[rgb(var(--gold))] rtl:tracking-normal">{t.careerCard}</p>
            {s.career ? <h3 className="font-display text-[34px] leading-tight text-[#F4E3B4]">{tierName}</h3> : null}
            {s.career ? (
              <p className="text-[14.5px] text-white/75">
                {fillCw(t.pointsN, { n: nf.format(s.career.score) })} · {s.career.next ? fillCw(t.nextTier, { n: nf.format((s.career.nextAt ?? 0) - s.career.score), t: t[`tier_${s.career.next}` as CwKey] }) : s.career.nextAt ? fillCw(t.nextTier, { n: nf.format(s.career.nextAt - s.career.score), t: `${t.tier_grandmaster} ${nf.format((s.career.gm ?? 1) + 1)}` }) : t.maxTier}
              </p>
            ) : null}
            {s.career ? (
              <div className="mt-1 grid gap-1.5">
                <div className="flex items-center justify-between text-[13.5px] font-semibold"><span>{fillCw(t.levelN, { n: s.career.level.level })}</span><span className="text-white/65">{fillCw(t.xpToNext, { n: nf.format(s.career.level.need - s.career.level.into), l: s.career.level.level + 1 })}</span></div>
                <Bar frac={s.career.level.into / Math.max(1, s.career.level.need)} dark />
              </div>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {s.badge ? <Chip><BadgeIcon badge={s.badge} size={16} title={verifiedLabel} />{t.verified}</Chip> : null}
              {s.country ? <Chip><CountryBadge code={s.country} size={20} />{countryName(s.country, locale)}</Chip> : <Chip>{t.noCountry}</Chip>}
              {since ? <Chip>{since}</Chip> : null}
            </div>
          </div>
        </div>
        {/* the big numbers (Call of Duty style, but for learning) */}
        <div className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Big value={s.ranks?.xp?.rank ? `#${nf.format(s.ranks.xp.rank)}` : "–"} label={t.worldwide} />
          <Big value={s.ranks?.xp?.pct ? fillCw(t.topPct, { n: nf.format(s.ranks.xp.pct) }) : "–"} label={t.cat_xp} />
          <Big value={j.memorised ? nf.format(j.memorised.verses) : "–"} label={t.cat_verses} />
          <Big value={j.time ? nf.format(j.time.best) : "–"} label={t.streakBest} />
        </div>
        {s.career ? (
          <div className="relative mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            <button type="button" onClick={() => setSharing(true)} className="h-11 rounded-lg bg-[#c6a65e] px-5 font-bold text-[rgb(8,38,29)] hover:brightness-105">{t.shareCard}</button>
          </div>
        ) : null}
      </section>

      {/* places */}
      <Section title={t.sec_ranks}>
        {s.ranks ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {(["xp", "xp_week", "verses", "streak", "exams"] as const).map((k) => <Place key={k} label={t[`cat_${k}` as CwKey]} p={s.ranks![k]} t={t} nf={nf} country={s.country} locale={locale} />)}
          </div>
        ) : (
          <div className="grid gap-3">
            <p className="text-[14.5px] text-muted">{own ? t.notListedOwn : t.notListed}</p>
            {own ? <Link href="/ranking" className="inline-flex h-11 w-fit items-center rounded-lg bg-[#c6a65e] px-5 font-bold text-[rgb(8,38,29)]">{t.joinRankings}</Link> : null}
          </div>
        )}
      </Section>

      {/* consistency */}
      <Section title={t.sec_streaks}>
        {j.time ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Num value={fillCw(t.daysN, { n: nf.format(j.time.streak) })} label={t.streakNow} />
              <Num value={fillCw(t.daysN, { n: nf.format(j.time.best) })} label={t.streakBest} />
              <Num value={fillCw(t.daysN, { n: nf.format(j.time.wird) })} label={t.wird} />
            </div>
            {j.activity ? (
              <div>
                <div className="flex gap-1.5" aria-hidden>{sumWeek.map((x, i) => <span key={i} className={`h-3 flex-1 rounded-full ${x > 0 ? "bg-[#c6a65e]" : "bg-line"}`} />)}</div>
                <p className="mt-1.5 text-[13px] text-muted">{fillCw(t.activeWeek, { n: j.activity.active })}</p>
              </div>
            ) : null}
          </div>
        ) : hidden(j.time)}
      </Section>

      {/* Shams: memorised verses, juz, Darajat al-Hifz */}
      <Section title={t.sec_shams}>
        {j.memorised || j.hifz ? (
          <div className="grid gap-3">
            {j.memorised ? (
              <>
                <div className="flex items-end justify-between gap-3">
                  <Num value={nf.format(j.memorised.verses)} label={t.versesMemorised} />
                  <span className="text-[14px] font-semibold text-muted">{fillCw(t.ofQuran, { n: nf.format(pct1(j.memorised.verses, TOTAL_VERSES)) })}</span>
                </div>
                <Bar frac={j.memorised.verses / TOTAL_VERSES} />
                <div>
                  <p className="mb-1.5 text-[13px] font-semibold">{t.juzDone}: {juzDone} / 30</p>
                  <div className="grid grid-cols-10 gap-1">
                    {(j.memorised.juz.length ? j.memorised.juz : new Array(30).fill(0)).map((x, i) => (
                      <span key={i} title={`Juz ${i + 1}: ${x} %`} className="grid aspect-square place-items-center rounded-md text-[10.5px] font-bold"
                        style={{ background: x >= 100 ? "#c6a65e" : x > 0 ? `rgba(15,138,99,${0.18 + (x / 100) * 0.6})` : "rgba(127,127,127,0.12)", color: x >= 100 ? "rgb(8,38,29)" : undefined }}>{i + 1}</span>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
            {j.hifz ? (
              <div className="grid grid-cols-3 gap-2">
                <Num value={fillCw(t.darajaN, { n: j.hifz.grade })} label={t.darajat} />
                <Num value={j.hifz.quality !== null ? `${j.hifz.quality} %` : "–"} label={t.quality} />
                <Num value={nf.format(j.hifz.tests)} label={t.hifzTests} />
              </div>
            ) : null}
          </div>
        ) : hidden(j.memorised)}
      </Section>

      {/* Quran read (own, khatm plan of this browser) */}
      {own && (khatm?.pos ?? 0) > 0 ? (
        <Section title={t.sec_quran}>
          <div className="grid gap-2">
            <Num value={`${nf.format(pct1(khatm?.pos ?? 0, TOTAL_VERSES))} %`} label={t.quranRead} />
            <Bar frac={(khatm?.pos ?? 0) / TOTAL_VERSES} />
            {(khatm?.round ?? 1) > 1 ? <p className="text-[13.5px] font-semibold">{fillCw(t.khatmN, { n: (khatm?.round ?? 1) - 1 })}</p> : null}
            <p className="text-[12.5px] text-muted">{t.readHint}</p>
          </div>
        </Section>
      ) : null}

      {/* courses */}
      <Section title={t.sec_courses}>
        {j.courses ? (
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Num value={nf.format(j.courses.done)} label={t.coursesDone} />
              <Num value={nf.format(j.courses.qaida)} label={t.qaida} />
              <Num value={nf.format(j.courses.arabic)} label={t.arabic} />
              <Num value={nf.format(j.courses.rp)} label={t.reciterPath} />
            </div>
            {j.courses.arLevels.length ? <p className="flex flex-wrap items-center gap-2 text-[13.5px]"><span className="font-semibold">{t.arLevels}:</span>{j.courses.arLevels.map((l) => <Chip key={l} light>{l}</Chip>)}</p> : null}
          </div>
        ) : hidden(j.courses)}
      </Section>

      {/* exams and certificates */}
      <Section title={t.sec_exams}>
        {j.exams || j.certificates ? (
          <div className="grid gap-3">
            {j.exams ? (j.exams.length ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Num value={nf.format(j.exams.length)} label={t.examsPassed} />
                  <Num value={`${Math.max(...j.exams.map((x) => x.pct))} %`} label={t.bestScore} />
                </div>
                <ul className="grid gap-2">
                  {j.exams.slice(0, 6).map((x) => (
                    <li key={`${x.exam}:${x.ref}`} className="grid gap-1">
                      <div className="flex justify-between text-[13.5px]"><span className="font-semibold">{examName(x.exam, x.ref)}</span><span className="tabular-nums text-muted">{x.pct} %</span></div>
                      <Bar frac={x.pct / 100} />
                    </li>
                  ))}
                </ul>
              </>
            ) : <p className="text-[14px] text-muted">{t.noExams}</p>) : null}
            {j.certificates?.length ? (
              <div><p className="mb-1.5 text-[13.5px] font-semibold">{t.certificates}</p>
                <ul className="flex flex-wrap gap-2">{j.certificates.map((c) => <li key={c.url}><a href={c.url} className="inline-flex rounded-full border border-[rgb(var(--gold))]/50 px-3 py-1 text-[13px] font-semibold hover:bg-[rgb(var(--gold))]/10">{c.title} · {c.pct} %</a></li>)}</ul>
              </div>
            ) : null}
          </div>
        ) : hidden(j.exams)}
      </Section>

      {/* garden and stickers */}
      <Section title={t.sec_garden}>
        {j.tree || j.stickers ? (
          <div className="grid gap-3">
            {j.tree ? (
              <div className="grid grid-cols-3 gap-2">
                <Num value={fillCw(t.stageN, { n: j.tree.stage })} label={t.treeStage} />
                <Num value={nf.format(j.tree.trees)} label={t.trees} />
                <Num value={nf.format(j.tree.fruits)} label={t.fruits} />
              </div>
            ) : null}
            {j.stickers ? (
              <div className="grid gap-2">
                <div className="flex justify-between text-[13.5px]"><span className="font-semibold">{t.stickers}</span><span className="tabular-nums text-muted">{nf.format(j.stickers.total)} / {nf.format(j.stickers.catalog)}</span></div>
                <Bar frac={j.stickers.total / Math.max(1, j.stickers.catalog)} />
                <div className="grid grid-cols-4 gap-2">
                  <Num value={nf.format(j.stickers.rare)} label={t.rare} />
                  <Num value={nf.format(j.stickers.epic)} label={t.epic} />
                  <Num value={nf.format(j.stickers.legendaryN)} label={t.legendary} />
                  <Num value={nf.format(j.stickers.series.length)} label={t.seriesDone} />
                </div>
              </div>
            ) : null}
          </div>
        ) : hidden(j.tree)}
      </Section>

      {/* time learned */}
      <Section title={t.sec_time}>
        {j.time ? (
          <div className="grid grid-cols-2 gap-2">
            <Num value={fillCw(t.hoursN, { n: nf.format(Math.round(j.time.totalMin / 6) / 10) })} label={t.timeTotal} />
            <Num value={fillCw(t.minutesN, { n: nf.format(j.time.weekMin) })} label={t.timeWeek} />
          </div>
        ) : hidden(j.time)}
      </Section>

      {/* milestones */}
      <Section title={t.sec_milestones}>
        <Timeline s={s} t={t} locale={locale} />
      </Section>

      {/* you vs. them */}
      {!own && s.compare ? (
        <Section title={fillCw(t.compareTitle, { u: s.name })}>
          {s.compare.allowed && s.compare.me ? <Compare me={s.compare.me} them={s} t={t} nf={nf} /> : <p className="text-[14px] text-muted">{t.compareLocked}</p>}
        </Section>
      ) : null}

      {/* the best learners worldwide */}
      {top ? (
        <Section title={t.sec_top} action={<Link href={demo ? "/ranking/global?demo=stats" : "/ranking/global"} className="text-[14px] font-semibold text-accent hover:underline">{t.seeAll}</Link>}>
          <div className="grid gap-3 sm:grid-cols-2">
            {(["xp", "verses", "streak", "exams"] as BoardCat[]).map((c) => top[c]?.length ? (
              <div key={c} className="rounded-xl border border-line p-3">
                <p className="mb-2 text-[13px] font-bold text-[rgb(var(--gold))]">{t[c === "streak" ? "streakBest" : (`cat_${c}` as CwKey)]}</p>
                <ol className="grid gap-1.5">{top[c].map((r) => <TopRow key={r.username} r={r} locale={locale} nf={nf} unit={unitOf(c, t)} />)}</ol>
              </div>
            ) : null)}
          </div>
        </Section>
      ) : null}

      <p className="rounded-xl bg-[rgb(var(--gold))]/10 p-4 text-[13.5px] leading-relaxed">{t.humility}</p>
      <details className="rounded-xl border border-line p-4 text-[13.5px]">
        <summary className="cursor-pointer font-semibold">{t.tierInfo}</summary>
        <p className="mt-2 leading-relaxed text-muted">{t.tierText}</p>
        <p className="mt-2 leading-relaxed text-muted">{t.privacyNote}</p>
      </details>
      {sharing && s.career ? <ShareCareer s={s} t={t} locale={locale} tierName={tierName} verifiedLabel={verifiedLabel} since={since} onClose={() => setSharing(false)} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------- pieces
const pct1 = (n: number, of: number) => (of > 0 ? Math.min(100, Math.round((1000 * n) / of) / 10) : 0);
const monthName = (ym: string, locale: string) => {
  const [y, m] = ym.split("-").map(Number);
  try { return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, (m || 1) - 1, 1))); } catch { return ym; }
};
const examName = (exam: string, ref: string) => ({ juz: `Juz ${ref}`, surah: `Surah ${ref}`, "rp-level": `Reciter Path ${ref}`, "ar-unit": `Arabic ${ref}`, qbank: ref }[exam] ?? `${exam} ${ref}`);
const unitOf = (c: BoardCat, t: Tx) => ({ xp: t.u_xp, verses: t.u_verses, streak: t.u_days, exams: t.u_exams }[c]);

function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className={card}>
      <div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-[16px] font-bold">{title}</h3>{action}</div>
      {children}
    </section>
  );
}
function Chip({ children, light }: { children: ReactNode; light?: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${light ? "border border-line" : "border border-white/20 bg-white/10 text-white"}`}>{children}</span>;
}
function Big({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/[0.07] px-3 py-3 text-center ring-1 ring-white/10">
      <p className="font-display text-[26px] font-extrabold leading-tight tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[12.5px] text-white/65">{label}</p>
    </div>
  );
}
function Num({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[20px] font-extrabold tabular-nums">{value}</p>
      <p className="text-[12.5px] leading-snug text-muted">{label}</p>
    </div>
  );
}
function Bar({ frac, dark }: { frac: number; dark?: boolean }) {
  const w = `${Math.max(0, Math.min(100, frac * 100)).toFixed(1)}%`;
  return <div className={`h-2 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-line"}`} role="presentation"><div className="h-full rounded-full bg-[#c6a65e]" style={{ width: w }} /></div>;
}
function Place({ label, p, t, nf, country, locale }: { label: string; p: RankPos | undefined; t: Tx; nf: Intl.NumberFormat; country: string | null; locale: string }) {
  if (!p) return null;
  return (
    <div className="rounded-xl border border-line p-3">
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      {p.rank ? (
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[24px] font-extrabold tabular-nums">#{nf.format(p.rank)}</span>
          <span className="text-[13px] text-muted">{fillCw(t.ofN, { n: nf.format(p.total) })}</span>
          {p.pct ? <span className="rounded-full bg-[#c6a65e]/15 px-2 py-0.5 text-[12.5px] font-bold text-[rgb(var(--gold))]">{fillCw(t.topPct, { n: nf.format(p.pct) })}</span> : null}
        </div>
      ) : <p className="mt-1 text-[20px] font-extrabold">–</p>}
      {p.country && country ? <p className="mt-1 text-[13px]">{fillCw(t.inCountry, { c: countryName(country, locale) })}: <b className="tabular-nums">#{nf.format(p.country)}</b> {fillCw(t.ofN, { n: nf.format(p.countryTotal) })}</p> : null}
    </div>
  );
}
function TopRow({ r, locale, nf, unit }: { r: BoardRow; locale: string; nf: Intl.NumberFormat; unit: string }) {
  return (
    <li>
      <Link href={`/talents/${r.username}`} className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-accent-soft/40">
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12.5px] font-extrabold ${r.rank === 1 ? "bg-[#c6a65e] text-[rgb(8,38,29)]" : "bg-line"}`}>{r.rank}</span>
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[rgb(8,58,44)]">{r.avatar ? <img src={r.avatar} alt="" width={32} height={32} className="h-full w-full object-cover" /> /* eslint-disable-line @next/next/no-img-element */ : <DefaultAvatar />}</span>
        <span className="min-w-0 flex-1"><span className="flex items-center gap-1 truncate text-[14px] font-semibold">{r.name}{r.badge ? <BadgeIcon badge={r.badge} size={14} /> : null}</span>
          <span className="block truncate text-[12px] text-muted">{r.country ? countryName(r.country, locale) : ""}</span></span>
        {r.country ? <CountryBadge code={r.country} size={22} /> : null}
        <span className="shrink-0 text-[13px] font-bold tabular-nums">{nf.format(r.score)} <span className="font-medium text-muted">{unit}</span></span>
      </Link>
    </li>
  );
}

function Timeline({ s, t, locale }: { s: CareerStats; t: Tx; locale: string }) {
  const df = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const text = (m: { kind: string; ref: string; data: Record<string, unknown> }) => {
    const n = Number(m.data.n ?? m.data.pct ?? 0);
    switch (m.kind) {
      case "level": return fillCw(t.ms_level, { n });
      case "hifz": return fillCw(t.ms_hifz, { n });
      case "juz": return fillCw(t.ms_juz, { n });
      case "tree": return fillCw(t.ms_tree, { n });
      case "sticker": return m.ref.startsWith("S:") ? t.ms_series : t.ms_sticker;
      case "streak": return fillCw(t.ms_streak, { n });
      case "course": return m.data.arabic ? fillCw(t.ms_arabic, { n: String(m.data.arabic) }) : t.ms_course;
      case "certificate": return t.ms_certificate;
      case "exam": return fillCw(t.ms_exam, { n: Number(m.data.pct ?? 0) });
      default: return m.kind;
    }
  };
  const items = [...s.milestones.map((m) => ({ key: `${m.kind}:${m.ref}`, at: m.at, label: text(m) })),
    ...(s.memberSince ? [{ key: "joined", at: `${s.memberSince}-01T00:00:00Z`, label: t.ms_joined }] : [])];
  if (!items.length) return <p className="text-[14px] text-muted">{t.noMilestones}</p>;
  return (
    <ol className="relative grid gap-3 ps-5 before:absolute before:inset-y-1 before:start-[7px] before:w-px before:bg-[rgb(var(--gold))]/40">
      {items.map((x) => (
        <li key={x.key} className="relative">
          <span aria-hidden className="absolute -start-5 top-1.5 h-3.5 w-3.5 rotate-45 rounded-[3px] border-2 border-[#c6a65e] bg-surface" />
          <p className="text-[14.5px] font-semibold">{x.label}</p>
          <p className="text-[12.5px] text-muted">{x.key === "joined" ? monthName(s.memberSince!, locale) : df.format(new Date(x.at))}</p>
        </li>
      ))}
    </ol>
  );
}

function Compare({ me, them, t, nf }: { me: Side; them: Side; t: Tx; nf: Intl.NumberFormat }) {
  const rows: [string, number | null, number | null][] = [
    [t.careerScore, me.career?.score ?? null, them.career?.score ?? null],
    [t.cat_xp, me.sijill.level?.xp ?? null, them.sijill.level?.xp ?? null],
    [t.cat_verses, me.sijill.memorised?.verses ?? null, them.sijill.memorised?.verses ?? null],
    [t.streakBest, me.sijill.time?.best ?? null, them.sijill.time?.best ?? null],
    [t.cat_exams, me.sijill.exams?.length ?? null, them.sijill.exams?.length ?? null],
  ];
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between text-[13px] font-bold"><span>{t.you}</span><span>{them.name}</span></div>
      {rows.map(([label, a, b]) => {
        if (a === null || b === null) return null;
        const max = Math.max(1, a, b);
        return (
          <div key={label}>
            <p className="mb-1 text-center text-[12.5px] font-semibold text-muted">{label}</p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="flex h-2.5 justify-end overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-[#0F8A63]" style={{ width: `${(a / max) * 100}%` }} /></div>
              <span className="min-w-[110px] text-center text-[13px] font-bold tabular-nums">{nf.format(a)} · {nf.format(b)}</span>
              <div className="h-2.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-[#c6a65e]" style={{ width: `${(b / max) * 100}%` }} /></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ShareCareer({ s, t, locale, tierName, verifiedLabel, since, onClose }: { s: CareerStats; t: Tx; locale: string; tierName: string; verifiedLabel: string; since: string; onClose: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [format, setFormat] = useState<CardFormat>("post");
  const [busy, setBusy] = useState(true);
  const nf = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 });
  useEffect(() => {
    if (!ref.current || !s.career) return;
    setBusy(true);
    const place = [s.ranks?.xp?.rank ? `${t.worldwide} #${nf.format(s.ranks.xp.rank)}` : "", s.country ? countryName(s.country, locale) : ""].filter(Boolean).join("  ·  ");
    void drawCareerCard(ref.current, {
      name: s.name, username: s.username, avatar: s.avatar, verified: !!s.badge, verifiedLabel, tierLabel: tierName, career: s.career,
      pointsLabel: fillCw(t.pointsN, { n: nf.format(s.career.score) }), title: t.careerCard,
      stats: [
        { value: String(s.career.level.level), label: t.levelN.replace("{n}", "").trim() || "Level" },
        { value: s.sijill.memorised ? nf.format(s.sijill.memorised.verses) : "–", label: t.cat_verses },
        { value: s.sijill.time ? nf.format(s.sijill.time.best) : "–", label: t.streakBest },
        { value: s.ranks?.xp?.pct ? fillCw(t.topPct, { n: nf.format(s.ranks.xp.pct) }) : s.sijill.exams ? nf.format(s.sijill.exams.length) : "–", label: s.ranks?.xp?.pct ? t.worldwide : t.cat_exams },
      ],
      place, since, url: `quranmasterclass.com/${locale}/talents/${s.username}`,
    }, format).finally(() => setBusy(false));
  }, [format]); // eslint-disable-line react-hooks/exhaustive-deps
  const blob = () => new Promise<Blob | null>((res) => ref.current?.toBlob(res, "image/png") ?? res(null));
  const save = async () => {
    const b = await blob(); if (!b) return;
    const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `quran-masterclass-${s.username}-${CARD_PX[format].join("x")}.png`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const share = async () => {
    const b = await blob(); if (!b) return;
    const file = new File([b], `quran-masterclass-${s.username}.png`, { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: `${s.name} · Quran Masterclass` }).catch(() => undefined);
    else await save();
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={t.shareCard} className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="grid max-h-[92vh] w-full max-w-md gap-3 overflow-auto rounded-2xl bg-surface p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><h3 className="text-[17px] font-bold">{t.shareCard}</h3><button type="button" onClick={onClose} className="h-10 rounded-lg px-3 font-semibold text-muted">{t.close}</button></div>
        <div className="flex gap-2" role="radiogroup">
          {(["post", "story"] as CardFormat[]).map((f) => (
            <button key={f} type="button" role="radio" aria-checked={format === f} onClick={() => setFormat(f)}
              className={`h-10 flex-1 rounded-lg border text-[14px] font-semibold ${format === f ? "border-[#c6a65e] bg-[#c6a65e]/15" : "border-line"}`}>{f === "post" ? t.formatPortrait : t.formatStory}</button>
          ))}
        </div>
        <canvas ref={ref} aria-label={t.careerCard} className={`mx-auto w-full rounded-xl ${busy ? "opacity-60" : ""}`} style={{ aspectRatio: `${CARD_PX[format][0]} / ${CARD_PX[format][1]}`, maxHeight: "60vh", width: "auto" }} />
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => void share()} className="h-12 rounded-lg bg-[#c6a65e] font-bold text-[rgb(8,38,29)]">{t.share}</button>
          <button type="button" onClick={() => void save()} className="h-12 rounded-lg border border-line font-semibold">{t.download}</button>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-4 px-4 pb-6 pt-2" aria-busy="true">
      <div className="h-72 rounded-3xl bg-line/60" />
      <div className="h-32 rounded-2xl bg-line/50" />
      <div className="h-32 rounded-2xl bg-line/50" />
    </div>
  );
}
