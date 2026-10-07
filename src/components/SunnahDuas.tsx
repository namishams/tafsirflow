"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SUNNAH_CATS, SUNNAH_DUAS, type SunnahCat } from "@/lib/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/lib/sunnahDuas2";
import AR_DUAS from "@/lib/pagecontent/ar/duas";
import { readJSON, writeJSON } from "@/lib/storage";
import { ArrowBack, ArrowNext, IconBook, IconBookmark, IconClose, IconCopy, IconSearch } from "./Icons";
import { PracticeStar, PracticeWindow } from "./art/PracticeArt";

const ALL = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];

// Arabic readers see the hadith collections by their Arabic names, not the Latin ones used in the data
const SRC_AR: [RegExp, string][] = [
  [/Sahih al-Bukhari/g, "صحيح البخاري"], [/Sahih Muslim/g, "صحيح مسلم"], [/Sunan Abi Dawud/g, "سنن أبي داود"],
  [/Jami[ʿ'’]? at-Tirmidhi/g, "جامع الترمذي"], [/Sunan an-Nasa[ʾ'’]?i/g, "سنن النسائي"], [/Sunan Ibn Majah/g, "سنن ابن ماجه"],
  [/ten times:/g, "عشر مرات:"], [/;/g, "؛"], [/,/g, "،"],
];
const srcAr = (src: string) => SRC_AR.reduce((x, [re, to]) => x.replace(re, to), src);

