"use client";
// mirrors mobile/src/features/garden/GiftFlow.tsx
// "Nourish your tree": the gift flow of the garden on the website, the same flow and texts as the app (click instead
// of tap and drag). A full-height sheet on deep emerald with gold: the tree in a small vignette, today's room for
// sticker growth as twelve gold drops, a live preview of the growth and of the declining value of each further sticker,
// the learner's stickers grouped (duplicates first, then the only copies by rarity) with filters, a tray of the chosen
// stickers, then the gift: each sticker rises from the tray and flies into the tree as golden light (the tree glows,
// the counter grows; a short vibration where the device has one), and a summary with a shareable moment. Under
// prefers-reduced-motion: no flight, a simple fade. The growth rules are giveSticker's (garden.ts, unchanged).
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { useGamify } from "@/lib/learn/feed/gamify";
import { MAX_STAGE, activeTree, giftOutlook, giveSticker, progressOf, seasonNow, treeStage, useGarden, type Garden, type Trait, type Tree } from "@/lib/learn/garden/garden";
import { itemById, useCatalog, type Rarity } from "@/lib/learn/garden/catalog";
import { fillG, useAgeText, useGardenText, type GardenText } from "@/lib/learn/garden/texts";
import { useGiftText, type GiftText } from "@/lib/learn/garden/giftText";
import { RARITY_ORDER, allDuplicates, feedDef, giftInventory, ordered, pickedOf, previewOf, readyToGive, untilReset, type GiftItem, type GiftSeries, type Pick } from "@/lib/learn/garden/gift";
import { useGardenPro } from "@/lib/learn/garden/web";
import { StickerArt } from "@/components/learn/journey/Seal";
import { CatalogArt } from "./CatalogArt";
import { TREE_W, TreeArt, geom } from "./Tree";
import { useReducedMotion } from "./Scene";

const CREAM = "#f3e2b6", GOLD = "rgb(214,180,108)", INK = "rgb(8,38,29)";
const GLOW: Record<Rarity, string | null> = {
  legendary: "radial-gradient(circle, rgba(243,213,138,0.55) 0%, rgba(233,207,153,0.22) 55%, rgba(233,207,153,0) 72%)",
  epic: "radial-gradient(circle, rgba(214,180,108,0.34) 0%, rgba(214,180,108,0.1) 55%, rgba(214,180,108,0) 72%)",
  rare: "radial-gradient(circle, rgba(95,201,160,0.3) 0%, rgba(95,201,160,0.08) 55%, rgba(95,201,160,0) 72%)",
  common: null,
};
const DOT: Record<Rarity, string> = { legendary: "#e9cf99", epic: "#c6a65e", rare: "#5fc9a0", common: "rgba(243,226,182,0.45)" };
const STAGGER = 380, FLIGHT = 820;
const CSS = `
.gf-sheet{animation:gf-up .42s cubic-bezier(.22,1,.36,1) both}
.gf-sheet.gf-out{animation:gf-down .3s cubic-bezier(.55,0,1,.45) both}
@keyframes gf-up{from{transform:translateY(100%)}to{transform:none}}
@keyframes gf-down{from{transform:none}to{transform:translateY(100%)}}
.gf-back{animation:gf-fade .42s ease-out both}
.gf-back.gf-out{animation:gf-fade .3s ease-in reverse both}
@keyframes gf-fade{from{opacity:0}to{opacity:1}}
.gf-in{animation:gf-fade .42s ease-out both}
.gf-pop{animation:gf-pop .38s cubic-bezier(.34,1.56,.64,1)}
@keyframes gf-pop{0%{transform:scale(1)}35%{transform:scale(1.18)}100%{transform:scale(1)}}
.gf-scroll{scrollbar-width:none}.gf-scroll::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion: reduce){.gf-sheet,.gf-sheet.gf-out,.gf-pop{animation:gf-fade .18s ease-out both}.gf-sheet.gf-out{animation-direction:reverse}}
`;

type Phase = "pick" | "giving" | "done";
type Given = { id: string; gp: number; trait: Trait | null; up: boolean };
type Flight = { key: string; id: string; sx: number; sy: number; tx: number; ty: number; delay: number };


/** the entry on the garden page: a gold button with today's room and the duplicates ready to give */
export function NourishButton({ onClick }: { onClick: () => void }) {
  const gt = useGiftText();
  const s = useGarden();
  useGamify(); // re-render when the feed duplicates change
  useCatalog();
  const o = giftOutlook(s, []);
  const ready = readyToGive();
  const sub = o.room <= 0 ? gt.capT : ready > 0 ? `${fillG(gt.leftToday, { n: o.room, m: o.cap })} · ${fillG(gt.readyN, { n: ready })}` : fillG(gt.leftToday, { n: o.room, m: o.cap });
  return (
    <button type="button" onClick={onClick} aria-label={`${gt.nourish}. ${sub}`} aria-haspopup="dialog"
      className="flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-start transition hover:brightness-105 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(214,180,108)] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(8,38,29)]"
      style={{ background: "linear-gradient(135deg, #dcc48c, #c6a65e)", borderColor: "rgba(255,244,214,0.55)", color: INK }}>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border" style={{ backgroundColor: "rgba(8,38,29,0.12)", borderColor: "rgba(8,38,29,0.22)" }}><BagIcon size={24} color={INK} /></span>
      <span className="min-w-0 flex-1">
        <span className="font-display block truncate text-[17px]">{gt.nourish}</span>
        <span className="mt-0.5 block text-[12.5px] font-semibold" style={{ color: "rgba(8,38,29,0.72)" }}>{sub}</span>
      </span>
      <span className="flex items-end gap-0.5" aria-hidden>{Array.from({ length: 4 }, (_, i) => <DropShape key={i} size={9} state={i < Math.ceil((o.room / o.cap) * 4) ? "deep" : "spentDark"} />)}</span>
    </button>
  );
}

