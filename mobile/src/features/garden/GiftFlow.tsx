import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { BackHandler, FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ScrollViewInstance } from "react-native";

type ViewT = ComponentRef<typeof View>;
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import Animated, { Easing, FadeIn, interpolate, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, goldButton, stage as stageC } from "@/lib/theme";
import { usePro } from "@/lib/pro";
import { useGamify } from "@/features/feed/gamify";
import { useGameText } from "@/features/feed/gamifyTexts";
import { useFeedText } from "@/features/feed/texts";
import { StickerArt, stickerName } from "@/features/feed/Sticker";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "@/features/feed/share";
import { success, tick } from "@/features/feed/haptics";
import { useReducedMotion } from "@/features/library/motion";
import { MAX_STAGE, activeTree, giftOutlook, giveSticker, holdCelebrations, progressOf, seasonNow, treeStage, useGarden, type Trait } from "./garden";
import { dailyPackReady, itemById, openDailyPack, useCatalog, type Rarity } from "./catalog";
import { CatalogArt } from "./CatalogArt";
import { TREE_W, TreeArt, geom } from "./Tree";
import { chime } from "./widgets";
import { fillG, useAgeText, useGardenText } from "./texts";
import { useGiftText } from "./giftText";
import { RARITY_ORDER, allDuplicates, feedDef, giftInventory, ordered, pickedOf, previewOf, readyToGive, untilReset, type GiftItem, type GiftSeries, type Pick } from "./gift";

// "Nourish your tree": the gift flow of the garden (owner request 21.10.2026). A full-height sheet on deep emerald with
// gold: the tree in a small vignette, today's room for sticker growth as twelve gold drops, a live preview of the
// growth (and of the declining value of each further sticker), the learner's stickers grouped (duplicates first, then
// the only copies by rarity) with filters, a tray of the chosen stickers, then the gift: each sticker rises from the
// tray and flies into the tree as golden light (a haptic tick on arrival, the tree glows, the counter grows), and a
// summary with a shareable moment. Reduce Motion: no flight, a simple fade. The growth rules are giveSticker's
// (garden.ts, unchanged); a stage-up is celebrated by the existing cinematic once the sheet has closed
// (holdCelebrations). Not a Modal: an overlay of the garden screen, so the share sheet can open above it and no
// second modal ever competes with the celebration (the iOS freeze).

const EMERALD = ["#0f4a39", "#072a20", "#041a13"] as const;
const CREAM = stageC.cream, GOLD = stageC.gold;
const GLOW: Record<Rarity, { bg: string; shadow: string; r: number } | null> = {
  legendary: { bg: "rgba(233,207,153,0.30)", shadow: "#f3d58a", r: 14 },
  epic: { bg: "rgba(214,180,108,0.17)", shadow: "#d6b46c", r: 8 },
  rare: { bg: "rgba(95,201,160,0.16)", shadow: "#5fc9a0", r: 6 },
  common: null,
};
const STAGGER = 380, FLIGHT = 820;

type Phase = "pick" | "giving" | "done";
type Given = { id: string; gp: number; trait: Trait | null; up: boolean };
type Flight = { key: string; id: string; sx: number; sy: number; tx: number; ty: number; delay: number };
type Row = { k: "head"; key: string; title: string; lead: string; count: number; all?: boolean } | { k: "sub"; key: string; rarity: Rarity; count: number } | { k: "tiles"; key: string; items: GiftItem[] } | { k: "note"; key: string; kind: "noDupes" | "noMatch" | "empty" };

/** the entry on the garden screen: a gold button with today's room and the duplicates ready to give */
export function NourishButton({ onPress }: { onPress: () => void }) {
  const gt = useGiftText();
  const s = useGarden();
  useGamify(); // re-render when the feed duplicates change
  useCatalog();
  const o = giftOutlook(s, []);
  const ready = readyToGive();
  const sub = o.room <= 0 ? gt.capT : ready > 0 ? `${fillG(gt.leftToday, { n: o.room, m: o.cap })} · ${fillG(gt.readyN, { n: ready })}` : fillG(gt.leftToday, { n: o.room, m: o.cap });
  return (
    <Pressable onPress={() => { tick(); onPress(); }} accessibilityRole="button" accessibilityLabel={`${gt.nourish}. ${sub}`}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <LinearGradient colors={[goldButton.from, goldButton.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1, borderColor: "rgba(255,244,214,0.55)" }}>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(8,38,29,0.12)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(8,38,29,0.22)" }}>
          <BagIcon size={24} color={goldButton.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 17, color: goldButton.text }} numberOfLines={1}>{gt.nourish}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "rgba(8,38,29,0.72)", marginTop: 2 }} numberOfLines={2}>{sub}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 2, alignItems: "flex-end" }} accessible={false}>
          {Array.from({ length: 4 }, (_, i) => { const st = i < Math.ceil((o.room / o.cap) * 4) ? "deep" : "spentDark"; return <DropShape key={`${i}${st}`} size={9} state={st} />; })}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** the small sticker bag near the tree in the scene, with the number of duplicates ready to give */
