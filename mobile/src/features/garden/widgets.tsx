import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, Switch, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import Animated, { Easing, FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, stage as stageC, useTheme } from "@/lib/theme";
import { openPro, usePro } from "@/lib/pro";
import { useProPrice, withPrice } from "@/lib/purchases";
import { useLang } from "@/i18n";
import { useGamify } from "@/features/feed/gamify";
import { success, tick } from "@/features/feed/haptics";
import { useReducedMotion } from "@/features/library/motion";
import { FREE_STAGE, MAX_STAGE, activeTree, markFlourishSeen, onSeriesReward, onStageUp, progressOf, readGarden, resting, seasonNow, shamsGrow, takeBurst, tickGarden, useGarden, type SeriesReward, type StageUp } from "./garden";
import { onDrops, type Drop } from "./catalog";
import { readGardenNotify, rescheduleGarden, setGardenNotify } from "./notify";
import { TreeArt } from "./Tree";
import { CatalogArt } from "./CatalogArt";
import { fillG, useGardenText } from "./texts";

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

/** the small tree card for the Masterclass tab, Account and the Shams page; a seed card before planting */
export function GardenWidget({ lead }: { lead?: string }) {
  useGardenTick();
  const tx = useGardenText();
  const s = useGarden();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const tree = activeTree(s, pro);
  if (!tree) return <SeedCard />;
  const p = progressOf(tree.gp, pro);
  return (
    <Pressable onPress={() => router.push("/garden" as Href)} accessibilityRole="button" accessibilityLabel={`${tx.title}: ${tree.name}, ${fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}`}
      style={({ pressed }) => ({ borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,178,106,0.3)", opacity: pressed ? 0.92 : 1 })}>
      <LinearGradient colors={["#0b3d2e", "#08261d"]} style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14 }}>
        <TreeArt id={tree.id} type={tree.type} stage={p.stage} traits={s.traits} season={seasonNow()} resting={resting(s)} fruits={tree.fruits} size={96} still={reduce} />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: stageC.gold }}>{tx.title}</Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: 19, color: "#fff" }}>{tree.name || tx[`t_${tree.type}`]}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stageC.textSoft }}>{tx[`s${p.stage}` as "s0"]} · {fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}</Text>
          <ProgressBar frac={p.frac} track="rgba(255,255,255,0.14)" />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stageC.textMuted }}>{p.held ? tx.held : p.left ? fillG(tx.next, { n: p.left }) : tx.maxed}</Text>
          {lead ? <Text style={{ fontFamily: FONT.italic, fontSize: 12.5, color: stageC.gold }}>{lead}</Text> : null}
          {tree.fruits > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "#f3b14a" }}>{fillG(tx.fruitsReady, { n: tree.fruits })}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export function SeedCard() {
  const tx = useGardenText();
  return (
    <Pressable onPress={() => router.push("/garden?plant=1" as Href)} accessibilityRole="button" accessibilityLabel={`${tx.seedTitle}. ${tx.seedLead}`}
      style={({ pressed }) => ({ borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,178,106,0.35)", opacity: pressed ? 0.92 : 1 })}>
      <LinearGradient colors={["#0b3d2e", "#08261d"]} style={{ flexDirection: "row", alignItems: "center", gap: 14, padding: 16 }}>
        <TreeArt id="seed" type="olive" stage={0} size={72} still />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.8, textTransform: "uppercase", color: stageC.gold }}>{tx.missionKicker}</Text>
          <Text style={{ fontFamily: FONT.display, fontSize: 19, color: "#fff" }}>{tx.seedTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: stageC.textSoft }}>{tx.seedLead}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: stageC.gold, marginTop: 4 }}>{tx.plant}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** "Your tree grew +N" on the Shams completion screen: counts the session, then a bloom of light around the tree */
export function GardenBurst({ kind }: { kind: "session" | "surah" }) {
  const tx = useGardenText();
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
  const p = progressOf(tree.gp, pro);
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
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stageC.textMuted }}>{p.held ? tx.held : p.left ? fillG(tx.next, { n: p.left }) : tx.maxed}</Text>
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
  useEffect(() => onStageUp((e) => { chime(); setEv(e); }), []);
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

function StageCinematic({ ev, onClose }: { ev: StageUp; onClose: () => void }) {
  const tx = useGardenText();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const price = useProPrice();
  const zoom = useSharedValue(reduce ? 1 : 0.7), glow = useSharedValue(reduce ? 1 : 0);
  useEffect(() => {
    if (reduce) return;
    zoom.value = withSequence(withTiming(1.12, { duration: 1400, easing: Easing.out(Easing.cubic) }), withSpring(1, { damping: 14 }));
    glow.value = withSequence(withTiming(1, { duration: 900 }), withRepeat(withSequence(withTiming(0.7, { duration: 1400 }), withTiming(1, { duration: 1400 })), -1, true));
  }, [reduce, zoom, glow]);
  const zs = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));
  const gs = useAnimatedStyle(() => ({ opacity: glow.value }));
  const s = readGarden();
  const flourish = !pro && ev.stage >= FREE_STAGE && !s.flourishSeen;
  const close = () => { if (flourish) markFlourishSeen(); onClose(); };
  return (
    <Modal visible transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
      <LinearGradient colors={["#02100b", "#0b3d2e", "#02100b"]} style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Animated.View style={[{ position: "absolute", width: 420, height: 420 }, gs]}>
          <Svg width={420} height={420}><Defs><RadialGradient id="cg" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe9a8" stopOpacity={0.55} /><Stop offset="1" stopColor="#ffe9a8" stopOpacity={0} /></RadialGradient></Defs><Circle cx={210} cy={210} r={210} fill="url(#cg)" /></Svg>
        </Animated.View>
        <Animated.View style={zs}><TreeArt id={ev.tree.id} type={ev.tree.type} stage={ev.stage} traits={s.traits} season={seasonNow()} size={240} still={reduce} /></Animated.View>
        <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 26, color: "#f3e2b6", textAlign: "center", marginTop: 12 }}>{flourish ? tx.flourishTitle : fillG(tx.stageUp, { n: ev.stage })}</Text>
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
      </LinearGradient>
    </Modal>
  );
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
  const per = minutes >= 20 ? 1.4 : minutes >= 10 ? 1 : 0.7;
  const stages = [1, 2, 3, 4].map((w) => Math.min(FREE_STAGE, Math.round(1 + w * per)));
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
