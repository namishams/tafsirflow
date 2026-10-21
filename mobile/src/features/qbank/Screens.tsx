import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams, type Href } from "expo-router";
import { Chip, GoldButton, GoldCard, OutlineButton, SectionTitle, SmallStar } from "@/components/brand";
import { Icon } from "@/components/icons";
import { LinkRow, Page, PageHero, ProBadge, RowGroup } from "@/components/page";
import { useEntitlement } from "@/lib/entitlements";
import { useStored } from "@/lib/store";
import { ARABIC_FONT, FONT, GARNET, R, stage as ST, useTheme } from "@/lib/theme";
import { QBANK_MOCK, rng, shuffleWith, useExamSession } from "@/features/exam/integrity";
import { ExamBar, ExamBlocked, ExamVerdict } from "@/features/exam/ExamUI";
import { BANK_REVIEW, STAGE_AR, STAGES, SUBJECTS, TIERS, TIER_AR, allQuestions, countsBySubject, locOf, questionById, subjectMeta, type Q } from "./bank";
import {
  FREE_PER_DAY, MASTER_ACC, MASTER_N, QBANK_KEY, dailyChallenge, dailyDone, drawAdaptive, dueQuestions, freeLeft, inRepetition, mastery45, mockQuestions,
  openStages, overall, poolOf, qbankKashf, readQbank, readiness, scholarOpen, setQuestionLang, stageOpen, subjectStats, tagStats, tierOfRating, trend,
  weakestTopics, weaknessDrill, type Mode, type QbankStore,
} from "./engine";
import { Results, Runner, saveRun, useQLang, useQbankRewards, type Answer } from "./Runner";
import { useQbankT } from "./text";
import { Bar, Explanation, Panel, Pill, StatTile, pctText } from "./ui";
import type { QStage, QSubject } from "./types";

// Markaz al-Imtihanat: the centre's home, a subject, a session (practice, timed, drill, daily, bookmarks,
// repetition), the mock exam per stage (exam integrity module), statistics and bookmarks.

const go = (href: string) => router.push(href as Href);
const sessionHref = (p: Record<string, string | number | undefined>) =>
  `/exams/session?${Object.entries(p).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")}`;
const useQbank = () => { useStored<Partial<QbankStore>>(QBANK_KEY, {}); return readQbank(); };
const tagLabel = (tag: string) => tag.replace(/-/g, " ");

// ---------- entry cards (Masterclass tab, school) ----------
export function QbankEntryCard() {
  const qt = useQbankT();
  const s = useQbank();
  const total = useMemo(() => allQuestions().length, []);
  const o = overall(s);
  return (
    <Pressable onPress={() => go("/exams")} accessibilityRole="button" accessibilityLabel={qt("title")}
      style={{ borderRadius: R.card, overflow: "hidden", backgroundColor: ST.bg, borderWidth: 1, borderColor: "rgba(201,166,94,0.45)", padding: 20, gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><SmallStar size={12} color={ST.gold} /><Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", color: ST.gold }}>{qt("titleTr")}</Text></View>
        <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 36, color: ST.gold }}>{"مركز الامتحانات"}</Text>
      </View>
      <Text style={{ fontFamily: FONT.display, fontSize: 28, lineHeight: 32, color: "#fff" }}>{qt("title")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: ST.textSoft }}>{qt("entryLead", { n: total })}</Text>
      {o.n ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: ST.cream }}>{`${qt("answered")} ${o.seen} · ${qt("accuracy")} ${pctText(o.acc)}`}</Text> : null}
      <View style={{ marginTop: 6, alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, height: 40, paddingHorizontal: 16, borderRadius: R.pill, backgroundColor: ST.gold }}>
        <Icon name="trophy" size={16} color={ST.bg} />
        <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: ST.bg }}>{qt("enter")}</Text>
      </View>
    </Pressable>
  );
}

