import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { GoldButton, GoldProgress, OutlineButton, Segmented } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { tone } from "@/features/coursekit/audio";
import { useMt } from "./texts";
import {
  JINS, MAQAMAT, MAQAM_AR, NOTES, PASS, QUESTIONS, STAGES, descKey, nameKey, playJins, recordAnswer, recordStage, reviewedExamples, stageOpen, stopJins, useEarStats,
  type Maqam, type Stage,
} from "./maqam";
import { Card, Chip, Muted, NeedsReview, Row, Section } from "./ui";

type Tab = "lessons" | "drills" | "stats";

// ——— /mishary/ear ———
export function EarTrainingScreen() {
  const mt = useMt();
  const [tab, setTab] = useState<Tab>("lessons");
  const [drill, setDrill] = useState<Stage | null>(null);
  useEffect(() => stopJins, []);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("kicker")} title={mt("earTitle")} lead={mt("earLead")} arabic="المقامات" />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 20 }}>
          {drill ? <Drill stage={drill} onClose={() => setDrill(null)} /> : (
            <>
              <Segmented value={tab} onChange={setTab} options={[["lessons", mt("tabLessons")], ["drills", mt("tabDrills")], ["stats", mt("tabStats")]]} />
              {tab === "lessons" ? <Lessons /> : tab === "drills" ? <Stages onStart={setDrill} /> : <Stats />}
            </>
          )}
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

/** a tiny step diagram of the jins: each interval as a block, quarter-tone steps in gold */
function JinsSteps({ m }: { m: Maqam }) {
  const t = useTheme();
  const c = JINS[m];
  const steps = c.slice(1).map((x, i) => x - c[i]);
  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "flex-end" }} accessibilityElementsHidden>
      {steps.map((s, i) => (
        <View key={i} style={{ flex: s, height: 14, borderRadius: 4, backgroundColor: s % 100 ? t.gold : s > 200 ? "rgb(160,58,52)" : t.accent, opacity: 0.85 }} />
      ))}
    </View>
  );
}

function Lessons() {
  const t = useTheme();
  const mt = useMt();
  return (
    <View style={{ gap: 14 }}>
      <Muted>{mt("earSynthNote")}</Muted>
      <Row><NeedsReview /><Muted size={12}>{mt("needsReviewNote")}</Muted></Row>
      {MAQAMAT.map((m) => (
        <Card key={m}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{mt(nameKey(m))}</Text>
            <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, color: t.gold }}>{MAQAM_AR[m]}</Text>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{mt(descKey(m))}</Text>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{mt("lowerJins")}: {NOTES[m]}</Text>
            <JinsSteps m={m} />
          </View>
          <Row>
            <Chip label={mt("hearJins")} icon="play" onPress={() => playJins(m)} />
            <Chip label={mt("hearScale")} icon="repeat" onPress={() => playJins(m, { updown: true })} />
          </Row>
        </Card>
      ))}
    </View>
  );
}

function Stages({ onStart }: { onStart: (s: Stage) => void }) {
  const t = useTheme();
  const mt = useMt();
  const stats = useEarStats();
  const examples = reviewedExamples();
  return (
    <View style={{ gap: 12 }}>
      {STAGES.map((s) => {
        const open = stageOpen(stats, s.n) && (!s.recordings || examples.length >= 4);
        const best = stats.best[s.n];
        return (
          <Card key={s.n}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: (best ?? 0) >= PASS ? t.accent : t.accentSoft }}>
                {(best ?? 0) >= PASS ? <Icon name="check" size={15} color="#fff" /> : <Text style={{ fontFamily: FONT.bold, color: t.accent }}>{s.n}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold, letterSpacing: 1 }}>{mt("stage", { n: s.n }).toUpperCase()}</Text>
                <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink }}>{mt(s.title)}</Text>
              </View>
              {open ? null : <Icon name="lock" size={16} color={t.gold} />}
            </View>
            {s.recordings && examples.length < 4 ? <Muted>{mt("noExamples")}</Muted> : (
              <>
                <Muted>{s.maqamat.map((m) => mt(nameKey(m))).join(" · ")}</Muted>
                {best !== undefined ? <Muted size={12}>{mt("stageBest", { n: Math.round(best * 100) })}</Muted> : null}
                {open ? <OutlineButton compact title={mt("startDrill")} icon="play" onPress={() => onStart(s)} /> : <Muted size={12}>{mt("stageLocked")}</Muted>}
              </>
            )}
          </Card>
        );
      })}
    </View>
  );
}

type Q = { m: Maqam; shift: number };
function makeQuestions(s: Stage): Q[] {
  // every maqam of the stage at least once, then random, never the same twice in a row
  const out: Q[] = [];
  const pool = [...s.maqamat].sort(() => Math.random() - 0.5);
  while (out.length < QUESTIONS) {
    const prev = out.at(-1)?.m;
    let m = pool.length ? pool.pop()! : s.maqamat[Math.floor(Math.random() * s.maqamat.length)];
    if (m === prev && s.maqamat.length > 1) m = s.maqamat.find((x) => x !== prev)!;
    out.push({ m, shift: s.transpose ? Math.floor(Math.random() * 7) - 3 : 0 });
  }
  return out;
}

