import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, FadeIn, FadeInDown, cancelAnimation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { JourneyStage } from "./Landscape";
import { Display, GoldButton, OutlineButton, Stage } from "@/components/brand";
import { FONT, R, stage } from "@/lib/theme";
import { openPro, usePro } from "@/lib/pro";
import { success, tick } from "@/features/feed/haptics";
import { useReducedMotion } from "@/features/library/motion";
import { TREE_TYPES, firstWater, plantTree, type Tree, type TreeType } from "./garden";
import { TreeArt } from "./Tree";
import { chime } from "./widgets";
import { fillG, useGardenText } from "./texts";

// The planting ceremony: the mission ("This tree is you"), a pledge with the daily minutes of the plan, the choice
// of tree and name, the seed going into the soil and the first watering. Used in onboarding after the plan and from
// the seed card for existing users.
type Step = "mission" | "choose" | "plant" | "water" | "done";

export function PlantFlow({ minutes, onDone, onLater, demo }: { minutes?: number; onDone: () => void; onLater?: () => void; /** development only: the ceremony with a tree that is not saved (design previews) */ demo?: boolean }) {
  const tx = useGardenText();
  const insets = useSafeAreaInsets();
  const { pro } = usePro();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("mission");
  const [type, setType] = useState<TreeType>("olive");
  const [name, setName] = useState("");
  const [tree, setTree] = useState<Tree | null>(null);
  const kicker = { fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase" as const, color: stage.gold };
  const body = { fontFamily: FONT.regular, fontSize: 16, lineHeight: 24, color: stage.textSoft };

  const plant = () => {
    const t = __DEV__ && demo ? { id: "demo", type, name: name || tx[`t_${type}`], planted: 0, gp: 0, fruits: 0, fruitDay: 0, harvested: 0, hist: [] } : plantTree(type, name || tx[`t_${type}`], pro);
    if (!t) return;
    setTree(t); tick(); setStep("plant");
  };
  return (
    <JourneyStage progress={step === "mission" ? 0.72 : step === "choose" ? 0.8 : step === "plant" ? 0.86 : step === "water" ? 0.9 : 1} horizon={step === "choose" ? 0.24 : step === "mission" ? 0.58 : 0.47} veil={step === "choose" ? 0.7 : 0.5}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28, flexGrow: 1 }} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets keyboardDismissMode="interactive">
        {step === "mission" ? (
          <Animated.View entering={reduce ? undefined : FadeInDown.duration(500)} style={{ gap: 14, flex: 1 }}>
            <Text style={kicker}>{tx.missionKicker}</Text>
            <Display onStage>{tx.missionTitle}</Display>
            <Text style={body}>{tx.missionLead}</Text>
            <View style={{ alignItems: "center", marginVertical: 8 }}><GlowSeed size={200} still={reduce} /></View>
            {minutes ? (
              <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)", padding: 16, backgroundColor: "rgba(6,30,23,0.72)" }}>
                <Text style={{ fontFamily: FONT.italic, fontSize: 17, lineHeight: 25, color: "#f3e2b6" }}>{fillG(tx.pledge, { n: minutes })}</Text>
              </View>
            ) : null}
            <View style={{ flex: 1 }} />
            <GoldButton title={tx.pledgeBtn} onPress={() => { success(); setStep("choose"); }} />
            {onLater ? <OutlineButton title={tx.later} onStage onPress={onLater} /> : null}
          </Animated.View>
        ) : null}

        {step === "choose" ? (
          <Animated.View entering={reduce ? undefined : FadeIn.duration(400)} style={{ gap: 14 }}>
            <Text style={kicker}>{tx.plantTitle}</Text>
            <Display onStage size="title1">{tx.chooseType}</Display>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {TREE_TYPES.map((tt) => {
                const locked = !!tt.pro && !pro, on = type === tt.id;
                return (
                  <Pressable key={tt.id} onPress={() => { tick(); if (locked) openPro("general"); else setType(tt.id); }} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${tx[`t_${tt.id}`]}${locked ? `, ${tx.pro}` : ""}`}
                    style={{ width: "47%", flexGrow: 1, alignItems: "center", borderRadius: R.card, borderWidth: on ? 2 : 1, borderColor: on ? stage.gold : "rgba(255,255,255,0.18)", backgroundColor: on ? "rgba(58,47,18,0.85)" : "rgba(6,30,23,0.72)", paddingVertical: 10, opacity: locked ? 0.6 : 1 }}>
                    <TreeArt id={`pick-${tt.id}`} type={tt.id} stage={8} size={110} still />
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#fff", marginTop: 2 }}>{tx[`t_${tt.id}`]}</Text>
                    {tt.pro ? <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: stage.gold }}>{tx.pro}</Text> : null}
                  </Pressable>
                );
              })}
            </View>
            <TextInput value={name} onChangeText={setName} maxLength={30} placeholder={tx.namePh} placeholderTextColor="rgba(255,255,255,0.45)" accessibilityLabel={tx.namePh}
              style={{ borderRadius: R.lg, borderWidth: 1, borderColor: "rgba(214,180,108,0.4)", color: "#fff", fontFamily: FONT.regular, fontSize: 17, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: "rgba(255,255,255,0.05)" }} />
            <GoldButton title={tx.plantSeed} onPress={plant} />
          </Animated.View>
        ) : null}

        {(step === "plant" || step === "water" || step === "done") && tree ? (
          <Ceremony tree={tree} step={step} reduce={reduce} onPlanted={() => setStep("water")} onWatered={() => { firstWater(tree.id); chime(); setStep("done"); }} onDone={onDone} />
        ) : null}
      </ScrollView>
    </JourneyStage>
  );
}

function Ceremony({ tree, step, reduce, onPlanted, onWatered, onDone }: { tree: Tree; step: Step; reduce: boolean; onPlanted: () => void; onWatered: () => void; onDone: () => void }) {
  const tx = useGardenText();
  const seedY = useSharedValue(reduce ? 0 : -260), land = useSharedValue(reduce ? 1 : 0), rain = useSharedValue(0), sprout = useSharedValue(reduce ? 1 : 0), burst = useSharedValue(0);
  useEffect(() => {
    if (step !== "plant") return;
    if (reduce) { onPlanted(); return; }
    seedY.value = withTiming(0, { duration: 1100, easing: Easing.in(Easing.quad) });
    land.value = withDelay(1050, withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }));
    const t = setTimeout(() => { success(); onPlanted(); }, 1300);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (step !== "done" || reduce) return;
    sprout.value = withSpring(1, { damping: 9, stiffness: 70 });
    burst.value = withSequence(withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) }), withTiming(0.55, { duration: 1600 }));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const water = () => {
    if (reduce) { onWatered(); return; }
    tick();
    rain.value = withTiming(1, { duration: 1500, easing: Easing.linear });
    setTimeout(tick, 450); setTimeout(tick, 800);
    setTimeout(onWatered, 1100);
  };
  const seedSt = useAnimatedStyle(() => ({ opacity: interpolate(land.value, [0.3, 1], [1, 0], "clamp"), transform: [{ translateY: seedY.value }, { scale: 1 - land.value * 0.4 }] }));
  const sproutSt = useAnimatedStyle(() => ({ opacity: step === "done" ? Math.min(1, 0.2 + sprout.value) : 1, transform: [{ translateY: 312 * (312 / 360) - 156 }, { scale: step === "done" ? 0.35 + sprout.value * 0.65 : 1 }, { translateY: -(312 * (312 / 360) - 156) }] }));
  const burstSt = useAnimatedStyle(() => ({ opacity: burst.value, transform: [{ scale: 0.5 + burst.value * 0.7 }, { rotate: `${burst.value * 25}deg` }] }));
  const ringSt = useAnimatedStyle(() => ({ opacity: interpolate(land.value, [0, 0.2, 1], [0, 0.9, 0]) + interpolate(rain.value, [0.45, 0.6, 1], [0, 0.8, 0], "clamp"), transform: [{ scaleX: 0.4 + Math.max(land.value, rain.value) * 1.2 }, { scaleY: 0.4 + Math.max(land.value, rain.value) * 1.2 }] }));
  const BASE = 312 * (312 / 360); // the soil line inside the 260 × 312 tree box
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 14 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{tree.name}</Text>
      <Display onStage size="title1" style={{ textAlign: "center" }}>{step === "done" ? tx.ceremonyDone : step === "water" ? tx.waterFirst : tx.plantSeed}</Display>
      <View style={{ width: 260, height: 312, alignItems: "center", justifyContent: "flex-end" }}>
        <Animated.View pointerEvents="none" style={[{ position: "absolute", left: -70, top: BASE - 250, width: 400, height: 400 }, burstSt]}>
          <Svg width={400} height={400}>
            <Defs><RadialGradient id="cb" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#fff1c4" stopOpacity={0.85} /><Stop offset="0.35" stopColor="#ffe2a0" stopOpacity={0.3} /><Stop offset="1" stopColor="#ffe2a0" stopOpacity={0} /></RadialGradient></Defs>
            <Circle cx={200} cy={200} r={200} fill="url(#cb)" />
            {Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6, w = 0.06; return <Path key={i} d={`M200 200 L${200 + Math.cos(a - w) * 200} ${200 + Math.sin(a - w) * 200} L${200 + Math.cos(a + w) * 200} ${200 + Math.sin(a + w) * 200} Z`} fill="#fff4d0" opacity={0.18} />; })}
          </Svg>
        </Animated.View>
        <Animated.View style={sproutSt}><TreeArt id={tree.id} type={tree.type} stage={step === "done" ? 1 : 0} size={260} still={reduce} /></Animated.View>
        <Animated.View pointerEvents="none" style={[{ position: "absolute", top: BASE - 9, width: 80, height: 18, borderRadius: 40, borderWidth: 1.5, borderColor: "#f3e2b6" }, ringSt]} />
        {step === "plant" ? <Animated.View pointerEvents="none" style={[{ position: "absolute", top: BASE - 42 }, seedSt]}><GlowSeed size={84} still={reduce} /></Animated.View> : null}
        {step === "plant" && !reduce ? Array.from({ length: 6 }, (_, i) => <Soil key={i} i={i} v={land} y={BASE} />) : null}
        {!reduce ? Array.from({ length: 14 }, (_, i) => <RainDrop key={i} i={i} v={rain} bottom={BASE} />) : null}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft, textAlign: "center" }}>{tx.ceremonyLead}</Text>
      {step === "water" ? <GoldButton title={tx.waterFirst} onPress={water} style={{ alignSelf: "stretch" }} /> : null}
      {step === "done" ? <GoldButton title={tx.cont} onPress={onDone} style={{ alignSelf: "stretch" }} /> : null}
    </View>
  );
}
/** the seed: a small golden kernel in a soft halo of light, breathing */
function GlowSeed({ size, still }: { size: number; still: boolean }) {
  const v = useSharedValue(0.6);
  useEffect(() => { if (still) return; v.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true); return () => cancelAnimation(v); }, [still, v]);
  const st = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scale: 0.85 + v.value * 0.2 }] }));
  const c = size / 2, k = size / 60;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={[{ position: "absolute", width: size, height: size }, st]}>
        <Svg width={size} height={size}><Defs><RadialGradient id="gs" cx="0.5" cy="0.5" r="0.5"><Stop offset="0" stopColor="#ffe8a8" stopOpacity={0.9} /><Stop offset="0.3" stopColor="#ffd98a" stopOpacity={0.35} /><Stop offset="1" stopColor="#ffd98a" stopOpacity={0} /></RadialGradient></Defs><Circle cx={c} cy={c} r={c} fill="url(#gs)" /></Svg>
      </Animated.View>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Defs><RadialGradient id="gk" cx="0.38" cy="0.32" r="0.75"><Stop offset="0" stopColor="#fff6d8" /><Stop offset="0.4" stopColor="#e2b85c" /><Stop offset="1" stopColor="#8a5f22" /></RadialGradient></Defs>
        <Path d={`M${c} ${c - 8 * k} C${c + 7 * k} ${c - 7 * k} ${c + 7 * k} ${c + 6 * k} ${c} ${c + 8 * k} C${c - 7 * k} ${c + 6 * k} ${c - 7 * k} ${c - 7 * k} ${c} ${c - 8 * k} Z`} fill="url(#gk)" transform={`rotate(-25 ${c} ${c})`} />
        <Path d={`M${c - 1 * k} ${c - 5 * k} q-2 ${5 * k} 0 ${10 * k}`} stroke="#fff6d8" strokeWidth={0.8 * k} fill="none" opacity={0.7} transform={`rotate(-25 ${c} ${c})`} />
      </Svg>
    </View>
  );
}
function Soil({ i, v, y }: { i: number; v: SharedValue<number>; y: number }) {
  const a = Math.PI + (i / 5) * Math.PI;
  const st = useAnimatedStyle(() => { const k = v.value; return { opacity: k > 0 && k < 1 ? 1 - k : 0, transform: [{ translateX: 130 + Math.cos(a) * 30 * k - 2 }, { translateY: y + Math.sin(a) * 26 * k + k * k * 18 - 2 }] }; });
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top: 0, width: 4, height: 4, borderRadius: 2, backgroundColor: i % 2 ? "#8c5f32" : "#e9cf99" }, st]} />;
}
function RainDrop({ i, v, bottom }: { i: number; v: SharedValue<number>; bottom: number }) {
  const x = 130 + ((i * 37) % 120) - 60, d0 = (i % 7) * 0.06;
  const st = useAnimatedStyle(() => {
    const k = interpolate(v.value, [d0, d0 + 0.42], [0, 1], "clamp");
    return { opacity: k > 0 && k < 1 ? 0.9 : 0, transform: [{ translateX: x + k * 6 }, { translateY: -40 + k * (bottom + 34) }, { scaleY: 1.4 }] };
  });
  return <Animated.View pointerEvents="none" style={[{ position: "absolute", left: 0, top: 0, width: 3, height: 9, borderRadius: 2, backgroundColor: "#dff8ee" }, st]} />;
}
