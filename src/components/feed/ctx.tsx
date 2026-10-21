"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AUDIO_BASE, RECITERS } from "@/lib/quran";
import { readJSON, useStored, writeJSON } from "@/lib/learn/store";
import { statLike, statListen, statSave, statVerse } from "@/lib/learn/feed/statsStore";
import type { WebCard, WebVerse } from "@/lib/feedWeb/types";
import type { Story } from "@/lib/learn/prophet/stories";
import { useShareSheet } from "@/components/share/ShareButtons";
import { specForCard, specForStory, specForVerse } from "@/lib/share/specs";
import { useFeedTexts } from "@/lib/feedWeb/useTexts";

// What every feed card shares: the page language, the share sheet, the one recitation player of the feed (a single
// <audio>; the radio pauses when a verse plays), the local likes and saves ("tf:feed-likes", "tf:bookmarks": the
// app's keys, so a like or save on the website is the same as in the app on this account's sync).

const LIKES = "tf:feed-likes";
const MARKS = "tf:bookmarks";
const MUTE_KEY = "qmc.home-muted"; // Home: muted until the speaker is switched on
const REELS_MUTE_KEY = "qmc.feed-muted"; // Reels: the recitation plays unless it was switched off
export const verseUrl = (key: string, folder?: string) => {
  const [s, v] = key.split(":").map(Number);
  const f = `${String(s).padStart(3, "0")}${String(v).padStart(3, "0")}.mp3`;
  return `${AUDIO_BASE}/${folder ?? readFolder()}/${f}`;
};
function readFolder() {
  const f = readJSON<string>("tf:reciter", "");
  return /^[A-Za-z0-9_.\-]{3,80}$/.test(f) ? f : RECITERS[0].folder;
}

export type Player = { key: string; playing: boolean; ended: boolean; pos: number; dur: number };
type Ctx = {
  locale: string;
  muted: boolean;
  toggleMute: () => void;
  /** the Reels view has its own switch (sound on by default) */
  mutedReels: boolean;
  toggleMuteReels: () => void;
  player: Player;
  /** play a verse (stops the radio); `onEnd` runs when the recitation ends */
  play: (key: string, onEnd?: () => void) => void;
  pause: () => void;
  stop: () => void;
  shareCard: (c: WebCard, quick?: boolean) => void;
  shareStory: (s: Story, quick?: boolean) => void;
  shareVerse: (v: WebVerse, quick?: boolean) => void;
  liked: (id: string) => boolean;
  toggleLike: (id: string) => void;
  saved: (key: string) => boolean;
  toggleSave: (key: string) => void;
};
const FeedCtx = createContext<Ctx | null>(null);
export const useFeed = () => {
  const c = useContext(FeedCtx);
  if (!c) throw new Error("FeedProvider missing");
  return c;
};

const IDLE: Player = { key: "", playing: false, ended: false, pos: 0, dur: 0 };