/** the small sticker bag beside the tree in the scene, with the number of duplicates ready to give */
export function StickerBag({ onClick }: { onClick: () => void }) {
  const gt = useGiftText();
  useGamify(); // re-render when the feed duplicates change
  const s = useGarden();
  useCatalog();
  const ready = readyToGive();
  const room = giftOutlook(s, []).room;
  return (
    <button type="button" onClick={onClick} aria-label={ready > 0 ? `${gt.bag}. ${fillG(gt.readyN, { n: ready })}` : gt.bag} aria-haspopup="dialog" title={gt.bag}
      className="relative grid h-[46px] w-[46px] place-items-center rounded-full border transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(214,180,108)]"
      style={{ backgroundColor: "rgba(8,38,29,0.62)", borderColor: "rgba(233,207,153,0.65)", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
      <BagIcon size={22} color={CREAM} />
      {ready > 0 && room > 0 ? (
        <span className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border px-1 text-[11px] font-bold" style={{ backgroundColor: "#e3c98a", borderColor: "#fff4d6", color: INK }}>{ready > 99 ? "99+" : ready}</span>
      ) : null}
    </button>
  );
}

/** the gift flow itself: a dialog above the page */
export function GiftFlow({ onClose }: { onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<Flow onClose={onClose} />, document.body);
}

function Flow({ onClose }: { onClose: () => void }) {
  const gt = useGiftText();
  const tx = useGardenText();
  const ageTx = useAgeText();
  const pro = useGardenPro();
  const reduce = useReducedMotion();
  const s = useGarden();
  const gm = useGamify();
  const cat = useCatalog();
  const tree = activeTree(s, pro);

  // ---------- the dialog: slide in and out, Escape, focus, no page scroll behind ----------
  const [out, setOut] = useState(false);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const close = () => { if (out) return; setOut(true); setTimeout(onClose, reduce ? 170 : 300); };
  const closeRef = useRef(close);
  closeRef.current = close;
  const [confirm, setConfirm] = useState<GiftItem | null>(null);
  const confirmRef = useRef(confirm);
  confirmRef.current = confirm;
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); if (confirmRef.current) setConfirm(null); else closeRef.current(); } };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = overflow; before?.focus?.(); };
  }, []);

  // ---------- what can be given ----------
  const dupKey = Object.entries(gm.dupes ?? {}).join(",");
  const ownKey = Object.keys(gm.stickers).length;
  const inv = useMemo(() => giftInventory(s, gm.stickers), [cat.at, s.at, s.given.length, dupKey, ownKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [series, setSeries] = useState<GiftSeries | "all">("all");
  const [picks, setPicks] = useState<Pick[]>([]);
  const [later, setLater] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [given, setGiven] = useState<Given[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [shown, setShown] = useState(0);
  const [snap, setSnap] = useState<{ room: number; given: number } | null>(null);
  const [nudge, setNudge] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [shared, setShared] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const schedule = (f: () => void, ms: number) => { timers.current.push(setTimeout(f, ms)); };

  const match = (it: GiftItem) => (rarity === "all" || it.rarity === rarity) && (series === "all" || it.series === series);
  const dupes = inv.dupes.filter(match), unique = inv.unique.filter(match);
  const present = useMemo(() => ({
    rarities: RARITY_ORDER.filter((r) => inv.dupes.some((x) => x.rarity === r) || inv.unique.some((x) => x.rarity === r)),
    series: Array.from(new Set([...inv.dupes, ...inv.unique].map((x) => x.series))),
  }), [inv]);
  const base = giftOutlook(s, []);
  const look = previewOf(s, picks);
  const room = phase === "pick" ? base.room : snap?.room ?? base.room;
  const emptyAll = !inv.dupes.length && !inv.unique.length;
  const nameOf = (id: string) => { if (feedDef(id)) return gt.feedSeries; const it = itemById(id); return it ? [it.label, it.sub].filter(Boolean).join(", ") : id; };

  // ---------- choosing ----------
  const add = (it: GiftItem) => {
    const next = [...picks, { id: it.id, unique: it.unique, base: it.base }];
    if (previewOf(s, next).fits < next.length) { setNote(gt.full); return; }
    setNote(null); setLater(0); setPicks(next);
  };
  const onTile = (it: GiftItem) => {
    const n = pickedOf(picks, it.id), max = it.unique ? 1 : it.dupes;
    if (n >= max) { setPicks(picks.filter((p) => p.id !== it.id)); setNote(null); setLater(0); return; } // all of it chosen: a click takes it back
    if (it.unique) { setConfirm(it); return; }
    add(it);
  };
  const removeOne = (id: string) => { const i = picks.map((p) => p.id).lastIndexOf(id); if (i < 0) return; setNote(null); setLater(0); setPicks(picks.filter((_, k) => k !== i)); };
  const giveAll = () => { const r = allDuplicates(s, inv.dupes); if (!r.picks.length) { setNote(gt.full); return; } setNote(null); setPicks(r.picks); setLater(r.later); };

  // ---------- giving ----------
  const scrollRef = useRef<HTMLDivElement>(null), anchorRef = useRef<HTMLSpanElement>(null), trayRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef(new Map<string, HTMLElement | null>());
  const buzz = () => { try { if (!reduce) navigator.vibrate?.(8); } catch { /* no vibration */ } };
  const give = () => {
    if (!picks.length || phase !== "pick" || !tree) return;
    const list = ordered(picks);
    setSnap({ room: base.room, given: base.givenToday });
    scrollRef.current?.scrollTo({ top: 0 });
    trayRef.current?.scrollTo({ left: 0 });
    const a = anchorRef.current?.getBoundingClientRect();
    const chips = new Map<string, { x: number; y: number }>();
    for (const id of new Set(list.map((p) => p.id))) { const r = chipRefs.current.get(id)?.getBoundingClientRect(); if (r) chips.set(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); }
    // the gifts themselves, all at once (the animation only shows what already happened)
    const done: Given[] = [];
    for (const p of list) {
      const r = giveSticker(p.id, p.unique, pro);
      if (!r) continue;
      if (r.full) break;
      done.push({ id: p.id, gp: r.gp, trait: r.trait, up: r.up });
    }
    setGiven(done);
    setPicks([]); setLater(0); setNote(null);
    if (!done.length) { setNote(gt.full); return; }
    if (reduce || !a) { setShown(done.reduce((x, g) => x + g.gp, 0)); setPhase("done"); return; }
    const gap = done.length > 8 ? Math.max(150, Math.round(2800 / done.length)) : STAGGER;
    const vw = window.innerWidth, vh = window.innerHeight;
    setFlights(done.map((g, i) => { const c = chips.get(g.id) ?? { x: vw / 2, y: vh - 90 }; return { key: `${i}-${g.id}`, id: g.id, sx: Math.min(vw - 28, Math.max(28, c.x)), sy: c.y, tx: a.left + a.width / 2, ty: a.top + a.height / 2, delay: i * gap }; }));
    setShown(0);
    setPhase("giving");
    flight.current = { out: done, sum: 0, n: 0, done: false };
    // the arrivals come from the flights themselves (in step with what is seen); a late safety net closes the flight
    schedule(finish, (done.length - 1) * gap + FLIGHT + 4000);
  };
  /** one light has reached the crown: the tree glows and rustles, the counter grows */
  const flight = useRef<{ out: Given[]; sum: number; n: number; done: boolean } | null>(null);
  const arrive = (i: number) => {
    const f = flight.current;
    if (!f || f.done || !f.out[i]) return;
    f.sum += f.out[i].gp; f.n++;
    setShown(f.sum); setNudge((n) => n + 1); setPulse((n) => n + 1); buzz();
    if (f.n >= f.out.length) schedule(finish, 650);
  };
  const finish = () => {
    const f = flight.current;
    if (!f || f.done) return;
    f.done = true;
    setFlights([]); setShown(f.out.reduce((x, g) => x + g.gp, 0)); setPhase("done");
  };
  const again = () => { setPhase("pick"); setGiven([]); setSnap(null); setShown(0); setShared(null); };
  const total = given.reduce((x, g) => x + g.gp, 0);
  const share = async () => {
    const text = fillG(gt.shareMsg, { n: total }), url = "https://quranmasterclass.com/app";
    try {
      if (navigator.share) { await navigator.share({ title: tx.title, text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`); setShared(gt.copied);
    } catch { /* the learner closed the share sheet */ }
  };
  const nextLine = (t: Tree): string => {
    const p = progressOf(t, pro);
    if (p.held) return tx.held;
    if (p.stage >= MAX_STAGE) return tx.maxed;
    return [p.wait > 0 ? ageTx(p.age, p.wait).wait : "", p.left > 0 ? fillG(tx.next, { n: p.left }) : ""].filter(Boolean).join(" · ");
  };

  const picking = phase === "pick" && base.room > 0 && !emptyAll;
  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-labelledby="gf-title">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className={`gf-back absolute inset-0${out ? " gf-out" : ""}`} style={{ backgroundColor: "rgba(2,14,10,0.62)" }} onClick={close} aria-hidden />
      <div className={`gf-sheet absolute inset-x-0 bottom-0 top-2 mx-auto flex w-full max-w-[760px] flex-col overflow-hidden rounded-t-[26px] border border-b-0 sm:bottom-6 sm:top-6 sm:rounded-[26px] sm:border-b${out ? " gf-out" : ""}`}
        style={{ borderColor: "rgba(214,180,108,0.4)", background: "linear-gradient(180deg, #0f4a39 0%, #072a20 45%, #041a13 100%)", color: CREAM }}>
        <div className="flex justify-center pt-2" aria-hidden><span className="h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(243,226,182,0.35)" }} /></div>
        <div ref={scrollRef} className="gf-scroll min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: picking ? 200 : 24 }}>
          <Hero gt={gt} tree={tree} s={s} pro={pro} reduce={reduce} anchorRef={anchorRef} nudge={nudge} pulse={pulse} closeBtn={closeBtn} onClose={close} closeLabel={tx.close} growthLabel={tx.growth}
            phase={phase} total={phase === "pick" ? look.total : shown} picks={picks.length} cap={base.cap} room={room} chosen={phase === "pick" ? look.total : 0} consumed={phase === "pick" ? 0 : shown}
            givenToday={phase === "pick" ? base.givenToday : snap?.given ?? base.givenToday} fits={phase === "pick" ? look.fits : given.length} />
          {picking ? (
            <>
              <Filters gt={gt} tx={tx} rarities={present.rarities} series={present.series} rarity={rarity} setRarity={setRarity} seriesSel={series} setSeries={setSeries} />
              <Section title={gt.ready} lead={gt.readyLead} count={dupes.reduce((x, d) => x + d.dupes, 0)}
                action={dupes.length ? <button type="button" onClick={giveAll} className="flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition hover:bg-[rgba(214,180,108,0.22)]" style={{ borderColor: GOLD, backgroundColor: "rgba(214,180,108,0.1)" }}><SparkIcon size={13} color={CREAM} />{gt.giveAll}</button> : null}
                extra={later > 0 ? <p className="text-[12.5px] font-semibold" style={{ color: GOLD }}>{fillG(gt.later, { n: later })}</p> : null} />
              {dupes.length ? <Grid items={dupes} picks={picks} tx={tx} gt={gt} nameOf={nameOf} onTile={onTile} /> : inv.dupes.length ? <NoMatch gt={gt} /> : <NoDupes gt={gt} />}
              {inv.unique.length ? (
                <>
                  <Section title={gt.album} lead={gt.albumLead} count={unique.length} />
                  {unique.length ? RARITY_ORDER.map((r) => {
                    const its = unique.filter((x) => x.rarity === r);
                    return its.length ? (
                      <div key={r}>
                        <h4 className="flex items-center gap-2 px-4 pb-1 pt-2.5 text-[12.5px] font-semibold" style={{ color: "rgba(243,226,182,0.8)" }}>
                          <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: DOT[r] }} aria-hidden />{tx[`r_${r}`]}
                          <span className="font-normal" style={{ color: "rgba(255,255,255,0.6)" }}>{its.length}</span>
                          <span className="h-px flex-1" style={{ backgroundColor: "rgba(214,180,108,0.3)" }} aria-hidden />
                        </h4>
                        <Grid items={its} picks={picks} tx={tx} gt={gt} nameOf={nameOf} onTile={onTile} />
                      </div>
                    ) : null;
                  }) : <NoMatch gt={gt} />}
                </>
              ) : null}
            </>
          ) : null}
          {phase === "pick" && base.room <= 0 ? <CapNote gt={gt} cap={base.cap} onDone={close} /> : null}
          {phase === "pick" && base.room > 0 && emptyAll ? <EmptyAll gt={gt} /> : null}
          {phase === "done" ? (
            <Summary gt={gt} tx={tx} given={given} next={tree ? nextLine(tree) : ""} tree={tree} pro={pro} shared={shared}
              canMore={giftOutlook(s, []).room > 0 && (inv.dupes.length > 0 || inv.unique.length > 0)} onShare={share} onMore={again} onDone={close} />
          ) : null}
        </div>
        {picking || phase === "giving" ? (
          <Tray gt={gt} tx={tx} picks={picks} total={look.total} phase={phase} note={note} trayRef={trayRef} chipRefs={chipRefs.current} nameOf={nameOf} onRemove={removeOne} onGive={give} />
        ) : null}
        {confirm ? <Confirm gt={gt} it={confirm} name={nameOf(confirm.id)} onYes={() => { const it = confirm; setConfirm(null); add(it); }} onNo={() => setConfirm(null)} /> : null}
      </div>
      {flights.map((f, i) => <Flyer key={f.key} f={f} onArrive={() => arrive(i)} />)}
    </div>
  );
}

// ---------- the top: the tree, the counter, the drops and the declining value ----------
function Hero({ gt, tree, s, pro, reduce, anchorRef, nudge, pulse, closeBtn, onClose, closeLabel, growthLabel, phase, total, picks, cap, room, chosen, consumed, givenToday, fits }: {
  gt: GiftText; tree: Tree | null; s: Garden; pro: boolean; reduce: boolean; anchorRef: React.RefObject<HTMLSpanElement | null>; nudge: number; pulse: number;
  closeBtn: React.RefObject<HTMLButtonElement | null>; onClose: () => void; closeLabel: string; growthLabel: string;
  phase: Phase; total: number; picks: number; cap: number; room: number; chosen: number; consumed: number; givenToday: number; fits: number;
}) {
  const vh = 184;
  const st = tree ? treeStage(tree, pro) : 0;
  const { size, top, crownY } = vignette(tree?.type ?? "olive", st, vh);
  const th = size * 1.2;
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pulse || reduce) return;
    glowRef.current?.animate([{ opacity: 1, transform: "scale(1.05)" }, { opacity: 0.5, transform: "scale(0.95)" }], { duration: 860, easing: "ease-out", fill: "forwards" });
  }, [pulse, reduce]);
  const left = Math.max(0, room - consumed);
  // a gift can add a decoration to the record's list in place: a new list when it changes, so the tree shows it at once
  const traits = useMemo(() => [...s.traits], [s.traits.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const base = phase === "pick" ? (picks ? 0.75 : 0.35) : 0.5;
  return (
    <div className="grid gap-3 px-4">
      <div className="flex items-center gap-2.5 pt-1.5">
        <h2 id="gf-title" className="font-display min-w-0 flex-1 truncate text-[24px]">{gt.nourish}</h2>
        <button ref={closeBtn} type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel}
          className="grid h-9 w-9 place-items-center rounded-full border transition hover:bg-[rgba(243,226,182,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(214,180,108)]" style={{ backgroundColor: "rgba(243,226,182,0.08)", borderColor: "rgba(243,226,182,0.25)" }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth={2.2} strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className="relative overflow-hidden rounded-[22px] border" style={{ height: vh, borderColor: "rgba(214,180,108,0.35)", background: "linear-gradient(180deg, #155a45, #0a3528 55%, #06251c)" }}>
        <div ref={glowRef} aria-hidden className="pointer-events-none absolute" style={{ left: "50%", top: crownY - 110, width: 220, height: 220, marginLeft: -110, opacity: base, transition: "opacity .5s", background: "radial-gradient(circle, rgba(255,230,166,0.55) 0%, rgba(255,217,138,0.16) 55%, rgba(255,217,138,0) 70%)" }} />
        <svg aria-hidden width={150} height={vh - 18} viewBox="0 0 150 166" className="pointer-events-none absolute" style={{ left: "50%", marginLeft: -75, top: 18 }}>
          <path d="M8 166V70C8 34 40 8 75 2c35 6 67 32 67 68v96" fill="rgba(255,236,190,0.035)" stroke="rgba(214,180,108,0.32)" strokeWidth={1} />
          <path d="M18 166V73c0-30 26-52 57-58 31 6 57 28 57 58v93" fill="none" stroke="rgba(214,180,108,0.16)" strokeWidth={0.8} />
        </svg>
        <div aria-hidden className="absolute rounded-full" style={{ left: "50%", marginLeft: -70, width: 140, bottom: 6, height: 16, backgroundColor: "rgba(0,0,0,0.22)" }} />
        {tree ? (
          <div className="absolute" style={{ left: "50%", marginLeft: -size / 2, top, width: size, height: th }} role="img" aria-label={tree.name}>
            <TreeArt id={tree.id} type={tree.type} stage={st} traits={traits} season={seasonNow()} size={size} still={reduce} nudge={nudge} />
          </div>
        ) : null}
        <span ref={anchorRef} aria-hidden className="pointer-events-none absolute" style={{ left: "50%", marginLeft: -1, top: crownY - 1, width: 2, height: 2 }} />
        <div className="absolute end-3.5 top-3 text-end" aria-live="polite">
          <Counter value={total} dim={phase === "pick" && !picks} reduce={reduce} />
          <p className="text-[11.5px] font-semibold" style={{ color: "rgba(243,226,182,0.75)" }}>{growthLabel}</p>
          {phase === "pick" && picks ? <p className="text-[11px]" style={{ color: "rgba(243,226,182,0.55)" }}>{gt.withPick}</p> : null}
        </div>
      </div>
      <div className="grid gap-1.5">
        <div className="flex items-center gap-2.5">
          <Drops cap={cap} left={left} chosen={phase === "pick" ? chosen : 0} />
          <p className="min-w-0 flex-1 truncate text-end text-[12.5px] font-semibold">{fillG(gt.leftToday, { n: left, m: cap })}</p>
        </div>
        <div className="flex items-center gap-3">
          <Decline given={givenToday} chosen={fits} />
          <p className="min-w-0 flex-1 text-[12px] leading-4" style={{ color: "rgba(255,255,255,0.6)" }}>{gt.decline}</p>
        </div>
      </div>
    </div>
  );
}

/** the tree in the vignette: as large as its stage allows (a young tree is drawn larger), the basin on the ground,
 *  and the point in the crown the light flies to */
function vignette(type: Parameters<typeof geom>[0], st: number, vh: number) {
  const g = geom(type, st);
  const topY = st < 3 ? 250 : g.top - g.crown * 0.5, visible = 330 - topY;
  const size = Math.min(300, Math.max(140, (vh - 34) * TREE_W / visible));
  const k = size / TREE_W, top = vh - 10 - 330 * k;
  return { size, top, crownY: top + (st < 3 ? 296 : g.top + g.crown * 0.55) * k };
}

function Counter({ value, dim, reduce }: { value: number; dim: boolean; reduce: boolean }) {
  const first = useRef(true);
  const [n, setN] = useState(0);
  useEffect(() => { if (first.current) { first.current = false; return; } if (!reduce) setN((x) => x + 1); }, [value, reduce]);
  return <p key={n} className={`font-display text-[34px] leading-[38px]${n ? " gf-pop" : ""}`} style={{ color: dim ? "rgba(233,207,153,0.45)" : "#f1d79a", textShadow: dim ? "none" : "0 0 10px rgba(255,217,138,0.45)" }}>{`+${value}`}</p>;
}

function Drops({ cap, left, chosen }: { cap: number; left: number; chosen: number }) {
  const free = Math.max(0, left - chosen);
  return <span className="flex gap-[3px]" aria-hidden>{Array.from({ length: cap }, (_, i) => <DropShape key={i} size={12} state={i < free ? "full" : i < left ? "chosen" : "spent"} />)}</span>;
}
function DropShape({ size, state }: { size: number; state: "full" | "chosen" | "spent" | "deep" | "spentDark" }) {
  const fill = state === "full" ? "#e3c98a" : state === "chosen" ? "rgba(241,215,154,0.16)" : state === "deep" ? "rgba(8,38,29,0.75)" : "none";
  const stroke = state === "spent" ? "rgba(243,226,182,0.22)" : state === "spentDark" ? "rgba(8,38,29,0.35)" : state === "deep" ? "rgba(8,38,29,0.9)" : state === "chosen" ? "#f1d79a" : "#f6e7bf";
  return (
    <svg width={size} height={size * 1.33} viewBox="0 0 12 16" aria-hidden>
      <path d="M6 1.2C6 1.2 1.6 6.7 1.6 10.1a4.4 4.4 0 0 0 8.8 0C10.4 6.7 6 1.2 6 1.2Z" fill={fill} stroke={stroke} strokeWidth={state === "chosen" ? 1.4 : 1.1} strokeDasharray={state === "chosen" ? "2 1.4" : undefined} />
      {state === "full" ? <path d="M4.2 9.6a1.9 1.9 0 0 0 1.4 2.3" stroke="#fff7e0" strokeWidth={0.9} strokeLinecap="round" fill="none" /> : null}
      {state === "chosen" ? <circle cx={6} cy={10.2} r={1.7} fill="#f1d79a" /> : null}
    </svg>
  );
}
function Decline({ given, chosen }: { given: number; chosen: number }) {
  const n = Math.min(10, Math.max(6, given + chosen + 1));
  return (
    <span className="flex h-[26px] items-end gap-[3px]" aria-hidden>
      {Array.from({ length: n }, (_, k) => {
        const h = Math.max(3, Math.round(24 / (1 + k))), past = k < given, sel = !past && k < given + chosen;
        return <span key={k} className="block w-[7px] rounded-[2px]" style={{ height: h, backgroundColor: past ? "rgba(243,226,182,0.22)" : sel ? "#e3c98a" : "transparent", border: past || sel ? "none" : "1px solid rgba(243,226,182,0.4)" }} />;
      })}
    </span>
  );
}

// ---------- filters and sections ----------
function Filters({ gt, tx, rarities, series, rarity, setRarity, seriesSel, setSeries }: {
  gt: GiftText; tx: GardenText; rarities: Rarity[]; series: GiftSeries[]; rarity: Rarity | "all"; setRarity: (r: Rarity | "all") => void; seriesSel: GiftSeries | "all"; setSeries: (s: GiftSeries | "all") => void;
}) {
  const label = (x: GiftSeries) => (x === "feed" ? gt.feedSeries : tx[`ser_${x}`]);
  return (
    <div className="grid gap-2 pt-3.5">
      <div className="gf-scroll flex gap-2 overflow-x-auto px-4" role="group">
        {(["all", ...rarities] as (Rarity | "all")[]).map((r) => <Chip key={r} on={rarity === r} label={r === "all" ? gt.all : tx[`r_${r}`]} dot={r === "all" ? undefined : r} onClick={() => setRarity(r)} />)}
      </div>
      {series.length > 1 ? (
        <div className="gf-scroll flex gap-2 overflow-x-auto px-4" role="group">
          {(["all", ...series] as (GiftSeries | "all")[]).map((x) => <Chip key={x} on={seriesSel === x} label={x === "all" ? gt.allSeries : label(x)} onClick={() => setSeries(x)} quiet />)}
        </div>
      ) : null}
    </div>
  );
}
function Chip({ on, label, onClick, dot, quiet }: { on: boolean; label: string; onClick: () => void; dot?: Rarity; quiet?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 font-semibold transition hover:border-[rgb(214,180,108)] ${quiet ? "py-1.5 text-[12px]" : "py-[7px] text-[12.5px]"}`}
      style={{ borderColor: on ? GOLD : "rgba(243,226,182,0.22)", backgroundColor: on ? "rgba(214,180,108,0.2)" : "rgba(255,255,255,0.03)", color: on ? CREAM : "rgba(243,226,182,0.75)" }}>
      {dot ? <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: DOT[dot] }} aria-hidden /> : null}{label}
    </button>
  );
}
function Section({ title, lead, count, action, extra }: { title: string; lead: string; count: number; action?: ReactNode; extra?: ReactNode }) {
  return (
    <div className="grid gap-0.5 px-4 pb-2 pt-5">
      <div className="flex items-center gap-2.5">
        <h3 className="font-display min-w-0 flex-1 text-[18px]">{title}{count ? <span className="ms-2 text-[14px] font-semibold" style={{ color: "rgba(243,226,182,0.6)" }}>{count}</span> : null}</h3>
        {action}
      </div>
      <p className="text-[12.5px] leading-[17px]" style={{ color: "rgba(255,255,255,0.6)" }}>{lead}</p>
      {extra}
    </div>
  );
}

/** a grid that grows while it is scrolled (the album can hold hundreds of only copies) */
function Grid({ items, picks, tx, gt, nameOf, onTile }: { items: GiftItem[]; picks: Pick[]; tx: GardenText; gt: GiftText; nameOf: (id: string) => string; onTile: (it: GiftItem) => void }) {
  const [n, setN] = useState(48);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = end.current;
    if (!el || n >= items.length) return;
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) setN((v) => v + 48); }, { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [n, items.length]);
  return (
    <>
      <div className="grid grid-cols-4 gap-2 px-4 py-1 sm:grid-cols-6">
        {items.slice(0, n).map((it) => <Tile key={it.id} it={it} picked={pickedOf(picks, it.id)} name={nameOf(it.id)} rarityLabel={tx[`r_${it.rarity}`]} gt={gt} onClick={() => onTile(it)} />)}
      </div>
      {n < items.length ? <div ref={end} className="h-6" aria-hidden /> : null}
    </>
  );
}
function Tile({ it, picked, name, rarityLabel, gt, onClick }: { it: GiftItem; picked: number; name: string; rarityLabel: string; gt: GiftText; onClick: () => void }) {
  const def = it.feed ? feedDef(it.id) : null;
  const glow = GLOW[it.rarity];
  const label = [name, rarityLabel, it.unique ? gt.onlyCopy : fillG(gt.dupesN, { n: it.dupes }), `+${it.base}`].join(", ");
  return (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={picked > 0} title={name}
      className="relative flex flex-col items-center rounded-2xl border px-1 pb-1 pt-1.5 transition hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(214,180,108)]"
      style={{ borderColor: picked ? GOLD : "transparent", backgroundColor: picked ? "rgba(214,180,108,0.12)" : undefined }}>
      <span className="relative grid aspect-square w-full place-items-center">
        {glow ? <span aria-hidden className="absolute inset-[-8%] rounded-full" style={{ background: glow }} /> : null}
        <span className="relative block w-[88%]" style={{ aspectRatio: "1" }}>
          <ArtFill id={it.id} def={def} />
        </span>
      </span>
      {!it.unique && it.dupes > 0 ? <span className="absolute end-0.5 top-0.5 rounded-full border px-1.5 text-[10.5px] font-bold leading-[16px]" style={{ backgroundColor: "rgba(4,26,19,0.88)", borderColor: "rgba(214,180,108,0.6)" }}>{`×${it.dupes}`}</span> : null}
      {picked ? (
        <span className="absolute start-0.5 top-0.5 grid h-5 w-5 place-items-center rounded-full border text-[11px] font-bold" style={{ backgroundColor: "#e3c98a", borderColor: "#fff4d6", color: INK }} aria-hidden>
          {picked > 1 ? picked : <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
        </span>
      ) : null}
      <span className="mt-0.5 text-[11px] font-semibold" style={{ color: picked ? CREAM : "rgba(243,226,182,0.6)" }}>{`+${it.base}`}</span>
    </button>
  );
}
/** the art at the size of its box (the art components take a pixel size) */
function ArtFill({ id, def }: { id: string; def: ReturnType<typeof feedDef> }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.round(el.clientWidth)));
    ro.observe(el); setW(Math.round(el.clientWidth));
    return () => ro.disconnect();
  }, []);
  return <span ref={ref} className="absolute inset-0 grid place-items-center">{w ? (def ? <StickerArt def={def} size={w} /> : <CatalogArt id={id} size={w} />) : null}</span>;
}

