"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getChapters, type Chapter } from "@/lib/quran";
import { readSrs } from "@/lib/learning";
import { levelOf, readPoints, totalPoints } from "@/lib/points";
import { HOUR_STICKERS, buildCtx, earnedIds, hoursOf, nextHourSticker, readSeen, stickerById, type StickerDef } from "@/lib/stickers";
import { fill, journeyText, markVisited, nextStep, readSnapshot, stationViews, type JourneyCatalog, type NextReason, type Snapshot, type StationId, type StationState, type StationView } from "@/lib/journey";
import { ArrowNext } from "./Icons";
import Sticker from "./Sticker";
import { LevelSeal } from "./Rewards";

// ---------- medallion: an eight-pointed star (two interlaced squares) inside a progress ring ----------
const GOLD = "rgb(var(--gold))";
function starPath(R: number, r: number, n = 8) {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (Math.PI / n) * i - Math.PI / 2, rad = i % 2 ? r : R;
    pts.push(`${(50 + rad * Math.cos(a)).toFixed(2)},${(50 + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}
const STAR = starPath(36, 27.6);
const RING = 2 * Math.PI * 46;

function StationIcon({ id }: { id: StationId }) {
  switch (id) {
    case "wudu": return <><path d="M50 33c6 7.5 10.5 13.2 10.5 18.8a10.5 10.5 0 0 1-21 0C39.5 46.2 44 40.5 50 33z" /><path d="M45 54.5a5.5 5.5 0 0 0 4.5 5" /></>;
    case "salah": return <><path d="M39.5 66V50.5c0-7 4.6-12.4 10.5-16.5 5.9 4.1 10.5 9.5 10.5 16.5V66" /><path d="M35 66h30" /><path d="M45.5 66v-9.5a4.5 4.5 0 0 1 9 0V66" /></>;
    case "arabic": return <text x="50" y="58" textAnchor="middle" fontSize="21" stroke="none" fill="currentColor" style={{ fontFamily: "Amiri, 'Scheherazade New', serif" }}>أ ب</text>;
    case "fatiha": return <><path d="M50 40c-5-3.5-11-4-16-2v23c5-2 11-1.5 16 2 5-3.5 11-4 16-2V38c-5-2-11-1.5-16 2z" /><path d="M50 40v23" /></>;
    case "tajweed": return <path d="M37 46.5v7M42.2 41v18M47.4 36v28M52.6 42v16M57.8 38v24M63 45.5v9" />;
    case "vocab": return <><path d="M45 35.5h15.5a2.5 2.5 0 0 1 2.5 2.5v19" /><rect x="37" y="40" width="20" height="25" rx="2.5" /><path d="M41.5 48h11M41.5 53.5h7.5" /></>;
    case "memo": return <><path d="M34 45l16-8 16 8-16 8z" /><path d="M34 52.5l16 8 16-8" /><path d="M34 60l16 8 16-8" /></>;
    case "duas": return <>{Array.from({ length: 11 }, (_, i) => { const a = (Math.PI * 2 * i) / 12 - Math.PI / 2 + Math.PI / 12; return <circle key={i} cx={(50 + 11 * Math.cos(a)).toFixed(2)} cy={(46 + 11 * Math.sin(a)).toFixed(2)} r="1.9" fill="currentColor" stroke="none" />; })}<path d="M50 57v8M46.5 68.5L50 65l3.5 3.5" /></>;
    case "islam": return <><path d="M50 30v5" /><path d="M42.5 35h15" /><path d="M41.5 39h17l-2.8 19c-1 5-10.4 5-11.4 0z" /><path d="M50 45c2.8 2.8 2.8 6.6 0 8.6-2.8-2-2.8-5.8 0-8.6z" /><path d="M43.5 66h13" /></>;
  }
}

export function Medallion({ id, state, pct, size = 64, rtl = false }: { id: StationId; state: StationState; pct: number | null; size?: number; rtl?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const done = state === "done";
  const open = state === "open" || (state === "progress" && pct === null);
  const icon = done ? "#f3e2b6" : state === "none" ? "rgb(var(--muted))" : GOLD;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className={done ? "drop-shadow-[0_6px_12px_rgba(0,0,0,.22)]" : ""}>
      <defs>
        <linearGradient id={`${uid}m`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e7bf" /><stop offset=".45" stopColor="#c9a65e" /><stop offset=".7" stopColor="#efe2bf" /><stop offset="1" stopColor="#8f7238" /></linearGradient>
        <radialGradient id={`${uid}e`} cx="38%" cy="32%" r="80%"><stop offset="0" stopColor="#1d5640" /><stop offset="1" stopColor="#0b261b" /></radialGradient>
      </defs>
      {/* ring: track + progress (mirrored in RTL so it fills in reading direction) */}
      <g transform={rtl ? "translate(100 0) scale(-1 1)" : undefined}>
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgb(var(--line))" strokeWidth="2" />
        {open && <circle cx="50" cy="50" r="46" fill="none" stroke={GOLD} strokeOpacity=".7" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 7.12" />}
        {!open && (pct ?? 0) > 0 && <circle cx="50" cy="50" r="46" fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(Math.min(1, pct ?? 0) * RING).toFixed(1)} ${RING.toFixed(1)}`} transform="rotate(-90 50 50)" />}
      </g>
      <path d={STAR} fill={done ? `url(#${uid}m)` : "rgb(var(--surface))"} stroke={done ? "#8f7238" : state === "none" ? "rgb(var(--muted) / .45)" : GOLD} strokeOpacity={done ? 0.5 : 1} strokeWidth={done ? 1 : 1.6} strokeLinejoin="round" />
      {done ? (
        <>
          <circle cx="50" cy="50" r="21" fill={`url(#${uid}e)`} stroke="#5c4519" strokeOpacity=".55" />
          <circle cx="50" cy="50" r="17.5" fill="none" stroke="#f3e2b6" strokeOpacity=".3" strokeWidth=".7" strokeDasharray="1 2.4" />
        </>
      ) : (
        <circle cx="50" cy="50" r="21" fill={state === "none" ? "none" : "rgb(var(--gold) / .09)"} stroke={state === "none" ? "rgb(var(--muted) / .25)" : "rgb(var(--gold) / .35)"} strokeWidth=".8" />
      )}
      <g transform="translate(50 50) scale(.8) translate(-50 -50)" stroke={icon} color={icon} fill="none" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <StationIcon id={id} />
      </g>
    </svg>
  );
}

