import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARABIC_FONT, FONT, R, useTheme, AR_RIGHT } from "@/lib/theme";
import { Display, GoldButton, GoldCard, GoldProgress, OutlineButton } from "@/components/brand";
import { ErrorState, Loading, PageHero, ProGate } from "@/components/page";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { FREE, usePro } from "@/lib/pro";
import { RECITERS, getChapter, getVerses, type Chapter, type Verse } from "@/lib/quran";
import { PASS, PATH, levelOf, questionsFor, readProgress, saveResult, secondsPerQuestion } from "@/web/academy";
import { noteMistake } from "@/web/learning";
import { ageProfile } from "@/web/age";
import { buildQuiz, type Q } from "@/features/academy/quiz";
import { useVerseAudio } from "@/features/quran/useVerseAudio";
import { GoldRing, StarBadge } from "@/features/today/art";
import { useShamsT } from "@/features/shams/texts";
import { goBack } from "@/components/page";

// One academy lesson (website LessonRunner.tsx): learn the verses with the Shams Method, then a test on time with four
// kinds of questions; 70 % passes, mistakes make the verse come back sooner.
export default function Lesson() {
  const { s: sp, from: fp } = useLocalSearchParams<{ s: string; from: string }>();
  const s = Math.max(1, Math.min(114, Number(sp) || 1));
  const from = Math.max(1, Number(fp) || 1);
  const { lang } = useLang();
  const { pro } = usePro();
  const st = useShamsT();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [verses, setVerses] = useState<Verse[] | null>(null);
  const [failed, setFailed] = useState(false);
  const load = useCallback(() => {
    setFailed(false);
    Promise.all([getChapter(s, lang), getVerses(s, lang, RECITERS[0])]).then(([c, v]) => { setChapter(c); setVerses(v); }).catch(() => setFailed(true));
  }, [s, lang]);
  useEffect(load, [load]);
  if (!pro && !FREE.shamsSurah(s)) return (<><Stack.Screen options={{ headerShown: false }} /><PageHero back topInset title={chapter?.name_simple ?? ""} arcade={false} /><ProGate feature="academy" title={st("lockedTitle")} text={st("lockedText")} /></>);
  if (failed) return <ErrorState retry={load} />;
  if (!verses || !chapter) return <Loading />;
  return <Runner chapter={chapter} verses={verses} from={from} />;
}

