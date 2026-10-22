import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, Segmented } from "@/components/brand";
import { ARABIC_FONT, AR_RIGHT, FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { loadVerse, type VerseData } from "@/features/srs/verse";
import { gEvent } from "@/features/feed/gamify";
import { success } from "@/features/feed/haptics";
import { useReduceMotion } from "@/features/coursekit/motion";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { MUT_CANDIDATES, MUT_GROUPS, MUT_REVIEW, MUT_SOURCES, candidateGroup, distinctPositions, dueMutGroups, isCandidate, type MutGroup } from "./mutData";
import { PromptedWords, SpeechCheck, type CheckResult } from "./recite";
import { reviewText, useRv } from "./review/text";
import { noteMut, noteWords } from "./store";
import { useS2 } from "./text";
import { Btn, Card, SourceNote, Term } from "./ui";
import { ContinueNext } from "./Continue";

// /shams/mutashabihat – the similar verses: study a group side by side (differing words in gold), then an interleaved
// drill (the groups are mixed, so the learner has to discriminate, not just repeat) with two kinds of questions:
// "which wording belongs here?" and "where is this verse?". Answers feed the quality score and the weak spots.
// Shams 3.0: a spoken mode ("continue after the shared beginning", checked by on-device speech recognition as words heard,
// confirmed by the learner), the due groups (more confused than right, or 14 days) and automatically found pairs
// (MUT_CANDIDATES, shown separately as not reviewed).
type Q = { kind: "complete" | "locate" | "speak"; key: string; group: MutGroup };

/** an automatically found pair as a group; its topic says that it is not reviewed */
export function autoGroup(a: string, b: string): MutGroup {
  return candidateGroup(a, b, { de: reviewText("de").candTopic, en: reviewText("en").candTopic, ar: reviewText("ar").candTopic });
}
/** a group by id from a link (?g=): a reviewed group or an automatic pair "auto-<a>-<b>" */
export function groupById(id: string): MutGroup | null {
  const g = MUT_GROUPS.find((x) => x.id === id);
  if (g) return g;
  const m = id.match(/^auto-(\d+:\d+)-(\d+:\d+)$/);
  return m && MUT_CANDIDATES.some(([a, b]) => a === m[1] && b === m[2]) ? autoGroup(m[1], m[2]) : null;
}

function useGroupData(groups: MutGroup[]) {
  const { lang } = useLang();
  const keys = useMemo(() => [...new Set(groups.flatMap((g) => g.keys))], [groups]);
  const [data, setData] = useState<Record<string, VerseData>>({});
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    setFailed(false);
    Promise.all(keys.map((k) => loadVerse(k, lang).then((d) => [k, d] as const)))
      .then((all) => { if (alive) setData(Object.fromEntries(all)); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [keys, lang]);
  const ready = keys.every((k) => data[k]);
  const distinct = useMemo(() => {
    const out: Record<string, number[]> = {};
    if (!ready) return out;
    for (const g of groups) for (const k of g.keys) out[k] = distinctPositions(data[k].words, g.keys.filter((x) => x !== k).map((x) => data[x].words));
    return out;
  }, [ready, data, groups]);
  return { data, ready, failed, distinct };
}

function ArWords({ d, mark, mask }: { d: VerseData; mark?: number[]; mask?: number[] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", direction: "rtl", flexWrap: "wrap", gap: 5 }}>
      {d.words.map((w) => {
        const hide = mask?.includes(w.position), m = mark?.includes(w.position);
        return (
          <Text key={w.position} style={{ fontFamily: ARABIC_FONT, fontSize: 23, lineHeight: 42, color: hide ? t.gold : m ? t.gold : t.ink, backgroundColor: m ? "rgba(201,166,94,0.16)" : "transparent", borderRadius: R.sm, paddingHorizontal: 3, writingDirection: "rtl" }}>
            {hide ? "…" : w.text}
          </Text>
        );
      })}
    </View>
  );
}

const shuffle = <T,>(xs: T[], seed: number) => { const a = [...xs]; let s = seed || 1; for (let i = a.length - 1; i > 0; i--) { s = (s * 1664525 + 1013904223) >>> 0; const j = s % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
/** interleave: no two questions of the same group in a row where it can be avoided */
function interleave(qs: Q[]): Q[] {
  const out: Q[] = [];
  const rest = [...qs];
  while (rest.length) { const i = rest.findIndex((q) => q.group.id !== out.at(-1)?.group.id); out.push(rest.splice(i < 0 ? 0 : i, 1)[0]); }
  return out;
}

export function MutashabihatScreen({ initial }: { initial?: string }) {
  const t = useTheme();
  const { s, cl, nf } = useS2();
  const { name } = useSurahNames();
  const { known, mut } = useShams2();
  const rv = useRv();
  const reduce = useReduceMotion();
  const due = useMemo(() => dueMutGroups(MUT_GROUPS, mut, known), [mut, known]);
  const [candScope, setCandScope] = useState<"mine" | "all">("mine");
  const [candN, setCandN] = useState(8);
  const candMine = useMemo(() => MUT_CANDIDATES.filter(([a, b]) => known.has(a) || known.has(b)), [known]);
  const cands = candScope === "mine" && candMine.length ? candMine : MUT_CANDIDATES;
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const mine = useMemo(() => MUT_GROUPS.filter((g) => g.keys.some((k) => known.has(k))), [known]);
  const groups = scope === "mine" && mine.length ? mine : MUT_GROUPS;
  const [study, setStudy] = useState<MutGroup | null>(() => (initial && initial !== "due" ? groupById(initial) : null));
  const [drill, setDrill] = useState<MutGroup[] | null>(() => (initial === "due" && due.length ? due.slice(0, 6) : null));
  const ref = (k: string) => { const [a, b] = k.split(":"); return `${name(Number(a))} ${nf(Number(b))}`; };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="مُتَشابِهات الألفاظ" title={s("mutTitle")} lead={s("mutLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          {drill ? <Drill groups={drill} onClose={() => setDrill(null)} reduce={reduce} refOf={ref} /> : study ? <Study g={study} onBack={() => setStudy(null)} onDrill={() => setDrill([study])} refOf={ref} /> : (
            <>
              <Term id="mutashabihat" />
              {mine.length ? <Segmented value={scope} options={[["mine", s("inMyHifz")], ["all", s("allGroups")]]} onChange={setScope} /> : <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{s("mutNoneYet")}</Text>}
              {due.length ? (
                <Card gold>
                  <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{rv("dueTitle")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{rv("dueLead", { n: nf(due.length) })}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }} numberOfLines={2}>{due.slice(0, 6).map((g) => g.topic[cl] || g.topic.en).join(" · ")}</Text>
                  <GoldButton title={rv("dueStart")} onPress={() => setDrill(due.slice(0, 6))} />
                </Card>
              ) : null}
              <GoldButton title={s("startDrill")} onPress={() => setDrill(shuffle(groups, Date.now() % 9973).slice(0, 6))} />
              {groups.map((g) => (
                <Pressable key={g.id} onPress={() => setStudy(g)} accessibilityRole="button" accessibilityLabel={g.topic[cl]}
                  style={({ pressed }) => ({ padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, gap: 4, opacity: pressed ? 0.85 : 1 })}>
                  <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{g.topic[cl] || g.topic.en}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{g.keys.map(ref).join(" · ")}</Text>
                </Pressable>
              ))}
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{s("mutNote")}</Text>
              <Card>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{rv("candTitle")}</Text>
                <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{rv("candLead")}</Text>
                {candMine.length ? <Segmented value={candScope} options={[["mine", rv("candMine")], ["all", rv("candAll")]]} onChange={(x) => { setCandScope(x); setCandN(8); }} /> : null}
                {cands.slice(0, candN).map(([a, b, p]) => (
                  <Pressable key={`${a}-${b}`} onPress={() => setStudy(autoGroup(a, b))} accessibilityRole="button" accessibilityLabel={`${ref(a)} · ${ref(b)}, ${rv("candSim", { p: nf(p) })}`}
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line, opacity: pressed ? 0.8 : 1 })}>
                    <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 14, color: t.ink, textAlign: "left" }}>{`${ref(a)} · ${ref(b)}`}</Text>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.gold }}>{rv("candSim", { p: nf(p) })}</Text>
                  </Pressable>
                ))}
                {cands.length > candN ? <Btn title={rv("candMore")} onPress={() => setCandN(candN + 12)} /> : null}
                <SourceNote src={["quranApi"]} review={{ status: "draft" }} />
              </Card>
              <SourceNote src={[...MUT_SOURCES, "interleave", "quranApi"]} review={MUT_REVIEW} />
            </>
          )}
        </View>
      </Page>
    </>
  );
}