/** for the school (al-Madrasa): the centre's grades per school subject (Kashf ad-darajāt) and the way in */
export function QbankSchoolCard() {
  const t = useTheme();
  const qt = useQbankT();
  const s = useQbank();
  const kashf = qbankKashf(s);
  const rows = Object.entries(kashf).filter(([, v]) => v !== null) as [string, number][];
  const passed = STAGES.filter((g) => s.mock[g]?.passed);
  return (
    <View style={{ gap: 12 }}>
      <QbankEntryCard />
      {rows.length || passed.length ? (
        <GoldCard>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: t.gold }}>{`${qt("title")} · Kashf ad-darajāt`}</Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {rows.map(([k, v]) => (
              <View key={k} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row" }}>
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{SUBJECTS.filter((x) => x.school === k).map((x) => qt(`s_${x.id}`)).join(", ")}</Text>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{pctText(v)}</Text>
                </View>
                <Bar value={v} />
              </View>
            ))}
            {passed.map((g) => <Text key={g} style={{ fontFamily: FONT.regular, fontSize: 13, color: t.accent }}>{`${qt("mockPassed")} · ${qt(`stage_${g}`)}`}</Text>)}
          </View>
        </GoldCard>
      ) : null}
    </View>
  );
}

// ---------- /exams ----------
export function QbankHome() {
  const t = useTheme();
  const qt = useQbankT();
  const s = useQbank();
  const ent = useEntitlement("qbank");
  const pro = ent.allowed;
  const o = overall(s);
  const stats = subjectStats(s);
  const counts = useMemo(() => countsBySubject(), []);
  const total = useMemo(() => allQuestions().length, []);
  const due = dueQuestions(s).length;
  const weak = weakestTopics(s, 5);
  const best = SUBJECTS.reduce((m, x) => Math.max(m, stats[x.id].rating), 0);
  const left = freeLeft(s);
  const lock = (href: string) => () => (pro ? go(href) : ent.upsell());
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic="مركز الامتحانات" eyebrow={qt("titleTr")} title={qt("title")} lead={qt("lead")}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <StatTile onStage value={String(o.seen)} label={qt("answered")} />
            <StatTile onStage value={pctText(o.acc)} label={qt("accuracy")} />
            <StatTile onStage value={o.n ? String(tierOfRating(best)) : "—"} label={qt("level")} />
          </View>
          <GoldButton title={qt("continue")} icon="play" onPress={() => go(sessionHref({ mode: "practice", n: 10 }))} />
          {!pro ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: ST.textSoft }}>{left ? qt("free", { n: left }) : qt("freeUsed")}</Text> : null}
        </PageHero>

        <View style={{ paddingHorizontal: 16, marginTop: 22, gap: 26 }}>
          <View style={{ flexDirection: "row", gap: 10, padding: 14, borderRadius: R.lg, borderWidth: 1, borderColor: t.gold, backgroundColor: t.surface }}>
            <Icon name="shield" size={18} color={t.gold} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{qt("reviewTitle")}</Text>
              <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{qt("reviewNote")}</Text>
            </View>
          </View>

          <GoldCard>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Icon name="flame" size={18} color={t.gold} />
              <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{qt("m_daily")}</Text>
              {!pro ? <ProBadge /> : null}
            </View>
            <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted, marginTop: 6 }}>{dailyDone(s) ? qt("dailyDone", { c: s.daily?.c ?? 0, n: 10 }) : qt("m_dailySub")}</Text>
            {!dailyDone(s) ? <GoldButton title={pro ? qt("dailyStart") : qt("unlock")} icon={pro ? "flame" : "lock"} onPress={lock(sessionHref({ mode: "daily" }))} style={{ marginTop: 12 }} /> : null}
          </GoldCard>

          <View>
            <SectionTitle title={qt("modes")} />
            <RowGroup>
              <LinkRow first icon="book" title={qt("m_practice")} subtitle={qt("m_practiceSub")} onPress={() => go(sessionHref({ mode: "practice", n: 10 }))} />
              <LinkRow icon="clock" title={qt("m_timed")} subtitle={qt("m_timedSub")} locked={!pro} onPress={lock(sessionHref({ mode: "timed", n: 20 }))} />
              <LinkRow icon="repeat" title={qt("m_drill")} subtitle={qt("m_drillSub")} locked={!pro} onPress={lock(sessionHref({ mode: "drill" }))} />
              <LinkRow icon="calendar" title={qt("m_srs")} subtitle={qt("m_srsSub", { n: due, m: inRepetition(s) })} locked={!pro} onPress={lock(sessionHref({ mode: "srs" }))} />
              <LinkRow icon="bookmark" title={qt("m_bookmarks")} subtitle={qt("m_bookmarksSub", { n: s.bm.length })} locked={!pro} onPress={lock("/exams/bookmarks")} />
              <LinkRow icon="speed" title={qt("m_stats")} subtitle={qt("m_statsSub")} locked={!pro} onPress={lock("/exams/stats")} />
            </RowGroup>
          </View>

          <View>
            <SectionTitle title={qt("stages")} />
            <View style={{ gap: 10 }}>
              {STAGES.map((g) => <StageCard key={g} g={g} s={s} pro={pro} upsell={ent.upsell} />)}
            </View>
          </View>

          <View>
            <SectionTitle title={qt("weakest")} />
            {weak.length ? (
              <RowGroup>
                {weak.map((w, k) => (
                  <LinkRow key={`${w.subject}/${w.tag}`} first={k === 0} icon={subjectMeta(w.subject)?.icon} title={tagLabel(w.tag)} subtitle={`${qt(`s_${w.subject}`)} · ${qt("topicAcc", { p: Math.round((w.acc ?? 0) * 100), n: w.n })}`}
                    locked={!pro} onPress={lock(sessionHref({ mode: "drill", subject: w.subject, tag: w.tag }))} />
                ))}
              </RowGroup>
            ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{qt("weakestEmpty")}</Text>}
          </View>

          <View>
            <SectionTitle title={qt("subjects")} />
            <RowGroup>
              {SUBJECTS.map((x, k) => {
                const st = stats[x.id];
                return (
                  <LinkRow key={x.id} first={k === 0} icon={x.icon} title={qt(`s_${x.id}`)} arabic={x.ar}
                    subtitle={`${qt("questions", { n: counts[x.id].total })}${st.n ? ` · ${pctText(st.acc)} · ${qt("tier", { n: tierOfRating(st.rating) })}` : ""}`}
                    onPress={() => go(`/exams/${x.id}`)} />
                );
              })}
            </RowGroup>
          </View>

          <QuestionLangPicker />
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{`${qt("countsTitle")}: ${total} · ${BANK_REVIEW.note}`}</Text>
        </View>
      </Page>
    </>
  );
}

