import { useEffect, useState } from "react";
import * as Speech from "expo-speech";

// The website lets the device's Arabic voice (speechSynthesis) say a letter or a syllable where the device has one –
// a pronunciation helper, not recitation; without an Arabic voice the buttons are simply not shown. Same here with
// expo-speech: the first installed voice whose language starts with "ar", rate 0.7, the previous utterance stopped
// first. Real recordings (Quran.com word audio, verse audio) do not depend on this.

let arabicVoice: Promise<Speech.Voice | null> | null = null;
function findArabicVoice(): Promise<Speech.Voice | null> {
  arabicVoice ??= Speech.getAvailableVoicesAsync()
    .then((vs) => vs.find((v) => v.language.toLowerCase().startsWith("ar")) ?? null)
    .catch(() => { arabicVoice = null; return null; });
  return arabicVoice;
}

export function useArabicVoice(): { canSpeak: boolean; speak: (text: string) => void } {
  const [voice, setVoice] = useState<Speech.Voice | null>(null);
  useEffect(() => {
    let alive = true;
    void findArabicVoice().then((v) => { if (alive) setVoice(v); });
    return () => { alive = false; };
  }, []);
  const speak = (text: string) => {
    if (!voice) return;
    void Speech.stop().catch(() => undefined);
    Speech.speak(text, { voice: voice.identifier, language: voice.language, rate: 0.7 });
  };
  return { canSpeak: !!voice, speak };
}
