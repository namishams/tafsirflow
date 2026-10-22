import { useEffect, useRef } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CALLIG_FONT, FONT } from "@/lib/theme";
import { GLASS_R, GlassIconButton, GlassSurface } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { GoldSlider } from "@/features/radio/Slider";
import { fmtTime } from "@/features/radio/controls";
import { useAppT } from "@/features/radio/strings";
import { Eq, PlayRosette } from "./ornaments";

// The floating player dock of the website (Player.tsx): a dark-emerald Liquid Glass capsule with gold – how far through the surah, the
// position in the verse, the surah's Arabic name and verse x/y beside a small equaliser, previous / next verse and the
// gold play button inside a slowly turning rosette, and the verse picker. Tapping the name opens the full player.
// During the pause after a verse ("your turn") a gold countdown bar sits on top with a Skip button. When a verse could not
// be loaded (error), a gold-framed note with a retry sits on top instead of the play button doing nothing.
export type Turn = { ms: number; key: number };
export function PlayerDock({ bottom, arabicName, verse, total, playing, positionMs, durationMs, sleepMin, reduce, turn, onSkipTurn, onToggle, onPrev, onNext, onSeek, onJump, onOpen, onFocus, focusLabel, error, retryLabel, onRetry }: {
  bottom: number; arabicName: string; verse: number; total: number; playing: boolean; positionMs: number; durationMs: number; sleepMin: number | null; reduce: boolean;
  turn: Turn | null; onSkipTurn: () => void;
  onToggle: () => void; onPrev: () => void; onNext: () => void; onSeek: (ms: number) => void; onJump: () => void; onOpen: () => void;
  onFocus?: () => void; focusLabel?: string;
  error?: string | null; retryLabel?: string; onRetry?: () => void;
}) {
  const w = useWebT("player");
  const a = useAppT();
  const pos = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  return (
    <View pointerEvents="box-none" style={{ position: "absolute", left: 12, right: 12, bottom }}>
      <View style={{ borderRadius: GLASS_R.dock, shadowColor: "rgb(3,25,18)", shadowOpacity: 0.35, shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 10 }}>
        <GlassSurface onStage strong style={{ borderRadius: GLASS_R.dock, borderColor: "rgba(214,180,108,0.4)" }}>
          {error && onRetry ? <ErrorBar text={error} retry={retryLabel ?? ""} onRetry={onRetry} /> : turn ? <TurnBar turn={turn} reduce={reduce} label={w("yourTurn")} skip={w("skip")} onSkip={onSkipTurn} /> : null}
          {/* how far through the surah */}
          <View style={{ height: 3, marginHorizontal: 22, marginTop: 8, borderRadius: 2, overflow: "hidden", backgroundColor: "rgba(255,255,255,0.1)" }}>
            <LinearGradient colors={["rgba(201,166,94,0.6)", "rgb(233,207,153)", "rgb(201,166,94)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 3, width: `${(verse / Math.max(1, total)) * 100}%` }} />
          </View>
          {/* position in the verse */}
          <View style={{ flexDirection: "row", direction: "ltr", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 4 }}>
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
            {onFocus ? <GlassIconButton onStage icon="eye" label={focusLabel ?? ""} onPress={onFocus} size={32} /> : null}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6, paddingHorizontal: 12, paddingBottom: 10 }}>
            <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`${a("openNowPlaying")}: ${arabicName}, ${verse}/${total}`} hitSlop={6}
              style={({ pressed }) => ({ width: 92, flexDirection: "row", alignItems: "center", gap: 8, opacity: pressed ? 0.7 : 1 })}>
              <Eq on={playing && !reduce} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 16, lineHeight: 24, color: "rgb(214,180,108)", writingDirection: "rtl", textAlign: "left" }}>{arabicName}</Text>
                <Text style={{ fontFamily: FONT.medium, fontSize: 12, color: "rgba(255,255,255,0.7)", fontVariant: ["tabular-nums"] }}>{verse}/{total}</Text>
              </View>
            </Pressable>
            <View style={{ flexDirection: "row", direction: "ltr", alignItems: "center", gap: 8 }}>
              <GlassIconButton onStage icon="prev" label={w("prev")} onPress={onPrev} size={42} />
              <PlayRosette on={playing} reduce={reduce}>
                <GlassIconButton variant="gold" icon={playing ? "pause" : "play"} label={playing ? w("pause") : w("play")} onPress={onToggle} size={50} />
              </PlayRosette>
              <GlassIconButton onStage icon="next" label={w("next")} onPress={onNext} size={42} />
            </View>
            <Pressable onPress={onJump} accessibilityRole="button" accessibilityLabel={`${w("jump")}, ${w("verse")} ${verse}`} hitSlop={{ top: 4, bottom: 4 }}
              style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}>
              <GlassSurface onStage interactive style={{ width: 64, height: 36, borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#ffffff", fontVariant: ["tabular-nums"] }}>{verse}</Text>
                <Icon name="chevronDown" color="rgba(255,255,255,0.7)" size={12} />
              </GlassSurface>
            </Pressable>
          </View>
        </GlassSurface>
      </View>
    </View>
  );
}

/** the verse did not load: a short note in cream on the dock's gold band, and a retry */
function ErrorBar({ text, retry, onRetry }: { text: string; retry: string; onRetry: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: "rgba(201,166,94,0.15)", borderBottomWidth: 1, borderBottomColor: "rgba(201,166,94,0.35)" }}
      accessibilityLiveRegion="assertive" accessibilityRole="alert">
      <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 12, lineHeight: 16, color: "rgb(233,207,153)" }}>{text}</Text>
      <Pressable onPress={onRetry} accessibilityRole="button" accessibilityLabel={retry} hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}
        style={({ pressed }) => ({ borderRadius: 999, borderWidth: 1, borderColor: pressed ? "#ffffff" : "rgba(233,207,153,0.6)", paddingHorizontal: 11, paddingVertical: 4 })}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgb(233,207,153)" }}>{retry}</Text>
      </Pressable>
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
