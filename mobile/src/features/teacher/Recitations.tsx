import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, OutlineButton, Segmented } from "@/components/brand";
import { Icon } from "@/components/icons";
import { ARABIC_FONT, FONT, R, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { intlLocale, useLang } from "@/i18n";
import { useIntl } from "@/features/srs/format";
import { ServerAudio } from "@/features/mishary/Mentoring";
import { SafetyButton } from "@/features/mishary/safety";
import { useSurahVerses, wordsOf } from "@/features/reciter-path/useVerse";
import { useSurahNames } from "@/features/shams2/names";
import { noteWords } from "@/features/shams2/store";
import { RUBRIC_FIELDS, noteRubric, readRecitations, saveRecitations, type RubricField } from "@/features/shams2/store2";
import { Card } from "@/features/shams2/ui";
import { RL, type Recitation, type RecRubric } from "./api";
import { useRecSafety } from "./safety";
import { useRt, type RtKey } from "./rec/text";

// /teacher/recitations – recordings sent to a teacher and their feedback (Shams 3.0, step 2 of "send to teacher").
// Student: own recordings, withdraw (deletes the file), the teacher's feedback – marked words go to the weak words
// (noteWords), the ratings to the pronunciation rubric as side "teacher" (rubric.v1), once per feedback. Teacher:
// the inbox of active links, listen, tap the words that need work (words from the word data, never typed), rate
// 1–5 per area (each optional), a short note. Report and block on both sides (guideline 1.2).
const RLABEL: Record<RubricField, RtKey> = { makharij: "r_makharij", tajweed: "r_tajweed", waqf: "r_waqf", pace: "r_pace" };
type Item = Recitation & { appliedAt?: string };

/** keeps the local "applied" marks when the server list replaces the cache */
function cacheList(box: "mine" | "inbox", list: Recitation[]) {
  const prev = new Map(readRecitations()[box].map((x) => [x.id, x as Item]));
  saveRecitations(box, list.map((x) => ({ ...x, ...(prev.get(x.id)?.appliedAt ? { appliedAt: prev.get(x.id)!.appliedAt } : {}) })));
}

export function useRecTitle() {
  const rt = useRt();
  const { name } = useSurahNames();
  const nf = useIntl();
  return (r: Recitation) => {
    const k = rt(`k_${r.kind}` as RtKey, { l: r.letter ?? "" });
    const range = r.surah ? `${name(r.surah)} ${nf(r.from ?? 1)}–${nf(r.to ?? 1)}` : "";
    return [k, range].filter(Boolean).join(" · ");
  };
}

export function RecitationsScreen() {
  const t = useTheme();
  const rt = useRt();
  const { user } = useAuth();
  const title = useRecTitle();
  const { lang } = useLang();
  const [box, setBox] = useState<"mine" | "inbox">("mine");
  const [rows, setRows] = useState<Item[] | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    if (!user) return;
    setMsg("");
    const cached = readRecitations()[box] as Item[];
    if (cached.length) setRows(cached);
    try { const r = await RL.list(box); cacheList(box, r.recitations); setRows(readRecitations()[box] as Item[]); } catch { setMsg(rt("err_generic")); setRows((x) => x ?? []); }
  }, [box, user]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => { setRows(null); void load(); }, [box]); // eslint-disable-line react-hooks/exhaustive-deps
  const date = (s: string) => new Date(s).toLocaleDateString(intlLocale(lang), { dateStyle: "medium" });
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Shams 3.0" arabic="العَرْضُ على الشَّيْخ" title={rt("recT")} lead={rt("recLead")} />
        <View style={{ padding: 16, gap: 12 }}>
          {!user ? (
            <Card><Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{rt("signIn")}</Text><GoldButton title={rt("openLink")} onPress={() => router.push("/teacher" as Href)} /></Card>
          ) : (
            <>
              <Segmented value={box} options={[["mine", rt("mine")], ["inbox", rt("inbox")]]} onChange={setBox} />
              {msg ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.danger, textAlign: "left" }}>{msg}</Text> : null}
              {rows === null ? <Loading /> : !rows.length ? (msg ? null : (
                <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "left" }}>{rt(box === "mine" ? "none" : "noneInbox")}</Text>
              )) : rows.map((r) => {
                const who = box === "mine" ? r.teacher : r.student;
                return (
                  <Pressable key={r.id} onPress={() => router.push(`/teacher/recitation/${r.id}` as Href)} accessibilityRole="button" accessibilityLabel={title(r)}
                    style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: r.status === "open" && box === "inbox" ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: r.status === "reviewed" ? t.accentSoft : "rgba(201,166,94,0.14)" }}>
                      {r.letter ? <Text style={{ fontFamily: ARABIC_FONT, fontSize: 22, lineHeight: 34, color: t.ink }}>{r.letter}</Text> : <Icon name={r.status === "reviewed" ? "checkCircle" : "clock"} size={18} color={r.status === "reviewed" ? t.accent : t.gold} />}
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{title(r)}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>
                        {[who ? rt(box === "mine" ? "to" : "from", { t: who.name }) : "", rt(`st_${r.status}` as RtKey), date(r.at)].filter(Boolean).join(" · ")}
                      </Text>
                    </View>
                    <Icon name="chevronRight" size={16} color={t.muted} />
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      </Page>
    </>
  );
}

