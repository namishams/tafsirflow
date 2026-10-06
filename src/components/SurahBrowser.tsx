"use client";
import { IconFlame } from "./Icons";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Chapter } from "@/lib/quran";
import { readJSON, writeJSON } from "@/lib/storage";
import { dueVerses, readSrs, stats } from "@/lib/learning";
import { indexOf, juzOf } from "@/lib/quranIndex";
import { QuranPlaceIcon, QuranSegmented, QuranStar } from "./art/QuranArt";
import { JUZ, juzOfSurah, placeOf, type Place } from "./art/QuranMeta";

type Last = { chapter: number; verse: number };
type View = "surah" | "juz";
type Filter = "all" | Place;
const VIEW_KEY = "tf:quranView";

// light that follows the pointer over a tile
function light(e: React.PointerEvent) {
  if (e.pointerType !== "mouse") return;
  const el = (e.target as Element).closest<HTMLElement>(".q-tile");
  if (!el) return;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--x", `${Math.round(e.clientX - r.left)}px`);
  el.style.setProperty("--y", `${Math.round(e.clientY - r.top)}px`);
}

const Ribbon = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 12 16" className={`h-3.5 w-2.5 shrink-0 ${className}`}><path d="M1 0h10v15.5L6 11.8 1 15.5z" fill="currentColor" /></svg>
);

