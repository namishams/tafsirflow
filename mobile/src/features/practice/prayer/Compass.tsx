import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, View } from "react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";
import * as Location from "expo-location";
import { FONT, useTheme } from "@/lib/theme";
import { starPath } from "../art";

// The live compass: the device heading (true north when the phone knows it, otherwise magnetic north), smoothed so
// the rose turns calmly. The bearing to the Kaaba comes from the website's qiblaOf (adhan's Qibla).
export type Heading = { deg: number; magnetic: boolean; accuracy: number };
export type CompassState = "off" | "starting" | "on" | "denied" | "unavailable";

export function useHeading() {
  const [state, setState] = useState<CompassState>("off");
  const [heading, setHeading] = useState<Heading | null>(null);
  const sub = useRef<Location.LocationSubscription | null>(null);
  const vec = useRef<{ x: number; y: number } | null>(null);

  const stop = useCallback(() => { sub.current?.remove(); sub.current = null; vec.current = null; setHeading(null); setState("off"); }, []);

  const start = useCallback(async (ask = true) => {
    setState("starting");
    try {
      let perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted" && ask && perm.canAskAgain) perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") { setState(ask ? "denied" : "off"); return; }
      sub.current?.remove();
      sub.current = await Location.watchHeadingAsync((h) => {
        const magnetic = !(h.trueHeading >= 0);
        const deg = magnetic ? h.magHeading : h.trueHeading;
        if (!(deg >= 0)) return;
        // low-pass filter on the unit vector, so 359° → 0° does not spin the rose
        const r = (deg * Math.PI) / 180, k = 0.3;
        const v = vec.current ? { x: vec.current.x + (Math.cos(r) - vec.current.x) * k, y: vec.current.y + (Math.sin(r) - vec.current.y) * k } : { x: Math.cos(r), y: Math.sin(r) };
        vec.current = v;
        setHeading({ deg: ((Math.atan2(v.y, v.x) * 180) / Math.PI + 360) % 360, magnetic, accuracy: h.accuracy });
        setState("on");
      }, () => { sub.current?.remove(); sub.current = null; setHeading(null); setState("unavailable"); });
    } catch {
      setState("unavailable");
    }
  }, []);

  useEffect(() => () => { sub.current?.remove(); sub.current = null; }, []);
  return { state, heading, start, stop };
}

/** signed difference to turn from the heading to the qibla (-180…180, positive = turn right) */
export const turnBy = (qibla: number, heading: number) => ((qibla - heading + 540) % 360) - 180;

/** a gilded sixteen-point rose that turns with the device; the needle points to the Kaaba (PrayerBoard Compass) */
export function QiblaDial({ qibla, heading, size = 128 }: { qibla: number; heading: number | null; size?: number }) {
  const t = useTheme();
  const rot = useRef(new Animated.Value(0)).current;
  const cur = useRef(0);
  useEffect(() => {
    const target = heading === null ? 0 : -heading;
    cur.current += ((target - cur.current + 540) % 360) - 180;
    Animated.timing(rot, { toValue: cur.current, duration: heading === null ? 400 : 180, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [heading, rot]);
  const spin = rot.interpolate({ inputRange: [-36000, 36000], outputRange: ["-36000deg", "36000deg"] });
  const aligned = heading !== null && Math.abs(turnBy(qibla, heading)) <= 5;
  const gold = t.gold;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={`Qibla ${Math.round(qibla)}°`}>
      {aligned ? <View pointerEvents="none" style={{ position: "absolute", left: -6, top: -6, right: -6, bottom: -6, borderRadius: size, backgroundColor: "rgba(214,180,108,0.18)" }} /> : null}
      <Animated.View style={{ width: size, height: size, transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox="0 0 120 120" style={{ position: "absolute" }}>
          <Path d={starPath(60, 60, 58, 50, 16)} fill={gold} fillOpacity={0.08} stroke={gold} strokeOpacity={0.55} strokeWidth={0.8} />
          <Circle cx={60} cy={60} r={44} fill={t.surface} stroke={gold} strokeOpacity={0.45} />
          <Circle cx={60} cy={60} r={38} fill="none" stroke={gold} strokeOpacity={0.3} strokeDasharray="1 3" />
          {Array.from({ length: 8 }, (_, i) => { const b = (Math.PI / 4) * i; return <Path key={i} d={`M${(60 + 44 * Math.sin(b)).toFixed(1)} ${(60 - 44 * Math.cos(b)).toFixed(1)}L${(60 + 40 * Math.sin(b)).toFixed(1)} ${(60 - 40 * Math.cos(b)).toFixed(1)}`} stroke={gold} strokeWidth={i % 2 ? 0.8 : 1.4} />; })}
          <SvgText x={60} y={27} textAnchor="middle" fontSize={9} fontWeight="700" fontFamily={FONT.bold} fill={t.muted}>N</SvgText>
        </Svg>
        <Svg width={size} height={size} viewBox="0 0 120 120" style={{ position: "absolute" }}>
          <G rotation={qibla} origin="60, 60">
            <Path d="M60 24L66 60 60 55 54 60Z" fill="#c9a65e" />
            <Path d="M60 96L66 60 60 65 54 60Z" fill={t.muted} fillOpacity={0.35} />
            <G x={52} y={10}><Rect width={16} height={15} rx={1.5} fill="#111" /><Rect y={4} width={16} height={2.2} fill="#d6b46c" /></G>
            <Circle cx={60} cy={60} r={4} fill={t.surface} stroke="#c9a65e" strokeWidth={1.5} />
          </G>
        </Svg>
      </Animated.View>
    </View>
  );
}

/** degrees in the website's large gold numerals */
export function Degrees({ value, size = 36 }: { value: number; size?: number }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.display, fontSize: size, lineHeight: size * 1.15, color: t.gold, fontVariant: ["tabular-nums"] }}>{Math.round(value)}°</Text>;
}
