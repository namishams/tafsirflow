import { useEffect, useMemo, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, Loading, ErrorState } from "@/components/page";
import { Chip, GoldButton } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { usePro, FREE } from "@/lib/pro";
import { useEntitlement } from "@/lib/entitlements";
import type { Verse } from "@/lib/quran";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { RecordCompare } from "@/features/reciter-path/Practice";
import { useSurahVerses, wordsOf } from "@/features/reciter-path/useVerse";
import { shamsGrow } from "@/features/garden/garden";
import { gEvent } from "@/features/feed/gamify";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { PromptedWords, SpeechCheck, type CheckResult, type W } from "./recite";
import { noteCheck, noteWords } from "./store";
import { useS2 } from "./text";
import { Btn, Card, SourceNote, Term } from "./ui";
import { ContinueNext } from "./Continue";
import { Rubric } from "./Rubric";
import { useRec } from "./rec/text";

// /shams/talaqqi?s=&v=&to= – talaqqī and mushāfaha with a master reciter: listen phrase by phrase (from the reciter's
// word timings), then recite the phrase yourself (ʿarḍ), with the prompts and pass mark of your grade; at the end the
// whole verse, an on-device word check and the A/B comparison with your own recording (reciter path, imported).
const WAQF = /[ۖ-ۜ]/;

export type Phrase = { words: W[]; start: number; end: number };
export function phrasesOf(v: Verse): Phrase[] {
  const ws = wordsOf(v);
  const seg = (p: number) => v.segments.find((x) => x.word === p);
  const out: Phrase[] = [];
  let cur: W[] = [];
  const push = () => {
    if (!cur.length) return;
    const a = seg(cur[0].position), b = seg(cur[cur.length - 1].position);
    out.push({ words: cur, start: a?.start ?? 0, end: b?.end ?? 0 });
    cur = [];
  };
  for (const w of ws) {
    cur.push({ position: w.position, text: w.text_uthmani });
    if (WAQF.test(w.text_uthmani) || cur.length >= 4) push();
  }
  push();
  // a last phrase of one word joins the one before
  if (out.length > 1 && out[out.length - 1].words.length === 1) { const l = out.pop()!; const p = out[out.length - 1]; p.words.push(...l.words); p.end = l.end || p.end; }
  return out;
}

