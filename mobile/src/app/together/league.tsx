import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton } from "@/components/brand";
import { Icon } from "@/components/icons";
import { FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { syncSijill } from "@/features/sijill/summary";
import { BadgeSheetHost } from "@/features/talents/badges";
import { SafetyBar } from "@/features/talents/ui";
import { TG, type League } from "@/features/together/api";
import { demoOn } from "@/features/together/sample";
import { useTg, type TgKey } from "@/features/together/text";
import { Body, LeagueBadge, MemberRow, Tile, TogetherGate, nf, useTgErr, useTogetherAccess } from "@/features/together/ui";

// /together/league – the weekly friend league: this week's XP of the member and the friends who joined, the tier
// (six places of learning), the promotion zone (top third), last week's result. Competing in good deeds, nothing staked.
export default function TogetherLeague() {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const { lang } = useLang();
  const { pro } = usePro();
  const a = useTogetherAccess();
  const [d, setD] = useState<League | null>(null);
  const [msg, setMsg] = useState("");
  const ready = demoOn() || (a.state === "ok" && !!a.age?.interact && !!a.me?.profile);
  const load = async () => {
    if (!demoOn()) await syncSijill(pro).catch(() => false);
    try { setD(await TG.league()); } catch (e) { setMsg(err(e)); }
  };
  useEffect(() => { if (ready) void load(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const rows = d?.rows ?? [];
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back topInset eyebrow={tg("eyebrow")} title={tg("league")} lead={tg("leagueLead")}>
            {d?.enabled && d.tier ? <LeagueBadge tier={d.tier} onStage /> : null}
          </PageHero>
          <TogetherGate a={a}>
            <View style={{ padding: 16, gap: 16 }}>
              {msg ? <Body muted>{msg}</Body> : null}
              {!d ? <Loading /> : !d.enabled ? (
                <Tile>
                  <Body>{tg("leagueOff")}</Body>
                  <GoldButton title={tg("leagueJoin")} onPress={() => void TG.saveSettings({ league: true }).then(load).catch((e) => setMsg(err(e)))} />
                </Tile>
              ) : (
                <>
                  {d.last ? <Tile><Body>{tg(d.last.result === "up" ? "lastUp" : d.last.result === "down" ? "lastDown" : "lastStay")}</Body></Tile> : null}
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.muted }}>{tg("tierN", { n: d.tier ?? 1 })}</Text>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 13.5, color: t.muted }}>{d.daysLeft === 1 ? tg("daysLeftOne") : tg("daysLeft", { n: d.daysLeft ?? 7 })}</Text>
                  </View>
                  {rows.length <= 1 ? <Body muted>{tg("leagueEmpty")}</Body> : null}
                  <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
                    {rows.map((r, i) => (
                      <View key={r.username}>
                        {d.upZone && i === 0 ? (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: t.accentSoft }}>
                            <Icon name="trophy" color={t.accent} size={13} />
                            <Text style={{ fontFamily: FONT.semibold, fontSize: 12, color: t.accent }}>{tg("promoZone")}</Text>
                          </View>
                        ) : null}
                        {d.upZone && i === d.upZone ? <View style={{ height: 2, backgroundColor: t.accentSoft }} /> : null}
                        <MemberRow c={r.me ? { ...r, name: `${r.name} (${tg("you")})` } : r} first={i === 0} highlight={r.me}
                          sub={`${tg(`tier_${r.tier}` as TgKey)} · ${tg("weekShort", { x: nf(r.xp, lang), d: r.active })}`}
                          right={<Text style={{ fontFamily: FONT.display, fontSize: 18, color: d.upZone && i < d.upZone ? t.gold : t.muted, minWidth: 24, textAlign: "right" }}>{nf(r.rank, lang)}</Text>} />
                      </View>
                    ))}
                  </View>
                  <Body muted size={13}>{tg("niyyah")}</Body>
                </>
              )}
              <SafetyBar />
            </View>
          </TogetherGate>
        </Page>
      </BadgeSheetHost>
    </>
  );
}
