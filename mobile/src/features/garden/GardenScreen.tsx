import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
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
import { MAX_STAGE, SRCS, STICKER_GP_HINT, activeTree, canPlant, giveSticker, harvest, plotsOf, PLOT_STAGES, progressOf, resting, seasonNow, setActive, shamsRun, useGarden, weekGrowth, type Garden, type HistKind } from "./garden";
import { CATALOG_SIZE, RARITY_GP, SERIES, SERIES_SIZE, countOf, dailyPackReady, duplicates, isGiven, itemAt, openDailyPack, rarityOf, seriesOwned, totalOwned, useCatalog } from "./catalog";
import { CatalogArt } from "./CatalogArt";
import { Celestial, Courtyard, FarLayer, Parallax, Petals, Sky, Zellige, phaseNow, skyInk } from "./Scene";
import { Plaque, TreeArt } from "./Tree";
import { PlantFlow } from "./PlantFlow";
import { GardenNotifySetting, ProgressBar, chime, useGardenTick } from "./widgets";
import { fillG, useGardenText } from "./texts";

const SCENE_H = 470;

export default function GardenScreen() {
  useGardenTick();
  const params = useLocalSearchParams<{ plant?: string; share?: string }>();
  const tx = useGardenText();
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const s = useGarden();
  const tree = activeTree(s, pro);
  const [planting, setPlanting] = useState(params.plant === "1" || s.trees.length === 0);
  const [gift, setGift] = useState(false);
  const [share, setShare] = useState(params.share === "1");
  const phase = useMemo(() => phaseNow(), []);
  const season = seasonNow();

  // pinch to zoom, drag to move (bounded), double tap resets
  const scale = useSharedValue(1), sx = useSharedValue(1), tx0 = useSharedValue(0), ty0 = useSharedValue(0), px = useSharedValue(0), py = useSharedValue(0);
  const plots = Math.max(plotsOf(s), s.trees.length);
  const plotW = Math.min(width * 0.78, 320);
  const worldW = Math.max(width, plots * plotW + 40);
  const maxX = Math.max(0, (worldW - width) / 2 + 40);
  const pinch = Gesture.Pinch().onStart(() => { sx.value = scale.value; }).onUpdate((e) => { scale.value = Math.min(2.2, Math.max(0.8, sx.value * e.scale)); }).onEnd(() => { if (scale.value < 1) scale.value = withSpring(1); });
  const pan = Gesture.Pan().minDistance(8).onStart(() => { tx0.value = px.value; ty0.value = py.value; }).onUpdate((e) => {
    const lim = maxX + (scale.value - 1) * width * 0.5;
    px.value = Math.min(lim, Math.max(-lim, tx0.value + e.translationX));
    py.value = Math.min(120 * scale.value, Math.max(-120 * scale.value, ty0.value + e.translationY));
  });
  const dbl = Gesture.Tap().numberOfTaps(2).onEnd(() => { scale.value = withSpring(1); px.value = withSpring(0); py.value = withSpring(0); });
  const gesture = Gesture.Simultaneous(pinch, pan, dbl);
  const world = useAnimatedStyle(() => ({ transform: [{ translateX: px.value }, { translateY: py.value }, { scale: scale.value }] }));

  if (planting) {
    return (
      <PlantFlow onDone={() => { setPlanting(false); router.setParams({ plant: undefined }); }} onLater={s.trees.length ? () => setPlanting(false) : () => goBack()} />
    );
  }
  if (!tree) return null;
  const p = progressOf(tree.gp, pro);
  const ink = skyInk(phase);
  const petal = tree.type === "pomegranate" ? "#ff8a65" : s.traits.includes("blossoms") ? "#f6d6e0" : "#9fd28a";

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} bounces={false}>
        {/* ---------- the scene ---------- */}
        <GestureDetector gesture={gesture}>
          <View style={{ height: SCENE_H + insets.top, overflow: "hidden" }} accessibilityLabel={tx.zoomHint}>
            <Sky phase={phase} />
            <Celestial phase={phase} width={width} height={SCENE_H} />
            <Parallax x={px} factor={0.25} style={{ position: "absolute", left: -width * 0.15, top: insets.top + 150 }}><FarLayer width={width} phase={phase} /></Parallax>
            <Petals width={width} height={SCENE_H} color={petal} still={reduce} />
            <Animated.View style={[{ position: "absolute", left: (width - worldW) / 2, width: worldW, bottom: 0, height: SCENE_H - 40 }, world]}>
              <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
                <Zellige width={worldW} />
                <Courtyard width={worldW} fountain bench={s.traits.includes("bench")} still={reduce} />
              </View>
              <View style={{ position: "absolute", bottom: 74, left: 0, right: 0, flexDirection: "row", justifyContent: "center", alignItems: "flex-end" }}>
                {Array.from({ length: plots }, (_, i) => {
                  const tr = s.trees[i];
                  if (!tr) return <EmptyPlot key={i} w={plotW} pro={pro} canPlantNow={canPlant(s, pro)} onPlant={() => setPlanting(true)} />;
                  const pp = progressOf(tr.gp, pro);
                  return (
                    <Pressable key={tr.id} onPress={() => { tick(); setActive(tr.id); }} accessibilityRole="button" accessibilityLabel={`${tr.name}, ${tx[`s${pp.stage}` as "s0"]}`} style={{ width: plotW, alignItems: "center" }}>
                      <TreeArt id={tr.id} type={tr.type} stage={pp.stage} traits={s.traits} season={season} resting={resting(s)} fruits={tr.fruits} size={plotW} still={reduce} />
                      <View style={{ marginTop: -18 }}><Plaque name={tr.name || tx[`t_${tr.type}`]} width={Math.min(170, plotW * 0.6)} /></View>
                    </Pressable>
                  );
                })}
              </View>
            </Animated.View>
            {/* top bar */}
            <View style={{ position: "absolute", top: insets.top + 6, left: 12, right: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <RoundBtn icon="chevronLeft" label="Back" onPress={() => goBack()} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: ink, opacity: 0.85 }}>{season === "ramadan" ? tx.ramadan : season === "eid" ? tx.eid : tx.kicker}</Text>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: ink }}>{tx.missionTitle}</Text>
              </View>
              <RoundBtn icon="grid" label={tx.album} onPress={() => router.push("/sticker-collection" as Href)} />
              <RoundBtn icon="send" label={tx.share} onPress={() => setShare(true)} />
            </View>
          </View>
        </GestureDetector>

        {/* ---------- the tree: stage, next stage, water, fruits ---------- */}
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, padding: 16, gap: 8 }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{tree.name || tx[`t_${tree.type}`]}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{tx[`t_${tree.type}`]} · {tx[`s${p.stage}` as "s0"]} · {fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}</Text>
            <ProgressBar frac={p.frac} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{p.held ? tx.held : p.left ? fillG(tx.next, { n: p.left }) : tx.maxed}</Text>
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
          <View style={{ borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, paddingHorizontal: 16, paddingVertical: 6 }}><GardenNotifySetting /></View>
        </View>
      </ScrollView>
      {gift ? <GiftSheet onClose={() => setGift(false)} /> : null}
      {share ? <ShareSheet visible noDecoration onClose={() => setShare(false)} link="https://quranmasterclass.com/app" message={`${tx.shareMsg}: ${tree.name}, ${tx[`s${p.stage}` as "s0"]}`} renderCard={(f) => <GardenCard format={f} />} /> : null}
    </GestureHandlerRootView>
  );
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
  const p = progressOf(tree.gp, pro);
  const { w, h } = CARD_SIZE[format];
  const phase = phaseNow();
  return (
    <View style={{ width: w, height: h, overflow: "hidden", alignItems: "center", justifyContent: "flex-end" }}>
      <Sky phase={phase} />
      <Celestial phase={phase} width={w} height={h} />
      <View style={{ position: "absolute", top: format === "story" ? 70 : 26, left: 0, right: 0, alignItems: "center", gap: 4 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: skyInk(phase) }}>{tx.title}</Text>
        <Text style={{ fontFamily: FONT.display, fontSize: 26, color: skyInk(phase) }}>{tx[`s${p.stage}` as "s0"]}</Text>
      </View>
      <TreeArt id={tree.id} type={tree.type} stage={p.stage} traits={s.traits} season={seasonNow()} fruits={tree.fruits} size={w * 0.9} still />
      <View style={{ marginTop: -14 }}><Plaque name={tree.name || tx[`t_${tree.type}`]} width={160} /></View>
      <Zellige width={w} height={20} />
      <View style={{ width: w, backgroundColor: "#0b3d2e", paddingVertical: 12 }}><BrandFoot /></View>
    </View>
  );
}
