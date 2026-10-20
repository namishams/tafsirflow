import { useEffect, useRef, useState } from "react";
import { Animated, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import Svg, { Ellipse, G, Path } from "react-native-svg";
import { useLang } from "@/i18n";
import { FONT, useTheme } from "@/lib/theme";
import { GOLD } from "../art";
import { useReducedMotionX } from "../motion";

// Skyline, MadeInDubai, CountUp and Reveal: the small signature pieces of the website.

// The skyline of the Emirates as one gold line (Skyline.tsx): Sheikh Zayed Grand Mosque, Louvre Abu Dhabi, Museum of
// the Future, Burj Khalifa, Dubai Frame, Burj Al Arab, a dhow on the Creek and Jumeirah Mosque.
const P = [
  "M46 150V64h8v86M43 64h14M47 64V54h6v10M50 54v-9",
  "M78 150v-38h144v38",
  "M116 112a34 40 0 0 1 68 0M150 72v-9",
  "M90 113a14 17 0 0 1 28 0M182 113a14 17 0 0 1 28 0",
  "M92 150v-16a7 7 0 0 1 14 0v16M116 150v-16a7 7 0 0 1 14 0v16M170 150v-16a7 7 0 0 1 14 0v16M194 150v-16a7 7 0 0 1 14 0v16",
  "M246 150V64h8v86M243 64h14M247 64V54h6v10M250 54v-9",
  "M296 128a70 20 0 0 1 140 0M300 128h132",
  "M322 128v22M410 128v22M334 150v-12h20v12M362 150v-16h26v16",
  "M466 150c16-14 84-14 100 0",
  "M630 6l1 24h3l1 22h3l2 24h4l2 26h4l3 26h4l2 22M630 6l-1 24h-3l-1 22h-3l-2 24h-4l-2 26h-4l-3 26h-4l-2 22",
  "M690 150V70h50v80M698 150V78h34v72",
  "M800 150V38M800 38c40 22 58 72 56 112M800 62h40M800 72h-14",
  "M898 140h58l-8 8h-42zM924 140v-36M924 106c14 6 22 18 24 30h-24",
  "M1030 150v-32h92v32M1050 118a26 30 0 0 1 52 0M1076 88v-9M1060 150v-14a6 6 0 0 1 12 0v14M1080 150v-14a6 6 0 0 1 12 0v14",
  "M1016 150V82h8v68M1013 82h14M1017 82v-9h6v9M1020 73v-8",
  "M1132 150V82h8v68M1129 82h14M1133 82v-9h6v9M1136 73v-8",
  "M0 150h1200M270 157h46M512 158h70M880 157h90M1150 157h30",
];
const STARS: [number, number][] = [[120, 30], [380, 54], [560, 22], [740, 40], [960, 28], [1170, 48]];

/** the gold skyline line (decorative); color defaults to the website's gold */
export function Skyline({ color = GOLD, style }: { color?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: "100%", aspectRatio: 1200 / 160 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%" viewBox="0 0 1200 160" preserveAspectRatio="xMidYMax meet">
        <G fill="none" stroke={color} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" opacity={0.75}>
          {P.map((d, i) => <Path key={i} d={d} />)}
          <Ellipse cx={516} cy={98} rx={40} ry={46} />
          <Ellipse cx={522} cy={96} rx={20} ry={30} />
          <Path d="M488 84c8-6 16-8 22-6M486 104c6 4 10 10 12 18M538 70c8 6 14 14 16 24M544 118c-4 8-10 12-18 14" strokeWidth={0.9} />
          <Path d="M322 122h88" strokeWidth={1.6} strokeDasharray="1 6" />
        </G>
        {STARS.map(([x, y]) => <Path key={x} d={`M${x} ${y - 5}l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z`} fill={color} />)}
      </Svg>
    </View>
  );
}

/** "Proudly developed with ♥ in Dubai, United Arab Emirates" with the UAE flag (kept in English, like the website) */
export function MadeInDubai({ color, style }: { color?: string; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  const c = color ?? t.muted;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", columnGap: 6 }} accessible accessibilityLabel="Proudly developed with love in Dubai, United Arab Emirates">
      <Text style={[{ fontFamily: FONT.regular, fontSize: 13, color: c }, style]}>Proudly developed with</Text>
      <Svg width={12} height={12} viewBox="0 0 24 24"><Path d="M12 21s-7.5-4.6-9.8-9.3C.6 8.3 2.7 4.5 6.5 4.5c2.1 0 3.6 1.1 4.5 2.6.9-1.5 2.4-2.6 4.5-2.6 3.8 0 5.9 3.8 4.3 7.2C19.5 16.4 12 21 12 21z" fill="#c8102e" /></Svg>
      <Text style={[{ fontFamily: FONT.regular, fontSize: 13, color: c }, style]}>in Dubai, United Arab Emirates</Text>
      <View style={{ flexDirection: "row", width: 16, height: 10, borderRadius: 1, overflow: "hidden", borderWidth: 0.5, borderColor: "rgba(0,0,0,0.1)" }}>
        <View style={{ width: 4, backgroundColor: "#ef3340" }} />
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "#009739" }} />
          <View style={{ flex: 1, backgroundColor: "#ffffff" }} />
          <View style={{ flex: 1, backgroundColor: "#000000" }} />
        </View>
      </View>
    </View>
  );
}

/** a number that counts up once when it appears (final value for screen readers and under reduced motion) */
export function CountUp({ to, decimals = 0, duration = 1400, style }: { to: number; decimals?: number; duration?: number; style?: StyleProp<TextStyle> }) {
  const { lang } = useLang();
  const reduced = useReducedMotionX();
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) { setV(to); return; }
    let raf = 0;
    const t0 = Date.now();
    const tick = () => { const p = Math.min(1, (Date.now() - t0) / duration); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration, reduced]);
  const fmt = (n: number) => n.toLocaleString(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <Text style={style} accessibilityLabel={fmt(to)}>{fmt(v)}</Text>;
}

/** a section that rises in gently when the screen opens (ScrollReveal); delay staggers items; off under reduced motion */
export function Reveal({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotionX();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) { a.setValue(1); return; }
    Animated.timing(a, { toValue: 1, duration: 420, delay, useNativeDriver: true }).start();
  }, [a, delay, reduced]);
  return <Animated.View style={[{ opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }, style]}>{children}</Animated.View>;
}