// Duas of the Prophet ﷺ: filter by occasion, search, favourites and a tap counter for repeated adhkar
export default function SunnahDuas() {
  const t = useTranslations("duas");
  const locale = useLocale();
  const [cat, setCat] = useState<SunnahCat | "all" | "fav">("all");
  const [q, setQ] = useState("");
  const [fav, setFav] = useState<string[]>([]);
  const [count, setCount] = useState<Record<string, number>>({});
  const [showTr, setShowTr] = useState(true);
  const [copied, setCopied] = useState("");
  const [read, setRead] = useState<number | null>(null);
  useEffect(() => { setFav(readJSON<string[]>("tf:duafav", [])); }, []);

  // Arabic readers read the dua itself; show only when to say it
  const meaning = (d: (typeof ALL)[number]) => (locale === "de" ? d.de : locale === "ar" ? AR_DUAS[d.id]?.when ?? "" : d.en);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL.filter((d) => (cat === "all" ? true : cat === "fav" ? fav.includes(d.id) : d.cat === cat))
      .filter((d) => !s || [d.ar, d.tr, d.en, d.de, d.src].some((x) => x.toLowerCase().includes(s)));
  }, [cat, q, fav]);

  const toggleFav = (id: string) => { const n = fav.includes(id) ? fav.filter((x) => x !== id) : [...fav, id]; setFav(n); writeJSON("tf:duafav", n); };
  const tap = (id: string, max: number) => setCount((c) => ({ ...c, [id]: (c[id] ?? 0) >= max ? 0 : (c[id] ?? 0) + 1 }));
  const ar = locale === "ar";
  const srcOf = (d: (typeof ALL)[number]) => (ar ? srcAr(d.src) : d.src);
  const copy = async (d: (typeof ALL)[number]) => {
    try { await navigator.clipboard.writeText([d.ar, ar ? "" : d.tr, meaning(d), `— ${srcOf(d)}`].filter(Boolean).join("\n\n")); setCopied(d.id); setTimeout(() => setCopied(""), 1800); } catch { /* clipboard blocked */ }
  };
  const ui = UI[locale === "de" ? "de" : locale === "ar" ? "ar" : "en"];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-56">
          <span aria-hidden className="pointer-events-none absolute inset-y-0 start-4 grid place-items-center text-gold"><IconSearch /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="h-12 w-full rounded-full border border-[rgb(var(--gold))]/30 bg-surface pe-4 ps-11 text-[15px] shadow-[0_8px_24px_-18px_rgba(201,166,94,.7)] focus:border-[rgb(201_166_94)] focus:outline-none" aria-label={t("search")} />
        </label>
        {!ar && <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={showTr} onChange={(e) => setShowTr(e.target.checked)} />{t("translit")}</label>}
        {list.length > 0 && <button onClick={() => setRead(0)} className="btn-gold inline-flex h-12 items-center gap-2 rounded-full px-5 text-sm font-bold"><IconBook />{ui.read}</button>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="pa-chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>{t("all")} · {ALL.length}</button>
        <button className="pa-chip" aria-pressed={cat === "fav"} onClick={() => setCat("fav")}><PracticeStar size={11} />{t("favs")}{fav.length ? ` · ${fav.length}` : ""}</button>
        {SUNNAH_CATS.map((c) => <button key={c} className="pa-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{t(`c_${c}`)}</button>)}
      </div>
      {list.length === 0 ? <p className="mt-6 text-sm text-muted">{cat === "fav" ? t("noFavs") : t("noResults")}</p> : (
        <ul className="mt-7 grid gap-5">
          {list.map((d, k) => {
            const n = count[d.id] ?? 0;
            const isFav = fav.includes(d.id);
            return (
              <li key={d.id} id={`dua-${d.id}`} className="pa-card px-5 pb-5 pt-6 sm:px-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gold rtl:tracking-normal"><PracticeStar size={10} />{t(`c_${d.cat}`)}</span>
                  <div className="-me-2 -mt-2 flex items-center gap-0.5 text-muted">
                    <button onClick={() => setRead(k)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[rgb(var(--gold))]/10 hover:text-ink" aria-label={ui.read} title={ui.read}><IconBook /></button>
                    <button onClick={() => copy(d)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-[rgb(var(--gold))]/10 hover:text-ink" aria-label={t("copy")} title={t("copy")}><IconCopy /></button>
                    <button onClick={() => toggleFav(d.id)} className={`grid h-10 w-10 place-items-center rounded-full hover:bg-[rgb(var(--gold))]/10 ${isFav ? "text-gold" : "hover:text-ink"}`} aria-pressed={isFav} aria-label={t("fav")} title={t("fav")}><IconBookmark filled={isFav} /></button>
                  </div>
                </div>
                <p className="font-arabic mt-3 text-[1.75rem] leading-[2.15] sm:text-[2rem]" dir="rtl" lang="ar">{d.ar}</p>
                {showTr && !ar && <p className="mt-3 text-[15px] italic leading-relaxed text-gold">{d.tr}</p>}
                {meaning(d) && <p className="mt-2 text-[15.5px] leading-relaxed text-ink/80">{meaning(d)}</p>}
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[rgb(var(--gold))]/20 pt-4">
                  <span className="text-xs font-semibold text-muted">{t("source")}: {srcOf(d)}</span>
                  {d.n && d.n > 1 && <Tasbih n={n} max={d.n} onTap={() => tap(d.id, d.n!)} label={t("counter")} />}
                </div>
                {copied === d.id && <p role="status" className="mt-2 text-xs text-accent">{t("copied")}</p>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs leading-relaxed text-muted">{t("sunnahNote")}</p>
      {read !== null && list[read] && (
        <Reader list={list} i={read} setI={setRead} close={() => setRead(null)} showTr={showTr && !ar} meaning={meaning} srcOf={srcOf} catLabel={(c) => t(`c_${c}`)} sourceLbl={t("source")}
          count={count} tap={tap} counterLbl={t("counter")} ui={ui} />
      )}
    </div>
  );
}

const UI = {
  de: { read: "Lesemodus", close: "Schließen", prev: "Vorherige", next: "Nächste" },
  en: { read: "Reading mode", close: "Close", prev: "Previous", next: "Next" },
  ar: { read: "وضع القراءة", close: "إغلاق", prev: "السابق", next: "التالي" },
};
type Dua = (typeof ALL)[number];

// tasbih counter: a ring of beads that fills with every tap
function Tasbih({ n, max, onTap, label, dark = false }: { n: number; max: number; onTap: () => void; label: string; dark?: boolean }) {
  const done = n >= max, C = 2 * Math.PI * 21;
  return (
    <button onClick={onTap} aria-label={`${label} ${n} / ${max}`} className={`pa-tasbih group inline-flex items-center gap-3 rounded-full py-1 pe-4 ps-1 text-sm font-bold tabular-nums ${dark ? "text-[#f3e2b6]" : ""} ${done ? "pa-tasbih-done" : ""}`}>
      <span className="relative grid h-12 w-12 place-items-center">
        <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
          <circle cx="24" cy="24" r="21" fill={done ? "rgb(201 166 94 / .16)" : "none"} stroke={dark ? "rgb(255 255 255 / .14)" : "rgb(var(--line))"} strokeWidth="3" />
          <circle cx="24" cy="24" r="21" fill="none" stroke="rgb(201 166 94)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${((Math.min(n, max) / max) * C).toFixed(1)} ${C.toFixed(1)}`} className="transition-[stroke-dasharray] duration-300" />
          {Array.from({ length: Math.min(max, 33) }, (_, k) => { const a = (Math.PI * 2 * k) / Math.min(max, 33); return <circle key={k} cx={(24 + 21 * Math.cos(a)).toFixed(2)} cy={(24 + 21 * Math.sin(a)).toFixed(2)} r="1" fill={dark ? "#fff" : "rgb(var(--surface))"} fillOpacity=".6" />; })}
        </svg>
        <span className={`relative text-[15px] ${done ? "text-gold" : ""}`}>{done ? "✓" : n}</span>
      </span>
      <span className={dark ? "text-white/70" : "text-muted"}>{n} / {max}</span>
    </button>
  );
}

// Reading mode: one dua at a time, large and calm, on the dark stage; arrows, swipe and the keyboard move on
function Reader({ list, i, setI, close, showTr, meaning, srcOf, catLabel, sourceLbl, count, tap, counterLbl, ui }: {
  list: Dua[]; i: number; setI: (n: number) => void; close: () => void; showTr: boolean; meaning: (d: Dua) => string; srcOf: (d: Dua) => string; catLabel: (c: string) => string; sourceLbl: string;
  count: Record<string, number>; tap: (id: string, max: number) => void; counterLbl: string; ui: (typeof UI)["de"];
}) {
  const d = list[i];
  const touch = useRef<number | null>(null);
  const go = (k: number) => setI(Math.max(0, Math.min(list.length - 1, k)));
  useEffect(() => {
    const rtl = document.documentElement.dir === "rtl";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(rtl ? i - 1 : i + 1);
      if (e.key === "ArrowLeft") go(rtl ? i + 1 : i - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }); // eslint-disable-line react-hooks/exhaustive-deps
  const swipe = (x: number) => {
    if (touch.current === null) return;
    const dx = x - touch.current; touch.current = null;
    if (Math.abs(dx) < 50) return;
    const rtl = document.documentElement.dir === "rtl";
    go((dx < 0) !== rtl ? i + 1 : i - 1);
  };
  return (
    <div role="dialog" aria-modal="true" aria-label={ui.read} className="stage fixed inset-0 z-[80] flex flex-col overflow-hidden text-[#eef0f3]" onTouchStart={(e) => { touch.current = e.touches[0].clientX; }} onTouchEnd={(e) => swipe(e.changedTouches[0].clientX)}>
      <PracticeWindow uid="dua-read" lamp className="pointer-events-none absolute left-1/2 top-1/2 h-[86vh] max-h-[760px] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.16]" />
      <div className="relative flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[rgb(var(--gold))] rtl:tracking-normal"><PracticeStar size={10} />{catLabel(d.cat)}</span>
        <span className="text-sm tabular-nums text-white/60">{i + 1} / {list.length}</span>
        <button onClick={close} aria-label={ui.close} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 hover:border-white/50"><IconClose /></button>
      </div>
      <div className="relative h-px bg-white/10"><div className="h-full bg-[rgb(214_180_108)] transition-all duration-500" style={{ width: `${((i + 1) / list.length) * 100}%` }} /></div>
      <div className="relative flex-1 overflow-y-auto overscroll-contain px-5 py-8 sm:py-12">
        <div key={d.id} className="pa-read-in mx-auto max-w-3xl text-center">
          <p className="font-arabic text-[30px] leading-[2.15] text-white sm:text-[40px]" dir="rtl" lang="ar">{d.ar}</p>
          {showTr && <p className="mx-auto mt-6 max-w-2xl text-[16px] italic leading-relaxed text-[rgb(233_207_153)]">{d.tr}</p>}
          {meaning(d) && <p className="mx-auto mt-4 max-w-2xl text-[17px] leading-relaxed text-white/80">{meaning(d)}</p>}
          <p className="mt-6 text-xs font-semibold text-white/50">{sourceLbl}: {srcOf(d)}</p>
          {d.n && d.n > 1 && <div className="mt-6 flex justify-center"><Tasbih n={count[d.id] ?? 0} max={d.n} onTap={() => tap(d.id, d.n!)} label={counterLbl} dark /></div>}
        </div>
      </div>
      <div className="relative flex items-center justify-center gap-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button onClick={() => go(i - 1)} disabled={i === 0} aria-label={ui.prev} className="grid h-14 w-14 place-items-center rounded-full border border-white/25 text-xl hover:border-white/60 disabled:opacity-25"><ArrowBack /></button>
        <span aria-hidden className="text-[rgb(214_180_108)]"><PracticeStar size={14} /></span>
        <button onClick={() => go(i + 1)} disabled={i >= list.length - 1} aria-label={ui.next} className="btn-gold grid h-14 w-14 place-items-center rounded-full text-xl disabled:opacity-40"><ArrowNext /></button>
      </div>
    </div>
  );
}
