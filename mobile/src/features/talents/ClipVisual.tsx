import { useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Rect } from "react-native-svg";
import { ARABIC_FONT, FONT, stage } from "@/lib/theme";
import { Arcade, StarLattice } from "@/components/brand";
import { useSurahVerses } from "@/features/reciter-path/useVerse";
import type { Verse } from "@/lib/quran";
import { BadgeMark, type Badge } from "./badges";

// The generated visual of a recitation clip (emerald and gold): the verse text from the app's Quran data (Quran.com,
// never typed by hand), the verse reference, the voice as gold bars and the reciter's name with the badge.

/** "2:255" or "2:255-257" → surah, first and last verse */
export function parseKey(key: string | null | undefined): { surah: number; from: number; to: number } | null {
  const m = /^(\d{1,3}):(\d{1,3})(?:-(\d{1,3}))?$/.exec(key ?? "");
  if (!m) return null;
  return { surah: Number(m[1]), from: Number(m[2]), to: Number(m[3] ?? m[2]) };
}

/** the verses of a key (loaded with the surah) */
export function useKeyVerses(key: string | null | undefined): { verses: Verse[] | null; error: boolean } {
  const k = parseKey(key);
  const { verses, error } = useSurahVerses(k?.surah ?? null);
  const list = useMemo(() => (k && verses ? verses.filter((v) => v.verse_number >= k.from && v.verse_number <= k.to) : null), [verses, k?.surah, k?.from, k?.to]); // eslint-disable-line react-hooks/exhaustive-deps
  return { verses: list, error };
}

/** loudness bars 0..100 */
export function Waveform({ values, progress = 1, height = 46, color = stage.gold }: { values: number[]; progress?: number; height?: number; color?: string }) {
  const v = values.length ? values : Array.from({ length: 48 }, (_, i) => 18 + ((i * 37) % 50));
  const n = v.length;
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${n * 4} ${height}`} preserveAspectRatio="none">
      {v.map((x, i) => {
        const h = Math.max(3, (Math.min(100, Math.max(0, x)) / 100) * height);
        return <Rect key={i} x={i * 4} y={(height - h) / 2} width={2.4} height={h} rx={1.2} fill={color} opacity={i / n <= progress ? 1 : 0.35} />;
      })}
    </Svg>
  );
}

export function ClipVisual({ verseKey, name, badge, waveform, progress = 1, compact = false }: {
  verseKey: string | null; name: string; badge?: Badge | null; waveform: number[]; progress?: number; compact?: boolean;
}) {
  const { verses, error } = useKeyVerses(verseKey);
  const text = verses?.map((v) => v.text_uthmani).join(" ۝ ") ?? "";
  const size = compact ? 18 : text.length > 400 ? 20 : text.length > 200 ? 24 : 30;
  return (
    <LinearGradient colors={["rgb(10,64,48)", stage.bg, stage.deep]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={{ flex: 1, overflow: "hidden" }}>
      <View pointerEvents="none" style={{ position: "absolute", inset: 0, opacity: 0.6 }}><StarLattice opacity={0.07} size={compact ? 40 : 72} /></View>
      <View style={{ flex: 1, margin: compact ? 6 : 14, borderWidth: 1, borderColor: stage.goldSoft, borderRadius: compact ? 8 : 16, padding: compact ? 8 : 20, justifyContent: "space-between" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: compact ? 10 : 13, letterSpacing: 1.6, color: stage.gold, textAlign: "center" }}>{verseKey ?? ""}</Text>
        <View style={{ flex: 1, justifyContent: "center", paddingVertical: compact ? 4 : 16 }}>
          {verses ? (
            <Text numberOfLines={compact ? 4 : 14} adjustsFontSizeToFit minimumFontScale={0.5} allowFontScaling={false}
              style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.9, color: stage.cream, textAlign: "center", writingDirection: "rtl" }}>{text}</Text>
          ) : error ? null : <ActivityIndicator color={stage.gold} />}
        </View>
        {!compact ? (
          <View style={{ gap: 12 }}>
            <Waveform values={waveform} progress={progress} />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Text numberOfLines={1} style={{ fontFamily: FONT.bold, fontSize: 15, color: "#fff" }}>{name}</Text>
              {badge ? <BadgeMark badge={badge} size={15} /> : null}
            </View>
            <Arcade />
          </View>
        ) : <Waveform values={waveform} height={16} />}
      </View>
    </LinearGradient>
  );
}
