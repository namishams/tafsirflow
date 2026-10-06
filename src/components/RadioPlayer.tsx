"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { IconNext, IconPause, IconPlay, IconPrev } from "./Icons";
import { AUDIO_BASE, RECITERS, getChapters, getReciters, getResources, getVerses, pickTranslation, type Chapter, type Reciter, type Verse } from "@/lib/quran";
import { countOf } from "@/lib/counts";
import { readJSON, writeJSON } from "@/lib/storage";
import { CITIES, PRAYERS, dayFor, type Prayer, type Spot } from "@/lib/prayer";

// Adhan recordings are placed on the server by the owner (scripts/install-adhan.sh) – only recordings with a clear licence
const ADHAN = (name: string) => `${AUDIO_BASE}/adhan/${name}.mp3`;
type AdhanMode = "off" | "makkah" | "dubai" | "mine";

type Mode = "full" | "range" | "single" | "random";
type Station = { id: string; mode: Mode; from: number; to: number };
type Pos = { s: number; v: number };

export const STATIONS: Station[] = [
  { id: "quran", mode: "full", from: 1, to: 114 },
  { id: "juzamma", mode: "range", from: 78, to: 114 },
  { id: "kahf", mode: "single", from: 18, to: 18 },
  { id: "yasin", mode: "single", from: 36, to: 36 },
  { id: "rahman", mode: "single", from: 55, to: 55 },
  { id: "mulk", mode: "single", from: 67, to: 67 },
  { id: "random", mode: "random", from: 1, to: 114 },
];

const pad = (n: number) => String(n).padStart(3, "0");
const urlOf = (r: Reciter, p: Pos) => `${AUDIO_BASE}/${r.folder}/${pad(p.s)}${pad(p.v)}.mp3`;
const randSurah = () => 1 + Math.floor(Math.random() * 114);

function nextPos(p: Pos, st: Station): Pos {
  if (p.v < countOf(p.s)) return { s: p.s, v: p.v + 1 };
  if (st.mode === "random") return { s: randSurah(), v: 1 };
  if (st.mode === "single") return { s: st.from, v: 1 };
  return { s: p.s >= st.to ? st.from : p.s + 1, v: 1 };
}
const startOf = (st: Station): Pos => ({ s: st.mode === "random" ? randSurah() : st.from, v: 1 });

