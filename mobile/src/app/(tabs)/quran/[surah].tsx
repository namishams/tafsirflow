import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Platform, Pressable, ScrollView, Share, Switch, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
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
import { RECITERS, getChapter, getChapters, getVerses, type Chapter, type Verse, reciterName } from "@/lib/quran";
import { trackListen, trackVerseDone } from "@/web/listen";
import { rate, type Rating } from "@/web/learning";
import { useReciter, isFreeReciter } from "@/features/quran/reciter";
import { toAr, useVerseAudio } from "@/features/quran/useVerseAudio";
import { VerseWords, wordAt } from "@/features/quran/VerseWords";
import { TafsirPanel } from "@/features/quran/TafsirPanel";
import { useClip } from "@/features/coursekit/audio";
import { useReduceMotion } from "@/features/radio/motion";
import { SurahOpening } from "@/features/reader/SurahOpening";
import { SurahPicker } from "@/features/reader/SurahPicker";
import { VerseCard, IDLE, type CardHandlers, type CardState, type Hide } from "@/features/reader/VerseCard";
import { PlayerDock } from "@/features/reader/PlayerDock";
import { ReaderNowPlaying } from "@/features/reader/ReaderNowPlaying";
import { loadText, localVerseUri, removeSurah, saveSurah, saveText, savedInfo } from "@/features/reader/offline";

// The surah reader with its player, presented like the website's Player.tsx: the illuminated opening of the surah,
// the surah picker, compact verse cards with the active verse framed in gold (word highlighting, Read / Practise /
// Test, self-rating, bookmark, note, share, Tafsir, Shams Method), the reading view, the settings sheet (reciter, size,
// repeat, speed, sleep timer, what to show, saving the surah offline) and the floating jewel dock with a full player.
// Playback continues verse after verse in the background and on the lock screen.
type Prefs = { translit: boolean; translation: boolean; words: boolean; size: number; repeat: number; speed: number };
const PREFS: Prefs = { translit: true, translation: true, words: false, size: 1, repeat: 1, speed: 1 };
type Notes = Record<string, { text: string; at: number }>;
type Offline = { state: "none" | "saving" | "saved" | "error"; done: number; bytes: number };

