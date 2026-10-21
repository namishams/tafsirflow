import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { readJSON, useStored, writeJSON } from "@/lib/store";
import { StepIn } from "@/features/coursekit/motion";
import { GRADES } from "./grades";
import { HANDBOOK, PRINCIPLES } from "./handbook";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { saveSettings, useLog } from "./store";
import { useS2 } from "./text";
import { Btn, Card, Glossary, SourceNote, Term } from "./ui";
import { saveWeekSnapshot, weekReview } from "./week";
import { weakSpots } from "./weakSpots";
import { ContinueNext } from "./Continue";

// Onboarding (/shams/welcome), the method handbook (/shams/handbook) and the weekly review (/shams/week).
const ONBOARDED = "qmc.shams2.onboarded.v1";
export const useOnboarded = () => !!useStored<number | null>(ONBOARDED, null);

/** principles one by one, then the daily time; never preselected */
export function WelcomeScreen() {
  const t = useTheme();
  const { s, cl, nf } = useS2();
  const [i, setI] = useState(0);
  const [mins, setMins] = useState<number | null>(null);
  const last = i >= PRINCIPLES.length;
  const p = PRINCIPLES[Math.min(i, PRINCIPLES.length - 1)];
  // back to where the welcome was opened (the hub's card or the handbook); only a welcome opened on its own (a link)
  // goes on to the hub, so the hub is never stacked twice
  const finish = () => { if (mins) saveSettings({ minutes: mins }); writeJSON(ONBOARDED, Date.now()); if (router.canGoBack()) router.back(); else router.replace("/shams/method" as Href); };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="مَنْهَج شَمْس" title={s("welcomeTitle")} lead={s("welcomeLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 4 }} accessibilityLabel={s("stepOf", { i: nf(Math.min(i + 1, PRINCIPLES.length + 1)), n: nf(PRINCIPLES.length + 1) })}>
            {Array.from({ length: PRINCIPLES.length + 1 }, (_, k) => <View key={k} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: k <= i ? t.gold : t.line }} />)}
          </View>
          {!last ? (
            <StepIn key={p.id}>
              <Card gold>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 26, lineHeight: 44, color: t.gold, textAlign: "left" }}>{p.ar}</Text>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink, textAlign: "left" }}>{p.title[cl]}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 15.5, lineHeight: 24, color: t.ink, textAlign: "left" }}>{p.body[cl]}</Text>
                <SourceNote src={p.src} review={{ status: "draft" }} />
              </Card>
              <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
                {i > 0 ? <Btn title={s("back")} onPress={() => setI(i - 1)} /> : null}
                <View style={{ flex: 1 }}><GoldButton title={s("next")} onPress={() => setI(i + 1)} /></View>
              </View>
            </StepIn>
          ) : (
            <StepIn>
              <Card gold>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink, textAlign: "left" }}>{s("welcomeTime")}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.muted, textAlign: "left" }}>{s("welcomeTimeLead")}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{[10, 20, 30, 45, 60, 90].map((m) => <Chip key={m} label={s("minN", { n: nf(m) })} selected={mins === m} onPress={() => setMins(m)} />)}</View>
                <GoldButton title={s("welcomeStart")} disabled={!mins} onPress={finish} />
              </Card>
              <View style={{ marginTop: 14 }}><Btn title={s("back")} onPress={() => setI(i - 1)} /></View>
            </StepIn>
          )}
        </View>
      </Page>
    </>
  );
}

export function HandbookScreen() {
  const t = useTheme();
  const { s, cl, nf } = useS2();
  const [open, setOpen] = useState<string | null>(null);
  const Row = ({ id, title, body, src, ar }: { id: string; title: string; body: string; src: Parameters<typeof SourceNote>[0]["src"]; ar?: string }) => (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: open === id ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: t.surface }}>
      <Pressable onPress={() => setOpen(open === id ? null : id)} accessibilityRole="button" accessibilityState={{ expanded: open === id }} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14 }}>
        <View style={{ flex: 1 }}>
          {ar ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 17, lineHeight: 30, color: t.gold, textAlign: "left" }}>{ar}</Text> : null}
          <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{title}</Text>
        </View>
        <Icon name={open === id ? "chevronDown" : "chevronRight"} size={13} color={t.muted} />
      </Pressable>
      {open === id ? (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 8 }}>
          <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 22, color: t.ink, textAlign: "left" }}>{body}</Text>
          <SourceNote src={src} review={{ status: "draft" }} />
        </View>
      ) : null}
    </View>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="دَلِيل المَنْهَج" title={s("handbookTitle")} lead={s("handbookLead")} />
        <View style={{ padding: 16, gap: 10 }}>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{s("principles")}</Text>
          {PRINCIPLES.map((p) => <Row key={p.id} id={`p-${p.id}`} ar={p.ar} title={p.title[cl]} body={p.body[cl]} src={p.src} />)}
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left", marginTop: 8 }}>{s("practice")}</Text>
          {HANDBOOK.map((c) => <Row key={c.id} id={`c-${c.id}`} title={c.title[cl]} body={c.body[cl]} src={c.src} />)}
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left", marginTop: 8 }}>{s("darajatTitle")}</Text>
          <Card>
            {GRADES.map((g) => (
              <View key={g.n} style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold, minWidth: 16 }}>{nf(g.n)}</Text>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 17, lineHeight: 30, color: t.ink }}>{g.ar}</Text>
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{`${g.tr} · ${s(`prompt_${g.prompt}` as never)} · ${nf(Math.round(g.wordPass * 100))} %`}</Text>
              </View>
            ))}
            <Btn title={s("darajatOpen")} onPress={() => router.push("/shams/darajat" as Href)} />
          </Card>
          <Glossary />
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Btn title={s("welcomeAgain")} onPress={() => router.push("/shams/welcome" as Href)} />
            <Btn title={s("weekTitle")} onPress={() => router.push("/shams/week" as Href)} />
          </View>
        </View>
      </Page>
    </>
  );
}

