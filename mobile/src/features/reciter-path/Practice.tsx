import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder, useAudioRecorderState } from "expo-audio";
import Svg, { Rect } from "react-native-svg";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import type { Verse } from "@/lib/quran";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { align } from "@/web/recite";
import { useRpT } from "./texts";
import { wordsOf } from "./useVerse";

const RED = "rgb(220,38,38)";
const SPEEDS = [0.5, 0.75, 1] as const;

/** the verse from the word data, right to left; `mark` highlights words (rule examples, test answers) */
export function VerseWords({ verse, mark, picked, onWord, active, size = 26 }: {
  verse: Verse; mark?: number[]; picked?: number[]; onWord?: (pos: number) => void; active?: number | null; size?: number;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, justifyContent: "flex-start" }}>
      {wordsOf(verse).map((w) => {
        const isMark = mark?.includes(w.position);
        const isPick = picked?.includes(w.position);
        const bg = isPick ? t.accentSoft : isMark ? "rgba(201,166,94,0.18)" : "transparent";
        const border = isPick ? t.accent : isMark ? t.gold : "transparent";
        const inner = (
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.9, color: active === w.position ? t.accent : t.ink, writingDirection: "rtl" }}>{w.text_uthmani}</Text>
        );
        return onWord ? (
          <Pressable key={w.position} onPress={() => onWord(w.position)} accessibilityRole="button" accessibilityState={{ selected: !!isPick }}
            accessibilityLabel={w.transliteration?.text ?? w.text_uthmani}
            style={{ paddingHorizontal: 8, borderRadius: R.md, borderWidth: 1.5, borderColor: border, backgroundColor: bg }}>{inner}</Pressable>
        ) : (
          <View key={w.position} style={{ paddingHorizontal: 6, borderRadius: R.md, borderWidth: 1.5, borderColor: border, backgroundColor: bg }}>{inner}</View>
        );
      })}
    </View>
  );
}

function Chip({ label, on, onPress, icon }: { label: string; on?: boolean; onPress: () => void; icon?: Parameters<typeof Icon>[0]["name"] }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: !!on }}
      style={{ height: 36, paddingHorizontal: 12, borderRadius: R.pill, borderWidth: 1, borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accentSoft : t.surface, flexDirection: "row", alignItems: "center", gap: 6 }}>
      {icon ? <Icon name={icon} size={15} color={on ? t.accent : t.ink} /> : null}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: on ? t.accent : t.ink }}>{label}</Text>
    </Pressable>
  );
}

/**
 * Listen and repeat: plays one word (from the reciter's word timings) or the whole verse, optionally in a loop, at
 * 0.5×, 0.75× or 1×. The audio is the allowed reciter's (useReciter decides, Pro voices only with Pro).
 */
export function ListenRepeat({ verse, word }: { verse: Verse; word?: number }) {
  const t = useTheme();
  const rt = useRpT();
  const audio = useVerseAudio();
  const [rate, setRate] = useState<number>(1);
  const [loop, setLoop] = useState(false);
  const range = useRef<{ start: number; end: number } | null>(null);
  const loopRef = useRef(loop); loopRef.current = loop;
  const seg = word ? verse.segments.find((s) => s.word === word) : undefined;

  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps
  // a word range ends at its timing; repeat or pause
  useEffect(() => {
    const r = range.current;
    if (!r || !audio.playing || audio.positionMs < r.end) return;
    if (loopRef.current) audio.seekPlay(r.start); else { audio.pause(); range.current = null; }
  }, [audio.positionMs, audio.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  audio.onEnd.current = () => {
    if (!loopRef.current) return;
    if (range.current) audio.seekPlay(range.current.start); else audio.seekPlay(0);
  };

  const playWord = () => {
    if (!seg) return;
    range.current = { start: seg.start, end: seg.end };
    audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, fromMs: seg.start, rate, track: false });
  };
  const playVerse = () => { range.current = null; audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, rate, track: false }); };
  const changeRate = (r: number) => { setRate(r); audio.setRate(r); };

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {audio.playing ? <Chip label={rt("stop")} icon="pause" on onPress={() => { range.current = null; audio.pause(); }} /> : (
          <>
            {seg ? <Chip label={rt("playWord")} icon="play" onPress={playWord} /> : null}
            <Chip label={rt("playVerse")} icon="play" onPress={playVerse} />
          </>
        )}
        <Chip label={rt("loop")} icon="repeat" on={loop} onPress={() => setLoop(!loop)} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }} accessibilityLabel={rt("speed")}>
        <Icon name="speed" size={16} color={t.muted} />
        {SPEEDS.map((s) => <Chip key={s} label={`${s}×`} on={rate === s} onPress={() => changeRate(s)} />)}
      </View>
    </View>
  );
}

