import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldCard, SectionTitle, Stage } from "@/components/brand";
import { Icon } from "@/components/icons";
import { useLang, intlLocale } from "@/i18n";
import { SITE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useStored } from "@/lib/store";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { solidGoldA } from "../coursekit/art";
import { tone } from "../coursekit/audio";
import { StepIn } from "../coursekit/motion";
import { BigButton, CourseHero, ProCard, ProLock } from "../coursekit/ui";
import { success, tick } from "../feed/haptics";
import { BrandFoot, CARD_SIZE, ShareSheet, type ShareFormat } from "../feed/share";
import { useIntl } from "./format";
import { EMPTY_TESTS, TESTS_KEY, useTestGate, type TestKind, type TestResult, type TestStore } from "./gate";
import { PASS, buildTest, saveResult, type Question } from "./testgen";
import { useSrsT } from "./texts";

const KINDS: TestKind[] = ["placement", "weekly", "juz", "surah", "vocab"];
export const isTestKind = (k: string | undefined): k is TestKind => !!k && (KINDS as string[]).includes(k);

function useTestTitle() {
  const st = useSrsT();
  const nf = useIntl();
  return (kind: TestKind, ref: string) => {
    if (kind === "juz") return `${st("juzExam")} · ${st("juzN", { n: nf(Number(ref)) })}`;
    if (kind === "surah") return `${st("surahExam")} · ${st("surahN", { n: nf(Number(ref)) })}`;
    if (kind === "vocab") return `${st("vocabExam")} · ${st(`deck_${ref}` as "deck_juzamma")}`;
    return st(kind);
  };
}

// ---------- /tests ----------
export function TestsHome() {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  const title = useTestTitle();
  const gate = useTestGate();
  const store = useStored<TestStore>(TESTS_KEY, EMPTY_TESTS);
  const { lang } = useLang();
  const go = (kind: TestKind, ref = "") => { tick(); if (gate.canStart(kind)) router.push(`/tests/${kind}${ref ? `?ref=${ref}` : ""}` as Href); else gate.upsell(); };
  const locked = (k: TestKind) => !gate.canStart(k);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }}>
        <CourseHero back word="اِمْتِحَان" title={st("tests")} lead={st("testsLead")} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 24 }}>
          {!gate.pro && gate.usedThisWeek ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "left" }}>{st("oneTestWeek")}</Text> : null}
          <View style={{ gap: 10 }}>
            <TestRow title={st("placement")} sub={st("placementLead")} onPress={() => go("placement")} />
            <TestRow title={st("weekly")} sub={st("weeklyLead")} locked={locked("weekly")} onPress={() => go("weekly")} />
          </View>
          <View>
            <SectionTitle title={st("vocabExam")} />
            <View style={{ gap: 10 }}>
              {(["juzamma", "vocab", "names"] as const).map((d) => <TestRow key={d} title={st(`deck_${d}`)} locked={locked("vocab")} onPress={() => go("vocab", d)} />)}
            </View>
          </View>
          <View>
            <SectionTitle title={st("juzExam")} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, marginTop: -6, marginBottom: 10, textAlign: "left" }}>{st("examLead")}</Text>
            <NumberGrid n={30} size={52} done={new Set(store.certs.map((c) => c.juz))} locked={locked("juz")} onPick={(j) => go("juz", String(j))} />
          </View>
          <View>
            <SectionTitle title={st("surahExam")} />
            <NumberGrid n={114} size={40} locked={locked("surah")} onPick={(s) => go("surah", String(s))} />
          </View>
          {store.certs.length ? (
            <View>
              <SectionTitle title={st("certificate")} />
              <View style={{ gap: 10 }}>
                {store.certs.map((c) => <TestRow key={c.juz} title={st("juzN", { n: nf(c.juz) })} sub={`${nf(c.pct)} %`} onPress={() => router.push(`/tests/certificate?juz=${c.juz}` as Href)} />)}
              </View>
            </View>
          ) : null}
          <View>
            <SectionTitle title={st("history")} />
            {store.results.length ? (
              <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                {store.results.slice(0, 30).map((r) => (
                  <View key={r.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: t.line }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink, textAlign: "left" }}>{title(r.kind, r.ref)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{new Date(r.at).toLocaleDateString(intlLocale(lang))}</Text>
                    </View>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: r.total && r.score / r.total >= PASS ? t.accent : t.muted }}>{`${nf(r.total ? Math.round((r.score / r.total) * 100) : 0)} %`}</Text>
                  </View>
                ))}
              </View>
            ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "left" }}>{st("noHistory")}</Text>}
          </View>
          {!gate.pro ? <ProCard feature="vocab" title={st("proTitle")} text={st("proText")} /> : null}
        </View>
      </ScrollView>
    </>
  );
}

