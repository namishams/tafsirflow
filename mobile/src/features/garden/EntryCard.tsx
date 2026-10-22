import { useEffect, type ReactNode } from "react";
import { I18nManager, Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from "react-native-svg";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { FONT, R, stage as stageC } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { usePro } from "@/lib/pro";
import { dayNum } from "@/features/feed/statsStore";
import { useReducedMotion } from "@/features/library/motion";
import { MAX_STAGE, activeTree, progressOf, resting, seasonNow, useGarden, type Garden } from "./garden";
import { TreeArt } from "./Tree";
import { fillG, useAgeText, useGardenText } from "./texts";
import { useEntryText } from "./entryText";

// The entry card into "Your garden" (Masterclass tab, Account, Shams page, Shams completion before planting).
// The learner's real tree in an arched niche of light, today's growth as drops, the stage, a ring to the next stage
// and a clear call to enter. The tree art itself (Tree.tsx) is frozen and only shown here. Gentle ambient motion
// (breathing light, rising motes), none under Reduce Motion. The website mirrors it in src/components/learn/garden/EntryCard.tsx.

const GOLD = "#d6b46c", CREAM = "#f3e2b6";
const NICHE_W = 118, NICHE_H = 152;

/** growth points the tree received today (all sources) */
export function todayGrowth(s: Garden): number {
  const day = s.log?.[String(dayNum())];
  return day && typeof day === "object" ? Object.values(day).reduce<number>((a, b) => a + (b ?? 0), 0) : 0;
}

export function GardenEntry({ lead }: { lead?: string }) {
  const tx = useGardenText();
  const et = useEntryText();
  const ageTx = useAgeText();
  const s = useGarden();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const tree = activeTree(s, pro);
  if (!tree) return <SeedEntry />;
  const p = progressOf(tree, pro);
  const today = todayGrowth(s), watered = s.watered === dayNum();
  const name = tree.name || tx[`t_${tree.type}`];
  const status = p.held ? tx.held : p.left ? fillG(tx.next, { n: p.left }) : p.wait ? ageTx(p.age, p.wait).wait : tx.maxed;
  const nextName = p.stage >= MAX_STAGE ? et.grown : tx[`s${p.stage + 1}` as "s0"];
  const pct = Math.round(p.frac * 100);
  return (
    <Pressable onPress={() => router.push("/garden" as Href)} accessibilityRole="button"
      accessibilityLabel={`${tx.title}: ${name}, ${tx[`s${p.stage}` as "s0"]}, ${fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}. ${today > 0 ? fillG(et.todayGp, { n: today }) : et.todayNone}. ${status}. ${et.enter}`}
      style={({ pressed }) => ({ borderRadius: R.card + 6, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.42)", transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <Frame>
        <View style={{ flexDirection: "row", gap: 14 }}>
          <Niche reduce={reduce}>
            <TreeArt id={tree.id} type={tree.type} stage={p.stage} traits={s.traits} season={seasonNow()} resting={resting(s)} fruits={tree.fruits} size={112 + Math.max(0, 6 - p.stage) * 11} still={reduce} />
          </Niche>
          <View style={{ flex: 1, minWidth: 0, justifyContent: "center", gap: 3 }}>
            <Kicker text={tx.title} />
            <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: 21, color: "#fff", marginTop: 2 }}>{name}</Text>
            <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 13.5, lineHeight: 18, color: CREAM }}>{tx[`s${p.stage}` as "s0"]}<Text style={{ color: stageC.textMuted, fontFamily: FONT.regular }}>{`  ·  ${fillG(tx.stageN, { n: p.stage, m: MAX_STAGE })}`}</Text></Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
              <Ring frac={p.frac} label={fillG(et.ring, { p: pct })} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase", color: stageC.textMuted }}>{et.nextT}</Text>
                <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 14, color: "#fff" }}>{nextName}</Text>
                <Text numberOfLines={2} style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 15, color: stageC.textMuted }}>{status}</Text>
              </View>
            </View>
          </View>
        </View>
        {lead ? <Text style={{ fontFamily: FONT.italic, fontSize: 12.5, lineHeight: 18, color: CREAM, opacity: 0.9, marginTop: 12 }}>{lead}</Text> : null}
        <View style={{ height: 1, backgroundColor: "rgba(214,180,108,0.22)", marginTop: 14, marginBottom: 12 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Drops today={today} />
              {watered ? <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.regular, fontSize: 11.5, color: stageC.textMuted }}>{et.watered}</Text> : null}
            </View>
            <Text numberOfLines={2} style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: today > 0 ? CREAM : stageC.textMuted }}>{today > 0 ? fillG(et.todayGp, { n: today }) : et.todayNone}</Text>
            {tree.fruits > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "#f3b14a" }}>{fillG(tx.fruitsReady, { n: tree.fruits })}</Text> : null}
          </View>
          <Cta title={et.enter} />
        </View>
      </Frame>
    </Pressable>
  );
}

