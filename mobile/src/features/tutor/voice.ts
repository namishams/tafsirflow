import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import { announceAudio, ensureAudioSession, markAudioSessionChanged, stopClips, voiceActivity } from "@/features/coursekit/audio";
import { speakable, voiceLang } from "./next";

// Voice for the tutor in the app (website: src/components/tutor/voice.ts), on the device only:
//   – reading aloud with expo-speech (the system voices of iOS and Android, on the device) in the persona's language;
//     the button shows only when the device has a voice for it. speakable() removes Quran text: verses play from the
//     reciter audio, never from this voice.
//   – asking by voice with expo-speech-recognition and requiresOnDeviceRecognition; where the device cannot recognise
//     on the device, the microphone is not offered. Nothing is sent to a speech service.

type SR = typeof import("expo-speech-recognition");
let sr: SR | null | undefined;
function recognition(): SR | null {
  if (sr === undefined) { try { sr = require("expo-speech-recognition") as SR; } catch { sr = null; } } // eslint-disable-line @typescript-eslint/no-require-imports
  return sr;
}

const voices = new Map<string, Promise<Speech.Voice | null>>();
function voiceFor(lang: string): Promise<Speech.Voice | null> {
  const bcp = voiceLang(lang).toLowerCase();
  if (!voices.has(bcp)) {
    voices.set(bcp, Speech.getAvailableVoicesAsync().then((vs) => {
      const all = vs.filter((v) => v.language.toLowerCase().replace("_", "-").startsWith(bcp.slice(0, 2)));
      const exact = all.filter((v) => v.language.toLowerCase().replace("_", "-") === bcp);
      const pick = (l: Speech.Voice[]) => l.find((v) => String(v.quality) === "Enhanced") ?? l[0] ?? null;
      const v = pick(exact) ?? pick(all);
      if (!v) setTimeout(() => voices.delete(bcp), 3000); // Android binds its engine late
      return v;
    }).catch(() => { voices.delete(bcp); return null; }));
  }
  return voices.get(bcp)!;
}

let current = 0;
/** read an answer aloud; `speaking` is the id being read */
export function useSpeak(lang: string) {
  const [voice, setVoice] = useState<Speech.Voice | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void voiceFor(lang).then((v) => { if (alive) setVoice(v); });
    return () => { alive = false; };
  }, [lang]);
  useEffect(() => () => { if (voiceActivity.busy) void Speech.stop(); }, []);
  const stop = useCallback(() => { current++; void Speech.stop(); voiceActivity.busy = false; setSpeaking(null); }, []);
  const speak = useCallback((id: string, md: string) => {
    if (!voice) return;
    if (speaking === id) { stop(); return; }
    const text = speakable(md, lang);
    if (!text) return;
    const my = ++current;
    stopClips();
    announceAudio();
    setSpeaking(id);
    void Speech.stop().catch(() => undefined)
      .then(() => ensureAudioSession().catch(() => undefined))
      .then(() => {
        if (my !== current) return;
        const end = () => { if (my === current) { voiceActivity.busy = false; setSpeaking(null); } };
        voiceActivity.busy = true;
        Speech.speak(text, { voice: voice.identifier, language: voice.language, rate: 0.97, onDone: end, onStopped: end, onError: end });
      });
  }, [voice, lang, speaking, stop]);
  return { can: !!voice, speaking, speak, stop };
}

/** ask by voice: on-device recognition only; `can` is false where the device cannot recognise locally */
export function useDictation(lang: string, onText: (t: string) => void) {
  const [can, setCan] = useState(false);
  const [listening, setListening] = useState(false);
  const subs = useRef<{ remove: () => void }[]>([]);
  const cb = useRef(onText); cb.current = onText;
  useEffect(() => {
    try {
      const m = recognition()?.ExpoSpeechRecognitionModule;
      setCan(!!m && m.isRecognitionAvailable() && m.supportsOnDeviceRecognition());
    } catch { setCan(false); }
    return () => { subs.current.forEach((s) => s.remove()); subs.current = []; try { recognition()?.ExpoSpeechRecognitionModule.abort(); } catch { /* idle */ } };
  }, []);
  const stop = useCallback(() => { try { recognition()?.ExpoSpeechRecognitionModule.stop(); } catch { /* idle */ } markAudioSessionChanged(); setListening(false); }, []);
  const start = useCallback(async () => {
    const m = recognition()?.ExpoSpeechRecognitionModule;
    if (!m || !can) return;
    try {
      const p = await m.requestPermissionsAsync();
      if (!p.granted) { setCan(false); return; }
      subs.current.forEach((s) => s.remove());
      subs.current = [
        m.addListener("result", (e) => { const t = e.results[0]?.transcript; if (t) cb.current(t); }),
        // recognition leaves the audio session in record mode: the next playback sets it again
        m.addListener("end", () => { markAudioSessionChanged(); setListening(false); }),
        m.addListener("error", () => { markAudioSessionChanged(); setListening(false); }),
      ];
      markAudioSessionChanged();
      m.start({ lang: voiceLang(lang), interimResults: true, continuous: false, requiresOnDeviceRecognition: true, addsPunctuation: true });
      setListening(true);
    } catch { setListening(false); }
  }, [can, lang]);
  return { can, listening, start, stop };
}