function Study({ g, onBack, onDrill, refOf }: { g: MutGroup; onBack: () => void; onDrill: () => void; refOf: (k: string) => string }) {
  const t = useTheme();
  const { s, cl } = useS2();
  const rv = useRv();
  const groups = useMemo(() => [g], [g]);
  const { data, ready, failed, distinct } = useGroupData(groups);
  return (
    <View style={{ gap: 12 }}>
      <Btn icon="chevronLeft" title={s("back")} onPress={onBack} />
      {/* an automatic pair carries its topic only in de/en/ar: the title comes from the texts in every language */}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.display, fontSize: 21, color: t.ink, textAlign: "left" }}>{isCandidate(g) ? rv("candTopic") : g.topic[cl] || g.topic.en}</Text>
      {failed ? <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("loadFailed")}</Text> : !ready ? <Loading /> : g.keys.map((k) => (
        <Card key={k}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.gold, textAlign: "left" }}>{refOf(k)}</Text>
          <ArWords d={data[k]} mark={distinct[k]} />
          {data[k].translation ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 19, color: t.muted, textAlign: "left" }}>{data[k].translation}</Text> : null}
        </Card>
      ))}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{s("goldDiff")}</Text>
      <GoldButton title={s("drillGroup")} onPress={onDrill} />
      <SourceNote src={isCandidate(g) ? ["quranApi"] : [...MUT_SOURCES, "quranApi"]} review={isCandidate(g) ? { status: "draft" } : MUT_REVIEW} />
    </View>
  );
}

