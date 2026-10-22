import { DoneShare } from "@/features/share/SharePrompt";
import { useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { GoldButton, GoldCard, GoldProgress, OutlineButton, SectionTitle, SmallStar, Wordmark } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero, ProBadge } from "@/components/page";
import { ARABIC_FONT, FONT, R, stage, useTheme } from "@/lib/theme";
import { useEntitlement } from "@/lib/entitlements";
import { ShareSheet, CARD_SIZE, type ShareFormat } from "@/features/feed/share";
import { FREE_TEST, LEVELS, PASS, isFreeUnit, unitById, type Unit } from "./curriculum";
import { useContent } from "./content";
import { useRpT } from "./texts";
import { levelUnitsDone, setExamScore, setUnitScore, toggleCheck, unitDone, useRpProgress } from "./progress";
import { ListenRepeat, RecordCompare, VerseWords, WordCheck } from "./Practice";
import { Quiz, type Question } from "./Quiz";
import { useVerse } from "./useVerse";
import { ExamBar, ExamBlocked, ExamVerdict } from "@/features/exam/ExamUI";
import { shuffleWith, useExamSession } from "@/features/exam/integrity";
import { rpRecitePlan } from "@/features/exam/plans";
import { VerifiedCertLink } from "@/features/exam/Certificates";
import { MisharyCard } from "@/features/mishary/Home";
import { Progressive } from "@/lib/progressive";

const unitHref = (id: string) => `/reciter-path/${id}` as Href;
const examHref = (n: number) => `/reciter-path/exam/${n}` as Href;

function useAccess() {
  const { allowed, upsell } = useEntitlement("reciterPath");
  return { pro: allowed, upsell, canUnit: (id: string) => allowed || isFreeUnit(id), canTest: (id: string) => allowed || id === FREE_TEST };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: 12 }}>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 19, color: t.ink }}>{title}</Text>
      {children}
    </View>
  );
}
function Card({ children }: { children: ReactNode }) {
  const t = useTheme();
  return <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 16, gap: 12 }}>{children}</View>;
}

/** tasteful lock: what the unit contains, then one call to action */
function LockedPreview({ intro }: { intro?: string }) {
  const t = useTheme();
  const rt = useRpT();
  const { upsell } = useAccess();
  return (
    <GoldCard>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="lock" color={t.gold} size={18} /><Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{rt("lockedTitle")}</Text></View>
      {intro ? <Text numberOfLines={3} style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.muted, marginTop: 10 }}>{intro}</Text> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, marginTop: 10 }}>{rt("lockedLead")}</Text>
      <GoldButton title={rt("unlock")} icon="starBig" onPress={upsell} style={{ marginTop: 14 }} />
    </GoldCard>
  );
}

