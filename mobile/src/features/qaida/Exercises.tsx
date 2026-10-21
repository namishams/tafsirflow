import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, PanResponder, Pressable, Text, View } from "react-native";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { align } from "@/web/recite";
import { useClip } from "../coursekit/audio";
import { GoldRing, useReduceMotion } from "../coursekit/motion";
import { useArabicVoice } from "../coursekit/voice";
import type { Ex } from "./lesson";
import { saveSpeed, useQaida } from "./progress";
import { useQT } from "./texts";
import { qwordAudio, type QWord } from "./words";

// The exercise cards of the reading course. Arabic is always shown right to left; the system layout direction (RTL
// languages) is left to React Native. Motion stays still under Reduce Motion.

export const RED = "rgb(190,84,104)";

export function Ar({ children, size = 40, color, center = true }: { children: string; size?: number; color?: string; center?: boolean }) {
  const t = useTheme();
  return (
    <Text accessibilityLanguage="ar" allowFontScaling={false}
      style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.8, color: color ?? t.arabic, textAlign: center ? "center" : "right", writingDirection: "rtl" }}>{children}</Text>
  );
}

/** play a Quran word recording, or let the device voice say a letter / syllable */
export function useSay() {
  const clip = useClip();
  const { canSpeak, speak } = useArabicVoice();
  return { canSpeak, clip, say: (o: { speak?: string; word?: QWord }) => (o.word ? clip.play(qwordAudio(o.word)) : o.speak ? speak(o.speak) : undefined) };
}

export function ListenButton({ onPress, label, big = false, busy = false }: { onPress: () => void; label: string; big?: boolean; busy?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={{ alignSelf: "center", height: big ? 64 : 42, minWidth: big ? 64 : undefined, paddingHorizontal: big ? 0 : 16, borderRadius: R.pill, backgroundColor: t.accent, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
      {busy ? <ActivityIndicator color={t.onAccent} size="small" /> : <Icon name="speaker" size={big ? 26 : 16} color={t.onAccent} />}
      {big ? null : <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.onAccent }}>{label}</Text>}
    </Pressable>
  );
}

export function LearnCard({ ex }: { ex: Extract<Ex, { t: "learn" }> }) {
  const t = useTheme();
  const qt = useQT();
  const { say, canSpeak, clip } = useSay();
  const can = !!ex.word || (canSpeak && !!ex.speak);
  return (
    <View style={{ gap: 14, alignItems: "stretch" }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold, textAlign: "center" }}>{qt("learn")}</Text>
      <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, paddingVertical: 18, paddingHorizontal: 12 }}>
        <Ar size={ex.big.length > 14 ? 30 : ex.big.length > 6 ? 44 : 72}>{ex.big}</Ar>
      </View>
      {ex.title ? <Text style={{ fontFamily: FONT.bold, fontSize: 19, color: t.ink, textAlign: "center" }}>{ex.title}</Text> : null}
      {ex.body ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.muted, textAlign: "center" }}>{ex.body}</Text> : null}
      {ex.word && ex.word.ar !== ex.big ? (
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{qt("asIn")}</Text>
          <Ar size={30}>{ex.word.ar}</Ar>
        </View>
      ) : null}
      {can ? <ListenButton label={qt("listen")} onPress={() => say(ex)} busy={clip.state === "loading"} /> : null}
    </View>
  );
}

