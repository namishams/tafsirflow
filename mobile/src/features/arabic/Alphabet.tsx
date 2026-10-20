import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, LinearGradient as SvgLinear, Path, RadialGradient, Stop } from "react-native-svg";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { courseLang, type CourseLang } from "./lang";
import { useLang } from "@/i18n";
import { LETTERS, arName, forms, type Letter } from "@/web/arabic";
import { GoldRing, useReduceMotion, useTurn } from "../coursekit/motion";
import { goldA, starPath } from "../coursekit/art";
import { useArabicVoice } from "../coursekit/voice";
import { ALPHA_T } from "./texts";

// PracticeAlphabet.tsx: the 28 letters and the hamza on a ring of light, written from the top towards the left – the
// way Arabic runs. The centre shows the chosen letter, its name, its sound and its three joined forms; until the
// learner taps, the ring walks through the alphabet by itself. And the reference sheet with every letter.

// the device voice says the letter's Arabic name without the article, like the website (alif-lam = U+0627 U+0644)
const letterName = (ch: string) => arName(ch).replace(/^\u0627\u0644/, "");

export function AlphabetRing() {
  const lang = courseLang(useLang().lang);
  const T = ALPHA_T[lang];
  const { width } = useWindowDimensions();
  const size = Math.min(width - 40, 460);
  const reduce = useReduceMotion();
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(true);
  const { canSpeak, speak } = useArabicVoice();
  useEffect(() => {
    if (!auto || reduce) return;
    const id = setInterval(() => setI((n) => (n + 1) % LETTERS.length), 2600);
    return () => clearInterval(id);
  }, [auto, reduce]);
  const spin = useTurn(true, 140000);
  const swap = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (reduce) return;
    swap.setValue(0);
    Animated.timing(swap, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [i, reduce, swap]);
  const l = LETTERS[i];
  const f = forms(l);
  const N = LETTERS.length;
  const choose = (k: number) => { setAuto(false); setI(k); speak(letterName(LETTERS[k].ch)); };
  const btn = size * 0.094;
  return (
    <View style={{ width: size, height: size + 28, alignSelf: "center" }}>
      <Svg width={size} height={size} viewBox="0 0 400 400" style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs>
          <SvgLinear id="abc-m" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#f6e7bf" /><Stop offset="0.45" stopColor="#c9a65e" /><Stop offset="0.72" stopColor="#efe2bf" /><Stop offset="1" stopColor="#8f7238" /></SvgLinear>
          <RadialGradient id="abc-e" cx="40%" cy="32%" r="80%"><Stop offset="0" stopColor="#135a43" /><Stop offset="1" stopColor="#04241a" /></RadialGradient>
          <RadialGradient id="abc-l" cx="50%" cy="40%" r="55%"><Stop offset="0" stopColor="#fff1cc" stopOpacity={0.22} /><Stop offset="1" stopColor="#fff1cc" stopOpacity={0} /></RadialGradient>
        </Defs>
        <Circle cx={200} cy={200} r={197} fill="none" stroke="url(#abc-m)" strokeOpacity={0.55} />
        <Circle cx={200} cy={200} r={181} fill="none" stroke="#d6b46c" strokeOpacity={0.35} strokeWidth={0.8} />
        <Circle cx={200} cy={200} r={125} fill="none" stroke="#d6b46c" strokeOpacity={0.45} strokeDasharray="1.5 5" />
        <Circle cx={200} cy={200} r={117} fill="url(#abc-e)" stroke="url(#abc-m)" strokeWidth={1.5} />
        <Circle cx={200} cy={200} r={117} fill="url(#abc-l)" />
        <Path d={starPath(200, 200, 110, 92, 8)} fill="none" stroke="#d6b46c" strokeOpacity={0.16} />
        <Path d={starPath(200, 200, 110, 92, 8, -Math.PI / 2 + Math.PI / 8)} fill="none" stroke="#d6b46c" strokeOpacity={0.12} />
      </Svg>
      {/* the slowly turning ring of small stars */}
      <Animated.View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: size, height: size, transform: [{ rotate: spin }] }}>
        <Svg width={size} height={size} viewBox="0 0 400 400">
          {Array.from({ length: 48 }, (_, k) => { const a = (Math.PI * 2 * k) / 48; return <Path key={k} d={starPath(200 + 189 * Math.cos(a), 200 + 189 * Math.sin(a), 3.2, 1.4)} fill="#d6b46c" fillOpacity={k % 2 ? 0.35 : 0.75} />; })}
        </Svg>
      </Animated.View>
      {LETTERS.map((x, k) => {
        // start at the top and run counter-clockwise (right to left across the top), like Arabic script
        const a = -Math.PI / 2 - (Math.PI * 2 * k) / N;
        const on = k === i;
        const cx = size * (0.5 + 0.386 * Math.cos(a)), cy = size * (0.5 + 0.386 * Math.sin(a));
        return (
          <Pressable key={x.ch} onPress={() => choose(k)} accessibilityRole="button" accessibilityLabel={x.name} accessibilityState={{ selected: on }} hitSlop={4}
            style={{ position: "absolute", left: cx - btn / 2, top: cy - btn / 2, width: btn, height: btn, borderRadius: btn / 2, overflow: "hidden", alignItems: "center", justifyContent: "center" }}>
            {on ? <LinearGradient colors={["#ecd7a2", "#c6a65e"]} style={StyleSheet.absoluteFill} /> : null}
            <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: Math.max(17, Math.min(27, size * 0.062)), lineHeight: Math.max(17, Math.min(27, size * 0.062)) * 1.5, marginTop: -3, color: on ? "rgb(8,38,29)" : "#f3e2b6" }}>{x.ch}</Text>
          </Pressable>
        );
      })}
      <Animated.View pointerEvents="none" style={{ position: "absolute", left: size * 0.22, top: size * 0.22, width: size * 0.56, height: size * 0.56, alignItems: "center", justifyContent: "center",
        opacity: swap.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }), transform: [{ scale: swap.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: Math.min(104, size * 0.23), lineHeight: Math.min(104, size * 0.23) * 1.45, color: "#f6e7bf", textShadowColor: "rgba(233,207,153,0.35)", textShadowRadius: 24 }}>{l.ch}</Text>
        <Text allowFontScaling={false} style={{ fontFamily: FONT.bold, fontSize: Math.min(16, Math.max(13, size * 0.04)), color: "#ffffff", marginTop: -4 }}>{`${l.name} · ${l.tr}`}</Text>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: Math.min(21, Math.max(15, size * 0.05)), lineHeight: Math.min(21, Math.max(15, size * 0.05)) * 1.7, color: "#d6b46c", marginTop: 2 }}>{`${f.start}  ${f.middle}  ${f.end}`}</Text>
      </Animated.View>
      <Text style={{ position: "absolute", left: 0, right: 0, bottom: 0, textAlign: "center", fontFamily: FONT.regular, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{canSpeak ? `${T.tap} · ${T.hear}` : T.tap}</Text>
    </View>
  );
}