function StageCard({ g, s, pro, upsell }: { g: QStage; s: QbankStore; pro: boolean; upsell: () => void }) {
  const t = useTheme();
  const qt = useQbankT();
  const open = stageOpen(g, s);
  const r = readiness(g, s);
  const m = s.mock[g];
  return (
    <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: open ? t.gold : t.line, backgroundColor: t.surface, padding: 16, gap: 10, opacity: open ? 1 : 0.8 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{qt(`stage_${g}`)}</Text>
          <Text style={{ fontFamily: ARABIC_FONT, fontSize: 15, lineHeight: 24, color: t.muted, textAlign: "left" }}>{STAGE_AR[g]}</Text>
        </View>
        {m?.passed ? <Icon name="checkCircle" color={t.accent} /> : !open ? <Icon name="lock" color={t.muted} size={17} /> : null}
      </View>
      {open ? (
        <>
          <View style={{ gap: 6 }}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink }}>{qt("readiness", { p: Math.round(r.value * 100) })}</Text>
            <Bar value={r.value} mark={r.pass} />
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{m ? (m.passed ? qt("mockPassed") : qt("mockBest", { p: Math.round(m.best * 100) })) : qt("mockNone")}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            <OutlineButton compact title={qt("practiceStage")} icon="book" onPress={() => (pro || g === 1 ? go(sessionHref({ mode: "practice", stage: g, n: 10 })) : upsell())} />
            <OutlineButton compact title={qt("m_mock")} icon={pro ? "trophy" : "lock"} onPress={() => (pro ? go(`/exams/mock?stage=${g}`) : upsell())} />
          </View>
        </>
      ) : <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted }}>{qt("stageLocked", { prev: qt(`stage_${g - 1}`) })}</Text>}
    </View>
  );
}

function QuestionLangPicker() {
  const qt = useQbankT();
  const s = useQbank();
  const cur = s.qlang ?? "auto";
  return (
    <View style={{ gap: 10 }}>
      <SectionTitle title={qt("questionLang")} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {([["auto", qt("ql_auto")], ["en", "English"], ["de", "Deutsch"], ["ar", "العربية"]] as const).map(([k, l]) => (
          <Chip key={k} label={l} selected={cur === k} onPress={() => setQuestionLang(k)} />
        ))}
      </View>
    </View>
  );
}