export function StickerBag({ onPress }: { onPress: () => void }) {
  const gt = useGiftText();
  useGamify(); // re-render when the feed duplicates change
  const s = useGarden();
  useCatalog();
  const ready = readyToGive();
  const room = giftOutlook(s, []).room;
  return (
    <Pressable onPress={() => { tick(); onPress(); }} hitSlop={10} accessibilityRole="button" accessibilityLabel={ready > 0 ? `${gt.bag}. ${fillG(gt.readyN, { n: ready })}` : gt.bag}
      style={({ pressed }) => ({ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(8,38,29,0.62)", borderWidth: 1, borderColor: "rgba(233,207,153,0.65)", opacity: pressed ? 0.85 : 1, boxShadow: "0px 2px 12px rgba(0,0,0,0.3)" })}>
      <BagIcon size={22} color="#f3e2b6" />
      {ready > 0 && room > 0 ? (
        <View style={{ position: "absolute", top: -5, end: -5, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: "center", justifyContent: "center", backgroundColor: "#e3c98a", borderWidth: 1, borderColor: "#fff4d6" }}>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 11, color: goldButton.text }}>{ready > 99 ? "99+" : ready}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/** the gift flow itself (rendered by the garden screen above everything else) */
export function GiftFlow({ onClose }: { onClose: () => void }) {
  const gt = useGiftText();
  const tx = useGardenText();
  const ageTx = useAgeText();
  const gameT = useGameText();
  const feedT = useFeedText();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const s = useGarden();
  const gm = useGamify();
  const cat = useCatalog();
  const tree = activeTree(s, pro);
  useEffect(() => holdCelebrations(), []); // the stage-up cinematic only after the sheet has closed

  // the sheet slides up (fades under Reduce Motion) and back down before it closes
  const enter = useSharedValue(0);
  useEffect(() => { enter.value = withTiming(1, { duration: reduce ? 180 : 420, easing: Easing.out(Easing.cubic) }); }, [enter, reduce]);
  const closing = useRef(false);
  const close = () => {
    if (closing.current) return;
    closing.current = true;
    enter.value = withTiming(0, { duration: reduce ? 150 : 300, easing: Easing.in(Easing.cubic) });
    setTimeout(onClose, reduce ? 160 : 310);
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => { const sub = BackHandler.addEventListener("hardwareBackPress", () => { closeRef.current(); return true; }); return () => sub.remove(); }, []);
  const backSt = useAnimatedStyle(() => ({ opacity: enter.value }));
  const sheetSt = useAnimatedStyle(() => (reduce ? { opacity: enter.value } : { transform: [{ translateY: (1 - enter.value) * height }] }));

  // ---------- what can be given ----------
  const dupKey = Object.entries(gm.dupes ?? {}).join(",");
  const ownKey = Object.keys(gm.stickers).length;
  const inv = useMemo(() => giftInventory(s, gm.stickers), [cat.at, s.at, s.given.length, dupKey, ownKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [series, setSeries] = useState<GiftSeries | "all">("all");
  const [picks, setPicks] = useState<Pick[]>([]);
  const [later, setLater] = useState(0);
  const [confirm, setConfirm] = useState<GiftItem | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("pick");
  const [given, setGiven] = useState<Given[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [shown, setShown] = useState(0);
  const [snap, setSnap] = useState<{ room: number; given: number } | null>(null);
  const [share, setShare] = useState(false);
  const [nudge, setNudge] = useState(0);
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
  const cols = width >= 700 ? 6 : 4;
  const sheetW = Math.min(width, 760);
  const cell = Math.floor((sheetW - 32 - (cols - 1) * 8) / cols);
  const nameOf = (id: string) => { const d = feedDef(id); if (d) return stickerName(id, gameT, feedT, String) || gt.feedSeries; const it = itemById(id); return it ? [it.label, it.sub].filter(Boolean).join(", ") : id; };

  // ---------- choosing ----------
  const add = (it: GiftItem) => {
    const next = [...picks, { id: it.id, unique: it.unique, base: it.base }];
    if (previewOf(s, next).fits < next.length) { setNote(gt.full); return; }
    tick(); setNote(null); setLater(0); setPicks(next);
  };
  const onTile = (it: GiftItem) => {
    const n = pickedOf(picks, it.id), max = it.unique ? 1 : it.dupes;
    if (n >= max) { tick(); setPicks(picks.filter((p) => p.id !== it.id)); setNote(null); setLater(0); return; } // all of it chosen: a tap takes it back
    if (it.unique) { setConfirm(it); return; }
    add(it);
  };
  const removeOne = (id: string) => { const i = picks.map((p) => p.id).lastIndexOf(id); if (i < 0) return; tick(); setNote(null); setLater(0); setPicks(picks.filter((_, k) => k !== i)); };
  const giveAll = () => { const r = allDuplicates(s, inv.dupes); if (!r.picks.length) { setNote(gt.full); return; } tick(); setNote(null); setPicks(r.picks); setLater(r.later); };

  // ---------- giving ----------
  const rootRef = useRef<ViewT>(null), vigRef = useRef<{ x: number; y: number; w: number; crown: number } | null>(null), listRef = useRef<FlatList<Row>>(null), trayRef = useRef<ScrollViewInstance>(null);
  const chipRefs = useRef(new Map<string, ViewT | null>());
  const glow = useSharedValue(0.35);
  const measure = (v: ViewT | null | undefined) => new Promise<{ x: number; y: number; w: number; h: number } | null>((res) => { if (!v) { res(null); return; } v.measureInWindow((x, y, w, h) => res({ x, y, w, h })); });
  const give = async () => {
    if (!picks.length || phase !== "pick" || !tree) return;
    const list = ordered(picks);
    setSnap({ room: base.room, given: base.givenToday });
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    trayRef.current?.scrollTo({ x: 0, animated: false });
    await new Promise((r) => setTimeout(r, 40));
    const root = await measure(rootRef.current), vig = vigRef.current;
    const chips = new Map<string, { x: number; y: number }>();
    if (!reduce) for (const id of new Set(list.map((p) => p.id))) { const m = await measure(chipRefs.current.get(id)); if (m) chips.set(id, { x: m.x + m.w / 2, y: m.y + m.h / 2 }); }
    // the gifts themselves, all at once (the animation only shows what already happened)
    const out: Given[] = [];
    for (const p of list) {
      const r = giveSticker(p.id, p.unique, pro);
      if (!r) continue;
      if (r.full) break;
      out.push({ id: p.id, gp: r.gp, trait: r.trait, up: r.up });
    }
    setGiven(out);
    setPicks([]); setLater(0); setNote(null);
    if (!out.length) { setPhase("pick"); setNote(gt.full); return; }
    if (reduce || !root || !vig) {
      setShown(out.reduce((a, x) => a + x.gp, 0)); setPhase("done");
      if (out.some((x) => x.trait || x.up)) chime(); else success();
      return;
    }
    // the target from the layout (the list is at its top): the sheet's top, the grabber (12), the vignette and the crown
    const ox = root.x, oy = root.y, tx0 = (width - sheetW) / 2 + vig.x + vig.w / 2, ty0 = insets.top + 8 + 12 + vig.y + vig.crown;
    const gap = out.length > 8 ? Math.max(150, Math.round(2800 / out.length)) : STAGGER;
    const fallback = { x: width / 2, y: height - insets.bottom - 90 };
    setFlights(out.map((g, i) => { const c = chips.get(g.id) ?? { x: fallback.x + ox, y: fallback.y + oy }; return { key: `${i}`, id: g.id, sx: Math.min(width - 28, Math.max(28, c.x - ox)), sy: c.y - oy, tx: tx0, ty: ty0, delay: i * gap }; }));
    setShown(0);
    setPhase("giving");
    flight.current = { out, sum: 0, n: 0, done: false };
    // the arrivals come from the flights themselves (in step with what is seen); a late safety net closes the flight
    schedule(finish, (out.length - 1) * gap + FLIGHT + 4000);
  };
  /** one light has reached the crown: a tick, the tree glows and rustles, the counter grows */
  const flight = useRef<{ out: Given[]; sum: number; n: number; done: boolean } | null>(null);
  const arrive = (i: number) => {
    const f = flight.current;
    if (!f || f.done || !f.out[i]) return;
    f.sum += f.out[i].gp; f.n++;
    setShown(f.sum); tick(); setNudge((n) => n + 1);
    glow.value = withSequence(withTiming(1, { duration: 160 }), withTiming(0.5, { duration: 700, easing: Easing.out(Easing.quad) }));
    if (f.n >= f.out.length) schedule(finish, 650);
  };
  const finish = () => {
    const f = flight.current;
    if (!f || f.done) return;
    f.done = true;
    setFlights([]); setShown(f.out.reduce((a, x) => a + x.gp, 0)); setPhase("done");
    if (f.out.some((x) => x.trait || x.up)) chime(); else success();
  };
  const again = () => { setPhase("pick"); setGiven([]); setSnap(null); setShown(0); };

  // ---------- rows of the picker ----------
  const emptyAll = !inv.dupes.length && !inv.unique.length;
  const chunk = (items: GiftItem[], key: string): Row[] => { const out: Row[] = []; for (let i = 0; i < items.length; i += cols) out.push({ k: "tiles", key: `${key}${i}`, items: items.slice(i, i + cols) }); return out; };
  const rows: Row[] = phase !== "pick" || base.room <= 0 || emptyAll ? [] : [
    { k: "head", key: "hd", title: gt.ready, lead: gt.readyLead, count: dupes.reduce((a, x) => a + x.dupes, 0), all: dupes.length > 0 },
    ...(dupes.length ? chunk(dupes, "d") : [{ k: "note", key: "nd", kind: inv.dupes.length ? "noMatch" : "noDupes" } as Row]),
    ...(unique.length || inv.unique.length ? [{ k: "head", key: "hu", title: gt.album, lead: gt.albumLead, count: unique.length } as Row] : []),
    ...(unique.length ? RARITY_ORDER.flatMap((r) => { const its = unique.filter((x) => x.rarity === r); return its.length ? [{ k: "sub", key: `s${r}`, rarity: r, count: its.length } as Row, ...chunk(its, `u${r}`)] : []; }) : inv.unique.length ? [{ k: "note", key: "nu", kind: "noMatch" } as Row] : []),
  ];
  const trayH = 184 + insets.bottom;

  const renderRow = ({ item }: { item: Row }) => {
    if (item.k === "head") return (
      <View style={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 8, gap: 3 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 18, color: CREAM }}>{item.title}{item.count ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(243,226,182,0.6)" }}>{`  ${item.count}`}</Text> : null}</Text>
          {item.all ? (
            <Pressable onPress={giveAll} accessibilityRole="button" accessibilityLabel={gt.giveAll} hitSlop={6}
              style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: GOLD, backgroundColor: pressed ? "rgba(214,180,108,0.22)" : "rgba(214,180,108,0.1)" })}>
              <SparkIcon size={13} color="#f3e2b6" />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: CREAM }}>{gt.giveAll}</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: stageC.textMuted }}>{item.lead}</Text>
        {item.all && later > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: GOLD }}>{fillG(gt.later, { n: later })}</Text> : null}
      </View>
    );
    if (item.k === "sub") return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 }} accessible accessibilityRole="header" accessibilityLabel={`${tx[`r_${item.rarity}`]}, ${item.count}`}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: DOT[item.rarity] }} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "rgba(243,226,182,0.8)" }}>{tx[`r_${item.rarity}`]}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stageC.textMuted }}>{item.count}</Text>
        <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: "rgba(214,180,108,0.3)" }} />
      </View>
    );
    if (item.k === "note") {
      if (item.kind === "noMatch") return <Text style={{ paddingHorizontal: 16, paddingVertical: 14, fontFamily: FONT.regular, fontSize: 13.5, color: stageC.textMuted }}>{gt.noMatch}</Text>;
      return <NoDupes onQuests={() => { close(); setTimeout(() => router.push("/feed-stats" as Href), 340); }} />;
    }
    return (
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}>
        {item.items.map((it) => (
          <Tile key={it.id} it={it} size={cell} picked={pickedOf(picks, it.id)} name={nameOf(it.id)} onPress={() => onTile(it)}
            rarityLabel={tx[`r_${it.rarity}`]} />
        ))}
      </View>
    );
  };

  const header = (
    <View>
      <Hero gt={gt} tree={tree} s={s} pro={pro} reduce={reduce} glow={glow} onVignette={(v) => { vigRef.current = v; }} nudge={nudge}
        phase={phase} total={phase === "pick" ? look.total : shown} picks={picks.length}
        cap={base.cap} room={room} chosen={phase === "pick" ? look.total : 0} consumed={phase === "pick" ? 0 : shown}
        givenToday={phase === "pick" ? base.givenToday : snap?.given ?? base.givenToday} fits={phase === "pick" ? look.fits : given.length}
        growthLabel={tx.growth} onClose={close} closeLabel={tx.close} />
      {phase === "pick" && base.room > 0 && !emptyAll ? (
        <Filters gt={gt} tx={tx} rarities={present.rarities} series={present.series} rarity={rarity} setRarity={setRarity} seriesSel={series} setSeries={setSeries} />
      ) : null}
      {phase === "pick" && base.room <= 0 ? <CapNote gt={gt} cap={base.cap} onDone={close} /> : null}
      {phase === "pick" && base.room > 0 && emptyAll ? <EmptyAll gt={gt} onQuests={() => { close(); setTimeout(() => router.push("/feed-stats" as Href), 340); }} /> : null}
      {phase === "done" ? (
        <Summary gt={gt} tx={tx} given={given} next={tree ? nextLine(tree) : ""} s={s} reduce={reduce}
          canMore={giftOutlook(s, []).room > 0 && (inv.dupes.length > 0 || inv.unique.length > 0)} onShare={() => setShare(true)} onMore={again} onDone={close} />
      ) : null}
    </View>
  );
  function nextLine(t: NonNullable<typeof tree>): string {
    const p = progressOf(t, pro);
    if (p.held) return tx.held;
    if (p.stage >= MAX_STAGE) return tx.maxed;
    return [p.wait > 0 ? ageTx(p.age, p.wait).wait : "", p.left > 0 ? fillG(tx.next, { n: p.left }) : ""].filter(Boolean).join(" · ");
  }

  const total = given.reduce((a, x) => a + x.gp, 0);
  return (
    <View ref={rootRef} collapsable={false} style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(2,14,10,0.62)" }, backSt]}>
        <Pressable style={{ height: insets.top + 12 }} onPress={close} accessibilityLabel={tx.close} accessibilityRole="button" />
      </Animated.View>
      <Animated.View style={[{ position: "absolute", top: insets.top + 8, bottom: 0, left: (width - sheetW) / 2, width: sheetW, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: "hidden", borderWidth: 1, borderBottomWidth: 0, borderColor: "rgba(214,180,108,0.4)" }, sheetSt]}>
        <LinearGradient colors={EMERALD} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
        <View style={{ alignItems: "center", paddingTop: 8 }} accessible={false}><View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(243,226,182,0.35)" }} /></View>
        <FlatList ref={listRef} data={rows} keyExtractor={(r) => r.key} renderItem={renderRow} ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: phase === "pick" && rows.length ? trayH + 16 : insets.bottom + 24 }}
          initialNumToRender={8} windowSize={7} removeClippedSubviews={false} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} />
        {phase !== "done" && rows.length + (phase === "giving" ? 1 : 0) > 0 ? (
          <Tray gt={gt} tx={tx} picks={picks} total={look.total} phase={phase} note={note} reduce={reduce} insetBottom={insets.bottom} trayRef={trayRef} chipRefs={chipRefs.current}
            nameOf={nameOf} onRemove={removeOne} onGive={give} />
        ) : null}
      </Animated.View>
      {flights.map((f, i) => <Flyer key={f.key} f={f} onArrive={() => arrive(i)} />)}
      {confirm ? (
        <Confirm gt={gt} it={confirm} name={nameOf(confirm.id)} onYes={() => { const it = confirm; setConfirm(null); add(it); }} onNo={() => setConfirm(null)} />
      ) : null}
      {share && tree ? (
        <ShareSheet visible noDecoration onClose={() => setShare(false)} link="https://quranmasterclass.com/app" message={fillG(gt.shareMsg, { n: total })}
          renderCard={(f) => <MomentCard format={f} ids={given.map((x) => x.id)} total={total} />} />
      ) : null}
    </View>
  );
}

