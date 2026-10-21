import { useCallback, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Stack, router, useFocusEffect, type Href } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton, Segmented } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { T, type ConnItem } from "@/features/talents/api";
import { useShams2 } from "@/features/shams2/model";
import { Btn, Card } from "@/features/shams2/ui";
import { useIntl } from "@/features/srs/format";
import { TL, type Inbox, type MyTeacher, type StudentRow } from "./api";
import { SuggestionsList } from "./Inbox";
import { setActive, syncTeacher } from "./sync";
import { useTT } from "./text";
import { intlLocale, useLang } from "@/i18n";

// /teacher – live teacher–student link through the Quran Talents network. Student: invite an accepted connection,
// consent, update, stop (deletes the server copy). Teacher: invitations and the dashboard of all students.
const ERR: Record<string, string> = {
  not_connected: "err_not_connected", exists: "err_exists", too_soon: "err_too_soon", too_many_teachers: "err_too_many",
  too_many_students: "err_too_many", too_many_open: "err_too_many", bad_range: "err_range", range_too_long: "err_range",
  login: "loginNeeded", profile_required: "loginNeeded", age_required: "loginNeeded",
};
export const useErr = () => {
  const tt = useTT();
  return (e: unknown) => tt((ERR[e instanceof ApiError ? e.code : ""] ?? "err_generic") as never);
};

export function TeacherLiveScreen() {
  const t = useTheme();
  const tt = useTT();
  const { user } = useAuth();
  const [tab, setTab] = useState<"student" | "teacher">("student");
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Shams 2.0" arabic="الشَّيْخ والطّالِب" title={tt("title")} lead={tt("lead")} />
        <View style={{ padding: 16, gap: 14 }}>
          {!user ? (
            <Card>
              <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.ink, textAlign: "left" }}>{tt("loginNeeded")}</Text>
              <GoldButton title={tt("signIn")} onPress={() => router.push("/sign-in" as Href)} />
            </Card>
          ) : (
            <>
              <Segmented value={tab} options={[["student", tt("student")], ["teacher", tt("teacher")]]} onChange={setTab} />
              {tab === "student" ? <StudentSide /> : <TeacherSide />}
            </>
          )}
        </View>
      </Page>
    </>
  );
}

function Check({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
      <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: on ? t.gold : t.line, backgroundColor: on ? t.gold : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {on ? <Text style={{ color: "#08261d", fontFamily: FONT.bold, fontSize: 13 }}>✓</Text> : null}
      </View>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink, textAlign: "left" }}>{label}</Text>
    </Pressable>
  );
}

function StudentSide() {
  const t = useTheme();
  const tt = useTT();
  const err = useErr();
  const m = useShams2();
  const [shares, setShares] = useState<{ teachers: MyTeacher[]; suggestions: Inbox[]; parentalNeeded: boolean } | null>(null);
  const [conn, setConn] = useState<ConnItem[]>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [parental, setParental] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    try {
      const s = await TL.shares();
      setShares(s);
      setActive(s.teachers.some((x) => x.status === "active"));
      T.connections().then((c) => setConn(c.connected)).catch(() => undefined);
    } catch (e) { setMsg(err(e)); setShares({ teachers: [], suggestions: [], parentalNeeded: false }); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const run = async (f: () => Promise<unknown>) => { setBusy(true); setMsg(""); try { await f(); await load(); } catch (e) { setMsg(err(e)); } setBusy(false); };
  const invitedNames = new Set((shares?.teachers ?? []).map((x) => x.teacher?.username));
  const choices = conn.filter((c) => !invitedNames.has(c.username));
  const { lang } = useLang();
  // dates in the chosen app language, not the device's
  const dt = (s: string) => new Date(s).toLocaleString(intlLocale(lang), { dateStyle: "medium", timeStyle: "short" });
  const revoke = (x: MyTeacher) => Alert.alert(tt("revoke"), tt("revokeAsk"), [
    { text: tt("later"), style: "cancel" },
    { text: tt("revoke"), style: "destructive", onPress: () => void run(() => TL.end(x.id)) },
  ]);
  return (
    <>
      <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>{tt("sharedWhat")}</Text>
      {msg ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.danger, textAlign: "left" }}>{msg}</Text> : null}
      {shares?.suggestions.length ? (
        <>
          <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("fromTeacher")}</Text>
          <SuggestionsList items={shares.suggestions} onChange={() => void load()} />
        </>
      ) : null}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("myTeachers")}</Text>
      {shares && !shares.teachers.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "left" }}>{tt("none")}</Text> : null}
      {shares?.teachers.map((x) => (
        <Card key={x.id}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{x.teacher?.name ?? "–"}</Text>
          <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>
            {x.status === "pending" ? tt("waiting") : `${tt("active")} · ${x.syncedAt ? tt("updated", { d: dt(x.syncedAt) }) : tt("never")}`}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {x.status === "active" ? <Btn title={tt("syncNow")} disabled={busy} onPress={() => void run(async () => { setActive(true); await syncTeacher(m, true); })} /> : null}
            <Btn title={tt("revoke")} disabled={busy} onPress={() => revoke(x)} />
          </View>
        </Card>
      ))}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("chooseTeacher")}</Text>
      <Card>
        {!choices.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "left" }}>{tt("noConn")}</Text> : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {choices.map((c) => <Chip key={c.username} label={c.name || c.username} selected={pick === c.username} onPress={() => setPick(pick === c.username ? null : c.username)} />)}
          </View>
        )}
        {pick ? (
          <>
            <Check on={consent} onToggle={() => setConsent(!consent)} label={tt("consent")} />
            {shares?.parentalNeeded ? <Check on={parental} onToggle={() => setParental(!parental)} label={tt("parental")} /> : null}
            <GoldButton title={tt("invite")} disabled={busy || !consent || (!!shares?.parentalNeeded && !parental)} onPress={() => void run(async () => { await TL.invite(pick, parental); setPick(null); setConsent(false); setParental(false); })} />
          </>
        ) : null}
      </Card>
    </>
  );
}