function Drill({ groups, onClose, reduce, refOf }: { groups: MutGroup[]; onClose: () => void; reduce: boolean; refOf: (k: string) => string }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const rv = useRv();
  const { data, ready, failed, distinct } = useGroupData(groups);
  const [mode, setMode] = useState<"tap" | "speak">("tap");
  // a verse with no word of its own (all its words are in a similar verse of the group) gets no "complete" and no
  // spoken question: nothing could be asked or marked; "where is this verse?" still works
  const qs = useMemo(() => {
    const own = (key: string) => (distinct[key]?.length ?? 0) > 0;
    return interleave(shuffle(groups.flatMap((g) => g.keys.flatMap<Q>((key) => (mode === "speak" ? (own(key) ? [{ kind: "speak" as const, key, group: g }] : []) : [...(own(key) ? [{ kind: "complete" as const, key, group: g }] : []), { kind: "locate" as const, key, group: g }]))), groups.length * 7 + 3));
  }, [groups, mode, distinct]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [right, setRight] = useState(0);
  if (failed) return <Text style={{ color: t.muted, fontFamily: FONT.regular }}>{s("loadFailed")}</Text>;
  if (!ready) return <Loading />;
  if (i >= qs.length) {
    return (
      <Card gold>
        <Text style={{ fontFamily: FONT.display, fontSize: 22, color: t.ink }}>{s("drillDone", { n: nf(right), total: nf(qs.length) })}</Text>
        <Btn primary title={s("again")} onPress={() => { setI(0); setRight(0); setPicked(null); }} />
        <Btn title={s("back")} onPress={onClose} />
        <ContinueNext />
      </Card>
    );
  }
  const q = qs[i];
  const toggle = <Segmented value={mode} options={[["tap", rv("modeTap")], ["speak", rv("modeSpeak")]]} onChange={(x) => { setMode(x); setI(0); setRight(0); setPicked(null); }} />;
  if (q.kind === "speak") {
    return (
      <View style={{ gap: 12 }}>
        {toggle}
        <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{`${nf(i + 1)} / ${nf(qs.length)}`}</Text>
        <Spoken key={`${i}:${q.key}`} d={data[q.key]} distinct={distinct[q.key]} refText={refOf(q.key)}
          onDone={(ok) => { if (ok) { setRight(right + 1); if (!reduce) success(); } setI(i + 1); }} />
      </View>
    );
  }
  const seg = (k: string) => distinct[k].map((p) => data[k].words.find((w) => w.position === p)?.text ?? "").join(" ");
  const options = q.kind === "complete" ? [...new Map(q.group.keys.filter((k) => distinct[k]?.length).map((k) => [seg(k), k])).entries()].map(([label, k]) => ({ id: k, label })) : q.group.keys.map((k) => ({ id: k, label: refOf(k) }));
  const isRight = (id: string) => (q.kind === "complete" ? seg(id) === seg(q.key) : id === q.key);
  const answer = (id: string) => {
    if (picked) return;
    setPicked(id);
    const ok = isRight(id);
    if (ok) { setRight(right + 1); if (!reduce) success(); }
    noteMut(q.key, ok);
    if (!ok) noteWords(q.key, distinct[q.key].map((p) => ({ position: p, ok: false })));
    gEvent({ t: "quiz", right: ok });
  };
  return (
    <View style={{ gap: 12 }}>
      {toggle}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.muted }}>{`${nf(i + 1)} / ${nf(qs.length)}`}</Text>
      <Card gold>
        <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{q.kind === "complete" ? s("qComplete", { ref: refOf(q.key) }) : s("qLocate")}</Text>
        <ArWords d={data[q.key]} mask={q.kind === "complete" && !picked ? distinct[q.key] : undefined} mark={picked ? distinct[q.key] : undefined} />
      </Card>
      {options.map((o) => {
        const ok = isRight(o.id), chosen = picked === o.id;
        const border = !picked ? t.line : ok ? t.accent : chosen ? "rgb(160,58,52)" : t.line;
        return (
          <Pressable key={o.id} onPress={() => answer(o.id)} accessibilityRole="button" accessibilityState={{ selected: chosen, disabled: !!picked }}
            style={{ padding: 14, borderRadius: R.card, borderWidth: 1.5, borderColor: border, backgroundColor: picked && ok ? t.accentSoft : t.surface }}>
            <Text style={q.kind === "complete" ? { fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 40, color: t.ink, textAlign: AR_RIGHT, writingDirection: "rtl" } : { fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{o.label}</Text>
          </Pressable>
        );
      })}
      {picked ? (
        <>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: isRight(picked) ? t.accent : t.gold }}>{isRight(picked) ? s("right") : s("wrongRef", { ref: refOf(q.key) })}</Text>
          <GoldButton title={s("next")} onPress={() => { setPicked(null); setI(i + 1); }} />
        </>
      ) : null}
    </View>
  );
}

