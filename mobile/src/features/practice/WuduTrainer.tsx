import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from "react-native-svg";
import { RULE, WUDU, WUDU_KEY, type L3, type Scene, type Tradition, type WuduDone, type WuduStep } from "@/web/wudu";
import { award } from "@/web/points";
import { readJSON, writeJSON } from "@/lib/store";
import { useLang } from "@/i18n";
import { ARABIC_FONT, CALLIG_FONT, FONT, R, goldButton, stage, AR_RIGHT } from "@/lib/theme";
import { Stage as StageBg } from "@/components/brand";
import { Icon } from "@/components/icons";
import { DarkChip, PracticeWindow, RoundButton, StageButton, go, useClock, useReducedMotion } from "./art";
import { AR_TIMES, ARM, DONE_AR as DONE_AR_TEXT, DROP, EAR, FACE, FOOT, GOLD, HAIR, HAND, HEAD, INSTEP, LIPS, NOSE, UI, WATER, arc, shuffle, slips, type Lang } from "./web/wuduTrainer";

const goldC = GOLD.replace(/rgb\((\d+) (\d+) (\d+)\)/, "rgb($1,$2,$3)");
const waterC = WATER.replace(/rgb\((\d+) (\d+) (\d+)\)/, "rgb($1,$2,$3)");
const ink = "#ffffff";
// <span dir="ltr"> of the website: "3 / 12" keeps its order inside right-to-left text
const ltr = (s: string) => `\u2066${s}\u2069`;

// ---------- motion: every animated part is a pure function of the scene clock (seconds) ----------
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const frac = (x: number) => x - Math.floor(x);
type Clock = { t: number; still: boolean };

// length of an "M … C …" path (the routes of the drawing), for dashes measured along the path like pathLength={100}
function pathLength(d: string) {
  const nums = d.match(/-?\d*\.?\d+/g)?.map(Number) ?? [];
  let [x, y] = [nums[0], nums[1]], len = 0;
  for (let i = 2; i + 5 < nums.length + 0; i += 6) {
    const [x1, y1, x2, y2, x3, y3] = nums.slice(i, i + 6);
    let px = x, py = y;
    for (let k = 1; k <= 24; k++) {
      const s = k / 24, a = (1 - s) ** 3, b = 3 * (1 - s) ** 2 * s, c = 3 * (1 - s) * s * s, e = s ** 3;
      const nx = a * x + b * x1 + c * x2 + e * x3, ny = a * y + b * y1 + c * y2 + e * y3;
      len += Math.hypot(nx - px, ny - py); px = nx; py = ny;
    }
    x = x3; y = y3;
  }
  return len || 1;
}

function Drop({ x, y, fall = 60, delay = 0, s = 1, clock }: { x: number; y: number; fall?: number; delay?: number; s?: number; clock: Clock }) {
  let dy: number, op: number;
  if (clock.still) { dy = fall * 0.45; op = 0.8; } else {
    const p = frac((clock.t + delay) / 2.4);
    dy = fall * p * p;
    op = p < 0.15 ? (p / 0.15) * 0.95 : p < 0.75 ? 0.95 - ((p - 0.15) / 0.6) * 0.1 : 0.85 * (1 - (p - 0.75) / 0.25);
  }
  return <G x={x} y={y + dy} scale={s}><Path d={DROP} fill={waterC} fillOpacity={op} /></G>;
}

function Route({ d, kind, w = 2.6, delay = 0, clock }: { d: string; kind: "sweep" | "once"; w?: number; delay?: number; clock: Clock }) {
  const L = useMemo(() => pathLength(d), [d]);
  const u = L / 100;
  let dash: string | undefined, off = 0, op = 1;
  if (!clock.still) {
    if (kind === "sweep") {
      const cyc = frac((clock.t + delay) / 6.4) * 2; // alternate: there and back
      const p = easeInOut(cyc <= 1 ? cyc : 2 - cyc);
      dash = `${16 * u} ${200 * u}`; off = -84 * u * p;
    } else {
      const p = easeInOut(frac((clock.t + delay) / 2.8));
      dash = `${20 * u} ${200 * u}`; off = (20 - 120 * p) * u;
      op = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1;
    }
  }
  return (
    <>
      <Path d={d} fill="none" stroke={waterC} strokeOpacity={0.4} strokeWidth={1.1} strokeDasharray="1 4" strokeLinecap="round" />
      <Path d={d} fill="none" stroke={waterC} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} strokeDashoffset={off} strokeOpacity={op} />
    </>
  );
}

