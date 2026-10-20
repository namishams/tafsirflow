import { useMemo, useState, type ReactNode } from "react";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { FONT, R, useTheme } from "@/lib/theme";
import { useT } from "@/i18n";
import { useWebT } from "@/i18n/web";
import { ORDER, PLAN_DAYS, TRACKS, cumulative, dayOfPlan, newPerDay, portion, ranges, readPlan, savePlan, type Track } from "@/web/plans";
import { dueVerses, today } from "@/web/learning";
import { ageProfile } from "@/web/age";
import { Callout, HM_GOLD, QuranRing, QuranStar, alpha, inkGold } from "./art";
import { useChapterNames, useLive } from "./hooks";
import { go } from "./links";
import { useText } from "./text";
import { GoldPill, Grid, useCols } from "./ui";

// The 365-day plan (website: PlanBoard.tsx, lib/plans.ts): the daily amount of new verses grows step by step, the
// order follows the Academy path. Stored as tf:plan and synced with the account.
const GOLD_LINE = "rgba(201,166,94,0.3)";

function QKicker({ children, center }: { children: ReactNode; center?: boolean }) {
  const t = useTheme();
  return <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: inkGold(t), textAlign: center ? "center" : "left" }}>{children}</Text>;
}

export function PlanBoard() {
  const t = useTheme();
  const tr = useWebT("plan");
  const ta = useT();
  const tx = useText();
  const name = useChapterNames((s) => String(s));
  const rec = useMemo(() => ageProfile().track, []);
  const [choice, setChoice] = useState<Track["id"]>(rec);
  const { plan, due } = useLive(() => ({ plan: readPlan(), due: dueVerses().length }));
  const trackCols = useCols(1, 2);
  const months = useMemo(() => Array.from({ length: 12 }, (_, m) => m + 1), []);

  const preview = TRACKS.find((x) => x.id === (plan?.track ?? choice))!;
  const yearTotal = cumulative(preview, PLAN_DAYS);
  const monthRow = (tr0: Track, m: number) => {
    const end = cumulative(tr0, Math.min(PLAN_DAYS, Math.round((PLAN_DAYS / 12) * m)));
    const last = ORDER[Math.max(0, end - 1)];
    return { end, last, perDay: newPerDay(tr0, Math.round((PLAN_DAYS / 12) * m)) };
  };

  if (!plan) {
    return (
      <View>
        <Grid cols={trackCols} gap={12} style={{ marginTop: 32 }}>
          {TRACKS.map((x) => {
            const on = choice === x.id;
            return (
              <Pressable key={x.id} onPress={() => setChoice(x.id)} accessibilityRole="radio" accessibilityState={{ selected: on }}
                style={({ pressed }) => ({ flex: 1, borderRadius: 12, borderWidth: on ? 2 : 1, borderColor: on ? HM_GOLD : pressed ? alpha(HM_GOLD, 0.65) : alpha(HM_GOLD, 0.28), backgroundColor: t.surface, padding: on ? 17 : 18 })}>
                {on ? <View style={{ position: "absolute", top: 13, right: 13 }}><Svg width={12} height={12} viewBox="0 0 12 12"><Path d="M6 0L7.44 4.56 12 6 7.44 7.44 6 12 4.56 7.44 0 6 4.56 4.56z" fill={t.gold} /></Svg></View> : null}
                <View style={{ paddingEnd: 20 }}><QKicker>{tr(`${x.id}For`)}{rec === x.id ? ` · ${tr("recommended")}` : ""}</QKicker></View>
                <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 4 }}>{tr(x.id)}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 4 }}>{tr("ramp", { start: x.start, cap: x.cap, every: x.every, step: x.step })}</Text>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 20, color: t.ink, marginTop: 8 }}>{tr("yearResult", { n: cumulative(x, PLAN_DAYS), pct: Math.round((cumulative(x, PLAN_DAYS) / ORDER.length) * 100) })}</Text>
              </Pressable>
            );
          })}
        </Grid>
        <MonthTable tr0={preview} months={months} monthRow={monthRow} name={name} />
        <GoldPill pill={false} arrow={false} title={tr("start", { name: tr(choice) })} style={{ marginTop: 24 }}
          onPress={() => savePlan({ track: choice, startDay: today(), done: {}, at: Date.now() })} />
      </View>
    );
  }

  const track = TRACKS.find((x) => x.id === plan.track)!;
  const day = dayOfPlan(plan);
  // what is still open: everything scheduled up to today that is not marked done
  const scheduled = cumulative(track, day);
  const doneCount = Object.values(plan.done).reduce((a, b) => a + b, 0);
  const todays = portion(track, day);
  const backlog = Math.max(0, scheduled - doneCount - todays.length);
  const doneToday = (plan.done[today()] ?? 0) > 0;
  const first = ORDER[Math.min(doneCount, ORDER.length - 1)];
  const markDone = () => savePlan({ ...plan, done: { ...plan.done, [today()]: (plan.done[today()] ?? 0) + todays.length }, at: Date.now() });
  const reset = () => {
    if (Platform.OS === "web") { savePlan(null); return; }
    Alert.alert(tr("resetConfirm"), undefined, [{ text: ta("common.cancel"), style: "cancel" }, { text: tx.delete, style: "destructive", onPress: () => savePlan(null) }]);
  };
  const stat = (k: string, v: ReactNode, sub?: string) => (
    <View style={{ alignItems: "center" }}>
      <QKicker center>{k}</QKicker>
      {v}
      {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 4, textAlign: "center" }}>{sub}</Text> : null}
    </View>
  );
  const step = (n: number, body: ReactNode, firstStep = false) => (
    <View style={[{ flexDirection: "row", gap: 12, alignItems: "flex-start" }, !firstStep && { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(201,166,94,0.25)" }]}>
      <QuranStar n={n} size={36} />
      <View style={{ flex: 1, paddingTop: 6 }}>{body}</View>
    </View>
  );
  const body = { fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink };
  const link = { fontFamily: FONT.semibold, color: t.accent };

  return (
    <View>
      <Callout style={{ marginTop: 32, borderRadius: 12, padding: 20, gap: 20 }}>
        <View style={{ alignItems: "center" }}>
          <QuranRing pct={(Math.min(day, PLAN_DAYS) / PLAN_DAYS) * 100} size={128}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: t.muted }}>{tr("day")}</Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink, marginTop: 4 }}>{Math.min(day, PLAN_DAYS)}</Text>
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 2 }}>/ {PLAN_DAYS}</Text>
          </QuranRing>
        </View>
        {stat(tr("track"), <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: t.ink, marginTop: 8 }}>{tr(track.id)}</Text>)}
        {stat(tr("learned"), <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink, marginTop: 8 }}>{doneCount}</Text>, tr("ofYear", { n: yearTotal }))}
        {stat(tr("review"), <Text style={{ fontFamily: FONT.display, fontSize: 30, color: t.ink, marginTop: 8 }}>{due}</Text>, tr("reviewHint"))}
      </Callout>

      <View style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: GOLD_LINE, backgroundColor: t.surface, padding: 20 }}>
        <QKicker>{tr("today", { n: newPerDay(track, day) })}</QKicker>
        <View style={{ marginTop: 16 }}>
          {step(1, due > 0 ? <Text style={[body, link]} onPress={() => go("/today")} accessibilityRole="link">{tr("stepReview", { n: due })}</Text> : <Text style={body}>{tr("stepReviewNone")}</Text>, true)}
          {step(2, (
            <Text style={body}>
              {tr("stepNew")}{" "}
              {ranges(todays).map((r) => (
                <Text key={`${r.s}:${r.from}`} style={link} onPress={() => go(`/surah/${r.s}?v=${r.from}&shams=1`)} accessibilityRole="link">{name(r.s)} {r.from}{r.to > r.from ? `–${r.to}` : ""}{"   "}</Text>
              ))}
            </Text>
          ))}
          {step(3, <Text style={body}>{tr("stepChain")}</Text>)}
          {step(4, <Text style={body}>{tr("stepTest")} <Text style={link} onPress={() => go(`/academy/${first.s}/${Math.max(1, first.v - ((first.v - 1) % 5))}`)} accessibilityRole="link">{tr("toTest")}</Text></Text>)}
          {step(5, <Text style={body}>{tr("stepNight")}</Text>)}
        </View>
        {backlog > 0 ? <Text style={{ marginTop: 20, borderRadius: R.md, overflow: "hidden", backgroundColor: "rgba(201,166,94,0.1)", padding: 14, fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: inkGold(t) }}>{tr("backlog", { n: backlog })}</Text> : null}
        <GoldPill pill={false} arrow={false} disabled={doneToday} title={doneToday ? tr("doneToday") : tr("markDone")} onPress={markDone} style={{ marginTop: 24 }} />
      </View>

      <MonthTable tr0={track} months={months} monthRow={monthRow} name={name} current={Math.ceil(Math.min(day, PLAN_DAYS) / (PLAN_DAYS / 12))} />
      <Text onPress={reset} accessibilityRole="button" style={{ marginTop: 24, fontFamily: FONT.regular, fontSize: 14, color: t.muted, textDecorationLine: "underline", textDecorationColor: "rgba(201,166,94,0.6)", alignSelf: "flex-start", paddingVertical: 6 }}>{tr("reset")}</Text>
    </View>
  );
}

