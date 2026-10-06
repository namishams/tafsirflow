"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { IconClose, IconNext, IconPause, IconPlay } from "./Icons";
import { AUDIO_BASE, RECITERS, getChapters, getReciters, getResources, getVerses, pickTranslation, reciterName, type Chapter, type Reciter, type Verse } from "@/lib/quran";
import { countOf } from "@/lib/counts";
import { JUZ_START, indexOf, keyAt } from "@/lib/quranIndex";
import { readJSON, writeJSON } from "@/lib/storage";
import * as vp from "@/lib/versePlayback";
import { adhanList, adhanUrl, pickAdhan, type AdhanFile } from "@/lib/adhan";
import { CITIES, PRAYERS, dayFor, type Prayer, type Spot } from "@/lib/prayer";

// Adhan recordings are placed on the server by the owner (scripts/install-adhan.sh) – only recordings with a clear licence
type AdhanMode = "off" | "makkah" | "dubai" | "mine";

type Mode = "full" | "range" | "single" | "random" | "list" | "juzday";
// mix: a different (random) reciter for every surah
type Station = { id: string; mode: Mode; from: number; to: number; list?: number[]; mix?: boolean; group: "main" | "surah" | "theme" | "mix" };
type Pos = { s: number; v: number };

export const STATIONS: Station[] = [
  { id: "quran", mode: "full", from: 1, to: 114, group: "main" },
  { id: "quranmix", mode: "full", from: 1, to: 114, mix: true, group: "mix" },
  { id: "random", mode: "random", from: 1, to: 114, group: "main" },
  { id: "randommix", mode: "random", from: 1, to: 114, mix: true, group: "mix" },
  { id: "juzamma", mode: "range", from: 78, to: 114, group: "main" },
  { id: "juzammamix", mode: "range", from: 78, to: 114, mix: true, group: "mix" },
  { id: "tabarak", mode: "range", from: 67, to: 77, group: "main" },
  { id: "juzday", mode: "juzday", from: 1, to: 114, group: "main" },
  { id: "juz28", mode: "range", from: 58, to: 66, group: "main" },
  { id: "kids", mode: "list", from: 1, to: 1, list: [1, 114, 113, 112, 111, 110, 109, 108, 107, 106, 105, 104, 103, 102, 101, 100, 99, 97, 95, 94, 93], group: "theme" },
  { id: "night", mode: "list", from: 32, to: 32, list: [32, 67, 112, 113, 114], group: "theme" },
  { id: "friday", mode: "list", from: 18, to: 18, list: [18, 62, 63, 87, 88], group: "theme" },
  { id: "prophets", mode: "list", from: 12, to: 12, list: [12, 19, 20, 21, 28, 71], group: "theme" },
  { id: "beloved", mode: "list", from: 36, to: 36, list: [36, 55, 56, 67, 18, 32, 48], group: "theme" },
  { id: "dhikr", mode: "list", from: 1, to: 1, list: [1, 2, 112, 113, 114], group: "theme" },
  // the early surahs in the order of revelation of the widespread Egyptian (Azhar) count
  { id: "revelation", mode: "list", from: 96, to: 96, list: [96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108, 102, 107, 109, 105, 113, 114, 112], group: "theme" },
  { id: "ramadan", mode: "list", from: 2, to: 2, list: [2, 97, 44], group: "theme" },
  { id: "comfort", mode: "list", from: 93, to: 93, list: [93, 94, 12], group: "theme" },
  { id: "kahf", mode: "single", from: 18, to: 18, group: "surah" },
  { id: "yasin", mode: "single", from: 36, to: 36, group: "surah" },
  { id: "rahman", mode: "single", from: 55, to: 55, group: "surah" },
  { id: "waqiah", mode: "single", from: 56, to: 56, group: "surah" },
  { id: "mulk", mode: "single", from: 67, to: 67, group: "surah" },
  { id: "baqarah", mode: "single", from: 2, to: 2, group: "surah" },
  { id: "maryam", mode: "single", from: 19, to: 19, group: "surah" },
  { id: "yusuf", mode: "single", from: 12, to: 12, group: "surah" },
  { id: "fath", mode: "single", from: 48, to: 48, group: "surah" },
  { id: "hujurat", mode: "single", from: 49, to: 49, group: "surah" },
  { id: "luqman", mode: "single", from: 31, to: 31, group: "surah" },
  { id: "insan", mode: "single", from: 76, to: 76, group: "surah" },
  { id: "muzzammil", mode: "single", from: 73, to: 73, group: "surah" },
  { id: "hashr", mode: "single", from: 59, to: 59, group: "surah" },
  { id: "taha", mode: "single", from: 20, to: 20, group: "surah" },
  { id: "sajdah", mode: "single", from: 32, to: 32, group: "surah" },
];

