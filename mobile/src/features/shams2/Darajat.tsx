import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, GoldProgress } from "@/components/brand";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { noteMistake } from "@/web/learning";
import { juzOf } from "@/web/quranIndex";
import { award } from "@/web/points";
import { useVerseData } from "@/features/srs/verse";
import { shamsGrow } from "@/features/garden/garden";
import { gEvent } from "@/features/feed/gamify";
import { success } from "@/features/feed/haptics";
import { GRADES, checkPromotion, nextRequirements, pickItems, recordTest, type Grade, type TestKind } from "./grades";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { PromptedWords, SpeechCheck, type CheckResult } from "./recite";
import { noteCheck, noteWords } from "./store";
import { noteLink } from "./store2";
import { useS2 } from "./text";
import { Btn, Card, SourceNote, Term } from "./ui";
import { ContinueNext } from "./Continue";

// Darajāt al-Ḥifẓ: the grade screen (/shams/darajat) and the formal ʿarḍ tests (/shams/ard?kind=weekly|monthly|ard).
// A test item is the classical teacher's question: a verse from the memorised portion is given – "continue from here".

/** the grade card: name, demands, what unlocks the next grade */
export function GradeCard({ compact }: { compact?: boolean }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const m = useShams2();
  const g = m.grade;
  const next = nextRequirements(m.gs, m.known.size, m.q.overall);
  return (
    <Card gold>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: t.gold }}>{s("darajaLabel", { n: nf(g.n), total: nf(GRADES.length) })}</Text>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 44, color: t.gold }}>{g.ar}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{g.tr}</Text>
      </View>
      {!compact ? <Demands g={g} /> : null}
      {next ? (
        <View style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink, textAlign: "left" }}>{s("unlocksNext", { g: next.grade.tr })}</Text>
          {next.items.map((x) => (
            <View key={x.id} style={{ gap: 3 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{s(`req_${x.id}` as never)}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: x.have >= x.need ? t.accent : t.ink }}>{`${nf(Math.min(x.have, x.need))} / ${nf(x.need)}`}</Text>
              </View>
              <GoldProgress value={x.need ? Math.min(1, x.have / x.need) : 1} />
            </View>
          ))}
          {next.ready ? <GoldButton title={s("promote")} onPress={() => { const up = checkPromotion(m.known.size, m.q.overall); if (up) { success(); award("session"); } }} /> : null}
        </View>
      ) : <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{s("topGrade")}</Text>}
      {compact ? <Btn title={s("darajatOpen")} onPress={() => router.push("/shams/darajat" as Href)} /> : null}
    </Card>
  );
}

