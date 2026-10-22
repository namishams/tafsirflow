import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Switch, Text, View, useWindowDimensions } from "react-native";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, { Easing, FadeIn, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, stage as stageC, useTheme } from "@/lib/theme";
import { openPro, usePro } from "@/lib/pro";
import { useProPrice, withPrice } from "@/lib/purchases";
import { useLang } from "@/i18n";
import { useGamify } from "@/features/feed/gamify";
import { success, tick } from "@/features/feed/haptics";
import { useReducedMotion } from "@/features/library/motion";
import { askForReviewAfterSuccess } from "@/lib/review";
import { FREE_STAGE, MAX_STAGE, gatedStage, activeTree, markFlourishSeen, onSeriesReward, onStageUp, progressOf, readGarden, resting, stageOf, seasonNow, shamsGrow, takeBurst, tickGarden, useGarden, type SeriesReward, type StageUp } from "./garden";
import { onDrops, type Drop } from "./catalog";
import { readGardenNotify, rescheduleGarden, setGardenNotify } from "./notify";
import { TreeArt } from "./Tree";
import { Motes, Panorama, SKIES } from "./Landscape";
import { CatalogArt } from "./CatalogArt";
import { fillG, useAgeText, useGardenText } from "./texts";
import { GardenEntry, SeedEntry } from "./EntryCard";

/** keeps the garden up to date with learning (on mount and whenever feed XP or quests change) */
export function useGardenTick() {
  const gm = useGamify();
  const { pro } = usePro();
  const { lang } = useLang();
  const questsDone = gm.rewarded && gm.day > 0;
  useEffect(() => {
    tickGarden(gm.xp, questsDone, pro, gm.names);
  }, [gm.xp, questsDone, pro, gm.names]);
  useEffect(() => { rescheduleGarden(pro, lang); }, [pro, lang]);
}

/** a chime-like haptic pattern for big moments */
export function chime() { success(); setTimeout(tick, 180); setTimeout(tick, 320); setTimeout(success, 520); }

