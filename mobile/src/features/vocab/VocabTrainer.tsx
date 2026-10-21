import { VocabDecksEntry } from "../courses/Vocab";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, ScrollView, Switch, Text, View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GoldCard, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { api } from "@/lib/api";
import { FREE, usePro } from "@/lib/pro";
import { stripFootnotes, translationFor } from "@/lib/quran";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { AR_RIGHT, ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { today } from "@/web/learning";
import { localeMeta } from "@/web/locales";
import { award } from "@/web/points";
import { TILES } from "@/web/tiles";
import type { Deck, Word } from "@/web/vocab";
import { deckDesc, deckTitle, meaning, vocabFor } from "@/web/vocabI18n";
import {
  REVIEW_ROUND, canListen, deckStats, dueWords, findWordPosition, hasAudio, nextBox, options, readerPath, roundWords,
  wordClipUrl, type Boxes, type VerseWord, type VocabMode,
} from "@/web/vocabStudy";
import { Gate, Girih, MedalText, PracticeCelebrate, PracticeMedallion, PracticeStarNum, PracticeWindow, ROSE, roseA, solidGoldA } from "../coursekit/art";
import { tone, useClip } from "../coursekit/audio";
import { openWebsitePath } from "../coursekit/links";
import { GoldRing, StepIn, useNudge, useReduceMotion } from "../coursekit/motion";
import { useCourseT } from "../coursekit/strings";
import { BigButton, CourseHero, ProCard } from "../coursekit/ui";

// /vocab – the website's VocabTrainer.tsx: the most common Quran words as flashcards, quiz (Arabic → meaning),
// reverse quiz (meaning → Arabic) and listening quiz (hear the word → pick the Arabic), per deck or as "review due
// words" across all decks. Leitner boxes and round logic: web/vocabStudy.ts, meanings in every language:
// web/vocabI18n.ts (both synced from the website). The boxes are the website's "tf:vocab" (synced with the account).
// Word recordings: Quran.com word-by-word audio of the example verse; the word's position in that verse is found by
// matching it against the verse's words from the Quran API and cached on this device.
// Free: FREE.vocabPerDay different words a day (counted on this device), Pro: unlimited.
const KEY = "tf:vocab";
const POS_KEY = "qmc.vocab.pos"; // { wordId: position | 0 } – this device only
const AUTO_KEY = "qmc.vocab.auto";
const DAY_KEY = "qmc.vocab.day"; // app only: the words practised today, for the free daily limit
type Daily = { day: number; ids: string[] };
type Session = { id: string; title: string; words: Word[]; mode: VocabMode; review: boolean };
type VerseData = { words: VerseWord[]; translation: string };

const verseCache = new Map<string, Promise<VerseData>>();
function loadVerse(key: string, lang: string): Promise<VerseData> {
  const ck = `${key}|${lang}`;
  let p = verseCache.get(ck);
  if (!p) {
    p = (async () => {
      const tid = await translationFor(lang);
      type Raw = { verse: { words?: { position: number; text_uthmani: string; char_type_name: string }[]; translations?: { text: string }[] } };
      const d = await api<Raw>(`/api/q/verses/by_key/${key}?language=${lang}&words=true&word_fields=text_uthmani&translations=${tid}&fields=text_uthmani`);
      return {
        words: (d.verse.words ?? []).filter((w) => w.char_type_name === "word").map((w) => ({ position: w.position, text: w.text_uthmani })),
        // Arabic readers read the original: no translation (website rule)
        translation: lang === "ar" ? "" : stripFootnotes(String(d.verse.translations?.[0]?.text ?? "")),
      };
    })();
    p.catch(() => verseCache.delete(ck));
    verseCache.set(ck, p);
  }
  return p;
}

/** the example verse of a word and the word's position in it (position cached per word) */
function useVerse(word: Word | undefined, lang: string) {
  const [state, setState] = useState<{ id: string; data?: VerseData; pos: number | null; error?: boolean } | null>(null);
  useEffect(() => {
    if (!word?.ex) { setState(null); return; }
    let live = true;
    const cached = readJSON<Record<string, number>>(POS_KEY, {})[word.id];
    setState({ id: word.id, pos: cached === undefined ? null : cached || null });
    loadVerse(word.ex.key, lang).then((data) => {
      if (!live) return;
      const pos = hasAudio(word) ? findWordPosition(word, data.words) : null;
      const all = readJSON<Record<string, number>>(POS_KEY, {});
      if (all[word.id] !== (pos ?? 0)) writeJSON(POS_KEY, { ...all, [word.id]: pos ?? 0 }, true);
      setState({ id: word.id, data, pos });
    }).catch(() => { if (live) setState((s) => ({ id: word.id, pos: s?.pos ?? null, error: true })); });
    return () => { live = false; };
  }, [word, lang]);
  return state && state.id === word?.id ? state : null;
}

export function VocabPage() {
  const t = useTheme();
  const w = useWebT("vocab");
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }} keyboardShouldPersistTaps="handled">
        <CourseHero back word={TILES.vocab.ar} title={w("title")} lead={w("lead")} />
        <VocabDecksEntry />
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <VocabTrainer />
        </View>
      </ScrollView>
    </>
  );
}