function TestRow({ title, sub, locked, onPress }: { title: string; sub?: string; locked?: boolean; onPress: () => void }) {
  const t = useTheme();
  const st = useSrsT();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={locked ? `${title}, ${st("locked")}` : title}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{title}</Text>
        {sub ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted, textAlign: "left" }}>{sub}</Text> : null}
      </View>
      {locked ? <ProLock /> : <Icon name="chevronRight" size={18} color={t.muted} />}
    </Pressable>
  );
}

function NumberGrid({ n, size, done, locked, onPick }: { n: number; size: number; done?: Set<number>; locked?: boolean; onPick: (i: number) => void }) {
  const t = useTheme();
  const nf = useIntl();
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
      {Array.from({ length: n }, (_, i) => i + 1).map((i) => (
        <Pressable key={i} onPress={() => onPick(i)} accessibilityRole="button" accessibilityLabel={nf(i)}
          style={{ width: size, height: size, borderRadius: R.sm, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: done?.has(i) ? t.gold : t.line, backgroundColor: done?.has(i) ? solidGoldA(0.18) : t.surface, opacity: locked ? 0.6 : 1 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{nf(i)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------- /tests/[kind] ----------
export function TestRunner({ kind, refId: ref }: { kind: TestKind; refId: string }) {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  const { lang } = useLang();
  const title = useTestTitle()(kind, ref);
  const gate = useTestGate();
  const [qs, setQs] = useState<Question[] | null>(null);
  const [error, setError] = useState(false);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<TestResult | null>(null);
  const [share, setShare] = useState(false);
  const allowed = gate.canStart(kind);
  useEffect(() => {
    if (!allowed) return;
    let live = true;
    buildTest(kind, ref, lang).then((q) => { if (live) { if (q.length) setQs(q); else setError(true); } }).catch(() => { if (live) setError(true); });
    return () => { live = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const q = qs?.[i];
  const answer = (k: number) => {
    if (pick !== null || !q) return;
    const ok = k === q.answer;
    setPick(k); tone(ok); if (ok) { success(); setScore((s) => s + 1); } else tick();
  };
  const next = () => {
    if (!qs) return;
    if (i + 1 < qs.length) { setI(i + 1); setPick(null); return; }
    setResult(saveResult({ kind, ref, score, total: qs.length }, gate.pro));
  };
  const pct = result && result.total ? Math.round((result.score / result.total) * 100) : 0;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }}>
        <CourseHero back title={title} lead={kind === "juz" || kind === "surah" ? st("examLead") : undefined} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 14 }}>
          {!allowed ? <ProCard feature="vocab" title={st("proTitle")} text={st("oneTestWeek")} /> : null}
          {allowed && error ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center" }}>{st("loadError")}</Text> : null}
          {allowed && !qs && !error ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center" }}>{st("loading")}</Text> : null}
          {q && !result ? (
            <StepIn key={i}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted, textAlign: "center", marginBottom: 10 }}>{st("question", { n: nf(i + 1), total: nf(qs!.length) })}</Text>
              <Stage rounded={R.card} hairlines={false} style={{ padding: 20, minHeight: 160, justifyContent: "center", borderWidth: 1, borderColor: stage.goldSoft }}>
                <QuestionFront q={q} revealed={pick !== null} />
              </Stage>
              <View style={{ gap: 8, marginTop: 14 }}>
                {q.options.map((o, k) => {
                  const state = pick === null ? "idle" : k === q.answer ? "right" : k === pick ? "wrong" : "dim";
                  const ar = q.type !== "text" && q.type !== "meaning";
                  return (
                    <Pressable key={k} onPress={() => answer(k)} disabled={pick !== null} accessibilityRole="button" accessibilityState={{ selected: pick === k, disabled: pick !== null }}
                      style={{ minHeight: 52, borderRadius: R.md, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, justifyContent: "center",
                        borderColor: state === "right" ? t.accent : state === "wrong" ? t.danger : t.line,
                        backgroundColor: state === "right" ? t.accentSoft : t.surface, opacity: state === "dim" ? 0.55 : 1 }}>
                      <Text accessibilityLanguage={ar ? "ar" : undefined} style={ar
                        ? { fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 44, color: t.ink, textAlign: "center", writingDirection: "rtl" }
                        : { fontFamily: FONT.semibold, fontSize: 15.5, lineHeight: 21, color: t.ink, textAlign: "left" }}>{o}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {pick !== null ? <BigButton title={st("next")} onPress={next} style={{ marginTop: 14 }} /> : null}
            </StepIn>
          ) : null}
          {result ? (
            <StepIn>
              <GoldCard style={{ alignItems: "center", gap: 8 }}>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.8, textTransform: "uppercase", color: t.gold }}>{st("result")}</Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 48, color: t.ink }}>{`${nf(pct)} %`}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 16, color: t.muted }}>{st("scoreOf", { score: nf(result.score), total: nf(result.total) })}</Text>
                {kind !== "placement" ? <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: pct >= PASS * 100 ? t.accent : t.muted, textAlign: "center" }}>{pct >= PASS * 100 ? st("passed") : st("notPassed")}</Text> : null}
                {kind === "placement" ? <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "center" }}>{st("placementResult", { deck: st(pct >= 70 ? "deck_vocab" : "deck_juzamma") })}</Text> : null}
              </GoldCard>
              <View style={{ gap: 10, marginTop: 14 }}>
                <BigButton title={st("share")} icon="send" onPress={() => setShare(true)} />
                {kind === "juz" && pct >= PASS * 100 ? (gate.pro
                  ? <BigButton title={st("viewCert")} variant="outline" onPress={() => router.push(`/tests/certificate?juz=${ref}` as Href)} />
                  : <ProCard feature="vocab" title={st("certificate")} text={st("proText")} />) : null}
                <BigButton title={st("backToCards")} variant="outline" onPress={() => router.replace("/tests" as Href)} />
              </View>
              <ShareSheet visible={share} onClose={() => setShare(false)} link={SITE} noDecoration
                message={st("shareMsg", { pct: nf(pct), test: title })}
                renderCard={(f) => <ResultCard format={f} kicker={st("result")} title={title} big={`${nf(pct)} %`} sub={st("scoreOf", { score: nf(result.score), total: nf(result.total) })} />} />
            </StepIn>
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

function QuestionFront({ q, revealed }: { q: Question; revealed: boolean }) {
  const st = useSrsT();
  if (q.type === "meaning") return <Text accessibilityLanguage="ar" allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 46, lineHeight: 88, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>{q.ar}</Text>;
  if (q.type === "text") return <Text style={{ fontFamily: FONT.bold, fontSize: 18, lineHeight: 26, color: "#fff", textAlign: "center" }}>{q.prompt}</Text>;
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 1.8, textTransform: "uppercase", color: stage.gold, textAlign: "center" }}>{`${st("verse", { key: q.verseKey })} · ${st("fillIn")}`}</Text>
      <Text accessibilityLanguage="ar" allowFontScaling={false} style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 50, color: "#fff", textAlign: "center", writingDirection: "rtl" }}>
        {q.words.map((w, i) => {
          const txt = `${i ? " " : ""}${w.text}`;
          if (w.position !== q.hide) return <Text key={w.position}>{txt}</Text>;
          return revealed ? <Text key={w.position} style={{ color: stage.gold }}>{txt}</Text> : <Text key={w.position} style={{ color: "transparent", backgroundColor: "rgba(214,180,108,0.3)" }}>{txt}</Text>;
        })}
      </Text>
    </View>
  );
}

