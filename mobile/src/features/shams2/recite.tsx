import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { firstLetter } from "@/features/shams/memory";
import { align } from "@/web/recite";
import type { Prompt } from "./grades";
import { useS2 } from "./text";

// Recitation from memory, shared by talaqqi, weak-spot drills and ʿarḍ tests:
//   PromptedWords – the verse as the grade allows it: full text, first letters only, or hidden (with "show once");
//   SpeechCheck   – on-device Arabic recognition (same engine and scoring as the reciter path's word check, which is
//                   not changed); here the result is reported back, compared with the grade's pass mark and, when the
//                   reciter's time is known, with the pace target. It never judges tajwīd.
export type W = { position: number; text: string };

export function PromptedWords({ words, prompt, mark, size = 26, revealLabel }: { words: W[]; prompt: Prompt; mark?: Set<number>; size?: number; revealLabel?: string }) {
  const t = useTheme();
  const { s } = useS2();
  const [shown, setShown] = useState(false);
  useEffect(() => setShown(false), [words, prompt]);
  const level: Prompt = shown ? "full" : prompt;
  if (level === "hidden") {
    return (
      <Pressable onPress={() => setShown(true)} accessibilityRole="button" style={{ padding: 18, borderRadius: R.card, borderWidth: 1, borderStyle: "dashed", borderColor: "rgba(201,166,94,0.6)", alignItems: "center", gap: 6 }}>
        <Icon name="eye" size={18} color={t.gold} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{revealLabel ?? s("showText")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center" }}>{s("hiddenNote")}</Text>
      </Pressable>
    );
  }
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6 }}>
        {words.map((w) => {
          const m = mark?.has(w.position);
          return (
            <View key={w.position} style={{ paddingHorizontal: 5, borderRadius: R.md, backgroundColor: m ? "rgba(201,166,94,0.18)" : "transparent", borderWidth: m ? 1 : 0, borderColor: "rgba(201,166,94,0.6)" }}>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: size, lineHeight: size * 1.85, color: m ? t.gold : t.ink, writingDirection: "rtl" }}>{level === "letters" ? firstLetter(w.text) : w.text}</Text>
            </View>
          );
        })}
      </View>
      {prompt !== "full" && !shown ? (
        <Pressable onPress={() => setShown(true)} accessibilityRole="button" hitSlop={8}><Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.accent }}>{s("showText")}</Text></Pressable>
      ) : null}
    </View>
  );
}

type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

export type CheckResult = { ok: boolean[]; share: number; pass: boolean; ms: number; paceOk: boolean | null };

export function SpeechCheck({ words, pass, targetMs, onResult, compact }: { words: W[]; pass: number; targetMs?: number | null; onResult: (r: CheckResult) => void; compact?: boolean }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const [state, setState] = useState<"idle" | "listening" | "done" | "unavailable">("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const [ms, setMs] = useState(0);
  const heard = useRef("");
  const started = useRef(0);
  const live = useRef(false);
  const subs = useRef<{ remove: () => void }[]>([]);
  const report = useRef(onResult); report.current = onResult;
  useEffect(() => () => { subs.current.forEach((x) => x.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);
  useEffect(() => { setOk(null); setState((x) => (x === "unavailable" ? x : "idle")); }, [words]);

  const finish = () => {
    const res = align(words.map((w) => w.text), heard.current).ok;
    const share = res.length ? res.filter(Boolean).length / res.length : 0;
    const took = Date.now() - started.current;
    setMs(took); setOk(res); setState("done");
    report.current({ ok: res, share, pass: share >= pass, ms: took, paceOk: targetMs ? took <= targetMs : null });
  };
  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("unavailable"); return; }
      heard.current = ""; setOk(null);
      subs.current.forEach((x) => x.remove());
      subs.current = [
        m.addListener("result", (e) => { heard.current = e.results[0]?.transcript ?? heard.current; setOk(align(words.map((w) => w.text), heard.current).ok); }),
        m.addListener("end", () => { if (live.current) { live.current = false; finish(); } }),
        m.addListener("error", () => { if (live.current) { live.current = false; finish(); } }),
      ];
      started.current = Date.now();
      live.current = true;
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false });
      setState("listening");
    } catch { setState("unavailable"); }
  };
  const stop = () => { try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ } if (live.current) { live.current = false; finish(); } };

  const n = ok?.filter(Boolean).length ?? 0;
  if (state === "unavailable") return <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{s("checkUnavailable")}</Text>;
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Pressable onPress={() => (state === "listening" ? stop() : void start())} accessibilityRole="button"
          style={{ height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: state === "listening" ? "rgb(160,58,52)" : t.accent, flexDirection: "row", alignItems: "center", gap: 8 }}>
          {state === "listening" ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="speaker" size={15} color="#fff" />}
          <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: "#fff" }}>{state === "listening" ? s("checkStop") : s("checkStart")}</Text>
        </Pressable>
        {!compact ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{s("passMark", { p: nf(Math.round(pass * 100)) })}</Text> : null}
      </View>
      {ok && state === "done" ? (
        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: n / Math.max(1, ok.length) >= pass ? t.accent : t.gold }}>
            {`${s("heardOf", { n: nf(n), total: nf(ok.length) })} · ${n / Math.max(1, ok.length) >= pass ? s("passed") : s("notYetPassed")}`}
          </Text>
          {targetMs ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: ms <= targetMs ? t.accent : t.muted }}>{s("paceLine", { s: nf(Math.round(ms / 100) / 10), target: nf(Math.round(targetMs / 100) / 10) })}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}