export function ProgressBar({ frac, color = "#c6a65e", track }: { frac: number; color?: string; track?: string }) {
  const t = useTheme();
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: track ?? t.line, overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(frac * 100) }}>
      <View style={{ width: `${Math.round(Math.min(1, frac) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: color }} />
    </View>
  );
}

/** the tree card for the Masterclass tab, Account and the Shams page; a seed card before planting
 *  (redesign 22.10.2026: the card itself lives in EntryCard.tsx, website mirror src/components/learn/garden/EntryCard.tsx) */
export function GardenWidget({ lead }: { lead?: string }) {
  useGardenTick();
  return <GardenEntry lead={lead} />;
}

export function SeedCard() {
  return <SeedEntry />;
}

/** "Your tree grew +N" on the Shams completion screen: counts the session, then a bloom of light around the tree */
export function GardenBurst({ kind }: { kind: "session" | "surah" }) {
  const tx = useGardenText();
  const ageTx = useAgeText();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const s = useGarden();
  const [n] = useState(() => { shamsGrow(kind, pro); return takeBurst(); });
  const bloom = useSharedValue(0), rise = useSharedValue(0);
  useEffect(() => {
    if (n > 0) chime();
    if (reduce) { bloom.value = 1; rise.value = 1; return; }
    bloom.value = withSequence(withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }), withTiming(0.6, { duration: 900 }));
    rise.value = withDelay(250, withSpring(1, { damping: 12 }));
  }, [n, reduce, bloom, rise]);
  const bl = useAnimatedStyle(() => ({ opacity: bloom.value, transform: [{ scale: 0.6 + bloom.value * 0.6 }] }));
  const tx2 = useAnimatedStyle(() => ({ opacity: rise.value, transform: [{ translateY: (1 - rise.value) * 16 }] }));
  const tree = activeTree(s, pro);
  if (!tree) return <SeedCard />;
  const p = progressOf(tree, pro);
  return (
    <View style={{ alignItems: "center", gap: 6 }} accessibilityLiveRegion="polite">
      <View style={{ width: 150, height: 170, alignItems: "center", justifyContent: "center" }}>
        <Animated.View style={[{ position: "absolute", width: 170, height: 170 }, bl]}>
          <Svg width={170} height={170}><Defs><RadialGradient id="bloom" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#fff3c4" stopOpacity={0.8} /><Stop offset="1" stopColor="#fff3c4" stopOpacity={0} /></RadialGradient></Defs><Circle cx={85} cy={85} r={85} fill="url(#bloom)" /></Svg>
        </Animated.View>
        <TreeArt id={tree.id} type={tree.type} stage={p.stage} traits={readGarden().traits} season={seasonNow()} size={140} still={reduce} />
      </View>
      {n > 0 ? <Animated.Text style={[{ fontFamily: FONT.display, fontSize: 20, color: stageC.gold }, tx2]}>{fillG(tx.shamsGrew, { n })}</Animated.Text> : null}
      <View style={{ width: 200 }}><ProgressBar frac={p.frac} track="rgba(255,255,255,0.14)" /></View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stageC.textMuted }}>{p.held ? tx.held : p.left ? fillG(tx.next, { n: p.left }) : p.wait ? ageTx(p.age, p.wait).wait : tx.maxed}</Text>
      {pro ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stageC.gold }}>{tx.proDouble}</Text> : null}
    </View>
  );
}

/** global: full-screen stage-up cinematic, series rewards and a toast for new stickers */
export function GardenCelebrate() {
  useGardenTick();
  const [ev, setEv] = useState<StageUp | null>(null);
  const [series, setSeries] = useState<SeriesReward | null>(null);
  const [drops, setDrops] = useState<Drop[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => onStageUp((e) => { chime(); setEv(e); askForReviewAfterSuccess(9000); }), []); // after the cinematic
  useEffect(() => onSeriesReward((r) => { chime(); setSeries(r); }), []);
  useEffect(() => onDrops((d) => {
    const fresh = d.filter((x) => x.fresh);
    if (!fresh.length) return;
    tick();
    setDrops(fresh.slice(0, 4));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDrops([]), 3200);
  }), []);
  return (
    <>
      {ev ? <StageCinematic ev={ev} onClose={() => setEv(null)} /> : null}
      {series && !ev ? <SeriesModal r={series} onClose={() => setSeries(null)} /> : null}
      {drops.length ? <DropToast drops={drops} /> : null}
    </>
  );
}
function DropToast({ drops }: { drops: Drop[] }) {
  const tx = useGardenText();
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} pointerEvents="box-none" style={{ position: "absolute", top: 60, left: 16, right: 16, alignItems: "center" }}>
      <Pressable onPress={() => router.push("/sticker-collection" as Href)} accessibilityRole="button" accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 8, paddingHorizontal: 12, borderRadius: 999, backgroundColor: "rgba(8,38,29,0.95)", borderWidth: 1, borderColor: "rgba(214,178,106,0.5)" }}>
        {drops.map((d) => <CatalogArt key={d.id} id={d.id} size={34} />)}
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: "#f3e2b6" }}>{tx.newStickers}</Text>
      </Pressable>
    </Animated.View>
  );
}

/** the stage-up as a short cinematic: the landscape rises, motes of light gather into the tree, a flash, and the
 *  tree grows from its old shape into the new one; the words follow. A still under Reduce Motion. */
export function StageCinematic({ ev, onClose }: { ev: StageUp; onClose: () => void }) {
  const tx = useGardenText();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const price = useProPrice();
  const { width, height } = useWindowDimensions();
  const sky = SKIES.golden;
  const t = useSharedValue(reduce ? 1 : 0), reveal = useSharedValue(reduce ? 1 : 0.5), zoom = useSharedValue(reduce ? 1 : 1.12), glow = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    t.value = withTiming(1, { duration: 2600, easing: Easing.linear });
    reveal.value = withDelay(1300, withTiming(1, { duration: 1600, easing: Easing.out(Easing.cubic) }));
    zoom.value = withSequence(withTiming(1.16, { duration: 1300, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 1500, easing: Easing.out(Easing.cubic) }));
    glow.value = withDelay(1200, withSequence(withTiming(1, { duration: 500 }), withRepeat(withSequence(withTiming(0.7, { duration: 1400 }), withTiming(1, { duration: 1400 })), -1, true)));
    setTimeout(success, 1250);
  }, [reduce, t, reveal, zoom, glow]);
  const camSt = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));
  const gs = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 0.7 + glow.value * 0.3 }] }));
  const flash = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0.44, 0.5, 0.7], [0, 0.6, 0], "clamp") }));
  const oldSt = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0.45, 0.55], [1, 0], "clamp") }));
  const size = Math.min(260, width * 0.62), th = size * 1.2;
  const newSt = useAnimatedStyle(() => {
    const k = interpolate(t.value, [0.48, 0.85], [0, 1], "clamp"), e = 1 - Math.pow(1 - k, 3);
    const over = Math.sin(k * Math.PI) * 0.05;
    return { opacity: interpolate(t.value, [0.46, 0.52], [0, 1], "clamp"), transform: [{ translateY: th * 0.43 }, { scaleY: 0.78 + e * 0.22 + over }, { scaleX: 0.88 + e * 0.12 }, { translateY: -th * 0.43 }] };
  });
  const textSt = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0.7, 0.95], [0, 1], "clamp"), transform: [{ translateY: interpolate(t.value, [0.7, 0.95], [14, 0], "clamp") }] }));
  const s = readGarden();
  const flourish = !pro && ev.stage >= FREE_STAGE && !s.flourishSeen;
  const close = () => { if (flourish) markFlourishSeen(); onClose(); };
  const ground = height * 0.56;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: "#02100b" }}>
        <Animated.View style={[StyleSheet.absoluteFill, camSt]}>
          <Panorama width={width} height={height} ground={ground} sky={sky} level={ev.stage} reveal={reveal} still={reduce} scale={1.7} />
          <LinearGradient colors={["rgba(2,16,11,0)", "rgba(2,16,11,0.92)", "#02100b"]} locations={[0, 0.3, 1]} style={{ position: "absolute", left: 0, right: 0, top: ground - 20, bottom: 0 }} />
          <Animated.View style={[{ position: "absolute", left: width / 2 - 210, top: ground - th * 0.62 - 210, width: 420, height: 420 }, gs]}>
            <Svg width={420} height={420}><Defs><RadialGradient id="cg" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe9a8" stopOpacity={0.6} /><Stop offset="1" stopColor="#ffe9a8" stopOpacity={0} /></RadialGradient></Defs><Circle cx={210} cy={210} r={210} fill="url(#cg)" /></Svg>
          </Animated.View>
          <View style={{ position: "absolute", left: width / 2 - size / 2, top: ground - th * 0.87 }}>
            {ev.stage > 0 ? <Animated.View style={[{ position: "absolute" }, oldSt]}><TreeArt id={ev.tree.id} type={ev.tree.type} stage={ev.stage - 1} traits={s.traits} season={seasonNow()} size={size} still /></Animated.View> : null}
            <Animated.View style={newSt}><TreeArt id={ev.tree.id} type={ev.tree.type} stage={ev.stage} traits={s.traits} season={seasonNow()} size={size} still={reduce} /></Animated.View>
          </View>
          {!reduce ? Array.from({ length: 12 }, (_, i) => <Gather key={i} i={i} t={t} cx={width / 2} cy={ground - th * 0.45} w={width} h={height} />) : null}
          <Motes width={width} height={height} night={0} still={reduce} top={0.2} />
        </Animated.View>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: "#fff4d6" }, flash]} />
        <Animated.View style={[{ position: "absolute", left: 24, right: 24, bottom: 40, alignItems: "center" }, textSt]}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, color: "#f3e2b6", textAlign: "center" }}>{flourish ? tx.flourishTitle : fillG(tx.stageUp, { n: ev.stage })}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stageC.textSoft, textAlign: "center", marginTop: 8, maxWidth: 360 }}>
            {flourish ? tx.flourishBody : fillG(tx.stageUpBody, { name: ev.tree.name || tx[`t_${ev.tree.type}`], stage: tx[`s${ev.stage}` as "s0"] })}
          </Text>
          <View style={{ gap: 10, marginTop: 22, alignSelf: "stretch", maxWidth: 380, width: "100%" }}>
            {flourish ? <>
              <GoldButton title={withPrice(tx.flourishCta, price)} icon="starBig" onPress={() => { close(); openPro("general"); }} />
              <OutlineButton title={tx.continueFree} onStage onPress={close} />
            </> : <>
              <GoldButton title={tx.shareMoment} icon="send" onPress={() => { close(); router.push("/garden?share=1" as Href); }} />
              <OutlineButton title={tx.close} onStage onPress={close} />
            </>}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
/** a mote of light flying from the edge of the screen into the tree */
function Gather({ i, t, cx, cy, w, h }: { i: number; t: SharedValue<number>; cx: number; cy: number; w: number; h: number }) {
  const a = (i / 12) * Math.PI * 2 + 0.3, sx = cx + Math.cos(a) * Math.max(w, h) * 0.6, sy = cy + Math.sin(a) * Math.max(w, h) * 0.5;
  const st = useAnimatedStyle(() => {
    const k = interpolate(t.value, [i * 0.012, 0.45], [0, 1], "clamp"), e = k * k;
    const sw = Math.sin(k * Math.PI) * 40;
    return { opacity: k > 0 && k < 1 ? 0.95 : 0, transform: [{ translateX: sx + (cx - sx) * e + Math.cos(a + 1.57) * sw }, { translateY: sy + (cy - sy) * e + Math.sin(a + 1.57) * sw }, { scale: 1.3 - e * 0.6 }] };
  });
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", width: 6, height: 6, borderRadius: 3, backgroundColor: "#fff2c4", shadowColor: "#ffd98a", shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } }, st]} />;
}
function SeriesModal({ r, onClose }: { r: SeriesReward; onClose: () => void }) {
  const tx = useGardenText();
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(2,16,11,0.85)", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <View style={{ borderRadius: R.card, backgroundColor: "#0b3d2e", borderWidth: 1, borderColor: "#c6a65e", padding: 22, gap: 10, maxWidth: 380, width: "100%" }}>
          <Icon name="trophy" color="#e9cf99" size={28} />
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: "#f3e2b6" }}>{fillG(tx.seriesDone, { s: tx[`ser_${r.series}`] })}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: stageC.textSoft }}>{fillG(tx.seriesReward, { n: r.gp })}{r.trait ? ` · ${tx[`tr_${r.trait}` as "tr_star"] ?? ""}` : ""}</Text>
          <GoldButton title={tx.open} onPress={() => { onClose(); router.push("/garden" as Href); }} />
          <OutlineButton title={tx.close} onStage onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

/** setting: the gentle reminders of the tree */
export function GardenNotifySetting() {
  const tx = useGardenText();
  const t = useTheme();
  const { pro } = usePro();
  const { lang } = useLang();
  const [on, setOn] = useState(() => readGardenNotify().on);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{tx.notifSetting}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, marginTop: 2 }}>{tx.notifSettingD}</Text>
      </View>
      <Switch value={on} accessibilityLabel={tx.notifSetting} onValueChange={(v) => { setOn(v); void setGardenNotify(v, readGarden(), pro, lang).then((ok) => { if (!ok) setOn(false); }); }} />
    </View>
  );
}

/** the tree's expected stage at the end of each plan week (shown in the 30-day plan) */
export function PlanMilestones({ minutes }: { minutes: number }) {
  const tx = useGardenText();
  // a realistic day of growth for the daily minutes (free, without stickers), on the same scale as the garden
  const perDay = minutes >= 30 ? 45 : minutes >= 20 ? 35 : minutes >= 10 ? 25 : 15;
  const stages = [1, 2, 3, 4].map((w) => Math.min(FREE_STAGE, gatedStage(w * 7 * perDay, w * 7)));
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.3)", backgroundColor: "rgba(255,255,255,0.04)", padding: 16, gap: 10 }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 11.5, letterSpacing: 1.6, textTransform: "uppercase", color: stageC.gold }}>{tx.milestones}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
        {stages.map((st, i) => (
          <View key={i} style={{ alignItems: "center", flex: 1 }}>
            <TreeArt id="plan" type="olive" stage={st} size={64} still />
            <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: stageC.textSoft, textAlign: "center" }}>{fillG(tx.msWeek, { w: i + 1, stage: tx[`s${st}` as "s0"] })}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontFamily: FONT.italic, fontSize: 13, color: stageC.textSoft }}>{tx.ceremonyLead}</Text>
    </View>
  );
}