// ——— /reciter-path ———
export function PathHome() {
  const t = useTheme();
  const rt = useRpT();
  const c = useContent();
  const p = useRpProgress();
  const { pro, canUnit } = useAccess();
  const all = LEVELS.flatMap((l) => l.units);
  const next = all.find((u) => !unitDone(p, u.id)) ?? all[0];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={rt("kicker")} title={rt("title")} lead={rt("lead")}>
          <GoldButton title={Object.keys(p.units).length ? rt("continue") : rt("start")} icon="sun" onPress={() => router.push(unitHref(next.id))} />
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.textMuted }}>{rt("unitsDone", { d: all.filter((u) => unitDone(p, u.id)).length, n: all.length })}</Text>
        </PageHero>
        <View style={{ paddingHorizontal: 16, marginTop: 24, gap: 26 }}>
          {/* ten levels with all their units: the first two at once, the rest over the next frames (lib/progressive.tsx) */}
          <Progressive first={2}>
          {LEVELS.map((l) => {
            const done = l.units.filter((u) => unitDone(p, u.id)).length;
            const examOpen = levelUnitsDone(p, l.n);
            return (
              <View key={l.n}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{rt("level", { n: l.n })}</Text>
                  {!pro && l.n > 1 ? <ProBadge /> : null}
                  {p.certs[l.n] ? <Icon name="trophy" size={16} color={t.gold} /> : null}
                </View>
                <SectionTitle title={c.levels[l.n].title} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: -8, marginBottom: 12 }}>{c.levels[l.n].lead}</Text>
                <GoldProgress value={done / l.units.length} />
                <View style={{ marginTop: 12, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, overflow: "hidden", backgroundColor: t.surface }}>
                  {l.units.map((u, i) => {
                    const open = canUnit(u.id);
                    return (
                      <Pressable key={u.id} onPress={() => router.push(unitHref(u.id))} accessibilityRole="button"
                        style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface })}>
                        <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: unitDone(p, u.id) ? t.accent : t.accentSoft }}>
                          {unitDone(p, u.id) ? <Icon name="check" size={15} color="#fff" /> : <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: t.accent }}>{i + 1}</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{c.units[u.id].title}</Text>
                          {!pro && isFreeUnit(u.id) ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent, marginTop: 2 }}>{rt("free")}</Text> : null}
                        </View>
                        {open ? <Icon name="chevronRight" size={16} color={t.muted} /> : <Icon name="lock" size={16} color={t.gold} />}
                      </Pressable>
                    );
                  })}
                  <Pressable onPress={() => router.push(examHref(l.n))} accessibilityRole="button"
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderTopWidth: 1, borderTopColor: t.line, backgroundColor: pressed ? t.bg : t.surface, opacity: examOpen ? 1 : 0.7 })}>
                    <View style={{ width: 30, alignItems: "center" }}><Icon name="cap" size={18} color={t.gold} /></View>
                    <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{rt("exam")}</Text>
                    {pro ? <Icon name="chevronRight" size={16} color={t.muted} /> : <Icon name="lock" size={16} color={t.gold} />}
                  </Pressable>
                </View>
              </View>
            );
          })}
          </Progressive>
          <MisharyCard />
          <Pressable onPress={() => router.push("/reciter-path/teacher" as Href)} accessibilityRole="button">
            <GoldCard>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}><Icon name="user" color={t.gold} /><Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{rt("teacherTitle")}</Text><Icon name="chevronRight" size={16} color={t.muted} /></View>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, marginTop: 8 }}>{rt("teacherLead")}</Text>
            </GoldCard>
          </Pressable>
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

function Example({ refKey, word, rule }: { refKey: string; word: number; rule: string }) {
  const t = useTheme();
  const rt = useRpT();
  const { verse, error } = useVerse(refKey);
  return (
    <Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.gold }}>{rule}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{refKey}</Text>
      </View>
      {verse ? <><VerseWords verse={verse} mark={[word]} /><ListenRepeat verse={verse} word={word} /></> : <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{error ? rt("offline") : rt("loading")}</Text>}
    </Card>
  );
}

function PracticeBlock({ keys }: { keys: string[] }) {
  const t = useTheme();
  const rt = useRpT();
  const [k, setK] = useState(keys[0]);
  const { verse } = useVerse(k);
  return (
    <Card>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        {keys.map((x) => (
          <Pressable key={x} onPress={() => setK(x)} accessibilityRole="button" accessibilityState={{ selected: x === k }}
            style={{ paddingHorizontal: 10, height: 30, justifyContent: "center", borderRadius: R.pill, borderWidth: 1, borderColor: x === k ? t.accent : t.line, backgroundColor: x === k ? t.accentSoft : t.surface }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: x === k ? t.accent : t.ink }}>{x}</Text>
          </Pressable>
        ))}
      </View>
      {verse ? (
        <View key={k} style={{ gap: 16 }}>
          <VerseWords verse={verse} size={24} />
          <ListenRepeat verse={verse} />
          <RecordCompare verse={verse} />
          <View style={{ height: 1, backgroundColor: t.line }} />
          <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink }}>{rt("wordCheck")}</Text>
          <WordCheck verse={verse} />
        </View>
      ) : <Text style={{ fontFamily: FONT.regular, color: t.muted }}>{rt("loading")}</Text>}
    </Card>
  );
}

const unitQuestions = (u: Unit, mcq: { q: string; options: string[]; answer: number }[]): Question[] =>
  [...u.tap.map((item) => ({ kind: "tap" as const, item })), ...mcq.map((m) => ({ kind: "mcq" as const, ...m }))];