/** applies the teacher's feedback once: marked words as misses, ratings as the teacher's rubric for every verse */
function applyFeedback(r: Recitation) {
  if (!r.review || !r.surah || !r.from || !r.to) return;
  const cached = (readRecitations().mine as Item[]).find((x) => x.id === r.id);
  if (cached?.appliedAt === r.review.at) return;
  const byVerse = new Map<string, number[]>();
  for (const m of r.review.marks) { const [s, v, p] = m.split(":").map(Number); const k = `${s}:${v}`; byVerse.set(k, [...(byVerse.get(k) ?? []), p]); }
  for (const [k, ps] of byVerse) noteWords(k, ps.map((position) => ({ position, ok: false })));
  const scores: RecRubric = {};
  for (const f of RUBRIC_FIELDS) if (typeof r.review[f] === "number") scores[f] = r.review[f];
  if (Object.keys(scores).length) for (let v = r.from; v <= Math.min(r.to, r.from + 29); v++) noteRubric(`${r.surah}:${v}`, scores, "teacher", r.teacher?.name);
  const all = readRecitations().mine as Item[];
  saveRecitations("mine", all.some((x) => x.id === r.id) ? all.map((x) => (x.id === r.id ? { ...x, ...r, appliedAt: r.review!.at } : x)) : [{ ...r, appliedAt: r.review.at }, ...all]);
}