function TeacherSide() {
  const t = useTheme();
  const tt = useTT();
  const nf = useIntl();
  const err = useErr();
  const [rows, setRows] = useState<StudentRow[] | null>(null);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    try { setRows((await TL.students()).students); } catch (e) { setMsg(err(e)); setRows([]); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const answer = async (id: string, a: "accept" | "decline") => { setMsg(""); try { await TL.answer(id, a); } catch (e) { setMsg(err(e)); } await load(); };
  const pending = (rows ?? []).filter((r) => r.status === "pending");
  const needs = (r: StudentRow) => !r.digest || r.digest.idle === null || r.digest.idle >= 3;
  const active = (rows ?? []).filter((r) => r.status === "active").sort((a, b) => Number(needs(b)) - Number(needs(a)));
  return (
    <>
      {msg ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.danger, textAlign: "left" }}>{msg}</Text> : null}
      {pending.length ? <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("invitesT")}</Text> : null}
      {pending.map((r) => (
        <Card key={r.id}>
          <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink, textAlign: "left" }}>{r.member?.name ?? "–"}</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Btn primary title={tt("acceptInv")} onPress={() => void answer(r.id, "accept")} />
            <Btn title={tt("decline")} onPress={() => void answer(r.id, "decline")} />
          </View>
        </Card>
      ))}
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("studentsT")}</Text>
      {rows && !active.length ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "left" }}>{tt("noStudents")}</Text> : null}
      {active.map((r) => {
        const d = r.digest;
        const flag = needs(r);
        return (
          <Pressable key={r.id} onPress={() => router.push(`/teacher/${r.id}` as Href)} accessibilityRole="button" accessibilityLabel={r.member?.name ?? ""}
            style={({ pressed }) => ({ gap: 6, padding: 14, borderRadius: R.card, borderWidth: 1, borderColor: flag ? "rgba(201,166,94,0.6)" : t.line, backgroundColor: t.surface, opacity: pressed ? 0.85 : 1 })}>
            <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink, textAlign: "left" }}>{r.member?.name ?? "–"}</Text>
            {d ? (
              <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" }}>
                {[tt("memN", { n: nf(d.memorised) }), tt("gradeN", { n: nf(d.grade) }), tt("active28", { n: nf(d.activeDays) }), tt("weakN", { n: nf(d.weak) }), tt("itqanN", { n: nf(d.itqan.surahs) })].join(" · ")}
              </Text>
            ) : <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{tt("never")}</Text>}
            {flag ? <Text style={{ fontFamily: FONT.semibold, fontSize: 12.5, color: t.gold, textAlign: "left" }}>{d && d.idle !== null ? `${tt("attention")} · ${tt("idle", { n: nf(d.idle) })}` : tt("attention")}</Text> : null}
          </Pressable>
        );
      })}
    </>
  );
}
