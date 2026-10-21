"use client";
// mirrors mobile/src/features/garden/Collection.tsx
// The sticker collection (qmc.stickers2), read-only on the website: every series with its progress and completion
// reward, search, filters, the stated odds and a grid that grows page by page (instead of the app's virtualised list).
// Not on the web: giving stickers to the tree (app only).
import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowBack } from "@/components/Icons";
import { useHydrated } from "@/lib/learn/store";
import { readTradition, showsShia } from "@/lib/learn/tradition";
import { CATALOG_SIZE, RARITY_GP, RARITY_ODDS, SERIES, SERIES_SIZE, completionGp, countOf, isGiven, itemAt, itemById, rarityOf, seriesOwned, totalOwned, useCatalog, visibleSeasonal, type Series } from "@/lib/learn/garden/catalog";
import { fillG, useGardenText } from "@/lib/learn/garden/texts";
import { useGardenWebText } from "@/lib/learn/garden/web";
import { LearnMain, OutlineButton, Spinner } from "@/components/learn/ui";
import { CatalogArt, rarityColor } from "./CatalogArt";

type Filter = "all" | "owned" | "missing";
const PAGE = 120;

export function Collection() {
  const tx = useGardenText();
  const wt = useGardenWebText();
  const hydrated = useHydrated();
  useCatalog();
  const [series, setSeries] = useState<Series>("names");
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [sel, setSel] = useState<string | null>(null);
  const shia = hydrated && showsShia(readTradition());
  useEffect(() => setShown(PAGE), [series, filter, q]);
  const ids = useMemo(() => {
    if (!hydrated) return [];
    const n = SERIES_SIZE[series];
    const out: string[] = [];
    const needle = q.trim().toLowerCase();
    for (let i = 0; i < n; i++) {
      const it = itemAt(series, i);
      if (series === "seasonal" && !visibleSeasonal(shia).includes(it.id.slice(2))) continue;
      if (needle && !`${it.label} ${it.sub ?? ""} ${it.ar ?? ""}`.toLowerCase().includes(needle)) continue;
      const own = countOf(it.id) > 0;
      if ((filter === "owned" && !own) || (filter === "missing" && own)) continue;
      out.push(it.id);
    }
    return out;
  }, [hydrated, series, filter, q, shia]);
  return (
    <>
      <section className="stage girih relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-6">
          <Link href="/garden" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"><ArrowBack /> {wt.back}</Link>
          <h1 className="font-display mt-3 text-[36px] leading-tight sm:text-[44px]">{tx.album}</h1>
          <p className="mt-2 text-[16px] text-white/70">{hydrated ? fillG(tx.albumLead, { n: totalOwned(), m: CATALOG_SIZE }) : fillG(tx.albumLead, { n: "…", m: CATALOG_SIZE })}</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/60">{wt.collectionNote}</p>
        </div>
      </section>
      <LearnMain wide>
        <div role="tablist" aria-label={tx.album} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
          {SERIES.map((se) => {
            const own = hydrated ? seriesOwned(se) : 0, size = se === "seasonal" ? visibleSeasonal(shia).length : SERIES_SIZE[se];
            const on = series === se;
            return (
              <button key={se} type="button" role="tab" aria-selected={on} onClick={() => setSeries(se)}
                className={`shrink-0 rounded-xl border px-3 py-2 text-start transition ${on ? "border-[rgb(var(--hm-gold))] bg-accent-soft" : "border-line bg-surface hover:border-[rgb(var(--hm-gold))]/60"}`}>
                <span className="block text-[13.5px] font-semibold">{tx[`ser_${se}`]}</span>
                <span className="block text-[11.5px] tabular-nums text-muted">{own} / {size}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[13px] text-muted">{fillG(tx.seriesReward, { n: completionGp(series) })}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={tx.search} aria-label={tx.search}
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-accent/40" />
          {(["all", "owned", "missing"] as Filter[]).map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-2 text-[13px] font-semibold transition ${filter === f ? "bg-accent text-white" : "hover:bg-accent-soft"}`}>
              {f === "all" ? tx.all : f === "owned" ? tx.owned : tx.missing}
            </button>
          ))}
        </div>
        {/* odds, clearly stated: packs are only earned, never bought */}
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px]">
          {RARITY_ODDS.map(([r, pct]) => <span key={r} style={{ color: rarityColor(r) }}>{tx[`r_${r}`]} {pct} % · +{RARITY_GP[r]}</span>)}
        </p>
        {!hydrated ? <div className="py-10"><Spinner /></div> : ids.length === 0 ? <p className="py-10 text-muted">{wt.noMatch}</p> : (
          <>
            <ul className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {ids.slice(0, shown).map((id) => {
                const n = countOf(id);
                const it = itemById(id);
                return (
                  <li key={id}>
                    <button type="button" onClick={() => setSel(id)} aria-label={`${it?.label ?? id}${it?.sub ? `, ${it.sub}` : ""}, ${n ? fillG(tx.copies, { n }) : tx.missing}`}
                      className="flex w-full flex-col items-center rounded-lg p-1 transition hover:bg-accent-soft">
                      <span className="block aspect-square w-full [&>*]:!h-full [&>*]:!w-full [&_svg]:!h-full [&_svg]:!w-full"><CatalogArt id={id} size={96} locked={n === 0} /></span>
                      <span className="h-4 text-[11px] text-muted">{n > 1 ? `×${n}` : isGiven(id) ? "·" : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {ids.length > shown ? <div className="mt-5 flex justify-center"><OutlineButton onClick={() => setShown((x) => x + PAGE)}>{wt.showMore}</OutlineButton></div> : null}
          </>
        )}
      </LearnMain>
      {sel ? <Detail id={sel} onClose={() => setSel(null)} /> : null}
    </>
  );
}

function Detail({ id, onClose }: { id: string; onClose: () => void }) {
  const tx = useGardenText();
  const n = countOf(id), r = rarityOf(id);
  const it = itemById(id);
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={it?.label ?? id} className="grid w-full max-w-sm justify-items-center gap-2.5 rounded-2xl bg-bg p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <CatalogArt id={id} size={170} locked={n === 0} />
        {it ? <p className="text-center text-[16px] font-semibold">{it.label}{it.sub ? <span className="block text-[13.5px] font-normal text-muted">{it.sub}</span> : null}</p> : null}
        <p className="text-[13px] font-semibold" style={{ color: rarityColor(r) }}>{tx[`r_${r}`]} · +{RARITY_GP[r]}</p>
        <p className="text-[14px] text-muted">{n ? fillG(tx.copies, { n }) : tx.missing}{isGiven(id) ? ` · ${tx.given}` : ""}</p>
        <OutlineButton className="w-full" onClick={onClose}>{tx.close}</OutlineButton>
      </div>
    </div>
  );
}
export default Collection;
