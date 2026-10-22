import { DoneShare } from "@/features/share/SharePrompt";
import { DaysGate } from "@/features/sisters/ui";
import { GardenBurst } from "@/features/garden/widgets";
import { shamsGrow } from "@/features/garden/garden";
import { dropVerse } from "@/features/garden/catalog";
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
import { versePlan, surahProgress, stepCount, type VersePlan } from "@/web/coach";
import { rate, rateGrade, readSrs, stats, type Rating } from "@/web/learning";
import { paceSample } from "@/web/verseTime";
import { ageProfile } from "@/web/age";
import { completeItem, currentItem, readSession, readSummary, type SessionItem } from "@/web/session";
import { useReciter } from "@/features/quran/reciter";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { VerseWords, wordAt, type Hide } from "@/features/quran/VerseWords";
import { TafsirPanel } from "@/features/quran/TafsirPanel";
import { AskTutor } from "@/features/tutor/AskTutor";
import { hooks } from "@/features/shams/memory";
import { useShamsT } from "@/features/shams/texts";
import { useLearnT } from "@/features/learn/texts";
import { goBack } from "@/components/page";
import { ContinueNext } from "@/features/shams2/Continue";
import { notePace, useFlex } from "@/features/shams2/store2";
import { sectionOf } from "@/features/shams2/maqasid";
import { noteCheck, noteWords } from "@/features/shams2/store";
import { ReciteCheck } from "@/features/extra/ReciteCheck";
import { chainUnits, placement, repeatPauseMs, sittingRange, suggestRating, unitStarts } from "@/features/shams/flex";
import { AlwaysFullSwitch, BlindCard, Comprehension, LinkChips, NextUp, QuickCheck, ShortTafsir, ThumbDock, WordStudy } from "@/features/shams/FlexParts";
import { useFlexT } from "@/features/shams/flex/text";

// The Shams Method, natively: one verse at a time, the coach plans the steps (lib/coach.ts versePlan), every step sets
// up the verse for one learning activity – exactly the flow of the website's Player in Shams mode.
// Step ids: 0 listen, 1 build up backwards, 2 word by word, 3 meaning & memory hooks, 4 tafsir, 5 fading cues + rating,
// 6 reflection, 7 connect with the previous verse.
// Shams 3.0 (flexible classic path): "I know this already" quick check on new verses (placement), backward build-up by
// phrase units, single-word audio with loop and roots, what comes next, the short tafsir first, the on-device word
// check, a comprehension question, transition chips, today's verses in one go at the end, and the own pace.
type Notes = Record<string, { text: string; at: number }>;
// quick checks passed in a row (placement): kept while the app runs, per surah
const placementRun = { s: 0, n: 0 };

// "Meine Tage" (features/sisters): the session asks to recite from memory, so it is gated "recite" (paused for the
// majority view, a note for Maliki and Ja'fari, everything paused in her own strict mode)
export default function ShamsSession() {
  return <DaysGate kind="recite"><ShamsSessionScreen /></DaysGate>;
}

