"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { speakable, voiceLang } from "@/lib/tutor/next";

// Voice for the tutor on the website (app: mobile/src/features/tutor/voice.ts), on the device only:
//   – reading aloud with speechSynthesis, and only with a voice the browser marks as local (localService); without one
//     the button is not shown. speakable() removes Quran text: verses play from the reciter, never from this voice.
//   – asking by voice with the Web Speech API only when it recognises on the device (processLocally, checked with
//     SpeechRecognition.available); otherwise the microphone is not offered. Nothing is sent to a speech service.

const localVoice = (lang: string): SpeechSynthesisVoice | null => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const bcp = voiceLang(lang).toLowerCase();
  const vs = window.speechSynthesis.getVoices().filter((v) => v.localService);
  return vs.find((v) => v.lang.toLowerCase() === bcp) ?? vs.find((v) => v.lang.toLowerCase().startsWith(bcp.slice(0, 2))) ?? null;
};

/** read an answer aloud; `speaking` is the id being read */
export function useSpeak(lang: string) {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const look = () => setVoice(localVoice(lang));
    look();
    window.speechSynthesis.addEventListener("voiceschanged", look);
    return () => { window.speechSynthesis.removeEventListener("voiceschanged", look); window.speechSynthesis.cancel(); };
  }, [lang]);
  const stop = useCallback(() => { try { window.speechSynthesis.cancel(); } catch { /* none */ } setSpeaking(null); }, []);
  const speak = useCallback((id: string, md: string) => {
    if (!voice) return;
    const s = window.speechSynthesis;
    s.cancel();
    if (speaking === id) { setSpeaking(null); return; }
    const text = speakable(md, lang);
    if (!text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice; u.lang = voice.lang; u.rate = 0.97;
    u.onend = () => setSpeaking((c) => (c === id ? null : c));
    u.onerror = u.onend;
    setSpeaking(id);
    s.speak(u);
  }, [voice, lang, speaking]);
  return { can: !!voice, speaking, speak, stop };
}

type Rec = {
  lang: string; interimResults: boolean; continuous: boolean; processLocally?: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void; abort: () => void;
};
type RecCtor = { new(): Rec; available?: (o: { langs: string[]; processLocally: boolean }) => Promise<string> };
const recCtor = (): RecCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

/** ask by voice: on-device recognition only; `can` is false where the browser cannot recognise locally */
export function useDictation(lang: string, onText: (t: string) => void) {
  const [can, setCan] = useState(false);
  const [listening, setListening] = useState(false);
  const rec = useRef<Rec | null>(null);
  const cb = useRef(onText); cb.current = onText;
  useEffect(() => {
    const R = recCtor();
    if (!R || typeof R.available !== "function") { setCan(false); return; }
    let alive = true;
    R.available({ langs: [voiceLang(lang)], processLocally: true }).then((r) => { if (alive) setCan(r === "available"); }).catch(() => { if (alive) setCan(false); });
    return () => { alive = false; try { rec.current?.abort(); } catch { /* idle */ } };
  }, [lang]);
  const stop = useCallback(() => { try { rec.current?.stop(); } catch { /* idle */ } setListening(false); }, []);
  const start = useCallback(() => {
    const R = recCtor();
    if (!R || !can) return;
    const r = new R();
    r.lang = voiceLang(lang); r.interimResults = true; r.continuous = false; r.processLocally = true;
    r.onresult = (e) => cb.current(Array.from(e.results).map((x) => x[0]?.transcript ?? "").join(" ").trim());
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    try { r.start(); setListening(true); } catch { setListening(false); }
  }, [can, lang]);
  return { can, listening, start, stop };
}
