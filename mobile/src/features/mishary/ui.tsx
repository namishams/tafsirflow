import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import Svg, { Rect } from "react-native-svg";
import { Icon, type IconName } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useMt } from "./texts";

export const RED = "rgb(160,58,52)";

export function Section({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Text accessibilityRole="header" style={{ flex: 1, fontFamily: FONT.bold, fontSize: 19, color: t.ink }}>{title}</Text>
        {right}
      </View>
      {children}
    </View>
  );
}
export function Card({ children, style }: { children: ReactNode; style?: object }) {
  const t = useTheme();
  return <View style={[{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 12 }, style]}>{children}</View>;
}
export function Muted({ children, size = 13 }: { children: ReactNode; size?: number }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.regular, fontSize: size, lineHeight: size * 1.45, color: t.muted }}>{children}</Text>;
}
export function Body({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{children}</Text>;
}
export function Chip({ label, on, onPress, icon, disabled }: { label: string; on?: boolean; onPress: () => void; icon?: IconName; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityState={{ selected: !!on, disabled: !!disabled }}
      style={{ minHeight: 36, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentSoft : t.surface, flexDirection: "row", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1 }}>
      {icon ? <Icon name={icon} size={15} color={on ? t.accent : t.ink} /> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.accent : t.ink }}>{label}</Text>
    </Pressable>
  );
}
/** the "needs review" label on draft content */
export function NeedsReview() {
  const t = useTheme();
  const mt = useMt();
  return (
    <View accessibilityLabel={mt("needsReview")} style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, height: 22, borderRadius: R.pill, borderWidth: 1, borderColor: t.gold, backgroundColor: "rgba(201,166,94,0.12)" }}>
      <Icon name="pen" size={11} color={t.gold} />
      <Text style={{ fontFamily: FONT.bold, fontSize: 10.5, letterSpacing: 0.6, color: t.gold }}>{mt("needsReview").toUpperCase()}</Text>
    </View>
  );
}
export function ErrorText({ text }: { text: string }) {
  return text ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: RED }}>{text}</Text> : null;
}
export function Row({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }, style]}>{children}</View>;
}

/** loudness bars from metering (dB -60..0) */
export function Bars({ values, color, height = 40 }: { values: number[]; color: string; height?: number }) {
  const n = Math.max(values.length, 1);
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${n * 3} ${height}`} preserveAspectRatio="none">
      {values.map((v, i) => { const h = Math.max(2, ((Math.min(0, Math.max(-60, v)) + 60) / 60) * height); return <Rect key={i} x={i * 3} y={(height - h) / 2} width={2} height={h} rx={1} fill={color} />; })}
    </Svg>
  );
}

/** async loader with reload */
export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | null; error: unknown; loading: boolean }>({ data: null, error: null, loading: true });
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true }));
    fn().then((data) => { if (alive.current) setState({ data, error: null, loading: false }); })
      .catch((error) => { if (alive.current) setState({ data: null, error, loading: false }); });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(reload, [reload]);
  return { ...state, reload };
}

export type Take = { uri: string; durMs: number; levels: number[] };

/**
 * Records one take with metering (loudness bars). Stops itself at maxSec. The take stays on the device until the
 * screen sends or saves it.
 */
export function Recorder({ maxSec, minSec = 0, onTake, onStart }: { maxSec: number; minSec?: number; onTake: (t: Take | null) => void; onStart?: () => void }) {
  const t = useTheme();
  const mt = useMt();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const rec = useAudioRecorderState(recorder, 100);
  const player = useAudioPlayer(null);
  const st = useAudioPlayerStatus(player);
  const [take, setTake] = useState<Take | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [err, setErr] = useState("");
  const stopping = useRef(false);

  useEffect(() => { if (rec.isRecording && typeof rec.metering === "number") setLevels((l) => [...l, rec.metering as number].slice(-900)); }, [rec.durationMillis]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (rec.isRecording && rec.durationMillis >= maxSec * 1000) void stop(); }, [rec.durationMillis]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = async () => {
    try {
      player.pause();
      const p = await requestRecordingPermissionsAsync();
      if (!p.granted) { setErr(mt("micDenied")); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      setLevels([]); setErr(""); setTake(null); onTake(null); onStart?.();
      stopping.current = false;
      recorder.record();
    } catch { setErr(mt("micDenied")); }
  };
  async function stop() {
    if (stopping.current) return;
    stopping.current = true;
    const d = rec.durationMillis;
    try { await recorder.stop(); } catch { /* already stopped */ }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    if (!recorder.uri) return;
    const tk = { uri: recorder.uri, durMs: d, levels };
    setTake(tk);
    onTake(d >= minSec * 1000 ? tk : null);
    if (d < minSec * 1000) setErr(mt("tooShort"));
  }
  const listen = () => { if (!take) return; if (st.playing) { player.pause(); return; } player.replace({ uri: take.uri }); void player.seekTo(0); player.play(); };

  const btn = { height: 42, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, flexDirection: "row" as const, alignItems: "center" as const, gap: 8, backgroundColor: t.surface };
  return (
    <View style={{ gap: 10 }}>
      <Row>
        {rec.isRecording ? (
          <Pressable onPress={() => void stop()} accessibilityRole="button" style={[btn, { backgroundColor: RED, borderColor: RED }]}>
            <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: "#fff" }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#fff" }}>{mt("recording", { s: Math.round(rec.durationMillis / 1000) })}</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => void start()} accessibilityRole="button" style={btn}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RED }} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{take ? mt("rerecord") : mt("record")}</Text>
          </Pressable>
        )}
        {take && !rec.isRecording ? (
          <Pressable onPress={listen} accessibilityRole="button" style={btn}>
            <Icon name={st.playing ? "pause" : "play"} size={14} color={t.accent} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{mt("listen")} · {Math.round(take.durMs / 1000)} s</Text>
          </Pressable>
        ) : null}
      </Row>
      {levels.length ? <Bars values={levels.slice(-300)} color={t.accent} /> : null}
      <ErrorText text={err} />
    </View>
  );
}
