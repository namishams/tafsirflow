"use client";
// mirrors mobile/src/features/garden/Collection.tsx
// The sticker collection (qmc.stickers2) on the website: every series with its progress and completion reward, search,
// filters, the stated odds and a grid that grows page by page (instead of the app's virtualised list). Every sticker
// carries its name (screen readers, the dialog, a caption under the ones still missing), the dialog says how a missing
// one is earned, and a sticker can be given to the tree right here, as in the app (same store, same daily limit).
import { useEffect, useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowBack } from "@/components/Icons";
import { useHydrated } from "@/lib/learn/store";
import { useLang } from "@/lib/learn/i18n";
import { readTradition, showsShia } from "@/lib/learn/tradition";
import { CATALOG_SIZE, RARITY_GP, RARITY_ODDS, SERIES, SERIES_SIZE, completionGp, countOf, isGiven, itemAt, itemById, rarityOf, seriesOwned, totalOwned, useCatalog, visibleSeasonal, type CatItem, type Rarity, type Series } from "@/lib/learn/garden/catalog";
import { activeTree, giveSticker, treeStage, useGarden } from "@/lib/learn/garden/garden";
import { fillG, stickerLabel, useGardenText, useStickerLabel } from "@/lib/learn/garden/texts";
import { useGiftText } from "@/lib/learn/garden/giftText";
import { useGardenPro, useGardenWebText } from "@/lib/learn/garden/web";
import { GoldButton, LearnMain, OutlineButton, Spinner } from "@/components/learn/ui";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";
import { CatalogArt, rarityColor } from "./CatalogArt";

type Filter = "all" | "owned" | "missing";
const PAGE = 120;

/** the second line of a sticker: the surah of a verse, the number of a surah or name, the Arabic of a prophet or month */
const subOf = (it: CatItem): string | undefined => it.sub ?? (it.ar && (it.series === "prophets" || it.series === "months") ? it.ar : undefined);
/** the caption under a missing sticker: the number of a name, the key of a verse, otherwise its name */
const captionOf = (it: CatItem, label: string) => (it.series === "names" ? it.sub ?? label : label);
/** the rarity as a small swatch in the rim colour (the colours stay on the art; text is always ink or muted) */
const Swatch = ({ r }: { r: Rarity }) => <span aria-hidden className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: rarityColor(r) }} />;

