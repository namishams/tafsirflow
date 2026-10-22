import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { usePro } from "@/lib/pro";
import { useEntitlement } from "@/lib/entitlements";
import { rateGrade, stats } from "@/web/learning";
import { award } from "@/web/points";
import { shamsGrow } from "@/features/garden/garden";
import { gEvent } from "@/features/feed/gamify";
import { success } from "@/features/feed/haptics";
import { StepIn } from "@/features/coursekit/motion";
import { useIntl } from "@/features/srs/format";
import { useShams2, type Shams2Model } from "./model";
import { useSurahNames } from "./names";
import { rangeId, type Range, type WirdBlock } from "./plan";
import { markBlock, rateRange, saveSettings, useLog, wirdStreak, type Block } from "./store";
import { useS2 } from "./text";
import { Btn, Card, SourceNote, Term } from "./ui";
import { ContinueNext } from "./Continue";
import { DueChecks } from "./Darajat";
import { Briefing } from "./Tadabbur";
import { TeacherAssigned } from "@/features/teacher/Inbox";
import { noteLinks } from "./store2";
import { StripToggle, TathbitCard, TodayMinutes } from "./review/WirdExtras";

// /shams/wird – today's wird: sabaq (new), sabqi (recent), manzil (long term), one tap opens the existing Shams session
// or the reader at the right verse; after reciting, a self-assessment (tathbīt) updates the verse reviews. Shams 3.0:
// today's minutes, single verses and transitions rated in a verse strip, and the tathbīt block (review/WirdExtras.tsx).
export const openRange = (kind: Block, r: Range) => router.push((kind === "sabaq" ? `/shams/${r.s}?v=${r.from}` : `/surah/${r.s}?v=${r.from}`) as Href);

export function rewardBlock(pro: boolean, verses: number) {
  shamsGrow(verses >= 5 ? "session" : "verse", pro);
  gEvent({ t: "verse" });
  success();
}

function BlockCard({ b, done, onDone, ratings, known, locked }: { b: WirdBlock; done: boolean; onDone: () => void; ratings: Record<string, string>; known: Shams2Model["known"]; locked?: Range | null }) {
  const t = useTheme();
  const { s } = useS2();
  const nf = useIntl();
  const { name } = useSurahNames();
  const ent = useEntitlement("shams");
  const reviewKind = b.kind !== "sabaq";
  const onRate = (r: Range, g: "fluent" | "hesitant" | "weak") => {
    for (let v = r.from; v <= r.to; v++) {
      const key = `${r.s}:${v}`;
      const k = known.get(key);
      if (!k) continue;
      // held = Good (3), hesitated = Hard (2), shaky = Again (1)
      rateGrade(key, g === "fluent" ? 3 : g === "hesitant" ? 2 : 1);
    }
    // a range recited fluently: every transition inside it held
    if (g === "fluent") noteLinks(Array.from({ length: r.to - r.from }, (_, i) => ({ key: `${r.s}:${r.from + i + 1}`, ok: true })));
    rateRange(rangeId(r), g);
  };
  return (
    <Card gold={!done} style={done ? { opacity: 0.85 } : undefined}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <View style={{ flex: 1 }}><Term id={b.kind} /></View>
        {done ? <Icon name="checkCircle" size={22} color={t.accent} /> : null}
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{b.verses ? s("blockMeta", { n: nf(b.verses), m: nf(Math.max(1, b.minutes)) }) : s(`empty_${b.kind}` as never)}</Text>
      {b.ranges[0] ? <Briefing s={b.ranges[0].s} v={b.ranges[0].from} review={reviewKind} /> : null}
      {b.ranges.slice(0, 12).map((r) => {
        const id = rangeId(r);
        const rated = ratings[id];
        return (
          <View key={id} style={{ gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: t.line }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }} numberOfLines={1}>{`${name(r.s)} · ${r.from === r.to ? s("verseN", { v: nf(r.from) }) : s("versesAB", { a: nf(r.from), b: nf(r.to) })}`}</Text>
              <Btn title={s(b.kind === "sabaq" ? "learn" : "recite")} icon="play" primary={!rated && !done} onPress={() => openRange(b.kind, r)} label={`${s(b.kind === "sabaq" ? "learn" : "recite")}: ${name(r.s)} ${r.from}–${r.to}`} />
            </View>
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              <Chip label={s("talaqqi")} onPress={() => router.push(`/shams/talaqqi?s=${r.s}&v=${r.from}&to=${r.to}` as Href)} />
              {reviewKind ? (["fluent", "hesitant", "weak"] as const).map((g) => (
                <Chip key={g} label={s(`rate_${g}` as never)} selected={rated === g} onPress={() => onRate(r, g)} />
              )) : null}
            </View>
            {reviewKind ? <StripToggle r={r} known={known} marks={ratings} /> : null}
          </View>
        );
      })}
      {b.ranges.length > 12 ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{s("moreRanges", { n: nf(b.ranges.length - 12) })}</Text> : null}
      {locked ? (
        // the next portion needs Pro (all free surahs are learned): shown with a lock, never planned or marked as done
        <View style={{ gap: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: t.line }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Icon name="lock" size={16} color={t.gold} />
            <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }} numberOfLines={1}>{`${name(locked.s)} · ${locked.from === locked.to ? s("verseN", { v: nf(locked.from) }) : s("versesAB", { a: nf(locked.from), b: nf(locked.to) })}`}</Text>
          </View>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.muted, textAlign: "left" }}>{s("proSurah")}</Text>
          <Btn title={s("unlock")} icon="lock" onPress={() => ent.upsell()} />
        </View>
      ) : null}
      {b.verses && !done ? <GoldButton title={s("markDone")} onPress={onDone} /> : null}
    </Card>
  );
}