export function RecitationDetail() {
  const t = useTheme();
  const rt = useRt();
  const nf = useIntl();
  const title = useRecTitle();
  const { lang } = useLang();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [d, setD] = useState<{ recitation: Recitation; role: "student" | "teacher" } | null>(null);
  const [err, setErr] = useState("");
  const [applied, setApplied] = useState(false);
  const load = useCallback(async () => {
    try {
      const x = await RL.get(String(id));
      setD(x);
      if (x.role === "student" && x.recitation.review) { const before = (readRecitations().mine as Item[]).find((y) => y.id === x.recitation.id)?.appliedAt; applyFeedback(x.recitation); setApplied(before !== x.recitation.review.at); }
    } catch (e) { setErr(e instanceof ApiError && e.status === 404 ? rt("deleted") : rt("err_generic")); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const safe = useRecSafety(() => router.back());
  const r = d?.recitation;
  const other = d ? (d.role === "student" ? r?.teacher : r?.student) : null;
  const date = (s: string) => new Date(s).toLocaleDateString(intlLocale(lang), { dateStyle: "medium" });
  const withdraw = () => {
    const run = () => void RL.withdraw(String(id)).then(() => router.back()).catch(() => setErr(rt("err_generic")));
    if (Platform.OS === "web") { run(); return; }
    Alert.alert(rt("withdraw"), rt("withdrawAsk"), [{ text: rt("cancel"), style: "cancel" }, { text: rt("withdraw"), style: "destructive", onPress: run }]);
  };
  const sum = r ? [
    r.summary.self ? rt("sumSelf", { n: nf(r.summary.self) }) : "",
    r.summary.quizOk !== undefined || r.summary.quizMiss !== undefined ? rt("sumQuiz", { n: `${nf(r.summary.quizOk ?? 0)} / ${nf((r.summary.quizOk ?? 0) + (r.summary.quizMiss ?? 0))}` }) : "",
    r.summary.heardTotal ? rt("sumHeard", { n: `${nf(r.summary.heardOk ?? 0)} / ${nf(r.summary.heardTotal)}` }) : "",
  ].filter(Boolean) : [];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={rt("recT")} arabic={r?.letter ?? "العَرْض"} title={r ? title(r) : rt("loading")} lead={r && other ? rt(d!.role === "student" ? "to" : "from", { t: other.name }) : undefined} />
        <View style={{ padding: 16, gap: 14 }}>
          {err ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 14, color: t.danger, textAlign: "left" }}>{err}</Text> : null}
          {safe.note ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, textAlign: "left" }}>{safe.note}</Text> : null}
          {!d && !err ? <Loading /> : null}
          {d && r ? (
            <>
              <Card gold>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Text style={{ flex: 1, fontFamily: FONT.semibold, fontSize: 13, color: t.muted, textAlign: "left" }}>{[rt(`st_${r.status}` as RtKey), date(r.at)].join(" · ")}</Text>
                  {other ? <SafetyButton label={rt("safetyFor", { name: `@${other.username}` })} onPress={() => safe.memberMenu(other)} /> : null}
                </View>
                {r.hasAudio ? <ServerAudio path={RL.audioPath(r.id)} /> : <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "left" }}>{rt("deleted")}</Text>}
                {r.hasAudio ? <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{rt("expires", { d: date(r.expiresAt) })}</Text> : null}
                {sum.length ? (
                  <View style={{ gap: 2 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.ink, textAlign: "left" }}>{rt("summaryT")}</Text>
                    {sum.map((x) => <Text key={x} style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{x}</Text>)}
                  </View>
                ) : null}
                <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
                  {d.role === "teacher" ? <OutlineButton compact icon="flag" title={rt("reportRec")} onPress={() => safe.reportRecitation(r.id)} /> : null}
                  {d.role === "student" ? <OutlineButton compact title={rt("withdraw")} onPress={withdraw} /> : null}
                </View>
              </Card>
              {d.role === "teacher" ? <ReviewForm r={r} onSaved={() => void load()} /> : (
                <Card>
                  <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{rt("feedback")}</Text>
                  {!r.review ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "left" }}>{rt("noFeedback")}</Text> : (
                    <>
                      <Ratings value={r.review} />
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{rt("teacherRating")}</Text>
                      {r.surah ? <WordMarks r={r} marks={new Set(r.review.marks)} /> : null}
                      {r.review.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink, textAlign: "left" }}>{r.review.text}</Text> : null}
                      {applied ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, lineHeight: 18, color: t.accent, textAlign: "left" }}>{rt("applied")}</Text> : null}
                      <OutlineButton compact icon="flag" title={rt("reportFb")} onPress={() => safe.reportReview(r.id)} />
                    </>
                  )}
                </Card>
              )}
            </>
          ) : null}
          {safe.sheet}
        </View>
      </Page>
    </>
  );
}

function Ratings({ value }: { value: RecRubric }) {
  const t = useTheme();
  const rt = useRt();
  const rows = RUBRIC_FIELDS.filter((k) => typeof value[k] === "number");
  return (
    <View style={{ gap: 6 }}>
      {rows.map((k) => (
        <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink, textAlign: "left" }}>{rt(RLABEL[k])}</Text>
          <View style={{ flexDirection: "row", gap: 4 }}>{[1, 2, 3, 4, 5].map((n) => <View key={n} style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: n <= (value[k] ?? 0) ? "#c6a65e" : t.line }} />)}</View>
        </View>
      ))}
    </View>
  );
}

/** the words of the range from the word data; tappable for the teacher, highlighted for the student */
function WordMarks({ r, marks, onToggle }: { r: Recitation; marks: Set<string>; onToggle?: (ref: string) => void }) {
  const t = useTheme();
  const rt = useRt();
  const nf = useIntl();
  const { verses } = useSurahVerses(r.surah);
  const list = useMemo(() => (verses ?? []).filter((v) => v.verse_number >= (r.from ?? 1) && v.verse_number <= (r.to ?? 0)), [verses, r.from, r.to]);
  if (!verses) return <Loading />;
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink, textAlign: "left" }}>{onToggle ? rt("marksLead") : rt("marksT")}</Text>
      {list.map((v) => (
        <View key={v.verse_key} style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          {wordsOf(v).map((w) => {
            const ref = `${v.verse_key}:${w.position}`;
            const on = marks.has(ref);
            return (
              <Pressable key={ref} disabled={!onToggle} onPress={() => onToggle?.(ref)} accessibilityRole={onToggle ? "button" : "text"} accessibilityState={{ selected: on }} accessibilityLabel={`${v.verse_key} ${w.position}`}
                style={{ paddingHorizontal: 8, borderRadius: 12, borderWidth: on ? 1.5 : 0, borderColor: t.danger, backgroundColor: on ? (t.dark ? "rgba(214,120,110,0.16)" : "rgba(160,58,52,0.08)") : "transparent" }}>
                <Text style={{ fontFamily: ARABIC_FONT, fontSize: 24, lineHeight: 42, color: t.ink, writingDirection: "rtl" }}>{w.text_uthmani}</Text>
              </Pressable>
            );
          })}
          <Text style={{ fontFamily: FONT.semibold, fontSize: 11.5, color: t.gold }}>{`(${nf(v.verse_number)})`}</Text>
        </View>
      ))}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted, textAlign: "left" }}>{marks.size ? rt("marked", { n: nf(marks.size) }) : rt("noMarks")}</Text>
    </View>
  );
}

