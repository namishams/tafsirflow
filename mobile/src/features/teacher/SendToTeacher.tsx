import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, type Href } from "expo-router";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Chip, GoldButton, OutlineButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { markTakeSent } from "@/features/shams2/store2";
import { REC_MAX_MS, REC_MIN_MS, RL, TL, type MyTeacher, type RecKind, type RecSummary } from "./api";
import { useRt, type RtKey } from "./rec/text";

// "Send to teacher" (Shams 3.0) under the makhraj coach, talaqqi and recitation from memory.
// Step 1, always: share the recording through the device (expo-sharing) and copy a short summary – nothing reaches our
// server. Step 2, with an active teacher link (/teacher): send it to that teacher with an explicit consent tick each
// time (and the parental tick for 13–15 year olds); the server keeps it at most 60 days, the student can withdraw it,
// both sides can report and block (/teacher/recitations). The summary is structured (own rating, ear training, words
// heard), never a pronunciation score.
export type SendTake = { uri: string; ms: number; id?: string };
const ERR: Record<string, RtKey> = { too_many_open: "err_too_many_open", not_linked: "err_not_linked", media_format: "err_media", media_missing: "err_media", media_too_large: "err_media", bad_duration: "tooShort", parental_required: "err_parental" };

function Check({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", minHeight: 44 }}>
      <View style={{ width: 22, height: 22, borderRadius: 7, borderWidth: 1.5, borderColor: on ? "#c6a65e" : t.line, backgroundColor: on ? "#c6a65e" : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        {on ? <Icon name="check" size={13} color="#08261d" /> : null}
      </View>
      <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 20, color: t.ink, textAlign: "left" }}>{label}</Text>
    </Pressable>
  );
}

export function SendToTeacher({ take, kind, surah, from, to, letter, summary, shareText }: {
  take: SendTake | null; kind: RecKind; surah?: number; from?: number; to?: number; letter?: string; summary: RecSummary; shareText: string;
}) {
  const t = useTheme();
  const rt = useRt();
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<MyTeacher[] | null>(null);
  const [parentalNeeded, setParentalNeeded] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [parental, setParental] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    TL.shares().then((s) => {
      if (!alive) return;
      const act = s.teachers.filter((x) => x.status === "active" && x.teacher);
      setTeachers(act); setParentalNeeded(s.parentalNeeded); setPick(act[0]?.id ?? null);
    }).catch(() => { if (alive) setTeachers([]); });
    return () => { alive = false; };
  }, [user]);
  useEffect(() => { setConsent(false); setMsg(null); }, [take?.uri]);

  const share = async () => {
    if (!take) return;
    try {
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(take.uri, { mimeType: "audio/mp4", UTI: "public.mpeg-4-audio", dialogTitle: rt("sendT") });
    } catch { /* the sheet was closed */ }
  };
  const copy = async () => { try { await Clipboard.setStringAsync(shareText); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard unavailable */ } };
  const min = REC_MIN_MS[kind];
  const tooShort = !!take && take.ms < min;
  const tooLong = !!take && take.ms > REC_MAX_MS;
  const chosen = teachers?.find((x) => x.id === pick) ?? null;
  const send = async () => {
    if (!take || !chosen || !consent || tooShort || tooLong) return;
    setBusy(true); setMsg(null);
    try {
      await RL.send({ shareId: chosen.id, kind, durationMs: take.ms, surah, from, to, letter, summary, parental: parentalNeeded ? parental : undefined }, take.uri);
      if (take.id) markTakeSent(take.id);
      setMsg({ ok: true, text: rt("sent") }); setConsent(false);
    } catch (e) {
      const code = e instanceof ApiError ? e.code : "";
      setMsg({ ok: false, text: rt(ERR[code] ?? "err_generic", { n: Math.round(min / 1000) }) });
    }
    setBusy(false);
  };

  const muted = { fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted, textAlign: "left" as const };
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
        <OutlineButton compact icon="share" title={rt("share")} disabled={!take} onPress={() => void share()} />
        <OutlineButton compact icon={copied ? "check" : "copy"} title={copied ? rt("copied") : rt("copy")} onPress={() => void copy()} />
      </View>
      <Text style={muted}>{rt("shareNote")}</Text>
      <View style={{ height: 1, backgroundColor: t.line }} />
      <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 15, color: t.ink, textAlign: "left" }}>{rt("direct")}</Text>
      {!user ? (
        <>
          <Text style={muted}>{rt("signIn")}</Text>
          <OutlineButton compact title={rt("openLink")} onPress={() => router.push("/teacher" as Href)} />
        </>
      ) : teachers === null ? <Text style={muted}>{rt("loading")}</Text> : !teachers.length ? (
        <>
          <Text style={muted}>{rt("noTeacher")}</Text>
          <OutlineButton compact title={rt("openLink")} onPress={() => router.push("/teacher" as Href)} />
        </>
      ) : (
        <>
          {teachers.length > 1 ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {teachers.map((x) => <Chip key={x.id} label={x.teacher?.name ?? "–"} selected={pick === x.id} onPress={() => setPick(x.id)} />)}
            </View>
          ) : null}
          <View style={{ padding: 12, borderRadius: R.md, backgroundColor: t.dark ? "rgba(201,166,94,0.08)" : "rgba(201,166,94,0.10)", flexDirection: "row", gap: 8 }}>
            <Icon name="shield" size={15} color={t.gold} />
            <Text style={[muted, { flex: 1, color: t.ink }]}>{rt("privacy")}</Text>
          </View>
          {chosen ? <Check on={consent} onToggle={() => setConsent(!consent)} label={rt("consent", { t: chosen.teacher?.name ?? "" })} /> : null}
          {parentalNeeded ? <Check on={parental} onToggle={() => setParental(!parental)} label={rt("parental")} /> : null}
          {tooShort ? <Text style={[muted, { color: t.danger }]}>{rt("tooShort", { n: Math.round(min / 1000) })}</Text> : null}
          {tooLong ? <Text style={[muted, { color: t.danger }]}>{rt("tooLong")}</Text> : null}
          <GoldButton icon="send" title={busy ? rt("sending") : rt("send")} busy={busy} disabled={!take || !chosen || !consent || tooShort || tooLong || (parentalNeeded && !parental)} onPress={() => void send()} />
        </>
      )}
      {msg ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.semibold, fontSize: 13, lineHeight: 19, color: msg.ok ? t.gold : t.danger, textAlign: "left" }}>{msg.text}</Text> : null}
    </View>
  );
}