export function WirdScreen() {
  const t = useTheme();
  const { s } = useS2();
  const nf = useIntl();
  const { pro } = usePro();
  const m = useShams2();
  const { wird, settings, day, grade, known } = m;
  const log = useLog();
  const today = log[day] ?? {};
  const streak = Math.max(wirdStreak(log, day), 0);
  const done = (b: Block) => !!today[b];
  const finish = (b: WirdBlock) => { if (markBlock(b.kind, day)) { rewardBlock(pro, b.verses); const n = (["sabaq", "sabqi", "manzil"] as const).filter((k) => k === b.kind || done(k) || !wird[k].verses).length; if (n === 3) award("session"); } };
  const allDone = (["sabaq", "sabqi", "manzil"] as const).every((k) => done(k) || !wird[k].verses);
  const reasonKey = wird.reason === "reviewOnly" ? "reasonReviewOnly" : wird.reason === "consolidate" ? "reasonConsolidate" : wird.reason === "start" ? "reasonStart" : null;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="الوِرْد اليَوْمِيّ" title={s("wirdTitle")} lead={s("wirdLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[[nf(wird.minutes), s("minutes")], [`${nf(wird.cycleDay)}/${nf(wird.cycleOf)}`, s("manzilCycle")], [nf(Math.max(streak, stats().streak)), s("streak")]].map(([v, l]) => (
              <View key={l} style={{ flex: 1, padding: 12, borderRadius: R.card, backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, alignItems: "center" }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{v}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted, textAlign: "center" }}>{l}</Text>
              </View>
            ))}
          </View>
          <TodayMinutes m={m} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, textAlign: "left" }}>{s("wirdGrade", { g: grade.tr, m: nf(grade.minutesMin), d: nf(settings.manzilDays || grade.manzilDays) })}</Text>
          <DueChecks />
          <TeacherAssigned />
          {wird.gated ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.gold, textAlign: "left" }}>{s("gatedLead")}</Text> : null}
          {reasonKey ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "left" }}>{s(reasonKey)}</Text> : null}
          {(["sabaq", "sabqi", "manzil"] as const).map((k, i) => (
            <StepIn key={k} delay={i * 60}><BlockCard b={wird[k]} done={done(k)} onDone={() => finish(wird[k])} ratings={today.r ?? {}} known={known} locked={k === "sabaq" ? wird.locked : null} /></StepIn>
          ))}
          <StepIn delay={180}><TathbitCard tb={wird.tathbit} marks={today.r ?? {}} /></StepIn>
          {allDone ? <Card gold><Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{s("wirdDone")}</Text><ContinueNext /></Card> : null}
          <Card>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s("settings")}</Text>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{s("setMinutes")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{[10, 20, 30, 45, 60, 90].map((m) => <Chip key={m} label={s("minN", { n: nf(m) })} selected={settings.minutes === m} onPress={() => saveSettings({ minutes: m })} />)}</View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{s("setNew")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{[0, 1, 2, 3, 5, 7, 10].map((m) => <Chip key={m} label={m ? nf(m) : s("auto")} selected={settings.newPerDay === m} onPress={() => saveSettings({ newPerDay: m })} />)}</View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{s("setManzil")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{[0, 3, 5, 7, 10, 14, 30].map((m) => <Chip key={m} label={m ? s("daysN", { n: nf(m) }) : s("byGrade")} selected={settings.manzilDays === m} onPress={() => saveSettings({ manzilDays: m })} />)}</View>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{s("setSabqi")}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{[7, 14, 30, 60].map((m) => <Chip key={m} label={s("daysN", { n: nf(m) })} selected={settings.sabqiDays === m} onPress={() => saveSettings({ sabqiDays: m })} />)}</View>
          </Card>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 20, color: t.muted, textAlign: "left" }}>{s("wirdHow")}</Text>
          <SourceNote src={["halaqa", "fsrs", "retrieval"]} review={{ status: "draft" }} />
        </View>
      </Page>
    </>
  );
}