function ShamsSessionScreen() {
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

  const locked = !pro && !FREE.shamsSurah(surah);
  const [skipEnded, setSkipEnded] = useState(false);
  useEffect(() => {
    if (!locked || !sessionMode) return;
    // a session item behind the Pro gate: move on to the next allowed one, or end with the summary
    const cur = currentItem(readSession());
    if (!cur) { setSkipEnded(true); return; }
    let next: SessionItem | null = completeItem(cur.key, true, true);
    while (next && !FREE.shamsSurah(Number(next.key.split(":")[0]))) next = completeItem(next.key, true, true);
    if (!next) { setSkipEnded(true); return; }
    const [s, v] = next.key.split(":").map(Number);
    router.replace(`/shams/${s}?v=${v}&session=1` as Href);
  }, [locked, sessionMode, surah]);
  if (locked && sessionMode && skipEnded) {
    const sum = readSummary();
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <TopBar title="" onClose={() => goBack()} />
        <Display size="title1" style={{ marginTop: 24 }}>{st("sessionDone")}</Display>
        {sum ? <Text style={{ marginTop: 10, color: t.ink, fontFamily: FONT.regular, fontSize: 16 }}>{st("sessionLead", { done: sum.done, fresh: sum.fresh, minutes: sum.minutes })}</Text> : null}
        <GoldButton title={st("toToday")} onPress={() => goBack()} style={{ marginTop: 16 }} />
        <View style={{ marginTop: 12 }}><DoneShare kind="lessonDone" title={st("sessionDone")} body={sum ? st("sessionLead", { done: sum.done, fresh: sum.fresh, minutes: sum.minutes }) : undefined} /></View>
      </View>
    );
  }
  if (locked && sessionMode) return <Loading />;
  if (locked) {
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
  const { pro } = usePro();
  const t = useTheme();
  const ts = useWebT("shams");
  const tp = useWebT("player");
  const st = useShamsT();
  const f = useFlexT();
  const flex = useFlex();
  const insets = useSafeAreaInsets();
  const audio = useVerseAudio();
  const scroll = useRef<ScrollViewInstance>(null);
  const ap = useMemo(() => ageProfile(), []);
  // kids mode, the same rule as the website: the kids switch (tf:kids) or the age group "child" (account birth year, else
  // the age band of identity.ts, via ageProfile) – no quick check and no word check
  const kids = useMemo(() => { const k = readJSON<unknown>("tf:kids", null); return k === 1 || k === "1" || k === true || ap.group === "child"; }, [ap]);

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
  // Shams 3.0: quick check ("I know this already"), the placement run, the word check's score, the detailed tafsir on
  // request, the learner's turn in the listen-and-repeat loop, the verses learned in this sitting
  const [quick, setQuick] = useState<null | "ask" | "revealed">(null);
  const [placing, setPlacing] = useState(false);
  const [reciteScore, setReciteScore] = useState<number | null>(null);
  const [fullTafsir, setFullTafsir] = useState(false);
  const [turn, setTurn] = useState(false);
  const [sitting, setSitting] = useState<number[]>([]);
  const plays = useRef(0);
  const repeat = useRef(1);
  const speed = useRef(1);
  const linkQ = useRef<string[]>([]);
  const stepRef = useRef<number | null>(null);
  stepRef.current = step;
  const quickRef = useRef(quick);
  quickRef.current = quick;
  const loopLeft = useRef(0); // listen-and-repeat: listenings left (0 = off)
  const turnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // quick check: one pass per verse (a second tap in the pause before the next verse must not rate again or skip a verse)
  const passing = useRef(false);
  const passTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPass = useCallback(() => { passing.current = false; if (passTimer.current) { clearTimeout(passTimer.current); passTimer.current = null; } }, []);
  const t0 = useRef(0); // when the learner began this new verse (own pace)
  const paceKey = useRef("");

  const hasTimings = verse.segments.length > 0;
  const words = useMemo(() => verse.words.filter((w) => w.char_type_name === "word").map((w) => ({ position: w.position, text: w.text_uthmani })), [verse]);
  const wordCount = words.length;
  // backward build-up: phrase units split at the pause marks (≤ 4 words); without matching timings the old even chunks
  const units = useMemo(() => chainUnits(words), [words]);
  const starts = useMemo(() => unitStarts(units, verse.segments), [units, verse]);
  const chainPts = useMemo(() => {
    if (starts) return units.map((u, i) => ({ ms: starts[i], word: u.from }));
    if (!units.length) return [];
    const segs = [...verse.segments].sort((a, b) => a.start - b.start);
    const stepN = Math.max(1, Math.ceil(segs.length / 6));
    const pts: { ms: number; word: number }[] = [];
    for (let k = 0; k < segs.length; k += stepN) pts.push({ ms: segs[k].start, word: segs[k].word });
    return pts;
  }, [units, starts, verse]);
  // the path that built chainPts: phrase units from the word timings, or the even chunks when the timings do not match
  const byUnits = !!starts;

  const playVerse = useCallback((times: number, rate: number, v: Verse = verse) => {
    plays.current = 0; repeat.current = times; speed.current = rate;
    audio.play(v.audioUrl, { fallback: v.remoteAudioUrl, rate, title: `${chapter.name_simple} · ${v.verse_number}`, artist: "Quran Masterclass" });
  }, [audio, verse, chapter.name_simple]);

  const stopLoop = useCallback(() => {
    loopLeft.current = 0;
    if (turnTimer.current) { clearTimeout(turnTimer.current); turnTimer.current = null; }
    setTurn(false);
  }, []);
  useEffect(() => () => { if (turnTimer.current) clearTimeout(turnTimer.current); if (passTimer.current) clearTimeout(passTimer.current); }, []);

  // ----- the coach plans every verse anew: new verses get the full path, known verses only what they need
  const planFor = useCallback((i: number, full: boolean): VersePlan => {
    const v = verses[i];
    const n = v.words.filter((w) => w.char_type_name === "word").length;
    const p = versePlan(v.verse_key, n, verses[i - 1]?.verse_key ?? null, readSrs());
    return full && p.kind !== "new" ? { ...p, steps: [0, 1, 2, 3, 4, 5, ...(i > 0 ? [7] : []), 6] } : p;
  }, [verses]);

  const beginPlan = useCallback((i: number, full: boolean) => {
    const p = planFor(i, full);
    linkQ.current = []; setLinking(false); setChain(null); setChainDone(false); setSaved(null); setRevealed(false);
    stopLoop(); clearPass(); setReciteScore(null); setFullTafsir(false);
    // placement: after passed quick checks in a row, a new verse starts with the quick check right away
    const run = placementRun.s === chapter.id ? placementRun.n : 0;
    const pl = placement(p.kind, run, kids);
    setQuick(pl === "start" ? "ask" : null);
    setPlacing(pl === "start");
    const key = verses[i].verse_key;
    if (paceKey.current !== key) { paceKey.current = key; t0.current = Date.now(); }
    setPlan(p);
    setStep(null);
    setTimeout(() => setStep(p.steps[0]), 0);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [planFor, stopLoop, clearPass, chapter.id, kids, verses]);

  useEffect(() => { beginPlan(idx, fullPath); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // ----- backward build-up: the last unit, the last two units, … up to the whole verse, using the word timings
  const startRepeat = useCallback(() => {
    // short verses (and verses without timings): listen, then the learner's turn in a pause as long as the verse – three times
    stopLoop();
    setChain(null); setChainDone(false);
    loopLeft.current = 3;
    plays.current = 0; repeat.current = 1; speed.current = Math.min(ap.speed, 0.85);
    audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, rate: speed.current });
  }, [stopLoop, ap.speed, audio, verse]);
  const startChain = useCallback(() => {
    stopLoop();
    setChainDone(false);
    if (!hasTimings || chainPts.length < 2) { startRepeat(); return; }
    const k = chainPts.length - 1;
    setChain(k);
    speed.current = Math.min(ap.speed, 0.85);
    audio.play(verse.audioUrl, { fallback: verse.remoteAudioUrl, fromMs: chainPts[k].ms, rate: speed.current });
  }, [stopLoop, hasTimings, chainPts, startRepeat, ap.speed, audio, verse]);

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
    if (loopLeft.current > 0) {
      loopLeft.current -= 1;
      const len = audio.durationMs || verse.segments.reduce((m, s) => Math.max(m, s.end), 0) || 3000;
      setTurn(true);
      turnTimer.current = setTimeout(() => {
        turnTimer.current = null;
        setTurn(false);
        if (loopLeft.current > 0) { audio.seekPlay(0); return; }
        setChainDone(true);
        if (stepRef.current === 1) autoNext(1);
      }, repeatPauseMs(len / (speed.current || 1)));
      return;
    }
    if (chain !== null) {
      if (chain === 0) { setChain(null); setChainDone(true); if (step === 1) autoNext(1); return; }
      const k = chain - 1;
      setChain(k);
      audio.seekPlay(chainPts[k].ms);
      return;
    }
    plays.current += 1;
    if (plays.current < repeat.current) { audio.seekPlay(0); return; }
    if (step === 0) autoNext(0);
  };

  // ----- every step sets up the verse for one learning activity
  useEffect(() => {
    if (step === null) return;
    if (step !== 1) stopLoop();
    switch (step) {
      case 0: setHide(0); setShowTranslit(false); setShowTranslation(false); if (quickRef.current) audio.stop(); else playVerse(plan?.listen ?? ap.listen, ap.speed); break;
      case 1: setShowTranslit(true); startChain(); break;
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

  const slipped = useRef<string | null>(null); // verse that was rated "again" during this pass
  const goNextVerse = (ok: boolean) => {
    audio.stop();
    stopLoop();
    // the tree grows with every verse of the Shams Method, and the verse joins the sticker collection
    if (ok) { const [gs, gv] = verse.verse_key.split(":").map(Number); shamsGrow("verse", pro); dropVerse(gs, gv); setSitting((xs) => (xs.includes(gv) ? xs : [...xs, gv])); }
    if (sessionMode) {
      let next: SessionItem | null = completeItem(verse.verse_key, ok && slipped.current !== verse.verse_key);
      // free users: skip items in Pro-locked surahs instead of getting stuck behind the gate
      while (next && !pro && !FREE.shamsSurah(Number(next.key.split(":")[0]))) next = completeItem(next.key, true, true);
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
    // own pace: the time this new verse took on the full path (a sample scaled to a verse of average length)
    if (plan.kind === "new" && t0.current) { notePace(paceSample(Date.now() - t0.current, Math.max(1, plan.words)), 1); t0.current = 0; }
    goNextVerse(true);
  }

  const onRate = (r: Rating) => {
    const days = rate(verse.verse_key, r);
    setSaved(days ? tp("saved", { days }) : tp("savedToday"));
    if (r === "again") slipped.current = verse.verse_key;
    if (r === "again") { setTimeout(() => beginPlan(idx, fullPath), 700); return; }
    setTimeout(nextStep, 600);
  };

  // ----- quick check: the verse sits already -> rated "good" (FSRS 3) and planned as a known verse; otherwise the full path
  const startQuick = () => { audio.stop(); setQuick("ask"); scroll.current?.scrollTo({ y: 0, animated: true }); };
  const quickPass = () => {
    if (passing.current) return;
    passing.current = true;
    const days = rateGrade(verse.verse_key, 3);
    placementRun.n = placementRun.s === chapter.id ? placementRun.n + 1 : 1;
    placementRun.s = chapter.id;
    t0.current = 0;
    setSaved(`${f("quickPassed")} ${days ? tp("saved", { days }) : tp("savedToday")}`);
    passTimer.current = setTimeout(() => { passTimer.current = null; goNextVerse(true); }, 900);
  };
  const quickFail = () => {
    if (passing.current) return;
    placementRun.s = chapter.id; placementRun.n = 0;
    setQuick(null); setPlacing(false);
    t0.current = Date.now();
    playVerse(plan?.listen ?? ap.listen, ap.speed);
  };

  // ----- notes and own memory hooks (same keys as the website, synced with the account)
  const [notes, setNotes] = useState<Notes>(() => readJSON<Notes>("tf:notes", {}));
  const [mnemos, setMnemos] = useState<Record<string, string>>(() => readJSON<Record<string, string>>("tf:mnemo", {}));
  const saveNote = (text: string) => { const n = { ...notes }; if (text.trim()) n[verse.verse_key] = { text: text.trim(), at: Date.now() }; else delete n[verse.verse_key]; setNotes(n); writeJSON("tf:notes", n); };
  const saveMnemo = (text: string) => { const n = { ...mnemos }; if (text.trim()) n[verse.verse_key] = text.trim(); else delete n[verse.verse_key]; setMnemos(n); writeJSON("tf:mnemo", n); };

  const activeWord = audio.playing && !linkQ.current.length && !linking ? wordAt(verse, audio.positionMs) : null;
  const chainFrom = chain !== null ? chainPts[chain]?.word ?? null : null;
  const learned = stats();
  const range = sittingRange(chapter.id, sitting);

  if (finished) {
    const sum = readSummary();
    return (
      <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 8 }}>
        <TopBar title={chapter.name_simple} onClose={() => goBack()} />
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          <Stage rounded={R.card}>
            <View style={{ padding: 22, gap: 12 }}>
              <SurahBanner arabic={chapter.name_arabic} />
              <Display size="title1" onStage style={{ marginTop: 8 }}>{finished === "session" ? st("sessionDone") : st("done")}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft }}>
                {finished === "session" && sum ? st("sessionLead", { done: sum.done, fresh: sum.fresh, minutes: sum.minutes }) : st("doneLead")}
              </Text>
              <GardenBurst kind={finished} />
              {range ? <BlindCard onStage s={range.s} from={range.from} to={range.to} /> : null}
              <GoldButton title={finished === "session" ? st("toToday") : st("backToCourse")} onPress={() => goBack()} style={{ marginTop: 8 }} />
              <DoneShare kind="lessonDone" onStage arabic={chapter.name_arabic} title={chapter.name_simple}
                body={finished === "session" && sum ? st("sessionLead", { done: sum.done, fresh: sum.fresh, minutes: sum.minutes }) : st("doneLead")} />
              {finished === "surah" ? <OutlineButton title={st("again")} onStage onPress={() => { setFinished(null); setSitting([]); setIdx(0); beginPlan(0, fullPath); }} /> : null}
              <ContinueNext onStage surah={chapter.id} />
            </View>
          </Stage>
        </ScrollView>
      </View>
    );
  }

  const h = step === 3 ? hooks(verse, verses[idx + 1]) : null;
  const sameRhyme = h ? verses.filter((x) => hooks(x).rhyme === h.rhyme).length : 0;
  const stepTitle = step !== null ? (step === 7 ? ts("s8") : ts(`s${step + 1}`)) : "";
  const stepText = step === null ? "" : step === 0 && plan ? ts("d1n", { n: plan.listen }) : step === 7 ? ts("d8") : ts(`d${step + 1}`);
  const canQuick = !!plan && placement(plan.kind, 0, kids) !== "off";
  const nextTitle = lastStep ? (sessionMode || idx < verses.length - 1 ? ts("nextVerse") : ts("finish")) : ts("next");
  // the short version of the tafsir first (maqāṣid section), the detailed one on request or when the setting says so
  const shortFirst = step === 4 && flex.tafsir !== "full" && !fullTafsir && !!sectionOf(chapter.id, verse.verse_number);
  const tip = suggestRating(reciteScore);
  // the main action of the step sits in the bottom dock (rating and quick check have their own buttons)
  const dock = step !== null && plan && step !== 5 && !quick;

  return (
    <View style={{ flex: 1, backgroundColor: t.bg, paddingTop: insets.top + 4 }}>
      <TopBar title={`${chapter.id}. ${chapter.name_simple}`} sub={st("verseOf", { n: verse.verse_number, total: verses.length })} onClose={() => { audio.stop(); stopLoop(); goBack(); }} />
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + (dock ? 112 : 40), gap: 16 }} keyboardShouldPersistTaps="handled">
        {/* the verse card */}
        <GoldCard>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <StarNumber n={verse.verse_number} active />
            {quick !== "ask" ? (
              <Pressable onPress={() => (audio.playing ? audio.pause() : playVerse(1, speed.current || 1))} accessibilityRole="button" accessibilityLabel={audio.playing ? st("pause") : st("play")} hitSlop={8}
                style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: t.accentSoft }}>
                <Icon name={audio.playing ? "pause" : "play"} color={t.accent} size={22} />
              </Pressable>
            ) : null}
          </View>
          {step === 7 && prev ? <View style={{ opacity: 0.55, marginBottom: 6 }}><VerseWords verse={prev} size={24} /></View> : null}
          <VerseWords verse={verse} activeWord={activeWord} hide={step === 5 ? hide : quick ? 2 : 0} revealed={quick === "revealed" || (step === 5 && revealed)} dimBefore={chainFrom} size={wordCount > 30 ? 25 : 30} />
          {showTranslit && verse.transliteration && !(step === 5 && !revealed) && !quick ? <Text style={{ fontFamily: FONT.italic, fontSize: 15, lineHeight: 23, color: t.gold, marginTop: 10 }}>{verse.transliteration}</Text> : null}
          {showTranslation && !quick ? <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.muted, marginTop: 8 }}>{verse.translation}</Text> : null}
          {step === 2 ? <WordStudy verse={verse} surah={chapter.id} activeWord={activeWord} beforePlay={() => audio.stop()} /> : null}
        </GoldCard>

        {/* the Shams card on the stage */}
        {step !== null && plan ? (
          <Stage rounded={R.card}>
            <View style={{ padding: 18 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                  <Icon name="sun" color={stage.gold} size={14} />
                  <Text style={[{ fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1.7, textTransform: "uppercase", color: stage.gold }]}>{ts("title")} · {ts("stepOf", stepCount(plan.steps, step as number))}</Text>
                </View>
                {learned.todayCount > 0 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: stage.textMuted }}>{tp("todayCount", { n: learned.todayCount })}</Text> : null}
              </View>
              <View style={{ flexDirection: "row", gap: 4, marginTop: 12 }} accessibilityElementsHidden>
                {plan.steps.map((n, k) => <View key={n} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: k <= stepPos ? stage.gold : stage.hair }} />)}
              </View>

              {quick && step === 0 ? (
                <>
                  <QuickCheck revealed={quick === "revealed"} placement={placing} disabled={!!saved} onReveal={() => setQuick("revealed")} onPass={quickPass} onFail={quickFail} />
                  {saved ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.gold, marginTop: 10 }} accessibilityLiveRegion="polite">{saved}</Text> : null}
                </>
              ) : (
                <>
                  {stepPos === 0 ? (
                    <View style={{ marginTop: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)", paddingHorizontal: 12, paddingVertical: 9 }}>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: stage.textSoft }}>
                        <Text style={{ fontFamily: FONT.semibold, color: "#fff" }}>{ts(`k_${plan.kind}`)}</Text> · {ts(`w_${plan.kind}`, { n: plan.listen, words: plan.words, lapses: plan.lapses, pct: Math.round((plan.strength ?? 0) * 100) })}
                        {plan.kind !== "new" && !fullPath ? <Text onPress={() => { setFullPath(true); beginPlan(idx, true); }} style={{ fontFamily: FONT.semibold, color: stage.gold }}>  {ts("fullPath")}</Text> : null}
                      </Text>
                    </View>
                  ) : null}
                  <Display size="title2" onStage style={{ marginTop: 16 }}>{stepTitle}</Display>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: stage.textSoft, marginTop: 8 }}>{stepText}</Text>

                  {step === 1 ? (
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft, marginTop: 10 }}>
                      {!(hasTimings && chainPts.length >= 2) ? (units.length ? f("wholeLoop") : f("shortLoop")) : byUnits ? f("unitsLead", { n: units.length }) : f("chunksLead", { n: chainPts.length })}
                    </Text>
                  ) : null}

                  {step === 7 && prev ? (
                    <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft, marginTop: 10 }}>{linking ? ts("linkNow") : ts("linkRecite")}</Text>
                  ) : null}
                  {step === 7 && prev && !linking ? <LinkChips surah={chapter.id} verse={verse.verse_number} /> : null}

                  {step === 3 && h ? (
                    <View style={{ marginTop: 14, gap: 10 }}>
                      {h.anchor ? <HookLine label={ts("hAnchor")} arabic={h.anchor.text_uthmani} text={h.anchor.translation?.text} /> : null}
                      {h.rhymeWord ? <HookLine label={ts("hRhyme")} arabic={`…${h.rhyme}`} text={`${h.rhymeWord.transliteration?.text ? `(${h.rhymeWord.transliteration.text}) · ` : ""}${ts("hRhymeN", { n: sameRhyme, total: verses.length })}`} /> : null}
                      {h.bridge?.from && h.bridge.to ? <HookLine label={ts("hBridge")} arabic={`${h.bridge.from.text_uthmani} ← ${h.bridge.to.text_uthmani}`} /> : null}
                      <HookLine label={ts("hAcrostic")} arabic={h.acrostic} gold />
                      <NextUp surah={chapter.id} verse={verse.verse_number} next={verses[idx + 1]} />
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: "#fff", marginTop: 4 }}>{ts("hOwn")}</Text>
                      <TextInput key={verse.verse_key} defaultValue={mnemos[verse.verse_key] ?? ""} onEndEditing={(e) => saveMnemo(e.nativeEvent.text)} placeholder={ts("hOwnPh")} placeholderTextColor="rgba(255,255,255,0.4)" multiline
                        style={{ minHeight: 64, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", padding: 10, fontFamily: FONT.regular, fontSize: 15, textAlignVertical: "top" }} />
                    </View>
                  ) : null}

                  {step === 6 ? (
                    <View style={{ marginTop: 10, gap: 4 }}>
                      <Comprehension verses={verses} idx={idx} />
                      <View style={{ height: 10 }} />
                      {["q1", "q2", "q3"].map((q) => <Text key={q} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft }}>– {ts(q)}</Text>)}
                      <TextInput key={verse.verse_key} defaultValue={notes[verse.verse_key]?.text ?? ""} onEndEditing={(e) => saveNote(e.nativeEvent.text)} placeholder={tp("notePlaceholder")} placeholderTextColor="rgba(255,255,255,0.4)" multiline
                        style={{ marginTop: 10, minHeight: 84, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)", backgroundColor: "rgba(255,255,255,0.05)", color: "#fff", padding: 10, fontFamily: FONT.regular, fontSize: 15, textAlignVertical: "top" }} />
                    </View>
                  ) : null}

                  {/* step 5: fading cues, recall (or the on-device word check), reveal, rate */}
                  {step === 5 && !revealed ? (
                    <View style={{ marginTop: 14, gap: 10 }}>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft }}>{hide === 3 ? ts("cueHint") : ts("recallHint")}</Text>
                      {hide === 3 ? <OutlineButton title={ts("noCues")} onStage onPress={() => setHide(2)} /> : null}
                      <GoldButton title={tp("reveal")} onPress={() => setRevealed(true)} />
                      {!kids ? (
                        <ReciteCheck dark words={words.map((w) => w.text)} pauseOthers={() => audio.stop()} onPlayReciter={() => playVerse(1, ap.speed)}
                          onResult={(score, ok) => {
                            setReciteScore(score);
                            noteWords(verse.verse_key, ok.map((o, i) => ({ position: words[i]?.position ?? i + 1, ok: o })));
                            noteCheck(verse.verse_key, ok.filter(Boolean).length, ok.length);
                            setRevealed(true);
                          }} />
                      ) : null}
                    </View>
                  ) : null}
                  {step === 5 && revealed ? (
                    <View style={{ marginTop: 14 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: "#fff", marginBottom: 10 }}>{tp("rateQ")}</Text>
                      {tip ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: stage.gold, marginBottom: 8 }}>{f("suggested")}: {tp(tip)}</Text> : null}
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <RateButton label={tp("again")} kind="again" tip={tip === "again"} onPress={() => onRate("again")} />
                        <RateButton label={tp("good")} kind="good" tip={tip === "good"} onPress={() => onRate("good")} />
                        <RateButton label={tp("easy")} kind="easy" tip={tip === "easy"} onPress={() => onRate("easy")} />
                      </View>
                      {saved ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: stage.gold, marginTop: 10 }} accessibilityLiveRegion="polite">{saved}</Text> : null}
                    </View>
                  ) : null}

                  {/* second actions (the main action is in the bottom dock) */}
                  {step !== 5 && step !== 4 ? (
                    <View style={{ marginTop: 20, gap: 10 }}>
                      {step === 1 && chain !== null && byUnits ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.textSoft }}>{f("unitOf", { k: chainPts.length - chain, n: chainPts.length })} · {ts("chainNow")}</Text> : null}
                      {step === 1 && chain !== null && !byUnits ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textSoft }}>{ts("chainNow")}</Text> : null}
                      {step === 1 && turn ? <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: stage.gold }} accessibilityLiveRegion="polite">{f("yourTurn")}</Text> : null}
                      {step === 1 && chainDone ? <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: stage.gold }}>{ts("chainDone")}</Text> : null}
                      {step === 0 && canQuick ? <OutlineButton title={f("quickOffer")} icon="check" onStage onPress={startQuick} /> : null}
                      {step === 0 ? <OutlineButton title={ts("again")} onStage onPress={() => playVerse(plan.listen, ap.speed)} /> : null}
                      {step === 1 && hasTimings && chainPts.length >= 2 ? <OutlineButton title={ts("chainAgain")} onStage onPress={startChain} /> : null}
                      {step === 1 && !(hasTimings && chainPts.length >= 2) ? <OutlineButton title={ts("again")} onStage onPress={startRepeat} /> : null}
                      {step === 7 && !linking ? <OutlineButton title={ts("linkAgain")} onStage onPress={startLink} /> : null}
                    </View>
                  ) : null}
                </>
              )}
            </View>
          </Stage>
        ) : null}

        {/* step 4: the short version first (what the passage is about), the detailed tafsir on request */}
        {step === 4 ? (
          <GoldCard star={false}>
            <Eyebrow style={{ marginBottom: 10 }}>{shortFirst ? f("shortTitle") : tp("tafsir")}</Eyebrow>
            {shortFirst ? <ShortTafsir surah={chapter.id} verse={verse.verse_number} onFull={() => setFullTafsir(true)} /> : (
              <>
                <TafsirPanel surah={chapter.id} verse={verse.verse_number} />
                <AlwaysFullSwitch />
              </>
            )}
          </GoldCard>
        ) : null}
        {/* the tutor (Dalil / Hidaya) on meaning, tafsir and reflection: questions about this verse, answered from the sources */}
        {step === 3 || step === 4 || step === 6 ? <AskTutor context={{ kind: "shams", verse: verse.verse_key, title: `${chapter.name_simple} ${verse.verse_key}` }} /> : null}

        {/* why this step works (the website's principles of the method) and the way through the surah */}
        {step !== null ? <StepWhy step={step} /> : null}
        {step !== null ? (
          <SurahPath chapter={chapter} verses={verses} idx={idx} srsVersion={learned.todayCount}
            onPick={sessionMode ? undefined : (i) => { audio.stop(); stopLoop(); setIdx(i); beginPlan(i, false); scroll.current?.scrollTo({ y: 0, animated: true }); }} />
        ) : null}
        {!sessionMode && range && sitting.length >= 2 ? <BlindCard s={range.s} from={range.from} to={range.to} /> : null}
      </ScrollView>
      {dock ? (
        <ThumbDock bottom={insets.bottom}>
          <GoldButton title={nextTitle} icon={lastStep ? "check" : "next"} onPress={nextStep} style={{ flex: 1 }} />
        </ThumbDock>
      ) : null}
    </View>
  );
}