function ReviewForm({ r, onSaved }: { r: Recitation; onSaved: () => void }) {
  const t = useTheme();
  const rt = useRt();
  const nf = useIntl();
  const [scores, setScores] = useState<RecRubric>(() => Object.fromEntries(RUBRIC_FIELDS.flatMap((k) => (typeof r.review?.[k] === "number" ? [[k, r.review[k]]] : []))));
  const [marks, setMarks] = useState<Set<string>>(() => new Set(r.review?.marks ?? []));
  const [text, setText] = useState(r.review?.text ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const toggle = (ref: string) => setMarks((m) => { const n = new Set(m); if (n.has(ref)) n.delete(ref); else n.add(ref); return n; });
  const empty = !Object.keys(scores).length && !marks.size && !text.trim();
  const send = async () => {
    setBusy(true); setMsg(null);
    try { await RL.review(r.id, { ...scores, marks: [...marks], text: text.trim() }); setMsg({ ok: true, text: rt("saved") }); onSaved(); }
    catch (e) { setMsg({ ok: false, text: rt(e instanceof ApiError && e.code === "text_not_allowed" ? "err_text" : "err_generic") }); }
    setBusy(false);
  };
  return (
    <Card>
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{rt("yourFeedback")}</Text>
      {r.surah ? <WordMarks r={r} marks={marks} onToggle={toggle} /> : null}
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, lineHeight: 17, color: t.muted, textAlign: "left" }}>{rt("ratingHint")}</Text>
      {RUBRIC_FIELDS.map((k) => (
        <View key={k} style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink, textAlign: "left" }}>{rt(RLABEL[k])}</Text>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = scores[k] === n;
              return (
                <Pressable key={n} onPress={() => setScores((s) => { const x = { ...s }; if (x[k] === n) delete x[k]; else x[k] = n; return x; })} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${rt(RLABEL[k])} ${nf(n)}`}
                  style={({ pressed }) => ({ flex: 1, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: on ? "#c6a65e" : t.line, backgroundColor: on ? "rgba(201,166,94,0.18)" : t.surface, opacity: pressed ? 0.8 : 1 })}>
                  <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{nf(n)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
      <TextInput value={text} onChangeText={(v) => setText(v.slice(0, 600))} placeholder={rt("note")} placeholderTextColor={t.muted} multiline accessibilityLabel={rt("note")}
        style={{ minHeight: 84, borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 12, fontFamily: FONT.regular, fontSize: 15, color: t.ink, backgroundColor: t.surface, textAlignVertical: "top", textAlign: "left" }} />
      <GoldButton icon="send" title={rt("sendFeedback")} busy={busy} disabled={empty} onPress={() => void send()} />
      {msg ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.semibold, fontSize: 13, color: msg.ok ? t.gold : t.danger, textAlign: "left" }}>{msg.text}</Text> : null}
    </Card>
  );
}

/** entry card on the teacher screen */
export function RecitationsCard() {
  const t = useTheme();
  const rt = useRt();
  return (
    <Pressable onPress={() => router.push("/teacher/recitations" as Href)} accessibilityRole="button" accessibilityLabel={`${rt("openRecs")}. ${rt("openRecsSub")}`}
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: "rgba(201,166,94,0.55)", backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
      <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(201,166,94,0.14)" }}><Icon name="speaker" size={17} color={t.gold} /></View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left" }}>{rt("openRecs")}</Text>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{rt("openRecsSub")}</Text>
      </View>
      <Icon name="chevronRight" size={16} color={t.muted} />
    </Pressable>
  );
}
