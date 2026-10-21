import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { Easing, cancelAnimation, interpolate, useAnimatedStyle, useDerivedValue, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { goBack } from "@/components/page";
import { FONT, R, stage as stageC, useTheme } from "@/lib/theme";
import { openPro, usePro } from "@/lib/pro";
import { useProPrice, withPrice } from "@/lib/purchases";
import { useLang } from "@/i18n";
import { STICKERS, stickerDupes, useGamify } from "@/features/feed/gamify";
import { StickerArt } from "@/features/feed/Sticker";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "@/features/feed/share";
import { success, tick } from "@/features/feed/haptics";
import { useReducedMotion } from "@/features/library/motion";
import { MAX_STAGE, SRCS, treeStage, type Tree, holdCelebrations, STICKER_GP_HINT, activeTree, canPlant, giveSticker, harvest, plotsOf, PLOT_STAGES, progressOf, resting, seasonNow, setActive, shamsRun, useGarden, weekGrowth, type Garden, type HistKind } from "./garden";
import { CATALOG_SIZE, RARITY_GP, SERIES, SERIES_SIZE, countOf, dailyPackReady, duplicates, isGiven, itemAt, openDailyPack, rarityOf, seriesOwned, totalOwned, useCatalog } from "./catalog";
import { CatalogArt } from "./CatalogArt";
import { Petals, Zellige } from "./Scene";
import { scheduleOnRN } from "react-native-worklets";
import { Fronds, Heavens, Motes, NearSand, setSkyPlace, useSkyPlace, Panorama, SKIES, SkyFill, TERRACE_H, Terrace, gardenLevel, inkFor, useSky, type Sky } from "./Landscape";
import { Plaque, TREE_H, TREE_W, TreeArt, geom } from "./Tree";
import { PlantFlow } from "./PlantFlow";
import { GardenNotifySetting, ProgressBar, StageCinematic, chime, useGardenTick } from "./widgets";
import { GIFT_FULL, fillG, skyLabel, useAgeText, useGardenText, useSkyText } from "./texts";

const SCENE_H = 520;

export default function GardenScreen() {
  useGardenTick();
  const params = useLocalSearchParams<{ plant?: string; share?: string; sky?: string; cine?: string; level?: string; look?: string }>();
  const tx = useGardenText();
  const ageTx = useAgeText();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const s = useGarden();
  const tree = activeTree(s, pro);
  const [planting, setPlanting] = useState(params.plant === "1" || params.plant === "demo" || s.trees.length === 0);
  const [gift, setGift] = useState(false);
  const [share, setShare] = useState(params.share === "1");
  const place = useSkyPlace();
  const skyT = useSkyText();
  const liveSky = useSky(place);
  // "?sky=night|dawn|day|golden" pins the light (previews and store screenshots)
  const sky = params.sky && params.sky in SKIES ? SKIES[params.sky as keyof typeof SKIES] : liveSky;
  const season = seasonNow();

  // pinch to zoom, drag to move (bounded), double tap resets
  const scale = useSharedValue(1), sx = useSharedValue(1), tx0 = useSharedValue(0), ty0 = useSharedValue(0), px = useSharedValue(0), py = useSharedValue(0);
  const plots = Math.max(plotsOf(s), s.trees.length);
  const plotW = Math.min(width * 0.78, 320);
  const worldW = Math.max(width + 80, plots * plotW + 40); // wider than the screen, so the idle camera drift never shows an edge
  const maxX = Math.max(0, (worldW - width) / 2 + 40);
  const pinch = Gesture.Pinch().onStart(() => { sx.value = scale.value; }).onUpdate((e) => { scale.value = Math.min(2.2, Math.max(0.8, sx.value * e.scale)); }).onEnd(() => { if (scale.value < 1) scale.value = withSpring(1); });
  // the panorama look (owner extension): dragging past the edge of the garden turns the camera, towards Makkah on
  // the right and the open desert on the left; on release it springs back to the tree. Reduce Motion: no look.
  const LOOK = width * 1.2, GAIN = 2;
  const look = useSharedValue(0), edged = useSharedValue(0);
  const lookC = useDerivedValue(() => Math.min(LOOK, Math.max(-LOOK, look.value)));
  const pan = Gesture.Pan().minDistance(8).onStart(() => { cancelAnimation(look); tx0.value = px.value + look.value / GAIN; ty0.value = py.value; }).onUpdate((e) => {
    const lim = maxX + (scale.value - 1) * width * 0.5;
    const raw = tx0.value + e.translationX;
    px.value = Math.min(lim, Math.max(-lim, raw));
    py.value = Math.min(120 * scale.value, Math.max(-120 * scale.value, ty0.value + e.translationY));
    if (reduce || scale.value > 1.05) return;
    look.value = Math.min(LOOK, Math.max(-LOOK, (raw - px.value) * GAIN));
    // a haptic tick when the look reaches its end (once per arrival)
    const atEdge = Math.abs(look.value) >= LOOK - 0.5;
    if (atEdge && !edged.value) { edged.value = 1; scheduleOnRN(tick); } else if (!atEdge && Math.abs(look.value) < LOOK * 0.9) edged.value = 0;
  }).onEnd((e) => {
    if (look.value === 0) return;
    edged.value = 0;
    look.value = withSpring(0, { damping: 17, stiffness: 95, mass: 1, velocity: Math.max(-1500, Math.min(1500, e.velocityX)) });
    px.value = withSpring(0, { damping: 18, stiffness: 120 });
  });
  const dbl = Gesture.Tap().numberOfTaps(2).onEnd(() => { scale.value = withSpring(1); px.value = withSpring(0); py.value = withSpring(0); look.value = withSpring(0); });
  const gesture = Gesture.Simultaneous(pinch, pan, dbl);
  // the camera: a gentle idle drift (parallax through every layer) and a soft push-in on events
  const drift = useSharedValue(0), cam = useSharedValue(1);
  useEffect(() => {
    if (reduce) return;
    drift.value = withRepeat(withSequence(withTiming(9, { duration: 9000, easing: Easing.inOut(Easing.sin) }), withTiming(-9, { duration: 10000, easing: Easing.inOut(Easing.sin) })), -1, true);
    return () => cancelAnimation(drift);
  }, [reduce, drift]);
  const camX = useDerivedValue(() => px.value + drift.value);
  // "?look=-1|1" (dev only) holds the camera turned to Makkah or the desert (store previews)
  useEffect(() => { if (__DEV__ && params.look && !reduce) look.value = Math.max(-1, Math.min(1, Number(params.look) || 0)) * LOOK; }, [params.look, reduce, LOOK, look]);
  const frondX = useDerivedValue(() => camX.value + lookC.value * 0.8);
  const petalSt = useAnimatedStyle(() => ({ opacity: interpolate(Math.abs(lookC.value), [0, width * 0.4], [1, 0], "clamp") }));
  const focus = () => { if (!reduce) cam.value = withSequence(withTiming(1.07, { duration: 650, easing: Easing.out(Easing.cubic) }), withDelay(1100, withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }))); };
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: px.value + drift.value + lookC.value }, { translateY: py.value + (cam.value - 1) * 260 }, { scale: scale.value * cam.value }] }));
  // a new decoration (from a gift) arrives with a dust of light around the tree
  const [dust, setDust] = useState(0);
  const traitsN = useRef(s.traits.length);
  useEffect(() => { if (s.traits.length > traitsN.current) { setDust(Date.now()); focus(); } traitsN.current = s.traits.length; }, [s.traits.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (planting) {
    return (
      <PlantFlow demo={params.plant === "demo"} onDone={() => { setPlanting(false); router.setParams({ plant: undefined }); }} onLater={s.trees.length ? () => setPlanting(false) : () => goBack()} />
    );
  }
  if (!tree) return null;
  const p = progressOf(tree, pro);
  const ink = inkFor(sky);
  const petal = tree.type === "pomegranate" ? "#e0c184" : s.traits.includes("blossoms") ? "#f5ebd7" : "#9fd28a";
  const level = __DEV__ && params.level ? Number(params.level) : gardenLevel(s.trees.map((x) => treeStage(x, pro)));
  const H = SCENE_H + insets.top;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} bounces={false}>
        {/* ---------- the scene: a living landscape in parallax ---------- */}
        <View style={{ height: H, overflow: "hidden" }}>
        <GestureDetector gesture={gesture}>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} accessibilityLabel={tx.zoomHint}>
            <Panorama width={width} height={H} ground={H - TERRACE_H + 6} sky={sky} level={level} px={camX} still={reduce} scale={1.9} look={lookC} lookMax={LOOK} />
            <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, petalSt]}><Petals width={width} height={SCENE_H} color={petal} still={reduce} /></Animated.View>
            <Animated.View style={[{ position: "absolute", left: (width - worldW) / 2, width: worldW, bottom: 0, height: SCENE_H - 40 }, world]}>
              <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                <Terrace width={worldW} level={level} night={sky.night} still={reduce} fountain={s.traits.includes("fountain")} bench={s.traits.includes("bench")} interactive />
              </View>
              {!reduce ? <NearSand worldW={worldW} width={width} night={sky.night} still={reduce} /> : null}
              <View style={{ position: "absolute", bottom: TERRACE_H - 12 - 30 - plotW * (48 / 360), left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }}>
                {Array.from({ length: plots }, (_, i) => {
                  const tr = s.trees[i];
                  if (!tr) return <EmptyPlot key={i} w={plotW} pro={pro} canPlantNow={canPlant(s, pro)} onPlant={() => setPlanting(true)} />;
                  return <TreePlot key={tr.id} tr={tr} w={plotW} active={tr.id === tree.id} s={s} season={season} reduce={reduce} dust={tr.id === tree.id ? dust : 0} onEvent={focus} />;
                })}
              </View>
            </Animated.View>
            <Motes width={width} height={H} night={sky.night} still={reduce} />
            <Fronds width={width} height={H} px={frondX} />
          </View>
        </GestureDetector>
            {/* top bar: outside the scene's gestures, whose double tap would swallow the buttons' taps */}
            <View style={{ position: "absolute", top: insets.top + 6, left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <RoundBtn icon="chevronLeft" label="Back" onPress={() => goBack()} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: ink, opacity: 0.85 }}>{season === "ramadan" ? tx.ramadan : season === "eid" ? tx.eid : tx.kicker}</Text>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: ink }}>{tx.missionTitle}</Text>
                <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: ink, opacity: 0.78, marginTop: 1, textShadowColor: "rgba(0,0,0,0.35)", textShadowRadius: 4 }}>{skyLabel(skyT, place === "mecca", sky.next)}</Text>
              </View>
              <RoundBtn icon="grid" label={tx.album} onPress={() => router.push("/sticker-collection" as Href)} />
              <RoundBtn icon="send" label={tx.share} onPress={() => setShare(true)} />
            </View>
        </View>

        {/* ---------- the tree: stage, next stage, water, fruits ---------- */}
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, padding: 16, gap: 8 }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{tree.name || tx[`t_${tree.type}`]}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{tx[`t_${tree.type}`]} · {tx[`s${p.stage}` as "s0"]} · {fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}</Text>
            <ProgressBar frac={p.frac} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{p.held ? tx.held : p.left ? fillG(tx.next, { n: p.left }) : p.wait ? ageTx(p.age, p.wait).wait : tx.maxed}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{ageTx(p.age, 0).age}{!p.held && p.left && p.wait ? ` · ${ageTx(p.age, p.wait).wait}` : ""}</Text>
            {resting(s) ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{tx.resting}</Text> : null}
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{s.watered === todayNum() ? tx.watered : tx.waterHint}</Text>
            {shamsRun(s) >= 2 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.gold }}>{fillG(tx.shamsRunT, { n: shamsRun(s) })}</Text> : null}
            {pro ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.gold }}>{tx.proDouble}</Text> : null}
          </View>

          {p.held ? <FlourishCard /> : null}

          <Harvest treeId={tree.id} fruits={tree.fruits} stage={p.stage} reduce={reduce} />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}><GoldButton title={tx.feed} icon="heart" onPress={() => setGift(true)} /></View>
            <DailyPack />
          </View>

          <WeekCard s={s} />
          <CollectionCard />

          {canPlant(s, pro) && s.trees.length > 0 ? <OutlineButton title={tx.plantMore} icon="plus" onPress={() => setPlanting(true)} /> : null}
          {!pro && s.trees.length > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{tx.proMore}</Text> : null}

          <History s={s} treeId={tree.id} />
          <View style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, paddingHorizontal: 16, paddingVertical: 6 }}>
            <GardenNotifySetting />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line }}>
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{skyT.label}</Text>
              {(["mecca", "local"] as const).map((k) => (
                <Pressable key={k} onPress={() => { tick(); setSkyPlace(k); }} accessibilityRole="radio" accessibilityState={{ selected: place === k }}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: place === k ? t.gold : t.line, backgroundColor: place === k ? "rgba(214,180,108,0.14)" : "transparent" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{k === "mecca" ? skyT.mecca : skyT.local}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {gift ? <GiftSheet onClose={() => setGift(false)} /> : null}
      {__DEV__ && params.cine ? <StageCinematic ev={{ tree, stage: Number(params.cine) || 1 }} onClose={() => router.setParams({ cine: undefined })} /> : null}
      {share ? <ShareSheet visible noDecoration onClose={() => setShare(false)} link="https://quranmasterclass.com/app" message={`${tx.shareMsg}: ${tree.name}, ${tx[`s${p.stage}` as "s0"]}`} renderCard={(f) => <GardenCard format={f} />} /> : null}
    </GestureHandlerRootView>
  );
}
/** one tree in the scene: a tap waters it (a stream of drops into the basin), rustles the crown and lets a few
 *  leaves fall; with ripe fruits the active tree is harvested by a tap (the same harvest as the button below), the
 *  fruits float up into a golden glow. New decorations arrive with a dust of light. All purely visual. */
type BurstKind = "water" | "fruit" | "dust";
function TreePlot({ tr, w, active, s, season, reduce, dust, onEvent }: { tr: Tree; w: number; active: boolean; s: Garden; season: ReturnType<typeof seasonNow>; reduce: boolean; dust: number; onEvent: () => void }) {
  const tx = useGardenText();
  const { pro } = usePro();
  const pp = progressOf(tr, pro);
  const [nudge, setNudge] = useState(0);
  const [burst, setBurst] = useState<{ id: number; kind: BurstKind; xp: number } | null>(null);
  useEffect(() => { if (dust) { success(); setBurst({ id: dust, kind: "dust", xp: 0 }); setNudge((n) => n + 1); } }, [dust]);
  const g = geom(tr.type, pp.stage), k = w / TREE_W;
  const cx = w / 2, cy = (pp.stage < 3 ? 300 : g.top + g.crown * 0.55) * k, by = 312 * k;
  const ripe = active && tr.fruits > 0 && pp.stage >= 5;
  const onPress = () => {
    if (ripe) {
      const xp = harvest(tr.id);
      if (xp) { chime(); onEvent(); setBurst({ id: Date.now(), kind: "fruit", xp }); setNudge((n) => n + 1); return; }
    }
    tick(); setActive(tr.id); setBurst({ id: Date.now(), kind: "water", xp: 0 });
    setTimeout(() => { setNudge((n) => n + 1); tick(); }, reduce ? 0 : 520);
  };
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${tr.name}, ${tx[`s${pp.stage}` as "s0"]}${ripe ? `. ${fillG(tx.fruitsReady, { n: tr.fruits })}` : ""}`} style={{ width: w, alignItems: "center" }}>
      <View style={{ width: w, height: (TREE_H * w) / TREE_W }}>
        {ripe ? <RipeHalo x={cx} y={cy} r={Math.max(40, g.crown * k * 1.1)} still={reduce} /> : null}
        <TreeArt id={tr.id} type={tr.type} stage={pp.stage} traits={s.traits} season={season} resting={resting(s)} fruits={tr.fruits} size={w} still={reduce} nudge={nudge} />
        {burst && !reduce ? <Burst key={burst.id} kind={burst.kind} cx={cx} cy={cy} by={by} spread={Math.max(30, g.crown * k)} leaf={tr.type === "palm" ? "#3f9a68" : "#7fc48a"} /> : null}
        {burst?.kind === "fruit" ? <FloatText key={`t${burst.id}`} x={cx} y={cy - 30} text={fillG(tx.harvested, { n: burst.xp })} still={reduce} /> : null}
      </View>
      <View style={{ marginTop: -18 }}><Plaque name={tr.name || tx[`t_${tr.type}`]} width={Math.min(170, w * 0.6)} /></View>
    </Pressable>
  );
}
function RipeHalo({ x, y, r, still }: { x: number; y: number; r: number; still: boolean }) {
  const v = useSharedValue(0.5);
  useEffect(() => { if (still) return; v.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true); return () => cancelAnimation(v); }, [still, v]);
  const st = useAnimatedStyle(() => ({ opacity: 0.25 + v.value * 0.45, transform: [{ scale: 0.92 + v.value * 0.1 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, borderWidth: 1.5, borderColor: "rgba(243,226,182,0.8)", backgroundColor: "rgba(255,226,150,0.12)" }, st]} />;
}
/** one pooled burst: a watering stream with a splash and falling leaves, fruits rising into a gold glow, or a dust
 *  of light (at most 12 particles, one clock) */
function Burst({ kind, cx, cy, by, spread, leaf }: { kind: BurstKind; cx: number; cy: number; by: number; spread: number; leaf: string }) {
  const v = useSharedValue(0);
  const dur = kind === "water" ? 2200 : kind === "fruit" ? 1500 : 1800;
  useEffect(() => { v.value = withTiming(1, { duration: dur, easing: Easing.linear }); }, [v, dur]);
  const glow = useAnimatedStyle(() => {
    const k = v.value;
    if (kind === "water") return { opacity: interpolate(k, [0.2, 0.3, 0.6], [0, 0.8, 0], "clamp"), transform: [{ scale: interpolate(k, [0.2, 0.6], [0.3, 1.4], "clamp") }] };
    return { opacity: interpolate(k, [0, 0.25, 1], [0, 0.9, 0]), transform: [{ scale: 0.5 + k * 0.9 }] };
  });
  const gx = kind === "water" ? cx : cx, gy = kind === "water" ? by : kind === "fruit" ? cy - 70 : cy, gr = kind === "water" ? 50 : spread * 1.2;
  const n = kind === "water" ? 12 : kind === "fruit" ? 8 : 12;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[{ position: "absolute", left: gx - gr, top: gy - gr * (kind === "water" ? 0.35 : 1), width: gr * 2, height: kind === "water" ? gr * 0.7 : gr * 2, borderRadius: gr, backgroundColor: kind === "water" ? "rgba(215,250,236,0.35)" : "rgba(255,222,140,0.28)", borderWidth: kind === "water" ? 1.2 : 0, borderColor: "#effff8" }, glow]} />
      {Array.from({ length: n }, (_, i) => <Particle key={i} i={i} n={n} v={v} kind={kind} cx={cx} cy={cy} by={by} spread={spread} leaf={leaf} />)}
    </View>
  );
}
function Particle({ i, n, v, kind, cx, cy, by, spread, leaf }: { i: number; n: number; v: SharedValue<number>; kind: BurstKind; cx: number; cy: number; by: number; spread: number; leaf: string }) {
  const a = (i / n) * Math.PI * 2 + i * 0.7, dx = Math.cos(a) * spread * (0.4 + (i % 3) * 0.25), dy0 = Math.sin(a) * spread * 0.4;
  const st = useAnimatedStyle(() => {
    const k = v.value;
    if (kind === "water") {
      if (i < 8) { // the stream: drops along an arc from the upper left into the basin
        const t = interpolate(k, [i * 0.03, i * 0.03 + 0.28], [0, 1], "clamp");
        const sx = cx - spread * 1.6, sy = by - spread * 2.2;
        return { opacity: t > 0 && t < 1 ? 0.95 : 0, transform: [{ translateX: sx + (cx - sx) * t + (i % 2) * 3 }, { translateY: sy + (by - 6 - sy) * t * t - Math.sin(t * Math.PI) * 30 }, { scaleY: 1.6 }] };
      }
      // then leaves shaken loose by the rustle
      const t = interpolate(k, [0.3, 1], [0, 1], "clamp");
      return { opacity: interpolate(t, [0, 0.1, 0.75, 1], [0, 1, 0.9, 0]), transform: [{ translateX: cx + dx * 0.5 + Math.sin(t * 6 + i) * 14 }, { translateY: cy + dy0 + t * (110 + (i % 3) * 30) }, { rotate: `${t * 400 + i * 50}deg` }, { scaleX: Math.cos(t * 12 + i) }] };
    }
    if (kind === "fruit") return { opacity: interpolate(k, [0, 0.1, 0.75, 1], [0, 1, 1, 0]), transform: [{ translateX: cx + dx * (1 - k) * 0.8 - 4 }, { translateY: cy + dy0 * (1 - k) - k * (70 + (i % 3) * 12) }, { scale: 1.2 - k * 0.7 }] };
    const r = spread * (0.3 + k * (0.9 + (i % 4) * 0.15));
    return { opacity: interpolate(k, [0, 0.15, 0.7, 1], [0, 1, 0.8, 0]), transform: [{ translateX: cx + Math.cos(a + k * 1.2) * r - 2 }, { translateY: cy + Math.sin(a + k * 1.2) * r * 0.8 - k * 30 }, { scale: 1 - k * 0.5 }] };
  });
  const style = kind === "fruit" ? { width: 10, height: 10, borderRadius: 5, backgroundColor: "#f3c35a", shadowColor: "#ffd98a", shadowOpacity: 1, shadowRadius: 7, shadowOffset: { width: 0, height: 0 } }
    : kind === "dust" ? { width: 4, height: 4, borderRadius: 2, backgroundColor: "#fff2c4", shadowColor: "#ffe08a", shadowOpacity: 1, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } }
    : i < 8 ? { width: 4, height: 6, borderRadius: 3, backgroundColor: "#dff8ee" } : { width: 9, height: 5, borderRadius: 5, backgroundColor: leaf };
  return <Animated.View style={[{ position: "absolute" }, style, st]} />;
}
function FloatText({ x, y, text, still }: { x: number; y: number; text: string; still: boolean }) {
  const v = useSharedValue(still ? 0.5 : 0);
  useEffect(() => { if (!still) v.value = withSequence(withTiming(0.5, { duration: 500, easing: Easing.out(Easing.cubic) }), withDelay(700, withTiming(1, { duration: 500 }))); }, [still, v]);
  const st = useAnimatedStyle(() => ({ opacity: interpolate(v.value, [0, 0.2, 0.7, 1], [0, 1, 1, 0]), transform: [{ translateY: -v.value * 50 }] }));
  return <Animated.Text accessibilityLiveRegion="polite" style={[{ position: "absolute", left: x - 100, width: 200, top: y, textAlign: "center", fontFamily: FONT.display, fontSize: 22, color: "#f6e7bf", textShadowColor: "rgba(0,0,0,0.5)", textShadowRadius: 6 }, st]}>{text}</Animated.Text>;
}

const todayNum = () => { const t = Date.now(); return Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000); };

function RoundBtn({ icon, label, onPress }: { icon: "chevronLeft" | "grid" | "send"; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(8,38,29,0.55)", borderWidth: 1, borderColor: "rgba(233,207,153,0.4)", opacity: pressed ? 0.8 : 1 })}>
      <Icon name={icon} color="#f3e2b6" size={18} />
    </Pressable>
  );
}

function EmptyPlot({ w, pro, canPlantNow, onPlant }: { w: number; pro: boolean; canPlantNow: boolean; onPlant: () => void }) {
  const tx = useGardenText();
  return (
    <Pressable onPress={() => (canPlantNow ? onPlant() : !pro ? openPro("general") : undefined)} accessibilityRole="button" accessibilityLabel={canPlantNow ? tx.plantMore : tx.proMore}
      style={{ width: w, height: w * 0.8, alignItems: "center", justifyContent: "flex-end", paddingBottom: 18 }}>
      <View style={{ width: w * 0.5, height: 26, borderRadius: 13, backgroundColor: "#6a4a2c", opacity: 0.8 }} />
      <View style={{ position: "absolute", bottom: 54, alignItems: "center", gap: 4 }}>
        <Icon name={canPlantNow ? "plus" : "lock"} color="#f3e2b6" size={22} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "#f3e2b6", textAlign: "center", maxWidth: w * 0.7 }}>{canPlantNow ? tx.newPlot : pro ? fillG(tx.plotLocked, { n: PLOT_STAGES[0] }) : tx.proMore}</Text>
      </View>
    </Pressable>
  );
}

function FlourishCard() {
  const tx = useGardenText();
  const price = useProPrice();
  return (
    <LinearGradient colors={["#0b3d2e", "#1d6b52"]} style={{ borderRadius: R.card, padding: 18, gap: 10, borderWidth: 1, borderColor: "#c6a65e" }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 20, color: "#f3e2b6" }}>{tx.flourishTitle}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: stageC.textSoft }}>{tx.flourishBody}</Text>
      <GoldButton title={withPrice(tx.flourishCta, price)} icon="starBig" onPress={() => openPro("general")} />
    </LinearGradient>
  );
}

function Harvest({ treeId, fruits, stage, reduce }: { treeId: string; fruits: number; stage: number; reduce: boolean }) {
  const tx = useGardenText();
  const t = useTheme();
  const [got, setGot] = useState(0);
  const fly = useSharedValue(0);
  const st = useAnimatedStyle(() => ({ opacity: fly.value > 0 && fly.value < 1 ? 1 : 0, transform: [{ translateY: -fly.value * 70 }, { scale: 1 + fly.value * 0.4 }] }));
  const go = () => {
    const xp = harvest(treeId);
    if (!xp) return;
    chime(); setGot(xp);
    if (!reduce) { fly.value = 0; fly.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }); }
  };
  return (
    <View style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 4, minWidth: 54 }}>
        {Array.from({ length: Math.max(1, Math.min(5, fruits)) }, (_, i) => <View key={i} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: fruits ? "#f3b14a" : t.line, shadowColor: "#ffd27a", shadowOpacity: fruits ? 0.9 : 0, shadowRadius: 6 }} />)}
      </View>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{fruits ? fillG(tx.fruitsReady, { n: fruits }) : stage >= 5 ? tx.noFruit : tx.fruitFrom}</Text>
      {fruits ? <GoldButton compact title={tx.harvest} onPress={go} /> : null}
      <Animated.Text pointerEvents="none" style={[{ position: "absolute", right: 30, top: 12, fontFamily: FONT.display, fontSize: 20, color: t.gold }, st]} accessibilityLiveRegion="polite">{got ? fillG(tx.harvested, { n: got }) : ""}</Animated.Text>
    </View>
  );
}

function DailyPack() {
  const tx = useGardenText();
  useCatalog();
  const ready = dailyPackReady();
  return (
    <View style={{ flex: 1 }}>
      <OutlineButton title={ready ? `${tx.dailyPack}: ${tx.openPack}` : tx.dailyPack} disabled={!ready} onPress={() => { openDailyPack(); success(); }} />
      {!ready ? <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: "gray", marginTop: 4, textAlign: "center" }}>{tx.packDone}</Text> : null}
    </View>
  );
}

function WeekCard({ s }: { s: Garden }) {
  const tx = useGardenText();
  const t = useTheme();
  const w = weekGrowth(s);
  const max = Math.max(1, ...SRCS.map((x) => w.by[x]));
  return (
    <View style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, padding: 16, gap: 10 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{tx.weekT}</Text>
      <Text style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{tx.madeGrow}</Text>
      {SRCS.map((x) => (
        <View key={x} style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.ink }}>{tx[`src_${x}`]}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>+{w.by[x]}</Text>
          </View>
          <ProgressBar frac={w.by[x] / max} color={x === "shams" ? "#c6a65e" : t.accent} />
        </View>
      ))}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{fillG(tx.weekGrew, { n: w.now })}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{fillG(tx.weekBefore, { n: w.before })}</Text>
    </View>
  );
}

function CollectionCard() {
  const tx = useGardenText();
  const t = useTheme();
  useCatalog();
  const owned = totalOwned();
  return (
    <Pressable onPress={() => router.push("/sticker-collection" as Href)} accessibilityRole="button" style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
      <CatalogArt id="a:2:255" size={52} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 18, color: t.ink }}>{tx.album}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{fillG(tx.albumLead, { n: owned, m: CATALOG_SIZE })}</Text>
      </View>
      <Icon name="chevronRight" color={t.muted} size={16} />
    </Pressable>
  );
}

function History({ s, treeId }: { s: Garden; treeId: string }) {
  const tx = useGardenText();
  const t = useTheme();
  const { lang } = useLang();
  const tr = s.trees.find((x) => x.id === treeId);
  if (!tr) return null;
  const label = (k: HistKind, n?: number) => (k === "plant" ? tx.h_plant : k === "stage" ? fillG(tx.h_stage, { n: n ?? 0 }) : k === "gift" ? tx.h_gift : k === "harvest" ? fillG(tx.h_harvest, { n: n ?? 0 }) : tx.h_water);
  const fmt = (d: number) => new Date(d * 86400000).toLocaleDateString(lang, { day: "numeric", month: "short" });
  const items = [...tr.hist].reverse().filter((h, i, a) => h.k !== "water" || a.findIndex((x) => x.k === "water") === i).slice(0, 14);
  return (
    <View style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, padding: 16, gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{tx.history}</Text>
      {items.map((h, i) => (
        <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <Text style={{ fontFamily: h.k === "stage" ? FONT.semibold : FONT.regular, fontSize: 14, color: t.ink, flex: 1 }}>{label(h.k, h.n)}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{fmt(h.d)}</Text>
        </View>
      ))}
    </View>
  );
}

/** "Give stickers": duplicates first, then (with confirmation) single stickers from the album */
function GiftSheet({ onClose }: { onClose: () => void }) {
  const tx = useGardenText();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { pro } = usePro();
  const gm = useGamify();
  const s = useGarden();
  useCatalog();
  const [tab, setTab] = useState<"dupes" | "unique">("dupes");
  const [msg, setMsg] = useState<string | null>(null);
  const { lang } = useLang();
  useEffect(() => holdCelebrations(), []); // stage-up celebration only after the sheet has closed
  const dupFeed = Object.entries(stickerDupes()).filter(([, n]) => n > 0).map(([id]) => id);
  const dupCat = duplicates();
  const uniqueFeed = STICKERS.filter((x) => gm.stickers[x.id] && !s.given.includes(x.id)).map((x) => x.id);
  const uniqueCat = useMemo(() => {
    const out: string[] = [];
    for (const se of SERIES) { if (seriesOwned(se) === 0) continue; for (let i = 0; i < SERIES_SIZE[se] && out.length < 400; i++) { const id = itemAt(se, i).id; if (countOf(id) === 1 && !isGiven(id)) out.push(id); } }
    return out;
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps
  const list = tab === "dupes" ? [...dupFeed, ...dupCat] : [...uniqueFeed, ...uniqueCat];
  const give = (id: string, unique: boolean) => {
    const run = () => {
      const r = giveSticker(id, unique, pro);
      if (!r) return;
      if (r.full) { setMsg(GIFT_FULL[lang] ?? GIFT_FULL.en); return; }
      tick(); if (r.trait) chime();
      setMsg(`${fillG(tx.gp, { n: r.gp })}${r.trait ? ` · ${fillG(tx.traitNew, { t: tx[`tr_${r.trait}` as "tr_star"] })}` : ""}`);
    };
    if (unique) Alert.alert(tx.confirmTitle, tx.confirmBody, [{ text: tx.cancel, style: "cancel" }, { text: tx.give, onPress: run }]);
    else run();
  };
  const gpOf = (id: string, unique: boolean) => { const f = STICKERS.find((x) => x.id === id); return f ? STICKER_GP_HINT(f, unique) : RARITY_GP[rarityOf(id)] * (unique ? 2 : 1); };
  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)" }} onPress={onClose} accessibilityLabel={tx.close} />
      <View style={{ maxHeight: "78%", backgroundColor: t.bg, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16, paddingBottom: insets.bottom + 16, gap: 10 }}>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink }}>{tx.feed}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.muted }}>{tx.feedLead}</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["dupes", "unique"] as const).map((k) => (
            <Pressable key={k} onPress={() => setTab(k)} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: tab === k ? t.accent : t.surface, borderWidth: 1, borderColor: t.line }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: tab === k ? t.onAccent : t.ink }}>{k === "dupes" ? tx.dupes : tx.unique}</Text>
            </Pressable>
          ))}
        </View>
        {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.gold }}>{msg}</Text> : null}
        {list.length === 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, paddingVertical: 20 }}>{tab === "dupes" ? tx.noDupes : tx.missing}</Text> : (
          <FlatList data={list} keyExtractor={(x) => x} numColumns={4} initialNumToRender={16} windowSize={5} removeClippedSubviews
            renderItem={({ item }) => {
              const f = STICKERS.find((x) => x.id === item);
              const n = f ? (tab === "dupes" ? stickerDupes()[item] : 1) : tab === "dupes" ? countOf(item) - 1 : 1;
              return (
                <Pressable onPress={() => give(item, tab === "unique")} accessibilityRole="button" accessibilityLabel={`${tx.give}, ${fillG(tx.gp, { n: gpOf(item, tab === "unique") })}`} style={{ flex: 1 / 4, alignItems: "center", padding: 4 }}>
                  {f ? <StickerArt def={f} size={64} /> : <CatalogArt id={item} size={64} />}
                  <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{tab === "dupes" ? `×${n}` : ""} +{gpOf(item, tab === "unique")}</Text>
                </Pressable>
              );
            }} />
        )}
      </View>
    </Modal>
  );
}

/** the shareable "My garden" image */
function GardenCard({ format }: { format: ShareFormat }) {
  const tx = useGardenText();
  const { pro } = usePro();
  const s = useGarden();
  const tree = activeTree(s, pro)!;
  const p = progressOf(tree, pro);
  const { w, h } = CARD_SIZE[format];
  const sky: Sky = useMemo(() => SKIES.golden, []);
  const ground = h - 20 - 46 - w * 0.9 * (48 / 360) + 14;
  return (
    <View style={{ width: w, height: h, overflow: "hidden", alignItems: "center", justifyContent: "flex-end" }}>
      <SkyFill sky={sky} />
      <Heavens sky={sky} width={w} height={ground} still />
      <Panorama width={w} height={h} ground={ground} sky={sky} level={treeStage(tree, pro)} still withSky={false} />
      <View style={{ position: "absolute", top: format === "story" ? 70 : 26, left: 0, right: 0, alignItems: "center", gap: 4 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: inkFor(sky) }}>{tx.title}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 26, color: inkFor(sky) }}>{tx[`s${p.stage}` as "s0"]}</Text>
      </View>
      <TreeArt id={tree.id} type={tree.type} stage={p.stage} traits={s.traits} season={seasonNow()} fruits={tree.fruits} size={w * 0.9} still />
      <View style={{ marginTop: -14 }}><Plaque name={tree.name || tx[`t_${tree.type}`]} width={160} /></View>
      <Zellige width={w} height={20} />
      <View style={{ width: w, backgroundColor: "#0b3d2e", paddingVertical: 12 }}><BrandFoot /></View>
    </View>
  );
}