// ——— /reciter-path/[unit] ———
export function UnitPage({ id }: { id: string }) {
  const t = useTheme();
  const rt = useRpT();
  const c = useContent();
  const p = useRpProgress();
  const { canUnit, canTest, upsell } = useAccess();
  const [quiz, setQuiz] = useState<null | "run" | number>(null);
  const u = unitById(id);
  const keys = useMemo(() => {
    if (!u) return [];
    if (u.verses) return u.verses.flatMap((r) => Array.from({ length: r.to - r.from + 1 }, (_, i) => `${r.surah}:${r.from + i}`));
    return [...new Set(u.examples.map((e) => e.ref.key))];
  }, [u]);
  if (!u) return null;
  const tx = c.units[u.id];
  const open = canUnit(u.id);
  const questions = unitQuestions(u, tx.mcq);
  const unitNo = LEVELS[u.level - 1].units.indexOf(u) + 1;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arcade={false} eyebrow={`${rt("level", { n: u.level })} · ${rt("unit", { n: unitNo })}`} title={tx.title} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 26 }}>
          {!open ? <LockedPreview intro={tx.intro} /> : (
            <>
              <Section title={rt("explanation")}>
                <Text style={{ fontFamily: FONT.regular, fontSize: 16, lineHeight: 25, color: t.ink }}>{tx.intro}</Text>
                {tx.points.map((pt) => (
                  <View key={pt} style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ marginTop: 6 }}><SmallStar size={10} /></View>
                    <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{pt}</Text>
                  </View>
                ))}
                {u.rules.length ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {u.rules.map((r) => <View key={r} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: R.pill, backgroundColor: t.accentSoft }}><Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent }}>{`${c.rules[r].name} · ${c.rules[r].short}`}</Text></View>)}
                  </View>
                ) : null}
              </Section>

              {u.examples.length ? (
                <Section title={rt("examples")}>
                  {u.examples.map((e) => <Example key={`${e.ref.key}-${e.ref.word}-${e.rule}`} refKey={e.ref.key} word={e.ref.word} rule={c.rules[e.rule].name} />)}
                </Section>
              ) : null}

              <Section title={rt("practice")}>
                {u.verses ? u.verses.map((r) => <Text key={r.surah} style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{rt("surahVerses", { s: r.surah, a: r.from, b: r.to })}</Text>) : null}
                <PracticeBlock keys={keys} />
              </Section>

              <Section title={rt("checklist")}>
                <Card>
                  {tx.check.map((line, i) => {
                    const on = !!p.checks[`${u.id}:${i}`];
                    return (
                      <Pressable key={line} onPress={() => toggleCheck(u.id, i)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                        <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: on ? t.accent : t.line, backgroundColor: on ? t.accent : "transparent", alignItems: "center", justifyContent: "center" }}>{on ? <Icon name="check" size={14} color="#fff" /> : null}</View>
                        <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{line}</Text>
                      </Pressable>
                    );
                  })}
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{rt("checkSaved")}</Text>
                </Card>
              </Section>

              <Section title={rt("test")}>
                {questions.length === 0 ? (
                  unitDone(p, u.id) ? <Text style={{ fontFamily: FONT.bold, color: t.accent }}>{rt("done")}</Text> : <GoldButton title={rt("finish")} onPress={() => setUnitScore(u.id, 1)} />
                ) : !canTest(u.id) ? (
                  <OutlineButton title={rt("unlock")} icon="lock" onPress={upsell} />
                ) : quiz === "run" ? (
                  <Card><Quiz questions={questions} seed={u.id} onDone={(s) => { setUnitScore(u.id, s); setQuiz(s); }} /></Card>
                ) : typeof quiz === "number" ? (
                  <Card>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 20, color: t.ink }}>{rt("result", { score: Math.round(quiz * 100) })}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: quiz >= PASS ? t.accent : t.muted }}>{quiz >= PASS ? rt("passed") : rt("notPassed")}</Text>
                    <OutlineButton title={rt("retry")} onPress={() => setQuiz("run")} />
                    <GoldButton title={rt("toPath")} onPress={() => router.back()} />
                    {quiz >= PASS ? <DoneShare kind="unitDone" title={tx.title} big={`${Math.round(quiz * 100)} %`} footer={`${rt("title")} · ${rt("level", { n: u.level })} · ${rt("unit", { n: unitNo })}`} /> : null}
                  </Card>
                ) : (
                  <>
                    {unitDone(p, u.id) ? <Text style={{ fontFamily: FONT.bold, color: t.accent }}>{`${rt("passed")} · ${Math.round((p.units[u.id] ?? 0) * 100)}%`}</Text> : null}
                    <GoldButton title={rt("test")} icon="checkCircle" onPress={() => setQuiz("run")} />
                  </>
                )}
              </Section>
            </>
          )}
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

