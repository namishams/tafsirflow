import { useEffect, useRef, useState } from "react";
import type { Verse } from "@/lib/quran";
import { align } from "@/web/recite";
import { wordsOf } from "@/features/reciter-path/useVerse";

// On-device word check before a clip is recorded (same recogniser and scoring as the Reciter Path word check):
// Arabic speech recognition on the device only (requiresOnDeviceRecognition), never uploaded, no tajweed judgement.
// A clip can be recorded once at least PASS of the verse words were heard.
export const PASS = 0.8;

type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function speech(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

export function useWordCheck(verses: Verse[] | null) {
  const [state, setState] = useState<"idle" | "listening" | "done" | "unavailable" | "denied">("idle");
  const [ok, setOk] = useState<boolean[] | null>(null);
  const heard = useRef("");
  const subs = useRef<{ remove: () => void }[]>([]);
  const words = (verses ?? []).flatMap(wordsOf).map((w) => w.text_uthmani);

  useEffect(() => () => { subs.current.forEach((s) => s.remove()); try { speech()?.ExpoSpeechRecognitionModule.abort(); } catch { /* not running */ } }, []);
  useEffect(() => { setOk(null); setState("idle"); }, [verses]);

  const start = async () => {
    const m = speech()?.ExpoSpeechRecognitionModule;
    try {
      if (!m || !m.isRecognitionAvailable() || !m.supportsOnDeviceRecognition()) { setState("unavailable"); return; }
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setState("denied"); return; }
      heard.current = ""; setOk(null);
      subs.current.forEach((s) => s.remove());
      subs.current = [
        m.addListener("result", (e) => { heard.current = e.results[0]?.transcript ?? heard.current; setOk(align(words, heard.current).ok); }),
        m.addListener("end", () => setState((s) => (s === "listening" ? "done" : s))),
        m.addListener("error", () => setState("done")),
      ];
      m.start({ lang: "ar-SA", interimResults: true, continuous: true, requiresOnDeviceRecognition: true, addsPunctuation: false });
      setState("listening");
    } catch { setState("unavailable"); }
  };
  const stop = () => { try { speech()?.ExpoSpeechRecognitionModule.stop(); } catch { /* ended */ } setState("done"); };
  const score = ok && words.length ? ok.filter(Boolean).length / words.length : 0;
  return { state, ok, words, score, passed: score >= PASS, start, stop };
}
