import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder } from "expo-audio";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { align } from "@/web/recite";
import { ensureAudioSession, markAudioSessionChanged } from "@/features/coursekit/audio";
import { useX } from "./strings";

const RED = "rgb(160,58,52)";

type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

/**
 * "Recite & check" of the website (ReciteCheck.tsx) for the reader:
 * - Recite & check: the verse is recited from memory and every word is checked. The app uses the device's own Arabic
 *   speech recognition (expo-speech-recognition, on the device only, the same recogniser as the word check of the
 *   talents and the reciter path); the words are scored with align() from @/web/recite exactly like the website. It
 *   recognises words, it does not judge tajweed. Nothing is uploaded or stored.
 * - Record: record yourself, listen to the recording and compare it with the reciter (stays on this device).
 * Props: words (the verse's Arabic words), onResult (score 0..1 and per-word result, after a check), onPlayReciter
 * (plays the verse), pauseOthers (stop the reader's audio before listening or recording), dark (on the stage).
 */
export function ReciteCheck({ words = [], onResult, onPlayReciter, pauseOthers, dark = false }: {
  words?: string[]; onResult?: (score: number, ok: boolean[]) => void; onPlayReciter?: () => void; pauseOthers?: () => void; dark?: boolean;
}) {
  const t = useTheme();
  const w = useWebT("recite");
  const x = useX().recite;
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const player = useAudioPlayer(null);
  const [state, setState] = useState<"idle" | "rec" | "done">("idle");
  const [mine, setMine] = useState<string | null>(null);
  const [err, setErr] = useState("");
  // the word check: idle, listening, unavailable (no on-device Arabic recognition on this device)
  const [check, setCheck] = useState<"idle" | "listening" | "unavailable">("idle");
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState<{ ok: boolean[]; score: number } | null>(null);
  const heardRef = useRef("");
  const live = useRef(false);
  const subs = useRef<{ remove: () => void }[]>([]);
  const alive = useRef(true);
  const report = useRef(onResult);
  report.current = onResult;
  const wordsKey = words.join(" ");
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(() => {
    // the recogniser exists on this device at all (checked once, before anything is asked)
    const m = speech()?.ExpoSpeechRecognitionModule;
    try { if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) setCheck("unavailable"); } catch { setCheck("unavailable"); }
    return () => {
      alive.current = false;
      subs.current.forEach((s) => s.remove());
      if (live.current) { try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }
    };
  }, []);
  useEffect(() => { setResult(null); setHeard(""); }, [wordsKey]);

  /** back to the playback session of the reader (recognition and recording switch it to recording) */
  const restoreAudio = () => { markAudioSessionChanged(); void ensureAudioSession(); };

  const finish = () => {
    subs.current.forEach((s) => s.remove());
    subs.current = [];
    restoreAudio();
    if (!alive.current) return;
    setCheck("idle");
    if (!heardRef.current.trim()) return;
    const r = align(wordsRef.current, heardRef.current);
    setResult(r);
    report.current?.(r.score, r.ok);
  };
  const listen = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setCheck("unavailable"); return; }
      pauseOthers?.();
      player.pause();
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setErr(x.deniedSpeech); return; }
      setErr(""); setResult(null); setHeard(""); heardRef.current = "";
      subs.current.forEach((s) => s.remove());
      subs.current = [
        m.addListener("result", (e) => { heardRef.current = e.results[0]?.transcript ?? heardRef.current; if (alive.current) setHeard(heardRef.current); }),
        m.addListener("end", () => { if (live.current) { live.current = false; finish(); } }),
        m.addListener("error", (e) => {
          if (alive.current && e.error !== "no-speech" && e.error !== "aborted") setErr(e.error === "not-allowed" ? x.deniedSpeech : w("failed"));
          if (live.current) { live.current = false; finish(); }
        }),
      ];
      live.current = true;
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false });
      setCheck("listening");
    } catch { live.current = false; setCheck("unavailable"); }
  };
  const stopListening = () => {
    try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ }
    if (live.current) { live.current = false; finish(); }
  };

  const record = async () => {
    try {
      if (check === "listening") stopListening();
      pauseOthers?.();
      player.pause();
      const p = await requestRecordingPermissionsAsync();
      if (!p.granted) { setErr(x.denied); return; }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setErr(""); setState("rec");
    } catch { setErr(x.denied); }
  };
  const stop = async () => {
    try { await recorder.stop(); } catch { /* already stopped */ }
    // back to playback through the speaker, with the reader's background playback
    restoreAudio();
    if (!alive.current) return;
    setMine(recorder.uri); setState(recorder.uri ? "done" : "idle");
  };
  const playMine = () => {
    if (!mine) return;
    pauseOthers?.();
    player.replace({ uri: mine });
    void player.seekTo(0);
    player.play();
  };

  const fg = dark ? "#ffffff" : t.ink;
  const muted = dark ? "rgba(255,255,255,0.6)" : t.muted;
  const good = dark ? "rgb(134,214,178)" : t.accent;
  const outline = { height: 40, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.25)" : t.line, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 };
  const canCheck = check !== "unavailable" && words.length > 0;
  const pct = result ? Math.round(result.score * 100) : 0;
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.1)" : t.line, backgroundColor: dark ? "rgba(255,255,255,0.04)" : t.bg, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {canCheck ? (check === "listening" ? (
          <Pressable onPress={stopListening} accessibilityRole="button" accessibilityLabel={w("done")}
            style={{ height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: RED, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffffff" }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#ffffff" }}>{w("done")}</Text>
          </Pressable>
        ) : (
          <GoldButton title={w("check")} compact onPress={() => void listen()} disabled={state === "rec"} />
        )) : null}
        {state === "rec" ? (
          <Pressable onPress={() => void stop()} accessibilityRole="button" accessibilityLabel={w("stopRec")}
            style={{ height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: RED, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffffff" }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#ffffff" }}>{w("stopRec")}</Text>
          </Pressable>
        ) : !canCheck && state === "idle" ? (
          <GoldButton title={w("record")} compact onPress={() => void record()} />
        ) : (
          <Pressable onPress={() => void record()} disabled={check === "listening"} accessibilityRole="button" accessibilityLabel={w("record")} accessibilityState={{ disabled: check === "listening" }}
            style={[outline, check === "listening" ? { opacity: 0.45 } : null]}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: RED }} />
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: fg }}>{w("record")}</Text>
          </Pressable>
        )}
        {mine && state === "done" ? (
          <>
            <Pressable onPress={playMine} accessibilityRole="button" accessibilityLabel={w("mine")} style={outline}>
              <Icon name="play" size={14} color={fg} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: fg }}>{w("mine")}</Text>
            </Pressable>
            {onPlayReciter ? (
              <Pressable onPress={() => { player.pause(); onPlayReciter(); }} accessibilityRole="button" accessibilityLabel={w("reciter")} style={outline}>
                <Icon name="volume" size={15} color={fg} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: fg }}>{w("reciter")}</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}
      </View>
      {check === "listening" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: muted }}>{w("listening")}</Text> : null}
      {check === "listening" && heard ? (
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 38, color: fg, writingDirection: "rtl", textAlign: "right" }} accessibilityLanguage="ar">{heard}</Text>
      ) : null}
      {result ? (
        <View accessibilityLiveRegion="polite" style={{ gap: 4 }}>
          {/* every word of the verse: green when it was heard, red when it was missed (website ReciteCheck) */}
          <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", columnGap: 6 }} accessible accessibilityLabel={w("score", { pct })}>
            {words.map((word, i) => (
              <Text key={i} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 42, paddingHorizontal: 2, borderRadius: 4, overflow: "hidden",
                color: result.ok[i] ? good : RED, backgroundColor: result.ok[i] ? "transparent" : "rgba(160,58,52,0.12)" }}>{word}</Text>
            ))}
          </View>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: fg }}>
            {w("score", { pct })} · <Text style={{ fontFamily: FONT.regular, color: muted }}>{result.score >= 0.95 ? w("great") : result.score >= 0.75 ? w("good") : w("again")}</Text>
          </Text>
        </View>
      ) : null}
      {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: RED }}>{err}</Text> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color: muted }}>{canCheck ? x.checkPrivacy : x.unavailable} {x.privacy}</Text>
    </View>
  );
}
