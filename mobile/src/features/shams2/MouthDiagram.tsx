import { useId } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";
import { ARABIC_FONT, FONT, useTheme } from "@/lib/theme";
import { DIAGRAM, REGION_SPOTS, VIEWBOX, type Region } from "./makhrajData";

// Side view of mouth and throat for the makhraj coach: the place of the letter glows in gold, the place of the letter
// it is confused with is a dashed emerald ring. Drawn for this app (no anatomical atlas), the same geometry as the
// website (src/components/learn/shams2/MouthDiagram.tsx); the label describes it for VoiceOver.
export function MouthDiagram({ region, partner, letter, partnerLetter, label, legendThis, legendPartner, size = 260 }: {
  region: Region; partner?: Region; letter: string; partnerLetter?: string; label: string; legendThis: string; legendPartner?: string; size?: number;
}) {
  const t = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const c = t.dark
    ? { head: ["#123a2d", "#0b261d"], line: "rgba(120,200,170,0.55)", cavity: "rgba(4,16,12,0.85)", tongue: "rgba(196,128,120,0.32)", tongueLine: "rgba(222,160,150,0.9)", palate: "rgb(214,178,106)", teeth: "#e9e4d6", partner: "rgb(58,190,146)" }
    : { head: ["#e6f2ec", "#d1e5da"], line: "rgba(6,108,78,0.55)", cavity: "rgba(255,255,255,0.82)", tongue: "rgba(201,138,131,0.34)", tongueLine: "rgb(154,90,82)", palate: "rgb(150,116,52)", teeth: "#ffffff", partner: "rgb(6,108,78)" };
  const a = REGION_SPOTS[region];
  const b = partner && partner !== region ? REGION_SPOTS[partner] : null;
  return (
    <View style={{ alignItems: "center", gap: 10 }}>
      <View accessible accessibilityRole="image" accessibilityLabel={label} style={{ width: size, height: size, borderRadius: 28, overflow: "hidden", backgroundColor: t.dark ? "rgba(255,255,255,0.03)" : "rgba(6,108,78,0.04)", borderWidth: 1, borderColor: "rgba(201,166,94,0.35)" }}>
        <Svg width={size} height={size} viewBox={VIEWBOX}>
          <Defs>
            <LinearGradient id={`h${uid}`} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor={c.head[0]} /><Stop offset="1" stopColor={c.head[1]} /></LinearGradient>
            <RadialGradient id={`g${uid}`} cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#d6b46c" stopOpacity={0.75} /><Stop offset="1" stopColor="#d6b46c" stopOpacity={0} /></RadialGradient>
          </Defs>
          <Path d={DIAGRAM.head} fill={`url(#h${uid})`} stroke={c.line} strokeWidth={1.4} />
          <Path d={DIAGRAM.nasal} fill="none" stroke={c.line} strokeOpacity={0.6} strokeWidth={1.2} />
          <Path d={DIAGRAM.cavity} fill={c.cavity} />
          <Path d={DIAGRAM.tongueBody} fill={c.tongue} />
          <Path d={DIAGRAM.tongue} fill="none" stroke={c.tongueLine} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={DIAGRAM.palate} fill="none" stroke={c.palate} strokeWidth={2} strokeLinecap="round" />
          <Path d={DIAGRAM.velum} fill={c.tongue} stroke={c.palate} strokeWidth={1.6} />
          <Path d={DIAGRAM.pharynx} fill="none" stroke={c.line} strokeWidth={1.6} />
          <Path d={DIAGRAM.epiglottis} fill="none" stroke={c.tongueLine} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={DIAGRAM.larynx} fill="none" stroke={c.line} strokeWidth={1.6} strokeLinecap="round" />
          <Path d={DIAGRAM.teethUp} fill={c.teeth} stroke={c.palate} strokeWidth={1} />
          <Path d={DIAGRAM.teethDown} fill={c.teeth} stroke={c.palate} strokeWidth={1} />
          <Path d={DIAGRAM.molars} fill={c.teeth} fillOpacity={0.7} stroke={c.palate} strokeWidth={1} strokeDasharray="2 2" />
          {b ? <Circle cx={b.x} cy={b.y} r={b.r} fill="none" stroke={c.partner} strokeWidth={1.6} strokeDasharray="3 3" /> : null}
          <Circle cx={a.x} cy={a.y} r={a.r * 2} fill={`url(#g${uid})`} />
          <Circle cx={a.x} cy={a.y} r={a.r} fill="none" stroke="#c6a65e" strokeWidth={2} strokeDasharray={a.side ? "5 3" : undefined} />
          <Circle cx={a.x} cy={a.y} r={3.2} fill="#c6a65e" />
        </Svg>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", columnGap: 16, rowGap: 6 }}>
        <Legend dot="gold" glyph={letter} text={legendThis} />
        {b && partnerLetter && legendPartner ? <Legend dot="ring" color={c.partner} glyph={partnerLetter} text={legendPartner} /> : null}
      </View>
    </View>
  );
}

function Legend({ dot, color, glyph, text }: { dot: "gold" | "ring"; color?: string; glyph: string; text: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      <View style={dot === "gold" ? { width: 12, height: 12, borderRadius: 6, backgroundColor: "#c6a65e" } : { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderStyle: "dashed", borderColor: color }} />
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 26, color: t.ink }}>{glyph}</Text>
      <Text style={{ fontFamily: FONT.medium, fontSize: 12.5, color: t.muted }}>{text}</Text>
    </View>
  );
}
