import { useCallback, useEffect, useRef, useState } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer, type AudioStatus } from "expo-audio";
import { onWebEvent } from "@/lib/webshim";

// One small player per screen (adhan, a Quran dua): play a file, pause, stop. Before it plays it tells the rest of
// the app ("tf-audio-start"), and it pauses when another player starts.
let modeSet = false;
async function ensureMode() {
  if (modeSet) return;
  modeSet = true;
  await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false, interruptionMode: "doNotMix" }).catch(() => { modeSet = false; });
}

export function useSimpleAudio() {
  const player = useRef<AudioPlayer | null>(null);
  const self = useRef(false);
  const [url, setUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stopOthers = () => { if (!self.current) player.current?.pause(); };
    const offA = onWebEvent("tf-audio-start", stopOthers);
    const offR = onWebEvent("tf-radio-start", stopOthers);
    return () => { offA(); offR(); player.current?.remove(); player.current = null; };
  }, []);

  const get = useCallback(() => {
    if (!player.current) {
      const p = createAudioPlayer(null, { updateInterval: 250 });
      p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
        setPlaying(s.playing);
        if (s.isLoaded || s.playing) setLoading(false);
        if (s.didJustFinish) setPlaying(false);
      });
      player.current = p;
    }
    return player.current;
  }, []);

  const play = useCallback((u: string) => {
    void ensureMode();
    self.current = true;
    (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new Event("tf-audio-start"));
    self.current = false;
    const p = get();
    if (url === u && p.isLoaded) { void p.seekTo(0).then(() => p.play()); return; }
    setUrl(u); setLoading(true);
    p.replace({ uri: u });
    p.play();
  }, [get, url]);

  const toggle = useCallback((u: string) => {
    const p = player.current;
    if (p && url === u && playing) { p.pause(); return; }
    if (p && url === u && p.isLoaded && !playing) {
      void ensureMode();
      self.current = true;
      (globalThis as unknown as { window: { dispatchEvent: (e: unknown) => void } }).window.dispatchEvent(new Event("tf-audio-start"));
      self.current = false;
      p.play();
      return;
    }
    play(u);
  }, [play, playing, url]);

  const stop = useCallback(() => { player.current?.pause(); setPlaying(false); }, []);
  return { url, playing, loading, play, toggle, stop };
}