// ---------- the tray of chosen stickers ----------
function Tray({ gt, tx, picks, total, phase, note, trayRef, chipRefs, nameOf, onRemove, onGive }: {
  gt: GiftText; tx: GardenText; picks: Pick[]; total: number; phase: Phase; note: string | null; trayRef: React.RefObject<HTMLDivElement | null>; chipRefs: Map<string, HTMLElement | null>;
  nameOf: (id: string) => string; onRemove: (id: string) => void; onGive: () => void;
}) {
  const groups = useMemo(() => { const m = new Map<string, number>(); for (const p of ordered(picks)) m.set(p.id, (m.get(p.id) ?? 0) + 1); return [...m.entries()]; }, [picks]);
  const n = picks.length;
  return (
    <div className="absolute inset-x-0 bottom-0">
    <div aria-hidden className="pointer-events-none h-[22px]" style={{ background: "linear-gradient(180deg, rgba(4,26,19,0), rgba(4,26,19,0.9))" }} />
    <div className="grid gap-2.5 border-t px-4 pb-4 pt-2.5" style={{ backgroundColor: "#041a13", borderColor: "rgba(214,180,108,0.45)" }}>
      {phase === "giving" ? (
        <p className="gf-in font-display py-5 text-center text-[17px]" aria-live="polite">{gt.giving}</p>
      ) : (
        <>
          {n ? (
            <div ref={trayRef} className="gf-scroll flex gap-2.5 overflow-x-auto pe-1.5 pt-1.5">
              {groups.map(([id, c]) => {
                const def = feedDef(id);
                return (
                  <span key={id} ref={(el) => { chipRefs.set(id, el); }} className="relative block h-[46px] w-[46px] shrink-0">
                    <span className="grid h-[46px] w-[46px] place-items-center rounded-full border" style={{ backgroundColor: "rgba(214,180,108,0.12)", borderColor: "rgba(214,180,108,0.55)" }}>
                      {def ? <StickerArt def={def} size={38} /> : <CatalogArt id={id} size={38} />}
                    </span>
                    <button type="button" onClick={() => onRemove(id)} aria-label={`${gt.remove}: ${nameOf(id)}`} title={gt.remove}
                      className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border px-1 text-[10px] font-bold" style={{ backgroundColor: "#0b3d2e", borderColor: "rgba(243,226,182,0.6)" }}>
                      {c > 1 ? `×${c}` : <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth={3.4} strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>}
                    </button>
                  </span>
                );
              })}
            </div>
          ) : null}
          <p className="line-clamp-2 text-[13px] font-semibold" aria-live="polite" style={{ color: note ? GOLD : n ? CREAM : "rgba(255,255,255,0.6)" }}>
            {note ?? (n ? `${n === 1 ? gt.stickers1 : fillG(gt.stickersN, { n })} · ${fillG(tx.gp, { n: total })}` : gt.pickHint)}
          </p>
          <button type="button" onClick={onGive} disabled={!n} className="btn-gold inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-6 text-[15px] font-bold disabled:cursor-not-allowed disabled:opacity-45">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>
            {gt.giveBtn}
          </button>
        </>
      )}
    </div>
    </div>
  );
}