export function ChooseCard({ ex, picked, checked, onPick }: { ex: Extract<Ex, { t: "choose" }>; picked: number | null; checked: boolean; onPick: (i: number) => void }) {
  const t = useTheme();
  const qt = useQT();
  const { say, clip } = useSay();
  const audio = !!ex.word || !!ex.speak;
  useEffect(() => { if (audio && !ex.big) say(ex); }, [ex]); // eslint-disable-line react-hooks/exhaustive-deps
  const wide = ex.options.some((o) => o.text) || ex.options.some((o) => (o.ar?.length ?? 0) > 4);
  return (
    <View style={{ gap: 16 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 19, lineHeight: 25, color: t.ink, textAlign: "center" }}>{ex.q}</Text>
      {ex.big ? <Ar size={ex.big.length > 3 ? 52 : 78}>{ex.big}</Ar> : null}
      {audio ? <ListenButton big={!ex.big} label={qt("listen")} onPress={() => say(ex)} busy={clip.state === "loading"} /> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {ex.options.map((o, i) => {
          const right = checked && i === ex.answer, wrong = checked && picked === i && i !== ex.answer, sel = !checked && picked === i;
          return (
            <Pressable key={i} disabled={checked} onPress={() => onPick(i)} accessibilityRole="button" accessibilityState={{ selected: picked === i }} accessibilityLabel={o.text ?? o.ar}
              style={{ width: wide ? "100%" : "47%", minHeight: wide ? 56 : 92, borderRadius: R.card, borderWidth: 1.5, alignItems: "center", justifyContent: "center", paddingHorizontal: 10,
                borderColor: right ? t.accent : wrong ? RED : sel ? t.gold : t.line, backgroundColor: right ? t.accentSoft : wrong ? "rgba(190,84,104,0.08)" : t.surface }}>
              {o.ar ? <Ar size={wide ? 30 : 44}>{o.ar}</Ar> : <Text style={{ fontFamily: FONT.semibold, fontSize: 16, color: t.ink, textAlign: "center" }}>{o.text}</Text>}
              <GoldRing on={right} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** tap one on each side; a wrong pair counts as a mistake */
export function MatchCard({ ex, onDone }: { ex: Extract<Ex, { t: "match" }>; onDone: (mistakes: number) => void }) {
  const t = useTheme();
  const right = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5), [ex]);
  const [a, setA] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [bad, setBad] = useState<number | null>(null);
  const mistakes = useRef(0);
  const pick = (j: number) => {
    if (a === null) return;
    const ok = ex.pairs[a].b === right[j].b;
    if (ok) {
      const d = new Set(done); d.add(a); setDone(d); setA(null);
      if (d.size === ex.pairs.length) setTimeout(() => onDone(mistakes.current), 300);
    } else { mistakes.current++; setBad(j); setTimeout(() => setBad(null), 500); }
  };
  const box = (on: boolean, ok: boolean, wrong: boolean) => ({ minHeight: 64, borderRadius: R.card, borderWidth: 1.5, alignItems: "center" as const, justifyContent: "center" as const, paddingHorizontal: 8,
    borderColor: ok ? t.accent : wrong ? RED : on ? t.gold : t.line, backgroundColor: ok ? t.accentSoft : t.surface, opacity: ok ? 0.55 : 1 });
  return (
    <View style={{ gap: 16 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 19, color: t.ink, textAlign: "center" }}>{ex.q}</Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1, gap: 10 }}>
          {ex.pairs.map((p, i) => (
            <Pressable key={i} disabled={done.has(i)} onPress={() => setA(i)} accessibilityRole="button" accessibilityState={{ selected: a === i, disabled: done.has(i) }} style={box(a === i, done.has(i), false)}>
              <Ar size={34}>{p.a}</Ar>
            </Pressable>
          ))}
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          {right.map((p, j) => {
            const ok = [...done].some((i) => ex.pairs[i].b === p.b);
            return (
              <Pressable key={j} disabled={ok} onPress={() => pick(j)} accessibilityRole="button" accessibilityLabel={p.b} style={box(false, ok, bad === j)}>
                {p.bAr ? <Ar size={34}>{p.b}</Ar> : <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "center" }}>{p.b}</Text>}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

/** a tile that can be dragged upwards into the answer row (or tapped) */
function DragTile({ label, onPlace, disabled }: { label: string; onPlace: () => void; disabled: boolean }) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const pos = useRef(new Animated.ValueXY()).current;
  const place = useRef(onPlace); place.current = onPlace;
  const pan = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 6,
    onPanResponderMove: Animated.event([null, { dx: pos.x, dy: pos.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, g) => {
      if (g.dy < -40) { pos.setValue({ x: 0, y: 0 }); place.current(); return; }
      if (reduce) pos.setValue({ x: 0, y: 0 }); else Animated.spring(pos, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  }), [pos, reduce]);
  return (
    <Animated.View {...(disabled ? {} : pan.panHandlers)} style={{ transform: pos.getTranslateTransform(), opacity: disabled ? 0.25 : 1 }}>
      <Pressable disabled={disabled} onPress={onPlace} accessibilityRole="button" accessibilityLabel={label}
        style={{ minWidth: 54, height: 60, paddingHorizontal: 10, borderRadius: R.md, borderWidth: 1.5, borderColor: t.gold, backgroundColor: t.surface, alignItems: "center", justifyContent: "center" }}>
        <Ar size={30}>{label}</Ar>
      </Pressable>
    </Animated.View>
  );
}

export function BuildCard({ ex, checked, onChange }: { ex: Extract<Ex, { t: "build" }>; checked: boolean; onChange: (order: number[]) => void }) {
  const t = useTheme();
  const qt = useQT();
  const { say } = useSay();
  const bank = useMemo(() => ex.tiles.map((x, i) => ({ x, i })).sort(() => Math.random() - 0.5), [ex]);
  const [order, setOrder] = useState<number[]>([]);
  const set = (o: number[]) => { setOrder(o); onChange(o); };
  const ok = checked && order.map((i) => ex.tiles[i]).join("|") === ex.tiles.join("|");
  return (
    <View style={{ gap: 16 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 19, color: t.ink, textAlign: "center" }}>{ex.q}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "center" }}>{ex.hint}</Text>
      {ex.word ? <ListenButton label={qt("listen")} onPress={() => say(ex)} /> : null}
      <View style={{ minHeight: 96, borderRadius: R.card, borderWidth: 1.5, borderStyle: order.length ? "solid" : "dashed", borderColor: checked ? (ok ? t.accent : RED) : t.line, backgroundColor: checked && ok ? t.accentSoft : t.surface, alignItems: "center", justifyContent: "center", padding: 8 }}>
        {order.length ? <Ar size={ex.joiner ? 28 : 44}>{order.map((i) => ex.tiles[i]).join(ex.joiner)}</Ar> : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{qt("emptyRow")}</Text>}
        {order.length && !checked ? (
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
            {order.map((i, k) => (
              <Pressable key={k} onPress={() => set(order.filter((_, j) => j !== k))} accessibilityRole="button" accessibilityLabel={ex.tiles[i]}
                style={{ paddingHorizontal: 8, borderRadius: R.sm, backgroundColor: t.accentSoft }}><Ar size={18}>{ex.tiles[i]}</Ar></Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {checked && !ok ? <Ar size={ex.joiner ? 26 : 40} color={t.accent}>{ex.tiles.join(ex.joiner)}</Ar> : null}
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {bank.map(({ x, i }) => <DragTile key={i} label={x} disabled={checked || order.includes(i)} onPlace={() => set([...order, i])} />)}
      </View>
      {order.length && !checked ? <Pressable onPress={() => set([])} accessibilityRole="button" style={{ alignSelf: "center", padding: 8 }}><Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{qt("reset")}</Text></Pressable> : null}
    </View>
  );
}

// expo-speech-recognition is a native module: loaded lazily so a build without it (web, Expo Go) still works
type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

/** read aloud: on-device recognition, scored with align() from the website's recite check (no tajweed judgement) */
export function ReadCard({ words, onResult, highlight }: { words: QWord[]; onResult: (score: number | null) => void; highlight?: boolean }) {
  const t = useTheme();
  const qt = useQT();
  const { say } = useSay();
  const [state, setState] = useState<"idle" | "listening" | "done" | "unavailable">("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const heard = useRef("");
  const subs = useRef<{ remove: () => void }[]>([]);
  const report = useRef(onResult); report.current = onResult;
  useEffect(() => () => { subs.current.forEach((s) => s.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);
  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("unavailable"); report.current(null); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("unavailable"); report.current(null); return; }
      heard.current = ""; setOk(null);
      subs.current.forEach((s) => s.remove());
      subs.current = [
        m.addListener("result", (e) => {
          heard.current = e.results[0]?.transcript ?? heard.current;
          const r = align(words.map((w) => w.ar), heard.current);
          setOk(r.ok);
          report.current(r.score);
        }),
        m.addListener("end", () => setState((s) => (s === "listening" ? "done" : s))),
        m.addListener("error", () => setState("done")),
      ];
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false });
      setState("listening");
    } catch { setState("unavailable"); report.current(null); }
  };
  const stop = () => { try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ } setState("done"); };
  const n = ok?.filter(Boolean).length ?? 0;
  return (
    <View style={{ gap: 14 }}>
      {!highlight ? <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 19, color: t.ink, textAlign: "center" }}>{qt("read")}</Text> : null}
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
        {words.map((w, i) => (
          <Pressable key={w.ref} onPress={() => say({ word: w })} accessibilityRole="button" accessibilityLabel={w.tr || w.ar}
            style={{ paddingHorizontal: 6, borderRadius: R.md, backgroundColor: ok ? (ok[i] ? t.accentSoft : "rgba(190,84,104,0.08)") : "transparent" }}>
            <Ar size={words.length > 4 ? 28 : 38} color={ok ? (ok[i] ? t.accent : RED) : undefined}>{w.ar}</Ar>
          </Pressable>
        ))}
      </View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "center" }}>{state === "unavailable" ? qt("unavailable") : qt("readLead")}</Text>
      {state !== "unavailable" ? (
        <Pressable onPress={() => (state === "listening" ? stop() : void start())} accessibilityRole="button"
          style={{ alignSelf: "center", height: 46, paddingHorizontal: 20, borderRadius: R.pill, backgroundColor: state === "listening" ? RED : t.accent, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {state === "listening" ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="speaker" size={16} color="#fff" />}
          <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: "#fff" }}>{state === "listening" ? qt("stopCheck") : qt("startCheck")}</Text>
        </Pressable>
      ) : null}
      {ok ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: "center" }}>{qt("heard", { n, total: words.length })}</Text> : null}
    </View>
  );
}

/** read a row against the clock; the best time is kept per lesson */
export function SpeedCard({ ex, onDone }: { ex: Extract<Ex, { t: "speed" }>; onDone: (inTime: boolean) => void }) {
  const t = useTheme();
  const qt = useQT();
  const p = useQaida();
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  useEffect(() => {
    if (start === null || result !== null) return;
    const id = setInterval(() => setNow(Date.now() - start), 100);
    return () => clearInterval(id);
  }, [start, result]);
  const s = (ms: number) => (ms / 1000).toFixed(1);
  const best = p.speed[ex.lessonId];
  const finish = () => { const ms = Date.now() - (start ?? Date.now()); setResult(ms); saveSpeed(ex.lessonId, ms); onDone(ms <= ex.targetMs); };
  return (
    <View style={{ gap: 14 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 19, color: t.ink, textAlign: "center" }}>{qt("speed")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "center" }}>{qt("speedLead")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, textAlign: "center" }}>{qt("target", { s: s(ex.targetMs) })}{best ? ` · ${qt("best", { s: s(best) })}` : ""}</Text>
      <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 12, opacity: start === null ? 0.35 : 1 }}>
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
          {ex.items.map((x, i) => <Ar key={i} size={ex.items.some((y) => y.length > 4) ? 28 : 36}>{x}</Ar>)}
        </View>
      </View>
      <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.display, fontSize: 34, color: result === null ? t.ink : result <= ex.targetMs ? t.accent : RED, textAlign: "center" }}>{qt("seconds", { s: s(result ?? now) })}</Text>
      {result !== null ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted, textAlign: "center" }}>{result <= ex.targetMs ? qt("fast") : qt("slow")}</Text> : (
        <Pressable onPress={() => (start === null ? (setStart(Date.now()), setNow(0)) : finish())} accessibilityRole="button"
          style={{ alignSelf: "center", height: 50, paddingHorizontal: 28, borderRadius: R.pill, backgroundColor: start === null ? t.accent : t.gold, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: start === null ? t.onAccent : "#1b1406" }}>{start === null ? qt("go") : qt("stop")}</Text>
        </Pressable>
      )}
    </View>
  );
}