function Demands({ g }: { g: Grade }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const rows: [string, string][] = [
    [s("dm_prompt"), s(`prompt_${g.prompt}` as never)],
    [s("dm_pass"), `${nf(Math.round(g.wordPass * 100))} %`],
    [s("dm_pace"), s("paceX", { x: nf(g.pace) })],
    [s("dm_manzil"), s("daysN", { n: nf(g.manzilDays) })],
    [s("dm_minutes"), s("minN", { n: nf(g.minutesMin) })],
    [s("dm_ard"), nf(g.ardPerDay)],
    [s("dm_traps"), g.traps ? s("yes") : s("no")],
    [s("dm_tests"), s("testsLine", { w: nf(g.weeklyItems), m: nf(g.monthlyItems), p: nf(Math.round(g.testPass * 100)) })],
  ];
  return (
    <View style={{ gap: 4 }}>
      {rows.map(([a, b]) => (
        <View key={a} style={{ flexDirection: "row", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, flex: 1, textAlign: "left" }}>{a}</Text>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink, textAlign: "right" }}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

/** due tests and the surprise ʿarḍ, as one-tap rows (hub and wird) */
export function DueChecks() {
  const t = useTheme();
  const { s, nf } = useS2();
  const m = useShams2();
  const rows: [string, string, string][] = [];
  if (m.ardLeft > 0) rows.push(["ard", s("surpriseArd"), s("surpriseArdLead", { n: nf(m.ardLeft) })]);
  if (m.due.weekly) rows.push(["weekly", s("weeklyArd"), m.wird.gated ? s("gatedLead") : s("weeklyLead")]);
  if (m.due.monthly) rows.push(["monthly", s("monthlyReview"), m.wird.gated ? s("gatedLead") : s("monthlyLead")]);
  if (!rows.length) return null;
  return (
    <View style={{ gap: 8 }}>
      {rows.map(([k, title, lead]) => (
        <Card key={k} gold style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{title}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, textAlign: "left" }}>{lead}</Text>
          <Btn primary title={s("begin")} onPress={() => router.push(`/shams/ard?kind=${k}` as Href)} />
        </Card>
      ))}
    </View>
  );
}

export function DarajatScreen() {
  const t = useTheme();
  const { s, nf } = useS2();
  const m = useShams2();
  const tests = [...m.gs.tests].reverse().slice(0, 12);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="دَرَجات الحِفْظ" title={s("darajatTitle")} lead={s("darajatLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <GradeCard />
          <DueChecks />
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Btn title={s("weeklyArd")} onPress={() => router.push("/shams/ard?kind=weekly" as Href)} />
            <Btn title={s("monthlyReview")} onPress={() => router.push("/shams/ard?kind=monthly" as Href)} />
          </View>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{s("allGrades")}</Text>
          {GRADES.map((g) => (
            <View key={g.n} style={{ padding: 12, borderRadius: R.card, borderWidth: 1, borderColor: g.n === m.grade.n ? "rgba(201,166,94,0.7)" : t.line, backgroundColor: t.surface, gap: 4, opacity: g.n > m.grade.n + 1 ? 0.7 : 1 }}>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold }}>{nf(g.n)}</Text>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 19, lineHeight: 32, color: t.ink }}>{g.ar}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.muted }}>{g.tr}</Text>
              </View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{s("gradeReq", { v: nf(g.req.verses), q: nf(g.req.quality), w: nf(g.req.weekly), m: nf(g.req.monthly) })}</Text>
            </View>
          ))}
          {tests.length ? <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{s("history")}</Text> : null}
          {tests.map((x, i) => (
            <Text key={i} style={{ fontFamily: FONT.regular, fontSize: 13, color: x.pass ? t.accent : t.muted, textAlign: "left" }}>
              {`${new Date(x.day * 86400000).toLocaleDateString()} · ${s(x.kind === "weekly" ? "weeklyArd" : x.kind === "monthly" ? "monthlyReview" : "surpriseArd")} · ${nf(Math.round(x.score * 100))} % · ${x.pass ? s("passed") : s("retake")}`}
            </Text>
          ))}
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{s("darajatNote")}</Text>
          <View style={{ gap: 10 }}><Term id="ard" /><Term id="itqan" /><Term id="mutashabihat" /></View>
          <SourceNote src={["halaqa", "jazari", "retrieval"]} review={{ status: "draft" }} />
        </View>
      </Page>
    </>
  );
}

// ---------- the test runner ----------
function Item({ k, onDone }: { k: string; onDone: (score: number) => void }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const { lang } = useLang();
  const { name } = useSurahNames();
  const m = useShams2();
  const [sur, v] = k.split(":").map(Number);
  const prevKey = v > 1 ? `${sur}:${v - 1}` : null;
  const prev = useVerseData(prevKey, lang);
  const cur = useVerseData(k, lang);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [shown, setShown] = useState(false);
  const curData = cur?.data;
  const words = useMemo(() => curData?.words.map((w) => ({ position: w.position, text: w.text })) ?? [], [curData]);
  // the cue: at the highest prompt level only the last words of the previous verse, like a teacher's prompt
  const cue = prev?.data ? (m.grade.prompt === "hidden" ? prev.data.words.slice(-3) : prev.data.words) : [];
  const finish = (score: number) => {
    if (score < 1) noteMistake(k);
    // the item asks for the transition from the previous verse into this one (Shams 3.0, links.v1): held when it sat.
    // A stall counts only when the start went wrong: an error in the first three words heard, or (without a speech
    // check) nothing recited at all; a partial score with a clean start is a mistake later in the verse, not in the
    // transition, and leaves the transition as it is.
    if (prevKey) {
      const badStart = check ? check.ok.slice(0, 3).some((x) => !x) : score <= 0;
      if (score >= 1) noteLink(k, true);
      else if (badStart) noteLink(k, false);
    }
    if (check) { noteWords(k, words.map((w, i) => ({ position: w.position, ok: !!check.ok[i] }))); noteCheck(k, check.ok.filter(Boolean).length, check.ok.length); }
    onDone(score);
  };
  if ((prevKey && !prev?.data && !prev?.error) || (!cur?.data && !cur?.error)) return <Loading />;
  return (
    <Card gold>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, textAlign: "left" }}>{`${name(sur)} · ${s("verseN", { v: nf(v) })}`}</Text>
      <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{prevKey ? s("continueFromHere") : s("beginSurah", { surah: name(sur) })}</Text>
      {cue.length ? <PromptedWords words={cue.map((w) => ({ position: w.position, text: w.text }))} prompt="full" size={22} /> : null}
      <SpeechCheck words={words} pass={m.grade.wordPass} onResult={setCheck} />
      {shown ? <PromptedWords words={words} prompt="full" size={24} /> : <Btn icon="eye" title={s("showAnswer")} onPress={() => setShown(true)} />}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("howWasIt")}</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Btn title={s("ans_no")} onPress={() => finish(0)} />
        <Btn title={s("ans_slip")} onPress={() => finish(0.5)} />
        <Btn primary={!check || check.pass} title={s("ans_ok")} onPress={() => finish(check && !check.pass ? 0.5 : 1)} />
      </View>
      {check && !check.pass ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{s("checkCaps")}</Text> : null}
    </Card>
  );
}

