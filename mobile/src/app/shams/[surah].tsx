import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from "react-native";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARABIC_FONT, FONT, R, goldButton, stage, useTheme, AR_RIGHT } from "@/lib/theme";
import { Display, Eyebrow, GoldButton, GoldCard, OutlineButton, Stage, StarNumber, SurahBanner } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ErrorState, Loading, ProGate } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FREE, usePro } from "@/lib/pro";
import { readJSON, writeJSON } from "@/lib/store";
import { getChapter, getVerses, type Chapter, type Verse } from "@/lib/quran";
import { versePlan, surahProgress, type VersePlan } from "@/web/coach";
import { rate, readSrs, stats, type Rating } from "@/web/learning";
import { ageProfile } from "@/web/age";
import { completeItem, readSummary, type SessionItem } from "@/web/session";
import { useReciter } from "@/features/quran/reciter";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { VerseWords, WordGrid, wordAt, type Hide } from "@/features/quran/VerseWords";
import { TafsirPanel } from "@/features/quran/TafsirPanel";
import { hooks } from "@/features/shams/memory";
import { useShamsT } from "@/features/shams/texts";
import { goBack } from "@/components/page";

// The Shams Method, natively: one verse at a time, the coach plans the steps (lib/coach.ts versePlan), every step sets
// up the verse for one learning activity – exactly the flow of the website's Player in Shams mode.
// Step ids: 0 listen, 1 build up backwards, 2 word by word, 3 meaning & memory hooks, 4 tafsir, 5 fading cues + rating,
// 6 reflection, 7 connect with the previous verse.
type Notes = Record<string, { text: string; at: number }>;

export default function ShamsSession() {
  const params = useLocalSearchParams<{ surah: string; v?: string; session?: string }>();
  const surah = Math.max(1, Math.min(114, Number(params.surah) || 1));
  const sessionMode = params.session === "1";
  const { pro } = usePro();
  const t = useTheme();
  const st = useShamsT();
  const insets = useSafeAreaInsets();
  const { lang } = useLang();
  const [reciter] = useReciter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    setFailed(false);
    Promise.all([getChapter(surah, lang), getVerses(surah, lang, reciter)])
      .then(([c, v]) => { setChapter(c); setVerses(v); })
      .catch(() => setFailed(true));
  }, [surah, lang, reciter]);
  useEffect(load, [load]);

  if (!pro && !FREE.shamsSurah(surah)) {
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 8 }}>
        <TopBar title={chapter?.name_simple ?? ""} onClose={() => goBack()} />
        <ProGate feature="shams" title={st("lockedTitle")} text={st("lockedText")} />
      </View>
    );
  }
  if (failed) return <ErrorState retry={load} />;
  if (!verses || !chapter) return <Loading />;
  // like the website: a surah not yet begun starts at verse 1 (al-Fatiha with the basmala), otherwise where learning stopped
  const sp = surahProgress(readSrs())[surah - 1];
  const start = Number(params.v) || (sp && sp.learned > 0 ? sp.next ?? 1 : 1);
  return <Session key={`${surah}:${start}:${reciter.slug}`} chapter={chapter} verses={verses} startVerse={start} sessionMode={sessionMode} />;
}

function TopBar({ title, sub, onClose, steps, pos }: { title: string; sub?: string; onClose: () => void; steps?: number; pos?: number }) {
  const t = useTheme();
  const st = useShamsT();
  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 10, backgroundColor: t.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 44 }}>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={st("close")} hitSlop={10} style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
          <Icon name="close" color={t.ink} size={18} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }} numberOfLines={1}>{title}</Text>
          {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{sub}</Text> : null}
        </View>
      </View>
      {steps ? (
        <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }} accessibilityElementsHidden>
          {Array.from({ length: steps }, (_, k) => <View key={k} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: k <= (pos ?? -1) ? goldButton.line : t.line }} />)}
        </View>
      ) : null}
    </View>
  );
}

