import { useCallback, useState } from "react";
import { Switch, Text, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { FONT, useTheme } from "@/lib/theme";
import { Page, PageHero, Loading } from "@/components/page";
import { GoldButton, OutlineButton } from "@/components/brand";
import { useLang } from "@/i18n";
import { usePro } from "@/lib/pro";
import { SECTIONS, sijillApi, type Privacy, type Section, type Sijill } from "@/features/sijill/api";
import { syncSijill } from "@/features/sijill/summary";
import { SijillShowcase } from "@/features/sijill/Showcase";
import { useST, type SKey } from "@/features/sijill/text";
import { AccessGate, Muted, SafetyBar, useTalentAccess, useTalentErr } from "@/features/talents/ui";

// /talents/sijill – the member's own academic record: update it from this device, choose per section what others see
// (everything starts hidden), take part in leaderboards (opt-in), preview the record as it is stored.
export default function MySijill() {
  const t = useTheme();
  const st = useST();
  const err = useTalentErr();
  const { lang } = useLang();
  const { pro } = usePro();
  const a = useTalentAccess();
  const [s, setS] = useState<Sijill | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const name = a.me?.profile?.name ?? "";
  const username = a.me?.profile?.username ?? "";

  const load = useCallback(async () => {
    try { await syncSijill(pro); setS((await sijillApi.mine(lang)).sijill); } catch (e) { setMsg(err(e)); }
  }, [pro, lang]); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { if (a.state === "ok" && a.me?.profile) void load(); }, [a.state, a.me?.profile, load]));

  const save = async (body: { privacy?: Partial<Privacy>; leaderboard?: boolean }) => {
    if (!s) return;
    const before = s;
    setS({ ...s, privacy: { ...(s.privacy as Privacy), ...(body.privacy ?? {}) }, leaderboard: body.leaderboard ?? s.leaderboard });
    setMsg("");
    try { setS((await sijillApi.sync(body, lang)).sijill); } catch (e) { setS(before); setMsg(err(e)); }
  };
  const all = (on: boolean) => save({ privacy: Object.fromEntries(SECTIONS.map((k) => [k, on && k !== "certificates" ? true : on && k === "certificates" ? !!s?.privacy?.certificates : false])) as Partial<Privacy> });
  const syncNow = async () => {
    setBusy(true); setMsg("");
    try { await syncSijill(pro, true); setS((await sijillApi.mine(lang)).sijill); setMsg(st("synced")); } catch (e) { setMsg(err(e)); } finally { setBusy(false); }
  };

  const row = (k: Section) => (
    <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48, paddingVertical: 4, borderTopWidth: 1, borderTopColor: t.line }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: FONT.semibold, fontSize: 15, color: t.ink }}>{st(`sec_${k}` as SKey)}</Text>
        {k === "certificates" ? <Text style={{ fontFamily: FONT.regular, fontSize: 12.5, lineHeight: 17, color: t.muted }}>{st("certNote")}</Text> : null}
      </View>
      <Switch value={!!s?.privacy?.[k]} onValueChange={(v) => void save({ privacy: { [k]: v } })} trackColor={{ true: t.accent }} accessibilityLabel={st(`sec_${k}` as SKey)} />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Page>
        <PageHero back arcade={false} eyebrow={st("sijill")} title={st("title")} lead={st("leadMine")} />
        <AccessGate a={a}>
          <View style={{ padding: 16, gap: 18 }}>
            {!a.me?.profile ? <Muted>{msg || "…"}</Muted> : !s ? (msg ? <Muted>{msg}</Muted> : <Loading />) : (
              <>
                <GoldButton title={st("syncNow")} onPress={() => void syncNow()} busy={busy} disabled={busy} />
                {msg ? <Text accessibilityLiveRegion="polite" style={{ fontFamily: FONT.semibold, fontSize: 14, color: t.muted }}>{msg}</Text> : null}
                <View style={{ gap: 6 }}>
                  <Text accessibilityRole="header" style={{ fontFamily: FONT.bold, fontSize: 17, color: t.ink }}>{st("privacyTitle")}</Text>
                  <Text style={{ fontFamily: FONT.regular, fontSize: 14, lineHeight: 20, color: t.muted }}>{st("privacyLead")}</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                    <View style={{ flex: 1 }}><OutlineButton compact title={st("showAll")} onPress={() => void all(true)} /></View>
                    <View style={{ flex: 1 }}><OutlineButton compact title={st("hideAll")} onPress={() => void all(false)} /></View>
                  </View>
                </View>
                <View>{SECTIONS.map(row)}</View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.semibold, fontSize: 15.5, color: t.ink }}>{st("leaderboardOptIn")}</Text>
                    <Text style={{ fontFamily: FONT.regular, fontSize: 13, lineHeight: 18, color: t.muted }}>{st("leaderboardHint")}</Text>
                  </View>
                  <Switch value={!!s.leaderboard} onValueChange={(v) => void save({ leaderboard: v })} trackColor={{ true: t.accent }} accessibilityLabel={st("leaderboardOptIn")} />
                </View>
                <SijillShowcase s={s} mine name={name} username={username} />
              </>
            )}
            <SafetyBar />
          </View>
        </AccessGate>
      </Page>
    </>
  );
}