// ---------- the top: the tree, the counter, the drops and the declining value ----------
function Hero({ gt, tree, s, pro, reduce, glow, onVignette, nudge, phase, total, picks, cap, room, chosen, consumed, givenToday, fits, growthLabel, onClose, closeLabel }: {
  gt: ReturnType<typeof useGiftText>; tree: ReturnType<typeof activeTree>; s: ReturnType<typeof useGarden>; pro: boolean; reduce: boolean; glow: SharedValue<number>; onVignette: (v: { x: number; y: number; w: number; crown: number }) => void; nudge: number;
  phase: Phase; total: number; picks: number; cap: number; room: number; chosen: number; consumed: number; givenToday: number; fits: number; growthLabel: string; onClose: () => void; closeLabel: string;
}) {
  const vh = 184;
  const st = tree ? treeStage(tree, pro) : 0;
  const { size, top, crownY } = vignette(tree?.type ?? "olive", st, vh);
  const glowSt = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 0.85 + glow.value * 0.2 }] }));
  useEffect(() => { if (phase === "pick") glow.value = withTiming(picks ? 0.75 : 0.35, { duration: reduce ? 0 : 500 }); }, [phase, picks, reduce, glow]);
  const left = Math.max(0, room - consumed);
  // a gift can add a decoration to the record's list in place: a new list when it changes, so the tree shows it at once
  const traits = useMemo(() => [...s.traits], [s.traits.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  // where the light flies to: the vignette's place in the sheet and the crown in it (from the layout, not measured)
  const [lay, setLay] = useState<{ x: number; y: number; w: number } | null>(null);
  useEffect(() => { if (lay) onVignette({ ...lay, crown: crownY }); }, [lay, crownY]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={{ paddingHorizontal: 16, gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 6 }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.display, fontSize: 24, color: CREAM }} numberOfLines={1}>{gt.nourish}</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={closeLabel} hitSlop={10}
          style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(243,226,182,0.18)" : "rgba(243,226,182,0.08)", borderWidth: 1, borderColor: "rgba(243,226,182,0.25)" })}>
          <Icon name="close" size={16} color={CREAM} />
        </Pressable>
      </View>
      <View onLayout={(e) => { const l = e.nativeEvent.layout; setLay({ x: l.x, y: l.y, w: l.width }); }} style={{ height: vh, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.35)" }}>
        <LinearGradient colors={["#155a45", "#0a3528", "#06251c"]} style={StyleSheet.absoluteFill} />
        <Animated.View pointerEvents="none" style={[{ position: "absolute", left: "50%", top: crownY - 110, width: 220, height: 220, marginLeft: -110 }, glowSt]}>
          <Svg width={220} height={220}><Defs><RadialGradient id="gfGlow" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe6a6" stopOpacity={0.55} /><Stop offset="0.55" stopColor="#ffd98a" stopOpacity={0.16} /><Stop offset="1" stopColor="#ffd98a" stopOpacity={0} /></RadialGradient></Defs><Circle cx={110} cy={110} r={110} fill="url(#gfGlow)" /></Svg>
        </Animated.View>
        <Svg pointerEvents="none" width={150} height={vh - 18} viewBox="0 0 150 166" style={{ position: "absolute", left: "50%", marginLeft: -75, top: 18 }}>
          <Path d="M8 166V70C8 34 40 8 75 2c35 6 67 32 67 68v96" fill="rgba(255,236,190,0.035)" stroke="rgba(214,180,108,0.32)" strokeWidth={1} />
          <Path d="M18 166V73c0-30 26-52 57-58 31 6 57 28 57 58v93" fill="none" stroke="rgba(214,180,108,0.16)" strokeWidth={0.8} />
        </Svg>
        <View pointerEvents="none" style={{ position: "absolute", left: "50%", marginLeft: -70, width: 140, bottom: 6, height: 16, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.22)" }} />
        {tree ? (
          <View style={{ position: "absolute", left: "50%", marginLeft: -size / 2, top }} accessible accessibilityLabel={tree.name}>
            <TreeArt id={tree.id} type={tree.type} stage={st} traits={traits} season={seasonNow()} size={size} still={reduce} nudge={nudge} />
          </View>
        ) : null}
        <View style={{ position: "absolute", top: 12, end: 14, alignItems: "flex-end" }} accessible accessibilityLiveRegion="polite" accessibilityLabel={`+${total} ${growthLabel}`}>
          <Counter value={total} dim={phase === "pick" && !picks} reduce={reduce} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: "rgba(243,226,182,0.75)" }}>{growthLabel}</Text>
          {phase === "pick" && picks ? <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: "rgba(243,226,182,0.55)" }}>{gt.withPick}</Text> : null}
        </View>
      </View>
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Drops cap={cap} left={left} chosen={phase === "pick" ? chosen : 0} />
          <Text style={{ flex: 1, textAlign: "right", fontFamily: FONT.semibold, fontSize: 12.5, color: CREAM }} numberOfLines={1}>{fillG(gt.leftToday, { n: left, m: cap })}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Decline given={givenToday} chosen={fits} />
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12, lineHeight: 16, color: stageC.textMuted }}>{gt.decline}</Text>
        </View>
      </View>
    </View>
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