// ---------- /exams/[subject] ----------
export function QbankSubjectScreen({ id }: { id: string }) {
  const t = useTheme();
  const qt = useQbankT();
  const s = useQbank();
  const ent = useEntitlement("qbank");
  const pro = ent.allowed;
  const meta = subjectMeta(id);
  const counts = useMemo(() => countsBySubject(), []);
  if (!meta) return <Page><PageHero topInset back title={qt("empty")} /></Page>;
  const sub = meta.id;
  const st = subjectStats(s)[sub];
  const m45 = mastery45(sub, s);
  const sch = scholarOpen(sub, s);
  const tags = tagStats(s, sub).filter((x) => x.n >= 1).sort((a, b) => (a.acc ?? 0) - (b.acc ?? 0));
  const allTags = useMemo(() => [...new Set(allQuestions().filter((q) => q.s === sub).flatMap((q) => q.t))], [sub]);
  const lock = (href: string, free = false) => () => (pro || free ? go(href) : ent.upsell());
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arabic={meta.ar} eyebrow={`${qt("title")} · ${meta.tr}`} title={qt(`s_${sub}`)}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <StatTile onStage value={String(counts[sub].total)} label={qt("questions", { n: "" }).trim()} />
            <StatTile onStage value={pctText(st.acc)} label={qt("accuracy")} />
            <StatTile onStage value={st.n ? String(tierOfRating(st.rating)) : "—"} label={qt("level")} />
          </View>
          <GoldButton title={qt("m_practice")} icon="play" onPress={() => go(sessionHref({ mode: "practice", subject: sub, n: 10 }))} />
        </PageHero>
        <View style={{ paddingHorizontal: 16, marginTop: 22, gap: 24 }}>
          <View>
            <SectionTitle title={qt("stages")} />
            <RowGroup>
              {STAGES.map((g, k) => {
                const open = stageOpen(g, s);
                const free = g === 1;
                return (
                  <LinkRow key={g} first={k === 0} icon={open ? "book" : "lock"} title={qt(`stage_${g}`)} subtitle={open ? qt("questions", { n: counts[sub].stages[g] }) : qt("stageLocked", { prev: qt(`stage_${g - 1}`) })}
                    locked={!open || (!pro && !free)} onPress={open ? lock(sessionHref({ mode: "practice", subject: sub, stage: g, n: 10 }), free) : undefined}
                    right={open && pro ? <Pressable onPress={() => go(sessionHref({ mode: "timed", subject: sub, stage: g, n: 15 }))} accessibilityRole="button" accessibilityLabel={qt("timedStage")} hitSlop={8}><Icon name="clock" size={18} color={t.gold} /></Pressable> : undefined} />
                );
              })}
            </RowGroup>
          </View>

          <Panel title={qt("tiers")}>
            {TIERS.map((d) => {
              const n = counts[sub].tiers[d] ?? 0;
              const locked = d >= 6 && !sch;
              return (
                <View key={d} style={{ flexDirection: "row", alignItems: "center", gap: 10, opacity: locked ? 0.6 : 1 }}>
                  <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: d >= 6 ? "rgba(214,180,108,0.18)" : t.accentSoft }}>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 13, color: d >= 6 ? t.gold : t.accent }}>{d}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{qt(`tier_${d}`)}</Text>
                    <Text style={{ fontFamily: ARABIC_FONT, fontSize: 13, lineHeight: 20, color: t.muted, textAlign: "left" }}>{`${TIER_AR[d]} · ${qt("questions", { n })}`}</Text>
                  </View>
                  {locked ? <Icon name="lock" size={16} color={t.muted} /> : n && (pro || false) ? (
                    <Pressable onPress={() => go(sessionHref({ mode: "practice", subject: sub, tier: d, n: 10 }))} accessibilityRole="button" accessibilityLabel={`${qt("m_practice")} ${qt(`tier_${d}`)}`} hitSlop={8}>
                      <Icon name="chevronRight" size={16} color={t.muted} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: sch ? t.accent : t.muted }}>
              {sch ? qt("scholarOpen") : qt("scholarLocked", { n: MASTER_N, p: Math.round(MASTER_ACC * 100), have: m45.n, acc: Math.round(m45.acc * 100) })}
            </Text>
          </Panel>

          <View>
            <SectionTitle title={qt("topics")} />
            <RowGroup>
              {(tags.length ? tags.map((x) => x.tag) : allTags).slice(0, 40).map((tag, k) => {
                const x = tags.find((y) => y.tag === tag);
                return <LinkRow key={tag} first={k === 0} title={tagLabel(tag)} subtitle={x ? qt("topicAcc", { p: Math.round((x.acc ?? 0) * 100), n: x.n }) : undefined} locked={!pro} onPress={lock(sessionHref({ mode: "drill", subject: sub, tag }))} />;
              })}
            </RowGroup>
          </View>
        </View>
      </Page>
    </>
  );
}

