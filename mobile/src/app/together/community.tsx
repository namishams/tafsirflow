import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { Page, PageHero, Loading } from "@/components/page";
import { FONT, R, useTheme } from "@/lib/theme";
import { useLang } from "@/i18n";
import { countryName } from "@/lib/countries";
import { BadgeSheetHost } from "@/features/talents/badges";
import { SafetyBar } from "@/features/talents/ui";
import { TG, type Community } from "@/features/together/api";
import { demoOn } from "@/features/together/sample";
import { useTg } from "@/features/together/text";
import { BestList, Body, CommunityGoalCard, Section, Tile, ToggleRow, nf, useTgErr, useTogetherAccess } from "@/features/together/ui";
import { AccessGate } from "@/features/talents/ui";

// /together/community – community goals: verses memorised this month worldwide and in the member's country (sums of
// members who chose to count), the next round milestone, the countries of the month and the best learners worldwide
// and per country (only members who chose to appear). Viewing from 13, counting and appearing from 16.
export default function TogetherCommunity() {
  const t = useTheme();
  const tg = useTg();
  const err = useTgErr();
  const { lang } = useLang();
  const a = useTogetherAccess();
  const [d, setD] = useState<Community | null>(null);
  const [msg, setMsg] = useState("");
  const ready = demoOn() || a.state === "ok";
  const load = () => TG.community().then(setD).catch((e) => setMsg(err(e)));
  useEffect(() => { if (ready) void load(); }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (patch: { community?: boolean; bestList?: boolean }) => TG.saveSettings(patch).then(load).catch((e) => setMsg(err(e)));
  const max = Math.max(1, ...(d?.countries ?? []).map((c) => c.verses));
  const body = (
    <View style={{ padding: 16, gap: 22 }}>
      {msg ? <Body muted>{msg}</Body> : null}
      {!d ? <Loading /> : (
        <>
          <CommunityGoalCard data={d} />
          {!d.country ? <Body muted>{tg("noCountry")}</Body> : null}
          <Section title={tg("bestWorld")} icon="trophy">
            <BestList rows={d.best.world} />
          </Section>
          {d.country ? (
            <Section title={tg("bestCountry", { c: countryName(d.country.code, lang) })} icon="starBig">
              <BestList rows={d.best.country} />
            </Section>
          ) : null}
          <Body muted size={13}>{tg("bestNote")}</Body>
          {d.countries.length ? (
            <Section title={tg("topCountries")} icon="globe">
              <Tile>
                {d.countries.map((c) => (
                  <View key={c.country} style={{ gap: 4 }} accessible accessibilityLabel={`${countryName(c.country, lang)}, ${tg("versesN", { n: nf(c.verses, lang) })}`}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <Text style={{ fontFamily: FONT.semibold, fontSize: 14.5, color: t.ink }}>{countryName(c.country, lang)}</Text>
                      <Text style={{ fontFamily: FONT.bold, fontSize: 14, color: t.ink }}>{tg("versesN", { n: nf(c.verses, lang) })}</Text>
                    </View>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: t.line, overflow: "hidden" }}>
                      <View style={{ width: `${(c.verses / max) * 100}%`, height: 6, borderRadius: 3, backgroundColor: t.accent }} />
                    </View>
                  </View>
                ))}
              </Tile>
            </Section>
          ) : null}
          {a.age?.interact || demoOn() ? (
            <View style={{ borderRadius: R.lg, borderWidth: 1, borderColor: t.line, backgroundColor: t.surface, overflow: "hidden" }}>
              <ToggleRow first title={tg("set_community")} hint={tg("setHint_community")} value={d.mine.community} onChange={(v) => void set({ community: v, ...(v ? {} : { bestList: false }) })} />
              <ToggleRow title={tg("set_bestList")} hint={tg("setHint_bestList")} value={d.mine.bestList} disabled={!d.mine.community} onChange={(v) => void set({ bestList: v })} />
            </View>
          ) : null}
          <Body muted size={13}>{tg("niyyah")}</Body>
        </>
      )}
      <SafetyBar />
    </View>
  );
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <BadgeSheetHost>
        <Page>
          <PageHero back topInset eyebrow={tg("eyebrow")} title={tg("community")} lead={tg("communityLead")} />
          {demoOn() ? body : <AccessGate a={a}>{body}</AccessGate>}
        </Page>
      </BadgeSheetHost>
    </>
  );
}