/** before planting: the seed in the same niche, with the mission and the call to plant */
export function SeedEntry() {
  const tx = useGardenText();
  const reduce = useReducedMotion();
  return (
    <Pressable onPress={() => router.push("/garden?plant=1" as Href)} accessibilityRole="button" accessibilityLabel={`${tx.seedTitle}. ${tx.seedLead}. ${tx.plant}`}
      style={({ pressed }) => ({ borderRadius: R.card + 6, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.42)", transform: [{ scale: pressed ? 0.985 : 1 }] })}>
      <Frame>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <Niche reduce={reduce}><TreeArt id="seed" type="olive" stage={0} size={190} still /></Niche>
          <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
            <Kicker text={tx.missionKicker} />
            <Text style={{ fontFamily: FONT.display, fontSize: 21, lineHeight: 26, color: "#fff" }}>{tx.seedTitle}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: stageC.textSoft }}>{tx.seedLead}</Text>
          </View>
        </View>
        <View style={{ height: 1, backgroundColor: "rgba(214,180,108,0.22)", marginTop: 14, marginBottom: 12 }} />
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}><Cta title={tx.plant} /></View>
      </Frame>
    </Pressable>
  );
}

/** the deep emerald card with a faint gold light from the top */
function Frame({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={["#0f4a37", "#082a20", "#051b14"]} locations={[0, 0.55, 1]} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} style={{ padding: 16 }}>
      <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 24, right: 24, height: 1, backgroundColor: "rgba(246,231,191,0.35)" }} />
      <Svg pointerEvents="none" width={260} height={180} style={{ position: "absolute", top: -60, [I18nManager.isRTL ? "left" : "right"]: -60 }}>
        <Defs><RadialGradient id="ec-sheen" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor={GOLD} stopOpacity={0.16} /><Stop offset="1" stopColor={GOLD} stopOpacity={0} /></RadialGradient></Defs>
        <Ellipse cx={130} cy={90} rx={130} ry={90} fill="url(#ec-sheen)" />
      </Svg>
      {children}
    </LinearGradient>
  );
}

function Kicker({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Svg width={9} height={9} viewBox="0 0 10 10"><Path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill={GOLD} /></Svg>
      <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 10.5, letterSpacing: 1.8, textTransform: "uppercase", color: GOLD }}>{text}</Text>
    </View>
  );
}

