"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { localeMeta } from "@/i18n/locales";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import {
  RECITERS, getChapter, getResources, getTafsir, getVerses, pickTranslation, tafsirOptionsFor,
  type Chapter, type Resource, type TafsirResult, type Verse,
} from "@/lib/quran";
import { readJSON, writeJSON } from "@/lib/storage";

type Mode = "learn" | "continuous";

const seg = (on: boolean) =>
  `rounded-lg px-3 py-1.5 text-sm transition ${on ? "bg-accent text-white shadow-card" : "text-muted hover:text-ink"}`;
const field = "rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink";

export default function Player({ chapterId, startVerse }: { chapterId: number; startVerse: number }) {
  const t = useTranslations("player");
  const locale = useLocale();
  const meta = localeMeta(locale);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playsDone = useRef(0);
  const wantPlay = useRef(false); // start playing as soon as the next verse file is ready
  const tafsirCache = useRef(new Map<string, TafsirResult | null>());

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [error, setError] = useState(false);
  const [translationId, setTranslationId] = useState<number | null>(null);
  const [tafsirOpts, setTafsirOpts] = useState<Resource[]>([]);
  const [hasLocalTafsir, setHasLocalTafsir] = useState(true);
  const [tafsirId, setTafsirId] = useState<number | null>(null);
  const [tafsir, setTafsir] = useState<TafsirResult | null | undefined>(undefined);

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false); // learn mode: paused until "Continue"
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [useRemote, setUseRemote] = useState(false); // local file failed -> Quran.com audio
  const [timingsOk, setTimingsOk] = useState(true);
  const [dbg, setDbg] = useState("");

  const [mode, setMode] = useState<Mode>("continuous");
  const [repeat, setRepeat] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [reciterId, setReciterId] = useState(RECITERS[0].id);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showWords, setShowWords] = useState(false);
  const [showTranslit, setShowTranslit] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopFrom, setLoopFrom] = useState(1);
  const [loopTo, setLoopTo] = useState(1);
  const [marks, setMarks] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    setMarks(readJSON<string[]>("tf:bookmarks", []));
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Discover translation + tafsir sources for this UI language
  useEffect(() => {
    getResources()
      .then((r) => {
        setTranslationId(pickTranslation(locale, r.translations));
        const { options, hasLocal } = tafsirOptionsFor(locale, r.tafsirs);
        setTafsirOpts(options);
        setHasLocalTafsir(hasLocal);
        setTafsirId(options[0]?.id ?? null);
      })
      .catch(() => {
        setTranslationId(locale === "de" ? 27 : 20);
        setTafsirId(169);
      });
  }, [locale]);

  useEffect(() => {
    if (translationId === null) return;
    setError(false);
    getVerses(chapterId, locale, reciterId, translationId)
      .then((v) => {
        setVerses(v);
        setIdx((cur) => (verses.length === 0 ? Math.min(Math.max(startVerse, 1), v.length) - 1 : Math.min(cur, v.length - 1)));
        setLoopTo(v.length);
      })
      .catch(() => setError(true));
    getChapter(chapterId, locale).then(setChapter).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, locale, reciterId, translationId]);

  const verse = verses[idx];

  useEffect(() => { setUseRemote(false); setTimingsOk(true); setDbg(""); }, [verse, reciterId]);

  // Remember where the learner stopped
  useEffect(() => {
    if (verse) writeJSON("tf:last", { chapter: chapterId, verse: verse.verse_number });
  }, [verse, chapterId]);

  // Keep the active verse in view
  useEffect(() => {
    document.getElementById(`v-${idx}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [idx]);

  // Tafsir for the current verse; empty entries belong to the nearest earlier non-empty one.
  useEffect(() => {
    if (!verse || tafsirId === null || !(isDesktop || sheetOpen)) return;
    let cancelled = false;
    setTafsir(undefined);
    (async () => {
      for (let n = verse.verse_number; n >= 1; n--) {
        const key = `${tafsirId}:${chapterId}:${n}`;
        let r = tafsirCache.current.get(key);
        if (r === undefined) {
          r = await getTafsir(tafsirId, `${chapterId}:${n}`).catch(() => null);
          tafsirCache.current.set(key, r);
        }
        if (cancelled) return;
        if (r) { setTafsir(r); return; }
      }
      if (!cancelled) setTafsir(null);
    })();
    return () => { cancelled = true; };
  }, [verse, tafsirId, chapterId, isDesktop, sheetOpen]);

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
    const s = verse?.segments.find((x) => ms >= x.start && ms < x.end);
    setActiveWord(s ? s.word : null);
  };

  const advance = () => {
    if (loopOn && idx >= loopTo - 1) { goTo(Math.max(0, loopFrom - 1)); return; }
    if (idx < verses.length - 1) goTo(idx + 1);
  };

  const onEnded = () => {
    playsDone.current += 1;
    setActiveWord(null);
    if (playsDone.current < repeat) { play(); return; }
    setPlaying(false);
    if (mode === "learn") { setWaiting(true); return; }
    advance();
  };

  // Self-hosted files may be a different recording than the one the timings belong to:
  // if the file length is far from the last segment end, turn word highlighting off.
  const onMeta = () => {
    const a = audioRef.current;
    const last = verse?.segments.reduce((m, s) => Math.max(m, s.end), 0) ?? 0;
    if (!a || useRemote || !last || !isFinite(a.duration)) return;
    setTimingsOk(Math.abs(a.duration * 1000 - last) <= 1500);
  };

  const hasTimings = useMemo(() => !!verse && verse.segments.length > 0 && (useRemote || timingsOk), [verse, useRemote, timingsOk]);

  const toggleMark = (key: string) => {
    const next = marks.includes(key) ? marks.filter((k) => k !== key) : [...marks, key];
    setMarks(next);
    writeJSON("tf:bookmarks", next);
  };

  if (error) return <p className="p-6">{t("error")}</p>;
  if (!verse || !chapter) return <p className="p-6 text-muted">{t("loading")}</p>;

  const source = tafsirOpts.find((s) => s.id === tafsirId);
  const tafsirBody = (
    <div>
      {!hasLocalTafsir && (
        <p className="mb-3 rounded-lg bg-accent-soft p-2 text-xs text-ink">{t("noLocalTafsir", { language: meta.label })}</p>
      )}
      <select value={tafsirId ?? ""} onChange={(e) => setTafsirId(Number(e.target.value))} className={`${field} mb-3 w-full`}>
        {tafsirOpts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {tafsir === undefined && <p className="text-muted">{t("loading")}</p>}
      {tafsir === null && <p className="text-muted">{t("noTafsir")}</p>}
      {tafsir && (
        <>
          {tafsir.verseKeys.length > 1 && (
            <p className="mb-2 text-xs text-muted">
              {t("covers", { from: tafsir.verseKeys[0].split(":")[1], to: tafsir.verseKeys[tafsir.verseKeys.length - 1].split(":")[1] })}
            </p>
          )}
          {/* HTML comes from the Quran.com API */}
          <div className="tafsir-html" dangerouslySetInnerHTML={{ __html: tafsir.text }} />
          {source && (
            <p className="mt-4 border-t border-line pt-2 text-xs text-muted">
              {t("source")}: {source.name}{source.author_name ? ` — ${source.author_name}` : ""} (Quran.com)
            </p>
          )}
        </>
      )}
    </div>
  );

  const primary = "rounded-full bg-accent px-5 py-2.5 font-semibold text-white shadow-card transition hover:opacity-90";
  const round = "grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-lg shadow-card hover:border-accent";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-4 lg:grid lg:grid-cols-[1fr_24rem] lg:gap-6">
      <main>
        <header className="mb-4 flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-accent">
            <Logo size={24} /> ← {t("back")}
          </Link>
          <LanguageSwitcher />
        </header>

        <div className="mb-4 flex items-end justify-between">
          <h1 className="text-2xl font-bold">{chapter.id}. {chapter.name_simple}</h1>
          <span className="font-arabic text-3xl" dir="rtl">{chapter.name_arabic}</span>
        </div>

        <section className="mb-4 rounded-2xl border border-line bg-surface p-4 shadow-card">
          <button className="flex w-full items-center justify-between text-sm font-semibold" onClick={() => setSettingsOpen((o) => !o)} aria-expanded={settingsOpen}>
            <span>⚙ {t("settings")}</span><span className="text-muted">{settingsOpen ? "−" : "+"}</span>
          </button>
          {settingsOpen && (
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <label className="grid gap-1"><span className="text-muted">{t("reciter")}</span>
                <select value={reciterId} onChange={(e) => setReciterId(Number(e.target.value))} className={field}>
                  {RECITERS.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </label>
              <div className="grid gap-1"><span className="text-muted">{t("mode")}</span>
                <div className="inline-flex w-fit rounded-xl bg-bg p-1">
                  <button className={seg(mode === "learn")} onClick={() => setMode("learn")}>{t("modeLearn")}</button>
                  <button className={seg(mode === "continuous")} onClick={() => setMode("continuous")}>{t("modeContinuous")}</button>
                </div>
              </div>
              <label className="grid gap-1"><span className="text-muted">{t("repeat")}</span>
                <select value={repeat} onChange={(e) => setRepeat(Number(e.target.value))} className={field}>
                  {[1, 2, 3, 5, 10].map((n) => <option key={n} value={n}>×{n}</option>)}
                </select>
              </label>
              <label className="grid gap-1"><span className="text-muted">{t("speed")}</span>
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className={field}>
                  {[0.5, 0.75, 1, 1.25, 1.5].map((n) => <option key={n} value={n}>{n}×</option>)}
                </select>
              </label>
              <div className="grid gap-1 sm:col-span-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={loopOn} onChange={(e) => setLoopOn(e.target.checked)} /> {t("loop")}</label>
                <div className="flex items-center gap-2 text-muted">
                  {t("loopFrom")}
                  <select value={loopFrom} onChange={(e) => setLoopFrom(Number(e.target.value))} className={field}>
                    {verses.map((v) => <option key={v.verse_key} value={v.verse_number}>{v.verse_number}</option>)}
                  </select>
                  {t("loopTo")}
                  <select value={loopTo} onChange={(e) => setLoopTo(Number(e.target.value))} className={field}>
                    {verses.map((v) => <option key={v.verse_key} value={v.verse_number}>{v.verse_number}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showTranslit} onChange={(e) => setShowTranslit(e.target.checked)} /> {t("transliteration")}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showTranslation} onChange={(e) => setShowTranslation(e.target.checked)} /> {t("translation")}</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={showWords} onChange={(e) => setShowWords(e.target.checked)} /> {t("wordByWord")}</label>
            </div>
          )}
        </section>

        <ol className="grid gap-3">
          {verses.map((v, i) => {
            const active = i === idx;
            const words = v.words.filter((w) => w.char_type_name === "word");
            return (
              <li key={v.verse_key} id={`v-${i}`}>
                <article
                  onClick={() => !active && goTo(i)}
                  className={`rounded-2xl border p-4 shadow-card transition ${active ? "border-accent bg-surface ring-2 ring-accent/20" : "cursor-pointer border-line bg-surface/70 hover:border-accent"}`}
                >
                  <div className="mb-2 flex items-center justify-between text-xs text-muted">
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-accent">{v.verse_key}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMark(v.verse_key); }}
                      aria-label={marks.includes(v.verse_key) ? t("bookmarked") : t("bookmark")}
                      className={marks.includes(v.verse_key) ? "text-gold" : "hover:text-ink"}
                    >{marks.includes(v.verse_key) ? "★" : "☆"}</button>
                  </div>
                  {active ? (
                    <p className="flex flex-wrap justify-start gap-x-3 gap-y-2 font-arabic text-3xl leading-[2.1] sm:text-4xl" dir="rtl">
                      {words.map((w) => (
                        <span key={w.position} className="text-center">
                          <span className={`block rounded px-1 transition ${hasTimings && activeWord === w.position ? "bg-accent-soft text-accent" : ""}`}>{w.text_uthmani}</span>
                          {showWords && (
                            <span className="block font-sans text-[11px] leading-tight text-muted" dir="ltr">
                              {showTranslit && <span className="block italic">{w.transliteration?.text}</span>}
                              {w.translation?.text}
                            </span>
                          )}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="font-arabic text-2xl leading-[2]" dir="rtl">{v.text_uthmani}</p>
                  )}
                  {showTranslit && v.transliteration && (
                    <p className="mt-2 italic leading-relaxed text-gold" dir="ltr" lang="en">{v.transliteration}</p>
                  )}
                  {showTranslation && <p className="mt-3 leading-relaxed text-muted" dir={meta.dir}>{v.translation}</p>}
                  {active && waiting && (
                    <div className="mt-3 flex items-center gap-3 rounded-xl bg-accent-soft p-3 text-sm">
                      <span>{t("learnHint")}</span>
                      <button className={primary} onClick={(e) => { e.stopPropagation(); advance(); }}>{t("continue")}</button>
                    </div>
                  )}
                  {active && (
                    <button className="mt-3 text-sm font-medium text-accent lg:hidden" onClick={(e) => { e.stopPropagation(); setSheetOpen(true); }}>
                      📖 {t("tafsir")}
                    </button>
                  )}
                </article>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 text-center text-[11px] text-muted">{useRemote ? "quran.com" : "self-hosted"} · {verse.verse_key} · {dbg || "ok"}</p>
      </main>

      <aside className="sticky top-4 hidden max-h-[calc(100vh-2rem)] self-start overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-card lg:block">
        <h2 className="mb-3 text-lg font-bold">{t("tafsir")} · {verse.verse_key}</h2>
        {tafsirBody}
      </aside>

      <audio
        ref={audioRef}
        src={useRemote ? verse.remoteAudioUrl : verse.audioUrl}
        onLoadedMetadata={onMeta}
        onCanPlay={() => { if (wantPlay.current) { wantPlay.current = false; play(); } }}
        onError={(e) => { const m = e.currentTarget.error; setDbg(`audio error ${m?.code ?? "?"}: ${m?.message ?? ""}`); if (!useRemote && verse.remoteAudioUrl) setUseRemote(true); }}
        onWaiting={() => setDbg("waiting for data")}
        onStalled={() => setDbg("stalled")}
        onTimeUpdate={onTime}
        onEnded={() => { setDbg("ended"); onEnded(); }}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        preload="auto"
      />

      {/* Player dock */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <span className="min-w-16 text-sm text-muted">{t("verse")} {verse.verse_number} {t("of")} {verses.length}</span>
          <div className="flex items-center gap-3">
            <button className={round} onClick={() => goTo(Math.max(0, idx - 1), false)} aria-label={t("prev")}>⏮</button>
            <button className={primary} onClick={() => (playing ? audioRef.current?.pause() : play())}>
              {playing ? `⏸ ${t("pause")}` : `▶ ${t("play")}`}
            </button>
            <button className={round} onClick={() => goTo(Math.min(verses.length - 1, idx + 1), false)} aria-label={t("next")}>⏭</button>
          </div>
          <select value={idx} onChange={(e) => goTo(Number(e.target.value), false)} className={`${field} w-20`} aria-label={t("jump")}>
            {verses.map((v, i) => <option key={v.verse_key} value={i}>{v.verse_number}</option>)}
          </select>
        </div>
        <div className="h-1 bg-line"><div className="h-1 bg-accent transition-all" style={{ width: `${((idx + 1) / verses.length) * 100}%` }} /></div>
      </div>

      {/* Mobile: bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-surface p-5 shadow-xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">{t("tafsir")} · {verse.verse_key}</h2>
              <button className="text-sm font-medium text-accent" onClick={() => setSheetOpen(false)}>{t("closeTafsir")}</button>
            </div>
            {tafsirBody}
          </div>
        </div>
      )}
    </div>
  );
}
