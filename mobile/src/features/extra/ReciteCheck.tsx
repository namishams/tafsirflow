import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { RecordingPresets, requestRecordingPermissionsAsync, setAudioModeAsync, useAudioPlayer, useAudioRecorder } from "expo-audio";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useWebT } from "@/i18n/web";
import { FONT, R, useTheme } from "@/lib/theme";
import { useX } from "./strings";

const RED = "rgb(160,58,52)";

/**
 * "Recite & check" of the website (ReciteCheck.tsx) for the reader. The app part that works today: record yourself
 * reciting from memory, listen to your recording and compare it with the reciter. Nothing is stored or uploaded.
 * The word-by-word check needs on-device speech recognition (a native module, e.g. expo-speech-recognition, not
 * installed yet); `words` and `onResult` are already part of the props so the reader does not change later
 * (scoring: align() from @/web/recite, exactly like the website).
 * Props: words (the verse's Arabic words), onPlayReciter (plays the verse), pauseOthers (stop the reader's audio
 * before recording), dark (on the stage), onResult (score 0..1 and per-word result, once recognition exists).
 */
export function ReciteCheck({ onPlayReciter, pauseOthers, dark = false }: {
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
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const record = async () => {
    try {
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
    // back to playback through the speaker
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => undefined);
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
  const outline = { height: 40, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.25)" : t.line, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 };
  return (
    <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: dark ? "rgba(255,255,255,0.1)" : t.line, backgroundColor: dark ? "rgba(255,255,255,0.04)" : t.bg, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {state === "rec" ? (
          <Pressable onPress={() => void stop()} accessibilityRole="button" accessibilityLabel={w("stopRec")}
            style={{ height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: RED, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ffffff" }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#ffffff" }}>{w("stopRec")}</Text>
          </Pressable>
        ) : state === "idle" ? (
          <GoldButton title={w("record")} compact onPress={() => void record()} />
        ) : (
          <Pressable onPress={() => void record()} accessibilityRole="button" accessibilityLabel={w("record")} style={outline}>
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
      {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: RED }}>{err}</Text> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, lineHeight: 16, color: muted }}>{x.wordsSoon} {x.privacy}</Text>
    </View>
  );
}