// ---------- /exams/session ----------
function buildSession(mode: Mode, p: Record<string, string | undefined>, pro: boolean): Q[] {
  const s = readQbank();
  const subject = p.subject as QSubject | undefined;
  const stage = p.stage ? (Number(p.stage) as QStage) : undefined;
  const tier = p.tier ? (Number(p.tier) as Q["d"]) : undefined;
  const n = Math.max(5, Math.min(50, Number(p.n) || (mode === "timed" ? 20 : 10)));
  switch (mode) {
    case "practice": {
      if (!pro) return drawAdaptive(poolOf({ subject, tag: p.tag, free: true }, s), Math.min(n, freeLeft(s)), Math.random, s);
      return drawAdaptive(poolOf({ subject, stage, tag: p.tag, tier }, s), n, Math.random, s);
    }
    case "timed": return drawAdaptive(poolOf({ subject, stage, tag: p.tag }, s), n, Math.random, s, 80);
    case "drill": {
      if (p.ids) return p.ids.split(",").map((id) => questionById(id)).filter((q): q is Q => !!q);
      return weaknessDrill(15, { subject, tag: p.tag }, s);
    }
    case "daily": return dailyChallenge(s);
    case "bookmarks": return shuffleWith(s.bm.map((id) => questionById(id)).filter((q): q is Q => !!q), Math.random).slice(0, 30);
    case "srs": return dueQuestions(s).slice(0, 20);
    default: return [];
  }
}

export function QbankSessionScreen() {
  const t = useTheme();
  const qt = useQbankT();
  const p = useLocalSearchParams<Record<string, string>>();
  const mode = (["practice", "timed", "drill", "daily", "bookmarks", "srs"].includes(p.mode) ? p.mode : "practice") as Mode;
  const ent = useEntitlement("qbank");
  const pro = ent.allowed;
  const allowed = pro || (mode === "practice" && (!p.stage || p.stage === "1") && !p.tier);
  const [round, setRound] = useState(0);
  const questions = useMemo(() => (allowed ? buildSession(mode, p, pro) : []), [round, allowed]); // eslint-disable-line react-hooks/exhaustive-deps
  const [done, setDone] = useState<Answer[] | null>(null);
  const reward = useQbankRewards();
  const timed = mode === "timed";
  const title = qt(`m_${mode}`);
  const finish = (a: Answer[]) => {
    saveRun(mode, a, { s: p.subject as QSubject | undefined, g: p.stage ? (Number(p.stage) as QStage) : undefined });
    reward(a.filter((x) => x.ok).length, a.length);
    setDone(a);
  };
  const again = () => { setDone(null); setRound((r) => r + 1); };
  const sub = p.subject ? subjectMeta(p.subject) : undefined;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arcade={false} eyebrow={sub ? qt(`s_${sub.id}`) : qt("title")} title={title} arabic={sub?.ar} lead={timed && !done ? qt("timedLead", { n: questions.length, s: 60 }) : undefined} />
        <View style={{ padding: 16, gap: 16 }}>
          {!allowed ? (
            <GoldCard>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{qt("freeUsed")}</Text>
              <GoldButton title={qt("unlock")} icon="lock" onPress={ent.upsell} style={{ marginTop: 12 }} />
            </GoldCard>
          ) : done ? (
            <Results answers={done} mode={mode} onAgain={mode === "daily" ? undefined : again} />
          ) : questions.length ? (
            <Runner key={round} questions={questions} mode={mode} deferred={timed} questionSec={timed ? 60 : undefined} countFree={!pro} onDone={finish} />
          ) : (
            <GoldCard>
              <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>
                {mode === "srs" ? qt("noDue") : mode === "bookmarks" ? qt("noBookmarks") : !pro && mode === "practice" && !freeLeft() ? qt("freeUsed") : mode === "drill" ? qt("weakestEmpty") : qt("empty")}
              </Text>
              {!pro && mode === "practice" ? <GoldButton title={qt("unlock")} icon="lock" onPress={ent.upsell} style={{ marginTop: 12 }} /> : <OutlineButton title={qt("backHome")} onPress={() => router.replace("/exams" as Href)} style={{ marginTop: 12 }} />}
            </GoldCard>
          )}
          {!pro && allowed && !done ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{qt("free", { n: freeLeft() })}</Text> : null}
        </View>
      </Page>
    </>
  );
}

