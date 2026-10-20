import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgLinear, Path, Polyline, Rect, Stop, Text as SvgText } from "react-native-svg";
import { PRAYERS, buildPrayer, type Posture, type Tradition } from "@/web/salah";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, R, goldButton, stage, AR_RIGHT } from "@/lib/theme";
import { Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { DarkChip, PracticeWindow, RoundButton, go, starPath, useReducedMotion } from "./art";
import { POSES, UI, ease, lerpPose, type Lang, type Pose, type Tx } from "./web/prayerTrainer";

const pts = (...p: [number, number][]) => p.map((x) => x.join(",")).join(" ");
// <span dir="ltr"> of the website: "1 / 12" keeps its order inside right-to-left text
const ltr = (s: string) => `\u2066${s}\u2069`;

// the figure moves smoothly from one posture to the next (750 ms), or jumps when the system asks for less motion
function usePoseAnimation(target: Posture, reduce: boolean) {
  const [pose, setPose] = useState<Pose>(POSES[target]);
  const cur = useRef(pose);
  useEffect(() => {
    const from = cur.current, to = POSES[target];
    if (reduce) { cur.current = to; setPose(to); return; }
    const t0 = Date.now(); let raf = 0;
    const tick = () => { const t = Math.min(1, (Date.now() - t0) / 750); const p = lerpPose(from, to, ease(t)); cur.current = p; setPose(p); if (t < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce]);
  return pose;
}

function Figure({ posture, qibla, label }: { posture: Posture; qibla: string; label: string }) {
  const reduce = useReducedMotion();
  const p = usePoseAnimation(posture, reduce);
  const ink = "#ffffff";
  return (
    <Svg width="100%" height="100%" viewBox="0 0 240 230" accessibilityLabel={label}>
      <Defs><SvgLinear id="mat" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="rgb(214,180,108)" stopOpacity={0.35} /><Stop offset="1" stopColor="rgb(214,180,108)" stopOpacity={0.15} /></SvgLinear></Defs>
      <Rect x={40} y={209} width={160} height={7} rx={2} fill="url(#mat)" />
      <Rect x={44} y={211} width={152} height={3} rx={1} fill="none" stroke="rgba(214,180,108,0.5)" strokeWidth={0.6} strokeDasharray="3 2" />
      <G x={212} y={178}><Rect width={18} height={20} rx={1.5} fill="#111" /><Rect y={5} width={18} height={2.4} fill="rgb(214,180,108)" /><SvgText x={9} y={32} textAnchor="middle" fontSize={8} fontFamily={FONT.regular} fill={ink} fillOpacity={0.6}>{qibla}</SvgText></G>
      <Path d="M196 188 l9 0 m-3 -3 l3 3 l-3 3" stroke="rgba(214,180,108,0.7)" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {posture === "sujudTurbah" ? <Rect x={166} y={205} width={16} height={4} rx={1} fill="#8a6b45" /> : null}
      <G fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={ink}>
        <Polyline points={pts(p.hip, p.knee, p.ankle, p.toe)} strokeWidth={15} strokeOpacity={0.92} />
        <Polyline points={pts(p.neck, p.hip)} strokeWidth={19} />
        <Polyline points={pts(p.shoulder, p.elbow, p.hand)} strokeWidth={10} stroke="rgb(214,180,108)" />
      </G>
      <Circle cx={p.head[0]} cy={p.head[1]} r={13} fill={ink} />
      {posture === "tashahhud" ? <Line x1={p.hand[0]} y1={p.hand[1]} x2={p.hand[0] + 10} y2={p.hand[1] - 5} stroke="rgb(214,180,108)" strokeWidth={3} strokeLinecap="round" /> : null}
      {posture === "salamR" || posture === "salamL" ? (
        <Path d={posture === "salamR" ? `M${p.head[0] - 10} ${p.head[1] - 22} q12 -10 24 0 m-4 -5 l4 5 l-6 2` : `M${p.head[0] + 12} ${p.head[1] - 22} q-12 -10 -24 0 m4 -5 l-4 5 l6 2`} stroke="rgb(214,180,108)" strokeWidth={2} fill="none" strokeLinecap="round" />
      ) : null}
    </Svg>
  );
}

// Prayer trainer (website PrayerTrainer.tsx): the five daily prayers step by step, Sunni and Ja'fari, with the figure,
// the Arabic words, transliteration and meaning (Arabic readers get the Arabic words only); play the sequence or go step by step
export default function PrayerTrainer() {
  const { lang, rtl } = useLang();
  const l: Lang = lang === "de" ? "de" : lang === "ar" ? "ar" : "en";
  const u = UI[l];
  const tx = (v?: Tx) => (v ? v[l] ?? v.en : "");
  const [tradition, setTradition] = useState<Tradition>("sunni");
  const [prayer, setPrayer] = useState<(typeof PRAYERS)[number]["id"]>("fajr");
  const steps = useMemo(() => buildPrayer(prayer, tradition), [prayer, tradition]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [list, setList] = useState(false);
  useEffect(() => { setI(0); setAuto(false); }, [prayer, tradition]);
  const step = steps[Math.min(i, steps.length - 1)];
  const rakat = PRAYERS.find((p) => p.id === prayer)!.rakat;
  useEffect(() => {
    if (!auto) return;
    if (i >= steps.length - 1) { setAuto(false); return; }
    const ms = Math.min(14000, 3500 + (step.translit?.length ?? 0) * 45);
    const id = setTimeout(() => setI((n) => n + 1), ms);
    return () => clearTimeout(id);
  }, [auto, i, steps.length, step]);
  const last = i >= steps.length - 1;
  const hair = "rgba(214,180,108,0.2)";

  return (
    <Stage rounded={16} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.3)" }}>
      <View style={{ padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: hair }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }} accessibilityRole="tablist">
          {(["sunni", "shia"] as const).map((t) => <DarkChip key={t} accessibilityRole="tab" label={u[t]} on={tradition === t} onPress={() => setTradition(t)} />)}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {PRAYERS.map((p) => <DarkChip key={p.id} label={`${tx(p.name)} · ${p.rakat}`} on={prayer === p.id} onPress={() => setPrayer(p.id)} />)}
        </View>
      </View>

      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: hair }}>
        <View style={{ position: "absolute", left: 16, top: 16, zIndex: 1, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(214,180,108,0.45)", backgroundColor: "rgba(5,28,21,0.6)", paddingHorizontal: 12, paddingVertical: 4 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: "#f3e2b6" }}>{u.rakah} {Math.min(step.rakah, rakat)} {u.of} {rakat}</Text>
        </View>
        <View style={{ width: "100%", maxWidth: 360, aspectRatio: 1, alignSelf: "center", alignItems: "center" }}>
          <PracticeWindow uid="salah-w" lamp height="100%" style={{ position: "absolute", top: 0, opacity: 0.45 }} />
          <Figure posture={step.posture} qibla={u.qibla} label={tx(step.title)} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: rakat }, (_, k) => (
            <Svg key={k} width={20} height={20} viewBox="0 0 24 24"><Path d={starPath(12, 12, 11, 5.2)} fill={k + 1 < step.rakah ? "#d6b46c" : k + 1 === step.rakah ? "#fff" : "rgba(255,255,255,0.14)"} stroke={k + 1 === step.rakah ? "#d6b46c" : "none"} strokeWidth={1} /></Svg>
          ))}
        </View>
      </View>

      <View style={{ padding: 20, minHeight: 420 }}>
        <View key={`${prayer}-${tradition}-${i}`}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Svg width={10} height={10} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill={stage.gold} /></Svg>
            <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: rtl ? 0 : 1.9, textTransform: "uppercase", color: stage.gold }}>{ltr(`${i + 1} / ${steps.length}`)}{step.aloud !== undefined && step.ar ? ` · ${step.aloud ? u.aloud : u.silent}` : ""}</Text>
          </View>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: "#eef0f3", marginTop: 8 }}>{tx(step.title)}</Text>
          {step.ar ? (
            <View style={{ marginTop: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(214,180,108,0.25)", paddingVertical: 12 }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 52, color: "#fbf3dc", writingDirection: "rtl", textAlign: AR_RIGHT }}>{step.ar}</Text>
            </View>
          ) : null}
          {step.translit && l !== "ar" ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: stage.gold, marginTop: 12 }}>{step.translit}</Text> : null}
          {step.meaning && l !== "ar" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.8)", marginTop: 12 }}><Text style={{ fontFamily: FONT.semibold, color: "#ffffff" }}>{u.meaning}: </Text>{tx(step.meaning)}</Text> : null}
          {step.note ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.75)", marginTop: 16, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.25)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12, overflow: "hidden" }}>{tx(step.note)}</Text> : null}
        </View>
        <View style={{ flex: 1, minHeight: 24 }} />
        <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: steps.length, now: i + 1 }}>
          <LinearGradient colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: `${((i + 1) / steps.length) * 100}%`, borderRadius: 3 }} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 }}>
          <RoundButton dir="prev" label={u.prev} disabled={i === 0} onPress={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }} />
          <Pressable onPress={() => (last ? (setI(0), setAuto(true)) : setAuto((a) => !a))} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
            <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 48, borderRadius: R.pill, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{last ? u.restart : auto ? u.pause : u.play}</Text>
            </LinearGradient>
          </Pressable>
          <RoundButton dir="next" label={u.next} disabled={last} onPress={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }} />
        </View>
      </View>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: hair }}>
        <Pressable onPress={() => setList((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: list }} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <View style={{ transform: [{ rotate: list ? "90deg" : rtl ? "180deg" : "0deg" }] }}><Icon name="chevronRight" color="rgba(255,255,255,0.8)" size={13} /></View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{u.steps}</Text>
        </Pressable>
        {list ? (
          <View style={{ gap: 4, marginTop: 12 }}>
            {steps.map((s, k) => (
              <Pressable key={k} onPress={() => { setAuto(false); setI(k); }} accessibilityRole="button" accessibilityState={{ selected: k === i }}
                style={{ minHeight: 40, borderRadius: R.md, paddingHorizontal: 8, paddingVertical: 6, justifyContent: "center", backgroundColor: k === i ? "rgba(214,180,108,0.15)" : "transparent" }}>
                <Text style={{ fontFamily: k === i ? FONT.bold : FONT.regular, fontSize: 14, color: k === i ? "#ffffff" : "rgba(255,255,255,0.7)" }}>{k + 1}. {tx(s.title)} <Text style={{ color: "rgba(255,255,255,0.4)" }}>· {u.rakah} {Math.min(s.rakah, rakat)}</Text></Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.55)", marginTop: 16 }}>
          {u.note} <Text onPress={() => go("/surah/1?shams=1")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: stage.gold }}>{u.learnFatiha} {rtl ? "←" : "→"}</Text>
        </Text>
      </View>
    </Stage>
  );
}
