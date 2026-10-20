import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { ARABIC_FONT, FONT } from "@/lib/theme";
import { ALLAH, COUNTS } from "@/web/secrets/counts";
import { RefChip, starPath } from "./art";
import { STAGE_GOLD, stageGold } from "./palette";
import { useReducedMotion } from "./motion";
import { openRef } from "./links";

/** a number that counts up (CountUp.tsx); keeps the final value for screen readers and without motion */
export function CountUp({ to, decimals = 0, lang, style }: { to: number; decimals?: number; lang: string; style?: object }) {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) { setV(to); return; }
    let raf = 0;
    const t0 = Date.now();
    const tick = () => { const p = Math.min(1, (Date.now() - t0) / 1400); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    setV(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduce]);
  const fmt = (n: number) => { try { return n.toLocaleString(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); } catch { return n.toFixed(decimals); } };
  return <Text style={style} accessibilityLabel={fmt(to)}>{fmt(v)}</Text>;
}

/** "How often does it appear?" – tap a word, see the verified count in a turning rosette and every place as a gold chip */
export function WordCounter({ words, times, spots, note, lang, initial = "fearNot" }: { words: { key: string; ar: string; label: string }[]; times: string; spots: string; note: string; lang: string; initial?: string }) {
  const [sel, setSel] = useState(initial);
  const reduce = useReducedMotion();
  const turn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) return;
    const a = Animated.loop(Animated.timing(turn, { toValue: 1, duration: 90000, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [reduce, turn]);
  const w = words.find((x) => x.key === sel) ?? words[0];
  const refs = sel === "allah" ? [] : COUNTS[sel] ?? [];
  const n = sel === "allah" ? ALLAH : refs.length;
  // one chip per verse, with how often the word occurs in it
  const per = refs.reduce<Record<string, number>>((m, r) => ((m[r] = (m[r] ?? 0) + 1), m), {});
  const rays = Array.from({ length: 32 }, (_, i) => { const a = (Math.PI * 2 * i) / 32, r1 = 84, r2 = i % 2 ? 92 : 98; return `M${(100 + r1 * Math.cos(a)).toFixed(1)} ${(100 + r1 * Math.sin(a)).toFixed(1)}L${(100 + r2 * Math.cos(a)).toFixed(1)} ${(100 + r2 * Math.sin(a)).toFixed(1)}`; }).join("");
  const c = "rgb(233,207,153)";
  return (
    <View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {words.map((x) => {
          const on = sel === x.key;
          return (
            <Pressable key={x.key} onPress={() => setSel(x.key)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={x.label}
              style={{ flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6,
                borderColor: on ? c : "rgba(255,255,255,0.15)", backgroundColor: on ? stageGold(0.15) : "transparent" }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 16, lineHeight: 24, color: on ? "#ffffff" : "rgba(255,255,255,0.75)", writingDirection: "rtl" }}>{x.ar}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? "#ffffff" : "rgba(255,255,255,0.75)" }}>{x.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ marginTop: 32, gap: 32 }}>
        <View style={{ alignSelf: "center", width: 220, height: 220, alignItems: "center", justifyContent: "center" }}>
          <Svg width={220} height={220} viewBox="0 0 200 200" style={{ position: "absolute" }}>
            <Defs><RadialGradient id="wcglow"><Stop offset="0" stopColor={c} stopOpacity={0.18} /><Stop offset="1" stopColor={c} stopOpacity={0} /></RadialGradient></Defs>
            <Circle cx={100} cy={100} r={100} fill="url(#wcglow)" />
          </Svg>
          <Animated.View style={{ position: "absolute", width: 220, height: 220, transform: [{ rotate: turn.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }] }}>
            <Svg width={220} height={220} viewBox="0 0 200 200">
              <Path d={rays} stroke={c} strokeOpacity={0.55} strokeWidth={1} />
              <Path d={starPath(100, 100, 82, 70, 16)} fill="none" stroke={c} strokeOpacity={0.5} />
            </Svg>
          </Animated.View>
          <Svg width={220} height={220} viewBox="0 0 200 200" style={{ position: "absolute" }}>
            <Circle cx={100} cy={100} r={64} fill="rgb(5,28,21)" fillOpacity={0.7} stroke={c} strokeOpacity={0.7} />
            <Circle cx={100} cy={100} r={58} fill="none" stroke={c} strokeOpacity={0.3} strokeDasharray="1.5 4" />
          </Svg>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 32, color: STAGE_GOLD, writingDirection: "rtl" }}>{w.ar}</Text>
            <CountUp key={sel} to={n} lang={lang} style={{ fontFamily: FONT.display, fontSize: 44, lineHeight: 48, color: "#ffffff", marginTop: 2 }} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{times}</Text>
          </View>
        </View>
        {refs.length > 0 ? (
          <View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{w.label}</Text>
            <Text style={{ marginTop: 4, fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.7, textTransform: "uppercase", color: stageGold(0.8) }}>{Object.keys(per).length} {spots}</Text>
            <ScrollView style={{ marginTop: 12, maxHeight: 224 }} nestedScrollEnabled contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(per).map(([r, k]) => <RefChip key={r} label={`${r}${k > 1 ? ` ×${k}` : ""}`} onStage onPress={() => openRef(r)} />)}
            </ScrollView>
          </View>
        ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: "rgba(255,255,255,0.65)" }}>{note}</Text>}
      </View>
    </View>
  );
}
