import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton } from "@/components/brand";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { rate, type Rating } from "@/web/learning";
import { useVerseData } from "@/features/srs/verse";
import { shamsGrow } from "@/features/garden/garden";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { PromptedWords, SpeechCheck, type CheckResult } from "./recite";
import { noteCheck, noteWords } from "./store";
import { useS2 } from "./text";
import { Btn, Card, SourceNote, Term } from "./ui";
import { useRv } from "./review/text";
import { weakSpots } from "./weakSpots";
import { ContinueNext } from "./Continue";
import { Briefing } from "./Tadabbur";
import { useRec } from "./rec/text";

// /shams/weak?s= – weak-spot practice (tathbīt): the verses and words with repeated errors, collected automatically,
// practised one by one with the weak words marked; the prompts follow the learner's grade. Every answer updates the
// verse review (FSRS) and the word statistics, so a weak spot leaves the list once it holds.
export function WeakScreen({ surah }: { surah?: number }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const { lang } = useLang();
  const { pro } = usePro();
  const { name } = useSurahNames();
  const m = useShams2();
  const rv = useRv();
  const { r } = useRec();
  const spots = useMemo(() => {
    const all = weakSpots(m.known, m.words, m.mut, 40, m.links);
    if (!surah) return all;
    const inSurah = all.filter((x) => x.key.startsWith(`${surah}:`));
    if (inSurah.length) return inSurah;
    // nothing flagged in that surah: its weakest memorised verses
    return [...m.known.values()].filter((k) => k.key.startsWith(`${surah}:`)).sort((a, b) => a.recall - b.recall).slice(0, 10).map((k) => ({ key: k.key, words: [], reason: ["fading" as const], weight: 1 }));
  }, [m.known, m.words, m.mut, m.links, surah]);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const cur = queue ? queue[i] : null;
  const spot = spots.find((x) => x.key === cur);
  const vd = useVerseData(cur, lang);
  // one array per loaded verse, so the recitation check keeps its result when this screen re-renders
  const vdData = vd?.data;
  const vWords = useMemo(() => vdData?.words.map((w) => ({ position: w.position, text: w.text })) ?? [], [vdData]);
  const ref = (k: string) => { const [a, b] = k.split(":"); return `${name(Number(a))} ${nf(Number(b))}`; };
  const grade = (r: Rating) => {
    if (!cur) return;
    rate(cur, r);
    if (spot?.words.length) noteWords(cur, spot.words.map((p) => ({ position: p, ok: r !== "again" })));
    if (r !== "again") shamsGrow("verse", pro);
    setResult(null);
    setI(i + 1);
  };
  const onCheck = (r: CheckResult) => {
    if (!cur || !vd?.data) return;
    setResult(r);
    noteWords(cur, vd.data.words.map((w, j) => ({ position: w.position, ok: !!r.ok[j] })));
    noteCheck(cur, r.ok.filter(Boolean).length, r.ok.length);
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="التَّثْبِيت" title={s("weakTitle")} lead={s("weakLead")} />
        <View style={{ padding: 16, gap: 12 }}>
          {queue && cur ? (
            <>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{`${nf(i + 1)} / ${nf(queue.length)} · ${ref(cur)}`}</Text>
              <Card gold>
                {!vd?.data ? <Loading /> : (
                  <>
                    <PromptedWords words={vWords} prompt={m.grade.prompt} mark={new Set(spot?.words ?? [])} />
                    {spot?.words.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{s("weakWordsMarked", { n: nf(spot.words.length) })}</Text> : null}
                    <SpeechCheck words={vWords} pass={m.grade.wordPass} onResult={onCheck} />
                    {result ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: result.pass ? t.accent : t.gold }}>{result.pass ? s("passed") : s("notYetPassed")}</Text> : null}
                    <Briefing s={Number(cur.split(":")[0])} v={Number(cur.split(":")[1])} review />
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("howWasIt")}</Text>
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                      <Btn title={s("rate_weak")} onPress={() => grade("again")} />
                      <Btn title={s("rate_hesitant")} onPress={() => grade("good")} />
                      <Btn primary title={s("rate_fluent")} onPress={() => grade("easy")} />
                    </View>
                    {spot?.words.length ? <Btn icon="repeat" title={r("drillWords")} onPress={() => { const [a, b] = cur.split(":"); router.push(`/shams/drill?s=${a}&v=${b}&w=${spot.words.slice(0, 12).join(",")}` as Href); }} /> : null}
                    <Btn icon="play" title={s("talaqqi")} onPress={() => { const [a, b] = cur.split(":"); router.push(`/shams/talaqqi?s=${a}&v=${b}` as Href); }} />
                  </>
                )}
              </Card>
            </>
          ) : queue ? (
            <Card gold><Text style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink }}>{s("weakDone")}</Text><ContinueNext surah={surah} /></Card>
          ) : (
            <>
              <Term id="tathbit" />
              {spots.length ? <GoldButton title={s("startDrillN", { n: nf(Math.min(10, spots.length)) })} onPress={() => { setQueue(spots.slice(0, 10).map((x) => x.key)); setI(0); }} /> : <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.muted }}>{s("noWeak")}</Text>}
              {spots.map((x) => (
                <View key={x.key} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{ref(x.key)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{x.reason.map((r) => (r === "transition" ? rv("why_transition") : s(`why_${r}` as never))).join(" · ")}</Text>
                  </View>
                  {x.words.length ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 13, color: t.gold }}>{`${nf(x.words.length)}`}</Text> : null}
                </View>
              ))}
              {!spots.length ? <ContinueNext surah={surah} /> : null}
              <SourceNote src={["app", "retrieval", "fsrs"]} review={{ status: "draft" }} />
            </>
          )}
        </View>
      </Page>
    </>
  );
}
