"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { localeMeta } from "@/i18n/locales";
import LanguageSwitcher from "./LanguageSwitcher";
import AccountLink from "./AccountLink";
import KidsToggle from "./KidsToggle";
import AuthGate from "./AuthGate";
import SocialBar from "./SocialBar";
import Logo from "./Logo";
import { IconPlay, IconPause, IconPrev, IconNext, IconPlaySm, IconCopy, IconShare, IconNote, IconBookmark, IconVolume } from "./Icons";
import {
  LimitError, OWN_TAFSIR_ID, RECITERS, getChapter, getChapters, getOwnTafsir, getReciters, getResources, getTafsir, getVerses, hasOwnTafsir, pickTranslation, tafsirOptionsFor,
  type Chapter, type Reciter, type Resource, type TafsirResult, type Verse,
} from "@/lib/quran";
import { readJSON, writeJSON } from "@/lib/storage";
import { dueVerses, rate, type Rating } from "@/lib/learning";

type Mode = "learn" | "continuous";

const seg = (on: boolean) =>
  `rounded-lg px-3 py-1.5 text-sm transition ${on ? "bg-accent text-white shadow-card" : "text-muted hover:text-ink"}`;
const field = "rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink";

type Initial = { chapter: Chapter; verses: Verse[]; translationId: number };