// The 114 surahs as illuminated tiles (or grouped by juz), with continue / review cards, bookmarks, search and filters
export default function SurahBrowser({ chapters }: { chapters: Chapter[] }) {
  const t = useTranslations("home");
  const tp = useTranslations("player");
  const tm = useTranslations("map");
  const tf = useTranslations("feedback");
  const locale = useLocale();
  const ar = locale === "ar";
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("surah");
  const [place, setPlace] = useState<Filter>("all");
  const [last, setLast] = useState<Last | null>(null);
  const [marks, setMarks] = useState<string[]>([]);
  const [due, setDue] = useState<string[]>([]);
  const [st, setSt] = useState({ streak: 0, todayCount: 0 });
  const [learned, setLearned] = useState<{ surah: Record<number, number>; juz: Record<number, number> }>({ surah: {}, juz: {} });

  useEffect(() => {
    const load = () => {
      setLast(readJSON<Last | null>("tf:last", null));
      setMarks(readJSON<string[]>("tf:bookmarks", []));
      setDue(dueVerses());
      setSt(stats());
      // verses in the review plan, counted per surah and per juz
      const surah: Record<number, number> = {}, juz: Record<number, number> = {};
      for (const k of Object.keys(readSrs())) {
        const [s, v] = k.split(":").map(Number);
        if (!(s >= 1 && s <= 114 && v >= 1)) continue;
        surah[s] = (surah[s] ?? 0) + 1;
        const j = juzOf(indexOf(s, v));
        juz[j] = (juz[j] ?? 0) + 1;
      }
      setLearned({ surah, juz });
    };
    load();
    if (readJSON<View>(VIEW_KEY, "surah") === "juz") setView("juz");
    window.addEventListener("tf-synced", load); // account data arrived
    return () => window.removeEventListener("tf-synced", load);
  }, []);
  const changeView = (v: View) => { setView(v); writeJSON(VIEW_KEY, v, true); };

  const byId = useMemo(() => new Map(chapters.map((c) => [c.id, c])), [chapters]);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return chapters.filter((c) => (place === "all" || placeOf(c) === place) && (!s || String(c.id) === s || c.name_simple.toLowerCase().includes(s) || c.translated_name.name.toLowerCase().includes(s) || c.name_arabic.includes(s)));
  }, [q, chapters, place]);
  const shown = useMemo(() => new Set(list.map((c) => c.id)), [list]);

  const lastChapter = last ? byId.get(last.chapter) : undefined;
  const pctOf = (c: Chapter) => ((learned.surah[c.id] ?? 0) / c.verses_count) * 100;
  const learnedTitle = (n: number, total: number) => (n > 0 ? tm("learnedOf", { n, total }) : undefined);
  const placeLabel = (p: Place) => <><QuranPlaceIcon place={p} />{t(p)}</>;
  const hasReview = st.streak > 0 || due.length > 0;

  return (
    <>
      {(lastChapter || hasReview) && (
        <div className={`grid gap-4 ${lastChapter && hasReview ? "lg:grid-cols-[1.15fr_0.85fr]" : ""}`}>
          {lastChapter && last && (
            <Link href={`/surah/${last.chapter}?v=${last.verse}`} className="q-continue stage group flex min-w-0 items-center gap-4 p-4 text-[#eef0f3] sm:gap-5 sm:p-5">
              <span className="q-window max-[359px]:!hidden"><span className="font-callig px-1 text-center text-[17px] leading-[1.35] text-[#e9cf99]" dir="rtl" lang="ar">{lastChapter.name_arabic}</span></span>
              <span className="min-w-0 flex-1">
                <span className="q-kicker block text-[rgb(var(--gold))]">{t("resume")}</span>
                <span className="font-display mt-1 block text-[17px] leading-snug sm:text-xl">{t("resumeAt", { surah: lastChapter.name_simple, verse: last.verse })}</span>
                <span className="mt-3 flex items-center gap-3">
                  <span className="q-bar min-w-0 flex-1"><i style={{ width: `${Math.min(100, (last.verse / lastChapter.verses_count) * 100)}%` }} /></span>
                  <span className="shrink-0 text-[12px] tabular-nums text-white/60" dir="ltr">{last.verse} / {lastChapter.verses_count}</span>
                </span>
              </span>
              <span className="q-play" aria-hidden><svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg></span>
            </Link>
          )}
          {hasReview && (
            <section className="callout flex min-w-0 flex-col justify-center gap-3 rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                {st.streak > 0 && <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgb(201_166_94/0.14)] px-3 py-1 font-semibold text-[rgb(var(--q-ink-gold))]"><IconFlame />{t("streak", { n: st.streak })}</span>}
                {st.todayCount > 0 && <span className="rounded-full border border-[rgb(201_166_94/0.35)] px-3 py-1 text-muted">{t("todayCount", { n: st.todayCount })}</span>}
              </div>
              {due.length > 0 ? (
                <Link href={`/surah/${due[0].split(":")[0]}?v=${due[0].split(":")[1]}&m=2&r=1`} className="flex flex-wrap items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="q-kicker block text-[rgb(var(--q-ink-gold))]">{t("review")}</span>
                    <span className="font-display mt-0.5 block text-xl leading-snug">{t("reviewDue", { n: due.length })}</span>
                  </span>
                  <span className="btn-gold inline-flex h-11 items-center gap-2 rounded-md px-5 text-[14px] font-bold">{t("reviewStart")}<svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
                </Link>
              ) : (
                <p className="text-sm text-muted">{t("reviewNone")}</p>
              )}
            </section>
          )}
        </div>
      )}

      {marks.length > 0 && (
        <section className="mt-6">
          <h2 className="q-kicker flex items-center gap-2 text-muted"><Ribbon className="text-[rgb(var(--gold))]" />{t("bookmarks")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {marks.map((k) => {
              const [s, v] = k.split(":");
              return (
                <Link key={k} href={`/surah/${s}?v=${v}`} className="q-chip">
                  <Ribbon className="text-[rgb(var(--gold))]" />
                  <span className="truncate">{byId.get(Number(s))?.name_simple ?? s}</span>
                  <span className="tabular-nums text-muted">{v}</span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className={`${lastChapter || hasReview || marks.length ? "mt-8" : ""} grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center`}>
        <label className="q-search">
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
          <span className="sr-only">{t("search")}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} />
        </label>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <QuranSegmented label={t("surahs")} value={view} onChange={changeView} options={[{ id: "surah", label: t("surahs") }, { id: "juz", label: tm("juz") }]} />
          <QuranSegmented label={`${t("makki")} / ${t("madani")}`} value={place} onChange={setPlace} options={[{ id: "all", label: tf("all") }, { id: "makki", label: placeLabel("makki") }, { id: "madani", label: placeLabel("madani") }]} />
        </div>
      </div>

      {view === "surah" ? (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" onPointerMove={light}>
          {list.map((c, i) => {
            const pct = pctOf(c), here = lastChapter?.id === c.id, p = placeOf(c);
            return (
              <li key={c.id} className="min-w-0">
                <Link href={`/surah/${c.id}`} title={learnedTitle(learned.surah[c.id] ?? 0, c.verses_count)} className={`q-tile q-tile-grid min-w-0 p-3 pe-3.5 ${i < 18 ? "q-in" : ""} ${here ? "is-here" : ""}`} style={i < 18 ? ({ "--i": i } as React.CSSProperties) : undefined}>
                  <svg aria-hidden viewBox="0 0 92 72" preserveAspectRatio="xMidYMax meet" className="q-tile-arch h-[calc(100%-14px)]"><g fill="none" stroke="currentColor" strokeWidth="1"><path d="M6 72V36C6 18 26 7 46 2c20 5 40 16 40 34v36" /><path d="M14 72V38c0-13 15-22 32-27 17 5 32 14 32 27v34" /></g></svg>
                  {here && <span aria-hidden className="q-ribbon" />}
                  <QuranStar n={c.id} pct={pct} className="q-g-star" />
                  {ar ? <span className="q-g-name font-callig block truncate text-[21px] leading-[1.45]" dir="rtl">{c.name_simple}</span>
                    : <span className="q-g-name block truncate text-[15.5px] font-bold leading-tight">{c.name_simple}</span>}
                  {c.translated_name.name && <span className="q-g-sub mt-0.5 block truncate text-[12.5px] text-muted">{c.translated_name.name}</span>}
                  <span className="q-g-meta q-meta mt-1.5">
                    <span className="q-place">{placeLabel(p)}</span>
                    {!ar && <span className="tabular-nums">{c.verses_count} {t("verses")}</span>}
                    <span className="tabular-nums">{tp("juz")} {juzOfSurah(c.id)}</span>
                  </span>
                  {ar ? <span className="q-g-ar q-g-count"><b className="tabular-nums">{c.verses_count}</b><span>{t("verses")}</span></span>
                    : <span className="q-g-ar q-tile-ar font-callig truncate" dir="rtl" lang="ar">{c.name_arabic}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-6 columns-1 gap-4 md:columns-2 lg:columns-3">
          {JUZ.map((j) => {
            const parts = j.parts.filter((p) => shown.has(p.s));
            if (!parts.length) return null;
            const n = learned.juz[j.n] ?? 0;
            return (
              <article key={j.n} className="q-juz">
                <header className="q-juz-head flex items-center gap-3 px-4 py-3" title={learnedTitle(n, j.total)}>
                  <QuranStar n={j.n} pct={(n / j.total) * 100} />
                  <span className="min-w-0 flex-1">
                    <span className="font-display block text-lg leading-tight">{tp("juz")} {j.n}</span>
                    <span className="mt-0.5 block text-[12px] tabular-nums text-white/60" dir="ltr">{j.from} – {j.to}</span>
                  </span>
                  <span className="shrink-0 text-[12px] tabular-nums text-white/60">{j.total} {t("verses")}</span>
                </header>
                <ul>
                  {parts.map((p) => {
                    const c = byId.get(p.s);
                    const whole = p.from === 1 && p.to === (c?.verses_count ?? p.to);
                    return (
                      <li key={p.s}>
                        <Link href={`/surah/${p.s}${p.from > 1 ? `?v=${p.from}` : ""}`} className="q-juz-row">
                          <span className="w-7 shrink-0 text-end text-[12px] font-semibold tabular-nums text-[rgb(var(--q-ink-gold))]">{p.s}</span>
                          <span className="min-w-0 flex-1">
                            <span className={ar ? "font-callig block truncate text-[18px] leading-[1.5]" : "block truncate text-[14px] font-semibold"} dir={ar ? "rtl" : undefined}>{c?.name_simple ?? p.s}</span>
                            <span className="block text-[11.5px] tabular-nums text-muted" dir={whole ? undefined : "ltr"}>{whole ? `${p.to} ${t("verses")}` : `${p.from}–${p.to}`}</span>
                          </span>
                          {!ar && c && <span className="font-callig shrink-0 text-[18px] leading-[1.5] text-ink/75" dir="rtl" lang="ar">{c.name_arabic}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      )}
      {list.length === 0 && <p className="py-10 text-center text-muted">{t("noResults")}</p>}
    </>
  );
}