export function FeedProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const texts = useFeedTexts();
  const sh = useShareSheet();
  const audio = useRef<HTMLAudioElement | null>(null);
  const endRef = useRef<(() => void) | null>(null);
  const [player, setPlayer] = useState<Player>(IDLE);
  const [muted, setMuted] = useState(true);
  const [mutedReels, setMutedReels] = useState(false);
  useEffect(() => { setMuted(readJSON<boolean>(MUTE_KEY, true)); setMutedReels(readJSON<boolean>(REELS_MUTE_KEY, false)); }, []);

  const likes = useStored<string[]>(LIKES, []);
  const marks = useStored<string[]>(MARKS, []);

  const el = useCallback(() => {
    if (audio.current) return audio.current;
    const a = new Audio();
    a.preload = "auto";
    a.addEventListener("timeupdate", () => setPlayer((p) => ({ ...p, pos: a.currentTime * 1000, dur: (a.duration || 0) * 1000 })));
    a.addEventListener("play", () => setPlayer((p) => ({ ...p, playing: true, ended: false })));
    a.addEventListener("pause", () => setPlayer((p) => ({ ...p, playing: false })));
    a.addEventListener("ended", () => { setPlayer((p) => ({ ...p, playing: false, ended: true })); const f = endRef.current; endRef.current = null; f?.(); });
    audio.current = a;
    return a;
  }, []);
  useEffect(() => {
    // the radio (or another player) started: the feed goes quiet
    const quiet = () => { if (audio.current && !audio.current.paused) audio.current.pause(); };
    window.addEventListener("tf-radio-start", quiet);
    return () => { window.removeEventListener("tf-radio-start", quiet); audio.current?.pause(); audio.current = null; };
  }, []);

  const heardAt = useRef(0);
  const play = useCallback((key: string, onEnd?: () => void) => {
    const a = el();
    window.dispatchEvent(new Event("tf-audio-start")); // one voice on the site: the radio pauses
    endRef.current = onEnd ?? null;
    const url = verseUrl(key);
    if (!a.src.endsWith(url)) {
      a.src = url;
      a.onerror = () => { if (!a.src.includes(RECITERS[0].folder)) { a.src = verseUrl(key, RECITERS[0].folder); void a.play().catch(() => undefined); } };
    }
    setPlayer({ key, playing: false, ended: false, pos: 0, dur: 0 });
    heardAt.current = Date.now();
    void a.play().then(() => { window.setTimeout(() => { const c = audio.current; if (c && !c.paused && c.src.endsWith(verseUrl(key))) statVerse(); }, 4000); }).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el]);
  const pause = useCallback(() => { const a = audio.current; if (a && !a.paused) { statListen(Date.now() - heardAt.current); a.pause(); } }, []);
  const stop = useCallback(() => { const a = audio.current; if (a) { a.pause(); endRef.current = null; } setPlayer(IDLE); }, []);

  const toggleMute = useCallback(() => {
    setMuted((m) => { const n = !m; writeJSON(MUTE_KEY, n, true); if (n) audio.current?.pause(); return n; });
  }, []);

  const toggleMuteReels = useCallback(() => {
    setMutedReels((m) => { const n = !m; writeJSON(REELS_MUTE_KEY, n, true); if (n) audio.current?.pause(); return n; });
  }, []);

  const shareCtx = useMemo(() => ({ locale, texts }), [locale, texts]);
  const shareCard = useCallback((c: WebCard, quick?: boolean) => { const s = specForCard(shareCtx, c); if (s) sh.open(s, quick); }, [shareCtx, sh]);
  const shareStory = useCallback((s: Story, quick?: boolean) => sh.open(specForStory(shareCtx, s), quick), [shareCtx, sh]);
  const shareVerse = useCallback((v: WebVerse, quick?: boolean) => sh.open(specForVerse(shareCtx, v), quick), [shareCtx, sh]);

  const liked = useCallback((id: string) => likes.includes(id), [likes]);
  const toggleLike = useCallback((id: string) => {
    const cur = readJSON<string[]>(LIKES, []);
    if (!cur.includes(id)) statLike();
    writeJSON(LIKES, cur.includes(id) ? cur.filter((k) => k !== id) : [...cur, id].slice(-2000));
  }, []);
  const saved = useCallback((key: string) => marks.includes(key), [marks]);
  const toggleSave = useCallback((key: string) => {
    const cur = readJSON<string[]>(MARKS, []);
    if (!cur.includes(key)) statSave();
    writeJSON(MARKS, cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key]);
  }, []);

  const value = useMemo<Ctx>(() => ({ locale, muted, toggleMute, mutedReels, toggleMuteReels, player, play, pause, stop, shareCard, shareStory, shareVerse, liked, toggleLike, saved, toggleSave }),
    [locale, muted, toggleMute, mutedReels, toggleMuteReels, player, play, pause, stop, shareCard, shareStory, shareVerse, liked, toggleLike, saved, toggleSave]);
  return <FeedCtx.Provider value={value}>{children}{sh.element}</FeedCtx.Provider>;
}