export function ArdScreen({ kind }: { kind: TestKind }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const { pro } = usePro();
  const m = useShams2();
  const juz = useMemo(() => (kind === "monthly" ? [...m.q.juz].filter((j) => j.known > 0).sort((a, b) => b.known - a.known)[0]?.id : undefined), [kind, m.q.juz]);
  const items = useMemo(() => pickItems(m.known, kind === "ard" ? 1 : kind === "weekly" ? m.grade.weeklyItems : m.grade.monthlyItems, m.grade, m.day * 7 + (kind === "monthly" ? 3 : kind === "ard" ? (m.gs.ard[m.day] ?? 0) + 11 : 1), juzOf, juz), [kind]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; pass: boolean; up: Grade | null } | null>(null);
  const title = kind === "weekly" ? s("weeklyArd") : kind === "monthly" ? s("monthlyReview") : s("surpriseArd");
  const done = (sc: number) => {
    const all = [...scores, sc];
    setScores(all);
    if (all.length < items.length) { setI(i + 1); return; }
    const score = all.reduce((a, b) => a + b, 0) / all.length;
    const pass = score >= (kind === "ard" ? 0.5 : m.grade.testPass);
    recordTest({ kind, day: m.day, score, items: all.length, pass, juz });
    gEvent({ t: "quiz", right: pass });
    if (pass) { shamsGrow(kind === "ard" ? "verse" : "session", pro); success(); }
    setResult({ score, pass, up: pass && kind !== "ard" ? checkPromotion(m.known.size, m.q.overall) : null });
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="العَرْض" title={title} lead={kind === "monthly" && juz ? s("monthlyJuz", { n: nf(juz) }) : s("ardLead")} />
        <View style={{ padding: 16, gap: 12 }}>
          {!items.length ? <Card><Text style={{ fontFamily: FONT.regular, fontSize: 14.5, color: t.muted }}>{s("ardNothing")}</Text><ContinueNext /></Card> : result ? (
            <Card gold>
              <Text style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{`${nf(Math.round(result.score * 100))} %`}</Text>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: result.pass ? t.accent : t.gold }}>{result.pass ? s("testPassed") : s("testRetake", { p: nf(Math.round(m.grade.testPass * 100)) })}</Text>
              {result.up ? <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.gold }}>{s("newGrade", { g: result.up.tr })}</Text> : null}
              {!result.pass ? <Btn primary title={s("weakTitle")} onPress={() => router.replace("/shams/weak" as Href)} /> : null}
              <ContinueNext />
            </Card>
          ) : (
            <>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{`${nf(i + 1)} / ${nf(items.length)}`}</Text>
              <GoldProgress value={i / items.length} />
              <Item key={items[i]} k={items[i]} onDone={done} />
            </>
          )}
          <SourceNote src={["halaqa", "jazari", "retrieval"]} review={{ status: "draft" }} />
        </View>
      </Page>
    </>
  );
}
