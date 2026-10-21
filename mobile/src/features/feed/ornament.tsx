import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { type ReactNode } from "react";
import { GOLD_FOIL } from "@/lib/theme";

// The feed's ornaments: fine gold rules and frames like the illumination of a mushaf page, and the gold medallion
// that carries an icon (promo and offer cards, celebrations). Purely decorative, hidden from screen readers.

/** a fine gold rule with a lozenge in the middle (the dividers of a mushaf page) */
export function Rule({ width, color = "rgba(214,180,108,0.6)" }: { width: number; color?: string }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width, height: 7, alignItems: "center", justifyContent: "center" }}>
      <LinearGradient colors={["rgba(214,180,108,0)", color, "rgba(214,180,108,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ position: "absolute", left: 0, right: 0, height: StyleSheet.hairlineWidth * 2 }} />
      <View style={{ width: 5, height: 5, transform: [{ rotate: "45deg" }], backgroundColor: color }} />
    </View>
  );
}

/** the double gold hairline frame inside a post, with small lozenges in the corners (an illuminated page) */
export function GoldFrame({ inset }: { inset: number }) {
  const c = (pos: object) => <View style={[{ position: "absolute", width: 6, height: 6, transform: [{ rotate: "45deg" }], backgroundColor: "rgba(214,180,108,0.75)" }, pos]} />;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", left: inset, right: inset, top: inset, bottom: inset }}>
      <View style={[StyleSheet.absoluteFill, { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: "rgba(214,180,108,0.5)" }]} />
      <View style={{ position: "absolute", left: 4, right: 4, top: 4, bottom: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(214,180,108,0.22)" }} />
      {c({ left: -3, top: -3 })}{c({ right: -3, top: -3 })}{c({ left: -3, bottom: -3 })}{c({ right: -3, bottom: -3 })}
    </View>
  );
}


/** an icon in a struck gold medallion: foil ring, enamel field, eight-pointed star in fine line behind */
export function Medallion({ size = 64, children }: { size?: number; children?: ReactNode }) {
  const r = size / 2;
  const star = Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8 - Math.PI / 2; const rr = i % 2 ? r * 0.62 : r * 0.8; return `${(r + rr * Math.cos(a)).toFixed(1)},${(r + rr * Math.sin(a)).toFixed(1)}`; }).join("L");
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <LinearGradient colors={[...GOLD_FOIL]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: r }]} />
      <View style={{ position: "absolute", left: 2.5, right: 2.5, top: 2.5, bottom: 2.5, borderRadius: r, overflow: "hidden" }}>
        <Svg width={size - 5} height={size - 5}>
          <Defs><RadialGradient id="med" cx="40%" cy="30%" r="80%"><Stop offset="0" stopColor="#135a43" /><Stop offset="1" stopColor="#04241a" /></RadialGradient></Defs>
          <Circle cx={(size - 5) / 2} cy={(size - 5) / 2} r={(size - 5) / 2} fill="url(#med)" />
          <Path d={`M${star}Z`} transform="translate(-2.5 -2.5)" fill="none" stroke="rgb(214,180,108)" strokeOpacity={0.35} strokeWidth={0.8} />
        </Svg>
      </View>
      {children}
    </View>
  );
}