function Runner({ chapter, verses, from }: { chapter: Chapter; verses: Verse[]; from: number }) {
  const t = useTheme();
  const w = useWebT("academy");
  const insets = useSafeAreaInsets();
  const audio = useVerseAudio();
  const s = chapter.id;
  const lesson = PATH.find((l) => l.s === s && l.from === from) ?? { s, from, to: Math.min(verses.length, from + 4), id: `${s}:${from}` };
  const nextL = PATH[PATH.findIndex((l) => l.id === lesson.id) + 1];
  const lvl = useMemo(() => levelOf(readProgress().xp), []);
  const secs = secondsPerQuestion(lvl, ageProfile().testBonus);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [qs, setQs] = useState<Q[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [correct, setCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [left, setLeft] = useState(0);
  const q = qs[i];
  const answered = picked !== null;

  const start = () => { setQs(buildQuiz(verses, lesson.from, lesson.to, questionsFor(lvl))); setI(0); setCorrect(0); setXp(0); setPicked(null); setOrder([]); setLeft(secs); setPhase("quiz"); };
  const award = (ok: boolean) => { if (!ok && q) noteMistake(q.key); if (ok) { setCorrect((c) => c + 1); setXp((x) => x + 10 + Math.max(0, left)); } };

  useEffect(() => {
    if (phase !== "quiz" || answered) return;
    if (left <= 0) { setPicked(-1); if (q) noteMistake(q.key); return; }
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, left, answered]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    audio.stop();
    if (i + 1 >= qs.length) { saveResult(lesson.id, Math.round((correct / qs.length) * 100), xp); setPhase("result"); return; }
    setI(i + 1); setPicked(null); setOrder([]); setLeft(secs);
  };
  const choose = (n: number) => { if (q && "answer" in q && !answered) { setPicked(n); award(n === q.answer); } };
  const tapTile = (n: number) => {
    if (!q || q.kind !== "order" || answered || order.includes(n)) return;
    const o = [...order, n]; setOrder(o);
    if (o.length === q.tiles.length) { const ok = o.every((x, k) => q.tiles[x] === q.solution[k]); setPicked(ok ? 1 : 0); award(ok); }
  };
  const wasRight = useMemo(() => {
    if (!q || !answered) return false;
    if (q.kind === "order") return order.length === q.tiles.length && order.every((x, k) => q.tiles[x] === q.solution[k]);
    return picked === q.answer;
  }, [q, answered, picked, order]);
  const score = qs.length ? Math.round((correct / qs.length) * 100) : 0;
  const title = `${chapter.name_simple} · ${lesson.from}–${lesson.to}`;

  const optStyle = (n: number, ans: number) => {
    const base = { borderRadius: R.lg, borderWidth: 2, padding: 14 };
    if (!answered) return { ...base, borderColor: t.line, backgroundColor: t.surface };
    if (n === ans) return { ...base, borderColor: "rgb(201,166,94)", backgroundColor: "rgba(201,166,94,0.15)" };
    if (n === picked) return { ...base, borderColor: "rgb(190,84,104)", backgroundColor: "rgba(190,84,104,0.1)" };
    return { ...base, borderColor: t.line, backgroundColor: t.surface, opacity: 0.6 };
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <PageHero back topInset eyebrow={w("eyebrow")} title={title} lead={phase === "intro" ? w("introLead") : undefined} arcade={phase === "intro"} />
        <View style={{ padding: 16, gap: 14 }}>
          {phase === "intro" ? (
            <>
              <GoldCard>
                <StarBadge tone="gold" size={40}>1</StarBadge>
                <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 6 }}>{w("stepLearn")}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, marginTop: 4 }}>{w("stepLearnD")}</Text>
                <OutlineButton title={w("learnShams")} icon="sun" onPress={() => router.push(`/shams/${s}?v=${lesson.from}` as Href)} style={{ marginTop: 14 }} />
              </GoldCard>
              <GoldCard>
                <StarBadge tone="gold" size={40}>2</StarBadge>
                <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 6 }}>{w("stepTest")}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.muted, marginTop: 4 }}>{w("stepTestD", { n: questionsFor(lvl), secs, pass: PASS })}</Text>
                <GoldButton title={w("startTest")} onPress={start} style={{ marginTop: 14 }} />
              </GoldCard>
              {verses.filter((v) => v.verse_number >= lesson.from && v.verse_number <= lesson.to).map((v) => (
                <View key={v.verse_key} style={{ borderRadius: R.card, borderWidth: 1, borderColor: "rgba(150,116,52,0.26)", backgroundColor: t.surface, padding: 16 }}>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 48, color: t.arabic, textAlign: AR_RIGHT, writingDirection: "rtl" }}>{v.text_uthmani}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 4 }}>{v.translation}</Text>
                </View>
              ))}
            </>
          ) : null}

          {phase === "quiz" && q ? (
            <>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("question", { n: i + 1, total: qs.length })}</Text>
                <View style={{ paddingHorizontal: 10, height: 26, justifyContent: "center", borderRadius: R.pill, borderWidth: 1, borderColor: left <= 5 && !answered ? "rgba(190,84,104,0.5)" : t.line }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: left <= 5 && !answered ? "rgb(190,84,104)" : t.muted }}>{Math.max(0, left)}s</Text>
                </View>
              </View>
              <GoldProgress value={i / qs.length} />
              <View style={{ height: 4, borderRadius: 2, backgroundColor: t.line, overflow: "hidden", marginTop: -6 }}><View style={{ height: 4, width: `${(Math.max(0, left) / secs) * 100}%`, backgroundColor: t.accent, opacity: 0.6 }} /></View>

              <GoldCard>
                {q.kind === "next" ? (<>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("qNext")}</Text>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 28, lineHeight: 56, color: t.arabic, textAlign: AR_RIGHT, writingDirection: "rtl", marginTop: 6 }}>{q.prompt.join(" ")} <Text style={{ color: t.gold }}>…</Text></Text>
                  <View style={{ gap: 8, marginTop: 10 }}>{q.options.map((o, n) => <Pressable key={n} onPress={() => choose(n)} accessibilityRole="button" style={optStyle(n, q.answer)}><Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, color: t.arabic, textAlign: AR_RIGHT }}>{o}</Text></Pressable>)}</View>
                </>) : null}
                {q.kind === "meaning" ? (<>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("qMeaning")}</Text>
                  <Text style={{ fontFamily: ARABIC_FONT, fontSize: 38, lineHeight: 70, color: t.arabic, textAlign: "center", marginTop: 4 }}>{q.word}</Text>
                  <View style={{ gap: 8, marginTop: 10 }}>{q.options.map((o, n) => <Pressable key={n} onPress={() => choose(n)} accessibilityRole="button" style={optStyle(n, q.answer)}><Text style={{ fontFamily: FONT.medium, fontSize: 16, color: t.ink }}>{o}</Text></Pressable>)}</View>
                </>) : null}
                {q.kind === "listen" ? (<>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("qListen")}</Text>
                  <GoldButton compact icon="play" title={w("play")} onPress={() => audio.play(q.audio)} style={{ marginTop: 10 }} />
                  <View style={{ gap: 8, marginTop: 12 }}>{q.options.map((o, n) => <Pressable key={n} onPress={() => choose(n)} accessibilityRole="button" style={optStyle(n, q.answer)}><Text style={{ fontFamily: ARABIC_FONT, fontSize: 21, color: t.arabic, textAlign: AR_RIGHT }}>{o} …</Text></Pressable>)}</View>
                </>) : null}
                {q.kind === "order" ? (<>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("qOrder")}</Text>
                  <View style={{ minHeight: 60, borderRadius: R.lg, borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(150,116,52,0.35)", padding: 8, marginTop: 10 }}>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 46, color: t.arabic, textAlign: AR_RIGHT, writingDirection: "rtl" }}>{order.map((n) => q.tiles[n]).join(" ")}</Text>
                  </View>
                  <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                    {q.tiles.map((x, n) => (
                      <Pressable key={n} disabled={order.includes(n) || answered} onPress={() => tapTile(n)} accessibilityRole="button" style={{ borderRadius: R.lg, borderWidth: 2, borderColor: t.line, backgroundColor: t.surface, paddingHorizontal: 12, paddingVertical: 4, opacity: order.includes(n) ? 0.3 : 1 }}>
                        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: t.arabic }}>{x}</Text>
                      </Pressable>
                    ))}
                  </View>
                  {!answered && order.length > 0 ? <Text onPress={() => setOrder([])} style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textDecorationLine: "underline", marginTop: 10 }}>{w("reset")}</Text> : null}
                  {answered && !wasRight ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 21, lineHeight: 40, color: t.accent, textAlign: AR_RIGHT, marginTop: 10 }}>{q.solution.join(" ")}</Text> : null}
                </>) : null}
              </GoldCard>

              {answered ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: wasRight ? "rgba(201,166,94,0.45)" : "rgba(190,84,104,0.3)", backgroundColor: wasRight ? "rgba(201,166,94,0.12)" : "rgba(190,84,104,0.08)" }} accessibilityLiveRegion="polite">
                  <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: wasRight ? t.gold : "rgb(190,84,104)", flex: 1 }}>{wasRight ? w("right") : picked === -1 ? w("timeUp") : w("wrong")} <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>· {q.key}</Text></Text>
                  <GoldButton compact title={i + 1 >= qs.length ? w("finish") : w("next")} onPress={next} />
                </View>
              ) : null}
            </>
          ) : null}

          {phase === "result" ? (
            <GoldCard style={{ alignItems: "center" }}>
              <GoldRing value={score / 100} size={140} stroke={8} dark={false}>
                <Text style={{ fontFamily: FONT.display, fontSize: 28, color: t.ink }}>{score}%</Text>
              </GoldRing>
              <Display size="title1" style={{ marginTop: 14, textAlign: "center" }}>{score >= PASS ? w("passed") : w("almost")}</Display>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, marginTop: 6, textAlign: "center" }}>{w("resultLine", { score, xp, pass: PASS })}</Text>
              <View style={{ alignSelf: "stretch", gap: 10, marginTop: 18 }}>
                {score >= PASS && nextL ? <GoldButton title={w("nextLesson")} onPress={() => router.replace(`/academy/${nextL.s}/${nextL.from}` as Href)} /> : null}
                <OutlineButton title={w("again")} onPress={start} />
                <OutlineButton title={w("overview")} onPress={() => goBack()} />
              </View>
            </GoldCard>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
