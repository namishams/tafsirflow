import { memo } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Defs, G, LinearGradient as SvgLinear, Mask, Path, Pattern, RadialGradient, Rect, Stop } from "react-native-svg";
import { CALLIG_FONT, FONT, R } from "@/lib/theme";
import { Icon } from "@/components/icons";
import { useLoop } from "./motion";

// Station poster (RadioPlayer.tsx, .q-poster): jewel-tone gradient, girih lattice fading downwards, a pointed arch,
// the station's word in gold calligraphy, a play button (an equaliser while on air), the "voices" badge, title and text.

/** "linear-gradient(165deg,#13644b 0%,#073024 55%,#04190f 100%)" -> colours and stops */
export function cssStops(css: string): { colors: [string, string, ...string[]]; locations: [number, number, ...number[]] } {
  const m = [...css.matchAll(/(#[0-9a-fA-F]{6})\s+(\d+)%/g)];
  if (m.length < 2) return { colors: ["#13644b", "#04190f"], locations: [0, 1] };
  return { colors: m.map((x) => x[1]) as [string, string, ...string[]], locations: m.map((x) => Number(x[2]) / 100) as [number, number, ...number[]] };
}

function Eq({ on, color }: { on: boolean; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, height: 18 }}>
      {[0, 1, 2, 3].map((i) => <EqBar key={i} i={i} on={on} color={color} />)}
    </View>
  );
}
function EqBar({ i, on, color }: { i: number; on: boolean; color: string }) {
  const v = useLoop(on, 1400, [0, 450, 900, 220][i]);
  const scaleY = on ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.22, 1, 0.22] }) : 0.5;
  const translateY = on ? v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [7, 0, 7] }) : 4.5;
  return <Animated.View style={{ width: 3, height: 18, borderRadius: 1, backgroundColor: color, transform: [{ translateY }, { scaleY }] }} />;
}

/** the garnet of the live mark (as on the radio stage, the mini player and the player) */
export const LIVE = "rgb(160,58,52)";

export const StationPoster = memo(function StationPoster({ id, title, desc, word, bg, on, mix, mixLabel, liveLabel, locked, reduce, onChoose, label }: {
  id: string; title: string; desc: string; word: string; bg: string; on: boolean; mix?: boolean; mixLabel: string; liveLabel?: string; locked?: boolean; reduce: boolean; onChoose: (id: string) => void; label: string;
}) {
  const g = cssStops(bg);
  const wordSize = word.length > 6 ? 30 : word.length > 3 ? 38 : 48;
  return (
    <Pressable onPress={() => onChoose(id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={label}
      style={({ pressed }) => [{ flex: 1, borderRadius: R.card, overflow: "hidden", transform: [{ scale: pressed ? 0.985 : 1 }],
        // a solid ground under the gradient gives the shadow its shape (else RN warns on every poster: "cannot calculate shadow efficiently")
        backgroundColor: g.colors[g.colors.length - 1], shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 10 } }]}>
      <LinearGradient colors={g.colors} locations={g.locations} start={{ x: 0.37, y: 0 }} end={{ x: 0.63, y: 1 }} style={{ aspectRatio: 4 / 5, padding: 16, justifyContent: "flex-end" }}>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          <Defs>
            <Pattern id="pg" width={28} height={28} patternUnits="userSpaceOnUse">
              <Path d="M7 7h14v14H7zM14 2.5L25.5 14 14 25.5 2.5 14z" fill="none" stroke="#e9cf99" strokeOpacity={0.09} strokeWidth={0.8} />
            </Pattern>
            <RadialGradient id="pglow" cx="50%" cy="18%" rx="90%" ry="60%"><Stop offset="0" stopColor="#e9cf99" stopOpacity={0.16} /><Stop offset="0.7" stopColor="#e9cf99" stopOpacity={0} /></RadialGradient>
            <SvgLinear id="pfade" x1="0" y1="0" x2="0" y2="1"><Stop offset="0.3" stopColor="#fff" stopOpacity={1} /><Stop offset="0.85" stopColor="#fff" stopOpacity={0} /></SvgLinear>
            <Mask id="pmask"><Rect width="100%" height="100%" fill="url(#pfade)" /></Mask>
          </Defs>
          <G mask="url(#pmask)">
            <Rect width="100%" height="100%" fill="url(#pg)" />
            <Rect width="100%" height="100%" fill="url(#pglow)" />
          </G>
        </Svg>
        {/* pointed arch */}
        <View pointerEvents="none" style={{ position: "absolute", left: "16%", right: "16%", top: "9%", height: "52%", opacity: on ? 0.85 : 0.5 }}>
          <Svg width="100%" height="100%" viewBox="0 0 100 110" preserveAspectRatio="none">
            <G fill="none" stroke="#e9cf99" strokeWidth={0.8}>
              <Path d="M4 110V48C4 24 26 9 50 2c24 7 46 22 46 46v62" />
              <Path d="M11 110V50c0-20 19-33 39-39 20 6 39 19 39 39v60" strokeOpacity={0.55} />
            </G>
          </Svg>
        </View>
        {/* the station's word in gold calligraphy */}
        <View pointerEvents="none" style={{ position: "absolute", left: "10%", right: "10%", top: "17%", height: "38%", alignItems: "center", justifyContent: "center" }}>
          <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: CALLIG_FONT, fontSize: wordSize, lineHeight: wordSize * 1.45, color: on ? "#f6e7bf" : "#d9b56c", textAlign: "center", writingDirection: "rtl" }}>{word}</Text>
        </View>
        {/* inner frame */}
        <View pointerEvents="none" style={{ position: "absolute", top: 7, left: 7, right: 7, bottom: 7, borderRadius: 8, borderWidth: 1, borderColor: on ? "rgba(233,207,153,0.9)" : "rgba(233,207,153,0.3)" }} />
        <View style={{ position: "absolute", left: 16, top: 16 }}>
          {on ? (
            <LinearGradient colors={["#e6cd92", "#c6a65e"]} style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" }}>
              <Eq on={!reduce} color="rgb(8,38,29)" />
            </LinearGradient>
          ) : (
            <View style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: "rgba(233,207,153,0.55)", backgroundColor: "rgba(0,0,0,0.18)", alignItems: "center", justifyContent: "center" }}>
              <Icon name="play" color="#f3e2b6" size={17} />
            </View>
          )}
        </View>
        <View style={{ position: "absolute", right: 16, top: 20, alignItems: "flex-end", gap: 6 }}>
          {on && liveLabel ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 3, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: LIVE }}>
              <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#ffffff" }} />
              <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 9.5, letterSpacing: 1, color: "#ffffff" }}>{liveLabel}</Text>
            </View>
          ) : null}
          {mix ? (
            <View style={{ borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(233,207,153,0.45)", paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 9.5, letterSpacing: 1.1, textTransform: "uppercase", color: "#f3e2b6" }}>{mixLabel}</Text>
            </View>
          ) : null}
          {locked ? <Icon name="lock" color="#e6cd92" size={16} /> : null}
        </View>
        <Text style={{ fontFamily: FONT.display, fontSize: 18, lineHeight: 21, letterSpacing: -0.3, color: "#ffffff" }} numberOfLines={2}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 16.5, color: "rgba(255,255,255,0.65)", marginTop: 4 }} numberOfLines={2}>{desc}</Text>
      </LinearGradient>
    </Pressable>
  );
});
