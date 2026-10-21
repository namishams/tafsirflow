import { useEffect, useState, type ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { Page, PageHero } from "@/components/page";
import { useAuth } from "@/lib/auth";
import { FONT, R, useTheme } from "@/lib/theme";
import { mediaSource } from "@/features/talents/api";
import { BadgeButton } from "@/features/talents/badges";
import { TalentAvatar } from "@/features/talents/ui";
import { VerseWords } from "@/features/reciter-path/Practice";
import { useVerse } from "@/features/reciter-path/useVerse";
import { M, RUBRIC, errCode, type Member, type MentoringMe, type Review, type RubricKey, type Submission } from "./api";
import { useMt, type MtKey } from "./texts";
import { Card, Chip, ErrorText, Muted, Recorder, Row, Section, useLoad, type Take } from "./ui";
import { STUDY_VERSES } from "./StyleStudy";
import { MentoringSafetyBar, SafetyButton, useMentoringSafety } from "./safety";

// Mentoring (no video): text + audio review by a verified master the student is connected with. Recordings are
// 30–60 s, recorded here, private on the server (MEDIA_DIR) and deleted after 60 days. Every member row, recording
// and review of someone else can be reported, every member blocked (./safety.tsx, App Store guideline 1.2).

const href = (p: string) => p as Href;
export function useErr() {
  const mt = useMt();
  return (e: unknown) => {
    const c = errCode(e);
    const k = `e_${c}` as MtKey;
    const msg = mt(k);
    if (msg && msg !== k && !msg.startsWith("e_")) return msg;
    if (c === "age16" || c === "age" || c === "age_required") return mt("age16");
    if (c === "profile_required") return mt("needProfile");
    return mt("error");
  };
}

/** sign-in, age 16+ and the Quran Talents profile, as the server asks for them */
export function Gate({ error, children }: { error: unknown; children: ReactNode }) {
  const mt = useMt();
  const { user } = useAuth();
  if (!user) return <Card><Muted size={15}>{mt("signIn")}</Muted><GoldButton title={mt("signInBtn")} onPress={() => router.push(href("/sign-in"))} /></Card>;
  if (!error) return <>{children}</>;
  const c = errCode(error);
  if (c === "age16" || c === "age" || c === "age_required" || c === "profile_required") {
    return <Card><Muted size={15}>{c === "profile_required" ? mt("needProfile") : mt("age16")}</Muted><OutlineButton title={mt("openTalents")} onPress={() => router.push(href("/talents"))} /></Card>;
  }
  return <Card><Muted size={15}>{mt("offline")}</Muted></Card>;
}

export function MemberLine({ m, right, sub }: { m: Member | null; right?: ReactNode; sub?: string }) {
  const t = useTheme();
  if (!m) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <TalentAvatar name={m.name || m.username} uri={m.avatar} badge={m.badge} size={42} />
      <Pressable style={{ flex: 1 }} onPress={() => router.push(href(`/talents/u/${m.username}`))} accessibilityRole="link">
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }} numberOfLines={1}>{m.name || m.username}</Text>
          <BadgeButton badge={m.badge} size={15} />
        </View>
        <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted }}>@{m.username}{sub ? ` · ${sub}` : ""}</Text>
      </Pressable>
      {right}
    </View>
  );
}

const verseLabel = (k: string, mt: ReturnType<typeof useMt>) => {
  const [s, r] = k.split(":"); const [a, b] = r.split("-");
  return b ? mt("verses", { s, a, b }) : mt("verseOne", { s, a });
};
const date = (iso: string) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

function SubmissionRow({ s, who }: { s: Submission; who?: Member | null }) {
  const t = useTheme();
  const mt = useMt();
  return (
    <Pressable onPress={() => router.push(href(`/mishary/mentoring/${s.id}`))} accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: t.line, opacity: pressed ? 0.7 : 1 })}>
      <Icon name={s.status === "reviewed" ? "checkCircle" : "clock"} size={18} color={s.status === "reviewed" ? t.accent : t.gold} />
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{verseLabel(s.verseKey, mt)}{who ? ` · @${who.username}` : ""}</Text>
        <Muted size={12}>{s.status === "reviewed" ? mt("reviewed") : mt("pending")} · {s.hasAudio ? mt("expires", { d: date(s.expiresAt) }) : mt("deletedFile")}</Muted>
      </View>
      <Icon name="chevronRight" size={15} color={t.muted} />
    </Pressable>
  );
}