const line = { fill: "none", stroke: ink, strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const faint = { ...line, strokeOpacity: 0.35, strokeWidth: 1.1 } as const;
const gold = (o = 1, w = 1.8) => ({ fill: "none", stroke: goldC, strokeOpacity: o, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round" }) as const;
const flow = (clock: Clock, w = 2) => ({ fill: "none", stroke: waterC, strokeWidth: w, strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: "5 9", strokeDashoffset: clock.still ? 0 : -28 * frac(clock.t / 1.7) }) as const;
const glow = (clock: Clock) => (clock.still ? 0.6 : 0.35 + 0.55 * (0.5 - 0.5 * Math.cos((2 * Math.PI * clock.t) / 3.4)));
const ripple = (clock: Clock, delay = 0) => { if (clock.still) return { s: 1, o: 0.5 }; const p = 1 - Math.pow(1 - frac((clock.t + delay) / 2.4), 2); return { s: 0.4 + 1.1 * p, o: 0.9 * (1 - p) }; };

function Bust({ hl, tradition, clock }: { hl: Scene; tradition: Tradition; clock: Clock }) {
  const g = glow(clock);
  const rp = ripple(clock);
  return (
    <G>
      <Defs><ClipPath id="wd-face"><Path d={FACE} /></ClipPath></Defs>
      <Path d={HAIR} fill={ink} fillOpacity={hl === "head" ? 0 : 0.06} />
      {hl === "head" && (tradition === "sunni"
        ? <Path d={HAIR} fill={goldC} fillOpacity={0.16 * g} />
        : <Path d="M128 45C142 48 152 56 157 66" {...gold(0.3, 10)} />)}
      {hl === "face" ? <Path d={FACE} fill={goldC} fillOpacity={0.15} stroke={goldC} strokeOpacity={0.5} strokeWidth={1} /> : null}
      {hl === "ears" ? <Circle cx={103} cy={106} r={17} fill={goldC} fillOpacity={0.14 * g} /> : null}
      {hl === "heart" ? (
        <G>
          <Circle cx={146} cy={212} r={22} fill={goldC} fillOpacity={0.14 * g} />
          <Path d="M146 202l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill={goldC} fillOpacity={0.85} />
        </G>
      ) : null}
      <Path d={HEAD} {...line} />
      <Path d="M86 150C88 160 90 170 90 182" {...line} />
      <Path d="M130 180C146 186 168 196 180 214C186 224 188 232 189 240M90 182C74 190 58 200 50 214C46 222 44 232 43 240" {...line} />
      <Path d="M92 186C104 196 120 196 131 186" {...faint} />
      <Path d="M158 66C146 68 132 76 125 86C121 92 118 96 116 100" {...faint} />
      <Path d="M106 124C110 138 118 148 130 154C138 158 146 160 152 159" {...faint} />
      <Path d="M141 99C144 97 148 97 151 99" {...line} strokeWidth={1.3} />
      <Path d="M139 91C144 88 149 88 154 90" {...faint} />
      <Path d="M163 121C164 119 166 119 167 121" {...faint} />
      <Path d={EAR} {...(hl === "ears" ? gold(1, 2) : line)} />
      <Path d="M106 97C101 98 100 105 103 110" {...faint} />
      {hl === "mouth" ? (
        <G>
          <Path d={LIPS} {...gold(1, 2.2)} />
          <Circle cx={165} cy={133} r={9 * rp.s} fill="none" stroke={waterC} strokeWidth={1.4} strokeOpacity={rp.o} />
          <G rotation={clock.still ? 0 : (clock.t / 5) * 360} origin="165, 133">
            <Circle cx={165} cy={133} r={13} fill="none" stroke={waterC} strokeWidth={1.2} strokeDasharray="3 5" />
          </G>
        </G>
      ) : null}
      {hl === "nose" ? (
        <G>
          <Path d={NOSE} {...gold(1, 2.2)} />
          <Route d="M172 140C169 133 166 127 164 122C162 117 160 113 159 108" kind="sweep" w={2.4} clock={clock} />
        </G>
      ) : null}
      {hl === "face" ? (
        <G clipPath="url(#wd-face)">
          <Path d="M152 70C155 100 153 128 150 152M140 78C142 106 142 132 141 154M128 90C130 112 131 132 132 150M117 104C119 120 121 134 124 146" {...flow(clock, 1.8)} />
        </G>
      ) : null}
      {hl === "face" ? <><Drop x={150} y={164} fall={36} clock={clock} /><Drop x={142} y={166} fall={32} delay={1.2} s={0.8} clock={clock} /></> : null}
      {hl === "head" && (tradition === "sunni"
        ? <Route d="M154 63C142 49 122 45 104 50C86 56 72 74 70 96C70 112 76 126 84 138" kind="sweep" w={3} clock={clock} />
        : <Route d="M128 45C142 48 152 56 157 66" kind="once" w={3} clock={clock} />)}
      {hl === "ears" ? (
        <G>
          <Route d="M107 97C102 99 101 106 104 111" kind="sweep" w={2.4} clock={clock} />
          <Route d="M92 92C89 102 90 114 96 124" kind="sweep" w={2.4} delay={1.6} clock={clock} />
        </G>
      ) : null}
    </G>
  );
}

function Hand({ x, mirror, clock }: { x: number; mirror?: boolean; clock: Clock }) {
  return (
    <G x={x} y={204} scaleX={mirror ? -1 : 1}>
      <Path d={`${HAND}Z`} fill={goldC} fillOpacity={0.13} />
      <Path d={HAND} {...line} />
      <Path d="M-15 -28C-6 -34 6 -36 15 -30M18 -20C11 -26 9 -36 13 -44" {...faint} />
      <Path d="M-20 -7L20 -7" {...gold(0.9, 1.3)} strokeDasharray="2 3" />
      <Path d="M-7 -66C-7 -48 -5 -30 -3 -12M4 -70C4 -50 5 -30 6 -12M14 -62C14 -46 13 -30 12 -16" {...flow(clock, 1.6)} />
    </G>
  );
}

function Arm({ tradition, left, clock }: { tradition: Tradition; left?: boolean; clock: Clock }) {
  const id = left ? "wd-arm-l" : "wd-arm";
  return (
    <G x={left ? 240 : 0} scaleX={left ? -1 : 1}>
      <Defs><ClipPath id={id}><Path d={`${ARM}Z`} /></ClipPath></Defs>
      <G y={6}>
        <Rect x={64} y={80} width={180} height={70} fill={goldC} fillOpacity={0.15} clipPath={`url(#${id})`} />
        <Path d={ARM} {...line} />
        <Path d="M214 105C222 106 229 107 235 109M184 114C194 113 204 113 214 112" {...faint} />
        <Path d="M64 84V148" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        <Circle cx={74} cy={134} r={3} fill={goldC} />
        {tradition === "shia" ? (
          <>
            <Path d="M80 112C120 114 160 113 200 109C214 107 226 108 232 110M84 121C124 121 160 119 196 115" {...flow(clock, 1.8)} />
            <Drop x={233} y={120} fall={72} clock={clock} /><Drop x={226} y={120} fall={66} delay={1.3} s={0.8} clock={clock} />
          </>
        ) : (
          <>
            <Drop x={100} y={44} fall={50} clock={clock} /><Drop x={132} y={40} fall={58} delay={0.8} clock={clock} /><Drop x={164} y={46} fall={50} delay={1.5} clock={clock} /><Drop x={202} y={42} fall={50} delay={0.4} s={0.85} clock={clock} />
            <Drop x={118} y={134} fall={60} delay={1.1} s={0.8} clock={clock} /><Drop x={176} y={128} fall={64} delay={0.2} s={0.8} clock={clock} />
            <Path d="M84 112C120 116 160 116 200 110" {...flow(clock, 1.6)} strokeOpacity={0.7} />
          </>
        )}
      </G>
    </G>
  );
}

function Foot({ tradition, clock }: { tradition: Tradition; clock: Clock }) {
  const rp = ripple(clock);
  return (
    <G>
      <Defs><ClipPath id="wd-foot"><Path d={`${FOOT}Z`} /></ClipPath></Defs>
      {tradition === "sunni" ? (
        <>
          <Rect x={60} y={148} width={180} height={70} fill={goldC} fillOpacity={0.15} clipPath="url(#wd-foot)" />
          <Path d="M84 148H140" {...gold(0.85, 1.3)} strokeDasharray="2 3" />
        </>
      ) : <Path d={INSTEP} {...gold(0.3, 10)} />}
      <Path d={FOOT} {...line} />
      <Path d="M60 221H232" {...faint} />
      <Circle cx={114} cy={164} r={5} {...faint} />
      <Path d="M204 193C208 199 209 207 206 214M212 196C215 197 217 199 217 202" {...faint} />
      {tradition === "sunni" ? (
        <>
          <Drop x={152} y={100} fall={66} clock={clock} /><Drop x={176} y={104} fall={74} delay={0.9} clock={clock} /><Drop x={198} y={100} fall={84} delay={1.6} s={0.85} clock={clock} /><Drop x={118} y={92} fall={52} delay={0.5} s={0.85} clock={clock} />
          <Circle cx={208} cy={206} r={6 * rp.s} fill="none" stroke={waterC} strokeWidth={1.2} strokeOpacity={rp.o} />
        </>
      ) : <Route d={INSTEP} kind="once" w={3} clock={clock} />}
    </G>
  );
}

function Vessel({ pouring, clock }: { pouring: boolean; clock: Clock }) {
  const g = glow(clock);
  const rp = ripple(clock);
  const tw = (d: number) => (clock.still ? { o: 0.6, s: 0.8 } : (() => { const k = 0.5 - 0.5 * Math.cos((2 * Math.PI * (clock.t + d)) / 3.6); return { o: 0.15 + 0.85 * k, s: 0.6 + 0.4 * k }; })());
  return (
    <G>
      {!pouring ? <Circle cx={120} cy={140} r={64} fill={goldC} fillOpacity={0.08 * g} /> : null}
      <Path d="M106 72C108 60 132 60 134 72M102 72H138" {...line} />
      <Circle cx={120} cy={57} r={3.2} {...line} />
      <Path d="M108 72C108 84 106 92 100 99C80 113 74 146 86 168C94 182 146 182 154 168C166 146 160 113 140 99C134 92 132 84 132 72" {...line} />
      <Path d="M100 180L96 194H144L140 180" {...line} />
      <Path d="M157 132C172 126 180 110 186 90M155 152C175 146 186 122 195 92M186 90C188 86 193 87 195 92" {...line} />
      <Path d="M107 80C88 72 64 82 64 104C64 117 71 125 80 129M107 86C92 81 72 88 72 104C72 113 76 118 81 121" {...line} />
      <Path d="M86 134C104 142 136 142 154 134" {...gold(0.9, 1.4)} />
      <Path d="M120 146l5 5-5 5-5-5z" fill={goldC} />
      <Path d="M94 120C110 126 130 126 146 120" {...gold(0.5, 1)} strokeDasharray="1 4" />
      {pouring ? (
        <>
          <Path d="M166 214C170 224 214 224 218 214M162 214H222" {...line} />
          <Ellipse cx={192} cy={214} rx={12 * rp.s} ry={3 * rp.s} fill="none" stroke={waterC} strokeWidth={1.2} strokeOpacity={rp.o} />
          <Drop x={194} y={100} fall={110} clock={clock} /><Drop x={194} y={100} fall={110} delay={0.8} clock={clock} /><Drop x={194} y={100} fall={110} delay={1.6} clock={clock} />
        </>
      ) : (
        <G fill={goldC}>
          {[[62, 70, 0], [182, 58, 1.2], [56, 168, 2.1], [190, 176, 0.6], [150, 40, 2.8]].map(([x, y, d]) => {
            const k = tw(d);
            return <G key={`${x}-${y}`} x={x} y={y} scale={k.s}><Path d="M0 -6l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fillOpacity={k.o} /></G>;
          })}
        </G>
      )}
    </G>
  );
}

function Scene({ scene, tradition, label }: { scene: Scene; tradition: Tradition; label: string }) {
  const reduce = useReducedMotion();
  const t = useClock(!reduce, 30);
  const clock = { t, still: reduce };
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => { fade.setValue(reduce ? 1 : 0); if (!reduce) Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start(); }, [scene, tradition, reduce, fade]);
  const bust = scene === "heart" || scene === "mouth" || scene === "nose" || scene === "face" || scene === "head" || scene === "ears";
  return (
    <View style={{ width: "100%", height: "100%" }} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Svg width="100%" height="100%" viewBox="0 0 240 240" style={{ position: "absolute" }}>
        <Path d="M26 238V110C26 62 70 34 120 18C170 34 214 62 214 110V238" fill="none" stroke={goldC} strokeOpacity={0.16} strokeWidth={1} />
        <Path d="M120 10l3 5-3 5-3-5z" fill={goldC} fillOpacity={0.4} />
      </Svg>
      <Animated.View style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, opacity: fade }}>
        <Svg width="100%" height="100%" viewBox="0 0 240 240">
          {bust ? <Bust hl={scene} tradition={tradition} clock={clock} /> : null}
          {scene === "hands" ? (
            <G>
              <Hand x={152} clock={clock} /><Hand x={88} mirror clock={clock} />
              <Drop x={72} y={46} fall={58} clock={clock} /><Drop x={90} y={40} fall={60} delay={1.1} s={0.85} clock={clock} /><Drop x={150} y={42} fall={62} delay={0.5} clock={clock} /><Drop x={168} y={48} fall={56} delay={1.7} s={0.85} clock={clock} />
            </G>
          ) : null}
          {scene === "arm" || scene === "armL" ? <Arm tradition={tradition} left={scene === "armL"} clock={clock} /> : null}
          {scene === "feet" ? <Foot tradition={tradition} clock={clock} /> : null}
          {scene === "vessel" || scene === "end" ? <Vessel pouring={scene === "vessel"} clock={clock} /> : null}
        </Svg>
      </Animated.View>
    </View>
  );
}

