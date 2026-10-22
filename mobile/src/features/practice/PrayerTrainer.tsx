import { useEffect, useMemo, useState } from "react";
import Animated, { Easing, useAnimatedProps, useDerivedValue, useSharedValue, withTiming } from "react-native-reanimated";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { G, Path, Rect } from "react-native-svg";
import { ESSENCE, PRAYERS, buildPrayer, langOf, type Posture, type Tradition } from "@/web/salah";
import { useLang } from "@/i18n";
import { ARABIC_FONT, FONT, goldButton, stage, AR_RIGHT } from "@/lib/theme";
import { Stage } from "@/components/brand";
import { go, starPath, useReducedMotion } from "./art";
import { Aura, Courtyard, Glyph, Layer, MatArt, Motes, PropsArt, SceneBox, TsDefs } from "./trainerScene";
import { Glass, GlassRound, Lens, Segmented } from "./glass";
import { FIG, POSTURE_SETS, TA, figureParts, mixPose, poseIn, trainerDefaults, trainerUi, type FigureKind, type FigureParts, type PostureSet, type TPose } from "./web/trainerArt";
import { IDENTITY_KEY } from "@/lib/identity";
import { useStored } from "@/lib/store";
import { POSES, UI, type Lang, type Tx } from "./web/prayerTrainer";
import { trainerTradition } from "@/lib/tradition";

// <span dir="ltr"> of the website: "1 / 12" and the Latin transliteration keep their order inside right-to-left text
const ltr = (s: string) => `\u2066${s}\u2069`;

const APath = Animated.createAnimatedComponent(Path);