// ---------- path geometry ----------
type Pt = { x: number; y: number };
const cubicLen = (a: Pt, c1: Pt, c2: Pt, b: Pt) => {
  let len = 0, px = a.x, py = a.y;
  for (let i = 1; i <= 24; i++) {
    const t = i / 24, u = 1 - t;
    const x = u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x;
    const y = u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y;
    len += Math.hypot(x - px, y - py); px = x; py = y;
  }
  return len;
};
// one segment between two station centres: an S-curve along a row, a wide turn at the end of a row, a straight line on phones
function segment(a: Pt, b: Pt, width: number, snake: boolean, cell: number): { d: string; len: number } {
  if (!snake) return { d: `L${b.x.toFixed(1)} ${b.y.toFixed(1)}`, len: Math.hypot(b.x - a.x, b.y - a.y) };
  const dx = b.x - a.x;
  if (Math.abs(dx) > 8) {
    const c1 = { x: a.x + dx / 2, y: a.y }, c2 = { x: b.x - dx / 2, y: b.y };
    return { d: `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, len: cubicLen(a, c1, c2, b) };
  }
  // turn: bulge outwards, but never beyond the container (a cubic reaches 3/4 of its control offset)
  const dir = a.x > width / 2 ? 1 : -1;
  const room = dir > 0 ? width - a.x : a.x;
  const k = (Math.max(8, Math.min(cell / 2, room) - 6)) / 0.75;
  const c1 = { x: a.x + dir * k, y: a.y }, c2 = { x: b.x + dir * k, y: b.y };
  return { d: `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`, len: cubicLen(a, c1, c2, b) };
}

// snake order on wide screens: row 1 runs in reading direction, row 2 comes back, row 3 runs again
const PLACE = [
  "md:col-start-1 md:row-start-1", "md:col-start-2 md:row-start-1 md:mt-10", "md:col-start-3 md:row-start-1",
  "md:col-start-3 md:row-start-2", "md:col-start-2 md:row-start-2 md:mt-10", "md:col-start-1 md:row-start-2",
  "md:col-start-1 md:row-start-3", "md:col-start-2 md:row-start-3 md:mt-10", "md:col-start-3 md:row-start-3",
];

const CSS = `
.jn-pulse { position: absolute; inset: 6%; border-radius: 9999px; pointer-events: none; box-shadow: 0 0 0 0 rgb(var(--gold) / .5); animation: jnPulse 2.8s cubic-bezier(.2,.7,.2,1) infinite; }
.jn-glow { position: absolute; inset: -18%; border-radius: 9999px; pointer-events: none; background: radial-gradient(circle, rgb(var(--gold) / .22) 0, transparent 65%); }
@keyframes jnPulse { 0% { box-shadow: 0 0 0 0 rgb(var(--gold) / .5); } 70%, 100% { box-shadow: 0 0 0 16px rgb(var(--gold) / 0); } }
.jn-draw { transition: stroke-dashoffset 2.2s cubic-bezier(.45,0,.2,1); }
@media (prefers-reduced-motion: reduce) { .jn-pulse { animation: none; box-shadow: 0 0 0 4px rgb(var(--gold) / .25); } .jn-draw { transition: none; } }
`;

function Legend({ T, rtl }: { T: ReturnType<typeof journeyText>; rtl: boolean }) {
  const items: [StationState, number | null][] = [["done", 1], ["progress", 0.4], ["none", 0], ["open", null]];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
      {items.map(([s, p]) => <li key={s} className="flex items-center gap-1.5"><Medallion id="wudu" state={s} pct={p} size={20} rtl={rtl} /><span>{T.legend[s as keyof typeof T.legend]}</span></li>)}
    </ul>
  );
}

export default function LearningJourney({ catalog }: { catalog: JourneyCatalog }) {
  const locale = useLocale();
  const rtl = locale === "ar" || locale === "fa" || locale === "ur" || locale === "ps";
  const T = journeyText(locale);
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: 0 }).format(n);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const load = () => setSnap(readSnapshot(catalog, readSrs()));
    load();
    getChapters(locale).then(setChapters).catch(() => undefined);
    const evs = ["tf-synced", "focus", "tf-points"];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, [catalog, locale]);

  const views = useMemo(() => (snap ? stationViews(snap, T, nf) : []), [snap, T]); // eslint-disable-line react-hooks/exhaustive-deps
  const next = snap ? nextStep(snap) : null;

  // ---- path through the medallions, measured from the real layout ----
  const wrap = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; d: string; total: number; target: number } | null>(null);
  const [drawn, setDrawn] = useState(false);
  const furthest = views.reduce((acc, v, i) => (v.state === "done" ? i : acc), -1);
  useEffect(() => {
    const el = wrap.current;
    if (!el || !views.length) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const pts: Pt[] = Array.from(el.querySelectorAll<HTMLElement>("[data-node]")).map((n) => { const b = n.getBoundingClientRect(); return { x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top }; });
      if (pts.length < 2) return;
      const snake = new Set(pts.map((p) => Math.round(p.x / 12))).size > 1;
      const cell = snake ? r.width / 3 : r.width;
      let d = `M${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      const lens: number[] = [];
      for (let i = 0; i + 1 < pts.length; i++) { const s = segment(pts[i], pts[i + 1], r.width, snake, cell); d += s.d; lens.push(s.len); }
      const total = lens.reduce((a, b) => a + b, 0);
      // gold up to the furthest completed station, and a little further into the next one by its progress
      let target = furthest > 0 ? lens.slice(0, furthest).reduce((a, b) => a + b, 0) : 0;
      const after = views[furthest + 1];
      if (furthest >= 0 && after && after.state === "progress" && after.pct) target += lens[furthest] * Math.min(0.85, after.pct);
      setGeo({ w: r.width, h: r.height, d, total, target });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => undefined);
    return () => ro.disconnect();
  }, [views, furthest]);
  // the gold line is drawn when the path comes into view
  const hasGeo = !!geo;
  useEffect(() => {
    const el = wrap.current;
    if (!hasGeo || drawn || !el) return;
    if (!("IntersectionObserver" in window)) { setDrawn(true); return; }
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { setDrawn(true); io.disconnect(); } }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [hasGeo, drawn]);

  if (!snap || !next) return <div className="h-[520px] animate-pulse rounded-xl bg-line/40" />;

  const doneN = views.filter((v) => v.state === "done").length;
  const progN = views.filter((v) => v.state === "progress").length;
  const nv = views.find((v) => v.id === next.id)!;
  const surahName = (s: number) => chapters.find((c) => c.id === s)?.name_simple ?? String(s);
  const reasonVars: Record<NextReason, Record<string, string | number>> = {
    due: { n: nf(snap.memo.due) }, wudu: {}, salah: {}, fatihaGoOn: { n: nf(snap.fatiha.learned) },
    arabicStart: { title: snap.arabic.next?.title ?? "" }, arabicGoOn: { title: snap.arabic.next?.title ?? "" }, fatiha: {},
    tajweed: { title: snap.tajweed.next?.title ?? "" }, tajweedGoOn: { title: snap.tajweed.next?.title ?? "" }, vocab: {},
    memo: { verse: fill(T.verseOf, { surah: surahName(snap.memo.next.surah), v: nf(snap.memo.next.verse) }) },
  };
  const nextHref = next.reason === "due" ? "/today" : nv.href;
  const nextCta = next.reason === "due" ? T.cta.dueNow : nv.cta;
  const visit = (id: StationId) => { if (id === "salah" || id === "islam") markVisited(id); };

  return (
    <div>
      <style>{CSS}</style>
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="eyebrow text-gold">{T.kicker}</p>
          <h2 className="font-display mt-3 max-w-3xl text-[28px] leading-[1.08] min-[380px]:text-[32px] sm:text-5xl">{T.title}</h2>
          <p className="mt-4 max-w-3xl text-[16px] leading-relaxed text-muted sm:text-[17px]">{T.lead}</p>
        </div>
        <div className="grid gap-3 lg:justify-items-end">
          <p className="text-sm font-semibold">{fill(T.summary, { d: nf(doneN), p: nf(progN) })}</p>
          <Legend T={T} rtl={rtl} />
        </div>
      </div>

      {/* the one next step */}
      <div className="callout mt-8 rounded-xl p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
          <div className="flex items-center gap-4 sm:block">
            <span className="relative inline-grid shrink-0 place-items-center">
              <span className="jn-glow" aria-hidden />
              <span className="jn-pulse" aria-hidden />
              <span className="block sm:hidden"><Medallion id={nv.id} state={nv.state} pct={nv.pct} size={60} rtl={rtl} /></span>
              <span className="hidden sm:block"><Medallion id={nv.id} state={nv.state} pct={nv.pct} size={80} rtl={rtl} /></span>
            </span>
            <p className="eyebrow text-gold sm:hidden">{T.nextLabel}</p>
          </div>
          <div className="min-w-0">
            <p className="eyebrow hidden text-gold sm:block">{T.nextLabel}</p>
            <h3 className="mt-1 text-xl font-bold leading-snug sm:text-2xl">
              {T.stations[nv.id].title}
              {locale !== "ar" && <span className="ms-3 inline-block"><span className="font-callig text-xl font-normal text-gold" dir="rtl" lang="ar">{T.stations[nv.id].ar}</span></span>}
            </h3>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">{fill(T.reason[next.reason], reasonVars[next.reason])}</p>
          </div>
          <Link href={nextHref} onClick={() => visit(nv.id)} className="btn-gold inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-center text-[15px] font-bold leading-snug sm:w-auto sm:px-6">{nextCta} <ArrowNext /></Link>
        </div>
      </div>

      {/* the path */}
      {/* no per-item scroll reveal here: it would shift the stations away from the measured path */}
      <ol ref={wrap} data-no-reveal className="relative mt-12 grid grid-cols-1 md:grid-cols-3 md:gap-x-4 md:gap-y-14">
        {geo && (
          <svg className="pointer-events-none absolute inset-0 overflow-visible" width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden>
            <path d={geo.d} fill="none" stroke="rgb(var(--muted) / .35)" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" />
            <path d={geo.d} fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round" className="jn-draw"
              strokeDasharray={`${geo.total.toFixed(1)} ${(geo.total + 10).toFixed(1)}`} strokeDashoffset={drawn ? (geo.total - geo.target).toFixed(1) : geo.total.toFixed(1)} />
          </svg>
        )}
        {views.map((v, i) => <StationItem key={v.id} v={v} i={i} T={T} locale={locale} rtl={rtl} isNext={v.id === next.id} place={PLACE[i]} last={i === views.length - 1} onVisit={visit} />)}
      </ol>
      <p className="mt-10 max-w-3xl text-xs leading-relaxed text-muted">{T.openNote}</p>
    </div>
  );
}

