"use client";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SUNNAH_CATS, SUNNAH_DUAS, type SunnahCat } from "@/lib/sunnahDuas";
import { SUNNAH_DUAS_2 } from "@/lib/sunnahDuas2";
import AR_DUAS from "@/lib/pagecontent/ar/duas";
import { readJSON, writeJSON } from "@/lib/storage";
import { IconBookmark, IconCopy } from "./Icons";

const ALL = [...SUNNAH_DUAS, ...SUNNAH_DUAS_2];

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
  const copy = async (d: (typeof ALL)[number]) => {
    try { await navigator.clipboard.writeText(`${d.ar}\n\n${d.tr}\n\n${meaning(d)}\n\n— ${d.src}`); setCopied(d.id); setTimeout(() => setCopied(""), 1800); } catch { /* clipboard blocked */ }
  };
  const chip = (on: boolean) => `h-9 shrink-0 rounded-md border px-3 text-sm font-semibold ${on ? "border-ink bg-ink text-bg" : "border-line bg-surface hover:border-ink"}`;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3 text-[15px] focus:border-ink focus:outline-none" aria-label={t("search")} />
        <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" checked={showTr} onChange={(e) => setShowTr(e.target.checked)} />{t("translit")}</label>
      </div>
      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <button className={chip(cat === "all")} onClick={() => setCat("all")}>{t("all")} · {ALL.length}</button>
        <button className={chip(cat === "fav")} onClick={() => setCat("fav")}>★ {t("favs")}{fav.length ? ` · ${fav.length}` : ""}</button>
        {SUNNAH_CATS.map((c) => <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{t(`c_${c}`)}</button>)}
      </div>
      {list.length === 0 ? <p className="mt-6 text-sm text-muted">{cat === "fav" ? t("noFavs") : t("noResults")}</p> : (
        <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line">
          {list.map((d) => {
            const n = count[d.id] ?? 0;
            const isFav = fav.includes(d.id);
            return (
              <li key={d.id} id={`dua-${d.id}`} className="bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">{t(`c_${d.cat}`)}</span>
                  <div className="flex items-center gap-1 text-muted">
                    <button onClick={() => copy(d)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg hover:text-ink" aria-label={t("copy")} title={t("copy")}><IconCopy /></button>
                    <button onClick={() => toggleFav(d.id)} className={`grid h-9 w-9 place-items-center rounded-full hover:bg-bg ${isFav ? "text-gold" : "hover:text-ink"}`} aria-pressed={isFav} aria-label={t("fav")} title={t("fav")}><IconBookmark filled={isFav} /></button>
                  </div>
                </div>
                <p className="font-arabic mt-2 text-[1.7rem] leading-[2.1] sm:text-3xl" dir="rtl" lang="ar">{d.ar}</p>
                {showTr && <p className="mt-3 text-[15px] italic leading-relaxed text-gold">{d.tr}</p>}
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{meaning(d)}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3">
                  <span className="text-xs font-semibold text-muted">{t("source")}: {d.src}</span>
                  {d.n && d.n > 1 && (
                    <button onClick={() => tap(d.id, d.n!)} className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-bold tabular-nums ${n >= d.n ? "border-accent bg-accent text-white" : "border-line hover:border-ink"}`} aria-label={t("counter")}>
                      {n >= d.n ? "✓ " : ""}{n} / {d.n}
                    </button>
                  )}
                </div>
                {copied === d.id && <p role="status" className="mt-2 text-xs text-accent">{t("copied")}</p>}
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-6 text-xs leading-relaxed text-muted">{t("sunnahNote")}</p>
    </div>
  );
}
