import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
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

export function PlantFlow({ minutes, onDone, onLater }: { minutes?: number; onDone: () => void; onLater?: () => void }) {
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
    const t = plantTree(type, name || tx[`t_${type}`], pro);
    if (!t) return;
    setTree(t); tick(); setStep("plant");
  };
  return (
    <Stage hairlines={false} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {step === "mission" ? (
          <Animated.View entering={reduce ? undefined : FadeInDown.duration(500)} style={{ gap: 14, flex: 1 }}>
            <Text style={kicker}>{tx.missionKicker}</Text>
            <Display onStage>{tx.missionTitle}</Display>
            <Text style={body}>{tx.missionLead}</Text>
            <View style={{ alignItems: "center", marginVertical: 8 }}><TreeArt id="mission" type="olive" stage={0} size={200} still /></View>
            {minutes ? (
              <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)", padding: 16, backgroundColor: "rgba(255,255,255,0.04)" }}>
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
                    style={{ width: "47%", flexGrow: 1, alignItems: "center", borderRadius: R.card, borderWidth: on ? 2 : 1, borderColor: on ? stage.gold : "rgba(255,255,255,0.18)", backgroundColor: on ? "rgba(214,180,108,0.12)" : "rgba(255,255,255,0.04)", paddingVertical: 10, opacity: locked ? 0.6 : 1 }}>
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
    </Stage>
  );
}

function Ceremony({ tree, step, reduce, onPlanted, onWatered, onDone }: { tree: Tree; step: Step; reduce: boolean; onPlanted: () => void; onWatered: () => void; onDone: () => void }) {
  const tx = useGardenText();
  const seedY = useSharedValue(reduce ? 0 : -220), drops = useSharedValue(0), sprout = useSharedValue(0);
  useEffect(() => {
    if (step !== "plant") return;
    if (reduce) { onPlanted(); return; }
    seedY.value = withSequence(withTiming(0, { duration: 1100, easing: Easing.in(Easing.quad) }), withSpring(0));
    const t = setTimeout(() => { success(); onPlanted(); }, 1300);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const water = () => {
    if (reduce) { onWatered(); return; }
    tick();
    drops.value = withTiming(1, { duration: 900, easing: Easing.in(Easing.quad) });
    sprout.value = withDelay(800, withSpring(1, { damping: 10 }));
    setTimeout(onWatered, 1100);
  };
  const seedSt = useAnimatedStyle(() => ({ transform: [{ translateY: seedY.value }] }));
  const dropSt = useAnimatedStyle(() => ({ opacity: drops.value > 0 && drops.value < 1 ? 1 : 0, transform: [{ translateY: -140 + drops.value * 150 }] }));
  const sproutSt = useAnimatedStyle(() => ({ transform: [{ scale: step === "done" ? 1 : 0.9 + sprout.value * 0.1 }] }));
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 14 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{tree.name}</Text>
      <Display onStage size="title1" style={{ textAlign: "center" }}>{step === "done" ? tx.ceremonyDone : step === "water" ? tx.waterFirst : tx.plantSeed}</Display>
      <View style={{ width: 260, height: 312, alignItems: "center", justifyContent: "flex-end" }}>
        <Animated.View style={sproutSt}><TreeArt id={tree.id} type={tree.type} stage={step === "done" ? 1 : 0} size={260} still={reduce} /></Animated.View>
        {step === "plant" ? <Animated.View style={[{ position: "absolute", bottom: 46, width: 14, height: 10, borderRadius: 7, backgroundColor: "#8c5f32", borderWidth: 1, borderColor: "#e9cf99" }, seedSt]} /> : null}
        {[-14, 0, 14].map((x, i) => <Animated.View key={i} style={[{ position: "absolute", bottom: 60 + i * 6, left: 130 + x, width: 6, height: 10, borderRadius: 4, backgroundColor: "#8fd3ea" }, dropSt]} />)}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: stage.textSoft, textAlign: "center" }}>{tx.ceremonyLead}</Text>
      {step === "water" ? <GoldButton title={tx.waterFirst} onPress={water} style={{ alignSelf: "stretch" }} /> : null}
      {step === "done" ? <GoldButton title={tx.cont} onPress={onDone} style={{ alignSelf: "stretch" }} /> : null}
    </View>
  );
}