function VocabTrainer() {
  const t = useTheme();
  const w = useWebT("vocab");
  const ct = useCourseT();
  const { lang } = useLang();
  const { pro } = usePro();
  const { width } = useWindowDimensions();
  const rtl = localeMeta(lang).dir === "rtl";
  const auto = useStored<boolean>(AUTO_KEY, false);
  const decks = useMemo(() => vocabFor(lang), [lang]);
  const allWords = useMemo(() => decks.flatMap((d) => d.words), [decks]);
  const boxes = useStored<Boxes>(KEY, {});
  const daily = useStored<Daily>(DAY_KEY, { day: 0, ids: [] });
  const day = today();
  const todayIds = daily.day === day ? daily.ids : [];
  const [session, setSession] = useState<Session | null>(null);
  const [queue, setQueue] = useState<Word[]>([]);
  const [flip, setFlip] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [score, setScore] = useState({ ok: 0, n: 0 });
  const clip = useClip();

  const mean = useCallback((x: Word) => meaning(x, lang), [lang]);
  const cur = queue[0];
  const verse = useVerse(cur, lang);
  const pos = verse?.pos ?? null;
  const mode = session?.mode ?? "cards";
  const answered = mode === "cards" ? flip : pick !== null;
  const play = useCallback((x: Word, p: number | null) => { if (x.ex && p) clip.play(wordClipUrl(x.ex.key, p)); }, [clip]);

  // listening quiz: play each new word as soon as its position is known; a word without a recording is skipped
  // flashcards and quiz with "play automatically": play the word when it is shown
  useEffect(() => {
    if (!cur || !verse || blocked(cur)) return;
    if (mode === "listen") {
      if (verse.pos) play(cur, verse.pos);
      else if (verse.data || verse.error) setQueue((q) => (q[0]?.id === cur.id ? q.slice(1) : q));
    } else if (auto && verse.pos && mode !== "reverse") play(cur, verse.pos);
  }, [cur?.id, verse?.pos, verse?.data, verse?.error, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cur || !session || mode === "cards") return;
    setOpts(mode === "quiz" ? options(cur, session.words, allWords, mean) : options(cur, session.words, allWords, (x) => x.ar, mode === "listen" ? hasAudio : undefined));
    setPick(null);
  }, [cur?.id, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const right = cur ? (mode === "quiz" ? mean(cur) : cur.ar) : "";

  const begin = (s: Session) => {
    const d = today();
    const words = s.review ? roundWords(dueWords(decks, boxes, d), boxes, d, s.mode, REVIEW_ROUND) : roundWords(s.words, boxes, d, s.mode);
    clip.stop();
    setSession(s); setQueue(words); setFlip(false); setPick(null); setScore({ ok: 0, n: 0 });
  };
  const beginDeck = (d: Deck, m: VocabMode) => begin({ id: d.id, title: deckTitle(d, lang), words: d.words, mode: m, review: false });
  const beginReview = (m: VocabMode) => begin({ id: "review", title: w("review"), words: dueWords(decks, boxes, today()), mode: m, review: true });
  const leave = () => { clip.stop(); setSession(null); };

  const grade = (ok: boolean) => {
    if (!cur) return;
    writeJSON(KEY, nextBox(boxes, cur.id, ok, today())); award("vocab");
    if (!todayIds.includes(cur.id)) writeJSON(DAY_KEY, { day: today(), ids: [...todayIds, cur.id] }, true);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), cur])); // missed words come back at the end
    setFlip(false); setPick(null); // pick must reset here: a missed last word comes back as the same card and the options effect does not re-run
  };

  const stats = decks.map((d) => deckStats(d, boxes, day));
  const totalKnown = stats.reduce((n, s) => n + s.known, 0);
  const total = stats.reduce((n, s) => n + s.total, 0);
  const due = dueWords(decks, boxes, day);
  const practised = Object.keys(boxes).length;
  const freeLeft = Math.max(0, FREE.vocabPerDay - todayIds.length);
  function blocked(x: Word) { return !pro && !todayIds.includes(x.id) && todayIds.length >= FREE.vocabPerDay; }

  const modeButtons = (words: Word[], onStart: (m: VocabMode) => void) => (
    <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
      <BigButton title={w("cards")} height={40} radius={R.pill} onPress={() => onStart("cards")} />
      <BigButton variant="outline" title={w("quiz")} height={40} radius={R.pill} onPress={() => onStart("quiz")} />
      <BigButton variant="outline" title={w("reverse")} height={40} radius={R.pill} onPress={() => onStart("reverse")} />
      {canListen(words) ? <BigButton variant="outline" icon="speaker" title={w("listen")} height={40} radius={R.pill} onPress={() => onStart("listen")} /> : null}
    </View>
  );

  const noClip = !cur || !hasAudio(cur) || (!!verse && !verse.pos && (!!verse.data || !!verse.error));
  const playButton = (light?: boolean) => noClip ? null : (
    <Pressable onPress={() => cur && play(cur, pos)} disabled={!pos} accessibilityRole="button" accessibilityLabel={w("play")} hitSlop={6}
      style={({ pressed }) => ({ marginTop: 16, alignSelf: "center", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, borderRadius: R.pill, opacity: pos ? 1 : 0.5,
        borderWidth: clip.state === "playing" ? 2 : 1, borderColor: light ? "rgba(201,166,94,0.6)" : clip.state === "playing" ? "rgb(201,166,94)" : t.line,
        backgroundColor: light ? (pressed ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)") : pressed ? solidGoldA(0.08) : "transparent" })}>
      <Icon name="speaker" size={20} color={light ? "#f3e2b6" : t.ink} />
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: light ? "#f3e2b6" : t.ink }}>{clip.state === "error" ? w("noAudio") : w("play")}</Text>
    </Pressable>
  );

  if (session) {
    const pct = score.n ? score.ok / score.n : 0;
    const ask = mode === "quiz" ? w("askMeaning") : mode === "reverse" ? w("askArabic") : mode === "listen" ? w("askHeard") : null;
    const arOpt = 26;
    return (
      <View style={{ marginTop: 16 }}>
        <Pressable onPress={leave} accessibilityRole="button" hitSlop={8} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <Icon name={rtl ? "chevronRight" : "chevronLeft"} size={16} color={t.muted} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("decks")}</Text>
        </Pressable>
        <Text accessibilityRole="header" style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 30, lineHeight: rtl ? 44 : 34, letterSpacing: rtl ? 0 : -0.7, color: t.ink, textAlign: "left" }}>{session.title}</Text>
        {!cur ? (
          <GoldCard style={{ marginTop: 24, padding: 24, paddingTop: 32, alignItems: "center", overflow: "hidden" }}>
            {pct >= 0.7 ? <PracticeCelebrate /> : null}
            {score.n ? (
              <>
                <PracticeMedallion pct={pct} size={132} turn={pct >= 0.7} enter>
                  <MedalText size={26} small={`/${score.n}`}>{score.ok}</MedalText>
                </PracticeMedallion>
                <Text style={{ marginTop: 16, fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "center" }}>{w("roundDone", { ok: score.ok, n: score.n })}</Text>
              </>
            ) : <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "center" }}>{w("allDone")}</Text>}
            <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              {!session.review || dueWords(decks, boxes, today()).length > 0
                ? <BigButton title={w("again")} height={44} radius={R.pill} style={{ minWidth: 140 }} onPress={() => begin(session)} /> : null}
              <BigButton variant="outline" title={w("decks")} height={44} radius={R.pill} style={{ minWidth: 140 }} onPress={leave} />
            </View>
          </GoldCard>
        ) : blocked(cur) ? (
          <View style={{ marginTop: 24, gap: 12 }}>
            <ProCard feature="vocab" title={ct("vocabLimitTitle", { n: FREE.vocabPerDay })} text={ct("vocabLimitText", { n: FREE.vocabPerDay })} />
            <BigButton variant="outline" title={w("decks")} height={44} radius={R.pill} onPress={leave} />
          </View>
        ) : (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{w("left", { n: queue.length })}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, fontVariant: ["tabular-nums"] }}>{`${score.ok} / ${score.n}`}</Text>
            </View>
            {mode === "cards" || mode === "quiz" ? (
              <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Switch value={auto} onValueChange={(v) => writeJSON(AUTO_KEY, v, true)} trackColor={{ true: "rgb(201,166,94)", false: t.line }} accessibilityLabel={w("autoplay")} />
                <Text style={{ flex: 1, fontFamily: FONT.medium, fontSize: 14, color: t.muted, textAlign: "left" }}>{w("autoplay")}</Text>
              </View>
            ) : null}
            {ask ? <Text style={{ marginTop: 14, fontFamily: FONT.semibold, fontSize: 15, color: t.muted, textAlign: "center" }}>{ask}</Text> : null}
            <FlipCard flipped={mode === "cards" && flip} wordKey={`${cur.id}-${score.n}`}
              front={(
                <View style={{ alignItems: "center" }}>
                  {mode === "reverse" ? (
                    <Text style={{ fontFamily: FONT.display, fontSize: 26, lineHeight: rtl ? 42 : 32, color: "#f6e7bf", textAlign: "center" }}>{mean(cur)}</Text>
                  ) : mode === "listen" && pick === null ? (
                    <Pressable onPress={() => play(cur, pos)} disabled={!pos} accessibilityRole="button" accessibilityLabel={w("play")}
                      style={({ pressed }) => ({ width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center", opacity: pos ? 1 : 0.5,
                        borderWidth: clip.state === "playing" ? 3 : 1, borderColor: "rgba(201,166,94,0.6)", backgroundColor: pressed ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)" })}>
                      <Icon name="speaker" size={40} color="#f6e7bf" />
                    </Pressable>
                  ) : (
                    <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 54, lineHeight: 94, color: "#f6e7bf", textAlign: "center", writingDirection: "rtl", textShadowColor: "rgba(233,207,153,0.3)", textShadowRadius: 22 }}>{cur.ar}</Text>
                  )}
                  {mode !== "cards" && pick !== null ? (
                    mode === "quiz"
                      ? <Text style={{ marginTop: 4, fontFamily: FONT.italic, fontSize: 15, color: "rgb(233,207,153)" }}>{cur.tr}</Text>
                      : (
                        <View style={{ marginTop: 6, alignItems: "center" }}>
                          {mode === "listen" ? <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 40, lineHeight: 70, color: "#f6e7bf", textAlign: "center", writingDirection: "rtl" }}>{cur.ar}</Text> : null}
                          <Text style={{ fontFamily: FONT.italic, fontSize: 15, color: "rgb(233,207,153)", textAlign: "center" }}>{mode === "listen" ? `${cur.tr} · ${mean(cur)}` : cur.tr}</Text>
                        </View>
                      )
                  ) : null}
                  {mode === "cards" || mode === "quiz" ? playButton(true) : null}
                </View>
              )}
              back={mode === "cards" ? (
                <View style={{ alignItems: "center" }}>
                  <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 60, color: t.gold, textAlign: "center", writingDirection: "rtl" }}>{cur.ar}</Text>
                  <Text style={{ fontFamily: FONT.italic, fontSize: 15, color: t.gold, textAlign: "center" }}>{`${cur.tr}${cur.root ? ` · ${w("root")}: ${cur.root}` : ""}`}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 24, lineHeight: rtl ? 38 : 29, color: t.ink, textAlign: "center" }}>{mean(cur)}</Text>
                  {playButton()}
                </View>
              ) : null} />
            {mode === "cards" && !flip ? (
              <View style={{ marginTop: 20, alignItems: "center" }}>
                <BigButton title={w("show")} height={48} radius={R.pill} style={{ minWidth: 200 }} onPress={() => setFlip(true)} />
              </View>
            ) : null}
            {mode === "cards" && flip ? (
              <StepIn distance={6} style={{ marginTop: 20, flexDirection: "row", gap: 12 }}>
                <Pressable onPress={() => grade(false)} accessibilityRole="button" accessibilityLabel={w("notYet")}
                  style={({ pressed }) => ({ flex: 1, height: 48, borderRadius: R.pill, borderWidth: 2, borderColor: roseA(0.4), alignItems: "center", justifyContent: "center", backgroundColor: pressed ? roseA(0.06) : "transparent" })}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: ROSE }}>{w("notYet")}</Text>
                </Pressable>
                <BigButton title={w("knew")} height={48} radius={R.pill} style={{ flex: 1 }} onPress={() => grade(true)} />
              </StepIn>
            ) : null}
            {mode !== "cards" ? (
              <View style={{ marginTop: 20, gap: 10, flexDirection: mode === "quiz" ? "column" : "row", flexWrap: "wrap" }}>
                {opts.map((o, n) => {
                  const ok = o === right;
                  const state = pick === null ? "idle" : ok ? "right" : n === pick ? "wrong" : "dim";
                  return (
                    <View key={`${cur.id}-${score.n}-${n}`} style={mode === "quiz" ? undefined : { width: "48%", flexGrow: 1 }}>
                      <QuizOption label={o} arabic={mode !== "quiz"} arabicSize={arOpt} state={state} disabled={pick !== null} onPress={() => { setPick(n); tone(ok); }} />
                    </View>
                  );
                })}
              </View>
            ) : null}
            {answered && cur.ex ? <VerseBlock word={cur} verse={verse} lang={lang} /> : null}
            {mode !== "cards" && pick !== null ? (
              <StepIn distance={6} style={{ marginTop: 12 }}>
                <BigButton title={w("next")} variant={opts[pick] === right ? "gold" : "ink"} height={48} radius={R.pill} onPress={() => grade(opts[pick] === right)} />
              </StepIn>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  const twoCols = width >= 420;
  const rows: Deck[][] = [];
  decks.forEach((d, i) => { if (!twoCols || i % 2 === 0) rows.push([]); rows[rows.length - 1].push(d); });
  return (
    <View>
      {/* review across all decks: first, with the number of words due today */}
      <GoldCard style={{ marginTop: 16, padding: 20, paddingTop: 24, alignItems: "center" }}>
        {due.length > 0 ? (
          <>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: rtl ? 0 : 1.4, textTransform: rtl ? "none" : "uppercase", color: t.gold, textAlign: "center" }}>{w("dueCount", { n: due.length })}</Text>
            <Text style={{ marginTop: 4, fontFamily: FONT.bold, fontSize: 20, lineHeight: rtl ? 32 : 26, color: t.ink, textAlign: "center" }}>{w("review")}</Text>
            <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, lineHeight: rtl ? 24 : 20, color: t.muted, textAlign: "center" }}>{w("reviewLead")}</Text>
            {modeButtons(due, beginReview)}
          </>
        ) : (
          <>
            <Icon name="checkCircle" size={36} color={t.gold} />
            <Text style={{ marginTop: 8, fontFamily: FONT.bold, fontSize: 20, lineHeight: rtl ? 32 : 26, color: t.ink, textAlign: "center" }}>{practised ? w("allDone") : w("nothingYet")}</Text>
            <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, lineHeight: rtl ? 24 : 20, color: t.muted, textAlign: "center" }}>{practised ? w("allDoneLead") : w("nothingYetLead")}</Text>
          </>
        )}
      </GoldCard>
      <GoldCard style={{ marginTop: 16, padding: 20, paddingTop: 24 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <PracticeMedallion pct={total ? totalKnown / total : 0} size={96}>
            <MedalText size={17}>{`${total ? Math.round((totalKnown / total) * 100) : 0}%`}</MedalText>
          </PracticeMedallion>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: rtl ? 26 : 22, color: t.ink, textAlign: "left" }}>{w("known", { n: totalKnown, total })}</Text>
            {!pro ? <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, textAlign: "left" }}>{ct("vocabLeft", { n: freeLeft, total: FREE.vocabPerDay })}</Text> : null}
          </View>
        </View>
        <HowBoxes title={w("howTitle")} text={w("howText")} />
      </GoldCard>
      <View style={{ marginTop: 24, gap: 16 }}>
        {rows.map((r, ri) => (
          <View key={ri} style={{ flexDirection: "row", gap: 16 }}>
            {r.map((d) => {
              const i = decks.indexOf(d);
              const s = stats[i], all = s.known === s.total;
              return (
                <View key={d.id} style={{ flex: 1, minWidth: 0 }}>
                  <Gate done={all} style={{ flex: 1 }}>
                    <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}>
                      <PracticeStarNum n={all ? "✓" : i + 1} size={34} filled={all} />
                      <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ marginTop: 4, fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 58, color: t.gold, writingDirection: "rtl" }}>{d.words[0]?.ar}</Text>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: rtl ? 0 : 1.4, textTransform: rtl ? "none" : "uppercase", color: t.gold }}>{w("deck", { n: i + 1 })}</Text>
                      <Text style={{ marginTop: 6, fontFamily: FONT.bold, fontSize: 17, lineHeight: rtl ? 28 : 22, color: t.ink, textAlign: "center" }}>{deckTitle(d, lang)}</Text>
                      <Text style={{ marginTop: 4, flexGrow: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: t.muted, textAlign: "center" }}>{deckDesc(d, lang)}</Text>
                      <View style={{ marginTop: 12, height: 6, width: "100%", maxWidth: 160, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
                        <LinearGradient colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: `${(s.known / s.total) * 100}%` }} />
                      </View>
                      <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "center" }}>
                        {w("deckKnown", { k: s.known, n: s.total })}
                        {s.due > 0 ? <Text style={{ fontFamily: FONT.semibold, color: t.gold }}>{` · ${w("dueCount", { n: s.due })}`}</Text> : null}
                      </Text>
                      {modeButtons(d.words, (m) => beginDeck(d, m))}
                    </View>
                  </Gate>
                </View>
              );
            })}
            {twoCols && r.length === 1 ? <View style={{ flex: 1 }} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/** "How the boxes work": a short note that opens on tap */
function HowBoxes({ title, text }: { title: string; text: string }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginTop: 14 }}>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} hitSlop={6} style={{ minHeight: 36, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{title}</Text>
        <View style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}><Icon name="chevronDown" size={14} color={t.accent} /></View>
      </Pressable>
      {open ? <Text style={{ marginTop: 4, fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "left" }}>{text}</Text> : null}
    </View>
  );
}