// The figure in the painted courtyard (website PrayerTrainer Figure): its paths are worked out on the UI thread from the
// pose between the last and the next posture (750 ms, ease in and out), or it jumps when the system asks for less motion.
function Figure({ posture, qibla, label, kind, set }: { posture: Posture; qibla: string; label: string; kind: FigureKind; set: PostureSet }) {
  const reduce = useReducedMotion();
  const target = poseIn(set, posture, POSES);
  const from = useSharedValue<TPose>(target), to = useSharedValue<TPose>(target), k = useSharedValue(1), kv = useSharedValue<FigureKind>(kind);
  useEffect(() => {
    const cur = mixPose(from.value, to.value, Easing.inOut(Easing.quad)(k.value));
    from.value = cur; to.value = target; k.value = 0;
    k.value = reduce ? 1 : withTiming(1, { duration: 750, easing: Easing.linear });
  }, [target, reduce, from, to, k]);
  useEffect(() => { kv.value = kind; }, [kind, kv]);
  const parts = useDerivedValue(() => {
    const t = k.value < 0.5 ? 2 * k.value * k.value : 1 - Math.pow(-2 * k.value + 2, 2) / 2;
    return figureParts(mixPose(from.value, to.value, t), kv.value);
  });
  const ap = (key: keyof FigureParts) => useAnimatedProps(() => ({ d: parts.value[key] }));
  /* eslint-disable react-hooks/rules-of-hooks */
  const shadow = ap("shadow"), far = ap("far"), feet = ap("feet"), robe = ap("robe"), folds = ap("folds"), shoulder = ap("shoulder"), robeHi = ap("robeHi"), sash = ap("sash"), neck = ap("neck"), head = ap("head"), headHi = ap("headHi"), cap = ap("cap"), band = ap("band"), hood = ap("hood"), face = ap("face"), trim = ap("trim"), arm = ap("arm"), cuff = ap("cuff"), hand = ap("hand");
  /* eslint-enable react-hooks/rules-of-hooks */
  const fingerOp = useAnimatedProps(() => ({ fillOpacity: k.value > 0.85 ? (k.value - 0.85) / 0.15 : 0 }));
  const P = target;
  const u = "sl";
  const salam = set !== "lying" && (posture === "salamR" || posture === "salamL");
  return (
    <SceneBox label={label}>
      <Courtyard u={u} G={209} H={254} still={reduce} qibla={qibla} />
      <Aura u={u} cx={118} cy={160} r={78} still={reduce} />
      <Layer>
        <TsDefs u={u} />
        <G origin={`${FIG.cx}, ${FIG.ground}`} scale={FIG.s}>
          {set !== "lying" ? <MatArt u={u} /> : null}
          <PropsArt u={u} set={set} />
          <APath animatedProps={shadow} fill="#000" opacity={0.22} />
          {set === "standing" && posture === "sujudTurbah" ? <G><Rect x={165} y={204.6} width={16} height={4.4} rx={1.2} fill="#8a6b45" /><Rect x={166.5} y={204.9} width={13} height={1.2} rx={0.6} fill="#b89268" /></G> : null}
          <APath animatedProps={far} fill={TA.far} />
          <APath animatedProps={feet} fill={`url(#${u}skin)`} />
          <APath animatedProps={robe} fill={`url(#${u}robe)`} />
          <APath animatedProps={folds} fill="none" stroke={TA.robeLo} strokeOpacity={0.55} strokeWidth={1.2} strokeLinecap="round" />
          <APath animatedProps={shoulder} fill="none" stroke={TA.robeLo} strokeOpacity={0.7} strokeWidth={1.2} strokeLinecap="round" />
          <APath animatedProps={robeHi} fill={TA.glint} opacity={0.35} />
          <APath animatedProps={sash} fill="none" stroke={TA.gold} strokeWidth={1.6} strokeLinecap="round" />
          <APath animatedProps={neck} fill={`url(#${u}skin)`} />
          <APath animatedProps={head} fill={`url(#${u}skin)`} />
          <APath animatedProps={headHi} fill={TA.glint} opacity={0.28} />
          <APath animatedProps={cap} fill={`url(#${u}cap)`} />
          <APath animatedProps={band} fill="none" stroke={TA.goldHi} strokeWidth={1.6} strokeLinecap="round" />
          <APath animatedProps={hood} fill={`url(#${u}robe)`} />
          <APath animatedProps={face} fill={`url(#${u}skin)`} />
          <APath animatedProps={trim} fill="none" stroke={TA.gold} strokeWidth={1.5} strokeLinecap="round" />
          <APath animatedProps={arm} fill="none" stroke={TA.robeLo} strokeOpacity={0.8} strokeWidth={1.4} />
          <APath animatedProps={arm} fill={`url(#${u}robe)`} />
          <APath animatedProps={cuff} stroke={TA.gold} strokeWidth={1.4} strokeLinecap="round" />
          <APath animatedProps={hand} fill={`url(#${u}skin)`} />
          {set !== "lying" && posture === "tashahhud" ? <APath animatedProps={fingerOp} d={figureParts(P, kind).finger} fill={`url(#${u}skin)`} /> : null}
          {salam ? (
            <Path d={posture === "salamR" ? `M${P.head[0] - 10} ${P.head[1] - 26} q12 -10 24 0 m-4 -5 l4 5 l-6 2` : `M${P.head[0] + 12} ${P.head[1] - 26} q-12 -10 -24 0 m4 -5 l-4 5 l6 2`} stroke={TA.goldHi} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
        </G>
      </Layer>
      <Motes still={reduce} />
    </SceneBox>
  );
}

// Prayer trainer (website PrayerTrainer.tsx): the five daily prayers step by step, Sunni and Ja'fari, with the figure,
// the Arabic words, transliteration and meaning (Arabic readers get the Arabic words only); play the sequence or go step by step.
// Every site language the prayer data has, otherwise English (website: langOf(locale)).
export default function PrayerTrainer() {
  const { lang, rtl } = useLang();
  const l: Lang = langOf(lang);
  const u = UI[l];
  const tx = (v?: Tx) => (v ? v[l] ?? v.en : "");
  const [tradition, setTradition] = useState<Tradition>(() => trainerTradition());
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
  const flip = rtl ? { transform: [{ scaleX: -1 }] } : null;
  const tu = trainerUi(l);
  // the figure and the way of praying follow the learner's identity (a sister sees the woman, prayerPosture the set);
  // anyone can switch both to look at the other variants
  const rawIdentity = useStored<unknown>(IDENTITY_KEY, null);
  const [kind, setKind] = useState<FigureKind>(() => trainerDefaults(rawIdentity).kind);
  const [set, setSet] = useState<PostureSet>(() => trainerDefaults(rawIdentity).set);
  useEffect(() => { const d = trainerDefaults(rawIdentity); setKind(d.kind); setSet(d.set); }, [rawIdentity]);

  return (
    <Stage rounded={28} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.25)" }}>
      {/* the picture, with the glass controls floating over its sky and its terrace */}
      <View>
        <Figure posture={step.posture} qibla={u.qibla} label={tx(step.title)} kind={kind} set={set} />
        <View style={{ position: "absolute", left: 12, right: 12, top: 12, flexDirection: "row", flexWrap: "nowrap", alignItems: "center", justifyContent: "space-between", gap: 8, rowGap: 8 }}>
          <Segmented options={(["sunni", "shia"] as const).map((t) => ({ id: t, label: u[t].replace(/\s*\(.*\)/, "") }))} value={tradition} onChange={setTradition} />
          <Glass dark radius={18} style={{ marginStart: "auto", paddingHorizontal: 10, paddingVertical: 7, alignItems: "center", gap: 4 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 11, color: "#f3e2b6" }}>{u.rakah} {Math.min(step.rakah, rakat)} {u.of} {rakat}</Text>
            <View style={{ flexDirection: "row", gap: 4 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {Array.from({ length: rakat }, (_, k) => (
                <Svg key={k} width={13} height={13} viewBox="0 0 24 24"><Path d={starPath(12, 12, 11, 5.2)} fill={k + 1 < step.rakah ? "#d6b46c" : k + 1 === step.rakah ? "#fff" : "rgba(255,255,255,0.2)"} stroke={k + 1 === step.rakah ? "#d6b46c" : "none"} strokeWidth={1} /></Svg>
              ))}
            </View>
          </Glass>
        </View>
        <View style={{ position: "absolute", left: 12, right: 12, bottom: 12 }}>
          <Glass dark radius={999} style={{ padding: 4 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 2, flexGrow: 1, justifyContent: "space-between" }}>
              {PRAYERS.map((p) => {
                const on = prayer === p.id;
                const label = <Text numberOfLines={1} style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? goldButton.text : "rgba(255,255,255,0.88)" }}>{tx(p.name)} <Text style={{ opacity: 0.6 }}>{p.rakat}</Text></Text>;
                return (
                  <Pressable key={p.id} onPress={() => setPrayer(p.id)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${tx(p.name)} · ${p.rakat}`}>
                    {on ? <Lens style={{ height: 34, paddingHorizontal: 13 }}>{label}</Lens> : <View style={{ height: 34, paddingHorizontal: 11, justifyContent: "center" }}>{label}</View>}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Glass>
        </View>
      </View>

      {/* the controls, part of the card right under the picture (they never cover any text), then the way of praying
          and the figure */}
      <View style={{ paddingHorizontal: 12, paddingTop: 12, gap: 10 }}>
          <Glass dark radius={30} style={{ padding: 8 }}>
            <View style={{ height: 4, borderRadius: 2, marginHorizontal: 12, marginTop: 2, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: steps.length, now: i + 1 }}>
              <LinearGradient colors={["#c6a65e", "#f2dfaa"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 4, width: `${((i + 1) / steps.length) * 100}%`, borderRadius: 2, alignSelf: "flex-start" }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <GlassRound label={u.prev} disabled={i === 0} onPress={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }}><View style={flip}><Glyph name="prev" /></View></GlassRound>
              <Pressable onPress={() => (last ? (setI(0), setAuto(true)) : setAuto((a) => !a))} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
                <Lens style={{ height: 48, flexDirection: "row", gap: 8 }}>
                  <Glyph name={last ? "restart" : auto ? "pause" : "play"} size={16} color={goldButton.text} />
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{last ? u.restart : auto ? u.pause : u.play}</Text>
                </Lens>
              </Pressable>
              <GlassRound label={u.next} disabled={last} onPress={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }}><View style={flip}><Glyph name="next" /></View></GlassRound>
            </View>
          </Glass>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <Segmented options={POSTURE_SETS.map((k) => ({ id: k, label: tu[k] }))} value={set} onChange={setSet} />
        </ScrollView>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{tu.figure}</Text>
          <Segmented options={[{ id: "m" as FigureKind, label: tu.man }, { id: "f" as FigureKind, label: tu.woman }]} value={kind} onChange={setKind} />
        </View>
      </View>

      {/* the words of the step */}
      <View style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 20 }}>
        {set === "lying" ? (
          <Glass radius={18} style={{ marginBottom: 18, padding: 14 }}>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: "#f3e2b6" }}>{tu.lyingNote}</Text>
          </Glass>
        ) : null}
        <View key={`${prayer}-${tradition}-${i}`}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Svg width={10} height={10} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill={stage.gold} /></Svg>
            <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: rtl ? 0 : 1.9, textTransform: "uppercase", color: stage.gold }}>{ltr(`${i + 1} / ${steps.length}`)}{step.aloud !== undefined && step.ar ? ` · ${step.aloud ? u.aloud : u.silent}` : ""}</Text>
          </View>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: "#eef0f3", marginTop: 8 }}>{tx(step.title)}</Text>
          {step.ar ? (
            <Glass radius={22} style={{ marginTop: 18, paddingHorizontal: 16, paddingVertical: 10 }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 52, color: "#fbf3dc", writingDirection: "rtl", textAlign: AR_RIGHT }}>{step.ar}</Text>
            </Glass>
          ) : null}
          {step.translit && l !== "ar" ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: stage.gold, marginTop: 12 }}>{rtl ? ltr(step.translit) : step.translit}</Text> : null}
          {step.meaning && l !== "ar" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.8)", marginTop: 12 }}><Text style={{ fontFamily: FONT.semibold, color: "#ffffff" }}>{step.essence ? tx(ESSENCE) : u.meaning}: </Text>{tx(step.meaning)}</Text> : null}
          {step.note ? (
            <Glass radius={18} style={{ marginTop: 16, padding: 14 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.8)" }}>{tx(step.note)}</Text>
            </Glass>
          ) : null}
        </View>
      </View>

      <View style={{ padding: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(255,255,255,0.14)" }}>
        <Pressable onPress={() => setList((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: list }} style={{ alignSelf: "flex-start" }}>
          <Glass radius={999} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16 }}>
            <View style={{ transform: [{ rotate: list ? "90deg" : rtl ? "180deg" : "0deg" }] }}><Glyph name="chevron" size={14} color="rgba(255,255,255,0.85)" /></View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{u.steps}</Text>
          </Glass>
        </Pressable>
        {list ? (
          <Glass radius={22} style={{ gap: 2, marginTop: 12, padding: 6 }}>
            {steps.map((s, k) => (
              <Pressable key={k} onPress={() => { setAuto(false); setI(k); }} accessibilityRole="button" accessibilityState={{ selected: k === i }}
                style={{ minHeight: 40, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, justifyContent: "center", backgroundColor: k === i ? "rgba(214,180,108,0.2)" : "transparent" }}>
                <Text style={{ fontFamily: k === i ? FONT.bold : FONT.regular, fontSize: 14, color: k === i ? "#ffffff" : "rgba(255,255,255,0.75)" }}>{k + 1}. {tx(s.title)} <Text style={{ color: "rgba(255,255,255,0.4)" }}>· {u.rakah} {Math.min(s.rakah, rakat)}</Text></Text>
              </Pressable>
            ))}
          </Glass>
        ) : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.55)", marginTop: 16 }}>
          {u.note} <Text onPress={() => go("/surah/1?shams=1")} accessibilityRole="link" style={{ fontFamily: FONT.semibold, color: stage.gold }}>{u.learnFatiha} {rtl ? "←" : "→"}</Text>
        </Text>
      </View>
    </Stage>
  );
}
