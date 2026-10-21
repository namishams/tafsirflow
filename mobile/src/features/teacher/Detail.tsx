import { useCallback, useState } from "react";
import { Alert, Text, TextInput, View } from "react-native";
import { Stack, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Page, PageHero } from "@/components/page";
import { Chip, GoldButton } from "@/components/brand";
import { FONT, R, useTheme } from "@/lib/theme";
import { StudentView } from "@/features/shams2/Teacher";
import { useSurahNames } from "@/features/shams2/names";
import { Btn, Card } from "@/features/shams2/ui";
import { useIntl } from "@/features/srs/format";
import { PRESETS, TL, type Preset, type Suggestion } from "./api";
import { useErr } from "./Screen";
import { useTT } from "./text";
import { intlLocale, useLang } from "@/i18n";

// /teacher/<id> – one student: the shared summary (the same read-only view as the share-code path), gentle
// encouragement from four presets, a suggested portion, and what was sent so far.
export function StudentDetail() {
  const t = useTheme();
  const tt = useTT();
  const nf = useIntl();
  const err = useErr();
  const { name } = useSurahNames();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lang } = useLang();
  const [d, setD] = useState<Awaited<ReturnType<typeof TL.student>> | null>(null);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState("");
  const [surah, setSurah] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const load = useCallback(async () => {
    try { setD(await TL.student(String(id))); } catch (e) { setMsg(err(e)); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  const run = async (f: () => Promise<unknown>) => { setMsg(""); setSent(""); try { await f(); setSent(tt("sent")); await load(); } catch (e) { setMsg(err(e)); } };
  const input = { borderWidth: 1, borderColor: t.line, borderRadius: R.md, padding: 10, fontFamily: FONT.regular, fontSize: 15, color: t.ink, backgroundColor: t.surface, minWidth: 90, textAlign: "left" as const };
  const num = (v: string) => Number(v.replace(/\D/g, ""));
  const status = (s: Suggestion) => tt(`st_${s.status}` as never);
  const unlink = () => Alert.alert(tt("revoke"), tt("revokeAsk"), [
    { text: tt("later"), style: "cancel" },
    { text: tt("revoke"), style: "destructive", onPress: () => void TL.end(String(id)).then(() => router.back()).catch((e) => setMsg(err(e))) },
  ]);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back topInset eyebrow="Shams 2.0" arabic="الطّالِب" title={d?.member?.name ?? tt("studentsT")} lead={d?.syncedAt ? tt("updated", { d: new Date(d.syncedAt).toLocaleString(intlLocale(lang), { dateStyle: "medium", timeStyle: "short" }) }) : tt("never")} />
        <View style={{ padding: 16, gap: 14 }}>
          {msg ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.regular, fontSize: 13, color: t.danger, textAlign: "left" }}>{msg}</Text> : null}
          {d?.snapshot ? <StudentView snap={{ ...d.snapshot, name: d.member?.name ?? "" }} onRemove={unlink} /> : d ? <Text style={{ fontFamily: FONT.regular, fontSize: 14, color: t.muted, textAlign: "left" }}>{tt("never")}</Text> : null}
          {d?.snapshot ? (
            <Text style={{ fontFamily: FONT.regular, fontSize: 13, color: t.muted, textAlign: "left" }}>
              {[tt("gradeN", { n: nf(d.snapshot.grade) }), tt("weakN", { n: nf(d.snapshot.weak.total) }), tt("itqanN", { n: nf(d.snapshot.itqan.surahs) })].join(" · ")}
            </Text>
          ) : null}
          {d ? (
            <>
              <Card>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("sendNudge")}</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {PRESETS.map((p: Preset) => <Chip key={p} label={tt(`nudge_${p}` as never)} onPress={() => void run(() => TL.nudge(d.id, p))} />)}
                </View>
              </Card>
              <Card>
                <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 16, color: t.ink, textAlign: "left" }}>{tt("suggestPortion")}</Text>
                <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                  <TextInput value={surah} onChangeText={setSurah} placeholder={tt("surahNo")} placeholderTextColor={t.muted} keyboardType="number-pad" maxLength={3} style={input} accessibilityLabel={tt("surahNo")} />
                  <TextInput value={from} onChangeText={setFrom} placeholder={tt("fromV")} placeholderTextColor={t.muted} keyboardType="number-pad" maxLength={3} style={input} accessibilityLabel={tt("fromV")} />
                  <TextInput value={to} onChangeText={setTo} placeholder={tt("toV")} placeholderTextColor={t.muted} keyboardType="number-pad" maxLength={3} style={input} accessibilityLabel={tt("toV")} />
                </View>
                {num(surah) >= 1 && num(surah) <= 114 ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, color: t.muted, textAlign: "left" }}>{name(num(surah))}</Text> : null}
                <GoldButton title={tt("send")} disabled={!num(surah) || !num(from) || !num(to)} onPress={() => void run(async () => { await TL.assign(d.id, num(surah), num(from), num(to)); setSurah(""); setFrom(""); setTo(""); })} />
                {sent ? <Text accessibilityRole="alert" style={{ fontFamily: FONT.semibold, fontSize: 13, color: t.gold, textAlign: "left" }}>{sent}</Text> : null}
              </Card>
              {d.suggestions.map((s) => (
                <View key={s.id} style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: R.md, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface }}>
                  <Text style={{ flex: 1, fontFamily: FONT.regular, fontSize: 13.5, lineHeight: 19, color: t.ink, textAlign: "left" }}>
                    {`${s.kind === "nudge" && s.preset ? tt(`nudge_${s.preset}` as never) : `${name(s.surah ?? 1)} ${nf(s.from ?? 1)}–${nf(s.to ?? 1)}`} · ${status(s)}`}
                  </Text>
                  {s.status === "open" ? <Btn title={tt("withdraw")} onPress={() => void TL.withdraw(s.id).then(load).catch((e) => setMsg(err(e)))} /> : null}
                </View>
              ))}
            </>
          ) : null}
        </View>
      </Page>
    </>
  );
}
