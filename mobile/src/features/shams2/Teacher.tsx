import { useState } from "react";
import { Pressable, Share, Text, TextInput, View } from "react-native";
import { Stack } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Page, PageHero } from "@/components/page";
import { GoldButton, Segmented } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { stats } from "@/web/learning";
import { useShams2 } from "./model";
import { useSurahNames } from "./names";
import { readLog, readSettings, saveSettings, wirdStreak } from "./store";
import { addLink, addStudent, encodeSnapshot, makeSnapshot, removeLink, removeStudent, useTeacher, type Snapshot } from "./teacherModel";
import { useS2 } from "./text";
import { Btn, Card, SourceNote, Term, onScore, scoreColor } from "./ui";

// /shams/teacher – the teacher (ustādh / shaykh) sees a student's wird, quality and streak, read-only. Student side:
// create a share code (a snapshot; no e-mail, no account, no recordings). Teacher side: paste codes, see each student.
// Later the same view is filled through an accepted connection in the Quran Talents network.
export function TeacherScreen() {
  const t = useTheme();
  const { s, nf } = useS2();
  const m = useShams2();
  const st = useTeacher();
  const [tab, setTab] = useState<"student" | "teacher">("student");
  const [nameIn, setNameIn] = useState(readSettings().name ?? "");
  const [teacherIn, setTeacherIn] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [paste, setPaste] = useState("");
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const create = () => {
    saveSettings({ name: nameIn.trim().slice(0, 40) });
    const snap = makeSnapshot({ name: nameIn || s("student"), streak: stats().streak, wirdStreak: wirdStreak(readLog(), m.day), wird: m.wird, surahs: m.q.surahs, juz: m.q.juz, overall: m.q.overall, log: readLog(), day: m.day });
    const c = encodeSnapshot(snap);
    setCode(c);
    addLink(teacherIn);
  };
  const input = { borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 12, fontFamily: FONT.regular, fontSize: 15, color: t.ink, backgroundColor: t.surface, textAlign: "left" as const };
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow={s("eyebrow")} arabic="الشَّيْخ والطّالِب" title={s("teacherTitle")} lead={s("teacherLead")} />
        <View style={{ padding: 16, gap: 14 }}>
          <Segmented value={tab} options={[["student", s("iAmStudent")], ["teacher", s("iAmTeacher")]]} onChange={setTab} />
          {tab === "student" ? (
            <>
              <Card>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("shownName")}</Text>
                <TextInput value={nameIn} onChangeText={setNameIn} placeholder={s("student")} placeholderTextColor={t.muted} maxLength={40} style={input} accessibilityLabel={s("shownName")} />
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("teacherName")}</Text>
                <TextInput value={teacherIn} onChangeText={setTeacherIn} placeholder={s("optional")} placeholderTextColor={t.muted} maxLength={40} style={input} accessibilityLabel={s("teacherName")} />
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{s("codePrivacy")}</Text>
                <GoldButton title={s("createCode")} onPress={create} />
                {code ? (
                  <View style={{ gap: 8 }}>
                    <Text selectable style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted }} numberOfLines={3}>{code}</Text>
                    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                      <Btn icon="copy" title={s("copy")} onPress={() => void Clipboard.setStringAsync(code)} />
                      <Btn icon="share" title={s("share")} onPress={() => void Share.share({ message: code })} />
                    </View>
                  </View>
                ) : null}
              </Card>
              {st.links.length ? <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink }}>{s("linkedTeachers")}</Text> : null}
              {st.links.map((l) => (
                <View key={l.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 14, color: t.ink, textAlign: "left" }}>{`${l.teacher ?? s("teacher")} · ${new Date(l.createdAt).toLocaleDateString()}`}</Text>
                  <Btn title={s("remove")} onPress={() => removeLink(l.id)} />
                </View>
              ))}
            </>
          ) : (
            <>
              <Card>
                <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("pasteCode")}</Text>
                <TextInput value={paste} onChangeText={(x) => { setPaste(x); setErr(""); }} placeholder="QMC2.…" placeholderTextColor={t.muted} autoCapitalize="none" autoCorrect={false} multiline style={[input, { minHeight: 70 }]} accessibilityLabel={s("pasteCode")} />
                {err ? <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.danger }}>{err}</Text> : null}
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Btn title={s("pasteFromClipboard")} onPress={() => void Clipboard.getStringAsync().then(setPaste)} />
                  <Btn primary title={s("addStudent")} onPress={() => { if (addStudent(paste)) { setPaste(""); setOpen(0); } else setErr(s("badCode")); }} />
                </View>
              </Card>
              {!st.students.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted }}>{s("noStudents")}</Text> : null}
              {st.students.map((x, i) => (
                <View key={`${x.snap.name}-${x.added}`} style={{ gap: 8 }}>
                  <Pressable onPress={() => setOpen(open === i ? null : i)} accessibilityRole="button" accessibilityState={{ expanded: open === i }}
                    style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: open === i ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: t.surface }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: scoreColor(t, x.snap.overall), alignItems: "center", justifyContent: "center" }}>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 12, color: onScore(x.snap.overall) ?? t.ink }}>{x.snap.overall === null ? "–" : nf(x.snap.overall)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{x.snap.name || s("student")}</Text>
                      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{s("snapLine", { n: nf(x.snap.memorised), d: nf(x.snap.wirdStreak), date: new Date(x.snap.at).toLocaleDateString() })}</Text>
                    </View>
                  </Pressable>
                  {open === i ? <StudentView snap={x.snap} onRemove={() => { removeStudent(i); setOpen(null); }} /> : null}
                </View>
              ))}
            </>
          )}
          <Term id="ard" />
          <SourceNote src={["app"]} />
        </View>
      </Page>
    </>
  );
}

