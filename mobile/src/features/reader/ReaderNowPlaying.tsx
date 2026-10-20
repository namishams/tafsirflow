import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, R, stage } from "@/lib/theme";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import type { Chapter, Verse } from "@/lib/quran";
import { RadioOrb } from "@/features/radio/art";
import { Choices, GoldPlay, RoundButton, fmtTime } from "@/features/radio/controls";
import { GoldSlider } from "@/features/radio/Slider";
import { VerseArabic, wordAt } from "@/features/radio/VerseText";
import { initials } from "@/features/radio/engine";
import { useAppT } from "@/features/radio/strings";

// The reader's full "now playing" view, in the radio's style: the reciter orb, the surah in calligraphy, the verse
// being recited with the word lit in gold and its translation, position in the verse, previous / next verse,
// speed, repeat and sleep timer – all driving the reader's own player.
export function ReaderNowPlaying({ open, onClose, chapter, verse, total, reciterName, timed, playing, positionMs, durationMs, reduce, speed, repeat, sleepMode, sleepMin,
  onToggle, onPrev, onNext, onSeek, onSpeed, onRepeat, onSleep }: {
  open: boolean; onClose: () => void; chapter: Chapter; verse: Verse; total: number; reciterName: string; timed: boolean; playing: boolean; positionMs: number; durationMs: number; reduce: boolean;
  speed: number; repeat: number; sleepMode: number; sleepMin: number | null;
  onToggle: () => void; onPrev: () => void; onNext: () => void; onSeek: (ms: number) => void; onSpeed: (n: number) => void; onRepeat: (n: number) => void; onSleep: (m: number) => void;
}) {
  const w = useWebT("player");
  const a = useAppT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const orb = Math.min(width - 150, 220);
  const lit = timed && playing ? wordAt(verse, positionMs) : null;
  const pos = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  const label = { fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)", marginBottom: 8 };

  return (
    <Modal visible={open} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <Stage hairlines={false} style={{ flex: 1 }}>
        {open ? <StatusBar style="light" /> : null}
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <RadialGradient id="rnp1" cx="50%" cy="22%" r="55%"><Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.13} /><Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0} /></RadialGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#rnp1)" />
        </Svg>
        <ScrollView contentContainerStyle={{ paddingTop: insets.top + 4, paddingBottom: insets.bottom + 36, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={a("close")} hitSlop={10} style={{ width: 44, height: 44, justifyContent: "center", marginStart: -8 }}>
              <Icon name="chevronDown" color="#ffffff" size={26} />
            </Pressable>
            <View style={{ flex: 1, alignItems: "center", marginEnd: 36 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{a("nowPlaying")}</Text>
              <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{reciterName}</Text>
            </View>
          </View>

          <View style={{ alignItems: "center", marginTop: 24 }}>
            <RadioOrb on={playing} size={orb} label={initials(reciterName)} reduce={reduce} />
          </View>

          <View style={{ alignItems: "center", marginTop: 20 }} accessible accessibilityRole="header" accessibilityLabel={`${chapter.id}. ${chapter.name_simple}, ${a("verseOf", { v: verse.verse_number, n: total })}`}>
            <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 40, lineHeight: 64, color: stage.gold, writingDirection: "rtl", textAlign: "center" }}>{chapter.name_arabic}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.5, color: "#eef0f3", textAlign: "center" }}>{chapter.id}. {chapter.name_simple}</Text>
            <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: stage.goldSoft, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: "#f3e2b6" }}>{a("verseOf", { v: verse.verse_number, n: total })}</Text>
            </View>
          </View>

          <View style={{ marginTop: 22, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.22)", backgroundColor: "rgba(255,255,255,0.04)", padding: 18 }}>
            <VerseArabic verse={verse} activeWord={lit} size={28} />
            {verse.translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: "rgba(255,255,255,0.72)", marginTop: 10 }}>{verse.translation}</Text> : null}
          </View>

          <View style={{ marginTop: 18 }}>
            <GoldSlider value={pos} label={w("seek")} step={0.1} valueText={a("elapsed", { a: fmtTime(positionMs / 1000), b: fmtTime(durationMs / 1000) })}
              onChange={() => undefined} onDone={(x) => { if (durationMs > 0) onSeek(x * durationMs); }} />
            <View style={{ flexDirection: "row", direction: "ltr", justifyContent: "space-between" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Text style={timeStyle}>{fmtTime(positionMs / 1000)}</Text>
              <Text style={timeStyle}>{durationMs > 0 ? fmtTime(durationMs / 1000) : "–:––"}</Text>
            </View>
          </View>

          <View style={{ marginTop: 14, flexDirection: "row", direction: "ltr", alignItems: "center", justifyContent: "center", gap: 22 }}>
            <RoundButton icon="prev" label={w("prev")} onPress={onPrev} size={52} />
            <GoldPlay playing={playing} onPress={onToggle} labels={[w("pause"), w("play")]} size={78} />
            <RoundButton icon="next" label={w("next")} onPress={onNext} size={52} />
          </View>

          <View style={{ marginTop: 26, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.22)", padding: 16, gap: 16 }}>
            <View>
              <Text style={label}>{w("speed")}</Text>
              <Choices onStage value={speed} options={[0.5, 0.75, 1, 1.25, 1.5].map((n) => [n, `${n}×`] as [number, string])} onChange={onSpeed} label={w("speed")} />
            </View>
            <View>
              <Text style={label}>{w("repeat")}</Text>
              <Choices onStage value={repeat} options={[1, 2, 3, 5, 10].map((n) => [n, `×${n}`] as [number, string])} onChange={onRepeat} label={w("repeat")} />
            </View>
            <View>
              <Text style={label}>{w("sleep")}</Text>
              <Choices onStage value={sleepMode} options={[0, 15, 30, 60, -1].map((n) => [n, n === 0 ? w("sleepOff") : n === -1 ? w("sleepEnd") : `${n} min`] as [number, string])} onChange={onSleep} label={w("sleep")} />
              {sleepMin ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>{w("sleepLeft", { m: sleepMin })}</Text> : null}
            </View>
          </View>
        </ScrollView>
      </Stage>
    </Modal>
  );
}

const timeStyle = { fontFamily: FONT.medium, fontSize: 12, color: "rgba(255,255,255,0.55)", fontVariant: ["tabular-nums" as const] };
