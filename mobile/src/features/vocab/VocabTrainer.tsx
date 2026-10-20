import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { GoldCard, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FREE, usePro } from "@/lib/pro";
import { useStored, writeJSON } from "@/lib/store";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { today } from "@/web/learning";
import { award } from "@/web/points";
import { TILES } from "@/web/tiles";
import { vocabFor, type Deck, type Word } from "@/web/vocab";
import { Gate, Girih, MedalText, PracticeCelebrate, PracticeMedallion, PracticeStarNum, PracticeWindow, ROSE, roseA, solidGoldA } from "../coursekit/art";
import { tone } from "../coursekit/audio";
import { openVerse } from "../coursekit/links";
import { GoldRing, StepIn, useNudge, useReduceMotion } from "../coursekit/motion";
import { useCourseT } from "../coursekit/strings";
import { BigButton, CourseHero, ProCard } from "../coursekit/ui";

// /vocab – VocabTrainer.tsx: the most common Quran words as flashcards and quizzes. Leitner boxes: a known word moves
// up a box and comes back later (1, 2, 4, 8, 16 days); the boxes are the website's "tf:vocab" (synced with the
// account). Free: FREE.vocabPerDay different words a day (counted on this device), Pro: unlimited.
type Box = Record<string, { box: number; due: number }>;
const KEY = "tf:vocab";
const GAP = [0, 1, 2, 4, 8, 16];
const DAY_KEY = "qmc.vocab.day"; // app only: the words practised today, for the free daily limit
type Daily = { day: number; ids: string[] };
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export function VocabPage() {
  const t = useTheme();
  const w = useWebT("vocab");
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }} keyboardShouldPersistTaps="handled">
        <CourseHero back word={TILES.vocab.ar} title={w("title")} lead={w("lead")} />
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
  const de = lang === "de";
  const VOCAB_DECKS = useMemo(() => vocabFor(lang), [lang]);
  const boxes = useStored<Box>(KEY, {});
  const daily = useStored<Daily>(DAY_KEY, { day: 0, ids: [] });
  const todayIds = daily.day === today() ? daily.ids : [];
  const [deck, setDeck] = useState<Deck | null>(null);
  const [mode, setMode] = useState<"cards" | "quiz">("cards");
  const [queue, setQueue] = useState<Word[]>([]);
  const [flip, setFlip] = useState(false);
  const [pick, setPick] = useState<number | null>(null);
  const [opts, setOpts] = useState<string[]>([]);
  const [score, setScore] = useState({ ok: 0, n: 0 });

  const mean = (x: Word) => (de ? x.de : x.en);
  const known = (d: Deck) => d.words.filter((x) => (boxes[x.id]?.box ?? 0) >= 3).length;
  const dueIn = (d: Deck) => d.words.filter((x) => !boxes[x.id] || boxes[x.id].due <= today());

  const begin = (d: Deck, m: "cards" | "quiz") => {
    const due = dueIn(d);
    setDeck(d); setMode(m); setQueue(shuffle(due.length ? due : d.words).slice(0, 15)); setFlip(false); setPick(null); setScore({ ok: 0, n: 0 });
  };
  const cur = queue[0];
  useEffect(() => {
    if (!cur || !deck || mode !== "quiz") return;
    const all = VOCAB_DECKS.flatMap((d) => d.words).filter((x) => x.id !== cur.id).map(mean).filter((m) => m !== mean(cur));
    setOpts(shuffle([mean(cur), ...shuffle(Array.from(new Set(all))).slice(0, 3)]));
    setPick(null);
  }, [cur?.id, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const grade = (ok: boolean) => {
    if (!cur) return;
    const b = boxes[cur.id]?.box ?? 0;
    const nb = ok ? Math.min(5, b + 1) : 1;
    const next = { ...boxes, [cur.id]: { box: nb, due: today() + GAP[nb] } };
    writeJSON(KEY, next); award("vocab");
    if (!todayIds.includes(cur.id)) writeJSON(DAY_KEY, { day: today(), ids: [...todayIds, cur.id] }, true);
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), n: s.n + 1 }));
    setQueue((q) => (ok ? q.slice(1) : [...q.slice(1), cur])); // missed words come back at the end
    setFlip(false); setPick(null); // pick must reset here: a missed last word comes back as the same card and the options effect does not re-run
  };

  const totalKnown = VOCAB_DECKS.reduce((n, d) => n + known(d), 0);
  const total = VOCAB_DECKS.reduce((n, d) => n + d.words.length, 0);
  const freeLeft = Math.max(0, FREE.vocabPerDay - todayIds.length);
  const blocked = (x: Word) => !pro && !todayIds.includes(x.id) && todayIds.length >= FREE.vocabPerDay;

  if (deck) {
    const pct = score.n ? score.ok / score.n : 0;
    return (
      <View style={{ marginTop: 16 }}>
        <Pressable onPress={() => setDeck(null)} accessibilityRole="button" hitSlop={8} style={{ minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" }}>
          <Icon name="chevronLeft" size={16} color={t.muted} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("decks")}</Text>
        </Pressable>
        <Text accessibilityRole="header" style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.7, color: t.ink }}>{de ? deck.title_de : deck.title_en}</Text>
        {!cur ? (
          <GoldCard style={{ marginTop: 24, padding: 24, paddingTop: 32, alignItems: "center", overflow: "hidden" }}>
            {pct >= 0.7 ? <PracticeCelebrate /> : null}
            <PracticeMedallion pct={pct} size={132} turn={pct >= 0.7} enter>
              <MedalText size={26} small={`/${score.n}`}>{score.ok}</MedalText>
            </PracticeMedallion>
            <Text style={{ marginTop: 16, fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "center" }}>{w("roundDone", { ok: score.ok, n: score.n })}</Text>
            <View style={{ marginTop: 20, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
              <BigButton title={w("again")} height={44} radius={R.pill} style={{ minWidth: 140 }} onPress={() => begin(deck, mode)} />
              <BigButton variant="outline" title={w("decks")} height={44} radius={R.pill} style={{ minWidth: 140 }} onPress={() => setDeck(null)} />
            </View>
          </GoldCard>
        ) : blocked(cur) ? (
          <View style={{ marginTop: 24, gap: 12 }}>
            <ProCard feature="vocab" title={ct("vocabLimitTitle", { n: FREE.vocabPerDay })} text={ct("vocabLimitText", { n: FREE.vocabPerDay })} />
            <BigButton variant="outline" title={w("decks")} height={44} radius={R.pill} onPress={() => setDeck(null)} />
          </View>
        ) : (
          <View style={{ marginTop: 24 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{w("left", { n: queue.length })}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, fontVariant: ["tabular-nums"] }}>{`${score.ok} / ${score.n}`}</Text>
            </View>
            <FlipCard flipped={mode === "cards" && flip} wordKey={`${cur.id}-${score.n}`}
              front={(
                <View style={{ alignItems: "center" }}>
                  <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 54, lineHeight: 94, color: "#f6e7bf", textAlign: "center", writingDirection: "rtl", textShadowColor: "rgba(233,207,153,0.3)", textShadowRadius: 22 }}>{cur.ar}</Text>
                  {mode === "quiz" && pick !== null ? <Text style={{ marginTop: 4, fontFamily: FONT.italic, fontSize: 15, color: "rgb(233,207,153)" }}>{cur.tr}</Text> : null}
                </View>
              )}
              back={mode === "cards" ? (
                <View style={{ alignItems: "center" }}>
                  <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 60, color: t.gold, textAlign: "center", writingDirection: "rtl" }}>{cur.ar}</Text>
                  <Text style={{ fontFamily: FONT.italic, fontSize: 15, color: t.gold, textAlign: "center" }}>{`${cur.tr}${cur.root ? ` · ${w("root")}: ${cur.root}` : ""}`}</Text>
                  <Text style={{ marginTop: 8, fontFamily: FONT.display, fontSize: 24, lineHeight: 29, color: t.ink, textAlign: "center" }}>{mean(cur)}</Text>
                  {cur.ex ? <VerseLink ex={cur.ex} /> : null}
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
            {mode === "quiz" ? (
              <View style={{ marginTop: 20, gap: 10 }}>
                {opts.map((o, n) => {
                  const right = o === mean(cur);
                  const state = pick === null ? "idle" : right ? "right" : n === pick ? "wrong" : "dim";
                  return <QuizOption key={`${cur.id}-${score.n}-${n}`} label={o} state={state} disabled={pick !== null} onPress={() => { setPick(n); tone(right); }} />;
                })}
                {pick !== null ? (
                  <StepIn distance={6} style={{ marginTop: 4, alignItems: "center" }}>
                    {cur.ex ? <VerseLink ex={cur.ex} /> : null}
                    <BigButton title={w("next")} variant={opts[pick] === mean(cur) ? "gold" : "ink"} height={48} radius={R.pill} style={{ marginTop: 12, alignSelf: "stretch" }}
                      onPress={() => grade(opts[pick] === mean(cur))} />
                  </StepIn>
                ) : null}
              </View>
            ) : null}
          </View>
        )}
      </View>
    );
  }

  const twoCols = width >= 420;
  const rows: Deck[][] = [];
  VOCAB_DECKS.forEach((d, i) => { if (!twoCols || i % 2 === 0) rows.push([]); rows[rows.length - 1].push(d); });
  return (
    <View>
      <GoldCard style={{ marginTop: 16, padding: 20, paddingTop: 24, flexDirection: "row", alignItems: "center", gap: 20 }}>
        <PracticeMedallion pct={total ? totalKnown / total : 0} size={96}>
          <MedalText size={17}>{`${total ? Math.round((totalKnown / total) * 100) : 0}%`}</MedalText>
        </PracticeMedallion>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 16, lineHeight: 22, color: t.ink }}>{w("known", { n: totalKnown, total })}</Text>
          {!pro ? <Text style={{ marginTop: 6, fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{ct("vocabLeft", { n: freeLeft, total: FREE.vocabPerDay })}</Text> : null}
        </View>
      </GoldCard>
      <View style={{ marginTop: 24, gap: 16 }}>
        {rows.map((r, ri) => (
          <View key={ri} style={{ flexDirection: "row", gap: 16 }}>
            {r.map((d) => {
              const i = VOCAB_DECKS.indexOf(d);
              const k = known(d), all = k === d.words.length;
              return (
                <View key={d.id} style={{ flex: 1, minWidth: 0 }}>
                  <Gate done={all} style={{ flex: 1 }}>
                    <View style={{ flex: 1, alignItems: "center", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 }}>
                      <PracticeStarNum n={all ? "✓" : i + 1} size={34} filled={all} />
                      <Text allowFontScaling={false} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6} style={{ marginTop: 4, fontFamily: ARABIC_FONT, fontSize: 34, lineHeight: 58, color: t.gold, writingDirection: "rtl" }}>{d.words[0]?.ar}</Text>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", color: t.gold }}>{`${w("deck", { n: i + 1 })} · ${k}/${d.words.length}`}</Text>
                      <Text style={{ marginTop: 6, fontFamily: FONT.bold, fontSize: 17, lineHeight: 22, color: t.ink, textAlign: "center" }}>{de ? d.title_de : d.title_en}</Text>
                      <Text style={{ marginTop: 4, flexGrow: 1, fontFamily: FONT.regular, fontSize: 14, lineHeight: 22, color: t.muted, textAlign: "center" }}>{de ? d.desc_de : d.desc_en}</Text>
                      <View style={{ marginTop: 12, height: 6, width: "100%", maxWidth: 160, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
                        <LinearGradient colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: `${(k / d.words.length) * 100}%` }} />
                      </View>
                      <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
                        <BigButton title={w("cards")} height={40} radius={R.pill} onPress={() => begin(d, "cards")} />
                        <BigButton variant="outline" title={w("quiz")} height={40} radius={R.pill} onPress={() => begin(d, "quiz")} />
                      </View>
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

function VerseLink({ ex }: { ex: { key: string; ar: string } }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => openVerse(ex.key)} accessibilityRole="link" accessibilityLabel={ex.key}
      style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 18, lineHeight: 34, color: t.accent, writingDirection: "rtl" }}>{ex.ar}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.accent }}>{`· ${ex.key}`}</Text>
    </Pressable>
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

function QuizOption({ label, state, onPress, disabled }: { label: string; state: "idle" | "right" | "wrong" | "dim"; onPress: () => void; disabled: boolean }) {
  const t = useTheme();
  const nudge = useNudge();
  useEffect(() => { if (state === "wrong") nudge.run(); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={nudge.style}>
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
        style={{ borderRadius: R.sm, borderWidth: 2, padding: 14, opacity: state === "dim" ? 0.6 : 1, alignItems: "center",
          borderColor: state === "right" ? "rgb(201,166,94)" : state === "wrong" ? ROSE : t.line,
          backgroundColor: state === "right" ? solidGoldA(0.15) : state === "wrong" ? roseA(0.1) : t.surface }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, lineHeight: 21, color: t.ink, textAlign: "center" }}>{label}</Text>
        <GoldRing on={state === "right"} radius={R.sm} />
      </Pressable>
    </Animated.View>
  );
}