/** the example verse from the Quran API with the word highlighted, its translation and a link into the reader */
function VerseBlock({ word, verse, lang }: { word: Word; verse: ReturnType<typeof useVerse>; lang: string }) {
  const t = useTheme();
  const w = useWebT("vocab");
  if (!word.ex) return null;
  const key = word.ex.key;
  return (
    <StepIn distance={6} style={{ marginTop: 16 }}>
      <GoldCard style={{ padding: 16, alignItems: "stretch" }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold, textAlign: "center" }}>{`${w("inVerse")} · ${key}`}</Text>
        {verse?.data ? (
          <>
            <Text allowFontScaling={false} style={{ marginTop: 8, fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 48, color: t.ink, textAlign: AR_RIGHT, writingDirection: "rtl" }}>
              {verse.data.words.map((x, i) => (
                <Text key={x.position} style={x.position === verse.pos ? { color: t.gold, backgroundColor: solidGoldA(0.2) } : undefined}>{`${i ? " " : ""}${x.text}`}</Text>
              ))}
            </Text>
            {lang !== "ar" && verse.data.translation ? <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, textAlign: "left" }}>{verse.data.translation}</Text> : null}
          </>
        ) : verse?.error ? (
          <Text style={{ marginTop: 8, fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "center" }}>{w("verseError")}</Text>
        ) : (
          <View style={{ marginTop: 10, height: 32, borderRadius: 8, backgroundColor: t.line, opacity: 0.6 }} />
        )}
        <Pressable onPress={() => openWebsitePath(readerPath(key))} accessibilityRole="link" hitSlop={6} style={{ marginTop: 10, minHeight: 40, alignSelf: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.accent }}>{w("openReader")}</Text>
        </Pressable>
      </GoldCard>
    </StepIn>
  );
}