const pad = (n: number) => String(n).padStart(3, "0");
const urlOf = (r: Reciter, p: Pos) => `${AUDIO_BASE}/${r.folder}/${pad(p.s)}${pad(p.v)}.mp3`;
const randSurah = () => 1 + Math.floor(Math.random() * 114);

// the station never ends: after the last surah it starts again (or picks the next random surah)
// "Juz of the day": every day another of the 30 parts – in 30 days once through the Quran
function juzToday(): [Pos, Pos] {
  const j = Math.floor(Date.now() / 86400000) % 30;
  const [s, v] = JUZ_START[j].split(":").map(Number);
  const end = j < 29 ? keyAt(indexOf(...(JUZ_START[j + 1].split(":").map(Number) as [number, number])) - 1) : { s: 114, v: 6 };
  return [{ s, v }, end];
}
function nextPos(p: Pos, st: Station): Pos {
  if (st.mode === "juzday") { const [a, b] = juzToday(); if (p.s === b.s && p.v === b.v) return a; }
  if (p.v < countOf(p.s)) return { s: p.s, v: p.v + 1 };
  if (st.mode === "random") return { s: randSurah(), v: 1 };
  if (st.mode === "single") return { s: st.from, v: 1 };
  if (st.mode === "list" && st.list) { const i = st.list.indexOf(p.s); return { s: st.list[(i + 1) % st.list.length], v: 1 }; }
  return { s: p.s >= st.to ? st.from : p.s + 1, v: 1 };
}
const startOf = (st: Station): Pos => (st.mode === "juzday" ? juzToday()[0] : { s: st.mode === "random" ? randSurah() : st.mode === "list" && st.list ? st.list[0] : st.from, v: 1 });