// ---------- tap counter: a ring of segments, one per round ----------
function Counter({ times, sides, u, lang }: { times: number; sides?: boolean; u: Record<string, string>; lang: Lang }) {
  const total = times * (sides ? 2 : 1);
  const [n, setN] = useState(0);
  const done = n >= total;
  const onLeft = sides && n >= times;
  const inSide = done ? times : n - (onLeft ? times : 0);
  const gap = total > 1 ? 0.22 : 0;
  const seg = (Math.PI * 2) / total;
  // Arabic says the count in words (مرّتين), the others "2×"
  const label = lang === "ar" ? `${AR_TIMES[times] ?? times}${sides ? ` ${u.each}` : ""}` : `${times}×${sides ? ` ${u.each}` : ""}`;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginTop: 20 }}>
      <Pressable onPress={() => setN(done ? 0 : n + 1)} accessibilityRole="button" accessibilityLabel={`${done ? u.again : u.count}: ${n} / ${total}`}
        style={({ pressed }) => ({ width: 64, height: 64, alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.95 : 1 }] })}>
        <Svg width={64} height={64} viewBox="0 0 64 64" style={{ position: "absolute" }}>
          {total === 1
            ? <Circle cx={32} cy={32} r={28} fill="none" strokeWidth={3} stroke={n >= 1 ? goldC : "rgba(255,255,255,0.18)"} />
            : Array.from({ length: total }, (_, k) => {
                const a0 = -Math.PI / 2 + k * seg + gap / 2;
                return <Path key={k} d={arc(28, a0, a0 + seg - gap)} fill="none" strokeWidth={3} strokeLinecap="round" stroke={k < n ? goldC : "rgba(255,255,255,0.18)"} />;
              })}
        </Svg>
        {done ? <Icon name="checkCircle" color={stage.gold} size={28} /> : (
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 20, lineHeight: 22, color: "#ffffff", fontVariant: ["tabular-nums"] }}>{inSide}</Text>
            {sides ? <Text style={{ fontFamily: FONT.semibold, fontSize: 10, color: "rgba(255,255,255,0.6)" }}>{onLeft ? u.left : u.right}</Text> : null}
          </View>
        )}
      </Pressable>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 26, color: stage.gold }}>{label}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>{done ? u.again : u.tapHint}</Text>
      </View>
    </View>
  );
}