// ——— /mishary/mentoring ———
export function MentoringScreen() {
  const t = useTheme();
  const mt = useMt();
  const err = useErr();
  const { user } = useAuth();
  const me = useLoad<MentoringMe | null>(() => (user ? M.me() : Promise.resolve(null)), [user]);
  const masters = useLoad(() => (user && me.data ? M.masters().then((r) => r.masters) : Promise.resolve([])), [user, me.data]);
  const mine = useLoad(() => (user && me.data ? M.submissions("mine").then((r) => r.submissions.filter((s) => !s.season)) : Promise.resolve([])), [user, me.data]);
  const inbox = useLoad(() => (me.data?.canMentor ? M.submissions("inbox").then((r) => r.submissions) : Promise.resolve([])), [me.data]);
  const [msg, setMsg] = useState("");
  const act = async (f: () => Promise<unknown>) => { setMsg(""); try { await f(); me.reload(); } catch (e) { setMsg(err(e)); } };
  const d = me.data;
  // a blocked member disappears from every list (the server leaves them out)
  const safe = useMentoringSafety(() => { me.reload(); masters.reload(); mine.reload(); inbox.reload(); });
  const flag = (m: Member | null) => (m ? <SafetyButton label={mt("safetyFor", { name: `@${m.username}` })} onPress={() => safe.memberMenu(m)} /> : null);
  const pair = (a: ReactNode, b: ReactNode) => <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>{a}{b}</View>;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("kicker")} title={mt("mentoringTitle")} lead={mt("mentoringLead")}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 13, lineHeight: 19, color: "rgba(255,255,255,0.75)" }}>{mt("mentoringNote")}</Text>
        </PageHero>
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 24 }}>
          <Gate error={me.error}>
            {!d ? <Muted>{mt("loading")}</Muted> : (
              <>
                <ErrorText text={msg} />
                {safe.note ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{safe.note}</Text> : null}
                <Section title={mt("yourMentors")}>
                  <Card>
                    {d.mentors.length ? d.mentors.map((l) => (
                      <View key={l.id} style={{ gap: 8 }}>
                        <MemberLine m={l.member} sub={l.status === "accepted" ? mt("accepted") : mt("requested")}
                          right={pair(<Chip label={mt("endMentoring")} onPress={() => void act(() => M.link(l.id, "end"))} />, flag(l.member))} />
                        {l.status === "accepted" && l.member ? <OutlineButton compact icon="plus" title={mt("send")} onPress={() => router.push(href(`/mishary/mentoring/send?mentor=${l.member!.username}`))} /> : null}
                      </View>
                    )) : <Muted>{mt("none")}</Muted>}
                  </Card>
                </Section>
                <Section title={mt("askMaster")}>
                  <Muted>{mt("askLead")}</Muted>
                  <Card>
                    {(masters.data ?? []).filter((m) => m.link !== "accepted" && m.link !== "pending").length ? (masters.data ?? []).filter((m) => m.link !== "accepted" && m.link !== "pending").map((m) => (
                      <MemberLine key={m.username} m={m} right={pair(<Chip label={mt("ask")} icon="send" onPress={() => void act(async () => { await M.ask(m.username); masters.reload(); })} />, flag(m))} />
                    )) : <Muted>{mt("noMasters")}</Muted>}
                    <OutlineButton compact title={mt("openTalents")} onPress={() => router.push(href("/talents"))} />
                  </Card>
                </Section>
                <Section title={mt("yourRecordings")}>
                  <Card style={{ gap: 0 }}>
                    {(mine.data ?? []).length ? (mine.data ?? []).map((s) => <SubmissionRow key={s.id} s={s} who={s.mentor} />) : <Muted>{mt("none")}</Muted>}
                  </Card>
                </Section>
                {d.canMentor ? (
                  <>
                    <Section title={mt("requests")}>
                      <Card>
                        {d.students.filter((s) => s.status === "pending").length ? d.students.filter((s) => s.status === "pending").map((l) => (
                          <View key={l.id} style={{ gap: 8 }}>
                            <MemberLine m={l.member} sub={l.note || undefined} right={flag(l.member)} />
                            <Row>
                              <Chip label={mt("accept")} icon="check" on onPress={() => void act(() => M.link(l.id, "accept"))} />
                              <Chip label={mt("decline")} icon="close" onPress={() => void act(() => M.link(l.id, "decline"))} />
                            </Row>
                          </View>
                        )) : <Muted>{mt("none")}</Muted>}
                      </Card>
                    </Section>
                    <Section title={mt("yourStudents")}>
                      <Card>
                        {d.students.filter((s) => s.status === "accepted").length ? d.students.filter((s) => s.status === "accepted").map((l) => (
                          <MemberLine key={l.id} m={l.member} sub={l.open ? `${l.open} · ${mt("pending")}` : undefined}
                            right={pair(<Chip label={mt("endMentoring")} onPress={() => void act(() => M.link(l.id, "end"))} />, flag(l.member))} />
                        )) : <Muted>{mt("none")}</Muted>}
                      </Card>
                    </Section>
                    <Section title={`${mt("toReview")} (${d.inbox})`}>
                      <Card style={{ gap: 0 }}>
                        {(inbox.data ?? []).length ? (inbox.data ?? []).map((s) => <SubmissionRow key={s.id} s={s} who={s.student} />) : <Muted>{mt("none")}</Muted>}
                      </Card>
                    </Section>
                  </>
                ) : null}
              </>
            )}
          </Gate>
          <MentoringSafetyBar />
          <View style={{ height: 40 }} />
        </View>
      </Page>
      {safe.sheet}
    </>
  );
}

