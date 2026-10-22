import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { GoldButton } from "@/components/brand";
import { Icon, type IconName } from "@/components/icons";
import { ARABIC_FONT, FONT, FWD, R, stage, useTheme } from "@/lib/theme";
import { useShams2 } from "./model";
import { weakSpots } from "./weakSpots";
import { useS2 } from "./text";
import { Card, Glossary, LevelPill, SourceNote, Term, onScore, scoreColor } from "./ui";
import { levelOf } from "./qualityModel";
import { ContinueNext } from "./Continue";
import { DueChecks, GradeCard } from "./Darajat";
import { Briefing } from "./Tadabbur";
import { useOnboarded } from "./Guide";
import { ShamsModeBar } from "./ModeChooser";
import { AdabPillarCard, AdabTodayCard } from "./adab/Adab";
import { useAdabText } from "./adab/text";
import { ListenDaysCard } from "@/features/sisters/ui";
import { useSis } from "@/features/sisters/state";

// /shams/method – Shams Method 2.0: the classical hifz system (sabaq, sabqī, manzil, talaqqī, ʿarḍ, mutashābihāt,
// darajāt) joined with learning science (spaced retrieval, interleaving), never ending. Everything here extends the
// existing Shams sessions; they are opened, never replaced.

/** entry card for the Shams page and the Masterclass (one insert each) */
export function Shams2Entry() {
  const { s } = useS2();
  const { wird, grade } = useShams2();
  return (
    <Pressable onPress={() => router.push("/shams/method" as Href)} accessibilityRole="button" accessibilityLabel={`${s("hubTitle")}. ${s("entryLead")}`}
      style={({ pressed }) => ({ marginTop: 14, padding: 18, borderRadius: R.card, backgroundColor: stage.bg, borderWidth: 1, borderColor: "rgba(214,180,108,0.5)", gap: 6, opacity: pressed ? 0.9 : 1 })}>
      <Text style={{ fontFamily: ARABIC_FONT, fontSize: 20, lineHeight: 34, color: stage.gold, textAlign: "left" }}>{"مَنْهَج شَمْس"}</Text>
      <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: stage.text, textAlign: "left" }}>{s("hubTitle")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: stage.textSoft, textAlign: "left" }}>{s("entryLead")}</Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: stage.gold, marginTop: 4 }}>{`${s("entryToday", { a: wird.sabaq.verses, b: wird.sabqi.verses, c: wird.manzil.verses })} · ${grade.tr} ${FWD}`}</Text>
    </Pressable>
  );
}

function Tile({ icon, title, lead, href, right }: { icon: IconName; title: string; lead: string; href: string; right?: React.ReactNode }) {
  const t = useTheme();
  return (
    <Pressable onPress={() => router.push(href as Href)} accessibilityRole="button" accessibilityLabel={`${title}. ${lead}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: t.accentSoft, alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={17} color={t.accent} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{title}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, textAlign: "left" }}>{lead}</Text>
      </View>
      {right ?? <Icon name="chevronRight" size={14} color={t.muted} />}
    </Pressable>
  );
}

export function HubScreen() {
  const t = useTheme();
  const { s, nf } = useS2();
  const m = useShams2();
  const weak = weakSpots(m.known, m.words, m.mut).length;
  const first = m.wird.sabaq.ranges[0];
  const onboarded = useOnboarded();
  const rows: [string, number][] = [["sabaq", m.wird.sabaq.verses], ["sabqi", m.wird.sabqi.verses], ["manzil", m.wird.manzil.verses]];
  const { a } = useAdabText();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="مَنْهَج شَمْس" title={s("hubTitle")} lead={s("hubLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <ShamsModeBar />
          {!onboarded ? <Tile icon="sun" title={s("onboardCard")} lead={s("welcomeLead")} href="/shams/welcome" /> : null}
          <DueChecks />
          {/* listening and understanding days (pause mode, features/sisters): the switch, or today's listening plan */}
          <ListenDaysCard compact />
          <Card gold>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.2, color: t.gold }}>{s("todayWird")}</Text>
            {rows.map(([k, n]) => (
              <View key={k} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <Term id={k} inline />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{s("versesCount", { n: nf(n) })}</Text>
              </View>
            ))}
            {m.wird.gated ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.gold }}>{s("gatedLead")}</Text> : null}
            {m.wird.locked ? (
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <Icon name="lock" size={14} color={t.gold} />
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{s("proSurah")}</Text>
              </View>
            ) : null}
            {first ? <Briefing s={first.s} v={first.from} /> : null}
            <GoldButton title={s("openWird", { m: nf(m.wird.minutes) })} onPress={() => router.push("/shams/wird" as Href)} />
          </Card>
          {/* pillar "Adab des Qurʾān-Trägers" (Shams 3.0): one adab of the day next to today's wird */}
          <AdabTodayCard />
          <GradeCard compact />
          <Tile icon="grid" title={s("qualityTitle")} lead={s("qualityShort")} href="/shams/quality" right={
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: scoreColor(t, m.q.overall), alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: FONT.bold, fontSize: 13, color: onScore(m.q.overall) ?? t.ink }}>{m.q.overall === null ? "–" : nf(m.q.overall)}</Text></View>
              <LevelPill level={levelOf(m.q.overall)} />
            </View>} />
          <Tile icon="book" title={s("tadabburTitle")} lead={s("tadabburShort")} href={`/shams/tadabbur?s=${first?.s ?? 1}`} />
          <Tile icon="speaker" title={s("talaqqiTitle")} lead={s("talaqqiShort")} href={`/shams/talaqqi?s=${first?.s ?? 1}&v=${first?.from ?? 1}`} />
          <Tile icon="repeat" title={s("mutTitle")} lead={s("mutShort")} href="/shams/mutashabihat" />
          <Tile icon="flag" title={s("weakTitle")} lead={weak ? s("weakCount", { n: nf(weak) }) : s("weakShort")} href="/shams/weak" />
          <Tile icon="trophy" title={s("darajatTitle")} lead={s("darajatShort")} href="/shams/darajat" />
          <Tile icon="calendar" title={s("weekTitle")} lead={s("weekShort")} href="/shams/week" />
          <Tile icon="hands" title={a("name")} lead={a("tileLead")} href="/shams/adab" />
          <Tile icon="list" title={s("handbookTitle")} lead={s("handbookShort")} href="/shams/handbook" />
          <Tile icon="user" title={s("teacherTitle")} lead={s("teacherShort")} href="/shams/teacher" />
          <SistersTile />
          <Card><ContinueNext /></Card>
          <AdabPillarCard />
          <Card>
            <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s("methodTitle")}</Text>
            {(["m1", "m2", "m3", "m4", "m5"] as const).map((k) => <Text key={k} style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{s(k)}</Text>)}
            <Text style={{ fontFamily: FONT.semibold, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{a("methodLine")}</Text>
            <SourceNote src={["halaqa", "jazari", "nawawi", "fsrs", "retrieval", "interleave"]} review={{ status: "draft" }} />
          </Card>
          <Glossary />
        </View>
      </Page>
    </>
  );
}

/** "Für Schwestern" as a quiet link in the Shams flow, for everyone (brothers may look it up for their families) */
function SistersTile() {
  const tx = useSis();
  return <Tile icon="moon" title={tx.entryTitle} lead={tx.entryLead} href="/sisters" />;
}
