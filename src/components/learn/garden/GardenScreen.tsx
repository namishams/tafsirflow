"use client";
// mirrors mobile/src/features/garden/GardenScreen.tsx
// The garden on the website: the living landscape with the learner's tree at its stage (read from the synced store
// qmc.garden), the tree card with the next stage and the calendar wait, fruits and decorations (read-only), growth this
// week by source, the history, what unlocks in the landscape and how the tree grows. A learner without a tree plants
// one with the ceremony (PlantFlow). Learning growth never happens here (no tickGarden): it comes from the app and
// Shams 2.0. Giving stickers ("Nourish your tree", GiftFlow.tsx), harvesting the fruits and the daily sticker pack work
// here exactly as in the app (same store keys, synced with the account).
// Sharing the garden uses the same words and link as the app (the system share sheet or the clipboard).
// Not on the web (app only): pinch, pan and the panorama look, watering by tap, more plots, Pro offers, the picture
// of the share card, reminders.
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "@/i18n/navigation";
import { useLang, intlLocale } from "@/lib/learn/i18n";
import { useHydrated } from "@/lib/learn/store";
import { useAuth } from "@/lib/learn/auth";
import { MAX_STAGE, MIN_DAYS, SRCS, STAGES, activeTree, harvest, progressOf, resting, seasonNow, setActive, shamsRun, treeStage, useGarden, weekGrowth, type Garden, type HistKind, type Tree } from "@/lib/learn/garden/garden";
import { CATALOG_SIZE, countOf, dailyPackReady, itemById, openDailyPack, totalOwned, useCatalog, type Drop } from "@/lib/learn/garden/catalog";
import { fillG, skyLabel, useAgeText, useGardenText, useSkyText, useStickerLabel } from "@/lib/learn/garden/texts";
import { UNLOCK, gardenLevel, inkFor, setSkyPlace, useSky, useSkyPlace, type Sky } from "@/lib/learn/garden/sky";
import { useGardenPro, useGardenWebText } from "@/lib/learn/garden/web";
import { dayNum } from "@/lib/learn/feed/statsStore";
import { Bar, Card, GoldButton, LearnMain, OutlineButton, SectionTitle, Spinner } from "@/components/learn/ui";
import { Fronds, Motes, Panorama, TERRACE_H, Terrace } from "./Landscape";
import { Plaque, TREE_H, TREE_W, TreeArt } from "./Tree";
import { GardenStyles, Petals, useReducedMotion } from "./Scene";
import { PlantFlow } from "./PlantFlow";
import { CatalogArt } from "./CatalogArt";
import { GiftFlow, NourishButton, StickerBag } from "./GiftFlow";
import { useGiftText } from "@/lib/learn/garden/giftText";
import { shareOrCopy } from "@/components/learn/coursekit/share";

const SCENE_H = 520;
const GOLD = "rgb(214,180,108)";

