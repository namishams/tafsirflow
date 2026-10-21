import { useCallback, useEffect, useRef, useState } from "react";
import * as Speech from "expo-speech";
import { announceAudio, ensureAudioSession, stopClips, voiceActivity } from "./audio";

// The website lets the device's Arabic voice (speechSynthesis) say a letter or a syllable where the device has one –
// a pronunciation helper, not recitation; without an Arabic voice the buttons are simply not shown. Same here with
// expo-speech: an installed voice whose language starts with "ar" (enhanced quality first), rate 0.7, the previous
// utterance stopped first. Real recordings (Quran.com word audio, verse audio) do not depend on this.
//
// The voice is looked up once per app start and kept, so every card knows at once whether it can speak (no button
// that appears a moment later, no lesson built "without voice" because the list was not there yet). Speech uses the
// app's audio session, so it gets the playback category first: otherwise the ring/silent switch mutes it.

let lookup: Promise<Speech.Voice | null> | null = null;
/** undefined until the first lookup finished */
let found: Speech.Voice | null | undefined;
const pick = (vs: Speech.Voice[]) => {
  const ar = vs.filter((v) => v.language.toLowerCase().startsWith("ar"));
  return ar.find((v) => String(v.quality) === "Enhanced") ?? ar[0] ?? null;
};
export function findArabicVoice(): Promise<Speech.Voice | null> {
  lookup ??= Speech.getAvailableVoicesAsync()
    .then((vs) => {
      found = pick(vs);
      // Android lists its voices only once the speech engine is bound: ask again a little later
      if (!found) setTimeout(() => { lookup = null; }, 3000);
      return found;
    })
    .catch(() => { found = null; lookup = null; return null; });
  return lookup;
}
/** the voice lookup, but never longer than `ms` */
export const arabicVoiceWithin = (ms: number) =>
  Promise.race([findArabicVoice(), new Promise<null>((r) => setTimeout(() => r(null), ms))]).then((v) => v ?? found ?? null);

let utterance = 0;
/** says Arabic text with the device voice (stops a recording first); false when the device has no Arabic voice */
export function speakArabic(text: string, cb: { onStart?: () => void; onEnd?: () => void } = {}): boolean {
  const v = found;
  if (!v || !text) return false;
  const my = ++utterance;
  stopClips();
  announceAudio();
  // the previous utterance is stopped first (only when one is running: the extra native call costs time)
  const before = voiceActivity.busy ? Speech.stop().catch(() => undefined) : undefined;
  void ensureAudioSession()
    .catch(() => undefined)
    .then(() => before)
    .then(() => {
      if (my !== utterance) { cb.onEnd?.(); return; } // a newer text was asked for meanwhile
      const end = () => { if (my === utterance) voiceActivity.busy = false; cb.onEnd?.(); };
      voiceActivity.busy = true;
      Speech.speak(text, { voice: v.identifier, language: v.language, rate: 0.7, onStart: cb.onStart, onDone: end, onStopped: end, onError: end });
    });
  return true;
}

export type VoiceState = "idle" | "starting" | "speaking";
export function useArabicVoice(): { canSpeak: boolean; ready: boolean; state: VoiceState; speak: (text: string) => void } {
  const [voice, setVoice] = useState<Speech.Voice | null>(found ?? null);
  const [ready, setReady] = useState(found !== undefined);
  const [state, setState] = useState<VoiceState>("idle");
  const alive = useRef(true);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    alive.current = true;
    // the playback category is set while the card is shown, so the first tap does not wait for it (it does not start
    // the session, so nothing else is interrupted)
    void ensureAudioSession();
    void findArabicVoice().then((v) => { if (alive.current) { setVoice(v); setReady(true); } });
    return () => { alive.current = false; if (timer.current) clearTimeout(timer.current); };
  }, []);
  const speak = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current);
    const end = () => {
      if (timer.current) { clearTimeout(timer.current); timer.current = null; }
      if (alive.current) setState("idle");
    };
    if (!speakArabic(text, { onStart: () => { if (alive.current) setState("speaking"); }, onEnd: end })) return;
    setState("starting");
    // iOS reports no speech errors: the button is never busy for longer than the text could take
    timer.current = setTimeout(end, 3000 + text.length * 200);
  }, []);
  return { canSpeak: !!voice, ready, state, speak };
}