function StationItem({ v, i, T, locale, rtl, isNext, place, last, onVisit }: { v: StationView; i: number; T: ReturnType<typeof journeyText>; locale: string; rtl: boolean; isNext: boolean; place: string; last: boolean; onVisit: (id: StationId) => void }) {
  const s = T.stations[v.id];
  return (
    <li className={`relative flex gap-4 ${last ? "" : "pb-9"} md:flex-col md:items-center md:gap-3 md:pb-0 md:text-center ${place}`}>
      <span className="relative z-[1] grid shrink-0 place-items-center self-start rounded-full bg-[rgb(var(--surface))] md:self-center" data-node>
        {isNext && <><span className="jn-glow" aria-hidden /><span className="jn-pulse" aria-hidden /></>}
        <span className="block md:hidden"><Medallion id={v.id} state={v.state} pct={v.pct} size={60} rtl={rtl} /></span>
        <span className="hidden md:block"><Medallion id={v.id} state={v.state} pct={v.pct} size={78} rtl={rtl} /></span>
      </span>
      <div className="relative z-[1] min-w-0 flex-1 pt-1 md:max-w-[17rem] md:flex-none md:pt-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted md:justify-center rtl:text-xs rtl:tracking-normal">
          <span className="tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
          <span>{s.area}</span>
          {isNext && <span className="rounded-full border border-gold/50 bg-gold/10 px-2 py-0.5 text-[10px] tracking-[0.08em] text-gold rtl:tracking-normal">{T.nextBadge}</span>}
        </p>
        <h3 className="mt-1 text-[17px] font-bold leading-snug [overflow-wrap:anywhere]">
          {s.title}
          {locale !== "ar" && <span className="ms-2 inline-block"><span className="font-callig text-[15px] font-normal text-gold/80" dir="rtl" lang="ar">{s.ar}</span></span>}
        </h3>
        <p className={`mt-1 text-sm leading-snug ${v.state === "done" ? "font-semibold text-accent" : "text-ink/80"}`}>{v.status}</p>
        {v.detail && <p className="mt-1 text-xs leading-snug text-muted [overflow-wrap:anywhere]">{v.detail}</p>}
        <Link href={v.href} onClick={() => onVisit(v.id)} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline">{v.cta} <ArrowNext /></Link>
      </div>
    </li>
  );
}