/** spoken question: the shared beginning is shown, the learner recites the rest; the word check only says which of the
 *  differing words were heard, the learner confirms the answer (never a pronunciation score) */
function Spoken({ d, distinct, refText, onDone }: { d: VerseData; distinct: number[]; refText: string; onDone: (ok: boolean) => void }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const rv = useRv();
  const key = d.key;
  const first = Math.min(...distinct);
  const cue = useMemo(() => d.words.filter((w) => w.position < first).map((w) => ({ position: w.position, text: w.text })), [d, first]);
  const rest = useMemo(() => d.words.filter((w) => w.position >= first).map((w) => ({ position: w.position, text: w.text })), [d, first]);
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [shown, setShown] = useState(false);
  const heard = check ? rest.filter((w, j) => distinct.includes(w.position) && check.ok[j]).length : 0;
  const answer = (ok: boolean) => {
    noteMut(key, ok);
    noteWords(key, distinct.map((p) => ({ position: p, ok })));
    gEvent({ t: "quiz", right: ok });
    onDone(ok);
  };
  return (
    <Card gold>
      <Text style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{cue.length ? rv("qSpeak", { ref: refText }) : rv("qSpeakNoCue", { ref: refText })}</Text>
      {cue.length ? <PromptedWords words={cue} prompt="full" size={23} /> : null}
      <SpeechCheck words={rest} pass={0.8} onResult={setCheck} compact />
      {check ? <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: heard === distinct.length ? t.accent : t.gold, textAlign: "left" }}>{rv("spokenHeard", { n: nf(heard), total: nf(distinct.length) })}</Text> : null}
      {shown || check ? <ArWords d={d} mark={distinct} /> : <Btn icon="eye" title={rv("showVerse")} onPress={() => setShown(true)} />}
      {shown || check ? (
        <>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink, textAlign: "left" }}>{rv("spokenRate")}</Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Btn title={rv("confused")} onPress={() => answer(false)} />
            <Btn primary title={rv("rightWording")} onPress={() => answer(true)} />
          </View>
        </>
      ) : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 11.5, color: t.muted, textAlign: "left" }}>{s("goldDiff")}</Text>
    </Card>
  );
}
