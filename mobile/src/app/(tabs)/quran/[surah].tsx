import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme } from "@/lib/theme";
import { useTabBarSpace } from "@/components/TabBar";
import { Arcade, Chip, Display, Eyebrow, GoldButton, GoldCard, Segmented, Stage, StarNumber, SurahBanner } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ErrorState, Loading, ProBadge } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { openPro, usePro } from "@/lib/pro";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { RECITERS, getChapter, getVerses, type Chapter, type Verse } from "@/lib/quran";
import { trackListen, trackVerseDone } from "@/web/listen";
import { useReciter, isFreeReciter } from "@/features/quran/reciter";
import { toAr, useVerseAudio } from "@/features/quran/useVerseAudio";
import { VerseWords, WordGrid, wordAt } from "@/features/quran/VerseWords";
import { TafsirPanel } from "@/features/quran/TafsirPanel";
import { BISMILLAH, SURAH_PREFIX } from "@/features/quran/arabic";
import { goBack } from "@/components/page";

// The surah reader with its player (website Player.tsx): stage header with the surah cartouche, verse cards with word
// highlighting, transliteration and translation, tafsir in a sheet, reading view, settings (reciter, size, repeat,
// speed, sleep timer, what to show) and continuous playback that keeps going in the background and on the lock screen.
type Prefs = { translit: boolean; translation: boolean; words: boolean; size: number; repeat: number; speed: number };
const PREFS: Prefs = { translit: true, translation: true, words: false, size: 1, repeat: 1, speed: 1 };
type Notes = Record<string, { text: string; at: number }>;

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
    Promise.all([getChapter(surah, lang), getVerses(surah, lang, reciter)]).then(([c, v]) => { setChapter(c); setVerses(v); }).catch(() => setFailed(true));
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
  const ws = useWebT("shams");
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const audio = useVerseAudio();
  const { pro } = usePro();
  const [reciter, setReciter] = useReciter();
  const prefs = { ...PREFS, ...useStored<Partial<Prefs>>("qmc.reader", {}) };
  const setPref = (p: Partial<Prefs>) => writeJSON("qmc.reader", { ...prefs, ...p }, true);
  const [view, setView] = useState<"verses" | "reading">("verses");
  const [idx, setIdx] = useState(Math.max(0, Math.min(verses.length - 1, (start || 1) - 1)));
  const [tafsirFor, setTafsirFor] = useState<Verse | null>(openTafsir && start ? verses[start - 1] ?? null : null);
  const [settings, setSettings] = useState(false);
  const [sleep, setSleep] = useState<{ mode: number; until: number }>({ mode: 0, until: 0 });
  const marks = useStored<string[]>("tf:bookmarks", []);
  const [notes, setNotes] = useState<Notes>(() => readJSON<Notes>("tf:notes", {}));
  const [noteOpen, setNoteOpen] = useState<string | null>(null);
  const list = useRef<FlatList<Verse>>(null);
  const plays = useRef(0);
  const verse = verses[idx];

  useEffect(() => { if (start > 1) setTimeout(() => list.current?.scrollToIndex({ index: start - 1, viewPosition: 0.1, animated: false }), 300); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const playAt = (i: number) => {
    const v = verses[i];
    if (!v) return;
    plays.current = 0;
    setIdx(i);
    writeJSON("tf:last", { chapter: chapter.id, verse: v.verse_number, at: Date.now() });
    audio.play(v.audioUrl, { fallback: v.remoteAudioUrl, rate: prefs.speed, title: `${chapter.name_simple} · ${v.verse_number}`, artist: reciter.name });
    list.current?.scrollToIndex({ index: i, viewPosition: 0.15, animated: true });
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
  const saveNote = (k: string, text: string) => { const n = { ...notes }; if (text.trim()) n[k] = { text: text.trim(), at: Date.now() }; else delete n[k]; setNotes(n); writeJSON("tf:notes", n); setNoteOpen(null); };
  const activeWord = audio.playing ? wordAt(verse, audio.positionMs) : null;
  const size = 30 * prefs.size;

  const header = (
    <View>
      <Stage hairlines={false}>
        <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 6, alignItems: "center" }}>
          <View style={{ alignSelf: "stretch", flexDirection: "row", justifyContent: "space-between" }}>
            <RoundButton icon="chevronLeft" label="Back" onPress={() => goBack()} dark />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <RoundButton icon="chevronRight" label={`${wh("surahLabel", { n: chapter.id - 1 })}`} onPress={() => chapter.id > 1 && router.replace(`/quran/${chapter.id - 1}` as Href)} dark flip disabled={chapter.id <= 1} />
              <RoundButton icon="chevronRight" label={`${wh("surahLabel", { n: chapter.id + 1 })}`} onPress={() => chapter.id < 114 && router.replace(`/quran/${chapter.id + 1}` as Href)} dark disabled={chapter.id >= 114} />
            </View>
          </View>
          <Eyebrow onStage style={{ marginTop: 6 }}>{wh("surahLabel", { n: chapter.id })} · {chapter.verses_count} {wh("verses")}</Eyebrow>
          <View style={{ alignSelf: "stretch", marginTop: 14 }}><SurahBanner arabic={`${SURAH_PREFIX}${chapter.name_arabic}`} /></View>
          <Display size="title1" onStage style={{ marginTop: 14, textAlign: "center" }}>{chapter.name_simple}</Display>
          {chapter.translated_name.name ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>{chapter.translated_name.name}</Text> : null}
          {chapter.id !== 1 && chapter.id !== 9 ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 58, color: stage.gold, marginTop: 8 }}>{BISMILLAH}</Text> : null}
        </View>
        <Arcade />
      </Stage>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{verse.page > 0 ? `${w("page")} ${verse.page} · ${w("juz")} ${verse.juz} · ${w("hizb")} ${verse.hizb}` : ""}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Segmented value={view} options={[["verses", w("viewVerses")], ["reading", w("viewReading")]]} onChange={setView} />
          <Pressable onPress={() => setSettings(true)} accessibilityRole="button" accessibilityLabel={w("settings")} hitSlop={8} style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
            <Icon name="settings" color={t.ink} size={18} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {view === "reading" ? (
        <ScrollView contentContainerStyle={{ paddingBottom: tabSpace + 110 }}>
          {header}
          <View style={{ margin: 16, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 18 }}>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: size * 0.95, lineHeight: size * 2.4, color: t.arabic, textAlign: "justify", writingDirection: "rtl" }}>
              {verses.map((v, i) => (
                <Text key={v.verse_key} onPress={() => setIdx(i)} style={{ backgroundColor: i === idx ? t.accentSoft : "transparent" }}>
                  {v.text_uthmani} <Text style={{ color: t.gold, fontSize: size * 0.65 }}>﴿{toAr(v.verse_number)}﴾</Text>{" "}
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
          contentContainerStyle={{ paddingBottom: tabSpace + 110 }}
          onScrollToIndexFailed={(e) => setTimeout(() => list.current?.scrollToIndex({ index: e.index, viewPosition: 0.1, animated: false }), 250)}
          renderItem={({ item: v, index: i }) => {
            const active = i === idx;
            const marked = marks.includes(v.verse_key);
            return (
              <Pressable onPress={() => setIdx(i)} accessibilityLabel={`${wh("verses")} ${v.verse_number}`} style={{ marginHorizontal: 16, marginTop: 12 }}>
                <GoldCard star={active} style={active ? { borderColor: "rgba(201,166,94,0.55)" } : undefined}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <StarNumber n={v.verse_number} active={active} />
                    <View style={{ flexDirection: "row", gap: 4 }}>
                      <IconButton icon={active && audio.playing ? "pause" : "play"} label={w("play")} onPress={() => (active && audio.playing ? audio.pause() : playAt(i))} />
                      <IconButton icon="bookmark" filled={marked} label={w("bookmark")} onPress={() => toggleMark(v.verse_key)} />
                      <IconButton icon="note" label={w("note")} onPress={() => setNoteOpen(noteOpen === v.verse_key ? null : v.verse_key)} />
                    </View>
                  </View>
                  <VerseWords verse={v} activeWord={active ? activeWord : null} size={size} onWord={(pos) => { const s = v.segments.find((x) => x.word === pos); if (s) { setIdx(i); audio.play(v.audioUrl, { fallback: v.remoteAudioUrl, fromMs: s.start, rate: prefs.speed }); } }} />
                  {prefs.translit && v.transliteration ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 23, color: t.gold, marginTop: 10 }}>{v.transliteration}</Text> : null}
                  {prefs.translation ? <Text selectable style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.muted, marginTop: 6 }}>{v.translation}</Text> : null}
                  {prefs.words ? <View style={{ marginTop: 12 }}><WordGrid verse={v} /></View> : null}
                  {noteOpen === v.verse_key ? (
                    <TextInput autoFocus multiline defaultValue={notes[v.verse_key]?.text ?? ""} placeholder={w("notePlaceholder")} placeholderTextColor={t.muted} onEndEditing={(e) => saveNote(v.verse_key, e.nativeEvent.text)}
                      style={{ marginTop: 12, minHeight: 80, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.bg, padding: 12, fontFamily: FONT.regular, fontSize: 15, color: t.ink, textAlignVertical: "top" }} />
                  ) : notes[v.verse_key] ? (
                    <Text onPress={() => setNoteOpen(v.verse_key)} style={{ fontFamily: FONT.italic, fontSize: 14, color: t.muted, marginTop: 12, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 10 }}>“{notes[v.verse_key].text}”</Text>
                  ) : null}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                    <Pressable onPress={() => setTafsirFor(v)} accessibilityRole="button" accessibilityLabel={w("tafsir")} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 7, height: 40, paddingHorizontal: 16, borderRadius: R.pill, borderWidth: 1, borderColor: pressed ? goldButton.line : t.line, backgroundColor: t.surface })}>
                      <Icon name="book" color={t.ink} size={16} /><Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{w("tafsir")}</Text>
                    </Pressable>
                    {active ? <GoldButton compact title={ws("start")} icon="sun" onPress={() => { audio.stop(); router.push(`/shams/${chapter.id}?v=${v.verse_number}` as Href); }} /> : null}
                  </View>
                </GoldCard>
              </Pressable>
            );
          }}
        />
      )}

      {/* the player bar on the stage */}
      <Stage rounded={R.card} style={{ position: "absolute", left: 10, right: 10, bottom: tabSpace - 4 }}>
        <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12 }}>
          <View style={{ height: 3, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.15)", overflow: "hidden" }}>
            <View style={{ height: 3, width: `${audio.durationMs ? Math.min(100, (audio.positionMs / audio.durationMs) * 100) : 0}%`, backgroundColor: stage.gold }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontFamily: ARABIC_FONT, fontSize: 17, color: stage.gold }}>{chapter.name_arabic}</Text>
              <Text numberOfLines={1} style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{verse.verse_number}/{verses.length} · {reciter.name}</Text>
            </View>
            <RoundButton icon="prev" label={w("prev")} onPress={() => playAt(Math.max(0, idx - 1))} dark plain />
            <Pressable onPress={toggle} accessibilityRole="button" accessibilityLabel={audio.playing ? w("pause") : w("play")}
              style={{ width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: "#d3b673", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" }}>
              <Icon name={audio.playing ? "pause" : "play"} color={goldButton.text} size={26} />
            </Pressable>
            <RoundButton icon="next" label={w("next")} onPress={() => playAt(Math.min(verses.length - 1, idx + 1))} dark plain />
          </View>
        </View>
      </Stage>

      {/* tafsir sheet */}
      <Modal visible={!!tafsirFor} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setTafsirFor(null)}>
        {tafsirFor ? (
          <View style={{ flex: 1, backgroundColor: t.bg }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: t.line, backgroundColor: t.surface }}>
              <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{w("tafsir")} · {chapter.name_simple} {tafsirFor.verse_number}</Text>
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
                    <Pressable key={r.slug} onPress={() => (locked ? openPro("reciters") : setReciter(r))} accessibilityRole="button" accessibilityState={{ selected: on }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: on ? t.accentSoft : t.surface }}>
                      <Text style={{ fontFamily: on ? FONT.bold : FONT.regular, fontSize: 15, color: t.ink, flex: 1 }}>{r.name}</Text>
                      {locked ? <ProBadge /> : on ? <Icon name="check" color={t.accent} size={18} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </Setting>
            <Setting label={w("fontSize")}>
              <View style={{ flexDirection: "row", gap: 8 }}>{[0.85, 1, 1.2, 1.45].map((n) => <Chip key={n} label={`${Math.round(n * 100)} %`} selected={prefs.size === n} onPress={() => setPref({ size: n })} />)}</View>
            </Setting>
            <Setting label={w("repeat")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{[1, 2, 3, 5, 10].map((n) => <Chip key={n} label={`×${n}`} selected={prefs.repeat === n} onPress={() => setPref({ repeat: n })} />)}</View>
            </Setting>
            <Setting label={w("speed")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{[0.5, 0.75, 1, 1.25, 1.5].map((n) => <Chip key={n} label={`${n}×`} selected={prefs.speed === n} onPress={() => { setPref({ speed: n }); audio.setRate(n); }} />)}</View>
            </Setting>
            <Setting label={w("sleep")}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {[0, 15, 30, 60, -1].map((n) => <Chip key={n} label={n === 0 ? w("sleepOff") : n === -1 ? w("sleepEnd") : `${n} min`} selected={sleep.mode === n} onPress={() => setSleep({ mode: n, until: n > 0 ? Date.now() + n * 60000 : 0 })} />)}
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
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function Setting({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ gap: 8 }}><Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: t.muted }}>{label}</Text>{children}</View>;
}

function IconButton({ icon, label, onPress, filled }: { icon: "play" | "pause" | "bookmark" | "note"; label: string; onPress: () => void; filled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={6} style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: pressed ? t.bg : "transparent" })}>
      <Icon name={icon} color={filled ? t.accent : t.muted} size={icon === "play" || icon === "pause" ? 20 : 18} filled={filled} />
    </Pressable>
  );
}

function RoundButton({ icon, label, onPress, dark, flip, disabled, plain }: { icon: "chevronLeft" | "chevronRight" | "prev" | "next"; label: string; onPress: () => void; dark?: boolean; flip?: boolean; disabled?: boolean; plain?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}
      style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: plain ? 0 : 1, borderColor: "rgba(255,255,255,0.22)", opacity: disabled ? 0.3 : 1, transform: flip ? [{ scaleX: -1 }] : undefined }}>
      <Icon name={icon} color={dark ? "#fff" : "#000"} size={icon === "prev" || icon === "next" ? 20 : 18} />
    </Pressable>
  );
}
