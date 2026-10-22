import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { Chip, Segmented } from "@/components/brand";
import { ARABIC_FONT, FONT, useTheme } from "@/lib/theme";
import { FREE, usePro } from "@/lib/pro";
import { useEntitlement } from "@/lib/entitlements";
import type { Verse } from "@/lib/quran";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { useSurahVerses, wordsOf } from "@/features/reciter-path/useVerse";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { PromptedWords, SpeechCheck, type CheckResult, type W } from "./recite";
import { noteWords } from "./store";
import { linkKey, noteLink, useFlex } from "./store2";
import { phrasesOf, type Phrase } from "./Talaqqi";
import { useS2 } from "./text";
import { useRec } from "./rec/text";
import { Capsule, DOCK_SPACE, Dock } from "./rec/ui";
import { Card } from "./ui";

// /shams/drill?s=&v=&w=&mode= – drills of Shams 3.0 for one verse:
//   word     – the word loop: the reciter's word n times (settings: flex.wordLoop, default 3) with a pause, then the
//              learner says it (on-device word check); for the words a check or the blind recitation missed;
//   phrase   – the same for phrases (cut at stop marks, at most four words, as in talaqqī), prompts by the grade;
//   link     – the transition: the end of verse v-1 from the reciter, then the beginning of verse v from memory;
//              held or stalled is recorded in links.v1.
// Word results go to the word statistics; never a pronunciation score.
export type DrillMode = "word" | "phrase" | "link";