/** the big gold "+N" of the preview and of the gift; a small pop on every change */
function Counter({ value, dim, reduce }: { value: number; dim: boolean; reduce: boolean }) {
  const pop = useSharedValue(1);
  const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } if (!reduce) pop.value = withSequence(withTiming(1.18, { duration: 120 }), withTiming(1, { duration: 260, easing: Easing.out(Easing.back(2)) })); }, [value, reduce, pop]);
  const st = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return <Animated.Text style={[{ fontFamily: FONT.display, fontSize: 34, lineHeight: 38, color: dim ? "rgba(233,207,153,0.45)" : "#f1d79a", textShadowColor: "rgba(255,217,138,0.45)", textShadowRadius: dim ? 0 : 10 }, st]}>{`+${value}`}</Animated.Text>;
}

/** today's room for sticker growth as gold drops: full = still open, light = taken by the selection, faint = used */
function Drops({ cap, left, chosen }: { cap: number; left: number; chosen: number }) {
  const free = Math.max(0, left - chosen);
  return (
    <View style={{ flexDirection: "row", gap: 3 }} accessible={false}>
      {Array.from({ length: cap }, (_, i) => { const st = i < free ? "full" : i < left ? "chosen" : "spent"; return <DropShape key={`${i}${st}`} size={12} state={st} />; })}
    </View>
  );
}
/** one drop (keyed by its state by the callers: react-native-svg keeps a removed dash pattern otherwise) */
function DropShape({ size, state }: { size: number; state: "full" | "chosen" | "spent" | "deep" | "spentDark" }) {
  const w = size, h = size * 1.33;
  const fill = state === "full" ? "#e3c98a" : state === "chosen" ? "rgba(241,215,154,0.16)" : state === "deep" ? "rgba(8,38,29,0.75)" : "transparent";
  const stroke = state === "spent" ? "rgba(243,226,182,0.22)" : state === "spentDark" ? "rgba(8,38,29,0.35)" : state === "deep" ? "rgba(8,38,29,0.9)" : state === "chosen" ? "#f1d79a" : "#f6e7bf";
  return (
    <Svg width={w} height={h} viewBox="0 0 12 16">
      <Path d="M6 1.2C6 1.2 1.6 6.7 1.6 10.1a4.4 4.4 0 0 0 8.8 0C10.4 6.7 6 1.2 6 1.2Z" fill={fill} stroke={stroke} strokeWidth={state === "chosen" ? 1.4 : 1.1} strokeDasharray={state === "chosen" ? "2 1.4" : undefined} />
      {state === "full" ? <Path d="M4.2 9.6a1.9 1.9 0 0 0 1.4 2.3" stroke="#fff7e0" strokeWidth={0.9} strokeLinecap="round" fill="none" /> : null}
      {state === "chosen" ? <Circle cx={6} cy={10.2} r={1.7} fill="#f1d79a" /> : null}
    </Svg>
  );
}