/** every letter with its name, sound and its forms at the start, in the middle and at the end of a word */
export function LetterSheet() {
  const lang = courseLang(useLang().lang);
  const T = ALPHA_T[lang];
  const rows: Letter[][] = [];
  LETTERS.forEach((l, k) => { if (k % 2 === 0) rows.push([]); rows[rows.length - 1].push(l); });
  return (
    <View style={{ gap: 12 }}>
      {rows.map((r, ri) => (
        <View key={ri} style={{ flexDirection: "row", gap: 12 }}>
          {r.map((l) => <LetterCard key={l.ch} l={l} k={LETTERS.indexOf(l)} T={T} lang={lang} />)}
          {r.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

function LetterCard({ l, k, T, lang }: { l: Letter; k: number; T: (typeof ALPHA_T)["en"]; lang: CourseLang }) {
  const t = useTheme();
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { speak } = useArabicVoice();
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const f = forms(l);
  const tap = () => { speak(letterName(l.ch)); setOn(true); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setOn(false), 1600); };
  return (
    <Pressable onPress={tap} accessibilityRole="button" accessibilityLabel={`${l.name}, ${l.tr}`}
      style={{ flex: 1, borderRadius: R.card, borderWidth: 1, borderColor: on ? "rgb(201,166,94)" : goldA(t, 0.26), backgroundColor: t.surface, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 16, alignItems: "center" }}>
      <LinearGradient pointerEvents="none" colors={[goldA(t, 0.06), "transparent"]} style={[StyleSheet.absoluteFill, { borderRadius: R.card, height: 120 }]} />
      <View pointerEvents="none" style={{ position: "absolute", top: 4, left: 4, right: 4, bottom: 4, borderRadius: 9, borderWidth: 1, borderColor: goldA(t, 0.14) }} />
      <GoldRing on={on} radius={R.card} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignSelf: "stretch" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: t.muted, fontVariant: ["tabular-nums"] }}>{k + 1}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: t.muted }}>/{l.tr}/</Text>
      </View>
      <View style={{ height: 84, justifyContent: "center" }}>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 50, lineHeight: 84, color: t.gold }}>{l.ch}</Text>
      </View>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{l.name}</Text>
      <View style={{ marginTop: 6, borderRadius: R.pill, borderWidth: 1, borderColor: goldA(t, 0.25), backgroundColor: goldA(t, 0.06), paddingHorizontal: 12 }}>
        <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 37, color: t.ink }}>{`${f.start}  ${f.middle}  ${f.end}`}</Text>
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 10.5, color: t.muted, marginTop: 4, textAlign: "center" }}>{l.connects ? T.joins : T.alone}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: t.ink, opacity: 0.75, marginTop: 8, textAlign: "center" }}>{l.sound[lang] ?? l.sound.en}</Text>
    </Pressable>
  );
}
