import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Line, RadialGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useLang } from "@/i18n";
import { useReducedMotionX } from "@/features/extra/motion";
import { FONT, R, stage } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { STICKER, onCelebrate, type Celebration } from "./gamify";
import { useGameText } from "./gamifyTexts";
import { StickerArt, stickerName } from "./Sticker";
import { useFeedText, fillText } from "./texts";
import { success, tick } from "./haptics";

// The moment a level is reached, a sticker is collected or a streak freeze is earned / used: a card that pops in over
// the feed in a soft halo of gold light (a still fade with Reduce Motion), with a haptic, gone after a few seconds or on tap. One at a time.
export function Celebrations() {
  const gt = useGameText();
  const tx = useFeedText();
  const { lang } = useLang();
  const reduce = useReducedMotionX();
  const [queue, setQueue] = useState<Celebration[]>([]);
  const cur = queue[0];
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => onCelebrate((c) => setQueue((q) => (q.length > 6 ? q : [...q, c]))), []);
  const nf = (n: number) => Intl.NumberFormat(lang).format(n);
  const text = !cur ? "" : cur.type === "level" ? fillText(gt.levelUpBody, { n: nf(cur.level) })
    : cur.type === "sticker" ? `${gt.stickerNew}: ${stickerName(cur.id, gt, tx, nf)}` : cur.used ? gt.freezeUsed : gt.freezeEarned;
  useEffect(() => {
    if (!cur) return;
    if (cur.type === "freeze") tick(); else success();
    AccessibilityInfo.announceForAccessibility(text);
    v.setValue(0);
    if (reduce) Animated.timing(v, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    else Animated.timing(v, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    const id = setTimeout(() => setQueue((q) => q.slice(1)), cur.type === "freeze" ? 2600 : 4200);
    return () => clearTimeout(id);
  }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!cur) return null;
  const def = cur.type === "sticker" ? STICKER.get(cur.id) : undefined;
  const scale = reduce ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] });
  const glow = reduce ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.15] });
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
      {/* dignified gold light instead of confetti: a radial halo that breathes out once */}
      <Animated.View pointerEvents="none" style={{ position: "absolute", width: 420, height: 420, opacity: v, transform: [{ scale: glow }] }}>
        <Svg width={420} height={420}>
          <Defs>
            <RadialGradient id="cel-halo" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="rgb(233,207,153)" stopOpacity={0.45} />
              <Stop offset="0.45" stopColor="rgb(214,180,108)" stopOpacity={0.16} />
              <Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx={210} cy={210} r={210} fill="url(#cel-halo)" />
          {Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; return <Line key={i} x1={210 + 150 * Math.cos(a)} y1={210 + 150 * Math.sin(a)} x2={210 + 196 * Math.cos(a)} y2={210 + 196 * Math.sin(a)} stroke="rgb(214,180,108)" strokeOpacity={0.28} strokeWidth={1} />; })}
        </Svg>
      </Animated.View>
      <Animated.View style={{ opacity: v, transform: [{ scale }] }}>
        <Pressable onPress={() => setQueue((q) => q.slice(1))} accessibilityRole="button" accessibilityLabel={text}
          style={{ width: 268, borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: stage.gold, backgroundColor: stage.bg, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 10 } }}>
          <LinearGradient colors={[stage.bg, stage.deep]} style={{ padding: 22, alignItems: "center", gap: 10 }}>
            <View pointerEvents="none" style={{ position: "absolute", left: 6, right: 6, top: 6, bottom: 6, borderRadius: R.card - 4, borderWidth: StyleSheet.hairlineWidth, borderColor: stage.goldSoft }} />
            <View>
              {def ? <StickerArt def={def} size={120} /> : (
                <View style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: stage.gold, padding: 4 }}>
                  <View style={{ position: "absolute", left: 5, right: 5, top: 5, bottom: 5, borderRadius: 43, borderWidth: StyleSheet.hairlineWidth, borderColor: stage.goldSoft }} />
                  {cur.type === "level" ? <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 40, color: stage.gold }}>{nf(cur.level)}</Text> : <Icon name="shield" color={stage.gold} size={40} />}
                </View>
              )}
            </View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: stage.gold }}>
              {cur.type === "level" ? gt.levelUp : cur.type === "sticker" ? (def?.rare ? `${gt.stickerNew} · ${gt.rare}` : gt.stickerNew) : gt.freezeEarned}
            </Text>
            <Text style={{ fontFamily: FONT.bold, fontSize: 18, letterSpacing: -0.2, color: stage.cream, textAlign: "center" }}>
              {cur.type === "sticker" ? stickerName(cur.id, gt, tx, nf) : cur.type === "level" ? fillText(gt.levelN, { n: nf(cur.level) }) : text}
            </Text>
            {cur.type === "sticker" ? (
              <Pressable onPress={() => { setQueue((q) => q.slice(1)); router.push("/feed-stickers" as Href); }} accessibilityRole="button"
                style={({ pressed }) => ({ marginTop: 4, height: 40, paddingHorizontal: 20, borderRadius: R.pill, justifyContent: "center", borderWidth: 1, borderColor: stage.gold, opacity: pressed ? 0.75 : 1 })}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, letterSpacing: 0.4, color: stage.gold }}>{gt.album}</Text>
              </Pressable>
            ) : null}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