// ---------- the flight: a sticker rises from the tray and flies into the tree as golden light ----------
function Flyer({ f, onArrive }: { f: Flight; onArrive: () => void }) {
  const arrived = useRef(onArrive);
  arrived.current = onArrive;
  const body = useRef<HTMLDivElement>(null), art = useRef<HTMLDivElement>(null), orb = useRef<HTMLDivElement>(null), motes = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    const { sx, sy, tx, ty } = f;
    const cx = (sx + tx) / 2 + (sx < tx ? -60 : 60), cy = Math.min(sy, ty) + (sy - ty) * 0.25 - 40;
    const at = (m: number) => { const u = 1 - m; return [u * u * sx + 2 * u * m * cx + m * m * tx, u * u * sy + 2 * u * m * cy + m * m * ty]; };
    const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
    const N = 24;
    const path = (lag: number, half: number) => Array.from({ length: N + 1 }, (_, i) => {
      const k = ease(i / N), m = Math.min(1, Math.max(0, (k - 0.1 - lag) / (0.9 - lag))), lift = Math.min(1, k / 0.1);
      const [x, y] = at(m);
      return { offset: i / N, transform: `translate(${x - half}px, ${y - half - lift * 10 * (1 - m)}px)` };
    });
    const opt = { duration: FLIGHT, delay: f.delay, fill: "both" as const, easing: "linear" };
    const a1 = body.current?.animate(path(0, 23), opt);
    a1?.finished.then(() => arrived.current()).catch(() => undefined);
    const a2 = art.current?.animate([{ opacity: 1, transform: "scale(1)", offset: 0 }, { opacity: 1, transform: "scale(1.14)", offset: 0.11 }, { opacity: 0, transform: "scale(0.35)", offset: 0.32 }, { opacity: 0, transform: "scale(0.35)", offset: 1 }], { ...opt, easing: "ease-in-out" });
    const a3 = orb.current?.animate([{ opacity: 0, transform: "scale(0.3)", offset: 0 }, { opacity: 0, transform: "scale(0.3)", offset: 0.14 }, { opacity: 1, transform: "scale(1)", offset: 0.32 }, { opacity: 1, transform: "scale(0.75)", offset: 0.88 }, { opacity: 0, transform: "scale(1.9)", offset: 1 }], { ...opt, easing: "ease-in-out" });
    const am = motes.current.map((el, j) => el?.animate(path(0.07 * (j + 1), 3).map((p, i, arr) => ({ ...p, opacity: i / arr.length > 0.25 + 0.07 * (j + 1) && i < arr.length - 1 ? 0.75 - j * 0.2 : 0 })), opt));
    const a4 = body.current?.animate([{ opacity: 1 }, { opacity: 1, offset: 0.99 }, { opacity: 0 }], opt);
    return () => { a1?.cancel(); a2?.cancel(); a3?.cancel(); a4?.cancel(); am.forEach((x) => x?.cancel()); };
  }, [f]);
  const def = feedDef(f.id);
  return (
    <>
      {[0, 1, 2].map((j) => <span key={j} ref={(el) => { motes.current[j] = el; }} aria-hidden className="pointer-events-none fixed left-0 top-0 rounded-full" style={{ width: 6 - j, height: 6 - j, opacity: 0, backgroundColor: "#fff2c4", boxShadow: "0 0 6px #ffd98a" }} />)}
      <div ref={body} aria-hidden className="pointer-events-none fixed left-0 top-0 grid h-[46px] w-[46px] place-items-center" style={{ transform: `translate(${f.sx - 23}px, ${f.sy - 23}px)` }}>
        <div ref={art} className="absolute">{def ? <StickerArt def={def} size={38} /> : <CatalogArt id={f.id} size={38} />}</div>
        <div ref={orb} className="absolute grid h-[34px] w-[34px] place-items-center rounded-full" style={{ opacity: 0, backgroundColor: "rgba(255,226,150,0.28)" }}>
          <span className="block h-3.5 w-3.5 rounded-full" style={{ backgroundColor: "#fff4d0", boxShadow: "0 0 12px 3px #ffd98a" }} />
        </div>
      </div>
    </>
  );
}