// ——— certificate (an app certificate, clearly not an ijazah) ———
function CertificateCard({ level, name, date, format }: { level: number; name: string; date: string; format: ShareFormat }) {
  const rt = useRpT();
  const c = useContent();
  const { w, h } = CARD_SIZE[format];
  return (
    <View style={{ width: w, height: h, backgroundColor: stage.bg, padding: 22, justifyContent: "center" }}>
      <View style={{ flex: 1, borderWidth: 1.5, borderColor: stage.gold, borderRadius: 14, padding: 22, alignItems: "center", justifyContent: "center", gap: 12 }}>
        <SmallStar size={22} color={stage.gold} />
        <Text style={{ fontFamily: FONT.semibold, fontSize: 11, letterSpacing: 2.4, textTransform: "uppercase", color: stage.gold }}>{rt("certTitle")}</Text>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, color: stage.gold }}>{"شهادة"}</Text>
        {name ? <Text style={{ fontFamily: FONT.display, fontSize: 26, color: "#fff", textAlign: "center" }}>{name}</Text> : null}
        <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center" }}>{rt("certBody", { n: level })}</Text>
        <Text style={{ fontFamily: FONT.bold, fontSize: 18, color: "#fff", textAlign: "center" }}>{c.levels[level].title}</Text>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: stage.gold }}>{`${rt("title")} · ${date}`}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 11, lineHeight: 15, color: "rgba(255,255,255,0.65)", textAlign: "center", marginTop: 8 }}>{rt("certNote")}</Text>
        <Wordmark tone="gold" height={16} />
        <Text style={{ fontFamily: FONT.regular, fontSize: 10.5, color: "rgba(255,255,255,0.7)" }}>quranmasterclass.com/app</Text>
      </View>
    </View>
  );
}

function Certificate({ level, date }: { level: number; date: string }) {
  const t = useTheme();
  const rt = useRpT();
  const [name, setName] = useState("");
  const [share, setShare] = useState(false);
  return (
    <GoldCard>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon name="trophy" color={t.gold} /><Text style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{rt("certificate")}</Text></View>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, marginTop: 8 }}>{rt("certNote")}</Text>
      <TextInput value={name} onChangeText={setName} placeholder={rt("certName")} placeholderTextColor={t.muted} maxLength={40}
        style={{ marginTop: 12, height: 44, borderRadius: R.lg, borderWidth: 1, borderColor: t.line, paddingHorizontal: 12, color: t.ink, fontFamily: FONT.regular, backgroundColor: t.surface }} />
      <GoldButton title={rt("shareCert")} icon="send" onPress={() => setShare(true)} style={{ marginTop: 12 }} />
      <ShareSheet visible={share} onClose={() => setShare(false)} noDecoration link="https://quranmasterclass.com/shams"
        message={`${rt("certTitle")} · ${rt("title")} · ${rt("level", { n: level })}`}
        renderCard={(f) => <CertificateCard level={level} name={name.trim()} date={date} format={f} />} />
    </GoldCard>
  );
}