function useEngine() {
  const t = useTranslations("radio");
  const locale = useLocale();
  const a = useRef<HTMLAudioElement[]>([]);
  const live = useRef(0); // index of the audio element that is audible
  const pos = useRef<Pos>({ s: 1, v: 1 });
  const stRef = useRef<Station>(STATIONS[0]);

  const [station, setStation] = useState<Station>(STATIONS[0]);
  const [reciters, setReciters] = useState<Reciter[]>(RECITERS);
  const [folder, setFolder] = useState(RECITERS[0].folder);
  const [playing, setPlaying] = useState(false);
  const [now, setNow] = useState<Pos>({ s: 1, v: 1 });
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [tid, setTid] = useState<number | null>(null);
  const [showText, setShowText] = useState(true);
  const [sleepLeft, setSleepLeft] = useState(0);
  const adhanEl = useRef<HTMLAudioElement>(null);
  const fired = useRef(new Set<string>());
  const [adhanMode, setAdhanMode] = useState<AdhanMode>("makkah");
  const [adhanFiles, setAdhanFiles] = useState<AdhanFile[]>([]);
  const [adhanCredit, setAdhanCredit] = useState("");
  const [voice, setVoiceState] = useState<string>("random");
  const [banner, setBanner] = useState<Prayer | null>(null);
  const [started, setStarted] = useState(false);
  const [vol, setVol] = useState(1);
  const [history, setHistory] = useState<Pos[]>([]);
  const startedRef = useRef(false);
  const errors = useRef(0); // missing files are skipped so the station keeps running
  const reciter = reciters.find((r) => r.folder === folder) ?? reciters[0];
  const reciterRef = useRef(reciter);
  reciterRef.current = reciter;
  const recitersRef = useRef(reciters);
  recitersRef.current = reciters;
  const [mix, setMixState] = useState(false); // mix voices on every station
  const mixRef = useRef(false);
  mixRef.current = mix;
  const setMix = (v: boolean) => { setMixState(v); writeJSON("tf:radio-mix", v, true); };

  useEffect(() => {
    getChapters(locale).then(setChapters).catch(() => undefined);
    getReciters().then((l) => { setReciters(l); const s = readJSON<string>("tf:reciter", ""); if (s && l.some((r) => r.folder === s)) setFolder(s); });
    getResources().then((r) => setTid(pickTranslation(locale, r.translations))).catch(() => setTid(20));
  }, [locale]);

  useEffect(() => {
    const sid = readJSON<string>("tf:radio-station", "");
    const st = STATIONS.find((s) => s.id === sid);
    if (st) { stRef.current = st; setStation(st); }
    setVol(readJSON<number>("tf:radio-vol", 1));
    setMixState(readJSON<boolean>("tf:radio-mix", false));
  }, []);
  useEffect(() => { a.current.forEach((e) => { if (e) e.volume = vol; }); }, [vol]);

  useEffect(() => {
    setAdhanMode(readJSON<AdhanMode>("tf:adhan", "makkah"));
    setVoiceState(readJSON<string>("tf:adhanVoice", "random"));
    adhanList().then(setAdhanFiles);
  }, []);

  // Adhan at prayer time: pause the recitation, play the call to prayer, then continue
  useEffect(() => {
    if (adhanMode === "off" || !started) return;
    const spot: Spot | undefined = adhanMode === "mine" ? readJSON<Spot | null>("tf:myspot", null) ?? undefined : CITIES.find((c) => c.id === adhanMode);
    if (!spot) return;
    const id = setInterval(() => {
      const now = new Date();
      const day = dayFor(spot, now);
      for (const p of PRAYERS) {
        if (p === "sunrise") continue;
        const at = day.times[p].getTime();
        const key = `${spot.id}-${day.times[p].toDateString()}-${p}`;
        if (now.getTime() >= at && now.getTime() - at < 90_000 && !fired.current.has(key)) {
          fired.current.add(key);
          const cur = a.current[live.current];
          const resume = !!cur && !cur.paused;
          const pick = pickAdhan(voice, adhanFiles); // "random": a different muezzin each time
          const file = pick ? adhanUrl(pick.id) : null;
          setAdhanCredit(pick ? `${pick.label}${pick.credit ? ` · ${pick.credit}` : ""}` : "");
          setBanner(p);
          const done = () => { setBanner(null); if (resume) cur.play().catch(() => undefined); };
          if (file && adhanEl.current) {
            if (resume) cur.pause();
            adhanEl.current.src = file;
            adhanEl.current.onended = done;
            adhanEl.current.play().catch(done);
          } else setTimeout(done, 15_000); // no recording installed: show the notice only
        }
      }
    }, 1000);
    return () => clearInterval(id);
  }, [adhanMode, adhanFiles, started, voice]);

  // text of the surah on air
  useEffect(() => {
    if (tid === null) return;
    let off = false;
    getVerses(now.s, locale, reciterRef.current, tid).then((v) => { if (!off) setVerses(v); }).catch(() => undefined);
    return () => { off = true; };
  }, [now.s, locale, tid]);

  const prepare = useCallback((el: HTMLAudioElement, p: Pos) => { el.src = urlOf(reciterRef.current, p); el.load(); }, []);

  const meta = useCallback((p: Pos) => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ch = chapters.find((c) => c.id === p.s);
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${ch?.name_simple ?? `Surah ${p.s}`} · ${p.v}`, artist: reciterName(reciterRef.current, locale), album: "Quran Masterclass" });
  }, [chapters, locale]);

  const start = useCallback((p: Pos, autoplay = true) => {
    pos.current = p; setNow(p);
    startedRef.current = true; setStarted(true);
    setHistory((h) => (h[0]?.s === p.s && h[0]?.v === p.v ? h : [p, ...h].slice(0, 6)));
    window.dispatchEvent(new Event("tf-radio-start"));
    const cur = a.current[live.current], idle = a.current[1 - live.current];
    cur.src = urlOf(reciterRef.current, p); cur.load();
    prepare(idle, nextPos(p, stRef.current));
    meta(p);
    if (autoplay) cur.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [meta, prepare]);

  // gapless hand-over: the idle element already holds the next verse
  const advance = useCallback(() => {
    const next = nextPos(pos.current, stRef.current);
    // mixed stations: a new surah gets a new voice (a random one of the installed reciters)
    if (next.s !== pos.current.s && (stRef.current.mix || mixRef.current) && recitersRef.current.length > 1) {
      const others = recitersRef.current.filter((r) => r.folder !== reciterRef.current.folder);
      const pick = others[Math.floor(Math.random() * others.length)];
      reciterRef.current = pick; setFolder(pick.folder);
      start(next);
      return;
    }
    pos.current = next; setNow(next);
    setHistory((h) => [next, ...h].slice(0, 6));
    const old = a.current[live.current];
    live.current = 1 - live.current;
    const cur = a.current[live.current];
    cur.play().then(() => setPlaying(true)).catch(() => {
      // the preloaded file is missing: skip it so the station keeps running
      if (cur.error && errors.current < 8) { errors.current += 1; setTimeout(() => advanceRef.current(), 600); } else setPlaying(false);
    });
    prepare(old, nextPos(next, stRef.current));
    meta(next);
  }, [meta, prepare]); // eslint-disable-line react-hooks/exhaustive-deps
  const advanceRef = useRef(advance);
  advanceRef.current = advance;

  const chooseStation = (st: Station) => { stRef.current = st; setStation(st); writeJSON("tf:radio-station", st.id, true); start(startOf(st)); };
  const toggle = () => {
    const cur = a.current[live.current];
    if (!cur.src) { start(startOf(stRef.current)); return; }
    if (cur.paused) { window.dispatchEvent(new Event("tf-radio-start")); cur.play().then(() => setPlaying(true)).catch(() => undefined); } else { cur.pause(); setPlaying(false); }
  };
  const stop = () => { a.current.forEach((e) => { e.pause(); e.removeAttribute("src"); e.load(); }); startedRef.current = false; setStarted(false); setPlaying(false); setSleepLeft(0); setBanner(null); };
  const setVolume = (v: number) => { setVol(v); writeJSON("tf:radio-vol", v, true); };
  const skipVerse = () => advance();
  const skipSurah = () => { const p = pos.current; start(stRef.current.mode === "random" ? { s: randSurah(), v: 1 } : nextPos({ s: p.s, v: countOf(p.s) }, stRef.current)); };
  const prevVerse = () => { const p = pos.current; start(p.v > 1 ? { s: p.s, v: p.v - 1 } : p); };

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => toggle());
    navigator.mediaSession.setActionHandler("pause", () => toggle());
    navigator.mediaSession.setActionHandler("nexttrack", () => skipVerse());
    navigator.mediaSession.setActionHandler("previoustrack", () => prevVerse());
  });

  // single voice on the whole site: whatever else starts to play (verse player, verse of the day, prayer-page adhan,
  // lesson audio) pauses the radio – and when the radio starts, everything else goes quiet
  const ours = (el: EventTarget | null) => el === adhanEl.current || a.current.includes(el as HTMLAudioElement);
  const quietOthers = () => {
    window.dispatchEvent(new Event("tf-radio-start"));
    document.querySelectorAll("audio, video").forEach((m) => { if (!ours(m) && !(m as HTMLMediaElement).paused) (m as HTMLMediaElement).pause(); });
  };
  useEffect(() => {
    const off = () => { const cur = a.current[live.current]; if (cur && !cur.paused) cur.pause(); };
    const onPlay = (e: Event) => { if (e.target instanceof HTMLMediaElement && !ours(e.target)) off(); };
    window.addEventListener("tf-audio-start", off);
    document.addEventListener("play", onPlay, true); // media events don't bubble, so listen in the capture phase
    return () => { window.removeEventListener("tf-audio-start", off); document.removeEventListener("play", onPlay, true); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // send the radio to AirPlay (Safari / iOS) or Chromecast and other remote devices (Remote Playback API, Chrome / Android)
  const [castable, setCastable] = useState({ airplay: false, cast: false, share: false });
  useEffect(() => {
    setCastable({
      airplay: "WebKitPlaybackTargetAvailabilityEvent" in window,
      cast: "remote" in HTMLMediaElement.prototype,
      share: typeof navigator.share === "function",
    });
  }, []);
  const airplay = () => { const el = a.current[live.current] as HTMLAudioElement & { webkitShowPlaybackTargetPicker?: () => void }; el?.webkitShowPlaybackTargetPicker?.(); };
  const cast = () => { const el = a.current[live.current] as HTMLAudioElement & { remote?: { prompt: () => Promise<void> } }; el?.remote?.prompt().catch(() => undefined); };
  const shareRadio = async (title: string) => {
    const url = window.location.href;
    if (navigator.share) { await navigator.share({ title, url }).catch(() => undefined); return; }
    await navigator.clipboard?.writeText(url).catch(() => undefined);
  };

  // sleep timer
  useEffect(() => {
    if (sleepLeft <= 0) return;
    const id = setInterval(() => setSleepLeft((s) => { if (s <= 1) { a.current.forEach((e) => e.pause()); setPlaying(false); return 0; } return s - 1; }), 1000);
    return () => clearInterval(id);
  }, [sleepLeft]);

  const chapter = chapters.find((c) => c.id === now.s);
  const verse = verses.find((x) => x.verse_number === now.v);
  const sleepOptions = useMemo(() => [15, 30, 60], []);
  const stationName = (id: string) => t(`st_${id}`);
  const upNext = nextPos(now, station);
  const setVoice = (v: string) => { setVoiceState(v); writeJSON("tf:adhanVoice", v, true); };
  const testAdhan = () => { const pick = pickAdhan(voice, adhanFiles); if (pick && adhanEl.current) { setAdhanCredit(`${pick.label}${pick.credit ? ` · ${pick.credit}` : ""}`); adhanEl.current.src = adhanUrl(pick.id); adhanEl.current.onended = null; void adhanEl.current.play(); } };
  const stopAdhan = () => adhanEl.current?.pause();
  const setAdhan = (v: AdhanMode) => { setAdhanMode(v); writeJSON("tf:adhan", v, true); };
  const changeReciter = (f: string) => { setFolder(f); writeJSON("tf:reciter", f, true); setTimeout(() => start(pos.current, playing), 0); };

  const audios = (
    <>
      <audio ref={adhanEl} preload="none" />
      {[0, 1].map((i) => (
        <audio key={i} ref={(el) => { if (el) a.current[i] = el; }} preload="auto" x-webkit-airplay="allow" onEnded={() => { errors.current = 0; if (i === live.current) advance(); }}
          onError={() => { if (i !== live.current || !startedRef.current) return; errors.current += 1; if (errors.current <= 8) setTimeout(() => advance(), 600); else { setPlaying(false); errors.current = 0; } }} onPause={() => { if (i === live.current && !a.current[i].ended) setPlaying(false); }} onPlay={() => { if (i === live.current) { setPlaying(true); quietOthers(); } }} />
      ))}
    </>
  );
  return { mix, setMix, station, playing, started, now, chapter, verse, upNext, history, chapters, reciter, reciters, changeReciter, sleepLeft, setSleepLeft, sleepOptions, adhanMode, setAdhanMode: setAdhan, adhanFiles, adhanCredit, voice, setVoice, testAdhan, stopAdhan, banner, showText, setShowText, vol, setVolume, chooseStation, toggle, skipVerse, skipSurah, prevVerse, stop, stationName, audios, castable, airplay, cast, shareRadio };
}

type Radio = ReturnType<typeof useEngine>;
const Ctx = createContext<Radio | null>(null);
export const useRadio = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("RadioProvider missing");
  return c;
};

// The radio lives above every page, so it keeps playing while the visitor browses (like SoundCloud)
export function RadioProvider({ children }: { children: React.ReactNode }) {
  const r = useEngine();
  const path = usePathname();
  const v = useSyncExternalStore(vp.subscribe, vp.getSnapshot, () => vp.serverSnapshot);
  const verseOn = !!v.session && !v.attached;
  // one player at a time: on a surah page the page's own verse player is in charge, so a paused radio stays out of sight
  const radioOn = r.started && !path.startsWith("/radio") && (r.playing || !path.startsWith("/surah"));
  // which voice the mini bar shows: whatever is playing, otherwise the radio, otherwise the verse session
  const kind: "verse" | "radio" | null = verseOn && v.playing ? "verse" : radioOn && r.playing ? "radio" : radioOn ? "radio" : verseOn ? "verse" : null;
  useEffect(() => {
    document.body.style.paddingBottom = kind ? "4.5rem" : "";
    return () => { document.body.style.paddingBottom = ""; };
  }, [kind]);
  return (
    <Ctx.Provider value={r}>
      {children}
      {r.audios}
      {kind === "radio" && <MiniBar />}
      {kind === "verse" && v.session && <VerseMini s={v.session} playing={v.playing} />}
    </Ctx.Provider>
  );
}

// Every page of the (app) layout carries the phone tab bar; only the home page, account and admin do not
const hasTabBar = (path: string) => path !== "/" && !["/account", "/admin"].some((p) => path === p || path.startsWith(`${p}/`));

// Persistent mini player: sits above the tab bar on phones, on top of the verse player's dock on surah pages
function MiniBar() {
  const r = useRadio();
  const t = useTranslations("radio");
  const locale = useLocale();
  const path = usePathname();
  const withTabs = hasTabBar(path);
  const onSurah = path.startsWith("/surah");
  const pos = onSurah ? "top-[3.75rem]" : withTabs ? "bottom-[4.25rem] lg:bottom-3" : "bottom-3";
  return (
    <div className={`fixed inset-x-0 z-[45] px-3 ${pos}`}>
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-lg border border-line bg-surface p-2 pe-3 shadow-lg">
        <Link href="/radio" className="flex min-w-0 flex-1 items-center gap-3" aria-label={t("openRadio")}>
          <span className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ink text-bg ${r.playing ? "" : "opacity-70"}`}>
            <span className="text-[10px] font-extrabold tracking-wider">{locale === "ar" ? (r.playing ? "مباشر" : "إذاعة") : r.playing ? "LIVE" : "FM"}</span>
            {r.playing && <span className="absolute -end-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 ring-2 ring-surface" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold">{r.chapter ? `${r.chapter.id}. ${r.chapter.name_simple}` : `${r.now.s}`} · {r.now.v}</span>
            <span className="block truncate text-xs text-muted">{r.stationName(r.station.id)} · {reciterName(r.reciter, locale)}</span>
          </span>
        </Link>
        <button onClick={r.toggle} aria-label={r.playing ? t("pause") : t("play")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white">{r.playing ? <IconPause /> : <IconPlay />}</button>
        <button onClick={r.skipVerse} aria-label={t("nextVerse")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line"><IconNext /></button>
        <button onClick={r.stop} aria-label={t("stop")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:text-ink"><IconClose /></button>
      </div>
    </div>
  );
}

// Mini bar for a verse session that keeps playing after the visitor left the surah page
function VerseMini({ s, playing }: { s: vp.Session; playing: boolean }) {
  const t = useTranslations("radio");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const path = usePathname();
  const withTabs = hasTabBar(path);
  const pos = withTabs ? "bottom-[4.25rem] lg:bottom-3" : "bottom-3";
  const a = vp.getAudio();
  return (
    <div className={`fixed inset-x-0 z-[45] px-3 ${pos}`}>
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-lg border border-line bg-surface p-2 pe-3 shadow-lg">
        <Link href={`/surah/${s.chapterId}?v=${s.idx + 1}`} className="flex min-w-0 flex-1 items-center gap-3" aria-label={t("openSurah")}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent-soft text-accent"><span className="text-[11px] font-extrabold">{s.chapterId}</span></span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-bold">{s.chapterName} · {s.idx + 1}</span>
            <span className="block truncate text-xs text-muted">{reciterName({ name: s.reciterName }, locale)}</span>
          </span>
        </Link>
        <button onClick={() => (playing ? a.pause() : void a.play())} aria-label={playing ? t("pause") : t("play")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-white">{playing ? <IconPause /> : <IconPlay />}</button>
        <button onClick={() => vp.step(1)} aria-label={t("nextVerse")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line"><IconNext /></button>
        <button onClick={vp.stop} aria-label={tn("close")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted hover:text-ink"><IconClose /></button>
      </div>
    </div>
  );
}