/** verse picker + verse words, shared by the mentoring and the season recording screens */
export function VersePick({ value, onChange, fixed }: { value: string; onChange?: (k: string) => void; fixed?: boolean }) {
  const mt = useMt();
  const first = value.split("-")[0];
  const { verse } = useVerse(first);
  return (
    <View style={{ gap: 10 }}>
      {fixed ? null : <Row>{STUDY_VERSES.map((k) => <Chip key={k} label={k} on={k === value} onPress={() => onChange?.(k)} />)}</Row>}
      {verse ? <VerseWords verse={verse} size={22} /> : <Muted>{mt("loading")}</Muted>}
    </View>
  );
}

// ——— /mishary/mentoring/send?mentor= ———
export function SendScreen({ mentor }: { mentor: string }) {
  const t = useTheme();
  const mt = useMt();
  const err = useErr();
  const [key, setKey] = useState(STUDY_VERSES[0]);
  const [take, setTake] = useState<Take | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const send = async () => {
    if (!take) return;
    setBusy(true); setMsg("");
    try { const r = await M.send({ verseKey: key, durationMs: take.durMs, note: note.trim(), mentor }, take.uri); router.replace(href(`/mishary/mentoring/${r.id}`)); }
    catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={mt("mentoringTitle")} title={mt("sendTo", { name: `@${mentor}` })} lead={mt("record3060")} arcade={false} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 18 }}>
          <Card>
            <VersePick value={key} onChange={(k) => { setKey(k); setTake(null); }} />
            <Muted>{mt("autoStop", { s: 60 })}</Muted>
            <Recorder key={key} maxSec={60} minSec={30} onTake={setTake} />
          </Card>
          <Card>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.muted }}>{mt("noteLabel")}</Text>
            <TextInput value={note} onChangeText={setNote} maxLength={300} multiline placeholder={mt("commentHint")} placeholderTextColor={t.muted}
              style={{ minHeight: 70, borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 10, fontFamily: FONT.regular, fontSize: 15, color: t.ink, textAlignVertical: "top" }} />
          </Card>
          <Row><Icon name="lock" size={14} color={t.accent} /><Muted>{mt("privateRec")}</Muted></Row>
          <ErrorText text={msg} />
          <GoldButton title={mt("sendBtn")} icon="send" busy={busy} disabled={!take || busy} onPress={() => void send()} />
          <View style={{ height: 40 }} />
        </View>
      </Page>
    </>
  );
}