export function Collection() {
  const tx = useGardenText();
  const wt = useGardenWebText();
  const ft = useFeedTexts();
  const { lang } = useLang();
  const name = useStickerLabel();
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
      if (needle && !`${stickerLabel(it, lang)} ${it.label} ${it.sub ?? ""} ${it.ar ?? ""}`.toLowerCase().includes(needle)) continue;
      const own = countOf(it.id) > 0;
      if ((filter === "owned" && !own) || (filter === "missing" && own)) continue;
      out.push(it.id);
    }
    return out;
  }, [hydrated, series, filter, q, shia, lang, sel]); // eslint-disable-line react-hooks/exhaustive-deps
  const ownedEmpty = filter === "owned" && !q.trim();
  return (
    <>
      <section className="stage girih relative overflow-hidden text-white">
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-6">
          <Link href="/garden" className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-white/70 hover:text-white"><ArrowBack /> {wt.back}</Link>
          <h1 className="font-display mt-3 text-[36px] leading-tight sm:text-[44px]">{tx.album}</h1>
          <p className="mt-2 text-[16px] text-white/70">{hydrated ? fillG(tx.albumLead, { n: totalOwned(), m: CATALOG_SIZE }) : fillG(tx.albumLead, { n: "…", m: CATALOG_SIZE })}</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-white/60">{wt.collectionNote}</p>
          {/* the sticker album of the feed (milestones and rare stickers; the app's /feed-stickers) */}
          <Link href="/garden/album" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-[14px] font-semibold text-[rgb(214,180,108)] hover:underline">{ft.game.album} <span aria-hidden className="inline-block rtl:-scale-x-100">→</span></Link>
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
        {/* odds, clearly stated: packs are only earned, never bought (readable text, the rim colour as a small swatch) */}
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12.5px] text-muted">
          {RARITY_ODDS.map(([r, pct]) => <span key={r} className="inline-flex items-center gap-1.5"><Swatch r={r} />{tx[`r_${r}`]} {pct} % · +{RARITY_GP[r]}</span>)}
        </p>
        {!hydrated ? <div className="py-10"><Spinner /></div> : ids.length === 0 ? (
          <div className="grid gap-1.5 py-10 text-center">
            <p className="text-muted">{ownedEmpty ? tx.noneOwned : tx.noMatch}</p>
            {ownedEmpty ? <p className="text-[13.5px] text-muted">{tx[`earn_${series}`]}</p> : null}
          </div>
        ) : (
          <>
            <ul className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {ids.slice(0, shown).map((id) => {
                const n = countOf(id);
                const it = itemById(id);
                const label = it ? name(it) : id, sub = it ? subOf(it) : undefined;
                const caption = n === 0 ? (it ? captionOf(it, label) : "") : n > 1 ? `×${n}` : isGiven(id) ? "·" : "";
                return (
                  <li key={id}>
                    <button type="button" onClick={() => setSel(id)} aria-label={`${label}${sub ? `, ${sub}` : ""}, ${n ? fillG(tx.copies, { n }) : tx.missing}${isGiven(id) ? `, ${tx.given}` : ""}`}
                      className="flex w-full flex-col items-center rounded-lg p-1 transition hover:bg-accent-soft">
                      <span className="block aspect-square w-full [&>*]:!h-full [&>*]:!w-full [&_svg]:!h-full [&_svg]:!w-full"><CatalogArt id={id} size={96} locked={n === 0} /></span>
                      <span className="block h-4 max-w-full truncate text-[11px] text-muted">{caption}</span>
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
  const gx = useGiftText();
  const name = useStickerLabel();
  const pro = useGardenPro();
  const router = useRouter();
  const s = useGarden();
  useCatalog();
  const [msg, setMsg] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const n = countOf(id), r = rarityOf(id);
  const it = itemById(id);
  const tree = activeTree(s, pro);
  const label = it ? name(it) : id, sub = it ? subOf(it) : undefined;
  const canGive = n > 1 || (n === 1 && !isGiven(id));
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  const give = (unique: boolean) => {
    setConfirm(false);
    const res = giveSticker(id, unique, pro);
    if (!res) return;
    // nothing was spent: the tree has had all the sticker growth it takes today
    if (res.full) { setFull(true); setMsg(gx.capT); return; }
    const t = activeTree(s, pro);
    setMsg([fillG(tx.gp, { n: res.gp }), res.trait ? fillG(tx.traitNew, { t: (tx as unknown as Record<string, string>)[`tr_${res.trait}`] ?? res.trait }) : "", res.up && t ? fillG(tx.stageUp, { n: treeStage(t, pro) }) : ""].filter(Boolean).join(" · "));
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-6" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={label} className="grid w-full max-w-sm justify-items-center gap-2.5 rounded-2xl bg-bg p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <CatalogArt id={id} size={170} locked={n === 0} />
        <p className="text-center text-[16px] font-semibold">{label}{sub ? <span className={`block font-normal text-muted ${it?.ar && sub === it.ar ? "font-arabic text-[18px]" : "text-[13.5px]"}`} dir={it?.ar && sub === it.ar ? "rtl" : undefined}>{sub}</span> : null}</p>
        <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold"><Swatch r={r} />{tx[`r_${r}`]} · +{RARITY_GP[r]}</p>
        <p className="text-[14px] text-muted">{n ? fillG(tx.copies, { n }) : tx.missing}{isGiven(id) ? ` · ${tx.given}` : ""}</p>
        {n === 0 && it ? <p className="text-center text-[13.5px] leading-relaxed text-muted">{tx[`earn_${it.series}`]}</p> : null}
        {msg ? <p role="status" className="text-center text-[14px] font-semibold" style={{ color: full ? undefined : "rgb(var(--hm-gold-d))" }}>{msg}</p> : null}
        {canGive && !tree ? (
          <>
            <p className="text-center text-[13.5px] leading-relaxed text-muted">{tx.plantFirst}</p>
            <GoldButton className="w-full" onClick={() => { onClose(); router.push("/garden"); }}>{tx.plant}</GoldButton>
          </>
        ) : null}
        {tree && !full && n > 1 ? <GoldButton className="w-full" onClick={() => give(false)}>{`${tx.give} (${tx.dupes})`}</GoldButton> : null}
        {tree && !full && n === 1 && !isGiven(id) ? (
          confirm ? (
            <div className="grid w-full gap-2 rounded-xl border border-line p-3">
              <p className="text-[14px] font-semibold">{tx.confirmTitle}</p>
              <p className="text-[13px] leading-relaxed text-muted">{tx.confirmBody}</p>
              <div className="flex gap-2">
                <OutlineButton className="flex-1" onClick={() => setConfirm(false)}>{tx.cancel}</OutlineButton>
                <GoldButton className="flex-1" onClick={() => give(true)}>{tx.give}</GoldButton>
              </div>
            </div>
          ) : <OutlineButton className="w-full" onClick={() => setConfirm(true)}>{tx.give}</OutlineButton>
        ) : null}
        <OutlineButton className="w-full" onClick={onClose}>{tx.close}</OutlineButton>
      </div>
    </div>
  );
}
export default Collection;