export default function Player({ chapterId, startVerse, startHide = 0, reviewMode = false, initial }: { chapterId: number; startVerse: number; startHide?: number; reviewMode?: boolean; initial?: Initial }) {
  const router = useRouter();
  const t = useTranslations("player");
  const th = useTranslations("home");
  const ta = useTranslations("account");
  const locale = useLocale();
  const meta = localeMeta(locale);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playsDone = useRef(0);
  const wantPlay = useRef(false); // start playing as soon as the next verse file is ready
  const tafsirCache = useRef(new Map<string, TafsirResult | null>());

  const skipFirstLoad = useRef(!!initial);
  const [chapter, setChapter] = useState<Chapter | null>(initial?.chapter ?? null);
  const [verses, setVerses] = useState<Verse[]>(initial?.verses ?? []);
  const [error, setError] = useState(false);
  const [translationId, setTranslationId] = useState<number | null>(initial?.translationId ?? null);
  const [tafsirOpts, setTafsirOpts] = useState<Resource[]>([]);
  const [hasLocalTafsir, setHasLocalTafsir] = useState(true);
  const [tafsirId, setTafsirId] = useState<number | null>(null);
  const [tafsir, setTafsir] = useState<TafsirResult | null | undefined>(undefined);

  const [idx, setIdx] = useState(initial ? Math.min(Math.max(startVerse, 1), initial.verses.length) - 1 : 0);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false); // learn mode: paused until "Continue"
  const [activeWord, setActiveWord] = useState<number | null>(null);
  const [useRemote, setUseRemote] = useState(false); // local file failed -> Quran.com audio
  const [timingsOk, setTimingsOk] = useState(true);
  const [dbg, setDbg] = useState("");
  const [hide, setHide] = useState(startHide); // 0 show all, 1 hide every 2nd word, 2 hide all
  const [revealed, setRevealed] = useState(false);
  const [note, setNote] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [authTick, setAuthTick] = useState(0);
  const [kids, setKids] = useState(false);

  const [mode, setMode] = useState<Mode>("continuous");
  const [repeat, setRepeat] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [reciters, setReciters] = useState<Reciter[]>(RECITERS);
  const [reciterFolder, setReciterFolder] = useState(RECITERS[0].folder);
  const reciter = reciters.find((r) => r.folder === reciterFolder) ?? reciters[0];
  const [showTranslation, setShowTranslation] = useState(true);
  const [showWords, setShowWords] = useState(false);
  const [showTranslit, setShowTranslit] = useState(true);
  const [loopOn, setLoopOn] = useState(false);
  const [loopFrom, setLoopFrom] = useState(1);
  const [loopTo, setLoopTo] = useState(initial?.verses.length ?? 1);
  const [marks, setMarks] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [view, setView] = useState<"verses" | "reading">("verses");
  const [arSize, setArSize] = useState(1);
  const [notes, setNotes] = useState<Record<string, { text: string; at: number }>>({});
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);

  useEffect(() => {
    setMarks(readJSON<string[]>("tf:bookmarks", []));
    setNotes(readJSON("tf:notes", {}));
    setView(readJSON<"verses" | "reading">("tf:view", "verses"));
    setArSize(readJSON<number>("tf:arsize", 1));
    const mq = window.matchMedia("(min-width: 1024px)");
    const on = () => setIsDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    const readKids = () => setKids(document.documentElement.dataset.kids === "1");
    readKids();
    window.addEventListener("tf-kids", readKids);
    const onAuth = () => { setGateOpen(false); setLimitHit(false); tafsirCache.current.clear(); setAuthTick((n) => n + 1); };
    window.addEventListener("tf-auth", onAuth);
    return () => { mq.removeEventListener("change", on); window.removeEventListener("tf-kids", readKids); window.removeEventListener("tf-auth", onAuth); };
  }, []);

  useEffect(() => { getChapters(locale).then(setChapters).catch(() => undefined); }, [locale]);
  useEffect(() => {
    getReciters().then((list) => {
      setReciters(list);
      const saved = readJSON<string>("tf:reciter", "");
      if (saved && list.some((r) => r.folder === saved)) setReciterFolder(saved);
    });
  }, []);
  useEffect(() => { if (audioRef.current) audioRef.current.volume = vol; }, [vol]);
  useEffect(() => {
    const off = () => audioRef.current?.pause();
    window.addEventListener("tf-radio-start", off);
    return () => window.removeEventListener("tf-radio-start", off);
  }, []);
  useEffect(() => { setCur(0); setDur(0); }, [idx]);

  // Kids mode: word-by-word with transliteration on by default, tafsir out of the way
  useEffect(() => { if (kids) { setShowWords(true); setShowTranslit(true); } }, [kids]);

  // Discover translation + tafsir sources for this UI language
  useEffect(() => {
    Promise.all([getResources(), hasOwnTafsir(locale)])
      .then(([r, own]) => {
        setTranslationId(pickTranslation(locale, r.translations));
        const { options, hasLocal } = tafsirOptionsFor(locale, r.tafsirs);
        const all: Resource[] = own ? [{ id: OWN_TAFSIR_ID, name: `Quran Masterclass · ${meta.label}`, author_name: "", language_name: meta.resourceLang }, ...options] : options;
        setTafsirOpts(all);
        setHasLocalTafsir(hasLocal || own);
        setTafsirId(all[0]?.id ?? null);
      })
      .catch(() => {
        setTranslationId(locale === "de" ? 27 : 20);
        setTafsirId(169);
      });
  }, [locale]);

  useEffect(() => {
    if (translationId === null) return;
    if (skipFirstLoad.current) { skipFirstLoad.current = false; return; } // data came with the page
    setError(false);
    getVerses(chapterId, locale, reciter, translationId)
      .then((v) => {
        setVerses(v);
        setIdx((cur) => (verses.length === 0 ? Math.min(Math.max(startVerse, 1), v.length) - 1 : Math.min(cur, v.length - 1)));
        setLoopTo(v.length);
      })
      .catch(() => setError(true));
    getChapter(chapterId, locale).then(setChapter).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, locale, reciter.folder, translationId]);

  const verse = verses[idx];

  useEffect(() => { setUseRemote(false); setTimingsOk(true); setDbg(""); }, [verse, reciter.folder]);
  useEffect(() => { setRevealed(false); }, [idx, hide]);
  useEffect(() => {
    if (!note) return;
    const id = setTimeout(() => setNote(""), 2600);
    return () => clearTimeout(id);
  }, [note]);

  // Remember where the learner stopped
  useEffect(() => {
    if (verse) writeJSON("tf:last", { chapter: chapterId, verse: verse.verse_number, at: Date.now() });
  }, [verse, chapterId]);

  // Keep the active verse in view
  useEffect(() => {
    document.getElementById(`v-${idx}`)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [idx]);

  // Tafsir for the current verse; empty entries belong to the nearest earlier non-empty one.
  useEffect(() => {
    if (!verse || tafsirId === null || !(isDesktop || sheetOpen) || kids) return;
    let cancelled = false;
    setTafsir(undefined);
    setLimitHit(false);
    (async () => {
      if (tafsirId === OWN_TAFSIR_ID) {
        try {
          const r = await getOwnTafsir(locale, chapterId, verse.verse_number);
          if (!cancelled) setTafsir(r);
        } catch (e) {
          if (e instanceof LimitError && !cancelled) { setLimitHit(true); setNeedsVerify(e.needsVerify); setGateOpen(true); setTafsir(null); }
          else if (!cancelled) setTafsir(null);
        }
        return;
      }
      for (let n = verse.verse_number; n >= 1; n--) {
        const key = `${tafsirId}:${chapterId}:${n}`;
        let r = tafsirCache.current.get(key);
        if (r === undefined) {
          try {
            r = await getTafsir(tafsirId, `${chapterId}:${n}`, n === verse.verse_number);
          } catch (e) {
            if (e instanceof LimitError && !cancelled) { setLimitHit(true); setNeedsVerify(e.needsVerify); setGateOpen(true); setTafsir(null); }
            else if (!cancelled) setTafsir(null);
            return;
          }
          tafsirCache.current.set(key, r);
        }
        if (cancelled) return;
        if (r) { setTafsir(r); return; }
      }
      if (!cancelled) setTafsir(null);
    })();
    return () => { cancelled = true; };
  }, [verse, tafsirId, chapterId, isDesktop, sheetOpen, kids, locale, authTick]);

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

  const onRate = (r: Rating) => {
    if (!verse) return;
    const days = rate(verse.verse_key, r);
    setNote(days ? t("saved", { days }) : t("savedToday"));
    if (reviewMode) {
      const next = dueVerses().find((k) => k !== verse.verse_key);
      if (next) {
        const [c, vn] = next.split(":").map(Number);
        if (c === chapterId) goTo(vn - 1, false);
        else router.push(`/surah/${c}?v=${vn}&m=2&r=1`);
        return;
      }
    }
    if (idx < verses.length - 1) goTo(idx + 1, false);
  };

  const toggleMark = (key: string) => {
    const next = marks.includes(key) ? marks.filter((k) => k !== key) : [...marks, key];
    setMarks(next);
    writeJSON("tf:bookmarks", next);
  };

  const saveNote = (key: string, text: string) => {
    const n = { ...notes };
    if (text.trim()) n[key] = { text: text.trim(), at: Date.now() };
    else delete n[key];
    setNotes(n);
    writeJSON("tf:notes", n);
  };
  const setViewPref = (v: "verses" | "reading") => { setView(v); writeJSON("tf:view", v, true); };
  const setSize = (n: number) => { setArSize(n); writeJSON("tf:arsize", n, true); };
  const copyVerse = async (v: Verse) => {
    const text = `${v.text_uthmani}\n\n${v.translation}\n\n— ${chapter?.name_simple ?? ""} ${v.verse_key}`;
    try { await navigator.clipboard.writeText(text); setNote(t("copied")); } catch { /* clipboard blocked */ }
  };
  const shareVerse = async (v: Verse) => {
    const url = `${location.origin}/${locale}/surah/${chapterId}?v=${v.verse_number}`;
    if (navigator.share) { await navigator.share({ title: `${chapter?.name_simple ?? ""} ${v.verse_key}`, text: v.translation, url }).catch(() => undefined); return; }
    try { await navigator.clipboard.writeText(url); setNote(t("copied")); } catch { /* clipboard blocked */ }
  };
  const fmt = (x: number) => (isFinite(x) ? `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}` : "0:00");
  const toAr = (n: number) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

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
      {limitHit && (
        <div className="rounded-xl bg-accent-soft p-4 text-sm">
          <p className="mb-3">{t("limitReached")}</p>
          <button onClick={() => setGateOpen(true)} className="inline-block rounded-lg bg-accent px-4 py-2 font-semibold text-white">{ta("register")}</button>
        </div>
      )}
      {tafsir === null && !limitHit && <p className="text-muted">{t("noTafsir")}</p>}
      {tafsir && (
        <>
          {tafsir.verseKeys.length > 1 && (
            <p className="mb-2 text-xs text-muted">
              {t("covers", { from: tafsir.verseKeys[0].split(":")[1], to: tafsir.verseKeys[tafsir.verseKeys.length - 1].split(":")[1] })}
            </p>
          )}
          {/* HTML comes from the Quran.com API */}
          <div className="tafsir-html" dir={source?.language_name?.toLowerCase() === localeMeta(locale).resourceLang ? meta.dir : "ltr"} dangerouslySetInnerHTML={{ __html: tafsir.text }} />
          {source && (
            <p className="mt-4 border-t border-line pt-2 text-xs text-muted">
              {t("source")}: {source.name}{source.author_name ? ` — ${source.author_name}` : ""}{source.id === OWN_TAFSIR_ID ? "" : " (Quran.com)"}
            </p>
          )}
        </>
      )}
    </div>
  );

  const primary = "rounded-full bg-accent px-5 py-2.5 font-semibold text-white shadow-card transition hover:opacity-90";
  const withBismillah = chapterId !== 1 && chapterId !== 9;
  const dockBtn = "grid h-11 w-11 place-items-center rounded-full text-ink transition hover:bg-accent-soft";

  return (
    <div className="pb-64 lg:pb-48" style={{ ["--ar-scale" as string]: arSize }}>
      <div className={`mx-auto px-4 ${kids ? "max-w-3xl" : "max-w-6xl lg:grid lg:grid-cols-[1fr_25rem] lg:gap-8"}`}>
        <main className="min-w-0">
          <section className="mb-8 mt-10 border-b border-line pb-8">
            <p className="eyebrow">{th("surahLabel", { n: chapter.id })} · {chapter.verses_count} {th("verses")}</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <h1 className="font-display text-5xl leading-none sm:text-6xl">{chapter.name_simple}</h1>
              <span className="font-arabic text-5xl leading-none sm:text-6xl" dir="rtl">{chapter.name_arabic}</span>
            </div>
            <p className="mt-3 text-muted">{chapter.translated_name.name}</p>
            {withBismillah && <p className="font-arabic mt-8 text-center text-3xl text-muted" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>}
          </section>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 text-sm">
            <label className="flex items-center gap-2">
              <span className="sr-only">{t("goSurah")}</span>
              <select value={chapterId} onChange={(e) => router.push(`/surah/${e.target.value}`)} className={`${field} max-w-[11rem] font-medium`} aria-label={t("goSurah")}>
                {(chapters.length ? chapters : [chapter]).map((c) => <option key={c.id} value={c.id}>{c.id}. {c.name_simple}</option>)}
              </select>
            </label>
            {verse.page > 0 && <span className="text-muted tabular-nums">{t("page")} {verse.page} · {t("juz")} {verse.juz} / {t("hizb")} {verse.hizb}</span>}
            <div className="inline-flex rounded-lg bg-surface p-1 ring-1 ring-line">
              <button className={seg(view === "verses")} onClick={() => setViewPref("verses")}>{t("viewVerses")}</button>
              <button className={seg(view === "reading")} onClick={() => setViewPref("reading")}>{t("viewReading")}</button>
            </div>
          </div>

          <section className="mb-5 rounded-2xl border border-line bg-surface p-4 shadow-card">
            <button className="flex w-full items-center justify-between text-sm font-semibold" onClick={() => setSettingsOpen((o) => !o)} aria-expanded={settingsOpen}>
              <span>⚙ {t("settings")}</span><span className="text-muted">{settingsOpen ? "−" : "+"}</span>
            </button>
            {settingsOpen && (
              <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <label className="grid gap-1"><span className="text-muted">{t("reciter")}</span>
                  <select value={reciter.folder} onChange={(e) => { setReciterFolder(e.target.value); writeJSON("tf:reciter", e.target.value, true); }} className={field}>
                    {reciters.map((r) => <option key={r.folder} value={r.folder}>{r.name}</option>)}
                  </select>
                </label>
                <div className="grid gap-1"><span className="text-muted">{t("fontSize")}</span>
                  <div className="inline-flex w-fit rounded-xl bg-bg p-1">
                    {[0.85, 1, 1.2, 1.45].map((n, i) => (
                      <button key={n} className={seg(arSize === n)} onClick={() => setSize(n)} aria-label={`${t("fontSize")} ${n}`}><span style={{ fontSize: `${0.8 + i * 0.12}rem` }}>أ</span></button>
                    ))}
                  </div>
                </div>
                {!kids && <div className="grid gap-1"><span className="text-muted">{t("mode")}</span>
                  <div className="inline-flex w-fit rounded-xl bg-bg p-1">
                    <button className={seg(mode === "learn")} onClick={() => setMode("learn")}>{t("modeLearn")}</button>
                    <button className={seg(mode === "continuous")} onClick={() => setMode("continuous")}>{t("modeContinuous")}</button>
                  </div>
                </div>}
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
                {!kids && <div className="grid gap-1 sm:col-span-2">
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
                </div>}
                {!kids && <><label className="flex items-center gap-2"><input type="checkbox" checked={showTranslit} onChange={(e) => setShowTranslit(e.target.checked)} /> {t("transliteration")}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={showTranslation} onChange={(e) => setShowTranslation(e.target.checked)} /> {t("translation")}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={showWords} onChange={(e) => setShowWords(e.target.checked)} /> {t("wordByWord")}</label></>}
              </div>
            )}
          </section>

          {view === "reading" ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-justify font-arabic sm:p-10" dir="rtl" style={{ textAlignLast: "center" }}>
              <p className="ar-text" style={{ lineHeight: 2.6 }}>
                {verses.map((v, i) => (
                  <span key={v.verse_key} id={`v-${i}`} onClick={() => goTo(i)} className={`cursor-pointer rounded-lg px-1 transition ${i === idx ? "bg-accent-soft" : "hover:bg-bg"}`}>
                    {v.text_uthmani} <span className="verse-end">﴿{toAr(v.verse_number)}﴾</span>{" "}
                  </span>
                ))}
              </p>
            </div>
          ) : (
          <ol className="grid gap-3">
            {verses.map((v, i) => {
              const active = i === idx;
              const words = v.words.filter((w) => w.char_type_name === "word");
              const marked = marks.includes(v.verse_key);
              return (
                <li key={v.verse_key} id={`v-${i}`} className="scroll-mt-20">
                  <article
                    onClick={() => !active && goTo(i)}
                    className={`rounded-2xl border p-5 transition ${active ? "border-accent/30 border-s-4 border-s-accent bg-surface shadow-card" : "cursor-pointer border-line/70 bg-surface/60 hover:bg-surface"}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="relative grid h-9 w-9 place-items-center" aria-label={`${t("verse")} ${v.verse_number}`}>
                        <span className="absolute inset-1 rotate-45 rounded-[5px] bg-accent-soft" />
                        <span className="absolute inset-1 rounded-[5px] bg-accent-soft" />
                        <span className="relative text-xs font-semibold text-accent">{v.verse_number}</span>
                      </span>
                      <div className="flex items-center gap-0.5 text-muted" onClick={(e) => e.stopPropagation()}>
                        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg hover:text-ink" aria-label={t("playVerse")} title={t("playVerse")} onClick={() => goTo(i)}><IconPlaySm /></button>
                        <button className={`grid h-9 w-9 place-items-center rounded-full hover:bg-bg ${marked ? "text-gold" : "hover:text-ink"}`} aria-label={marked ? t("bookmarked") : t("bookmark")} title={marked ? t("bookmarked") : t("bookmark")} onClick={() => toggleMark(v.verse_key)}><IconBookmark filled={marked} /></button>
                        {!kids && <>
                          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg hover:text-ink" aria-label={t("copy")} title={t("copy")} onClick={() => copyVerse(v)}><IconCopy /></button>
                          <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-bg hover:text-ink" aria-label={t("share")} title={t("share")} onClick={() => shareVerse(v)}><IconShare /></button>
                          <button className={`grid h-9 w-9 place-items-center rounded-full hover:bg-bg ${notes[v.verse_key] ? "text-accent" : "hover:text-ink"}`} aria-label={t("note")} title={t("note")} onClick={() => setNoteOpen(noteOpen === v.verse_key ? null : v.verse_key)}><IconNote /></button>
                        </>}
                      </div>
                    </div>
                    {active ? (
                      <p className="ar-text flex flex-wrap justify-start gap-x-3 gap-y-2 font-arabic" dir="rtl">
                        {words.map((w, wi) => {
                          const covered = hide > 0 && !revealed && (hide === 2 || wi % 2 === 1);
                          return (
                          <span key={w.position} className="text-center">
                            <span className={`block rounded-lg px-1.5 transition ${covered ? "select-none bg-line text-transparent blur-sm" : ""} ${!covered && hasTimings && activeWord === w.position ? "bg-accent-soft text-accent" : ""}`}>{w.text_uthmani}</span>
                            {showWords && !covered && (
                              <span className="block font-sans text-[11px] leading-tight text-muted" dir="ltr">
                                {showTranslit && <span className="block italic text-gold">{w.transliteration?.text}</span>}
                                {w.translation?.text}
                              </span>
                            )}
                          </span>
                          );
                        })}
                        <span className="verse-end self-center">﴿{toAr(v.verse_number)}﴾</span>
                      </p>
                    ) : (
                      <p className="ar-text-sm font-arabic" dir="rtl">{v.text_uthmani} <span className="verse-end">﴿{toAr(v.verse_number)}﴾</span></p>
                    )}
                    {showTranslit && v.transliteration && !(active && hide > 0 && !revealed) && (
                      <p className="mt-3 italic leading-relaxed text-gold" dir="ltr" lang="en">{v.transliteration}</p>
                    )}
                    {showTranslation && <p className="mt-2 leading-relaxed text-muted" dir={meta.dir}>{v.translation}</p>}
                    {active && !kids && <SocialBar verseKey={v.verse_key} shareText={v.translation} />}
                    {active && (
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm" onClick={(e) => e.stopPropagation()}>
                        <span className="text-muted">🧠 {t("memorize")}</span>
                        <div className="inline-flex flex-wrap rounded-xl bg-bg p-1">
                          <button className={seg(hide === 0)} onClick={() => setHide(0)}>{t("hideNone")}</button>
                          <button className={seg(hide === 1)} onClick={() => setHide(1)}>{t("hideHalf")}</button>
                          <button className={seg(hide === 2)} onClick={() => setHide(2)}>{t("hideAll")}</button>
                        </div>
                      </div>
                    )}
                    {active && hide > 0 && !revealed && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-accent-soft p-3 text-sm" onClick={(e) => e.stopPropagation()}>
                        <span>{t("tapToReveal")}</span>
                        <button className={primary} onClick={() => setRevealed(true)}>{t("reveal")}</button>
                      </div>
                    )}
                    {active && hide > 0 && revealed && (
                      <div className="mt-3 rounded-xl bg-accent-soft p-3 text-sm" onClick={(e) => e.stopPropagation()}>
                        <p className="mb-2 font-medium">{t("rateQ")}</p>
                        {kids ? (
                          <div className="flex flex-wrap gap-2">
                            {([["again", "😕"], ["good", "🙂"], ["easy", "🤩"]] as const).map(([r, e]) => (
                              <button key={r} className="grid h-20 w-20 place-items-center rounded-3xl border-2 border-line bg-surface text-4xl transition hover:scale-110 hover:border-accent" onClick={() => onRate(r)} aria-label={t(r)}>
                                {e}<span className="text-xs font-semibold">{t(r)}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-full border border-line bg-surface px-4 py-1.5 font-medium hover:border-accent" onClick={() => onRate("again")}>↺ {t("again")}</button>
                          <button className={primary} onClick={() => onRate("good")}>✓ {t("good")}</button>
                          <button className="rounded-full border border-line bg-surface px-4 py-1.5 font-medium hover:border-accent" onClick={() => onRate("easy")}>★ {t("easy")}</button>
                        </div>
                        )}
                      </div>
                    )}
                    {(noteOpen === v.verse_key || notes[v.verse_key]) && (
                      <div className="mt-4 border-t border-line pt-4" onClick={(e) => e.stopPropagation()}>
                        {noteOpen === v.verse_key ? (
                          <textarea autoFocus rows={3} defaultValue={notes[v.verse_key]?.text ?? ""} placeholder={t("notePlaceholder")} onBlur={(e) => { saveNote(v.verse_key, e.target.value); setNoteOpen(null); }} className="w-full rounded-lg border border-line bg-bg p-3 text-sm outline-none focus:border-accent" />
                        ) : (
                          <button className="block w-full text-start text-sm italic text-muted hover:text-ink" onClick={() => setNoteOpen(v.verse_key)}>“{notes[v.verse_key].text}”</button>
                        )}
                      </div>
                    )}
                    {active && waiting && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-accent-soft p-3 text-sm">
                        <span>{t("learnHint")}</span>
                        <button className={primary} onClick={(e) => { e.stopPropagation(); advance(); }}>{t("continue")}</button>
                      </div>
                    )}
                    {active && !kids && (
                      <button className="mt-4 rounded-full border border-accent/30 px-4 py-1.5 text-sm font-medium text-accent lg:hidden" onClick={(e) => { e.stopPropagation(); setSheetOpen(true); }}>
                        📖 {t("tafsir")}
                      </button>
                    )}
                  </article>
                </li>
              );
            })}
          </ol>
          )}
          <p className="mt-6 text-center text-[11px] text-muted">{useRemote ? "quran.com" : "self-hosted"} · {verse.verse_key} · {dbg || "ok"}</p>
        </main>

        {!kids && <aside className="sticky top-20 my-5 hidden max-h-[calc(100vh-6rem)] self-start overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-card lg:block">
          <h2 className="mb-3 font-display text-lg font-semibold">{t("tafsir")} · {verse.verse_key}</h2>
          {tafsirBody}
        </aside>}
      </div>

      <audio
        ref={audioRef}
        src={useRemote ? verse.remoteAudioUrl : verse.audioUrl}
        onLoadedMetadata={() => { onMeta(); setDur(audioRef.current?.duration ?? 0); }}
        onCanPlay={() => { if (wantPlay.current) { wantPlay.current = false; play(); } }}
        onError={(e) => { const m = e.currentTarget.error; setDbg(`audio error ${m?.code ?? "?"}: ${m?.message ?? ""}`); if (!useRemote && verse.remoteAudioUrl) setUseRemote(true); }}
        onWaiting={() => setDbg("waiting for data")}
        onStalled={() => setDbg("stalled")}
        onTimeUpdate={() => { onTime(); setCur(audioRef.current?.currentTime ?? 0); }}
        onEnded={() => { setDbg("ended"); onEnded(); }}
        onPause={() => setPlaying(false)}
        onPlay={() => { setPlaying(true); window.dispatchEvent(new Event("tf-audio-start")); }}
        preload="auto"
      />

      {gateOpen && limitHit && <AuthGate mode={needsVerify ? "verify" : "register"} onClose={() => setGateOpen(false)} />}

      {note && (
        <div role="status" className="fixed inset-x-0 bottom-28 z-50 flex justify-center px-4">
          <p className={`rounded-full bg-ink px-4 py-2 text-sm text-bg shadow-card ${kids ? "pop text-base" : ""}`}>{kids ? "🌟 " : ""}{note}</p>
        </div>
      )}

      {/* Floating player dock */}
      <div className="fixed inset-x-0 bottom-[4.5rem] z-40 px-3 lg:bottom-3">
        <div dir="ltr" className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-line bg-surface/95 shadow-[0_10px_40px_rgba(0,0,0,0.2)] backdrop-blur">
          <div className="h-1 bg-line"><div className="h-1 bg-accent transition-all" style={{ width: `${((idx + 1) / verses.length) * 100}%` }} /></div>
          <div className="flex items-center gap-2 px-4 pt-2.5 text-[11px] tabular-nums text-muted">
            <span className="w-8 text-end">{fmt(cur)}</span>
            <input type="range" min={0} max={dur || 1} step={0.1} value={Math.min(cur, dur || 1)} onChange={(e) => { const a = audioRef.current; if (a) { a.currentTime = Number(e.target.value); setCur(a.currentTime); } }} className="h-1 min-w-0 flex-1 accent-[rgb(var(--accent))]" aria-label="seek" />
            <span className="w-8">{fmt(dur)}</span>
            <button className="grid h-7 w-7 place-items-center rounded-full hover:text-ink" onClick={() => setVol(vol === 0 ? 1 : 0)} aria-label={t("volume")}><IconVolume muted={vol === 0} /></button>
          </div>
          <div className="flex items-center justify-between gap-2 px-3 pb-2.5 pt-1">
            <span className="w-16 text-xs leading-tight text-muted">{t("verse")} {verse.verse_number}<br />{t("of")} {verses.length}</span>
            <div className="flex items-center gap-1">
              <button className={dockBtn} onClick={() => goTo(Math.max(0, idx - 1), false)} aria-label={t("prev")}><IconPrev /></button>
              <button
                className="grid h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-card transition hover:opacity-90"
                onClick={() => (playing ? audioRef.current?.pause() : play())}
                aria-label={playing ? t("pause") : t("play")}
              >{playing ? <IconPause /> : <IconPlay />}</button>
              <button className={dockBtn} onClick={() => goTo(Math.min(verses.length - 1, idx + 1), false)} aria-label={t("next")}><IconNext /></button>
            </div>
            <select value={idx} onChange={(e) => goTo(Number(e.target.value), false)} className={`${field} w-16`} aria-label={t("jump")}>
              {verses.map((v, i) => <option key={v.verse_key} value={i}>{v.verse_number}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-surface p-5 shadow-xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display font-semibold">{t("tafsir")} · {verse.verse_key}</h2>
              <button className="text-sm font-medium text-accent" onClick={() => setSheetOpen(false)}>{t("closeTafsir")}</button>
            </div>
            {tafsirBody}
          </div>
        </div>
      )}
    </div>
  );
}