export default function SurahReader() {
  const params = useLocalSearchParams<{ surah: string; v?: string; tafsir?: string; m?: string; shams?: string }>();
  const surah = Math.max(1, Math.min(114, Number(params.surah) || 1));
  // website links: m=2 (practise / review) and shams=1 open the verse in the Shams Method
  useEffect(() => { if (params.m === "2" || params.shams === "1") router.replace(`/shams/${surah}${params.v ? `?v=${params.v}` : ""}` as Href); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { lang } = useLang();
  const [reciter] = useReciter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(() => {
    setFailed(false); setVerses(null);
    Promise.all([getChapter(surah, lang), getVerses(surah, lang, reciter)])
      .then(([c, v]) => { setChapter(c); setVerses(v); })
      .catch(async () => {
        // no connection: a surah saved offline still opens from its saved text
        const saved = await loadText<{ chapter: Chapter; verses: Verse[] }>(surah, reciter.folder, lang);
        if (saved?.chapter && saved.verses?.length) { setChapter(saved.chapter); setVerses(saved.verses); } else setFailed(true);
      });
  }, [surah, lang, reciter]);
  useEffect(load, [load]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {failed ? <ErrorState retry={load} /> : !verses || !chapter ? <Loading /> : (
        <Reader key={`${surah}:${reciter.slug}`} chapter={chapter} verses={verses} start={Number(params.v) || 0} openTafsir={params.tafsir === "1"} />
      )}
    </>
  );
}

function Reader({ chapter, verses, start, openTafsir }: { chapter: Chapter; verses: Verse[]; start: number; openTafsir: boolean }) {
  const t = useTheme();
  const w = useWebT("player");
  const wh = useWebT("home");
  const { lang } = useLang();
  const tr = useT();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const reduce = useReduceMotion();
  const audio = useVerseAudio();
  const clip = useClip();
  const { pro } = usePro();
  const [reciter, setReciter] = useReciter();
  const prefs = { ...PREFS, ...useStored<Partial<Prefs>>("qmc.reader", {}) };
  const setPref = (p: Partial<Prefs>) => writeJSON("qmc.reader", { ...prefs, ...p }, true);
  const [view, setView] = useState<"verses" | "reading">("verses");
  const [idx, setIdx] = useState(Math.max(0, Math.min(verses.length - 1, (start || 1) - 1)));
  const [tafsirFor, setTafsirFor] = useState<Verse | null>(openTafsir && start ? verses[start - 1] ?? null : null);
  const [settings, setSettings] = useState(false);
  const [nowOpen, setNowOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [sleep, setSleep] = useState<{ mode: number; until: number }>({ mode: 0, until: 0 });
  const marks = useStored<string[]>("tf:bookmarks", []);
  const [notes, setNotes] = useState<Notes>(() => readJSON<Notes>("tf:notes", {}));
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  // memorising tools of the active verse (website Player.tsx)
  const [hide, setHideState] = useState<Hide>(0);
  const [practiceHide, setPracticeHide] = useState<Hide>(5);
  const [seed, setSeed] = useState(1);
  const [revealed, setRevealed] = useState(false);
  const [testPos, setTestPos] = useState(0);
  const [testMarks, setTestMarks] = useState<Record<number, boolean>>({});
  const [wordKey, setWordKey] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [offline, setOffline] = useState<Offline>(() => { const s = savedInfo(chapter.id, reciter.folder); return s ? { state: "saved", done: s.n, bytes: s.bytes } : { state: "none", done: 0, bytes: 0 }; });
  const abort = useRef<AbortController | null>(null);
  const list = useRef<FlatList<Verse>>(null);
  const plays = useRef(0);
  const verse = verses[idx];

  useEffect(() => { getChapters(lang).then(setChapters).catch(() => undefined); }, [lang]);
  useEffect(() => { if (start > 1) setTimeout(() => list.current?.scrollToIndex({ index: start - 1, viewPosition: 0.1, animated: false }), 300); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { audio.stop(); abort.current?.abort(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // remember where the learner stopped
  useEffect(() => { writeJSON("tf:last", { chapter: chapter.id, verse: verses[idx].verse_number, at: Date.now() }); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setRevealed(false); setTestPos(0); setTestMarks({}); }, [idx, hide]);
  useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(""), 2600); return () => clearTimeout(id); }, [toast]);
  useEffect(() => { if (clip.state === "idle" || clip.state === "error") setWordKey(null); }, [clip.state]);
  // sleep timer: also stops in the middle of a long verse
  useEffect(() => {
    if (sleep.mode <= 0) return;
    const iv = setInterval(() => { if (Date.now() >= sleep.until) { audio.pause(); setSleep({ mode: 0, until: 0 }); } }, 5000);
    return () => clearInterval(iv);
  }, [sleep]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = (i: number) => { if (view === "verses") list.current?.scrollToIndex({ index: i, viewPosition: 0.12, animated: true }); };
  const playAt = (i: number) => {
    const v = verses[i];
    if (!v) return;
    plays.current = 0;
    setIdx(i);
    // a surah saved offline plays from the device
    const local = localVerseUri(chapter.id, reciter.folder, v.verse_number);
    audio.play(local ?? v.audioUrl, { fallback: v.remoteAudioUrl, rate: prefs.speed, title: `${chapter.name_simple} · ${v.verse_number}`, artist: reciterName(reciter, lang) });
    scrollTo(i);
  };
  const goTo = (i: number, autoplay: boolean) => {
    if (autoplay) { playAt(i); return; }
    audio.stop(); plays.current = 0; setIdx(i); scrollTo(i);
  };
  audio.onEnd.current = () => {
    trackListen(Math.round(audio.durationMs / 1000 / Math.max(0.5, prefs.speed)), chapter.id, reciter.slug);
    plays.current += 1;
    if (plays.current < prefs.repeat) { audio.seekPlay(0); return; }
    trackVerseDone(chapter.id, reciter.slug);
    if (sleep.mode > 0 && Date.now() >= sleep.until) { setSleep({ mode: 0, until: 0 }); return; }
    if (idx < verses.length - 1) playAt(idx + 1);
    else if (sleep.mode === -1) setSleep({ mode: 0, until: 0 });
  };
  const toggle = () => (audio.playing ? audio.pause() : audio.positionMs > 0 && audio.durationMs > 0 ? audio.resume() : playAt(idx));
  const toggleMark = (k: string) => writeJSON("tf:bookmarks", marks.includes(k) ? marks.filter((x) => x !== k) : [...marks, k]);
  const saveNote = (k: string, text: string) => { const n = { ...notes }; if (text.trim()) n[k] = { text: text.trim(), at: Date.now() }; else delete n[k]; setNotes(n); writeJSON("tf:notes", n); };
  const setSpeed = (n: number) => { setPref({ speed: n }); audio.setRate(n); };
  const setSleepMode = (n: number) => setSleep({ mode: n, until: n > 0 ? Date.now() + n * 60000 : 0 });
  const activeWord = audio.playing ? wordAt(verse, audio.positionMs) : null;
  const sleepMin = sleep.mode > 0 ? Math.max(1, Math.ceil((sleep.until - Date.now()) / 60000)) : sleep.mode === -1 ? 0 : null;

  // everything a verse card can do, behind stable functions so the quiet cards do not redraw while a verse plays
  const impl = {
    goTo: (i: number) => goTo(i, true),
    playVerse: (i: number) => (i === idx && audio.playing ? audio.pause() : i === idx && audio.positionMs > 0 ? audio.seekPlay(0) : playAt(i)),
    toggleMark,
    openNote: (k: string | null) => setNoteOpen(k),
    saveNote,
    setHide: (h: Hide) => { setHideState(h); if (h !== 0 && h !== 6) setPracticeHide(h); },
    shuffle: () => setSeed((x) => x + 1),
    reveal: () => setRevealed(true),
    markWord: (ok: boolean) => {
      const n = verse.words.filter((x) => x.char_type_name === "word").length;
      setTestMarks((m) => ({ ...m, [testPos]: ok }));
      if (testPos + 1 >= n) setRevealed(true);
      setTestPos(testPos + 1);
    },
    rate: (r: Rating) => {
      const days = rate(verse.verse_key, r);
      setToast(days ? w("saved", { days }) : w("savedToday"));
      if (idx < verses.length - 1) goTo(idx + 1, false);
    },
    tafsir: (v: Verse) => setTafsirFor(v),
    shams: (v: Verse) => { audio.stop(); router.push(`/shams/${chapter.id}?v=${v.verse_number}` as Href); },
    share: (v: Verse) => {
      const title = `${chapter.name_simple} ${v.verse_key}`;
      const url = `${SITE}/${lang}/surah/${chapter.id}?v=${v.verse_number}`;
      void Share.share(Platform.OS === "ios" ? { title, message: `${v.translation}\n— ${title}`, url } : { title, message: `${v.translation}\n— ${title}\n${url}` }).catch(() => undefined);
    },
    // tap a word: hear it on its own (Quran.com word recordings, like the website)
    playWord: (key: string, pos: number) => {
      const [s, a] = key.split(":").map((n) => n.padStart(3, "0"));
      audio.pause();
      setWordKey(`${key}:${pos}`);
      clip.play(`https://audio.qurancdn.com/wbw/${s}_${a}_${String(pos).padStart(3, "0")}.mp3`);
    },
  } satisfies CardHandlers;
  const live = useRef(impl);
  live.current = impl;
  const handlers = useMemo<CardHandlers>(() => {
    const keys = Object.keys(live.current) as (keyof CardHandlers)[];
    return Object.fromEntries(keys.map((k) => [k, (...args: unknown[]) => (live.current[k] as (...a: unknown[]) => void)(...args)])) as CardHandlers;
  }, []);

  const activeState = useMemo<CardState>(() => ({ hide, practiceHide, revealed, seed, testPos, testMarks, activeWord, playing: audio.playing, wordOn: wordKey }),
    [hide, practiceHide, revealed, seed, testPos, testMarks, activeWord, audio.playing, wordKey]);
  // the store hands out a fresh array on every read: key the bookmarks by their content
  const marksKey = marks.join("|");
  const markSet = useMemo(() => new Set(marksKey ? marksKey.split("|") : []), [marksKey]);
  const renderItem = useCallback(({ item: v, index: i }: { item: Verse; index: number }) => (
    <VerseCard v={v} i={i} active={i === idx} marked={markSet.has(v.verse_key)} note={notes[v.verse_key]?.text} noteOpen={noteOpen === v.verse_key}
      translit={prefs.translit} translation={prefs.translation} words={prefs.words} scale={prefs.size} st={i === idx ? activeState : IDLE} h={handlers} />
  ), [idx, markSet, notes, noteOpen, prefs.translit, prefs.translation, prefs.words, prefs.size, activeState, handlers]);

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
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" }}>
        <Pressable onPress={goBack} accessibilityRole="button" accessibilityLabel={tr("common.back")} hitSlop={10} style={{ width: 44, height: 44, justifyContent: "center" }}>
          <Icon name="chevronLeft" color={t.ink} size={24} />
        </Pressable>
      </View>
      <SurahOpening chapter={chapter} reduce={reduce} />
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
                <Pressable key={k} onPress={() => setView(k)} accessibilityRole="tab" accessibilityState={{ selected: view === k }} accessibilityLabel={l}
                  style={{ paddingHorizontal: 13, height: 30, justifyContent: "center", borderRadius: R.pill, backgroundColor: view === k ? t.surface : "transparent", borderWidth: view === k ? 1 : 0, borderColor: t.line }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: view === k ? t.ink : t.muted }}>{l}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={() => setSettings(true)} accessibilityRole="button" accessibilityLabel={w("settings")} hitSlop={6}
              style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 6 }}>
              <Icon name="settings" color={t.muted} size={17} />
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{w("settings")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  ), [chapter, chapters, verse.page, verse.juz, verse.hizb, view, insets.top, reduce, t, w, wh, tr]);
  const dockBottom = tabSpace - 4;
  const bottomSpace = tabSpace + 150;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {view === "reading" ? (
        <ScrollView contentContainerStyle={{ paddingBottom: bottomSpace }}>
          {header}
          <View style={{ margin: 16, borderRadius: 16, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 22 }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 30 * prefs.size * 0.95, lineHeight: 30 * prefs.size * 2.5, color: t.arabic, textAlign: "justify", writingDirection: "rtl" }} accessibilityLanguage="ar">
              {verses.map((v, i) => (
                <Text key={v.verse_key} onPress={() => goTo(i, true)} style={{ backgroundColor: i === idx ? t.accentSoft : "transparent" }}>
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
          onScrollToIndexFailed={(e) => setTimeout(() => list.current?.scrollToIndex({ index: e.index, viewPosition: 0.1, animated: false }), 250)}
        />
      )}

      {toast ? (
        <View pointerEvents="none" style={{ position: "absolute", left: 16, right: 16, bottom: dockBottom + 128, alignItems: "center" }} accessibilityLiveRegion="polite">
          <Text style={{ overflow: "hidden", borderRadius: R.pill, backgroundColor: t.ink, color: t.bg, paddingHorizontal: 16, paddingVertical: 8, fontFamily: FONT.medium, fontSize: 14 }}>{toast}</Text>
        </View>
      ) : null}

      <PlayerDock bottom={dockBottom} arabicName={chapter.name_arabic} verse={verse.verse_number} total={verses.length} playing={audio.playing}
        positionMs={audio.positionMs} durationMs={audio.durationMs} sleepMin={sleepMin} reduce={reduce}
        onToggle={toggle} onPrev={() => goTo(Math.max(0, idx - 1), false)} onNext={() => goTo(Math.min(verses.length - 1, idx + 1), false)}
        onSeek={(ms) => (audio.playing ? audio.seekPlay(ms) : audio.seek(ms))} onJump={() => setJumpOpen(true)} onOpen={() => setNowOpen(true)} />

      <ReaderNowPlaying open={nowOpen} onClose={() => setNowOpen(false)} chapter={chapter} verse={verse} total={verses.length} reciterName={reciterName(reciter, lang)} timed={verse.segments.length > 0}
        playing={audio.playing} positionMs={audio.positionMs} durationMs={audio.durationMs} reduce={reduce} speed={prefs.speed} repeat={prefs.repeat} sleepMode={sleep.mode} sleepMin={sleepMin}
        onToggle={toggle} onPrev={() => playAt(Math.max(0, idx - 1))} onNext={() => playAt(Math.min(verses.length - 1, idx + 1))} onSeek={(ms) => (audio.playing ? audio.seekPlay(ms) : audio.seek(ms))}
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
            <Pressable onPress={() => setSettings(false)} accessibilityRole="button" hitSlop={10}><Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.accent }}>{w("closeTafsir")}</Text></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, gap: 22, paddingBottom: 40 }}>
            <Setting label={w("reciter")}>
              <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
                {RECITERS.map((r, i) => {
                  const locked = !pro && !isFreeReciter(r);
                  const on = r.slug === reciter.slug;
                  return (
                    <Pressable key={r.slug} onPress={() => (locked ? openPro("reciters") : setReciter(r))} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${r.name}${locked ? ", Pro" : ""}`}
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
            <Setting label={w("repeat")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{[1, 2, 3, 5, 10].map((n) => <Chip key={n} label={`×${n}`} selected={prefs.repeat === n} onPress={() => setPref({ repeat: n })} />)}</View>
            </Setting>
            <Setting label={w("speed")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{[0.5, 0.75, 1, 1.25, 1.5].map((n) => <Chip key={n} label={`${n}×`} selected={prefs.speed === n} onPress={() => setSpeed(n)} />)}</View>
            </Setting>
            <Setting label={w("sleep")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[0, 15, 30, 60, -1].map((n) => <Chip key={n} label={n === 0 ? w("sleepOff") : n === -1 ? w("sleepEnd") : `${n} min`} selected={sleep.mode === n} onPress={() => setSleepMode(n)} />)}
              </View>
              {sleep.mode > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{w("sleepLeft", { m: sleepMin ?? 1 })}</Text> : null}
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

function CircleButton({ icon, label, onPress, disabled }: { icon: "chevronLeft" | "chevronRight"; label: string; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }} hitSlop={4}
      style={({ pressed }) => ({ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: pressed ? t.ink : t.line, backgroundColor: t.surface, opacity: disabled ? 0.3 : 1 })}>
      <Icon name={icon} color={t.muted} size={16} />
    </Pressable>
  );
}