export default function RadioPlayer() {
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
  const [adhanFiles, setAdhanFiles] = useState<Record<string, boolean>>({});
  const [adhanCredit, setAdhanCredit] = useState("");
  const [banner, setBanner] = useState<Prayer | null>(null);
  const reciter = reciters.find((r) => r.folder === folder) ?? reciters[0];
  const reciterRef = useRef(reciter);
  reciterRef.current = reciter;

  useEffect(() => {
    getChapters(locale).then(setChapters).catch(() => undefined);
    getReciters().then((l) => { setReciters(l); const s = readJSON<string>("tf:reciter", ""); if (s && l.some((r) => r.folder === s)) setFolder(s); });
    getResources().then((r) => setTid(pickTranslation(locale, r.translations))).catch(() => setTid(20));
  }, [locale]);

  useEffect(() => {
    setAdhanMode(readJSON<AdhanMode>("tf:adhan", "makkah"));
    for (const n of ["makkah", "dubai", "default"]) fetch(ADHAN(n), { method: "HEAD" }).then((r) => setAdhanFiles((f) => ({ ...f, [n]: r.ok }))).catch(() => undefined);
    fetch(`${AUDIO_BASE}/adhan/makkah.credit.txt`).then((r) => (r.ok ? r.text() : "")).then(setAdhanCredit).catch(() => undefined);
  }, []);

  // Adhan at prayer time: pause the recitation, play the call to prayer, then continue
  useEffect(() => {
    if (adhanMode === "off") return;
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
          const file = adhanFiles[spot.id] ? ADHAN(spot.id) : adhanFiles.default ? ADHAN("default") : null;
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
  }, [adhanMode, adhanFiles]);

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
    navigator.mediaSession.metadata = new MediaMetadata({ title: `${ch?.name_simple ?? `Surah ${p.s}`} · ${p.v}`, artist: reciterRef.current.name, album: "Quran Masterclass" });
  }, [chapters]);

  const start = useCallback((p: Pos, autoplay = true) => {
    pos.current = p; setNow(p);
    const cur = a.current[live.current], idle = a.current[1 - live.current];
    cur.src = urlOf(reciterRef.current, p); cur.load();
    prepare(idle, nextPos(p, stRef.current));
    meta(p);
    if (autoplay) cur.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [meta, prepare]);

  // gapless hand-over: the idle element already holds the next verse
  const advance = useCallback(() => {
    const next = nextPos(pos.current, stRef.current);
    pos.current = next; setNow(next);
    const old = a.current[live.current];
    live.current = 1 - live.current;
    const cur = a.current[live.current];
    cur.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    prepare(old, nextPos(next, stRef.current));
    meta(next);
  }, [meta, prepare]);

  const chooseStation = (st: Station) => { stRef.current = st; setStation(st); start(startOf(st)); };
  const toggle = () => {
    const cur = a.current[live.current];
    if (!cur.src) { start(startOf(stRef.current)); return; }
    if (cur.paused) cur.play().then(() => setPlaying(true)).catch(() => undefined); else { cur.pause(); setPlaying(false); }
  };
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

  return (
    <main className="mx-auto max-w-4xl px-4 pb-24 pt-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-[34px] leading-none">{t("title")}</h1>
        <span className={`rounded-sm px-2 py-0.5 text-[11px] font-extrabold tracking-wider ${playing ? "bg-accent text-white" : "bg-line text-muted"}`}>{playing ? t("onAir") : t("off")}</span>
      </div>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{t("lead")}</p>

      {banner && (
        <div role="status" className="mt-6 rounded-lg border border-line border-s-4 border-s-accent bg-surface p-4">
          <p className="text-[13px] font-bold text-accent">{t("adhanNow")}</p>
          <p className="font-display text-2xl">{t(`p_${banner}`)}</p>
        </div>
      )}

      <section className="mt-6 rounded-lg border border-line bg-surface p-5 sm:p-7">
        <p className="eyebrow">{t("nowPlaying")} · {stationName(station.id)}</p>
        <h2 className="font-display mt-2 text-3xl leading-tight sm:text-4xl">{chapter ? `${chapter.id}. ${chapter.name_simple}` : `${now.s}`} <span className="text-muted">· {now.v}</span></h2>
        <p className="mt-1 text-sm text-muted">{reciter.name}</p>
        {showText && verse && (
          <div className="mt-6 border-t border-line pt-5">
            <p className="font-arabic text-3xl leading-[2.1] sm:text-4xl" dir="rtl">{verse.text_uthmani}</p>
            {verse.translation && <p className="mt-3 text-[15px] leading-relaxed text-muted">{verse.translation}</p>}
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button onClick={prevVerse} aria-label={t("prev")} className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ink"><IconPrev /></button>
          <button onClick={toggle} aria-label={playing ? t("pause") : t("play")} className="grid h-14 w-14 place-items-center rounded-full bg-accent text-white hover:brightness-110">{playing ? <IconPause /> : <IconPlay />}</button>
          <button onClick={skipVerse} aria-label={t("nextVerse")} className="grid h-11 w-11 place-items-center rounded-full border border-line hover:border-ink"><IconNext /></button>
          <button onClick={skipSurah} className="h-11 rounded-md border border-ink px-4 text-sm font-bold hover:bg-ink hover:text-bg">{t("nextSurah")}</button>
        </div>
        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1"><span className="text-muted">{t("reciter")}</span>
            <select value={reciter.folder} onChange={(e) => { setFolder(e.target.value); writeJSON("tf:reciter", e.target.value, true); setTimeout(() => start(pos.current, playing), 0); }} className="h-10 rounded-md border border-line bg-bg px-2">
              {reciters.map((r) => <option key={r.folder} value={r.folder}>{r.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1"><span className="text-muted">{t("sleep")}</span>
            <select value={sleepLeft ? "on" : "0"} onChange={(e) => setSleepLeft(e.target.value === "0" ? 0 : Number(e.target.value) * 60)} className="h-10 rounded-md border border-line bg-bg px-2">
              <option value="0">{sleepLeft ? `${Math.ceil(sleepLeft / 60)} ${t("min")}` : t("off")}</option>
              {sleepOptions.map((m) => <option key={m} value={m}>{m} {t("min")}</option>)}
            </select>
          </label>
          <label className="grid gap-1"><span className="text-muted">{t("adhan")}</span>
            <select value={adhanMode} onChange={(e) => { const v = e.target.value as AdhanMode; setAdhanMode(v); writeJSON("tf:adhan", v, true); }} className="h-10 rounded-md border border-line bg-bg px-2">
              <option value="off">{t("off")}</option>
              <option value="makkah">{t("adhanMakkah")}</option>
              <option value="dubai">{t("adhanDubai")}</option>
              <option value="mine">{t("adhanMine")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 self-end pb-2"><input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} /> {t("showText")}</label>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold">{t("stations")}</h2>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {STATIONS.map((st) => (
            <li key={st.id} className="bg-surface">
              <button onClick={() => chooseStation(st)} className={`flex w-full items-center justify-between gap-3 p-4 text-start transition hover:bg-bg ${station.id === st.id && playing ? "border-s-4 border-s-accent" : ""}`}>
                <span><span className="block text-[15px] font-bold">{stationName(st.id)}</span><span className="block text-sm text-muted">{t(`sd_${st.id}`)}</span></span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">{station.id === st.id && playing ? <IconPause /> : <IconPlay />}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {adhanMode !== "off" && !adhanFiles.makkah && !adhanFiles.dubai && !adhanFiles.default && <p className="mt-6 text-sm text-muted">{t("adhanMissing")}</p>}
      {adhanCredit && <p className="mt-4 text-xs text-muted">{adhanCredit}</p>}
      <audio ref={adhanEl} preload="none" />
      {[0, 1].map((i) => (
        <audio key={i} ref={(el) => { if (el) a.current[i] = el; }} preload="auto" onEnded={() => { if (i === live.current) advance(); }} onPause={() => { if (i === live.current && !a.current[i].ended) setPlaying(false); }} onPlay={() => { if (i === live.current) setPlaying(true); }} />
      ))}
    </main>
  );
}
