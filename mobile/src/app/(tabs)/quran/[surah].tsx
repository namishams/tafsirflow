import { VerseShare } from "@/features/share/ShareKit";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import { FlatList, Modal, Platform, Pressable, ScrollView, Share, Switch, Text, View } from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { useTabBarSpace } from "@/components/TabBar";
import { Chip, GoldCard } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ErrorState, Loading, ProBadge, goBack } from "@/components/page";
import { intlLocale, useLang, useT } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { SITE } from "@/lib/api";
import { openPro, usePro } from "@/lib/pro";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { getChapter, getChapters, getVerses, type Chapter, type Verse, reciterName } from "@/lib/quran";
import { rate, type Rating } from "@/web/learning";
import { useReciter, isFreeReciter, freeReciter } from "@/features/quran/reciter";
import { toAr, useEngine } from "@/features/quran/useVerseAudio";
import { VerseWords, wordAt } from "@/features/quran/VerseWords";
import { TafsirPanel } from "@/features/quran/TafsirPanel";
import { useClip } from "@/features/coursekit/audio";
import { useReduceMotion } from "@/features/radio/motion";
import { SurahOpening } from "@/features/reader/SurahOpening";
import { SurahPicker } from "@/features/reader/SurahPicker";
import { VerseCard, IDLE, type CardHandlers, type CardState, type TestDone } from "@/features/reader/VerseCard";
import { MemoControls } from "@/features/reader/MemoControls";
import { FocusMode } from "@/features/reader/FocusMode";
import { ReaderTopBar, TOP_BAR_H } from "@/features/reader/ReaderTopBar";
import { useReaderT } from "@/features/reader/texts";
import { drillOf, hideOf, ratingOfScore, readMemo, type Level, type Memo, type Tool } from "@/features/reader/memo";
import { PlayerDock, type Turn } from "@/features/reader/PlayerDock";
import { ReaderNowPlaying } from "@/features/reader/ReaderNowPlaying";
import { loadText, localVerseUri, removeSurah, saveSurah, saveText, savedInfo } from "@/features/reader/offline";
import * as vp from "@/features/reader/versePlayback";

// The surah reader with its player, presented like the website's Player.tsx: the illuminated opening of the surah,
// the surah picker, compact verse cards with the active verse framed in gold (word highlighting, Read / Practise /
// Test, self-rating, bookmark, note, share, Tafsir, Shams Method), the reading view, the settings sheet (reciter, size,
// mode (continuous / learn), repeat, speed, pause to repeat ("your turn"), sleep timer, loop range, what to show, saving
// the surah offline) and the floating jewel dock with a full player. Playback continues verse after verse in the
// background, on the lock screen and after leaving the reader (features/reader/versePlayback.ts + the verse mini bar).
// memo: the memorising mode and practise level (features/reader/memo.ts), remembered per user; drill: the earlier
// whole-surah cover value, read once to carry an old choice over
type Prefs = { translit: boolean; translation: boolean; words: boolean; size: number; repeat: number; speed: number; drill: number; mode: vp.Mode; memo?: Memo };
const PREFS: Prefs = { translit: true, translation: true, words: false, size: 1, repeat: 1, speed: 1, drill: 0, mode: "continuous" };
// auto-follow pauses this long after the learner scrolled by hand (like Apple Music lyrics)
const FOLLOW_PAUSE_MS = 5000;
type Notes = Record<string, { text: string; at: number }>;
type Offline = { state: "none" | "saving" | "saved" | "error"; done: number; bytes: number };

