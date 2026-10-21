import { useEffect, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { FONT, R, goldButton, goldHair, stage, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { GRADES } from "@/features/shams2/grades";
import { sijillApi, type Sijill } from "@/features/sijill/api";
import { syncSijill } from "@/features/sijill/summary";
import { JuzGrid } from "@/features/sijill/Showcase";
import { useST, type SKey } from "@/features/sijill/text";
import { AccessGate, Muted, SafetyBar, useTalentAccess, useTalentErr } from "@/features/talents/ui";
import { ApiError } from "@/lib/api";

// /talents/compare/[username] – "compare with friends": the own record next to the other member's, only between mutual
// follows or accepted connections (checked by the server). The other side shows only what that member shows.
type Side = { username: string; name: string; sijill: Sijill };
export default function Compare() {
  const t = useTheme();
  const st = useST();
  const err = useTalentErr();
  const { lang } = useLang();
  const { pro } = usePro();
  const a = useTalentAccess();
  const { username } = useLocalSearchParams<{ username: string }>();
  const [d, setD] = useState<{ me: Side; them: Side } | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (a.state !== "ok" || !username) return;
    void (async () => {
      await syncSijill(pro);
      try { setD(await sijillApi.compare(username, lang)); }
      catch (e) { setMsg(e instanceof ApiError && e.code === "compare_friends" ? st("e_compare_friends") : err(e)); }
    })();
  }, [a.state, username]); // eslint-disable-line react-hooks/exhaustive-deps
  const nf = (n: number) => Intl.NumberFormat(lang).format(n);
  const row = (label: string, f: (s: Sijill) => string | null) => {
    const mine = d ? f(d.me.sijill) : null, theirs = d ? f(d.them.sijill) : null;
    return (
      <View key={label} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: goldHair, gap: 8 }}>
        <Text style={{ flex: 1.1, fontFamily: FONT.semibold, fontSize: 13, color: stage.textMuted }}>{label}</Text>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14.5, color: stage.cream, textAlign: "center" }}>{mine ?? "–"}</Text>
        <Text style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14.5, color: theirs === null ? stage.textMuted : stage.cream, textAlign: "center" }}>{theirs ?? st("hidden")}</Text>
      </View>
    );
  };
  const col = (title: string, children: ReactNode) => <View style={{ flex: 1, gap: 6 }}><Text style={{ fontFamily: FONT.bold, fontSize: 13, color: stage.gold }}>{title}</Text>{children}</View>;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arcade={false} eyebrow={st("sijill")} title={st("compareTitle")} lead={d ? st("compareLead", { u: d.them.name }) : undefined} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 14 }}>
            {!d ? (msg ? <Muted>{msg}</Muted> : <Loading />) : (
              <>
                <View style={{ borderRadius: R.card, borderWidth: 1, borderColor: goldButton.line, backgroundColor: stage.bg, padding: 14 }}>
                  <View style={{ flexDirection: "row", paddingBottom: 8, gap: 8 }}>
                    <View style={{ flex: 1.1 }} />
                    <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14, color: stage.gold, textAlign: "center" }}>{st("you")}</Text>
                    <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.bold, fontSize: 14, color: stage.gold, textAlign: "center" }}>{d.them.name}</Text>
                  </View>
                  {row(st("sec_level"), (s) => (s.level ? st("levelN", { n: s.level.level }) : null))}
                  {row(st("filterStage"), (s) => (s.level ? st(`stage_${s.level.stage}` as SKey).split(" (")[0] : null))}
                  {row(st("sec_hifz"), (s) => (s.hifz ? GRADES[s.hifz.grade - 1]?.tr ?? String(s.hifz.grade) : null))}
                  {row(st("metric_memorised"), (s) => (s.memorised ? nf(s.memorised.verses) : null))}
                  {row(st("metric_xp"), (s) => (s.activity ? nf(s.activity.week.reduce((x, y) => x + y, 0)) : null))}
                  {row(st("metric_active"), (s) => (s.activity ? `${s.activity.active}/7` : null))}
                  {row(st("metric_streak"), (s) => (s.time ? String(s.time.streak) : null))}
                  {row(st("sec_time"), (s) => (s.time ? st("timeTotal", { n: nf(Math.round(s.time.totalMin / 60)) }) : null))}
                  {row(st("sec_certificates"), (s) => (s.certificates ? String(s.certificates.length) : null))}
                  {row(st("sec_exams"), (s) => (s.exams ? String(s.exams.length) : null))}
                  {row(st("sec_courses"), (s) => (s.courses ? String(s.courses.done) : null))}
                  {row(st("sec_stickers"), (s) => (s.stickers ? nf(s.stickers.total) : null))}
                  {row(st("sec_tree"), (s) => (s.tree ? st("treeStage", { n: s.tree.stage }) : null))}
                </View>
                {d.me.sijill.memorised || d.them.sijill.memorised ? (
                  <View style={{ flexDirection: "row", gap: 12, borderRadius: R.card, backgroundColor: stage.bg, padding: 14 }}>
                    {col(st("you"), d.me.sijill.memorised ? <JuzGrid juz={d.me.sijill.memorised.juz} /> : <Text style={{ color: stage.textMuted }}>–</Text>)}
                    {col(d.them.name, d.them.sijill.memorised ? <JuzGrid juz={d.them.sijill.memorised.juz} /> : <Text style={{ fontFamily: FONT.regular, color: stage.textMuted }}>{st("hidden")}</Text>)}
                  </View>
                ) : null}
                <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 18, color: t.muted }}>{st("privacyLead")}</Text>
              </>
            )}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
