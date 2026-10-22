import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { firstLetter } from "@/features/shams/memory";
import { align } from "@/web/recite";
import type { Prompt } from "./grades";
import { addTake, type TakeKind } from "./store2";
import { deleteTakeFile, onDeviceArabic, pruneTakes, takeDir } from "./take";
import { useS2 } from "./text";
import { useRec } from "./rec/text";

// Recitation from memory, shared by talaqqi, weak-spot drills and ʿarḍ tests:
//   PromptedWords – the verse as the grade allows it: full text, first letters only, or hidden (with "show once");
//   SpeechCheck   – on-device Arabic recognition (same engine and scoring as the reciter path's word check, which is
//                   not changed); here the result is reported back, compared with the grade's pass mark and, when the
//                   reciter's time is known, with the pace target. It never judges tajwīd. Optional (Shams 3.0):
//                   `strict` counts only the same word after normalisation; `persist` keeps the audio of the check as
//                   an own take on this device (index in store2.ts).
export type W = { position: number; text: string };
/** identity of a list of words (positions and text), stable across renders that rebuild the array */
export const wordsKey = (ws: W[]) => ws.map((w) => `${w.position}:${w.text}`).join("|");

export function PromptedWords({ words, prompt, mark, size = 26, revealLabel }: { words: W[]; prompt: Prompt; mark?: Set<number>; size?: number; revealLabel?: string }) {
  const t = useTheme();
  const { s } = useS2();
  const [shown, setShown] = useState(false);
  // reset only when the verse itself changes, not when the caller passes a new array for the same words
  const key = wordsKey(words);
  useEffect(() => setShown(false), [key, prompt]);
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
      <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", gap: 6 }}>
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

export type PersistTake = { kind: TakeKind; s?: number; from?: number; to?: number };
export function SpeechCheck({ words, pass, targetMs, onResult, compact, strict, persist }: { words: W[]; pass: number; targetMs?: number | null; onResult: (r: CheckResult) => void; compact?: boolean; strict?: boolean; persist?: PersistTake }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const [state, setState] = useState<"idle" | "listening" | "done" | "unavailable">("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const [ms, setMs] = useState(0);
  const [nothing, setNothing] = useState(false);
  const { r } = useRec();
  const heard = useRef("");
  const started = useRef(0);
  const live = useRef(false);
  const subs = useRef<{ remove: () => void }[]>([]);
  const report = useRef(onResult); report.current = onResult;
  const opts = useRef({ strict, persist }); opts.current = { strict, persist };
  const file = useRef<string | null>(null);
  useEffect(() => () => { subs.current.forEach((x) => x.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);
  // a new verse resets the result; a parent re-render with the same words (e.g. after onResult) keeps it
  const key = wordsKey(words);
  const wordsRef = useRef(words); wordsRef.current = words;
  useEffect(() => {
    setOk(null); setState((x) => (x === "unavailable" ? x : "idle"));
    // a check still listening for the previous verse is stopped, so its words are never scored against the new ones
    if (live.current) { live.current = false; subs.current.forEach((x) => x.remove()); subs.current = []; try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }
  }, [key]);

  const finish = () => {
    // nothing heard: no result, nothing recorded as missed (and no file kept); the learner tries again
    if (!heard.current.trim()) {
      const uri = file.current; file.current = null;
      if (uri) deleteTakeFile(uri);
      setOk(null); setNothing(true); setState("idle");
      return;
    }
    setNothing(false);
    const res = align(wordsRef.current.map((w) => w.text), heard.current, { strict: !!opts.current.strict }).ok;
    const share = res.length ? res.filter(Boolean).length / res.length : 0;
    const took = Date.now() - started.current;
    const keep = opts.current.persist, uri = file.current;
    file.current = null;
    if (keep && uri) { const { dropped } = addTake({ uri, kind: keep.kind, ms: took, s: keep.s, from: keep.from, to: keep.to }); dropped.forEach((d) => deleteTakeFile(d.uri)); pruneTakes(); }
    else if (uri) deleteTakeFile(uri);
    setMs(took); setOk(res); setState("done");
    report.current({ ok: res, share, pass: share >= pass, ms: took, paceOk: targetMs ? took <= targetMs : null });
  };
  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      // Arabic must be recognised on this device (take.ts onDeviceArabic); otherwise nothing starts
      const sup = m ? await onDeviceArabic() : null;
      if (!m || !sup?.ok) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("unavailable"); return; }
      heard.current = ""; setOk(null);
      subs.current.forEach((x) => x.remove());
      subs.current = [
        m.addListener("result", (e) => { heard.current = e.results[0]?.transcript ?? heard.current; setOk(align(wordsRef.current.map((w) => w.text), heard.current, { strict: !!opts.current.strict }).ok); }),
        m.addListener("audiostart", (e) => { if (e.uri) file.current = e.uri; }),
        m.addListener("end", () => { if (live.current) { live.current = false; finish(); } }),
        m.addListener("error", () => { if (live.current) { live.current = false; finish(); } }),
      ];
      started.current = Date.now();
      live.current = true;
      file.current = null;
      const keep = opts.current.persist;
      m.start({ lang: sup.lang, interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false,
        ...(sup.pkg ? { androidRecognitionServicePackage: sup.pkg } : {}),
        recordingOptions: keep ? { persist: true, outputDirectory: takeDir().uri, outputSampleRate: 16000, outputEncoding: "pcmFormatInt16" } : undefined });
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
      {nothing && state !== "listening" ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold }}>{r("heardNothing")}</Text> : null}
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
