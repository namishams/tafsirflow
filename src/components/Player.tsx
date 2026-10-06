"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { RECITERS, TAFSIRS, getChapter, getTafsir, getVerses, type Chapter, type TafsirResult, type Verse } from "@/lib/quran";

type Mode = "learn" | "continuous";

export default function Player({ chapterId }: { chapterId: number }) {
  const t = useTranslations("player");
  const locale = useLocale();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [error, setError] = useState(false);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false); // learn mode: paused until "Continue"
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("continuous");
  const [repeat, setRepeat] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [reciterId, setReciterId] = useState(RECITERS[0].id);
  const [tafsirId, setTafsirId] = useState(TAFSIRS[0].id);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tafsir, setTafsir] = useState<TafsirResult | null | undefined>(undefined);
  const playsDone = useRef(0);
  const wantPlay = useRef(false); // start playing as soon as the next verse file is ready
  const [useRemote, setUseRemote] = useState(false); // local file failed -> Quran.com audio
  const [timingsOk, setTimingsOk] = useState(true);

  useEffect(() => {
    setError(false);
    setVerses([]);
    setIdx(0);
    Promise.all([getChapter(chapterId, locale), getVerses(chapterId, locale, reciterId)])
      .then(([c, v]) => { setChapter(c); setVerses(v); })
      .catch(() => setError(true));
  }, [chapterId, locale, reciterId]);

  const verse = verses[idx];

  useEffect(() => { setUseRemote(false); setTimingsOk(true); }, [verse, reciterId]);

  // Tafsir for current verse; empty entries belong to the nearest earlier non-empty one.
  useEffect(() => {
    if (!verse) return;
    let cancelled = false;
    setTafsir(undefined);
    (async () => {
      for (let n = verse.verse_number; n >= 1; n--) {
        const r = await getTafsir(tafsirId, `${chapterId}:${n}`).catch(() => null);
        if (cancelled) return;
        if (r) { setTafsir(r); return; }
      }
      if (!cancelled) setTafsir(null);
    })();
    return () => { cancelled = true; };
  }, [verse, tafsirId, chapterId]);

  const play = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    a.playbackRate = speed;
    a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [speed]);

  const goTo = useCallback((i: number, autoplay = true) => {
    playsDone.current = 0;
    setWaiting(false);
    setActiveWord(null);
    wantPlay.current = autoplay;
    setIdx(i);
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = speed; }, [speed]);

  const onTime = () => {
    const ms = (audioRef.current?.currentTime ?? 0) * 1000;
    const seg = verse?.segments.find((s) => ms >= s.start && ms < s.end);
    setActiveWord(seg ? seg.word : null);
  };

  const onEnded = () => {
    playsDone.current += 1;
    setActiveWord(null);
    if (playsDone.current < repeat) { play(); return; }
    setPlaying(false);
    if (mode === "learn") { setWaiting(true); return; }
    if (idx < verses.length - 1) goTo(idx + 1);
  };

  const hasTimings = useMemo(() => !!verse && verse.segments.length > 0 && (useRemote || timingsOk), [verse, useRemote, timingsOk]);

  // Self-hosted files may be a different recording than the one the timings belong to:
  // if the file length is far from the last segment end, turn word highlighting off.
  const onMeta = () => {
    const a = audioRef.current;
    const last = verse?.segments.reduce((m, s) => Math.max(m, s.end), 0) ?? 0;
    if (!a || useRemote || !last || !isFinite(a.duration)) return;
    setTimingsOk(Math.abs(a.duration * 1000 - last) <= 1500);
  };
  const wordsToShow = verse?.words.filter((w) => w.char_type_name === "word") ?? [];

  if (error) return <p className="p-6">{t("error")}</p>;
  if (!verse || !chapter) return <p className="p-6">{t("loading")}</p>;

  const tafsirSource = TAFSIRS.find((s) => s.id === tafsirId)!;
  const tafsirBody = (
    <div>
      <select value={tafsirId} onChange={(e) => setTafsirId(Number(e.target.value))} className="mb-3 w-full rounded border border-stone-300 bg-white px-2 py-1 text-sm">
        {TAFSIRS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {tafsir === undefined && <p>{t("loading")}</p>}
      {tafsir === null && <p>{t("noTafsir")}</p>}
      {tafsir && (
        <>
          {tafsir.verseKeys.length > 1 && (
            <p className="mb-2 text-xs text-stone-500">
              {t("covers", { from: tafsir.verseKeys[0].split(":")[1], to: tafsir.verseKeys[tafsir.verseKeys.length - 1].split(":")[1] })}
            </p>
          )}
          {/* HTML comes from Quran.com API */}
          <div className="tafsir-html text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: tafsir.text }} />
          <p className="mt-3 border-t pt-2 text-xs text-stone-500">{t("source")}: {tafsirSource.name} — {tafsirSource.author} (Quran.com)</p>
        </>
      )}
    </div>
  );

  const btnBase = "rounded-full border px-3 py-2 text-sm hover:border-emerald-600";
  const btn = `${btnBase} border-stone-300 bg-white`;
  const btnPrimary = `${btnBase} border-emerald-600 bg-emerald-600 text-white`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 md:grid md:grid-cols-[1fr_22rem] md:gap-6">
      <main>
        <header className="mb-4 flex items-center justify-between gap-2">
          <Link href="/" className="text-sm text-emerald-700">← {t("back")}</Link>
          <LanguageSwitcher />
        </header>
        <h1 className="mb-1 text-xl font-bold">{chapter.id}. {chapter.name_simple} <span className="font-arabic" dir="rtl">{chapter.name_arabic}</span></h1>

        <div className="my-4 flex flex-wrap gap-2 text-sm">
          <select value={reciterId} onChange={(e) => setReciterId(Number(e.target.value))} className={btn}>
            {RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className={btn}>
            <option value="learn">{t("modeLearn")}</option>
            <option value="continuous">{t("modeContinuous")}</option>
          </select>
          <label className={btn}>{t("repeat")} ×
            <select value={repeat} onChange={(e) => setRepeat(Number(e.target.value))} className="ml-1 bg-transparent">
              {[1, 2, 3, 5, 10].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label className={btn}>{t("speed")}
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="ml-1 bg-transparent">
              {[0.75, 1, 1.25, 1.5].map((n) => <option key={n} value={n}>{n}×</option>)}
            </select>
          </label>
          <label className={btn}>{t("jump")}
            <select value={idx} onChange={(e) => goTo(Number(e.target.value), false)} className="ml-1 bg-transparent">
              {verses.map((v, i) => <option key={v.verse_key} value={i}>{v.verse_number}</option>)}
            </select>
          </label>
        </div>

        <section className="rounded-xl border border-stone-200 bg-white p-4">
          <p className="mb-1 text-xs text-stone-500">{verse.verse_key}</p>
          <p className="font-arabic text-3xl leading-[2.2] md:text-4xl" dir="rtl">
            {wordsToShow.map((w) => (
              <span key={w.position} className={`rounded px-0.5 ${hasTimings && activeWord === w.position ? "bg-emerald-200" : ""}`}>{w.text_uthmani} </span>
            ))}
          </p>
          <p className="mt-3 text-stone-700">{verse.translation}</p>
          <audio ref={audioRef} src={useRemote ? verse.remoteAudioUrl : verse.audioUrl} onLoadedMetadata={onMeta} onCanPlay={() => { if (wantPlay.current) { wantPlay.current = false; play(); } }} onError={() => !useRemote && verse.remoteAudioUrl && setUseRemote(true)} onTimeUpdate={onTime} onEnded={onEnded} onPause={() => setPlaying(false)} onPlay={() => setPlaying(true)} preload="auto" />
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button className={btn} onClick={() => goTo(Math.max(0, idx - 1), false)} aria-label={t("prev")}>⏮</button>
            <button className={btnPrimary} onClick={() => (playing ? audioRef.current?.pause() : play())}>
              {playing ? `⏸ ${t("pause")}` : `▶ ${t("play")}`}
            </button>
            <button className={btn} onClick={() => goTo(Math.min(verses.length - 1, idx + 1), false)} aria-label={t("next")}>⏭</button>
            <button className={`${btn} md:hidden`} onClick={() => setSheetOpen(true)}>{t("tafsir")}</button>
          </div>
          {waiting && (
            <div className="mt-3 flex items-center gap-3 rounded bg-amber-50 p-2 text-sm">
              <span>{t("learnHint")}</span>
              <button className={btnPrimary} onClick={() => idx < verses.length - 1 && goTo(idx + 1)}>{t("continue")}</button>
            </div>
          )}
        </section>
      </main>

      {/* Desktop: sidebar */}
      <aside className="hidden max-h-[85vh] overflow-y-auto rounded-xl border border-stone-200 bg-white p-4 md:block">
        <h2 className="mb-2 font-semibold">{t("tafsir")}</h2>
        {tafsirBody}
      </aside>

      {/* Mobile: bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-semibold">{t("tafsir")} · {verse.verse_key}</h2>
              <button className="text-sm text-emerald-700" onClick={() => setSheetOpen(false)}>{t("closeTafsir")}</button>
            </div>
            {tafsirBody}
          </div>
        </div>
      )}
    </div>
  );
}