function Session({ chapter, verses, startVerse, sessionMode }: { chapter: Chapter; verses: Verse[]; startVerse: number; sessionMode: boolean }) {
  const t = useTheme();
  const ts = useWebT("shams");
  const tp = useWebT("player");
  const st = useShamsT();
  const insets = useSafeAreaInsets();
  const audio = useVerseAudio();
  const scroll = useRef<ScrollViewInstance>(null);
  const ap = useMemo(() => ageProfile(), []);

  const [idx, setIdx] = useState(Math.max(0, Math.min(verses.length - 1, startVerse - 1)));
  const verse = verses[idx];
  const prev = verses[idx - 1];
  const [plan, setPlan] = useState<VersePlan | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [fullPath, setFullPath] = useState(false);
  const [hide, setHide] = useState<Hide>(0);
  const [revealed, setRevealed] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [chain, setChain] = useState<number | null>(null);
  const [chainDone, setChainDone] = useState(false);
  const [linking, setLinking] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [finished, setFinished] = useState<"surah" | "session" | null>(null);
  const plays = useRef(0);
  const repeat = useRef(1);
  const speed = useRef(1);
  const linkQ = useRef<string[]>([]);
  const stepRef = useRef<number | null>(null);
  stepRef.current = step;

  const hasTimings = verse.segments.length > 0;
  const chainSegs = useMemo(() => [...verse.segments].sort((a, b) => a.start - b.start), [verse]);
  const chainStep = Math.max(1, Math.ceil(chainSegs.length / 6));
  const wordCount = verse.words.filter((w) => w.char_type_name === "word").length;

  const playVerse = useCallback((times: number, rate: number, v: Verse = verse) => {
    plays.current = 0; repeat.current = times; speed.current = rate;
    audio.play(v.audioUrl, { fallback: v.remoteAudioUrl, rate, title: `${chapter.name_simple} · ${v.verse_number}`, artist: "Quran Masterclass" });
  }, [audio, verse, chapter.name_simple]);

  // ----- the coach plans every verse anew: new verses get the full path, known verses only what they need
  const planFor = useCallback((i: number, full: boolean): VersePlan => {
    const v = verses[i];
    const words = v.words.filter((w) => w.char_type_name === "word").length;
    const p = versePlan(v.verse_key, words, verses[i - 1]?.verse_key ?? null, readSrs());
    return full && p.kind !== "new" ? { ...p, steps: [0, 1, 2, 3, 4, 5, ...(i > 0 ? [7] : []), 6] } : p;
  }, [verses]);

  const beginPlan = useCallback((i: number, full: boolean) => {
    const p = planFor(i, full);
    linkQ.current = []; setLinking(false); setChain(null); setChainDone(false); setSaved(null); setRevealed(false);
    setPlan(p);
    setStep(null);
    setTimeout(() => setStep(p.steps[0]), 0);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [planFor]);

  useEffect(() => { beginPlan(idx, fullPath); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- backward build-up: last word, last two words, … up to the whole verse, using the word timings
  const startChain = useCallback(() => {
    setChainDone(false);
    if (chainSegs.length < 2) { setChain(null); playVerse(3, Math.min(ap.speed, 0.75)); return; }
    const k = Math.max(0, chainSegs.length - chainStep);
    setChain(k);
    speed.current = Math.min(ap.speed, 0.85);
    audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, fromMs: chainSegs[k].start, rate: speed.current });
  }, [chainSegs, chainStep, playVerse, ap.speed, audio, verse]);

  const autoNext = (from: number) => setTimeout(() => { if (stepRef.current === from) nextStep(); }, 1400);

  // ----- connect: previous verse + this verse, twice
  const startLink = useCallback(() => {
    if (!prev) return;
    linkQ.current = [verse.audioUrl, prev.audioUrl, verse.audioUrl];
    setLinking(true);
    speed.current = ap.speed;
    audio.play(prev.audioUrl, { fallback: prev.remoteAudioUrl, rate: ap.speed });
  }, [prev, verse, ap.speed, audio]);

  audio.onEnd.current = () => {
    if (linkQ.current.length) { const u = linkQ.current.shift()!; audio.play(u, { rate: speed.current }); return; }
    if (linking) { setLinking(false); return; }
    if (chain !== null) {
      if (chain === 0) { setChain(null); setChainDone(true); if (step === 1) autoNext(1); return; }
      const k = Math.max(0, chain - chainStep);
      setChain(k);
      audio.seekPlay(chainSegs[k].start);
      return;
    }
    plays.current += 1;
    if (plays.current < repeat.current) { audio.seekPlay(0); return; }
    if (step === 0) autoNext(0);
  };

  // ----- every step sets up the verse for one learning activity
  useEffect(() => {
    if (step === null) return;
    switch (step) {
      case 0: setHide(0); setShowTranslit(false); setShowTranslation(false); playVerse(plan?.listen ?? ap.listen, ap.speed); break;
      case 1: setShowTranslit(true); if (hasTimings) startChain(); else playVerse(3, Math.min(ap.speed, 0.75)); break;
      case 2: setChain(null); audio.stop(); setShowTranslit(true); break;
      case 3: setShowTranslation(true); break;
      case 4: break;
      case 5: setShowTranslation(false); setShowTranslit(false); setHide(3); setRevealed(false); break;
      case 6: setHide(0); setShowTranslation(true); break;
      case 7: setHide(0); setShowTranslation(false); setShowTranslit(false); startLink(); break;
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepPos = plan && step !== null ? plan.steps.indexOf(step) : -1;
  const lastStep = !!plan && stepPos === plan.steps.length - 1;

  const goNextVerse = (ok: boolean) => {
    audio.stop();
    if (sessionMode) {
      const next: SessionItem | null = completeItem(verse.verse_key, ok);
      if (!next) { setFinished("session"); return; }
      const [s, v] = next.key.split(":").map(Number);
      router.replace(`/shams/${s}?v=${v}&session=1` as Href);
      return;
    }
    if (idx < verses.length - 1) setIdx(idx + 1); else setFinished("surah");
  };

  function nextStep() {
    if (step === null || !plan) return;
    linkQ.current = []; setLinking(false);
    if (!lastStep) { setStep(plan.steps[stepPos + 1]); scroll.current?.scrollTo({ y: 0, animated: true }); return; }
    goNextVerse(true);
  }

  const onRate = (r: Rating) => {
    const days = rate(verse.verse_key, r);
    setSaved(days ? tp("saved", { days }) : tp("savedToday"));
    if (r === "again") { setTimeout(() => beginPlan(idx, fullPath), 700); return; }
    setTimeout(nextStep, 600);
  };

  // ----- notes and own memory hooks (same keys as the website, synced with the account)
  const [notes, setNotes] = useState<Notes>(() => readJSON<Notes>("tf:notes", {}));
  const [mnemos, setMnemos] = useState<Record<string, string>>(() => readJSON<Record<string, string>>("tf:mnemo", {}));
  const saveNote = (text: string) => { const n = { ...notes }; if (text.trim()) n[verse.verse_key] = { text: text.trim(), at: Date.now() }; else delete n[verse.verse_key]; setNotes(n); writeJSON("tf:notes", n); };
  const saveMnemo = (text: string) => { const n = { ...mnemos }; if (text.trim()) n[verse.verse_key] = text.trim(); else delete n[verse.verse_key]; setMnemos(n); writeJSON("tf:mnemo", n); };

  const activeWord = audio.playing && !linkQ.current.length && !linking ? wordAt(verse, audio.positionMs) : null;
  const chainFrom = chain !== null ? chainSegs[chain]?.word ?? null : null;
  const learned = stats();

  if (finished) {
    const sum = readSummary();
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 8 }}>
        <TopBar title={chapter.name_simple} onClose={() => goBack()} />
        <Stage rounded={R.card} style={{ margin: 16 }}>
          <View style={{ padding: 22, gap: 12 }}>
            <SurahBanner arabic={chapter.name_arabic} />
            <Display size="title1" onStage style={{ marginTop: 8 }}>{finished === "session" ? st("sessionDone") : st("done")}</Display>
            <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft }}>
              {finished === "session" && sum ? st("sessionLead", { done: sum.done, fresh: sum.fresh, minutes: sum.minutes }) : st("doneLead")}
            </Text>
            <GoldButton title={finished === "session" ? st("toToday") : st("backToCourse")} onPress={() => goBack()} style={{ marginTop: 8 }} />
            {finished === "surah" ? <OutlineButton title={st("again")} onStage onPress={() => { setFinished(null); setIdx(0); beginPlan(0, fullPath); }} /> : null}
          </View>
        </Stage>
      </View>
    );
  }

  const h = step === 3 ? hooks(verse, verses[idx + 1]) : null;
  const sameRhyme = h ? verses.filter((x) => hooks(x).rhyme === h.rhyme).length : 0;
  const stepTitle = step !== null ? (step === 7 ? ts("s8") : ts(`s${step + 1}`)) : "";
  const stepText = step === null ? "" : step === 0 && plan ? ts("d1n", { n: plan.listen }) : step === 7 ? ts("d8") : ts(`d${step + 1}`);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 4 }}>
      <TopBar title={`${chapter.id}. ${chapter.name_simple}`} sub={st("verseOf", { n: verse.verse_number, total: verses.length })} onClose={() => { audio.stop(); goBack(); }} />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40, gap: 16 }} keyboardShouldPersistTaps="handled">
        {/* the verse card */}
        <GoldCard>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <StarNumber n={verse.verse_number} active />
            <Pressable onPress={() => (audio.playing ? audio.pause() : playVerse(1, speed.current || 1))} accessibilityRole="button" accessibilityLabel={audio.playing ? st("pause") : st("play")} hitSlop={8}
              style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: t.accentSoft }}>
              <Icon name={audio.playing ? "pause" : "play"} color={t.accent} size={22} />
            </Pressable>
          </View>
          {step === 7 && prev ? <View style={{ opacity: 0.55, marginBottom: 6 }}><VerseWords verse={prev} size={24} /></View> : null}
          <VerseWords verse={verse} activeWord={activeWord} hide={step === 5 ? hide : 0} revealed={revealed} dimBefore={chainFrom} size={wordCount > 30 ? 25 : 30} />
          {showTranslit && verse.transliteration && !(step === 5 && !revealed) ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 23, color: t.gold, marginTop: 10 }}>{verse.transliteration}</Text> : null}
          {showTranslation ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.muted, marginTop: 8 }}>{verse.translation}</Text> : null}
          {step === 2 ? <View style={{ marginTop: 14 }}><WordGrid verse={verse} activeWord={activeWord} onWord={(pos) => { const s = verse.segments.find((x) => x.word === pos); if (s) { speed.current = ap.speed; audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, fromMs: s.start, rate: ap.speed }); } }} /></View> : null}
        </GoldCard>

        {/* the Shams card on the stage */}
        {step !== null && plan ? (
          <Stage rounded={R.card}>
            <View style={{ padding: 18 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                  <Icon name="sun" color={stage.gold} size={14} />
                  <Text style={[{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1.7, textTransform: "uppercase", color: stage.gold }]}>{ts("title")} · {ts("stepOf", { n: stepPos + 1, total: plan.steps.length })}</Text>
                </View>
                {learned.todayCount > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{tp("todayCount", { n: learned.todayCount })}</Text> : null}
              </View>
              <View style={{ flexDirection: "row", gap: 4, marginTop: 12 }} accessibilityElementsHidden>
                {plan.steps.map((n, k) => <View key={n} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: k <= stepPos ? stage.gold : stage.hair }} />)}
              </View>
              {stepPos === 0 ? (
                <View style={{ marginTop: 12, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 12, paddingVertical: 9 }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textSoft }}>
                    <Text style={{ fontFamily: FONT.semibold, color: "#fff" }}>{ts(`k_${plan.kind}`)}</Text> · {ts(`w_${plan.kind}`, { n: plan.listen, words: plan.words, lapses: plan.lapses, pct: Math.round((plan.strength ?? 0) * 100) })}
                    {plan.kind !== "new" && !fullPath ? <Text onPress={() => { setFullPath(true); beginPlan(idx, true); }} style={{ fontFamily: FONT.semibold, color: stage.gold }}>  {ts("fullPath")}</Text> : null}
                  </Text>
                </View>
              ) : null}
              <Display size="title2" onStage style={{ marginTop: 16 }}>{stepTitle}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft, marginTop: 8 }}>{stepText}</Text>

              {step === 7 && prev ? (
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft, marginTop: 10 }}>{linking ? ts("linkNow") : ts("linkRecite")}</Text>
              ) : null}

              {step === 3 && h ? (
                <View style={{ marginTop: 14, gap: 10 }}>
                  {h.anchor ? <HookLine label={ts("hAnchor")} arabic={h.anchor.text_uthmani} text={h.anchor.translation?.text} /> : null}
                  {h.rhymeWord ? <HookLine label={ts("hRhyme")} arabic={`…${h.rhyme}`} text={`${h.rhymeWord.transliteration?.text ? `(${h.rhymeWord.transliteration.text}) · ` : ""}${ts("hRhymeN", { n: sameRhyme, total: verses.length })}`} /> : null}
                  {h.bridge?.from && h.bridge.to ? <HookLine label={ts("hBridge")} arabic={`${h.bridge.from.text_uthmani} ← ${h.bridge.to.text_uthmani}`} /> : null}
                  <HookLine label={ts("hAcrostic")} arabic={h.acrostic} gold />
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#fff", marginTop: 4 }}>{ts("hOwn")}</Text>
                  <TextInput key={verse.verse_key} defaultValue={mnemos[verse.verse_key] ?? ""} onEndEditing={(e) => saveMnemo(e.nativeEvent.text)} placeholder={ts("hOwnPh")} placeholderTextColor="rgba(255,255,255,0.4)" multiline
                    style={{ minHeight: 64, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", padding: 10, fontFamily: FONT.regular, fontSize: 15, textAlignVertical: "top" }} />
                </View>
              ) : null}

              {step === 6 ? (
                <View style={{ marginTop: 10, gap: 4 }}>
                  {["q1", "q2", "q3"].map((q) => <Text key={q} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft }}>– {ts(q)}</Text>)}
                  <TextInput key={verse.verse_key} defaultValue={notes[verse.verse_key]?.text ?? ""} onEndEditing={(e) => saveNote(e.nativeEvent.text)} placeholder={tp("notePlaceholder")} placeholderTextColor="rgba(255,255,255,0.4)" multiline
                    style={{ marginTop: 10, minHeight: 84, borderRadius: 8, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", padding: 10, fontFamily: FONT.regular, fontSize: 15, textAlignVertical: "top" }} />
                </View>
              ) : null}

              {/* step 5: fading cues, recall, reveal, rate */}
              {step === 5 && !revealed ? (
                <View style={{ marginTop: 14, gap: 10 }}>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft }}>{hide === 3 ? ts("cueHint") : ts("recallHint")}</Text>
                  {hide === 3 ? <OutlineButton title={ts("noCues")} onStage onPress={() => setHide(2)} /> : null}
                  <GoldButton title={tp("reveal")} onPress={() => setRevealed(true)} />
                </View>
              ) : null}
              {step === 5 && revealed ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#fff", marginBottom: 10 }}>{tp("rateQ")}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <RateButton label={tp("again")} kind="again" onPress={() => onRate("again")} />
                    <RateButton label={tp("good")} kind="good" onPress={() => onRate("good")} />
                    <RateButton label={tp("easy")} kind="easy" onPress={() => onRate("easy")} />
                  </View>
                  {saved ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.gold, marginTop: 10 }} accessibilityLiveRegion="polite">{saved}</Text> : null}
                </View>
              ) : null}

              {/* actions (the tafsir step has them under the tafsir text) */}
              {step !== 5 && step !== 4 ? (
                <View style={{ marginTop: 20, gap: 10 }}>
                  {step === 1 && chain !== null ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft }}>{ts("chainNow")}</Text> : null}
                  {step === 1 && chainDone ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{ts("chainDone")}</Text> : null}
                  <GoldButton title={lastStep ? (sessionMode || idx < verses.length - 1 ? ts("nextVerse") : ts("finish")) : ts("next")} onPress={nextStep} />
                  {step === 0 ? <OutlineButton title={ts("again")} onStage onPress={() => playVerse(plan.listen, ap.speed)} /> : null}
                  {step === 1 && hasTimings ? <OutlineButton title={ts("chainAgain")} onStage onPress={startChain} /> : null}
                  {step === 1 && !hasTimings ? <OutlineButton title={ts("again")} onStage onPress={() => playVerse(3, Math.min(ap.speed, 0.75))} /> : null}
                  {step === 7 && !linking ? <OutlineButton title={ts("linkAgain")} onStage onPress={startLink} /> : null}
                </View>
              ) : null}
            </View>
          </Stage>
        ) : null}

        {/* step 4: the tafsir of this verse */}
        {step === 4 ? (
          <GoldCard star={false}>
            <Eyebrow style={{ marginBottom: 10 }}>{tp("tafsir")}</Eyebrow>
            <TafsirPanel surah={chapter.id} verse={verse.verse_number} />
            <GoldButton title={lastStep ? (sessionMode || idx < verses.length - 1 ? ts("nextVerse") : ts("finish")) : ts("next")} onPress={nextStep} style={{ marginTop: 18 }} />
          </GoldCard>
        ) : null}
      </ScrollView>
    </View>
  );
}

function HookLine({ label, arabic, text, gold }: { label: string; arabic: string; text?: string; gold?: boolean }) {
  return (
    <View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: "#fff" }}>{label}</Text>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 36, color: gold ? stage.gold : "#fff", textAlign: AR_RIGHT, writingDirection: "rtl" }}>{arabic}</Text>
      {text ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textSoft }}>{text}</Text> : null}
    </View>
  );
}

function RateButton({ label, kind, onPress }: { label: string; kind: Rating; onPress: () => void }) {
  const base = { flex: 1, height: 48, borderRadius: R.sm, alignItems: "center" as const, justifyContent: "center" as const };
  if (kind === "easy") {
    return <GoldButton title={label} onPress={onPress} style={{ flex: 1 }} />;
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
      style={({ pressed }) => [base, kind === "again"
        ? { borderWidth: 1, borderColor: "rgba(232,140,160,0.55)", backgroundColor: pressed ? "rgba(190,84,104,0.2)" : "rgba(190,84,104,0.1)" }
        : { backgroundColor: pressed ? "rgb(5,90,65)" : "rgb(6,108,78)" }]}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: kind === "again" ? "rgb(244,190,200)" : "#fff" }}>{label}</Text>
    </Pressable>
  );
}