export function GardenScreen() {
  const hydrated = useHydrated();
  const s = useGarden();
  const pro = useGardenPro();
  const tree = hydrated ? activeTree(s, pro) : null;
  const [planting, setPlanting] = useState<boolean | null>(null);
  const tx = useGardenText();
  const wt = useGardenWebText();
  const plant = planting ?? !tree;
  return (
    <div className="gd-root">
      <GardenStyles />
      {!hydrated ? (
        <section className="stage relative grid min-h-[520px] place-items-center px-5 text-white">
          <div className="grid justify-items-center gap-3 text-center">
            <h1 className="font-display text-[32px]">{tx.title}</h1>
            <Spinner />
          </div>
        </section>
      ) : tree && !planting ? (
        <GardenView s={s} tree={tree} pro={pro} />
      ) : plant ? (
        <PlantFlow onStart={() => setPlanting(true)} onDone={() => setPlanting(false)} onLater={() => setPlanting(false)} />
      ) : (
        <section className="stage relative px-5 py-14 text-white">
          <div className="mx-auto grid max-w-md justify-items-center gap-3 text-center">
            <TreeArt id="seed" type="olive" stage={0} size={120} still />
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] rtl:tracking-normal" style={{ color: GOLD }}>{tx.missionKicker}</p>
            <h1 className="font-display text-[30px] leading-tight">{tx.seedTitle}</h1>
            <p className="text-[15px] leading-relaxed text-white/75">{tx.seedLead}</p>
            <p className="text-[14px] text-white/60">{wt.plantIntro}</p>
            <GoldButton className="mt-2" onClick={() => setPlanting(true)}>{tx.plant}</GoldButton>
          </div>
        </section>
      )}
      <LearnMain wide>
        <HowItGrows />
      </LearnMain>
    </div>
  );
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function GardenView({ s, tree, pro }: { s: Garden; tree: Tree; pro: boolean }) {
  const tx = useGardenText();
  const wt = useGardenWebText();
  const ageTx = useAgeText();
  const skyT = useSkyText();
  const reduce = useReducedMotion();
  const place = useSkyPlace();
  const sky = useSky(place);
  const { user, ready } = useAuth();
  const p = progressOf(tree, pro);
  const level = gardenLevel(s.trees.map((x) => treeStage(x, pro)));
  const season = seasonNow();
  const [box, width] = useWidth<HTMLDivElement>();
  const [nudge, setNudge] = useState<Record<string, number>>({});
  const [gift, setGift] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const gx = useGiftText();
  const name = tree.name || tx[`t_${tree.type}`];
  const stageName = tx[`s${p.stage}` as "s0"];
  // the same words and link as the app's share sheet (the app adds the picture card)
  const share = async () => {
    setCopied(null);
    const res = await shareOrCopy({ title: tx.title, text: `${tx.shareMsg}: ${name}, ${stageName}`, url: "https://quranmasterclass.com/app" });
    if (res === "copied") setCopied(gx.copied);
  };
  const next = p.held ? wt.heldWeb : p.left ? fillG(tx.next, { n: p.left }) : p.wait ? ageTx(p.age, p.wait).wait : tx.maxed;
  const sceneLabel = fillG(wt.sceneLabel, { name, type: tx[`t_${tree.type}`], stage: `${stageName}, ${fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}` });
  return (
    <>
      <section className="stage relative overflow-hidden text-white">
        <div className="relative mx-auto grid max-w-6xl gap-6 px-0 pb-8 sm:px-5 sm:pt-6 lg:grid-cols-[minmax(0,540px)_minmax(0,1fr)] lg:items-start lg:pb-12">
          {/* ---------- the scene: a living landscape ---------- */}
          <div ref={box} className="relative w-full overflow-hidden sm:rounded-2xl sm:border sm:border-[rgb(var(--gold))]/30" style={{ height: SCENE_H }}>
            {width && sky ? (
              <Scene width={width} sky={sky} s={s} tree={tree} pro={pro} level={level} season={season} still={reduce} label={sceneLabel}
                nudge={nudge} onTree={(t) => { if (t.id !== tree.id) setActive(t.id); setNudge((n) => ({ ...n, [t.id]: (n[t.id] ?? 0) + 1 })); }} />
            ) : null}
            {/* the sticker bag beside the active tree (with several trees the active one is not always in the middle;
                the plot width is the one the scene uses): opens the gift flow */}
            {width ? (
              <div className="absolute" style={{ bottom: TERRACE_H + 14, left: bagLeft(width, s, tree) }}>
                <StickerBag onClick={() => setGift(true)} />
              </div>
            ) : null}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start gap-2">
              <div className="min-w-0 flex-1" style={{ color: sky ? inkFor(sky) : "#f6ead0" }}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-85 rtl:tracking-normal">{season === "ramadan" ? tx.ramadan : season === "eid" ? tx.eid : tx.kicker}</p>
                <h1 className="font-display text-[22px] leading-tight" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.35)" }}>{tx.missionTitle}</h1>
                {sky ? <p className="mt-0.5 truncate text-[12px] opacity-80" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.35)" }}>{skyLabel(skyT, place === "mecca", sky.next)}</p> : null}
              </div>
              <Link href="/garden/collection" aria-label={tx.album} title={tx.album}
                className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border text-[#f3e2b6] transition hover:bg-black/30" style={{ backgroundColor: "rgba(8,38,29,0.55)", borderColor: "rgba(233,207,153,0.4)" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>
              </Link>
              {/* share the garden, as the app's top bar does (the system share sheet, or the link copied) */}
              <button type="button" onClick={share} aria-label={tx.share} title={tx.share}
                className="pointer-events-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border text-[#f3e2b6] transition hover:bg-black/30" style={{ backgroundColor: "rgba(8,38,29,0.55)", borderColor: "rgba(233,207,153,0.4)" }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 3 10 14" /><path d="M21 3l-7 18-4-7-7-4 18-7Z" /></svg>
              </button>
            </div>
            {copied ? <p role="status" className="absolute inset-x-3 top-16 text-end text-[12.5px] font-semibold" style={{ color: "#f3e2b6", textShadow: "0 1px 4px rgba(0,0,0,0.45)" }}>{copied}</p> : null}
          </div>

          {/* ---------- the tree: stage, next stage, calendar, fruits ---------- */}
          <div className="grid gap-4 px-4 sm:px-0">
            <div className="grid gap-2 rounded-2xl border border-[rgb(var(--gold))]/30 bg-white/[0.04] p-5">
              <h2 className="font-display text-[24px] leading-tight">{name}</h2>
              <p className="text-[14px] text-white/70">{tx[`t_${tree.type}`]} · {stageName} · {fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}</p>
              <Bar value={p.frac} gold label={tx.growth} />
              <p className="text-[14px] font-semibold">{next}</p>
              <p className="text-[13.5px] text-white/65">{ageTx(p.age, 0).age}{!p.held && p.left && p.wait ? ` · ${ageTx(p.age, p.wait).wait}` : ""}</p>
              {!p.held && p.stage < MAX_STAGE ? <p className="text-[12.5px] text-white/50">{fillG(wt.needT, { n: p.stage + 1, gp: STAGES[p.stage + 1], d: MIN_DAYS[p.stage + 1] })}</p> : null}
              {resting(s) ? <p className="text-[13.5px] text-white/65">{tx.resting}</p> : null}
              <p className="text-[13.5px] text-white/65">{s.watered === dayNum() ? tx.watered : tx.waterHint}</p>
              {shamsRun(s) >= 2 ? <p className="text-[13.5px] font-semibold" style={{ color: GOLD }}>{fillG(tx.shamsRunT, { n: shamsRun(s) })}</p> : null}
              {pro ? <p className="text-[13px]" style={{ color: GOLD }}>{tx.proDouble}</p> : null}
            </div>
            <NourishButton onClick={() => setGift(true)} />
            <Harvest tree={tree} stage={p.stage} />
            <DailyPack />
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[rgb(var(--gold))]/30 bg-white/[0.04] p-4" role="radiogroup" aria-label={skyT.label}>
              <span className="me-auto text-[14.5px] font-semibold">{skyT.label}</span>
              {(["mecca", "local"] as const).map((k) => (
                <button key={k} type="button" role="radio" aria-checked={place === k} onClick={() => setSkyPlace(k)}
                  className="rounded-full border px-3 py-1.5 text-[13px] font-semibold transition"
                  style={{ borderColor: place === k ? GOLD : "rgba(255,255,255,0.2)", backgroundColor: place === k ? "rgba(214,180,108,0.14)" : "transparent" }}>
                  {k === "mecca" ? skyT.mecca : skyT.local}
                </button>
              ))}
            </div>
            {ready && !user ? <Link href="/profile" className="text-[13.5px] font-semibold text-[rgb(var(--gold))] hover:underline">{wt.signIn}</Link> : null}
          </div>
        </div>
      </section>

      <LearnMain wide className="!pb-0">
        <div className="grid gap-5 lg:grid-cols-2">
          <WeekCard s={s} />
          <div className="grid content-start gap-5">
            <Decorations s={s} />
            <CollectionCard />
          </div>
          <Unlocks level={level} />
          <History tree={tree} />
        </div>
      </LearnMain>
      {gift ? <GiftFlow onClose={() => setGift(false)} /> : null}
    </>
  );
}

/** the scene: panorama, petals, the terrace with the trees, motes and the framing fronds (no gestures on the web) */
function Scene({ width, sky, s, tree, pro, level, season, still, label, nudge, onTree }: {
  width: number; sky: Sky; s: Garden; tree: Tree; pro: boolean; level: number; season: ReturnType<typeof seasonNow>; still: boolean; label: string;
  nudge: Record<string, number>; onTree: (t: Tree) => void;
}) {
  const tx = useGardenText();
  const H = SCENE_H;
  const n = Math.max(1, s.trees.length);
  const plotW = Math.min(width * 0.78, 320, (width - 20) / n);
  const worldW = Math.max(width + 80, n * plotW + 40);
  const petal = tree.type === "pomegranate" ? "#e0c184" : s.traits.includes("blossoms") ? "#f5ebd7" : "#9fd28a";
  // the record's list of decorations is changed in place (a gift adds one): a new list when it changes, so the
  // memoised tree art shows a new decoration at once
  const traits = useMemo(() => [...s.traits], [s.traits.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div role="img" aria-label={label} style={{ position: "absolute", inset: 0 }}>
      <Panorama width={width} height={H} ground={H - TERRACE_H + 6} sky={sky} level={level} drift still={still} scale={1.9} />
      <Petals width={width} height={H} color={petal} still={still} />
      <div className={still ? undefined : "gd-drift"} style={{ position: "absolute", left: (width - worldW) / 2, width: worldW, bottom: 0, height: H - 40, "--gd-dx": "9px" } as CSSProperties}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <Terrace width={worldW} level={level} night={sky.night} still={still} fountain={s.traits.includes("fountain")} bench={s.traits.includes("bench")} />
        </div>
        <div style={{ position: "absolute", bottom: TERRACE_H - 12 - 30 - plotW * (48 / 360), left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
          {s.trees.map((tr) => {
            const st = treeStage(tr, pro);
            const nm = tr.name || tx[`t_${tr.type}`];
            return (
              <button key={tr.id} type="button" onClick={() => onTree(tr)} aria-label={`${nm}, ${tx[`s${st}` as "s0"]}`} aria-pressed={tr.id === tree.id}
                className="flex flex-col items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(214,180,108)]" style={{ width: plotW, background: "none", border: 0, padding: 0, cursor: "pointer" }}>
                <span style={{ width: plotW, height: (TREE_H * plotW) / TREE_W, display: "block" }}>
                  <TreeArt id={tr.id} type={tr.type} stage={st} traits={traits} season={season} resting={resting(s)} fruits={tr.fruits} size={plotW} still={still} nudge={nudge[tr.id] ?? 0} />
                </span>
                <span style={{ marginTop: -18, display: "block" }}><Plaque name={nm} width={Math.min(170, plotW * 0.6)} /></span>
              </button>
            );
          })}
        </div>
      </div>
      <Motes width={width} height={H} night={sky.night} still={still} />
      <Fronds width={width} height={H} drift still={still} />
    </div>
  );
}

/** where the sticker bag stands: beside the active tree, with the plot width and row of the scene below */
function bagLeft(width: number, s: Garden, tree: Tree): number {
  const n = Math.max(1, s.trees.length);
  const plotW = Math.min(width * 0.78, 320, (width - 20) / n);
  const i = Math.max(0, s.trees.findIndex((t) => t.id === tree.id));
  return width / 2 + (i - (n - 1) / 2) * plotW + Math.min(plotW * 0.36, 118);
}

/** the fruits of the active tree, harvested here as in the app (the same harvest: XP and a sticker) */
function Harvest({ tree, stage }: { tree: Tree; stage: number }) {
  const tx = useGardenText();
  const [got, setGot] = useState(0);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[rgb(var(--gold))]/30 bg-white/[0.04] p-4">
      <span className="flex min-w-[54px] gap-1" aria-hidden>
        {Array.from({ length: Math.max(1, Math.min(5, tree.fruits)) }, (_, i) => <span key={i} className="h-3 w-3 rounded-full" style={{ backgroundColor: tree.fruits ? "#f3b14a" : "rgba(255,255,255,0.18)", boxShadow: tree.fruits ? "0 0 6px #ffd27a" : undefined }} />)}
      </span>
      <p className="flex-1 text-[14px]">
        {tree.fruits ? fillG(tx.fruitsReady, { n: tree.fruits }) : stage >= 5 ? tx.noFruit : tx.fruitFrom}
        {got ? <span role="status" className="block text-[13px] font-semibold" style={{ color: GOLD }}>{fillG(tx.harvested, { n: got })}</span> : null}
      </p>
      {tree.fruits ? <GoldButton onClick={() => { const xp = harvest(tree.id); if (xp) setGot(xp); }}>{tx.harvest}</GoldButton> : null}
    </div>
  );
}

/** the daily pack, as in the app: the three stickers it brought are shown right here, new ones and further copies */
function DailyPack() {
  const tx = useGardenText();
  const name = useStickerLabel();
  useCatalog();
  const ready = dailyPackReady();
  const [got, setGot] = useState<Drop[]>([]);
  return (
    <div className="grid gap-3 rounded-2xl border border-[rgb(var(--gold))]/30 bg-white/[0.04] p-4">
      <OutlineButton dark className="w-full" disabled={!ready} onClick={() => { const d = openDailyPack(); if (d.length) setGot(d); }}>{ready ? `${tx.dailyPack}: ${tx.openPack}` : tx.dailyPack}</OutlineButton>
      {got.length ? (
        <div aria-live="polite" className="grid gap-2">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.16em] rtl:tracking-normal" style={{ color: GOLD }}>{tx.packGot}</p>
          <ul className="grid grid-cols-3 gap-2">
            {got.map((d, i) => {
              const it = itemById(d.id), label = it ? name(it) : d.id, n = countOf(d.id);
              return (
                <li key={`${d.id}-${i}`}>
                  <Link href="/garden/collection" aria-label={`${label}, ${d.fresh ? tx.packNew : fillG(tx.copies, { n })}`} className="flex flex-col items-center gap-1 rounded-lg p-1 transition hover:bg-white/5">
                    <CatalogArt id={d.id} size={72} />
                    <span className="line-clamp-2 max-w-full text-center text-[12px] font-semibold leading-tight">{label}</span>
                    <span className="text-[11.5px] font-semibold" style={{ color: d.fresh ? GOLD : "rgba(255,255,255,0.6)" }}>{d.fresh ? tx.packNew : `×${n}`}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link href="/garden/collection" className="justify-self-center text-[13.5px] font-semibold text-[rgb(var(--gold))] hover:underline">{tx.viewAlbum}</Link>
        </div>
      ) : null}
      {!ready ? <p className="text-center text-[12.5px] text-white/60">{tx.packDone}</p> : null}
    </div>
  );
}

function WeekCard({ s }: { s: Garden }) {
  const tx = useGardenText();
  const w = weekGrowth(s);
  const max = Math.max(1, ...SRCS.map((x) => w.by[x]));
  return (
    <Card>
      <p className="hm-k text-[rgb(var(--hm-gold-d))]">{tx.weekT}</p>
      <h2 className="font-display mt-1 text-[21px]">{tx.madeGrow}</h2>
      <ul className="mt-4 grid gap-3">
        {SRCS.map((x) => (
          <li key={x} className="grid gap-1">
            <span className="flex justify-between text-[14px]"><span>{tx[`src_${x}`]}</span><span className="font-semibold tabular-nums">+{w.by[x]}</span></span>
            <Bar value={w.by[x] / max} gold={x === "shams"} label={tx[`src_${x}`]} />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[14.5px] font-semibold">{fillG(tx.weekGrew, { n: w.now })}</p>
      <p className="mt-0.5 text-[13px] text-muted">{fillG(tx.weekBefore, { n: w.before })}</p>
    </Card>
  );
}

function Decorations({ s }: { s: Garden }) {
  const tx = useGardenText();
  const wt = useGardenWebText();
  return (
    <Card>
      <h2 className="font-display text-[21px]">{wt.decoT}</h2>
      {s.traits.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {s.traits.map((t) => <li key={t} className="rounded-full border border-[rgb(var(--hm-gold))]/50 px-3 py-1 text-[13px] font-semibold text-[rgb(var(--hm-gold-d))]">{(tx as unknown as Record<string, string>)[`tr_${t}`] ?? t}</li>)}
        </ul>
      ) : <p className="mt-2 text-[14px] leading-relaxed text-muted">{wt.decoNone}</p>}
    </Card>
  );
}

function CollectionCard() {
  const tx = useGardenText();
  const wt = useGardenWebText();
  useCatalog();
  const owned = totalOwned();
  return (
    <Link href="/garden/collection" className="hm-card hm-lift relative flex items-center gap-4 p-5">
      <CatalogArt id="a:2:255" size={56} />
      <span className="min-w-0 flex-1">
        <span className="font-display block text-[19px]">{tx.album}</span>
        <span className="block text-[13.5px] text-muted">{fillG(tx.albumLead, { n: owned, m: CATALOG_SIZE })}</span>
        <span className="mt-1 block text-[13px] font-semibold text-accent">{wt.collectionOpen}</span>
      </span>
    </Link>
  );
}

function Unlocks({ level }: { level: number }) {
  const wt = useGardenWebText();
  const items = (Object.entries(UNLOCK) as [keyof typeof UNLOCK, number][]).sort((a, b) => a[1] - b[1]);
  return (
    <Card>
      <h2 className="font-display text-[21px]">{wt.unlockT}</h2>
      <ul className="mt-3 grid gap-2">
        {items.map(([k, n]) => {
          const on = level >= n;
          return (
            <li key={k} className="flex items-center gap-3 text-[14px]">
              <span aria-hidden className={`h-2.5 w-2.5 shrink-0 rotate-45 rounded-[2px] ${on ? "bg-[rgb(var(--hm-gold))]" : "border border-line"}`} />
              <span className={on ? "font-semibold" : "text-muted"}>{wt[`un_${k}`]}</span>
              <span className="ms-auto text-[12.5px] text-muted">{fillG(wt.fromStage, { n })}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function History({ tree }: { tree: Tree }) {
  const tx = useGardenText();
  const { lang } = useLang();
  const label = (k: HistKind, n?: number) => (k === "plant" ? tx.h_plant : k === "stage" ? fillG(tx.h_stage, { n: n ?? 0 }) : k === "gift" ? tx.h_gift : k === "harvest" ? fillG(tx.h_harvest, { n: n ?? 0 }) : tx.h_water);
  const fmt = (d: number) => new Date(d * 86400000).toLocaleDateString(intlLocale(lang), { day: "numeric", month: "short", timeZone: "UTC" });
  const items = [...tree.hist].reverse().filter((h, i, a) => h.k !== "water" || a.findIndex((x) => x.k === "water") === i).slice(0, 14);
  return (
    <Card>
      <h2 className="font-display text-[21px]">{tx.history}</h2>
      <ul className="mt-3 grid gap-2">
        {items.map((h, i) => (
          <li key={i} className="flex justify-between gap-2 text-[14px]">
            <span className={h.k === "stage" ? "font-semibold" : undefined}>{label(h.k, h.n)}</span>
            <span className="text-[13px] text-muted">{fmt(h.d)}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** how the tree grows (also the explanatory, indexable part of the page) */
function HowItGrows() {
  const wt = useGardenWebText();
  const tx = useGardenText();
  return (
    <div className="grid gap-5 pt-4 lg:grid-cols-2">
      <section className="hm-card relative p-5 sm:p-6">
        <SectionTitle title={wt.howT} />
        <ul className="mt-4 grid gap-3 text-[15px] leading-relaxed">
          {[wt.how1, wt.how2, wt.how3, wt.how4].map((x, i) => (
            <li key={i} className="flex gap-3"><span aria-hidden className="mt-2 h-2 w-2 shrink-0 rotate-45 rounded-[2px] bg-[rgb(var(--hm-gold))]" />{x}</li>
          ))}
        </ul>
        <p className="mt-4 text-[13.5px] italic leading-relaxed text-muted">{wt.howNote}</p>
      </section>
      <section className="hm-card relative p-5 sm:p-6">
        <SectionTitle title={wt.webT} />
        <p className="mt-3 text-[15px] leading-relaxed">{wt.webB}</p>
        <ol className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[13.5px] text-muted sm:grid-cols-3">
          {Array.from({ length: MAX_STAGE + 1 }, (_, i) => <li key={i}><span className="font-semibold text-[rgb(var(--hm-gold-d))] tabular-nums">{i}</span> {tx[`s${i}` as "s0"]}</li>)}
        </ol>
      </section>
    </div>
  );
}
export default GardenScreen;
