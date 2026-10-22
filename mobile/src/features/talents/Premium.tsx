import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, Path, Pattern, Rect } from "react-native-svg";
import { GIRIH_TILE, PREMIUM, archRing } from "./badgeShape";

// Premium profile header (owner 22.10.2026), the same as the website's PremiumBand / PremiumRing: the founder and
// claimed reciters get an emerald-to-gold band with a quiet girih pattern and an ornamental ring around the avatar
// (founder: double gold ring with small arches; reciters: emerald and gold). Normal profiles stay as they are.
export type PremiumKind = "founder" | "star";

export function PremiumBand({ kind }: { kind: PremiumKind }) {
  const c = PREMIUM[kind].band;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 92, overflow: "hidden" }}>
      <LinearGradient colors={[c[0], c[1], c[2]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }} style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }} />
      <Svg width="100%" height="100%" style={{ opacity: 0.16 }}>
        <Defs><Pattern id={`girih-${kind}`} width={40} height={40} patternUnits="userSpaceOnUse"><Path d={GIRIH_TILE} fill="none" stroke="#F3E2B6" strokeWidth={0.8} /></Pattern></Defs>
        <Rect width="100%" height="100%" fill={`url(#girih-${kind})`} />
      </Svg>
    </View>
  );
}

export function PremiumRing({ kind, size }: { kind: PremiumKind; size: number }) {
  const k = PREMIUM[kind];
  const s = size * 1.25;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: (size - s) / 2, top: (size - s) / 2, width: s, height: s }}>
      <Svg width={s} height={s} viewBox="0 0 120 120">
        <Circle cx={60} cy={60} r={55.5} fill="none" stroke={k.outer} strokeWidth={2.4} />
        <Circle cx={60} cy={60} r={51.5} fill="none" stroke={k.inner} strokeWidth={1.4} />
        {k.arches ? <Path d={archRing(12, 55.5, 2.6, 0.17)} fill="none" stroke={k.outer} strokeWidth={1.6} strokeLinecap="round" />
          : <Path d={archRing(16, 55.5, 1.4, 0.08)} fill="none" stroke={k.inner} strokeWidth={1.2} strokeLinecap="round" />}
      </Svg>
    </View>
  );
}