// ---------- the only copy: a confirmation in the sheet's own style ----------
function Confirm({ gt, it, name, onYes, onNo }: { gt: GiftText; it: GiftItem; name: string; onYes: () => void; onNo: () => void }) {
  const def = it.feed ? feedDef(it.id) : null;
  const yes = useRef<HTMLButtonElement>(null);
  useEffect(() => { yes.current?.focus(); }, []);
  return (
    <div className="gf-in absolute inset-0 z-10 grid place-items-center p-6" style={{ backgroundColor: "rgba(2,14,10,0.72)" }} role="alertdialog" aria-modal="true" aria-labelledby="gf-confirm">
      <div className="grid w-full max-w-[380px] justify-items-center gap-2.5 rounded-3xl border p-[22px] text-center" style={{ borderColor: "rgba(214,180,108,0.6)", background: "linear-gradient(180deg, #0f4a39, #06251c)" }}>
        {def ? <StickerArt def={def} size={104} /> : <CatalogArt id={it.id} size={104} />}
        <p className="line-clamp-2 text-[12.5px]" style={{ color: "rgba(243,226,182,0.7)" }}>{name}</p>
        <h3 id="gf-confirm" className="font-display text-[20px]">{gt.confirmT}</h3>
        <p className="text-[14px] leading-5" style={{ color: "rgba(255,255,255,0.75)" }}>{gt.confirmB}</p>
        <div className="mt-2 grid w-full gap-2.5">
          <button ref={yes} type="button" onClick={onYes} className="btn-gold inline-flex h-12 w-full items-center justify-center rounded-md px-6 text-[15px] font-bold">{gt.confirmYes}</button>
          <button type="button" onClick={onNo} className="inline-flex h-12 w-full items-center justify-center rounded-md border px-6 text-[15px] font-bold text-white transition hover:bg-white/[0.04]" style={{ borderColor: "rgba(214,180,108,0.4)" }}>{gt.confirmNo}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- states without a picker ----------
const card: CSSProperties = { borderColor: "rgba(214,180,108,0.3)", backgroundColor: "rgba(255,255,255,0.03)" };
function NoMatch({ gt }: { gt: GiftText }) {
  return <p className="px-4 py-3.5 text-[13.5px]" style={{ color: "rgba(255,255,255,0.6)" }}>{gt.noMatch}</p>;
}
function NoDupes({ gt }: { gt: GiftText }) {
  return (
    <div className="mx-4 my-1.5 grid gap-2 rounded-[18px] border p-4" style={card}>
      <p className="text-[15px] font-semibold">{gt.noDupesT}</p>
      <p className="text-[13px] leading-[18px]" style={{ color: "rgba(255,255,255,0.6)" }}>{gt.noDupesB}</p>
      <div className="mt-1"><Link href="/app" className="inline-flex h-10 items-center rounded-md border px-4 text-[14px] font-bold text-white hover:bg-white/[0.04]" style={{ borderColor: "rgba(214,180,108,0.4)" }}>{gt.inApp}</Link></div>
    </div>
  );
}
function EmptyAll({ gt }: { gt: GiftText }) {
  return (
    <div className="m-4 grid justify-items-center gap-2 rounded-[20px] border p-[18px] text-center" style={card}>
      <BagIcon size={34} color={GOLD} />
      <h3 className="font-display text-[18px]">{gt.emptyT}</h3>
      <p className="text-[13.5px] leading-[19px]" style={{ color: "rgba(255,255,255,0.6)" }}>{gt.emptyB}</p>
      <Link href="/app" className="btn-gold mt-1.5 inline-flex h-12 w-full items-center justify-center rounded-md px-6 text-[15px] font-bold">{gt.inApp}</Link>
    </div>
  );
}
function CapNote({ gt, cap, onDone }: { gt: GiftText; cap: number; onDone: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i); }, []);
  const r = untilReset(now);
  const t = r.h > 0 ? fillG(gt.hm, { h: r.h, m: r.m }) : fillG(gt.min, { m: r.m });
  return (
    <div className="m-4 grid justify-items-center gap-2 rounded-[20px] border p-5 text-center" style={card}>
      <svg width={30} height={30} viewBox="0 0 24 24" aria-hidden><path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.6A7 7 0 0 1 15.5 3.5z" fill="none" stroke={GOLD} strokeWidth={1.5} strokeLinejoin="round" /></svg>
      <h3 className="font-display text-[18px]">{gt.capT}</h3>
      <p className="text-[14px] leading-5" style={{ color: "rgba(255,255,255,0.75)" }}>{fillG(gt.capB, { m: cap, t })}</p>
      <button type="button" onClick={onDone} className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-md border px-6 text-[15px] font-bold text-white transition hover:bg-white/[0.04]" style={{ borderColor: "rgba(214,180,108,0.4)" }}>{gt.done}</button>
    </div>
  );
}