/** the declining value: one bar per sticker given today (1, 1/2, 1/3 …): given, chosen, to come */
function Decline({ given, chosen }: { given: number; chosen: number }) {
  const n = Math.min(10, Math.max(6, given + chosen + 1));
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 26 }} accessible={false}>
      {Array.from({ length: n }, (_, k) => {
        const h = Math.max(3, Math.round(24 / (1 + k)));
        const past = k < given, sel = !past && k < given + chosen;
        return <View key={k} style={{ width: 7, height: h, borderRadius: 2, backgroundColor: past ? "rgba(243,226,182,0.22)" : sel ? "#e3c98a" : "transparent", borderWidth: past || sel ? 0 : 1, borderColor: "rgba(243,226,182,0.4)" }} />;
      })}
    </View>
  );
}

// ---------- filters ----------
function Filters({ gt, tx, rarities, series, rarity, setRarity, seriesSel, setSeries }: {
  gt: ReturnType<typeof useGiftText>; tx: ReturnType<typeof useGardenText>; rarities: Rarity[]; series: GiftSeries[];
  rarity: Rarity | "all"; setRarity: (r: Rarity | "all") => void; seriesSel: GiftSeries | "all"; setSeries: (s: GiftSeries | "all") => void;
}) {
  const label = (x: GiftSeries) => (x === "feed" ? gt.feedSeries : tx[`ser_${x}`]);
  return (
    <View style={{ gap: 8, paddingTop: 14 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {(["all", ...rarities] as (Rarity | "all")[]).map((r) => (
          <Chip key={r} on={rarity === r} label={r === "all" ? gt.all : tx[`r_${r}`]} dot={r === "all" ? undefined : r} onPress={() => { tick(); setRarity(r); }} />
        ))}
      </ScrollView>
      {series.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {(["all", ...series] as (GiftSeries | "all")[]).map((x) => (
            <Chip key={x} on={seriesSel === x} label={x === "all" ? gt.allSeries : label(x)} onPress={() => { tick(); setSeries(x); }} quiet />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}
const DOT: Record<Rarity, string> = { legendary: "#e9cf99", epic: "#c6a65e", rare: "#5fc9a0", common: "rgba(243,226,182,0.45)" };
function Chip({ on, label, onPress, dot, quiet }: { on: boolean; label: string; onPress: () => void; dot?: Rarity; quiet?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label}
      style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: quiet ? 6 : 7, borderRadius: 999, borderWidth: 1, borderColor: on ? GOLD : "rgba(243,226,182,0.22)", backgroundColor: on ? "rgba(214,180,108,0.2)" : "rgba(255,255,255,0.03)" }}>
      {dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: DOT[dot] }} /> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: quiet ? 12 : 12.5, color: on ? CREAM : "rgba(243,226,182,0.75)" }}>{label}</Text>
    </Pressable>
  );
}

// ---------- a sticker in the grid ----------
function Tile({ it, size, picked, name, rarityLabel, onPress }: { it: GiftItem; size: number; picked: number; name: string; rarityLabel: string; onPress: () => void }) {
  const gt = useGiftText();
  const art = size - 16;
  const def = it.feed ? feedDef(it.id) : null;
  const glow = GLOW[it.rarity];
  const label = [name, rarityLabel, it.unique ? gt.onlyCopy : fillG(gt.dupesN, { n: it.dupes }), `+${it.base}`].join(", ");
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: picked > 0 }}
      style={({ pressed }) => ({ width: size, alignItems: "center", paddingTop: 6, paddingBottom: 4, borderRadius: 16, borderWidth: 1, borderColor: picked ? GOLD : "transparent", backgroundColor: picked ? "rgba(214,180,108,0.12)" : pressed ? "rgba(255,255,255,0.05)" : "transparent" })}>
      <View style={{ width: art, height: art, alignItems: "center", justifyContent: "center" }}>
        {glow ? <View style={{ position: "absolute", width: art * 0.92, height: art * 0.92, borderRadius: art, backgroundColor: glow.bg, shadowColor: glow.shadow, shadowOpacity: 0.9, shadowRadius: glow.r, shadowOffset: { width: 0, height: 0 } }} /> : null}
        {def ? <StickerArt def={def} size={art} /> : <CatalogArt id={it.id} size={art} />}
      </View>
      {!it.unique && it.dupes > 0 ? (
        <View style={{ position: "absolute", top: 2, end: 2, paddingHorizontal: 6, height: 18, borderRadius: 9, justifyContent: "center", backgroundColor: "rgba(4,26,19,0.88)", borderWidth: 1, borderColor: "rgba(214,180,108,0.6)" }}>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 10.5, color: CREAM }}>{`×${it.dupes}`}</Text>
        </View>
      ) : null}
      {picked ? (
        <View style={{ position: "absolute", top: 2, start: 2, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#e3c98a", borderWidth: 1, borderColor: "#fff4d6" }}>
          {picked > 1 ? <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 11, color: goldButton.text }}>{picked}</Text> : <Icon name="check" size={11} color={goldButton.text} />}
        </View>
      ) : null}
      <Text allowFontScaling={false} style={{ marginTop: 2, fontFamily: FONT.semibold, fontSize: 11, color: picked ? CREAM : "rgba(243,226,182,0.6)" }}>{`+${it.base}`}</Text>
    </Pressable>
  );
}