// ---------- /exams/mock ----------
export function QbankMockScreen() {
  const t = useTheme();
  const qt = useQbankT();
  const p = useLocalSearchParams<{ stage?: string }>();
  const g = (Math.min(4, Math.max(1, Number(p.stage) || 1))) as QStage;
  const ent = useEntitlement("qbank");
  const s = useQbank();
  const open = stageOpen(g, s);
  const ok = ent.allowed && open;
  const rule = QBANK_MOCK[g];
  const [run, setRun] = useState(false);
  const [idx, setIdx] = useState({ i: 0, open: false });
  const [sig, setSig] = useState(0);
  const [answers, setAnswers] = useState<Answer[] | null>(null);
  const mirror = useRef<Answer[]>([]);
  const reward = useQbankRewards();
  const saved = useRef(false);
  const ex = useExamSession(ok ? "qbank" : null, String(g), {
    active: run, questionIndex: idx.i, questionOpen: idx.open, onQuestionTimeout: () => setSig((x) => x + 1),
    onExpire: () => end(mirror.current),
  });
  const questions = useMemo(() => (ex.phase === "running" ? mockQuestions(g, rng(`${ex.nonce}|q`)) : []), [ex.nonce, ex.phase === "running"]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalRef = useRef(rule.questions);
  const end = (a: Answer[]) => {
    if (ex.phase !== "running") return;
    totalRef.current = questions.length || rule.questions;
    setAnswers(a);
    ex.finish(a.filter((x) => x.ok).length, totalRef.current);
  };
  // record the attempt once it is decided (finished: with the server's verdict when signed in; void: as void)
  useEffect(() => {
    if (saved.current || !answers && ex.phase !== "void") return;
    if (ex.phase === "finished") {
      saved.current = true;
      const a = answers ?? [];
      const total = totalRef.current;
      const local = a.filter((x) => x.ok).length / total >= rule.pass;
      const pass = local && (!ex.submitted || ex.submitted.result.passed);
      saveRun("mock", a, { g, pass, n: total });
      reward(a.filter((x) => x.ok).length, total, pass ? 60 : 0);
    } else if (ex.phase === "void") {
      saved.current = true;
      saveRun("mock", mirror.current, { g, pass: false, void: true });
    }
  }, [ex.phase, answers]); // eslint-disable-line react-hooks/exhaustive-deps
  const restart = () => { saved.current = false; mirror.current = []; setAnswers(null); setIdx({ i: 0, open: false }); setRun(false); };
  const total = totalRef.current;
  const c = answers?.filter((x) => x.ok).length ?? 0;
  const passed = answers ? c / total >= rule.pass && (!ex.submitted || ex.submitted.result.passed) : false;
  const weak = weakestTopics(s, 5);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arcade={false} arabic={STAGE_AR[g]} eyebrow={`${qt("title")} · ${qt(`stage_${g}`)}`} title={qt("mockTitle")}
          lead={qt("mockLead", { n: rule.questions, min: rule.questions, q: 90, p: Math.round(rule.pass * 100) })} />
        <View style={{ padding: 16, gap: 16 }}>
          {!ent.allowed ? (
            <GoldCard><GoldButton title={qt("unlock")} icon="lock" onPress={ent.upsell} /></GoldCard>
          ) : !open ? (
            <GoldCard><Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{qt("mockLocked")}</Text></GoldCard>
          ) : (
            <>
              <ExamBlocked session={ex} />
              {!run && ex.phase !== "blocked" ? (
                <GoldCard>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>{qt("mockAttempts", { n: s.mock[g]?.tries ?? 0 })}</Text>
                  <GoldButton title={qt("mockStart")} icon="trophy" onPress={() => { restart(); setRun(true); }} style={{ marginTop: 12 }} />
                </GoldCard>
              ) : null}
              <ExamBar session={ex} />
              {ex.phase === "running" && questions.length && !answers ? (
                <Runner key={ex.nonce} questions={questions} mode="mock" deferred questionLeft={ex.questionLeft} rand={rng(`${ex.nonce}|o`)} mirror={mirror}
                  timeoutSignal={sig} onIndex={(i, o) => setIdx({ i, open: o })} onDone={end} />
              ) : null}
              {ex.signedIn || ex.phase === "void" ? <ExamVerdict session={ex} /> : null}
              {ex.phase === "void" ? <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: GARNET }}>{qt("voidNote")}</Text> : null}
              {answers && (ex.phase === "finished" || ex.phase === "submitting") ? (
                <Results answers={answers} mode="mock" stage={g} passMark={rule.pass} onAgain={restart}
                  extra={<Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, lineHeight: 21, color: passed ? t.accent : GARNET }}>{passed ? qt("mockPass") : qt("mockFail", { p: Math.round(rule.pass * 100) })}</Text>} />
              ) : null}
              {answers && !passed && weak.length && ex.phase === "finished" ? (
                <RowGroup>
                  {weak.map((w, k) => <LinkRow key={`${w.subject}/${w.tag}`} first={k === 0} title={tagLabel(w.tag)} subtitle={`${qt(`s_${w.subject}`)} · ${qt("topicAcc", { p: Math.round((w.acc ?? 0) * 100), n: w.n })}`} onPress={() => go(sessionHref({ mode: "drill", subject: w.subject, tag: w.tag }))} />)}
                </RowGroup>
              ) : null}
              {ex.phase === "void" ? <OutlineButton title={qt("again")} icon="repeat" onPress={restart} /> : null}
            </>
          )}
        </View>
      </Page>
    </>
  );
}