// a quiz tile shakes when it was the wrong one; the next one glows after two misses
function QuizTile({ label, at, wrongAt, hint, onPress }: { label: string; at: number; wrongAt: number; hint: boolean; onPress: () => void }) {
  const shake = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!wrongAt || reduce) return;
    shake.setValue(0);
    Animated.sequence([-4, 4, -4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 110, easing: Easing.linear, useNativeDriver: true }))).start();
  }, [wrongAt, reduce, shake]);
  useEffect(() => {
    if (!hint || reduce) { pulse.setValue(hint ? 1 : 0); return; }
    const loop = Animated.loop(Animated.sequence([Animated.timing(pulse, { toValue: 1, duration: 800, useNativeDriver: true }), Animated.timing(pulse, { toValue: 0, duration: 800, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [hint, reduce, pulse]);
  const picked = at >= 0;
  return (
    <Animated.View style={{ width: "48.5%", flexGrow: 1, transform: [{ translateX: shake }] }}>
      {hint ? <Animated.View pointerEvents="none" style={{ position: "absolute", left: -4, top: -4, right: -4, bottom: -4, borderRadius: R.sm + 4, borderWidth: 4, borderColor: "rgba(214,180,108,0.35)", opacity: pulse }} /> : null}
      <Pressable onPress={onPress} disabled={picked} accessibilityRole="button" accessibilityState={{ disabled: picked }} accessibilityLabel={picked ? `${at + 1}. ${label}` : label}
        style={({ pressed }) => ({ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: R.sm, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8,
          borderColor: picked ? "rgba(214,180,108,0.6)" : hint ? stage.gold : wrongAt ? "rgba(253,230,138,0.5)" : pressed ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
          backgroundColor: picked ? "rgba(214,180,108,0.15)" : hint ? "rgba(214,180,108,0.07)" : "rgba(255,255,255,0.04)" })}>
        <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: picked ? stage.gold : "transparent", borderWidth: picked ? 0 : 1, borderColor: "rgba(255,255,255,0.2)" }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: picked ? stage.bg : "rgba(255,255,255,0.4)" }}>{picked ? at + 1 : "·"}</Text>
        </View>
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14.5, lineHeight: 19, color: "#ffffff" }}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// a few small gold stars rise behind the result (PracticeCelebrate)
const RISE: [number, number, number][] = [[8, 0, 1], [18, 0.5, 0.8], [27, 1.1, 1.2], [36, 0.2, 0.7], [46, 0.8, 1], [55, 1.4, 0.8], [63, 0.3, 1.3], [72, 1, 0.9], [81, 0.6, 1.1], [90, 1.2, 0.8], [14, 1.7, 0.9], [68, 1.8, 1]];
function Celebrate() {
  const reduce = useReducedMotion();
  const t = useClock(!reduce, 30);
  const [h, setH] = useState(300);
  if (reduce || t > 6) return null;
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, overflow: "hidden" }} onLayout={(e) => setH(e.nativeEvent.layout.height)}>
      {RISE.map(([l, d, s]) => {
        const p = Math.min(1, Math.max(0, (t - d) / 3.6));
        if (p <= 0 || p >= 1) return null;
        return (
          <View key={l} style={{ position: "absolute", left: `${l}%`, bottom: -12 + p * h * 0.9, opacity: p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8, transform: [{ scale: s }, { rotate: `${p * 180}deg` }] }}>
            <Svg width={10} height={10} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill="#e9cf99" /></Svg>
          </View>
        );
      })}
    </View>
  );
}