export function WeekScreen() {
  const t = useTheme();
  const { s, nf } = useS2();
  const { name } = useSurahNames();
  const m = useShams2();
  const log = useLog();
  const practice = useStored<Record<string, number>>("tf:days", {});
  useEffect(() => { saveWeekSnapshot(m.day, { overall: m.q.overall, count: m.q.count }); }, [m.day, m.q.overall, m.q.count]);
  const r = useMemo(() => weekReview({ day: m.day, log, practice, known: m.known, surahs: m.q.surahs, overall: m.q.overall, count: m.q.count, gs: m.gs, weak: weakSpots(m.known, m.words, m.mut), due: m.due, manzilVerses: m.wird.manzil.verses }), [m, log, practice]);
  const fmt = (p?: Record<string, string | number>) => (p ? Object.fromEntries(Object.entries(p).map(([k, v]) => [k, k === "s" ? name(Number(v)) : typeof v === "number" ? nf(v) : v])) : undefined);
  const wd = (d: number) => { try { return new Date(d * 86400000).toLocaleDateString(undefined, { weekday: "short" }); } catch { return ""; } };
  const stat = (v: string, l: string) => (
    <View key={l} style={{ flexBasis: "47%", flexGrow: 1, padding: 12, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink, textAlign: "left" }}>{v}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{l}</Text>
    </View>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="مُراجَعة الأُسْبُوع" title={s("weekTitle")} lead={s("weekLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <View style={{ flexDirection: "row", gap: 6, justifyContent: "space-between" }}>
            {r.days.map((d) => (
              <View key={d.day} style={{ alignItems: "center", gap: 4, flex: 1 }} accessibilityLabel={`${wd(d.day)}: ${s("blocksDone", { n: nf(d.blocks) })}`}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: d.blocks === 3 ? t.gold : d.blocks ? t.accent : d.verses ? t.accentSoft : t.line, opacity: d.blocks && d.blocks < 3 ? 0.55 + d.blocks * 0.15 : 1 }} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }}>{wd(d.day)}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {stat(`${nf(r.active)}/${nf(7)}`, s("wk_active"))}
            {stat(nf(r.newVerses), s("wk_new"))}
            {stat(nf(r.reviewed), s("wk_reviewed"))}
            {stat(`${nf(r.manzilDays)}/${nf(7)}`, s("wk_manzil"))}
            {stat(m.q.overall === null ? "–" : `${nf(m.q.overall)}${r.delta !== null ? ` (${r.delta >= 0 ? "+" : "−"}${nf(Math.abs(r.delta))})` : ""}`, s("overall"))}
            {stat(`${nf(r.tests.pass)}/${nf(r.tests.total)}`, s("wk_tests"))}
          </View>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{s("insights")}</Text>
          {r.insights.map((x, i) => (
            <Pressable key={i} disabled={!x.href} onPress={() => x.href && router.push(x.href as Href)} accessibilityRole={x.href ? "button" : "text"}
              style={{ flexDirection: "row", gap: 10, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: x.tone === "good" ? "rgba(201,166,94,0.55)" : t.line, backgroundColor: t.surface }}>
              <Icon name={x.tone === "good" ? "checkCircle" : x.tone === "focus" ? "flag" : "eye"} size={17} color={x.tone === "good" ? t.gold : x.tone === "focus" ? t.accent : t.muted} />
              <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink, textAlign: "left" }}>{s(x.key as never, fmt(x.p))}</Text>
              {x.href ? <Icon name="chevronRight" size={13} color={t.muted} /> : null}
            </Pressable>
          ))}
          <Card><ContinueNext /></Card>
          <Term id="muraja" />
          <SourceNote src={["app", "halaqa"]} />
        </View>
      </Page>
    </>
  );
}
export const readOnboarded = () => !!readJSON<number | null>(ONBOARDED, null);