/** flash card that turns over (pa-flip): front = the word in an arch of light, back = meaning, root and verse */
function FlipCard({ flipped, front, back, wordKey }: { flipped: boolean; front: ReactNode; back: ReactNode; wordKey: string }) {
  const reduce = useReduceMotion();
  const v = useRef(new Animated.Value(flipped ? 1 : 0)).current;
  const swap = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    // turning over animates; turning back for the next word happens at once, so the next meaning is never shown
    if (!flipped || reduce) { v.setValue(flipped ? 1 : 0); return; }
    Animated.timing(v, { toValue: 1, duration: 700, easing: Easing.bezier(0.3, 0.7, 0.2, 1), useNativeDriver: true }).start();
  }, [flipped, reduce, v]);
  useEffect(() => {
    if (reduce) return;
    swap.setValue(0);
    Animated.timing(swap, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [wordKey, reduce, swap]);
  const face = { backfaceVisibility: "hidden" as const };
  const behind = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
  return (
    <View style={{ marginTop: 12, minHeight: 300 }}>
      <Animated.View pointerEvents={flipped ? "none" : "auto"} style={[face, {
        opacity: v.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [1, 1, 0, 0] }),
        transform: [{ perspective: 1400 }, { rotateY: v.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] }) }],
      }]}>
        <Stage rounded={R.md} hairlines={false} pattern={false} style={{ flex: 1, minHeight: 300, borderWidth: 1, borderColor: "rgba(214,180,108,0.35)" }}>
          <Girih />
          <View pointerEvents="none" style={{ position: "absolute", top: 12, bottom: 12, left: 0, right: 0, alignItems: "center" }}><PracticeWindow height={276} opacity={0.35} /></View>
          <Animated.View style={{ flex: 1, minHeight: 300, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, paddingVertical: 40,
            opacity: swap.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }), transform: [{ scale: swap.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}>
            {front}
          </Animated.View>
        </Stage>
      </Animated.View>
      {back ? (
        <Animated.View pointerEvents={flipped ? "auto" : "none"} style={[face, behind, {
          opacity: v.interpolate({ inputRange: [0, 0.5, 0.501, 1], outputRange: [0, 0, 1, 1] }),
          transform: [{ perspective: 1400 }, { rotateY: v.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] }) }],
        }]}>
          <GoldCard style={{ flex: 1, minHeight: 300, alignItems: "center", justifyContent: "center", padding: 24 }}>{back}</GoldCard>
        </Animated.View>
      ) : null}
    </View>
  );
}

function QuizOption({ label, state, onPress, disabled, arabic, arabicSize = 26 }: { label: string; state: "idle" | "right" | "wrong" | "dim"; onPress: () => void; disabled: boolean; arabic?: boolean; arabicSize?: number }) {
  const t = useTheme();
  const nudge = useNudge();
  useEffect(() => { if (state === "wrong") nudge.run(); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={nudge.style}>
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
        style={{ borderRadius: R.sm, borderWidth: 2, padding: arabic ? 8 : 14, opacity: state === "dim" ? 0.6 : 1, alignItems: "center",
          borderColor: state === "right" ? "rgb(201,166,94)" : state === "wrong" ? ROSE : t.line,
          backgroundColor: state === "right" ? solidGoldA(0.15) : state === "wrong" ? roseA(0.1) : t.surface }}>
        {arabic
          ? <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: arabicSize, lineHeight: Math.round(arabicSize * 1.75), color: t.ink, textAlign: "center", writingDirection: "rtl" }}>{label}</Text>
          : <Text style={{ fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21, color: t.ink, textAlign: "center" }}>{label}</Text>}
        <GoldRing on={state === "right"} radius={R.sm} />
      </Pressable>
    </Animated.View>
  );
}