/** the shared image of a result or certificate (sizes of the feed's share sheet) */
function ResultCard({ format, kicker, title, big, sub, note }: { format: ShareFormat; kicker: string; title: string; big: string; sub: string; note?: string }) {
  const { w, h } = CARD_SIZE[format];
  return (
    <Stage hairlines={false} style={{ width: w, height: h }}>
      <View style={{ flex: 1, padding: 28, paddingTop: format === "story" ? 80 : 40, paddingBottom: format === "story" ? 48 : 24, justifyContent: "space-between" }}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ width: 40, height: 1, backgroundColor: stage.goldSoft }} />
          <Text allowFontScaling={false} style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.2, textTransform: "uppercase", color: stage.gold }}>{kicker}</Text>
        </View>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 22, lineHeight: 28, color: "#fff", textAlign: "center" }}>{title}</Text>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.display, fontSize: 64, lineHeight: 70, color: stage.cream }}>{big}</Text>
          <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 15, color: stage.textSoft, textAlign: "center" }}>{sub}</Text>
          {note ? <Text allowFontScaling={false} style={{ fontFamily: FONT.regular, fontSize: 10.5, lineHeight: 15, color: stage.textMuted, textAlign: "center", marginTop: 8 }}>{note}</Text> : null}
        </View>
        <BrandFoot />
      </View>
    </Stage>
  );
}