/** plays a private recording through the API (sign-in header) */
export function ServerAudio({ path }: { path: string }) {
  const t = useTheme();
  const mt = useMt();
  const player = useAudioPlayer(null);
  const st = useAudioPlayerStatus(player);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { let alive = true; void mediaSource(path).then((src) => { if (alive) { player.replace(src); setLoaded(true); } }); return () => { alive = false; }; }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  const pos = st.currentTime ?? 0, dur = st.duration || 0;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <Pressable disabled={!loaded} onPress={() => { if (st.playing) player.pause(); else { if (dur && pos >= dur - 0.2) void player.seekTo(0); player.play(); } }} accessibilityRole="button" accessibilityLabel={mt("play")}
        style={{ width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: t.accent, opacity: loaded ? 1 : 0.5 }}>
        <Icon name={st.playing ? "pause" : "play"} size={18} color="#fff" />
      </Pressable>
      <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
        <View style={{ width: `${dur ? Math.min(100, (pos / dur) * 100) : 0}%`, height: 6, backgroundColor: t.accent }} />
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.muted }}>{Math.round(pos)} / {Math.round(dur)} s</Text>
    </View>
  );
}

const RLABEL: Record<RubricKey, MtKey> = { makharij: "r_makharij", tajweed: "r_tajweed", waqf: "r_waqf", pace: "r_pace", maqam: "r_maqam" };

/** a review; onReport / onMember when someone else wrote it (report the text, report or block the reviewer) */
function ReviewView({ r, onReport, onMember }: { r: Review; onReport?: () => void; onMember?: (m: Member) => void }) {
  const t = useTheme();
  const mt = useMt();
  return (
    <Card>
      {r.reviewer ? <MemberLine m={r.reviewer} right={onMember ? <SafetyButton label={mt("safetyFor", { name: `@${r.reviewer.username}` })} onPress={() => onMember(r.reviewer!)} /> : undefined} />
        : <Text style={{ fontFamily: FONT.semibold, color: t.gold }}>{mt("jury")}</Text>}
      {RUBRIC.map((k) => (
        <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink }}>{mt(RLABEL[k])}</Text>
          <View style={{ flexDirection: "row", gap: 4 }}>{[1, 2, 3, 4, 5].map((n) => <View key={n} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: n <= r.rubric[k] ? t.gold : t.line }} />)}</View>
        </View>
      ))}
      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{mt("total", { n: r.total })}</Text>
      {r.text ? <Text style={{ fontFamily: FONT.regular, fontSize: 15, lineHeight: 22, color: t.ink }}>{r.text}</Text> : null}
      {onReport ? <ReportLink label={mt("reportReview")} onPress={onReport} /> : null}
    </Card>
  );
}

/** a quiet text button in the danger colour (report a recording or a review) */
function ReportLink({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={6} style={{ alignSelf: "flex-start", minHeight: 40, flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Icon name="flag" size={14} color={t.danger} />
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.danger }}>{label}</Text>
    </Pressable>
  );
}

function RubricForm({ id, needText, onDone }: { id: string; needText: boolean; onDone: () => void }) {
  const t = useTheme();
  const mt = useMt();
  const err = useErr();
  const [v, setV] = useState<Record<RubricKey, number>>({ makharij: 3, tajweed: 3, waqf: 3, pace: 3, maqam: 3 });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const submit = async () => {
    if (needText && !text.trim()) { setMsg(mt("e_text_required")); return; }
    setBusy(true); setMsg("");
    try { await M.review(id, v, text.trim()); onDone(); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };
  return (
    <Card>
      <Muted size={12}>{mt("scaleHint")}</Muted>
      {RUBRIC.map((k) => (
        <View key={k} style={{ gap: 6 }}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt(RLABEL[k])}</Text>
          <Row>{[1, 2, 3, 4, 5].map((n) => <Chip key={n} label={String(n)} on={v[k] === n} onPress={() => setV({ ...v, [k]: n })} />)}</Row>
        </View>
      ))}
      <Text style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.ink }}>{mt("comment")}</Text>
      <TextInput value={text} onChangeText={setText} maxLength={600} multiline placeholder={mt("commentHint")} placeholderTextColor={t.muted}
        style={{ minHeight: 90, borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 10, fontFamily: FONT.regular, fontSize: 15, color: t.ink, textAlignVertical: "top" }} />
      <ErrorText text={msg} />
      <GoldButton title={mt("sendFeedback")} busy={busy} disabled={busy} onPress={() => void submit()} />
    </Card>
  );
}