export function TalaqqiScreen({ surah, from, to }: { surah: number; from: number; to?: number }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const { pro } = usePro();
  const ent = useEntitlement("shams");
  const { name } = useSurahNames();
  const { grade } = useShams2();
  const { verses, error } = useSurahVerses(surah);
  const [vi, setVi] = useState(Math.max(1, from));
  const [pi, setPi] = useState(0);
  const [step, setStep] = useState<"listen" | "recite" | "verse">("listen");
  const [reps, setReps] = useState(1);
  const audio = useVerseAudio();
  const range = useRef<{ start: number; end: number; left: number } | null>(null);
  const verse = verses?.find((x) => x.verse_number === vi) ?? null;
  const phrases = useMemo(() => (verse && verse.segments.length ? phrasesOf(verse) : []), [verse]);
  const timed = phrases.length > 0 && phrases.every((p) => p.end > p.start);
  const phrase = timed ? phrases[Math.min(pi, phrases.length - 1)] : null;
  const allWords: W[] = useMemo(() => (verse ? wordsOf(verse).map((w) => ({ position: w.position, text: w.text_uthmani })) : []), [verse]);
  const last = to ?? verses?.length ?? from;
  const locked = !pro && !FREE.shamsSurah(surah);

  useEffect(() => { setPi(0); setStep(timed ? "listen" : "verse"); }, [vi, timed]);
  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const r = range.current;
    if (!r || !audio.playing || audio.positionMs < r.end) return;
    if (r.left > 1) { r.left--; audio.seekPlay(r.start); } else { audio.pause(); range.current = null; }
  }, [audio.positionMs, audio.playing]); // eslint-disable-line react-hooks/exhaustive-deps
  audio.onEnd.current = () => { const r = range.current; if (r && r.left > 1) { r.left--; audio.seekPlay(r.start); } else range.current = null; };

  const playPhrase = () => { if (!verse || !phrase) return; range.current = { start: phrase.start, end: phrase.end, left: reps }; audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, fromMs: phrase.start, track: false }); };
  const playVerse = () => { if (!verse) return; range.current = null; audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, track: false }); };
  const verseMs = verse?.segments.length ? Math.max(...verse.segments.map((x) => x.end)) - Math.min(...verse.segments.map((x) => x.start)) : null;

  // XP and growth come once per verse and visit (a passed check or the first "well done"), never per tap
  const rewarded = useRef(new Set<string>());
  const reward = (key: string) => { if (rewarded.current.has(key)) return; rewarded.current.add(key); gEvent({ t: "verse" }); shamsGrow("verse", pro); };
  const [rated, setRated] = useState<"good" | "slip" | null>(null);
  // words the verse check did not hear: offered as a word drill (Shams 3.0)
  const [missed, setMissed] = useState<number[]>([]);
  useEffect(() => { setRated(null); setMissed([]); }, [vi]);
  const { r } = useRec();
  const onPhrase = (r: CheckResult) => { if (verse && phrase) noteWords(verse.verse_key, phrase.words.map((w, i) => ({ position: w.position, ok: !!r.ok[i] }))); };
  const onVerse = (r: CheckResult) => {
    if (!verse) return;
    noteWords(verse.verse_key, allWords.map((w, i) => ({ position: w.position, ok: !!r.ok[i] })));
    noteCheck(verse.verse_key, r.ok.filter(Boolean).length, r.ok.length);
    setMissed(allWords.filter((_, i) => !r.ok[i]).map((w) => w.position));
    if (r.pass) reward(verse.verse_key);
  };
  // the self-assessment is recorded once per verse (the first answer); a later tap only changes what is shown
  const selfRate = (good: boolean) => {
    if (!verse) return;
    const first = rated === null;
    setRated(good ? "good" : "slip");
    if (!first) return;
    noteCheck(verse.verse_key, good ? allWords.length : Math.floor(allWords.length / 2), allWords.length);
    if (good) reward(verse.verse_key);
  };

  const nextVerse = () => { audio.stop(); if (vi < last) setVi(vi + 1); else router.replace(`/shams/next?s=${surah}` as Href); };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="التَّلَقِّي والعَرْض" title={s("talaqqiTitle")} lead={s("talaqqiLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          {locked ? (
            <Card gold><Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.ink }}>{s("proSurah")}</Text><GoldButton title={s("unlock")} onPress={() => ent.upsell()} /></Card>
          ) : error ? <ErrorState retry={() => router.replace(`/shams/talaqqi?s=${surah}&v=${vi}` as Href)} /> : !verses || !verse ? <Loading /> : (
            <>
              <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "left" }}>{`${name(surah)} · ${s("verseN", { v: nf(vi) })}`}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{s("gradeLine", { g: grade.tr, p: s(`prompt_${grade.prompt}` as never), m: nf(Math.round(grade.wordPass * 100)) })}</Text>
              {timed && step !== "verse" ? (
                <Card gold>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Term id={step === "listen" ? "talaqqi" : "ard"} inline />
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{s("phraseOf", { i: nf(pi + 1), n: nf(phrases.length) })}</Text>
                  </View>
                  {step === "listen" ? (
                    <>
                      <PromptedWords words={phrase!.words} prompt="full" size={28} />
                      <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <Btn primary icon="play" title={s("listenPhrase")} onPress={playPhrase} />
                        {[1, 3, 5].map((n) => <Chip key={n} label={`${nf(n)}×`} selected={reps === n} onPress={() => setReps(n)} />)}
                      </View>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{s("listenHint")}</Text>
                      <GoldButton title={s("nowRecite")} onPress={() => { audio.pause(); setStep("recite"); }} />
                    </>
                  ) : (
                    <>
                      <PromptedWords words={phrase!.words} prompt={grade.prompt} size={28} />
                      <SpeechCheck words={phrase!.words} pass={grade.wordPass} targetMs={(phrase!.end - phrase!.start) * grade.pace} onResult={onPhrase} />
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        <Btn icon="repeat" title={s("again")} onPress={() => setStep("listen")} />
                        <Btn primary title={pi + 1 < phrases.length ? s("nextPhrase") : s("wholeVerse")} onPress={() => { if (pi + 1 < phrases.length) { setPi(pi + 1); setStep("listen"); } else setStep("verse"); }} />
                      </View>
                    </>
                  )}
                </Card>
              ) : (
                <Card gold>
                  <Term id="ard" inline />
                  {!timed ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{s("noTimings")}</Text> : null}
                  <PromptedWords words={allWords} prompt={grade.prompt} />
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}><Btn icon="play" title={s("listenVerse")} onPress={playVerse} /></View>
                  <SpeechCheck words={allWords} pass={grade.wordPass} targetMs={verseMs ? verseMs * grade.pace : null} onResult={onVerse} />
                  {missed.length ? <Btn icon="repeat" title={r("drillMissed")} onPress={() => router.push(`/shams/drill?s=${surah}&v=${vi}&w=${missed.slice(0, 12).join(",")}` as Href)} /> : null}
                  <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                    <Chip label={s("selfGood")} selected={rated === "good"} onPress={() => selfRate(true)} />
                    <Chip label={s("selfSlip")} selected={rated === "slip"} onPress={() => selfRate(false)} />
                  </View>
                  <View style={{ height: 1, backgroundColor: t.line, marginVertical: 4 }} />
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("abTitle")}</Text>
                  <RecordCompare verse={verse} />
                  <Rubric verseKey={verse.verse_key} />
                  <GoldButton title={vi < last ? s("nextVerse") : s("finish")} onPress={nextVerse} />
                </Card>
              )}
              {vi >= last && step === "verse" ? <Card><ContinueNext surah={surah} /></Card> : null}
              <View style={{ gap: 10, padding: 4, borderRadius: R.md }}><Term id="talaqqi" /><Term id="mushafaha" /><Term id="ard" /><Term id="sanad" /></View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{s("talaqqiNote")}</Text>
              <SourceNote src={["jazari", "nawawi", "quranApi"]} review={{ status: "draft" }} />
            </>
          )}
        </View>
      </Page>
    </>
  );
}