function Drill({ stage, onClose }: { stage: Stage; onClose: () => void }) {
  const t = useTheme();
  const mt = useMt();
  const [qs, setQs] = useState(() => makeQuestions(stage));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<Maqam | null>(null);
  const [ok, setOk] = useState(0);
  const [finished, setFinished] = useState(false);
  const q = qs[i];
  const play = () => playJins(q.m, { shift: q.shift });
  useEffect(() => { if (!finished) play(); }, [i, qs]); // eslint-disable-line react-hooks/exhaustive-deps

  const answer = (m: Maqam) => {
    if (picked) return;
    setPicked(m);
    recordAnswer(q.m, m);
    tone(m === q.m);
    if (m === q.m) setOk((n) => n + 1);
  };
  const next = () => {
    if (i + 1 >= qs.length) { recordStage(stage.n, ok / qs.length); setFinished(true); stopJins(); return; }
    setPicked(null); setI(i + 1);
  };
  const restart = () => { setQs(makeQuestions(stage)); setI(0); setOk(0); setPicked(null); setFinished(false); };
  const options = useMemo(() => stage.maqamat, [stage]);

  if (finished) {
    const score = ok / qs.length;
    return (
      <Card>
        <Text style={{ fontFamily: FONT.bold, fontSize: 22, color: t.ink }}>{mt("result", { ok, total: qs.length })}</Text>
        <GoldProgress value={score} />
        {score >= PASS && STAGES.some((s) => s.n === stage.n + 1) ? <Text style={{ fontFamily: FONT.semibold, color: t.accent }}>{mt("unlocked", { n: stage.n + 1 })}</Text> : null}
        <Row>
          <GoldButton title={mt("again")} icon="repeat" onPress={restart} compact />
          <OutlineButton title={mt("done")} onPress={onClose} compact />
        </Row>
      </Card>
    );
  }
  return (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 12, color: t.gold, letterSpacing: 1 }}>{mt("stage", { n: stage.n }).toUpperCase()} · {mt("question", { n: i + 1, total: qs.length })}</Text>
        <Pressable onPress={() => { stopJins(); onClose(); }} accessibilityRole="button" accessibilityLabel={mt("back")} hitSlop={10}><Icon name="close" size={18} color={t.muted} /></Pressable>
      </View>
      <GoldProgress value={i / qs.length} />
      <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink }}>{mt("whichMaqam")}</Text>
      <OutlineButton compact title={mt("playAgain")} icon="play" onPress={play} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((m) => {
          const isRight = picked && m === q.m;
          const isWrong = picked === m && m !== q.m;
          return (
            <Pressable key={m} onPress={() => answer(m)} accessibilityRole="button" accessibilityState={{ selected: picked === m }}
              style={{ minWidth: "47%", flexGrow: 1, paddingVertical: 12, paddingHorizontal: 14, borderRadius: R.lg, borderWidth: 1.5,
                borderColor: isRight ? t.accent : isWrong ? "rgb(160,58,52)" : t.line, backgroundColor: isRight ? t.accentSoft : t.surface, flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{mt(nameKey(m))}</Text>
              <Text style={{ fontFamily: ARABIC_FONT, fontSize: 17, color: t.gold }}>{MAQAM_AR[m]}</Text>
            </Pressable>
          );
        })}
      </View>
      {picked ? (
        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: picked === q.m ? t.accent : "rgb(160,58,52)" }}>
            {picked === q.m ? mt("correct") : mt("wrongWas", { m: mt(nameKey(q.m)) })}
          </Text>
          <Muted>{mt(descKey(q.m))}</Muted>
          <GoldButton title={mt("next")} onPress={next} compact />
        </View>
      ) : null}
    </Card>
  );
}

function Stats() {
  const t = useTheme();
  const mt = useMt();
  const s = useEarStats();
  const total = MAQAMAT.reduce((a, m) => a + (s.per[m]?.[0] ?? 0), 0);
  const right = MAQAMAT.reduce((a, m) => a + (s.per[m]?.[1] ?? 0), 0);
  if (!total) return <Muted>{mt("noStats")}</Muted>;
  const top = Object.entries(s.confused).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const highest = STAGES.filter((x) => (s.best[x.n] ?? 0) >= PASS).at(-1)?.n ?? 0;
  const Stat = ({ v, l }: { v: string; l: string }) => (
    <View style={{ flex: 1, minWidth: 120, padding: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
      <Text style={{ fontFamily: FONT.bold, fontSize: 22, color: t.ink }}>{v}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{l}</Text>
    </View>
  );
  return (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Stat v={String(total)} l={mt("statAnswers")} />
        <Stat v={`${Math.round((right / total) * 100)} %`} l={mt("statAccuracy")} />
        <Stat v={String(highest)} l={mt("statStage")} />
        <Stat v={String(s.days.length)} l={mt("statDays")} />
      </View>
      <Section title={mt("statAccuracy")}>
        <Card>
          {MAQAMAT.map((m) => {
            const [n, ok] = s.per[m] ?? [0, 0];
            return (
              <View key={m} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt(nameKey(m))}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{mt("statPer", { ok, n })}</Text>
                </View>
                <GoldProgress value={n ? ok / n : 0} />
              </View>
            );
          })}
        </Card>
      </Section>
      {top.length ? (
        <Section title={mt("confused")}>
          <Card>
            {top.map(([k, n]) => { const [a, b] = k.split(">") as Maqam[]; return <Text key={k} style={{ fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{mt(nameKey(a))} → {mt(nameKey(b))} · {n}×</Text>; })}
          </Card>
        </Section>
      ) : null}
    </View>
  );
}