function MonthTable({ tr0, months, monthRow, name, current }: { tr0: Track; months: number[]; monthRow: (tr: Track, m: number) => { end: number; last: { s: number; v: number }; perDay: number }; name: (s: number) => string; current?: number }) {
  const t = useTheme();
  const tr = useWebT("plan");
  const wide = useCols(0, 1) === 1;
  const head = { flex: 1, fontFamily: FONT.bold, fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase" as const, color: inkGold(t) };
  return (
    <View style={{ marginTop: 32 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 24, color: t.ink }}>{tr("months", { name: tr(tr0.id) })}</Text>
      <View style={{ marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: GOLD_LINE, overflow: "hidden" }}>
        <View style={{ flexDirection: "row", gap: 8, padding: 12, backgroundColor: "rgba(201,166,94,0.08)" }}>
          <Text style={[head, { flex: 0.7 }]}>{tr("month")}</Text>
          <Text style={head}>{tr("perDay")}</Text>
          <Text style={[head, { flex: 1.4 }]}>{tr("total")}</Text>
          {wide ? <Text style={[head, { flex: 1.6 }]}>{tr("reached")}</Text> : null}
        </View>
        {months.map((m) => {
          const r = monthRow(tr0, m);
          const now = current === m;
          return (
            <View key={m} style={{ flexDirection: "row", gap: 8, padding: 12, backgroundColor: now ? "rgba(201,166,94,0.12)" : t.surface, borderTopWidth: 1, borderTopColor: "rgba(201,166,94,0.16)", borderStartWidth: now ? 3 : 0, borderStartColor: t.gold, paddingStart: now ? 9 : 12 }}
              accessibilityLabel={`${tr("month")} ${m}: ${r.perDay} ${tr("perDay")}, ${r.end}`}>
              <Text style={{ flex: 0.7, fontFamily: FONT.semibold, fontSize: 14, color: inkGold(t) }}>{m}</Text>
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{r.perDay}</Text>
              <Text style={{ flex: 1.4, fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{r.end} <Text style={{ color: t.muted }}>({Math.round((r.end / ORDER.length) * 100)}%)</Text></Text>
              {wide ? <Text style={{ flex: 1.6, fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{name(r.last.s)} {r.last.v}</Text> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default PlanBoard;