// ---------- /exams/stats ----------
export function QbankStatsScreen() {
  const t = useTheme();
  const qt = useQbankT();
  const s = useQbank();
  const ent = useEntitlement("qbank");
  const o = overall(s);
  const stats = subjectStats(s);
  const tr = trend(s, 21);
  const tags = tagStats(s).filter((x) => x.n >= 3);
  const weak = weakestTopics(s, 6);
  const strong = [...tags].sort((a, b) => (b.acc ?? 0) - (a.acc ?? 0) || b.n - a.n).slice(0, 5);
  if (!ent.allowed) return (
    <Page><PageHero topInset back title={qt("statsTitle")} /><View style={{ padding: 16 }}><GoldCard><GoldButton title={qt("unlock")} icon="lock" onPress={ent.upsell} /></GoldCard></View></Page>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arcade={false} eyebrow={qt("title")} title={qt("statsTitle")}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <StatTile onStage value={String(o.seen)} label={qt("answered")} />
            <StatTile onStage value={pctText(o.acc)} label={qt("accuracy")} />
            <StatTile onStage value={o.ms ? qt("seconds", { s: Math.round(o.ms / 1000) }) : "—"} label={qt("time")} />
            <StatTile onStage value={String(o.sessions)} label={qt("sessions")} />
          </View>
        </PageHero>
        <View style={{ padding: 16, gap: 18 }}>
          <Panel title={qt("trendTitle")}>
            {tr.length ? (
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 4, height: 110 }} accessibilityLabel={tr.map((d) => `${d.d}: ${Math.round(d.acc * 100)} %`).join(", ")}>
                {tr.map((d) => (
                  <View key={d.d} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                    <View style={{ width: "100%", height: Math.max(4, d.acc * 90), borderRadius: 3, backgroundColor: d.acc >= 0.8 ? t.accent : d.acc >= 0.6 ? t.gold : GARNET }} />
                    <Text style={{ fontFamily: FONT.regular, fontSize: 9, color: t.muted }}>{d.d.slice(8)}</Text>
                  </View>
                ))}
              </View>
            ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{qt("trendEmpty")}</Text>}
          </Panel>

          <Panel title={qt("readinessTitle")}>
            {STAGES.map((g) => {
              const r = readiness(g, s);
              const m = s.mock[g];
              return (
                <View key={g} style={{ gap: 6, opacity: stageOpen(g, s) ? 1 : 0.55 }}>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{qt(`stage_${g}`)}</Text>
                    <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{`${Math.round(r.value * 100)} %`}</Text>
                  </View>
                  <Bar value={r.value} mark={r.pass} />
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{m ? (m.passed ? qt("mockPassed") : qt("mockBest", { p: Math.round(m.best * 100) })) : qt("mockNone")}</Text>
                </View>
              );
            })}
            <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted }}>{qt("readinessLead")}</Text>
          </Panel>

          <Panel title={qt("perSubject")}>
            {SUBJECTS.map((x) => {
              const st = stats[x.id];
              return (
                <Pressable key={x.id} onPress={() => go(`/exams/${x.id}`)} accessibilityRole="button" style={{ gap: 6 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{qt(`s_${x.id}`)}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>{st.n ? `${pctText(st.acc)} · ${qt("seconds", { s: Math.round((st.ms ?? 0) / 1000) })} · ${qt("tier", { n: tierOfRating(st.rating) })}` : qt("noData")}</Text>
                  </View>
                  <Bar value={st.acc ?? 0} />
                </Pressable>
              );
            })}
          </Panel>

          <Panel title={qt("weakest")}>
            {weak.length ? weak.map((w) => (
              <Pressable key={`${w.subject}/${w.tag}`} onPress={() => go(sessionHref({ mode: "drill", subject: w.subject, tag: w.tag }))} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{tagLabel(w.tag)}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{`${qt(`s_${w.subject}`)} · ${qt("topicAcc", { p: Math.round((w.acc ?? 0) * 100), n: w.n })}`}</Text>
                </View>
                <Pill text={qt("drill")} gold />
              </Pressable>
            )) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{qt("weakestEmpty")}</Text>}
          </Panel>

          {strong.length ? (
            <Panel title={qt("strongest")}>
              {strong.map((w) => <Text key={`${w.subject}/${w.tag}`} style={{ fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{`${tagLabel(w.tag)} · ${qt(`s_${w.subject}`)} · ${pctText(w.acc)}`}</Text>)}
            </Panel>
          ) : null}

          <Panel title={qt("history")}>
            {s.h.length ? s.h.slice(0, 12).map((h) => (
              <View key={h.at} style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13.5, color: h.void ? t.muted : t.ink }}>{`${qt(`m_${h.mode}`)}${h.g ? ` · ${qt(`stage_${h.g}`)}` : h.s ? ` · ${qt(`s_${h.s}`)}` : ""}`}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: h.pass ? t.accent : t.muted }}>{h.void ? "—" : qt("score", { c: h.c, n: h.n })}</Text>
              </View>
            )) : <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{qt("noData")}</Text>}
          </Panel>
        </View>
      </Page>
    </>
  );
}