// ---------- after the gift ----------
function Summary({ gt, tx, given, next, tree, pro, shared, canMore, onShare, onMore, onDone }: {
  gt: GiftText; tx: GardenText; given: Given[]; next: string; tree: Tree | null; pro: boolean; shared: string | null; canMore: boolean; onShare: () => void; onMore: () => void; onDone: () => void;
}) {
  const total = given.reduce((a, x) => a + x.gp, 0);
  const traits = given.map((x) => x.trait).filter((x): x is Trait => !!x);
  const up = given.some((x) => x.up);
  const ids = Array.from(new Set(given.map((x) => x.id))).slice(0, 6);
  const outline = "inline-flex h-12 flex-1 items-center justify-center rounded-md border px-4 text-[15px] font-bold text-white transition hover:bg-white/[0.04]";
  return (
    <div className="gf-in relative m-4 grid justify-items-center gap-2.5 overflow-hidden rounded-[22px] border p-5 text-center" style={{ borderColor: "rgba(214,180,108,0.6)", background: "linear-gradient(180deg, rgba(214,180,108,0.16), rgba(214,180,108,0.04))" }}>
      <span aria-hidden className="pointer-events-none absolute inset-1.5 rounded-[17px] border" style={{ borderColor: "rgba(214,180,108,0.22)" }} />
      <h3 className="font-display text-[21px]">{given.length === 1 ? gt.sumT1 : fillG(gt.sumT, { n: given.length })}</h3>
      <p className="font-display text-[40px] leading-[46px]" aria-live="polite" style={{ color: "#f1d79a", textShadow: "0 0 12px rgba(255,217,138,0.4)" }}>{fillG(tx.gp, { n: total })}</p>
      <div className="flex justify-center gap-1.5" aria-hidden>{ids.map((id) => { const d = feedDef(id); return <span key={id}>{d ? <StickerArt def={d} size={34} /> : <CatalogArt id={id} size={34} />}</span>; })}</div>
      {next ? <p className="text-[14px] font-semibold leading-5">{next}</p> : null}
      {traits.map((t) => <p key={t} className="text-[14px] font-semibold" style={{ color: GOLD }}>{fillG(tx.traitNew, { t: (tx as unknown as Record<string, string>)[`tr_${t}`] ?? t })}</p>)}
      {up && tree ? <p className="text-[14px] font-semibold" style={{ color: GOLD }}>{fillG(gt.sumStage, { stage: tx[`s${treeStage(tree, pro)}` as "s0"] })}</p> : null}
      <div className="relative mt-2 grid w-full gap-2.5">
        <button type="button" onClick={onShare} className="btn-gold inline-flex h-12 w-full items-center justify-center gap-2 rounded-md px-6 text-[15px] font-bold">
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" aria-hidden><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" /></svg>
          {tx.shareMoment}
        </button>
        {shared ? <p className="text-[13px] font-semibold" aria-live="polite" style={{ color: GOLD }}>{shared}</p> : null}
        <div className="flex gap-2.5">
          {canMore ? <button type="button" onClick={onMore} className={outline} style={{ borderColor: "rgba(214,180,108,0.4)" }}>{gt.giveMore}</button> : null}
          <button type="button" onClick={onDone} className={outline} style={{ borderColor: "rgba(214,180,108,0.4)" }}>{gt.done}</button>
        </div>
      </div>
    </div>
  );
}

// ---------- small icons (geometric, no emoji) ----------
export function BagIcon({ size = 22, color = CREAM }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9.2 4.2c.9 1 4.7 1 5.6 0l-.9 4.3h-3.8z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M8.6 8.5h6.8c2.4 1.6 3.9 4.6 3.6 7.6-.3 3-2.8 4.7-7 4.7s-6.7-1.7-7-4.7c-.3-3 1.2-6 3.6-7.6z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M12 12.1l.75 1.65 1.65.75-1.65.75L12 16.9l-.75-1.65-1.65-.75 1.65-.75z" fill={color} />
    </svg>
  );
}
function SparkIcon({ size = 14, color = CREAM }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden><path d="M8 1l1.6 4.4L14 7l-4.4 1.6L8 13l-1.6-4.4L2 7l4.4-1.6z" fill={color} /></svg>;
}
