import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Pressable, Text, View } from "react-native";
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
// the feed (a still fade with Reduce Motion), with a haptic, gone after a few seconds or on tap. One at a time.
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
    else Animated.spring(v, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
    const id = setTimeout(() => setQueue((q) => q.slice(1)), cur.type === "freeze" ? 2600 : 4200);
    return () => clearTimeout(id);
  }, [cur]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!cur) return null;
  const def = cur.type === "sticker" ? STICKER.get(cur.id) : undefined;
  const scale = reduce ? 1 : v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  const rotate = reduce ? "0deg" : v.interpolate({ inputRange: [0, 1], outputRange: ["-18deg", "0deg"] });
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
      <Animated.View style={{ opacity: v, transform: [{ scale }] }}>
        <Pressable onPress={() => setQueue((q) => q.slice(1))} accessibilityRole="button" accessibilityLabel={text}
          style={{ width: 260, borderRadius: R.card, overflow: "hidden", borderWidth: 1, borderColor: stage.goldSoft }}>
          <LinearGradient colors={[stage.bg, stage.deep]} style={{ padding: 20, alignItems: "center", gap: 10 }}>
            <Animated.View style={{ transform: [{ rotate }] }}>
              {def ? <StickerArt def={def} size={120} /> : (
                <View style={{ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: stage.gold }}>
                  {cur.type === "level" ? <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 40, color: stage.gold }}>{nf(cur.level)}</Text> : <Icon name="shield" color={stage.gold} size={40} />}
                </View>
              )}
            </Animated.View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: stage.gold }}>
              {cur.type === "level" ? gt.levelUp : cur.type === "sticker" ? (def?.rare ? `${gt.stickerNew} · ${gt.rare}` : gt.stickerNew) : gt.freezeEarned}
            </Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 18, color: "#fff", textAlign: "center" }}>
              {cur.type === "sticker" ? stickerName(cur.id, gt, tx, nf) : cur.type === "level" ? fillText(gt.levelN, { n: nf(cur.level) }) : text}
            </Text>
            {cur.type === "sticker" ? (
              <Pressable onPress={() => { setQueue((q) => q.slice(1)); router.push("/feed-stickers" as Href); }} accessibilityRole="button"
                style={({ pressed }) => ({ marginTop: 4, height: 40, paddingHorizontal: 18, borderRadius: R.pill, justifyContent: "center", backgroundColor: stage.gold, opacity: pressed ? 0.85 : 1 })}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.bg }}>{gt.album}</Text>
              </Pressable>
            ) : null}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}
