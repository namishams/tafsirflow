import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CALLIG_FONT, FONT, goldButton } from "@/lib/theme";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { GoldSlider } from "@/features/radio/Slider";
import { fmtTime } from "@/features/radio/controls";
import { useAppT } from "@/features/radio/strings";
import { Eq, PlayRosette } from "./ornaments";

// The floating player dock of the website (Player.tsx): a dark-green jewel with gold – how far through the surah, the
// position in the verse, the surah's Arabic name and verse x/y beside a small equaliser, previous / next verse and the
// gold play button inside a slowly turning rosette, and the verse picker. Tapping the name opens the full player.
// During the pause after a verse ("your turn") a gold countdown bar sits on top with a Skip button.
export type Turn = { ms: number; key: number };
export function PlayerDock({ bottom, arabicName, verse, total, playing, positionMs, durationMs, sleepMin, reduce, turn, onSkipTurn, onToggle, onPrev, onNext, onSeek, onJump, onOpen, onFocus, focusLabel }: {
  bottom: number; arabicName: string; verse: number; total: number; playing: boolean; positionMs: number; durationMs: number; sleepMin: number | null; reduce: boolean;
  turn: Turn | null; onSkipTurn: () => void;
  onToggle: () => void; onPrev: () => void; onNext: () => void; onSeek: (ms: number) => void; onJump: () => void; onOpen: () => void;
  onFocus?: () => void; focusLabel?: string;
}) {
  const w = useWebT("player");
  const a = useAppT();
  const pos = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 12, right: 12, bottom }}>
      <View style={{ borderRadius: 24, shadowColor: "rgb(3,25,18)", shadowOpacity: 0.45, shadowRadius: 22, shadowOffset: { width: 0, height: 14 }, elevation: 10 }}>
        <Stage rounded={24} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(201,166,94,0.35)" }}>
          {turn ? <TurnBar turn={turn} reduce={reduce} label={w("yourTurn")} skip={w("skip")} onSkip={onSkipTurn} /> : null}
          {/* how far through the surah */}
          <View style={{ height: 3, backgroundColor: "rgba(255,255,255,0.1)" }}>
            <LinearGradient colors={["rgba(201,166,94,0.6)", "rgb(233,207,153)", "rgb(201,166,94)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3, width: `${(verse / Math.max(1, total)) * 100}%` }} />
          </View>
          {/* position in the verse */}
          <View style={{ flexDirection: "row", direction: "ltr", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 6 }}>
            <Text style={timeStyle} accessibilityElementsHidden importantForAccessibility="no">{fmtTime(positionMs / 1000)}</Text>
            <View style={{ flex: 1 }}>
              <GoldSlider value={pos} height={24} step={0.1} label={w("seek")} valueText={a("elapsed", { a: fmtTime(positionMs / 1000), b: fmtTime(durationMs / 1000) })}
                onChange={() => undefined} onDone={(x) => { if (durationMs > 0) onSeek(x * durationMs); }} />
            </View>
            <Text style={[timeStyle, { textAlign: "left" }]} accessibilityElementsHidden importantForAccessibility="no">{fmtTime(durationMs / 1000)}</Text>
            {sleepMin !== null ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }} accessible accessibilityLabel={sleepMin ? `${w("sleep")}, ${w("sleepLeft", { m: sleepMin })}` : `${w("sleep")}, ${w("sleepEnd")}`}>
                <Icon name="moon" color="rgb(233,207,153)" size={13} />
                {sleepMin > 0 ? <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: "rgb(233,207,153)" }}>{sleepMin}</Text> : null}
              </View>
            ) : null}
            {onFocus ? (
              <Pressable onPress={onFocus} accessibilityRole="button" accessibilityLabel={focusLabel} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                style={({ pressed }) => ({ width: 36, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "transparent" })}>
                <Icon name="eye" color="rgb(233,207,153)" size={17} />
              </Pressable>
            ) : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, paddingHorizontal: 12, paddingBottom: 10 }}>
            <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${a("openNowPlaying")}: ${arabicName}, ${verse}/${total}`} hitSlop={6}
              style={{ width: 92, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Eq on={playing && !reduce} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 16, lineHeight: 24, color: "rgb(214,180,108)", writingDirection: "rtl", textAlign: "left" }}>{arabicName}</Text>
                <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: "rgba(255,255,255,0.65)", fontVariant: ["tabular-nums"] }}>{verse}/{total}</Text>
              </View>
            </Pressable>
            <View style={{ flexDirection: "row", direction: "ltr", alignItems: "center", gap: 2 }}>
              <Pressable onPress={onPrev} accessibilityRole="button" accessibilityLabel={w("prev")} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "transparent" })}>
                <Icon name="prev" color="rgba(255,255,255,0.85)" size={20} />
              </Pressable>
              <PlayRosette on={playing} reduce={reduce}>
                <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel={playing ? w("pause") : w("play")}>
                  <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" }}>
                    <Icon name={playing ? "pause" : "play"} color={goldButton.text} size={22} />
                  </LinearGradient>
                </Pressable>
              </PlayRosette>
              <Pressable onPress={onNext} accessibilityRole="button" accessibilityLabel={w("next")} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? "rgba(255,255,255,0.1)" : "transparent" })}>
                <Icon name="next" color="rgba(255,255,255,0.85)" size={20} />
              </Pressable>
            </View>
            <Pressable onPress={onJump} accessibilityRole="button" accessibilityLabel={`${w("jump")}, ${w("verse")} ${verse}`} hitSlop={{ top: 4, bottom: 4 }}
              style={({ pressed }) => ({ width: 64, height: 36, borderRadius: 6, borderWidth: 1, borderColor: pressed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)", backgroundColor: "rgba(255,255,255,0.05)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 })}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#ffffff", fontVariant: ["tabular-nums"] }}>{verse}</Text>
              <Icon name="chevronDown" color="rgba(255,255,255,0.7)" size={12} />
            </Pressable>
          </View>
        </Stage>
      </View>
    </View>
  );
}

function TurnBar({ turn, reduce, label, skip, onSkip }: { turn: Turn; reduce: boolean; label: string; skip: string; onSkip: () => void }) {
  const x = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    x.setValue(0);
    if (reduce) return;
    const a = Animated.timing(x, { toValue: 1, duration: turn.ms, easing: Easing.linear, useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [turn.key, turn.ms, reduce, x]);
  return (
    <View style={{ flexDirection: "row", direction: "ltr", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 6, backgroundColor: "rgba(201,166,94,0.15)" }} accessibilityLiveRegion="polite">
      <View style={{ width: 96, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
        <Animated.View style={{ height: 6, borderRadius: 3, backgroundColor: "rgb(201,166,94)", width: x.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) }} />
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgb(233,207,153)" }}>{label}</Text>
      <Pressable onPress={onSkip} accessibilityRole="button" accessibilityLabel={skip} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        style={({ pressed }) => ({ marginStart: 4, borderRadius: 999, borderWidth: 1, borderColor: pressed ? "#ffffff" : "rgba(255,255,255,0.2)", paddingHorizontal: 9, paddingVertical: 2 })}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{skip}</Text>
      </Pressable>
    </View>
  );
}

const timeStyle = { width: 34, textAlign: "right" as const, fontFamily: FONT.medium, fontSize: 11, color: "rgba(255,255,255,0.55)", fontVariant: ["tabular-nums" as const] };