// ---------- /exams/bookmarks ----------
export function QbankBookmarksScreen() {
  const t = useTheme();
  const qt = useQbankT();
  const lang = useQLang();
  const s = useQbank();
  const ent = useEntitlement("qbank");
  const [open, setOpen] = useState<string | null>(null);
  const items = s.bm.map((id) => questionById(id)).filter((q): q is Q => !!q);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back arcade={false} eyebrow={qt("title")} title={qt("m_bookmarks")} />
        <View style={{ padding: 16, gap: 14 }}>
          {!ent.allowed ? <GoldCard><GoldButton title={qt("unlock")} icon="lock" onPress={ent.upsell} /></GoldCard> : items.length ? (
            <>
              <GoldButton title={qt("start")} icon="play" onPress={() => go(sessionHref({ mode: "bookmarks" }))} />
              {items.map((q) => {
                const loc = locOf(q, lang);
                const isOpen = open === q.id;
                return (
                  <View key={q.id} style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, padding: 14, gap: 8 }}>
                    <Pressable onPress={() => setOpen(isOpen ? null : q.id)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
                      <Text style={{ fontFamily: lang === "ar" ? ARABIC_FONT : FONT.semibold, fontSize: lang === "ar" ? 17 : 14.5, lineHeight: lang === "ar" ? 28 : 21, color: t.ink, textAlign: lang === "ar" ? "right" : "left" }}>{loc[0]}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, marginTop: 4 }}>{`${qt(`s_${q.s}`)} · ${qt("tier", { n: q.d })}${q.v ? ` · ${qt("verseShown", { key: q.v })}` : ""}`}</Text>
                    </Pressable>
                    {isOpen ? <Explanation q={q} lang={lang} ok={null} correctText={loc[1][0]} /> : null}
                  </View>
                );
              })}
            </>
          ) : <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.muted }}>{qt("noBookmarks")}</Text>}
        </View>
      </Page>
    </>
  );
}