// ——— /reciter-path/exam/[level] ———
export function ExamPage({ level }: { level: number }) {
  const t = useTheme();
  const rt = useRpT();
  const c = useContent();
  const p = useRpProgress();
  const { pro } = useAccess();
  const [state, setState] = useState<null | "run" | number>(null);
  const l = LEVELS[level - 1];
  const questions = useMemo<Question[]>(() => (l ? l.units.flatMap((u) => unitQuestions(u, c.units[u.id].mcq)) : []), [l, c]);
  // exam rules (src/features/exam): order drawn per attempt, time limits, cooldown, recitation, server-signed result
  const ex = useExamSession(pro && l ? "rp-level" : null, String(level), { active: state === "run", recite: (rand) => rpRecitePlan(level, rand) });
  const examQs = useMemo(() => (ex.ready ? shuffleWith(questions, ex.rand) : questions), [questions, ex.ready, ex.rand]);
  if (!l) return null;
  const ready = levelUnitsDone(p, level);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arcade={false} eyebrow={rt("level", { n: level })} title={`${rt("exam")}: ${c.levels[level].title}`} lead={c.levels[level].lead} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 20 }}>
          {!pro ? <LockedPreview intro={c.levels[level].lead} /> : !ready && !p.certs[level] ? (
            <Card><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{rt("examLocked")}</Text><OutlineButton title={rt("toPath")} onPress={() => router.back()} /></Card>
          ) : state === "run" ? (
            ex.phase === "blocked" ? <ExamBlocked session={ex} /> : ex.phase === "void" ? (
              <Card><ExamVerdict session={ex} /><OutlineButton title={rt("toPath")} onPress={() => router.back()} /></Card>
            ) : !ex.ready ? null : (
              <>
                <ExamBar session={ex} />
                <Card><Quiz questions={examQs} seed={`exam-${level}-${ex.nonce}`} questionSeconds={ex.rule?.questionSec} onDone={(s) => { setExamScore(level, s, s >= PASS); setState(s); ex.finish(Math.round(s * examQs.length), examQs.length); }} /></Card>
              </>
            )
          ) : (
            <>
              {typeof state === "number" ? (
                <Card>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 20, color: t.ink }}>{rt("result", { score: Math.round(state * 100) })}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 15, color: state >= PASS ? t.accent : t.muted }}>{state >= PASS ? rt("passed") : rt("notPassed")}</Text>
                  {state >= PASS ? <DoneShare kind="levelDone" title={rt("title")} big={`${Math.round(state * 100)} %`} footer={rt("level", { n: level })} /> : null}
                  <ExamVerdict session={ex} />
                </Card>
              ) : null}
              {ex.phase === "recite" || ex.phase === "submitting" ? null : <GoldButton title={state === null ? rt("exam") : rt("retry")} icon="cap" onPress={() => setState("run")} />}
            </>
          )}
          {pro && p.certs[level] && state !== "run" ? <Certificate level={level} date={p.certs[level]} /> : null}
          {pro && p.certs[level] && state !== "run" ? <VerifiedCertLink course={`rp-level:${level}`} /> : null}
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

// ——— /reciter-path/teacher ———
export function TeacherPage() {
  const t = useTheme();
  const rt = useRpT();
  const steps = [rt("teacherS1"), rt("teacherS2"), rt("teacherS3"), rt("teacherS4")];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arcade={false} eyebrow={rt("title")} title={rt("teacherTitle")} lead={rt("teacherLead")} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 16 }}>
          <Section title={rt("teacherSteps")}>
            {steps.map((s, i) => (
              <View key={s} style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: t.accentSoft, alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: FONT.bold, color: t.accent }}>{i + 1}</Text></View>
                <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 15, lineHeight: 23, color: t.ink }}>{s}</Text>
              </View>
            ))}
          </Section>
          <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted }}>{rt("teacherSoon")}</Text>
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

/** hero card for the Masterclass tab and the Shams pages */
export function ReciterPathCard() {
  const rt = useRpT();
  const p = useRpProgress();
  const done = Object.keys(p.units).length;
  return (
    <Pressable onPress={() => router.push("/reciter-path" as Href)} accessibilityRole="button" accessibilityLabel={rt("title")}
      style={{ borderRadius: R.card, overflow: "hidden", backgroundColor: stage.bg, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", padding: 20, gap: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={stage.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: stage.gold }}>{rt("kicker")}</Text></View>
      <Text style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 32, color: "#fff" }}>{rt("title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: "rgba(255,255,255,0.75)" }}>{rt("lead")}</Text>
      <View style={{ marginTop: 8, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: stage.gold }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: stage.bg }}>{done ? rt("continue") : rt("start")}</Text>
      </View>
    </Pressable>
  );
}