// ---------- compact strip: level from points, latest stickers, the next hour sticker ----------
export function JourneyLevelStrip({ arabicTotal }: { arabicTotal: number }) {
  const t = useTranslations("rewards");
  const locale = useLocale();
  const T = journeyText(locale);
  const nf = (n: number) => new Intl.NumberFormat(locale, { numberingSystem: "latn", maximumFractionDigits: 0 }).format(n);
  const [v, setV] = useState<null | { total: number; latest: StickerDef[]; next: (typeof HOUR_STICKERS)[number] | null; hours: number; prevH: number }>(null);
  useEffect(() => {
    const load = () => {
      const ctx = buildCtx(arabicTotal);
      const earned = earnedIds(ctx), seen = readSeen();
      // newest first: earned but not yet celebrated, then in the order they were celebrated
      const order = [...earned.filter((id) => !seen.includes(id)).reverse(), ...seen.filter((id) => earned.includes(id)).reverse()];
      const latest = order.map((id) => stickerById(id)).filter((d): d is StickerDef => !!d).slice(0, 4);
      const next = nextHourSticker(ctx), hours = hoursOf(ctx);
      const i = next ? HOUR_STICKERS.indexOf(next) : HOUR_STICKERS.length;
      setV({ total: totalPoints(readPoints()), latest, next, hours, prevH: i > 0 ? HOUR_STICKERS[i - 1].h : 0 });
    };
    load();
    const evs = ["tf-points", "tf-listen", "tf-synced"];
    evs.forEach((e) => window.addEventListener(e, load));
    return () => evs.forEach((e) => window.removeEventListener(e, load));
  }, [arabicTotal]);
  if (!v) return <div className="mt-4 h-24 animate-pulse rounded-lg bg-white/5" />;
  const lvl = levelOf(v.total);
  const name = (d: StickerDef) => (locale === "ar" ? d.ar : t(`s_${d.id}`));
  return (
    <div className="mt-4 grid gap-4 rounded-lg border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-x-8 sm:p-5 lg:grid-cols-[auto_minmax(0,1fr)_auto_auto] lg:gap-6">
      <Link href="/stats" className="flex min-w-0 items-center gap-3" aria-label={t("toStats")}>
        <LevelSeal n={lvl.n} size={56} />
        <span className="min-w-0">
          <span className="font-callig inline-block text-2xl leading-tight text-[rgb(var(--gold))]" dir="rtl" lang="ar">{lvl.ar}</span>
          <span className="block text-sm font-semibold">{t("levelN", { n: lvl.n })}{locale !== "ar" ? ` · ${t(`l${lvl.n}`)}` : ""}</span>
        </span>
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap justify-between gap-x-3 text-xs text-white/65"><span>{t("points", { n: nf(v.total) })}</span><span>{t("toNext", { n: nf(Math.max(0, lvl.to - v.total)) })}</span></div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[rgb(var(--gold))] transition-[width] duration-1000" style={{ width: `${Math.round(lvl.pct * 100)}%` }} /></div>
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 rtl:tracking-normal">{T.strip.latest}</p>
        {v.latest.length ? (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">{v.latest.map((d) => <li key={d.id} title={name(d)}><Link href="/stats" aria-label={name(d)}><Sticker def={d} size={40} /></Link></li>)}</ul>
        ) : <p className="mt-1.5 max-w-[16rem] text-xs leading-snug text-white/60">{T.strip.none}</p>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 sm:justify-end sm:gap-x-6 sm:border-0 sm:pt-0 lg:block">
        {v.next && (
          <Link href="/stats" className="flex items-center gap-2.5">
            <Sticker def={v.next} size={44} locked pct={(v.hours - v.prevH) / (v.next.h - v.prevH)} />
            <span className="text-xs leading-snug text-white/65">{t("nextShort")}<b className="block text-sm text-white">{name(v.next)}</b>{t("hoursN", { n: nf(v.next.h) })}</span>
          </Link>
        )}
        <Link href="/stats" className="inline-flex items-center gap-1 text-sm font-semibold text-[rgb(var(--gold))] hover:underline lg:mt-2">{t("toStats")} <ArrowNext /></Link>
      </div>
    </div>
  );
}

