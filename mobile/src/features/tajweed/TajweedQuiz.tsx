import { useEffect, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GoldCard } from "@/components/brand";
import { useLang } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { readJSON, writeJSON } from "@/lib/store";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { award } from "@/web/points";
import { tajweedFor } from "@/web/tajweed";
import { MedalText, PracticeCelebrate, PracticeMedallion, ROSE, roseA, solidGoldA } from "../coursekit/art";
import { tone } from "../coursekit/audio";
import { GoldRing, StepIn, useNudge } from "../coursekit/motion";
import { BigButton } from "../coursekit/ui";
import { AskTutor } from "@/features/tutor/AskTutor";
import { useTutor } from "@/features/tutor/hooks";
import { isArabic } from "../coursekit/Markdown";

// TajweedQuiz.tsx: the short quiz at the end of a tajweed lesson; the best result per lesson is kept in "tf:tajweed"
// (synced with the account) and a finished quiz earns points, exactly like on the website.
export function TajweedQuiz({ id }: { id: string }) {
  const t = useTheme();
  const w = useWebT("tajweed");
  const { lang } = useLang();
  const de = lang === "de";
  const l = tajweedFor(lang).find((x) => x.id === id)!;
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [ok, setOk] = useState(0);
  const q = l.quiz[i];
  const done = i >= l.quiz.length;
  const next = () => {
    const right = ok + (pick === q.answer ? 1 : 0);
    setOk(right); setPick(null); setI(i + 1);
    if (i + 1 >= l.quiz.length) { const r = readJSON<Record<string, number>>("tf:tajweed", {}); r[id] = Math.max(r[id] ?? 0, Math.round((right / l.quiz.length) * 100)); writeJSON("tf:tajweed", r); award("quiz"); }
  };
  if (done) {
    const pct = l.quiz.length ? ok / l.quiz.length : 0;
    return (
      <GoldCard style={{ marginTop: 20, padding: 24, paddingTop: 32, alignItems: "center", overflow: "hidden" }}>
        {pct >= 0.7 ? <PracticeCelebrate /> : null}
        <PracticeMedallion pct={pct} size={132} turn={pct >= 0.7} enter>
          <MedalText size={26} small={`/${l.quiz.length}`}>{ok}</MedalText>
        </PracticeMedallion>
        <Text style={{ marginTop: 16, fontFamily: FONT.bold, fontSize: 18, color: t.ink, textAlign: "center" }}>{w("result", { ok, n: l.quiz.length })}</Text>
        <BigButton variant="outline" title={w("again")} height={44} radius={R.pill} style={{ marginTop: 16 }} onPress={() => { setI(0); setOk(0); setPick(null); }} />
      </GoldCard>
    );
  }
  const opts = de ? q.options_de : q.options_en;
  const right = pick === q.answer;
  return (
    <GoldCard style={{ marginTop: 20, padding: 20, paddingTop: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{w("qN", { n: i + 1, total: l.quiz.length })}</Text>
        <View style={{ flexDirection: "row", gap: 4 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {l.quiz.map((_, k) => k === i
            ? <LinearGradient key={k} colors={["#c6a65e", "#ecd7a2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 6, width: 24, borderRadius: 3 }} />
            : <View key={k} style={{ height: 6, width: 16, borderRadius: 3, backgroundColor: k < i ? "rgb(201,166,94)" : t.line }} />)}
        </View>
      </View>
      <StepIn key={i} distance={6}>
        <Text accessibilityRole="header" style={{ marginTop: 12, fontFamily: FONT.bold, fontSize: 17, lineHeight: 23, color: t.ink }}>{de ? q.q_de : q.q_en}</Text>
      </StepIn>
      <View style={{ marginTop: 16, gap: 10 }}>
        {opts.map((o, n) => (
          <QuizOption key={`${i}-${n}`} label={o} state={pick === null ? "idle" : n === q.answer ? "right" : n === pick ? "wrong" : "dim"}
            onPress={() => { setPick(n); tone(n === q.answer); }} disabled={pick !== null} />
        ))}
      </View>
      {pick !== null ? (
        <StepIn distance={6} style={{ marginTop: 16, borderRadius: R.sm, borderWidth: 1, padding: 16, borderColor: right ? solidGoldA(0.45) : roseA(0.3), backgroundColor: right ? solidGoldA(0.1) : roseA(0.07) }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 24, color: t.ink, opacity: 0.85 }}>{de ? q.explain_de : q.explain_en}</Text>
          {!right ? <TutorWhy ctx={{ kind: "quiz", id: `tajweed:${id}`, title: de ? l.title_de : l.title_en, question: de ? q.q_de : q.q_en, chosen: opts[pick], correct: opts[q.answer], explain: de ? q.explain_de : q.explain_en }} /> : null}
          <BigButton title={w("next")} variant={right ? "gold" : "ink"} height={44} radius={R.pill} style={{ marginTop: 12, alignSelf: "flex-start", minWidth: 120 }} onPress={next} />
        </StepIn>
      ) : null}
    </GoldCard>
  );
}

/** "Why is this wrong?" – the tutor explains it from the tajweed lesson (features/tutor) */
function TutorWhy({ ctx }: { ctx: import("@/features/tutor/api").TutorContext }) {
  const { ui } = useTutor();
  return <AskTutor context={ctx} question={ui.why} label={ui.why} style={{ marginTop: 12 }} />;
}

function QuizOption({ label, state, onPress, disabled }: { label: string; state: "idle" | "right" | "wrong" | "dim"; onPress: () => void; disabled: boolean }) {
  const t = useTheme();
  const nudge = useNudge();
  useEffect(() => { if (state === "wrong") nudge.run(); }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={nudge.style}>
      <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
        style={{ borderRadius: R.sm, borderWidth: 2, padding: 14, opacity: state === "dim" ? 0.6 : 1,
          borderColor: state === "right" ? "rgb(201,166,94)" : state === "wrong" ? ROSE : t.line,
          backgroundColor: state === "right" ? solidGoldA(0.15) : state === "wrong" ? roseA(0.1) : t.surface }}>
        {isArabic(label)
          ? <Text allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, color: t.ink, writingDirection: "rtl", alignSelf: "flex-start" }}>{label}</Text>
          : <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 22, color: t.ink }}>{label}</Text>}
        <GoldRing on={state === "right"} radius={R.sm} />
      </Pressable>
    </Animated.View>
  );
}