export default function SurahReader() {
  const params = useLocalSearchParams<{ surah: string; v?: string; tafsir?: string; m?: string; shams?: string; reciter?: string }>();
  const surah = Math.max(1, Math.min(114, Number(params.surah) || 1));
  // website links: m=2 (practise / review) and shams=1 open the verse in the Shams Method
  useEffect(() => { if (params.m === "2" || params.shams === "1") router.replace(`/shams/${surah}${params.v ? `?v=${params.v}` : ""}` as Href); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { lang } = useLang();
  const { pro } = usePro();
  const [reciter, setReciter, all] = useReciter();
  // ?reciter=<slug> (a reciter's page, website links) wins over the saved choice
  const wanted = useRef(params.reciter ?? "");
  useEffect(() => {
    if (!wanted.current) return;
    const r = all.find((x) => x.slug === wanted.current);
    if (r) { wanted.current = ""; if (pro || isFreeReciter(r)) setReciter(r); }
  }, [all, pro, setReciter]);
  // another reciter keeps the reader (position, open sheet) on screen while the new verse files load;
  // only another surah or language shows the loading state
  const base = `${surah}:${lang}`;
  const [data, setData] = useState<{ key: string; chapter: Chapter; verses: Verse[] } | null>(null);
  const [failed, setFailed] = useState(false);
  const req = useRef(0);
  const shown = useRef<string | null>(null);
  shown.current = data?.key ?? null;
  const load = useCallback(() => {
    const n = ++req.current;
    setFailed(false);
    setData((d) => (d && d.key === base ? d : null));
    Promise.all([getChapter(surah, lang), getVerses(surah, lang, reciter)])
      .then(([c, v]) => { if (n === req.current) setData({ key: base, chapter: c, verses: v }); })
      .catch(async () => {
        // no connection: a surah saved offline still opens from its saved text
        const saved = await loadText<{ chapter: Chapter; verses: Verse[] }>(surah, reciter.folder, lang);
        if (n !== req.current) return;
        if (saved?.chapter && saved.verses?.length) setData({ key: base, chapter: saved.chapter, verses: saved.verses });
        else if (shown.current !== base) setFailed(true);
      });
  }, [surah, lang, reciter, base]);
  useEffect(load, [load]);
  const ready = data && data.key === base ? data : null;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {failed ? <ErrorState retry={load} /> : !ready ? <Loading /> : (
        <Reader key={surah} chapter={ready.chapter} verses={ready.verses} start={Number(params.v) || 0} openTafsir={params.tafsir === "1"} />
      )}
    </>
  );
}

function Reader({ chapter, verses, start, openTafsir }: { chapter: Chapter; verses: Verse[]; start: number; openTafsir: boolean }) {
  const t = useTheme();
  const w = useWebT("player");
  const wh = useWebT("home");
  const wn = useWebT("nav");
  const rt = useReaderT();
  const { lang } = useLang();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const reduce = useReduceMotion();
  const clip = useClip();
  const { pro } = usePro();
  const [reciter, setReciter, reciters] = useReciter();
  const prefs = { ...PREFS, ...useStored<Partial<Prefs>>("qmc.reader", {}) };
  const setPref = (p: Partial<Prefs>) => writeJSON("qmc.reader", { ...prefs, ...p }, true);
  // the memorising mode (Read · Practise · Test · Listen & repeat · Random check), the same in the card and the surah bar
  const memoKey = JSON.stringify(prefs.memo ?? null);
  const memo = useMemo(() => {
    const m = readMemo(prefs.memo, prefs.drill);
    return m;
  }, [memoKey, prefs.drill]); // eslint-disable-line react-hooks/exhaustive-deps
  const setMemo = (p: Partial<Memo>) => setPref({ memo: { ...memo, ...p }, drill: 0 });
  const listen = memo.tool === "listen";
  const showWords = prefs.words;
  const showTranslit = prefs.translit;
  const mode: vp.Mode = listen ? "continuous" : prefs.mode ?? "continuous";
  const gapPref = useStored<number>("tf:gap", 0);
  // Listen & repeat: after every recitation a pause as long as the verse ("your turn")
  const gap = listen ? -1 : gapPref;
  const setGap = (g: number) => writeJSON("tf:gap", g, true);
  const [view, setViewState] = useState<"verses" | "reading">(() => (readJSON<string>("tf:view", "verses") === "reading" ? "reading" : "verses"));
  const setView = (v: "verses" | "reading") => { setViewState(v); writeJSON("tf:view", v, true); };
  const [idx, setIdx] = useState(Math.max(0, Math.min(verses.length - 1, (start || 1) - 1)));
  const [shareKey, setShareKey] = useState<string | null>(null);
  const [tafsirFor, setTafsirFor] = useState<Verse | null>(openTafsir && start ? verses[start - 1] ?? null : null);
  const [settings, setSettings] = useState(false);
  const [nowOpen, setNowOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [sleep, setSleep] = useState<{ mode: number; until: number }>({ mode: 0, until: 0 });
  const [loop, setLoop] = useState({ on: false, from: 1, to: verses.length });
  const [waiting, setWaiting] = useState(false); // learn mode: paused until "Continue"
  const [turn, setTurn] = useState<Turn | null>(null); // "your turn" countdown during the pause after a verse
  const gapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const marks = useStored<string[]>("tf:bookmarks", []);
  const [notes, setNotes] = useState<Notes>(() => readJSON<Notes>("tf:notes", {}));
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  // memorising tools of the active verse (website Player.tsx)
  const hide = hideOf(memo);
  const drill = drillOf(memo);
  const [seed, setSeed] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [shown, setShown] = useState<number[]>([]); // single words revealed by a tap
  const [testPos, setTestPos] = useState(0);
  const [testMarks, setTestMarks] = useState<Record<number, boolean>>({});
  const [testDone, setTestDone] = useState<TestDone | null>(null);
  const [wordKey, setWordKey] = useState<string | null>(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [offline, setOffline] = useState<Offline>(() => { const s = savedInfo(chapter.id, reciter.folder); return s ? { state: "saved", done: s.n, bytes: s.bytes } : { state: "none", done: 0, bytes: 0 }; });
  const abort = useRef<AbortController | null>(null);
  const list = useRef<FlatList<Verse>>(null);
  const readRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const plays = useRef(0);
  const verse = verses[idx];

  // the reader's player is shared and outlives this screen (features/reader/versePlayback.ts)
  const engine = vp.getEngine();
  const audio = useEngine(engine);
  const handlers = useRef<vp.Handlers>({});
  const pb = vp.useVersePlayback();
  const mine = pb.attached && vp.isAttached(handlers);
  const playing = mine && audio.playing;
  const positionMs = mine ? audio.positionMs : 0;
  const durationMs = mine ? audio.durationMs : 0;
  // what plays: a surah saved offline plays from the device
  // (offline files are part of Pro: when Pro has ended the verses stream again)
  const items = useMemo<vp.Item[]>(() => verses.map((v) => ({ url: (pro ? localVerseUri(chapter.id, reciter.folder, v.verse_number) : null) ?? v.audioUrl, remote: v.remoteAudioUrl })),
    [verses, chapter.id, reciter.folder, offline.state, pro]); // eslint-disable-line react-hooks/exhaustive-deps
  const live = useRef({ chapterId: chapter.id, folder: reciter.folder });
  live.current = { chapterId: chapter.id, folder: reciter.folder };

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  useEffect(() => { if (start > 1) setTimeout(() => scrollTo(start - 1, true, false), 300); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => abort.current?.abort(), []);
  // in charge of the shared player while this reader is on screen; leaving it lets a playing session carry on headless
  useFocusEffect(useCallback(() => {
    const s = vp.current();
    const same = !!s && s.chapterId === live.current.chapterId && s.reciterFolder === live.current.folder;
    // another surah is playing in the background: it keeps playing (mini bar) until this reader is played
    if (!s || same || !engine.getSnapshot().playing) {
      vp.attach(handlers);
      if (s && same) {
        plays.current = s.playsDone;
        setIdx(s.idx);
        setTimeout(() => scrollTo(s.idx, true, false), 250);
      }
    }
    return () => {
      const pending = !!gapTimer.current;
      if (gapTimer.current) { clearTimeout(gapTimer.current); gapTimer.current = null; }
      setTurn(null);
      vp.detach(handlers, plays.current);
      if (pending) vp.advanceHeadless();
    };
  }, [engine]));
  // the session the mini bar continues
  useEffect(() => {
    if (!mine) return;
    // a Pro voice or offline files: the background session falls back to the free voice if Pro ends while it plays
    const locked = !isFreeReciter(reciter) || items.some((x, k) => x.url !== verses[k]?.audioUrl);
    vp.sync({ chapterId: chapter.id, chapterName: chapter.name_simple, reciterName: reciter.name, reciterFolder: reciter.folder, items, idx, repeat: prefs.repeat, playsDone: plays.current,
      mode, loopOn: loop.on, loopFrom: loop.from, loopTo: loop.to, speed: prefs.speed, locked, free: freeReciter() });
  }, [mine, chapter, reciter, items, idx, prefs.repeat, mode, loop, prefs.speed]); // eslint-disable-line react-hooks/exhaustive-deps
  // remember where the learner stopped
  useEffect(() => { writeJSON("tf:last", { chapter: chapter.id, verse: verses[idx].verse_number, at: Date.now() }); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setRevealed(false); setTestPos(0); setTestMarks({}); setTestDone(null); setShown([]); }, [idx, hide]);
  useEffect(() => { setShown([]); }, [seed]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 2600); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { if (clip.state === "idle" || clip.state === "error") setWordKey(null); }, [clip.state]);
  // sleep timer: also stops in the middle of a long verse
  useEffect(() => {
    if (sleep.mode <= 0) return;
    const iv = setInterval(() => { if (Date.now() >= sleep.until) { if (vp.isAttached(handlers)) audio.pause(); clearGap(); setSleep({ mode: 0, until: 0 }); } }, 5000);
    return () => clearInterval(iv);
  }, [sleep]); // eslint-disable-line react-hooks/exhaustive-deps
  // another reciter: the offline state belongs to the voice, and a playing verse continues in the new voice
  useEffect(() => { const s = savedInfo(chapter.id, reciter.folder); setOffline(s ? { state: "saved", done: s.n, bytes: s.bytes } : { state: "none", done: 0, bytes: 0 }); }, [reciter.folder]); // eslint-disable-line react-hooks/exhaustive-deps
  const prevVerses = useRef(verses);
  useEffect(() => {
    if (prevVerses.current === verses) return;
    const voice = prevVerses.current[0]?.audioUrl !== verses[0]?.audioUrl;
    prevVerses.current = verses;
    if (voice && mine && engine.getSnapshot().playing) playAt(idx);
  }, [verses]); // eslint-disable-line react-hooks/exhaustive-deps

  // Self-hosted files may be a different recording than the one the timings belong to: if the file length is far from
  // the last word's end, word highlighting is switched off for that verse (website onMeta).
  const lastEnd = useMemo(() => verse.segments.reduce((m, s) => Math.max(m, s.end), 0), [verse]);
  const timingsOk = !(mine && audio.loadedUrl === items[idx]?.url && !audio.fallback && audio.durationMs > 0 && lastEnd > 0 && Math.abs(audio.durationMs - lastEnd) > 1500);

  const clearGap = () => { if (gapTimer.current) { clearTimeout(gapTimer.current); gapTimer.current = null; } setTurn(null); };
  // ── auto-follow ──────────────────────────────────────────────────────────────────────────────────────────────────
  // The playing verse is aligned with its top just below the pinned top bar (safe area + bar + a small margin), so its
  // Arabic line can be read along. The cards change size when a verse becomes active (tools, social bar) and the one
  // before shrinks, so the card is aligned again after its layout settled (onLayout of the active card + a late check).
  // Scrolling by hand pauses the follow for a few seconds and offers a "back to the current verse" pill.
  const topOffset = insets.top + TOP_BAR_H + 4;
  const follow = useRef<{ i: number; until: number; tries: number } | null>(null);
  const dragging = useRef(false);
  const pausedUntil = useRef(0);
  const [manual, setManual] = useState(false);
  const [visible, setVisible] = useState<number[]>([]);
  const viewRef = useRef(view);
  viewRef.current = view;
  const reduceRef = useRef(reduce);
  reduceRef.current = reduce;
  const alignActive = (i: number, animated = true) => {
    if (dragging.current) return;
    try { list.current?.scrollToIndex({ index: i, viewPosition: 0, viewOffset: topOffset, animated: animated && !reduceRef.current }); } catch { /* not measured yet: onScrollToIndexFailed */ }
  };
  const scrollTo = (i: number, force = false, animated = true) => {
    if (!force && (dragging.current || Date.now() < pausedUntil.current)) return;
    if (force) pausedUntil.current = 0;
    setManual(false);
    if (viewRef.current === "reading") { setTimeout(() => readingFollow(i, force), 60); return; }
    follow.current = { i, until: Date.now() + 1600, tries: 0 };
    // first after the new layout (the card grows, the one before shrinks), then once more when everything settled
    setTimeout(() => { if (follow.current?.i === i) alignActive(i, animated); }, 140);
    setTimeout(() => { if (follow.current?.i === i) alignActive(i, animated); }, 520);
  };
  const onActiveLayout = (i: number) => {
    const f = follow.current;
    if (!f || f.i !== i || Date.now() > f.until) return;
    setTimeout(() => alignActive(i, true), 40);
  };
  const onDragStart = () => { dragging.current = true; follow.current = null; setManual(true); };
  const onDragEnd = () => { dragging.current = false; pausedUntil.current = Date.now() + FOLLOW_PAUSE_MS; };
  const viewability = useRef({ itemVisiblePercentThreshold: 20 }).current;
  const onViewable = useRef(({ viewableItems }: { viewableItems: { index?: number | null }[] }) => {
    setVisible(viewableItems.map((x) => x.index ?? -1).filter((x) => x >= 0));
  }).current;
  // the reading (mushaf) view: one justified text, so the line of the highlighted verse comes from onTextLayout
  const reading = useRef({ cardY: 0, lines: [] as { y: number; height: number; text: string }[], h: 0 });
  const scrollY = useRef(0);
  const verseStarts = useMemo(() => {
    let n = 0;
    return verses.map((v) => { const at = n; n += `${v.text_uthmani} ﴿${toAr(v.verse_number)}﴾ `.length; return at; });
  }, [verses]);
  const lineOf = (i: number) => {
    const { lines } = reading.current;
    let n = 0;
    for (const l of lines) { if (n + l.text.length > verseStarts[i]) return l; n += l.text.length; }
    return lines[lines.length - 1];
  };
  const readingFollow = (i: number, force: boolean) => {
    const l = lineOf(i);
    if (!l) return;
    const y = reading.current.cardY + 22 + l.y;
    const top = scrollY.current + topOffset;
    const bottom = scrollY.current + reading.current.h - (tabSpace + 140);
    if (force || y < top || y + l.height > bottom) readRef.current?.scrollTo({ y: Math.max(0, y - topOffset - 8), animated: !reduceRef.current });
  };
  const [readingVisible, setReadingVisible] = useState(true);
  const checkReadingVisible = () => {
    const l = lineOf(idx);
    if (!l) return;
    const y = reading.current.cardY + 22 + l.y;
    const ok = y + l.height > scrollY.current + topOffset && y < scrollY.current + reading.current.h - (tabSpace + 140);
    if (ok !== readingVisible) setReadingVisible(ok);
  };
  // the top bar turns to glass once the surah banner has scrolled under it
  const bannerEnd = useRef(0);
  const [solid, setSolid] = useState(false);
  const onScroll = (y: number) => {
    scrollY.current = y;
    const s = bannerEnd.current > 0 && y > bannerEnd.current - topOffset;
    if (s !== solid) setSolid(s);
    if (viewRef.current === "reading" && manual) checkReadingVisible();
  };

  const playAt = (i: number, auto = false) => {
    const v = verses[i];
    if (!v) return;
    clearGap(); setWaiting(false);
    if (!vp.isAttached(handlers)) vp.attach(handlers);
    plays.current = 0;
    setIdx(i);
    audio.play(items[i]?.url ?? v.audioUrl, { fallback: v.remoteAudioUrl, rate: prefs.speed, title: `${chapter.name_simple} · ${v.verse_number}`, artist: reciterName(reciter, lang), track: { surah: chapter.id, reciter: reciter.name } });
    scrollTo(i, !auto);
  };
  const goTo = (i: number, autoplay: boolean) => {
    if (autoplay) { playAt(i); return; }
    clearGap(); setWaiting(false);
    if (mine) audio.stop();
    plays.current = 0; setIdx(i); scrollTo(i, true);
  };
  // Random check: another verse of the surah (not the current one), fully covered
  const startCheck = () => {
    if (verses.length < 2) { setRevealed(false); return; }
    let n = idx;
    while (n === idx) n = Math.floor(Math.random() * verses.length);
    goTo(n, false);
  };
  const setTool = (tool: Tool) => {
    setMemo({ tool });
    if (tool === "check") startCheck();
    if (tool === "listen") playAt(idx);
  };
  // after a recitation: wait ("your turn", -1 = as long as the verse) so the listener can repeat it, then continue
  const afterGap = (next: () => void) => {
    const ms = gap === -1 ? Math.round((audio.durationMs || 4000) / Math.max(0.5, prefs.speed)) : gap * 1000;
    if (!ms) { next(); return; }
    setTurn({ ms, key: Date.now() });
    gapTimer.current = setTimeout(() => { gapTimer.current = null; setTurn(null); next(); }, ms);
  };
  const advance = () => {
    clearGap(); setWaiting(false);
    if (sleep.mode === -1 && idx >= verses.length - 1) { setSleep({ mode: 0, until: 0 }); return; } // sleep timer: end of surah
    if (loop.on && idx >= loop.to - 1 && sleep.mode !== -1) { playAt(Math.max(0, loop.from - 1), true); return; }
    if (idx < verses.length - 1) playAt(idx + 1, true);
  };
  handlers.current.ended = () => {
    plays.current += 1;
    if (sleep.mode > 0 && Date.now() >= sleep.until) { setSleep({ mode: 0, until: 0 }); return; } // sleep timer reached
    if (plays.current < prefs.repeat) { afterGap(() => audio.seekPlay(0)); return; }
    if (mode === "learn") { setWaiting(true); return; } // learn mode waits for "Continue"
    afterGap(advance);
  };
  const toggle = () => {
    if (turn) { clearGap(); return; } // stop the pause after a verse
    if (playing) { audio.pause(); return; }
    if (mine && !audio.ended && audio.positionMs > 0 && audio.durationMs > 0 && engine.url === items[idx]?.url) { audio.resume(); return; }
    playAt(idx);
  };
  const toggleMark = (k: string) => writeJSON("tf:bookmarks", marks.includes(k) ? marks.filter((x) => x !== k) : [...marks, k]);
  const saveNote = (k: string, text: string) => { const n = { ...notes }; if (text.trim()) n[k] = { text: text.trim(), at: Date.now() }; else delete n[k]; setNotes(n); writeJSON("tf:notes", n); };
  const setSpeed = (n: number) => { setPref({ speed: n }); if (mine) audio.setRate(n); };
  const setSleepMode = (n: number) => setSleep({ mode: n, until: n > 0 ? Date.now() + n * 60000 : 0 });
  const activeWord = playing && timingsOk ? wordAt(verse, positionMs) : null;
  const sleepMin = sleep.mode > 0 ? Math.max(1, Math.ceil((sleep.until - Date.now()) / 60000)) : sleep.mode === -1 ? 0 : null;
  const seekTo = (ms: number) => { if (!mine) return; if (audio.playing) audio.seekPlay(ms); else audio.seek(ms); };
  const pickReciter = (r: (typeof reciters)[number]) => {
    if (!pro && !isFreeReciter(r)) { setSettings(false); setTimeout(() => openPro("reciters"), 350); return; }
    setReciter(r);
  };

  // everything a verse card can do, behind stable functions so the quiet cards do not redraw while a verse plays
  const impl = {
    goTo: (i: number) => goTo(i, true),
    playVerse: (i: number) => (i === idx && playing ? audio.pause() : playAt(i)),
    toggleMark,
    openNote: (k: string | null) => setNoteOpen(k),
    saveNote,
    setTool,
    setLevel: (l: Level) => setMemo({ tool: "practice", level: l }),
    shuffle: () => setSeed((x) => x + 1),
    reveal: () => setRevealed(true),
    // tap a covered word: only this word is revealed, and heard
    revealWord: (wi: number, pos: number) => {
      setShown((s) => (s.includes(wi) ? s : [...s, wi]));
      liveImpl.current.playWord(verse.verse_key, pos);
    },
    // Test: word by word; the final score goes into the spaced-repetition schedule (web/learning rate())
    markWord: (ok: boolean) => {
      const n = verse.words.filter((x) => x.char_type_name === "word").length;
      if (testPos >= n || testDone) return;
      const marks = { ...testMarks, [testPos]: ok };
      setTestMarks(marks);
      setTestPos(testPos + 1);
      if (testPos + 1 >= n) {
        setRevealed(true);
        const good = Object.values(marks).filter(Boolean).length;
        const pct = Math.round((good / Math.max(1, n)) * 100);
        const days = rate(verse.verse_key, ratingOfScore(pct));
        setTestDone({ ok: good, total: n, pct, days });
      }
    },
    testAgain: () => { setRevealed(false); setTestPos(0); setTestMarks({}); setTestDone(null); },
    next: () => { if (idx < verses.length - 1) goTo(idx + 1, false); },
    nextCheck: () => startCheck(),
    focus: () => setFocusOpen(true),
    layout: (i: number) => onActiveLayout(i),
    rate: (r: Rating) => {
      const days = rate(verse.verse_key, r);
      setToast(days ? w("saved", { days }) : w("savedToday"));
      if (memo.tool === "check") { startCheck(); return; }
      if (idx < verses.length - 1) goTo(idx + 1, false);
    },
    tafsir: (v: Verse) => setTafsirFor(v),
    shams: (v: Verse) => { if (mine) audio.stop(); router.push(`/shams/${chapter.id}?v=${v.verse_number}` as Href); },
    // share: the Instagram-style share sheet with the verse card (paper plane)
    share: (v: Verse) => setShareKey(v.verse_key),
    // copy (website copyVerse): the Arabic, the translation and the reference; the share sheet carries "Copy"
    copy: (v: Verse) => {
      const message = [v.text_uthmani, v.translation, `— ${chapter.name_simple} ${v.verse_key}`].filter(Boolean).join("\n\n");
      void Share.share({ message }).catch(() => undefined);
    },
    // tap a word: hear it on its own (Quran.com word recordings, like the website)
    playWord: (key: string, pos: number) => {
      const [s, a] = key.split(":").map((n) => n.padStart(3, "0"));
      if (mine) audio.pause();
      clearGap();
      setWordKey(`${key}:${pos}`);
      clip.play(`https://audio.qurancdn.com/wbw/${s}_${a}_${String(pos).padStart(3, "0")}.mp3`);
    },
    cont: () => advance(),
    replay: () => playAt(idx),
    pause: () => { clearGap(); if (mine) audio.pause(); },
  } satisfies CardHandlers;
  const liveImpl = useRef(impl);
  liveImpl.current = impl;
  const cardHandlers = useMemo<CardHandlers>(() => {
    const keys = Object.keys(liveImpl.current) as (keyof CardHandlers)[];
    return Object.fromEntries(keys.map((k) => [k, (...args: unknown[]) => (liveImpl.current[k] as (...a: unknown[]) => void)(...args)])) as CardHandlers;
  }, []);

  const activeState = useMemo<CardState>(() => ({ hide, memo, revealed, seed, testPos, testMarks, shown, activeWord, playing, wordOn: wordKey, waiting: waiting && mode === "learn", turn: !!turn, testDone, reduce }),
    [hide, memo, revealed, seed, testPos, testMarks, shown, activeWord, playing, wordKey, waiting, mode, turn, testDone, reduce]);
  const idleState = useMemo<CardState>(() => ({ ...IDLE, hide: drill, seed: drill ? seed : 1, reduce }), [drill, seed, reduce]);
  const setAll = useRef((on: boolean) => undefined as void);
  setAll.current = (on: boolean) => setMemo({ all: on });
  // the store hands out a fresh array on every read: key the bookmarks by their content
  const marksKey = marks.join("|");
  const markSet = useMemo(() => new Set(marksKey ? marksKey.split("|") : []), [marksKey]);
  const renderItem = useCallback(({ item: v, index: i }: { item: Verse; index: number }) => (
    <VerseCard v={v} i={i} active={i === idx} marked={markSet.has(v.verse_key)} note={notes[v.verse_key]?.text} noteOpen={noteOpen === v.verse_key}
      translit={showTranslit} translation={prefs.translation} words={showWords} scale={prefs.size} st={i === idx ? activeState : idleState} h={cardHandlers} />
  ), [idx, markSet, notes, noteOpen, showTranslit, prefs.translation, showWords, prefs.size, activeState, idleState, cardHandlers]);

  // offline (Pro): every verse file of this surah for this reciter
  const saveOffline = async () => {
    if (!pro) { openPro("offline"); return; }
    abort.current = new AbortController();
    setOffline({ state: "saving", done: 0, bytes: 0 });
    try {
      const bytes = await saveSurah(chapter.id, reciter.folder, verses.map((v) => v.audioUrl), (done) => setOffline((o) => ({ ...o, done })), abort.current.signal);
      saveText(chapter.id, reciter.folder, lang, { chapter, verses });
      setOffline({ state: "saved", done: verses.length, bytes });
    } catch {
      setOffline((o) => ({ ...o, state: "error" }));
    }
  };
  const removeOffline = () => { removeSurah(chapter.id, reciter.folder, verses.length); setOffline({ state: "none", done: 0, bytes: 0 }); };
  const mb = (bytes: number) => Math.max(0.1, Math.round((bytes / 1048576) * 10) / 10).toLocaleString(intlLocale(lang));

  const header = useMemo(() => (
    <View>
      {/* room for the pinned top bar */}
      <View style={{ height: insets.top + TOP_BAR_H - 6 }} />
      <View onLayout={(e) => { bannerEnd.current = e.nativeEvent.layout.y + e.nativeEvent.layout.height; }}>
        <SurahOpening chapter={chapter} reduce={reduce} />
      </View>
      <View style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <CircleButton icon="chevronLeft" label={wh("surahLabel", { n: chapter.id - 1 })} disabled={chapter.id <= 1} onPress={() => go(chapter.id - 1)} />
          <View style={{ flex: 1, minWidth: 0 }}><SurahPicker current={chapter} chapters={chapters} onPick={go} /></View>
          <CircleButton icon="chevronRight" label={wh("surahLabel", { n: chapter.id + 1 })} disabled={chapter.id >= 114} onPress={() => go(chapter.id + 1)} />
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", rowGap: 8, columnGap: 12, marginTop: 12 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, fontVariant: ["tabular-nums"] }}>{verse.page > 0 ? `${w("page")} ${verse.page} · ${w("juz")} ${verse.juz} · ${w("hizb")} ${verse.hizb}` : ""}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ flexDirection: "row", backgroundColor: t.bg, borderRadius: R.pill, padding: 4, borderWidth: 1, borderColor: t.line }} accessibilityRole="tablist">
              {([["verses", w("viewVerses")], ["reading", w("viewReading")]] as const).map(([k, l]) => (
                <Pressable key={k} onPress={() => setView(k)} accessibilityRole="tab" accessibilityState={{ selected: view === k }} accessibilityLabel={l} hitSlop={{ top: 4, bottom: 4 }}
                  style={{ paddingHorizontal: 13, height: 36, justifyContent: "center", borderRadius: R.pill, backgroundColor: view === k ? t.surface : "transparent", borderWidth: view === k ? 1 : 0, borderColor: t.line }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: view === k ? t.ink : t.muted }}>{l}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setSettings(true)} accessibilityRole="button" accessibilityLabel={w("settings")}
              style={{ height: 44, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 6 }}>
              <Icon name="settings" color={t.muted} size={17} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{w("settings")}</Text>
            </Pressable>
          </View>
        </View>
        {view === "verses" ? (
          <View style={{ marginTop: 14, borderRadius: 16, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 8 }}>
            <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: t.muted }} accessibilityRole="header">{w("memorize")}</Text>
            <MemoControls memo={memo} onTool={cardHandlers.setTool} onLevel={cardHandlers.setLevel} onShuffle={cardHandlers.shuffle} onAll={(on) => setAll.current(on)} />
            {drill > 0 ? <Text maxFontSizeMultiplier={1.8} style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{w("tapToReveal")}</Text> : null}
          </View>
        ) : null}
      </View>
    </View>
  ), [chapter, chapters, verse.page, verse.juz, verse.hizb, view, insets.top, reduce, t, w, wh, drill, memo, cardHandlers]);
  const shownSet = useMemo(() => new Set(shown), [shown]);
  const dockBottom = tabSpace - 4;
  const bottomSpace = tabSpace + 150;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {view === "reading" ? (
        <ScrollView ref={readRef} contentContainerStyle={{ paddingBottom: bottomSpace }} scrollEventThrottle={32}
          onLayout={(e) => { reading.current.h = e.nativeEvent.layout.height; }}
          onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y)}
          onScrollBeginDrag={onDragStart} onScrollEndDrag={onDragEnd} onMomentumScrollEnd={onDragEnd}>
          {header}
          <View onLayout={(e) => { reading.current.cardY = e.nativeEvent.layout.y; }}
            style={{ margin: 16, borderRadius: 16, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 22 }}>
            <Text maxFontSizeMultiplier={1.5} onTextLayout={(e) => { reading.current.lines = e.nativeEvent.lines.map((l) => ({ y: l.y, height: l.height, text: l.text })); }}
              style={{ fontFamily: ARABIC_FONT, fontSize: Math.round(30 * prefs.size * 0.95), lineHeight: Math.round(30 * prefs.size * 2.5), color: t.arabic, textAlign: "justify", writingDirection: "rtl" }} accessibilityLanguage="ar">
              {verses.map((v, i) => (
                <Text key={v.verse_key} onPress={() => goTo(i, true)} accessibilityRole="button" style={{ backgroundColor: i === idx ? t.accentSoft : "transparent", color: i === idx ? t.accent : t.arabic }}>
                  {v.text_uthmani} <Text style={{ color: t.gold, fontSize: 30 * prefs.size * 0.65 }}>﴿{toAr(v.verse_number)}﴾</Text>{" "}
                </Text>
              ))}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          ref={list}
          data={verses}
          keyExtractor={(v) => v.verse_key}
          ListHeaderComponent={header}
          extraData={activeState}
          renderItem={renderItem}
          initialNumToRender={8}
          windowSize={9}
          contentContainerStyle={{ paddingBottom: bottomSpace }}
          scrollEventThrottle={32}
          onScroll={(e) => onScroll(e.nativeEvent.contentOffset.y)}
          onScrollBeginDrag={onDragStart} onScrollEndDrag={onDragEnd} onMomentumScrollEnd={onDragEnd}
          viewabilityConfig={viewability} onViewableItemsChanged={onViewable}
          // a verse far away has not been measured yet: jump near it, then align it once it is rendered
          onScrollToIndexFailed={(e) => {
            const f = follow.current;
            if (f && f.i === e.index) { f.tries += 1; f.until = Date.now() + 1600; if (f.tries > 4) return; }
            list.current?.scrollToOffset({ offset: Math.max(0, e.averageItemLength * e.index), animated: false });
            setTimeout(() => alignActive(e.index, false), 120);
          }}
        />
      )}

      <ReaderTopBar top={insets.top} solid={solid} reduce={reduce} arabicName={chapter.name_arabic} brand={wn("menuTitle")}
        backLabel={tr("common.back")} focusLabel={rt("focusOpen")} searchLabel={wn("search")}
        onBack={goBack} onFocus={() => setFocusOpen(true)} onSearch={() => router.push("/search" as Href)} />

      {/* auto-follow paused by a manual scroll: back to the verse being recited */}
      {manual && (playing || !!turn || waiting) && (view === "verses" ? !visible.includes(idx) : !readingVisible) ? (
        <View pointerEvents="box-none" style={{ position: "absolute", left: 0, right: 0, top: topOffset + 6, alignItems: "center" }}>
          <Pressable onPress={() => scrollTo(idx, true)} accessibilityRole="button" accessibilityLabel={rt("backToVerse")}
            style={({ pressed }) => ({ minHeight: 44, paddingHorizontal: 16, borderRadius: R.pill, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: t.accent, opacity: pressed ? 0.9 : 1,
              shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 })}>
            <Icon name="chevronDown" color={t.dark ? t.onAccent : "#ffffff"} size={14} />
            <Text maxFontSizeMultiplier={1.4} style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.dark ? t.onAccent : "#ffffff" }}>{rt("backToVerse")} · {verse.verse_number}</Text>
          </Pressable>
        </View>
      ) : null}

      {toast ? (
        <View pointerEvents="none" style={{ position: "absolute", left: 16, right: 16, bottom: dockBottom + 128, alignItems: "center" }} accessibilityLiveRegion="polite">
          <Text style={{ overflow: "hidden", borderRadius: R.pill, backgroundColor: t.ink, color: t.bg, paddingHorizontal: 16, paddingVertical: 8, fontFamily: FONT.medium, fontSize: 14 }}>{toast}</Text>
        </View>
      ) : null}

      <PlayerDock bottom={dockBottom} arabicName={chapter.name_arabic} verse={verse.verse_number} total={verses.length} playing={playing}
        positionMs={positionMs} durationMs={durationMs} sleepMin={sleepMin} reduce={reduce} turn={turn} onSkipTurn={advance}
        onToggle={toggle} onPrev={() => goTo(Math.max(0, idx - 1), false)} onNext={() => goTo(Math.min(verses.length - 1, idx + 1), false)}
        onSeek={seekTo} onJump={() => setJumpOpen(true)} onOpen={() => setNowOpen(true)} onFocus={() => setFocusOpen(true)} focusLabel={rt("focusOpen")} />

      <FocusMode open={focusOpen} onClose={() => setFocusOpen(false)} chapter={chapter} verse={verse} total={verses.length} activeWord={activeWord} timed={verse.segments.length > 0 && timingsOk}
        playing={playing} repeat={prefs.repeat} onRepeat={(n) => setPref({ repeat: n })} hide={hide} revealed={revealed} seed={seed} shown={shownSet} testPos={testPos} reduce={reduce} arabicUi={lang === "ar"}
        onToggle={toggle} onPrev={() => goTo(Math.max(0, idx - 1), playing)} onNext={() => goTo(Math.min(verses.length - 1, idx + 1), playing)}
        onRevealWord={(wi, pos) => cardHandlers.revealWord(wi, pos)} onPlayWord={(pos) => cardHandlers.playWord(verse.verse_key, pos)} />

      <ReaderNowPlaying open={nowOpen} onClose={() => setNowOpen(false)} chapter={chapter} verse={verse} total={verses.length} reciterName={reciterName(reciter, lang)} timed={verse.segments.length > 0 && timingsOk}
        playing={playing} positionMs={positionMs} durationMs={durationMs} reduce={reduce} speed={prefs.speed} repeat={prefs.repeat} sleepMode={sleep.mode} sleepMin={sleepMin}
        onToggle={toggle} onPrev={() => playAt(Math.max(0, idx - 1))} onNext={() => playAt(Math.min(verses.length - 1, idx + 1))} onSeek={seekTo}
        onSpeed={setSpeed} onRepeat={(n) => setPref({ repeat: n })} onSleep={setSleepMode} />

      {/* verse picker of the dock */}
      <Modal visible={jumpOpen} transparent animationType="fade" onRequestClose={() => setJumpOpen(false)}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setJumpOpen(false)} accessibilityLabel={w("closeTafsir")} />
          <View style={{ maxHeight: "60%", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: "rgba(201,166,94,0.45)", backgroundColor: t.surface, overflow: "hidden" }}>
            <LinearGradient colors={["rgba(201,166,94,0)", "rgb(201,166,94)", "rgba(201,166,94,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2 }} />
            <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, padding: 16, paddingBottom: 8 }}>{w("jump")}</Text>
            <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 20 }}>
              {verses.map((v, i) => (
                <Pressable key={v.verse_key} onPress={() => { setJumpOpen(false); goTo(i, false); }} accessibilityRole="button" accessibilityLabel={`${w("verse")} ${v.verse_number}`}
                  style={{ width: 52, height: 44, borderRadius: R.md, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: i === idx ? "rgb(201,166,94)" : t.line, backgroundColor: i === idx ? "rgba(201,166,94,0.15)" : t.surface }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink, fontVariant: ["tabular-nums"] }}>{v.verse_number}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* tafsir sheet */}
      {shareKey ? <VerseShare verseKey={shareKey} onClose={() => setShareKey(null)} /> : null}
      <Modal visible={!!tafsirFor} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setTafsirFor(null)}>
        {tafsirFor ? (
          <View style={{ flex: 1, backgroundColor: t.bg }}>
            <LinearGradient colors={["rgba(201,166,94,0)", "rgb(201,166,94)", "rgba(201,166,94,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2 }} />
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: t.surface }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{w("tafsir")} · {tafsirFor.verse_key}</Text>
              <Pressable onPress={() => setTafsirFor(null)} accessibilityRole="button" accessibilityLabel={w("closeTafsir")} hitSlop={10}><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{w("closeTafsir")}</Text></Pressable>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 14 }}>
              <GoldCard star={false}>
                <VerseWords verse={tafsirFor} size={26} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: 6 }}>{tafsirFor.translation}</Text>
              </GoldCard>
              <TafsirPanel surah={chapter.id} verse={tafsirFor.verse_number} />
            </ScrollView>
          </View>
        ) : null}
      </Modal>

      {/* settings sheet */}
      <Modal visible={settings} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSettings(false)}>
        <View style={{ flex: 1, backgroundColor: t.bg }}>
          <LinearGradient colors={["rgba(201,166,94,0)", "rgb(201,166,94)", "rgba(201,166,94,0)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 2 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: t.surface }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{w("settings")}</Text>
            <Pressable onPress={() => setSettings(false)} accessibilityRole="button" accessibilityLabel={w("closeTafsir")} hitSlop={10} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{w("closeTafsir")}</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: 40 }}>
            <Setting label={w("reciter")}>
              <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
                {reciters.map((r, i) => {
                  const locked = !pro && !isFreeReciter(r);
                  const on = r.folder === reciter.folder;
                  return (
                    <Pressable key={r.folder} onPress={() => pickReciter(r)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${r.name}${locked ? ", Pro" : ""}`}
                      style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: on ? t.accentSoft : t.surface }}>
                      <Text style={{ fontFamily: on ? FONT.bold : FONT.regular, fontSize: 15, color: t.ink, flex: 1 }}>{reciterName(r, lang)}</Text>
                      {locked ? <ProBadge /> : on ? <Icon name="check" color={t.accent} size={18} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </Setting>
            <Setting label={w("fontSize")}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {[0.85, 1, 1.2, 1.45].map((n, i) => (
                  <Pressable key={n} onPress={() => setPref({ size: n })} accessibilityRole="button" accessibilityState={{ selected: prefs.size === n }} accessibilityLabel={`${w("fontSize")} ${Math.round(n * 100)} %`}
                    style={{ minWidth: 48, height: 40, borderRadius: R.pill, borderWidth: 1, alignItems: "center", justifyContent: "center", borderColor: prefs.size === n ? "rgb(201,166,94)" : t.line, backgroundColor: prefs.size === n ? "rgba(201,166,94,0.15)" : t.surface }}>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 14 + i * 3, lineHeight: 30, color: t.ink }}>أ</Text>
                  </Pressable>
                ))}
              </View>
            </Setting>
            <Setting label={w("mode")}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {([["learn", w("modeLearn")], ["continuous", w("modeContinuous")]] as const).map(([k, l]) => <Chip key={k} label={l} selected={mode === k} onPress={() => { setPref({ mode: k }); if (k === "continuous" && waiting) setWaiting(false); }} />)}
                </View>
              </Setting>
            <Setting label={w("repeat")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{[1, 2, 3, 5, 10].map((n) => <Chip key={n} label={`×${n}`} selected={prefs.repeat === n} onPress={() => setPref({ repeat: n })} />)}</View>
            </Setting>
            <Setting label={w("speed")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{[0.5, 0.75, 1, 1.25, 1.5].map((n) => <Chip key={n} label={`${n}×`} selected={prefs.speed === n} onPress={() => setSpeed(n)} />)}</View>
            </Setting>
            <Setting label={w("gap")}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {[0, 2, 5, 10, -1].map((n) => <Chip key={n} label={n === 0 ? w("gapOff") : n === -1 ? w("gapVerse") : `${n} s`} selected={gap === n} onPress={() => setGap(n)} />)}
                </View>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{w("gapHint")}</Text>
              </Setting>
            <Setting label={w("sleep")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[0, 15, 30, 60, -1].map((n) => <Chip key={n} label={n === 0 ? w("sleepOff") : n === -1 ? w("sleepEnd") : `${n} min`} selected={sleep.mode === n} onPress={() => setSleepMode(n)} />)}
              </View>
              {sleep.mode > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{w("sleepLeft", { m: sleepMin ?? 1 })}</Text> : null}
            </Setting>
            <Setting label={w("loop")}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 10, rowGap: 8 }}>
                  <Switch value={loop.on} onValueChange={(on) => setLoop((l) => ({ ...l, on }))} trackColor={{ true: t.accent }} accessibilityLabel={w("loop")} />
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, opacity: loop.on ? 1 : 0.5 }}>{w("loopFrom")}</Text>
                  <Stepper value={loop.from} min={1} max={loop.to} disabled={!loop.on} label={`${w("loop")} ${w("loopFrom")}`} onChange={(n) => setLoop((l) => ({ ...l, from: n }))} />
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, opacity: loop.on ? 1 : 0.5 }}>{w("loopTo")}</Text>
                  <Stepper value={loop.to} min={loop.from} max={verses.length} disabled={!loop.on} label={`${w("loop")} ${w("loopTo")}`} onChange={(n) => setLoop((l) => ({ ...l, to: n }))} />
                </View>
              </Setting>
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
              {([["translit", w("transliteration")], ["translation", w("translation")], ["words", w("wordByWord")]] as [keyof Prefs, string][]).map(([k, label], i) => (
                <View key={k} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderTopColor: t.line }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink, flex: 1 }}>{label}</Text>
                  <Switch value={!!prefs[k]} onValueChange={(on) => setPref({ [k]: on } as Partial<Prefs>)} trackColor={{ true: t.accent }} accessibilityLabel={label} />
                </View>
              ))}
            </View>
            <Setting label={w("offline")}>
              {offline.state === "saving" ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: verses.length, now: offline.done }}>
                  <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
                    <View style={{ height: 6, width: `${(offline.done / Math.max(1, verses.length)) * 100}%`, backgroundColor: "rgb(201,166,94)" }} />
                  </View>
                  <Text style={{ fontFamily: FONT.medium, fontSize: 13, color: t.muted, fontVariant: ["tabular-nums"] }}>{offline.done}/{verses.length}</Text>
                </View>
              ) : offline.state === "saved" && pro ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Icon name="check" color={t.accent} size={17} />
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{w("offlineSaved", { mb: mb(offline.bytes) })}</Text>
                  </View>
                  <Text onPress={removeOffline} accessibilityRole="button" style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textDecorationLine: "underline" }}>{w("offlineRemove")}</Text>
                </View>
              ) : (
                <Pressable onPress={saveOffline} accessibilityRole="button" accessibilityLabel={`${w("offlineSave")}${pro ? "" : ", Pro"}`}
                  style={({ pressed }) => ({ alignSelf: "flex-start", height: 42, borderRadius: R.pill, borderWidth: 1, borderColor: "rgba(201,166,94,0.6)", backgroundColor: pressed ? "rgba(201,166,94,0.1)" : t.surface, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 8 })}>
                  <Icon name="download" color={t.ink} size={16} />
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{w("offlineSave")}</Text>
                  {pro ? null : <ProBadge />}
                </Pressable>
              )}
              {offline.state === "error" ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{w("offlineError")}</Text> : null}
            </Setting>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const go = (id: number) => router.replace(`/quran/${id}` as Href);

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ gap: 8 }}><Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: t.muted }}>{label}</Text>{children}</View>;
}

// a number with minus / plus (loop range); hold to move by ten
function Stepper({ value, min, max, onChange, label, disabled }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string; disabled?: boolean }) {
  const t = useTheme();
  const set = (n: number) => onChange(Math.max(min, Math.min(max, n)));
  const btn = (txt: string, d: number) => (
    <Pressable onPress={() => set(value + d)} onLongPress={() => set(value + d * 10)} disabled={disabled || (d < 0 ? value <= min : value >= max)} hitSlop={4} accessibilityElementsHidden importantForAccessibility="no"
      style={({ pressed }) => ({ width: 34, height: 36, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? t.bg : "transparent", opacity: (d < 0 ? value <= min : value >= max) ? 0.35 : 1 })}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{txt}</Text>
    </Pressable>
  );
  return (
    <View accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min, max, now: value }} accessibilityState={{ disabled: !!disabled }}
      accessibilityActions={[{ name: "increment" }, { name: "decrement" }]} onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === "increment" ? 1 : -1))}
      style={{ flexDirection: "row", direction: "ltr", alignItems: "center", borderRadius: R.pill, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: disabled ? 0.5 : 1 }}>
      {btn("−", -1)}
      <Text style={{ minWidth: 30, textAlign: "center", fontFamily: FONT.semibold, fontSize: 14, color: t.ink, fontVariant: ["tabular-nums"] }}>{value}</Text>
      {btn("+", 1)}
    </View>
  );
}

function CircleButton({ icon, label, onPress, disabled }: { icon: "chevronLeft" | "chevronRight"; label: string; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} hitSlop={4}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: pressed ? t.ink : t.line, backgroundColor: t.surface, opacity: disabled ? 0.3 : 1 })}>
      <Icon name={icon} color={t.muted} size={16} />
    </Pressable>
  );
}