/** loudness bars (dB from the recorder's metering, -60..0) */
function Bars({ values, color, height = 44 }: { values: number[]; color: string; height?: number }) {
  const n = Math.max(values.length, 1);
  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${n * 3} ${height}`} preserveAspectRatio="none">
      {values.map((v, i) => { const h = Math.max(2, ((Math.min(0, Math.max(-60, v)) + 60) / 60) * height); return <Rect key={i} x={i * 3} y={(height - h) / 2} width={2} height={h} rx={1} fill={color} />; })}
    </Svg>
  );
}

/** the reciter's word timings as blocks on the same time axis (from the segments, no audio analysis) */
function Timing({ verse, totalMs, color }: { verse: Verse; totalMs: number; color: string }) {
  const segs = [...verse.segments].sort((a, b) => a.start - b.start);
  const end = Math.max(totalMs, segs.at(-1)?.end ?? 1);
  return (
    <Svg width="100%" height={18} viewBox={`0 0 1000 18`} preserveAspectRatio="none">
      {segs.map((s) => <Rect key={`${s.word}-${s.start}`} x={(s.start / end) * 1000} y={3} width={Math.max(4, ((s.end - s.start) / end) * 1000 - 3)} height={12} rx={3} fill={color} />)}
    </Svg>
  );
}

/**
 * Record yourself and compare: A (reciter) and B (your recording) side by side, or A then B. Loudness over time is
 * shown as a visual aid only; nothing is graded automatically. The recording stays on the device.
 */
export function RecordCompare({ verse }: { verse: Verse }) {
  const t = useTheme();
  const rt = useRpT();
  const audio = useVerseAudio();
  const recorder = useAudioRecorder({ ...RecordingPresets.HIGH_QUALITY, isMeteringEnabled: true });
  const rec = useAudioRecorderState(recorder, 100);
  const player = useAudioPlayer(null);
  const [mine, setMine] = useState<string | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const [durMs, setDurMs] = useState(0);
  const [err, setErr] = useState("");
  const thenMine = useRef(false);

  useEffect(() => { if (rec.isRecording && typeof rec.metering === "number") setLevels((l) => [...l, rec.metering as number].slice(-400)); }, [rec.durationMillis]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps
  audio.onEnd.current = () => { if (thenMine.current) { thenMine.current = false; playMine(); } };

  const start = async () => {
    try {
      audio.pause(); player.pause();
      const p = await requestRecordingPermissionsAsync();
      if (!p.granted) { setErr(rt("micDenied")); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      setLevels([]); setErr("");
      recorder.record();
    } catch { setErr(rt("micDenied")); }
  };
  const stop = async () => {
    const d = rec.durationMillis;
    try { await recorder.stop(); } catch { /* already stopped */ }
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
    setDurMs(d); setMine(recorder.uri);
  };
  function playMine() {
    if (!mine) return;
    audio.pause();
    player.replace({ uri: mine });
    void player.seekTo(0);
    player.play();
  }
  const playReciter = (andThen = false) => { player.pause(); thenMine.current = andThen; audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, track: false }); };

  const btn = { height: 40, paddingHorizontal: 14, borderRadius: R.pill, borderWidth: 1, borderColor: t.line, flexDirection: "row" as const, alignItems: "center" as const, gap: 8, backgroundColor: t.surface };
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {rec.isRecording ? (
          <Pressable onPress={() => void stop()} accessibilityRole="button" style={[btn, { backgroundColor: RED, borderColor: RED }]}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#fff" }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#fff" }}>{rt("stopRec")} · {Math.round(rec.durationMillis / 1000)} s</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => void start()} accessibilityRole="button" style={btn}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RED }} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{rt("record")}</Text>
          </Pressable>
        )}
        <Pressable onPress={() => playReciter()} accessibilityRole="button" style={btn}><Icon name="play" size={14} color={t.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{rt("reciter")}</Text></Pressable>
        {mine ? (
          <>
            <Pressable onPress={playMine} accessibilityRole="button" style={btn}><Icon name="play" size={14} color={t.accent} /><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{rt("you")}</Text></Pressable>
            <Pressable onPress={() => playReciter(true)} accessibilityRole="button" style={btn}><Icon name="repeat" size={14} color={t.ink} /><Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{rt("ab")}</Text></Pressable>
          </>
        ) : null}
      </View>
      {err ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: RED }}>{err}</Text> : null}
      {verse.segments.length ? (
        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{rt("reciterTiming")}</Text>
          <Timing verse={verse} totalMs={durMs} color={t.gold} />
        </View>
      ) : null}
      {levels.length ? (
        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{rt("yourVoice")}</Text>
          <Bars values={levels} color={t.accent} />
        </View>
      ) : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{rt("visualNote")}</Text>
    </View>
  );
}

// expo-speech-recognition is a native module: loaded lazily so a build without it (web, Expo Go) still opens the screen
type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

/**
 * Word check: on-device Arabic recognition shows which words of the verse were heard (memorisation and accuracy of
 * words). It never judges tajweed. Scoring with align() from the website's recite check.
 */
export function WordCheck({ verse }: { verse: Verse }) {
  const t = useTheme();
  const rt = useRpT();
  const [state, setState] = useState<"idle" | "listening" | "done" | "unavailable">("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const heard = useRef("");
  const subs = useRef<{ remove: () => void }[]>([]);
  const words = wordsOf(verse);

  useEffect(() => () => { subs.current.forEach((s) => s.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);

  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("unavailable"); return; }
      heard.current = ""; setOk(null);
      subs.current.forEach((s) => s.remove());
      subs.current = [
        m.addListener("result", (e) => {
          heard.current = e.results[0]?.transcript ?? heard.current;
          setOk(align(words.map((w) => w.text_uthmani), heard.current).ok);
        }),
        m.addListener("end", () => setState((s) => (s === "listening" ? "done" : s))),
        m.addListener("error", () => setState("done")),
      ];
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false });
      setState("listening");
    } catch { setState("unavailable"); }
  };
  const stop = () => { try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ } setState("done"); };

  const n = ok?.filter(Boolean).length ?? 0;
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{rt("wordCheckLead")}</Text>
      {state === "unavailable" ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{rt("wordCheckUnavailable")}</Text> : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Pressable onPress={() => (state === "listening" ? stop() : void start())} accessibilityRole="button"
            style={{ height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: state === "listening" ? RED : t.accent, flexDirection: "row", alignItems: "center", gap: 8 }}>
            {state === "listening" ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="speaker" size={15} color="#fff" />}
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#fff" }}>{state === "listening" ? rt("wordCheckStop") : rt("wordCheckStart")}</Text>
          </Pressable>
          {ok ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{rt("heard", { n, total: words.length })}</Text> : null}
        </View>
      )}
      {ok ? (
        <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 }}>
          {words.map((w, i) => (
            <View key={w.position} style={{ paddingHorizontal: 6, borderRadius: R.md, backgroundColor: ok[i] ? t.accentSoft : "rgba(220,38,38,0.08)" }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, color: ok[i] ? t.accent : RED }}>{w.text_uthmani}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