// ---------- /tests/certificate ----------
export function CertificateScreen({ juz }: { juz: number }) {
  const t = useTheme();
  const st = useSrsT();
  const nf = useIntl();
  const { lang } = useLang();
  const { user } = useAuth();
  const store = useStored<TestStore>(TESTS_KEY, EMPTY_TESTS);
  const cert = store.certs.find((c) => c.juz === juz);
  const [share, setShare] = useState(false);
  const date = cert ? new Date(cert.at).toLocaleDateString(intlLocale(lang)) : "";
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 56 }}>
        <CourseHero back title={st("certificate")} />
        <View style={{ paddingHorizontal: 16, paddingTop: 20, gap: 14 }}>
          {cert ? (
            <>
              <Stage rounded={R.card} style={{ padding: 26, borderWidth: 2, borderColor: stage.gold }}>
                <View style={{ alignItems: "center", gap: 10 }}>
                  <Icon name="trophy" size={34} color={stage.gold} />
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold }}>{st("certificate")}</Text>
                  {user?.name ? <Text style={{ fontFamily: FONT.display, fontSize: 26, color: "#fff", textAlign: "center" }}>{user.name}</Text> : null}
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: stage.textSoft, textAlign: "center" }}>{st("certificateFor")}</Text>
                  <Text style={{ fontFamily: FONT.display, fontSize: 30, color: stage.cream, textAlign: "center" }}>{st("juzN", { n: nf(juz) })}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: stage.textMuted }}>{`${nf(cert.pct)} % · ${date}`}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: stage.textMuted, textAlign: "center", marginTop: 10 }}>{st("certificateNote")}</Text>
                </View>
              </Stage>
              <BigButton title={st("share")} icon="send" onPress={() => setShare(true)} />
              <ShareSheet visible={share} onClose={() => setShare(false)} link={SITE} noDecoration message={st("shareMsg", { pct: nf(cert.pct), test: st("juzN", { n: nf(juz) }) })}
                renderCard={(f) => <ResultCard format={f} kicker={st("certificate")} title={`${user?.name ? `${user.name} · ` : ""}${st("juzN", { n: nf(juz) })}`} big={`${nf(cert.pct)} %`} sub={date} note={st("certificateNote")} />} />
            </>
          ) : <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: t.muted, textAlign: "center" }}>{st("noHistory")}</Text>}
        </View>
      </ScrollView>
    </>
  );
}
