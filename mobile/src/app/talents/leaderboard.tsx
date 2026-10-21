import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack, router, type Href } from "expo-router";
import { FONT, goldButton, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { Chip, OutlineButton, Segmented } from "@/components/brand";
import { useLang } from "@/i18n";
import { sijillApi, type LbRow } from "@/features/sijill/api";
import { useST, type SKey } from "@/features/sijill/text";
import { BadgeSheetHost } from "@/features/talents/badges";
import { AccessGate, ListBox, Muted, SafetyBar, TalentRow, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/leaderboard – opt-in leaderboards: among the people the member follows (XP this week, streak, memorised
// verses) and "most consistent this week" among connections (active days). Only members who switched it on appear.
type Kind = "following" | "consistent";
type Metric = "xp" | "streak" | "memorised";
export default function Leaderboard() {
  const t = useTheme();
  const st = useST();
  const err = useTalentErr();
  const { lang } = useLang();
  const a = useTalentAccess();
  const [kind, setKind] = useState<Kind>("following");
  const [metric, setMetric] = useState<Metric>("xp");
  const [rows, setRows] = useState<LbRow[] | null>(null);
  const [opted, setOpted] = useState(true);
  const [msg, setMsg] = useState("");
  const load = useCallback(async () => {
    setRows(null); setMsg("");
    try { const d = await sijillApi.leaderboard(kind, metric); setRows(d.rows); setOpted(d.optedIn); } catch (e) { setMsg(err(e)); setRows([]); }
  }, [kind, metric]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (a.state === "ok") void load(); }, [a.state, load]);
  const join = async () => { try { await sijillApi.sync({ leaderboard: true }, lang); await load(); } catch (e) { setMsg(err(e)); } };
  const nf = (n: number) => Intl.NumberFormat(lang).format(n);
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back topInset arcade={false} eyebrow={st("sijill")} title={st("leaderboards")} />
          <AccessGate a={a}>
            <View style={{ padding: 16, gap: 14 }}>
              <Segmented<Kind> value={kind} onChange={setKind} options={[["following", st("lbFollowing")], ["consistent", st("lbConsistent")]]} />
              {kind === "following" ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {(["xp", "streak", "memorised"] as Metric[]).map((m) => <Chip key={m} label={st(`metric_${m}` as SKey)} selected={metric === m} onPress={() => setMetric(m)} />)}
                </View>
              ) : <Text style={{ fontFamily: FONT.regular, fontSize: 13.5, color: t.muted }}>{st("lbConsistentLead")}</Text>}
              {!opted ? (
                <View style={{ gap: 8 }}>
                  <Muted>{st("lbNotIn")}</Muted>
                  <OutlineButton title={st("lbJoin")} onPress={() => void join()} />
                </View>
              ) : null}
              {!rows ? <Loading /> : !rows.length ? <Muted>{msg || st("lbEmpty")}</Muted> : (
                <ListBox>
                  {rows.map((r, i) => (
                    <TalentRow key={r.username} c={r} first={i === 0}
                      sub={`${r.rank}. ${kind === "consistent" ? st("weekActive", { n: r.score }) : `${st(`metric_${metric}` as SKey)}: ${nf(r.score)}`}`}
                      right={<Text style={{ fontFamily: FONT.display, fontSize: 18, color: r.me ? goldButton.to : t.ink }}>{nf(r.score)}</Text>} />
                  ))}
                </ListBox>
              )}
              <OutlineButton title={st("privacyBtn")} onPress={() => router.push("/talents/sijill" as Href)} />
              <SafetyBar />
            </View>
          </AccessGate>
        </Page>
      </BadgeSheetHost>
    </>
  );
}