function StudentView({ snap, onRemove }: { snap: Snapshot; onRemove: () => void }) {
  const t = useTheme();
  const { s, nf } = useS2();
  const { name } = useSurahNames();
  const stat = (v: string, l: string) => (
    <View key={l} style={{ flex: 1, padding: 10, borderRadius: R.md, borderWidth: 1, borderColor: t.line, alignItems: "center" }}>
      <Text style={{ fontFamily: FONT.display, fontSize: 19, color: t.ink }}>{v}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 11, color: t.muted, textAlign: "center" }}>{l}</Text>
    </View>
  );
  return (
    <Card gold>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{s("readOnly")}</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {stat(nf(snap.memorised), s("versesShort"))}
        {stat(snap.overall === null ? "–" : nf(snap.overall), s("overall"))}
        {stat(nf(snap.wirdStreak), s("streak"))}
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("todayPlan")}</Text>
      <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink, textAlign: "left" }}>
        {`${s("sabaqShort")}: ${snap.plan.sabaq.length ? snap.plan.sabaq.map(([a, b, c]) => `${name(a)} ${nf(b)}–${nf(c)}`).join(", ") : "–"}\n${s("sabqiShort")}: ${nf(snap.plan.sabqi)} · ${s("manzilShort")}: ${nf(snap.plan.manzil)} · ${s("minN", { n: nf(snap.plan.minutes) })}\n${s("manzilCycle")}: ${nf(snap.plan.cycle[0])}/${nf(snap.plan.cycle[1])}`}
      </Text>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("last28")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
        {snap.log.map(([d, b]) => <View key={d} accessibilityLabel={new Date(d * 86400000).toLocaleDateString()} style={{ width: 16, height: 16, borderRadius: 4, backgroundColor: b === 7 ? t.gold : b ? t.accent : t.line, opacity: b && b !== 7 ? 0.4 + ((b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1)) * 0.2 : 1 }} />)}
      </View>
      <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.ink }}>{s("bySurah")}</Text>
      {snap.surahs.map(([id, known, total, score]) => (
        <View key={id} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, color: t.ink, textAlign: "left" }} numberOfLines={1}>{`${nf(id)}. ${name(id)}`}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12, color: t.muted }}>{`${nf(known)}/${nf(total)}`}</Text>
          <View style={{ width: 34, height: 20, borderRadius: 4, backgroundColor: scoreColor(t, score), alignItems: "center", justifyContent: "center" }}><Text style={{ fontFamily: FONT.semibold, fontSize: 11, color: onScore(score) ?? t.ink }}>{nf(score)}</Text></View>
        </View>
      ))}
      <Btn title={s("remove")} onPress={onRemove} />
    </Card>
  );
}