// Wudu trainer (website WuduTrainer.tsx): every step drawn and explained, obligatory and recommended marked, a tap
// counter for the rounds, and an order quiz at the end (progress tf:wudu, points "wudu")
export default function WuduTrainer() {
  const { lang, rtl } = useLang();
  const l: Lang = lang === "de" ? "de" : lang === "ar" ? "ar" : "en";
  const u = UI[l];
  const tx = (v?: L3) => (v ? v[l] : "");
  const [tradition, setTradition] = useState<Tradition>("sunni");
  const steps = WUDU[tradition];
  const order = useMemo(() => steps.filter((s) => s.quiz), [steps]);
  const [i, setI] = useState(0);
  const [auto, setAuto] = useState(false);
  const [list, setList] = useState(false);
  const [mode, setMode] = useState<"learn" | "quiz" | "done">("learn");
  const [pool, setPool] = useState<string[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [miss, setMiss] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<{ id: string; t: number } | null>(null);
  const [passed, setPassed] = useState<WuduDone | null>(() => { const r = readJSON<WuduDone | null>(WUDU_KEY, null); return r?.done ? r : null; });
  const step: WuduStep = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  useEffect(() => {
    if (!auto || mode !== "learn") return;
    if (last) { setAuto(false); return; }
    const len = step.text[l].length + (step.duas?.reduce((n, d) => n + d.ar.length, 0) ?? 0);
    const id = setTimeout(() => setI((n) => n + 1), Math.min(13000, 4500 + len * 32));
    return () => clearTimeout(id);
  }, [auto, i, last, step, l, mode]);

  const startQuiz = (t: Tradition = tradition) => {
    const ids = WUDU[t].filter((s) => s.quiz).map((s) => s.id);
    let mixed = shuffle(ids);
    while (mixed.join() === ids.join()) mixed = shuffle(ids);
    setPool(mixed); setPicked([]); setMiss(0); setStreak(0); setWrong(null); setAuto(false); setMode("quiz");
  };
  const chooseTradition = (t: Tradition) => {
    if (t === tradition) return;
    setTradition(t); setI(0); setAuto(false);
    if (mode !== "learn") startQuiz(t);
  };
  const pick = (id: string) => {
    if (mode !== "quiz" || picked.includes(id)) return;
    if (id === order[picked.length].id) {
      const next = [...picked, id];
      setPicked(next); setStreak(0); setWrong(null);
      if (next.length === order.length) {
        const rec: WuduDone = { done: true, at: Date.now(), tradition };
        writeJSON(WUDU_KEY, rec);
        award("wudu");
        setPassed(rec);
        setTimeout(() => setMode("done"), 650);
      }
    } else {
      setMiss((m) => m + 1); setStreak((s) => s + 1); setWrong({ id, t: Date.now() });
    }
  };
  const goStep = (k: number) => { setAuto(false); setMode("learn"); setI(k); };
  const kindLabel = (s: WuduStep) => (tradition === "sunni" ? u[s.kind] : u[s.kind === "fard" ? "wajib" : "mustahabb"]);
  const byId = (id: string) => steps.find((s) => s.id === id)!;
  const hair = "rgba(214,180,108,0.2)";

  return (
    <StageBg rounded={16} hairlines={false} style={{ borderWidth: 1, borderColor: "rgba(214,180,108,0.3)" }}>
      <View style={{ padding: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: hair }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }} accessibilityRole="tablist">
          {(["sunni", "shia"] as const).map((t) => <DarkChip key={t} accessibilityRole="tab" label={u[t]} on={tradition === t} onPress={() => chooseTradition(t)} />)}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {passed ? (
            <View style={{ height: 40, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 4 }}>
              <Icon name="checkCircle" color={stage.gold} size={20} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{u.passed}</Text>
            </View>
          ) : null}
          <DarkChip label={mode === "learn" ? u.quiz : u.back} onPress={() => (mode === "learn" ? startQuiz() : goStep(i))} />
        </View>
      </View>

      {mode === "learn" ? (
        <>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: hair }}>
            <View style={{ width: "100%", maxWidth: 360, aspectRatio: 1, alignSelf: "center", alignItems: "center" }}>
              <PracticeWindow uid="wudu-w" height="100%" style={{ position: "absolute", top: 0, opacity: 0.4 }} />
              <Scene scene={step.scene} tradition={tradition} label={tx(step.title)} />
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 6, marginTop: 8 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {steps.map((s, k) => k === i
                ? <LinearGradient key={s.id} colors={["#ecd7a2", "#c6a65e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 32, height: 6, borderRadius: 3 }} />
                : <View key={s.id} style={{ width: 20, height: 6, borderRadius: 3, backgroundColor: k < i ? stage.gold : "rgba(255,255,255,0.15)" }} />)}
            </View>
          </View>

          <View style={{ padding: 20, minHeight: 420 }}>
            <View key={`${tradition}-${i}`}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 12, rowGap: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Svg width={10} height={10} viewBox="0 0 12 12"><Path d="M6 .5l1.4 3.1L10.5 5 7.4 6.4 6 9.5 4.6 6.4 1.5 5l3.1-1.4z" fill={stage.gold} /></Svg>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: rtl ? 0 : 1.9, color: stage.gold }}>{ltr(`${i + 1} / ${steps.length}`)}</Text>
                </View>
                <View style={{ borderRadius: R.pill, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 2, borderColor: step.kind === "fard" ? "rgba(214,180,108,0.7)" : "rgba(255,255,255,0.25)" }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: step.kind === "fard" ? stage.gold : "rgba(255,255,255,0.7)" }}>{kindLabel(step)}</Text>
                </View>
              </View>
              <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: "#eef0f3", marginTop: 8 }}>{tx(step.title)}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 26, color: "rgba(255,255,255,0.85)", marginTop: 12 }}>{tx(step.text)}</Text>
              {step.times ? <Counter key={`${tradition}-${step.id}`} times={step.times} sides={step.sides} u={u} lang={l} /> : null}
              {step.duas?.map((d) => (
                <View key={d.ar} style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: "rgba(214,180,108,0.25)", paddingTop: 16 }}>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 52, color: "#ffffff", writingDirection: "rtl", textAlign: AR_RIGHT }}>{d.ar}</Text>
                  {l !== "ar" ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 24, color: stage.gold, marginTop: 8 }}>{d.translit}</Text> : null}
                  {l !== "ar" ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.8)", marginTop: 8 }}><Text style={{ fontFamily: FONT.semibold, color: "#ffffff" }}>{u.meaning}: </Text>{d.meaning[l]}</Text> : null}
                  {d.src ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>{tx(d.src)}</Text> : null}
                </View>
              ))}
              {step.note ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: "rgba(255,255,255,0.75)", marginTop: 16, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(214,180,108,0.25)", backgroundColor: "rgba(255,255,255,0.05)", padding: 12, overflow: "hidden" }}>{tx(step.note)}</Text> : null}
            </View>
            <View style={{ flex: 1, minHeight: 24 }} />
            <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", overflow: "hidden" }} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: steps.length, now: i + 1 }}>
              <LinearGradient colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: `${((i + 1) / steps.length) * 100}%`, borderRadius: 3 }} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 16 }}>
              <RoundButton dir="prev" label={u.prev} disabled={i === 0} onPress={() => { setAuto(false); setI((n) => Math.max(0, n - 1)); }} />
              <Pressable onPress={() => (last ? startQuiz() : setAuto((a) => !a))} accessibilityRole="button" style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                <LinearGradient colors={[goldButton.from, goldButton.to]} style={{ height: 48, borderRadius: R.pill, alignItems: "center", justifyContent: "center", paddingHorizontal: 12 }}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: goldButton.text }}>{last ? u.toQuiz : auto ? u.pause : u.play}</Text>
                </LinearGradient>
              </Pressable>
              <RoundButton dir="next" label={u.next} disabled={last} onPress={() => { setAuto(false); setI((n) => Math.min(steps.length - 1, n + 1)); }} />
            </View>
          </View>
        </>
      ) : null}

      {mode === "quiz" ? (
        <View style={{ padding: 20 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: rtl ? 0 : 1.9, textTransform: "uppercase", color: stage.gold }}>{u.quiz} · {ltr(`${picked.length} / ${order.length}`)}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 30, lineHeight: 35, letterSpacing: -0.7, color: "#eef0f3", marginTop: 8 }}>{u.quizTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.75)", marginTop: 8 }}>{u.quizLead}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 24 }}>
            {pool.map((id) => (
              <QuizTile key={id} label={tx(byId(id).title)} at={picked.indexOf(id)} wrongAt={wrong?.id === id ? wrong.t : 0}
                hint={streak >= 2 && order[picked.length]?.id === id} onPress={() => pick(id)} />
            ))}
          </View>
          <Text accessibilityLiveRegion="polite" style={{ minHeight: 24, fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 16 }}>
            {wrong ? (streak >= 2 ? u.hint : u.wrong) : picked.length > 0 ? u.good : ""}
          </Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{tx(RULE[tradition])}</Text>
        </View>
      ) : null}

      {mode === "done" ? (
        <View style={{ paddingHorizontal: 20, paddingVertical: 48, alignItems: "center", overflow: "hidden" }}>
          <Celebrate />
          <Text allowFontScaling={false} style={{ fontFamily: CALLIG_FONT, fontSize: 52, lineHeight: 80, color: stage.gold, textAlign: "center" }}>{DONE_AR_TEXT}</Text>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, lineHeight: 30, color: "#eef0f3", textAlign: "center", marginTop: 16, maxWidth: 520 }}>{u.doneTitle}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: "rgba(255,255,255,0.75)", textAlign: "center", marginTop: 12, maxWidth: 520 }}>{u.doneText} {slips(miss, l, u)}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 28 }}>
            <StageButton gold title={`${u.toSalah} ${rtl ? "←" : "→"}`} onPress={() => go("/salah")} />
            <StageButton title={u.toVerse} onPress={() => go("/surah/5?v=6")} />
            <StageButton title={u.practise} onPress={() => startQuiz()} />
          </View>
        </View>
      ) : null}

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: hair }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 16 }}>
          <Pressable onPress={() => setList((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: list }} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ transform: [{ rotate: list ? "90deg" : rtl ? "180deg" : "0deg" }] }}><Icon name="chevronRight" color="rgba(255,255,255,0.8)" size={13} /></View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{u.steps}</Text>
          </Pressable>
          {i > 0 || mode !== "learn" ? <Text onPress={() => goStep(0)} accessibilityRole="button" style={{ fontFamily: FONT.semibold, fontSize: 14, color: "rgba(255,255,255,0.6)", paddingVertical: 10 }}>{u.restart}</Text> : null}
        </View>
        {list ? (
          <View style={{ gap: 4, marginTop: 8 }}>
            {steps.map((s, k) => (
              <Pressable key={s.id} onPress={() => goStep(k)} accessibilityRole="button" accessibilityState={{ selected: mode === "learn" && k === i }}
                style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: R.md, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: mode === "learn" && k === i ? "rgba(214,180,108,0.15)" : "transparent" }}>
                <Text style={{ flex: 1, fontFamily: mode === "learn" && k === i ? FONT.bold : FONT.regular, fontSize: 14, color: mode === "learn" && k === i ? "#ffffff" : "rgba(255,255,255,0.75)" }}>{k + 1}. {tx(s.title)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: s.kind === "fard" ? stage.gold : "rgba(255,255,255,0.4)" }}>{kindLabel(s).split(" · ")[0]}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>{tx(RULE[tradition])}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 19, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{u.note}</Text>
      </View>
    </StageBg>
  );
}