/** an arched niche of light (like a mihrab) in which the tree stands; the light breathes, motes rise slowly */
function Niche({ reduce, children }: { reduce: boolean; children: ReactNode }) {
  const breath = useSharedValue(0.75);
  useEffect(() => {
    if (reduce) { cancelAnimation(breath); breath.value = 0.75; return; }
    breath.value = withRepeat(withSequence(withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.sin) }), withTiming(0.6, { duration: 2800, easing: Easing.inOut(Easing.sin) })), -1, false);
    return () => cancelAnimation(breath);
  }, [reduce, breath]);
  const glow = useAnimatedStyle(() => ({ opacity: breath.value, transform: [{ scale: 0.92 + breath.value * 0.1 }] }));
  return (
    <View style={{ width: NICHE_W, height: NICHE_H, borderTopLeftRadius: NICHE_W / 2, borderTopRightRadius: NICHE_W / 2, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.5)" }}>
      <LinearGradient colors={["#174f3d", "#0b3427", "#06241b"]} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <Animated.View pointerEvents="none" style={[{ position: "absolute", left: -20, top: 6, width: NICHE_W + 40, height: NICHE_W + 40 }, glow]}>
        <Svg width={NICHE_W + 40} height={NICHE_W + 40}>
          <Defs><RadialGradient id="ec-glow" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe9a8" stopOpacity={0.42} /><Stop offset="0.6" stopColor="#ffe9a8" stopOpacity={0.08} /><Stop offset="1" stopColor="#ffe9a8" stopOpacity={0} /></RadialGradient></Defs>
          <Circle cx={(NICHE_W + 40) / 2} cy={(NICHE_W + 40) / 2} r={(NICHE_W + 40) / 2} fill="url(#ec-glow)" />
        </Svg>
      </Animated.View>
      <Svg pointerEvents="none" width={NICHE_W} height={24} style={{ position: "absolute", left: 0, bottom: 0 }}>
        <Ellipse cx={NICHE_W / 2} cy={20} rx={NICHE_W * 0.42} ry={9} fill="rgba(2,16,11,0.55)" />
        <Path d={`M${NICHE_W * 0.14} 20 Q${NICHE_W / 2} 10 ${NICHE_W * 0.86} 20`} stroke="rgba(214,180,108,0.35)" strokeWidth={1} fill="none" />
      </Svg>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: -6, alignItems: "center" }}>{children}</View>
      {!reduce ? [0, 1, 2].map((i) => <Mote key={i} i={i} />) : null}
    </View>
  );
}

function Mote({ i }: { i: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withDelay(i * 1700, withRepeat(withTiming(1, { duration: 5200, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(t);
  }, [i, t]);
  const x = [0.28, 0.66, 0.46][i] * NICHE_W;
  const st = useAnimatedStyle(() => ({ opacity: Math.sin(t.value * Math.PI) * 0.85, transform: [{ translateX: x + Math.sin(t.value * Math.PI * 2 + i) * 6 }, { translateY: NICHE_H * 0.78 - t.value * NICHE_H * 0.6 }] }));
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top: 0, width: 3.5, height: 3.5, borderRadius: 2, backgroundColor: "#fff2c4", shadowColor: "#ffd98a", shadowOpacity: 1, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }, st]} />;
}

/** a thin gold ring with the percent to the next stage */
function Ring({ frac, label }: { frac: number; label: string }) {
  const size = 46, sw = 3.5, r = (size - sw) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(f * 100) }} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.12)" strokeWidth={sw} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={GOLD} strokeWidth={sw} fill="none" strokeLinecap="round" strokeDasharray={`${c * f} ${c}`} />
      </Svg>
      <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: CREAM }}>{Math.round(f * 100)}<Text style={{ fontSize: 8.5, color: stageC.textMuted }}>%</Text></Text>
    </View>
  );
}

/** five drops of water, filled with today's growth (one per eight points) */
function Drops({ today }: { today: number }) {
  const full = today > 0 ? Math.min(5, Math.ceil(today / 8)) : 0;
  return (
    <View style={{ flexDirection: "row", gap: 4 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[0, 1, 2, 3, 4].map((k) => (
        <Svg key={k} width={10} height={13} viewBox="0 0 10 13">
          <Path d="M5 0.6 C5 0.6 0.8 5.6 0.8 8.3 A4.2 4.2 0 0 0 9.2 8.3 C9.2 5.6 5 0.6 5 0.6 Z" fill={k < full ? "#9fe0c8" : "none"} stroke={k < full ? "#c9f1e1" : "rgba(214,180,108,0.45)"} strokeWidth={1} />
        </Svg>
      ))}
    </View>
  );
}

function Cta({ title }: { title: string }) {
  return (
    <LinearGradient colors={["#ecd59b", "#c6a65e"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 38, paddingHorizontal: 16, borderRadius: R.pill }}>
      <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 13.5, color: "rgb(8,38,29)" }}>{title}</Text>
      <Icon name={I18nManager.isRTL ? "chevronLeft" : "chevronRight"} size={14} color="rgb(8,38,29)" />
    </LinearGradient>
  );
}