/** plays a stretch of a verse n times with a pause between (the pause grows with the stretch, 0.9–3 s) */
function useLoop() {
  const audio = useVerseAudio();
  const st = useRef<{ start: number; end: number; left: number; gap: number; waiting: boolean } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [busy, setBusy] = useState(false);
  const clear = () => { if (timer.current) clearTimeout(timer.current); timer.current = null; };
  useEffect(() => () => { clear(); audio.stop(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const step = () => {
    const r = st.current;
    if (!r || r.waiting) return;
    audio.pause();
    if (r.left > 1) {
      r.left--; r.waiting = true;
      timer.current = setTimeout(() => { if (st.current !== r) return; r.waiting = false; audio.seekPlay(r.start); }, r.gap);
    } else { st.current = null; setBusy(false); }
  };
  useEffect(() => {
    const r = st.current;
    if (r && audio.playing && audio.positionMs >= r.end) step();
  }, [audio.positionMs, audio.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  audio.onEnd.current = () => step();
  const play = (v: Verse, start: number, end: number, times: number) => {
    clear();
    st.current = { start, end, left: Math.max(1, times), gap: Math.round(Math.max(900, Math.min(3000, (end - start) * 1.2))), waiting: false };
    setBusy(true);
    audio.play(v.audioUrl, { fallback: v.remoteAudioUrl, fromMs: start, track: false });
  };
  const stop = () => { clear(); st.current = null; audio.pause(); setBusy(false); };
  return { busy, play, stop };
}

export function DrillScreen({ surah, verse, words, mode: initialMode }: { surah: number; verse: number; words: number[]; mode: DrillMode }) {
  const t = useTheme();
  const { s } = useS2();
  const { r, nf } = useRec();
  const { pro } = usePro();
  const ent = useEntitlement("shams");
  const { name } = useSurahNames();
  const m = useShams2();
  const flex = useFlex();
  const { verses, error } = useSurahVerses(surah);
  const [mode, setMode] = useState<DrillMode>(verse > 1 || initialMode !== "link" ? initialMode : "phrase");
  const v = verses?.find((x) => x.verse_number === verse) ?? null;
  const prev = verses?.find((x) => x.verse_number === verse - 1) ?? null;
  const locked = !pro && !FREE.shamsSurah(surah);
  const loop = useLoop();

  // the items of the chosen drill
  const all: W[] = useMemo(() => (v ? wordsOf(v).map((w) => ({ position: w.position, text: w.text_uthmani })) : []), [v]);
  const phrases: Phrase[] = useMemo(() => (v && v.segments.length ? phrasesOf(v) : []), [v]);
  const items = useMemo((): { words: W[]; start: number; end: number }[] => {
    if (!v) return [];
    if (mode === "word") {
      const want = new Set(words);
      return all.filter((w) => !want.size || want.has(w.position)).map((w) => {
        const seg = v.segments.find((x) => x.word === w.position);
        return { words: [w], start: seg?.start ?? 0, end: seg?.end ?? 0 };
      });
    }
    if (mode === "phrase") {
      const want = new Set(words);
      const hit = phrases.filter((p) => !want.size || p.words.some((w) => want.has(w.position)));
      return hit.length ? hit : phrases;
    }
    // link: the end of the verse before (its last phrase) -> the first phrase of this verse
    const a = prev && prev.segments.length ? phrasesOf(prev).at(-1) : null;
    const b = phrases[0];
    return a && b ? [{ words: b.words, start: a.start, end: a.end }] : [];
  }, [v, prev, mode, all, phrases, words]);
  const [i, setI] = useState(0);
  const [turn, setTurn] = useState(false);
  const [res, setRes] = useState<CheckResult | null>(null);
  const [linkOk, setLinkOk] = useState<boolean | null>(null);
  useEffect(() => { setI(0); setTurn(false); setRes(null); setLinkOk(null); loop.stop(); }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps
  const item = items[i] ?? null;
  const timed = !!item && item.end > item.start;
  const done = !!v && items.length > 0 && i >= items.length;

  const listen = () => { if (v && item && timed) loop.play(mode === "link" && prev ? prev : v, item.start, item.end, mode === "link" ? 1 : flex.wordLoop); };
  const next = () => { loop.stop(); setTurn(false); setRes(null); setLinkOk(null); setI(i + 1); };
  const onCheck = (x: CheckResult) => {
    if (!v || !item) return;
    setRes(x);
    noteWords(v.verse_key, item.words.map((w, k) => ({ position: w.position, ok: !!x.ok[k] })));
    if (mode === "link") { setLinkOk(x.pass); noteLink(linkKey(surah, verse), x.pass); }
  };
  const markLink = (ok: boolean) => { if (linkOk !== null) return; setLinkOk(ok); noteLink(linkKey(surah, verse), ok); };

  const modes: [DrillMode, string][] = [["word", r("mode_word")], ["phrase", r("mode_phrase")], ...(verse > 1 ? [["link", r("mode_link")] as [DrillMode, string]] : [])];
  const dock = locked ? <Capsule title={s("unlock")} onPress={() => ent.upsell()} />
    : done || !item ? <Capsule title={r("other")} tone="quiet" onPress={() => router.replace(`/shams/blind?s=${surah}&from=${verse}&to=${verse}` as Href)} />
    : !turn ? (
      <>
        <Capsule title={loop.busy ? r("stop") : r("listen")} tone="quiet" disabled={!timed} onPress={() => (loop.busy ? loop.stop() : listen())} />
        <Capsule title={r("yourTurn")} tone="emerald" onPress={() => { loop.stop(); setTurn(true); }} />
      </>
    ) : <Capsule title={r("next")} onPress={next} />;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor: t.bg }}>
        <Page contentContainerStyle={{ paddingBottom: DOCK_SPACE + 24 }}>
          <PageHero back topInset eyebrow={r("eyebrow")} arabic="التَّكْرَار" title={r("drillTitle")} lead={r("drillLead")} />
          <View style={{ padding: 16, gap: 12 }}>
            <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "left" }}>{`${name(surah)} · ${s("verseN", { v: nf(verse) })}`}</Text>
            {locked ? <Card gold><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{s("proSurah")}</Text></Card>
              : error ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{r("loadFailed")}</Text>
              : !v ? (verses ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{r("loadFailed")}</Text> : <Loading />) : (
                <>
                  <Segmented value={mode} onChange={setMode} options={modes} />
                  {done ? (
                    <Card gold><Text style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink }}>{r("drillDone")}</Text></Card>
                  ) : !item ? (
                    <Card><Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{mode === "link" || phrases.length === 0 ? s("noTimings") : r("noTargets")}</Text></Card>
                  ) : (
                    <Card gold>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>
                        {mode === "word" ? r("wordOf", { i: nf(i + 1), n: nf(items.length) }) : mode === "phrase" ? r("phraseOf", { i: nf(i + 1), n: nf(items.length) }) : r("linkLead", { a: nf(verse - 1), b: nf(verse) })}
                      </Text>
                      {mode === "word" ? (
                        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 44, lineHeight: 80, color: t.ink, textAlign: "center", writingDirection: "rtl" }}>{item.words[0].text}</Text>
                      ) : (
                        <PromptedWords words={item.words} prompt={!turn ? "full" : mode === "link" ? "hidden" : m.grade.prompt} size={28} />
                      )}
                      {!timed ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{s("noTimings")}</Text> : mode !== "link" && !turn ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{r("loopN", { n: nf(flex.wordLoop) })}</Text> : null}
                      {turn ? (
                        <>
                          <SpeechCheck words={item.words} pass={mode === "word" ? 1 : m.grade.wordPass} onResult={onCheck} compact={mode === "word"} />
                          {res ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: res.pass ? t.accent : t.gold }}>{res.pass ? s("passed") : s("notYetPassed")}</Text> : null}
                          {mode === "link" ? (
                            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                              <Chip label={r("linkHeld")} selected={linkOk === true} onPress={() => markLink(true)} />
                              <Chip label={r("linkStalled")} selected={linkOk === false} onPress={() => markLink(false)} />
                            </View>
                          ) : null}
                        </>
                      ) : null}
                    </Card>
                  )}
                </>
              )}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{r("honest")}</Text>
          </View>
        </Page>
        <Dock>{dock}</Dock>
      </View>
    </>
  );
}