// ---------- the tray of chosen stickers ----------
function Tray({ gt, tx, picks, total, phase, note, reduce, insetBottom, trayRef, chipRefs, nameOf, onRemove, onGive }: {
  gt: ReturnType<typeof useGiftText>; tx: ReturnType<typeof useGardenText>; picks: Pick[]; total: number; phase: Phase; note: string | null; reduce: boolean; insetBottom: number;
  trayRef: React.RefObject<ScrollViewInstance | null>; chipRefs: Map<string, ViewT | null>; nameOf: (id: string) => string; onRemove: (id: string) => void; onGive: () => void;
}) {
  const groups = useMemo(() => { const m = new Map<string, number>(); for (const p of ordered(picks)) m.set(p.id, (m.get(p.id) ?? 0) + 1); return [...m.entries()]; }, [picks]);
  const n = picks.length;
  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
      <LinearGradient pointerEvents="none" colors={["rgba(4,26,19,0)", "rgba(4,26,19,0.9)"]} style={{ height: 22 }} />
      <View style={{ paddingTop: 10, paddingBottom: insetBottom + 12, paddingHorizontal: 16, gap: 10, backgroundColor: "#041a13", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(214,180,108,0.45)" }}>
        {phase === "giving" ? (
          <Animated.Text entering={reduce ? undefined : FadeIn} accessibilityLiveRegion="polite" style={{ fontFamily: FONT.display, fontSize: 17, color: CREAM, textAlign: "center", paddingVertical: 18 }}>{gt.giving}</Animated.Text>
        ) : (
          <>
            {n ? (
              <ScrollView ref={trayRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 6, paddingEnd: 6 }}>
                {groups.map(([id, c]) => {
                  const def = feedDef(id);
                  return (
                    <View key={id} ref={(v) => { chipRefs.set(id, v); }} collapsable={false} style={{ width: 46, height: 46 }}>
                      <View style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(214,180,108,0.12)", borderWidth: 1, borderColor: "rgba(214,180,108,0.55)" }}>
                        {def ? <StickerArt def={def} size={38} /> : <CatalogArt id={id} size={38} />}
                      </View>
                      <Pressable onPress={() => onRemove(id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${gt.remove}: ${nameOf(id)}`}
                        style={{ position: "absolute", top: -6, end: -6, minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", backgroundColor: "#0b3d2e", borderWidth: 1, borderColor: "rgba(243,226,182,0.6)" }}>
                        {c > 1 ? <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: 10, color: CREAM }}>{`×${c}`}</Text> : <Icon name="close" size={9} color={CREAM} />}
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            ) : null}
            <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: note ? GOLD : n ? CREAM : stageC.textMuted }} numberOfLines={2}>
              {note ?? (n ? `${n === 1 ? gt.stickers1 : fillG(gt.stickersN, { n })} · ${fillG(tx.gp, { n: total })}` : gt.pickHint)}
            </Text>
            <GoldButton title={gt.giveBtn} icon="heart" disabled={!n} onPress={onGive} />
          </>
        )}
      </View>
    </View>
  );
}

// ---------- the flight: a sticker rises from the tray and flies into the tree as golden light ----------
/** a point on the flight's curve (quadratic: from the tray, bending up and sideways, into the crown) */
const bez = (m: number, a: number, c: number, b: number) => { "worklet"; const u = 1 - m; return u * u * a + 2 * u * m * c + m * m * b; };
function Flyer({ f, onArrive }: { f: Flight; onArrive: () => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(f.delay, withTiming(1, { duration: FLIGHT, easing: Easing.inOut(Easing.cubic) }, (fin) => { if (fin) scheduleOnRN(onArrive); }));
  }, [f.delay, t]); // eslint-disable-line react-hooks/exhaustive-deps
  const { sx, sy, tx, ty } = f;
  const cx = (sx + tx) / 2 + (sx < tx ? -60 : 60), cy = Math.min(sy, ty) + (sy - ty) * 0.25 - 40;
  const body = useAnimatedStyle(() => {
    const k = t.value, m = interpolate(k, [0.1, 1], [0, 1], "clamp"), lift = interpolate(k, [0, 0.1], [0, 1], "clamp");
    return { opacity: k >= 1 ? 0 : 1, transform: [{ translateX: bez(m, sx, cx, tx) - 23 }, { translateY: bez(m, sy, cy, ty) - 23 - lift * 10 * (1 - m) }] };
  });
  const art = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0, 0.12, 0.32], [1, 1, 0], "clamp"), transform: [{ scale: interpolate(t.value, [0, 0.1, 0.32], [1, 1.14, 0.35], "clamp") }] }));
  const orb = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0.14, 0.3, 0.9, 1], [0, 1, 1, 0], "clamp"), transform: [{ scale: interpolate(t.value, [0.14, 0.32, 0.88, 1], [0.3, 1, 0.75, 1.9], "clamp") }] }));
  const def = feedDef(f.id);
  return (
    <>
      {[0.07, 0.14, 0.21].map((lag, j) => <Mote key={j} t={t} lag={lag} j={j} p={[sx, sy, cx, cy, tx, ty]} />)}
      <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top: 0, width: 46, height: 46, alignItems: "center", justifyContent: "center" }, body]}>
        <Animated.View style={[{ position: "absolute" }, art]}>{def ? <StickerArt def={def} size={38} /> : <CatalogArt id={f.id} size={38} />}</Animated.View>
        <Animated.View style={[{ position: "absolute", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,226,150,0.28)" }, orb]}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: "#fff4d0", shadowColor: "#ffd98a", shadowOpacity: 1, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } }} />
        </Animated.View>
      </Animated.View>
    </>
  );
}
/** a mote of light trailing the flight */
function Mote({ t, lag, j, p }: { t: SharedValue<number>; lag: number; j: number; p: [number, number, number, number, number, number] }) {
  const [sx, sy, cx, cy, tx, ty] = p;
  const st = useAnimatedStyle(() => {
    const m = interpolate(t.value, [0.1 + lag, 1], [0, 1], "clamp");
    return { opacity: t.value > 0.25 + lag && t.value < 0.98 ? 0.75 - j * 0.2 : 0, transform: [{ translateX: bez(m, sx, cx, tx) - 3 }, { translateY: bez(m, sy, cy, ty) - 3 }] };
  });
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top: 0, width: 6 - j, height: 6 - j, borderRadius: 3, backgroundColor: "#fff2c4", shadowColor: "#ffd98a", shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } }, st]} />;
}

// ---------- the only copy: a confirmation in the sheet's own style ----------
function Confirm({ gt, it, name, onYes, onNo }: { gt: ReturnType<typeof useGiftText>; it: GiftItem; name: string; onYes: () => void; onNo: () => void }) {
  const def = it.feed ? feedDef(it.id) : null;
  return (
    <Animated.View entering={FadeIn.duration(180)} style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(2,14,10,0.72)", alignItems: "center", justifyContent: "center", padding: 24 }]} accessibilityViewIsModal>
      <View style={{ width: "100%", maxWidth: 380, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.6)" }}>
        <LinearGradient colors={["#0f4a39", "#06251c"]} style={{ padding: 22, alignItems: "center", gap: 10 }}>
          {def ? <StickerArt def={def} size={104} /> : <CatalogArt id={it.id} size={104} />}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: "rgba(243,226,182,0.7)", textAlign: "center" }} numberOfLines={2}>{name}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 20, color: CREAM, textAlign: "center" }}>{gt.confirmT}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: stageC.textSoft, textAlign: "center" }}>{gt.confirmB}</Text>
          <View style={{ alignSelf: "stretch", gap: 10, marginTop: 8 }}>
            <GoldButton title={gt.confirmYes} onPress={onYes} />
            <OutlineButton title={gt.confirmNo} onStage onPress={onNo} />
          </View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
}

// ---------- states without a picker ----------
function NoDupes({ onQuests }: { onQuests: () => void }) {
  const gt = useGiftText();
  useCatalog();
  const ready = dailyPackReady();
  return (
    <View style={{ marginHorizontal: 16, marginVertical: 6, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "rgba(214,180,108,0.3)", backgroundColor: "rgba(255,255,255,0.03)", gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: CREAM }}>{gt.noDupesT}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: stageC.textMuted }}>{gt.noDupesB}</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        {ready ? <GoldButton compact title={gt.openDaily} onPress={() => { openDailyPack(); success(); }} /> : null}
        <OutlineButton compact onStage title={gt.quests} onPress={onQuests} />
      </View>
    </View>
  );
}
function EmptyAll({ gt, onQuests }: { gt: ReturnType<typeof useGiftText>; onQuests: () => void }) {
  useCatalog();
  const ready = dailyPackReady();
  return (
    <View style={{ margin: 16, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)", backgroundColor: "rgba(255,255,255,0.03)", gap: 8, alignItems: "center" }}>
      <BagIcon size={34} color={GOLD} />
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: CREAM, textAlign: "center" }}>{gt.emptyT}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: stageC.textMuted, textAlign: "center" }}>{gt.emptyB}</Text>
      <View style={{ alignSelf: "stretch", gap: 10, marginTop: 6 }}>
        {ready ? <GoldButton title={gt.openDaily} onPress={() => { openDailyPack(); success(); }} /> : null}
        <OutlineButton onStage title={gt.quests} onPress={onQuests} />
      </View>
    </View>
  );
}
function CapNote({ gt, cap, onDone }: { gt: ReturnType<typeof useGiftText>; cap: number; onDone: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i); }, []);
  const r = untilReset(now);
  const t = r.h > 0 ? fillG(gt.hm, { h: r.h, m: r.m }) : fillG(gt.min, { m: r.m });
  return (
    <View style={{ margin: 16, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)", backgroundColor: "rgba(255,255,255,0.03)", gap: 8, alignItems: "center" }}>
      <MoonIcon size={30} color={GOLD} />
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 18, color: CREAM, textAlign: "center" }}>{gt.capT}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: stageC.textSoft, textAlign: "center" }}>{fillG(gt.capB, { m: cap, t })}</Text>
      <View style={{ alignSelf: "stretch", marginTop: 8 }}><OutlineButton onStage title={gt.done} onPress={onDone} /></View>
    </View>
  );
}

// ---------- after the gift ----------
function Summary({ gt, tx, given, next, s, reduce, canMore, onShare, onMore, onDone }: {
  gt: ReturnType<typeof useGiftText>; tx: ReturnType<typeof useGardenText>; given: Given[]; next: string; s: ReturnType<typeof useGarden>; reduce: boolean; canMore: boolean;
  onShare: () => void; onMore: () => void; onDone: () => void;
}) {
  const { pro } = usePro();
  const total = given.reduce((a, x) => a + x.gp, 0);
  const traits = given.map((x) => x.trait).filter((x): x is Trait => !!x);
  const up = given.some((x) => x.up);
  const tree = activeTree(s, pro);
  const ids = Array.from(new Set(given.map((x) => x.id))).slice(0, 6);
  return (
    <Animated.View entering={reduce ? undefined : FadeIn.duration(420)} style={{ margin: 16, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.6)" }}>
      <LinearGradient colors={["rgba(214,180,108,0.16)", "rgba(214,180,108,0.04)"]} style={{ padding: 20, gap: 10, alignItems: "center" }}>
        <View style={{ position: "absolute", top: 6, left: 6, right: 6, bottom: 6, borderRadius: 17, borderWidth: 1, borderColor: "rgba(214,180,108,0.22)" }} pointerEvents="none" />
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: CREAM, textAlign: "center" }}>{given.length === 1 ? gt.sumT1 : fillG(gt.sumT, { n: given.length })}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 40, lineHeight: 46, color: "#f1d79a", textShadowColor: "rgba(255,217,138,0.4)", textShadowRadius: 12 }} accessibilityLiveRegion="polite">{fillG(tx.gp, { n: total })}</Text>
        <View style={{ flexDirection: "row", gap: 6, justifyContent: "center" }} accessible={false}>
          {ids.map((id) => { const d = feedDef(id); return <View key={id}>{d ? <StickerArt def={d} size={34} /> : <CatalogArt id={id} size={34} />}</View>; })}
        </View>
        {next ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: CREAM, textAlign: "center" }}>{next}</Text> : null}
        {traits.map((tr) => <Text key={tr} style={{ fontFamily: FONT.semibold, fontSize: 14, color: GOLD, textAlign: "center" }}>{fillG(tx.traitNew, { t: tx[`tr_${tr}` as "tr_star"] ?? tr })}</Text>)}
        {up && tree ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: GOLD, textAlign: "center" }}>{fillG(gt.sumStage, { stage: tx[`s${treeStage(tree, pro)}` as "s0"] })}</Text> : null}
        <View style={{ alignSelf: "stretch", gap: 10, marginTop: 8 }}>
          <GoldButton title={tx.shareMoment} icon="send" onPress={onShare} />
          <View style={{ flexDirection: "row", gap: 10 }}>
            {canMore ? <View style={{ flex: 1 }}><OutlineButton onStage title={gt.giveMore} onPress={onMore} /></View> : null}
            <View style={{ flex: 1 }}><OutlineButton onStage title={gt.done} onPress={onDone} /></View>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

/** the shareable moment: the tree on emerald, the growth of today and the stickers given */
function MomentCard({ format, ids, total }: { format: ShareFormat; ids: string[]; total: number }) {
  const gt = useGiftText();
  const tx = useGardenText();
  const { pro } = usePro();
  const s = useGarden();
  const tree = activeTree(s, pro);
  const { w, h } = CARD_SIZE[format];
  if (!tree) return null;
  const st = treeStage(tree, pro);
  const story = format === "story";
  const size = story ? w * 0.74 : format === "post" ? w * 0.5 : w * 0.32;
  const uniq = Array.from(new Set(ids)).slice(0, 5);
  return (
    <View style={{ width: w, height: h, overflow: "hidden", alignItems: "center", justifyContent: "space-between", paddingTop: story ? 64 : 22, paddingBottom: 16 }}>
      <LinearGradient colors={["#155a45", "#0a3528", "#041a13"]} style={StyleSheet.absoluteFill} />
      <View style={{ position: "absolute", top: 10, left: 10, right: 10, bottom: 10, borderRadius: 18, borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }} />
      <View style={{ alignItems: "center", gap: 4, paddingHorizontal: 24 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, color: GOLD }}>{tx.title}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: story ? 24 : 20, color: CREAM, textAlign: "center" }} numberOfLines={2}>{fillG(gt.moment, { name: tree.name || tx[`t_${tree.type}`] })}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: story ? 40 : 30, color: "#f1d79a" }}>{fillG(tx.gp, { n: total })}</Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <View style={{ position: "absolute", top: size * 0.05, width: size * 1.3, height: size * 1.3, borderRadius: size }}>
          <Svg width={size * 1.3} height={size * 1.3}><Defs><RadialGradient id="mcGlow" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe6a6" stopOpacity={0.45} /><Stop offset="1" stopColor="#ffe6a6" stopOpacity={0} /></RadialGradient></Defs><Circle cx={size * 0.65} cy={size * 0.65} r={size * 0.65} fill="url(#mcGlow)" /></Svg>
        </View>
        <TreeArt id={tree.id} type={tree.type} stage={st} traits={s.traits} season={seasonNow()} fruits={tree.fruits} size={size} still />
        <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
          {uniq.map((id) => { const d = feedDef(id); return <View key={id}>{d ? <StickerArt def={d} size={30} /> : <CatalogArt id={id} size={30} />}</View>; })}
        </View>
      </View>
      <BrandFoot />
    </View>
  );
}

// ---------- small icons (geometric, no emoji) ----------
export function BagIcon({ size = 22, color = "#f3e2b6" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9.2 4.2c.9 1 4.7 1 5.6 0l-.9 4.3h-3.8z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M8.6 8.5h6.8c2.4 1.6 3.9 4.6 3.6 7.6-.3 3-2.8 4.7-7 4.7s-6.7-1.7-7-4.7c-.3-3 1.2-6 3.6-7.6z" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
      <Path d="M12 12.1l.75 1.65 1.65.75-1.65.75L12 16.9l-.75-1.65-1.65-.75 1.65-.75z" fill={color} />
    </Svg>
  );
}
function SparkIcon({ size = 14, color = "#f3e2b6" }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 16 16"><Path d="M8 1l1.6 4.4L14 7l-4.4 1.6L8 13l-1.6-4.4L2 7l4.4-1.6z" fill={color} /></Svg>;
}
function MoonIcon({ size = 28, color = "#d6b46c" }: { size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 24 24"><Path d="M15.5 3.5a8.5 8.5 0 1 0 5 13.6A7 7 0 0 1 15.5 3.5z" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" /></Svg>;
}