// the principle behind each step (website shams page p1–p10): listen, backchaining, chunking, hooks, dual coding,
// fading cues, reflection, linking
const PRINCIPLE = [1, 2, 3, 10, 4, 8, 7, 5];
function StepWhy({ step }: { step: number }) {
  const t = useTheme();
  const ts = useWebT("shams");
  const n = PRINCIPLE[step] ?? 6;
  return (
    <GoldCard star={false}>
      <Eyebrow style={{ marginBottom: 8 }}>{ts("why")}</Eyebrow>
      <Text style={{ fontFamily: FONT.bold, fontSize: 17, lineHeight: 23, color: t.ink }}>{ts(`p${n}t`)}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: 6 }}>{ts(`p${n}d`)}</Text>
      {n !== 6 ? (
        <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: t.line }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{ts("p6t")}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{ts("p6d")}</Text>
        </View>
      ) : null}
    </GoldCard>
  );
}

// every verse of the surah: learned (gold), the current one (marked), still ahead; long surahs as a bar
function SurahPath({ chapter, verses, idx, onPick, srsVersion }: { chapter: Chapter; verses: Verse[]; idx: number; onPick?: (i: number) => void; srsVersion: number }) {
  const t = useTheme();
  const lt = useLearnT();
  const srs = useMemo(() => readSrs(), [srsVersion, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const done = verses.filter((v) => srs[v.verse_key]).length;
  return (
    <GoldCard star={false}>
      <Eyebrow style={{ marginBottom: 6 }}>{chapter.name_simple}</Eyebrow>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{lt("verses", { done, total: verses.length })}</Text>
      {verses.length <= 60 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          {verses.map((v, i) => {
            const learnedV = !!srs[v.verse_key];
            const here = i === idx;
            return (
              <Pressable key={v.verse_key} disabled={!onPick || here} onPress={() => onPick?.(i)} accessibilityRole="button" accessibilityState={{ selected: here }}
                accessibilityLabel={`${v.verse_number}`} hitSlop={2}
                style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
                  backgroundColor: here ? t.accent : learnedV ? "rgba(201,166,94,0.22)" : "transparent", borderWidth: 1, borderColor: here ? t.accent : learnedV ? goldButton.line : t.line }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: here ? "#fff" : learnedV ? t.gold : t.muted }}>{v.verse_number}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={{ marginTop: 14, height: 10, borderRadius: 5, backgroundColor: t.line, overflow: "hidden" }}>
          <View style={{ width: `${Math.round((done / verses.length) * 100)}%`, height: "100%", backgroundColor: t.gold }} />
          <View style={{ position: "absolute", top: 0, bottom: 0, start: `${Math.round((idx / verses.length) * 100)}%`, width: 3, backgroundColor: t.accent }} />
        </View>
      )}
    </GoldCard>
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

function RateButton({ label, kind, onPress, tip }: { label: string; kind: Rating; onPress: () => void; tip?: boolean }) {
  const base = { flex: 1, height: 48, borderRadius: R.pill, alignItems: "center" as const, justifyContent: "center" as const };
  // the suggestion after the word check: a gold ring (the learner still decides)
  const ring = tip ? { borderWidth: 2, borderColor: stage.gold, borderRadius: R.pill, padding: 2, flex: 1 } : { flex: 1 };
  if (kind === "easy") {
    return <View style={ring}><GoldButton title={label} onPress={onPress} /></View>;
  }
  return (
    <View style={ring}>
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}
        style={({ pressed }) => [base, kind === "again"
          ? { borderWidth: 1, borderColor: "rgba(214,130,118,0.55)", backgroundColor: pressed ? "rgba(160,58,52,0.2)" : "rgba(160,58,52,0.1)" }
          : { backgroundColor: pressed ? "rgb(5,90,65)" : "rgb(6,108,78)" }]}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: kind === "again" ? "rgb(236,200,190)" : "#fff" }}>{label}</Text>
      </Pressable>
    </View>
  );
}