// ——— /mishary/mentoring/[id] (also season entries for the jury) ———
export function SubmissionScreen({ id }: { id: string }) {
  const t = useTheme();
  const mt = useMt();
  const err = useErr();
  const d = useLoad(() => M.submission(id), [id]);
  const [msg, setMsg] = useState("");
  const s = d.data?.submission;
  // after a block the submission is gone for both sides (the server answers 404), so the screen closes
  const safe = useMentoringSafety(() => router.back());
  const role = d.data?.role;
  const flag = (m: Member | null) => (m ? <SafetyButton label={mt("safetyFor", { name: `@${m.username}` })} onPress={() => safe.memberMenu(m)} /> : null);
  // the student reports any review; the master every review but the own (s.mentor is the master); a juror sees only the own
  const canReportReview = (r: Review) => role === "student" || (role === "master" && (!r.reviewer || r.reviewer.username !== s?.mentor?.username));
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero topInset back eyebrow={d.data?.role === "jury" ? mt("jury") : mt("mentoringTitle")} title={s ? verseLabel(s.verseKey, mt) : mt("loading")} arcade={false} />
        <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 18 }}>
          <Gate error={d.error}>
            {!s ? <Muted>{mt("loading")}</Muted> : (
              <>
                {d.data!.role === "master" ? <MemberLine m={s.student} right={flag(s.student)} /> : null}
                {d.data!.role === "student" && s.mentor ? <MemberLine m={s.mentor} sub={mt("accepted")} right={flag(s.mentor)} /> : null}
                <Card>
                  <VersePick value={s.verseKey} fixed />
                  {s.hasAudio ? <ServerAudio path={M.audioPath(s.id)} /> : <Muted>{mt("deletedFile")}</Muted>}
                  {s.note ? <Text style={{ fontFamily: FONT.regular, fontSize: 14.5, lineHeight: 21, color: t.ink }}>{s.note}</Text> : null}
                  {s.hasAudio ? <Muted size={12}>{mt("expires", { d: date(s.expiresAt) })}</Muted> : null}
                  {role !== "student" ? <ReportLink label={mt("reportRecording")} onPress={() => safe.reportSubmission(s.id)} /> : null}
                </Card>
                <Section title={mt("feedback")}>
                  {d.data!.reviews.length ? d.data!.reviews.map((r) => (
                    <ReviewView key={r.id} r={r} onReport={canReportReview(r) ? () => safe.reportReview(s.id, r.id) : undefined}
                      onMember={canReportReview(r) && r.reviewer ? safe.memberMenu : undefined} />
                  )) : <Muted>{mt("pending")}</Muted>}
                  {d.data!.canReview ? <RubricForm id={s.id} needText={d.data!.role === "master"} onDone={d.reload} /> : null}
                </Section>
                <ErrorText text={msg} />
                {safe.note ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.accent }}>{safe.note}</Text> : null}
                {d.data!.role === "student" && s.status === "pending" ? (
                  <OutlineButton title={s.season ? mt("withdrawEntry") : mt("withdraw")} onPress={() => void M.withdraw(s.id).then(() => router.back()).catch((e) => setMsg(err(e)))} />
                ) : null}
              </>
            )}
          </Gate>
          <MentoringSafetyBar />
          <View style={{ height: 40 }} />
        </View>
      </Page>
      {safe.sheet}
    </>
  );
}
