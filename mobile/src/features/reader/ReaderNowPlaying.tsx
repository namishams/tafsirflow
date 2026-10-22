import { Modal, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, stage, useTheme } from "@/lib/theme";
import { Chip, GLASS_R, GlassButton, GlassCard, GlassIconButton, SmallStar, Stage, StarLattice } from "@/components/brand";
import { useWebT } from "@/i18n/web";
import type { Chapter, Verse } from "@/lib/quran";
import { Choices, fmtTime } from "@/features/radio/controls";
import { GoldSlider } from "@/features/radio/Slider";
import { VerseArabic, wordAt } from "@/features/radio/VerseText";
import { useAppT } from "@/features/radio/strings";
import { useSheetBarStyle } from "./statusBar";

// The reader's full "now playing" view, Apple Music style in Liquid Glass on the emerald stage: a large calligraphy
// artwork (the surah's name in gold inside an illuminated frame), title and reciter, the verse being recited with the
// word lit in gold and its translation, a scrubber with time labels, large round glass transport buttons with the gold
// play, and speed, repeat, reciter and sleep timer as glass chips – all driving the reader's own player.
export function ReaderNowPlaying({ open, onClose, chapter, verse, total, reciterName, timed, playing, positionMs, durationMs, reduce, speed, repeat, sleepMode, sleepMin,
  onToggle, onPrev, onNext, onSeek, onSpeed, onRepeat, onSleep, onReciter, error, retryLabel, onRetry }: {
  open: boolean; onClose: () => void; chapter: Chapter; verse: Verse; total: number; reciterName: string; timed: boolean; playing: boolean; positionMs: number; durationMs: number; reduce: boolean;
  speed: number; repeat: number; sleepMode: number; sleepMin: number | null;
  onToggle: () => void; onPrev: () => void; onNext: () => void; onSeek: (ms: number) => void; onSpeed: (n: number) => void; onRepeat: (n: number) => void; onSleep: (m: number) => void;
  /** opens the reciter choice (the reader's settings); without it the reciter shows as a label */
  onReciter?: () => void;
  /** the verse could not be loaded: a note with a retry */
  error?: string | null; retryLabel?: string; onRetry?: () => void;
}) {
  const th = useTheme();
  // the dark stage needs light status bar text; the reader below gets its own style back on close
  useSheetBarStyle(open, "light", th.dark ? "light" : "dark");
  const w = useWebT("player");
  const a = useAppT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const art = Math.min(width - 56, 360);
  const lit = timed && playing ? wordAt(verse, positionMs) : null;
  const pos = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  const label = { fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: 8 };

  return (
    <Modal visible={open} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <Stage hairlines={false} style={{ flex: 1 }}>
        {open ? <StatusBar style="light" /> : null}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="rnp1" cx="50%" cy="26%" r="60%"><Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.16} /><Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} /></RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#rnp1)" />
        </Svg>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: insets.bottom + 36, paddingHorizontal: 20 }}>
          {/* grabber row: close, "now playing", nothing on the right (Apple Music) */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <GlassIconButton onStage icon="chevronDown" label={a("close")} onPress={onClose} size={40} />
            <View style={{ flex: 1, alignItems: "center", marginEnd: 40 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{a("nowPlaying")}</Text>
              <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{chapter.id}. {chapter.name_simple}</Text>
            </View>
          </View>

          {/* the artwork: the surah's name in gold calligraphy in an illuminated frame, breathing slightly while it plays */}
          <View style={{ alignItems: "center", marginTop: 22 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={{ width: art, height: art, borderRadius: GLASS_R.card + 6, shadowColor: "#000", shadowOpacity: 0.45, shadowRadius: 28, shadowOffset: { width: 0, height: 18 }, transform: [{ scale: playing || reduce ? 1 : 0.9 }] }}>
              <View style={{ flex: 1, borderRadius: GLASS_R.card + 6, overflow: "hidden", borderWidth: 1, borderColor: "rgba(214,180,108,0.45)" }}>
                <LinearGradient colors={["rgb(16,72,54)", "rgb(5,28,21)"]} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={StyleSheet.absoluteFill} />
                <StarLattice opacity={0.08} size={56} />
                <View pointerEvents="none" style={{ position: "absolute", top: 12, left: 12, right: 12, bottom: 12, borderRadius: GLASS_R.card - 4, borderWidth: 1, borderColor: "rgba(233,207,153,0.28)" }} />
                <View pointerEvents="none" style={{ position: "absolute", top: 18, left: 18, right: 18, bottom: 18, borderRadius: GLASS_R.card - 8, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(233,207,153,0.18)" }} />
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 28 }}>
                  <SmallStar size={14} color={stage.gold} />
                  <Text allowFontScaling={false} adjustsFontSizeToFit numberOfLines={1} minimumFontScale={0.5}
                    style={{ fontFamily: CALLIG_FONT, fontSize: Math.round(art * 0.26), lineHeight: Math.round(art * 0.44), color: "rgb(233,207,153)", writingDirection: "rtl", textAlign: "center" }}>{chapter.name_arabic}</Text>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.4, textTransform: "uppercase", color: "rgba(233,207,153,0.7)" }}>{a("verseOf", { v: verse.verse_number, n: total })}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* title and reciter, left aligned under the artwork */}
          <View style={{ marginTop: 26 }} accessible accessibilityRole="header" accessibilityLabel={`${chapter.id}. ${chapter.name_simple}, ${a("verseOf", { v: verse.verse_number, n: total })}, ${reciterName}`}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 29, letterSpacing: -0.5, color: "#eef0f3" }}>{chapter.id}. {chapter.name_simple}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.medium, fontSize: 16, color: stage.gold, marginTop: 2 }}>{reciterName}</Text>
          </View>

          {/* scrubber */}
          <View style={{ marginTop: 14 }}>
            <GoldSlider value={pos} label={w("seek")} step={0.1} valueText={a("elapsed", { a: fmtTime(positionMs / 1000), b: fmtTime(durationMs / 1000) })}
              onChange={() => undefined} onDone={(x) => { if (durationMs > 0) onSeek(x * durationMs); }} />
            <View style={{ flexDirection: "row", direction: "ltr", justifyContent: "space-between" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={timeStyle}>{fmtTime(positionMs / 1000)}</Text>
              <Text style={timeStyle}>{durationMs > 0 ? `-${fmtTime(Math.max(0, durationMs - positionMs) / 1000)}` : "–:––"}</Text>
            </View>
          </View>

          {error && onRetry ? (
            <GlassCard onStage padded={false} style={{ marginTop: 14, flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderColor: "rgba(214,180,108,0.45)" }}>
              <View style={{ flex: 1 }} accessibilityLiveRegion="assertive" accessibilityRole="alert">
                <Text style={{ fontFamily: FONT.medium, fontSize: 13.5, lineHeight: 19, color: "#f3e2b6" }}>{error}</Text>
              </View>
              <GlassButton onStage compact title={retryLabel ?? ""} onPress={onRetry} />
            </GlassCard>
          ) : null}

          {/* transport: large round glass buttons around the gold play */}
          <View style={{ marginTop: 14, flexDirection: "row", direction: "ltr", alignItems: "center", justifyContent: "center", gap: 28 }}>
            <GlassIconButton onStage icon="prev" label={w("prev")} onPress={onPrev} size={60} />
            <GlassIconButton variant="gold" icon={playing ? "pause" : "play"} label={playing ? w("pause") : w("play")} onPress={onToggle} size={82} />
            <GlassIconButton onStage icon="next" label={w("next")} onPress={onNext} size={60} />
          </View>

          {/* the verse being recited */}
          <GlassCard onStage style={{ marginTop: 26 }}>
            <VerseArabic verse={verse} activeWord={lit} size={28} />
            {verse.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: "rgba(255,255,255,0.72)", marginTop: 10 }}>{verse.translation}</Text> : null}
          </GlassCard>

          {/* speed, repeat, reciter, sleep timer as glass chips */}
          <GlassCard onStage style={{ marginTop: 14, gap: 16 }}>
            <View>
              <Text style={label}>{w("speed")}</Text>
              <Choices onStage value={speed} options={[0.5, 0.75, 1, 1.25, 1.5].map((n) => [n, `${n}×`] as [number, string])} onChange={onSpeed} label={w("speed")} />
            </View>
            <View>
              <Text style={label}>{w("repeat")}</Text>
              <Choices onStage value={repeat} options={[1, 2, 3, 5, 10].map((n) => [n, `×${n}`] as [number, string])} onChange={onRepeat} label={w("repeat")} />
            </View>
            {onReciter ? (
              <View>
                <Text style={label}>{w("reciter")}</Text>
                <View style={{ flexDirection: "row" }}><Chip onStage icon="speaker" label={reciterName} onPress={onReciter} /></View>
              </View>
            ) : null}
            <View>
              <Text style={label}>{w("sleep")}</Text>
              <Choices onStage value={sleepMode} options={[0, 15, 30, 60, -1].map((n) => [n, n === 0 ? w("sleepOff") : n === -1 ? w("sleepEnd") : `${n} min`] as [number, string])} onChange={onSleep} label={w("sleep")} />
              {sleepMin ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{w("sleepLeft", { m: sleepMin })}</Text> : null}
            </View>
          </GlassCard>
        </ScrollView>
      </Stage>
    </Modal>
  );
}

const timeStyle = { fontFamily: FONT.medium, fontSize: 12, color: "rgba(255,255,255,0.55)", fontVariant: ["tabular-nums" as const] };
